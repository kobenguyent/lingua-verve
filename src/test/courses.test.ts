import { describe, it, expect } from 'vitest';
import {
  ENGLISH_INTENSIVE_COURSES,
  GERMAN_INTENSIVE_COURSES,
  INTENSIVE_COURSES,
  OFFICIAL_EXAM_REFERENCES,
  getPreTestQuestions,
  evaluatePreTest,
  MOCK_EXAMS,
  getMockExams,
} from '../data';
import { CEFRLevel, SkillType } from '../types';

const ALL_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FOUR_SKILLS: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];

describe('Zero-to-Hero Intensive Courses (A1 to C2)', () => {
  it('provides full A1 through C2 intensive courses for both English and German', () => {
    const enLevels = ENGLISH_INTENSIVE_COURSES.map((c) => c.level);
    const deLevels = GERMAN_INTENSIVE_COURSES.map((c) => c.level);

    expect(enLevels).toEqual(ALL_CEFR);
    expect(deLevels).toEqual(ALL_CEFR);
    expect(INTENSIVE_COURSES.length).toBe(12);
  });

  it('covers all 4 certification skills across every intensive course', () => {
    INTENSIVE_COURSES.forEach((course) => {
      expect(course.modules.length).toBeGreaterThanOrEqual(3);
      expect(course.targetCertificates.length).toBeGreaterThanOrEqual(1);
      expect(course.referenceIds.length).toBeGreaterThanOrEqual(3);

      const courseSkills = new Set<SkillType>();
      course.modules.forEach((mod) => {
        mod.focusSkills.forEach((s) => courseSkills.add(s));
        expect(mod.drills.length).toBeGreaterThanOrEqual(1);
      });

      FOUR_SKILLS.forEach((skill) => {
        expect(courseSkills.has(skill)).toBe(true);
        expect(course.examBlueprint[skill].length).toBeGreaterThan(15);
      });
    });
  });

  it('links every course referenceId to a verified HTTPS official exam portal or mock test', () => {
    const refMap = new Map(OFFICIAL_EXAM_REFERENCES.map((r) => [r.id, r]));

    INTENSIVE_COURSES.forEach((course) => {
      course.referenceIds.forEach((refId) => {
        const ref = refMap.get(refId);
        expect(ref).toBeDefined();
        expect(ref?.url.startsWith('https://')).toBe(true);
        expect(ref?.languageId).toBe(course.languageId);
      });
    });
  });

  it('provides complete 5-step guided lesson content for all 36 units across A1–C2 English and German', () => {
    let totalModules = 0;
    INTENSIVE_COURSES.forEach((course) => {
      course.modules.forEach((mod) => {
        totalModules += 1;
        expect(mod.lesson, `Missing guided lesson for ${mod.id}`).toBeDefined();
        const lesson = mod.lesson!;
        expect(lesson.estimatedMins).toBeGreaterThanOrEqual(20);
        expect(lesson.overview.length).toBeGreaterThan(20);
        expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
        lesson.sections.forEach((sec) => {
          expect(sec.examples.length).toBeGreaterThanOrEqual(2);
        });
        expect(lesson.vocabCards.length).toBe(mod.keyVocabulary.length);
        expect(lesson.practiceQuestions.length).toBeGreaterThanOrEqual(3);
        lesson.practiceQuestions.forEach((q) => {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(q.options.length);
          expect(q.explanation.length).toBeGreaterThan(15);
        });
        expect(lesson.checkpointMinWords).toBeGreaterThanOrEqual(25);
        expect(lesson.checkpointModelAnswer.length).toBeGreaterThan(50);
      });
    });
    expect(totalModules).toBe(36);
  });
});

