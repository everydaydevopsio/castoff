# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries are added by the [release workflow](.github/workflows/release.yml) from
the `changelog_entry` output of the Castoff action. Releases up to and including
v2.0.0 predate this file; their notes remain on the
[releases page](https://github.com/everydaydevopsio/castoff/releases).

## [2.2.2] - 2026-10-01

### Highlights

- **Release-time action bundling:** The action bundle is now built during the release workflow. (#50)
- **Floating minor-version tag:** Releases now update a floating minor tag alongside the existing major tag, allowing users to track a minor release line. (#38)
- **Validated workflow examples:** Added linting for example workflows and documentation explaining how to use them. (#39)

### Fixes

- Ensured the release workflow builds the action before running tests. (#50)
- Adjusted workflow linting to focus on checks relevant to the updated repository layout. (#50)
- Addressed review findings in workflow validation and example documentation. (#39)
- Resolved repository rule-compliance gaps and added a dedicated Prettier ignore file for the changelog. (#46)

### Changes

- Updated the OpenAI dependency to **7.23.0** and rebuilt the action bundle. (#42, #49)
- Updated development and testing dependencies, including `@types/node` to **24.19.0** and `ts-jest` to **29.4.14**. (#40, #44, #47, #48)
- Refreshed Ballast-managed rules and skills to **5.21.0**, narrowed the configuration to match repository needs, and removed the unused publishing agent. (#43)

## [2.2.1] - 2026-09-21

### Highlights

- Improved changelog output by removing redundant release-version text and aligning closing-hash parsing with CommonMark.
- Aligned the toolchain with Node.js 24, the runtime declared by the actions.

### Fixes

- Prevented changelog entries from repeating the release version in their titles.
- Corrected handling of closing hash sequences in Markdown headings to follow CommonMark rules.
- Fixed Dependabot configuration.

### Changes

- Pinned TypeScript 6 and updated Node.js type definitions to version 25.
- Revised repository documentation to accurately describe the workspace.
- Clarified the distinction between the action’s API-key input and the secret name used by workflows.
- Documented where the release process stops when `OPENAI_API_KEY` is missing.

## [2.2.0] - 2026-09-21

### Highlights

- **Changelog writer available as a TypeScript action**, making it reusable in GitHub Actions workflows. (#29)

### Fixes

- Resolve the previous release tag to an exact version for accurate release comparisons. (#27)
- Stage both bundles during release preparation and preserve whitespace in changelog entries. (#29)
- Add regression coverage for changelog heading boundaries. (#29)

### Changes

- Move to a pnpm 10 workspace and use Husky to manage Git hooks. (#28)
- Apply formatting to files previously missed by the hooks. (#28)

**Full changelog:** [v2.1.0 → v2.2.0](../../compare/v2.1.0...v2.2.0)

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
