import { describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('local E2E launcher', () => {
  it.each([
    [undefined, undefined, ''],
    ['', '', ''],
    ['test-key', 'custom-model', 'custom-model']
  ])(
    'starts act with key %s and propagates the workflow exit code',
    (key, model, expectedModel) => {
      const env = { ...process.env };
      delete env.OPENAI_API_KEY;
      delete env.OPENAI_MODEL;
      if (model !== undefined) env.OPENAI_MODEL = model;
      if (key !== undefined) env.OPENAI_API_KEY = key;
      const script = fileURLToPath(
        new URL('../scripts/e2e-act.sh', import.meta.url)
      );
      const bin = mkdtempSync(join(tmpdir(), 'castoff-act-'));
      writeFileSync(
        join(bin, 'act'),
        '#!/bin/bash\nprintf "%s\\n" "$@"\nexit 42\n',
        { mode: 0o755 }
      );
      let result;
      try {
        result = spawnSync('bash', [script], {
          env: { ...env, PATH: `${bin}:${env.PATH}` },
          cwd: fileURLToPath(new URL('../', import.meta.url)),
          encoding: 'utf8',
          timeout: 10000
        });
      } finally {
        rmSync(bin, { recursive: true, force: true });
      }
      expect(result.status).toBe(42);
      expect(result.stdout).toContain('workflow_dispatch');
      expect(result.stdout).toContain(`--var\nOPENAI_MODEL=${expectedModel}\n`);
      expect(result.stdout).toContain(
        key ? 'OPENAI_API_KEY\n' : 'OPENAI_API_KEY=\n'
      );
      expect(result.stdout).not.toContain('test-key');
      expect(result.stderr).not.toContain('OPENAI_API_KEY is not available');
    }
  );
});
