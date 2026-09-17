#!/usr/bin/env bash
# Insert a release entry at the top of a Keep a Changelog file.
# Usage: update-changelog.sh <version> [changelog-file] < entry
set -euo pipefail

version="${1:-}"
changelog="${2:-CHANGELOG.md}"

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)*$ ]]; then
  echo "::error::update-changelog.sh requires a semantic version without a leading v (for example 1.2.3)." >&2
  exit 1
fi

entry="$(cat)"
if [[ ! "$entry" =~ [^[:space:]] ]]; then
  echo "::error::update-changelog.sh requires a changelog entry on standard input." >&2
  exit 1
fi

if [ ! -f "$changelog" ]; then
  cat > "$changelog" <<'HEADER'
# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
HEADER
fi

# Compare literally: version strings contain regular expression metacharacters.
if awk -v heading="## [$version]" 'index($0, heading) == 1 { found = 1 }
  END { exit found ? 0 : 1 }' "$changelog"; then
  echo "$changelog already documents $version; leaving it unchanged."
  exit 0
fi

inserted="$(mktemp)"
trap 'rm -f "$inserted"' EXIT

# Read the entry from the environment so awk never parses it as syntax.
ENTRY="$entry" awk '
  !done && /^## / { printf "%s\n\n", ENVIRON["ENTRY"]; done = 1 }
  { print }
  END { if (!done) printf "\n%s\n", ENVIRON["ENTRY"] }
' "$changelog" > "$inserted"

cat "$inserted" > "$changelog"
echo "Added $version to $changelog."
