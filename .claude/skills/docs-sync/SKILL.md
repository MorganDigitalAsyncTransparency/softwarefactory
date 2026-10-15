---
name: docs-sync
description: Check that a softwarefactory change keeps every document true, in the same change: the film brief, the script, the visual descriptions, decisions, the contributing guide and AGENTS.md. Use on every change before it is committed or merged.
---

# Docs in sync

The rule is one owner per truth: the "Where each truth lives" table in `AGENTS.md`
says which document owns which fact. A change that alters a fact updates its owner
**in the same change**, links to it from everywhere else, and never writes the fact a
second time.

## How to run it

1. Get the diff against `main`: `git diff origin/main...HEAD`.
2. Answer each question below with yes, no or not affected.
3. Fix every gap in the same change. Report what you changed in one line per document,
   and anything you could not decide as a question for the project owner.

## The questions

- **Film brief** (`film/README.md`): does the change alter the audience, form, tone,
  core message, analogies or a recorded decision?
- **Script and visuals** (`film/script/`): does every scene ID in `script.md` that is a
  scene have a prompt in `visual-descriptions.md`, and no prompt an orphan ID? Do the
  timings still run without gaps or overlaps, and does the total stay within the
  length in the brief?
- **Decisions** (`docs/decisions/`): is this a decision a future contributor would
  otherwise re-litigate? Then it gets a new ADR and the index lists it. An old ADR is
  never edited; a reversal is a new ADR that supersedes it.
- **Contributing guide** (`docs/01-CONTRIBUTING.md`): is a new script, check or
  workflow step described there?
- **Agent guide** (`AGENTS.md`): is a new durable rule written there as a rule, and
  does the owner table still name the right files?
- **README.md**: does the overview of the repository still match its folders?
