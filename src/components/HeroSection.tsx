import React from 'react';
import { Sparkles, Compass, Zap, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface HeroSectionProps {
  currentLanguage?: Language;
  onOpenDiagnostic: () => void;
  onOpenExtensibility: () => void;
  totalTipsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLanguage,
  onOpenDiagnostic,
  onOpenExtensibility,
  totalTipsCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-sky-50/50 via-white to-transparent dark:from-slate-900/40 dark:via-slate-950 dark:to-transparent">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-r from-sky-400/10 via-indigo-500/10 to-amber-400/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Main Headline */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100/80 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800/60">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Engineered by Polyglots for Serious Learners</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Deconstruct Any Language <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 dark:from-sky-400 dark:via-indigo-300 dark:to-amber-300">
                From A1 Beginner to C2 Mastery
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Tired of endless vocab drills without conversational flow? LinguaVerve delivers high-leverage 
              tactical blueprints, pronunciation hacks, and grammatical cheat-codes for <strong>English</strong>, <strong>German</strong>, and beyond.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenDiagnostic}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all group"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Take 2-Min Level Diagnostic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenExtensibility}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Extensible Architecture</span>
              </button>
            </div>
          </div>

          {/* Current Language Snapshot Card */}
          <div className="w-full lg:w-96 flex-shrink-0">
            {currentLanguage && currentLanguage.id !== 'all' ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{currentLanguage.flag}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {currentLanguage.name}
                        <span className="text-xs text-slate-400 font-normal">({currentLanguage.nativeName})</span>
                      </h3>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{currentLanguage.tagline}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentLanguage.difficultyRating.split(' ')[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  {currentLanguage.description}
                </p>

                {/* Key phonetic features */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Sonic Target Vectors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLanguage.soundFeatures.map((sound, i) => (
                      <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                        {sound}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estimated C1 Investment */}
                {currentLanguage.estimatedHoursToC1 > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Est. Hours to C1:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{currentLanguage.estimatedHoursToC1} hours</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-3 relative">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h3 className="font-bold text-white">Full Polyglot Index</h3>
                    <p className="text-xs text-sky-300">Tactics for English, German & Universal Meta</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse cross-language tactical insights or pick a specific language above. Each level represents concrete behavioral milestones.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-slate-400">Tactical Knowledge Base:</span>
                  <span className="font-bold text-sky-400">{totalTipsCount} Curated Blueprints</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
