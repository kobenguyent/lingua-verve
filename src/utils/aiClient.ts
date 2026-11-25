import {
  AIChatMessage,
  AIEvaluationResult,
  AIProviderConfig,
  AIProviderType,
  CEFRLevel,
  SkillType,
} from '../types';

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
  if (!isAIConfigReady(params.config) || !params.text.trim()) {
    return evaluateSubmissionOffline(params);
  }

  const langName = params.languageId === 'german' ? 'German' : 'English';
  const examBoard = params.languageId === 'german' ? 'Goethe-Zertifikat / telc / TestDaF' : 'Cambridge English / IELTS / TOEFL';

  const systemPrompt = `You are a strict, encouraging certified ${examBoard} examiner for ${langName} at CEFR ${params.level}.
Evaluate the candidate's ${params.skill} response. Return ONLY valid JSON matching this exact schema:
{
  "score": <number 0-100>,
  "cefrEstimate": "<A1|A2|B1|B2|C1|C2>",
  "strengths": ["<point 1>", "<point 2>"],
  "corrections": ["<specific error -> fix 1>", "<specific error -> fix 2>"],
  "upgradedVersion": "<natural ${params.level}+ rewrite in ${langName}>",
  "examinerSummary": "<2-sentence official examiner feedback>"
}`;

  try {
    const raw = await callAIProvider(
      params.config,
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
    const parsed = JSON.parse(jsonMatch[0]) as Partial<AIEvaluationResult>;
    const validLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const cefrEstimate = validLevels.includes(parsed.cefrEstimate as CEFRLevel)
      ? (parsed.cefrEstimate as CEFRLevel)
      : params.level;

    return {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 70))),
      cefrEstimate,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections.slice(0, 5) : [],
      upgradedVersion: typeof parsed.upgradedVersion === 'string' ? parsed.upgradedVersion : '',
      examinerSummary: typeof parsed.examinerSummary === 'string' ? parsed.examinerSummary : raw.slice(0, 260),
      source: 'ai',
      providerLabel: `${AI_PROVIDER_PRESETS[params.config.provider].label} (${params.config.model})`,
    };
  } catch {
    return evaluateSubmissionOffline(params);
  }
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

  const skillDirectives: Record<SkillType, string> = {
    reading: `Act as a ${langName} ${params.level} Reading Coach aligned with ${examRef}. Generate authentic ${params.level} passages, break down difficult syntax/vocabulary, and ask 2–3 exam-style comprehension questions (Richtig/Falsch or True/False/Not Given + inference).`,
    listening: `Act as a ${langName} ${params.level} Listening & Hearing Coach aligned with ${examRef}. Start EVERY listening exercise with a clear [AUDIO SCRIPT] block in natural spoken ${langName} (4–7 sentences suitable for text-to-speech playback), followed by [HEARING FOCUS] (tricky sounds/reductions) and 2 comprehension questions. Wait for the user's answer before revealing the key.`,
    writing: `Act as an official ${examRef} Writing Examiner for ${langName} ${params.level}. Give authentic exam writing prompts OR grade the user's text across Task Achievement, Coherence, Lexis, and Grammar with a 0–100 score, exact error corrections, and a higher-band model rewrite.`,
    speaking: `Act as a friendly, realistic native ${langName} Speaking Examiner & Conversation Partner at CEFR ${params.level}. Respond naturally in ${langName} (2–4 sentences so it works smoothly with audio playback), ask one engaging follow-up question, and include a concise [COACH NOTE] highlighting 1–2 pronunciation, phrasing, or grammar upgrades.`,
  };

  return `${skillDirectives[params.skill]}\nKeep responses structured, practical, and calibrated strictly to CEFR ${params.level}.`;
}
