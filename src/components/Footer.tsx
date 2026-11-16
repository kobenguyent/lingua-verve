import React from 'react';
import { BrandMark } from './BrandMark';

interface FooterProps {
  onOpenDiagnostic: () => void;
  onOpenExtensibility: () => void;
  onOpenFalseFriends: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDiagnostic,
  onOpenExtensibility,
  onOpenFalseFriends,
}) => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark className="w-8 h-8" />
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                LinguaVerve
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Open Polyglot
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A tactical language learning field manual built for polyglots and autodidacts—covering CEFR tiers A1 through C2 for English, German, and beyond.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Interactive Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenDiagnostic}
                  className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                >
                  CEFR Level Diagnostic Finder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFalseFriends}
                  className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                >
                  English &amp; German False Friends
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenExtensibility}
                  className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                >
                  Add a New Language Guide
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Polyglot Iron Laws
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>• Output early: Speak from week two</li>
              <li>• Prioritize core lemmas &amp; frequency</li>
              <li>• Phonetics before vocabulary</li>
              <li>• Comprehensible input (i + 1)</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LinguaVerve. Crafted for polyglots and language autodidacts.</p>
          <span className="font-mono">Static · Offline-Ready</span>
        </div>
      </div>
    </footer>
  );
};
