---
layout: post
title: "Subdomains as identity"
description: ""
---

A common identity scheme for websites is to give users pages like `example.com/username`. Twitter, Instagram, Twitch, Pinterest, and many other websites use this model. Reddit, TikTok, Mastodon, Lobsters, and several others use a slightly more conservative version of this, with a prefix (either `@` or `u/`) before the username.

I think that in many cases, this is a mistake, and using subdomains, like `username.example.com` is better. Particularly, I think that the subdomain-based model is best for websites where there is minimal interaction between users (blogging, publishing, etc), or where that interaction happens via an open protocol.

Using subdomains for identity offers a few advantages:

* It makes it easier for users to own their own identities, since you can very easily support using custom domains
* It makes it easy to securely allow users full control over the CSS/HTML on their page, without worrying about XSS
* It lets you cleanly have information about your website on the top-level domain, without adding the noise of a `u/` or `@` prefix to usernames

This would be most advantageous for systems like Mastodon — one of the most fundamental mistakes that mastodon made was tying your identity to whoever happens to sysadmin the server you use, and using domains as identity would have almost entirely solved that[^mastodon]. However, I think that there are notable advantages even for less explicitly federated systems as well.

I personally think that these advantages are quite significant, and software that gives users control over their identity and expression is inherently worth building, but this blog post isn't about that. I figure if you're making this decision, you're capable of thinking through the tradeoffs yourself. This blog post is about concretely, how to implement a system that uses subdomains as identity, and how to extend that system to allow arbitrary custom domains. This is what I do for [thoughts.page](https://thoughts.page), which has been running successfully like this for a year now.

The first question is how to integrate subdomain information into whatever routing system you use. thoughts.page uses [warp](https://github.com/seanmonstar/warp), which has out-of-the-box support for routing based on domain name, but you might not be so lucky in your framework of choice — searching "[framework] wildcard subdomain routing" should point you to relevant documentation. If you don't find a easy way to do this, a common alternative is to rewrite URLs internally, so that `username.example.com/foo` gets rewritten to `example.com/user/username/foo` before it's handed to your routing library. If your framework doesn't provide a way to do it, nginx can do the same thing with a `rewrite` command. However, I'd recommend doing it in your app if possible, since that will make development significantly easier.

Speaking of development, you won't be able to just use `localhost` to see your server anymore, since it will require subdomains for routing. Some systems will allow URLs like `username.whatever.localhost` to work, but if not, you can use `lvh.me` or `vcap.me`, which both return `127.0.0.1` for all requests.

When you deploy your app, you'll need to get a wildcard HTTPS certificate, instead of one that's restricted to a particular subdomain. If you use Let's Encrypt, this makes the process [slightly more complicated](https://letsencrypt.org/docs/faq/#does-let-s-encrypt-issue-wildcard-certificates), but there are [good instructions online](https://www.digitalocean.com/community/tutorials/how-to-create-let-s-encrypt-wildcard-certificates-with-certbot) for doing so.

That's all you need to use subdomains for identity. If you want to go the whole hog and allow users to use custom domains, though, you need to do a little bit more. The main problem here is HTTPS: you need to have a certificate for whatever domain they choose to use, and your web server needs to be able to dynamically pick which HTTPS cert to use based on the domain name. Nginx added support for this in 1.15.9, which is relatively recent — it's in the most recent Debian version as of this writing (bullseye), but not in the previous version (buster). You can set this up by using the `$ssl_server_name` variable in your `ssl_certificate` and `ssl_certificate_key` variables, like so (assuming the default certbot setup):

```
ssl_certificate /etc/letsencrypt/live/$ssl_server_name/fullchain.pem; 
ssl_certificate_key /etc/letsencrypt/live/$ssl_server_name/privkey.pem;
```

That's not enough, though, since you also need to actually get the keys. I do this by having a small script[^sqlite] that reads the database to look for users with custom domains, and attempts to renew their certificates:

```bash
#!/usr/bin/env bash

cd $(dirname "$0")

certbot certonly --noninteractive --keep-until-expiring --dns-digitalocean --dns-digitalocean-credentials /root/digitalocean-secret.ini -d thoughts.page -d '*.thoughts.page'

sqlite3 thoughts.sqlite3 "SELECT domain FROM domains" | grep -v ".thoughts.page$" | while read DOMAIN
do
	certbot certonly --noninteractive --keep-until-expiring --webroot --webroot-path /var/cert-webroot/ --domain "$DOMAIN"
done

# Needed because nginx SNI doesn't run as root
chmod -R 755 /etc/letsencrypt/live/
chmod -R 755 /etc/letsencrypt/archive/

# Nginx needs a reload to pick up new certs
systemctl reload nginx
```

This is run every five minutes by a cron job. I could have the user adding a new custom domain trigger this, but so far, I haven't felt the need to do that.

The `/var/cert-webroot/` directory referenced in that script is served by nginx, using the following snippet:

```
location /.well-known/acme-challenge/ {
	root /var/cert-webroot/;
}
```

This allows the app server to keep on running while the certs are being renewed, free of any interference from certbot.

This relatively simple change makes it easy for people to own their own identities if that's important to them, without imposing any sort of burden on less technically-inclined users to think about it. It also creates a softer gradient towards self-hosting, allowing people who are comfortable setting up a DNS record but not administering a server to own their own identities. Next time you're making a website with users, I hope you'll consider using subdomains as identity.

[^mastodon]: I say "almost entirely", since there should still ideally be some way for clients to have cryptographic proof of their identity, which they can use to delegate the ability to manage their account to a particular server. Implementing this well is quite complex, but I think doable and important, as well. If you're working on this kind of thing and want to chat about it, please do drop me a line :)
[^sqlite]: One of the [many advantages](/posts/consider-sqlite) to using SQLite is that it makes writing small scripts like this really easy
