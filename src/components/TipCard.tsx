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
  ChevronUp 
} from 'lucide-react';
import { TipItem } from '../types';
import { CEFR_LEVELS } from '../data/levels';
import { LANGUAGES } from '../data/languages';

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

  const levelInfo = CEFR_LEVELS.find((l) => l.id === tip.level);
  const languageInfo = LANGUAGES.find((lang) => lang.id === tip.languageId);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${tip.title} - ${tip.goldenRule}\n\nVia LinguaVerve Polyglot Blueprint`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article 
      className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md ${
        isMastered
          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
          : isBookmarked
          ? 'border-sky-300 dark:border-sky-800/80'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Header Tags & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Language Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>{languageInfo?.flag || '🌐'}</span>
              <span>{languageInfo?.name || 'Universal Meta'}</span>
            </span>

            {/* CEFR Level Pill */}
            {levelInfo ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${levelInfo.color.bg} ${levelInfo.color.text} ${levelInfo.color.border}`}>
                {levelInfo.id} · {levelInfo.badge}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                All Levels
              </span>
            )}

            {/* Category Pill */}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {tip.category}
            </span>
          </div>

          {/* Time Commitment & Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mr-1">
              <Clock className="w-3 h-3" />
              <span>{tip.timeCommitment}</span>
            </span>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="Copy Tip Summary"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(tip.id)}
              title={isBookmarked ? 'Remove from Saved' : 'Save for Later'}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-sky-500' : ''}`} />
            </button>

            {/* Mastered Button */}
            <button
              onClick={() => onToggleMastered(tip.id)}
              title={isMastered ? 'Mark as In-Progress' : 'Mark as Mastered'}
              className={`p-1.5 rounded-lg transition-colors ${
                isMastered
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'fill-emerald-500 text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Core Summary */}
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {tip.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            {tip.summary}
          </p>
        </div>

        {/* Golden Rule Callout Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
            <span className="font-bold text-amber-950 dark:text-amber-100 uppercase tracking-wide text-[11px] block">
              Golden Polyglot Rule:
            </span>
            {tip.goldenRule}
          </div>
        </div>

        {/* Expand/Collapse Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <span>{isExpanded ? 'Hide Tactical Steps & Examples' : 'Show Tactical Steps & Examples'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            
            {/* Step-by-Step Tactics */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actionable Tactics:
              </span>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {tip.tactics.map((tactic, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Real World Examples */}
            {tip.examples && tip.examples.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Examples:
                </span>
                <div className="space-y-2">
                  {tip.examples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {ex.source}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {ex.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitfall Warning */}
            {tip.commonPitfall && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold text-rose-950 dark:text-rose-100 block">
                    Common Pitfall:
                  </span>
                  {tip.commonPitfall}
                </div>
              </div>
            )}

            {/* Recommended Tools */}
            {tip.recommendedTools && tip.recommendedTools.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Curated Resource:
                </span>
                {tip.recommendedTools.map((tool, idx) => (
                  <a
                    key={idx}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-colors"
                  >
                    <span>{tool.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tip.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
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
