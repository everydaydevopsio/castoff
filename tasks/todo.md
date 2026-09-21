# Task: Make a missing OpenAI key explain itself

## Context

- Date: 2026-09-21
- Mode: Autonomous within the user's request to document the key guard so a
  blocked release pipeline is self-explaining.
- The guard already existed (`scripts/require-openai-key.sh`, four workflow
  steps, unit tests). What was missing: the failure said what was wrong but not
  where to fix it, and no document told a maintainer why a release stopped.

## Scope and Acceptance Criteria

- A maintainer reading only the failed step learns the secret name, where to set
  it, and that the run changed nothing.
- The explanation also reaches the run summary page, not just the log.
- A successful preflight stays silent and never echoes the key.
- The root README explains the failure, the fix, and the two cases that look
  like a missing secret but are not.

## Execution Checklist

- [x] Rewrite the annotation with a title, the secret location, and a
      no-changes-made statement; mirror it to `GITHUB_STEP_SUMMARY`.
- [x] Extend the preflight tests: message content, summary output, silence and
      non-disclosure on success.
- [x] Add an `OpenAI API key` section to the root README; link it from
      `castoff/README.md`.
- [x] Record the behavior in the PRD (section 8 and section 15.2 step 1).
- [x] Validate typecheck, tests, coverage, lint and formatting.

## Test Strategy

- `castoff/api-key-preflight.test.ts` spawns the script for unset, empty and
  whitespace keys, asserts the guidance text, asserts the summary file contents,
  and asserts a valid key produces no output and no summary entry.
- Workflow behavior is unchanged, so the existing E2E assertion that the
  preflight fails without a key still covers the wiring.

## Rollback Strategy

- Revert the branch. The guard's pass/fail contract is unchanged, so no workflow
  depends on the new text.

## Notes

- The script stays a shell script rather than moving into the action: it must
  run before `pnpm install`, and both the release and E2E workflows call it
  before any Node tooling exists.
