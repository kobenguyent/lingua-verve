import React from 'react';
import { Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export const PrepositionPyramid: React.FC = () => {
  const handleSpeak = (text: string) => {
    soundEngine.playClickSound();
    soundEngine.speak(text, 'english');
  };

  return (
    <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white border border-sky-500/30 shadow-lg">
      <div className="text-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
          Visual Spatial & Temporal Mental Model
        </span>
        <h4 className="text-sm font-extrabold text-white">
          The Inverted Pyramid of IN, ON, AT
        </h4>
      </div>

      <div className="max-w-md mx-auto space-y-2 text-xs">
        {/* Tier 1: IN (Broadest) */}
        <div className="p-3 rounded-xl bg-sky-600/40 border border-sky-400/40 flex items-center justify-between group hover:bg-sky-600/60 transition-colors">
          <div className="space-y-0.5">
            <div className="font-extrabold text-sm tracking-wider text-sky-200 flex items-center gap-2">
              <span>IN</span>
              <span className="text-[10px] font-normal text-sky-300 uppercase px-1.5 py-0.2 bg-sky-900/60 rounded">
                General / Broad
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Time:</strong> Centuries, Decades, Years, Months (<em>in 2026, in July</em>)<br />
              <strong>Space:</strong> Countries, Cities, Enclosed Rooms (<em>in France, in the room</em>)
            </p>
          </div>
          <button
            onClick={() => handleSpeak('in France, in July')}
            className="p-2 rounded-lg bg-sky-500/30 hover:bg-sky-500/60 text-sky-200 transition-colors"
            title="Listen to examples"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tier 2: ON (Specific) */}
        <div className="p-3 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-between group hover:bg-indigo-600/60 transition-colors ml-4 mr-4">
          <div className="space-y-0.5">
            <div className="font-extrabold text-sm tracking-wider text-indigo-200 flex items-center gap-2">
              <span>ON</span>
              <span className="text-[10px] font-normal text-indigo-300 uppercase px-1.5 py-0.2 bg-indigo-900/60 rounded">
                Medium / Surface
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Time:</strong> Days, Dates (<em>on Monday, on my birthday</em>)<br />
              <strong>Space:</strong> Streets, Avenues, Surfaces (<em>on Oxford Street, on the table</em>)
            </p>
          </div>
          <button
            onClick={() => handleSpeak('on Monday, on Oxford Street')}
            className="p-2 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/60 text-indigo-200 transition-colors"
            title="Listen to examples"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tier 3: AT (Most Precise) */}
        <div className="p-3 rounded-xl bg-amber-600/40 border border-amber-400/40 flex items-center justify-between group hover:bg-amber-600/60 transition-colors ml-8 mr-8">
          <div className="space-y-0.5">
            <div className="font-extrabold text-sm tracking-wider text-amber-200 flex items-center gap-2">
              <span>AT</span>
              <span className="text-[10px] font-normal text-amber-300 uppercase px-1.5 py-0.2 bg-amber-900/60 rounded">
                Exact Point
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Time:</strong> Exact Hours, Clock Time (<em>at 5:30 PM, at midnight</em>)<br />
              <strong>Space:</strong> Exact Address, Specific Point (<em>at 10 Downing St, at the bus stop</em>)
            </p>
          </div>
          <button
            onClick={() => handleSpeak('at five thirty pm, at the bus stop')}
            className="p-2 rounded-lg bg-amber-500/30 hover:bg-amber-500/60 text-amber-200 transition-colors"
            title="Listen to examples"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
