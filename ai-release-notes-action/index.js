const core = require('@actions/core');
const { execFileSync } = require('child_process');
const OpenAI = require('openai');

/**
 * Format raw git log output into a bullet list for the prompt.
 * @param {string} rawCommits - Output from `git log --pretty=format:'%h %s'`
 * @returns {string} Bullet list of commits
 */
function formatCommits(rawCommits) {
  return rawCommits
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => `- ${line}`)
    .join('\n');
}

/**
 * Build the prompt sent to OpenAI for release notes generation.
 * @param {string} tag - Release tag
 * @param {string} previousTag - Previous tag (or empty)
 * @param {string} commitsList - Formatted commits list
 * @returns {string} The prompt text
 */
function buildPrompt(tag, previousTag, commitsList) {
  return `
Generate excellent GitHub release notes in Markdown.

Release tag: ${tag}
Previous tag: ${previousTag || 'None'}

Commits:
${commitsList || '_No commits found_'}

Requirements:
- Use clear Markdown (## Highlights, ## Fixes, ## Changes).
- Summarize commits into readable text.
- Group related topics.
- Avoid repeating raw commit messages verbatim.
`;
}

/**
 * Extract release notes from OpenAI completion response, with fallback.
 * @param {object} completion - OpenAI chat completion response
 * @param {string} tag - Release tag for fallback
 * @returns {string} Release notes
 */
function extractNotes(completion, tag) {
  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    `# Release ${tag}\n\n_Auto-generated notes unavailable._`
  );
}

/**
 * Parse and validate max_commits input from workflow config.
 * @param {string} value - Raw max_commits input
 * @returns {number} Parsed positive integer in allowed bounds
 */
function parseMaxCommits(value) {
  const parsed = Number.parseInt(value || '200', 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
    throw new Error(
      "Input 'max_commits' must be an integer between 1 and 1000."
    );
  }
  return parsed;
}

async function run() {
  try {
    const apiKey = core.getInput('openai_api_key', { required: true });
    const model = core.getInput('model') || 'gpt-4.1-mini';
    const tag = core.getInput('tag', { required: true });
    const maxCommits = parseMaxCommits(core.getInput('max_commits'));

    const client = new OpenAI({ apiKey });

    let previousTag = '';
    try {
      previousTag = execFileSync(
        'git',
        ['describe', '--tags', '--abbrev=0', 'HEAD^'],
        { encoding: 'utf8' }
      ).trim();
    } catch {
      core.info('No previous tag found (first release).');
    }

    const logRange = previousTag ? `${previousTag}..HEAD` : 'HEAD';
    const rawCommits = execFileSync(
      'git',
      ['log', '--pretty=format:%h %s', logRange, '-n', String(maxCommits)],
      { encoding: 'utf8' }
    ).trim();

    const commitsList = formatCommits(rawCommits);
    const prompt = buildPrompt(tag, previousTag, commitsList);

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical writer who crafts concise, high-quality release notes.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    });

    const notes = extractNotes(completion, tag);

    core.setOutput('release_notes', notes);
    core.info('AI release notes generated successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  formatCommits,
  buildPrompt,
  extractNotes,
  parseMaxCommits,
  run
};
