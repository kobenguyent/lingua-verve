/**
 * LinguaVerve Human Voice & Multi-Accent Audio Engine
 * - Multi-accent support (6 English accents, 3 German DACH accents, plus Spanish & French)
 * - Smart on-device human/neural voice ranking (blocks legacy robotic/novelty/Eloquence voices)
 * - Optional studio-grade Neural TTS (OpenAI gpt-4o-mini-tts with accent instructions,
 *   ElevenLabs multilingual v2, or local Kokoro / Speaches OpenAI-compatible TTS)
 * - In-memory LRU audio cache with seamless offline fallback + Web Audio sound effects
 */

import {
  AccentOption,
  VoiceProviderType,
  VoiceSettings,
  VoiceSpeakingStyle,
} from '../types';
import { AI_CONFIG_STORAGE_KEY } from './aiClient';

export const VOICE_SETTINGS_STORAGE_KEY = 'linguaverve_voice_settings_v1';

export const ACCENT_CATALOG: AccentOption[] = [
  // English (6 global accents)
  {
    code: 'en-GB',
    languageId: 'english',
    flag: '🇬🇧',
    label: 'British (UK)',
    region: 'London · Received Pronunciation',
    sampleText:
      'Good afternoon! Shall we practise crisp British pronunciation and natural human intonation together?',
    neuralHint: 'Speak in a warm, natural British English (London RP) accent with authentic UK vowel cadence.',
  },
  {
    code: 'en-US',
    languageId: 'english',
    flag: '🇺🇸',
    label: 'American (US)',
    region: 'General American',
    sampleText:
      'Good morning! Let’s practice smooth connected speech and natural American rhythm together.',
    neuralHint: 'Speak in a warm, natural General American English accent with relaxed everyday flow.',
  },
  {
    code: 'en-AU',
    languageId: 'english',
    flag: '🇦🇺',
    label: 'Australian (AU)',
    region: 'Sydney · General Australian',
    sampleText:
      'G’day! Let’s train your ear on relaxed Australian vowel glides and natural intonation.',
    neuralHint: 'Speak in an authentic, friendly General Australian English (Sydney) accent.',
  },
  {
    code: 'en-IE',
    languageId: 'english',
    flag: '🇮🇪',
    label: 'Irish (IE)',
    region: 'Dublin · Hiberno-English',
    sampleText:
      'Hello there! Listen to the warm cadence and melodic rhythm of natural Irish English.',
    neuralHint: 'Speak in a warm, natural educated Irish English (Dublin) accent.',
  },
  {
    code: 'en-IN',
    languageId: 'english',
    flag: '🇮🇳',
    label: 'Indian (IN)',
    region: 'Educated Indian English',
    sampleText:
      'Welcome! Practising international accents like Indian English builds real-world exam listening fluency.',
    neuralHint: 'Speak in a clear, warm, articulate educated Indian English accent.',
  },
  {
    code: 'en-ZA',
    languageId: 'english',
    flag: '🇿🇦',
    label: 'South African (ZA)',
    region: 'Cape Town',
    sampleText:
      'Hello! Training across global English accents sharpens your ear for IELTS and Cambridge audio.',
    neuralHint: 'Speak in an authentic, clear educated South African English (Cape Town) accent.',
  },
  // German (3 pluricentric DACH accents)
  {
    code: 'de-DE',
    languageId: 'german',
    flag: '🇩🇪',
    label: 'Germany (DE)',
    region: 'Standard Hochdeutsch · Berlin / Hanover',
    sampleText:
      'Guten Tag! Heute trainieren wir klares Hochdeutsch mit natürlicher menschlicher Betonung.',
    neuralHint: 'Speak in warm, authentic Standard German (Bundesdeutsch / Hochdeutsch) with natural cadence.',
  },
  {
    code: 'de-AT',
    languageId: 'german',
    flag: '🇦🇹',
    label: 'Austria (AT)',
    region: 'Österreichisches Deutsch · Vienna',
    sampleText:
      'Grüß Gott! Heute üben wir weiches, natürliches österreichisches Hochdeutsch aus Wien.',
    neuralHint: 'Speak in an authentic, warm educated Austrian Standard German (Viennese) accent.',
  },
  {
    code: 'de-CH',
    languageId: 'german',
    flag: '🇨🇭',
    label: 'Switzerland (CH)',
    region: 'Schweizer Hochdeutsch · Zurich',
    sampleText:
      'Grüezi! Willkommen beim Hörtraining für authentisches Schweizer Hochdeutsch.',
    neuralHint: 'Speak in an authentic, clear Swiss Standard German (Schweizer Hochdeutsch, Zurich) accent.',
  },
  // Extensible languages
  {
    code: 'es-ES',
    languageId: 'spanish',
    flag: '🇪🇸',
    label: 'Spain (ES)',
    region: 'Castilian · Madrid',
    sampleText: '¡Hola! Practiquemos la pronunciación natural del español de España.',
    neuralHint: 'Speak in natural Castilian Spanish (Madrid) with clear articulation.',
  },
  {
    code: 'es-MX',
    languageId: 'spanish',
    flag: '🇲🇽',
    label: 'Mexico (MX)',
    region: 'Latin American · Mexico City',
    sampleText: '¡Hola! Practiquemos el ritmo natural y cálido del español mexicano.',
    neuralHint: 'Speak in warm, natural Mexican Spanish (Mexico City).',
  },
  {
    code: 'fr-FR',
    languageId: 'french',
    flag: '🇫🇷',
    label: 'France (FR)',
    region: 'Standard Parisian',
    sampleText: 'Bonjour ! Entraînons notre oreille au français naturel et expressif.',
    neuralHint: 'Speak in natural, warm Parisian French.',
  },
  {
    code: 'fr-CA',
    languageId: 'french',
    flag: '🇨🇦',
    label: 'Canada (CA)',
    region: 'Québécois · Montreal',
    sampleText: 'Bonjour ! Découvrons la cadence chaleureuse du français québécois.',
    neuralHint: 'Speak in natural, warm Canadian French (Montreal).',
  },
  {
    code: 'fr-CH',
    languageId: 'french',
    flag: '🇨🇭',
    label: 'Switzerland (CH)',
    region: 'Suisse romande · Geneva',
    sampleText: 'Bonjour ! Entraînons notre écoute avec le français clair et posé de Suisse romande.',
    neuralHint: 'Speak in warm, articulate Swiss French (Suisse romande, Geneva) with clear cadence.',
  },
  {
    code: 'ja-JP',
    languageId: 'japanese',
    flag: '🇯🇵',
    label: 'Japan (JP)',
    region: 'Standard Tokyo · 標準語',
    sampleText: 'こんにちは！今日は自然な日本語の発音とリズムを一緒に練習しましょう。',
    neuralHint: 'Speak in warm, natural Standard Tokyo Japanese (Hyōjungo) with authentic pitch accent and mora timing.',
  },
];

export interface NeuralVoicePreset {
  id: string;
  label: string;
  note: string;
}

export const OPENAI_NEURAL_VOICES: NeuralVoicePreset[] = [
  { id: 'coral', label: 'Coral', note: 'Warm, expressive human conversationalist (recommended)' },
  { id: 'sage', label: 'Sage', note: 'Calm, articulate language tutor cadence' },
  { id: 'nova', label: 'Nova', note: 'Bright, natural everyday clarity' },
  { id: 'ash', label: 'Ash', note: 'Grounded, natural male voice' },
  { id: 'ballad', label: 'Ballad', note: 'Smooth, melodic storytelling tone' },
  { id: 'fable', label: 'Fable', note: 'Expressive British-leaning narrator' },
  { id: 'echo', label: 'Echo', note: 'Balanced, clear male broadcast tone' },
  { id: 'onyx', label: 'Onyx', note: 'Deep, authoritative lecture voice' },
  { id: 'shimmer', label: 'Shimmer', note: 'Gentle, crisp female articulation' },
  { id: 'alloy', label: 'Alloy', note: 'Neutral studio all-rounder' },
];

