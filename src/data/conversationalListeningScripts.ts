/**
 * Natural 2-Speaker Human Conversational Listening Scripts for ALL 36 Tracks across
 * all 12 Simulated Certification Exams (German A1–C2 + English A1–C2).
 *
 * Every track uses authentic back-and-forth human dialogue (`SpeakerA: ...\nSpeakerB: ...`)
 * with realistic greetings, spoken reactions, and self-corrections, while preserving 100%
 * factual fidelity with every existing comprehension question and answer key.
 */
export const CONVERSATIONAL_LISTENING_SCRIPTS: Record<string, string> = {
  // ================================ GERMAN A1 ================================
  'exam-de-a1-listen-t1': [
    'Lena: Entschuldigung! Sind die Erdbeeren da drüben wirklich heute im Angebot?',
    'Verkäufer: Hallo! Ja, genau — fünfhundert Gramm kosten heute nur zwei Euro fünfzig statt vier Euro.',
    'Lena: Oh, super, dann nehme ich gleich eine Schale! Ach, und wo finde ich denn Ihre Bäckerei?',
    'Verkäufer: Unsere Bäckerei ist direkt unten im Erdgeschoss, gleich neben dem Ausgang.',
    'Lena: Alles klar, danke! Hat die bis zwanzig Uhr auf?',
    'Verkäufer: Normalerweise schon, aber heute schließt sie ausnahmsweise schon um neunzehn Uhr. Beeilen Sie sich lieber ein bisschen!',
  ].join('\n'),

  'de-a1-listen-t2': [
    'Herr Gruber: Hotel Donau in Wien, Grüß Gott! Wie kann ich Ihnen helfen?',
    'Clara: Guten Tag! Hier ist Clara Weber. Ich habe ein Einzelzimmer für Freitag gebucht und wollte kurz nach dem Frühstück fragen.',
    'Herr Gruber: Sehr gern, Frau Weber! Das Frühstück gibt es jeden Morgen von sieben bis zehn Uhr oben im ersten Stock.',
    'Clara: Perfekt, im ersten Stock! Und bis wann kann ich am Freitagabend einchecken?',
    'Herr Gruber: Unsere Rezeption ist bis zweiundzwanzig Uhr besetzt. Bitte sagen Sie uns vorher noch kurz Bescheid, wann Sie am Freitag genau ankommen.',
    'Clara: Mache ich sehr gern, vielen Dank und bis Freitag!',
  ].join('\n'),

  'de-a1-listen-t3': [
    'Lukas: Entschuldigung, Grüezi! Fährt der Intercity nach Basel um dreizehn Uhr zehn gleich hier von Gleis sechs?',
    'Frau Meier: Grüezi! Gut, dass Sie fragen — schauen Sie mal auf die Anzeige: Der Intercity nach Basel hat heute leider fünfzehn Minuten Verspätung.',
    'Lukas: Ach herrje, fünfzehn Minuten! Bleibt es wenigstens bei Gleis sechs?',
    'Frau Meier: Nein, er fährt heute ausnahmsweise nicht von Gleis sechs, sondern von Gleis neun ab. Da vorne geht es direkt zur Unterführung.',
    'Lukas: Oh, vielen Dank für den Hinweis! Dann laufe ich gleich rüber zu Gleis neun.',
  ].join('\n'),

  // ================================ GERMAN A2 ================================
  'exam-de-a2-listen-t1': [
    'Jonas: Hey Mia, hast du kurz Zeit? Wegen unserer Wanderung am Samstag...',
    'Mia: Hi Jonas! Klar — sag bloß, das Wetter spielt nicht mit?',
    'Jonas: Genau, der Wetterbericht sagt leider starken Regen für den ganzen Vormittag voraus. Da macht Wandern echt keinen Spaß.',
    'Mia: Schade! Und was machen wir stattdessen?',
    'Jonas: Wie wäre es, wenn wir um vierzehn Uhr in die neue Fotoausstellung gehen? Und danach können wir in der Pizzeria neben dem Bahnhof etwas essen.',
    'Mia: Das klingt richtig gut! Ich checke kurz meinen Kalender und sage dir bis Freitagabend Bescheid.',
  ].join('\n'),

  'de-a2-listen-t2': [
    'Hannah: Lukas, fahren wir am Samstag eigentlich zusammen an den See?',
    'Lukas: Total gern! Aber warte mal — mit dem Bus um neun Uhr klappt es nicht, der fährt am Wochenende gar nicht.',
    'Hannah: Echt nicht? Wie kommen wir dann am besten hin?',
    'Lukas: Am besten nehmen wir den Zug um neun Uhr dreißig, der hält fast direkt am Ufer.',
    'Hannah: Super Idee! Ich bringe übrigens einen frischen Kuchen mit, weil ich gestern Abend gebacken habe.',
    'Lukas: Oh, genial! Dann besorge ich kalte Getränke für uns beide.',
  ].join('\n'),

  'de-a2-listen-t3': [
    'Herr Baumann: Grüezi Frau Keller, hier ist Martin Baumann von der Buchhandlung Rheinblick in Basel.',
    'Frau Keller: Grüezi Herr Baumann! Geht es um meine Bestellung von gestern?',
    'Herr Baumann: Ja, genau. Ihr bestelltes Wörterbuch ist leider im Moment nicht lieferbar — deshalb schicken wir heute zuerst nur die beiden Romane ab.',
    'Frau Keller: Ach so! Und wann kommt das Wörterbuch ungefähr?',
    'Herr Baumann: Es kommt voraussichtlich am Dienstag kostenlos nach. Falls Sie es aber lieber stornieren möchten, rufen Sie uns bitte einfach heute bis achtzehn Uhr an.',
    'Frau Keller: Alles klar, bis achtzehn Uhr — vielen Dank für den schnellen Anruf!',
  ].join('\n'),

  // ================================ GERMAN B1 ================================
  'exam-de-b1-listen-t1': [
    'Moderator: Herr Becker, Ihre Firma arbeitet jetzt seit zwei Jahren hybrid. Hand aufs Herz — was hat sich im Alltag am stärksten verändert?',
    'Herr Becker: Zuerst hatten wir ehrlich gesagt Angst, dass die Qualität sinkt. Aber genau das Gegenteil ist passiert!',
    'Moderator: Inwiefern? Arbeiten die Teams produktiver?',
    'Herr Becker: Ja, deutlich! Weil die Mitarbeiter zweimal pro Woche zu Hause ungestört arbeiten können, werden komplexe Projekte spürbar schneller fertig.',
    'Moderator: Gibt es denn gar keine Schattenseiten beim Homeoffice?',
    'Herr Becker: Doch, eine wichtige: Die Einarbeitung neuer Kollegen bleibt digital schwierig — dafür brauchen wir unbedingt gemeinsame Tage im Büro.',
  ].join('\n'),

  'de-b1-listen-t2': [
    'Moderator: Frau Berger, hier in Wien wird wieder heftig gestritten: Profitieren kleine Geschäfte eigentlich von autofreien Einkaufsstraßen?',
    'Frau Berger: Anfangs befürchteten tatsächlich viele Händler weniger Umsatz, mich eingeschlossen! Aber die Realität hat uns überrascht.',
    'Moderator: Was ist nach dem Umbau vor zwei Jahren genau passiert?',
    'Frau Berger: Sobald die Straße ruhiger war, kamen deutlich mehr Fußgänger und verweilten länger in Cafés und Läden — unsere Umsätze sind seitdem spürbar gestiegen.',
    'Moderator: Klingt durchweg positiv. Wo hakt es aus Ihrer Sicht noch?',
    'Frau Berger: Nur bei den Lieferzeiten für schwere Ware — da wünschen wir uns noch flexiblere Morgenfenster vor neun Uhr.',
  ].join('\n'),

  'de-b1-listen-t3': [
    'Frau Bühler: Grüezi und herzlich willkommen hier im Verkehrshaus Luzern! Haben alle ihre Kopfhörer dabei?',
    'Markus: Ja, alles bereit! Darf man drinnen in der Eisenbahnhalle eigentlich Fotos machen?',
    'Frau Bühler: Gute Frage! Fotografieren ohne Blitz ist überall gestattet — nur im neuen Planetarium bleiben Smartphones bitte komplett in der Tasche.',
    'Markus: Alles klar, kein Handy im Planetarium. Und wie lange dauert der Rundgang ungefähr?',
    'Frau Bühler: Die Führung dauert rund fünfundvierzig Minuten, danach treffen wir uns um zwölf Uhr fünfzehn wieder im Innenhof beim Café.',
    'Markus: Super, dann wissen wir Bescheid — legen wir los!',
  ].join('\n'),

  // ================================ GERMAN B2 ================================
  'exam-de-b2-listen-t1': [
    'Moderator: Frau Dr. Brandt, viele Berufstätige sind ja richtig stolz auf ihr Multitasking. Funktioniert das neurologisch überhaupt?',
    'Dr. Brandt: Leider überhaupt nicht! Bei anspruchsvollen Aufgaben existiert echtes paralleles Denken im Gehirn gar nicht — unser Kopf springt lediglich rasend schnell zwischen Kontexten hin und her.',
    'Moderator: Und was kostet uns dieses ständige Hin-und-Her-Springen?',
    'Dr. Brandt: Wir nennen das Wechselkosten. Studien zeigen, dass man schon nach einer kurzen Chat-Unterbrechung im Schnitt mehrere Minuten braucht, um wieder dieselbe gedankliche Tiefe zu erreichen.',
    'Moderator: Hilft da am Ende nur eiserne Selbstdisziplin?',
    'Dr. Brandt: Eben nicht! Deutlich wirksamer als reine Selbstdisziplin sind feste, gemeinsam im Team vereinbarte Fokuszeiten ganz ohne Benachrichtigungen.',
  ].join('\n'),

  'de-b2-listen-t2': [
    'Interviewer: Frau Professorin Novak, an der Universität Wien forschen Sie zu digitaler Bildung. Ersetzen KI-Lernassistenten bald klassische Nachhilfe?',
    'Prof. Novak: Nein, so pauschal lässt sich das keineswegs sagen — da muss man differenzieren.',
    'Interviewer: Wo liegen denn die echten Stärken der digitalen Werkzeuge?',
    'Prof. Novak: Zwar stehen digitale Erklärungen rund um die Uhr zur Verfügung und senken Hemmschwellen bei Rückfragen. Infolgedessen profitieren besonders selbstständige Lernende enorm.',
    'Interviewer: Und wo stoßen sie an ihre Grenzen?',
    'Prof. Novak: Wer jedoch grundlegende Motivationsprobleme hat, braucht nach wie vor menschliche Begleitung, die individuell ermutigt und dranbleibt.',
  ].join('\n'),

  'de-b2-listen-t3': [
    'Moderatorin: Herr Keller, das Schweizer Verkehrsamt hat gerade frische Zahlen zum Alpen-Transit vorgelegt. Wie entwickelt sich der Schienengüterverkehr?',
    'Herr Keller: Insgesamt erfreulich: Im Vergleich zum Vorjahr hat sich der Anteil des Schienengüterverkehrs immerhin um neun Prozent erhöht.',
    'Moderatorin: Klingt stark — aber auf regionalen Nebenstrecken hört man noch Kritik.',
    'Herr Keller: Zu Recht, denn auf einzelnen Nebenstrecken stagnieren die Zahlen noch. Experten führen das vor allem auf langwierige Baustellen zurück.',
    'Moderatorin: Wann dürften die Unternehmen dort eine spürbare Entlastung merken?',
    'Herr Keller: Sofern die neuen Tunnelabschnitte planmäßig öffnen, prognostiziert das Verkehrsamt ab zweitausendachtundzwanzig deutlich kürzere Fahrzeiten.',
  ].join('\n'),

  // ================================ GERMAN C1 ================================
  'exam-de-c1-listen-t1': [
    'Moderatorin: Professor Lindner, in der politischen Debatte wird „digitale Souveränität“ oft mit Protektionismus verwechselt. Wo ziehen Sie die Grenze?',
    'Prof. Lindner: Das ist ein entscheidender Unterschied! Protektionismus schottet Märkte ab und erstickt Innovation.',
    'Moderatorin: Und was genau verstehen Sie stattdessen unter digitaler Souveränität?',
    'Prof. Lindner: Sie bedeutet vor allem Wahlfreiheit — also die Fähigkeit von Staaten und Unternehmen, kritische Infrastrukturen über offene Standards zu betreiben, ohne von einem einzelnen Anbieter abhängig zu sein.',
    'Moderatorin: Lässt sich wirtschaftliche Resilienz denn überhaupt mit globaler Offenheit verbinden?',
    'Prof. Lindner: Ja, genau über einen Schlüsselbegriff: Nur durch echte Interoperabilität lässt sich Resilienz mit internationaler Offenheit versöhnen.',
  ].join('\n'),

  'de-c1-listen-t2': [
    'Moderatorin: Dr. Steiner, Sie fordern den radikalen Umbau wissenschaftlicher Publikationen. Übersehen Sie dabei nicht die Leistung klassischer Verlage?',
    'Dr. Steiner: Keineswegs! Ich räume gern ein, dass traditionelle Fachverlage über Jahrzehnte ein funktionierendes Begutachtungssystem aufgebaut haben.',
    'Moderatorin: Was genau stört Sie dann am gegenwärtigen Modell?',
    'Dr. Steiner: Dem halte ich entgegen, dass öffentlich finanzierte Forschung nicht hinter teuren Bezahlschranken verschwinden darf — zumal kleine Universitäten diese Lizenzgebühren kaum noch schultern können.',
    'Moderatorin: Halten Sie Open Access also für mehr als einen bloßen Trend?',
    'Dr. Steiner: Absolut. Ein transparenter Übergang zu frei zugänglichen Publikationen dürfte langfristig schlicht unabdingbar sein.',
  ].join('\n'),

  'de-c1-listen-t3': [
    'Interviewer: Frau Dr. Graf, angesichts immer häufigerer Starkregenereignisse reden alle über die „Schwammstadt“. Was steckt konkret dahinter?',
    'Dr. Graf: Das Grundprinzip ist eigentlich bestechend einfach: Statt Niederschläge rasch in überlastete Kanäle abzuleiten, speichern begrünte Dächer und entsiegelte Plätze das Wasser direkt vor Ort.',
    'Interviewer: Klingt fast wie eine Patentlösung für überflutete Innenstädte — oder gibt es Haken?',
    'Dr. Graf: Einschränkend weisen wir Hydrologen klar darauf hin, dass Umbauten im dichten historischen Bestand erhebliche finanzielle Mittel in Anspruch nehmen.',
    'Interviewer: Das heißt, klassische Kanalnetze werden dadurch nicht überflüssig?',
    'Dr. Graf: Genau — begrünte Flächen entlasten das System spürbar, ersetzen bestehende Leitungsnetze aber nicht vollständig.',
  ].join('\n'),

  // ================================ GERMAN C2 ================================
  'exam-de-c2-listen-t1': [
    'Interviewer: Frau Hartmann, Hand aufs Herz: Verliert das gedruckte Buch im Zeitalter permanenter digitaler Verfügbarkeit allmählich seinen kulturellen Rang?',
    'Autorin: Im Gegenteil — gerade seine Begrenztheit wird wieder zum eigentlichen Luxus!',
    'Interviewer: Begrenztheit als Luxus? Wie meinen Sie das?',
    'Autorin: Nun ja, ein Buch blinkt nicht, es schickt keine Push-Meldung und zwingt mich nicht zur sofortigen Stellungnahme.',
    'Interviewer: Und was gewinnt man durch diese Entschleunigung beim Lesen?',
    'Autorin: Diese widerständige Langsamkeit erlaubt erst jene produktive Fremdheit, in der man einen Gedanken nicht bloß konsumiert, sondern tatsächlich an ihm reift.',
  ].join('\n'),

  'de-c2-listen-t2': [
    'Moderator: Frau Dr. Hofer, die Rekonstruktion ganzer historischer Altstadtzeilen begeistert ja viele Bürger. Warum bleiben Sie dennoch skeptisch?',
    'Kritikerin: Verstehen Sie mich nicht falsch — historisierende Rekonstruktionen ganzer Stadtviertel treffen durchaus ein verständliches Bedürfnis nach Vertrautheit.',
    'Moderator: Wo genau liegt dann aus Sicht der Denkmalpflege das Problem?',
    'Kritikerin: Gleichwohl untergraben makellose Kulissen mitunter das Bewusstsein für historische Brüche, als habe es nie Zerstörung oder Wandel gegeben.',
    'Moderator: Was wäre demnach die anspruchsvollere Haltung im Städtebau?',
    'Kritikerin: Architektur sollte Widersprüche nicht glattbügeln, sondern lesbar halten — genau darin liegt die eigentliche Gretchenfrage jeder Denkmalpflege.',
  ].join('\n'),

  'de-c2-listen-t3': [
    'Moderatorin: Herr Professor Frei, Kritiker werfen der direkten Demokratie häufig vor, Volksabstimmungen verschärften gesellschaftliche Spaltungen. Teilen Sie diese Sorge?',
    'Prof. Frei: Sicherlich verlangen direkte Abstimmungen den Stimmberechtigten Geduld und allfällige Kompromissbereitschaft ab — einfach ist das nicht.',
    'Moderatorin: Aber treiben knappe Abstimmungen die Polarisierung nicht dennoch auf die Spitze?',
    'Prof. Frei: Wer behauptet, Bürgerentscheide trieben die Polarisierung zwangsläufig auf die Spitze, verkennt deren befriedende Wirkung.',
    'Moderatorin: Inwiefern kann ein strittiges Votum gesellschaftlich befriedend wirken?',
    'Prof. Frei: Gerade das öffentliche Ausloten strittiger Fragen entkräftet oft jenes Gefühl der Ohnmacht, das demokratische Institutionen andernorts gefährlich untergräbt.',
  ].join('\n'),

  // ================================ ENGLISH A1 ================================
  'exam-en-a1-listen-t1': [
    'Emma: Excuse me! Do you know where the travel books are? I couldn’t find them downstairs.',
    'Daniel: Hi there! Yes, our travel book section is up on the second floor — and you’re in luck, there’s a twenty percent discount today until five thirty.',
    'Emma: Oh, twenty percent off! That’s awesome. Could I grab a quick coffee downstairs first?',
    'Daniel: Sure, the coffee bar is right on the ground floor, just be quick — it closes at five o’clock sharp!',
    'Emma: Good thing you told me! I’ll head down for coffee first and then check out the second floor.',
  ].join('\n'),

  'en-a1-listen-t2': [
    'David: Welcome to Riverside Hotel! Let me pull up your reservation... Ah yes, you’re in Room 304 on the third floor.',
    'Sophie: Wonderful, thank you! Could you tell me when and where breakfast is served tomorrow?',
    'David: Of course! Breakfast is served from seven to ten in the morning in our sunny garden room.',
    'Sophie: Seven to ten in the garden room — got it. Oh, and my suitcase is quite heavy...',
    'David: No problem at all! Our porter is standing right next to the elevator and will happily help you with your luggage.',
  ].join('\n'),

  'en-a1-listen-t3': [
    'Chloe: Excuse me, how much longer is the bookstore open today?',
    'Liam: G’day! Just a quick heads-up — we’re closing in twenty minutes, at six o’clock sharp.',
    'Chloe: Oh right, I’d better hurry then! Are any books on sale today?',
    'Liam: Yep, all travel guides have a twenty-five percent discount right at the front counter today.',
    'Chloe: Twenty-five percent off travel guides? Brilliant, I’ll grab the New Zealand one right now!',
  ].join('\n'),

  // ================================ ENGLISH A2 ================================
  'exam-en-a2-listen-t1': [
    'Oliver: Hey Sarah! I’m just calling about our Italian cooking class on Sunday.',
    'Sarah: Oh hi Oliver! We’re still meeting at two o’clock, right?',
    'Oliver: Actually, that’s why I rang — the website originally said two o’clock, but the chef just emailed to move it to two thirty.',
    'Sarah: Good catch! Do we need to bring ingredients or an apron?',
    'Oliver: Nope, everything is included in the twenty-five pound fee — ingredients and aprons — so you only need to bring a food container to take home your extra pasta!',
    'Sarah: Amazing, twenty-five pounds all-in and a container for leftovers. See you at two thirty!',
  ].join('\n'),

  'en-a2-listen-t2': [
    'Emma: Liam, are we still going kayaking on Saturday morning?',
    'Liam: I really wanted to, but the forecast says strong wind, so the rental shop cancelled all morning boats.',
    'Emma: Oh no, what a shame! Shall we visit the science museum instead?',
    'Liam: Great idea! Let’s catch the ten-fifteen tram into town.',
    'Emma: Sounds good — should I buy our tickets online now?',
    'Liam: No need! My brother is coming too and he has already booked three student tickets online.',
  ].join('\n'),

  'en-a2-listen-t3': [
    'Claire: Good morning! Ready for the Dublin walking tour? Just stay with the group when we cross the busy streets.',
    'Ben: Morning! How long does the walk take, and where do we finish up?',
    'Claire: It takes two hours in total, so we’ll finish right opposite Trinity College at noon.',
    'Ben: Brilliant — any lunch tips nearby once we’re done?',
    'Claire: If you’re hungry afterward, definitely try the small bakery on Grafton Street. Their brown bread is delicious and much cheaper than the tourist restaurants!',
  ].join('\n'),

  // ================================ ENGLISH B1 ================================
  'exam-en-b1-listen-t1': [
    'Host: So when Copenhagen started expanding its protected bike lanes, did local drivers and businesses push back at first?',
    'Clara: Oh, absolutely! Local merchants were really worried customers wouldn’t turn up once street parking disappeared.',
    'Host: And did sales actually drop like they feared?',
    'Clara: Quite the opposite — within two years, foot and cycle traffic rose so sharply that neighborhood bakery and café revenues actually went up.',
    'Host: Why do you think cyclists spend more at neighborhood shops?',
    'Clara: It’s simple: people stop far more spontaneously when they’re on a bike than when they’re frustrated hunting for a parking spot.',
  ].join('\n'),

  'en-b1-listen-t2': [
    'Host: Hannah, your neighborhood book-swap box has become a local hit! How did the idea start?',
    'Hannah: Honestly? I had completely run out of shelf space at home! I almost put off building the wooden box until spring.',
    'Host: How did neighbors react once you put it outside?',
    'Hannah: It blew me away — once I placed twenty novels inside, neighbors filled it twice over in a single week!',
    'Host: Any unexpected challenges running a mini outdoor library?',
    'Hannah: The only real drawback was heavy rain damaging paperbacks, so last month a local carpenter helped us add a much stronger roof.',
  ].join('\n'),

  'en-b1-listen-t3': [
    'Priya: Welcome to Bengaluru orientation! Have you picked up your campus transit card yet?',
    'Tom: Not yet — can I just get it next week once classes start?',
    'Priya: I wouldn’t wait! Make sure you pick it up before Wednesday, because bus and train fares double without it.',
    'Tom: Whoa, double the fare — I’ll grab it tomorrow! What about the weekend heritage walk? Does it cost extra?',
    'Priya: The heritage walk is completely free! Just sign up at reception this afternoon though, because we only have a few seats left on the coach.',
  ].join('\n'),

  // ================================ ENGLISH B2 ================================
  'exam-en-b2-listen-t1': [
    'Maya: I used to spend hours highlighting textbook chapters in neon yellow, convinced I was absorbing everything.',
    'Leo: Same here — until I bombed a mock exam and realized passive rereading just creates an illusion of competence.',
    'Maya: Wait, what did you switch to instead?',
    'Leo: Active recall flashcards and explaining tricky concepts aloud to an empty room. Honestly, it cut my revision time almost in half.',
    'Maya: That’s exactly what I’m trying this semester! Though spacing reviews over weeks instead of cramming at the last minute is still the hardest habit to stick to.',
  ].join('\n'),

  'en-b2-listen-t2': [
    'Student: Our survey results are in — seventy-eight percent of office staff say they feel more productive working from home twice a week.',
    'Tutor: To a large extent that aligns closely with recent European workplace studies.',
    'Student: So can we conclude that hybrid work benefits everyone across the board?',
    'Tutor: Hold on — on the flip side, bear in mind that junior employees who joined remotely reported noticeably slower mentoring.',
    'Student: Ah, good point. So we shouldn’t generalize without career-stage context.',
    'Tutor: Exactly. Make sure you factor onboarding and mentoring experience into your final report before claiming remote work suits everyone equally.',
  ].join('\n'),

  'en-b2-listen-t3': [
    'Host: Following severe drought warnings in Cape Town, how much did municipal water usage actually drop?',
    'Dr. Naidoo: It was remarkable — citywide consumption fell by nearly half within eighteen months.',
    'Host: Was that purely citizens taking shorter showers, or did technology play a role?',
    'Dr. Naidoo: Smart pressure meters accounted for a huge share of those savings by detecting hidden pipe leaks overnight before water went to waste.',
    'Host: Does that mean the water crisis is permanently solved?',
    'Dr. Naidoo: Engineers strongly warn against complacency. As population density climbs, diversifying supply through rainwater harvesting and recycled gray water remains the only viable long-term path.',
  ].join('\n'),

  // ================================ ENGLISH C1 ================================
  'exam-en-c1-listen-t1': [
    'Interviewer: Behavioral economists love talking about the "paradox of choice." Why did it rattle classical economic theory so much?',
    'Dr. Hayes: Classical rational-actor models assumed expanding options could only improve welfare — after all, you can just ignore alternatives you dislike.',
    'Interviewer: Yet shoppers don’t actually behave that way in the supermarket?',
    'Dr. Hayes: Not at all! Field experiments repeatedly show that when shoppers face twenty-four varieties of jam instead of six, conversion rates actually plummet.',
    'Interviewer: What’s happening psychologically when there are too many options?',
    'Dr. Hayes: Two things: cognitive overload during evaluation, and amplified anticipated regret — even after buying, people nag themselves wondering whether a rejected option might have been marginally better.',
  ].join('\n'),

  'en-c1-listen-t2': [
    'Host: Let’s turn to urban housing density in Dublin. Are mid-rise timber developments the breakthrough planners have been waiting for?',
    'Dr. Kelly: Expanding mid-rise timber housing certainly looks compelling on paper, and it might well have cut construction emissions in Scandinavia.',
    'Host: I hear a "but" coming — what’s the catch?',
    'Dr. Kelly: Having said that, we can’t overlook an unintended spillover: without parallel investment in schools and public transit, denser districts quickly spark fierce local opposition.',
    'Host: So would you oppose zoning reform altogether?',
    'Dr. Kelly: No, I’d back zoning reform — but only with a binding infrastructure caveat attached from day one.',
  ].join('\n'),

  'en-c1-listen-t3': [
    'Host: For years headlines claimed speaking two languages universally shields the brain against aging. Does newer neuroscience still back that up?',
    'Dr. Park: Early neuroimaging papers did claim bilingualism universally delays cognitive aging, yet subsequent replication studies painted a far more nuanced picture.',
    'Host: What changed when researchers ran larger replications?',
    'Dr. Park: Not until teams rigorously controlled for socioeconomic status and lifelong reading habits did the true mechanism emerge.',
    'Host: So what specific cognitive edge does bilingualism actually sharpen?',
    'Dr. Park: Constant language switching appears to bolster attentional filtering specifically, rather than boosting general IQ across the board.',
  ].join('\n'),

  // ================================ ENGLISH C2 ================================
  'exam-en-c2-listen-t1': [
    'Host: Professor Vance, you served on the national curriculum review panel. Were you genuinely satisfied with the final compromise?',
    'Vance: Let us just say the document is a monument to committee prose — scrupulously polite, wonderfully symmetrical, and almost entirely unburdened by actionable specificity.',
    'Host: That sounds suspiciously like faint praise! Surely the committee achieved consensus?',
    'Vance: Oh, if one’s goal was to offend nobody at the conference table, it was a roaring success.',
    'Host: And what if one is an actual teacher trying to use it in class?',
    'Vance: If one hoped to help an overworked teacher on a rainy Tuesday morning, well, one might wait a little longer.',
  ].join('\n'),

  'en-c2-listen-t2': [
    'Host: Your essay provoked quite a stir among London heritage groups. Are you arguing we should tear down Victorian neighborhoods?',
    'Eleanor: With the greatest respect to preservationists who treat every Victorian facade as sacrosanct, freezing a living metropolis in amber begs the question of whom cities actually belong to.',
    'Host: You’re linking rigid preservation directly to housing affordability?',
    'Eleanor: Precisely. Winning an aesthetic victory that prices out younger residents is surely a pyrrhic triumph.',
    'Host: So should planners simply green-light modern glass skyscrapers everywhere instead?',
    'Eleanor: Heavens, no — reckless glass-tower speculation is equally untenable. What cities cry out for is a far more perspicacious synthesis of heritage and bold contemporary craft.',
  ].join('\n'),

  'en-c2-listen-t3': [
    'Host: In an era of rapid public-health and climate debates, why do scientific spokespeople so often struggle to hold public trust?',
    'Dr. Reid: Scientists frequently conflate transparent uncertainty with weakness, yet paradoxically audiences trust candid caveats far more than false bravado.',
    'Host: Doesn’t admitting what isn’t settled yet just trigger public panic?',
    'Dr. Reid: Quite the opposite! When researchers acknowledge what remains equivocal while explaining the salient evidence lucidly, public equanimity actually grows — even during crises.',
    'Host: So what erodes institutional credibility fastest in your view?',
    'Dr. Reid: Treating citizens as incapable of nuance is the surest way to erode credibility.',
  ].join('\n'),
};
