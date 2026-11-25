import {
  ListeningExamTrack,
  ReadingExamPart,
  SpeakingExamPart,
  WritingExamTask,
} from '../types';

export interface MockExamRealWorldExtension {
  officialMinutes: number;
  requireAllSkillsPass: boolean;
  extraReadingParts: ReadingExamPart[];
  extraListeningTracks: ListeningExamTrack[];
  extraWritingTask: WritingExamTask;
  speakingPart1: SpeakingExamPart;
  speakingPart3: SpeakingExamPart;
  primaryAccentCode: string;
}

/**
 * Real-world multi-part exam expansions for ALL 12 Simulated Certification Exams
 * (German A1–C2 Goethe/telc/TestDaF + English A1–C2 Cambridge/IELTS/TOEFL).
 * Each exam gains:
 * - 3 Reading Parts (Comprehension + Richtig/Falsch or TFNG + Sprachbausteine/Use of English = 9 Qs)
 * - 3 Multi-Accent Listening Tracks (DE/AT/CH for German; GB/AU/US/IE/IN for English = 9 Qs)
 * - 2 Weighted Writing Tasks (Task 1 40% + Task 2 60%)
 * - 3 Interactive Speaking Parts (Part 1 Warm-Up + Part 2 Timed Cue Card + Part 3 Examiner Pushback)
 */
