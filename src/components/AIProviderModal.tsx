import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Cpu,
  Cloud,
  Laptop,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
  DownloadCloud,
  Search,
} from 'lucide-react';
import { AIModelInfo, AIProviderConfig, AIProviderType } from '../types';
import {
  AI_PROVIDER_PRESETS,
  fetchAvailableModels,
  getDefaultAIConfig,
  testAIProviderConnection,
} from '../utils/aiClient';
import { soundEngine } from '../utils/audio';
import { ModalDialog } from './ModalDialog';

interface AIProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (config: AIProviderConfig) => void;
}

const LOCAL_PROVIDERS: AIProviderType[] = ['ollama', 'lmstudio'];
const CLOUD_PROVIDERS: AIProviderType[] = ['openai', 'gemini', 'openrouter', 'custom'];

export const AIProviderModal: React.FC<AIProviderModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [draft, setDraft] = useState<AIProviderConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    latencyMs: number;
    reply?: string;
    error?: string;
  } | null>(null);

  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModelInfo[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDraft(config);
      setTestResult(null);
      setAvailableModels([]);
      setModelsError(null);
      setModelSearch('');
    }
  }, [isOpen, config]);

  const filteredFetchedModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    if (!q) return availableModels;
    return availableModels.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        (m.displayName && m.displayName.toLowerCase().includes(q))
    );
  }, [availableModels, modelSearch]);

  if (!isOpen) return null;

  const preset = AI_PROVIDER_PRESETS[draft.provider];

  const handleSelectProvider = (provider: AIProviderType) => {
    soundEngine.playClickSound();
    const defaults = getDefaultAIConfig(provider);
    setDraft({
      ...defaults,
      enabled: true,
      apiKey: provider === config.provider ? config.apiKey : '',
    });
    setTestResult(null);
    setAvailableModels([]);
    setModelsError(null);
    setModelSearch('');
  };

  const handleFetchModels = async () => {
    soundEngine.playClickSound();
    setFetchingModels(true);
    setModelsError(null);
    try {
      const models = await fetchAvailableModels(draft);
      setAvailableModels(models);
      setModelSearch('');
      if (
        models.length > 0 &&
        (!draft.model.trim() ||
          draft.model === 'local-model' ||
          !models.some((m) => m.id === draft.model))
      ) {
        setDraft((prev) => ({ ...prev, model: models[0].id }));
      }
      soundEngine.playSuccessChime();
    } catch (err) {
      setAvailableModels([]);
      setModelsError(err instanceof Error ? err.message : 'Unable to fetch models.');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleTest = async () => {
    soundEngine.playClickSound();
    setTesting(true);
    setTestResult(null);
    const res = await testAIProviderConnection({ ...draft, enabled: true });
    setTesting(false);
    setTestResult(res);
    if (res.ok) {
      soundEngine.playSuccessChime();
    }
  };

  const handleSave = () => {
    soundEngine.playSuccessChime();
    onSaveConfig({ ...draft, enabled: true });
    onClose();
  };

  const handleDisable = () => {
    soundEngine.playClickSound();
    onSaveConfig({ ...draft, enabled: false, apiKey: '' });
    onClose();
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} labelledBy="ai-provider-modal-title" maxWidthClass="max-w-2xl">
      <div className="flex flex-col max-h-[88dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ai-provider-modal-title" className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Connect Local or Cloud AI Provider
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Power Reading labs, Listening script generation, Writing CEFR grading, and live Speaking roleplays.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Provider Type Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Local AI (Free &amp; Private)</span>
              </span>
              <div className="space-y-1.5">
                {LOCAL_PROVIDERS.map((p) => {
                  const item = AI_PROVIDER_PRESETS[p];
                  const active = draft.provider === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handleSelectProvider(p)}
                      className={`w-full px-3 py-2.5 rounded-xl text-left border text-xs transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-slate-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Local
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Cloud AI APIs</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CLOUD_PROVIDERS.map((p) => {
                  const item = AI_PROVIDER_PRESETS[p];
                  const active = draft.provider === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handleSelectProvider(p)}
                      className={`px-3 py-2.5 rounded-xl text-left border text-xs transition-colors ${
                        active
                          ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-slate-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate">{item.label.split(' (')[0]}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.mode}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Setup Hint */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <span className="font-mono font-bold uppercase text-[10px] text-sky-700 dark:text-sky-400 block">
              {preset.label} Setup Tip
            </span>
            <p className="font-mono text-[11px] break-words">{preset.setupHint}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-slate-700/70">
              <strong>Apple Intelligence On-Device Model:</strong> Available directly with zero setup inside the native <strong>LinguaVerve MacBook / iPad / iPhone</strong> app (via Apple&apos;s native <code>FoundationModels</code> framework on macOS 26 / iOS 26+).
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-3.5">
            <div>
              <label htmlFor="ai-endpoint-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Endpoint URL
              </label>
              <input
                id="ai-endpoint-input"
                type="url"
                value={draft.endpoint}
                onChange={(e) => {
                  setDraft({ ...draft, endpoint: e.target.value });
                  setAvailableModels([]);
                  setModelsError(null);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label htmlFor="ai-model-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Model Name
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchModels}
                    disabled={fetchingModels}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 disabled:opacity-50 transition-colors"
                  >
                    {fetchingModels ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <DownloadCloud className="w-3 h-3" />
                    )}
                    <span>{fetchingModels ? 'Fetching...' : 'Fetch Models'}</span>
                  </button>
                </div>

                <input
                  id="ai-model-input"
                  type="text"
                  value={draft.model}
                  onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />

                {/* Fetched Live Models Picker */}
                {availableModels.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300">
                        Available Models ({availableModels.length})
                      </span>
                      {availableModels.length > 8 && (
                        <div className="relative flex-1 max-w-[160px]">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            aria-label="Filter fetched models"
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                            placeholder="Filter..."
                            className="w-full pl-6 pr-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      )}
                    </div>

                    <select
                      aria-label="Select fetched AI model"
                      value={
                        filteredFetchedModels.some((m) => m.id === draft.model)
                          ? draft.model
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setDraft({ ...draft, model: e.target.value });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100"
                    >
                      {!filteredFetchedModels.some((m) => m.id === draft.model) && (
                        <option value="">
                          {filteredFetchedModels.length > 0
                            ? `Choose from ${filteredFetchedModels.length} model(s)...`
                            : 'No matching models'}
                        </option>
                      )}
                      {filteredFetchedModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.displayName ? `${m.id} — ${m.displayName}` : m.id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modelsError && (
                  <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="break-words">{modelsError}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {preset.suggestedModels.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setDraft({ ...draft, model: m })}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="ai-key-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key {preset.requiresKey ? '(Required)' : '(Optional for Local)'}
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="ai-key-input"
                    type="password"
                    value={draft.apiKey}
                    placeholder={preset.requiresKey ? 'Paste your API key...' : 'Not needed for Ollama / LM Studio'}
                    onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Stored locally in your browser only. Direct client-to-provider calls.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Connection Test Output */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold">
                  {testResult.ok
                    ? `Connected successfully (${testResult.latencyMs}ms)`
                    : `Connection failed (${testResult.latencyMs}ms)`}
                </div>
                <p className="font-mono text-[11px] break-words">
                  {testResult.ok ? testResult.reply : testResult.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {config.enabled && (
              <button
                type="button"
                onClick={handleDisable}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect &amp; Clear Key</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save &amp; Enable AI</span>
          </button>
        </div>
      </div>
    </ModalDialog>
  );
};
