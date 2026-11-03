import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundEngine } from '../utils/audio';

describe('SoundEngine Audio & Speech Synthesis Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles mute state properly', () => {
    const initialState = soundEngine.getMuted();
    const toggled = soundEngine.toggleMute();
    expect(toggled).toBe(!initialState);
    expect(soundEngine.getMuted()).toBe(!initialState);
    // restore
    soundEngine.toggleMute();
  });

  it('triggers speech synthesis speak for German text', () => {
    soundEngine.speak('Guten Morgen', 'german');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('triggers speech synthesis speak for English text', () => {
    soundEngine.speak('Hello world', 'english');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('triggers success chime without error', () => {
    expect(() => soundEngine.playSuccessChime()).not.toThrow();
  });

  it('triggers click sound without error', () => {
    expect(() => soundEngine.playClickSound()).not.toThrow();
  });
});
