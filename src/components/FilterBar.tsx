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

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'pronunciation', label: 'Pronunciation & Phonetics' },
  { id: 'grammar', label: 'Grammar Cheat-Codes' },
  { id: 'vocabulary', label: 'Vocabulary & Chunks' },
  { id: 'speaking', label: 'Spontaneous Speaking' },
  { id: 'immersion', label: 'Immersion & Listening' },
  { id: 'mindset', label: 'Polyglot Mindset' },
  { id: 'habits', label: 'Habits' },
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="blueprint-search" className="sr-only">
            Search rules, phonetics, false friends, and tactics
          </label>
          <input
            id="blueprint-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rules, phonetics, false friends, tactics..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            aria-pressed={viewMode === 'all'}
            onClick={() => onSelectViewMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Tips</span>
          </button>

          <button
            type="button"
            aria-pressed={viewMode === 'saved'}
            onClick={() => onSelectViewMode('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tabular-nums flex items-center gap-1.5 transition-colors ${
              viewMode === 'saved'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="font-sans">Saved ({savedCount})</span>
          </button>

          <button
            type="button"
            aria-pressed={viewMode === 'mastered'}
            onClick={() => onSelectViewMode('mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tabular-nums flex items-center gap-1.5 transition-colors ${
              viewMode === 'mastered'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-sans">Mastered ({masteredCount})</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 whitespace-nowrap transition-colors flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
        <span>
          Showing <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{filteredCount}</strong> actionable tactical {filteredCount === 1 ? 'blueprint' : 'blueprints'}
        </span>
      </div>
    </div>
  );
};
