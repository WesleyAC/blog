---
layout: post
title: "web3 is Centralized"
description: ""
---

I've long been interested in the decentralization of computing and communication in general, and of the web in particular. The trend of communication and information becoming more and more centralized in large corporations is worrying and worth fighting against, particularly from the perspective of systemic risk. I think it even makes sense in many cases to [trade efficiency for resilience, by way of decentralization](https://notebook.wesleyac.com/efficiency-resiliency/). How does "web3" do on these axes?

The funny thing is, web3, as it exists today and appears to be building towards, is actually more centralized than the web it seeks to replace.

One of the main claims that blockchains tend to make is that they're decentralized, but "decentralization" is not a single axis — while anyone can join the Ethereum or Bitcoin network, you can only join if you agree to follow the same protocol that all the other nodes use. If you spin up an Ethereum node, but set the block reward to something the network doesn't agree on, you're not going to get very far. The [way this protocol is decided on](https://github.com/ethereum/pm) is not exactly centralized, but it's not exactly decentralized either. The entire blockchain world is focused on building systems for global consensus, but global consensus is a goal that is fundamentally at odds with the goal of decentralization.

Contrast this to the web as it exists — anyone can join, and they can speak whatever protocol they want. If you want to make changes to the protocol, you can do so unilaterally, although clients are unlikely to support your changes unless you put in significant work. It's trivial to spin up your own private network — in fact, you probably *have* your own private network already in the form of your home router.

Ethereum is only decentralized in the way that doesn't matter — you're free to join the decentralized system, under the condition that you act in the exact same way as every other actor in that system.

Let's bring it back around to systemic risk, though — after all, the reason that I care about decentralization is primarily to avoid global failures. Ethereum is significantly worse in this regard than the web is — if I run my own web servers (as I do, for most of my projects), I'm relatively insulated from global failures — I'm largely in control of how the system that I run operates, and the costs and risks are simple to understand. The main global risk is [BGP](https://en.wikipedia.org/wiki/Border_Gateway_Protocol), but in practice, this has mostly lead to country or provider level failures, rather than truly global ones.

Contrast this to Ethereum or other blockchains, where by building on the platform, you're inherently exposing yourself to risk that your costs of doing business or transaction times might dramatically increase due to volatility in the cryptoasset market unrelated to you. This isn't a hypothetical issue, either — [NFT crazes can easily bring the rest of the Ethereum network screeching to a halt](https://stockhead.com.au/cryptocurrency/covidpunks-sell-out-clogging-ethereum-network-and-costing-users-thousands-in-gas-fees/). If you're trying to run a DAO, why build it on Ethereum, where people getting excited about buying stolen pixel art avatars can destroy your ability to make governance decisions?

This is even ignoring things like [OpenSea hosting NFT images on GCP (a centralized platform that is happy to honor DMCA takedowns)](https://twitter.com/emilylorange/status/1473846337640689664), or DAOs running their communities on Discord. Those show how little the people building this stuff actually care about decentralization, but those are choices that can be fixed with time. It's much more damning to me that the fundamental technology these people choose — Ethereum and similar blockchains — is more centralized than the web.

The reason people build on these fundamentally centralized technologies is actually pretty obvious: the vast majority of DAOs and other web3 projects are transparently cash grabs, and it's way easer to take people's money in the form of ETH than by starting your own chain.

But if you actually care about decentralization, using a distributed ledger owned and operated by a diverse set of actors could be reasonable! But sharing that ledger with hundreds of thousands of other users who have completely different incentives and the ability to unilaterally and arbitrarily increase your transaction costs doesn't seem reasonable.

If web3 people cared about decentralization, then starting a private ledger should be as easy as starting a private IP network, or even easier.

I'm sure I'll get plenty of people complaining that web3 doesn't mean Ethereum, and that there are lots of web3 projects based on other technology. This is true, but everything I've seen under the banner of web3 has this same problem: it's decentralized in that many people can join the network, but not decentralized in that people can't easily spin up their own networks that are separate from other peoples'. Compare that to the web, where millions of entities run their own networks that are fundamentally independent, in some cases federating with each other, while in others remaining completely private and independent.

The problem here is the profit motive: people who are working on web3 generally want to get paid for it, but it's fundamentally harder to extract rent from truly decentralized systems than it is from centralized ones. Because of that, people end up building systems that are centralized at their core, with some aesthetics of decentralization smeared on top, and call it web3.
