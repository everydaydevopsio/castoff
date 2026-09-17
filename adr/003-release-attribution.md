# ADR-003: Append release-note attribution after generation

**Status:** Accepted
**Date:** 2026-09-14
**Branch:** feat/21-release-attribution
**Issue:** #21

## Context

Release notes did not identify Castoff or the model used. Attribution must reach both this repository's releases and downstream users.

## Decision

Append the footer to the action's release_notes output after extraction, using the already resolved request model. Replace canonical trailing Castoff footers, including stale model names, so processing is idempotent. Preserve preceding note sections and include attribution on fallback notes.

## Alternatives Considered

- Prompt-only attribution cannot guarantee consistent output or the correct model.
- Workflow-only attribution would not cover downstream action consumers.

## Consequences

Consumers get attribution without workflow changes. Deduplication recognizes the canonical footer format; attribution mentioned within the note body remains content.

## Verification

Regression tests prove footer placement, model input/environment/default precedence, fallback output, duplicate and stale footers, footer-only output, CRLF, and preservation of note sections. Full suite passes with 100% coverage; typecheck, build, lint and formatting pass.

## Rollback

Revert this change and the generated bundle to restore unattributed output.
