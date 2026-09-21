# Task: Move a floating minor tag beside the major

## Context

- Date: 2026-09-21
- Trigger: after the v2.2.1 release, `v2` pointed at v2.2.1 correctly, but no
  `v2.2` existed, so consumers had no way to take patches without also taking
  the next minor release.

## Scope and Acceptance Criteria

- Each release creates or moves `vN` and `vN.M` onto the release commit.
- The scheme generalizes: v2.3 and v3 need no further change.
- The previous-tag lookup keeps reporting the exact version tag, now that a
  second floating shape shares the release commit.
- `v2.2` exists and points at v2.2.1.

## Execution Checklist

- [x] Compute `minor_tag` in the bump step; force and push both floating tags.
- [x] Extend the lookup exclusions to the four `vN.M` digit shapes.
- [x] Assert the exclusion arguments and the workflow's tag handling.
- [x] Record the decision in ADR-008 and update the PRD (7.3, 15.2, 15.5).
- [x] Document the three pinning choices in the READMEs.
- [ ] Create `v2.2` on v2.2.1 once this merges.

## Test Strategy

- `run.test.ts` asserts the full `git describe` argument list, so a missing or
  reordered exclusion fails.
- `release-workflow.test.ts` asserts both tags are computed, both are forced,
  and the exact version tag is created once and never forced.

## Rollback Strategy

- Revert the branch and the bundle, then delete the `vN.M` tags. Consumers on
  `@v2` or an exact version are unaffected.

## Notes

- ADR-005 rejected `--match 'v[0-9]*.[0-9]*.[0-9]*'` because it can widen the
  range in a repository mixing tag schemes; the exclusion list is extended
  rather than replaced for that reason.
