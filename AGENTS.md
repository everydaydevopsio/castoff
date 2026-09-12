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

## Installed skills

Created by [Ballast](https://github.com/everydaydevopsio/ballast) v5.18.3. Do not edit this section.

Read and use these skill files in `.codex/skills/` when they are relevant:

- `.codex/skills/owasp-security-scan/SKILL.md` — Run OWASP-aligned security scans across Go, TypeScript, and Python codebases. Use this skill whenever the user asks to: scan for security vulnerabilities, run OWASP checks, audit dependencies, find CVEs, check for injection flaws, run SAST or SCA analysis, review code security, or harden their app against the OWASP Top 10. Also trigger for phrases like "security audit", "check my code for vulns", "are my dependencies safe", or any mention of gosec, bandit, semgrep, or npm audit in a security context. Covers Go, TypeScript/JavaScript, and Python with language-specific tools plus cross-language Semgrep rulesets.
- `.codex/skills/aws-health-review/SKILL.md` — Run a weekly, read-only AWS health review covering configuration issues, performance problems, errors, and warnings. Generates a Markdown report and appends new P0/P1 tasks to TODO.md. Use when asked for AWS health checks, weekly infrastructure review, or configuration/performance triage.
- `.codex/skills/aws-live-health-review/SKILL.md` — Run a read-only AWS live health review for current EC2, RDS, ALB, CloudWatch alarms, and CloudWatch logs, then generate a Markdown status report with current health, risks, and evidence. Use when asked for the system's health right now or a current AWS operations snapshot.
- `.codex/skills/aws-weekly-security-review/SKILL.md` — Run a weekly, read-only AWS security baseline review and generate a Markdown report with prioritized findings. Use when asked for recurring AWS security posture checks, quick risk triage, or a starting point for ongoing cloud hardening.
- `.codex/skills/github-health-check/SKILL.md` — Run a comprehensive GitHub repository health check. Use this skill whenever the user asks to: check GitHub health, audit the repo, check CI status, review open PRs, merge Dependabot PRs, check code coverage, check GitHub Code Quality, check GitHub security feature enablement, check security advisories, check Dependabot alerts, check code scanning alerts, check secret scanning alerts, check Snyk integration, keep GitHub in good shape, or any variation of "how is the repo doing". Also trigger for: "check dependabot PRs", "any PRs to merge", "check branch status", "repo health", "GitHub status check", "what needs attention in GitHub", "tidy up GitHub".
- `.codex/skills/github-pr-copilot-cycle/SKILL.md` — Manage a GitHub pull request feedback loop with Copilot review. Use when asked to create or update a PR, request Copilot as reviewer, collect Copilot review comments, score whether comments need human input, fix actionable feedback, reply or resolve comments, push fixes, check CI, and repeat the Copilot review cycle until no unresolved Copilot comments remain or three cycles have completed.
- `.codex/skills/ballast-audit/SKILL.md` — audit AI rule and skill files for context density, duplication, and bloat
- `.codex/skills/ballast-project-maintenance/SKILL.md` — Inspect, bootstrap, and repair Ballast-managed repository state. Use this skill when a user asks whether a repo is Ballast-managed, why .ballast/ is missing, how to repair local Ballast CLIs, or how to refresh Ballast rules and skills from saved config.
- `.codex/skills/docker-registry-publish/SKILL.md` — Set up Docker image publishing to GHCR or Docker Hub, with public or private visibility and release-safe tags.
