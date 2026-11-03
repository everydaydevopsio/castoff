# Choosing an OpenAI model

The release-notes action sends one model name to OpenAI. This guide shows how
to pick it per repository, per workflow and per run, and how to confirm which
model a release actually used.

## How the model is resolved

The action resolves the model once, before it calls OpenAI
([`castoff/index.ts`](../castoff/index.ts)):

| Order | Source                                  | Used when                   |
| ----- | --------------------------------------- | --------------------------- |
| 1     | the `model` input                       | it is nonempty              |
| 2     | the `OPENAI_MODEL` environment variable | it is nonempty once trimmed |
| 3     | the built-in default, `gpt-6-astra`     | neither of the above is set |

Two details make the fallback chain usable from a workflow:

- An empty `model` input falls through. `model: ${{ inputs.model }}` with an
  unset input behaves exactly as if the input had been omitted, so a caller can
  leave the choice to `OPENAI_MODEL` without a second step or an `if:`.
- A whitespace-only `OPENAI_MODEL` falls through too, so an unset repository
  variable expanding to an empty string does not send a blank model name.

The resolved name is not implicit: it is returned as the `model` output, logged
as `Generating release notes with model: <model>`, and written into the
attribution footer of `release_notes`.

## One model for the whole repository

Set the repository (or organization) Actions variable `OPENAI_MODEL` once, and
pass it to the step. A configuration variable is not an environment variable
until a workflow puts it in `env:`, which is the step this repository's own
[release workflow](../.github/workflows/release.yml) uses:

```yaml
- name: Generate AI release notes
  id: ai_notes
  uses: everydaydevopsio/castoff/castoff@v2
  env:
    OPENAI_MODEL: ${{ vars.OPENAI_MODEL }}
  with:
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    tag: ${{ steps.bump.outputs.tag }}
```

Changing the model is then a repository-settings change: no workflow edit, no
release, and every workflow that reads the variable moves together. When the
variable is unset the step falls through to `gpt-6-astra`, so this is safe to
add before anyone has configured anything.

## A different model per workflow or per run

Use the `model` input where one workflow should not follow the repository
default — for example a cheaper model for a dry run, and the default for a
tagged release:

```yaml
on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Generate notes without creating a release'
        type: boolean
        default: false

jobs:
  notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate AI release notes
        id: ai_notes
        uses: everydaydevopsio/castoff/castoff@v2
        env:
          OPENAI_MODEL: ${{ vars.OPENAI_MODEL }}
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          # Nonempty only on a dry run; otherwise this falls through to the
          # OPENAI_MODEL variable above, then to the action default.
          model: ${{ inputs.dry_run && 'gpt-5.6-sol' || '' }}
          tag: v0.0.0-dry-run
```

The input wins over `OPENAI_MODEL` whenever it is nonempty, so both lines can
stay in the step: the variable is the standing choice, the input is the
exception.

The action needs the tag history to diff against, so keep
`fetch-depth: 0` on the checkout.

## Reusable workflows

The [`examples/`](../examples) release workflows take the same choice as an
optional `model` input and read `OPENAI_MODEL` themselves. Copy one into your
own `.github/workflows/` first: GitHub resolves a reusable workflow only at
`.github/workflows/` in a repository root, so the copy under `examples/` here
cannot be called from that path.

```yaml
jobs:
  release:
    # Your copy of examples/node-release-it-release-action.
    uses: your-org/release-workflows/.github/workflows/release-it-bump.yml@v1
    with:
      level: patch
      use_ai_release_notes: true
      model: gpt-5.6-sol # optional; omit to use the OPENAI_MODEL variable
    secrets:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

Two rules of reusable workflows shape that design:

- Environment variables set in an `env` block at the workflow level of the
  caller are **not** propagated into a called workflow, so a caller cannot set
  `OPENAI_MODEL` for a reusable release workflow from the outside. The called
  workflow has to read it.
- `vars` inside a called workflow resolves against the caller's repository and
  organization, so `env: OPENAI_MODEL: ${{ vars.OPENAI_MODEL }}` in the example
  workflows picks up the variable set by whoever calls them.

## Confirming what ran

- `steps.<id>.outputs.model` is the exact name sent to OpenAI. The E2E matrix in
  [`.github/workflows/e2e-ai-release-notes.yml`](../.github/workflows/e2e-ai-release-notes.yml)
  asserts it against the model each case expects.
- The last line of `release_notes` names the model, so a published release
  records what wrote it.
- Locally, `OPENAI_MODEL=gpt-5.6-sol make e2e-act` adds a configured-model case
  to the ACT run; see the [ACT guide](local-e2e-act.md).

## Failure modes

| Symptom                                 | Cause                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| The run used `gpt-6-astra` unexpectedly | `OPENAI_MODEL` was set as a configuration variable but never passed to the step through `env:` |
| A caller's model choice was ignored     | The caller set `env:` at workflow level for a reusable workflow; pass an input instead         |
| The step fails with an OpenAI error     | The model name does not exist or the key has no access to it; the action does not fall back    |

A failed step is a failed release unless the workflow plans for it. The example
workflows mark the notes step `continue-on-error: true` and fall back to
GitHub's generated notes, which is the pattern to copy when a wrong model name
should not cost you the release.
