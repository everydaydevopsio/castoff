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

  // Prettier resolves .prettierignore from its working directory, not from the
  // workspace root. A package that formats itself needs its own, or
  // `prettier:fix` rewrites the committed bundle CI then rejects.
  it('gives every self-formatting package an ignore file covering dist', () => {
    const root = new URL('../', import.meta.url);

    for (const pkg of ['castoff', 'changelog']) {
      const { scripts } = JSON.parse(
        readFileSync(new URL(`${pkg}/package.json`, root), 'utf8')
      ) as { scripts: Record<string, string> };
      if (!scripts.prettier && !scripts['prettier:fix']) continue;

      const ignored = readFileSync(
        new URL(`${pkg}/.prettierignore`, root),
        'utf8'
      )
        .split('\n')
        .map((line) => line.trim());
      expect(ignored).toContain('dist');
      expect(ignored).toContain('coverage');
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
