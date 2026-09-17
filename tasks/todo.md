# Task: CHANGELOG.md creation and management

## Context
- Date: 2026-09-17
- Mode: Autonomous within the user's authorization to implement changelog support and open a PR.
- PRD Sections: 7.2.2, 15.2, 15.3

## Scope and Acceptance Criteria
- Emit a `changelog_entry` output: dated version heading, sections demoted one level, no attribution footer.
- Ship `scripts/update-changelog.sh` to create, insert and no-op idempotently.
- Run the script in `release.yml` between note generation and tagging, amending the release commit.
- Exclude the workflow's own `chore: release` commit from generated notes.
- Seed `CHANGELOG.md` without inventing history for releases up to v2.0.0.

## Execution Checklist
- [x] Review the release workflow and action, and update the PRD.
- [x] Prove regression tests fail before implementation.
- [x] Implement the output, the script, the workflow steps and documentation.
- [x] Validate full suite, coverage, types, lint and formatting.

## Test Strategy
- Unit: heading demotion (fenced code, level six), footer stripping, date and version formatting, empty notes, release-commit filtering.
- Script: creation, insertion order, idempotency, version-prefix collisions, invalid version and empty entry, metacharacter handling.
- Workflow: step order, entry passed as environment data, live E2E entry shape.

## Rollback Strategy
- Revert this change and its generated bundle; `CHANGELOG.md` stays valid and hand-editable.

## Outcome
- 21 regression cases failed before implementation; full suite now passes with coverage above threshold.
- ADR-004 records the decision to keep the action file-system free and write the file from the workflow.
