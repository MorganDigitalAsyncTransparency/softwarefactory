---
status: accepted
date: 2026-10-20
decision-makers: the project owner
consulted: the AI agent
---

# The sound is three layers mixed together, and the music never pauses

## Context and Problem Statement

After the voice (ADR 0006) and the music (ADR 0007) came in, the project owner found
the sound strange: the background seemed to pause when the voice spoke. The voice
played as separate audio elements beside the Web Audio sound, the music stepped back
while the voice read, and it stopped with the belts during the cloud outage, which is
also when a caption is read. The project owner asked for three layers, the voice, the
music and the sound effects, added together, with the music in the background the
whole time.

## Decision Drivers

* **The music plays the whole film**, under the voice, and nothing stops it.
* **One mix**: no layer can pause or interrupt another, on any browser.

## Considered Options

* A: Play the voice's recordings in the same audio context as the music and the
  effects, each layer with its own fixed level, and let the music follow the film's
  clock
* B: Keep the voice as audio elements and only remove the music's step back

## Decision Outcome

Chosen option: "A: one audio context, three layers", because the layers are then
mixed by the same engine and nothing outside it can interrupt one of them, and the
music on the film's clock plays on while the belts stand still. It no longer halts in
S09 either, and its tempo is now set so that the closing chord lands as the last scene
begins on the film's clock. The voice goes past the limiter that catches the music's
and the effects' loudest peaks, so speaking never turns them down. B would
leave two players that browsers may treat as rivals, and a background that still
stops in the outage.

### Consequences

* Good, because the music, the effects and the voice play together all through.
* Good, because a scene's recording is fetched while the scene waits for its caption,
  so in a film that plays on, the first word is not cut; after a jump into a caption,
  its first words may be lost while it loads.
* Bad, because the music no longer stops with the belts or halts in S09, so the outage
  and the manual middle are heard through the alarm, the quiet hum and the stopped
  clicks alone.
* Neutral, because the music is set low enough that the voice stays clear without
  stepping it back.
