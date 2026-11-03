import { TipItem } from '../../types';

export const META_TIPS: TipItem[] = [
  {
    id: 'meta-shadowing',
    title: 'The Shadowing Technique: Muscle Memory for Fluency',
    languageId: 'meta',
    level: 'ALL',
    category: 'pronunciation',
    summary: 'Pioneered by linguist Prof. Alexander Arguelles, shadowing trains your vocal tract and ear simultaneously by repeating audio a split-second behind a native speaker.',
    goldenRule: 'Do not wait for a sentence to finish before speaking. Echo the native voice 200–500 milliseconds behind, mimicking pitch, rhythm, and tone.',
    tactics: [
      'Select a short, high-quality audio clip (1–2 minutes) with an exact verbatim transcript.',
      'Phase 1: Blind Shadowing — Walk at a brisk pace with headphones on and speak along without reading.',
      'Phase 2: Transcript Shadowing — Read the text while shadowing to bridge auditory and orthographic connections.',
      'Do this for just 15 minutes daily. It rapidly eliminates foreign cadence and builds articulatory stamina.'
    ],
    commonPitfall: 'Sitting statically at a desk murmuring under your breath. Shadowing works best standing upright, projecting your voice with energy.',
    timeCommitment: '15 mins daily routine',
    tags: ['polyglot-tactics', 'shadowing', 'pronunciation', 'accent-reduction']
  },
  {
    id: 'meta-island-method',
    title: 'The Conversational Island Method',
    languageId: 'meta',
    level: 'A2',
    category: 'speaking',
    summary: 'Native speakers do not improvise every single sentence from scratch; they navigate familiar conversational "islands" they have rehearsed dozens of times.',
    goldenRule: 'Prepare 5 to 7 modular 90-second conversational scripts about your life, career, hobbies, and origin story before your first real conversation.',
    tactics: [
      'Island 1: Your profession, why you chose it, and an interesting daily challenge.',
      'Island 2: Why you are learning this language and what your connection to the culture is.',
      'Island 3: Your favorite trip, funny travel mishap, or hometown recommendation.',
      'Have a native tutor or AI check these scripts for natural idiomatic phrasing, then memorize the transitions ("Bridges").'
    ],
    examples: [
      { source: 'Speaking bridge', explanation: '"Speaking of which, that actually reminds me of an experience I had last year..." (Seamlessly links back to an island).' }
    ],
    commonPitfall: 'Freezing on italki or Tandem calls because you are trying to assemble novel grammar under pressure.',
    timeCommitment: '1 hour scripting + 20 mins rehearsal',
    tags: ['speaking', 'island-method', 'confidence', 'conversations']
  },
  {
    id: 'meta-comprehensible-input',
    title: 'Krashen’s "i + 1" Principle & The 85% Comprehension Sweet Spot',
    languageId: 'meta',
    level: 'B1',
    category: 'immersion',
    summary: 'Linguist Stephen Krashen proved language is acquired through comprehensible input (input that is just one notch above your current understanding).',
    goldenRule: 'If you understand less than 70%, it is cognitive noise. If you understand 100%, you are not growing. Aim for 80–90% effortless comprehension.',
    tactics: [
      'At A1–A2: Use graded readers and beginner podcast dialogues with transcripts.',
      'At B1: Move to learner podcasts (Easy German, Coffee Break, BBC Learning).',
      'At B2: Jump to native YouTubers who speak about your favorite hobbies (gaming, cooking, tech, science).',
      'The "Two-Pass Rule": Watch once for gist, watch a second time to capture 3–5 high-yield unknown phrases.'
    ],
    commonPitfall: 'Forcing yourself to read classic 19th-century literature at B1 and giving up in frustration.',
    timeCommitment: '30–45 mins daily comprehensible immersion',
    tags: ['krashen', 'comprehensible-input', 'immersion', 'polyglot-theory']
  },
  {
    id: 'meta-anki-srs',
    title: 'The 3 Iron Rules of Spaced Repetition (Anki Done Right)',
    languageId: 'meta',
    level: 'ALL',
    category: 'vocabulary',
    summary: 'Most learners quit Anki because their decks become bloated digital flashcard graveyards. Optimize your SRS with cognitive economy.',
    goldenRule: 'Card Rule #1: Minimum Information Principle. One card = one discrete, atomic fact.',
    tactics: [
      'Never create 2-sided vocabulary lists with bare word translations (e.g., Hund = Dog).',
      'Use Cloze Deletion with authentic context sentences (e.g., "Ich gehe jeden Morgen mit meinem [...] spazieren.").',
      'Add audio clips to every card (using tools like Forvo or AwesomeTTS) so auditory memory reinforces visual memory.',
      'Delete or suspend cards that fail more than 4 times—they are poorly formulated "leech" cards.'
    ],
    commonPitfall: 'Spending 80% of your time creating cards and only 20% reviewing them. Invert the ratio.',
    timeCommitment: '10–15 mins daily morning streak',
    tags: ['anki', 'srs', 'memory', 'spaced-repetition']
  },
  {
    id: 'meta-intermediate-plateau',
    title: 'Smashing the Notorious B2 Plateau',
    languageId: 'meta',
    level: 'B2',
    category: 'mindset',
    summary: 'The B2 plateau is the most common death zone in language learning. You can communicate, so the urgency is gone, yet native content still tires you.',
    goldenRule: 'Stop "studying" the language. Switch your entire digital life (phone OS, Wikipedia searches, entertainment) into the target language.',
    tactics: [
      'Change your phone and computer system language today.',
      'Stop searching Google in your native language for technical questions, recipes, or reviews.',
      'Engage in active production: Write a 200-word daily journal or Reddit comment in the target language.',
      'Schedule weekly 1-on-1 debate sessions with native tutors on controversial, philosophical, or professional topics.'
    ],
    commonPitfall: 'Staying in the comfortable bubble of learner podcasts and graded materials for years.',
    timeCommitment: 'Total environmental integration',
    tags: ['b2-plateau', 'mindset', 'habits', 'mastery']
  }
];
