# TODO

* Audit img alt tags
* Stop using Jekyll
* Audit for unnecessary external JS

# Notes on switching away from Jekyll

## Generating

Generating the blog has a few steps:

* Minify CSS
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
* Generate tags

## Tags used

* `{% include %}`
* `{% if %}`/`{% else %}`/`{% endif %}`
* `{% for %}`/`{% endfor %}`
* `relative_url`
* `aboslute_url`
* `date`
* `xml_escape`

## Tools

* [pandoc](https://pandoc.org/) supports all the markdown features I need
* [minify](https://github.com/tdewolff/minify) seems like a reasonable minifier - used in `bin/minify.sh` script
