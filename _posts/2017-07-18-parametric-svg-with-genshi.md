---
layout: post
title: "Parametric SVG with Genshi"
description: "Using Python + Genshi to generate parametric SVG files for lasercutting"
tags: [software]
---

Parametric CAD (Computer Aided Design) is designing 3d models with various parameters that can be tweaked without having to redesign an entire model. This is very convenient, especially for 3d printing, and there are many tools that allow parametric 3d modeling ([OpenSCAD](http://www.openscad.org/), [FreeCAD](https://www.freecadweb.org/), and some proprietary tools). However, 2d parametric CAD tools (for laser cutting, CNC routing, etc) are much harder to come by. This post is about how I set up a parametric SVG system for generating parts for a laser cutter.

There exist [various](https://github.com/t-oster/VisiCut/wiki/Parametric-SVG) [parametric](http://www.schepers.cc/w3c/svg/params/ref.html) [svg](http://parametric-svg.js.org/) implementations, but none of them fit my criteria:

* Support a standalone tool to output a svg with new parameters (no web browser/etc).
* Has support for mathematical functions like sine, cosine, etc.
* Be relatively easy to use

So instead, I decided to roll my own. I'm using [Genshi](https://genshi.edgewall.org/) with a simple python script to edit parameters. Here's an example of what this looks like:

```svg
<?xml version="1.0"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" xmlns:py="http://genshi.edgewall.org/" width="100" height="100">
  <circle cx="50" cy="50" r="${radius}" stroke="black" stroke-width="1" fill="none" />
</svg>
```

That just makes a circle with a user-definable radius.

Here's an example of a real application of this technique being used to generate a model of a [quadrature encoder](https://en.wikipedia.org/wiki/Rotary_encoder):

<img src="../assets/psvg/encoder.svg" alt="A parametric Quadrature Encoder">

And by changing just a few lines of code, I can get this:

<img src="../assets/psvg/encoder32.svg" alt="A parametric Quadrature Encoder with more resolution">

The code for this is [on github](https://github.com/WesleyAC/toybox/blob/master/pcad/encoder.svg?short_path=ffab2e8), if you want to make some encoders yourself :)

Overall, I've been quite happy with the technique of using Genshi to generate parametric SVG files - it's very low overhead, and I have access to all of python, should I want it.

