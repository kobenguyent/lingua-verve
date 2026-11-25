import {
  CEFRLevel,
  ListeningExamTrack,
  MockExam,
  OfficialRubricBreakdown,
  ReadingExamPart,
  SpeakingExamPart,
  WritingExamTask,
} from '../types';

/**
 * Normalizes any MockExam (legacy single-part or upgraded multi-part) into
 * unified parts arrays so UI & grading always operate seamlessly.
 */
export function getExamReadingParts(exam: MockExam): ReadingExamPart[] {
  if (exam.reading.parts && exam.reading.parts.length > 0) {
    return exam.reading.parts;
  }
  return [
    {
      id: `${exam.id}-read-p1`,
      partLabel: exam.reading.title,
      format: 'comprehension',
      instruction: 'Read the passage carefully and choose the best answer for each question.',
      passageTitle: exam.reading.passageTitle,
      passage: exam.reading.passage,
      questions: exam.reading.questions,
    },
  ];
}

export function getExamListeningTracks(exam: MockExam): ListeningExamTrack[] {
  if (exam.listening.tracks && exam.listening.tracks.length > 0) {
    return exam.listening.tracks;
  }
  return [
    {
      id: `${exam.id}-listen-t1`,
      partLabel: exam.listening.title,
      contextNote: exam.listening.contextNote,
      maxPlaysStrict: exam.listening.maxPlaysStrict,
      preReadSeconds: 15,
      audioScript: exam.listening.audioScript,
      hearingFocusTrap: exam.listening.hearingFocusTrap,
      questions: exam.listening.questions,
    },
  ];
}

export function getExamWritingTasks(exam: MockExam): WritingExamTask[] {
  if (exam.writing.tasks && exam.writing.tasks.length > 0) {
    return exam.writing.tasks;
  }
  return [
    {
      id: `${exam.id}-write-t1`,
      partLabel: exam.writing.title,
      scenario: exam.writing.scenario,
      taskRequirements: exam.writing.taskRequirements,
      minWords: exam.writing.minWords,
      maxWords: exam.writing.maxWords,
      weightPercent: 100,
      keyRubricKeywords: exam.writing.keyRubricKeywords,
      modelAnswer: exam.writing.modelAnswer,
    },
  ];
}

export function getExamSpeakingParts(exam: MockExam): SpeakingExamPart[] {
  if (exam.speaking.parts && exam.speaking.parts.length > 0) {
    return exam.speaking.parts;
  }
  return [
    {
      id: `${exam.id}-speak-p1`,
      partLabel: exam.speaking.title,
      instruction: exam.speaking.cueCardTitle,
      prepSeconds: exam.speaking.prepSeconds,
      speakSeconds: exam.speaking.speakSeconds,
      prompts: [...exam.speaking.bulletPoints, `Follow-up: ${exam.speaking.followUpQuestion}`],
      keyRubricKeywords: exam.speaking.keyRubricKeywords,
      modelResponseScript: exam.speaking.modelResponseScript,
    },
  ];
}

/**
 * Computes official Goethe/telc Prädikat or Cambridge/IELTS Band label from score & level.
 */
export function computeOfficialGradeLabel(params: {
  languageId: string;
  level: CEFRLevel;
  overallScore: number;
  allModulesPassed: boolean;
  passingScorePercent: number;
}): string {
  const { languageId, level, overallScore, allModulesPassed, passingScorePercent } = params;

  if (languageId === 'german') {
    if (!allModulesPassed || overallScore < passingScorePercent) {
      return `Goethe/telc: nicht bestanden (${overallScore}/100)`;
    }
    if (overallScore >= 90) return `Goethe/telc: sehr gut (${overallScore}/100)`;
    if (overallScore >= 80) return `Goethe/telc: gut (${overallScore}/100)`;
    if (overallScore >= 70) return `Goethe/telc: befriedigend (${overallScore}/100)`;
    return `Goethe/telc: ausreichend (${overallScore}/100)`;
  }

  // English: Cambridge Grade + IELTS Band approximation calibrated to CEFR level
  const levelBaseBand: Record<CEFRLevel, number> = {
    A1: 2.5,
    A2: 3.5,
    B1: 5.0,
    B2: 6.5,
    C1: 7.5,
    C2: 8.5,
  };
  const base = levelBaseBand[level];
  const delta = ((overallScore - 65) / 35) * 1.0;
  const rawBand = Math.max(1.0, Math.min(9.0, Math.round((base + delta) * 2) / 2));

  if (!allModulesPassed || overallScore < passingScorePercent) {
    return `Below Pass Threshold · Est. IELTS ${rawBand.toFixed(1)}`;
  }
  const cambridgeGrade =
    overallScore >= 85 ? 'Grade A (Distinction)' : overallScore >= 75 ? 'Grade B (Merit)' : 'Grade C (Pass)';
  return `Cambridge ${cambridgeGrade} · Est. IELTS ${rawBand.toFixed(1)}`;
}

/**
 * Derives a realistic 4-criterion official CEFR rubric breakdown from response text & overall score.
 */
export function computeRubricBreakdown(params: {
  text: string;
  score: number;
  minWords: number;
  expectedKeywords: string[];
}): OfficialRubricBreakdown {
  const cleaned = params.text.trim();
  if (!cleaned) {
    return {
      taskFulfillment: 0,
      coherenceCohesion: 0,
      lexicalRange: 0,
      grammaticalAccuracy: 0,
    };
  }
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = cleaned.toLowerCase();
  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 2).length;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-zäöüß]/gi, '')).filter(Boolean));
  const diversity = uniqueWords.size / Math.max(1, wordCount);
  const kwHits = params.expectedKeywords.filter((k) => lower.includes(k.toLowerCase())).length;
  const kwRatio = params.expectedKeywords.length > 0 ? kwHits / Math.min(5, params.expectedKeywords.length) : 0.6;
  const lengthRatio = Math.min(1, wordCount / Math.max(15, params.minWords));

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const taskFulfillment = clamp(params.score * 0.65 + lengthRatio * 22 + Math.min(1, kwRatio) * 13);
  const coherenceCohesion = clamp(
    params.score * 0.72 + Math.min(1, sentences / 4) * 18 + (cleaned.includes('\n') ? 10 : 5)
  );
  const lexicalRange = clamp(params.score * 0.68 + Math.min(1, diversity / 0.65) * 20 + Math.min(1, kwRatio) * 12);
  const grammaticalAccuracy = clamp(params.score * 0.8 + (sentences >= 3 ? 16 : 8));

  return {
    taskFulfillment,
    coherenceCohesion,
    lexicalRange,
    grammaticalAccuracy,
  };
}
