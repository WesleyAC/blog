---
layout: post
title: "SNES Development Part 4: NMIs and vblank"
description: ""
---

*This is part four of my series on SNES development. You may want to start with the [first post](/posts/snes-dev-1-getting-started).*

[Last time](/posts/snes-dev-3-input), we started reading controller inputs! However, we weren't able to get a tile to move around on the screen in response to the controller, because our code was running too fast. In this part, we'll look at how to slow down our main code so that it runs once per frame. We'll do this by modifying our NMI handler, which is called whenever the "vblank" period starts, once per frame. For context on what vblank is and how it works on the SNES, I recommend [this video](https://www.youtube.com/watch?v=Q8ph2OVqZeM). This post will assume that you've watched it, or found the information in it from some other source.

We already have a NMI routine, which we set up in the very first part of this series. What we want to do is to make sure our code runs once per NMI. The most obvious way to do this is to just take the code we have and stick it in the NMI routine, but this isn't a good idea — doing so can lead to strange behaviour if your NMI handler takes to long, and a second NMI gets fired while you're inside it, among other problems.

Instead, we can use the `wai` instruction, which pauses execution until a interrupt is fired. However, there are more types of interrupts than just NMIs, so what we'll do is keep a count of the number of NMIs, which we increment in the NMI handler, and then have our main code check to see if the NMI count changed whenever it wakes up from the `wai` instruction.

We implement this NMI count variable by reserving some space in the [zero page](https://en.wikipedia.org/wiki/Zero_page) — a small, 256-byte section of memory that's fast to access an can be accessed from anywhere. In the future, you'll likely want to keep a few other global variables in the zero page, like the player's position, etc.

With that in mind, the [code](https://github.com/WesleyAC/snes-dev/tree/main/part4) and [diff](https://github.com/WesleyAC/snes-dev/compare/part4-base..part4) should be pretty self explanatory! The only extra bit is that we need to tell the SNES to send us NMIs by flipping a bit in the `NMITIMEN` register.

...how do we know that did anything, though? Everything looks exactly the same!

This is a great time to introduce another useful tool in Mesen-S: the event viewer. It provides a visualization of what type of code is running, and where in the fram it's running. Open up "Debug → Event Viewer", and compare what it looks like before and after the change. It should be pretty obvious what the difference is :)

This wasn't that exciting of a section, but it unlocks a bunch of exciting things! On your own, try making a tile that you can move around with the controller — at this point, you should have all the tools you need!

Once you get that working, we'll return to some boring infrastructure by replacing our slow loop to copy data into VRAM with some fast, sexy DMA in [part five](/posts/snes-dev-5-dma).
