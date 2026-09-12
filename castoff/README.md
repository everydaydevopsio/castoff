# Castoff — AI Release Notes GitHub Action

[![CI](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/ci.yml)
[![Release](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml/badge.svg)](https://github.com/everydaydevopsio/castoff/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/everydaydevopsio/castoff)](../LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/everydaydevopsio/castoff)](https://github.com/everydaydevopsio/castoff/releases)

This GitHub Action generates release notes using ChatGPT (OpenAI).
It takes commit history between tags and generates clean, structured Markdown
suitable for GitHub Releases.

## Inputs

- `openai_api_key` (required) – your OpenAI API key
- `model` (optional) – default: `gpt-4.1-mini`
- `tag` (required) – new release tag (e.g. `v1.2.3`)
- `max_commits` (optional) – default: 200 (must be an integer between 1 and 1000)

## Outputs

- `release_notes` – AI-generated Markdown text

## Example Usage

```yaml
- name: AI Release Notes
  id: ai_notes
  uses: everydaydevopsio/castoff/castoff@v1
  with:
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    tag: ${{ steps.bump.outputs.tag }}
```

Then pass the notes to a GitHub Release step:

```yaml
- name: Create release
  uses: softprops/action-gh-release@v2
  with:
    tag_name: ${{ steps.bump.outputs.tag }}
    body: ${{ steps.ai_notes.outputs.release_notes }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

MIT License - see [LICENSE](../LICENSE) file for details.
