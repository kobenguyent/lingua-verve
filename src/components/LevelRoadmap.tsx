import React from 'react';
import { CEFRLevel, LevelDetail } from '../types';
import { CEFR_LEVELS } from '../data/levels';
import { CheckCircle2, Clock, Target, Layers } from 'lucide-react';

interface LevelRoadmapProps {
  activeLevel: CEFRLevel | 'ALL';
  onSelectLevel: (level: CEFRLevel | 'ALL') => void;
  tipsCountByLevel: Record<string, number>;
}

export const LevelRoadmap: React.FC<LevelRoadmapProps> = ({
  activeLevel,
  onSelectLevel,
  tipsCountByLevel,
}) => {
  const activeDetail: LevelDetail | undefined =
    activeLevel !== 'ALL' ? CEFR_LEVELS.find(l => l.id === activeLevel) : undefined;

  return (
    <section aria-label="CEFR Progression Pipeline" className="py-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>CEFR Progression Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any proficiency tier to filter blueprints and inspect milestone targets.
            </p>
          </div>

          <button
            type="button"
            aria-pressed={activeLevel === 'ALL'}
            onClick={() => onSelectLevel('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors self-start sm:self-auto ${
              activeLevel === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Levels ({tipsCountByLevel['ALL'] || 0})
          </button>
        </div>

        {/* Level Track Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = activeLevel === lvl.id;
            const count = tipsCountByLevel[lvl.id] || 0;

            return (
              <button
                type="button"
                key={lvl.id}
                aria-pressed={isSelected}
                onClick={() => onSelectLevel(lvl.id)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between hover:-translate-y-0.5 ${
                  isSelected
                    ? `${lvl.color.bg} ${lvl.color.border} ring-1 ring-sky-600 dark:ring-sky-400 shadow-sm`
                    : 'bg-[#FAF9F6] dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-base font-mono font-bold ${isSelected ? lvl.color.text : 'text-slate-900 dark:text-slate-100'}`}>
                    {lvl.id}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                    {count}
                  </span>
                </div>

                <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                  {lvl.stageName}
                </div>

                <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{lvl.hoursEstimated.split(' ')[0]}h</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Level Detail Drawer */}
        {activeDetail && (
          <div className="mt-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${activeDetail.color.bg} ${activeDetail.color.text} border ${activeDetail.color.border}`}>
                    {activeDetail.badge}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {activeDetail.name} — {activeDetail.stageName}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span><strong>Milestone Target:</strong> {activeDetail.milestoneGoal}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Est: <strong>{activeDetail.hoursEstimated}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                CEFR Can-Do Capabilities
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {activeDetail.canDoSummary.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
