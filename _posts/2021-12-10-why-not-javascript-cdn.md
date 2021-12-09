---
layout: post
title: "Reasons to avoid Javascript CDNs"
description: ""
---

Many javascript projects have install instructions recommending that people use a CDN like [jsdelivr](https://www.jsdelivr.com/) or [unpkg](https://unpkg.com/) to include the code on their website. This has the advantage that it's quicker to get started with, and it's often claimed to load faster. However, it also has downsides when it comes to privacy, security, and systemic risk, and it may actually be slower in some common cases. Here are some reasons not to use a javsacript CDN, and some alternatives to consider instead.

## Systemic Risk

The big javascript CDNs are used by huge numbers of people — [cdnjs brags that it's on 12.5% of websites on the internet, and serves more that 200 billion requests per month](https://cdnjs.com/about), [jsdelivr serves nearly 100 billion requests per month](https://www.jsdelivr.com/blog/jsdelivr-keeps-growing-and-expanding/), and [unpkg serves ~2.4 billion unique IP addresses per month](https://twitter.com/mjackson/status/1296147192411955200). This means that one of these CDNs going down, or an attacker hacking one of them would have a huge impact all over society — we already see this category of problem with large swaths of the internet going down every time [cloudflare](https://techcrunch.com/2020/07/17/cloudflare-dns-goes-down-taking-a-large-piece-of-the-internet-with-it/) or [AWS](https://www.theverge.com/2021/12/7/22822332/amazon-server-aws-down-disney-plus-ring-outage) has an outage.

There's a [fundamental tradeoff](https://notebook.wesleyac.com/efficiency-resiliency/#288jCJ_U1E:1W:2k) here between efficiency and resiliency, and when 12.5% of the internet can have an outage because of one provider going down, I think we've swung way too far away from resiliency, as a society.

## Privacy

The most major concern that stems from this centralization is that of privacy — in the normal case, the only people who know when you visit a website are the people running that website, and the operators of the internet infrastructure between your computer and the server (which is *also* shockingly centralized, but that's a story for another day). When a website includes a javascript file with a CDN, that CDN is then able to tell that you've visited that website. Most people realize that companies like Google keep a profile of nearly everywhere you go on the web, but normal people haven't even heard of Cloudflare, and despite that, they have a similarly complete picture of where you go on the internet. They [pinky promise](https://www.cloudflare.com/privacypolicy/) that they won't sell logs (privacy policy subject to unilateral change by them at any point, of course), and you just have to hope that they won't get hacked.

*(If you want to avoid getting tracked this way, [Decentraleyes](https://decentraleyes.org/) is a useful browser extension)*

## Speed

One of the significant benefits touted by CDNs is speed, but this doesn't make as much sense as it once did.

First off, modern browsers [don't cache requests to CDNs across multiple domains](https://www.stefanjudis.com/notes/say-goodbye-to-resource-caching-across-sites-and-domains/), since that can be used to track users — this means that even if someone has already downloaded the library you're including from the CDN on one website, they'll have to download it again when they visit your website. Note that this re-downloading doesn't actually protect against any of the privacy concerns mentioned above (and in fact makes them much worse), it's *only* to stop random websites from being able to tell what other websites you've visited via cache timing attacks.

Secondly, if you're using HTTP/2 or HTTP/3 and including javascript files that aren't huge, it's likely going to be faster to download the javascript file from the same place the website is hosted due to [multiplexing](https://http2.github.io/faq/#why-is-http2-multiplexed) — particularly, DNS resolution and TLS setup often dominate the time taken to load the first connection to a new domain. Hosting the javascript files on the same server as the HTML allows you to avoid all of that, and thus will typically actually be faster for small files, since a single connection can be used. You can test this yourself pretty easily — look at the "DNS Resolution", "Connecting", and "TLS Setup" sections in the "Network" tab of the browser devtools — this is often more than half of the time for the first request! This is also something that is likely to be worse on slower connections than on faster ones.

## Security

Beyond just privacy, it's reasonable to be concerned that an attacker might be able to compromise end-users by hacking a CDN. Luckily, there is a way to protect against this — modern web browsers have a feature called [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity), which allows you to specify a hash of the expected contents of a script tag (if you're using libraries via a CDN, you should be doing this! It's pretty simple, and has nothing but upside in terms of security).

Unfortunately, this doesn't yet work in all cases — if a library is split into multiple files (to reduce initial load time/size), browsers currently only allow the main file to have a SRI hash specified. I'm [hopeful](https://github.com/WICG/import-maps/issues/221#issuecomment-988337894) that this can be fixed in the future, but it's not there yet. (To be clear, using SRI on the initial bundle still provides a meaningful increase in security — the fact that it doesn't work in some, frankly somewhat niche cases isn't a reason not to use it in general!)

## What to do instead

The takeaway here is that if you're using a CDN for any reason other than laziness, it's likely not a good reason.

What I do is just download the library that I want and include the files in my repo, just like any other source file. I usually do this in a directory called `vendored` or `3p`, and be sure to include the version number of the package that I downloaded in the filename. This takes maybe 60 seconds more work than including the CDN version, which seems worth it to me for the privacy, robustness, and speed benefits.

If you are going to use a CDN, at the very least, include a SRI hash — they're super easy to generate with [this tool](https://www.srihash.org/). And if you're a library author who writes install instructions recommending the use of a CDN, *definitly* include a SRI hash — that way people don't need to know to do it themselves, they can just copy and paste it.
