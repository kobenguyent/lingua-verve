import React from 'react';
import { BrandMark } from './BrandMark';
import { WorkspaceTab } from '../types';

interface FooterProps {
  onOpenDiagnostic: () => void;
  onOpenExtensibility: () => void;
  onOpenFalseFriends: () => void;
  onSelectWorkspace?: (tab: WorkspaceTab) => void;
  onOpenAISettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDiagnostic,
  onOpenExtensibility,
  onOpenFalseFriends,
  onSelectWorkspace,
  onOpenAISettings,
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
                Open Polyglot Academy
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A complete A1–C2 intensive language academy, 4-skill certification exam simulator, AI coach hub, and tactical field manual for English, German, and beyond.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Academy &amp; Simulators
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {onSelectWorkspace && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectWorkspace('courses')}
                      className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                    >
                      A1–C2 Intensive Courses &amp; Official Mocks
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectWorkspace('pretest')}
                      className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                    >
                      Scored 4-Skill Placement Pre-Test
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectWorkspace('simulator')}
                      className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                    >
                      High-Pressure 4-Skill Exam Arena
                    </button>
                  </li>
                </>
              )}
              {onOpenAISettings && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAISettings}
                    className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                  >
                    Connect Local / Cloud AI Provider
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Field Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenDiagnostic}
                  className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                >
                  Quick CEFR Self-Check
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
              <li>
                <a
                  href="https://github.com/kobenguyent/lingua-verve/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Download Native Apple App (macOS / iOS) ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LinguaVerve. Built for polyglots, exam candidates, and autodidacts.</p>
          <span className="font-mono">GitHub Pages Ready · Local &amp; Cloud AI · 4-Skill CEFR</span>
        </div>
      </div>
    </footer>
  );
};
