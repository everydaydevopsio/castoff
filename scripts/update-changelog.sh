#!/usr/bin/env bash
# Insert a release entry at the top of a Keep a Changelog file.
# Usage: update-changelog.sh <version> [changelog-file] < entry
set -euo pipefail

version="${1:-}"
changelog="${2:-CHANGELOG.md}"

# The SemVer 2.0.0 grammar from semver.org, as a POSIX ERE: no leading zeros
# in the numeric parts, and no empty or leading-dot prerelease/build identifiers.
semver_identifier='(0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)'
semver="^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
semver+="(-${semver_identifier}(\.${semver_identifier})*)?"
semver+="([+][0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$"

if [[ ! "$version" =~ $semver ]]; then
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

# Stage beside the target so the replace below is an atomic same-filesystem
# rename: an interrupted run leaves the existing changelog intact.
inserted="$(mktemp "${changelog}.XXXXXX")"
trap 'rm -f "$inserted"' EXIT
cp -p "$changelog" "$inserted"

# Read the entry from the environment so awk never parses it as syntax.
ENTRY="$entry" awk '
  # Keep a Changelog puts Unreleased first; releases go below it.
  function unreleased(line) { return tolower(line) ~ /^## +\[?unreleased\]?/ }
  !done && /^## / && !unreleased($0) { printf "%s\n\n", ENVIRON["ENTRY"]; done = 1 }
  { print }
  END { if (!done) printf "\n%s\n", ENVIRON["ENTRY"] }
' "$changelog" > "$inserted"

mv -f "$inserted" "$changelog"
echo "Added $version to $changelog."