export const ELEVENLABS_NEURAL_VOICES: NeuralVoicePreset[] = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George (British Male)', note: 'Warm, studio-grade British · Multilingual v2' },
  { id: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie (Australian Male)', note: 'Natural Australian conversational · Multilingual' },
  { id: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel (British News)', note: 'Crisp BBC-style British articulation · Multilingual' },
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah (Natural Female)', note: 'Soft, lifelike human warmth · Multilingual' },
  { id: '9BWtsMINqrJLrRacOk9x', label: 'Aria (Expressive Female)', note: 'Dynamic everyday intonation · Multilingual' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam (American Male)', note: 'Clear General American · Multilingual' },
  { id: 'XB0fDUnXU5powFXDhCwa', label: 'Charlotte (European Female)', note: 'Smooth European EN & DE articulation' },
];

export const GEMINI_NEURAL_VOICES: NeuralVoicePreset[] = [
  { id: 'Aoede', label: 'Aoede (Warm Female)', note: 'Smooth, natural conversational warmth (recommended)' },
  { id: 'Kore', label: 'Kore (Clear Female)', note: 'Crisp, articulate language tutor cadence' },
  { id: 'Zephyr', label: 'Zephyr (Bright Female)', note: 'Clear, upbeat everyday intonation' },
  { id: 'Leda', label: 'Leda (Expressive Female)', note: 'Youthful, dynamic conversational flow' },
  { id: 'Charon', label: 'Charon (Calm Male)', note: 'Measured, authoritative host & tutor voice' },
  { id: 'Puck', label: 'Puck (Lively Male)', note: 'Upbeat, engaging everyday dialogue partner' },
  { id: 'Orus', label: 'Orus (Grounded Male)', note: 'Warm, firm narrative clarity' },
  { id: 'Fenrir', label: 'Fenrir (Expressive Male)', note: 'Rich, emotive storytelling delivery' },
];

export interface LocalTTSServerPreset {
  id: 'mlx-audio' | 'kokoro-fastapi' | 'speaches-piper';
  label: string;
  endpoint: string;
  model: string;
  voice: string;
  note: string;
}

export const LOCAL_TTS_SERVER_PRESETS: LocalTTSServerPreset[] = [
  {
    id: 'mlx-audio',
    label: 'MLX-Audio (Apple Silicon)',
    endpoint: 'http://localhost:8000/v1/audio/speech',
    model: 'mlx-community/Kokoro-82M-bf16',
    voice: 'bf_emma',
    note: 'Native Apple Silicon GPU speech server (Kokoro-82M EN + Chatterbox Multilingual EN/DE).',
  },
  {
    id: 'kokoro-fastapi',
    label: 'Kokoro-FastAPI',
    endpoint: 'http://localhost:8880/v1/audio/speech',
    model: 'kokoro',
    voice: 'bf_emma',
    note: 'Fast local OpenAI-compatible Kokoro server on port 8880.',
  },
  {
    id: 'speaches-piper',
    label: 'Speaches / Piper (DE & EN)',
    endpoint: 'http://localhost:8000/v1/audio/speech',
    model: 'tts-1',
    voice: 'de_DE-thorsten-high',
    note: 'Privacy-first Piper VITS voices with strong German (Thorsten/Eva) & English models.',
  },
];

export const LOCAL_NEURAL_VOICES: NeuralVoicePreset[] = [
  { id: 'de_DE-thorsten-high', label: 'Thorsten High (German M · Piper/Speaches)', note: 'Natural studio German male neural voice (Piper / OpenedAI-Speech)' },
  { id: 'de_DE-eva_k-x_low', label: 'Eva K (German F · Piper/Speaches)', note: 'Warm German female neural voice (Piper / Speaches)' },
  { id: 'de_DE-kerstin-low', label: 'Kerstin (German F · Piper/Speaches)', note: 'Clear German female conversational neural voice' },
  { id: 'bf_emma', label: 'Kokoro Emma (British F)', note: 'Natural British neural voice (Kokoro / MLX-Audio)' },
  { id: 'bm_george', label: 'Kokoro George (British M)', note: 'Natural British male neural voice' },
  { id: 'af_heart', label: 'Kokoro Heart (American F)', note: 'Top-rated warm US neural voice' },
  { id: 'am_michael', label: 'Kokoro Michael (American M)', note: 'Natural US male neural voice' },
  { id: 'af_bella', label: 'Kokoro Bella (American F)', note: 'Expressive conversational US voice' },
  { id: 'ff_siwis', label: 'Kokoro Siwis (French F)', note: 'Natural Parisian French neural voice (Kokoro / MLX-Audio)' },
  { id: 'jf_alpha', label: 'Kokoro Alpha (Japanese F)', note: 'Clear Standard Tokyo Japanese female neural voice (Kokoro / MLX-Audio)' },
  { id: 'jm_kumo', label: 'Kokoro Kumo (Japanese M)', note: 'Natural Tokyo Japanese male neural voice (Kokoro / MLX-Audio)' },
  { id: 'chatterbox-multilingual', label: 'Chatterbox Multilingual (EN/DE/FR/JA)', note: 'Expressive local multilingual voice via MLX-Audio' },
];

export interface VoiceProviderPresetMeta {
  label: string;
  mode: 'offline' | 'local' | 'cloud';
  defaultEndpoint: string;
  defaultModel: string;
  defaultVoice: string;
  suggestedModels: string[];
  requiresApiKey: boolean;
  setupHint: string;
}

export const VOICE_PROVIDER_PRESETS: Record<VoiceProviderType, VoiceProviderPresetMeta> = {
  system: {
    label: 'On-Device Human Neural (Free · Offline)',
    mode: 'offline',
    defaultEndpoint: '',
    defaultModel: 'system-neural',
    defaultVoice: '',
    suggestedModels: ['system-neural'],
    requiresApiKey: false,
    setupHint:
      'Auto-selects Siri Neural, Apple Enhanced/Premium, Edge Online Natural, or Google voices and filters out legacy robotic voices. Zero API key needed.',
  },
  gemini: {
    label: 'Google Gemini Native Dialogue (2.5 Flash TTS)',
    mode: 'cloud',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash-preview-tts',
    defaultVoice: 'Aoede',
    suggestedModels: ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'],
    requiresApiKey: true,
    setupHint:
      'Renders 2-speaker English & German dialogues in a single API call with genuine human breaths, reactions, and natural turn-taking. Reuses your Gemini AI key.',
  },
  openai: {
    label: 'OpenAI Human TTS (gpt-4o-mini-tts)',
    mode: 'cloud',
    defaultEndpoint: 'https://api.openai.com/v1/audio/speech',
    defaultModel: 'gpt-4o-mini-tts',
    defaultVoice: 'coral',
    suggestedModels: ['gpt-4o-mini-tts', 'tts-1-hd', 'tts-1'],
    requiresApiKey: true,
    setupHint:
      'Uses gpt-4o-mini-tts with accent & conversational turn-context instructions so UK, US, Australian, Irish, Indian, Austrian & Swiss accents sound genuinely human.',
  },
  elevenlabs: {
    label: 'ElevenLabs Ultra-Human Voices (v3 & v2)',
    mode: 'cloud',
    defaultEndpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    defaultModel: 'eleven_multilingual_v2',
    defaultVoice: 'JBFqnCBsd6RMkjVDRZzb',
    suggestedModels: ['eleven_v3', 'eleven_multilingual_v2', 'eleven_flash_v2_5'],
    requiresApiKey: true,
    setupHint:
      'Lifelike multilingual human voices with continuous turn prosody (previous/next text context), language locking, and expressive style tuning.',
  },
  'local-openai': {
    label: 'Local Neural TTS (MLX-Audio / Kokoro / Piper)',
    mode: 'local',
    defaultEndpoint: 'http://localhost:8000/v1/audio/speech',
    defaultModel: 'mlx-community/Kokoro-82M-bf16',
    defaultVoice: 'bf_emma',
    suggestedModels: [
      'kokoro',
      'mlx-community/Kokoro-82M-bf16',
      'mlx-community/chatterbox-multilingual',
      'tts-1',
    ],
    requiresApiKey: false,
    setupHint:
      '100% private local neural voices via MLX-Audio (Apple Silicon GPU, port 8000), Kokoro-FastAPI (port 8880), or Speaches/Piper (port 8000). No cloud key needed.',
  },
};

const ROBOTIC_VOICE_NAMES = new Set([
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'eddy',
  'flo',
  'fred',
  'good news',
  'grandma',
  'grandpa',
  'hysterical',
  'jester',
  'junior',
  'kathy',
  'organ',
  'princess',
  'ralph',
  'reed',
  'rocko',
  'sandy',
  'shelley',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
]);

const KNOWN_HUMAN_VOICE_NAMES = [
  'samantha',
  'daniel',
  'karen',
  'moira',
  'rishi',
  'tessa',
  'aman',
  'tara',
  'anna',
  'markus',
  'petra',
  'viktor',
  'yannick',
  'martin',
  'helena',
  'quinn',
  'simone',
  'ava',
  'allison',
  'zoe',
  'serena',
  'kate',
  'oliver',
  'arthur',
  'martha',
  'tom',
  'evan',
  'aaron',
  'nicky',
  'amélie',
  'thomas',
  'mónica',
  'paulina',
  'libby',
  'sonia',
  'ryan',
  'jenny',
  'aria',
  'guy',
  'natasha',
  'william',
  'katja',
  'conrad',
  'ingrid',
  'jonas',
  'leni',
  'jan',
  'audrey',
  'aurélie',
  'nicolas',
  'chloé',
  'denise',
  'henri',
  'sylvie',
  'kyoko',
  'otoya',
  'hattori',
  'o-ren',
  'nanami',
  'keita',
  'haruka',
  'ayumi',
];

export function normalizeLanguageKey(languageId: string): string {
  const lower = (languageId || 'english').toLowerCase();
  if (lower === 'german' || lower === 'de' || lower.startsWith('de-')) return 'german';
  if (lower === 'spanish' || lower === 'es' || lower.startsWith('es-')) return 'spanish';
  if (lower === 'french' || lower === 'fr' || lower.startsWith('fr-')) return 'french';
  if (lower === 'japanese' || lower === 'ja' || lower.startsWith('ja-')) return 'japanese';
  return 'english';
}

export function getAccentsForLanguage(languageId: string): AccentOption[] {
  const key = normalizeLanguageKey(languageId);
  return ACCENT_CATALOG.filter((a) => a.languageId === key);
}

export function getAccentOption(code: string): AccentOption | undefined {
  const normalized = code.replace('_', '-').toLowerCase();
  return ACCENT_CATALOG.find((a) => a.code.toLowerCase() === normalized);
}

export function getDefaultVoiceSettings(): VoiceSettings {
  return {
    provider: 'system',
    accents: {
      english: 'en-GB',
      german: 'de-DE',
      spanish: 'es-ES',
      french: 'fr-FR',
      japanese: 'ja-JP',
    },
    preferredSystemVoices: {},
    rateMultiplier: 1.0,
    speakingStyle: 'natural',
    endpoint: VOICE_PROVIDER_PRESETS.openai.defaultEndpoint,
    apiKey: '',
    model: VOICE_PROVIDER_PRESETS.openai.defaultModel,
    neuralVoice: VOICE_PROVIDER_PRESETS.openai.defaultVoice,
    reuseOpenAIKey: true,
    reuseGeminiKey: true,
  };
}

export function loadVoiceSettings(): VoiceSettings {
  const defaults = getDefaultVoiceSettings();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      ...defaults,
      ...parsed,
      accents: {
        ...defaults.accents,
        ...(parsed.accents && typeof parsed.accents === 'object' ? parsed.accents : {}),
      },
      preferredSystemVoices:
        parsed.preferredSystemVoices && typeof parsed.preferredSystemVoices === 'object'
          ? parsed.preferredSystemVoices
          : {},
      rateMultiplier:
        typeof parsed.rateMultiplier === 'number'
          ? Math.max(0.75, Math.min(1.25, parsed.rateMultiplier))
          : 1.0,
      reuseGeminiKey: parsed.reuseGeminiKey !== false,
    };
  } catch {
    return defaults;
  }
}

