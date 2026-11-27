import {
  CEFRLevel,
  CollectiveCourseStep,
  IntensiveCourse,
  PreTestQuestion,
  PreTestResult,
  SkillType,
} from '../types';
import { GERMAN_INTENSIVE_COURSES } from './courses/germanCourses';
import { ENGLISH_INTENSIVE_COURSES } from './courses/englishCourses';
import { FRENCH_INTENSIVE_COURSES } from './courses/frenchCourses';
import { JAPANESE_INTENSIVE_COURSES } from './courses/japaneseCourses';
import { getDefaultCertificateForLevel, normalizeLearningLanguageId } from './languages';

export const PRETEST_QUESTIONS: PreTestQuestion[] = [
  // ============================ GERMAN PLACEMENT PRE-TEST (A1 → C2, 12 Qs) ============================
  {
    id: 'pre-de-a1-read',
    languageId: 'german',
    level: 'A1',
    skill: 'reading',
    passage: 'Café Mitte: Montag–Samstag 08:00–19:00 Uhr. Sonntag Ruhetag. Frühstück bis 12:00 Uhr.',
    prompt: 'Kann man am Sonntag im Café Mitte frühstücken?',
    options: [
      'Ja, bis 12:00 Uhr.',
      'Nein, am Sonntag ist das Café geschlossen.',
      'Ja, aber erst ab 19:00 Uhr.',
      'Nur mit Reservierung.',
    ],
    correctIndex: 1,
    explanation: '"Sonntag Ruhetag" means Sunday is the day off (closed).',
  },
  {
    id: 'pre-de-a1-listen',
    languageId: 'german',
    level: 'A1',
    skill: 'listening',
    audioScript: 'Guten Tag! Ich möchte bitte zwei Brötchen und einen großen Kaffee zum Mitnehmen. Was kostet das zusammen? Das macht vier Euro achtzig.',
    prompt: 'Was bestellt die Kundin und wie viel bezahlt sie?',
    options: [
      'Zwei Kuchen und einen Tee für 4,80 €',
      'Zwei Brötchen und einen großen Kaffee für 4,80 €',
      'Ein Brötchen und zwei Kaffee für 8,40 €',
      'Zwei Brötchen zum Hieressen für 4,18 €',
    ],
    correctIndex: 1,
    explanation: 'She orders "zwei Brötchen und einen großen Kaffee zum Mitnehmen" for "vier Euro achtzig" (4.80 €).',
  },
  {
    id: 'pre-de-a2-write',
    languageId: 'german',
    level: 'A2',
    skill: 'writing',
    prompt: 'Welcher Satz ist grammatikalisch richtig (Wechselpräposition + Perfekt)?',
    options: [
      'Ich habe das Buch auf dem Tisch gelegt.',
      'Ich bin das Buch auf den Tisch gelegt.',
      'Ich habe das Buch auf den Tisch gelegt.',
      'Ich habe das Buch auf der Tisch gelegt.',
    ],
    correctIndex: 2,
    explanation: '"Legen" expresses movement (Wohin?), so "auf" requires Akkusativ masculine: "auf den Tisch", and Perfekt uses "haben".',
  },
  {
    id: 'pre-de-a2-speak',
    languageId: 'german',
    level: 'A2',
    skill: 'speaking',
    prompt: 'Im Restaurant möchten Sie höflich ein Glas Wasser bestellen. Was sagen Muttersprachler?',
    options: [
      'Ich bekomme ein Wasser jetzt!',
      'Ich will Wasser geben.',
      'Ich hätte gern ein Glas Wasser, bitte.',
      'Machen Sie mir Wasser!',
    ],
    correctIndex: 2,
    explanation: '"Ich hätte gern... bitte" (Konjunktiv II) is the standard polite German restaurant phrasing.',
  },
  {
    id: 'pre-de-b1-read',
    languageId: 'german',
    level: 'B1',
    skill: 'reading',
    passage: 'Obwohl Anna jeden Morgen fast eine Stunde mit der S-Bahn pendeln muss, möchte sie ihre neue Stelle nicht aufgeben, weil sie im Team sehr selbstständig arbeiten kann.',
    prompt: 'Warum bleibt Anna bei ihrer neuen Stelle?',
    options: [
      'Weil der Arbeitsweg sehr kurz ist.',
      'Weil sie eigenständig im Team arbeiten darf, trotz der langen Fahrt.',
      'Weil sie nur von zu Hause aus arbeitet.',
      'Weil sie keine andere S-Bahn-Verbindung hat.',
    ],
    correctIndex: 1,
    explanation: '"Obwohl" introduces the concession (long commute), while "weil" gives the decisive reason (autonomous teamwork).',
  },
  {
    id: 'pre-de-b1-listen',
    languageId: 'german',
    level: 'B1',
    skill: 'listening',
    audioScript: 'Hallo Lukas, hier ist Miriam. Unser Termin beim Bürgeramt am Mittwoch fällt leider aus, weil die Sachbearbeiterin krank ist. Wir haben automatisch einen Ersatztermin am Freitag um elf Uhr bekommen. Sag mir bitte kurz Bescheid, ob das bei dir klappt.',
    prompt: 'Warum ruft Miriam an?',
    options: [
      'Lukas muss selbst einen neuen Termin online buchen.',
      'Der Termin wurde wegen Krankheit auf Freitag um 11 Uhr verlegt.',
      'Miriam ist am Mittwoch krank und kann nicht kommen.',
      'Das Bürgeramt ist diese Woche komplett geschlossen.',
    ],
    correctIndex: 1,
    explanation: 'The clerk is ill ("Sachbearbeiterin krank"), so the appointment was moved to Friday at 11:00 ("Ersatztermin am Freitag um elf Uhr").',
  },
  {
    id: 'pre-de-b2-write',
    languageId: 'german',
    level: 'B2',
    skill: 'writing',
    prompt: 'Wählen Sie die korrekte B2-Formulierung mit Genitivpräposition und Nomen-Verb-Verbindung:',
    options: [
      'Wegen dem schlechten Wetter mussten wir das Konzert in Absage stellen.',
      'Aufgrund des anhaltenden Starkregens sahen wir uns gezwungen, eine Entscheidung zu treffen.',
      'Trotz den hohen Kosten haben wir keine Rücksicht genommen auf das Budget.',
      'Anhand die neuen Daten können wir Kritik machen.',
    ],
    correctIndex: 1,
    explanation: '"Aufgrund + Genitiv (des anhaltenden Starkregens)" and "eine Entscheidung treffen" reflect accurate B2 formal register.',
  },
  {
    id: 'pre-de-b2-speak',
    languageId: 'german',
    level: 'B2',
    skill: 'speaking',
    prompt: 'Ein Kollege zögert unsicher vor der Tür Ihres Büros. Wie laden Sie ihn mit einer Modalpartikel herzlich ein?',
    options: [
      'Komm doch ruhig herein!',
      'Komm denn niemals herein!',
      'Komm wohl leider herein!',
      'Komm bloß nicht herein!',
    ],
    correctIndex: 0,
    explanation: 'The modal particle pair "doch ruhig" warmly removes hesitation and encourages someone to enter.',
  },
  {
    id: 'pre-de-c1-read',
    languageId: 'german',
    level: 'C1',
    skill: 'reading',
    passage: 'Das vom Verkehrsausschuss nach monatelangen Verhandlungen verabschiedete Konzept stößt bei Umweltverbänden ungeachtet einzelner Zugeständnisse weiterhin auf scharfe Kritik.',
    prompt: 'Was sagt dieser Satz aus?',
    options: [
      'Umweltverbände loben das Konzept wegen der großen Zugeständnisse.',
      'Der Verkehrsausschuss hat das Konzept nach langen Verhandlungen abgelehnt.',
      'Obwohl es einige Kompromisse gab, kritisieren Umweltverbände das beschlossene Konzept noch immer deutlich.',
      'Die Verhandlungen im Ausschuss dauern noch an.',
    ],
    correctIndex: 2,
    explanation: '"Verabschiedete" (passed) + "ungeachtet einzelner Zugeständnisse" (regardless of individual concessions) + "stößt auf scharfe Kritik".',
  },
  {
    id: 'pre-de-c1-listen',
    languageId: 'german',
    level: 'C1',
    skill: 'listening',
    audioScript: 'Der Minister betonte vor der Presse, die Energiewende sei keineswegs gefährdet; vielmehr müsse man nun die Netzkapazitäten zügig ausbauen, damit regionale Engpässe gar nicht erst entstünden.',
    prompt: 'Welche grammatische Funktion haben „sei“, „müsse“ und „entstünden“ in diesem Bericht?',
    options: [
      'Sie drücken aus, dass der Sprecher der Aussage persönlich zustimmt.',
      'Sie markieren indirekte Rede (Konjunktiv I/II) und journalistische Distanz.',
      'Sie beschreiben ein abgeschlossenes Ereignis in der Vergangenheit.',
      'Sie sind eine höfliche Aufforderung an die Zuhörer.',
    ],
    correctIndex: 1,
    explanation: 'Konjunktiv I (sei, müsse) with Konjunktiv II fallback (entstünden) marks neutral journalistic indirect discourse.',
  },
  {
    id: 'pre-de-c2-write',
    languageId: 'german',
    level: 'C2',
    skill: 'writing',
    prompt: 'Welche C2-Umformung bewahrt die exakte Bedeutung von „Er lehnte das Angebot keineswegs ab, knüpfte seine Zusage aber an strikte Bedingungen“?',
    options: [
      'Er schlug das Angebot rundheraus aus, weil die Bedingungen zu streng waren.',
      'Weit davon entfernt, die Offerte auszuschlagen, machte er sein Einverständnis gleichwohl von strengen Auflagen abhängig.',
      'Er akzeptierte die Offerte bedingungslos, obschon er Zweifel hegte.',
      'Er zog das Angebot zurück, nachdem die Auflagen erfüllt worden waren.',
    ],
    correctIndex: 1,
    explanation: '"Weit davon entfernt... gleichwohl von strengen Auflagen abhängig machen" accurately captures the exact C2 semantic nuance.',
  },
  {
    id: 'pre-de-c2-speak',
    languageId: 'german',
    level: 'C2',
    skill: 'speaking',
    prompt: 'In einer angespannten Verhandlung übertreibt Ihr Gesprächspartner maßlos. Mit welcher Redewendung mahnen Sie idiomatisch zur Verhältnismäßigkeit?',
    options: [
      'Da hast du wirklich Schwein gehabt.',
      'Wir sollten jetzt aber mal die Kirche im Dorf lassen.',
      'Das ist mir leider durch die Lappen gegangen.',
      'Da beißt die Maus keinen Faden ab.',
    ],
    correctIndex: 1,
    explanation: '"Die Kirche im Dorf lassen" is the classic German C2 idiom meaning "let’s not exaggerate / keep things in proportion".',
  },

  // ============================ ENGLISH PLACEMENT PRE-TEST (A1 → C2, 12 Qs) ============================
  {
    id: 'pre-en-a1-read',
    languageId: 'english',
    level: 'A1',
    skill: 'reading',
    passage: 'Central Library: Open Mon–Fri 09:00–20:00, Sat 10:00–16:00. Closed Sundays. Free Wi-Fi on all floors.',
    prompt: 'When can you visit the Central Library on Saturday?',
    options: [
      'From 9:00 AM to 8:00 PM',
      'From 10:00 AM to 4:00 PM',
      'Only on Sunday mornings',
      'It is closed all weekend',
    ],
    correctIndex: 1,
    explanation: 'Saturday hours are 10:00–16:00 (10:00 AM to 4:00 PM).',
  },
  {
    id: 'pre-en-a1-listen',
    languageId: 'english',
    level: 'A1',
    skill: 'listening',
    audioScript: 'Excuse me, does this bus go to Victoria Station? No, this is the number twelve. You need the number twenty-four from the stop across the street.',
    prompt: 'What should the passenger do?',
    options: [
      'Stay on bus number twelve.',
      'Walk straight to Victoria Station.',
      'Cross the street and take bus number twenty-four.',
      'Wait twenty-four minutes at the same stop.',
    ],
    correctIndex: 2,
    explanation: 'The speaker directs them to "the number twenty-four from the stop across the street".',
  },
  {
    id: 'pre-en-a2-write',
    languageId: 'english',
    level: 'A2',
    skill: 'writing',
    prompt: 'Choose the sentence with completely accurate English prepositions (IN, ON, AT):',
    options: [
      'Our flight leaves in Friday at the morning on 7:30.',
      'Our flight leaves on Friday morning at 7:30 in July.',
      'Our flight leaves at Friday on July in 7:30.',
      'Our flight leaves on 7:30 in Friday at July.',
    ],
    correctIndex: 1,
    explanation: 'ON for days (on Friday morning), AT for exact times (at 7:30), IN for months (in July).',
  },
  {
    id: 'pre-en-a2-speak',
    languageId: 'english',
    level: 'A2',
    skill: 'speaking',
    prompt: 'A friend invites you to dinner, but you already have plans. Which response sounds most natural?',
    options: [
      'I am not going, goodbye.',
      'I’d love to, but I’m already busy tonight. How about Thursday instead?',
      'I did already eat tomorrow.',
      'Impossible for me to dinner.',
    ],
    correctIndex: 1,
    explanation: '"I’d love to, but... How about... instead?" declines politely and offers an alternative.',
  },
  {
    id: 'pre-en-b1-read',
    languageId: 'english',
    level: 'B1',
    skill: 'reading',
    passage: 'Although Marcus had never lived abroad before, he adapted quickly to Dublin because he joined a local running club during his very first week.',
    prompt: 'What helped Marcus settle into Dublin quickly?',
    options: [
      'He had lived in Ireland twice before.',
      'He became part of a community running group right away.',
      'He moved there with his whole family.',
      'He worked remotely from his hometown.',
    ],
    correctIndex: 1,
    explanation: '"Because he joined a local running club during his very first week" explains his rapid adaptation.',
  },
  {
    id: 'pre-en-b1-listen',
    languageId: 'english',
    level: 'B1',
    skill: 'listening',
    audioScript: 'Hey Claire, we’ve had to put off Friday’s workshop until next Tuesday because the projector in Room B broke down. Don’t worry—all the slides are already uploaded, so you don’t need to print anything.',
    prompt: 'What does "put off" mean in this message, and what should Claire do?',
    options: [
      'Cancel permanently; print the slides.',
      'Postpone until Tuesday; no printing needed.',
      'Move to Room B; bring a projector.',
      'Start earlier on Friday; upload the slides.',
    ],
    correctIndex: 1,
    explanation: '"Put off" = postpone; the speaker explicitly tells Claire "you don’t need to print anything".',
  },
  {
    id: 'pre-en-b2-write',
    languageId: 'english',
    level: 'B2',
    skill: 'writing',
    prompt: 'Select the sentence using completely natural English collocations and a mixed conditional:',
    options: [
      'If I would have done a better decision last year, I wouldn’t be facing heavy stress now.',
      'Had I made a more prudent decision last year, I wouldn’t be under such intense pressure today.',
      'If I did a careful decision last year, I would not face strong coffee today.',
      'Making a big mistake last year, I wouldn’t had pressure now.',
    ],
    correctIndex: 1,
    explanation: 'You "make a decision" (not "do a decision"), and "Had I made... I wouldn’t be..." is an accurate B2+/C1 mixed conditional.',
  },
  {
    id: 'pre-en-b2-speak',
    languageId: 'english',
    level: 'B2',
    skill: 'speaking',
    prompt: 'In an IELTS/FCE discussion, how do you diplomatically introduce a counter-perspective?',
    options: [
      'Your opinion is totally wrong.',
      'That’s a fair point; having said that, we also need to weigh the long-term maintenance costs.',
      'No, I only think my side.',
      'On the other side of the hand, costs are big.',
    ],
    correctIndex: 1,
    explanation: '"That’s a fair point; having said that..." demonstrates authentic B2/C1 concession and pivoting.',
  },
  {
    id: 'pre-en-c1-read',
    languageId: 'english',
    level: 'C1',
    skill: 'reading',
    passage: 'Rarely has a public transit overhaul provoked such polarized reactions: commuters applaud the halved travel times, whereas independent shopkeepers contend that rerouted footfall has eroded their margins.',
    prompt: 'What tension is highlighted in the excerpt?',
    options: [
      'Both commuters and shopkeepers oppose the overhaul.',
      'Travel times doubled despite higher retail sales.',
      'Faster commutes for passengers coexist with reduced walk-in business for local shops.',
      'Shopkeepers applaud the rerouted pedestrian traffic.',
    ],
    correctIndex: 2,
    explanation: '"Whereas" contrasts commuters’ benefit (halved travel times) with shopkeepers’ concern (eroded margins).',
  },
  {
    id: 'pre-en-c1-listen',
    languageId: 'english',
    level: 'C1',
    skill: 'listening',
    audioScript: 'While the pilot study’s headline numbers look undeniably impressive, the absence of a control group means we should treat the researchers’ bold causal claims with a healthy dose of skepticism.',
    prompt: 'What is the speaker’s stance toward the pilot study?',
    options: [
      'Entirely convinced by the causal conclusions.',
      'Cautious because the lack of a control group undermines causal proof.',
      'Dismissive of the headline numbers as fabricated.',
      'Enthusiastic about scaling the pilot immediately.',
    ],
    correctIndex: 1,
    explanation: '"Absence of a control group" + "healthy dose of skepticism" signals measured academic caution.',
  },
  {
    id: 'pre-en-c2-write',
    languageId: 'english',
    level: 'C2',
    skill: 'writing',
    prompt: 'Which sentence demonstrates exact C2 lexical precision (disinterested vs. uninterested & inversion)?',
    options: [
      'Not only the mediator was uninterested in fairness, but she also ignored the brief.',
      'Seldom does one encounter a truly disinterested arbiter capable of adjudicating so contentious a dispute with equanimity.',
      'Rarely one meets a uninterested judge who solves arguments fastly.',
      'Scarcely had the panel convened than they were uninterested about bias.',
    ],
    correctIndex: 1,
    explanation: '"Disinterested" means impartial/unbiased (distinct from "uninterested"), paired with exact negative inversion ("Seldom does one encounter...").',
  },
  {
    id: 'pre-en-c2-speak',
    languageId: 'english',
    level: 'C2',
    skill: 'speaking',
    prompt: 'A British executive says after reviewing your draft: "That is certainly a brave proposal; perhaps we could revisit a few of the underlying assumptions." What is the pragmatic subtext?',
    options: [
      'They love the proposal and want to approve it immediately.',
      'They politely view the proposal as overly risky and expect substantial revisions.',
      'They did not have time to read the document.',
      'They are complimenting your personal courage.',
    ],
    correctIndex: 1,
    explanation: 'In British diplomatic understatement, "brave proposal" + "revisit underlying assumptions" signals major reservations requiring revision.',
  },

  // ============================ FRENCH PLACEMENT PRE-TEST (A1 → C2, 12 Qs) ============================
  {
    id: 'pre-fr-a1-read',
    languageId: 'french',
    level: 'A1',
    skill: 'reading',
    passage: 'Boulangerie Lumières : Ouvert du mardi au dimanche, 7h00–19h30. Fermé le lundi. Croissant : 1,30 €.',
    prompt: 'Peut-on acheter un croissant le lundi matin ?',
    options: [
      'Oui, à partir de 7h00.',
      'Non, la boulangerie est fermée le lundi.',
      'Oui, seulement jusqu’à midi.',
      'Non, elle ne vend pas de croissants.',
    ],
    correctIndex: 1,
    explanation: '« Fermé le lundi » means the bakery is closed on Mondays.',
  },
  {
    id: 'pre-fr-a1-listen',
    languageId: 'french',
    level: 'A1',
    skill: 'listening',
    audioScript: 'Bonjour ! Je voudrais deux baguettes et un café allongé, s’il vous plaît. Ça fait combien ? Quatre euros vingt, merci beaucoup !',
    prompt: 'Que commande la cliente et combien paie-t-elle ?',
    options: [
      'Un croissant et un thé pour 4,20 €',
      'Deux baguettes et un café allongé pour 4,20 €',
      'Deux cafés et une baguette pour 2,40 €',
      'Deux baguettes pour 4,80 €',
    ],
    correctIndex: 1,
    explanation: 'She orders « deux baguettes et un café allongé » for « quatre euros vingt » (4,20 €).',
  },
  {
    id: 'pre-fr-a2-write',
    languageId: 'french',
    level: 'A2',
    skill: 'writing',
    prompt: 'Quelle phrase au passé composé avec un verbe de mouvement est correcte ?',
    options: [
      'Hier, Marie a allé au musée avec ses amis.',
      'Hier, Marie est allée au musée avec ses amis.',
      'Hier, Marie est allé au musée avec ses amis.',
      'Hier, Marie va allée au musée avec ses amis.',
    ],
    correctIndex: 1,
    explanation: '« Aller » uses auxiliary « être » in Passé Composé, and the past participle agrees with feminine subject Marie (« allée »).',
  },
  {
    id: 'pre-fr-a2-speak',
    languageId: 'french',
    level: 'A2',
    skill: 'speaking',
    prompt: 'Dans un restaurant à Lyon, comment demander poliment la carte ?',
    options: [
      'Donne-moi la carte maintenant !',
      'Je veux la carte, serveur.',
      'Excusez-moi, pourrais-je voir la carte, s’il vous plaît ?',
      'Où tu mets la carte ?',
    ],
    correctIndex: 2,
    explanation: 'Using the conditional (« pourrais-je / je voudrais ») with « Excusez-moi » and « s’il vous plaît » is the natural polite French register.',
  },
  {
    id: 'pre-fr-b1-read',
    languageId: 'french',
    level: 'B1',
    skill: 'reading',
    passage: 'Bien que le trajet en train dure presque une heure, Claire préfère vivre à la campagne parce que les loyers y sont nettement moins élevés et que ses enfants profitent du jardin.',
    prompt: 'Pourquoi Claire choisit-elle d’habiter à la campagne ?',
    options: [
      'Parce que son bureau est juste à côté de sa maison.',
      'Parce que les loyers sont plus bas et le cadre convient à ses enfants, malgré le trajet.',
      'Parce qu’elle n’aime pas prendre le train.',
      'Parce qu’il n’y a plus d’appartements en ville.',
    ],
    correctIndex: 1,
    explanation: '« Bien que » introduces the concession (1-hour commute), while « parce que » gives the reasons (lower rent + garden for children).',
  },
  {
    id: 'pre-fr-b1-listen',
    languageId: 'french',
    level: 'B1',
    skill: 'listening',
    audioScript: 'Salut Thomas, c’est Nadia. Notre réunion de jeudi à quatorze heures est avancée à dix heures trente parce que le client de Montréal doit prendre son avion plus tôt. Tu peux me confirmer par message ?',
    prompt: 'Quel changement annonce Nadia ?',
    options: [
      'La réunion est annulée jusqu’à la semaine prochaine.',
      'La réunion aura lieu jeudi plus tôt, à 10h30 au lieu de 14h00.',
      'La réunion est repoussée à 16h30.',
      'Thomas doit aller chercher le client à l’aéroport.',
    ],
    correctIndex: 1,
    explanation: '« avancée à dix heures trente » means moved earlier from 14:00 to 10:30.',
  },
  {
    id: 'pre-fr-b2-write',
    languageId: 'french',
    level: 'B2',
    skill: 'writing',
    prompt: 'Choisissez la phrase correcte employant le subjonctif après une expression de nécessité :',
    options: [
      'Il faut que les municipalités investissent davantage dans les pistes cyclables.',
      'Il faut que les municipalités investient davantage dans les pistes cyclables.',
      'Il faut que les municipalités investiront davantage dans les pistes cyclables.',
      'Il faut les municipalités investissent davantage dans les pistes cyclables.',
    ],
    correctIndex: 0,
    explanation: '« Il faut que » triggers the present subjunctive: « investir » → « qu’elles investissent ».',
  },
  {
    id: 'pre-fr-b2-speak',
    languageId: 'french',
    level: 'B2',
    skill: 'speaking',
    prompt: 'Lors d’un débat DELF B2, comment nuancer un argument de manière élégante ?',
    options: [
      'Tu as complètement tort, c’est nul.',
      'Je comprends votre point de vue ; toutefois, il convient de nuancer cet aspect en tenant compte du coût social.',
      'Peut-être oui, peut-être non, je sais pas.',
      'C’est pas possible du tout.',
    ],
    correctIndex: 1,
    explanation: 'Acknowledging the interlocutor + « toutefois, il convient de nuancer... » demonstrates authentic B2 rhetorical control.',
  },
  {
    id: 'pre-fr-c1-read',
    languageId: 'french',
    level: 'C1',
    skill: 'reading',
    passage: 'Loin de se réduire à une simple prouesse technologique, la transition énergétique impose une refonte profonde de nos habitudes de consommation, faute de quoi les gains d’efficacité risquent d’être neutralisés par l’effet rebond.',
    prompt: 'Quelle mise en garde l’auteur formule-t-il ?',
    options: [
      'La technologie seule suffira à résoudre la crise climatique.',
      'Sans évolution des comportements de consommation, les progrès techniques risquent d’être annulés par un effet rebond.',
      'L’efficacité énergétique n’a aucun intérêt économique.',
      'La transition énergétique doit être suspendue.',
    ],
    correctIndex: 1,
    explanation: '« faute de quoi » ("failing which") links lifestyle reform directly to avoiding the rebound effect neutralizing efficiency gains.',
  },
  {
    id: 'pre-fr-c1-listen',
    languageId: 'french',
    level: 'C1',
    skill: 'listening',
    audioScript: 'Si la semaine de quatre jours séduit indéniablement par ses effets sur le bien-être, plusieurs économistes soulignent qu’elle ne saurait être généralisée sans repenser l’organisation des services publics essentiels.',
    prompt: 'Quelle est la nuance centrale de l’intervenant ?',
    options: [
      'La semaine de quatre jours est universellement applicable dès demain.',
      'Malgré ses bénéfices sur le bien-être, sa généralisation exige de réorganiser les services publics essentiels.',
      'Les économistes rejettent totalement l’idée du bien-être au travail.',
      'Seul le secteur privé refuse ce modèle.',
    ],
    correctIndex: 1,
    explanation: 'Concessive « Si... » ("While...") balances well-being benefits with the structural caveat (« ne saurait être généralisée sans... »).',
  },
  {
    id: 'pre-fr-c2-write',
    languageId: 'french',
    level: 'C2',
    skill: 'writing',
    prompt: 'Identifiez la phrase de niveau DALF C2 maîtrisant l’inversion après un adverbe en tête de phrase :',
    options: [
      'À peine le rapport a été publié que les syndicats ont réagi.',
      'À peine le rapport eut-il été publié que les syndicats firent part de leurs réserves.',
      'À peine le rapport publié, donc les syndicats ont dit non.',
      'À peine que le rapport était publié, les syndicats réagissaient.',
    ],
    correctIndex: 1,
    explanation: '« À peine + inversion (eut-il été publié) ... que » exemplifies polished C2 literary/editorial syntax.',
  },
  {
    id: 'pre-fr-c2-speak',
    languageId: 'french',
    level: 'C2',
    skill: 'speaking',
    prompt: 'Dans une conférence académique francophone, un modérateur dit : « Votre démonstration est séduisante, mais elle mériterait d’être étayée sur le plan empirique. » Que signifie-t-il ?',
    options: [
      'Votre exposé est parfait et ne nécessite aucune modification.',
      'Votre thèse est intellectuellement attrayante, mais elle manque encore de preuves concrètes ou de données.',
      'Votre présentation était trop courte.',
      'Il rejette la langue utilisée.',
    ],
    correctIndex: 1,
    explanation: '« séduisante » + « mériterait d’être étayée sur le plan empirique » is polished C2 academic critique requesting stronger empirical evidence.',
  },

  // ============================ JAPANESE PLACEMENT PRE-TEST (A1/N5 → C2/N1+, 12 Qs) ============================
  {
    id: 'pre-ja-a1-read',
    languageId: 'japanese',
    level: 'A1',
    skill: 'reading',
    passage: 'さくらカフェ：火曜日〜日曜日 9:00〜18:00。月曜日は休みです。コーヒーは400円です。',
    prompt: '月曜日にさくらカフェでコーヒーを飲めますか。(Can you drink coffee at Sakura Cafe on Monday?)',
    options: [
      'はい、9時から飲めます。',
      'いいえ、月曜日は休みです。',
      'はい、18時まで飲めます。',
      'コーヒーはありません。',
    ],
    correctIndex: 1,
    explanation: '「月曜日は休みです」 means Monday is a closed day (holiday/day off).',
  },
  {
    id: 'pre-ja-a1-listen',
    languageId: 'japanese',
    level: 'A1',
    skill: 'listening',
    audioScript: 'すみません、おにぎりを二つとお茶を一つください。ぜんぶでいくらですか。はい、五百二十円です。',
    prompt: 'お客さんは何を注文して、いくら払いますか。',
    options: [
      'パンを二つとコーヒーを一つ、420円',
      'おにぎりを二つとお茶を一つ、520円',
      'おにぎりを一つとお茶を二つ、520円',
      'おにぎりを二つ、250円',
    ],
    correctIndex: 1,
    explanation: '「おにぎりを二つとお茶を一つ」 (2 onigiri + 1 tea) totaling 「五百二十円」 (520 yen).',
  },
  {
    id: 'pre-ja-a2-write',
    languageId: 'japanese',
    level: 'A2',
    skill: 'writing',
    prompt: '正しい助詞（particle）と「て形」の組み合わせを選んでください：「図書館___静かに本を___ください。」',
    options: [
      'に / 読んで',
      'で / 読んで',
      'を / 読んて',
      'へ / 読みて',
    ],
    correctIndex: 1,
    explanation: 'Action location uses particle 「で」 (図書館で), and 読む conjugates to 「読んで」 (not 読んて).',
  },
  {
    id: 'pre-ja-a2-speak',
    languageId: 'japanese',
    level: 'A2',
    skill: 'speaking',
    prompt: '駅員さんに道をていねいに聞くとき、一番自然な言い方はどれですか。',
    options: [
      'すみません、美術館はどこにありますか。',
      '美術館はどこだ！教えろ。',
      '美術館は行きますか。',
      'お前、美術館を知っている？',
    ],
    correctIndex: 0,
    explanation: '「すみません、〜はどこにありますか」 is the natural polite N4/A2 way to ask for a location.',
  },
  {
    id: 'pre-ja-b1-read',
    languageId: 'japanese',
    level: 'B1',
    skill: 'reading',
    passage: '毎日通勤に一時間以上かかりますが、今の職場はチームワークがよく、リモートワークも選べるので、田中さんは転職するつもりはありません。',
    prompt: '田中さんが今の仕事を続ける主な理由は何ですか。',
    options: [
      '家から会社まで歩いて5分だから。',
      '通勤は長いが、職場のチームワークが良く柔軟に働けるから。',
      '他の会社が見つからないから。',
      '毎日出社しなければいけないから。',
    ],
    correctIndex: 1,
    explanation: '「〜ますが」 concedes the long commute while 「〜ので」 states the decisive reason (teamwork + remote work option).',
  },
  {
    id: 'pre-ja-b1-listen',
    languageId: 'japanese',
    level: 'B1',
    skill: 'listening',
    audioScript: 'もしもし、佐藤です。明日の会議ですが、部長の飛行機が遅れることになったので、午前十時から午後二時に変更になりました。資料は午前中に送りますね。',
    prompt: '明日の会議はどうなりましたか。',
    options: [
      '中止になった。',
      '午前10時から午後2時に変更になった。',
      '午後2時から午前10時に早まった。',
      '佐藤さんが欠席することになった。',
    ],
    correctIndex: 1,
    explanation: '「午前十時から午後二時に変更になりました」 means the meeting moved from 10:00 AM to 2:00 PM.',
  },
  {
    id: 'pre-ja-b2-write',
    languageId: 'japanese',
    level: 'B2',
    skill: 'writing',
    prompt: 'ビジネスメールで取引先に確認をお願いするときの正しい敬語（Keigo）はどれですか。',
    options: [
      '添付の資料を見てください。',
      '添付の資料をご確認いただけますでしょうか。',
      '添付の資料を拝見してください。',
      '添付の資料をお読みになってあげてください。',
    ],
    correctIndex: 1,
    explanation: '「ご確認いただけますでしょうか」 uses polite humble request phrasing; 「拝見する」 is humble (for your own looking, never the client’s!).',
  },
  {
    id: 'pre-ja-b2-speak',
    languageId: 'japanese',
    level: 'B2',
    skill: 'speaking',
    prompt: '会議で相手の意見を尊重しつつ反対の視点を述べるとき、最も適切なJLPT N2/B2表現はどれですか。',
    options: [
      'それは絶対に間違っています。',
      'おっしゃる通り利点も大きいのですが、一方で長期的な運用コストについても検討が必要だと思います。',
      'よく分かりませんが、反対です。',
      'そうかもしれませんけど、やりたくないです。',
    ],
    correctIndex: 1,
    explanation: '「おっしゃる通り〜のですが、一方で〜」 gracefully validates the point before introducing a structured counterpoint.',
  },
  {
    id: 'pre-ja-c1-read',
    languageId: 'japanese',
    level: 'C1',
    skill: 'reading',
    passage: 'AIによる自動化は業務効率を飛躍的に高める反面、人間の判断力が形骸化する恐れを孕んでおり、技術の導入にあたっては明確な責任体制の構築が不可欠である。',
    prompt: '筆者の主張として最も適切なものはどれですか。',
    options: [
      'AI自動化にはリスクがないため全面導入すべきだ。',
      '効率化という利点の反面、人間の判断力低下の懸念があるため、明確な責任体制が不可欠だ。',
      '業務効率より手作業を優先すべきだ。',
      '技術導入の責任はすべてAI開発者だけにある。',
    ],
    correctIndex: 1,
    explanation: '「〜反面」 contrasts efficiency gains with the risk of eroding human judgment, concluding with 「不可欠である」 (indispensable).',
  },
  {
    id: 'pre-ja-c1-listen',
    languageId: 'japanese',
    level: 'C1',
    skill: 'listening',
    audioScript: '地方創生の取り組みは一時的な補助金に頼るだけでは持続性に欠け、地域の資源を活かした自立的な仕組みづくりへと転換せざるを得ない段階に来ています。',
    prompt: '講演者が指摘している課題と方向性は何ですか。',
    options: [
      '補助金を増やせばすべての問題が解決する。',
      '一時的な補助金依存から脱し、地域資源を活かした持続可能な仕組みへ転換する必要がある。',
      '地方創生はすでに完了した。',
      '地域資源は活用すべきではない。',
    ],
    correctIndex: 1,
    explanation: '「〜だけでは持続性に欠け」 critiques temporary subsidies and 「〜せざるを得ない」 stresses the unavoidable shift to self-sustaining models.',
  },
  {
    id: 'pre-ja-c2-write',
    languageId: 'japanese',
    level: 'C2',
    skill: 'writing',
    prompt: 'JLPT N1+/C2レベルの格調高い書面表現として文法・語法ともに最も正確な文はどれですか。',
    options: [
      '長年の議論をへて、ようやく合意に至ったと言わざるを得ない。',
      '幾多の曲折を経た末、関係各所の尽力のたまものとして本協定の締結に至った次第である。',
      'たくさんの問題があったけど、みんなの努力のたまものだから契約した次第です。',
      '曲折を経るまでもなく、合意に至るべくして至らなかった。',
    ],
    correctIndex: 1,
    explanation: '「幾多の曲折を経た末」「尽力のたまもの」「〜に至った次第である」 align seamlessly in formal executive/editorial Japanese register.',
  },
  {
    id: 'pre-ja-c2-speak',
    languageId: 'japanese',
    level: 'C2',
    skill: 'speaking',
    prompt: '日本の商談で相手から「非常に興味深いご提案ですので、社内で前向きに検討させていただきます」と言われた場合、文脈上の含意として最も的確な解釈はどれですか。',
    options: [
      'その場で即決・契約成立が確定した。',
      '好意的な関心は示しつつも、社内稟議が必要であり即答や確約は保留している。',
      '提案内容をまったく理解していない。',
      '二度と連絡しないでほしいという明確な拒絶である。',
    ],
    correctIndex: 1,
    explanation: '「前向きに検討させていただきます」 in Japanese business pragmatics signals polite receptiveness while deferring commitment pending internal consensus (稟議).',
  },
];

