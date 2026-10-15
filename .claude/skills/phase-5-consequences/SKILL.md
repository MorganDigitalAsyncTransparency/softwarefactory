---
name: phase-5-consequences
description: Phase 5 in softwarefactory. Use when the implementation is done, to find everything the change affects, fix it and run all verification before the review.
---

# Phase 5: Consequences and verification

1. **Blast radius.** For every file created or changed, search for every file that
   refers to, links to, describes or depends on it, and read them. Always include
   `AGENTS.md`, `README.md`, `docs/decisions/README.md` and the owners the change
   touches.
2. Update every file whose description is now wrong, incomplete or missing. Run the
   `docs-sync` skill for this.
3. Check that every requirement has a named verification and that links resolve.
4. Check that the change follows `docs/decisions/` and the rules in `AGENTS.md`. Run
   the `clean-code-review` skill on any code.
5. Run **all** checks in `docs/01-CONTRIBUTING.md`; do not guess which ones apply. Fix
   the root cause of every failure.

## Output, required before phase 6

1. Every file read during the walk-through.
2. Which files were updated, and why.
3. Which were read but needed no change, and why not.
4. Which commands ran, and their results.

If the list cannot be written, the walk-through is not done.

Then start the reviewer agent (`.claude/agents/reviewer.md`) with the branch name and
the issue. If it finds something blocking, fix it and redo phase 5 in full.