export function saveVoiceSettingsToStorage(settings: VoiceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI?: string;
  localService?: boolean;
}

/**
 * Returns true if a browser/OS voice is a novelty gag or legacy Eloquence robot voice.
 */
export function isRoboticOrNoveltyVoice(voice: VoiceLike): boolean {
  const nameLower = (voice.name || '').toLowerCase();
  const uriLower = (voice.voiceURI || '').toLowerCase();
  const baseName = nameLower.split('(')[0].trim();

  if (ROBOTIC_VOICE_NAMES.has(baseName)) return true;
  if (uriLower.includes('eloquence')) return true;
  if (uriLower.includes('com.apple.speech.synthesis.voice.')) return true;
  if (uriLower.includes('espeak')) return true;
  return false;
}

export function classifyVoiceQuality(voice: VoiceLike): 'neural' | 'enhanced' | 'standard' {
  const haystack = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
  if (
    haystack.includes('siri.natural') ||
    haystack.includes('gryphon-neural') ||
    haystack.includes('online (natural)') ||
    haystack.includes('neural') ||
    haystack.includes('natural') ||
    haystack.includes('premium') ||
    haystack.includes('wavenet') ||
    haystack.includes('studio') ||
    haystack.includes('siri')
  ) {
    return 'neural';
  }
  if (haystack.includes('enhanced') || haystack.includes('google')) {
    return 'enhanced';
  }
  return 'standard';
}

/**
 * Scores a browser/OS voice for human naturalness and target accent fidelity.
 * Robotic/novelty voices return -1000 so they are never picked automatically.
 */
export function scoreSystemVoice(voice: VoiceLike, targetBcp47: string): number {
  if (isRoboticOrNoveltyVoice(voice)) return -1000;

  const vLang = (voice.lang || '').replace('_', '-').toLowerCase();
  const target = targetBcp47.replace('_', '-').toLowerCase();
  const targetBase = target.slice(0, 2);

  if (!vLang.startsWith(targetBase)) return -500;

  let score = vLang === target ? 300 : 80;

  const tier = classifyVoiceQuality(voice);
  if (tier === 'neural') score += 130;
  else if (tier === 'enhanced') score += 90;

  const uriLower = (voice.voiceURI || '').toLowerCase();
  const baseName = (voice.name || '').toLowerCase().split('(')[0].trim();

  if (uriLower.includes('siri.natural') || uriLower.includes('gryphon-neural')) {
    score += 35;
  }
  if (KNOWN_HUMAN_VOICE_NAMES.includes(baseName)) {
    score += 45;
  }
  if (uriLower.includes('super-compact')) {
    score -= 15;
  }
  if (voice.localService === false && tier !== 'standard') {
    // Cloud neural voices exposed by Edge/Chrome (e.g. Microsoft Natural Online / Google)
    score += 20;
  }

  return score;
}

export function pickBestSystemVoice<T extends VoiceLike>(
  voices: T[],
  targetBcp47: string,
  preferredVoiceURI?: string
): T | undefined {
  if (!voices || voices.length === 0) return undefined;

  if (preferredVoiceURI) {
    const exact = voices.find(
      (v) =>
        (v.voiceURI === preferredVoiceURI || v.name === preferredVoiceURI) &&
        !isRoboticOrNoveltyVoice(v)
    );
    if (exact) return exact;
  }

  const targetBase = targetBcp47.replace('_', '-').toLowerCase().slice(0, 2);
  const candidates = voices
    .filter((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith(targetBase))
    .map((voice) => ({ voice, score: scoreSystemVoice(voice, targetBcp47) }))
    .filter((item) => item.score > -500)
    .sort((a, b) => b.score - a.score);

  if (candidates.length > 0) return candidates[0].voice;

  // Absolute last resort if ONLY non-blacklisted voice doesn't exist
  return voices.find((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith(targetBase));
}

export function buildNeuralVoiceInstructions(
  accentCode: string,
  style: VoiceSpeakingStyle,
  slow: boolean
): string {
  const accent = getAccentOption(accentCode);
  const accentCue =
    accent?.neuralHint ??
    `Speak in natural, idiomatic ${accentCode} with authentic native pronunciation.`;

  const styleCue: Record<VoiceSpeakingStyle, string> = {
    natural: 'Use warm, natural human prosody with subtle breathing pauses between sentences.',
    tutor: 'Speak like an encouraging, crystal-clear native language coach articulating cleanly without sounding robotic.',
    conversational: 'Speak casually and expressively like a native friend talking over coffee.',
    broadcast: 'Speak with crisp, poised news-broadcast clarity and balanced pacing.',
  };

  const paceCue = slow
    ? 'Deliver at a gentle, deliberate learner pace (~0.8x) with clean enunciation.'
    : 'Deliver at a natural everyday speaking pace.';

  return `${accentCue} ${styleCue[style]} ${paceCue} Never sound flat or mechanical.`;
}

function readSharedAIProviderKey(provider: 'openai' | 'gemini'): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { provider?: string; apiKey?: string };
    if (parsed.provider === provider && parsed.apiKey) {
      return parsed.apiKey.trim();
    }
    return '';
  } catch {
    return '';
  }
}

