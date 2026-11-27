import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildElevenLabsRequestBody,
  buildGeminiTTSRequestBody,
  buildNeuralVoiceInstructions,
  buildOpenAIDialogueInstructions,
  getAccentsForLanguage,
  getDefaultVoiceSettings,
  isRoboticOrNoveltyVoice,
  naturalTurnPauseMs,
  parseDialogueTurns,
  parseSampleRateFromMimeType,
  pickBestSystemVoice,
  resolveGeminiTTSEndpoint,
  soundEngine,
  wrapPCM16AsWAV,
} from '../utils/audio';
import { AI_CONFIG_STORAGE_KEY } from '../utils/aiClient';

describe('SoundEngine Audio, Multi-Accent & Human Voice Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundEngine.updateVoiceSettings(getDefaultVoiceSettings());
  });

  it('toggles mute state properly', () => {
    const initialState = soundEngine.getMuted();
    const toggled = soundEngine.toggleMute();
    expect(toggled).toBe(!initialState);
    expect(soundEngine.getMuted()).toBe(!initialState);
    soundEngine.toggleMute();
  });

  it('provides 6 global English accents and 3 pluricentric German DACH accents', () => {
    const enCodes = getAccentsForLanguage('english').map((a) => a.code);
    const deCodes = getAccentsForLanguage('german').map((a) => a.code);

    expect(enCodes).toEqual(['en-GB', 'en-US', 'en-AU', 'en-IE', 'en-IN', 'en-ZA']);
    expect(deCodes).toEqual(['de-DE', 'de-AT', 'de-CH']);
  });

  it('filters out legacy robotic/novelty/Eloquence voices and prioritizes Siri/Neural/Enhanced human voices', () => {
    const voices = [
      { name: 'Albert', lang: 'en-US', voiceURI: 'com.apple.speech.synthesis.voice.Albert' },
      { name: 'Eddy (English (UK))', lang: 'en-GB', voiceURI: 'com.apple.eloquence.en-GB.Eddy' },
      { name: 'Zarvox', lang: 'en-US', voiceURI: 'com.apple.speech.synthesis.voice.Zarvox' },
      { name: 'Daniel', lang: 'en-GB', voiceURI: 'com.apple.voice.super-compact.en-GB.Daniel' },
      { name: 'Microsoft Libby Online (Natural)', lang: 'en-GB', voiceURI: 'Microsoft Libby Online (Natural)', localService: false },
      { name: 'Voice 5', lang: 'en-US', voiceURI: 'com.apple.siri.natural.Quinn' },
      { name: 'Eddy (German (Germany))', lang: 'de-DE', voiceURI: 'com.apple.eloquence.de-DE.Eddy' },
      { name: 'Voice 2', lang: 'de-DE', voiceURI: 'com.apple.siri.natural.Helena' },
    ];

    expect(isRoboticOrNoveltyVoice(voices[0])).toBe(true);
    expect(isRoboticOrNoveltyVoice(voices[1])).toBe(true);
    expect(isRoboticOrNoveltyVoice(voices[2])).toBe(true);
    expect(isRoboticOrNoveltyVoice(voices[5])).toBe(false);

    const bestUK = pickBestSystemVoice(voices, 'en-GB');
    expect(bestUK?.name).toBe('Microsoft Libby Online (Natural)');

    const bestUS = pickBestSystemVoice(voices, 'en-US');
    expect(bestUS?.voiceURI).toBe('com.apple.siri.natural.Quinn');

    const bestDE = pickBestSystemVoice(voices, 'de-DE');
    expect(bestDE?.voiceURI).toBe('com.apple.siri.natural.Helena');
  });

  it('persists selected regional accents and builds authentic neural accent instructions', () => {
    soundEngine.setAccent('english', 'en-AU');
    soundEngine.setAccent('german', 'de-AT');

    expect(soundEngine.getActiveAccentCode('english')).toBe('en-AU');
    expect(soundEngine.getActiveAccentCode('german')).toBe('de-AT');

    const ukInstructions = buildNeuralVoiceInstructions('en-GB', 'tutor', true);
    expect(ukInstructions).toContain('British English');
    expect(ukInstructions).toContain('0.8x');

    const chInstructions = buildNeuralVoiceInstructions('de-CH', 'natural', false);
    expect(chInstructions).toContain('Swiss Standard German');
  });

  it('triggers speech synthesis speak for German and English text', () => {
    soundEngine.speak('Guten Morgen', 'german');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();

    soundEngine.speak('Hello world', 'english');
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(2);
  });

  it('triggers success chime and click sound without error', () => {
    expect(() => soundEngine.playSuccessChime()).not.toThrow();
    expect(() => soundEngine.playClickSound()).not.toThrow();
  });

  it('parses multi-speaker human conversations (newline and inline), strips labels, and ignores non-speaker colons', () => {
    const newlineDialogue =
      'Clara: Grüß Gott! Ist das Frühstück inklusive?\nHerr Gruber: Ja, von sieben bis zehn Uhr im ersten Stock.\nClara: Perfekt, vielen Dank!';
    const turns = parseDialogueTurns(newlineDialogue);
    expect(turns.length).toBe(3);
    expect(turns[0]).toEqual({ speaker: 'Clara', text: 'Grüß Gott! Ist das Frühstück inklusive?', speakerIndex: 0 });
    expect(turns[1]).toEqual({ speaker: 'Herr Gruber', text: 'Ja, von sieben bis zehn Uhr im ersten Stock.', speakerIndex: 1 });
    expect(turns[2].speakerIndex).toBe(0);

    const inlineDialogue = 'Emma: Are we going on Saturday? Liam: Yes, let us take the train!';
    const inlineTurns = parseDialogueTurns(inlineDialogue);
    expect(inlineTurns.length).toBe(2);
    expect(inlineTurns.map((t) => t.speaker)).toEqual(['Emma', 'Liam']);

    // Monologue with a colon must NOT be misparsed as dialogue
    const monologue = 'Hinweis: Heute gibt es Erdbeeren im Angebot: zwei Euro fünfzig!';
    expect(parseDialogueTurns(monologue)).toEqual([]);

    // Speaking a 2-turn dialogue queues 2 separate utterances (one per speaker) without speaking speaker names
    soundEngine.speak(inlineDialogue, 'english');
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(2);
  });

  it('wraps Gemini 24kHz 16-bit PCM into a valid 44-byte RIFF/WAVE header and resolves endpoints', () => {
    expect(parseSampleRateFromMimeType('audio/L16;codec=pcm;rate=24000')).toBe(24000);
    expect(parseSampleRateFromMimeType('audio/L16;rate=16000')).toBe(16000);
    expect(parseSampleRateFromMimeType('audio/wav')).toBe(24000);

    const pcm = new Uint8Array([1, 2, 3, 4]);
    const wav = wrapPCM16AsWAV(pcm, 24000, 1);
    expect(wav.byteLength).toBe(48);
    expect(String.fromCharCode(wav[0], wav[1], wav[2], wav[3])).toBe('RIFF');
    expect(String.fromCharCode(wav[8], wav[9], wav[10], wav[11])).toBe('WAVE');
    expect(String.fromCharCode(wav[36], wav[37], wav[38], wav[39])).toBe('data');
    const dv = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(dv.getUint32(24, true)).toBe(24000);
    expect(dv.getUint32(40, true)).toBe(4);

    expect(
      resolveGeminiTTSEndpoint(
        'https://generativelanguage.googleapis.com/v1beta/models',
        'gemini-2.5-flash-preview-tts'
      )
    ).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent'
    );
  });

  it('builds Gemini single-speaker and 2-speaker multiSpeakerVoiceConfig payloads and reuses Gemini key', () => {
    localStorage.setItem(
      AI_CONFIG_STORAGE_KEY,
      JSON.stringify({ provider: 'gemini', apiKey: 'test-gemini-placeholder-key' })
    );
    const geminiSettings = {
      ...getDefaultVoiceSettings(),
      provider: 'gemini' as const,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-2.5-flash-preview-tts',
      neuralVoice: 'Aoede',
      apiKey: '',
      reuseGeminiKey: true,
    };
    expect(soundEngine.getEffectiveApiKey(geminiSettings)).toBe('test-gemini-placeholder-key');
    expect(soundEngine.isNeuralProviderReady(geminiSettings)).toBe(true);

    const single = buildGeminiTTSRequestBody({
      text: 'Guten Tag!',
      accentCode: 'de-DE',
      style: 'natural',
      slow: false,
      voice: 'Aoede',
    }) as { generationConfig: { speechConfig: { voiceConfig?: { prebuiltVoiceConfig: { voiceName: string } } } } };
    expect(single.generationConfig.speechConfig.voiceConfig?.prebuiltVoiceConfig.voiceName).toBe('Aoede');

    const turns = parseDialogueTurns('Clara: Hallo Lukas!\nLukas: Hallo Clara, wie geht es dir?');
    const multi = buildGeminiTTSRequestBody({
      text: '',
      accentCode: 'de-DE',
      style: 'conversational',
      slow: false,
      voice: 'Aoede',
      dialogueTurns: turns,
      secondaryVoice: 'Charon',
    }) as {
      generationConfig: {
        speechConfig: {
          multiSpeakerVoiceConfig?: {
            speakerVoiceConfigs: Array<{ speaker: string; voiceConfig: { prebuiltVoiceConfig: { voiceName: string } } }>;
          };
        };
      };
    };
    const configs = multi.generationConfig.speechConfig.multiSpeakerVoiceConfig?.speakerVoiceConfigs;
    expect(configs?.length).toBe(2);
    expect(configs?.[0].speaker).toBe('Clara');
    expect(configs?.[1].speaker).toBe('Lukas');
    expect(configs?.[1].voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Charon');
  });

  it('builds ElevenLabs v3 vs Flash v2.5 payloads, OpenAI turn context, and adaptive turn pauses', () => {
    const flashBody = buildElevenLabsRequestBody({
      text: 'Ja, genau!',
      model: 'eleven_flash_v2_5',
      style: 'conversational',
      speed: 0.85,
      accentCode: 'de-AT',
      previousText: 'Haben Sie Zeit?',
      nextText: 'Dann legen wir los.',
    }) as {
      voice_settings: { speed?: number };
      previous_text?: string;
      next_text?: string;
      language_code?: string;
    };
    expect(flashBody.voice_settings.speed).toBe(0.85);
    expect(flashBody.previous_text).toBe('Haben Sie Zeit?');
    expect(flashBody.next_text).toBe('Dann legen wir los.');
    expect(flashBody.language_code).toBe('de');

    const v3Body = buildElevenLabsRequestBody({
      text: 'Hello!',
      model: 'eleven_v3',
      style: 'tutor',
      speed: 0.8,
      accentCode: 'en-GB',
    }) as { voice_settings: { speed?: number }; language_code?: string };
    expect(v3Body.voice_settings.speed).toBeUndefined();
    expect(v3Body.language_code).toBe('en');

    const openAIIns = buildOpenAIDialogueInstructions(
      'de-DE',
      'conversational',
      'Lukas',
      1,
      false,
      { speaker: 'Clara', text: 'Kommst du heute mit?', speakerIndex: 0 }
    );
    expect(openAIIns).toContain('Clara');
    expect(openAIIns).toContain('Kommst du heute mit?');

    expect(naturalTurnPauseMs('Oh, super!', 'Weiter.', false)).toBe(120);
    expect(naturalTurnPauseMs('Wann fährt der Zug nach Basel ab?', 'Um zehn.', false)).toBe(200);
    expect(
      naturalTurnPauseMs(
        'Das ist eine wirklich ausführliche Erklärung zu diesem interessanten und komplexen Thema im heutigen Seminar.',
        'Stimmt.',
        false
      )
    ).toBe(300);
    expect(naturalTurnPauseMs('Oh, super!', 'Weiter.', true)).toBe(150);
  });
});
