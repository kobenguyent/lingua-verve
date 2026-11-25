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
  Globe,
  Lock,
  Layers,
} from 'lucide-react';
import {
  AIProviderConfig,
  CEFRLevel,
  ExamAttemptRecord,
  MockExam,
  OfficialRubricBreakdown,
  SkillType,
} from '../types';
import { MOCK_EXAMS } from '../data';
import { evaluateWithAIOrFallback, isAIConfigReady } from '../utils/aiClient';
import { ACCENT_CATALOG, soundEngine } from '../utils/audio';
import {
  computeOfficialGradeLabel,
  computeRubricBreakdown,
  getExamListeningTracks,
  getExamReadingParts,
  getExamSpeakingParts,
  getExamWritingTasks,
} from '../utils/examScoring';
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

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function getAccentBadge(accentCode?: string): string {
  if (!accentCode) return '🌐 Standard';
  const match = ACCENT_CATALOG.find((a) => a.code === accentCode);
  return match ? `${match.flag} ${match.label}` : `🌐 ${accentCode}`;
}

function getReadingFormatLabel(format: string): string {
  switch (format) {
    case 'true-false':
      return 'Richtig / Falsch · TFNG';
    case 'cloze':
      return 'Sprachbausteine · Use of English';
    case 'matching':
      return 'Information Matching';
    default:
      return 'Comprehension';
  }
}

