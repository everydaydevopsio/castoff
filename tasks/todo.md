# Task: Resolve the previous tag to an exact version

## Context
- Date: 2026-09-17
- Mode: Autonomous within the user's authorization to fix the defect found while reviewing the v2.1.0 release run, then open a PR.
- PRD Section: 7.3

## Scope and Acceptance Criteria
- Report the exact previous version tag rather than the floating major tag the release workflow moves onto each release.
- Preserve current behavior for repositories using other tag conventions and for git versions without `--exclude`.
- Leave the generated commit range unchanged: both lookups already covered the same commits.

## Execution Checklist
- [x] Reproduce the defect from the v2.1.0 run and confirm it predates the changelog work.
- [x] Prove regression tests fail before implementation.
- [x] Implement the exclusion with a fallback, and record the decision in ADR-005.
- [x] Validate full suite, coverage, types, lint, formatting and bundle.

## Test Strategy
- Assert the exclusion arguments, the resulting log range, and the prompt's previous-tag line.
- Assert the fallback path when the filtered lookup finds nothing, standing in for other tag conventions and for git without `--exclude`.
- Reproduce in a scratch repository with `v2` and `v2.0.0` on one commit.

## Rollback Strategy
- Revert this change and its generated bundle; the previous lookup returns.

## Outcome
- Scratch repository confirms the fix: plain lookup returns `v2`, excluded lookup returns `v2.0.0`, both producing the same two-commit range.
- Full suite: 135 tests, `index.ts` at 100% coverage.
