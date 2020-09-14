---
layout: post
title: A Quick Primer on Robert "Uncle Bob" Martin
description: ""
---

Robert "Uncle Bob" Martin is in the discourse again, this time for [planning to sue conference organizers and speakers](http://web.archive.org/web/20200913095211/http://blog.cleancoder.com/uncle-bob/2020/09/12/TheDisinvitation.html) if he is offered a slot to speak at a conference and later has it rescinded. Martin is widely respected and followed in the software industry, having coauthored the Agile Manifesto, written several books, and given many talks. However, I've personally found his technical ideas to be consistently dogmatic and sloppy, he repeatedly makes sexist remarks and made many people feel uncomfortable and unwelcome at conferences and communities he's in, and I find his views on race and politics extremely harmful. This post is a primer on why I think Martin's views on software are frequently unhelpful and incorrect, as well as an overview of some of his comments on race, gender, and politics.

# The Technical

First, let's examine Martin's advice on its own merits. What does he believe about code, and how does he justify that?

### Clean Code

As an intro to how Martin thinks about writing code, let's take a look at his 2009 book, *Clean Code*[^1]. Sam Hughes has a [detailed blog post](https://qntm.org/clean) about this book if you want a full dissection of it, but let's just pull out a few quotes:

> Martin says that functions should not be large enough to hold <em>nested</em> control structures (conditionals and loops); equivalently, they should not be indented to more than two levels. He says blocks should be one line long, consisting probably of a single function call. He says that an ideal function has <em>zero arguments</em> (but still no side effects??), and that a function with just three arguments is confusing and difficult to test. Most bizarrely, Martin asserts that an ideal function is <em>two to four lines of code long</em>. This piece of advice is actually placed at the start of the chapter. It's the first and most important rule

Hughes goes on to discuss Martin's example refactoring of some code from <a href="http://www.fitnesse.org/">FitNesse</a>:

> I'll say again: this is Martin's own code, written to his personal standards. This is the ideal, presented to us as a learning example.
> <br><br>
> I will confess at this stage that my Java skills are dated and rusty, almost as dated and rusty as this book, which is from 2008. But surely, even in 2008, this code was illegible trash?
> <br><br>
> Let's ignore the wildcard <code>import</code>.
> <br><br>
> We have two public, static methods, one private constructor and fifteen private methods. Of the fifteen private methods, fully thirteen of them either have side effects (they modify variables which were not passed into them as arguments, such as <code>buildIncludeDirective</code>, which has side effects on <code>newPageContent</code>) or call out to other methods which have side effects (such as <code>include</code>, which calls <code>buildIncludeDirective</code>). Only <code>isTestPage</code> and <code>findInheritedPage</code> look to be side-effect-free. They still make use of variables which aren't passed into them (<code>pageData</code> and <code>testPage</code> respectively) but they <em>appear</em> to do so in side-effect-free ways.

I recommend the [original post](https://qntm.org/clean) for more examples, but the gist of it is that pretty much the whole book is filled with bad advice like this. Now that we've taken a look at *Clean Code*, let's turn our attention to some of his more recent opinions.

### Tools and Discipline 

In his 2017 blog post "[The Dark Path](https://blog.cleancoder.com/uncle-bob/2017/01/11/TheDarkPath.html)," Martin discusses programming languages that make some classes of errors impossible (looking at the examples of Swift and Kotlin). On the topic of defects in software, he writes:

> Ask yourself why we are trying to plug defects with language features.  The answer ought to be obvious.  We are trying to plug these defects because these defects happen too often.
> <br><br>
> Now, ask yourself why these defects happen too often.  If your answer is that our languages don’t prevent them, then I strongly suggest that you quit your job and never think about being a programmer again; because defects are <em>never</em> the fault of our languages.  Defects are the fault of <em>programmers</em>.   It is <em>programmers</em> who create defects – not languages.

Leaving aside the gatekeeping of telling people to "quit your job and never think about being a programmer again," this opinion is obviously ridiculous. He says earlier in the very same blog post:

> \[Swift and Kotlin\] have integrated some functional characteristics. For example, they both have lambdas. This is a good thing, in general. The more we learn about functional programming, the better.

Why is functional programming different from static typing? He provides essentially no justification for this — by his logic, isn't functional programming just a band-aid over programmers making mistakes? For that matter, why use a high-level language at all, if languages aren't the correct place to prevent errors? If only programmers were more careful, we could all just write machine code directly!

This is a consistent part of Martin's ideology — in "[Tools are not the Answer](http://blog.cleancoder.com/uncle-bob/2017/10/04/CodeIsNotTheAnswer.html)", he writes:

> [T]he solution to the software apocalypse is not more tools. The solution is better programming discipline.
> <br>
> \[...\]
> <br>
> And right there, ladies and gentlemen, you can see both the cause of the apocalypse, and the obvious solution.
> <br><br>
> The cause:
> <br>
> <ol>
> <li>Too many programmer take sloppy short-cuts under schedule pressure.</li>
> <li>Too many other programmers think it’s fine, and provide cover.</li>
> </ol>
> <br>
> The obvious solution:
> <ol>
> <li>Raise the level of software discipline and professionalism.</li>
> <li>Never make excuses for sloppy work.</li>
> </ol>

This sort of thinking is pervasive in Martin's writing — he consistently sells TDD and "discipline" as dogmatic solutions to all programming problems, ignoring that better tools help you write better code, even if they are not a wholesale replacement for "discipline". It's easy and comforting to blame individual programmers for bad code. But if you're actually interested in making software better, then you should realize that being careful and using tools that prevent mistakes are not mutually exclusive — using tools that prevent mistakes frees up your mental energy to focus on preventing higher level errors, rather than worrying about null pointer exceptions and double-frees.

### Types

Given that Martin talks so much about why tests are superior to types, he doesn't seem to have a good understanding of what type systems actually do. For instance, he writes:

> [Thus, the testing burden is independent of typing.  The number of tests you write and execute is unaffected by the type system of your language.](https://twitter.com/unclebobmartin/status/1135894377329508355)

Which Shriram Krishnamurthi provides an [excellent response to](https://twitter.com/ShriramKMurthi/status/1136411753590472707), explaining why this is factually incorrect:

> A sound type system literally precludes certain behaviors, so the set of tests you write when they are precluded not only can be different, in the extreme, it must be (e.g., you can't write that ill-typed test).
> <br><br>\[...\]<br><br>
> As others have also pointed, parametricity is a case in point. If I have a language with relational parametricity, a parametric type (e.g., forall T . <something involving type T>) is a universal quantifier with a strong guarantee about ALL T. I don't need to test them all. 
> <br>
> Curiously, there's *value* to doing so at multiple types for T, because it provides explanatory power to the reader reading the tests to understand the function (e.g., in docs). In fact, @PyretLang's test-based type inference infers quantifiers from such polymorphic uses!
> <br><br>\[...\]<br><br>
> Let me move on to a more interesting case. Suppose you're writing a device driver, packet filter, etc. One thing you care about deeply is termination. So one of the things you'd like to test for is termination.
> <br>
> Termination is fun: runs exactly into proof-vs-testability, as in the original thread. You can't prove it always terminates. You can only run several tests and make sure they all did. You need a timeout. That only says "didn't terminate quickly". May have done so a bit later.
> <br>
> Except, of course, that I'm lying and set you up. The HP is undecidable *for a certain language*. You can easily solve the HP if you change the language. One of my fun puzzles in a model checking class is to encode the HP and show that it appears trivially decidable. WAT.
> <br>
> So let's bring this back to types. One of the canonical languages of study in PL is the Simply-Typed Lambda Calculus (STLC). And the STLC has this glorious property that every program in it is guaranteed to terminate. It enjoys that property *because of the type system*.
> <br>
> This is a rather awesome result. You can have a pretty powerful language, EVEN with full-fledged lambdas, and no matter what you do, you can't make it go into an infinite loop.
> <br><br>\[...\]<br><br>
> At any rate, I believe this constitutes a definitive refutation: "The number of tests you write and execute is [most certainly affected] by the type system of your language.

This, of course, doesn't stop Martin from [making the same claim later](https://twitter.com/unclebobmartin/status/1204089346141216768).

This sort of sloppiness is extremely common for Martin — in [another tweet thread](https://twitter.com/hillelogram/status/1137126800914550785), he fundamentally misunderstands what the halting problem is, and how it relates to provability.

### Testing

Since Martin appears to believe that testing and discipline are the primary ways that we should seek to improve software quality, let's look at his thoughts on testing:

> [If you can write production code that covers all cases then you can write tests that cover all cases.](https://twitter.com/unclebobmartin/status/1135508568323629057)

This is trivially incorrect: if you write code that can generate an infinite output, then you will not be able to test all of the outputs. Martin [responds](https://twitter.com/unclebobmartin/status/1135592854171082752) to this by saying that it doesn't matter, since we work on finite state machines, not infinite state machines, completely ignoring the real-world impractically of testing large input sets. If you want to test multiplying two 64-bit numbers[^2], and each test takes 1 nanosecond, you'll be waiting 10²² years for an answer (that's around 1 sextillion years). Personally, most of the programs that I write tests for are more complicated than multiplying two 64 bit numbers, so I need some more powerful tools than just testing every case that my code will ever see. If you're interested in actually learning tools that will help you test large and complicated systems, consider using property-based testing and generative testing in addition to unit testing.

# The Politics

While Martin advocates for a small, dogmatic, and incorrect set of technical ideas for making code better, that's not why most people are upset with him — it's far more common for people to be upset about his views on race and gender, and particularly the way that someone in a position of power expressing those views hurts people in the communities that he's a part of. Let's take a quick tour of some of these views.

### Presidential Politics

Martin [tweeted a quote from Trump](https://twitter.com/unclebobmartin/status/1279392044163780609), [voted for Trump](https://twitter.com/unclebobmartin/status/1008689152878108674), and has said that there's "[plenty to agree with](https://twitter.com/unclebobmartin/status/1037672852294721536)" in Trump's policies.

### Gender

Martin has a long, well known history of making sexist remarks in talks at conferences and in blog posts. He made sexist remarks during his [2009 RailsConf keynote](https://twitter.com/sarahmei/status/895327923346984960). He later [said that he "misspoke"](https://twitter.com/sarahmei/status/895335200854384641), but [didn't remove the bit from his talk](https://twitter.com/sarahmei/status/895335422821228544). in 2012, he [apologized](https://gist.github.com/unclebob/2508746) for making more sexist comments, but his apology for those remarks didn't stop him from writing [a blog post](https://meaganwaller.com/framework-whipped/) with multiple sexist metaphors about female secretaries, harems, and concubines. He [apologized](https://gist.github.com/unclebob/2abcce451bafeab421f2), but that hasn't stopped him from [defending James Damore](http://blog.cleancoder.com/uncle-bob/2017/08/09/ThoughtPolice.html). He has a long history of making sexist comments, apologizing for them, then doing the exact same things again and again.

### Race

Martin says that he's "[disgusted](https://twitter.com/Grady_Booch/status/1282116356381437952/photo/2)" by the NFL players who didn't stand during the national anthem and that they should be fired (he's [against cancel culture](https://twitter.com/unclebobmartin/status/1279771445963321345) though, and thinks that it's "evil" to get people fired for debate). He also writes that police [do not target people of color](https://twitter.com/Grady_Booch/status/1282116356381437952/photo/1), and that the United States was not founded on slavery.

# Conclusion

I continue to be baffled as to why so many people follow and respect Robert Martin. His technical opinions are dogmatic and frequently incorrect, and he has been consistently sexist and an apologist for racism and authoritarianism. If you respect and follow Martin's work, I think it's worth evaluating why that is, and I hope that this post will help you in doing so.

I trust that Martin will be [unoffended](https://blog.cleancoder.com/uncle-bob/2018/12/16/unoffended.html) by this post.

---

<br>

*Thanks to Hillel Wayne, Dan Luu, and one or more people who would prefer to remain anonymous for sources/comments/feedback/discussion about this post*


[^1]: I have not read *Clean Code*, but based on excerpts and reviews from people I trust, I don't really feel that I need to. I've read enough clearly bad advice from direct quotes from it that I don't particularly want to spend my time reading the whole thing.

[^2]: If you think that this sort of test is impractical and the sort of thing no one would do, consider that CPU manufacturers regularly write tests for this sort of behaviour, and [pay significantly when they get it wrong](https://en.wikipedia.org/wiki/Pentium_FDIV_bug).
