import { jest } from '@jest/globals';

describe('run', () => {
  let coreMock;
  let execFileSyncMock;
  let createCompletionMock;
  let run;

  beforeEach(async () => {
    jest.resetModules();

    coreMock = {
      getInput: jest.fn(),
      info: jest.fn(),
      setOutput: jest.fn(),
      setFailed: jest.fn()
    };

    execFileSyncMock = jest.fn();
    createCompletionMock = jest.fn();

    jest.unstable_mockModule('@actions/core', () => ({
      getInput: coreMock.getInput,
      info: coreMock.info,
      setOutput: coreMock.setOutput,
      setFailed: coreMock.setFailed
    }));

    jest.unstable_mockModule('child_process', () => ({
      execFileSync: execFileSyncMock
    }));

    jest.unstable_mockModule('openai', () => ({
      default: jest.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: createCompletionMock
          }
        }
      }))
    }));

    ({ run } = await import('./index.js'));
  });

  it('handles missing previous tag and still sets release notes output', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'openai_api_key') return 'test-key';
      if (name === 'model') return '';
      if (name === 'tag') return 'v1.2.3';
      if (name === 'max_commits') return '';
      return '';
    });

    execFileSyncMock.mockImplementation((_cmd, args) => {
      if (args[0] === 'describe') {
        throw new Error('no previous tag');
      }
      if (args[0] === 'log') {
        return 'abc123 Fix bug\ndef456 Add feature';
      }
      throw new Error('unexpected git args');
    });

    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: '## Highlights\n\n- Fixed bug' } }]
    });

    await run();

    expect(execFileSyncMock).toHaveBeenCalledWith(
      'git',
      ['describe', '--tags', '--abbrev=0', 'HEAD^'],
      { encoding: 'utf8' }
    );
    expect(execFileSyncMock).toHaveBeenCalledWith(
      'git',
      ['log', '--pretty=format:%h %s', 'HEAD', '-n', '200'],
      { encoding: 'utf8' }
    );
    expect(coreMock.info).toHaveBeenCalledWith(
      'No previous tag found (first release).'
    );
    expect(coreMock.setOutput).toHaveBeenCalledWith(
      'release_notes',
      '## Highlights\n\n- Fixed bug'
    );
    expect(coreMock.setFailed).not.toHaveBeenCalled();
  });

  it('fails fast on invalid max_commits input', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'openai_api_key') return 'test-key';
      if (name === 'model') return 'gpt-4.1-mini';
      if (name === 'tag') return 'v1.2.3';
      if (name === 'max_commits') return 'abc';
      return '';
    });

    await run();

    expect(coreMock.setFailed).toHaveBeenCalledWith(
      "Input 'max_commits' must be an integer between 1 and 1000."
    );
    expect(execFileSyncMock).not.toHaveBeenCalled();
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('returns fallback notes when completion content is missing', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'openai_api_key') return 'test-key';
      if (name === 'model') return 'gpt-4.1-mini';
      if (name === 'tag') return 'v9.9.9';
      if (name === 'max_commits') return '10';
      return '';
    });

    execFileSyncMock.mockImplementation((_cmd, args) => {
      if (args[0] === 'describe') return 'v9.9.8';
      if (args[0] === 'log') return 'abc123 Update docs';
      throw new Error('unexpected git args');
    });

    createCompletionMock.mockResolvedValue({
      choices: [{ message: {} }]
    });

    await run();

    expect(coreMock.setOutput).toHaveBeenCalledWith(
      'release_notes',
      '# Release v9.9.9\n\n_Auto-generated notes unavailable._'
    );
    expect(coreMock.setFailed).not.toHaveBeenCalled();
  });

  it('fails the action when OpenAI call errors', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'openai_api_key') return 'test-key';
      if (name === 'model') return 'gpt-4.1-mini';
      if (name === 'tag') return 'v2.0.0';
      if (name === 'max_commits') return '10';
      return '';
    });

    execFileSyncMock.mockImplementation((_cmd, args) => {
      if (args[0] === 'describe') return 'v1.9.9';
      if (args[0] === 'log') return 'abc123 Add feature';
      throw new Error('unexpected git args');
    });

    createCompletionMock.mockRejectedValue(new Error('OpenAI unavailable'));

    await run();

    expect(coreMock.setFailed).toHaveBeenCalledWith('OpenAI unavailable');
  });
});
