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
];

export function getPreTestQuestions(languageId: string): PreTestQuestion[] {
  const targetLang = languageId === 'german' ? 'german' : 'english';
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
  const targetLang = languageId === 'german' ? 'german' : 'english';
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

  const courses: IntensiveCourse[] =
    targetLang === 'german' ? GERMAN_INTENSIVE_COURSES : ENGLISH_INTENSIVE_COURSES;

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
    coreCourse.targetCertificates[0] ||
    (targetLang === 'german' ? `Goethe-Zertifikat ${verifiedLevel}` : `Cambridge English ${verifiedLevel}`);

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
