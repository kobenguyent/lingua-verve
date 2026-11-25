import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Volume2,
  ExternalLink,
  Award,
  Timer,
  Bot,
  Clock,
  Sparkles,
  Gauge,
  Play,
  AudioLines,
} from 'lucide-react';
import {
  AIProviderConfig,
  CEFRLevel,
  CourseModule,
  SkillType,
  UnitStudyProgress,
} from '../types';
import {
  CEFR_LEVELS,
  INTENSIVE_COURSES,
  OFFICIAL_EXAM_REFERENCES,
} from '../data';
import { getAccentsForLanguage, soundEngine } from '../utils/audio';
import { UnitLessonPlayer } from './UnitLessonPlayer';

interface IntensiveCoursesViewProps {
  activeLanguageId: string;
  onSelectLanguage: (langId: string) => void;
  activeLevel: CEFRLevel | 'ALL';
  onSelectLevel: (level: CEFRLevel) => void;
  completedModuleIds: string[];
  enrolledCourseIds: string[];
  onToggleModuleComplete: (moduleId: string, meta: { languageId: string; level: CEFRLevel; title: string }) => void;
  onCompleteModule?: (moduleId: string, meta: { languageId: string; level: CEFRLevel; title: string; score?: number }) => void;
  unitProgressMap?: Record<string, UnitStudyProgress>;
  onSaveUnitProgress?: (progress: UnitStudyProgress) => void;
  aiConfig?: AIProviderConfig;
  onOpenVoiceSettings?: () => void;
  onLaunchExam: (languageId: string, level: CEFRLevel) => void;
  onLaunchAICoach: (languageId: string, level: CEFRLevel, skill: SkillType, seedPrompt?: string) => void;
  onLaunchPreTest: (languageId: string) => void;
}

const SKILL_META: Record<SkillType, { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }> = {
  reading: {
    label: 'Reading',
    icon: BookOpen,
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
  },
  listening: {
    label: 'Listening / Hearing',
    icon: Headphones,
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
  },
  writing: {
    label: 'Writing',
    icon: PenTool,
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
  },
  speaking: {
    label: 'Speaking',
    icon: Mic,
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  },
};

