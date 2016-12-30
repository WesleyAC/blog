---
layout: post
title: The joy of brainfuck
description: Lessons learned from programming FizzBuzz in brainfuck
tags: [brainfuck]
---
My favorite esoteric programming language is [brainfuck](http://esolangs.org/wiki/brainfuck) - A [turing-complete](https://en.wikipedia.org/wiki/Turing_complete) language implemented in just 8 simple commands. So when I needed to make a [FizzBuzz](https://blog.codinghorror.com/why-cant-programmers-program/)-like program for my application to the [Recurse Center](https://www.recurse.com/), I knew what I had to do.

> Beware of the Turing tar-pit in which everything is possible but nothing of interest is easy.
>
> -- Alan Perlis

The exact problem that I was trying to solve comes from the Recurse Center's application:

> Write a program that prints out the numbers 1 to 100 (inclusive). If the number is divisible by 3, print Crackle instead of the number. If it's divisible by 5, print Pop. If it's divisible by both 3 and 5, print CracklePop. You can use any language.

This is my solution:

```
++++++++++>>++++++++++[<+++++++++++>-]<++>>++++++++++[<+++++++++++>-]<+>>++++++++++[<++++++++>-]>++++++++++[<++++++++++>-]<+>>++++++++++[<++++++++++>-]<++++++++>>++++++++++[<++++++++++>-]<+++++++>>++++++++++[<++++++++++>-]<->>++++++++++[<++++++++++>-]<--->>++++++++++[<+++++++++++>-]<++++>>++++++++++[<+++++++>-]<--->-->---------->--------->>++++++[<++++++++>-]>++++++[<++++++++>-]>++++++[<++++++++>-]<<<<<<[>[>[>+>>>>+>>>>>>>>>>>>>>>>[-]+>[-]<<[>-]>[<<<<<<<<<<<<<<<<<[-]>>[-]>[-]+++>[-]>>[-]>[-]<<<<<<[>+>->+<[>]>[<+>-]<<[<]>-]>[-<+>]>>>[-]+>[-]<<[>-]>[<<<<<<<<<<<<.<.<.<.<.<.<.>>>>>>>>>>>>>>>>>>>>+<<->]<<<<<<[-]>>[-]>[-]+++++>[-]>>[-]<<<<<[>+>->+<[>]>[<+>-]<<[<]>-]>[-<+>]>>>[-]+>[-]<<[>-]>[<<<<<<<<<<<<<<<<<<<.<.<.>>>>>>>>>>>>>>>>>>>>>>>+<<->]>>[-]+>[-]<<[>-]>[>>>[-]+>[-]<<[<<<<<<<<<<<.>>>>>>>>>>>>-]>[->]>>[-]+>[-]<<[<<<<<<<<<<<<<<<.>>>>>>>>>>>>>>>>-]>[->]<<<<<<<<<<<<<<<<<<.>>>>>>>>>>>->]>>[-]+>[-]<<[>>>>>>+<<<<<-]>[->]<<<<<<<<<<<<<<<<<<<<<<<<<<<<<.>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>->]<<<<<<<<<<<<<<<<<<<<<<+]>----------<---------->>+<<>>>>>>>>>>>>>>>>>+<<<<<<<<<<<<<<<<<<+]>>>----------<<<---------->>>>+>>>>>>>>>>>+<<<<<<<<<<<<<<<<+]
```

Here it is in it's [unminified glory](https://gist.github.com/WesleyAC/fce000f65c7acc9b7b6b7bb4dc04c2b8)

Actually breaking this down is only interesting if you're into brainfuck programming, so instead of doing that, I'm just going to focus on the lessons that I learned from programming this:

## Planning

Brainfuck forces you to think **a lot** about how you structure your code - for example, an if statement will need you to allocate at least two temporary cells, which need to be planned out in the memory layout. I tried several times to just start writing, but never got far. I ended up needing to write down the memory layout, and requirements for all of the constructs that I wanted to use (each if statement, loop, modulus, etc). Once I did that, however, implementing it was easy.

This is interesting, because this effect exists in high-level languages as well, it just requires much larger programs to see it. Brainfuck shows you the importance of planning at tiny scales.

## Contracts

One of the concepts in programming that I find interesting is a "contract". A contract is a (often non-enforced) set of requirements that a piece of code will follow - what variables it will access, how long it will take to run, what variables or registers it needs to write to.

It's easy to write in many languages without planning out contracts for your code - they're often enforced automatically with scoping or namespaces. In brainfuck, however, I found it very useful to define a "contract" for each line of code - it will return the data pointer to the same place as where it started, it will write _these_ values to _those_ cells, etc. It's really helpful to do this, because you can see what code affects what parts of the memory or code.

## Tools

I sometimes say that all problems are easy if you have the right tools - it's just that often the right tool hasn't been invented yet.

For brainfuck, I couldn't find a good debugger, so I [made my own](https://github.com/WesleyAC/toybox/tree/master/bfdbg). This let me fairly easily see the memory and set breakpoints. It could be a lot better, but it got me through CracklePop!

## Comments

Having comments was really really helpful. There were times when I'd take a 15 minute break, come back, and have no idea what my code was doing, since I hadn't written comments.

## Conclusion

The main theme here is that Brainfuck helped me see why good software architecture is important at small scales - because it's almost impossible to write code in brainfuck without it.
