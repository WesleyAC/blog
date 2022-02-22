with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "wesleyac-blog";

  buildInputs = [
    minify
    bundler
    libxml2
  ];
}
