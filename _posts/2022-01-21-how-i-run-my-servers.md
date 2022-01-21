---
layout: post
title: "How I run my servers"
description: ""
---

I've been writing recently about servers and internet infrastructure[^1]. A lot of this writing is predicated on running server software on a VM or physical machine, rather than using a more cloudy solution, which is somewhat unpopular these days. However, I think it's a pretty reasonable way to do things, and it's not as difficult as many people make it out to be. This post is a simple description of how I run most of the servers I operate. It mostly describes running server software that I've written myself, since that allows me to make it much more robust and easy to deploy than the vast majority of off-the-shelf software is.

This describes roughly the setup for [thoughts.page](https://thoughts.page), [hanabi.site](https://hanabi.site), [cgmserver](https://github.com/WesleyAC/cgmserver), [phonebridge](https://github.com/WesleyAC/phonebridge), and a few other services.

These apps run on DigitalOcean VMs — the $5/month tier. (Some of them are on the same VM, some on different VMs — more on that later). The VMs run Debian 10.

The server software is written in Rust. It's statically linked, and all of the html, css, config, secrets, etc are compiled into the binary. I accomplish this with [rust-musl-builder](https://github.com/emk/rust-musl-builder) and [rust-embed](https://github.com/pyros2097/rust-embed). This means that deployment only requires copying a single file to the server. You can do similar things in languages like Go, C++, etc, and probably others, although I don't know the details of how exactly to accomplish it in those languages. If you're using a language that doesn't let you do this easily, a good alternative would be building a Docker container as your build artifact, which similarly will give you a single file to deploy.

I use systemd to ensure that the binary starts when the server is started. Most of my systemd unit files are [9 lines long and extremely simple](https://gist.github.com/WesleyAC/b3aaa0292579158ad566c140415c875d#file-example-service). systemd itself is quite complicated, but just starting a server on boot does not expose you to most of that complexity.

I use a [simple deploy script](/posts/simple-deploy-script) that copies the binary to the server and restarts the server, taking a little bit of care to allow rollbacks and ensure that there will always be a valid version running, even if my connection drops while I'm deploying.

Programs that require a database use [SQLite](/posts/consider-sqlite), which means that the entire state of the app is kept in a single file. I have two redundant backup solutions: On a daily basis, a backup is taken via the [SQLite `.backup` command](https://sqlite.org/cli.html), and saved to [Tarsnap](https://www.tarsnap.com/). The script to do so is run via [cron](https://en.wikipedia.org/wiki/Cron). I also use [Litestream](https://litestream.io/) to stream a copy of the database to DigitalOcean Spaces storage on a secondly basis, with snapshots taken every 6 hours. This gives me quite a lot of confidence that even in the most disastrous of cases, I'm unlikely to lose a significant amount of data, and if I wanted to be more sure, I could crank up the frequency of the Tarsnap backups.

All of my servers run behind [nginx](https://nginx.org/) running as a reverse proxy. The main advantage to this is that nginx can do TLS termination, which means my apps don't need to think about HTTPS at all. I get my HTTPS certs from [Let's Encrypt](https://letsencrypt.org/) via [certbot](https://certbot.eff.org/) — this handles automatic renewal so I don't have to do anything to keep it working. [Here's](https://gist.github.com/WesleyAC/a9b4d6079854a6617f9fe6be96beddfa) what my nginx config for [hanabi.site](https://hanabi.site) looks like. Nginx also works great for serving static files — you can just `scp` or `rsync` them from your computer to the server.

This is a simple and extremely robust setup. All of the software on the serving path (except for the apps themselves) has been around for decades and is extremely battle-tested. There is essentially no maintenance involved in keeping a site like this running — as long as I keep paying my DigitalOcean bills, they'll keep going. The only times my monitoring has detected problems with these sites have been transient DigitalOcean networking issues. I do need to update things occasionally — Debian releases have 5 years of support, so I'll need to upgrade to Debian 11 in around two and a half years, and if (when) something like [heartbleed](https://en.wikipedia.org/wiki/Heartbleed) happens again, I'll need to go patch it. However, events like that are quite rare.

One complaint about this setup is that paying $5/month for every service you want to run is a lot. This is indeed annoying, but it's quite doable to run multiple services on the same VM. In order to provide isolation, I run each service as its own unix user account. This form of isolation has been around since the dawn of unix, and thus seems quite robust. If you want more isolation, you can also use [systemd-nspawn](https://www.freedesktop.org/software/systemd/man/systemd-nspawn.html) or [firejail](https://firejail.wordpress.com/). I usually don't bother, though — if something is really important to keep secure, I'll just pay the extra $5/month to run it on its own VM.

So, the process for setting up a new project looks like:

* Create a new user
* Add a new nginx virtual host (and run certbot to get a HTTPS cert)
* Add a systemd unit
* Commit a [deploy script](/posts/simple-deploy-script) to the repository and run it

This can be a lot to figure out if you haven't done it before! However, one of the advantages to running things this way is that this infrastructure changes much, much more slowly than cloud infrastructure does. You only need to learn how to set up nginx once, since the config format has stayed essentially the same for the past decade[^2], and is likely to remain the same in the future. The last major change to Debian system administration was the switch to systemd, nearly a decade ago. One of the comforts of running things this way is that you know that no one is going to pull the rug out from under you — no cloud provider is going to deprecate the service you're using, or silently change how it works. The only dependency is your VPS provider, and if you're unhappy with them — well, servers are a commodity, and there are a thousand other providers out there.

**Thanks to Julia Evans for prodding me to finally write this, and for early feedback.**

[^1]: See: [Consider SQLite](/posts/consider-sqlite), [There is no such thing as a static website](/posts/no-static-websites), [Servers and Desire](https://notebook.wesleyac.com/servers-and-desire/).
[^2]: Seriously — try [diffing `nginx-0.5.38/conf/nginx.conf` and `nginx-1.21.5/conf/nginx.conf`](https://gist.github.com/WesleyAC/fedf41c6e257acf4f3bc67f144204c52), from more than 12 years apart — there are a couple changes to how SSL is configured, some changes to the directory structure, and the logline format, and that's basically it.
