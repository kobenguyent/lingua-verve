import { UnitGuidedLesson } from '../../types';

export const ENGLISH_UNIT_LESSONS: Record<string, UnitGuidedLesson> = {
  'en-a1-m1': {
    estimatedMins: 25,
    overview:
      'Train your ear for English rhythm (the Schwa /ə/ sound and TH), build clean Simple Present sentences with Do/Does, and decode real airport and travel announcements.',
    sections: [
      {
        id: 'en-a1-m1-s1',
        heading: 'Simple Present, Do/Does Questions & There is/are',
        explanation:
          'Use Simple Present for routines, facts, and schedules. For he/she/it add -s ("The train leaves at 9"). Make questions and negatives with do/does + base verb — never keep the -s on the main verb after "does"!',
        formula: 'Statement: He works.  |  Question: Does he work?  |  Existential: There is (sg) / There are (pl)',
        examples: [
          {
            target: 'Does the airport bus leave from platform four?',
            translation: 'Question with 3rd-person singular: "Does" carries the -s, so "leave" stays base form.',
            highlight: 'Does ... leave',
          },
          {
            target: 'There are two available appointments tomorrow morning.',
            translation: 'Use "There are" before plural nouns ("two appointments").',
            highlight: 'There are',
          },
        ],
        proTip:
          'Avoid saying "Does he leaves?" — once "does" enters the sentence, the main verb drops its -s immediately.',
      },
      {
        id: 'en-a1-m1-s2',
        heading: 'The Schwa /ə/ Secret & TH Pronunciation',
        explanation:
          'The most common sound in English is the relaxed unstressed vowel /ə/ ("uh"), heard in the second syllable of "a-vail-a-ble" and "to-mor-row". For TH (/θ/ in "think", /ð/ in "this"), gently place the tip of your tongue between your front teeth — never substitute /s/ or /z/.',
        formula: 'Unstressed vowels relax to /ə/  |  TH = tongue tip lightly between teeth',
        examples: [
          {
            target: 'Excuse me, could you give me directions to the central station?',
            translation: 'Notice relaxed schwa in "to the" (/tə ðə/) and "directions" (/dəˈrekʃənz/).',
            highlight: 'directions',
          },
          {
            target: 'Here is your receipt; your schedule is printed on the back.',
            translation: 'Watch the silent "p" in "receipt" (/rɪˈsiːt/)!',
            highlight: 'receipt',
          },
        ],
        proTip:
          'In A1 listening tests, numbers like 14 (four-TEEN) vs 40 (FOR-ty) are distinguished by stress — listen to which syllable is louder and longer.',
      },
    ],
    vocabCards: [
      {
        term: 'schedule',
        pronunciation: '/ˈʃedjuːl/ or /ˈskedʒuːl/',
        meaning: 'timetable / planned list of times',
        example: 'Let me check the train schedule for Friday morning.',
        exampleNote: 'Common in travel & office contexts.',
      },
      {
        term: 'platform',
        pronunciation: '/ˈplætfɔːm/',
        meaning: 'raised boarding area at a train station',
        example: 'The express train to London departs from platform six.',
        exampleNote: 'Often paired with numbers and gate changes.',
      },
      {
        term: 'receipt',
        pronunciation: '/rɪˈsiːt/ (silent p)',
        meaning: 'printed proof of payment',
        example: 'Would you like a paper receipt for your coffee?',
        exampleNote: 'Never pronounce the letter "p"!',
      },
      {
        term: 'available',
        pronunciation: '/əˈveɪləbəl/',
        meaning: 'free / ready to use or book',
        example: 'Is a single room available for tonight?',
        exampleNote: 'Starts with the unstressed Schwa /ə/.',
      },
      {
        term: 'appointment',
        pronunciation: '/əˈpɔɪntmənt/',
        meaning: 'scheduled meeting (doctor, bank, office)',
        example: 'I have a dental appointment at three fifteen.',
        exampleNote: 'Use "make an appointment" (not "do").',
      },
      {
        term: 'directions',
        pronunciation: '/dəˈrekʃənz/',
        meaning: 'instructions on how to get somewhere',
        example: 'Can you give me directions to the city museum?',
        exampleNote: 'Usually plural when asking the way.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a1-m1-q1',
        skill: 'reading',
        prompt: 'Which question is grammatically correct in Simple Present?',
        options: [
          'Does the flight leaves at ten?',
          'Does the flight leave at ten?',
          'Do the flight leave at ten?',
        ],
        correctIndex: 1,
        explanation:
          'Third-person singular ("the flight") takes "Does" + base verb "leave" (no extra -s).',
      },
      {
        id: 'en-a1-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the airport announcement. Which gate should passengers go to NOW?',
        audioScript:
          'Attention passengers on flight BA four-two-zero to Edinburgh: boarding has moved from gate twelve to gate nineteen. Please proceed to gate nineteen immediately.',
        options: ['Gate 12', 'Gate 19', 'Gate 42'],
        correctIndex: 1,
        explanation:
          'Gate 12 was the old gate; boarding has moved to Gate 19.',
      },
      {
        id: 'en-a1-m1-q3',
        skill: 'reading',
        prompt: 'Choose the right phrase: "___ three coffee shops near the train station."',
        options: ['There is', 'There are', 'They is'],
        correctIndex: 1,
        explanation:
          'Use "There are" with plural nouns ("three coffee shops").',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 30,
    checkpointModelAnswer:
      'Hello! My name is Elena and I live in Madrid. I work as a graphic designer in a small studio. Every morning I check my schedule, drink coffee, and walk to work. There are many nice cafés near my office. In my free time, I love photography and learning English.',
  },

  'en-a1-m2': {
    estimatedMins: 25,
    overview:
      'Scan real-world signs and opening hours accurately, distinguish Present Continuous from Simple Present, and master IN / ON / AT for time and place.',
    sections: [
      {
        id: 'en-a1-m2-s1',
        heading: 'Present Continuous vs. Simple Present & Can Requests',
        explanation:
          'Use Present Continuous (am/is/are + verb-ing) for actions happening RIGHT NOW. Use Simple Present for habits and opening schedules. Use "Can I / Could you + base verb?" for everyday polite requests.',
        formula: 'Right now: am/is/are + -ing  |  Schedule/Habit: Simple Present  |  Polite: Can you confirm...?',
        examples: [
          {
            target: 'The museum opens at ten, and right now visitors are waiting at the entrance.',
            translation: 'Habit/schedule ("opens") vs. action in progress ("are waiting").',
            highlight: 'opens / are waiting',
          },
          {
            target: 'Can you confirm if there is a student discount today?',
            translation: 'Polite everyday request with "Can you + base verb".',
            highlight: 'Can you confirm',
          },
        ],
        proTip:
          'Public signs often omit small words ("Closed Sundays", "50% off after 4 pm"). Read EVERY exception line before answering True/False!',
      },
      {
        id: 'en-a1-m2-s2',
        heading: 'Essential Prepositions: IN · ON · AT',
        explanation:
          'Think of a pyramid from big to exact: IN for enclosed spaces, months, years (in the building, in June); ON for surfaces and days (on the table, on Sunday); AT for exact points and clock times (at the entrance, at 5:30).',
        formula: 'IN (months/cities/inside)  →  ON (days/dates/surfaces)  →  AT (clock times/exact spots)',
        examples: [
          {
            target: 'Let us meet at the main entrance on Saturday at two o’clock.',
            translation: 'Exact spot ("at the entrance"), day ("on Saturday"), exact time ("at two").',
            highlight: 'at ... on ... at',
          },
          {
            target: 'The café is next to the bookshop in the city center.',
            translation: 'Location landmark ("next to") + larger area ("in the city center").',
            highlight: 'next to ... in',
          },
        ],
        proTip:
          'Watch the classic exception: "in the morning / afternoon / evening", but "AT night"!',
      },
    ],
    vocabCards: [
      {
        term: 'open daily',
        pronunciation: '/ˈəʊpən ˈdeɪli/',
        meaning: 'open every day of the week',
        example: 'The botanical garden is open daily from nine to six.',
        exampleNote: 'Very common on signs and tourist flyers.',
      },
      {
        term: 'closed on Sundays',
        pronunciation: '/kləʊzd ɒn ˈsʌndeɪz/',
        meaning: 'not open for business on Sundays',
        example: 'Most small bakeries here are closed on Sundays.',
        exampleNote: 'Always use "on" with days of the week.',
      },
      {
        term: 'discount',
        pronunciation: '/ˈdɪskaʊnt/',
        meaning: 'reduced price / percentage off',
        example: 'Students receive a twenty percent discount with valid ID.',
        exampleNote: 'Collocation: "get/offer a discount".',
      },
      {
        term: 'entrance',
        pronunciation: '/ˈentrəns/',
        meaning: 'door or gate where you enter',
        example: 'Tickets are checked at the north entrance.',
        exampleNote: 'Opposite: "exit".',
      },
      {
        term: 'confirm',
        pronunciation: '/kənˈfɜːm/',
        meaning: 'to verify / say definitely yes',
        example: 'Please confirm your arrival time by email.',
        exampleNote: 'Great verb for short A1/A2 messages.',
      },
      {
        term: 'arrive',
        pronunciation: '/əˈraɪv/',
        meaning: 'to reach a destination',
        example: 'We will arrive at the station at half past seven.',
        exampleNote: 'Use "arrive AT" (station/hotel) or "arrive IN" (city/country) — never "arrive to".',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a1-m2-q1',
        skill: 'reading',
        passage:
          'City History Museum: Open Tuesday to Sunday 10:00–17:00. Closed Mondays. Standard ticket £12. Half-price discount for students with valid ID.',
        prompt: 'How much does a university student with ID pay on Wednesday?',
        options: ['£12', '£6', 'It is closed on Wednesdays.'],
        correctIndex: 1,
        explanation:
          'Wednesday is within Tuesday–Sunday, and half of £12 is £6.',
      },
      {
        id: 'en-a1-m2-q2',
        skill: 'writing',
        prompt: 'Choose the sentence with ALL prepositions accurate:',
        options: [
          'Please arrive to the entrance in Sunday on 3 pm.',
          'Please arrive at the entrance on Sunday at 3 pm.',
          'Please arrive on the entrance at Sunday in 3 pm.',
        ],
        correctIndex: 1,
        explanation:
          'arrive AT a place, ON a day (Sunday), AT an exact time (3 pm).',
      },
      {
        id: 'en-a1-m2-q3',
        skill: 'reading',
        prompt: 'Which sentence describes an action happening RIGHT NOW?',
        options: [
          'I wait at the bus stop every day.',
          'I am waiting at the bus stop right now.',
          'I waiting at the bus stop now.',
        ],
        correctIndex: 1,
        explanation:
          'Present Continuous requires am/is/are + verb-ing: "I am waiting".',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 32,
    checkpointModelAnswer:
      'Hi Maya, I am visiting the new City Museum on Saturday at 2 pm! Would you like to come with me? There is a student discount, so tickets are cheap. Let us meet at the main entrance next to the café. Please confirm by Friday! Best, Sam',
  },

  'en-a1-m3': {
    estimatedMins: 25,
    overview:
      'Talk about yesterday (was/were), plan tomorrow (going to), and manage hotel check-ins and countable/uncountable basics with confidence.',
    sections: [
      {
        id: 'en-a1-m3-s1',
        heading: 'Past of "Be" (was/were) & Future Plans (going to)',
        explanation:
          'Use was (I/he/she/it) and were (you/we/they) to describe past states. Use am/is/are + going to + base verb to express plans and intentions you already decided.',
        formula: 'Past: I/he/she/it was | you/we/they were   |   Plan: am/is/are + going to + [Verb]',
        examples: [
          {
            target: 'Yesterday the weather was rainy, so we were inside all afternoon.',
            translation: 'Singular "weather" takes "was"; plural "we" takes "were".',
            highlight: 'was / were',
          },
          {
            target: 'Tomorrow we are going to take a boat tour across the harbor.',
            translation: 'Clear future plan using "are going to + take".',
            highlight: 'are going to take',
          },
        ],
        proTip:
          'In natural spoken English, "going to" blends smoothly while writing keeps full "going to".',
      },
      {
        id: 'en-a1-m3-s2',
        heading: 'Countable vs. Uncountable Nouns (some / any)',
        explanation:
          'Some everyday travel words are UNCOUNTABLE in English (no plural -s, never "a"): luggage, information, weather, advice. Use "some" in positive statements and polite offers/requests, and "any" in negatives and general questions.',
        formula: 'Uncountable: some luggage / nice weather (NO "a", NO "-s")  |  Positive: some  |  Neg/Q: any',
        examples: [
          {
            target: 'Could you help me with some luggage? My room is on the third floor.',
            translation: '"luggage" is uncountable (never "luggages" or "a luggage").',
            highlight: 'some luggage',
          },
          {
            target: 'Do you have any comfortable rooms available for tomorrow night?',
            translation: 'General question using "any" with plural countable "rooms".',
            highlight: 'any comfortable rooms',
          },
        ],
        proTip:
          'Watch out: "information" and "luggage" are uncountable! Say "a piece of luggage" or "some information".',
      },
    ],
    vocabCards: [
      {
        term: 'reservation',
        pronunciation: '/ˌrezəˈveɪʃən/',
        meaning: 'advance booking (hotel, restaurant, flight)',
        example: 'Hello, I have a reservation under the name Patel.',
        exampleNote: 'Essential phrase for hotel check-in.',
      },
      {
        term: 'luggage',
        pronunciation: '/ˈlʌɡɪdʒ/',
        meaning: 'suitcases and bags (uncountable)',
        example: 'Can I leave my luggage at reception before check-in?',
        exampleNote: 'Never add -s ("my luggage is", not "are").',
      },
      {
        term: 'weather',
        pronunciation: '/ˈweðə/',
        meaning: 'rain, sun, wind, temperature (uncountable)',
        example: 'The weather was sunny and warm yesterday.',
        exampleNote: 'Never say "a good weather" — just "good weather".',
      },
      {
        term: 'comfortable',
        pronunciation: '/ˈkʌmftəbəl/ (3 syllables!)',
        meaning: 'pleasant and relaxing to sit/stay in',
        example: 'Our hotel room is quiet and very comfortable.',
        exampleNote: 'Pronounced "CUMF-tuh-bul", not 4 syllables.',
      },
      {
        term: 'tomorrow',
        pronunciation: '/təˈmɒrəʊ/',
        meaning: 'the day after today',
        example: 'We are going to check out early tomorrow morning.',
        exampleNote: 'No preposition before tomorrow (not "on tomorrow").',
      },
      {
        term: 'yesterday',
        pronunciation: '/ˈjestədeɪ/',
        meaning: 'the day before today',
        example: 'Our flight arrived late yesterday evening.',
        exampleNote: 'Triggers Past Simple (was/were/arrived).',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a1-m3-q1',
        skill: 'reading',
        prompt: 'Which sentence uses uncountable travel nouns accurately?',
        options: [
          'My luggages are heavy and we had a nice weather.',
          'My luggage is heavy, and we had nice weather yesterday.',
          'I have two luggages for tomorrow.',
        ],
        correctIndex: 1,
        explanation:
          'Both "luggage" and "weather" are uncountable: singular verb ("is"), no plural "-s", and no article "a".',
      },
      {
        id: 'en-a1-m3-q2',
        skill: 'speaking',
        prompt: 'What is the cleanest way to state your plan for tomorrow?',
        options: [
          'Tomorrow I going visit the castle.',
          'Tomorrow I am going to visit the castle.',
          'Tomorrow I am go to visit the castle.',
        ],
        correctIndex: 1,
        explanation:
          'Future plans require "am/is/are + going to + base verb".',
      },
      {
        id: 'en-a1-m3-q3',
        skill: 'reading',
        prompt: 'Fill the blank: "___ you tired after your flight yesterday?"',
        options: ['Was', 'Were', 'Are'],
        correctIndex: 1,
        explanation:
          '"You" always pairs with "were" in the past tense ("Were you tired?").',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 35,
    checkpointModelAnswer:
      'Good afternoon! I have a reservation for two nights under the name Alex Rivera. Yesterday my flight was delayed, so I am happy to be here. Can I leave my luggage here for a moment? Also, what time is breakfast tomorrow? Tomorrow morning I am going to visit the old town. Thank you!',
  },

  'en-a2-m1': {
    estimatedMins: 30,
    overview:
      'Weave engaging past stories by pairing Past Continuous (background scene) with Past Simple (sudden interruption), and catch self-correction traps in Cambridge A2 Listening.',
    sections: [
      {
        id: 'en-a2-m1-s1',
        heading: 'Past Simple vs. Past Continuous (Scene + Interruption)',
        explanation:
          'Set the background scene with Past Continuous (was/were + -ing), then drop the sudden event in Past Simple! Link them naturally with "while" (+ continuous) and "when" (+ simple).',
        formula: 'Background: While we were waiting...  +  Event: ...the train suddenly arrived!',
        examples: [
          {
            target: 'While I was buying a coffee, I nearly missed my train to York.',
            translation: 'Ongoing background action ("was buying") interrupted by "missed".',
            highlight: 'was buying ... missed',
          },
          {
            target: 'We were walking through the crowd when it suddenly started to rain.',
            translation: 'Scene ("were walking") + sudden interruption ("started").',
            highlight: 'were walking ... started',
          },
        ],
        proTip:
          'Master top irregular past verbs in families: buy→bought, catch→caught, bring→brought; speak→spoke, break→broke, choose→chose!',
      },
      {
        id: 'en-a2-m1-s2',
        heading: 'Present Perfect Intro (Life Experience: ever/never/already/yet)',
        explanation:
          'Use Present Perfect (have/has + Past Participle) for life experiences without a specific past timestamp. The moment you mention WHEN ("yesterday", "last summer", "in 2022"), switch back to Past Simple!',
        formula: 'No specific time: Have you ever visited...?  |  Specific past time: I visited it last July.',
        examples: [
          {
            target: 'Have you ever taken a night train across Scotland?',
            translation: 'Open life experience (no exact date) → Present Perfect.',
            highlight: 'Have you ever taken',
          },
          {
            target: 'I have already booked our tickets, so we do not need to queue.',
            translation: '"already" signals a completed action relevant right now.',
            highlight: 'have already booked',
          },
        ],
        proTip:
          'In Cambridge A2 Listening, speakers frequently say one time/price first and then correct themselves ("Oh wait, no, that was Tuesday!"). Never lock in the first number you hear!',
      },
    ],
    vocabCards: [
      {
        term: 'journey',
        pronunciation: '/ˈdʒɜːni/',
        meaning: 'act of traveling from one place to another',
        example: 'The train journey along the coast took three hours.',
        exampleNote: 'Countable: "a long journey" (unlike uncountable "travel").',
      },
      {
        term: 'miss a train',
        pronunciation: '/mɪs ə treɪn/',
        meaning: 'arrive too late to board a train',
        example: 'We ran to platform two, but we still missed our train.',
        exampleNote: 'Opposite: "catch a train".',
      },
      {
        term: 'recommend',
        pronunciation: '/ˌrekəˈmend/',
        meaning: 'to suggest something good',
        example: 'I strongly recommend visiting the harbor at sunset.',
        exampleNote: 'Followed by verb-ing ("recommend visiting") or a noun.',
      },
      {
        term: 'crowd',
        pronunciation: '/kraʊd/',
        meaning: 'large group of people gathered together',
        example: 'A huge crowd was waiting outside the concert hall.',
        exampleNote: 'Adjective form: "crowded".',
      },
      {
        term: 'excited',
        pronunciation: '/ɪkˈsaɪtɪd/',
        meaning: 'feeling enthusiastic and happy about something',
        example: 'We were really excited about our first trip abroad.',
        exampleNote: '-ed = your feeling ("I am excited"); -ing = the thing ("an exciting trip").',
      },
      {
        term: 'suddenly',
        pronunciation: '/ˈsʌdənli/',
        meaning: 'quickly and unexpectedly',
        example: 'Suddenly, the sky turned dark and wind blew across the square.',
        exampleNote: 'Great connector for Past Simple interruptions.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a2-m1-q1',
        skill: 'reading',
        prompt: 'Choose the sentence that pairs Past Continuous and Past Simple cleanly:',
        options: [
          'While we walked through the park, it was starting to snow.',
          'While we were walking through the park, it suddenly started to snow.',
          'While we were walking through the park, it suddenly start to snow.',
        ],
        correctIndex: 1,
        explanation:
          'Long background action ("were walking") + sudden interrupting event in Past Simple ("started").',
      },
      {
        id: 'en-a2-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the message. What time does the coach ACTUALLY leave?',
        audioScript:
          'Hi Sam, about Saturday’s trip to Oxford: I thought the coach left at eight thirty, sorry, I just checked the email and it actually leaves at quarter past nine from the library car park.',
        options: ['8:30', '9:15', '9:45'],
        correctIndex: 1,
        explanation:
          'Self-correction trap: 8:30 was the speaker’s wrong guess; the real departure is "quarter past nine" (9:15).',
      },
      {
        id: 'en-a2-m1-q3',
        skill: 'writing',
        prompt: 'Which sentence correctly chooses between Past Simple and Present Perfect?',
        options: [
          'I have visited Lisbon last summer.',
          'I visited Lisbon last summer, and I really recommend it.',
          'I did ever visit Lisbon.',
        ],
        correctIndex: 1,
        explanation:
          'Because "last summer" specifies a finished past time, Past Simple ("visited") is required.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 50,
    checkpointModelAnswer:
      'Last weekend I took a train journey to Brighton with two friends. We were really excited because the morning started sunny. While we were walking toward the pier through a big crowd, it suddenly began to pour with rain! We ran into a cozy bakery and drank hot chocolate. On the way home we almost missed our train, but we caught it just in time. I still strongly recommend Brighton for a day trip.',
  },

  'en-a2-m2': {
    estimatedMins: 30,
    overview:
      'Master future forms (will vs. going to vs. Present Continuous), First Conditionals, and fast scanning for Cambridge A2 Key Reading & Writing.',
    sections: [
      {
        id: 'en-a2-m2-s1',
        heading: 'Three Future Forms: Will · Going to · Present Continuous',
        explanation:
          'Use Present Continuous for fixed diary arrangements ("We are meeting at 6"). Use "going to" for personal intentions ("I am going to borrow a tent"). Use "will" for instant decisions, promises, and offers ("I will bring extra snacks!").',
        formula: 'Arranged plan: am/is/are -ing  |  Intention: going to  |  Instant offer/promise: will + base',
        examples: [
          {
            target: 'We are meeting at the sports center on Friday at five.',
            translation: 'Fixed arrangement with a set time and place.',
            highlight: 'are meeting',
          },
          {
            target: 'If you forget your racket, I will lend you my spare equipment.',
            translation: 'First Conditional + spontaneous offer ("will lend").',
            highlight: 'If you forget ..., I will lend',
          },
        ],
        proTip:
          'In First Conditional, NEVER put "will" inside the "if"-clause: say "If it rains, we will cancel" (not "If it will rain").',
      },
      {
        id: 'en-a2-m2-s2',
        heading: 'Comparatives, Superlatives & A2 Email Discipline',
        explanation:
          'Short adjectives add -er / the -est (cheaper, the fastest); longer adjectives (2+ syllables) use more / the most (more available, the most exciting). In A2 Key Writing Part 6, hit all 3 prompt bullets clearly in 35–50 words.',
        formula: 'Short: taller than / the tallest  |  Long: more comfortable than / the most comfortable',
        examples: [
          {
            target: 'Borrowing camping equipment is much cheaper than buying everything new.',
            translation: 'Clear comparative ("much cheaper than").',
            highlight: 'much cheaper than',
          },
          {
            target: 'That kayak lesson was the most enjoyable experience of my summer.',
            translation: 'Superlative with "the most + long adjective".',
            highlight: 'the most enjoyable',
          },
        ],
        proTip:
          'Don’t mix up "borrow" (take temporarily from someone) and "lend" (give temporarily to someone): "Can I borrow your helmet?" vs. "Can you lend me your helmet?"',
      },
    ],
    vocabCards: [
      {
        term: 'offer',
        pronunciation: '/ˈɒfə/',
        meaning: 'to present/give willingly, or a special deal',
        example: 'The club offers free beginner classes on Tuesday evenings.',
        exampleNote: 'Works as both verb and noun.',
      },
      {
        term: 'experience',
        pronunciation: '/ɪkˈspɪəriəns/',
        meaning: 'something you live through, or practical skill',
        example: 'You do not need any previous experience to join the hike.',
        exampleNote: 'Uncountable for skill; countable for a single event ("a great experience").',
      },
      {
        term: 'available',
        pronunciation: '/əˈveɪləbəl/',
        meaning: 'ready to book, buy, or use',
        example: 'Are bikes still available to rent after four o’clock?',
        exampleNote: 'Key scanning word in A2 Key ads.',
      },
      {
        term: 'equipment',
        pronunciation: '/ɪˈkwɪpmənt/',
        meaning: 'tools or gear needed for an activity (uncountable)',
        example: 'All climbing equipment is included in the ticket price.',
        exampleNote: 'Uncountable — never "equipments"!',
      },
      {
        term: 'borrow',
        pronunciation: '/ˈbɒrəʊ/',
        meaning: 'take something temporarily and return it',
        example: 'Could I borrow your hiking boots for the weekend?',
        exampleNote: 'Borrow FROM someone; lend TO someone.',
      },
      {
        term: 'cancel',
        pronunciation: '/ˈkænsəl/',
        meaning: 'decide that a planned event will not happen',
        example: 'If the storm gets worse, they will cancel the outdoor match.',
        exampleNote: 'Past tense: cancelled (UK) / canceled (US).',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a2-m2-q1',
        skill: 'reading',
        prompt: 'Which First Conditional sentence is grammatically accurate?',
        options: [
          'If it will rain tomorrow, we cancel the picnic.',
          'If it rains tomorrow, we will cancel the picnic.',
          'If it rained tomorrow, we will cancel the picnic.',
        ],
        correctIndex: 1,
        explanation:
          'First Conditional structure = If + Present Simple ("rains"), will + base verb ("will cancel").',
      },
      {
        id: 'en-a2-m2-q2',
        skill: 'writing',
        prompt: 'Pick the sentence that uses "borrow" and "equipment" correctly:',
        options: [
          'Can I borrow some camping equipment from you?',
          'Can you borrow me your camping equipments?',
          'Can I lend your camping equipment from you?',
        ],
        correctIndex: 0,
        explanation:
          'You "borrow [uncountable equipment] FROM someone"; they "lend it TO you".',
      },
      {
        id: 'en-a2-m2-q3',
        skill: 'reading',
        passage:
          'Lakeside Rowing Club: Open to ages 14+. No experience required — we provide all boats and life jackets. Beginner session Saturdays 10:00–12:00 (£8, free if you bring a friend).',
        prompt: 'What do beginners need to bring to Lakeside Rowing Club?',
        options: [
          'Their own life jacket',
          'Nothing specialized — boats and life jackets are provided',
          'At least one year of rowing experience',
        ],
        correctIndex: 1,
        explanation:
          'The flyer explicitly states: "No experience required — we provide all boats and life jackets."',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 45,
    checkpointModelAnswer:
      'Hi Liam, I am going to join the Saturday rowing class at Lakeside Club — would you like to come too? They offer free entry if you bring a friend, and all equipment is available there, so we do not need to borrow anything. We are meeting at the lake at 9:45. If the weather is bad, they will cancel it and refund us. Let me know soon! Best, Jordan',
  },

  'en-a2-m3': {
    estimatedMins: 25,
    overview:
      'Give natural advice (should/have to/mustn’t), express balanced preferences with linking words (because, so, although), and interact fluidly in Cambridge A2 Speaking Part 2.',
    sections: [
      {
        id: 'en-a2-m3-s1',
        heading: 'Modals of Advice & Rules: Should · Have to · Mustn’t',
        explanation:
          'Use "should" for friendly advice, "have to" for external rules/necessity, "don’t have to" for NO obligation (it’s optional!), and "mustn’t" for strict prohibition (not allowed!).',
        formula: 'don’t have to = optional (choice)   VS.   mustn’t = forbidden (do NOT do it)',
        examples: [
          {
            target: 'You don’t have to buy expensive gear, although you should bring sturdy shoes.',
            translation: 'Gear is optional ("don’t have to"); sturdy shoes are advised ("should").',
            highlight: 'don’t have to / should',
          },
          {
            target: 'Visitors mustn’t light campfires in the forest because it is very dry.',
            translation: 'Strict safety prohibition ("mustn’t") + reason ("because").',
            highlight: 'mustn’t ... because',
          },
        ],
        proTip:
          'Never confuse "don’t have to" with "mustn’t" — that distinction is tested constantly from A2 all the way to B2!',
      },
      {
        id: 'en-a2-m3-s2',
        heading: 'Interactive Preferences & Extending Answers (because / so / although)',
        explanation:
          'In A2 Speaking Part 2, avoid one-word answers ("Yes, I like camping"). Always use the 2-beat formula: Preference + Reason + Invite your partner ("What do you think?").',
        formula: 'I prefer [X] to [Y] because ...  |  Although [X] is expensive, it is relaxing.  |  Do you agree?',
        examples: [
          {
            target: 'I prefer outdoor hiking to indoor gyms because fresh air feels more relaxing.',
            translation: 'Notice the fixed preposition: "prefer X TO Y" (not "than").',
            highlight: 'prefer ... to',
          },
          {
            target: 'Although skiing is quite expensive, I agree it is an amazing winter sport.',
            translation: 'Concession ("although") lifts A2 speaking straight toward B1 range.',
            highlight: 'Although ... I agree',
          },
        ],
        proTip:
          'Use question tags to invite your speaking partner naturally: "Cycling is healthier, isn’t it?" / "You like outdoor sports, don’t you?"',
      },
    ],
    vocabCards: [
      {
        term: 'prefer',
        pronunciation: '/prɪˈfɜː/',
        meaning: 'like one thing better than another',
        example: 'I prefer relaxing by the sea to shopping in busy malls.',
        exampleNote: 'Always "prefer A to B" or "prefer to do A".',
      },
      {
        term: 'agree',
        pronunciation: '/əˈɡriː/',
        meaning: 'share the same opinion',
        example: 'I completely agree with your opinion about outdoor cafes.',
        exampleNote: 'Say "I agree" (never "I am agree"!).',
      },
      {
        term: 'expensive',
        pronunciation: '/ɪkˈspensɪv/',
        meaning: 'costing a lot of money',
        example: 'Staying in the city center is convenient, although it is expensive.',
        exampleNote: 'Comparative: "more expensive" (never "expensiver").',
      },
      {
        term: 'relaxing',
        pronunciation: '/rɪˈlæksɪŋ/',
        meaning: 'helping you feel calm and rested',
        example: 'Reading in the park is the most relaxing way to spend Sunday.',
        exampleNote: 'Activity = relaxing (-ing); person = relaxed (-ed).',
      },
      {
        term: 'outdoor',
        pronunciation: '/ˈaʊtdɔː/',
        meaning: 'happening outside in the open air (before noun)',
        example: 'We love outdoor activities like cycling and kayaking.',
        exampleNote: '"outdoor" before noun; "outdoors" after verb ("eat outdoors").',
      },
      {
        term: 'opinion',
        pronunciation: '/əˈpɪnjən/',
        meaning: 'personal belief or view',
        example: 'In my opinion, taking the train is more comfortable than driving.',
        exampleNote: 'Always "IN my opinion" (not "on/for my opinion").',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-a2-m3-q1',
        skill: 'reading',
        prompt: 'What does "You don’t have to wear a tie at the dinner" mean?',
        options: [
          'Wearing a tie is forbidden.',
          'Wearing a tie is optional — you can choose.',
          'You must wear a tie.',
        ],
        correctIndex: 1,
        explanation:
          '"don’t have to" expresses lack of necessity (optional), whereas "mustn’t" expresses prohibition.',
      },
      {
        id: 'en-a2-m3-q2',
        skill: 'speaking',
        prompt: 'Pick the grammatically accurate way to agree and state a preference:',
        options: [
          'I am agree! I prefer swimming than running.',
          'I agree! I prefer swimming to running because it is more relaxing.',
          'I agreeing! I prefer swim to run.',
        ],
        correctIndex: 1,
        explanation:
          '"agree" is a verb (not an adjective, so never "am agree"), and "prefer" pairs with "to".',
      },
      {
        id: 'en-a2-m3-q3',
        skill: 'reading',
        prompt: 'Choose the right question tag: "Camping is cheaper than staying in a hotel, ___?"',
        options: ['is it', 'isn’t it', 'doesn’t it'],
        correctIndex: 1,
        explanation:
          'Positive statement with "is" takes a negative tag with "isn’t": "isn’t it?"',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 45,
    checkpointModelAnswer:
      'In my opinion, outdoor holidays are much more relaxing than city breaks. I prefer camping by a lake to staying in big hotels because it is quieter and less expensive. Although you have to pack more carefully, you don’t have to follow a strict schedule. I agree that museums are interesting too, so maybe a mix of nature and culture is best. What do you think — do you prefer beach holidays or mountain trips?',
  },

  'en-b1-m1': {
    estimatedMins: 35,
    overview:
      'Decode high-frequency phrasal verbs by their particle logic, sharpen Second Conditional & Reported Speech, and follow connected spoken English at natural speed.',
    sections: [
      {
        id: 'en-b1-m1-s1',
        heading: 'Phrasal Verb Particle Logic & Connected Speech',
        explanation:
          'Particles aren’t random: OUT often signals solving/finishing (figure out, run out of), OFF signals delaying/separating (put off), DOWN signals reducing/refusing (turn down). In connected speech, consonants link straight into following vowels ("figure_it_out" sounds like "fi-gyuh-ri-tout").',
        formula: 'Verb + Particle: figure out (solve) | put off (delay) | turn down (refuse) | run out of (exhaust)',
        examples: [
          {
            target: 'We had to put off the launch until we figured out why the battery ran out of power.',
            translation: 'Three natural phrasal verbs in one realistic B1 sentence!',
            highlight: 'put off / figured out / ran out of',
          },
          {
            target: 'She turned down the job offer even though she got along well with the team.',
            translation: 'Notice separable "turn down" + inseparable 3-word "get along with".',
            highlight: 'turned down / got along with',
          },
        ],
        proTip:
          'When using a pronoun with a separable phrasal verb, put the pronoun IN THE MIDDLE: "turn it down", "put it off" (never "turn down it").',
      },
      {
        id: 'en-b1-m1-s2',
        heading: 'Second Conditional (Hypothetical) & Reported Speech',
        explanation:
          'Use Second Conditional (If + Past Simple, would/could + base verb) for unreal or imaginary situations right now. In Reported Speech after "said/told me", tense normally shifts one step back ("am" → "was", "will" → "would").',
        formula: 'Second Cond: If I had more time, I would...  |  Reported: She told me (that) she would come.',
        examples: [
          {
            target: 'If I lived closer to the coast, I would go surfing before work.',
            translation: 'Imaginary present situation → Past Simple ("lived") + "would go".',
            highlight: 'If I lived ..., I would go',
          },
          {
            target: 'He said that he was looking forward to working with us next month.',
            translation: 'Present Continuous ("am looking forward") backshifts to "was looking forward".',
            highlight: 'said that he was looking forward',
          },
        ],
        proTip:
          'In Cambridge B1 PET Speaking Part 2 (photo description), speculate smoothly using "might be", "looks as if", and "If I were them, I would..."!',
      },
    ],
    vocabCards: [
      {
        term: 'figure out',
        pronunciation: '/ˈfɪɡə aʊt/',
        meaning: 'to solve or understand after thinking',
        example: 'It took me ten minutes to figure out the ticket machine.',
        exampleNote: 'Separable: "figure it out".',
      },
      {
        term: 'turn down',
        pronunciation: '/tɜːn daʊn/',
        meaning: 'to refuse/reject an offer (or lower volume)',
        example: 'He turned down the invitation because he had an exam.',
        exampleNote: 'Separable: "turn it down".',
      },
      {
        term: 'put off',
        pronunciation: '/pʊt ɒf/',
        meaning: 'to postpone / delay until later',
        example: 'Don’t put off revising until the night before the test.',
        exampleNote: 'Followed by verb-ing ("put off revising").',
      },
      {
        term: 'get along with',
        pronunciation: '/ɡet əˈlɒŋ wɪð/',
        meaning: 'to have a friendly relationship with',
        example: 'Fortunately, I get along really well with my flatmates.',
        exampleNote: 'Inseparable 3-word phrasal verb (UK also: "get on with").',
      },
      {
        term: 'run out of',
        pronunciation: '/rʌn aʊt əv/',
        meaning: 'to have none left / exhaust supply',
        example: 'We ran out of time before finishing the last question.',
        exampleNote: 'Inseparable: "run out of time/money/patience".',
      },
      {
        term: 'look forward to',
        pronunciation: '/lʊk ˈfɔːwəd tuː/',
        meaning: 'to feel excited about a future event',
        example: 'I really look forward to hearing from you soon.',
        exampleNote: 'CRITICAL: "to" is a preposition here, so follow with verb-ING ("hearing")!',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b1-m1-q1',
        skill: 'writing',
        prompt: 'Choose the grammatically accurate sentence with "look forward to":',
        options: [
          'I look forward to meet you next week.',
          'I look forward to meeting you next week.',
          'I looking forward meeting you next week.',
        ],
        correctIndex: 1,
        explanation:
          'Because "to" in "look forward to" is a preposition, any verb after it MUST be in -ing form ("meeting").',
      },
      {
        id: 'en-b1-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the interview clip. Why did Maya reject the relocation offer?',
        audioScript:
          'Interviewer: So why did you turn down the transfer to London? Maya: Honestly, I got along great with the manager, and I didn’t want to put off the decision, but if I moved right now, I’d have to leave my sister’s startup before we figure out our funding.',
        options: [
          'She did not get along with the manager.',
          'She wants to stay and help solve funding for her sister’s startup.',
          'The company cancelled the position.',
        ],
        correctIndex: 1,
        explanation:
          'She got along well with the manager, but chose to stay until they "figure out our funding".',
      },
      {
        id: 'en-b1-m1-q3',
        skill: 'reading',
        prompt: 'Which pronoun placement is correct for the separable phrasal verb "put off"?',
        options: [
          'We shouldn’t put off it any longer.',
          'We shouldn’t put it off any longer.',
          'We shouldn’t it put off any longer.',
        ],
        correctIndex: 1,
        explanation:
          'Object pronouns ("it", "them") MUST go between the verb and particle: "put it off".',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 60,
    checkpointModelAnswer:
      'In this photograph, two friends look like they are trying to figure out a trail map in the mountains. They seem to get along really well, and it looks as if they are planning where to camp before they run out of daylight. If I were in their position, I would check the weather forecast carefully and wouldn’t put off setting up the tent. Personally, I always look forward to hiking trips like this!',
  },

  'en-b1-m2': {
    estimatedMins: 35,
    overview:
      'Master Passive voice, defining relative clauses, "used to" vs. "be used to", and contrasting linkers (whereas/despite) for crisp 100-word B1 articles.',
    sections: [
      {
        id: 'en-b1-m2-s1',
        heading: 'Contrasting Linkers (whereas vs. despite) & Relative Clauses',
        explanation:
          'Contrast two clauses with "whereas" (full clause: subject + verb). Contrast with a noun or -ing phrase using "despite" (NEVER "despite of"!). Connect details cleanly with who (people), which/that (things), where (places), and whose (possession).',
        formula: 'despite + Noun/-ing (NO "of"!)   |   whereas + Subject + Verb   |   the city where we stayed',
        examples: [
          {
            target: 'Despite being slightly noisy, the hostel was affordable and super convenient.',
            translation: '"despite" + -ing phrase (clean contrast without "of").',
            highlight: 'Despite being',
          },
          {
            target: 'Trains are relaxing and scenic, whereas budget flights can feel stressful.',
            translation: '"whereas" balances two contrasting full clauses.',
            highlight: 'whereas',
          },
        ],
        proTip:
          'In Cambridge B1 Gapped-Text Reading, match pronoun references ("this drawback", "such places", "they") directly back to the preceding sentence!',
      },
      {
        id: 'en-b1-m2-s2',
        heading: 'Passive Voice & "Used to" vs. "Be Used to"',
        explanation:
          'Form Passive with be (in the needed tense) + Past Participle ("The castle was built in 1640"). Don’t confuse past habit "used to + base verb" (I used to live there) with familiarity "be used to + noun/-ing" (I am used to commuting early).',
        formula: 'Past habit: used to + [Verb]   VS.   Accustomed to: am/is/are used to + [Verb-ing / Noun]',
        examples: [
          {
            target: 'This historic market is visited by thousands of locals every weekend.',
            translation: 'Present Passive focusing on the market rather than the visitors.',
            highlight: 'is visited',
          },
          {
            target: 'I used to hate waking up early, but now I am used to catching the seven o’clock train.',
            translation: 'Past habit ("used to hate") vs. present comfort ("am used to catching").',
            highlight: 'used to hate / am used to catching',
          },
        ],
        proTip:
          'For B1 Preliminary 100-word articles, open with a catchy question to hook the reader, give 2 concrete examples, and finish with a punchy takeaway.',
      },
    ],
    vocabCards: [
      {
        term: 'whereas',
        pronunciation: '/weərˈæz/',
        meaning: 'in contrast with the fact that',
        example: 'E-books are light to carry, whereas paper books feel nicer to hold.',
        exampleNote: 'Great connector for balanced comparisons.',
      },
      {
        term: 'despite',
        pronunciation: '/dɪˈspaɪt/',
        meaning: 'without being prevented by (= in spite of)',
        example: 'Despite the rainy forecast, the street festival was packed.',
        exampleNote: 'Never add "of" after despite!',
      },
      {
        term: 'convenient',
        pronunciation: '/kənˈviːniənt/',
        meaning: 'easy, practical, and time-saving',
        example: 'Living near the metro line is extremely convenient.',
        exampleNote: 'Noun: convenience; opposite: inconvenient.',
      },
      {
        term: 'drawback',
        pronunciation: '/ˈdrɔːbæk/',
        meaning: 'disadvantage / downside',
        example: 'The only drawback of remote work is missing casual office chats.',
        exampleNote: 'High-scoring synonym for "disadvantage".',
      },
      {
        term: 'affordable',
        pronunciation: '/əˈfɔːdəbəl/',
        meaning: 'reasonably priced / within budget',
        example: 'The town needs more affordable housing for young families.',
        exampleNote: 'Cleaner than saying "not too expensive".',
      },
      {
        term: 'memorable',
        pronunciation: '/ˈmemərəbəl/',
        meaning: 'worth remembering / unforgettable',
        example: 'Watching the sunrise from the ferry was truly memorable.',
        exampleNote: 'Ideal adjective for B1/B2 articles and reviews.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b1-m2-q1',
        skill: 'writing',
        prompt: 'Which sentence uses "despite" accurately?',
        options: [
          'Despite of the high price, we enjoyed the show.',
          'Despite the high price, we enjoyed the show.',
          'Despite it was expensive, we enjoyed the show.',
        ],
        correctIndex: 1,
        explanation:
          '"despite" is followed directly by a noun phrase or -ing form, with NO "of" and NO finite clause unless you write "despite the fact that".',
      },
      {
        id: 'en-b1-m2-q2',
        skill: 'reading',
        prompt: 'Choose the sentence that correctly expresses being accustomed to city traffic:',
        options: [
          'I am used to drive in heavy traffic.',
          'I am used to driving in heavy traffic.',
          'I used to driving in heavy traffic.',
        ],
        correctIndex: 1,
        explanation:
          '"be used to" (= be accustomed to) takes a noun or -ing verb: "am used to driving".',
      },
      {
        id: 'en-b1-m2-q3',
        skill: 'reading',
        passage:
          'City bikes are affordable and convenient for short hops, whereas electric scooters have a notable drawback: their batteries often die uphill. However, both systems are maintained daily by local technicians.',
        prompt: 'According to the passage, what is a disadvantage of electric scooters?',
        options: [
          'They are never maintained.',
          'Their batteries frequently run out going uphill.',
          'They are slower than walking.',
        ],
        correctIndex: 1,
        explanation:
          '"drawback" signals disadvantage, explicitly explained after the colon.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 85,
    checkpointModelAnswer:
      'Have you ever thought about swapping your car for a bicycle? I used to drive everywhere, whereas today I cycle to work every morning. At first I wasn’t used to riding in chilly weather, yet now I love it! Cycling is affordable and surprisingly convenient because you avoid traffic jams. Despite one obvious drawback — arriving damp on rainy days — the energy boost makes every ride memorable. More bike lanes are being built across the city, so there has never been a better time to try.',
  },

  'en-b1-m3': {
    estimatedMins: 30,
    overview:
      'Deduce logically with modals (must/might/can’t be), avoid gerund-vs-infinitive meaning traps, and negotiate collaborative decisions smoothly in B1 Speaking Part 3.',
    sections: [
      {
        id: 'en-b1-m3-s1',
        heading: 'Modals of Deduction & Gerund vs. Infinitive Meaning Shifts',
        explanation:
          'Express certainty in the present: "must be" (99% sure yes), "might/could be" (possible), "can’t be" (99% sure NO — never "mustn’t be" for deduction!). Watch verbs whose meaning flips between -ing and to-infinitive: "stop smoking" (quit) vs. "stop to smoke" (pause in order to); "remember locking" (past memory) vs. "remember to lock" (task to do).',
        formula: 'Deduction: must be / might be / can’t be   |   stop + -ing (quit) VS stop + to (pause for)',
        examples: [
          {
            target: 'That can’t be the right budget — it is far too low to be realistic.',
            translation: 'Logical impossibility uses "can’t be" (never "mustn’t be").',
            highlight: 'can’t be',
          },
          {
            target: 'We stopped to consider a compromise before deciding on the final venue.',
            translation: '"stop to consider" = paused our discussion in order to think about it.',
            highlight: 'stopped to consider',
          },
        ],
        proTip:
          'Learn the top B1 gerund-only verbs: consider, enjoy, avoid, suggest, mind, recommend (+ -ing) vs. infinitive verbs: persuade someone to, decide to, afford to.',
      },
      {
        id: 'en-b1-m3-s2',
        heading: 'Collaborative Decision Framing (B1 Speaking Part 3)',
        explanation:
          'Examiners reward genuine turn-taking — NOT competing monologues! Evaluate one option briefly, ask your partner’s view, weigh trade-offs, and reach a shared compromise cleanly.',
        formula: 'Weigh: On the other hand... | Compromise: Shall we settle on...? | Confirm: That seems worthwhile.',
        examples: [
          {
            target: 'A weekend workshop sounds worthwhile, though would everyone find the fee realistic?',
            translation: 'Balances enthusiasm with a thoughtful question inviting the partner in.',
            highlight: 'worthwhile, though',
          },
          {
            target: 'If we compromise and host it locally, it will be essential to book the hall early.',
            translation: 'Natural transition toward a final agreed choice.',
            highlight: 'compromise / essential',
          },
        ],
        proTip:
          'You do NOT have to agree immediately in Part 3 — negotiating politely for 60 seconds shows far stronger interactive range!',
      },
    ],
    vocabCards: [
      {
        term: 'consider',
        pronunciation: '/kənˈsɪdə/',
        meaning: 'to think carefully about an option',
        example: 'We should consider inviting a guest speaker to the club.',
        exampleNote: 'Always followed by -ing ("consider inviting", not "to invite").',
      },
      {
        term: 'persuade',
        pronunciation: '/pəˈsweɪd/',
        meaning: 'to convince someone to do/believe something',
        example: 'She persuaded the committee to fund the garden project.',
        exampleNote: 'Pattern: persuade + [person] + to + [verb].',
      },
      {
        term: 'realistic',
        pronunciation: '/ˌrɪəˈlɪstɪk/',
        meaning: 'practical and achievable in real life',
        example: 'Setting a thirty-minute daily study goal is much more realistic.',
        exampleNote: 'Opposite: unrealistic.',
      },
      {
        term: 'essential',
        pronunciation: '/ɪˈsenʃəl/',
        meaning: 'completely necessary / vital',
        example: 'Good audio headphones are essential for listening drills.',
        exampleNote: 'Stronger and crisper than "very important".',
      },
      {
        term: 'compromise',
        pronunciation: '/ˈkɒmprəmaɪz/',
        meaning: 'middle-ground agreement where both sides adjust',
        example: 'Let’s reach a compromise that works for every age group.',
        exampleNote: 'Collocation: "reach/find a compromise".',
      },
      {
        term: 'worthwhile',
        pronunciation: '/ˌwɜːθˈwaɪl/',
        meaning: 'valuable and worth the time or money',
        example: 'Volunteering for the community event was genuinely worthwhile.',
        exampleNote: 'Often used as "it is worthwhile to..." or "a worthwhile idea".',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b1-m3-q1',
        skill: 'reading',
        prompt: 'The lights are off and the car is gone. Which deduction sentence is natural English?',
        options: [
          'They mustn’t be at home.',
          'They can’t be at home.',
          'They shouldn’t be at home.',
        ],
        correctIndex: 1,
        explanation:
          'For logical deduction ("I am sure it is NOT true"), always use "can’t be", never "mustn’t be".',
      },
      {
        id: 'en-b1-m3-q2',
        skill: 'writing',
        prompt: 'Choose the accurate verb pattern for "consider":',
        options: [
          'Have you considered to join a language exchange?',
          'Have you considered joining a language exchange?',
          'Have you considered join a language exchange?',
        ],
        correctIndex: 1,
        explanation:
          '"consider" takes the -ing form (gerund): "considered joining".',
      },
      {
        id: 'en-b1-m3-q3',
        skill: 'reading',
        prompt: 'What is the difference between "He stopped drinking coffee" and "He stopped to drink coffee"?',
        options: [
          'They mean the exact same thing.',
          '"drinking" = he quit coffee; "to drink" = he paused another activity in order to have coffee.',
          '"to drink" = he quit coffee permanently.',
        ],
        correctIndex: 1,
        explanation:
          'stop + -ing = cease the habit/action; stop + to-infinitive = halt to do a new action.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 60,
    checkpointModelAnswer:
      'Let’s consider the best event for our neighborhood club. A weekend music festival sounds fun, but that can’t be realistic with our small budget. Organizing an outdoor food market might be much more worthwhile because local families can participate easily. It is essential to persuade enough volunteers to help, so how about we reach a compromise and start with a one-day Saturday market? What do you think?',
  },

  'en-b2-m1': {
    estimatedMins: 40,
    overview:
      'Crack IELTS True/False/Not Given traps, wield Third & Mixed Conditionals cleanly, and upgrade essays with natural B2/C1 collocations.',
    sections: [
      {
        id: 'en-b2-m1-s1',
        heading: 'Third & Mixed Conditionals + Wish / If Only',
        explanation:
          'Use Third Conditional (If + had + V3, would have + V3) for purely past regrets. Use a Mixed Conditional when a PAST decision still changes the PRESENT: "If policymakers had allocated funds earlier, transit would be more feasible today."',
        formula: '3rd: If + had + V3, would have + V3   |   Mixed: If + had + V3, would + [Base Verb] NOW',
        examples: [
          {
            target: 'If the city had mitigated congestion ten years ago, air quality would be far healthier today.',
            translation: 'Past unreal condition ("had mitigated") → present result ("would be ... today").',
            highlight: 'had mitigated ..., would be',
          },
          {
            target: 'I wish planners had anticipated the unintended consequences of that policy.',
            translation: '"wish + Past Perfect" expresses regret about a past error.',
            highlight: 'wish ... had anticipated',
          },
        ],
        proTip:
          'In IELTS Academic Reading, FALSE means the passage directly CONTRADICTS the statement; NOT GIVEN means the passage simply never mentions that comparison or detail — never use outside knowledge!',
      },
      {
        id: 'en-b2-m1-s2',
        heading: 'Reporting Verbs & Collocation Fluency',
        explanation:
          'Replace repetitive "say" with precise reporting verbs and their exact patterns: insist on + -ing, deny + -ing, warn against + -ing, urge + person + to-inf. Pair words naturally ("mitigate risks", "allocate resources", "striking resemblance").',
        formula: 'insist on / deny / warn against + [Verb-ing]   |   strong collocation = Band 7.5+ Lexical Resource',
        examples: [
          {
            target: 'Critics warned against allocating funds without evaluating whether the plan was feasible.',
            translation: 'Reporting verb ("warned against + -ing") + B2 collocation ("allocate funds").',
            highlight: 'warned against allocating',
          },
          {
            target: 'The new proposal bears a striking resemblance to an overwhelmingly popular Danish model.',
            translation: 'Natural native collocations ("bears a striking resemblance", "overwhelmingly popular").',
            highlight: 'striking resemblance / overwhelmingly',
          },
        ],
        proTip:
          'For IELTS Task 2 / FCE essays, plan 2 body paragraphs with ONE clear topic sentence each, backed by a concrete example and a real-world consequence.',
      },
    ],
    vocabCards: [
      {
        term: 'striking resemblance',
        pronunciation: '/ˈstraɪkɪŋ rɪˈzembləns/',
        meaning: 'very noticeable similarity',
        example: 'This urban scheme bears a striking resemblance to Vienna’s housing model.',
        exampleNote: 'Fixed verb partner: "bear a striking resemblance to".',
      },
      {
        term: 'mitigate',
        pronunciation: '/ˈmɪtɪɡeɪt/',
        meaning: 'to make something harmful less severe',
        example: 'Urban trees help mitigate extreme summer heat waves.',
        exampleNote: 'Collocates with: risk, impact, damage, effects.',
      },
      {
        term: 'allocate',
        pronunciation: '/ˈæləkeɪt/',
        meaning: 'to distribute/assign resources for a purpose',
        example: 'Governments must allocate more funding to preventive healthcare.',
        exampleNote: 'Collocates with: funds, budget, time, resources.',
      },
      {
        term: 'overwhelmingly',
        pronunciation: '/ˌəʊvəˈwelmɪŋli/',
        meaning: 'to an extremely great degree / by a huge majority',
        example: 'Residents voted overwhelmingly in favor of pedestrianizing the square.',
        exampleNote: 'Great adverb for describing survey/study consensus.',
      },
      {
        term: 'feasible',
        pronunciation: '/ˈfiːzəbəl/',
        meaning: 'possible and practical to carry out',
        example: 'A rapid rail link is technically feasible, though costly.',
        exampleNote: 'Synonym of "viable"; stronger than "possible".',
      },
      {
        term: 'unintended consequence',
        pronunciation: '/ˌʌnɪnˈtendɪd ˈkɒnsɪkwəns/',
        meaning: 'unexpected side effect of a policy or action',
        example: 'Banning cars on one road had the unintended consequence of crowding side streets.',
        exampleNote: 'Gold-standard phrase for IELTS/CAE analytical essays.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b2-m1-q1',
        skill: 'reading',
        passage:
          'A 2024 trial in Gothenburg reduced working hours for nurses to six hours a day. Staff absenteeism fell sharply, though the municipality halted expansion due to the cost of hiring extra personnel.',
        prompt: 'Statement: "Gothenburg nurses reported higher job satisfaction than doctors in other Swedish cities." True, False, or Not Given?',
        options: ['True', 'False', 'Not Given'],
        correctIndex: 2,
        explanation:
          'The passage mentions absenteeism and hiring costs, but NEVER compares nurses with doctors in other cities → NOT GIVEN.',
      },
      {
        id: 'en-b2-m1-q2',
        skill: 'writing',
        prompt: 'Choose the grammatically accurate Mixed Conditional (past error → present consequence):',
        options: [
          'If they allocated more funds earlier, the bridge would have been safe today.',
          'If they had allocated more funds earlier, the bridge would be safer today.',
          'If they would have allocated more funds earlier, the bridge is safer today.',
        ],
        correctIndex: 1,
        explanation:
          'Past unreal condition ("had allocated") + present result ("would be safer today"). Never put "would" in the if-clause!',
      },
      {
        id: 'en-b2-m1-q3',
        skill: 'writing',
        prompt: 'Select the accurate reporting verb pattern:',
        options: [
          'The report warned against to ignore unintended consequences.',
          'The report warned against ignoring unintended consequences.',
          'The report denied to ignore the data.',
        ],
        correctIndex: 1,
        explanation:
          '"warn against" and "deny" both take -ing ("ignoring").',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 120,
    checkpointModelAnswer:
      'While congestion charges are often overwhelmingly supported by environmental researchers, policymakers must carefully weigh whether they are socially feasible. On the one hand, charging drivers to enter busy city centers can mitigate air pollution and generate revenue that councils can allocate to cleaner public transit. This strategy bears a striking resemblance to London’s successful low-emission zone. However, experts warn against implementing tolls without affordable alternatives, as doing so creates the unintended consequence of penalizing lower-income commuters. Had cities invested in suburban rail decades ago, transitioning away from private cars would be far smoother today. In my view, tolls work best only when paired directly with expanded transit.',
  },

  'en-b2-m2': {
    estimatedMins: 40,
    overview:
      'Sound fluent and analytical in IELTS Part 2 & multi-speaker tutorials using cleft sentences, past modal deduction, participle clauses, and natural hedging chunks.',
    sections: [
      {
        id: 'en-b2-m2-s1',
        heading: 'Cleft Sentences & Hedging Fluency Chunks',
        explanation:
          'Cleft sentences spotlight your core point dramatically: "What strikes me most is..." or "It is the timing that matters." Pair them with hedging chunks ("to a large extent", "on the flip side", "bear in mind") to sound balanced and natural in 2-minute cue cards.',
        formula: 'What + [Subject + Verb] + is ...   |   It is [Focus] that ...',
        examples: [
          {
            target: 'What strikes me most about mentoring is how pivotal a role trust plays.',
            translation: 'Wh-cleft emphasizes the key insight immediately.',
            highlight: 'What strikes me most ... is',
          },
          {
            target: 'To a large extent I agree; on the flip side, we must bear in mind smaller teams’ limits.',
            translation: 'Balanced hedging before offering a counterpoint.',
            highlight: 'To a large extent / on the flip side',
          },
        ],
        proTip:
          'In IELTS Speaking Part 2, map 4 quick keywords during your 1-minute prep (Who/What · Background · Turning Point · Reflection) so you never run dry at 1:15!',
      },
      {
        id: 'en-b2-m2-s2',
        heading: 'Past Deduction Modals & Participle Clauses',
        explanation:
          'Speculate about past causes with must have / might have / couldn’t have + V3. Tighten B2 sentences with participle clauses ("Having taken the risks into account, the board approved the trial").',
        formula: 'Past deduction: must have / couldn’t have + V3   |   Participle: Having + V3, [Subject] ...',
        examples: [
          {
            target: 'The ancient builders must have taken seasonal floods into account when choosing that hill.',
            translation: 'Strong logical deduction about the past ("must have taken").',
            highlight: 'must have taken ... into account',
          },
          {
            target: 'Having shed light on the flaw, the researchers quickly revised the protocol.',
            translation: 'Perfect participle clause shows sequence cleanly.',
            highlight: 'Having shed light on',
          },
        ],
        proTip:
          'Watch the subject match in participle clauses: the subject right after the comma MUST be the one doing the participle action!',
      },
    ],
    vocabCards: [
      {
        term: 'to a large extent',
        pronunciation: '/tuː ə lɑːdʒ ɪkˈstent/',
        meaning: 'mostly / largely (nuanced agreement)',
        example: 'To a large extent, language fluency depends on daily exposure.',
        exampleNote: 'Much stronger than saying "mostly" or "almost yes".',
      },
      {
        term: 'on the flip side',
        pronunciation: '/ɒn ðə flɪp saɪd/',
        meaning: 'looking at the opposite aspect / downside',
        example: 'Freelancing brings freedom; on the flip side, income can fluctuate.',
        exampleNote: 'Natural spoken transition for IELTS Speaking.',
      },
      {
        term: 'play a pivotal role',
        pronunciation: '/pleɪ ə ˈpɪvətəl rəʊl/',
        meaning: 'have a crucial, central influence',
        example: 'Early feedback plays a pivotal role in building speaking confidence.',
        exampleNote: 'Upgraded version of "play an important role".',
      },
      {
        term: 'take into account',
        pronunciation: '/teɪk ˈɪntuː əˈkaʊnt/',
        meaning: 'consider a factor when making a decision',
        example: 'We need to take cultural differences into account.',
        exampleNote: 'Synonym: "factor in".',
      },
      {
        term: 'shed light on',
        pronunciation: '/ʃed laɪt ɒn/',
        meaning: 'clarify / help explain something complex',
        example: 'Recent brain scans shed light on how bilinguals switch languages.',
        exampleNote: 'Irregular past/participle: shed – shed – shed!',
      },
      {
        term: 'bear in mind',
        pronunciation: '/beər ɪn maɪnd/',
        meaning: 'remember / keep an important point in view',
        example: 'Bear in mind that exam recordings are only played once in IELTS.',
        exampleNote: 'Collocates with "that + clause".',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b2-m2-q1',
        skill: 'listening',
        prompt: 'Listen to the university tutorial clip. Why does Dr. Patel advise caution about the survey?',
        audioScript:
          'Student: The survey results shed light on student burnout — eighty percent felt stressed! Dr. Patel: To a large extent that matches our observations, yes. On the flip side, bear in mind it was conducted right during finals week, so stress levels might have been temporarily inflated.',
        options: [
          'The students lied on the survey.',
          'The survey took place during finals week, which may have temporarily inflated stress scores.',
          'Dr. Patel thinks student burnout does not exist.',
        ],
        correctIndex: 1,
        explanation:
          'Notice the hedge "To a large extent... On the flip side, bear in mind..." followed by past deduction "might have been inflated".',
      },
      {
        id: 'en-b2-m2-q2',
        skill: 'writing',
        prompt: 'Which cleft sentence correctly emphasizes "daily listening"?',
        options: [
          'What helped me most it was daily listening.',
          'What helped me most was daily listening.',
          'That helped me most was daily listening.',
        ],
        correctIndex: 1,
        explanation:
          'Wh-clefts do NOT take an extra "it": "What helped me most was daily listening."',
      },
      {
        id: 'en-b2-m2-q3',
        skill: 'reading',
        prompt: 'Which past deduction expresses near-certainty that something was IMPOSSIBLE?',
        options: [
          'He mustn’t have read the report.',
          'He couldn’t have read the report — he missed the main headline!',
          'He shouldn’t have read the report.',
        ],
        correctIndex: 1,
        explanation:
          '"couldn’t have / can’t have + V3" expresses logical impossibility in the past.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 80,
    checkpointModelAnswer:
      'I’d like to describe a community science workshop that played a pivotal role in how I think about learning. What struck me most was how hands-on experiments shed light on concepts I had previously found abstract. To a large extent, the mentor’s patience made the difference, because he took every participant’s background into account. On the flip side, we had to bear in mind that organizing small-group sessions takes real effort — the volunteers must have spent weeks preparing. Having experienced that environment, I now prefer active practice over passive lectures.',
  },

  'en-b2-m3': {
    estimatedMins: 35,
    overview:
      'Write crisp, objective Cambridge B2 First formal reports and proposals using structured headings, formal linkers (nevertheless/consequently), and emphatic inversion.',
    sections: [
      {
        id: 'en-b2-m3-s1',
        heading: 'Cambridge B2 Report Architecture & Objective Tone',
        explanation:
          'Reports are NOT essays — they require a clear Title, subheadings (Introduction · Current Strengths · Key Issues · Recommendations), impersonal passive/neutral voice, and actionable final recommendations.',
        formula: 'Introduction ("The aim of this report is to evaluate...") → Findings → Actionable Recommendations',
        examples: [
          {
            target: 'The aim of this report is to evaluate the campus library and propose viable upgrades.',
            translation: 'Textbook formal report opening with exact purpose.',
            highlight: 'The aim of this report is to evaluate',
          },
          {
            target: 'Usage has risen substantially; consequently, quiet study rooms are frequently oversubscribed.',
            translation: 'Formal cause-and-effect transition using semicolon + "consequently".',
            highlight: 'substantially; consequently,',
          },
        ],
        proTip:
          'In FCE/CAE reports, avoid contractions ("don’t", "can’t") and casual fillers ("lots of", "pretty good") — upgrade to "substantial", "viable", and "implement".',
      },
      {
        id: 'en-b2-m3-s2',
        heading: 'Emphatic Inversion: Not only ... but also',
        explanation:
          'When "Not only" opens a sentence for formal emphasis, invert the auxiliary and subject just like a question: "Not only would this measure reduce noise, but it would also attract evening students."',
        formula: 'Not only + [Auxiliary] + [Subject] + [Verb], but [Subject] + also ...',
        examples: [
          {
            target: 'Not only did attendance double, but student satisfaction also improved markedly.',
            translation: 'Past Simple inversion uses auxiliary "did" + base verb "double".',
            highlight: 'Not only did attendance double',
          },
          {
            target: 'The software is costly; nevertheless, implementing it remains the most viable option.',
            translation: 'Elevated concession with "nevertheless".',
            highlight: 'nevertheless, implementing',
          },
        ],
        proTip:
          'One clean "Not only + auxiliary + subject" sentence in your Recommendations section earns immediate B2/C1 grammatical range credit.',
      },
    ],
    vocabCards: [
      {
        term: 'nevertheless',
        pronunciation: '/ˌnevəðəˈles/',
        meaning: 'in spite of that / however (formal)',
        example: 'Initial setup costs are high; nevertheless, long-term savings are clear.',
        exampleNote: 'Usually preceded by a semicolon or period and followed by a comma.',
      },
      {
        term: 'consequently',
        pronunciation: '/ˈkɒnsɪkwəntli/',
        meaning: 'as a result / therefore',
        example: 'Bus routes were cut; consequently, evening attendance dropped.',
        exampleNote: 'Elevated replacement for "so".',
      },
      {
        term: 'substantially',
        pronunciation: '/səbˈstænʃəli/',
        meaning: 'to a large, significant degree',
        example: 'Wait times fell substantially after online booking launched.',
        exampleNote: 'Ideal adverb for reports and data trends.',
      },
      {
        term: 'viable',
        pronunciation: '/ˈvaɪəbəl/',
        meaning: 'capable of working successfully / practical',
        example: 'Extending weekend hours appears to be the most viable solution.',
        exampleNote: 'Collocates with: option, solution, alternative, plan.',
      },
      {
        term: 'implement',
        pronunciation: '/ˈɪmplɪment/',
        meaning: 'to put a plan or policy into action',
        example: 'We recommend implementing a two-week pilot scheme in October.',
        exampleNote: 'Pairs with: policy, changes, recommendations, system.',
      },
      {
        term: 'evaluate',
        pronunciation: '/ɪˈvæljueɪt/',
        meaning: 'to assess quality, value, or effectiveness',
        example: 'This report aims to evaluate current sports facilities on campus.',
        exampleNote: 'Classic report-introduction verb.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-b2-m3-q1',
        skill: 'writing',
        prompt: 'Choose the sentence with accurate "Not only" inversion:',
        options: [
          'Not only this upgrade saves money, but it also cuts energy waste.',
          'Not only does this upgrade save money, but it also cuts energy waste.',
          'Not only does this upgrade saves money, but it also cuts energy waste.',
        ],
        correctIndex: 1,
        explanation:
          'After "Not only", invert with auxiliary "does" + subject ("this upgrade") + base verb ("save").',
      },
      {
        id: 'en-b2-m3-q2',
        skill: 'writing',
        prompt: 'Which opening fits a Cambridge B2 First formal report best?',
        options: [
          'Hey everyone! Here is what I think about our college gym.',
          'Introduction: The purpose of this report is to evaluate the college gym facilities and suggest viable improvements.',
          'I am writing to complain furiously about the gym.',
        ],
        correctIndex: 1,
        explanation:
          'Reports use clear headings, neutral/impersonal tone, and state their exact purpose in sentence one.',
      },
      {
        id: 'en-b2-m3-q3',
        skill: 'reading',
        prompt: 'Pick the sentence using "nevertheless" vs. "consequently" logically:',
        options: [
          'The budget was halved; consequently, staff had to cancel two workshops.',
          'The budget was halved; nevertheless, staff had to cancel two workshops.',
          'The budget increased; consequently, zero improvements were possible.',
        ],
        correctIndex: 0,
        explanation:
          'Cutting the budget directly CAUSED the cancellations → "consequently" (result), whereas "nevertheless" signals contrast.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 120,
    checkpointModelAnswer:
      'Report on Campus Study Facilities\n\nIntroduction\nThe aim of this report is to evaluate current library facilities and recommend viable improvements for the upcoming semester.\n\nCurrent Strengths and Issues\nStudent numbers have grown substantially; consequently, silent study desks are frequently full during afternoon hours. The online catalog is reliable; nevertheless, power outlets remain insufficient in older reading rooms.\n\nRecommendations\nIt is strongly recommended that the university implement extended evening hours and install additional desk sockets. Not only would these changes reduce overcrowding, but they would also support part-time learners effectively.',
  },

  'en-c1-m1': {
    estimatedMins: 45,
    overview:
      'Master C1 negative inversion, formal mandative subjunctives, academic hedging (albeit/notwithstanding), and cross-text attitude synthesis for CAE & IELTS 8.0.',
    sections: [
      {
        id: 'en-c1-m1-s1',
        heading: 'Negative Inversion & Formal Mandative Subjunctive',
        explanation:
          'Fronting restrictive/negative adverbs (Rarely, Seldom, Little, Under no circumstances, Only after) triggers strict auxiliary-subject inversion. In formal recommendations ("It is imperative that...", "The board insisted that..."), use the bare base-form subjunctive ("that data be audited", "that she resign").',
        formula: 'Rarely + [Aux] + [Subj] + [Verb]  |  It is imperative that + [Subj] + [Base Verb (no -s!)]',
        examples: [
          {
            target: 'Rarely have researchers corroborated such a dramatic shift across every age bracket.',
            translation: 'Negative fronting ("Rarely") inverts "have researchers".',
            highlight: 'Rarely have researchers corroborated',
          },
          {
            target: 'It is imperative that automated scoring remain transparent and subject to human audit.',
            translation: 'Mandative subjunctive keeps base verb "remain" (not "remains").',
            highlight: 'imperative that ... remain',
          },
        ],
        proTip:
          'Watch "Only after / Only when / Only by": inversion happens in the MAIN clause, NOT inside the "only" clause ("Only after testing did the flaw emerge").',
      },
      {
        id: 'en-c1-m1-s2',
        heading: 'Precision Academic Hedging & Cross-Text Synthesis',
        explanation:
          'C1 academic prose distinguishes facts from tentative claims using "albeit" (followed by adjective/phrase, never a full finite verb!), "notwithstanding" (despite), and "purportedly" (allegedly). In CAE Part 6 Cross-Text Reading, isolate each author’s exact claim before comparing agreements.',
        formula: 'albeit + Adj/Phrase ("effective, albeit costly")   |   Notwithstanding + Noun',
        examples: [
          {
            target: 'The intervention proved pragmatic, albeit tenuous in rural regions.',
            translation: '"albeit" compresses "although it was" into one crisp word.',
            highlight: 'albeit tenuous',
          },
          {
            target: 'Notwithstanding ubiquitous hype, unregulated tools can exacerbate existing disparities.',
            translation: 'Formal concession + precision C1 verbs ("exacerbate").',
            highlight: 'Notwithstanding ... exacerbate',
          },
        ],
        proTip:
          'Never write "albeit it is expensive" — "albeit" CANNOT take a conjugated verb! Just write "albeit expensive".',
      },
    ],
    vocabCards: [
      {
        term: 'ubiquitous',
        pronunciation: '/juːˈbɪkwɪtəs/',
        meaning: 'present or found everywhere',
        example: 'Smartphone notifications have become ubiquitous in modern workplaces.',
        exampleNote: 'Elevated alternative to "everywhere".',
      },
      {
        term: 'corroborate',
        pronunciation: '/kəˈrɒbəreɪt/',
        meaning: 'confirm or support a finding with new evidence',
        example: 'Independent field studies corroborate the initial laboratory results.',
        exampleNote: 'Collocates with: findings, evidence, claims, account.',
      },
      {
        term: 'exacerbate',
        pronunciation: '/ɪɡˈzæsəbeɪt/',
        meaning: 'make an existing problem or bad situation worse',
        example: 'Cutting night buses would exacerbate isolation among shift workers.',
        exampleNote: 'Always used for NEGATIVE situations (never "exacerbate a good thing").',
      },
      {
        term: 'pragmatic',
        pronunciation: '/præɡˈmætɪk/',
        meaning: 'dealing with problems sensibly and realistically',
        example: 'A pragmatic phased rollout avoids costly system failures.',
        exampleNote: 'Contrasts with "idealistic" or "dogmatic".',
      },
      {
        term: 'tenuous',
        pronunciation: '/ˈtenjuəs/',
        meaning: 'very weak, slight, or poorly supported',
        example: 'The causal link between the two trends remains tenuous at best.',
        exampleNote: 'Collocates with: link, connection, grasp, evidence.',
      },
      {
        term: 'notwithstanding',
        pronunciation: '/ˌnɒtwɪθˈstændɪŋ/',
        meaning: 'in spite of / despite (formal academic)',
        example: 'Notwithstanding initial skepticism, the pilot delivered measurable gains.',
        exampleNote: 'Follow with a noun phrase, just like "despite".',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c1-m1-q1',
        skill: 'writing',
        prompt: 'Choose the sentence with accurate C1 inversion after "Only after":',
        options: [
          'Only after did the audit finish, the discrepancies emerged.',
          'Only after the audit finished did the discrepancies emerge.',
          'Only after the audit finished, the discrepancies emerged.',
        ],
        correctIndex: 1,
        explanation:
          'With "Only after / Only when", keep normal order in the subordinate clause and invert the MAIN clause ("did the discrepancies emerge").',
      },
      {
        id: 'en-c1-m1-q2',
        skill: 'writing',
        prompt: 'Which sentence uses "albeit" accurately?',
        options: [
          'The plan was pragmatic, albeit it was expensive.',
          'The plan was pragmatic, albeit expensive.',
          'Albeit the plan was expensive, it worked.',
        ],
        correctIndex: 1,
        explanation:
          '"albeit" cannot introduce a finite verb clause; it attaches cleanly to an adjective, adverb, or prepositional phrase.',
      },
      {
        id: 'en-c1-m1-q3',
        skill: 'reading',
        passage:
          'Author A argues that ubiquitous classroom tablets exacerbate distraction. Author B concedes attention spans are fragile, yet cites longitudinal data corroborating literacy gains when teachers curate apps.',
        prompt: 'How does Author B’s position relate to Author A’s?',
        options: [
          'Author B completely agrees that tablets offer no benefits.',
          'Author B acknowledges distraction concerns, but argues guided use improves literacy.',
          'Author B dismisses attention issues as imaginary.',
        ],
        correctIndex: 1,
        explanation:
          'Classic CAE Cross-Text nuance: partial concession ("concedes attention spans are fragile") + conditional disagreement ("when teachers curate apps").',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 140,
    checkpointModelAnswer:
      'Notwithstanding the ubiquitous promise of AI tutoring platforms, their educational value hinges on disciplined oversight. Rarely have technological tools scaled so rapidly while the empirical evidence for long-term retention remains tenuous. Proponents cite compelling short-term efficiency gains, albeit largely in rote drills; yet critics plausibly warn that unchecked automation could exacerbate disparities in critical thinking. Only after independent studies corroborate sustained learning outcomes should schools replace core instruction. In the meantime, it is imperative that educators adopt a pragmatic hybrid framework in which software augments, rather than displaces, human mentorship.',
  },

  'en-c1-m2': {
    estimatedMins: 45,
    overview:
      'Catch implicit speaker attitudes in fast lectures, deploy executive rhetorical fronting and ellipsis, and debate abstract policy trade-offs with C1 agility.',
    sections: [
      {
        id: 'en-c1-m2-s1',
        heading: 'Ellipsis, Substitution & Nuanced Modal Hedging',
        explanation:
          'Fluent C1 speakers avoid clunky repetition through substitution ("so", "not", "do so", "ones") and soften assertions with epistemic modals ("would appear to", "might well have", "could arguably").',
        formula: 'I suspect so / If not / fail to do so  |  might well have + V3 (strong possibility)',
        examples: [
          {
            target: 'The subsidy might well have accelerated adoption, albeit with an unintended spillover into rent prices.',
            translation: '"might well have" = quite likely happened, paired with a sharp caveat.',
            highlight: 'might well have',
          },
          {
            target: 'Regulators promised to audit the algorithm, yet so far have failed to do so.',
            translation: '"do so" substitutes cleanly for repeating "audit the algorithm".',
            highlight: 'failed to do so',
          },
        ],
        proTip:
          'In TOEFL/CAE Listening, listen to intonation as much as words: a rising, stretched "Weellll, theoretically..." almost always signals skepticism or an upcoming caveat!',
      },
      {
        id: 'en-c1-m2-s2',
        heading: 'Executive Discourse Pivots (Having said that / By the same token)',
        explanation:
          'Navigate complex abstract debates effortlessly by balancing analogies ("by the same token") and graceful pivots ("having said that", "with one crucial caveat") to evaluate double-edged innovations.',
        formula: 'Parallel logic: By the same token, ...  |  Balanced pivot: Having said that, ...',
        examples: [
          {
            target: 'Remote hiring opens global talent pools; by the same token, it intensifies wage competition locally.',
            translation: '"by the same token" draws a parallel logical consequence.',
            highlight: 'by the same token',
          },
          {
            target: 'The argument is compelling; having said that, one caveat remains unaddressed.',
            translation: '"having said that" concedes value before raising a critical exception.',
            highlight: 'having said that, one caveat',
          },
        ],
        proTip:
          'Fronting an adjective or adverb ("Compelling though this theory is,...") immediately adds executive polish to C1 speeches.',
      },
    ],
    vocabCards: [
      {
        term: 'by the same token',
        pronunciation: '/baɪ ðə seɪm ˈtəʊkən/',
        meaning: 'for the same reason / similarly (parallel logic)',
        example: 'Flexibility boosts morale; by the same token, blurred hours can fuel burnout.',
        exampleNote: 'Ideal for linking symmetrical arguments.',
      },
      {
        term: 'having said that',
        pronunciation: '/ˈhævɪŋ sed ðæt/',
        meaning: 'even so / despite what I just acknowledged',
        example: 'The study is impressive; having said that, its sample skews heavily urban.',
        exampleNote: 'Natural spoken & semi-formal pivot.',
      },
      {
        term: 'a double-edged sword',
        pronunciation: '/ə ˌdʌbəl edʒd ˈsɔːd/',
        meaning: 'something with both major benefits and serious risks',
        example: 'Hyper-personalization is a double-edged sword for independent journalism.',
        exampleNote: 'High-impact metaphor for abstract debates.',
      },
      {
        term: 'unintended spillover',
        pronunciation: '/ˌʌnɪnˈtendɪd ˈspɪləʊvə/',
        meaning: 'indirect ripple effect into another area',
        example: 'Short-term rental booms often cause an unintended spillover into local housing.',
        exampleNote: 'Frequent in economics and policy lectures.',
      },
      {
        term: 'caveat',
        pronunciation: '/ˈkæviæt/',
        meaning: 'important warning, condition, or limitation',
        example: 'I endorse the plan, with one important caveat regarding privacy.',
        exampleNote: 'Collocates with: "add/attach/with one caveat".',
      },
      {
        term: 'compelling',
        pronunciation: '/kəmˈpelɪŋ/',
        meaning: 'powerfully persuasive and convincing',
        example: 'The speaker presented a compelling case for congestion pricing.',
        exampleNote: 'Collocates with: argument, case, evidence, reason.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c1-m2-q1',
        skill: 'listening',
        prompt: 'Listen to the economics lecture clip. What is the lecturer’s true attitude toward the tax incentive?',
        audioScript:
          'On paper, the tax incentive looks compelling — and it might well have boosted green startups. Having said that, we can’t ignore the unintended spillover into land prices, so I’d endorse it only with a hefty caveat.',
        options: [
          'Unconditional praise for its economic design',
          'Qualified approval — acknowledges startup gains but warns of land-price spillover',
          'Total rejection because startups failed to benefit',
        ],
        correctIndex: 1,
        explanation:
          'The lecturer balances startup gains with "Having said that..." and "only with a hefty caveat".',
      },
      {
        id: 'en-c1-m2-q2',
        skill: 'writing',
        prompt: 'Which sentence uses substitution ("do so") cleanly to avoid repetition?',
        options: [
          'Cities should modernize grid storage, yet few have funds to do so.',
          'Cities should modernize grid storage, yet few have funds to do it so.',
          'Cities should modernize grid storage, yet few are do so.',
        ],
        correctIndex: 0,
        explanation:
          '"do so" stands in cleanly for the entire verb phrase "modernize grid storage" (never add "it").',
      },
      {
        id: 'en-c1-m2-q3',
        skill: 'reading',
        prompt: 'What does "by the same token" signal between two statements?',
        options: [
          'A complete contradiction',
          'A parallel logical point resting on the very same principle',
          'A chronological sequence',
        ],
        correctIndex: 1,
        explanation:
          '"by the same token" extends the exact same reasoning to a second, symmetrical consequence.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 90,
    checkpointModelAnswer:
      'Algorithmic curation in news and culture is truly a double-edged sword. On one level, the case for personalization is compelling: it might well have helped niche creators reach global audiences who would otherwise never find them. By the same token, it narrows accidental discovery and creates an unintended spillover into civic polarization. Having said that, abandoning recommendation systems altogether is unrealistic. I would therefore back smarter algorithms, with one crucial caveat: platforms must give users transparent controls to widen their feeds, and so far most have failed to do so.',
  },

  'en-c1-m3': {
    estimatedMins: 40,
    overview:
      'Master lexical density, nominalization, and persuasive CAE Executive Proposals so every recommendation is substantiated with authority.',
    sections: [
      {
        id: 'en-c1-m3-s1',
        heading: 'Nominalization & Lexical Density (Proposal Register)',
        explanation:
          'Executive proposals pack maximum clarity into fewer words by converting wordy clauses into crisp noun phrases ("Because resources are shared unfairly" → "The disproportionate allocation of resources"). Pair nominalized subjects with high-precision verbs: underpin, reconcile, substantiate.',
        formula: 'Clause → Dense Noun Phrase + Precision Verb (underpin / reconcile / substantiate)',
        examples: [
          {
            target: 'This proposal outlines a practical paradigm to reconcile rapid growth with ecological limits.',
            translation: 'High lexical density with zero fluff.',
            highlight: 'paradigm to reconcile',
          },
          {
            target: 'Robust pilot metrics underpin our funding request and substantiate its projected ROI.',
            translation: 'Two authoritative C1 verbs ("underpin", "substantiate") carry the clause.',
            highlight: 'underpin / substantiate',
          },
        ],
        proTip:
          'Unlike a Report (which looks BACK at current facts), a CAE Proposal looks FORWARD to persuade a decision-maker to fund or approve a concrete plan!',
      },
      {
        id: 'en-c1-m3-s2',
        heading: 'Calibrating Persuasive Authority Across Genres',
        explanation:
          'Match tone precisely to your reader: in a board proposal use confident, evidence-backed imperatives ("It is imperative that...", "Should the committee approve this pilot..."); avoid emotional exaggeration or informal slang.',
        formula: 'Conditional courtesy: Should the board approve this phase, rollout could begin in Q2.',
        examples: [
          {
            target: 'Should the council endorse this initiative, disproportionate commuter delays could fall within months.',
            translation: 'Inverted First Conditional ("Should the council...") sounds crisp and boardroom-ready.',
            highlight: 'Should the council endorse',
          },
          {
            target: 'Transparent milestones are imperative if we are to retain stakeholder confidence.',
            translation: '"if we are to..." expresses formal strategic condition.',
            highlight: 'imperative if we are to',
          },
        ],
        proTip:
          'Always close a CAE Proposal with a 2-sentence "Expected Impact / Conclusion" summarizing WHY approving the proposal benefits the organization.',
      },
    ],
    vocabCards: [
      {
        term: 'imperative',
        pronunciation: '/ɪmˈperətɪv/',
        meaning: 'of vital importance / urgent necessity',
        example: 'It is imperative that staff receive training prior to the launch.',
        exampleNote: 'Works as adjective ("it is imperative") or noun ("a strategic imperative").',
      },
      {
        term: 'reconcile',
        pronunciation: '/ˈrekənsaɪl/',
        meaning: 'make two conflicting goals/ideas compatible',
        example: 'The design reconciles tight security with effortless user access.',
        exampleNote: 'Collocates with: "reconcile A with B".',
      },
      {
        term: 'underpin',
        pronunciation: '/ˌʌndəˈpɪn/',
        meaning: 'support, form the foundation of an argument or system',
        example: 'Three core principles underpin this curriculum overhaul.',
        exampleNote: 'Stronger and more precise than "support".',
      },
      {
        term: 'paradigm',
        pronunciation: '/ˈpærədaɪm/ (silent g)',
        meaning: 'typical pattern, model, or overarching framework',
        example: 'Preventive medicine represents a shift away from the reactive treatment paradigm.',
        exampleNote: 'Watch pronunciation: "PA-ruh-dime" (silent g).',
      },
      {
        term: 'disproportionate',
        pronunciation: '/ˌdɪsprəˈpɔːʃənət/',
        meaning: 'too large or too small in comparison to something else',
        example: 'Rural clinics face a disproportionate share of staffing shortages.',
        exampleNote: 'Collocates with: impact, share, burden, cost.',
      },
      {
        term: 'substantiate',
        pronunciation: '/səbˈstænʃieɪt/',
        meaning: 'prove or back up a claim with solid evidence',
        example: 'Quarterly audit figures substantiate the case for expansion.',
        exampleNote: 'Opposite: unsubstantiated.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c1-m3-q1',
        skill: 'writing',
        prompt: 'How does a CAE Proposal differ primarily from a Report?',
        options: [
          'Proposals use casual slang and no headings.',
          'Proposals are forward-looking and aim to persuade a decision-maker to adopt a future plan.',
          'Proposals must be written in the past tense only.',
        ],
        correctIndex: 1,
        explanation:
          'Reports evaluate present/past conditions; Proposals pitch concrete future actions and persuade the reader to approve them.',
      },
      {
        id: 'en-c1-m3-q2',
        skill: 'writing',
        prompt: 'Which sentence uses formal inverted conditional ("Should...") accurately?',
        options: [
          'Should the committee approves the grant, the lab will open in May.',
          'Should the committee approve the grant, the lab will open in May.',
          'If should the committee approve the grant, the lab will open in May.',
        ],
        correctIndex: 1,
        explanation:
          '"Should" replaces "If" and takes the bare base verb ("approve", never "approves").',
      },
      {
        id: 'en-c1-m3-q3',
        skill: 'reading',
        prompt: 'What does "substantiate a claim" mean?',
        options: [
          'Repeat a claim more loudly',
          'Provide concrete evidence that proves the claim true',
          'Withdraw a claim quietly',
        ],
        correctIndex: 1,
        explanation:
          '"substantiate" means to back up an assertion with verifiable evidence or data.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 140,
    checkpointModelAnswer:
      'Proposal: Sustainable Campus Mobility Fund\n\nPurpose\nThis proposal seeks approval for a two-year mobility fund designed to reconcile rising campus enrollment with municipal emission targets.\n\nRationale\nRecent commuting audits substantiate that parking shortages impose a disproportionate burden on off-campus students. Underpinning our proposal is a shift toward a shared-transit paradigm combining subsidized rail passes with secure cycle hubs.\n\nImplementation and Impact\nIt is imperative that infrastructure upgrades precede parking caps. Should the board endorse this pilot in autumn, single-occupancy car commutes could decline by thirty percent within twelve months, positioning the university as a regional sustainability leader.',
  },

  'en-c2-m1': {
    estimatedMins: 45,
    overview:
      'Synthesize competing arguments seamlessly for Cambridge C2 Proficiency (CPE) using inverted conditionals, razor-thin lexical precision, and zero-redundancy prose.',
    sections: [
      {
        id: 'en-c2-m1-s1',
        heading: 'Inverted Conditionals (Were ... to / Had ...) & Syntactic Architecture',
        explanation:
          'At C2, conditional inversion replaces "If" for compact rhetorical elegance: "Were policymakers to ignore this shift..." (hypothetical future) and "Had the committee acted sooner..." (past counterfactual). Pair with crisp parallel clauses.',
        formula: 'Were [Subj] to + [Verb] ... (2nd Cond)   |   Had [Subj] + [V3] ... (3rd Cond)',
        examples: [
          {
            target: 'Were critics to read the manifesto with equanimity, its trenchant critique would appear far less radical.',
            translation: 'Inverted 2nd conditional ("Were critics to read...") + razor-precise C2 lexis.',
            highlight: 'Were critics to read',
          },
          {
            target: 'Had the institution listened to perspicacious warnings, this ostensibly minor dispute would not have festered.',
            translation: 'Inverted 3rd conditional + nuanced contrast ("ostensibly").',
            highlight: 'Had the institution listened',
          },
        ],
        proTip:
          'In CPE Part 1 Dual-Text Essays, NEVER copy phrases verbatim from the two source texts — synthesize both core ideas in your own words before evaluating which holds more weight.',
      },
      {
        id: 'en-c2-m1-s2',
        heading: 'Razor-Thin Lexical Precision & Editorial Compression',
        explanation:
          'C2 vocabulary isn’t about showing off obscure words; it’s about picking the SINGLE exact word that captures attitude ("ostensibly" = seemingly, hinting doubt; "ephemeral" = fleeting; "recalcitrant" = stubbornly resistant).',
        formula: 'Cut "in order to / the fact that / very + weak adj" → Replace with 1 exact C2 word',
        examples: [
          {
            target: 'Ostensibly designed to foster connection, ephemeral social feeds often leave users strangely isolated.',
            translation: '"Ostensibly" signals surface intent vs. deeper reality in one word.',
            highlight: 'Ostensibly ... ephemeral',
          },
          {
            target: 'Even the most recalcitrant skeptics eventually conceded the essay’s trenchant logic.',
            translation: 'Exact collocations: "recalcitrant skeptics", "trenchant logic".',
            highlight: 'recalcitrant / trenchant',
          },
        ],
        proTip:
          'Read your draft aloud mentally: if a clause feels breathy or bloated, trim dead prepositions and let strong nouns and verbs carry the rhythm.',
      },
    ],
    vocabCards: [
      {
        term: 'ostensibly',
        pronunciation: '/ɒˈstensəbli/',
        meaning: 'apparently or purportedly, though perhaps not actually',
        example: 'The fee was ostensibly introduced for maintenance, yet funds went elsewhere.',
        exampleNote: 'Instantly signals polite critical skepticism.',
      },
      {
        term: 'equanimity',
        pronunciation: '/ˌekwəˈnɪməti/',
        meaning: 'calm mental composure, especially under stress or criticism',
        example: 'She met the hostile questioning with remarkable equanimity.',
        exampleNote: 'Collocates with: "with equanimity", "maintain equanimity".',
      },
      {
        term: 'trenchant',
        pronunciation: '/ˈtrentʃənt/',
        meaning: 'vigorous, sharp, and incisive in expression',
        example: 'His trenchant commentary exposed the contradictions in the bill.',
        exampleNote: 'Collocates with: critique, analysis, wit, observation.',
      },
      {
        term: 'ephemeral',
        pronunciation: '/ɪˈfemərəl/',
        meaning: 'lasting for a very short time; fleeting',
        example: 'Viral fame is notoriously ephemeral compared with enduring craft.',
        exampleNote: 'Antonym: enduring / perennial.',
      },
      {
        term: 'recalcitrant',
        pronunciation: '/rɪˈkælsɪtrənt/',
        meaning: 'obstinately uncooperative or resistant to authority/change',
        example: 'Negotiators struggled to bring recalcitrant factions back to the table.',
        exampleNote: 'Formal, high-precision adjective.',
      },
      {
        term: 'perspicacious',
        pronunciation: '/ˌpɜːspɪˈkeɪʃəs/',
        meaning: 'having ready insight and sharp discernment',
        example: 'A perspicacious editor spotted the structural flaw within minutes.',
        exampleNote: 'Synonym of astute / perceptive.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c2-m1-q1',
        skill: 'writing',
        prompt: 'Choose the grammatically exact C2 inverted conditional:',
        options: [
          'Were cities investing more in libraries, literacy would climb.',
          'Were cities to invest more in libraries, civic literacy would climb.',
          'Were cities invested more in libraries, civic literacy would climb.',
        ],
        correctIndex: 1,
        explanation:
          'Hypothetical future inversion requires "Were + subject + TO-infinitive" ("Were cities to invest...").',
      },
      {
        id: 'en-c2-m1-q2',
        skill: 'reading',
        passage:
          'Ostensibly a celebration of democratic taste, the algorithm’s curated charts quietly privilege ephemeral novelty over enduring artistry.',
        prompt: 'What does "Ostensibly" reveal about the writer’s view of the charts?',
        options: [
          'The writer fully believes the charts represent democratic taste.',
          'The writer suspects the democratic label is only a surface pretense.',
          'The writer thinks charts are legally mandated.',
        ],
        correctIndex: 1,
        explanation:
          '"Ostensibly" implies that the stated appearance ("democratic taste") masks a different underlying reality.',
      },
      {
        id: 'en-c2-m1-q3',
        skill: 'reading',
        prompt: 'Which word best describes a sharp, penetrating, forceful literary critique?',
        options: ['ephemeral', 'trenchant', 'recalcitrant'],
        correctIndex: 1,
        explanation:
          '"trenchant" specifically denotes sharp, clear, incisive analysis or criticism.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 150,
    checkpointModelAnswer:
      'Both passages grapple with the tension between rapid digital curation and slow cultural memory, yet they diverge sharply on where responsibility lies. The first author offers a trenchant warning that platforms, ostensibly built to broaden horizons, merely amplify ephemeral trends. The second takes a more perspicacious view of audiences, suggesting that even recalcitrant readers gravitate toward depth when given space. Were publishers to abandon thoughtful editing in pursuit of clicks, public discourse would surely impoverish itself. Had legacy institutions met digital disruption with greater equanimity rather than panic, a healthier balance between immediacy and permanence might already have emerged.',
  },

  'en-c2-m2': {
    estimatedMins: 45,
    overview:
      'Decode British and international understatement, litotes, and diplomatic irony in rapid audio, and command spontaneous C2 intellectual speeches with natural prosody.',
    sections: [
      {
        id: 'en-c2-m2-s1',
        heading: 'Pragmatic Understatement, Litotes & Diplomatic Softeners',
        explanation:
          'In high-register English (especially British & diplomatic discourse), polite formulas often pack sharp disagreement: "With the greatest respect" signals a firm rebuttal; "not entirely convincing" (litotes) means seriously flawed; "an interesting approach" can mean questionable.',
        formula: 'Polite softener ("With the greatest respect") + Precise critique ("that position is untenable")',
        examples: [
          {
            target: 'With the greatest respect, assuming growth alone solves inequality begs the question.',
            translation: 'Diplomatic yet razor-firm pushback identifying circular reasoning.',
            highlight: 'With the greatest respect / begs the question',
          },
          {
            target: 'Winning market share by burning out one’s own engineers would be a pyrrhic victory.',
            translation: 'Metaphorical framing captures a nuanced cost in three words.',
            highlight: 'pyrrhic victory',
          },
        ],
        proTip:
          'Watch true C2 meaning of "begs the question": in formal logic it means "assumes the very conclusion it tries to prove" (though casually used to mean "raises the question").',
      },
      {
        id: 'en-c2-m2-s2',
        heading: 'Prosodic Contrast & Impromptu Intellectual Framing',
        explanation:
          'In CPE Speaking Part 3 (2-minute solo long turn), vocal stress carries half your clarity: stress contrastive words ("Not ONLY cost, but TRUST"), pause briefly after rhetorical questions, and weave one apt metaphor ("silver lining", "pyrrhic victory") naturally.',
        formula: 'Frame the paradox → Examine both poles → Deliver a nuanced, memorable synthesis',
        examples: [
          {
            target: 'The silver lining of the downturn was that it forced a far more nuanced appraisal of risk.',
            translation: 'Turns an idiomatic metaphor directly into analytical C2 register.',
            highlight: 'silver lining / nuanced',
          },
          {
            target: 'Maintaining the status quo is no longer merely inconvenient; it has become untenable.',
            translation: 'Escalating contrastive stress ("merely inconvenient" → "untenable").',
            highlight: 'untenable',
          },
        ],
        proTip:
          'Never rush C2 Speaking! Measured pacing with intentional half-second pauses signals authority and buys clean syntactic control.',
      },
    ],
    vocabCards: [
      {
        term: 'with the greatest respect',
        pronunciation: '/wɪð ðə ˈɡreɪtɪst rɪˈspekt/',
        meaning: 'polite preamble used right before firmly disagreeing',
        example: 'With the greatest respect, the data simply do not bear out that claim.',
        exampleNote: 'Classic diplomatic softener in debates and panels.',
      },
      {
        term: 'begs the question',
        pronunciation: '/beɡz ðə ˈkwestʃən/',
        meaning: 'assumes the conclusion in its premise (or invites an obvious question)',
        example: 'Calling the rule fair because it is legal begs the question entirely.',
        exampleNote: 'High-register rhetorical idiom.',
      },
      {
        term: 'a pyrrhic victory',
        pronunciation: '/ə ˈpɪrɪk ˈvɪktəri/',
        meaning: 'a win achieved at such devastating cost that it feels like a loss',
        example: 'Winning the lawsuit after bankrupting the partnership was a pyrrhic victory.',
        exampleNote: 'Named after King Pyrrhus of Epirus.',
      },
      {
        term: 'silver lining',
        pronunciation: '/ˌsɪlvə ˈlaɪnɪŋ/',
        meaning: 'a hopeful or positive aspect inside an otherwise bad situation',
        example: 'One silver lining of the delay was time to refine the accessibility design.',
        exampleNote: 'Often paired with "every cloud has a silver lining".',
      },
      {
        term: 'nuanced',
        pronunciation: '/ˈnjuːɑːnst/',
        meaning: 'characterized by subtle distinctions and careful balance',
        example: 'Complex urban policy demands a far more nuanced debate.',
        exampleNote: 'Antonym: simplistic / reductive.',
      },
      {
        term: 'untenable',
        pronunciation: '/ʌnˈtenəbəl/',
        meaning: 'impossible to defend or sustain any longer',
        example: 'Once the audit leaked, the director’s position became untenable.',
        exampleNote: 'Collocates with: position, argument, status quo, claim.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c2-m2-q1',
        skill: 'listening',
        prompt: 'Listen to the British panelist. What does she ACTUALLY mean?',
        audioScript:
          'Well, with the greatest respect to the committee, calling a twenty-year delay "measured progress" is a rather brave interpretation — personally, I find the current timeline wholly untenable.',
        options: [
          'She admires the committee’s courageous patience.',
          'She uses ironic understatement ("brave interpretation") to reject the timeline firmly.',
          'She supports delaying the project another twenty years.',
        ],
        correctIndex: 1,
        explanation:
          '"with the greatest respect" + ironic "rather brave interpretation" precede her blunt verdict ("wholly untenable").',
      },
      {
        id: 'en-c2-m2-q2',
        skill: 'reading',
        prompt: 'What is a "pyrrhic victory"?',
        options: [
          'An effortless landslide win',
          'A victory won at such severe cost that it undermines the winner',
          'An accidental draw',
        ],
        correctIndex: 1,
        explanation:
          'A pyrrhic victory inflicts so much damage on the victor that it is tantamount to defeat.',
      },
      {
        id: 'en-c2-m2-q3',
        skill: 'speaking',
        prompt: 'Which line demonstrates C2 escalating contrastive framing cleanly?',
        options: [
          'It is bad and also very bad.',
          'The delay is no longer merely awkward; it has rendered the entire schedule untenable.',
          'The delay is untenable and awkward too.',
        ],
        correctIndex: 1,
        explanation:
          '"no longer merely [X]; it has rendered [Y]" delivers crisp prosodic escalation.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 95,
    checkpointModelAnswer:
      'With the greatest respect to those who equate constant connectivity with productivity, that assumption rather begs the question of what meaningful work actually looks like. Winning an extra hour of email replies at the expense of deep concentration is, surely, a pyrrhic victory. The current culture of instant availability is no longer merely tiring; for creative teams, it has become untenable. Yet there is a silver lining to this burnout wave: organizations are finally embracing a more nuanced view of attention, protecting uninterrupted focus time as an asset rather than a luxury.',
  },

  'en-c2-m3': {
    estimatedMins: 40,
    overview:
      'Achieve publication-grade stylistic fluidity across reviews, essays, and rhetoric — balancing cogent argument, vivid juxtaposition, and effortless eloquence.',
    sections: [
      {
        id: 'en-c2-m3-s1',
        heading: 'Publication-Grade Reviews & Vivid Juxtaposition',
        explanation:
          'Great C2 cultural reviews blend intellectual authority with human warmth. Anchor your review in a vivid opening image or juxtaposition, evaluate strengths and flaws candidly (neither gushing nor cynical), and land a resonant closing verdict.',
        formula: 'Evocative Hook → Cogent Analysis of Craft/Theme → Candid Caveat → Memorable Verdict',
        examples: [
          {
            target: 'The documentary’s quiet eloquence arises from its startling juxtaposition of archival footage and intimate testimony.',
            translation: 'Evaluates craft specifically rather than saying "it was very good".',
            highlight: 'eloquence / juxtaposition',
          },
          {
            target: 'Though deliberately equivocal in its closing act, the novel delivers an incisive portrait of ambition.',
            translation: 'Turns an apparent ambiguity into thoughtful literary praise.',
            highlight: 'equivocal / incisive',
          },
        ],
        proTip:
          'In CPE Part 2 Reviews, readers expect personality and voice — vary register purposefully, from crisp wit to philosophical resonance.',
      },
      {
        id: 'en-c2-m3-s2',
        heading: 'Register Fluidity & Self-Editing for Cogency',
        explanation:
          'True C2 mastery moves seamlessly between scholarly precision ("cogent", "quintessential") and crisp conversational rhythm without jarring shifts. Cut every qualifier that blurs your conviction.',
        formula: 'Audit: Is every paragraph advancing ONE cogent idea? Does the final sentence echo the opening?',
        examples: [
          {
            target: 'Far from being a nostalgic footnote, the book stands as the quintessential statement of its era.',
            translation: 'Confident, uncluttered critical judgment.',
            highlight: 'quintessential',
          },
          {
            target: 'Her case is all the more cogent for refusing easy slogans.',
            translation: 'Idiomatic C2 structure: "all the more [adj] for + -ing".',
            highlight: 'all the more cogent for',
          },
        ],
        proTip:
          'Master the gem structure "all the more [adj] for [reason/-ing]" — it instantly elevates evaluative writing!',
      },
    ],
    vocabCards: [
      {
        term: 'incisive',
        pronunciation: '/ɪnˈsaɪsɪv/',
        meaning: 'intelligently analytical, sharp, and clear',
        example: 'Her incisive interview uncovered assumptions everyone else had missed.',
        exampleNote: 'Collocates with: analysis, portrait, wit, critique.',
      },
      {
        term: 'equivocal',
        pronunciation: '/ɪˈkwɪvəkəl/',
        meaning: 'open to more than one interpretation; deliberately ambiguous',
        example: 'The minister offered an equivocal reply that satisfied neither side.',
        exampleNote: 'Opposite: unequivocal (crystal clear, leaving no doubt).',
      },
      {
        term: 'quintessential',
        pronunciation: '/ˌkwɪntɪˈsenʃəl/',
        meaning: 'representing the purest, most perfect example of a quality',
        example: 'That narrow cobblestone alley is the quintessential Lisbon postcard.',
        exampleNote: 'Used attributively before a noun.',
      },
      {
        term: 'juxtaposition',
        pronunciation: '/ˌdʒʌkstəpəˈzɪʃən/',
        meaning: 'placing two contrasting things side by side for effect',
        example: 'The juxtaposition of brutalist concrete and wild gardens feels electric.',
        exampleNote: 'Verb form: juxtapose.',
      },
      {
        term: 'cogent',
        pronunciation: '/ˈkəʊdʒənt/',
        meaning: 'clear, logical, and deeply convincing',
        example: 'The essay mounts a remarkably cogent defense of public libraries.',
        exampleNote: 'Collocates with: argument, case, reason, analysis.',
      },
      {
        term: 'eloquence',
        pronunciation: '/ˈeləkwəns/',
        meaning: 'fluent, graceful, and persuasive expression',
        example: 'Rarely has a scientific memoir been written with such understated eloquence.',
        exampleNote: 'Adjective: eloquent.',
      },
    ],
    practiceQuestions: [
      {
        id: 'en-c2-m3-q1',
        skill: 'writing',
        prompt: 'Which sentence uses the C2 evaluative structure "all the more ... for" accurately?',
        options: [
          'The film is all the more moving for avoiding melodrama.',
          'The film is all the more moving for avoid melodrama.',
          'The film is all more moving because of avoiding melodrama.',
        ],
        correctIndex: 0,
        explanation:
          '"all the more [adjective] for [noun/-ing]" cleanly expresses why a restraint makes something even stronger.',
      },
      {
        id: 'en-c2-m3-q2',
        skill: 'reading',
        prompt: 'If a critic calls a documentary’s ending "equivocal", what does that mean?',
        options: [
          'Completely identical to the beginning',
          'Open to multiple interpretations rather than giving one neat answer',
          'Loud and overly simplistic',
        ],
        correctIndex: 1,
        explanation:
          '"equivocal" means ambiguous or open to differing readings (opposite: unequivocal).',
      },
      {
        id: 'en-c2-m3-q3',
        skill: 'writing',
        prompt: 'Which sentence reads most like a publication-grade CPE cultural review?',
        options: [
          'This book is very good and really interesting to read for many reasons.',
          'Through its startling juxtaposition of diary fragments and urban history, the book mounts an incisive, quietly eloquent portrait of belonging.',
          'I liked this book a lot because the chapters were nice.',
        ],
        correctIndex: 1,
        explanation:
          'Specific craft observation + precise C2 lexis ("juxtaposition", "incisive", "eloquent") elevates the review immediately.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 140,
    checkpointModelAnswer:
      'Few modern documentaries dare to trust silence, which makes "Cities in Pause" all the more compelling for refusing sensational narration. Through an arresting juxtaposition of pre-dawn streetscapes and candid neighborhood interviews, the film crafts the quintessential portrait of how architecture shapes daily solitude. Its argument is remarkably cogent: civic vitality depends less on grand monuments than on unhurried shared spaces. Though deliberately equivocal about whether remote work will revive or hollow out town centers, its incisive eye and understated eloquence linger long after the credits roll.',
  },
};
