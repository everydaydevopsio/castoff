import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

describe('release and E2E API key preflight', () => {
  it.each([undefined, '', '   \t'])(
    'rejects an unavailable key (%s)',
    (key) => {
      const env = { ...process.env };
      delete env.OPENAI_API_KEY;
      if (key !== undefined) env.OPENAI_API_KEY = key;
      const result = runPreflight(env);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('OPENAI_API_KEY is not available');
    }
  );

  it('accepts a configured key without printing it', () => {
    const key = 'test-secret-never-print';
    const result = runPreflight({ ...process.env, OPENAI_API_KEY: key });
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toContain(key);
  });
});

function runPreflight(env) {
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
