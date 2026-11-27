import { describe, it, expect } from 'vitest';
import {
  applyBump,
  computeNextRelease,
  detectBumpLevel,
  findLatestSemverTag,
  isNonReleasableFile,
} from '../../scripts/next-release-version.mjs';

describe('Automatic Semantic Release Planner (scripts/next-release-version.mjs)', () => {
  it('picks the highest semver tag regardless of lexical order', () => {
    expect(findLatestSemverTag(['v1.2.0', 'v1.10.0', 'v1.7.1', 'v1.7.0', 'v2.0.0-beta.1'])).toBe('v1.10.0');
    expect(findLatestSemverTag([])).toBeNull();
  });

  it('detects patch, minor, and major bumps from Conventional Commits and hints', () => {
    expect(detectBumpLevel([{ subject: 'fix: tighten speaking TTS', body: '' }])).toBe('patch');
    expect(detectBumpLevel([{ subject: 'feat(coach): separate coach notes', body: '' }])).toBe('minor');
    expect(
      detectBumpLevel([
        { subject: 'fix: minor tweak', body: '' },
        { subject: 'feat: new language pack', body: '' },
      ])
    ).toBe('minor');
    expect(detectBumpLevel([{ subject: 'feat!: drop legacy schema', body: '' }])).toBe('major');
    expect(
      detectBumpLevel([{ subject: 'refactor: new storage format', body: 'BREAKING CHANGE: resets old cache' }])
    ).toBe('major');
  });

  it('auto-bumps version cleanly on push to main and avoids colliding with existing repo tags', () => {
    const patchPlan = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1', 'v1.7.0'],
      allRepoTags: ['v1.7.1', 'v1.7.0'],
      tagsAtHead: [],
      commits: [{ sha: 'abc', subject: 'fix: cleaner audio playback', body: '' }],
      changedFiles: ['src/utils/aiClient.ts'],
    });
    expect(patchPlan.shouldRelease).toBe(true);
    expect(patchPlan.tag).toBe('v1.7.2');
    expect(patchPlan.version).toBe('1.7.2');
    expect(patchPlan.bump).toBe('patch');

    const minorPlan = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1'],
      allRepoTags: ['v1.7.1'],
      tagsAtHead: [],
      commits: [
        { sha: 'def', subject: 'docs(readme): refresh badges', body: '' },
        { sha: 'abc', subject: 'feat: Spanish A1-C2 curriculum', body: '' },
      ],
      changedFiles: ['README.md', 'src/data/courses.ts'],
    });
    expect(minorPlan.shouldRelease).toBe(true);
    expect(minorPlan.tag).toBe('v1.8.0');
    expect(minorPlan.bump).toBe('minor');

    // Collision guard skips already-used tag on another ref
    expect(applyBump('v1.7.1', 'patch', ['v1.7.1', 'v1.7.2'])).toBe('v1.7.3');
  });

  it('skips docs/workflow-only pushes, already-tagged HEAD, and [skip release], while honoring [force release]', () => {
    expect(isNonReleasableFile('README.md')).toBe(true);
    expect(isNonReleasableFile('docs/screenshots/macos-workspace.png')).toBe(true);
    expect(isNonReleasableFile('.github/workflows/ci.yml')).toBe(true);
    expect(isNonReleasableFile('src/components/AICoachView.tsx')).toBe(false);
    expect(isNonReleasableFile('macos/Sources/LinguaVerveUI/AICoachNativeView.swift')).toBe(false);

    // Docs/workflow only -> skip
    const docsOnly = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1'],
      commits: [{ sha: 'a1', subject: 'docs(readme): update screenshots', body: '' }],
      changedFiles: ['README.md', 'docs/screenshots/hero.png'],
    });
    expect(docsOnly.shouldRelease).toBe(false);
    expect(docsOnly.reason).toContain('Only documentation or workflow files');

    // [force release] overrides docs/workflow-only skip
    const forced = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1'],
      commits: [{ sha: 'a2', subject: 'ci: auto release [force release]', body: '' }],
      changedFiles: ['.github/workflows/release.yml'],
    });
    expect(forced.shouldRelease).toBe(true);
    expect(forced.tag).toBe('v1.7.2');

    // [skip release] suppresses app-code release
    const skipped = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1'],
      commits: [{ sha: 'a3', subject: 'feat: wip draft [skip release]', body: '' }],
      changedFiles: ['src/App.tsx'],
    });
    expect(skipped.shouldRelease).toBe(false);
    expect(skipped.reason).toContain('[skip release]');

    // Already tagged HEAD prevents duplicate release when pushing branch + manual tag together
    const alreadyTagged = computeNextRelease({
      eventName: 'push',
      refName: 'main',
      refType: 'branch',
      reachableTags: ['v1.7.1'],
      tagsAtHead: ['v1.7.1'],
      commits: [],
      changedFiles: [],
    });
    expect(alreadyTagged.shouldRelease).toBe(false);
    expect(alreadyTagged.reason).toContain('already has release tag v1.7.1');
  });

  it('supports manual tag pushes and workflow_dispatch (both auto-bump and explicit override)', () => {
    const manualTagPush = computeNextRelease({
      eventName: 'push',
      refName: 'v2.0.0',
      refType: 'tag',
      reachableTags: ['v1.7.1'],
    });
    expect(manualTagPush.shouldRelease).toBe(true);
    expect(manualTagPush.tag).toBe('v2.0.0');
    expect(manualTagPush.version).toBe('2.0.0');

    const dispatchAuto = computeNextRelease({
      eventName: 'workflow_dispatch',
      manualTag: '',
      manualBump: 'minor',
      reachableTags: ['v1.7.1'],
      commits: [],
    });
    expect(dispatchAuto.shouldRelease).toBe(true);
    expect(dispatchAuto.tag).toBe('v1.8.0');

    const dispatchExplicit = computeNextRelease({
      eventName: 'workflow_dispatch',
      manualTag: '2.1.0',
      manualBump: 'auto',
      reachableTags: ['v1.7.1'],
    });
    expect(dispatchExplicit.shouldRelease).toBe(true);
    expect(dispatchExplicit.tag).toBe('v2.1.0');
    expect(dispatchExplicit.version).toBe('2.1.0');
  });
});
