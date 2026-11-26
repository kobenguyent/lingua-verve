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

export const LOCAL_NEURAL_VOICES: NeuralVoicePreset[] = [
  { id: 'bf_emma', label: 'Kokoro Emma (British F)', note: 'Natural British neural voice (Kokoro-FastAPI)' },
  { id: 'bm_george', label: 'Kokoro George (British M)', note: 'Natural British male neural voice' },
  { id: 'af_heart', label: 'Kokoro Heart (American F)', note: 'Top-rated warm US neural voice' },
  { id: 'am_michael', label: 'Kokoro Michael (American M)', note: 'Natural US male neural voice' },
  { id: 'af_bella', label: 'Kokoro Bella (American F)', note: 'Expressive conversational US voice' },
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
  openai: {
    label: 'OpenAI Human TTS (gpt-4o-mini-tts)',
    mode: 'cloud',
    defaultEndpoint: 'https://api.openai.com/v1/audio/speech',
    defaultModel: 'gpt-4o-mini-tts',
    defaultVoice: 'coral',
    suggestedModels: ['gpt-4o-mini-tts', 'tts-1-hd', 'tts-1'],
    requiresApiKey: true,
    setupHint:
      'Uses gpt-4o-mini-tts with real accent coaching instructions so UK, US, Australian, Irish, Indian, Austrian & Swiss accents sound genuinely human.',
  },
  elevenlabs: {
    label: 'ElevenLabs Ultra-Human Voices',
    mode: 'cloud',
    defaultEndpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    defaultModel: 'eleven_multilingual_v2',
    defaultVoice: 'JBFqnCBsd6RMkjVDRZzb',
    suggestedModels: ['eleven_multilingual_v2', 'eleven_flash_v2_5'],
    requiresApiKey: true,
    setupHint:
      'Industry-leading lifelike multilingual human voices for English & German with natural breathing and expressive prosody.',
  },
  'local-openai': {
    label: 'Local Neural TTS (Kokoro / Speaches)',
    mode: 'local',
    defaultEndpoint: 'http://localhost:8880/v1/audio/speech',
    defaultModel: 'kokoro',
    defaultVoice: 'bf_emma',
    suggestedModels: ['kokoro', 'tts-1'],
    requiresApiKey: false,
    setupHint:
      '100% private local neural voices via Kokoro-FastAPI (port 8880) or Speaches/OpenedAI-Speech (port 8000). No cloud key needed.',
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
];

export function normalizeLanguageKey(languageId: string): string {
  const lower = (languageId || 'english').toLowerCase();
  if (lower === 'german' || lower === 'de' || lower.startsWith('de-')) return 'german';
  if (lower === 'spanish' || lower === 'es' || lower.startsWith('es-')) return 'spanish';
  if (lower === 'french' || lower === 'fr' || lower.startsWith('fr-')) return 'french';
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
    },
    preferredSystemVoices: {},
    rateMultiplier: 1.0,
    speakingStyle: 'natural',
    endpoint: VOICE_PROVIDER_PRESETS.openai.defaultEndpoint,
    apiKey: '',
    model: VOICE_PROVIDER_PRESETS.openai.defaultModel,
    neuralVoice: VOICE_PROVIDER_PRESETS.openai.defaultVoice,
    reuseOpenAIKey: true,
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

function readSharedOpenAIKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { provider?: string; apiKey?: string };
    if (parsed.provider === 'openai' && parsed.apiKey) {
      return parsed.apiKey.trim();
    }
    return '';
  } catch {
    return '';
  }
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
  'priya', 'chloe', 'rachel', 'amira', 'moderatorin', 'kritikerin', 'ärztin', 'verkäuferin',
  'rezeptionistin', 'studentin', 'autorin', 'professorin', 'novak', 'berger', 'keller', 'meier',
]);

const MALE_SPEAKER_HINTS = new Set([
  'herr', 'lukas', 'markus', 'viktor', 'martin', 'yannick', 'tobias', 'jonas', 'max',
  'paul', 'david', 'tom', 'ben', 'liam', 'leo', 'daniel', 'oliver', 'james', 'noah',
  'stefan', 'felix', 'alex', 'moderator', 'interviewer', 'schaffner', 'arzt', 'verkäufer',
  'kellner', 'becker', 'steiner', 'lindner', 'gruber', 'weber', 'vance', 'tutor', 'host', 'guest',
]);

/**
 * Parses multi-speaker dialogue scripts (both newline-separated and inline `Name: ...` turns).
 * Returns [] if the text is a single-speaker monologue (< 2 distinct speakers).
 */
