import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';
import type * as core from '@actions/core';
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

const HEADER = `# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`;

describe('run', () => {
  let coreMock: jest.Mocked<
    Pick<typeof core, 'getInput' | 'info' | 'setOutput' | 'setFailed'>
  >;
  let run: typeof import('./index.js').run;
  let workdir: string;
  let changelog: string;

  const update = async (version: string, entry: string, file = changelog) => {
    const inputs: Record<string, string> = { version, entry, file };
    coreMock.getInput.mockImplementation((name) => inputs[name] ?? '');
    await run();
  };

  // Several tests call run() more than once; report the most recent value.
  const output = (name: string) =>
    [...coreMock.setOutput.mock.calls]
      .reverse()
      .find(([key]) => key === name)?.[1];

  beforeEach(async () => {
    jest.resetModules();
    coreMock = {
      getInput: jest.fn<typeof core.getInput>(),
      info: jest.fn<typeof core.info>(),
      setOutput: jest.fn<typeof core.setOutput>(),
      setFailed: jest.fn<typeof core.setFailed>()
    };
    jest.unstable_mockModule('@actions/core', () => ({
      getInput: coreMock.getInput,
      info: coreMock.info,
      setOutput: coreMock.setOutput,
      setFailed: coreMock.setFailed
    }));
    ({ run } = await import('./index.js'));

    workdir = mkdtempSync(join(tmpdir(), 'castoff-changelog-'));
    changelog = join(workdir, 'CHANGELOG.md');
  });

  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  it('creates the changelog with a Keep a Changelog header and the entry', async () => {
    await update(
      '1.0.0',
      '## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release'
    );

    expect(coreMock.setFailed).not.toHaveBeenCalled();
    expect(output('updated')).toBe('true');
    expect(readFileSync(changelog, 'utf8')).toBe(
      `${HEADER}\n## [1.0.0] - 2026-09-17\n\n### Highlights\n\n- First release\n`
    );
  });

  it('inserts a new entry above existing entries and keeps the header', async () => {
    await update('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    await update('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');

    expect(readFileSync(changelog, 'utf8')).toBe(
      `${HEADER}\n## [1.1.0] - 2026-09-18\n\n- Second release\n\n` +
        '## [1.0.0] - 2026-09-17\n\n- First release\n'
    );
  });

  it('leaves the changelog unchanged when the version is already documented', async () => {
    await update('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    const before = readFileSync(changelog, 'utf8');

    await update('1.0.0', '## [1.0.0] - 2026-09-18\n\n- Rerun');

    expect(coreMock.setFailed).not.toHaveBeenCalled();
    expect(output('updated')).toBe('false');
    expect(coreMock.info).toHaveBeenCalledWith(
      expect.stringContaining('already documents 1.0.0')
    );
    expect(readFileSync(changelog, 'utf8')).toBe(before);
  });

  it('defaults to CHANGELOG.md in the working directory', async () => {
    const previous = process.cwd();
    process.chdir(workdir);
    try {
      const inputs: Record<string, string> = {
        version: '1.0.0',
        entry: '## [1.0.0] - 2026-09-17\n\n- First release',
        file: ''
      };
      coreMock.getInput.mockImplementation((name) => inputs[name] ?? '');
      await run();
    } finally {
      process.chdir(previous);
    }

    expect(output('file')).toBe('CHANGELOG.md');
    expect(readFileSync(changelog, 'utf8')).toContain('## [1.0.0]');
  });

  it('writes entry content literally', async () => {
    const entry =
      '## [1.0.0] - 2026-09-17\n\n### Changes\n\n' +
      '- Keep `printf BACKTICK` and $(printf SUBSTITUTION) literal\n' +
      '- Percent formats stay literal: 100%s %d\n' +
      '- Backslashes stay literal: C:\\new\\table';

    await update('1.0.0', entry);

    const written = readFileSync(changelog, 'utf8');
    expect(written).toContain('`printf BACKTICK`');
    expect(written).toContain('$(printf SUBSTITUTION)');
    expect(written).toContain('100%s %d');
    expect(written).toContain('C:\\new\\table');
  });

  it('preserves the changelog file mode when replacing it', async () => {
    await update('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    chmodSync(changelog, 0o640);

    await update('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');

    expect(statSync(changelog).mode & 0o777).toBe(0o640);
  });

  it('leaves no staging files behind', async () => {
    await update('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    await update('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');

    expect(readdirSync(workdir)).toEqual(['CHANGELOG.md']);
  });

  it('fails without writing when the version is not semantic', async () => {
    writeFileSync(changelog, HEADER);

    await update('v1.0.0', '## [1.0.0] - 2026-09-17\n\n- Entry');

    expect(coreMock.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('semantic version')
    );
    expect(readFileSync(changelog, 'utf8')).toBe(HEADER);
  });

  it('fails without writing when the entry is empty', async () => {
    writeFileSync(changelog, HEADER);

    await update('1.0.0', '   \n  \n');

    expect(coreMock.setFailed).toHaveBeenCalledWith(
      "Input 'entry' must not be empty."
    );
    expect(readFileSync(changelog, 'utf8')).toBe(HEADER);
  });

  // Dropping write permission does not stop root, which CI runners are not.
  const nonRoot =
    typeof process.getuid === 'function' && process.getuid() !== 0;
  const itAsNonRoot = nonRoot ? it : it.skip;

  itAsNonRoot('removes the staging file when the replace fails', async () => {
    await update('1.0.0', '## [1.0.0] - 2026-09-17\n\n- First release');
    const before = readFileSync(changelog, 'utf8');
    chmodSync(workdir, 0o500);

    try {
      await update('1.1.0', '## [1.1.0] - 2026-09-18\n\n- Second release');
    } finally {
      chmodSync(workdir, 0o700);
    }

    expect(coreMock.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('EACCES')
    );
    expect(readdirSync(workdir)).toEqual(['CHANGELOG.md']);
    expect(readFileSync(changelog, 'utf8')).toBe(before);
  });

  it('reports a write failure as an action failure', async () => {
    await update(
      '1.0.0',
      '## [1.0.0] - 2026-09-17\n\n- Entry',
      join(workdir, 'missing-directory', 'CHANGELOG.md')
    );

    expect(coreMock.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('ENOENT')
    );
  });
});
