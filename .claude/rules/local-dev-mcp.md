<!-- ballast:rule id="typescript/local-dev/mcp" version="5.18.3" checksum="309827f553634374d1f86d8348757fe0209a5001ac2c16106ae5e53da189714a" -->
## Repository Tool Policy

- Check `.rulesrc.json` `tools` before adding, installing, or running language tooling.
- Configured tools: typescript=pnpm,corepack.
- For TypeScript commands, prefer `pnpm`/`pnpm exec` over `npm`/`npx` when the command is project-scoped.

# Local Development: MCP Configuration

---
# Local Development: MCP Configuration

Task system MCP configuration (GitHub Issues, Jira, Linear) is now handled by the `tasks` agent rule.

To set up MCP for your task system, add the `tasks` agent to your `.rulesrc.json` and re-run `ballast install`.

Once the `tasks` agent is installed, ask your AI assistant: "set up my task system MCP" and it will walk you through configuration for your platform (Claude Code, Cursor, Codex, or OpenCode).
