---
layout: post
title: "SNES Development Part 6: Sprites"
description: ""
---

*This is part six of my series on SNES development. You may want to start with the [first post](/posts/snes-dev-1-getting-started).*

In the sixth, and likely final segment of this SNES tutorial, we're going to draw a sprite (or rather, an "object") on the screen! Once we're through with this, you should have basically everything you need to go off into the world and make SNES games all on your own :)

As usual, I recommend the Retro Game Mechanics Explained video on [Objects](https://www.youtube.com/watch?v=sheOZ-Dlleo) as prerequisite background material.

We're going to allocate some space to save a copy of our OAM, which we'll DMA to the actual OAM memory every frame. We'll need to add a new palette for the sprites, and some new tiles. Then, we'll set sprite zero to use our tile and palette, and set its X and Y position. We'll make it a 16x16 sprite, because that's more interesting :)

You can find the [code](https://github.com/WesleyAC/snes-dev/tree/main/part6) and [diff](https://github.com/WesleyAC/snes-dev/compare/part6-base..part6) in the usual places.

The code for this isn't too tricky. The first step is to allocate some space for a copy of our OAM table in the [BSS segment](https://en.wikipedia.org/wiki/.bss). The BSS segment is just a place to put variables, similar to the zero page that we used previously. (We can't use the zero page for our copy of the OAM, since it's not large enough). Unlike code that's running in an operating system, our BSS isn't going to be set to zero before we get out hands on it, we need to add a loop to zero it out ourselves.

We need to add some new palettes, since sprites use a separate set of palettes from tiles. The sprite palettes start at CGRAM index 128. I add a black, which is unusable (since the 0th palette color on sprites is treated as transparent) and a red for the foreground color. You should already have some system of your own that's nice than this for setting up palettes, so feel free to use that instead. Mesen-S comes with a nice palette viewer tool if you want to check your work.

We also set the `OBSEL` register, which controls the object size options (we choose 8x8 for small sprites and 16x16 for large sprites) and some offsets for selection which tiles to use, which we leave at zero for simplicity. Leaving the offsets at zero means that the backgrounds and the sprites will use the same set of tiles. One thing to note is that if you're using a background mode that has a number of colors other than 4bpp, this'll get a little bit messy. I recommend using Mode 1 to start with, which sets BG1 and BG2 to 4bpp, but the demo code is running in Mode 0, which is 2bpp. It's not a big problem to mix them, it's just something you'll need to be thinking about when indexing into the tiles.

After that, the only remaining setup is setting the bit on the `TM` register that enables sprite rendering.

With the setup out of the way, we can write our sprite data into the OAM on each frame, and use DMA to copy our OAM data to the OAM. You can find documentation for the OAM format [here](https://problemkaputt.de/fullsnes.htm#snesppuspritesobjs), although the bits that you need to know to immediately start hacking are commented in the code.

Once you have the OAM integrated into your code, you basically have enough to start making a game! You can hook up the sprite so you can move it with the controller, start adding some sprites for enemies, making maps with tiles, and really doing whatever you want!
