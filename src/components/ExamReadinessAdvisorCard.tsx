import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Bot,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Timer,
  Award,
  ListChecks,
} from 'lucide-react';
import {
  AIProviderConfig,
  CEFRLevel,
  ExamAttemptRecord,
  ExamHistoryReadinessReport,
  ExamReadinessVerdict,
  SkillType,
} from '../types';
import { isAIConfigReady } from '../utils/aiClient';
import { soundEngine } from '../utils/audio';
import {
  analyzeExamHistoryReadinessWithAIOrFallback,
  buildCoachSeedFromReadinessReport,
  buildOfflineReadinessReport,
} from '../utils/examAssessment';
import { LearningLanguageId, normalizeLearningLanguageId } from '../data/languages';

interface ExamReadinessAdvisorCardProps {
  attempts: ExamAttemptRecord[];
  filterLang: 'all' | LearningLanguageId;
  savedReport?: ExamHistoryReadinessReport;
  aiConfig?: AIProviderConfig;
  onOpenAISettings?: () => void;
  onSaveReadinessReport?: (report: ExamHistoryReadinessReport) => void;
  onLaunchExam?: (languageId: string, level: CEFRLevel) => void;
  onLaunchAICoach?: (languageId: string, level: CEFRLevel, skill: SkillType, seedPrompt?: string) => void;
}

const ALL_SKILLS: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];
const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const SKILL_META: Record<
  SkillType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  reading: { label: 'Reading', icon: BookOpen },
  listening: { label: 'Listening', icon: Headphones },
  writing: { label: 'Writing', icon: PenTool },
  speaking: { label: 'Speaking', icon: Mic },
};

