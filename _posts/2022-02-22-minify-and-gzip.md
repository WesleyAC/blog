---
layout: post
title: "Minify and Gzip"
description: ""
---

I've been doing a bit of work cleaning up the CSS on this blog in the past couple days — the CSS is from a template that I copied more than five years ago at this point, and it was pretty crufty even when I first got it.

When I was poking around, I noticed that I had two separate media queries to check if the browser width was something that looked like a mobile device. This makes the CSS nicer to read, since the overrides can be right next to the things they're overriding, but it also makes the resulting CSS slightly larger. I minify my CSS using [tdewolff/minify](https://github.com/tdewolff/minify) during the build, so I checked to see if it would collapse the two media query blocks into one. Doing so would be a somewhat complicated optimization, since the order that CSS rules are defined in can sometimes matter, but it wouldn't be too tricky. I made a quick test file:

```css
.foo {
	color: red;
}

@media all and (max-width: 767px) {
	.foo {
		color: blue;
	}
}

.bar {
	color: green;
}

@media all and (max-width: 767px) {
	.bar {
		color: blue;
	}
}
```

And checked what it minified to on the latest release:

```css
.foo{color:red}@media all and (max-width:767px){.foo{color:blue}}.bar{color:green}@media all and (max-width:767px){.bar{color:blue}}
```

Two media queries — how inefficient!

But then I thought to check — my website is served using gzip compression, so I shouldn't be checking the size of the minified file, I should instead be checking the size of the minified *and gzipped* file. The gzipped file that minify generated was 107 bytes, and when I applied my "optimization", it grew to 115 bytes. Huh.

However, compression is an area where the efficiency can vary wildly depending on filesize. I figured it might just be that the sample file wasn't large enough to have much structure for gzip to exploit in the first place. As a second test, I grabbed the CSS file for my blog, which weighed in at 1858 bytes gzipped, applied the optimization to it, and got… 1864 bytes.

This is a pretty common thing if you try to do a lot of filesize micro-optimization on the web — there are built-in ways to make code smaller that are designed for humans to use to make code more understandable, but those tools are often less efficient that letting gzip (or brotli, or whatever other compression you use) operate directly on the larger version. If you care about reducing the size of the network transfer, you need to *actually measure the network transfer*, and not anything else.

This same principle holds true for any sort of optimization work — if you measure a proxy for what you want to optimize, you need to be sure that the proxy actually correctly correlates with the thing you're trying to optimize! And once you've been bitten by this problem enough times, you end up realizing that it's often less work and pain to just measure the thing you care about directly.

To my knowledge there aren't any minifiers that operate with awareness of what compression algorithm the final file will be served with — I think that'd be a interesting area to explore. It's unlikely to actually be "worth it" in any reasonable cost/benefit analysis, but hey, I don't micro-optimize my personal websites because there's any benefit to it, I really just do it for the principle of the thing.
