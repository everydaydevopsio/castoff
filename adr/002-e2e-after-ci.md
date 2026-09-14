# ADR-002: Run E2E after successful main CI

**Status:** Accepted
**Date:** 2026-09-14
**Branch:** ci/e2e-after-main-ci

## Context
The live E2E workflow was manual-only. Merged changes need automatic live validation after their CI checks succeed.

## Decision
Subscribe to completed `CI` workflow runs filtered to main. Both jobs require a successful push to main or a manual dispatch. Each job checks out the upstream run's head SHA, with the dispatched SHA as the manual fallback. Grant only contents read permission and use run-ID concurrency groups so separate E2E runs cannot cancel or replace one another.

## Alternatives
- A push trigger would start E2E before knowing CI passed.
- Default-branch checkout could test a newer unvalidated commit if main advances.
- Branch-wide E2E concurrency would drop earlier qualifying runs during rapid merges.

## Consequences
Every successful main push CI completion can launch the existing live matrix and input guardrails. Failed/cancelled CI and PR CI do not run E2E jobs. Manual dispatch is retained. The existing upstream CI concurrency can cancel superseded main CI; those commits do not qualify until CI completes successfully. The automatic trigger becomes active when the workflow lands on the default branch.

## Verification and Rollback
Ten new workflow regression tests fail before the change and pass afterward. Full suite: 58 tests, 100% coverage. Type checks, ESLint, Prettier and actionlint pass. Independent review found no blockers. Revert the change to restore manual-only execution.
