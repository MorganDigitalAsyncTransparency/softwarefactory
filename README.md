# softwarefactory

Explaining the software factory: how software is built today, and how we are turning
it into a factory that builds itself while it produces.

The first deliverable is a short animated film that compares a software factory
with a physical one.

## What is here

| Path                               | Contents                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| [`film/`](film/README.md)          | The film brief, and the animation that plays it (`film/index.html`)      |
| [`film/script/`](film/script/)     | The script and the visual descriptions with prompts for each scene       |
| [`docs/`](docs/01-CONTRIBUTING.md) | How to contribute and watch the film, requirements, architecture and the [decision records](docs/decisions/README.md) |
| `.claude/`                         | Skills and the reviewer agent that AI agents use in this repository      |
| `scripts/`, `tests/`, `.github/`   | The checks and tests CI runs, the voice generator, and the PR template   |

## Working in this repository

Humans and AI agents follow the same guide: [AGENTS.md](AGENTS.md). It says where each
truth lives, which rules are non-negotiable and how work moves from a task to a merged
pull request. Setup and checks are in [docs/01-CONTRIBUTING.md](docs/01-CONTRIBUTING.md).

## License

[MIT](LICENSE)
