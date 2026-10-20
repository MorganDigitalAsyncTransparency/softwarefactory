---
status: accepted
date: 2026-10-20
decision-makers: the project owner
consulted: the AI agent
---

# The music is In the Hall of the Mountain King, played from its notes in the browser

## Context and Problem Statement

The project owner found the background of the film's sound too much like noise, and
asked for classical music, *In the Hall of the Mountain King*, from *Peer Gynt*, with the
sounds of the factory under it and short sounds where something happens. The
repository holds no binaries (ADR 0003) and the sound is made in the browser
(ADR 0005). Where does the music come from?

## Decision Drivers

* **The piece the project owner asked for**, free to use.
* **Text only** (ADR 0003) and in step with the picture after a pause or a jump.
* **Follows the belts**: the music stops while the cloud is down (R11).

## Considered Options

* A: Write the theme out as notes in code and play it with the Web Audio API
* B: A public-domain recording, downloaded and checked by hash when the film is
  published, like the voice (ADR 0006)

## Decision Outcome

Chosen option: "A: the theme as notes", because the piece was written in 1875 and its
composer died in 1907, so it is in the public domain everywhere and its notes can be
written down and played with no license to check, and the music then follows the
line's clock like the rest of the score: it stops with the belts, halts in S09, and its
tempo is set from the script so that its four plays of the theme end with the closing
chord as the last scene begins. A recording (B) would sound richer, but every recording has its own performer's rights to check,
plays at its own pace, and cannot stop and start with the belts without jumps.

### Consequences

* Good, because the repository stays text only and the music needs nothing downloaded.
* Good, because the music's growth follows the film: quiet at the start, fastest and
  loudest as the factory has grown.
* Bad, because a piano made of oscillators sounds simpler than an orchestra.
* Neutral, because the music is short, detached notes, as the original's plucked
  strings, so the voice is still heard over it; it also steps back while the voice
  reads.
* Neutral, because the piece is well known as Norwegian, against the brief's "no
  national markers"; the project owner asked for it by name, and the film shows no
  flag or place.
