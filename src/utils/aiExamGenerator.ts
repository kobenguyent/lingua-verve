import {
  AIProviderConfig,
  ExamObjectiveQuestion,
  ListeningExamTrack,
  MockExam,
  ReadingExamPart,
  SkillType,
  SpeakingExamPart,
  WritingExamTask,
} from '../types';
import { AI_PROVIDER_PRESETS, callAIProvider, isAIConfigReady } from './aiClient';

export const GENERATED_EXAMS_STORAGE_KEY = 'linguaverve_ai_generated_exams_v1';

export type SkillGenStatus = 'pending' | 'loading' | 'done' | 'fallback';

export type ExamGenerationProgress = Record<SkillType, SkillGenStatus>;

export const AI_EXAM_THEMES: Record<'german' | 'english', string[]> = {
  german: [
    'Alltag, Wohnen & Nachbarschaft in der Stadt',
    'Bahn, Nahverkehr & nachhaltige Mobilität',
    'Arbeit, Homeoffice & Bewerbungsgespräch',
    'Gesundheit, Arzttermin & Prävention',
    'Studium, Weiterbildung & lebenslanges Lernen',
    'Digitalisierung, KI & Datenschutz im Alltag',
    'Kultur, Medien & Journalismus im DACH-Raum',
    'Verbraucherrechte, Einkaufen & Reklamationen',
    'Klimaschutz, Energie & Stadtplanung',
    'Reisen, Hotellerie & Gastronomie',
    'Ehrenamt, Vereine & Gesellschaft',
    'Wirtschaft, Start-ups & Innovation',
  ],
  english: [
    'Urban Mobility, Transit & Smart Cities',
    'Remote Work, Leadership & Career Transitions',
    'Healthcare, Wellbeing & Preventive Medicine',
    'University Research, Education & Lifelong Learning',
    'Artificial Intelligence, Ethics & Digital Privacy',
    'Climate Policy, Energy & Sustainable Housing',
    'Global Journalism, Media Literacy & Culture',
    'Consumer Rights, E-Commerce & Travel Logistics',
    'Entrepreneurship, Finance & Modern Economics',
    'Community Volunteering, Arts & Heritage',
    'Food Systems, Hospitality & Regional Traditions',
    'Science Communication & Space Exploration',
  ],
};

export function pickRandomExamTheme(languageId: string, avoidThemes: string[] = []): string {
  const key = languageId === 'german' ? 'german' : 'english';
  const pool = AI_EXAM_THEMES[key];
  const avoidLower = new Set(avoidThemes.map((t) => t.toLowerCase().trim()));
  const fresh = pool.filter((t) => !avoidLower.has(t.toLowerCase()));
  const candidates = fresh.length > 0 ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

let inMemoryGeneratedExams: MockExam[] = [];

function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadGeneratedExams(): MockExam[] {
  const storage = getSafeLocalStorage();
  if (!storage) return inMemoryGeneratedExams.map((e) => repairExamClozeParts(e));
  try {
    const raw = storage.getItem(GENERATED_EXAMS_STORAGE_KEY);
    if (!raw) return inMemoryGeneratedExams.map((e) => repairExamClozeParts(e));
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryGeneratedExams = (parsed as MockExam[]).map((e) => repairExamClozeParts(e));
      return inMemoryGeneratedExams;
    }
    return inMemoryGeneratedExams;
  } catch {
    return inMemoryGeneratedExams;
  }
}

