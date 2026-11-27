import {
  AIEvaluationResult,
  AIProviderConfig,
  CEFRLevel,
  ExamAIAssessment,
  ExamAttemptRecord,
  ExamCorrectionItem,
  ExamHistoryReadinessReport,
  ExamQuestionReview,
  ExamReadinessVerdict,
  ExamSkillInsight,
  ExamStudyPlanItem,
  HistorySkillReadiness,
  MockExam,
  ReadinessConfidence,
  ScoreTrendDirection,
  SkillReadinessStatus,
  SkillType,
} from '../types';
import {
  AI_PROVIDER_PRESETS,
  callAIProvider,
  evaluateWithAIOrFallback,
  isAIConfigReady,
} from './aiClient';
import {
  getExamListeningTracks,
  getExamReadingParts,
  getExamSpeakingParts,
  getExamWritingTasks,
} from './examScoring';

const ALL_SKILLS: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];
const VALID_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function clampCefr(raw: unknown, fallback: CEFRLevel): CEFRLevel {
  return typeof raw === 'string' && VALID_CEFR.includes(raw as CEFRLevel)
    ? (raw as CEFRLevel)
    : fallback;
}

function estimateCefrFromScore(target: CEFRLevel, score: number): CEFRLevel {
  const idx = VALID_CEFR.indexOf(target);
  if (score >= 88 && idx < VALID_CEFR.length - 1) return VALID_CEFR[idx];
  if (score >= 60) return target;
  return VALID_CEFR[Math.max(0, idx - 1)];
}

function cleanStrings(raw: unknown, limit: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, limit);
}

function cleanCorrections(raw: unknown, limit: number): ExamCorrectionItem[] {
  if (!Array.isArray(raw)) return [];
  const items: ExamCorrectionItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const rec = entry as Record<string, unknown>;
    const original = typeof rec.original === 'string' ? rec.original.trim() : '';
    const corrected = typeof rec.corrected === 'string' ? rec.corrected.trim() : '';
    const explanation = typeof rec.explanation === 'string' ? rec.explanation.trim() : '';
    const sectionTag = typeof rec.sectionTag === 'string' ? rec.sectionTag.trim() : undefined;
    if (corrected || explanation) {
      items.push({ original, corrected, explanation, sectionTag });
    }
    if (items.length >= limit) break;
  }
  return items;
}

