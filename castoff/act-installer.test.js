import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

describe('pinned ACT installer', () => {
  it.each([true, false])(
    'installs only after checksum success: %s',
    (valid) => {
      const directory = mkdtempSync(join(tmpdir(), 'castoff-installer-'));
      const log = join(directory, 'calls');
      const mock = (name, body) =>
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
        mock('sudo', 'echo sudo >> "$INSTALL_LOG"');
        const result = spawnSync(
          'bash',
          [
            fileURLToPath(new URL('../scripts/install-act.sh', import.meta.url))
          ],
          {
            env: {
              ...process.env,
              PATH: `${directory}:${process.env.PATH}`,
              INSTALL_LOG: log
            },
            encoding: 'utf8'
          }
        );
        expect(result.status).toBe(valid ? 0 : 1);
        const calls = readFileSync(log, 'utf8');
        expect(calls).toContain(
          'https://github.com/nektos/act/releases/download/v0.2.89/act_Linux_x86_64.tar.gz'
        );
        expect(calls.includes('tar\n')).toBe(valid);
        expect(calls.includes('sudo\n')).toBe(valid);
        if (valid) expect(calls).toMatch(/checksum\ntar\nsudo\n/);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );
});
