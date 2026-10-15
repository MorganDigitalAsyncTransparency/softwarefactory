---
name: clean-code-review
description: Review a softwarefactory diff for clean code (names, small functions, duplication, dead code, comments, tests) before it is committed or merged. Use on every diff that touches code or scripts.
---

# Clean code review

The goal is *Clean Code* by Robert C. Martin, with the limits in "Clean code, strictly"
in `AGENTS.md`. This review covers what needs judgement. It reviews the **diff**, not
the whole repository: report what the change adds or makes worse, and fix it in the
same change when the fix is small.

## How to run it

1. Get the diff against `main`: `git fetch origin main && git diff origin/main...HEAD`.
2. Read every changed function in full, not only the changed lines, and walk the
   checklist below.
3. Fix what you can in the change. For anything left, write one line per finding:
   `file:line`, what is wrong, and why it stays.

## Checklist

### Names

- A name says what the thing is or does, in the vocabulary of the film brief and the
  script (scene, intertitle, gate, belt). No abbreviations a newcomer would have to
  decode, no `data`, `info`, `handle`, `tmp`.
- Booleans read as a question (`isVisible`); functions are verbs, values are nouns.
- One name per concept: no synonym for something that already has a name.

### Functions

- One thing at one level of abstraction. If a function needs a comment to separate its
  sections, the sections are functions.
- No boolean flag parameters that switch between two behaviours; write two functions.
- No hidden side effects: a function named `get…` or `compute…` changes nothing.

### Duplication and dead code

- Search for an existing helper before writing one (`rg` for the operation, not only
  the name). Two blocks that differ only in a value are one function with a parameter.
- No commented-out code, no unused parameters kept "for later", no unreachable branch.

### Comments

- A comment says *why*, never *what* the next line does or how it got there; that is
  git's job. A comment that is no longer true is a bug.

### Tests

- Every requirement in the change has a test that would fail without it.
- No test is deleted, skipped or loosened to get green, and no limit is raised.
