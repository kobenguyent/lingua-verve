import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Volume2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Timer,
  Calendar,
  Award,
  ShieldAlert,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  CEFRLevel,
  ExamAttemptRecord,
  MockExam,
  OfficialRubricBreakdown,
  SkillType,
} from '../types';
import { MOCK_EXAMS } from '../data';
import { loadGeneratedExams } from '../utils/aiExamGenerator';
import { ACCENT_CATALOG, parseDialogueTurns, soundEngine } from '../utils/audio';
import {
  computeOfficialGradeLabel,
  getExamListeningTracks,
  getExamSpeakingParts,
  getExamWritingTasks,
} from '../utils/examScoring';

interface ExamAttemptDetailModalProps {
  attempt: ExamAttemptRecord | null;
  onClose: () => void;
  onRetakeLevel?: (languageId: string, level: CEFRLevel) => void;
  onDeleteAttempt?: (attemptId: string) => void;
}

type ReviewFilter = 'all' | 'missed' | 'reading' | 'listening';

const SKILL_META: Record<
  SkillType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  reading: { label: 'Reading', icon: BookOpen },
  listening: { label: 'Listening / Hearing', icon: Headphones },
  writing: { label: 'Writing', icon: PenTool },
  speaking: { label: 'Speaking', icon: Mic },
};

export function formatExamClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getAccentBadge(accentCode?: string): string {
  if (!accentCode) return '🌐 Standard';
  const match = ACCENT_CATALOG.find((a) => a.code === accentCode);
  return match ? `${match.flag} ${match.label}` : `🌐 ${accentCode}`;
}

function resolveExamForAttempt(
  attempt: ExamAttemptRecord
): { exam: MockExam; isExactMatch: boolean } | null {
  const generated = loadGeneratedExams();
  const exactGenerated = generated.find((e) => e.id === attempt.examId);
  if (exactGenerated) return { exam: exactGenerated, isExactMatch: true };

  const exactBuiltin = MOCK_EXAMS.find((e) => e.id === attempt.examId);
  if (exactBuiltin) return { exam: exactBuiltin, isExactMatch: true };

  const targetLang = attempt.languageId === 'german' ? 'german' : 'english';
  const fallback =
    MOCK_EXAMS.find((e) => e.languageId === targetLang && e.level === attempt.level) ||
    MOCK_EXAMS.find((e) => e.languageId === targetLang);
  return fallback ? { exam: fallback, isExactMatch: false } : null;
}

export function resolveOfficialGradeLabel(attempt: ExamAttemptRecord): string {
  if (attempt.officialGradeLabel && attempt.officialGradeLabel.trim().length > 0) {
    return attempt.officialGradeLabel;
  }
  const allModulesPassed = (['reading', 'listening', 'writing', 'speaking'] as SkillType[]).every(
    (sk) => Boolean(attempt.skills[sk]?.passed)
  );
  const matched = resolveExamForAttempt(attempt);
  return computeOfficialGradeLabel({
    languageId: attempt.languageId,
    level: attempt.level,
    overallScore: attempt.overallScore,
    allModulesPassed,
    passingScorePercent: matched?.exam.passingScorePercent ?? 60,
  });
}

