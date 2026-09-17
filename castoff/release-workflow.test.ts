import { expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';

it('generates notes after the local release commit but before publishing tags', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  const commit = workflow.indexOf('- name: Commit release artifacts');
  const notes = workflow.indexOf('- name: Generate AI release notes');
  const publish = workflow.indexOf('- name: Tag and push');
  expect(commit).toBeGreaterThan(-1);
  expect(notes).toBeGreaterThan(commit);
  expect(publish).toBeGreaterThan(notes);
  expect(workflow.slice(notes, publish)).not.toContain('continue-on-error');
});

it('updates the changelog into the release commit before publishing tags', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  const notes = workflow.indexOf('- name: Generate AI release notes');
  const changelog = workflow.indexOf('- name: Update CHANGELOG.md');
  const publish = workflow.indexOf('- name: Tag and push');
  expect(changelog).toBeGreaterThan(notes);
  expect(publish).toBeGreaterThan(changelog);

  const step = workflow.slice(changelog, publish);
  // Pass the generated entry through the environment so note content is data.
  expect(step).toContain(
    'CHANGELOG_ENTRY: ${{ steps.release_notes.outputs.changelog_entry }}'
  );
  expect(step).toContain('scripts/update-changelog.sh');
  expect(step).toContain('git commit --amend --no-edit');
  expect(step).not.toContain('continue-on-error');
});
