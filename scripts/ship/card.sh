#!/usr/bin/env sh
# Draws the showpiece's link preview, card.png, from the page itself into a built site
# (ADR 0009). Usage: scripts/ship/card.sh <site folder>. Needs Google Chrome and
# network access for three.js.
set -eu
site=$1
python3 -m http.server 8765 --directory "$site" >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
sleep 1
google-chrome --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader \
  --hide-scrollbars --window-size=1200,630 --virtual-time-budget=20000 \
  --screenshot="$site/ship/card.png" "http://localhost:8765/ship/?card"
test -s "$site/ship/card.png"
