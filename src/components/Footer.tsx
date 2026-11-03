import React from 'react';
import { Sparkles } from 'lucide-react';

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
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-300 dark:to-purple-400">
                LinguaVerve
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                Open Polyglot Project
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A high-precision, tactical language learning knowledge base built for polyglots and serious autodidacts. 
              Covering CEFR tiers A1 through C2 for English, German, and modularly architected for the world&apos;s languages.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Deployable to GitHub Pages with zero external backend dependencies.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Interactive Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={onOpenDiagnostic}
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left"
                >
                  CEFR Level Diagnostic Finder
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenFalseFriends}
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left"
                >
                  English & German False Friends
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenExtensibility}
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left"
                >
                  Add a New Language Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Polyglot Principles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Polyglot Iron Laws
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>• Output early: Speak from week two</li>
              <li>• Prioritize core lemmas & frequency</li>
              <li>• Phonetics before vocabulary</li>
              <li>• Comprehensible input (i + 1)</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LinguaVerve. Crafted for polyglots, autodidacts, and language obsessives.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Ready for GitHub Pages</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
