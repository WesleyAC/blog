---
layout: post
title: "Exiting a Dead SSH Session"
description: "A neat SSH trick"
---

A common problem that I have with SSH is what happens when I disconnect from a network without with a SSH session still open - the SSH session won't exit and `Ctrl-C`/`Ctrl-D`/`Ctrl-Z`/`Ctrl-\` won't kill it.

I always used to just close the terminal emulator when this happened, but I recently figured out how to exit a dropped SSH session!

The way to do it is to press `<Enter>` (to make sure you're on a new line) and then `~.`. The `~` is a special character that tells SSH that a command is coming that should be handled by ssh itself, and not sent over to the remote computer. There are actually a ton of these commands (You can press `~?` for a full list), but the main one that looks useful to me (aside from `~.`) is `~<Ctrl-Z>`, which sends a SSH session to the background (Just like pressing `Ctrl-Z` would for a local process.)

As I use Linux more and more I keep finding more neat, but kind of hidden things like this - maybe I should do a post on cool linux/POSIX terminal stuff someday :)
