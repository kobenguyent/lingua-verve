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
import { evaluatePreTest, getPreTestQuestions } from '../data';

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
});
