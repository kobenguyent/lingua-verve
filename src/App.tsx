import React, { useState, useEffect, useMemo } from 'react';
import { 
  LANGUAGES, 
  filterTips, 
  ALL_TIPS,
  getLanguage
} from './data';
import { CEFRLevel, Category } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LevelRoadmap } from './components/LevelRoadmap';
import { FilterBar } from './components/FilterBar';
import { TipCard } from './components/TipCard';
import { DiagnosticModal } from './components/DiagnosticModal';
import { FalseFriendsModal } from './components/FalseFriendsModal';
import { ExtensibilityModal } from './components/ExtensibilityModal';
import { RandomTipModal } from './components/RandomTipModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linguaverve_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Filter States
  const [activeLanguageId, setActiveLanguageId] = useState<string>('all');
  const [activeLevel, setActiveLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'saved' | 'mastered'>('all');

  // Bookmarks & Mastered storage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('linguaverve_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('linguaverve_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isFalseFriendsOpen, setIsFalseFriendsOpen] = useState(false);
  const [isExtensibilityOpen, setIsExtensibilityOpen] = useState(false);
  const [isRandomTipOpen, setIsRandomTipOpen] = useState(false);

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('linguaverve_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('linguaverve_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('linguaverve_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Sync mastered to localStorage
  useEffect(() => {
    localStorage.setItem('linguaverve_mastered', JSON.stringify(masteredIds));
  }, [masteredIds]);

  // Toggle bookmark handler
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle mastered handler
  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveLevel('ALL');
    setSelectedCategory('all');
    setSearchQuery('');
    setViewMode('all');
  };

  const hasActiveFilters = 
    activeLevel !== 'ALL' || 
    selectedCategory !== 'all' || 
    searchQuery.trim().length > 0 || 
    viewMode !== 'all';

  // Calculate tips count by level for the active language
  const tipsCountByLevel = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    ALL_TIPS.forEach((tip) => {
      // Check language match
      if (activeLanguageId !== 'all' && tip.languageId !== activeLanguageId && tip.languageId !== 'meta') {
        return;
      }
      counts['ALL'] = (counts['ALL'] || 0) + 1;
      counts[tip.level] = (counts[tip.level] || 0) + 1;
    });
    return counts;
  }, [activeLanguageId]);

  // Filtered tips
  const filteredTips = useMemo(() => {
    return filterTips({
      languageId: activeLanguageId,
      level: activeLevel,
      category: selectedCategory,
      searchQuery,
      bookmarkedIds,
      masteredIds,
      viewMode,
    });
  }, [activeLanguageId, activeLevel, selectedCategory, searchQuery, bookmarkedIds, masteredIds, viewMode]);

  const currentLanguage = activeLanguageId !== 'all' ? getLanguage(activeLanguageId) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        languages={LANGUAGES}
        activeLanguageId={activeLanguageId}
        onSelectLanguage={(id) => {
          setActiveLanguageId(id);
          setActiveLevel('ALL');
        }}
        savedCount={bookmarkedIds.length}
        masteredCount={masteredIds.length}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenFalseFriends={() => setIsFalseFriendsOpen(true)}
        onOpenExtensibility={() => setIsExtensibilityOpen(true)}
        onOpenRandomTip={() => setIsRandomTipOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Hero Section */}
      <HeroSection
        currentLanguage={currentLanguage}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenExtensibility={() => setIsExtensibilityOpen(true)}
        totalTipsCount={ALL_TIPS.length}
      />

      {/* CEFR Level Roadmap Bar */}
      <LevelRoadmap
        activeLevel={activeLevel}
        onSelectLevel={setActiveLevel}
        tipsCountByLevel={tipsCountByLevel}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Filter & Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
          savedCount={bookmarkedIds.length}
          masteredCount={masteredIds.length}
          filteredCount={filteredTips.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Tips Grid */}
        <div className="mt-6">
          {filteredTips.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-4">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No tactical blueprints found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                No tips match your current filter selection. Try clearing search filters or changing the level / category.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTips.map((tip) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  isBookmarked={bookmarkedIds.includes(tip.id)}
                  isMastered={masteredIds.includes(tip.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleMastered={handleToggleMastered}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenExtensibility={() => setIsExtensibilityOpen(true)}
        onOpenFalseFriends={() => setIsFalseFriendsOpen(true)}
      />

      {/* Modals */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onApplyLevel={(level) => {
          setActiveLevel(level);
        }}
      />

      <FalseFriendsModal
        isOpen={isFalseFriendsOpen}
        onClose={() => setIsFalseFriendsOpen(false)}
      />

      <ExtensibilityModal
        isOpen={isExtensibilityOpen}
        onClose={() => setIsExtensibilityOpen(false)}
      />

      <RandomTipModal
        isOpen={isRandomTipOpen}
        onClose={() => setIsRandomTipOpen(false)}
        activeLanguageId={activeLanguageId}
        isBookmarked={false}
        isMastered={false}
        onToggleBookmark={handleToggleBookmark}
        onToggleMastered={handleToggleMastered}
      />

    </div>
  );
};
export default App;
