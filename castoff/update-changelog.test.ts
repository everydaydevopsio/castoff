import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(
  new URL('../scripts/update-changelog.sh', import.meta.url)
);

const HEADER = `# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`;

describe('update-changelog.sh', () => {
  let workdir: string;
  let changelog: string;

  const run = (version: string, entry: string) =>
    spawnSync('bash', [script, version, changelog], {
      input: entry,
      encoding: 'utf8',
      timeout: 10000
    });

  beforeEach(() => {
    workdir = mkdtempSync(join(tmpdir(), 'castoff-changelog-'));
    changelog = join(workdir, 'CHANGELOG.md');
  });

  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  it('creates the changelog with a Keep a Changelog header and the entry', () => {
    const result = run(
      '1.0.0',
      '## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release'
    );

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(readFileSync(changelog, 'utf8')).toBe(
      `${HEADER}\n## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release\n`
    );
  });

  it('inserts a new entry above existing entries and keeps the header', () => {
    run(
      '1.0.0',
      '## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release'
    );
    const result = run(
      '1.1.0',
      '## [1.1.0] - 2026-09-18\n\n### Highlights\n\n- Second release'
    );

    expect(result.status).toBe(0);
    expect(readFileSync(changelog, 'utf8')).toBe(
      `${HEADER}\n## [1.1.0] - 2026-09-18\n\n### Highlights\n\n- Second release\n\n` +
        '## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release\n'
    );
  });

  it('leaves the changelog unchanged when the version is already documented', () => {
    run(
      '1.0.0',
      '## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release'
    );
    const before = readFileSync(changelog, 'utf8');

    const result = run(
      '1.0.0',
      '## [1.0.0] - 2026-09-18\n\n### Highlights\n\n- Rerun'
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('already documents 1.0.0');
    expect(readFileSync(changelog, 'utf8')).toBe(before);
  });

  it('does not treat a prefix of an existing version as documented', () => {
    run('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');

    const result = run(
      '1.0.0-rc.1',
      '## [1.0.0-rc.1] - 2026-09-18\n\n- Candidate'
    );

    expect(result.status).toBe(0);
    expect(readFileSync(changelog, 'utf8')).toContain('## [1.0.0-rc.1]');
  });

  it('treats entry content as data rather than shell or awk syntax', () => {
    const entry =
      '## [1.0.0] - 2026-09-17\n\n### Changes\n\n' +
      '- Keep `printf BACKTICK_EXECUTED` and $(printf SUBSTITUTION_EXECUTED) literal\n' +
      '- Percent formats stay literal: 100%s %d\n' +
      '- Backslashes stay literal: C:\\new\\table';

    const result = run('1.0.0', entry);

    expect(result.status).toBe(0);
    const written = readFileSync(changelog, 'utf8');
    expect(written).toContain('`printf BACKTICK_EXECUTED`');
    expect(written).toContain('$(printf SUBSTITUTION_EXECUTED)');
    expect(written).toContain('100%s %d');
    expect(written).toContain('C:\\new\\table');
    expect(written).not.toContain('EXECUTED\n');
  });

  it('appends the entry when the changelog has a header but no releases', () => {
    writeFileSync(changelog, HEADER);

    const result = run('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');

    expect(result.status).toBe(0);
    expect(readFileSync(changelog, 'utf8')).toBe(
      `${HEADER}\n## [1.0.0] - 2026-09-17\n\n- First release\n`
    );
  });

  it('preserves the changelog file mode when replacing it', () => {
    run('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    chmodSync(changelog, 0o640);

    const result = run('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');

    expect(result.status).toBe(0);
    expect(statSync(changelog).mode & 0o777).toBe(0o640);
  });

  it('leaves no staging files behind', () => {
    run('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    run('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');

    expect(readdirSync(workdir)).toEqual(['CHANGELOG.md']);
  });

  it.each([
    ['', 'semantic version'],
    ['v1.0.0', 'semantic version'],
    ['1.0', 'semantic version']
  ])('rejects invalid version %s', (version, message) => {
    const result = run(version, '## [1.0.0] - 2026-09-17\n\n- Entry');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
  });

  it('rejects an empty entry on stdin', () => {
    const result = run('1.0.0', '   \n  \n');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('entry on standard input');
  });
});
