import { describe, expect, it } from '@jest/globals';
import {
  HEADER,
  parseVersion,
  parseEntry,
  isUnreleasedHeading,
  documentsVersion,
  insertEntry
} from './index.js';

describe('parseVersion', () => {
  it.each([
    ['1.2.3'],
    ['0.0.0'],
    ['1.2.3-rc.1'],
    ['1.2.3-0.3.7'],
    ['1.2.3-x-y-z.0'],
    ['1.2.3-rc.1-rc.2'],
    ['1.2.3+build.5'],
    ['1.2.3+21AF26D'],
    ['1.2.3-rc.1+build.5']
  ])('accepts the semantic version %s', (version) => {
    expect(parseVersion(version)).toBe(version);
  });

  it.each([
    [''],
    ['v1.0.0'],
    ['1.0'],
    ['1.2.3+build+more'],
    ['1.2.3-'],
    ['1.2.3+'],
    ['01.2.3'],
    ['1.02.3'],
    ['1.2.3-.rc'],
    ['1.2.3-rc.'],
    ['1.2.3+.build'],
    ['1.2.3-01']
  ])('rejects the non-semantic version %s', (version) => {
    expect(() => parseVersion(version)).toThrow('semantic version');
  });
});

describe('parseEntry', () => {
  it('drops surrounding blank lines', () => {
    expect(parseEntry('\n\n## [1.0.0] - 2026-09-17\n\n- Entry\n\n')).toBe(
      '## [1.0.0] - 2026-09-17\n\n- Entry'
    );
  });

  it('drops blank lines that carry whitespace', () => {
    expect(parseEntry('  \n\t\n- Entry\n   \n')).toBe('- Entry');
  });

  it('preserves indentation on the first content line', () => {
    // An indented first line can open a code block or a nested list item.
    expect(parseEntry('\n    indented\n- Entry')).toBe('    indented\n- Entry');
  });

  it('preserves trailing spaces that mark a hard line break', () => {
    expect(parseEntry('- Entry  \n- Next  \n\n')).toBe('- Entry  \n- Next  ');
  });

  it('preserves blank lines inside the entry', () => {
    expect(parseEntry('## [1.0.0]\n\n\n- Entry')).toBe(
      '## [1.0.0]\n\n\n- Entry'
    );
  });

  it.each([[''], ['   \n  \n']])('rejects the empty entry %s', (entry) => {
    expect(() => parseEntry(entry)).toThrow("Input 'entry' must not be empty.");
  });
});

describe('isUnreleasedHeading', () => {
  it.each([
    ['## [Unreleased]'],
    ['## Unreleased'],
    ['## unreleased'],
    ['## [UNRELEASED] - pending']
  ])('recognizes %s', (line) => {
    expect(isUnreleasedHeading(line)).toBe(true);
  });

  it.each([['## [1.0.0] - 2026-09-17'], ['### Unreleased'], ['- Unreleased']])(
    'does not recognize %s',
    (line) => {
      expect(isUnreleasedHeading(line)).toBe(false);
    }
  );
});

describe('documentsVersion', () => {
  const content = `${HEADER}\n## [1.0.0] - 2026-09-17\n\n- First release\n`;

  it('finds a version that already has a heading', () => {
    expect(documentsVersion(content, '1.0.0')).toBe(true);
  });

  it('does not treat a prefix of an existing version as documented', () => {
    expect(documentsVersion(content, '1.0.0-rc.1')).toBe(false);
  });

  it.each([
    ['1.0.0', '## [1.0.0-rc.1] - 2026-09-18'],
    ['1.0.0', '## [1.0.0+build.5] - 2026-09-18'],
    ['1.0.1', '## [1.0.10] - 2026-09-18']
  ])(
    'does not treat %s as documented by the longer version in %s',
    (version, line) => {
      // The closing bracket is the boundary: a longer version cannot match.
      expect(documentsVersion(`${HEADER}\n${line}\n`, version)).toBe(false);
    }
  );

  it('does not match a version mentioned inside entry text', () => {
    expect(documentsVersion(`${content}\n- Mentions ## [2.0.0]`, '2.0.0')).toBe(
      false
    );
  });
});

describe('insertEntry', () => {
  const entry = '## [1.1.0] - 2026-09-18\n\n### Highlights\n\n- Second release';

  it('appends below a header that holds no releases', () => {
    expect(insertEntry(HEADER, entry)).toBe(`${HEADER}\n${entry}\n`);
  });

  it('inserts above an existing release', () => {
    const content = `${HEADER}\n## [1.0.0] - 2026-09-17\n\n- First release\n`;
    expect(insertEntry(content, entry)).toBe(
      `${HEADER}\n${entry}\n\n## [1.0.0] - 2026-09-17\n\n- First release\n`
    );
  });

  it('inserts below an Unreleased section and above older releases', () => {
    const content = `${HEADER}\n## [Unreleased]\n\n- Pending work\n\n## [1.0.0] - 2026-09-17\n\n- First release\n`;
    expect(insertEntry(content, entry)).toBe(
      `${HEADER}\n## [Unreleased]\n\n- Pending work\n\n${entry}\n\n## [1.0.0] - 2026-09-17\n\n- First release\n`
    );
  });

  it('appends below an Unreleased section that has no releases under it', () => {
    const content = `${HEADER}\n## Unreleased\n\n- Pending work\n`;
    expect(insertEntry(content, entry)).toBe(
      `${HEADER}\n## Unreleased\n\n- Pending work\n\n${entry}\n`
    );
  });
});
