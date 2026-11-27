import {
  AISessionRecord,
  CEFRLevel,
  ExamAttemptRecord,
  ExamHistoryReadinessReport,
  LearnerProgressState,
  PreTestResult,
  SkillType,
  StudyActivityEntry,
  UnitStudyProgress,
} from '../types';

export const PROGRESS_STORAGE_KEY = 'linguaverve_learner_state_v1';

export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyLearnerState(): LearnerProgressState {
  return {
    version: 1,
    completedModuleIds: [],
    enrolledCourseIds: [],
    preTestHistory: [],
    examHistory: [],
    aiSessionHistory: [],
    activityLog: [],
    studyDays: [],
    unitProgress: {},
  };
}

export function loadLearnerState(): LearnerProgressState {
  if (typeof window === 'undefined') return createEmptyLearnerState();
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createEmptyLearnerState();
    const parsed = JSON.parse(raw) as Partial<LearnerProgressState>;
    return {
      version: 1,
      learnerName:
        typeof parsed.learnerName === 'string' && parsed.learnerName.trim().length > 0
          ? parsed.learnerName.trim()
          : undefined,
      completedModuleIds: Array.isArray(parsed.completedModuleIds) ? parsed.completedModuleIds : [],
      enrolledCourseIds: Array.isArray(parsed.enrolledCourseIds) ? parsed.enrolledCourseIds : [],
      preTestHistory: Array.isArray(parsed.preTestHistory) ? parsed.preTestHistory : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      aiSessionHistory: Array.isArray(parsed.aiSessionHistory) ? parsed.aiSessionHistory : [],
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
      unitProgress:
        parsed.unitProgress && typeof parsed.unitProgress === 'object' && !Array.isArray(parsed.unitProgress)
          ? parsed.unitProgress
          : {},
      latestReadinessReport:
        parsed.latestReadinessReport && typeof parsed.latestReadinessReport === 'object'
          ? parsed.latestReadinessReport
          : undefined,
    };
  } catch {
    return createEmptyLearnerState();
  }
}

