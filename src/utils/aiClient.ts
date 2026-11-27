import {
  AIChatMessage,
  AIEvaluationResult,
  AIModelInfo,
  AIProviderConfig,
  AIProviderType,
  CEFRLevel,
  ExamCorrectionItem,
  OfficialRubricBreakdown,
  SkillType,
} from '../types';
import { resolveAIConfigForLanguage } from './aiModelAdvisor';

export const AI_CONFIG_STORAGE_KEY = 'linguaverve_ai_provider_v1';

export interface AIProviderPreset {
  provider: AIProviderType;
  label: string;
  mode: 'local' | 'cloud';
  defaultEndpoint: string;
  defaultModel: string;
  suggestedModels: string[];
  requiresKey: boolean;
  setupHint: string;
}

export const AI_PROVIDER_PRESETS: Record<AIProviderType, AIProviderPreset> = {
  ollama: {
    provider: 'ollama',
    label: 'Ollama (Local AI)',
    mode: 'local',
    defaultEndpoint: 'http://localhost:11434/v1/chat/completions',
    defaultModel: 'llama3.2',
    suggestedModels: ['llama3.2', 'qwen2.5:7b', 'gemma3', 'mistral'],
    requiresKey: false,
    setupHint: 'Run locally with CORS enabled for browser access: OLLAMA_ORIGINS="*" ollama serve',
  },
  lmstudio: {
    provider: 'lmstudio',
    label: 'LM Studio (Local Server)',
    mode: 'local',
    defaultEndpoint: 'http://localhost:1234/v1/chat/completions',
    defaultModel: 'local-model',
    suggestedModels: ['local-model', 'qwen2.5-7b-instruct', 'llama-3.2-3b-instruct'],
    requiresKey: false,
    setupHint: 'Start Local Server in LM Studio and enable "Enable CORS" in Server Settings.',
  },
  openai: {
    provider: 'openai',
    label: 'OpenAI (Cloud)',
    mode: 'cloud',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    requiresKey: true,
    setupHint: 'Uses your OpenAI API key stored strictly in this browser’s localStorage.',
  },
  gemini: {
    provider: 'gemini',
    label: 'Google Gemini (Cloud)',
    mode: 'cloud',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash',
    suggestedModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    requiresKey: true,
    setupHint: 'Create a free/paid API key in Google AI Studio. Calls Gemini REST API directly.',
  },
  openrouter: {
    provider: 'openrouter',
    label: 'OpenRouter (Multi-Model Cloud)',
    mode: 'cloud',
    defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.5-flash',
    suggestedModels: ['google/gemini-2.5-flash', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini', 'deepseek/deepseek-chat'],
    requiresKey: true,
    setupHint: 'One key unlocks Claude, Gemini, GPT-4o, and open-weights models with browser CORS support.',
  },
  custom: {
    provider: 'custom',
    label: 'Custom OpenAI-Compatible API',
    mode: 'cloud',
    defaultEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    suggestedModels: ['llama-3.3-70b-versatile', 'mistral-small-latest'],
    requiresKey: false,
    setupHint: 'Connect any OpenAI-compatible local gateway (vLLM, LocalAI) or cloud API (Groq, Mistral, Together).',
  },
};

export function getDefaultAIConfig(provider: AIProviderType = 'ollama'): AIProviderConfig {
  const preset = AI_PROVIDER_PRESETS[provider];
  return {
    provider,
    mode: preset.mode,
    endpoint: preset.defaultEndpoint,
    model: preset.defaultModel,
    apiKey: '',
    temperature: 0.4,
    enabled: false,
  };
}

export function loadAIConfig(): AIProviderConfig {
  if (typeof window === 'undefined') return getDefaultAIConfig('ollama');
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return getDefaultAIConfig('ollama');
    const parsed = JSON.parse(raw) as Partial<AIProviderConfig>;
    const provider = parsed.provider && AI_PROVIDER_PRESETS[parsed.provider] ? parsed.provider : 'ollama';
    const base = getDefaultAIConfig(provider);
    return {
      ...base,
      ...parsed,
      provider,
      mode: parsed.mode || base.mode,
    };
  } catch {
    return getDefaultAIConfig('ollama');
  }
}

export function saveAIConfig(config: AIProviderConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors
  }
}

export function isAIConfigReady(config: AIProviderConfig): boolean {
  if (!config.enabled || !config.endpoint.trim() || !config.model.trim()) return false;
  const preset = AI_PROVIDER_PRESETS[config.provider];
  if (preset.requiresKey && !config.apiKey.trim()) return false;
  return true;
}

/**
 * Derives candidate model-listing endpoint URL(s) for a configured provider & chat endpoint.
 * For Ollama, returns both the OpenAI-compatible `/v1/models` and native `/api/tags` endpoints
 * so model discovery works regardless of proxy or Ollama version.
 */
