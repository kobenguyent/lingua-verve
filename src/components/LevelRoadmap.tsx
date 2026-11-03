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
    <div className="py-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>CEFR Progression Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any level to reveal specific tactical breakthroughs and milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectLevel('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLevel === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Levels ({tipsCountByLevel['ALL'] || 0})
            </button>
          </div>
        </div>

        {/* Level Track Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = activeLevel === lvl.id;
            const count = tipsCountByLevel[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`relative p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${lvl.color.bg} ${lvl.color.border} ring-2 ring-sky-500 shadow-md`
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-base font-extrabold ${isSelected ? lvl.color.text : 'text-slate-800 dark:text-slate-100'}`}>
                    {lvl.id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-medium text-slate-600 dark:text-slate-300">
                    {count} tips
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                  {lvl.stageName}
                </div>

                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{lvl.hoursEstimated.split(' ')[0]}h</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Level Detail Drawer */}
        {activeDetail && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-sky-50/30 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${activeDetail.color.bg} ${activeDetail.color.text} border ${activeDetail.color.border}`}>
                    {activeDetail.badge}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {activeDetail.name} — {activeDetail.stageName}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span><strong>Milestone Target:</strong> {activeDetail.milestoneGoal}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Estimated Time: <strong>{activeDetail.hoursEstimated}</strong></span>
              </div>
            </div>

            {/* Can Do Statements */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                CEFR Can-Do Capabilities (What you will achieve):
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {activeDetail.canDoSummary.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
