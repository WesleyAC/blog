---
layout: post
title: "The two questions I ask every interviewer"
description: "Applying the engineering process to software interviews"
tags: [hiring, bestof]
---

I've been going through the software engineering interview rigmarole recently, and there have been two questions that I've started asking at every interview, but have yet to get a good answer to:

> What is your goal when interviewing a candidate?

> How do you evaluate how well you're meeting that goal?

# What's your goal when interviewing a candidate?

I've heard "Hmm, I don't actually know what it is that we're looking for" from a few recruiters, but they're a minority - I think most people fall into one of a few categories:

1. Find "[The Best™](https://danluu.com/programmer-moneyball/)" people
2. Figure out if a candidate is a "[good fit](http://www.paperplanes.de/2015/6/11/why-hiring-for-culture-fit-hurts-your-culture.html)" for the company
3. Evaluate how well a candidate could do the job that they're interviewing for (this is quite rare[^1])

I think that less than 10% of the companies that I've interviewed with have said that their interview process was designed to evaluate how effectively someone could do the job that they're being hired for.

This seems ridiculous to me - both hiring "the best" and hiring based on "fit" are strategies that filter more based on the biases of the interviewers than on the ability of the candidate.

If you see evaluating the candidate's ability to do the job as the ideal for an interview, this also reveals many of the things that are wrong with tech interviews at the moment - I've never had an interview that tried to evaluate my ability to work in a team or prioritize tasks - both of which are probably [more important](http://arches.io/2016/01/hire-literally-anyone/) to doing well in a software engineering job than being able to find anagrams in O(n) time.

# How do you evaluate how well you're meeting your goal?

The majority of the companies that I ask this to essentially answer "we don't" to this question[^2].

If you were optimizing a program, and your metric for success was "I dunno, I made some changes and it seems better," you'd get laughed out of the room - and yet we accept this from hiring processes. For all the lip service people give to the team being the most important part of founding a startup, the majority of companies seem to ignore their hiring process, and almost no one is applying the engineering process to hiring.

The first step in this is to evaluate your current employees - are your best performing employees the ones that did the best in the interview process? If not, why is that? Most companies do performance reviews, and most companies keep data about interviews, but very few of the companies that I've talked to put them together to try to improve their interview process.

Doing this is better than nothing, but it still ignores half of the equation: what about all of the people you *aren't* hiring?

People often brush this away by saying that it's [less risky to reject a good candidate than it is to hire a bad candidate](https://www.joelonsoftware.com/2006/10/25/the-guerrilla-guide-to-interviewing-version-30/), but I don't think that this makes sense. I regularly hear that top companies are "starving" for talented developers, and that it's almost impossible to find talented developers who are on the job market, but these same companies are turning away droves of people because they didn't go to the right school or they weren't able to reverse a linked list on a whiteboard fast enough. Even if you think that it's less risky to reduce the (already small) pool of people who you're hiring from than it is to risk hiring the wrong person, you should at least be sure that you're _looking in the right pool in the first place_.

This is a really hard problem - if you'd had information that would have changed your mind about a candidate, then you'd have hired them in the first place. Despite this, there are a few things that can be done to alleviate this problem:

### Give your interview to current employees

If you want to make a change to your interview process, give it to some of your current employees first. If anyone fails it, ask yourself if that person should be fired. The answer is probably no.

I've heard of a couple companies that do this, but I think that the vast majority of companies don't.

### Make a "validation set"

One approach to determining if your current strategy is working or not is to take a more in depth look at some of the candidates that you reject, and decide if rejecting them was the right decision.

<center>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I&#39;ve been twitter following the careers of people we interviewed but passed on at my last gig.<br><br>Turns out we were almost always wrong.</p>&mdash; Pulltergeist (@trek) <a href="https://twitter.com/trek/status/692116840940716032?ref_src=twsrc%5Etfw">January 26, 2016</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>

There are a few problems with this:

1. It's biased against people who don't have as public a Github/blog/twitter/etc presence
2. There are so many candidates that [are legitimately bad at programming](https://blog.codinghorror.com/why-cant-programmers-program/), it could take a while to find real problems in the interview process.

Despite these problems though, I think that this can be a good strategy for some companies - particularly if you have a relatively small volume of applicants.

It's definitely doable to do this for onsite interviews. Résumés would be harder to apply this to, just since there tend to be so many unqualified candidates, but I think that this strategy could potentially still be useful.

# Conclusion

Most companies seem to be flying blind when it comes to their interview process. I've found that it's common for recruiters and hiring managers to not know what their processes are looking for, and almost no one is attempting to iterate on their interview processes.

Among the few companies that do focus on evaluating their interview processes, most focus on methods that verify that the people that they are hiring are good, rather than changing the interview to allow talented candidates that were ignored by typical interviews to get through[^3].

If you work on interviewing for your company, I'd love to hear your thoughts on this! And if you're going through interviews at the moment, I highly recommend asking these questions to the companies that you interview with - it's been really enlightening to see how various companies respond to this question.

[^1]: Of ~11 companies that I've asked this to, only one has given a response close to this.

[^2]: I'm counting "Well, we're pretty happy with our employees, so I'd say we're doing pretty well at hiring" as not evaluating how well their hiring process is working.

[^3]: [Matasano](https://sockpuppet.org/blog/2015/03/06/the-hiring-post/) had a lot of success by drawing from pools of talented candidates that were ignored by the traditional interview process.
