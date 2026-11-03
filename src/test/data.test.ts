import { describe, it, expect } from 'vitest';
import { 
  CEFR_LEVELS, 
  ENGLISH_TIPS, 
  GERMAN_TIPS, 
  ALL_TIPS, 
  filterTips, 
  calculateDiagnosticLevel,
  getLanguage
} from '../data';
import { CEFRLevel } from '../types';

describe('LinguaVerve Knowledge Base & Schema Tests', () => {
  it('should contain English and German as active languages', () => {
    const english = getLanguage('english');
    const german = getLanguage('german');
    const meta = getLanguage('meta');

    expect(english).toBeDefined();
    expect(english?.status).toBe('active');
    expect(german).toBeDefined();
    expect(german?.status).toBe('active');
    expect(meta).toBeDefined();
    expect(meta?.status).toBe('active');
  });

  it('should include staged preview languages for future extension', () => {
    const spanish = getLanguage('spanish');
    const french = getLanguage('french');
    const japanese = getLanguage('japanese');

    expect(spanish).toBeDefined();
    expect(spanish?.status).toBe('preview');
    expect(french).toBeDefined();
    expect(japanese).toBeDefined();
  });

  it('should cover all 6 CEFR levels (A1 to C2) in the progression pipeline', () => {
    const expectedLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const definedLevelIds = CEFR_LEVELS.map((l) => l.id);

    expectedLevels.forEach((level) => {
      expect(definedLevelIds).toContain(level);
    });
  });

  it('should ensure English tips cover all CEFR levels from A1 to C2', () => {
    const expectedLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const englishLevels = new Set(ENGLISH_TIPS.map((t) => t.level));

    expectedLevels.forEach((lvl) => {
      expect(englishLevels.has(lvl)).toBe(true);
    });
  });

  it('should ensure German tips cover all CEFR levels from A1 to C2', () => {
    const expectedLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const germanLevels = new Set(GERMAN_TIPS.map((t) => t.level));

    expectedLevels.forEach((lvl) => {
      expect(germanLevels.has(lvl)).toBe(true);
    });
  });

  it('should validate every tip adheres to strict quality guidelines', () => {
    ALL_TIPS.forEach((tip) => {
      expect(tip.id).toBeTruthy();
      expect(tip.title.length).toBeGreaterThan(5);
      expect(tip.summary.length).toBeGreaterThan(15);
      expect(tip.goldenRule.length).toBeGreaterThan(10);
      expect(tip.tactics.length).toBeGreaterThanOrEqual(2);
      expect(tip.tags.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Filter and Search Logic Tests', () => {
  it('should filter tips by language correctly', () => {
    const germanOnly = filterTips({ languageId: 'german' });
    germanOnly.forEach((tip) => {
      expect(tip.languageId === 'german' || tip.languageId === 'meta').toBe(true);
    });
  });

  it('should filter tips by CEFR level correctly', () => {
    const a1Tips = filterTips({ level: 'A1' });
    expect(a1Tips.length).toBeGreaterThan(0);
    a1Tips.forEach((tip) => {
      expect(tip.level === 'A1' || tip.level === 'ALL').toBe(true);
    });
  });

  it('should filter tips by category correctly', () => {
    const grammarTips = filterTips({ category: 'grammar' });
    expect(grammarTips.length).toBeGreaterThan(0);
    grammarTips.forEach((tip) => {
      expect(tip.category).toBe('grammar');
    });
  });

  it('should search across titles, summaries, and tags', () => {
    const results = filterTips({ searchQuery: 'schwa' });
    expect(results.length).toBeGreaterThan(0);
    const hasSchwa = results.some((r) => r.title.toLowerCase().includes('schwa') || r.tags.includes('schwa'));
    expect(hasSchwa).toBe(true);
  });

  it('should filter bookmarked and mastered tips', () => {
    const sampleId = ALL_TIPS[0].id;
    const bookmarked = filterTips({ bookmarkedIds: [sampleId], viewMode: 'saved' });
    expect(bookmarked.length).toBe(1);
    expect(bookmarked[0].id).toBe(sampleId);

    const mastered = filterTips({ masteredIds: [sampleId], viewMode: 'mastered' });
    expect(mastered.length).toBe(1);
    expect(mastered[0].id).toBe(sampleId);
  });
});

describe('Diagnostic Level Calculator Tests', () => {
  it('should calculate A1 when all beginner options are chosen', () => {
    const answers: Record<string, CEFRLevel> = {
      q1: 'A1',
      q2: 'A1',
      q3: 'A1',
      q4: 'A1',
    };
    expect(calculateDiagnosticLevel(answers)).toBe('A1');
  });

  it('should calculate B1/B2 when intermediate options are chosen', () => {
    const answers: Record<string, CEFRLevel> = {
      q1: 'B1',
      q2: 'B2',
      q3: 'B1',
      q4: 'B2',
    };
    const level = calculateDiagnosticLevel(answers);
    expect(['B1', 'B2']).toContain(level);
  });

  it('should calculate C2 when mastery options are selected', () => {
    const answers: Record<string, CEFRLevel> = {
      q1: 'C2',
      q2: 'C2',
      q3: 'C2',
      q4: 'C2',
    };
    expect(calculateDiagnosticLevel(answers)).toBe('C2');
  });
});
