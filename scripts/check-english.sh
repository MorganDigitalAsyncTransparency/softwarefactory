#!/usr/bin/env sh
# Fails when a tracked file contains Swedish letters, a sign of text that was not
# translated (ADR 0001). The check is a cheap proxy, not a language detector.
set -eu
if git grep -n -I -F -e 'å' -e 'ä' -e 'ö' -e 'Å' -e 'Ä' -e 'Ö' -- . ':!scripts/check-english.sh'; then
  echo "Everything in this repository is written in English (ADR 0001)."
  exit 1
fi
