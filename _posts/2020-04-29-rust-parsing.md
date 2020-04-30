---
layout: post
title: "Notes on Parsing in Rust"
description: ""
tags: [rust]
---

I've recently been writing a bit of parsing code in Rust, and I've been jumping back and forth between a few different parsing libraries - they all have different advantages and disadvantages, so I wanted to write up some notes here to help folks who are undecided choose what libraries and techniques to consider, and also to offer some suggestions for the future of the Rust parsing ecosystem.

I'm writing this after writing parsers for two fairly different usecases:

* a fairly simple binary format (mostly just serializing structs, but it also has varints, fixed-point numbers, various types of containers)
* a very simple templating language ([liquid-template](https://shopify.github.io/liquid/)-esque)

Some of these libraries are only/mostly applicable to one or the other - I will note when that is the case.

**Last updated: April 2020** - the Rust ecosystem is evolving quickly, things may have changed since this was written.

## [nom](https://github.com/Geal/nom/) (v5.1.1)

nom is probably the most famous Rust parsing library - it's a [parser-combinator](http://theorangeduck.com/page/you-could-have-invented-parser-combinators) library, which means that you write functions to parse little bits of your inputs, then you use the "combinators" that nom provides to combine them together into larger parsers. nom is good for both binary and textual formats, and can handle streaming data (where you start parsing before you have all of the data), which is nice if you want that.

I like nom a lot - I really enjoy using parser combinators, and nom is definitely my goto for lots of things, but it does come with a few caveats:

* The documentation isn't great, and figuring out how you're supposed to use it can be difficult. It's gotten *a lot* better now that it's no longer macro-based, but it can still be pretty frustrating to figure out.
* The documentation being lacking exacerbates the fact that the selection of combinators and helper functions isn't as large as I'd like - for instance, I spent quite a while looking for something that operated like [`take_until1`](https://github.com/Geal/nom/issues/1147), just to find out that it doesn't exist in the current version of nom, and I'd have to implement it myself.
* The error handling story is not good. It's possible that I'm just holding it wrong, since apparently error handling was improved in 5.0, but after reading all of the available docs and some of the source code, I wasn't able to figure out how to return custom error types in a way that's not extremely verbose. And that's just to get *any* information out - if you want to get spans and human-friendly error messages, that's probably even harder.

Overall, I liked using nom, and will probably continue to use it, especially for small to medium sized parsers where I care about performance[^1]. Hopefully the error handling will get better soon, and it can be my goto for more things.

## [LALRPOP](https://github.com/lalrpop/lalrpop/) (v0.18.1)

LALRPOP is a parser-generator, meaning that it takes in a file that describes the grammar you want to parse, and generates code that implements a parser for that grammar. You can check out some examples of what the grammar files look like [here](https://github.com/lalrpop/lalrpop/tree/5ba76e258747753e5ddcc1ace386d4d56a598924/doc/calculator/src). It's designed primarily for textual formats.

It's primary goal is usability, and that really shows - since the grammar is designed specifically to work with Rust, it can directly generate the Rust structs that describe your AST, which is really really nice - you don't need to write any repetitive code at all, you can just describe your grammar and get an AST out. However, there's a big caveat here - LALRPOP splits out the parsing and lexing phases, and the built-in lexer is described by the author as being ["intended to be a toy"](https://github.com/lalrpop/lalrpop/issues/193#issuecomment-286704517), and it seems pretty annoying to write your own. So, if you have a grammar that requires a non-trivial lexer, you still will need to write Rust code.

The particular issue that bit me is if you have two "terminals" that are ambiguous, even if the grammar isn't ambiguous overall (because only one of the terminals will be able to be parsed at any given time), LALRPOP will not be able to parse the grammar. For instance, a silly example:

```
grammar;

pub Main: () = {
  "foo: " <foo: Foo> => foo,
  "bar: " <bar: Bar> => bar,
};

Foo: String = {
  <value: r"[A-Za-z0-9]+"> => value,
};

Bar: String = {
  <value: r"[A-Z]+"> => value,
};
```

This grammar parses either the string "foo: " followed by any number of alphanumeric characters, or the string "bar: " followed by any number of uppercase latin letters. This is non-ambiguous, but LALRPOP does not accept it, because "any alphanumeric character" is ambiguous with "any uppercase latin letter".

I ran into this issue and stopped using LALRPOP (since I was too lazy to figure out how to write my lexer the way LALRPOP wanted me to). Which is a shame, since LALRPOP is extremely nice otherwise! Being able to just write the grammar file and get structs out is amazing, and the grammar language seems quite nice. There's an [open issue](https://github.com/lalrpop/lalrpop/issues/195) for fixing this, but unfortunately it seems pretty fundamental to LALRPOP's current design.

## [pest](https://github.com/pest-parser/pest) (v2.1.3)

pest is a parser-generator using [PEG](https://en.wikipedia.org/wiki/Parsing_expression_grammar) as an input, making it more powerful than LALRPOP (presumably at the cost of being slower, but I haven't tried to benchmark either of them). This makes it very easy to write a grammar and get a tree back, but unfortunately the tree that you get has no types associated with it (unlike LALRPOP), so you need to manually write the code to take the output of pest and write it into an AST that you'd actually want to use. This code tends to be pretty rote and easy to write, but you still do have to write it, which is a bit annoying, and keeping it in sync with a changing grammar seems extremely annoying and bug-prone.

pest also has a pretty nice error handling story, given that it gives you spans to work with so you can report errors fairly easily. I haven't used it enough to see how that really scales up for more complicated things, but superficially, it seems pretty nice.

# What I went with

For the template parser, I went with pest, since it allowed me to get a prototype of the ground as quickly as possible, which is what I was optimizing for for that project. I don't think I'd be happy with it in the long term (keeping the untyped pest output to AST code in sync with the grammar long-term seems really frustrating and error prone), but I was very happy with it as a prototype.

For the binary protocol, I originally wrote a parser with nom, which I was quite happy with. However, once I wanted to implement serialization as well as parsing, after a quick detour trying to use serde[^2], I decided to implement both parsing and serializing using a custom procmacro which I wrote myself (with the help of [byteorder](https://github.com/BurntSushi/byteorder)), and I ended up happier with that solution than I was with the original nom parser - it ended up being fewer lines of code, as well as seeming simpler overall.

# What I want in the future

I'd love to see a crate that combines the usability of LALRPOP's format with the expressivity of PEG parsers, for when I want to quickly hack together a prototype of something involving a parser, or for cases where optimization is not as important.

I'd also love to see nom get better error handling support and docs, as well as more combinators in its library.

And implementing all of this was also definitely a good reminder that writing a parser by hand can be a good choice a lot of the time as well! You don't always have to turn to a library to solve your problems.

I'll also close this out with the caveat that basically all of the parsing I've done has been for extremely small "toy" problems, and so this post ignores a lot of concerns that I'd have writing something more "real" - particularly, I think it's quite a bit harder to get good error messages out of a parser-generator than a parser-combinator or a handwritten parser, and error messages are generally a really important and underappreciated part of parser design.

[^1]: I have not performed benchmarking on any of these libraries, but I would expect, and anecdotally hear that nom is faster than most parser-generators (and, for instance, pest's own benchmarks show that nom is faster than pest). YMMV, run benchmarks if you care about performance, etc.
[^2]: This is a whole other blog post, but an important thing to realize with serde is that, while it's great at writing serializers and deserializers for very generic data formats, for more specialized formats where you need a lot of control over fiddly details, it can be really frustrating/impossible to specify what you want. For instance, treating some `i32`s as varints and others as fixed-width is extremely annoying in serde, but trivial in my custom procmacro solution. Similarly, dealing with different `Vec`s being length-prefixed in different ways is really not something serde is designed to handle.
