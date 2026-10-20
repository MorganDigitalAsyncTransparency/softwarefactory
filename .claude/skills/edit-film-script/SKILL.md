---
name: edit-film-script
description: Change the softwarefactory film's script or visual descriptions - add, cut or retime a scene, rewrite a caption, or change the look - while keeping the two files and the brief in step. Use for any change under film/.
---

# Edit the film script

Read `film/README.md` first: the brief decides audience, length, tone and language.

## Rules for the script (`film/script/script.md`)

- Each row has a scene ID (`S01`, `S02`, …), a time range, what happens in the scene
  and its caption, which may be empty. IDs stay in film order; renumber all of them when a
  scene is inserted, and update `visual-descriptions.md`, the drawing keys in
  `film/animation/scenes.js` and the tests in the same change. Scene IDs belong only in
  those files: search the repository for the old IDs (`grep -rn 'S[0-9][0-9]'`) and
  replace any found elsewhere with a description.
- Time ranges follow each other with no gap or overlap, and the last one ends within
  the length in the brief.
- A caption follows the caption decision in the brief, and its scene lasts long enough
  for the delay and reading time in the
  [caption rules](../../../film/script/visual-descriptions.md#captions); a test checks it.
  The voice must also be done before the caption leaves (R15):
  `scripts/voice/generate.sh` checks it, and CI runs it.
- Keep the film one continuous picture, as the
  [continuity](../../../film/script/visual-descriptions.md#continuity) rules say.
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
