import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AI_PROVIDER_PRESETS,
  buildSkillCoachSystemPrompt,
  callAIProvider,
  evaluateSubmissionOffline,
  evaluateWithAIOrFallback,
  getDefaultAIConfig,
  isAIConfigReady,
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
