# Documentation

Castoff is two GitHub Actions published from one tag: `castoff/` generates
release notes and a changelog entry from commit history, and `changelog/`
writes that entry into a Keep a Changelog file.

## Start here

| If you want to                                           | Read                                          |
| -------------------------------------------------------- | --------------------------------------------- |
| Add the actions to your release workflow                 | [Quick Start](../README.md#quick-start)       |
| Set up the OpenAI key, or find out why a release stopped | [OpenAI API key](../README.md#openai-api-key) |
| Pin a version                                            | [Versions](../README.md#versions)             |
| Choose which OpenAI model generates the notes            | [Model selection](model-selection.md)         |
| Work on this repository                                  | [Development](../README.md#development)       |

## Reference

- [`castoff/README.md`](../castoff/README.md) — inputs, outputs and behavior of
  the release-notes action.
- [`changelog/README.md`](../changelog/README.md) — inputs, outputs and
  behavior of the changelog writer.
- [Architecture](architecture.md) — how the two actions compose, what the
  release pipeline does step by step, and how the changelog writer decides
  between creating, inserting and doing nothing.

## Guides

- [Choosing an OpenAI model](model-selection.md) — the `model` input, the
  `OPENAI_MODEL` variable, which one wins, and worked workflow examples.
- [Running E2E tests with ACT](local-e2e-act.md) — run the real workflow
  locally under Docker, including model overrides.
- [`examples/`](../examples) — `workflow_call` release workflows for a Node
  project (release-it) and a Python project (bumpver), written to be copied
  into a repository's own `.github/workflows/` and called from there.

## Project records

- [Architecture decisions](../adr/README.md) — why the repository works the way
  it does; one record per decision, superseded rather than deleted.
- [Plans](../plans/README.md) — in-flight design work, graduated to an ADR when
  it ships.
- [CHANGELOG.md](../CHANGELOG.md) — written by the changelog action during each
  release.
