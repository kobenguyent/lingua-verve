import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AI_PROVIDER_PRESETS,
  buildSkillCoachSystemPrompt,
  callAIProvider,
  evaluateSubmissionOffline,
  evaluateWithAIOrFallback,
  fetchAvailableModels,
  getDefaultAIConfig,
  isAIConfigReady,
  parseCoachReply,
  resolveModelsEndpoints,
  testAIProviderConnection,
} from '../utils/aiClient';
import {
  computeSkillAverages,
  computeStudyStreak,
  createEmptyLearnerState,
  exportLearnerProgressJSON,
  parseImportedLearnerProgressJSON,
  recordAISession,
  recordExamAttempt,
  recordPreTestResult,
  toggleModuleCompletionInState,
} from '../utils/progressStore';
import { evaluatePreTest, getPreTestQuestions, MOCK_EXAMS } from '../data';
import {
  deleteGeneratedExam,
  extractJsonObject,
  generateFreshMockExamWithAI,
  loadGeneratedExams,
  saveGeneratedExam,
} from '../utils/aiExamGenerator';

describe('Local & Cloud AI Provider Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures both Local (Ollama, LM Studio) and Cloud (OpenAI, Gemini, OpenRouter, Custom) presets', () => {
    expect(AI_PROVIDER_PRESETS.ollama.mode).toBe('local');
    expect(AI_PROVIDER_PRESETS.ollama.requiresKey).toBe(false);
    expect(AI_PROVIDER_PRESETS.lmstudio.mode).toBe('local');
    expect(AI_PROVIDER_PRESETS.openai.mode).toBe('cloud');
    expect(AI_PROVIDER_PRESETS.openai.requiresKey).toBe(true);
    expect(AI_PROVIDER_PRESETS.gemini.mode).toBe('cloud');
    expect(AI_PROVIDER_PRESETS.openrouter.mode).toBe('cloud');

    const localReady = { ...getDefaultAIConfig('ollama'), enabled: true };
    expect(isAIConfigReady(localReady)).toBe(true);

    const cloudMissingKey = { ...getDefaultAIConfig('openai'), enabled: true, apiKey: '' };
    expect(isAIConfigReady(cloudMissingKey)).toBe(false);
  });

  it('calls Local Ollama OpenAI-compatible endpoint cleanly without requiring an API key', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'LinguaVerve AI ready.' } }],
      }),
    });

    const config = { ...getDefaultAIConfig('ollama'), enabled: true };
    const res = await testAIProviderConnection(config, mockFetch as unknown as typeof fetch);

    expect(res.ok).toBe(true);
    expect(res.reply).toBe('LinguaVerve AI ready.');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/v1/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls Cloud Google Gemini generateContent REST API with proper payload shape', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Hallo! Bereit für B2 Deutsch.' }] } }],
      }),
    });

    const config = {
      ...getDefaultAIConfig('gemini'),
      enabled: true,
      apiKey: 'test-gemini-key',
    };

    const reply = await callAIProvider(
      config,
      [
        { role: 'system', content: buildSkillCoachSystemPrompt({ languageId: 'german', level: 'B2', skill: 'speaking' }) },
        { role: 'user', content: 'Start debate' },
      ],
      mockFetch as unknown as typeof fetch
    );

    expect(reply).toContain('Bereit für B2 Deutsch');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=test-gemini-key'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('grades writing and speaking via offline CEFR rubric when no AI provider is enabled', () => {
    const evalRes = evaluateSubmissionOffline({
      text: 'Meiner Meinung nach sollten wir Bargeld behalten, weil digitale Systeme ausfallen können. Obwohl Karten bequem sind, brauchen wir außerdem sichere Alternativen.',
      languageId: 'german',
      level: 'B1',
      skill: 'writing',
      minWords: 20,
      expectedKeywords: ['Meinung', 'Bargeld', 'weil', 'obwohl'],
    });

    expect(evalRes.source).toBe('offline-rubric');
    expect(evalRes.score).toBeGreaterThanOrEqual(65);
    expect(evalRes.strengths.length).toBeGreaterThan(0);
  });

  it('uses connected AI JSON response for live exam grading when available', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 88,
                cefrEstimate: 'B2',
                strengths: ['Clear thesis and authentic connectors'],
                corrections: ['Minor article adjustment in paragraph 2'],
                upgradedVersion: 'Polished B2+ essay version.',
                examinerSummary: 'Strong B2 performance ready for certification.',
              }),
            },
          },
        ],
      }),
    });

    const config = { ...getDefaultAIConfig('openai'), enabled: true, apiKey: 'sk-test' };
    const result = await evaluateWithAIOrFallback({
      config,
      text: 'Sample well-developed English essay text for B2 certification grading.',
      languageId: 'english',
      level: 'B2',
      skill: 'writing',
      taskPrompt: 'Discuss remote work.',
      minWords: 10,
      expectedKeywords: ['essay'],
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    expect(result.source).toBe('ai');
    expect(result.score).toBe(88);
    expect(result.cefrEstimate).toBe('B2');
  });

  it('fetches available models across Ollama (/v1/models & /api/tags fallback), OpenAI, Gemini, and OpenRouter', async () => {
    // 1. Ollama fallback from /v1/models failure to native /api/tags
    expect(resolveModelsEndpoints('ollama', 'http://localhost:11434/v1/chat/completions')).toEqual([
      'http://localhost:11434/v1/models',
      'http://localhost:11434/api/tags',
    ]);

    const ollamaFallbackFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [
            { name: 'qwen2.5:7b', details: { parameter_size: '7.6B', family: 'qwen2' } },
            { name: 'llama3.2:latest', details: { parameter_size: '3.2B', family: 'llama' } },
          ],
        }),
      });
    const ollamaModels = await fetchAvailableModels(
      getDefaultAIConfig('ollama'),
      ollamaFallbackFetch as unknown as typeof fetch
    );
    expect(ollamaModels.map((m) => m.id)).toEqual(['qwen2.5:7b', 'llama3.2:latest']);
    expect(ollamaModels[0].displayName).toContain('7.6B');

    // 2. OpenAI filters out embeddings/whisper/tts and prioritizes chat models
    const openaiFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 'text-embedding-3-small', owned_by: 'openai' },
          { id: 'whisper-1', owned_by: 'openai' },
          { id: 'gpt-4o-mini', owned_by: 'openai' },
          { id: 'o3-mini', owned_by: 'openai' },
        ],
      }),
    });
    const openaiModels = await fetchAvailableModels(
      { ...getDefaultAIConfig('openai'), apiKey: 'sk-test' },
      openaiFetch as unknown as typeof fetch
    );
    expect(openaiModels.map((m) => m.id)).toEqual(['gpt-4o-mini', 'o3-mini']);
    expect(openaiFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer sk-test' }),
      })
    );

    // Missing OpenAI API key rejects clearly
    await expect(
      fetchAvailableModels({ ...getDefaultAIConfig('openai'), apiKey: '' }, openaiFetch as unknown as typeof fetch)
    ).rejects.toThrow(/API key/i);

    // 3. Google Gemini strips `models/` prefix and filters to generateContent-capable models
    const geminiFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          {
            name: 'models/gemini-2.5-flash',
            displayName: 'Gemini 2.5 Flash',
            supportedGenerationMethods: ['generateContent'],
            inputTokenLimit: 1048576,
          },
          {
            name: 'models/text-embedding-004',
            displayName: 'Text Embedding',
            supportedGenerationMethods: ['embedContent'],
          },
        ],
      }),
    });
    const geminiModels = await fetchAvailableModels(
      { ...getDefaultAIConfig('gemini'), apiKey: 'AIza-test' },
      geminiFetch as unknown as typeof fetch
    );
    expect(geminiModels).toEqual([
      {
        id: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        ownedBy: 'google',
        contextLength: 1048576,
      },
    ]);

    // 4. OpenRouter lists models even without API key
    const openRouterFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context_length: 200000 },
          { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', context_length: 1000000 },
        ],
      }),
    });
    const orModels = await fetchAvailableModels(
      getDefaultAIConfig('openrouter'),
      openRouterFetch as unknown as typeof fetch
    );
    expect(orModels.map((m) => m.id)).toEqual(['anthropic/claude-3.5-sonnet', 'google/gemini-2.5-flash']);
  });
});

