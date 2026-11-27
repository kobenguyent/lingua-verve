import React, { useRef, useState } from 'react';
import {
  BarChart3,
  Flame,
  GraduationCap,
  Award,
  ClipboardCheck,
  Bot,
  Download,
  Upload,
  Trash2,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  AIProviderConfig,
  CEFRLevel,
  ExamAIAssessment,
  ExamAttemptRecord,
  LearnerProgressState,
  SkillType,
} from '../types';
import { INTENSIVE_COURSES } from '../data';
import {
  computeSkillAverages,
  computeStudyStreak,
  exportLearnerProgressJSON,
  parseImportedLearnerProgressJSON,
} from '../utils/progressStore';
import { soundEngine } from '../utils/audio';
import {
  ExamAttemptDetailModal,
  formatExamClock,
  resolveOfficialGradeLabel,
} from './ExamAttemptDetailModal';

interface ProgressDashboardViewProps {
  learnerState: LearnerProgressState;
  masteredTipsCount: number;
  onImportState: (state: LearnerProgressState) => void;
  onResetProgress: () => void;
  onJumpToCourse: (languageId: string, level: CEFRLevel) => void;
  onLaunchExam?: (languageId: string, level: CEFRLevel) => void;
  onDeleteExamAttempt?: (attemptId: string) => void;
  aiConfig?: AIProviderConfig;
  onOpenAISettings?: () => void;
  onUpdateExamAssessment?: (attemptId: string, assessment: ExamAIAssessment) => void;
  onLaunchAICoach?: (languageId: string, level: CEFRLevel, skill: SkillType, seedPrompt?: string) => void;
}

