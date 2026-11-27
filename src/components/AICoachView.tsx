import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Cpu,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  AIChatMessage,
  AIEvaluationResult,
  AIProviderConfig,
  AISessionRecord,
  CEFRLevel,
  SkillType,
} from '../types';
import {
  AI_PROVIDER_PRESETS,
  buildSkillCoachSystemPrompt,
  callAIProvider,
  evaluateWithAIOrFallback,
  isAIConfigReady,
} from '../utils/aiClient';
import { resolveAIConfigForLanguage } from '../utils/aiModelAdvisor';
import { soundEngine } from '../utils/audio';
import {
  isSpeechRecognitionSupported,
  SpeechRecorderHandle,
  startSpeechRecognition,
} from '../utils/speechRecognition';

interface AICoachViewProps {
  activeLanguageId: string;
  onSelectLanguage: (langId: string) => void;
  initialLevel?: CEFRLevel;
  initialSkill?: SkillType;
  seedPrompt?: string;
  aiConfig: AIProviderConfig;
  onOpenAISettings: () => void;
  onLogAISession: (session: AISessionRecord) => void;
}

const SKILL_TABS: { id: SkillType; label: string; icon: React.ComponentType<{ className?: string }>; starters: (lang: string, level: CEFRLevel) => string[] }[] = [
  {
    id: 'reading',
    label: 'Reading Lab',
    icon: BookOpen,
    starters: (lang, level) => [
      `Generate a ${level} ${lang} exam reading passage with 3 True/False/Inference questions.`,
      `Explain the trickiest grammar structures typical of ${level} ${lang} reading exams.`,
    ],
  },
  {
    id: 'listening',
    label: 'Listening & Hearing',
    icon: Headphones,
    starters: (lang, level) => [
      `Create a ${level} ${lang} [AUDIO SCRIPT] dialogue with a hidden trap + 2 listening questions.`,
      `Give me a minimal-pair hearing discrimination drill for ${level} ${lang} phonetics.`,
    ],
  },
  {
    id: 'writing',
    label: 'Writing Examiner',
    icon: PenTool,
    starters: (lang, level) => [
      `Give me an authentic ${level} ${lang} certification writing task and checklist.`,
      `Grade my draft text strictly against official ${level} ${lang} exam rubrics.`,
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking Partner',
    icon: Mic,
    starters: (lang, level) => [
      `Start an interactive ${level} ${lang} speaking exam roleplay with me right now.`,
      `Give me a ${level} ${lang} cue card and ask realistic examiner follow-up questions.`,
    ],
  },
];

export const AICoachView: React.FC<AICoachViewProps> = ({
  activeLanguageId,
  onSelectLanguage,
  initialLevel,
  initialSkill,
  seedPrompt,
  aiConfig,
  onOpenAISettings,
  onLogAISession,
}) => {
  const coachLang = activeLanguageId === 'german' ? 'german' : 'english';
  const langName = coachLang === 'german' ? 'German' : 'English';

  const [level, setLevel] = useState<CEFRLevel>(initialLevel || 'B1');
  const [skill, setSkill] = useState<SkillType>(initialSkill || 'speaking');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState(seedPrompt || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [offlineEval, setOfflineEval] = useState<AIEvaluationResult | null>(null);
  const recorderRef = useRef<SpeechRecorderHandle | null>(null);

  useEffect(() => {
    if (initialLevel) setLevel(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    if (initialSkill) setSkill(initialSkill);
  }, [initialSkill]);

  useEffect(() => {
    if (seedPrompt) setInput(seedPrompt);
  }, [seedPrompt]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      soundEngine.stopSpeech();
    };
  }, []);

  const aiReady = isAIConfigReady(aiConfig);
  const preset = AI_PROVIDER_PRESETS[aiConfig.provider];

  const handleToggleMic = () => {
    if (isListeningMic) {
      recorderRef.current?.stop();
      recorderRef.current = null;
      setIsListeningMic(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Browser speech recognition is unavailable here—type your spoken message instead.');
      return;
    }
    setErrorMsg(null);
    const handle = startSpeechRecognition({
      languageId: coachLang,
      onTranscript: (finalText, interim) => {
        setInput([finalText, interim].filter(Boolean).join(' '));
      },
      onError: () => setIsListeningMic(false),
      onEnd: () => setIsListeningMic(false),
    });
    if (handle) {
      recorderRef.current = handle;
      setIsListeningMic(true);
    }
  };

  const handleSend = async (customText?: string) => {
    const promptText = (customText ?? input).trim();
    if (!promptText || loading) return;

    soundEngine.playClickSound();
    setErrorMsg(null);
    setOfflineEval(null);

    if (!aiReady) {
      // Offer instant built-in rubric grading for writing/speaking even offline!
      if (skill === 'writing' || skill === 'speaking') {
        const evalRes = await evaluateWithAIOrFallback({
          config: aiConfig,
          text: promptText,
          languageId: coachLang,
          level,
          skill,
          taskPrompt: `${langName} ${level} ${skill} coaching practice`,
          minWords: 25,
          expectedKeywords: [],
        });
        setOfflineEval(evalRes);
        onLogAISession({
          id: `aisess-${Date.now()}`,
          timestamp: new Date().toISOString(),
          languageId: coachLang,
          level,
          skill,
          provider: evalRes.providerLabel,
          summary: `Offline rubric check (${evalRes.score}/100, est. ${evalRes.cefrEstimate})`,
          score: evalRes.score,
        });
      } else {
        setErrorMsg('Connect a Local (Ollama / LM Studio) or Cloud (OpenAI / Gemini / OpenRouter) AI provider to generate live Reading & Listening exercises.');
      }
      return;
    }

    const userMsg: AIChatMessage = { role: 'user', content: promptText };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = buildSkillCoachSystemPrompt({
        languageId: coachLang,
        level,
        skill,
      });

      const effectiveConfig = resolveAIConfigForLanguage(aiConfig, coachLang);
      const reply = await callAIProvider(effectiveConfig, [
        { role: 'system', content: systemPrompt },
        ...nextHistory.slice(-10),
      ]);

      const assistantMsg: AIChatMessage = { role: 'assistant', content: reply };
      setMessages([...nextHistory, assistantMsg]);

      onLogAISession({
        id: `aisess-${Date.now()}`,
        timestamp: new Date().toISOString(),
        languageId: coachLang,
        level,
        skill,
        provider: `${preset.label} (${effectiveConfig.model})`,
        summary: promptText.slice(0, 75),
      });

      if (autoSpeakReplies && (skill === 'listening' || skill === 'speaking')) {
        const audioMatch = reply.match(/\[AUDIO SCRIPT\]([\s\S]*?)(\[|$)/i);
        const textToSpeak = audioMatch ? audioMatch[1].trim() : reply.split('[COACH NOTE]')[0].trim();
        soundEngine.speak(textToSpeak.slice(0, 420), coachLang, false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'AI request failed. Check your endpoint or API key.');
    } finally {
      setLoading(false);
    }
  };

  const activeSkillTab = SKILL_TABS.find((t) => t.id === skill) || SKILL_TABS[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Studio Header & Provider Bar */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Bot className="w-3.5 h-3.5" />
              <span>AI 4-Skill Mastery Studio · Local &amp; Cloud Ready</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Personal AI Examiner &amp; Immersion Coach
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Connect a private local model (<strong>Ollama</strong>, <strong>LM Studio</strong>) or cloud API (<strong>OpenAI</strong>, <strong>Google Gemini</strong>, <strong>OpenRouter</strong>) to drill Reading, Listening/Hearing, Writing, and Voice Speaking on demand.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAISettings}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors shrink-0 self-start lg:self-center ${
              aiReady
                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>
              {aiReady ? `${preset.label} · ${aiConfig.model}` : 'Configure Local / Cloud AI'}
            </span>
          </button>
        </div>

        {/* Language + Level + 4-Skill Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onSelectLanguage('english')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  coachLang === 'english' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('german')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  coachLang === 'german' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                🇩🇪 German
              </button>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                    level === lvl
                      ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeakReplies}
              onChange={(e) => setAutoSpeakReplies(e.target.checked)}
              className="rounded"
            />
            <span>Auto-speak Listening &amp; Speaking replies</span>
          </label>
        </div>

        {/* 4 Skill Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SKILL_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = skill === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                aria-pressed={active}
                onClick={() => {
                  soundEngine.playClickSound();
                  setSkill(tab.id);
                  setMessages([]);
                  setOfflineEval(null);
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-[#FAF9F6] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Chat / Lab Panel */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Starter Prompts */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Prompts:
            </span>
            {activeSkillTab.starters(langName, level).map((starter, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => void handleSend(starter)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors text-left"
              >
                {starter}
              </button>
            ))}
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setOfflineEval(null);
              }}
              className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="p-5 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
          {messages.length === 0 && !offlineEval && (
            <div className="py-10 text-center space-y-2 text-slate-500 dark:text-slate-400">
              <Bot className="w-9 h-9 mx-auto text-sky-500/70" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {langName} {level} · {activeSkillTab.label} Ready
              </p>
              <p className="text-xs max-w-md mx-auto">
                {aiReady
                  ? `Connected to ${preset.label} (${aiConfig.model}). Click a Quick Prompt above or send your own ${langName} text/voice message.`
                  : 'For Writing & Speaking, paste a draft below for instant built-in CEFR rubric scoring — or click "Configure Local / Cloud AI" for full interactive AI coaching.'}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white dark:bg-sky-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>{msg.content}</div>
                {msg.role === 'assistant' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => soundEngine.speak(msg.content.slice(0, 450), coachLang, false)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900 text-[11px] font-semibold text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen ({langName})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Offline Heuristic Evaluation Card */}
          {offlineEval && (
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {offlineEval.providerLabel} · Estimated Band: {offlineEval.cefrEstimate}
                </span>
                <span className="font-mono font-extrabold text-base text-sky-700 dark:text-sky-300">
                  {offlineEval.score}/100
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">{offlineEval.examinerSummary}</p>
              {offlineEval.strengths.length > 0 && (
                <div>
                  <strong className="text-emerald-700 dark:text-emerald-400">Strengths:</strong>
                  <ul className="mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
                    {offlineEval.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {offlineEval.corrections.length > 0 && (
                <div>
                  <strong className="text-amber-700 dark:text-amber-300">Next Upgrades:</strong>
                  <ul className="mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
                    {offlineEval.corrections.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-xs font-mono text-slate-500 animate-pulse">
              {preset.label} ({aiConfig.model}) is thinking...
            </div>
          )}
        </div>

        {/* Error Box */}
        {errorMsg && (
          <div className="mx-5 mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={onOpenAISettings}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold shrink-0"
            >
              AI Setup
            </button>
          </div>
        )}

        {/* Composer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-end gap-2">
          <button
            type="button"
            onClick={handleToggleMic}
            title="Dictate aloud with microphone"
            aria-label="Toggle voice input"
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              isListeningMic
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500'
            }`}
          >
            {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              skill === 'writing'
                ? `Paste a ${level} ${langName} essay/email to grade, or ask for an exam task...`
                : skill === 'speaking'
                ? `Speak with the mic or type your ${level} ${langName} response...`
                : `Ask your ${level} ${langName} ${activeSkillTab.label} AI coach...`
            }
            className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 resize-none"
          />

          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => void handleSend()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{aiReady ? 'Send' : skill === 'writing' || skill === 'speaking' ? 'Grade' : 'Send'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