export function getPreTestQuestions(languageId: string): PreTestQuestion[] {
  const targetLang = normalizeLearningLanguageId(languageId);
  return PRETEST_QUESTIONS.filter((q) => q.languageId === targetLang);
}

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Evaluates a completed placement pre-test, verifies the learner's authentic CEFR tier,
 * pinpoints skill weaknesses, and builds a collective multi-course study bundle!
 */
export function evaluatePreTest(
  languageId: string,
  answers: Record<string, number>
): PreTestResult {
  const targetLang = normalizeLearningLanguageId(languageId);
  const questions = getPreTestQuestions(targetLang);

  const levelTotals: Record<CEFRLevel, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };

  const skillTotals: Record<SkillType, { correct: number; total: number }> = {
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
    speaking: { correct: 0, total: 0 },
  };

  let correctCount = 0;

  questions.forEach((q) => {
    const chosen = answers[q.id];
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) correctCount += 1;

    levelTotals[q.level].total += 1;
    if (isCorrect) levelTotals[q.level].correct += 1;

    skillTotals[q.skill].total += 1;
    if (isCorrect) skillTotals[q.skill].correct += 1;
  });

  const overallScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Determine highest solidly mastered tier (progressive mastery with 1-tier grace)
  let verifiedIdx = 0;
  for (let i = 0; i < LEVEL_ORDER.length; i++) {
    const lvl = LEVEL_ORDER[i];
    const { correct, total } = levelTotals[lvl];
    const ratio = total > 0 ? correct / total : 0;
    if (ratio >= 0.5) {
      verifiedIdx = i;
    } else if (i >= 1) {
      // Stop climbing if a tier is missed completely
      break;
    }
  }
  // If user got 0% on A1, stay at A1; if 100% across all levels, verify C2
  if (correctCount === 0) verifiedIdx = 0;
  const verifiedLevel = LEVEL_ORDER[verifiedIdx];

  const skillScores: Record<SkillType, number> = {
    reading: skillTotals.reading.total ? Math.round((skillTotals.reading.correct / skillTotals.reading.total) * 100) : 0,
    listening: skillTotals.listening.total ? Math.round((skillTotals.listening.correct / skillTotals.listening.total) * 100) : 0,
    writing: skillTotals.writing.total ? Math.round((skillTotals.writing.correct / skillTotals.writing.total) * 100) : 0,
    speaking: skillTotals.speaking.total ? Math.round((skillTotals.speaking.correct / skillTotals.speaking.total) * 100) : 0,
  };

  // Identify weakest 2 skills to prioritize in collective course plan
  const sortedSkills = (['reading', 'listening', 'writing', 'speaking'] as SkillType[]).sort(
    (a, b) => skillScores[a] - skillScores[b]
  );
  const prioritySkills = sortedSkills.slice(0, 2);

  const courseMap: Record<string, IntensiveCourse[]> = {
    german: GERMAN_INTENSIVE_COURSES,
    english: ENGLISH_INTENSIVE_COURSES,
    french: FRENCH_INTENSIVE_COURSES,
    japanese: JAPANESE_INTENSIVE_COURSES,
  };
  const courses: IntensiveCourse[] = courseMap[targetLang] || ENGLISH_INTENSIVE_COURSES;

  const findCourse = (lvl: CEFRLevel) => courses.find((c) => c.level === lvl) || courses[0];

  const recommendedCourses: CollectiveCourseStep[] = [];

  // 1. Optional Foundation Reinforcement if verifiedLevel > A1 and any skill is weak (<60%)
  if (verifiedIdx > 0 && skillScores[sortedSkills[0]] < 60) {
    const prevLevel = LEVEL_ORDER[verifiedIdx - 1];
    const prevCourse = findCourse(prevLevel);
    recommendedCourses.push({
      role: 'foundation',
      courseId: prevCourse.id,
      level: prevLevel,
      title: prevCourse.title,
      reason: `Close your ${sortedSkills[0]} gap (${skillScores[sortedSkills[0]]}%) rapidly before advancing.`,
      prioritySkills: [sortedSkills[0]],
    });
  }

  // 2. Core Mastery Course at verified level (or next level if they scored 100% on current level & overall >= 80%)
  const coreCourse = findCourse(verifiedLevel);
  recommendedCourses.push({
    role: 'core',
    courseId: coreCourse.id,
    level: verifiedLevel,
    title: coreCourse.title,
    reason: `Consolidate full 4-skill exam readiness at your verified ${verifiedLevel} tier (${overallScore}% placement score).`,
    prioritySkills,
  });

  // 3. Bridge Course to next CEFR level (unless already at C2)
  if (verifiedIdx < LEVEL_ORDER.length - 1) {
    const nextLevel = LEVEL_ORDER[verifiedIdx + 1];
    const nextCourse = findCourse(nextLevel);
    recommendedCourses.push({
      role: 'bridge',
      courseId: nextCourse.id,
      level: nextLevel,
      title: nextCourse.title,
      reason: `Your next milestone track to level up from ${verifiedLevel} to ${nextLevel} certification.`,
      prioritySkills: ['speaking', 'listening'],
    });
  }

  const suggestedCertificate =
    coreCourse.targetCertificates[0] || getDefaultCertificateForLevel(targetLang, verifiedLevel);

  return {
    id: `pre-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    languageId: targetLang,
    verifiedLevel,
    overallScore,
    correctCount,
    totalCount: questions.length,
    skillScores,
    recommendedCourses,
    suggestedCertificate,
  };
}
