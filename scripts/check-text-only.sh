#!/usr/bin/env sh
# Fails when a tracked file is binary (ADR 0003).
set -eu
binaries=$(git ls-files --eol | awk -F '\t' '$1 ~ /^i\/-text/ { print $2 }')
if [ -n "$binaries" ]; then
  echo "Binary files are not allowed in this repository (ADR 0003):"
  echo "$binaries"
  exit 1
fi
