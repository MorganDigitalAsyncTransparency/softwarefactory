---
name: edit-film-script
description: Change the softwarefactory film's script or visual descriptions - add, cut or retime a scene, rewrite an intertitle, or change the look - while keeping the two files and the brief in step. Use for any change under film/.
---

# Edit the film script

Read `film/README.md` first: the brief decides audience, length, tone and language.

## Rules for the script (`film/script/script.md`)

- Each row has a scene ID (`S01`, `S02`, …), a time range, a type (Scene or
  Intertitle) and its content. IDs stay in film order; renumber all of them when a
  scene is inserted, and update `visual-descriptions.md` in the same change.
- Time ranges follow each other with no gap or overlap, and the last one ends within
  the length in the brief.
- An intertitle is short, plain English that a non-technical viewer understands, and is
  shown long enough to read: about one second per three words plus two seconds.
- Matter-of-fact tone: describe how it is. No humor, no selling, no brand.
- Decisions in the brief describe the film without scene IDs, so renumbering never
  breaks them.

## Rules for the visual descriptions (`film/script/visual-descriptions.md`)

- Every scene of type Scene has a prompt under its ID; intertitles do not.
- Prompts are in English, do not repeat the style block (role colors included) and
  never ask for text, symbols or glyphs in the picture.
- A change to the style block or continuity applies to the whole film: read every
  prompt again and fix those it contradicts.

## Before the pull request

Run the `docs-sync` skill and the checks in `docs/01-CONTRIBUTING.md`.
