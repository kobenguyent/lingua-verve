import { TipItem } from '../../types';

export const JAPANESE_TIPS: TipItem[] = [
  // --- A1 LEVEL ---
  {
    id: 'ja-a1-mora-kana',
    title: 'Mora Timing & Kana Mastery: Long Vowels and the Small っ Pause',
    languageId: 'japanese',
    level: 'A1',
    category: 'pronunciation',
    diagramType: 'mouth-phonetics',
    summary:
      'Japanese is neither stress-timed like English nor syllable-timed like Spanish — it is mora-timed. Every kana beat (including long vowels, the syllabic nasal ん, and the small っ pause) takes one equal metronome tick, and mistiming a single beat completely changes the word.',
    goldenRule:
      'Count every hiragana/katakana character as one equal musical beat — hold long vowels for two full beats and freeze your mouth for one silent beat on small っ (sokuon).',
    tactics: [
      'Master Hiragana first (for grammar, particles, and native words) and Katakana second (for loanwords, menus, and emphasis) within 10–14 days using spaced visual mnemonics — abandon romaji immediately once kana are learned.',
      'Hold long vowels cleanly for 2 beats: おばさん (o-ba-sa-n, 4 morae = aunt) vs. おばあさん (o-ba-a-sa-n, 5 morae = grandmother); ビル (bi-ru = building) vs. ビール (bi-i-ru = beer).',
      'Treat small っ / ッ as a full silent beat before the next consonant: きて (ki-te, 2 beats = come) vs. きって (ki-[pause]-te, 3 beats = postage stamp).',
      'Recognize vowel devoicing in natural Tokyo speech: /i/ and /u/ become whispered between voiceless consonants or at sentence end (です sounds like "des", しました like "shimashita" with silent i).',
    ],
    examples: [
      {
        source: 'おばさん (o-ba-sa-n, 4 beats) vs. おばあさん (o-ba-a-sa-n, 5 beats)',
        target: 'aunt vs. grandmother',
        explanation:
          'Adding one extra あ doubles the vowel length and shifts the meaning completely. Tap your desk once per kana beat to feel the difference.',
        audioPrompt: 'おばさん。おばあさん。きって。きて。',
      },
      {
        source: 'きって (ki-t-te, 3 beats) vs. きて (ki-te, 2 beats)',
        target: 'postage stamp vs. please come (te-form of 来る)',
        explanation:
          'Small っ creates a clean geminate stop (holding the "t" closure for one full mora before releasing it).',
        audioPrompt: 'きってを買いました。ここへきてください。',
      },
      {
        source: '東京 (とうきょう · to-u-kyo-u = 4 morae)',
        target: 'Tokyo (pronounced tō-kyō, not "toh-kee-yoh")',
        explanation:
          'Small ゃ/ゅ/ょ combine with the preceding consonant into ONE mora (きょ = 1 beat), while the trailing う lengthens the vowel to a second beat (きょう = 2 beats).',
      },
    ],
    commonPitfall:
      'Reading Japanese through English stress habits — shortening long vowels (calling a grandmother "obasan"), ignoring small っ, or inserting English diphthongs into pure five-vowel Japanese (a, i, u, e, o).',
    timeCommitment: '15 mins/day kana recall + metronome mora clapping',
    tags: ['pronunciation', 'hiragana', 'katakana', 'mora-timing', 'phonetics'],
    recommendedTools: [
      {
        name: 'NHK World Easy Japanese',
        category: 'audio',
        url: 'https://www.nhk.or.jp/lesson/en/',
        note: 'Free studio-recorded Japanese lessons with kana charts and clear Tokyo pronunciation.',
        free: true,
      },
    ],
  },
  {
    id: 'ja-a1-pitch-accent',
    title: 'Tokyo Pitch Accent Decoded: High vs. Low Melody (はし · あめ)',
    languageId: 'japanese',
    level: 'A1',
    category: 'pronunciation',
    summary:
      'Japanese does not use English loud volume stress; instead, Tokyo Standard Japanese uses a binary High (H) / Low (L) pitch contour. Where the pitch drops (the downstep ꜜ) distinguishes everyday homophones like chopsticks vs. bridge and rain vs. candy.',
    goldenRule:
      'In Standard Tokyo Japanese, mora 1 and mora 2 ALWAYS have opposite pitch (L→H or H→L), and once pitch drops after a downstep (ꜜ), it never rises again inside the same word.',
    tactics: [
      'Memorize the 4 Tokyo pitch patterns: Heiban (平版 L-H-H-H, flat high even onto the particle), Atamadaka (頭高 H-L-L, drops after mora 1), Nakadaka (中高 L-H-L, drops in the middle), and Odaka (尾高 L-H-H-L, drops right after the final mora onto the particle).',
      'Always test a noun with a following particle like が (ga) so you can hear Heiban vs. Odaka: はし (bridge, Odaka) = はしꜜが (L-H-L), while はし (edge, Heiban) = はしが (L-H-H).',
      'Drill classic minimal pairs aloud: はꜜし (H-L = chopsticks) vs. はしꜜ (L-H-[L] = bridge); あꜜめ (H-L = rain) vs. あめ (L-H-[H] = candy); かꜜみ (H-L = god) vs. かみꜜ (L-H-[L] = paper/hair).',
      'Shadow short native audio clips and draw pitch lines (Low/High step diagrams) above tricky vocabulary instead of pushing volume louder on accented syllables.',
    ],
    examples: [
      {
        source: 'はꜜし (HA-shi · H-L) vs. はしꜜ (ha-SHI · L-H + low が)',
        target: '箸 (chopsticks) vs. 橋 (bridge)',
        explanation:
          'Atamadaka drops immediately after mora 1 (chopsticks); Odaka rises on mora 2 and drops onto the following particle が (bridge).',
        audioPrompt: 'はしで食べます。はしを渡ります。',
      },
      {
        source: 'あꜜめ (A-me · H-L) vs. あめ (a-ME · L-H + high が)',
        target: '雨 (rain) vs. 飴 (candy)',
        explanation:
          'Rain starts high and drops sharply on め; candy starts low, rises on め, and stays high on the particle が (Heiban).',
        audioPrompt: 'あめが降っています。あめを食べます。',
      },
    ],
    commonPitfall:
      'Applying English loudness/vowel-lengthening stress to Japanese words (saying "arigATOOO") instead of clean, flat pitch steps.',
    timeCommitment: '10 mins/day shadowing with pitch-accent lookup',
    tags: ['pronunciation', 'pitch-accent', 'tokyo-japanese', 'listening'],
    recommendedTools: [
      {
        name: 'OJAD (Online Japanese Accent Dictionary)',
        category: 'tool',
        url: 'https://www.gavo.t.u-tokyo.ac.jp/ojad/',
        note: 'University of Tokyo pitch-accent lookup tool with conjugations and native audio.',
        free: true,
      },
    ],
  },
  {
    id: 'ja-a1-wa-vs-ga',
    title: 'The は (Wa) vs. が (Ga) Blueprint: Topic Spotlight vs. Subject Laser',
    languageId: 'japanese',
    level: 'A1',
    category: 'grammar',
    summary:
      'The #1 confusion for learners of Japanese is why both は (pronounced "wa") and が seem to translate as the English subject. They solve two completely different discourse jobs: は sets the stage ("As for X..."), while が shines a spotlight on the exact actor or new information ("It is X that...").',
    goldenRule:
      'Use は to announce what we are talking about (known topic or contrast) and shift focus to what comes AFTER it; use が to pinpoint WHO/WHAT does the action (new information, question words, and subordinate clauses).',
    tactics: [
      'Topic vs. Spotlight test: 「田中さんは学生です」(As for Tanaka, he is a student — new info is "student") vs. 「田中さんが学生です」(TANAKA is the one who is the student — new info is "Tanaka").',
      'Question words (だれ, なに, どこ, どれ) ALWAYS take が, never は: 「だれが来ましたか」(Who came?) → 「山田さんが来ました」(Yamada came).',
      'Use が with innate preference, ability, and existence predicates: 好き (like), ほしい (want), わかる (understand), できる (can do), ある/いる (exist) — e.g., 「日本語がわかります」.',
      'Use は to draw a crisp contrast between two items: 「コーヒーは飲みますが、紅茶は飲みません」(I drink coffee, [contrast] but I do not drink black tea).',
    ],
    examples: [
      {
        source: '私は寿司が好きです。(Watashi wa sushi ga suki desu.)',
        target: 'As for me (topic), sushi (spotlight/object of liking) is liked.',
        explanation:
          'は frames the speaker as the topic; が marks the target of the adjectival predicate 好きです.',
        audioPrompt: '私は寿司が好きです。',
      },
      {
        source: '昨日、雨が降りました。(Kinō, ame ga furimashita.)',
        target: 'Yesterday, it rained (neutral observation of an event).',
        explanation:
          'Freshly observed phenomena (weather, arrivals, sudden events) take が rather than は.',
        audioPrompt: '昨日、雨が降りました。',
      },
    ],
    commonPitfall:
      'Saying *"だれは来ましたか"* (incorrect — interrogatives cannot be known topics) or dropping が for は inside subordinate clauses like 「雨が降ったら」.',
    timeCommitment: '10 mins/day contrasting は/が sentence pairs',
    tags: ['grammar', 'particles', 'wa-vs-ga', 'discourse'],
  },

  // --- A2 LEVEL ---
  {
    id: 'ja-a2-sov-particles',
    title: 'SOV Architecture & The 6 Core Particle Anchors (を・に・で・へ・から・まで)',
    languageId: 'japanese',
    level: 'A2',
    category: 'grammar',
    summary:
      'Japanese is strictly verb-final (Subject–Object–Verb): every noun phrase carries a postpositional particle glued to its tail that locks in its grammatical role, allowing flexible word order as long as the verb anchors the very end.',
    goldenRule:
      'Particles attach AFTER the noun they label — think of them as role-tags (を = direct target, に = destination/exact time/static location, で = action stage/tool) that orbit the sentence-final verb.',
    tactics: [
      'Master the classic に vs. で location split: に marks WHERE something statically exists or ends up (東京に住んでいます / 机の上にあります), while で marks the STAGE where an action happens (図書館で勉強します).',
      'Use を (pronounced "o") for direct objects of transitive actions (水を飲みます) AND for traversal through spaces (公園を散歩します, 橋を渡ります).',
      'Contrast へ (directional heading: 京都へ行きます — toward Kyoto) with に (arrival target or specific clock time: 7時に着きます, 駅に着きます).',
      'Pair から (starting point in time or space: 9時から / 東京から) with まで (endpoint: 5時まで / 大阪まで) to frame any schedule or route cleanly.',
    ],
    examples: [
      {
        source: '毎朝7時に家でコーヒーを飲みます。(Maiasa shichi-ji ni ie de kōhī o nomimasu.)',
        target: 'Every morning at 7:00, I drink coffee at home.',
        explanation:
          '7時に (specific time = に), 家で (action location = で), コーヒーを (direct object = を), 飲みます (verb strictly last).',
        audioPrompt: '毎朝七時に家でコーヒーを飲みます。',
      },
      {
        source: '東京から新幹線で京都へ行きます。(Tōkyō kara Shinkansen de Kyōto e ikimasu.)',
        target: 'I go from Tokyo to Kyoto by Shinkansen.',
        explanation:
          'から = origin, で = means of transport/instrument, へ = direction of travel.',
        audioPrompt: '東京から新幹線で京都へ行きます。',
      },
    ],
    commonPitfall:
      'Using に instead of で for actions (*"カフェに勉強します"* — wrong; studying is an action taking place AT the café, so it MUST be 「カフェで勉強します」).',
    timeCommitment: '15 mins/day particle cloze drills',
    tags: ['grammar', 'sov', 'particles', 'ni-vs-de', 'sentence-order'],
  },
  {
    id: 'ja-a2-verb-groups-te-form',
    title: 'The 3 Verb Groups & The Te-Form Song Hack',
    languageId: 'japanese',
    level: 'A2',
    category: 'grammar',
    summary:
      'Every Japanese verb belongs to one of just three groups: Ichidan (Ru-verbs), Godan (U-verbs), or the tiny Irregular pair (する / 来る). Unlocking the Te-Form gives you instant access to polite requests (〜てください), ongoing actions (〜ています), permissions (〜てもいい), and chaining clauses.',
    goldenRule:
      'Ichidan verbs simply drop る and add て; Godan verbs follow five sound-blending endings — memorize the Te-Form chant once and every て/た conjugation becomes automatic forever.',
    tactics: [
      'Group 1 (Ichidan / Ru-verbs): ends in -iru or -eru (食べる → 食べて, 見る → 見て). Drop る, attach て. Watch common "impostor" Godan verbs that look like Ichidan: 帰る (帰って), 走る (走って), 知る (知って), 入る (入って).',
      'Group 2 (Godan / U-verbs) Te-Form chant (to the tune of "Oh My Darling, Clementine"): 「う・つ・る → って」(買う→買って, 待つ→待って, 取る→取って) · 「む・ぶ・ぬ → んで」(読む→読んで, 遊ぶ→遊んで, 死ぬ→死んで) · 「く → いて」(書く→書いて) · 「ぐ → いで」(泳ぐ→泳いで) · 「す → して」(話す→話して).',
      'Memorize the ONE Godan exception: 行く (いく = to go) becomes 行って (いって), never *行いて.',
      'Group 3 (Only TWO irregular verbs in all of Japanese!): する → して, 来る (くる) → 来て (きて). Swap て→た and で→だ to get the entire past plain た-form for free!',
    ],
    examples: [
      {
        source: '窓を開けて、静かに本を読んでください。(Mado o akete, shizuka ni hon o yonde kudasai.)',
        target: 'Please open the window and read your book quietly.',
        explanation:
          '開ける (Ichidan) → 開けて chains the first action; 読む (Godan -む) → 読んで + ください forms the polite request.',
        audioPrompt: '窓を開けて、静かに本を読んでください。',
      },
      {
        source: '今、駅へ向かって歩いています。(Ima, eki e mukatte aruite imasu.)',
        target: 'Right now, I am walking toward the station.',
        explanation:
          '向かう (-う → って) and 歩く (-く → いて) combine with います to express ongoing action.',
        audioPrompt: '今、駅へ向かって歩いています。',
      },
    ],
    commonPitfall:
      'Conjugating 帰る (kaeru, to return home) as Ichidan *"帰て"* instead of Godan 「帰って」, or forgetting that 行く becomes 「行って」.',
    timeCommitment: '10 mins/day rapid-fire Te-Form & Ta-Form drills',
    tags: ['grammar', 'verbs', 'te-form', 'godan', 'ichidan'],
  },

  // --- B1 LEVEL ---
  {
    id: 'ja-b1-kanji-radicals-readings',
    title: 'Kanji Architecture: Radicals, Semantic Clues & On’yomi vs. Kun’yomi Strategy',
    languageId: 'japanese',
    level: 'B1',
    category: 'vocabulary',
    summary:
      'Do not brute-force 2,136 Jōyō kanji as random stroke paintings. Over 80% of kanji are phono-semantic compounds combining a meaning radical (部首) and a sound component, and a simple structural rule predicts whether to use Chinese-derived On’yomi or native Japanese Kun’yomi.',
    goldenRule:
      'Kanji paired with other kanji in a compound (熟語) usually take On’yomi (e.g., 電車 デンシャ); a standalone kanji or kanji + trailing hiragana (okurigana) usually takes Kun’yomi (e.g., 車 くるま, 食べる たべる).',
    tactics: [
      'Learn the 50 highest-frequency radicals first: 氵(water: 海, 泳, 洗), 亻(person: 休, 働, 作), 訁(speech: 語, 話, 読), 扌(hand: 持, 押, 払), ⻌(road/motion: 道, 近, 運).',
      'Exploit phonetic families to unlock 5+ kanji at once: 青 (セイ) predicts 清 (セイ, pure), 晴 (セイ, clear weather), 精 (セイ, spirit), and 静 (セイ, quiet).',
      'Never memorize isolated kanji reading lists in a vacuum — learn every reading inside two real high-frequency words (e.g., 生 via 生活 せいかつ, 生きる いきる, 生まれる うまれる).',
      'Watch okurigana clues: trailing hiragana immediately tells you which native Kun’yomi verb or adjective is active (高い たかい vs. 高校 こうこう).',
    ],
    examples: [
      {
        source: '水 (みず · Kun) vs. 水道 (すいどう · On) vs. 水曜日 (すいようび · On)',
        target: 'water (standalone) vs. water supply / Wednesday (compounds)',
        explanation:
          'Standing alone, 水 uses native Kun’yomi (みず). Locked inside multi-kanji compounds, it shifts to On’yomi (スイ).',
        audioPrompt: '冷たい水を飲みます。水曜日に水道を修理します。',
      },
      {
        source: '食べる (たべる · Kun + okurigana) vs. 食堂 (しょくどう · On compound)',
        target: 'to eat vs. cafeteria / dining hall',
        explanation:
          'Okurigana べる signals Kun’yomi た-; the two-kanji compound 食堂 uses On’yomi ショク + ドウ.',
        audioPrompt: '毎日、大学の食堂で昼ごはんを食べます。',
      },
    ],
    commonPitfall:
      'Grinding endless isolated kanji stroke drills without real vocabulary context, causing learners to recognize a character visually but freeze when reading compounds aloud.',
    timeCommitment: '20 mins/day SRS vocabulary-in-context kanji review',
    tags: ['vocabulary', 'kanji', 'radicals', 'onyomi', 'kunyomi'],
    recommendedTools: [
      {
        name: 'Jisho.org Kanji & Radical Dictionary',
        category: 'tool',
        url: 'https://jisho.org',
        note: 'Instant radical decomposition, JLPT level tagging, and example sentence lookup.',
        free: true,
      },
    ],
  },
  {
    id: 'ja-b1-polite-vs-plain',
    title: 'Register Switching: Polite です/ます vs. Plain Short Forms',
    languageId: 'japanese',
    level: 'B1',
    category: 'speaking',
    summary:
      'Plain forms (普通形 — dictionary, ない, た, なかった) are NOT just for talking casually with friends; they are the grammatical engine inside almost every intermediate sentence (quoting, noun modification, 〜と思う, 〜から, 〜前に, 〜ことがある).',
    goldenRule:
      'In Japanese, politeness lives ONLY at the final predicate of the sentence — everything embedded inside subordinate clauses and relative modifiers drops into Plain Form.',
    tactics: [
      'Master the 4-way Plain Grid across all word classes: Verbs (行く / 行かない / 行った / 行かなかった), い-adjectives (高い / 高くない / 高かった / 高くなかった), and な-adjectives & Nouns (静かだ / 静かじゃない / 静かだった / 静かじゃなかった).',
      'Use Plain Form before 〜と思います (I think), 〜と言いました (said), 〜んです (explanatory), and relative noun clauses: 「昨日買った本は面白いです」(The book I bought yesterday is interesting — NEVER *"買いました本"*).',
      'Calibrate social distance: use です/ます with strangers, colleagues, elders, and teachers; switch to Plain Form with close friends, younger family members, and inner monologue.',
      'Soften casual speech with natural sentence-final particles: ね (shared agreement), よ (helpful new info), よね (seeking confirmation), and かな (wondering aloud).',
    ],
    examples: [
      {
        source: '明日は雨が降ると思います。(Ashita wa ame ga furu to omoimasu.)',
        target: 'I think it will rain tomorrow.',
        explanation:
          'Even though the overall sentence is polite (思います), the embedded verb before と思います MUST be plain form (降る, not *降ります*).',
        audioPrompt: '明日は雨が降ると思います。',
      },
      {
        source: 'Polite: 週末、映画を見に行きました。 ↔ Casual: 週末、映画を見に行ったよ。',
        target: 'I went to see a movie on the weekend.',
        explanation:
          'Same meaning, different social register: 行きました shifts to plain past 行った plus friendly particle よ.',
        audioPrompt: '週末、映画を見に行きました。週末、映画を見に行ったよ。',
      },
    ],
    commonPitfall:
      'Placing polite ます/です inside relative clauses or before と思う (e.g., *"東京へ行きますと思います"* instead of 「東京へ行くと思います」).',
    timeCommitment: '10 mins/day converting polite news sentences into plain speech and back',
    tags: ['speaking', 'register', 'plain-form', 'desu-masu', 'jlpt-n3'],
  },

  // --- B2 LEVEL ---
  {
    id: 'ja-b2-transitive-intransitive',
    title: 'Transitive vs. Intransitive Verb Pairs (他動詞 vs. 自動詞): Control vs. State',
    languageId: 'japanese',
    level: 'B2',
    category: 'grammar',
    summary:
      'Japanese systematically separates actions caused by an agent (Transitive 他動詞 + を) from spontaneous events or states happening on their own (Intransitive 自動詞 + が). Mastering these pairs unlocks natural JLPT N2–N1 descriptions and eliminates clunky English-style passives.',
    goldenRule:
      'Ask: "Am I highlighting someone doing it (を + Transitive) or simply what happened / its resulting state (が + Intransitive)?" — and watch the -aru (intransitive) vs. -eru (transitive) suffix clue.',
    tactics: [
      'Spot the high-yield sound pattern — verbs ending in -aru are overwhelmingly INTRANSITIVE, while their -eru twins are TRANSITIVE: 決まる/決める (be decided / decide), 始まる/始める (begin / start something), 止まる/止める (stop / stop something), 変わる/変える (change / alter).',
      'Spot the -su rule: any pair member ending in -す is ALWAYS TRANSITIVE: 消える/消す (go out / turn off), 出る/出す (exit / take out), 壊れる/壊す (break / smash), 直る/直す (be fixed / repair).',
      'Pair Intransitive + ている to describe visible states ("The door is open" = ドアが開いています), and Transitive + てある to imply someone deliberately prepared it ("The window has been left open on purpose" = 窓が開けてあります).',
      'Remember Japanese cultural preference for intransitive framing when reporting mishaps objectively: 「財布が見つかりました」(My wallet turned up) or 「パソコンが壊れてしまいました」(My PC broke on me).',
    ],
    examples: [
      {
        source: '私が窓を開けました。(Transitive) ↔ 風で窓が開きました。(Intransitive)',
        target: 'I opened the window. ↔ The window opened in the wind.',
        explanation:
          '開ける takes direct object を with an intentional agent; 開く takes が when the window opens on its own.',
        audioPrompt: '私が窓を開けました。風で窓が開きました。',
      },
      {
        source: '会議の日程が決まりました。 / 部長が日程を決めました。',
        target: 'The meeting date has been decided. / The department head decided the date.',
        explanation:
          '-aru (決まる + が) reports the outcome objectively; -eru (決める + を) spotlights the decision-maker.',
        audioPrompt: '会議の日程が決まりました。部長が日程を決めました。',
      },
    ],
    commonPitfall:
      'Mixing particle を with an intransitive verb (*"ドアを開いています"*) or describing a visible state with transitive 〜ている (*"窓が開けています"* instead of 「窓が開いています」 or 「窓が開けてあります」).',
    timeCommitment: '15 mins/day drilling 5 pairs inside contrasting が/を sentences',
    tags: ['grammar', 'transitive', 'intransitive', 'jlpt-n2', 'verbs'],
  },

  // --- C1 LEVEL ---
  {
    id: 'ja-c1-giving-receiving-verbs',
    title: 'Giving & Receiving Perspective Engine: あげる・くれる・もらう & Directional Favors',
    languageId: 'japanese',
    level: 'C1',
    category: 'speaking',
    summary:
      'Japanese encodes social empathy and directionality directly into its verbs of giving and receiving. Choosing between あげる, くれる, and もらう — plus their benefactive extensions 〜てあげる, 〜てくれる, 〜てもらう and honorific equivalents — shows whose perspective you stand in.',
    goldenRule:
      'Every transaction has a compass anchored to your inner circle (ウチ = me / my family / my team): OUTWARD from me = あげる, INWARD toward me = くれる, RECEIVED by me = もらう.',
    tactics: [
      'Never use あげる when someone gives something TO YOU — inward gifts/favors toward the speaker or the speaker’s in-group MUST use くれる (友だちが駅まで送ってくれた = My friend kindly drove me to the station).',
      'Contrast くれる vs. もらう by who is the subject: 「先輩が教えてくれた」(My senior kindly taught me — highlights their generosity) vs. 「先輩に教えてもらった」(I had my senior teach me — highlights my gratitude/request).',
      'Upgrade seamlessly to C1 business/honorific forms: あげる → 差し上げる (humble, to superior), くれる → くださる (respectful, from superior), もらう → いただく (humble, receiving from superior: 「ご確認いただきありがとうございます」).',
      'Be socially cautious with 〜てあげる toward superiors or acquaintances: saying 「手伝ってあげます」 can sound condescending ("I’ll do you the favor of helping") — use 「お手伝いしましょうか」 or 「お手伝いいたします」 instead!',
    ],
    examples: [
      {
        source: '部長が資料を修正してくださいました。(Buchō ga shiryō o shūsei shite kudasaimashita.)',
        target: 'The department manager kindly revised the document for me/us.',
        explanation:
          'くださる (honorific twin of くれる) places the superior as subject performing a gracious inward action.',
        audioPrompt: '部長が資料を修正してくださいました。',
      },
      {
        source: 'お忙しいところ、お時間をいただきありがとうございます。',
        target: 'Thank you very much for generously giving me your time despite your busy schedule.',
        explanation:
          'いただく (humble twin of もらう) expresses gratitude from the receiver’s perspective — indispensable in JLPT N1 and BJT business Japanese.',
        audioPrompt: 'お忙しいところ、お時間をいただきありがとうございます。',
      },
    ],
    commonPitfall:
      'Using あげる toward yourself (*"先生が本を私にあげました"* — ungrammatical; must be 「先生が本をくださいました / くれました」) or offering help to a boss with 〜てあげます.',
    timeCommitment: '15 mins/day workplace roleplay rewriting perspective shifts',
    tags: ['speaking', 'giving-receiving', 'benefactive', 'honorifics', 'jlpt-n1'],
  },

  // --- C2 LEVEL ---
  {
    id: 'ja-c2-keigo-n1-discourse',
    title: 'The 3-Tier Keigo Architecture & N1/C2 Formal Discourse Patterns',
    languageId: 'japanese',
    level: 'C2',
    category: 'grammar',
    summary:
      'True executive and academic mastery in Japanese fuses two pillars: the 3-tier Keigo system (尊敬語 respectful, 謙譲語 humble, 丁寧語 polite) calibrated to Uchi/Soto (in-group vs. out-group) boundaries, and crisp N1/C2 formal discourse grammar (〜ざるを得ない, 〜に伴って, 〜をもって) used in whitepapers, diplomacy, and boardrooms.',
    goldenRule:
      'Elevate the OTHER person’s actions with 尊敬語, lower YOUR OWN (and your company’s!) actions with 謙譲語 when speaking to outsiders, and anchor formal logic with concise N1 nominalized structures.',
    tactics: [
      'Master the core irregular Keigo triples: 行く/来る (尊敬: いらっしゃる / 謙譲: 参る), 見る (ご覧になる / 拝見する), 言う (おっしゃる / 申す・申し上げる), 食べる/飲む (召し上がる / いただく), 知っている (ご存じだ / 存じております).',
      'Apply the Uchi/Soto flip ruthlessly: inside your office you use 尊敬語 for your CEO, but when speaking to an EXTERNAL client, your CEO becomes Uchi (in-group) and takes 謙譲語: 「社長の佐藤はただいま外出しております」.',
      'Deploy high-precision N1/C2 logical connectors: 〜ざるを得ない (cannot help but / have no choice but to), 〜に伴って (accompanying / in tandem with), 〜を余儀なくされる (be forced into), and 〜をもって (by means of / effective as of).',
      'Eliminate "double keigo" (二重敬語) mistakes such as *"おっしゃられる"* (use おっしゃる) or *"ご覧になられる"* (use ご覧になる) to pass BJT J1+ and executive communication reviews cleanly.',
    ],
    examples: [
      {
        source: '市場環境の急変に伴い、当初の計画を見直さざるを得ない状況に至りました。',
        target:
          'Accompanying the sudden shift in market conditions, we have reached a situation where we have no choice but to revise our original plan.',
        explanation:
          'Combines formal 〜に伴い (〜に伴って), 〜ざるを得ない (unavoidable necessity), and elevated verb 至る (reach a point).',
        audioPrompt: '市場環境の急変に伴い、当初の計画を見直さざるを得ない状況に至りました。',
      },
      {
        source: '先ほどお送りいただいた企画書を拝見いたしました。明日までにご連絡申し上げます。',
        target:
          'I have humbly reviewed the proposal you kindly sent earlier. I shall report back to you by tomorrow.',
        explanation:
          'Clean humble Keigo (拝見いたしました, 申し上げます) paired with respectful prefix ご/お on the client’s items — zero double-keigo errors.',
        audioPrompt: '先ほどお送りいただいた企画書を拝見いたしました。明日までにご連絡申し上げます。',
      },
    ],
    commonPitfall:
      'Using respectful 尊敬語 for your own boss when talking to a client (*"部長はいらっしゃいません"* — wrong; say 「部長は席を外しております」) or stacking double honorifics like *"お越しになられる"*.',
    timeCommitment: '20 mins/day executive email rewriting & Nikkei editorial shadowing',
    tags: ['grammar', 'keigo', 'jlpt-n1', 'bjt', 'formal-discourse'],
    recommendedTools: [
      {
        name: 'BJT Business Japanese Proficiency Test Official Guide',
        category: 'reading',
        url: 'https://www.kanken.or.jp/bjt/english/',
        note: 'Official corporate Japanese testing framework covering executive keigo and high-context diplomacy.',
        free: true,
      },
    ],
  },
];
