# ADR-009: Build the action bundle at release time

**Status:** Accepted
**Date:** 2026-10-01
**Branch:** feat/release-time-bundle
**PR:** #50
**Supersedes:** —

## Context

`castoff/dist/index.js` and `changelog/dist/index.js` were committed, and CI
verified them with `git diff --exit-code` after a fresh build. ncc inlines
runtime dependencies into the bundle, so any bump of a bundled dependency makes
the committed bundle stale. Dependabot updates manifests and lockfiles but
cannot run a build, so every such bump failed CI on the verification step and
had to be rebuilt by hand — #49 (openai 7.21.0 → 7.23.0) was the second
occurrence, and every future `openai` bump would have been another.

The constraint that shapes the solution: GitHub Actions executes
`dist/index.js` directly from whatever ref a consumer references. There is no
build step on the consumer's side, so **every published tag must carry the
bundle**. Only the question of whether `main` also carries it is open.

A second constraint is specific to this repository. The action resolves the
previous release with `git describe --tags --abbrev=0 HEAD^` (ADR-005), an
ancestry walk. Release tags must therefore name commits that are ancestors of
`main`.

## Decision

Gitignore both `dist/` directories and untrack them. The release workflow
force-adds the bundle into the release commit, tags that commit, then commits
the bundle's removal and pushes `main` at the removal commit:

```
main:  B1 ── R1(+dist) ── C1(-dist) ── B2 ── R2(+dist) ── C2(-dist)
                │                              │
              v2.2.2                         v2.2.3
```

The tag names a commit that carries the bundle; `main`'s tip never does; and the
tagged commit remains an ancestor of `main`, so the next release's previous-tag
lookup still finds it.

Supporting changes: CI drops the verification step, `pre-push` drops the bundle
diff, the E2E workflow builds before any `uses: ./castoff` step, and `make test`
depends on `make build` because the entry-point tests execute the bundle.

## Alternatives Considered

- **Keep the bundle tracked and stop verifying it.** Smallest change, and it
  would have stopped the Dependabot failures, but it leaves a bundle on `main`
  that may not match its source, and the E2E workflow would have gone on testing
  that stale bundle — the opposite of what E2E is for.
- **Release branch holding the bundle, tags pointing into it.** The cleanest
  separation on paper, but it puts every tag off `main` and breaks the ancestry
  walk in ADR-005. Fixing that means replacing ancestry-based resolution with a
  version-sorted tag lookup — a change to the action's core behavior, not to its
  packaging.
- **Rebuild the bundle automatically on Dependabot PRs.** Keeps the artifact
  under review, but every dependency PR would carry a 2 MB generated diff, and
  the bot would need write access to branches it opened.

## Consequences

Positive: dependency bumps touch manifests and the lockfile only, and no
generated file appears in review. The bundle can no longer drift from its source
on `main`, because it is not on `main`. Consumers are unaffected — every tag
carries exactly what it did before.

Negative: each release adds one bookkeeping commit, which appears in the next
release's commit range and may surface in generated notes. A fresh clone must
run `pnpm build` before the entry-point tests pass; `make test` does this, and
the tests fail with an explicit instruction when the bundle is missing. The
release path itself is only exercised by a real release, so the first release
after this change should be watched.

## Implementation Notes

The ordering in `release.yml` is load-bearing and is asserted by
`castoff/release-workflow.test.ts`: tag, then strip, then push. Tagging after
the strip would publish a tag with no bundle; stripping after the push would
leave the bundle on `main`.

`git add -f` is required in the release commit because the paths are ignored.

## Verification

`castoff/bundle.test.ts` asserts both `dist/` directories are gitignored and
untracked. `castoff/release-workflow.test.ts` asserts the tag/strip/push
ordering and the force-add. `castoff/e2e-workflow.test.ts` asserts every job
installs and builds before running the local action. Full suite: 205 tests,
plus `make lint-workflows`.

## Lessons Learned

The packaging question looked independent of the action's behavior and was not:
`git describe` ancestry quietly coupled where tags may live to how releases
resolve their predecessor. Checking that coupling before choosing a design
turned a redesign of the action's core into a change confined to the release
workflow.
