---
layout: post
title: "SNES Development Part 1: Getting Started"
description: ""
---

I fell down the rabbit hole making a homebrew SNES game a few days ago, and since I couldn't find many good resources, I figured I'd write something of a tutorial.

There are lots of resources out there for writing NES games, but way fewer for SNES games — I think there are a few reasons for this. First, the NES is much simpler than the SNES — this is true of both the NES hardware itself, but also of the 6502 chip as opposed to the 65816 used in the SNES. Many people have an almost religious connection to the 6502, whereas the 65816 is pretty clearly a backwards-compatible hack of an architecture. Secondly, the NES is nostalgic for people who likely learned to program by writing assembly, whereas people for whom the SNES holds nostalgia are probably around a decade older, and were more likely to have learned high-level languages, and thus to be scared off by the prospect of writing assembly. I think this fear is misplaced — writing assembly isn't much harder than writing high-level code, it's just different, and requires a bit more attention to detail — but I suspect it's part of the reason for a lack of SNES development resources.

This tutorial is aimed at people who:

* Want to make a game completely from scratch
* Want to understand how everything works under the hood
* Are already comfortable programming and using the command line

In particular, I'm not going to be explaining 65816 assembly, although I will link to some resources for it. My aim is to give a high-level overview of what you need to do in order to get various things working, with a little bit of well-written example code and working example programs for each step.

I'm also not going to explain features of the SNES that have already been explained a million other times on the internet. For an overview of the features of the SNES, I recommend the [Super NES Features](https://www.youtube.com/watch?v=57ibhDU2SAI&list=PLHQ0utQyFw5KCcj1ljIhExH_lvGwfn6GV) series of videos from Retro Game Mechanics Explained. At the beginning of each post, I'll write about what you'll need to know to understand it, and link to the relevant videos or documents. This series of posts can be thought of as a sort of companion series to those videos, in order to bridge the gap from theory to practice with small, concrete, working examples.

The example code will be kept brutally simple, to the point of maybe even being a little gross. This is to encourage you to make your own copy of it, edit it, and make it your own. I recommend copying the code from part one, and then applying the changes in each new part manually, so that you can clean things up and move things around as you go. In each section, I'll link both to the complete code and a diff from the previous part.

With that out of the way, let's get started. Step one is installing a couple tools — we'll need:

* A 65816 assembler and linker. I will be using `ca65` and `ld65`, which come with [`cc65`](https://cc65.github.io/).
* A SNES emulator. I highly recommend [Mesen-S](https://mesen.ca/). It's sadly no longer being developed, but it works well, and it has the best debugger I've found. I also test my code on [bsnes](https://github.com/bsnes-emu/bsnes) and [zsnes](https://zsnes.com/) sometimes — you should ensure that your code works at least on Mesen-S (which does things like randomize uninitialized memory) and bsnes (which is widely thought to be the most accurate emulator).

Go ahead and install both of those, and load up Mesen-S with a totally legitimate ROM file that I'm sure you have lying around. Once you're there, take a look at the debugging tools — try single stepping in the debugger, looking at the memory, and looking at the character set / tile set / sprite viewers. These are extremely useful tools, and it's good to have some familiarity with them *before* things start going wrong. If you don't know 65816 assembly, it's probably useful to single-step through a few dozen instructions with a 6502 / 65816 reference open, predicting what each instruction will do and checking your work each time. It's fine to not totally understand everything, but it's good to get a feel for things!

That's really all you need! Before jumping into writing some code, here are some resources that I've found helpful:

* [fullsnes — SNES hardware specs](https://problemkaputt.de/fullsnes.htm) — A super valuable resource for looking up documentation on what different registers do. If you see some code using a register you haven't seen before, look it up here.
* [Official SNES Developer Manual](http://nuclear.mutantstargoat.com/articles/snes_notes/refs/snes_dev_manual1.pdf) — It can be hard to find things, but this is the most authoritative source for how the SNES works.
* [Super NES Features](https://www.youtube.com/watch?v=57ibhDU2SAI&list=PLHQ0utQyFw5KCcj1ljIhExH_lvGwfn6GV) — A playlist of videos explaining almost all of the features of the SNES, at the level of detail that's useful for programming for the SNES. Well worth watching through.
* [SNES Development Wiki](https://wiki.superfamicom.org/) — Highly variable in quality, but extensive.
* [Assembly for the SNES](https://ersanio.gitbook.io/assembly-for-the-snes/) — A crash course in 65816 assembly as it relates to the SNES. Short, and worth reading/skimming through if you're not familiar with 65816.
* [6502 Opcodes](http://www.6502.org/tutorials/6502opcodes.html) — Useful reference, since the 65816 is backwards compatible with the 6502.
* [65816 Primer](https://softpixel.com/~cwright/sianse/docs/65816NFO.HTM) — Fills in the 65816-specific parts that the above doc doesn't have.
* [lorom-template](https://github.com/pinobatch/lorom-template) — A example game. The code is somewhat complex, but it can be useful to look at sometimes.
* [SNES programming guide — nesdoug](https://nesdoug.com/2020/03/19/snes-projects/) — I have found some problems with this code, and I find it difficult to read, but on the whole, it's a useful example.
* [SNES Assembly Adventure](https://georgjz.github.io/snesaa01/) — A series of blog posts much like this one, but in more detail. I haven't read most of it, but it seems useful.
* [snes-hello](https://github.com/SlithyMatt/snes-hello) — Hello World for the SNES. The initialization code is wrong, sadly, but it's a simple example of setting up a tileset.

You don't need to read all of those — most of this is more reference material than anything else — but it's useful to know that it's there.

With that out of the way, let's dive into the code! You can find the whole thing [on GitHub](https://github.com/WesleyAC/snes-dev/tree/main/part1/src). I recommend skimming it all now so you have a overview in your head, then coming back to this to read the explanation, but you're welcome to do whatever you want.

There are six main files:

* `registers.inc`: Aliases for most of the SNES registers.
* `macros.inc`: Some macros for switching between 8 and 16 bit modes, since I find the assembly instructions hard to remember.
* `init.asm`: Initialization code, which puts the SNES into a relatively consistent state when it boots up. It's very simple — most people would use something more complicated — but that's good for being able to understand what it's doing.
* `main.asm`: This is where the action happens! It makes the screen red, then waits forever.
* `header.asm`: This defines the [ROM header](https://snesdev.mesen.ca/wiki/index.php?title=Internal_ROM_Header), with the name of the cartridge, miscellaneous data, and the [vector table](https://ersanio.gitbook.io/assembly-for-the-snes/deep-dives/vector).
* `lorom256k.cfg`: The linker configuration, which defines how to mush all of the assembly together into the final ROM file, in what is typically called a "[LoROM](https://emudev.de/q00-snes/memory-mapping-the-tale-of-lorom-and-mmio/)" format.

The `registers.inc` and `macros.inc` files should be fairly self-explanatory, so I won't bother talking about them more. The header file is a little less self-explanatory, but if you look at documentation for the header format, it should be pretty clear what it's doing. The main reason you might need to edit this in the future is changing the name of the ROM or changing the interrupt handlers.

With those out of the way, let's look at `init.asm`. We start out with `sei` to disable IRQs, and then do `clc`, `xce` to transition from the 6502-compatible mode to 65816 mode (this is just a magic incantation). `cld` disables decimal mode — I'm not 100% sure that's needed, but it seems good, you usually don't want to be in decimal mode.

After that, we mostly just set a bunch of registers to zero — they might be initialized to random values on boot, so we set them to zero to have a clean slate. We also turn off the screen and disable color math, which is used for some transparency/etc effects.

Once our init code has run, the rest of the code in `main.asm` runs. This just sets a color palette with a single color (red), turns on the display, and loops forever.

In order to set up the palette, we first write a zero to the `CGADD` register to indicate that we're writing to the zeroth color, and then we write two bytes to `CGDATA` with the color. The SNES uses 15-bit color in a BGR format, which is a little unusual, but works fine once you get used to it. The SNES automatically increments the color it's writing to when you write to `CGDATA`, so you could write another color by copying just the two pairs of `lda` and `sta` commands, without writing to `CGADD`. In fact, this is the reason that writing to the same register twice in a row is meaningful — we're not just overwriting the old value, because writing to `CGDATA` causes the `CGADD` address to increment.

Most communication with the SNES works basically like this — it's all just writing to and reading from registers.

This should be enough to get you started. In the next part, I'll walk through rendering some graphics on the background layers. Before that, though, I'd recommend playing with the code a bit:

* Change the color to something prettier than red.
* Write a macro to add a color to the palette more easily.
* Change the palette in the busy loop.
* Look at some of the initialization routines in the examples linked above.
  * Figure out what they do differently from my simple example.
  * Find and fix the bug in the "hello-snes" init routine, which causes it to not work on Mesen-S.
  * Create your own `init.asm` file that makes you happy.

Once you've played around to your satisfaction, check out [part two](/posts/snes-dev-2-background-graphics) to get some graphics going!