function RubricBars({ rubric }: { rubric: OfficialRubricBreakdown }) {
  const rows: Array<{ label: string; value: number }> = [
    { label: 'Task Fulfillment', value: rubric.taskFulfillment },
    { label: 'Coherence & Cohesion', value: rubric.coherenceCohesion },
    { label: 'Lexical Range', value: rubric.lexicalRange },
    { label: 'Grammatical Accuracy', value: rubric.grammaticalAccuracy },
  ];

  return (
    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="space-y-0.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400">
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
  const [timingMode, setTimingMode] = useState<'official' | 'sprint'>('official');
  const [phase, setPhase] = useState<'lobby' | 'running' | 'grading' | 'report'>('lobby');
  const [activeSection, setActiveSection] = useState<SkillType>('reading');

  // Sub-part navigation indices
  const [activeReadingIdx, setActiveReadingIdx] = useState(0);
  const [activeListeningIdx, setActiveListeningIdx] = useState(0);
  const [activeWritingIdx, setActiveWritingIdx] = useState(0);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(0);

  // Exam timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Answers state across multi-part structure
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({});
  const [listeningPlaysByTrack, setListeningPlaysByTrack] = useState<Record<string, number>>({});
  const [writingResponses, setWritingResponses] = useState<Record<string, string>>({});
  const [speakingResponses, setSpeakingResponses] = useState<Record<string, string>>({});

  // Listening pre-read countdown & Speaking timers / mic
  const [preReadLeft, setPreReadLeft] = useState(0);
  const [isPreReading, setIsPreReading] = useState(false);
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
    allModulesPassed: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialLevel) {
      setSelectedLevel(initialLevel);
    }
  }, [initialLevel]);

  const currentExam: MockExam =
    availableExams.find((e) => e.level === selectedLevel) || availableExams[0];

  const readingParts = getExamReadingParts(currentExam);
  const listeningTracks = getExamListeningTracks(currentExam);
  const writingTasks = getExamWritingTasks(currentExam);
  const speakingParts = getExamSpeakingParts(currentExam);

  const activeReadingPart = readingParts[Math.min(activeReadingIdx, readingParts.length - 1)] || readingParts[0];
  const activeListeningTrack =
    listeningTracks[Math.min(activeListeningIdx, listeningTracks.length - 1)] || listeningTracks[0];
  const activeWritingTask = writingTasks[Math.min(activeWritingIdx, writingTasks.length - 1)] || writingTasks[0];
  const activeSpeakingPart =
    speakingParts[Math.min(activeSpeakingIdx, speakingParts.length - 1)] || speakingParts[0];

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

  // Listening pre-read countdown
  useEffect(() => {
    if (!isPreReading || preReadLeft <= 0) return;
    const t = setInterval(() => {
      setPreReadLeft((p) => {
        if (p <= 1) {
          setIsPreReading(false);
          soundEngine.playClickSound();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPreReading, preReadLeft]);

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

  const configuredMinutes =
    timingMode === 'official' ? currentExam.totalMinutes : Math.max(15, Math.round(currentExam.totalMinutes * 0.5));

  const switchSection = (next: SkillType) => {
    stopRecording();
    soundEngine.stopSpeech();
    setIsPreReading(false);
    setIsPrepping(false);
    soundEngine.playClickSound();
    setActiveSection(next);
  };

  const handleStartExam = () => {
    soundEngine.playClickSound();
    setPhase('running');
    setActiveSection('reading');
    setActiveReadingIdx(0);
    setActiveListeningIdx(0);
    setActiveWritingIdx(0);
    setActiveSpeakingIdx(0);
    setRemainingSeconds(configuredMinutes * 60);
    setElapsedSeconds(0);
    setReadingAnswers({});
    setListeningAnswers({});
    setListeningPlaysByTrack({});
    setWritingResponses({});
    setSpeakingResponses({});
    setPreReadLeft(listeningTracks[0]?.preReadSeconds || 15);
    setIsPreReading(false);
    setPrepLeft(speakingParts[0]?.prepSeconds || currentExam.speaking.prepSeconds);
    setSpeakLeft(speakingParts[0]?.speakSeconds || currentExam.speaking.speakSeconds);
    setIsPrepping(false);
    setIsRecording(false);
    setMicNote('');
    setReport(null);
    setGradingDetails(null);
  };

  const handlePlayListeningTrack = (track = activeListeningTrack) => {
    const used = listeningPlaysByTrack[track.id] || 0;
    if (mode === 'strict' && used >= track.maxPlaysStrict) {
      return;
    }
    setIsPreReading(false);
    soundEngine.playClickSound();
    setListeningPlaysByTrack((prev) => ({ ...prev, [track.id]: used + 1 }));
    soundEngine.speak(track.audioScript, currentExam.languageId, false, track.accentCode);
  };

  const handleToggleMic = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    const targetPartId = activeSpeakingPart.id;
    setIsPrepping(false);
    setSpeakLeft(activeSpeakingPart.speakSeconds);
    setMicNote('');

    if (!isSpeechRecognitionSupported()) {
      setMicNote(
        'Live browser speech-to-text is unavailable in this browser. Type your spoken response below — timing & AI grading still work fully!'
      );
      setIsRecording(true);
      return;
    }

    const baseText = (speakingResponses[targetPartId] || '').trim();
    const handle = startSpeechRecognition({
      languageId: currentExam.languageId,
      onTranscript: (finalChunk, interim) => {
        const combined = [baseText, finalChunk, interim].filter(Boolean).join(' ');
        setSpeakingResponses((prev) => ({ ...prev, [targetPartId]: combined }));
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
    setIsPreReading(false);
    setIsPrepping(false);
    setPhase('grading');

    // 1. Reading objective grading across all parts (9 items)
    const allReadQs = readingParts.flatMap((p) => p.questions);
    const readCorrect = allReadQs.filter((q) => readingAnswers[q.id] === q.correctIndex).length;
    const readingScore = Math.round((readCorrect / Math.max(1, allReadQs.length)) * 100);
    const readPartBreakdown = readingParts
      .map(
        (p, idx) =>
          `P${idx + 1}: ${p.questions.filter((q) => readingAnswers[q.id] === q.correctIndex).length}/${p.questions.length}`
      )
      .join(' · ');

    // 2. Listening / Hearing objective grading across all multi-accent tracks (9 items)
    const allListenQs = listeningTracks.flatMap((t) => t.questions);
    const listenCorrect = allListenQs.filter((q) => listeningAnswers[q.id] === q.correctIndex).length;
    const listeningScore = Math.round((listenCorrect / Math.max(1, allListenQs.length)) * 100);
    const totalPlays = Object.values(listeningPlaysByTrack).reduce((a, b) => a + b, 0);
    const listenTrackBreakdown = listeningTracks
      .map(
        (t, idx) =>
          `T${idx + 1}: ${t.questions.filter((q) => listeningAnswers[q.id] === q.correctIndex).length}/${t.questions.length}`
      )
      .join(' · ');

    // 3. Weighted Multi-Task Writing grading (Task 1 + Task 2)
    const writingEvals = await Promise.all(
      writingTasks.map((task) =>
        evaluateWithAIOrFallback({
          config: aiConfig,
          text: writingResponses[task.id] || '',
          languageId: currentExam.languageId,
          level: currentExam.level,
          skill: 'writing',
          taskPrompt: `${task.partLabel}\n${task.scenario}\nRequirements: ${task.taskRequirements.join(' ')}`,
          minWords: task.minWords,
          expectedKeywords: task.keyRubricKeywords,
        })
      )
    );

    const totalWritingWeight = writingTasks.reduce((sum, t) => sum + t.weightPercent, 0) || 100;
    const writingScore = Math.round(
      writingEvals.reduce((sum, ev, idx) => sum + ev.score * writingTasks[idx].weightPercent, 0) /
        totalWritingWeight
    );
    const rawCombinedWriting = writingTasks.map((t) => (writingResponses[t.id] || '').trim()).filter(Boolean).join('\n\n');
    const labeledCombinedWriting = writingTasks
      .map((t, idx) => `[Task ${idx + 1} · ${t.weightPercent}%]\n${(writingResponses[t.id] || '').trim() || '(blank)'}`)
      .join('\n\n');
    const writingRubric = computeRubricBreakdown({
      text: rawCombinedWriting,
      score: writingScore,
      minWords: writingTasks.reduce((sum, t) => sum + t.minWords, 0),
      expectedKeywords: writingTasks.flatMap((t) => t.keyRubricKeywords),
    });
    const writingTaskSummary = writingEvals
      .map((ev, idx) => `T${idx + 1} (${writingTasks[idx].weightPercent}%): ${ev.score}%`)
      .join(' · ');

    // 4. Multi-Part Speaking grading (Part 1 Warm-Up + Part 2 Cue Card + Part 3 Follow-Up)
    const answeredParts = speakingParts.filter((p) => countWords(speakingResponses[p.id] || '') >= 4).length;
    const rawCombinedSpeaking = speakingParts
      .map((p) => (speakingResponses[p.id] || '').trim())
      .filter(Boolean)
      .join('\n\n');
    const labeledCombinedSpeaking = speakingParts
      .map((p, idx) => `[Part ${idx + 1}: ${p.partLabel}]\n${(speakingResponses[p.id] || '').trim() || '(no response)'}`)
      .join('\n\n');

    const speakingEval = await evaluateWithAIOrFallback({
      config: aiConfig,
      text: rawCombinedSpeaking,
      languageId: currentExam.languageId,
      level: currentExam.level,
      skill: 'speaking',
      taskPrompt: speakingParts
        .map((p, i) => `Part ${i + 1} (${p.partLabel}): ${p.instruction} — ${p.prompts.join('; ')}`)
        .join('\n'),
      minWords: Math.max(35, Math.round(currentExam.writing.minWords * 0.85)),
      expectedKeywords: speakingParts.flatMap((p) => p.keyRubricKeywords),
    });

    // Reward completing all 3 speaking parts while keeping partial attempts fair
    const partCoverageFactor =
      answeredParts === 0
        ? 0
        : speakingParts.length <= 1
        ? 1
        : 0.65 + 0.35 * (answeredParts / speakingParts.length);
    const speakingScore = Math.round(speakingEval.score * partCoverageFactor);
    const speakingRubric = computeRubricBreakdown({
      text: rawCombinedSpeaking,
      score: speakingScore,
      minWords: Math.max(35, Math.round(currentExam.writing.minWords * 0.85)),
      expectedKeywords: speakingParts.flatMap((p) => p.keyRubricKeywords),
    });

    const overallScore = Math.round((readingScore + listeningScore + writingScore + speakingScore) / 4);
    const passMark = currentExam.passingScorePercent;
    const allModulesPassed =
      readingScore >= passMark &&
      listeningScore >= passMark &&
      writingScore >= passMark &&
      speakingScore >= passMark;
    const passed = currentExam.requireAllSkillsPass
      ? overallScore >= passMark && allModulesPassed
      : overallScore >= passMark;

    const officialGradeLabel = computeOfficialGradeLabel({
      languageId: currentExam.languageId,
      level: currentExam.level,
      overallScore,
      allModulesPassed,
      passingScorePercent: passMark,
    });

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
      officialGradeLabel,
      skills: {
        reading: {
          score: readingScore,
          passed: readingScore >= passMark,
          feedback: `${readCorrect}/${allReadQs.length} correct (${readPartBreakdown}).`,
        },
        listening: {
          score: listeningScore,
          passed: listeningScore >= passMark,
          feedback: `${listenCorrect}/${allListenQs.length} correct (${listenTrackBreakdown}) · ${totalPlays} plays.`,
        },
        writing: {
          score: writingScore,
          passed: writingScore >= passMark,
          feedback: `${writingTaskSummary} — ${writingEvals[0]?.examinerSummary || ''}`,
          aiGraded: writingEvals.some((ev) => ev.source === 'ai'),
          rubric: writingRubric,
        },
        speaking: {
          score: speakingScore,
          passed: speakingScore >= passMark,
          feedback: `Parts completed: ${answeredParts}/${speakingParts.length} — ${speakingEval.examinerSummary}`,
          aiGraded: speakingEval.source === 'ai',
          rubric: speakingRubric,
        },
      },
      writingSubmission: labeledCombinedWriting,
      speakingTranscript: labeledCombinedSpeaking,
    };

    setGradingDetails({
      writingStrengths: writingEvals.flatMap((ev) => ev.strengths).slice(0, 5),
      writingCorrections: writingEvals.flatMap((ev) => ev.corrections).slice(0, 6),
      writingUpgraded: writingEvals.map((ev) => ev.upgradedVersion).filter(Boolean).join('\n\n'),
      speakingStrengths: speakingEval.strengths,
      speakingCorrections: speakingEval.corrections,
      speakingUpgraded: speakingEval.upgradedVersion,
      allModulesPassed,
    });

    setReport(record);
    setPhase('report');
    soundEngine.playSuccessChime();
    onCompleteExam(record);
  };

  // Progress counters for top pills
  const totalReadQs = readingParts.reduce((s, p) => s + p.questions.length, 0);
  const answeredReadQs = readingParts.reduce(
    (s, p) => s + p.questions.filter((q) => readingAnswers[q.id] !== undefined).length,
    0
  );
  const totalListenQs = listeningTracks.reduce((s, t) => s + t.questions.length, 0);
  const answeredListenQs = listeningTracks.reduce(
    (s, t) => s + t.questions.filter((q) => listeningAnswers[q.id] !== undefined).length,
    0
  );
  const totalWrittenWords = writingTasks.reduce((s, t) => s + countWords(writingResponses[t.id] || ''), 0);
  const activeTaskWordCount = countWords(writingResponses[activeWritingTask.id] || '');
  const activeSpeakWordCount = countWords(speakingResponses[activeSpeakingPart.id] || '');
  const totalSpokenWords = speakingParts.reduce((s, p) => s + countWords(speakingResponses[p.id] || ''), 0);

  const activeTrackPlays = listeningPlaysByTrack[activeListeningTrack.id] || 0;
  const activeTrackLocked = mode === 'strict' && activeTrackPlays >= activeListeningTrack.maxPlaysStrict;

  const aiReady = isAIConfigReady(aiConfig);
  const lowTimeWarning = phase === 'running' && mode === 'strict' && remainingSeconds <= 120;

  const sectionBudgetMins: Record<SkillType, number> = {
    reading: currentExam.reading.durationMinutes,
    listening: currentExam.listening.durationMinutes,
    writing: currentExam.writing.durationMinutes,
    speaking: currentExam.speaking.durationMinutes,
  };

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
                  <span>Real-World Multi-Part 4-Skill Certification Simulator</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Experience Official Exam Architecture Before Test Day
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                  Authentic multi-part Goethe/telc/TestDaF &amp; Cambridge/IELTS/TOEFL simulations with regional DACH &amp; global English accents, weighted dual writing tasks, 3-part interactive speaking, and 4-criterion CEFR rubrics.
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
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                    ⏱ {configuredMinutes} mins · Pass ≥ {currentExam.passingScorePercent}%
                  </span>
                  {currentExam.requireAllSkillsPass && (
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Modular Pass Gate (All 4 Skills)
                    </span>
                  )}
                </div>
              </div>

              {/* 4-Skill Multi-Part Blueprint Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-sky-700 dark:text-sky-400 flex items-center justify-between">
                    <span>1. Reading</span>
                    <span className="font-mono text-[10px]">{readingParts.length} Parts</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {totalReadQs} items · {currentExam.reading.durationMinutes}m budget
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comprehension + {examLang === 'german' ? 'Richtig/Falsch + Sprachbausteine' : 'TFNG + Use of English'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between">
                    <span>2. Listening / Hearing</span>
                    <span className="font-mono text-[10px]">{listeningTracks.length} Tracks</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {totalListenQs} items · Max {currentExam.listening.maxPlaysStrict}x/track
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {listeningTracks.map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono"
                      >
                        {getAccentBadge(t.accentCode)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span>3. Writing</span>
                    <span className="font-mono text-[10px]">{writingTasks.length} Tasks</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Weights: {writingTasks.map((t) => `${t.weightPercent}%`).join(' + ')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    4-Criterion CEFR Rubric · {aiReady ? 'AI Examiner' : 'Built-in'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                    <span>4. Speaking</span>
                    <span className="font-mono text-[10px]">{speakingParts.length} Parts</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Warm-Up + Cue Card + Pushback
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Examiner voice prompts + live mic capture
                  </div>
                </div>
              </div>

              {/* Pressure Mode + Timing Pace Pickers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
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
                    Live countdown with auto-submit, locked transcripts until report, and per-track audio replay caps ({currentExam.listening.maxPlaysStrict}x).
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
                    Unlimited multi-accent replays, peekable transcripts, and non-blocking clock for calm strategy practice.
                  </p>
                </button>

                <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <Timer className="w-4 h-4 text-amber-500" />
                    <span>Clock Pacing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      aria-pressed={timingMode === 'official'}
                      onClick={() => setTimingMode('official')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        timingMode === 'official'
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Official ({currentExam.totalMinutes}m)
                    </button>
                    <button
                      type="button"
                      aria-pressed={timingMode === 'sprint'}
                      onClick={() => setTimingMode('sprint')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        timingMode === 'sprint'
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Sprint ({Math.max(15, Math.round(currentExam.totalMinutes * 0.5))}m)
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Examiner Notice + Start CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  {aiReady ? (
                    <span>
                      <strong>AI Examiner Active:</strong> Both Writing tasks &amp; 3-part Speaking will be graded by{' '}
                      <code>{aiConfig.model}</code>.
                    </span>
                  ) : (
                    <span>
                      Using Built-in 4-Criterion CEFR Rubric Engine.{' '}
                      <button
                        type="button"
                        onClick={onOpenAISettings}
                        className="text-sky-700 dark:text-sky-400 font-semibold underline"
                      >
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
                {mode === 'strict' ? 'STRICT EXAM PRESSURE' : 'PRACTICE SIMULATION'} · {currentExam.alignedCertificate} ·{' '}
                {activeSection.toUpperCase()} BUDGET ~{sectionBudgetMins[activeSection]}M
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

          {/* 4-Skill Section Stepper with Live Progress Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SECTION_ORDER.map((sk) => {
              const meta = SECTION_LABELS[sk];
              const Icon = meta.icon;
              const active = activeSection === sk;
              const badge =
                sk === 'reading'
                  ? `${answeredReadQs}/${totalReadQs}`
                  : sk === 'listening'
                  ? `${answeredListenQs}/${totalListenQs}`
                  : sk === 'writing'
                  ? `${totalWrittenWords}w`
                  : `${totalSpokenWords}w`;

              return (
                <button
                  type="button"
                  key={sk}
                  aria-pressed={active}
                  onClick={() => switchSection(sk)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-1.5 transition-colors ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{meta.label}</span>
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: MULTI-PART READING (3 PARTS · 9 ITEMS) */}
          {activeSection === 'reading' && activeReadingPart && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              {/* Sub-Part Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {readingParts.map((part, idx) => {
                    const partDone = part.questions.filter((q) => readingAnswers[q.id] !== undefined).length;
                    const isCurrent = idx === activeReadingIdx;
                    return (
                      <button
                        type="button"
                        key={part.id}
                        aria-pressed={isCurrent}
                        onClick={() => {
                          soundEngine.playClickSound();
                          setActiveReadingIdx(idx);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>Part {idx + 1}</span>
                        <span className="font-mono text-[10px] opacity-85">
                          ({partDone}/{part.questions.length})
                        </span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold">
                  {getReadingFormatLabel(activeReadingPart.format)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-sky-700 dark:text-sky-400">
                  {activeReadingPart.partLabel}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeReadingPart.passageTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeReadingPart.instruction}</p>
              </div>

              <div className="p-5 rounded-xl bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {activeReadingPart.passage}
              </div>

              <div className="space-y-4">
                {activeReadingPart.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Q{activeReadingIdx * 3 + idx + 1}. {q.prompt}
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

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Reading Progress: {answeredReadQs} / {totalReadQs} items answered
                </span>
                {activeReadingIdx < readingParts.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClickSound();
                      setActiveReadingIdx((i) => i + 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <span>Next: Reading Part {activeReadingIdx + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchSection('listening')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                  >
                    <span>Next: Listening / Hearing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* SECTION 2: MULTI-ACCENT LISTENING & HEARING (3 TRACKS · 9 ITEMS) */}
          {activeSection === 'listening' && activeListeningTrack && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              {/* Sub-Track Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {listeningTracks.map((track, idx) => {
                    const trackDone = track.questions.filter((q) => listeningAnswers[q.id] !== undefined).length;
                    const isCurrent = idx === activeListeningIdx;
                    return (
                      <button
                        type="button"
                        key={track.id}
                        aria-pressed={isCurrent}
                        onClick={() => {
                          soundEngine.stopSpeech();
                          setIsPreReading(false);
                          soundEngine.playClickSound();
                          setActiveListeningIdx(idx);
                          setPreReadLeft(track.preReadSeconds || 15);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-400'
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        <span>
                          Track {idx + 1} · {getAccentBadge(track.accentCode)}
                        </span>
                        <span className="font-mono text-[10px] opacity-85">
                          ({trackDone}/{track.questions.length})
                        </span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold">
                  Accent: {getAccentBadge(activeListeningTrack.accentCode)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-400">
                  {activeListeningTrack.partLabel}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300">{activeListeningTrack.contextNote}</p>
              </div>

              <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={activeTrackLocked}
                      onClick={() => handlePlayListeningTrack(activeListeningTrack)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-400 text-white transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>
                        {activeTrackLocked ? 'All Official Audio Plays Used' : 'Play Official Audio Track'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        setPreReadLeft(activeListeningTrack.preReadSeconds || 15);
                        setIsPreReading(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-900 text-purple-800 dark:text-purple-200 border border-purple-300/60 dark:border-purple-700"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>
                        {isPreReading
                          ? `Pre-Read Questions: ${preReadLeft}s`
                          : `${activeListeningTrack.preReadSeconds || 15}s Pre-Read Timer`}
                      </span>
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-purple-900 dark:text-purple-200">
                    Track {activeListeningIdx + 1} Plays: {activeTrackPlays} /{' '}
                    {mode === 'strict' ? activeListeningTrack.maxPlaysStrict : '∞'}
                  </span>
                </div>

                <div className="text-xs text-purple-900 dark:text-purple-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    <strong>Hearing Trap Focus:</strong> {activeListeningTrack.hearingFocusTrap}
                  </span>
                </div>

                {mode === 'strict' ? (
                  <div className="text-[11px] font-mono text-purple-800/80 dark:text-purple-300/80 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>Transcript locked in Strict Mode — unlocked automatically in your score report.</span>
                  </div>
                ) : (
                  <details className="text-xs text-slate-700 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-purple-700 dark:text-purple-300">
                      Practice Mode: Peek Track {activeListeningIdx + 1} Transcript
                    </summary>
                    <p className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {activeListeningTrack.audioScript}
                    </p>
                  </details>
                )}
              </div>

              <div className="space-y-4">
                {activeListeningTrack.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Q{activeListeningIdx * 3 + idx + 1}. {q.prompt}
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

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Listening Progress: {answeredListenQs} / {totalListenQs} items answered
                </span>
                {activeListeningIdx < listeningTracks.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.stopSpeech();
                      setIsPreReading(false);
                      soundEngine.playClickSound();
                      const nextIdx = activeListeningIdx + 1;
                      setActiveListeningIdx(nextIdx);
                      setPreReadLeft(listeningTracks[nextIdx]?.preReadSeconds || 15);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <span>Next: Audio Track {activeListeningIdx + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchSection('writing')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                  >
                    <span>Next: Writing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* SECTION 3: WEIGHTED MULTI-TASK WRITING (TASK 1 + TASK 2) */}
          {activeSection === 'writing' && activeWritingTask && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              {/* Task 1 / Task 2 Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {writingTasks.map((task, idx) => {
                    const wc = countWords(writingResponses[task.id] || '');
                    const isCurrent = idx === activeWritingIdx;
                    return (
                      <button
                        type="button"
                        key={task.id}
                        aria-pressed={isCurrent}
                        onClick={() => {
                          soundEngine.playClickSound();
                          setActiveWritingIdx(idx);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <PenTool className="w-3 h-3" />
                        <span>
                          Task {idx + 1} ({task.weightPercent}%)
                        </span>
                        <span className="font-mono text-[10px] opacity-85">· {wc}w</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Total Written: {totalWrittenWords} words
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  {activeWritingTask.partLabel} · Weight {activeWritingTask.weightPercent}%
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeWritingTask.scenario}</p>
              </div>

              <ul className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs text-amber-950 dark:text-amber-100">
                {activeWritingTask.taskRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor="exam-writing-textarea" className="font-bold text-slate-700 dark:text-slate-300">
                    Your Exam Essay / Letter (Task {activeWritingIdx + 1})
                  </label>
                  <span
                    className={`font-bold tabular-nums ${
                      activeTaskWordCount >= activeWritingTask.minWords
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {activeTaskWordCount} words (Target: {activeWritingTask.minWords}–{activeWritingTask.maxWords})
                  </span>
                </div>
                <textarea
                  id="exam-writing-textarea"
                  rows={8}
                  value={writingResponses[activeWritingTask.id] || ''}
                  onChange={(e) =>
                    setWritingResponses((prev) => ({ ...prev, [activeWritingTask.id]: e.target.value }))
                  }
                  placeholder={
                    currentExam.languageId === 'german'
                      ? `Schreiben Sie Ihre vollständige Antwort für Teil ${activeWritingIdx + 1} hier auf Deutsch...`
                      : `Write your complete certification response for Task ${activeWritingIdx + 1} in English here...`
                  }
                  className="w-full p-4 rounded-xl text-sm bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Graded on Task Fulfillment, Coherence &amp; Cohesion, Lexical Range, and Grammatical Accuracy.
                </span>
                {activeWritingIdx < writingTasks.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClickSound();
                      setActiveWritingIdx((i) => i + 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    <span>Next: Writing Task {activeWritingIdx + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchSection('speaking')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                  >
                    <span>Next: Speaking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* SECTION 4: 3-PART INTERACTIVE SPEAKING */}
          {activeSection === 'speaking' && activeSpeakingPart && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              {/* Part 1 / Part 2 / Part 3 Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {speakingParts.map((part, idx) => {
                    const wc = countWords(speakingResponses[part.id] || '');
                    const isCurrent = idx === activeSpeakingIdx;
                    return (
                      <button
                        type="button"
                        key={part.id}
                        aria-pressed={isCurrent}
                        onClick={() => {
                          stopRecording();
                          soundEngine.stopSpeech();
                          setIsPrepping(false);
                          soundEngine.playClickSound();
                          setActiveSpeakingIdx(idx);
                          setPrepLeft(part.prepSeconds);
                          setSpeakLeft(part.speakSeconds);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        <span>Part {idx + 1}</span>
                        <span className="font-mono text-[10px] opacity-85">· {wc}w</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Total Spoken: {totalSpokenWords} words across {speakingParts.length} parts
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  {activeSpeakingPart.partLabel}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeSpeakingPart.instruction}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-3 text-xs text-emerald-950 dark:text-emerald-100">
                <ul className="space-y-1.5">
                  {activeSpeakingPart.prompts.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold">{i + 1}.</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {activeSpeakingPart.examinerPromptAudio && (
                  <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] italic opacity-90">
                      “{activeSpeakingPart.examinerPromptAudio}”
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        soundEngine.speak(activeSpeakingPart.examinerPromptAudio!, currentExam.languageId, false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Examiner Prompt</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Prep & Live Voice Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    setPrepLeft(activeSpeakingPart.prepSeconds);
                    setIsPrepping(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {isPrepping ? `Prep Countdown: ${prepLeft}s` : `Start ${activeSpeakingPart.prepSeconds}s Prep Timer`}
                  </span>
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
                      : `Start Live Voice Speaking (${activeSpeakingPart.speakSeconds}s)`}
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
                    Spoken Transcript — Part {activeSpeakingIdx + 1} (Auto-captured via Mic or Type Manually)
                  </label>
                  <span className="text-slate-500 tabular-nums">{activeSpeakWordCount} words</span>
                </div>
                <textarea
                  id="exam-speaking-transcript"
                  rows={5}
                  value={speakingResponses[activeSpeakingPart.id] || ''}
                  onChange={(e) =>
                    setSpeakingResponses((prev) => ({ ...prev, [activeSpeakingPart.id]: e.target.value }))
                  }
                  placeholder={`Click 'Start Live Voice Speaking' to dictate Part ${activeSpeakingIdx + 1} aloud, or type what you say aloud here for examiner grading...`}
                  className="w-full p-4 rounded-xl text-sm bg-[#FAF9F6] dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {activeSpeakingIdx < speakingParts.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopRecording();
                      soundEngine.stopSpeech();
                      setIsPrepping(false);
                      soundEngine.playClickSound();
                      const nextIdx = activeSpeakingIdx + 1;
                      setActiveSpeakingIdx(nextIdx);
                      setPrepLeft(speakingParts[nextIdx]?.prepSeconds || 30);
                      setSpeakLeft(speakingParts[nextIdx]?.speakSeconds || 90);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  >
                    <span>Next: Speaking Part {activeSpeakingIdx + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    All {speakingParts.length} oral exam parts ready for scoring.
                  </span>
                )}

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
            Evaluating Your Multi-Part 4-Skill Certification Performance...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scoring {totalReadQs} Reading items, {totalListenQs} multi-accent Listening items, {writingTasks.length}{' '}
            weighted Writing tasks, and {speakingParts.length} Speaking parts against CEFR {currentExam.level} rubrics.
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
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase ${
                        report.passed
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {report.passed ? 'CERTIFICATION READY · PASSED' : 'BELOW PASS THRESHOLD · REVIEW & RETRY'}
                    </span>
                    {report.officialGradeLabel && (
                      <span className="inline-block px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/25">
                        {report.officialGradeLabel}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {report.examTitle} — Overall {report.overallScore}%
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Mode: {report.mode.toUpperCase()} · Time Used: {formatClock(report.durationUsedSeconds)} · Saved to History
                  </p>
                  {currentExam.requireAllSkillsPass &&
                    report.overallScore >= currentExam.passingScorePercent &&
                    gradingDetails &&
                    !gradingDetails.allModulesPassed && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        ⚠️ Overall average met {currentExam.passingScorePercent}%, but official modular certification requires passing EVERY skill (≥ {currentExam.passingScorePercent}%).
                      </p>
                    )}
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

            {/* 4-Skill Score Cards + 4-Criterion CEFR Rubric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SECTION_ORDER.map((sk) => {
                const skillScore = report.skills[sk];
                return (
                  <div
                    key={sk}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase font-mono text-slate-600 dark:text-slate-300">
                        {sk === 'listening' ? 'Listening / Hearing' : sk}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            skillScore.passed
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {skillScore.passed ? 'PASS' : 'FAIL'}
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
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{skillScore.feedback}</p>
                    {skillScore.rubric && <RubricBars rubric={skillScore.rubric} />}
                    {skillScore.aiGraded && (
                      <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        AI Examiner Graded
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Model Answers, Multi-Accent Transcripts & Full 18-Item Key */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Reading & Listening Key + Unlocked Multi-Accent Audio Transcripts */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  Unlocked Multi-Accent Transcripts &amp; Answer Key ({totalReadQs + totalListenQs} Items)
                </h4>

                <div className="space-y-2">
                  {listeningTracks.map((track, tIdx) => (
                    <div
                      key={track.id}
                      className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-slate-800 dark:text-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[11px]">
                          Track {tIdx + 1} · {getAccentBadge(track.accentCode)} — {track.partLabel}
                        </strong>
                        <button
                          type="button"
                          onClick={() =>
                            soundEngine.speak(track.audioScript, currentExam.languageId, false, track.accentCode)
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-semibold shrink-0"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                      </div>
                      <p className="leading-relaxed">{track.audioScript}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {[
                    ...readingParts.flatMap((p, pi) =>
                      p.questions.map((q) => ({ q, tag: `Reading P${pi + 1}`, chosen: readingAnswers[q.id] }))
                    ),
                    ...listeningTracks.flatMap((t, ti) =>
                      t.questions.map((q) => ({ q, tag: `Listening T${ti + 1}`, chosen: listeningAnswers[q.id] }))
                    ),
                  ].map(({ q, tag, chosen }) => {
                    const ok = chosen === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white flex justify-between gap-2">
                          <span>
                            <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 mr-1.5">
                              [{tag}]
                            </span>
                            {q.prompt}
                          </span>
                          <span className={ok ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {ok ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Correct: <strong>{q.options[q.correctIndex]}</strong> ({q.explanation})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Writing & Speaking Model Benchmarks (All Tasks & All Parts) */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  Writing Tasks &amp; 3-Part Speaking Model Benchmarks
                </h4>

                {gradingDetails && gradingDetails.writingCorrections.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <strong className="text-amber-900 dark:text-amber-200 block">Writing Action Notes:</strong>
                    {gradingDetails.writingCorrections.map((c, i) => (
                      <div key={i}>• {c}</div>
                    ))}
                  </div>
                )}

                {gradingDetails && gradingDetails.speakingCorrections.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <strong className="text-emerald-900 dark:text-emerald-200 block">Speaking Action Notes:</strong>
                    {gradingDetails.speakingCorrections.map((c, i) => (
                      <div key={i}>• {c}</div>
                    ))}
                  </div>
                )}

                {writingTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <strong className="text-slate-900 dark:text-white block">
                      Model {currentExam.level} Writing · Task {idx + 1} ({task.weightPercent}%): {task.partLabel}
                    </strong>
                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                      {task.modelAnswer}
                    </p>
                  </div>
                ))}

                {speakingParts.map((part, idx) => (
                  <div
                    key={part.id}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-900 dark:text-white">
                        Model {currentExam.level} Speaking · Part {idx + 1}: {part.partLabel}
                      </strong>
                      <button
                        type="button"
                        onClick={() => soundEngine.speak(part.modelResponseScript, currentExam.languageId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold shrink-0"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Hear Model</span>
                      </button>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{part.modelResponseScript}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
