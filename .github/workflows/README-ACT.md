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
make e2e-act

# List available workflows
act -l

# Dry run (see what would run without executing)
act workflow_dispatch -n
```

## Secrets

`make e2e-act` uses the `.secrets` file in the repository root. If it does not
exist, the wrapper creates it from the `OPENAI_API_KEY` environment variable with
owner-only read/write permissions. Export your key before the first run. If both
the file and environment variable are missing, the command stops with an error.

Existing `.secrets` files are preserved, including their keys and other settings.
The file is gitignored and must contain `OPENAI_API_KEY` for the live test. Both
the validation guardrail test and the live OpenAI test run through this target.

## Alternatives to ACT

| Tool | Use case |
|------|----------|
| **ACT** | Run full workflows locally; best for debugging action + runner behavior |
| **@actions/github-script** | Inline JS in workflows for quick checks |
| **Manual `node index.js`** | Test action logic in isolation (your `index.test.js` unit tests) |
| **GitHub Local Actions** (VS Code) | ACT integration inside the editor |
| **Self-hosted runner** | True GitHub env; overkill for most action dev |

**Note**: Your example workflows use `workflow_call` and ACT has some [limitations](https://github.com/nektos/act/issues/826) (e.g. boolean inputs as strings). The e2e workflow here runs the action directly to avoid those issues.
