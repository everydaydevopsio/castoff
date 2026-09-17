import { getInput, setOutput, setFailed, info } from '@actions/core';
import { chmodSync, existsSync, renameSync, statSync } from 'node:fs';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';

/** Header written when the changelog file does not exist yet. */
const HEADER = `# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`;

/** The SemVer 2.0.0 grammar from semver.org. */
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Validate a release version.
 * @param {string} version - Version without a leading v
 * @returns {string} The validated version
 */
function parseVersion(version: string): string {
  if (!SEMVER.test(version)) {
    throw new Error(
      `Input 'version' must be a semantic version without a leading v (for example 1.2.3), received '${version}'.`
    );
  }
  return version;
}

/**
 * Validate a changelog entry.
 * @param {string} entry - Markdown entry for one release
 * @returns {string} The entry without surrounding blank lines
 */
function parseEntry(entry: string): string {
  const trimmed = entry.trim();
  if (!trimmed) {
    throw new Error("Input 'entry' must not be empty.");
  }
  return trimmed;
}

/** Keep a Changelog puts an Unreleased section above released versions. */
function isUnreleasedHeading(line: string): boolean {
  return /^## +\[?unreleased\]?/i.test(line);
}

/**
 * Report whether a version already has a heading in the changelog.
 * Compares literally: version strings contain regular expression metacharacters.
 * @param {string} content - Current changelog contents
 * @param {string} version - Release version
 * @returns {boolean} True when the version is already documented
 */
function documentsVersion(content: string, version: string): boolean {
  const heading = `## [${version}]`;
  return content.split('\n').some((line) => line.startsWith(heading));
}

/**
 * Insert an entry above the newest released version.
 * @param {string} content - Current changelog contents
 * @param {string} entry - Entry to insert
 * @returns {string} The updated contents
 */
function insertEntry(content: string, entry: string): string {
  const lines = content.split('\n');
  const index = lines.findIndex(
    (line) => line.startsWith('## ') && !isUnreleasedHeading(line)
  );
  if (index === -1) {
    // No released versions yet: the entry belongs after the header, and after
    // an Unreleased section when the file has one.
    return `${content.replace(/\n+$/, '')}\n\n${entry}\n`;
  }
  lines.splice(index, 0, entry, '');
  return lines.join('\n');
}

/**
 * Replace a file's contents through a rename, so an interrupted run leaves the
 * original intact. The staging file inherits the target's mode, which the
 * rename would otherwise replace with its own.
 * @param {string} file - Path to replace
 * @param {string} content - New contents
 */
function replaceFile(file: string, content: string): void {
  const staged = join(
    dirname(file) || '.',
    `.${randomBytes(6).toString('hex')}.changelog`
  );
  try {
    writeFileSync(staged, content);
    chmodSync(staged, statSync(file).mode & 0o777);
    renameSync(staged, file);
  } catch (error) {
    if (existsSync(staged)) unlinkSync(staged);
    throw error;
  }
}

async function run(): Promise<void> {
  try {
    const version = parseVersion(getInput('version', { required: true }));
    const entry = parseEntry(getInput('entry', { required: true }));
    const file = getInput('file') || 'CHANGELOG.md';

    if (!existsSync(file)) {
      writeFileSync(file, HEADER);
      info(`Created ${file}.`);
    }

    const content = readFileSync(file, 'utf8');
    if (documentsVersion(content, version)) {
      info(`${file} already documents ${version}; leaving it unchanged.`);
      setOutput('updated', 'false');
      setOutput('file', file);
      return;
    }

    replaceFile(file, insertEntry(content, entry));
    info(`Added ${version} to ${file}.`);
    setOutput('updated', 'true');
    setOutput('file', file);
  } catch (error) {
    setFailed(error instanceof Error ? error.message : String(error));
  }
}

export {
  HEADER,
  parseVersion,
  parseEntry,
  isUnreleasedHeading,
  documentsVersion,
  insertEntry,
  run
};
