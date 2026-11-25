import { UnitGuidedLesson } from '../../types';

export const GERMAN_UNIT_LESSONS: Record<string, UnitGuidedLesson> = {
  'de-a1-m1': {
    estimatedMins: 25,
    overview:
      'Build your German sound system and automatic V2 sentence engine so you can introduce yourself, spell your name cleanly, and catch platform/number announcements on the first try.',
    sections: [
      {
        id: 'de-a1-m1-s1',
        heading: 'V2 Verb-Second Engine & Present Tense Basics',
        explanation:
          'In every German main statement, the conjugated verb is locked in Position 2 — never Position 3. For regular verbs, attach -e (ich), -st (du), -t (er/sie/es/ihr), -en (wir/sie/Sie) to the verb stem.',
        formula: '[Position 1: Subject or Time] + [Position 2: Conjugated Verb] + [Rest]',
        examples: [
          {
            target: 'Ich wohne seit zwei Monaten in München.',
            translation: 'I have been living in Munich for two months.',
            highlight: 'wohne',
          },
          {
            target: 'Heute komme ich aus Berlin und lerne Deutsch.',
            translation: 'Today I come from Berlin and learn German (verb stays in Pos 2!).',
            highlight: 'komme ich',
          },
        ],
        proTip:
          'If you start a sentence with a time or place word like "Heute" or "In Berlin", the subject moves right behind the verb: "Heute arbeite ich" (never "Heute ich arbeite").',
      },
      {
        id: 'de-a1-m1-s2',
        heading: 'W-Fragen vs. Ja/Nein-Fragen & Umlaut Precision',
        explanation:
          'W-questions (Wie, Wo, Woher, Was) keep the verb in Position 2. Yes/No questions move the conjugated verb straight to Position 1. Pronounce ü with rounded lips like "oo" while saying "ee", and ö by rounding lips while saying "ay".',
        formula: 'W-Frage: [W-Word] + [Verb] + [Subject]?  |  Ja/Nein: [Verb] + [Subject] ...?',
        examples: [
          {
            target: 'Wie heißen Sie und wie buchstabiert man Ihren Nachnamen?',
            translation: 'What is your name and how do you spell your surname?',
            highlight: 'Wie heißen Sie',
          },
          {
            target: 'Wohnen Sie in der Nähe vom Bahnhof?',
            translation: 'Do you live near the train station?',
            highlight: 'Wohnen Sie',
          },
        ],
        proTip:
          'In Goethe A1 Hören, watch German two-digit numbers: 24 is "vierundzwanzig" (four-and-twenty), spoken unit-before-tens.',
      },
    ],
    vocabCards: [
      {
        term: 'heißen',
        pronunciation: '[ˈhaɪ̯sn̩]',
        meaning: 'to be called / named',
        example: 'Guten Tag, ich heiße Lukas Weber.',
        exampleNote: 'Good day, my name is Lukas Weber.',
      },
      {
        term: 'wohnen',
        pronunciation: '[ˈvoːnən]',
        meaning: 'to live / reside',
        example: 'Wir wohnen in einer kleinen Wohnung in Hamburg.',
        exampleNote: 'We live in a small apartment in Hamburg.',
      },
      {
        term: 'buchstabieren',
        pronunciation: '[buːxʃtaˈbiːʁən]',
        meaning: 'to spell (letter by letter)',
        example: 'Können Sie Ihren Nachnamen bitte buchstabieren?',
        exampleNote: 'Could you please spell your surname?',
      },
      {
        term: 'die Telefonnummer',
        pronunciation: '[diː teleˈfoːnˌnʊmɐ]',
        meaning: 'the telephone number',
        example: 'Meine Telefonnummer ist null-eins-sieben-zwei.',
        exampleNote: 'My phone number is 0-1-7-2.',
      },
      {
        term: 'die Adresse',
        pronunciation: '[diː aˈdʁɛsə]',
        meaning: 'the street address',
        example: 'Wie ist Ihre aktuelle Adresse in Berlin?',
        exampleNote: 'What is your current address in Berlin?',
      },
      {
        term: 'Entschuldigung',
        pronunciation: '[ɛntˈʃʊldɪɡʊŋ]',
        meaning: 'excuse me / sorry',
        example: 'Entschuldigung, wie spät ist es bitte?',
        exampleNote: 'Excuse me, what time is it please?',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a1-m1-q1',
        skill: 'reading',
        prompt: 'Which sentence follows the German V2 word-order rule correctly?',
        options: [
          'Heute ich wohne in München.',
          'Heute wohne ich in München.',
          'Heute in München ich wohne.',
        ],
        correctIndex: 1,
        explanation:
          'Because "Heute" occupies Position 1, the conjugated verb "wohne" MUST sit in Position 2, pushing the subject "ich" to Position 3.',
      },
      {
        id: 'de-a1-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the station announcement. From which platform and at what time does the train leave today?',
        audioScript:
          'Achtung am Gleis vier: Der Regionalexpress nach München fährt heute nicht um vierzehn Uhr fünfzehn, sondern um vierzehn Uhr dreißig von Gleis sieben ab.',
        options: [
          'Platform 4 at 14:15',
          'Platform 7 at 14:30',
          'Platform 7 at 14:15',
        ],
        correctIndex: 1,
        explanation:
          'Classic Goethe A1 self-correction trap: "nicht um 14:15, sondern um 14:30 von Gleis 7". Always wait for "sondern" or "heute" updates!',
      },
      {
        id: 'de-a1-m1-q3',
        skill: 'speaking',
        prompt: 'How do you politely ask an examiner to repeat or spell something in formal German (Sie)?',
        options: [
          'Buchstabierst du das?',
          'Entschuldigung, können Sie das bitte buchstabieren?',
          'Wie buchstabieren ich?',
        ],
        correctIndex: 1,
        explanation:
          '"Können Sie das bitte buchstabieren?" uses polite "Sie" with the modal verb in Position 1 and infinitive at the end.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 28,
    checkpointModelAnswer:
      'Guten Tag! Ich heiße Anna Müller. Ich bin achtundzwanzig Jahre alt und komme aus Spanien. Jetzt wohne ich in München. Ich spreche Spanisch, Englisch und ein bisschen Deutsch. Von Beruf bin ich Ingenieurin. Meine Hobbys sind Lesen und Schwimmen. Meine Stadt buchstabiert man: M-Ü-N-C-H-E-N.',
  },

  'de-a1-m2': {
    estimatedMins: 25,
    overview:
      'Decode noun genders with suffix rules, trigger Akkusativ accurately on masculine direct objects, and split separable verbs cleanly in daily routines and shopping.',
    sections: [
      {
        id: 'de-a1-m2-s1',
        heading: 'Suffix Gender Radar & Akkusativ Direct Objects',
        explanation:
          'Nouns ending in -ung, -heit, -keit, -schaft, -tät are always feminine (die). Nouns ending in -chen and -lein are always neuter (das). In the Akkusativ (direct object), ONLY masculine articles change: der → den, ein → einen, kein → keinen.',
        formula: 'Masculine Akkusativ: der → den | ein → einen | kein → keinen (die/das stay unchanged)',
        examples: [
          {
            target: 'Ich suche einen guten Termin für morgen.',
            translation: 'I am looking for a good appointment for tomorrow (der Termin → einen Termin).',
            highlight: 'einen guten Termin',
          },
          {
            target: 'Wir haben heute leider kein Angebot für Kaffee.',
            translation: 'Unfortunately we have no special offer for coffee today (das Angebot stays kein).',
            highlight: 'kein Angebot',
          },
        ],
        proTip:
          'Learn every noun with its article AND plural right away (e.g., "der Termin, die Termine"). After "haben", "suchen", "kaufen", "brauchen", always check if the object is masculine!',
      },
      {
        id: 'de-a1-m2-s2',
        heading: 'Separable Verbs & Modal Verb Brackets',
        explanation:
          'Separable verbs like einkaufen, aufstehen, and anfangen split in present-tense main clauses: the conjugated verb sits in Position 2 and the prefix jumps to the very end. With a modal verb (möchten, können, müssen), the separable verb stays together at the end!',
        formula: 'Main: Ich kaufe heute Brot ein.  |  Modal: Ich muss heute Brot einkaufen.',
        examples: [
          {
            target: 'Der Supermarkt macht um zwanzig Uhr zu.',
            translation: 'The supermarket closes at 8:00 p.m.',
            highlight: 'macht ... zu',
          },
          {
            target: 'Ich möchte morgen früh im Zentrum einkaufen.',
            translation: 'I would like to go shopping downtown tomorrow morning.',
            highlight: 'möchte ... einkaufen',
          },
        ],
        proTip:
          'In Start Deutsch 1 Schreiben, always write 3 explicit sentences covering all 3 bullet points plus greeting ("Sehr geehrte Damen und Herren,") and sign-off ("Mit freundlichen Grüßen").',
      },
    ],
    vocabCards: [
      {
        term: 'einkaufen',
        pronunciation: '[ˈaɪ̯nˌkaʊ̯fn̩]',
        meaning: 'to shop / buy groceries (separable)',
        example: 'Am Samstag kaufe ich auf dem Markt ein.',
        exampleNote: 'On Saturday I shop at the market.',
      },
      {
        term: 'die Öffnungszeiten',
        pronunciation: '[diː ˈœfnʊŋsˌtsaɪ̯tn̩]',
        meaning: 'opening hours (plural)',
        example: 'Wie sind die Öffnungszeiten vom Museum?',
        exampleNote: 'What are the museum opening hours?',
      },
      {
        term: 'kosten',
        pronunciation: '[ˈkɔstn̩]',
        meaning: 'to cost',
        example: 'Wie viel kostet ein Zimmer pro Nacht?',
        exampleNote: 'How much does a room cost per night?',
      },
      {
        term: 'das Angebot',
        pronunciation: '[das ˈanɡəˌboːt]',
        meaning: 'special offer / deal',
        example: 'Diese Woche gibt es ein tolles Angebot für Äpfel.',
        exampleNote: 'This week there is a great deal on apples.',
      },
      {
        term: 'der Termin',
        pronunciation: '[deːɐ̯ tɛʁˈmiːn]',
        meaning: 'appointment / scheduled date',
        example: 'Ich habe am Dienstag einen Termin beim Arzt.',
        exampleNote: 'I have an appointment with the doctor on Tuesday.',
      },
      {
        term: 'geöffnet',
        pronunciation: '[ɡəˈʔœfnət]',
        meaning: 'open (for business)',
        example: 'Die Apotheke ist bis achtzehn Uhr geöffnet.',
        exampleNote: 'The pharmacy is open until 6:00 p.m.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a1-m2-q1',
        skill: 'reading',
        passage:
          'Bäckerei Sonnenschein: Montag bis Freitag 06:30–18:00 Uhr. Samstag 07:00–14:00 Uhr. Am Sonntag verkaufen wir frische Brötchen von 08:00 bis 11:30 Uhr. Nachmittags geschlossen.',
        prompt: 'Can you buy bread at Bäckerei Sonnenschein on Sunday at 15:00?',
        options: [
          'Yes, it is open until 18:00.',
          'No, on Sunday it is only open 08:00–11:30 and closed in the afternoon.',
          'No, it is closed all day Sunday.',
        ],
        correctIndex: 1,
        explanation:
          'The notice says "Am Sonntag ... von 08:00 bis 11:30 Uhr. Nachmittags geschlossen." Watch for partial-day traps in Goethe A1 Lesen!',
      },
      {
        id: 'de-a1-m2-q2',
        skill: 'writing',
        prompt: 'Choose the grammatically correct Akkusativ sentence (der Stadtplan = masculine):',
        options: [
          'Ich brauche ein Stadtplan.',
          'Ich brauche einen Stadtplan.',
          'Ich brauche eine Stadtplan.',
        ],
        correctIndex: 1,
        explanation:
          '"brauchen" takes Akkusativ, and masculine "ein" changes to "einen" → "einen Stadtplan".',
      },
      {
        id: 'de-a1-m2-q3',
        skill: 'reading',
        prompt: 'Which sentence correctly uses the separable verb "einkaufen"?',
        options: [
          'Ich einkaufe heute im Supermarkt.',
          'Ich kaufe heute im Supermarkt ein.',
          'Ich muss heute kaufe im Supermarkt ein.',
        ],
        correctIndex: 1,
        explanation:
          'Without a modal verb, "einkaufen" splits: "kaufe" in Position 2 and "ein" at the end of the clause.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 30,
    checkpointModelAnswer:
      'Sehr geehrte Damen und Herren, ich möchte nächsten Monat einen Deutschkurs in Berlin machen. Wann beginnt der nächste A1-Kurs und wie viel kostet er? Wie sind Ihre Öffnungszeiten? Bitte schicken Sie mir Informationen. Mit freundlichen Grüßen, Alex Kim',
  },

  'de-a1-m3': {
    estimatedMins: 25,
    overview:
      'Reschedule appointments politely, master temporal prepositions (am/um/im), and handle Goethe A1 polite requests and travel dialogues effortlessly.',
    sections: [
      {
        id: 'de-a1-m3-s1',
        heading: 'Temporal Prepositions: am · um · im',
        explanation:
          'Use "am" for days and parts of the day (am Montag, am Abend), "um" for exact clock times (um 15:30 Uhr), and "im" for months and seasons (im Juli, im Winter). Exception: "in der Nacht".',
        formula: 'am + Day/Part of day  |  um + Clock time  |  im + Month/Season',
        examples: [
          {
            target: 'Unser Zug fährt am Donnerstag um neun Uhr zwanzig ab.',
            translation: 'Our train departs on Thursday at 9:20.',
            highlight: 'am Donnerstag um neun Uhr zwanzig',
          },
          {
            target: 'Im August möchte ich eine Reise nach Österreich machen.',
            translation: 'In August I would like to take a trip to Austria.',
            highlight: 'Im August',
          },
        ],
        proTip:
          'In Goethe A1 Schreiben & Sprechen, combining "am [Tag] um [Uhrzeit]" immediately signals clean A1 precision.',
      },
      {
        id: 'de-a1-m3-s2',
        heading: 'Polite Imperative (Sie) & "Könnten Sie...?" Requests',
        explanation:
          'For polite formal commands, put the verb in Position 1 followed by "Sie" + "bitte". Even softer and higher-scoring for A1 Sprechen Teil 3 is "Können/Könnten Sie bitte ... + Infinitiv?".',
        formula: 'Imperative: [Verb] + Sie + bitte ...!  |  Soft request: Könnten Sie bitte ... + [Infinitiv]?',
        examples: [
          {
            target: 'Schließen Sie bitte das Fenster! Es ist kalt.',
            translation: 'Please close the window! It is cold.',
            highlight: 'Schließen Sie bitte',
          },
          {
            target: 'Könnten Sie mir bitte einen Stift leihen?',
            translation: 'Could you please lend me a pen?',
            highlight: 'Könnten Sie ... leihen?',
          },
        ],
        proTip:
          'Always answer a partner’s request in Sprechen Teil 3 naturally: "Ja, natürlich, gern!" or "Tut mir leid, ich habe leider keinen Stift."',
      },
    ],
    vocabCards: [
      {
        term: 'vereinbaren',
        pronunciation: '[fɛɐ̯ˈʔaɪ̯nbaːʁən]',
        meaning: 'to arrange / book (an appointment)',
        example: 'Ich möchte einen Termin für nächste Woche vereinbaren.',
        exampleNote: 'I would like to arrange an appointment for next week.',
      },
      {
        term: 'verschieben',
        pronunciation: '[fɛɐ̯ˈʃiːbn̩]',
        meaning: 'to postpone / reschedule',
        example: 'Können wir das Treffen auf Freitag verschieben?',
        exampleNote: 'Can we reschedule the meeting to Friday?',
      },
      {
        term: 'der Bahnhof',
        pronunciation: '[deːɐ̯ ˈbaːnhoːf]',
        meaning: 'the train station',
        example: 'Entschuldigung, wie komme ich zum Hauptbahnhof?',
        exampleNote: 'Excuse me, how do I get to the main train station?',
      },
      {
        term: 'abfahren',
        pronunciation: '[ˈapfaːʁən]',
        meaning: 'to depart (train/bus)',
        example: 'Der Bus nach Köln fährt um zehn Uhr ab.',
        exampleNote: 'The bus to Cologne departs at ten o’clock.',
      },
      {
        term: 'mitbringen',
        pronunciation: '[ˈmɪtbʁɪŋən]',
        meaning: 'to bring along',
        example: 'Bitte bringen Sie Ihren Ausweis zum Termin mit.',
        exampleNote: 'Please bring your ID along to the appointment.',
      },
      {
        term: 'leider',
        pronunciation: '[ˈlaɪ̯dɐ]',
        meaning: 'unfortunately',
        example: 'Ich habe am Dienstag leider keine Zeit.',
        exampleNote: 'Unfortunately I have no time on Tuesday.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a1-m3-q1',
        skill: 'listening',
        prompt: 'Listen to the clinic voicemail. When is the NEW proposed doctor appointment?',
        audioScript:
          'Guten Tag, hier ist die Praxis Dr. Weber. Ihr Termin am Dienstag um zehn Uhr muss leider verschoben werden. Passt es Ihnen am Donnerstag um fünfzehn Uhr dreißig? Bitte rufen Sie zurück.',
        options: [
          'Tuesday at 10:00',
          'Thursday at 15:30',
          'Thursday at 13:30',
        ],
        correctIndex: 1,
        explanation:
          'Tuesday 10:00 was cancelled ("verschoben werden"); the new proposed slot is "am Donnerstag um 15:30".',
      },
      {
        id: 'de-a1-m3-q2',
        skill: 'reading',
        prompt: 'Pick the sentence with ALL three temporal prepositions used accurately:',
        options: [
          'Ich habe im Montag am 14 Uhr einen Kurs um Mai.',
          'Ich habe am Montag um 14 Uhr einen Kurs im Mai.',
          'Ich habe um Montag im 14 Uhr einen Kurs am Mai.',
        ],
        correctIndex: 1,
        explanation:
          'am + day (am Montag), um + clock time (um 14 Uhr), im + month (im Mai).',
      },
      {
        id: 'de-a1-m3-q3',
        skill: 'speaking',
        prompt: 'What is the best polite formal request for Goethe A1 Sprechen Teil 3 (card: "Fenster")?',
        options: [
          'Fenster zu!',
          'Könnten Sie bitte das Fenster öffnen?',
          'Du öffnest das Fenster.',
        ],
        correctIndex: 1,
        explanation:
          'Using "Könnten Sie bitte ... öffnen?" guarantees full communicative marks for polite register.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 32,
    checkpointModelAnswer:
      'Guten Tag Frau Dr. Weber, ich habe am Dienstag um zehn Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil mein Zug verspätet ist. Können wir den Termin auf Donnerstag um fünfzehn Uhr dreißig verschieben? Vielen Dank! Mit freundlichen Grüßen, Tobias Berg',
  },

  'de-a2-m1': {
    estimatedMins: 30,
    overview:
      'Narrate real past trips and daily stories smoothly using Perfekt (haben vs. sein), high-frequency Präteritum (war/hatte/konnte), and clear chronological connectors.',
    sections: [
      {
        id: 'de-a2-m1-s1',
        heading: 'Perfekt: haben vs. sein & Partizip II Placement',
        explanation:
          'In spoken German, past events use Perfekt: conjugated haben or sein in Position 2 + Partizip II at the very end. Use "sein" for movement from A to B (fahren, fliegen, gehen, kommen) and change of state (aufstehen, einschlafen, passieren) plus bleiben/sein.',
        formula: '[Subject] + [haben / sein (Pos 2)] + [Middle field] + [Partizip II (End)]',
        examples: [
          {
            target: 'Wir sind mit dem ICE nach Wien gefahren und haben das Schloss besichtigt.',
            translation: 'We traveled to Vienna by ICE and toured the palace.',
            highlight: 'sind ... gefahren / haben ... besichtigt',
          },
          {
            target: 'Leider ist mein Anschlusszug wegen des Wetters ausgefallen.',
            translation: 'Unfortunately my connecting train was cancelled due to the weather.',
            highlight: 'ist ... ausgefallen',
          },
        ],
        proTip:
          'Verbs ending in -ieren (besichtigen is inseparable be-, fotografieren is -ieren) do NOT take "ge-": besichtigt, fotografiert, übernachtet!',
      },
      {
        id: 'de-a2-m1-s2',
        heading: 'Präteritum for sein/haben/Modals + Story Connectors',
        explanation:
          'Even in casual conversation, Germans prefer Präteritum for sein (war), haben (hatte), and modals (konnte, musste, wollte). Link your story with zuerst, dann, danach, plötzlich, and zum Schluss.',
        formula: 'Zuerst [Verb] ... → Dann [Verb] ... → Danach [Verb] ... → Zum Schluss [Verb] ...',
        examples: [
          {
            target: 'Zuerst war das Wetter super, aber danach mussten wir im Hotel bleiben.',
            translation: 'First the weather was great, but after that we had to stay in the hotel.',
            highlight: 'war / mussten',
          },
          {
            target: 'Zum Schluss hatten wir trotzdem einen unvergesslichen Abend.',
            translation: 'In the end we still had an unforgettable evening.',
            highlight: 'Zum Schluss hatten wir',
          },
        ],
        proTip:
          'In A2 Sprechen Teil 2, using 4 time connectors (zuerst, dann, danach, zum Schluss) automatically creates exam-ready narrative coherence.',
      },
    ],
    vocabCards: [
      {
        term: 'erleben',
        pronunciation: '[ɛɐ̯ˈleːbn̩]',
        meaning: 'to experience (inseparable: hat erlebt)',
        example: 'Im Urlaub haben wir viele spannende Dinge erlebt.',
        exampleNote: 'On vacation we experienced many exciting things.',
      },
      {
        term: 'besichtigen',
        pronunciation: '[bəˈzɪçtɪɡn̩]',
        meaning: 'to tour / sightsee (hat besichtigt)',
        example: 'Am zweiten Tag haben wir die Altstadt besichtigt.',
        exampleNote: 'On the second day we toured the old town.',
      },
      {
        term: 'übernachten',
        pronunciation: '[yːbɐˈnaxtn̩]',
        meaning: 'to stay overnight (hat übernachtet)',
        example: 'Wir haben in einer gemütlichen Pension übernachtet.',
        exampleNote: 'We stayed overnight in a cozy guesthouse.',
      },
      {
        term: 'die Verspätung',
        pronunciation: '[diː fɛɐ̯ˈʃpɛːtʊŋ]',
        meaning: 'the delay',
        example: 'Der Zug hatte dreißig Minuten Verspätung.',
        exampleNote: 'The train had a 30-minute delay.',
      },
      {
        term: 'ausfallen',
        pronunciation: '[ˈaʊ̯sfalən]',
        meaning: 'to be cancelled (ist ausgefallen)',
        example: 'Wegen des Sturms ist die Bootstour ausgefallen.',
        exampleNote: 'Because of the storm the boat tour was cancelled.',
      },
      {
        term: 'sich freuen auf',
        pronunciation: '[zɪç ˈfʁɔɪ̯ən aʊ̯f]',
        meaning: 'to look forward to (+ Akkusativ)',
        example: 'Ich freue mich schon sehr auf das Wochenende.',
        exampleNote: 'I am already looking forward a lot to the weekend.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a2-m1-q1',
        skill: 'reading',
        prompt: 'Which Perfekt sentence uses the correct auxiliary (haben vs. sein) and participle?',
        options: [
          'Wir haben nach Salzburg gefahren und sind ein Museum gebesichtigt.',
          'Wir sind nach Salzburg gefahren und haben ein Museum besichtigt.',
          'Wir sind nach Salzburg gefahrt und haben ein Museum besichtigen.',
        ],
        correctIndex: 1,
        explanation:
          '"fahren" (movement A→B) uses "sein" + "gefahren"; "besichtigen" (inseparable prefix be-) takes "haben" + "besichtigt" without "ge-".',
      },
      {
        id: 'de-a2-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the travel recount. Why did they arrive at the hotel late?',
        audioScript:
          'Unser Wochenende am Bodensee war super! Zuerst sind wir am Freitag mit dem Zug gefahren, aber der Regionalzug ist ausgefallen und wir hatten eine Stunde Verspätung. Am Samstag haben wir dann Konstanz besichtigt.',
        options: [
          'They missed the bus in Konstanz.',
          'The regional train was cancelled and they had a one-hour delay.',
          'The hotel lost their reservation.',
        ],
        correctIndex: 1,
        explanation:
          'They explain: "der Regionalzug ist ausgefallen und wir hatten eine Stunde Verspätung."',
      },
      {
        id: 'de-a2-m1-q3',
        skill: 'speaking',
        prompt: 'Which sentence sounds most natural for spoken German A2 storytelling?',
        options: [
          'Danach wir waren sehr müde.',
          'Danach waren wir sehr müde und konnten nicht mehr spazieren gehen.',
          'Danach sind wir sehr müde gewesen und haben gekonnt nicht gehen.',
        ],
        correctIndex: 1,
        explanation:
          'Use Präteritum "waren" and "konnten" (with V2 inversion after "Danach") rather than clunky Perfekt forms of sein/modals.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 45,
    checkpointModelAnswer:
      'Letzten Sommer bin ich mit meiner Schwester nach Wien gefahren. Zuerst hatte unser Zug zwanzig Minuten Verspätung, aber das war kein Problem. Wir haben in einem kleinen Hotel im Zentrum übernachtet. Am Samstag haben wir das Schloss Schönbrunn besichtigt und viel erlebt. Leider ist am Sonntag die Bootstour wegen Regen ausgefallen, deshalb waren wir im Museum. Zum Schluss haben wir Sachertorte gegessen und uns sehr gefreut.',
  },

  'de-a2-m2': {
    estimatedMins: 30,
    overview:
      'Unlock the Dativ case, choose confidently between Wo (Dativ) and Wohin (Akkusativ) with two-way prepositions, and send verbs cleanly to the end after weil, dass, and wenn.',
    sections: [
      {
        id: 'de-a2-m2-s1',
        heading: 'Dativ Verbs & Two-Way Prepositions (Wo vs. Wohin)',
        explanation:
          'Key verbs like helfen, danken, gefallen, gehören, and passen ALWAYS require Dativ (dem / der / dem / den + -n). With Wechselpräpositionen (in, auf, an, neben, über, unter, vor, hinter, zwischen), static location (Wo?) takes Dativ while directional motion (Wohin?) takes Akkusativ.',
        formula: 'Dativ: der/das → dem | die → der | Plural → den + -n  |  Wo? = Dativ, Wohin? = Akkusativ',
        examples: [
          {
            target: 'Die neue Wohnung gefällt mir sehr, aber sie liegt neben dem Bahnhof.',
            translation: 'I really like the new apartment, though it is located next to the station (Wo? → Dativ).',
            highlight: 'gefällt mir / neben dem Bahnhof',
          },
          {
            target: 'Ich stelle den Tisch ins Wohnzimmer, jetzt steht er im Wohnzimmer.',
            translation: 'I put the table into the living room (Akk); now it stands in the living room (Dat).',
            highlight: 'ins → im',
          },
        ],
        proTip:
          'Never forget the plural -n in Dativ: "mit den Freunden", "in den Zimmern"!',
      },
      {
        id: 'de-a2-m2-s2',
        heading: 'Subordinate Clauses with weil, dass, wenn (Verb-Final)',
        explanation:
          'Subordinating conjunctions (weil, dass, wenn, obwohl) kick the conjugated verb to the VERY END of the clause, separated from the main clause by a comma. If the subordinate clause comes first, the main clause immediately starts with its verb (Verb-Comma-Verb!).',
        formula: 'Main, weil [Subject] ... [Verb].   |   Wenn [Subject] ... [Verb], [Main Verb] [Subject] ...',
        examples: [
          {
            target: 'Ich muss die Einladung leider absagen, weil ich am Samstag umziehe.',
            translation: 'I must unfortunately decline the invitation because I am moving on Saturday.',
            highlight: 'weil ich ... umziehe',
          },
          {
            target: 'Wenn du Zeit hast, können wir zusammen Kaffee trinken.',
            translation: 'If you have time, we can have coffee together (Verb-Comma-Verb!).',
            highlight: 'hast, können',
          },
        ],
        proTip:
          'Adding just two accurate "weil/dass/wenn" clauses in Goethe A2 Schreiben noticeably boosts your grammar band score.',
      },
    ],
    vocabCards: [
      {
        term: 'gefallen',
        pronunciation: '[ɡəˈfalən]',
        meaning: 'to please / to be liked by (+ Dativ)',
        example: 'Das helle Wohnzimmer gefällt uns sofort.',
        exampleNote: 'We like the bright living room right away.',
      },
      {
        term: 'gehören',
        pronunciation: '[ɡəˈhøːʁən]',
        meaning: 'to belong to (+ Dativ)',
        example: 'Gehört dieser Schlüssel dem Nachbarn?',
        exampleNote: 'Does this key belong to the neighbor?',
      },
      {
        term: 'empfehlen',
        pronunciation: '[ɛmpˈfeːlən]',
        meaning: 'to recommend (er empfiehlt)',
        example: 'Kannst du mir ein gutes Café empfehlen?',
        exampleNote: 'Can you recommend a good café to me?',
      },
      {
        term: 'absagen',
        pronunciation: '[ˈapzaːɡn̩]',
        meaning: 'to cancel / decline',
        example: 'Es tut mir leid, aber ich muss den Termin absagen.',
        exampleNote: 'I am sorry, but I have to cancel the appointment.',
      },
      {
        term: 'die Einladung',
        pronunciation: '[diː ˈaɪ̯nlaːdʊŋ]',
        meaning: 'the invitation',
        example: 'Vielen Dank für die nette Einladung zu deiner Party!',
        exampleNote: 'Many thanks for the lovely invitation to your party!',
      },
      {
        term: 'umziehen',
        pronunciation: '[ˈʊmtsiːən]',
        meaning: 'to move house (ist umgezogen)',
        example: 'Nächsten Monat ziehen wir in eine größere Wohnung um.',
        exampleNote: 'Next month we are moving into a larger apartment.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a2-m2-q1',
        skill: 'reading',
        prompt: 'Choose the accurate subordinate clause with "weil":',
        options: [
          'Ich sage ab, weil ich habe keine Zeit.',
          'Ich sage ab, weil ich keine Zeit habe.',
          'Ich sage ab, weil habe ich keine Zeit.',
        ],
        correctIndex: 1,
        explanation:
          'After "weil", the conjugated verb "habe" MUST move to the end of the clause.',
      },
      {
        id: 'de-a2-m2-q2',
        skill: 'reading',
        prompt: 'Fill the blank for static location (Wo?): "Die Lampe hängt über ___ Tisch (der Tisch)."',
        options: ['den', 'dem', 'der'],
        correctIndex: 1,
        explanation:
          '"hängen" here describes static position (Wo?), so "über" takes Dativ: der Tisch → dem Tisch.',
      },
      {
        id: 'de-a2-m2-q3',
        skill: 'writing',
        prompt: 'Which reply uses the Dativ verb "gefallen" correctly?',
        options: [
          'Die Wohnung gefällt mich sehr.',
          'Die Wohnung gefällt mir sehr.',
          'Ich gefalle die Wohnung sehr.',
        ],
        correctIndex: 1,
        explanation:
          'Literally "The apartment pleases to-me": the thing liked is the subject, and the person takes Dativ ("mir").',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 40,
    checkpointModelAnswer:
      'Liebe Lena, vielen Dank für die tolle Einladung zu deinem Geburtstag! Leider muss ich absagen, weil ich am Samstag in meine neue Wohnung umziehe. Die Wohnung liegt neben dem Park und gefällt mir sehr gut. Wenn ich fertig bin, lade ich dich gern zum Kaffee ein. Viele Grüße, Sam',
  },

  'de-a2-m3': {
    estimatedMins: 25,
    overview:
      'Negotiate plans smoothly with polite suggestions, reflexive verbs, and comparisons to excel in Goethe A2 Sprechen Teil 3.',
    sections: [
      {
        id: 'de-a2-m3-s1',
        heading: 'Negotiating Plans & Polite Suggestions',
        explanation:
          'In A2 Sprechen Teil 3, you and a partner must agree on a date, time, and activity. Use natural proposal frames ("Wollen wir...?", "Könnten wir...?", "Wie wäre es am...?") and balanced responses ("Gute Idee!", "Das passt mir leider nicht, aber...").',
        formula: 'Propose: Wie wäre es mit + Dativ? | Agree: Einverstanden! | Counter: Am ... geht es besser.',
        examples: [
          {
            target: 'Wollen wir am Freitagabend das Geschenk zusammen besorgen?',
            translation: 'Shall we get the gift together on Friday evening?',
            highlight: 'Wollen wir ... besorgen?',
          },
          {
            target: 'Samstag passt mir leider nicht, aber am Sonntag habe ich ab vierzehn Uhr Zeit.',
            translation: 'Saturday doesn’t work for me unfortunately, but on Sunday I’m free from 2 p.m.',
            highlight: 'passt mir leider nicht, aber',
          },
        ],
        proTip:
          'Never just say "Nein" in a calendar negotiation — always pair a refusal with a concrete counter-proposal!',
      },
      {
        id: 'de-a2-m3-s2',
        heading: 'Comparatives, Superlatives & Reflexive Verbs',
        explanation:
          'Form comparatives with -er + als ("günstiger als") and equal comparisons with so ... wie ("so schön wie"). Reflexive verbs like sich treffen and sich interessieren für take a reflexive pronoun matching the subject (mich/dich/sich/uns).',
        formula: 'Comparative: [Adj]-er + als  |  Superlative: am [Adj]-sten  |  wir treffen uns',
        examples: [
          {
            target: 'Ein Kochbuch ist persönlicher als ein Gutschein und am besten geeignet.',
            translation: 'A cookbook is more personal than a voucher and best suited.',
            highlight: 'persönlicher als / am besten',
          },
          {
            target: 'Wann treffen wir uns vor dem Café?',
            translation: 'When shall we meet in front of the café?',
            highlight: 'treffen wir uns',
          },
        ],
        proTip:
          'Watch irregular comparatives: gut → besser → am besten; gern → lieber → am liebsten; viel → mehr → am meisten!',
      },
    ],
    vocabCards: [
      {
        term: 'vorschlagen',
        pronunciation: '[ˈfoːɐ̯ʃlaːɡn̩]',
        meaning: 'to suggest / propose (ich schlage vor)',
        example: 'Ich schlage vor, dass wir uns um fünf Uhr treffen.',
        exampleNote: 'I suggest that we meet at five o’clock.',
      },
      {
        term: 'abmachen',
        pronunciation: '[ˈapmaxən]',
        meaning: 'to arrange / agree on',
        example: 'Super, dann machen wir Sonntag zehn Uhr ab!',
        exampleNote: 'Great, then let’s agree on Sunday at 10 o’clock!',
      },
      {
        term: 'einverstanden',
        pronunciation: '[ˈaɪ̯nfɛɐ̯ˌʃtandn̩]',
        meaning: 'agreed / okay with it',
        example: 'Einverstanden, ich bringe den Kuchen mit.',
        exampleNote: 'Agreed, I will bring the cake.',
      },
      {
        term: 'das Geschenk',
        pronunciation: '[das ɡəˈʃɛŋk]',
        meaning: 'the gift / present',
        example: 'Was für ein Geschenk sollen wir für Paul kaufen?',
        exampleNote: 'What kind of gift should we buy for Paul?',
      },
      {
        term: 'organisieren',
        pronunciation: '[ɔʁɡaniˈziːʁən]',
        meaning: 'to organize',
        example: 'Wir möchten eine kleine Überraschungsparty organisieren.',
        exampleNote: 'We would like to organize a small surprise party.',
      },
      {
        term: 'besorgen',
        pronunciation: '[bəˈzɔʁɡn̩]',
        meaning: 'to pick up / get / purchase',
        example: 'Kannst du die Getränke und die Blumen besorgen?',
        exampleNote: 'Can you pick up the drinks and the flowers?',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-a2-m3-q1',
        skill: 'speaking',
        prompt: 'Which phrase uses the irregular comparative of "gern" accurately?',
        options: [
          'Ich gehe gerner ins Kino als ins Theater.',
          'Ich gehe lieber ins Kino als ins Theater.',
          'Ich gehe besser ins Kino wie ins Theater.',
        ],
        correctIndex: 1,
        explanation:
          '"gern" becomes "lieber" (more gladly) and comparative comparisons always use "als", never "wie".',
      },
      {
        id: 'de-a2-m3-q2',
        skill: 'reading',
        prompt: 'Choose the correct reflexive sentence for "we meet at 6 p.m.":',
        options: [
          'Wir treffen sich um achtzehn Uhr.',
          'Wir treffen uns um achtzehn Uhr.',
          'Wir treffen wir um achtzehn Uhr.',
        ],
        correctIndex: 1,
        explanation:
          'For "wir", the reflexive pronoun is "uns": "Wir treffen uns".',
      },
      {
        id: 'de-a2-m3-q3',
        skill: 'speaking',
        prompt: 'Your partner suggests Friday at 17:00, when you are working. What is the strongest A2 response?',
        options: [
          'Nein.',
          'Am Freitag um siebzehn Uhr arbeite ich leider. Wie wäre es am Samstagvormittag?',
          'Freitag nicht gut.',
        ],
        correctIndex: 1,
        explanation:
          'Giving a brief reason + polite counter-suggestion keeps the collaborative dialogue moving smoothly.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 45,
    checkpointModelAnswer:
      'Hallo! Wollen wir für Maria eine Überraschungsparty organisieren? Ich schlage vor, dass wir uns am Samstag um vierzehn Uhr im Zentrum treffen, um das Geschenk zu besorgen. Am Freitag habe ich leider keine Zeit, weil ich lange arbeite. Ein Buch finde ich persönlicher als Blumen. Bist du einverstanden? Super, dann machen wir das so ab!',
  },

  'de-b1-m1': {
    estimatedMins: 35,
    overview:
      'Upgrade from simple sentences to B1 argumentation using concession (obwohl vs. trotzdem), purpose clauses (um...zu vs. damit), and accurate relative clauses.',
    sections: [
      {
        id: 'de-b1-m1-s1',
        heading: 'Concession Contrast: obwohl (Verb-End) vs. trotzdem (Verb-2)',
        explanation:
          'Both express "although / nevertheless", but their syntax differs completely: "obwohl" is a subordinator (verb goes to the END), while "trotzdem" / "allerdings" are conjunctive adverbs in Position 1 (verb comes IMMEDIATELY next in Position 2).',
        formula: 'obwohl + Subject ... [Verb]   VS.   Trotzdem + [Verb] + Subject ...',
        examples: [
          {
            target: 'Obwohl Homeoffice viel Zeit spart, vermissen manche den persönlichen Kontakt.',
            translation: 'Although working from home saves a lot of time, some miss personal contact.',
            highlight: 'Obwohl ... spart, vermissen',
          },
          {
            target: 'Homeoffice spart viel Zeit; trotzdem vermissen manche den persönlichen Kontakt.',
            translation: 'Working from home saves a lot of time; nevertheless some miss personal contact.',
            highlight: 'trotzdem vermissen',
          },
        ],
        proTip:
          'Mixing up "obwohl" and "trotzdem" word order is the #1 B1 Schreiben error. Memorize: obwohl = verb at end, trotzdem = verb right after!',
      },
      {
        id: 'de-b1-m1-s2',
        heading: 'Purpose Clauses (um...zu vs. damit) & Relative Clauses',
        explanation:
          'Use "um ... zu + Infinitiv" when BOTH clauses share the same subject. Use "damit + Verb-End" when subjects differ. In relative clauses, pick the relative pronoun by gender/number of the noun, and case by its role inside the relative clause!',
        formula: 'Same subject: um ... zu + Inf  |  Different subjects: damit ... [Verb]  |  Noun, der/die/das/den/dem ... [Verb]',
        examples: [
          {
            target: 'Ich lerne täglich, um die B1-Prüfung sicher zu bestehen.',
            translation: 'I study daily in order to pass the B1 exam confidently (same subject: ich).',
            highlight: 'um ... zu bestehen',
          },
          {
            target: 'Das ist eine Erfahrung, die mein Leben stark beeinflusst hat.',
            translation: 'That is an experience that strongly influenced my life.',
            highlight: 'die ... beeinflusst hat',
          },
        ],
        proTip:
          'In Goethe B1 Lesen Teil 4 (Pro/Contra forum), scan for concession pivots like "allerdings", "jedoch", and "trotzdem" — the author’s TRUE stance usually comes AFTER the pivot!',
      },
    ],
    vocabCards: [
      {
        term: 'der Vorteil',
        pronunciation: '[deːɐ̯ ˈfoːɐ̯taɪ̯l]',
        meaning: 'the advantage / benefit',
        example: 'Ein großer Vorteil von Online-Kursen ist die Flexibilität.',
        exampleNote: 'A major advantage of online courses is flexibility.',
      },
      {
        term: 'der Nachteil',
        pronunciation: '[deːɐ̯ ˈnaxtaɪ̯l]',
        meaning: 'the disadvantage / drawback',
        example: 'Ein Nachteil ist allerdings, dass man oft allein lernt.',
        exampleNote: 'One drawback, however, is that you often study alone.',
      },
      {
        term: 'allerdings',
        pronunciation: '[ˈalɐdɪŋs]',
        meaning: 'however / admittedly',
        example: 'Das Konzept klingt gut; allerdings ist es sehr teuer.',
        exampleNote: 'The concept sounds good; however, it is very expensive.',
      },
      {
        term: 'beeinflussen',
        pronunciation: '[bəˈʔaɪ̯nflʊsn̩]',
        meaning: 'to influence',
        example: 'Soziale Medien beeinflussen unseren Alltag enorm.',
        exampleNote: 'Social media influence our daily life enormously.',
      },
      {
        term: 'die Erfahrung',
        pronunciation: '[diː ɛɐ̯ˈfaːʁʊŋ]',
        meaning: 'the experience',
        example: 'Aus eigener Erfahrung weiß ich, wie hilfreich tägliches Hören ist.',
        exampleNote: 'From my own experience I know how helpful daily listening is.',
      },
      {
        term: 'vermeiden',
        pronunciation: '[fɛɐ̯ˈmaɪ̯dn̩]',
        meaning: 'to avoid',
        example: 'Durch gute Planung lassen sich unnötige Fehler vermeiden.',
        exampleNote: 'With good planning unnecessary mistakes can be avoided.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b1-m1-q1',
        skill: 'reading',
        passage:
          'Viele meinen, bargeldloses Bezahlen sei unsicher. Ich sehe zwar, dass ältere Menschen manchmal Schwierigkeiten haben; allerdings überwiegen für mich klar die Vorteile, weil man schneller und hygienischer bezahlt.',
        prompt: 'What is the writer’s overall stance on cashless payment?',
        options: [
          'Against it because older people struggle.',
          'In favor of it, despite acknowledging one difficulty.',
          'Undecided between cash and card.',
        ],
        correctIndex: 1,
        explanation:
          'Notice the pivot "zwar ... allerdings": the writer concedes a drawback, then clearly supports cashless payment ("überwiegen für mich klar die Vorteile").',
      },
      {
        id: 'de-b1-m1-q2',
        skill: 'writing',
        prompt: 'Which sentence correctly expresses purpose when the two clauses have DIFFERENT subjects?',
        options: [
          'Ich spreche langsam, um meine Großmutter mich zu verstehen.',
          'Ich spreche langsam, damit meine Großmutter mich versteht.',
          'Ich spreche langsam, damit meine Großmutter versteht mich.',
        ],
        correctIndex: 1,
        explanation:
          'Different subjects ("ich" vs. "meine Großmutter") require "damit" with the conjugated verb at the end.',
      },
      {
        id: 'de-b1-m1-q3',
        skill: 'reading',
        prompt: 'Select the accurate relative clause (der Kollege = masculine, direct object inside clause):',
        options: [
          'Das ist der Kollege, der ich gestern getroffen habe.',
          'Das ist der Kollege, den ich gestern getroffen habe.',
          'Das ist der Kollege, dem ich gestern getroffen habe.',
        ],
        correctIndex: 1,
        explanation:
          '"treffen" takes Akkusativ; masculine Akkusativ relative pronoun is "den".',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 75,
    checkpointModelAnswer:
      'Zum Thema digitale Bücher möchte ich meine Meinung äußern. Aus eigener Erfahrung weiß ich, dass E-Books viele Vorteile haben, weil man unterwegs leicht mehrere Bücher mitnehmen kann. Obwohl ich das sehr praktisch finde, hat digitales Lesen allerdings auch Nachteile: Die Augen werden schneller müde. Trotzdem nutze ich oft E-Books, um im Urlaub Gepäck zu sparen. Meiner Meinung nach sollte jeder die Lösung wählen, die am besten zum eigenen Alltag passt.',
  },

  'de-b1-m2': {
    estimatedMins: 35,
    overview:
      'Structure persuasive 3-minute Goethe B1 presentations, master Passiv & Konjunktiv II, and attribute multi-speaker opinions accurately in radio talkshows.',
    sections: [
      {
        id: 'de-b1-m2-s1',
        heading: 'Passiv (werden + Partizip II) & Konjunktiv II',
        explanation:
          'Use Passiv when the action matters more than who performs it: werden (conjugated) + Partizip II at the end. Use Konjunktiv II (würde + Infinitiv, wäre, hätte, könnte, sollte) for polite wishes, advice, and hypothetical situations.',
        formula: 'Passiv: [Subject] + wird/werden ... [Partizip II]  |  Konj II: Ich würde / könnte / sollte ... [Inf]',
        examples: [
          {
            target: 'In vielen Städten werden immer mehr Fahrradwege gebaut.',
            translation: 'In many cities more and more bike lanes are being built.',
            highlight: 'werden ... gebaut',
          },
          {
            target: 'Wenn die Tickets günstiger wären, würden mehr Menschen Bus fahren.',
            translation: 'If tickets were cheaper, more people would take the bus.',
            highlight: 'wären, würden ... fahren',
          },
        ],
        proTip:
          'Combine "einerseits ... andererseits" + one Passiv sentence in your B1 Sprechen presentation to immediately sound structured and mature.',
      },
      {
        id: 'de-b1-m2-s2',
        heading: 'Goethe B1 Presentation Blueprint & Genitiv Intro',
        explanation:
          'Follow the 5-slide B1 Sprechen framework: (1) Thema vorstellen, (2) Persönliche Erfahrung, (3) Situation im Heimatland, (4) Vor- und Nachteile (einerseits/andererseits), (5) Eigene Meinung & Abschluss. Prepositions wegen and trotz introduce Genitiv (trotz des Regens, wegen der Umwelt).',
        formula: 'Meiner Meinung nach + [Verb] ... | Einerseits [Verb] ..., andererseits [Verb] ...',
        examples: [
          {
            target: 'Trotz des hohen Preises lohnt sich eine Bahncard für Pendler.',
            translation: 'Despite the high price, a rail pass is worthwhile for commuters.',
            highlight: 'Trotz des hohen Preises',
          },
          {
            target: 'Zusammenfassend möchte ich sagen, dass sich der Verzicht auf das Auto lohnt.',
            translation: 'In summary, I would like to say that giving up the car is worthwhile.',
            highlight: 'Zusammenfassend',
          },
        ],
        proTip:
          'In Hören Teil 4 (radio talkshow), create a 3-column mental tally (Moderator / Gast 1 / Gast 2) and catch voice transitions before deciding who holds which opinion.',
      },
    ],
    vocabCards: [
      {
        term: 'zusammenfassen',
        pronunciation: '[tsuˈzamənˌfasn̩]',
        meaning: 'to summarize',
        example: 'Zum Schluss möchte ich die wichtigsten Punkte zusammenfassen.',
        exampleNote: 'Finally I would like to summarize the main points.',
      },
      {
        term: 'einerseits ... andererseits',
        pronunciation: '[ˈaɪ̯nɐzaɪ̯ts ... ˈandəʁɐzaɪ̯ts]',
        meaning: 'on the one hand ... on the other hand',
        example: 'Einerseits spart man Geld, andererseits braucht man mehr Zeit.',
        exampleNote: 'On the one hand you save money, on the other hand you need more time.',
      },
      {
        term: 'meiner Meinung nach',
        pronunciation: '[ˈmaɪ̯nɐ ˈmaɪ̯nʊŋ naːx]',
        meaning: 'in my opinion (followed directly by Verb!)',
        example: 'Meiner Meinung nach sollte jeder öfter Fahrrad fahren.',
        exampleNote: 'In my opinion everyone should cycle more often.',
      },
      {
        term: 'verzichten auf',
        pronunciation: '[fɛɐ̯ˈtsɪçtn̩ aʊ̯f]',
        meaning: 'to do without / give up (+ Akkusativ)',
        example: 'Viele junge Leute verzichten bewusst auf ein eigenes Auto.',
        exampleNote: 'Many young people consciously do without their own car.',
      },
      {
        term: 'sich lohnen',
        pronunciation: '[zɪç ˈloːnən]',
        meaning: 'to be worthwhile / pay off',
        example: 'Es lohnt sich, frühzeitig für die Umwelt aktiv zu werden.',
        exampleNote: 'It is worthwhile to become active for the environment early.',
      },
      {
        term: 'die Umwelt',
        pronunciation: '[diː ˈʊmvɛlt]',
        meaning: 'the environment',
        example: 'Weniger Flugreisen schützen die Umwelt nachhaltig.',
        exampleNote: 'Fewer flights protect the environment sustainably.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b1-m2-q1',
        skill: 'reading',
        prompt: 'Which sentence correctly uses "Meiner Meinung nach" at the start?',
        options: [
          'Meiner Meinung nach, wir sollten mehr recyceln.',
          'Meiner Meinung nach sollten wir mehr recyceln.',
          'Meiner Meinung nach wir mehr recyceln sollten.',
        ],
        correctIndex: 1,
        explanation:
          '"Meiner Meinung nach" occupies Position 1 (NO comma!), so the conjugated verb "sollten" must follow immediately in Position 2.',
      },
      {
        id: 'de-b1-m2-q2',
        skill: 'listening',
        prompt: 'Listen to the radio discussion clip. What does Dr. Klein believe about car-free city centers?',
        audioScript:
          'Moderatorin: Frau Dr. Klein, sollten Innenstädte komplett autofrei werden? Dr. Klein: Einerseits würde die Luftqualität sofort besser werden, andererseits bräuchten wir zuerst deutlich mehr Busse und Bahnen, sonst werden ältere Menschen ausgeschlossen.',
        options: [
          'Cars should be banned immediately without any other changes.',
          'Air quality would improve, but better public transport is needed first.',
          'Car-free city centers have no environmental benefits.',
        ],
        correctIndex: 1,
        explanation:
          'Dr. Klein balances both sides: better air quality ("einerseits"), but more buses/trains are needed first ("andererseits").',
      },
      {
        id: 'de-b1-m2-q3',
        skill: 'writing',
        prompt: 'Select the accurate Present Passive sentence:',
        options: [
          'Hier wird viel Papier recyceln.',
          'Hier wird viel Papier recycelt.',
          'Hier ist viel Papier recycelt werden.',
        ],
        correctIndex: 1,
        explanation:
          'Present Passive = conjugated "werden" (wird) + Partizip II (recycelt).',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 65,
    checkpointModelAnswer:
      'Heute spreche ich über das Thema „Autofreie Innenstädte“. Persönlich fahre ich meistens mit dem Fahrrad zur Arbeit. In meinem Heimatland wird das Auto noch sehr häufig genutzt, obwohl die Straßen oft voll sind. Einerseits würde eine autofreie Innenstadt die Umwelt schützen und weniger Lärm verursachen. Andererseits könnten manche Geschäfte weniger Kunden erreichen. Meiner Meinung nach lohnt es sich, öfter auf das Auto zu verzichten, wenn der öffentliche Verkehr gut ausgebaut wird. Zusammenfassend bin ich für autofreie Zonen.',
  },

  'de-b1-m3': {
    estimatedMins: 30,
    overview:
      'Master formal German correspondence, infinitive clauses (ohne...zu, anstatt...zu), two-part connectors, and official rule/policy texts for B1 certification.',
    sections: [
      {
        id: 'de-b1-m3-s1',
        heading: 'Infinitive Clauses (zu, ohne...zu, anstatt...zu) & Two-Part Connectors',
        explanation:
          'Use "ohne ... zu + Infinitiv" (without doing) and "anstatt ... zu + Infinitiv" (instead of doing) when the subject is identical. Elevate B1 essays with paired connectors: sowohl ... als auch (both...and), weder ... noch (neither...nor), nicht nur ... sondern auch.',
        formula: 'ohne/anstatt ... zu + [Infinitiv]   |   sowohl [A] als auch [B]   |   weder [A] noch [B]',
        examples: [
          {
            target: 'Anstatt lange zu warten, habe ich direkt eine höfliche Rückmeldung geschickt.',
            translation: 'Instead of waiting long, I immediately sent a polite reply.',
            highlight: 'Anstatt ... zu warten',
          },
          {
            target: 'Im Lesesaal sind weder Essen noch lautes Telefonieren gestattet.',
            translation: 'In the reading room neither eating nor loud phone calls are permitted.',
            highlight: 'weder ... noch',
          },
        ],
        proTip:
          'For separable verbs, "zu" slides BETWEEN prefix and stem: "abzusagen", "mitzubringen", "teilzunehmen"!',
      },
      {
        id: 'de-b1-m3-s2',
        heading: 'Formal Apology & Policy Register (B1 Schreiben Teil 3)',
        explanation:
          'B1 Schreiben Teil 3 demands crisp formal register (Sie): state the reason clearly, apologize with "sich entschuldigen für" / "um Verständnis bitten", and propose a concrete solution or ask for "Rückmeldung".',
        formula: 'Sehr geehrte(r) Frau/Herr [Name], ... Ich bitte um Ihr Verständnis. ... Mit freundlichen Grüßen',
        examples: [
          {
            target: 'Ich möchte mich vielmals dafür entschuldigen, dass ich den Termin verpasst habe.',
            translation: 'I would like to apologize sincerely for missing the appointment.',
            highlight: 'mich ... dafür entschuldigen, dass',
          },
          {
            target: 'Über eine kurze Rückmeldung würde ich mich sehr freuen.',
            translation: 'I would greatly appreciate a brief reply.',
            highlight: 'Über eine kurze Rückmeldung',
          },
        ],
        proTip:
          'Watch official notices in B1 Lesen Teil 5: "untersagt" = forbidden, "gestattet" = allowed, "verpflichtend" = mandatory.',
      },
    ],
    vocabCards: [
      {
        term: 'die Regelung',
        pronunciation: '[diː ˈʁeːɡəlʊŋ]',
        meaning: 'the rule / regulation',
        example: 'Die neue Regelung gilt ab dem ersten Oktober.',
        exampleNote: 'The new regulation applies from October first.',
      },
      {
        term: 'gestattet',
        pronunciation: '[ɡəˈʃtatət]',
        meaning: 'permitted / allowed (formal)',
        example: 'Das Fotografieren ohne Blitz ist im Museum gestattet.',
        exampleNote: 'Taking photos without flash is permitted in the museum.',
      },
      {
        term: 'sich entschuldigen für',
        pronunciation: '[zɪç ɛntˈʃʊldɪɡn̩ fyːɐ̯]',
        meaning: 'to apologize for (+ Akkusativ)',
        example: 'Ich entschuldige mich herzlich für die späte Nachricht.',
        exampleNote: 'I apologize sincerely for the late message.',
      },
      {
        term: 'das Verständnis',
        pronunciation: '[das fɛɐ̯ˈʃtɛntnɪs]',
        meaning: 'understanding / sympathy',
        example: 'Vielen Dank im Voraus für Ihr Verständnis!',
        exampleNote: 'Thank you in advance for your understanding!',
      },
      {
        term: 'die Rückmeldung',
        pronunciation: '[diː ˈʁʏkˌmɛldʊŋ]',
        meaning: 'reply / feedback / response',
        example: 'Bitte geben Sie mir bis Freitag eine kurze Rückmeldung.',
        exampleNote: 'Please give me a brief reply by Friday.',
      },
      {
        term: 'untersagt',
        pronunciation: '[ˈʊntɐzaːkt]',
        meaning: 'prohibited / strictly forbidden',
        example: 'Das Rauchen auf dem gesamten Gelände ist streng untersagt.',
        exampleNote: 'Smoking on the entire premises is strictly prohibited.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b1-m3-q1',
        skill: 'reading',
        passage:
          'Hausordnung: Das Abstellen von Fahrrädern im Treppenhaus ist aus Sicherheitsgründen untersagt. Die Nutzung des Innenhofs ist hingegen allen Mietern gestattet.',
        prompt: 'According to the building rules, where may tenants leave bicycles?',
        options: [
          'In the stairwell (Treppenhaus)',
          'In the inner courtyard (Innenhof), not in the stairwell',
          'Neither in the stairwell nor in the courtyard',
        ],
        correctIndex: 1,
        explanation:
          '"untersagt" means forbidden (Treppenhaus), while "gestattet" means permitted (Innenhof).',
      },
      {
        id: 'de-b1-m3-q2',
        skill: 'writing',
        prompt: 'How do you put the separable verb "teilnehmen" into an infinitive clause with "zu"?',
        options: [
          'zu teilnehmen',
          'teilzunehmen',
          'teilnehmen zu',
        ],
        correctIndex: 1,
        explanation:
          'In separable verbs, "zu" is inserted right between prefix and stem: teil + zu + nehmen → teilzunehmen.',
      },
      {
        id: 'de-b1-m3-q3',
        skill: 'writing',
        prompt: 'Which closing sentence fits a formal Goethe B1 Schreiben Teil 3 email to a course director?',
        options: [
          'Bis dann, mach’s gut!',
          'Vielen Dank für Ihr Verständnis. Über eine kurze Rückmeldung würde ich mich sehr freuen. Mit freundlichen Grüßen',
          'Schreib mir mal bald zurück, tschüss!',
        ],
        correctIndex: 1,
        explanation:
          'Formal emails to instructors/officials require polite "Ihr", "Rückmeldung", and "Mit freundlichen Grüßen".',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 55,
    checkpointModelAnswer:
      'Sehr geehrte Frau Schneider, ich möchte mich herzlich dafür entschuldigen, dass ich morgen leider nicht am Deutschkurs teilnehmen kann. Ich habe einen dringenden Arzttermin, den ich nicht verschieben konnte. Anstatt den Stoff zu verpassen, werde ich alle Aufgaben zu Hause nacharbeiten. Vielen Dank im Voraus für Ihr Verständnis! Über eine kurze Rückmeldung zu den Hausaufgaben würde ich mich sehr freuen. Mit freundlichen Grüßen, Robin Keller',
  },

  'de-b2-m1': {
    estimatedMins: 40,
    overview:
      'Master B2 journalistic precision: adjective declensions, Passiv-Ersatzformen (sich lassen / -bar / sein + zu), and past hypotheticals (hätte/wäre + Partizip II).',
    sections: [
      {
        id: 'de-b2-m1-s1',
        heading: 'Passiv-Ersatzformen (Active-Voice Passive Alternatives)',
        explanation:
          'German press and university lectures constantly replace clunky "werden + Partizip II" with elegant passive alternatives: "sich lassen + Infinitiv" (can be done), "sein + zu + Infinitiv" (must/can be done), and adjectives ending in "-bar / -lich".',
        formula: 'Das lässt sich lösen  =  Das ist lösbar  =  Das kann gelöst werden  |  Es ist zu beachten = Es muss beachtet werden',
        examples: [
          {
            target: 'Diese Herausforderung lässt sich nur durch nachhaltige Maßnahmen bewältigen.',
            translation: 'This challenge can only be overcome through sustainable measures.',
            highlight: 'lässt sich ... bewältigen',
          },
          {
            target: 'Bei der Auswertung sind mehrere Faktoren kritisch zu hinterfragen.',
            translation: 'During the evaluation, several factors must be critically questioned.',
            highlight: 'sind ... zu hinterfragen',
          },
        ],
        proTip:
          'Using even one "lässt sich + Infinitiv" in Goethe B2 Schreiben instantly distinguishes B2 prose from B1.',
      },
      {
        id: 'de-b2-m1-s2',
        heading: 'Past Konjunktiv II & Adjective Declension Logic',
        explanation:
          'Express past counterfactuals with hätte/wäre + Partizip II ("Hätte man früher gehandelt, wäre das Problem vermeidbar gewesen"). For adjective endings: if the article already shows the strong gender/case signal (der/die/das/den/dem), the adjective relaxes to weak (-e or -en). Otherwise, the adjective carries the strong signal.',
        formula: 'Past Counterfactual: hätte/wäre + Partizip II   |   No article? Adjective takes der/die/das ending!',
        examples: [
          {
            target: 'Hätte die Stadt mehr Mittel zur Verfügung gestellt, wären weniger Linien ausgefallen.',
            translation: 'Had the city provided more funding, fewer lines would have been cancelled.',
            highlight: 'Hätte ... gestellt, wären ... ausgefallen',
          },
          {
            target: 'Nachhaltiger Verkehr erfordert langfristige politische Planung.',
            translation: 'Sustainable transport requires long-term political planning (strong -er, -e).',
            highlight: 'Nachhaltiger / langfristige',
          },
        ],
        proTip:
          'Remember: in Dativ and Genitiv with ANY article (der/ein/mein), ALL adjective endings are simply -en!',
      },
    ],
    vocabCards: [
      {
        term: 'die Maßnahme',
        pronunciation: '[diː ˈmaːsnaːmə]',
        meaning: 'the measure / policy action',
        example: 'Welche Maßnahmen könnten die Wohnungsnot lindern?',
        exampleNote: 'Which measures could alleviate the housing shortage?',
      },
      {
        term: 'in Betracht ziehen',
        pronunciation: '[ɪn bəˈtʁaxt ˈtsiːən]',
        meaning: 'to take into consideration',
        example: 'Man sollte auch alternative Arbeitsmodelle in Betracht ziehen.',
        exampleNote: 'One should also take alternative work models into consideration.',
      },
      {
        term: 'zur Verfügung stellen',
        pronunciation: '[tsuːɐ̯ fɛɐ̯ˈfyːɡʊŋ ˈʃtɛlən]',
        meaning: 'to make available / provide',
        example: 'Die Universität stellt allen Studierenden digitale Ressourcen zur Verfügung.',
        exampleNote: 'The university makes digital resources available to all students.',
      },
      {
        term: 'kritisch hinterfragen',
        pronunciation: '[ˈkʁɪtɪʃ hɪntɐˈfʁaːɡn̩]',
        meaning: 'to critically question / scrutinize',
        example: 'Algorithmen sollten regelmäßig kritisch hinterfragt werden.',
        exampleNote: 'Algorithms should regularly be critically scrutinized.',
      },
      {
        term: 'nachhaltig',
        pronunciation: '[ˈnaːxhaltɪç]',
        meaning: 'sustainable / lasting',
        example: 'Wir brauchen eine nachhaltige Lösung für den Stadtverkehr.',
        exampleNote: 'We need a sustainable solution for urban transit.',
      },
      {
        term: 'die Herausforderung',
        pronunciation: '[diː hɛˈʁaʊ̯sfɔʁdəʁʊŋ]',
        meaning: 'the challenge',
        example: 'Der demografische Wandel stellt eine große Herausforderung dar.',
        exampleNote: 'Demographic change represents a major challenge.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b2-m1-q1',
        skill: 'reading',
        prompt: 'What does "Diese Methode lässt sich leicht anwenden" mean?',
        options: [
          'This method must not be used.',
          'This method can easily be applied.',
          'Someone forgot to apply this method.',
        ],
        correctIndex: 1,
        explanation:
          '"sich lassen + Infinitiv" is a Passiv-Ersatzform meaning "can be [done]" (= kann leicht angewendet werden).',
      },
      {
        id: 'de-b2-m1-q2',
        skill: 'listening',
        prompt: 'Listen to the university lecture excerpt. What is the professor’s main warning?',
        audioScript:
          'Zwar stellen KI-Systeme enorme Datenmengen in Sekunden zur Verfügung, doch genau darin liegt die Herausforderung: Ohne transparente Kriterien lassen sich verzerrte Ergebnisse kaum kritisch hinterfragen.',
        options: [
          'AI systems are too slow to process large datasets.',
          'Without transparent criteria, biased AI outputs are difficult to scrutinize critically.',
          'Universities should stop using digital data altogether.',
        ],
        correctIndex: 1,
        explanation:
          'Notice "doch genau darin liegt die Herausforderung": transparency is essential to question biased outputs.',
      },
      {
        id: 'de-b2-m1-q3',
        skill: 'writing',
        prompt: 'Select the grammatically accurate past counterfactual (Konjunktiv II Vergangenheit):',
        options: [
          'Wenn wir früher planen würden, hätten wir das Problem gelöst.',
          'Hätten wir früher geplant, hätten wir das Problem vermieden.',
          'Wenn wir früher geplant haben, würden wir das Problem vermeiden.',
        ],
        correctIndex: 1,
        explanation:
          'Both halves are past counterfactuals: "Hätten ... geplant" (omitting "wenn" via verb-first inversion!) + "hätten ... vermieden".',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 90,
    checkpointModelAnswer:
      'Die zunehmende Digitalisierung in Schulen stellt eine zentrale Herausforderung dar. Zwar lassen sich Lernmaterialien heute schnell zur Verfügung stellen, doch es ist kritisch zu hinterfragen, ob reine Bildschirmzeit die Konzentration fördert. Hätte man früher gezielte Fortbildungen für Lehrkräfte angeboten, wären viele Übergangsprobleme vermeidbar gewesen. Meiner Ansicht nach sollten nachhaltige Maßnahmen in Betracht gezogen werden, die digitale Werkzeuge sinnvoll mit klassischem Unterricht kombinieren.',
  },

  'de-b2-m2': {
    estimatedMins: 40,
    overview:
      'Write high-scoring Goethe B2 argumentative essays and debate persuasively using Nomen-Verb-Verbindungen, Genitiv prepositions, and paired comparative logic (je...desto).',
    sections: [
      {
        id: 'de-b2-m2-s1',
        heading: 'Nomen-Verb-Verbindungen (Formal Verb-Noun Collocations)',
        explanation:
          'At B2+, pairing a precise noun with its fixed verb replaces basic verbs and unlocks formal academic tone: Stellung nehmen zu (comment on), einen Beitrag leisten zu (contribute to), in Kauf nehmen (accept as a trade-off).',
        formula: 'Stellung nehmen zu (+ Dat)  |  einen Beitrag leisten zu (+ Dat)  |  etw. in Kauf nehmen',
        examples: [
          {
            target: 'Ich möchte heute zu der Frage Stellung nehmen, ob Homeoffice Pflicht sein sollte.',
            translation: 'Today I would like to take a stance on whether remote work should be mandatory.',
            highlight: 'Stellung nehmen',
          },
          {
            target: 'Wer flexibel arbeiten will, muss manchmal weniger Teamkontakt in Kauf nehmen.',
            translation: 'Whoever wants flexible work must sometimes accept less team contact as a trade-off.',
            highlight: 'in Kauf nehmen',
          },
        ],
        proTip:
          'Learn the fixed preposition with every Nomen-Verb-Verbindung ("Beitrag leisten ZU", "Stellung nehmen ZU", "in Frage kommen FÜR").',
      },
      {
        id: 'de-b2-m2-s2',
        heading: 'Genitiv Prepositions & Proportional "je ... desto"',
        explanation:
          'Formal causal/instrumental links use Genitiv prepositions: aufgrund (due to), infolge (as a result of), anhand (on the basis of), mittels (by means of). In "je ... desto", the "je"-clause puts the verb at the END, while "desto" puts the verb RIGHT AFTER the comparative adjective!',
        formula: 'Je + [Comp] ... [Verb-End], desto + [Comp] + [Verb] + [Subject] ...',
        examples: [
          {
            target: 'Aufgrund steigender Mietpreise wägen viele Pendler neue Wohnalternativen ab.',
            translation: 'Due to rising rents, many commuters weigh new housing alternatives.',
            highlight: 'Aufgrund steigender Mietpreise',
          },
          {
            target: 'Je transparenter die Regeln sind, desto überzeugender wirkt das Modell.',
            translation: 'The more transparent the rules are, the more convincing the model appears.',
            highlight: 'Je ... sind, desto überzeugender wirkt',
          },
        ],
        proTip:
          'For Goethe B2 Schreiben Teil 1 (150+ words), always structure 4 clean paragraphs: (1) Hook + Stance, (2) Reasons, (3) Alternatives + Trade-offs, (4) Synthesis Conclusion.',
      },
    ],
    vocabCards: [
      {
        term: 'Stellung nehmen zu',
        pronunciation: '[ˈʃtɛlʊŋ ˈneːmən tsuː]',
        meaning: 'to take a stand / comment on (+ Dativ)',
        example: 'In meinem Beitrag nehme ich zur Vier-Tage-Woche Stellung.',
        exampleNote: 'In my post I take a stand on the four-day workweek.',
      },
      {
        term: 'einen Beitrag leisten',
        pronunciation: '[ˈaɪ̯nən ˈbaɪ̯tʁaːk ˈlaɪ̯stn̩]',
        meaning: 'to make a contribution (zu + Dativ)',
        example: 'Jeder Betrieb kann einen wichtigen Beitrag zum Klimaschutz leisten.',
        exampleNote: 'Every company can make an important contribution to climate protection.',
      },
      {
        term: 'in Kauf nehmen',
        pronunciation: '[ɪn kaʊ̯f ˈneːmən]',
        meaning: 'to accept as a necessary trade-off',
        example: 'Für höhere Qualität nehmen Kunden längere Lieferzeiten in Kauf.',
        exampleNote: 'For higher quality, customers accept longer delivery times.',
      },
      {
        term: 'abwägen',
        pronunciation: '[ˈapvɛːɡn̩]',
        meaning: 'to weigh up (pros and cons)',
        example: 'Man muss Kosten und Nutzen sorgfältig gegeneinander abwägen.',
        exampleNote: 'One must carefully weigh costs and benefits against each other.',
      },
      {
        term: 'die Alternative',
        pronunciation: '[diː altɛʁnaˈtiːvə]',
        meaning: 'the alternative / other option',
        example: 'Eine realistische Alternative wäre ein hybrides Arbeitsmodell.',
        exampleNote: 'A realistic alternative would be a hybrid work model.',
      },
      {
        term: 'überzeugend',
        pronunciation: '[yːbɐˈtsɔɪ̯ɡn̩t]',
        meaning: 'convincing / persuasive',
        example: 'Ihr Argument für flexible Arbeitszeiten war äußerst überzeugend.',
        exampleNote: 'Her argument for flexible working hours was extremely convincing.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b2-m2-q1',
        skill: 'writing',
        prompt: 'Choose the sentence with accurate "je ... desto" word order:',
        options: [
          'Je mehr man übt, desto man spricht sicherer.',
          'Je mehr man übt, desto sicherer spricht man.',
          'Je mehr übt man, desto sicherer man spricht.',
        ],
        correctIndex: 1,
        explanation:
          '"je"-clause = verb at end ("übt"); "desto"-clause = comparative adjective ("sicherer") + conjugated verb ("spricht") + subject ("man").',
      },
      {
        id: 'de-b2-m2-q2',
        skill: 'reading',
        prompt: 'What does "Nachteile in Kauf nehmen" mean in an argumentative essay?',
        options: [
          'To purchase goods at a discount',
          'To accept drawbacks as part of a trade-off',
          'To reject every compromise',
        ],
        correctIndex: 1,
        explanation:
          '"etwas in Kauf nehmen" is a high-frequency B2/C1 idiom meaning to put up with / accept an unavoidable downside.',
      },
      {
        id: 'de-b2-m2-q3',
        skill: 'writing',
        prompt: 'Which sentence uses the Genitiv preposition "aufgrund" accurately?',
        options: [
          'Aufgrund des hohen Energieverbrauchs müssen neue Konzepte geprüft werden.',
          'Aufgrund den hohen Energieverbrauch müssen neue Konzepte geprüft werden.',
          'Aufgrund dem hohen Energieverbrauch müssen neue Konzepte geprüft werden.',
        ],
        correctIndex: 0,
        explanation:
          '"aufgrund" governs Genitiv: der Energieverbrauch → des hohen Energieverbrauchs.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 120,
    checkpointModelAnswer:
      'In diesem Beitrag möchte ich zur Frage Stellung nehmen, ob Unternehmen eine Vier-Tage-Woche einführen sollten. Aufgrund steigender Stressbelastung wägen immer mehr Betriebe flexiblere Arbeitsmodelle ab. Ein überzeugendes Argument ist, dass ausgeruhte Mitarbeitende oft produktiver arbeiten und somit einen höheren Beitrag zum Unternehmenserfolg leisten. Allerdings muss man in Kauf nehmen, dass in Branchen wie dem Gesundheitswesen eine Verkürzung schwer umsetzbar ist. Eine sinnvolle Alternative wäre daher ein flexibles Gleitzeitmodell. Je besser die Arbeitszeiten an individuelle Bedürfnisse angepasst werden, desto höher fällt die Zufriedenheit aus. Abschließend halte ich eine schrittweise Erprobung für den richtigen Weg.',
  },

  'de-b2-m3': {
    estimatedMins: 35,
    overview:
      'Interpret charts and statistics crisply for TestDaF & Goethe B2 using data verbs, subjective modal attribution (soll/will), and participial adjectives.',
    sections: [
      {
        id: 'de-b2-m3-s1',
        heading: 'TestDaF Data & Chart Description Toolkit',
        explanation:
          'Never list every single number in a chart! Follow the 3-step TestDaF formula: (1) Title & Source ("Die Grafik gibt Auskunft über..."), (2) Extremes & Overall Trend ("Der Anteil hat sich verdoppelt / stagniert"), (3) Comparison & Cause ("Im Vergleich zu ... ist dies zurückzuführen auf...").',
        formula: 'Der Anteil von [X] stieg von [A]% auf [B]%  |  ist auf [+ Akk] zurückzuführen',
        examples: [
          {
            target: 'Im Vergleich zum Vorjahr hat sich der Anteil der Online-Studierenden fast verdoppelt.',
            translation: 'Compared to the previous year, the share of online students has nearly doubled.',
            highlight: 'Im Vergleich zum Vorjahr / verdoppelt',
          },
          {
            target: 'Dieser Rückgang ist vor allem auf die gestiegenen Lebenshaltungskosten zurückzuführen.',
            translation: 'This decline can primarily be traced back to the risen cost of living.',
            highlight: 'ist ... zurückzuführen',
          },
        ],
        proTip:
          'Notice the tiny preposition distinction: "steigen AUF 40%" (rose TO 40%) vs. "steigen UM 10%" (rose BY 10%).',
      },
      {
        id: 'de-b2-m3-s2',
        heading: 'Subjective Modals (soll / will) & Participles as Adjectives',
        explanation:
          'Report unverified claims neutrally with "soll + Infinitiv" (is said to) and self-claims with "will + Infinitiv" (claims to). Compress relative clauses cleanly using Partizip I (active/ongoing: "die wachsende Zahl") and Partizip II (completed/passive: "die prognostizierte Entwicklung").',
        formula: 'Partizip I: [Infinitiv]+d+Endung (active)  |  Partizip II+Endung (completed/passive)',
        examples: [
          {
            target: 'Laut einer neuen Studie soll die Zahl der Fernstudierenden weiter zunehmen.',
            translation: 'According to a new study, the number of distance learners is said to increase further.',
            highlight: 'soll ... zunehmen',
          },
          {
            target: 'Die kontinuierlich steigenden Zahlen widersprechen der prognostizierten Stagnation.',
            translation: 'The continuously rising figures contradict the forecasted stagnation.',
            highlight: 'steigenden / prognostizierten',
          },
        ],
        proTip:
          'In TestDaF Sprechen Aufgabe 3 (Grafikbeschreibung), reserve the final 20 seconds to state the cause or future forecast ("Experten prognostizieren...").',
      },
    ],
    vocabCards: [
      {
        term: 'der Anteil',
        pronunciation: '[deːɐ̯ ˈantaɪ̯l]',
        meaning: 'the share / proportion / percentage',
        example: 'Der Anteil erneuerbarer Energien liegt bereits bei über fünfzig Prozent.',
        exampleNote: 'The share of renewable energy already lies above fifty percent.',
      },
      {
        term: 'verdoppeln',
        pronunciation: '[fɛɐ̯ˈdɔpl̩n]',
        meaning: 'to double (sich verdoppeln)',
        example: 'Innerhalb von fünf Jahren hat sich die Nachfrage verdoppelt.',
        exampleNote: 'Within five years demand has doubled.',
      },
      {
        term: 'stagnieren',
        pronunciation: '[ʃtaɡˈniːʁən]',
        meaning: 'to stagnate / remain flat',
        example: 'Seit zweitausendzwanzig stagnieren die Verkaufszahlen auf hohem Niveau.',
        exampleNote: 'Since 2020 sales figures have stagnated at a high level.',
      },
      {
        term: 'im Vergleich zu',
        pronunciation: '[ɪm fɛɐ̯ˈɡlaɪ̯ç tsuː]',
        meaning: 'compared to / in comparison with (+ Dativ)',
        example: 'Im Vergleich zu Europa wächst der Markt in Asien deutlich schneller.',
        exampleNote: 'Compared to Europe, the market in Asia is growing markedly faster.',
      },
      {
        term: 'zurückzuführen sein auf',
        pronunciation: '[tsuˈʁʏktsuˌfyːʁən zaɪ̯n aʊ̯f]',
        meaning: 'to be attributable to (+ Akkusativ)',
        example: 'Der Erfolg ist auf gezielte Investitionen zurückzuführen.',
        exampleNote: 'The success is attributable to targeted investments.',
      },
      {
        term: 'prognostizieren',
        pronunciation: '[pʁoɡnɔstiˈtsiːʁən]',
        meaning: 'to forecast / predict',
        example: 'Forscher prognostizieren einen weiteren Anstieg bis zweitausenddreißig.',
        exampleNote: 'Researchers forecast a further rise until 2030.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-b2-m3-q1',
        skill: 'reading',
        prompt: 'A chart shows smartphone use rose from 30% to 45%. Which German sentence states this accurately?',
        options: [
          'Der Anteil stieg auf 15 Prozent.',
          'Der Anteil stieg um 15 Prozent auf 45 Prozent.',
          'Der Anteil stagnierte bei 45 Prozent.',
        ],
        correctIndex: 1,
        explanation:
          '"um" indicates the amount of change (+15%), while "auf" indicates the final destination (45%).',
      },
      {
        id: 'de-b2-m3-q2',
        skill: 'reading',
        prompt: 'What nuance does "Die neue Software soll Fehler um die Hälfte reduzieren" convey?',
        options: [
          'The software is legally required to reduce errors.',
          'According to reports/claims, the software allegedly reduces errors by half.',
          'The software definitely failed to reduce errors.',
        ],
        correctIndex: 1,
        explanation:
          'Subjective "soll + Infinitiv" distances the speaker from a claim ("is said to / reportedly").',
      },
      {
        id: 'de-b2-m3-q3',
        skill: 'speaking',
        prompt: 'Which participial adjective correctly expresses "rising energy costs" (ongoing active process)?',
        options: [
          'die gestiegene Energiekosten',
          'die steigenden Energiekosten',
          'die zu steigenden Energiekosten',
        ],
        correctIndex: 1,
        explanation:
          'Ongoing active action = Partizip I ("steigend") + plural weak ending "-en" → "die steigenden Energiekosten".',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 70,
    checkpointModelAnswer:
      'Die vorliegende Grafik gibt Auskunft über die Entwicklung der Homeoffice-Nutzung zwischen zweitausendachtzehn und zweitausendfünfundzwanzig. Auffällig ist, dass sich der Anteil regelmäßig von zu Hause arbeitender Beschäftigter in diesem Zeitraum mehr als verdoppelt hat, während die Präsenzquote im Vergleich zu früher deutlich sank. Seit letztem Jahr scheinen die Werte jedoch zu stagnieren. Diese Entwicklung ist vor allem auf digitale Arbeitsmittel und veränderte Erwartungen zurückzuführen. Experten prognostizieren, dass hybride Modelle dauerhaft Standard bleiben.',
  },

  'de-c1-m1': {
    estimatedMins: 45,
    overview:
      'Decode dense German academic prose by unwinding extended participial brackets (Partizipialattribute) and transforming verbal clauses cleanly into Nominalstil.',
    sections: [
      {
        id: 'de-c1-m1-s1',
        heading: 'Deconstructing Extended Participial Attributes',
        explanation:
          'German academic texts pack an entire relative clause BETWEEN the article and the noun! Read them by finding the article + head noun first, then reading the participle right before the noun backwards.',
        formula: '[Article] + [Modifiers/Prepositional phrases] + [Partizip I/II] + [Head Noun]',
        examples: [
          {
            target: 'Die im vergangenen Jahr von der Kommission vorgelegte Studie bestätigt diese Wechselwirkung.',
            translation: 'The study (which was) presented by the commission last year confirms this interaction.',
            highlight: 'Die ... vorgelegte Studie',
          },
          {
            target: 'Die zunehmend auf erneuerbaren Quellen basierende Stromversorgung erfordert neue Speicher.',
            translation: 'The power supply increasingly based on renewable sources requires new storage.',
            highlight: 'Die ... basierende Stromversorgung',
          },
        ],
        proTip:
          'In Goethe C1 Lesen, underline the opening article ("Die") and jump straight to the matching noun ("Studie") to extract the skeleton of a 40-word sentence in 3 seconds.',
      },
      {
        id: 'de-c1-m1-s2',
        heading: 'Nominalisierung & Academic Prepositions (angesichts, ungeachtet)',
        explanation:
          'Nominalstil replaces subordinate clauses (weil/obwohl/während) with Genitiv prepositions + nominalized verbs/adjectives: "Weil die Kosten steigen" → "Angesichts steigender Kosten"; "Obwohl Risiken bestehen" → "Ungeachtet bestehender Risiken".',
        formula: 'weil/da → aufgrund / angesichts (+ Gen)  |  obwohl → trotz / ungeachtet (+ Gen)  |  indem → durch / mittels',
        examples: [
          {
            target: 'Angesichts der raschen Implementierung neuer KI-Modelle müssen Schutzstandards gewährleistet werden.',
            translation: 'In view of the rapid implementation of new AI models, protection standards must be ensured.',
            highlight: 'Angesichts der raschen Implementierung',
          },
          {
            target: 'Ungeachtet berechtigter Kritik erscheint der differenzierte Ansatz plausibel.',
            translation: 'Notwithstanding justified criticism, the nuanced approach appears plausible.',
            highlight: 'Ungeachtet berechtigter Kritik',
          },
        ],
        proTip:
          'Balance Nominalstil with strong finite verbs (zugrunde liegen, gewährleisten, bedingen) — over-packing 5 nouns in a row hurts readability even at C1!',
      },
    ],
    vocabCards: [
      {
        term: 'die Implementierung',
        pronunciation: '[diː ɪmplemɛnˈtiːʁʊŋ]',
        meaning: 'implementation / rollout',
        example: 'Die schrittweise Implementierung des Gesetzes dauert zwei Jahre.',
        exampleNote: 'The phased implementation of the law takes two years.',
      },
      {
        term: 'zugrunde liegen',
        pronunciation: '[tsuˈɡʁʊndə ˈliːɡn̩]',
        meaning: 'to underlie / form the basis of (+ Dativ)',
        example: 'Dieser Analyse liegt eine umfassende Datenerhebung zugrunde.',
        exampleNote: 'A comprehensive data collection underlies this analysis.',
      },
      {
        term: 'differenziert',
        pronunciation: '[dɪfəʁɛnˈtsiːɐ̯t]',
        meaning: 'nuanced / differentiated',
        example: 'Eine differenzierte Betrachtung vermeidet vorschnelle Urteile.',
        exampleNote: 'A nuanced view avoids hasty judgments.',
      },
      {
        term: 'die Wechselwirkung',
        pronunciation: '[diː ˈvɛksl̩ˌvɪʁkʊŋ]',
        meaning: 'interaction / interplay / reciprocal effect',
        example: 'Die Studie untersucht die Wechselwirkung zwischen Schlaf und Gedächtnis.',
        exampleNote: 'The study investigates the interplay between sleep and memory.',
      },
      {
        term: 'plausibel',
        pronunciation: '[plaʊ̯ˈziːbl̩]',
        meaning: 'plausible / coherent',
        example: 'Die vorgebrachte Hypothese wirkt methodisch äußerst plausibel.',
        exampleNote: 'The proposed hypothesis seems methodologically very plausible.',
      },
      {
        term: 'gewährleisten',
        pronunciation: '[ɡəˈvɛːɐ̯ˌlaɪ̯stn̩]',
        meaning: 'to guarantee / ensure',
        example: 'Transparente Verfahren sollen faire Entscheidungen gewährleisten.',
        exampleNote: 'Transparent procedures are meant to guarantee fair decisions.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c1-m1-q1',
        skill: 'reading',
        passage:
          'Die seit Jahrzehnten in der Forschung kontrovers diskutierte Frage nach den Ursachen der Sprachveränderung lässt sich nicht eindimensional beantworten.',
        prompt: 'What is the grammatical subject (head noun) of this sentence?',
        options: ['Die Forschung', 'Die Frage', 'Die Sprachveränderung'],
        correctIndex: 1,
        explanation:
          'Everything between "Die" and "Frage" is an extended participial attribute describing "Die Frage".',
      },
      {
        id: 'de-c1-m1-q2',
        skill: 'writing',
        prompt: 'Which nominalization accurately transforms "Obwohl die Finanzierung unsicher ist, startet das Projekt"?',
        options: [
          'Angesichts der unsicheren Finanzierung startet das Projekt.',
          'Ungeachtet der unsicheren Finanzierung startet das Projekt.',
          'Infolge der unsicheren Finanzierung startet das Projekt.',
        ],
        correctIndex: 1,
        explanation:
          '"Obwohl" (concessive) converts to "trotz" or "ungeachtet" (+ Genitiv). "Angesichts" and "infolge" are causal.',
      },
      {
        id: 'de-c1-m1-q3',
        skill: 'reading',
        prompt: 'Pick the sentence using "zugrunde liegen" with accurate case governance:',
        options: [
          'Die These liegt ein empirischer Befund zugrunde.',
          'Der These liegt ein empirischer Befund zugrunde.',
          'Den These liegt einen empirischen Befund zugrunde.',
        ],
        correctIndex: 1,
        explanation:
          'What underlies (Befund) is Nominativ; what it underlies (der These) is Dativ!',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 130,
    checkpointModelAnswer:
      'Angesichts der rasanten Implementierung automatisierter Systeme im Bildungswesen bedarf es einer differenzierten Bewertung. Ungeachtet der offensichtlichen Effizienzgewinne liegt zahlreichen Studien zufolge eine komplexe Wechselwirkung zwischen technischer Unterstützung und eigenständigem Denken zugrunde. Die von Experten geforderte Transparenz erscheint daher äußerst plausibel: Nur durch verbindliche Qualitätskriterien lässt sich gewährleisten, dass digitale Werkzeuge das kritische Urteilsvermögen stärken, statt es zu schwächen. Zusammenfassend sollte technologischer Fortschritt stets pädagogisch begleitet werden.',
  },

  'de-c1-m2': {
    estimatedMins: 45,
    overview:
      'Report expert opinions neutrally with Konjunktiv I, calibrate epistemic certainty with subjective modals (dürfte/müsste), and handle adversarial C1 rebuttal questions gracefully.',
    sections: [
      {
        id: 'de-c1-m2-s1',
        heading: 'Konjunktiv I (Indirect Speech) & Konjunktiv II Fallback',
        explanation:
          'Academic summaries and press reports signal distance with Konjunktiv I (stem + -e: er sei, habe, komme, betone, räume ein). Whenever Konjunktiv I looks identical to Indicative (especially plural "sie haben" / "sie sagen"), switch to Konjunktiv II ("sie hätten", "sie sagten") to preserve neutrality.',
        formula: '3rd Sg: er/sie sei, habe, müsse, räume ein  |  Plural fallback: sie seien, hätten, würden ...',
        examples: [
          {
            target: 'Die Forscherin räumt ein, die Stichprobe sei begrenzt, betont jedoch, der Trend liege nahe.',
            translation: 'The researcher concedes the sample is limited, yet stresses the trend is plausible.',
            highlight: 'sei / liege nahe',
          },
          {
            target: 'Kritiker halten dem entgegen, die Daten hätten bislang kaum Langzeiteffekte erfasst.',
            translation: 'Critics counter that the data have so far scarcely captured long-term effects.',
            highlight: 'hätten ... erfasst',
          },
        ],
        proTip:
          'In Goethe C1 & DSH summaries, consistent Konjunktiv I tells the examiner immediately that you are reporting the author’s claims rather than stating them as undisputed fact.',
      },
      {
        id: 'de-c1-m2-s2',
        heading: 'Epistemic Modals & Nuanced Correlatives (wenngleich, zumal)',
        explanation:
          'Grade probability smoothly: dürfte (is likely to), müsste (ought to/surely must), könnte ... gewesen sein (might have been). Use "zumal" ("especially since") and "wenngleich" ("even though") for crisp concession and reinforcement.',
        formula: 'dürfte + Inf (likely)  |  zumal ... [Verb-End] (especially since)  |  wenngleich ... [Verb-End]',
        examples: [
          {
            target: 'Eine schnelle Reform dürfte unabdingbar sein, zumal die Kosten weiter steigen.',
            translation: 'A swift reform is likely indispensable, especially since costs keep rising.',
            highlight: 'dürfte ... sein, zumal',
          },
          {
            target: 'Wenngleich diese Ambivalenz bestehen bleibt, lässt sich der Nutzen kaum relativieren.',
            translation: 'Even though this ambivalence persists, the benefit can hardly be downplayed.',
            highlight: 'Wenngleich',
          },
        ],
        proTip:
          'When facing a tough C1 Speaking pushback question, open with a concession verb ("Ich räume gern ein, dass...") before launching your counterargument ("Dem möchte ich jedoch entgegenhalten, dass...").',
      },
    ],
    vocabCards: [
      {
        term: 'einräumen',
        pronunciation: '[ˈaɪ̯nʁɔɪ̯mən]',
        meaning: 'to concede / admit (a valid point)',
        example: 'Selbst Befürworter räumen ein, dass Übergangsfristen nötig sind.',
        exampleNote: 'Even proponents concede that transition periods are necessary.',
      },
      {
        term: 'relativieren',
        pronunciation: '[ʁelatiˈviːʁən]',
        meaning: 'to put into perspective / qualify / downplay',
        example: 'Die neuen Zahlen relativieren die ursprüngliche Prognose deutlich.',
        exampleNote: 'The new figures put the original forecast clearly into perspective.',
      },
      {
        term: 'entgegenhalten',
        pronunciation: '[ɛntˈɡeːɡn̩ˌhaltn̩]',
        meaning: 'to counter / object with (+ Dativ)',
        example: 'Diesem Einwand lässt sich entgegenhalten, dass die Praxis anders aussieht.',
        exampleNote: 'One can counter this objection by noting that practice looks different.',
      },
      {
        term: 'naheliegen',
        pronunciation: '[ˈnaːəˌliːɡn̩]',
        meaning: 'to be obvious / plausible / suggest itself',
        example: 'Es liegt nahe, beide Ansätze miteinander zu verknüpfen.',
        exampleNote: 'It suggests itself to combine both approaches.',
      },
      {
        term: 'unabdingbar',
        pronunciation: '[ˈʊnʔapdɪŋbaːɐ̯]',
        meaning: 'indispensable / non-negotiable',
        example: 'Eine verlässliche Finanzierung ist für die Forschung unabdingbar.',
        exampleNote: 'Reliable funding is indispensable for research.',
      },
      {
        term: 'die Ambivalenz',
        pronunciation: '[diː ambivaˈlɛnts]',
        meaning: 'ambivalence / mixed nature',
        example: 'Die Debatte spiegelt die gesellschaftliche Ambivalenz gegenüber KI wider.',
        exampleNote: 'The debate reflects societal ambivalence toward AI.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c1-m2-q1',
        skill: 'reading',
        prompt: 'Which indirect speech sentence uses Konjunktiv I + Konjunktiv II fallback accurately?',
        options: [
          'Der Experte sagte, die Maßnahmen sind wirksam und die Bürger haben profitiert.',
          'Der Experte erklärte, die Reform sei wirksam und die Gemeinden hätten bereits profitiert.',
          'Der Experte erklärte, die Reform wäre wirksam und die Gemeinden haben profitiert.',
        ],
        correctIndex: 1,
        explanation:
          'Singular uses Konjunktiv I ("sei"), while plural switches to Konjunktiv II ("hätten") because Konjunktiv I "haben" matches the indicative.',
      },
      {
        id: 'de-c1-m2-q2',
        skill: 'listening',
        prompt: 'Listen to the panel excerpt. How does Professor Hartmann respond to the skeptic?',
        audioScript:
          'Skeptiker: Die Reform kostet zu viel Zeit. Prof. Hartmann: Ich räume durchaus ein, dass die Umstellung anspruchsvoll ist; dem halte ich jedoch entgegen, dass Untätigkeit langfristig deutlich teurer sein dürfte, zumal der Fachkräftemangel sich zuspitzt.',
        options: [
          'He dismisses transition costs completely.',
          'He concedes the transition is demanding, but argues inaction is likely costlier.',
          'He agrees the reform should be postponed.',
        ],
        correctIndex: 1,
        explanation:
          'Classic C1 concession + rebuttal structure: "räume ein ... halte dem entgegen ... dürfte teurer sein, zumal..."',
      },
      {
        id: 'de-c1-m2-q3',
        skill: 'writing',
        prompt: 'What does "zumal" mean in "Wir sollten rasch handeln, zumal die Frist bald abläuft"?',
        options: ['although', 'especially since', 'unless'],
        correctIndex: 1,
        explanation:
          '"zumal" introduces an intensifying causal reason ("especially since / all the more so because") and sends the verb to the end.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 85,
    checkpointModelAnswer:
      'In der aktuellen Debatte über verpflichtende Sprachtests zeigt sich eine deutliche Ambivalenz. Ich räume gern ein, dass standardisierte Prüfungen individuellen Lebensläufen nicht immer vollständig gerecht werden und daher relativiert werden müssen. Dem möchte ich jedoch entgegenhalten, dass transparente Kriterien für faire Chancen unabdingbar sind, zumal Arbeitgeber verlässliche Nachweise benötigen. Es liegt daher nahe, Prüfungen praxisnäher zu gestalten. Eine solche Reform dürfte langfristig beiden Seiten zugutekommen.',
  },

  'de-c1-m3': {
    estimatedMins: 40,
    overview:
      'Achieve seamless text cohesion, calibrate editorial vs. academic registers, and deploy Funktionsverbgefüge with natural precision for Goethe C1 / telc C1 Hochschule.',
    sections: [
      {
        id: 'de-c1-m3-s1',
        heading: 'Funktionsverbgefüge (High-Register Support-Verb Constructions)',
        explanation:
          'Academic and administrative German relies heavily on fixed noun-verb pairs that express aspect and register: Rechnung tragen (+ Dat: take account of), in Anspruch nehmen (make use of / require), zur Debatte stehen (be up for debate), Aufschluss geben über (shed light on).',
        formula: 'einer Sache (Dat) Rechnung tragen  |  etw. (Akk) in Anspruch nehmen  |  Aufschluss geben über (+ Akk)',
        examples: [
          {
            target: 'Moderne Lehrpläne müssen der sprachlichen Vielfalt im Klassenzimmer Rechnung tragen.',
            translation: 'Modern curricula must take account of linguistic diversity in the classroom.',
            highlight: 'Rechnung tragen',
          },
          {
            target: 'Die Langzeitdaten geben aufschlussreich Aufschluss über regionale Unterschiede.',
            translation: 'The longitudinal data shed clear light on regional differences.',
            highlight: 'Aufschluss geben über',
          },
        ],
        proTip:
          'Double-check "Rechnung tragen": it ALWAYS takes Dativ ("den Bedürfnissen Rechnung tragen")!',
      },
      {
        id: 'de-c1-m3-s2',
        heading: 'Thematic Progression & Text Cohesion',
        explanation:
          'C1 examiners grade cohesion strictly. Connect paragraphs by picking up the ending concept (Rhema) of one sentence as the opening topic (Thema) of the next using precise demonstrative nouns ("Diese Entwicklung...", "Ein solcher Ansatz...", "Vor diesem Hintergrund...").',
        formula: 'Sentence A (... neue Standards) → Sentence B (Diese Standards ... / Vor diesem Hintergrund ...)',
        examples: [
          {
            target: 'Der Anteil digitaler Prüfungen steigt stetig. Vor diesem Hintergrund steht auch die Bewertungspraxis zur Debatte.',
            translation: 'The share of digital exams is rising steadily. Against this backdrop, grading practices are also up for debate.',
            highlight: 'Vor diesem Hintergrund',
          },
          {
            target: 'Wer diese Dynamik verkennt, unterschätzt den langfristigen Reformbedarf.',
            translation: 'Whoever fails to recognize this dynamic underestimates the long-term need for reform.',
            highlight: 'diese Dynamik verkennt',
          },
        ],
        proTip:
          'Avoid repeating "Und", "Aber", or "Also" to open C1 paragraphs. Rotate: "Vor diesem Hintergrund", "Darüber hinaus", "Demgegenüber", "Abschließend lässt sich festhalten".',
      },
    ],
    vocabCards: [
      {
        term: 'Rechnung tragen',
        pronunciation: '[ˈʁɛçnʊŋ ˈtʁaːɡn̩]',
        meaning: 'to take account of / accommodate (+ Dativ)',
        example: 'Die Reform trägt den veränderten Arbeitsrealitäten Rechnung.',
        exampleNote: 'The reform takes account of changed working realities.',
      },
      {
        term: 'in Anspruch nehmen',
        pronunciation: '[ɪn ˈanʃpʁʊx ˈneːmən]',
        meaning: 'to make use of / claim / take up (time)',
        example: 'Immer mehr Studierende nehmen die Schreibberatung in Anspruch.',
        exampleNote: 'More and more students make use of the writing counseling service.',
      },
      {
        term: 'zur Debatte stehen',
        pronunciation: '[tsuːɐ̯ deˈbatə ˈʃteːən]',
        meaning: 'to be up for debate / under discussion',
        example: 'Derzeit stehen zwei gegensätzliche Finanzierungsmodelle zur Debatte.',
        exampleNote: 'Currently two opposing financing models are up for debate.',
      },
      {
        term: 'Aufschluss geben über',
        pronunciation: '[ˈaʊ̯fʃlʊs ˈɡeːbn̩ ˈyːbɐ]',
        meaning: 'to shed light on / provide insight into (+ Akk)',
        example: 'Die Befragung gibt wertvollen Aufschluss über die Lernmotivation.',
        exampleNote: 'The survey provides valuable insight into learning motivation.',
      },
      {
        term: 'hervorheben',
        pronunciation: '[hɛɐ̯ˈfoːɐ̯ˌheːbn̩]',
        meaning: 'to emphasize / highlight',
        example: 'Besonders hervorzuheben ist die hohe Beteiligung junger Wähler.',
        exampleNote: 'Particularly worth highlighting is the high turnout of young voters.',
      },
      {
        term: 'verkennen',
        pronunciation: '[fɛɐ̯ˈkɛnən]',
        meaning: 'to fail to recognize / misjudge',
        example: 'Man darf die sozialen Folgen steigender Mieten nicht verkennen.',
        exampleNote: 'One must not misjudge the social consequences of rising rents.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c1-m3-q1',
        skill: 'writing',
        prompt: 'Choose the sentence that uses "Rechnung tragen" with accurate grammar:',
        options: [
          'Das Gesetz trägt die neuen Risiken Rechnung.',
          'Das Gesetz trägt den neuen Risiken Rechnung.',
          'Das Gesetz trägt für die neuen Risiken Rechnung.',
        ],
        correctIndex: 1,
        explanation:
          '"Rechnung tragen" requires a Dativ object without a preposition: "den neuen Risiken Rechnung tragen".',
      },
      {
        id: 'de-c1-m3-q2',
        skill: 'reading',
        prompt: 'In "Das Verfahren nimmt viel Zeit in Anspruch", what does "in Anspruch nehmen" mean?',
        options: [
          'To cancel a claim',
          'To take up / require (a lot of time)',
          'To ignore completely',
        ],
        correctIndex: 1,
        explanation:
          '"Zeit/Hilfe/Leistungen in Anspruch nehmen" means to require/consume (time) or make use of (services).',
      },
      {
        id: 'de-c1-m3-q3',
        skill: 'writing',
        prompt: 'Which opening creates the tightest C1 thematic link after a paragraph about declining library visits?',
        options: [
          'Also, Bibliotheken sind wichtig.',
          'Vor diesem Hintergrund steht die künftige Rolle öffentlicher Bibliotheken verstärkt zur Debatte.',
          'Jetzt schreibe ich über ein anderes Thema.',
        ],
        correctIndex: 1,
        explanation:
          '"Vor diesem Hintergrund" anchors the new paragraph directly to the preceding facts while introducing the thesis cleanly.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 140,
    checkpointModelAnswer:
      'Gegenwärtig steht die Neuausrichtung universitärer Prüfungsformen intensiv zur Debatte. Empirische Erhebungen geben Aufschluss darüber, dass klassische Klausuren zwar Vergleichbarkeit sichern, jedoch die veränderte Arbeitswelt nur unzureichend abbilden. Vor diesem Hintergrund ist hervorzuheben, dass kompetenzorientierte Formate den praktischen Anforderungen besser Rechnung tragen. Wer diesen Wandel verkennt, riskiert eine Entfremdung zwischen Studium und Berufspraxis. Gleichwohl nehmen offene Prüfungsformen mehr Betreuungszeit in Anspruch, sodass Hochschulen entsprechend ausgestattet werden müssen. Abschließend lässt sich festhalten, dass nur ein ausgewogener Methodenmix langfristig überzeugt.',
  },

  'de-c2-m1': {
    estimatedMins: 45,
    overview:
      'Dissect German Feuilleton prose, decode irony and litotes, and master stylistic paraphrasing without copying source syntax for Goethe-Zertifikat C2 (GDS).',
    sections: [
      {
        id: 'de-c2-m1-s1',
        heading: 'Decoding Irony, Litotes & Feuilleton Subtext',
        explanation:
          'C2 Feuilleton essays rarely declare sarcasm loudly; they signal distance via modal particles (ja doch, wohl kaum), litotes (double negation like "nicht eben unbedenklich" = quite troubling), and sharp lexical contrast ("gleichwohl", "unverhohlen").',
        formula: 'Litotes: nicht eben + [Neg-Adj] = strongly positive/negative  |  gleichwohl = nevertheless (elevated)',
        examples: [
          {
            target: 'Diese Zuspitzung mag rhetorisch brillant erscheinen, ist in ihrer Tragweite jedoch nicht eben unbedenklich.',
            translation: 'This polarization may appear rhetorically brilliant, yet in its ramifications it is quite troubling.',
            highlight: 'nicht eben unbedenklich',
          },
          {
            target: 'Gleichwohl untergräbt eine unverhohlene Polemik das Vertrauen in den öffentlichen Diskurs.',
            translation: 'Nevertheless, undisguised polemics undermine trust in public discourse.',
            highlight: 'Gleichwohl untergräbt',
          },
        ],
        proTip:
          'In GDS Lesen & Schreiben, watch verbs like "suggerieren", "unterstellen", and "stilisieren" — they mark subtle authorial skepticism!',
      },
      {
        id: 'de-c2-m1-s2',
        heading: 'GDS Part 1 Paraphrase Mastery & Stylistic Fronting',
        explanation:
          'GDS Schreiben Teil 1 tests whether you can transform an entire sentence’s grammatical architecture (Active ↔ Passive, Verbal ↔ Nominal, Clause ↔ Prepositional Phrase) while keeping 100% of its exact semantic nuance.',
        formula: 'Transform BOTH vocabulary AND syntax: Verb → Funktionsverb / Partizip / Genitiv-Phrase',
        examples: [
          {
            target: 'Ausdifferenzierte Argumente gehen in verkürzten Debatten oft unter.',
            translation: 'Finely differentiated arguments are often drowned out in abbreviated debates.',
            highlight: 'Ausdifferenzierte',
          },
          {
            target: 'Kaum zu überschätzen ist die Tragweite dieser Entscheidung für kommende Generationen.',
            translation: 'Hardly to be overestimated is the far-reaching significance of this decision for future generations.',
            highlight: 'Kaum zu überschätzen ist',
          },
        ],
        proTip:
          'Fronting a participial or predicative phrase ("Kaum zu überschätzen ist...") creates unmistakable C2 stylistic cadence when used sparingly.',
      },
    ],
    vocabCards: [
      {
        term: 'die Zuspitzung',
        pronunciation: '[diː ˈtsuːʃpɪtsʊŋ]',
        meaning: 'escalation / sharpening / polemical polarization',
        example: 'Mediale Zuspitzungen verdrängen oft die sachliche Analyse.',
        exampleNote: 'Media polarizations often crowd out factual analysis.',
      },
      {
        term: 'untergraben',
        pronunciation: '[ʊntɐˈɡʁaːbn̩]',
        meaning: 'to undermine / erode (inseparable: untergräbt)',
        example: 'Dauerhafte Desinformation untergräbt demokratische Institutionen.',
        exampleNote: 'Persistent disinformation undermines democratic institutions.',
      },
      {
        term: 'die Tragweite',
        pronunciation: '[diː ˈtʁaːkvaɪ̯tə]',
        meaning: 'far-reaching implications / scope / gravity',
        example: 'Die volle Tragweite dieses Urteils wird erst später sichtbar.',
        exampleNote: 'The full scope of this ruling will only become visible later.',
      },
      {
        term: 'gleichwohl',
        pronunciation: '[ˈɡlaɪ̯çvoːl]',
        meaning: 'nevertheless / all the same (elevated)',
        example: 'Der Entwurf weist Lücken auf; gleichwohl markiert er einen Fortschritt.',
        exampleNote: 'The draft has gaps; all the same, it marks a step forward.',
      },
      {
        term: 'unverhohlen',
        pronunciation: '[ˈʊnfɛɐ̯ˌhoːlən]',
        meaning: 'undisguised / unabashed / blatant',
        example: 'Mit unverhohlener Skepsis kommentierte die Autorin den Plan.',
        exampleNote: 'With undisguised skepticism, the author commented on the plan.',
      },
      {
        term: 'ausdifferenziert',
        pronunciation: '[ˈaʊ̯sdɪfəʁɛnˌtsiːɐ̯t]',
        meaning: 'finely nuanced / highly articulated',
        example: 'Sein Essay bietet eine bemerkenswert ausdifferenzierte Kulturkritik.',
        exampleNote: 'His essay offers a remarkably nuanced cultural critique.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c2-m1-q1',
        skill: 'reading',
        passage:
          'Dass der neue Gesetzentwurf ausgerechnet von jenen gefeiert wird, die jahrelang jede Reform blockierten, stimmt nicht eben optimistisch.',
        prompt: 'What tone does the author convey with "ausgerechnet" and "nicht eben optimistisch"?',
        options: [
          'Genuine enthusiasm for bipartisan progress',
          'Biting irony and deep skepticism',
          'Neutral statistical reporting',
        ],
        correctIndex: 1,
        explanation:
          '"ausgerechnet" highlights ironic contradiction, while the litotes "nicht eben optimistisch" means "decidedly pessimistic".',
      },
      {
        id: 'de-c2-m1-q2',
        skill: 'writing',
        prompt: 'Which paraphrase best preserves the meaning of "Die Entscheidung hat weitreichende Folgen, dennoch bleibt sie unvermeidlich" at C2 level?',
        options: [
          'Die Entscheidung ist groß und schlecht.',
          'Ungeachtet ihrer enormen Tragweite erweist sich die Entscheidung gleichwohl als unumgänglich.',
          'Wegen der kleinen Folgen war die Entscheidung unnötig.',
        ],
        correctIndex: 1,
        explanation:
          'It replaces both syntax (concessive nominalization + "gleichwohl") and vocabulary ("Tragweite", "unumgänglich") with zero meaning loss.',
      },
      {
        id: 'de-c2-m1-q3',
        skill: 'reading',
        prompt: 'In "untergräbt die Glaubwürdigkeit", why does "untergraben" NOT separate?',
        options: [
          'Because figurative meanings of unter- verbs are inseparable.',
          'Because it is a typographical error.',
          'Because German never separates prefixes.',
        ],
        correctIndex: 0,
        explanation:
          'Figurative "untergraben" (to undermine) is stressed on the stem and inseparable (er untergräbt, hat untergraben), unlike literal digging under.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 150,
    checkpointModelAnswer:
      'Die gegenwärtige Debattenkultur leidet unter einer unverhohlenen Neigung zur Zuspitzung. Wo früher ausdifferenzierte Analysen Raum fanden, dominieren heute zugespitzte Parolen, deren Tragweite selten bedacht wird. Gleichwohl wäre es verkürzt, allein soziale Plattformen verantwortlich zu machen; vielmehr untergräbt eine schwindende Geduld für Komplexität den gemeinsamen Verständigungsraum. Kaum zu überschätzen ist daher die Bedeutung von Bildungseinrichtungen, die kritisches Lesen und intellektuelle Redlichkeit einüben. Nur wenn wir Ambivalenzen wieder aushalten, bleibt öffentlicher Diskurs tragfähig.',
  },

  'de-c2-m2': {
    estimatedMins: 45,
    overview:
      'Command idioms, pluricentric DACH vocabulary, and high-level rhetorical inversion for spontaneous GDS C2 debate and rapid intellectual audio.',
    sections: [
      {
        id: 'de-c2-m2-s1',
        heading: 'Idiomatic Mastery & Pluricentric DACH Awareness',
        explanation:
          'At C2, idioms must land naturally without sounding forced ("den Nagel auf den Kopf treffen", "die Gretchenfrage stellen", "reinen Wein einschenken"). Because Goethe/ÖSD C2 audio includes Swiss and Austrian speakers, recognize key DACH variants effortlessly.',
        formula: 'DE / AT / CH: Januar = Jänner (AT) | Fahrrad = Velo (CH) | Krankenhaus = Spital (AT/CH) | Abitur = Matura',
        examples: [
          {
            target: 'Mit dieser Frage treffen Sie den Nagel auf den Kopf — genau darin liegt die Gretchenfrage.',
            translation: 'With that question you hit the nail on the head — right there lies the crucial core question.',
            highlight: 'den Nagel auf den Kopf / Gretchenfrage',
          },
          {
            target: 'Man sollte den Bürgerinnen und Bürgern endlich reinen Wein einschenken, statt das Problem auf die Spitze zu treiben.',
            translation: 'One should finally tell citizens the unvarnished truth instead of pushing the problem to extremes.',
            highlight: 'reinen Wein einschenken',
          },
        ],
        proTip:
          'In GDS Sprechen, deploy ONE well-placed idiom during rebuttal rather than cramming five idioms into one monologue.',
      },
      {
        id: 'de-c2-m2-s2',
        heading: 'Adversarial Rhetoric & Spontaneous Concessive Framing',
        explanation:
          'When an examiner challenges your thesis head-on, control the floor with rhetorical parallelism and elevated concession: "So unstrittig [X] auch sein mag, so wenig folgt daraus, dass [Y]".',
        formula: 'So + [Adj] + [Subject] auch sein mag, so [wenig/sehr] + [Verb] ...',
        examples: [
          {
            target: 'So unstrittig die wirtschaftliche Bedeutung auch sein mag, so entschieden plädiere ich für ethische Leitplanken.',
            translation: 'Uncontroversial as the economic importance may be, I argue just as firmly for ethical guardrails.',
            highlight: 'So unstrittig ... auch sein mag, so entschieden',
          },
          {
            target: 'Nicht der Fortschritt an sich steht zur Debatte, sondern seine gesellschaftliche Steuerung.',
            translation: 'It is not progress itself that is up for debate, but its societal governance.',
            highlight: 'Nicht ..., sondern',
          },
        ],
        proTip:
          'Use "Nicht X, sondern Y" contrastive fronting to buy 2 seconds of thinking time while sounding effortlessly eloquent.',
      },
    ],
    vocabCards: [
      {
        term: 'den Nagel auf den Kopf treffen',
        pronunciation: '[deːn ˈnaːɡl̩ aʊ̯f deːn kɔpf ˈtʁɛfn̩]',
        meaning: 'to hit the nail right on the head',
        example: 'Ihre pointierte Diagnose trifft den Nagel auf den Kopf.',
        exampleNote: 'Your pointed diagnosis hits the nail on the head.',
      },
      {
        term: 'reinen Wein einschenken',
        pronunciation: '[ˈʁaɪ̯nən vaɪ̯n ˈaɪ̯nʃɛŋkn̩]',
        meaning: 'to tell the blunt, unvarnished truth (+ Dativ)',
        example: 'Es ist höchste Zeit, der Öffentlichkeit reinen Wein einzuschenken.',
        exampleNote: 'It is high time to tell the public the unvarnished truth.',
      },
      {
        term: 'auf die Spitze treiben',
        pronunciation: '[aʊ̯f diː ˈʃpɪtsə ˈtʁaɪ̯bn̩]',
        meaning: 'to take/push something to extremes',
        example: 'Bürokratische Auflagen dürfen die Vorsicht nicht auf die Spitze treiben.',
        exampleNote: 'Bureaucratic rules must not push caution to extremes.',
      },
      {
        term: 'die Gretchenfrage',
        pronunciation: '[diː ˈɡʁeːtçənˌfʁaːɡə]',
        meaning: 'the decisive, uncomfortable core question (from Goethe’s Faust)',
        example: 'Die Finanzierung bleibt die eigentliche Gretchenfrage der Verkehrswende.',
        exampleNote: 'Financing remains the true decisive question of the mobility transition.',
      },
      {
        term: 'unstrittig',
        pronunciation: '[ˈʊnʃtʁɪtɪç]',
        meaning: 'undisputed / uncontroversial',
        example: 'Es ist unstrittig, dass Prävention wirksamer ist als Nachsorge.',
        exampleNote: 'It is undisputed that prevention is more effective than aftercare.',
      },
      {
        term: 'plädieren für',
        pronunciation: '[plɛˈdiːʁən fyːɐ̯]',
        meaning: 'to advocate / argue strongly for (+ Akkusativ)',
        example: 'Ich plädiere nachdrücklich für mehr interdisziplinäre Forschung.',
        exampleNote: 'I argue emphatically for more interdisciplinary research.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c2-m2-q1',
        skill: 'listening',
        prompt: 'Listen to the DACH panel remark. What does the Swiss speaker propose?',
        audioScript:
          'Im Jänner fahre ich zwar selten mit dem Velo ins Spital, aber eines ist unstrittig: Wenn wir die Klimaziele ernst nehmen, müssen wir reinen Wein einschenken und klar für den Ausbau des öffentlichen Verkehrs plädieren.',
        options: [
          'Closing hospitals in winter',
          'Being candid with the public and advocating strongly for expanding public transit',
          'Banning bicycles in Switzerland',
        ],
        correctIndex: 1,
        explanation:
          'Jänner = January (AT), Velo = bicycle (CH), Spital = hospital (AT/CH); the core argument is honesty ("reinen Wein einschenken") + public transit expansion.',
      },
      {
        id: 'de-c2-m2-q2',
        skill: 'reading',
        prompt: 'What does "die Gretchenfrage stellen" signify in German intellectual discourse?',
        options: [
          'Asking a trivial icebreaker question',
          'Posing the crucial, awkward question that goes straight to the heart of a matter',
          'Changing the subject politely',
        ],
        correctIndex: 1,
        explanation:
          'Originating in Goethe’s Faust, "Gretchenfrage" refers to the decisive core question one cannot evade.',
      },
      {
        id: 'de-c2-m2-q3',
        skill: 'speaking',
        prompt: 'Which rhetorical frame most effectively counters an examiner’s objection at C2?',
        options: [
          'Sie haben unrecht.',
          'So unstrittig Ihr Einwand im Grundsatz auch sein mag, so wenig entkräftet er die Dringlichkeit langfristiger Reformen.',
          'Vielleicht ja, vielleicht nein.',
        ],
        correctIndex: 1,
        explanation:
          'The "So ... auch sein mag, so wenig ..." frame signals effortless rhetorical command and intellectual poise.',
      },
    ],
    checkpointSkill: 'speaking',
    checkpointMinWords: 100,
    checkpointModelAnswer:
      'Mit Ihrer Frage nach der praktischen Umsetzbarkeit treffen Sie den Nagel auf den Kopf — sie ist tatsächlich die Gretchenfrage unserer Debatte. So unstrittig kurzfristige Übergangskosten auch sein mögen, so wenig rechtfertigen sie ein weiteres Zögern. Es ist an der Zeit, der Öffentlichkeit reinen Wein einzuschenken: Nicht der Wandel selbst treibt die Belastungen auf die Spitze, sondern das jahrzehntelange Aufschieben notwendiger Investitionen. Ich plädiere daher entschieden für einen verbindlichen, sozial abgefederten Stufenplan.',
  },

  'de-c2-m3': {
    estimatedMins: 40,
    overview:
      'Polish prose to publication-grade GDS C2 mastery: eliminate redundancy, sharpen verb economy, and orchestrate syntactic rhythm with sovereignty.',
    sections: [
      {
        id: 'de-c2-m3-s1',
        heading: 'Editorial Compression & Verb Sovereignty',
        explanation:
          'Near-native German strips away filler ("es ist so, dass...", "man kann sagen, dass...") and replaces bloated noun phrases with exact, high-voltage verbs. Every adjective must earn its place.',
        formula: 'Bloated: "Es erfolgt eine Prüfung"  →  Stringent: "Die Kommission prüft..."',
        examples: [
          {
            target: 'Eine prägnante Formulierung verleiht dem gesamten Essay spürbare Kohärenz.',
            translation: 'A concise phrasing lends the entire essay palpable coherence.',
            highlight: 'prägnante / Kohärenz',
          },
          {
            target: 'Der stille Paradigmenwechsel vollzieht sich oft subtil, doch seine Wirkung bleibt stringent.',
            translation: 'The quiet paradigm shift often unfolds subtly, yet its impact remains rigorous.',
            highlight: 'Paradigmenwechsel / stringent',
          },
        ],
        proTip:
          'In the final 5 minutes of GDS Schreiben, hunt down weak fillers ("sehr", "eigentlich", "gewissermaßen", "es gibt") and upgrade them.',
      },
      {
        id: 'de-c2-m3-s2',
        heading: 'Precision Punctuation & Stylistic Cadence',
        explanation:
          'Alternate crisp short declarative sentences with well-balanced hypotactic periods; use colons (:) and semicolons (;) purposefully to illuminate logical cause or antithesis without losing reader momentum.',
        formula: 'Long analytical period + Colon/Semicolon + Short punchy verdict = C2 rhythmic sovereignty',
        examples: [
          {
            target: 'Technik verspricht Effizienz; kulturelle Reife hingegen verlangt Urteilskraft.',
            translation: 'Technology promises efficiency; cultural maturity, by contrast, demands judgment.',
            highlight: '; ... hingegen',
          },
          {
            target: 'Sprachliche Souveränität zeigt sich nicht in Fremdwortketten, sondern in glasklarer Präzision.',
            translation: 'Linguistic mastery shows itself not in chains of loanwords, but in crystal-clear precision.',
            highlight: 'Souveränität',
          },
        ],
        proTip:
          'Clarity beats obscurity even at C2: the best GDS essays read like Süddeutsche Zeitung or Die Zeit lead articles.',
      },
    ],
    vocabCards: [
      {
        term: 'die Kohärenz',
        pronunciation: '[diː koheˈʁɛnts]',
        meaning: 'coherence / tight logical unity',
        example: 'Die argumentative Kohärenz des Beitrags überzeugt von Beginn an.',
        exampleNote: 'The argumentative coherence of the piece convinces from the start.',
      },
      {
        term: 'prägnant',
        pronunciation: '[pʁɛɡˈnant]',
        meaning: 'concise / pithy / incisive',
        example: 'Er fasste die komplexe Rechtslage in zwei prägnanten Sätzen zusammen.',
        exampleNote: 'He summarized the complex legal situation in two incisive sentences.',
      },
      {
        term: 'der Paradigmenwechsel',
        pronunciation: '[deːɐ̯ paʁaˈdɪɡmənˌvɛksl̩]',
        meaning: 'paradigm shift',
        example: 'Die Energiewende markiert einen historischen Paradigmenwechsel.',
        exampleNote: 'The energy transition marks a historic paradigm shift.',
      },
      {
        term: 'subtil',
        pronunciation: '[zʊpˈtiːl]',
        meaning: 'subtle / finely shaded',
        example: 'Durch subtile Ironie bricht die Autorin gängige Klischees auf.',
        exampleNote: 'Through subtle irony, the author breaks open common clichés.',
      },
      {
        term: 'stringent',
        pronunciation: '[ʃtʁɪŋˈɡɛnt]',
        meaning: 'rigorous / tightly logical',
        example: 'Die Beweisführung bleibt bis zur Schlussfolgerung vollkommen stringent.',
        exampleNote: 'The line of proof remains completely rigorous right through to the conclusion.',
      },
      {
        term: 'die Souveränität',
        pronunciation: '[diː zuveʁɛniˈtɛːt]',
        meaning: 'command / poise / sovereignty',
        example: 'Mit ruhiger Souveränität begegnete sie jeder kritischen Nachfrage.',
        exampleNote: 'With calm poise she met every critical follow-up question.',
      },
    ],
    practiceQuestions: [
      {
        id: 'de-c2-m3-q1',
        skill: 'writing',
        prompt: 'Which edit eliminates redundancy most effectively for C2 editorial quality?',
        options: [
          'Es ist der Fall, dass ein neuer Paradigmenwechsel stattfindet.',
          'Ein tiefgreifender Paradigmenwechsel zeichnet sich ab.',
          'Man kann tatsächlich sagen, dass sich irgendwie ein Wechsel ergibt.',
        ],
        correctIndex: 1,
        explanation:
          'Stripping dummy clauses ("Es ist der Fall, dass...") and choosing an exact verb ("zeichnet sich ab") yields crisp C2 elegance.',
      },
      {
        id: 'de-c2-m3-q2',
        skill: 'reading',
        prompt: 'What does a "stringente Argumentation" mean?',
        options: [
          'An overly rigid, narrow-minded argument',
          'A tightly logical, consistent, compelling line of reasoning',
          'A decorative but unstructured essay',
        ],
        correctIndex: 1,
        explanation:
          'Unlike English "stringent" (strict), German "stringent" in academic prose means logically cohesive and airtight (a classic false-friend nuance!).',
      },
      {
        id: 'de-c2-m3-q3',
        skill: 'writing',
        prompt: 'Why is alternating sentence lengths recommended in GDS Schreiben?',
        options: [
          'Because short sentences are forbidden at C2',
          'Because pairing complex periods with concise verdicts sharpens rhythm and emphasis',
          'Because examiners count commas',
        ],
        correctIndex: 1,
        explanation:
          'Controlled cadence — complex synthesis followed by a crisp thesis sentence — showcases true editorial sovereignty.',
      },
    ],
    checkpointSkill: 'writing',
    checkpointMinWords: 140,
    checkpointModelAnswer:
      'Sprachliche Souveränität bemisst sich nicht an akademischer Schwere, sondern an prägnanter Klarheit. Wer einen Paradigmenwechsel überzeugend deuten will, benötigt eine stringente Gedankenführung und spürbare Kohärenz. Zu oft verstellen modische Floskeln den Blick auf den Kern; subtile Differenzierung hingegen schärft das Urteil. Gerade unter Zeitdruck trennt kluges Streichen das Wesentliche vom Ballast. Ein klarer Satz trägt weiter als drei verschachtelte Umwege.',
  },
};
