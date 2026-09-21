import { describe, expect, it } from '@jest/globals';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const INSTALLER = fileURLToPath(
  new URL('../scripts/install-actionlint.sh', import.meta.url)
);
const VERSION = /ACTIONLINT_VERSION="([^"]+)"/.exec(
  readFileSync(INSTALLER, 'utf8')
)?.[1] as string;

describe('pinned actionlint installer', () => {
  it.each([true, false])(
    'installs only after checksum success: %s',
    (valid) => {
      const directory = mkdtempSync(join(tmpdir(), 'castoff-actionlint-'));
      const log = join(directory, 'calls');
      const target = join(directory, 'bin');
      const mock = (name: string, body: string) =>
        writeFileSync(join(directory, name), `#!/bin/bash\n${body}\n`, {
          mode: 0o755
        });
      try {
        mock(
          'uname',
          'if [[ "$1" == "-s" ]]; then echo Linux; else echo x86_64; fi'
        );
        mock('curl', 'printf "curl %s\\n" "$*" >> "$INSTALL_LOG"');
        mock(
          'sha256sum',
          `cat >/dev/null; echo checksum >> "$INSTALL_LOG"; exit ${valid ? 0 : 1}`
        );
        mock('tar', 'echo tar >> "$INSTALL_LOG"');
        mock('install', 'printf "install %s\\n" "$*" >> "$INSTALL_LOG"');
        const result = spawnSync('bash', [INSTALLER], {
          env: {
            ...process.env,
            PATH: `${directory}:${process.env.PATH}`,
            INSTALL_LOG: log,
            ACTIONLINT_INSTALL_DIR: target
          },
          encoding: 'utf8'
        });

        expect(result.status).toBe(valid ? 0 : 1);
        const calls = readFileSync(log, 'utf8');
        // The pinned version and the architecture the mocked uname reports.
        expect(calls).toContain(
          `https://github.com/rhysd/actionlint/releases/download/v${VERSION}/actionlint_${VERSION}_linux_amd64.tar.gz`
        );
        // Nothing is unpacked or installed until the checksum has passed.
        expect(calls.includes('tar\n')).toBe(valid);
        expect(calls.includes('install ')).toBe(valid);
        if (valid) {
          expect(calls).toMatch(/checksum\ntar\ninstall -m 0755 /);
        }
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );

  it('refuses an architecture it holds no checksum for', () => {
    const directory = mkdtempSync(join(tmpdir(), 'castoff-actionlint-'));
    try {
      writeFileSync(
        join(directory, 'uname'),
        '#!/bin/bash\nif [[ "$1" == "-s" ]]; then echo Linux; else echo sparc64; fi\n',
        { mode: 0o755 }
      );
      const result = spawnSync('bash', [INSTALLER], {
        env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
        encoding: 'utf8'
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Unsupported actionlint architecture');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('holds a checksum for every platform the repository develops on', () => {
    const checksums = readFileSync(
      new URL(
        `../scripts/actionlint-v${VERSION}-checksums.txt`,
        import.meta.url
      ),
      'utf8'
    );
    for (const platform of ['darwin_arm64', 'darwin_amd64', 'linux_amd64']) {
      expect(checksums).toContain(`actionlint_${VERSION}_${platform}.tar.gz`);
    }
  });
});
