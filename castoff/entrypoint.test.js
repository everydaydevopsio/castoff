import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

describe('packaged action entry point', () => {
  it.each([
    [
      'invalid max_commits',
      'dummy-key',
      'abc',
      "Input 'max_commits' must be an integer between 1 and 1000."
    ],
    [
      'missing API key',
      '',
      '10',
      'Input required and not supplied: openai_api_key'
    ]
  ])('fails when executed with %s', (_name, apiKey, maxCommits, message) => {
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(new URL('./dist/index.js', import.meta.url))],
      {
        env: {
          ...process.env,
          INPUT_OPENAI_API_KEY: apiKey,
          INPUT_TAG: 'v0.0.0-test',
          INPUT_MAX_COMMITS: maxCommits
        },
        encoding: 'utf8',
        timeout: 10000
      }
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain(message);
  });
});
