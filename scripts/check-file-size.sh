#!/usr/bin/env sh
# Fails when a code file is over the hard limit of 250 lines (AGENTS.md).
set -eu
limit=250
too_long=$(git ls-files -z '*.js' '*.css' '*.html' '*.sh' | xargs -0 wc -l | awk -v limit="$limit" '$2 != "total" && $1 > limit')
if [ -n "$too_long" ]; then
  echo "Code files over $limit lines (AGENTS.md, clean code):"
  echo "$too_long"
  exit 1
fi