export function resolveModelsEndpoints(
  provider: AIProviderType,
  endpoint: string,
  apiKey = ''
): string[] {
  const trimmed = endpoint.trim().replace(/\/+$/, '');
  if (!trimmed) return [];

  if (provider === 'gemini') {
    const base = trimmed.replace(/:generateContent.*$/i, '').replace(/\/models\/[^/]+$/i, '/models');
    const modelsBase = /\/models$/i.test(base) ? base : `${base}/models`;
    const sep = modelsBase.includes('?') ? '&' : '?';
    const keyParam = apiKey.trim() ? `key=${encodeURIComponent(apiKey.trim())}&` : '';
    return [`${modelsBase}${sep}${keyParam}pageSize=100`];
  }

  const deriveOpenAIModelsUrl = (raw: string): string => {
    if (/\/chat\/completions$/i.test(raw)) return raw.replace(/\/chat\/completions$/i, '/models');
    if (/\/completions$/i.test(raw)) return raw.replace(/\/completions$/i, '/models');
    if (/\/api\/chat$/i.test(raw)) return raw.replace(/\/api\/chat$/i, '/api/tags');
    if (/\/models$/i.test(raw) || /\/api\/tags$/i.test(raw)) return raw;
    return `${raw}/models`;
  };

  const primary = deriveOpenAIModelsUrl(trimmed);

  if (provider === 'ollama') {
    let originTags = '';
    try {
      const parsed = new URL(trimmed);
      originTags = `${parsed.origin}/api/tags`;
    } catch {
      originTags = '';
    }
    const urls = [primary];
    if (originTags && !urls.includes(originTags)) {
      urls.push(originTags);
    }
    return urls;
  }

  return [primary];
}

function isLikelyOpenAINonChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  return (
    lower.includes('embedding') ||
    lower.startsWith('whisper') ||
    lower.startsWith('tts-') ||
    lower.startsWith('dall-e') ||
    lower.startsWith('gpt-image') ||
    lower.startsWith('babbage') ||
    lower.startsWith('davinci') ||
    lower.startsWith('text-') ||
    lower.includes('moderation') ||
    lower.includes('transcribe') ||
    lower.includes('realtime') ||
    lower.includes('audio-preview')
  );
}

