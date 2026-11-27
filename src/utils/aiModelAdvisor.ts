import { AIModelInfo, AIProviderConfig, AIProviderType } from '../types';

export type ModelLanguageTarget =
  | 'all'
  | 'german'
  | 'english'
  | 'french'
  | 'spanish'
  | 'japanese'
  | 'global-regional';

export interface ModelLanguageOption {
  id: ModelLanguageTarget;
  flag: string;
  label: string;
  shortLabel: string;
}

export const MODEL_LANGUAGE_OPTIONS: ModelLanguageOption[] = [
  { id: 'all', flag: '🌐', label: 'Many Languages (Polyglot)', shortLabel: 'Polyglot' },
  { id: 'german', flag: '🇩🇪', label: 'German (Deutsch · DACH)', shortLabel: 'German' },
  { id: 'english', flag: '🇬🇧', label: 'English (IELTS / Cambridge)', shortLabel: 'English' },
  { id: 'french', flag: '🇫🇷', label: 'French (Français)', shortLabel: 'French' },
  { id: 'spanish', flag: '🇪🇸', label: 'Spanish (Español)', shortLabel: 'Spanish' },
  { id: 'japanese', flag: '🇯🇵', label: 'Japanese (日本語)', shortLabel: 'Japanese' },
  { id: 'global-regional', flag: '🌏', label: 'Arabic, Vietnamese, Korean & Regional', shortLabel: 'Asian / Regional' },
];

export interface LanguageModelRecommendation {
  modelId: string;
  badge: string;
  reason: string;
  sizeHint: string;
  pullCommand?: string;
  isBestMatch?: boolean;
}

export type ModelFitTier = 'ideal' | 'good' | 'caution';

export interface RankedFetchedModel {
  model: AIModelInfo;
  score: number;
  tier: ModelFitTier;
  reason: string;
  isCodingModel: boolean;
}

export function normalizeModelLanguageTarget(raw?: string): ModelLanguageTarget {
  switch ((raw || '').toLowerCase().trim()) {
    case 'german':
      return 'german';
    case 'english':
      return 'english';
    case 'french':
      return 'french';
    case 'spanish':
      return 'spanish';
    case 'japanese':
      return 'japanese';
    case 'global-regional':
      return 'global-regional';
    default:
      return 'all';
  }
}

export function isCodingSpecializedModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return (
    lower.includes('coder') ||
    lower.includes('codellama') ||
    lower.includes('starcoder') ||
    lower.includes('codegemma') ||
    lower.includes('codestral') ||
    lower.includes('devstral') ||
    lower.includes('sql')
  );
}

/**
 * Resolves the effective AIProviderConfig for a given learning language,
 * automatically applying any language-specific pinned model override.
 */
export function resolveAIConfigForLanguage(
  config: AIProviderConfig,
  languageId?: string
): AIProviderConfig {
  if (!languageId || !config.languageModels) return config;
  const key = normalizeModelLanguageTarget(languageId);
  const pinned = config.languageModels[key]?.trim();
  if (!pinned || pinned === config.model) return config;
  return {
    ...config,
    model: pinned,
  };
}

/**
 * Returns curated, ranked AI model recommendations tailored to the target learning language
 * and chosen AI provider (Local Ollama/LM Studio or Cloud APIs).
 */
