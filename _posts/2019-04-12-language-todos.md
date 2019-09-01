---
layout: post
title: "Languages I want to write"
description: ""
tags: [software]
---
I spent this weekend writing a Forth designed for music synthesis, and it reminded me what a joy writing programming languages is! I have a big list of programming language experiments that I want to try, but it's mostly been in my head so far. Here's a living document of some of the languages I want to write.

### A language with dependent types and borrow checking

A [dependent type system](https://en.wikipedia.org/wiki/Dependent_type) is one where a type can depend on a value - for instance, a function's return type could depend on the value of one of its arguments. [Idris](https://www.idris-lang.org/) is perhaps the most famous dependently typed language.

Having dependent types allows for a huge amount of expressivity at the type level, preventing runtime bugs.

However, all current dependently typed languages are garbage collected.

[Rust](https://www.rust-lang.org/) is the first (well-known) language to not use either garbage collection or manual memory management, instead relying on borrow-checking to allocate and free memory. [Carp](https://github.com/carp-lang/Carp) is a lisp that uses a borrow checker (they call it a "[lifetime analyzer](https://github.com/carp-lang/Carp/blob/master/docs/Memory.md)") for memory management, and compiles to C.

It would be interesting to combine dependent types and borrow checking.

Some useful places to start with this:

* [A tutorial implementation of a dependently typed lambda calculus](https://www.andres-loeh.de/LambdaPi/LambdaPi.pdf)
* [The Idris paper](https://pdfs.semanticscholar.org/1407/220ca09070233dca256433430d29e5321dc2.pdf)
* [Oxide: The Essence of Rust](https://arxiv.org/pdf/1903.00982.pdf)
* [The Carp docs](https://github.com/carp-lang/Carp/blob/master/docs/Memory.md)
* [How to implement dependent type theory](http://math.andrej.com/2012/11/08/how-to-implement-dependent-type-theory-i/)

It's probably incredibly hard to make a language like this ergonomic and performant, but I think it's an important design space to explore.

### A productionized stream processing language

When I started working at Google, saw that everything was protobufs, and I assumed that the tools for dealing with protobufs would be amazing. Turns out, nope, you're writing thousands of lines of [guiced](https://github.com/google/guice) up Java to perform what are, conceptually, simple transformations of protobufs.

[jq](https://stedolan.github.io/jq/) is a stream processing language for JSON - it allows you to easily express transformations of JSON. ([faq](https://github.com/jzelinskie/faq) is another cool tool in this space, although I haven't tried it yet)

I want to be able to write servers in jq, except communicating in a typed format that has a real schema. The real work here is tying this together with a DB and reasonable frontend framework, but I think there's something interesting in the idea of jq with types.

### An effect system for Forth

It'd be interesting to write an effect system for Forth - there's already been plenty of research into [analyzing the stack effects of forth words](https://www.kodu.ee/~jpoial/teadus/EuroForth90_Algebraic.pdf) - it seems like interesting design space to use these as annotations for forth words, MyPy style. I'm not sure exactly what effects one would care about for forth - the most obvious are stack effects, but forth seems like an interesting playground for all sorts of taint-tracking things.

### A python-esque language with algebraic data types

[Algebraic data types](https://en.wikipedia.org/wiki/Algebraic_data_type) allow you to express many types of data in your type system.

Python is a wonderful scripting language, and is the language that I can most quickly throw together scripts in, but the lack of typing makes it untenable for large programs, and unpleasant for small ones.

I'd love to have a python-esque language with algebraic data types. Some people tell me that [Pyret](https://www.pyret.org/index.html) is this, so I should probably look at that first.

Also, it'd be amazing if it compiled to WASM - a major pain with python is that it's super hard to distribute. I often end up writing javascript just because it's easier to share, but that makes me sad :(

### A lisp that compiles to C++ template metaprograms

C++ template metaprogramming feels surprisingly like writing a functional language - most everything is immutable, and recursion is the only looping.

It seems to me that it shouldn't be too much effort to write a Lisp that compiles down to C++ templates. I started writing this at the [Recurse Center](https://www.recurse.com/) (and got as far as compiling prefix notation arithmetic expressions), but put it down. I'd love to return to it some day.

I don't think this would be useful, but it would be hilarious.

### A structurally edited language with no names

A language where functions are referred to by a hash of the computation that they perform, rather than by name. Bindings are similarly referred to by hash. You may have an alias file, which provides names for functions, but no names are canonical.

This has a few benefits:

* Languages are trivially internationalized - one can simply look at the same program with an alias file in a different language
* Dependency versioning is easy - your dependency versions are specified by the hashs of the functions you call. Simple tooling (search and replace, essentially) would allow updating dependencies
* Linking is easier - no more `__load_bearing` functions and name mangling 

This should be structurally edited to allow for better tooling around showing aliases, etc.

[Ramsey Nasser](https://twitter.com/ra) gave a very good talk about this at [Deconstruct 2019](https://www.deconstructconf.com/). The video is not yet posted (as of Sept 2019), but it's based on [this paper](http://ojs.decolonising.digital/index.php/decolonising_digital/article/view/PersonalComputer).

# Why write languages?

I think that a lot of people are confused as to why people write programming languages - we have so many already, what could the new programming language you're writing possibly bring to the table? But in reality, there's a *ton* of design space in programming languages that hasn't been explored yet! It's important that we continue to explore this space, not because every language will be good, but because some of them might bring new ideas to the table, or cause us to see how a combination of old ideas is amazing together. No one knows what it'd be like to program in a borrow-checked language with dependent types, because there isn't one that exists!

Also, writing a programming language can be a lot of fun! It really demystifies what a "programming language" actually is, and what computers are actually doing. (If writing a programming language seems scary, I'd recommend reading "[My first fifteen compilers](http://composition.al/blog/2017/07/31/my-first-fifteen-compilers/)" by Lindsey Kuper - it turns out that compilers (and programming languages) come at all different levels of complexity, and you can probably implement a very simple compiler or language in a few days!)

I wish more people were writing strange programming languages, or at least talking about what programming languages they want to write. What programming languages do you want to see?

**Last update: 21 June 2019**
