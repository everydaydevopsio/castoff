# Task: Release-note attribution (#21)

## Context
- Date: 2026-09-14
- Mode: Autonomous within the user’s authorization to implement issue #21 and create a PR.
- PRD Section: 7.2.1

## Scope and Acceptance Criteria
- Append one deterministic Castoff attribution footer to the action output, including fallback notes.
- Match the resolved request model, preserving input/environment/default precedence and note sections.
- Replace existing trailing attribution footers to avoid duplicates.

## Execution Checklist
- [x] Review issue and update PRD.
- [x] Prove regression tests fail before implementation.
- [x] Implement footer and update documentation and bundle.
- [x] Validate full suite, coverage, types, lint and formatting.

## Test Strategy
- Test full output, duplicate/stale footers, fallback notes, and model precedence.
- Existing error tests cover API/input failures.

## Rollback Strategy
- Revert this change and its generated bundle; verify the previous output with the full suite.

## Outcome
- Eight output regression cases failed before implementation; the footer-only response test also caught a boundary case before correction.
- Full suite: 65 tests, 100% coverage. Build/typecheck, ESLint and Prettier pass.
- PRD 7.2.1 documents output behavior; ADR-003 records the decision.
- Ready for PR CI and Copilot review. PR will close #21.
