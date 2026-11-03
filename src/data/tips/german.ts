import { TipItem } from '../../types';

export const GERMAN_TIPS: TipItem[] = [
  // --- A1 LEVEL ---
  {
    id: 'ger-a1-gender-suffixes',
    title: 'The Der/Die/Das Hack: 80% Suffix Cheat Codes',
    languageId: 'german',
    level: 'A1',
    category: 'grammar',
    diagramType: 'german-gender',
    summary: 'Do not guess German genders! Over 80% of German nouns reveal their gender (der, die, or das) by their ending suffixes.',
    goldenRule: 'Never memorize a noun alone. Memorize it with its article and color-code your notes (Blue for Der, Red for Die, Green for Das).',
    tactics: [
      'ALWAYS DIE (Feminine): -ung (die Zeitung), -heit (die Freiheit), -keit (die Möglichkeit), -schaft (die Freundschaft), -tion (die Station), -tät (die Universität), -ie (die Biologie), -ei (die Bäckerei).',
      'ALWAYS DAS (Neuter): -chen (das Mädchen), -lein (das Fräulein), -ment (das Dokument), -um (das Museum), -ma (das Thema), and all nominalized infinitives (das Essen, das Leben).',
      'USUALLY DER (Masculine): -ling (der Schmetterling), -or (der Motor), -ismus (der Optimismus), -ist (der Tourist), -er denoting actors/tools (der Lehrer, der Computer), days/months/seasons (der Montag, der Juli, der Sommer).'
    ],
    examples: [
      { source: 'die Einsamkeit, die Hoffnung', explanation: '-keit and -ung endings guarantee the feminine article "die" 100% of the time.' },
      { source: 'das Brötchen, das Datum', explanation: '-chen diminutive and -um suffix guarantee neuter "das".' }
    ],
    commonPitfall: 'Treating grammatical gender as biological gender (e.g., "das Mädchen" is neuter purely because of the diminutive -chen ending).',
    timeCommitment: '15 mins/day color-coded flashcards',
    tags: ['grammar', 'der-die-das', 'noun-endings', 'gender-hacks'],
    recommendedTools: [
      { name: 'Der Die Das App', category: 'app', url: 'https://derdiedas.app', note: 'Interactive flashcards strictly testing German article recall.' }
    ]
  },
  {
    id: 'ger-a1-verb-position-v2',
    title: 'The Iron V2 Rule: Verb is King in Position 2',
    languageId: 'german',
    level: 'A1',
    category: 'grammar',
    summary: 'In any standard German main clause, the conjugated verb MUST occupy the second grammatical slot, no matter what starts the sentence.',
    goldenRule: 'If you move anything to position 1 (like time or place), the subject immediately flips behind the verb.',
    tactics: [
      'Standard: "Ich trinke heute Kaffee." (Position 1: Ich, Position 2: trinke).',
      'Time first: "Heute trinke ich Kaffee." (Position 1: Heute, Position 2: trinke, Position 3: ich). NOT *"Heute ich trinke"*.',
      'Place first: "In Berlin trinke ich Kaffee."',
      'Treat the second slot as an anchored wall that never shifts in declarative sentences.'
    ],
    examples: [
      { source: 'Morgen gehe ich ins Kino.', explanation: 'Time element occupies position 1; conjugated verb "gehe" stays strictly at position 2.' }
    ],
    commonPitfall: 'Translating directly from English: *"Morgen ich gehe..."* (English word order error).',
    timeCommitment: '10 mins sentence inversion drills',
    tags: ['grammar', 'v2-rule', 'sentence-order', 'foundations']
  },
  {
    id: 'ger-a1-pronunciation-ch-umlauts',
    title: 'Phonetic Mastery: The Two CH Sounds & Umlauts',
    languageId: 'german',
    level: 'A1',
    category: 'pronunciation',
    diagramType: 'mouth-phonetics',
    summary: 'German pronunciation is remarkably phonetic and consistent once you unlock the Ich-Laut [ç], the Ach-Laut [x], and the three Umlauts (ä, ö, ü).',
    goldenRule: 'Umlauts are shaped by your tongue inside your mouth while holding your lips rounded like an O or U.',
    tactics: [
      'The "Ü" Hack: Shape your lips into a tight circle as if whistling or saying "oo", but hold that shape and try to pronounce "ee". Out comes a perfect German "Ü" [y]!',
      'The "Ö" Hack: Round your lips as if to say "oh", but pronounce the English vowel in "bed" ("eh"). That produces "Ö" [ø].',
      'The "CH" Rule: After A, O, U, AU -> throaty Ach-Laut (Buch, Bach, Koch). After E, I, Ä, Ö, Ü, or consonants -> soft hissing kitten Ich-Laut (ich, echt, Bücher, Milch).'
    ],
    examples: [
      { source: 'Küche vs. Kuchen', explanation: 'Küche uses the soft Ich-Laut [ç] after ü; Kuchen uses the throaty Ach-Laut [x] after u.' }
    ],
    commonPitfall: 'Pronouncing "ich" like "isch" or "ick" or pronouncing German Umlauts like English flat vowels.',
    timeCommitment: '5 mins daily tongue shaping in front of a mirror',
    tags: ['pronunciation', 'umlauts', 'ich-laut', 'ach-laut', 'phonetics']
  },

  // --- A2 LEVEL ---
  {
    id: 'ger-a2-cases-demystified',
    title: 'The 4-Case Secret: Only Masculine Changes in Akkusativ!',
    languageId: 'german',
    level: 'A2',
    category: 'grammar',
    summary: 'Cases terrify beginners, but Akkusativ (direct object) is astonishingly simple: feminine, neuter, and plural do not change at all.',
    goldenRule: 'In the Accusative case, only the masculine changes: DER becomes DEN, EIN becomes EINEN. Everything else stays identical to Nominative.',
    tactics: [
      'Masculine: Der Mann -> Ich sehe DEN Mann. Ein Hund -> Ich habe EINEN Hund.',
      'Feminine: Die Frau -> Ich sehe DIE Frau. Eine Katze -> Ich habe EINE Katze. (Zero change!)',
      'Neuter: Das Kind -> Ich sehe DAS Kind. Ein Buch -> Ich habe EIN Buch. (Zero change!)',
      'Plural: Die Bücher -> Ich sehe DIE Bücher. (Zero change!)',
      'Master this relief: 75% of accusative articles don\'t even shift!'
    ],
    examples: [
      { source: 'Ich habe einen Apfel (der Apfel -> einen Apfel)', explanation: 'Direct object + masculine = -en suffix.' }
    ],
    commonPitfall: 'Worrying about changing feminine or neuter articles in basic direct object sentences.',
    timeCommitment: '15 mins case recognition exercises',
    tags: ['cases', 'akkusativ', 'grammar', 'articles']
  },
  {
    id: 'ger-a2-two-way-prepositions',
    title: 'Wechselpräpositionen: Movement vs. Position',
    languageId: 'german',
    level: 'A2',
    category: 'grammar',
    diagramType: 'two-way-prepositions',
    summary: 'The 9 two-way prepositions (an, auf, hinter, in, neben, über, unter, vor, zwischen) take Akkusativ for movement and Dativ for stationary location.',
    goldenRule: 'Ask "Wohin?" (Where to? -> Akkusativ movement). Ask "Wo?" (Where at? -> Dativ location).',
    tactics: [
      'Movement (Wohin? -> Akk): "Ich lege das Buch auf DEN Tisch." (I am putting it onto the table).',
      'Location (Wo? -> Dat): "Das Buch liegt auf DEM Tisch." (The book is resting on the table).',
      'Mnemonic pair: Stellen/Legen/Setzen (Action verbs -> Akkusativ) vs. Stehen/Liegen/Sitzen (State verbs -> Dativ).'
    ],
    examples: [
      { source: 'In die Stadt (Akk) vs. in der Stadt (Dat)', explanation: 'Going into town (direction) vs. strolling inside the town (stationary sphere).' }
    ],
    commonPitfall: 'Using Dative when moving something across a boundary into a new space.',
    timeCommitment: '15 mins daily with household objects',
    tags: ['cases', 'prepositions', 'dativ', 'akkusativ', 'wechselpraepositionen']
  },
  {
    id: 'ger-a2-separable-verbs',
    title: 'Separable Verbs & The Prefix Launchpad',
    languageId: 'german',
    level: 'A2',
    category: 'vocabulary',
    summary: 'German prefixes completely transform root verbs, and in main clauses, separable prefixes fly to the absolute end of the sentence.',
    goldenRule: 'In a main clause, conjugate the root verb at position 2, and launch the separable prefix to the very last position of the sentence.',
    tactics: [
      'Root verb: FANGEN (to catch). Prefix: AN (anfangen = to begin).',
      '"Der Film fängt um 20:00 Uhr im Kino an."',
      'Inseparable prefixes NEVER split: be-, ge-, emp-, ent-, er-, ver-, zer-, miss- (Remember: Be-Ge-Emp-Ent-Er-Ver-Zer-Miss).',
      'Separable prefixes: auf-, ab-, an-, aus-, ein-, mit-, vor-, zu-, zurück-.'
    ],
    examples: [
      { source: 'Ich stehe jeden Morgen um 7 Uhr auf.', explanation: 'Prefix "auf" anchors the final punctuation mark of the sentence.' }
    ],
    commonPitfall: 'Keeping the separable prefix attached to the verb in simple present sentences: *"Ich aufstehe um 7 Uhr"*.',
    timeCommitment: '10 mins prefix sorting drill',
    tags: ['verbs', 'prefixes', 'separable-verbs', 'a2']
  },

  // --- B1 LEVEL ---
  {
    id: 'ger-b1-subordinate-kick',
    title: 'The Subordinate Verb-Kicker: weil, dass, obwohl, wenn',
    languageId: 'german',
    level: 'B1',
    category: 'grammar',
    summary: 'Conjunctions in German are divided into two teams: coordinating (zero position) and subordinating (verb kickers that launch the verb to the end).',
    goldenRule: 'When you trigger "weil", "dass", "obwohl", "wenn", or "da", the conjugated verb is kicked to the ultimate position.',
    tactics: [
      'Coordinating (ADUSO: Aber, Denn, Und, Sondern, Oder) -> Verb stays in position 2: "Ich lerne, denn ich will reisen."',
      'Subordinating (weil, dass, obwohl, wenn, als) -> Verb kicked to the end: "Ich lerne Deutsch, weil ich in Berlin arbeiten will."',
      'Notice: "arbeiten" is infinitive, "will" is conjugated and ends up last.'
    ],
    examples: [
      { source: 'Obwohl es regnet, gehen wir spazieren.', explanation: 'In the subordinate clause "Obwohl es regnet", regnet is at the end. In the main clause that follows, V2 rule places "gehen" immediately after the comma.' }
    ],
    commonPitfall: 'Saying *"weil ich will Deutsch lernen"* instead of *"weil ich Deutsch lernen will"*.',
    timeCommitment: '15 mins conjunction connector drills',
    tags: ['subordinate-clauses', 'verb-order', 'b1', 'grammar']
  },
  {
    id: 'ger-b1-polite-konjunktiv-2',
    title: 'The Politeness Superpower: Konjunktiv II',
    languageId: 'german',
    level: 'B1',
    category: 'speaking',
    summary: 'Instead of sounding abrupt or demanding with the imperative or present tense, native Germans rely on Konjunktiv II for politeness and hypothetical wishes.',
    goldenRule: 'Use "könnten Sie..." and "würde + Infinitiv" to instantly transform demands into courteous native German.',
    tactics: [
      'Core forms: "Ich hätte gern..." (I would like to have...), "Ich wäre gern..." (I would like to be...), "Könnten Sie mir helfen?" (Could you help me?).',
      'For other verbs, use Würde-form: "Ich würde gern wissen..." (I would like to know...), "Was würdest du tun?" (What would you do?).',
      'At restaurants/cafes: Replace *"Ich will einen Kaffee"* with *"Ich hätte gern einen Kaffee, bitte."*'
    ],
    examples: [
      { source: 'Könnten Sie das bitte wiederholen?', explanation: 'Far more polite and natural than "Wiederholen Sie das!".' }
    ],
    commonPitfall: 'Using "Ich will..." in shops and restaurants, which can sound unintentionally rude or childlike to native German ears.',
    timeCommitment: '10 mins cafe & street scenario rehearsal',
    tags: ['speaking', 'politeness', 'konjunktiv-2', 'social-fluency']
  },

  // --- B2 LEVEL ---
  {
    id: 'ger-b2-modal-particles',
    title: 'The Secret Flavor of Native German: Modalpartikeln',
    languageId: 'german',
    level: 'B2',
    category: 'speaking',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80',
    imageCaption: 'Authentic social banter in Berlin cafes',
    summary: 'Modal particles (doch, ja, mal, halt, eben, denn, bloß) carry zero grammatical weight, but they communicate emotion, attitude, and social rapport.',
    goldenRule: 'Sprinkle modal particles into your speech to instantly sound like you have lived in Germany for 10 years.',
    tactics: [
      'DOCH: Contradicts an assumption or softens an invitation ("Komm doch rein!" = Come on in! / "Das weißt du doch!" = You know that already!).',
      'JA: Signals shared knowledge or surprise ("Das ist ja toll!" = That really is awesome! / "Ich bin ja kein Experte" = As you know, I\'m no expert).',
      'MAL: Softens requests ("Schau mal" = Take a quick look / "Kannst du mir mal helfen?").',
      'HALT / EBEN: Resignation or accepting reality ("Es ist halt so" = That\'s just the way it is).'
    ],
    examples: [
      { source: 'Das ist doch kein Problem!', explanation: 'The "doch" dispels hesitation and reassures the listener warmly.' }
    ],
    commonPitfall: 'Translating modal particles literally into your native language—they have no direct dictionary equivalent; they are emotional seasoning.',
    timeCommitment: 'Watch German vloggers and tally occurrences of "doch" and "halt"',
    tags: ['modal-particles', 'colloquial', 'fluency', 'b2-flow'],
    recommendedTools: [
      { name: 'Easy German (YouTube & Podcast)', category: 'channel', url: 'https://www.easygerman.org', note: 'Authentic street interviews with real conversational modal particles.' }
    ]
  },
  {
    id: 'ger-b2-adjective-endings',
    title: 'The Two-Step Adjective Ending Logic (No 48-Cell Tables!)',
    languageId: 'german',
    level: 'B2',
    category: 'grammar',
    summary: 'Learners dread German adjective declensions because textbooks present intimidating 48-cell grids. Reduce it to two simple polyglot questions.',
    goldenRule: 'Ask Question 1: Has the article in front already shown the case/gender signal? If YES -> Adjective takes lazy "-e" or "-en". If NO -> Adjective must carry the signal flag!',
    tactics: [
      'RULE 1 (Definite Article / Der-Die-Das): Der/Die/Das already carries the signal. Nominative singular adjectives take only "-e" (der gute Mann, die gute Frau, das gute Kind). All plural and oblique cases take "-en".',
      'RULE 2 (Zero Article / No Signal): When there is no article (e.g. "kalter Kaffee", "gutes Bier"), the adjective itself must wear the case flag (-er for masc, -es for neuter, -e for fem).',
      'RULE 3: Dativ & Genitiv adjectives ALWAYS end in "-en", no matter what (mit dem guten Freund, der netten Frau).'
    ],
    examples: [
      { source: 'Ein schönes Haus', explanation: '"Ein" has no ending to signal neuter, so the adjective "schönes" must carry the "-es" neuter flag.' }
    ],
    commonPitfall: 'Paralyzing your speech trying to mentally browse a massive declension table in real-time.',
    timeCommitment: '15 mins rule-based pattern drilling',
    tags: ['adjective-endings', 'grammar-hack', 'b2', 'declension']
  },

  // --- C1 LEVEL ---
  {
    id: 'ger-c1-nominalstil',
    title: 'Nominalstil: The Architecture of German Intellect',
    languageId: 'german',
    level: 'C1',
    category: 'grammar',
    summary: 'High-level academic, scientific, and business German favors Nominalstil (nominal style)—condensing verbs and clauses into sophisticated noun compounds with genitives.',
    goldenRule: 'Transform verbal actions into nouns with suffixes like -ung, -ung des, and prepositions with genitive (aufgrund, anlässlich, bezüglich).',
    tactics: [
      'Verbal (B1/B2): "Weil die Preise gestiegen sind, müssen wir sparen."',
      'Nominal (C1): "Aufgrund des Preisanstiegs sind Sparmaßnahmen erforderlich."',
      'Verbal: "Bevor der Vertrag unterzeichnet wird..." -> Nominal: "Vor der Vertragsunterzeichnung..."',
      'Learn high-level Genitive prepositions: anlässlich (on the occasion of), bezüglich (regarding), hinsichtlich (with respect to).'
    ],
    examples: [
      { source: 'Nach Überprüfung der Unterlagen...', explanation: 'Replaces "Nachdem wir die Unterlagen überprüft haben...". Clean, authoritative, concise.' }
    ],
    commonPitfall: 'Writing in C1 German using the casual verbal syntax of spoken B1 everyday conversation.',
    timeCommitment: '20 mins converting news headlines from verbal to nominal style',
    tags: ['nominalstil', 'c1-german', 'academic-german', 'advanced-writing']
  },
  {
    id: 'ger-c1-partizipialkonstruktion',
    title: 'Extended Participial Clauses (Partizipialattribute)',
    languageId: 'german',
    level: 'C1',
    category: 'grammar',
    summary: 'German newspapers (Spiegel, FAZ, Zeit) pack entire subordinate clauses into a single bracketed participial adjective between article and noun.',
    goldenRule: 'Find the article first, skip over the sandwich filling, and find the noun at the end to grasp the subject, then decode the participle inside.',
    tactics: [
      'Example: "Die [von Experten seit langem geforderte] Steuerreform..."',
      'Translation: The tax reform [which has long been demanded by experts]...',
      'Present Participle (-end): "Das schnell wachsende Unternehmen" (The rapidly growing company).',
      'Past Participle (-t / -en): "Der gestern verabschiedete Gesetzentwurf" (The draft law passed yesterday).'
    ],
    examples: [
      { source: 'Alle an der Konferenz teilnehmenden Delegierten...', explanation: 'Compresses "Alle Delegierten, die an der Konferenz teilnehmen...".' }
    ],
    commonPitfall: 'Losing the subject of the sentence while reading because you get trapped in the embedded participle modifier.',
    timeCommitment: '15 mins dissecting Der Spiegel articles',
    tags: ['c1', 'reading-comprehension', 'partizipien', 'journalism']
  },

  // --- C2 LEVEL ---
  {
    id: 'ger-c2-redewendungen',
    title: 'Idiomatic Mastery & Pragmatic Precision',
    languageId: 'german',
    level: 'C2',
    category: 'speaking',
    summary: 'At C2, you transition from someone who speaks German accurately to someone who thinks in German cultural metaphors.',
    goldenRule: 'Deploy authentic German Redewendungen effortlessly and accurately in professional negotiations and banter.',
    tactics: [
      '"Die Kirche im Dorf lassen" -> Don\'t get carried away / keep things grounded.',
      '"Den Nagel auf den Kopf treffen" -> Hit the nail on the head / pinpoint the exact truth.',
      '"Schwein haben" -> Have a stroke of pure luck.',
      '"Auf Nummer sicher gehen" -> Play it completely safe.',
      '"Jemandem reinen Wein einschenken" -> Tell someone the unvarnished truth.'
    ],
    examples: [
      { source: 'Da hast du wirklich den Nagel auf den Kopf getroffen.', explanation: 'Used naturally in boardrooms and casual conversations alike.' }
    ],
    commonPitfall: 'Using literal translations of English idioms like *"einen kühlen Kopf halten"* without verifying native German equivalents.',
    timeCommitment: 'Weekly immersion in German satirical news (heute-show, Die Anstalt)',
    tags: ['c2', 'idioms', 'redewendungen', 'native-wit', 'mastery']
  },
  {
    id: 'ger-c2-nuance-particles-konjunktiv1',
    title: 'Konjunktiv I & Journalistic Distance',
    languageId: 'german',
    level: 'C2',
    category: 'mindset',
    summary: 'True mastery of high German requires Konjunktiv I (indirect discourse), signaling that you are reporting an assertion without personally guaranteeing its veracity.',
    goldenRule: 'Use Konjunktiv I to maintain professional neutrality and journalistic distance: "Der Sprecher sagte, es gebe keine Gefahr."',
    tactics: [
      'Form: Root of infinitive + -e, -est, -e, -en, -et, -en.',
      'Key irregulars: sein -> er sei / sie seien; haben -> er habe; können -> er könne; wissen -> er wisse.',
      'Notice the difference: "Er sagte, er ist krank" (Direct quote/fact) vs. "Er sagte, er sei krank" (Reported speech, objective distance).'
    ],
    examples: [
      { source: 'Die Regierung betonte, der Plan sei alternativlos.', explanation: 'Maintains neutral reporting without taking ownership of the claim.' }
    ],
    commonPitfall: 'Confusing Konjunktiv I (reported speech neutrality) with Konjunktiv II (hypothetical counterfactuals).',
    timeCommitment: '15 mins reading Tagesschau or FAZ news reports',
    tags: ['c2', 'konjunktiv-1', 'journalism', 'precision', 'advanced-german']
  }
];
