import {
  AIEvaluationResult,
  AIProviderConfig,
  CEFRLevel,
  ExamAIAssessment,
  ExamAttemptRecord,
  ExamCorrectionItem,
  ExamQuestionReview,
  ExamSkillInsight,
  ExamStudyPlanItem,
  MockExam,
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
