# ADR-006: Manage tooling from a pnpm workspace root

**Status:** Accepted
**Date:** 2026-09-17
**Branch:** chore/pnpm10-workspace-husky

## Context

The npm package lived in `castoff/` while the git root sat one level above it, and three problems followed from that split.

Husky was a dependency that did nothing: `.husky/_/` never existed, the `husky` binary was never invoked, and `castoff/package.json` hand-rolled `git config core.hooksPath .husky` in its `prepare` script. Husky v9 refuses to install when `package.json` is not at the git root, so the hand-rolled line was the workaround.

The hooks reached only `castoff/`. lint-staged ran from that directory, so its globs never matched `scripts/`, `.github/workflows/`, `examples/`, or the root documentation. Thirty-seven files at the root had never been formatted.

Nothing pinned the package manager. CI pinned pnpm 9 in the workflows while Corepack locally resolved whatever its global default happened to be. That default changed from 11.22.0 to 9.15.9 during a single day's work; under 11 every hook invocation failed with `ERR_PNPM_IGNORED_BUILDS`.

## Decision

Make the repository a pnpm workspace. The root `package.json` pins pnpm 10 through `packageManager`, owns husky, lint-staged and Prettier, and installs hooks with a plain `prepare: husky`. The lockfile moves to the root. `castoff/` keeps the action, its dependencies and its own ESLint, Jest and TypeScript configuration.

CI, the release workflow and the Makefile install once at the root and select the package with `--filter castoff`. The Prettier check covers the whole repository.

`pre-push` gains `git diff --exit-code -- castoff/dist/` after the build, matching the check CI already performs, so a stale bundle fails where it can still be fixed.

## Alternatives Considered

- A root `package.json` without a workspace would fix husky and hook scope, but leaves two lockfiles and two installs to keep in sync.
- Dropping husky and renaming `.husky` to `.githooks` is the smallest change and stops the pretence that husky manages anything, but leaves the hooks scoped to `castoff/`.
- Leaving the version unpinned keeps the failure that made every local commit need `--no-verify`.

## Consequences

Hooks cover the repository, so formatting no longer depends on which directory a file happens to live in. Adopting this required formatting the backlog of thirty-seven files in one commit. Contributors and CI resolve the same pnpm version. A second workspace package can now be added without further restructuring.

## Verification

`pnpm install --frozen-lockfile`, `pnpm --filter castoff build`, `pnpm --filter castoff test`, `pnpm --filter castoff lint` and `pnpm prettier` all pass from the root under pnpm 10.34.5. Husky sets `core.hooksPath` to `.husky/_`, and a commit and push on this branch exercised both hooks.

## Rollback

Restore `castoff/pnpm-lock.yaml`, the `prepare` line in `castoff/package.json`, and the per-directory workflow steps; delete the root package and workspace files.
