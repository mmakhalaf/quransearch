#!/bin/sh
# Production build for GitHub Pages (https://mmakhalaf.github.io/).
# Angular 20's application builder emits browser assets into <output>/browser,
# so we build into docs/ and then flatten the browser/ subfolder.
set -e

ng build --output-path docs --base-href "https://mmakhalaf.github.io/"

# SPA fallback for client-side routing on GitHub Pages.
cp docs/browser/index.html docs/browser/404.html

rm -rf ../mmakhalaf.github.io/*
cp -rf docs/browser/* ../mmakhalaf.github.io
