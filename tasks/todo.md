# Task: Run E2E after successful main CI

## Context
- Date: 2026-09-14
- Mode: Autonomous within the user's explicit authorization for the workflow change
- PRD: Section 15.5

## Scope and Acceptance Criteria
- Trigger E2E on successful CI completion for pushes to main, including merges.
- Skip failed/cancelled CI and pull-request CI; retain manual dispatch.
- Test the exact upstream SHA and preserve separate E2E runs during rapid merges.

## Execution Checklist
- [x] Update PRD and define plan.
- [x] Add regression tests and confirm they fail on the previous workflow.
- [x] Implement trigger, job guards, checkout refs and concurrency.
- [x] Update docs and complete independent review.
- [x] Validate tests, types, lint, formatting and actionlint.

## Verification
- All 10 new tests failed before implementation because trigger, guards, checkout refs and concurrency isolation were absent; all pass afterward.
- Full suite: 58 tests pass, 100% coverage on Node 24.18.0.
- Passed: pnpm typecheck, pnpm lint, pnpm prettier, actionlint .github/workflows/e2e-ai-release-notes.yml.
- Independent review found no blockers.
- Automatic workflow_run chaining can only be observed once the workflow is merged onto the default branch. The existing CI can cancel superseded main runs; only successful completions qualify for E2E.

## Rollback
- Revert this change to restore manual-only E2E; no secrets or action code were changed.

## Outcome
- Ready for PR CI and Copilot review; design recorded in ADR-002.
