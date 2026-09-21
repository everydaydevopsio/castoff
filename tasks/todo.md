# Task: Stop changelog entries restating the version

## Context

- Date: 2026-09-21
- Trigger: the v2.2.0 release wrote `## [2.2.0] - 2026-09-21` immediately
  followed by `## v2.2.0` into CHANGELOG.md.
- Cause: the model titled its notes `# v2.2.0`, and heading demotion turned
  that title into a second version heading under the entry's own.

## Scope and Acceptance Criteria

- A leading title that only restates the release is dropped before demotion.
- Any other title survives, including one naming a different version.
- `release_notes` keeps its title: only the changelog entry supplies its own
  version heading.
- The v2.2.0 entry already in CHANGELOG.md is corrected.

## Execution Checklist

- [x] Add `stripRedundantTitle` and call it from `buildChangelogEntry`.
- [x] Cover the restated forms, the titles that must survive, and the
      blank-notes paths.
- [x] Remove the duplicate heading from the v2.2.0 entry.
- [x] Document the rule in the PRD (7.2.2) and `castoff/README.md`.
- [x] Rebuild the bundle and validate tests, coverage, lint and formatting.

## Test Strategy

- Table-driven cases through `buildChangelogEntry` for `# v1.2.3`, `# 1.2.3`,
  `# Release v1.2.3`, `# Release 1.2.3`, mixed case and a closed ATX heading.
- Negative cases: a descriptive title, a different version, notes opening with
  prose, notes that are only a title, and blank notes.

## Rollback Strategy

- Revert the branch; entries return to carrying the duplicate heading, which is
  cosmetic and correctable by hand.

## Notes

- Kept `stripRedundantTitle` module-private: it is exercised through
  `buildChangelogEntry`, so the action's exported helper surface is unchanged.
