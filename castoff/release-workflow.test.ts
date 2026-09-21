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

it('moves a floating tag for the major and the minor series', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );
  const bump = workflow.slice(
    workflow.indexOf('- name: Bump version'),
    workflow.indexOf('- name: Build dist')
  );
  // Consumers pin @v2 or @v2.2; both must reach the newest patch.
  expect(bump).toContain('echo "major_tag=v${MAJOR}" >> "$GITHUB_OUTPUT"');
  expect(bump).toContain(
    'echo "minor_tag=v${MAJOR}.${MINOR}" >> "$GITHUB_OUTPUT"'
  );

  const publish = workflow.slice(
    workflow.indexOf('- name: Tag and push'),
    workflow.indexOf('- name: Create GitHub Release')
  );
  for (const series of ['major_tag', 'minor_tag']) {
    expect(publish).toContain(
      `git tag -f "\${{ steps.bump.outputs.${series} }}"`
    );
    expect(publish).toContain(`"\${{ steps.bump.outputs.${series} }}"`);
  }
  // The exact version tag is created once and never forced.
  expect(publish).toContain('git tag "${{ steps.bump.outputs.tag }}"');
  expect(publish).not.toContain('git tag -f "${{ steps.bump.outputs.tag }}"');
  expect(publish).toContain('git push origin --force');
});
