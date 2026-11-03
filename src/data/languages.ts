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
    status: 'preview',
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
    status: 'preview',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Kyoto, Japan'
  }
];

export function getLanguage(id: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.id === id);
}

export function getActiveLanguages(): Language[] {
  return LANGUAGES.filter((lang) => lang.status === 'active');
}
