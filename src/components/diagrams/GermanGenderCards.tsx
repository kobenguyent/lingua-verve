import React from 'react';
import { Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export const GermanGenderCards: React.FC = () => {
  const handleSpeak = (text: string) => {
    soundEngine.playClickSound();
    soundEngine.speak(text, 'german');
  };

  return (
    <div className="my-4 space-y-3">
      <div className="text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Visual Color-Coding Matrix
        </span>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
          German Noun Suffix Visual Cheat-Sheet
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* DER (Blue) */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border-2 border-blue-400/60 dark:border-blue-500/50 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-sm tracking-wide">
                DER
              </span>
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-300">
                Masculine
              </span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-blue-900 dark:text-blue-200">
              -or, -ling, -ismus, -ist, -er
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Also days, months, seasons: <em>der Montag, der Sommer, der Lehrer</em>.
            </p>
          </div>
          <button
            onClick={() => handleSpeak('Der Montag, der Schmetterling, der Motor')}
            className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-300 transition-colors font-semibold text-[11px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Suffixes</span>
          </button>
        </div>

        {/* DIE (Red) */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border-2 border-rose-400/60 dark:border-rose-500/50 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-sm tracking-wide">
                DIE
              </span>
              <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-300">
                Feminine (80% Rules)
              </span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-rose-900 dark:text-rose-200">
              -ung, -heit, -keit, -schaft, -tion, -tät
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              100% Guaranteed: <em>die Freiheit, die Zeitung, die Universität</em>.
            </p>
          </div>
          <button
            onClick={() => handleSpeak('Die Zeitung, die Freiheit, die Möglichkeit')}
            className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-600/15 hover:bg-rose-600 text-rose-700 hover:text-white dark:text-rose-300 transition-colors font-semibold text-[11px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Suffixes</span>
          </button>
        </div>

        {/* DAS (Green) */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-400/60 dark:border-emerald-500/50 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-sm tracking-wide">
                DAS
              </span>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-300">
                Neuter
              </span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
              -chen, -lein, -ment, -um, -ma
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Diminutives & infinitives: <em>das Mädchen, das Museum, das Essen</em>.
            </p>
          </div>
          <button
            onClick={() => handleSpeak('Das Mädchen, das Datum, das Dokument')}
            className="mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 transition-colors font-semibold text-[11px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Suffixes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
