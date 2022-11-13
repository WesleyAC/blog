---
layout: post
title: "Storage Space PSA for Mastodon Admins"
description: ""
---

Do you administer a Mastodon instance? Is it falling over all the time now because it's running out of disk space because everyone is joining the network? Here is a quick PSA: `tootctl media remove` **does not remove all the remote media**. It removes all remote media more than 7 days old. It used to be that, on the server that I run, <a href="https://recurse.social">recurse.social</a>, that would leave a handful of GB of media. Now it's more like 25GB of media. If you don't want to have to resize your server to deal with the peak of the influx of new users, consider changing your cronjob to something like `tootctl media remove --days=1`, to more aggressively delete remote media that's unlikely to be needed.
