---
layout: post
title: "What I learned from 4 years of high school robotics"
description: "Technical and social lessons from 4 years of building robots"
tags: [robotics, learning]
---

Today[^1], the FIRST Robotics Competition game for 2018 was unveiled. But this time, for the first time in four years, I won't be spending this entire weekend strategizing and analysing and designing. Throughout high school, robotics was a significant part of my life, so I figure now's a good time to look back and see what I've learned from that experience.

FIRST Robotics Competition (FRC) is a program in which high school students spend 6 weeks designing, building, and programming a robot to compete in a game (which is different every year). During high school, I was on FRC team #1678, Citrus Circuits. We were quite competitive (winning the world championship in 2015), which I think gave me an interesting perspective on things - we had a clear goal, and a process that was very effective at meeting it.

Here's some takeaways from my time on the team:

## You can do a lot!

I mean this both in aggregate (it's amazing that a group of ~40 high schools students can build a fully functioning, competitive robot in 6 weeks) and on an individual level (I think that I personally made significant contributions to the team). One of the main things that I learned from my time on 1678 is that you can get a lot done if you really focus on something.

## Process is important

If there's one thing to take away from Citrus Circuits as an organization, it's that having a well-defined process is vital. The main reason that we were consistently successful was because we were building a process that results in creating world-class robots. There's pretty much two steps to creating a process like this:

1. Do whatever process you have
2. Figure out what went wrong and change your process to make that better
3. Goto 1

The specifics of our process don't matter that much - there aren't that many people who care about designing robots in the weird constraints of the rules of FRC, but understanding that our long term goal wasn't producing world-class robots, but producing a process to create world-class robots is incredibly important.

## Thinking about what you do before you do it is essentially always worth it

It's honestly amazing the amount of time that can be saved by thinking about what you're going to do before you do it. If the project you're going to work on is going to take more than a day, it's almost always worth it to spend at least three or four hours (or frequently more) thinking about the problem you're trying to solve and it's solutions before you start working. A ridiculous amount of our competitive advantage on 1678 came from putting in a lot of thought before we did anything - the first day of our build season is exclusively for deciding exactly what strategy we want to take and what our robot has to be capable of, and the entire second day (plus part of the third day) is dedicated to brainstorming possible designs. This carried over past the first few days as well - the amount of benefit you get for your time is vastly higher when you are brainstorming than when you're implementing a solution.

## Data is important for making decisions

In order to be able to make good decisions, you essentially need two things:

1. A goal
2. Data about how well you're meeting that goal

The trick here is that after you make any change, you look at the data and see if it made an improvement in how well you're meeting your goal. If it doesn't make an improvement, then either change your decision, or change your goal.

This is pretty simple, but it's remarkable the number of people who don't have a way to measure how well they're meeting their goals, but still think that they can make good decisions.

I've found this to be applicable for decisions of pretty much all sizes.

## Being able to introspect the systems you're working on is really useful

One of the projects that I worked on was creating a logging system for our robot. It automatically logged everything going through our message queues to CSVs, which we could then pull off the robot to analyze. It's amazing how much having this feature changed my development process - having all the data about the values flowing through the system for any given run of the code made it significantly easier to make hypotheses about what was happening and visualize what effect our changes were having.

I think that this is a pretty common trend - once you get up to a certain size of problem, you can only really make progress by designing tools to reason about your problem. For example, check out the [tools that google has available to debug performance issues](http://www.pdl.cmu.edu/SDI/2015/slides/DatacenterComputers.pdf). In order to be able to reason about large systems, you need to be able to see all the data you can about them, and often that means building new tools.

## Steal from the best, invent the rest (but not too much!)

"Steal from the best, invent the rest" is a common saying on our team. In general, this is good advice, and was a large part of our success as a team. There's a lot of stuff out there! However, it's important to think about whether the thing that you're stealing is actually designed to solve the problem that you're facing - we often didn't do this as well as we should have, which resulted in wasted time and effort.

One place where we shamelessly "stole from the best" is in reveal videos - it's common for teams to make videos showing off their robots once the first part of the build season is over[^2]. As soon as these come out, we mercilessly scour them for good ideas and mechanisms, sometimes even going frame by frame to get all the details of a particularly interesting or applicable mechanism. In 2013, every part of our robot except for the drivetrain had changed from our first competition to our last, largely from seeing other teams' solutions to the problems that we were struggling with.

However, it's easy to go to far with this - seeing a mechanism and copying it exactly, without thinking about why it was designed like that.

There are many analogs to this in the software world as well - there's a wealth of existing software out there, and using it is often the best solution. However, as with anything else, you need to analyze the tradeoffs of the things you're using. For example, using a tool like [Bazel](https://bazel.build/) makes sense for large companies like Google, but is it the right tradeoff for your situation?

## Most topics are very deep

The vast majority of topics are very deep, in that it's possible to spend years becoming an expert in that specific topic. Don't think that just because you've been doing something for a while, or you have a good solution for something, you're an expert in that space. There's always more you can learn!

## When social problems block technical excellence, fix the social problems

There were a few times where I had the experience of wanting to make a technical change that there was consensus was a good idea on the programming team, but we knew would have resulted in pushback from leadership higher up.

In these situations, the solution was almost always to talk to all the people involved about the problem at hand, the goal, and the possible solutions. When you do this, one of three things will happen:

1. You disagree about what the goal is
2. You disagree about what the best solution is
3. You come to agree on what the goal is and what the ideal solution is

If it's one of the first two results, then you have the option of either a.) talking more until you agree on whatever the disagreement was or b.) deciding that the thing that you're arguing about isn't worth the time, and agreeing to disagree. Either way, you've learned more about where the other person was coming from and what their reasoning was.

I understand that this approach is somewhat naive, but I think it works far more often than people give it credit for.

## Blameless culture is important

If someone screws up, it's your process's fault for enabling their screwing up. This was something that I was pretty bad at acknowledging initially, but I now believe pretty strongly.

If nothing else, it makes sense from a business standpoint - if your fix for someone screwing up is to teach them to not screw up, you lose that as soon as they leave. If you institutionalize a way to catch mistakes of the kind that they made, you stop it from being a problem in the future, forever.

Looking back on my time on Citrus Circuits, the number of failures that we had before we decided to implement code review was staggering - most of the time, when something went wrong, the response was "person X shouldn't have done that stupid thing. In the future, we'll stop doing stupid things, and everything will work out well." Luckily, by the end of my time there that mostly changed to "person X checked in some broken code. How can we add more linting/tests/documentation/code review so that things like this can't get checked in in the future?" We weren't entirely there, but we were getting much better at this by the time I left.

## Scaling communication is hard

With a group of two or three people working together, you essentially don't need any formal methods to keep everyone on the same page. With more people, you start to need more process for allocating people and for communicating. The friction in this process lowers the productivity of everyone involved (but cannot, AFACT, be escaped). This results in a funny effect where adding one or two people to a ~3 person team can have net zero or negative effect on team productivity.

A related phenomenon comes up when organizing events or groups of people - under a certain scale, it's easiest for one person to just manage everything themselves. This has the advantage that if the person managing the event is competent, it usually goes quite smoothly. However, this presents two problems:

1. Should someone else need to take over the job of organizing, there's often a lot of "tribal knowledge" that needs to be passed on.
2. Once you hit an event that is over the threshold that one person can manage, you need both a much larger group of people and an entirely different set of skills to do well.

I don't have solutions to any of this, but it's an interesting phenomenon that I've noticed.

[^1]: Actually more than a week ago now, since I wrote this a while ago.
[^2]: These videos are frequently [really](https://www.youtube.com/watch?v=LaV0zbKz-Qg) [cool](https://www.youtube.com/watch?v=x6CtdZ91qzI)
