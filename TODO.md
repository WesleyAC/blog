# TODO

* Audit img alt tags
* Stop using Jekyll
* Migrate from SASS to CSS
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