function parseModelsPayload(provider: AIProviderType, payload: unknown): AIModelInfo[] {
  const rawModels: AIModelInfo[] = [];

  if (provider === 'gemini' && payload && typeof payload === 'object') {
    const models = (payload as { models?: Array<Record<string, unknown>> }).models;
    if (Array.isArray(models)) {
      for (const item of models) {
        const rawName = typeof item.name === 'string' ? item.name.trim() : '';
        if (!rawName) continue;
        const methods = Array.isArray(item.supportedGenerationMethods)
          ? (item.supportedGenerationMethods as unknown[]).filter((m): m is string => typeof m === 'string')
          : [];
        if (methods.length > 0 && !methods.includes('generateContent')) continue;
        const id = rawName.replace(/^models\//i, '');
        if (id.toLowerCase().includes('embedding')) continue;
        const displayName = typeof item.displayName === 'string' ? item.displayName.trim() : undefined;
        const inputTokenLimit = typeof item.inputTokenLimit === 'number' ? item.inputTokenLimit : undefined;
        rawModels.push({
          id,
          displayName: displayName && displayName !== id ? displayName : undefined,
          ownedBy: 'google',
          contextLength: inputTokenLimit,
        });
      }
    }
  } else if (payload && typeof payload === 'object') {
    const obj = payload as {
      data?: Array<Record<string, unknown>>;
      models?: Array<Record<string, unknown>>;
    };

    if (Array.isArray(obj.data)) {
      for (const item of obj.data) {
        const id =
          typeof item.id === 'string'
            ? item.id.trim()
            : typeof item.name === 'string'
            ? item.name.trim()
            : '';
        if (!id) continue;
        const displayName = typeof item.name === 'string' && item.name.trim() !== id ? item.name.trim() : undefined;
        const ownedBy = typeof item.owned_by === 'string' ? item.owned_by : undefined;
        const contextLength = typeof item.context_length === 'number' ? item.context_length : undefined;
        rawModels.push({ id, displayName, ownedBy, contextLength });
      }
    } else if (Array.isArray(obj.models)) {
      // Ollama `/api/tags` format
      for (const item of obj.models) {
        const id =
          typeof item.name === 'string'
            ? item.name.trim()
            : typeof item.model === 'string'
            ? item.model.trim()
            : typeof item.id === 'string'
            ? item.id.trim()
            : '';
        if (!id) continue;
        const details = item.details as { parameter_size?: string; family?: string } | undefined;
        const paramSize = typeof details?.parameter_size === 'string' ? details.parameter_size.trim() : '';
        rawModels.push({
          id,
          displayName: paramSize ? `${id} (${paramSize})` : undefined,
          ownedBy: typeof details?.family === 'string' ? details.family : 'ollama',
        });
      }
    }
  } else if (Array.isArray(payload)) {
    for (const item of payload) {
      if (typeof item === 'string' && item.trim()) {
        rawModels.push({ id: item.trim() });
      } else if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>;
        const id = typeof rec.id === 'string' ? rec.id.trim() : typeof rec.name === 'string' ? rec.name.trim() : '';
        if (id) rawModels.push({ id });
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  let deduped = rawModels.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // For OpenAI specifically, filter out non-chat models (embeddings, whisper, tts, dall-e) when chat models exist
  if (provider === 'openai') {
    const chatOnly = deduped.filter((m) => !isLikelyOpenAINonChatModel(m.id));
    if (chatOnly.length > 0) {
      deduped = chatOnly;
    }
    deduped.sort((a, b) => {
      const priority = (id: string) => {
        if (/^gpt-4\.1|^gpt-4o|^gpt-5/i.test(id)) return 0;
        if (/^o[1-9]/i.test(id)) return 1;
        if (/^gpt-/i.test(id)) return 2;
        return 3;
      };
      const diff = priority(a.id) - priority(b.id);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });
  } else if (provider === 'gemini') {
    deduped.sort((a, b) => {
      const rank = (id: string) => (/2\.5/i.test(id) ? 0 : /2\.0/i.test(id) ? 1 : /1\.5/i.test(id) ? 2 : 3);
      const diff = rank(a.id) - rank(b.id);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });
  }

  return deduped;
}

/**
 * Fetches live available models directly from the configured Local or Cloud AI provider.
 */
export async function fetchAvailableModels(
  config: Pick<AIProviderConfig, 'provider' | 'endpoint' | 'apiKey'>,
  fetchImpl: typeof fetch = fetch
): Promise<AIModelInfo[]> {
  const preset = AI_PROVIDER_PRESETS[config.provider];
  const trimmedEndpoint = config.endpoint.trim();
  if (!trimmedEndpoint) {
    throw new Error('AI endpoint URL is required to fetch available models.');
  }

  const trimmedKey = config.apiKey.trim();
  const requiresKeyForListing = config.provider === 'openai' || config.provider === 'gemini';
  if (requiresKeyForListing && !trimmedKey) {
    throw new Error(`Enter your ${preset.label} API key first to fetch available models.`);
  }

  const candidateUrls = resolveModelsEndpoints(config.provider, trimmedEndpoint, trimmedKey);
  if (candidateUrls.length === 0) {
    throw new Error('Could not resolve a models endpoint URL for this provider.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (config.provider !== 'gemini' && trimmedKey) {
    headers.Authorization = `Bearer ${trimmedKey}`;
  }
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://linguaverve.local';
    headers['X-Title'] = 'LinguaVerve Polyglot Studio';
  }

  let lastError: Error | null = null;

  for (const url of candidateUrls) {
    try {
      const res = await fetchImpl(url, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastError = new Error(`${preset.label} HTTP ${res.status}: ${errText.slice(0, 160) || res.statusText}`);
        continue;
      }

      const data = (await res.json()) as unknown;
      const models = parseModelsPayload(config.provider, data);
      if (models.length > 0) {
        return models;
      }
      lastError = new Error(`No models were returned by ${preset.label}.`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Failed to fetch models.');
    }
  }

  throw lastError ?? new Error(`Unable to fetch models from ${preset.label}.`);
}

/**
 * Core HTTP completion call supporting both Local (Ollama, LM Studio) & Cloud (OpenAI, Gemini, OpenRouter, Custom).
 */
export async function callAIProvider(
  config: AIProviderConfig,
  messages: AIChatMessage[],
  fetchImpl: typeof fetch = fetch
): Promise<string> {
  if (!config.endpoint.trim()) {
    throw new Error('AI endpoint URL is required.');
  }
  const preset = AI_PROVIDER_PRESETS[config.provider];
  if (preset.requiresKey && !config.apiKey.trim()) {
    throw new Error(`${preset.label} requires an API key.`);
  }

  if (config.provider === 'gemini') {
    const baseUrl = config.endpoint.replace(/\/$/, '');
    const url = `${baseUrl}/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;
    const systemMsg = messages.find((m) => m.role === 'system')?.content;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: config.temperature,
      },
    };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg }] };
    }

    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 180) || res.statusText}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';
    if (!text.trim()) throw new Error('Gemini returned an empty response.');
    return text.trim();
  }

  // OpenAI-compatible protocol: Ollama, LM Studio, OpenAI, OpenRouter, Custom
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey.trim()) {
    headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  }
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://linguaverve.local';
    headers['X-Title'] = 'LinguaVerve Polyglot Studio';
  }

  const res = await fetchImpl(config.endpoint.trim(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model.trim(),
      messages,
      temperature: config.temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${preset.label} HTTP ${res.status}: ${errText.slice(0, 180) || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    message?: { content?: string };
  };
  const content = data.choices?.[0]?.message?.content ?? data.message?.content ?? '';
  if (!content.trim()) throw new Error(`${preset.label} returned an empty response.`);
  return content.trim();
}

export async function testAIProviderConnection(
  config: AIProviderConfig,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: boolean; latencyMs: number; reply?: string; error?: string }> {
  const start = Date.now();
  try {
    const reply = await callAIProvider(
      config,
      [
        { role: 'system', content: 'You are a concise connection check assistant.' },
        { role: 'user', content: 'Reply with exactly: LinguaVerve AI ready.' },
      ],
      fetchImpl
    );
    return { ok: true, latencyMs: Math.max(1, Date.now() - start), reply };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.max(1, Date.now() - start),
      error: err instanceof Error ? err.message : 'Connection failed.',
    };
  }
}

/**
 * Deterministic offline rubric evaluator so learners ALWAYS get meaningful CEFR feedback
 * even without connecting a local or cloud AI model.
 */
export function evaluateSubmissionOffline(params: {
  text: string;
  languageId: string;
  level: CEFRLevel;
  skill: 'writing' | 'speaking';
  minWords: number;
  expectedKeywords: string[];
}): AIEvaluationResult {
  const cleaned = params.text.trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      score: 0,
      cefrEstimate: 'A1',
      strengths: [],
      corrections: ['No response was provided. Aim to answer every bullet point in the prompt.'],
      upgradedVersion: '',
      examinerSummary: 'Empty submission — write or dictate your response to receive CEFR band scoring.',
      source: 'offline-rubric',
      providerLabel: 'Built-in CEFR Rubric Engine',
    };
  }

  const lowerText = cleaned.toLowerCase();
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-zäöüß]/gi, '')).filter(Boolean));
  const lexicalDiversity = uniqueWords.size / Math.max(1, wordCount);

  const lengthRatio = Math.min(1, wordCount / Math.max(12, params.minWords));
  const matchedKeywords = params.expectedKeywords.filter((kw) => lowerText.includes(kw.toLowerCase()));
  const keywordScore =
    params.expectedKeywords.length > 0
      ? matchedKeywords.length / params.expectedKeywords.length
      : 0.7;

  const connectors =
    params.languageId === 'german'
      ? ['weil', 'obwohl', 'deshalb', 'außerdem', 'jedoch', 'allerdings', 'einerseits', 'andererseits', 'dennoch', 'darüber hinaus', 'meiner meinung nach']
      : ['because', 'although', 'however', 'moreover', 'furthermore', 'therefore', 'nevertheless', 'whereas', 'consequently', 'in addition', 'on the other hand'];

  const matchedConnectors = connectors.filter((c) => lowerText.includes(c));
  const cohesionScore = Math.min(1, matchedConnectors.length / (params.level === 'A1' || params.level === 'A2' ? 1 : 2));

  const sentenceCount = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 2).length;
  const punctuationScore = sentenceCount >= 2 ? 1 : 0.6;

  const rawScore = Math.round(
    lengthRatio * 35 +
      Math.min(1, keywordScore + 0.25) * 25 +
      Math.min(1, lexicalDiversity * 1.45) * 20 +
      cohesionScore * 12 +
      punctuationScore * 8
  );
  const score = Math.max(15, Math.min(96, rawScore));

  const cefrOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const targetIdx = cefrOrder.indexOf(params.level);
  const estimatedIdx =
    score >= 82
      ? targetIdx
      : score >= 62
      ? Math.max(0, targetIdx)
      : Math.max(0, targetIdx - 1);

  const strengths: string[] = [];
  if (wordCount >= params.minWords) {
    strengths.push(`Met the target ${params.skill} volume (${wordCount} words vs. ${params.minWords} minimum).`);
  }
  if (matchedKeywords.length > 0) {
    strengths.push(`Addressed key task concepts (${matchedKeywords.slice(0, 4).join(', ')}).`);
  }
  if (matchedConnectors.length > 0) {
    strengths.push(`Used discourse connectors (${matchedConnectors.slice(0, 3).join(', ')}) to structure ideas.`);
  }
  if (lexicalDiversity >= 0.58) {
    strengths.push(`Strong lexical variety (${Math.round(lexicalDiversity * 100)}% unique vocabulary).`);
  }
  if (strengths.length === 0) {
    strengths.push('Produced an intelligible initial draft addressing the exam prompt.');
  }

  const corrections: string[] = [];
  if (wordCount < params.minWords) {
    corrections.push(
      `Expand your response by at least ${params.minWords - wordCount} more words to satisfy ${params.level} exam development requirements.`
    );
  }
  if (matchedConnectors.length === 0) {
    corrections.push(
      params.languageId === 'german'
        ? 'Add German subordinating & linking connectors (weil, obwohl, außerdem, deshalb) to raise your coherence band.'
        : 'Add linking discourse markers (however, although, furthermore, consequently) to boost coherence.'
    );
  }
  const missingKeywords = params.expectedKeywords.filter((kw) => !lowerText.includes(kw.toLowerCase()));
  if (missingKeywords.length > 0) {
    corrections.push(`Consider incorporating task-relevant vocabulary: ${missingKeywords.slice(0, 3).join(', ')}.`);
  }
  corrections.push('Connect a Local (Ollama/LM Studio) or Cloud (OpenAI/Gemini/OpenRouter) AI provider for line-by-line grammar & C1/C2 style rewriting.');

  return {
    score,
    cefrEstimate: cefrOrder[estimatedIdx],
    strengths,
    corrections,
    upgradedVersion: '',
    examinerSummary:
      score >= 60
        ? `Solid ${params.level} ${params.skill} performance (${score}/100) using offline CEFR heuristics. You met core exam thresholds.`
        : `Developing ${params.level} ${params.skill} draft (${score}/100). Focus on full task coverage, richer connectors, and target length.`,
    source: 'offline-rubric',
    providerLabel: 'Built-in CEFR Rubric Engine',
  };
}

/**
 * Evaluates Writing or Speaking with connected Local/Cloud AI (falling back gracefully to offline rubric).
 */
export async function evaluateWithAIOrFallback(params: {
  config: AIProviderConfig;
  text: string;
  languageId: string;
  level: CEFRLevel;
  skill: 'writing' | 'speaking';
  taskPrompt: string;
  minWords: number;
  expectedKeywords: string[];
  fetchImpl?: typeof fetch;
}): Promise<AIEvaluationResult> {
  const effectiveConfig = resolveAIConfigForLanguage(params.config, params.languageId);
  if (!isAIConfigReady(effectiveConfig) || !params.text.trim()) {
    return evaluateSubmissionOffline(params);
  }

  const langName = params.languageId === 'german' ? 'German' : 'English';
  const examBoard = params.languageId === 'german' ? 'Goethe-Zertifikat / telc / TestDaF' : 'Cambridge English / IELTS / TOEFL';

  const systemPrompt = `You are a strict, encouraging certified ${examBoard} examiner for ${langName} at CEFR ${params.level}.
Evaluate the candidate's ${params.skill} response thoroughly against official CEFR ${params.level} criteria.
Return ONLY valid JSON matching this exact schema (no markdown fences):
{
  "score": <number 0-100>,
  "cefrEstimate": "<A1|A2|B1|B2|C1|C2>",
  "rubric": {
    "taskFulfillment": <0-100>,
    "coherenceCohesion": <0-100>,
    "lexicalRange": <0-100>,
    "grammaticalAccuracy": <0-100>
  },
  "strengths": ["<specific strength citing candidate's wording>", "<strength 2>"],
  "corrections": ["<specific error -> exact fix + short rule>", "<fix 2>"],
  "correctionItems": [
    {"original": "<exact erroneous phrase from candidate>", "corrected": "<natural corrected phrase>", "explanation": "<concise grammar/register reason>"}
  ],
  "suggestions": ["<targeted next-step practice tip 1>", "<tip 2>"],
  "upgradedVersion": "<natural ${params.level}+ rewrite in ${langName} preserving the candidate's ideas>",
  "examinerSummary": "<2-sentence official examiner diagnostic>"
}`;

  try {
    const raw = await callAIProvider(
      effectiveConfig,
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Task Prompt:\n${params.taskPrompt}\n\nCandidate ${params.skill} response:\n${params.text}`,
        },
      ],
      params.fetchImpl
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Non-JSON AI response');
    const parsed = JSON.parse(jsonMatch[0]) as Omit<
      Partial<AIEvaluationResult>,
      'rubric' | 'correctionItems' | 'suggestions'
    > & {
      rubric?: Partial<OfficialRubricBreakdown>;
      correctionItems?: unknown[];
      suggestions?: unknown[];
    };
    const validLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const cefrEstimate = validLevels.includes(parsed.cefrEstimate as CEFRLevel)
      ? (parsed.cefrEstimate as CEFRLevel)
      : params.level;

    const clamp = (val: unknown, fallback: number) => {
      const n = Number(val);
      return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
    };

    const score = clamp(parsed.score, 70);
    const rubric: OfficialRubricBreakdown | undefined =
      parsed.rubric && typeof parsed.rubric === 'object'
        ? {
            taskFulfillment: clamp(parsed.rubric.taskFulfillment, score),
            coherenceCohesion: clamp(parsed.rubric.coherenceCohesion, score),
            lexicalRange: clamp(parsed.rubric.lexicalRange, score),
            grammaticalAccuracy: clamp(parsed.rubric.grammaticalAccuracy, score),
          }
        : undefined;

    const correctionItems: ExamCorrectionItem[] = Array.isArray(parsed.correctionItems)
      ? parsed.correctionItems
          .filter(
            (item): item is Partial<ExamCorrectionItem> =>
              Boolean(
                item &&
                  typeof item === 'object' &&
                  'corrected' in item &&
                  typeof (item as Record<string, unknown>).corrected === 'string'
              )
          )
          .map((item) => ({
            original: typeof item.original === 'string' ? item.original.trim() : '',
            corrected: (item.corrected || '').trim(),
            explanation: typeof item.explanation === 'string' ? item.explanation.trim() : '',
            sectionTag: typeof item.sectionTag === 'string' ? item.sectionTag.trim() : undefined,
          }))
          .filter((item) => item.corrected.length > 0)
          .slice(0, 6)
      : [];

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, 4)
      : [];

    const corrections = Array.isArray(parsed.corrections)
      ? parsed.corrections.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 5)
      : correctionItems.map((ci) =>
          ci.original ? `"${ci.original}" → "${ci.corrected}" (${ci.explanation})` : `${ci.corrected}: ${ci.explanation}`
        );

    return {
      score,
      cefrEstimate,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, 4)
        : [],
      corrections,
      upgradedVersion: typeof parsed.upgradedVersion === 'string' ? parsed.upgradedVersion.trim() : '',
      examinerSummary: typeof parsed.examinerSummary === 'string' ? parsed.examinerSummary.trim() : raw.slice(0, 260),
      source: 'ai',
      providerLabel: `${AI_PROVIDER_PRESETS[effectiveConfig.provider].label} (${effectiveConfig.model})`,
      rubric,
      suggestions,
      correctionItems,
    };
  } catch {
    return evaluateSubmissionOffline(params);
  }
}

