---
name: phase-1-3-requirements-and-design
description: Phases 1–3 in softwarefactory. Use after a confirmed phase 0 to write requirements as Given/When/Then, make design decisions (ADR in MADR form) and decide how the change will be verified.
---

# Phases 1–3: Requirements, design and validation

Create a branch before anything is written. Commit after every phase.

## Phase 1: Requirements

- Write the requirements in their owner (see `AGENTS.md`): the film brief for the film,
  `docs/02-REQUIREMENTS.md` for code. Code requirements are Given/When/Then.
- Describe the desired state, not the change.
- Concrete, testable and clear to someone who does not know the code.
- Every requirement belongs to a GitHub issue.

## Phase 2: Design and documentation

- Describe how the requirements are met in the owner of that truth.
- **A decision that is hard to reverse gets an ADR** in `docs/decisions/`, following
  `docs/decisions/README.md`.
- Find every file that describes or indexes the part that changes and update it now,
  not afterwards.

## Phase 3: Validation

- Decide how each requirement will be verified. Automated first.
- If it cannot be automated, write down the manual step.
