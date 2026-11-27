import React from 'react';
import { Compass, Layers, ArrowRight, Volume2 } from 'lucide-react';
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
    } else if (sound.includes('Uvular')) {
      soundEngine.speak('Paris, merci, très bien', 'french');
    } else if (sound.includes('Nasalized')) {
      soundEngine.speak('bonjour, pain, enfant, lundi', 'french');
    } else if (sound.includes('Liaison')) {
      soundEngine.speak('les amis, nous avons, un petit enfant', 'french');
    } else if (sound.includes('Pitch accent')) {
      soundEngine.speak('はし、あめ、こんにちは', 'japanese');
    } else if (sound.includes('Mora')) {
      soundEngine.speak('きって、おばあさん、ありがとう', 'japanese');
    } else {
      soundEngine.speak(sound, currentLanguage?.id || 'english');
    }
  };

  return (
    <section className="pt-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#FAF9F6] dark:bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start lg:items-center gap-8">

          {/* Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-200/70 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
              <span>CEFR A1 → C2</span>
              <span className="text-slate-400">·</span>
              <span>Applied Linguistics Field Manual</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12]">
              Deconstruct any language{' '}
              <span className="text-sky-700 dark:text-sky-400 underline decoration-sky-500/30 underline-offset-4">
                from A1 breakthrough to C2 mastery
              </span>
              .
            </h1>

            <p className="text-base sm:text-[17px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
              Replace low-yield vocabulary tapping with structural grammar rules, IPA articulatory phonetics,
              false-friend traps, and native pronunciation audio across <strong>English</strong>, <strong>German</strong>, and polyglot meta-systems.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenDiagnostic();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 transition-colors group"
              >
                <Compass className="w-4 h-4" />
                <span>Take 2-Min Level Diagnostic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  onOpenExtensibility();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Add New Language</span>
              </button>
            </div>
          </div>

          {/* Language / System Dossier Card */}
          <div className="lg:col-span-5">
            {currentLanguage && currentLanguage.id !== 'all' ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden group">
                {currentLanguage.imageUrl && (
                  <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                    <img
                      src={currentLanguage.imageUrl}
                      alt={currentLanguage.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" aria-hidden="true">{currentLanguage.flag}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <span>{currentLanguage.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({currentLanguage.nativeName})</span>
                        </h3>
                        <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">{currentLanguage.tagline}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {currentLanguage.difficultyRating.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentLanguage.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Phonetic Vectors (Click to Hear)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentLanguage.soundFeatures.map((sound, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => handlePlaySoundFeature(sound)}
                          title={`Click to listen to ${sound}`}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span>{sound}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentLanguage.estimatedHoursToC1 > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Est. Investment to C1</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        ~{currentLanguage.estimatedHoursToC1} hours
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Knowledge Index
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      Universal Polyglot Suite
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-semibold tabular-nums bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {totalTipsCount} Blueprints
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Active Tracks</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">English · German · Meta</dd>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Visual Models</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">4 SVG Schematics + Audio</dd>
                  </div>
                </dl>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Select a target language above or filter by CEFR tier below to isolate exact structural rules and phonetic drills.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
