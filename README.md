# Castoff

[![CI](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml)
[![Release](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/everydaydevopsio/castoff)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/everydaydevopsio/castoff)](https://github.com/everydaydevopsio/castoff/releases)

A GitHub Action that generates AI-powered release notes using OpenAI ChatGPT models. It analyzes commit history between tags and produces clean, structured Markdown suitable for GitHub Releases.

## Quick Start

```yaml
- name: Generate AI Release Notes
  id: ai_notes
  uses: everydaydevopsio/castoff/castoff@v1
  with:
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    tag: ${{ steps.bump.outputs.tag }}

- name: Create GitHub Release
  uses: softprops/action-gh-release@v2
  with:
    tag_name: ${{ steps.bump.outputs.tag }}
    body: ${{ steps.ai_notes.outputs.release_notes }}
```

## Action Reference

See [`castoff/README.md`](castoff/README.md) for full input/output documentation.

## Development

Prerequisites: Bash, Make, curl, and nvm (including Homebrew-installed nvm).
`make deps` uses Homebrew on macOS or sudo on Linux to install `act` if needed.

```bash
make setup         # run make deps, nvm install, Corepack setup, and pnpm install
# Run the activation command printed by setup in your current terminal.
make test          # run tests
make test-coverage # run tests with coverage
make lint          # lint
make build         # compile dist/
```

Setup installs the Node version from `.nvmrc`, installs Corepack if missing for
that Node version, enables pnpm 9 to match CI, and installs dependencies from the
lockfile in `castoff/`. It loads nvm from `NVM_DIR`, the standard nvm directories,
or Homebrew. Make cannot change the environment of your current terminal, so
setup prints the command to load nvm and run `nvm use` there. Use `make install`
to refresh dependencies once your terminal is configured.

## License

MIT License - see [LICENSE](LICENSE) file for details.