function verdictStyles(verdict: ExamReadinessVerdict) {
  switch (verdict) {
    case 'ready':
      return {
        badge: 'READY FOR REAL EXAM',
        boxClass: 'bg-emerald-500/8 border-emerald-500/30',
        pillClass: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300',
        scoreClass: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'almost-ready':
      return {
        badge: 'ALMOST READY · SHORT POLISH',
        boxClass: 'bg-sky-500/8 border-sky-500/30',
        pillClass: 'bg-sky-500/20 text-sky-800 dark:text-sky-300',
        scoreClass: 'text-sky-600 dark:text-sky-400',
      };
    default:
      return {
        badge: 'MORE PRACTICE NEEDED',
        boxClass: 'bg-amber-500/8 border-amber-500/30',
        pillClass: 'bg-amber-500/20 text-amber-800 dark:text-amber-300',
        scoreClass: 'text-amber-600 dark:text-amber-400',
      };
  }
}

export const ExamReadinessAdvisorCard: React.FC<ExamReadinessAdvisorCardProps> = ({
  attempts,
  filterLang,
  savedReport,
  aiConfig,
  onOpenAISettings,
  onSaveReadinessReport,
  onLaunchExam,
  onLaunchAICoach,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);
  const [localReport, setLocalReport] = useState<ExamHistoryReadinessReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setSelectedLevel(null);
  }, [filterLang]);

  const relevantExams = useMemo(
    () => (filterLang === 'all' ? attempts : attempts.filter((a) => a.languageId === filterLang)),
    [attempts, filterLang]
  );

  const availableLevels = useMemo(() => {
    const set = new Set(relevantExams.map((a) => a.level));
    return LEVEL_ORDER.filter((lvl) => set.has(lvl));
  }, [relevantExams]);

  const activeTargetLevel: CEFRLevel | undefined =
    selectedLevel && availableLevels.includes(selectedLevel)
      ? selectedLevel
      : relevantExams[0]?.level;

  const activeLanguageId: string | undefined =
    filterLang !== 'all' ? filterLang : relevantExams[0]?.languageId;

  const matchingAttemptsCount = useMemo(
    () =>
      relevantExams.filter(
        (a) =>
          (!activeLanguageId || a.languageId === activeLanguageId) &&
          (!activeTargetLevel || a.level === activeTargetLevel)
      ).length,
    [relevantExams, activeLanguageId, activeTargetLevel]
  );

  const displayedReport = useMemo<ExamHistoryReadinessReport | null>(() => {
    if (relevantExams.length === 0) return null;
    const candidate = localReport || savedReport;
    if (
      candidate &&
      candidate.source === 'ai' &&
      (!activeLanguageId || candidate.languageId === activeLanguageId) &&
      (!activeTargetLevel || candidate.targetLevel === activeTargetLevel) &&
      candidate.attemptsAnalyzed === matchingAttemptsCount
    ) {
      return candidate;
    }
    return buildOfflineReadinessReport({
      attempts: relevantExams,
      languageId: activeLanguageId,
      targetLevel: activeTargetLevel,
    });
  }, [relevantExams, localReport, savedReport, activeLanguageId, activeTargetLevel, matchingAttemptsCount]);

  const aiReady = Boolean(aiConfig && isAIConfigReady(aiConfig));

  const handleAnalyzeWithAI = async () => {
    if (!aiConfig || !isAIConfigReady(aiConfig) || isAnalyzing || relevantExams.length === 0) return;
    setIsAnalyzing(true);
    try {
      const report = await analyzeExamHistoryReadinessWithAIOrFallback({
        config: aiConfig,
        attempts: relevantExams,
        languageId: activeLanguageId,
        targetLevel: activeTargetLevel,
      });
      if (report) {
        setLocalReport(report);
        onSaveReadinessReport?.(report);
        soundEngine.playSuccessChime();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section
      aria-label="Real Exam Readiness Advisor"
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/25 shadow-sm space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Real Exam Readiness Advisor</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Should You Book the Official Exam or Practice More?
          </h2>
          {displayedReport && (
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Evaluated by: {displayedReport.providerLabel} · Based on {displayedReport.attemptsAnalyzed}{' '}
              {displayedReport.targetLevel} attempt{displayedReport.attemptsAnalyzed === 1 ? '' : 's'}
            </div>
          )}
        </div>

        {relevantExams.length > 0 && (
          <div className="shrink-0">
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing exam history...</span>
              </span>
            ) : aiReady ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  void handleAnalyzeWithAI();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {displayedReport?.source === 'ai'
                    ? 'Re-analyze History with AI'
                    : 'Analyze History with AI'}
                </span>
              </button>
            ) : onOpenAISettings ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenAISettings();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>Connect AI for Readiness Advice</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!displayedReport ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white">
              Complete at least 1 simulated exam to unlock AI Real-Exam Readiness Analysis.
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Your configured AI provider evaluates your score trend, Strict-mode proof, and 4-skill consistency to advise whether you’re ready to book the official test.
            </p>
          </div>
          {onLaunchExam && (
            <button
              type="button"
              onClick={() =>
                onLaunchExam(filterLang === 'all' ? 'english' : normalizeLearningLanguageId(filterLang), 'B1')
              }
              className="px-3.5 py-2 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white shrink-0"
            >
              Open Exam Arena
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Level Selector if multiple CEFR levels exist in history */}
          {availableLevels.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-mono font-bold text-[11px] text-slate-500 mr-1">
                Target Level:
              </span>
              {availableLevels.map((lvl) => {
                const active = activeTargetLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      soundEngine.playClickSound();
                      setSelectedLevel(lvl);
                    }}
                    className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold transition-colors ${
                      active
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Verdict Banner */}
          {(() => {
            const style = verdictStyles(displayedReport.verdict);
            return (
              <div className={`p-4 rounded-xl border space-y-3 ${style.boxClass}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${style.pillClass}`}
                    >
                      {displayedReport.verdict === 'ready' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : displayedReport.verdict === 'almost-ready' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>{style.badge}</span>
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {displayedReport.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {displayedReport.rationale}
                    </p>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-right shrink-0">
                    <div className={`text-3xl font-mono font-extrabold tabular-nums ${style.scoreClass}`}>
                      {displayedReport.readinessScore}%
                    </div>
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Readiness
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/75 dark:bg-slate-900/70">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    {displayedReport.estimatedPrepTime}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/75 dark:bg-slate-900/70">
                    {displayedReport.recentTrend === 'improving' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : displayedReport.recentTrend === 'declining' ? (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    Trend: {displayedReport.recentTrend}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/75 dark:bg-slate-900/70">
                    <Timer className="w-3.5 h-3.5 text-indigo-500" />
                    Strict Exams: {displayedReport.strictAttemptsCount}/{displayedReport.attemptsAnalyzed}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/75 dark:bg-slate-900/70">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Pass Rate: {displayedReport.passRatePercent}% · Confidence: {displayedReport.confidence}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* 4-Skill Readiness Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_SKILLS.map((sk) => {
              const stat = displayedReport.skillReadiness[sk];
              const meta = SKILL_META[sk];
              const Icon = meta.icon;
              if (!stat) return null;
              const badgeClass =
                stat.status === 'ready'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : stat.status === 'borderline'
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300';
              const barClass =
                stat.status === 'ready'
                  ? 'bg-emerald-500'
                  : stat.status === 'borderline'
                  ? 'bg-sky-500'
                  : 'bg-amber-500';
              return (
                <div
                  key={sk}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      {meta.label}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${badgeClass}`}>
                      {stat.status === 'needs-work' ? 'Practice' : stat.status}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">Avg {stat.averageScore}%</span>
                    <span className="text-slate-500">Latest {stat.latestScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barClass}`}
                      style={{ width: `${Math.max(4, stat.averageScore)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {stat.note}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Readiness Proof vs Blocking Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {displayedReport.strengths.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 space-y-1.5">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Readiness Proof</span>
                </div>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                  {displayedReport.strengths.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {displayedReport.blockingRisks.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 space-y-1.5">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Risks to Address Before Booking</span>
                </div>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                  {displayedReport.blockingRisks.map((r, idx) => (
                    <li key={idx}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommended Next Steps */}
          {displayedReport.nextSteps.length > 0 && (
            <div className="p-3.5 rounded-xl bg-sky-500/8 border border-sky-500/20 space-y-1.5 text-xs">
              <div className="font-mono font-bold uppercase text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                <span>Recommended Next Steps</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                {displayedReport.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Shortcuts */}
          {(onLaunchExam || onLaunchAICoach) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onLaunchExam && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    onLaunchExam(displayedReport.languageId, displayedReport.targetLevel);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Take Strict {displayedReport.targetLevel} Exam</span>
                </button>
              )}
              {onLaunchAICoach && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    onLaunchAICoach(
                      displayedReport.languageId,
                      displayedReport.targetLevel,
                      displayedReport.prioritySkill,
                      buildCoachSeedFromReadinessReport(displayedReport)
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    Drill {SKILL_META[displayedReport.prioritySkill].label} in AI Coach
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
