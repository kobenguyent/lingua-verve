import { CEFRLevel, MockExam } from '../types';
import { MOCK_EXAM_EXTENSIONS } from './mockExamExtensions';
import { CONVERSATIONAL_LISTENING_SCRIPTS } from './conversationalListeningScripts';
import { FRENCH_MOCK_EXAMS } from './mockExamsFrench';
import { JAPANESE_MOCK_EXAMS } from './mockExamsJapanese';

/**
 * 12 Full 4-Skill Simulated Certification Exams (English A1–C2 + German A1–C2)
 * Modeled on Goethe-Zertifikat / telc / TestDaF (German) and Cambridge / IELTS / TOEFL (English).
 * Each exam is enriched via MOCK_EXAM_EXTENSIONS into a realistic multi-part format:
 * - 3 Reading Parts (Comprehension + Richtig/Falsch or TFNG + Sprachbausteine/Use of English = 9 Qs)
 * - 3 Multi-Accent Listening Tracks (DE/AT/CH or GB/US/AU/IE/IN/ZA = 9 Qs)
 * - 2 Weighted Writing Tasks
 * - 3 Interactive Speaking Parts (Warm-Up + Timed Cue Card + Examiner Pushback)
 */
const RAW_MOCK_EXAMS: MockExam[] = [
  // ================================== GERMAN SIMULATED EXAMS (A1–C2) ==================================
  {
    id: 'exam-de-a1',
    languageId: 'german',
    level: 'A1',
    title: 'Goethe-Zertifikat A1 Simulation (Start Deutsch 1)',
    alignedCertificate: 'Goethe-Zertifikat A1: Start Deutsch 1',
    passingScorePercent: 60,
    totalMinutes: 25,
    reading: {
      title: 'Lesen · Teil 1 & 2 (Notice & Short Email)',
      durationMinutes: 6,
      passageTitle: 'E-Mail von Tobias & Öffnungszeiten',
      passage:
        'Hallo Sara, ich bin am Samstag in Hamburg! Mein Zug kommt um 11:20 Uhr am Hauptbahnhof an. Können wir um 12:00 Uhr zusammen im Café Elbe essen? Am Nachmittag möchte ich das Stadtmuseum besuchen. Das Museum kostet 8 Euro und schließt erst um 18:00 Uhr. Bis Samstag! Tobias.',
      questions: [
        {
          id: 'de-a1-r1',
          prompt: 'Wann kommt der Zug von Tobias in Hamburg an?',
          options: ['Um 12:00 Uhr', 'Um 11:20 Uhr', 'Um 18:00 Uhr', 'Am Sonntag'],
          correctIndex: 1,
          explanation: 'Der Text sagt eindeutig: „Mein Zug kommt um 11:20 Uhr am Hauptbahnhof an.“',
        },
        {
          id: 'de-a1-r2',
          prompt: 'Was möchte Tobias am Nachmittag machen?',
          options: ['Einkaufen gehen', 'Im Café arbeiten', 'Das Stadtmuseum besuchen', 'Nach Berlin fahren'],
          correctIndex: 2,
          explanation: 'Am Nachmittag möchte er das Stadtmuseum besuchen.',
        },
        {
          id: 'de-a1-r3',
          prompt: 'Wie viel kostet der Eintritt ins Museum?',
          options: ['Kostenlos', '12 Euro', '18 Euro', '8 Euro'],
          correctIndex: 3,
          explanation: '„Das Museum kostet 8 Euro.“',
        },
      ],
    },
    listening: {
      title: 'Hören · Bahnhof & Einkauf (Hearing Trap Check)',
      durationMinutes: 6,
      maxPlaysStrict: 2,
      contextNote: 'Sie hören eine Durchsage im Supermarkt und eine Nachricht auf dem Anrufbeantworter.',
      audioScript:
        'Liebe Kundinnen und Kunden, heute gibt es frische Erdbeeren im Angebot: fünfhundert Gramm kosten nur zwei Euro fünfzig statt vier Euro. Unsere Bäckerei im Erdgeschoss schließt heute ausnahmsweise schon um neunzehn Uhr. Vielen Dank für Ihren Einkauf!',
      hearingFocusTrap: 'Watch German numbers: 2,50 € (Angebot) vs. 4,00 € (normal price), and 19:00 Uhr.',
      questions: [
        {
          id: 'de-a1-l1',
          prompt: 'Wie viel kosten 500 Gramm Erdbeeren heute?',
          options: ['4,00 Euro', '2,50 Euro', '5,00 Euro', '1,90 Euro'],
          correctIndex: 1,
          explanation: 'Heute im Angebot kosten 500g nur 2,50 € („zwei Euro fünfzig“).',
        },
        {
          id: 'de-a1-l2',
          prompt: 'Wo ist die Bäckerei?',
          options: ['Im zweiten Stock', 'Neben dem Parkplatz', 'Im Erdgeschoss', 'Auf der Straße'],
          correctIndex: 2,
          explanation: '„Unsere Bäckerei im Erdgeschoss...“',
        },
        {
          id: 'de-a1-l3',
          prompt: 'Wann schließt die Bäckerei heute?',
          options: ['Um 19:00 Uhr', 'Um 20:00 Uhr', 'Um 17:00 Uhr', 'Sie ist schon geschlossen'],
          correctIndex: 0,
          explanation: 'Sie schließt heute ausnahmsweise schon um neunzehn Uhr (19:00).',
        },
      ],
    },
    writing: {
      title: 'Schreiben · Kurze E-Mail an eine Sprachschule',
      durationMinutes: 7,
      scenario: 'Sie möchten im August einen Deutschkurs in München machen. Schreiben Sie eine kurze E-Mail an die Sprachschule „Hallo Deutsch“.',
      taskRequirements: [
        'Sagen Sie, wann Sie einen Kurs machen möchten.',
        'Fragen Sie nach den Kurszeiten und dem Preis.',
        'Fragen Sie, ob es noch freie Plätze gibt.',
      ],
      minWords: 30,
      maxWords: 70,
      keyRubricKeywords: ['August', 'Deutschkurs', 'Preis', 'kostet', 'Uhr', 'Platz', 'Grüße'],
      modelAnswer:
        'Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 in München machen. Wann findet der Kurs statt und wie viel kostet er? Gibt es noch freie Plätze?\nMit freundlichen Grüßen\nAlex Weber',
    },
    speaking: {
      title: 'Sprechen · Sich vorstellen & Bitten formulieren',
      durationMinutes: 6,
      prepSeconds: 30,
      speakSeconds: 60,
      cueCardTitle: 'Teil 1: Selbstvorstellung',
      bulletPoints: [
        'Name & Herkunft (Woher kommen Sie?)',
        'Wohnort & Beruf (Wo wohnen Sie? Was machen Sie?)',
        'Sprachen & Hobbys (Welche Sprachen sprechen Sie?)',
      ],
      followUpQuestion: 'Wie buchstabieren Sie Ihren Familiennamen und was machen Sie gern am Wochenende?',
      keyRubricKeywords: ['heiße', 'komme', 'wohne', 'spreche', 'arbeite', 'gern'],
      modelResponseScript:
        'Hallo, ich heiße Alex und ich komme aus Kanada. Ich wohne jetzt in Berlin und arbeite als Designer. Ich spreche Englisch, Französisch und ein bisschen Deutsch. Am Wochenende koche ich gern und fahre Fahrrad.',
    },
  },
  {
    id: 'exam-de-a2',
    languageId: 'german',
    level: 'A2',
    title: 'Goethe-Zertifikat A2 Simulation',
    alignedCertificate: 'Goethe-Zertifikat A2 / telc Deutsch A2',
    passingScorePercent: 60,
    totalMinutes: 28,
    reading: {
      title: 'Lesen · Online-Blog & Veranstaltungshinweis',
      durationMinutes: 7,
      passageTitle: 'Mein erster Flohmarkt in Leipzig',
      passage:
        'Letzten Sonntag bin ich mit meiner Schwester zum großen Flohmarkt am Alten Messegelände gegangen. Weil das Wetter super war, waren schon um neun Uhr morgens sehr viele Besucher dort. Ich wollte eigentlich eine alte Lampe für mein Wohnzimmer finden, aber die Lampen waren zu teuer. Stattdessen habe ich drei spannende deutsche Bücher und eine warme Winterjacke für nur zwölf Euro gekauft. Nächsten Monat wollen wir dort selbst einen Stand mieten.',
      questions: [
        {
          id: 'de-a2-r1',
          prompt: 'Warum hat der Autor keine Lampe gekauft?',
          options: [
            'Es gab keine Lampen.',
            'Die Lampen waren zu teuer.',
            'Die Lampen waren kaputt.',
            'Seine Schwester wollte keine Lampe.',
          ],
          correctIndex: 1,
          explanation: 'Im Text steht: „aber die Lampen waren zu teuer.“',
        },
        {
          id: 'de-a2-r2',
          prompt: 'Was hat der Autor auf dem Flohmarkt gekauft?',
          options: [
            'Eine Lampe und Bücher',
            'Drei Bücher und eine Winterjacke',
            'Nur eine Jacke für 20 Euro',
            'Möbel für das Wohnzimmer',
          ],
          correctIndex: 1,
          explanation: '„Stattdessen habe ich drei spannende deutsche Bücher und eine warme Winterjacke für nur zwölf Euro gekauft.“',
        },
        {
          id: 'de-a2-r3',
          prompt: 'Was planen der Autor und seine Schwester nächsten Monat?',
          options: [
            'Nach Berlin fahren',
            'Einen eigenen Stand auf dem Flohmarkt mieten',
            'Eine neue Wohnung suchen',
            'Bücher in der Bibliothek ausleihen',
          ],
          correctIndex: 1,
          explanation: '„Nächsten Monat wollen wir dort selbst einen Stand mieten.“',
        },
      ],
    },
    listening: {
      title: 'Hören · Radio-Wetter & Verabredung',
      durationMinutes: 7,
      maxPlaysStrict: 2,
      contextNote: 'Sie hören eine Sprachnachricht von Ihrem Freund Jonas über das Wochenende.',
      audioScript:
        'Hey! Am Samstag wollten wir ja eigentlich wandern gehen, aber der Wetterbericht sagt starken Regen für den ganzen Vormittag voraus. Wie wäre es, wenn wir stattdessen um vierzehn Uhr in die neue Fotoausstellung gehen? Danach können wir in der Pizzeria neben dem Bahnhof etwas essen. Sag mir bis Freitagabend Bescheid!',
      hearingFocusTrap: 'Notice the shift from original plan (wandern) to alternative (Fotoausstellung um 14:00) due to Regen.',
      questions: [
        {
          id: 'de-a2-l1',
          prompt: 'Warum möchte Jonas am Samstag nicht wandern gehen?',
          options: [
            'Er muss arbeiten.',
            'Er hat sich das Bein verletzt.',
            'Es soll am Vormittag stark regnen.',
            'Die Züge fahren nicht.',
          ],
          correctIndex: 2,
          explanation: '„Der Wetterbericht sagt starken Regen für den ganzen Vormittag voraus.“',
        },
        {
          id: 'de-a2-l2',
          prompt: 'Welchen neuen Vorschlag macht Jonas?',
          options: [
            'Um 14 Uhr in eine Fotoausstellung gehen',
            'Um 10 Uhr ins Schwimmbad gehen',
            'Zuhause kochen',
            'Am Sonntag wandern',
          ],
          correctIndex: 0,
          explanation: 'Er schlägt die neue Fotoausstellung um vierzehn Uhr vor.',
        },
        {
          id: 'de-a2-l3',
          prompt: 'Wo möchte er danach essen?',
          options: [
            'Im Museumscafé',
            'In der Pizzeria neben dem Bahnhof',
            'Bei ihm zu Hause',
            'In einem asiatischen Restaurant',
          ],
          correctIndex: 1,
          explanation: '„Danach können wir in der Pizzeria neben dem Bahnhof etwas essen.“',
        },
      ],
    },
    writing: {
      title: 'Schreiben · Einladung beantworten (40–60 Wörter)',
      durationMinutes: 8,
      scenario: 'Ihr Kollege Herr Bergmann hat Sie zu seiner Abschiedsfeier am Freitag eingeladen. Schreiben Sie ihm eine höfliche E-Mail.',
      taskRequirements: [
        'Bedanken Sie sich für die Einladung und sagen Sie zu.',
        'Fragen Sie, ob Sie etwas zu essen oder zu trinken mitbringen sollen.',
        'Erklären Sie, dass Sie wegen eines Arzttermins 30 Minuten später kommen.',
      ],
      minWords: 40,
      maxWords: 90,
      keyRubricKeywords: ['Einladung', 'komme', 'mitbringen', 'später', 'weil', 'Arzttermin'],
      modelAnswer:
        'Sehr geehrter Herr Bergmann,\nvielen Dank für die freundliche Einladung zu Ihrer Abschiedsfeier! Ich komme sehr gerne. Soll ich vielleicht einen Salat oder Getränke mitbringen? Leider komme ich etwa dreißig Minuten später, weil ich am Freitagnachmittag noch einen wichtigen Arzttermin habe.\nViele Grüße\nAlex',
    },
    speaking: {
      title: 'Sprechen · Über Ihren Alltag berichten',
      durationMinutes: 6,
      prepSeconds: 45,
      speakSeconds: 90,
      cueCardTitle: 'Mein typisches Wochenende',
      bulletPoints: [
        'Wann stehen Sie am Wochenende auf?',
        'Was machen Sie mit Freunden oder Familie?',
        'Was haben Sie letztes Wochenende gemacht? (Perfekt!)',
      ],
      followUpQuestion: 'Bleiben Sie am Wochenende lieber in der Stadt oder fahren Sie in die Natur?',
      keyRubricKeywords: ['stehe', 'auf', 'Freunde', 'bin', 'habe', 'gefahren'],
      modelResponseScript:
        'Am Wochenende stehe ich meistens erst gegen neun Uhr auf, weil ich unter der Woche früh arbeiten muss. Samstags kaufe ich auf dem Markt ein und treffe nachmittags Freunde im Park. Letztes Wochenende bin ich mit dem Zug an den See gefahren und habe dort lange gelesen.',
    },
  },
  {
    id: 'exam-de-b1',
    languageId: 'german',
    level: 'B1',
    title: 'Goethe-Zertifikat B1 Modular Simulation',
    alignedCertificate: 'Goethe-Zertifikat B1 / telc Deutsch B1',
    passingScorePercent: 60,
    totalMinutes: 35,
    reading: {
      title: 'Lesen · Presseartikel & Lesermeinung',
      durationMinutes: 8,
      passageTitle: 'Reparieren statt Wegwerfen: Repair-Cafés boomen',
      passage:
        'In vielen deutschen Städten öffnen einmal im Monat sogenannte Repair-Cafés. Dort helfen ehrenamtliche Technikerinnen und Bastler dabei, defekte Kaffeemaschinen, Fahrräder oder Laptops kostenlos zu reparieren. Ziel der Initiative ist es nicht nur, Elektroschrott zu vermeiden, sondern auch Nachbarn miteinander ins Gespräch zu bringen. Obwohl die Reparatur selbst nichts kostet, freuen sich die Organisatoren über eine kleine Spende für Kaffee, Kuchen und neue Werkzeuge. Ersatzteile müssen die Besucher allerdings selbst bezahlen.',
      questions: [
        {
          id: 'de-b1-r1',
          prompt: 'Was müssen Besucher in einem Repair-Café unbedingt selbst bezahlen?',
          options: [
            'Die Arbeitszeit der Techniker',
            'Benötigte Ersatzteile',
            'Den Eintritt ins Café',
            'Die Miete für die Werkzeuge',
          ],
          correctIndex: 1,
          explanation: '„Ersatzteile müssen die Besucher allerdings selbst bezahlen.“',
        },
        {
          id: 'de-b1-r2',
          prompt: 'Welches doppelte Ziel verfolgen Repair-Cafés laut dem Text?',
          options: [
            'Neue Geräte verkaufen und Geld verdienen',
            'Müll reduzieren und sozialen Kontakt in der Nachbarschaft fördern',
            'Techniker ausbilden und Geschäfte ersetzen',
            'Alte Geräte sammeln und exportieren',
          ],
          correctIndex: 1,
          explanation: 'Sie wollen „Elektroschrott vermeiden“ und „Nachbarn miteinander ins Gespräch bringen“.',
        },
        {
          id: 'de-b1-r3',
          prompt: 'Wie häufig finden die Treffen in vielen Städten statt?',
          options: ['Täglich', 'Einmal pro Woche', 'Einmal im Monat', 'Nur im Winter'],
          correctIndex: 2,
          explanation: '„öffnen einmal im Monat sogenannte Repair-Cafés.“',
        },
      ],
    },
    listening: {
      title: 'Hören · Radio-Diskussion (Homeoffice vs. Büro)',
      durationMinutes: 8,
      maxPlaysStrict: 2,
      contextNote: 'Sie hören einen Ausschnitt aus einer Radiosendung zum Thema mobiles Arbeiten.',
      audioScript:
        'Moderator: Herr Becker, seit zwei Jahren arbeitet Ihre Firma hybrid. Was hat sich am stärksten verändert? Herr Becker: Zuerst hatten wir Angst, dass die Qualität sinkt. Das Gegenteil ist passiert: Weil die Mitarbeiter zweimal pro Woche zu Hause ungestört arbeiten können, werden komplexe Projekte schneller fertig. Schwierig bleibt jedoch die Einarbeitung neuer Kollegen — dafür brauchen wir unbedingt gemeinsame Tage im Büro.',
      hearingFocusTrap: 'Distinguish initial fear (Qualität sinkt) from actual result (Gegenteil) and remaining challenge (Einarbeitung neuer Kollegen).',
      questions: [
        {
          id: 'de-b1-l1',
          prompt: 'Wie war das tatsächliche Ergebnis der hybriden Arbeit in Herrn Beckers Firma?',
          options: [
            'Die Qualität ist stark gesunken.',
            'Komplexe Projekte werden schneller abgeschlossen.',
            'Die Mitarbeiter wollen wieder jeden Tag ins Büro.',
            'Die Firma hat das Modell gestoppt.',
          ],
          correctIndex: 1,
          explanation: 'Er sagt: „Das Gegenteil ist passiert ... komplexe Projekte werden schneller fertig.“',
        },
        {
          id: 'de-b1-l2',
          prompt: 'Wie oft pro Woche arbeiten die Mitarbeiter im Homeoffice?',
          options: ['Einmal', 'Zweimal', 'Viermal', 'Fünfmal'],
          correctIndex: 1,
          explanation: '„zweimal pro Woche zu Hause ungestört arbeiten“.',
        },
        {
          id: 'de-b1-l3',
          prompt: 'Wofür hält Herr Becker Präsenz im Büro weiterhin für unverzichtbar?',
          options: [
            'Für die Einarbeitung neuer Kollegen',
            'Für die Kontrolle der Arbeitszeiten',
            'Für das Mittagessen',
            'Für technische Reparaturen',
          ],
          correctIndex: 0,
          explanation: '„Schwierig bleibt jedoch die Einarbeitung neuer Kollegen — dafür brauchen wir unbedingt gemeinsame Tage im Büro.“',
        },
      ],
    },
    writing: {
      title: 'Schreiben · Teil 2 Forumsbeitrag (80–120 Wörter)',
      durationMinutes: 11,
      scenario: 'In einem Online-Forum diskutieren Nutzer über das Thema: „Brauchen wir im Alltag noch Bargeld oder sollte alles digital bezahlt werden?“',
      taskRequirements: [
        'Äußern Sie klar Ihre persönliche Meinung.',
        'Nennen Sie mindestens einen Vorteil und einen Nachteil der digitalen Zahlung.',
        'Nutzen Sie mindestens zwei Nebensatz-Konnektoren (z. B. weil, obwohl, während, deshalb).',
      ],
      minWords: 80,
      maxWords: 150,
      keyRubricKeywords: ['Meinung', 'Vorteil', 'Nachteil', 'Bargeld', 'weil', 'obwohl'],
      modelAnswer:
        'Meiner Meinung nach sollten wir Bargeld nicht komplett abschaffen, obwohl das Bezahlen mit Karte oder Smartphone im Alltag sehr bequem ist. Ein großer Vorteil digitaler Zahlungen besteht darin, dass man an der Kasse Zeit spart und kein schweres Kleingeld mitnehmen muss. Allerdings sehe ich auch Nachteile, weil bei technischen Störungen plötzlich niemand mehr einkaufen könnte und ältere Menschen oft lieber bar bezahlen. Deshalb halte ich eine Kombination aus beiden Möglichkeiten für die beste Lösung.',
    },
    speaking: {
      title: 'Sprechen · Teil 2 Kurzpräsentation',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 120,
      cueCardTitle: 'Thema: Fremdsprachen mit Apps oder im Sprachkurs lernen?',
      bulletPoints: [
        'Ihre persönliche Erfahrung mit dem Sprachenlernen',
        'Situation in Ihrem Heimatland',
        'Vor- und Nachteile von Sprach-Apps im Vergleich zu Kursen',
        'Ihr persönliches Fazit',
      ],
      followUpQuestion: 'Welche Rolle spielt regelmäßiges Sprechen mit Muttersprachlern für Ihren Lernerfolg?',
      keyRubricKeywords: ['Erfahrung', 'Vorteil', 'Nachteil', 'obwohl', 'Meinung', 'Fazit'],
      modelResponseScript:
        'Heute möchte ich über das Thema Sprachenlernen mit Apps oder im Kurs sprechen. Meiner Erfahrung nach sind Apps ideal, um täglich Vokabeln zu üben, weil man flexibel in der Bahn lernen kann. Der Nachteil ist jedoch, dass man selten spontan spricht. Im Kurs bekommt man direktes Feedback von der Lehrkraft. Mein Fazit ist: Die Kombination aus täglichen App-Übungen und echten Gesprächen funktioniert am besten.',
    },
  },
  {
    id: 'exam-de-b2',
    languageId: 'german',
    level: 'B2',
    title: 'Goethe-Zertifikat B2 / TestDaF Simulation',
    alignedCertificate: 'Goethe-Zertifikat B2 / telc B2 / TestDaF',
    passingScorePercent: 60,
    totalMinutes: 40,
    reading: {
      title: 'Lesen · Wirtschaft & Gesellschaft (Detail & Haltung)',
      durationMinutes: 10,
      passageTitle: 'Stadt der kurzen Wege: Illusion oder realistische Reform?',
      passage:
        'Das Konzept der „15-Minuten-Stadt“ verspricht, dass Einkaufsmöglichkeiten, Ärzte, Schulen und Parks von jeder Wohnung aus zu Fuß oder mit dem Rad erreichbar sein sollen. Befürworter verweisen auf geringere Emissionen und lebendigere Quartiere. Stadtplaner mahnen allerdings zur Nüchternheit: Während sich das Modell in historisch gewachsenen Innenstädten vergleichsweise gut umsetzen lässt, stoßen weitläufige Vororte und ländliche Regionen schnell an wirtschaftliche Grenzen, da dort schlicht die Bevölkerungsdichte für rentable Nahversorgung fehlt.',
      questions: [
        {
          id: 'de-b2-r1',
          prompt: 'Worauf führen Stadtplaner die Schwierigkeit in Vororten und ländlichen Gebieten zurück?',
          options: [
            'Auf den Widerstand der Anwohner gegen Radwege',
            'Auf eine zu geringe Bevölkerungsdichte für wirtschaftliche Nahversorgung',
            'Auf zu strenge Umweltschutzgesetze',
            'Auf den Mangel an historischen Gebäuden',
          ],
          correctIndex: 1,
          explanation: '„da dort schlicht die Bevölkerungsdichte für rentable Nahversorgung fehlt.“',
        },
        {
          id: 'de-b2-r2',
          prompt: 'Wie ist die Grundhaltung der zitierten Stadtplaner gegenüber dem Konzept?',
          options: [
            'Völlig ablehnend in jedem Kontext',
            'Euphorisch ohne Einschränkungen',
            'Differenziert: im Kern sinnvoll, aber räumlich nicht universell übertragbar',
            'Desinteressiert an Emissionsfragen',
          ],
          correctIndex: 2,
          explanation: 'Sie erkennen die Umsetzbarkeit in gewachsenen Innenstädten an, mahnen aber bei Vororten/Land zur Nüchternheit.',
        },
        {
          id: 'de-b2-r3',
          prompt: 'Welche Vorteile nennen Befürworter der 15-Minuten-Stadt?',
          options: [
            'Günstigere Mieten und mehr Autobahnen',
            'Weniger Emissionen und belebtere Stadtviertel',
            'Größere Einkaufszentren am Stadtrand',
            'Schnellere Flugverbindungen',
          ],
          correctIndex: 1,
          explanation: '„verweisen auf geringere Emissionen und lebendigere Quartiere.“',
        },
      ],
    },
    listening: {
      title: 'Hören · Experteninterview (Psychologie der Aufmerksamkeit)',
      durationMinutes: 9,
      maxPlaysStrict: 2,
      contextNote: 'Sie hören eine Medienpsychologin über Multitasking am Arbeitsplatz.',
      audioScript:
        'Viele Berufstätige sind stolz auf ihr Multitasking, doch neurologisch gesehen existiert echtes paralleles Denken bei anspruchsvollen Aufgaben gar nicht. Unser Gehirn springt lediglich rasend schnell zwischen Kontexten hin und her. Jeder dieser Wechsel kostet sogenannte Wechselkosten: Studien zeigen, dass man nach einer kurzen Chat-Unterbrechung im Schnitt mehrere Minuten benötigt, um wieder dieselbe gedankliche Tiefe zu erreichen. Wirksamer als reine Selbstdisziplin sind daher feste, im Team vereinbarte Fokuszeiten ohne Benachrichtigungen.',
      hearingFocusTrap: 'Notice the contrast between "reine Selbstdisziplin" (less effective) vs. "im Team vereinbarte Fokuszeiten" (recommended).',
      questions: [
        {
          id: 'de-b2-l1',
          prompt: 'Was passiert laut der Psychologin tatsächlich beim sogenannten Multitasking?',
          options: [
            'Das Gehirn verarbeitet zwei komplexe Aufgaben völlig parallel.',
            'Das Gehirn wechselt schnell zwischen Kontexten und verliert dabei Effizienz.',
            'Die gedankliche Tiefe steigt durch kurze Chat-Pausen.',
            'Nur junge Erwachsene können echtes Multitasking.',
          ],
          correctIndex: 1,
          explanation: 'Das Gehirn springt hin und her und zahlt dabei „Wechselkosten“.',
        },
        {
          id: 'de-b2-l2',
          prompt: 'Welche Maßnahme empfiehlt sie ausdrücklich als wirksamer als reine Selbstdisziplin?',
          options: [
            'Längere Arbeitszeiten am Abend',
            'Gemeinsam im Team festgelegte Fokuszeiten ohne Benachrichtigungen',
            'Vollständiges Verbot von Computern',
            'Stündliche Kaffeepausen',
          ],
          correctIndex: 1,
          explanation: '„Wirksamer als reine Selbstdisziplin sind daher feste, im Team vereinbarte Fokuszeiten ohne Benachrichtigungen.“',
        },
        {
          id: 'de-b2-l3',
          prompt: 'Was beschreibt der Begriff „Wechselkosten“ im Vortrag?',
          options: [
            'Finanzielle Kosten für neue Software',
            'Den Zeit- und Tiefenverlust beim Zurückkehren in eine Aufgabe nach einer Unterbrechung',
            'Gebühren für einen Jobwechsel',
            'Kosten für Büroumbauten',
          ],
          correctIndex: 1,
          explanation: 'Man benötigt nach einer kurzen Unterbrechung mehrere Minuten, um wieder dieselbe gedankliche Tiefe zu erreichen.',
        },
      ],
    },
    writing: {
      title: 'Schreiben · Teil 1 Argumentativer Forumsbeitrag (150+ Wörter)',
      durationMinutes: 13,
      scenario: 'Schreiben Sie einen strukturierten Beitrag für ein Gesellschaftsforum zum Thema: „Sollte ein verpflichtendes soziales Jahr nach der Schule eingeführt werden?“',
      taskRequirements: [
        'Beziehen Sie klar Stellung zum Thema.',
        'Führen Sie mindestens zwei stichhaltige Argumente für Ihre Position an.',
        'Gehen Sie auf ein Gegenargument ein und entkräften oder relativieren Sie es.',
        'Verwenden Sie gehobene Verknüpfungen (einerseits/andererseits, aufgrund, darüber hinaus, in Betracht ziehen).',
      ],
      minWords: 140,
      maxWords: 240,
      keyRubricKeywords: ['einerseits', 'andererseits', 'aufgrund', 'Gesellschaft', 'Alternative', 'meiner Ansicht nach'],
      modelAnswer:
        'Die Debatte über ein verpflichtendes soziales Jahr gewinnt aufgrund des zunehmenden Personalmangels im Pflege- und Bildungssektor erneut an Schärfe. Meiner Ansicht nach wäre ein verpflichtender Dienst jedoch der falsche Weg, obwohl das Anliegen grundsätzlich nachvollziehbar ist. Einerseits könnte ein solches Jahr junge Menschen tatsächlich für gesellschaftliche Verantwortung sensibilisieren und den Zusammenhalt stärken. Andererseits greift eine allgemeine Pflicht tief in die individuelle Lebensplanung ein und verzögert den Berufseinstieg, ohne die strukturellen Ursachen des Fachkräftemangels — etwa unattraktive Arbeitsbedingungen — zu lösen. Darüber hinaus lässt sich echtes Engagement kaum erzwingen. Statt Zwang sollten Politik und Arbeitgeber daher attraktivere Anreize für bestehende Freiwilligendienste schaffen, etwa durch höhere Vergütung und Vorteile bei der Studienplatzvergabe.',
    },
    speaking: {
      title: 'Sprechen · B2 Vortrag & Stellungnahme',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 150,
      cueCardTitle: 'Künstliche Intelligenz im Berufsalltag',
      bulletPoints: [
        'Welche Chancen bietet KI für Routineaufgaben und Produktivität?',
        'Welche Risiken sehen Sie für Arbeitsplätze und Datenschutz?',
        'Welche Regeln oder Weiterbildungen halten Sie für notwendig?',
      ],
      followUpQuestion: 'Glauben Sie, dass menschliche Kreativität und Empathie langfristig an Wert gewinnen?',
      keyRubricKeywords: ['Chancen', 'Risiken', 'einerseits', 'andererseits', 'Weiterbildung', 'Verantwortung'],
      modelResponseScript:
        'In meinem Kurzvortrag möchte ich die Chancen und Risiken von Künstlicher Intelligenz im Berufsalltag abwägen. Einerseits entlastet KI Teams enorm von repetitiver Datenauswertung und Routinekorrespondenz, wodurch mehr Raum für strategische Entscheidungen entsteht. Andererseits birgt ein unkritischer Einsatz erhebliche Risiken hinsichtlich Datenschutz, verzerrter Algorithmen und Qualifikationsverlusten. Deshalb halte ich kontinuierliche Weiterbildung und klare Transparenzregeln für unverzichtbar.',
    },
  },
  {
    id: 'exam-de-c1',
    languageId: 'german',
    level: 'C1',
    title: 'Goethe-Zertifikat C1 / telc C1 Hochschule Simulation',
    alignedCertificate: 'Goethe-Zertifikat C1 / telc C1 Hochschule',
    passingScorePercent: 60,
    totalMinutes: 45,
    reading: {
      title: 'Lesen · Wissenschaftlicher Kommentar (Nominalstil & Subtext)',
      durationMinutes: 12,
      passageTitle: 'Jenseits der Messbarkeit: Grenzen datengetriebener Hochschulsteuerung',
      passage:
        'Kaum eine hochschulpolitische Reform der letzten zwei Jahrzehnte hat den akademischen Alltag nachhaltiger geprägt als die zunehmende Orientierung an quantitativen Kennzahlen — von Drittmittelquoten über Publikationsindizes bis hin zu Regelstudienzeiten. Unbestritten ermöglicht diese Transparenz eine sachlichere Ressourcenallokation. Gleichwohl mehren sich warnende Stimmen aus der Wissenschaftsforschung: Werden Indikatoren vom bloßen Diagnoseinstrument zum alleinigen Steuerungsziel erhoben, setzen Fehlanreize ein. Langfristige, risikoreiche Grundlagenforschung gerät ins Hintertreffen zugunsten kleinteiliger, rasch publizierbarer Studien.',
      questions: [
        {
          id: 'de-c1-r1',
          prompt: 'Welches Kernproblem beschreibt der Text hinsichtlich quantitativer Kennzahlen?',
          options: [
            'Sie sind technisch nicht genau genug erfassbar.',
            'Wenn Messgrößen zum Selbstzweck werden, verdrängen schnelle Kleinpublikationen risikoreiche Grundlagenforschung.',
            'Sie führen automatisch zu geringeren Studierendenzahlen.',
            'Sie verhindern jede sachliche Verteilung von Forschungsgeldern.',
          ],
          correctIndex: 1,
          explanation: '„Werden Indikatoren ... zum alleinigen Steuerungsziel erhoben, setzen Fehlanreize ein. Langfristige, risikoreiche Grundlagenforschung gerät ins Hintertreffen.“',
        },
        {
          id: 'de-c1-r2',
          prompt: 'Welchen Nutzen räumt der Autor den Kennzahlen durchaus ein?',
          options: [
            'Sie garantieren bahnbrechende Entdeckungen.',
            'Sie ersetzen wissenschaftliche Peer-Reviews.',
            'Sie schaffen Transparenz für eine sachlichere Mittelverteilung.',
            'Sie verkürzen alle Forschungsprojekte um die Hälfte.',
          ],
          correctIndex: 2,
          explanation: '„Unbestritten ermöglicht diese Transparenz eine sachlichere Ressourcenallokation.“',
        },
        {
          id: 'de-c1-r3',
          prompt: 'Was bedeutet die Formulierung „gerät ins Hintertreffen“ im Kontext?',
          options: [
            'Wird massiv bevorzugt',
            'Wird benachteiligt und verliert an Bedeutung',
            'Wird international prämiert',
            'Wird aus dem Ausland finanziert',
          ],
          correctIndex: 1,
          explanation: '„Ins Hintertreffen geraten“ ist eine gehobene Wendung für „benachteiligt werden / zurückfallen“.',
        },
      ],
    },
    listening: {
      title: 'Hören · Fachpodium (Single-Play C1 Standard)',
      durationMinutes: 10,
      maxPlaysStrict: 1,
      contextNote: 'Strenger C1-Modus: Sie hören den Ausschnitt aus einem Fachpodium zur digitalen Souveränität nur EINMAL.',
      audioScript:
        'Moderatorin: Professor Lindner, inwiefern unterscheidet sich digitale Souveränität von bloßem Protektionismus? Prof. Lindner: Ein entscheidender Unterschied! Protektionismus schottet Märkte ab und erstickt Innovation. Digitale Souveränität hingegen bedeutet Wahlfreiheit — also die Fähigkeit von Staaten und Unternehmen, kritische Infrastrukturen über offene Standards zu betreiben, ohne von einem einzelnen Anbieter abhängig zu sein. Nur durch Interoperabilität lässt sich wirtschaftliche Resilienz mit internationaler Offenheit versöhnen.',
      hearingFocusTrap: 'Single play only! Distinguish Protektionismus (Abschottung) from Digitale Souveränität (Wahlfreiheit & Interoperabilität).',
      questions: [
        {
          id: 'de-c1-l1',
          prompt: 'Wie definiert Professor Lindner „digitale Souveränität“?',
          options: [
            'Als vollständige Abschottung nationaler Märkte',
            'Als Wahlfreiheit durch offene Standards ohne Abhängigkeit von einem einzelnen Anbieter',
            'Als Verbot internationaler Softwarekonzerne',
            'Als Verzicht auf Cloud-Technologien',
          ],
          correctIndex: 1,
          explanation: 'Er definiert sie ausdrücklich als „Wahlfreiheit ... über offene Standards ... ohne von einem einzelnen Anbieter abhängig zu sein“.',
        },
        {
          id: 'de-c1-l2',
          prompt: 'Welches Risiko schreibt er dem Protektionismus zu?',
          options: [
            'Er erstickt Innovation.',
            'Er fördert Interoperabilität.',
            'Er senkt die Energiekosten.',
            'Er beschleunigt internationale Standards.',
          ],
          correctIndex: 0,
          explanation: '„Protektionismus schottet Märkte ab und erstickt Innovation.“',
        },
        {
          id: 'de-c1-l3',
          prompt: 'Welcher Schlüsselbegriff verbindet laut Lindner Resilienz und Offenheit?',
          options: ['Subventionierung', 'Interoperabilität', 'Zentralisierung', 'Regulierungspause'],
          correctIndex: 1,
          explanation: '„Nur durch Interoperabilität lässt sich wirtschaftliche Resilienz mit internationaler Offenheit versöhnen.“',
        },
      ],
    },
    writing: {
      title: 'Schreiben · C1 Akademische Stellungnahme (200+ Wörter)',
      durationMinutes: 15,
      scenario: 'Verfassen Sie eine differenzierte Stellungnahme zum Thema: „Sollten Städte den privaten Autoverkehr im Zentrum zugunsten des ÖPNV stark einschränken?“',
      taskRequirements: [
        'Entwickeln Sie eine klare These und wägen Sie ökologische, soziale und wirtschaftliche Dimensionen ab.',
        'Integrieren Sie Nominalstil-Elemente (z. B. angesichts, aufgrund, die Umgestaltung) und Konzessivsätze (wenngleich, ungeachtet).',
        'Schließen Sie mit einem realistischen, umsetzbaren Politikvorschlag.',
      ],
      minWords: 190,
      maxWords: 320,
      keyRubricKeywords: ['angesichts', 'wenngleich', 'Mobilität', 'Infrastruktur', 'einerseits', 'andererseits'],
      modelAnswer:
        'Angesichts steigender urbaner Luftbelastung und knapper werdender öffentlicher Flächen rückt die Neugestaltung städtischer Mobilität zunehmend in den Fokus kommunaler Politik. Eine schrittweise Einschränkung des privaten Individualverkehrs im Zentrum erscheint dabei grundsätzlich geboten, wenngleich sie ohne flankierende Maßnahmen soziale Verwerfungen auslösen könnte.\n\nEinerseits sprechen gewichtige ökologische und gesundheitliche Argumente für verkehrsberuhigte Innenstädte: Die Reduktion von Lärm- und Feinstaubemissionen steigert die Lebensqualität erheblich und wertet den öffentlichen Raum für Fußgänger wie den lokalen Einzelhandel auf. Andererseits darf nicht verkannt werden, dass Pendler aus peripheren Regionen sowie Handwerksbetriebe und mobilitätseingeschränkte Personen bislang mangels verlässlicher Alternativen auf das Auto angewiesen sind.\n\nUngeachtet dieser Zielkonflikte lässt sich der Wandel sozialverträglich gestalten, sofern der Ausbau taktverdichteter ÖPNV-Verbindungen sowie erschwinglicher Park-and-Ride-Anlagen der Verkehrsbeschränkung zeitlich vorausgeht. Erst wenn umweltfreundliche Mobilität komfortabler und kalkulierbarer wird als das eigene Fahrzeug, stößt die Verkehrswende auf breite gesellschaftliche Akzeptanz.',
    },
    speaking: {
      title: 'Sprechen · C1 Analytischer Kurzvortrag',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 180,
      cueCardTitle: 'Lebenslanges Lernen im Zeitalter raschen technologischen Wandels',
      bulletPoints: [
        'Warum reicht eine einmalige Berufsausbildung heute selten aus?',
        'Wie sollte Verantwortung zwischen Staat, Unternehmen und Einzelnen verteilt werden?',
        'Wie lässt sich Weiterbildung motivierend statt belastend gestalten?',
      ],
      followUpQuestion: 'Inwiefern droht eine neue Bildungsungleichheit, wenn Weiterbildung überwiegend privat finanziert wird?',
      keyRubricKeywords: ['angesichts', 'Verantwortung', 'Weiterbildung', 'allerdings', 'Voraussetzung', 'Fazit'],
      modelResponseScript:
        'Angesichts der rasanten Halbwertszeit technischen Fachwissens verliert das klassische Modell einer einmaligen Erstausbildung spürbar an Tragfähigkeit. Gleichwohl darf lebenslanges Lernen nicht als rein individuelle Bringschuld abgewälzt werden. Erforderlich ist vielmehr eine geteilte Verantwortung: Unternehmen müssen bezahlte Lernzeiten fest im Arbeitsalltag verankern, während staatliche Bildungsbudgets sicherstellen, dass auch Beschäftigte kleiner Betriebe Zugang zu zertifizierten Qualifikationen erhalten.',
    },
  },
  {
    id: 'exam-de-c2',
    languageId: 'german',
    level: 'C2',
    title: 'Goethe-Zertifikat C2 (GDS) Mastery Simulation',
    alignedCertificate: 'Goethe-Zertifikat C2: Großes Deutsches Sprachdiplom',
    passingScorePercent: 60,
    totalMinutes: 45,
    reading: {
      title: 'Lesen · Feuilleton & Semantische Nuance',
      durationMinutes: 12,
      passageTitle: 'Die Ökonomie der Empörung',
      passage:
        'Wer die Dynamik digitaler Öffentlichkeiten allein als technisches Verbreitungsproblem begreift, greift zu kurz. Algorithmen erfinden menschliche Affekte nicht — sie veredeln lediglich deren Verwertbarkeit. Indem Plattformen moralische Entrüstung systematisch höher gewichten als abwägende Zwischentöne, verschiebt sich unmerklich der Maßstab dessen, was als gesellschaftlich relevant gilt. Das eigentlich Beunruhigende liegt mithin weniger in der Lautstärke einzelner Debatten als in der schleichenden Ermüdung jener leisen Urteilskraft, auf die demokratische Kompromissfähigkeit elementar angewiesen ist.',
      questions: [
        {
          id: 'de-c2-r1',
          prompt: 'Worin sieht der Essay die eigentlich gravierende Gefahr digitaler Empörungsdynamiken?',
          options: [
            'In der Erfindung völlig neuer menschlicher Emotionen durch Software',
            'In der schleichenden Aushöhlung abwägender Urteilskraft als Grundlage demokratischer Kompromisse',
            'In zu geringen Werbeeinnahmen klassischer Medien',
            'In der technischen Überlastung von Serverinfrastrukturen',
          ],
          correctIndex: 1,
          explanation: '„Das eigentlich Beunruhigende liegt ... in der schleichenden Ermüdung jener leisen Urteilskraft, auf die demokratische Kompromissfähigkeit elementar angewiesen ist.“',
        },
        {
          id: 'de-c2-r2',
          prompt: 'Wie charakterisiert der Text die Rolle der Algorithmen?',
          options: [
            'Sie erschaffen Affekte aus dem Nichts.',
            'Sie verstärken und monetarisieren bereits vorhandene Affekte auf Kosten von Zwischentönen.',
            'Sie fördern systematisch sachliche Kompromisse.',
            'Sie haben keinen Einfluss auf Themenrelevanz.',
          ],
          correctIndex: 1,
          explanation: '„Algorithmen erfinden menschliche Affekte nicht — sie veredeln lediglich deren Verwertbarkeit.“',
        },
        {
          id: 'de-c2-r3',
          prompt: 'Welcher Konnektor entspricht dem gehobenen „mithin“ am genauesten?',
          options: ['Trotzdem', 'Folglich / Demzufolge', 'Obgleich', 'Hingegen'],
          correctIndex: 1,
          explanation: '„Mithin“ ist ein gehobener konsekutiver Ausdruck mit der Bedeutung „folglich / demnach“.',
        },
      ],
    },
    listening: {
      title: 'Hören · Kulturelle Debatte (Single-Play C2)',
      durationMinutes: 10,
      maxPlaysStrict: 1,
      contextNote: 'Strenger C2-Modus: Einmaliges Hören eines kulturphilosophischen Interviews.',
      audioScript:
        'Interviewer: Verliert das gedruckte Buch im Zeitalter permanenter Verfügbarkeit seinen kulturellen Rang? Autorin: Im Gegenteil — gerade seine Begrenztheit wird wieder zum Luxus. Ein Buch blinkt nicht, es schickt keine Push-Meldung und zwingt mich nicht zur sofortigen Stellungnahme. Diese widerständige Langsamkeit erlaubt erst jene produktive Fremdheit, in der man einen Gedanken nicht bloß konsumiert, sondern tatsächlich an ihm reift.',
      hearingFocusTrap: 'Catch the paradoxical phrasing: "Begrenztheit wird zum Luxus" and "widerständige Langsamkeit".',
      questions: [
        {
          id: 'de-c2-l1',
          prompt: 'Worin liegt laut der Autorin der zeitgenössische Wert des gedruckten Buches?',
          options: [
            'In seiner extrem schnellen Informationsvermittlung',
            'In seiner reizarmen Begrenztheit, die vertieftes Denken jenseits sofortiger Reaktion ermöglicht',
            'In seinem niedrigen Herstellungspreis',
            'In der Möglichkeit, Texte sofort online zu kommentieren',
          ],
          correctIndex: 1,
          explanation: 'Gerade Begrenztheit und „widerständige Langsamkeit“ ermöglichen produktive Vertiefung.',
        },
        {
          id: 'de-c2-l2',
          prompt: 'Was meint sie mit „produktive Fremdheit“?',
          options: [
            'Das Lesen ausschließlich in Fremdsprachen',
            'Die anspruchsvolle Auseinandersetzung mit Gedanken, die nicht bloß oberflächlich konsumiert werden',
            'Das Gefühl der Isolation beim Lesen',
            'Die Ablehnung moderner Literatur',
          ],
          correctIndex: 1,
          explanation: 'Man konsumiert einen Gedanken nicht bloß, sondern reift in der Auseinandersetzung an ihm.',
        },
        {
          id: 'de-c2-l3',
          prompt: 'Wie beantwortet sie die Eingangsfrage des Interviewers?',
          options: [
            'Sie stimmt ihr resigniert zu.',
            'Sie widerspricht ihr pointiert („Im Gegenteil“).',
            'Sie weicht der Frage aus.',
            'Sie hält digitale Medien für überlegen.',
          ],
          correctIndex: 1,
          explanation: 'Sie eröffnet mit einem klaren, pointierten „Im Gegenteil“.',
        },
      ],
    },
    writing: {
      title: 'Schreiben · C2 Kritischer Essay (240+ Wörter)',
      durationMinutes: 15,
      scenario: 'Verfassen Sie einen stilistisch anspruchsvollen Essay zum Leitgedanken: „Effizienz ist ein hervorragender Diener, aber ein gefährlicher Herr.“',
      taskRequirements: [
        'Beleuchten Sie das Spannungsfeld von Effizienz und menschlicher Qualität (z. B. Bildung, Kultur oder Medizin).',
        'Nutzen Sie gehobene Idiomatik, stilistische Variation und präzise Argumentationsführung.',
        'Formulieren Sie eine originelle, stringente Synthese.',
      ],
      minWords: 220,
      maxWords: 380,
      keyRubricKeywords: ['gleichwohl', 'Effizienz', 'Maßstab', 'Verwertbarkeit', 'Spannungsfeld', 'letztlich'],
      modelAnswer:
        'Kaum ein Leitbegriff der Moderne genießt eine ähnlich ungebrochene Autorität wie der der Effizienz. Wo Ressourcen knapp sind — sei es im Energieverbrauch, in der Logistik oder in der Verwaltung — ist der sparsame Umgang mit Mitteln nicht nur ökonomisch vernünftig, sondern ethisch geboten. Gleichwohl verkehrt sich diese Tugend ins Gegenteil, sobald Effizienz vom technischen Hilfsmittel zum alleinigen Sinnmaßstab menschlichen Handelns aufrückt.\n\nBesonders augenfällig wird dieses Spannungsfeld in Bereichen, deren eigentlicher Kern sich einer reinen Zeit-Nutzen-Rechnung entzieht: in der Pflege, in der Bildung und in der kulturellen Kreativität. Ein Gespräch am Krankenbett oder das zweckfreie Ringen um eine philosophische Fragestellung lässt sich kaum „beschleunigen“, ohne seinen wesentlichen Gehalt zu zerstören. Wer jede scheinbar unproduktive Pause tilgt, gewinnt zwar kurzfristig Tempo, untergräbt jedoch langfristig genau jene Urteilskraft und Empathie, auf denen Innovationsfähigkeit und sozialer Zusammenhalt beruhen.\n\nLetztlich gilt es daher, Effizienz wieder in ihre dienende Rolle zurückzuweisen: Sie sollte uns Zeit freischaufeln für das Wesentliche — nicht definieren, was als wesentlich gelten darf.',
    },
    speaking: {
      title: 'Sprechen · C2 Rhetorische Rede & Entgegnung',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 180,
      cueCardTitle: 'Ist Mehrsprachigkeit in Zeiten perfekter KI-Übersetzer noch ein unverzichtbares Kulturgut?',
      bulletPoints: [
        'Unterschied zwischen funktionaler Übersetzung und kulturellem Sprachdenken',
        'Kognitive und empathische Dimensionen des eigenständigen Fremdsprachenerwerbs',
        'Souveräne Entgegnung auf den Einwand „Technik spart doch hunderte Lernstunden“',
      ],
      followUpQuestion: 'Verändert sich Ihre eigene Persönlichkeit oder Denkweise, wenn Sie zwischen Deutsch und Englisch wechseln?',
      keyRubricKeywords: ['gleichwohl', 'Sprachdenken', 'kulturell', 'Übersetzung', 'Nuance', 'letztlich'],
      modelResponseScript:
        'Auf den ersten Blick mag der Einwand bestechend wirken: Wenn Echtzeit-Übersetzer mühelos Geschäftsverträge und Reiseinformationen übertragen, wozu noch Jahre in den Erwerb fremder Sprachen investieren? Gleichwohl verwechselt diese Sichtweise bloßen Informationstransfer mit echter Verständigung. Jede Sprache verkörpert eine eigene Architektur der Wahrnehmung — von deutschen Modalpartikeln bis hin zu britischem Understatement. Wer eine Sprache selbst durchdringt, erwirbt weit mehr als Vokabeln: nämlich kulturelle Empathie und geistige Beweglichkeit, die kein Algorithmus stellvertretend erleben kann.',
    },
  },

  // ================================== ENGLISH SIMULATED EXAMS (A1–C2) ==================================
  {
    id: 'exam-en-a1',
    languageId: 'english',
    level: 'A1',
    title: 'Cambridge A1 / Pre-Key Survival Simulation',
    alignedCertificate: 'Cambridge English A1 Foundation / Pre-A2 Key',
    passingScorePercent: 60,
    totalMinutes: 25,
    reading: {
      title: 'Reading · Notices & Short Message',
      durationMinutes: 6,
      passageTitle: 'Green Park Café & Note from Maya',
      passage:
        'Hi Ben! I am waiting for you at Green Park Café near the station. The café is open until 6:00 PM today. I already ordered two coffees and a cheese sandwich. Remember: they only take card payments, not cash! See you in ten minutes. Maya.',
      questions: [
        {
          id: 'en-a1-r1',
          prompt: 'Where is Maya waiting for Ben?',
          options: ['Inside the train station', 'At Green Park Café', 'At home', 'In a supermarket'],
          correctIndex: 1,
          explanation: 'Maya writes: "I am waiting for you at Green Park Café near the station."',
        },
        {
          id: 'en-a1-r2',
          prompt: 'How can customers pay at the café?',
          options: ['Cash only', 'Card payments only', 'Both cash and coins', 'Free for students'],
          correctIndex: 1,
          explanation: '"They only take card payments, not cash!"',
        },
        {
          id: 'en-a1-r3',
          prompt: 'What time does the café close today?',
          options: ['10:00 AM', '5:00 PM', '6:00 PM', '8:00 PM'],
          correctIndex: 2,
          explanation: '"The café is open until 6:00 PM today."',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Store Announcement',
      durationMinutes: 6,
      maxPlaysStrict: 2,
      contextNote: 'Listen to a short bookstore announcement in London.',
      audioScript:
        'Good afternoon shoppers! Our travel book section on the second floor has a twenty percent discount today until five thirty. Please note that the coffee bar on the ground floor closes at five o’clock. Thank you for visiting River Books!',
      hearingFocusTrap: 'Distinguish 5:30 (book discount ends) vs. 5:00 (coffee bar closes) and second floor vs. ground floor.',
      questions: [
        {
          id: 'en-a1-l1',
          prompt: 'Which floor is the travel book section on?',
          options: ['Ground floor', 'First floor', 'Second floor', 'Third floor'],
          correctIndex: 2,
          explanation: '"Our travel book section on the second floor..."',
        },
        {
          id: 'en-a1-l2',
          prompt: 'How big is today’s discount on travel books?',
          options: ['10 percent', '20 percent', '30 percent', '50 percent'],
          correctIndex: 1,
          explanation: '"has a twenty percent discount today."',
        },
        {
          id: 'en-a1-l3',
          prompt: 'When does the coffee bar close?',
          options: ['At 5:00', 'At 5:30', 'At 6:00', 'At 4:30'],
          correctIndex: 0,
          explanation: '"the coffee bar on the ground floor closes at five o’clock."',
        },
      ],
    },
    writing: {
      title: 'Writing · Short Email to a Friend (30–50 Words)',
      durationMinutes: 7,
      scenario: 'Write a short email to your friend Emma about your new English class.',
      taskRequirements: [
        'Tell her which days your class is on.',
        'Say what you like about the teacher or classmates.',
        'Invite her to meet for coffee after class.',
      ],
      minWords: 30,
      maxWords: 70,
      keyRubricKeywords: ['class', 'English', 'Monday', 'teacher', 'coffee', 'meet'],
      modelAnswer:
        'Hi Emma,\nI started a new English class this week! My lessons are on Monday and Wednesday evenings. Our teacher is very friendly and my classmates come from many countries. Would you like to meet for coffee after class next Monday?\nBest,\nAlex',
    },
    speaking: {
      title: 'Speaking · Personal Profile & Daily Routine',
      durationMinutes: 6,
      prepSeconds: 30,
      speakSeconds: 60,
      cueCardTitle: 'About Me & My Day',
      bulletPoints: [
        'Your name, city, and job or studies',
        'What time you wake up and what you eat for breakfast',
        'One activity you enjoy in the evening',
      ],
      followUpQuestion: 'What is your favorite place in your hometown?',
      keyRubricKeywords: ['live', 'work', 'wake up', 'breakfast', 'evening', 'like'],
      modelResponseScript:
        'Hello, my name is Alex and I live in Munich. I work as a software developer. Every morning I wake up at seven o’clock and drink black coffee with toast. In the evening, I like cooking dinner and listening to English podcasts.',
    },
  },
  {
    id: 'exam-en-a2',
    languageId: 'english',
    level: 'A2',
    title: 'Cambridge A2 Key (KET) Simulation',
    alignedCertificate: 'Cambridge English A2 Key (KET)',
    passingScorePercent: 60,
    totalMinutes: 28,
    reading: {
      title: 'Reading · Lifestyle Feature Article',
      durationMinutes: 7,
      passageTitle: 'How Daniel Built a Neighborhood Tool Library',
      passage:
        'Three years ago, Daniel needed an electric drill for ten minutes to put up a bookshelf. Instead of buying an expensive tool that would sit in a cupboard all year, he asked his neighbors if anyone had one to lend. That simple conversation gave him an idea. Today, his community Tool Library has over four hundred tools—from ladders to sewing machines. Members pay just twenty pounds a year and can borrow up to three items every week.',
      questions: [
        {
          id: 'en-a2-r1',
          prompt: 'Why did Daniel decide not to buy an electric drill?',
          options: [
            'The hardware shop was closed.',
            'He only needed it briefly and it was expensive.',
            'He did not know how to use a drill.',
            'His cupboard was completely full.',
          ],
          correctIndex: 1,
          explanation: 'He needed it for ten minutes and didn’t want to buy an expensive tool that would sit unused.',
        },
        {
          id: 'en-a2-r2',
          prompt: 'How much does annual membership cost?',
          options: ['£10', '£20', '£30', '£400'],
          correctIndex: 1,
          explanation: '"Members pay just twenty pounds a year."',
        },
        {
          id: 'en-a2-r3',
          prompt: 'How many tools can a member borrow per week?',
          options: ['One', 'Two', 'Up to three', 'Unlimited'],
          correctIndex: 2,
          explanation: '"can borrow up to three items every week."',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Self-Correction Voicemail',
      durationMinutes: 7,
      maxPlaysStrict: 2,
      contextNote: 'Listen to Sam leaving a voicemail about a weekend cooking class.',
      audioScript:
        'Hi! Just calling about our Italian cooking class on Sunday. The website originally said it started at two o’clock, but the chef emailed to move it to two thirty. Everything is included in the twenty-five pound fee—ingredients and aprons—so you only need to bring a container to take home your extra pasta!',
      hearingFocusTrap: 'Catch the time correction (2:00 -> 2:30) and what you actually need to bring (container, NOT apron).',
      questions: [
        {
          id: 'en-a2-l1',
          prompt: 'What is the NEW start time of the cooking class?',
          options: ['2:00 PM', '2:30 PM', '3:00 PM', '1:30 PM'],
          correctIndex: 1,
          explanation: 'The chef moved it from 2:00 to 2:30 ("two thirty").',
        },
        {
          id: 'en-a2-l2',
          prompt: 'What should the listener bring to the class?',
          options: ['An apron', 'Fresh ingredients', 'A food container', 'Extra cash for pasta'],
          correctIndex: 2,
          explanation: 'Ingredients and aprons are included; you only need to bring a container for leftover pasta.',
        },
        {
          id: 'en-a2-l3',
          prompt: 'How much does the class cost?',
          options: ['£15', '£20', '£25', '£35'],
          correctIndex: 2,
          explanation: '"the twenty-five pound fee".',
        },
      ],
    },
    writing: {
      title: 'Writing · A2 Key Email + Narrative (45–75 Words)',
      durationMinutes: 8,
      scenario: 'Your English penfriend Liam wants to visit your city next month. Write him an email.',
      taskRequirements: [
        'Suggest the best place to visit in your city and say why.',
        'Tell him what kind of weather to expect.',
        'Offer to meet him at the airport or train station.',
      ],
      minWords: 45,
      maxWords: 95,
      keyRubricKeywords: ['visit', 'weather', 'station', 'airport', 'recommend', 'because'],
      modelAnswer:
        'Hi Liam,\nI am so excited that you are visiting next month! You should definitely visit the Old Town because the architecture and street cafés are amazing. The weather is usually cool and rainy in autumn, so bring a warm jacket. Send me your arrival time and I will happily meet you at the train station!\nBest,\nAlex',
    },
    speaking: {
      title: 'Speaking · Comparing Everyday Activities',
      durationMinutes: 6,
      prepSeconds: 45,
      speakSeconds: 90,
      cueCardTitle: 'Travel by Train vs. Car',
      bulletPoints: [
        'How do you usually travel for holidays?',
        'What do you like or dislike about train travel?',
        'Describe a fun trip you took last year (Past Simple).',
      ],
      followUpQuestion: 'Would you rather visit a big capital city or a quiet mountain village?',
      keyRubricKeywords: ['travel', 'train', 'because', 'last year', 'went', 'prefer'],
      modelResponseScript:
        'I usually prefer travelling by train because I can read a book, drink coffee, and watch the countryside without worrying about traffic. Last year I went to Edinburgh by train with two friends. We walked up Arthur’s Seat, ate fish and chips, and had a fantastic weekend.',
    },
  },
  {
    id: 'exam-en-b1',
    languageId: 'english',
    level: 'B1',
    title: 'Cambridge B1 Preliminary (PET) Simulation',
    alignedCertificate: 'Cambridge B1 Preliminary (PET) / IELTS 5.0',
    passingScorePercent: 60,
    totalMinutes: 34,
    reading: {
      title: 'Reading · Magazine Feature & Inference',
      durationMinutes: 8,
      passageTitle: 'Why Silent Book Clubs Are Spreading Worldwide',
      passage:
        'Traditional book clubs often make busy adults feel guilty: if you fail to finish the chosen novel on time, you dread showing up to the meeting. Silent Book Clubs flip that formula on its head. Members gather at a local café or library, spend twenty minutes chatting about whatever book they happen to be reading, and then read silently together for a full hour. There is no assigned reading list and no pressure to produce brilliant literary commentary—just shared quiet focus in a distracted world.',
      questions: [
        {
          id: 'en-b1-r1',
          prompt: 'Why do some people avoid traditional book clubs according to the article?',
          options: [
            'The cafés are too noisy.',
            'They feel stressed if they do not finish the assigned book on time.',
            'Membership fees are too high.',
            'They prefer audiobooks over paper books.',
          ],
          correctIndex: 1,
          explanation: '"if you fail to finish the chosen novel on time, you dread showing up to the meeting."',
        },
        {
          id: 'en-b1-r2',
          prompt: 'What happens during the main hour of a Silent Book Club meetup?',
          options: [
            'Members debate one assigned classic novel.',
            'Everyone reads their own chosen book quietly together.',
            'An author reads a chapter aloud.',
            'Members exchange phones for books.',
          ],
          correctIndex: 1,
          explanation: 'Members read whatever book they brought silently together for a full hour.',
        },
        {
          id: 'en-b1-r3',
          prompt: 'What does "flip that formula on its head" mean here?',
          options: [
            'Completely reverse the usual approach',
            'Cancel the club permanently',
            'Read books upside down',
            'Make the rules much stricter',
          ],
          correctIndex: 0,
          explanation: 'Idiomatic phrasing meaning to invert or radically redesign the conventional model.',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Podcast Interview (Connected Speech)',
      durationMinutes: 8,
      maxPlaysStrict: 2,
      contextNote: 'Listen to a short podcast clip about urban cycling infrastructure.',
      audioScript:
        'Host: So when Copenhagen started expanding its protected bike lanes, did drivers push back at first? Guest: Oh, absolutely—local merchants worried customers wouldn’t turn up if street parking disappeared. Yet within two years, foot and cycle traffic rose so sharply that neighborhood bakery and café revenues actually went up. People stop far more spontaneously when they’re on a bike than when they’re hunting for a parking spot.',
      hearingFocusTrap: 'Hear phrasal verbs ("push back", "turn up", "went up") and contrast initial merchant fear vs. 2-year reality.',
      questions: [
        {
          id: 'en-b1-l1',
          prompt: 'What were local shopkeepers initially worried about?',
          options: [
            'Cyclists riding too slowly',
            'Losing customers because of fewer street parking spaces',
            'Higher electricity bills',
            'Noise from bicycle bells',
          ],
          correctIndex: 1,
          explanation: '"local merchants worried customers wouldn’t turn up if street parking disappeared."',
        },
        {
          id: 'en-b1-l2',
          prompt: 'What actually happened to café and bakery revenues within two years?',
          options: ['They dropped slightly.', 'They stayed unchanged.', 'They increased.', 'Most cafés closed.'],
          correctIndex: 2,
          explanation: '"revenues actually went up."',
        },
        {
          id: 'en-b1-l3',
          prompt: 'Why does the guest say cyclists spend more at neighborhood shops?',
          options: [
            'Bicycles are cheaper than cars.',
            'Cyclists can stop spontaneously without searching for parking.',
            'Shops give cyclists a 50% discount.',
            'Drivers do not like coffee.',
          ],
          correctIndex: 1,
          explanation: '"People stop far more spontaneously when they’re on a bike than when they’re hunting for a parking spot."',
        },
      ],
    },
    writing: {
      title: 'Writing · B1 Preliminary Article (100–130 Words)',
      durationMinutes: 10,
      scenario: 'An international student magazine asks readers to write an article titled: "Learning a Language Outside the Classroom."',
      taskRequirements: [
        'Describe two practical ways to learn a language outside formal lessons.',
        'Explain which method worked best for you and why.',
        'Include at least two phrasal verbs or linking words (although, however, because, figure out).',
      ],
      minWords: 95,
      maxWords: 160,
      keyRubricKeywords: ['podcasts', 'practice', 'however', 'although', 'because', 'speaking'],
      modelAnswer:
        'Although grammar textbooks give you a useful starting map, real fluency usually begins outside the classroom. Two of the most effective habits I have discovered are listening to daily podcasts during my commute and shadowing short video clips aloud. At first, native speakers sounded far too fast; however, once I started listening to topics I genuinely enjoyed—like cooking and travel—my comprehension jumped dramatically. For me, speaking for ten minutes a day with language partners worked best because it forced me to figure out how to express real ideas under pressure. If you make the language part of your hobbies, studying stops feeling like homework.',
    },
    speaking: {
      title: 'Speaking · B1 Topic Talk & Decision',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 120,
      cueCardTitle: 'Working from Home vs. Working in an Office',
      bulletPoints: [
        'Main advantages of working remotely',
        'Challenges people face when they rarely see colleagues in person',
        'Which setup you would choose and why',
      ],
      followUpQuestion: 'Do you think most jobs will stay hybrid over the next ten years?',
      keyRubricKeywords: ['remote', 'commute', 'however', 'colleagues', 'prefer', 'because'],
      modelResponseScript:
        'Working from home saves a huge amount of commuting time and makes it easier to focus on deep tasks without office noise. However, staying completely remote can feel isolating, especially when you need quick feedback from colleagues. Personally, I would choose a hybrid schedule—three days at home and two days in the office—because it combines quiet productivity with genuine team connection.',
    },
  },
  {
    id: 'exam-en-b2',
    languageId: 'english',
    level: 'B2',
    title: 'Cambridge B2 First (FCE) / IELTS 6.5 Simulation',
    alignedCertificate: 'Cambridge B2 First (FCE) / IELTS Band 6.5',
    passingScorePercent: 60,
    totalMinutes: 40,
    reading: {
      title: 'Reading · IELTS Academic Passage (Inference & T/F/NG)',
      durationMinutes: 10,
      passageTitle: 'The Paradox of Urban Tree Canopies',
      passage:
        'Expanding urban tree cover is widely celebrated as one of the most cost-effective defenses against extreme summer heatwaves, lowering neighborhood surface temperatures by up to four degrees Celsius. Yet urban ecologists emphasize that planting millions of saplings carelessly can backfire. In arid regions, selecting water-hungry non-native species strains municipal aquifers, while planting monocultures leaves entire avenues vulnerable to a single pest outbreak. Resilient greening therefore hinges not on raw tree counts, but on biodiverse, drought-adapted native species paired with soil volume large enough for mature roots.',
      questions: [
        {
          id: 'en-b2-r1',
          prompt: 'According to the passage, why can planting a single tree species across a city backfire?',
          options: [
            'It provides less shade than mixed species.',
            'It leaves whole streets exposed to a single pest outbreak.',
            'It raises summer surface temperatures by four degrees.',
            'It prevents residents from walking on sidewalks.',
          ],
          correctIndex: 1,
          explanation: '"planting monocultures leaves entire avenues vulnerable to a single pest outbreak."',
        },
        {
          id: 'en-b2-r2',
          prompt: 'TRUE, FALSE, or NOT GIVEN: "The passage states that urban tree planting is more expensive than air-conditioning subsidies."',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctIndex: 2,
          explanation: 'Air-conditioning subsidies are never mentioned anywhere in the text -> NOT GIVEN (classic IELTS trap!).',
        },
        {
          id: 'en-b2-r3',
          prompt: 'What determines resilient urban greening according to ecologists?',
          options: [
            'Maximizing the total raw number of saplings planted each year',
            'Biodiverse, drought-adapted native species with adequate soil volume',
            'Importing fast-growing tropical trees into arid cities',
            'Replacing all paved roads with parks',
          ],
          correctIndex: 1,
          explanation: 'The closing sentence directly states resilient greening hinges on biodiverse, drought-adapted native species and sufficient soil volume.',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Academic Seminar (IELTS Part 3)',
      durationMinutes: 9,
      maxPlaysStrict: 2,
      contextNote: 'Listen to two university students comparing study strategies before finals.',
      audioScript:
        'Maya: I used to spend hours highlighting textbook chapters in neon yellow, thinking I was absorbing everything. Leo: Same here—until I bombed a mock exam and realized passive rereading creates an illusion of competence. Switching to active recall flashcards and explaining concepts aloud to an empty room cut my revision time almost in half. Maya: That’s exactly what I’m trying this semester, though spacing reviews over weeks instead of cramming is the hardest habit to stick to.',
      hearingFocusTrap: 'Track the distinction between "illusion of competence" (highlighting) and Maya’s toughest obstacle (spacing over weeks).',
      questions: [
        {
          id: 'en-b2-l1',
          prompt: 'What mistake did both Maya and Leo make previously?',
          options: [
            'Skipping lectures completely',
            'Relying on passive highlighting and rereading',
            'Studying exclusively with flashcards',
            'Revising too early in the semester',
          ],
          correctIndex: 1,
          explanation: 'Maya highlighted chapters and Leo agrees passive rereading created an "illusion of competence".',
        },
        {
          id: 'en-b2-l2',
          prompt: 'How did active recall affect Leo’s preparation?',
          options: [
            'It doubled his study hours.',
            'It nearly halved his revision time.',
            'It caused him to fail his mock exam.',
            'It only worked for math.',
          ],
          correctIndex: 1,
          explanation: '"cut my revision time almost in half."',
        },
        {
          id: 'en-b2-l3',
          prompt: 'What does Maya find most challenging now?',
          options: [
            'Making flashcards cleanly',
            'Finding a quiet room',
            'Consistently spacing her reviews over weeks instead of cramming',
            'Explaining topics aloud',
          ],
          correctIndex: 2,
          explanation: '"spacing reviews over weeks instead of cramming is the hardest habit to stick to."',
        },
      ],
    },
    writing: {
      title: 'Writing · IELTS Task 2 / FCE Opinion Essay (160–240 Words)',
      durationMinutes: 13,
      scenario: 'Some educators argue that students should learn practical financial and digital literacy at school instead of spending years studying a foreign language. To what extent do you agree or disagree?',
      taskRequirements: [
        'Present a clear thesis statement in your introduction.',
        'Develop two well-supported body paragraphs addressing both sides.',
        'Use natural B2 collocations and cohesive discourse markers (however, furthermore, nevertheless, on the other hand).',
      ],
      minWords: 150,
      maxWords: 260,
      keyRubricKeywords: ['however', 'furthermore', 'education', 'language', 'skills', 'conclusion'],
      modelAnswer:
        'As modern economies become increasingly digitized, many argue that schools should replace mandatory foreign language classes with financial and digital literacy. While equipping teenagers with practical life skills is undeniably vital, treating these subjects as mutually exclusive is a false dichotomy.\n\nOn the one hand, understanding compound interest, budgeting, and digital privacy protects young adults from costly real-world mistakes. Schools have historically overlooked these competencies, leaving graduates underprepared for adult independence. However, eliminating language education would strip students of far more than vocabulary lists. Learning another tongue strengthens cognitive flexibility, deepens cultural empathy, and opens international career opportunities that translation software cannot replicate.\n\nFurthermore, technology already allows schools to integrate financial projects into mathematics and digital ethics into civics without sacrificing humanities. In conclusion, rather than pitting practical literacy against linguistic mastery, modern curricula should balance both so graduates are financially resilient and globally connected.',
    },
    speaking: {
      title: 'Speaking · IELTS Part 2 Cue Card + Part 3 Follow-Up',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 120,
      cueCardTitle: 'Describe a Challenging Goal You Achieved',
      bulletPoints: [
        'What the goal was and why it mattered to you',
        'The biggest obstacle you encountered along the way',
        'How you overcame it and what you learned about yourself',
      ],
      followUpQuestion: 'Why do you think many people abandon ambitious long-term goals after the first month?',
      keyRubricKeywords: ['challenge', 'however', 'consistent', 'eventually', 'learned', 'rewarding'],
      modelResponseScript:
        'A challenging goal I achieved was reaching conversational fluency in German while working full time. Initially, I underestimated how intimidating case endings and fast native speech would be, and after two months I hit a frustrating plateau. However, instead of giving up, I redesigned my routine around twenty minutes of daily shadowing and weekly speaking sessions. Eventually, conversations stopped feeling like math puzzles, and the experience taught me that small daily systems outperform occasional bursts of motivation.',
    },
  },
  {
    id: 'exam-en-c1',
    languageId: 'english',
    level: 'C1',
    title: 'Cambridge C1 Advanced (CAE) / IELTS 8.0 Simulation',
    alignedCertificate: 'Cambridge C1 Advanced (CAE) / IELTS 7.5–8.0 / TOEFL 105',
    passingScorePercent: 60,
    totalMinutes: 45,
    reading: {
      title: 'Reading · Academic Policy Critique (C1 Inference)',
      durationMinutes: 12,
      passageTitle: 'The Metrics Trap in Preventive Healthcare',
      passage:
        'Wearable biosensors promise to shift medicine from reactive treatment to continuous prevention, empowering individuals to track heart-rate variability, sleep architecture, and blood glucose in real time. Yet clinicians caution that ubiquitous self-tracking is a double-edged sword. For patients managing chronic conditions, timely trend alerts can genuinely avert hospitalizations. Conversely, among otherwise healthy users, hyper-vigilant monitoring of noisy physiological fluctuations frequently breeds unnecessary anxiety and drives low-value clinical visits—diverting scarce diagnostic capacity away from underserved populations who lack basic primary care altogether.',
      questions: [
        {
          id: 'en-c1-r1',
          prompt: 'Why do clinicians describe wearable biosensors as a "double-edged sword"?',
          options: [
            'They are accurate for sleep tracking but fail for heart rate.',
            'They benefit chronic-care patients yet can trigger anxiety and misallocate healthcare capacity among healthy users.',
            'They are too expensive for hospitals to purchase.',
            'They replace primary care physicians entirely.',
          ],
          correctIndex: 1,
          explanation: 'The text contrasts genuine preventive gains for chronic patients against anxiety and resource diversion caused by healthy hyper-vigilant users.',
        },
        {
          id: 'en-c1-r2',
          prompt: 'What systemic equity concern is raised at the end of the passage?',
          options: [
            'Sensor manufacturers hoard clinical data.',
            'Low-value visits by worried healthy users consume capacity needed by underserved communities.',
            'Clinicians refuse to inspect wearable metrics.',
            'Hospitals lack Wi-Fi infrastructure.',
          ],
          correctIndex: 1,
          explanation: '"diverting scarce diagnostic capacity away from underserved populations who lack basic primary care altogether."',
        },
        {
          id: 'en-c1-r3',
          prompt: 'Which word best matches "noisy physiological fluctuations" in context?',
          options: [
            'Loud heartbeats',
            'Normal, clinically insignificant statistical variations',
            'Defective battery alarms',
            'Dangerous arrhythmias',
          ],
          correctIndex: 1,
          explanation: 'In data/clinical usage, "noisy fluctuations" refers to harmless background variance rather than meaningful pathology.',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Single-Play University Lecture (TOEFL/CAE)',
      durationMinutes: 10,
      maxPlaysStrict: 1,
      contextNote: 'Strict C1 Mode: You hear this behavioral economics lecture excerpt ONLY ONCE.',
      audioScript:
        'One of the most counterintuitive findings in behavioral economics is the paradox of choice. Classical rational-actor models assumed that expanding options could only improve welfare—after all, you can simply ignore alternatives you dislike. Yet field experiments repeatedly reveal that when shoppers face twenty-four varieties of jam instead of six, conversion rates actually plummet. Evaluating excessive options imposes cognitive overload and amplifies anticipated regret: even after choosing, consumers nag themselves wondering whether one of the rejected options might have been marginally superior.',
      hearingFocusTrap: 'Single play only! Connect "classical assumption" vs. "jam field experiment" -> "cognitive overload + anticipated regret".',
      questions: [
        {
          id: 'en-c1-l1',
          prompt: 'What assumption of classical economics is challenged by the jam experiment?',
          options: [
            'That consumers care about price',
            'That adding more options invariably increases consumer welfare and buying',
            'That supermarkets prefer small displays',
            'That shoppers dislike fruit jam',
          ],
          correctIndex: 1,
          explanation: 'Classical models assumed expanding options only improves welfare, whereas 24 varieties caused conversion rates to plummet.',
        },
        {
          id: 'en-c1-l2',
          prompt: 'What two psychological mechanisms explain the drop in purchases?',
          options: [
            'Brand loyalty and price anchoring',
            'Cognitive overload and anticipated regret',
            'Social pressure and scarcity',
            'Impulse buying and fatigue',
          ],
          correctIndex: 1,
          explanation: 'The lecturer explicitly names "cognitive overload" and "anticipated regret".',
        },
        {
          id: 'en-c1-l3',
          prompt: 'How does excessive choice affect consumers AFTER they make a purchase?',
          options: [
            'They feel completely relieved.',
            'They worry a rejected alternative might have been slightly better.',
            'They immediately return the product.',
            'They forget what they bought.',
          ],
          correctIndex: 1,
          explanation: '"consumers nag themselves wondering whether one of the rejected options might have been marginally superior."',
        },
      ],
    },
    writing: {
      title: 'Writing · CAE / IELTS Band 8 Analytical Essay (220+ Words)',
      durationMinutes: 15,
      scenario: 'Write an analytical essay evaluating the statement: "Algorithmic recommendation systems expand cultural horizons far less than they reinforce existing tastes."',
      taskRequirements: [
        'Incorporate at least one stylistic inversion (e.g., Rarely have..., Not only do...) and nuanced hedging (albeit, notwithstanding, to a certain extent).',
        'Weigh both discovery benefits and filter-bubble risks with concrete examples.',
        'Conclude with a measured synthesis.',
      ],
      minWords: 200,
      maxWords: 320,
      keyRubricKeywords: ['albeit', 'however', 'nevertheless', 'algorithmic', 'discovery', 'consequently'],
      modelAnswer:
        'Rarely have cultural gatekeepers wielded as subtle an influence as modern algorithmic recommendation engines. Designed to maximize sustained engagement across music, film, and journalism, these systems undeniably democratize access to niche creators who would previously have struggled for distribution. Nevertheless, their commercial architecture tends to privilege frictionless familiarity over genuine intellectual surprise.\n\nTo a certain extent, collaborative filtering does foster serendipitous discovery, connecting listeners with independent artists across continents. However, because retention metrics penalize user drop-off, algorithms overwhelmingly extrapolate from past clicks—serving incrementally safer variations of established preferences. Consequently, audiences risk mistaking an abundance of tailored content for genuine breadth of perspective, albeit within an invisible echo chamber.\n\nNotwithstanding these structural incentives, the remedy lies neither in abandoning digital curation nor in romanticizing legacy media monopolies. Introducing deliberate "diversity dials" alongside human editorial curation could preserve convenient discovery while restoring the creative friction necessary for cultural growth.',
    },
    speaking: {
      title: 'Speaking · C1 Abstract Persuasion & Rebuttal',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 180,
      cueCardTitle: 'Should Cities Invest More in Cultural Landmarks or Everyday Public Spaces?',
      bulletPoints: [
        'Compare the symbolic/economic draw of iconic landmarks against neighborhood parks & libraries',
        'Explain how investment choices shape social cohesion',
        'Address the counterargument that flagship monuments fund local budgets through tourism',
      ],
      followUpQuestion: 'To what extent does architectural design influence how citizens interact across generations?',
      keyRubricKeywords: ['whereas', 'having said that', 'cohesion', 'ultimately', 'albeit', 'investment'],
      modelResponseScript:
        'Flagship cultural landmarks undeniably place a city on the global map and attract tourism revenue. Having said that, civic vitality is forged primarily in everyday third places—accessible libraries, shaded neighborhood parks, and community sports halls—where residents cross paths regardless of income. Whereas monumental architecture impresses visitors for an afternoon, modest, well-maintained public spaces quietly sustain social cohesion every single day. Ultimately, municipal budgets should prioritize everyday livability first, treating iconic venues as a complement rather than a substitute.',
    },
  },
  {
    id: 'exam-en-c2',
    languageId: 'english',
    level: 'C2',
    title: 'Cambridge C2 Proficiency (CPE) / IELTS 9.0 Simulation',
    alignedCertificate: 'Cambridge C2 Proficiency (CPE) / IELTS Band 8.5–9.0',
    passingScorePercent: 60,
    totalMinutes: 45,
    reading: {
      title: 'Reading · Literary & Philosophical Prose (C2 Nuance)',
      durationMinutes: 12,
      passageTitle: 'The Tyranny of Frictionless Mastery',
      passage:
        'Contemporary software design treats cognitive friction as an engineering defect to be engineered out of existence. Yet in the domain of human expertise, effortless interfaces harbor a quiet irony: the very struggle that learners instinctively seek to bypass is the biological signal that consolidates durable neural pathways. When an application reduces a rich intellectual discipline to gamified streaks and frictionless taps, it delivers the comforting sensation of progress while subtly insulating the user from the disorienting ambiguity through which authentic fluency is forged.',
      questions: [
        {
          id: 'en-c2-r1',
          prompt: 'What paradox does the author identify in gamified, frictionless learning apps?',
          options: [
            'They are too visually complex for beginners.',
            'By removing productive difficulty, they simulate progress while preventing the cognitive struggle required for real mastery.',
            'They discourage daily study habits.',
            'They rely too heavily on printed textbooks.',
          ],
          correctIndex: 1,
          explanation: 'They deliver "the comforting sensation of progress while subtly insulating the user from the disorienting ambiguity" needed for genuine mastery.',
        },
        {
          id: 'en-c2-r2',
          prompt: 'In the sentence "the very struggle ... is the biological signal", what rhetorical function does "very" serve?',
          options: [
            'It intensifies an adjective meaning "extremely".',
            'It acts as an emphatic determiner highlighting exact identity ("the precise struggle itself").',
            'It expresses uncertainty.',
            'It softens the author’s claim.',
          ],
          correctIndex: 1,
          explanation: '"The very [noun]" is a C2 emphatic structure pinpointing exact identity.',
        },
        {
          id: 'en-c2-r3',
          prompt: 'Which tone best characterizes the passage?',
          options: [
            'Playfully sarcastic',
            'Measured, incisive, and philosophically critical',
            'Angrily polemical',
            'Purely technical and neutral',
          ],
          correctIndex: 1,
          explanation: 'The prose is restrained yet incisive ("quiet irony", "subtly insulating"), characteristic of C2 editorial criticism.',
        },
      ],
    },
    listening: {
      title: 'Listening & Hearing · Pragmatic Irony & Understatement (Single-Play)',
      durationMinutes: 10,
      maxPlaysStrict: 1,
      contextNote: 'Strict C2 Mode: Single play. Listen carefully for British understatement and unspoken critique.',
      audioScript:
        'Host: Professor Vance, you served on the national curriculum review panel. Were you satisfied with the final compromise? Vance: Let us just say the document is a monument to committee prose—scrupulously polite, wonderfully symmetrical, and almost entirely unburdened by actionable specificity. If one’s goal was to offend nobody at the conference table, it was a roaring success; if one hoped to help an overworked teacher on a rainy Tuesday morning, well, one might wait a little longer.',
      hearingFocusTrap: 'Decode ironic praise ("monument to committee prose", "unburdened by actionable specificity", "roaring success").',
      questions: [
        {
          id: 'en-c2-l1',
          prompt: 'What does Professor Vance actually think of the final curriculum document?',
          options: [
            'It is brilliantly structured and immediately helpful to teachers.',
            'It is overly vague and politically cautious, offering little practical help to classroom teachers.',
            'It was far too controversial and offended committee members.',
            'It focused excessively on Tuesday lesson plans.',
          ],
          correctIndex: 1,
          explanation: '"Unburdened by actionable specificity" is classic C2 ironic understatement for "completely vague".',
        },
        {
          id: 'en-c2-l2',
          prompt: 'What does "roaring success" refer to in Vance’s remark?',
          options: [
            'Improving national literacy rates',
            'Avoiding diplomatic friction inside the committee rather than solving real classroom needs',
            'Winning praise from parents',
            'Finishing ahead of schedule',
          ],
          correctIndex: 1,
          explanation: 'Vance ironically defines its "success" solely as offending nobody at the conference table.',
        },
        {
          id: 'en-c2-l3',
          prompt: 'What is implied by "one might wait a little longer"?',
          options: [
            'A helpful update arrives next week.',
            'Teachers should not expect practical reform from this document anytime soon.',
            'Teachers prefer longer meetings.',
            'The panel will reconvene tomorrow.',
          ],
          correctIndex: 1,
          explanation: 'Dry British litotes implying real change is nowhere in sight.',
        },
      ],
    },
    writing: {
      title: 'Writing · CPE Evaluative Synthesis Essay (240+ Words)',
      durationMinutes: 15,
      scenario: 'Write a C2 evaluative essay addressing the prompt: "Does the relentless pursuit of convenience enrich human agency, or quietly diminish the capacities that make us resilient?"',
      taskRequirements: [
        'Demonstrate effortless command of register, syntactic rhythm, and inverted conditionals (Were societies to..., Had we...).',
        'Synthesize both legitimate gains of modern convenience and subtle cognitive/cultural losses.',
        'Avoid clichés; close with a memorable, incisive formulation.',
      ],
      minWords: 220,
      maxWords: 380,
      keyRubricKeywords: ['ostensibly', 'nevertheless', 'friction', 'agency', 'resilience', 'ultimately'],
      modelAnswer:
        'Ostensibly, the history of technological progress is a chronicle of liberation from drudgery. Eliminating arduous manual chores—from hand-washing linen to navigating unfamiliar cities without maps—has unquestionably widened human agency, freeing millions to pursue creative, intellectual, and civic endeavors. Nevertheless, convenience ceases to be benign the moment it begins to outsource not merely physical labor, but the formative disciplines of attention, memory, and judgment.\n\nWere societies to automate every minor cognitive inconvenience, they might discover too late that competence is rarely separable from effort. Just as muscles atrophy without load, intellectual resilience depends on periodic encounters with ambiguity—wrestling with an untranslated text, negotiating a face-to-face disagreement, or enduring the slow incubation of a difficult idea. By smoothing away every trace of resistance, frictionless ecosystems risk trading deep capability for passive dependency.\n\nUltimately, the test of any convenience should not be how much effort it spares us, but what higher form of engagement it enables. True agency lies not in escaping difficulty altogether, but in choosing which difficulties are worthy of our devotion.',
    },
    speaking: {
      title: 'Speaking · CPE Impromptu Philosophical Long Turn',
      durationMinutes: 8,
      prepSeconds: 60,
      speakSeconds: 180,
      cueCardTitle: 'Language as a Lens on Reality',
      bulletPoints: [
        'How acquiring a second or third language reshapes perception, humor, and nuance',
        'Whether a single global lingua franca threatens intellectual diversity',
        'How polyglots can bridge cultural divides in an increasingly polarized world',
      ],
      followUpQuestion: 'Is complete translation between two cultures ever truly possible, or is something vital always transformed in transit?',
      keyRubricKeywords: ['nuance', 'perspective', 'lingua franca', 'nevertheless', 'empathy', 'ultimately'],
      modelResponseScript:
        'While a shared global lingua franca undeniably accelerates scientific collaboration and commerce, treating language as a mere interchangeable code overlooks its deepest power. Stepping into German syntax or English diplomatic understatement gently rearranges how one frames causality, politeness, and humor. Something subtle is inevitably transformed in translation—not necessarily lost, but refracted through a different cultural prism. Ultimately, cultivating multilingual fluency preserves intellectual humility: it reminds us that our native vocabulary is only one map of human experience, never the territory itself.',
    },
  },
];

const EN_DE_MOCK_EXAMS: MockExam[] = RAW_MOCK_EXAMS.map((exam) => {
  const ext = MOCK_EXAM_EXTENSIONS[exam.id];
  if (!ext) return exam;

  const isGerman = exam.languageId === 'german';
  const task1Weight = Math.max(20, 100 - ext.extraWritingTask.weightPercent);

  return {
    ...exam,
    totalMinutes: ext.officialMinutes,
    requireAllSkillsPass: ext.requireAllSkillsPass,
    reading: {
      ...exam.reading,
      durationMinutes: Math.max(exam.reading.durationMinutes, Math.round(ext.officialMinutes * 0.3)),
      parts: [
        {
          id: `${exam.id}-read-p1`,
          partLabel: exam.reading.title,
          format: 'comprehension',
          instruction: isGerman
            ? 'Lesen Sie den Text sorgfältig und wählen Sie die beste Antwort für jede Frage.'
            : 'Read the passage carefully and choose the best answer for each question.',
          passageTitle: exam.reading.passageTitle,
          passage: exam.reading.passage,
          questions: exam.reading.questions,
        },
        ...ext.extraReadingParts,
      ],
    },
    listening: {
      ...exam.listening,
      durationMinutes: Math.max(exam.listening.durationMinutes, Math.round(ext.officialMinutes * 0.25)),
      audioScript: CONVERSATIONAL_LISTENING_SCRIPTS[`${exam.id}-listen-t1`] || exam.listening.audioScript,
      tracks: [
        {
          id: `${exam.id}-listen-t1`,
          partLabel: exam.listening.title,
          contextNote: exam.listening.contextNote,
          accentCode: ext.primaryAccentCode,
          maxPlaysStrict: exam.listening.maxPlaysStrict,
          preReadSeconds: 15,
          audioScript: CONVERSATIONAL_LISTENING_SCRIPTS[`${exam.id}-listen-t1`] || exam.listening.audioScript,
          hearingFocusTrap: exam.listening.hearingFocusTrap,
          questions: exam.listening.questions,
        },
        ...ext.extraListeningTracks.map((track) => ({
          ...track,
          audioScript: CONVERSATIONAL_LISTENING_SCRIPTS[track.id] || track.audioScript,
        })),
      ],
    },
    writing: {
      ...exam.writing,
      durationMinutes: Math.max(exam.writing.durationMinutes, Math.round(ext.officialMinutes * 0.28)),
      tasks: [
        {
          id: `${exam.id}-write-t1`,
          partLabel: exam.writing.title,
          scenario: exam.writing.scenario,
          taskRequirements: exam.writing.taskRequirements,
          minWords: exam.writing.minWords,
          maxWords: exam.writing.maxWords,
          weightPercent: task1Weight,
          keyRubricKeywords: exam.writing.keyRubricKeywords,
          modelAnswer: exam.writing.modelAnswer,
        },
        ext.extraWritingTask,
      ],
    },
    speaking: {
      ...exam.speaking,
      durationMinutes: Math.max(exam.speaking.durationMinutes, Math.round(ext.officialMinutes * 0.17)),
      parts: [
        ext.speakingPart1,
        {
          id: `${exam.id}-speak-p2`,
          partLabel: exam.speaking.title,
          instruction: exam.speaking.cueCardTitle,
          prepSeconds: exam.speaking.prepSeconds,
          speakSeconds: exam.speaking.speakSeconds,
          prompts: [
            ...exam.speaking.bulletPoints,
            `${isGerman ? 'Nachfrage' : 'Examiner Follow-Up'}: ${exam.speaking.followUpQuestion}`,
          ],
          examinerPromptAudio: isGerman
            ? `Kommen wir nun zu Teil 2. Ihr Thema lautet: ${exam.speaking.cueCardTitle}. Bereiten Sie sich kurz vor und präsentieren Sie Ihre Punkte.`
            : `Let us move to Part 2. Your topic is: ${exam.speaking.cueCardTitle}. Take a moment to prepare, then speak through your key points.`,
          keyRubricKeywords: exam.speaking.keyRubricKeywords,
          modelResponseScript: exam.speaking.modelResponseScript,
        },
        ext.speakingPart3,
      ],
    },
  };
});

export const MOCK_EXAMS: MockExam[] = [
  ...EN_DE_MOCK_EXAMS,
  ...FRENCH_MOCK_EXAMS,
  ...JAPANESE_MOCK_EXAMS,
];

export function getMockExams(languageId?: string, level?: CEFRLevel | 'ALL'): MockExam[] {
  return MOCK_EXAMS.filter((exam) => {
    const langMatch = !languageId || languageId === 'all' || languageId === 'meta' || exam.languageId === languageId;
    const levelMatch = !level || level === 'ALL' || exam.level === level;
    return langMatch && levelMatch;
  });
}

export function getMockExamById(id: string): MockExam | undefined {
  return MOCK_EXAMS.find((e) => e.id === id);
}
