---
name: phase-7-8-deliver
description: Phases 7–8 in softwarefactory. Use when phase 5 and the review are done, to present the work, open the pull request and drive it to green and merge.
---

# Phases 7–8: Deliver

## Phase 7: Checkpoint and pull request

1. Check that the phase 5 output and the reviewer's findings exist and that no blocking
   finding is left. Summarise both in the pull request text.
2. Present the finished work and **wait for confirmation**.
3. Bring in the latest `main` and run all checks again.
4. Open a pull request using `.github/pull_request_template.md`: a short imperative
   title (under 70 characters), and `Closes #<n>` when the work comes from an issue.

## Phase 8: CI and wrap-up

- Wait until every check is green. If one fails, find the cause and fix it on the
  branch. "Flaky" is not a cause until a re-run on the same commit proves it.
- Review comments are answered on their thread: small asks are fixed and pushed, larger
  ones get a proposal and wait for the author.
- New work found along the way becomes a new issue, not a bigger pull request.
- Wait for a human to merge.
- After the merge: switch to `main`, pull, and delete the local branch.
