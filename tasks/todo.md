# Task: Document OpenAI model selection (#45)

## Context

- Date: 2026-11-03
- Mode: Autonomous
- Issue: [#45](https://github.com/everydaydevopsio/castoff/issues/45) — the
  model precedence is documented, but there is no worked example of choosing a
  model per repository, per workflow or from a reusable workflow.

## Scope

- In scope: a model-selection guide, links from the three READMEs that already
  state the precedence, and the same choice wired into both `examples/`
  reusable workflows.
- Out of scope: changing how the action resolves a model, and adding a live E2E
  case for the `model` input (see Outcome).

## Acceptance Criteria

- AC1: One guide covers the `model` input, the `OPENAI_MODEL` variable, which
  wins, and how to confirm the model a release used.
- AC2: Both example workflows accept an optional `model` input and read
  `OPENAI_MODEL` themselves, so a caller can see the choice in a real workflow.
- AC3: The reusable-workflow caveats are documented, not just the happy path.

## Risks and Tradeoffs

- Risk: the examples' `model` input defaults to `''`. A default naming a model
  would silently outrank a caller's `OPENAI_MODEL` variable, so the empty
  default is asserted by a test rather than left to convention.
- Tradeoff: the guide duplicates the precedence rule that `castoff/README.md`
  and the root README already state. Both now link to the guide instead of
  growing their own examples.

## Execution Checklist

- [x] Confirm precedence against `castoff/index.ts` and `run.test.ts` rather
      than the issue text.
- [x] Confirm the two reusable-workflow rules against GitHub's documentation:
      a caller's workflow-level `env` is not propagated, and `vars` inside a
      called workflow resolves against the caller.
- [x] Tests first: `examples-workflow.test.ts` asserts the `model` input, its
      empty default, and the `OPENAI_MODEL` env wiring — watched failing.
- [x] Add `docs/model-selection.md`; link it from `docs/README.md`,
      `README.md` and `castoff/README.md`.
- [x] Add the `model` input to both example workflows and document it in both
      example READMEs.
- [x] Fix the stale "commit the generated `dist/` files" instruction in
      `castoff/README.md`, which ADR-009 reversed.
- [x] Bosun review (PR #57) — repoint every `uses:` that called a workflow
      beneath `examples/`. GitHub resolves reusable workflows only at
      `.github/workflows/` in a repository root, so those references could
      never have started a run. Three were added by this branch and five were
      pre-existing in the two example READMEs; all eight now point at a copy in
      the caller's own `.github/workflows/`, with the copy step stated.

## Test Strategy

- Unit: `examples-workflow.test.ts` — two new assertions per example workflow
  (input shape and step wiring), both watched failing before the workflows
  changed.
- Integration: `make lint-workflows` (actionlint over all five workflows,
  including the two examples) and the full `make test` suite.
- Failure path: covered by the existing precedence matrix in `run.test.ts`
  (empty input, empty env, whitespace-only env), which is what the guide's
  fall-through claims rest on.
- Requirement mapping: AC1 → `docs/model-selection.md`; AC2 → the new tests;
  AC3 → the reusable-workflow section and the failure-modes table.

## Rollback Strategy

- Trigger: a caller reports that passing `model` to an example workflow sends
  the wrong model.
- Rollback steps: revert the workflow change; the docs stand alone.
- Validation after rollback: `make test` and `make lint-workflows`.

## Outcome

- Result: reviewed by Bosun; its one high finding was confirmed against
  GitHub's documentation and fixed in the same branch.
- Evidence: `make test`, `make lint`, `make lint-workflows`, `pnpm prettier`.
- Follow-up: the E2E matrix covers the default and both `OPENAI_MODEL` paths
  but never sets the `model` input, so the documented "input wins" rule is only
  proven by unit tests. Promote to an issue before merge if a live case is
  wanted.
