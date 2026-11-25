import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Gauge,
  GraduationCap,
  Headphones,
  Lightbulb,
  Mic,
  MicOff,
  PenTool,
  RotateCcw,
  Sparkles,
  Timer,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  AIEvaluationResult,
  AIProviderConfig,
  CEFRLevel,
  CourseModule,
  IntensiveCourse,
  SkillType,
  UnitGuidedLesson,
  UnitStudyProgress,
} from '../types';
import { getAccentsForLanguage, soundEngine } from '../utils/audio';
import { evaluateWithAIOrFallback, getDefaultAIConfig } from '../utils/aiClient';
import {
  isSpeechRecognitionSupported,
  SpeechRecorderHandle,
  startSpeechRecognition,
} from '../utils/speechRecognition';

interface UnitLessonPlayerProps {
  course: IntensiveCourse;
  module: CourseModule;
  unitIndex: number; // 1-based
  totalUnits: number;
  nextModule?: CourseModule;
  nextLevelCourse?: IntensiveCourse;
  isCompleted: boolean;
  initialProgress?: UnitStudyProgress;
  slowAudio: boolean;
  onToggleSlowAudio: () => void;
  aiConfig?: AIProviderConfig;
  onOpenVoiceSettings?: () => void;
  onSaveProgress: (progress: UnitStudyProgress) => void;
  onCompleteUnit: (score?: number) => void;
  onExit: () => void;
  onStartModule: (moduleId: string) => void;
  onAdvanceLevel?: (level: CEFRLevel) => void;
  onLaunchExam: (languageId: string, level: CEFRLevel) => void;
  onLaunchAICoach: (
    languageId: string,
    level: CEFRLevel,
    skill: SkillType,
    seedPrompt?: string
  ) => void;
}

const STEP_LABELS = [
  { id: 0, short: 'Learn', title: '1. Concept & Grammar', icon: BookOpen },
  { id: 1, short: 'Vocabulary', title: '2. Audio Flashcards', icon: Volume2 },
  { id: 2, short: 'Quiz', title: '3. Knowledge Check', icon: Sparkles },
  { id: 3, short: 'Drills', title: '4. 4-Skill Drills', icon: Headphones },
  { id: 4, short: 'Checkpoint', title: '5. Milestone Checkpoint', icon: Award },
] as const;

const SKILL_BADGE: Record<SkillType, { label: string; cls: string }> = {
  reading: {
    label: 'Reading',
    cls: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
  },
  listening: {
    label: 'Listening',
    cls: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
  },
  writing: {
    label: 'Writing',
    cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
  },
  speaking: {
    label: 'Speaking',
    cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  },
};

function buildFallbackLesson(mod: CourseModule): UnitGuidedLesson {
  return {
    estimatedMins: 25,
    overview: mod.summary,
    sections: mod.grammarCheckpoints.map((g, idx) => ({
      id: `${mod.id}-fallback-s${idx + 1}`,
      heading: g,
      explanation: mod.objectives[idx] || mod.summary,
      examples: [
        {
          target: mod.keyVocabulary.slice(idx * 2, idx * 2 + 2).join(' · ') || mod.title,
          translation: 'Practice pronouncing and using these target unit structures in context.',
        },
      ],
    })),
    vocabCards: mod.keyVocabulary.map((term) => ({
      term,
      meaning: `High-yield exam term for ${mod.title}`,
      example: term,
    })),
    practiceQuestions: [
      {
        id: `${mod.id}-fallback-q1`,
        skill: mod.focusSkills[0] || 'reading',
        prompt: `Which learning outcome is the primary goal of "${mod.title}"?`,
        options: [
          mod.objectives[0] || mod.summary,
          'Skip directly to unguided translation without checking grammar.',
          'Memorize isolated letters without speaking or listening practice.',
        ],
        correctIndex: 0,
        explanation: mod.objectives[0] || mod.summary,
      },
    ],
    checkpointSkill: mod.focusSkills.includes('speaking') ? 'speaking' : 'writing',
    checkpointMinWords: 40,
    checkpointModelAnswer: mod.checkpointPrompt,
  };
}

