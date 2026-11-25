import React, { useState } from 'react';
import {
  ClipboardCheck,
  Volume2,
  ArrowRight,
  RotateCcw,
  Award,
  CheckCircle2,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  GraduationCap,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { CEFRLevel, PreTestResult, SkillType } from '../types';
import { getPreTestQuestions, evaluatePreTest, CEFR_LEVELS } from '../data';
import { soundEngine } from '../utils/audio';

interface PreTestViewProps {
  activeLanguageId: string;
  onSelectLanguage: (langId: string) => void;
  latestPreTest?: PreTestResult;
  onCompletePreTest: (result: PreTestResult) => void;
  onJumpToCourse: (languageId: string, level: CEFRLevel) => void;
  onLaunchExam: (languageId: string, level: CEFRLevel) => void;
}

const SKILL_LABELS: Record<SkillType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  reading: { label: 'Reading', icon: BookOpen },
  listening: { label: 'Listening / Hearing', icon: Headphones },
  writing: { label: 'Writing & Syntax', icon: PenTool },
  speaking: { label: 'Speaking & Pragmatics', icon: Mic },
};

export const PreTestView: React.FC<PreTestViewProps> = ({
  activeLanguageId,
  onSelectLanguage,
  latestPreTest,
  onCompletePreTest,
  onJumpToCourse,
  onLaunchExam,
}) => {
  const testLang = activeLanguageId === 'german' ? 'german' : 'english';
  const questions = getPreTestQuestions(testLang);

  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PreTestResult | null>(
    latestPreTest && latestPreTest.languageId === testLang ? latestPreTest : null
  );

  const handleSwitchLanguage = (lang: string) => {
    soundEngine.playClickSound();
    onSelectLanguage(lang);
    setStarted(false);
    setCurrentIdx(0);
    setAnswers({});
    setPlayCounts({});
    setResult(latestPreTest && latestPreTest.languageId === lang ? latestPreTest : null);
  };

  const handleStart = () => {
    soundEngine.playClickSound();
    setStarted(true);
    setCurrentIdx(0);
    setAnswers({});
    setPlayCounts({});
    setResult(null);
  };

  const currentQuestion = questions[currentIdx];

  const handlePlayAudio = (qId: string, script: string) => {
    const used = playCounts[qId] || 0;
    if (used >= 2) return;
    soundEngine.playClickSound();
    setPlayCounts((prev) => ({ ...prev, [qId]: used + 1 }));
    soundEngine.speak(script, testLang, false);
  };

  const handleSelectOption = (optionIdx: number) => {
    soundEngine.playClickSound();
    const updated = { ...answers, [currentQuestion.id]: optionIdx };
    setAnswers(updated);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      soundEngine.stopSpeech();
      soundEngine.playSuccessChime();
      const evaluated = evaluatePreTest(testLang, updated);
      setResult(evaluated);
      setStarted(false);
      onCompletePreTest(evaluated);
    }
  };

  const verifiedLevelDetail = result
    ? CEFR_LEVELS.find((l) => l.id === result.verifiedLevel)
    : undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro & Language Selector */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Scored 4-Skill CEFR Placement Pre-Test</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Verify Your Real CEFR Level &amp; Get Your Course Bundle
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Unlike self-assessments, this 12-item progressive test evaluates actual <strong>Reading</strong>,{' '}
            <strong>Listening / Hearing</strong> (with real audio), <strong>Writing/Grammar</strong>, and{' '}
            <strong>Speaking Pragmatics</strong> from A1 to C2, then builds your personalized multi-course study bundle.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={() => handleSwitchLanguage('english')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              testLang === 'english'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            🇬🇧 English Pre-Test
          </button>
          <button
            type="button"
            onClick={() => handleSwitchLanguage('german')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              testLang === 'german'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            🇩🇪 German Pre-Test
          </button>
        </div>
      </section>

      {/* Active Test Runner */}
      {started && currentQuestion && (
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 max-w-3xl mx-auto">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                Item {currentIdx + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold">
                  Tier: {currentQuestion.level}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                  {SKILL_LABELS[currentQuestion.skill].label}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Reading Passage if any */}
          {currentQuestion.passage && (
            <blockquote className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-l-4 border-sky-500 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentQuestion.passage}
            </blockquote>
          )}

          {/* Audio Player if Listening / Hearing */}
          {currentQuestion.audioScript && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                  <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Listening &amp; Hearing Prompt (Max 2 Plays)</span>
                </div>
                <span className="text-xs font-mono text-purple-700 dark:text-purple-300">
                  Replays left: {Math.max(0, 2 - (playCounts[currentQuestion.id] || 0))}/2
                </span>
              </div>
              <button
                type="button"
                disabled={(playCounts[currentQuestion.id] || 0) >= 2}
                onClick={() => handlePlayAudio(currentQuestion.id, currentQuestion.audioScript || '')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-400 text-white transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>
                  {(playCounts[currentQuestion.id] || 0) >= 2 ? 'Audio Replays Used' : 'Play Spoken Audio'}
                </span>
              </button>
            </div>
          )}

          {/* Question Prompt */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {currentQuestion.prompt}
          </h2>

          {/* Answer Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className="w-full p-4 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all flex items-start gap-3 group"
              >
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{option}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ready Screen (When Not Started & No Result Yet) */}
      {!started && !result && (
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {testLang === 'german' ? '🇩🇪 German' : '🇬🇧 English'} 4-Skill Placement Pre-Test
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              12 calibrated items climbing from A1 to C2 (~5 minutes). Includes spoken audio items for Listening/Hearing verification. Your result is automatically saved to Progress &amp; History.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">Reading (3)</div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">Listening (3)</div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">Writing (3)</div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">Speaking (3)</div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 shadow-sm transition-colors"
          >
            <span>Start Scored Pre-Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Placement Result & Collective Course Bundle Recommendations */}
      {!started && result && (
        <div className="space-y-6 animate-fadeIn">
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Verified Placement Result · {result.languageId === 'german' ? '🇩🇪 German' : '🇬🇧 English'}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Verified Level: {result.verifiedLevel} — {verifiedLevelDetail?.stageName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Score: <strong>{result.correctCount}/{result.totalCount} ({result.overallScore}%)</strong> · Target Certificate:{' '}
                    <strong>{result.suggestedCertificate}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onLaunchExam(result.languageId, result.verifiedLevel)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Try {result.verifiedLevel} Simulated Exam</span>
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Pre-Test</span>
                </button>
              </div>
            </div>

            {/* 4-Skill Placement Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(['reading', 'listening', 'writing', 'speaking'] as SkillType[]).map((skill) => {
                const score = result.skillScores[skill];
                const meta = SKILL_LABELS[skill];
                const Icon = meta.icon;
                const isWeak = score < 65;
                return (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{meta.label}</span>
                      </span>
                      <span className={`font-mono font-bold ${isWeak ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWeak ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    {isWeak && (
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Priority Focus Skill
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Collective Course Path Recommendation */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Personalized Zero-to-Hero Study Bundle (Auto-Enrolled)
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Recommended Collective Intensive Courses
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.recommendedCourses.map((step, i) => (
                  <div
                    key={step.courseId}
                    className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950">
                          Step {i + 1} · {step.role}
                        </span>
                        <span className="font-mono font-bold text-xs text-sky-700 dark:text-sky-400">
                          CEFR {step.level}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.reason}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {step.prioritySkills.map((sk) => (
                          <span key={sk} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300">
                            Focus: {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onJumpToCourse(result.languageId, step.level)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 hover:border-sky-500 transition-colors"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Open {step.level} Intensive Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Answer Key Review (if user just completed the test in this session) */}
          {Object.keys(answers).length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Diagnostic Answer Review
              </h3>
              <div className="space-y-2.5">
                {questions.map((q) => {
                  const chosen = answers[q.id];
                  const correct = chosen === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        correct
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-rose-50/50 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold">
                        <span className="text-slate-900 dark:text-white">
                          [{q.level} · {q.skill}] {q.prompt}
                        </span>
                        <span className={`font-mono shrink-0 ${correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                          {correct ? '✓ Correct' : '✗ Missed'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-600" />
                        <strong>Answer:</strong> {q.options[q.correctIndex]} — {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
