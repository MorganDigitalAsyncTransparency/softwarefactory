# Contributing

Read [AGENTS.md](../AGENTS.md) first: it holds the rules and the workflow. This file
says how to run the checks.

## Setup

Nothing to install: the film material is Markdown and the animation is plain HTML,
SVG and JavaScript. The checks need `git`, a POSIX shell and Node.js 22 or later.

## Watching the animation

The page loads the script over HTTP, so serve the `film/` folder with any static
server and open it in a browser:

```sh
python3 -m http.server --directory film 8000
# then open http://localhost:8000/
```

Add `?t=<seconds>` to open a single frame, paused, for example
`http://localhost:8000/?t=72` for the gate scene. Space plays and pauses.

## Checks

CI runs these on every pull request and on `main` (`.github/workflows/checks.yml`).
Run them locally before you push:

```sh
scripts/check-text-only.sh   # no binary files (ADR 0003)
scripts/check-english.sh     # no untranslated Swedish text (ADR 0001)
scripts/check-file-size.sh   # no code file over 250 lines (AGENTS.md)
npm test                     # unit tests, with Node's built-in test runner
npx markdownlint-cli2@0.23.3 "**/*.md"
```

The Markdown lint rules are in `.markdownlint-cli2.jsonc`. Editor settings are in
`.editorconfig`.

## Branches and pull requests

- Work on a branch; never push to `main`.
- One coherent change per pull request, small enough to read in one sitting.
- Fill in `.github/pull_request_template.md`.

## Decisions

A decision that is hard to reverse gets a record in `docs/decisions/`; see
[the index](decisions/README.md) for the format.