export const IntensiveCoursesView: React.FC<IntensiveCoursesViewProps> = ({
  activeLanguageId,
  onSelectLanguage,
  activeLevel,
  onSelectLevel,
  completedModuleIds,
  enrolledCourseIds,
  onToggleModuleComplete,
  onCompleteModule,
  unitProgressMap,
  onSaveUnitProgress,
  aiConfig,
  onOpenVoiceSettings,
  onLaunchExam,
  onLaunchAICoach,
  onLaunchPreTest,
}) => {
  const courseLang = activeLanguageId === 'german' ? 'german' : 'english';
  const selectedLevel: CEFRLevel = activeLevel === 'ALL' ? 'A1' : activeLevel;
  const [slowAudio, setSlowAudio] = useState(false);
  const [showAllRefs, setShowAllRefs] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [localUnitProgress, setLocalUnitProgress] = useState<Record<string, UnitStudyProgress>>({});
  const [activeAccent, setActiveAccent] = useState<string>(() =>
    soundEngine.getActiveAccentCode(courseLang)
  );

  useEffect(() => {
    setActiveAccent(soundEngine.getActiveAccentCode(courseLang));
    return soundEngine.subscribe(() => {
      setActiveAccent(soundEngine.getActiveAccentCode(courseLang));
    });
  }, [courseLang]);

  const availableAccents = useMemo(() => getAccentsForLanguage(courseLang), [courseLang]);

  const effectiveUnitProgress = unitProgressMap ?? localUnitProgress;

  useEffect(() => {
    setActiveModuleId(null);
  }, [courseLang, selectedLevel]);

  const languageCourses = useMemo(
    () => INTENSIVE_COURSES.filter((c) => c.languageId === courseLang),
    [courseLang]
  );

  const currentCourse = useMemo(
    () => languageCourses.find((c) => c.level === selectedLevel) || languageCourses[0],
    [languageCourses, selectedLevel]
  );

  const nextLevelCourse = useMemo(() => {
    const idx = languageCourses.findIndex((c) => c.id === currentCourse.id);
    return idx >= 0 && idx + 1 < languageCourses.length ? languageCourses[idx + 1] : undefined;
  }, [languageCourses, currentCourse]);

  const recommendedUnit = useMemo(() => {
    const inProgress = currentCourse.modules.find(
      (m) => !completedModuleIds.includes(m.id) && Boolean(effectiveUnitProgress[m.id])
    );
    if (inProgress) {
      return {
        module: inProgress,
        unitNumber: currentCourse.modules.findIndex((m) => m.id === inProgress.id) + 1,
        mode: 'continue' as const,
      };
    }
    const nextUnfinished = currentCourse.modules.find((m) => !completedModuleIds.includes(m.id));
    if (nextUnfinished) {
      return {
        module: nextUnfinished,
        unitNumber: currentCourse.modules.findIndex((m) => m.id === nextUnfinished.id) + 1,
        mode: 'start' as const,
      };
    }
    return {
      module: currentCourse.modules[0],
      unitNumber: 1,
      mode: 'review' as const,
    };
  }, [currentCourse, completedModuleIds, effectiveUnitProgress]);

  const handleSaveProgress = (progress: UnitStudyProgress) => {
    if (onSaveUnitProgress) {
      onSaveUnitProgress(progress);
    } else {
      setLocalUnitProgress((prev) => ({ ...prev, [progress.moduleId]: progress }));
    }
  };

  const handleCompleteGuidedUnit = (mod: CourseModule, score?: number) => {
    if (onCompleteModule) {
      onCompleteModule(mod.id, {
        languageId: currentCourse.languageId,
        level: currentCourse.level,
        title: mod.title,
        score,
      });
    } else if (!completedModuleIds.includes(mod.id)) {
      onToggleModuleComplete(mod.id, {
        languageId: currentCourse.languageId,
        level: currentCourse.level,
        title: mod.title,
      });
    }
  };

  const overallCourseStats = useMemo(() => {
    const allModules = languageCourses.flatMap((c) => c.modules);
    const done = allModules.filter((m) => completedModuleIds.includes(m.id)).length;
    return {
      done,
      total: allModules.length,
      percent: allModules.length ? Math.round((done / allModules.length) * 100) : 0,
    };
  }, [languageCourses, completedModuleIds]);

  const currentCourseProgress = useMemo(() => {
    const total = currentCourse.modules.length;
    const done = currentCourse.modules.filter((m) => completedModuleIds.includes(m.id)).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [currentCourse, completedModuleIds]);

  const courseReferences = useMemo(() => {
    if (showAllRefs) {
      return OFFICIAL_EXAM_REFERENCES.filter((r) => r.languageId === courseLang);
    }
    return OFFICIAL_EXAM_REFERENCES.filter((r) => currentCourse.referenceIds.includes(r.id));
  }, [courseLang, currentCourse, showAllRefs]);

  const handleToggleModule = (mod: CourseModule) => {
    const alreadyDone = completedModuleIds.includes(mod.id);
    if (!alreadyDone) {
      soundEngine.playSuccessChime();
    } else {
      soundEngine.playClickSound();
    }
    onToggleModuleComplete(mod.id, {
      languageId: currentCourse.languageId,
      level: currentCourse.level,
      title: mod.title,
    });
  };

  const activeModuleIndex = activeModuleId
    ? currentCourse.modules.findIndex((m) => m.id === activeModuleId)
    : -1;
  const activeModule = activeModuleIndex >= 0 ? currentCourse.modules[activeModuleIndex] : null;

  if (activeModule) {
    const nextModule =
      activeModuleIndex + 1 < currentCourse.modules.length
        ? currentCourse.modules[activeModuleIndex + 1]
        : undefined;
    return (
      <UnitLessonPlayer
        key={activeModule.id}
        course={currentCourse}
        module={activeModule}
        unitIndex={activeModuleIndex + 1}
        totalUnits={currentCourse.modules.length}
        nextModule={nextModule}
        nextLevelCourse={nextLevelCourse}
        isCompleted={completedModuleIds.includes(activeModule.id)}
        initialProgress={effectiveUnitProgress[activeModule.id]}
        slowAudio={slowAudio}
        onToggleSlowAudio={() => setSlowAudio((prev) => !prev)}
        aiConfig={aiConfig}
        onOpenVoiceSettings={onOpenVoiceSettings}
        onSaveProgress={handleSaveProgress}
        onCompleteUnit={(score) => handleCompleteGuidedUnit(activeModule, score)}
        onExit={() => setActiveModuleId(null)}
        onStartModule={(nextId) => setActiveModuleId(nextId)}
        onAdvanceLevel={(lvl) => {
          setActiveModuleId(null);
          onSelectLevel(lvl);
        }}
        onLaunchExam={onLaunchExam}
        onLaunchAICoach={onLaunchAICoach}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Zero-to-Hero Overview */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Zero-to-Hero Intensive Academy · A1 → C2</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {courseLang === 'german' ? '🇩🇪 German' : '🇬🇧 English'} Intensive Certification Curriculum
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Master all 4 certification skills—<strong>Reading</strong>, <strong>Listening &amp; Hearing</strong>,{' '}
              <strong>Writing</strong>, and <strong>Speaking</strong>—from absolute zero (A1) to near-native exam certification (C2).
            </p>
          </div>

          {/* Language Track Switch + Pre-Test CTA */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onSelectLanguage('english');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  courseLang === 'english'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇬🇧 English Track
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onSelectLanguage('german');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  courseLang === 'german'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇩🇪 German Track
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClickSound();
                onLaunchPreTest(courseLang);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unsure of Level? Take Pre-Test</span>
            </button>
          </div>
        </div>

        {/* Zero-to-Hero Overall Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">
              Overall {courseLang === 'german' ? 'German' : 'English'} Zero-to-Hero Progress (A1–C2)
            </span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {overallCourseStats.done}/{overallCourseStats.total} Modules ({overallCourseStats.percent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${overallCourseStats.percent}%` }}
            />
          </div>
        </div>

        {/* 6 CEFR Intensive Course Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {languageCourses.map((course) => {
            const lvlInfo = CEFR_LEVELS.find((l) => l.id === course.level);
            const isSelected = currentCourse.id === course.id;
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const doneCount = course.modules.filter((m) => completedModuleIds.includes(m.id)).length;
            const pct = Math.round((doneCount / course.modules.length) * 100);

            return (
              <button
                type="button"
                key={course.id}
                aria-pressed={isSelected}
                onClick={() => {
                  soundEngine.playClickSound();
                  onSelectLevel(course.level);
                }}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? `${lvlInfo?.color.bg ?? 'bg-sky-50'} ${lvlInfo?.color.border ?? 'border-sky-400'} ring-1 ring-sky-600 dark:ring-sky-400 shadow-sm`
                    : 'bg-[#FAF9F6] dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-mono font-bold text-base ${isSelected ? lvlInfo?.color.text : 'text-slate-900 dark:text-white'}`}>
                    {course.level}
                  </span>
                  {isEnrolled && (
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Suggested
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                  {course.heroRole.split('·')[1]?.trim() || course.level}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>{course.durationWeeks}w</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Course Dossier */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950">
                {currentCourse.level} · {currentCourse.heroRole}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {currentCourse.durationWeeks} weeks · {currentCourse.dailyHours}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {currentCourse.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{currentCourse.subtitle}</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              {currentCourse.targetCertificates.map((cert) => (
                <span
                  key={cert}
                  className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/25"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Direct Action Triggers */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            {recommendedUnit.module && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveModuleId(recommendedUnit.module.id);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {recommendedUnit.mode === 'continue'
                    ? `Continue Unit ${recommendedUnit.unitNumber}`
                    : recommendedUnit.mode === 'review'
                    ? `Review Unit ${recommendedUnit.unitNumber}`
                    : `Start Learning · Unit ${recommendedUnit.unitNumber}`}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickSound();
                onLaunchExam(currentCourse.languageId, currentCourse.level);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <Timer className="w-4 h-4" />
              <span>Simulate {currentCourse.level} 4-Skill Exam</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickSound();
                onLaunchAICoach(currentCourse.languageId, currentCourse.level, 'speaking');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Train {currentCourse.level} with AI Coach</span>
            </button>
          </div>
        </div>

        {/* 4-Skill Official Exam Architecture Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {(['reading', 'listening', 'writing', 'speaking'] as SkillType[]).map((skill) => {
            const meta = SKILL_META[skill];
            const Icon = meta.icon;
            return (
              <div
                key={skill}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${meta.badgeClass}`}>
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentCourse.examBlueprint[skill]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Course Module Progress + Accent & Pace Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            <strong>{currentCourse.level} Course Completion:</strong> {currentCourseProgress.done}/{currentCourseProgress.total} modules ({currentCourseProgress.percent}%) · Pass Criteria: {currentCourse.passingCriteria}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Course voice accent"
              value={activeAccent}
              onChange={(e) => {
                soundEngine.playClickSound();
                soundEngine.setAccent(courseLang, e.target.value);
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
                <span>Voice Studio</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSlowAudio(!slowAudio)}
              className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                slowAudio
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Audio Pace: {slowAudio ? '0.75x Slow' : '1.0x Normal'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Intensive Course Modules */}
      <section className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Intensive Syllabus Modules ({currentCourse.modules.length} Structured Units)
        </h3>

        <div className="space-y-4">
          {currentCourse.modules.map((mod, idx) => {
            const isCompleted = completedModuleIds.includes(mod.id);
            const savedProg = effectiveUnitProgress[mod.id];
            const stepsDone = savedProg?.completedSteps?.length ?? 0;
            const inProgress = !isCompleted && Boolean(savedProg);

            return (
              <article
                key={mod.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-colors bg-white dark:bg-slate-900 shadow-sm space-y-4 ${
                  isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Unit {idx + 1} · {mod.weekLabel}
                      </span>
                      {inProgress && (
                        <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          In Progress · {stepsDone}/5 steps
                        </span>
                      )}
                      {typeof savedProg?.checkpointScore === 'number' && (
                        <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          Checkpoint {savedProg.checkpointScore}%
                        </span>
                      )}
                      {mod.focusSkills.map((sk) => {
                        const meta = SKILL_META[sk];
                        return (
                          <span
                            key={sk}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{mod.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{mod.summary}</p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        setActiveModuleId(mod.id);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {isCompleted
                          ? `Review Unit ${idx + 1}`
                          : inProgress
                          ? `Resume Unit ${idx + 1}`
                          : `Start Unit ${idx + 1}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={isCompleted}
                      onClick={() => handleToggleModule(mod)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span>{isCompleted ? 'Completed' : 'Mark Unit Complete'}</span>
                    </button>
                  </div>
                </div>

                {/* Objectives & Grammar/Lexis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Learning Outcomes
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {mod.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <span className="font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Grammar Checkpoints
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.grammarCheckpoints.map((g, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        High-Yield Exam Lexis (Click to Hear)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.keyVocabulary.map((vocab, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              soundEngine.playClickSound();
                              soundEngine.speak(vocab, currentCourse.languageId, slowAudio);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{vocab}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hands-On 4-Skill Intensive Drills */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Interactive 4-Skill Drills
                  </span>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {mod.drills.map((drill, dIdx) => {
                      const meta = SKILL_META[drill.skill];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={dIdx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${meta.badgeClass}`}>
                              <Icon className="w-3 h-3" />
                              {meta.label} · {drill.durationMins}m
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onLaunchAICoach(
                                  currentCourse.languageId,
                                  currentCourse.level,
                                  drill.skill,
                                  `Practice drill: ${drill.title}. ${drill.instruction}`
                                )
                              }
                              className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                            >
                              <Bot className="w-3 h-3" />
                              <span>Practice with AI</span>
                            </button>
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{drill.title}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {drill.instruction}
                          </p>

                          {drill.samplePassage && (
                            <blockquote className="p-3 rounded-lg bg-white dark:bg-slate-900 border-l-2 border-sky-500 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              {drill.samplePassage}
                            </blockquote>
                          )}

                          {drill.audioScript && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClickSound();
                                  soundEngine.speak(drill.audioScript || '', currentCourse.languageId, slowAudio);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Play Listening / Hearing Audio ({slowAudio ? '0.75x' : '1.0x'})</span>
                              </button>
                              <details className="text-xs text-slate-600 dark:text-slate-400">
                                <summary className="cursor-pointer font-medium text-sky-700 dark:text-sky-400">
                                  Reveal Audio Transcript (Check after listening)
                                </summary>
                                <p className="mt-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                  {drill.audioScript}
                                </p>
                              </details>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Unit Checkpoint */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    <strong className="font-mono uppercase text-[11px] mr-1.5">Milestone Checkpoint:</strong>
                    {mod.checkpointPrompt}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Verified Official Exam Portals & Real Internet Mock Tests */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Verified Internet Sources · Real Exam Boards
            </span>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Official Certification Portals &amp; Free Real Mock Tests
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Train with official model papers, audio MP3s, and exam rules directly from{' '}
              {courseLang === 'german'
                ? 'Goethe-Institut, telc, TestDaF, ÖSD, Deutsche Welle, and vhs-Lernportal.'
                : 'Cambridge English, IELTS (British Council & IDP), ETS TOEFL iBT, and BBC Learning English.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllRefs(!showAllRefs)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-500 shrink-0 self-start sm:self-auto"
          >
            {showAllRefs ? `Filter to ${currentCourse.level} Only` : `Show All ${courseLang === 'german' ? 'German' : 'English'} Sources`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseReferences.map((ref) => (
            <div
              key={ref.id}
              className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {ref.provider}
                  </span>
                  <div className="flex items-center gap-1">
                    {ref.levels.map((lvl) => (
                      <span key={lvl} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ref.certificateName}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ref.description}</p>

                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <div>⏱ Format: {ref.examDuration}</div>
                  <div>🎯 Passing Benchmark: {ref.passingScore}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
                  {ref.free ? 'Free Official Materials' : 'Official Portal'} · {ref.type.replace('-', ' ')}
                </span>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  <span>Open Official Mock / Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