export const MOCK_EXAM_EXTENSIONS: Record<string, MockExamRealWorldExtension> = {
  // ================================ GERMAN A1–C2 ================================
  'exam-de-a1': {
    officialMinutes: 55,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-a1-read-p2',
        partLabel: 'Lesen · Teil 2 (Aushänge & Richtig/Falsch)',
        format: 'true-false',
        instruction: 'Lesen Sie die kurzen Hinweise und entscheiden Sie: Richtig oder Falsch?',
        passageTitle: 'Stadtbibliothek Mitte & Hausarztpraxis Dr. Lang',
        passage:
          'Stadtbibliothek Mitte: Ausleihe mit Bibliotheksausweis kostenlos. Öffnungszeiten Mo–Fr 10:00–19:00 Uhr, Sa 10:00–14:00 Uhr. Im Lesesaal bitte nicht telefonieren! — Praxis Dr. Lang: Vom 12. bis 16. August machen wir Urlaub. In dringenden Fällen gehen Sie bitte zur Praxis Dr. Kern in der Bahnhofstraße 8.',
        questions: [
          {
            id: 'de-a1-r4',
            prompt: 'Am Samstagnachmittag um 16:00 Uhr kann man in der Stadtbibliothek Bücher ausleihen.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 1,
            explanation: 'Samstags ist die Bibliothek nur von 10:00 bis 14:00 Uhr geöffnet.',
          },
          {
            id: 'de-a1-r5',
            prompt: 'Im Lesesaal darf man keine Telefongespräche führen.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 0,
            explanation: 'Der Hinweis sagt klar: „Im Lesesaal bitte nicht telefonieren!“',
          },
          {
            id: 'de-a1-r6',
            prompt: 'Am 14. August hilft Frau/Herr Dr. Kern bei dringenden Problemen.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 0,
            explanation: 'Vom 12. bis 16. August hat Dr. Lang Urlaub; Vertretung ist Dr. Kern.',
          },
        ],
      },
      {
        id: 'de-a1-read-p3',
        partLabel: 'Lesen · Teil 3 (Alltagssituationen & Sprachbausteine)',
        format: 'cloze',
        instruction: 'Wählen Sie das richtige Wort für das offizielle Anmeldeformular und die E-Mail.',
        passageTitle: 'Kurze Anmeldung im Sportverein',
        passage:
          'Guten Tag, ich möchte mich [1] einen Schwimmkurs anmelden. Ich habe [2] Dienstag um 18 Uhr Zeit. Leider habe ich noch [3] Mitgliedsausweis.',
        questions: [
          {
            id: 'de-a1-r7',
            prompt: 'Lücke [1]: „ich möchte mich ___ einen Schwimmkurs anmelden.“',
            options: ['für', 'mit', 'bei', 'aus'],
            correctIndex: 0,
            explanation: 'Festes Verb-Präposition-Paar: „sich anmelden für + Akkusativ“.',
          },
          {
            id: 'de-a1-r8',
            prompt: 'Lücke [2]: „Ich habe ___ Dienstag um 18 Uhr Zeit.“',
            options: ['im', 'am', 'um', 'zu'],
            correctIndex: 1,
            explanation: 'Wochentage stehen immer mit „am“ (am Dienstag).',
          },
          {
            id: 'de-a1-r9',
            prompt: 'Lücke [3]: „Leider habe ich noch ___ Mitgliedsausweis.“ (der Ausweis)',
            options: ['nicht', 'kein', 'keinen', 'keine'],
            correctIndex: 2,
            explanation: '„haben“ + maskuliner Akkusativ ohne Artikel verlangt „keinen“.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-a1-listen-t2',
        partLabel: 'Hören · Teil 2 (Anrufbeantworter · Österreich AT)',
        contextNote: 'Sie hören eine Nachricht aus Wien auf Ihrem Anrufbeantworter.',
        accentCode: 'de-AT',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Grüß Gott, hier ist das Hotel Donau in Wien. Sie haben ein Einzelzimmer für Freitag gebucht. Das Frühstück gibt es von sieben bis zehn Uhr im ersten Stock. Bitte sagen Sie uns kurz Bescheid, wann Sie am Freitag ankommen. Unsere Rezeption ist bis zweiundzwanzig Uhr besetzt.',
        hearingFocusTrap: 'Achten Sie auf Frühstückszeiten (7–10 Uhr), Stockwerk (1. Stock) und Rezeptionsschluss (22 Uhr).',
        questions: [
          {
            id: 'de-a1-l4',
            prompt: 'Wo gibt es im Hotel Donau das Frühstück?',
            options: ['Im Erdgeschoss', 'Im ersten Stock', 'Im Garten', 'Auf dem Zimmer'],
            correctIndex: 1,
            explanation: 'Die Nachricht sagt: „von sieben bis zehn Uhr im ersten Stock.“',
          },
          {
            id: 'de-a1-l5',
            prompt: 'Bis wann ist die Rezeption am Abend besetzt?',
            options: ['Bis 20:00 Uhr', 'Bis 21:00 Uhr', 'Bis 22:00 Uhr', 'Die ganze Nacht'],
            correctIndex: 2,
            explanation: '„Unsere Rezeption ist bis zweiundzwanzig Uhr besetzt.“',
          },
          {
            id: 'de-a1-l6',
            prompt: 'Was soll der Gast tun?',
            options: ['Sofort bar bezahlen', 'Die Ankunftszeit mitteilen', 'Das Zimmer stornieren', 'Ein Handtuch mitbringen'],
            correctIndex: 1,
            explanation: '„Bitte sagen Sie uns kurz Bescheid, wann Sie am Freitag ankommen.“',
          },
        ],
      },
      {
        id: 'de-a1-listen-t3',
        partLabel: 'Hören · Teil 3 (Bahnhofsdurchsage · Schweiz CH)',
        contextNote: 'Sie warten am Bahnhof in Zürich und hören eine Durchsage.',
        accentCode: 'de-CH',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Grüezi liebe Reisende! Der Intercity nach Basel um dreizehn Uhr zehn hat heute leider fünfzehn Minuten Verspätung. Er fährt außerdem nicht von Gleis sechs, sondern von Gleis neun ab. Wir danken Ihnen für Ihr Verständnis.',
        hearingFocusTrap: 'Gleiswechsel-Falle: Nicht Gleis 6, sondern Gleis 9 — und 15 Minuten Verspätung!',
        questions: [
          {
            id: 'de-a1-l7',
            prompt: 'Wohin fährt der Zug?',
            options: ['Nach Bern', 'Nach Basel', 'Nach Genf', 'Nach München'],
            correctIndex: 1,
            explanation: 'Es geht um den Intercity nach Basel.',
          },
          {
            id: 'de-a1-l8',
            prompt: 'Wie viel Verspätung hat der Zug heute?',
            options: ['5 Minuten', '10 Minuten', '15 Minuten', '30 Minuten'],
            correctIndex: 2,
            explanation: '„hat heute leider fünfzehn Minuten Verspätung.“',
          },
          {
            id: 'de-a1-l9',
            prompt: 'Von welchem Gleis fährt der Zug ab?',
            options: ['Von Gleis 6', 'Von Gleis 9', 'Von Gleis 13', 'Von Gleis 10'],
            correctIndex: 1,
            explanation: '„nicht von Gleis sechs, sondern von Gleis neun.“',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-a1-write-t2',
      partLabel: 'Schreiben · Teil 2 (Kurze Nachricht an Freunde)',
      scenario: 'Sie machen am Sonntag ein kleines Picknick im Park. Schreiben Sie eine kurze Nachricht an Ihre Freundin Mia.',
      taskRequirements: [
        'Laden Sie Mia zum Picknick ein und nennen Sie die Uhrzeit.',
        'Sagen Sie, wo Sie sich treffen.',
        'Schreiben Sie, was Mia mitbringen kann.',
      ],
      minWords: 30,
      maxWords: 60,
      weightPercent: 55,
      keyRubricKeywords: ['Sonntag', 'Picknick', 'Park', 'Uhr', 'mitbringen', 'Grüße'],
      modelAnswer:
        'Liebe Mia,\nam Sonntag mache ich ein Picknick im Stadtpark! Hast du Zeit? Wir treffen uns um 14 Uhr am Haupteingang. Ich bringe Brot und Käse mit. Kannst du bitte Obst oder Saft mitbringen? Bitte schreib mir kurz!\nViele Grüße,\nAlex',
    },
    speakingPart1: {
      id: 'de-a1-speak-p1',
      partLabel: 'Sprechen · Teil 1 (Sich vorstellen & Buchstabieren)',
      instruction: 'Stellen Sie sich kurz vor und buchstabieren Sie Ihren Nachnamen sowie Ihre Stadt.',
      prepSeconds: 15,
      speakSeconds: 45,
      prompts: [
        'Name, Alter und Herkunftsland',
        'Wohnort, Sprachen und Beruf/Studium',
        'Buchstabieren Sie Ihren Nachnamen und nennen Sie Ihre Telefonnummer.',
      ],
      examinerPromptAudio: 'Guten Tag! Herzlich willkommen zur Prüfung. Bitte stellen Sie sich kurz vor und buchstabieren Sie Ihren Nachnamen.',
      keyRubricKeywords: ['heiße', 'komme', 'wohne', 'spreche', 'Beruf', 'Hobby'],
      modelResponseScript:
        'Guten Tag! Ich heiße Alex Weber, bin siebenundzwanzig Jahre alt und komme aus Kanada. Jetzt wohne ich in Berlin. Ich spreche Englisch, Französisch und ein bisschen Deutsch. Von Beruf bin ich Designer. Mein Nachname buchstabiert man W-E-B-E-R.',
    },
    speakingPart3: {
      id: 'de-a1-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Bitten formulieren & Reagieren)',
      instruction: 'Formulieren Sie zwei höfliche Bitten (Fenster schließen / Weg zum Bahnhof) und reagieren Sie auf eine Bitte.',
      prepSeconds: 15,
      speakSeconds: 45,
      prompts: [
        'Bitte 1 (Karte „Fenster“): Bitten Sie höflich, das Fenster zu schließen.',
        'Bitte 2 (Karte „Stadtplan“): Bitten Sie um einen Stadtplan oder den Weg zum Bahnhof.',
        'Reaktion: Ihr Partner fragt nach einem Stift — antworten Sie höflich.',
      ],
      examinerPromptAudio: 'Bitte formulieren Sie jetzt höfliche Bitten für diese Karten. Entschuldigung, könnten Sie mir bitte einen Stift leihen?',
      keyRubricKeywords: ['bitte', 'Könnten', 'Fenster', 'Bahnhof', 'gern', 'natürlich'],
      modelResponseScript:
        'Entschuldigung, es ist hier kalt — könnten Sie bitte das Fenster schließen? Und noch eine Frage: Könnten Sie mir bitte den Weg zum Bahnhof zeigen? Zu Ihrer Frage: Ja, natürlich, hier ist mein Stift, gern geschehen!',
    },
  },

  'exam-de-a2': {
    officialMinutes: 65,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-a2-read-p2',
        partLabel: 'Lesen · Teil 2 (Veranstaltungs-Infotafel · Richtig/Falsch)',
        format: 'true-false',
        instruction: 'Lesen Sie die Informationen zum Stadtfest und prüfen Sie jede Aussage.',
        passageTitle: 'Bürgerhaus West — Programm am Wochenende',
        passage:
          'Samstag 10:00–16:00 Uhr: Fahrrad-Flohmarkt im Innenhof. Eigene Räder können ab 08:30 Uhr ohne Anmeldung verkauft werden; Standgebühr 5 €. Bei Regen ziehen wir in die Turnhalle um. Sonntag 14:00 Uhr: Internationales Kochcafé — Eintritt frei, bitte melden Sie sich bis Freitag per E-Mail an.',
        questions: [
          {
            id: 'de-a2-r4',
            prompt: 'Für den Fahrrad-Flohmarkt muss man sich vorher schriftlich anmelden.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 1,
            explanation: 'Eigene Räder können „ohne Anmeldung verkauft werden“.',
          },
          {
            id: 'de-a2-r5',
            prompt: 'Wenn es am Samstag regnet, fällt der Flohmarkt aus.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 1,
            explanation: 'Bei Regen zieht der Markt einfach in die Turnhalle um.',
          },
          {
            id: 'de-a2-r6',
            prompt: 'Das Internationale Kochcafé am Sonntag kostet keinen Eintritt, braucht aber eine Anmeldung.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 0,
            explanation: '„Eintritt frei, bitte melden Sie sich bis Freitag per E-Mail an.“',
          },
        ],
      },
      {
        id: 'de-a2-read-p3',
        partLabel: 'Lesen · Teil 3 (Sprachbausteine · Dativ, Perfekt & Nebensätze)',
        format: 'cloze',
        instruction: 'Wählen Sie die grammatisch richtige Form für die E-Mail.',
        passageTitle: 'Umzug in eine neue Wohnung',
        passage:
          'Liebe Lara, gestern [1] wir endlich in unsere neue Wohnung umgezogen! Sie liegt direkt neben [2] Stadtpark. Ich lade dich gern ein, [3] ich mit dem Auspacken fertig bin.',
        questions: [
          {
            id: 'de-a2-r7',
            prompt: 'Lücke [1]: „gestern ___ wir endlich ... umgezogen!“',
            options: ['haben', 'sind', 'waren', 'werden'],
            correctIndex: 1,
            explanation: '„umziehen“ (Ortswechsel) bildet das Perfekt mit „sein“: wir sind umgezogen.',
          },
          {
            id: 'de-a2-r8',
            prompt: 'Lücke [2]: „Sie liegt direkt neben ___ Stadtpark.“ (der Park)',
            options: ['den', 'der', 'dem', 'das'],
            correctIndex: 2,
            explanation: 'Statische Lage (Wo?) nach „neben“ verlangt Dativ: dem Stadtpark.',
          },
          {
            id: 'de-a2-r9',
            prompt: 'Lücke [3]: „Ich lade dich gern ein, ___ ich mit dem Auspacken fertig bin.“',
            options: ['deshalb', 'wenn', 'trotzdem', 'aber'],
            correctIndex: 1,
            explanation: 'Bedingung/Zeit in der Zukunft mit Verb am Ende verlangt „wenn“.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-a2-listen-t2',
        partLabel: 'Hören · Teil 2 (Gespräch unter Freunden · Österreich AT)',
        contextNote: 'Sie hören ein kurzes Gespräch zwischen Lukas und Hannah in Graz.',
        accentCode: 'de-AT',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Hannah: Lukas, fahren wir am Samstag mit dem Zug an den See? Lukas: Gern! Aber der Bus um neun Uhr fährt am Wochenende nicht. Wir sollten lieber den Zug um neun Uhr dreißig nehmen. Hannah: Super, ich bringe den Kuchen mit, weil ich gestern gebacken habe. Lukas: Perfekt, dann besorge ich die Getränke.',
        hearingFocusTrap: 'Unterscheiden Sie Bus (fährt nicht) vs. Zug (9:30 Uhr) und wer was mitbringt!',
        questions: [
          {
            id: 'de-a2-l4',
            prompt: 'Wie fahren Hannah und Lukas am Samstag an den See?',
            options: ['Mit dem Bus um 9:00', 'Mit dem Zug um 9:30', 'Mit dem Auto', 'Mit dem Fahrrad'],
            correctIndex: 1,
            explanation: 'Der Bus fährt am Wochenende nicht; sie nehmen den Zug um 9:30 Uhr.',
          },
          {
            id: 'de-a2-l5',
            prompt: 'Was bringt Hannah mit?',
            options: ['Die Getränke', 'Einen Kuchen', 'Die Fahrkarten', 'Eine Decke'],
            correctIndex: 1,
            explanation: 'Hannah sagt: „ich bringe den Kuchen mit, weil ich gestern gebacken habe.“',
          },
          {
            id: 'de-a2-l6',
            prompt: 'Worum kümmert sich Lukas?',
            options: ['Um die Getränke', 'Um das Backen', 'Um das Hotel', 'Um die Musik'],
            correctIndex: 0,
            explanation: 'Lukas antwortet: „dann besorge ich die Getränke.“',
          },
        ],
      },
      {
        id: 'de-a2-listen-t3',
        partLabel: 'Hören · Teil 3 (Kundenservice-Nachricht · Schweiz CH)',
        contextNote: 'Sie hören eine Nachricht von einem Online-Buchladen aus Basel.',
        accentCode: 'de-CH',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Grüezi Frau Keller, hier ist die Buchhandlung Rheinblick. Ihr bestelltes Wörterbuch ist leider im Moment nicht lieferbar, deshalb schicken wir heute zuerst nur die beiden Romane ab. Das Wörterbuch kommt voraussichtlich am Dienstag kostenlos nach. Wenn Sie lieber stornieren möchten, rufen Sie uns bitte bis achtzehn Uhr an.',
        hearingFocusTrap: 'Was wird heute verschickt (2 Romane) vs. was kommt später kostenlos nach (Wörterbuch)?',
        questions: [
          {
            id: 'de-a2-l7',
            prompt: 'Welcher Artikel ist derzeit NICHT lieferbar?',
            options: ['Die beiden Romane', 'Das Wörterbuch', 'Die gesamte Bestellung', 'Ein Kalender'],
            correctIndex: 1,
            explanation: '„Ihr bestelltes Wörterbuch ist leider im Moment nicht lieferbar.“',
          },
          {
            id: 'de-a2-l8',
            prompt: 'Wann soll das Wörterbuch voraussichtlich nachgeliefert werden?',
            options: ['Am Montag', 'Am Dienstag', 'Am Freitag', 'Nächsten Monat'],
            correctIndex: 1,
            explanation: '„Das Wörterbuch kommt voraussichtlich am Dienstag kostenlos nach.“',
          },
          {
            id: 'de-a2-l9',
            prompt: 'Bis wann soll Frau Keller anrufen, falls sie stornieren möchte?',
            options: ['Bis 12:00 Uhr', 'Bis 16:00 Uhr', 'Bis 18:00 Uhr', 'Bis morgen früh'],
            correctIndex: 2,
            explanation: '„rufen Sie uns bitte bis achtzehn Uhr an.“',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-a2-write-t2',
      partLabel: 'Schreiben · Teil 2 (Formelle E-Mail an die Kursleitung)',
      scenario: 'Sie können am Donnerstag nicht am Deutschkurs teilnehmen, weil Sie einen wichtigen Arzttermin haben. Schreiben Sie an Ihre Lehrerin Frau Novak.',
      taskRequirements: [
        'Entschuldigen Sie sich und nennen Sie den Grund.',
        'Fragen Sie nach den Hausaufgaben für das Wochenende.',
        'Sagen Sie, wann Sie wieder in den Kurs kommen.',
      ],
      minWords: 45,
      maxWords: 85,
      weightPercent: 60,
      keyRubricKeywords: ['entschuldigen', 'Arzttermin', 'weil', 'Hausaufgaben', 'Montag', 'Grüße'],
      modelAnswer:
        'Sehr geehrte Frau Novak,\nich muss mich leider für Donnerstag entschuldigen, weil ich einen dringenden Arzttermin habe, den ich nicht verschieben konnte. Könnten Sie mir bitte schreiben, welche Hausaufgaben wir bis nächste Woche machen sollen? Am Montag bin ich auf jeden Fall wieder pünktlich im Kurs. Vielen Dank für Ihr Verständnis!\nMit freundlichen Grüßen,\nSamira Klein',
    },
    speakingPart1: {
      id: 'de-a2-speak-p1',
      partLabel: 'Sprechen · Teil 1 (Fragen zur Person & Alltag)',
      instruction: 'Beantworten Sie drei kurze Fragen des Prüfers zu Freizeit, Arbeit/Studium und Reisen.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'Was machen Sie normalerweise am Wochenende?',
        'Wie kommen Sie täglich zur Arbeit oder zur Uni?',
        'Wohin sind Sie in Ihrem letzten Urlaub gefahren?',
      ],
      examinerPromptAudio: 'Hallo! Erzählen Sie mir kurz: Was machen Sie gern am Wochenende und wohin sind Sie in Ihrem letzten Urlaub gefahren?',
      keyRubricKeywords: ['Wochenende', 'gefahren', 'gern', 'weil', 'besichtigt'],
      modelResponseScript:
        'Am Wochenende treffe ich mich gern mit Freunden oder gehe im Park joggen, weil das sehr entspannend ist. Unter der Woche fahre ich meistens mit der U-Bahn zur Arbeit. In meinem letzten Urlaub bin ich mit dem Zug nach Salzburg gefahren und habe dort die Altstadt besichtigt.',
    },
    speakingPart3: {
      id: 'de-a2-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Etwas gemeinsam planen · Terminkalender)',
      instruction: 'Planen Sie gemeinsam ein Abschiedsgeschenk für eine Kollegin. Reagieren Sie auf den Vorschlag des Prüfers.',
      prepSeconds: 20,
      speakSeconds: 60,
      prompts: [
        'Reagieren Sie auf Freitag 17:00 Uhr (Sie arbeiten bis 18:00).',
        'Machen Sie einen Gegenvorschlag für Samstag.',
        'Schlagen Sie ein konkretes Geschenk vor und teilen Sie die Aufgaben auf.',
      ],
      examinerPromptAudio: 'Wollen wir am Freitag um siebzehn Uhr zusammen ein Geschenk für unsere Kollegin kaufen? Was hältst du von Blumen?',
      keyRubricKeywords: ['leider', 'vorschlagen', 'Samstag', 'Geschenk', 'einverstanden', 'besorgen'],
      modelResponseScript:
        'Am Freitag um siebzehn Uhr kann ich leider nicht, weil ich bis achtzehn Uhr arbeite. Wie wäre es am Samstag um elf Uhr im Zentrum? Blumen sind nett, aber ein Fotobuch oder ein gutes Kochbuch finde ich noch persönlicher. Ich kann gern die Karte besorgen — bist du einverstanden? Super, dann machen wir Samstag elf Uhr ab!',
    },
  },

  'exam-de-b1': {
    officialMinutes: 85,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-b1-read-p2',
        partLabel: 'Lesen · Teil 2 (Leserbriefe & Pro/Contra-Haltung)',
        format: 'true-false',
        instruction: 'Lesen Sie zwei Meinungen zum Thema „Hausaufgaben abschaffen?“ und ordnen Sie die Haltungen genau zu.',
        passageTitle: 'Online-Forum: Brauchen Schulen noch klassische Hausaufgaben?',
        passage:
          'Kommentar A (Katrin, Mutter): Obwohl ich sehe, dass Kinder nachmittags Erholung brauchen, halte ich kurze Übungen zu Hause für sinnvoll, damit man den Stoff wirklich festigt. Allerdings sollten sie maximal dreißig Minuten dauern. — Kommentar B (Mirko, Lehrer): In Ganztagsschulen werden Lernzeiten längst direkt im Unterricht angeboten. Hausaufgaben führen meiner Erfahrung nach eher zu Streit in Familien und benachteiligen Kinder, deren Eltern wenig helfen können.',
        questions: [
          {
            id: 'de-b1-r4',
            prompt: 'Katrin ist grundsätzlich gegen jede Art von Hausaufgaben.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 1,
            explanation: 'Trotz des Zugeständnisses („Obwohl...“) hält sie kurze Übungen von max. 30 Minuten für sinnvoll.',
          },
          {
            id: 'de-b1-r5',
            prompt: 'Mirko kritisiert, dass Hausaufgaben soziale Ungleichheit verstärken können.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 0,
            explanation: 'Er betont, sie benachteiligen Kinder, „deren Eltern wenig helfen können“.',
          },
          {
            id: 'de-b1-r6',
            prompt: 'Beide Kommentatoren fordern ein landesweites Verbot von Ganztagsschulen.',
            options: ['Richtig', 'Falsch', 'Steht nicht im Text'],
            correctIndex: 1,
            explanation: 'Mirko erwähnt Ganztagsschulen sogar positiv als Alternative zu Hausaufgaben.',
          },
        ],
      },
      {
        id: 'de-b1-read-p3',
        partLabel: 'Lesen · Teil 3 (Sprachbausteine · obwohl/trotzdem/damit/Relativsatz)',
        format: 'cloze',
        instruction: 'Wählen Sie jeweils die präzise B1-Struktur.',
        passageTitle: 'Ehrenamt im Sportverein',
        passage:
          'Viele Jugendliche engagieren sich ehrenamtlich, [1] sie neue Kontakte knüpfen und Verantwortung lernen. [2] die Arbeit viel Zeit kostet, berichten fast alle positiv. Das ist eine Erfahrung, [3] später auch im Beruf hilft.',
        questions: [
          {
            id: 'de-b1-r7',
            prompt: 'Lücke [1]: „Viele engagieren sich, ___ sie neue Kontakte knüpfen.“',
            options: ['um', 'damit', 'trotzdem', 'wegen'],
            correctIndex: 1,
            explanation: 'Nachfolgender Nebensatz mit konjugiertem Verb („knüpfen“) verlangt „damit“ (nicht „um...zu“).',
          },
          {
            id: 'de-b1-r8',
            prompt: 'Lücke [2]: „___ die Arbeit viel Zeit kostet, berichten fast alle positiv.“',
            options: ['Trotzdem', 'Deshalb', 'Obwohl', 'Allerdings'],
            correctIndex: 2,
            explanation: 'Verb steht am Nebensatzende („kostet“) → Subjunktor „Obwohl“.',
          },
          {
            id: 'de-b1-r9',
            prompt: 'Lücke [3]: „Das ist eine Erfahrung, ___ später auch im Beruf hilft.“ (die Erfahrung)',
            options: ['der', 'die', 'den', 'dem'],
            correctIndex: 1,
            explanation: 'Feminin Nominativ (Subjekt von „hilft“) → Relativpronomen „die“.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-b1-listen-t2',
        partLabel: 'Hören · Teil 2 (Radio-Talkshow · Österreich AT)',
        contextNote: 'Sie hören einen Ausschnitt aus einer Wiener Radiosendung über autofreie Innenstädte.',
        accentCode: 'de-AT',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Moderator: Frau Berger, profitieren Geschäfte von autofreien Einkaufsstraßen? Frau Berger: Anfangs befürchteten viele Händler weniger Umsatz. Nachdem aber unsere Straße vor zwei Jahren umgebaut wurde, kamen deutlich mehr Fußgänger und Familien. Einerseits fehlen manchen Handwerkern Parkplätze vor der Tür, andererseits hat sich der Umsatz in Cafés und kleinen Läden klar erhöht.',
        hearingFocusTrap: 'Achten Sie auf den Gegensatz zwischen der anfänglichen Angst und dem Ergebnis nach dem Umbau!',
        questions: [
          {
            id: 'de-b1-l4',
            prompt: 'Welche Sorge hatten viele Händler vor dem Umbau?',
            options: ['Zu viele Touristen', 'Sinkende Umsätze', 'Höhere Steuern', 'Zu laute Straßenbahnen'],
            correctIndex: 1,
            explanation: '„Anfangs befürchteten viele Händler weniger Umsatz.“',
          },
          {
            id: 'de-b1-l5',
            prompt: 'Wie hat sich die Situation nach zwei Jahren entwickelt?',
            options: ['Viele Läden mussten schließen', 'Es kamen mehr Fußgänger und die Umsätze stiegen', 'Autos dürfen wieder überall parken', 'Nichts hat sich verändert'],
            correctIndex: 1,
            explanation: 'Es kamen mehr Fußgänger und der Umsatz in Cafés und kleinen Läden erhöhte sich.',
          },
          {
            id: 'de-b1-l6',
            prompt: 'Welche Gruppe nennt Frau Berger als noch bestehende Herausforderung?',
            options: ['Schulkinder', 'Handwerker wegen fehlender Parkplätze', 'Radfahrer', 'Hotelgäste'],
            correctIndex: 1,
            explanation: '„Einerseits fehlen manchen Handwerkern Parkplätze vor der Tür...“',
          },
        ],
      },
      {
        id: 'de-b1-listen-t3',
        partLabel: 'Hören · Teil 3 (Museumsführung · Schweiz CH)',
        contextNote: 'Sie nehmen an einer Führung im Verkehrshaus in Luzern teil.',
        accentCode: 'de-CH',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Herzlich willkommen! Bevor wir in die Eisenbahnhalle gehen, ein kurzer Hinweis: Fotografieren ohne Blitz ist überall gestattet, aber das Berühren der historischen Lokomotiven ist leider untersagt. Um zwölf Uhr machen wir dreißig Minuten Pause im Bistro; danach treffen wir uns pünktlich vor dem Planetarium.',
        hearingFocusTrap: 'Unterscheiden Sie „gestattet“ (Fotos ohne Blitz) vs. „untersagt“ (Berühren) und den Treffpunkt nach der Pause!',
        questions: [
          {
            id: 'de-b1-l7',
            prompt: 'Was ist während der Führung erlaubt?',
            options: ['Fotografieren ohne Blitz', 'In die alten Lokomotiven einsteigen', 'Mit Blitz fotografieren', 'Essen in der Ausstellungshalle'],
            correctIndex: 0,
            explanation: '„Fotografieren ohne Blitz ist überall gestattet.“',
          },
          {
            id: 'de-b1-l8',
            prompt: 'Wie lange dauert die Mittagspause?',
            options: ['15 Minuten', '30 Minuten', '45 Minuten', 'Eine Stunde'],
            correctIndex: 1,
            explanation: '„Um zwölf Uhr machen wir dreißig Minuten Pause im Bistro.“',
          },
          {
            id: 'de-b1-l9',
            prompt: 'Wo trifft sich die Gruppe nach der Pause?',
            options: ['Am Haupteingang', 'In der Eisenbahnhalle', 'Vor dem Planetarium', 'Im Souvenirshop'],
            correctIndex: 2,
            explanation: '„danach treffen wir uns pünktlich vor dem Planetarium.“',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-b1-write-t2',
      partLabel: 'Schreiben · Teil 2 (Online-Diskussionsbeitrag · Meinung)',
      scenario: 'In einem Internetforum wird diskutiert: „Sollten Jugendliche unter 16 Jahren soziale Medien nutzen dürfen?“ Schreiben Sie einen strukturierten Diskussionsbeitrag.',
      taskRequirements: [
        'Nennen Sie Ihre eigene Meinung klar am Anfang.',
        'Wägen Sie mindestens einen Vorteil und einen Nachteil ab (einerseits/andererseits oder obwohl).',
        'Machen Sie einen konkreten Vorschlag für Eltern oder Schulen.',
      ],
      minWords: 80,
      maxWords: 130,
      weightPercent: 60,
      keyRubricKeywords: ['Meinung', 'Vorteil', 'Nachteil', 'obwohl', 'einerseits', 'andererseits', 'Schule'],
      modelAnswer:
        'Zum Thema soziale Medien für Jugendliche möchte ich meine Meinung äußern. Meiner Ansicht nach sollte ein strenges Verbot nicht die einzige Lösung sein, obwohl es klare Risiken gibt. Einerseits helfen Plattformen jungen Menschen, Kontakte zu pflegen und kreative Lerninhalte zu entdecken. Andererseits beeinflussen übermäßige Bildschirmzeit und unrealistische Bilder oft das Selbstbewusstsein negativ. Deshalb halte ich eine feste Altersgrenze ab vierzehn Jahren kombiniert mit Medienunterricht in der Schule für sinnvoll. So lernen Jugendliche frühzeitig, kritisch und sicher mit digitalen Angeboten umzugehen.',
    },
    speakingPart1: {
      id: 'de-b1-speak-p1',
      partLabel: 'Sprechen · Teil 1 (Gemeinsam etwas planen)',
      instruction: 'Planen Sie gemeinsam mit Ihrem Prüfer einen internationalen Kochabend für Ihren Deutschkurs.',
      prepSeconds: 20,
      speakSeconds: 75,
      prompts: [
        'Wann und wo soll der Kochabend stattfinden?',
        'Wie teilen Sie Einkauf, Kosten und Gerichte auf?',
        'Reagieren Sie auf einen Einwand des Partners und finden Sie eine Lösung.',
      ],
      examinerPromptAudio: 'Hallo! Ich finde die Idee für einen internationalen Kochabend toll. Hast du am Freitagabend Zeit? Leider ist meine Küche ziemlich klein — hast du einen Vorschlag?',
      keyRubricKeywords: ['vorschlagen', 'übernehmen', 'kümmern', 'Samstag', 'einverstanden', 'weil'],
      modelResponseScript:
        'Am Freitagabend passt es mir leider nicht so gut, weil ich lange arbeite. Wie wäre es stattdessen am Samstag um siebzehn Uhr? Wenn deine Küche klein ist, schlage ich vor, dass wir den Gemeinschaftsraum in der Sprachschule reservieren! Jeder Teilnehmer könnte ein typisches Gericht aus seinem Land kochen und wir teilen die Kosten fair auf. Ich übernehme gern die Getränke und die Einladungen — bist du damit einverstanden?',
    },
    speakingPart3: {
      id: 'de-b1-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Rückmeldung & Anschlussfrage beantworten)',
      instruction: 'Beantworten Sie die kritische Nachfrage des Prüfers zu Ihrer Präsentation mit Begründung und Beispiel.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'Nehmen Sie kurz Stellung zur Frage des Prüfers.',
        'Begründen Sie Ihre Haltung mit einer persönlichen Erfahrung oder einem Beispiel.',
        'Fassen Sie Ihren Standpunkt klar zusammen.',
      ],
      examinerPromptAudio: 'Vielen Dank für Ihren interessanten Vortrag! Eine Frage dazu: Glauben Sie wirklich, dass sich die Gewohnheiten der Menschen so schnell ändern lassen?',
      keyRubricKeywords: ['Erfahrung', 'allerdings', 'lohnen', 'Schritt', 'Meinung', 'trotzdem'],
      modelResponseScript:
        'Das ist eine sehr gute Frage. Ich gebe zu, dass Gewohnheiten sich nicht über Nacht ändern lassen; allerdings zeigt meine eigene Erfahrung, dass kleine Schritte enorm viel bewirken. Als ich vor einem Jahr begann, kürzere Strecken mit dem Fahrrad zu fahren, war es anfangs ungewohnt. Trotzdem habe ich schnell gemerkt, wie gut es mir tut. Meiner Meinung nach lohnt sich deshalb jede schrittweise Veränderung.',
    },
  },

  'exam-de-b2': {
    officialMinutes: 100,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-b2-read-p2',
        partLabel: 'Lesen · Teil 2 (Kommentar & Haltungsanalyse · Richtig/Falsch/Nicht im Text)',
        format: 'tfng',
        instruction: 'Lesen Sie den Pressetext zur Vier-Tage-Woche und bestimmen Sie genau, was belegt, widerlegt oder nicht erwähnt wird.',
        passageTitle: 'Pilotversuch Vier-Tage-Woche: Ernüchterung oder Aufbruch?',
        passage:
          'In einer sechsmonatigen Pilotphase erprobten 45 deutsche Mittelstandsbetriebe die Vier-Tage-Woche bei vollem Lohnausgleich. Laut Abschlussbericht sank der Krankenstand um zwölf Prozent, während die Produktivität stabil blieb, da überflüssige Besprechungen konsequent gestrichen wurden. In der Pflege und Gastronomie stieß das Modell jedoch aufgrund starrer Öffnungszeiten rasch an Grenzen.',
        questions: [
          {
            id: 'de-b2-r4',
            prompt: 'Die teilnehmenden Unternehmen kürzten während der Pilotphase die Gehälter um 20 Prozent.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 1,
            explanation: 'Der Text nennt ausdrücklich „bei vollem Lohnausgleich“ (keine Lohnkürzung).',
          },
          {
            id: 'de-b2-r5',
            prompt: 'Durch das Streichen unnötiger Meetings konnte die Arbeitsleistung trotz kürzerer Arbeitszeit gehalten werden.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 0,
            explanation: '„während die Produktivität stabil blieb, da überflüssige Besprechungen konsequent gestrichen wurden.“',
          },
          {
            id: 'de-b2-r6',
            prompt: 'Alle 45 Betriebe haben das Modell inzwischen dauerhaft für die nächsten zehn Jahre festgeschrieben.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 2,
            explanation: 'Über eine zehnjährige Festschreibung aller 45 Betriebe steht nichts im Text.',
          },
        ],
      },
      {
        id: 'de-b2-read-p3',
        partLabel: 'Lesen · Teil 3 (Sprachbausteine · Nomen-Verb, Genitiv & Passiv-Ersatz)',
        format: 'cloze',
        instruction: 'Wählen Sie die stilistisch und grammatisch präzise B2-Ergänzung.',
        passageTitle: 'Nachhaltige Stadtplanung',
        passage:
          '[1] steigender Hitzetage müssen Städte neue Grünflächen schaffen. Dieses Ziel [2] nur durch langfristige Investitionen erreichen. Je früher Kommunen handeln, [3] niedriger bleiben die Folgekosten.',
        questions: [
          {
            id: 'de-b2-r7',
            prompt: 'Lücke [1]: „___ steigender Hitzetage müssen Städte neue Grünflächen schaffen.“',
            options: ['Aufgrund', 'Trotzdem', 'Indem', 'Obwohl'],
            correctIndex: 0,
            explanation: 'Kausale Genitiv-Präposition „Aufgrund“ + „steigender Hitzetage“.',
          },
          {
            id: 'de-b2-r8',
            prompt: 'Lücke [2]: „Dieses Ziel ___ nur durch langfristige Investitionen erreichen.“',
            options: ['lässt sich', 'wird sich', 'hat sich', 'bleibt sich'],
            correctIndex: 0,
            explanation: 'Passiv-Ersatzform „sich lassen + Infinitiv“ (= kann erreicht werden).',
          },
          {
            id: 'de-b2-r9',
            prompt: 'Lücke [3]: „Je früher Kommunen handeln, ___ niedriger bleiben die Folgekosten.“',
            options: ['als', 'desto', 'sofern', 'damit'],
            correctIndex: 1,
            explanation: 'Proportionaler Doppelkonnektor: „Je ... desto ...“.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-b2-listen-t2',
        partLabel: 'Hören · Teil 2 (Universitäts-Interview · Österreich AT)',
        contextNote: 'Sie hören ein Interview mit einer Bildungsforscherin an der Universität Wien.',
        accentCode: 'de-AT',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Interviewer: Frau Professorin Novak, ersetzen KI-Lernassistenten bald klassische Nachhilfe? Novak: Das lässt sich so pauschal keineswegs sagen. Zwar stehen digitale Erklärungen rund um die Uhr zur Verfügung und senken Hemmschwellen bei Rückfragen. Infolgedessen profitieren besonders selbstständige Lernende. Wer jedoch grundlegende Motivationsprobleme hat, braucht nach wie vor menschliche Begleitung, die individuell ermutigt.',
        hearingFocusTrap: 'Unterscheiden Sie, welche Schülergruppe profitiert vs. wer weiterhin menschliche Begleitung braucht!',
        questions: [
          {
            id: 'de-b2-l4',
            prompt: 'Welchen Vorteil digitaler Lernassistenten nennt Prof. Novak?',
            options: ['Sie sind immer kostenlos', 'Sie sind jederzeit verfügbar und senken Hemmungen bei Fragen', 'Sie machen Prüfungen unnötig', 'Sie ersetzen Lehrkräfte komplett'],
            correctIndex: 1,
            explanation: 'Sie nennt ständige Verfügbarkeit und niedrigere Hemmschwellen bei Rückfragen.',
          },
          {
            id: 'de-b2-l5',
            prompt: 'Wer profitiert laut Novak am meisten von KI-Lernhilfen?',
            options: ['Besonders selbstständige Lernende', 'Ausschließlich Grundschulkinder', 'Lernende ohne Internetzugang', 'Nur Hochschuldozenten'],
            correctIndex: 0,
            explanation: '„Infolgedessen profitieren besonders selbstständige Lernende.“',
          },
          {
            id: 'de-b2-l6',
            prompt: 'Warum bleiben menschliche Tutoren laut Interview unverzichtbar?',
            options: ['Wegen technischer Stromausfälle', 'Für persönliche Motivation bei Lernenden mit Motivationsproblemen', 'Weil KI kein Deutsch versteht', 'Aus rein rechtlichen Gründen'],
            correctIndex: 1,
            explanation: 'Lernende mit Motivationsproblemen brauchen individuelle menschliche Ermutigung.',
          },
        ],
      },
      {
        id: 'de-b2-listen-t3',
        partLabel: 'Hören · Teil 3 (Wirtschaftsbericht · Schweiz CH)',
        contextNote: 'Sie hören eine kurze Analyse aus Zürich über den Bahnverkehr im Alpenraum.',
        accentCode: 'de-CH',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Im Vergleich zum Vorjahr hat sich der Anteil des Schienengüterverkehrs zwar um neun Prozent erhöht, doch auf einzelnen Nebenstrecken stagnieren die Zahlen. Experten führen dies vor allem auf langwierige Baustellen zurück. Sofern die neuen Tunnelabschnitte planmäßig öffnen, prognostiziert das Verkehrsamt ab zweitausendachtundzwanzig deutlich kürzere Fahrzeiten.',
        hearingFocusTrap: 'Unterscheiden Sie den Gesamtzuwachs (+9 %) vs. Stagnation auf Nebenstrecken und die Bedingung „sofern“!',
        questions: [
          {
            id: 'de-b2-l7',
            prompt: 'Wie hat sich der Schienengüterverkehr insgesamt im Vergleich zum Vorjahr entwickelt?',
            options: ['Er ist um 9 % gesunken', 'Er ist um 9 % gestiegen', 'Er hat sich verdoppelt', 'Er blieb komplett unverändert'],
            correctIndex: 1,
            explanation: '„hat sich der Anteil ... um neun Prozent erhöht.“',
          },
          {
            id: 'de-b2-l8',
            prompt: 'Worauf führen Experten die Stagnation auf Nebenstrecken zurück?',
            options: ['Auf sinkende Ticketpreise', 'Auf langwierige Baustellen', 'Auf Personalüberschuss', 'Auf mildes Wetter'],
            correctIndex: 1,
            explanation: '„führen dies vor allem auf langwierige Baustellen zurück.“',
          },
          {
            id: 'de-b2-l9',
            prompt: 'Wann erwartet das Verkehrsamt deutlich kürzere Fahrzeiten?',
            options: ['Sofort ab nächstem Monat', 'Ab 2028, sofern die Tunnel planmäßig öffnen', 'Erst nach 2040', 'Gar nicht'],
            correctIndex: 1,
            explanation: '„Sofern die neuen Tunnelabschnitte planmäßig öffnen ... ab 2028“.',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-b2-write-t2',
      partLabel: 'Schreiben · Teil 2 (Formelle Nachricht im Beruf · Goethe B2)',
      scenario: 'Sie arbeiten in einer internationalen Firma. Wegen einer kurzfristigen Lieferverzögerung können Sie den vereinbarten Projekttermin am Freitag nicht halten. Schreiben Sie eine diplomatische E-Mail an Ihre Vorgesetzte Frau Dr. Hartmann.',
      taskRequirements: [
        'Erklären Sie sachlich die Ursache der Verzögerung.',
        'Zeigen Sie Verständnis für die Wichtigkeit des Projekts und bedauern Sie die Situation.',
        'Schlagen Sie einen realistischen neuen Zeitplan sowie eine Zwischenlösung vor.',
      ],
      minWords: 100,
      maxWords: 160,
      weightPercent: 45,
      keyRubricKeywords: ['bedauern', 'infolgedessen', 'stattdessen', 'Frist', 'Alternative', 'Verständnis'],
      modelAnswer:
        'Sehr geehrte Frau Dr. Hartmann,\nich bedauere sehr, Ihnen mitteilen zu müssen, dass wir den geplanten Projektabschluss am Freitag leider nicht vollständig einhalten können. Unser externer Zulieferer hat wichtige Messdaten verspätet geliefert; infolgedessen konnte die abschließende Qualitätsprüfung erst heute beginnen. Mir ist bewusst, wie entscheidend dieser Termin für die Kundenpräsentation ist. Stattdessen schlage ich vor, Ihnen bereits am Freitagvormittag einen vollständigen Zwischenbericht mit allen gesicherten Ergebnissen zur Verfügung zu stellen und die finale Fassung bis Dienstagmittag nachzureichen. Ich wäre Ihnen für Ihr Verständnis sehr dankbar und stehe für eine kurze Rücksprache jederzeit bereit.\nMit freundlichen Grüßen,\nLukas Bergmann',
    },
    speakingPart1: {
      id: 'de-b2-speak-p1',
      partLabel: 'Sprechen · Teil 1 (Kurzvortrag · 2 Alternativen abwägen)',
      instruction: 'Stellen Sie zwei Wege des Fremdsprachenlernens (Sprachkurs vor Ort vs. Selbststudium mit Apps & KI) gegenüber und bewerten Sie Vor- und Nachteile.',
      prepSeconds: 45,
      speakSeconds: 120,
      prompts: [
        'Stellen Sie beide Lernformen klar vor.',
        'Wägen Sie Kosten, Flexibilität und Sprechpraxis gegeneinander ab.',
        'Nennen Sie eine begründete Empfehlung (z. B. hybrides Modell).',
      ],
      examinerPromptAudio: 'Bitte halten Sie jetzt einen kurzen, strukturierten Vortrag über zwei verschiedene Wege, eine Fremdsprache intensiv zu lernen.',
      keyRubricKeywords: ['abwägen', 'Alternative', 'Vorteil', 'Nachteil', 'in Kauf nehmen', 'überzeugend'],
      modelResponseScript:
        'Heute möchte ich zwei gängige Wege des Sprachenlernens abwägen: klassische Präsenzkurse und digitales Selbststudium. Einerseits bieten Präsenzkurse direkte soziale Interaktion und feste Verbindlichkeit; allerdings muss man feste Uhrzeiten und höhere Kosten in Kauf nehmen. Digitale Plattformen sind demgegenüber flexibel und ermöglichen individuelles Hör- und Sprechtraining, erfordern jedoch hohe Selbstdisziplin. Eine überzeugende Alternative besteht meiner Ansicht nach in einer Kombination beider Ansätze.',
    },
    speakingPart3: {
      id: 'de-b2-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Kontroverse Diskussion & Einigung)',
      instruction: 'Diskutieren Sie mit dem Prüfer: „Sollten alle Universitäten Vorlesungen verpflichtend auch online anbieten?“ Verteidigen Sie Ihren Standpunkt und suchen Sie einen Kompromiss.',
      prepSeconds: 20,
      speakSeconds: 90,
      prompts: [
        'Reagieren Sie diplomatisch auf das Gegenargument des Prüfers.',
        'Bringen Sie ein konkretes Argument für Chancengleichheit oder Präsenzkultur ein.',
        'Formulieren Sie einen praktikablen Kompromiss.',
      ],
      examinerPromptAudio: 'Wenn alle Vorlesungen online verfügbar sind, kommen doch kaum noch Studierende in den Hörsaal und das Campusleben stirbt aus — oder sehen Sie das anders?',
      keyRubricKeywords: ['einerseits', 'allerdings', 'durchaus', 'Kompromiss', 'befürworten', 'sofern'],
      modelResponseScript:
        'Ich verstehe diesen Einwand durchaus — leere Hörsäle wären tatsächlich ein Verlust für den wissenschaftlichen Austausch. Allerdings ermöglichen aufgezeichnete Vorlesungen berufstätigen Studierenden und Eltern überhaupt erst ein Studium. Deshalb befürworte ich einen pragmatischen Kompromiss: Große Einführungsvorlesungen werden hybrid zur Verfügung gestellt, während kleine Seminare und Diskussionen bewusst in Präsenz stattfinden.',
    },
  },

  'exam-de-c1': {
    officialMinutes: 115,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-c1-read-p2',
        partLabel: 'Lesen · Teil 2 (Wissenschaftskritik · Richtig/Falsch/Nicht im Text)',
        format: 'tfng',
        instruction: 'Prüfen Sie die Aussagen streng anhand des folgenden Auszugs aus einem Forschungsbericht.',
        passageTitle: 'Automatisierte Vorauswahl im Bewerbungsverfahren',
        passage:
          'Die von zahlreichen Konzernen implementierten KI-gestützten Vorauswahlverfahren versprechen objektivere Personalentscheidungen. Einer länderübergreifenden Metastudie zufolge reproduzieren derartige Algorithmen jedoch häufig historische Verzerrungen, sofern Trainingsdaten nicht systematisch bereinigt werden. Ungeachtet dieser Befunde plädieren Arbeitspsychologen nicht für ein generelles Verbot, sondern für verbindliche Transparenzpflichten und menschliche Endkontrolle.',
        questions: [
          {
            id: 'de-c1-r4',
            prompt: 'Die Metastudie bestätigt, dass KI-Vorauswahlverfahren historische Vorurteile automatisch beseitigen.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 1,
            explanation: 'Im Gegenteil: Sie reproduzieren häufig historische Verzerrungen, sofern Daten nicht bereinigt werden.',
          },
          {
            id: 'de-c1-r5',
            prompt: 'Arbeitspsychologen fordern laut Text ein vollständiges gesetzliches Verbot aller Auswahl-Algorithmen.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 1,
            explanation: 'Sie plädieren ausdrücklich „nicht für ein generelles Verbot, sondern für Transparenzpflichten und menschliche Endkontrolle“.',
          },
          {
            id: 'de-c1-r6',
            prompt: 'Die Metastudie umfasste Bewerbungsdaten aus mehr als zwanzig europäischen Staaten.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 2,
            explanation: 'Der Text spricht nur von einer „länderübergreifenden Metastudie“ — eine genaue Länderzahl wird nicht genannt.',
          },
        ],
      },
      {
        id: 'de-c1-read-p3',
        partLabel: 'Lesen · Teil 3 (Sprachbausteine · Konjunktiv I, Nominalstil & Funktionsverben)',
        format: 'cloze',
        instruction: 'Ergänzen Sie die akademisch präzise C1-Konstruktion.',
        passageTitle: 'Hochschulreform in der Debatte',
        passage:
          'Die Kommission betonte, der Entwurf [1] den veränderten Berufsbildern besser Rechnung. [2] einer belastbaren Kostenkalkulation äußerten mehrere Länderfinanzminister jedoch Vorbehalte. Eine Nachbesserung [3] daher unabdingbar sein.',
        questions: [
          {
            id: 'de-c1-r7',
            prompt: 'Lücke [1]: Indirekte Rede (Konjunktiv I von „tragen“):',
            options: ['trägt', 'trage', 'trug', 'getragen'],
            correctIndex: 1,
            explanation: 'Konjunktiv I (3. Sg.) von „tragen“ lautet „trage“ („trage ... Rechnung“).',
          },
          {
            id: 'de-c1-r8',
            prompt: 'Lücke [2]: „___ einer belastbaren Kostenkalkulation äußerten Minister Vorbehalte.“',
            options: ['Mangels', 'Zufolge', 'Indem', 'Obwohl'],
            correctIndex: 0,
            explanation: '„Mangels + Genitiv“ bedeutet „wegen fehlender Kostenkalkulation“.',
          },
          {
            id: 'de-c1-r9',
            prompt: 'Lücke [3]: Epistemische Wahrscheinlichkeit: „Eine Nachbesserung ___ daher unabdingbar sein.“',
            options: ['dürfte', 'solle', 'hätte', 'wurde'],
            correctIndex: 0,
            explanation: 'Subjektives „dürfte + Infinitiv“ drückt hohe Wahrscheinlichkeit („is likely to be“) aus.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-c1-listen-t2',
        partLabel: 'Hören · Teil 2 (Expertenpanel · Einmaliges Hören · Österreich AT)',
        contextNote: 'Sie hören eine einmalige Expertenrunde aus Wien zum Thema Open-Access-Wissenschaft.',
        accentCode: 'de-AT',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Dr. Steiner: Ich räume gern ein, dass traditionelle Fachverlage über Jahrzehnte ein funktionierendes Begutachtungssystem aufgebaut haben. Dem halte ich jedoch entgegen, dass öffentlich finanzierte Forschung nicht hinter teuren Bezahlschranken verschwinden darf — zumal kleine Universitäten diese Lizenzgebühren kaum noch schultern können. Ein transparenter Übergang zu frei zugänglichen Publikationen dürfte daher langfristig unabdingbar sein.',
        hearingFocusTrap: 'Einmaliges Hören! Trennen Sie das Zugeständnis („räume ein“) von der Kernthese („halte entgegen ... zumal“).',
        questions: [
          {
            id: 'de-c1-l4',
            prompt: 'Welche Leistung traditioneller Fachverlage erkennt Dr. Steiner ausdrücklich an?',
            options: ['Besonders günstige Abonnements', 'Den Aufbau eines funktionierenden Begutachtungssystems', 'Die staatliche Forschungsfinanzierung', 'Kostenlose Lehrbücher für Studierende'],
            correctIndex: 1,
            explanation: 'Er räumt ein, dass sie „ein funktionierendes Begutachtungssystem aufgebaut haben“.',
          },
          {
            id: 'de-c1-l5',
            prompt: 'Welches Argument verstärkt Dr. Steiners Kritik an Bezahlschranken?',
            options: ['Dass kleine Universitäten sich die Lizenzgebühren kaum noch leisten können', 'Dass niemand mehr Fachartikel liest', 'Dass digitale Dateien zu groß sind', 'Dass Autoren keine Namen mehr nennen dürfen'],
            correctIndex: 0,
            explanation: '„zumal kleine Universitäten diese Lizenzgebühren kaum noch schultern können.“',
          },
          {
            id: 'de-c1-l6',
            prompt: 'Wie bewertet Dr. Steiner den Übergang zu Open-Access-Publikationen?',
            options: ['Als schädlich für die Qualität', 'Als langfristig wahrscheinlich unabdingbar', 'Als bereits vollständig abgeschlossen', 'Als rechtlich unmöglich'],
            correctIndex: 1,
            explanation: '„dürfte daher langfristig unabdingbar sein.“',
          },
        ],
      },
      {
        id: 'de-c1-listen-t3',
        partLabel: 'Hören · Teil 3 (Wissenschaftsreportage · Einmaliges Hören · Schweiz CH)',
        contextNote: 'Sie hören einen kurzen Bericht aus Zürich über urbane Schwammstädte.',
        accentCode: 'de-CH',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Angesichts immer häufigerer Starkregenereignisse gewinnt das Prinzip der Schwammstadt an Bedeutung. Statt Niederschläge rasch in überlastete Kanäle abzuleiten, speichern begrünte Dächer und entsiegelte Plätze das Wasser vor Ort. Einschränkend weisen Hydrologen allerdings darauf hin, dass Umbauten im dichten historischen Bestand erhebliche Mittel in Anspruch nehmen und bestehende Leitungsnetze nicht vollständig ersetzen.',
        hearingFocusTrap: 'Achten Sie auf den einschränkenden Vorbehalt am Schluss („Einschränkend weisen Hydrologen darauf hin...“)!',
        questions: [
          {
            id: 'de-c1-l7',
            prompt: 'Worin besteht das Grundprinzip der „Schwammstadt“?',
            options: ['Regenwasser möglichst schnell aus der Stadt zu pumpen', 'Niederschläge über begrünte Dächer und entsiegelte Flächen lokal zu speichern', 'Alle Altbauten abzureißen', 'Unterirdische Autobahnen zu bauen'],
            correctIndex: 1,
            explanation: 'Wasser wird vor Ort gespeichert, statt sofort in Kanäle abgeleitet zu werden.',
          },
          {
            id: 'de-c1-l8',
            prompt: 'Welche Einschränkung betonen Hydrologen?',
            options: ['Schwammstädte funktionieren nur in Wüsten', 'Umbauten in dichten Altstädten sind teuer und ersetzen klassische Netze nicht komplett', 'Begrünte Dächer verursachen Überschwemmungen', 'Es gibt keinerlei Nutzen bei Starkregen'],
            correctIndex: 1,
            explanation: 'Hohe Kosten im historischen Bestand + klassische Kanalnetze bleiben weiterhin nötig.',
          },
          {
            id: 'de-c1-l9',
            prompt: 'Welcher Ton prägt den gesamten Radiobeitrag?',
            options: ['Polemisch und spöttisch', 'Sachlich und differenziert abwägend', 'Werblich und unkritisch', 'Persönlich und emotional'],
            correctIndex: 1,
            explanation: 'Der Bericht stellt Chancen sachlich vor und fügt eine fundierte fachliche Einschränkung an.',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-c1-write-t2',
      partLabel: 'Schreiben · Teil 2 (Formelle Stellungnahme / Kurzgutachten · Goethe C1)',
      scenario: 'Der Senat Ihrer Hochschule erwägt, alle Seminararbeiten künftig zusätzlich durch ein kurzes mündliches Fachgespräch zu prüfen. Verfassen Sie eine fundierte Stellungnahme.',
      taskRequirements: [
        'Beleuchten Sie den Hintergrund dieser Reform (u. a. digitale Schreibhilfen).',
        'Wägen Sie Fairness, Prüfungsqualität und Betreuungsaufwand differenziert ab.',
        'Unterbreiten Sie einen tragfähigen Umsetzungsvorschlag.',
      ],
      minWords: 150,
      maxWords: 230,
      weightPercent: 50,
      keyRubricKeywords: ['Rechnung tragen', 'in Anspruch nehmen', 'differenziert', 'gewährleisten', 'tragfähig', 'einräumen'],
      modelAnswer:
        'Angesichts der raschen Verbreitung KI-gestützter Textwerkzeuge steht die Aussagekraft rein schriftlicher Seminararbeiten gegenwärtig intensiv zur Debatte. Ein ergänzendes zehnminütiges Fachgespräch könnte den veränderten Prüfungsrealitäten wirksam Rechnung tragen, da Studierende ihre Argumentation eigenständig verteidigen müssen. Ich räume allerdings ein, dass verpflichtende Einzelgespräche erhebliche personelle Ressourcen in Anspruch nehmen und prüfungsängstliche Studierende unter Druck setzen können. Um sowohl akademische Integrität als auch Chancengleichheit zu gewährleisten, liegt eine differenzierte Lösung nahe: Statt ausnahmslos jede Hausarbeit mündlich nachzuprüfen, sollten Fachgespräche gezielt in Abschlussmodulen verankert und durch transparente Bewertungskriterien begleitet werden. Ein solcher Stufenplan erscheint hochschulpolitisch tragfähig und pädagogisch überzeugend.',
    },
    speakingPart1: {
      id: 'de-c1-speak-p1',
      partLabel: 'Sprechen · Teil 1 (Analytischer Kurzvortrag · 3 Min.)',
      instruction: 'Halten Sie einen strukturierten C1-Vortrag zur Frage: „Inwieweit sollte der Staat den individuellen Konsum zugunsten des Klimaschutzes regulieren?“',
      prepSeconds: 45,
      speakSeconds: 150,
      prompts: [
        'Umreißen Sie das Spannungsfeld zwischen individueller Freiheit und Gemeinwohl.',
        'Vergleichen Sie Verbote mit finanziellen Anreizen (Steuern/Förderung).',
        'Formulieren Sie ein abgewogenes Fazit.',
      ],
      examinerPromptAudio: 'Bitte beginnen Sie nun mit Ihrem Kurzvortrag zum Spannungsfeld zwischen individueller Konsumfreiheit und staatlicher Klimaregulierung.',
      keyRubricKeywords: ['inwieweit', 'einräumen', 'demgegenüber', 'unabdingbar', 'Ambivalenz', 'tragfähig'],
      modelResponseScript:
        'In der Klimapolitik zeigt sich eine ausgeprägte gesellschaftliche Ambivalenz: Einerseits gilt individuelle Konsumfreiheit als hohes Gut, demgegenüber verweisen Umweltökonomen darauf, dass freiwillige Appelle allein die Emissionsziele verfehlen dürften. Ich räume ein, dass pauschale Verbote oft Widerstand hervorrufen. Nachhaltige Anreizsysteme — etwa sozial abgefedertes Klimageld und der Ausbau bezahlbarer Alternativen — erscheinen daher deutlich tragfähiger, sofern sie durch klare gesetzliche Leitplanken flankiert werden.',
    },
    speakingPart3: {
      id: 'de-c1-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Kritisches Prüfungsgespräch · Rebuttal)',
      instruction: 'Reagieren Sie souverän auf die kritische Gegenposition des Prüfers und verhandeln Sie eine gemeinsame Empfehlung.',
      prepSeconds: 15,
      speakSeconds: 90,
      prompts: [
        'Greifen Sie den Einwand des Prüfers präzise auf (Zugeständnis).',
        'Entkräften Sie die Verallgemeinerung mit einem fundierten Gegenargument.',
        'Schließen Sie mit einer prägnanten Synthese.',
      ],
      examinerPromptAudio: 'Kritiker wenden aber ein, dass finanzielle Lenkungssteuern vor allem Menschen mit geringerem Einkommen unverhältnismäßig stark belasten. Wie begegnen Sie diesem Vorwurf?',
      keyRubricKeywords: ['entgegenhalten', 'Rechnung tragen', 'verkennen', 'ausgewogen', 'gewährleisten'],
      modelResponseScript:
        'Diesen Einwand nehme ich sehr ernst; tatsächlich würde eine unkompensierte Preissteigerung soziale Ungleichheiten verschärfen. Dem lässt sich jedoch entgegenhalten, dass eine direkte Pro-Kopf-Rückerstattung gerade Haushalten mit geringerem Verbrauch sogar netto mehr Spielraum verschafft. Wer soziale Ausgleichsmechanismen von vornherein mitdenkt, trägt sowohl ökologischen Zielen als auch sozialer Gerechtigkeit ausgewogen Rechnung.',
    },
  },

  'exam-de-c2': {
    officialMinutes: 130,
    requireAllSkillsPass: true,
    primaryAccentCode: 'de-DE',
    extraReadingParts: [
      {
        id: 'de-c2-read-p2',
        partLabel: 'Lesen · Teil 2 (Feuilleton-Ironie & Subtext · Richtig/Falsch/Nicht im Text)',
        format: 'tfng',
        instruction: 'Deuten Sie die feinen ironischen und stilistischen Signale des Feuilleton-Auszugs exakt.',
        passageTitle: 'Kulturkritik: Die Tyrannei der ständigen Optimierung',
        passage:
          'Dass ausgerechnet jene Ratgeber, die täglich zu radikaler Entschleunigung mahnen, ihre Botschaft in minutiös vermarkteten Fünf-Schritte-Programmen feilbieten, entbehrt nicht einer gewissen Komik. Gleichwohl wäre es wohlfeil, das verbreitete Bedürfnis nach Orientierung pauschal zu verspotten. Die eigentliche Tragweite dieses Trends liegt vielmehr darin, dass selbst Muße unter der Hand zum messbaren Leistungsprojekt gerät.',
        questions: [
          {
            id: 'de-c2-r4',
            prompt: 'Der Autor deckt einen ironischen Widerspruch zwischen Inhalt und Vermarktung vieler Entschleunigungs-Ratgeber auf.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 0,
            explanation: '„ausgerechnet jene Ratgeber ... entbehrt nicht einer gewissen Komik“ (Litotes + Ironie).',
          },
          {
            id: 'de-c2-r5',
            prompt: 'Der Autor hält das menschliche Bedürfnis nach Orientierung grundsätzlich für lächerlich.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 1,
            explanation: 'Er warnt ausdrücklich: „Gleichwohl wäre es wohlfeil, das Bedürfnis ... pauschal zu verspotten.“',
          },
          {
            id: 'de-c2-r6',
            prompt: 'Der Artikel vergleicht deutsche Ratgeberverkäufe statistisch mit dem US-Buchmarkt.',
            options: ['Richtig', 'Falsch', 'Nicht im Text'],
            correctIndex: 2,
            explanation: 'Ein statistischer Vergleich mit dem US-Markt kommt im Auszug nicht vor.',
          },
        ],
      },
      {
        id: 'de-c2-read-p3',
        partLabel: 'Lesen · Teil 3 (GDS Stilistische Transformation & Lexikalische Präzision)',
        format: 'cloze',
        instruction: 'Wählen Sie die stilistisch treffendste C2-Formulierung ohne Bedeutungsverlust.',
        passageTitle: 'Editorial-Feinschliff',
        passage:
          '[1] diese polemische Zuspitzung auch klingen mag — sie [2] bei näherem Hinsehen kaum. Erst eine kühle Analyse vermag die volle [3] des Entwurfs freizulegen.',
        questions: [
          {
            id: 'de-c2-r7',
            prompt: 'Lücke [1]: Konzessiver Rahmen „___ diese Zuspitzung auch klingen mag“:',
            options: ['So pointiert', 'Obwohl pointiert', 'Trotz pointiert', 'Je pointiert'],
            correctIndex: 0,
            explanation: 'Gehobener konzessiver Rahmen: „So + Adjektiv + ... auch sein/klingen mag“.',
          },
          {
            id: 'de-c2-r8',
            prompt: 'Lücke [2]: „sie ___ bei näherem Hinsehen kaum“ (= überzeugt nicht):',
            options: ['verfängt', 'befängt', 'anfängt', 'umfängt'],
            correctIndex: 0,
            explanation: '„verfangen“ bedeutet im gehobenen Diskurs „Überzeugungskraft entfalten / greifen“.',
          },
          {
            id: 'de-c2-r9',
            prompt: 'Lücke [3]: „die volle ___ des Entwurfs freizulegen“ (= weitreichende Bedeutung):',
            options: ['Tragweite', 'Reichzahl', 'Breitstrecke', 'Spannhöhe'],
            correctIndex: 0,
            explanation: 'Feste gehobene Kollokation: „die volle Tragweite einer Entscheidung/eines Entwurfs“.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'de-c2-listen-t2',
        partLabel: 'Hören · Teil 2 (Intellektueller Kultur-Podcast · Einmaliges Hören · Österreich AT)',
        contextNote: 'Sie hören eine einmalige Feuilleton-Diskussion aus Wien über Architektur und Erinnerung.',
        accentCode: 'de-AT',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Kritikerin: Historisierende Rekonstruktionen ganzer Stadtviertel treffen zwar ein verständliches Bedürfnis nach Vertrautheit; gleichwohl untergraben perfekte Kulissen mitunter das Bewusstsein für historische Brüche. Architektur sollte Widersprüche nicht glattbügeln, sondern lesbar halten — darin liegt die eigentliche Gretchenfrage jeder Denkmalpflege.',
        hearingFocusTrap: 'Einmaliges Hören! Verfolgen Sie die Metaphern „glattbügeln“ und „Gretchenfrage“!',
        questions: [
          {
            id: 'de-c2-l4',
            prompt: 'Worin sieht die Kritikerin die Gefahr perfekter historisierender Kulissen?',
            options: ['Sie sind technisch instabil', 'Sie können das Bewusstsein für historische Brüche und Widersprüche verwischen', 'Sie ziehen zu wenige Besucher an', 'Sie lassen sich nicht beheizen'],
            correctIndex: 1,
            explanation: 'Sie warnt, perfekte Kulissen „untergraben das Bewusstsein für historische Brüche“.',
          },
          {
            id: 'de-c2-l5',
            prompt: 'Was meint sie mit der „Gretchenfrage jeder Denkmalpflege“?',
            options: ['Die Finanzierung von Baustellen', 'Die entscheidende Kernfrage, wie offen Architektur geschichtliche Brüche sichtbar hält', 'Die Auswahl der Fassadenfarbe', 'Die Dauer der Baugenehmigung'],
            correctIndex: 1,
            explanation: 'Gretchenfrage = die zentrale ethisch-ästhetische Kernfrage.',
          },
          {
            id: 'de-c2-l6',
            prompt: 'Wie bewertet die Sprecherin den Wunsch nach architektonischer Vertrautheit?',
            options: ['Sie nennt ihn völlig absurd', 'Sie erkennt ihn als verständlich an, mahnt jedoch zur Reflexion', 'Sie fordert den Abriss aller Altbauten', 'Sie äußert sich dazu gar nicht'],
            correctIndex: 1,
            explanation: '„treffen zwar ein verständliches Bedürfnis ... gleichwohl“.',
          },
        ],
      },
      {
        id: 'de-c2-listen-t3',
        partLabel: 'Hören · Teil 3 (Pluricentric DACH Debatte · Einmaliges Hören · Schweiz CH)',
        contextNote: 'Sie hören einen kurzen Kommentar eines Schweizer Verfassungsrechtlers aus Bern.',
        accentCode: 'de-CH',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Direkte Abstimmungen verlangen den Stimmberechtigten zweifellos Geduld und allfällige Kompromissbereitschaft ab. Wer jedoch behauptet, Bürgerentscheide trieben die Polarisierung zwangsläufig auf die Spitze, verkennt deren befriedende Wirkung: Gerade das öffentliche Ausloten strittiger Fragen entkräftet oft jenes Gefühl der Ohnmacht, das demokratische Institutionen andernorts untergräbt.',
        hearingFocusTrap: 'Schweizer Standardlexik („Stimmberechtigte“, „allfällig“) + Umkehrung des Polarisierungsvorwurfs!',
        questions: [
          {
            id: 'de-c2-l7',
            prompt: 'Welcher verbreiteten Kritik an Volksabstimmungen widerspricht der Jurist?',
            options: ['Dass sie zu wenig kosten', 'Dass sie zwangsläufig zur Zuspitzung und Polarisierung führen', 'Dass sie zu selten stattfinden', 'Dass sie juristisch verboten seien'],
            correctIndex: 1,
            explanation: 'Er entkräftet die These, Bürgerentscheide „trieben die Polarisierung zwangsläufig auf die Spitze“.',
          },
          {
            id: 'de-c2-l8',
            prompt: 'Welchen positiven Effekt direkter Mitsprache hebt er hervor?',
            options: ['Schnellere Gesetze ohne Debatte', 'Eine befriedende Wirkung, die Ohnmachtsgefühle abbaut', 'Niedrigere Wahlbeteiligung', 'Wegfall von Gerichten'],
            correctIndex: 1,
            explanation: 'Das öffentliche Ausloten entkräfte „jenes Gefühl der Ohnmacht“.',
          },
          {
            id: 'de-c2-l9',
            prompt: 'Was bedeutet „allfällige Kompromissbereitschaft“ im Kontext?',
            options: ['Unmögliche Kompromisse', 'Gegebenenfalls erforderliche Kompromissbereitschaft', 'Abgelehnte Kompromisse', 'Veraltete Regeln'],
            correctIndex: 1,
            explanation: 'CH/AT-Standardwort „allfällig“ = eventuell / gegebenenfalls nötig.',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'de-c2-write-t2',
      partLabel: 'Schreiben · Teil 2 (GDS Paraphrase & Editorial-Synthese)',
      scenario: 'Verfassen Sie einen druckreifen Feuilleton-Kommentar zur Frage: „Verarmt oder bereichert beschleunigte KI-Kommunikation unsere sprachliche Urteilskraft?“',
      taskRequirements: [
        'Deuten Sie das Spannungsfeld zwischen Effizienz und gedanklicher Tiefe ohne Klischees.',
        'Integrieren Sie mindestens eine konzessive Wendung und eine prägnante rhetorische Zuspitzung.',
        'Schließen Sie mit einer souveränen, stringenten Synthese.',
      ],
      minWords: 180,
      maxWords: 320,
      weightPercent: 55,
      keyRubricKeywords: ['Tragweite', 'gleichwohl', 'untergraben', 'Kohärenz', 'stringent', 'Souveränität'],
      modelAnswer:
        'Kaum zu überschätzen ist die kulturelle Tragweite einer Gegenwart, in der wohlformulierte Texte binnen Sekunden auf Knopfdruck entstehen. Wer darin ausschließlich eine demokratische Arbeitserleichterung sieht, verkennt allerdings, dass Schreiben von jeher nicht bloß Verpackung fertiger Gedanken war, sondern deren eigentliche Prüfinstanz. Gleichwohl griffe ein pauschaler Kulturpessimismus zu kurz: Nicht das Werkzeug an sich untergräbt unsere Urteilskraft, sondern die allzu bequeme Gewohnheit, gedankliche Reibung vollständig zu delegieren. Sprachliche Souveränität zeigt sich künftig weniger im makellosen Glätten von Oberflächen als in der strengen Kohärenz eigener Argumente. Wer einen Text kritisch gegen den Strich liest, Ambivalenzen aushält und jeden Satz auf seine stringente Tragfähigkeit prüft, gewinnt im Zeitalter automatisierter Glätte gerade jene geistige Unabhängigkeit zurück, die keine Maschine ersetzen kann.',
    },
    speakingPart1: {
      id: 'de-c2-speak-p1',
      partLabel: 'Sprechen · Teil 1 (GDS 4-Minuten-Impulsrede · Impromptu)',
      instruction: 'Halten Sie eine prägnante, stilistisch souveräne Stellungnahme zur These: „Ohne Langeweile verkümmert kulturelle Kreativität.“',
      prepSeconds: 45,
      speakSeconds: 180,
      prompts: [
        'Entfalten Sie die Paradoxie von Dauerunterhaltung und Ideenarmut.',
        'Stützen Sie Ihre These mit einem kulturellen oder biografischen Beispiel.',
        'Balancieren Sie das Argument durch eine kluge Einschränkung.',
      ],
      examinerPromptAudio: 'Bitte nehmen Sie nun frei und prägnant Stellung zur These: Ohne Phasen produktiver Langeweile verkümmert jede kulturelle Kreativität.',
      keyRubricKeywords: ['gleichwohl', 'Zuspitzung', 'subtil', 'Tragweite', 'prägnant', 'Diskurs'],
      modelResponseScript:
        'Die These wirkt auf den ersten Blick wie eine nostalgische Zuspitzung, trifft bei näherem Hinsehen jedoch den Nagel auf den Kopf. Unstrukturierte Pausen eröffnen jenen stillen Resonanzraum, in dem entfernte Gedanken sich überhaupt erst neu verknüpfen können. Gleichwohl wäre es verkürzt, bloße Untätigkeit zu romantisieren: Produktiv wird Langeweile erst dort, wo Neugier und gedankliche Disziplin hinzutreten. Gerade unsere durchgetaktete Aufmerksamkeitökonomie sollte daher bewusste Leerstellen als kulturelle Ressource wiederentdecken.',
    },
    speakingPart3: {
      id: 'de-c2-speak-p3',
      partLabel: 'Sprechen · Teil 3 (Kontroverse Experten-Debatte · Pushback)',
      instruction: 'Verteidigen Sie Ihren Standpunkt souverän gegen die zugespitzte Rückfrage des Prüfers.',
      prepSeconds: 15,
      speakSeconds: 120,
      prompts: [
        'Nehmen Sie die provokante Rückfrage gelassen und pointiert auf.',
        'Entkräften Sie das Gegenargument ohne Ausweichfloskeln.',
        'Runden Sie die Debatte mit einer klaren Schlussformel ab.',
      ],
      examinerPromptAudio: 'Ist diese Kritik an digitaler Beschleunigung nicht bloß elitäres Gerede jener, die sich Muße finanziell leisten können?',
      keyRubricKeywords: ['Nagel auf den Kopf', 'einräumen', 'entkräften', 'plädieren', 'Souveränität'],
      modelResponseScript:
        'Mit dieser sozialen Rückfrage treffen Sie tatsächlich einen wunden Punkt — ich räume unumwunden ein, dass freie Zeit ungleich verteilt ist. Doch genau dieser Befund entkräftet mein Argument nicht, sondern verschärft es: Wenn geistige Ruhe zum Luxusgut gerät, wird der Schutz öffentlicher, kommerzfreier Räume — von Bibliotheken bis zu fairen Arbeitszeiten — erst recht zu einer demokratischen Kernaufgabe. Dafür plädiere ich ausdrücklich.',
    },
  },

  // ================================ ENGLISH A1–C2 ================================
  'exam-en-a1': {
    officialMinutes: 50,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-a1-read-p2',
        partLabel: 'Reading · Part 2 (Public Signs & Notices · True / False)',
        format: 'true-false',
        instruction: 'Read the short public notices carefully and choose True or False.',
        passageTitle: 'Green Park Café & Central Library',
        passage:
          'Green Park Café: Open daily 08:00–17:30. Fresh sandwiches £5, tea or coffee £2.50. Sorry — card payments only, no cash! — Central Library: Free Wi-Fi for all visitors. Quiet study room on Floor 2. Please switch off mobile phones before entering.',
        questions: [
          {
            id: 'en-a1-r4',
            prompt: 'You can pay with coins and paper cash at Green Park Café.',
            options: ['True', 'False', 'Not mentioned'],
            correctIndex: 1,
            explanation: 'The notice states clearly: "Sorry — card payments only, no cash!"',
          },
          {
            id: 'en-a1-r5',
            prompt: 'Wi-Fi at Central Library is free for visitors.',
            options: ['True', 'False', 'Not mentioned'],
            correctIndex: 0,
            explanation: '"Free Wi-Fi for all visitors."',
          },
          {
            id: 'en-a1-r6',
            prompt: 'Visitors should make phone calls inside the quiet study room on Floor 2.',
            options: ['True', 'False', 'Not mentioned'],
            correctIndex: 1,
            explanation: '"Please switch off mobile phones before entering."',
          },
        ],
      },
      {
        id: 'en-a1-read-p3',
        partLabel: 'Reading · Part 3 (Use of English · Everyday Grammar Cloze)',
        format: 'cloze',
        instruction: 'Choose the best word to complete the short travel message.',
        passageTitle: 'Weekend Trip Message',
        passage:
          'Hi Ben! Our train arrives [1] York station at 10:30 [2] Saturday. There [3] two lovely cafés opposite the station — let’s meet there!',
        questions: [
          {
            id: 'en-a1-r7',
            prompt: 'Gap [1]: "Our train arrives ___ York station at 10:30."',
            options: ['to', 'at', 'on', 'for'],
            correctIndex: 1,
            explanation: 'Always use "arrive AT" a station, airport, or building (never "arrive to").',
          },
          {
            id: 'en-a1-r8',
            prompt: 'Gap [2]: "at 10:30 ___ Saturday."',
            options: ['in', 'at', 'on', 'by'],
            correctIndex: 2,
            explanation: 'Days of the week always take "on" (on Saturday).',
          },
          {
            id: 'en-a1-r9',
            prompt: 'Gap [3]: "There ___ two lovely cafés opposite the station."',
            options: ['is', 'are', 'be', 'has'],
            correctIndex: 1,
            explanation: 'Plural noun ("two lovely cafés") takes "There are".',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-a1-listen-t2',
        partLabel: 'Listening · Part 2 (Hotel Reception · American US)',
        contextNote: 'Listen to a hotel receptionist speaking to a guest at check-in.',
        accentCode: 'en-US',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Welcome to Riverside Hotel! Your reservation is for Room 304 on the third floor. Breakfast is served from seven to ten in the morning in the sunny garden room. If you need help with your luggage, our porter is right next to the elevator. Enjoy your stay!',
        hearingFocusTrap: 'Catch the room number (304), breakfast window (7–10 am), and breakfast location (garden room).',
        questions: [
          {
            id: 'en-a1-l4',
            prompt: 'Which room number does the guest have?',
            options: ['Room 204', 'Room 304', 'Room 403', 'Room 314'],
            correctIndex: 1,
            explanation: '"Your reservation is for Room 304 on the third floor."',
          },
          {
            id: 'en-a1-l5',
            prompt: 'Where is breakfast served?',
            options: ['In the basement', 'On the rooftop', 'In the garden room', 'At the train station'],
            correctIndex: 2,
            explanation: '"in the sunny garden room."',
          },
          {
            id: 'en-a1-l6',
            prompt: 'What time does breakfast finish?',
            options: ['At 9:00 am', 'At 10:00 am', 'At 10:30 am', 'At 11:00 am'],
            correctIndex: 1,
            explanation: '"from seven to ten in the morning."',
          },
        ],
      },
      {
        id: 'en-a1-listen-t3',
        partLabel: 'Listening · Part 3 (Shop Announcement · Australian AU)',
        contextNote: 'You are in a city bookstore in Sydney and hear an announcement.',
        accentCode: 'en-AU',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Good afternoon shoppers! Just a quick reminder that our bookstore closes in twenty minutes at six o’clock sharp. Today all travel guides have a twenty-five percent discount at the front counter. Thank you for visiting us today!',
        hearingFocusTrap: 'Listen for closing time (6:00) vs. countdown (20 mins) and discount percentage (25%).',
        questions: [
          {
            id: 'en-a1-l7',
            prompt: 'What time does the bookstore close?',
            options: ['At 5:20', 'At 6:00', 'At 6:20', 'At 7:00'],
            correctIndex: 1,
            explanation: '"closes in twenty minutes at six o’clock sharp."',
          },
          {
            id: 'en-a1-l8',
            prompt: 'Which books have a special discount today?',
            options: ['Cookbooks', 'Children’s stories', 'Travel guides', 'Dictionaries'],
            correctIndex: 2,
            explanation: '"all travel guides have a twenty-five percent discount."',
          },
          {
            id: 'en-a1-l9',
            prompt: 'How big is the discount?',
            options: ['15%', '20%', '25%', '50%'],
            correctIndex: 2,
            explanation: '"twenty-five percent discount."',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-a1-write-t2',
      partLabel: 'Writing · Task 2 (Short Invitation Email to a Friend)',
      scenario: 'You are visiting the new city art museum this Sunday. Write a short email inviting your friend Sam.',
      taskRequirements: [
        'Say what day and time you are going.',
        'Mention the meeting place and ticket price/discount.',
        'Ask Sam to confirm if they can join.',
      ],
      minWords: 32,
      maxWords: 65,
      weightPercent: 55,
      keyRubricKeywords: ['Sunday', 'museum', 'entrance', 'discount', 'confirm', 'meet'],
      modelAnswer:
        'Hi Sam,\nI am going to visit the new City Art Museum on Sunday at 2 pm! Would you like to come with me? Students get a 50% discount, so tickets are very cheap. Let’s meet at the main entrance opposite the park. Please confirm by Saturday!\nBest,\nAlex',
    },
    speakingPart1: {
      id: 'en-a1-speak-p1',
      partLabel: 'Speaking · Part 1 (Personal Introduction & Daily Routine)',
      instruction: 'Introduce yourself clearly and describe your typical morning.',
      prepSeconds: 15,
      speakSeconds: 45,
      prompts: [
        'Your name, city, and job or studies',
        'Two things you do every morning',
        'One hobby you enjoy at the weekend',
      ],
      examinerPromptAudio: 'Hello and welcome! Could you tell me your name, where you live, and what you usually do in the morning?',
      keyRubricKeywords: ['live', 'morning', 'work', 'study', 'weekend', 'enjoy'],
      modelResponseScript:
        'Hello! My name is Alex and I live in a quiet apartment near the city center. I work as a software tester. Every morning I wake up at seven, drink coffee, and walk to the bus stop. At the weekend I love cycling in the park and cooking with friends.',
    },
    speakingPart3: {
      id: 'en-a1-speak-p3',
      partLabel: 'Speaking · Part 3 (Everyday Roleplay · Asking for Help)',
      instruction: 'Respond politely to the examiner playing a café server and ask two practical questions.',
      prepSeconds: 15,
      speakSeconds: 45,
      prompts: [
        'Order one vegetarian item and one drink politely ("I’d like...").',
        'Ask if card payment is accepted.',
        'Ask for directions to the nearest train station.',
      ],
      examinerPromptAudio: 'Good afternoon! Welcome to Park Café. What would you like to order today?',
      keyRubricKeywords: ['like', 'please', 'vegetarian', 'card', 'station', 'directions'],
      modelResponseScript:
        'Good afternoon! I’d like a vegetarian sandwich and a cup of green tea, please. Can I pay by card? Also, excuse me, could you give me directions to the nearest train station? Thank you very much!',
    },
  },

  'exam-en-a2': {
    officialMinutes: 65,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-a2-read-p2',
        partLabel: 'Reading · Part 2 (Club Guide · True / False / Not Given)',
        format: 'tfng',
        instruction: 'Read the community cycling club notice and choose True, False, or Not Given.',
        passageTitle: 'Harbor Cycling Club — Spring Rides',
        passage:
          'Join our friendly Sunday rides along the coast! Rides start at 09:00 from Harbor Bridge and usually cover 25 kilometers at a relaxed pace. Beginners are welcome and do not have to bring their own bike — you can borrow one from the clubhouse for £6, including a helmet. After every ride we stop at Marina Café for lunch.',
        questions: [
          {
            id: 'en-a2-r4',
            prompt: 'Beginners must buy their own bicycle before joining a Sunday ride.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 1,
            explanation: 'Beginners "do not have to bring their own bike — you can borrow one for £6".',
          },
          {
            id: 'en-a2-r5',
            prompt: 'Borrowing a club bicycle also includes a helmet.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            explanation: '"borrow one from the clubhouse for £6, including a helmet."',
          },
          {
            id: 'en-a2-r6',
            prompt: 'Lunch at Marina Café is completely free for club members.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 2,
            explanation: 'The text mentions stopping at Marina Café for lunch, but never mentions its price.',
          },
        ],
      },
      {
        id: 'en-a2-read-p3',
        partLabel: 'Reading · Part 3 (Cambridge A2 Key Open Cloze)',
        format: 'cloze',
        instruction: 'Select the accurate grammar word for each gap in the email.',
        passageTitle: 'Checking In About Our Weekend Trip',
        passage:
          'Hi Mia, I have lived in Leeds [1] two years now, and I’ve never visited York! If the weather [2] sunny on Saturday, we will take the early train. Let’s meet at the café [3] we had coffee last month.',
        questions: [
          {
            id: 'en-a2-r7',
            prompt: 'Gap [1]: "I have lived in Leeds ___ two years now."',
            options: ['since', 'for', 'during', 'from'],
            correctIndex: 1,
            explanation: 'Duration ("two years") in Present Perfect requires "for".',
          },
          {
            id: 'en-a2-r8',
            prompt: 'Gap [2]: "If the weather ___ sunny on Saturday, we will take the early train."',
            options: ['will be', 'is', 'was', 'were'],
            correctIndex: 1,
            explanation: 'First Conditional uses Present Simple ("is") in the if-clause, never "will".',
          },
          {
            id: 'en-a2-r9',
            prompt: 'Gap [3]: "at the café ___ we had coffee last month."',
            options: ['who', 'which', 'where', 'what'],
            correctIndex: 2,
            explanation: 'Location where an action happened takes "where".',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-a2-listen-t2',
        partLabel: 'Listening · Part 2 (Friend Dialogue · Australian AU)',
        contextNote: 'Listen to Emma and Liam planning Saturday in Melbourne.',
        accentCode: 'en-AU',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Emma: Liam, are we still going kayaking on Saturday morning? Liam: I wanted to, but the forecast says strong wind, so the rental shop cancelled morning boats. Emma: Oh no! Shall we visit the science museum instead? Liam: Great idea! Let’s catch the ten-fifteen tram — my brother is coming too and he has already booked three student tickets online.',
        hearingFocusTrap: 'Watch the cancelled plan (kayaking) → replacement plan (science museum) + who booked tickets!',
        questions: [
          {
            id: 'en-a2-l4',
            prompt: 'Why are they NOT going kayaking on Saturday?',
            options: ['Tickets were too expensive', 'The rental shop cancelled morning boats due to wind', 'Liam forgot his gear', 'Emma is ill'],
            correctIndex: 1,
            explanation: '"the forecast says strong wind, so the rental shop cancelled morning boats."',
          },
          {
            id: 'en-a2-l5',
            prompt: 'How will they travel to the science museum?',
            options: ['By bus', 'By 10:15 tram', 'By bicycle', 'On foot'],
            correctIndex: 1,
            explanation: '"Let’s catch the ten-fifteen tram."',
          },
          {
            id: 'en-a2-l6',
            prompt: 'Who has already booked the museum tickets?',
            options: ['Emma', 'Liam', 'Liam’s brother', 'Nobody yet'],
            correctIndex: 2,
            explanation: '"my brother is coming too and he has already booked three student tickets online."',
          },
        ],
      },
      {
        id: 'en-a2-listen-t3',
        partLabel: 'Listening · Part 3 (Travel Update · Irish IE)',
        contextNote: 'Listen to a tour guide speaking to visitors in Dublin.',
        accentCode: 'en-IE',
        maxPlaysStrict: 2,
        preReadSeconds: 15,
        audioScript:
          'Good morning everyone! Today’s walking tour takes two hours, and we’ll finish opposite Trinity College at noon. Please stay with the group while we cross busy streets. If you feel hungry after the tour, I strongly recommend the small bakery on Grafton Street — their brown bread is delicious and much cheaper than tourist restaurants!',
        hearingFocusTrap: 'Catch tour length (2 hours), finish location (opposite Trinity College), and why the bakery is recommended.',
        questions: [
          {
            id: 'en-a2-l7',
            prompt: 'Where does the walking tour end?',
            options: ['At the train station', 'Opposite Trinity College', 'Inside the bakery', 'At the airport'],
            correctIndex: 1,
            explanation: '"we’ll finish opposite Trinity College at noon."',
          },
          {
            id: 'en-a2-l8',
            prompt: 'How long is the tour?',
            options: ['One hour', 'Ninety minutes', 'Two hours', 'Three hours'],
            correctIndex: 2,
            explanation: '"Today’s walking tour takes two hours."',
          },
          {
            id: 'en-a2-l9',
            prompt: 'Why does the guide recommend the bakery on Grafton Street?',
            options: ['It is open 24 hours', 'Its bread is delicious and cheaper than tourist restaurants', 'It gives free coffee to tour groups', 'It is inside Trinity College'],
            correctIndex: 1,
            explanation: '"their brown bread is delicious and much cheaper than tourist restaurants."',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-a2-write-t2',
      partLabel: 'Writing · Task 2 (Cambridge A2 Key Part 7 Short Story)',
      scenario: 'Write a short past-tense story based on three scenes: (1) Two friends plan a mountain picnic, (2) It suddenly starts raining heavily, (3) They discover a warm village café and laugh about their adventure.',
      taskRequirements: [
        'Use Past Simple and at least one Past Continuous sentence ("While we were...").',
        'Include clear sequence words (First, Suddenly, Finally).',
        'Write 45–80 words with a friendly ending.',
      ],
      minWords: 45,
      maxWords: 90,
      weightPercent: 55,
      keyRubricKeywords: ['while', 'suddenly', 'rain', 'discover', 'finally', 'laugh'],
      modelAnswer:
        'Last Sunday, Ben and I packed sandwiches carefully and took a bus into the hills for a picnic. The morning started bright and sunny, so we felt excited. However, while we were walking toward the lake, dark clouds arrived and it suddenly started pouring with rain! We ran down a narrow path where we discovered a cozy village café. Finally, we dried off with hot soup and laughed about our wet adventure!',
    },
    speakingPart1: {
      id: 'en-a2-speak-p1',
      partLabel: 'Speaking · Part 1 (Personal Q&A · Cambridge A2 Key)',
      instruction: 'Answer the examiner’s everyday questions in complete sentences with a brief reason.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'How do you usually travel around your town or city?',
        'What did you enjoy doing last weekend?',
        'What are you going to do on your next holiday?',
      ],
      examinerPromptAudio: 'Hello! Tell me a little about your daily life: how do you usually travel around town, and what did you do last weekend?',
      keyRubricKeywords: ['usually', 'because', 'last weekend', 'visited', 'going to'],
      modelResponseScript:
        'I usually travel around town by bicycle because it is faster and cheaper than taking the bus. Last weekend I visited a street food market with two friends and we tried delicious tacos. On my next holiday I am going to take a train to the coast for a relaxing break.',
    },
    speakingPart3: {
      id: 'en-a2-speak-p3',
      partLabel: 'Speaking · Part 3 (Interactive Preferences Discussion)',
      instruction: 'Discuss with the examiner whether beach holidays or city sightseeing trips are more enjoyable.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'State your preference ("I prefer A to B because...").',
        'Mention one advantage of the OTHER option ("Although...").',
        'Ask your partner what they prefer.',
      ],
      examinerPromptAudio: 'Some people love relaxing on the beach, while others prefer visiting museums in big cities. Which do you prefer, and why?',
      keyRubricKeywords: ['prefer', 'relaxing', 'although', 'opinion', 'agree', 'expensive'],
      modelResponseScript:
        'In my opinion, both types of holiday are fun, although I prefer city sightseeing trips to beach holidays because I love exploring local cafés and history museums. I agree that beaches are much more relaxing and sometimes less expensive, so maybe two days by the sea and three days in a city is the ideal mix! What about you — do you prefer the beach or the city?',
    },
  },

  'exam-en-b1': {
    officialMinutes: 85,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-b1-read-p2',
        partLabel: 'Reading · Part 2 (Feature Article · True / False / Not Given)',
        format: 'tfng',
        instruction: 'Read the article on community repair cafés and choose True, False, or Not Given.',
        passageTitle: 'Repair Cafés: Fixing Instead of Throwing Away',
        passage:
          'Every Saturday morning in Bristol, volunteers gather in a church hall to fix broken toasters, bicycles, and torn jackets free of charge. Visitors sit beside the volunteer so they can learn basic repair skills instead of simply dropping items off. Despite modest donations covering spare parts, organizers say their biggest challenge is finding enough skilled electronics volunteers to handle growing demand.',
        questions: [
          {
            id: 'en-b1-r4',
            prompt: 'Visitors leave their broken items at the door and return a week later to collect them.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 1,
            explanation: 'Visitors "sit beside the volunteer so they can learn basic repair skills instead of simply dropping items off."',
          },
          {
            id: 'en-b1-r5',
            prompt: 'Finding enough electronics volunteers is currently the café’s hardest problem.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            explanation: '"their biggest challenge is finding enough skilled electronics volunteers."',
          },
          {
            id: 'en-b1-r6',
            prompt: 'The Bristol repair café receives an annual grant from the UK government.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 2,
            explanation: 'The passage only mentions modest donations; government grants are not mentioned.',
          },
        ],
      },
      {
        id: 'en-b1-read-p3',
        partLabel: 'Reading · Part 3 (Cambridge B1 Preliminary Cloze & Grammar)',
        format: 'cloze',
        instruction: 'Choose the exact B1 grammar or collocation word for each gap.',
        passageTitle: 'Switching to Cycling Commutes',
        passage:
          '[1] the rainy autumn weather, Sam decided to cycle to work. At first he wasn’t used to [2] uphill every morning, so he considered giving up. However, he soon figured [3] a flatter park route and now loves it!',
        questions: [
          {
            id: 'en-b1-r7',
            prompt: 'Gap [1]: "___ the rainy autumn weather, Sam decided to cycle."',
            options: ['Although', 'Despite', 'Whereas', 'However'],
            correctIndex: 1,
            explanation: 'Followed by a noun phrase ("the rainy autumn weather") → "Despite".',
          },
          {
            id: 'en-b1-r8',
            prompt: 'Gap [2]: "he wasn’t used to ___ uphill every morning."',
            options: ['ride', 'riding', 'rode', 'ridden'],
            correctIndex: 1,
            explanation: '"be used to" (= accustomed to) takes verb-ING ("riding").',
          },
          {
            id: 'en-b1-r9',
            prompt: 'Gap [3]: "he soon figured ___ a flatter park route."',
            options: ['off', 'up', 'out', 'down'],
            correctIndex: 2,
            explanation: 'Phrasal verb "figure out" = discover/solve.',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-b1-listen-t2',
        partLabel: 'Listening · Part 2 (Radio Interview · American US)',
        contextNote: 'Listen to a radio interview with Hannah, who runs a community book-swap library.',
        accentCode: 'en-US',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Host: Hannah, how did your neighborhood book-swap box begin? Hannah: Honestly, I had run out of shelf space at home! I almost put off building the wooden box until spring, yet once I placed twenty novels outside, neighbors filled it twice over in a week. The only drawback is rain, so last month a local carpenter helped us add a stronger roof.',
        hearingFocusTrap: 'Distinguish what inspired the idea (no shelf space) vs. the drawback (rain) vs. who fixed it (local carpenter).',
        questions: [
          {
            id: 'en-b1-l4',
            prompt: 'What originally gave Hannah the idea to start the book-swap box?',
            options: ['A school assignment', 'She had run out of shelf space at home', 'The city council paid her', 'Her bookstore closed'],
            correctIndex: 1,
            explanation: '"Honestly, I had run out of shelf space at home!"',
          },
          {
            id: 'en-b1-l5',
            prompt: 'What was the main problem with the wooden box?',
            options: ['Nobody borrowed books', 'Rain damaged books until they upgraded the roof', 'People took the shelves', 'Neighbors complained about noise'],
            correctIndex: 1,
            explanation: '"The only drawback is rain, so ... a local carpenter helped us add a stronger roof."',
          },
          {
            id: 'en-b1-l6',
            prompt: 'How quickly did neighbors respond once she put the box outside?',
            options: ['It took six months', 'They filled it twice over within a week', 'Only two neighbors noticed', 'They ignored it until spring'],
            correctIndex: 1,
            explanation: '"neighbors filled it twice over in a week."',
          },
        ],
      },
      {
        id: 'en-b1-listen-t3',
        partLabel: 'Listening · Part 3 (Student Briefing · Indian IN)',
        contextNote: 'Listen to a university coordinator briefing exchange students in Bengaluru.',
        accentCode: 'en-IN',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Welcome to our orientation! Please make sure you pick up your campus transit card before Wednesday, as fares double without it. Our weekend heritage walk is free, though we have only a few seats left on the coach, so sign up at reception this afternoon if you’d like to take part.',
        hearingFocusTrap: 'Catch deadline (before Wednesday), why it matters (fares double), and why to sign up today (only a few seats left).',
        questions: [
          {
            id: 'en-b1-l7',
            prompt: 'Why should students collect their transit card before Wednesday?',
            options: ['The office closes for a month', 'Bus/train fares cost twice as much without it', 'It is required for library Wi-Fi', 'It includes free lunch'],
            correctIndex: 1,
            explanation: '"before Wednesday, as fares double without it."',
          },
          {
            id: 'en-b1-l8',
            prompt: 'How much does the weekend heritage walk cost?',
            options: ['Free', 'Ten dollars', 'Half price', 'Twenty dollars'],
            correctIndex: 0,
            explanation: '"Our weekend heritage walk is free."',
          },
          {
            id: 'en-b1-l9',
            prompt: 'Why does the speaker advise signing up this afternoon?',
            options: ['Registration costs more tomorrow', 'Only a few seats remain on the coach', 'The walk starts tonight', 'Reception is closed all week'],
            correctIndex: 1,
            explanation: '"we have only a few seats left on the coach."',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-b1-write-t2',
      partLabel: 'Writing · Task 2 (Cambridge B1 Preliminary Article · 100 Words)',
      scenario: 'You see an announcement on an international student magazine website: "Articles Wanted! What is the most memorable way to spend a weekend without spending much money? Write an article telling us your ideas and why they are worthwhile!"',
      taskRequirements: [
        'Open with an engaging title or question for magazine readers.',
        'Describe two affordable weekend ideas with concrete details.',
        'Use contrasting linkers (whereas / despite / although) and conclude cleanly.',
      ],
      minWords: 90,
      maxWords: 140,
      weightPercent: 55,
      keyRubricKeywords: ['affordable', 'memorable', 'despite', 'whereas', 'worthwhile', 'enjoy'],
      modelAnswer:
        'Big Adventures on a Tiny Budget\nDo you think a memorable weekend always requires expensive flights or fancy restaurants? Think again! Whereas city shopping trips empty your wallet quickly, exploring local nature trails or free neighborhood museums costs almost nothing. One of my favorite affordable ideas is organizing a park potluck where every friend brings one homemade dish. Despite the simple setup, sharing stories outdoors feels far more relaxing than sitting in a noisy mall. Another worthwhile option is borrowing a bike and discovering a nearby town you have never visited before. Give it a try this Saturday!',
    },
    speakingPart1: {
      id: 'en-b1-speak-p1',
      partLabel: 'Speaking · Part 1 (Interview & Personal Experience)',
      instruction: 'Answer the examiner’s questions with clear explanations and examples.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'What kind of music or podcasts do you enjoy listening to?',
        'Have you ever learned a new skill that was harder than you expected?',
        'How do you think English will help you in the future?',
      ],
      examinerPromptAudio: 'Welcome! Tell me, have you recently tried learning a new skill that felt challenging, and how do you expect English to help you in the future?',
      keyRubricKeywords: ['challenging', 'improve', 'confident', 'achieve', 'look forward to'],
      modelResponseScript:
        'Recently I started learning photography, which was far more challenging than I had expected because manual camera settings took weeks to figure out. However, practising every weekend helped me improve noticeably. As for English, I am looking forward to working on international teams, so becoming more confident in meetings will help me achieve my career goals.',
    },
    speakingPart3: {
      id: 'en-b1-speak-p3',
      partLabel: 'Speaking · Part 3 (Collaborative Decision & Follow-Up)',
      instruction: 'Negotiate with the examiner on the best community event for teenagers and explain your final choice.',
      prepSeconds: 20,
      speakSeconds: 75,
      prompts: [
        'Weigh two options: a coding workshop vs. an outdoor sports tournament.',
        'Identify one drawback of each option.',
        'Reach a realistic compromise and explain why it is worthwhile.',
      ],
      examinerPromptAudio: 'Our community center wants to organize a Saturday event for local teenagers — either a coding workshop or an outdoor sports day. Which do you think would work better?',
      keyRubricKeywords: ['consider', 'drawback', 'compromise', 'realistic', 'worthwhile', 'whereas'],
      modelResponseScript:
        'Both ideas are worthwhile, though they appeal to different groups. An outdoor sports tournament gets everyone moving, whereas a drawback is that bad weather could cancel it. A coding workshop is useful for future careers, yet some teenagers might consider it too much like school. Perhaps the most realistic compromise is hosting a tech-and-sports discovery day with short taster sessions so everyone can take part in something they enjoy!',
    },
  },

  'exam-en-b2': {
    officialMinutes: 100,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-b2-read-p2',
        partLabel: 'Reading · Part 2 (IELTS Academic · True / False / Not Given)',
        format: 'tfng',
        instruction: 'Decide if each statement matches the text (True), contradicts it (False), or is absent (Not Given).',
        passageTitle: 'Urban Micro-Forests and Heat Mitigation',
        passage:
          'Following Japanese botanist Akira Miyawaki’s dense-planting method, several European cities have converted unused parking lots into pocket "micro-forests" no larger than a tennis court. Because native saplings are planted closely together, they grow up to ten times faster than conventional parks and help mitigate localized summer heat by up to two degrees Celsius. Critics note higher upfront soil-preparation costs, yet maintenance drops substantially after three years.',
        questions: [
          {
            id: 'en-b2-r4',
            prompt: 'Micro-forests require plots at least the size of a full football stadium to succeed.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 1,
            explanation: 'They are planted on pockets "no larger than a tennis court".',
          },
          {
            id: 'en-b2-r5',
            prompt: 'Ongoing upkeep costs fall significantly once a micro-forest passes its third year.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            explanation: '"maintenance drops substantially after three years."',
          },
          {
            id: 'en-b2-r6',
            prompt: 'Tokyo currently has more Miyawaki micro-forests than Paris and Rotterdam combined.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 2,
            explanation: 'No city-by-city count comparing Tokyo, Paris, and Rotterdam appears in the passage.',
          },
        ],
      },
      {
        id: 'en-b2-read-p3',
        partLabel: 'Reading · Part 3 (Cambridge FCE Use of English · Inversion & Conditionals)',
        format: 'cloze',
        instruction: 'Select the accurate B2/C1 grammatical completion.',
        passageTitle: 'Evaluating Regional Rail Policy',
        passage:
          'Had planners [1] funds to suburban rail ten years ago, highway congestion would be far lower today. Not only [2] faster trains cut emissions, but they also connect smaller towns to major employers. [3], initial ticket subsidies remain essential.',
        questions: [
          {
            id: 'en-b2-r7',
            prompt: 'Gap [1]: "Had planners ___ funds ten years ago, congestion would be lower today."',
            options: ['allocate', 'allocated', 'allocating', 'would allocate'],
            correctIndex: 1,
            explanation: 'Inverted Mixed Conditional ("Had + Subj + V3") → "allocated".',
          },
          {
            id: 'en-b2-r8',
            prompt: 'Gap [2]: "Not only ___ faster trains cut emissions, but they also..."',
            options: ['do', 'does', 'are', 'have'],
            correctIndex: 0,
            explanation: 'Plural subject ("faster trains") + base verb ("cut") takes inverted auxiliary "do".',
          },
          {
            id: 'en-b2-r9',
            prompt: 'Gap [3]: "___, initial ticket subsidies remain essential." (concession/addition)',
            options: ['Nevertheless', 'Despite', 'Although', 'Whereas'],
            correctIndex: 0,
            explanation: 'Sentence-initial adverb followed immediately by a comma → "Nevertheless,". ("Despite/Although" cannot stand before a comma alone.)',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-b2-listen-t2',
        partLabel: 'Listening · Part 2 (Academic Tutorial · Australian AU)',
        contextNote: 'Listen to a tutor and student discussing remote-work survey findings in Sydney.',
        accentCode: 'en-AU',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Student: Our survey shows seventy-eight percent of office staff feel more productive working from home twice a week. Tutor: To a large extent that aligns with European studies. On the flip side, bear in mind that junior employees who joined remotely reported slower mentoring — so we should take onboarding experience into account before claiming remote work suits everyone equally.',
        hearingFocusTrap: 'Notice the hedge ("To a large extent") followed by the critical caveat about junior onboarding!',
        questions: [
          {
            id: 'en-b2-l4',
            prompt: 'What did 78% of surveyed office staff report?',
            options: ['Higher productivity when working from home two days a week', 'Desire to quit remote work entirely', 'Higher salaries in remote roles', 'Longer daily commutes'],
            correctIndex: 0,
            explanation: '"seventy-eight percent ... feel more productive working from home twice a week."',
          },
          {
            id: 'en-b2-l5',
            prompt: 'Which group experienced a downside according to the tutor?',
            options: ['Senior executives', 'Junior employees who onboarded remotely', 'External consultants', 'IT support staff'],
            correctIndex: 1,
            explanation: '"junior employees who joined remotely reported slower mentoring."',
          },
          {
            id: 'en-b2-l6',
            prompt: 'What does the tutor recommend factoring into the final report?',
            options: ['Office coffee budgets', 'Onboarding and mentoring experience across career stages', 'Real estate taxes only', 'Discarding the survey entirely'],
            correctIndex: 1,
            explanation: '"we should take onboarding experience into account."',
          },
        ],
      },
      {
        id: 'en-b2-listen-t3',
        partLabel: 'Listening · Part 3 (IELTS Section 4 Mini-Lecture · South African ZA)',
        contextNote: 'Listen to an urban-design briefing from Cape Town on water conservation.',
        accentCode: 'en-ZA',
        maxPlaysStrict: 2,
        preReadSeconds: 20,
        audioScript:
          'Following severe drought warnings, municipal water usage fell by nearly half within eighteen months. Smart pressure meters accounted for a substantial share of those savings by detecting hidden pipe leaks overnight. Nevertheless, engineers warn against complacency: as population density climbs, diversifying supply through rainwater harvesting and recycled gray water remains the only viable long-term path.',
        hearingFocusTrap: 'Track how much water usage dropped (nearly half), what smart meters caught (hidden leaks), and the long-term recommendation.',
        questions: [
          {
            id: 'en-b2-l7',
            prompt: 'By roughly how much did municipal water usage decline over 18 months?',
            options: ['By 10%', 'By nearly 50%', 'By 80%', 'It remained flat'],
            correctIndex: 1,
            explanation: '"fell by nearly half within eighteen months."',
          },
          {
            id: 'en-b2-l8',
            prompt: 'How did smart pressure meters help conserve water?',
            options: ['By shutting off residential taps at noon', 'By detecting hidden overnight pipe leaks', 'By raising water tariffs automatically', 'By filtering ocean salt'],
            correctIndex: 1,
            explanation: '"by detecting hidden pipe leaks overnight."',
          },
          {
            id: 'en-b2-l9',
            prompt: 'What do engineers advise for long-term resilience?',
            options: ['Relying solely on rainfall', 'Diversifying supply via rainwater harvesting and recycled gray water', 'Removing pressure meters', 'Halting urban housing construction'],
            correctIndex: 1,
            explanation: '"diversifying supply through rainwater harvesting and recycled gray water remains the only viable long-term path."',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-b2-write-t2',
      partLabel: 'Writing · Task 2 (Cambridge FCE Formal Report / Proposal)',
      scenario: 'Your college director asked you to evaluate the campus sports & wellness center and recommend practical upgrades for next year.',
      taskRequirements: [
        'Use clear report subheadings (Introduction, Current Issues, Recommendations).',
        'Maintain objective formal register (no slang or contractions).',
        'Include at least one inversion or formal linker (consequently, nevertheless, viable).',
      ],
      minWords: 140,
      maxWords: 200,
      weightPercent: 50,
      keyRubricKeywords: ['evaluate', 'substantially', 'consequently', 'nevertheless', 'viable', 'implement'],
      modelAnswer:
        'Report on Campus Wellness Facilities\n\nIntroduction\nThe purpose of this report is to evaluate the current campus sports center and propose viable upgrades for the upcoming academic year.\n\nCurrent Strengths and Limitations\nStudent membership has increased substantially over the past two semesters; consequently, weight rooms and studio classes are frequently oversubscribed during evening peak hours. The coaching staff receive overwhelmingly positive feedback; nevertheless, locker maintenance and ventilation require urgent attention.\n\nRecommendations\nIt is strongly recommended that management implement an online slot-booking system and extend weekday closing hours to 22:00. Not only would these measures reduce crowding immediately, but they would also make the facility far more accessible to part-time students.',
    },
    speakingPart1: {
      id: 'en-b2-speak-p1',
      partLabel: 'Speaking · Part 1 (Warm-Up & Extended Opinion)',
      instruction: 'Answer clearly with natural B2 hedging and concrete personal examples.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'What kind of neighborhood environment helps you concentrate best?',
        'How has technology changed the way you keep in touch with friends?',
      ],
      examinerPromptAudio: 'Good afternoon! To start, how has modern technology changed the way you maintain friendships — for better or for worse?',
      keyRubricKeywords: ['to a large extent', 'on the flip side', 'convenient', 'bear in mind', 'meaningful'],
      modelResponseScript:
        'To a large extent, messaging apps and video calls have been wonderful because they make staying close to friends living abroad effortless. On the flip side, we have to bear in mind that quick texts can sometimes replace deeper face-to-face conversations. Personally, I try to pair brief voice notes with unhurried in-person coffee catch-ups whenever possible.',
    },
    speakingPart3: {
      id: 'en-b2-speak-p3',
      partLabel: 'Speaking · Part 3 (IELTS Part 3 / FCE Part 4 Abstract Discussion)',
      instruction: 'Respond analytically to the examiner’s abstract follow-up question on public transport vs. private cars.',
      prepSeconds: 15,
      speakSeconds: 90,
      prompts: [
        'Address whether cities should prioritize subsidies or car restrictions.',
        'Mention one unintended consequence to avoid.',
        'Conclude with a balanced, persuasive policy view.',
      ],
      examinerPromptAudio: 'Do you think governments should discourage private car ownership through higher taxes, or focus mainly on making public transport cheaper and more reliable?',
      keyRubricKeywords: ['pivotal role', 'unintended consequence', 'feasible', 'mitigate', 'allocate'],
      modelResponseScript:
        'I believe investing in reliable, affordable transit plays a far more pivotal role than taxes alone. If councils raise driving fees before trains and buses are dependable, they risk the unintended consequence of unfairly penalizing rural commuters who have no feasible alternative. A smarter approach is to allocate funding to frequent transit first, and only then introduce targeted congestion charges to mitigate inner-city emissions.',
    },
  },

  'exam-en-c1': {
    officialMinutes: 115,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-c1-read-p2',
        partLabel: 'Reading · Part 2 (CAE Cross-Text Attitude Synthesis)',
        format: 'tfng',
        instruction: 'Compare both researchers’ viewpoints carefully and identify exact agreement, disagreement, or unstated claims.',
        passageTitle: 'Four-Day Academic Semesters: Two Perspectives',
        passage:
          'Dr. Patel argues that condensing university lectures into four intensive days mitigates student commuting expenses and creates an uninterrupted research day, albeit placing heavier demands on afternoon concentration. Prof. Lindholm concedes the commuting benefit yet maintains that empirical evidence for deeper retention remains tenuous; compressing seminars, she contends, risks exacerbating burnout among first-year undergraduates.',
        questions: [
          {
            id: 'en-c1-r4',
            prompt: 'Both Dr. Patel and Prof. Lindholm acknowledge that a four-day timetable can reduce commuting burdens.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            explanation: 'Dr. Patel highlights lower commuting expenses, and Prof. Lindholm explicitly "concedes the commuting benefit".',
          },
          {
            id: 'en-c1-r5',
            prompt: 'Prof. Lindholm believes compressed schedules clearly improve knowledge retention among first-year students.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 1,
            explanation: 'She calls evidence for retention "tenuous" and warns of burnout among first-year undergraduates.',
          },
          {
            id: 'en-c1-r6',
            prompt: 'Dr. Patel has personally implemented a four-day timetable at Oxford University.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 2,
            explanation: 'No institution or personal rollout is mentioned.',
          },
        ],
      },
      {
        id: 'en-c1-read-p3',
        partLabel: 'Reading · Part 3 (CAE Use of English · Inversion, Subjunctive & Hedging)',
        format: 'cloze',
        instruction: 'Select the grammatically exact C1 structure for each gap.',
        passageTitle: 'Algorithmic Transparency Standards',
        passage:
          'Only after independent auditors reviewed the model [1] the scoring bias come to light. It is imperative that public agencies [2] transparent evaluation logs before deployment. The reform proved pragmatic, [3] costly during its initial rollout.',
        questions: [
          {
            id: 'en-c1-r7',
            prompt: 'Gap [1]: "Only after independent auditors reviewed the model ___ the scoring bias come to light."',
            options: ['did', 'was', 'had', 'has'],
            correctIndex: 0,
            explanation: 'Inversion in the main clause with bare infinitive "come" requires "did".',
          },
          {
            id: 'en-c1-r8',
            prompt: 'Gap [2]: "It is imperative that public agencies ___ transparent evaluation logs." (formal mandative)',
            options: ['publishes', 'publish', 'published', 'publishing'],
            correctIndex: 1,
            explanation: 'Mandative subjunctive uses the bare base verb ("publish").',
          },
          {
            id: 'en-c1-r9',
            prompt: 'Gap [3]: "The reform proved pragmatic, ___ costly during its initial rollout."',
            options: ['despite', 'albeit', 'notwithstanding', 'whereas'],
            correctIndex: 1,
            explanation: '"albeit" attaches directly to a bare adjective ("albeit costly").',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-c1-listen-t2',
        partLabel: 'Listening · Part 2 (Academic Panel · Single Play · Irish IE)',
        contextNote: 'Listen ONCE to a policy panel in Dublin discussing urban housing density.',
        accentCode: 'en-IE',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Speaker A: Expanding mid-rise timber housing looks compelling on paper and might well have cut construction emissions in Scandinavia. Having said that, we can’t overlook an unintended spillover: without parallel investment in schools and transit, denser districts quickly spark local opposition. I’d back zoning reform only with a binding infrastructure caveat.',
        hearingFocusTrap: 'Single-play C1 audio! Catch the conditional endorsement ("only with a binding infrastructure caveat").',
        questions: [
          {
            id: 'en-c1-l4',
            prompt: 'What unintended spillover does the speaker warn about?',
            options: ['Timber rotting rapidly', 'Local opposition if density rises without matching schools and transit', 'Falling construction wages', 'Empty rural villages'],
            correctIndex: 1,
            explanation: '"without parallel investment in schools and transit, denser districts quickly spark local opposition."',
          },
          {
            id: 'en-c1-l5',
            prompt: 'Under what condition would the speaker endorse zoning reform?',
            options: ['Unconditionally right away', 'Only with a binding infrastructure commitment attached', 'Only if timber is banned', 'Never under any circumstances'],
            correctIndex: 1,
            explanation: '"I’d back zoning reform only with a binding infrastructure caveat."',
          },
          {
            id: 'en-c1-l6',
            prompt: 'How does the speaker characterize the Scandinavian timber-housing record?',
            options: ['As a complete failure', 'As plausible/likely successful in cutting emissions', 'As legally irrelevant', 'As deliberately falsified'],
            correctIndex: 1,
            explanation: '"might well have cut construction emissions in Scandinavia."',
          },
        ],
      },
      {
        id: 'en-c1-listen-t3',
        partLabel: 'Listening · Part 3 (TOEFL-Style Lecture · Single Play · American US)',
        contextNote: 'Listen ONCE to a cognitive-science lecture on bilingual executive control.',
        accentCode: 'en-US',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Early neuroimaging papers claimed bilingualism universally delays cognitive aging, yet subsequent replication studies painted a more nuanced picture. Not until researchers controlled for socioeconomic status and lifelong reading habits did the true mechanism emerge: constant language switching appears to bolster attentional filtering specifically, rather than boosting general IQ across the board.',
        hearingFocusTrap: 'Single play! Contrast the sweeping early claim vs. the narrower replicated mechanism (attentional filtering).',
        questions: [
          {
            id: 'en-c1-l7',
            prompt: 'What shifted researchers’ understanding of bilingual cognitive benefits?',
            options: ['Controlling for socioeconomic status and reading habits in replication studies', 'Testing only monolingual children', 'Abandoning brain imaging altogether', 'Studying artificial programming languages'],
            correctIndex: 0,
            explanation: '"Not until researchers controlled for socioeconomic status and lifelong reading habits..."',
          },
          {
            id: 'en-c1-l8',
            prompt: 'Which specific skill does constant language switching appear to strengthen?',
            options: ['Mathematical speed', 'Attentional filtering', 'Short-term musical pitch', 'General IQ universally'],
            correctIndex: 1,
            explanation: '"bolster attentional filtering specifically, rather than boosting general IQ across the board."',
          },
          {
            id: 'en-c1-l9',
            prompt: 'What is the lecturer’s overall tone?',
            options: ['Dismissive of all neuroscience', 'Measured and evidence-driven', 'Sensationalist and promotional', 'Uncertain and unprepared'],
            correctIndex: 1,
            explanation: 'The lecturer weighs early claims against controlled replication with scholarly precision.',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-c1-write-t2',
      partLabel: 'Writing · Task 2 (CAE Executive Proposal · 220 Words)',
      scenario: 'Your municipal council is allocating a grant to revitalize public libraries. Write a persuasive proposal outlining two modern services to fund and substantiating their expected community impact.',
      taskRequirements: [
        'Use formal proposal headings (Purpose, Proposed Initiatives, Expected Impact).',
        'Deploy high-register C1 verbs and structures (underpin, reconcile, imperative, inverted conditional).',
        'Substantiate why both initiatives justify public investment.',
      ],
      minWords: 160,
      maxWords: 250,
      weightPercent: 50,
      keyRubricKeywords: ['imperative', 'reconcile', 'underpin', 'substantiate', 'bolster', 'robust'],
      modelAnswer:
        'Proposal: Transforming Municipal Libraries into Civic Learning Hubs\n\nPurpose\nThis proposal requests grant funding to modernize neighborhood libraries, reconciling their traditional quiet-study heritage with contemporary digital and linguistic inclusion needs.\n\nProposed Initiatives\nFirst, establishing dedicated acoustic pods would bolster access for remote workers and language learners lacking quiet home environments. Second, launching free evening digital-literacy clinics would mitigate the disproportionate impact of online-only public services on older residents. Robust attendance data from neighboring municipalities substantiate that multi-use libraries double evening footfall without eroding book lending.\n\nExpected Impact\nUnderpinning this initiative is a simple civic imperative: accessible shared knowledge spaces strengthen social cohesion. Should the council endorse this phased pilot, measurable gains in community participation would emerge within twelve months.',
    },
    speakingPart1: {
      id: 'en-c1-speak-p1',
      partLabel: 'Speaking · Part 1 (Executive Interview & Nuanced Reflection)',
      instruction: 'Deliver crisp, reflective answers demonstrating C1 lexical precision and natural hedging.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'How does mastering a second language reshape the way someone approaches unfamiliar cultures?',
        'What workplace habit do you consider most undervalued today?',
      ],
      examinerPromptAudio: 'Good afternoon! Beyond practical travel or career benefits, how do you think deep mastery of another language changes the way a person thinks?',
      keyRubricKeywords: ['arguably', 'nuance', 'pragmatic', 'catalyst', 'double-edged'],
      modelResponseScript:
        'Arguably the greatest gift of deep language mastery is tolerance for ambiguity. When you discover idioms or grammatical frames that have no neat one-to-one translation, you stop expecting every culture to organize reality the same way. It acts as a quiet catalyst for intellectual humility and sharper listening — traits that prove just as valuable in leadership as in everyday friendships.',
    },
    speakingPart3: {
      id: 'en-c1-speak-p3',
      partLabel: 'Speaking · Part 3 (CAE Part 4 / IELTS Band 8 Abstract Rebuttal)',
      instruction: 'Engage diplomatically with the examiner’s counterargument on automation and creative professions.',
      prepSeconds: 15,
      speakSeconds: 105,
      prompts: [
        'Acknowledge the valid economic anxiety behind the examiner’s point.',
        'Differentiate routine production from authentic human authorship.',
        'Close with a nuanced, forward-looking verdict.',
      ],
      examinerPromptAudio: 'Many artists and writers fear that generative tools will simply hollow out entry-level creative careers before young talent ever gets a chance to develop mastery. Isn’t that a serious danger?',
      keyRubricKeywords: ['having said that', 'caveat', 'disproportionate', 'reconcile', 'warrant'],
      modelResponseScript:
        'That concern certainly warrants serious attention — entry-level apprenticeships have historically been where junior designers and journalists sharpened their judgment, so automating all routine drafts could indeed impose a disproportionate toll on newcomers. Having said that, history suggests creative fields rarely vanish; rather, their craft shifts upward toward curation, taste, and original reporting. To reconcile efficiency with human development, studios must deliberately protect mentored junior roles instead of treating speed as the sole metric.',
    },
  },

  'exam-en-c2': {
    officialMinutes: 130,
    requireAllSkillsPass: true,
    primaryAccentCode: 'en-GB',
    extraReadingParts: [
      {
        id: 'en-c2-read-p2',
        partLabel: 'Reading · Part 2 (CPE Literary & Cultural Criticism · TFNG)',
        format: 'tfng',
        instruction: 'Analyze the critic’s subtle irony, concession, and lexical precision closely.',
        passageTitle: 'Against Frictionless Culture',
        passage:
          'Ostensibly engineered to liberate our schedules, recommendation feeds have quietly trained audiences to equate aesthetic merit with instant digestibility. For all its algorithmic sophistication, personalization remains the antithesis of serendipity: it flatters existing tastes while quietly insulating listeners from the productive discomfort of unfamiliar art. Still, blaming engineers alone would be a convenient red herring; cultural institutions themselves too often chase viral metrics with unseemly haste.',
        questions: [
          {
            id: 'en-c2-r4',
            prompt: 'The author believes algorithmic personalization encourages accidental discovery of challenging, unfamiliar art.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 1,
            explanation: 'It is called "the antithesis of serendipity" that insulates listeners from unfamiliar art.',
          },
          {
            id: 'en-c2-r5',
            prompt: 'The author holds cultural institutions partly culpable alongside tech engineers.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            explanation: 'Blaming engineers alone is called a "red herring" because cultural institutions also chase viral metrics.',
          },
          {
            id: 'en-c2-r6',
            prompt: 'The author recommends taxing streaming platforms to fund classical orchestras.',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 2,
            explanation: 'No tax or orchestra funding proposal is mentioned in the passage.',
          },
        ],
      },
      {
        id: 'en-c2-read-p3',
        partLabel: 'Reading · Part 3 (CPE Use of English · Inverted Conditionals & Idioms)',
        format: 'cloze',
        instruction: 'Choose the exact C2 syntactic or lexical match.',
        passageTitle: 'Editorial Precision',
        passage:
          '[1] publishers to abandon slow investigative editing for click-driven summaries, civic literacy would suffer irreparably. The essay is all the more cogent [2] refusing partisan clichés. [3], short-term revenue pressures remain stubbornly real.',
        questions: [
          {
            id: 'en-c2-r7',
            prompt: 'Gap [1]: "___ publishers to abandon slow editing, civic literacy would suffer."',
            options: ['Were', 'Had', 'Should', 'Was'],
            correctIndex: 0,
            explanation: 'Inverted 2nd Conditional: "Were + subject + to-infinitive".',
          },
          {
            id: 'en-c2-r8',
            prompt: 'Gap [2]: "The essay is all the more cogent ___ refusing partisan clichés."',
            options: ['to', 'for', 'with', 'of'],
            correctIndex: 1,
            explanation: 'Idiomatic C2 structure: "all the more [adj] FOR [-ing]".',
          },
          {
            id: 'en-c2-r9',
            prompt: 'Gap [3]: "___, short-term revenue pressures remain stubbornly real."',
            options: ['Be that as it may', 'Albeit', 'Despite', 'Inasmuch'],
            correctIndex: 0,
            explanation: 'Standalone fixed subjunctive transition before a comma → "Be that as it may,".',
          },
        ],
      },
    ],
    extraListeningTracks: [
      {
        id: 'en-c2-listen-t2',
        partLabel: 'Listening · Part 2 (Cultural Debate · Single Play · British RP)',
        contextNote: 'Listen ONCE to a British literary critic evaluating modern architectural preservation.',
        accentCode: 'en-GB',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'With the greatest respect to preservationists who treat every Victorian facade as sacrosanct, freezing a living metropolis in amber begs the question of whom cities actually belong to. Winning an aesthetic victory that prices out younger residents is surely a pyrrhic triumph. That said, reckless glass-tower speculation is equally untenable — what cities cry out for is a far more perspicacious synthesis of heritage and bold contemporary craft.',
        hearingFocusTrap: 'Single play! Track British diplomatic pushback ("With the greatest respect") and "pyrrhic triumph"!',
        questions: [
          {
            id: 'en-c2-l4',
            prompt: 'What does the speaker imply about rigid architectural preservation that prices out younger residents?',
            options: ['It is a costless cultural win', 'It is a self-defeating ("pyrrhic") victory', 'It lowers housing costs', 'It encourages bold glass towers'],
            correctIndex: 1,
            explanation: 'She calls it "a pyrrhic triumph" — winning aesthetically while hollowing out living communities.',
          },
          {
            id: 'en-c2-l5',
            prompt: 'Does the speaker endorse unchecked modern glass-tower development instead?',
            options: ['Yes, wholeheartedly', 'No — she dismisses reckless speculation as equally untenable', 'Only outside London', 'She refuses to express any view'],
            correctIndex: 1,
            explanation: '"reckless glass-tower speculation is equally untenable."',
          },
          {
            id: 'en-c2-l6',
            prompt: 'What middle path does she advocate?',
            options: ['Banning all renovations', 'A discerning synthesis of heritage and quality contemporary design', 'Moving capitals to rural towns', 'Copying ancient designs identically'],
            correctIndex: 1,
            explanation: '"a far more perspicacious synthesis of heritage and bold contemporary craft."',
          },
        ],
      },
      {
        id: 'en-c2-listen-t3',
        partLabel: 'Listening · Part 3 (Executive Interview · Single Play · Australian AU)',
        contextNote: 'Listen ONCE to an Australian science communicator reflecting on public trust.',
        accentCode: 'en-AU',
        maxPlaysStrict: 1,
        preReadSeconds: 25,
        audioScript:
          'Scientists often conflate transparent uncertainty with weakness, yet paradoxically audiences trust candid caveats far more than false bravado. When researchers acknowledge what remains equivocal while explaining the salient evidence lucidly, public equanimity grows — even during crises. Treating citizens as incapable of nuance is the surest way to erode credibility.',
        hearingFocusTrap: 'Single play! Catch the core paradox between candid caveats and higher public trust.',
        questions: [
          {
            id: 'en-c2-l7',
            prompt: 'What mistake do scientists frequently make according to the speaker?',
            options: ['Publishing too many graphs', 'Confusing honest acknowledgment of uncertainty with weakness', 'Speaking too casually', 'Avoiding peer review'],
            correctIndex: 1,
            explanation: '"often conflate transparent uncertainty with weakness."',
          },
          {
            id: 'en-c2-l8',
            prompt: 'What builds public equanimity during crises?',
            options: ['Hiding all caveats behind confident slogans', 'Explaining salient evidence lucidly while admitting what remains equivocal', 'Limiting public briefings to once a year', 'Using highly technical jargon'],
            correctIndex: 1,
            explanation: 'Candid caveats paired with lucid evidence foster calm public trust.',
          },
          {
            id: 'en-c2-l9',
            prompt: 'What does the speaker warn erodes credibility fastest?',
            options: ['Assuming the public cannot handle nuance', 'Sharing preliminary data openly', 'Collaborating internationally', 'Speaking in plain metaphors'],
            correctIndex: 0,
            explanation: '"Treating citizens as incapable of nuance is the surest way to erode credibility."',
          },
        ],
      },
    ],
    extraWritingTask: {
      id: 'en-c2-write-t2',
      partLabel: 'Writing · Task 2 (CPE Part 2 Publication-Grade Review / Essay)',
      scenario: 'An international literary quarterly invites readers to contribute a reflective essay or review exploring how a book, film, or city changed their sense of time and attention.',
      taskRequirements: [
        'Craft an evocative, lucid opening that establishes distinctive editorial voice.',
        'Balance incisive critical insight with vivid juxtaposition or metaphor.',
        'Demonstrate effortless C2 syntactic variety (inversion, cleft, antithesis) with zero filler.',
      ],
      minWords: 200,
      maxWords: 320,
      weightPercent: 55,
      keyRubricKeywords: ['juxtaposition', 'ephemeral', 'lucid', 'antithesis', 'enduring', 'measured'],
      modelAnswer:
        'Rarely does a contemporary documentary trust its audience enough to linger on an unhurried silence, yet "The Slow Harbor" is all the more incisive for refusing frantic montage. Built around the startling juxtaposition of dawn ferry routines and archival civic letters, the film offers a quintessential meditation on how architecture shapes human attention. Whereas algorithmic feeds monetize ephemeral outrage, its measured pacing functions as the quiet antithesis of modern urgency. Were mainstream broadcasters to adopt even a fraction of this restraint, public storytelling might recover both its cogency and its grace. Though deliberately equivocal about whether coastal towns can resist speculative tourism, its lucid craft and understated eloquence leave an enduring imprint long after the theater lights rise.',
    },
    speakingPart1: {
      id: 'en-c2-speak-p1',
      partLabel: 'Speaking · Part 1 (Warm-Up & Intellectual Calibration)',
      instruction: 'Respond with effortless fluency, vivid precision, and natural prosody.',
      prepSeconds: 15,
      speakSeconds: 60,
      prompts: [
        'What separates merely clear communication from genuinely memorable eloquence?',
        'Is there a cultural habit from another country you wish your own adopted?',
      ],
      examinerPromptAudio: 'Welcome to the C2 Proficiency speaking test. To open, what do you think distinguishes merely clear writing or speaking from genuinely memorable eloquence?',
      keyRubricKeywords: ['eloquence', 'lucid', 'measured', 'precision', 'resonance'],
      modelResponseScript:
        'Clarity ensures a listener understands what you mean, whereas eloquence makes the thought impossible to unhear. Rarely does it come from decorative vocabulary; rather, it arises from rhythmic restraint — choosing the single exact verb, pairing a lucid insight with an unexpected metaphor, and trusting a measured pause so the idea lands with quiet resonance.',
    },
    speakingPart3: {
      id: 'en-c2-speak-p3',
      partLabel: 'Speaking · Part 3 (CPE Part 3 Impromptu Debate & Pushback)',
      instruction: 'Engage directly with the examiner’s probing challenge on universal translation vs. deep language learning.',
      prepSeconds: 15,
      speakSeconds: 120,
      prompts: [
        'Challenge the premise gracefully ("With the greatest respect..." / "I’d take issue with...").',
        'Distinguish transactional decoding from cultural empathy and subtext.',
        'Land a cogent, memorable final verdict.',
      ],
      examinerPromptAudio: 'With live neural earbuds translating conversations in milliseconds, isn’t spending years mastering a foreign language to C2 level becoming a charming but obsolete hobby?',
      keyRubricKeywords: ['with the greatest respect', 'conflate', 'panacea', 'nuance', 'enduring'],
      modelResponseScript:
        'With the greatest respect, that forecast conflates transactional decoding with genuine human communion. Live earbuds are a splendid convenience for booking trains or reading menus, yet they are no panacea for irony, diplomatic understatement, or the subtle warmth of humor shared without an intermediary. Paradoxically, the more effortlessly machines translate surface words, the more enduring value attaches to speakers who command a culture’s unspoken nuance directly. Mastery is not becoming obsolete; it is becoming the hallmark of authentic trust.',
    },
  },
};
