# Changelog Entry Writer — GitHub Action

[![CI](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml)
[![Release](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/everydaydevopsio/castoff)](../LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/everydaydevopsio/castoff)](https://github.com/everydaydevopsio/castoff/releases)

This action inserts a release entry into a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
file. It pairs with the [castoff action](../castoff/README.md), whose
`changelog_entry` output is already formatted for it, but it accepts any Markdown
entry.

It writes the file and nothing else: staging, committing and pushing stay in the
workflow, where they belong.

## Inputs

- `version` (required) – release version without a leading `v`, for example `1.2.3`
- `entry` (required) – Markdown entry for this release
- `file` (optional) – changelog path, default `CHANGELOG.md`

## Outputs

- `updated` – `true` when the entry was inserted, `false` when the version was
  already documented
- `file` – path of the changelog file

## Example Usage

```yaml
- name: Generate AI release notes
  id: notes
  uses: everydaydevopsio/castoff/castoff@v2
  with:
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    tag: ${{ steps.bump.outputs.tag }}

- name: Update CHANGELOG.md
  id: changelog
  uses: everydaydevopsio/castoff/changelog@v2
  with:
    version: ${{ steps.bump.outputs.version }}
    entry: ${{ steps.notes.outputs.changelog_entry }}

- name: Commit the changelog
  if: steps.changelog.outputs.updated == 'true'
  run: |
    git add CHANGELOG.md
    git commit -m "docs: update changelog for v${{ steps.bump.outputs.version }}"
    git push origin HEAD
```

## Behavior

- Creates the file with a Keep a Changelog header when it does not exist.
- Inserts the entry above the newest released version, and below an
  `## [Unreleased]` section when the file has one.
- Does nothing when the version already has a `## [<version>]` heading, so
  rerunning a failed release is safe. `updated` reports `false`.
- Rejects a version outside the [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html)
  grammar, including a leading `v`, and rejects an empty entry.
- Replaces the file through a rename, so an interrupted run leaves the existing
  changelog intact. The staging copy inherits the target's mode.

Entry text is written literally. It is never interpreted as shell, formatting or
pattern syntax.

## Development

See the [root README](../README.md#development). This package is part of the
repository's pnpm workspace; run `pnpm --filter castoff-changelog test` from the
repository root. `dist/index.js` is committed, and CI verifies it matches the
source.

## License

MIT License - see [LICENSE](../LICENSE) file for details.