export function saveLearnerState(state: LearnerProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function addStudyDay(days: string[], today: string = getTodayDateKey()): string[] {
  return days.includes(today) ? days : [...days, today].sort();
}

function prependActivity(log: StudyActivityEntry[], entry: StudyActivityEntry): StudyActivityEntry[] {
  return [entry, ...log].slice(0, 100);
}

export function toggleModuleCompletionInState(
  state: LearnerProgressState,
  moduleId: string,
  meta: { languageId: string; level: CEFRLevel; title: string }
): LearnerProgressState {
  const exists = state.completedModuleIds.includes(moduleId);
  const completedModuleIds = exists
    ? state.completedModuleIds.filter((id) => id !== moduleId)
    : [...state.completedModuleIds, moduleId];

  const activityLog = exists
    ? state.activityLog
    : prependActivity(state.activityLog, {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'module-complete',
        languageId: meta.languageId,
        level: meta.level,
        title: `Completed Module: ${meta.title}`,
        detail: `${meta.languageId.toUpperCase()} ${meta.level} intensive module mastered`,
      });

  return {
    ...state,
    completedModuleIds,
    activityLog,
    studyDays: exists ? state.studyDays : addStudyDay(state.studyDays),
  };
}

export function saveUnitProgressInState(
  state: LearnerProgressState,
  progress: UnitStudyProgress
): LearnerProgressState {
  return {
    ...state,
    unitProgress: {
      ...(state.unitProgress ?? {}),
      [progress.moduleId]: progress,
    },
    studyDays: addStudyDay(state.studyDays),
  };
}

export function completeModuleInState(
  state: LearnerProgressState,
  moduleId: string,
  meta: { languageId: string; level: CEFRLevel; title: string; score?: number }
): LearnerProgressState {
  const alreadyCompleted = state.completedModuleIds.includes(moduleId);
  const completedModuleIds = alreadyCompleted
    ? state.completedModuleIds
    : [...state.completedModuleIds, moduleId];

  const activityLog = prependActivity(state.activityLog, {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'module-complete',
    languageId: meta.languageId,
    level: meta.level,
    title: `Completed Unit: ${meta.title}`,
    detail:
      typeof meta.score === 'number'
        ? `${meta.languageId.toUpperCase()} ${meta.level} guided unit completed · Checkpoint ${meta.score}%`
        : `${meta.languageId.toUpperCase()} ${meta.level} guided unit mastered`,
    score: meta.score,
  });

  return {
    ...state,
    completedModuleIds,
    activityLog,
    studyDays: addStudyDay(state.studyDays),
  };
}

export function enrollCoursesInState(
  state: LearnerProgressState,
  courseIds: string[]
): LearnerProgressState {
  const merged = Array.from(new Set([...state.enrolledCourseIds, ...courseIds]));
  return {
    ...state,
    enrolledCourseIds: merged,
    studyDays: addStudyDay(state.studyDays),
  };
}

export function recordPreTestResult(
  state: LearnerProgressState,
  result: PreTestResult
): LearnerProgressState {
  return {
    ...state,
    preTestHistory: [result, ...state.preTestHistory].slice(0, 50),
    enrolledCourseIds: Array.from(
      new Set([...state.enrolledCourseIds, ...result.recommendedCourses.map((c) => c.courseId)])
    ),
    activityLog: prependActivity(state.activityLog, {
      id: `act-pre-${result.id}`,
      timestamp: result.timestamp,
      type: 'pretest',
      languageId: result.languageId,
      level: result.verifiedLevel,
      title: `Placement Pre-Test Verified: ${result.verifiedLevel}`,
      detail: `${result.correctCount}/${result.totalCount} (${result.overallScore}%) · Suggested ${result.recommendedCourses.length} courses`,
      score: result.overallScore,
    }),
    studyDays: addStudyDay(state.studyDays),
  };
}

export function recordExamAttempt(
  state: LearnerProgressState,
  attempt: ExamAttemptRecord
): LearnerProgressState {
  return {
    ...state,
    examHistory: [attempt, ...state.examHistory].slice(0, 50),
    activityLog: prependActivity(state.activityLog, {
      id: `act-exam-${attempt.id}`,
      timestamp: attempt.timestamp,
      type: 'mock-exam',
      languageId: attempt.languageId,
      level: attempt.level,
      title: `${attempt.examTitle} (${attempt.passed ? 'PASSED' : 'NEEDS WORK'})`,
      detail: `${attempt.mode === 'strict' ? 'Strict Pressure' : 'Practice'} · Overall ${attempt.overallScore}%`,
      score: attempt.overallScore,
    }),
    studyDays: addStudyDay(state.studyDays),
  };
}

export function deleteExamAttempt(
  state: LearnerProgressState,
  attemptId: string
): LearnerProgressState {
  return {
    ...state,
    examHistory: state.examHistory.filter((item) => item.id !== attemptId),
  };
}

export function updateExamAttemptAssessment(
  state: LearnerProgressState,
  attemptId: string,
  assessment: NonNullable<ExamAttemptRecord['aiAssessment']>
): LearnerProgressState {
  return {
    ...state,
    examHistory: state.examHistory.map((item) => {
      if (item.id !== attemptId) return item;
      const updatedSkills = { ...item.skills };
      (['reading', 'listening', 'writing', 'speaking'] as SkillType[]).forEach((sk) => {
        if (updatedSkills[sk] && assessment.skillInsights[sk]?.aiAnalyzed) {
          updatedSkills[sk] = {
            ...updatedSkills[sk],
            aiGraded: true,
          };
        }
      });
      return {
        ...item,
        skills: updatedSkills,
        aiAssessment: assessment,
      };
    }),
  };
}

export function saveReadinessReport(
  state: LearnerProgressState,
  report: ExamHistoryReadinessReport
): LearnerProgressState {
  return {
    ...state,
    latestReadinessReport: report,
  };
}

export function setLearnerNameInState(
  state: LearnerProgressState,
  learnerName: string
): LearnerProgressState {
  const cleaned = learnerName.trim();
  return {
    ...state,
    learnerName: cleaned.length > 0 ? cleaned : undefined,
  };
}

export function recordAISession(
  state: LearnerProgressState,
  session: AISessionRecord
): LearnerProgressState {
  return {
    ...state,
    aiSessionHistory: [session, ...state.aiSessionHistory].slice(0, 60),
    activityLog: prependActivity(state.activityLog, {
      id: `act-ai-${session.id}`,
      timestamp: session.timestamp,
      type: 'ai-session',
      languageId: session.languageId,
      level: session.level,
      title: `AI ${session.skill.toUpperCase()} Studio (${session.level})`,
      detail: `${session.provider} · ${session.summary}`,
      score: session.score,
    }),
    studyDays: addStudyDay(state.studyDays),
  };
}

export function computeStudyStreak(studyDays: string[], referenceDate: Date = new Date()): number {
  if (studyDays.length === 0) return 0;
  const set = new Set(studyDays);
  let streak = 0;
  const cursor = new Date(referenceDate);

  // If user hasn't studied today yet, check if yesterday keeps streak alive
  if (!set.has(getTodayDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(getTodayDateKey(cursor))) {
      return 0;
    }
  }

  while (set.has(getTodayDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeSkillAverages(
  state: LearnerProgressState,
  languageId?: string
): Record<SkillType, { average: number; samples: number }> {
  const totals: Record<SkillType, { sum: number; count: number }> = {
    reading: { sum: 0, count: 0 },
    listening: { sum: 0, count: 0 },
    writing: { sum: 0, count: 0 },
    speaking: { sum: 0, count: 0 },
  };

  const skills: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];

  state.examHistory.forEach((attempt) => {
    if (languageId && languageId !== 'all' && attempt.languageId !== languageId) return;
    skills.forEach((skill) => {
      totals[skill].sum += attempt.skills[skill].score;
      totals[skill].count += 1;
    });
  });

  state.preTestHistory.forEach((pre) => {
    if (languageId && languageId !== 'all' && pre.languageId !== languageId) return;
    skills.forEach((skill) => {
      if (pre.skillScores[skill] >= 0) {
        totals[skill].sum += pre.skillScores[skill];
        totals[skill].count += 1;
      }
    });
  });

  return {
    reading: {
      average: totals.reading.count ? Math.round(totals.reading.sum / totals.reading.count) : 0,
      samples: totals.reading.count,
    },
    listening: {
      average: totals.listening.count ? Math.round(totals.listening.sum / totals.listening.count) : 0,
      samples: totals.listening.count,
    },
    writing: {
      average: totals.writing.count ? Math.round(totals.writing.sum / totals.writing.count) : 0,
      samples: totals.writing.count,
    },
    speaking: {
      average: totals.speaking.count ? Math.round(totals.speaking.sum / totals.speaking.count) : 0,
      samples: totals.speaking.count,
    },
  };
}

export function exportLearnerProgressJSON(state: LearnerProgressState): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'LinguaVerve',
      state,
    },
    null,
    2
  );
}

