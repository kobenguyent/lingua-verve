import React from 'react';
import { 
  Globe2, 
  Bookmark, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  PlusCircle, 
  Moon, 
  Sun,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Language } from '../types';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 p-[2px] shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-xl">🌐</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-300 dark:to-purple-400">
                    LinguaVerve
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                    Polyglot
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Tactical Language Mastery
                </span>
              </div>
            </a>
          </div>

          {/* Language Switcher Pills */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onSelectLanguage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeLanguageId === 'all'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>All Languages</span>
            </button>

            {languages.filter(l => l.status === 'active').map((lang) => (
              <button
                key={lang.id}
                onClick={() => onSelectLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeLanguageId === lang.id
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}

            <button
              onClick={onOpenExtensibility}
              title="Add more languages (Extensible architecture)"
              className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Add Language</span>
            </button>
          </div>

          {/* Quick Action Buttons & Stats */}
          <div className="flex items-center gap-2">
            
            {/* Daily Inspiration / Random Tip */}
            <button
              onClick={onOpenRandomTip}
              title="Random Tactical Tip"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Random Tip</span>
            </button>

            {/* Diagnostic Quiz Button */}
            <button
              onClick={onOpenDiagnostic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Level Diagnostic</span>
              <span className="sm:hidden">Quiz</span>
            </button>

            {/* False Friends Button */}
            <button
              onClick={onOpenFalseFriends}
              title="False Friends & Traps"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">False Friends</span>
            </button>

            {/* Bookmarks Counter */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1" title="Saved Tips">
                <Bookmark className="w-3 h-3 text-sky-500 fill-sky-500/20" />
                <span className="font-bold">{savedCount}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="flex items-center gap-1" title="Mastered Tips">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                <span className="font-bold">{masteredCount}</span>
              </span>
            </div>

            {/* Audio Effects Toggle */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                title={isMuted ? 'Sound effects muted' : 'Sound effects active'}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-500" />}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Language Bar */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectLanguage('all')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeLanguageId === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            🌐 All
          </button>
          {languages.filter(l => l.status === 'active').map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
                activeLanguageId === lang.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
          <button
            onClick={onOpenExtensibility}
            className="px-2 py-1 rounded-md text-xs whitespace-nowrap font-medium bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            + More
          </button>
        </div>
      </div>
    </header>
  );
};
