---
layout: post
title: "How many users block google analytics?"
description: "Comparing Google Analytics with server logs"
tags: [meta]
---

I've been running Google Analytics on my blog for around a year now, and every time I look at the data it provides, I trust it less and less. Frequently, the statistics it provides are misleading, if not flat-out wrong[^1]. And in addition to that, many people block google analytics, so I don't actually know how many views I'm getting.

A few days ago, I decided to compare my google analytics dashboard with my server logs[^2] to see how many people actually block google analytics. Here's what I found:

Out of 1,253 users in my sample, 565 blocked google analytics (≈45%). The breakdown by browser was as follows:

<center>

| Browser | % Blocking  |
| ------- | --- |
|Chrome   | 37% |
|Firefox  | 70% |
|Safari   | 39% |

</center>

There were a few other browsers in the sample, but there wasn't enough data about them to be meaningful (There were <10 users of every other browser in my sample). I was expecting Firefox to be the largest, but it was a bit surprising to me that Safari and Chrome were approximately equal - I would have expected Chrome to be higher.

By operating system, it broke down as follows:

<center>

| Operating System | % Blocking |
| ---------------- | ---------- |
| Mac              | 48% |
| Windows          | 49% |
| Android          | 0% |
| iOS              | 17% |
| Linux (non-Android) | 67% |
| ChromeOS         | 53% |

</center>

There was also one BSD user in the sample, who blocked google analytics.

I think the only really surprising thing about this is how high the percentage on ChromeOS is - I would have expected it to be much lower. This also shows how bad the adblocking situation is on mobile right now - I'd imagine most users who block GA/ads on desktop would also want to on mobile, but can't just because it's so difficult to set up an adblocker on mobile.

It's worth noting that my blog is absolutely not average, since I attract a much more technical audience, but the numbers should be roughly transferable to other programming blogs.

[^1]: I could do a whole blog post about this, but just to start off with, the pageview time and user flow graphs have so many problems as to be basically useless.

[^2]: I host this on GH pages, so I actually embedded a 1x1 pixel image being served from a different domain (with the http headers set not to cache), but it's very close to the same effect.