describe('Scored 4-Skill Placement Pre-Test & Collective Course Recommender', () => {
  it('has 12 progressive A1–C2 questions covering all 4 skills for both English and German', () => {
    ['english', 'german'].forEach((lang) => {
      const qs = getPreTestQuestions(lang);
      expect(qs.length).toBe(12);

      const levels = new Set(qs.map((q) => q.level));
      const skills = new Set(qs.map((q) => q.skill));
      ALL_CEFR.forEach((lvl) => expect(levels.has(lvl)).toBe(true));
      FOUR_SKILLS.forEach((sk) => expect(skills.has(sk)).toBe(true));

      const listeningQs = qs.filter((q) => q.skill === 'listening');
      listeningQs.forEach((lq) => expect(lq.audioScript && lq.audioScript.length > 20).toBe(true));
    });
  });

  it('verifies A1 level and suggests A1 core + A2 bridge collective courses when beginner answers', () => {
    const qs = getPreTestQuestions('german');
    const answers: Record<string, number> = {};
    qs.forEach((q) => {
      answers[q.id] = q.level === 'A1' ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
    });

    const result = evaluatePreTest('german', answers);
    expect(result.verifiedLevel).toBe('A1');
    expect(result.recommendedCourses.map((c) => c.level)).toEqual(['A1', 'A2']);
    expect(result.suggestedCertificate).toContain('Goethe-Zertifikat A1');
  });

  it('verifies C2 mastery when all 12 items are answered accurately', () => {
    const qs = getPreTestQuestions('english');
    const answers: Record<string, number> = {};
    qs.forEach((q) => {
      answers[q.id] = q.correctIndex;
    });

    const result = evaluatePreTest('english', answers);
    expect(result.verifiedLevel).toBe('C2');
    expect(result.overallScore).toBe(100);
    expect(result.recommendedCourses.some((c) => c.level === 'C2')).toBe(true);
  });

  it('adds a foundation reinforcement course when an intermediate learner has a weak skill', () => {
    const qs = getPreTestQuestions('german');
    const answers: Record<string, number> = {};
    qs.forEach((q) => {
      // Answer A1, A2, B1 correctly EXCEPT all listening questions wrong
      if (q.skill === 'listening') {
        answers[q.id] = (q.correctIndex + 1) % q.options.length;
      } else if (['A1', 'A2', 'B1'].includes(q.level)) {
        answers[q.id] = q.correctIndex;
      } else {
        answers[q.id] = (q.correctIndex + 1) % q.options.length;
      }
    });

    const result = evaluatePreTest('german', answers);
    expect(result.skillScores.listening).toBe(0);
    expect(result.recommendedCourses.some((c) => c.role === 'foundation')).toBe(true);
    expect(result.recommendedCourses.some((c) => c.role === 'core')).toBe(true);
    expect(result.recommendedCourses.some((c) => c.role === 'bridge')).toBe(true);
  });
});

describe('12 Full 4-Skill Simulated Certification Exams', () => {
  it('provides complete A1–C2 simulated exams for English and German', () => {
    const enExams = getMockExams('english');
    const deExams = getMockExams('german');

    expect(enExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(deExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(MOCK_EXAMS.length).toBe(12);
  });

  it('ensures every mock exam has Reading, Listening/Hearing, Writing, and Speaking sections', () => {
    MOCK_EXAMS.forEach((exam) => {
      expect(exam.reading.passage.length).toBeGreaterThan(60);
      expect(exam.reading.questions.length).toBeGreaterThanOrEqual(3);
      expect(exam.listening.audioScript.length).toBeGreaterThan(60);
      expect(exam.listening.questions.length).toBeGreaterThanOrEqual(3);
      expect(exam.listening.maxPlaysStrict).toBeGreaterThanOrEqual(1);
      expect(exam.writing.taskRequirements.length).toBeGreaterThanOrEqual(3);
      expect(exam.writing.modelAnswer.length).toBeGreaterThan(80);
      expect(exam.speaking.bulletPoints.length).toBeGreaterThanOrEqual(3);
      expect(exam.speaking.modelResponseScript.length).toBeGreaterThan(80);
    });
  });
});
