# Task: Publish the changelog writer as a TypeScript action

## Context

- Date: 2026-09-17
- Mode: Autonomous within the user's authorization to move `scripts/update-changelog.sh` into TypeScript as a second action.
- PRD Section: 15.3

## Scope and Acceptance Criteria

- Port the shell script to TypeScript with identical behavior, as a second action under `changelog/`.
- Remove the repository checkout from the examples: consumers reference the action by tag.
- Report whether the file changed, so workflows skip an empty commit or a pointless amend.
- Delete the script and its bash-spawning tests once the port covers the same cases.

## Execution Checklist

- [x] Scaffold the package in the workspace and port the logic.
- [x] Port every shell test case, plus mode preservation and staging cleanup.
- [x] Rewire the release workflow, the examples and their tests.
- [x] Exercise the built bundle directly, including a rerun.
- [x] Validate build, tests, coverage, lint and formatting across both packages.

## Test Strategy

- Unit tests for validation, Unreleased detection, version matching and insertion.
- Run tests against a temporary directory for creation, ordering, idempotency, literal content, file mode, staging cleanup and failure paths.
- Workflow tests assert the examples no longer check out this repository.

## Rollback Strategy

- Restore the script and its tests; revert the release workflow and examples.

## Outcome

- 155 tests across both packages; the changelog package covers 100% of lines.
- ADR-007 records the decision and supersedes the script half of ADR-004.
