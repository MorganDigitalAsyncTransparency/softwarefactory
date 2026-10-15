---
name: whole-repo-review
description: Review the whole of softwarefactory's main for drift that no single pull request shows - documents against each other, the rules in AGENTS.md, clean code across files and issue hygiene - and report with an issue per real finding. Use only when the project owner writes "granska" or "review the repo"; never on a schedule.
---

# Whole-repo review

The checks in CI and the per-change skills (`clean-code-review`, `docs-sync`) look at
each change. This review looks at all of `main` at once for what accumulates between
changes. It runs **only when the project owner asks** and it changes nothing: **no
file changes, no pull requests, no merges**. Its output is a report and an issue per
real finding.

## Before you start

1. Check out current `main` and note the commit in the report.
2. Run every check in `docs/01-CONTRIBUTING.md`.
3. Read the open issues, so a new finding can be told from a tracked one.

## The areas

1. **Documents against each other**: walk the `docs-sync` questions over the whole
   tree. Every owner in the `AGENTS.md` table still owns its truth and nothing restates
   it elsewhere.
2. **The rules in `AGENTS.md`**: English only, text only, no personal names (also in
   `git log` and in pull request and issue texts), neutral and global.
3. **Clean code across files**: the `clean-code-review` checklist over all code,
   looking for duplication between files and functions just under the limits that
   still do several things.
4. **Decisions**: every ADR in `docs/decisions/` still describes the repository, and
   the index lists every record.
5. **Issue hygiene**: open issues whose work is merged, stale issues with no decision,
   and TODOs with no issue.

## Findings and report

Keep a finding only when you can show it with `file:line` evidence and say what the fix
is. File one issue per real finding, at most about eight, highest value first, after
searching for duplicates. Each issue has a title in the form "area: what is wrong", the
evidence and fix in one paragraph, and Given/When/Then acceptance criteria.

Report in one short message: the commit reviewed, the state of the checks, each area as
fine or with its findings, and a link to each issue filed.
