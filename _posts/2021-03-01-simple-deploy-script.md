---
layout: post
title: "A simple but safe deploy script"
description: ""
---

I write a lot of small web servers as statically linked, single-file rust files, usually using [rust-musl-builder](https://github.com/emk/rust-musl-builder) to generate the binary, and [rust-embed](https://github.com/pyros2097/rust-embed/) to include the static files as part of the binary. This makes deploying really easy, but it still takes some care to get it really nice. What I want is a system where:

* I can run a single command to build and deploy my program
* There will be minimal downtime
* The server will always be running a valid version, even if my connection drops while the deploy script is running
* Rollbacks are easy and fast

It turns out it's pretty simple to write this! I'm going to walk through it line-by-line, but you can see the entire script [here](https://gist.github.com/WesleyAC/b3aaa0292579158ad566c140415c875d), if you prefer to see it all at once.

We have a `deploy.sh` script, which will build and deploy our server:

```bash
#!/usr/bin/env bash

set -e
cd $(dirname $0)

if [ "$#" -ne 2 ]; then
	echo "usage: $0 user@server-address /path/to/remote/directory/"
	exit 1
fi
```

We start with a `#!/usr/bin/env bash` to tell it to run in bash[^1], `set -e` so it will quit if there are any errors, `cd $(dirname $0)` to make sure we're running in the directory we expect to be, and then finally an `if` statement to check that the script is being called correctly. Once we've gotten that housekeeping out of the way, we carry on and set some variables that we'll use later:

```bash
SERVER_SSH=$1
SERVER_PATH=$2
BINARY_NAME="example"
SERVER_RESTART_COMMAND="systemctl restart $BINARY_NAME"
```

Once we've set those, we go ahead and call our build script:

```bash
./build.sh
```

Now that we have the binary, we need to figure out how to deploy it. We don't want to overwrite the existing binaries on the server, because then we won't be able to roll back properly, so we generate a unique name for this binary:

```bash
OUTFILE="./target/x86_64-unknown-linux-musl/release/$BINARY_NAME"
COMMIT_HASH=$(git rev-parse HEAD)
BUILD_TIMESTAMP=$(TZ=UTC date -u +"%s")
FILE_HASH=$(b2sum $OUTFILE | cut -f1 -d' ')
REMOTE_FILENAME="$BINARY_NAME-$BUILD_TIMESTAMP-$COMMIT_HASH-$FILE_HASH"
```

This takes the current date in UTC, the commit hash, and a hash of the file, and appends them all to the name of the binary. This is a bit overkill, but it's nice to have all of that info readily available, so we can see what version is running and when it was deployed just from the filename. Now that we have our file, we can use `scp` to transfer it over to the server:

```bash
ssh $SERVER_SSH "mkdir -p $SERVER_PATH/versions/"
scp "$OUTFILE" "$SERVER_SSH:$SERVER_PATH/versions/$REMOTE_FILENAME"
```

At this point, everything we've done has been safe from the perspective of our network dropping out — if anything fails in this process, all we've done is transfered part of a file to the server, but that won't do anything bad. When we switch to the new version of the binary, though, we need to be a bit more careful. The most important part of the system that I use is that we never execute a binary directly, we always execute a [soft link](https://en.wikipedia.org/wiki/Symbolic_link) to the binary. This means that when we remove the link, the existing server will keep running, since the actual binary that got executed is still the same. Here's how we go about that:

```bash
ssh -q -T $SERVER_SSH <<EOL
	nohup sh -c "\
	rm "$SERVER_PATH/$BINARY_NAME" && \
	ln -s "$SERVER_PATH/versions/$REMOTE_FILENAME" "$SERVER_PATH/$BINARY_NAME" && \
	$SERVER_RESTART_COMMAND"
EOL
```

This runs a command on the server using `nohup`, which will ensure the command keeps running even if we disconnect. We use `sh -c` so that all of the commands are being run in the same `nohup` session. Then we remove the existing link, make a link to our new version, and restart the server. The only downtime we'll have is the time it takes for the server to start up, which is negligible for my rust binary. This will also kill existing sessions, but most of the applications I write are written in a way that is fairly robust to server restarts.

I ensured that this command actually does what I think it does by adding a `sleep 60` between the `rm` and `ln` commands, and killing the deploy script during that sleep, and sure enough, 60 seconds later, the server was up.

The last bits you need to implement this are the systemd unit file:

```
[Unit]
Description=Example server
After=network.target

[Service]
ExecStart=/home/example/example
User=example
Group=example

[Install]
WantedBy=multi-user.target
```

and the build script:

```bash
#!/usr/bin/env bash

cd $(dirname $0)

docker run --rm -it -v "$(pwd)":/home/rust/src -v cargo-git:/home/rust/.cargo/git -v cargo-registry:/home/rust/.cargo/registry -v "$(pwd)/target/":/home/rust/src/target ekidd/rust-musl-builder:nightly-2021-01-01 sudo chown -R rust:rust /home/rust/.cargo/git /home/rust/.cargo/registry /home/rust/src/target

docker run --rm -it -v "$(pwd)":/home/rust/src -v cargo-git:/home/rust/.cargo/git -v cargo-registry:/home/rust/.cargo/registry -v "$(pwd)/target/":/home/rust/src/target ekidd/rust-musl-builder:nightly-2021-01-01 cargo build --release
```

Although you can absolutely use this technique with any language/build system and init system, with only a little tweaking.

Doing a rollback is pretty simple — right now, I just ssh onto the server `rm` the old link, and `ln` the new version I want, but it would be easy to automate that. If I wanted to do that, I'd probably have the deploy script write to a file every time it deployed a new version with the new filename, so that I could quickly roll back to the version N versions ago, or whatever[^2]. It's a little harder to scale this approach to do things like run multiple versions of the server at once to have a load balancer cut over connections slowly, without interrupting users, but for a lot of things you don't need to be that fancy, and this ~30 line script is more than enough.

I personally find that this approach hits the sweet spot of simple, understandable, and robust for a lot of my projects, and I hope you find it useful as well!

[^1]: Note that this is the most portable way to do this: some systems (most notably NixOS) don't have `/bin/bash` or `/usr/bin/bash`, but do have bash installed
[^2]: You might think you can just `sort` the `versions/` directory to get this, but that doesn't actually work: if scp quits unexpectedly, there may be executables that don't even work in the `versions/` directory. We need to know which versions we actually got as far as making the link and starting up.
