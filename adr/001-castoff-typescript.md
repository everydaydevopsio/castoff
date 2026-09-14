# ADR-001: Author Castoff in TypeScript

**Status:** Accepted
**Date:** 2026-09-14
**Branch:** refactor/castoff-typescript

## Context

Castoff needs compile-time checks for action logic and tests while continuing to ship JavaScript that GitHub Actions can execute directly.

## Decision

Author both source modules and all eight test suites in strict TypeScript. Retain ESM, ncc bundling, Jest, the Node 24 action runtime and the existing inputs and outputs. Keep workflow metadata in YAML and tool configuration in JavaScript.

`pnpm build` type-checks source and tests before bundling `main.ts` into `dist/index.js`. Commit the bundle and check its freshness in CI. Jest uses ts-jest with ESM and relative `.js` imports mapped to TypeScript source. Use explicit `@jest/globals` imports to avoid conflicting ambient Jest declarations.

## Alternatives Considered

- Replacing ncc with Rollup would add an unnecessary build-system migration.
- Keeping JavaScript tests would leave mocks and fixtures without type checking.

## Consequences

- Source, tests and mocks receive compile-time validation without consumer setup changes.
- Developers must build before committing action changes; generated JavaScript remains tracked.
- TypeScript, ts-jest and TypeScript-aware linting add development dependencies.
- Non-Error exceptions now produce their string representation in action failures.

## Verification

- 48 tests passed with 100% statements, branches, functions and lines on Node 24.18.0, including packaged-action and shell failure paths.
- Type checking, staged-file type checking, linting and formatting passed.
- Successive builds produced identical SHA-256 hashes for every distribution artifact.
- pnpm 9.7.0 accepted the frozen manifest/lockfile pair.
- Detailed evidence and rollback strategy: [task record](../tasks/todo.md).
