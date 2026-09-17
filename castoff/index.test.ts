import { describe, expect, it } from '@jest/globals';
import {
  formatCommits,
  buildPrompt,
  extractNotes,
  parseMaxCommits,
  appendAttribution,
  demoteHeadings,
  formatReleaseDate,
  buildChangelogEntry
} from './index.js';

describe('formatCommits', () => {
  it('formats raw git log output into bullet list', () => {
    const raw = 'abc123 Fix bug\ndef456 Add feature\nghi789 Update docs';
    expect(formatCommits(raw)).toBe(
      '- abc123 Fix bug\n- def456 Add feature\n- ghi789 Update docs'
    );
  });

  it('filters out empty lines', () => {
    const raw = 'abc123 Fix bug\n\n\ndef456 Add feature';
    expect(formatCommits(raw)).toBe('- abc123 Fix bug\n- def456 Add feature');
  });

  it('filters out whitespace-only lines', () => {
    const raw = 'abc123 Fix bug\n   \ndef456 Add feature';
    expect(formatCommits(raw)).toBe('- abc123 Fix bug\n- def456 Add feature');
  });

  it('returns empty string for empty input', () => {
    expect(formatCommits('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(formatCommits('   \n  \n  ')).toBe('');
  });

  it('handles single commit', () => {
    expect(formatCommits('abc123 Initial commit')).toBe(
      '- abc123 Initial commit'
    );
  });
});

describe('buildPrompt', () => {
  it('includes release tag and previous tag', () => {
    const prompt = buildPrompt('v1.2.3', 'v1.2.2', '- abc123 Fix');
    expect(prompt).toContain('Release tag: v1.2.3');
    expect(prompt).toContain('Previous tag: v1.2.2');
  });

  it("shows 'None' when no previous tag", () => {
    const prompt = buildPrompt('v1.0.0', '', '- abc123 Initial');
    expect(prompt).toContain('Previous tag: None');
  });

  it('includes commits in the prompt', () => {
    const commits = '- abc123 Fix bug\n- def456 Add feature';
    const prompt = buildPrompt('v1.0.0', '', commits);
    expect(prompt).toContain('Commits:');
    expect(prompt).toContain('- abc123 Fix bug');
    expect(prompt).toContain('- def456 Add feature');
  });

  it('shows placeholder when no commits', () => {
    const prompt = buildPrompt('v1.0.0', '', '');
    expect(prompt).toContain('_No commits found_');
  });

  it('includes release notes requirements', () => {
    const prompt = buildPrompt('v1.0.0', '', '- abc123 Fix');
    expect(prompt).toContain('## Highlights');
    expect(prompt).toContain('## Fixes');
    expect(prompt).toContain('## Changes');
    expect(prompt).toContain('Summarize commits into readable text');
    expect(prompt).toContain('Group related topics');
  });
});

describe('extractNotes', () => {
  it('extracts content from valid completion', () => {
    const completion = {
      choices: [
        {
          message: {
            content: '## Highlights\n\n- Fixed critical bug'
          }
        }
      ]
    };
    expect(extractNotes(completion, 'v1.0.0')).toBe(
      '## Highlights\n\n- Fixed critical bug'
    );
  });

  it('trims whitespace from content', () => {
    const completion = {
      choices: [
        {
          message: {
            content: '  \n## Release Notes\n\nContent here  \n'
          }
        }
      ]
    };
    expect(extractNotes(completion, 'v1.0.0')).toBe(
      '## Release Notes\n\nContent here'
    );
  });

  it('returns fallback when choices is empty', () => {
    const completion = { choices: [] };
    expect(extractNotes(completion, 'v2.0.0')).toBe(
      '# Release v2.0.0\n\n_Auto-generated notes unavailable._'
    );
  });

  it('returns fallback when choices is undefined', () => {
    const completion = {};
    expect(extractNotes(completion, 'v1.0.0')).toBe(
      '# Release v1.0.0\n\n_Auto-generated notes unavailable._'
    );
  });

  it('returns fallback when message content is empty', () => {
    const completion = {
      choices: [{ message: { content: '' } }]
    };
    expect(extractNotes(completion, 'v1.0.0')).toBe(
      '# Release v1.0.0\n\n_Auto-generated notes unavailable._'
    );
  });

  it('returns fallback when message content is undefined', () => {
    const completion = {
      choices: [{ message: {} }]
    };
    expect(extractNotes(completion, 'v3.0.0')).toBe(
      '# Release v3.0.0\n\n_Auto-generated notes unavailable._'
    );
  });
});

describe('parseMaxCommits', () => {
  it('returns default when input is empty', () => {
    expect(parseMaxCommits('')).toBe(200);
  });

  it('returns parsed positive integer', () => {
    expect(parseMaxCommits('25')).toBe(25);
  });

  it('throws on non-numeric input', () => {
    expect(() => parseMaxCommits('abc')).toThrow(
      "Input 'max_commits' must be an integer between 1 and 1000."
    );
  });

  it('throws on out-of-range input', () => {
    expect(() => parseMaxCommits('0')).toThrow(
      "Input 'max_commits' must be an integer between 1 and 1000."
    );
    expect(() => parseMaxCommits('1001')).toThrow(
      "Input 'max_commits' must be an integer between 1 and 1000."
    );
  });
});

describe('appendAttribution (#21)', () => {
  const body =
    '## Highlights\n\n- New feature  \n\n## Fixes\n\n- Fixed bug\n\n## Changes\n\n- Updated docs';
  const footer =
    '\n\n---\nGenerated by [Castoff](https://github.com/everydaydevopsio/castoff) using OpenAI model `gpt-6-astra`.';

  it('preserves note sections and internal whitespace before the final footer', () => {
    expect(appendAttribution(body, 'gpt-6-astra')).toBe(body + footer);
  });

  it('is idempotent and replaces duplicate trailing footers with stale models', () => {
    const stale = footer.replace('gpt-6-astra', 'old-model');
    const notes = appendAttribution(
      body + stale + footer + '\n',
      'gpt-6-astra'
    );
    expect(notes).toBe(body + footer);
    expect(appendAttribution(notes, 'gpt-6-astra')).toBe(notes);
  });

  it('preserves attribution mentioned within release-note content', () => {
    const content =
      body + footer + '\n\n## More changes\n\n- Keep this section';
    expect(appendAttribution(content, 'gpt-6-astra')).toBe(content + footer);
  });

  it('replaces a response containing only attribution', () => {
    expect(appendAttribution(footer.trim(), 'gpt-6-astra')).toBe(footer);
  });

  it('replaces a trailing footer with CRLF line endings', () => {
    expect(
      appendAttribution(body + footer.replaceAll('\n', '\r\n'), 'gpt-6-astra')
    ).toBe(body + footer);
  });
});

describe('formatCommits release-commit filtering', () => {
  it('drops the release chore commit created by the release workflow', () => {
    const raw =
      'abc123 chore: release v2.1.0\ndef456 feat: add changelog output';
    expect(formatCommits(raw)).toBe('- def456 feat: add changelog output');
  });

  it('drops release chores without a leading v and with build metadata', () => {
    const raw =
      'abc123 chore: release 2.1.0\ndef456 chore: release v2.1.0-rc.1\nghi789 fix: bug';
    expect(formatCommits(raw)).toBe('- ghi789 fix: bug');
  });

  it('keeps chores that only mention a release', () => {
    const raw =
      'abc123 chore: prepare release v2.1.0\ndef456 chore: release notes cleanup';
    expect(formatCommits(raw)).toBe(
      '- abc123 chore: prepare release v2.1.0\n- def456 chore: release notes cleanup'
    );
  });
});

describe('demoteHeadings', () => {
  it('shifts every ATX heading one level deeper', () => {
    expect(demoteHeadings('# Release\n\n## Highlights\n\n### Detail')).toBe(
      '## Release\n\n### Highlights\n\n#### Detail'
    );
  });

  it('leaves level-six headings unchanged', () => {
    expect(demoteHeadings('###### Deepest')).toBe('###### Deepest');
  });

  it('ignores hashes that do not start a heading', () => {
    expect(demoteHeadings('Issue #21 fixed\n#NotAHeading')).toBe(
      'Issue #21 fixed\n#NotAHeading'
    );
  });

  it('leaves headings inside fenced code blocks untouched', () => {
    const notes =
      '## Changes\n\n```sh\n# comment\n## also a comment\n```\n\n## Fixes';
    expect(demoteHeadings(notes)).toBe(
      '### Changes\n\n```sh\n# comment\n## also a comment\n```\n\n### Fixes'
    );
  });

  it('treats tilde fences independently of backtick fences', () => {
    const notes = '~~~\n# kept\n~~~\n\n## Fixes';
    expect(demoteHeadings(notes)).toBe('~~~\n# kept\n~~~\n\n### Fixes');
  });

  it('keeps a fence open across a delimiter of the other kind', () => {
    const notes = '```\n~~~\n# kept\n```\n\n## Fixes';
    expect(demoteHeadings(notes)).toBe('```\n~~~\n# kept\n```\n\n### Fixes');
  });

  it('keeps a long fence open across a shorter inner fence', () => {
    const notes = '````\n```\n# kept\n```\n# also kept\n````\n\n## Fixes';
    expect(demoteHeadings(notes)).toBe(
      '````\n```\n# kept\n```\n# also kept\n````\n\n### Fixes'
    );
  });

  it('closes a fence with a longer run of the same character', () => {
    const notes = '```\n# kept\n````\n\n## Fixes';
    expect(demoteHeadings(notes)).toBe('```\n# kept\n````\n\n### Fixes');
  });
});

describe('formatReleaseDate', () => {
  it('formats a date as an ISO calendar date in UTC', () => {
    expect(formatReleaseDate(new Date('2026-09-17T23:59:59Z'))).toBe(
      '2026-09-17'
    );
  });
});

describe('buildChangelogEntry', () => {
  const notes = '## Highlights\n\n- New feature\n\n## Fixes\n\n- Fixed bug';
  const footer =
    '\n\n---\nGenerated by [Castoff](https://github.com/everydaydevopsio/castoff) using OpenAI model `gpt-6-astra`.';

  it('builds a dated version heading above demoted note sections', () => {
    expect(buildChangelogEntry(notes, 'v1.2.3', '2026-09-17')).toBe(
      '## [1.2.3] - 2026-09-17\n\n### Highlights\n\n- New feature\n\n### Fixes\n\n- Fixed bug'
    );
  });

  it('strips the attribution footer so entries do not accumulate it', () => {
    const entry = buildChangelogEntry(notes + footer, 'v1.2.3', '2026-09-17');
    expect(entry).not.toContain('Generated by [Castoff]');
    expect(entry).toBe(buildChangelogEntry(notes, 'v1.2.3', '2026-09-17'));
  });

  it('accepts a tag without a leading v', () => {
    expect(buildChangelogEntry(notes, '1.2.3', '2026-09-17')).toContain(
      '## [1.2.3] - 2026-09-17'
    );
  });

  it('records a placeholder when the notes carry no content', () => {
    expect(buildChangelogEntry(footer, 'v1.2.3', '2026-09-17')).toBe(
      '## [1.2.3] - 2026-09-17\n\n_No release notes were generated._'
    );
  });
});
