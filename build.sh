#!/bin/sh
if [ -z "$1" ]; then
  echo "ERROR: need to specify version"
  exit
fi

rm -Rf reviser
mkdir reviser
cp -R src/* reviser
cp README reviser
cp MIT-LICENSE reviser

