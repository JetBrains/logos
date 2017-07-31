#!/usr/bin/env bash
# clean thrash after previous builds
rm -rf dist
# create new package dir
mkdir dist
cp -r web desktop dist
cp package.json README.md index.js logos.js dist/web/
