# Task: Validate the example workflows and document them properly

## Context

- Date: 2026-09-21
- Trigger: the four open TODO.md items under `examples/`, all unaddressed since
  the examples were written.
- The example workflows were the only YAML in the repository nothing checked.

## Scope and Acceptance Criteria

- Every workflow, including the reusable ones under `examples/`, is linted in
  CI and locally by one command.
- The linter is pinned and checksum-verified, matching the ACT installer, so no
  third-party action runs in CI.
- Whatever the linter finds on its first run is fixed, not suppressed.
- The node example documents npm publishing and monorepo use; the python
  example documents running with and without AI.

## Execution Checklist

- [x] Add `scripts/install-actionlint.sh` plus checked-in checksums.
- [x] Add `scripts/lint-workflows.sh`, a `workflows` CI job and a
      `lint-workflows` Make target.
- [x] Fix the three findings: an unreachable `level` default in both examples
      and a shellcheck directive for a regex containing backticks.
- [x] Make the AI notes step non-fatal, so the documented fallback can run.
- [x] Expose `tag` and `version` outputs from both example workflows.
- [x] Write the npm publish, monorepo and AI-versus-no-AI sections.
- [x] Cover the new behavior in `examples-workflow.test.ts`.

## Test Strategy

- `scripts/lint-workflows.sh` runs in CI on every push and pull request.
- `examples-workflow.test.ts` asserts the optional `level` input, the
  `continue-on-error` on the notes step paired with the fallback condition, the
  workflow-call outputs, and that CI invokes the linter over `examples/`.

## Rollback Strategy

- Revert the branch. The workflow fixes stand on their own and could be kept
  even if the linting job were dropped.

## Notes

- actionlint runs shellcheck over `run:` blocks, which is how the backtick
  regex in the E2E workflow surfaced. The directive documents intent rather
  than disabling the check repository-wide.
- The binary installs into `.ballast/bin`, which is gitignored, so linting
  needs no sudo and leaves no tracked artifact.
