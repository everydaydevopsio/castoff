# ADR-007: Publish the changelog writer as a second action

**Status:** Accepted
**Date:** 2026-09-17
**Branch:** feat/changelog-action
**Supersedes:** the `scripts/update-changelog.sh` half of [ADR-004](004-changelog-entry-output.md)

## Context

ADR-004 split generation from file management: the action returns entry text, and a shell script inserts it. That worked for this repository, whose workflow has the script in its own checkout, but not for consumers. The reusable workflows under `examples/` had to check out `everydaydevopsio/castoff` into `.castoff` purely to reach a shell file, which is an awkward interface and pins a second reference to keep in step.

The script had also grown past what shell suits. Validation, Unreleased-aware insertion, idempotency and an atomic replace were covered by tests that spawned bash for every case, in a repository that otherwise authors everything in TypeScript with strict type checking (ADR-001).

## Decision

Publish the writer as a second action, `changelog/`, authored in TypeScript and bundled like the first. Consumers reference `everydaydevopsio/castoff/changelog@v2` and pass `version` and `entry`; the repository checkout disappears from the examples.

The split ADR-004 drew still holds, and is now drawn between two actions rather than between an action and a script: the notes action writes no files, and the changelog action writes one file and performs no git operations. Staging, committing and pushing stay in the calling workflow, which is the only place that knows whether a tag has already been pushed.

The action reports `updated`, so a workflow can skip an empty commit or an amend of an unchanged tree. That distinction was invisible in the shell version, where callers had to inspect the index with `git diff --quiet --cached`.

## Alternatives Considered

- A bundled CLI script invoked with `node` keeps the port but leaves consumers checking out the repository to reach a file.
- Folding the behavior into the notes action would reverse ADR-004: one action would then call OpenAI, write a file and own a file format.
- Keeping the shell script leaves consumers with the checkout and the test suite spawning bash.

## Consequences

Consumers get a documented interface instead of a path into someone else's repository. The workspace gains a second package, a second committed bundle, and a second bundle-freshness check in CI. Tests run in process rather than spawning bash, so the suite covers the write path directly, including mode preservation and staging cleanup.

The changelog action ships from v2.2.0. The examples reference `@v2`, so they work once that release moves the floating major tag.

## Verification

49 tests cover the port, including every case the shell suite covered: creation, insertion order, Unreleased ordering, idempotency, version-prefix collisions, the SemVer grammar, literal entry content, mode preservation and staging cleanup. The built bundle was exercised directly against a scratch directory: it creates the file, inserts the entry, and on rerun reports `updated: false` and leaves the file untouched.

## Rollback

Restore `scripts/update-changelog.sh` and its tests, revert the release workflow and examples to the script, and delete the `changelog` package.
