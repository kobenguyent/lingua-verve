import { Language } from '../types';

export const LANGUAGES: Language[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    tagline: 'The Global Lingua Franca',
    description: 'Master non-phonetic spelling, rhythmic stress timing, nuanced phrasal verbs, and effortless conversational cadence.',
    family: 'West Germanic (heavy Anglo-Norman French and Latin influences)',
    estimatedHoursToC1: 750,
    difficultyRating: 'Universal Baseline',
    keyTraps: [
      'Irregular spelling vs. pronunciation (cough, though, through, rough)',
      'Phrasal verbs with hundreds of unpredictable contextual meanings',
      'Stress-timed rhythm and reduced vowels (the ubiquitous Schwa /ə/)',
      'Subtle prepositions (in time vs. on time, at school vs. in school)'
    ],
    soundFeatures: ['Schwa /ə/', 'Voiced/Voiceless TH (/θ/, /ð/)', 'Glottal stops', 'Connected speech reductions'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'London, United Kingdom'
  },
  {
    id: 'german',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    tagline: 'The Precision Engine of Europe',
    description: 'Crack noun genders, the 4-case system, separable verbs, verb-final subordinate clauses, and expressive modal particles.',
    family: 'West Germanic',
    estimatedHoursToC1: 900,
    difficultyRating: 'Category II (Challenging structure, logical rules)',
    keyTraps: [
      'Three grammatical genders (der, die, das) and four cases (Nom, Akk, Dat, Gen)',
      'Verb-at-the-end in subordinate clauses (weil, dass, obwohl)',
      'Separable prefixes flying to the end of the sentence (aufstehen -> steht auf)',
      'False friends with English (Gift = poison, Not = distress, Wer = who)'
    ],
    soundFeatures: ['Umlauts (ä, ö, ü)', 'Ich-Laut [ç] vs. Ach-Laut [x]', 'Glottal stop (Knacklaut)', 'Final consonant devoicing'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Berlin, Germany'
  },
  {
    id: 'meta',
    name: 'Polyglot Meta-System',
    nativeName: 'Universal Tactics',
    flag: '🧠',
    tagline: 'Neuroscience-Backed Polyglot Strategies',
    description: 'The universal meta-learning principles used by polyglots to decode any language in record time without burning out.',
    family: 'Cognitive Science & Linguistics',
    estimatedHoursToC1: 0,
    difficultyRating: 'Meta Skill',
    keyTraps: [
      'The "App Trap" (swiping endlessly without productive production)',
      'Passive listening disguised as true study',
      'Premature grammar drilling before core frequency vocabulary',
      'The B2 Intermediate Plateau'
    ],
    soundFeatures: ['Phoneme mimicry', 'Shadowing technique', 'IPA baseline mapping', 'Auditory discrimination'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Cognitive Polyglot Library'
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    tagline: 'The Expressive Romance Tongue',
    description: 'Subjunctive mood mastery, rolled R phonetics, rapid syllable-timed cadence, and regional colloquialisms.',
    family: 'Romance / Ibero-Romance',
    estimatedHoursToC1: 600,
    difficultyRating: 'Category I (High phonetic regularity)',
    keyTraps: ['Por vs. Para distinction', 'Subjunctive mood triggers', 'Ser vs. Estar', 'Rapid syllable-timed rhythm'],
    soundFeatures: ['Rolled trill /r/', 'Soft fricative /d/, /b/, /g/', 'Pure five-vowel system'],
    status: 'preview',
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Madrid, Spain'
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    tagline: 'The Fluid Melody of Flow',
    description: 'Nasal vowels, liaison connections, subtle gender cues, and high-frequency colloquial verlan.',
    family: 'Romance / Gallo-Romance',
    estimatedHoursToC1: 650,
    difficultyRating: 'Category I (Spelling requires decoding)',
    keyTraps: ['Liaison and enchaînement in speech', 'Nasal vowels (an, on, in, un)', 'Silent final consonants', 'Subjunctive nuances'],
    soundFeatures: ['Uvular R [ʁ]', 'Nasalized vowels', 'Liaison flow', 'Front rounded vowels'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Paris, France'
  },
  {
    id: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    tagline: 'The Contextual Architecture',
    description: 'Three writing systems, pitch accent, SOV sentence order, topic-comment markers, and layered honorific speech.',
    family: 'Japonic',
    estimatedHoursToC1: 2200,
    difficultyRating: 'Category IV (High character commitment)',
    keyTraps: ['Kanji readings (On/Kun)', 'Topic vs. Subject (wa vs. ga)', 'High-context ellipsis', 'Keigo (Honorifics)'],
    soundFeatures: ['Pitch accent', 'Mora timing', 'Devoiced vowels /u/ and /i/', 'Syllabic nasal /n/'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Kyoto, Japan'
  }
];

export const LEARNING_LANGUAGE_IDS = ['english', 'german', 'french', 'japanese'] as const;
export type LearningLanguageId = (typeof LEARNING_LANGUAGE_IDS)[number];

export interface LearningLanguageMeta {
  id: LearningLanguageId;
  name: string;
  nativeName: string;
  shortCode: 'EN' | 'DE' | 'FR' | 'JA';
  flag: string;
  examBoard: string;
  defaultAccentCode: string;
  readingFormatSummary: string;
  topicPlaceholder: string;
  connectors: string[];
  connectorHint: string;
  usesCJKCharacters: boolean;
}

export const LEARNING_LANGUAGE_META: Record<LearningLanguageId, LearningLanguageMeta> = {
  english: {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    shortCode: 'EN',
    flag: '🇬🇧',
    examBoard: 'Cambridge English, IELTS, and TOEFL iBT',
    defaultAccentCode: 'en-GB',
    readingFormatSummary: 'TFNG + Use of English',
    topicPlaceholder: 'e.g. Urban Cycling & Green Cities, AI in Healthcare, Remote Work...',
    connectors: ['because', 'although', 'however', 'moreover', 'furthermore', 'therefore', 'nevertheless', 'whereas', 'consequently'],
    connectorHint: 'Add discourse connectors (however, although, furthermore, consequently) to boost coherence.',
    usesCJKCharacters: false,
  },
  german: {
    id: 'german',
    name: 'German',
    nativeName: 'Deutsch',
    shortCode: 'DE',
    flag: '🇩🇪',
    examBoard: 'Goethe-Zertifikat, telc, and TestDaF',
    defaultAccentCode: 'de-DE',
    readingFormatSummary: 'Richtig/Falsch + Sprachbausteine',
    topicPlaceholder: 'e.g. Nachhaltige Mobilität, Homeoffice in Deutschland, Künstliche Intelligenz...',
    connectors: ['weil', 'obwohl', 'deshalb', 'außerdem', 'jedoch', 'allerdings', 'einerseits', 'andererseits', 'dennoch', 'angesichts'],
    connectorHint: 'Add subordinating connectors (weil, obwohl, außerdem, deshalb) to raise coherence.',
    usesCJKCharacters: false,
  },
  french: {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    shortCode: 'FR',
    flag: '🇫🇷',
    examBoard: 'DELF, DALF, and TCF',
    defaultAccentCode: 'fr-FR',
    readingFormatSummary: 'Vrai/Faux + Texte à trous',
    topicPlaceholder: 'e.g. Mobilité durable en ville, Télétravail en France, Gastronomie & écologie...',
    connectors: ['parce que', 'cependant', 'pourtant', 'donc', 'en outre', 'néanmoins', 'bien que', 'afin de', 'en revanche', 'tandis que'],
    connectorHint: 'Add French discourse connectors (cependant, néanmoins, bien que, en revanche) to elevate coherence.',
    usesCJKCharacters: false,
  },
  japanese: {
    id: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    shortCode: 'JA',
    flag: '🇯🇵',
    examBoard: 'JLPT (N5–N1), JF Standard, and BJT',
    defaultAccentCode: 'ja-JP',
    readingFormatSummary: '正誤判定 + 文法穴埋め',
    topicPlaceholder: 'e.g. 日本の公共交通と旅行, リモートワークと働き方, 食文化と健康...',
    connectors: ['から', 'ので', 'しかし', 'けれど', 'また', 'さらに', 'そのため', '一方で', 'なぜなら', 'したがって', 'つまり'],
    connectorHint: 'Add Japanese connectors (しかし, そのため, 一方で, さらに, なぜなら) to strengthen discourse flow.',
    usesCJKCharacters: true,
  },
};

export function normalizeLearningLanguageId(languageId?: string): LearningLanguageId {
  const lower = (languageId || '').toLowerCase().trim();
  if (lower === 'german' || lower === 'de' || lower.startsWith('de-')) return 'german';
  if (lower === 'french' || lower === 'fr' || lower.startsWith('fr-')) return 'french';
  if (lower === 'japanese' || lower === 'ja' || lower.startsWith('ja-')) return 'japanese';
  return 'english';
}

export function getLearningLanguageMeta(languageId?: string): LearningLanguageMeta {
  return LEARNING_LANGUAGE_META[normalizeLearningLanguageId(languageId)];
}

export function getDefaultCertificateForLevel(languageId: string, level: string): string {
  const id = normalizeLearningLanguageId(languageId);
  if (id === 'german') return `Goethe-Zertifikat ${level}`;
  if (id === 'french') {
    return level === 'C1' || level === 'C2' ? `DALF ${level}` : `DELF ${level}`;
  }
  if (id === 'japanese') {
    const jlptMap: Record<string, string> = {
      A1: 'JLPT N5 (CEFR A1)',
      A2: 'JLPT N4 (CEFR A2)',
      B1: 'JLPT N3 (CEFR B1)',
      B2: 'JLPT N2 (CEFR B2)',
      C1: 'JLPT N1 (CEFR C1)',
      C2: 'JLPT N1+ Mastery (CEFR C2)',
    };
    return jlptMap[level] || `JLPT (${level})`;
  }
  return `Cambridge English ${level}`;
}

/**
 * Counts effective word-equivalents across both space-delimited languages (EN/DE/FR)
 * and character-based Japanese (CJK/Kana, where ~2.2 non-space characters ≈ 1 word).
 */
export function countLanguageUnits(text: string, languageId?: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  const whitespaceWords = cleaned.split(/\s+/).filter(Boolean).length;
  const hasJapaneseScript = /[\u3040-\u30ff\u3400-\u9fff]/.test(cleaned);
  if (languageId === 'japanese' || hasJapaneseScript) {
    const nonSpaceChars = cleaned.replace(/[\s。、！？「」『』（）・.,!?()[\]'"-]/g, '').length;
    return Math.max(whitespaceWords, Math.ceil(nonSpaceChars / 2.2));
  }
  return whitespaceWords;
}

export function getLanguage(id: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.id === id);
}

export function getActiveLanguages(): Language[] {
  return LANGUAGES.filter((lang) => lang.status === 'active');
}
