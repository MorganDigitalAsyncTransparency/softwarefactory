---
status: accepted
date: 2026-10-15
decision-makers: the project owner
consulted: the AI agent
---

# The film animation is plain SVG and ES modules that read the script

## Context and Problem Statement

The project owner wants the film built in code before any video is made, and a
recording to a file is not needed yet. How is the animation built so that it stays
text, follows the script without copying it, and needs nothing installed?

## Decision Drivers

* **One owner per truth.** Scene times and intertitle text live in `script.md` only.
* **Text only** (ADR 0003) and standard library first (`AGENTS.md`).
* **Seekable.** A reviewer must be able to open any frame directly.

## Considered Options

* A: Plain SVG drawn by ES modules, reading `script.md` at runtime
* B: A web animation library or framework
* C: A build step that turns `script.md` into data embedded in the page

## Decision Outcome

Chosen option: "A: Plain SVG drawn by ES modules, reading `script.md` at runtime",
because it needs no install or build, keeps the script as the only source of timing and
text, and every frame is a pure function of time, so it can be opened with `?t=`.

### Consequences

* Good, because a change to an intertitle or a timing in `script.md` shows up in the
  animation with no code change.
* Good, because the parser and the timeline are pure and tested with Node's built-in
  test runner.
* Bad, because the page must be served over HTTP: browsers block `fetch` from `file://`.
* Bad, because the script's table format becomes an interface; changing its columns
  means changing the parser in the same change.
* Neutral, because the animation is a flat 2D rendition, not the isometric AI-video
  style the visual descriptions target.
