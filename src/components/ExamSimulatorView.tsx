import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  ShieldAlert,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import {
  AIProviderConfig,
  CEFRLevel,
  ExamAttemptRecord,
  MockExam,
  SkillType,
} from '../types';
import { MOCK_EXAMS } from '../data';
import { evaluateWithAIOrFallback, isAIConfigReady } from '../utils/aiClient';
import { soundEngine } from '../utils/audio';
import {
  isSpeechRecognitionSupported,
  SpeechRecorderHandle,
  startSpeechRecognition,
} from '../utils/speechRecognition';

interface ExamSimulatorViewProps {
  activeLanguageId: string;
  onSelectLanguage: (langId: string) => void;
  initialLevel?: CEFRLevel;
  aiConfig: AIProviderConfig;
  onOpenAISettings: () => void;
  onCompleteExam: (record: ExamAttemptRecord) => void;
}

const SECTION_ORDER: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];

const SECTION_LABELS: Record<SkillType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  reading: { label: '1. Reading', icon: BookOpen },
  listening: { label: '2. Listening / Hearing', icon: Headphones },
  writing: { label: '3. Writing', icon: PenTool },
  speaking: { label: '4. Speaking', icon: Mic },
};

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  activeLanguageId,
  onSelectLanguage,
  initialLevel,
  aiConfig,
  onOpenAISettings,
  onCompleteExam,
}) => {
  const examLang = activeLanguageId === 'german' ? 'german' : 'english';
  const availableExams = MOCK_EXAMS.filter((e) => e.languageId === examLang);

  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(initialLevel || 'B1');
  const [mode, setMode] = useState<'strict' | 'practice'>('strict');
  const [phase, setPhase] = useState<'lobby' | 'running' | 'grading' | 'report'>('lobby');
  const [activeSection, setActiveSection] = useState<SkillType>('reading');

  // Exam timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Answers state
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({});
  const [listeningPlays, setListeningPlays] = useState(0);
  const [writingText, setWritingText] = useState('');
  const [speakingText, setSpeakingText] = useState('');

  // Speaking timers & voice recognition
  const [prepLeft, setPrepLeft] = useState(0);
  const [speakLeft, setSpeakLeft] = useState(0);
  const [isPrepping, setIsPrepping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micNote, setMicNote] = useState('');
  const recorderRef = useRef<SpeechRecorderHandle | null>(null);

  const [report, setReport] = useState<ExamAttemptRecord | null>(null);
  const [gradingDetails, setGradingDetails] = useState<{
    writingStrengths: string[];
    writingCorrections: string[];
    writingUpgraded: string;
    speakingStrengths: string[];
    speakingCorrections: string[];
    speakingUpgraded: string;
  } | null>(null);

  useEffect(() => {
    if (initialLevel) {
      setSelectedLevel(initialLevel);
    }
  }, [initialLevel]);

  const currentExam: MockExam =
    availableExams.find((e) => e.level === selectedLevel) || availableExams[0];

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  // Master exam countdown
  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) => {
        if (prev <= 1 && mode === 'strict') {
          return 0;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, mode]);

  // Auto-submit in strict mode when clock reaches 0
  useEffect(() => {
    if (phase === 'running' && mode === 'strict' && remainingSeconds === 0 && elapsedSeconds > 2) {
      void handleSubmitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase, mode]);

  // Speaking prep countdown
  useEffect(() => {
    if (!isPrepping || prepLeft <= 0) return;
    const t = setInterval(() => {
      setPrepLeft((p) => {
        if (p <= 1) {
          setIsPrepping(false);
          soundEngine.playClickSound();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPrepping, prepLeft]);

  // Speaking live countdown
  useEffect(() => {
    if (!isRecording || speakLeft <= 0) return;
    const t = setInterval(() => {
      setSpeakLeft((s) => {
        if (s <= 1) {
          stopRecording();
          soundEngine.playClickSound();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRecording, speakLeft]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      soundEngine.stopSpeech();
    };
  }, []);

  const handleStartExam = () => {
    soundEngine.playClickSound();
    setPhase('running');
    setActiveSection('reading');
    setRemainingSeconds(currentExam.totalMinutes * 60);
    setElapsedSeconds(0);
    setReadingAnswers({});
    setListeningAnswers({});
    setListeningPlays(0);
    setWritingText('');
    setSpeakingText('');
    setPrepLeft(currentExam.speaking.prepSeconds);
    setSpeakLeft(currentExam.speaking.speakSeconds);
    setIsPrepping(false);
    setIsRecording(false);
    setMicNote('');
    setReport(null);
    setGradingDetails(null);
  };

  const handlePlayListening = () => {
    if (mode === 'strict' && listeningPlays >= currentExam.listening.maxPlaysStrict) {
      return;
    }
    soundEngine.playClickSound();
    setListeningPlays((p) => p + 1);
    soundEngine.speak(currentExam.listening.audioScript, currentExam.languageId, false);
  };

  const handleToggleMic = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    setIsPrepping(false);
    setSpeakLeft(currentExam.speaking.speakSeconds);
    setMicNote('');

    if (!isSpeechRecognitionSupported()) {
      setMicNote('Live browser speech-to-text is unavailable in this browser. Type your spoken response below — timing & AI grading still work fully!');
      setIsRecording(true);
      return;
    }

    const baseText = speakingText.trim();
    const handle = startSpeechRecognition({
      languageId: currentExam.languageId,
      onTranscript: (finalChunk, interim) => {
        const combined = [baseText, finalChunk, interim].filter(Boolean).join(' ');
        setSpeakingText(combined);
      },
      onError: (code) => {
        setMicNote(`Microphone note (${code}): You can continue typing your spoken answer below.`);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (handle) {
      recorderRef.current = handle;
      setIsRecording(true);
    }
  };

  const handleSubmitExam = async () => {
    stopRecording();
    soundEngine.stopSpeech();
    setPhase('grading');

    // 1. Reading objective grading
    const readQs = currentExam.reading.questions;
    const readCorrect = readQs.filter((q) => readingAnswers[q.id] === q.correctIndex).length;
    const readingScore = Math.round((readCorrect / Math.max(1, readQs.length)) * 100);

    // 2. Listening / Hearing objective grading
    const listenQs = currentExam.listening.questions;
    const listenCorrect = listenQs.filter((q) => listeningAnswers[q.id] === q.correctIndex).length;
    const listeningScore = Math.round((listenCorrect / Math.max(1, listenQs.length)) * 100);

    // 3. Writing grading (Local/Cloud AI if connected, else offline rubric engine)
    const writingEval = await evaluateWithAIOrFallback({
      config: aiConfig,
      text: writingText,
      languageId: currentExam.languageId,
      level: currentExam.level,
      skill: 'writing',
      taskPrompt: `${currentExam.writing.scenario}\nRequirements: ${currentExam.writing.taskRequirements.join(' ')}`,
      minWords: currentExam.writing.minWords,
      expectedKeywords: currentExam.writing.keyRubricKeywords,
    });

    // 4. Speaking grading (Local/Cloud AI if connected, else offline rubric engine)
    const speakingEval = await evaluateWithAIOrFallback({
      config: aiConfig,
      text: speakingText,
      languageId: currentExam.languageId,
      level: currentExam.level,
      skill: 'speaking',
      taskPrompt: `${currentExam.speaking.cueCardTitle}\nPoints: ${currentExam.speaking.bulletPoints.join('; ')}\nFollow-up: ${currentExam.speaking.followUpQuestion}`,
      minWords: Math.max(25, Math.round(currentExam.writing.minWords * 0.7)),
      expectedKeywords: currentExam.speaking.keyRubricKeywords,
    });

    const overallScore = Math.round(
      (readingScore + listeningScore + writingEval.score + speakingEval.score) / 4
    );
    const passMark = currentExam.passingScorePercent;
    const passed = overallScore >= passMark;

    const record: ExamAttemptRecord = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      examId: currentExam.id,
      examTitle: currentExam.title,
      alignedCertificate: currentExam.alignedCertificate,
      languageId: currentExam.languageId,
      level: currentExam.level,
      mode,
      durationUsedSeconds: elapsedSeconds,
      overallScore,
      passed,
      skills: {
        reading: {
          score: readingScore,
          passed: readingScore >= passMark,
          feedback: `${readCorrect}/${readQs.length} reading comprehension items correct.`,
        },
        listening: {
          score: listeningScore,
          passed: listeningScore >= passMark,
          feedback: `${listenCorrect}/${listenQs.length} listening & hearing items correct (replays used: ${listeningPlays}).`,
        },
        writing: {
          score: writingEval.score,
          passed: writingEval.score >= passMark,
          feedback: writingEval.examinerSummary,
          aiGraded: writingEval.source === 'ai',
        },
        speaking: {
          score: speakingEval.score,
          passed: speakingEval.score >= passMark,
          feedback: speakingEval.examinerSummary,
          aiGraded: speakingEval.source === 'ai',
        },
      },
      writingSubmission: writingText,
      speakingTranscript: speakingText,
    };

    setGradingDetails({
      writingStrengths: writingEval.strengths,
      writingCorrections: writingEval.corrections,
      writingUpgraded: writingEval.upgradedVersion,
      speakingStrengths: speakingEval.strengths,
      speakingCorrections: speakingEval.corrections,
      speakingUpgraded: speakingEval.upgradedVersion,
    });

    setReport(record);
    setPhase('report');
    soundEngine.playSuccessChime();
    onCompleteExam(record);
  };

  const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0;
  const speakingWordCount = speakingText.trim() ? speakingText.trim().split(/\s+/).length : 0;
  const aiReady = isAIConfigReady(aiConfig);
  const lowTimeWarning = phase === 'running' && mode === 'strict' && remainingSeconds <= 120;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* LOBBY PHASE */}
      {phase === 'lobby' && (
        <div className="space-y-6">
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  <Timer className="w-3.5 h-3.5" />
                  <span>High-Pressure 4-Skill Certification Simulator</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Experience Real Exam Pressure Before Test Day
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                  Train under realistic countdown clocks, restricted audio replays, live word-count targets, and timed speaking cue cards across all 4 official certification skills.
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    onSelectLanguage('english');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    examLang === 'english'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 English Exams
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    onSelectLanguage('german');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    examLang === 'german'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇩🇪 German Exams
                </button>
              </div>
            </div>

            {/* Level Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  aria-pressed={selectedLevel === lvl}
                  onClick={() => {
                    soundEngine.playClickSound();
                    setSelectedLevel(lvl);
                  }}
                  className={`p-3 rounded-xl border text-center font-mono font-bold text-sm transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                      : 'bg-[#FAF9F6] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Selected Exam Briefing Card */}
            <div className="p-5 rounded-2xl bg-[#FAF9F6] dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 uppercase">
                    Aligned Certification: {currentExam.alignedCertificate}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentExam.title}
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 self-start">
                  ⏱ {currentExam.totalMinutes} mins · Pass ≥ {currentExam.passingScorePercent}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-sky-700 dark:text-sky-400">1. Reading</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">{currentExam.reading.questions.length} exam items · {currentExam.reading.durationMinutes}m</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-purple-700 dark:text-purple-400">2. Listening / Hearing</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">
                    {currentExam.listening.questions.length} items · Max {currentExam.listening.maxPlaysStrict} play{currentExam.listening.maxPlaysStrict > 1 ? 's' : ''} (Strict)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-amber-700 dark:text-amber-400">3. Writing</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">
                    {currentExam.writing.minWords}–{currentExam.writing.maxWords} words · {aiReady ? 'AI Examiner' : 'Rubric'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">4. Speaking</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">
                    {currentExam.speaking.prepSeconds}s prep + {currentExam.speaking.speakSeconds}s voice capture
                  </div>
                </div>
              </div>

              {/* Pressure Mode Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  aria-pressed={mode === 'strict'}
                  onClick={() => setMode('strict')}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    mode === 'strict'
                      ? 'bg-rose-500/10 border-rose-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Strict Exam Pressure Mode</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Live countdown with auto-submit, locked listening transcripts, and strict audio replay caps ({currentExam.listening.maxPlaysStrict}x).
                  </p>
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'practice'}
                  onClick={() => setMode('practice')}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    mode === 'practice'
                      ? 'bg-sky-500/10 border-sky-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Guided Practice Mode</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Unlimited audio replays and non-blocking timer so you can inspect exam structure calmly.
                  </p>
                </button>
              </div>

              {/* AI Examiner Notice + Start CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  {aiReady ? (
                    <span>
                      <strong>AI Examiner Active:</strong> Writing &amp; Speaking will be graded by <code>{aiConfig.model}</code>.
                    </span>
                  ) : (
                    <span>
                      Using Built-in CEFR Rubric Engine.{' '}
                      <button type="button" onClick={onOpenAISettings} className="text-sky-700 dark:text-sky-400 font-semibold underline">
                        Connect Local/Cloud AI
                      </button>{' '}
                      for neural line-by-line grading.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartExam}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 shadow-sm transition-colors shrink-0"
                >
                  <span>Begin {currentExam.level} Simulated Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* RUNNING EXAM PHASE */}
      {phase === 'running' && (
        <div className="space-y-4">
          {/* Live Exam Pressure Header */}
          <div
            className={`sticky top-16 z-30 p-4 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-3 transition-colors ${
              lowTimeWarning
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-sky-300">
                {mode === 'strict' ? 'STRICT EXAM PRESSURE' : 'PRACTICE SIMULATION'} · {currentExam.alignedCertificate}
              </div>
              <div className="font-bold text-sm sm:text-base">{currentExam.title}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/30 font-mono text-base sm:text-lg font-bold tabular-nums flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>{formatClock(remainingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => void handleSubmitExam()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                Submit All 4 Skills
              </button>
            </div>
          </div>

          {/* 4-Skill Section Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SECTION_ORDER.map((sk) => {
              const meta = SECTION_LABELS[sk];
              const Icon = meta.icon;
              const active = activeSection === sk;
              return (
                <button
                  type="button"
                  key={sk}
                  aria-pressed={active}
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveSection(sk);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 1: Reading */}
          {activeSection === 'reading' && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-sky-700 dark:text-sky-400">
                  {currentExam.reading.title}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentExam.reading.passageTitle}
                </h3>
              </div>

              <div className="p-5 rounded-xl bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentExam.reading.passage}
              </div>

              <div className="space-y-4">
                {currentExam.reading.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.prompt}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const chosen = readingAnswers[q.id] === oIdx;
                        return (
                          <button
                            type="button"
                            key={oIdx}
                            onClick={() => {
                              soundEngine.playClickSound();
                              setReadingAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                            }}
                            className={`p-3 rounded-xl text-left text-xs border transition-colors ${
                              chosen
                                ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                            }`}
                          >
                            <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('listening')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                >
                  <span>Next: Listening / Hearing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Section 2: Listening & Hearing */}
          {activeSection === 'listening' && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-400">
                  {currentExam.listening.title}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300">{currentExam.listening.contextNote}</p>
              </div>

              <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={mode === 'strict' && listeningPlays >= currentExam.listening.maxPlaysStrict}
                    onClick={handlePlayListening}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-400 text-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {mode === 'strict' && listeningPlays >= currentExam.listening.maxPlaysStrict
                        ? 'All Official Audio Plays Used'
                        : 'Play Official Audio Track'}
                    </span>
                  </button>

                  <span className="text-xs font-mono font-bold text-purple-900 dark:text-purple-200">
                    Plays Used: {listeningPlays} / {mode === 'strict' ? currentExam.listening.maxPlaysStrict : '∞'}
                  </span>
                </div>

                <div className="text-xs text-purple-900 dark:text-purple-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    <strong>Hearing Trap Focus:</strong> {currentExam.listening.hearingFocusTrap}
                  </span>
                </div>

                {mode === 'practice' && (
                  <details className="text-xs text-slate-700 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-purple-700 dark:text-purple-300">
                      Practice Mode: Peek Transcript
                    </summary>
                    <p className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {currentExam.listening.audioScript}
                    </p>
                  </details>
                )}
              </div>

              <div className="space-y-4">
                {currentExam.listening.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.prompt}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const chosen = listeningAnswers[q.id] === oIdx;
                        return (
                          <button
                            type="button"
                            key={oIdx}
                            onClick={() => {
                              soundEngine.playClickSound();
                              setListeningAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                            }}
                            className={`p-3 rounded-xl text-left text-xs border transition-colors ${
                              chosen
                                ? 'bg-purple-600 text-white border-purple-600 font-semibold'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                          >
                            <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('writing')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                >
                  <span>Next: Writing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Section 3: Writing */}
          {activeSection === 'writing' && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  {currentExam.writing.title}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentExam.writing.scenario}</p>
              </div>

              <ul className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs text-amber-950 dark:text-amber-100">
                {currentExam.writing.taskRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor="exam-writing-textarea" className="font-bold text-slate-700 dark:text-slate-300">
                    Your Exam Essay / Letter
                  </label>
                  <span
                    className={`font-bold tabular-nums ${
                      wordCount >= currentExam.writing.minWords
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {wordCount} words (Target: {currentExam.writing.minWords}–{currentExam.writing.maxWords})
                  </span>
                </div>
                <textarea
                  id="exam-writing-textarea"
                  rows={8}
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder={
                    currentExam.languageId === 'german'
                      ? 'Schreiben Sie Ihre vollständige Prüfungsantwort hier auf Deutsch...'
                      : 'Write your complete certification exam response in English here...'
                  }
                  className="w-full p-4 rounded-xl text-sm bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('speaking')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                >
                  <span>Next: Speaking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Section 4: Speaking */}
          {activeSection === 'speaking' && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  {currentExam.speaking.title}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Cue Card: {currentExam.speaking.cueCardTitle}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs text-emerald-950 dark:text-emerald-100">
                <ul className="space-y-1.5">
                  {currentExam.speaking.bulletPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold">{i + 1}.</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-emerald-500/20 font-semibold">
                  Examiner Follow-Up: {currentExam.speaking.followUpQuestion}
                </div>
              </div>

              {/* Prep & Live Voice Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    setPrepLeft(currentExam.speaking.prepSeconds);
                    setIsPrepping(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isPrepping ? `Prep Countdown: ${prepLeft}s` : `Start ${currentExam.speaking.prepSeconds}s Prep Timer`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>
                    {isRecording
                      ? `Stop Speaking (${formatClock(speakLeft)} left)`
                      : `Start Live Voice Speaking (${currentExam.speaking.speakSeconds}s)`}
                  </span>
                </button>
              </div>

              {micNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                  {micNote}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor="exam-speaking-transcript" className="font-bold text-slate-700 dark:text-slate-300">
                    Spoken Transcript (Auto-captured via Mic or Type Manually)
                  </label>
                  <span className="text-slate-500 tabular-nums">{speakingWordCount} words</span>
                </div>
                <textarea
                  id="exam-speaking-transcript"
                  rows={5}
                  value={speakingText}
                  onChange={(e) => setSpeakingText(e.target.value)}
                  placeholder="Click 'Start Live Voice Speaking' to dictate aloud, or type what you say aloud here for examiner grading..."
                  className="w-full p-4 rounded-xl text-sm bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => void handleSubmitExam()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish &amp; Grade All 4 Skills</span>
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* GRADING SPINNER PHASE */}
      {phase === 'grading' && (
        <section className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Bot className="w-10 h-10 mx-auto text-sky-600 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Evaluating Your 4-Skill Certification Performance...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scoring Reading, Listening/Hearing, Writing, and Speaking against CEFR {currentExam.level} criteria.
          </p>
        </section>
      )}

      {/* SCORE REPORT PHASE */}
      {phase === 'report' && report && (
        <div className="space-y-6 animate-fadeIn">
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                    report.passed
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  }`}
                >
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase ${
                      report.passed
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {report.passed ? 'CERTIFICATION READY · PASSED' : 'BELOW PASS THRESHOLD · REVIEW & RETRY'}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {report.examTitle} — Overall {report.overallScore}%
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Mode: {report.mode.toUpperCase()} · Time Used: {formatClock(report.durationUsedSeconds)} · Saved to History
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Exam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('lobby')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Choose Another Level
                </button>
              </div>
            </div>

            {/* 4-Skill Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SECTION_ORDER.map((sk) => {
                const skillScore = report.skills[sk];
                return (
                  <div
                    key={sk}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase font-mono text-slate-600 dark:text-slate-300">
                        {sk === 'listening' ? 'Listening / Hearing' : sk}
                      </span>
                      <span
                        className={`text-base font-mono font-extrabold ${
                          skillScore.passed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {skillScore.score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{skillScore.feedback}</p>
                    {skillScore.aiGraded && (
                      <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        AI Examiner Graded
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Model Answers, Transcripts & Examiner Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Reading & Listening Key */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  Reading &amp; Listening Answer Key + Audio Transcript
                </h4>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-slate-800 dark:text-slate-200">
                  <strong className="block mb-1">Unlocked Listening Transcript:</strong>
                  {currentExam.listening.audioScript}
                </div>
                {[...currentExam.reading.questions, ...currentExam.listening.questions].map((q) => {
                  const chosen = readingAnswers[q.id] ?? listeningAnswers[q.id];
                  const ok = chosen === q.correctIndex;
                  return (
                    <div key={q.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-slate-900 dark:text-white flex justify-between gap-2">
                        <span>{q.prompt}</span>
                        <span className={ok ? 'text-emerald-600' : 'text-rose-600'}>{ok ? '✓' : '✗'}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Correct: <strong>{q.options[q.correctIndex]}</strong> ({q.explanation})
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Writing & Speaking Model Benchmarks */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  Writing &amp; Speaking Model Answers &amp; Corrections
                </h4>

                {gradingDetails && gradingDetails.writingCorrections.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <strong className="text-amber-900 dark:text-amber-200 block">Writing Action Notes:</strong>
                    {gradingDetails.writingCorrections.map((c, i) => (
                      <div key={i}>• {c}</div>
                    ))}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white block">Official-Style {currentExam.level} Model Writing:</strong>
                  <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentExam.writing.modelAnswer}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 dark:text-white">Model {currentExam.level} Speaking Response:</strong>
                    <button
                      type="button"
                      onClick={() => soundEngine.speak(currentExam.speaking.modelResponseScript, currentExam.languageId)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Hear Model</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentExam.speaking.modelResponseScript}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
