# Task: Build the action bundle at release time

## Context

- Date: 2026-10-01
- Mode: Approval-Required (design chosen with the user)
- Trigger: #49 had to be rebuilt by hand because ncc inlines `openai` into the
  committed bundle and Dependabot cannot run a build. Every future bump of a
  bundled dependency would fail CI the same way.
- Graduated to [ADR-009](../adr/009-release-time-bundle.md).

## Scope

- In scope: where the bundle lives, and every workflow, hook and command that
  assumed it was committed.
- Out of scope: how the action resolves the previous tag. Keeping the bundle's
  tagged commit an ancestor of `main` is exactly what avoids touching ADR-005.

## Acceptance Criteria

- AC1: Both `dist/` directories are gitignored and untracked on `main`.
- AC2: Published tags still carry the bundle, so consumers are unaffected.
- AC3: Tagged commits remain ancestors of `main`, so `git describe HEAD^` still
  finds the previous release.
- AC4: Nothing in CI or the hooks compares a committed bundle to a build.
- AC5: Every workflow that runs `uses: ./castoff` builds it first.

## Risks and Tradeoffs

- Risk: the release path is only exercised by a real release. The workflow tests
  assert the ordering that makes it correct, but the first release after this
  change should be watched.
- Tradeoff: one bookkeeping commit per release, visible in the next release's
  commit range.

## Execution Checklist

- [x] Confirm the ancestry constraint in `describePreviousTag` and ADR-005
      before choosing a design.
- [x] Tests first: untracked-and-ignored bundle, tag/strip/push ordering,
      build-before-use in both E2E jobs.
- [x] Gitignore and `git rm -r --cached` both `dist/` directories.
- [x] Release workflow: `git add -f`, tag, strip, push.
- [x] Drop the verification step from CI and the diff from `pre-push`.
- [x] Build before `uses: ./castoff` in both E2E jobs.
- [x] `make test` and `make test-coverage` depend on `build`; the entry-point
      test names the missing bundle instead of failing obscurely.
- [x] README, `docs/architecture.md`, repository facts, ADR-009.
- [x] Scope the actionlint ignore to the missing-bundle message only, after CI
      showed it resolves a local action's `main:` file statically.
- [x] Build before `pnpm test` in `release.yml` — Copilot caught that the
      release ran tests before any build, so every release would have died at
      the test step. Pinned by a build-before-test assertion over both
      workflows.

## Test Strategy

- Unit: `castoff/bundle.test.ts` (new) asserts both paths are ignored and
  untracked — all four assertions were watched failing first.
- Integration: `release-workflow.test.ts` asserts tag → strip → push ordering
  and the force-add; `e2e-workflow.test.ts` asserts each job installs and builds
  before the local action.
- Failure path: deleted both `dist/` directories and confirmed the entry-point
  test reports the missing bundle with the command to fix it.
- Regression: 209 tests, `make lint-workflows` (verified with both `dist/`
  directories deleted), `pnpm lint`, `pnpm prettier`.
- Simulation: two releases in a scratch repo confirming the tag carries the
  bundle, `main`'s tip does not, and the previous-tag lookup still resolves.

## Rollback Strategy

- Trigger: the first release after this change fails to tag, or publishes a tag
  without a bundle.
- Rollback steps: revert the PR, then `git add -f castoff/dist changelog/dist`
  and commit to restore a tracked bundle on `main`.
- Validation after rollback: `pnpm build` and a clean `git diff -- */dist/`.

## Outcome

- Result: the bundle is built at release time and carried only by the tag.
- Evidence: see Test Strategy; ADR-009 records the decision and the two
  alternatives rejected.
- Follow-up: watch the next release through, particularly the strip commit and
  the previous-tag lookup in the release after it.
