import React from 'react';
import { ArrowRight, MapPin, Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export const TwoWayPrepositionsVisual: React.FC = () => {
  const handleSpeak = (text: string) => {
    soundEngine.playClickSound();
    soundEngine.speak(text, 'german');
  };

  return (
    <div className="my-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
      <div className="text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          Spatial Movement Dynamics
        </span>
        <h4 className="text-sm font-extrabold text-white">
          Wechselpräpositionen: Movement vs. State
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* Akkusativ (Wohin? Movement) */}
        <div className="p-3.5 rounded-xl bg-sky-950/70 border border-sky-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sky-400 text-sm flex items-center gap-1.5">
              <span>WOHIN?</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300">
              Akkusativ
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Dynamic action, boundary crossing, or target destination.
          </p>
          <div className="p-2 rounded-lg bg-sky-900/40 border border-sky-700/50 font-mono text-[11px] text-sky-200">
            Ich lege das Buch auf <strong>den</strong> Tisch.
          </div>
          <button
            onClick={() => handleSpeak('Ich lege das Buch auf den Tisch')}
            className="w-full py-1.5 px-2 rounded-lg bg-sky-600/30 hover:bg-sky-600/60 text-sky-200 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Akkusativ Movement</span>
          </button>
        </div>

        {/* Dativ (Wo? Stationary Location) */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
              <span>WO?</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
              Dativ
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Stationary state, location within an established sphere.
          </p>
          <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/50 font-mono text-[11px] text-emerald-200">
            Das Buch liegt auf <strong>dem</strong> Tisch.
          </div>
          <button
            onClick={() => handleSpeak('Das Buch liegt auf dem Tisch')}
            className="w-full py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-200 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Dativ Location</span>
          </button>
        </div>

      </div>
    </div>
  );
};
