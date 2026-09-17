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

it('commits both action bundles it rebuilt for the release', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  const build = workflow.indexOf('- name: Build dist');
  const commit = workflow.indexOf('- name: Commit release artifacts');
  const step = workflow.slice(commit, workflow.indexOf('- name: Generate AI'));
  expect(commit).toBeGreaterThan(build);
  // A bundle left unstaged would publish stale output under the new tag.
  expect(step).toContain('git add castoff/dist/ changelog/dist/');
  expect(step).toContain('git add castoff/package.json changelog/package.json');
});

it('updates the changelog into the release commit before publishing tags', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  const notes = workflow.indexOf('- name: Generate AI release notes');
  const changelog = workflow.indexOf('- name: Update CHANGELOG.md');
  const amend = workflow.indexOf(
    '- name: Fold the changelog into the release commit'
  );
  const publish = workflow.indexOf('- name: Tag and push');
  expect(changelog).toBeGreaterThan(notes);
  expect(amend).toBeGreaterThan(changelog);
  expect(publish).toBeGreaterThan(amend);

  const steps = workflow.slice(changelog, publish);
  expect(steps).toContain('uses: ./changelog');
  expect(steps).toContain('version: ${{ steps.bump.outputs.version }}');
  expect(steps).toContain(
    'entry: ${{ steps.release_notes.outputs.changelog_entry }}'
  );
  // Amending an unchanged tree would rewrite the release commit for nothing.
  expect(steps).toContain("if: steps.changelog.outputs.updated == 'true'");
  expect(steps).toContain('git commit --amend --no-edit');
  expect(steps).not.toContain('continue-on-error');
});
