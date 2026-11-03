import React, { useState } from 'react';
import { X, Sparkles, RotateCw, Lightbulb, CheckCircle2, Bookmark } from 'lucide-react';
import { TipItem } from '../types';
import { getRandomTip } from '../data';

interface RandomTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguageId: string;
  isBookmarked: boolean;
  isMastered: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const RandomTipModal: React.FC<RandomTipModalProps> = ({
  isOpen,
  onClose,
  activeLanguageId,
  isBookmarked,
  isMastered,
  onToggleBookmark,
  onToggleMastered,
}) => {
  const [tip, setTip] = useState<TipItem>(() => getRandomTip(activeLanguageId));

  if (!isOpen) return null;

  const handleRollAgain = () => {
    setTip(getRandomTip(activeLanguageId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Daily Tactical Micro-Blueprint
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Randomized high-leverage habit for immediate practice.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Level {tip.level}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {tip.category}
            </span>
          </div>

          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {tip.title}
          </h4>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {tip.summary}
          </p>

          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
              <strong className="block text-[11px] uppercase tracking-wide">Golden Rule:</strong>
              {tip.goldenRule}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quick Action Steps:
            </span>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              {tip.tactics.slice(0, 2).map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleRollAgain}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Roll Another Tip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(tip.id)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isBookmarked
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-sky-500' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onToggleMastered(tip.id)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isMastered
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'fill-emerald-500 text-white' : ''}`} />
              <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
