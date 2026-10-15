#!/usr/bin/env sh
# Fails when a tracked file is binary (ADR 0003).
set -eu
binaries=$(git ls-files --eol | awk '$1 == "i/-text" { print $NF }')
if [ -n "$binaries" ]; then
  echo "Binary files are not allowed in this repository (ADR 0003):"
  echo "$binaries"
  exit 1
fi
