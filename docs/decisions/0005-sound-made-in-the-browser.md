---
status: accepted
date: 2026-10-16
decision-makers: the project owner
consulted: the AI agent
---

# The film's sound is made in the browser from a score in code

## Context and Problem Statement

The project owner asked for sound: music, the sounds of the factory and alerts. The
repository holds no binaries (ADR 0003), and the animation can be paused and opened at
any time (R5). How does the film get sound that stays text and follows the picture?

## Decision Drivers

* **Text only** (ADR 0003): no recorded audio in the repository.
* **In step with the picture**, also after a pause or a jump.
* **No install, no build** (R6) and standard library first.

## Considered Options

* A: Synthesize every sound with the browser's Web Audio API from a score in code
* B: Recorded music and effects published outside the repository and loaded by URL
* C: An audio library loaded from a CDN

## Decision Outcome

Chosen option: "A: Web Audio from a score in code", because it keeps the repository
text only, needs nothing installed or licensed, and lets a pure module (`score.js`) say
what sounds at any moment of the film's clocks, so it is tested like the motion.
Recordings (B) would sound richer but need hosting, licenses and syncing. A library (C)
adds a dependency for what a few oscillators and filters do.

### Consequences

* Good, because the music stops with the belts and the alarms follow the scenes,
  without anyone timing an audio file.
* Good, because a change to the script's timing moves the sound with it.
* Bad, because synthesized sound is simpler than recorded music.
* Bad, because browsers start sound only after the viewer clicks or presses a key, so a
  film that starts on its own is silent until then.
