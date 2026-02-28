# AI Release Notes GitHub Action (by markcallen)

This GitHub Action generates release notes using ChatGPT (OpenAI).
It takes commit history between tags and generates clean, structured Markdown
suitable for GitHub Releases.

## Inputs

- `openai_api_key` (required) – your OpenAI API key
- `model` (optional) – default: `gpt-4.1-mini`
- `tag` (required) – new release tag (e.g. `v1.2.3`)
- `max_commits` (optional) – default: 200

## Outputs

- `release_notes` – AI-generated Markdown text

## Example Usage

```yaml
- name: AI Release Notes
  id: ai_notes
  uses: markcallen/ai-release-notes-action@v1
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

## Publish

```bash
git tag v1
git push origin v1
```
