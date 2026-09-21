# Task: Correct repository documentation drift

## Context

- Date: 2026-09-21
- Trigger: a repository review found documentation describing the pre-v2.1.0
  single-action layout, and config that never learned about `changelog/`.

## Scope and Acceptance Criteria

- The README describes a two-package workspace, not one action.
- The Make target list matches the Makefile.
- The PRD status reflects shipped behavior rather than a draft.
- `.rulesrc.json` lists both TypeScript packages, so agent tooling sees
  `changelog/`.

## Execution Checklist

- [x] Rewrite the workspace paragraph: both packages, one lockfile, `.nvmrc`.
- [x] Add the missing Make targets: `deps`, `install`, `lint-fix`, `e2e-act`.
- [x] Replace the PRD's `Draft v1` status with its shipped scope.
- [x] Add `changelog` to `.rulesrc.json` `paths.typescript`.
- [x] Validate formatting and the full test suite.

## Test Strategy

- Documentation only; `pnpm prettier` and the full suite guard against
  formatting drift and accidental source edits.
- Cross-checked every documented Make target against the Makefile.

## Rollback Strategy

- Revert the branch; no behavior depends on these files.

## Notes

- `CLAUDE.md` lists rule files in `.claude/rules/`, which does not exist: only
  `.codex/rules/` was generated (30 tracked files against 10 for claude, none
  of them rules). `ballast doctor` reports the `ballast-typescript` backend and
  `.ballast/` state missing, so regenerating needs a CLI install and would add
  about 21 generated files. Left for a deliberate decision rather than folded
  into a documentation PR.