function parseInlineCorrectionFromNote(note: string, sectionTag?: string): ExamCorrectionItem {
  const arrowParts = note.split(/->|→/);
  if (arrowParts.length >= 2) {
    const left = arrowParts[0].replace(/^["']|["']$/g, '').trim();
    const rightFull = arrowParts.slice(1).join('→').trim();
    const parenMatch = rightFull.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (parenMatch) {
      return {
        original: left,
        corrected: parenMatch[1].replace(/^["']|["']$/g, '').trim(),
        explanation: parenMatch[2].trim(),
        sectionTag,
      };
    }
    return {
      original: left,
      corrected: rightFull.replace(/^["']|["']$/g, '').trim(),
      explanation: 'Examiner grammar & phrasing fix.',
      sectionTag,
    };
  }
  return {
    original: '',
    corrected: note.trim(),
    explanation: 'Actionable examiner revision note.',
    sectionTag,
  };
}

function extractMissedReviewCorrections(
  reviews: ExamQuestionReview[],
  skill: 'reading' | 'listening'
): ExamCorrectionItem[] {
  return reviews
    .filter((r) => r.skill === skill && !r.isCorrect)
    .slice(0, 6)
    .map((r) => ({
      sectionTag: r.sectionTag,
      original: r.chosenOption ? `${r.prompt} → You chose: "${r.chosenOption}"` : `${r.prompt} → (No answer selected)`,
      corrected: r.correctOption,
      explanation: r.explanation,
    }));
}

function extractRubricWeaknesses(attempt: ExamAttemptRecord, skill: 'writing' | 'speaking'): string[] {
  const rubric = attempt.skills[skill]?.rubric;
  if (!rubric) return [];
  const entries: Array<[string, number]> = [
    ['Task Fulfillment', rubric.taskFulfillment],
    ['Coherence & Cohesion', rubric.coherenceCohesion],
    ['Lexical Range', rubric.lexicalRange],
    ['Grammatical Accuracy', rubric.grammaticalAccuracy],
  ];
  return entries
    .filter(([, score]) => score < 70)
    .sort((a, b) => a[1] - b[1])
    .map(([name, score]) => `${name} scored ${score}% — focus on targeted drills to push above 75%.`);
}

/**
 * Deterministic smart 4-skill diagnostic assessment built directly from submitted answers,
 * missed questions, regional accents, rubric sub-scores, and examiner evaluations.
 */
export function buildOfflineExamAssessment(params: {
  exam?: MockExam | null;
  attempt: ExamAttemptRecord;
  writingEvals?: AIEvaluationResult[];
  speakingEval?: AIEvaluationResult | null;
}): ExamAIAssessment {
  const { exam, attempt, writingEvals = [], speakingEval = null } = params;
  const reviews = attempt.questionReviews || [];
  const langName = attempt.languageId === 'german' ? 'German' : 'English';

  const scoresBySkill: Record<SkillType, number> = {
    reading: attempt.skills.reading?.score ?? 0,
    listening: attempt.skills.listening?.score ?? 0,
    writing: attempt.skills.writing?.score ?? 0,
    speaking: attempt.skills.speaking?.score ?? 0,
  };

  const sortedSkills = [...ALL_SKILLS].sort((a, b) => scoresBySkill[b] - scoresBySkill[a]);
  const strongestSkill = sortedSkills[0];
  const prioritySkill = sortedSkills[sortedSkills.length - 1];

  // Reading insight
  const readReviews = reviews.filter((r) => r.skill === 'reading');
  const readMissed = readReviews.filter((r) => !r.isCorrect);
  const readPassedParts = Array.from(new Set(readReviews.filter((r) => r.isCorrect).map((r) => r.sectionTag)));
  const readMissedParts = Array.from(new Set(readMissed.map((r) => r.sectionTag)));
  const readingInsight: ExamSkillInsight = {
    skill: 'reading',
    cefrEstimate: estimateCefrFromScore(attempt.level, scoresBySkill.reading),
    summary:
      readReviews.length > 0
        ? `Scored ${scoresBySkill.reading}% (${readReviews.length - readMissed.length}/${readReviews.length} correct). ${
            readMissed.length === 0
              ? `Strong comprehension across all ${attempt.level} ${langName} reading parts.`
              : `Errors clustered in ${readMissedParts.join(', ')} — review distractor wording and grammatical connectors.`
          }`
        : `Scored ${scoresBySkill.reading}% on ${attempt.level} Reading. ${attempt.skills.reading?.feedback || ''}`.trim(),
    strengths:
      readPassedParts.length > 0
        ? [`Answered items accurately in ${readPassedParts.join(', ')}.`]
        : scoresBySkill.reading >= 60
        ? [`Maintained solid overall reading accuracy (${scoresBySkill.reading}%).`]
        : [`Completed the ${attempt.level} reading section under timed exam pressure.`],
    weaknesses:
      readMissed.length > 0
        ? readMissed.slice(0, 3).map((m) => `[${m.sectionTag}] Missed "${m.prompt}" — ${m.explanation}`)
        : scoresBySkill.reading < 75
        ? ['Watch for subtle distractors in True/False/Not Given and Cloze grammar gaps.']
        : [],
    corrections: extractMissedReviewCorrections(reviews, 'reading'),
    suggestions: [
      attempt.languageId === 'german'
        ? `Underline key qualifiers (nicht, nur, erst, kaum, obwohl) in ${attempt.level} Lesen passages before choosing Richtig/Falsch.`
        : `Verify exact qualifiers (only, rarely, despite, whereas) in ${attempt.level} Reading passages before locking answers.`,
      readMissedParts.includes('Reading P3')
        ? 'Drill Sprachbausteine / Use of English prepositions, verb-case pairings, and conjunctions for 10 mins daily.'
        : 'Practice timed skimming for gist first, then scanning paragraph-by-paragraph for evidence.',
    ],
    aiAnalyzed: false,
  };

  // Listening insight
  const listenReviews = reviews.filter((r) => r.skill === 'listening');
  const listenMissed = listenReviews.filter((r) => !r.isCorrect);
  const listenMissedParts = Array.from(new Set(listenMissed.map((r) => r.sectionTag)));
  const tracks = exam ? getExamListeningTracks(exam) : [];
  const missedTraps = listenMissedParts
    .map((tag) => {
      const idx = Number(tag.replace(/\D/g, '')) - 1;
      const tr = tracks[idx];
      return tr ? `${tag} (${tr.accentCode || 'Standard'}): ${tr.hearingFocusTrap}` : null;
    })
    .filter((v): v is string => Boolean(v));

  const listeningInsight: ExamSkillInsight = {
    skill: 'listening',
    cefrEstimate: estimateCefrFromScore(attempt.level, scoresBySkill.listening),
    summary:
      listenReviews.length > 0
        ? `Scored ${scoresBySkill.listening}% (${listenReviews.length - listenMissed.length}/${listenReviews.length} correct). ${
            listenMissed.length === 0
              ? `Handled multi-accent ${langName} audio dialogues cleanly.`
              : `Missed items in ${listenMissedParts.join(', ')} — pay close attention to speaker corrections and regional phrasing.`
          }`
        : `Scored ${scoresBySkill.listening}% on ${attempt.level} Listening. ${attempt.skills.listening?.feedback || ''}`.trim(),
    strengths:
      listenMissed.length < listenReviews.length && listenReviews.length > 0
        ? [`Tracked key facts accurately across ${listenReviews.length - listenMissed.length} of ${listenReviews.length} spoken items.`]
        : scoresBySkill.listening >= 60
        ? [`Passed the ${attempt.level} listening threshold (${scoresBySkill.listening}%).`]
        : ['Gained exposure to multi-speaker natural dialogue pacing under exam rules.'],
    weaknesses:
      missedTraps.length > 0
        ? missedTraps
        : listenMissed.length > 0
        ? listenMissed.slice(0, 3).map((m) => `[${m.sectionTag}] Missed "${m.prompt}" — ${m.explanation}`)
        : scoresBySkill.listening < 75
        ? ['Watch for mid-sentence self-corrections (e.g., changed times, platform numbers, or dates).']
        : [],
    corrections: extractMissedReviewCorrections(reviews, 'listening'),
    suggestions: [
      'Use the 15-second pre-read window to circle question keywords (who, when, changed detail) before pressing Play.',
      'Replay the unlocked multi-speaker tracks below once without transcript, then shadow-read the dialogue aloud to lock in regional rhythm.',
    ],
    aiAnalyzed: false,
  };

  // Writing insight
  const writingStrengths = writingEvals.flatMap((e) => e.strengths).slice(0, 4);
  const writingRawNotes =
    writingEvals.length > 0
      ? writingEvals.flatMap((e) => e.corrections).slice(0, 5)
      : (attempt.writingNotes || []).slice(0, 5);
  const writingCorrectionItems: ExamCorrectionItem[] = [
    ...writingEvals.flatMap((ev, idx) =>
      (ev.correctionItems || []).map((ci) => ({
        ...ci,
        sectionTag: ci.sectionTag || `Writing Task ${idx + 1}`,
      }))
    ),
  ];
  if (writingCorrectionItems.length === 0 && writingRawNotes.length > 0) {
    writingRawNotes.forEach((n) => writingCorrectionItems.push(parseInlineCorrectionFromNote(n, 'Writing')));
  }
  const writingUpgraded = writingEvals
    .map((ev, idx) => (ev.upgradedVersion ? (writingEvals.length > 1 ? `[Task ${idx + 1}]\n${ev.upgradedVersion}` : ev.upgradedVersion) : ''))
    .filter(Boolean)
    .join('\n\n');
  const writingSuggestions = writingEvals.flatMap((ev) => ev.suggestions || []).slice(0, 4);
  const writingAIAnalyzed = writingEvals.some((ev) => ev.source === 'ai');

  const writingInsight: ExamSkillInsight = {
    skill: 'writing',
    cefrEstimate: writingEvals[0]?.cefrEstimate || estimateCefrFromScore(attempt.level, scoresBySkill.writing),
    summary:
      writingEvals[0]?.examinerSummary ||
      attempt.skills.writing?.feedback ||
      `Scored ${scoresBySkill.writing}% on ${attempt.level} Writing.`,
    strengths:
      writingStrengths.length > 0
        ? writingStrengths
        : scoresBySkill.writing >= 60
        ? [`Achieved ${scoresBySkill.writing}% across the ${attempt.level} writing task rubric.`]
        : ['Submitted a draft addressing the exam scenario.'],
    weaknesses: extractRubricWeaknesses(attempt, 'writing'),
    corrections: writingCorrectionItems.slice(0, 6),
    suggestions:
      writingSuggestions.length > 0
        ? writingSuggestions
        : [
            attempt.languageId === 'german'
              ? `Check every bullet requirement, keep formal/informal register consistent (Sie vs. du), and double-check verb-final order after weil/obwohl/dass.`
              : `Address every prompt bullet explicitly, organize into clear paragraphs, and upgrade repeated basic verbs with ${attempt.level} collocations.`,
            'Leave 3 minutes at the end to proofread verb tense agreement, articles/cases, and punctuation.',
          ],
    upgradedVersion: writingUpgraded || undefined,
    aiAnalyzed: writingAIAnalyzed,
  };

  // Speaking insight
  const speakingStrengths = speakingEval?.strengths.slice(0, 4) || [];
  const speakingRawNotes = speakingEval?.corrections.slice(0, 5) || (attempt.speakingNotes || []).slice(0, 5);
  const speakingCorrectionItems: ExamCorrectionItem[] =
    speakingEval?.correctionItems && speakingEval.correctionItems.length > 0
      ? speakingEval.correctionItems.map((ci) => ({ ...ci, sectionTag: ci.sectionTag || 'Speaking' }))
      : speakingRawNotes.map((n) => parseInlineCorrectionFromNote(n, 'Speaking'));
  const speakingSuggestions = speakingEval?.suggestions?.slice(0, 4) || [];
  const speakingAIAnalyzed = speakingEval?.source === 'ai';

  const speakingInsight: ExamSkillInsight = {
    skill: 'speaking',
    cefrEstimate: speakingEval?.cefrEstimate || estimateCefrFromScore(attempt.level, scoresBySkill.speaking),
    summary:
      speakingEval?.examinerSummary ||
      attempt.skills.speaking?.feedback ||
      `Scored ${scoresBySkill.speaking}% on ${attempt.level} Speaking.`,
    strengths:
      speakingStrengths.length > 0
        ? speakingStrengths
        : scoresBySkill.speaking >= 60
        ? [`Met the ${attempt.level} speaking benchmark (${scoresBySkill.speaking}%).`]
        : ['Completed oral exam practice under timed speaking constraints.'],
    weaknesses: extractRubricWeaknesses(attempt, 'speaking'),
    corrections: speakingCorrectionItems.slice(0, 6),
    suggestions:
      speakingSuggestions.length > 0
        ? speakingSuggestions
        : [
            'Use a 3-beat oral frame on every cue card: direct opinion → concrete personal example → balanced contrast/conclusion.',
            'Record a 60-second answer to Part 2 and compare your phrasing aloud against the official model script.',
          ],
    upgradedVersion: speakingEval?.upgradedVersion || undefined,
    aiAnalyzed: speakingAIAnalyzed,
  };

  const anyAI = writingAIAnalyzed || speakingAIAnalyzed;
  const providerLabel =
    writingEvals.find((e) => e.source === 'ai')?.providerLabel ||
    (speakingAIAnalyzed ? speakingEval?.providerLabel : undefined) ||
    'Built-in 4-Skill Diagnostic Engine';

  const studyPlan: ExamStudyPlanItem[] = [
    {
      priority: 1,
      skill: prioritySkill,
      title: `Close Your Biggest Gap: ${prioritySkill.toUpperCase()} (${scoresBySkill[prioritySkill]}%)`,
      action:
        prioritySkill === 'reading'
          ? 'Review every missed Reading item below, highlight the exact evidence sentence, and drill 1 timed passage.'
          : prioritySkill === 'listening'
          ? 'Replay the missed multi-accent audio tracks without looking at the script, then shadow-read the dialogue.'
          : prioritySkill === 'writing'
          ? 'Rewrite your weakest writing task applying every correction note and compare side-by-side with the upgraded version.'
          : 'Re-deliver Speaking Part 2 aloud using 3 structured connectors and check fluency against the model response.',
      targetMinutes: 20,
    },
    {
      priority: 2,
      skill: sortedSkills[2],
      title: `Strengthen Secondary Skill: ${sortedSkills[2].toUpperCase()} (${scoresBySkill[sortedSkills[2]]}%)`,
      action: `Run a focused ${attempt.level} ${langName} ${sortedSkills[2]} coaching session in the AI Coach Studio to build consistency above 80%.`,
      targetMinutes: 15,
    },
    {
      priority: 3,
      skill: strongestSkill,
      title: `Maintain Top Strength: ${strongestSkill.toUpperCase()} (${scoresBySkill[strongestSkill]}%)`,
      action: `Keep your momentum sharp with a quick 10-minute ${attempt.level} warm-up before your next full simulated exam.`,
      targetMinutes: 10,
    },
  ];

  const failedSkills = ALL_SKILLS.filter((sk) => !attempt.skills[sk]?.passed);
  const readinessVerdict = attempt.passed
    ? `Certification Ready at ${attempt.level} (${attempt.overallScore}%)`
    : failedSkills.length > 0
    ? `Targeted Remediation Needed in ${failedSkills.map((s) => s.toUpperCase()).join(' & ')}`
    : `Approaching ${attempt.level} Pass Threshold (${attempt.overallScore}%)`;

  const overallSummary = attempt.passed
    ? `You passed ${attempt.examTitle} with ${attempt.overallScore}%. Your strongest skill was ${strongestSkill} (${scoresBySkill[strongestSkill]}%), while ${prioritySkill} (${scoresBySkill[prioritySkill]}%) offers the highest upside for achieving Distinction.`
    : `You scored ${attempt.overallScore}% on ${attempt.examTitle}. Focus first on raising ${prioritySkill} (${scoresBySkill[prioritySkill]}%) above the pass mark while maintaining your ${strongestSkill} strength (${scoresBySkill[strongestSkill]}%).`;

  return {
    generatedAt: new Date().toISOString(),
    source: anyAI ? 'ai' : 'offline-rubric',
    providerLabel,
    overallSummary,
    readinessVerdict,
    strongestSkill,
    prioritySkill,
    skillInsights: {
      reading: readingInsight,
      listening: listeningInsight,
      writing: writingInsight,
      speaking: speakingInsight,
    },
    studyPlan,
  };
}

function buildCompactDiagnosticContext(exam: MockExam | null | undefined, attempt: ExamAttemptRecord, base: ExamAIAssessment): string {
  const reviews = attempt.questionReviews || [];
  const missedRead = reviews.filter((r) => r.skill === 'reading' && !r.isCorrect).slice(0, 6);
  const missedListen = reviews.filter((r) => r.skill === 'listening' && !r.isCorrect).slice(0, 6);
  const readParts = exam ? getExamReadingParts(exam) : [];
  const listenTracks = exam ? getExamListeningTracks(exam) : [];

  const lines: string[] = [
    `Exam: ${attempt.examTitle} | Certificate: ${attempt.alignedCertificate} | Language: ${attempt.languageId} | Level: ${attempt.level} | Mode: ${attempt.mode}`,
    `Overall: ${attempt.overallScore}% (${attempt.passed ? 'PASSED' : 'NOT PASSED'}) | Grade: ${attempt.officialGradeLabel || 'N/A'}`,
    `Scores: Reading=${attempt.skills.reading?.score ?? 0}% (${attempt.skills.reading?.feedback || ''}), Listening=${attempt.skills.listening?.score ?? 0}% (${attempt.skills.listening?.feedback || ''}), Writing=${attempt.skills.writing?.score ?? 0}% (${attempt.skills.writing?.feedback || ''}), Speaking=${attempt.skills.speaking?.score ?? 0}% (${attempt.skills.speaking?.feedback || ''})`,
  ];

  if (missedRead.length > 0) {
    lines.push('\nMISSED READING QUESTIONS:');
    missedRead.forEach((m) => {
      const idx = Number(m.sectionTag.replace(/\D/g, '')) - 1;
      const fmt = readParts[idx]?.format ? ` (${readParts[idx].format})` : '';
      lines.push(
        `- [${m.sectionTag}${fmt}] Q: ${m.prompt} | Candidate chose: "${m.chosenOption || 'blank'}" | Correct: "${m.correctOption}" | Key: ${m.explanation}`
      );
    });
  } else {
    lines.push('\nREADING: No missed items logged (either perfect score or legacy pre-capture attempt).');
  }

  if (missedListen.length > 0) {
    lines.push('\nMISSED LISTENING QUESTIONS:');
    missedListen.forEach((m) => {
      const idx = Number(m.sectionTag.replace(/\D/g, '')) - 1;
      const tr = listenTracks[idx];
      const trap = tr ? ` | Accent: ${tr.accentCode || 'std'} | Trap: ${tr.hearingFocusTrap}` : '';
      lines.push(
        `- [${m.sectionTag}${trap}] Q: ${m.prompt} | Candidate chose: "${m.chosenOption || 'blank'}" | Correct: "${m.correctOption}" | Key: ${m.explanation}`
      );
    });
  } else {
    lines.push('\nLISTENING: No missed items logged (either perfect score or legacy pre-capture attempt).');
  }

  const writingExcerpt = (attempt.writingSubmission || '').trim().slice(0, 750);
  if (writingExcerpt) {
    lines.push(`\nWRITING SUBMISSION EXCERPT:\n${writingExcerpt}`);
  }
  if (base.skillInsights.writing.corrections.length > 0) {
    lines.push(
      `WRITING CORRECTIONS FOUND: ${base.skillInsights.writing.corrections
        .slice(0, 3)
        .map((c) => `${c.original ? `"${c.original}" -> ` : ''}"${c.corrected}" (${c.explanation})`)
        .join('; ')}`
    );
  }

  const speakingExcerpt = (attempt.speakingTranscript || '').trim().slice(0, 750);
  if (speakingExcerpt) {
    lines.push(`\nSPEAKING TRANSCRIPT EXCERPT:\n${speakingExcerpt}`);
  }
  if (base.skillInsights.speaking.corrections.length > 0) {
    lines.push(
      `SPEAKING CORRECTIONS FOUND: ${base.skillInsights.speaking.corrections
        .slice(0, 3)
        .map((c) => `${c.original ? `"${c.original}" -> ` : ''}"${c.corrected}" (${c.explanation})`)
        .join('; ')}`
    );
  }

  return lines.join('\n');
}

/**
 * Runs a comprehensive 4-skill AI Exam Assessment using the user's configured AI provider
 * (Ollama, LM Studio, OpenAI, Gemini, OpenRouter, Custom).
 * - Preserves already-evaluated Writing & Speaking AI feedback when called live on exam submission.
 * - Also supports retroactive deep analysis of any past exam from Progress & History!
 * - Always falls back gracefully to deterministic 4-skill diagnostics if AI is off or fails.
 */
export async function assessFullExamWithAIOrFallback(params: {
  config: AIProviderConfig;
  exam?: MockExam | null;
  attempt: ExamAttemptRecord;
  writingEvals?: AIEvaluationResult[];
  speakingEval?: AIEvaluationResult | null;
  fetchImpl?: typeof fetch;
}): Promise<ExamAIAssessment> {
  const { config, exam, attempt, fetchImpl } = params;
  let writingEvals = params.writingEvals ? [...params.writingEvals] : [];
  let speakingEval = params.speakingEval ?? null;

  // If invoked retroactively from Past Exam Dossier (no live writingEvals/speakingEval passed) and AI is ready,
  // run deep Writing & Speaking evaluation on the saved submissions so they get real inline corrections & rewrites!
  if (isAIConfigReady(config)) {
    const writingText = (attempt.writingSubmission || '').trim();
    const speakingText = (attempt.speakingTranscript || '').trim();
    const writingTasks = exam ? getExamWritingTasks(exam) : [];
    const speakingParts = exam ? getExamSpeakingParts(exam) : [];

    const retroJobs: Promise<void>[] = [];
    if (writingEvals.length === 0 && writingText && writingText !== '(blank)') {
      retroJobs.push(
        evaluateWithAIOrFallback({
          config,
          text: writingText,
          languageId: attempt.languageId,
          level: attempt.level,
          skill: 'writing',
          taskPrompt:
            writingTasks.length > 0
              ? writingTasks.map((t, i) => `Task ${i + 1}: ${t.scenario}`).join('\n')
              : `${attempt.examTitle} (${attempt.level}) Writing section`,
          minWords: writingTasks.reduce((s, t) => s + t.minWords, 0) || 60,
          expectedKeywords: writingTasks.flatMap((t) => t.keyRubricKeywords),
          fetchImpl,
        }).then((res) => {
          writingEvals = [res];
        })
      );
    }

    if (!speakingEval && speakingText && speakingText !== '(no response)') {
      retroJobs.push(
        evaluateWithAIOrFallback({
          config,
          text: speakingText,
          languageId: attempt.languageId,
          level: attempt.level,
          skill: 'speaking',
          taskPrompt:
            speakingParts.length > 0
              ? speakingParts.map((p, i) => `Part ${i + 1}: ${p.instruction}`).join('\n')
              : `${attempt.examTitle} (${attempt.level}) Speaking section`,
          minWords: 45,
          expectedKeywords: speakingParts.flatMap((p) => p.keyRubricKeywords),
          fetchImpl,
        }).then((res) => {
          speakingEval = res;
        })
      );
    }

    if (retroJobs.length > 0) {
      await Promise.all(retroJobs);
    }
  }

  const base = buildOfflineExamAssessment({ exam, attempt, writingEvals, speakingEval });

  if (!isAIConfigReady(config)) {
    return base;
  }

  const langName = attempt.languageId === 'german' ? 'German' : 'English';
  const examBoard =
    attempt.languageId === 'german'
      ? 'Goethe-Zertifikat / telc / TestDaF'
      : 'Cambridge English / IELTS / TOEFL';

  const systemPrompt = `You are a senior certified ${examBoard} Chief Examiner analyzing a candidate's full 4-skill ${langName} ${attempt.level} simulated exam.
Give concrete, encouraging, evidence-based diagnostics grounded ONLY in the candidate's actual submitted results below.
Return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "overallSummary": "<2-3 sentences diagnosing overall 4-skill readiness and main bottleneck>",
  "readinessVerdict": "<short verdict badge e.g. Ready for Official B1 or Needs Listening & Writing Polish>",
  "reading": {
    "cefrEstimate": "<A1|A2|B1|B2|C1|C2>",
    "summary": "<2 sentences analyzing reading accuracy & error patterns>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<specific pattern from missed items>"],
    "corrections": [{"sectionTag": "Reading P1", "original": "<what candidate misread/chose>", "corrected": "<correct answer/evidence>", "explanation": "<why correct answer wins & trap to avoid>"}],
    "suggestions": ["<targeted reading drill 1>", "<drill 2>"]
  },
  "listening": {
    "cefrEstimate": "<A1|A2|B1|B2|C1|C2>",
    "summary": "<2 sentences analyzing listening comprehension, accents & traps>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<specific accent/trap/pattern missed>"],
    "corrections": [{"sectionTag": "Listening T1", "original": "<what candidate chose>", "corrected": "<correct spoken detail>", "explanation": "<spoken cue or distractor trap explained>"}],
    "suggestions": ["<targeted listening/shadowing tip 1>", "<tip 2>"]
  },
  "writing": {
    "summary": "<2 sentences synthesizing writing task achievement, grammar & register>",
    "strengths": ["<strength>"],
    "weaknesses": ["<key recurring error pattern>"],
    "corrections": [{"sectionTag": "Writing", "original": "<phrase from candidate>", "corrected": "<corrected natural phrase>", "explanation": "<rule>"}],
    "suggestions": ["<targeted writing fix 1>", "<fix 2>"]
  },
  "speaking": {
    "summary": "<2 sentences synthesizing oral fluency, structure & lexis>",
    "strengths": ["<strength>"],
    "weaknesses": ["<key oral gap>"],
    "corrections": [{"sectionTag": "Speaking", "original": "<phrase from transcript>", "corrected": "<more natural spoken phrase>", "explanation": "<why better>"}],
    "suggestions": ["<targeted speaking drill 1>", "<drill 2>"]
  },
  "studyPlan": [
    {"priority": 1, "skill": "reading|listening|writing|speaking", "title": "<short focus title>", "action": "<concrete exercise tailored to this attempt>", "targetMinutes": 20}
  ]
}`;

  try {
    const raw = await callAIProvider(
      config,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildCompactDiagnosticContext(exam, attempt, base) },
      ],
      fetchImpl
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return base;
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const providerLabel = `${AI_PROVIDER_PRESETS[config.provider].label} (${config.model})`;

    const mergeSkill = (sk: SkillType): ExamSkillInsight => {
      const fallback = base.skillInsights[sk];
      const rawObj = parsed[sk];
      if (!rawObj || typeof rawObj !== 'object') return fallback;
      const obj = rawObj as Record<string, unknown>;

      const aiSummary = typeof obj.summary === 'string' && obj.summary.trim() ? obj.summary.trim() : fallback.summary;
      const aiStrengths = cleanStrings(obj.strengths, 4);
      const aiWeaknesses = cleanStrings(obj.weaknesses, 4);
      const aiCorrections = cleanCorrections(obj.corrections, 6);
      const aiSuggestions = cleanStrings(obj.suggestions, 4);

      // For Writing & Speaking, preserve existing granular AI corrections & upgradedVersion if richer
      const combinedCorrections =
        (sk === 'writing' || sk === 'speaking') && fallback.aiAnalyzed && fallback.corrections.length > 0
          ? fallback.corrections
          : aiCorrections.length > 0
          ? aiCorrections
          : fallback.corrections;

      return {
        skill: sk,
        cefrEstimate: clampCefr(obj.cefrEstimate, fallback.cefrEstimate || attempt.level),
        summary: aiSummary,
        strengths: aiStrengths.length > 0 ? aiStrengths : fallback.strengths,
        weaknesses: aiWeaknesses.length > 0 ? aiWeaknesses : fallback.weaknesses,
        corrections: combinedCorrections,
        suggestions: aiSuggestions.length > 0 ? aiSuggestions : fallback.suggestions,
        upgradedVersion: fallback.upgradedVersion,
        aiAnalyzed: true,
      };
    };

    const rawPlan = Array.isArray(parsed.studyPlan) ? parsed.studyPlan : [];
    const parsedPlan: ExamStudyPlanItem[] = rawPlan
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, idx) => {
        const rawSkill = typeof item.skill === 'string' ? item.skill.toLowerCase().trim() : '';
        const skill: SkillType = ALL_SKILLS.includes(rawSkill as SkillType)
          ? (rawSkill as SkillType)
          : base.prioritySkill;
        const mins = Number(item.targetMinutes);
        return {
          priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : idx + 1,
          skill,
          title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Focus on ${skill}`,
          action: typeof item.action === 'string' ? item.action.trim() : '',
          targetMinutes: Number.isFinite(mins) ? Math.max(5, Math.min(90, Math.round(mins))) : 15,
        };
      })
      .filter((item) => item.action.length > 0)
      .slice(0, 5);

    return {
      generatedAt: new Date().toISOString(),
      source: 'ai',
      providerLabel,
      overallSummary:
        typeof parsed.overallSummary === 'string' && parsed.overallSummary.trim()
          ? parsed.overallSummary.trim()
          : base.overallSummary,
      readinessVerdict:
        typeof parsed.readinessVerdict === 'string' && parsed.readinessVerdict.trim()
          ? parsed.readinessVerdict.trim()
          : base.readinessVerdict,
      strongestSkill: base.strongestSkill,
      prioritySkill: base.prioritySkill,
      skillInsights: {
        reading: mergeSkill('reading'),
        listening: mergeSkill('listening'),
        writing: mergeSkill('writing'),
        speaking: mergeSkill('speaking'),
      },
      studyPlan: parsedPlan.length > 0 ? parsedPlan : base.studyPlan,
    };
  } catch {
    return base;
  }
}

/**
 * Generates a rich AI Coach Studio seed prompt tailored directly to a skill's
 * weaknesses & corrections from a completed simulated exam.
 */
export function buildCoachSeedFromAssessment(attempt: ExamAttemptRecord, skill: SkillType): string {
  const insight = attempt.aiAssessment?.skillInsights[skill];
  const score = attempt.skills[skill]?.score ?? 0;
  const weaknessLine = insight?.weaknesses?.slice(0, 2).join('; ');
  const correctionLine = insight?.corrections
    ?.slice(0, 2)
    .map((c) => (c.original ? `${c.original} → ${c.corrected}` : c.corrected))
    .join('; ');

  const details = [
    weaknessLine ? `Key weaknesses: ${weaknessLine}.` : '',
    correctionLine ? `Recent corrections to drill: ${correctionLine}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `I just scored ${score}% in ${attempt.level} ${skill} on "${attempt.examTitle}". ${details} Please give me a focused 10-minute targeted practice drill and check my responses step by step.`;
}

// ============================================================
// MULTI-EXAM HISTORY READINESS ADVISOR (REAL EXAM vs MORE PRACTICE)
// ============================================================

function computeTrend(chronologicalScores: number[]): ScoreTrendDirection {
  if (chronologicalScores.length < 2) return 'insufficient-data';
  const first = chronologicalScores[0];
  const latest = chronologicalScores[chronologicalScores.length - 1];
  const delta = latest - first;
  if (delta >= 5) return 'improving';
  if (delta <= -5) return 'declining';
  return 'steady';
}

function classifySkillStatus(avg: number, latest: number): SkillReadinessStatus {
  if (avg >= 72 && latest >= 68) return 'ready';
  if (avg >= 60 || latest >= 65) return 'borderline';
  return 'needs-work';
}

/**
 * Deterministic multi-attempt exam readiness report computed from the learner's recorded
 * simulated exam history (averages, trajectory, strict-mode proof, modular 4-skill pass reliability).
 */
export function buildOfflineReadinessReport(params: {
  attempts: ExamAttemptRecord[];
  languageId?: string;
  targetLevel?: CEFRLevel;
}): ExamHistoryReadinessReport | null {
  const { attempts } = params;
  if (!attempts || attempts.length === 0) return null;

  // Determine target language & CEFR level (default to most recent attempt in list)
  const sortedNewestFirst = [...attempts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const chosenLang =
    params.languageId && params.languageId !== 'all'
      ? params.languageId
      : sortedNewestFirst[0].languageId;

  const langPool = sortedNewestFirst.filter((a) => a.languageId === chosenLang);
  const effectivePool = langPool.length > 0 ? langPool : sortedNewestFirst;
  const chosenLevel = params.targetLevel || effectivePool[0].level;
  const levelPool = effectivePool.filter((a) => a.level === chosenLevel);
  const analyzed = (levelPool.length > 0 ? levelPool : effectivePool).slice(0, 12);
  const chronological = [...analyzed].reverse(); // oldest -> newest

  const latestAttempt = analyzed[0];
  const targetCertificate =
    latestAttempt.alignedCertificate ||
    (chosenLang === 'german'
      ? `Goethe-Zertifikat ${chosenLevel}`
      : `Cambridge English ${chosenLevel}`);

  const passCount = analyzed.filter((a) => a.passed).length;
  const passRatePercent = Math.round((passCount / analyzed.length) * 100);
  const strictAttempts = analyzed.filter((a) => a.mode === 'strict');
  const strictPassCount = strictAttempts.filter((a) => a.passed).length;
  const overallAvg = Math.round(
    analyzed.reduce((sum, a) => sum + a.overallScore, 0) / analyzed.length
  );
  const latestOverall = latestAttempt.overallScore;
  const recentTrend = computeTrend(chronological.map((a) => a.overallScore));

  // Per-skill readiness stats
  const skillReadiness = {} as Record<SkillType, HistorySkillReadiness>;
  for (const sk of ALL_SKILLS) {
    const scores = chronological
      .map((a) => a.skills[sk]?.score)
      .filter((n): n is number => typeof n === 'number');
    const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const latest = scores.length > 0 ? scores[scores.length - 1] : 0;
    const trend = computeTrend(scores);
    const status = classifySkillStatus(avg, latest);
    const note =
      status === 'ready'
        ? `Averaging ${avg}% (latest ${latest}%) — consistently clear of exam pass threshold.`
        : status === 'borderline'
        ? `Averaging ${avg}% (latest ${latest}%) — close to threshold; add 2–3 targeted drills for safety margin.`
        : `Averaging ${avg}% (latest ${latest}%) — below safe certification threshold; prioritize remediation before booking.`;

    skillReadiness[sk] = {
      skill: sk,
      averageScore: avg,
      latestScore: latest,
      trend,
      status,
      note,
    };
  }

  const prioritySkill = [...ALL_SKILLS].sort(
    (a, b) => skillReadiness[a].averageScore - skillReadiness[b].averageScore
  )[0];
  const strongestSkill = [...ALL_SKILLS].sort(
    (a, b) => skillReadiness[b].averageScore - skillReadiness[a].averageScore
  )[0];

  const allSkillsReady = ALL_SKILLS.every((sk) => skillReadiness[sk].status === 'ready');
  const anySkillNeedsWork = ALL_SKILLS.some((sk) => skillReadiness[sk].status === 'needs-work');
  const allSkillsPassingLatest = ALL_SKILLS.every((sk) => Boolean(latestAttempt.skills[sk]?.passed));

  // Weighted readiness score (0..100)
  const consistencyBonus = analyzed.length >= 2 && passRatePercent >= 67 ? 6 : 0;
  const strictProofBonus = strictPassCount >= 1 ? 5 : -4;
  const trendAdjustment = recentTrend === 'improving' ? 4 : recentTrend === 'declining' ? -5 : 0;
  const minSkillAvg = Math.min(...ALL_SKILLS.map((sk) => skillReadiness[sk].averageScore));
  const rawReadiness =
    overallAvg * 0.55 +
    minSkillAvg * 0.35 +
    passRatePercent * 0.1 +
    consistencyBonus +
    strictProofBonus +
    trendAdjustment;
  const readinessScore = Math.max(5, Math.min(99, Math.round(rawReadiness)));

  // Verdict decision
  let verdict: ExamReadinessVerdict;
  if (
    latestAttempt.passed &&
    allSkillsPassingLatest &&
    allSkillsReady &&
    overallAvg >= 74 &&
    strictPassCount >= 1
  ) {
    verdict = 'ready';
  } else if (
    !anySkillNeedsWork &&
    overallAvg >= 64 &&
    (passCount >= 1 || latestOverall >= 66)
  ) {
    verdict = 'almost-ready';
  } else {
    verdict = 'needs-practice';
  }

  // Confidence rating based on sample size & strict exam exposure
  const confidence: ReadinessConfidence =
    analyzed.length >= 3 && strictAttempts.length >= 2
      ? 'high'
      : analyzed.length >= 2 || strictAttempts.length >= 1
      ? 'medium'
      : 'low';

  const strengths: string[] = [
    `Strongest skill across history: ${strongestSkill.toUpperCase()} averaging ${skillReadiness[strongestSkill].averageScore}% (latest ${skillReadiness[strongestSkill].latestScore}%).`,
  ];
  if (passCount > 0) {
    strengths.push(
      `Passed ${passCount} of ${analyzed.length} simulated ${chosenLevel} exam${analyzed.length === 1 ? '' : 's'} (${passRatePercent}% pass rate).`
    );
  }
  if (recentTrend === 'improving') {
    strengths.push(
      `Upward momentum: overall score climbed from ${chronological[0].overallScore}% to ${latestOverall}%.`
    );
  }
  if (strictPassCount >= 1) {
    strengths.push(`Proven performance under official Strict timed exam pressure (${strictPassCount} strict pass${strictPassCount === 1 ? '' : 'es'}).`);
  }

  const blockingRisks: string[] = [];
  for (const sk of ALL_SKILLS) {
    if (skillReadiness[sk].status === 'needs-work') {
      blockingRisks.push(
        `${sk.toUpperCase()} averages ${skillReadiness[sk].averageScore}% (latest ${skillReadiness[sk].latestScore}%), creating modular exam fail risk.`
      );
    } else if (skillReadiness[sk].status === 'borderline') {
      blockingRisks.push(
        `${sk.toUpperCase()} is borderline (${skillReadiness[sk].averageScore}% avg) — test-day pressure could dip it below pass mark.`
      );
    }
  }
  if (strictAttempts.length === 0) {
    blockingRisks.push(
      'No Strict-mode timed attempts recorded yet — complete at least 1 Strict simulation before paying official registration fees.'
    );
  }
  if (analyzed.length < 2) {
    blockingRisks.push(
      'Only 1 attempt recorded at this level — run at least 1 fresh unseen AI exam to confirm score consistency.'
    );
  }
  if (recentTrend === 'declining') {
    blockingRisks.push(
      `Recent score dipped from ${chronological[0].overallScore}% to ${latestOverall}% — stabilize before booking.`
    );
  }

  const headline =
    verdict === 'ready'
      ? `Ready to Take the Real ${targetCertificate} Exam`
      : verdict === 'almost-ready'
      ? `Almost Ready for ${targetCertificate} — Short Targeted Polish Needed`
      : `More Practice Recommended Before Booking ${targetCertificate}`;

  const rationale =
    verdict === 'ready'
      ? `Across ${analyzed.length} ${chosenLevel} simulation${analyzed.length === 1 ? '' : 's'} (avg ${overallAvg}%, latest ${latestOverall}%), all 4 skills are above the safe exam margin with Strict timed proof. You are ready to register for the official ${targetCertificate}.`
      : verdict === 'almost-ready'
      ? `You are close to official ${chosenLevel} readiness (${overallAvg}% average across ${analyzed.length} attempt${analyzed.length === 1 ? '' : 's'}), but ${prioritySkill} (${skillReadiness[prioritySkill].averageScore}% avg) or limited Strict-mode proof still leaves narrow margin for test-day nerves.`
      : `Across ${analyzed.length} ${chosenLevel} attempt${analyzed.length === 1 ? '' : 's'} (${overallAvg}% average, ${passRatePercent}% pass rate), ${prioritySkill} (${skillReadiness[prioritySkill].averageScore}% avg) needs focused skill-building before risking official exam fees.`;

  const estimatedPrepTime =
    verdict === 'ready'
      ? 'Ready to book now (1 light Strict dress rehearsal recommended)'
      : verdict === 'almost-ready'
      ? '1–2 weeks of targeted daily practice (20–30 min/day)'
      : '3–4 weeks of structured 4-skill practice before booking';

  const nextSteps: string[] =
    verdict === 'ready'
      ? [
          `Book your official ${targetCertificate} test slot while your momentum is strong.`,
          `Do one final Strict-mode unseen AI exam 48 hours before test day to keep ${prioritySkill} sharp.`,
          'Review your saved Past Exam Dossiers for recurring small grammar or timing habits.',
        ]
      : [
          `Focus 60% of your next week on ${prioritySkill.toUpperCase()} (${skillReadiness[prioritySkill].averageScore}% avg) using targeted AI Coach drills.`,
          strictAttempts.length === 0
            ? `Complete a full Strict-mode ${chosenLevel} simulation (official clock & locked transcripts) to test stamina.`
            : `Generate a fresh unseen ${chosenLevel} AI exam and aim for ≥ 75% in all 4 skills before booking.`,
          `Review every missed question and inline correction in your recent ${chosenLevel} exam dossiers.`,
        ];

  return {
    id: `readiness-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    generatedAt: new Date().toISOString(),
    source: 'offline-rubric',
    providerLabel: 'Built-in Exam Readiness Analyzer',
    languageId: chosenLang,
    targetLevel: chosenLevel,
    targetCertificate,
    attemptsAnalyzed: analyzed.length,
    strictAttemptsCount: strictAttempts.length,
    passRatePercent,
    recentTrend,
    verdict,
    readinessScore,
    confidence,
    headline,
    rationale,
    estimatedPrepTime,
    prioritySkill,
    strengths,
    blockingRisks,
    nextSteps,
    skillReadiness,
  };
}

function buildCompactHistoryDigest(
  attempts: ExamAttemptRecord[],
  baseline: ExamHistoryReadinessReport
): string {
  const matching = attempts
    .filter((a) => a.languageId === baseline.languageId && a.level === baseline.targetLevel)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-10);

  const used = matching.length > 0 ? matching : attempts.slice(0, 10).reverse();

  const lines: string[] = [
    `Target Official Exam: ${baseline.targetCertificate} (${baseline.languageId.toUpperCase()} CEFR ${baseline.targetLevel})`,
    `Aggregate Stats: ${baseline.attemptsAnalyzed} attempts (${baseline.strictAttemptsCount} Strict mode), Pass Rate=${baseline.passRatePercent}%, Overall Trend=${baseline.recentTrend}, Baseline Readiness=${baseline.readinessScore}/100`,
    `Per-Skill Averages: Reading=${baseline.skillReadiness.reading.averageScore}% (latest ${baseline.skillReadiness.reading.latestScore}%), Listening=${baseline.skillReadiness.listening.averageScore}% (latest ${baseline.skillReadiness.listening.latestScore}%), Writing=${baseline.skillReadiness.writing.averageScore}% (latest ${baseline.skillReadiness.writing.latestScore}%), Speaking=${baseline.skillReadiness.speaking.averageScore}% (latest ${baseline.skillReadiness.speaking.latestScore}%)`,
    '\nCHRONOLOGICAL ATTEMPTS (oldest -> newest):',
  ];

  // Collect recurring missed section tags & weaknesses across history
  const missedTagCounts: Record<string, number> = {};
  const recurringNotes: string[] = [];

  used.forEach((a, idx) => {
    const dateShort = a.timestamp.slice(0, 10);
    const r = a.skills.reading?.score ?? 0;
    const l = a.skills.listening?.score ?? 0;
    const w = a.skills.writing?.score ?? 0;
    const s = a.skills.speaking?.score ?? 0;
    lines.push(
      `${idx + 1}. [${dateShort}] ${a.mode.toUpperCase()} | Overall ${a.overallScore}% (${a.passed ? 'PASS' : 'FAIL'}) | R:${r}% L:${l}% W:${w}% S:${s}% | Time:${Math.round(a.durationUsedSeconds / 60)}m | ${a.officialGradeLabel || ''}`
    );

    (a.questionReviews || []).forEach((q) => {
      if (!q.isCorrect) {
        missedTagCounts[q.sectionTag] = (missedTagCounts[q.sectionTag] || 0) + 1;
      }
    });
    if (a.aiAssessment) {
      ALL_SKILLS.forEach((sk) => {
        const ws = a.aiAssessment?.skillInsights[sk]?.weaknesses || [];
        ws.slice(0, 1).forEach((wNote) => recurringNotes.push(`[${sk}] ${wNote}`));
      });
    } else {
      (a.writingNotes || []).slice(0, 1).forEach((n) => recurringNotes.push(`[writing] ${n}`));
      (a.speakingNotes || []).slice(0, 1).forEach((n) => recurringNotes.push(`[speaking] ${n}`));
    }
  });

  const topMissedTags = Object.entries(missedTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, cnt]) => `${tag} (${cnt} missed)`);
  if (topMissedTags.length > 0) {
    lines.push(`\nMOST FREQUENT MISSED SECTIONS: ${topMissedTags.join(', ')}`);
  }
  if (recurringNotes.length > 0) {
    lines.push(`\nRECORDED WEAKNESSES & EXAMINER NOTES:\n- ${recurringNotes.slice(0, 8).join('\n- ')}`);
  }

  return lines.join('\n');
}

/**
 * Analyzes the learner's entire simulated exam history using the configured AI provider
 * to advise whether they are ready to book the real official certification exam or need more practice.
 * Falls back gracefully to deterministic statistical readiness analysis if AI is off or fails.
 */
export async function analyzeExamHistoryReadinessWithAIOrFallback(params: {
  config: AIProviderConfig;
  attempts: ExamAttemptRecord[];
  languageId?: string;
  targetLevel?: CEFRLevel;
  fetchImpl?: typeof fetch;
}): Promise<ExamHistoryReadinessReport | null> {
  const baseline = buildOfflineReadinessReport({
    attempts: params.attempts,
    languageId: params.languageId,
    targetLevel: params.targetLevel,
  });
  if (!baseline) return null;

  if (!isAIConfigReady(params.config)) {
    return baseline;
  }

  const langName = baseline.languageId === 'german' ? 'German' : 'English';
  const examBoard =
    baseline.languageId === 'german'
      ? 'Goethe-Zertifikat / telc / TestDaF'
      : 'Cambridge English / IELTS / TOEFL';

  const systemPrompt = `You are a candid, data-driven Senior ${examBoard} Certification Advisor evaluating a learner's simulated ${langName} ${baseline.targetLevel} exam history.
Your job: Tell the learner clearly whether they are READY to book and pass the REAL official exam now, ALMOST READY (needs short targeted polish), or NEED MORE PRACTICE before spending money on official registration.
Consider: consistency across attempts, score trend, modular pass risk (all 4 skills must pass reliably), and Strict timed exam proof vs. Practice mode.
Return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "verdict": "ready|almost-ready|needs-practice",
  "readinessScore": <0-100>,
  "confidence": "high|medium|low",
  "headline": "<crisp 1-line decision telling them whether to book the real exam or keep practicing>",
  "rationale": "<2-3 sentences grounded in their exact exam history numbers, trend, and modular risks>",
  "estimatedPrepTime": "<e.g. Ready to book now | 1-2 weeks focused polish | 3-4 weeks structured practice>",
  "strengths": ["<concrete proof of readiness 1>", "<strength 2>"],
  "blockingRisks": ["<exact gap/risk before booking 1>", "<risk 2>"],
  "nextSteps": ["<prioritized concrete action 1>", "<action 2>", "<action 3>"],
  "skillNotes": {
    "reading": "<1 concise sentence diagnosing reading history>",
    "listening": "<1 concise sentence diagnosing listening history>",
    "writing": "<1 concise sentence diagnosing writing history>",
    "speaking": "<1 concise sentence diagnosing speaking history>"
  }
}`;

  try {
    const raw = await callAIProvider(
      params.config,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildCompactHistoryDigest(params.attempts, baseline) },
      ],
      params.fetchImpl
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return baseline;
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    const validVerdicts: ExamReadinessVerdict[] = ['ready', 'almost-ready', 'needs-practice'];
    const verdict: ExamReadinessVerdict =
      typeof parsed.verdict === 'string' && validVerdicts.includes(parsed.verdict as ExamReadinessVerdict)
        ? (parsed.verdict as ExamReadinessVerdict)
        : baseline.verdict;

    const validConf: ReadinessConfidence[] = ['high', 'medium', 'low'];
    const confidence: ReadinessConfidence =
      typeof parsed.confidence === 'string' && validConf.includes(parsed.confidence as ReadinessConfidence)
        ? (parsed.confidence as ReadinessConfidence)
        : baseline.confidence;

    const rawScore = Number(parsed.readinessScore);
    const readinessScore = Number.isFinite(rawScore)
      ? Math.max(5, Math.min(99, Math.round(rawScore)))
      : baseline.readinessScore;

    const rawSkillNotes =
      parsed.skillNotes && typeof parsed.skillNotes === 'object'
        ? (parsed.skillNotes as Record<string, unknown>)
        : {};

    const mergedSkills = { ...baseline.skillReadiness };
    for (const sk of ALL_SKILLS) {
      const note = rawSkillNotes[sk];
      if (typeof note === 'string' && note.trim()) {
        mergedSkills[sk] = {
          ...mergedSkills[sk],
          note: note.trim(),
        };
      }
    }

    const aiStrengths = cleanStrings(parsed.strengths, 4);
    const aiRisks = cleanStrings(parsed.blockingRisks, 4);
    const aiNextSteps = cleanStrings(parsed.nextSteps, 5);

    return {
      ...baseline,
      generatedAt: new Date().toISOString(),
      source: 'ai',
      providerLabel: `${AI_PROVIDER_PRESETS[params.config.provider].label} (${params.config.model})`,
      verdict,
      readinessScore,
      confidence,
      headline:
        typeof parsed.headline === 'string' && parsed.headline.trim()
          ? parsed.headline.trim()
          : baseline.headline,
      rationale:
        typeof parsed.rationale === 'string' && parsed.rationale.trim()
          ? parsed.rationale.trim()
          : baseline.rationale,
      estimatedPrepTime:
        typeof parsed.estimatedPrepTime === 'string' && parsed.estimatedPrepTime.trim()
          ? parsed.estimatedPrepTime.trim()
          : baseline.estimatedPrepTime,
      strengths: aiStrengths.length > 0 ? aiStrengths : baseline.strengths,
      blockingRisks: aiRisks.length > 0 ? aiRisks : baseline.blockingRisks,
      nextSteps: aiNextSteps.length > 0 ? aiNextSteps : baseline.nextSteps,
      skillReadiness: mergedSkills,
    };
  } catch {
    return baseline;
  }
}

export function buildCoachSeedFromReadinessReport(
  report: ExamHistoryReadinessReport,
  skill: SkillType = report.prioritySkill
): string {
  const skStat = report.skillReadiness[skill];
  const risks = report.blockingRisks.slice(0, 2).join('; ');
  return `I'm preparing for the real ${report.targetCertificate} (${report.targetLevel}) exam. Across ${report.attemptsAnalyzed} simulated exam(s), my ${skill} average is ${skStat.averageScore}% (latest ${skStat.latestScore}%). Readiness status: ${report.headline}. Key risks: ${risks || skStat.note}. Please build a targeted ${report.targetLevel} ${skill} practice session to get me exam-ready.`;
}
