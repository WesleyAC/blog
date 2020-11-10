---
layout: post
title: A Conversation on FRP, Databases, and Types
description: ""
---

*This is a transcript of a conversation I had on the [Recurse Center's](https://www.recurse.com/scout/click?t=288aaf8d6ddfba372520ec10690a1e1b) Zulip instance. I thought it was pretty informative, so I'm reproducing it here, lightly edited, with the premission of the participants. There are quite a few comments here, I suggest checking out Iain McCoy, Allie Jones, and Anon #1 if you want the highest-signal parts of the conversation*

**Wesley Aptekar-Cassels:**

So, I've been playing with FRP recently, mostly via [Seed](https://seed-rs.org/) but also looking at React and Vue a bit. It seems like the general pattern is that you have one big state object which is a big bucket that has all the state, and then when you change that, all of the state flows down into the objects/components/whatever and they update. This seems nice and good.

So, common advice is to make your state a single source of truth. If you have types (via rust+wasm or typescript or whatever), you should [design with types](https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/) to make illegal states unrepresentable. For instance, if you have a bunch of menu items, one of which can be selected, you probably want to have a `current_menu_item: Option<MenuItemId>` rather than a `selected` field on each `MenuItem` (to give a Rusty example of the syntax).

This seems all well and good, except for the fact that the idea that what we have as a "single source of truth" is a complete lie: the real single source of truth is the database, in most applications. So, we put all this effort into making a nice data model in our database (as nice as can be expressed in SQL), and then we go and make a bunch of APIs to pull stuff out of our real single source of truth, probably turn it into json and send it to the client, where we then pull it apart and stick it into our client side "single" source of truth (losing and reconstructing all of the type information along the way). This seems like not a very good idea — why do we do this to ourselves?

To look at a concrete example: I have a "directory" hierarchy stored in a SQL database. I want to display this in the client app. I also have a bunch of "files" that can be in the directories. Each file can be in multiple directories (really, the "directories" are tags, not "directories" in the way one would normally think of them). The nice, single-source-of-truth way to handle this is to have a tree of directories, where each directory has a `Vec<FileId>`, and then to have a `HashMap<FileId, File>` for storing the necessary metadata about each file. However, there's a problem here — say you want to, for a given file, find every directory it's in. The SQL database can get this information easily, but that will be slow — why waste the time with another network request when you have all the information you need right there? But the problem is, the information you need to figure this out isn't stored in a way that allows you to very nicely access it — you either have to walk the entire directory tree to figure out which directories have the given file in it, or you have to store an index, something like a `HashMap<FileId, Vec<DirectoryId>>` — in which case you now have multiple sources of truth for which directories a file is in which you have to keep in sync.

Back in ye olde days of 200X, this wasn't a problem — for each page, you'd have a template that the server would fill out with the results of database queries, and send that to the client. But now that client-side code is expected to hold it's own state, we have a split source of truth problem.

The second problem I see with this is types. The server has types that is uses for interacting with objects internally. When stuff is written to the database, all of this type information is thrown away. We then make the type information again when we pull it out of the database (sometimes with slightly different types, if we've done a join, or queried only selected fields or something). Then you'll often do some postprocessing on that that's too complex to do in SQL, serialize it to JSON, send it to the client, which then reconstructs the type information again in order to use it (sometimes implicitly, in the case of javascript frontends). Why bother with this whole charade? If you're using Rust on the client and the server (or s/Rust/Typescript/, probably) you can at least automate the serializing and deserializing parts, but you're still throwing away type information to put things in the database.

FRP (or maybe just the idea of websites being dynamic) seems good to me overall, but it definitely creates a problem that didn't used to exist — a split source of truth and multiple losses and reconstructions of type information.

How do people deal with this in production webapps? And are there good experimental projects to eliminate this complexity? It seems like in many cases, server-side code is just incidental complexity that pops up because there is no good way to directly interface between SQL databases and client side web code.

I guess maybe a clearer way of thinking about this problem is: there are two types of state: backend state (this is the set of objects that exist, etc), and frontend state: (this object is currently selected, this modal window is open, etc). Current approaches to writing web frontends seem to necessitate making a model which mixes together these two things, which seems non-ideal.

**Anon #1:**

> It seems like in many cases, server-side code is just incidental complexity that pops up because there is no good way to directly interface between SQL databases and client side web code.

I mean, yes! Except the complexity also does frustratingly useful things: prevents scrapers from taking down your DB, gives you a place to put biz analytics / monitoring / alerting, provides an API layer where you can decide to change behavior if you need to (see: the problem of supporting legacy clients for years and years), etc.

> I guess maybe a clearer way of thinking about this problem is: there are two types of state: backend state (this is the set of objects that exist, etc), and frontend state: (this object is currently selected, this modal window is open, etc).

I think that this is a good way of looking at different types of state. A lot of modern frontend options (I'm most familiar with React) grew out of a need to manage the sprawling mess that is frontend state -- before React became popular circa mid 2010s, a *lot* of frontend apps wouldn't treat this kind of state in any kind of principled way, and it ended up being a lot of random spaghetti

> Current approaches to writing web frontends seem to necessitate making a model which mixes together these two things, which seems non-ideal.

I think that it's true both that 1) a lot of approaches mix these concerns and 2) mixing them is a PITA.

Some approaches (e.g. Relay + React) let you create magical bits of state that can effectively only be changed by calls to the backend, which....kinda gets around the problem? But not in a really clean / easy to understand way.

Take everything I'm saying with a grain of salt, also, since it's been a few years since I've done any active frontend dev 😄

**Wesley Aptekar-Cassels:**

> I mean, yes! Except the complexity also does frustratingly useful things: prevents scrapers from taking down your DB, gives you a place to put biz analytics / monitoring / alerting, provides an API layer where you can decide to change behavior if you need to (see: the problem of supporting legacy clients for years and years), etc.

Is this true? Like, looking at these individually:

* Scrapers: I don't see how the server/DB separation fundamentally changes this — views of the frontend still require calls to the db. I think that maybe the change here is that scraping modern websites is so monstrously complicated that most companies that aren't Google or Microsoft don't do it anymore?
* Analytics/Monitoring: I have lots of hot takes about this, but — isn't it much more common for people to do analytics these days via Google Analytics/Mixpanel/Heap/whatever than by writing it themselves? I get that there's some server-side stuff you might want to log, but I think you can get most of that just by parsing and saving http logs? IDK why analyzing http logs isn't a more common approach to analytics tbh, it's [much more accurate](https://blog.wesleyac.com/posts/google-analytics) than most other approaches and gives you a ton of flexibility.
* API layer to change behaviour: I agree that this is important, but I don't think that switching to an architecture where you use one format all the way through forces you to stop doing this. It just means that providing legacy support looks like putting a proxy in front of the database that speaks the old format on one side and the new format on the other.

I agree that there are a lot of "proven" solutions to these problems in the current DB <-> server <-> client paradigm, but I don't think that that paradigm fundamentally is the thing that enables those solutions, it seems more like it just happened to evolve that way.

> before React became popular circa mid 2010s, a *lot* of frontend apps wouldn't treat this kind of state in any kind of principled way, and it ended up being a lot of random spaghetti

hah, most of the webapps I've worked on have been jQuery state soup (even [very recently](http://hanabi.site/script.js)). I definitely see that React and React-style frameworks are better than the spaghetti approach the predated it, but it seems like React has inherited plenty of quarks from that model, either for the sake of backwards compatibility, or simply by not examining the problem through a sufficiently novel lens.

> Some approaches (e.g. Relay + React) let you create magical bits of state that can effectively only be changed by calls to the backend, which....kinda gets around the problem? But not in a really clean / easy to understand way.

Interesting - I was wondering when writing this if GraphQL is sort of an attempt to solve this problem, but I haven't seriously looked into it, so I don't really know exactly what parts of this is solves and how well.

> Take everything I'm saying with a grain of salt, also, since it's been a few years since I've done any active frontend dev :smile:

heh, you're probably more up to date than me, the last time I worked on a "real" webapp was like... 2014? With jQuery and bootstrap and PHP and MySQL and all that :)

**[Patrick Weaver](https://www.patrickweaver.net/):**

I don't have any answers, but wanted to note that this made me consider for the first time that the virtual DOM in the frameworks seems to have the goal of only updating the things that changed by creating a state diff, but often that same change is happening to the non-local state, but there's no way to use that diff work that's already been done automatically. It seems like the abstractions aren't abstract enough.

*[I ask for more elaboration]:*

If you have a list with keys `{ 1: banana, 2: grapefruit, 3: pear }` and the user updates the list to be: `{ 1: orange, 2: grapefruit, 3: pear}`, React's VDOM will compare and say we only need to update the value at key 1, but there's no way to take that diff work and send it to the DB without programming something to do the same work either on the client and sending a "manually" computed diff, or sending the whole new list to the DB and diffing again on the server.

**[Jesse Luehrs](https://tozt.net/):**

i'm not super familiar with the details, but my understanding is that this disconnect is one of the things that [https://www.meteor.com/](https://www.meteor.com/) is intended to fix - it uses javascript on both the frontend and backend, and uses a special protocol to allow database operations to be able to happen on either end in the same way while still propagating the results to anything else watching it

i've never used it before, so i don't know how successful it is at being a reasonable thing to use, but it is maybe evidence that your line of thought isn't entirely on the wrong track

**[Iain McCoy](https://github.com/imccoy):**

I have many many thoughts about this. I spent a while trying to build a thing that used an frp-like thing to define the backend state, and then shared that backend state model around so that the frontend could look shiny and ajax-y. This is a thing you can build!

You wind up having a bunch of questions like "how do I control the way this backend state gets persisted" and "which bits of backend state get shared with which frontend" and so on. I didn't get to them, but I'm confident that they are all answerable. There are also questions about how you manage change to a running system, but I think those are answerable too.

The reason I stopped is that my main motivation was to pursue a single purely-functional representation of backend state, because I thought that would make things easier to reason about. And like... It kind of does? But in the model I had there was a single function from Inputs to State, and any given input could ultimately influence any bit of the state, and that got confusing in something very like the way I was trying to escape from. So now I think the right way to arrange the backend state is with some sort of type discipline that constrains the domain of inputs (and/or intermediate values) that can affect each bit of state.

You probably still end up with at least two sets of types: the backend state ones and the frontend ones. But I think we could be clearer about "our application has entity A and entity B and they are related in way R and these two types are representations of A and these two types are representations of B and these are the two ways R shows up"

In most systems I've worked on, there is a version of that sentence, but I'd like it to be a sentence the computer understands and not just the people working on it

And then you might be in a place to tell the computer that the front-end types are faster to access, but also less authoritative, then the backend types, and to talk about when to use one and when to use the other and when to do a fast check followed by an authoritative check and how to assert that the fast check is the same as the authoritative one.

**Wesley Aptekar-Cassels:**

**@Iain McCoy** That's super interesting to hear! Did you deal with persisting the backend state to disk at all, or was this all in-memory?

> You probably still end up with at least two sets of types: the backend state ones and the frontend ones. But I think we could be clearer about "our application has entity A and entity B and they are related in way R and these two types are representations of A and these two types are representations of B and these are the two ways R shows up"

I'm curious why you think that this is the split that makes sense — personally, I'm inclined to think that the taxonomy of types you want is a bit more subtle than "backend" and "frontend", but I couldn't tell you exactly how... I think this is also related to thoughts I have about how it should be easier to use an ad-hoc subset of an enum or a struct as a type — I think that would solve a lot of problems...

**[Iain McCoy](https://github.com/imccoy):**

My hunch is that the backend types want to be sort of flat, for slicing and dicing in various ways (posts belong equally to message boards and users), but the frontend types want to be hierarchical in ways that make sense for the view at hand. I definitely think there would be other splits emerge over time too! You might have "record as persisted" vs "record in memory" vs "record on the wire". You might have "record as persisted in a previous version" vs "record as persisted in current version". You might have "record as seen by owner" and "record as seen by guest".

I 100% agree about struct and enums. I kind of think that enum cases should be names for particular record types, so you can always write a function that takes the payload of some data constructor

**Wesley Aptekar-Cassels:**

There's [work happening](https://github.com/rust-lang/rfcs/pull/2593) in rust to make enum variants usable as types, which is I think what you're suggesting? But even beyond that, more flexibility in how types are declared seems really useful.

**Anon #2:**

> And are there good experimental projects to eliminate this complexity? It seems like in many cases, server-side code is just incidental complexity that pops up because there is no good way to directly interface between SQL databases and client side web code.

I have always meant to experiment with [PostgREST](http://postgrest.org/en/v7.0.0/) to try and find the limits of the problem you're describing.

**Akiva Leffert:**

I haven't really used them, but I think these are the things that [graphql](https://graphql.org/) and [apollo](https://www.apollographql.com/) are meant to solve. also stuff like firebase which does automatic model syncs between front end and data store. but I've definitely ended up in a fair number of cases where how the front end wanted to think about data and how the backend wanted to think about it were only loosely related and any sort of system here needs a fair amount of extensibility for those cases

**[Allie Jones](https://alliejon.es/):**

One thing that impacts this problem that I don't think has been mentioned yet is FE application performance. The limitations on a client/in the browser, and the cost of communicating between client and server, are pretty different from those between a database and backend code. For a fast frontend UI you want just the slice of multiple entities' data that helps you accomplish a specific task (or sometimes I think about it as just what you need for a single application "screen"). You could probably do this data filtering/reformatting directly with database queries, but I think in practice I at least would want more abstraction than (my knowledge of) SQL provides. Doing it on the client would get unusably slow as soon as things got complex, and waste a lot of bandwidth.

I've used Apollo and GraphQL, and I agree that they are an attempt to solve some aspects of this problem, but in the real-world implementations I've seen a lot of backend glue code translating between the client and the database still has to exist. It might not be the "less layers of abstraction" solution Wesley is looking for. :) When you're using JS on the client you can query your data in a way that matches the abstraction of the database, but you just get an untyped blob of JS primitives in response.

I've never used it, but Apollo does have a feature to generate Typescript types for your GraphQL queries which seems pretty interesting. (I was looking at [https://www.apollographql.com/docs/react/development-testing/static-typing/](https://www.apollographql.com/docs/react/development-testing/static-typing/) out of curiosity.)

**Wesley Aptekar-Cassels:**

**@Allie Jones** Thanks for the thoughts! I think that:

> For a fast frontend UI you want just the slice of multiple entities' data that helps you accomplish a specific task (or sometimes I think about it as just what you need for a single application "screen")

Is a really good way of thinking about it, and my question is sort of "how do you reconcile wanting a frontend that does very little computation and just displays what the server tells it to" with "try to have a single source of truth" — especially given that sometimes, the frontend will have to do computation to avoid network latency (for instance, filtering a list of results for a search term that the user is typing in live, like @-completion in zulip, etc)

> Doing it on the client would get unusably slow as soon as things got complex, and waste a lot of bandwidth.

I think that as is becomes safe/common to deploy webassembly in production (currently it's at 93% browser support, only 2 percentage points less than CSS grid), this may change — it doesn't change the bandwidth part of your concern, but it does mean that the way to get "fast" web apps may shift from doing computation quickly on the server side and then suffering network latency to sending a lot of data to the client and then doing more computation there, enabling really low latency for user interaction. This also makes sense with how compute resources have changed, it's pretty standard now for a big webapp like gmail to take a few hundred megabytes of RAM. If you're going to be using that much ram, might as well get a lot of speed out of it by prefetching a bunch of data so you can display it to the user faster. In fact, it seems like apps like this could probably actually use less bandwidth, if they're written in a way to make caching and saving to localstorage easier (using content-addressable storage more, for instance). As many native apps demonstrate, modern consumer computers do tend to have enough compute capacity to make fast apps, even if javascript can't necessarily access it :)

**[Allie Jones](https://alliejon.es/):**

I'm getting away from your question here, and I don't want to derail too much, but at least for my work-work (on a high-traffic, somewhat international e-commerce site) our web applications have to accommodate lower-powered mobile devices and mobile internet connections, and in that environment there's still a pretty steep cost to having a lot of client JS. But that's a practical limitation and something that will almost certainly improve over time.

Re: web applications as distributed systems, [PouchDB](https://pouchdb.com/) doesn't address types but it does lean into that idea by keeping all of your data on-client and then syncing with the server when you're online.

**[Donny Winston](https://donnywinston.com/):**

I used Meteor circa 2014 as a way to harmonize front- and back-end state as one database that stored data exactly as the front-end expected it, which is to say, untyped JSON. The development experience was a pleasure given this constraint. The database was a set of JSON-document collections via MongoDB. Through websockets and an authentication-respecting pub/sub protocol, the subset of your database that the front-end needed at any given time was synced to the client, and I used a built-in “minimongo” browser JS library that quacked like the backend MongoDB server library. So, that was the solution at the time — ditch SQL (or use it as a system of record that syncs with your application’s MongoDB via periodic ETL?) in order to achieve the kind of harmony you articulated.

**[Vaibhav Sagar](https://vaibhavsagar.com/):**

Backend FRP in particular is something my previous company is working on. The approach they are taking involves writing your backend logic in a way that is agnostic to the order of events (i.e. if you receive events out of order it should still do the right thing) over a view of the database (Postgres in their case), and then they parse the write-ahead log and send events accordingly. It's a really cool problem but much much harder than they expected. My old boss actually [gave a talk](https://zfoh.ch/zurihac2019/#speaker-ryan-trinkle) on it when he thought it was ready but then it turned out that it wasn't anywhere close (sadly the video was lost). I kept trying to get him to look at Frank McSherry's dataflow stuff because it seemed like it was relevant but he was convinced he already knew everything he needed to know. Maybe **@[NAME REDACTED]** can provide more insight on how that is going.

**[Joe Ardent](http://wwn.nebcorp.com/):**

I wonder if you can square this circle by shifting your frame, and breaking your truth into different components (reading back through the thread I see that I'm about to just restate/formulate what **@Iain McCoy** already said, but I'll go on anyway). Like Ian said, there are backend types and frontend types, and the frontend state could be less "a source of truth" and more "a correct statement about the current state of things".

and so the front end state is, again like Ian said with "in memory" or "on the wire" or "committed to the backend truth-source", information to the user about what's going on with what they've done and how it impacts the future history of your interaction

(this is all in the context of a web application, but I suppose it also applies to other software that is not "local first" primarily)

**Wesley Aptekar-Cassels:**

Related blog post: [https://macwright.com/2020/05/10/spa-fatigue.html](https://macwright.com/2020/05/10/spa-fatigue.html)

> The dream of APIs is that you have generic, flexible endpoints upon which you can build any web application. That idea breaks down pretty fast.

> Most interactive web applications start to triangulate on “one query per page.” API calls being generic or reusable never seems to persist as a value in infrastructure. This is because a large portion of web applications are, at their core, query & transformation interfaces on top of databases. The hardest performance problems they tend to have are query problems and transfer problems.

<hr>

This is something that I've been thinking about for a while, and I expect I'll think about for a while longer, but I'm curious to see what other answers people have to these questions.
