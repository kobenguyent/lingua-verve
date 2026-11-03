import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface PhoneticsVisualizerProps {
  languageId: string;
}

export const PhoneticsVisualizer: React.FC<PhoneticsVisualizerProps> = ({ languageId }) => {
  const isGerman = languageId === 'german';

  const handleSpeak = (text: string, lang: string = isGerman ? 'german' : 'english') => {
    soundEngine.playClickSound();
    soundEngine.speak(text, lang, true); // Slightly slower for clear phonetic demonstration
  };

  if (isGerman) {
    return (
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Articulatory Mouth Shapes</span>
            </span>
            <h4 className="text-sm font-extrabold text-white">
              Vocal Mechanics: German Umlauts & CH
            </h4>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            IPA [y] [ø] [ç] [x]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Ü sound */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 text-sm">Ü [y] — The Whistle Trap</span>
              <p className="text-[11px] text-slate-300">
                Round lips tight like &ldquo;oo&rdquo;, then speak &ldquo;ee&rdquo;.
              </p>
              <div className="font-mono text-[11px] text-slate-400">Küche, über, Tür</div>
            </div>
            <button
              onClick={() => handleSpeak('Küche, über, Tür', 'german')}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors shrink-0 ml-2"
              title="Hear Ü sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Ö sound */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sky-300 text-sm">Ö [ø] — Rounded &ldquo;Eh&rdquo;</span>
              <p className="text-[11px] text-slate-300">
                Round lips like &ldquo;oh&rdquo;, but say &ldquo;eh&rdquo; inside.
              </p>
              <div className="font-mono text-[11px] text-slate-400">schön, hören, Köln</div>
            </div>
            <button
              onClick={() => handleSpeak('schön, hören, Köln', 'german')}
              className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 transition-colors shrink-0 ml-2"
              title="Hear Ö sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Soft Ich-Laut */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-purple-300 text-sm">Ich-Laut [ç]</span>
              <p className="text-[11px] text-slate-300">
                Soft hissing cat breath against hard palate after e, i, ä, ö, ü.
              </p>
              <div className="font-mono text-[11px] text-slate-400">ich, nicht, echt</div>
            </div>
            <button
              onClick={() => handleSpeak('ich, nicht, echt', 'german')}
              className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition-colors shrink-0 ml-2"
              title="Hear Ich-Laut"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Throaty Ach-Laut */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-rose-300 text-sm">Ach-Laut [x]</span>
              <p className="text-[11px] text-slate-300">
                Throaty friction at soft palate after a, o, u, au.
              </p>
              <div className="font-mono text-[11px] text-slate-400">Buch, Bach, kochen</div>
            </div>
            <button
              onClick={() => handleSpeak('Buch, Bach, kochen', 'german')}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors shrink-0 ml-2"
              title="Hear Ach-Laut"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // English phonetics
  return (
    <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 text-white border border-sky-500/30 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Phonetic Mechanics</span>
          </span>
          <h4 className="text-sm font-extrabold text-white">
            English Phonetic Blueprint: Schwa & TH
          </h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
          IPA /ə/ /θ/ /ð/
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Schwa */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-sky-300 text-sm">The Neutral Schwa /ə/</span>
            <p className="text-[11px] text-slate-300">
              Zero muscular tension; relaxed central sigh. Over 60% of vowels!
            </p>
            <div className="font-mono text-[11px] text-slate-400">banana, photograph, today</div>
          </div>
          <button
            onClick={() => handleSpeak('banana, photograph, today', 'english')}
            className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 transition-colors shrink-0 ml-2"
            title="Hear Schwa words"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Voiced vs Voiceless TH */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 text-sm">Voiced /ð/ vs. Voiceless /θ/</span>
            <p className="text-[11px] text-slate-300">
              Tongue lightly between teeth. Breath (/θ/) vs Vocal cord hum (/ð/).
            </p>
            <div className="font-mono text-[11px] text-slate-400">think (breath) vs this (vocal)</div>
          </div>
          <button
            onClick={() => handleSpeak('think, thanks, this, that', 'english')}
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors shrink-0 ml-2"
            title="Hear TH contrast"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
