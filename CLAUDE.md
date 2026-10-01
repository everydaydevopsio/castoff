# CLAUDE.md

This file provides guidance to Claude Code for working in this repository.

## Repository Facts

Use this section for durable repo-specific facts that agents repeatedly need. Prefer facts stored here over re-deriving them with shell commands on every task.

Keep only stable, reviewable metadata here. Do not store secrets, credentials, or ephemeral runtime state.

Suggested facts to record:

- Canonical GitHub repo: `everydaydevopsio/castoff`
- Default branch: `main`
- Primary package manager: `pnpm` (v10, pinned by the root `package.json` `packageManager` field; single lockfile at `pnpm-lock.yaml`)
- pnpm workspace packages: root (git hooks, formatting), `castoff/` (release-notes action), `changelog/` (changelog action). Run scripts from the root: `pnpm build`, or `pnpm --filter castoff build` for one package
- Version-file locations agents should check first: `.nvmrc`; the same Node major is repeated in every `package.json` `engines` field and in both `action.yml` `using:` runtimes, and `castoff/entrypoint.test.ts` fails when they drift
- Canonical config files: `package.json` (workspace root), `pnpm-workspace.yaml`, `castoff/package.json`, `changelog/package.json`, `castoff/eslint.config.js`, `changelog/eslint.config.js`, `castoff/jest.config.js`, `changelog/jest.config.js`, `Makefile`, `.github/dependabot.yml`
- Primary CI workflows: `.github/workflows/ci.yml` (test, workflow lint, lint) and `.github/workflows/e2e-ai-release-notes.yml` (runs after a successful CI push to `main`; also `make e2e-act` locally)
- Primary release/publish workflows: `.github/workflows/release.yml`
- Preferred build/test/lint/format/coverage commands: `make build`, `make test`, `make test-coverage`, `make lint`, `make format`
- Coverage threshold: 75% (lines, functions, branches, statements); coverage is collected from `index.ts` and `main.ts` in both packages
- Generated or protected paths agents should avoid editing directly: `.ballast/`, `castoff/dist/`, `changelog/dist/`, `.husky/_/`
- Git hooks: husky, installed by the root `prepare` script; `core.hooksPath` is `.husky/_`
- Documentation layout: `README.md` is the overview, `docs/README.md` the index, `docs/architecture.md` holds the Mermaid diagrams, and each action documents its own inputs in `castoff/README.md` and `changelog/README.md`
- Task tracking: `tasks/todo.md` is the branch-local record (lowercase, canonical — there is no root `TODO.md`); durable work goes to GitHub issues on `everydaydevopsio/castoff`

Update this section when those facts change. If live runtime state is required, discover it separately instead of treating it as a durable repo fact.

## Installed agent rules

Created by [Ballast](https://github.com/everydaydevopsio/ballast) v5.21.3. Do not edit this section.

### Repository Tool Policy

- Check `.rulesrc.json` `tools` before adding, installing, or running language tooling.
- Configured tools: typescript=pnpm,corepack.
- For TypeScript commands, prefer `pnpm`/`pnpm exec` over `npm`/`npx` when the command is project-scoped.

Read and follow these rule files in `.claude/rules/` when they apply:

- `.claude/rules/local-dev-autonomy.md` — Autonomy policy - minimize low-information questions; proceed on safe reversible work, ask only at protected boundaries
- `.claude/rules/local-dev-badges.md` — Add standard badges (CI, Release, License, GitHub Release, npm) to the top of README.md
- `.claude/rules/local-dev-env.md` — Local development environment specialist - reproducible dev setup, DX, and documentation
- `.claude/rules/local-dev-license.md` — License setup - ensure LICENSE file, package.json license field, and README reference (default MIT; overridable in AGENTS.md/CLAUDE.md)
- `.claude/rules/cicd.md` — CI/CD specialist - pipeline design, quality gates, and deployment
- `.claude/rules/typescript-linting.md` — TypeScript linting specialist - implements comprehensive linting and code formatting for TypeScript/JavaScript projects
- `.claude/rules/typescript-testing.md` — Testing specialist - sets up Jest (default) or Vitest for Vite projects, 50% coverage, and test step in build GitHub Action
- `.claude/rules/git-hooks.md` — Rules for git-hooks
- `.claude/rules/docs.md` — Documentation specialist - GitHub Markdown docs by default, or maintain existing Docusaurus sites with publish-docs automation
- `.claude/rules/tasks-task-system.md` — Task system integration - use the configured work item system and configure MCP when active
- `.claude/rules/tasks-todo.md` — Branch-local TODO tracking - manage tasks/todo.md and triage before PR
- `.claude/rules/plan-lifecycle.md` — Plan lifecycle - create, maintain, and graduate plans to ADRs
- `.claude/rules/testing-process.md` — Testing process specialist - TDD discipline, smoke tests, and E2E policy shared across languages
- `.claude/rules/core.md` — Ballast core invariants - branch discipline, TDD, release and generated-output rules, per-language commands

## Installed skills

Created by [Ballast](https://github.com/everydaydevopsio/ballast) v5.21.3. Do not edit this section.

These skills are registered with Claude Code. Invoke one by name (for example `/ballast-audit`) when it is relevant:

- `/owasp-security-scan` — Run OWASP-aligned security scans across Go, TypeScript, and Python codebases. Use this skill whenever the user asks to: scan for security vulnerabilities, run OWASP checks, audit dependencies, find CVEs, check for injection flaws, run SAST or SCA analysis, review code security, or harden their app against the OWASP Top 10. Also trigger for phrases like "security audit", "check my code for vulns", "are my dependencies safe", or any mention of gosec, bandit, semgrep, or npm audit in a security context. Covers Go, TypeScript/JavaScript, and Python with language-specific tools plus cross-language Semgrep rulesets.
- `/github-health-check` — Run a comprehensive GitHub repository health check. Use this skill whenever the user asks to: check GitHub health, audit the repo, check CI status, review open PRs, merge Dependabot PRs, check code coverage, check GitHub Code Quality, check GitHub security feature enablement, check security advisories, check Dependabot alerts, check code scanning alerts, check secret scanning alerts, check Snyk integration, keep GitHub in good shape, or any variation of "how is the repo doing". Also trigger for: "check dependabot PRs", "any PRs to merge", "check branch status", "repo health", "GitHub status check", "what needs attention in GitHub", "tidy up GitHub".
- `/github-pr-copilot-cycle` — Manage a GitHub pull request feedback loop with Copilot review. Use when asked to create or update a PR, request Copilot as reviewer, collect Copilot review comments, score whether comments need human input, fix actionable feedback, reply or resolve comments, push fixes, check CI, and repeat the Copilot review cycle until no unresolved Copilot comments remain or three cycles have completed.
- `/ballast-audit` — audit a Ballast installation for stale, unowned, oversized, and irrelevant rules and skills, and report the narrowest config that still covers the repository
- `/ballast-project-maintenance` — Inspect, bootstrap, and repair Ballast-managed repository state. Use this skill when a user asks whether a repo is Ballast-managed, why .ballast/ is missing, how to repair local Ballast CLIs, or how to refresh Ballast rules and skills from saved config.
