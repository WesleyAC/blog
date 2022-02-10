---
layout: post
title: "SNES Development Part 5: DMA"
description: ""
---

*This is part five of my series on SNES development. You may want to start with the [first post](/posts/snes-dev-1-getting-started).*

In [part three](/posts/snes-dev-3-background-graphics), I mentioned that in the future, we'd switch from using a loop to copy data into VRAM to using DMA. Well, the future is now!

Using DMA is much faster than using a loop, which makes it easier to load large amounts of data from ROM to memory, whether that's graphics, sprite data, palettes, levels, or anything else your heart desires. It'll be useful in the next part, where we'll want to quickly send the sprite data to the SNES.

As usual, I recommend watching the Retro Game Mechanics Explained video on [DMA & HDMA](https://www.youtube.com/watch?v=K7gWmdgXPgk) first. You can stop watching once you get to the HDMA part if you'd like — only the DMA section is needed to understand this part.

The code for this part might seem a little scary, but once you have a solid understanding of what DMA is and how it works, it's not too bad. You can find the [code](https://github.com/WesleyAC/snes-dev/tree/main/part5) and [diff](https://github.com/WesleyAC/snes-dev/compare/part5-base..part5) on GitHub as usual. This time, we'll walk through each step of the diff, since it's small but dense.

```
lda #%00000001
sta DMAP0
```

This sets the DMA flags. The first bit is a zero, to indicate that we're transferring from the CPU memory to the PPU memory. The next two bits are unused. The next two bits are zero to indicate that we want the address we're writing to to auto-increment (we could instead choose to auto decrement, or use a fixed address). The final three bits, `001`, indicate that we want to transfer two bytes at a time.

```
lda #<VMDATAL
sta BBAD0
```

This tells the SNES that we want this DMA to write to the `VMDATAL` register, and since set the mode to `001`, it'll also write to `VMDATAL + 1`, which is `VMDATAH`.

```
ldx #.loword(charset)
stx A1T0L
lda #^charset
sta A1B0
```

These lines set the starting address to `charset`, which is our label for the location of the charset data. The `.loword` and `^` are our way of telling the assembler to just pull the bits that we want — you can read more about them in the [ca65 manual](https://cc65.github.io/doc/ca65.html) if you'd like. Note that we write to `A1T0L` with the X register since it's in 16 bit mode — this lets us write to the `A1T0L` and `A1T0H` registers at the same time.

```
ldx #(charset_end - charset)
stx DAS0L
```

Here, we set the amount of data we want to transfer.

```
lda #1
sta MDMAEN
```

And finally, we kick off the DMA!

This has been some more anticlimactic infrastructure work — as with the previous time we did this, everything will look exactly the same when you run it, but if you look in the Mesen-S event viewer, you should be able to see the change :)

This time, though, there's some stuff you can do on your own:

* Write a macro to set up and run a DMA transfer
* Use your shiny new DMA transfer to write some tiles to `VRAM_BG1`
* Replace your manual palette setting code with DMA

Once you've done all that, it's time to move on to making some sprites in [part six](/posts/snes-dev-6-sprites)!

<!--
next posts:

* sprites
* scrolling
-->
