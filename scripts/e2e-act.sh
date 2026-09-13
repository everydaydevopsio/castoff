#!/usr/bin/env bash
set -euo pipefail

WORKFLOW=".github/workflows/e2e-ai-release-notes.yml"

if ! command -v act >/dev/null 2>&1; then
  echo "ERROR: 'act' is not installed. See .github/workflows/README-ACT.md"
  exit 1
fi

# Pass an explicit empty secret when unset so ACT starts without prompting.
# The workflow owns key validation.
KEY_SECRET="OPENAI_API_KEY="
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  KEY_SECRET="OPENAI_API_KEY"
fi

exec act --secret-file /dev/null --secret "${KEY_SECRET}" \
  --var "OPENAI_MODEL=${OPENAI_MODEL:-}" \
  -W "${WORKFLOW}" workflow_dispatch
