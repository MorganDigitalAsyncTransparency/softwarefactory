---
status: accepted
date: 2026-10-15
decision-makers: the project owner
consulted: the AI agent
---

# Everything in the repository is in English

## Context and Problem Statement

The film is for a global audience and the repository will be read by people and AI
agents beyond the team that started it. The first drafts were written in Swedish. Which
language does the repository use?

## Considered Options

* A: English for everything in the repository
* B: Swedish, with English only for the film's intertitles
* C: Mixed, each document in the language of its author

## Decision Outcome

Chosen option: "A: English for everything in the repository", because it matches the
film's neutral, global form and lets anyone, human or agent, read every file.

### Consequences

* Good, because one language means one vocabulary and no translation drift.
* Good, because a cheap check in CI (`scripts/check-english.sh`) catches untranslated
  Swedish text.
* Bad, because conversations with the project owner often happen in Swedish, so every
  decision is translated when it lands here.
