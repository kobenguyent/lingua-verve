import React from 'react';
import { Search, X, Bookmark, CheckCircle2, BookOpen } from 'lucide-react';
import { Category } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  viewMode: 'all' | 'saved' | 'mastered';
  onSelectViewMode: (mode: 'all' | 'saved' | 'mastered') => void;
  savedCount: number;
  masteredCount: number;
  filteredCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORIES: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'pronunciation', label: 'Pronunciation & Phonetics', icon: '🗣️' },
  { id: 'grammar', label: 'Grammar Cheat-Codes', icon: '🧩' },
  { id: 'vocabulary', label: 'Vocabulary & Chunks', icon: '📚' },
  { id: 'speaking', label: 'Spontaneous Speaking', icon: '💬' },
  { id: 'immersion', label: 'Immersion & Listening', icon: '🎧' },
  { id: 'mindset', label: 'Polyglot Mindset', icon: '🧠' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onSelectViewMode,
  savedCount,
  masteredCount,
  filteredCount,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="py-4 space-y-4">
      {/* Top Row: Search and View Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rules, phonetics, false friends, tactics..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Tabs: All / Saved / Mastered */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => onSelectViewMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Tips</span>
          </button>

          <button
            onClick={() => onSelectViewMode('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'saved'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-sky-500" />
            <span>Saved ({savedCount})</span>
          </button>

          <button
            onClick={() => onSelectViewMode('mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'mastered'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mastered ({masteredCount})</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 whitespace-nowrap transition-colors flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Result Counter & Active Filter Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong>{filteredCount}</strong> actionable tactical {filteredCount === 1 ? 'blueprint' : 'blueprints'}
        </span>
      </div>
    </div>
  );
};