export function getRecommendedModelsForLanguage(
  provider: AIProviderType,
  language: ModelLanguageTarget
): LanguageModelRecommendation[] {
  if (provider === 'ollama') {
    const ollamaPull = (id: string) => `ollama pull ${id}`;
    switch (language) {
      case 'german':
      case 'french':
      case 'spanish': {
        const langLabel = language === 'german' ? 'German (Goethe/telc)' : language === 'french' ? 'French' : 'Spanish';
        return [
          {
            modelId: 'mistral-small3.1',
            badge: 'European Precision',
            reason: `Top local accuracy for ${langLabel} register, formal/informal nuance, and strict exam JSON formatting.`,
            sizeHint: '~15 GB · 24 GB+ RAM',
            pullCommand: ollamaPull('mistral-small3.1'),
            isBestMatch: true,
          },
          {
            modelId: 'qwen3:14b',
            badge: 'Best 16–24 GB Balance',
            reason: `Sharp ${langLabel} grammar explanations and 4-skill error corrections in a comfortable memory footprint.`,
            sizeHint: '~9.3 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen3:14b'),
          },
          {
            modelId: 'gemma4:latest',
            badge: '140+ Languages',
            reason: `Natural conversational dialogues and idiomatic ${langLabel} phrasing with broad multilingual support.`,
            sizeHint: '~9.6 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('gemma4:latest'),
          },
          {
            modelId: 'gemma3:12b',
            badge: 'Fast & Direct JSON',
            reason: 'Rapid zero-thinking responses — ideal for fast 4-skill exam generation and instant Cloze drills.',
            sizeHint: '~8.1 GB · 16 GB RAM',
            pullCommand: ollamaPull('gemma3:12b'),
          },
        ];
      }
      case 'english':
        return [
          {
            modelId: 'gemma4:latest',
            badge: 'Best Overall',
            reason: 'Natural C1/C2 English cadence, realistic regional dialogues, and thoughtful IELTS/Cambridge coaching.',
            sizeHint: '~9.6 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('gemma4:latest'),
            isBestMatch: true,
          },
          {
            modelId: 'qwen3:14b',
            badge: 'Analytical Grader',
            reason: 'Strict CEFR rubric scoring, nuanced essay rewrites, and accurate grammar diagnostics.',
            sizeHint: '~9.3 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen3:14b'),
          },
          {
            modelId: 'gemma3:12b',
            badge: 'Fast & Direct',
            reason: 'Snappy local generation for fresh unseen mock exams with zero reasoning latency.',
            sizeHint: '~8.1 GB · 16 GB RAM',
            pullCommand: ollamaPull('gemma3:12b'),
          },
          {
            modelId: 'llama3.2',
            badge: 'Lightweight 8 GB RAM',
            reason: 'Fast and fluent English practice on 8 GB laptops when memory is tight.',
            sizeHint: '~2.0 GB · 8 GB RAM',
            pullCommand: ollamaPull('llama3.2'),
          },
        ];
      case 'japanese':
        return [
          {
            modelId: 'qwen3:14b',
            badge: 'Best for CJK & Japanese',
            reason: 'Leading open-weights Japanese/CJK tokenization, natural keigo nuance, and accurate kanji explanations.',
            sizeHint: '~9.3 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen3:14b'),
            isBestMatch: true,
          },
          {
            modelId: 'gemma4:latest',
            badge: '140+ Languages',
            reason: 'Strong Japanese conversational flow and contextual explanations across JLPT levels.',
            sizeHint: '~9.6 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('gemma4:latest'),
          },
          {
            modelId: 'qwen2.5:14b',
            badge: 'Fast CJK Classic',
            reason: 'Reliable Japanese comprehension and structured JSON output with zero thinking overhead.',
            sizeHint: '~9.0 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen2.5:14b'),
          },
        ];
      case 'global-regional':
        return [
          {
            modelId: 'qwen3:14b',
            badge: '100+ Languages',
            reason: 'Top local accuracy across Arabic, Vietnamese, Korean, Thai, Indonesian, Chinese, and European languages.',
            sizeHint: '~9.3 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen3:14b'),
            isBestMatch: true,
          },
          {
            modelId: 'gemma4:latest',
            badge: '140+ Languages',
            reason: 'Google’s broadest open multilingual training set — strong coherence on non-Western scripts.',
            sizeHint: '~9.6 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('gemma4:latest'),
          },
          {
            modelId: 'aya-expanse:8b',
            badge: 'Regional Specialist',
            reason: 'Cohere’s dedicated 23-language specialist built for Arabic, Vietnamese, Turkish, Hindi, Polish, and more.',
            sizeHint: '~5.1 GB · 8–16 GB RAM',
            pullCommand: ollamaPull('aya-expanse:8b'),
          },
        ];
      case 'all':
      default:
        return [
          {
            modelId: 'qwen3:14b',
            badge: 'Best Polyglot Pick',
            reason: '100+ languages with top-tier grammar explanations, exam JSON reliability, and balanced 16–24 GB RAM speed.',
            sizeHint: '~9.3 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('qwen3:14b'),
            isBestMatch: true,
          },
          {
            modelId: 'gemma4:latest',
            badge: '140+ Languages',
            reason: 'Broadest open multilingual fluency for natural multi-speaker dialogues and roleplay coaching.',
            sizeHint: '~9.6 GB · 16–24 GB RAM',
            pullCommand: ollamaPull('gemma4:latest'),
          },
          {
            modelId: 'gemma3:12b',
            badge: 'Fastest Exam Generator',
            reason: '140+ languages with fast direct replies and no slow thinking tokens during 4-skill exam generation.',
            sizeHint: '~8.1 GB · 16 GB RAM',
            pullCommand: ollamaPull('gemma3:12b'),
          },
          {
            modelId: 'mistral-small3.1',
            badge: 'European Specialist',
            reason: 'Best local precision if your polyglot stack centers on German, French, Spanish, Italian, and English.',
            sizeHint: '~15 GB · 24 GB+ RAM',
            pullCommand: ollamaPull('mistral-small3.1'),
          },
          {
            modelId: 'aya-expanse:8b',
            badge: 'Lightweight 23-Lang',
            reason: 'Compact multilingual specialist ideal for 8–16 GB machines and regional languages.',
            sizeHint: '~5.1 GB · 8–16 GB RAM',
            pullCommand: ollamaPull('aya-expanse:8b'),
          },
        ];
    }
  }

  if (provider === 'lmstudio') {
    const primary =
      language === 'german' || language === 'french' || language === 'spanish'
        ? 'mistral-small-3.1-24b-instruct'
        : 'qwen3-14b-instruct';
    return [
      {
        modelId: primary,
        badge: 'Best Local Pick',
        reason:
          language === 'german' || language === 'french' || language === 'spanish'
            ? 'Crisp European grammar precision and clean JSON formatting in LM Studio.'
            : 'Top multilingual fluency across 100+ languages with strong CEFR grading precision.',
        sizeHint: 'GGUF Q4_K_M · 16–24 GB RAM',
        isBestMatch: true,
      },
      {
        modelId: 'gemma-3-12b-it',
        badge: '140+ Languages · Fast',
        reason: 'Fast, fluent dialogues and reliable structured exam generation across 140+ languages.',
        sizeHint: '~8 GB GGUF · 16 GB RAM',
      },
      {
        modelId: 'qwen2.5-7b-instruct',
        badge: 'Lightweight',
        reason: 'Great multilingual fallback for 8–16 GB RAM machines.',
        sizeHint: '~5 GB GGUF · 8–16 GB RAM',
      },
    ];
  }

  if (provider === 'openai') {
    return [
      {
        modelId: 'gpt-4o',
        badge: 'Highest Accuracy',
        reason: `Flagship multilingual precision for nuanced ${language === 'all' ? 'polyglot' : language} C1/C2 grading, idioms, and natural dialogues.`,
        sizeHint: 'Cloud · Flagship',
        isBestMatch: true,
      },
      {
        modelId: 'gpt-4.1-mini',
        badge: 'Best Speed & Value',
        reason: 'Very fast, low-cost, and super reliable at structured JSON exam generation and 4-skill rubrics.',
        sizeHint: 'Cloud · Fast & Affordable',
      },
      {
        modelId: 'gpt-4o-mini',
        badge: 'Budget Daily Coach',
        reason: 'Ultra-cheap everyday practice for A1–B2 drills and vocabulary coaching.',
        sizeHint: 'Cloud · Lowest Cost',
      },
    ];
  }

  if (provider === 'gemini') {
    return [
      {
        modelId: 'gemini-2.5-pro',
        badge: 'Top Multilingual Depth',
        reason: 'Google’s strongest 140+ language model — excels at nuanced C1/C2 essays, Japanese/Asian scripts, and DACH German.',
        sizeHint: 'Cloud · Flagship',
        isBestMatch: language === 'japanese' || language === 'global-regional' || language === 'german',
      },
      {
        modelId: 'gemini-2.5-flash',
        badge: 'Best Overall Speed',
        reason: 'Blazing-fast 140+ language performance — ideal for generating fresh 4-skill simulated exams and daily coaching.',
        sizeHint: 'Cloud · Fast & Free Tier',
        isBestMatch: !(language === 'japanese' || language === 'global-regional' || language === 'german'),
      },
    ];
  }

  if (provider === 'openrouter') {
    const isEuro = language === 'german' || language === 'french' || language === 'spanish' || language === 'english';
    return [
      {
        modelId: 'anthropic/claude-3.5-sonnet',
        badge: isEuro ? 'Best European Nuance' : 'Top Tutor Style',
        reason: 'Exceptionally natural stylistic rewrites, clear pedagogical explanations, and idiomatic register control.',
        sizeHint: 'Cloud · Premium',
        isBestMatch: isEuro,
      },
      {
        modelId: 'google/gemini-2.5-flash',
        badge: 'Best Multilingual Value',
        reason: 'Fast, inexpensive, and trained across 140+ languages including Asian and regional tongues.',
        sizeHint: 'Cloud · Fast & Low Cost',
        isBestMatch: !isEuro,
      },
      {
        modelId: 'openai/gpt-4o-mini',
        badge: 'Reliable JSON Grader',
        reason: 'Consistent structured scoring and fast exam generation at minimal per-exam cost.',
        sizeHint: 'Cloud · Low Cost',
      },
      {
        modelId: 'qwen/qwen3-30b-a3b',
        badge: 'Open Multilingual MoE',
        reason: 'Strong 100+ language coverage (especially CJK & global) at open-model pricing.',
        sizeHint: 'Cloud · Ultra Low Cost',
      },
    ];
  }

  // Custom OpenAI-compatible (Groq / Mistral / vLLM / etc.)
  return [
    {
      modelId: 'llama-3.3-70b-versatile',
      badge: 'Best Overall',
      reason: 'Fast 70B multilingual performance on Groq / OpenAI-compatible gateways.',
      sizeHint: 'Cloud / Custom',
      isBestMatch: true,
    },
    {
      modelId: 'mistral-small-latest',
      badge: 'European Precision',
      reason: 'Ideal on Mistral API for German, French, Spanish, and English exam coaching.',
      sizeHint: 'Cloud / Mistral',
    },
  ];
}

