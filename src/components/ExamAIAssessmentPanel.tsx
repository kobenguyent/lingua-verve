import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wand2,
  Volume2,
  Copy,
  Check,
  Loader2,
  Bot,
  Target,
  Star,
  ArrowRight,
} from 'lucide-react';
import {
  ExamAIAssessment,
  ExamAttemptRecord,
  SkillType,
} from '../types';
import { soundEngine } from '../utils/audio';

interface ExamAIAssessmentPanelProps {
  attempt: ExamAttemptRecord;
  assessment: ExamAIAssessment;
  aiReady: boolean;
  isAnalyzing?: boolean;
  onRunAIAnalysis?: () => void;
  onOpenAISettings?: () => void;
  onPracticeSkillInCoach?: (skill: SkillType) => void;
}

const ALL_SKILLS: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];

const SKILL_META: Record<
  SkillType,
  { label: string; short: string; icon: React.ComponentType<{ className?: string }> }
> = {
  reading: { label: 'Reading', short: 'Reading', icon: BookOpen },
  listening: { label: 'Listening / Hearing', short: 'Listening', icon: Headphones },
  writing: { label: 'Writing', short: 'Writing', icon: PenTool },
  speaking: { label: 'Speaking', short: 'Speaking', icon: Mic },
};

export const ExamAIAssessmentPanel: React.FC<ExamAIAssessmentPanelProps> = ({
  attempt,
  assessment,
  aiReady,
  isAnalyzing = false,
  onRunAIAnalysis,
  onOpenAISettings,
  onPracticeSkillInCoach,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillType>(assessment.prioritySkill);
  const [copiedUpgrade, setCopiedUpgrade] = useState(false);

  useEffect(() => {
    setSelectedSkill(assessment.prioritySkill);
  }, [attempt.id, assessment.prioritySkill]);

  const activeInsight = assessment.skillInsights[selectedSkill];

  const handleCopyUpgrade = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      soundEngine.playClickSound();
      setCopiedUpgrade(true);
      setTimeout(() => setCopiedUpgrade(false), 2000);
    } catch {
      // Clipboard may be unavailable in headless tests
    }
  };

  return (
    <section
      aria-label="4-Skill AI Examiner Assessment"
      className="p-5 rounded-2xl bg-indigo-500/[0.05] dark:bg-indigo-950/25 border border-indigo-500/25 space-y-4"
    >
      {/* Executive Diagnostic Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {assessment.source === 'ai'
                ? 'AI 4-Skill Examiner Assessment'
                : '4-Skill Diagnostic Assessment'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Evaluated by: {assessment.providerLabel}
          </div>
        </div>

        <div className="shrink-0">
          {isAnalyzing ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing all 4 skills with AI...</span>
            </span>
          ) : aiReady && onRunAIAnalysis ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickSound();
                onRunAIAnalysis();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {assessment.source === 'ai' ? 'Re-analyze with AI' : 'Run AI 4-Skill Analysis'}
              </span>
            </button>
          ) : !aiReady && onOpenAISettings ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickSound();
                onOpenAISettings();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-500"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Connect AI for Deeper Analysis</span>
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
        {assessment.overallSummary}
      </p>

      {/* Executive Verdict & Strongest / Priority Badges */}
      <div className="flex flex-wrap gap-2 text-[11px] font-mono font-bold">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
            attempt.passed
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{assessment.readinessVerdict}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <Star className="w-3.5 h-3.5" />
          <span>
            Strongest: {SKILL_META[assessment.strongestSkill].short} (
            {attempt.skills[assessment.strongestSkill]?.score ?? 0}%)
          </span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Target className="w-3.5 h-3.5" />
          <span>
            Priority Focus: {SKILL_META[assessment.prioritySkill].short} (
            {attempt.skills[assessment.prioritySkill]?.score ?? 0}%)
          </span>
        </span>
      </div>

      {/* Interactive 4-Skill Tab Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ALL_SKILLS.map((sk) => {
          const meta = SKILL_META[sk];
          const Icon = meta.icon;
          const isSelected = selectedSkill === sk;
          const score = attempt.skills[sk]?.score ?? 0;
          const passedSkill = attempt.skills[sk]?.passed ?? false;
          const aiDone = assessment.skillInsights[sk]?.aiAnalyzed;

          return (
            <button
              key={sk}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                soundEngine.playClickSound();
                setSelectedSkill(sk);
              }}
              className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold flex items-center gap-1">
                  <span className="truncate">{meta.short}</span>
                  {aiDone && <Sparkles className="w-3 h-3 shrink-0 opacity-90" />}
                </div>
                <div className="text-[10px] font-mono opacity-85">
                  {score}% · {passedSkill ? 'PASS' : 'FOCUS'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Skill Deep Insight Card */}
      {activeInsight && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {SKILL_META[activeInsight.skill].label} Insights
              </h4>
              {activeInsight.cefrEstimate && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  Est. {activeInsight.cefrEstimate}
                </span>
              )}
              {activeInsight.aiAnalyzed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                  AI Analyzed
                </span>
              )}
            </div>

            {onPracticeSkillInCoach && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onPracticeSkillInCoach(activeInsight.skill);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Drill {SKILL_META[activeInsight.skill].short} in AI Coach</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeInsight.summary}
          </p>

          {/* Strengths & Patterns/Weaknesses */}
          {(activeInsight.strengths.length > 0 || activeInsight.weaknesses.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeInsight.strengths.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>What Worked Well</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {activeInsight.strengths.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeInsight.weaknesses.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Patterns &amp; Gaps Found</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {activeInsight.weaknesses.map((w, idx) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Structured Before -> After Corrections */}
          {activeInsight.corrections.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Targeted Corrections ({activeInsight.corrections.length})</span>
              </div>
              <div className="space-y-2">
                {activeInsight.corrections.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-purple-500/20 space-y-1 text-xs"
                  >
                    {item.sectionTag && (
                      <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                        {item.sectionTag}
                      </span>
                    )}
                    {item.original && (
                      <div className="text-rose-700 dark:text-rose-300">
                        <span className="font-bold mr-1">✗</span>
                        {item.original}
                      </div>
                    )}
                    {item.corrected && (
                      <div className="text-emerald-700 dark:text-emerald-300 font-semibold">
                        <span className="font-bold mr-1">✓</span>
                        {item.corrected}
                      </div>
                    )}
                    {item.explanation && (
                      <div className="text-slate-600 dark:text-slate-400">{item.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions */}
          {activeInsight.suggestions.length > 0 && (
            <div className="p-3 rounded-xl bg-sky-500/8 border border-sky-500/20 space-y-1.5 text-xs">
              <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Actionable Suggestions for {SKILL_META[activeInsight.skill].short}</span>
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                {activeInsight.suggestions.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Upgraded Higher-Band Rewrite */}
          {activeInsight.upgradedVersion && (
            <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/25 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Higher-Band Rewrite ({attempt.level}+)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {activeInsight.skill === 'speaking' && (
                    <button
                      type="button"
                      onClick={() =>
                        soundEngine.speak(activeInsight.upgradedVersion!, attempt.languageId)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Rewrite</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleCopyUpgrade(activeInsight.upgradedVersion!)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200"
                  >
                    {copiedUpgrade ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedUpgrade ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeInsight.upgradedVersion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prioritized Study Action Plan */}
      {assessment.studyPlan.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Prioritized Study Action Plan
          </h4>
          <div className="space-y-2">
            {assessment.studyPlan.map((step) => (
              <div
                key={`${step.priority}-${step.skill}-${step.title}`}
                className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0">
                    #{step.priority}
                  </span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {step.title}{' '}
                      <span className="font-mono font-normal text-[11px] text-slate-500">
                        · {step.targetMinutes}m
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{step.action}</p>
                  </div>
                </div>

                {onPracticeSkillInCoach && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClickSound();
                      onPracticeSkillInCoach(step.skill);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shrink-0"
                  >
                    <span>Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
