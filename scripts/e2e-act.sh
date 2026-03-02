#!/usr/bin/env bash
set -euo pipefail

WORKFLOW=".github/workflows/e2e-ai-release-notes.yml"
MODE="${1:-}"

if ! command -v act >/dev/null 2>&1; then
  echo "ERROR: 'act' is not installed. See .github/workflows/README-ACT.md"
  exit 1
fi

if [[ "${MODE}" == "--live" ]]; then
  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    echo "ERROR: OPENAI_API_KEY is required for live run."
    echo "Example: OPENAI_API_KEY=sk-... make e2e-act-live"
    exit 1
  fi
  exec act -W "${WORKFLOW}" workflow_dispatch -s OPENAI_API_KEY="${OPENAI_API_KEY}"
fi

exec act -W "${WORKFLOW}" workflow_dispatch
