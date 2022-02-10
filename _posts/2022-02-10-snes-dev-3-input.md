---
layout: post
title: "SNES Development Part 3: Input"
description: ""
---

*This is part three of my series on SNES development. You may want to start with the [first post](/posts/snes-dev-1-getting-started).*

In the [previous part](/posts/snes-dev-2-background-graphics), we got some graphics rendered to the screen! Now, we're going to read some input from the controller ("joypad", in official Nintendo parlance) so we can move the graphics around.

On the whole, this is pretty simple — we'll enable "auto-read", which will cause the input data to be read into the `JOY1L` and `JOY1H` registers, which we can then read from to get the state of all of the buttons.

We enable the auto-read feature by setting the 0th bit of the `NMITIMEN` register.

That's really all you need to know to get input working! You can see the [example code](https://github.com/WesleyAC/snes-dev/tree/main/part3) and [diff](https://github.com/WesleyAC/snes-dev/compare/part3-base..part3) as per usual.

The example code just waits to write the tile to the screen until the down button is pressed.

Now that you can read input, there's plenty of interesting stuff you can do! I'd recommend:

* Change which button is used to render the tile.
  * Make a file that has constants like `JOYH_UP`, `JOYH_DOWN`, etc, so you don't have to keep looking up the bitmasks.
* Make different buttons render different tiles.

It might be tempting to jump right in and try to make a tile you can move around, but that's not going to work very well just yet — since this code is running in a tight loop, it'll move way too fast to be controllable at all. The [next part](/posts/snes-dev-4-nmi-and-vblank) will cover synchronizing with vblank so that we can get a fixed framerate.
