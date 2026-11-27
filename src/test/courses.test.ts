import { describe, it, expect } from 'vitest';
import {
  ENGLISH_INTENSIVE_COURSES,
  GERMAN_INTENSIVE_COURSES,
  FRENCH_INTENSIVE_COURSES,
  JAPANESE_INTENSIVE_COURSES,
  INTENSIVE_COURSES,
  OFFICIAL_EXAM_REFERENCES,
  getPreTestQuestions,
  evaluatePreTest,
  MOCK_EXAMS,
  getMockExams,
  countLanguageUnits,
} from '../data';
import { CEFRLevel, SkillType } from '../types';
import {
  computeOfficialGradeLabel,
  computeRubricBreakdown,
  getExamListeningTracks,
  getExamReadingParts,
  getExamSpeakingParts,
  getExamWritingTasks,
} from '../utils/examScoring';
import { parseDialogueTurns } from '../utils/audio';

const ALL_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FOUR_SKILLS: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];

describe('Zero-to-Hero Intensive Courses (A1 to C2)', () => {
  it('provides full A1 through C2 intensive courses for English, German, French, and Japanese', () => {
    const enLevels = ENGLISH_INTENSIVE_COURSES.map((c) => c.level);
    const deLevels = GERMAN_INTENSIVE_COURSES.map((c) => c.level);
    const frLevels = FRENCH_INTENSIVE_COURSES.map((c) => c.level);
    const jaLevels = JAPANESE_INTENSIVE_COURSES.map((c) => c.level);

    expect(enLevels).toEqual(ALL_CEFR);
    expect(deLevels).toEqual(ALL_CEFR);
    expect(frLevels).toEqual(ALL_CEFR);
    expect(jaLevels).toEqual(ALL_CEFR);
    expect(INTENSIVE_COURSES.length).toBe(24);
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

  it('provides complete 5-step guided lesson content for all 144 units (6 per level) across EN, DE, FR, and JA', () => {
    let totalModules = 0;
    INTENSIVE_COURSES.forEach((course) => {
      expect(course.modules.length, `Expected 6 units in ${course.id}`).toBe(6);
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
        expect(lesson.checkpointModelAnswer.length).toBeGreaterThan(35);
      });
    });
    expect(totalModules).toBe(144);
  });
});