export interface ParsedCoachReply {
  spokenText: string;
  displayBody: string;
  coachNote: string | null;
  audioScript: string | null;
  speakerLabel: string | null;
}

/**
 * Generates tailored system prompts for the 4-Skill AI Coaching Studio.
 */
export function buildSkillCoachSystemPrompt(params: {
  languageId: string;
  level: CEFRLevel;
  skill: SkillType;
}): string {
  const langName = params.languageId === 'german' ? 'German' : 'English';
  const examRef =
    params.languageId === 'german'
      ? 'Goethe-Zertifikat, telc, and TestDaF'
      : 'Cambridge English, IELTS, and TOEFL iBT';

  const noEnglishClause =
    params.languageId === 'german'
      ? ' and NEVER mix English words, explanations, or translations into your spoken German reply.'
      : '.';

  const skillDirectives: Record<SkillType, string> = {
    reading: `Act as a ${langName} ${params.level} Reading Coach aligned with ${examRef}. Generate authentic ${params.level} passages, break down difficult syntax/vocabulary, and ask 2–3 exam-style comprehension questions (Richtig/Falsch or True/False/Not Given + inference).`,
    listening: `Act as a ${langName} ${params.level} Listening & Hearing Coach aligned with ${examRef}. Start EVERY listening exercise with an [AUDIO SCRIPT] block containing ONLY natural spoken ${langName} (4–7 sentences; for dialogues, write each turn on its own line as Name: sentence with NO markdown asterisks, NO stage directions, and NO English words mixed in so multi-speaker TTS plays cleanly). Then, on a new line, add [HEARING FOCUS] (tricky sounds/reductions) and [QUESTIONS] (2 comprehension questions). Wait for the user's answer before revealing the key.`,
    writing: `Act as an official ${examRef} Writing Examiner for ${langName} ${params.level}. Give authentic exam writing prompts OR grade the user's text across Task Achievement, Coherence, Lexis, and Grammar with a 0–100 score, exact error corrections, and a higher-band model rewrite.`,
    speaking: `Act as a friendly, realistic native ${langName} Speaking Examiner & Conversation Partner at CEFR ${params.level} aligned with ${examRef}.
CRITICAL AUDIO FORMAT RULES:
1. Write ONLY your spoken reply first in 100% pure, natural spoken ${langName} (2–4 sentences suitable for native TTS audio), ending with one engaging follow-up question in ${langName}.
2. NEVER include role prefixes (never write "Examiner:", "**Examiner:**", "Prüfer:", or "Coach:"), NEVER use markdown formatting (**bold**, *italics*), NEVER add stage directions like *(smiles)*${noEnglishClause}
3. After a blank line at the very end, put coaching feedback on a NEW LINE starting strictly with [COACH NOTE] (never inline inside a sentence) with 1–2 brief, actionable grammar, vocabulary, or phrasing fixes.`,
  };

  return `${skillDirectives[params.skill]}\nKeep responses structured, practical, and calibrated strictly to CEFR ${params.level}.`;
}

