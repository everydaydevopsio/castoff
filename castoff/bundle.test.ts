import { describe, expect, it } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

/**
 * List tracked files under a path. Empty output means git tracks nothing there,
 * which is not the same as the directory being absent from the working tree.
 */
function tracked(path: string): string[] {
  return execFileSync('git', ['ls-files', '--', path], {
    cwd: root,
    encoding: 'utf8'
  })
    .split('\n')
    .filter(Boolean);
}

// The bundle is built at release time and carried by the tag, never by main.
// A bundle committed to main would reappear in every dependency bump that ncc
// inlines, which is what this arrangement exists to avoid.
describe('action bundles', () => {
  it.each(['castoff/dist', 'changelog/dist'])('does not track %s', (path) => {
    expect(tracked(path)).toEqual([]);
  });

  // Narrow by design: actionlint's missing-`main:`-file message is expected
  // now, every other finding is not.
  it('ignores only the missing-bundle finding when linting workflows', () => {
    const script = readFileSync(
      new URL('scripts/lint-workflows.sh', `file://${root}`),
      'utf8'
    );
    const ignores = [...script.matchAll(/-ignore '([^']+)'/g)].map((m) => m[1]);
    expect(ignores).toEqual(['file "dist/index\\.js" does not exist']);
  });

  it.each(['castoff/dist/', 'changelog/dist/'])('ignores %s', (path) => {
    const ignored = readFileSync(
      new URL('.gitignore', `file://${root}`),
      'utf8'
    )
      .split('\n')
      .map((line) => line.trim());
    expect(ignored).toContain(path);
  });
});
