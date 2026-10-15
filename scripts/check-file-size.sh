#!/usr/bin/env sh
# Fails when a code file is over the hard limit of 250 lines (AGENTS.md).
set -eu
too_long=$(git ls-files '*.js' '*.css' '*.html' '*.sh' | xargs wc -l | awk '$2 != "total" && $1 > 250')
if [ -n "$too_long" ]; then
  echo "Code files over 250 lines (AGENTS.md, clean code):"
  echo "$too_long"
  exit 1
fi