export const UnitLessonPlayer: React.FC<UnitLessonPlayerProps> = ({
  course,
  module,
  unitIndex,
  totalUnits,
  nextModule,
  nextLevelCourse,
  isCompleted,
  initialProgress,
  slowAudio,
  onToggleSlowAudio,
  aiConfig,
  onOpenVoiceSettings,
  onSaveProgress,
  onCompleteUnit,
  onExit,
  onStartModule,
  onAdvanceLevel,
  onLaunchExam,
  onLaunchAICoach,
}) => {
  const lesson = useMemo(() => module.lesson ?? buildFallbackLesson(module), [module]);
  const effectiveAIConfig = aiConfig ?? getDefaultAIConfig('ollama');
  const availableAccents = useMemo(
    () => getAccentsForLanguage(course.languageId),
    [course.languageId]
  );
  const [activeAccent, setActiveAccent] = useState<string>(() =>
    soundEngine.getActiveAccentCode(course.languageId)
  );

  useEffect(() => {
    setActiveAccent(soundEngine.getActiveAccentCode(course.languageId));
    return soundEngine.subscribe(() => {
      setActiveAccent(soundEngine.getActiveAccentCode(course.languageId));
    });
  }, [course.languageId]);

  const [step, setStep] = useState<number>(() => {
    const saved = initialProgress?.currentStep ?? 0;
    return saved >= 0 && saved < STEP_LABELS.length ? saved : 0;
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    () => initialProgress?.completedSteps ?? []
  );

  // Step 2: Vocabulary Flashcards state
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredVocab, setMasteredVocab] = useState<string[]>(
    () => initialProgress?.masteredVocab ?? []
  );

  // Step 3: Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(
    () => initialProgress?.quizAnswers ?? {}
  );

  // Step 4: Drills workbench state
  const [completedDrills, setCompletedDrills] = useState<number[]>(
    () => initialProgress?.completedDrillIndices ?? []
  );
  const [drillNotes, setDrillNotes] = useState<Record<number, string>>({});
  const [drillAudioPlays, setDrillAudioPlays] = useState<Record<number, number>>({});
  const [drillEvaluations, setDrillEvaluations] = useState<Record<number, AIEvaluationResult>>({});
  const [evaluatingDrillIdx, setEvaluatingDrillIdx] = useState<number | null>(null);
  const [recordingDrillIdx, setRecordingDrillIdx] = useState<number | null>(null);

  // Step 5: Milestone Checkpoint state
  const [checkpointText, setCheckpointText] = useState<string>(
    () => initialProgress?.checkpointResponse ?? ''
  );
  const [checkpointEval, setCheckpointEval] = useState<AIEvaluationResult | null>(null);
  const [checkpointScore, setCheckpointScore] = useState<number | undefined>(
    () => initialProgress?.checkpointScore
  );
  const [isEvaluatingCheckpoint, setIsEvaluatingCheckpoint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isRecordingCheckpoint, setIsRecordingCheckpoint] = useState(false);
  const [micStatus, setMicStatus] = useState<string | null>(null);
  const [justCompletedUnit, setJustCompletedUnit] = useState(false);

  const recorderRef = useRef<SpeechRecorderHandle | null>(null);
  const micSupported = useMemo(() => isSpeechRecognitionSupported(), []);

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setRecordingDrillIdx(null);
    setIsRecordingCheckpoint(false);
  };

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
    };
  }, []);

  const persistProgress = (overrides?: Partial<UnitStudyProgress>) => {
    const next: UnitStudyProgress = {
      moduleId: module.id,
      currentStep: overrides?.currentStep ?? step,
      completedSteps: overrides?.completedSteps ?? completedSteps,
      masteredVocab: overrides?.masteredVocab ?? masteredVocab,
      quizAnswers: overrides?.quizAnswers ?? quizAnswers,
      completedDrillIndices: overrides?.completedDrillIndices ?? completedDrills,
      checkpointResponse:
        overrides?.checkpointResponse !== undefined
          ? overrides.checkpointResponse
          : checkpointText,
      checkpointScore:
        overrides?.checkpointScore !== undefined ? overrides.checkpointScore : checkpointScore,
      lastStudiedAt: new Date().toISOString(),
    };
    onSaveProgress(next);
  };

  const markStepDone = (stepId: number): number[] => {
    if (completedSteps.includes(stepId)) return completedSteps;
    const updated = [...completedSteps, stepId].sort((a, b) => a - b);
    setCompletedSteps(updated);
    return updated;
  };

  const goToStep = (nextStep: number, markCurrentDone = false) => {
    stopRecording();
    soundEngine.playClickSound();
    const updatedCompleted = markCurrentDone ? markStepDone(step) : completedSteps;
    const clamped = Math.max(0, Math.min(STEP_LABELS.length - 1, nextStep));
    setStep(clamped);
    persistProgress({ currentStep: clamped, completedSteps: updatedCompleted });
  };

  // Vocab flashcard handlers
  const activeCard = lesson.vocabCards[vocabIndex] ?? lesson.vocabCards[0];
  const isCurrentCardMastered = activeCard ? masteredVocab.includes(activeCard.term) : false;

  const handleVocabDecision = (mastered: boolean) => {
    if (!activeCard) return;
    let updatedMastered = masteredVocab;
    if (mastered) {
      soundEngine.playSuccessChime();
      if (!masteredVocab.includes(activeCard.term)) {
        updatedMastered = [...masteredVocab, activeCard.term];
        setMasteredVocab(updatedMastered);
      }
    } else {
      soundEngine.playClickSound();
      if (masteredVocab.includes(activeCard.term)) {
        updatedMastered = masteredVocab.filter((t) => t !== activeCard.term);
        setMasteredVocab(updatedMastered);
      }
    }

    const allMastered = updatedMastered.length >= lesson.vocabCards.length;
    const updatedCompleted = allMastered ? markStepDone(1) : completedSteps;
    persistProgress({ masteredVocab: updatedMastered, completedSteps: updatedCompleted });

    setIsCardFlipped(false);
    if (vocabIndex < lesson.vocabCards.length - 1) {
      setVocabIndex((prev) => prev + 1);
    }
  };

  // Quiz handlers
  const answeredQuizCount = lesson.practiceQuestions.filter(
    (q) => quizAnswers[q.id] !== undefined
  ).length;
  const correctQuizCount = lesson.practiceQuestions.filter(
    (q) => quizAnswers[q.id] === q.correctIndex
  ).length;

  const handleAnswerQuiz = (questionId: string, optionIdx: number, correctIndex: number) => {
    const nextAnswers = { ...quizAnswers, [questionId]: optionIdx };
    setQuizAnswers(nextAnswers);
    if (optionIdx === correctIndex) {
      soundEngine.playSuccessChime();
    } else {
      soundEngine.playClickSound();
    }
    const allAnswered = lesson.practiceQuestions.every((q) => nextAnswers[q.id] !== undefined);
    const updatedCompleted = allAnswered ? markStepDone(2) : completedSteps;
    persistProgress({ quizAnswers: nextAnswers, completedSteps: updatedCompleted });
  };

  const handleResetQuiz = () => {
    soundEngine.playClickSound();
    setQuizAnswers({});
    persistProgress({ quizAnswers: {} });
  };

  // Drill handlers
  const handleToggleDrillDone = (idx: number) => {
    const exists = completedDrills.includes(idx);
    const updated = exists
      ? completedDrills.filter((i) => i !== idx)
      : [...completedDrills, idx].sort((a, b) => a - b);
    setCompletedDrills(updated);
    if (!exists) soundEngine.playSuccessChime();
    else soundEngine.playClickSound();
    const allDone = updated.length >= module.drills.length;
    const updatedCompleted = allDone ? markStepDone(3) : completedSteps;
    persistProgress({ completedDrillIndices: updated, completedSteps: updatedCompleted });
  };

  const handleToggleDrillMic = (idx: number) => {
    if (recordingDrillIdx === idx) {
      stopRecording();
      return;
    }
    stopRecording();
    setMicStatus(null);
    const baseText = (drillNotes[idx] || '').trim();
    const handle = startSpeechRecognition({
      languageId: course.languageId,
      onTranscript: (finalText, interimText) => {
        const combined = [baseText, finalText, interimText].filter(Boolean).join(' ').trim();
        setDrillNotes((prev) => ({ ...prev, [idx]: combined }));
      },
      onError: (err) => {
        setMicStatus(
          err === 'unsupported'
            ? 'Live voice dictation is unavailable in this browser — type your spoken script directly below.'
            : `Microphone notice (${err}) — you can continue typing your response.`
        );
        setRecordingDrillIdx(null);
      },
      onEnd: () => {
        setRecordingDrillIdx(null);
        recorderRef.current = null;
      },
    });
    if (handle) {
      recorderRef.current = handle;
      setRecordingDrillIdx(idx);
    }
  };

  const handleEvaluateDrill = async (idx: number) => {
    const drill = module.drills[idx];
    const responseText = (drillNotes[idx] || '').trim();
    if (!drill) return;
    setEvaluatingDrillIdx(idx);
    try {
      const skill: 'writing' | 'speaking' = drill.skill === 'speaking' ? 'speaking' : 'writing';
      const result = await evaluateWithAIOrFallback({
        config: effectiveAIConfig,
        text: responseText,
        languageId: course.languageId,
        level: course.level,
        skill,
        taskPrompt: `${drill.title}: ${drill.instruction}`,
        minWords: Math.max(20, Math.round(lesson.checkpointMinWords * 0.7)),
        expectedKeywords: module.keyVocabulary,
      });
      setDrillEvaluations((prev) => ({ ...prev, [idx]: result }));
      if (!completedDrills.includes(idx) && responseText.length > 0) {
        const updated = [...completedDrills, idx].sort((a, b) => a - b);
        setCompletedDrills(updated);
        const allDone = updated.length >= module.drills.length;
        const updatedCompleted = allDone ? markStepDone(3) : completedSteps;
        persistProgress({ completedDrillIndices: updated, completedSteps: updatedCompleted });
      }
      soundEngine.playSuccessChime();
    } finally {
      setEvaluatingDrillIdx(null);
    }
  };

  // Checkpoint handlers
  const checkpointWordCount = useMemo(
    () => checkpointText.trim().split(/\s+/).filter(Boolean).length,
    [checkpointText]
  );

  const handleToggleCheckpointMic = () => {
    if (isRecordingCheckpoint) {
      stopRecording();
      return;
    }
    stopRecording();
    setMicStatus(null);
    const baseText = checkpointText.trim();
    const handle = startSpeechRecognition({
      languageId: course.languageId,
      onTranscript: (finalText, interimText) => {
        const combined = [baseText, finalText, interimText].filter(Boolean).join(' ').trim();
        setCheckpointText(combined);
      },
      onError: (err) => {
        setMicStatus(
          err === 'unsupported'
            ? 'Live voice dictation is unavailable in this browser — type your response directly below.'
            : `Microphone notice (${err}) — you can continue typing your response.`
        );
        setIsRecordingCheckpoint(false);
      },
      onEnd: () => {
        setIsRecordingCheckpoint(false);
        recorderRef.current = null;
      },
    });
    if (handle) {
      recorderRef.current = handle;
      setIsRecordingCheckpoint(true);
    }
  };

  const handleEvaluateCheckpoint = async () => {
    stopRecording();
    setIsEvaluatingCheckpoint(true);
    try {
      const result = await evaluateWithAIOrFallback({
        config: effectiveAIConfig,
        text: checkpointText,
        languageId: course.languageId,
        level: course.level,
        skill: lesson.checkpointSkill,
        taskPrompt: module.checkpointPrompt,
        minWords: lesson.checkpointMinWords,
        expectedKeywords: module.keyVocabulary,
      });
      setCheckpointEval(result);
      setCheckpointScore(result.score);
      const updatedCompleted = markStepDone(4);
      persistProgress({
        completedSteps: updatedCompleted,
        checkpointResponse: checkpointText,
        checkpointScore: result.score,
      });
      soundEngine.playSuccessChime();
    } finally {
      setIsEvaluatingCheckpoint(false);
    }
  };

  const handleFinishUnit = (advanceToNextUnit: boolean) => {
    stopRecording();
    const allStepIds = [0, 1, 2, 3, 4];
    setCompletedSteps(allStepIds);
    persistProgress({
      currentStep: 4,
      completedSteps: allStepIds,
      checkpointResponse: checkpointText,
      checkpointScore,
    });
    soundEngine.playSuccessChime();
    onCompleteUnit(checkpointScore);
    if (advanceToNextUnit && nextModule) {
      onStartModule(nextModule.id);
    } else {
      setJustCompletedUnit(true);
    }
  };

  const overallStepPercent = Math.round((completedSteps.length / STEP_LABELS.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Guided Player Header + Stepper */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopRecording();
              soundEngine.playClickSound();
              persistProgress();
              onExit();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {course.level} Syllabus</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              ~{lesson.estimatedMins} mins
            </span>
            <select
              aria-label="Lesson voice accent"
              value={activeAccent}
              onChange={(e) => {
                soundEngine.playClickSound();
                soundEngine.setAccent(course.languageId, e.target.value);
                setActiveAccent(e.target.value);
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {availableAccents.map((acc) => (
                <option key={acc.code} value={acc.code}>
                  {acc.flag} {acc.label}
                </option>
              ))}
            </select>
            {onOpenVoiceSettings && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenVoiceSettings();
                }}
                className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25 hover:bg-sky-500/20 transition-colors"
              >
                <AudioLines className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleSlowAudio}
              className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                slowAudio
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Audio: {slowAudio ? '0.75x Slow' : '1.0x Normal'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-600 text-white">
              {course.level} · Unit {unitIndex} of {totalUnits}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {module.weekLabel}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Unit Mastered
              </span>
            )}
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {module.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{lesson.overview}</p>
        </div>

        {/* 5-Step Interactive Progress Stepper */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Guided Lesson Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {completedSteps.length}/{STEP_LABELS.length} steps ({overallStepPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(8, overallStepPercent)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STEP_LABELS.map((item) => {
              const Icon = item.icon;
              const isActive = step === item.id;
              const isDone = completedSteps.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'step' : undefined}
                  onClick={() => goToStep(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isDone
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15'
                      : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {item.id + 1}. {item.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== STEP 1: LEARN (CONCEPT & GRAMMAR) ==================== */}
      {step === 0 && (
        <section className="space-y-5">
          {/* Unit Learning Outcomes */}
          <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/60 space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
              What You Will Master in Unit {unitIndex}
            </span>
            <ul className="space-y-1.5 text-sm text-slate-800 dark:text-slate-200">
              {module.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concept & Grammar Breakdown Cards */}
          {lesson.sections.map((sec, idx) => (
            <article
              key={sec.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Core Concept {idx + 1} of {lesson.sections.length}
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {sec.heading}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {sec.explanation}
                </p>
              </div>

              {sec.formula && (
                <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-sky-200 font-mono text-xs sm:text-sm border border-slate-700 overflow-x-auto">
                  {sec.formula}
                </div>
              )}

              {/* Clickable TTS Examples */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Live Examples (Click to Listen)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sec.examples.map((ex, eIdx) => (
                    <button
                      key={eIdx}
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        soundEngine.speak(ex.target, course.languageId, slowAudio);
                      }}
                      className="text-left p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 dark:bg-slate-950/70 dark:hover:bg-sky-950/30 border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-colors space-y-1.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {ex.target}
                        </p>
                        <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{ex.translation}</p>
                      {ex.highlight && (
                        <span className="inline-block px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-semibold">
                          Key pattern: {ex.highlight}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {sec.proTip && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-100">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-mono uppercase text-[11px] mr-1.5">Exam Pro Tip:</strong>
                    {sec.proTip}
                  </span>
                </div>
              )}
            </article>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => goToStep(1, true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <span>Continue to Vocabulary Flashcards</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ==================== STEP 2: VOCABULARY AUDIO FLASHCARDS ==================== */}
      {step === 1 && activeCard && (
        <section className="space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Audio Flashcard Deck · Card {vocabIndex + 1} of {lesson.vocabCards.length}
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  High-Yield Exam Vocabulary Studio
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                Mastered: {masteredVocab.length}/{lesson.vocabCards.length}
              </span>
            </div>

            {/* Interactive Flip Flashcard */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 dark:from-slate-950 dark:to-sky-950/20 border-2 border-slate-200 dark:border-slate-700 text-center space-y-5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  {isCardFlipped ? 'Meaning & Context' : 'Target Expression'}
                </span>
                {isCurrentCardMastered && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Got It
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {activeCard.term}
                </h4>
                {activeCard.pronunciation && (
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {activeCard.pronunciation}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    soundEngine.speak(activeCard.term, course.languageId, slowAudio);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen ({slowAudio ? '0.75x' : '1.0x'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    setIsCardFlipped((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isCardFlipped ? 'Hide Answer' : 'Reveal Meaning & Example'}</span>
                </button>
              </div>

              {isCardFlipped && (
                <div className="mt-4 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-3 text-left max-w-xl mx-auto animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                      Meaning
                    </span>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {activeCard.meaning}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        “{activeCard.example}”
                      </p>
                      <button
                        type="button"
                        aria-label="Hear example sentence"
                        onClick={() => {
                          soundEngine.playClickSound();
                          soundEngine.speak(activeCard.example, course.languageId, slowAudio);
                        }}
                        className="p-1.5 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {activeCard.exampleNote && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activeCard.exampleNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Flashcard Self-Grading Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVocabDecision(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Need Review</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVocabDecision(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Got It! Next Card</span>
                </button>
              </div>
            </div>

            {/* Quick Deck Navigator Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Jump to Card
              </span>
              <div className="flex flex-wrap gap-2">
                {lesson.vocabCards.map((card, idx) => {
                  const mastered = masteredVocab.includes(card.term);
                  const active = idx === vocabIndex;
                  return (
                    <button
                      key={card.term}
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        setVocabIndex(idx);
                        setIsCardFlipped(false);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                        active
                          ? 'bg-sky-600 text-white border-sky-600 font-bold'
                          : mastered
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {mastered && <CheckCircle2 className="w-3 h-3" />}
                      <span>{card.term}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(0)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Concept</span>
            </button>
            <button
              type="button"
              onClick={() => goToStep(2, true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <span>Continue to Knowledge Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ==================== STEP 3: INTERACTIVE KNOWLEDGE CHECK QUIZ ==================== */}
      {step === 2 && (
        <section className="space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Interactive Check · Instant Explanations
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Test Your Unit {unitIndex} Mastery
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                  Score: {correctQuizCount}/{lesson.practiceQuestions.length}
                </span>
                {answeredQuizCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {lesson.practiceQuestions.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const isAnswered = chosen !== undefined;
                const isRight = chosen === q.correctIndex;
                const badge = SKILL_BADGE[q.skill];

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        Question {qIdx + 1} of {lesson.practiceQuestions.length}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {q.passage && (
                      <blockquote className="p-3 rounded-lg bg-white dark:bg-slate-900 border-l-2 border-sky-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic">
                        {q.passage}
                      </blockquote>
                    )}

                    {q.audioScript && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClickSound();
                            soundEngine.speak(q.audioScript || '', course.languageId, slowAudio);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Play Listening Clip ({slowAudio ? '0.75x' : '1.0x'})</span>
                        </button>
                        {isAnswered && (
                          <details className="text-xs text-slate-600 dark:text-slate-400">
                            <summary className="cursor-pointer font-semibold text-sky-700 dark:text-sky-400">
                              View Audio Transcript
                            </summary>
                            <p className="mt-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              {q.audioScript}
                            </p>
                          </details>
                        )}
                      </div>
                    )}

                    <p className="text-sm font-bold text-slate-900 dark:text-white">{q.prompt}</p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = chosen === optIdx;
                        const isOptionCorrect = optIdx === q.correctIndex;
                        let style =
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-800 dark:text-slate-200';
                        if (isAnswered) {
                          if (isOptionCorrect) {
                            style =
                              'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold';
                          } else if (selected && !isOptionCorrect) {
                            style =
                              'bg-rose-500/15 border-rose-500 text-rose-950 dark:text-rose-100';
                          } else {
                            style =
                              'bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleAnswerQuiz(q.id, optIdx, q.correctIndex)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors ${style}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && isOptionCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && selected && !isOptionCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div
                        className={`p-3 rounded-lg text-xs border ${
                          isRight
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                        }`}
                      >
                        <strong className="font-mono uppercase text-[11px] mr-1.5">
                          {isRight ? 'Correct!' : 'Key Takeaway:'}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => goToStep(3, true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <span>Continue to 4-Skill Drills</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ==================== STEP 4: INTERACTIVE 4-SKILL DRILLS ==================== */}
      {step === 3 && (
        <section className="space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Active Skill Workbench · Practice Inside the Unit
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Hands-On 4-Skill Intensive Drills ({completedDrills.length}/{module.drills.length} practiced)
                </h3>
              </div>
            </div>

            {micStatus && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                {micStatus}
              </div>
            )}

            <div className="space-y-4">
              {module.drills.map((drill, dIdx) => {
                const badge = SKILL_BADGE[drill.skill];
                const isDrillDone = completedDrills.includes(dIdx);
                const note = drillNotes[dIdx] || '';
                const evalResult = drillEvaluations[dIdx];
                const isProductiveSkill = drill.skill === 'writing' || drill.skill === 'speaking';
                const playCount = drillAudioPlays[dIdx] || 0;

                return (
                  <div
                    key={dIdx}
                    className={`p-4 sm:p-5 rounded-xl border space-y-3.5 transition-colors ${
                      isDrillDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${badge.cls}`}
                        >
                          {badge.label} · {drill.durationMins}m
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {drill.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onLaunchAICoach(
                              course.languageId,
                              course.level,
                              drill.skill,
                              `Practice drill: ${drill.title}. ${drill.instruction}`
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400 transition-colors"
                        >
                          <Bot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Open in AI Coach</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDrillDone(dIdx)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            isDrillDone
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                          }`}
                        >
                          {isDrillDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          <span>{isDrillDone ? 'Practiced' : 'Mark Practiced'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {drill.instruction}
                    </p>

                    {drill.samplePassage && (
                      <blockquote className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-l-2 border-sky-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        {drill.samplePassage}
                      </blockquote>
                    )}

                    {drill.audioScript && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClickSound();
                              soundEngine.speak(
                                drill.audioScript || '',
                                course.languageId,
                                slowAudio
                              );
                              setDrillAudioPlays((prev) => ({
                                ...prev,
                                [dIdx]: (prev[dIdx] || 0) + 1,
                              }));
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>
                              Play Listening Audio ({slowAudio ? '0.75x' : '1.0x'})
                            </span>
                          </button>
                          {playCount > 0 && (
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              Played {playCount}×
                            </span>
                          )}
                        </div>
                        <details className="text-xs text-slate-600 dark:text-slate-400">
                          <summary className="cursor-pointer font-semibold text-sky-700 dark:text-sky-400">
                            Reveal Audio Transcript (Check after listening)
                          </summary>
                          <p className="mt-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            {drill.audioScript}
                          </p>
                        </details>
                      </div>
                    )}

                    {/* Inline Practice Response / Notes Pad */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        {drill.skill === 'speaking'
                          ? 'Your Spoken Response (Dictate or Type Script)'
                          : drill.skill === 'writing'
                          ? 'Your Written Drill Response'
                          : 'Your Notes & Comprehension Answers'}
                      </label>
                      <textarea
                        rows={isProductiveSkill ? 4 : 2}
                        value={note}
                        onChange={(e) =>
                          setDrillNotes((prev) => ({ ...prev, [dIdx]: e.target.value }))
                        }
                        placeholder={
                          drill.skill === 'speaking'
                            ? 'Click "Dictate Live Voice" or type what you say aloud...'
                            : drill.skill === 'writing'
                            ? 'Draft your response here and click Evaluate for instant CEFR feedback...'
                            : 'Jot down platform numbers, key facts, or answers here...'
                        }
                        className="w-full p-3 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />

                      {isProductiveSkill && (
                        <div className="flex flex-wrap items-center gap-2">
                          {drill.skill === 'speaking' && (
                            <button
                              type="button"
                              onClick={() => handleToggleDrillMic(dIdx)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                recordingDrillIdx === dIdx
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {recordingDrillIdx === dIdx ? (
                                <MicOff className="w-3.5 h-3.5" />
                              ) : (
                                <Mic className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {recordingDrillIdx === dIdx
                                  ? 'Stop Mic'
                                  : micSupported
                                  ? 'Dictate Live Voice'
                                  : 'Voice Mic (Browser N/A)'}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={evaluatingDrillIdx === dIdx || !note.trim()}
                            onClick={() => void handleEvaluateDrill(dIdx)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {evaluatingDrillIdx === dIdx
                                ? 'Evaluating...'
                                : 'Evaluate Drill'}
                            </span>
                          </button>
                        </div>
                      )}

                      {evalResult && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                              Score: {evalResult.score}/100 · CEFR {evalResult.cefrEstimate}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {evalResult.providerLabel}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {evalResult.examinerSummary}
                          </p>
                          {evalResult.corrections.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-amber-800 dark:text-amber-300">
                              {evalResult.corrections.slice(0, 3).map((c, ci) => (
                                <li key={ci}>{c}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quiz</span>
            </button>
            <button
              type="button"
              onClick={() => goToStep(4, true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <span>Continue to Milestone Checkpoint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ==================== STEP 5: MILESTONE CHECKPOINT & COMPLETION ==================== */}
      {step === 4 && (
        <section className="space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    <Award className="w-3.5 h-3.5" />
                    Unit {unitIndex} Milestone Checkpoint
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                      SKILL_BADGE[lesson.checkpointSkill].cls
                    }`}
                  >
                    {lesson.checkpointSkill === 'speaking' ? 'Speaking Task' : 'Writing Task'}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {module.checkpointPrompt}
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                {checkpointWordCount} / {lesson.checkpointMinWords}+ words
              </span>
            </div>

            {/* Vocabulary Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Try Using These Unit {unitIndex} Terms (Click to Hear)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {module.keyVocabulary.map((word) => {
                  const used = checkpointText.toLowerCase().includes(word.toLowerCase());
                  return (
                    <button
                      key={word}
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        soundEngine.speak(word, course.languageId, slowAudio);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                        used
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 font-bold'
                          : 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 hover:bg-sky-100'
                      }`}
                    >
                      {used ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                      <span>{word}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {micStatus && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                {micStatus}
              </div>
            )}

            {/* Response Editor */}
            <div className="space-y-2.5">
              <textarea
                rows={6}
                value={checkpointText}
                onChange={(e) => setCheckpointText(e.target.value)}
                placeholder={
                  lesson.checkpointSkill === 'speaking'
                    ? `Click "Dictate Live Voice" to speak your ${course.level} response, or type your spoken script here...`
                    : `Write your ${course.level} checkpoint response here (aim for ${lesson.checkpointMinWords}+ words)...`
                }
                className="w-full p-3.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleCheckpointMic}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isRecordingCheckpoint
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isRecordingCheckpoint ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span>
                    {isRecordingCheckpoint ? 'Stop Mic Recording' : 'Dictate Live Voice'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isEvaluatingCheckpoint || !checkpointText.trim()}
                  onClick={() => void handleEvaluateCheckpoint()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isEvaluatingCheckpoint ? 'Evaluating...' : 'Evaluate Checkpoint'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    setShowModelAnswer((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{showModelAnswer ? 'Hide Model Answer' : 'Compare with Model Answer'}</span>
                </button>
              </div>
            </div>

            {/* Checkpoint Evaluation Report */}
            {checkpointEval && (
              <div className="p-4 sm:p-5 rounded-xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-800 space-y-3 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      {checkpointEval.score}/100
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-600 text-white">
                      Estimated CEFR {checkpointEval.cefrEstimate}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {checkpointEval.providerLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {checkpointEval.examinerSummary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {checkpointEval.strengths.length > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                      <span className="font-mono font-bold uppercase text-[11px] text-emerald-700 dark:text-emerald-300">
                        Strengths
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-800 dark:text-slate-200">
                        {checkpointEval.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {checkpointEval.corrections.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1">
                      <span className="font-mono font-bold uppercase text-[11px] text-amber-800 dark:text-amber-300">
                        Next-Level Fixes
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-800 dark:text-slate-200">
                        {checkpointEval.corrections.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {checkpointEval.upgradedVersion && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <span className="font-mono font-bold uppercase text-[11px] text-sky-700 dark:text-sky-300">
                      Upgraded {course.level}+ Version
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {checkpointEval.upgradedVersion}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Model Answer */}
            {showModelAnswer && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Reference {course.level} Model Response
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClickSound();
                      soundEngine.speak(lesson.checkpointModelAnswer, course.languageId, slowAudio);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen to Model</span>
                  </button>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {lesson.checkpointModelAnswer}
                </p>
              </div>
            )}

            {/* Graduation / Completion Banner */}
            {justCompletedUnit && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      Unit {unitIndex} Completed!
                    </p>
                    <p className="text-xs text-emerald-800 dark:text-emerald-200">
                      Your progress and study streak have been saved.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onLaunchExam(course.languageId, course.level)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Simulate {course.level} Exam</span>
                  </button>
                  {nextLevelCourse && onAdvanceLevel && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        onAdvanceLevel(nextLevelCourse.level);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <span>Start {nextLevelCourse.level} Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Drills</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {nextModule ? (
                <button
                  type="button"
                  onClick={() => handleFinishUnit(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Unit &amp; Continue to Unit {unitIndex + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFinishUnit(false)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Unit {unitIndex} &amp; Finish {course.level}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
