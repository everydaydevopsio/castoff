import { describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('packaged action entry point', () => {
  it('declares a runtime supported by the installed OpenAI SDK', () => {
    const action = readFileSync(
      new URL('./action.yml', import.meta.url),
      'utf8'
    );
    const sdk = JSON.parse(
      readFileSync(
        new URL('./node_modules/openai/package.json', import.meta.url),
        'utf8'
      )
    ) as { engines: { node: string } };
    const runtime = action.match(/using: ['"]?node(\d+)/);
    const minimum = sdk.engines.node.match(/^>=(\d+)\.0\.0$/);

    expect(runtime).not.toBeNull();
    expect(minimum).not.toBeNull();
    expect(Number(runtime?.[1])).toBeGreaterThanOrEqual(Number(minimum?.[1]));
  });

  // .nvmrc, the action runtimes and every manifest name the same Node major,
  // so a contributor's local Node matches what the published actions run on.
  it('declares the .nvmrc Node major in every workspace manifest', () => {
    const root = new URL('../', import.meta.url);
    const nvmrc = readFileSync(new URL('.nvmrc', root), 'utf8').trim();
    const major = nvmrc.match(/^v?(\d+)$/)?.[1];

    expect(major).toBeDefined();

    for (const manifest of [
      'package.json',
      'castoff/package.json',
      'changelog/package.json'
    ]) {
      const { engines } = JSON.parse(
        readFileSync(new URL(manifest, root), 'utf8')
      ) as { engines?: { node?: string } };
      expect(engines?.node).toBe(`>=${major}`);
    }

    for (const action of ['castoff/action.yml', 'changelog/action.yml']) {
      const using = readFileSync(new URL(action, root), 'utf8').match(
        /using: ['"]?node(\d+)/
      );
      expect(using?.[1]).toBe(major);
    }
  });

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
