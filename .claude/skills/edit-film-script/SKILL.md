---
name: edit-film-script
description: Change the softwarefactory film's script or visual descriptions - add, cut or retime a scene, rewrite a caption, or change the look - while keeping the two files and the brief in step. Use for any change under film/.
---

# Edit the film script

Read `film/README.md` first: the brief decides audience, length, tone and language.

## Rules for the script (`film/script/script.md`)

- Each row has a scene ID (`S01`, `S02`, …), a time range, what happens in the scene
  and its caption, which may be empty. IDs stay in film order; renumber all of them when a
  scene is inserted, and update `visual-descriptions.md` and the drawing keys in
  `film/animation/scenes.js` in the same change.
- Time ranges follow each other with no gap or overlap, and the last one ends within
  the length in the brief.
- A caption is short, plain English that a non-technical viewer understands, and its
  scene lasts long enough to read it: about one second per three words plus two
  seconds.
- Each scene's camera starts where the one before stopped: the film is one
  continuous picture, faded through black only around a split-screen scene.
- Matter-of-fact tone: describe how it is. No humor, no selling, no brand.
- Decisions in the brief describe the film without scene IDs, so renumbering never
  breaks them.

## Rules for the visual descriptions (`film/script/visual-descriptions.md`)

- Every scene has a prompt under its ID.
- Prompts are in English, do not repeat the style block (role colors included) and
  never ask for text, symbols or glyphs in the picture.
- A change to the style block or continuity applies to the whole film: read every
  prompt again and fix those it contradicts.

## Before the pull request

Run the `docs-sync` skill and the checks in `docs/01-CONTRIBUTING.md`.
