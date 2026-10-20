---
status: accepted
date: 2026-10-20
decision-makers: the project owner
consulted: the AI agent
---

# A voice reads the captions, made from the script with an open-source model at publishing

## Context and Problem Statement

The project owner asked for a voice that reads the captions, pleasant and modern,
like a person. The repository holds no binaries (ADR 0003), the sound so far is made
in the browser (ADR 0005), and the captions change from time to time. Where does the
voice come from, and how does it stay true to the script?

## Decision Drivers

* **A voice that sounds human**, the same for every viewer.
* **Text only** (ADR 0003): no recording in the repository.
* **Follows the script**: a changed caption needs no one to record it again.
* **No account, no key, no cost.**

## Considered Options

* A: Speak each caption with Kokoro, an open-source model (Apache 2.0), when the film
  is published, and publish the recordings with the page
* B: The browser's built-in speech synthesis
* C: A commercial speech service, with an account and an API key
* D: A person records the captions

## Decision Outcome

Chosen option: "A: Kokoro at publishing", because it sounds human for every viewer and
runs on an ordinary processor in the workflows, with no account or key. The project
owner chose the voice `bm_george` (British English, male) from samples.
`scripts/voice/generate.sh` makes one recording per caption from the script; the
`Publish the film` workflow publishes them with the page, and the `Checks` workflow
fails when a recording runs longer than its caption is shown (R15). The browser's
voice (B) differs from browser to browser and often sounds robotic; a service (C)
needs an account and a key; a person (D) must record again after every change.
ADR 0005 turned down recordings for the music because of hosting, licenses and
syncing; here the workflow makes and hosts them, the model's license allows it, and
each recording starts with its caption, so those costs fall away.

### Consequences

* Good, because a changed caption gets a new voice on the next publish.
* Good, because the repository stays text only: the recordings are made in the
  workflow and never committed.
* Bad, because the checks and the publish download the model, about 120 MB, from the
  model's release page, and install its Python packages; both are pinned by hash.
* Bad, because a film served from a fresh clone has no voice until
  `scripts/voice/generate.sh` is run, a step R6 otherwise does not need.
* Neutral, because Kokoro has no English voice with a Swedish accent; changing the
  voice changes only the generator.
