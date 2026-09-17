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
  [
    'node + release-it',
    'node-release-it-release-action',
    'release-it-bump',
    'release_it'
  ],
  ['python + bumpver', 'py-bumpver-release-action', 'bumpver-release', 'bump']
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

describe.each(EXAMPLES)(
  '%s example workflow',
  (_label, directory, file, bumpStep) => {
    const { example, steps, index } = load(directory, file);

    it('exposes an optional changelog input that defaults to off', () => {
      const input = example.on.workflow_call.inputs.update_changelog;
      expect(input.type).toBe('boolean');
      expect(input.default).toBe(false);
    });

    it('pins both actions to the same major tag', () => {
      const notes = steps.find((s) => s.uses?.includes('castoff/castoff@'));
      const changelog = steps[index('Update CHANGELOG.md')];
      expect(notes?.uses).toBe('everydaydevopsio/castoff/castoff@v2');
      expect(changelog.uses).toBe('everydaydevopsio/castoff/changelog@v2');
    });

    it('needs no repository checkout to reach the changelog writer', () => {
      expect(steps.some((s) => s.with?.path === '.castoff')).toBe(false);
      expect(steps.some((s) => s.run?.includes('update-changelog.sh'))).toBe(
        false
      );
    });

    it('publishes the version the changelog action expects', () => {
      const bump = steps.find((s) => s.id === bumpStep);
      // The action takes a bare version; the tag output keeps its v prefix.
      expect(bump?.run).toContain('echo "version=${NEW_TAG#v}"');
      expect(steps[index('Update CHANGELOG.md')].with?.version).toBe(
        `\${{ steps.${bumpStep}.outputs.version }}`
      );
    });

    it('feeds the generated entry straight into the changelog action', () => {
      expect(steps[index('Update CHANGELOG.md')].with?.entry).toBe(
        '${{ steps.ai_notes.outputs.changelog_entry }}'
      );
    });

    it('writes the changelog after the notes it consumes are generated', () => {
      const notes = index('Generate AI release notes');
      const changelog = index('Update CHANGELOG.md');
      const commit = index('Commit the changelog');
      expect(notes).toBeGreaterThan(-1);
      expect(changelog).toBeGreaterThan(notes);
      expect(commit).toBeGreaterThan(changelog);
    });

    it('runs only on opt-in, and commits only on an actual change', () => {
      expect(steps[index('Update CHANGELOG.md')].if).toBe(
        "inputs.update_changelog == true && steps.ai_notes.outcome == 'success'"
      );
      expect(steps[index('Commit the changelog')].if).toBe(
        "steps.changelog.outputs.updated == 'true'"
      );
    });

    it('passes the tag to the commit message as environment data', () => {
      const commit = steps[index('Commit the changelog')];
      expect(commit.env?.TAG).toBe(`\${{ steps.${bumpStep}.outputs.tag }}`);
      expect(commit.run).toContain(
        'git commit -m "docs: update changelog for $TAG"'
      );
    });
  }
);
