#!/usr/bin/env sh

set -eu

mkdir -p static/vendor
cp node_modules/headroom.js/dist/headroom.min.js static/vendor/headroom.min.js
