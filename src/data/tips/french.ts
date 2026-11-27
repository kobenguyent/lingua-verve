import { TipItem } from '../../types';

export const FRENCH_TIPS: TipItem[] = [
  // --- A1 LEVEL ---
  {
    id: 'fr-a1-silent-consonants',
    title: 'Silent Final Consonants & The CaReFuL Rule',
    languageId: 'french',
    level: 'A1',
    category: 'pronunciation',
    summary:
      'French spelling preserves centuries of history, leaving most final consonants silent. Memorize one English word — CaReFuL — to predict which word-final consonants you actually pronounce.',
    goldenRule:
      'Final C, R, F, and L (CaReFuL) are usually pronounced; almost every other final consonant (d, s, t, x, z, p, g) and verb-ending -ent stays completely silent.',
    tactics: [
      'CaReFuL Pronounced: sac [sak], bonjour [bɔ̃.ʒuʁ], neuf [nœf], hôtel [o.tɛl].',
      'Silent Tail Letters: grand [ɡʁɑ̃], petit [pə.ti], français [fʁɑ̃.sɛ], beaucoup [bo.ku], chez [ʃe], deux [dø].',
      'Silent -ent on 3rd-Person Plural Verbs: "ils parlent" sounds 100% identical to "il parle" [paʁl] — NEVER pronounce the -ent!',
      'The -ER Exception: Infinitives ending in -er (parler, manger, aller) drop the final R and sound like crisp [e] ("par-lay").',
      'Final -E Wake-Up Switch: Adding a silent -e wakes up the preceding consonant — petit [pə.ti] vs. petite [pə.tit], grand [ɡʁɑ̃] vs. grande [ɡʁɑ̃d].',
    ],
    examples: [
      {
        source: 'petit [pə.ti] vs. petite [pə.tit]',
        target: 'Le petit café / La petite boulangerie',
        explanation:
          'Without the trailing -e, the final "t" is mute. The feminine "-e" itself is silent, yet it activates the "t" right before it.',
        audioPrompt: 'Le petit café. La petite boulangerie.',
      },
      {
        source: 'ils travaillent [il tʁa.vaj] vs. il travaille [il tʁa.vaj]',
        target: 'Ils travaillent à Paris depuis trois ans.',
        explanation:
          'Third-person plural verb endings in "-ent" are purely visual grammar markers; pronouncing "-ent" is the #1 beginner giveaway.',
        audioPrompt: 'Ils travaillent à Paris depuis trois ans.',
      },
    ],
    commonPitfall:
      'Pronouncing the "s" in plural nouns ("les croissants") or the "-ent" in "ils mangent", which immediately disrupts French syllable rhythm.',
    timeCommitment: '10 mins reading aloud with a highlighter marking silent letters',
    recommendedTools: [
      {
        name: 'Forvo French Pronunciations',
        category: 'audio',
        url: 'https://forvo.com/languages/fr/',
        note: 'Verify native pronunciations of tricky consonant endings across France, Québec, and Switzerland.',
        free: true,
      },
    ],
    tags: ['pronunciation', 'silent-letters', 'careful-rule', 'a1', 'phonetics'],
  },
  {
    id: 'fr-a1-nasal-vowels-uvular-r',
    title: 'Nasal Vowels (an/on/in/un) & The French Uvular R [ʁ]',
    languageId: 'french',
    level: 'A1',
    category: 'pronunciation',
    diagramType: 'mouth-phonetics',
    summary:
      'Two sounds separate robotic textbook French from effortless native resonance: air flowing simultaneously through mouth and nose on nasal vowels, and a gentle back-of-throat friction for the French R [ʁ].',
    goldenRule:
      'On a French nasal vowel (an, en, on, in, un), NEVER let your tongue tip touch the roof of your mouth to make an English "n" or "m" — let the vowel resonate openly through your nose.',
    tactics: [
      'Three Core Nasal Vowels: AN/EN [ɑ̃] (jaw dropped wide: "sans, vent"), ON [ɔ̃] (lips tight and round like an O: "bon, nom"), IN/AIN/EIN/UN [ɛ̃] (lips spread in a slight smile: "vin, pain, matin").',
      'Denazalization Trigger: If a vowel or second N/M follows (bonne, amie, cinéma, inutile), the nasality vanishes and you pronounce a crisp oral vowel + N/M.',
      'Gentle Uvular R [ʁ]: Rest the tip of your tongue behind your lower front teeth, raise the back of your tongue gently toward the soft palate, and exhale softly — think of a quiet sigh or warm gargle, NOT a harsh scrape.',
      'Minimal-Pair Ear Gym: Drill "bon / banc / bain" [bɔ̃ / bɑ̃ / bɛ̃] and "tu / tout" [ty / tu] in front of a mirror for 3 minutes daily.',
    ],
    examples: [
      {
        source: 'bon [bɔ̃] vs. bonne [bɔn]',
        target: 'Un bon vin blanc et une bonne baguette.',
        explanation:
          'In "bon", air passes through the nose with no consonant closure. In "bonne", the double "n" + "e" cancels the nasal and produces an oral [ɔ] + [n].',
        audioPrompt: 'Un bon vin blanc et une bonne baguette.',
      },
      {
        source: 'rue [ʁy] · Paris [pa.ʁi] · trois [tʁwa]',
        target: 'Trois croissants frais rue de Rivoli à Paris.',
        explanation:
          'Keeping the tongue tip anchored behind the bottom teeth prevents English retroflex R curling and creates an effortless French [ʁ].',
        audioPrompt: 'Trois croissants frais rue de Rivoli à Paris.',
      },
    ],
    commonPitfall:
      'Closing the mouth with an audible English "-ng" or "-n" after "bon" or "vin", turning "vin" into "vang" or "bon" into "bong".',
    timeCommitment: '5 mins daily mirror articulation & minimal-pair shadowing',
    recommendedTools: [
      {
        name: 'TV5MONDE Phonétique',
        category: 'tool',
        url: 'https://apprendre.tv5monde.com/en',
        note: 'Guided interactive ear training for French nasal vowels and uvular R contrasts.',
        free: true,
      },
    ],
    tags: ['pronunciation', 'nasal-vowels', 'uvular-r', 'mouth-phonetics', 'a1'],
  },
  {
    id: 'fr-a1-gender-suffixes',
    title: 'Le vs. La Hack: 80% French Noun Suffix Cheat Codes',
    languageId: 'french',
    level: 'A1',
    category: 'grammar',
    summary:
      'Stop flipping a mental coin between "le" and "la"! Nearly 80% of French nouns announce their grammatical gender through predictable suffix patterns.',
    goldenRule:
      'Always learn a French noun glued to its indefinite article ("un" / "une"), because "l’" hides gender before vowels (l’hôtel = masculin, l’école = féminin).',
    tactics: [
      'ALMOST ALWAYS FEMININE (LA / UNE): -tion / -sion (la station, la décision), -té (la liberté, la qualité), -ie (la boulangerie, la philosophie), -ure (la voiture, la culture), -ance / -ence (la chance, la différence), -ette (la baguette).',
      'ALMOST ALWAYS MASCULINE (LE / UN): -age (le voyage, le fromage — watch 6 exceptions: la plage, la page, la cage, la nage, la rage, l’image), -ment (le moment, le bâtiment), -isme (le tourisme), -eau (le bureau, le château), -oir (le miroir), -phone / -scope (le téléphone).',
      'Double-Consonant + E Clues: -elle, -enne, -esse, -onne, -otte are overwhelmingly feminine (la nouvelle, la richesse, la carotte).',
      'Built-In Masculine Groups: All days of the week (le lundi), months, seasons, languages (le français), trees, and metric units are masculine.',
    ],
    examples: [
      {
        source: 'la solution · la sécurité · la librairie · la nourriture',
        target: 'La qualité de la nourriture dans cette boulangerie est excellente.',
        explanation:
          'The suffixes -té, -ure, and -ie telegraph feminine gender with over 95% accuracy.',
        audioPrompt: 'La qualité de la nourriture dans cette boulangerie est excellente.',
      },
      {
        source: 'le changement · le paysage · le réaliste · le réseau',
        target: 'Un gouvernement moderne investit dans le développement durable.',
        explanation:
          'Every -ment noun (except "la jument") and nearly all -age/-eau nouns take masculine articles and adjectives.',
        audioPrompt: 'Un gouvernement moderne investit dans le développement durable.',
      },
    ],
    commonPitfall:
      'Assuming every noun ending in "-e" is feminine — massive high-frequency words like "le problème", "le système", "le musée", "le lycée", and "le fromage" are masculine!',
    timeCommitment: '10 mins/day sorting new vocab with un/une cards',
    recommendedTools: [
      {
        name: 'WordReference French Dictionary',
        category: 'tool',
        url: 'https://www.wordreference.com/fren/',
        note: 'Instant gender tags (nm / nf), audio playback, and idiomatic usage forums.',
        free: true,
      },
    ],
    tags: ['grammar', 'gender', 'le-la', 'noun-suffixes', 'a1'],
  },

  // --- A2 LEVEL ---
  {
    id: 'fr-a2-liaison-enchainement',
    title: 'Liaison & Enchaînement: Decoding the French Sound Stream',
    languageId: 'french',
    level: 'A2',
    category: 'listening',
    summary:
      'Native French does not sound like isolated dictionary words — speakers link words into fluid rhythmic groups (groupes rythmiques) via liaison and enchaînement.',
    goldenRule:
      'In French, syllables hate starting with a bare vowel: a silent final consonant wakes up and jumps onto the next word as a liaison (les_amis = [le.za.mi]), while an already-pronounced consonant slides smoothly forward as an enchaînement (une_amie = [y.na.mi]).',
    tactics: [
      'Obligatory Liaisons (NEVER skip): determiner + noun ("les_enfants", "un_hôtel"), subject pronoun + verb ("nous_avons", "ils_habitent"), pre-noun adjective + noun ("un petit_appartement"), and short prepositions/adverbs ("dans_une heure", "très_utile").',
      'Sound Transformations in Liaison: S and X become [z] ("deux_euros" = [dø.zø.ʁo]), D becomes [t] ("un grand_homme" = [œ̃.ɡʁɑ̃.tɔm]), F becomes [v] in "neuf_heures / neuf_ans".',
      'Forbidden Liaisons (NEVER make): NEVER link after "et" ("et // un café"), after a singular noun ("un étudiant // italien"), or before an aspirated H ("les // haricots", "en // haut").',
      'Train Your Ear by Chunking: Stop listening for word boundaries; transcribe full 4-to-6-syllable rhythmic phrases from RFI Journal en français facile.',
    ],
    examples: [
      {
        source: 'les_amis [le.za.mi] · nous_allons [nu.za.lɔ̃] · grand_hôtel [ɡʁɑ̃.to.tɛl]',
        target: 'Nous_avons réservé deux_hôtels très_agréables à Lyon.',
        explanation:
          'Every liaison shifts the final consonant into the onset of the next syllable so speech glides without glottal stops.',
        audioPrompt: 'Nous avons réservé deux hôtels très agréables à Lyon.',
      },
      {
        source: 'et // elle (NO liaison!) · les // héros (aspirated H)',
        target: 'Elle parle français et anglais, et elle aime les haricots verts.',
        explanation:
          'Making a liaison after "et" ("et-t-elle") sounds unnatural and confuses listeners with "était".',
        audioPrompt: 'Elle parle français et anglais, et elle aime les haricots verts.',
      },
    ],
    commonPitfall:
      'Inserting English-style glottal stops between every word, or mistakenly making a liaison after the conjunction "et".',
    timeCommitment: '15 mins/day shadowing audio transcripts with liaison arcs marked',
    recommendedTools: [
      {
        name: 'RFI Savoirs — Journal en français facile',
        category: 'podcast',
        url: 'https://francaisfacile.rfi.fr/en/',
        note: 'Daily 10-minute clear news broadcasts with full text transcripts to spot real liaisons.',
        free: true,
      },
    ],
    tags: ['listening', 'liaison', 'enchainement', 'connected-speech', 'a2'],
  },
  {
    id: 'fr-a2-passe-compose-imparfait',
    title: 'Passé Composé vs. Imparfait & DR MRS VANDERTRAMP',
    languageId: 'french',
    level: 'A2',
    category: 'grammar',
    summary:
      'Every French past-tense story works like a movie scene: the Imparfait paints the background camera shot, while the Passé Composé fires the sudden action events.',
    goldenRule:
      'Use Imparfait for ongoing states, weather, habits, and scenery ("Il pleuvait, j’avais froid"); use Passé Composé for completed events with clear boundaries ("Soudain, le train est arrivé").',
    tactics: [
      'Imparfait Formula (Zero Irregulars except être!): Take the present NOUS stem (nous finissons -> finiss-), drop -ons, add -ais, -ais, -ait, -ions, -iez, -aient. Only exception: être -> ét-.',
      'DR MRS VANDERTRAMP (17 Être Verbs): Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Rentrer, Tomber, Retourner, Arriver, Mourir, Partir, Passer — PLUS every reflexive verb (se lever, s’habiller) uses ÊTRE and agrees with the subject!',
      'Scene + Interruption Frame: "Je lisais tranquillement (Imparfait) quand mon téléphone a sonné (Passé Composé)."',
      'Watch Direct-Object Switches: When monter/descendre/sortir/passer takes a direct object, it switches back to AVOIR ("J’ai sorti la poubelle", "J’ai passé un bon week-end").',
    ],
    examples: [
      {
        source: 'Background (Imparfait) + Event (Passé Composé)',
        target: 'Il faisait beau et nous marchions dans le parc quand nous avons rencontré Claire.',
        explanation:
          'Weather ("faisait") and ongoing strolling ("marchions") set the stage; meeting Claire ("avons rencontré") is the punctual plot beat.',
        audioPrompt: 'Il faisait beau et nous marchions dans le parc quand nous avons rencontré Claire.',
      },
      {
        source: 'Être agreement vs. Avoir direct object',
        target: 'Elle est sortie tôt ce matin, puis elle a sorti ses clés devant la porte.',
        explanation:
          'Intransitive motion ("est sortie") uses être + feminine -e; transitive action ("a sorti ses clés") switches to avoir.',
        audioPrompt: 'Elle est sortie tôt ce matin, puis elle a sorti ses clés devant la porte.',
      },
    ],
    commonPitfall:
      'Using Passé Composé for past descriptions or emotions ("*Il a fait froid*" instead of "Il faisait froid"), or forgetting subject agreement on être verbs ("*Elle est allé*" -> "Elle est allée").',
    timeCommitment: '15 mins narrating your previous weekend aloud in 6 sentences',
    tags: ['grammar', 'passe-compose', 'imparfait', 'vandertramp', 'a2'],
  },

  // --- B1 LEVEL ---
  {
    id: 'fr-b1-pronouns-y-en',
    title: 'Mastering the Magic Pronouns Y & EN (Without Brain Freeze)',
    languageId: 'french',
    level: 'B1',
    category: 'grammar',
    summary:
      'Nothing makes your French sound authentically B1/B2 faster than replacing clunky prepositional phrases with tiny, effortless "y" and "en" pronouns.',
    goldenRule:
      'Y replaces À + thing/place ("Je vais à Lyon" -> "J’y vais"; "Je pense à ce projet" -> "J’y pense"). EN replaces DE + thing/quantity ("Je bois du café" -> "J’en bois"; "J’ai trois chats" -> "J’en ai trois").',
    tactics: [
      'The Y Trigger (À / DANS / CHEZ / SUR + non-person): "Tu vas au cinéma ?" -> "Oui, j’y vais !" "Tu réfléchis à ton avenir ?" -> "Oui, j’y réfléchis." (Never use Y for people — use lui/leur or à lui/à elle.)',
      'The EN Trigger (DE / DU / DE LA / DES / Numbers): Whenever a quantity or number remains, keep it at the end: "Vous avez des enfants ?" -> "Oui, j’en ai deux !" (Never drop "en" — "*J’ai deux*" is wrong!)',
      'Lock In the Pronoun Order Grid: [me/te/se/nous/vous] -> [le/la/les] -> [lui/leur] -> [y] -> [en] -> VERB. Notice Y and EN always sit closest to the verb!',
      'High-Frequency Idiomatic Locks: Memorize chunks directly — "J’en ai marre" (I’m fed up), "Il s’en fiche" (He doesn’t care), "On y va !" (Let’s go!), "Ça y est !" (Done / That’s it!).',
    ],
    examples: [
      {
        source: 'Tu reviens de Montréal ? / Tu vas à Montréal ?',
        target: 'J’en reviens aujourd’hui, mais j’y retourne le mois prochain.',
        explanation:
          'Coming FROM a place ("de Montréal") uses EN; going TO a place ("à Montréal") uses Y.',
        audioPrompt: 'J’en reviens aujourd’hui, mais j’y retourne le mois prochain.',
      },
      {
        source: 'Combien de billets voulez-vous ?',
        target: 'J’en voudrais trois, s’il vous plaît — j’y tiens beaucoup !',
        explanation:
          'Numbers require "en" before the verb, and "tenir à quelque chose" collapses neatly into "j’y tiens".',
        audioPrompt: 'J’en voudrais trois, s’il vous plaît — j’y tiens beaucoup !',
      },
    ],
    commonPitfall:
      'Answering "Combien de livres as-tu ?" with "*J’ai quatre*" instead of "J’en ai quatre" — French strictly requires "en" whenever a quantified noun is omitted.',
    timeCommitment: '10 mins Q&A substitution drills out loud',
    tags: ['grammar', 'pronouns', 'y-and-en', 'fluency', 'b1'],
  },
  {
    id: 'fr-b1-spoken-french-reductions',
    title: 'Street French Decoded: Chuis, T’as, Ne-Drop & Spoken Contractions',
    languageId: 'french',
    level: 'B1',
    category: 'speaking',
    summary:
      'Textbook French prepares you to read Le Monde, yet real Francophones drop "ne", fuse "je suis" into "chuis", and turn "il y a" into "y a". Master decoding both registers.',
    goldenRule:
      'Understand rapid everyday contractions effortlessly in listening, keep polite standard French in DELF/DALF writing, and deploy selective natural flow (like "on" for "nous") in spoken exams.',
    tactics: [
      'The 95% Spoken Ne-Drop: In casual conversation, "Je ne sais pas" compresses to "Je sais pas" or "Chais pas" [ʃɛ.pa]; "Il n’y a pas" becomes "Y a pas" [ja.pa]. Never drop "ne" in formal writing!',
      'Subject-Verb Fusions: "Je suis" -> "Chuis" [ʃɥi]; "Tu as / Tu es" -> "T’as / T’es" [ta / te]; "Il faut" -> "Faut" [fo]; "Il est" -> "Y est" [jɛ].',
      'Schwa (Mute E) Deletion: Rapid French routinely swallows unstressed "e" inside words — "petit" -> [pti], "maintenant" -> [mɛ̃t.nɑ̃], "semaine" -> [smɛn], "je te le dis" -> "j’te l’dis".',
      'Register Calibration for DELF B1–B2: Use "on" naturally in informal roleplays, avoid heavy slang ("meuf", "kiffer") with examiners, and keep "ne... pas" crisp in formal monologues.',
    ],
    examples: [
      {
        source: 'Written: Je ne sais pas ce qu’il y a. -> Spoken: Chais pas c’qu’y a.',
        target: 'Standard oral: Je ne sais pas ce qu’il y a, mais on va vérifier maintenant.',
        explanation:
          'Recognizing compressed vowels and dropped "ne" unlocks French films, podcasts, and fast everyday dialogues instantly.',
        audioPrompt: 'Je ne sais pas ce qu’il y a, mais on va vérifier maintenant.',
      },
      {
        source: 'Written: Tu as fini ton travail ? -> Spoken: T’as fini ton boulot ?',
        target: 'Tu as déjà fini ton travail ? Super, on y va tout de suite !',
        explanation:
          'Informal "tu as" elides to "t’as" in speech across France and Québec, though it is never spelled "t’as" in formal exams.',
        audioPrompt: 'Tu as déjà fini ton travail ? Super, on y va tout de suite !',
      },
    ],
    commonPitfall:
      'Writing casual spoken contractions ("chuis", "t’as", dropped "ne") inside DELF B1/B2 essays, which triggers automatic grammar-register penalties.',
    timeCommitment: '15 mins/day comparing French podcast audio against native subtitles',
    recommendedTools: [
      {
        name: 'InnerFrench Podcast',
        category: 'podcast',
        url: 'https://innerfrench.com/podcasts/',
        note: 'Natural, clearly articulated intermediate French bridging textbook speech and real street tempo.',
        free: true,
      },
    ],
    tags: ['speaking', 'listening', 'spoken-french', 'ne-drop', 'register', 'b1'],
  },

  // --- B2 LEVEL ---
  {
    id: 'fr-b2-subjonctif-weirdo',
    title: 'Taming the Subjonctif: WEIRDO Triggers & The 10-Second Stem Rule',
    languageId: 'french',
    level: 'B2',
    category: 'grammar',
    summary:
      'The French Subjonctif is not a tense — it is a mood of subjectivity, necessity, emotion, and doubt. Deploying it accurately is the fastest signal of authentic B2/C1 control.',
    goldenRule:
      'Form the Subjonctif stem from the present ILS/ELLES form minus -ent (ils finissent -> finiss- + -e, -es, -e, -ions, -iez, -ent), and deploy it whenever a WEIRDO trigger + QUE introduces a new subject.',
    tactics: [
      'WEIRDO Trigger Checklist: Wishes/Will (vouloir que, souhaiter que), Emotions (être ravi que, regretter que), Impersonal Necessity (il faut que, il est essentiel que), Recommendations (conseiller que), Doubt/Negation (douter que, ne pas penser que), Conjunctions (bien que, pour que, avant que, sans que, à moins que).',
      'Watch the Indicative Trap: "Je pense que" and "Je crois que" express certainty -> INDICATIVE! Only when negated or questioned ("Je ne pense pas que ce soit vrai") do they flip to Subjonctif. Also "espérer que" stays Indicative!',
      'Memorize the Magnificent 7 Irregulars: être (sois/soyons), avoir (aie/ayons), faire (fasse), aller (aille/allions), pouvoir (puisse), savoir (sache), vouloir (veuille/voulions).',
      'Same-Subject Shortcut: Never say "*Je veux que je parte*" — when both clauses share the same subject, collapse to an infinitive ("Je veux partir", "avant de partir", "pour réussir").',
    ],
    examples: [
      {
        source: 'il faut que + faire · bien que + être',
        target: 'Bien que cette réforme soit ambitieuse, il faut que nous fassions preuve de réalisme.',
        explanation:
          'Pairing a concessive Subjonctif ("bien que ... soit") with an obligation Subjonctif ("il faut que ... fassions") immediately elevates DELF B2 essays.',
        audioPrompt: 'Bien que cette réforme soit ambitieuse, il faut que nous fassions preuve de réalisme.',
      },
      {
        source: 'Je pense que (Indicative) vs. Je ne pense pas que (Subjonctif)',
        target: 'Je pense qu’il a raison, mais je ne crois pas qu’il puisse convaincre tout le monde.',
        explanation:
          'Affirmative belief stays Indicative ("a"); negated belief introduces doubt and triggers Subjonctif ("puisse").',
        audioPrompt: 'Je pense qu’il a raison, mais je ne crois pas qu’il puisse convaincre tout le monde.',
      },
    ],
    commonPitfall:
      'Triggering Subjonctif after "après que" (which takes Indicative) or "espérer que" (Indicative), or forgetting Subjonctif after "bien que" and "pour que".',
    timeCommitment: '15 mins crafting 5 DELF B2 debate sentences with WEIRDO triggers daily',
    tags: ['grammar', 'subjonctif', 'weirdo', 'delf-b2', 'b2'],
  },

  // --- C1 LEVEL ---
  {
    id: 'fr-c1-argumentation-connectors',
    title: 'B2/C1 Argumentation Connectors: Architectural Discourse Mastery',
    languageId: 'french',
    level: 'C1',
    category: 'vocabulary',
    summary:
      'French academic and DALF C1 grading prizes Cartesian structure (thèse / antithèse / synthèse) glued together by precise logical connectors — never repetitive "mais", "et", and "donc".',
    goldenRule:
      'Upgrade every basic connector to a precision pair matched to its exact syntax: some take nouns ("malgré"), some take indicative clauses ("en revanche", "néanmoins"), and some demand Subjonctif ("bien que", "quoique").',
    tactics: [
      'Upgrade Opposition & Contrast: Replace "mais" with "en revanche" (on the other hand — balanced contrast), "toutefois / néanmoins" (nevertheless — nuanced caveat), "or" (yet/now — syllogistic pivot), or "tandis que / alors que" (whereas).',
      'Upgrade Concession: Replace "même si" with "bien que + Subjonctif", "quoique + Subjonctif", "malgré + Noun" (NEVER "*malgré que*"), or "en dépit de + Noun".',
      'Upgrade Cause & Consequence: Replace "parce que / donc" with "étant donné que", "puisque" (shared premise), "faute de + Noun", "par conséquent", "d’où + Noun", and "de sorte que".',
      'Deploy Enumeration & Synthesis Spine: "En premier lieu... Par ailleurs... En outre... Force est de constater que... En somme / Tout bien considéré...".',
    ],
    examples: [
      {
        source: 'en revanche · néanmoins · bien que (+ subj.)',
        target: 'Le télétravail accroît l’autonomie ; en revanche, il fragilise la cohésion informelle. Bien qu’il réponde à une attente réelle, il convient néanmoins d’en encadrer les modalités.',
        explanation:
          'Notice how semicolon + "en revanche" contrasts cleanly, while "bien que" + Subjonctif and "néanmoins" build balanced DALF C1 nuance.',
        audioPrompt: 'Le télétravail accroît l’autonomie ; en revanche, il fragilise la cohésion informelle. Bien qu’il réponde à une attente réelle, il convient néanmoins d’en encadrer les modalités.',
      },
      {
        source: 'en dépit de + noun · par conséquent',
        target: 'En dépit des investissements massifs, la fracture numérique persiste ; par conséquent, une médiation humaine demeure indispensable.',
        explanation:
          'Nominalized cause/concession ("en dépit de + noun") keeps C1 prose dense, objective, and authoritative.',
        audioPrompt: 'En dépit des investissements massifs, la fracture numérique persiste ; par conséquent, une médiation humaine demeure indispensable.',
      },
    ],
    commonPitfall:
      'Writing "*malgré que*" (stigmatized in exams — use "bien que" + Subjonctif or "malgré" + noun) or using "par contre" in formal C1 essays instead of "en revanche".',
    timeCommitment: '20 mins rewriting a B1 paragraph into C1 Cartesian prose',
    recommendedTools: [
      {
        name: 'Le Monde — Idées & Débats',
        category: 'reading',
        url: 'https://www.lemonde.fr/idees/',
        note: 'Gold-standard source of authentic C1/C2 argumentation connectors and editorial framing.',
        free: true,
      },
    ],
    tags: ['vocabulary', 'connectors', 'argumentation', 'dalf-c1', 'c1'],
  },

  // --- C2 LEVEL ---
  {
    id: 'fr-c2-synthesis-diplomatic-nuance',
    title: 'DALF C2 Synthesis, Mise en Relief & Diplomatic Nuance',
    languageId: 'french',
    level: 'C2',
    category: 'speaking',
    summary:
      'At DALF C2, linguistic excellence means weaving multiple contradictory dossiers into a seamless synthesis while wielding understatement (litote), syntactic emphasis, and journalistic distancing effortlessly.',
    goldenRule:
      'Never quote source dossiers verbatim in a C1/C2 synthèse: reformulate every argument into concise nominalized concepts, and use the journalistic Conditionnel to attribute unverified claims with diplomatic precision.',
    tactics: [
      'Journalistic & Diplomatic Conditionnel: Use "Cette mesure permettrait de réduire..." or "Selon certains analystes, le modèle atteindrait ses limites" to hedge claims and distinguish evidence from speculation.',
      'French Litote (Strategic Understatement): Native C2 persuasion prefers "Ce dispositif n’est pas sans poser problème" or "Il n’est pas exclu que cette approche s’avère contre-productive" over blunt absolutes.',
      'Syntactic Mise en Relief & Inversion: Emphasize key theses via cleft structures ("Ce qui frappe avant tout, c’est...", "C’est précisément dans cette tension que réside l’enjeu") and literary/formal inversion after "aussi", "ainsi", "encore", "peut-être" ("Aussi convient-il d’interroger...").',
      'Reformulation Grid for Synthèse de Documents: Convert verbs into abstract nouns ("Les jeunes quittent les campagnes" -> "L’exode rural des jeunes générations") to compress 1,500 words of dossier text into razor-sharp thematic axes.',
    ],
    examples: [
      {
        source: 'Mise en relief + Diplomatic Inversion',
        target: 'Ce qui mérite d’être nuancé, c’est l’idée d’un progrès purement linéaire ; aussi convient-il d’examiner les effets collatéraux d’une telle mutation.',
        explanation:
          'Starting a clause with "aussi" meaning "therefore" triggers subject-verb inversion ("aussi convient-il"), an unmistakable marker of DALF C2 mastery.',
        audioPrompt: 'Ce qui mérite d’être nuancé, c’est l’idée d’un progrès purement linéaire ; aussi convient-il d’examiner les effets collatéraux d’une telle mutation.',
      },
      {
        source: 'Litote + Conditionnel journalistique',
        target: 'Une régulation excessive ne serait pas sans freiner l’innovation, quand bien même elle répondrait à un impératif éthique légitime.',
        explanation:
          '"Ne serait pas sans + infinitive" combined with "quand bien même + Conditionnel" delivers razor-sharp diplomatic precision.',
        audioPrompt: 'Une régulation excessive ne serait pas sans freiner l’innovation, quand bien même elle répondrait à un impératif éthique légitime.',
      },
    ],
    commonPitfall:
      'Lifting whole phrases from source articles during a DALF C1/C2 synthèse or inserting personal opinion inside the objective synthesis section instead of saving your stance for the essai argumenté.',
    timeCommitment: '25 mins/day summarizing two Francophone editorials in 150 reformulated words',
    recommendedTools: [
      {
        name: 'France Culture — Débats & Essais',
        category: 'audio',
        url: 'https://www.radiofrance.fr/franceculture',
        note: 'Premier C2 audio resource for intellectual debates, rhetorical nuance, and academic registers.',
        free: true,
      },
    ],
    tags: ['speaking', 'writing', 'dalf-c2', 'synthesis', 'diplomatic-nuance', 'c2'],
  },
];