export function saveGeneratedExam(exam: MockExam): MockExam[] {
  const existing = loadGeneratedExams().filter((e) => e.id !== exam.id);
  const next = [exam, ...existing].slice(0, 24);
  inMemoryGeneratedExams = next;
  const storage = getSafeLocalStorage();
  if (storage) {
    try {
      storage.setItem(GENERATED_EXAMS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }
  return next;
}

export function deleteGeneratedExam(examId: string): MockExam[] {
  const next = loadGeneratedExams().filter((e) => e.id !== examId);
  inMemoryGeneratedExams = next;
  const storage = getSafeLocalStorage();
  if (storage) {
    try {
      storage.setItem(GENERATED_EXAMS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }
  return next;
}

/**
 * Extracts and parses a JSON object from an LLM reply (handles ```json fences and trailing commas).
 */
export function extractJsonObject<T = Record<string, unknown>>(raw: string): T | null {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Attempt minor trailing-comma cleanup
    const repaired = candidate.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(repaired) as T;
    } catch {
      return null;
    }
  }
}

function sanitizeQuestions(
  rawQuestions: unknown,
  prefix: string,
  expectedCount: number
): ExamObjectiveQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];
  const results: ExamObjectiveQuestion[] = [];
  for (let i = 0; i < rawQuestions.length && results.length < expectedCount; i++) {
    const item = rawQuestions[i] as Record<string, unknown> | null;
    if (!item || typeof item !== 'object') continue;
    const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : '';
    const options = Array.isArray(item.options)
      ? item.options.map((o) => String(o ?? '').trim()).filter(Boolean)
      : [];
    if (!prompt || options.length < 2) continue;
    const rawIdx = typeof item.correctIndex === 'number' ? Math.round(item.correctIndex) : 0;
    const correctIndex = Math.max(0, Math.min(options.length - 1, rawIdx));
    const explanation =
      typeof item.explanation === 'string' && item.explanation.trim()
        ? item.explanation.trim()
        : `Correct option: ${options[correctIndex]}.`;
    results.push({
      id: `${prefix}-q${results.length + 1}`,
      prompt,
      options,
      correctIndex,
      explanation,
    });
  }
  return results;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Guarantees that a Cloze (Sprachbausteine / Use of English) reading passage actually contains
 * visible numbered gap markers `[1]`, `[2]`, ..., `[N]` matching its questions.
 * 1. Normalizes variant LLM gap syntax (`___(1)___`, `(1)`, `{{1}}`, `[Gap 1]`, `[Lücke 1]`, `___1___`).
 * 2. Converts unnumbered blank placeholders (`___`, `____`, `[___]`, `[...]`) sequentially into missing `[n]`.
 * 3. If the LLM accidentally wrote the correct answer word directly in the text without blanking it,
 *    auto-blanks each missing question's exact answer word (in reading order, with Unicode word boundaries) into `[n]`.
 */
export function repairClozePassage(
  rawPassage: string,
  questions: ExamObjectiveQuestion[]
): { passage: string; hasAllGaps: boolean } {
  const count = questions.length;
  if (count === 0) return { passage: rawPassage, hasAllGaps: true };

  let text = rawPassage;

  // Step 1: Normalize variant numbered markers to canonical [n]
  for (let n = 1; n <= count; n++) {
    const canonical = `[${n}]`;
    if (text.includes(canonical)) continue;
    const patterns = [
      new RegExp(`_{1,}\\s*[(\\[{<]?\\s*(?:gap|lücke|luecke|blank)?\\s*#?${n}\\s*[)\\]}>]?\\s*_{0,}`, 'i'),
      new RegExp(`[\\[{<]\\s*(?:gap|lücke|luecke|blank)?\\s*#?${n}\\s*[\\]}>]`, 'i'),
      new RegExp(`\\(\\s*(?:gap|lücke|luecke|blank)?\\s*#?${n}\\s*\\)`, 'i'),
      new RegExp(`\\b(?:gap|lücke|luecke|blank)\\s*#?${n}\\b`, 'i'),
    ];
    for (const pat of patterns) {
      if (pat.test(text)) {
        text = text.replace(pat, canonical);
        break;
      }
    }
  }

  // Step 2: Convert unnumbered blank placeholders (___, [___], [...]) into missing [n] tokens
  for (let n = 1; n <= count; n++) {
    const canonical = `[${n}]`;
    if (text.includes(canonical)) continue;
    const blankPat = /\[\s*(?:_{2,}|\.{3,})\s*\]|_{3,}/;
    if (blankPat.test(text)) {
      text = text.replace(blankPat, canonical);
    }
  }

  // Step 3: Auto-blank exact correct answer words left inside the text by the LLM
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    const canonical = `[${n}]`;
    const existingIdx = text.indexOf(canonical);
    if (existingIdx !== -1) {
      cursor = existingIdx + canonical.length;
      continue;
    }
    const q = questions[i];
    const answer = (q.options[q.correctIndex] || '').trim();
    if (!answer) continue;

    const wordRegex = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(answer)}(?![\\p{L}\\p{N}])`, 'iu');
    const tail = text.slice(cursor);
    const tailMatch = wordRegex.exec(tail);
    if (tailMatch && typeof tailMatch.index === 'number') {
      const absStart = cursor + tailMatch.index;
      const absEnd = absStart + tailMatch[0].length;
      text = text.slice(0, absStart) + canonical + text.slice(absEnd);
      cursor = absStart + canonical.length;
    } else {
      const fullMatch = wordRegex.exec(text);
      if (fullMatch && typeof fullMatch.index === 'number') {
        const absStart = fullMatch.index;
        const absEnd = absStart + fullMatch[0].length;
        text = text.slice(0, absStart) + canonical + text.slice(absEnd);
      }
    }
  }

  const hasAllGaps = Array.from({ length: count }, (_, idx) => text.includes(`[${idx + 1}]`)).every(Boolean);
  return { passage: text, hasAllGaps };
}

/**
 * Repairs any cloze Reading parts in an exam (including previously saved AI exams in localStorage).
 */
export function repairExamClozeParts(exam: MockExam, fallbackBase?: MockExam): MockExam {
  const parts = exam.reading.parts;
  if (!parts || parts.length === 0) return exam;
  const baseParts = fallbackBase?.reading.parts || [];
  let changed = false;

  const repairedParts = parts.map((part, idx) => {
    if (part.format !== 'cloze') return part;
    const check = repairClozePassage(part.passage, part.questions);
    if (check.hasAllGaps) {
      if (check.passage !== part.passage) {
        changed = true;
        return { ...part, passage: check.passage };
      }
      return part;
    }
    if (baseParts[idx]) {
      changed = true;
      return baseParts[idx];
    }
    return part;
  });

  if (!changed) return exam;
  return {
    ...exam,
    reading: {
      ...exam.reading,
      parts: repairedParts,
    },
  };
}

function getTargetAccents(languageId: string, seed: number): [string, string, string] {
  if (languageId === 'german') {
    return ['de-DE', 'de-AT', 'de-CH'];
  }
  const rotating: Array<[string, string, string]> = [
    ['en-GB', 'en-AU', 'en-US'],
    ['en-GB', 'en-IE', 'en-IN'],
    ['en-US', 'en-GB', 'en-ZA'],
    ['en-GB', 'en-US', 'en-AU'],
  ];
  return rotating[seed % rotating.length];
}

function pickString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
}

function pickStringArray(val: unknown, minItems: number, fallback: string[]): string[] {
  if (!Array.isArray(val)) return fallback;
  const cleaned = val.map((x) => String(x ?? '').trim()).filter(Boolean);
  return cleaned.length >= minItems ? cleaned : fallback;
}

async function callJsonWithRetry<T>(
  config: AIProviderConfig,
  systemPrompt: string,
  userPrompt: string,
  fetchImpl: typeof fetch
): Promise<T | null> {
  const creativeConfig: AIProviderConfig = {
    ...config,
    temperature: Math.max(0.65, Math.min(0.95, config.temperature || 0.7)),
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    const extraReminder =
      attempt === 1
        ? '\nIMPORTANT: Previous reply was not valid JSON. Return ONLY raw valid JSON starting with { and ending with }. No prose, no markdown.'
        : '';
    try {
      const raw = await callAIProvider(
        creativeConfig,
        [
          { role: 'system', content: systemPrompt + extraReminder },
          { role: 'user', content: userPrompt },
        ],
        fetchImpl
      );
      const parsed = extractJsonObject<T>(raw);
      if (parsed) return parsed;
    } catch {
      if (attempt === 1) return null;
    }
  }
  return null;
}

export async function generateFreshMockExamWithAI(params: {
  config: AIProviderConfig;
  baseExam: MockExam;
  theme?: string;
  customTopic?: string;
  avoidThemes?: string[];
  onProgress?: (progress: ExamGenerationProgress) => void;
  fetchImpl?: typeof fetch;
}): Promise<{ exam: MockExam; aiSkillsCount: number; theme: string }> {
  const { config, baseExam, customTopic, avoidThemes = [], onProgress, fetchImpl = fetch } = params;

  if (!isAIConfigReady(config)) {
    throw new Error('Connect a Local (Ollama/LM Studio) or Cloud (OpenAI/Gemini/OpenRouter) AI provider first.');
  }

  const chosenTheme =
    (customTopic && customTopic.trim()) ||
    (params.theme && params.theme.trim()) ||
    pickRandomExamTheme(baseExam.languageId, avoidThemes);

  const isGerman = baseExam.languageId === 'german';
  const langName = isGerman ? 'German' : 'English';
  const seed = Math.floor(Math.random() * 9000) + 1000;
  const stamp = `${Date.now().toString(36)}-${seed}`;
  const accents = getTargetAccents(baseExam.languageId, seed);

  const avoidNote =
    avoidThemes.length > 0
      ? `Avoid reusing stories/scenarios from these previous themes: ${avoidThemes.slice(0, 5).join('; ')}.`
      : '';

  const progress: ExamGenerationProgress = {
    reading: 'pending',
    listening: 'pending',
    writing: 'pending',
    speaking: 'pending',
  };
  const emitProgress = (skill: SkillType, status: SkillGenStatus) => {
    progress[skill] = status;
    onProgress?.({ ...progress });
  };

  // --- 1. READING PROMPT (3 Parts · 9 Questions) ---
  const generateReading = async (): Promise<{ ok: boolean; parts: ReadingExamPart[] }> => {
    emitProgress('reading', 'loading');
    const clozeExample = isGerman
      ? 'Guten Tag, ich möchte [1] Montag einen Termin [2] Dr. Weber vereinbaren, [3] ich starke Kopfschmerzen habe.'
      : 'I am writing [1] confirm our meeting [2] Tuesday, [3] we need to finalize the project budget.';
    const gapWord = isGerman ? 'Lücke' : 'Gap';
    const sys = `You are a certified ${baseExam.alignedCertificate} exam author creating brand-new CEFR ${baseExam.level} ${langName} Reading exam content.
CRITICAL FOR PART 3 (format: "cloze"): The passage MUST contain the literal numbered blank markers [1], [2], and [3] IN PLACE OF the missing answer words — NEVER write the answer words inside the passage! Example Part 3 passage: "${clozeExample}".
Return ONLY valid JSON with this exact shape:
{
  "parts": [
    {
      "partLabel": "<Part 1 title in ${langName}>",
      "format": "comprehension",
      "instruction": "<brief exam instruction in ${langName}>",
      "passageTitle": "<title in ${langName}>",
      "passage": "<authentic CEFR ${baseExam.level} ${langName} passage, 85-160 words>",
      "questions": [
        {"prompt":"<question in ${langName}>","options":["A","B","C","D"],"correctIndex":0,"explanation":"<brief explanation>"},
        {"prompt":"...","options":["...","...","...","..."],"correctIndex":1,"explanation":"..."},
        {"prompt":"...","options":["...","...","...","..."],"correctIndex":2,"explanation":"..."}
      ]
    },
    {
      "partLabel": "<Part 2 title (${isGerman ? 'Richtig/Falsch' : 'True/False/Not Given'})>",
      "format": "true-false",
      "instruction": "<instruction in ${langName}>",
      "passageTitle": "<title in ${langName}>",
      "passage": "<authentic notice/article in ${langName}, 80-150 words>",
      "questions": [
        {"prompt":"<statement in ${langName}>","options":${isGerman ? '["Richtig","Falsch","Steht nicht im Text"]' : '["True","False","Not Given"]'},"correctIndex":0,"explanation":"..."},
        {"prompt":"...","options":${isGerman ? '["Richtig","Falsch","Steht nicht im Text"]' : '["True","False","Not Given"]'},"correctIndex":1,"explanation":"..."},
        {"prompt":"...","options":${isGerman ? '["Richtig","Falsch","Steht nicht im Text"]' : '["True","False","Not Given"]'},"correctIndex":2,"explanation":"..."}
      ]
    },
    {
      "partLabel": "<Part 3 title (${isGerman ? 'Sprachbausteine / Lückentext' : 'Use of English / Cloze'})>",
      "format": "cloze",
      "instruction": "<instruction in ${langName}>",
      "passageTitle": "<title in ${langName}>",
      "passage": "<70-120 word ${langName} text containing exact markers [1], [2], and [3] where words are missing>",
      "questions": [
        {"prompt":"${gapWord} [1]","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."},
        {"prompt":"${gapWord} [2]","options":["...","...","...","..."],"correctIndex":1,"explanation":"..."},
        {"prompt":"${gapWord} [3]","options":["...","...","...","..."],"correctIndex":2,"explanation":"..."}
      ]
    }
  ]
}`;
    const user = `Generate a completely fresh, original CEFR ${baseExam.level} ${langName} Reading section (3 parts, 3 questions each = 9 questions total) themed around: "${chosenTheme}". Remember: Part 3 MUST be a real cloze gap-fill text with literal [1], [2], [3] blanks replacing the 3 correct answer words. Variation seed: ${seed}. ${avoidNote} All passages, questions, and options must be strictly calibrated to CEFR ${baseExam.level} in ${langName}.`;

    const raw = await callJsonWithRetry<{ parts?: Array<Record<string, unknown>> }>(config, sys, user, fetchImpl);
    const rawParts = Array.isArray(raw?.parts) ? raw!.parts : [];
    const formats: Array<ReadingExamPart['format']> = ['comprehension', 'true-false', 'cloze'];
    const baseParts = baseExam.reading.parts || [];

    const validated: ReadingExamPart[] = [];
    for (let i = 0; i < Math.min(3, rawParts.length); i++) {
      const rp = rawParts[i];
      if (!rp || typeof rp !== 'object') continue;
      let passage = pickString(rp.passage, '');
      const qs = sanitizeQuestions(rp.questions, `ai-${stamp}-r-p${i + 1}`, 3);
      if (passage.length < 30 || qs.length < 2) continue;
      const rawFmt = typeof rp.format === 'string' ? rp.format : formats[i];
      const fmt: ReadingExamPart['format'] =
        rawFmt === 'true-false' || rawFmt === 'tfng' || rawFmt === 'cloze' || rawFmt === 'matching'
          ? rawFmt
          : formats[i];

      if (fmt === 'cloze') {
        const repaired = repairClozePassage(passage, qs);
        if (repaired.hasAllGaps) {
          passage = repaired.passage;
        } else if (baseParts[i]) {
          // Never serve an unanswerable gap-less Part 3 cloze passage
          validated.push(baseParts[i]);
          continue;
        } else {
          passage = repaired.passage;
        }
      }

      validated.push({
        id: `ai-${stamp}-read-p${i + 1}`,
        partLabel: pickString(rp.partLabel, `Reading · Part ${i + 1}`),
        format: fmt,
        instruction: pickString(rp.instruction, isGerman ? 'Lesen Sie den Text und wählen Sie die beste Antwort.' : 'Read the passage and choose the best answer.'),
        passageTitle: pickString(rp.passageTitle, chosenTheme),
        passage,
        questions: qs,
      });
    }

    if (validated.length >= 2) {
      // Pad to 3 parts using base exam part if AI only returned 2
      while (validated.length < 3 && baseParts[validated.length]) {
        validated.push(baseParts[validated.length]);
      }
      emitProgress('reading', 'done');
      return { ok: true, parts: validated };
    }
    emitProgress('reading', 'fallback');
    return { ok: false, parts: baseExam.reading.parts || [] };
  };

  // --- 2. LISTENING PROMPT (3 Multi-Accent Conversational Dialogue Tracks · 9 Questions) ---
  const generateListening = async (): Promise<{ ok: boolean; tracks: ListeningExamTrack[] }> => {
    emitProgress('listening', 'loading');
    const exampleDialogue = isGerman
      ? 'Clara: Entschuldigung, fährt der Zug heute von Gleis sechs?\\nMarkus: Moment mal — nein, der wurde gerade auf Gleis neun verlegt!\\nClara: Ach wirklich? Danke, das hätte ich fast verpasst!\\nMarkus: Gern, er hat übrigens auch zehn Minuten Verspätung.'
      : 'Emma: Wait, did the workshop move to Room 204?\\nLiam: Hang on, let me check my email—oh! It was 204 yesterday, but they switched it to Room 310 this morning.\\nEmma: Good thing I asked! Does it still start at nine thirty?\\nLiam: Yep, nine thirty sharp.';
    const sys = `You are a certified ${baseExam.alignedCertificate} Listening exam author creating 3 brand-new CEFR ${baseExam.level} ${langName} NATURAL TWO-PERSON HUMAN CONVERSATIONS (NOT stiff monologues or robot announcements).
CRITICAL: Format EVERY audioScript as a realistic 4–6 turn back-and-forth dialogue between two named humans (one female name, one male name) separated by newline \\n, using natural spoken reactions, gentle interruptions, and realistic self-corrections. Example format: "${exampleDialogue}". Do NOT include stage directions in brackets.
Return ONLY valid JSON with this exact shape:
{
  "tracks": [
    {
      "partLabel": "<Track 1 dialogue title (${accents[0]})>",
      "contextNote": "<who is talking and where, in ${langName}>",
      "accentCode": "${accents[0]}",
      "audioScript": "<natural 4-6 turn two-speaker dialogue in ${langName} using NameA: ...\\nNameB: ... format, 75-145 words>",
      "hearingFocusTrap": "<what conversational correction/number/distractor to listen for>",
      "questions": [
        {"prompt":"<question in ${langName}>","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."},
        {"prompt":"...","options":["...","...","...","..."],"correctIndex":1,"explanation":"..."},
        {"prompt":"...","options":["...","...","...","..."],"correctIndex":2,"explanation":"..."}
      ]
    },
    { "partLabel": "<Track 2 dialogue (${accents[1]})>", "contextNote": "...", "accentCode": "${accents[1]}", "audioScript": "<NameA: ...\\nNameB: ...>", "hearingFocusTrap": "...", "questions": [ /* 3 items */ ] },
    { "partLabel": "<Track 3 dialogue (${accents[2]})>", "contextNote": "...", "accentCode": "${accents[2]}", "audioScript": "<NameA: ...\\nNameB: ...>", "hearingFocusTrap": "...", "questions": [ /* 3 items */ ] }
  ]
}`;
    const user = `Generate 3 completely fresh, lifelike CEFR ${baseExam.level} ${langName} two-person conversational Listening dialogues (3 questions each = 9 total) themed around: "${chosenTheme}". Make them sound like real everyday/workplace/podcast human conversations matching accents ${accents.join(', ')} — with natural turn-taking, fillers, and realistic self-correction traps. Variation seed: ${seed}. ${avoidNote}`;

    const raw = await callJsonWithRetry<{ tracks?: Array<Record<string, unknown>> }>(config, sys, user, fetchImpl);
    const rawTracks = Array.isArray(raw?.tracks) ? raw!.tracks : [];
    const maxPlays = baseExam.listening.maxPlaysStrict;

    const validated: ListeningExamTrack[] = [];
    for (let i = 0; i < Math.min(3, rawTracks.length); i++) {
      const rt = rawTracks[i];
      if (!rt || typeof rt !== 'object') continue;
      const script = pickString(rt.audioScript, '');
      const qs = sanitizeQuestions(rt.questions, `ai-${stamp}-l-t${i + 1}`, 3);
      if (script.length < 30 || qs.length < 2) continue;
      validated.push({
        id: `ai-${stamp}-listen-t${i + 1}`,
        partLabel: pickString(rt.partLabel, `Listening · Track ${i + 1}`),
        contextNote: pickString(rt.contextNote, chosenTheme),
        accentCode: accents[i],
        maxPlaysStrict: maxPlays,
        preReadSeconds: 15,
        audioScript: script,
        hearingFocusTrap: pickString(rt.hearingFocusTrap, 'Listen closely for corrections, numbers, and speaker attitude.'),
        questions: qs,
      });
    }

    if (validated.length >= 2) {
      const baseTracks = baseExam.listening.tracks || [];
      while (validated.length < 3 && baseTracks[validated.length]) {
        validated.push(baseTracks[validated.length]);
      }
      emitProgress('listening', 'done');
      return { ok: true, tracks: validated };
    }
    emitProgress('listening', 'fallback');
    return { ok: false, tracks: baseExam.listening.tracks || [] };
  };

  // --- 3. WRITING PROMPT (2 Weighted Tasks summing to 100%) ---
  const generateWriting = async (): Promise<{ ok: boolean; tasks: WritingExamTask[] }> => {
    emitProgress('writing', 'loading');
    const baseTasks = baseExam.writing.tasks || [];
    const min1 = baseTasks[0]?.minWords || baseExam.writing.minWords;
    const max1 = baseTasks[0]?.maxWords || baseExam.writing.maxWords;
    const min2 = baseTasks[1]?.minWords || Math.max(40, Math.round(min1 * 1.2));
    const max2 = baseTasks[1]?.maxWords || Math.max(80, Math.round(max1 * 1.2));

    const sys = `You are a certified ${baseExam.alignedCertificate} Writing examiner creating 2 fresh CEFR ${baseExam.level} ${langName} writing tasks.
Return ONLY valid JSON with this exact shape:
{
  "tasks": [
    {
      "partLabel": "<Task 1 title in ${langName}>",
      "scenario": "<authentic real-world writing prompt in ${langName}>",
      "taskRequirements": ["<bullet 1>","<bullet 2>","<bullet 3>"],
      "weightPercent": 40,
      "keyRubricKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
      "modelAnswer": "<complete high-scoring CEFR ${baseExam.level} model answer in ${langName}>"
    },
    {
      "partLabel": "<Task 2 title in ${langName}>",
      "scenario": "<second distinct writing task (essay/opinion/formal letter) in ${langName}>",
      "taskRequirements": ["<bullet 1>","<bullet 2>","<bullet 3>"],
      "weightPercent": 60,
      "keyRubricKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
      "modelAnswer": "<complete high-scoring CEFR ${baseExam.level} model answer in ${langName}>"
    }
  ]
}`;
    const user = `Generate 2 distinct CEFR ${baseExam.level} ${langName} exam writing tasks themed around: "${chosenTheme}". Task 1 target ~${min1}-${max1} words (40% weight), Task 2 target ~${min2}-${max2} words (60% weight). Include full high-band model answers in ${langName}. Variation seed: ${seed}. ${avoidNote}`;

    const raw = await callJsonWithRetry<{ tasks?: Array<Record<string, unknown>> }>(config, sys, user, fetchImpl);
    const rawTasks = Array.isArray(raw?.tasks) ? raw!.tasks : [];
    const mins = [min1, min2];
    const maxs = [max1, max2];
    const defaultWeights = [40, 60];

    const validated: WritingExamTask[] = [];
    for (let i = 0; i < Math.min(2, rawTasks.length); i++) {
      const rt = rawTasks[i];
      if (!rt || typeof rt !== 'object') continue;
      const scenario = pickString(rt.scenario, '');
      const modelAnswer = pickString(rt.modelAnswer, '');
      if (scenario.length < 20 || modelAnswer.length < 35) continue;
      validated.push({
        id: `ai-${stamp}-write-t${i + 1}`,
        partLabel: pickString(rt.partLabel, `Writing · Task ${i + 1}`),
        scenario,
        taskRequirements: pickStringArray(rt.taskRequirements, 2, [
          'Address every point in the scenario clearly.',
          'Use natural connectors and appropriate register.',
          'Check grammar, word order, and spelling carefully.',
        ]),
        minWords: mins[i],
        maxWords: maxs[i],
        weightPercent: defaultWeights[i],
        keyRubricKeywords: pickStringArray(rt.keyRubricKeywords, 2, baseExam.writing.keyRubricKeywords),
        modelAnswer,
      });
    }

    if (validated.length === 2) {
      emitProgress('writing', 'done');
      return { ok: true, tasks: validated };
    }
    if (validated.length === 1 && baseTasks[1]) {
      validated[0].weightPercent = 50;
      validated.push({ ...baseTasks[1], weightPercent: 50 });
      emitProgress('writing', 'done');
      return { ok: true, tasks: validated };
    }
    emitProgress('writing', 'fallback');
    return { ok: false, tasks: baseTasks };
  };

  // --- 4. SPEAKING PROMPT (3 Interactive Oral Parts) ---
  const generateSpeaking = async (): Promise<{ ok: boolean; parts: SpeakingExamPart[] }> => {
    emitProgress('speaking', 'loading');
    const sys = `You are a certified ${baseExam.alignedCertificate} Speaking examiner creating a 3-part CEFR ${baseExam.level} ${langName} oral exam.
Return ONLY valid JSON with this exact shape:
{
  "parts": [
    {
      "partLabel": "<Part 1: Warm-Up Interview in ${langName}>",
      "instruction": "<brief instruction>",
      "prepSeconds": 15,
      "speakSeconds": 60,
      "prompts": ["<prompt 1>","<prompt 2>","<prompt 3>"],
      "examinerPromptAudio": "<what the examiner says aloud to start Part 1 in ${langName}>",
      "keyRubricKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>"],
      "modelResponseScript": "<natural spoken CEFR ${baseExam.level} model answer in ${langName}>"
    },
    {
      "partLabel": "<Part 2: Timed Cue Card Presentation in ${langName}>",
      "instruction": "<cue card topic>",
      "prepSeconds": ${baseExam.speaking.prepSeconds},
      "speakSeconds": ${baseExam.speaking.speakSeconds},
      "prompts": ["<bullet 1>","<bullet 2>","<bullet 3>"],
      "examinerPromptAudio": "<examiner transition spoken aloud in ${langName}>",
      "keyRubricKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>"],
      "modelResponseScript": "<natural spoken CEFR ${baseExam.level} model presentation in ${langName}>"
    },
    {
      "partLabel": "<Part 3: Interactive Pushback & Discussion in ${langName}>",
      "instruction": "<discussion task>",
      "prepSeconds": 20,
      "speakSeconds": 90,
      "prompts": ["<counterpoint/question 1>","<counterpoint/question 2>","<counterpoint/question 3>"],
      "examinerPromptAudio": "<examiner pushback question spoken aloud in ${langName}>",
      "keyRubricKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>"],
      "modelResponseScript": "<natural spoken CEFR ${baseExam.level} model discussion response in ${langName}>"
    }
  ]
}`;
    const user = `Generate a fresh 3-part CEFR ${baseExam.level} ${langName} Speaking exam themed around: "${chosenTheme}". Include playable examinerPromptAudio sentences and realistic modelResponseScript samples in ${langName}. Variation seed: ${seed}. ${avoidNote}`;

    const raw = await callJsonWithRetry<{ parts?: Array<Record<string, unknown>> }>(config, sys, user, fetchImpl);
    const rawParts = Array.isArray(raw?.parts) ? raw!.parts : [];
    const defaultPreps = [15, baseExam.speaking.prepSeconds, 20];
    const defaultSpeaks = [60, baseExam.speaking.speakSeconds, 90];

    const validated: SpeakingExamPart[] = [];
    for (let i = 0; i < Math.min(3, rawParts.length); i++) {
      const rp = rawParts[i];
      if (!rp || typeof rp !== 'object') continue;
      const modelScript = pickString(rp.modelResponseScript, '');
      const prompts = pickStringArray(rp.prompts, 2, []);
      if (modelScript.length < 25 || prompts.length < 2) continue;
      validated.push({
        id: `ai-${stamp}-speak-p${i + 1}`,
        partLabel: pickString(rp.partLabel, `Speaking · Part ${i + 1}`),
        instruction: pickString(rp.instruction, chosenTheme),
        prepSeconds: defaultPreps[i],
        speakSeconds: defaultSpeaks[i],
        prompts,
        examinerPromptAudio: pickString(
          rp.examinerPromptAudio,
          isGerman
            ? `Willkommen zu Teil ${i + 1}. Bitte sprechen Sie kurz zum Thema ${chosenTheme}.`
            : `Welcome to Part ${i + 1}. Please share your thoughts on ${chosenTheme}.`
        ),
        keyRubricKeywords: pickStringArray(rp.keyRubricKeywords, 2, baseExam.speaking.keyRubricKeywords),
        modelResponseScript: modelScript,
      });
    }

    if (validated.length >= 2) {
      const baseParts = baseExam.speaking.parts || [];
      while (validated.length < 3 && baseParts[validated.length]) {
        validated.push(baseParts[validated.length]);
      }
      emitProgress('speaking', 'done');
      return { ok: true, parts: validated };
    }
    emitProgress('speaking', 'fallback');
    return { ok: false, parts: baseExam.speaking.parts || [] };
  };

  // Run sequentially for local models (avoids queuing timeouts on local GPUs) and in parallel for cloud APIs
  let readRes: { ok: boolean; parts: ReadingExamPart[] };
  let listenRes: { ok: boolean; tracks: ListeningExamTrack[] };
  let writeRes: { ok: boolean; tasks: WritingExamTask[] };
  let speakRes: { ok: boolean; parts: SpeakingExamPart[] };

  if (config.mode === 'local') {
    readRes = await generateReading();
    listenRes = await generateListening();
    writeRes = await generateWriting();
    speakRes = await generateSpeaking();
  } else {
    [readRes, listenRes, writeRes, speakRes] = await Promise.all([
      generateReading(),
      generateListening(),
      generateWriting(),
      generateSpeaking(),
    ]);
  }

  const aiGeneratedSkills: SkillType[] = [];
  if (readRes.ok) aiGeneratedSkills.push('reading');
  if (listenRes.ok) aiGeneratedSkills.push('listening');
  if (writeRes.ok) aiGeneratedSkills.push('writing');
  if (speakRes.ok) aiGeneratedSkills.push('speaking');

  if (aiGeneratedSkills.length === 0) {
    throw new Error(
      `Could not generate exam content from ${AI_PROVIDER_PRESETS[config.provider].label} (${config.model}). Verify your AI connection & model in AI Settings and try again.`
    );
  }

  const firstRead = readRes.parts[0];
  const firstListen = listenRes.tracks[0];
  const firstWrite = writeRes.tasks[0];
  const cuePart = speakRes.parts[1] || speakRes.parts[0];

  const exam: MockExam = {
    ...baseExam,
    id: `ai-exam-${baseExam.languageId}-${baseExam.level.toLowerCase()}-${stamp}`,
    title: `${baseExam.alignedCertificate} · AI Edition (${chosenTheme.slice(0, 42)}${chosenTheme.length > 42 ? '…' : ''})`,
    aiGenerated: true,
    generatedTheme: chosenTheme,
    generatedByModel: `${AI_PROVIDER_PRESETS[config.provider].label} · ${config.model}`,
    generatedAt: new Date().toISOString(),
    aiGeneratedSkills,
    reading: {
      ...baseExam.reading,
      title: firstRead?.partLabel || baseExam.reading.title,
      passageTitle: firstRead?.passageTitle || baseExam.reading.passageTitle,
      passage: firstRead?.passage || baseExam.reading.passage,
      questions: firstRead?.questions || baseExam.reading.questions,
      parts: readRes.parts,
    },
    listening: {
      ...baseExam.listening,
      title: firstListen?.partLabel || baseExam.listening.title,
      contextNote: firstListen?.contextNote || baseExam.listening.contextNote,
      audioScript: firstListen?.audioScript || baseExam.listening.audioScript,
      hearingFocusTrap: firstListen?.hearingFocusTrap || baseExam.listening.hearingFocusTrap,
      questions: firstListen?.questions || baseExam.listening.questions,
      tracks: listenRes.tracks,
    },
    writing: {
      ...baseExam.writing,
      title: firstWrite?.partLabel || baseExam.writing.title,
      scenario: firstWrite?.scenario || baseExam.writing.scenario,
      taskRequirements: firstWrite?.taskRequirements || baseExam.writing.taskRequirements,
      minWords: firstWrite?.minWords || baseExam.writing.minWords,
      maxWords: firstWrite?.maxWords || baseExam.writing.maxWords,
      keyRubricKeywords: firstWrite?.keyRubricKeywords || baseExam.writing.keyRubricKeywords,
      modelAnswer: firstWrite?.modelAnswer || baseExam.writing.modelAnswer,
      tasks: writeRes.tasks,
    },
    speaking: {
      ...baseExam.speaking,
      title: cuePart?.partLabel || baseExam.speaking.title,
      cueCardTitle: cuePart?.instruction || baseExam.speaking.cueCardTitle,
      bulletPoints: cuePart?.prompts || baseExam.speaking.bulletPoints,
      keyRubricKeywords: cuePart?.keyRubricKeywords || baseExam.speaking.keyRubricKeywords,
      modelResponseScript: cuePart?.modelResponseScript || baseExam.speaking.modelResponseScript,
      parts: speakRes.parts,
    },
  };

  return { exam, aiSkillsCount: aiGeneratedSkills.length, theme: chosenTheme };
}
