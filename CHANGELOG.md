# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries are added by the [release workflow](.github/workflows/release.yml) from
the `changelog_entry` output of the Castoff action. Releases up to and including
v2.0.0 predate this file; their notes remain on the
[releases page](https://github.com/everydaydevopsio/castoff/releases).

## [2.1.0] - 2026-09-17

### Highlights

- Added changelog entry output and support for managing `CHANGELOG.md`, making changelog updates part of the release workflow. (#25)

### Fixes

- Preserved the ordering of the **Unreleased** section when updating changelogs.
- Tightened version validation to enforce the Semantic Versioning (SemVer) grammar.
- Refined the end-to-end footer check to target the expected content more precisely.

### Changes

- Updated examples to demonstrate changelog functionality and corrected outdated documentation references. (#26)

**Release:** `v2.1.0` · **Previous tag:** `v2`
