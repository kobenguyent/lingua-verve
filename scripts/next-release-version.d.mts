export interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

export interface ReleaseCommit {
  sha?: string;
  subject: string;
  body?: string;
}

export interface ReleasePlanInput {
  eventName?: string;
  refName?: string;
  refType?: string;
  manualTag?: string;
  manualBump?: 'auto' | 'patch' | 'minor' | 'major' | string;
  reachableTags?: string[];
  allRepoTags?: string[];
  tagsAtHead?: string[];
  commits?: ReleaseCommit[];
  changedFiles?: string[];
}

export interface ReleasePlanResult {
  shouldRelease: boolean;
  tag: string;
  version: string;
  previousTag: string;
  bump: 'major' | 'minor' | 'patch' | 'explicit-tag' | 'manual-tag' | 'none';
  reason: string;
}

export function parseSemverTag(tag: string): SemverParts | null;
export function compareSemver(a: SemverParts, b: SemverParts): number;
export function formatSemverTag(parts: SemverParts): string;
export function normalizeTagInput(raw: string): string;
export function isNonReleasableFile(filePath: string): boolean;
export function findLatestSemverTag(tags?: string[]): string | null;
export function detectBumpLevel(commits?: ReleaseCommit[]): 'major' | 'minor' | 'patch';
export function applyBump(baseTag: string, bump: 'major' | 'minor' | 'patch', allExistingTags?: string[]): string;
export function computeNextRelease(input?: ReleasePlanInput): ReleasePlanResult;
export function gatherGitContext(cwd?: string): {
  reachableTags: string[];
  allRepoTags: string[];
  tagsAtHead: string[];
  commits: ReleaseCommit[];
  changedFiles: string[];
};
