---
layout: post
title: "There is no such thing as a static website"
description: ""
---

A common distinction in technology for building websites is a separation between "static" and "dynamic" websites. The idea is that a "static" website always returns the same HTML/CSS/etc, whereas a "dynamic" website changes the content that the server returns depending on the request.

This seems, at first glance, to be a pretty sharp and useful distinction, letting us easily distinguish between static and dynamic. However, I don't think it holds up to real scrutiny, and I believe that this distinction is holding us back from building better types of software that exist in the blurry space between static and dynamic.

First off, we should look at why people care about this distinction in the first place. When looking at any sort of taxonomy, a good first question to ask is "who is this useful to, and why?"

In this case, the answer is pretty simple — static websites are seen as easy to deploy, essentially not requiring any maintenance once they are deployed. People have the impression that if they install Wordpress, it's likely to need ongoing maintenance, whereas if they use Jekyll or Hugo or another static site generator, it won't. This impression doesn't exist without reason (Wordpress certainly has a tendency to break more frequently than nginx), but it's not completely correct — static websites *do* require maintenance[^1], it's just maintenance that's very easy to outsource these days — GitHub Pages, S3/CloudFront, and many other providers will take your static files, and maintain a web server to serve them either for a extremely small fee, or for free as a loss leader for their other services.

When people say that static websites are "easy to deploy," this is often what they mean — static websites are *easy to pay other people to maintain*. You can, of course, pay someone to maintain a Wordpress install for you, but it's more expensive than a static site, and if you want software that's any more niche than that, you're likely going to end up stuck maintaining it yourself.

A normal static web server that operates over HTTPS already has to keep track of some dynamic state — the HTTPS certificate! There's also dynamism in negotiating content encoding and protocols with the client, using [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication), etc — we just don't think of it as "dynamic," because off-the-shelf HTTP servers are robust enough that they're very easy to run without thinking too much about them.

So, when we look at where the distinction between static and dynamic came from, it's pretty clear that one of the main reasons it's drawn where it is comes from looking at the operational complexity of running the different types of sites, and the actual technical line we draw — returning the same HTML/CSS/etc == static, returning different content depending on the request == dynamic — is essentially arbitrary. There's computation and state involved in things on both sides of that line, the only difference is how much!

Another reason we drew the line between "static" and "dynamic" at the HTTP server layer is because working isolation primitives largely had not been invented or popularized when these terms were coming into being. This meant that it was very easy to provide a service that served static files without needing to trust the people giving you the files, but providing a service that allowed untrusted users to host content that did dynamic computation was extremely difficult to do securely. You could get a shared hosting account that gave you a CGI server with a handful of programming languages, but probably anyone else on the shared box could DoS you if they wanted to, and bugs that allowed people to get local root were common.

So we have two main reasons that we've ended up defining the static/dynamic divide at the layer we did:

* HTTP server software is very robust and easy to maintain, whereas application servers tend to break more frequently.
* Working isolation primitives didn't exist at the time when the static/dynamic divide was created.

The world has changed since the static/dynamic divide was created. There have now been a significant number of attempts to "platformitize" dynamic computation — "serverless" programming like AWS Lambda, WASM runtimes like those provided by CloudFlare and Fastly, full container deployment via Fly.io and cloud providers. None of these have an API nearly as stable as the filesystem API used to host static files, but it's a matter of time before APIs end up well-established. Containers already have a pretty solid definition, and the folks working on WASM/WASI are explicitly working towards building stable APIs for these sorts of usecases.

That leaves us with one remaining reason for the current static/dynamic divide: HTTP servers don't require much maintenance, while application servers often do. This is still largely true, but there's absolutely no reason that it has to be. I run around half a dozen different application servers — some written by me, some written by other people — and it's very possible to write application servers that require very little maintenance. One of the reasons that I advocate for [SQLite on the server](/post/consider-sqlite) is that I've noticed that servers written on SQLite generally require less maintenance than those written on Postgres. I've also found that servers written in ways that [can be deployed as static binaries](/posts/simple-deploy-script) tend to require less maintenance than those with more complicated deployment setups. I have around five server-years of experience running this style of software (static binaries using SQLite deployed behind nginx), and have had zero problems requiring any intervention from me in order to be fixed.

There are a few takeaways here:

* If you build infrastructure: Working isolation primitives have existed for decades. We should be making it as easy to deploy dynamic applications as it is to deploy static websites. There's no reason infrastructure for deploying dynamic applications can't be as simple, robust, and portable as HTTP servers are today.
* If you build websites: Dynamic websites don't have to be hellish to maintain and upgrade! If it's significantly harder to maintain and deploy your website than a static website, it's likely because some part of your tech stack is not serving you well. You can likely figure out what that is, and replace it with something simpler, better, and easier to maintain.
* In general: When software is stable and simple, it fades into the background and becomes infrastructure. You can choose to build software that is stable and simple. Working with stable, simple, "infrastructure" software is more pleasant than working with brittle, rapidly-changing, bespoke software, so building systems that consist mostly of stable, simple infrastructure is an investment in your happiness.

I have high hopes for a future of robust, easy to deploy and maintain webapps, where the static/dynamic divide is no longer relevant, because people realize that application servers can be just as robust as HTTP servers, if only we're willing to put in the work.

*Thanks to Miccah Castorina, Aditya Athalye, Julia Evans, and Akiva Leffert for comments/feedback on this post.*

[^1]: Replacing server hardware when it fails, keeping the operating system and http server up to date, renewing HTTPS certs, etc.
