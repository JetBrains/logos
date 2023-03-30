#!/usr/bin/env bash
# script is supposed to be run from npm to have ./node_modules/.bin in PATH
TARGET="dist/web"
# minimize svg files in TARGET
for i in $(ls ${TARGET}); do
  if [ -d ${TARGET}/${i} ]; then
    svgo -f ${TARGET}/${i}
  fi
done
