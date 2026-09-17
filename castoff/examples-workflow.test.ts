import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

type Step = {
  name?: string;
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  with?: Record<string, string>;
};

type Example = {
  on: {
    workflow_call: {
      inputs: Record<string, { type: string; default?: boolean | string }>;
    };
  };
  jobs: Record<string, { steps: Step[] }>;
};

const EXAMPLES = [
  ['node + release-it', 'node-release-it-release-action', 'release-it-bump'],
  ['python + bumpver', 'py-bumpver-release-action', 'bumpver-release']
] as const;

function load(directory: string, workflow: string) {
  const example = parse(
    readFileSync(
      new URL(
        `../examples/${directory}/.github/workflows/${workflow}.yml`,
        import.meta.url
      ),
      'utf8'
    )
  ) as Example;
  const steps = Object.values(example.jobs)[0].steps;
  const index = (name: string) => steps.findIndex((s) => s.name === name);
  return { example, steps, index };
}

describe.each(EXAMPLES)('%s example workflow', (_label, directory, file) => {
  const { example, steps, index } = load(directory, file);

  it('exposes an optional changelog input that defaults to off', () => {
    const input = example.on.workflow_call.inputs.update_changelog;
    expect(input.type).toBe('boolean');
    expect(input.default).toBe(false);
  });

  it('pins the action and the helper checkout to the same major tag', () => {
    const action = steps.find((s) => s.uses?.includes('castoff/castoff@'));
    const helper = steps[index('Checkout Castoff changelog helper')];
    expect(action?.uses).toBe('everydaydevopsio/castoff/castoff@v2');
    expect(helper.with?.repository).toBe('everydaydevopsio/castoff');
    expect(helper.with?.ref).toBe('v2');
    expect(helper.with?.path).toBe('.castoff');
  });

  it('updates the changelog after the notes it consumes are generated', () => {
    const notes = index('Generate AI release notes');
    const helper = index('Checkout Castoff changelog helper');
    const update = index('Update CHANGELOG.md');
    expect(notes).toBeGreaterThan(-1);
    expect(helper).toBeGreaterThan(notes);
    expect(update).toBeGreaterThan(helper);
  });

  it('runs the changelog steps only on opt-in with generated notes', () => {
    const condition =
      "inputs.update_changelog == true && steps.ai_notes.outcome == 'success'";
    expect(steps[index('Checkout Castoff changelog helper')].if).toBe(
      condition
    );
    expect(steps[index('Update CHANGELOG.md')].if).toBe(condition);
  });

  it('passes the generated entry as environment data', () => {
    const step = steps[index('Update CHANGELOG.md')];
    expect(step.env?.CHANGELOG_ENTRY).toBe(
      '${{ steps.ai_notes.outputs.changelog_entry }}'
    );
    // The entry reaches the script through the environment, never inline.
    expect(step.run).toContain('printf \'%s\\n\' "$CHANGELOG_ENTRY"');
    expect(step.run).not.toContain('outputs.changelog_entry }}');
  });

  it('strips the tag prefix and tolerates an already-documented version', () => {
    const run = steps[index('Update CHANGELOG.md')].run ?? '';
    expect(run).toContain(
      'bash .castoff/scripts/update-changelog.sh "${TAG#v}"'
    );
    expect(run).toContain('git diff --quiet --cached');
    expect(run).toContain('git commit -m "docs: update changelog for $TAG"');
  });
});
