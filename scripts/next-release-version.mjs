#!/usr/bin/env node
/**
 * Computes the next Semantic Version release tag automatically from git tags,
 * commit messages (Conventional Commits), and changed file paths since the last
 * release tag. Zero external dependencies.
 *
 * Usage:
 *   node scripts/next-release-version.mjs                 # Human-readable dry run
 *   node scripts/next-release-version.mjs --json          # JSON output
 *   node scripts/next-release-version.mjs --github-output "$GITHUB_OUTPUT"
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SEMVER_TAG_RE = /^v(\d+)\.(\d+)\.(\d+)$/;
const ANY_RELEASE_TAG_RE = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const BREAKING_SUBJECT_RE = /^[a-z]+(?:\([^)]+\))?!:/i;
const BREAKING_BODY_RE = /\bBREAKING[ -]CHANGE\s*:/i;
const FEAT_SUBJECT_RE = /^\s*feat(?:\([^)]+\))?:/i;
const SKIP_RELEASE_RE = /\[(skip release|no release|release skip)\]/i;
const FORCE_RELEASE_RE = /\[force release\]/i;
const MAJOR_HINT_RE = /\[(release major|bump major|major)\]/i;
const MINOR_HINT_RE = /\[(release minor|bump minor|minor)\]/i;

const NON_RELEASABLE_FILE_PATTERNS = [
  /\.md$/i,
  /^docs\//i,
  /^LICENSE(?:\..+)?$/i,
  /^\.gitignore$/i,
  /^\.betterleaks\.toml$/i,
  /^\.editorconfig$/i,
  /^\.github\//i,
];

export function parseSemverTag(tag) {
  const match = String(tag || '').trim().match(SEMVER_TAG_RE);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function compareSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

export function formatSemverTag({ major, minor, patch }) {
  return `v${major}.${minor}.${patch}`;
}

export function normalizeTagInput(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

export function isNonReleasableFile(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized) return true;
  return NON_RELEASABLE_FILE_PATTERNS.some((re) => re.test(normalized));
}

export function findLatestSemverTag(tags = []) {
  let latest = null;
  let latestTag = null;
  for (const tag of tags) {
    const parsed = parseSemverTag(tag);
    if (!parsed) continue;
    if (!latest || compareSemver(parsed, latest) > 0) {
      latest = parsed;
      latestTag = formatSemverTag(parsed);
    }
  }
  return latestTag;
}

export function detectBumpLevel(commits = []) {
  let bump = 'patch';
  for (const commit of commits) {
    const subject = String(commit?.subject || '');
    const body = String(commit?.body || '');
    const full = `${subject}\n${body}`;
    if (BREAKING_SUBJECT_RE.test(subject) || BREAKING_BODY_RE.test(full) || MAJOR_HINT_RE.test(full)) {
      return 'major';
    }
    if (FEAT_SUBJECT_RE.test(subject) || MINOR_HINT_RE.test(full)) {
      bump = 'minor';
    }
  }
  return bump;
}

export function applyBump(baseTag, bump, allExistingTags = []) {
  const base = parseSemverTag(baseTag) || { major: 0, minor: 0, patch: 0 };
  const next = { ...base };
  if (bump === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (bump === 'minor') {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }

  const existingSet = new Set(allExistingTags.map((t) => String(t).trim()));
  let candidate = formatSemverTag(next);
  while (existingSet.has(candidate)) {
    next.patch += 1;
    candidate = formatSemverTag(next);
  }
  return candidate;
}

/**
 * Pure release planner used by GitHub Actions and unit tests.
 */
