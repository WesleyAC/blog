# TODO

* Audit img alt tags
* Stop using Jekyll
* Migrate from SASS to CSS
* Stop using post_url
* Implement sandboxing for control experiments without IDs in includes
* Audit for unnecessary external JS
* Switch away from Google Fonts
* Switch away from Google Analytics

# Notes on switching away from Jekyll

## Generating

Generating the blog has a few steps:

* Generate files from templates
    * feed.xml
    * index.html
* Generate posts
* Copy unchanged files/dirs
    * 404.html
    * CNAME
    * favicon.ico
    * resume.pdf
    * robots.txt
    * img/
* Minify/generate CSS
* Generate tags

## Tools

* [pandoc](https://pandoc.org/) supports all the markdown features I need
* [minify](https://github.com/tdewolff/minify) seems like a reasonable minifier

## Complex posts

### All templates (include + post_url)

* `2017-10-04-elliptic-curves.md`
* `2016-12-20-intro-to-control-part-one-pid.md`
* `2016-12-30-intro-to-control-part-four-state-space.md`
* `2016-12-20-intro-to-control-part-zero-whats-this.md`
* `2016-12-29-intro-to-control-part-three-simulation.md`
* `2017-01-02-state-space-in-ti-basic.md`
* `2016-12-22-intro-to-control-part-two-pid-tuning.md`
* `2017-07-22-balancing-robot.md`
* `2017-01-02-intro-to-control-part-five-feedforward-motion-profiling.md`
* `2017-05-07-intro-to-control-part-six-pole-placement.md`

### All includes

* `2017-10-04-elliptic-curves.md`
* `2016-12-20-intro-to-control-part-one-pid.md`
* `2016-12-22-intro-to-control-part-two-pid-tuning.md`
* `2017-01-02-intro-to-control-part-five-feedforward-motion-profiling.md`

### Includes with ID for sandboxing:

* `2016-12-20-intro-to-control-part-one-pid.md`
* `2016-12-22-intro-to-control-part-two-pid-tuning.md`
