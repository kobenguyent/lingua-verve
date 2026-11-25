import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildNeuralVoiceInstructions,
  getAccentsForLanguage,
  getDefaultVoiceSettings,
  isRoboticOrNoveltyVoice,
  pickBestSystemVoice,
  soundEngine,
} from '../utils/audio';

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
});
