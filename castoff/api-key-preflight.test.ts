import { afterEach, describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scratchDirs: string[] = [];

afterEach(() => {
  while (scratchDirs.length > 0) {
    rmSync(scratchDirs.pop() as string, { recursive: true, force: true });
  }
});

describe('release and E2E API key preflight', () => {
  it.each([undefined, '', '   \t'])(
    'rejects an unavailable key (%s)',
    (key) => {
      const result = runPreflight(envWithKey(key));
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('OPENAI_API_KEY is not available');
    }
  );

  it('names the secret, where to set it, and that nothing changed', () => {
    const result = runPreflight(envWithKey(undefined));
    // A maintainer reading only the failed step must learn why the release
    // stopped and how to unblock it, without opening the repository docs.
    expect(result.stderr).toContain('::error title=Missing OPENAI_API_KEY::');
    expect(result.stderr).toContain(
      'Settings > Secrets and variables > Actions'
    );
    expect(result.stderr).toContain('organization secret');
    expect(result.stderr).toContain('export OPENAI_API_KEY');
    expect(result.stderr).toContain('no version bump, commit, tag or release');
  });

  it('repeats the explanation on the workflow run summary', () => {
    const summary = summaryFile();
    const result = runPreflight({
      ...envWithKey(undefined),
      GITHUB_STEP_SUMMARY: summary
    });
    expect(result.status).toBe(1);
    const written = readFileSync(summary, 'utf8');
    expect(written).toContain('### Release stopped: missing OPENAI_API_KEY');
    expect(written).toContain('**How to fix:**');
  });

  it('accepts a configured key without printing it', () => {
    const key = 'test-secret-never-print';
    const summary = summaryFile();
    const result = runPreflight({
      ...process.env,
      OPENAI_API_KEY: key,
      GITHUB_STEP_SUMMARY: summary
    });
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toContain(key);
    // A successful preflight is silent: no annotation, no summary noise.
    expect(readFileSync(summary, 'utf8')).toBe('');
  });
});

function envWithKey(key: string | undefined) {
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  delete env.GITHUB_STEP_SUMMARY;
  if (key !== undefined) env.OPENAI_API_KEY = key;
  return env;
}

function summaryFile() {
  const dir = mkdtempSync(join(tmpdir(), 'castoff-preflight-'));
  scratchDirs.push(dir);
  // Actions creates the summary file before the step runs; the script appends.
  const path = join(dir, 'summary.md');
  writeFileSync(path, '');
  return path;
}

function runPreflight(env: NodeJS.ProcessEnv) {
  return spawnSync(
    'bash',
    [
      fileURLToPath(
        new URL('../scripts/require-openai-key.sh', import.meta.url)
      )
    ],
    { env, encoding: 'utf8', timeout: 10000 }
  );
}
