# Contributing

Read [AGENTS.md](../AGENTS.md) first: it holds the rules and the workflow. This file
says how to run the checks.

## Setup

Nothing to install: the film material is Markdown and the animation is plain HTML and
JavaScript. The browser loads the one library, three.js, from a CDN when the page opens
(ADR 0004), so watching needs network access. The checks need `git`, a POSIX shell and
Node.js 22 or later; the voice also needs Python 3.12 or later and `curl`.

## Watching the animation

The film on `main` is published at
<https://morgandigitalasynctransparency.github.io/softwarefactory/> by the
`Publish the film` workflow after every merge.

To watch a branch, serve it yourself. The page loads the script over HTTP, so serve
the `film/` folder with any static server and open it in a browser:

```sh
python3 -m http.server --directory film 8000
# then open http://localhost:8000/
```

The voice is not in the repository (ADR 0006). To hear it, make it once and again
after a caption changes; it needs network access the first time, for the model:

```sh
scripts/voice/generate.sh   # writes film/voice/, which git ignores
```

Python's server does not answer range requests, so after a jump the voice may lag
behind; a server that does, such as `npx http-server film -p 8000`, keeps it in step.

Add `?t=<seconds>` to open a single frame, paused, for example
`http://localhost:8000/?t=10`. Space plays and pauses. The sound starts after the first
click or key press on the page; the speaker button turns it off and on.

## Checks

CI runs these on every pull request and on `main` (`.github/workflows/checks.yml`).
Run them locally before you push:

```sh
scripts/check-text-only.sh   # no binary files (ADR 0003)
scripts/check-english.sh     # no untranslated Swedish text (ADR 0001)
scripts/check-file-size.sh   # no code file over the hard limit (AGENTS.md)
npm test                     # unit tests, with Node's built-in test runner
scripts/voice/generate.sh    # the voice fits its captions (R15)
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
