import React, { useEffect, useMemo, useState } from 'react';
import {
  AudioLines,
  CheckCircle2,
  Cloud,
  Globe2,
  KeyRound,
  Laptop,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  VoiceProviderType,
  VoiceSettings,
  VoiceSpeakingStyle,
} from '../types';
import {
  checkLocalTTSServer,
  classifyVoiceQuality,
  ELEVENLABS_NEURAL_VOICES,
  GEMINI_NEURAL_VOICES,
  getAccentsForLanguage,
  getAccentOption,
  LOCAL_NEURAL_VOICES,
  LOCAL_TTS_SERVER_PRESETS,
  OPENAI_NEURAL_VOICES,
  soundEngine,
  VOICE_PROVIDER_PRESETS,
} from '../utils/audio';
import { ModalDialog } from './ModalDialog';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSaveSettings: (settings: VoiceSettings) => void;
  activeLanguageId?: string;
}

const PROVIDERS: VoiceProviderType[] = ['system', 'gemini', 'openai', 'elevenlabs', 'local-openai'];

const SPEAKING_STYLES: { id: VoiceSpeakingStyle; label: string; desc: string }[] = [
  { id: 'natural', label: 'Natural Human', desc: 'Warm everyday cadence & pauses' },
  { id: 'tutor', label: 'Language Coach', desc: 'Articulate, encouraging teacher tone' },
  { id: 'conversational', label: 'Conversational', desc: 'Expressive friend-over-coffee flow' },
  { id: 'broadcast', label: 'News Broadcast', desc: 'Crisp BBC / Tagesschau clarity' },
];

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activeLanguageId,
}) => {
  const [draft, setDraft] = useState<VoiceSettings>(settings);
  const [accentTab, setAccentTab] = useState<'english' | 'german'>(
    activeLanguageId === 'german' ? 'german' : 'english'
  );
  const [previewingCode, setPreviewingCode] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [voiceRefreshTick, setVoiceRefreshTick] = useState(0);
  const [localHealth, setLocalHealth] = useState<{ ok: boolean; text: string } | null>(null);
  const [testingLocal, setTestingLocal] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      setDraft(settings);
      setAccentTab(activeLanguageId === 'german' ? 'german' : 'english');
      setPreviewStatus(null);
      setLocalHealth(null);
      setVoiceRefreshTick((t) => t + 1);
      void soundEngine.getNeuralAudioCacheCount().then((count) => {
        if (!cancelled && count > 0) setCacheCount(count);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, settings, activeLanguageId]);

  useEffect(() => {
    if (!isOpen) return;
    return soundEngine.subscribe(() => setVoiceRefreshTick((t) => t + 1));
  }, [isOpen]);

  const accentsForTab = useMemo(() => getAccentsForLanguage(accentTab), [accentTab]);
  const selectedAccentCode = draft.accents[accentTab] || (accentTab === 'german' ? 'de-DE' : 'en-GB');
  const selectedAccent = getAccentOption(selectedAccentCode) ?? accentsForTab[0];

  const humanSystemVoices = useMemo(() => {
    void voiceRefreshTick;
    return soundEngine.getHumanSystemVoices(selectedAccentCode);
  }, [selectedAccentCode, voiceRefreshTick]);

  if (!isOpen) return null;

  const providerPreset = VOICE_PROVIDER_PRESETS[draft.provider];
  const neuralPresets =
    draft.provider === 'gemini'
      ? GEMINI_NEURAL_VOICES
      : draft.provider === 'openai'
      ? OPENAI_NEURAL_VOICES
      : draft.provider === 'elevenlabs'
      ? ELEVENLABS_NEURAL_VOICES
      : LOCAL_NEURAL_VOICES;

  const handleSelectProvider = (provider: VoiceProviderType) => {
    soundEngine.playClickSound();
    const meta = VOICE_PROVIDER_PRESETS[provider];
    setDraft((prev) => ({
      ...prev,
      provider,
      endpoint: meta.defaultEndpoint || prev.endpoint,
      model: meta.defaultModel,
      neuralVoice: meta.defaultVoice || prev.neuralVoice,
    }));
    setPreviewStatus(null);
    setLocalHealth(null);
  };

  const handleTestLocalServer = async () => {
    setTestingLocal(true);
    setLocalHealth(null);
    try {
      const res = await checkLocalTTSServer(draft.endpoint);
      setLocalHealth({ ok: res.ok, text: res.message });
    } finally {
      setTestingLocal(false);
    }
  };

  const handleClearCache = async () => {
    soundEngine.playClickSound();
    await soundEngine.clearNeuralAudioCache();
    setCacheCount(0);
  };

  const handlePreviewAccent = async (accentCode: string) => {
    const opt = getAccentOption(accentCode);
    if (!opt) return;
    setPreviewingCode(accentCode);
    setPreviewStatus(null);
    try {
      const res = await soundEngine.previewVoice(opt.sampleText, accentCode, draft);
      setPreviewStatus({
        ok: res.ok,
        text: res.note ? res.note : `Playing ${opt.flag} ${opt.label} via ${res.engine}`,
      });
    } finally {
      setPreviewingCode(null);
    }
  };

  const handleSave = () => {
    soundEngine.playSuccessChime();
    onSaveSettings(draft);
    onClose();
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} labelledBy="voice-studio-title">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <AudioLines className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="voice-studio-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                Human Voice &amp; Accent Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose natural accents across English &amp; German DACH, filter out robotic voices, or connect neural human TTS.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice settings"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Multi-Accent Selector */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Globe2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>1. Target Accents (English · German DACH)</span>
              </div>

              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAccentTab('english')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    accentTab === 'english'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 English (6 Accents)
                </button>
                <button
                  type="button"
                  onClick={() => setAccentTab('german')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    accentTab === 'german'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇩🇪 German DACH (3 Accents)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {accentsForTab.map((acc) => {
                const isSelected = selectedAccentCode === acc.code;
                return (
                  <div
                    key={acc.code}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/40'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClickSound();
                        setDraft((prev) => ({
                          ...prev,
                          accents: { ...prev.accents, [accentTab]: acc.code },
                        }));
                      }}
                      className="w-full text-left space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {acc.flag} {acc.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {acc.region}
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={previewingCode === acc.code}
                      onClick={() => void handlePreviewAccent(acc.code)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{previewingCode === acc.code ? 'Synthesizing...' : 'Test Accent'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Human Voice Engine */}
          <section className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Voice Model Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROVIDERS.map((p) => {
                const meta = VOICE_PROVIDER_PRESETS[p];
                const selected = draft.provider === p;
                const Icon =
                  meta.mode === 'offline' ? Volume2 : meta.mode === 'local' ? Laptop : Cloud;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectProvider(p)}
                    className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500/15 dark:text-white dark:border-sky-400'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{meta.label}</span>
                      </span>
                    </div>
                    <p
                      className={`text-[11px] leading-snug ${
                        selected ? 'text-slate-300 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {meta.mode === 'offline'
                        ? 'Free · Blocks robotic voices · Uses Siri/Enhanced/Google/Edge Natural'
                        : meta.mode === 'local'
                        ? 'Free · 100% Private local neural model (Kokoro / Speaches)'
                        : 'Studio-grade human voices with expressive accent intonation'}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {providerPreset.setupHint}
            </p>

            {/* System On-Device Voice Picker */}
            {draft.provider === 'system' && (
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Installed Human Voices for {selectedAccent?.flag} {selectedAccent?.label} (Robotic novelty voices hidden)
                </label>
                <select
                  value={draft.preferredSystemVoices[selectedAccentCode] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      preferredSystemVoices: {
                        ...prev.preferredSystemVoices,
                        [selectedAccentCode]: val,
                      },
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">✨ Auto-pick best human / neural voice for {selectedAccentCode}</option>
                  {humanSystemVoices.map((v) => {
                    const tier = classifyVoiceQuality(v);
                    const badge =
                      tier === 'neural'
                        ? '★ Neural/Siri'
                        : tier === 'enhanced'
                        ? '✦ Enhanced/Google'
                        : 'Human';
                    return (
                      <option key={`${v.voiceURI}-${v.name}`} value={v.voiceURI || v.name}>
                        {v.name} ({v.lang}) · {badge}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tip: For the most realistic free voices in a browser, Microsoft Edge provides Azure Online (Natural) voices for all UK/US/AU/IE/IN/DE/AT/CH accents, Safari uses macOS Siri/Enhanced voices, or connect OpenAI <code className="font-mono">gpt-4o-mini-tts</code> above for true studio human audio.
                </p>
              </div>
            )}

            {/* Neural Provider Settings (Gemini / OpenAI / ElevenLabs / Local Neural) */}
            {draft.provider !== 'system' && (
              <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                {draft.provider === 'local-openai' && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                        Quick Local Server Presets
                      </span>
                      <button
                        type="button"
                        disabled={testingLocal}
                        onClick={() => void handleTestLocalServer()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400 transition-colors"
                      >
                        <span>{testingLocal ? 'Checking...' : 'Test Local Server'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {LOCAL_TTS_SERVER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClickSound();
                            setDraft((prev) => ({
                              ...prev,
                              endpoint: preset.endpoint,
                              model: preset.model,
                              neuralVoice: preset.voice,
                            }));
                            setLocalHealth(null);
                          }}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-sky-400 transition-colors"
                        >
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                            {preset.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {preset.note}
                          </div>
                        </button>
                      ))}
                    </div>
                    {localHealth && (
                      <div
                        className={`p-2 rounded-lg text-[11px] border ${
                          localHealth.ok
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {localHealth.text}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-white/70 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                      Apple Silicon quick start: pip install mlx-audio[tts] &amp;&amp; mlx_audio.server --port 8000
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      TTS Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={draft.endpoint}
                      onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      Model
                    </label>
                    <input
                      type="text"
                      value={draft.model}
                      onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                      list="voice-model-suggestions"
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <datalist id="voice-model-suggestions">
                      {providerPreset.suggestedModels.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {providerPreset.requiresApiKey && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <KeyRound className="w-3 h-3" />
                      <span>API Key (Stored locally in browser only)</span>
                    </label>
                    <input
                      type="password"
                      value={draft.apiKey}
                      onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                      placeholder={
                        draft.provider === 'gemini'
                          ? 'AIza... (leave empty if reusing AI Provider Gemini key)'
                          : draft.provider === 'openai'
                          ? 'sk-... (leave empty if reusing AI Provider OpenAI key)'
                          : 'ElevenLabs xi-api-key...'
                      }
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    {draft.provider === 'openai' && (
                      <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.reuseOpenAIKey}
                          onChange={(e) =>
                            setDraft({ ...draft, reuseOpenAIKey: e.target.checked })
                          }
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>Automatically reuse my OpenAI key from AI Provider settings</span>
                      </label>
                    )}
                    {draft.provider === 'gemini' && (
                      <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.reuseGeminiKey !== false}
                          onChange={(e) =>
                            setDraft({ ...draft, reuseGeminiKey: e.target.checked })
                          }
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>Automatically reuse my Gemini key from AI Provider settings</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Human Voice Persona Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                    Human Voice Persona
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {neuralPresets.map((vp) => {
                      const active = draft.neuralVoice === vp.id;
                      return (
                        <button
                          key={vp.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClickSound();
                            setDraft({ ...draft, neuralVoice: vp.id });
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-colors ${
                            active
                              ? 'bg-sky-500/15 border-sky-500 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                          }`}
                        >
                          <div className="text-xs font-bold">{vp.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {vp.note}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={draft.neuralVoice}
                    onChange={(e) => setDraft({ ...draft, neuralVoice: e.target.value })}
                    placeholder="Or enter any custom voice ID..."
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </section>

          {/* 3. Speaking Style & Natural Pace */}
          <section className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Speaking Style &amp; Natural Cadence
              </span>
              <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300">
                Speed: {draft.rateMultiplier.toFixed(2)}x
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPEAKING_STYLES.map((st) => {
                const active = draft.speakingStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, speakingStyle: st.id })}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      active
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{st.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        active ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {st.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">0.75x Deliberate</span>
              <input
                type="range"
                min={0.75}
                max={1.25}
                step={0.05}
                value={draft.rateMultiplier}
                onChange={(e) =>
                  setDraft({ ...draft, rateMultiplier: parseFloat(e.target.value) })
                }
                aria-label="Speaking speed multiplier"
                className="flex-1 accent-sky-600"
              />
              <span className="text-[11px] font-mono text-slate-500">1.25x Native Fast</span>
            </div>

            {previewStatus && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  previewStatus.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                {previewStatus.text}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Keys stay local · Offline fallback enabled</span>
            </span>
            {cacheCount > 0 && (
              <button
                type="button"
                onClick={() => void handleClearCache()}
                className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-medium hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                Clear Audio Cache ({cacheCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handlePreviewAccent(selectedAccentCode)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-sky-400 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Test Voice</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Voice Profile</span>
            </button>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
