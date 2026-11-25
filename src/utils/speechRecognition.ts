/**
 * Safe browser Web Speech Recognition wrapper for live Speaking practice & simulated exams.
 * Gracefully degrades to manual transcript mode in unsupported browsers or jsdom.
 */

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstanceLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstanceLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, unknown>;
  const ctor = (win.SpeechRecognition || win.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;
  return ctor ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export interface SpeechRecorderHandle {
  stop: () => void;
}

export function startSpeechRecognition(options: {
  languageId: string;
  onTranscript: (finalText: string, interimText: string) => void;
  onError?: (errorCode: string) => void;
  onEnd?: () => void;
}): SpeechRecorderHandle | null {
  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) {
    options.onError?.('unsupported');
    return null;
  }

  const recognition = new Ctor();
  recognition.lang =
    options.languageId === 'german' || options.languageId === 'de'
      ? 'de-DE'
      : options.languageId === 'spanish'
      ? 'es-ES'
      : options.languageId === 'french'
      ? 'fr-FR'
      : 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;

  let accumulatedFinal = '';

  recognition.onresult = (event: SpeechRecognitionEventLike) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? '';
      if (result.isFinal) {
        accumulatedFinal += (accumulatedFinal ? ' ' : '') + text.trim();
      } else {
        interim += text;
      }
    }
    options.onTranscript(accumulatedFinal.trim(), interim.trim());
  };

  recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
    options.onError?.(event.error || 'unknown');
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    options.onError?.('start-failed');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }
    },
  };
}
