---
status: accepted
date: 2026-11-10
decision-makers: the project owner
consulted: the AI agent
---

# A showpiece the viewer plays, built from text like the film and published beside it

## Context and Problem Statement

The project owner wants something to share in a post that grabs people at once, has a
visceral impact and shows the range of what an AI agent can build. The film is 2.5
minutes, made for employees and watched from start to end; a post gets a few seconds.
What form does the shared piece take, where does it live, and how does a post show it?

## Decision Drivers

* **Grab in the first second.** Motion before any click; the viewer acts at once.
* **Text only** (ADR 0003). No rendered image, video or sound in the repository.
* **Embeddable in a post.** A link in a post shows a preview card, so the page needs
  a preview image at a fixed address.
* **Range.** 3D, music, interaction and the code itself in one piece.

## Considered Options

* A: An interactive page in `ship/`, published beside the film, with its preview card
  drawn from the page when it is published
* B: A short video cut from the film
* C: A new scene or mode inside the film

## Decision Outcome

Chosen option: "A: an interactive page", because a viewer who plays the factory and
hears it turn their taps into music feels the idea in seconds, and the closing reveal
(only text, with the code shown running) is what a video cannot show. A video (B) is a
binary that would have to be rendered and hosted elsewhere, and is watched, not felt.
A mode in the film (C) would bend the film's brief and its seekable timeline.

The page uses three.js at the film's pinned version, plus its bloom pass from the same
package, with every file's integrity hash in the import map. Its music is generated in
the browser like the film's sound (ADR 0005), but is a short original loop in a minor
key, so that any rhythm of taps fits it.

The page names Claude as the AI agent that wrote it, in its text and its preview.
That is the one exception to the repository's neutrality, and it holds for the
showpiece only: the film stays without any brand.

### Consequences

* Good, because the page, its music and its preview are all made from text in the
  repository, and the page can prove it by counting and showing its own lines.
* Good, because publishing draws the preview card from the page itself, so the card
  follows every change.
* Bad, because the preview needs Google Chrome on the publishing runner and network
  access for three.js; if either is missing, the publish fails rather than publishing
  without a card.
* Bad, because the page states its own address in its preview tags, so moving the site
  means changing them.
* Bad, because the showpiece's state is not a pure function of time like the film's;
  a stage is opened with `?at=<shipped>`, not with an exact time.
