---
status: accepted
date: 2026-10-15
decision-makers: the project owner
consulted: the AI agent
---

# A short agent guide, phases as skills and an independent reviewer

## Context and Problem Statement

The repository is built by people and AI agents together. The agents need the
project's rules, where each truth lives, and how work goes from a task to a merge. How
are those instructions organised so that they are followed, do not drift between tools,
and hold as the tools change?

## Decision Drivers

* **Followed in practice.** A long file that is always loaded crowds the agent's
  context and is followed less the longer it gets.
* **One truth.** The same rules apply to every tool, without copies that drift.
* **Independent review.** The author of a change is poor at finding its faults.
* **Proven practice.** Earlier repositories by the same owner have working setups: an
  owner table and a definition of done in `CLAUDE.md`, phases 0–8 with checkpoints, and
  a reviewer agent that argues against each change.

## Considered Options

* A: Short `AGENTS.md`, the phases as skills, review as its own agent
* B: One long agent file with every phase, copied to each tool
* C: One `CLAUDE.md` with rules and a definition of done

## Decision Outcome

Chosen option: "A: Short `AGENTS.md`, the phases as skills, review as its own agent",
because it keeps the phased workflow and the multi-perspective review while loading
only what each step needs, and keeps the review independent of the author.

### Consequences

* Good, because `AGENTS.md` is short and read every time; a phase's detail is read when
  the phase starts.
* Good, because `CLAUDE.md` imports `AGENTS.md` (`@AGENTS.md`): one file to change and
  nothing to keep in sync.
* Good, because the review is done by an agent with no context from the implementation.
* Bad, because skills and agent definitions under `.claude/` are Claude Code's format.
  Other tools find them through the tables in `AGENTS.md` but do not load them
  automatically.
