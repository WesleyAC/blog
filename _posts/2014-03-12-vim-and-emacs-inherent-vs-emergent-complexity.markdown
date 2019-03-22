---
layout: post
title: 'Vim and Emacs: Inherent vs. Emergent Complexity'
description: Time for some editor wars...
tags: [vim,emacs]
hide: true
---
Chances are that if you use vim or emacs that you think that $EDITOR is the one true editor, and you pity other poor, misguided souls who use anything else.

After using vim for a while, and recently playing with emacs, I've noticed that both vim and emacs have the same goal, but different methods of getting the result.

# Vim

I like to think of vim as having [emergent](https://en.wikipedia.org/wiki/Emergence) complexity.  You have action commands and movement commands.  Want to delete a word?  dw.  You use the movement command,"w" on the delete action.  As a result of this, there is a vast amount of things that you can do with vim.  One of the first things that made me notice how powerful vim is was a situation like this:

<pre>somestring = "I want to remove everything in the quotes."</pre>

My cursor is on the first quote.  What do I do?

<pre>d/"</pre>

That combines searching (the "/" command) with deleting.  There are countless other examples.  want to delete all the text in a file?

<pre>ggdG</pre>

The power of vim is the ability to string together commands.

Vim is [a language](http://yanpritzker.com/2011/12/16/learn-to-speak-vim-verbs-nouns-and-modifiers/).  Think about how many things there are to say in any language.  Once you are fluent, you can communicate anything you can think of.

# Emacs

Emacs tends to have inherent complexity.  Everything you could want to do is there, you just need to know what the command is to make it do what you want.  Once you learn a command, you can make the editor do whatever that command does.  Take a look at how many commands there are in emacs.  Scary, no?  Emacs does not give you a language, it gives you a list of commands.  I admit that I use vim much, much more that I use emacs, but off the top of my head, here's how I'd delete a line in emacs:

<pre>C-a C-&lt;SPC&gt; C-e C-w</pre>

All of those are separate actions.  Move to beginning of line.  Start selecting text.  Move to end of line.  Delete selected text.

The proper way to delete a line in vim is "dd", but let's pretend that you want to do the same sort of thing that I did in the emacs example.  Here's how:

<pre>0d$</pre>

This is 2 separate commands, unlike the emacs version.  Move to beginning of line.  Delete until end of line.

# Conclusion

You edit with emacs by telling your text editor a list of commands.  You edit with vim by telling it a sentence.  Whatever works for you is what you should use.  I want to speak to my editor and have it do what I want.  Vim allows me to do that.
