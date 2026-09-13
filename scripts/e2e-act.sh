#!/usr/bin/env bash
set -euo pipefail

WORKFLOW=".github/workflows/e2e-ai-release-notes.yml"

if ! command -v act >/dev/null 2>&1; then
  echo "ERROR: 'act' is not installed. See .github/workflows/README-ACT.md"
  exit 1
fi

if [[ ! -e .secrets ]]; then
  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    echo "ERROR: .secrets is missing and OPENAI_API_KEY is not set." >&2
    echo "Export OPENAI_API_KEY, then rerun make e2e-act." >&2
    exit 1
  fi
  (umask 077; set -o noclobber; printf 'OPENAI_API_KEY=%s\n' "${OPENAI_API_KEY}" > .secrets)
fi

exec act -W "${WORKFLOW}" workflow_dispatch