const SKILL_META: Record<SkillType, { label: string; icon: React.ComponentType<{ className?: string }>; barClass: string }> = {
  reading: { label: 'Reading', icon: BookOpen, barClass: 'bg-sky-500' },
  listening: { label: 'Listening / Hearing', icon: Headphones, barClass: 'bg-purple-500' },
  writing: { label: 'Writing', icon: PenTool, barClass: 'bg-amber-500' },
  speaking: { label: 'Speaking', icon: Mic, barClass: 'bg-emerald-500' },
};

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  learnerState,
  masteredTipsCount,
  onImportState,
  onResetProgress,
  onJumpToCourse,
  onLaunchExam,
  onDeleteExamAttempt,
  aiConfig,
  onOpenAISettings,
  onUpdateExamAssessment,
  onLaunchAICoach,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [filterLang, setFilterLang] = useState<'all' | 'english' | 'german'>('all');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptRecord | null>(null);

  const streak = computeStudyStreak(learnerState.studyDays);
  const skillAverages = computeSkillAverages(learnerState, filterLang);
  const totalModules = INTENSIVE_COURSES.flatMap((c) => c.modules).length;
  const passedExams = learnerState.examHistory.filter((e) => e.passed).length;

  const filteredExams = learnerState.examHistory.filter(
    (e) => filterLang === 'all' || e.languageId === filterLang
  );
  const filteredPreTests = learnerState.preTestHistory.filter(
    (p) => filterLang === 'all' || p.languageId === filterLang
  );

  const handleExport = () => {
    soundEngine.playClickSound();
    const json = exportLearnerProgressJSON(learnerState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguaverve-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseImportedLearnerProgressJSON(String(reader.result || ''));
        onImportState(parsed);
        soundEngine.playSuccessChime();
        setImportNotice('Progress backup restored successfully!');
      } catch {
        setImportNotice('Could not read backup file. Please choose a valid LinguaVerve JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header + Export / Import Backup */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Learner Progress, Test Results &amp; Study History</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Your Zero-to-Hero Polyglot Dossier
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Every completed intensive module, placement pre-test, 4-skill simulated exam, and AI session is saved automatically in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-500"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              soundEngine.playClickSound();
              onResetProgress();
              setImportNotice('Progress history cleared.');
            }}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </section>

      {importNotice && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200">
          {importNotice}
        </div>
      )}

      {/* Top KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Study Streak</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {streak} {streak === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-sky-500" />
            <span>Course Units</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {learnerState.completedModuleIds.length}/{totalModules}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Exams Passed</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {passedExams}/{learnerState.examHistory.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-indigo-500" />
            <span>Pre-Tests</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {learnerState.preTestHistory.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-500" />
            <span>AI Sessions / Tips</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {learnerState.aiSessionHistory.length} · {masteredTipsCount}
          </div>
        </div>
      </section>

      {/* Filter & 4-Skill Mastery Bars */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            4-Skill Competency Average (Pre-Tests + Simulated Exams)
          </h2>
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
            {(['all', 'english', 'german'] as const).map((lang) => (
              <button
                type="button"
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  filterLang === lang
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {lang === 'all' ? 'All' : lang === 'english' ? '🇬🇧 English' : '🇩🇪 German'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['reading', 'listening', 'writing', 'speaking'] as SkillType[]).map((sk) => {
            const meta = SKILL_META[sk];
            const Icon = meta.icon;
            const stat = skillAverages[sk];
            return (
              <div key={sk} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                    {stat.samples > 0 ? `${stat.average}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${meta.barClass}`} style={{ width: `${stat.average}%` }} />
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {stat.samples > 0 ? `Based on ${stat.samples} recorded test${stat.samples === 1 ? '' : 's'}` : 'Take a Pre-Test or Simulated Exam'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Zero-to-Hero CEFR Mastery Grids (English & German) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['english', 'german'] as const).map((langId) => {
          const courses = INTENSIVE_COURSES.filter((c) => c.languageId === langId);
          return (
            <div key={langId} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {langId === 'german' ? '🇩🇪 German' : '🇬🇧 English'} Zero-to-Hero Map (A1 → C2)
              </h3>
              <div className="space-y-2">
                {courses.map((course) => {
                  const done = course.modules.filter((m) => learnerState.completedModuleIds.includes(m.id)).length;
                  const pct = Math.round((done / course.modules.length) * 100);
                  const bestExam = learnerState.examHistory
                    .filter((e) => e.languageId === langId && e.level === course.level)
                    .sort((a, b) => b.overallScore - a.overallScore)[0];
                  return (
                    <button
                      type="button"
                      key={course.id}
                      onClick={() => onJumpToCourse(langId, course.level)}
                      className="w-full p-3 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-sky-400 transition-colors text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          <span className="font-mono text-sky-700 dark:text-sky-400 mr-1.5">{course.level}</span>
                          {course.title}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-2">
                          {done}/{course.modules.length} units
                          {bestExam ? ` · Best Exam ${bestExam.overallScore}%` : ''}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Simulated Exam Results & Pre-Test History */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulated Exam History */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Simulated Exam Results ({filteredExams.length})
            </h3>
            {filteredExams.length > 0 && (
              <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
                Click any exam for full report
              </span>
            )}
          </div>
          {filteredExams.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No simulated exams completed yet. Launch the 4-Skill Exam Arena to record your first scorecard!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
              {filteredExams.map((attempt) => {
                const gradeLabel = resolveOfficialGradeLabel(attempt);
                return (
                  <button
                    type="button"
                    key={attempt.id}
                    onClick={() => {
                      soundEngine.playClickSound();
                      setSelectedAttempt(attempt);
                    }}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                          <span>
                            {attempt.languageId === 'german' ? '🇩🇪' : '🇬🇧'} {attempt.examTitle}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-700 dark:text-sky-300">
                            {attempt.level}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                          {gradeLabel}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                          attempt.passed
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {attempt.overallScore}% · {attempt.passed ? 'PASS' : 'RETRY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                      {(
                        [
                          ['Read', attempt.skills.reading],
                          ['Listen', attempt.skills.listening],
                          ['Write', attempt.skills.writing],
                          ['Speak', attempt.skills.speaking],
                        ] as const
                      ).map(([shortLabel, s]) => (
                        <div
                          key={shortLabel}
                          className={`px-2 py-0.5 rounded text-center font-semibold ${
                            s?.passed
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {shortLabel}: {s?.score ?? 0}%
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                      <span>
                        {new Date(attempt.timestamp).toLocaleString()} · {attempt.mode} ·{' '}
                        {formatExamClock(attempt.durationUsedSeconds)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-sky-700 dark:text-sky-400">
                        Inspect Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Placement Pre-Tests & Activity Timeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Placement Pre-Test History ({filteredPreTests.length})
            </h3>
            {filteredPreTests.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No placement pre-tests recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredPreTests.map((pre) => (
                  <div
                    key={pre.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {pre.languageId === 'german' ? '🇩🇪 German' : '🇬🇧 English'} · Verified {pre.verifiedLevel}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {pre.correctCount}/{pre.totalCount} ({pre.overallScore}%) · {new Date(pre.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono font-bold">
                      {pre.verifiedLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Recent Activity Log
            </h3>
            {learnerState.activityLog.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Start completing modules or tests to build your timeline.</p>
            ) : (
              <ul className="space-y-1.5 max-h-44 overflow-y-auto text-xs">
                {learnerState.activityLog.slice(0, 12).map((act) => (
                  <li key={act.id} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{act.title}</span>{' '}
                      <span className="text-slate-500">— {act.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ExamAttemptDetailModal
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        onRetakeLevel={onLaunchExam}
        onDeleteAttempt={onDeleteExamAttempt}
        aiConfig={aiConfig}
        onOpenAISettings={onOpenAISettings}
        onUpdateAssessment={onUpdateExamAssessment}
        onLaunchAICoach={onLaunchAICoach}
      />
    </div>
  );
};
