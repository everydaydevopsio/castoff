# Task: Align Node and TypeScript versions and unblock Dependabot

## Context

- Date: 2026-09-21
- Mode: Autonomous within the user's request to pin TypeScript 6, move Node
  tooling to v25, and stop Dependabot proposing majors for those two.
- Trigger: all three open Dependabot PRs failed CI in under 30s.

## Scope and Acceptance Criteria

- Dependabot updates the root `pnpm-lock.yaml` alongside every manifest, so its
  PRs can pass `pnpm install --frozen-lockfile`.
- Dependabot never proposes a major bump of `typescript` or `@types/node`.
- TypeScript is 6.x; `@types/node` is 25.x, matching `.nvmrc`.
- CI installs the Node version from `.nvmrc` rather than a hardcoded one.

## Execution Checklist

- [x] Point the npm ecosystem at `/` and add major-version ignores.
- [x] Bump `typescript` to ^6.0.3 and `@types/node` to ^25.9.8 in both packages.
- [x] Fold in the `openai` 7.20.0 bump that PR #30 proposed.
- [x] Replace CI's hardcoded `node-version: '24'` with `.nvmrc`.
- [x] Rebuild the bundles and validate typecheck, tests, coverage, lint, format.
- [ ] Close the superseded Dependabot PRs (#30, #31, #32).

## Test Strategy

- `pnpm typecheck`, `pnpm build`, `pnpm test:coverage`, `pnpm lint`,
  `pnpm prettier` across both packages.
- Confirm the committed bundles match a fresh build, as CI does.

## Rollback Strategy

- Revert the branch; the prior lockfile and 5.9/24.x manifests restore cleanly.

## Notes

- `runs.using` in both `action.yml` files stays `node24`: the runner supports
  only `node20` and `node24`, so a `node25` runtime does not exist to target.
