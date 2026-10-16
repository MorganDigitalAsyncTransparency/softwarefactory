---
status: accepted
date: 2026-10-15
decision-makers: the project owner
consulted: the AI agent
---

# The film animation is 3D, drawn with three.js by ES modules that read the script

## Context and Problem Statement

The project owner wants the film built in code before any video is made, and a
recording to a file is not needed yet. A first, flat 2D version was hard to follow: the
viewer could not tell the factory, the walls, IT and the product apart, and it did not
look like a factory. The project owner asked for 3D. How is the animation built so that
it is 3D, stays text, follows the script without copying it, and needs nothing
installed?

## Decision Drivers

* **One owner per truth.** Scene times and captions live in `script.md` only.
* **Text only** (ADR 0003) and standard library first (`AGENTS.md`).
* **Seekable.** A reviewer must be able to open any frame directly.
* **Readable in 3D.** Light, shadow and a moving camera are what make the hall, the
  machines, the product and IT look like what they are.

## Considered Options

* A: three.js, loaded from a CDN at a pinned version, drawn by ES modules that read
  `script.md` at runtime
* B: Plain WebGL with no library
* C: 3D faked in SVG with an isometric projection
* D: A framework with a build step

## Decision Outcome

Chosen option: "A: three.js from a CDN", because it gives real light, shadows and
camera moves in a few lines, needs no install or build, and keeps every frame a pure
function of time, so it can be opened with `?t=`. Plain WebGL (B) would mean writing a
renderer, which is far more code than the film. Faked 3D (C) cannot move the camera
around the factory and has no light. A framework (D) adds a build for no gain.

### Consequences

* Good, because a change to a caption or a timing in `script.md` shows up in the
  animation with no code change.
* Good, because the parser, the timeline, the motion and the scene table are pure and
  tested with Node's built-in test runner, without three.js.
* Bad, because three.js is a dependency, loaded from `cdn.jsdelivr.net` when the page
  opens: watching needs network access, and updating the version is a change to the
  import map in `film/index.html`.
* Bad, because the page must be served over HTTP: browsers block `fetch` from `file://`.
* Bad, because the script's table format becomes an interface; changing its columns
  means changing the parser in the same change.
* Bad, because drawings are keyed by scene ID; renumbering scenes means renumbering
  the drawings in the same change.
