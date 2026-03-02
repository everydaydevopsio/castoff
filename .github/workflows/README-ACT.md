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
# Recommended wrappers
make e2e-act
OPENAI_API_KEY=sk-your-key-here make e2e-act-live

# List available workflows
act -l

# Run guardrail E2E only (no OpenAI key needed)
act -W .github/workflows/e2e-ai-release-notes.yml workflow_dispatch

# Run live OpenAI E2E as well
act -W .github/workflows/e2e-ai-release-notes.yml workflow_dispatch -s OPENAI_API_KEY=sk-your-key-here

# Dry run (see what would run without executing)
act workflow_dispatch -n
```

## Secrets

ACT reads secrets from:

1. **CLI flag**: `-s SECRET_NAME=value`
2. **`.secrets` file** in repo root (gitignored):

   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Environment**: `export OPENAI_API_KEY=sk-...` then run `act`

## Alternatives to ACT

| Tool | Use case |
|------|----------|
| **ACT** | Run full workflows locally; best for debugging action + runner behavior |
| **@actions/github-script** | Inline JS in workflows for quick checks |
| **Manual `node index.js`** | Test action logic in isolation (your `index.test.js` unit tests) |
| **GitHub Local Actions** (VS Code) | ACT integration inside the editor |
| **Self-hosted runner** | True GitHub env; overkill for most action dev |

**Note**: Your example workflows use `workflow_call` and ACT has some [limitations](https://github.com/nektos/act/issues/826) (e.g. boolean inputs as strings). The e2e workflow here runs the action directly to avoid those issues.
