import { TipItem } from '../../types';

export const ENGLISH_TIPS: TipItem[] = [
  // --- A1 LEVEL ---
  {
    id: 'eng-a1-schwa',
    title: 'Unlock the Secret English Sound: The Schwa (/ə/)',
    languageId: 'english',
    level: 'A1',
    category: 'pronunciation',
    diagramType: 'mouth-phonetics',
    summary: 'English is stress-timed, not syllable-timed. Over 60% of unstressed vowels in English collapse into the lazy "uh" sound known as the Schwa.',
    goldenRule: 'Never pronounce every vowel clearly. Stressed syllables are loud and clear; unstressed syllables become the lazy Schwa /ə/.',
    tactics: [
      'Find the stressed vowel in a multi-syllable word first (e.g., in "ba-NA-na", the middle "na" is stressed).',
      'Turn the remaining unstressed vowels into a neutral, relaxed sigh: /bə-ˈnɑː-nə/.',
      'Practice function words in sentences: "to" becomes /tə/, "for" becomes /fə/, "and" becomes /ənd/ or /ən/.'
    ],
    examples: [
      { source: 'Photograph vs. Photographer', explanation: 'PHO-to-graph (/ˈfəʊ.tə.ɡrɑːf/) vs. pho-TO-gra-pher (/fəˈtɒɡ.rə.fər/). Stress changes where the schwa lands!' },
      { source: 'A cup of tea', explanation: 'Pronounced "A cuppa tea" (/ə kʌp əv tiː/).' }
    ],
    commonPitfall: 'Pronouncing every written letter with equal robotic emphasis, which native ears find confusing.',
    timeCommitment: '10 mins daily ear-training',
    tags: ['pronunciation', 'schwa', 'stress-timed', 'phonetics'],
    recommendedTools: [
      { name: 'YouGlish (English)', category: 'tool', url: 'https://youglish.com/english', note: 'Search any word to hear real native speakers pronounce it in context.' }
    ]
  },
  {
    id: 'eng-a1-300-words',
    title: 'The Pareto 300 Core Frequency Foundation',
    languageId: 'english',
    level: 'A1',
    category: 'vocabulary',
    summary: 'The top 300 most frequent English words account for approximately 65% of all daily written and spoken communication.',
    goldenRule: 'Do not memorize random word lists. Prioritize verbs of existence, motion, and desire (be, have, do, go, want, need) plus core function words.',
    tactics: [
      'Download or create an Anki flashcard deck with the top 300 English lemma words.',
      'Always learn words with full mini-sentences, never isolated dictionary definitions.',
      'Focus on "Island Sentences" you can use immediately: "I want to...", "Where is the...", "Do you have...".'
    ],
    examples: [
      { source: 'I need to go', explanation: 'Combines 3 of the top 50 words into an actionable survival sentence.' },
      { source: 'What do you think?', explanation: 'High-frequency question starter.' }
    ],
    commonPitfall: 'Wasting weeks learning rare animal names or exotic kitchen utensils before mastering core verbs.',
    timeCommitment: '15 mins/day with Anki SRS',
    tags: ['vocabulary', 'frequency-list', 'anki', 'foundations']
  },
  {
    id: 'eng-a1-th-sound',
    title: 'The Tamed "TH" Sound: Voiced vs. Voiceless',
    languageId: 'english',
    level: 'A1',
    category: 'pronunciation',
    summary: 'Most languages lack the dental fricatives /θ/ (think) and /ð/ (this). Learners mistakenly substitute S, Z, T, or D.',
    goldenRule: 'Lightly place the tip of your tongue between your upper and lower teeth; do not bite down. Blow air for /θ/, vibrate vocal cords for /ð/.',
    tactics: [
      'Voiceless /θ/: "Thanks", "Three", "Think", "Bath" (no throat vibration, just breath).',
      'Voiced /ð/: "This", "That", "The", "Brother" (throat vocal cords hum).',
      'Practice the tongue poke in front of a mirror until muscle memory takes over.'
    ],
    commonPitfall: 'Saying "sink" or "tink" instead of "think", or "dis" instead of "this".',
    timeCommitment: '5 mins in front of mirror',
    tags: ['pronunciation', 'th-sound', 'phonetics']
  },

  // --- A2 LEVEL ---
  {
    id: 'eng-a2-irregular-verbs',
    title: 'Cluster Irregular Verbs by Rhyme & Rhythm',
    languageId: 'english',
    level: 'A2',
    category: 'grammar',
    summary: 'English has around 180 irregular verbs, but they do not need to be memorized alphabetically. Group them by their vowel morphing families.',
    goldenRule: 'Stop studying alphabetical tables (A to Z). Group verbs by sonic pattern families.',
    tactics: [
      'The "i-a-u" Family: sing/sang/sung, ring/rang/rung, swim/swam/swum, drink/drank/drunk.',
      'The "-ought / -aught" Family: buy/bought/bought, bring/brought/brought, think/thought/thought, catch/caught/caught.',
      'The "No Change" Family: cost/cost/cost, cut/cut/cut, hit/hit/hit, put/put/put.',
      'The "-ew / -own" Family: blow/blew/blown, know/knew/known, throw/threw/thrown.'
    ],
    examples: [
      { source: 'I drink -> I drank -> I have drunk', explanation: 'Follows the exact rhythm of sing -> sang -> sung.' }
    ],
    commonPitfall: 'Trying to memorize "abide, arise, awake" because they begin with the letter A.',
    timeCommitment: '15 mins spaced repetition per family',
    tags: ['grammar', 'irregular-verbs', 'patterns']
  },
  {
    id: 'eng-a2-preposition-matrix',
    title: 'The Spatial Matrix for "IN, ON, AT"',
    languageId: 'english',
    level: 'A2',
    category: 'grammar',
    diagramType: 'preposition-pyramid',
    summary: 'Mastering IN, ON, and AT for both Time and Space using a simple inverted pyramid rule.',
    goldenRule: 'Think from General to Specific: IN is broad/enclosed, ON is a surface/street/day, AT is a precise point or exact time.',
    tactics: [
      'TIME: IN the 21st century / in July / in 2026 (broad) -> ON Monday / on my birthday (specific day) -> AT 7:30 PM / at noon (exact point).',
      'SPACE: IN France / in the room (enclosed/large) -> ON the table / on Oxford Street (surface/line) -> AT the bus stop / at the corner (specific point).',
      'Transportation exception: "ON the bus / train / plane" (you can walk on it) vs. "IN the car / taxi" (you sit enclosed).'
    ],
    examples: [
      { source: 'At 5 PM on Friday in December', explanation: 'Specific time (at) -> Day (on) -> Month (in).' },
      { source: 'On the plane vs. in the car', explanation: 'Public transit with floor space = on; small private vehicle = in.' }
    ],
    commonPitfall: 'Saying "at the morning" instead of "in the morning", or "in the bus" instead of "on the bus".',
    timeCommitment: '10 mins chart review',
    tags: ['grammar', 'prepositions', 'spatial-mental-model']
  },

  // --- B1 LEVEL ---
  {
    id: 'eng-b1-phrasal-particles',
    title: 'Decode Phrasal Verbs via Particle Metaphors',
    languageId: 'english',
    level: 'B1',
    category: 'vocabulary',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80',
    imageCaption: 'Deconstruct words through conceptual metaphors',
    summary: 'Phrasal verbs seem random until you realize the preposition/particle carries a systematic conceptual metaphor.',
    goldenRule: 'Look at the particle, not just the root verb. UP often means "completion" or "visibility"; OUT means "expansion" or "extinction".',
    tactics: [
      'Particle "UP" = Completion or intensification: drink up (finish it), eat up, wrap up, clean up, use up.',
      'Particle "OUT" = Dispersion or disappearance: fade out, blow out, run out, figure out, pass out.',
      'Particle "DOWN" = Decrease or recording: turn down, calm down, write down, shut down.',
      'Keep a "Particle Notebook" rather than an alphabetical verb list.'
    ],
    examples: [
      { source: 'Drink vs. Drink up', explanation: 'Drink is the act; Drink up means finish every last drop.' },
      { source: 'Find vs. Figure out', explanation: 'Find is discovery; Figure out is mental calculation until clarity emerges.' }
    ],
    commonPitfall: 'Translating phrasal verbs literally into your native tongue word-for-word.',
    timeCommitment: '15 mins/day journaling phrasal verb clusters',
    tags: ['phrasal-verbs', 'b1', 'conceptual-metaphor']
  },
  {
    id: 'eng-b1-connected-speech',
    title: 'Connected Speech & Linking Sounds',
    languageId: 'english',
    level: 'B1',
    category: 'listening',
    summary: 'Native English speakers rarely pause between words; words blend together through linking consonants, intruding sounds, and elision.',
    goldenRule: 'Stop expecting clean gaps between spoken words. When word 1 ends in a consonant and word 2 begins with a vowel, link them as one word.',
    tactics: [
      'Consonant-to-Vowel linking: "Hold on" sounds like "Hol-don". "First of all" sounds like "Firs-to-fall".',
      'Intrusive /w/ and /j/ ("y"): "Go away" -> "Go-[w]-away". "I agree" -> "I-[j]-agree".',
      'T-Flapping in American English: "Water" -> "Wa-der", "Butter" -> "Bud-der".'
    ],
    examples: [
      { source: 'Tell him I love him', explanation: 'H is dropped: "Tell-im I lov-im".' }
    ],
    commonPitfall: 'Thinking native speakers are talking too fast when they are simply using standard phonetic reduction.',
    timeCommitment: '20 mins listening with transcript comparison',
    tags: ['listening', 'connected-speech', 'phonetics']
  },

  // --- B2 LEVEL ---
  {
    id: 'eng-b2-collocations',
    title: 'The Collocation Shift: Move from Words to Chunks',
    languageId: 'english',
    level: 'B2',
    category: 'speaking',
    summary: 'The difference between unnatural B1 English and fluent B2 English is using habitual word partnerships (collocations) rather than translating.',
    goldenRule: 'Never learn a noun without its natural verb and adjective. Languages are spoken in prefabricated chunks.',
    tactics: [
      'Identify "Make" vs. "Do": You *make* a decision, mistake, progress, effort, money. You *do* homework, business, chores, research, a favor.',
      'Adjective + Noun pairs: "Heavy rain" (not "strong rain"), "strong coffee" (not "heavy coffee"), "striking resemblance".',
      'Verb + Preposition collocations: "Insist on", "rely on", "participate in", "discourage from".'
    ],
    examples: [
      { source: 'Fast food vs. Quick shower', explanation: 'We never say "quick food" or "fast shower". Natural collocations dictate authenticity.' }
    ],
    commonPitfall: 'Combining grammatically correct words that native speakers simply never say together.',
    timeCommitment: 'Read native non-fiction with a highlighter for 20 mins',
    tags: ['collocations', 'fluency', 'chunks', 'b2-flow']
  },
  {
    id: 'eng-b2-podcast-immersion',
    title: 'The 1.25x Comprehension Cascade',
    languageId: 'english',
    level: 'B2',
    category: 'immersion',
    summary: 'Push your listening comprehension past the comfortable threshold by training on unscripted conversational audio.',
    goldenRule: 'Abandon ESL-scripted material. Transition to authentic podcasts on topics you are already passionate about.',
    tactics: [
      'Pick topical podcasts: The Daily, Radiolab, Lex Fridman, Huberman Lab, or comedy talk shows.',
      'Step 1: Listen at 1.0x without subtitles/transcript. Mark the timestamps where you lose the thread.',
      'Step 2: Inspect transcripts for the missing idioms or slang.',
      'Step 3: Re-listen at 1.2x. When you return to 1.0x normal speed, conversational English will sound effortless.'
    ],
    commonPitfall: 'Listening passively while multitasking without ever doing active phrase extraction.',
    timeCommitment: '30 mins during commute or exercise',
    tags: ['immersion', 'podcasts', 'speed-listening']
  },

  // --- C1 LEVEL ---
  {
    id: 'eng-c1-register-inversion',
    title: 'Stylistic Inversion & Rhetorical Nuance',
    languageId: 'english',
    level: 'C1',
    category: 'grammar',
    summary: 'At C1, grammar is no longer about correctness—it is about style, register, cadence, and persuasion. Inversion commands executive presence.',
    goldenRule: 'Invert the subject and auxiliary verb after negative or restrictive adverbs to create literary drama and rhetorical weight.',
    tactics: [
      'Formula: Negative adverbial + Auxiliary + Subject + Main verb.',
      '"Rarely have I seen such dedication..." (instead of "I have rarely seen...")',
      '"Not only did they exceed targets, but they also redefined the standard."',
      '"Scarcely had we arrived when the announcement was made."',
      '"Under no circumstances should you accept this clause."'
    ],
    examples: [
      { source: 'Seldom do we witness such rapid linguistic transformation.', explanation: 'Instantly marks high-level rhetorical competence in professional writing and presentations.' }
    ],
    commonPitfall: 'Forgetting auxiliary inversion and writing *"Rarely I have seen..."*.',
    timeCommitment: '15 mins rewriting standard sentences into inverted forms',
    tags: ['advanced-grammar', 'inversion', 'c1', 'formal-register']
  },
  {
    id: 'eng-c1-discourse-markers',
    title: 'The Art of Nuanced Hedging & Discourse Markers',
    languageId: 'english',
    level: 'C1',
    category: 'speaking',
    summary: 'C1 speakers do not speak in blunt absolutes. They employ sophisticated hedges, concessions, and transitional pivot phrases.',
    goldenRule: 'Structure complex arguments using precise nuance words: "Albeit", "Notwithstanding", "To a certain extent", "Having said that".',
    tactics: [
      'Concession & Pivot: "That is undoubtedly a valid concern; having said that, empirical data suggests otherwise."',
      'Hedging statements: "It would appear that...", "The findings point towards a potential correlation, albeit a tenuous one."',
      'Nuanced contrast: "Whereas" / "Whilst" / "On the flip side" / "By the same token".'
    ],
    commonPitfall: 'Overusing basic connectors like "However", "In addition", and "Moreover" in every paragraph.',
    timeCommitment: 'Incorporate one new hedging device in your next meeting or essay',
    tags: ['c1', 'hedging', 'discourse-markers', 'sophisticated-speaking']
  },

  // --- C2 LEVEL ---
  {
    id: 'eng-c2-cultural-subtext',
    title: 'Decoding British Understatement & American Irony',
    languageId: 'english',
    level: 'C2',
    category: 'mindset',
    summary: 'C2 is not about vocabulary size; it is about detecting emotional subtext, sarcasm, self-deprecation, and unstated social expectations.',
    goldenRule: 'Words do not mean what they say in high-context English. Decode the pragmatic subtext.',
    tactics: [
      'British diplomatic translation: "With the greatest respect..." = "You are completely wrong."',
      '"That is an interesting proposal..." = "That will never happen."',
      '"I was a bit disappointed..." = "I am utterly furious."',
      'American workplace idioms: "Circle back", "Move the needle", "Elephant in the room", "Touch base".'
    ],
    examples: [
      { source: '"It is not bad at all."', explanation: 'Often means exceptional or outstanding in British English understatement.' }
    ],
    commonPitfall: 'Taking formal politeness or diplomatic euphemisms at face value.',
    timeCommitment: 'Watch political debates, high-brow British panel shows (QI, Have I Got News For You)',
    tags: ['c2', 'pragmatics', 'culture', 'humor', 'subtext']
  },
  {
    id: 'eng-c2-polyglot-rhythm',
    title: 'Prosody, Pausing & The Vocal Signature',
    languageId: 'english',
    level: 'C2',
    category: 'speaking',
    summary: 'At near-native level, your accent is irrelevant, but your prosody (intonation curves, dramatic pauses, vocal variety) defines mastery.',
    goldenRule: 'Speak with deliberate rhythmic pauses rather than rapid-fire filler words. Use pitch drops at sentence conclusions.',
    tactics: [
      'Adopt the "thought group" pause: Chunk complex ideas with subtle breathing intervals.',
      'Downward pitch inflection on statements to project executive authority and certainty.',
      'Record yourself giving a 5-minute unscripted speech, listen back, and eliminate vocal fillers (um, like, you know).'
    ],
    commonPitfall: 'Rushing your speech thinking speed equals fluency.',
    timeCommitment: 'Weekly vocal recording audit',
    tags: ['prosody', 'public-speaking', 'c2-mastery', 'intonation']
  }
];
