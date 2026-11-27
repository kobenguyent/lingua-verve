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
  ExamHistoryReadinessReport,
  LearnerProgressState,
  SkillType,
} from '../types';
import { INTENSIVE_COURSES } from '../data';
import {
  getLearningLanguageMeta,
  LEARNING_LANGUAGE_IDS,
  LEARNING_LANGUAGE_META,
  LearningLanguageId,
} from '../data/languages';
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
import { ExamReadinessAdvisorCard } from './ExamReadinessAdvisorCard';
import { CertificateModal } from './CertificateModal';
import { buildLinguaVerveCertificate } from '../utils/certificate';

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
  onSaveReadinessReport?: (report: ExamHistoryReadinessReport) => void;
  onUpdateLearnerName?: (name: string) => void;
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
  onSaveReadinessReport,
  onUpdateLearnerName,
  onLaunchAICoach,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [filterLang, setFilterLang] = useState<'all' | LearningLanguageId>('all');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptRecord | null>(null);
  const [certificateAttempt, setCertificateAttempt] = useState<ExamAttemptRecord | null>(null);

  const streak = computeStudyStreak(learnerState.studyDays);
  const skillAverages = computeSkillAverages(learnerState, filterLang);
  const totalModules = INTENSIVE_COURSES.flatMap((c) => c.modules).length;
  const passedExams = learnerState.examHistory.filter((e) => e.passed).length;

  const filteredExams = learnerState.examHistory.filter(
    (e) => filterLang === 'all' || e.languageId === filterLang
  );
  const passedFilteredExams = filteredExams.filter((e) => e.passed);
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
          <div className="inline-flex flex-wrap p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
            {(['all', ...LEARNING_LANGUAGE_IDS] as const).map((lang) => (
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
                {lang === 'all'
                  ? 'All'
                  : `${LEARNING_LANGUAGE_META[lang].flag} ${LEARNING_LANGUAGE_META[lang].name}`}
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

      {/* Zero-to-Hero CEFR Mastery Grids (English, German, French & Japanese) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {LEARNING_LANGUAGE_IDS.map((langId) => {
          const langMeta = LEARNING_LANGUAGE_META[langId];
          const courses = INTENSIVE_COURSES.filter((c) => c.languageId === langId);
          return (
            <div key={langId} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {langMeta.flag} {langMeta.name} Zero-to-Hero Map (A1 → C2)
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

      {/* AI Real-Exam Readiness Advisor (Book Real Exam vs Practice More) */}
      <ExamReadinessAdvisorCard
        attempts={learnerState.examHistory}
        filterLang={filterLang}
        savedReport={learnerState.latestReadinessReport}
        aiConfig={aiConfig}
        onOpenAISettings={onOpenAISettings}
        onSaveReadinessReport={onSaveReadinessReport}
        onLaunchExam={onLaunchExam}
        onLaunchAICoach={onLaunchAICoach}
      />

      {/* Earned Official LinguaVerve Certificates Trophy Shelf */}
      {passedFilteredExams.length > 0 && (
        <section className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900 border border-amber-400/40 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Earned LinguaVerve Certificates ({passedFilteredExams.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-800/80 dark:text-amber-300/80">
              Click any diploma to personalize, download PNG/SVG, or print PDF
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {passedFilteredExams.map((attempt) => {
              const cert = buildLinguaVerveCertificate({
                attempt,
                learnerName: learnerState.learnerName,
              });
              return (
                <button
                  type="button"
                  key={`cert-${attempt.id}`}
                  onClick={() => {
                    soundEngine.playSuccessChime();
                    setCertificateAttempt(attempt);
                  }}
                  className="text-left p-4 rounded-xl bg-[#FDFBF5] dark:bg-slate-950/80 border-2 border-amber-500/45 hover:border-amber-500 shadow-sm hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        ★ {cert.honorsTitle}
                      </div>
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {cert.languageFlag} {cert.languageName} · Level {cert.level}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-slate-900 text-amber-300 border border-amber-400/50 shrink-0">
                      {cert.overallScore}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-sky-800 dark:text-sky-300 truncate">
                    {cert.officialGradeLabel}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>{cert.certificateId}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 inline-flex items-center gap-0.5">
                      Open Diploma <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

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
                            {getLearningLanguageMeta(attempt.languageId).flag} {attempt.examTitle}
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
                      <span className="inline-flex items-center gap-2 font-semibold text-sky-700 dark:text-sky-400">
                        {attempt.passed && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            <Award className="w-3 h-3" />
                            Certificate
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5">
                          Inspect Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
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
                        {getLearningLanguageMeta(pre.languageId).flag} {getLearningLanguageMeta(pre.languageId).name} · Verified {pre.verifiedLevel}
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
        learnerName={learnerState.learnerName}
        onUpdateLearnerName={onUpdateLearnerName}
      />

      <CertificateModal
        attempt={certificateAttempt}
        learnerName={learnerState.learnerName}
        onUpdateLearnerName={onUpdateLearnerName}
        onClose={() => setCertificateAttempt(null)}
      />
    </div>
  );
};
