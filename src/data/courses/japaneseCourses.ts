import { IntensiveCourse } from '../../types';

export const JAPANESE_INTENSIVE_COURSES: IntensiveCourse[] = [
  // =====================================================================
  // A1 (JLPT N5) · STAGE 1: ZERO TO SURVIVAL
  // =====================================================================
  {
    id: 'ja-intensive-a1',
    languageId: 'japanese',
    level: 'A1',
    title: 'Japanese A1 / JLPT N5 Zero-to-Survival Launchpad',
    subtitle:
      'Decode Hiragana, Katakana, mora rhythm, foundational particles (は・が・を・に・で), polite です/ます verbs, and essential Te-form survival requests.',
    heroRole: 'Stage 1 · Zero to Survival (JLPT N5)',
    durationWeeks: 8,
    dailyHours: '1.5–2.0 hrs/day (Intensive)',
    targetCertificates: ['JLPT N5 (CEFR A1)', 'JF Standard A1 (IRODORI Starter)'],
    passingCriteria: 'JLPT N5 scaled score ≥ 80/180 (min 38/120 Language Knowledge & Reading, 19/60 Listening) + 4-skill survival output.',
    examBlueprint: {
      reading: '50 mins · Kana & ~100 basic kanji recognition, short notices, café signs, schedules, and 120-character emails.',
      listening: '30 mins · Slow, clear Tokyo everyday dialogues on prices, train times, shopping, and simple requests.',
      writing: '25 mins · Clean kana/basic kanji short messages, self-introductions, and daily routine paragraphs (60–120 chars).',
      speaking: '8 mins · Self-introduction, ordering food, asking directions, and polite survival requests with 〜てください.',
    },
    referenceIds: ['ref-ja-jlpt-n5n4', 'ref-ja-jlpt-hub', 'ref-ja-irodori', 'ref-ja-nhk'],
    modules: [
      {
        id: 'ja-a1-m1',
        weekLabel: 'Weeks 1–2 · Sound & Script',
        title: 'Hiragana, Katakana, Mora Timing & First Introductions',
        focusSkills: ['listening', 'speaking'],
        summary:
          'Lock in equal-beat mora timing (long vowels & small っ), read Hiragana and Katakana effortlessly, and introduce yourself politely with は・です・か.',
        objectives: [
          'Read and write core Hiragana/Katakana syllables including voiced (だ/ば/ぱ) and contracted (きゃ/しょ) sounds.',
          'Introduce your name, nationality, and occupation naturally with 「はじめまして。〜と申します / 〜です」.',
          'Form polite affirmative, negative (じゃありません), and yes/no questions (か).',
        ],
        grammarCheckpoints: ['Topic particle は (wa) & copula です', 'Negative じゃありません & Question marker か', 'Possessive/linking particle の (N1 の N2)'],
        keyVocabulary: ['はじめまして', '学生', '会社員', '日本語', 'よろしくおねがいします'],
        drills: [
          {
            skill: 'listening',
            title: 'Mora & Self-Introduction Ear Drill',
            instruction: 'Listen carefully for long vowels and capture the speaker’s name, country, and job.',
            durationMins: 15,
            audioScript: 'はじめまして。エマです。カナダから来ました。東京の会社員です。どうぞよろしくおねがいします。',
          },
          {
            skill: 'speaking',
            title: '45-Second Polite Self-Introduction',
            instruction: 'Introduce your name, country, current city, occupation, and closing greeting with even mora timing.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Record or write a polite Japanese self-introduction covering your name, country, occupation, and a polite closing.',
        lesson: {
          estimatedMins: 30,
          overview:
            'Build clean Tokyo Japanese pronunciation from day one by mastering mora-timed kana reading and the foundational 「X は Y です」 sentence frame.',
          sections: [
            {
              id: 'ja-a1-m1-s1',
              heading: 'The Core Identity Frame: X は Y です / じゃありません / か',
              explanation:
                'Japanese places the copula です at the very end of the sentence. Particle は (written ha, pronounced "wa") marks the topic ("As for X"). Add か at the end to turn any statement into a question — no word-order flip needed!',
              formula: '[Topic] は [Noun] です (is)  |  じゃありません (is not)  |  〜ですか (is it ~?)',
              examples: [
                {
                  target: '私はカナダの会社員です。',
                  translation: 'I am an office worker from Canada.',
                  highlight: 'は ... の ... です',
                },
                {
                  target: '田中さんは学生ですか。— いいえ、学生じゃありません。先生です。',
                  translation: 'Is Tanaka a student? — No, he is not a student. He is a teacher.',
                  highlight: 'ですか / じゃありません',
                },
              ],
              proTip:
                'Never add a question mark AND drop か in polite Japanese; in standard writing, か already functions as the spoken question marker.',
            },
            {
              id: 'ja-a1-m1-s2',
              heading: 'Mora Rhythm, Long Vowels & Particle の',
              explanation:
                'Every kana counts as one equal beat (mora): おばあさん (5 beats, grandmother) vs. おばさん (4 beats, aunt). Meanwhile, particle の connects two nouns from general to specific: 「日本語の先生」(Japanese-language teacher).',
              formula: 'Noun 1 (modifier) + の + Noun 2 (main noun)',
              examples: [
                {
                  target: 'さくら大学の日本語の学生です。',
                  translation: 'I am a Japanese-language student at Sakura University.',
                  highlight: 'の ... の',
                },
                {
                  target: 'これは私のコーヒーです。',
                  translation: 'This is my coffee. (Hold コー and ヒー for 2 beats each!)',
                  highlight: '私のコーヒー',
                },
              ],
              proTip:
                'When reading Katakana loanwords, the dash ー always extends the previous vowel by one full mora beat (コーヒー = ko-o-hi-i).',
            },
          ],
          vocabCards: [
            {
              term: 'はじめまして',
              pronunciation: 'はじめまして (hajimemashite)',
              meaning: 'Nice to meet you (first meeting)',
              example: 'はじめまして。ケンジです。',
              exampleNote: 'Used only the very first time you meet someone.',
            },
            {
              term: '学生',
              pronunciation: 'がくせい (gakusei)',
              meaning: 'student',
              example: '私は大学の学生です。',
              exampleNote: 'Pronounced gakusē (long e sound).',
            },
            {
              term: '会社員',
              pronunciation: 'かいしゃいん (kaishain)',
              meaning: 'company employee / office worker',
              example: '母は東京の会社員です。',
              exampleNote: 'General profession word; use 社員 with a specific company name.',
            },
            {
              term: '日本語',
              pronunciation: 'にほんご (nihongo)',
              meaning: 'Japanese language',
              example: '毎日、日本語を勉強します。',
              exampleNote: 'Add 語 (go) to country names for languages (英語, フランス語).',
            },
            {
              term: 'よろしくおねがいします',
              pronunciation: 'よろしくおねがいします (yoroshiku onegaishimasu)',
              meaning: 'Pleased to meet you / I look forward to working with you',
              example: 'これからどうぞよろしくおねがいします。',
              exampleNote: 'Essential social anchor at the end of introductions.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m1-q1',
              skill: 'reading',
              prompt: 'Which sentence correctly means "Maria is a university student"?',
              options: [
                'マリアさんは大学の学生です。',
                'マリアさんは学生の大学です。',
                'マリアさんの大学は学生かです。',
              ],
              correctIndex: 0,
              explanation: 'Particle の places the modifier first: 大学の学生 = student of a university.',
            },
            {
              id: 'ja-a1-m1-q2',
              skill: 'listening',
              prompt: 'Listen to the introduction. Where is Emma from and what is her job?',
              audioScript: 'はじめまして。エマです。カナダから来ました。東京の会社員です。どうぞよろしくおねがいします。',
              options: ['Student from Australia', 'Company employee from Canada', 'Teacher from Tokyo'],
              correctIndex: 1,
              explanation: 'She says 「カナダから来ました」(came from Canada) and 「東京の会社員です」(company employee in Tokyo).',
            },
            {
              id: 'ja-a1-m1-q3',
              skill: 'writing',
              prompt: 'How do you politely say "I am not a teacher"?',
              options: ['私は先生じゃありません。', '私は先生ですか。', '私は先生のじゃです。'],
              correctIndex: 0,
              explanation: 'Polite negative of です is じゃありません (or ではありません in formal writing).',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            'はじめまして。アレックスです。アメリカから来ました。今は東京に住んでいます。ＩＴの会社員です。日本語の勉強が大好きです。これからどうぞよろしくおねがいします。',
        },
      },
      {
        id: 'ja-a1-m2',
        weekLabel: 'Week 3 · Numbers & Time',
        title: 'Numbers, Clock Times, Prices & Ordering with ください',
        focusSkills: ['listening', 'reading'],
        summary:
          'Decode Japanese prices (円), clock times (〜時〜分), days of the week, and smooth café/konbini ordering using これ・それ・あれ and 〜をください.',
        objectives: [
          'Understand prices up to 10,000 yen (百・千・万) and phonetic shifts (三百 sanbyaku, 六百 roppyaku, 八百 happyaku).',
          'Read store business hours and train departure times accurately.',
          'Order items politely using これ/それ/あれ and basic counters (一つ・二つ・三つ).',
        ],
        grammarCheckpoints: ['Demonstratives これ・それ・あれ / この・その・あの', 'Clock times (〜時〜分) & から〜まで ranges', 'Polite ordering: [Item] を [Counter] ください'],
        keyVocabulary: ['いくら', 'ください', '営業時間', '円', '休み'],
        drills: [
          {
            skill: 'listening',
            title: 'Convenience Store Price Check',
            instruction: 'Listen and write down what the customer orders and the total price in yen.',
            durationMins: 15,
            audioScript: 'すみません、このサンドイッチを一つと、熱いお茶を二つください。はい、ぜんぶで六百八十円になります。',
          },
          {
            skill: 'reading',
            title: 'Bakery Notice Scan',
            instruction: 'Scan the bakery notice to check open days and opening time.',
            durationMins: 15,
            samplePassage: 'みどりパン屋：営業時間 8:30〜19:00。水曜日は休みです。メロンパンは一つ220円です。',
          },
        ],
        checkpointPrompt: 'Write a short dialogue ordering two items at a café and asking the price and closing time.',
        lesson: {
          estimatedMins: 30,
          overview:
            'Master practical Japanese numbers, yen prices, business-hour notices, and demonstrative pronouns so you can shop and eat anywhere in Japan.',
          sections: [
            {
              id: 'ja-a1-m2-s1',
              heading: 'こ・そ・あ Demonstratives & Ordering with 〜をください',
              explanation:
                'Japanese divides space into three zones: こ (near speaker: これ / このN), そ (near listener: それ / そのN), and あ (far from both: あれ / あのN). Pair them with をください to order cleanly.',
              formula: 'これ / この[Noun] を [Quantity] ください  |  これはいくらですか (How much is this?)',
              examples: [
                {
                  target: 'すみません、そのケーキを二つください。',
                  translation: 'Excuse me, please give me two of those cakes (near the clerk).',
                  highlight: 'そのケーキを二つください',
                },
                {
                  target: 'あのコーヒーはいくらですか。— 四百五十円です。',
                  translation: 'How much is that coffee over there? — It is 450 yen.',
                  highlight: 'いくらですか',
                },
              ],
              proTip:
                'Remember: これ/それ/あれ stand ALONE ("this one"), whereas この/その/あの MUST be followed directly by a noun ("this cake").',
            },
            {
              id: 'ja-a1-m2-s2',
              heading: 'Telling Time, Days & Schedule Ranges (から〜まで)',
              explanation:
                'Watch irregular clock readings: 4時 (よじ, NOT しじ), 7時 (しちじ), 9時 (くじ). For minutes, 分 toggles between ふん and ぷん (1分 いっぷん, 3分 さんぷん, 5分 ごふん, 10分 じゅっぷん). Connect open/close times with から (from) and まで (until).',
              formula: '[Start] から [End] まで (from ... until ...)  |  [Day] は休みです (closed on ...)',
              examples: [
                {
                  target: '図書館は午前九時から午後六時までです。',
                  translation: 'The library is open from 9:00 a.m. to 6:00 p.m.',
                  highlight: '九時から六時まで',
                },
                {
                  target: '月曜日は休みですが、日曜日は開いています。',
                  translation: 'It is closed on Mondays, but open on Sundays.',
                  highlight: '月曜日は休みです',
                },
              ],
              proTip:
                'In JLPT N5 listening, 300 (さんびゃく), 600 (ろっぴゃく), and 800 (はっぴゃく) appear constantly — drill them aloud!',
            },
          ],
          vocabCards: [
            {
              term: 'いくら',
              pronunciation: 'いくら (ikura)',
              meaning: 'how much (price)',
              example: 'このりんごは一ついくらですか。',
              exampleNote: 'Always asks price, never quantity (quantity uses いくつ).',
            },
            {
              term: 'ください',
              pronunciation: 'ください (kudasai)',
              meaning: 'please give me (noun + をください)',
              example: 'お水を一つください。',
              exampleNote: 'The #1 survival phrase in restaurants and shops.',
            },
            {
              term: '営業時間',
              pronunciation: 'えいぎょうじかん (eigyō jikan)',
              meaning: 'business hours',
              example: '営業時間は十時から八時までです。',
              exampleNote: 'Seen on virtually every Japanese storefront and website.',
            },
            {
              term: '円',
              pronunciation: 'えん (en)',
              meaning: 'Japanese yen',
              example: 'ぜんぶで千二百円です。',
              exampleNote: 'Pronounced "en" (no "y" sound in Japanese!).',
            },
            {
              term: '休み',
              pronunciation: 'やすみ (yasumi)',
              meaning: 'holiday / closed day / break',
              example: '火曜日はお店の休みです。',
              exampleNote: 'On shop signs you will also see 定休日 (ていきゅうび).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m2-q1',
              skill: 'reading',
              prompt: 'Look at the sign: 「みどりパン屋：8:30〜19:00。水曜日は休みです。」 When can you buy bread?',
              options: ['Wednesday at 10:00', 'Thursday at 15:00', 'Friday at 20:00'],
              correctIndex: 1,
              explanation: 'Wednesday is closed and closing time is 19:00, so Thursday at 15:00 is open.',
            },
            {
              id: 'ja-a1-m2-q2',
              skill: 'listening',
              prompt: 'Listen to the shop clerk. How much is the total bill?',
              audioScript: 'すみません、このサンドイッチを一つと、熱いお茶を二つください。はい、ぜんぶで六百八十円になります。',
              options: ['480 yen', '680 yen', '860 yen'],
              correctIndex: 1,
              explanation: '六百八十円 (roppyaku hachijū-en) equals 680 yen.',
            },
            {
              id: 'ja-a1-m2-q3',
              skill: 'writing',
              prompt: 'Which sentence correctly asks "How much is this bag?"',
              options: ['これかばんはいくらですか。', 'このかばんはいくらですか。', 'このかばんをいくらですか。'],
              correctIndex: 1,
              explanation: 'Before a noun (かばん), use この (not これ), with topic particle は.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            'すみません、このコーヒーはいくらですか。四百円です。じゃあ、熱いコーヒーを一つと、サンドイッチを二つください。ぜんぶで千円ですね。このお店は何時までですか。夜八時までです。ありがとうございます。',
        },
      },
      {
        id: 'ja-a1-m3',
        weekLabel: 'Week 4 · Space & Existence',
        title: 'Locations, Existence Verbs (あります・います) & Core Spatial Nouns',
        focusSkills: ['reading', 'speaking'],
        summary:
          'Pinpoint people and objects with います (animate) vs. あります (inanimate), spatial nouns (上・下・前・後ろ・隣), and exact location particle に.',
        objectives: [
          'Distinguish います (people, animals) from あります (buildings, objects, events).',
          'Give clear neighborhood landmarks using 上・下・中・前・後ろ・隣・近く.',
          'Ask where facilities are located with 「〜はどこですか / どこにありますか」.',
        ],
        grammarCheckpoints: ['あります (inanimate) vs. います (animate)', '[Place] に [Thing/Person] が あります/います', 'Position words: の上・の下・の前・の隣・の間'],
        keyVocabulary: ['あります', 'います', '隣', '近く', '駅'],
        drills: [
          {
            skill: 'reading',
            title: 'Station Map Landmarks Drill',
            instruction: 'Read the short map description and find where the post office is located.',
            durationMins: 15,
            samplePassage: '駅の前に大きい本屋があります。本屋の隣に銀行があります。郵便局は銀行とカフェの間にあります。',
          },
          {
            skill: 'speaking',
            title: 'Describe Your Desk & Neighborhood',
            instruction: 'State 4 items on your desk and 2 places near your home using あります/います and position nouns.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Describe your room and neighborhood in Japanese using at least four location phrases (上・前・隣・近く).',
        lesson: {
          estimatedMins: 30,
          overview:
            'Navigate Japanese cities and describe rooms accurately by pairing existence verbs あります/います with spatial reference nouns.',
          sections: [
            {
              id: 'ja-a1-m3-s1',
              heading: 'Animate います vs. Inanimate あります',
              explanation:
                'Japanese splits "there is / exists" into two verbs: います for living creatures that move on their own (people, cats, dogs) and あります for everything else (buildings, furniture, plants, scheduled events). The static location takes particle に.',
              formula: '[Place] に [Thing] が あります  |  [Place] に [Person/Animal] が います',
              examples: [
                {
                  target: '駅の近くに静かな公園があります。',
                  translation: 'There is a quiet park near the station.',
                  highlight: '近くに ... があります',
                },
                {
                  target: '公園の中に小さい犬が二匹います。',
                  translation: 'There are two small dogs inside the park.',
                  highlight: '中に ... が ... います',
                },
              ],
              proTip:
                'Even if you say "I have a meeting tomorrow" or "I have a sister", Japanese uses existence: 「明日テストがあります」 / 「姉が一人います」.',
            },
            {
              id: 'ja-a1-m3-s2',
              heading: 'Building Exact Directions with Spatial Nouns',
              explanation:
                'Spatial words like 上 (on/above), 下 (under), 前 (in front of), 後ろ (behind), 隣 (next to), and 間 (between) are NOUNS in Japanese — so they always connect to the landmark with の!',
              formula: '[Landmark] の [上 / 下 / 前 / 後ろ / 隣 / 近く] に',
              examples: [
                {
                  target: '郵便局は銀行とカフェの間にあります。',
                  translation: 'The post office is between the bank and the café.',
                  highlight: '銀行とカフェの間に',
                },
                {
                  target: 'すみません、切符売り場はどこにありますか。— 階段の右にあります。',
                  translation: 'Excuse me, where is the ticket office? — It is to the right of the stairs.',
                  highlight: '階段の右に',
                },
              ],
              proTip:
                'Use 隣 (となり) only for things of the same category side by side (building next to building, person next to person); use 近く for general proximity.',
            },
          ],
          vocabCards: [
            {
              term: 'あります',
              pronunciation: 'あります (arimasu)',
              meaning: 'to exist / there is (inanimate objects, places, events)',
              example: '机の上にノートがあります。',
              exampleNote: 'Negative polite: ありません.',
            },
            {
              term: 'います',
              pronunciation: 'います (imasu)',
              meaning: 'to exist / there is (people, animals)',
              example: '教室に先生がいます。',
              exampleNote: 'Negative polite: いません.',
            },
            {
              term: '隣',
              pronunciation: 'となり (tonari)',
              meaning: 'next door / right next to',
              example: 'ホテルの隣にコンビニがあります。',
              exampleNote: 'Always linked with の: X の隣に.',
            },
            {
              term: '近く',
              pronunciation: 'ちかく (chikaku)',
              meaning: 'nearby / vicinity',
              example: '家の近くに大きいスーパーがあります。',
              exampleNote: 'Also used adverbially as 近くで for actions.',
            },
            {
              term: '駅',
              pronunciation: 'えき (eki)',
              meaning: 'train station',
              example: '新宿駅は東京にあります。',
              exampleNote: 'Core A1 travel kanji; combine with 前 → 駅前 (in front of the station).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m3-q1',
              skill: 'reading',
              prompt: '「本屋の隣に銀行があります。郵便局は銀行とカフェの間にあります。」 Where is the post office?',
              options: ['Inside the bookstore', 'Between the bank and the café', 'Behind the station'],
              correctIndex: 1,
              explanation: '銀行とカフェの間 means "between the bank and the café".',
            },
            {
              id: 'ja-a1-m3-q2',
              skill: 'writing',
              prompt: 'Choose the grammatically correct sentence for "There is a cat under the table":',
              options: ['テーブルの下に猫があります。', 'テーブルの下に猫がいます。', 'テーブルの下で猫がいます。'],
              correctIndex: 1,
              explanation: 'A cat is animate (います), and static existence takes particle に (テーブルの下に).',
            },
            {
              id: 'ja-a1-m3-q3',
              skill: 'listening',
              prompt: 'Listen to the directions. Where is the pharmacy?',
              audioScript: 'すみません、薬局はどこにありますか。えっと、あの交差点の右に郵便局がありますね。薬局はその郵便局の隣です。',
              options: ['Next to the post office', 'Across from the station', 'Under the hotel'],
              correctIndex: 0,
              explanation: 'The speaker explains 「薬局はその郵便局の隣です」 (next to that post office).',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            '私のアパートは駅の近くにあります。アパートの隣に小さいパン屋とコンビニがあります。部屋の中にベッドと机があります。机の上にパソコンと本があります。とても便利な場所です。',
        },
      },
      {
        id: 'ja-a1-m4',
        weekLabel: 'Week 5 · Daily Routines',
        title: 'Polite Verb Conjugation (ます・ません・ました) & Action Particles',
        focusSkills: ['writing', 'listening'],
        summary:
          'Describe your full daily routine across present, future, and past tenses using polite ます verbs and core particles を・で・に・へ・と.',
        objectives: [
          'Conjugate any polite verb smoothly across all 4 tenses (ます / ません / ました / ませんでした).',
          'Distinguish に (specific clock time / arrival) vs. で (action location / means of transport).',
          'Write a cohesive 80-character diary entry describing yesterday’s schedule.',
        ],
        grammarCheckpoints: ['4-way polite verb grid (ます / ません / ました / ませんでした)', 'Action location で vs. Time marker に vs. Direct object を', 'Companion particle と & frequency adverbs (毎日・よく・ときどき)'],
        keyVocabulary: ['起きます', '食べます', '行きます', '勉強します', '帰ります'],
        drills: [
          {
            skill: 'listening',
            title: 'Kenji’s Weekday Schedule',
            instruction: 'Listen and note Kenji’s wake-up time, commuting method, and evening activity.',
            durationMins: 15,
            audioScript: '私は毎朝六時半に起きます。朝ごはんを食べて、七時半に電車で会社へ行きます。夜は家で日本語の本を読みます。',
          },
          {
            skill: 'writing',
            title: 'Yesterday’s Mini-Diary',
            instruction: 'Write 5 sentences about what you did yesterday using past tense ました and at least 3 different particles.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a short Japanese diary entry describing your typical weekday morning and what you did yesterday evening.',
        lesson: {
          estimatedMins: 30,
          overview:
            'Unlock fluent daily storytelling by automating the 4 polite verb endings and locking in the exact roles of を, に, で, へ, and と.',
          sections: [
            {
              id: 'ja-a1-m4-s1',
              heading: 'The 4-Way Polite Verb Engine (ます・ません・ました・ませんでした)',
              explanation:
                'In Japanese, polite verbs do not change for I/you/he/she/they! You only mark Non-Past (present/future) vs. Past, and Affirmative vs. Negative. Swap the tail cleanly: 食べます (eat/will eat), 食べません (do not eat), 食べました (ate), 食べませんでした (did not eat).',
              formula: 'Stem + ます (present/future) | ません (neg) | ました (past) | ませんでした (past neg)',
              examples: [
                {
                  target: '今朝、コーヒーを飲みましたが、パンを食べませんでした。',
                  translation: 'This morning I drank coffee, but I did not eat bread.',
                  highlight: '飲みました / 食べませんでした',
                },
                {
                  target: '明日、友だちと京都へ行きます。',
                  translation: 'Tomorrow I will go to Kyoto with a friend.',
                  highlight: '友だちと ... へ行きます',
                },
              ],
              proTip:
                'Relative time words like 今日 (today), 明日 (tomorrow), 昨日 (yesterday), and 毎日 (every day) NEVER take particle に! Only numbered times/days (7時に, 月曜日に) take に.',
            },
            {
              id: 'ja-a1-m4-s2',
              heading: 'Action Stage で vs. Destination に/へ',
              explanation:
                'Always use で for the place where an activity happens (レストランで食べます) and for the vehicle/tool used (電車で行きます, はしで食べます). Use に or へ for destinations with movement verbs (行く・来る・帰る).',
              formula: '[Time] に + [Vehicle] で + [Place] で + [Object] を + [Verb]',
              examples: [
                {
                  target: '毎日、バスで大学へ行って、図書館で勉強します。',
                  translation: 'Every day I go to university by bus and study at the library.',
                  highlight: 'バスで / 図書館で',
                },
                {
                  target: '夜十時ごろ、うちへ帰りました。',
                  translation: 'I returned home around 10:00 p.m.',
                  highlight: 'うちへ帰りました',
                },
              ],
              proTip:
                'Adding ごろ after a time means "around/approximately" (七時ごろ) and makes particle に optional.',
            },
          ],
          vocabCards: [
            {
              term: '起きます',
              pronunciation: 'おきます (okimasu)',
              meaning: 'to wake up / get up',
              example: '毎朝七時に起きます。',
              exampleNote: 'Ichidan verb (dictionary form: 起きる).',
            },
            {
              term: '食べます',
              pronunciation: 'たべます (tabemasu)',
              meaning: 'to eat',
              example: '昼ごはんにラーメンを食べました。',
              exampleNote: 'Takes direct object particle を.',
            },
            {
              term: '行きます',
              pronunciation: 'いきます (ikimasu)',
              meaning: 'to go',
              example: '週末、スーパーへ行きます。',
              exampleNote: 'Destination takes へ or に.',
            },
            {
              term: '勉強します',
              pronunciation: 'べんきょうします (benkyō shimasu)',
              meaning: 'to study',
              example: 'カフェで日本語を勉強します。',
              exampleNote: 'Compound する-verb; action place takes で.',
            },
            {
              term: '帰ります',
              pronunciation: 'かえります (kaerimasu)',
              meaning: 'to return home / go back',
              example: '六時にうちへ帰りました。',
              exampleNote: 'Careful: Godan verb (帰る → 帰って), not Ichidan!',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m4-q1',
              skill: 'writing',
              prompt: 'Fill in the two particles: 「昨日、友だち___レストラン___昼ごはんを食べました。」',
              options: ['に / を', 'と / で', 'へ / に'],
              correctIndex: 1,
              explanation: 'と marks companion ("with a friend") and で marks the action location ("at a restaurant").',
            },
            {
              id: 'ja-a1-m4-q2',
              skill: 'listening',
              prompt: 'Listen to Kenji’s schedule. How does he go to work?',
              audioScript: '私は毎朝六時半に起きます。朝ごはんを食べて、七時半に電車で会社へ行きます。夜は家で日本語の本を読みます。',
              options: ['By bus', 'By train', 'On foot'],
              correctIndex: 1,
              explanation: 'He says 「電車で会社へ行きます」 (goes to the company by train).',
            },
            {
              id: 'ja-a1-m4-q3',
              skill: 'reading',
              prompt: 'Which time expression does NOT take particle に?',
              options: ['七時 (7 o’clock)', '明日 (tomorrow)', '日曜日 (Sunday)'],
              correctIndex: 1,
              explanation: 'Relative time words like 昨日, 今日, 明日, 毎日 never take に.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            '私は毎朝七時に起きます。家で朝ごはんを食べて、八時に電車で会社へ行きます。昨日は仕事の後で友だちと渋谷のレストランで晩ごはんを食べました。十時にうちへ帰って、少し日本語を勉強しました。',
        },
      },
      {
        id: 'ja-a1-m5',
        weekLabel: 'Week 6 · Descriptions & Invitations',
        title: 'い-Adjectives vs. な-Adjectives, Preferences & Polite Invitations',
        focusSkills: ['speaking', 'reading'],
        summary:
          'Describe food, cities, and weather using both Japanese adjective families, express likes/skills with が, and invite friends warmly with 〜ませんか and 〜ましょう.',
        objectives: [
          'Conjugate い-adjectives (高い → 高くない / 高かった) and な-adjectives (静か → 静かじゃない / 静かだった) accurately.',
          'Express preferences and abilities with 「〜が好きです / 上手です / わかります」.',
          'Make warm invitations (一緒に行きませんか) and accept enthusiastically (ええ、行きましょう!).',
        ],
        grammarCheckpoints: ['い-adjectives (〜くない / 〜かった) vs. な-adjectives (〜なN / 〜じゃありません)', 'Preference & skill particle が (好き・きらい・上手・下手)', 'Invitations: 〜ませんか (won’t you?) & 〜ましょう (let’s!)'],
        keyVocabulary: ['おいしい', '静か', '楽しい', '好き', '一緒'],
        drills: [
          {
            skill: 'speaking',
            title: 'Weekend Café Invitation Roleplay',
            instruction: 'Invite a friend to a new restaurant, describe the food and atmosphere, and agree on a meeting time.',
            durationMins: 15,
          },
          {
            skill: 'listening',
            title: 'Kyoto Trip Impressions',
            instruction: 'Listen and catch what the speaker thought about Kyoto’s temples and food.',
            durationMins: 15,
            audioScript: '先週、京都へ行きました。お寺はとても静かできれいでした。抹茶のアイスもすごくおいしかったです。でも、駅は少しにぎやかでした。',
          },
        ],
        checkpointPrompt: 'Describe your favorite city or restaurant in Japanese using both い-adjectives and な-adjectives, and invite a friend to visit with you.',
        lesson: {
          estimatedMins: 30,
          overview:
            'Bring vivid color to your Japanese by mastering the two adjective conjugation systems and inviting others smoothly with 〜ませんか and 〜ましょう.',
          sections: [
            {
              id: 'ja-a1-m5-s1',
              heading: 'い-Adjectives vs. な-Adjectives: Don’t Mix Their Endings!',
              explanation:
                'い-adjectives inflect directly (おいしい → おいしくない / おいしかった). な-adjectives behave like nouns and attach な ONLY before a noun (静かな町, きれいな花). Watch the famous impostors: きれい (pretty/clean) and 有名 (famous) end in -i sound, yet are な-adjectives!',
              formula: 'い-adj: drop い + くない (neg) / かった (past)  |  な-adj: + な + Noun / じゃありません / でした',
              examples: [
                {
                  target: 'このラーメンはあまり辛くなかったですが、とてもおいしかったです。',
                  translation: 'This ramen was not very spicy, and it was very delicious.',
                  highlight: '辛くなかった / おいしかったです',
                },
                {
                  target: '京都はきれいで有名な町です。',
                  translation: 'Kyoto is a beautiful and famous town.',
                  highlight: 'きれいで有名な',
                },
              ],
              proTip:
                'Remember irregular いい (good): all its conjugations revert to the stem よ- → よくない (not good), よかった (was good), よくなかった (was not good)!',
            },
            {
              id: 'ja-a1-m5-s2',
              heading: 'Warm Invitations: 〜ませんか vs. 〜ましょう',
              explanation:
                'Use 〜ませんか ("Won’t you ...?") to give the listener polite room to accept or decline. Once you are suggesting a shared next step or accepting an invitation, switch to enthusiastic 〜ましょう ("Let’s ...!").',
              formula: 'Invitation: [Verb stem] + ませんか  |  Agreement/Suggestion: [Verb stem] + ましょう',
              examples: [
                {
                  target: '土曜日、一緒に映画を見ませんか。— ええ、ぜひ見ましょう！',
                  translation: 'Won’t you watch a movie together on Saturday? — Yes, let’s definitely see one!',
                  highlight: '見ませんか / 見ましょう',
                },
                {
                  target: '私は音楽が好きです。今度コンサートへ行きませんか。',
                  translation: 'I like music. Won’t you go to a concert sometime soon?',
                  highlight: '音楽が好きです',
                },
              ],
              proTip:
                'Pair あまり with a NEGATIVE predicate to soften criticism politely: 「あまり高くないです」(It’s not very expensive).',
            },
          ],
          vocabCards: [
            {
              term: 'おいしい',
              pronunciation: 'おいしい (oishii)',
              meaning: 'delicious / tasty',
              example: '日本のカレーはとてもおいしいです。',
              exampleNote: 'Past form: おいしかったです.',
            },
            {
              term: '静か',
              pronunciation: 'しずか (shizuka)',
              meaning: 'quiet / peaceful (な-adjective)',
              example: '図書館はいつも静かな場所です。',
              exampleNote: 'Needs な before a noun: 静かな部屋.',
            },
            {
              term: '楽しい',
              pronunciation: 'たのしい (tanoshii)',
              meaning: 'fun / enjoyable',
              example: '昨日のパーティーは本当に楽しかったです。',
              exampleNote: 'Contrast with うれしい (happy/glad about an event).',
            },
            {
              term: '好き',
              pronunciation: 'すき (suki)',
              meaning: 'liked / favorite (な-adjective)',
              example: 'どんな食べ物が好きですか。',
              exampleNote: 'Object of liking takes が, NOT を!',
            },
            {
              term: '一緒',
              pronunciation: 'いっしょ (issho)',
              meaning: 'together (一緒に)',
              example: '今晩、一緒に晩ごはんを食べませんか。',
              exampleNote: 'Watch the small っ pause: i-s-sho (3 morae).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m5-q1',
              skill: 'writing',
              prompt: 'Select the correct past tense of 「いい天気です」(It is good weather):',
              options: ['いかった天気です', 'いい天気でした / 天気がよかったです', 'いいた天気です'],
              correctIndex: 1,
              explanation: 'いい conjugates from its よ- stem: 天気がよかったです (or noun + でした: いい天気でした).',
            },
            {
              id: 'ja-a1-m5-q2',
              skill: 'reading',
              prompt: 'Which adjective is a な-adjective (takes な before a noun) despite ending in い?',
              options: ['おいしい', 'きれい', '新しい'],
              correctIndex: 1,
              explanation: 'きれい (pretty/clean) is a な-adjective: きれいな公園 (NOT *きれいくない*).',
            },
            {
              id: 'ja-a1-m5-q3',
              skill: 'listening',
              prompt: 'Listen to the trip report. How did the speaker describe the station in Kyoto?',
              audioScript: '先週、京都へ行きました。お寺はとても静かできれいでした。抹茶のアイスもすごくおいしかったです。でも、駅は少しにぎやかでした。',
              options: ['Very quiet', 'A little lively / crowded', 'Closed on Sunday'],
              correctIndex: 1,
              explanation: 'She says 「駅は少しにぎやかでした」 (the station was a bit lively/bustling).',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            '私の好きな町は京都です。古いお寺が多くて、とてもきれいな町です。食べ物もあまり高くなくて、本当においしいです。今度の週末、一緒に京都へ行きませんか。おいしい抹茶のケーキを食べましょう！',
        },
      },
      {
        id: 'ja-a1-m6',
        weekLabel: 'Weeks 7–8 · Te-Form & N5 Integration',
        title: 'Te-Form Requests, Ongoing Actions (〜ています) & JLPT N5 Simulation',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Unlock the powerhouse Te-Form for polite requests (〜てください), permission (〜てもいいですか), prohibition (〜てはいけません), ongoing states (〜ています), and full N5 readiness.',
        objectives: [
          'Convert Ichidan, Godan, and Irregular verbs into accurate Te-Form without hesitation.',
          'Make polite requests, ask permission, and understand public prohibition signs.',
          'Pass the LinguaVerve Japanese A1 / JLPT N5 4-Skill Simulated Exam.',
        ],
        grammarCheckpoints: ['Te-Form requests (〜てください) & chaining actions (V1て、V2)', 'Permission (〜てもいいですか) & Prohibition (〜てはいけません)', 'Present progressive & resultant states (〜ています)'],
        keyVocabulary: ['待ってください', '写真', '座ります', '使います', 'わかります'],
        drills: [
          {
            skill: 'listening',
            title: 'Museum Rules & Guide Announcement',
            instruction: 'Listen and identify what visitors are allowed to do and what is prohibited.',
            durationMins: 15,
            audioScript: 'みなさん、美術館へようこそ。ロビーで水を飲んでもいいですが、展示室の中で写真を撮ってはいけません。荷物はロッカーに入れてください。',
          },
          {
            skill: 'reading',
            title: 'N5 Email Comprehension Check',
            instruction: 'Read Sakura’s message and note what she is currently doing and her request.',
            durationMins: 15,
            samplePassage: 'ケンジさん、今、新宿駅の南口で待っています。電車が五分おくれましたから、急がなくてもいいですよ。着いたら電話をかけてください。',
          },
        ],
        checkpointPrompt: 'Write a short Japanese message to a visiting friend giving 2 polite requests and 1 museum/station rule using Te-Form patterns.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Combine everything from A1/N5 using the Te-Form Swiss-army knife: requests, permissions, prohibitions, and ongoing actions.',
          sections: [
            {
              id: 'ja-a1-m6-s1',
              heading: 'Te-Form Survival Toolkit: Requests, Permission & Rules',
              explanation:
                'Once you know the Te-Form of a verb, four indispensable JLPT N5 patterns unlock instantly: 〜てください (please do), 〜てもいいですか (may I ...?), 〜てはいけません (must not ...), and V1て、V2 (do V1 and then V2).',
              formula: 'Vて + ください (please)  |  Vて + もいいですか (may I?)  |  Vて + はいけません (must not)',
              examples: [
                {
                  target: 'すみません、ここで写真を撮ってもいいですか。— いいえ、撮ってはいけません。',
                  translation: 'Excuse me, may I take photos here? — No, you must not take photos.',
                  highlight: '撮ってもいいですか / 撮ってはいけません',
                },
                {
                  target: 'もう少しゆっくり話してください。',
                  translation: 'Please speak a little more slowly.',
                  highlight: '話してください',
                },
              ],
              proTip:
                'When someone asks 〜てもいいですか and you want to refuse gently in real life, soften 〜てはいけません to 「すみません、ちょっと…」 or 「ご遠慮ください」.',
            },
            {
              id: 'ja-a1-m6-s2',
              heading: 'Two Meanings of 〜ています (Right Now vs. Ongoing State)',
              explanation:
                'With action verbs (食べる・待つ・勉強する), 〜ています means "is doing right now". With change-of-state verbs (住む・知る・結婚する・持つ), 〜ています means a continuing state ("lives in", "knows", "is married").',
              formula: 'Action V + ています (in progress)  |  State-change V + ています (current state)',
              examples: [
                {
                  target: '今、カフェで友だちを待っています。',
                  translation: 'Right now I am waiting for a friend at the café.',
                  highlight: '待っています',
                },
                {
                  target: '山田さんの電話番号を知っていますか。— いいえ、知りません。',
                  translation: 'Do you know Yamada’s phone number? — No, I do not know it.',
                  highlight: '知っています / 知りません',
                },
              ],
              proTip:
                'Classic N5 trap: The negative of 知っています (I know) is 「知りません」, NEVER *"知っていません"*!',
            },
          ],
          vocabCards: [
            {
              term: '待ってください',
              pronunciation: 'まってください (matte kudasai)',
              meaning: 'please wait',
              example: 'ちょっと待ってください。すぐ行きます。',
              exampleNote: '待つ (Godan -つ) → 待って.',
            },
            {
              term: '写真',
              pronunciation: 'しゃしん (shashin)',
              meaning: 'photograph',
              example: '公園できれいな写真を撮りました。',
              exampleNote: 'Verb collocation: 写真を撮る (to take a photo).',
            },
            {
              term: '座ります',
              pronunciation: 'すわります (suwarimasu)',
              meaning: 'to sit down',
              example: 'どうぞここに座ってください。',
              exampleNote: 'Seat destination takes に (いすに座る).',
            },
            {
              term: '使います',
              pronunciation: 'つかいます (tsukaimasu)',
              meaning: 'to use',
              example: 'このパソコンを使ってもいいですか。',
              exampleNote: '使う (Godan -う) → 使って.',
            },
            {
              term: 'わかります',
              pronunciation: 'わかります (wakarimasu)',
              meaning: 'to understand',
              example: '日本語が少しわかります。',
              exampleNote: 'Takes が for the understood item, not を.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a1-m6-q1',
              skill: 'listening',
              prompt: 'Listen to the museum announcement. What is NOT allowed inside the exhibition room?',
              audioScript: 'みなさん、美術館へようこそ。ロビーで水を飲んでもいいですが、展示室の中で写真を撮ってはいけません。荷物はロッカーに入れてください。',
              options: ['Drinking water in the lobby', 'Taking photos in the exhibition room', 'Putting bags in lockers'],
              correctIndex: 1,
              explanation: '展示室の中で写真を撮ってはいけません = you must not take photos inside the exhibition room.',
            },
            {
              id: 'ja-a1-m6-q2',
              skill: 'writing',
              prompt: 'How do you reply "No, I do not know" to 「田中さんの住所を知っていますか」?',
              options: ['いいえ、知っていません。', 'いいえ、知りません。', 'いいえ、知らなくてもいいです。'],
              correctIndex: 1,
              explanation: 'The negative of 知っています is always 知りません.',
            },
            {
              id: 'ja-a1-m6-q3',
              skill: 'reading',
              prompt: 'Choose the right Te-Form of 読む (to read) and 行く (to go):',
              options: ['読んて / 行いて', '読んで / 行って', '読みて / 行きって'],
              correctIndex: 1,
              explanation: '読む (-む → んで) becomes 読んで; irregular exception 行く becomes 行って.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 30,
          checkpointModelAnswer:
            'ミアさん、今、東京駅の北口で待っています。駅に着いたら、メッセージをください。それから、今日は美術館へ行きますね。美術館の中で写真を撮ってはいけませんが、ロビーでコーヒーを飲んでもいいですよ。あとで会いましょう！',
        },
      },
    ],
  },

  // =====================================================================
  // A2 (JLPT N4) · STAGE 2: EVERYDAY INDEPENDENCE
  // =====================================================================
  {
    id: 'ja-intensive-a2',
    languageId: 'japanese',
    level: 'A2',
    title: 'Japanese A2 / JLPT N4 Everyday Independence Intensive',
    subtitle:
      'Automate Plain Forms, quoting (〜と思います), potential & conditional verbs, giving/receiving (あげる・くれる・もらう), transitive/intransitive states, and everyday polite advice.',
    heroRole: 'Stage 2 · Everyday Independence (JLPT N4)',
    durationWeeks: 10,
    dailyHours: '2.0 hrs/day (Intensive)',
    targetCertificates: ['JLPT N4 (CEFR A2)', 'JF Standard A2 (IRODORI Elementary 1 & 2)'],
    passingCriteria: 'JLPT N4 scaled score ≥ 90/180 (min 38/120 Language Knowledge & Reading, 19/60 Listening) + fluent everyday interaction.',
    examBlueprint: {
      reading: '60 mins · ~300 kanji, everyday emails, community notices, blog entries, and simple explanations.',
      listening: '35 mins · Natural-paced everyday dialogues with self-corrections, scheduling changes, and polite requests.',
      writing: '30 mins · Structured personal emails, trip stories, and advice messages (120–200 chars).',
      speaking: '10 mins · Narrating experiences, explaining reasons, giving advice, and handling clinic/hotel/train issues.',
    },
    referenceIds: ['ref-ja-jlpt-n5n4', 'ref-ja-jlpt-hub', 'ref-ja-irodori', 'ref-ja-marugoto', 'ref-ja-nhk'],
    modules: [
      {
        id: 'ja-a2-m1',
        weekLabel: 'Weeks 1–2 · Plain Form Engine',
        title: 'Plain Casual Forms (辞書形・ない形・た形) & Quoting Thoughts',
        focusSkills: ['writing', 'speaking'],
        summary:
          'Unlock the Plain Form (普通形) engine required for expressing opinions (〜と思います), reporting speech (〜と言いました), modifying nouns, and giving explanations (〜んです).',
        objectives: [
          'Convert any verb/adjective cleanly into Dictionary, ない, た, and なかった plain forms.',
          'Embed plain clauses naturally before 〜と思います, 〜と言いました, and 〜んです.',
          'Modify nouns directly with whole Japanese clauses (「昨日買ったカメラ」).',
        ],
        grammarCheckpoints: ['Plain Form 4-way grid (辞書形・ない形・た形・なかった)', 'Quoting with 〜と思います / 〜と言っていました', 'Noun modification clauses (Plain clause + Noun)'],
        keyVocabulary: ['思う', '言う', '説明', '約束', '忘れる'],
        drills: [
          {
            skill: 'listening',
            title: 'Reported Schedule Change',
            instruction: 'Listen and catch what Teacher Sato said about Friday’s class.',
            durationMins: 15,
            audioScript: '佐藤先生は、金曜日のテストはやさしいから心配しなくてもいいと言っていましたよ。でも、辞書を忘れないでねと言いました。',
          },
          {
            skill: 'speaking',
            title: 'Opinion & Explanation Sprint',
            instruction: 'Give 3 opinions about learning Japanese using 〜と思います and explain why with 〜んです.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a short Japanese paragraph sharing your opinion about living in a big city vs. a small town using 〜と思います and two noun-modifying clauses.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Cross the N5→N4 threshold by mastering Plain Forms — the indispensable building block inside almost every complex Japanese sentence.',
          sections: [
            {
              id: 'ja-a2-m1-s1',
              heading: 'Plain Form Before 〜と思います & 〜と言いました',
              explanation:
                'Even when speaking politely to a boss or teacher, everything BEFORE と (quoting particle) switches to Plain Form. Remember that な-adjectives and nouns keep だ before と: 「便利だと思います」(I think it’s convenient).',
              formula: '[Plain Form (V / い-adj / な-adjだ / Nだ)] + と思います / と言いました',
              examples: [
                {
                  target: '明日はたぶん雨が降らないと思います。',
                  translation: 'I think it probably won’t rain tomorrow.',
                  highlight: '降らないと思います',
                },
                {
                  target: '田中さんは、新しいレストランはとても静かだと言っていました。',
                  translation: 'Tanaka was saying that the new restaurant is very quiet.',
                  highlight: '静かだと言っていました',
                },
              ],
              proTip:
                'Forming ない-form for Godan verbs: shift the final -u vowel to -a + ない (書く→書かない), EXCEPT verbs ending in bare う become わない (買う→買わない, NOT *かあない*) and ある becomes simply ない!',
            },
            {
              id: 'ja-a2-m1-s2',
              heading: 'Japanese Relative Clauses (Modifier BEFORE Noun!)',
              explanation:
                'Japanese has no words like "who", "which", or "that". Simply place a Plain Form clause directly in front of the noun it describes! Note that inside a modifying clause, the subject takes が or の, NEVER は.',
              formula: '[Plain Form Clause (subject + が)] + [Noun]',
              examples: [
                {
                  target: 'これは去年、京都で買ったお茶碗です。',
                  translation: 'This is the tea bowl that I bought in Kyoto last year.',
                  highlight: '京都で買ったお茶碗',
                },
                {
                  target: 'あそこで赤いコートを着ている人は山田さんです。',
                  translation: 'The person wearing a red coat over there is Yamada.',
                  highlight: '赤いコートを着ている人',
                },
              ],
              proTip:
                'Never put polite ます/です inside a noun-modifying clause: say 「母が作った料理」(the dish my mother made), NEVER *"母が作りました料理"*.',
            },
          ],
          vocabCards: [
            {
              term: '思う',
              pronunciation: 'おもう (omou)',
              meaning: 'to think / feel',
              example: 'この映画は面白いと思います。',
              exampleNote: 'Use 思っています for another person’s ongoing opinion.',
            },
            {
              term: '言う',
              pronunciation: 'いう (iu)',
              meaning: 'to say',
              example: '駅員さんは五分おくれると言いました。',
              exampleNote: 'Pronounced "yū" in natural dictionary form.',
            },
            {
              term: '説明',
              pronunciation: 'せつめい (setsumei)',
              meaning: 'explanation',
              example: '先生の説明はとてもわかりやすかったです。',
              exampleNote: 'Verb form: 説明する (to explain).',
            },
            {
              term: '約束',
              pronunciation: 'やくそく (yakusoku)',
              meaning: 'promise / appointment',
              example: '土曜日、友だちと食事の約束があります。',
              exampleNote: 'Collocation: 約束を守る (keep a promise).',
            },
            {
              term: '忘れる',
              pronunciation: 'わすれる (wasureru)',
              meaning: 'to forget',
              example: '電車の中に傘を忘れてしまいました。',
              exampleNote: 'Ichidan verb → ない-form: 忘れない.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m1-q1',
              skill: 'writing',
              prompt: 'Which sentence correctly says "I think Tokyo is convenient"?',
              options: [
                '東京は便利ですと思います。',
                '東京は便利だと思います。',
                '東京は便利と思います。',
              ],
              correctIndex: 1,
              explanation: 'な-adjectives (便利) require plain copula だ before と思います.',
            },
            {
              id: 'ja-a2-m1-q2',
              skill: 'reading',
              prompt: 'Choose the natural relative clause for "the book my friend lent me":',
              options: [
                '友だちが貸してくれた本',
                '友だちは貸しました本',
                '本が貸した友だち',
              ],
              correctIndex: 0,
              explanation: 'Inside a relative clause, use Plain Form + が (not は or ます), placed before the noun 本.',
            },
            {
              id: 'ja-a2-m1-q3',
              skill: 'listening',
              prompt: 'Listen carefully. What did Teacher Sato remind students NOT to forget?',
              audioScript: '佐藤先生は、金曜日のテストはやさしいから心配しなくてもいいと言っていましたよ。でも、辞書を忘れないでねと言いました。',
              options: ['Their lunchbox', 'Their dictionary', 'Their train pass'],
              correctIndex: 1,
              explanation: '「辞書を忘れないでね」 = please don’t forget your dictionary.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            '私は大きい町より小さい町のほうが住みやすいと思います。大きい町はお店が多くて便利ですが、毎日電車がとてもこむからです。去年、旅行で行った金沢はとても静かで食べ物が美味しい町でした。いつかそういう町に住みたいと思っています。',
        },
      },
      {
        id: 'ja-a2-m2',
        weekLabel: 'Weeks 3–4 · Experiences & Plans',
        title: 'Experiences (〜たことがある), Plans (〜つもり) & Multitasking (〜ながら)',
        focusSkills: ['speaking', 'reading'],
        summary:
          'Share life experiences, list representative activities (〜たり〜たりする), state concrete intentions (〜つもり), and describe simultaneous actions (〜ながら).',
        objectives: [
          'Talk about life experiences accurately with Vた + ことがある (not Vる + ことがある).',
          'Describe weekend routines naturally with Vたり Vたりします.',
          'State personal plans and simultaneous habits using 〜つもりです and 〜ながら.',
        ],
        grammarCheckpoints: ['Past experience Vたことがある vs. occasional habit Vることがある', 'Representative actions: V1たり V2たりします', 'Intentions (Vる/Vない + つもり) & Simultaneous actions (Vます-stem + ながら)'],
        keyVocabulary: ['経験', '予定', '旅行', '選ぶ', '準備'],
        drills: [
          {
            skill: 'reading',
            title: 'Hokkaido Travel Blog Scan',
            instruction: 'Read the short blog and list what the author plans to do in Sapporo.',
            durationMins: 15,
            samplePassage: '私はまだ北海道へ行ったことがありませんが、来月初めて行くつもりです。札幌でラーメンを食べたり、きれいな公園を散歩したりしたいです。',
          },
          {
            skill: 'speaking',
            title: '60-Second Bucket List & Weekend Routine',
            instruction: 'Share 1 thing you have done, 1 thing you have never done, and 2 things you do on weekends using 〜たり〜たり.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Describe a travel experience you have had and your plans for your next holiday using 〜たことがある, 〜たり〜たり, and 〜つもりです.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Move past basic schedules into rich personal storytelling — contrasting past life experiences, concrete future intentions, and simultaneous actions.',
          sections: [
            {
              id: 'ja-a2-m2-s1',
              heading: 'Life Experiences (〜たことがある) & Representative Lists (〜たり〜たり)',
              explanation:
                'Attach ことがある to the plain past た-form to mean "have had the experience of doing". To list sample activities without claiming the list is exhaustive, attach り to the た-form and close with する!',
              formula: 'Vた + ことがあります (have done)  |  V1たり、V2たり します (do things like V1 and V2)',
              examples: [
                {
                  target: '富士山に登ったことがありますか。— いいえ、一度もありません。',
                  translation: 'Have you ever climbed Mt. Fuji? — No, not even once.',
                  highlight: '登ったことがありますか',
                },
                {
                  target: '日曜日は掃除をしたり、音楽を聞いたりします。',
                  translation: 'On Sundays I do things like cleaning and listening to music.',
                  highlight: '掃除をしたり、音楽を聞いたりします',
                },
              ],
              proTip:
                'Watch the tense trap: Vる + ことがある means "sometimes happens" (電車がおくれることがある), whereas Vた + ことがある means "have experienced before"!',
            },
            {
              id: 'ja-a2-m2-s2',
              heading: 'Intentions (〜つもり) & Simultaneous Actions (〜ながら)',
              explanation:
                'Use Vる/Vない + つもりです for firm personal plans ("I intend to / not to"). Use V1(ます-stem) + ながら + V2 when ONE person does two actions at the same time — the MAIN action always sits at the end (V2)!',
              formula: 'Vる / Vない + つもりです  |  [Background V1 stem] + ながら + [Main V2]',
              examples: [
                {
                  target: '来年、日本の大学院へ留学するつもりです。',
                  translation: 'Next year I intend to study abroad at a Japanese graduate school.',
                  highlight: '留学するつもりです',
                },
                {
                  target: '毎朝、ポッドキャストを聞きながら駅まで歩きます。',
                  translation: 'Every morning I walk to the station while listening to a podcast.',
                  highlight: '聞きながら ... 歩きます',
                },
              ],
              proTip:
                'Never omit します at the end of 〜たり〜たり: *"映画を見たり、買い物したりです"* is unnatural — always finish with します / しました!',
            },
          ],
          vocabCards: [
            {
              term: '経験',
              pronunciation: 'けいけん (keiken)',
              meaning: 'experience',
              example: '日本で働いた経験があります。',
              exampleNote: 'Also a する-verb: 経験する (to experience).',
            },
            {
              term: '予定',
              pronunciation: 'よてい (yotei)',
              meaning: 'schedule / plan (more objective than つもり)',
              example: '来週、大阪へ出張する予定です。',
              exampleNote: 'Great for fixed itineraries and work plans.',
            },
            {
              term: '旅行',
              pronunciation: 'りょこう (ryokō)',
              meaning: 'travel / trip',
              example: '夏休みに九州へ旅行するつもりです。',
              exampleNote: 'Long final vowel: ryo-ko-u.',
            },
            {
              term: '選ぶ',
              pronunciation: 'えらぶ (erabu)',
              meaning: 'to choose / select',
              example: '家族のためにおみやげを選びました。',
              exampleNote: 'Godan -ぶ → 選んで / 選んだ.',
            },
            {
              term: '準備',
              pronunciation: 'じゅんび (junbi)',
              meaning: 'preparation',
              example: '旅行の準備はもう終わりましたか。',
              exampleNote: 'Verb form: 準備する (to prepare).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m2-q1',
              skill: 'reading',
              prompt: 'What is the difference between 「納豆を食べたことがある」 and 「納豆を食べることがある」?',
              options: [
                'First = have tried eating natto before; Second = sometimes eat natto',
                'Both mean "want to eat natto tomorrow"',
                'First = never ate natto; Second = eat natto every day',
              ],
              correctIndex: 0,
              explanation: 'Vたことがある = past life experience; Vることがある = occasional occurrence ("sometimes").',
            },
            {
              id: 'ja-a2-m2-q2',
              skill: 'writing',
              prompt: 'Choose the natural sentence for "I study while drinking tea":',
              options: [
                'お茶を飲んでながら勉強します。',
                'お茶を飲みながら勉強します。',
                'お茶を飲むながら勉強します。',
              ],
              correctIndex: 1,
              explanation: 'ながら attaches directly to the ます-stem (飲み + ながら), not the て-form or dictionary form.',
            },
            {
              id: 'ja-a2-m2-q3',
              skill: 'listening',
              prompt: 'Listen to Haruka’s plan. Why is she saving money?',
              audioScript: '今年の冬はアルバイトをしながらお金をためて、春休みに沖縄へ行くつもりです。まだ沖縄へ行ったことがないんです。',
              options: ['To buy a new laptop', 'To visit Okinawa during spring break for the first time', 'To move to Tokyo next month'],
              correctIndex: 1,
              explanation: 'She says 「春休みに沖縄へ行くつもりです。まだ沖縄へ行ったことがないんです。」',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            '私は去年、初めて京都と奈良へ旅行したことがあります。古いお寺を見たり、おいしい和食を食べたりして、本当に楽しかったです。今年の秋は、日本語のポッドキャストを聞きながら旅行の準備をして、今度は北海道へ行くつもりです。',
        },
      },
      {
        id: 'ja-a2-m3',
        weekLabel: 'Weeks 5–6 · Ability & Conditionals',
        title: 'Potential Form (られる・える) & Conditionals (〜と・〜たら・〜なら)',
        focusSkills: ['listening', 'writing'],
        summary:
          'Express abilities and possibilities smoothly using Potential Verbs (話せる・食べられる・できる), and choose accurately among Japanese conditionals (と, たら, ば, なら).',
        objectives: [
          'Conjugate Ichidan, Godan, and Irregular verbs into Potential Form and pair them with particle が.',
          'Select the right conditional: と (automatic/natural result), たら (general "if/when"), and なら (contextual advice).',
          'Handle everyday travel and machine-operation instructions accurately.',
        ],
        grammarCheckpoints: ['Potential Form: Godan -u→-eru / Ichidan -る→-られる / する→できる / 来る→来られる', 'Conditional と (inevitable result / directions) vs. たら (versatile if/when)', 'Contextual conditional なら ("if it’s X, then I recommend...")'],
        keyVocabulary: ['話せる', '押す', '曲がる', '決める', '予約'],
        drills: [
          {
            skill: 'listening',
            title: 'Ticket Machine & Station Directions',
            instruction: 'Listen and catch the exact conditional sequence to buy a ticket and reach the museum.',
            durationMins: 15,
            audioScript: 'この青いボタンを押すと、英語の画面が出ますよ。切符を買ったら、東口から出て右へ曲がってください。まっすぐ歩くと美術館が見えます。',
          },
          {
            skill: 'writing',
            title: 'Travel Tips with なら & たら',
            instruction: 'Write 4 recommendations for a friend visiting your city using なら and たら.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write practical travel advice in Japanese for a friend visiting Japan, using at least two potential verbs and two conditionals (と・たら・なら).',
        lesson: {
          estimatedMins: 35,
          overview:
            'Master potential verbs so you can state what you can do effortlessly, and untangle the Japanese conditional family (と, たら, なら).',
          sections: [
            {
              id: 'ja-a2-m3-s1',
              heading: 'Potential Verbs (Can Do) & The を → が Shift',
              explanation:
                'To say "can do": Godan verbs shift their final -u to -e + る (話す → 話せる, 読む → 読める). Ichidan verbs replace る with られる (食べる → 食べられる; casually 食べれる). Irregulars: する → できる, 来る → 来られる. Crucially, the direct object usually switches from を to が!',
              formula: 'Godan: -u → -eru  |  Ichidan: -ru → -rareru  |  [Object] が [Potential Verb]',
              examples: [
                {
                  target: 'ひらがなは読めますが、漢字はまだ少ししか書けません。',
                  translation: 'I can read hiragana, but I can still only write a few kanji.',
                  highlight: '読めます / 書けません',
                },
                {
                  target: 'このサイトでオンライン予約ができます。',
                  translation: 'You can make an online reservation on this website.',
                  highlight: '予約ができます',
                },
              ],
              proTip:
                'Every potential verb conjugates like an Ichidan verb (話せる → 話せます / 話せない / 話せた)!',
            },
            {
              id: 'ja-a2-m3-s2',
              heading: 'Choosing Between と, たら, and なら',
              explanation:
                'Use と for automatic, inevitable cause-and-effect (machines, seasons, street directions) — NEVER follow と with a command or request! Use たら (past た + ら) as your all-purpose "if/when" that works with requests and wishes. Use なら to pick up a topic the listener just mentioned ("If it’s sushi you want...").',
              formula: 'Vる + と (inevitable result)  |  Vた + ら (if/when + any ending)  |  N/Plain + なら (if talking about X)',
              examples: [
                {
                  target: '春になると、公園の桜が咲きます。',
                  translation: 'When spring comes, the cherry blossoms in the park bloom.',
                  highlight: '春になると',
                },
                {
                  target: '駅に着いたら、電話をください。おいしいラーメンなら駅前の店がおすすめですよ。',
                  translation: 'When you arrive at the station, please call me. If you want tasty ramen, the shop in front of the station is recommended.',
                  highlight: '着いたら / ラーメンなら',
                },
              ],
              proTip:
                'Classic N4 exam error: *"時間があると、映画を見ましょう"* (WRONG — ましょう cannot follow と!). Always switch to たら: 「時間があったら、映画を見ましょう」.',
            },
          ],
          vocabCards: [
            {
              term: '話せる',
              pronunciation: 'はなせる (hanaseru)',
              meaning: 'can speak (potential of 話す)',
              example: '姉は英語と日本語が話せます。',
              exampleNote: 'Godan -す → -せる.',
            },
            {
              term: '押す',
              pronunciation: 'おす (osu)',
              meaning: 'to push / press (a button)',
              example: 'この赤いボタンを押すと、ドアが開きます。',
              exampleNote: 'Frequently tested in N4 machine/elevator listening tracks.',
            },
            {
              term: '曲がる',
              pronunciation: 'まがる (magaru)',
              meaning: 'to turn (a corner)',
              example: '次の角を左へ曲がってください。',
              exampleNote: 'Corner takes を (角を曲がる).',
            },
            {
              term: '決める',
              pronunciation: 'きめる (kimeru)',
              meaning: 'to decide (transitive)',
              example: '旅行の日程が決まったら教えてください。',
              exampleNote: 'Intransitive twin: 決まる.',
            },
            {
              term: '予約',
              pronunciation: 'よやく (yoyaku)',
              meaning: 'reservation / booking',
              example: 'レストランの予約は電話でもできます。',
              exampleNote: 'Verb form: 予約する.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m3-q1',
              skill: 'writing',
              prompt: 'Which conditional sentence is grammatically CORRECT?',
              options: [
                '日本へ行くと、ぜひ温泉に入ってください。',
                '日本へ行ったら、ぜひ温泉に入ってください。',
                '日本へ行くたら、ぜひ温泉に入ってください。',
              ],
              correctIndex: 1,
              explanation: 'Polite requests (〜てください) cannot follow と; use た-form + ら (行ったら).',
            },
            {
              id: 'ja-a2-m3-q2',
              skill: 'reading',
              prompt: 'What is the correct Potential Form of 泳ぐ (to swim) and 飲む (to drink)?',
              options: ['泳げる / 飲める', '泳ぎる / 飲みる', '泳がれる / 飲まれる'],
              correctIndex: 0,
              explanation: 'Godan potential shifts -u to -e + る: 泳ぐ → 泳げる, 飲む → 飲める.',
            },
            {
              id: 'ja-a2-m3-q3',
              skill: 'listening',
              prompt: 'Listen to the instructions. What happens when you press the blue button?',
              audioScript: 'この青いボタンを押すと、英語の画面が出ますよ。切符を買ったら、東口から出て右へ曲がってください。まっすぐ歩くと美術館が見えます。',
              options: ['The English screen appears', 'The ticket gate opens', 'A map prints out'],
              correctIndex: 0,
              explanation: '「青いボタンを押すと、英語の画面が出ます」 = pressing the blue button brings up the English screen.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            'もし春に日本へ来たら、ぜひ京都へ行ってください。桜の季節になると、公園がとてもきれいになります。おいしい和菓子なら、祇園の古いお店がおすすめです。今はスマホのアプリで新幹線の予約も簡単にできますから、とても便利ですよ。',
        },
      },
      {
        id: 'ja-a2-m4',
        weekLabel: 'Week 7 · Perspective & Favors',
        title: 'Giving & Receiving (あげる・くれる・もらう) & Everyday Favors',
        focusSkills: ['speaking', 'listening'],
        summary:
          'Master the Japanese perspective compass for gifts and favors — expressing kindness received (〜てくれる), requests granted (〜てもらう), and helpful offers (〜てあげる).',
        objectives: [
          'Choose あげる, くれる, and もらう without reversing giver and receiver.',
          'Express gratitude naturally using 〜てくれてありがとう and 〜てもらいました.',
          'Ask polite favors with 「〜てもらえませんか / 〜ていただけませんか」.',
        ],
        grammarCheckpoints: ['Core triad: あげる (outward) / くれる (inward to me) / もらう (receive from)', 'Benefactive favors: Vてあげる / Vてくれる / Vてもらう', 'Polite favor requests: 〜てもらえませんか (Could you do ~ for me?)'],
        keyVocabulary: ['あげる', 'くれる', 'もらう', '手伝う', '送る'],
        drills: [
          {
            skill: 'listening',
            title: 'Birthday & Favor Dialogue',
            instruction: 'Listen carefully and track WHO gave what to WHOM.',
            durationMins: 15,
            audioScript: '昨日、誕生日に姉が新しい腕時計をくれたんだ。それに、友だちのタカシが駅まで車で送ってくれたから、本当にうれしかったよ。',
          },
          {
            skill: 'speaking',
            title: 'Gratitude & Polite Favor Practice',
            instruction: 'Thank someone for helping you move and ask a colleague politely to check your Japanese email.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write or speak a short Japanese story about a time a friend or family member helped you, using くれる, もらう, and a polite favor request.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Unlock one of Japanese’s most culturally vital systems: encoding speaker perspective and gratitude directly inside giving and receiving verbs.',
          sections: [
            {
              id: 'ja-a2-m4-s1',
              heading: 'The Perspective Compass: あげる vs. くれる vs. もらう',
              explanation:
                'Imagine yourself (and your family/inner circle) at the center. Arrow going OUT (I → someone, or A → B) = あげる. Arrow coming IN toward ME (someone → me/my family) = くれる. Receiving FROM someone (I ← someone に/から) = もらう.',
              formula: 'Giver は Receiver に [Item] を あげる / くれる  |  Receiver は Giver に [Item] を もらう',
              examples: [
                {
                  target: '誕生日に母が私にきれいなセーターをくれました。',
                  translation: 'On my birthday, my mother gave me a nice sweater.',
                  highlight: '母が ... くれました',
                },
                {
                  target: '私は誕生日に母にきれいなセーターをもらいました。',
                  translation: 'I received a nice sweater from my mother on my birthday.',
                  highlight: '母に ... もらいました',
                },
              ],
              proTip:
                'Golden rule: Whenever the receiver is 私 (me) or my family, NEVER use あげる! Always switch to くれる (giver as subject) or もらう (receiver as subject).',
            },
            {
              id: 'ja-a2-m4-s2',
              heading: 'Exchanging Favors: 〜てくれる・〜てもらう・〜てもらえませんか',
              explanation:
                'Attach あげる / くれる / もらう to ANY verb’s Te-Form to describe doing a favor! Adding potential negative question 〜てもらえませんか ("Could you kindly do ~ for me?") sounds far warmer and more polite than blunt 〜てください.',
              formula: 'Vて + くれる (kindly did for me)  |  Vて + もらう (had someone do)  |  Vて + もらえませんか (could you...?)',
              examples: [
                {
                  target: '先輩が日本語のレポートをチェックしてくれました。',
                  translation: 'My senior kindly checked my Japanese report for me.',
                  highlight: 'チェックしてくれました',
                },
                {
                  target: 'すみません、この漢字の読み方を教えてもらえませんか。',
                  translation: 'Excuse me, could you tell me how to read this kanji?',
                  highlight: '教えてもらえませんか',
                },
              ],
              proTip:
                'Be careful using 〜てあげる to strangers or bosses — it can imply "I’m doing you a favor". Offer politely with 〜ましょうか ("Shall I...?") instead.',
            },
          ],
          vocabCards: [
            {
              term: 'あげる',
              pronunciation: 'あげる (ageru)',
              meaning: 'to give (outward from speaker or between 3rd parties)',
              example: '友だちに日本のおみやげをあげました。',
              exampleNote: 'Never used when the recipient is 私 (me)!',
            },
            {
              term: 'くれる',
              pronunciation: 'くれる (kureru)',
              meaning: 'to give (inward toward me / my in-group)',
              example: '先生がいい辞書を貸してくれました。',
              exampleNote: 'Highlights the giver’s kindness toward you.',
            },
            {
              term: 'もらう',
              pronunciation: 'もらう (morau)',
              meaning: 'to receive / have someone do a favor',
              example: '駅員さんに道を教えてもらいました。',
              exampleNote: 'Source takes particle に or から.',
            },
            {
              term: '手伝う',
              pronunciation: 'てつだう (tetsudau)',
              meaning: 'to help / assist',
              example: '引っ越しを手伝ってくれてありがとう！',
              exampleNote: 'Godan -う → 手伝って.',
            },
            {
              term: '送る',
              pronunciation: 'おくる (okuru)',
              meaning: 'to send / escort / give a ride',
              example: '雨だったので、父が駅まで送ってくれました。',
              exampleNote: 'Can mean sending mail/messages OR driving someone somewhere.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m4-q1',
              skill: 'writing',
              prompt: 'Choose the ONLY grammatically valid sentence for "My friend taught me Japanese":',
              options: [
                '友だちが私に日本語を教えてあげました。',
                '友だちが私に日本語を教えてくれました。',
                '私が友だちに日本語を教えてくれました。',
              ],
              correctIndex: 1,
              explanation: 'When someone performs a favor FOR YOU (私), you must use くれる (never あげる).',
            },
            {
              id: 'ja-a2-m4-q2',
              skill: 'listening',
              prompt: 'Listen carefully. Who drove the speaker to the station?',
              audioScript: '昨日、誕生日に姉が新しい腕時計をくれたんだ。それに、友だちのタカシが駅まで車で送ってくれたから、本当にうれしかったよ。',
              options: ['Their older sister', 'Their friend Takashi', 'A taxi driver'],
              correctIndex: 1,
              explanation: '「友だちのタカシが駅まで車で送ってくれた」 = their friend Takashi drove them to the station.',
            },
            {
              id: 'ja-a2-m4-q3',
              skill: 'speaking',
              prompt: 'Which phrase is the politest way to ask a colleague to take a photo for you?',
              options: [
                '写真を撮ってあげますか。',
                'すみません、写真を撮ってもらえませんか。',
                '写真を撮れ！',
              ],
              correctIndex: 1,
              explanation: '〜てもらえませんか politely asks someone to do a favor for you.',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            '先週、新しいアパートに引っ越したとき、友だちのケンジさんが荷物を運ぶのを手伝ってくれました。それから、お姉さんがおいしいカレーを作ってくれて、本当にうれしかったです。今度、お礼に二人を晩ごはんに招待しようと思っています。',
        },
      },
      {
        id: 'ja-a2-m5',
        weekLabel: 'Week 8 · States & Completion',
        title: 'Transitive/Intransitive Pairs, Prepared States (〜てある・〜ておく) & Regret (〜てしまう)',
        focusSkills: ['reading', 'writing'],
        summary:
          'Describe visible states cleanly using intransitive 〜ている vs. intentional preparation 〜てある / 〜ておく, and express complete finish or accidental mishaps with 〜てしまう.',
        objectives: [
          'Distinguish core N4 pairs: 開ける/開く, 閉める/閉まる, つける/つく, 消す/消える, 壊す/壊れる.',
          'Contrast 「ドアが開いています」(state) vs. 「ドアが開けてあります」(deliberately left open) vs. 「準備しておきます」(prepare in advance).',
          'Use 〜てしまう (casual 〜ちゃう) for both full completion and unintentional regret.',
        ],
        grammarCheckpoints: ['Intransitive Vている (resulting state) vs. Transitive Vてある (prepared state)', 'Advance preparation: Transitive Vておく (do in advance / leave as is)', 'Completion or regret: Vてしまう (casual 〜ちゃう / 〜じゃう)'],
        keyVocabulary: ['開く', '消える', '壊れる', '片づける', '間違える'],
        drills: [
          {
            skill: 'reading',
            title: 'Office Checklist Note',
            instruction: 'Read the manager’s memo and identify what has ALREADY been prepared vs. what still needs to be done.',
            durationMins: 15,
            samplePassage: '会議室のエアコンはもうつけてあります。資料も机の上に並べておきました。でも、プロジェクターが壊れてしまったので、すぐ修理を頼んでください。',
          },
          {
            skill: 'writing',
            title: 'Preparation & Mishap Report',
            instruction: 'Write 4 sentences about preparing for a party using 〜ておく and one small mishap using 〜てしまいました.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a short Japanese note explaining what you prepared in advance for a guest (〜てある / 〜ておく) and one accidental mistake (〜てしまう).',
        lesson: {
          estimatedMins: 35,
          overview:
            'Sound authentically Japanese by choosing the exact aspect helper (ている, てある, ておく, てしまう) for states, foresight, and accidental mishaps.',
          sections: [
            {
              id: 'ja-a2-m5-s1',
              heading: 'State (自動詞 + ている) vs. Deliberate Prep (他動詞 + てある / ておく)',
              explanation:
                'Report a simple observation with Intransitive + ている (電気がついています = The light is on). To show someone intentionally prepared something for a purpose, use Transitive + てある (飲み物が冷やしてあります = Drinks have been chilled). To say you DO something in advance for later, use 〜ておく.',
              formula: 'Nが + Intransitive ています  |  Nが + Transitive てあります  |  Nを + Transitive ておきます',
              examples: [
                {
                  target: '部屋の電気が消えています。だれもいないようです。',
                  translation: 'The room light is off. Nobody seems to be there.',
                  highlight: '電気が消えています',
                },
                {
                  target: 'お客さんが来る前に、部屋を掃除しておきました。',
                  translation: 'Before the guests arrived, I cleaned the room in advance.',
                  highlight: '掃除しておきました',
                },
              ],
              proTip:
                'Notice the particle shift with 〜てある: 「窓を開ける」 takes を, but in 「窓が開けてあります」 it usually shifts to が because we are focusing on the resulting state of the window!',
            },
            {
              id: 'ja-a2-m5-s2',
              heading: 'Two Flavors of 〜てしまう (Totally Finished vs. Oops!)',
              explanation:
                '〜てしまう signals finality. With intentional actions it means "finished completely" (本を全部読んでしまいました). With mishaps it adds empathy/regret ("accidentally / unfortunately"): 「財布を落としてしまいました」(Oh no, I dropped my wallet!).',
              formula: 'Vて + しまいます / しまいました (Polite)  |  Vちゃう / Vじゃう (Casual spoken)',
              examples: [
                {
                  target: '急いでいたので、電車に傘を忘れてしまいました。',
                  translation: 'Because I was in a hurry, I accidentally left my umbrella on the train.',
                  highlight: '忘れてしまいました',
                },
                {
                  target: '面白かったので、その小説を一晩で読んでしまいました。',
                  translation: 'Because it was so interesting, I finished reading the whole novel in one night.',
                  highlight: '読んでしまいました',
                },
              ],
              proTip:
                'In casual speech, listen closely for contractions: 忘れてしまった → 忘れちゃった, 飲んでしまった → 飲んじゃった!',
            },
          ],
          vocabCards: [
            {
              term: '開く',
              pronunciation: 'あく (aku)',
              meaning: 'to open (intransitive)',
              example: '自動ドアが開いています。',
              exampleNote: 'Transitive partner: 開ける (あける).',
            },
            {
              term: '消える',
              pronunciation: 'きえる (kieru)',
              meaning: 'to go out / disappear (intransitive)',
              example: '急にパソコンの画面が消えてしまいました。',
              exampleNote: 'Transitive partner: 消す (けす).',
            },
            {
              term: '壊れる',
              pronunciation: 'こわれる (kowareru)',
              meaning: 'to break down (intransitive)',
              example: '古いエアコンが壊れてしまいました。',
              exampleNote: 'Transitive partner: 壊す (こわす).',
            },
            {
              term: '片づける',
              pronunciation: 'かたづける (katazukeru)',
              meaning: 'to tidy up / put away',
              example: '会議の後でいすを片づけておいてください。',
              exampleNote: 'Intransitive partner: 片づく.',
            },
            {
              term: '間違える',
              pronunciation: 'まちがえる (machigaeru)',
              meaning: 'to make a mistake / mix up',
              example: '乗る電車を間違えてしまいました。',
              exampleNote: 'Very common with 〜てしまう in N4 listening!',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m5-q1',
              skill: 'reading',
              prompt: 'Look at the memo: 「会議室のエアコンはもうつけてあります。」 What does this imply?',
              options: [
                'Someone deliberately turned the AC on beforehand for the meeting',
                'The AC turned itself on by accident',
                'The AC is currently broken',
              ],
              correctIndex: 0,
              explanation: 'Transitive つける + てあります highlights a deliberately prepared state.',
            },
            {
              id: 'ja-a2-m5-q2',
              skill: 'writing',
              prompt: 'Fill in the blank: 「お客さんが来る前に、テーブルにコップを並べて___。」',
              options: ['おきました', 'しまいました', 'いました'],
              correctIndex: 0,
              explanation: 'Doing something beforehand for a future event takes 〜ておきます (並べておきました).',
            },
            {
              id: 'ja-a2-m5-q3',
              skill: 'listening',
              prompt: 'Listen to the message. What went wrong?',
              audioScript: 'ごめん！今朝、急いで家を出たから、財布を机の上に忘れてきちゃった。駅で気づいたんだよ。',
              options: ['They missed the last train', 'They accidentally left their wallet on the desk at home', 'They broke their phone'],
              correctIndex: 1,
              explanation: '忘れてきちゃった is the casual contraction of 忘れてきてしまった (accidentally left behind).',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            '今日の夕方、友だちが遊びに来るので、午前中に部屋を片づけておきました。冷蔵庫には冷たいお茶も用意してあります。ただ、さっきケーキを買いに行ったとき、道を間違えてしまって少しおそくなりました。でも、なんとか間に合いました。',
        },
      },
      {
        id: 'ja-a2-m6',
        weekLabel: 'Weeks 9–10 · Advice, Keigo Basics & N4 Exam',
        title: 'Advice (〜ほうがいい), Obligation, Basic Keigo & JLPT N4 Integration',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Give clear advice (〜ほうがいい), express obligation and non-necessity (〜なければなりません / 〜なくてもいい), recognize core N4 Keigo phrases, and clear the JLPT N4 exam.',
        objectives: [
          'Distinguish 〜たほうがいい (strong advice) from 〜ないほうがいい (warning against).',
          'Handle clinic/school rules using 〜なければなりません and 〜なくてもいいです.',
          'Recognize foundational respectful & humble verbs (いらっしゃる, おっしゃる, 参る, いただく) and pass the A2 Simulated Exam.',
        ],
        grammarCheckpoints: ['Advice: Vたほうがいいです / Vないほうがいいです', 'Obligation: Vなければなりません vs. No need: Vなくてもいいです', 'Introductory Keigo: お+Vstem+になる (respectful) & お+Vstem+する (humble)'],
        keyVocabulary: ['薬', '無理', '必要', 'いらっしゃる', 'いただく'],
        drills: [
          {
            skill: 'listening',
            title: 'Clinic Doctor’s Instructions',
            instruction: 'Listen and catch what the patient MUST do vs. what they do NOT need to do.',
            durationMins: 15,
            audioScript: '熱が少しありますね。この薬は毎食後に飲まなければなりません。明日は会社を休んだほうがいいですよ。シャワーは入ってもいいですが、長いお風呂は入らないほうがいいです。',
          },
          {
            skill: 'speaking',
            title: 'Friendly Advice & Polite Shop Interaction',
            instruction: 'Give a sick friend 3 pieces of advice using 〜たほうがいい and 〜なくてもいいです.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a caring Japanese message giving health or study advice to a tired friend using 〜たほうがいい, 〜ないほうがいい, and 〜なくてもいいです.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Complete your A2/JLPT N4 foundation by mastering advice, obligation, and introductory honorifics for smooth life in Japan.',
          sections: [
            {
              id: 'ja-a2-m6-s1',
              heading: 'Giving Advice (〜たほうがいい) & Obligation (〜なければなりません)',
              explanation:
                'For affirmative advice ("you’d better..."), attach ほうがいい to the PAST た-form (休んだほうがいい). For negative advice ("you’d better not..."), attach it to the ない-form (無理をしないほうがいい). For strict rules, drop い from ない and add ければなりません.',
              formula: 'Vた + ほうがいい (should)  |  Vない + ほうがいい (shouldn’t)  |  Vなければなりません (must)',
              examples: [
                {
                  target: '風邪のときは、温かいものを食べて早く寝たほうがいいですよ。',
                  translation: 'When you have a cold, you’d better eat something warm and sleep early.',
                  highlight: '早く寝たほうがいい',
                },
                {
                  target: '明日は休みですから、早く起きなくてもいいです。',
                  translation: 'Tomorrow is a holiday, so you don’t have to wake up early.',
                  highlight: '起きなくてもいいです',
                },
              ],
              proTip:
                'Never confuse 〜てはいけません (MUST NOT / prohibited) with 〜なくてもいいです (DON’T HAVE TO / optional)!',
            },
            {
              id: 'ja-a2-m6-s2',
              heading: 'First Steps into Keigo (尊敬語 & 謙譲語 Basics)',
              explanation:
                'At N4/A2, you encounter Keigo everywhere in shops, trains, and workplaces. Recognize the two productive templates: お + Vます-stem + になります (elevating someone else’s action) and お + Vます-stem + します (humbling your own action toward someone).',
              formula: 'Respectful: お[V-stem]になります / いらっしゃる  |  Humble: お[V-stem]します / いただく',
              examples: [
                {
                  target: '先生はもう教室にいらっしゃいますか。',
                  translation: 'Is the teacher already in the classroom?',
                  highlight: 'いらっしゃいます',
                },
                {
                  target: '重い荷物ですね。私がお持ちしましょうか。',
                  translation: 'That’s heavy luggage. Shall I humbly carry it for you?',
                  highlight: 'お持ちしましょうか',
                },
              ],
              proTip:
                'いらっしゃいます covers THREE verbs politely: 行く (go), 来る (come), and いる (be) — check the particle (に/へ) to know which one it means!',
            },
          ],
          vocabCards: [
            {
              term: '薬',
              pronunciation: 'くすり (kusuri)',
              meaning: 'medicine',
              example: '食後にこの薬を飲んでください。',
              exampleNote: 'Verb is ALWAYS 飲む (drink), even for pills!',
            },
            {
              term: '無理',
              pronunciation: 'むり (muri)',
              meaning: 'overdoing it / impossible',
              example: '疲れているときは無理をしないほうがいいですよ。',
              exampleNote: '「無理しないでね」 is a warm everyday way to say "Don’t push yourself".',
            },
            {
              term: '必要',
              pronunciation: 'ひつよう (hitsuyō)',
              meaning: 'necessary / required (な-adjective)',
              example: '申し込みには学生証が必要です。',
              exampleNote: 'Takes particle が for the needed item.',
            },
            {
              term: 'いらっしゃる',
              pronunciation: 'いらっしゃる (irassharu)',
              meaning: 'to go / come / be (respectful)',
              example: '部長は今、会議室にいらっしゃいます。',
              exampleNote: 'Polite form drops る→い: いらっしゃいます.',
            },
            {
              term: 'いただく',
              pronunciation: 'いただく (itadaku)',
              meaning: 'to receive / eat / drink (humble)',
              example: 'おいしいお菓子をいただきました。',
              exampleNote: 'Origin of mealtime 「いただきます」!',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-a2-m6-q1',
              skill: 'listening',
              prompt: 'Listen to the doctor. What does the doctor advise the patient NOT to do?',
              audioScript: '熱が少しありますね。この薬は毎食後に飲まなければなりません。明日は会社を休んだほうがいいですよ。シャワーは入ってもいいですが、長いお風呂は入らないほうがいいです。',
              options: ['Take a quick shower', 'Take a long bath', 'Drink water'],
              correctIndex: 1,
              explanation: '「長いお風呂は入らないほうがいいです」 = you’d better not take a long bath.',
            },
            {
              id: 'ja-a2-m6-q2',
              skill: 'writing',
              prompt: 'How do you say "You don’t need to bring a dictionary tomorrow"?',
              options: [
                '明日は辞書を持ってきてはいけません。',
                '明日は辞書を持ってこなくてもいいです。',
                '明日は辞書を持ってこなければなりません。',
              ],
              correctIndex: 1,
              explanation: '〜なくてもいいです expresses non-necessity ("don’t have to"), whereas 〜てはいけません means prohibition.',
            },
            {
              id: 'ja-a2-m6-q3',
              skill: 'reading',
              prompt: 'Which polite offer uses Humble Keigo (お + V-stem + します) correctly?',
              options: ['私が荷物をお持ちしましょうか。', '私が荷物をお持ちになりますか。', '先生がお持ちします。'],
              correctIndex: 0,
              explanation: 'Lowering your own action (私) for someone else uses お + V-stem + します (お持ちしましょうか).',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 40,
          checkpointModelAnswer:
            'ユキさん、毎日残業で大変そうですね。あまり無理をしないほうがいいですよ。今週末は家でゆっくり休んで、好きな映画を見たり温かいお茶を飲んだりしたほうがいいと思います。月曜日の資料は私が少し手伝えますから、全部一人でやらなくてもいいですよ。',
        },
      },
    ],
  },

  // =====================================================================
  // B1 (JLPT N3) · STAGE 3: INDEPENDENT FLUENCY
  // =====================================================================
  {
    id: 'ja-intensive-b1',
    languageId: 'japanese',
    level: 'B1',
    title: 'Japanese B1 / JLPT N3 Independent Bridge Intensive',
    subtitle:
      'Bridge textbook Japanese to real-world fluency: passive & causative voice, conjecture nuances (そうだ・ようだ・らしい), workplace keigo, and everyday newspaper reading.',
    heroRole: 'Stage 3 · Independent Fluency (JLPT N3)',
    durationWeeks: 12,
    dailyHours: '2.0–2.5 hrs/day (Intensive)',
    targetCertificates: ['JLPT N3 (CEFR B1)', 'JF Standard B1 (Marugoto Intermediate)'],
    passingCriteria: 'JLPT N3 scaled score ≥ 95/180 (min 19/60 in Vocabulary/Grammar, Reading, and Listening) + coherent B1 discourse.',
    examBlueprint: {
      reading: '70 mins · ~650 kanji, short articles, emails, comparative notices, and medium opinion essays (400–600 chars).',
      listening: '40 mins · Near-natural speed workplace & everyday conversations, radio interviews, and unspoken implication checks.',
      writing: '35 mins · Cohesive opinion essays and workplace emails using 〜おかげで, 〜のに, 〜ことにする, and clean keigo.',
      speaking: '12 mins · Explaining processes, narrating inconveniences (passive/causative), defending opinions, and polite office discussions.',
    },
    referenceIds: ['ref-ja-jlpt-n3n2', 'ref-ja-jlpt-hub', 'ref-ja-marugoto', 'ref-ja-nhk'],
    modules: [
      {
        id: 'ja-b1-m1',
        weekLabel: 'Weeks 1–2 · Voice Mechanics',
        title: 'Passive (受身), Causative (使役) & Causative-Passive Voice',
        focusSkills: ['writing', 'speaking'],
        summary:
          'Master the Japanese voice engine — expressing both neutral passives and "adversative suffering passives" (雨に降られた), giving permission/instructions (〜させる), and being made to do something (〜させられる).',
        objectives: [
          'Conjugate Passive (〜られる/〜あれる), Causative (〜させる/〜あせる), and Causative-Passive accurately.',
          'Use the unique Japanese "suffering passive" (電車で足を踏まれた / 雨に降られた) naturally.',
          'Ask polite permission with causative + いただく (「少し休ませていただけますか」).',
        ],
        grammarCheckpoints: ['Direct & Adversative Passive (〜に〜られる)', 'Causative "make/let" (〜に〜を〜させる) & Polite 「〜させてください」', 'Causative-Passive (〜させられる / shortened 〜される)'],
        keyVocabulary: ['ほめる', '怒る', '踏む', '発表する', '参加する'],
        drills: [
          {
            skill: 'listening',
            title: 'Commuter Bad-Day Story',
            instruction: 'Listen and list the three inconvenient things that happened to Daiki using passive/causative verbs.',
            durationMins: 15,
            audioScript: '今日は最悪だったよ。朝、満員電車で足を踏まれたし、帰りに急な雨に降られたんだ。それに、部長に長い資料を作り直させられたんだよ。',
          },
          {
            skill: 'speaking',
            title: 'Polite Permission & Childhood Story',
            instruction: 'Tell a 60-second story about what your parents made you do as a child and ask your boss politely to let you lead a project.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a short Japanese story about a busy or challenging day using at least one suffering passive, one causative, and one causative-passive verb.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Command the three voice transformations that separate N4 learners from fluent N3 speakers: Passive, Causative, and Causative-Passive.',
          sections: [
            {
              id: 'ja-b1-m1-s1',
              heading: 'Japanese Passive & The Adversative "Suffering Passive"',
              explanation:
                'Godan verbs shift -u → -a + れる (踏む → 踏まれる); Ichidan drop る + られる (ほめる → ほめられる); する → される; 来る → 来られる. Unlike English, Japanese can passivize INTRANSITIVE verbs to show you were negatively affected: 「雨に降られました」(I got rained on!).',
              formula: '[Affected Person] は [Agent] に ([Object] を) [Passive Verb]',
              examples: [
                {
                  target: '昨日のプレゼンで、社長にほめられました。',
                  translation: 'At yesterday’s presentation, I was praised by the company president.',
                  highlight: '社長にほめられました',
                },
                {
                  target: '傘を持っていなかったので、帰り道に雨に降られてしまいました。',
                  translation: 'Because I had no umbrella, I unfortunately got rained on on the way home.',
                  highlight: '雨に降られてしまいました',
                },
              ],
              proTip:
                'When an inanimate thing is created or built (historical fact), mark the creator with によって instead of に: 「このお寺は有名な建築家によって建てられました」.',
            },
            {
              id: 'ja-b1-m1-s2',
              heading: 'Causative (Make/Let) & Causative-Passive (Made To)',
              explanation:
                'Causative (Godan -u → -a + せる, Ichidan + させる, する → させる) means BOTH "make someone do" and "let someone do". Combine with ください/いただけますか for ultra-natural polite requests: 「私に説明させてください」(Please let me explain). Combine causative + passive (〜させられる; Godan non-す shortens to 〜される like 飲まされる) for "be forced to do".',
              formula: 'Causative: 〜に〜させる  |  Polite permission: 〜させていただけますか  |  Forced: 〜させられる',
              examples: [
                {
                  target: 'すみません、明日は家族の用事があるので、少し早く帰らせていただけますか。',
                  translation: 'Excuse me, I have a family errand tomorrow — could you let me leave a little early?',
                  highlight: '帰らせていただけますか',
                },
                {
                  target: '子どものころ、母に毎日ピアノを練習させられました。',
                  translation: 'When I was a child, my mother made me practice piano every day.',
                  highlight: '練習させられました',
                },
              ],
              proTip:
                'Godan verbs ending in す (話す) NEVER shorten in causative-passive: always 話させられる (not *話される*, which is plain passive!).',
            },
          ],
          vocabCards: [
            {
              term: 'ほめる',
              pronunciation: 'ほめる (homeru)',
              meaning: 'to praise / compliment',
              example: '先生に発音をほめられてうれしかったです。',
              exampleNote: 'Ichidan → Passive: ほめられる.',
            },
            {
              term: '怒る',
              pronunciation: 'おこる (okoru) / しかる',
              meaning: 'to get angry / scold',
              example: '遅刻して上司に怒られました。',
              exampleNote: 'For scolding specifically, 叱る (しかる) → 叱られる is also common.',
            },
            {
              term: '踏む',
              pronunciation: 'ふむ (fumu)',
              meaning: 'to step on',
              example: 'ラッシュの電車で足を踏まれました。',
              exampleNote: 'Classic suffering-passive example.',
            },
            {
              term: '発表する',
              pronunciation: 'はっぴょうする (happyō suru)',
              meaning: 'to present / announce',
              example: '会議で新しい企画を発表させてもらいました。',
              exampleNote: 'Pair with 〜させてもらう for modest workplace tone.',
            },
            {
              term: '参加する',
              pronunciation: 'さんかする (sanka suru)',
              meaning: 'to participate / join',
              example: 'ぜひそのプロジェクトに参加させてください。',
              exampleNote: 'Event takes particle に (会議に参加する).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m1-q1',
              skill: 'writing',
              prompt: 'Select the natural polite sentence for "Could you let me take a day off tomorrow?"',
              options: [
                '明日、休ませていただけますか。',
                '明日、休まれていただけますか。',
                '明日、休まさせられますか。',
              ],
              correctIndex: 0,
              explanation: 'Causative 休ませる + ていただけますか politely asks for permission to rest.',
            },
            {
              id: 'ja-b1-m1-q2',
              skill: 'listening',
              prompt: 'Listen to Daiki. What did his manager make him do?',
              audioScript: '今日は最悪だったよ。朝、満員電車で足を踏まれたし、帰りに急な雨に降られたんだ。それに、部長に長い資料を作り直させられたんだよ。',
              options: ['Attend an early breakfast meeting', 'Redo a long document', 'Cancel his business trip'],
              correctIndex: 1,
              explanation: '作り直させられた = causative-passive of 作り直す (was made to redo).',
            },
            {
              id: 'ja-b1-m1-q3',
              skill: 'reading',
              prompt: 'What does 「隣の人に夜中まで歌われて、全然寝られなかった」 express?',
              options: [
                'The speaker sang loudly all night',
                'The speaker was negatively affected by a neighbor singing until midnight',
                'The speaker invited the neighbor to sing',
              ],
              correctIndex: 1,
              explanation: 'Adversative passive (隣の人に歌われて) shows the speaker suffered inconvenience from the neighbor’s singing.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            '先週は本当に忙しい一週間でした。月曜日は急な雨に降られてスーツがぬれてしまったし、水曜日は取引先の都合で会議の資料を急に作り直させられました。それでも、金曜日の発表では部長に「わかりやすい」とほめられたので、頑張ってよかったです。来月は新しいプロジェクトにも参加させてもらいたいと思っています。',
        },
      },
      {
        id: 'ja-b1-m2',
        weekLabel: 'Weeks 3–4 · Nuance & Evidence',
        title: 'Conjecture, Hearsay & Appearance (そうだ・ようだ・らしい・みたいだ)',
        focusSkills: ['reading', 'listening'],
        summary:
          'Stop mixing up the four "seems/looks like" expressions! Calibrate your source of evidence cleanly: direct visual impression (そうだ), hearsay (そうだ), sensory deduction (ようだ/みたいだ), and reliable report/quintessence (らしい).',
        objectives: [
          'Separate Visual Appearance (V-stem + そうだ: "looks about to") from Hearsay (Plain + そうだ: "I heard that").',
          'Use ようだ (formal/written) and みたいだ (spoken) for sensory inference and similes.',
          'Use らしい both for reliable secondhand info and quintessential traits (「春らしい天気」).',
        ],
        grammarCheckpoints: ['Appearance (V-stem/Adj-stem + そうだ) vs. Hearsay (Plain + そうだ)', 'Sensory inference & metaphor: 〜ようだ (formal) / 〜みたいだ (conversational)', 'Reliable hearsay & typicality: 〜らしい (Plain + らしい / Noun + らしい)'],
        keyVocabulary: ['天気予報', '雰囲気', 'うわさ', '匂い', '春らしい'],
        drills: [
          {
            skill: 'listening',
            title: 'Weather & Office Rumor Nuance Check',
            instruction: 'Listen and distinguish which statements are visual guesses vs. things heard from the news/colleagues.',
            durationMins: 15,
            audioScript: '空が暗くなってきたから、今にも雨が降りそうだね。天気予報によると、午後から風も強くなるそうだよ。あ、玄関の傘がないから、田中さんはもう帰ったみたいだ。',
          },
          {
            skill: 'reading',
            title: 'Restaurant Review Comparison',
            instruction: 'Read the review and identify what is direct experience vs. secondhand reputation.',
            durationMins: 15,
            samplePassage: '駅前にできたイタリアンは、うわさによると予約が取れないほど人気らしいです。外から見ると、とてもおしゃれな雰囲気のようです。今度行ってみましょう。',
          },
        ],
        checkpointPrompt: 'Write a short Japanese paragraph describing today’s weather, a rumor about a new café, and a personal observation using そうだ, ようだ/みたいだ, and らしい.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Pinpoint how Japanese speakers signal certainty and evidence source using the four indispensable conjecture markers.',
          sections: [
            {
              id: 'ja-b1-m2-s1',
              heading: 'The Two そうだs: Visual Impression vs. Hearsay',
              explanation:
                'Attachment changes the meaning 100%! Stem + そうだ means "looks like / about to happen" based on your own eyes (雨が降りそうだ = looks about to rain; おいしそうだ = looks delicious; watch いい → よさそうだ!). Full Plain Form + そうだ means "I heard / read that..." (雨が降るそうだ = I heard it will rain).',
              formula: 'Visual: Vます-stem / Adj-stem + そうだ  |  Hearsay: [Full Plain Form] + そうだ',
              examples: [
                {
                  target: 'ボタンが取れそうですよ。気をつけてください。',
                  translation: 'Your button looks like it is about to come off! Please be careful.',
                  highlight: '取れそうです',
                },
                {
                  target: 'ニュースによると、来月から電気代が上がるそうです。',
                  translation: 'According to the news, electricity bills will go up starting next month.',
                  highlight: '上がるそうです',
                },
              ],
              proTip:
                'Appearance そうだ NEVER attaches to nouns (you cannot say *"雨そうだ"*), and Hearsay そうだ NEVER conjugates to past *"そうでした"*!',
            },
            {
              id: 'ja-b1-m2-s2',
              heading: 'Sensory Deduction (ようだ・みたいだ) vs. Reliable Report / Typicality (らしい)',
              explanation:
                'ようだ (written/formal) and みたいだ (everyday speech) express your direct sensory conclusion ("judging by the smell/sound, it seems...") or similes ("like snow"). らしい signals an objective report you heard/read OR quintessential quality ("truly spring-like" = 春らしい).',
              formula: 'V/い-adj + ようだ / Nのようだ  |  Plain + みたいだ (no の!)  |  Plain + らしい',
              examples: [
                {
                  target: 'キッチンからいい匂いがします。母がカレーを作っているようです。',
                  translation: 'There’s a nice smell from the kitchen. It seems Mom is making curry.',
                  highlight: '作っているようです',
                },
                {
                  target: '今日は暖かくて、やっと春らしい天気になりましたね。',
                  translation: 'Today is warm — it has finally become truly spring-like weather, hasn’t it?',
                  highlight: '春らしい天気',
                },
              ],
              proTip:
                'Grammar precision check: Noun + の + ようだ (雪のようだ), but Noun + みたいだ takes NO の (雪みたいだ)!',
            },
          ],
          vocabCards: [
            {
              term: '天気予報',
              pronunciation: 'てんきよほう (tenki yohō)',
              meaning: 'weather forecast',
              example: '天気予報によると、明日は晴れるそうです。',
              exampleNote: 'Often paired with 〜によると (according to).',
            },
            {
              term: '雰囲気',
              pronunciation: 'ふんいき (fun’iki)',
              meaning: 'atmosphere / vibe',
              example: 'あの喫茶店は落ち着いた雰囲気のようです。',
              exampleNote: 'Watch spelling: ふんいき (NOT *ふいんき*!).',
            },
            {
              term: 'うわさ',
              pronunciation: 'うわさ (uwasa)',
              meaning: 'rumor / word going around',
              example: 'うわさによると、来月新しい店長が来るらしいです。',
              exampleNote: 'Often triggers hearsay そうだ or らしい.',
            },
            {
              term: '匂い',
              pronunciation: 'におい (nioi)',
              meaning: 'smell / scent',
              example: 'パンを焼くいい匂いがします。',
              exampleNote: 'Sensory verbs use がする (音がする, 味がする, 匂いがする).',
            },
            {
              term: '春らしい',
              pronunciation: 'はるらしい (haru-rashii)',
              meaning: 'spring-like / typical of spring',
              example: '桜が咲いて、とても春らしい景色です。',
              exampleNote: 'Noun + らしい conjugates like an い-adjective.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m2-q1',
              skill: 'reading',
              prompt: 'Which sentence means "This cake LOOKS delicious" (visual impression)?',
              options: [
                'このケーキはおいしいそうです。',
                'このケーキはおいしそうです。',
                'このケーキはおいしかったそうです。',
              ],
              correctIndex: 1,
              explanation: 'Drop い before そうだ for visual appearance (おいしそうだ); keeping い (おいしいそうだ) means hearsay ("I heard it’s delicious").',
            },
            {
              id: 'ja-b1-m2-q2',
              skill: 'writing',
              prompt: 'Choose the grammatically accurate sentence for "This winter is as warm as spring":',
              options: [
                '今年の冬は春のようです。',
                '今年の冬は春のみたいです。',
                '今年の冬は春ようです。',
              ],
              correctIndex: 0,
              explanation: 'Noun + のようです is correct; みたいだ never takes の (春のみたい is incorrect).',
            },
            {
              id: 'ja-b1-m2-q3',
              skill: 'listening',
              prompt: 'Listen carefully. Why does the speaker conclude Tanaka already went home?',
              audioScript: '空が暗くなってきたから、今にも雨が降りそうだね。天気予報によると、午後から風も強くなるそうだよ。あ、玄関の傘がないから、田中さんはもう帰ったみたいだ。',
              options: ['Tanaka sent a text message', 'Tanaka’s umbrella is no longer at the entrance', 'The weather forecast mentioned him'],
              correctIndex: 1,
              explanation: '「玄関の傘がないから、田中さんはもう帰ったみたいだ」 = sensory deduction from the missing umbrella.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            'さっき外を見たら、雲が厚くなっていて今にも雨が降りそうでした。天気予報によると、夜には風も強くなるそうです。駅前の新しいカフェは、同僚の話ではチーズケーキが絶品らしいので、明日行ってみるつもりです。窓からのぞいたら、静かで仕事がしやすそうな雰囲気のようでした。',
        },
      },
      {
        id: 'ja-b1-m3',
        weekLabel: 'Weeks 5–6 · Cause & Contrast',
        title: 'Nuanced Conjunctions: のに, おかげで, せいで & うちに',
        focusSkills: ['reading', 'writing'],
        summary:
          'Express emotional contrast ("even though!" = のに), positive credit (おかげで), negative blame (せいで), and timing windows (うちに / あいだに) with native N3 precision.',
        objectives: [
          'Distinguish neutral けれど/が from disappointed/surprised のに ("even though").',
          'Assign credit with おかげで and blame with せいで accurately.',
          'Contrast 間に (during a bounded span) vs. うちに (before a state changes / while the window lasts).',
        ],
        grammarCheckpoints: ['Unexpected contrast: Plain + のに (な-adj/N + なのに)', 'Positive cause 〜おかげで vs. Negative blame 〜せいで', 'Timing window: 〜うちに ("while still..." / "before it changes")'],
        keyVocabulary: ['おかげ', 'せい', 'せっかく', '冷める', '間に合う'],
        drills: [
          {
            skill: 'reading',
            title: 'Contrast & Cause Mini-Editorial',
            instruction: 'Read the paragraph and identify the positive cause vs. the frustrated contrast.',
            durationMins: 15,
            samplePassage: 'せっかく早く家を出たのに、事故のせいで電車が三十分も止まってしまいました。それでも、同僚が先に準備をしてくれたおかげで、会議には無事間に合いました。',
          },
          {
            skill: 'writing',
            title: 'Credit, Blame & Window-of-Opportunity Sentences',
            instruction: 'Write 3 linked sentences combining せっかく〜のに, 〜おかげで, and 〜うちに.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a Japanese reflection about a recent success or setback using のに, おかげで, せいで, and うちに.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Upgrade flat から/けど sentences into emotionally rich N3 discourse using のに, おかげで, せいで, and うちに.',
          sections: [
            {
              id: 'ja-b1-m3-s1',
              heading: 'Frustrated Contrast (のに) & Credit vs. Blame (おかげで・せいで)',
              explanation:
                'のに means "even though" WITH surprise, frustration, or regret — pair it with せっかく ("with much effort") for natural impact! NEVER follow のに with a command or invitation. For causes, use おかげで strictly for GOOD outcomes ("thanks to") and せいで strictly for BAD outcomes ("because of / fault of").',
              formula: 'Plain (+ な) + のに  |  [Good reason] + おかげで  |  [Bad reason] + せいで',
              examples: [
                {
                  target: '毎日二時間も勉強したのに、テストに合格できませんでした。',
                  translation: 'Even though I studied two hours every day, I couldn’t pass the test.',
                  highlight: '勉強したのに',
                },
                {
                  target: '先輩が丁寧に教えてくれたおかげで、仕事に慣れました。',
                  translation: 'Thanks to my senior teaching me carefully, I got used to the job.',
                  highlight: '教えてくれたおかげで',
                },
              ],
              proTip:
                'Watch the N3 trap: using おかげで for bad luck sounds bitterly sarcastic! Use せいで for delays, illness, and mistakes.',
            },
            {
              id: 'ja-b1-m3-s2',
              heading: 'Seizing the Moment: 〜うちに vs. 〜間に',
              explanation:
                'Use 〜うちに when you should act BEFORE the current state disappears ("while the soup is still hot" = 温かいうちに; "before I forget" = 忘れないうちに). It also expresses gradual unintentional change: 「聞いているうちに寝てしまった」(while listening, I fell asleep without realizing it).',
              formula: 'Vる / Vない / Vている / い-adj / な-adjな / Nの + うちに',
              examples: [
                {
                  target: 'せっかく作ったので、スープが冷めないうちに食べてください。',
                  translation: 'I went to the trouble of making it, so please eat the soup before it gets cold.',
                  highlight: '冷めないうちに',
                },
                {
                  target: '日本に住んでいるうちに、全国を旅行してみたいです。',
                  translation: 'While I am still living in Japan, I want to try traveling around the whole country.',
                  highlight: '住んでいるうちに',
                },
              ],
              proTip:
                'Notice the negative verb trick: 忘れないうちに literally means "during the period of not forgetting" = "before you forget"!',
            },
          ],
          vocabCards: [
            {
              term: 'おかげ',
              pronunciation: 'おかげ (okage)',
              meaning: 'thanks to / owed to (positive credit)',
              example: 'みなさんの協力のおかげでイベントが成功しました。',
              exampleNote: 'Everyday greeting: 「おかげさまで元気です」 (Thanks to you, I am well).',
            },
            {
              term: 'せい',
              pronunciation: 'せい (sei)',
              meaning: 'because of / fault of (negative cause)',
              example: '寝不足のせいで、頭が痛いです。',
              exampleNote: 'Noun + のせいで / Plain verb + せいで.',
            },
            {
              term: 'せっかく',
              pronunciation: 'せっかく (sekkaku)',
              meaning: 'with much effort / rare opportunity',
              example: 'せっかく予約したのに、雨で中止になりました。',
              exampleNote: 'Pairs frequently with のに (wasted effort) or から (so let’s enjoy it).',
            },
            {
              term: '冷める',
              pronunciation: 'さめる (sameru)',
              meaning: 'to cool down (intransitive)',
              example: '料理が冷めないうちに召し上がってください。',
              exampleNote: 'Classic collocation with うちに.',
            },
            {
              term: '間に合う',
              pronunciation: 'まにあう (maniau)',
              meaning: 'to be in time for',
              example: '走ったおかげで終電に間に合いました。',
              exampleNote: 'Target event/train takes particle に.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m3-q1',
              skill: 'writing',
              prompt: 'Fill in the blank: 「台風___、飛行機がキャンセルになってしまった。」',
              options: ['のおかげで', 'のせいで', 'のうちに'],
              correctIndex: 1,
              explanation: 'A cancelled flight is a negative outcome, requiring のせいで (because of / fault of).',
            },
            {
              id: 'ja-b1-m3-q2',
              skill: 'reading',
              prompt: 'What does 「暗くならないうちに帰りましょう」 mean?',
              options: [
                'Let’s go home after it gets dark',
                'Let’s go home before it gets dark',
                'Even though it is dark, let’s go home',
              ],
              correctIndex: 1,
              explanation: 'Vない + うちに = "while it has not yet become dark" = "before it gets dark".',
            },
            {
              id: 'ja-b1-m3-q3',
              skill: 'listening',
              prompt: 'Listen carefully. Why was the speaker able to make the meeting on time?',
              audioScript: '今朝、電車の遅延のせいで焦ったけど、駅前のタクシーがすぐつかまったおかげで、なんとか九時の会議に間に合ったよ。',
              options: ['The meeting was postponed', 'They caught a taxi right outside the station', 'The train departed early'],
              correctIndex: 1,
              explanation: '「タクシーがすぐつかまったおかげで」 = thanks to quickly catching a taxi.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            '先月、せっかく週末のハイキングを計画したのに、急な台風のせいで中止になってしまいました。とても残念でしたが、友だちが室内ボルダリングを提案してくれたおかげで、別の楽しい思い出ができました。これから寒くならないうちに、今度こそ山へ登りに行きたいと思っています。',
        },
      },
      {
        id: 'ja-b1-m4',
        weekLabel: 'Weeks 7–8 · Workplace Japanese',
        title: 'Intermediate Keigo (尊敬語・謙譲語) & Professional Japanese Emails',
        focusSkills: ['speaking', 'writing'],
        summary:
          'Operate smoothly inside a Japanese workplace: use irregular honorific verbs (おっしゃる・ご覧になる・拝見する・伺う), Uchi/Soto boundaries, and crisp business email templates.',
        objectives: [
          'Distinguish 尊敬語 (elevating the listener/client) from 謙譲語 (humbling yourself/your company).',
          'Format a clean Japanese workplace email with opening greeting, お世話になっております, and closing.',
          'Handle polite office phone calls and schedule adjustments without double-keigo errors.',
        ],
        grammarCheckpoints: ['Core irregular Keigo pairs: 見る(ご覧になる/拝見する), 聞く(伺う), 言う(おっしゃる/申す)', 'Uchi (in-group) vs. Soto (out-group) rule on phone calls', 'Business email openings & polite requests (ご確認いただけますでしょうか)'],
        keyVocabulary: ['お世話になっております', '拝見する', 'ご覧になる', '伺う', '申し訳ございません'],
        drills: [
          {
            skill: 'listening',
            title: 'External Client Phone Call',
            instruction: 'Listen and catch why Sato is unavailable and what the caller asks the receptionist to pass on.',
            durationMins: 15,
            audioScript: 'お電話ありがとうございます。株式会社さくらでございます。申し訳ございません、佐藤はただいま会議中で席を外しております。戻りましたら折り返しお電話させましょうか。',
          },
          {
            skill: 'writing',
            title: 'Short Workplace Email',
            instruction: 'Write a 120-character polite email thanking a client for sending a PDF and confirming Thursday’s 14:00 meeting.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write a polite Japanese workplace email confirming receipt of a document (拝見する), proposing a meeting time, and closing professionally.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Build workplace credibility in Japan by pairing accurate Respectful/Humble Keigo with real Japanese business email etiquette.',
          sections: [
            {
              id: 'ja-b1-m4-s1',
              heading: 'Respectful (尊敬語) vs. Humble (謙譲語) Core Workplace Pairs',
              explanation:
                'Every workplace action has two sides: when the CLIENT/BOSS does it, elevate with 尊敬語 (ご覧になる = look, おっしゃる = say, いらっしゃる = come/be). When YOU do it toward them, lower yourself with 謙譲語 (拝見する = look at, 申す = say, 伺う = visit/ask, 参る = go/come).',
              formula: 'Client/Boss: ご覧になる / おっしゃる / いらっしゃる  |  Me: 拝見する / 申し上げる / 伺う',
              examples: [
                {
                  target: '先ほどお送りいただいた資料を拝見いたしました。',
                  translation: 'I have humbly reviewed the document you kindly sent earlier.',
                  highlight: 'お送りいただいた / 拝見いたしました',
                },
                {
                  target: '部長は新しい企画について何とおっしゃいましたか。',
                  translation: 'What did the department manager say about the new proposal?',
                  highlight: 'おっしゃいましたか',
                },
              ],
              proTip:
                'Never use 拝見する for someone else’s reading! Saying *"お客様が拝見しました"* lowers the customer — always say 「お客様がご覧になりました」.',
            },
            {
              id: 'ja-b1-m4-s2',
              heading: 'The Uchi/Soto Rule & Clean Business Email Skeleton',
              explanation:
                'When talking to an OUTSIDE client, your entire company — including your CEO! — belongs to your inner circle (ウチ), so drop honorifics and use Humble/Polite forms for your boss: 「社長の鈴木は外出しております」 (NEVER *"鈴木社長はいらっしゃいません"* to a client!).',
              formula: '〇〇様 → いつもお世話になっております。[Company] の [Name] です。→ Body → よろしくお願いいたします。',
              examples: [
                {
                  target: '恐れ入りますが、明日までにご確認いただけますでしょうか。',
                  translation: 'I am sorry to trouble you, but could you kindly review this by tomorrow?',
                  highlight: '恐れ入りますが / ご確認いただけますでしょうか',
                },
                {
                  target: '申し訳ございませんが、田中はただいま外出しております。',
                  translation: 'I am very sorry, but Tanaka is currently out of the office.',
                  highlight: '外出しております',
                },
              ],
              proTip:
                'Add cushion phrases (クッション言葉) like 恐れ入りますが ("Excuse me for troubling you, but...") before requests to sound effortlessly professional.',
            },
          ],
          vocabCards: [
            {
              term: 'お世話になっております',
              pronunciation: 'おせわになっております (osewa ni natte orimasu)',
              meaning: 'Thank you for your continued support (standard business greeting)',
              example: 'いつも大変お世話になっております。株式会社ミライの田中です。',
              exampleNote: 'Opens virtually every Japanese business email and client call.',
            },
            {
              term: '拝見する',
              pronunciation: 'はいけんする (haiken suru)',
              meaning: 'to look at / read (humble)',
              example: '添付のファイルを確認し、拝見いたしました。',
              exampleNote: 'Only used for YOUR own action looking at someone else’s work.',
            },
            {
              term: 'ご覧になる',
              pronunciation: 'ごらんになる (goran ni naru)',
              meaning: 'to look at / see (respectful)',
              example: 'こちらのパンフレットをご覧ください。',
              exampleNote: 'Polite imperative ご覧ください is everywhere in Japan.',
            },
            {
              term: '伺う',
              pronunciation: 'うかがう (ukagau)',
              meaning: 'to visit / ask / hear (humble)',
              example: '明日の午後二時に御社へ伺います。',
              exampleNote: 'Covers three humble verbs: 行く (visit), 聞く (ask/hear).',
            },
            {
              term: '申し訳ございません',
              pronunciation: 'もうしわけございません (mōshiwake gozaimasen)',
              meaning: 'I deeply apologize (formal business apology)',
              example: 'ご返信がおそくなり、大変申し訳ございません。',
              exampleNote: 'Stronger and more formal than すみません.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m4-q1',
              skill: 'speaking',
              prompt: 'An external client calls asking for your manager, Tanaka, who is in a meeting. What should you say?',
              options: [
                '田中部長は今、会議にいらっしゃいます。',
                '申し訳ございません、田中はただいま会議中でございます。',
                '田中さんは会議を見拝見しています。',
              ],
              correctIndex: 1,
              explanation: 'To an external caller (Soto), drop title 部長 and respectful verbs for your in-group manager (Uchi).',
            },
            {
              id: 'ja-b1-m4-q2',
              skill: 'writing',
              prompt: 'Which sentence uses 拝見する and ご覧になる correctly?',
              options: [
                '先ほどメールを拝見いたしました。添付資料もご覧ください。',
                '先ほどメールをご覧になりました。添付資料も拝見ください。',
                'お客様が資料を拝見なさいました。',
              ],
              correctIndex: 0,
              explanation: 'You humbly review (拝見いたしました); the client respectfully views (ご覧ください).',
            },
            {
              id: 'ja-b1-m4-q3',
              skill: 'listening',
              prompt: 'Listen to the receptionist. What does she offer to do when Sato returns?',
              audioScript: 'お電話ありがとうございます。株式会社さくらでございます。申し訳ございません、佐藤はただいま会議中で席を外しております。戻りましたら折り返しお電話させましょうか。',
              options: ['Send a fax immediately', 'Have Sato call back after returning', 'Transfer to another department'],
              correctIndex: 1,
              explanation: '折り返しお電話させましょうか = shall I have him call you back?',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            '高橋様\nいつもお世話になっております。株式会社青空のアレックスでございます。先ほどお送りいただいた見積書を拝見いたしました。内容を確認いたしましたので、木曜日の午後二時に御社へ伺いたいと存じます。ご都合はいかがでしょうか。お忙しいところ恐れ入りますが、ご確認のほどよろしくお願いいたします。',
        },
      },
      {
        id: 'ja-b1-m5',
        weekLabel: 'Weeks 9–10 · Decisions & Growth',
        title: 'Decisions (〜ことにする), Habits (〜ようになる) & Nuanced Comparisons',
        focusSkills: ['speaking', 'reading'],
        summary:
          'Express personal resolutions vs. external decisions (〜ことにする vs. 〜ことになる), gradual changes in ability (〜ようになる), and expressive comparisons (〜ほど / 〜に比べて).',
        objectives: [
          'Contrast personal choices (〜ことにした) with external schedules/rules (〜ことになった).',
          'Describe skill acquisition and lifestyle shifts using 〜ようになる and 〜ようにする.',
          'Compare trends vividly with 〜に比べて and 〜ほど〜ない.',
        ],
        grammarCheckpoints: ['Personal choice 〜ことにする vs. External decision 〜ことになる', 'Gradual change 〜ようになる vs. Conscious effort 〜ようにする', 'Comparisons: 〜に比べて (compared to) & 〜ほど〜ない (not as ~ as)'],
        keyVocabulary: ['習慣', '転勤', '比べる', '慣れる', '努力'],
        drills: [
          {
            skill: 'reading',
            title: 'Lifestyle Shift Interview',
            instruction: 'Read the short interview and separate what was decided by the company vs. the speaker’s personal habit.',
            durationMins: 15,
            samplePassage: '来月から大阪へ転勤することになりました。新しい生活に備えて、毎日三十分ジョギングするようにしています。半年前と比べて、ずいぶん体力がつくようになりました。',
          },
          {
            skill: 'speaking',
            title: 'Personal Growth Reflection (60s)',
            instruction: 'Describe two things you have become able to do in Japanese (〜ようになった) and one daily habit you make an effort to keep (〜ようにしている).',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Describe a personal decision, an external change in your life, and a skill you gradually mastered using 〜ことにする, 〜ことになる, and 〜ようになる.',
        lesson: {
          estimatedMins: 35,
          overview:
            'Articulate decisions, institutional announcements, habit-building, and gradual mastery with natural JLPT N3 grammatical precision.',
          sections: [
            {
              id: 'ja-b1-m5-s1',
              heading: 'Personal Decision (〜ことにする) vs. Decided Externally (〜ことになる)',
              explanation:
                'Use Vる/Vない + ことにする when YOU decide ("I decided to quit smoking"). Use Vる/Vない + ことになる when a company, school, or circumstance decided it ("It has been decided that I’ll transfer to Osaka") — Japanese professionals also use ことになる to soften their own decisions modestly!',
              formula: 'Self-decision: Vる/Vない + ことにした (habit: ことにしている)  |  External: Vる + ことになった',
              examples: [
                {
                  target: '健康のために、夜十時以降はスマホを見ないことにしました。',
                  translation: 'For my health, I decided not to look at my smartphone after 10 p.m.',
                  highlight: '見ないことにしました',
                },
                {
                  target: '来年の四月から、新しいチームで働くことになりました。',
                  translation: 'It has been decided that I will work in a new team starting next April.',
                  highlight: '働くことになりました',
                },
              ],
              proTip:
                'Use 〜ことにしている (ongoing state) for personal rules you follow consistently: 「毎朝、ニュースを十分読むことにしています」.',
            },
            {
              id: 'ja-b1-m5-s2',
              heading: 'Gradual Change (〜ようになる) vs. Daily Effort (〜ようにする)',
              explanation:
                '〜ようになる shows a state/ability shift over time (especially with potential verbs: 「日本語のニュースがわかるようになった」 = I have become able to understand Japanese news). 〜ようにする shows deliberate effort ("make sure to / try to": 「野菜を多く食べるようにしている」).',
              formula: 'Change of state: V(potential/る/ない) + ようになる  |  Effort: Vる/Vない + ようにする',
              examples: [
                {
                  target: '毎日シャドーイングを続けたら、速い会話も聞き取れるようになりました。',
                  translation: 'After continuing shadowing daily, I became able to catch fast conversations too.',
                  highlight: '聞き取れるようになりました',
                },
                {
                  target: '去年に比べて、今年はそれほど暑くないですね。',
                  translation: 'Compared to last year, this year is not quite as hot, is it?',
                  highlight: '去年に比べて / それほど暑くない',
                },
              ],
              proTip:
                'Compare 「〜ことにしている」(strict personal rule) vs. 「〜ようにしている」(mindful effort — sounds gentler and less rigid).',
            },
          ],
          vocabCards: [
            {
              term: '習慣',
              pronunciation: 'しゅうかん (shūkan)',
              meaning: 'habit / custom',
              example: '早起きの習慣が身につくようになりました。',
              exampleNote: 'Different kanji/pitch from 週間 (week duration).',
            },
            {
              term: '転勤',
              pronunciation: 'てんきん (tenkin)',
              meaning: 'job transfer (to another city/branch)',
              example: '父が福岡へ転勤することになりました。',
              exampleNote: 'Classic collocation with 〜ことになる.',
            },
            {
              term: '比べる',
              pronunciation: 'くらべる (kuraberu)',
              meaning: 'to compare',
              example: '以前と比べて、通勤時間が半分になりました。',
              exampleNote: 'Grammar pattern: Aに比べて / Aと比べて.',
            },
            {
              term: '慣れる',
              pronunciation: 'なれる (nareru)',
              meaning: 'to get used to / adapt',
              example: 'ようやく東京の生活に慣れてきました。',
              exampleNote: 'Target takes particle に (仕事に慣れる).',
            },
            {
              term: '努力',
              pronunciation: 'どりょく (doryoku)',
              meaning: 'effort / endeavor',
              example: '毎日の小さな努力が大きな結果につながります。',
              exampleNote: 'Verb form: 努力する.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m5-q1',
              skill: 'reading',
              prompt: 'Which sentence politely announces an external company decision to hold the event online?',
              options: [
                'イベントはオンラインで行うことになりました。',
                'イベントはオンラインで行うようにしました。',
                'イベントはオンラインで行えるようになりました。',
              ],
              correctIndex: 0,
              explanation: '〜ことになりました expresses an official/external decision cleanly.',
            },
            {
              id: 'ja-b1-m5-q2',
              skill: 'writing',
              prompt: 'Choose the right ending: 「半年練習して、やっと漢字が読める___。」',
              options: ['ことにしました', 'ようになりました', 'ことになりました'],
              correctIndex: 1,
              explanation: 'Acquiring a new ability over time always takes 〜ようになりました (potential + ようになる).',
            },
            {
              id: 'ja-b1-m5-q3',
              skill: 'listening',
              prompt: 'Listen to Sakura. What conscious effort is she making every weekday?',
              audioScript: '最近、運動不足が気になっていたから、駅まで一駅分歩くようにしているんだ。始めたころに比べて、朝の目覚めがずいぶんよくなったよ。',
              options: ['Walking one station’s distance to the station', 'Swimming before work', 'Skipping breakfast'],
              correctIndex: 0,
              explanation: '「駅まで一駅分歩くようにしている」 = making an effort to walk one station’s distance.',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            '去年、会社の方針で週に二回リモートワークをすることになりました。通勤時間が減ったおかげで、毎朝三十分日本語のニュースを読むようにしています。最初のころに比べて、今は辞書を使わなくても記事の意味がわかるようになりました。来年はJLPTのN3を受けることにしたので、これからも毎日努力を続けます。',
        },
      },
      {
        id: 'ja-b1-m6',
        weekLabel: 'Weeks 11–12 · Opinion & N3 Exam',
        title: 'Structured Opinions (〜について・〜わけではない) & JLPT N3 4-Skill Mastery',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Read NHK-style news reports quickly, frame nuanced opinions without overstating (〜わけではない / 〜に対して), and clear the complete JLPT N3 / B1 4-Skill Simulation.',
        objectives: [
          'Frame discussion topics with 〜について and contrast perspectives with 〜に対して.',
          'Soften absolute statements using 〜わけではない ("it doesn’t mean that...").',
          'Pass the LinguaVerve Japanese B1 / JLPT N3 4-Skill Simulated Exam.',
        ],
        grammarCheckpoints: ['Topic framing 〜について vs. Contrast/Target 〜に対して', 'Partial negation & nuance: 〜わけではない ("not necessarily")', 'Concluding advice & evaluation: 〜べきだ / 〜によって違う'],
        keyVocabulary: ['意見', '賛成', '反対', '影響', '解決'],
        drills: [
          {
            skill: 'reading',
            title: 'NHK-Style Opinion Column',
            instruction: 'Read the short column and identify the author’s nuanced stance on cashless payments.',
            durationMins: 15,
            samplePassage: 'キャッシュレス決済が広がっていることに対して、便利だと賛成する人が多い一方で、災害時の停電を心配する声もあります。現金が全く不要になるわけではないため、両方使える仕組みを残すべきでしょう。',
          },
          {
            skill: 'speaking',
            title: '90-Second Balanced Opinion Pitch',
            instruction: 'State your stance on remote work or cashless payments using 〜について, 〜に対して, and 〜わけではない.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a structured Japanese opinion paragraph on remote work or AI in daily life using 〜について, 〜に対して, and 〜わけではない.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Synthesize all B1/JLPT N3 grammar into balanced, nuanced Japanese reading, writing, and oral argumentation.',
          sections: [
            {
              id: 'ja-b1-m6-s1',
              heading: 'Framing Debate: 〜について, 〜に対して & 〜わけではない',
              explanation:
                'Use 〜について ("regarding/about") to announce your subject. Use 〜に対して ("toward / in contrast to") to mark attitude or compare two opposing groups. Use 〜わけではない ("it is not the case that...") to avoid sounding overly extreme — a hallmark of B1+ Japanese!',
              formula: '[Topic] について  |  [Group A] に対して [Group B]  |  Plain (+ な) + わけではない',
              examples: [
                {
                  target: 'リモートワークは便利ですが、全員に向いているわけではありません。',
                  translation: 'Remote work is convenient, yet it doesn’t mean it suits everyone.',
                  highlight: '向いているわけではありません',
                },
                {
                  target: '若者が電子書籍を好むのに対して、高齢者は紙の本を選ぶ傾向があります。',
                  translation: 'Whereas young people prefer e-books, older readers tend to choose paper books.',
                  highlight: '好むのに対して',
                },
              ],
              proTip:
                'In JLPT N3 reading comprehension, watch carefully for 〜わけではない — test writers love creating distractors that claim "the author completely opposes X" when the text actually says "not completely"!',
            },
            {
              id: 'ja-b1-m6-s2',
              heading: 'Variability (〜によって) & Measured Recommendations (〜べきだ)',
              explanation:
                'Use 〜によって to show variation ("depending on the person/region": 人によって意見が違う). Use Vる + べきだ (する → すべきだ) for principled recommendations ("ought to"), softened politely with 〜べきだと思います or 〜べきでしょう.',
              formula: '[Factor] によって違う  |  Vる + べきだ (する → すべきだ)',
              examples: [
                {
                  target: '働き方の好みは世代や職種によって大きく異なります。',
                  translation: 'Preferences for working styles differ greatly depending on generation and job type.',
                  highlight: '世代や職種によって',
                },
                {
                  target: '環境を守るために、プラスチックの使用を減らすべきだと思います。',
                  translation: 'To protect the environment, I think we ought to reduce plastic usage.',
                  highlight: '減らすべきだと思います',
                },
              ],
              proTip:
                'Avoid saying 〜べきだ directly to a superior about their personal behavior — reserve it for general civic/social ideals or soften with ほうがいいと思います.',
            },
          ],
          vocabCards: [
            {
              term: '意見',
              pronunciation: 'いけん (iken)',
              meaning: 'opinion / viewpoint',
              example: 'この問題について、みなさんの意見を聞かせてください。',
              exampleNote: 'Collocations: 意見を述べる (express), 意見が分かれる (be divided).',
            },
            {
              term: '賛成',
              pronunciation: 'さんせい (sansei)',
              meaning: 'agreement / in favor',
              example: '私は新しい交通ルールに賛成です。',
              exampleNote: 'Proposal takes particle に (案に賛成する).',
            },
            {
              term: '反対',
              pronunciation: 'はんたい (hantai)',
              meaning: 'opposition / against',
              example: '計画に反対する住民も少なくありません。',
              exampleNote: 'Antonym of 賛成.',
            },
            {
              term: '影響',
              pronunciation: 'えいきょう (eikyō)',
              meaning: 'influence / impact',
              example: 'スマートフォンは子どもの睡眠に大きな影響を与えます。',
              exampleNote: 'Key collocations: 影響を与える (give) / 影響を受ける (receive).',
            },
            {
              term: '解決',
              pronunciation: 'かいけつ (kaiketsu)',
              meaning: 'solution / resolution',
              example: '話し合って早く問題を解決すべきです。',
              exampleNote: 'Works both transitively (問題を解決する) and intransitively (問題が解決する).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b1-m6-q1',
              skill: 'reading',
              prompt: 'In the column: 「現金が全く不要になるわけではない」 — what is the author saying?',
              options: [
                'Cash has already completely disappeared',
                'It is not the case that cash becomes completely unnecessary',
                'Cashless payments should be banned immediately',
              ],
              correctIndex: 1,
              explanation: '〜わけではない partially negates an absolute claim ("doesn’t mean cash is totally unnecessary").',
            },
            {
              id: 'ja-b1-m6-q2',
              skill: 'writing',
              prompt: 'Choose the grammatically correct sentence with べきだ:',
              options: [
                '約束は必ず守るべきです。',
                '約束は必ず守ったべきです。',
                '約束は必ず守りべきです。',
              ],
              correctIndex: 0,
              explanation: 'べき attaches directly to the dictionary form (守るべきです; する → すべきです).',
            },
            {
              id: 'ja-b1-m6-q3',
              skill: 'listening',
              prompt: 'Listen to the radio host. What is the speaker’s balanced view on AI tools?',
              audioScript: 'AIツールについて、仕事が速くなるという賛成意見が多いのに対して、情報の正確さを心配する人もいます。AIに頼るのを全部やめるわけではありませんが、最後に人間が確認すべきだと思います。',
              options: [
                'Stop using AI completely',
                'Keep using AI while having humans verify the final output',
                'Let AI verify everything automatically',
              ],
              correctIndex: 1,
              explanation: 'She says we shouldn’t quit AI entirely (全部やめるわけではない), yet humans should check at the end (最後に人間が確認すべき).',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 55,
          checkpointModelAnswer:
            'リモートワークの普及について、通勤時間がなくなることに賛成する人が多いのに対して、社員同士のコミュニケーションが減ることを心配する意見もあります。完全にオフィスが不要になるわけではありませんが、仕事の内容や人によって働き方を柔軟に選べる仕組みを作るべきだと思います。',
        },
      },
    ],
  },

  // =====================================================================
  // B2 (JLPT N2) · STAGE 4: PROFESSIONAL FLUENCY
  // =====================================================================
  {
    id: 'ja-intensive-b2',
    languageId: 'japanese',
    level: 'B2',
    title: 'Japanese B2 / JLPT N2 Professional & Business Intensive',
    subtitle:
      'Command newspaper syntax, formal written connectors (〜に伴って・〜にもかかわらず), BJT J2 workplace diplomacy, and persuasive N2 editorial argumentation.',
    heroRole: 'Stage 4 · Professional Fluency (JLPT N2 / BJT J2)',
    durationWeeks: 14,
    dailyHours: '2.5 hrs/day (Intensive)',
    targetCertificates: ['JLPT N2 (CEFR B2)', 'BJT Business Japanese J2 (420+)'],
    passingCriteria: 'JLPT N2 scaled score ≥ 90/180 (min 19/60 per section) & professional Japanese workplace readiness.',
    examBlueprint: {
      reading: '105 mins · ~1,000 kanji, newspaper columns, comparative business memos, critical opinion essays, and info retrieval.',
      listening: '50 mins · Full natural-speed Tokyo interviews, workplace negotiations, and rapid immediate-response prompts.',
      writing: '40 mins · Formal corporate proposals, diplomatic refusal emails, and analytical essays (220–320 chars).',
      speaking: '14 mins · Delivering structured business proposals, softening refusals, and debating socio-economic trade-offs.',
    },
    referenceIds: ['ref-ja-jlpt-n3n2', 'ref-ja-jlpt-hub', 'ref-ja-nhk', 'ref-ja-bjt'],
    modules: [
      {
        id: 'ja-b2-m1',
        weekLabel: 'Weeks 1–2 · Formal Written Syntax',
        title: 'Newspaper Connectors & Formal Framing (〜に伴って・〜に応じて・〜をもとに)',
        focusSkills: ['reading', 'writing'],
        summary:
          'Decode authentic Japanese business reports and newspaper articles by mastering high-frequency N2 compound particles that express proportional change, adaptation, and evidential basis.',
        objectives: [
          'Use 〜に伴って / 〜に伴い to connect simultaneous large-scale social or business shifts.',
          'Express tailored adaptation with 〜に応じて and data-driven creation with 〜をもとに.',
          'Frame formal agendas and reports cleanly using 〜に関して and 〜をめぐって.',
        ],
        grammarCheckpoints: ['Proportional co-change: 〜に伴って / 〜に伴い', 'Adaptive response: 〜に応じて ("in accordance with") & Foundation: 〜をもとに ("based on")', 'Topic & debate framing: 〜に関して / 〜をめぐって'],
        keyVocabulary: ['伴う', '応じる', '普及', '高齢化', '調査'],
        drills: [
          {
            skill: 'reading',
            title: 'Nikkei-Style Demographics Report',
            instruction: 'Read the short report and identify the cause-and-effect chain linking demographics to services.',
            durationMins: 20,
            samplePassage: '少子高齢化の進行に伴い、医療や介護の需要が急速に拡大している。自治体は住民の調査結果をもとに、地域の状況に応じた支援体制を整える方針だ。',
          },
          {
            skill: 'writing',
            title: 'Corporate Trend Summary',
            instruction: 'Write 3 formal Japanese sentences describing how AI adoption is reshaping workplace training using 〜に伴って and 〜に応じて.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write a concise Japanese business briefing summarizing a social or workplace trend using 〜に伴って, 〜をもとに, and 〜に応じて.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Unlock JLPT N2 reading speed by mastering the formal compound particles that anchor Japanese journalism, policy memos, and corporate briefings.',
          sections: [
            {
              id: 'ja-b2-m1-s1',
              heading: 'Co-occurring Change (〜に伴って) & Tailored Response (〜に応じて)',
              explanation:
                'When a major trend causes a parallel shift, formal Japanese uses N / Vる + に伴って (written stem: に伴い; noun modifier: に伴うN). When a policy, price, or service scales dynamically to match a variable (age, skill, demand), use N + に応じて (noun modifier: に応じたN).',
              formula: '[Trend] に伴って [Parallel Change]  |  [Variable] に応じて [Tailored Result]',
              examples: [
                {
                  target: 'スマートフォン決済の普及に伴い、現金を持ち歩かない消費者が増えている。',
                  translation: 'Along with the spread of smartphone payments, consumers who do not carry cash are increasing.',
                  highlight: '普及に伴い',
                },
                {
                  target: '当社では社員の希望や業務内容に応じて、勤務時間を柔軟に調整できます。',
                  translation: 'At our company, working hours can be adjusted flexibly in accordance with employee preferences and job duties.',
                  highlight: '業務内容に応じて',
                },
              ],
              proTip:
                'Notice the stem compression in formal writing: に伴って → に伴い and に関して → に関し drop て for crisp executive prose!',
            },
            {
              id: 'ja-b2-m1-s2',
              heading: 'Evidential Basis (〜をもとに) & Contested Topics (〜をめぐって)',
              explanation:
                'Use N + をもとに (or をもとにして) when a plan, movie, or proposal is built from raw data or a real event ("based on"). Use N + をめぐって when multiple parties argue, compete, or debate AROUND a central issue ("surrounding/over").',
              formula: '[Source Data] をもとに [Created Output]  |  [Contested Issue] をめぐって [Debate/Conflict]',
              examples: [
                {
                  target: '顧客アンケートをもとに、アプリのデザインを全面的に見直しました。',
                  translation: 'Based on the customer survey, we completely redesigned the app.',
                  highlight: 'アンケートをもとに',
                },
                {
                  target: '新空港の建設計画をめぐって、地元住民と行政の間で議論が続いている。',
                  translation: 'Debate continues between local residents and the administration over the new airport construction plan.',
                  highlight: '建設計画をめぐって',
                },
              ],
              proTip:
                'Compare 〜をもとに (creative/practical basis — survey, novel, experience) with 〜に基づいて (strict adherence to a rule, law, or contract)!',
            },
          ],
          vocabCards: [
            {
              term: '伴う',
              pronunciation: 'ともなう (tomonau)',
              meaning: 'to accompany / go hand in hand with',
              example: '事業拡大に伴う人員不足が課題となっている。',
              exampleNote: 'Key N2 compound particle root: 〜に伴って.',
            },
            {
              term: '応じる',
              pronunciation: 'おうじる (ōjiru)',
              meaning: 'to respond to / meet / scale according to',
              example: '予算に応じたプランをご提案いたします。',
              exampleNote: 'Ichidan verb; modifier form is に応じた.',
            },
            {
              term: '普及',
              pronunciation: 'ふきゅう (fukyū)',
              meaning: 'widespread adoption / diffusion',
              example: '生成AIの急速な普及が教育現場を変えている。',
              exampleNote: 'Collocates constantly with に伴い / につれて.',
            },
            {
              term: '高齢化',
              pronunciation: 'こうれいか (kōreika)',
              meaning: 'aging of society',
              example: '少子高齢化への対策は喫緊の課題だ。',
              exampleNote: 'Topical JLPT N2/N1 social-issue vocabulary.',
            },
            {
              term: '調査',
              pronunciation: 'ちょうさ (chōsa)',
              meaning: 'survey / investigation / research',
              example: '最新の市場調査をもとに販売戦略を立てた。',
              exampleNote: 'Verb form: 調査する.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m1-q1',
              skill: 'reading',
              prompt: 'Fill in the blank: 「参加者のレベル___、三つのクラスに分けて指導します。」',
              options: ['をめぐって', 'に応じて', 'にもかかわらず'],
              correctIndex: 1,
              explanation: 'Dividing classes dynamically according to participant level requires 〜に応じて.',
            },
            {
              id: 'ja-b2-m1-q2',
              skill: 'writing',
              prompt: 'Which sentence correctly uses 〜をめぐって?',
              options: [
                '遺産や土地の権利をめぐって、長い間争いが続いていた。',
                '駅をめぐって、五分で着きました。',
                '天気予報をめぐって、傘を持って行きます。',
              ],
              correctIndex: 0,
              explanation: '〜をめぐって always pairs with debate, competition, or conflict surrounding a focal issue.',
            },
            {
              id: 'ja-b2-m1-q3',
              skill: 'listening',
              prompt: 'Listen to the briefing. What is the new support plan based on?',
              audioScript: '少子高齢化の進行に伴い、地域の交通課題が深刻化しています。そこで市役所では、住民アンケートの結果をもとに、利用者の年齢に応じた新しいコミュニティバスを運行する予定です。',
              options: ['A national railway mandate', 'The results of a resident survey', 'A private taxi company’s merger'],
              correctIndex: 1,
              explanation: '「住民アンケートの結果をもとに」 = based on the resident survey results.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            '近年、リモートワークの普及に伴い、都心から郊外へ移住するビジネスパーソンが増加している。この変化をめぐって、自治体間では子育て支援や通信環境の整備を競う動きが活発だ。多くの企業も社員のアンケート調査をもとに、ライフスタイルに応じた柔軟な人事制度を導入し始めている。',
        },
      },
      {
        id: 'ja-b2-m2',
        weekLabel: 'Weeks 3–4 · Concession & Scope',
        title: 'Concession, Two-Sided Analysis & Scope (にもかかわらず・一方で・反面・に限らず)',
        focusSkills: ['reading', 'speaking'],
        summary:
          'Build sophisticated N2 analytical nuance by contrasting expectations with reality (にもかかわらず), balancing pros and cons (一方で・反面), and widening scope cleanly (に限らず).',
        objectives: [
          'Express strong formal contrast ("despite/in spite of") with 〜にもかかわらず.',
          'Weigh trade-offs objectively using 〜一方で and 〜反面.',
          'Broaden claims accurately using 〜に限らず ("not limited to X, also Y").',
        ],
        grammarCheckpoints: ['Strong concession: Plain / N + にもかかわらず', 'Balanced trade-offs: 〜一方で (whereas/on the other hand) & 〜反面 (conversely)', 'Expanded scope: N + に限らず (not only... but also)'],
        keyVocabulary: ['にもかかわらず', '反面', '限らず', '利便性', '課題'],
        drills: [
          {
            skill: 'reading',
            title: 'Editorial Trade-Off Analysis',
            instruction: 'Read the editorial and identify both sides of urban tourism expansion.',
            durationMins: 20,
            samplePassage: '観光業の活性化は地域経済を潤す反面、交通渋滞や騒音といった住民の負担を増やす側面もある。いまや京都に限らず、全国の人気観光地で持続可能な対策が求められている。',
          },
          {
            skill: 'speaking',
            title: 'Two-Sided Trade-Off Pitch (90s)',
            instruction: 'Present the upside and downside of generative AI or tourism using 〜一方で, 〜反面, and 〜に限らず.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a balanced Japanese analytical paragraph on a modern technology or urban issue using にもかかわらず, 反面, and に限らず.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Elevate your Japanese from simple "AだがB" contrasts into structured, objective JLPT N2 academic and editorial argumentation.',
          sections: [
            {
              id: 'ja-b2-m2-s1',
              heading: 'Strong Concession (〜にもかかわらず) & Expanding Scope (〜に限らず)',
              explanation:
                '〜にもかかわらず is the formal written counterpart of のに ("in spite of / despite"). Note that nouns and な-adjectives attach DIRECTLY without だ or な (雨にもかかわらず, 不便にもかかわらず)! 〜に限らず means "not restricted to X alone — extends more broadly".',
              formula: 'V/い-adj + にもかかわらず  |  N/な-adj (NO だ/な!) + にもかかわらず  |  N + に限らず',
              examples: [
                {
                  target: '激しい雨にもかかわらず、会場には千人以上の来場者が集まった。',
                  translation: 'Despite the heavy rain, over a thousand attendees gathered at the venue.',
                  highlight: '激しい雨にもかかわらず',
                },
                {
                  target: 'このサービスは若者に限らず、幅広い世代に利用されている。',
                  translation: 'This service is used not only by young people, but across a wide range of generations.',
                  highlight: '若者に限らず',
                },
              ],
              proTip:
                'Watch the N2 attachment trap: *"静かなにもかかわらず"* is WRONG — drop な/だ and write 「静かにもかかわらず」 (or add である: 「静かであるにもかかわらず」)!',
            },
            {
              id: 'ja-b2-m2-s2',
              heading: 'Weighing Pros & Cons: 〜一方で vs. 〜反面',
              explanation:
                'Both compare two coexisting aspects, with a subtle difference: 〜一方で contrasts two groups OR two coexisting qualities neutrally ("on the other hand / while"). 〜反面 specifically highlights an OPPOSITE flip side inside the SAME subject ("convenient, yet on the flip side risky").',
              formula: '[Positive aspect] 反面、[Negative/Opposite flip side]  |  [A] 一方で、[B]',
              examples: [
                {
                  target: 'オンライン授業は場所を選ばず受講できる反面、集中力を維持しにくいという欠点がある。',
                  translation: 'While online classes can be taken from anywhere, on the flip side they have the drawback of making it hard to sustain concentration.',
                  highlight: '受講できる反面',
                },
                {
                  target: '輸入品が値上がりする一方で、国産品の需要が高まっている。',
                  translation: 'While imported goods rise in price, demand for domestic products is growing.',
                  highlight: '値上がりする一方で',
                },
              ],
              proTip:
                'In essays and speaking Part 2, pairing 「〜という利点がある反面、〜という課題も残る」 immediately signals B2/N2 rhetorical maturity.',
            },
          ],
          vocabCards: [
            {
              term: 'にもかかわらず',
              pronunciation: 'にもかかわらず (ni mo kakawarazu)',
              meaning: 'in spite of / despite / nevertheless',
              example: '厳しい条件にもかかわらず、契約は無事に成立した。',
              exampleNote: 'Can also open a new sentence as 「それにもかかわらず、」.',
            },
            {
              term: '反面',
              pronunciation: 'はんめん (hanmen)',
              meaning: 'on the other hand / the flip side',
              example: '自由度が高い反面、自己管理能力が問われる。',
              exampleNote: 'Connects two contrasting traits of ONE subject.',
            },
            {
              term: '限らず',
              pronunciation: 'かぎらず (kagirazu)',
              meaning: 'not limited to / regardless of (に限らず)',
              example: '日本に限らず、世界各地で気候変動の影響が出ている。',
              exampleNote: 'Built from negative classical form of 限る (limit).',
            },
            {
              term: '利便性',
              pronunciation: 'りべんせい (ribensei)',
              meaning: 'convenience / usability (formal noun)',
              example: 'キャッシュレス化は利便性を飛躍的に高めた。',
              exampleNote: 'Upgrades A1 便利 into crisp B2/N2 academic style.',
            },
            {
              term: '課題',
              pronunciation: 'かだい (kadai)',
              meaning: 'challenge / task / unresolved issue',
              example: '人材育成が今後の最大の課題である。',
              exampleNote: 'More constructive and professional than 問題 in corporate Japanese.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m2-q1',
              skill: 'writing',
              prompt: 'Select the grammatically accurate sentence using にもかかわらず:',
              options: [
                '休日にもかかわらず、多くの社員がボランティアに参加した。',
                '休日なにもかかわらず、多くの社員がボランティアに参加した。',
                '休日だにもかかわらず、多くの社員がボランティアに参加した。',
              ],
              correctIndex: 0,
              explanation: 'Nouns attach directly to にもかかわらず (or with である): 休日にもかかわらず.',
            },
            {
              id: 'ja-b2-m2-q2',
              skill: 'reading',
              prompt: 'Which connector best shows a negative flip side of the SAME topic: 「この薬は効果が強い___、副作用に注意が必要だ」?',
              options: ['に限らず', '反面', 'をもとに'],
              correctIndex: 1,
              explanation: '反面 contrasts a positive property and its opposite downside within the same medication.',
            },
            {
              id: 'ja-b2-m2-q3',
              skill: 'listening',
              prompt: 'Listen to the economist. What two-sided trend does she describe?',
              audioScript: '海外からの観光客が急増していることは、地方の経済を活性化させる反面、宿泊費の高騰や混雑を招いています。東京や京都に限らず、各地で受け入れ体制の見直しが急務です。',
              options: [
                'Tourism hurts local economies with zero benefits',
                'Tourism boosts local economies while also causing higher hotel prices and crowding',
                'Only Tokyo and Kyoto experience tourism growth',
              ],
              correctIndex: 1,
              explanation: 'She balances economic revitalization (活性化させる反面) against rising hotel rates and congestion across Japan (に限らず).',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            'デジタル化の進展は、大企業に限らず中小企業や自治体の業務効率を大きく改善した。多額の初期投資が必要であるにもかかわらず、多くの組織が導入を進めている。しかし、利便性が高まる反面、情報漏えいのリスクや高齢者層の取り残されといった課題も深刻化している。利点とリスクの双方を見極めた運用が不可欠だ。',
        },
      },
      {
        id: 'ja-b2-m3',
        weekLabel: 'Weeks 5–6 · Corporate Diplomacy',
        title: 'BJT J2 Business Japanese: Soft Refusals (〜かねます), Constraints & Cushion Phrases',
        focusSkills: ['listening', 'speaking'],
        summary:
          'Master high-context Japanese corporate diplomacy: decline requests gracefully without friction (〜かねます), explain institutional limits (〜わけにはいかない), and layer cushion phrases cleanly.',
        objectives: [
          'Use Vます-stem + かねます ("I am afraid we cannot...") for polite business refusals.',
          'Contrast 〜わけにはいかない (socially/morally cannot) with 〜ないわけにはいかない (cannot avoid doing).',
          'Combine cushion phrases (せっかくですが・あいにくですが・恐れ入りますが) with constructive alternatives.',
        ],
        grammarCheckpoints: ['Diplomatic refusal: Vます-stem + かねます (e.g., お受けいたしかねます)', 'Moral/social constraint: Vる + わけにはいかない vs. Obligation: Vない + わけにはいかない', 'Corporate cushion phrases (あいにく・せっかくのお話ですが・検討いたします)'],
        keyVocabulary: ['かねる', 'あいにく', '検討', '承知', '差し支え'],
        drills: [
          {
            skill: 'listening',
            title: 'BJT Negotiation Refusal Decoding',
            instruction: 'Listen closely to what the supplier is actually refusing and what alternative they propose.',
            durationMins: 20,
            audioScript: 'せっかくのご提案なのですが、現行の予算ではご要望の価格にお応えいたしかねます。ただ、納期を一週間延ばしていただければ、別のプランをご提示することが可能です。',
          },
          {
            skill: 'speaking',
            title: 'Diplomatic Client Refusal Roleplay',
            instruction: 'Politely decline a client’s request for a 30% discount using クッション言葉 + 〜かねます, then offer an alternative.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a diplomatic Japanese business email declining a client’s urgent deadline request using クッション言葉, 〜かねます, and a constructive counterproposal.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Navigate Japanese negotiations like a BJT J2 pro by mastering indirect refusals, constraint grammar, and face-saving alternatives.',
          sections: [
            {
              id: 'ja-b2-m3-s1',
              heading: 'Graceful Refusal (〜かねます) vs. Fear of Risk (〜かねない)',
              explanation:
                'Attach かねる to the Vます-stem to express polite inability ("find it difficult / regretfully cannot"): 「お答えしかねます」(I am unable to answer), 「ご要望に沿いかねます」(We cannot meet that request). Watch its negative cousin Vます-stem + かねない, which means something TOTALLY different: "might well happen (undesirable risk)"!',
              formula: 'Polite refusal: Vます-stem + かねます  |  Negative risk: Vます-stem + かねない ("could end up...")',
              examples: [
                {
                  target: 'あいにくですが、規則により個人情報の開示には応じかねます。',
                  translation: 'Unfortunately, due to our regulations, we are unable to comply with disclosing personal data.',
                  highlight: '応じかねます',
                },
                {
                  target: '確認を怠ると、重大な事故につながりかねません。',
                  translation: 'If we neglect verification, it could very well lead to a serious accident.',
                  highlight: 'つながりかねません',
                },
              ],
              proTip:
                'Top JLPT N2 & BJT trap: かねます = polite "cannot do"; かねない = warning "might well happen"! Never confuse affirmative vs. negative かねる!',
            },
            {
              id: 'ja-b2-m3-s2',
              heading: 'Social Constraints (〜わけにはいかない) & Cushion Phrases',
              explanation:
                'Use Vる + わけにはいかない when you technically COULD do something, yet ethics, promises, or responsibility forbid it ("cannot very well..."). Flip it to Vない + わけにはいかない for unavoidable duty ("cannot very well refuse/skip"). Always precede bad news with a soft cushion phrase!',
              formula: 'Vる + わけにはいかない (cannot in good conscience)  |  Vない + わけにはいかない (have no choice but to)',
              examples: [
                {
                  target: 'お客様との大切な約束ですから、途中で投げ出すわけにはいきません。',
                  translation: 'Because it is an important promise to a client, we cannot very well abandon it halfway.',
                  highlight: '投げ出すわけにはいきません',
                },
                {
                  target: 'せっかくご招待いただいたので、出席しないわけにはいきません。',
                  translation: 'Since you kindly invited me, I couldn’t possibly miss attending.',
                  highlight: '出席しないわけにはいきません',
                },
              ],
              proTip:
                'In real Japanese business meetings, 「前向きに検討いたします」(We will review it positively) without a date often functions as a polite soft deferral — always listen for whether a concrete next step is offered!',
            },
          ],
          vocabCards: [
            {
              term: 'かねる',
              pronunciation: 'かねる (kaneru)',
              meaning: 'to find it difficult to / politely unable to (V-stem + かねる)',
              example: '私の一存では判断いたしかねます。',
              exampleNote: 'With する-verbs: お受けいたしかねます (humble polite).',
            },
            {
              term: 'あいにく',
              pronunciation: 'あいにく (ainiku)',
              meaning: 'unfortunately (classic business cushion adverb)',
              example: 'あいにく担当の佐藤は本日休暇を取っております。',
              exampleNote: 'Instantly softens disappointment in client calls.',
            },
            {
              term: '検討',
              pronunciation: 'けんとう (kentō)',
              meaning: 'consideration / review / examination',
              example: '社内で改めて検討のうえ、今週中にご連絡いたします。',
              exampleNote: 'Essential BJT corporate verb: 検討する.',
            },
            {
              term: '承知',
              pronunciation: 'しょうち (shōchi)',
              meaning: 'acknowledgment / understanding (承知いたしました)',
              example: 'ご変更の件、承知いたしました。',
              exampleNote: 'Far more professional than わかりました or 了解しました toward superiors/clients!',
            },
            {
              term: '差し支え',
              pronunciation: 'さしつかえ (sashitsukae)',
              meaning: 'inconvenience / hindrance (差し支えなければ)',
              example: 'もし差し支えなければ、ご予算の目安を伺えますでしょうか。',
              exampleNote: 'Polite cushion before asking sensitive questions.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m3-q1',
              skill: 'reading',
              prompt: 'What does 「このまま放置すれば、信頼を失いかねない」 mean?',
              options: [
                'We politely refuse to lose trust',
                'If left unaddressed like this, we risk losing trust',
                'It is impossible to lose trust',
              ],
              correctIndex: 1,
              explanation: 'Vます-stem + かねない expresses a serious risk that an undesirable outcome could occur.',
            },
            {
              id: 'ja-b2-m3-q2',
              skill: 'speaking',
              prompt: 'Which reply is MOST appropriate when your client gives you a new deadline?',
              options: [
                'はい、了解したよ。',
                '承知いたしました。ご指定の期日までに対応いたします。',
                'わかりました、やってあげます。',
              ],
              correctIndex: 1,
              explanation: '承知いたしました (or かしこまりました) is the gold-standard BJT response to clients and superiors.',
            },
            {
              id: 'ja-b2-m3-q3',
              skill: 'listening',
              prompt: 'Listen to the supplier. Under what condition can they offer an alternative plan?',
              audioScript: 'せっかくのご提案なのですが、現行の予算ではご要望の価格にお応えいたしかねます。ただ、納期を一週間延ばしていただければ、別のプランをご提示することが可能です。',
              options: [
                'If the client pays in cash today',
                'If the delivery deadline is extended by one week',
                'If the client cancels half the order',
              ],
              correctIndex: 1,
              explanation: '「納期を一週間延ばしていただければ」 = if you can extend the delivery date by one week.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            '中村様\nいつも大変お世話になっております。せっかくのご依頼なのですが、あいにく今週は生産ラインが満杯となっており、明日までの追加納品にはお応えいたしかねます。品質を落として出荷するわけにはまいりませんので、来週火曜日の午前着であれば確実にお届け可能です。もし差し支えなければ、こちらの日程でご検討いただけますでしょうか。よろしくお願いいたします。',
        },
      },
      {
        id: 'ja-b2-m4',
        weekLabel: 'Weeks 7–8 · Cause & Consequence',
        title: 'Cause, Evidence & Extreme Results (〜ことから・〜結果・〜あまり・〜末に)',
        focusSkills: ['reading', 'writing'],
        summary:
          'Explain origins, deductions, unintended extremes, and hard-won outcomes with precision using four core JLPT N2 causal structures.',
        objectives: [
          'Cite observable clues and etymologies smoothly with 〜ことから.',
          'Express excessive emotion/effort leading to a consequence with 〜あまり.',
          'Distinguish neutral outcomes (〜結果) from arduous, long-fought finales (〜末に).',
        ],
        grammarCheckpoints: ['Origin & deduction: Plain (+ な/である) + ことから', 'Excessive emotion/action: Vる/Vた / Nの + あまり', 'Outcome after long process: Vた / Nの + 結果 vs. 末に (after long struggle)'],
        keyVocabulary: ['由来', '緊張', '末に', '判明', '至る'],
        drills: [
          {
            skill: 'reading',
            title: 'Case Study Cause-Effect Extraction',
            instruction: 'Read the short case study and trace the trigger and final outcome.',
            durationMins: 20,
            samplePassage: '長年の研究の末に開発されたこの素材は、軽くて丈夫であることから航空機の部品に採用された。しかし発表当日、担当者は緊張のあまり原稿の一部を読み飛ばしてしまったという。',
          },
          {
            skill: 'writing',
            title: 'Analytical Narrative Paragraph',
            instruction: 'Write 4 sentences describing a product breakthrough or personal turning point using ことから, あまり, and 末に.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a Japanese analytical paragraph explaining how an important decision or discovery came about using ことから, 結果, あまり, and 末に.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Upgrade generic から/ので clauses into precise JLPT N2 causal logic distinguishing clues, excess, and long-term struggle.',
          sections: [
            {
              id: 'ja-b2-m4-s1',
              heading: 'Observable Clues (〜ことから) & Excessive Trigger (〜あまり)',
              explanation:
                'Use 〜ことから ("from the fact that...") when naming why something got its name, why a policy was chosen, or how someone deduced a truth. Use Nの / Vた・Vる + あまり ("out of excessive...") when intense emotion or effort triggers an unintended reaction (usually uncontrolled!).',
              formula: '[Clue/Fact] ことから [Name/Deduction]  |  [Intense State] の/Vた + あまり [Unintended Effect]',
              examples: [
                {
                  target: 'この花は形が鈴に似ていることから、「スズラン」と名づけられた。',
                  translation: 'From the fact that its shape resembles a bell, this flower was named "suzuran" (lily of the valley).',
                  highlight: '似ていることから',
                },
                {
                  target: '合格を喜ぶあまり、思わず大きな声を上げてしまった。',
                  translation: 'So overjoyed at passing, I involuntarily let out a loud shout.',
                  highlight: '喜ぶあまり',
                },
              ],
              proTip:
                'Notice 〜あまり often pairs with uncontrollable results (泣いてしまった, 体調を崩した, 失敗した) — avoid pairing it with deliberate commands.',
            },
            {
              id: 'ja-b2-m4-s2',
              heading: 'Process Outcomes: 〜結果 vs. 〜末に',
              explanation:
                '〜結果 neutrally states the outcome of a test, survey, or experiment (調査した結果、原因が判明した). 〜末に adds dramatic weight: it implies a LONG, strenuous effort, debate, or hardship before reaching the final conclusion ("after much deliberation / struggle, finally...").',
              formula: 'Vた / Nの + 結果 (objective outcome)  |  Vた / Nの + 末に (after long struggle/deliberation)',
              examples: [
                {
                  target: 'チーム全員で徹底的に検証した結果、システムの不具合が判明した。',
                  translation: 'As a result of thorough verification by the entire team, the system defect came to light.',
                  highlight: '検証した結果',
                },
                {
                  target: '何日も悩み抜いた末に、起業する道を選ぶことにした。',
                  translation: 'After agonizing over it for many days, I finally decided to choose the path of starting a company.',
                  highlight: '悩み抜いた末に',
                },
              ],
              proTip:
                'Never use 〜末に for quick 5-minute actions (saying *"5分考えた末にコーヒーを買った"* sounds comically exaggerated!).',
            },
          ],
          vocabCards: [
            {
              term: '由来',
              pronunciation: 'ゆらい (yurai)',
              meaning: 'origin / derivation (of a name or custom)',
              example: 'この地名は古い伝説に由来している。',
              exampleNote: 'Often appears right beside 〜ことから in N2 reading.',
            },
            {
              term: '緊張',
              pronunciation: 'きんちょう (kinchō)',
              meaning: 'nervousness / tension',
              example: '緊張のあまり、頭が真っ白になってしまった。',
              exampleNote: 'Classic collocation with のあまり.',
            },
            {
              term: '末に',
              pronunciation: 'すえに (sue ni)',
              meaning: 'after much / at the end of a long process',
              example: '度重なる議論の末に、ようやく合意に達した。',
              exampleNote: 'Noun modifier form: 議論の末の合意.',
            },
            {
              term: '判明',
              pronunciation: 'はんめい (hanmei)',
              meaning: 'becoming clear / being revealed (formal)',
              example: '精密検査の結果、故障の原因が判明した。',
              exampleNote: 'Intransitive する-verb: 原因が判明する.',
            },
            {
              term: '至る',
              pronunciation: 'いたる (itaru)',
              meaning: 'to reach / arrive at (a stage or conclusion)',
              example: '交渉決裂の結果、契約解除に至った。',
              exampleNote: 'Formal verb widely tested in N2 and N1.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m4-q1',
              skill: 'reading',
              prompt: 'Fill in the blank: 「健康を気遣う___、逆に食事の楽しみを失ってしまった。」',
              options: ['あまり', 'ことから', 'に応じて'],
              correctIndex: 0,
              explanation: 'Worrying excessively to the point of an ironic negative effect requires 〜あまり.',
            },
            {
              id: 'ja-b2-m4-q2',
              skill: 'writing',
              prompt: 'Which sentence uses 〜末に naturally?',
              options: [
                '三年間の試行錯誤の末に、画期的な電池の開発に成功した。',
                '駅まで三分歩いた末に、コンビニに着いた。',
                '明日雨が降る末に、傘を買うつもりだ。',
              ],
              correctIndex: 0,
              explanation: '〜末に requires a substantial, lengthy process (three years of trial and error) leading to a significant outcome.',
            },
            {
              id: 'ja-b2-m4-q3',
              skill: 'listening',
              prompt: 'Listen to the news report. Why did the startup decide to withdraw the app temporarily?',
              audioScript: '利用者の個人情報が外部から閲覧できる状態だったことが判明したため、開発会社は緊急協議の末に、アプリの配信を一時停止する判断に至りました。',
              options: [
                'Because user ratings were too high',
                'Because a flaw exposing user personal info was discovered',
                'Because the company relocated overseas',
              ],
              correctIndex: 1,
              explanation: '個人情報が閲覧できる状態だったことが判明した = it came to light that personal data was viewable.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            '私たちのチームは、既存製品の売上が伸び悩んでいることから、半年間かけて顧客の声を徹底的に調査した。分析した結果、機能を増やしすぎたあまり、かえって初心者にとって使いにくくなっていたことが判明した。何度も試作と議論を重ねた末に、操作画面を大幅に単純化した新モデルを発売したところ、高い評価を得るに至った。',
        },
      },
      {
        id: 'ja-b2-m5',
        weekLabel: 'Weeks 9–10 · Critical Reading',
        title: 'Critical Editorial Syntax: 〜どころか, 〜ばかりか & 〜というより',
        focusSkills: ['reading', 'listening'],
        summary:
          'Read between the lines of Japanese editorials and debates by mastering emphatic contrast (〜どころか), escalation (〜ばかりか), and precise reframing (〜というより).',
        objectives: [
          'Spot dramatic reality-vs-expectation reversals marked by 〜どころか ("far from X, actually Y!").',
          'Track additive escalation ("not only X, even Y") with 〜ばかりか〜まで.',
          'Reframe inaccurate labels cleanly with 〜というより ("rather than X, it is more accurate to say Y").',
        ],
        grammarCheckpoints: ['Emphatic negation/contrast: 〜どころか ("far from...")', 'Additive escalation: 〜ばかりか (...も / ...まで)', 'Precision reframing: 〜というより（むしろ）'],
        keyVocabulary: ['どころか', 'ばかりか', 'むしろ', '本質', '評価'],
        drills: [
          {
            skill: 'reading',
            title: 'Critical Review Decoding',
            instruction: 'Read the critic’s comment and determine the author’s true evaluation of the policy.',
            durationMins: 20,
            samplePassage: '新しい規制は手続きを簡略化するどころか、かえって現場の負担を増やしている。時間がかかるばかりか、中小企業の参入障壁にもなっているため、これは改革というより後退と言うべきだろう。',
          },
          {
            skill: 'listening',
            title: 'Podcast Book Critique',
            instruction: 'Listen and catch how the reviewer reframes the book’s true strength.',
            durationMins: 15,
            audioScript: 'この本は単なるビジネスの解説書というより、むしろ現代社会を映す人間ドラマですね。専門知識が身につくばかりか、自分の働き方を見直すきっかけにもなりますよ。',
          },
        ],
        checkpointPrompt: 'Write a sharp Japanese review or critique of a service, app, or policy using どころか, ばかりか, and というより.',
        lesson: {
          estimatedMins: 40,
          overview:
            'Develop the critical reading radar needed to ace JLPT N2 long passages by tracking emphatic reversals, escalations, and author reframings.',
          sections: [
            {
              id: 'ja-b2-m5-s1',
              heading: 'Reversing Expectations (〜どころか) & Escalation (〜ばかりか)',
              explanation:
                'Use 〜どころか ("far from X — on the contrary, Y!") to crush an assumption in either a worse OR much better direction (休むどころか残業が増えた; 英語どころか五か国語も話せる). Use 〜ばかりか ("not only X, furthermore Y") to stack two parallel facts in the SAME direction.',
              formula: '[Denied expectation] どころか、[Opposite/Extreme reality]  |  [Fact 1] ばかりか、[Even stronger Fact 2] も/まで',
              examples: [
                {
                  target: '薬を飲んだのに、熱が下がるどころかかえって上がってしまった。',
                  translation: 'Even though I took medicine, far from going down, my fever actually rose instead.',
                  highlight: '下がるどころか',
                },
                {
                  target: 'このアプリは翻訳が正確なばかりか、発音の指導までしてくれる。',
                  translation: 'Not only is this app’s translation accurate, it even coaches your pronunciation.',
                  highlight: '正確なばかりか ... まで',
                },
              ],
              proTip:
                'Always check polarity: 〜どころか REVERSES or blows past the first clause (often with かえって), whereas 〜ばかりか ADDS onto it (both positive or both negative).',
            },
            {
              id: 'ja-b2-m5-s2',
              heading: 'Precision Reframing: 〜というより（むしろ）',
              explanation:
                'When an author wants to sharpen a definition or gently correct a label, they write 「Aというより（むしろ）B」 ("rather than calling it A, it is more accurately B"). In JLPT N2 reading, the true author thesis almost ALWAYS sits in B!',
              formula: '[Less accurate label A] というより（むしろ）[True essence B]',
              examples: [
                {
                  target: '彼とは単なる同僚というより、人生の良き相談相手だ。',
                  translation: 'Rather than merely a colleague, he is a trusted life confidant.',
                  highlight: '同僚というより',
                },
                {
                  target: 'この問題の解決には、技術の進歩というより意識の変革が欠かせない。',
                  translation: 'To solve this issue, a shift in mindset rather than technological progress is indispensable.',
                  highlight: '技術の進歩というより',
                },
              ],
              proTip:
                'Whenever you spot むしろ ("rather") in an exam passage, underline the clause right after it — it almost always contains the answer to "What is the author’s main point?"!',
            },
          ],
          vocabCards: [
            {
              term: 'どころか',
              pronunciation: 'どころか (dokoro ka)',
              meaning: 'far from / let alone / on the contrary',
              example: '漢字が書けるどころか、読むことさえ難しい。',
              exampleNote: 'Attaches to plain forms and nouns directly.',
            },
            {
              term: 'ばかりか',
              pronunciation: 'ばかりか (bakari ka)',
              meaning: 'not only ... but also (escalating)',
              example: '彼女は論文を書いたばかりか、国際学会で賞まで取った。',
              exampleNote: 'Formal equivalent of だけでなく with stronger emphasis.',
            },
            {
              term: 'むしろ',
              pronunciation: 'むしろ (mushiro)',
              meaning: 'rather / instead / if anything',
              example: '失敗を恐れるより、むしろ早く試すべきだ。',
              exampleNote: 'Signals the author’s preferred thesis clearly.',
            },
            {
              term: '本質',
              pronunciation: 'ほんしつ (honshitsu)',
              meaning: 'essence / true nature',
              example: '表面的な数字ではなく、問題の本質を見極める必要がある。',
              exampleNote: 'High-frequency N2/N1 academic noun.',
            },
            {
              term: '評価',
              pronunciation: 'ひょうか (hyōka)',
              meaning: 'evaluation / appraisal / acclaim',
              example: 'その映画は国内外で高い評価を得ている。',
              exampleNote: 'Collocation: 高い評価を得る (earn high acclaim).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m5-q1',
              skill: 'reading',
              prompt: 'What is the speaker’s point in 「これは節約というより、むしろ未来への投資だ」?',
              options: [
                'It is purely a cost-cutting measure',
                'It is better understood as an investment in the future rather than mere saving',
                'Neither saving nor investing is useful',
              ],
              correctIndex: 1,
              explanation: 'AというよりむしろB puts the speaker’s true characterization squarely on B (投資).',
            },
            {
              id: 'ja-b2-m5-q2',
              skill: 'writing',
              prompt: 'Fill in the blank: 「最新モデルは電池が長持ちする___、充電時間も半分になった。」',
              options: ['どころか', 'ばかりか', 'あまり'],
              correctIndex: 1,
              explanation: 'Both clauses are positive upgrades stacking together, requiring 〜ばかりか.',
            },
            {
              id: 'ja-b2-m5-q3',
              skill: 'listening',
              prompt: 'Listen to the reviewer. How does she characterize the book?',
              audioScript: 'この本は単なるビジネスの解説書というより、むしろ現代社会を映す人間ドラマですね。専門知識が身につくばかりか、自分の働き方を見直すきっかけにもなりますよ。',
              options: [
                'A dry technical textbook with little relevance',
                'A human drama mirroring modern society that also inspires reflection on work',
                'A fictional science-fiction adventure',
              ],
              correctIndex: 1,
              explanation: 'She reframes it with 「というよりむしろ現代社会を映す人間ドラマ」 and adds 「働き方を見直すきっかけにもなる」.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            '先日導入された新しい社内チャットシステムは、連絡を効率化するどころか、かえって通知の増加で業務の中断を招いている。必要な情報が埋もれやすいばかりか、終業後の連絡まで常態化しつつあるのが問題だ。この課題の本質はツールの性能というより、むしろ運用ルールの不在にあると評価すべきだろう。',
        },
      },
      {
        id: 'ja-b2-m6',
        weekLabel: 'Weeks 11–12 · Executive Presentations & N2 Exam',
        title: 'Structured Presentations (〜を踏まえて・〜上で) & JLPT N2 4-Skill Simulation',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Synthesize complex evidence into persuasive presentations and essays using 〜を踏まえて ("taking into account"), 〜上で ("upon doing"), and 〜ざるを得ない preview, clearing the B2/N2 simulation.',
        objectives: [
          'Ground strategic proposals in evidence with 〜を踏まえて and sequence prerequisites with 〜た上で.',
          'Deliver a coherent 2-minute Japanese presentation with signposting (第一に・以上を踏まえ).',
          'Pass the LinguaVerve Japanese B2 / JLPT N2 4-Skill Simulated Exam.',
        ],
        grammarCheckpoints: ['Evidence-grounded proposals: N + を踏まえて / を踏まえたN', 'Prerequisite & context: Vた + 上で ("after carefully doing") & Vる + 上で ("in doing")', 'Presentation signposting & conclusions (以上の点から・不可欠である)'],
        keyVocabulary: ['踏まえる', '不可欠', '実現', '提案', '見直す'],
        drills: [
          {
            skill: 'speaking',
            title: '2-Minute Proposal Presentation',
            instruction: 'Present a workplace improvement proposal using 第一に, 次に, 以上を踏まえて, and 不可欠です.',
            durationMins: 20,
          },
          {
            skill: 'listening',
            title: 'Executive Committee Wrap-Up',
            instruction: 'Listen and extract the prerequisite condition before launching the regional pilot.',
            durationMins: 15,
            audioScript: '今回の試算結果を踏まえ、関西エリアでの先行導入を提案いたします。ただし、現場スタッフの意見を十分に聞いた上で、最終スケジュールを決定することが不可欠です。',
          },
        ],
        checkpointPrompt: 'Write or present a structured Japanese policy/business proposal using 〜を踏まえて, 〜た上で, and 不可欠である.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Tie all JLPT N2/B2 competencies together into crisp executive proposals, structured essays, and confident oral signposting.',
          sections: [
            {
              id: 'ja-b2-m6-s1',
              heading: 'Grounding Proposals (〜を踏まえて) & Sequencing Prerequisites (〜た上で)',
              explanation:
                'Use N + を踏まえて ("bearing X in mind / taking X as our starting point") to show your proposal respects data or past lessons. Use Vた + 上で ("after thoroughly completing V, then...") to establish mandatory groundwork before making a decision.',
              formula: '[Evidence/Lesson] を踏まえて [Proposal]  |  [Prerequisite Vた] 上で [Main Decision]',
              examples: [
                {
                  target: '前回の失敗を踏まえて、今回は事前の検証期間を二倍に延ばしました。',
                  translation: 'Taking last time’s failure into account, this time we doubled the pre-launch verification period.',
                  highlight: '失敗を踏まえて',
                },
                {
                  target: '契約書の内容を細部まで確認した上で、署名をお願いいたします。',
                  translation: 'Please sign only after confirming the contract contents down to every detail.',
                  highlight: '確認した上で',
                },
              ],
              proTip:
                'Watch the tense switch with 上で: Vた + 上で = "AFTER doing V" (相談した上で決める); Vる + 上で = "IN THE PROCESS of doing V" (仕事を進める上で大切だ)!',
            },
            {
              id: 'ja-b2-m6-s2',
              heading: 'Cohesive B2 Presentation & Essay Architecture',
              explanation:
                'High-scoring Japanese presentations and N2 essays follow a crystal-clear 4-part skeleton: (1) Issue framing (〜が課題となっている), (2) Two structured pillars (第一に〜、第二に〜), (3) Counter-consideration (一方で〜), and (4) Synthesis (以上を踏まえ、〜が不可欠である).',
              formula: '問題提起 → 第一に / 第二に → 一方で（反面） → 以上を踏まえ、〜を提案する',
              examples: [
                {
                  target: '以上の調査結果を踏まえ、人材育成への継続的な投資が不可欠であると結論づけたい。',
                  translation: 'Based on the survey results above, I would like to conclude that continuous investment in talent development is indispensable.',
                  highlight: '以上の調査結果を踏まえ / 不可欠である',
                },
                {
                  target: '新しい技術を現場に定着させる上で、丁寧な研修体制の見直しが鍵となる。',
                  translation: 'In embedding new technology on the front lines, revising a thorough training framework is the key.',
                  highlight: '定着させる上で',
                },
              ],
              proTip:
                'Keep sentence-ending style consistent in writing: either 100% polite です/ます (business emails/speeches) OR 100% plain formal だ/である (essays/reports) — never mix them randomly!',
            },
          ],
          vocabCards: [
            {
              term: '踏まえる',
              pronunciation: 'ふまえる (fumaeru)',
              meaning: 'to take into account / base upon',
              example: '最新の市場動向を踏まえた戦略が必要です。',
              exampleNote: 'Often used in written stem form: を踏まえ.',
            },
            {
              term: '不可欠',
              pronunciation: 'ふかけつ (fukaketsu)',
              meaning: 'indispensable / essential (な-adjective)',
              example: '国際協力を進める上で、相互理解は不可欠だ。',
              exampleNote: 'Stronger, crisper upgrade to 大切 / 必要.',
            },
            {
              term: '実現',
              pronunciation: 'じつげん (jitsugen)',
              meaning: 'realization / making a reality',
              example: '持続可能な社会の実現に向けて取り組んでいる。',
              exampleNote: 'Pairs cleanly with 〜に向けて (toward).',
            },
            {
              term: '提案',
              pronunciation: 'ていあん (teian)',
              meaning: 'proposal / suggestion',
              example: 'コスト削減につながる具体的な提案を行った。',
              exampleNote: 'Verb form: 提案する.',
            },
            {
              term: '見直す',
              pronunciation: 'みなおす (minaosu)',
              meaning: 'to review / revise / reconsider',
              example: '現在の採用基準を根本から見直す時期に来ている。',
              exampleNote: 'Key corporate reform verb in JLPT N2/N1.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-b2-m6-q1',
              skill: 'reading',
              prompt: 'Contrast 「調べる上で大切だ」 vs. 「調べた上で決める」:',
              options: [
                'First = important when researching; Second = decide AFTER researching',
                'Both mean "decide without researching"',
                'First = after researching; Second = while researching',
              ],
              correctIndex: 0,
              explanation: 'Vる上で = in the course of doing V; Vた上で = after completing V first.',
            },
            {
              id: 'ja-b2-m6-q2',
              skill: 'writing',
              prompt: 'Fill in the blank: 「これまでの実績を___、来年度の事業計画を策定いたしました。」',
              options: ['踏まえて', 'どころか', 'あまり'],
              correctIndex: 0,
              explanation: 'Formulating next year’s plan based on past track record takes 〜を踏まえて.',
            },
            {
              id: 'ja-b2-m6-q3',
              skill: 'listening',
              prompt: 'Listen to the committee wrap-up. What is indispensable before finalizing the schedule?',
              audioScript: '今回の試算結果を踏まえ、関西エリアでの先行導入を提案いたします。ただし、現場スタッフの意見を十分に聞いた上で、最終スケジュールを決定することが不可欠です。',
              options: [
                'Cutting staff headcount immediately',
                'Listening thoroughly to frontline staff opinions first',
                'Moving headquarters to Kansai',
              ],
              correctIndex: 1,
              explanation: '「現場スタッフの意見を十分に聞いた上で」 = after thoroughly hearing frontline staff opinions.',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 75,
          checkpointModelAnswer:
            '昨年の社員満足度調査の結果を踏まえ、本日は社内研修制度の見直しをご提案いたします。第一に、業務の高度化に伴い、実践的なデジタル講座の拡充が不可欠です。第二に、部門間の連携を深める上で、部署を越えた交流型ワークショップの導入が効果的です。現場の管理職と十分に協議した上で、来期からの実現を目指したいと存じます。',
        },
      },
    ],
  },

  // =====================================================================
  // C1 (JLPT N1) · STAGE 5: ACADEMIC & EXECUTIVE MASTERY
  // =====================================================================
  {
    id: 'ja-intensive-c1',
    languageId: 'japanese',
    level: 'C1',
    title: 'Japanese C1 / JLPT N1 Academic & Executive Mastery',
    subtitle:
      'Master ~2,000+ Jōyō kanji, pinnacle N1 discourse grammar (〜ざるを得ない・〜をもって・〜を余儀なくされる), BJT J1 diplomacy, and multi-document academic synthesis.',
    heroRole: 'Stage 5 · Academic & Executive Mastery (JLPT N1 / BJT J1)',
    durationWeeks: 16,
    dailyHours: '2.5–3.0 hrs/day (Intensive)',
    targetCertificates: ['JLPT N1 (CEFR C1)', 'BJT Business Japanese J1 (530+)'],
    passingCriteria: 'JLPT N1 scaled score ≥ 100/180 (min 19/60 per section) & executive-grade reading/speaking precision.',
    examBlueprint: {
      reading: '110 mins · ~2,100 Jōyō kanji, abstract humanities/science essays, paired comparative texts, and nuanced author inference.',
      listening: '60 mins · Rapid authentic lectures, multi-party corporate negotiations, subtle sarcasm/hesitation, and synthesis tasks.',
      writing: '45 mins · Executive diplomatic letters and formal academic synthesis essays (300–450 chars, consistent である style).',
      speaking: '16 mins · Defending complex theses under pushback, BJT J1 client diplomacy, and live policy synthesis.',
    },
    referenceIds: ['ref-ja-jlpt-n1', 'ref-ja-jlpt-hub', 'ref-ja-bjt'],
    modules: [
      {
        id: 'ja-c1-m1',
        weekLabel: 'Weeks 1–3 · Pinnacle N1 Syntax',
        title: 'Formal Inevitability & Institutional Discourse (〜ざるを得ない・〜を余儀なくされる・〜をもって)',
        focusSkills: ['reading', 'writing'],
        summary:
          'Command the signature JLPT N1 formal grammar structures that dominate Japanese whitepapers, board announcements, and editorial analyses.',
        objectives: [
          'Express unavoidable necessity objectively using 〜ざるを得ない (する → せざるを得ない).',
          'Describe circumstances forcing an unwelcome action with 〜を余儀なくされる.',
          'Mark official dates, closures, and formal means crisply with 〜をもって.',
        ],
        grammarCheckpoints: ['Unavoidable choice: Vない-stem + ざるを得ない (する → せざるを得ない)', 'Forced by external circumstances: N + を余儀なくされる', 'Formal means / official boundary: N + をもって'],
        keyVocabulary: ['余儀なくされる', '撤退', '見直し', '公表', '実施'],
        drills: [
          {
            skill: 'reading',
            title: 'Corporate Restructuring Press Release',
            instruction: 'Read the press release and extract what forced the closure and its exact effective date.',
            durationMins: 20,
            samplePassage: '原材料費の高騰と需要構造の変化により、当社は一部事業からの撤退を余儀なくされた。本件については慎重な精査を重ねたものの、今月末をもって当該サービスの提供を終了せざるを得ないとの結論に至った。',
          },
          {
            skill: 'writing',
            title: 'Official Policy Notice Rewrite',
            instruction: 'Rewrite a casual announcement into polished N1 formal prose using ざるを得ない and をもって.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write an executive Japanese announcement explaining an unavoidable strategic shift using 〜ざるを得ない, 〜を余儀なくされる, and 〜をもって.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Enter true JLPT N1 register by mastering high-authority formal structures used in press releases, legal notices, and academic prose.',
          sections: [
            {
              id: 'ja-c1-m1-s1',
              heading: 'Unavoidable Action (〜ざるを得ない) & Forced Change (〜を余儀なくされる)',
              explanation:
                'Attach ざるを得ない to the verb ない-stem ("even though I don’t want to, circumstances leave no choice but to..."). Watch the mandatory irregular: する ALWAYS becomes 「せざるを得ない」! For nominalized forced outcomes in news/business, use N + を余儀なくされる ("be forced into N").',
              formula: 'V(ない-stem) + ざるを得ない (する → せざるを得ない)  |  [Noun] を余儀なくされる',
              examples: [
                {
                  target: 'これほど明確な証拠を突きつけられては、過ちを認めざるを得ない。',
                  translation: 'Confronted with such clear evidence, one has no choice but to admit the error.',
                  highlight: '認めざるを得ない',
                },
                {
                  target: '記録的な豪雨により、多くの住民が避難を余儀なくされた。',
                  translation: 'Due to record-breaking torrential rain, many residents were forced to evacuate.',
                  highlight: '避難を余儀なくされた',
                },
              ],
              proTip:
                'Watch the N1 exam trap: *"しざるを得ない"* is ALWAYS wrong — する + ざるを得ない is strictly 「せざるを得ない」 (from classical negative ず)!',
            },
            {
              id: 'ja-c1-m1-s2',
              heading: 'Formal Boundary & Official Instrument: 〜をもって',
              explanation:
                '〜をもって serves two formal roles: (1) marking an official end/boundary point ("effective as of March 31, we close..." = 三月末日をもって終了いたします), and (2) expressing an authoritative means ("through written notice" = 書面をもって通知する).',
              formula: '[Official Date/Event] をもって終了する  |  [Formal Means] をもって通知・対応する',
              examples: [
                {
                  target: '本日の閉会式をもって、三日間にわたる国際会議は幕を閉じた。',
                  translation: 'With today’s closing ceremony, the three-day international conference came to a close.',
                  highlight: '閉会式をもって',
                },
                {
                  target: '選考結果につきましては、書面をもって個別にご連絡申し上げます。',
                  translation: 'Regarding the selection results, we shall notify each candidate individually in writing.',
                  highlight: '書面をもって',
                },
              ],
              proTip:
                'Because 〜をもって carries heavy ceremonial/official weight, never use it for casual actions like *"はしをもって食べる"* — keep it for announcements, ceremonies, and formal procedures.',
            },
          ],
          vocabCards: [
            {
              term: '余儀なくされる',
              pronunciation: 'よぎなくされる (yoginaku sareru)',
              meaning: 'to be forced / compelled to (due to circumstances)',
              example: '資金難により、計画の大幅な縮小を余儀なくされた。',
              exampleNote: 'Active causative version: 〜を余儀なくさせる (force someone to).',
            },
            {
              term: '撤退',
              pronunciation: 'てったい (tettai)',
              meaning: 'withdrawal / pullout (from a market or venture)',
              example: '不採算事業からの撤退を決断した。',
              exampleNote: 'Frequent business news collocation with 余儀なくされる.',
            },
            {
              term: '見直し',
              pronunciation: 'みなおし (minaoshi)',
              meaning: 'overhaul / policy review / revision (noun)',
              example: '制度の抜本的な見直しが求められている。',
              exampleNote: 'Nominalized form of 見直す.',
            },
            {
              term: '公表',
              pronunciation: 'こうひょう (kōhyō)',
              meaning: 'official public announcement / disclosure',
              example: '第三者委員会の調査報告書が本日公表された。',
              exampleNote: 'More formal/institutional than 発表.',
            },
            {
              term: '実施',
              pronunciation: 'じっし (jisshi)',
              meaning: 'implementation / enforcement / execution',
              example: '来月一日をもって新料金体系を実施いたします。',
              exampleNote: 'Core institutional verb in N1 notices.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m1-q1',
              skill: 'writing',
              prompt: 'Choose the ONLY grammatically correct N1 sentence for "we had no choice but to postpone the event":',
              options: [
                '台風接近のため、イベントを延期しざるを得なかった。',
                '台風接近のため、イベントを延期せざるを得なかった。',
                '台風接近のため、イベントを延期すざるを得なかった。',
              ],
              correctIndex: 1,
              explanation: 'する-verbs always conjugate to せざるを得ない (延期せざるを得なかった).',
            },
            {
              id: 'ja-c1-m1-q2',
              skill: 'reading',
              prompt: 'What does 「本年十二月二十八日をもって受付を終了いたします」 communicate?',
              options: [
                'Applications begin on December 28',
                'Applications officially close as of December 28 of this year',
                'Applications require a special certificate on December 28',
              ],
              correctIndex: 1,
              explanation: 'Date + をもって終了いたします sets an official cutoff boundary.',
            },
            {
              id: 'ja-c1-m1-q3',
              skill: 'listening',
              prompt: 'Listen to the executive briefing. Why was the factory forced to suspend production?',
              audioScript: '海外拠点での部品供給網が寸断された影響により、国内工場も一時的な操業停止を余儀なくされました。来週月曜日の再開を目指し、代替調達を急いでおります。',
              options: [
                'Due to a scheduled holiday',
                'Because the overseas parts supply chain was disrupted',
                'Because demand fell to zero',
              ],
              correctIndex: 1,
              explanation: '「海外拠点での部品供給網が寸断された影響により」 = due to disruption of the overseas component supply chain.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '平素より格別のご高配を賜り、厚く御礼申し上げます。昨今の物流コスト上昇および部材調達の長期化により、当社は一部製品の生産体制の見直しを余儀なくされました。社内にてあらゆる合理化策を検討いたしましたものの、本年九月末日をもって旧型モデルの受注を終了せざるを得ない判断に至りました。今後の移行手続きにつきましては、書面をもって個別にご案内申し上げます。',
        },
      },
      {
        id: 'ja-c1-m2',
        weekLabel: 'Weeks 4–5 · Nuanced Concession',
        title: 'Subtle Concession, Regret & Counterfactuals (〜であれ・〜ものを・〜ならまだしも・〜とはいえ)',
        focusSkills: ['reading', 'listening'],
        summary:
          'Decode the subtle emotional and rhetorical undertones tested relentlessly on JLPT N1: universal concession (であれ), missed-opportunity regret (ものを), relative tolerance (ならまだしも), and measured qualification (とはいえ).',
        objectives: [
          'Express universal inclusivity ("whoever / whatever the reason") with 〜であれ / 〜であろうと.',
          'Detect speaker regret or reproach embedded in 〜ものを ("even though X would have worked, alas...").',
          'Contrast acceptable vs. unacceptable extremes with 〜ならまだしも and qualify facts with 〜とはいえ.',
        ],
        grammarCheckpoints: ['Universal concession: N + であれ / 疑問詞 + であれ', 'Counterfactual regret/blame: Plain + ものを', 'Relative tolerance: 〜ならまだしも ("X might be forgivable, but Y is too much!") & Qualification: 〜とはいえ'],
        keyVocabulary: ['とはいえ', 'まだしも', 'いかん', '許容', '妥協'],
        drills: [
          {
            skill: 'listening',
            title: 'Subtle Regret & Criticism Dialogue',
            instruction: 'Listen and catch the speaker’s hidden reproach using ものを and ならまだしも.',
            durationMins: 20,
            audioScript: '一言早めに相談してくれればすぐ手配できたものを、締切直前に言われても困るよ。五分や十分の遅れならまだしも、丸一日遅れるのはさすがに許容できないな。',
          },
          {
            skill: 'reading',
            title: 'Editorial Qualification Scan',
            instruction: 'Read the paragraph and identify what the author concedes vs. insists upon.',
            durationMins: 20,
            samplePassage: '景気は緩やかに回復しつつあるとはいえ、実質賃金の伸び悩みは依然として家計を圧迫している。どのような政策であれ、現場の実感と乖離していては信頼を得られない。',
          },
        ],
        checkpointPrompt: 'Write a nuanced Japanese commentary critiquing a policy or workplace mishap using とはいえ, であれ, ならまだしも, and ものを.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Unlock the fine-grained pragmatic shades of JLPT N1 — reading regret, principled equality, and sharp rhetorical contrast effortlessly.',
          sections: [
            {
              id: 'ja-c1-m2-s1',
              heading: 'Universal Concession (〜であれ) & Measured Qualification (〜とはいえ)',
              explanation:
                '〜であれ (formal version of でも) asserts a principle holds unconditionally ("whether X or Y" = たとえ誰であれ; 理由のいかんであれ). 〜とはいえ ("although it is indeed true that...") concedes a real fact before introducing a sobering reality check.',
              formula: 'たとえ [N / Question word] であれ  |  [Acknowledged Fact] とはいえ、[Contrasting Reality]',
              examples: [
                {
                  target: 'たとえどのような立場であれ、説明責任を免れることはできない。',
                  translation: 'No matter what position one holds, one cannot escape accountability.',
                  highlight: 'どのような立場であれ',
                },
                {
                  target: '春になったとはいえ、朝晩はまだコートが手放せない寒さだ。',
                  translation: 'Although spring has officially arrived, mornings and evenings are still too cold to put away one’s coat.',
                  highlight: '春になったとはいえ',
                },
              ],
              proTip:
                'Pair 「AであれBであれ」 to sweep across opposing cases cleanly: 「賛成であれ反対であれ、根拠を示すべきだ」.',
            },
            {
              id: 'ja-c1-m2-s2',
              heading: 'Counterfactual Regret (〜ものを) & Drawing the Line (〜ならまだしも)',
              explanation:
                '〜ものを connects an unrealized better alternative to a disappointing reality ("If only you had told me, I could have helped — yet you didn’t!"). 〜ならまだしも sets a borderline ("X would be tolerable enough, YET Y goes way too far!").',
              formula: '[Unrealized Conditional] ものを、[Disappointing Reality]  |  [Tolerable X] ならまだしも、[Unacceptable Y]',
              examples: [
                {
                  target: '正直に打ち明けてくれれば力になれたものを、一人で抱え込んでしまったのだ。',
                  translation: 'If only he had confided honestly, we could have helped — yet instead he bottled it all up alone.',
                  highlight: '力になれたものを',
                },
                {
                  target: '初心者ならまだしも、十年以上の経験があるベテランが基本規定を見落とすとは信じ難い。',
                  translation: 'If it were a beginner, one could understand — but it’s hard to believe a veteran with over ten years’ experience overlooked a basic rule.',
                  highlight: '初心者ならまだしも',
                },
              ],
              proTip:
                'In JLPT N1 listening, ものを can even end a sentence trailing off emotionally (「早く病院へ行けばよかったものを…」) — immediately recognize the regretful sigh!',
            },
          ],
          vocabCards: [
            {
              term: 'とはいえ',
              pronunciation: 'とはいえ (to wa ie)',
              meaning: 'although / that having been said / nonetheless',
              example: '自動化が進んだとはいえ、最終判断は人間に委ねられる。',
              exampleNote: 'Can attach to plain sentences or open a new sentence as 「とはいえ、」.',
            },
            {
              term: 'まだしも',
              pronunciation: 'まだしも (madashimo)',
              meaning: 'comparatively tolerable / better than the alternative (ならまだしも)',
              example: '一度の間違いならまだしも、同じ過ちを三度も繰り返した。',
              exampleNote: 'Always followed by criticism of the worse second case.',
            },
            {
              term: 'いかん',
              pronunciation: 'いかん (ikan)',
              meaning: 'nature / state / depending on (のいかんにかかわらず)',
              example: '理由のいかんにかかわらず、期限後の提出は受理されない。',
              exampleNote: 'Classic N1 formal expression (如何).',
            },
            {
              term: '許容',
              pronunciation: 'きょよう (kyoyō)',
              meaning: 'tolerance / permissible allowance',
              example: '安全基準において、わずかな誤差も許容範囲を超える場合は停止する。',
              exampleNote: 'Key formal noun: 許容範囲 (acceptable margin).',
            },
            {
              term: '妥協',
              pronunciation: 'だきょう (dakyō)',
              meaning: 'compromise / concession',
              example: '品質面で安易な妥協をしてはならない。',
              exampleNote: 'Collocation: 妥協点を探る (seek common ground).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m2-q1',
              skill: 'reading',
              prompt: 'Fill in the blank: 「一度や二度の遅刻___、毎週のように欠勤されてはチームが回らない。」',
              options: ['ならまだしも', 'をもって', 'を余儀なくされ'],
              correctIndex: 0,
              explanation: 'Contrasting a tolerable minor slip with an unacceptable recurring problem calls for 〜ならまだしも.',
            },
            {
              id: 'ja-c1-m2-q2',
              skill: 'reading',
              prompt: 'What emotion does 「事前に一言連絡してくれれば準備できたものを」 convey?',
              options: [
                'Cheerful gratitude for a surprise',
                'Regret or mild reproach over a missed chance to prepare',
                'Total indifference to the outcome',
              ],
              correctIndex: 1,
              explanation: '〜ものを carries counterfactual regret/dissatisfaction ("if only you had contacted me beforehand, I could have prepared, yet you didn’t").',
            },
            {
              id: 'ja-c1-m2-q3',
              skill: 'listening',
              prompt: 'Listen carefully. Why is the speaker particularly upset?',
              audioScript: '一言早めに相談してくれればすぐ手配できたものを、締切直前に言われても困るよ。五分や十分の遅れならまだしも、丸一日遅れるのはさすがに許容できないな。',
              options: [
                'Because the delivery was 5 minutes early',
                'Because the person didn’t consult earlier and caused a full-day delay',
                'Because nobody wants to work overtime',
              ],
              correctIndex: 1,
              explanation: 'The speaker contrasts a tolerable 5–10 min delay (ならまだしも) with an unacceptable full-day delay after no early warning.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '新システムの移行は計画通り完了したとはいえ、現場からの問い合わせが想定以上に相次いでいる。軽微な表示の乱れならまだしも、請求処理が一時停止する不具合は業務上とうてい許容できない。事前にテスト環境で実務担当者の意見を取り入れておけば未然に防げたものを、納期を優先するあまり十分な検証を省いてしまったのだ。いかなる事情であれ、品質面での安易な妥協は厳に戒めるべきである。',
        },
      },
      {
        id: 'ja-c1-m3',
        weekLabel: 'Weeks 6–8 · Executive Keigo & BJT J1',
        title: 'BJT J1 Executive Keigo, Written Protocol & High-Stakes Negotiations',
        focusSkills: ['speaking', 'writing'],
        summary:
          'Operate at Japanese C-suite and senior-client level: wield refined humble/respectful idioms (ご査収・ご高配・賜る・存じ上げる), purge double-keigo errors, and negotiate tactfully under pressure.',
        objectives: [
          'Deploy executive business expressions (ご査収ください, ご高配を賜り, 存じ上げております, お目にかかる) accurately.',
          'Spot and eliminate subtle double-keigo (二重敬語) and misdirected Uchi/Soto honorifics.',
          'Handle sensitive client complaints and contract revisions with calm BJT J1 poise.',
        ],
        grammarCheckpoints: ['Pinnacle Humble & Respectful verbs: 賜る・存じ上げる・拝受する・お目にかかる・ご高覧', 'Double-keigo trap audit (おっしゃられる ❌ → おっしゃる ✅; ご覧になられる ❌ → ご覧になる ✅)', 'Diplomatic escalation & follow-up protocol (何卒・ご容赦・ご査収)'],
        keyVocabulary: ['ご査収', '賜る', '存じ上げる', 'ご容赦', '何卒'],
        drills: [
          {
            skill: 'listening',
            title: 'BJT J1 Client Escalation Call',
            instruction: 'Listen to how the account director apologizes, explains root cause without excuses, and restores client trust.',
            durationMins: 20,
            audioScript: 'このたびは多大なるご迷惑をおかけし、誠に申し訳ございません。原因を精査いたしましたところ、弊社の検品工程に不備があったことが判明いたしました。本日中に代替品を発送申し上げますので、何卒ご容赦賜りますようお願い申し上げます。',
          },
          {
            skill: 'speaking',
            title: 'Executive Contract Renewal Pitch',
            instruction: 'Deliver a 90-second renewal greeting thanking a senior partner and proposing next quarter’s collaboration using accurate BJT J1 Keigo.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write an executive Japanese client letter enclosing revised contract documents, apologizing gracefully for an earlier delay, and proposing an in-person review.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Achieve BJT J1 executive polish by mastering refined formal business honorifics and eliminating the subtle keigo traps that trip even advanced learners.',
          sections: [
            {
              id: 'ja-c1-m3-s1',
              heading: 'Executive Honorific Precision (ご査収・賜る・存じ上げる・拝受)',
              explanation:
                'At C1 / BJT J1, standard ます-forms are upgraded to exact institutional verbs: ご査収ください ("please inspect and receive [attached file/check]"), 賜る (humble "be honored to receive" — ご指導を賜り), 拝受いたしました ("humbly received"), and 存じ上げております (humble "know [a person]" vs. 存じております for a fact!).',
              formula: 'Person: 〇〇様を存じ上げております  |  Fact: その件は存じております  |  Attachment: ご査収のほど',
              examples: [
                {
                  target: '先ほどご送付いただいた契約書案を確かに拝受いたしました。',
                  translation: 'I have duly received the draft contract you kindly sent earlier.',
                  highlight: 'ご送付いただいた / 拝受いたしました',
                },
                {
                  target: '改訂版の見積書を添付いたしましたので、ご査収のほどお願い申し上げます。',
                  translation: 'I have attached the revised quotation; please kindly inspect and receive it.',
                  highlight: 'ご査収のほどお願い申し上げます',
                },
              ],
              proTip:
                'Subtle BJT distinction: Use 存じ上げる ONLY for people (「御社の佐藤様のお名前はかねてより存じ上げております」), and 存じる for facts/things (「ご事情はよく存じております」)!',
            },
            {
              id: 'ja-c1-m3-s2',
              heading: 'Eliminating Double Keigo (二重敬語) & Misdirected Prefix Traps',
              explanation:
                'Stacking two honorific markers of the SAME type on one verb creates awkward 二重敬語: *"おっしゃられる"* (WRONG — おっしゃる is ALREADY respectful!), *"ご覧になられる"* (WRONG → ご覧になる), *"お越しになられる"* (WRONG → お越しになる / いらっしゃる), *"拝見させていただく"* (use 拝見いたします). Also avoid *"ご苦労様です"* to superiors — use 「お疲れ様でございます」!',
              formula: '❌ おっしゃられる → ✅ おっしゃる  |  ❌ ご覧になられる → ✅ ご覧になる  |  ❌ 参られる → ✅ いらっしゃる',
              examples: [
                {
                  target: '専務がおっしゃった通り、来期の予算配分を再調整いたします。',
                  translation: 'Just as the Managing Director stated, we shall readjust next term’s budget allocation.',
                  highlight: 'おっしゃった通り',
                },
                {
                  target: 'お忙しい中お越しいただき、誠にありがとうございます。',
                  translation: 'Thank you sincerely for kindly coming despite your busy schedule.',
                  highlight: 'お越しいただき',
                },
              ],
              proTip:
                'Notice one tricky exception: 「お召し上がりになる」 and 「お伺いする」 are socially entrenched idioms accepted as standard — while 「おっしゃられる」 and 「ご覧になられる」 are strictly penalized on BJT and JLPT N1!',
            },
          ],
          vocabCards: [
            {
              term: 'ご査収',
              pronunciation: 'ごさしゅう (go-sashū)',
              meaning: 'kindly inspect and receive (attached files, invoices, contracts)',
              example: '請求書をお送りいたしますので、ご査収ください。',
              exampleNote: 'Never use for simple greetings without an attached item/document.',
            },
            {
              term: '賜る',
              pronunciation: 'たまわる (tamawaru)',
              meaning: 'to humbly be granted / receive (support, guidance, patronage)',
              example: '平素より格別のご高配を賜り、感謝申し上げます。',
              exampleNote: 'Elevated humble counterpart of もらう / いただく.',
            },
            {
              term: '存じ上げる',
              pronunciation: 'ぞんじあげる (zonjiageru)',
              meaning: 'to humbly know (a respected person)',
              example: '先生のご著書を通じてお名前は存じ上げておりました。',
              exampleNote: 'For facts/matters, use 存じております instead.',
            },
            {
              term: 'ご容赦',
              pronunciation: 'ごようしゃ (go-yōsha)',
              meaning: 'forgiveness / pardon / indulgence (formal)',
              example: '行き違いがございましたら、何卒ご容赦ください。',
              exampleNote: 'Graceful executive buffer for minor oversights or delays.',
            },
            {
              term: '何卒',
              pronunciation: 'なにとぞ (nanitozo)',
              meaning: 'humbly / earnestly / please (formal intensifier)',
              example: '今後とも変わらぬご支援を何卒よろしくお願い申し上げます。',
              exampleNote: 'Elevates formal requests and apologies immediately.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m3-q1',
              skill: 'writing',
              prompt: 'Which sentence is 100% FREE of double-keigo (二重敬語) errors?',
              options: [
                '社長が先ほどおっしゃられた方針を確認いたしました。',
                '社長が先ほどおっしゃった方針を確認いたしました。',
                '社長が先ほどご覧になられました資料を拝見させていただき参ります。',
              ],
              correctIndex: 1,
              explanation: 'おっしゃる is already respectful; adding 〜られる creates invalid double keigo.',
            },
            {
              id: 'ja-c1-m3-q2',
              skill: 'reading',
              prompt: 'When is 「ご査収ください」 used appropriately?',
              options: [
                'When asking a client to inspect and receive an attached contract or invoice',
                'When inviting a coworker out for lunch',
                'When apologizing for arriving late to a train',
              ],
              correctIndex: 0,
              explanation: '査収 means "verify contents and receive", reserved for documents, attachments, or payments.',
            },
            {
              id: 'ja-c1-m3-q3',
              skill: 'listening',
              prompt: 'Listen to the account director. What concrete remedy is promised today?',
              audioScript: 'このたびは多大なるご迷惑をおかけし、誠に申し訳ございません。原因を精査いたしましたところ、弊社の検品工程に不備があったことが判明いたしました。本日中に代替品を発送申し上げますので、何卒ご容赦賜りますようお願い申し上げます。',
              options: [
                'Dispatching replacement goods within today',
                'Offering a refund next month',
                'Asking the client to repair the items',
              ],
              correctIndex: 0,
              explanation: '「本日中に代替品を発送申し上げます」 = we shall dispatch replacement items by the end of today.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '株式会社東和 営業部長 佐藤様\n平素より格別のご高配を賜り、厚く御礼申し上げます。株式会社青空のアレックスでございます。先般ご依頼いただきました改訂契約書の最終案を作成いたしましたので、添付にてお送りいたします。お手数をおかけいたしますが、ご査収のほどお願い申し上げます。ご提示が一日遅れましたこと、何卒ご容赦ください。来週火曜日に改めて御社へ伺い、直接ご説明申し上げたく存じます。',
        },
      },
      {
        id: 'ja-c1-m4',
        weekLabel: 'Weeks 9–10 · Academic Lectures & Synthesis',
        title: 'Academic Precision & Abstract Logic (〜に即して・〜に至っては・〜を契機に)',
        focusSkills: ['reading', 'listening'],
        summary:
          'Follow rapid university lectures and dense humanities/policy articles by unpacking nominalized Japanese syntax and high-level N1 analytical connectors.',
        objectives: [
          'Distinguish faithful alignment (〜に即して) from turning points (〜を契機に).',
          'Spot extreme singled-out cases highlighted by 〜に至っては.',
          'Parse long nominalized Japanese sentences (「〜ことによる〜の低下」) cleanly on the first read.',
        ],
        grammarCheckpoints: ['Faithful alignment: N + に即して ("in keeping with actual facts/context")', 'Catalyst / turning point: N + を契機に / を契機として', 'Singling out an extreme case: N + に至っては ("when it comes to X in particular...")'],
        keyVocabulary: ['即する', '契機', '乖離', '検証', '示唆'],
        drills: [
          {
            skill: 'listening',
            title: 'University Sociology Lecture Excerpt',
            instruction: 'Listen and catch the turning point (契機) and the extreme regional example (に至っては).',
            durationMins: 20,
            audioScript: 'コロナ禍を契機に地方移住への関心が高まりました。特に自然豊かな中山間地域に至っては、移住相談件数が五年前の三倍に達しています。今後は画一的な支援ではなく、地域の実情に即した定住策が求められます。',
          },
          {
            skill: 'reading',
            title: 'Nominalized Policy Abstract',
            instruction: 'Break down the long subject/predicate spine of the academic abstract into clear claims.',
            durationMins: 20,
            samplePassage: '統計データの単純な比較による施策評価の限界はかねてより指摘されてきた。実態に即した質的調査を併用することで初めて、制度設計と現場感覚の乖離を埋める示唆が得られるのである。',
          },
        ],
        checkpointPrompt: 'Write an academic Japanese analysis of a societal turning point using を契機に, に即して, and に至っては.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Build C1 academic fluency by mastering analytical N1 connectors and reading dense nominalized Japanese sentences without backtracking.',
          sections: [
            {
              id: 'ja-c1-m4-s1',
              heading: 'Contextual Fit (〜に即して) & Historical Catalysts (〜を契機に)',
              explanation:
                'Use N + に即して ("strictly aligned with reality/facts/rules", e.g., 実情に即した対策 = measures fitted to actual local conditions). Use N + を契機に (formal cousin of をきっかけに) for major social, historical, or corporate turning points.',
              formula: '[Real Context/Rule] に即して / に即したN  |  [Major Event] を契機に / を契機として',
              examples: [
                {
                  target: '抽象論に終始せず、具体的な事例に即して議論を深めるべきだ。',
                  translation: 'Rather than stopping at abstract theory, we should deepen the debate in line with concrete cases.',
                  highlight: '具体的な事例に即して',
                },
                {
                  target: 'エネルギー危機を契機として、再生可能エネルギーへの転換が加速した。',
                  translation: 'Taking the energy crisis as a catalyst, the shift to renewable energy accelerated.',
                  highlight: 'エネルギー危機を契機として',
                },
              ],
              proTip:
                'Watch the JLPT N1 distinction: 〜に沿って = following a line/manual/guideline (方針に沿って); 〜に即して = staying faithful to actual facts/conditions (実態に即して)!',
            },
            {
              id: 'ja-c1-m4-s2',
              heading: 'Spotlighting the Extreme Case (〜に至っては) & Parsing Nominalized Chains',
              explanation:
                'Use N + に至っては to single out the MOST striking or severe example from a group ("and when it comes to X in particular, [shocking fact]!"). When reading dense N1 prose, find the main topic particle は and final verb FIRST, then unpack the の/による noun modifiers inside.',
              formula: '[General trend]、特に [Extreme Case] に至っては [Striking Fact]',
              examples: [
                {
                  target: '今年の夏は全国的に猛暑が続き、一部地域に至っては四十度を超えた。',
                  translation: 'Severe heat persisted nationwide this summer, and in certain regions in particular, temperatures exceeded 40°C.',
                  highlight: '一部地域に至っては',
                },
                {
                  target: '実験結果は、従来の仮説を覆す重要な示唆を含んでいる。',
                  translation: 'The experimental results contain important implications that overturn the conventional hypothesis.',
                  highlight: '重要な示唆を含んでいる',
                },
              ],
              proTip:
                'Read N1 sentences from the OUTSIDE IN: scan the topic (〜は) and final predicate (〜のである / 〜と指摘している) first so embedded relative clauses never disorient you.',
            },
          ],
          vocabCards: [
            {
              term: '即する',
              pronunciation: 'そくする (sokusuru)',
              meaning: 'to conform to / fit closely with (facts, reality)',
              example: '時代の実情に即した法改正が不可欠だ。',
              exampleNote: 'Forms 〜に即して / 〜に即した.',
            },
            {
              term: '契機',
              pronunciation: 'けいき (keiki)',
              meaning: 'catalyst / turning point / impetus',
              example: '国際会議の開催を契機に、都市インフラが刷新された。',
              exampleNote: 'Formal written upgrade of きっかけ.',
            },
            {
              term: '乖離',
              pronunciation: 'かいり (kairi)',
              meaning: 'divergence / gap / disconnect',
              example: '理想と現実の乖離をどう埋めるかが問われている。',
              exampleNote: 'High-yield N1/C1 academic & economic noun.',
            },
            {
              term: '検証',
              pronunciation: 'けんしょう (kenshō)',
              meaning: 'empirical verification / inspection',
              example: '長期的なデータに基づく多角的な検証が必要である。',
              exampleNote: 'Key scholarly & policy verb: 検証する.',
            },
            {
              term: '示唆',
              pronunciation: 'しさ (shisa)',
              meaning: 'implication / insightful suggestion',
              example: 'この歴史的事例は現代の危機管理にも大きな示唆を与える。',
              exampleNote: 'Collocation: 示唆に富む (rich in insight).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m4-q1',
              skill: 'reading',
              prompt: 'Fill in the blank: 「全体的に応募が減っており、地方支店___応募者ゼロという状況だ。」',
              options: ['に至っては', 'に即して', 'をもって'],
              correctIndex: 0,
              explanation: 'Singling out an extreme worst-case example ("when it comes to regional branches in particular, zero applicants!") uses 〜に至っては.',
            },
            {
              id: 'ja-c1-m4-q2',
              skill: 'writing',
              prompt: 'Which expression best means "measures tailored closely to actual local realities"?',
              options: [
                '地域の実態に即した対策',
                '地域の実態に至っては対策',
                '地域の実態を余儀なくされた対策',
              ],
              correctIndex: 0,
              explanation: '実態に即した = faithfully aligned with actual conditions.',
            },
            {
              id: 'ja-c1-m4-q3',
              skill: 'listening',
              prompt: 'Listen to the sociology lecture. What happened in mountainous rural areas?',
              audioScript: 'コロナ禍を契機に地方移住への関心が高まりました。特に自然豊かな中山間地域に至っては、移住相談件数が五年前の三倍に達しています。今後は画一的な支援ではなく、地域の実情に即した定住策が求められます。',
              options: [
                'Relocation inquiries tripled compared to five years ago',
                'All uniform national subsidies were doubled',
                'Population dropped to zero',
              ],
              correctIndex: 0,
              explanation: '「移住相談件数が五年前の三倍に達しています」 = relocation inquiries reached three times the level five years prior.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '生成AIの急速な普及を契機として、大学教育の評価手法は根本的な転換期を迎えている。従来の暗記型試験の限界は以前から議論されてきたが、レポート課題に至っては、本人の思考過程を確認すること自体が困難になりつつある。今後は一律の禁止措置ではなく、各専門分野の実態に即した口頭試問や実践的検証を組み合わせることで、学びの本質を取り戻す示唆が得られるはずである。',
        },
      },
      {
        id: 'ja-c1-m5',
        weekLabel: 'Weeks 11–13 · Stance & Modality',
        title: 'Emphatic Stance, Moral Judgment & Literary Modality (〜極まりない・〜に堪えない・〜まじき)',
        focusSkills: ['reading', 'speaking'],
        summary:
          'Recognize and deploy high-register emotional and ethical evaluations tested at JLPT N1 — expressing utmost intensity (極まりない), deep feeling/unbearability (に堪えない), and ethical impropriety (まじき).',
        objectives: [
          'Express extreme degree formally with な-adj + 極まりない (e.g., 失礼極まりない, 危険極まりない).',
          'Distinguish the two readings of 〜に堪えない: "unbearable/not worthy of" (見るに堪えない) vs. "filled with deep emotion" (感謝に堪えない).',
          'Apply ethical boundaries with Vる + まじき + N ("unbecoming of / impermissible for") and public prohibition べからず.',
        ],
        grammarCheckpoints: ['Utmost extreme: な-adj (no な) + 極まりない / 極まる', 'Dual 〜に堪えない: Vる + に堪えない (unbearable) vs. Emotion N + に堪えない (deeply moved)', 'Ethical condemnation: Vる + まじき + N ("unworthy of") & Prohibition: Vる + べからず'],
        keyVocabulary: ['極まりない', '堪えない', 'まじき', '遺憾', '倫理'],
        drills: [
          {
            skill: 'reading',
            title: 'Ethical Commentary & Statement Analysis',
            instruction: 'Read the statement and distinguish expressions of gratitude vs. ethical condemnation.',
            durationMins: 20,
            samplePassage: '長年にわたり地域医療を支えてくださった先生のご尽力には、ただ感謝に堪えない。その一方で、患者の信頼を裏切るような医療者にあるまじき不正行為は、誠に遺憾極まりない事態である。',
          },
          {
            skill: 'speaking',
            title: 'Formal Ethical Critique (90s)',
            instruction: 'Deliver a measured commentary on corporate data ethics using 遺憾, 倫理, and 〜まじき.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a formal Japanese commentary evaluating an ethical dilemma in journalism, medicine, or technology using 極まりない, に堪えない, and まじき.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Master the unmistakable rhetorical power of JLPT N1 evaluative expressions used in editorials, public statements, and formal speeches.',
          sections: [
            {
              id: 'ja-c1-m5-s1',
              heading: 'Utmost Degree (〜極まりない) & The Two Faces of 〜に堪えない',
              explanation:
                'Attach 極まりない (きわまりない) to a な-adjective stem (drop な!) to mean "utterly / beyond measure" (無責任極まりない = utterly irresponsible; 愉快極まりない = immensely delightful). Watch 〜に堪えない carefully: after a VERB (聞くに堪えない, 見るに堪えない) it means "too awful to watch/hear"; after an EMOTION NOUN (感謝に堪えない, 遺憾に堪えない) it means "overwhelmingly full of [gratitude/regret]"!',
              formula: '[な-adj stem] + 極まりない  |  [Vる] + に堪えない (unbearable)  |  [Emotion N] + に堪えない (deeply filled with)',
              examples: [
                {
                  target: '十分な安全確認を行わずに運行を再開するのは、危険極まりない行為だ。',
                  translation: 'Resuming operations without sufficient safety checks is an utterly dangerous act.',
                  highlight: '危険極まりない',
                },
                {
                  target: '皆様の温かいご支援に対し、心より感謝に堪えません。',
                  translation: 'For everyone’s warm support, I am filled with deepest gratitude from the bottom of my heart.',
                  highlight: '感謝に堪えません',
                },
              ],
              proTip:
                'Don’t get tricked on N1! 「感謝に堪えない」 is 100% POSITIVE ("cannot contain my gratitude"), while 「鑑賞に堪えない」 is NEGATIVE ("cannot withstand viewing = poor quality")!',
            },
            {
              id: 'ja-c1-m5-s2',
              heading: 'Ethical Condemnation (〜まじき) & Formal Prohibition (〜べからず)',
              explanation:
                'Attach まじき to a dictionary verb right before a noun (esp. あるまじき行為 = behavior unbecoming of one’s role) to condemn actions that violate professional ethics. Attach べからず (する → すべからず) for terse classical prohibitions ("must not", often on historical signs or formal maxims).',
              formula: '[Role] に + あるまじき + [Act/Attitude]  |  Vる + べからず (formal maxim: must not)',
              examples: [
                {
                  target: '公的資金を私的に流用するとは、公人にあるまじき行為である。',
                  translation: 'Misappropriating public funds for private use is behavior utterly unbecoming of a public official.',
                  highlight: '公人にあるまじき行為',
                },
                {
                  target: '歴史の教訓を忘れるべからず、という先人の言葉が胸に響く。',
                  translation: 'The ancestors’ maxim "One must never forget the lessons of history" resonates deeply.',
                  highlight: '忘れるべからず',
                },
              ],
              proTip:
                '〜まじき is almost always used as a noun modifier (許すまじき行為, 教育者にあるまじき発言) rather than at the very end of a sentence.',
            },
          ],
          vocabCards: [
            {
              term: '極まりない',
              pronunciation: 'きわまりない (kiwamarinai)',
              meaning: 'extremely / utterly / beyond measure',
              example: '事前の説明なしに契約を変更するのは失礼極まりない。',
              exampleNote: 'Attaches to な-adjective stems (NO な!).',
            },
            {
              term: '堪えない',
              pronunciation: 'たえない (taenai)',
              meaning: 'cannot bear / unworthy of; or deeply filled with (に堪えない)',
              example: '度重なる不祥事の報道は、実に遺憾に堪えない。',
              exampleNote: 'Sometimes written 絶えない for "unceasing" — check the kanji 堪 vs. 絶!',
            },
            {
              term: 'まじき',
              pronunciation: 'まじき (majiki)',
              meaning: 'unbecoming of / inexcusable for (Vる + まじき + N)',
              example: '研究者にあるまじきデータの改ざんが発覚した。',
              exampleNote: 'Derived from classical auxiliary まじ.',
            },
            {
              term: '遺憾',
              pronunciation: 'いかん (ikan)',
              meaning: 'regrettable / deplorable (formal public statement)',
              example: '今回の対応遅延は極めて遺憾である。',
              exampleNote: 'Different kanji from 如何 (いかん = how/nature).',
            },
            {
              term: '倫理',
              pronunciation: 'りんり (rinri)',
              meaning: 'ethics / moral principles',
              example: 'AI開発における倫理基準の整備が急がれている。',
              exampleNote: 'Collocation: 倫理観 (sense of ethics).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m5-q1',
              skill: 'reading',
              prompt: 'What does 「この度の多大なるご尽力に対し、感謝に堪えません」 express?',
              options: [
                'The speaker cannot tolerate the person’s effort',
                'The speaker is overwhelmed with deep gratitude',
                'The speaker refuses to thank the person',
              ],
              correctIndex: 1,
              explanation: 'Emotion noun (感謝) + に堪えない expresses profound, overflowing gratitude.',
            },
            {
              id: 'ja-c1-m5-q2',
              skill: 'writing',
              prompt: 'Choose the natural N1 collocation for "behavior unbecoming of an educator":',
              options: [
                '教育者にあるまじき行為',
                '教育者にある極まりない行為',
                '教育者にあるべからず行為',
              ],
              correctIndex: 0,
              explanation: '[Role] にあるまじき [Noun] is the exact idiomatic N1 pattern for ethical impropriety.',
            },
            {
              id: 'ja-c1-m5-q3',
              skill: 'listening',
              prompt: 'Listen to the panelist. What does she describe as "utterly irresponsible"?',
              audioScript: '個人の医療データを本人の同意なく外部へ提供した件は、専門機関にあるまじき背信行為であり、倫理面からも無責任極まりないと言わざるを得ません。',
              options: [
                'Asking patients for written consent',
                'Sharing personal medical data externally without consent',
                'Upgrading hospital software',
              ],
              correctIndex: 1,
              explanation: '「本人の同意なく外部へ提供した件は…無責任極まりない」 explicitly condemns unauthorized external data sharing.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '近年のデータ活用の進展は社会に多大な恩恵をもたらしている一方、利用者の同意を軽視した情報収集は専門企業にあるまじき行為であり、誠に遺憾に堪えない。安全対策を後回しにして利益のみを追求する姿勢は、社会的信用の観点からも危険極まりないと言わざるを得ない。技術革新の時代であっても、高い倫理観を忘れるべからずという原則を改めて徹底すべきである。',
        },
      },
      {
        id: 'ja-c1-m6',
        weekLabel: 'Weeks 14–16 · Multi-Text Synthesis & N1 Exam',
        title: 'Multi-Document Synthesis, Oral Defense & JLPT N1 / C1 Mastery Exam',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Synthesize conflicting Japanese viewpoints cleanly (〜と相まって・〜はともかく・〜にほかならない), defend nuanced arguments under examiner cross-examination, and clear the C1 / JLPT N1 simulation.',
        objectives: [
          'Synthesize two authors’ overlapping and diverging claims cleanly in N1 comparative reading.',
          'Pinpoint core causes emphatically with 〜にほかならない ("nothing other than") and synergy with 〜と相まって.',
          'Pass the LinguaVerve Japanese C1 / JLPT N1 4-Skill Simulated Exam.',
        ],
        grammarCheckpoints: ['Combined synergy: N + と相まって ("combined with...")', 'Emphatic core identification: N / もの + にほかならない ("nothing other than")', 'Setting aside secondary points: N + はともかく（として）'],
        keyVocabulary: ['相まって', 'にほかならない', 'ともかく', '多角的', '統合'],
        drills: [
          {
            skill: 'reading',
            title: 'Paired Viewpoint Synthesis (A vs. B)',
            instruction: 'Compare Viewpoint A and Viewpoint B to isolate the single premise both authors share.',
            durationMins: 25,
            samplePassage: '【文章A】都市集中は効率化をもたらす一方、災害時の脆弱性を高める。分散型社会への移行はコスト面はともかく、持続可能性の確保にほかならない。【文章B】単なる地方分散だけでは経済活力が低下しかねない。デジタル基盤の整備と相まって初めて、分散の真価が発揮される。',
          },
          {
            skill: 'speaking',
            title: 'C1 Oral Synthesis & Pushback Defense',
            instruction: 'Synthesize both positions in 2 minutes using はともかく, と相まって, and にほかならない.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write a C1 Japanese synthesis essay reconciling two opposing perspectives on urban concentration vs. regional revitalization using と相まって, はともかく, and にほかならない.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Crown your JLPT N1 / C1 mastery by fusing paired-text synthesis, pinpoint rhetorical emphasis, and resilient oral defense.',
          sections: [
            {
              id: 'ja-c1-m6-s1',
              heading: 'Synergy (〜と相まって) & Pinpoint Thesis (〜にほかならない)',
              explanation:
                'Use A + と相まって ("combined with / reinforced by A") when two factors amplify each other to produce a standout result. Use X + にほかならない ("is nothing other than X") to deliver an authoritative, crystal-clear thesis statement at the climax of an essay or speech.',
              formula: '[Factor A] と相まって [Amplified Result]  |  [Phenomenon] は [True Essence] にほかならない',
              examples: [
                {
                  target: '円安の進行とSNSでの情報発信とが相まって、地方の伝統工芸品が海外で脚光を浴びている。',
                  translation: 'Combined with the weaker yen and social media outreach, regional traditional crafts are gaining the spotlight overseas.',
                  highlight: 'とが相まって',
                },
                {
                  target: 'このプロジェクトの成功は、現場スタッフの粘り強い努力の賜物にほかならない。',
                  translation: 'The success of this project is nothing other than the fruit of the frontline staff’s persevering efforts.',
                  highlight: '賜物にほかならない',
                },
              ],
              proTip:
                'Watch the reading of 相まって: あいまって (NOT *そうまって*) — a classic JLPT N1 kanji/reading question!',
            },
            {
              id: 'ja-c1-m6-s2',
              heading: 'Prioritizing the Core Issue (〜はともかく) in Comparative Synthesis',
              explanation:
                'In paired-document analysis and executive debate, use N + はともかく（として） ("setting X aside for now, the crucial point is Y") to acknowledge a secondary factor while steering attention decisively to your central criterion.',
              formula: '[Secondary factor] はともかく（として）、[Primary priority]',
              examples: [
                {
                  target: '短期的な収益性はともかくとして、長期的な信頼構築を最優先すべきである。',
                  translation: 'Setting short-term profitability aside for now, we should give top priority to building long-term trust.',
                  highlight: '収益性はともかくとして',
                },
                {
                  target: '多角的な視点を統合した議論こそ、複雑な社会課題を解く鍵にほかならない。',
                  translation: 'Debate that integrates multifaceted perspectives is nothing other than the key to solving complex social problems.',
                  highlight: '多角的な視点を統合した',
                },
              ],
              proTip:
                'On JLPT N1 paired-passage questions (統合理解), map each author’s stance onto a tiny mental 2-column table ("Agrees on X / Splits on Y") before checking the four options.',
            },
          ],
          vocabCards: [
            {
              term: '相まって',
              pronunciation: 'あいまって (aimatte)',
              meaning: 'combined with / interacting together with (と相まって)',
              example: '優れた脚本と名優の演技が相まって、深い感動を生んだ。',
              exampleNote: 'Positive or negative synergy between two factors.',
            },
            {
              term: 'にほかならない',
              pronunciation: 'にほかならない (ni hoka naranai)',
              meaning: 'nothing other than / precisely because of',
              example: '彼が厳しく指導するのは、期待の表れにほかならない。',
              exampleNote: 'Powerful thesis-anchoring ending in formal essays.',
            },
            {
              term: 'ともかく',
              pronunciation: 'ともかく (tomokaku)',
              meaning: 'setting aside / regardless of (はともかく)',
              example: '結果の成否はともかく、挑戦した姿勢を高く評価したい。',
              exampleNote: 'Polite rhetorical pivot toward the real priority.',
            },
            {
              term: '多角的',
              pronunciation: 'たかくてき (takakuteki)',
              meaning: 'multifaceted / from multiple angles (な-adjective)',
              example: '政策の妥当性を多角的に検証することが求められる。',
              exampleNote: 'Ideal C1 academic adjective.',
            },
            {
              term: '統合',
              pronunciation: 'とうごう (tōgō)',
              meaning: 'integration / unification / synthesis',
              example: '異なる部門の知見を統合し、新たな価値を創出する。',
              exampleNote: 'Verb form: 統合する.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c1-m6-q1',
              skill: 'reading',
              prompt: 'In the paired texts above (A & B), what point do BOTH authors recognize?',
              options: [
                'Urban concentration has zero drawbacks',
                'Decentralization carries potential value, though infrastructure/conditions matter',
                'Digital infrastructure is unnecessary for regional revitalization',
              ],
              correctIndex: 1,
              explanation: 'Text A stresses decentralization for sustainability; Text B agrees its true value emerges when paired with digital infrastructure (と相まって).',
            },
            {
              id: 'ja-c1-m6-q2',
              skill: 'writing',
              prompt: 'Fill in the blank: 「長年の研究蓄積と最新の解析技術___、新薬の開発が一気に前進した。」',
              options: ['と相まって', 'はともかく', 'にあるまじき'],
              correctIndex: 0,
              explanation: 'Two complementary forces amplifying each other requires 〜と相まって.',
            },
            {
              id: 'ja-c1-m6-q3',
              skill: 'listening',
              prompt: 'Listen to the keynote speaker. What does she identify as the TRUE essence of education reform?',
              audioScript: '教材のデジタル化という手法はともかくとして、教育改革の本質は、子ども一人ひとりの探究心を引き出す環境づくりにほかなりません。',
              options: [
                'Replacing all teachers with tablets',
                'Creating an environment that draws out each child’s spirit of inquiry',
                'Eliminating all homework nationwide',
              ],
              correctIndex: 1,
              explanation: 'She sets aside tools (手法はともかく) and defines the core with 「探究心を引き出す環境づくりにほかなりません」.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 95,
          checkpointModelAnswer:
            '東京一極集中の是正をめぐっては、効率性を重視する立場とリスク分散を訴える立場が対立している。短期的な移転コストはともかくとして、災害耐性と多様な暮らしの選択肢を確保する観点から、地方拠点の強化は喫緊の課題にほかならない。もっとも、単なる人員配置の見直しだけでは限界があり、高速通信網の整備や地域独自の産業育成と相まって初めて、持続可能な分散型社会が統合的に実現されるのである。',
        },
      },
    ],
  },

  // =====================================================================
  // C2 (JLPT N1+ / BJT J1+) · STAGE 6: NATIVE-LEVEL MASTERY
  // =====================================================================
  {
    id: 'ja-intensive-c2',
    languageId: 'japanese',
    level: 'C2',
    title: 'Japanese C2 / JLPT N1+ & BJT J1+ Executive Native Mastery',
    subtitle:
      'Attain effortless literary, idiomatic, and boardroom mastery: classical Bungo echoes, Yojijukugo rhetoric, crisis diplomacy, regional/pragmatic agility, and philosophical critique.',
    heroRole: 'Stage 6 · Native-Level Mastery (JLPT N1+ / BJT J1+)',
    durationWeeks: 18,
    dailyHours: '3.0 hrs/day (Mastery)',
    targetCertificates: ['JLPT N1+ Distinction (160+/180)', 'BJT Business Japanese J1+ (600–800)'],
    passingCriteria: 'Near-native precision across editorial prose, high-context executive negotiation, idiomatic fluency, and impromptu rebuttal.',
    examBlueprint: {
      reading: '120 mins · Classical-inflected editorials, philosophical essays, legal/policy whitepapers, and subtle irony/subtext.',
      listening: '60 mins · Unscripted panel debates, rapid Tokyo & Kansai pragmatic shifts, boardroom crisis Q&A, and unspoken subtext.',
      writing: '50 mins · Publication-grade policy briefs, literary commentary, and crisis communications (400–550 chars).',
      speaking: '18 mins · Executive keynote synthesis, real-time cross-examination defense, and calibrated register/diplomacy shifts.',
    },
    referenceIds: ['ref-ja-jlpt-n1', 'ref-ja-jlpt-hub', 'ref-ja-bjt'],
    modules: [
      {
        id: 'ja-c2-m1',
        weekLabel: 'Weeks 1–3 · Literary & Classical Echoes',
        title: 'Classical Bungo Echoes in Modern Editorial Prose (〜たりとも・〜ごとき・〜んがため)',
        focusSkills: ['reading', 'writing'],
        summary:
          'Read Japan’s finest essays, editorials, and literary nonfiction effortlessly by unlocking the classical Japanese (文語) remnants still alive in elite modern prose.',
        objectives: [
          'Deploy absolute minimum emphasis with [Unit of 1] + たりとも〜ない ("not even a single second/drop").',
          'Recognize classical purpose 〜んがため ("in order to") and rhetorical humility/disdain 〜ごとき.',
          'Read classical negative ず / ぬ and concessive とも / ども seamlessly in modern editorials.',
        ],
        grammarCheckpoints: ['Absolute minimum: [One unit] + たりとも〜ない (一刻たりとも無駄にできない)', 'Classical purpose: V(ない-stem) + んがため（に） (する → せんがため)', 'Comparison/humility: N + ごとき / のごとき ("the likes of / as if")'],
        keyVocabulary: ['たりとも', 'ごとき', 'んがため', '看過', '揺るぎない'],
        drills: [
          {
            skill: 'reading',
            title: 'Asahi/Nikkei Tensei Jingo Style Essay',
            instruction: 'Read the literary editorial excerpt and unpack the classical echoes embedded in its prose.',
            durationMins: 25,
            samplePassage: '気候危機への対応は、もはや一刻たりとも猶予を許さぬ段階にある。目先の利益を守らんがために将来世代の選択肢を奪うごとき近視眼的な判断は、断じて看過し得ない。',
          },
          {
            skill: 'writing',
            title: 'Editorial Prose Polish',
            instruction: 'Elevate a plain B2 opinion paragraph into crisp publication-grade C2 prose using たりとも and 看過し得ない.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write a publication-grade Japanese editorial commentary on long-term stewardship or cultural preservation using たりとも, んがため, and ごとき.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Cross from N1 proficiency into true C2 literary literacy by mastering the classical 文語 turns of phrase that give elite Japanese prose its cadence and gravity.',
          sections: [
            {
              id: 'ja-c2-m1-s1',
              heading: 'Absolute Emphasis (〜たりとも〜ない) & High Purpose (〜んがため)',
              explanation:
                'Pair the smallest possible unit (一刻, 一瞬, 一円, 一人) with たりとも + negative to express zero tolerance ("not even a single moment"). Attach んがため（に） to the verb ない-stem (する → せんがため) for weighty, literary purpose ("solely in order to...").',
              formula: '[Unit of 1] + たりとも + [Negative]  |  V(ない-stem) + んがため（に） (する → せんがため)',
              examples: [
                {
                  target: '人命に関わる安全管理においては、一瞬たりとも油断は許されない。',
                  translation: 'In safety management involving human life, not even a single moment of negligence is permissible.',
                  highlight: '一瞬たりとも ... 許されない',
                },
                {
                  target: '失われた信頼を回復せんがため、経営陣は抜本的な改革に着手した。',
                  translation: 'In order to restore lost trust, executive leadership embarked on fundamental reform.',
                  highlight: '回復せんがため',
                },
              ],
              proTip:
                'Watch classical negative ぬ (modern ない) inside literary prose: 「許さぬ段階」(a stage that permits no...), 「知らぬ間に」(before one knows it).',
            },
            {
              id: 'ja-c2-m1-s2',
              heading: 'Rhetorical Comparison & Humble/Dismissive Nuance (〜ごとき・〜ごとく)',
              explanation:
                'Derived from classical 如し ("like / resembling"), のごとき / のごとく carries two registers: (1) vivid formal simile ("like lightning" = 疾風のごとく), and (2) modest self-deprecation or pointed disdain ("someone the likes of me" = 私ごとき; "a trivial setback like this" = この程度の失敗ごときで).',
              formula: 'Simile: N + のごとく / のごときN  |  Humility/Disdain: N + ごとき（に / で）',
              examples: [
                {
                  target: '私ごとき若輩者が意見を述べるのは恐縮ですが、一点提案申し上げます。',
                  translation: 'It is presumptuous for a junior person like myself to offer an opinion, yet allow me to propose one point.',
                  highlight: '私ごとき',
                },
                {
                  target: '先人が築いた遺産を当然のごとく享受するだけでは不十分である。',
                  translation: 'Merely enjoying the legacy built by our predecessors as if it were a given is insufficient.',
                  highlight: '当然のごとく',
                },
              ],
              proTip:
                'Never direct 「あなたごとき」 at someone unless writing a dramatic villain line — used on others it is bitingly dismissive; used on oneself (私ごとき) it conveys polished classical modesty!',
            },
          ],
          vocabCards: [
            {
              term: 'たりとも',
              pronunciation: 'たりとも (taritomo)',
              meaning: 'even a single [unit] (always with negative)',
              example: '市民の税金は一円たりとも無駄にしてはならない。',
              exampleNote: 'Strictly follows minimal units (一人・一刻・一秒・一円).',
            },
            {
              term: 'ごとき',
              pronunciation: 'ごとき (gotoki)',
              meaning: 'like / the likes of (classical 如き)',
              example: '一時的な逆風ごときで信念を曲げるわけにはいかない。',
              exampleNote: 'Adverbial form: ごとく (如く).',
            },
            {
              term: 'んがため',
              pronunciation: 'んがため (n ga tame)',
              meaning: 'in order to / for the express purpose of (literary)',
              example: '歴史的建造物を次世代へ継承せんがため、募金活動が始まった。',
              exampleNote: 'する becomes せんがため (NEVER *しんがため*).',
            },
            {
              term: '看過',
              pronunciation: 'かんか (kanka)',
              meaning: 'overlooking / turning a blind eye to (看過できない)',
              example: '人権に関わる問題を看過することは断じてできない。',
              exampleNote: 'Almost always used in negative: 看過できない / 看過し得ない.',
            },
            {
              term: '揺るぎない',
              pronunciation: 'ゆるぎない (yuruginai)',
              meaning: 'unshakable / unwavering / steadfast',
              example: '長年の実績に裏打ちされた揺るぎない信頼がある。',
              exampleNote: 'Elevates C2 editorial prose gracefully.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m1-q1',
              skill: 'writing',
              prompt: 'Choose the grammatically exact classical-inflected C2 phrase for "in order to achieve peace":',
              options: [
                '平和を実現しんがために',
                '平和を実現せんがために',
                '平和を実現するんがために',
              ],
              correctIndex: 1,
              explanation: 'する-verbs take classical stem せ before んがため: 実現せんがために.',
            },
            {
              id: 'ja-c2-m1-q2',
              skill: 'reading',
              prompt: 'What nuance does 「私ごときが発言するのは僭越ですが」 carry?',
              options: [
                'Arrogant boasting of authority',
                'Polished classical self-humility before offering a comment',
                'Refusal to attend the meeting',
              ],
              correctIndex: 1,
              explanation: '私ごとき ("the likes of me") paired with 僭越 (presumptuous) expresses refined traditional modesty.',
            },
            {
              id: 'ja-c2-m1-q3',
              skill: 'listening',
              prompt: 'Listen to the editorial broadcast. What does the commentator refuse to overlook?',
              audioScript: '目先の人気を得んがために長期的な財政規律を軽視するごとき議論は、将来世代への責任という観点からも一刻たりとも看過し得ないものです。',
              options: [
                'Debates that neglect long-term fiscal discipline merely to win short-term popularity',
                'Proposals to invest in youth education',
                'Short-term weather forecast adjustments',
              ],
              correctIndex: 0,
              explanation: '「目先の人気を得んがために長期的な財政規律を軽視するごとき議論…看過し得ない」.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '地域に根ざした伝統工芸や言語文化は、一度途絶えれば二度と復元できぬ貴重な財産である。目先の経済効率のみを追求せんがために、先人が数百年かけて培ってきた技を時代遅れのごとく切り捨てる風潮は、断じて看過し得ない。少子化が加速する今こそ、一刻たりとも猶予を許さぬ危機意識を持ち、現代の生活様式と融合させながら次世代へ継承する揺るぎない仕組みを築くべきである。',
        },
      },
      {
        id: 'ja-c2-m2',
        weekLabel: 'Weeks 4–6 · Idioms & Cultural Subtext',
        title: 'Yojijukugo (四字熟語), Idiomatic Metaphors & Reading Between the Lines (行間)',
        focusSkills: ['reading', 'speaking'],
        summary:
          'Wield four-character idioms (四字熟語), body-part metaphors (腹を割る・二の足を踏む), and subtle cultural subtext (行間を読む) with effortless native restraint.',
        objectives: [
          'Deploy high-value Yojijukugo accurately in executive and academic contexts (温故知新, 試行錯誤, 臨機応変, 本末転倒, 一朝一夕).',
          'Interpret and use living Japanese idioms (二の足を踏む, 腹を割って話す, 歯止めをかける, 水を差す).',
          'Read subtle understatement and indirect criticism in authentic Japanese interviews.',
        ],
        grammarCheckpoints: ['Strategic Yojijukugo usage (本末転倒, 一朝一夕にはいかない, 臨機応変)', 'Living idioms in journalism & meetings (二の足を踏む, 歯止めをかける, 腹を割る)', 'Reading 行間 (understatement, silence, and indirect refusal)'],
        keyVocabulary: ['本末転倒', '一朝一夕', '臨機応変', '二の足を踏む', '歯止め'],
        drills: [
          {
            skill: 'reading',
            title: 'Idiomatic Commentary Decoding',
            instruction: 'Read the short commentary and translate the exact metaphorical meaning of each idiom.',
            durationMins: 20,
            samplePassage: '信頼構築は一朝一夕にはいかない。コスト削減を急ぐあまり品質を損ねては本末転倒である。新規参入に二の足を踏んでいた競合他社も、今や臨機応変な戦略転換を迫られている。',
          },
          {
            skill: 'speaking',
            title: 'Executive Fireside Chat (90s)',
            instruction: 'Discuss leadership and innovation incorporating two Yojijukugo and one idiomatic expression naturally without sounding forced.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a refined Japanese commentary on organizational reform or mastery using 一朝一夕, 本末転倒, 臨機応変, and 二の足を踏む.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Achieve native-like lexical texture by deploying Yojijukugo and living Japanese metaphors cleanly — knowing both their exact nuance and when restraint sounds sharpest.',
          sections: [
            {
              id: 'ja-c2-m2-s1',
              heading: 'Precision Yojijukugo in Serious Discourse',
              explanation:
                'Native Japanese speakers do NOT stuff sentences with obscure four-character idioms — they deploy a tight canon of high-impact Yojijukugo at exact rhetorical pivots: 本末転倒 (putting the cart before the horse / confusing means with ends), 一朝一夕にはいかない (cannot be achieved overnight — almost always negative!), 臨機応変 (adapting flexibly to circumstances), and 温故知新 (drawing new insight from studying the past).',
              formula: '一朝一夕には〜ない (not overnight)  |  本末転倒だ (means-ends inversion)  |  臨機応変に対応する',
              examples: [
                {
                  target: '制度を厳格化しすぎて市民の利便性を損ねては、まさに本末転倒である。',
                  translation: 'Making regulations so strict that they undermine citizens’ convenience completely puts the cart before the horse.',
                  highlight: '本末転倒である',
                },
                {
                  target: '強固な組織文化の醸成は一朝一夕には成し遂げられない。',
                  translation: 'Fostering a resilient organizational culture cannot be accomplished overnight.',
                  highlight: '一朝一夕には成し遂げられない',
                },
              ],
              proTip:
                'Watch 一朝一夕 (いっちょういっせき): it ALWAYS pairs with a negative predicate ("not in a single morning and evening") — never use it affirmatively!',
            },
            {
              id: 'ja-c2-m2-s2',
              heading: 'High-Yield Living Idioms & Reading 行間 (Subtext)',
              explanation:
                'Japanese journalism and boardrooms thrive on concise metaphorical idioms: 二の足を踏む (hesitate to take the next step), 歯止めをかける (put a brake on a bad trend), 腹を割って話す (speak candidly from the gut), and 水を差す (pour cold water on enthusiasm).',
              formula: '二の足を踏む (hesitate)  |  〜に歯止めをかける (halt decline)  |  腹を割って話し合う (talk frankly)',
              examples: [
                {
                  target: '初期費用の高さから、導入に二の足を踏む事業者が依然として多い。',
                  translation: 'Due to high upfront costs, many operators still hesitate to take the plunge into adoption.',
                  highlight: '導入に二の足を踏む',
                },
                {
                  target: '少子化の進行に歯止めをかけるには、腹を割った超党派の議論が不可欠だ。',
                  translation: 'To put a brake on the declining birthrate, candid bipartisan debate is indispensable.',
                  highlight: '歯止めをかける / 腹を割った',
                },
              ],
              proTip:
                'In C2 listening, watch indirect 行間 criticism: 「大変意欲的なご提案ですね、ただ実現可能性の面でもう少し精査が必要かもしれません」 = polite Japanese for "This proposal is currently unrealistic!"',
            },
          ],
          vocabCards: [
            {
              term: '本末転倒',
              pronunciation: 'ほんまつてんとう (honmatsu tentō)',
              meaning: 'putting the cart before the horse / inverting priorities',
              example: '健康のための運動で体を壊しては本末転倒だ。',
              exampleNote: '本 (root/essence) vs. 末 (branch/detail) flipped upside down.',
            },
            {
              term: '一朝一夕',
              pronunciation: 'いっちょういっせき (itchō isseki)',
              meaning: 'in a single day / overnight (used with negative)',
              example: '語学力の習得は一朝一夕にはいかない。',
              exampleNote: 'Pairs naturally with 〜にはいかない / 〜にはできない.',
            },
            {
              term: '臨機応変',
              pronunciation: 'りんきおうへん (rinki ōhen)',
              meaning: 'adapting flexibly on the spot to changing situations',
              example: '予期せぬトラブルにも臨機応変に対応できる力が求められる。',
              exampleNote: 'Frequently praised workplace competency in Japan.',
            },
            {
              term: '二の足を踏む',
              pronunciation: 'にのあしをふむ (ni no ashi o fumu)',
              meaning: 'to hesitate / balk at taking the next step',
              example: 'リスクを恐れて挑戦に二の足を踏んでは機会を逃す。',
              exampleNote: 'Target takes に (投資に二の足を踏む).',
            },
            {
              term: '歯止め',
              pronunciation: 'はどめ (hadome)',
              meaning: 'brake / check / safeguard against runaway decline',
              example: '人材流出に歯止めをかける施策を打ち出した。',
              exampleNote: 'Collocations: 歯止めをかける (put a stop) / 歯止めがかからない (unstoppable).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m2-q1',
              skill: 'reading',
              prompt: 'Which idiom accurately completes: 「規則を守ることにこだわりすぎて、本来の目的である顧客満足を忘れては___だ」?',
              options: ['本末転倒', '温故知新', '臨機応変'],
              correctIndex: 0,
              explanation: 'Forgetting the core purpose (customer satisfaction) while obsessing over a secondary rule is 本末転倒.',
            },
            {
              id: 'ja-c2-m2-q2',
              skill: 'writing',
              prompt: 'Which sentence uses 一朝一夕 correctly?',
              options: [
                '一朝一夕で完璧な信頼関係が簡単に作れた。',
                '地域の信頼を築くことは一朝一夕にはいかず、地道な対話の積み重ねが不可欠だ。',
                '一朝一夕に急いで駅まで走った。',
              ],
              correctIndex: 1,
              explanation: '一朝一夕 always pairs with negation ("cannot be achieved overnight").',
            },
            {
              id: 'ja-c2-m2-q3',
              skill: 'listening',
              prompt: 'Listen to the board member’s indirect comment. What is her REAL message?',
              audioScript: 'とても夢のある意欲的な構想だと感じました。ただ、現場の人員体制を考えると、来期からの全面導入にはもう少し慎重な検証の余地がありそうですね。',
              options: [
                'Approve full rollout immediately next quarter',
                'Politely signaling that full rollout next quarter is premature given staffing limits',
                'Praise the staffing surplus enthusiastically',
              ],
              correctIndex: 1,
              explanation: 'Classic Japanese boardroom subtext: praise first (意欲的な構想), then soft brake (慎重な検証の余地 = not ready for full rollout).',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '企業のデジタル変革は一朝一夕には成し遂げられない。最新ツールの導入自体が目的化し、かえって現場の負担を増やしてしまっては本末転倒である。変化への不安から変革に二の足を踏む部署も多いが、経営陣と現場が腹を割って課題を共有し、状況に応じて臨機応変に運用を調整していくことこそが、生産性低下に歯止めをかけ持続的な成長を生む鍵となる。',
        },
      },
      {
        id: 'ja-c2-m3',
        weekLabel: 'Weeks 7–9 · Boardroom Strategy & Crisis Diplomacy',
        title: 'BJT J1+ Crisis Management, Consensus Building (根回し) & High-Stakes Diplomacy',
        focusSkills: ['speaking', 'listening'],
        summary:
          'Lead sensitive Japanese corporate negotiations, crisis press briefings, and pre-meeting consensus building (根回し) with impeccable accountability, empathy, and strategic composure.',
        objectives: [
          'Navigate crisis apologies and accountability briefings without defensive excuses or legal ambiguity.',
          'Practice Japanese consensus building (根回し・合意形成) and face-saving mediation between warring departments.',
          'Calibrate Keigo dynamically in mixed internal/external boardrooms (BJT J1+ standard).',
        ],
        grammarCheckpoints: ['Crisis accountability phrasing (厳粛に受け止める・再発防止策を徹底する)', 'Consensus & mediation expressions (双方の折り合いをつける・大局的見地から)', 'C-suite diplomatic hedging (差し障りのない範囲で・前向きに協議を進める)'],
        keyVocabulary: ['厳粛', '再発防止', '合意形成', '大局的', '折り合い'],
        drills: [
          {
            skill: 'listening',
            title: 'Crisis Press Q&A Mediation',
            instruction: 'Listen to how the executive handles a tough journalist question without evasiveness or premature speculation.',
            durationMins: 20,
            audioScript: 'ご指摘を厳粛に受け止めております。現時点で原因のすべてが確定したわけではございませんが、外部専門家を交えた調査委員会を直ちに立ち上げ、事実関係が判明次第、速やかに公表するとともに再発防止策を徹底してまいります。',
          },
          {
            skill: 'speaking',
            title: 'Inter-Departmental Mediation (2 mins)',
            instruction: 'Mediate between Sales (wants immediate launch) and Engineering (needs 2 more weeks of QA) to build a face-saving consensus.',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Draft a BJT J1+ executive crisis statement or mediation proposal addressing stakeholders with accountability, concrete safeguards, and consensus language.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Master the pinnacle of Japanese professional communication: guiding high-stakes negotiations, mediating conflict gracefully, and communicating clearly during crises.',
          sections: [
            {
              id: 'ja-c2-m3-s1',
              heading: 'Crisis Accountability & Non-Defensive Transparency',
              explanation:
                'In Japanese corporate crisis communication, sounding defensive destroys trust instantly. Follow the gold-standard 4-beat cadence: (1) Acknowledge gravity squarely (厳粛に受け止める), (2) State verified facts cleanly without speculation, (3) Present immediate containment & third-party verification, and (4) Commit to concrete recurrence prevention (再発防止策).',
              formula: '厳粛に受け止める → 事実関係の精査 → 当面の対応 → 再発防止策の徹底',
              examples: [
                {
                  target: '関係者の皆様からのご批判を厳粛に受け止め、信頼回復に全力を尽くしてまいります。',
                  translation: 'We take the criticism from all stakeholders with the utmost seriousness and will devote our full efforts to restoring trust.',
                  highlight: '厳粛に受け止め',
                },
                {
                  target: '原因究明と並行し、第三者の視点を取り入れた再発防止策を速やかに策定いたします。',
                  translation: 'In parallel with determining the root cause, we shall promptly formulate recurrence-prevention measures incorporating third-party perspectives.',
                  highlight: '再発防止策を速やかに策定',
                },
              ],
              proTip:
                'Use 〜てまいります (humble progressive of いく) for ongoing institutional commitments ("we shall continue to build/strive forward") — a hallmark of native Japanese executive leadership.',
            },
            {
              id: 'ja-c2-m3-s2',
              heading: 'Consensus Building (合意形成) & Face-Saving Mediation',
              explanation:
                'Japanese executive decisions thrive on 根回し (informal pre-alignment) and face-saving synthesis. Instead of declaring one side "wrong", frame compromises from a broader strategic vantage point (大局的見地から) and look for mutually acceptable middle ground (双方の折り合いをつける / 落としどころを探る).',
              formula: '双方の立場を踏まえ → 大局的見地から → 折り合いをつける / 段階的導入',
              examples: [
                {
                  target: '営業・開発双方の懸念を踏まえ、大局的見地から段階的リリースで折り合いをつけたい。',
                  translation: 'Bearing both Sales’ and Engineering’s concerns in mind, I would like to find middle ground via a phased release from a big-picture perspective.',
                  highlight: '大局的見地から ... 折り合いをつけたい',
                },
                {
                  target: '公式の会議に先立ち、関係部署との丁寧な合意形成を図ることが円滑な実行の鍵となる。',
                  translation: 'Prior to the formal meeting, fostering careful consensus building with related departments is the key to smooth execution.',
                  highlight: '合意形成を図る',
                },
              ],
              proTip:
                'Distinguish 折り合いをつける (find constructive compromise) from 妥協する (sometimes carries a resigned nuance of settling for less).',
            },
          ],
          vocabCards: [
            {
              term: '厳粛',
              pronunciation: 'げんしゅく (genshuku)',
              meaning: 'solemn / grave / with utmost seriousness',
              example: '監査委員会の指摘を厳粛に受け止めております。',
              exampleNote: 'Gold-standard corporate accountability adverb: 厳粛に.',
            },
            {
              term: '再発防止',
              pronunciation: 'さいはつぼうし (saihatsu bōshi)',
              meaning: 'prevention of recurrence',
              example: '実効性のある再発防止策を全社で徹底する。',
              exampleNote: 'Essential in Japanese crisis & compliance communications.',
            },
            {
              term: '合意形成',
              pronunciation: 'ごういけいせい (gōi keisei)',
              meaning: 'consensus building',
              example: '多様な利害関係者の間で丁寧な合意形成を進める。',
              exampleNote: 'Verb collocation: 合意形成を図る.',
            },
            {
              term: '大局的',
              pronunciation: 'たいきょくてき (taikyokuteki)',
              meaning: 'big-picture / holistic / macro-strategic',
              example: '目先の損得を離れ、大局的な視点から判断すべきだ。',
              exampleNote: 'Key mediation phrase: 大局的見地から.',
            },
            {
              term: '折り合い',
              pronunciation: 'おりあい (oriai)',
              meaning: 'compromise / workable mutual agreement',
              example: '予算と品質のバランスについて、ようやく折り合いがついた。',
              exampleNote: 'Transitive: 折り合いをつける; Intransitive: 折り合いがつく.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m3-q1',
              skill: 'speaking',
              prompt: 'In a crisis press Q&A, which opening best reflects credible Japanese executive accountability?',
              options: [
                'それは下請け会社の責任なので当社は関係ありません。',
                'このたびの事態を厳粛に受け止め、速やかに事実関係を精査した上で再発防止策を徹底してまいります。',
                'まあ、よくあることですから気にしないでください。',
              ],
              correctIndex: 1,
              explanation: 'Acknowledging gravity (厳粛に受け止め), investigating facts, and committing to prevention (再発防止策) is the BJT J1+ benchmark.',
            },
            {
              id: 'ja-c2-m3-q2',
              skill: 'reading',
              prompt: 'What does 「大局的見地から双方の折り合いをつける」 mean?',
              options: [
                'Cancel the project unilaterally',
                'Reach a workable compromise between both sides from a big-picture perspective',
                'Postpone the discussion indefinitely',
              ],
              correctIndex: 1,
              explanation: '大局的見地 = big-picture perspective; 折り合いをつける = strike a balanced compromise.',
            },
            {
              id: 'ja-c2-m3-q3',
              skill: 'listening',
              prompt: 'Listen to the executive’s reply. What concrete governance step is announced?',
              audioScript: 'ご指摘を厳粛に受け止めております。現時点で原因のすべてが確定したわけではございませんが、外部専門家を交えた調査委員会を直ちに立ち上げ、事実関係が判明次第、速やかに公表するとともに再発防止策を徹底してまいります。',
              options: [
                'Launching an investigation committee including outside experts immediately',
                'Keeping all findings strictly confidential forever',
                'Shutting down the company next week',
              ],
              correctIndex: 0,
              explanation: '「外部専門家を交えた調査委員会を直ちに立ち上げ」 = immediately establishing an investigation committee with external experts.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '株主およびお取引先の皆様へ\nこのたびのサービス障害により多大なるご迷惑をおかけいたしましたこと、深くお詫び申し上げます。当社は本事態を極めて厳粛に受け止め、外部専門家を含む検証委員会を直ちに設置いたしました。今後は営業・開発双方の意見を大局的見地から統合し、安全確認と迅速な復旧体制の折り合いを図りながら、実効性のある再発防止策の徹底と信頼回復に全社一丸となって取り組んでまいります。',
        },
      },
      {
        id: 'ja-c2-m4',
        weekLabel: 'Weeks 10–12 · Pragmatic & Regional Mastery',
        title: 'Pragmatic Agility: Register Shifting, Kansai Dialect Comprehension & Subtle Humor',
        focusSkills: ['listening', 'speaking'],
        summary:
          'Move effortlessly across real living Japanese: decode natural Kansai-ben in business and media, recognize understatement, irony, and Kyoto-style politeness (遠回し表現), and shift registers seamlessly.',
        objectives: [
          'Comprehend high-frequency Kansai-ben grammar and vocabulary effortlessly (〜へん, 〜やねん, めっちゃ, ちゃう, ほんま).',
          'Interpret pragmatic understatement, playful irony (皮肉), and indirect Kyoto-style cues accurately.',
          'Shift cleanly on demand between casual camaraderie, warm collegial polite speech, and formal executive register.',
        ],
        grammarCheckpoints: ['Core Kansai-ben mappings: ない→へん / だ→や / ちがう→ちゃう / だから→やから', 'Pragmatic indirectness (遠回し表現) & reading situational mood (空気を読む)', 'Dynamic register switching (タメ口 ↔ 丁寧語 ↔ 敬語) within a single social setting'],
        keyVocabulary: ['遠回し', '皮肉', 'ニュアンス', '使い分け', '親しみ'],
        drills: [
          {
            skill: 'listening',
            title: 'Osaka–Tokyo Mixed Conversation',
            instruction: 'Listen to an Osaka colleague chatting casually and translate the Kansai expressions into Standard Japanese.',
            durationMins: 20,
            audioScript: 'あかん、さっきの資料、数字ちょっとちゃうかったわ！まだ部長には送ってへんから今のうちに直しとくね。ほんま気づいてくれてめっちゃ助かったわ、ありがとうな！',
          },
          {
            skill: 'speaking',
            title: '3-Register Retelling Challenge',
            instruction: 'Deliver the same news (a project won an award) in 3 registers: (1) to a close friend, (2) to a coworker, (3) to an external executive client.',
            durationMins: 15,
          },
        ],
        checkpointPrompt: 'Write a short Japanese analysis comparing direct vs. indirect communication styles in Japan, and include a 3-register example of the same core message.',
        lesson: {
          estimatedMins: 45,
          overview:
            'True C2 fluency means understanding Japan beyond textbooks — decoding regional speech, warm banter, subtle indirectness, and effortless register agility.',
          sections: [
            {
              id: 'ja-c2-m4-s1',
              heading: 'Decoding Kansai-ben (関西弁) Without Missing a Beat',
              explanation:
                'With Osaka/Kyoto/Kobe anchoring Japan’s second-largest economic and cultural hub, C2 listeners regularly encounter Kansai-ben in podcasts, comedy, and corporate meetings. Just six core mappings unlock 80% of it: だ → や, ない → へん (行かない → 行かへん / 行けへん), 違う → ちゃう, 本当 → ほんま, とても → めっちゃ, だめ → あかん.',
              formula: 'だ → や  |  ない → へん  |  違う → ちゃう  |  とても → めっちゃ  |  だめ → あかん',
              examples: [
                {
                  target: 'Kansai: そんなん全然知らんかったわ、ほんまありがとうな！',
                  translation: 'Standard: そんなこと全然知らなかったよ、本当にありがとう！ (I had no idea about that, thanks so much!)',
                  highlight: '知らんかった / ほんま',
                },
                {
                  target: 'Kansai: 明日の会議、場所ちゃうねん。三階やで。',
                  translation: 'Standard: 明日の会議、場所が違うんだよ。三階だよ。 (Tomorrow’s meeting is in a different room — it’s on the 3rd floor.)',
                  highlight: 'ちゃうねん / 三階やで',
                },
              ],
              proTip:
                'For non-native C2 speakers, mastering 100% RECEPTIVE comprehension of Kansai-ben while speaking crisp Tokyo Standard Japanese (with warm register flexibility) is universally admired.',
            },
            {
              id: 'ja-c2-m4-s2',
              heading: 'Reading Indirect Politeness (遠回し表現) & Calibrated Register Shifting',
              explanation:
                'High-context Japanese often cushions boundaries or criticism through gentle understatement rather than blunt confrontation: 「少し検討させてください」(likely no), 「お時間を取らせてしまってすみません」(it’s getting late, let’s wrap up), or playful self-deprecating humor that eases group tension without embarrassing anyone.',
              formula: 'Direct friction ❌ → Cushion + Neutral observation + Mutual face-saving ✅',
              examples: [
                {
                  target: 'Casual: すごいね！企画通ったんだ！ ↔ Formal: このたびは新企画のご採択、誠におめでとうございます。',
                  translation: 'Same good news calibrated cleanly to social distance and setting.',
                  highlight: '使い分け (register calibration)',
                },
                {
                  target: '皮肉や遠回しな表現の真意を汲み取るには、言葉の表面だけでなく文脈全体を見る必要がある。',
                  translation: 'To grasp the true intent of irony or roundabout expressions, one must read the entire context, not just surface words.',
                  highlight: '真意を汲み取る',
                },
              ],
              proTip:
                'Even close Japanese coworkers switch smoothly into crisp formal Keigo the instant a client joins the call — practicing instant "code-switching" is a true C2 superpower!',
            },
          ],
          vocabCards: [
            {
              term: '遠回し',
              pronunciation: 'とおまわし (tōmawashi)',
              meaning: 'indirect / roundabout (in phrasing)',
              example: '相手を傷つけないよう、遠回しに注意を促した。',
              exampleNote: 'Often used as 遠回しに言う / 遠回しな表現.',
            },
            {
              term: '皮肉',
              pronunciation: 'ひにく (hiniku)',
              meaning: 'irony / sarcasm',
              example: '彼の褒め言葉にはわずかな皮肉が込められていた。',
              exampleNote: 'Also means situational irony: 皮肉なことに (ironically).',
            },
            {
              term: 'ニュアンス',
              pronunciation: 'ニュアンス (nyuansu)',
              meaning: 'nuance / subtle shade of meaning',
              example: '類義語同士の微妙なニュアンスの違いを捉えることが大切だ。',
              exampleNote: 'Universal metalinguistic word in Japanese discussions.',
            },
            {
              term: '使い分け',
              pronunciation: 'つかいわけ (tsukaiwake)',
              meaning: 'selective / context-appropriate use',
              example: '場面や相手に応じた敬語の使い分けが信頼につながる。',
              exampleNote: 'Verb form: 使い分ける.',
            },
            {
              term: '親しみ',
              pronunciation: 'したしみ (shitashimi)',
              meaning: 'warmth / approachability / familiarity',
              example: '関西弁には独特の温かさと親しみがある。',
              exampleNote: 'Adjective: 親しみやすい (approachable).',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m4-q1',
              skill: 'listening',
              prompt: 'Listen to the Osaka colleague. What is the status of the document?',
              audioScript: 'あかん、さっきの資料、数字ちょっとちゃうかったわ！まだ部長には送ってへんから今のうちに直しとくね。ほんま気づいてくれてめっちゃ助かったわ、ありがとうな！',
              options: [
                'It was already sent to the boss with the wrong numbers',
                'A number was slightly off, and since it hasn’t been sent to the boss yet, they will fix it now',
                'The boss rejected the document yesterday',
              ],
              correctIndex: 1,
              explanation: 'ちゃうかった = 違っていた (was wrong); 送ってへん = 送っていない (haven’t sent yet).',
            },
            {
              id: 'ja-c2-m4-q2',
              skill: 'reading',
              prompt: 'At a lengthy client visit, the host smiles and says 「もうこんなお時間ですね、お疲れになったでしょう」. What is the likely pragmatic cue?',
              options: [
                'An invitation to stay three more hours',
                'A polite, roundabout cue that it is a natural time to wrap up the visit',
                'An announcement that dinner is being served',
              ],
              correctIndex: 1,
              explanation: 'In high-context Japanese, noting the time and expressing concern for the guest’s fatigue gently signals wrapping up gracefully.',
            },
            {
              id: 'ja-c2-m4-q3',
              skill: 'speaking',
              prompt: 'Which sentence shows appropriate collegial-polite register (neither stiff nor overly casual) to a friendly teammate?',
              options: [
                '資料チェックありがとう！すごく助かりました。午後もよろしくお願いしますね。',
                '貴殿のご査収を賜り恐悦至極に存じ上げます。',
                '資料見ろよ、早くしろ。',
              ],
              correctIndex: 0,
              explanation: 'Blending polite です/ます with warm particles (ね) balances respect and approachability (親しみ) among teammates.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '日本語コミュニケーションの奥深さは、相手との距離感や場面に応じた精緻な使い分けにある。たとえば会議の日程変更を伝える場合でも、親しい同僚には「ごめん、明日の打ち合わせ木曜に変えてもいい？」と親しみを込め、社内の上司には「恐れ入りますが、木曜日へ変更していただけますでしょうか」、さらに外部の取引先には「大変恐縮でございますが、ご調整を賜れますでしょうか」と表現を切り替える。遠回しな言い回しや地域方言のニュアンスまで汲み取れてこそ、真に豊かな対話が可能になる。',
        },
      },
      {
        id: 'ja-c2-m5',
        weekLabel: 'Weeks 13–15 · Policy, Law & Philosophy',
        title: 'Policy Whitepapers, Legal Precision (〜に照らして・〜を問わず) & Philosophical Critique',
        focusSkills: ['reading', 'writing'],
        summary:
          'Analyze Japanese legal clauses, government whitepapers, and philosophical critiques by mastering exact definitional and statutory language (〜に照らして・〜をもってしても・〜の如何を問わず・ただし).',
        objectives: [
          'Evaluate actions against statutory or ethical yardsticks using 〜に照らして.',
          'Parse Japanese legal provisos (ただし〜この限りではない = "provided, however, that this shall not apply...") cleanly.',
          'Write rigorous, logically airtight Japanese philosophical or policy critiques.',
        ],
        grammarCheckpoints: ['Evaluating against standards: N + に照らして ("in light of")', 'Legal proviso formula: ただし、〜場合はこの限りではない', 'Extreme hypothetical: N + をもってしても ("even with the utmost power/expertise of...")'],
        keyVocabulary: ['照らす', 'この限りではない', '妥当性', '公益', '均衡'],
        drills: [
          {
            skill: 'reading',
            title: 'Statutory Proviso & Whitepaper Clause',
            instruction: 'Read the policy clause and determine the exact exception created by 「ただし〜この限りではない」.',
            durationMins: 25,
            samplePassage: '本規程の趣旨に照らし、会員の個人情報は本人の事前同意なく第三者へ提供してはならない。ただし、法令に基づく開示要請がある場合、または人の生命保護のため緊急を要する場合は、この限りではない。',
          },
          {
            skill: 'writing',
            title: 'Policy Principle & Proviso Drafting',
            instruction: 'Draft a clear AI governance principle with one standard (に照らして) and one precise exception (この限りではない).',
            durationMins: 20,
          },
        ],
        checkpointPrompt: 'Write a C2 Japanese policy or philosophical critique evaluating the balance between technological freedom and public interest using に照らして, をもってしても, and 均衡.',
        lesson: {
          estimatedMins: 45,
          overview:
            'Conquer Japan’s densest nonfiction domains — contracts, policy whitepapers, and philosophical essays — with crystal-clear structural precision.',
          sections: [
            {
              id: 'ja-c2-m5-s1',
              heading: 'Normative Yardsticks (〜に照らして) & Legal Exceptions (この限りではない)',
              explanation:
                'Use N + に照らして (or に照らし合わせて) to judge an action against a law, precedent, or principle ("in light of the constitution / past data"). In Japanese contracts and statutes, ただし…この限りではない ALWAYS carves out an explicit legal exception ("provided, however, that this restriction shall not apply when...").',
              formula: '[Law/Standard] に照らして判断する  |  原則として〜。ただし、[Exception] はこの限りではない。',
              examples: [
                {
                  target: '国際法の原則および人道的見地に照らして、今回の措置の妥当性を検証すべきだ。',
                  translation: 'The validity of the current measure ought to be examined in light of international law principles and humanitarian perspectives.',
                  highlight: '見地に照らして',
                },
                {
                  target: '申込後の返金は原則不可とする。ただし、主催者都合による中止の場合はこの限りではない。',
                  translation: 'Refunds after registration are in principle unavailable; provided, however, that this shall not apply in the event of cancellation by the organizer.',
                  highlight: 'ただし ... この限りではない',
                },
              ],
              proTip:
                'In Japanese legal clauses, watch the exact pair 及び (and, connecting major groups) vs. 並びに (larger-level and), and 又は (or) vs. 若しくは (sub-level or)!',
            },
            {
              id: 'ja-c2-m5-s2',
              heading: 'Epistemic Humility (〜をもってしても) & Philosophical Balance',
              explanation:
                'Use N + をもってしても ("even with [the most advanced technology / greatest intellect]") to mark the limits of human knowledge or power — a signature structure in C2 philosophical and scientific critique.',
              formula: '[Highest capability/resource] をもってしても、[Still impossible / Difficult]',
              examples: [
                {
                  target: '最新の予測モデルをもってしても、地震の正確な発生日時を特定することはなお困難である。',
                  translation: 'Even with the latest predictive models, pinpointing the exact date and time of an earthquake remains difficult.',
                  highlight: '予測モデルをもってしても',
                },
                {
                  target: '個人の自由と公益の保護との間で、いかにして動的均衡を保つかが現代法の命題である。',
                  translation: 'How to maintain a dynamic equilibrium between individual liberty and the protection of public interest is the central proposition of modern law.',
                  highlight: '動的均衡を保つ',
                },
              ],
              proTip:
                'Pairing precise Sino-Japanese abstract nouns (妥当性, 公益, 均衡, 透明性) with concise classical connectors gives your C2 writing effortless authority.',
            },
          ],
          vocabCards: [
            {
              term: '照らす',
              pronunciation: 'てらす (terasu)',
              meaning: 'to illuminate / check against a standard (に照らして)',
              example: '過去の判例に照らして慎重に判断を下した。',
              exampleNote: 'Often shortened to に照らし in formal writing.',
            },
            {
              term: 'この限りではない',
              pronunciation: 'このかぎりではない (kono kagiri de wa nai)',
              meaning: 'this shall not apply (statutory exception clause)',
              example: '緊急時においてはこの限りではない。',
              exampleNote: 'Indispensable for reading Japanese contracts, terms, and laws.',
            },
            {
              term: '妥当性',
              pronunciation: 'だとうせい (datōsei)',
              meaning: 'validity / soundness / appropriateness',
              example: '提案された評価指標の妥当性を客観的に検証する。',
              exampleNote: 'High-precision academic/policy noun.',
            },
            {
              term: '公益',
              pronunciation: 'こうえき (kōeki)',
              meaning: 'public interest / common good',
              example: '表現の自由と公益のバランスをどう取るかが焦点だ。',
              exampleNote: 'Contrasts with 私益 (private interest).',
            },
            {
              term: '均衡',
              pronunciation: 'きんこう (kinkō)',
              meaning: 'equilibrium / balance (formal)',
              example: '経済成長と環境保全の均衡を図ることが急務である。',
              exampleNote: 'Formal C2 counterpart of バランス.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m5-q1',
              skill: 'reading',
              prompt: 'In the clause 「事前同意なく提供してはならない。ただし法令に基づく要請がある場合はこの限りではない」, when MAY data be disclosed without prior consent?',
              options: [
                'Never under any circumstances',
                'When there is a disclosure request based on laws and regulations',
                'Whenever a partner requests it for marketing',
              ],
              correctIndex: 1,
              explanation: 'ただし〜この限りではない explicitly lifts the prohibition in the stated statutory exception.',
            },
            {
              id: 'ja-c2-m5-q2',
              skill: 'writing',
              prompt: 'Fill in the blank: 「現代科学の粋___、人間の意識の全容を完全に解き明かすことはできていない。」',
              options: ['をもってしても', 'この限りではない', 'に即して'],
              correctIndex: 0,
              explanation: '"Even with the finest achievements of modern science" requires 〜をもってしても.',
            },
            {
              id: 'ja-c2-m5-q3',
              skill: 'listening',
              prompt: 'Listen to the legal scholar. What two principles must AI regulation balance?',
              audioScript: '憲法上の表現の自由という理念に照らせば、過度な事前規制は慎むべきです。しかし同時に、市民の権利や公益を守るための最低限の歯止めも欠かせず、両者の均衡をいかに設計するかが問われています。',
              options: [
                'Freedom of expression and the protection of citizens’ rights / public interest',
                'Lower electricity bills and faster internet speeds',
                'Domestic tourism and agricultural exports',
              ],
              correctIndex: 0,
              explanation: 'She frames the core legal design task as balancing 表現の自由 and 市民の権利・公益.',
            },
          ],
          checkpointSkill: 'writing',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '先端技術の社会実装をめぐっては、革新の自由と公益の保護との均衡をいかに設計するかが問われている。基本的人権の尊重という普遍的理念に照らせば、透明性と説明責任を欠いたアルゴリズム運用は決して容認されない。もっとも、いかに精緻な法制度をもってしても、技術変化の速度を完全に予測し尽くすことは困難である。原則として厳格な安全審査を義務づけつつ、ただし人命救助など緊急の公益性が認められる場面では迅速な特例運用を認める柔軟な枠組みこそ、妥当性の高い制度設計と言えるだろう。',
        },
      },
      {
        id: 'ja-c2-m6',
        weekLabel: 'Weeks 16–18 · Pinnacle Synthesis & C2 Exam',
        title: 'Pinnacle Keynote Synthesis, Impromptu Rebuttal & C2 Native Mastery Exam',
        focusSkills: ['reading', 'listening', 'writing', 'speaking'],
        summary:
          'Synthesize everything from A1 to C2: deliver nuanced keynote arguments, handle live intellectual pushback with poise (〜にせよ・〜といえども・〜を禁じ得ない), and clear the pinnacle C2 / JLPT N1+ & BJT J1+ exam.',
        objectives: [
          'Concede elite counterarguments gracefully while pivoting decisively using 〜といえども and 〜にせよ.',
          'Express refined intellectual awe or concern with 〜を禁じ得ない ("cannot suppress a sense of...").',
          'Pass the LinguaVerve Japanese C2 / JLPT N1+ & BJT J1+ 4-Skill Simulated Exam.',
        ],
        grammarCheckpoints: ['High-register concession: N + といえども ("even someone as great as...")', 'Acknowledging competing cases: 〜にせよ〜にせよ ("whether A or B")', 'Refined emotional resonance: N + を禁じ得ない ("cannot help feeling...")'],
        keyVocabulary: ['といえども', '禁じ得ない', '俯瞰', '継承', '共生'],
        drills: [
          {
            skill: 'speaking',
            title: 'C2 Executive Keynote & Rapid Pushback (3 mins)',
            instruction: 'Deliver a poised opening thesis on multicultural coexistence or AI ethics, then rebut a sharp counterargument using といえども and 俯瞰.',
            durationMins: 25,
          },
          {
            skill: 'reading',
            title: 'Multi-Perspective Symposium Synthesis',
            instruction: 'Synthesize three brief keynote stances into one cohesive 150-character overarching thesis.',
            durationMins: 20,
            samplePassage: 'いかに優れた専門知といえども、単一分野の視点だけでは複合的な現代課題を俯瞰できない。技術革新にせよ制度設計にせよ、異分野の対話を通じて人間の尊厳と技術の共生を探る姿勢こそ、今求められている。',
          },
        ],
        checkpointPrompt: 'Write or deliver a C2 keynote conclusion synthesizing cultural heritage, technological change, and human coexistence using といえども, にせよ, 俯瞰, and を禁じ得ない.',
        lesson: {
          estimatedMins: 50,
          overview:
            'Cap your A1→C2 Japanese journey with commanding rhetorical elegance: high-register concession, panoramic synthesis, and resilient spontaneous defense.',
          sections: [
            {
              id: 'ja-c2-m6-s1',
              heading: 'Elevated Concession (〜といえども) & Intellectual Resonance (〜を禁じ得ない)',
              explanation:
                'Use N + といえども ("even [an expert / a superpower / a leader]") to emphasize that no stature exempts someone from a universal truth. Use [Emotion N] + を禁じ得ない (驚き・懸念・同情を禁じ得ない) to express deeply felt yet dignified public emotion.',
              formula: 'いかに [High Status] といえども [Universal Limit]  |  [Dignified Emotion] を禁じ得ない',
              examples: [
                {
                  target: 'いかに経験豊富な専門家といえども、未知の領域では謙虚に学び続ける姿勢が欠かせない。',
                  translation: 'No matter how experienced an expert one may be, an attitude of humbly continuing to learn is indispensable in uncharted domains.',
                  highlight: '専門家といえども',
                },
                {
                  target: '極端な分断が深まる現状を目にし、将来への深い懸念を禁じ得ない。',
                  translation: 'Witnessing the deepening of extreme polarization, one cannot suppress deep concern for the future.',
                  highlight: '深い懸念を禁じ得ない',
                },
              ],
              proTip:
                'Notice the dignity of 〜を禁じ得ない: it conveys sincere emotion WITHOUT sounding melodramatic — ideal for C2 speeches, op-eds, and executive commentary.',
            },
            {
              id: 'ja-c2-m6-s2',
              heading: 'Panoramic Synthesis (俯瞰) & Live Impromptu Rebuttal (〜にせよ)',
              explanation:
                'Under live Q&A pressure, neutralize binary traps cleanly with 「AにせよBにせよ」(whether A or B), step back to a bird’s-eye view (俯瞰的に捉える), and anchor your synthesis in durable human values (継承 = stewardship/heritage, 共生 = harmonious coexistence).',
              formula: '[Option A] にせよ [Option B] にせよ → 俯瞰的に捉えると → [Synthesizing Principle]',
              examples: [
                {
                  target: '規制強化にせよ自主運用にせよ、市民の信頼を損ねては制度は機能しない。',
                  translation: 'Whether through stricter regulation or self-governance, a system cannot function if it undermines public trust.',
                  highlight: '規制強化にせよ自主運用にせよ',
                },
                {
                  target: '歴史と現在を俯瞰することで初めて、伝統の継承と革新の共生が見えてくる。',
                  translation: 'Only by taking a panoramic view of history and the present does the coexistence of heritage preservation and innovation come into focus.',
                  highlight: '俯瞰する / 継承と革新の共生',
                },
              ],
              proTip:
                'Congratulations on reaching C2/N1+! At this pinnacle, elegance lies in clarity and economy: choose ONE pinpoint idiom or classical turn per paragraph rather than overloading sentences.',
            },
          ],
          vocabCards: [
            {
              term: 'といえども',
              pronunciation: 'といえども (to iedomo)',
              meaning: 'even though / even [someone of high standing]',
              example: '一国の指導者といえども、法の支配から免れることはできない。',
              exampleNote: 'Formal literary counterpart of でも / といっても.',
            },
            {
              term: '禁じ得ない',
              pronunciation: 'きんじえない (kinjienai)',
              meaning: 'cannot suppress / cannot help feeling (を禁じ得ない)',
              example: '被災地で支え合う人々の姿に、深い敬意を禁じ得ない。',
              exampleNote: 'Pairs with 驚き・怒り・同情・懸念・敬意.',
            },
            {
              term: '俯瞰',
              pronunciation: 'ふかん (fukan)',
              meaning: 'bird’s-eye view / panoramic perspective',
              example: '個別事象に埋没せず、全体像を俯瞰する視野が求められる。',
              exampleNote: 'Verb form: 俯瞰する; Adverbial: 俯瞰的に.',
            },
            {
              term: '継承',
              pronunciation: 'けいしょう (keishō)',
              meaning: 'inheritance / handing down / stewardship of heritage',
              example: '無形文化遺産を次世代へ確実に継承していく責務がある。',
              exampleNote: 'Elevated counterpart to 受け継ぐ.',
            },
            {
              term: '共生',
              pronunciation: 'きょうせい (kyōsei)',
              meaning: 'coexistence / symbiosis',
              example: '多文化共生社会の実現には相互理解と制度的支援が不可欠だ。',
              exampleNote: 'Central keyword in contemporary Japanese policy & philosophy.',
            },
          ],
          practiceQuestions: [
            {
              id: 'ja-c2-m6-q1',
              skill: 'reading',
              prompt: 'Fill in the blank: 「どれほど高度なAI___、人間の繊細な共感や倫理的責任を完全に代替することはできない。」',
              options: ['といえども', 'を禁じ得ない', 'この限りではない'],
              correctIndex: 0,
              explanation: '"Even an AI as advanced as that..." takes high-register concessive 〜といえども.',
            },
            {
              id: 'ja-c2-m6-q2',
              skill: 'writing',
              prompt: 'Which collocation uses 〜を禁じ得ない naturally?',
              options: [
                '歴史的発見の速報に接し、驚きと感動を禁じ得ない。',
                '駅まで走って電車を禁じ得ない。',
                'コーヒーを飲んで砂糖を禁じ得ない。',
              ],
              correctIndex: 0,
              explanation: '〜を禁じ得ない exclusively follows sincere emotional nouns (驚き, 懸念, 同情, 感動).',
            },
            {
              id: 'ja-c2-m6-q3',
              skill: 'listening',
              prompt: 'Listen to the symposium closing. What does the speaker argue is needed to address complex modern challenges?',
              audioScript: 'いかに優れた専門知といえども、単一分野の視点だけでは複合的な現代課題を俯瞰できません。技術開発にせよ政策立案にせよ、異分野の対話を通じて人間の尊厳と技術の共生を模索し続けることが不可欠です。',
              options: [
                'Isolating each academic discipline completely',
                'Cross-disciplinary dialogue to pursue coexistence between technology and human dignity',
                'Halting all technological research permanently',
              ],
              correctIndex: 1,
              explanation: '「異分野の対話を通じて人間の尊厳と技術の共生を模索し続けることが不可欠」.',
            },
          ],
          checkpointSkill: 'speaking',
          checkpointMinWords: 115,
          checkpointModelAnswer:
            '急速な技術革新と価値観の多様化が進む現代を俯瞰すると、利便性の向上に目を見張る一方、人と人との結びつきが希薄化しつつある現状に一抹の懸念を禁じ得ない。いかに精緻なシステムといえども、それを運用し意味を与えるのは人間自身である。伝統の継承にせよ先端技術の導入にせよ、相反する要素を二項対立で切り捨てるのではなく、対話と想像力を通じて持続可能な共生のかたちを築いていくことこそ、私たちが次世代に果たすべき責務にほかならない。',
        },
      },
    ],
  },
];
