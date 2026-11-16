import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Share2,
  Check,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
  Volume2,
  Gauge
} from 'lucide-react';
import { TipItem } from '../types';
import { CEFR_LEVELS } from '../data/levels';
import { LANGUAGES } from '../data/languages';
import { soundEngine } from '../utils/audio';
import { PrepositionPyramid } from './diagrams/PrepositionPyramid';
import { GermanGenderCards } from './diagrams/GermanGenderCards';
import { TwoWayPrepositionsVisual } from './diagrams/TwoWayPrepositionsVisual';
import { PhoneticsVisualizer } from './diagrams/PhoneticsVisualizer';

interface TipCardProps {
  tip: TipItem;
  isBookmarked: boolean;
  isMastered: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const TipCard: React.FC<TipCardProps> = ({
  tip,
  isBookmarked,
  isMastered,
  onToggleBookmark,
  onToggleMastered,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [slowAudio, setSlowAudio] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);

  const levelInfo = CEFR_LEVELS.find((l) => l.id === tip.level);
  const languageInfo = LANGUAGES.find((lang) => lang.id === tip.languageId);

  const handleCopy = () => {
    soundEngine.playClickSound();
    navigator.clipboard.writeText(`${tip.title} - ${tip.goldenRule}\n\nVia LinguaVerve Polyglot Blueprint`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmarkWithSound = () => {
    soundEngine.playClickSound();
    onToggleBookmark(tip.id);
  };

  const handleToggleMasteredWithSound = () => {
    if (!isMastered) {
      soundEngine.playSuccessChime();
    } else {
      soundEngine.playClickSound();
    }
    onToggleMastered(tip.id);
  };

  const handleSpeakText = (text: string) => {
    soundEngine.playClickSound();
    setCurrentlySpeaking(text);
    soundEngine.speak(text, tip.languageId, slowAudio);
    setTimeout(() => setCurrentlySpeaking(null), 3500);
  };

  return (
    <article
      className={`rounded-2xl transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md overflow-hidden ${
        isMastered
          ? 'border-emerald-300/90 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
          : isBookmarked
          ? 'border-sky-300/90 dark:border-sky-800/80'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {tip.imageUrl && (
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 group">
          <img
            src={tip.imageUrl}
            alt={tip.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Tags & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>{languageInfo?.flag || '🌐'}</span>
              <span>{languageInfo?.name || 'Universal Meta'}</span>
            </span>

            {levelInfo ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${levelInfo.color.bg} ${levelInfo.color.text} ${levelInfo.color.border}`}>
                {levelInfo.id} · {levelInfo.badge}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                All Levels
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {tip.category}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mr-1">
              <Clock className="w-3 h-3" />
              <span>{tip.timeCommitment}</span>
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy Tip Summary"
              aria-label="Copy Tip Summary"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleToggleBookmarkWithSound}
              title={isBookmarked ? 'Remove from Saved' : 'Save for Later'}
              aria-label={isBookmarked ? 'Remove from Saved' : 'Save for Later'}
              aria-pressed={isBookmarked}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-sky-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleToggleMasteredWithSound}
              title={isMastered ? 'Mark as In-Progress' : 'Mark as Mastered'}
              aria-label={isMastered ? 'Mark as In-Progress' : 'Mark as Mastered'}
              aria-pressed={isMastered}
              className={`p-1.5 rounded-lg transition-colors ${
                isMastered
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'fill-emerald-500 text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Summary */}
        <div>
          <h3 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
            {tip.title}
          </h3>
          <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-[68ch]">
            {tip.summary}
          </p>
        </div>

        {/* Golden Rule Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
          <div className="text-sm sm:text-[15px] font-medium text-amber-950 dark:text-amber-100 leading-relaxed">
            <span className="font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide text-xs block mb-0.5">
              Golden Polyglot Rule
            </span>
            {tip.goldenRule}
          </div>
        </div>

        {tip.diagramType === 'preposition-pyramid' && <PrepositionPyramid />}
        {tip.diagramType === 'german-gender' && <GermanGenderCards />}
        {tip.diagramType === 'two-way-prepositions' && <TwoWayPrepositionsVisual />}
        {tip.diagramType === 'mouth-phonetics' && <PhoneticsVisualizer languageId={tip.languageId} />}

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
          >
            <span>{isExpanded ? 'Hide Tactical Steps & Audio' : 'Show Tactical Steps & Audio'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            aria-pressed={slowAudio}
            onClick={() => setSlowAudio(!slowAudio)}
            title="Toggle normal speed vs 0.75x slow speed for audio pronunciation"
            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
              slowAudio
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>{slowAudio ? '0.75x Slow' : '1.0x Pace'}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Actionable Tactics
              </span>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {tip.tactics.map((tactic, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {tip.examples && tip.examples.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Target Examples (Listen)
                </span>
                <div className="space-y-2">
                  {tip.examples.map((ex, idx) => {
                    const phraseToSpeak = ex.source.split('(')[0].replace(/vs\./gi, '').trim();
                    const isSpeakingThis = currentlySpeaking === phraseToSpeak;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-sm flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {ex.source}
                          </div>
                          <div className="text-[13px] text-slate-600 dark:text-slate-400 mt-1">
                            {ex.explanation}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSpeakText(phraseToSpeak)}
                          title={`Listen to pronunciation (${tip.languageId})`}
                          aria-label={`Listen to ${phraseToSpeak}`}
                          className={`p-2 rounded-lg border shrink-0 transition-colors ${
                            isSpeakingThis
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tip.commonPitfall && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[13px] text-rose-900 dark:text-rose-200 leading-relaxed">
                  <span className="font-mono font-bold text-rose-950 dark:text-rose-100 uppercase tracking-wide text-xs block mb-0.5">
                    Common Pitfall
                  </span>
                  {tip.commonPitfall}
                </div>
              </div>
            )}

            {tip.recommendedTools && tip.recommendedTools.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Resource:
                </span>
                {tip.recommendedTools.map((tool, idx) => (
                  <a
                    key={idx}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <span>{tool.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tip.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
