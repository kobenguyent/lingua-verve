/**
 * LinguaVerve Native Audio & Sound Engine
 * Provides speech synthesis for German and English pronunciation
 * and Web Audio API synthesized sound effects.
 */

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazily initialize AudioContext on user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an uplifting polyglot chime when achieving a milestone or mastering a tip
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }

  /**
   * Tactile polyglot click feedback for buttons/toggles
   */
  public playClickSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Silent catch
    }
  }

  /**
   * Speak a phrase using Browser Web Speech Synthesis
   */
  public speak(text: string, languageId: string = 'english', slow: boolean = false): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = slow ? 0.75 : 0.95; // Slightly measured pace for language learning
      utterance.pitch = 1.0;

      // Select matching BCP 47 language code
      if (languageId === 'german' || languageId === 'de') {
        utterance.lang = 'de-DE';
      } else if (languageId === 'spanish' || languageId === 'es') {
        utterance.lang = 'es-ES';
      } else if (languageId === 'french' || languageId === 'fr') {
        utterance.lang = 'fr-FR';
      } else {
        utterance.lang = 'en-US';
      }

      // Best effort voice selection if voices are already loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetPrefix = utterance.lang.slice(0, 2);
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith(targetPrefix) && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Siri'))
        ) || voices.find((v) => v.lang.startsWith(targetPrefix));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis blocked or unavailable
    }
  }

  public stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
