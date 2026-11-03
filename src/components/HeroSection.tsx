import React from 'react';
import { Sparkles, Compass, Zap, ArrowRight, Volume2 } from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/audio';

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
  const handlePlaySoundFeature = (sound: string) => {
    soundEngine.playClickSound();
    // Speak a helpful representative word for that sound
    if (sound.includes('Schwa')) {
      soundEngine.speak('banana, photograph, today', 'english');
    } else if (sound.includes('TH')) {
      soundEngine.speak('think, three, this, that', 'english');
    } else if (sound.includes('Umlaut')) {
      soundEngine.speak('Küche, schön, Käse', 'german');
    } else if (sound.includes('Ich-Laut')) {
      soundEngine.speak('ich, nicht, Buch, Bach', 'german');
    } else if (sound.includes('Knacklaut')) {
      soundEngine.speak('Vereinbaren, Spiegelei', 'german');
    } else {
      soundEngine.speak(sound, currentLanguage?.id || 'english');
    }
  };

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
              tactical blueprints, pronunciation audio, visual mental models, and grammatical cheat-codes for <strong>English</strong>, <strong>German</strong>, and beyond.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenDiagnostic();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all group"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Take 2-Min Level Diagnostic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenExtensibility();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Extensible Architecture</span>
              </button>
            </div>
          </div>

          {/* Current Language Snapshot Card with Photo & Audio */}
          <div className="w-full lg:w-96 flex-shrink-0">
            {currentLanguage && currentLanguage.id !== 'all' ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden space-y-3 relative group">
                
                {/* Visual Photo Header */}
                {currentLanguage.imageUrl && (
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={currentLanguage.imageUrl}
                      alt={currentLanguage.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold text-xs drop-shadow">
                        📸 {currentLanguage.imageCaption}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/20">
                        {currentLanguage.difficultyRating.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 pt-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentLanguage.flag}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                          {currentLanguage.name}
                          <span className="text-xs text-slate-400 font-normal">({currentLanguage.nativeName})</span>
                        </h3>
                        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{currentLanguage.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    {currentLanguage.description}
                  </p>

                  {/* Key phonetic features with audio click */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Phonetic Vectors (Click to Hear)
                      </span>
                      <span className="text-[10px] text-sky-500 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Interactive</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentLanguage.soundFeatures.map((sound, i) => (
                        <button
                          key={i}
                          onClick={() => handlePlaySoundFeature(sound)}
                          title={`Click to listen to ${sound}`}
                          className="text-[11px] font-mono px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 transition-colors flex items-center gap-1 group/btn"
                        >
                          <Volume2 className="w-3 h-3 text-sky-500 group-hover/btn:scale-110 transition-transform" />
                          <span>{sound}</span>
                        </button>
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
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl overflow-hidden relative group">
                <div className="relative h-28 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
                    alt="Polyglot Index"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-xs font-semibold drop-shadow">
                    🌐 Global Polyglot Knowledge Engine
                  </div>
                </div>

                <div className="p-4 pt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <h3 className="font-bold text-white text-sm">Universal Language Suite</h3>
                      <p className="text-xs text-sky-300">English, German & Polyglot Meta Tactics</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Visual mental models and native speech synthesis available across all {totalTipsCount} curated blueprints.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-slate-400">Total Active Blueprints:</span>
                    <span className="font-bold text-sky-400">{totalTipsCount} with Audio</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
