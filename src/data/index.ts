import { TipItem, CEFRLevel, Category, IntensiveCourse } from '../types';
import { ENGLISH_TIPS } from './tips/english';
import { GERMAN_TIPS } from './tips/german';
import { META_TIPS } from './tips/polyglotMeta';
import { LANGUAGES, getLanguage, getActiveLanguages } from './languages';
import { CEFR_LEVELS, getLevelDetail } from './levels';
import { FALSE_FRIENDS } from './falseFriends';
import { DIAGNOSTIC_QUESTIONS } from './diagnostic';
import { OFFICIAL_EXAM_REFERENCES, getExamReferences } from './examReferences';
import { GERMAN_INTENSIVE_COURSES } from './courses/germanCourses';
import { ENGLISH_INTENSIVE_COURSES } from './courses/englishCourses';
import { PRETEST_QUESTIONS, getPreTestQuestions, evaluatePreTest } from './pretests';
import { MOCK_EXAMS, getMockExams, getMockExamById } from './mockExams';

export {
  LANGUAGES,
  getLanguage,
  getActiveLanguages,
  CEFR_LEVELS,
  getLevelDetail,
  FALSE_FRIENDS,
  DIAGNOSTIC_QUESTIONS,
  ENGLISH_TIPS,
  GERMAN_TIPS,
  META_TIPS,
  OFFICIAL_EXAM_REFERENCES,
  getExamReferences,
  GERMAN_INTENSIVE_COURSES,
  ENGLISH_INTENSIVE_COURSES,
  PRETEST_QUESTIONS,
  getPreTestQuestions,
  evaluatePreTest,
  MOCK_EXAMS,
  getMockExams,
  getMockExamById,
};

export const ALL_TIPS: TipItem[] = [
  ...ENGLISH_TIPS,
  ...GERMAN_TIPS,
  ...META_TIPS,
];

export const INTENSIVE_COURSES: IntensiveCourse[] = [
  ...ENGLISH_INTENSIVE_COURSES,
  ...GERMAN_INTENSIVE_COURSES,
];

export function getCoursesByLanguage(languageId: string): IntensiveCourse[] {
  if (languageId === 'all' || languageId === 'meta') {
    return INTENSIVE_COURSES;
  }
  return INTENSIVE_COURSES.filter((c) => c.languageId === languageId);
}

export function getCourseById(courseId: string): IntensiveCourse | undefined {
  return INTENSIVE_COURSES.find((c) => c.id === courseId);
}

export interface TipFilterOptions {
  languageId?: string;
  level?: CEFRLevel | 'ALL';
  category?: Category | 'all';
  searchQuery?: string;
  bookmarkedIds?: string[];
  masteredIds?: string[];
  viewMode?: 'all' | 'saved' | 'mastered';
}

export function filterTips(options: TipFilterOptions): TipItem[] {
  const {
    languageId = 'all',
    level = 'ALL',
    category = 'all',
    searchQuery = '',
    bookmarkedIds = [],
    masteredIds = [],
    viewMode = 'all',
  } = options;

  return ALL_TIPS.filter((tip) => {
    if (languageId !== 'all') {
      if (tip.languageId !== languageId && tip.languageId !== 'meta') {
        return false;
      }
    }

    if (level !== 'ALL') {
      if (tip.level !== level && tip.level !== 'ALL') {
        return false;
      }
    }

    if (category !== 'all') {
      if (tip.category !== category) {
        return false;
      }
    }

    if (viewMode === 'saved') {
      if (!bookmarkedIds.includes(tip.id)) return false;
    } else if (viewMode === 'mastered') {
      if (!masteredIds.includes(tip.id)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = tip.title.toLowerCase().includes(q);
      const matchesSummary = tip.summary.toLowerCase().includes(q);
      const matchesGoldenRule = tip.goldenRule.toLowerCase().includes(q);
      const matchesTags = tip.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesTactics = tip.tactics.some((t) => t.toLowerCase().includes(q));

      if (!matchesTitle && !matchesSummary && !matchesGoldenRule && !matchesTags && !matchesTactics) {
        return false;
      }
    }

    return true;
  });
}

export function getRandomTip(languageId?: string): TipItem {
  const candidateTips =
    languageId && languageId !== 'all'
      ? ALL_TIPS.filter((t) => t.languageId === languageId || t.languageId === 'meta')
      : ALL_TIPS;

  const randomIndex = Math.floor(Math.random() * candidateTips.length);
  return candidateTips[randomIndex] || ALL_TIPS[0];
}

export function calculateDiagnosticLevel(answers: Record<string, CEFRLevel>): CEFRLevel {
  const levelValues: Record<CEFRLevel, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };

  const selectedLevels = Object.values(answers);
  if (selectedLevels.length === 0) return 'A1';

  const sum = selectedLevels.reduce((acc, lvl) => acc + (levelValues[lvl] || 1), 0);
  const average = Math.round(sum / selectedLevels.length);

  const levelMap: Record<number, CEFRLevel> = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'C1',
    6: 'C2',
  };

  return levelMap[Math.min(6, Math.max(1, average))] || 'B1';
}
