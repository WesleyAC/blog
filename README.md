# Wesley's Blog

This is the GitHub repo for my blog. Feel free to file issues/PRs for any typos or things that I get wrong!

# Notes

To build on nixos:

* `nix-shell -p bundler libxml2 --run "bundle install --gemfile=Gemfile --path vendor/cache"`
* `nix-shell -p minify bundler libxml2 --run "./bin/minify.sh && bundle exec jekyll build"`