export function parseSampleRateFromMimeType(mimeType: string, fallback: number = 24000): number {
  const match = /rate=(\d{4,6})/i.exec(mimeType || '');
  if (!match) return fallback;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed >= 8000 && parsed <= 96000 ? parsed : fallback;
}

/**
 * Prepends a standard 44-byte RIFF/WAVE PCM header to raw 16-bit signed little-endian PCM bytes.
 */
export function wrapPCM16AsWAV(
  pcmBytes: Uint8Array,
  sampleRate: number = 24000,
  channels: number = 1
): Uint8Array {
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmBytes.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(pcmBytes);
  return new Uint8Array(buffer);
}

export function resolveGeminiTTSEndpoint(endpoint: string, model: string): string {
  const effectiveModel = (model || 'gemini-2.5-flash-preview-tts').trim().replace(/^models\//i, '');
  let base = (endpoint || VOICE_PROVIDER_PRESETS.gemini.defaultEndpoint).trim().replace(/\/+$/, '');
  if (!base) base = VOICE_PROVIDER_PRESETS.gemini.defaultEndpoint;

  if (/generateContent/i.test(base)) {
    return base.split('?')[0];
  }
  if (/\/models\/[^/]+$/i.test(base)) {
    return `${base}:generateContent`;
  }
  if (/\/models$/i.test(base)) {
    return `${base}/${effectiveModel}:generateContent`;
  }
  return `${base}/models/${effectiveModel}:generateContent`;
}

export function buildGeminiTTSRequestBody(params: {
  text: string;
  accentCode: string;
  style: VoiceSpeakingStyle;
  slow: boolean;
  voice: string;
  dialogueTurns?: DialogueTurn[];
  secondaryVoice?: string;
}): Record<string, unknown> {
  const { text, accentCode, style, slow, voice, dialogueTurns, secondaryVoice } = params;
  const directorCue = buildNeuralVoiceInstructions(accentCode, style, slow);

  const distinctSpeakers: Array<{ speaker: string; speakerIndex: number }> = [];
  if (dialogueTurns && dialogueTurns.length >= 2) {
    const seen = new Set<string>();
    for (const turn of dialogueTurns) {
      const norm = turn.speaker.toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        distinctSpeakers.push({ speaker: turn.speaker, speakerIndex: turn.speakerIndex });
      }
    }
  }

  if (dialogueTurns && distinctSpeakers.length === 2) {
    const primaryVoice = voice || 'Aoede';
    const altVoice = secondaryVoice && secondaryVoice !== primaryVoice
      ? secondaryVoice
      : primaryVoice === 'Charon'
      ? 'Aoede'
      : 'Charon';

    const scriptLines = dialogueTurns.map((t) => {
      const canonical =
        distinctSpeakers.find((s) => s.speakerIndex === t.speakerIndex)?.speaker || t.speaker;
      return `${canonical}: ${t.text}`;
    });

    const promptText = [
      `Read this live human conversation naturally. ${directorCue}`,
      'Maintain authentic turn-taking, subtle breathing, and spontaneous conversational warmth without reading speaker labels aloud:',
      '',
      ...scriptLines,
    ].join('\n');

    return {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: distinctSpeakers[0].speaker,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: primaryVoice } },
              },
              {
                speaker: distinctSpeakers[1].speaker,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: altVoice } },
              },
            ],
          },
        },
      },
    };
  }

  const promptText = `${directorCue}\nSpeak only the exact text below naturally:\n\n${text}`;
  return {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice || 'Aoede',
          },
        },
      },
    },
  };
}

export function buildElevenLabsRequestBody(params: {
  text: string;
  model: string;
  style: VoiceSpeakingStyle;
  speed: number;
  accentCode: string;
  previousText?: string;
  nextText?: string;
}): Record<string, unknown> {
  const { text, model, style, speed, accentCode, previousText, nextText } = params;
  const effectiveModel = (model || 'eleven_multilingual_v2').trim();
  const modelLower = effectiveModel.toLowerCase();
  const isV3 = modelLower.includes('v3');
  const isFlash = modelLower.includes('flash');

  const stylePresetMap: Record<VoiceSpeakingStyle, { stability: number; similarity_boost: number; style: number }> = {
    conversational: { stability: 0.35, similarity_boost: 0.78, style: 0.45 },
    natural: { stability: 0.45, similarity_boost: 0.78, style: 0.30 },
    tutor: { stability: 0.60, similarity_boost: 0.80, style: 0.20 },
    broadcast: { stability: 0.65, similarity_boost: 0.80, style: 0.15 },
  };
  const preset = stylePresetMap[style] || stylePresetMap.natural;

  const voiceSettings: Record<string, unknown> = {
    stability: preset.stability,
    similarity_boost: preset.similarity_boost,
    style: preset.style,
    use_speaker_boost: true,
  };
  if (!isV3) {
    voiceSettings.speed = Math.max(0.7, Math.min(1.2, Number(speed.toFixed(2))));
  }

  const body: Record<string, unknown> = {
    text,
    model_id: effectiveModel,
    voice_settings: voiceSettings,
  };
  if (previousText?.trim()) {
    body.previous_text = previousText.trim();
  }
  if (nextText?.trim()) {
    body.next_text = nextText.trim();
  }
  const langBase = (accentCode || '').slice(0, 2).toLowerCase();
  if ((isFlash || isV3) && /^[a-z]{2}$/.test(langBase)) {
    body.language_code = langBase;
  }
  return body;
}

export function buildOpenAIDialogueInstructions(
  accentCode: string,
  style: VoiceSpeakingStyle,
  speaker: string,
  speakerIndex: number,
  slow: boolean,
  previousTurn?: DialogueTurn
): string {
  const baseInstructions = buildNeuralVoiceInstructions(accentCode, style, slow);
  const roleCue =
    speakerIndex % 2 === 0
      ? `You are ${speaker} speaking spontaneously in a natural live two-person conversation.`
      : `You are ${speaker}, responding warmly and naturally as the conversation partner.`;
  const contextCue = previousTurn
    ? ` Respond naturally right after ${previousTurn.speaker} said: "${previousTurn.text.slice(0, 140)}".`
    : '';
  return `${baseInstructions} ${roleCue}${contextCue} Never sound like you are reading a script.`;
}

export function naturalTurnPauseMs(
  previousText: string,
  _nextText: string,
  slow: boolean
): number {
  const trimmed = (previousText || '').trim();
  let baseMs = 220;
  if (trimmed.length > 0 && (trimmed.length <= 28 || trimmed.endsWith('!') || trimmed.endsWith('—'))) {
    baseMs = 120;
  } else if (trimmed.endsWith('?')) {
    baseMs = 200;
  } else if (trimmed.length >= 95) {
    baseMs = 300;
  }
  return slow ? Math.round(baseMs * 1.25) : baseMs;
}

export async function checkLocalTTSServer(
  endpoint: string
): Promise<{ ok: boolean; message: string; models?: string[] }> {
  const trimmed = (endpoint || '').trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter a local TTS endpoint URL first.' };
  }
  if (typeof fetch !== 'function') {
    return { ok: false, message: 'Fetch API unavailable in this environment.' };
  }

  let baseOrigin = trimmed.replace(/\/+$/, '');
  const v1Idx = baseOrigin.toLowerCase().indexOf('/v1/');
  if (v1Idx !== -1) {
    baseOrigin = baseOrigin.slice(0, v1Idx);
  }
  const candidates = [`${baseOrigin}/v1/models`, `${baseOrigin}/health`];

  for (const url of candidates) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const timer = controller ? setTimeout(() => controller.abort(), 3000) : undefined;
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: controller?.signal,
      });
      if (timer) clearTimeout(timer);
      if (res.ok) {
        let models: string[] = [];
        try {
          const json = (await res.json()) as { data?: Array<{ id?: string }>; models?: string[] };
          if (Array.isArray(json.data)) {
            models = json.data.map((m) => m.id || '').filter(Boolean);
          } else if (Array.isArray(json.models)) {
            models = json.models.filter(Boolean);
          }
        } catch {
          // /health may return plain text
        }
        const suffix = models.length > 0 ? ` (${models.slice(0, 3).join(', ')})` : '';
        return {
          ok: true,
          message: `Local TTS server reachable at ${baseOrigin}${suffix}.`,
          models,
        };
      }
    } catch {
      if (timer) clearTimeout(timer);
    }
  }

  return {
    ok: false,
    message: `Could not reach ${baseOrigin}. Start mlx-audio (port 8000) or Kokoro-FastAPI (port 8880) and retry.`,
  };
}

