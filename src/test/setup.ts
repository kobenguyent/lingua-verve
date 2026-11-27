import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Speech Synthesis API in jsdom
if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;

  // Node 25+ exposes a stub localStorage without --localstorage-file; provide an in-memory Storage polyfill for Vitest.
  if (!window.localStorage || typeof window.localStorage.setItem !== 'function') {
    const store = new Map<string, string>();
    const memoryStorage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
    };
    Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true });
  }

  win.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([
      { lang: 'en-US', name: 'US English' },
      { lang: 'de-DE', name: 'German Native' },
    ]),
  };

  win.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    lang: 'en-US',
    rate: 1,
    pitch: 1,
    voice: null,
  }));

  win.AudioContext = vi.fn().mockImplementation(() => ({
    currentTime: 0,
    state: 'running',
    resume: vi.fn(),
    createOscillator: vi.fn().mockReturnValue({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }),
    destination: {},
  }));
}
