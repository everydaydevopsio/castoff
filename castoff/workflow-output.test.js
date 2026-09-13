import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync(
  new URL('../.github/workflows/e2e-ai-release-notes.yml', import.meta.url),
  'utf8'
);
const verification = workflow
  .split('- name: Verify output\n')[1]
  .split('run: |\n')[1]
  .replace(/^ {10}/gm, '');

describe('E2E release notes verification', () => {
  it.each([
    [
      '## Highlights\n- Keep `printf BACKTICK_EXECUTED` and $(printf SUBSTITUTION_EXECUTED) literal.\n- Quotes: "text"\n::error::literal annotation\n::add-mask::literal mask',
      0
    ],
    ['', 1],
    ['Unexpected output', 1]
  ])(
    'treats notes as data and validates their structure: %s',
    (notes, status) => {
      const script = verification.replaceAll(
        '${{ steps.ai_notes.outputs.release_notes }}',
        notes
      );
      const result = spawnSync('bash', ['-e', '-c', script], {
        env: { ...process.env, RELEASE_NOTES: notes },
        encoding: 'utf8',
        timeout: 10000
      });

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(status);
      const marker = result.stdout.match(/::stop-commands::([a-f0-9-]+)\n/);
      expect(marker).not.toBeNull();
      expect(result.stdout).toContain(
        `::stop-commands::${marker[1]}\n${notes}\n::${marker[1]}::\n`
      );
      expect(result.stderr).toBe('');
    }
  );
});
