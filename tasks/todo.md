# Task: Changelog usage across documentation and examples

## Context
- Date: 2026-09-17
- Mode: Autonomous within the user's authorization to update documentation and this repo's usage of the changelog feature, then open a PR.
- PRD Sections: 15.3, 15.5, 15.6

## Scope and Acceptance Criteria
- Bring PRD 15.3 and 15.6 in line with the behavior merged in #25 (Unreleased ordering, SemVer grammar, atomic replace, canonical footer match).
- Correct stale action references: `@v1` in both READMEs and both examples, `@v0`/`@v0.1.0` in PRD 15.5.
- Add an opt-in `update_changelog` input to both reusable example workflows.
- Document the follow-up-commit limitation, which the examples cannot avoid because they push the tag before generating notes.

## Execution Checklist
- [x] Audit documentation against merged behavior and find stale references.
- [x] Confirm the examples' approach with the user before rewriting published workflows.
- [x] Wire the changelog into both examples and document it in their READMEs.
- [x] Prove the example step end to end, including a rerun.
- [x] Validate full suite, coverage, types, lint and formatting.

## Test Strategy
- Parse both example workflows and assert the input default, step order, opt-in condition, pinned refs, and environment passing.
- Simulate the example step in a scratch git repository to confirm it commits once and no-ops on rerun.

## Rollback Strategy
- Revert this change; the action and this repository's release workflow are unaffected.

## Outcome
- 133 tests pass with `index.ts` at 100% coverage; no action or bundle changes.
- The examples require Castoff v2.1.0, which the next release will publish; noted in both example READMEs.
