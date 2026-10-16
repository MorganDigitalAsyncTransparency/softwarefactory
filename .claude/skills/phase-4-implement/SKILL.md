---
name: phase-4-implement
description: Phase 4 in softwarefactory. Use when requirements, design and validation are settled and the code or content is to be written.
---

# Phase 4: Implement

- **Test first**: write the failing test from the requirement's Given/When/Then, then
  the code. Name the test after the behaviour, not the function. Never weaken or delete
  an existing test to get green.
- Tests go through the public interface and assert exact values where the behaviour is
  exact. No real timers, network or randomness without control.
- The smallest coherent solution that meets the requirements. No unrelated clean-up.
- Follow "Clean code, strictly" in `AGENTS.md`: the size and complexity limits, and no
  code "just in case". Functions do one thing, at one level of abstraction.
- Names say what the thing is in the domain (`caption`, `scene`), never `data`.
- Read your own diff before the phase ends and strike everything no requirement or test
  needs.
- Commit when the implementation is green.
