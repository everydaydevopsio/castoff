# AGENTS.md

This file provides guidance to Codex (CLI and app) for working in this repository.

## Installed agent rules

Created by [Ballast](https://github.com/everydaydevopsio/ballast) v5.18.3. Do not edit this section.

Read and follow these rule files in `.codex/rules/` when they apply:

- `.codex/rules/local-dev-badges.md` — Add standard badges (CI, Release, License, GitHub Release, npm) to the top of README.md
- `.codex/rules/local-dev-env.md` — Local development environment specialist - reproducible dev setup, DX, and documentation
- `.codex/rules/local-dev-license.md` — License setup - ensure LICENSE file, package.json license field, and README reference (default MIT; overridable in AGENTS.md/CLAUDE.md)
- `.codex/rules/local-dev-mcp.md` — Optional: use GitHub MCP and issues MCP (Jira/Linear/GitHub) for local-dev context
- `.codex/rules/cicd.md` — CI/CD specialist - pipeline design, quality gates, and deployment
- `.codex/rules/observability.md` — Observability specialist - logging, tracing, metrics, and SLOs
- `.codex/rules/typescript-linting.md` — TypeScript linting specialist - implements comprehensive linting and code formatting for TypeScript/JavaScript projects
- `.codex/rules/typescript-logging.md` — Centralized logging specialist - configures Pino with Fluentd for Node/Next.js, and pino-browser to /api/logs
- `.codex/rules/typescript-testing.md` — Testing specialist - sets up Jest (default) or Vitest for Vite projects, 50% coverage, and test step in build GitHub Action
- `.codex/rules/git-hooks.md` — Rules for git-hooks
- `.codex/rules/docs.md` — Documentation specialist - GitHub Markdown docs by default, or maintain existing Docusaurus sites with publish-docs automation
- `.codex/rules/publishing-api.md` — REST API publishing specialist - Docker or platform service CD with runtime health checks
- `.codex/rules/publishing-apps.md` — App publishing specialist - npmjs for Node apps, PyPI for Python apps, GitHub Releases for Go apps
- `.codex/rules/publishing-apt.md` — APT/deb package publishing specialist - GoReleaser nfpms and GitHub Releases
- `.codex/rules/publishing-brew.md` — Homebrew tap publishing specialist - GoReleaser brews block and tap repo setup
- `.codex/rules/publishing-cli.md` — CLI publishing specialist - GoReleaser for Go, npmjs for Node, PyPI for Python
- `.codex/rules/publishing-libraries.md` — Library publishing specialist - npmjs for TypeScript, PyPI for Python, GitHub tags/releases for Go
- `.codex/rules/publishing-sdks.md` — SDK publishing specialist - npmjs for TypeScript SDKs, PyPI for Python SDKs, GitHub tags/releases for Go SDKs
- `.codex/rules/publishing-web.md` — Web app publishing specialist - Docker or platform app CD on push to main
- `.codex/rules/tasks-task-system.md` — Task system integration - use the configured work item system and configure MCP when active
- `.codex/rules/tasks-todo.md` — Branch-local TODO tracking - manage tasks/todo.md and triage before PR
- `.codex/rules/plan-lifecycle.md` — Plan lifecycle - create, maintain, and graduate plans to ADRs
