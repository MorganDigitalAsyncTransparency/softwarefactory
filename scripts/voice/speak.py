"""Speaks the lines from print-lines.js with Kokoro (ADR 0006)."""
import json
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = "bm_george"
LANGUAGE = "en-gb"
# A little slower than Kokoro's own pace, for viewers who listen in a second language.
SPEED = 0.95


def main(model_dir, out_dir):
    kokoro = Kokoro(str(model_dir / "kokoro-v1.0.int8.onnx"), str(model_dir / "voices-v1.0.bin"))
    out_dir.mkdir(parents=True, exist_ok=True)
    too_long = [line for line in json.load(sys.stdin) if not speak(kokoro, line, out_dir)]
    for line in too_long:
        print(f"{line['id']}: the voice is longer than the {line['seconds']:.1f} s the caption shows.", file=sys.stderr)
    return 1 if too_long else 0


def speak(kokoro, line, out_dir):
    audio, rate = kokoro.create(line["text"], voice=VOICE, speed=SPEED, lang=LANGUAGE)
    sf.write(out_dir / f"{line['id']}.mp3", audio, rate, format="MP3")
    seconds = len(audio) / rate
    print(f"{line['id']}: {seconds:.1f} s of {line['seconds']:.1f} s")
    return seconds <= line["seconds"]


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1]), Path(sys.argv[2])))
