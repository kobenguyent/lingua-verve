import React from 'react';
import {
  Globe2,
  Bookmark,
  CheckCircle2,
  Compass,
  AlertTriangle,
  PlusCircle,
  Moon,
  Sun,
  Shuffle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Language } from '../types';
import { BrandMark } from './BrandMark';

interface NavbarProps {
  languages: Language[];
  activeLanguageId: string;
  onSelectLanguage: (id: string) => void;
  savedCount: number;
  masteredCount: number;
  onOpenDiagnostic: () => void;
  onOpenFalseFriends: () => void;
  onOpenExtensibility: () => void;
  onOpenRandomTip: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  languages,
  activeLanguageId,
  onSelectLanguage,
  savedCount,
  masteredCount,
  onOpenDiagnostic,
  onOpenFalseFriends,
  onOpenExtensibility,
  onOpenRandomTip,
  isDarkMode,
  onToggleDarkMode,
  isMuted = false,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F6]/85 dark:bg-[#0B0E14]/85 border-b border-slate-200/80 dark:border-slate-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0 rounded-lg">
            <BrandMark className="w-9 h-9 shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-slate-50">
                  LinguaVerve
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  CEFR
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Tactical Language Blueprint
              </span>
            </div>
          </a>

          {/* Language Switcher */}
          <nav aria-label="Target languages" className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              aria-pressed={activeLanguageId === 'all'}
              onClick={() => onSelectLanguage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeLanguageId === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 shrink-0" />
              <span>All Languages</span>
            </button>

            {languages.filter(l => l.status === 'active').map((lang) => (
              <button
                type="button"
                key={lang.id}
                aria-pressed={activeLanguageId === lang.id}
                onClick={() => onSelectLanguage(lang.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeLanguageId === lang.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.id === 'meta' ? 'Meta-System' : lang.name}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={onOpenExtensibility}
              title="Add more languages (Extensible architecture)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Extend</span>
            </button>
          </nav>

          {/* Actions & Progress Counters */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenRandomTip}
              title="Random Tactical Tip"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Random</span>
            </button>

            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Diagnostic</span>
              <span className="sm:hidden">Quiz</span>
            </button>

            <button
              type="button"
              onClick={onOpenFalseFriends}
              title="False Friends & Traps"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="hidden md:inline">False Friends</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1" title="Saved Tips">
                <Bookmark className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span className="font-semibold">{savedCount}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="flex items-center gap-1" title="Mastered Tips">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{masteredCount}</span>
              </span>
            </div>

            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                title={isMuted ? 'Sound effects muted' : 'Sound effects active'}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
              </button>
            )}

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Language Bar */}
        <div className="md:hidden flex items-center gap-1.5 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectLanguage('all')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeLanguageId === 'all'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {languages.filter(l => l.status === 'active').map((lang) => (
            <button
              type="button"
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
                activeLanguageId === lang.id
                  ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenExtensibility}
            className="px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            + Extend
          </button>
        </div>
      </div>
    </header>
  );
};
