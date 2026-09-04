const {
  formatCommits,
  buildPrompt,
  extractNotes,
  parseMaxCommits
} = require('./index');

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
