#!/usr/bin/env bash
set -euo pipefail

if [[ ! "${OPENAI_API_KEY:-}" =~ [^[:space:]] ]]; then
  echo '::error::OPENAI_API_KEY is not available. Configure the GitHub Actions secret for this repository (or export it for local E2E runs).' >&2
  exit 1
fi
