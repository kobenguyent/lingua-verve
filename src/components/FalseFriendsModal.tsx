import React, { useState } from 'react';
import { X, AlertTriangle, Search, Lightbulb, Check, Volume2 } from 'lucide-react';
import { FALSE_FRIENDS } from '../data/falseFriends';
import { soundEngine } from '../utils/audio';

interface FalseFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FalseFriendsModal: React.FC<FalseFriendsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [activeLang, setActiveLang] = useState<'all' | 'german' | 'english'>('all');

  if (!isOpen) return null;

  const handleSpeak = (text: string, lang: string) => {
    soundEngine.playClickSound();
    soundEngine.speak(text, lang, true);
  };

  const filteredItems = FALSE_FRIENDS.filter((item) => {
    if (activeLang !== 'all' && item.languageId !== activeLang) {
      return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        item.word.toLowerCase().includes(q) ||
        item.confusedWith.toLowerCase().includes(q) ||
        item.actualMeaning.toLowerCase().includes(q) ||
        item.memoryHack.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                False Friends & Deceptive Cognates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual cards & audio pronunciation to prevent catastrophic language misunderstandings.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search words (e.g. Gift, Bekommen, Chef, Brav)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => {
                soundEngine.playClickSound();
                setActiveLang('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeLang === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                setActiveLang('german');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeLang === 'german'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              🇩🇪 German Traps
            </button>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                setActiveLang('english');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeLang === 'english'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              🇬🇧 English Traps
            </button>
          </div>
        </div>

        {/* List of False Friends with Audio & Photos */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No false friends match your search query.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo if present */}
                  {item.imageUrl && (
                    <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.word}
                        className="w-full h-full object-cover opacity-85"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600/90 text-white shadow">
                          High Hazard
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                          {item.word}
                        </span>
                        {/* Audio pronunciation button for the word */}
                        <button
                          onClick={() => handleSpeak(item.word, item.languageId)}
                          title={`Listen to pronunciation (${item.languageId})`}
                          className="p-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!item.imageUrl && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          Trap
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-rose-600 dark:text-rose-400 font-medium">
                        ❌ Confused with: <strong>{item.confusedWith}</strong>
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Actual meaning: <strong>{item.actualMeaning}</strong></span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                      <div className="text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <div>
                          <strong>Say instead:</strong> {item.correctAlternative}
                        </div>
                        <button
                          onClick={() => handleSpeak(item.correctAlternative.split('->')[0].trim(), item.languageId)}
                          className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Listen to correct alternative"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 italic">
                        {item.mistakeExample}
                      </div>
                    </div>

                    {/* Memory Hack */}
                    <div className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <span><strong>Hack:</strong> {item.memoryHack}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
