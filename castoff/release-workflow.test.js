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
