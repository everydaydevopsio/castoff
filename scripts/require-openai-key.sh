#!/usr/bin/env bash
set -euo pipefail

# Fail a release or E2E run at its first step when the OpenAI key is missing,
# rather than partway through when the action itself cannot reach the API.
# Runs before any version bump, commit or tag, so a missing key never leaves a
# half-mutated release behind.

if [[ "${OPENAI_API_KEY:-}" =~ [^[:space:]] ]]; then
  exit 0
fi

reason='OPENAI_API_KEY is not available to this workflow, so release notes cannot be generated.'
fix='Add it under Settings > Secrets and variables > Actions as a repository secret named OPENAI_API_KEY, or grant the organization secret to this repository. For local E2E runs, export OPENAI_API_KEY before make e2e-act.'
note='Nothing has been changed: no version bump, commit, tag or release. Re-run this workflow once the secret is set.'

echo "::error title=Missing OPENAI_API_KEY::${reason} ${fix} ${note}" >&2

# The annotation is easy to miss in a long log, so repeat it on the run summary
# page, which is the first thing a maintainer opens after a failed release.
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo '### Release stopped: missing OPENAI_API_KEY'
    echo
    echo "${reason}"
    echo
    echo "**How to fix:** ${fix}"
    echo
    echo "${note}"
  } >>"${GITHUB_STEP_SUMMARY}"
fi

exit 1