export interface DialogueTurn {
  speaker: string;
  text: string;
  speakerIndex: number;
}

const NON_SPEAKER_LABELS = new Set([
  'angebot', 'hinweis', 'achtung', 'preis', 'uhrzeit', 'öffnungszeiten', 'datum',
  'note', 'warning', 'tip', 'example', 'beispiel', 'track', 'part', 'teil', 'fazit',
  'ergebnis', 'regel', 'summary', 'context', 'focus', 'trap',
]);

const FEMALE_SPEAKER_HINTS = new Set([
  'frau', 'anna', 'hannah', 'lena', 'clara', 'mia', 'sara', 'sarah', 'emma', 'maya',
  'sophie', 'julia', 'petra', 'helena', 'nina', 'laura', 'lisa', 'katharina', 'elena',
  'priya', 'chloe', 'chloé', 'rachel', 'amira', 'moderatorin', 'kritikerin', 'ärztin', 'verkäuferin',
  'rezeptionistin', 'studentin', 'autorin', 'professorin', 'novak', 'berger', 'keller', 'meier',
  'camille', 'claire', 'élodie', 'elodie', 'manon', 'léa', 'lea', 'nadia', 'marie', 'céline', 'celine',
  'madame', 'mme', 'yuki', 'haruka', 'sakura', 'yumi', 'aiko', 'hina', 'akiko', 'keiko', 'mai', 'rin',
]);

const MALE_SPEAKER_HINTS = new Set([
  'herr', 'lukas', 'lucas', 'markus', 'viktor', 'martin', 'yannick', 'tobias', 'jonas', 'max',
  'paul', 'david', 'tom', 'ben', 'liam', 'leo', 'daniel', 'oliver', 'james', 'noah',
  'stefan', 'felix', 'alex', 'moderator', 'interviewer', 'schaffner', 'arzt', 'verkäufer',
  'kellner', 'becker', 'steiner', 'lindner', 'gruber', 'weber', 'vance', 'tutor', 'host', 'guest',
  'thomas', 'julien', 'antoine', 'hugo', 'marc', 'nicolas', 'pierre', 'monsieur', 'm',
  'kenji', 'takashi', 'hiroshi', 'ren', 'daiki', 'kenta', 'taro', 'sato', 'tanaka', 'suzuki',
]);

/**
 * Parses multi-speaker dialogue scripts (both newline-separated and inline `Name: ...` turns).
 * Returns [] if the text is a single-speaker monologue (< 2 distinct speakers).
 */
export function parseDialogueTurns(text: string): DialogueTurn[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const regex = /(?:^|\n|(?<=[.!?。！？—–]\s*))([A-ZÄÖÜÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ][A-Za-zÄÖÜäöüßÀ-ÿ.\- ]{0,22})[:：]\s*/g;
  const matches: Array<{ speaker: string; start: number; textStart: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(trimmed)) !== null) {
    const speaker = m[1].trim();
    if (!speaker || NON_SPEAKER_LABELS.has(speaker.toLowerCase())) continue;
    if (speaker.split(/\s+/).length > 3) continue;
    matches.push({
      speaker,
      start: m.index,
      textStart: m.index + m[0].length,
    });
  }

  if (matches.length < 2) return [];

  const speakerMap = new Map<string, number>();
  const turns: DialogueTurn[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const nextStart = i + 1 < matches.length ? matches[i + 1].start : trimmed.length;
    const spoken = trimmed.slice(cur.textStart, nextStart).trim();
    if (!spoken) continue;
    const key = cur.speaker.toLowerCase();
    let idx = speakerMap.get(key);
    if (idx === undefined) {
      idx = speakerMap.size;
      speakerMap.set(key, idx);
    }
    turns.push({ speaker: cur.speaker, text: spoken, speakerIndex: idx });
  }

  return speakerMap.size >= 2 ? turns : [];
}

function inferSpeakerGender(speaker: string): 'female' | 'male' | 'unknown' {
  const tokens = speaker
    .toLowerCase()
    .replace(/\./g, '')
    .split(/[\s-]+/)
    .filter(Boolean);
  for (const t of tokens) {
    if (FEMALE_SPEAKER_HINTS.has(t)) return 'female';
    if (MALE_SPEAKER_HINTS.has(t)) return 'male';
  }
  return 'unknown';
}