describe('Scored 4-Skill Placement Pre-Test & Collective Course Recommender', () => {
  it('has 12 progressive A1–C2 questions covering all 4 skills for English, German, French, and Japanese', () => {
    ['english', 'german', 'french', 'japanese'].forEach((lang) => {
      const qs = getPreTestQuestions(lang);
      expect(qs.length).toBe(12);

      const levels = new Set(qs.map((q) => q.level));
      const skills = new Set(qs.map((q) => q.skill));
      ALL_CEFR.forEach((lvl) => expect(levels.has(lvl)).toBe(true));
      FOUR_SKILLS.forEach((sk) => expect(skills.has(sk)).toBe(true));

      const listeningQs = qs.filter((q) => q.skill === 'listening');
      listeningQs.forEach((lq) => expect(lq.audioScript && lq.audioScript.length > 20).toBe(true));
    });

    // Verify French & Japanese placement evaluation routes to DELF/DALF & JLPT bundles
    const frQs = getPreTestQuestions('french');
    const frRes = evaluatePreTest('french', Object.fromEntries(frQs.map((q) => [q.id, q.correctIndex])));
    expect(frRes.verifiedLevel).toBe('C2');
    expect(frRes.suggestedCertificate).toContain('DALF');

    const jaQs = getPreTestQuestions('japanese');
    const jaRes = evaluatePreTest('japanese', Object.fromEntries(jaQs.map((q) => [q.id, q.level === 'A1' ? q.correctIndex : (q.correctIndex + 1) % q.options.length])));
    expect(jaRes.verifiedLevel).toBe('A1');
    expect(jaRes.suggestedCertificate).toContain('JLPT N5');
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

describe('24 Full 4-Skill Simulated Certification Exams (EN, DE, FR, JA)', () => {
  it('provides complete A1–C2 simulated exams for English, German, French, and Japanese', () => {
    const enExams = getMockExams('english');
    const deExams = getMockExams('german');
    const frExams = getMockExams('french');
    const jaExams = getMockExams('japanese');

    expect(enExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(deExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(frExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(jaExams.map((e) => e.level)).toEqual(ALL_CEFR);
    expect(MOCK_EXAMS.length).toBe(24);
  });

  it('ensures every mock exam has realistic multi-part Reading (3 parts/9 Qs), Multi-Accent Listening (3 tracks/9 Qs), 2 Writing Tasks, and 3 Speaking Parts', () => {
    MOCK_EXAMS.forEach((exam) => {
      const minTextLen = exam.languageId === 'japanese' ? 30 : 60;
      const minModelLen = exam.languageId === 'japanese' ? 40 : 80;
      // Legacy top-level fields remain intact for backward compatibility
      expect(exam.reading.passage.length).toBeGreaterThan(minTextLen);
      expect(exam.reading.questions.length).toBeGreaterThanOrEqual(3);
      expect(exam.listening.audioScript.length).toBeGreaterThan(minTextLen);
      expect(exam.listening.questions.length).toBeGreaterThanOrEqual(3);
      expect(exam.listening.maxPlaysStrict).toBeGreaterThanOrEqual(1);
      expect(exam.writing.taskRequirements.length).toBeGreaterThanOrEqual(3);
      expect(exam.writing.modelAnswer.length).toBeGreaterThan(minModelLen);
      expect(exam.speaking.bulletPoints.length).toBeGreaterThanOrEqual(3);
      expect(exam.speaking.modelResponseScript.length).toBeGreaterThan(minModelLen);

      // Multi-part real-world expansion checks
      expect(exam.requireAllSkillsPass).toBe(true);
      const readingParts = getExamReadingParts(exam);
      expect(readingParts.length, `Expected 3 reading parts in ${exam.id}`).toBe(3);
      const totalReadQs = readingParts.reduce((s, p) => s + p.questions.length, 0);
      expect(totalReadQs).toBe(9);
      readingParts.forEach((part) => {
        expect(part.passage.length).toBeGreaterThan(exam.languageId === 'japanese' ? 25 : 40);
        if (part.format === 'cloze') {
          expect(part.passage).toContain('[1]');
          expect(part.passage).toContain('[2]');
          expect(part.passage).toContain('[3]');
        }
        part.questions.forEach((q) => {
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(q.options.length);
        });
      });

      const listeningTracks = getExamListeningTracks(exam);
      expect(listeningTracks.length, `Expected 3 listening tracks in ${exam.id}`).toBe(3);
      const totalListenQs = listeningTracks.reduce((s, t) => s + t.questions.length, 0);
      expect(totalListenQs).toBe(9);
      const accents = new Set(listeningTracks.map((t) => t.accentCode).filter(Boolean));
      const minAccents = exam.languageId === 'japanese' ? 1 : 2;
      expect(accents.size, `Expected regional accent(s) in ${exam.id}`).toBeGreaterThanOrEqual(minAccents);
      listeningTracks.forEach((track) => {
        const turns = parseDialogueTurns(track.audioScript);
        expect(turns.length, `Expected multi-turn human conversation in ${track.id}`).toBeGreaterThanOrEqual(4);
        const speakers = new Set(turns.map((t) => t.speakerIndex));
        expect(speakers.size, `Expected >=2 distinct speakers in ${track.id}`).toBeGreaterThanOrEqual(2);
      });

      const writingTasks = getExamWritingTasks(exam);
      expect(writingTasks.length, `Expected 2 writing tasks in ${exam.id}`).toBe(2);
      const weightSum = writingTasks.reduce((s, t) => s + t.weightPercent, 0);
      expect(weightSum).toBe(100);

      const speakingParts = getExamSpeakingParts(exam);
      expect(speakingParts.length, `Expected 3 speaking parts in ${exam.id}`).toBe(3);
      speakingParts.forEach((part) => {
        expect(part.examinerPromptAudio && part.examinerPromptAudio.length > 10).toBe(true);
        expect(part.modelResponseScript.length).toBeGreaterThan(exam.languageId === 'japanese' ? 25 : 40);
      });
    });

    // Official grade labels across all 4 languages + Japanese character unit counting
    expect(
      computeOfficialGradeLabel({
        languageId: 'french',
        level: 'B2',
        overallScore: 86,
        allModulesPassed: true,
        passingScorePercent: 60,
      })
    ).toContain('DELF B2: Mention Très Bien');

    expect(
      computeOfficialGradeLabel({
        languageId: 'japanese',
        level: 'B2',
        overallScore: 80,
        allModulesPassed: true,
        passingScorePercent: 60,
      })
    ).toContain('JLPT N2: 合格');

    expect(countLanguageUnits('私は毎日日本語を勉強しています。しかし、漢字はとても難しいです。', 'japanese')).toBeGreaterThanOrEqual(12);

    // Official grade label & 4-criterion rubric checks
    expect(
      computeOfficialGradeLabel({
        languageId: 'german',
        level: 'B2',
        overallScore: 84,
        allModulesPassed: true,
        passingScorePercent: 60,
      })
    ).toContain('Goethe/telc: gut');

    expect(
      computeOfficialGradeLabel({
        languageId: 'german',
        level: 'B2',
        overallScore: 78,
        allModulesPassed: false,
        passingScorePercent: 60,
      })
    ).toContain('nicht bestanden');

    expect(
      computeOfficialGradeLabel({
        languageId: 'english',
        level: 'C1',
        overallScore: 88,
        allModulesPassed: true,
        passingScorePercent: 65,
      })
    ).toMatch(/Cambridge Grade A.*Est\. IELTS/);

    const rubric = computeRubricBreakdown({
      text: 'Meiner Meinung nach ist lebenslanges Lernen unverzichtbar, weil sich die Arbeitswelt rasch verändert. Deshalb sollten Unternehmen Weiterbildung gezielt fördern.',
      score: 82,
      minWords: 20,
      expectedKeywords: ['Meinung', 'weil', 'Deshalb'],
    });
    expect(rubric.taskFulfillment).toBeGreaterThanOrEqual(60);
    expect(rubric.coherenceCohesion).toBeGreaterThanOrEqual(60);
    expect(rubric.lexicalRange).toBeGreaterThanOrEqual(60);
    expect(rubric.grammaticalAccuracy).toBeGreaterThanOrEqual(60);
  });
});