function RubricProgressBars({ rubric }: { rubric: OfficialRubricBreakdown }) {
  const rows: Array<{ label: string; value: number }> = [
    { label: 'Task Fulfillment', value: rubric.taskFulfillment },
    { label: 'Coherence & Cohesion', value: rubric.coherenceCohesion },
    { label: 'Lexical Range', value: rubric.lexicalRange },
    { label: 'Grammatical Accuracy', value: rubric.grammaticalAccuracy },
  ];

  return (
    <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span>{r.label}</span>
            <span className="font-bold">{r.value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                r.value >= 75 ? 'bg-emerald-500' : r.value >= 60 ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(4, r.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DialogueTranscriptBlock({ script }: { script: string }) {
  const turns = parseDialogueTurns(script);
  if (turns.length === 0) {
    return <p className="text-xs leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">{script}</p>;
  }
  return (
    <div className="space-y-1.5">
      {turns.map((turn, idx) => (
        <div
          key={`${turn.speaker}-${idx}`}
          className={`p-2 rounded-lg border text-xs leading-relaxed ${
            turn.speakerIndex % 2 === 0
              ? 'bg-sky-500/8 border-sky-500/20'
              : 'bg-purple-500/8 border-purple-500/20'
          }`}
        >
          <span
            className={`font-mono font-bold mr-1.5 ${
              turn.speakerIndex % 2 === 0
                ? 'text-sky-700 dark:text-sky-300'
                : 'text-purple-700 dark:text-purple-300'
            }`}
          >
            {turn.speaker}:
          </span>
          <span className="text-slate-800 dark:text-slate-200">{turn.text}</span>
        </div>
      ))}
    </div>
  );
}

export const ExamAttemptDetailModal: React.FC<ExamAttemptDetailModalProps> = ({
  attempt,
  onClose,
  onRetakeLevel,
  onDeleteAttempt,
}) => {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReviewFilter('all');
    setCopied(false);
  }, [attempt?.id]);

  useEffect(() => {
    if (!attempt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.stopSpeech();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      soundEngine.stopSpeech();
    };
  }, [attempt, onClose]);

  const matchedExamInfo = useMemo(
    () => (attempt ? resolveExamForAttempt(attempt) : null),
    [attempt]
  );

  if (!attempt) return null;

  const gradeLabel = resolveOfficialGradeLabel(attempt);
  const allReviews = attempt.questionReviews || [];
  const correctReviewsCount = allReviews.filter((r) => r.isCorrect).length;
  const filteredReviews = allReviews.filter((r) => {
    if (reviewFilter === 'missed') return !r.isCorrect;
    if (reviewFilter === 'reading') return r.skill === 'reading';
    if (reviewFilter === 'listening') return r.skill === 'listening';
    return true;
  });

  const writingText = (attempt.writingSubmission || '').trim();
  const speakingText = (attempt.speakingTranscript || '').trim();
  const writingNotes = (attempt.writingNotes || []).filter((n) => n.trim().length > 0);
  const speakingNotes = (attempt.speakingNotes || []).filter((n) => n.trim().length > 0);

  const failedSkills = (['reading', 'listening', 'writing', 'speaking'] as SkillType[]).filter(
    (sk) => !attempt.skills[sk]?.passed
  );

  const handleClose = () => {
    soundEngine.stopSpeech();
    onClose();
  };

  const handleCopyReport = async () => {
    const lines: string[] = [
      'LinguaVerve Past Exam Report',
      `Exam: ${attempt.examTitle} (${attempt.level})`,
      `Certificate: ${attempt.alignedCertificate}`,
      `Date: ${new Date(attempt.timestamp).toLocaleString()}`,
      `Mode: ${attempt.mode.toUpperCase()} | Duration: ${formatExamClock(attempt.durationUsedSeconds)}`,
      `Result: ${attempt.overallScore}% (${attempt.passed ? 'PASSED' : 'RETRY'}) — ${gradeLabel}`,
      '',
      '--- 4-Skill Breakdown ---',
      ...(['reading', 'listening', 'writing', 'speaking'] as SkillType[]).map((sk) => {
        const s = attempt.skills[sk];
        if (!s) return `${SKILL_META[sk].label}: —`;
        const rubricText = s.rubric
          ? ` | Rubric(Task ${s.rubric.taskFulfillment}%, Coherence ${s.rubric.coherenceCohesion}%, Lexical ${s.rubric.lexicalRange}%, Grammar ${s.rubric.grammaticalAccuracy}%)`
          : '';
        return `${SKILL_META[sk].label}: ${s.score}% [${s.passed ? 'PASS' : 'FAIL'}] — ${s.feedback}${rubricText}`;
      }),
    ];
    if (writingText) {
      lines.push('', '--- Writing Submission ---', writingText);
    }
    if (speakingText) {
      lines.push('', '--- Speaking Transcript ---', speakingText);
    }
    if (allReviews.length > 0) {
      lines.push('', '--- Question Review ---');
      for (const r of allReviews) {
        lines.push(
          `${r.isCorrect ? '✓' : '✗'} [${r.sectionTag}] ${r.prompt} | Yours: ${r.chosenOption ?? '(none)'} | Correct: ${r.correctOption}`
        );
      }
    }

    try {
      await navigator.clipboard?.writeText(lines.join('\n'));
      soundEngine.playClickSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in headless tests
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Past Exam Report: ${attempt.examTitle}`}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Past Simulated Exam Dossier
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {attempt.languageId === 'german' ? '🇩🇪' : '🇬🇧'} {attempt.examTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            {onRetakeLevel && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.stopSpeech();
                  soundEngine.playClickSound();
                  onClose();
                  onRetakeLevel(attempt.languageId, attempt.level);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake {attempt.level}</span>
              </button>
            )}

            {onDeleteAttempt && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.stopSpeech();
                  soundEngine.playClickSound();
                  onDeleteAttempt(attempt.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                aria-label="Delete exam attempt"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close exam details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Hero Summary Banner */}
          <section
            className={`p-5 rounded-2xl border space-y-3 ${
              attempt.passed
                ? 'bg-emerald-500/8 border-emerald-500/25'
                : 'bg-amber-500/8 border-amber-500/25'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                  <span
                    className={`px-2.5 py-0.5 rounded-full ${
                      attempt.passed
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {attempt.passed ? 'CERTIFICATION PASSED' : 'NEEDS RETRY'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    CEFR {attempt.level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                    {gradeLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {attempt.alignedCertificate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(attempt.timestamp).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    Time: {formatExamClock(attempt.durationUsedSeconds)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    {attempt.mode === 'strict' ? 'Strict Exam Mode' : 'Practice Mode'}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-right">
                <div
                  className={`text-3xl font-mono font-extrabold tabular-nums ${
                    attempt.passed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {attempt.overallScore}%
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Overall Score
                </div>
              </div>
            </div>

            {!attempt.passed && failedSkills.length > 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Skills below pass threshold:{' '}
                <span className="font-semibold">
                  {failedSkills.map((s) => SKILL_META[s].label).join(', ')}
                </span>
                . Review your answers and official benchmarks below before retaking.
              </p>
            )}
          </section>

          {/* 4-Skill Scorecard Grid */}
          <section className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              4-Skill Examiner Scorecard &amp; CEFR Rubric
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(['reading', 'listening', 'writing', 'speaking'] as SkillType[]).map((sk) => {
                const meta = SKILL_META[sk];
                const Icon = meta.icon;
                const scoreObj = attempt.skills[sk];
                if (!scoreObj) return null;
                return (
                  <div
                    key={sk}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {scoreObj.aiGraded && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                            AI
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            scoreObj.passed
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {scoreObj.passed ? 'PASS' : 'FAIL'}
                        </span>
                        <span
                          className={`font-mono font-extrabold text-base tabular-nums ${
                            scoreObj.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {scoreObj.score}%
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scoreObj.passed ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, scoreObj.score)}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {scoreObj.feedback}
                    </p>

                    {scoreObj.rubric && <RubricProgressBars rubric={scoreObj.rubric} />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Written & Spoken Submissions + Action Notes */}
          {(writingText || speakingText || writingNotes.length > 0 || speakingNotes.length > 0) && (
            <section className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Your Submissions &amp; Examiner Notes
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(writingText || writingNotes.length > 0) && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-amber-800 dark:text-amber-300">
                      <PenTool className="w-4 h-4" />
                      <span>Writing Submission</span>
                    </div>
                    {writingText && (
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed p-3 rounded-lg bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        {writingText}
                      </pre>
                    )}
                    {writingNotes.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
                          Examiner Action Notes
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {writingNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {(speakingText || speakingNotes.length > 0) && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        <Mic className="w-4 h-4" />
                        <span>Speaking Transcript</span>
                      </div>
                      {speakingText && (
                        <button
                          type="button"
                          onClick={() => soundEngine.speak(speakingText, attempt.languageId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen Back</span>
                        </button>
                      )}
                    </div>
                    {speakingText && (
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed p-3 rounded-lg bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        {speakingText}
                      </pre>
                    )}
                    {speakingNotes.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          Examiner Action Notes
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {speakingNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Question-by-Question Reading & Listening Review */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Question-by-Question Review
                {allReviews.length > 0 ? ` (${correctReviewsCount}/${allReviews.length} Correct)` : ''}
              </h3>
              {allReviews.length > 0 && (
                <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                  {(
                    [
                      ['all', 'All'],
                      ['missed', 'Missed Only'],
                      ['reading', 'Reading'],
                      ['listening', 'Listening'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReviewFilter(key)}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        reviewFilter === key
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {allReviews.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  This attempt was saved before per-question answer capture was enabled. Your 4-skill
                  scores, rubric bars, and submissions are displayed above, and all new simulated exams
                  automatically save every Reading &amp; Listening item here.
                </span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                No items match this filter — great work!
              </div>
            ) : (
              <div className="space-y-2">
                {filteredReviews.map((item) => (
                  <div
                    key={`${item.sectionTag}-${item.id}`}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      item.isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                            item.skill === 'reading'
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                              : 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {item.sectionTag}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.prompt}
                        </span>
                      </div>
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>

                    {!item.isCorrect && (
                      <div className="text-rose-700 dark:text-rose-300 font-medium">
                        Your answer: {item.chosenOption ?? '(No answer selected)'}
                      </div>
                    )}
                    <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Correct answer: {item.correctOption}
                    </div>
                    {item.explanation && (
                      <div className="text-slate-600 dark:text-slate-400">{item.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matched Exam Reference Benchmarks (Transcripts & Models) */}
          {matchedExamInfo && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
              <details className="group">
                <summary className="cursor-pointer list-none px-4 py-3.5 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  <span>Reference Benchmarks: Listening Dialogues &amp; Model Answers</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>

                <div className="px-4 pb-4 space-y-4 border-t border-slate-200/80 dark:border-slate-800 pt-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    {matchedExamInfo.isExactMatch
                      ? `Exact exam edition matched: ${matchedExamInfo.exam.title}`
                      : `Original AI edition was removed — showing official ${attempt.level} benchmark reference.`}
                  </div>

                  {/* Listening Tracks */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-mono font-bold uppercase text-purple-700 dark:text-purple-300">
                      Unlocked Multi-Speaker Listening Dialogues
                    </h4>
                    {getExamListeningTracks(matchedExamInfo.exam).map((track, idx) => (
                      <div
                        key={track.id}
                        className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Track {idx + 1} · {getAccentBadge(track.accentCode)} — {track.partLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speak(
                                track.audioScript,
                                matchedExamInfo.exam.languageId,
                                false,
                                track.accentCode
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-700 dark:text-slate-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Replay</span>
                          </button>
                        </div>
                        <DialogueTranscriptBlock script={track.audioScript} />
                      </div>
                    ))}
                  </div>

                  {/* Model Writing */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono font-bold uppercase text-amber-700 dark:text-amber-300">
                      Official Model Writing Benchmarks
                    </h4>
                    {getExamWritingTasks(matchedExamInfo.exam).map((task, idx) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">
                          Task {idx + 1} ({task.weightPercent}%) · {task.partLabel}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {task.modelAnswer}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Model Speaking */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300">
                      Official Model Speaking Scripts
                    </h4>
                    {getExamSpeakingParts(matchedExamInfo.exam).map((part, idx) => (
                      <div
                        key={part.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Part {idx + 1} · {part.partLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speak(
                                part.modelResponseScript,
                                matchedExamInfo.exam.languageId
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Hear Model</span>
                          </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {part.modelResponseScript}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