export function parseDialogueTurns(text: string): DialogueTurn[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const regex = /(?:^|\n|(?<=[.!?—–]\s))([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\- ]{0,22}):\s+/g;
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
  const primary = cfg.neuralVoice || (cfg.provider === 'openai' ? 'coral' : cfg.provider === 'elevenlabs' ? ELEVENLABS_NEURAL_VOICES[0].id : 'bf_emma');

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
    if (isGerman) {
      const male = 'de_DE-thorsten-high';
      const female = 'de_DE-eva_k-x_low';
      if (speakerIndex === 0) return gender === 'female' ? female : gender === 'male' ? male : primary;
      return primary === male ? female : male;
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
    return 'en-GB';
  }

  public getEffectiveApiKey(settings: VoiceSettings = this.settings): string {
    if (settings.apiKey.trim()) return settings.apiKey.trim();
    if (settings.provider === 'openai' && settings.reuseOpenAIKey) {
      return readSharedOpenAIKey();
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

  private async fetchNeuralSegmentUrl(
    text: string,
    accentCode: string,
    slow: boolean,
    cfg: VoiceSettings,
    voiceOverride?: string,
    instructionsOverride?: string
  ): Promise<string> {
    const effectiveVoice =
      voiceOverride || cfg.neuralVoice || (cfg.provider === 'openai' ? 'coral' : cfg.provider === 'elevenlabs' ? ELEVENLABS_NEURAL_VOICES[0].id : 'bf_emma');
    const cacheKey = `${cfg.provider}|${cfg.model}|${effectiveVoice}|${accentCode}|${cfg.speakingStyle}|${cfg.rateMultiplier}|${slow ? '1' : '0'}|${instructionsOverride || ''}|${text}`;
    const cachedUrl = this.neuralAudioCache.get(cacheKey);
    if (cachedUrl) return cachedUrl;

    const apiKey = this.getEffectiveApiKey(cfg);
    const speed = Math.max(0.65, Math.min(1.3, (slow ? 0.8 : 0.98) * (cfg.rateMultiplier || 1.0)));

    let response: Response;
    if (cfg.provider === 'elevenlabs') {
      const base = cfg.endpoint.replace(/\/+$/, '');
      const voiceId = encodeURIComponent(effectiveVoice);
      const url = base.includes('/text-to-speech/') ? base : `${base}/${voiceId}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: cfg.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.78,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      });
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
      response = await fetch(cfg.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    if (this.neuralAudioCache.size >= 40) {
      const oldestKey = this.neuralAudioCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = this.neuralAudioCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        this.neuralAudioCache.delete(oldestKey);
      }
    }
    this.neuralAudioCache.set(cacheKey, objectUrl);
    return objectUrl;
  }

  private playAudioUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Audio === 'undefined') {
        reject(new Error('HTML5 Audio unavailable'));
        return;
      }
      const audio = new Audio(url);
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
      const accentCue =
        getAccentOption(accentCode)?.neuralHint ?? `Speak in natural, idiomatic ${accentCode}.`;
      const urls = await Promise.all(
        turns.map((turn) => {
          const voice = pickNeuralVoiceForSpeaker(cfg, accentCode, turn.speaker, turn.speakerIndex);
          const instructions = `${accentCue} You are ${turn.speaker} speaking spontaneously in a natural live two-person conversation. Never sound like you are reading a script.`;
          return this.fetchNeuralSegmentUrl(turn.text, accentCode, slow, cfg, voice, instructions);
        })
      );

      for (let i = 0; i < turns.length; i++) {
        if (generation !== this.speakGeneration) {
          this.setActiveSpeaker(null);
          return { ok: true, engine: cfg.provider };
        }
        this.setActiveSpeaker(turns[i].speaker);
        await this.playAudioUrl(urls[i]);
        if (i < turns.length - 1 && generation === this.speakGeneration) {
          await new Promise((r) => setTimeout(r, 220));
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
      await this.playAudioUrl(url);
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
          const gender = inferSpeakerGender(turn.speaker);
          const isLower = gender === 'male' || (gender === 'unknown' && turn.speakerIndex % 2 === 1);
          const paceFactor = hasDistinctVoices ? (turn.speakerIndex % 2 === 0 ? 1.0 : 0.97) : isLower ? 0.95 : 1.02;
          const pitch = hasDistinctVoices ? 1.0 : isLower ? 0.92 : 1.05;

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
