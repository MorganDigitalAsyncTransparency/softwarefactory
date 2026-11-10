#!/usr/bin/env sh
# Draws the showpiece's link preview, card.png, from the page itself into a built site
# (ADR 0009). Usage: scripts/ship/card.sh <site folder>. Needs Google Chrome, curl and
# network access for three.js. Fails when the page did not start, so a publish never
# carries a card of a broken page.
set -eu
site=$1
python3 -m http.server 8765 --directory "$site" >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
url="http://localhost:8765/ship/?card"
until curl -sf "$url" >/dev/null; do sleep 0.2; done
chrome() {
  google-chrome --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader \
    --hide-scrollbars --window-size=1200,630 --virtual-time-budget=20000 "$@" "$url"
}
if ! chrome --dump-dom | grep -q 'data-card="true"'; then
  echo "The showpiece did not start, so there is no card to draw (ADR 0009)."
  exit 1
fi
chrome --screenshot="$site/ship/card.png"
