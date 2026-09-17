# ADR-005: Resolve the previous tag to an exact version

**Status:** Accepted
**Date:** 2026-09-17
**Branch:** fix/previous-exact-tag

## Context
The v2.1.0 release notes reported ``**Previous tag:** `v2` `` and carried that line into `CHANGELOG.md`. The release workflow force-moves a floating major tag (`vN`) onto each release, so at generation time `v2` and `v2.0.0` pointed at the same commit and `git describe --tags --abbrev=0 HEAD^` reported the floating one. The v2.0.0 notes show the same thing a release earlier, as a `v1...v2.0.0` compare link.

The commit range was never wrong: the floating tag always sits on the previous release commit, so `v2..HEAD` and `v2.0.0..HEAD` cover the same commits. Only the label given to the model was wrong. That label is not inert — the model has turned it into a compare link, and a link anchored on a floating tag goes stale as soon as that tag moves.

## Decision
Exclude floating major tags from the lookup with `--exclude 'v[0-9]' --exclude 'v[0-9][0-9]'`, then fall back to the unfiltered lookup when it finds nothing. Excluding a narrow, known tag shape leaves every other tag convention untouched, and the fallback covers repositories whose only tags are floating, repositories using other conventions, and git versions predating `--exclude`.

## Alternatives Considered
- `--match 'v[0-9]*.[0-9]*.[0-9]*'` would restrict the search to semantic version tags, but in a repository mixing tag schemes it can select a farther tag than the unfiltered lookup and widen the range.
- Removing the floating major tag from the release workflow would break the documented `@v2` reference that consumers and the example workflows rely on.
- Leaving it alone keeps a misleading label in every release note and changelog entry.

## Consequences
Notes name the exact previous version. Majors above `v99` would fall back to the current behavior; the fallback is the existing code path, so no release is worse off than before.

## Verification
Unit tests cover the exclusion arguments, the resulting commit range, the prompt's previous-tag line, and the fallback path for a non-matching tag scheme. The scenario was reproduced in a scratch repository: with `v2` and `v2.0.0` on one commit, the plain lookup returns `v2` and the excluded lookup returns `v2.0.0`, both producing the same range.

## Rollback
Revert this change and the generated bundle to restore the unfiltered lookup.
