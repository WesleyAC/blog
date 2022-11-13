with import (builtins.fetchTarball {
  name = "nixos-pinned-for-blog";
  url = "https://github.com/nixos/nixpkgs/archive/a7ecde854aee5c4c7cd6177f54a99d2c1ff28a31.tar.gz";
  #sha256 = "0n2xxk9pzwlbia80xxw03zcxd1qac89vn4mphx5l63r7vd71m54k";
  sha256 = "sha256:162dywda2dvfj1248afxc45kcrg83appjd0nmdb541hl7rnncf02";
}) {};

stdenv.mkDerivation {
  name = "wesleyac-blog";

  buildInputs = [
    minify
    bundler
    libxml2
    pkgconfig
    libxslt
  ];
}
