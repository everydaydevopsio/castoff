# ADR-004: Emit a changelog entry output and write the file in the workflow

**Status:** Accepted
**Date:** 2026-09-17
**Branch:** feat/changelog-management

## Context

The repository had no `CHANGELOG.md`; release notes lived only on the releases page. The generator half of the problem was already solved — correct commit range, grouped prose, deterministic fallback — but nothing produced a file entry. Release-body formatting does not transfer directly: `## Highlights` collides with the version heading a changelog needs, and the attribution footer added by ADR-003 would repeat once per entry in a file that accumulates them.

## Decision

Split generation from file management. The action gains a `changelog_entry` output derived from the same notes: a `## [<version>] - <YYYY-MM-DD>` heading, sections demoted one level, no attribution footer. The action still writes no files. A repository script, `scripts/update-changelog.sh`, inserts an entry, and `release.yml` runs it between note generation and tagging, amending the release commit so the tag carries its own changelog.

Notes are also filtered for `chore: release <version>` commits, which the workflow creates before generating notes; they describe the release rather than a change within it, and they are more visible in a permanent file than in a release body.

## Alternatives Considered

- Writing `CHANGELOG.md` from inside the action would add file mutation and git state to a unit that is currently pure, and would force a file layout on consumers.
- Generating the entry only in this repository's workflow would leave downstream consumers to build a second generator.
- Committing the changelog separately after the release commit would leave the tag pointing at a tree without its own changelog.

## Consequences

Consumers get a ready-to-insert entry and choose their own file conventions; this repository gets a maintained `CHANGELOG.md` with no extra model call. The script owns idempotency, so a rerun of a failed release does not duplicate a section. Entry text reaches the workflow through the environment and `awk` through `ENVIRON`, so generated content is never parsed as syntax.

## Verification

Unit tests cover heading demotion including fenced code and level six, footer stripping, version and date formatting, empty-note fallback, and release-commit filtering. Script tests cover creation, insertion order, idempotency, version-prefix collisions, invalid input, and literal handling of shell and awk metacharacters. Workflow tests assert step order and that the entry is passed as environment data. The live E2E workflow checks the entry heading and the absence of the footer. Full suite passes with coverage above threshold; typecheck, build, lint and formatting pass.

## Rollback

Revert this change and the generated bundle. `CHANGELOG.md` remains valid and can be maintained by hand.
