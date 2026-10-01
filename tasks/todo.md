# Task: Close the gaps found auditing the repository against its installed rules

## Context

- Date: 2026-10-01
- Mode: Autonomous
- Trigger: a review of every rule file in `.claude/rules/` against the actual
  repository state. Nine findings, eight of them mechanical.

## Scope

- In scope: the documentation set, the coverage gate, Node version declarations,
  Dependabot grouping, badge coverage, task-tracking hygiene, and the
  `CLAUDE.md` Repository Facts block.
- Out of scope: the one historical commit that landed on `main` without a
  branch. Nothing to fix in the tree; worth branch-protecting `main` instead.

## Acceptance Criteria

- AC1: Documentation lives under `docs/` with an index, per the `docs` rule, and
  carries Mermaid diagrams for the release pipeline and the two actions.
- AC2: `main.ts` is inside the coverage gate in both packages, covered by a
  test rather than by lowering the threshold.
- AC3: Every manifest declares the Node major that `.nvmrc` and both
  `action.yml` runtimes already name, and a test fails when they drift.
- AC4: No root `TODO.md`; its one open item is a tracked GitHub issue.

## Execution Checklist

- [x] Add `docs/README.md` as the index and `docs/architecture.md` with a
      component diagram, a release sequence diagram and the changelog writer's
      state diagram.
- [x] Move the ACT guide out of `.github/workflows/` to `docs/local-e2e-act.md`
      and repoint the README links and `scripts/e2e-act.sh`.
- [x] Collect coverage from `main.ts` in both packages and cover the entry
      point wiring with `main.test.ts`.
- [x] Add `engines.node` to all three manifests, with an alignment test in
      `castoff/entrypoint.test.ts`.
- [x] Add the missing `prettier` / `prettier:fix` scripts to `changelog/`.
- [x] Add a `typescript` Dependabot group and `exclude-patterns` on the
      catch-all production group.
- [x] Add the E2E workflow badge to `README.md`.
- [x] Promote the open root `TODO.md` item to
      [issue #45](https://github.com/everydaydevopsio/castoff/issues/45) and
      delete the file.
- [x] Refresh the `CLAUDE.md` Repository Facts block.

## Test Strategy

- Unit: `castoff/main.test.ts` and `changelog/main.test.ts` mock `./index.js`
  and assert the entry point calls `run()` exactly once. Both files were
  measured at 0% before the tests existed.
- Failure-path: the engines test was run against the unmodified manifests first
  and failed on the missing field, not on a typo in the test.
- Regression: `pnpm lint`, `pnpm prettier`, `pnpm test:coverage`, `pnpm build`
  plus the `castoff/dist/` and `changelog/dist/` diff check, and
  `make lint-workflows`.

## Rollback Strategy

- Trigger: a doc link or workflow-lint failure that is not fixable in place.
- Rollback steps: the change is additive apart from two file moves and one
  deletion; `git revert` restores both.
- Validation after rollback: `make lint-workflows` and `pnpm test:coverage`.

## Outcome

- Result: all eight mechanical findings fixed on this branch.
- Evidence: see the Test Strategy commands above.
- Follow-up: issue #45 carries the one item that was not in scope here.