function pickNeuralVoiceForSpeaker(
  cfg: VoiceSettings,
  accentCode: string,
  speaker: string,
  speakerIndex: number
): string {
  const isGerman = accentCode.toLowerCase().startsWith('de');
  const gender = inferSpeakerGender(speaker);
  const defaultForProvider =
    cfg.provider === 'gemini'
      ? 'Aoede'
      : cfg.provider === 'openai'
      ? 'coral'
      : cfg.provider === 'elevenlabs'
      ? ELEVENLABS_NEURAL_VOICES[0].id
      : 'bf_emma';
  const primary = cfg.neuralVoice || defaultForProvider;

  if (cfg.provider === 'gemini') {
    const females = ['Aoede', 'Kore', 'Zephyr', 'Leda'];
    const males = ['Charon', 'Puck', 'Orus', 'Fenrir'];
    const primaryLower = primary.toLowerCase();
    if (speakerIndex === 0) {
      if (gender === 'male' && females.some((v) => v.toLowerCase() === primaryLower)) return 'Charon';
      if (gender === 'female' && males.some((v) => v.toLowerCase() === primaryLower)) return 'Aoede';
      return primary;
    }
    if (gender === 'male') return males.find((v) => v.toLowerCase() !== primaryLower) || 'Charon';
    if (gender === 'female') return females.find((v) => v.toLowerCase() !== primaryLower) || 'Kore';
    return females.some((v) => v.toLowerCase() === primaryLower) ? 'Charon' : 'Aoede';
  }

  if (cfg.provider === 'openai') {
    const females = ['coral', 'sage', 'nova', 'shimmer'];
    const males = ['ash', 'echo', 'onyx', 'fable'];
    if (speakerIndex === 0) {
      return gender === 'male' && females.includes(primary.toLowerCase()) ? 'ash' : primary;
    }
    if (gender === 'male') return males.find((v) => v !== primary.toLowerCase()) || 'ash';
    if (gender === 'female') return females.find((v) => v !== primary.toLowerCase()) || 'sage';
    return females.includes(primary.toLowerCase()) ? 'ash' : 'coral';
  }

  if (cfg.provider === 'elevenlabs') {
    const femaleId = 'XB0fDUnXU5powFXDhCwa';
    const maleId = 'JBFqnCBsd6RMkjVDRZzb';
    if (speakerIndex === 0) return primary;
    if (gender === 'male') return primary === maleId ? 'onwK4e9ZLuTAKqWW03F9' : maleId;
    if (gender === 'female') return primary === femaleId ? 'EXAVITQu4vr4xnSDxMaL' : femaleId;
    return primary === maleId ? femaleId : maleId;
  }

  if (cfg.provider === 'local-openai') {
    const lowerAccent = accentCode.toLowerCase();
    if (isGerman) {
      const male = 'de_DE-thorsten-high';
      const female = 'de_DE-eva_k-x_low';
      if (speakerIndex === 0) return gender === 'female' ? female : gender === 'male' ? male : primary;
      return primary === male ? female : male;
    }
    if (lowerAccent.startsWith('ja')) {
      const female = 'jf_alpha';
      const male = 'jm_kumo';
      if (speakerIndex === 0) return gender === 'male' ? male : female;
      return primary === male ? female : male;
    }
    if (lowerAccent.startsWith('fr')) {
      return 'ff_siwis';
    }
    return speakerIndex === 0 ? primary : primary === 'bm_george' ? 'bf_emma' : 'bm_george';
  }

  return primary;
}

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private settings: VoiceSettings = loadVoiceSettings();
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activeHtmlAudio: HTMLAudioElement | null = null;
  private neuralAudioCache = new Map<string, string>();
  private speakGeneration = 0;
  private listeners = new Set<() => void>();
  private lastVoiceNotice: string | null = null;
  private activeSpeakerName: string | null = null;

  constructor() {
    this.initVoiceListListener();
  }

  private initVoiceListListener(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const refresh = () => {
      try {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedVoices = list;
          this.notifyListeners();
        }
      } catch {
        // Ignore unavailable speechSynthesis
      }
    };
    refresh();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refresh);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getVoiceSettings(): VoiceSettings {
    return this.settings;
  }

  public getLastVoiceNotice(): string | null {
    return this.lastVoiceNotice;
  }

  public getActiveSpeakerName(): string | null {
    return this.activeSpeakerName;
  }

  private setActiveSpeaker(name: string | null): void {
    if (this.activeSpeakerName !== name) {
      this.activeSpeakerName = name;
      this.notifyListeners();
    }
  }

  public updateVoiceSettings(next: VoiceSettings): void {
    this.settings = {
      ...next,
      rateMultiplier: Math.max(0.75, Math.min(1.25, next.rateMultiplier || 1.0)),
    };
    this.lastVoiceNotice = null;
    saveVoiceSettingsToStorage(this.settings);
    this.notifyListeners();
  }

  public setAccent(languageId: string, accentCode: string): void {
    const key = normalizeLanguageKey(languageId);
    this.updateVoiceSettings({
      ...this.settings,
      accents: {
        ...this.settings.accents,
        [key]: accentCode,
      },
    });
  }

  public getActiveAccentCode(languageId: string): string {
    // Allow callers to pass an explicit BCP-47 locale like 'en-AU' or 'de-AT' directly
    if (languageId && /^[a-z]{2}[-_][a-z]{2}$/i.test(languageId)) {
      return languageId.replace('_', '-');
    }
    const key = normalizeLanguageKey(languageId);
    const saved = this.settings.accents[key];
    if (saved) return saved;
    if (key === 'german') return 'de-DE';
    if (key === 'spanish') return 'es-ES';
    if (key === 'french') return 'fr-FR';
    if (key === 'japanese') return 'ja-JP';
    return 'en-GB';
  }

  public getEffectiveApiKey(settings: VoiceSettings = this.settings): string {
    if (settings.apiKey.trim()) return settings.apiKey.trim();
    if (settings.provider === 'openai' && settings.reuseOpenAIKey) {
      return readSharedAIProviderKey('openai');
    }
    if (settings.provider === 'gemini' && settings.reuseGeminiKey !== false) {
      return readSharedAIProviderKey('gemini');
    }
    return '';
  }

  public isNeuralProviderReady(settings: VoiceSettings = this.settings): boolean {
    if (settings.provider === 'system') return false;
    if (settings.provider === 'local-openai') {
      return Boolean(settings.endpoint.trim());
    }
    return Boolean(settings.endpoint.trim() && this.getEffectiveApiKey(settings));
  }

  private static hashCacheKey(key: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < key.length; i += 1) {
      const c = key.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= c + i;
      h2 = Math.imul(h2, 0x85ebca6b);
    }
    return `${(h1 >>> 0).toString(16)}-${(h2 >>> 0).toString(16)}-${key.length}`;
  }

  private async readPersistentAudioBlob(cacheKey: string): Promise<Blob | null> {
    if (typeof window === 'undefined' || typeof caches === 'undefined') return null;
    try {
      const cache = await caches.open('linguaverve-tts-v1');
      const syntheticUrl = `https://linguaverve.local/tts-cache/${SoundEngine.hashCacheKey(cacheKey)}`;
      const hit = await cache.match(syntheticUrl);
      if (!hit) return null;
      return await hit.blob();
    } catch {
      return null;
    }
  }

  private async writePersistentAudioBlob(cacheKey: string, blob: Blob): Promise<void> {
    if (typeof window === 'undefined' || typeof caches === 'undefined') return;
    try {
      const cache = await caches.open('linguaverve-tts-v1');
      const keys = await cache.keys();
      if (keys.length >= 80) {
        const overflow = keys.length - 79;
        for (let i = 0; i < overflow; i += 1) {
          await cache.delete(keys[i]);
        }
      }
      const syntheticUrl = `https://linguaverve.local/tts-cache/${SoundEngine.hashCacheKey(cacheKey)}`;
      const contentType = blob.type || 'audio/mpeg';
      await cache.put(syntheticUrl, new Response(blob, { headers: { 'Content-Type': contentType } }));
    } catch {
      // Cache Storage unavailable or quota exceeded
    }
  }

  public async clearNeuralAudioCache(): Promise<void> {
    for (const url of this.neuralAudioCache.values()) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore
      }
    }
    this.neuralAudioCache.clear();
    if (typeof window !== 'undefined' && typeof caches !== 'undefined') {
      try {
        await caches.delete('linguaverve-tts-v1');
      } catch {
        // Ignore
      }
    }
  }

  public async getNeuralAudioCacheCount(): Promise<number> {
    let persistentCount = 0;
    if (typeof window !== 'undefined' && typeof caches !== 'undefined') {
      try {
        const cache = await caches.open('linguaverve-tts-v1');
        const keys = await cache.keys();
        persistentCount = keys.length;
      } catch {
        persistentCount = 0;
      }
    }
    return Math.max(this.neuralAudioCache.size, persistentCount);
  }

  public getHumanSystemVoices(languageId?: string): SpeechSynthesisVoice[] {
    let voices = this.cachedVoices;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const live = window.speechSynthesis.getVoices();
        if (live && live.length > 0) {
          voices = live;
          this.cachedVoices = live;
        }
      } catch {
        // Ignore
      }
    }

    const filtered = voices.filter((v) => !isRoboticOrNoveltyVoice(v));
    if (!languageId) return filtered;

    const accentCode = this.getActiveAccentCode(languageId);
    const base = accentCode.slice(0, 2).toLowerCase();
    return filtered
      .filter((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith(base))
      .sort((a, b) => scoreSystemVoice(b, accentCode) - scoreSystemVoice(a, accentCode));
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeech();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an uplifting polyglot chime when achieving a milestone or mastering a tip
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }

  /**
   * Tactile polyglot click feedback for buttons/toggles
   */
  public playClickSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Silent catch
    }
  }

  /**
   * Speak text with the learner's selected accent & human voice engine
   * (Neural TTS when configured, falling back seamlessly to best human on-device voice).
   */
  public speak(
    text: string,
    languageId: string = 'english',
    slow: boolean = false,
    accentOverride?: string
  ): void {
    if (this.isMuted || !text.trim()) return;
    const targetBcp47 = accentOverride
      ? accentOverride.replace('_', '-')
      : this.getActiveAccentCode(languageId);

    this.stopSpeech();
    const generation = ++this.speakGeneration;

    if (this.isNeuralProviderReady(this.settings) && typeof fetch === 'function') {
      void this.speakWithNeuralProvider(text, targetBcp47, slow, generation, this.settings);
      return;
    }

    this.speakWithSystemVoice(text, targetBcp47, slow);
  }

  public async previewVoice(
    text: string,
    accentCode: string,
    overrideSettings?: VoiceSettings
  ): Promise<{ ok: boolean; engine: string; note?: string }> {
    const cfg = overrideSettings ?? this.settings;
    this.stopSpeech();
    const generation = ++this.speakGeneration;

    if (this.isNeuralProviderReady(cfg) && typeof fetch === 'function') {
      const res = await this.speakWithNeuralProvider(text, accentCode, false, generation, cfg);
      return res;
    }

    const picked = this.speakWithSystemVoice(text, accentCode, false, cfg);
    return {
      ok: true,
      engine: picked ? `On-Device · ${picked.name} (${picked.lang})` : `On-Device (${accentCode})`,
    };
  }

  private async speakWithNeuralProvider(
    text: string,
    accentCode: string,
    slow: boolean,
    generation: number,
    cfg: VoiceSettings
  ): Promise<{ ok: boolean; engine: string; note?: string }> {
    const dialogueTurns = parseDialogueTurns(text);
    if (dialogueTurns.length > 0) {
      return this.speakDialogueWithNeuralProvider(dialogueTurns, text, accentCode, slow, generation, cfg);
    }
    return this.speakSingleNeuralSegment(text, accentCode, slow, generation, cfg);
  }

  private static decodeBase64ToBytes(base64: string): Uint8Array {
    const clean = base64.replace(/\s+/g, '');
    if (typeof atob === 'function') {
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    }
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const out: number[] = [];
    let buffer = 0;
    let bits = 0;
    for (let i = 0; i < clean.length; i += 1) {
      const ch = clean[i];
      if (ch === '=') break;
      const val = alphabet.indexOf(ch);
      if (val === -1) continue;
      buffer = (buffer << 6) | val;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((buffer >> bits) & 0xff);
      }
    }
    return new Uint8Array(out);
  }

  private resolvePlaybackRateForProvider(cfg: VoiceSettings, slow: boolean): number {
    const isV3 = cfg.provider === 'elevenlabs' && (cfg.model || '').toLowerCase().includes('v3');
    if (cfg.provider === 'gemini' || isV3) {
      const base = slow ? 0.84 : 1.0;
      return Math.max(0.8, Math.min(1.2, base * (cfg.rateMultiplier || 1.0)));
    }
    return 1.0;
  }

  private async fetchNeuralSegmentUrl(
    text: string,
    accentCode: string,
    slow: boolean,
    cfg: VoiceSettings,
    voiceOverride?: string,
    instructionsOverride?: string,
    elevenContext?: { previousText?: string; nextText?: string },
    geminiDialogue?: { turns: DialogueTurn[]; secondaryVoice?: string }
  ): Promise<string> {
    const defaultVoiceForProvider =
      cfg.provider === 'gemini'
        ? 'Aoede'
        : cfg.provider === 'openai'
        ? 'coral'
        : cfg.provider === 'elevenlabs'
        ? ELEVENLABS_NEURAL_VOICES[0].id
        : 'bf_emma';
    const effectiveVoice = voiceOverride || cfg.neuralVoice || defaultVoiceForProvider;
    const secondaryKey = geminiDialogue?.secondaryVoice || '';
    const prevKey = elevenContext?.previousText || '';
    const nextKey = elevenContext?.nextText || '';
    const cacheKey = `${cfg.provider}|${cfg.model}|${effectiveVoice}|${secondaryKey}|${accentCode}|${cfg.speakingStyle}|${cfg.rateMultiplier}|${slow ? '1' : '0'}|${instructionsOverride || ''}|${prevKey}|${nextKey}|${text}`;

    const cachedUrl = this.neuralAudioCache.get(cacheKey);
    if (cachedUrl) return cachedUrl;

    const persistentBlob = await this.readPersistentAudioBlob(cacheKey);
    if (persistentBlob) {
      const objectUrl = URL.createObjectURL(persistentBlob);
      this.storeMemoryCacheUrl(cacheKey, objectUrl);
      return objectUrl;
    }

    const apiKey = this.getEffectiveApiKey(cfg);
    const speed = Math.max(0.65, Math.min(1.3, (slow ? 0.8 : 0.98) * (cfg.rateMultiplier || 1.0)));

    let blob: Blob;
    if (cfg.provider === 'gemini') {
      const url = resolveGeminiTTSEndpoint(cfg.endpoint, cfg.model);
      const body = buildGeminiTTSRequestBody({
        text,
        accentCode,
        style: cfg.speakingStyle,
        slow,
        voice: effectiveVoice,
        dialogueTurns: geminiDialogue?.turns,
        secondaryVoice: geminiDialogue?.secondaryVoice,
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> };
        }>;
      };
      const inlinePart = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
      if (!inlinePart?.data) {
        throw new Error('Empty Gemini audio response');
      }
      const rawBytes = SoundEngine.decodeBase64ToBytes(inlinePart.data);
      const mime = (inlinePart.mimeType || 'audio/L16;codec=pcm;rate=24000').toLowerCase();
      if (mime.includes('pcm') || mime.includes('l16')) {
        const rate = parseSampleRateFromMimeType(mime, 24000);
        const wavBytes = wrapPCM16AsWAV(rawBytes, rate, 1);
        const wavBuffer = wavBytes.buffer.slice(wavBytes.byteOffset, wavBytes.byteOffset + wavBytes.byteLength) as ArrayBuffer;
        blob = new Blob([wavBuffer], { type: 'audio/wav' });
      } else {
        const rawBuffer = rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength) as ArrayBuffer;
        blob = new Blob([rawBuffer], { type: mime });
      }
    } else if (cfg.provider === 'elevenlabs') {
      const base = cfg.endpoint.replace(/\/+$/, '');
      const voiceId = encodeURIComponent(effectiveVoice);
      const url = base.includes('/text-to-speech/') ? base : `${base}/${voiceId}`;
      const payload = buildElevenLabsRequestBody({
        text,
        model: cfg.model || 'eleven_multilingual_v2',
        style: cfg.speakingStyle,
        speed,
        accentCode,
        previousText: elevenContext?.previousText,
        nextText: elevenContext?.nextText,
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      blob = await response.blob();
    } else {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
      const payload: Record<string, unknown> = {
        model: cfg.model || (cfg.provider === 'openai' ? 'gpt-4o-mini-tts' : 'kokoro'),
        input: text,
        voice: effectiveVoice,
        response_format: 'mp3',
        speed,
      };
      if (
        cfg.provider === 'openai' &&
        (payload.model as string).toLowerCase().includes('gpt-4o-mini-tts')
      ) {
        payload.instructions =
          instructionsOverride || buildNeuralVoiceInstructions(accentCode, cfg.speakingStyle, slow);
      }
      const response = await fetch(cfg.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      blob = await response.blob();
    }

    const objectUrl = URL.createObjectURL(blob);
    this.storeMemoryCacheUrl(cacheKey, objectUrl);
    void this.writePersistentAudioBlob(cacheKey, blob);
    return objectUrl;
  }

  private storeMemoryCacheUrl(cacheKey: string, objectUrl: string): void {
    if (this.neuralAudioCache.size >= 40) {
      const oldestKey = this.neuralAudioCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = this.neuralAudioCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        this.neuralAudioCache.delete(oldestKey);
      }
    }
    this.neuralAudioCache.set(cacheKey, objectUrl);
  }

  private playAudioUrl(url: string, playbackRate: number = 1.0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Audio === 'undefined') {
        reject(new Error('HTML5 Audio unavailable'));
        return;
      }
      const audio = new Audio(url);
      if (Math.abs(playbackRate - 1.0) > 0.01) {
        audio.playbackRate = Math.max(0.75, Math.min(1.25, playbackRate));
      }
      this.activeHtmlAudio = audio;
      audio.onended = () => {
        if (this.activeHtmlAudio === audio) this.activeHtmlAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (this.activeHtmlAudio === audio) this.activeHtmlAudio = null;
        reject(new Error('Audio playback failed'));
      };
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(reject);
      }
    });
  }

  private async speakDialogueWithNeuralProvider(
    turns: DialogueTurn[],
    rawText: string,
    accentCode: string,
    slow: boolean,
    generation: number,
    cfg: VoiceSettings
  ): Promise<{ ok: boolean; engine: string; note?: string }> {
    try {
      const playbackRate = this.resolvePlaybackRateForProvider(cfg, slow);
      const distinctSpeakerIndices = Array.from(new Set(turns.map((t) => t.speakerIndex)));

      // Google Gemini 2.5 TTS synthesizes an entire 2-speaker conversation in ONE call!
      if (cfg.provider === 'gemini' && distinctSpeakerIndices.length === 2) {
        const firstTurn0 = turns.find((t) => t.speakerIndex === distinctSpeakerIndices[0])!;
        const firstTurn1 = turns.find((t) => t.speakerIndex === distinctSpeakerIndices[1])!;
        const voice0 = pickNeuralVoiceForSpeaker(cfg, accentCode, firstTurn0.speaker, 0);
        const voice1 = pickNeuralVoiceForSpeaker(cfg, accentCode, firstTurn1.speaker, 1);

        const url = await this.fetchNeuralSegmentUrl(
          rawText,
          accentCode,
          slow,
          cfg,
          voice0,
          undefined,
          undefined,
          { turns, secondaryVoice: voice1 }
        );
        if (generation !== this.speakGeneration) {
          this.setActiveSpeaker(null);
          return { ok: true, engine: cfg.provider };
        }
        this.setActiveSpeaker(`${firstTurn0.speaker} & ${firstTurn1.speaker}`);
        await this.playAudioUrl(url, playbackRate);
        this.setActiveSpeaker(null);
        this.lastVoiceNotice = null;
        return { ok: true, engine: `gemini · Multi-Speaker Dialogue (${accentCode})` };
      }

      const urls = await Promise.all(
        turns.map((turn, idx) => {
          const voice = pickNeuralVoiceForSpeaker(cfg, accentCode, turn.speaker, turn.speakerIndex);
          const instructions =
            cfg.provider === 'openai'
              ? buildOpenAIDialogueInstructions(
                  accentCode,
                  cfg.speakingStyle,
                  turn.speaker,
                  turn.speakerIndex,
                  slow,
                  idx > 0 ? turns[idx - 1] : undefined
                )
              : undefined;
          const elevenContext =
            cfg.provider === 'elevenlabs'
              ? {
                  previousText: idx > 0 ? turns[idx - 1].text : undefined,
                  nextText: idx < turns.length - 1 ? turns[idx + 1].text : undefined,
                }
              : undefined;
          return this.fetchNeuralSegmentUrl(
            turn.text,
            accentCode,
            slow,
            cfg,
            voice,
            instructions,
            elevenContext
          );
        })
      );

      for (let i = 0; i < turns.length; i++) {
        if (generation !== this.speakGeneration) {
          this.setActiveSpeaker(null);
          return { ok: true, engine: cfg.provider };
        }
        this.setActiveSpeaker(turns[i].speaker);
        await this.playAudioUrl(urls[i], playbackRate);
        if (i < turns.length - 1 && generation === this.speakGeneration) {
          const pauseMs = naturalTurnPauseMs(turns[i].text, turns[i + 1].text, slow);
          await new Promise((r) => setTimeout(r, pauseMs));
        }
      }
      this.setActiveSpeaker(null);
      this.lastVoiceNotice = null;
      return { ok: true, engine: `${cfg.provider} · Multi-Speaker Dialogue (${accentCode})` };
    } catch (err) {
      this.setActiveSpeaker(null);
      if (generation !== this.speakGeneration) {
        return { ok: false, engine: 'cancelled' };
      }
      const message = err instanceof Error ? err.message : 'Network error';
      this.lastVoiceNotice = `Neural dialogue unavailable (${message}) — played using upgraded on-device voices.`;
      this.notifyListeners();
      this.speakWithSystemVoice(rawText, accentCode, slow, cfg);
      return { ok: false, engine: 'system-fallback', note: this.lastVoiceNotice };
    }
  }

  private async speakSingleNeuralSegment(
    text: string,
    accentCode: string,
    slow: boolean,
    generation: number,
    cfg: VoiceSettings
  ): Promise<{ ok: boolean; engine: string; note?: string }> {
    try {
      const url = await this.fetchNeuralSegmentUrl(text, accentCode, slow, cfg);
      if (generation !== this.speakGeneration) {
        return { ok: true, engine: cfg.provider };
      }
      this.lastVoiceNotice = null;
      await this.playAudioUrl(url, this.resolvePlaybackRateForProvider(cfg, slow));
      return { ok: true, engine: `${cfg.provider} · ${cfg.neuralVoice} (${accentCode})` };
    } catch (err) {
      if (generation !== this.speakGeneration) {
        return { ok: false, engine: 'cancelled' };
      }
      const message = err instanceof Error ? err.message : 'Network error';
      this.lastVoiceNotice = `Neural voice unavailable (${message}) — played using upgraded on-device voice.`;
      this.notifyListeners();
      this.speakWithSystemVoice(text, accentCode, slow, cfg);
      return {
        ok: false,
        engine: 'system-fallback',
        note: this.lastVoiceNotice,
      };
    }
  }

  private speakWithSystemVoice(
    text: string,
    targetBcp47: string,
    slow: boolean,
    cfg: VoiceSettings = this.settings
  ): SpeechSynthesisVoice | undefined {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return undefined;
    }

    try {
      window.speechSynthesis.cancel();

      const liveVoices = window.speechSynthesis.getVoices();
      const voices = liveVoices && liveVoices.length > 0 ? liveVoices : this.cachedVoices;
      if (liveVoices && liveVoices.length > 0) {
        this.cachedVoices = liveVoices;
      }

      const preferredURI = cfg.preferredSystemVoices[targetBcp47];
      const chosenVoice = pickBestSystemVoice(voices, targetBcp47, preferredURI);
      const baseRate = slow ? 0.78 : 0.96;

      // Multi-speaker conversational dialogue mode: strip speaker labels & assign distinct voices/tones!
      const turns = parseDialogueTurns(text);
      if (turns.length > 0) {
        const targetBase = targetBcp47.replace('_', '-').toLowerCase().slice(0, 2);
        const rankedVoices = voices
          .filter((v) => !isRoboticOrNoveltyVoice(v) && (v.lang || '').replace('_', '-').toLowerCase().startsWith(targetBase))
          .sort((a, b) => scoreSystemVoice(b, targetBcp47) - scoreSystemVoice(a, targetBcp47));
        const hqPool = rankedVoices.filter((v) => classifyVoiceQuality(v) !== 'standard');
        const castPool = hqPool.length >= 2 ? hqPool : rankedVoices.slice(0, 2);

        const voiceBySpeaker = new Map<number, SpeechSynthesisVoice | undefined>();
        turns.forEach((t) => {
          if (!voiceBySpeaker.has(t.speakerIndex)) {
            const candidate = castPool[t.speakerIndex % Math.max(1, castPool.length)] || chosenVoice;
            voiceBySpeaker.set(t.speakerIndex, candidate);
          }
        });

        const hasDistinctVoices =
          new Set(Array.from(voiceBySpeaker.values()).map((v) => v?.voiceURI || v?.name).filter(Boolean)).size >= 2;
        const generation = this.speakGeneration;

        turns.forEach((turn, idx) => {
          const spVoice = voiceBySpeaker.get(turn.speakerIndex) || chosenVoice;
          const isNeuralVoice = spVoice ? classifyVoiceQuality(spVoice) === 'neural' : false;
          const gender = inferSpeakerGender(turn.speaker);
          const isLower = gender === 'male' || (gender === 'unknown' && turn.speakerIndex % 2 === 1);
          const paceFactor = hasDistinctVoices
            ? (turn.speakerIndex % 2 === 0 ? 1.0 : 0.98)
            : isLower
            ? 0.97
            : 1.01;
          // Never pitch-shift neural voices — preserve natural vocoder timbre and differentiate via cadence
          const pitch = hasDistinctVoices || isNeuralVoice ? 1.0 : isLower ? 0.97 : 1.02;

          const utterance = new SpeechSynthesisUtterance(turn.text);
          utterance.rate = Math.max(0.65, Math.min(1.28, baseRate * (cfg.rateMultiplier || 1.0) * paceFactor));
          utterance.pitch = pitch;
          utterance.lang = spVoice?.lang || targetBcp47;
          if (spVoice) utterance.voice = spVoice;
          utterance.onstart = () => {
            if (generation === this.speakGeneration) this.setActiveSpeaker(turn.speaker);
          };
          if (idx === turns.length - 1) {
            utterance.onend = () => {
              if (generation === this.speakGeneration) this.setActiveSpeaker(null);
            };
          }
          window.speechSynthesis.speak(utterance);
        });
        return chosenVoice;
      }

      const finalRate = Math.max(0.6, Math.min(1.3, baseRate * (cfg.rateMultiplier || 1.0)));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = finalRate;
      utterance.pitch = 1.0;
      utterance.lang = chosenVoice?.lang || targetBcp47;

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      window.speechSynthesis.speak(utterance);
      return chosenVoice;
    } catch {
      return undefined;
    }
  }

  public stopSpeech(): void {
    this.speakGeneration += 1;
    this.setActiveSpeaker(null);
    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.activeHtmlAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }
}

export const soundEngine = new SoundEngine();
