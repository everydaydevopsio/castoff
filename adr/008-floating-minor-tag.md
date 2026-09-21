# ADR-008: Move a floating minor tag alongside the major

**Status:** Accepted
**Date:** 2026-09-21
**Branch:** feat/floating-minor-tag

## Context

The release workflow moved one floating tag, the major (`vN`), onto each release. A consumer pinning `@v2` therefore accepted every future release in the major line, including minor releases that add behavior. The only alternative on offer was an exact version, which accepts nothing and has to be bumped by hand for each patch.

Between those two sits the tag most action consumers actually want: one that takes security and bug-fix patches but not new behavior. Every widely used action publishes it, and `@v2.2` was simply missing here.

## Decision

Create and force-move a floating minor tag (`vN.M`) beside the major on every release. Both are forced, so the same command creates a series and moves it later, and `v2.2` follows `v2.2.1`, `v2.2.2` and so on while `v2` follows the whole major line.

Extend the previous-tag exclusions to match: the lookup already skipped `v[0-9]` and `v[0-9][0-9]`, and now also skips `v[0-9].[0-9]`, `v[0-9].[0-9][0-9]`, `v[0-9][0-9].[0-9]` and `v[0-9][0-9].[0-9][0-9]`. Without this, `git describe` would report `v2.2` as the previous tag for the same reason ADR-005 was written: the floating tag shares a commit with the exact version tag.

## Alternatives Considered

- Leaving the minor tag out keeps consumers choosing between "every minor release" and "manual patch bumps".
- Switching the lookup to `--match 'v[0-9]*.[0-9]*.[0-9]*'` would exclude both floating shapes at once, but ADR-005 rejected it: in a repository mixing tag schemes it can select a farther tag and widen the commit range.
- Generating the exclusion patterns from the tag being released would couple the action to this repository's workflow; the patterns describe a shape, not a specific release.

## Consequences

Consumers can pin `@v2`, `@v2.2`, or an exact version. Series above `v99` or `v99.99` fall outside the digit patterns and fall back to the existing unfiltered lookup, exactly as before. The exclusion list grows from two patterns to six, generated from one list of digit runs rather than written out.

## Verification

Unit tests assert the six exclusion arguments in the lookup, and a workflow test asserts that both floating tags are computed in the bump step, forced in the tag step, and pushed with `--force`, while the exact version tag is created once and never forced. The v2.2 tag was created on v2.2.1 when this shipped, so the series starts consistent.

## Rollback

Revert this change and the generated bundle, then delete the `vN.M` tags. Consumers pinning `@v2` or an exact version are unaffected.
