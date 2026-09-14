# Task: Convert Castoff to TypeScript

## Context
- Owner: Codex
- Date: 2026-09-14
- Mode: Autonomous (authorized refactor)
- PRD Section: 8, 15.1, 15.3

## Scope
- Convert action source and tests to strict TypeScript; retain ncc, Jest, ESM and the packaged JavaScript entrypoint.
- Update linting, build checks, hooks and development documentation.

## Acceptance Criteria
- AC1: Source and tests pass strict type checking.
- AC2: All existing tests pass with coverage ≥75%; the bundled entrypoint still runs on Node 24.
- AC3: Build produces reproducible, self-contained JavaScript in `castoff/dist/`.

## Constraints
- Preserve existing user edits and action inputs/outputs.

## Risks and Tradeoffs
- ESM test transformation and bundling must resolve `.js` imports to TypeScript source.
- Keep JavaScript tool configuration files for direct loading by Node.

## Execution Checklist
- [x] Inspect project and update governing requirements.
- [x] Convert source, tests and tooling.
- [x] Verify types, tests, coverage, lint, formatting and reproducible bundle.
- [x] Update documentation and record evidence.

## Test Strategy
- Run existing tests before and after migration, including mocked API/git failures and packaged entrypoint smoke test.
- Type-check both source and tests; rebuild twice and compare artifact hashes.
- Live OpenAI calls are unnecessary for this source-language refactor.

## Rollback Strategy
- Restore the previous source/tooling and committed bundle together if regression checks fail; rerun coverage and entrypoint tests.

## Outcome
- Converted both source modules and all eight test suites to strict TypeScript. Kept ESM, ncc, Jest, the Node 24 runtime and the existing action interface.
- Added a checked failure path for non-Error exceptions, using their string representation.
- Baseline: 47 tests passed, 100% coverage. After conversion: 48 tests passed, 100% statements, branches, functions and lines on Node 24.18.0.
- Passed: `pnpm typecheck`, `pnpm build`, `pnpm test:coverage`, `pnpm lint`, `pnpm prettier`, `pnpm exec tsc-files --noEmit *.ts`, and `git diff --check`.
- The test suite required execution outside the sandbox because child-process tests received EPERM inside it. Live OpenAI calls were not performed.
- Two successive builds produced identical SHA-256 hashes for every artifact in `dist/`. `dist/index.js`: `bb32618fd71cbaacae59b90bbbec9cb110720c056c32769db5063e706930300e`.
- pnpm 9.7.0 validated the manifest/lockfile pair in an isolated directory with `install --frozen-lockfile --lockfile-only --ignore-scripts --offline`.
- Independent review found no implementation blockers; corrected the local-development/runtime Node version distinction in the documentation.
- PRD sections 7.5, 8, 15.1 and 15.3 updated. Completed plan graduated to [ADR-001](../adr/001-castoff-typescript.md) for PR review on `refactor/castoff-typescript`.