describe('Learner Progress, History & Test Results Store', () => {
  it('records completed modules, pre-tests, simulated exams, AI sessions, and computes skill averages', () => {
    let state = createEmptyLearnerState();

    state = toggleModuleCompletionInState(state, 'de-a1-m1', {
      languageId: 'german',
      level: 'A1',
      title: 'Phonetic Foundation',
    });
    expect(state.completedModuleIds).toContain('de-a1-m1');
    expect(state.activityLog.length).toBe(1);

    // Record pre-test
    const qs = getPreTestQuestions('german');
    const answers = Object.fromEntries(qs.map((q) => [q.id, q.correctIndex]));
    const preResult = evaluatePreTest('german', answers);
    state = recordPreTestResult(state, preResult);
    expect(state.preTestHistory.length).toBe(1);
    expect(state.enrolledCourseIds.length).toBeGreaterThan(0);

    // Record mock exam
    state = recordExamAttempt(state, {
      id: 'exam-rec-1',
      timestamp: new Date().toISOString(),
      examId: 'exam-de-b1',
      examTitle: 'Goethe-Zertifikat B1 Simulation',
      alignedCertificate: 'Goethe-Zertifikat B1',
      languageId: 'german',
      level: 'B1',
      mode: 'strict',
      durationUsedSeconds: 1200,
      overallScore: 82,
      passed: true,
      skills: {
        reading: { score: 100, passed: true, feedback: '3/3' },
        listening: { score: 67, passed: true, feedback: '2/3' },
        writing: { score: 80, passed: true, feedback: 'Solid B1' },
        speaking: { score: 81, passed: true, feedback: 'Clear fluency' },
      },
    });
    expect(state.examHistory.length).toBe(1);

    // Record AI session
    state = recordAISession(state, {
      id: 'ai-1',
      timestamp: new Date().toISOString(),
      languageId: 'german',
      level: 'B1',
      skill: 'speaking',
      provider: 'Ollama (llama3.2)',
      summary: 'Goethe B1 cafe roleplay',
      score: 85,
    });
    expect(state.aiSessionHistory.length).toBe(1);

    const averages = computeSkillAverages(state, 'german');
    expect(averages.reading.average).toBe(100);
    expect(averages.listening.samples).toBe(2);

    // Export and import JSON round-trip
    const exported = exportLearnerProgressJSON(state);
    const reimported = parseImportedLearnerProgressJSON(exported);
    expect(reimported.completedModuleIds).toEqual(state.completedModuleIds);
    expect(reimported.examHistory.length).toBe(1);
    expect(reimported.preTestHistory.length).toBe(1);
  });

  it('computes consecutive study streaks accurately', () => {
    const refDate = new Date('2026-11-25T10:00:00');
    expect(computeStudyStreak(['2026-11-23', '2026-11-24', '2026-11-25'], refDate)).toBe(3);
    expect(computeStudyStreak(['2026-11-20', '2026-11-24'], refDate)).toBe(1);
    expect(computeStudyStreak(['2026-11-10'], refDate)).toBe(0);
  });

  it('extracts fenced/trailing-comma JSON, falls back a malformed skill gracefully, and persists AI generated exam bank', async () => {
    const parsed = extractJsonObject<{ ok: boolean; items: number[] }>('Here you go:\n```json\n{"ok": true, "items": [1, 2,],}\n```');
    expect(parsed).toEqual({ ok: true, items: [1, 2] });

    const baseExam = MOCK_EXAMS.find((e) => e.id === 'exam-en-b2')!;
    const validWriting = JSON.stringify({
      tasks: [
        {
          partLabel: 'Writing Task 1 · Report',
          scenario: 'Write a report on urban cycling infrastructure for your city council.',
          taskRequirements: ['Evaluate current lanes', 'Identify bottlenecks', 'Propose two upgrades'],
          weightPercent: 40,
          keyRubricKeywords: ['infrastructure', 'commuters', 'furthermore'],
          modelAnswer: 'Urban cycling infrastructure has expanded rapidly over the past decade, yet crucial intersections still deter daily commuters from leaving cars at home.',
        },
        {
          partLabel: 'Writing Task 2 · Essay',
          scenario: 'Should major cities ban private petrol cars from historic centres by 2030?',
          taskRequirements: ['Weigh economic impact', 'Evaluate air quality gains', 'Reach a reasoned conclusion'],
          weightPercent: 60,
          keyRubricKeywords: ['emissions', 'however', 'consequently'],
          modelAnswer: 'Banning private petrol vehicles from historic centres is often portrayed as an attack on convenience; however, cities that prioritize clean air and rapid transit consistently report stronger retail footfall.',
        },
      ],
    });

    // Only Writing returns valid JSON; other 3 return invalid prose -> graceful 1/4 AI + 3/4 base fallback
    const partialFetch = vi.fn().mockImplementation(async (_url, init) => {
      const bodyStr = String(init?.body || '');
      const content = bodyStr.includes('Writing examiner') ? validWriting : 'Sorry, I cannot comply with JSON right now.';
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content } }] }),
      };
    });

    const cfg = { ...getDefaultAIConfig('openai'), enabled: true, apiKey: 'sk-unit' };
    const result = await generateFreshMockExamWithAI({
      config: cfg,
      baseExam,
      customTopic: 'Urban Cycling & Clean Air',
      fetchImpl: partialFetch as unknown as typeof fetch,
    });

    expect(result.aiSkillsCount).toBe(1);
    expect(result.exam.aiGenerated).toBe(true);
    expect(result.exam.writing.tasks?.[0].partLabel).toBe('Writing Task 1 · Report');
    expect(result.exam.reading.parts?.length).toBe(3);
    expect(result.exam.listening.tracks?.length).toBe(3);

    const saved = saveGeneratedExam(result.exam);
    expect(saved.some((e) => e.id === result.exam.id)).toBe(true);
    expect(loadGeneratedExams().some((e) => e.id === result.exam.id)).toBe(true);

    const afterDelete = deleteGeneratedExam(result.exam.id);
    expect(afterDelete.some((e) => e.id === result.exam.id)).toBe(false);
  });

  it('separates pure spoken target-language TTS from role prefixes, markdown, stage directions, and English [COACH NOTE] blocks', () => {
    // 1. Exact real-world mixed German/English Speaking Coach output with inline [COACH NOTE: ...] and **Examiner:**
    const mixedSample =
      '**Examiner:** Ah, der CMC Mercedes-Benz SLA 2003! Das ist ja ein schöner Klassiker. Warum hast du dich gerade für dieses Modell entschieden, als du angefangen hast zu sammeln? [COACH NOTE: Replace "Lieblingsmutter" with "Lieblingsmodell" for correct German. Consider replacing "Modemodell" with "Modell" for correct German.]';

    const parsedMixed = parseCoachReply(mixedSample, 'speaking');
    expect(parsedMixed.speakerLabel).toBe('Examiner');
    expect(parsedMixed.spokenText).toBe(
      'Ah, der CMC Mercedes-Benz SLA 2003! Das ist ja ein schöner Klassiker. Warum hast du dich gerade für dieses Modell entschieden, als du angefangen hast zu sammeln?'
    );
    expect(parsedMixed.spokenText).not.toContain('Examiner');
    expect(parsedMixed.spokenText).not.toContain('COACH NOTE');
    expect(parsedMixed.spokenText).not.toContain('Replace');
    expect(parsedMixed.spokenText).not.toContain('*');
    expect(parsedMixed.displayBody).toBe(parsedMixed.spokenText);
    expect(parsedMixed.coachNote).toBe(
      'Replace "Lieblingsmutter" with "Lieblingsmodell" for correct German. Consider replacing "Modemodell" with "Modell" for correct German.'
    );

    // 2. Multiline [COACH NOTE] with stage direction & bold markdown
    const multilineSample = `**Prüferin:** *(lächelt freundlich)* Das klingt wirklich **spannend**! Seit wann sammelst du Oldtimer?

---
[COACH NOTE]
- Use **"seit drei Jahren"** instead of "für drei Jahre".`;
    const parsedMulti = parseCoachReply(multilineSample, 'speaking');
    expect(parsedMulti.speakerLabel).toBe('Prüferin');
    expect(parsedMulti.spokenText).toBe('Das klingt wirklich spannend! Seit wann sammelst du Oldtimer?');
    expect(parsedMulti.coachNote).toContain('seit drei Jahren');
    expect(parsedMulti.coachNote).not.toContain('**');

    // 3. Heading-style **Coach Note:** plus trailing English Translation block
    const headingSample = `Examiner: Hallo! Welche Musik hörst du gern?

Translation: Hello! What music do you like listening to?

**Coach Note:** Put the verb at the end after "weil".`;
    const parsedHeading = parseCoachReply(headingSample, 'speaking');
    expect(parsedHeading.spokenText).toBe('Hallo! Welche Musik hörst du gern?');
    expect(parsedHeading.coachNote).toContain('Put the verb at the end');
    expect(parsedHeading.coachNote).toContain('Translation: Hello! What music do you like listening to?');

    // 4. Listening [AUDIO SCRIPT] keeps clean multi-speaker lines & excludes English [HEARING FOCUS] / [QUESTIONS]
    const listeningSample = `[AUDIO SCRIPT]
**Clara:** Hey Lukas, treffen wir uns um halb acht am Bahnhof?
**Lukas:** Halb acht wird knapp, mein Bus kommt erst um zwanzig vor acht an.

[HEARING FOCUS]
Notice "halb acht" (7:30) vs. "zwanzig vor acht" (7:40).

[QUESTIONS]
1. Wann schlägt Clara das Treffen vor?`;
    const parsedListening = parseCoachReply(listeningSample, 'listening');
    expect(parsedListening.audioScript).toBe(
      'Clara: Hey Lukas, treffen wir uns um halb acht am Bahnhof?\nLukas: Halb acht wird knapp, mein Bus kommt erst um zwanzig vor acht an.'
    );
    expect(parsedListening.spokenText).toBe(parsedListening.audioScript);
    expect(parsedListening.spokenText).not.toContain('HEARING FOCUS');
    expect(parsedListening.spokenText).not.toContain('Notice');
    expect(parsedListening.displayBody).toContain('[QUESTIONS]');

    // 5. Writing rubric headings like **Corrections:** stay intact in writing mode
    const writingSample = '**Score: 84/100**\n**Corrections:** Use "weil" with verb-final word order.';
    const parsedWriting = parseCoachReply(writingSample, 'writing');
    expect(parsedWriting.displayBody).toContain('Corrections:');
    expect(parsedWriting.coachNote).toBeNull();

    // 6. Speaking system prompt enforces pure spoken language & separated [COACH NOTE]
    const speakingPrompt = buildSkillCoachSystemPrompt({ languageId: 'german', level: 'B1', skill: 'speaking' });
    expect(speakingPrompt).toContain('100% pure, natural spoken German');
    expect(speakingPrompt).toContain('NEVER include role prefixes');
    expect(speakingPrompt).toContain('[COACH NOTE]');
  });
});