export function computeNextRelease({
  eventName = 'push',
  refName = 'main',
  refType = 'branch',
  manualTag = '',
  manualBump = 'auto',
  reachableTags = [],
  allRepoTags = [],
  tagsAtHead = [],
  commits = [],
  changedFiles = [],
} = {}) {
  const previousTag = findLatestSemverTag(reachableTags) || '';
  const mergedRepoTags = Array.from(new Set([...reachableTags, ...allRepoTags]));

  // 1. Explicit git tag push (backward-compatible manual `git tag vX.Y.Z && git push origin vX.Y.Z`)
  if (eventName === 'push' && refType === 'tag') {
    const tag = normalizeTagInput(refName);
    return {
      shouldRelease: true,
      tag,
      version: tag.replace(/^v/, ''),
      previousTag,
      bump: 'explicit-tag',
      reason: `Triggered by explicit version tag ${tag}`,
    };
  }

  // 2. Manual workflow_dispatch (supports explicit tag override OR automatic version calculation)
  if (eventName === 'workflow_dispatch') {
    const explicit = normalizeTagInput(manualTag);
    if (explicit) {
      return {
        shouldRelease: true,
        tag: explicit,
        version: explicit.replace(/^v/, ''),
        previousTag,
        bump: 'manual-tag',
        reason: `Manual workflow dispatch for explicit tag ${explicit}`,
      };
    }

    const chosenBump =
      manualBump === 'major' || manualBump === 'minor' || manualBump === 'patch'
        ? manualBump
        : detectBumpLevel(commits);
    const nextTag = applyBump(previousTag || 'v0.0.0', chosenBump, mergedRepoTags);
    return {
      shouldRelease: true,
      tag: nextTag,
      version: nextTag.replace(/^v/, ''),
      previousTag,
      bump: chosenBump,
      reason: `Manual workflow dispatch (${chosenBump} bump from ${previousTag || 'initial release'})`,
    };
  }

  // 3. Automatic release on push to main/master
  const existingHeadReleaseTag = tagsAtHead.find((t) => ANY_RELEASE_TAG_RE.test(String(t).trim()));
  if (existingHeadReleaseTag) {
    return {
      shouldRelease: false,
      tag: existingHeadReleaseTag,
      version: existingHeadReleaseTag.replace(/^v/, ''),
      previousTag: existingHeadReleaseTag,
      bump: 'none',
      reason: `HEAD already has release tag ${existingHeadReleaseTag}`,
    };
  }

  if (commits.length === 0) {
    return {
      shouldRelease: false,
      tag: '',
      version: '',
      previousTag,
      bump: 'none',
      reason: previousTag ? `No new commits since ${previousTag}` : 'No commits found',
    };
  }

  const headCommit = commits[0];
  const headFullMsg = `${headCommit?.subject || ''}\n${headCommit?.body || ''}`;

  if (SKIP_RELEASE_RE.test(headFullMsg)) {
    return {
      shouldRelease: false,
      tag: '',
      version: '',
      previousTag,
      bump: 'none',
      reason: 'HEAD commit message requested [skip release]',
    };
  }

  const forceRelease = FORCE_RELEASE_RE.test(headFullMsg);
  const releasableFiles = changedFiles.filter((file) => !isNonReleasableFile(file));

  if (!forceRelease && changedFiles.length > 0 && releasableFiles.length === 0) {
    return {
      shouldRelease: false,
      tag: '',
      version: '',
      previousTag,
      bump: 'none',
      reason: `Only documentation or workflow files changed since ${previousTag || 'start'} (add [force release] to override)`,
    };
  }

  const bump = detectBumpLevel(commits);
  const nextTag = applyBump(previousTag || 'v0.0.0', bump, mergedRepoTags);

  return {
    shouldRelease: true,
    tag: nextTag,
    version: nextTag.replace(/^v/, ''),
    previousTag,
    bump,
    reason: forceRelease
      ? `Forced automatic ${bump} release (${nextTag}) from ${previousTag || 'initial release'}`
      : `Automatic ${bump} release (${nextTag}) from ${previousTag || 'initial release'} across ${commits.length} commit${commits.length === 1 ? '' : 's'}`,
  };
}

function runGit(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

export function gatherGitContext(cwd = process.cwd()) {
  const reachableRaw = runGit(['tag', '--merged', 'HEAD', '--list', 'v*'], cwd);
  const reachableTags = reachableRaw ? reachableRaw.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const allTagsRaw = runGit(['tag', '--list', 'v*'], cwd);
  const allRepoTags = allTagsRaw ? allTagsRaw.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const headTagsRaw = runGit(['tag', '--points-at', 'HEAD', '--list', 'v*'], cwd);
  const tagsAtHead = headTagsRaw ? headTagsRaw.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const previousTag = findLatestSemverTag(reachableTags);
  const range = previousTag ? `${previousTag}..HEAD` : 'HEAD';

  const RECORD_SEP = '\x1e';
  const FIELD_SEP = '\x1f';
  const logRaw = runGit(
    ['log', range, `--format=%H${FIELD_SEP}%s${FIELD_SEP}%b${RECORD_SEP}`],
    cwd
  );

  const commits = logRaw
    ? logRaw
        .split(RECORD_SEP)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [sha = '', subject = '', body = ''] = entry.split(FIELD_SEP);
          return { sha: sha.trim(), subject: subject.trim(), body: body.trim() };
        })
    : [];

  const filesRaw = previousTag
    ? runGit(['diff', '--name-only', `${previousTag}..HEAD`], cwd)
    : runGit(['ls-files'], cwd);
  const changedFiles = filesRaw ? filesRaw.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  return { reachableTags, allRepoTags, tagsAtHead, commits, changedFiles };
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const ghOutIdx = args.indexOf('--github-output');
  const ghOutputPath = ghOutIdx >= 0 ? args[ghOutIdx + 1] : '';

  const eventName = process.env.GITHUB_EVENT_NAME || 'push';
  const refName = process.env.GITHUB_REF_NAME || runGit(['rev-parse', '--abbrev-ref', 'HEAD'], process.cwd()) || 'main';
  const refType =
    process.env.GITHUB_REF_TYPE ||
    ((process.env.GITHUB_REF || '').startsWith('refs/tags/') ? 'tag' : 'branch');
  const manualTag = process.env.INPUT_TAG || '';
  const manualBump = process.env.INPUT_BUMP || 'auto';

  const gitCtx = gatherGitContext(process.cwd());
  const plan = computeNextRelease({
    eventName,
    refName,
    refType,
    manualTag,
    manualBump,
    ...gitCtx,
  });

  if (ghOutputPath) {
    const lines = [
      `should_release=${plan.shouldRelease ? 'true' : 'false'}`,
      `tag=${plan.tag}`,
      `version=${plan.version}`,
      `previous_tag=${plan.previousTag}`,
      `bump=${plan.bump}`,
      `reason=${plan.reason.replace(/\r?\n/g, ' ')}`,
    ];
    appendFileSync(ghOutputPath, `${lines.join('\n')}\n`, 'utf8');
  }

  if (asJson) {
    console.log(JSON.stringify(plan, null, 2));
  } else if (plan.shouldRelease) {
    console.log(
      `[release] Next release: ${plan.tag} (version ${plan.version}, ${plan.bump} bump) — ${plan.reason}`
    );
  } else {
    console.log(`[release] Skipped — ${plan.reason}`);
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main();
}
