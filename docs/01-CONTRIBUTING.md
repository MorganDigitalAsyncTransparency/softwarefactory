# Contributing

Read [AGENTS.md](../AGENTS.md) first: it holds the rules and the workflow. This file
says how to run the checks.

## Setup

Nothing to install for the film material: it is Markdown. The checks need `git`, a
POSIX shell and Node.js for the Markdown lint.

## Checks

CI runs these on every pull request and on `main` (`.github/workflows/checks.yml`).
Run them locally before you push:

```sh
scripts/check-text-only.sh   # no binary files (ADR 0003)
scripts/check-english.sh     # no untranslated Swedish text (ADR 0001)
npx markdownlint-cli2 "**/*.md"
```

The Markdown lint rules are in `.markdownlint-cli2.jsonc`. Editor settings are in
`.editorconfig`.

## Branches and pull requests

- Work on a branch; never push to `main`.
- One coherent change per pull request, small enough to read in one sitting.
- Fill in `.github/pull_request_template.md`. A human merges, with a merge commit.

## Decisions

A decision that is hard to reverse gets a record in `docs/decisions/`; see
[the index](decisions/README.md) for the format.
