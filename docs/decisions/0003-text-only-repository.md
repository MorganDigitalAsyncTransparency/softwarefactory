---
status: accepted
date: 2026-10-15
decision-makers: the project owner
consulted: the AI agent
---

# The repository is text-only

## Context and Problem Statement

A film produces large binary files: video renders, images, audio and project files from
editing tools. Should they live in the repository?

## Considered Options

* A: Text only; media is described or generated from text and published elsewhere
* B: Commit rendered media directly
* C: Commit media through Git LFS

## Decision Outcome

Chosen option: "A: Text only", because text can be reviewed in a diff, kept in sync by
the docs-sync skill and checked in CI, while binaries cannot. Earlier repositories by
the same owner follow the same rule.

### Consequences

* Good, because every change is readable in a pull request and the repository stays
  small.
* Good, because a check in CI (`scripts/check-text-only.sh`) enforces it.
* Bad, because rendered films and images need a home outside the repository, such as a
  release or a shared drive; the film brief links to it when it exists.
* Neutral, because an animation written as code (for example HTML and SVG) is text and
  fits the rule.
