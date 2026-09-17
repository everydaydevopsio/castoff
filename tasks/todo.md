# Task: pnpm 10, workspace root, and working git hooks

## Context

- Date: 2026-09-17
- Mode: Autonomous within the user's authorization to move to pnpm 10, pin the package manager, and relocate husky to the repository root.
- PRD Section: 15.1

## Scope and Acceptance Criteria

- Pin pnpm 10 through the root `packageManager` field so Corepack, CI and the release workflow agree.
- Make the repository a pnpm workspace with one lockfile at the root.
- Let husky install hooks properly, and widen lint-staged to the whole repository.
- Verify the committed bundle in `pre-push`, matching the check CI performs.

## Execution Checklist

- [x] Reproduce the hook failure and confirm the unpinned package manager causes it.
- [x] Prove the hook scope gap by staging a root file and observing lint-staged skip it.
- [x] Create the workspace root, move the lockfile, and rewire CI, release and Makefile.
- [x] Format the repository backlog as its own commit.
- [x] Validate install, build, test, lint, formatting and both hooks under pnpm 10.

## Test Strategy

- Run the full toolchain from the root under pnpm 10, including `--frozen-lockfile`.
- Exercise both hooks by committing and pushing this branch without `--no-verify`.

## Rollback Strategy

- Restore the per-package lockfile and the hand-rolled `prepare`; delete the root package and workspace files.

## Outcome

- Husky now sets `core.hooksPath` to `.husky/_` and manages the hooks it is credited with.
- Thirty-seven previously unformatted files were brought under Prettier.