export function parseImportedLearnerProgressJSON(raw: string): LearnerProgressState {
  const parsed = JSON.parse(raw) as { state?: Partial<LearnerProgressState> } & Partial<LearnerProgressState>;
  const candidate = parsed.state ?? parsed;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Invalid LinguaVerve progress backup file.');
  }
  return {
    version: 1,
    learnerName:
      typeof candidate.learnerName === 'string' && candidate.learnerName.trim().length > 0
        ? candidate.learnerName.trim()
        : undefined,
    completedModuleIds: Array.isArray(candidate.completedModuleIds) ? candidate.completedModuleIds : [],
    enrolledCourseIds: Array.isArray(candidate.enrolledCourseIds) ? candidate.enrolledCourseIds : [],
    preTestHistory: Array.isArray(candidate.preTestHistory) ? candidate.preTestHistory : [],
    examHistory: Array.isArray(candidate.examHistory) ? candidate.examHistory : [],
    aiSessionHistory: Array.isArray(candidate.aiSessionHistory) ? candidate.aiSessionHistory : [],
    activityLog: Array.isArray(candidate.activityLog) ? candidate.activityLog : [],
    studyDays: Array.isArray(candidate.studyDays) ? candidate.studyDays : [],
    unitProgress:
      candidate.unitProgress && typeof candidate.unitProgress === 'object' && !Array.isArray(candidate.unitProgress)
        ? candidate.unitProgress
        : {},
    latestReadinessReport:
      candidate.latestReadinessReport && typeof candidate.latestReadinessReport === 'object'
        ? candidate.latestReadinessReport
        : undefined,
  };
}
