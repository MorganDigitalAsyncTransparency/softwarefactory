#!/usr/bin/env sh
# Makes the voice that reads the captions into film/voice/ (ADR 0006). Needs Node.js,
# Python 3.10 to 3.13 and network access; the model is downloaded once into .cache/voice/.
set -eu
# requirements.txt pins every package with hashes: uv pip compile requirements.in
# --generate-hashes --universal -p 3.12 -o requirements.txt
cd "$(dirname "$0")/../.."
release=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
cache=.cache/voice
mkdir -p "$cache"
# A download is moved into place only once complete, so a broken one is fetched again.
for file in kokoro-v1.0.int8.onnx voices-v1.0.bin; do
  [ -f "$cache/$file" ] || { curl -fsSL -o "$cache/$file.part" "$release/$file" && mv "$cache/$file.part" "$cache/$file"; }
done
(cd "$cache" && sha256sum -c ../../scripts/voice/model.sha256)
[ -d "$cache/venv" ] || python3 -m venv "$cache/venv"
"$cache/venv/bin/pip" install -q --require-hashes -r scripts/voice/requirements.txt
node scripts/voice/print-lines.js | "$cache/venv/bin/python" -I scripts/voice/speak.py "$cache" film/voice
