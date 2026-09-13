# Running E2E Tests with ACT

[ACT](https://github.com/nektos/act) runs GitHub Actions locally using Docker, so you can debug workflows without pushing to GitHub.

## Install ACT

```bash
# macOS
brew install nektos/tap/act

# Or via npm
npm install -g @nektos/act
```

## Run the E2E Workflow

From the repo root:

```bash
# Run validation guardrails and the live OpenAI test
export OPENAI_API_KEY="your-openai-api-key"
make e2e-act

# List available workflows
act -l

# Dry run (see what would run without executing)
act workflow_dispatch -n
```

## Secrets

`make e2e-act` requires an exported, nonempty `OPENAI_API_KEY` environment
variable. If it is unset or empty, the command stops with an error before
starting ACT. The key is passed to ACT from the environment; no `.secrets`
file is read or created. Both the validation guardrail test and the live
OpenAI test run through this target.

## Alternatives to ACT

| Tool | Use case |
|------|----------|
| **ACT** | Run full workflows locally; best for debugging action + runner behavior |
| **@actions/github-script** | Inline JS in workflows for quick checks |
| **Manual `node index.js`** | Test action logic in isolation (your `index.test.js` unit tests) |
| **GitHub Local Actions** (VS Code) | ACT integration inside the editor |
| **Self-hosted runner** | True GitHub env; overkill for most action dev |

**Note**: Your example workflows use `workflow_call` and ACT has some [limitations](https://github.com/nektos/act/issues/826) (e.g. boolean inputs as strings). The e2e workflow here runs the action directly to avoid those issues.