function cleanCoachNoteText(raw: string): string {
  let s = raw.trim();
  while (s.endsWith(']') && !s.includes('[')) {
    s = s.slice(0, -1).trim();
  }
  s = s.replace(/\*\*([^\n*]+?)\*\*/g, '$1');
  s = s.replace(/__([^\n_]+?)__/g, '$1');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function sanitizeForSpeech(text: string, preserveSpeakerTurns: boolean): string {
  let s = text;
  // 1. Asterisk-wrapped stage directions: *(smiles warmly)*, **(laughs)**
  s = s.replace(/\*{1,2}\([^)\n]{1,80}\)\*{1,2}/g, ' ');
  // 2. Action stage directions in parens or brackets: (lacht), [laughs], (smiles)
  s = s.replace(
    /[([]\s*(?:smiles?|smiling|laughs?|laughing|chuckles?|nods?|nodding|pauses?|sighs?|clears\s+throat|warmly|enthusiastically|cheerfully|encouragingly|softly|lächelt|lacht|nickt|pause|pausiert|seufzt|freundlich)[^)\]\n]{0,45}[)\]]/gi,
    ' '
  );
  // 3. Remaining bracketed section tags like [AUDIO SCRIPT], [HEARING FOCUS], [QUESTIONS]
  s = s.replace(/\[\s*[A-ZÄÖÜ0-9 _/-]{2,32}\s*\]/gi, ' ');
  // 4. Markdown headings & horizontal rules
  s = s.replace(/^[ \t]*#{1,6}[ \t]+/gm, '');
  s = s.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '');
  // 5. Markdown emphasis & inline code
  s = s.replace(/\*\*([^\n*]+?)\*\*/g, '$1');
  s = s.replace(/__([^\n_]+?)__/g, '$1');
  s = s.replace(/\*([^\n*]+?)\*/g, '$1');
  s = s.replace(/`([^`\n]+?)`/g, '$1');
  s = s.replace(/\*{1,}/g, '');
  // 6. Bullet markers
  s = s.replace(/^[ \t]*[-•][ \t]+/gm, '');

  if (preserveSpeakerTurns) {
    return s
      .split('\n')
      .map((line) =>
        line
          .replace(/[ \t]{2,}/g, ' ')
          .replace(/[ \t]+([.,!?;:])/g, '$1')
          .trim()
      )
      .filter(Boolean)
      .join('\n');
  }

  return s
    .replace(/[\t\n ]+/g, ' ')
    .replace(/[ \t]+([.,!?;:])/g, '$1')
    .trim();
}

/**
 * Splits an AI Coach reply into pure target-language TTS audio text, clean visual body,
 * optional extracted `[AUDIO SCRIPT]` (Listening), and separated `[COACH NOTE]` feedback so
 * text-to-speech never reads role labels (`**Examiner:**`), markdown, or English coaching notes
 * inside a non-English voice.
 */
export function parseCoachReply(raw: string, skill: SkillType): ParsedCoachReply {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) {
    return {
      spokenText: '',
      displayBody: '',
      coachNote: null,
      audioScript: null,
      speakerLabel: null,
    };
  }

  let working = normalized;
  const noteParts: string[] = [];

  const isAudioSkill = skill === 'speaking' || skill === 'listening';
  const bracketNoteLabels = isAudioSkill
    ? `COACH(?:'S)?\\s*NOTE|COACHING\\s*NOTE|EXAMINER\\s*NOTE|FEEDBACK|CORRECTIONS?|LANGUAGE\\s*NOTE|GRAMMAR\\s*NOTE|FLUENCY\\s*(?:TIP|NOTE|UPGRADES?)|TIP|HINWEIS`
    : `COACH(?:'S)?\\s*NOTE|COACHING\\s*NOTE|EXAMINER\\s*NOTE`;
  const headingNoteLabels = isAudioSkill
    ? `COACH(?:'S)?\\s*NOTE|COACHING\\s*NOTE|EXAMINER\\s*NOTE|LANGUAGE\\s*NOTE|GRAMMAR\\s*NOTE|FLUENCY\\s*(?:TIP|NOTE|UPGRADES?)|FEEDBACK|CORRECTIONS?`
    : `COACH(?:'S)?\\s*NOTE|COACHING\\s*NOTE|EXAMINER\\s*NOTE`;

  // 1a. Inline self-contained bracket notes: [COACH NOTE: Replace "x" with "y".]
  const inlineBracketRe = new RegExp(
    `\\*{0,2}\\[\\s*(?:${bracketNoteLabels})\\s*:\\s*([^\\]]+)\\]\\*{0,2}`,
    'gi'
  );
  working = working.replace(inlineBracketRe, (_full, note: string) => {
    const cleaned = cleanCoachNoteText(note);
    if (cleaned) noteParts.push(cleaned);
    return ' ';
  });

  // 1b. Section-header bracket notes: [COACH NOTE]\n... or unclosed [COACH NOTE: ...
  const sectionBracketRe = new RegExp(
    `(?:^|\\n|[ \\t]+)(?:[-*_]{3,}[ \\t]*\\n[ \\t]*)?\\*{0,2}\\[\\s*(?:${bracketNoteLabels})\\s*(?::[ \\t]*|\\])\\*{0,2}[ \\t]*:?[ \\t]*([\\s\\S]*?)(?=\\n[ \\t]*\\*{0,2}\\[\\s*(?:AUDIO\\s*SCRIPT|HEARING\\s*FOCUS|QUESTIONS?|COMPREHENSION|ANSWER\\s*KEY)\\b|$)`,
    'gi'
  );
  working = working.replace(sectionBracketRe, (_full, note: string) => {
    const cleaned = cleanCoachNoteText(note);
    if (cleaned) noteParts.push(cleaned);
    return '';
  });

  // 1c. Plain or markdown heading notes on their own line: **Coach Note:** ..., ### Feedback:
  const headingNoteRe = new RegExp(
    `(?:^|\\n)[ \\t]*(?:[-*_]{3,}[ \\t]*\\n[ \\t]*)?(?:#{1,4}[ \\t]*)?(?:[💡📝✅✏️📌][ \\t]*)?\\*{0,2}(?:${headingNoteLabels})(?::\\*{0,2}|\\*{0,2}:)[ \\t]*([\\s\\S]*?)(?=\\n[ \\t]*\\*{0,2}\\[\\s*(?:AUDIO\\s*SCRIPT|HEARING\\s*FOCUS|QUESTIONS?|COMPREHENSION|ANSWER\\s*KEY)\\b|$)`,
    'gi'
  );
  working = working.replace(headingNoteRe, (_full, note: string) => {
    const cleaned = cleanCoachNoteText(note);
    if (cleaned) noteParts.push(cleaned);
    return '';
  });

  // 1d. Trailing English translation block in Speaking mode
  if (skill === 'speaking') {
    const translationRe =
      /(?:^|\n)[ \t]*(?:[-*_]{3,}[ \t]*\n[ \t]*)?\*{0,2}[([]?(?:English\s+)?Translation(?::\*{0,2}|\*{0,2}:|\]:?)[ \t]*([\s\S]*)$/i;
    working = working.replace(translationRe, (_full, tr: string) => {
      const cleaned = cleanCoachNoteText(tr.replace(/[)*\] \t\n]+$/g, ''));
      if (cleaned) noteParts.push(`Translation: ${cleaned}`);
      return '';
    });
  }

  working = working.replace(/(?:\n[ \t]*[-*_]{3,}[ \t]*)+$/g, '').trim();

  // 2. Listening [AUDIO SCRIPT] extraction
  let audioScript: string | null = null;
  if (skill === 'listening') {
    const inlineScriptMatch = working.match(/\*{0,2}\[\s*AUDIO\s*SCRIPT\s*:\s*([^\]]+)\]\*{0,2}/i);
    const blockScriptMatch = working.match(
      /(?:^|\n)[ \t]*\*{0,2}\[\s*AUDIO\s*SCRIPT\s*\]\*{0,2}[ \t]*:?[ \t]*\n?([\s\S]*?)(?=\n[ \t]*(?:\*{0,2}\[\s*(?:HEARING\s*FOCUS|QUESTIONS?|COMPREHENSION|COACH\s*NOTE|VOCABULARY|ANSWER\s*KEY|TIP)\b|(?:#{1,4}[ \t]*)?\*{0,2}(?:HEARING\s*FOCUS|COMPREHENSION\s*QUESTIONS?|QUESTIONS?|VOCABULARY|ANSWER\s*KEY)(?::\*{0,2}|\*{0,2}:))|$)/i
    );
    const headingScriptMatch = working.match(
      /(?:^|\n)[ \t]*(?:#{1,4}[ \t]*)?\*{0,2}AUDIO\s*SCRIPT(?::\*{0,2}|\*{0,2}:)[ \t]*\n?([\s\S]*?)(?=\n[ \t]*(?:\*{0,2}\[|(?:#{1,4}[ \t]*)?\*{0,2}(?:HEARING\s*FOCUS|COMPREHENSION\s*QUESTIONS?|QUESTIONS?|VOCABULARY|ANSWER\s*KEY)(?::\*{0,2}|\*{0,2}:))|$)/i
    );
    const rawScript = inlineScriptMatch?.[1] ?? blockScriptMatch?.[1] ?? headingScriptMatch?.[1];
    if (rawScript) {
      const sanitized = sanitizeForSpeech(rawScript, true);
      if (sanitized) audioScript = sanitized;
    }
  }

  // 3. Strip leading role prefixes (**Examiner:**, Prüfer:, Coach:, [EXAMINER])
  let speakerLabel: string | null = null;
  working = working.replace(
    /^\s*\*{0,2}\[\s*(?:EXAMINER|SPEAKING|RESPONSE|DIALOGUE|REPLY)\s*\]\*{0,2}\s*:?\s*/i,
    ''
  );

  if (skill === 'speaking') {
    const rolePrefixRe =
      /^\s*\*{0,2}(Examiner|AI\s*Examiner|Speaking\s*Examiner|Coach|AI\s*Coach|Tutor|Teacher|Interviewer|Roleplay\s*Partner|Partner|Assistant|Prüfer(?:in)?|Gesprächspartner(?:in)?|Lehrer(?:in)?|Moderator(?:in)?)(?::\*{0,2}|\*{0,2}:)[ \t]*/i;
    const roleMatch = working.match(rolePrefixRe);
    if (roleMatch) {
      speakerLabel = roleMatch[1].trim();
      working = working.replace(rolePrefixRe, '');
    }
    working = working.replace(
      /\n[ \t]*\*{0,2}(?:Examiner|AI\s*Examiner|Coach|Tutor|Interviewer|Assistant|Prüfer(?:in)?|Gesprächspartner(?:in)?)(?::\*{0,2}|\*{0,2}:)[ \t]*/gi,
      '\n'
    );
  }

  const displayBody =
    skill === 'speaking'
      ? sanitizeForSpeech(working, false)
      : working.replace(/[ \t]+([.,!?;:])/g, '$1').trim();

  const spokenText = audioScript ?? sanitizeForSpeech(working, skill === 'listening');
  const combinedNote = noteParts.join('\n\n').trim();

  return {
    spokenText,
    displayBody,
    coachNote: combinedNote || null,
    audioScript,
    speakerLabel,
  };
}