/**
 * Scores and ranks live-fetched models (e.g., from local Ollama or Cloud API) by suitability
 * for learning the chosen target language, explicitly demoting coding-specialized models.
 */
export function rankFetchedModelsForLanguage(
  models: AIModelInfo[],
  language: ModelLanguageTarget
): RankedFetchedModel[] {
  const ranked: RankedFetchedModel[] = models.map((model) => {
    const id = model.id.toLowerCase();
    const isCoder = isCodingSpecializedModel(id);

    if (isCoder) {
      return {
        model,
        score: 12,
        tier: 'caution' as ModelFitTier,
        reason: 'Coding-specialized model — weaker for natural grammar, register, and CEFR exams.',
        isCodingModel: true,
      };
    }

    let score = 52;
    let reason = 'General-purpose chat model suitable for standard language practice.';

    const isEuro = language === 'german' || language === 'french' || language === 'spanish';
    const isAsianOrRegional = language === 'japanese' || language === 'global-regional';

    if (id.includes('gemma4') || id.includes('gemma-4')) {
      score += 36;
      reason = '140+ languages — excellent natural dialogues, idioms, and 4-skill coaching.';
    } else if (id.includes('qwen3') || id.includes('qwen-3')) {
      score += isAsianOrRegional ? 40 : 37;
      reason = isAsianOrRegional
        ? 'Top-tier 100+ language & Asian/regional accuracy with sharp grammar coaching.'
        : 'Top-tier 100+ language reasoning, sharp grammar fixes, and strong CEFR grading.';
    } else if (id.includes('mistral-small') || id.includes('mistral-large')) {
      score += isEuro ? 39 : 30;
      reason = isEuro
        ? 'Outstanding European grammar precision, formal register, and strict exam JSON.'
        : 'Fast, structured instruction follower with strong European language quality.';
    } else if (id.includes('gemma3') || id.includes('gemma-3')) {
      score += 33;
      reason = '140+ languages with fast direct output — great for exam generation & drills.';
    } else if (id.includes('aya-expanse') || id.includes('aya:')) {
      score += language === 'global-regional' ? 38 : 30;
      reason = 'Cohere multilingual specialist — rich cultural nuance across 23+ languages.';
    } else if (id.includes('qwen2.5') || id.includes('qwen2')) {
      score += isAsianOrRegional ? 34 : 28;
      reason = 'Strong multilingual coverage and clean structured JSON responses.';
    } else if (id.includes('claude-3.5-sonnet') || id.includes('claude-3-7') || id.includes('claude-4') || id.includes('claude-sonnet')) {
      score += 40;
      reason = 'Nuanced idiomatic rewrites, warm examiner coaching, and top-tier accuracy.';
    } else if (id.includes('gemini-2.5') || id.includes('gemini-2.0')) {
      score += 38;
      reason = '140+ language coverage with fast generation across all 4 exam skills.';
    } else if (/gpt-4\.1|gpt-4o(?!-mini)|gpt-5/i.test(id)) {
      score += 39;
      reason = 'Flagship multilingual fluency and accurate C1/C2 examiner scoring.';
    } else if (id.includes('gpt-4o-mini')) {
      score += 32;
      reason = 'Fast, reliable, low-cost model for daily drills and structured exams.';
    } else if (id.includes('llama3.3') || id.includes('llama-3.3') || id.includes('llama3.1') || id.includes('llama3.2')) {
      score += language === 'english' ? 30 : 22;
      reason =
        language === 'english'
          ? 'Fluent English coaching and fast everyday conversation practice.'
          : 'Good general multilingual capability (strongest in English & major European tongues).';
    } else if (id.includes('mistral') || id.includes('mixtral')) {
      score += isEuro ? 28 : 22;
      reason = 'Solid European language grammar and concise responses.';
    } else if (id.includes('deepseek-r1') || id.includes('deepseek-v3') || id.includes('deepseek-chat')) {
      score += 26;
      reason = 'Strong analytical grammar reasoning across major languages.';
    }

    // Sweet-spot parameter size bonus (12B–32B preferred over tiny 1B–3B when both exist)
    if (/(?:12b|14b|22b|24b|26b|27b|30b|32b|70b)/i.test(id)) {
      score += 5;
    } else if (/(?:1b|1\.5b|2b|3b|e2b)/i.test(id)) {
      score -= 6;
    }

    const tier: ModelFitTier = score >= 82 ? 'ideal' : score >= 62 ? 'good' : 'caution';
    return { model, score, tier, reason, isCodingModel: false };
  });

  return ranked.sort((a, b) => b.score - a.score || a.model.id.localeCompare(b.model.id));
}

export function pickBestInstalledModel(
  models: AIModelInfo[],
  language: ModelLanguageTarget
): RankedFetchedModel | null {
  const ranked = rankFetchedModelsForLanguage(models, language);
  return ranked[0] ?? null;
}
