import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parse } from 'yaml';

type Workflow = {
  name: string;
  on: Record<string, unknown>;
  concurrency: { group: string; 'cancel-in-progress': boolean };
  jobs: Record<
    string,
    { if: string; steps: Array<{ uses?: string; with?: { ref?: string } }> }
  >;
};

const workflow = parse(
  readFileSync(
    new URL('../.github/workflows/e2e-ai-release-notes.yml', import.meta.url),
    'utf8'
  )
) as Workflow;
const ci = parse(
  readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8')
) as Workflow;

// These workflow expressions use only property access, strings, ==, && and ||,
// whose behavior for the string-only fixtures below is shared with JavaScript.
function evaluate(expression: string, github: object): unknown {
  return runInNewContext(
    expression.replace(/^\s*\$\{\{\s*|\s*\}\}\s*$/g, ''),
    { github },
    { timeout: 1000 }
  );
}

describe('E2E after main CI (PRD 15.5)', () => {
  it('subscribes to completed main CI and retains manual dispatch', () => {
    expect(workflow.on.workflow_run).toEqual({
      workflows: [ci.name],
      types: ['completed'],
      branches: ['main']
    });
    expect(workflow.on).toHaveProperty('workflow_dispatch');
    expect(workflow.on).not.toHaveProperty('push');
    expect(workflow.on).not.toHaveProperty('pull_request');
  });

  it.each([
    ['workflow_dispatch', '', '', '', true],
    ['workflow_run', 'push', 'main', 'success', true],
    ['workflow_run', 'push', 'main', 'failure', false],
    ['workflow_run', 'push', 'main', 'cancelled', false],
    ['workflow_run', 'push', 'main', 'skipped', false],
    ['workflow_run', 'pull_request', 'main', 'success', false],
    ['workflow_run', 'push', 'feature', 'success', false]
  ])('gates %s / %s / %s / %s', (eventName, event, branch, conclusion, run) => {
    for (const job of Object.values(workflow.jobs)) {
      expect(job.if).toBeDefined();
      expect(
        evaluate(job.if, {
          event_name: eventName,
          event: { workflow_run: { event, head_branch: branch, conclusion } }
        })
      ).toBe(run);
    }
  });

  it('tests the upstream commit, or the dispatched commit for manual runs', () => {
    for (const job of Object.values(workflow.jobs)) {
      const checkout = job.steps.find((step) =>
        step.uses?.startsWith('actions/checkout@')
      );
      const ref = checkout?.with?.ref;
      expect(ref).toBeDefined();
      expect(
        evaluate(ref!, {
          event: { workflow_run: { head_sha: 'ci-commit' } },
          sha: 'newer-main'
        })
      ).toBe('ci-commit');
      expect(
        evaluate(ref!, { event: { workflow_run: {} }, sha: 'manual-commit' })
      ).toBe('manual-commit');
    }
  });

  it('does not cancel or replace E2E runs for other merges', () => {
    expect(workflow.concurrency.group).toContain('github.run_id');
    expect(workflow.concurrency['cancel-in-progress']).toBe(false);
  });
});
