---
layout: post
title: "SNES Development Part 2: Background Graphics"
description: ""
---

*This is part two of my series on SNES development. You may want to read the [previous post](/posts/snes-dev-1-getting-started) first.*

Now that we have a simple SNES ROM, let's add some graphics. In this post, we'll draw some graphics to the background. There are many explanations of the SNES background graphics architecture online, so I won't bother repeating those here — I recommend watching the Retro Game Mechanics Explained videos on [Graphics & Palettes](https://www.youtube.com/watch?v=57ibhDU2SAI), [Backgrounds & Rendering](https://www.youtube.com/watch?v=uRjf8ZP6rs8), and [Background Modes](https://www.youtube.com/watch?v=5SBEAZIfDAg). I don't usually recommend videos, but these are the best explanations I've found of this topic, in any format. [This blog post](https://megacatstudios.com/blogs/retro-development/super-nintendo-graphics-read-in-the-voice-of-brendan) is a reasonable general overview as well, but it has less information than the videos.

The general gist of things is that we're going to set up a palette, which will give us some colors we can use, just like we did in the previous part. Then, we'll load some images into the VRAM — these are what are colloquially called "tiles", but the official SNES documentation refers to them as "characters". Then, we'll write a "tile map" to the VRAM, which tells the SNES which characters to draw on the screen, and where. We also need to select which graphics mode we want to use — for this demo, it'll be Mode 0 with 8x8 tiles.

With that in mind, take a look at [the code](https://github.com/WesleyAC/snes-dev/tree/main/part2/src) — especially the [diff of the changes from part 1](https://github.com/WesleyAC/snes-dev/compare/part2-base..part2). I'd recommend reading through that with the above list in mind, and then coming back to read the rest of the explanation, once you have a overview of the code in your head.

Let's take a look at the changes in the main file first. The first thing we do is define some constants for locations in the VRAM. The SNES has 64k of VRAM, and we can lay it out however we like, although there are some alignment restrictions.

The next change is just adding three more colors to our palette. Mode 0 uses two-bit-per-pixel (2bpp) color, which means that there are four colors available, so I add four colors to the palette.

Once that's done, we set the graphics mode to Mode 0 by writing to the `BGMODE` register. This controls both the mode, and the tile size for each background layer, which can be either 8x8 or 16x16.

After that, we tell the SNES where to find the tile map and character map by writing to the `BG1SC` and `BG12NBA` registers. As the name implies, the second one controls the character set for both backgrounds one and two, using the two separate halves of the byte, but we don't need to worry about that for now, since we're only using BG1.

Then, we copy the character data from the ROM into VRAM. This is done with a loop, but in the future we'll replace that loop with [DMA](https://sneslab.net/wiki/DMA), which is much faster. For now, though, you don't need to worry about that.

It's useful to notice how to write to VRAM — we set `VMADDL` to the address we want to write to, and then we write to `VMDATAL` and `VMDATAH` to set the data we want to write. This is basically the same as how we wrote the palette data. One difference is that the auto-incrementing is more configurable — by setting the 7th bit of `VMAIN` (which means "video memory auto-increment", not "video main"), we set it to auto-increment after we write to the `VMDATAH` register.

I'm not going to go into detail here about the format of the character data, since other people have written about it at length — it's covered in the videos I linked at the start of the post, and a good textual description is available [here](https://mrclick.zophar.net/TilEd/download/consolegfx.txt). I personally found the explanations a bit confusing, and preferred to just experimentally twiddle the bits around by hand until I understood it — it's the sort of thing that can be confusing to read about, but obvious once you start playing with it.

With the character data written, we can render a character to the screen. We do this by writing two bytes to the BG1 tile map, using the same process to write to VRAM as above. The first byte controls the tile index, and the second byte controls which palette to use, the rendering priority, and whether to mirror the tile horizontally or vertically.

With all that setup out of the way, the last thing we have to do is enable rendering BG1 by setting its bit in the `TM` register, and voilà, a tile on the screen!

With that done, there's plenty you can experiment with:

* Change what the tile looks like, by editing the `charset.asm` file.
* If you're running in Mesen-S, you'll notice that the tile is surrounded by garbage data. Zero out the tile map so that doesn't happen.
* Add a couple more tiles, and render them at different spots on the screen.
* Use a mode other than Mode 0 — Mode 1 is a super common and useful mode. This changes the number of bits per pixel, so you'll need to change the character set to match.
* Experiment with building some sort of graphics editing pipeline to generate the character data. You could use something like YY-CHR, aesprite, or one of the many conversion tools available online, or write your own tools — whichever you prefer!

Once you're done with all that, head to [part three](/posts/snes-dev-3-input) for reading and responding to input!
