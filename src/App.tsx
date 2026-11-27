import React, { useState, useEffect, useMemo } from 'react';
import {
  LANGUAGES,
  filterTips,
  ALL_TIPS,
  getLanguage,
} from './data';
import {
  AIProviderConfig,
  AISessionRecord,
  CEFRLevel,
  Category,
  ExamAttemptRecord,
  LearnerProgressState,
  PreTestResult,
  SkillType,
  UnitStudyProgress,
  VoiceSettings,
  WorkspaceTab,
} from './types';
import { soundEngine } from './utils/audio';
import { loadAIConfig, saveAIConfig } from './utils/aiClient';
import {
  completeModuleInState,
  createEmptyLearnerState,
  deleteExamAttempt,
  loadLearnerState,
  recordAISession,
  recordExamAttempt,
  recordPreTestResult,
  saveLearnerState,
  saveReadinessReport,
  saveUnitProgressInState,
  setLearnerNameInState,
  toggleModuleCompletionInState,
  updateExamAttemptAssessment,
} from './utils/progressStore';
import { Navbar } from './components/Navbar';
import { WorkspaceTabs } from './components/WorkspaceTabs';
import { HeroSection } from './components/HeroSection';
import { LevelRoadmap } from './components/LevelRoadmap';
import { FilterBar } from './components/FilterBar';
import { TipCard } from './components/TipCard';
import { IntensiveCoursesView } from './components/IntensiveCoursesView';
import { PreTestView } from './components/PreTestView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { AICoachView } from './components/AICoachView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { AIProviderModal } from './components/AIProviderModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
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

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  const handleToggleMute = () => {
    const newMuted = soundEngine.toggleMute();
    setIsMuted(newMuted);
  };

  // Active Workspace Mode
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('courses');

  // Filter States
  const [activeLanguageId, setActiveLanguageId] = useState<string>('all');
  const [activeLevel, setActiveLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'saved' | 'mastered'>('all');

  // Cross-workspace handoff context
  const [examTargetLevel, setExamTargetLevel] = useState<CEFRLevel>('B1');
  const [aiCoachTarget, setAiCoachTarget] = useState<{
    level: CEFRLevel;
    skill: SkillType;
    seedPrompt?: string;
  }>({ level: 'B1', skill: 'speaking' });

  // Persistent AI Provider Config (Local Ollama/LM Studio or Cloud APIs)
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => loadAIConfig());

  // Persistent Human Voice & Multi-Accent Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() =>
    soundEngine.getVoiceSettings()
  );
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  useEffect(() => {
    return soundEngine.subscribe(() => {
      setVoiceSettings(soundEngine.getVoiceSettings());
    });
  }, []);

  const handleSaveVoiceSettings = (next: VoiceSettings) => {
    soundEngine.updateVoiceSettings(next);
    setVoiceSettings(next);
  };

  // Persistent Learner Progress, Courses, Pre-Tests, Simulated Exams & AI Logs
  const [learnerState, setLearnerState] = useState<LearnerProgressState>(() => loadLearnerState());

  // Bookmarks & Mastered storage (Field Manual)
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
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('linguaverve_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('linguaverve_mastered', JSON.stringify(masteredIds));
  }, [masteredIds]);

  useEffect(() => {
    saveLearnerState(learnerState);
  }, [learnerState]);

  const handleSaveAIConfig = (nextConfig: AIProviderConfig) => {
    setAiConfig(nextConfig);
    saveAIConfig(nextConfig);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleModuleComplete = (
    moduleId: string,
    meta: { languageId: string; level: CEFRLevel; title: string }
  ) => {
    setLearnerState((prev) => toggleModuleCompletionInState(prev, moduleId, meta));
  };

  const handleSaveUnitProgress = (progress: UnitStudyProgress) => {
    setLearnerState((prev) => saveUnitProgressInState(prev, progress));
  };

  const handleCompleteGuidedModule = (
    moduleId: string,
    meta: { languageId: string; level: CEFRLevel; title: string; score?: number }
  ) => {
    setLearnerState((prev) => completeModuleInState(prev, moduleId, meta));
  };

  const handleCompletePreTest = (result: PreTestResult) => {
    setLearnerState((prev) => recordPreTestResult(prev, result));
  };

  const handleCompleteExam = (record: ExamAttemptRecord) => {
    setLearnerState((prev) => recordExamAttempt(prev, record));
  };

  const handleLogAISession = (session: AISessionRecord) => {
    setLearnerState((prev) => recordAISession(prev, session));
  };

  const handleJumpToCourse = (languageId: string, level: CEFRLevel) => {
    setActiveLanguageId(languageId);
    setActiveLevel(level);
    setActiveTab('courses');
  };

  const handleLaunchExam = (languageId: string, level: CEFRLevel) => {
    setActiveLanguageId(languageId);
    setExamTargetLevel(level);
    setActiveTab('simulator');
  };

  const handleLaunchAICoach = (
    languageId: string,
    level: CEFRLevel,
    skill: SkillType,
    seedPrompt?: string
  ) => {
    setActiveLanguageId(languageId);
    setAiCoachTarget({ level, skill, seedPrompt });
    setActiveTab('ai-coach');
  };

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

  const tipsCountByLevel = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    ALL_TIPS.forEach((tip) => {
      if (activeLanguageId !== 'all' && tip.languageId !== activeLanguageId && tip.languageId !== 'meta') {
        return;
      }
      counts['ALL'] = (counts['ALL'] || 0) + 1;
      counts[tip.level] = (counts[tip.level] || 0) + 1;
    });
    return counts;
  }, [activeLanguageId]);

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
  const latestPreTest = learnerState.preTestHistory.find(
    (p) => activeLanguageId === 'all' || activeLanguageId === 'meta' || p.languageId === activeLanguageId
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 dark:bg-[#0B0E14] dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        languages={LANGUAGES}
        activeLanguageId={activeLanguageId}
        onSelectLanguage={(id) => {
          soundEngine.playClickSound();
          setActiveLanguageId(id);
          if (activeTab === 'manual') {
            setActiveLevel('ALL');
          }
        }}
        savedCount={bookmarkedIds.length}
        masteredCount={masteredIds.length}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenFalseFriends={() => setIsFalseFriendsOpen(true)}
        onOpenExtensibility={() => setIsExtensibilityOpen(true)}
        onOpenRandomTip={() => setIsRandomTipOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Unified Multi-Workspace Switcher */}
      <WorkspaceTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        aiConfig={aiConfig}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        voiceSettings={voiceSettings}
        activeLanguageId={activeLanguageId}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        completedModulesCount={learnerState.completedModuleIds.length}
        examAttemptsCount={learnerState.examHistory.length}
      />

      {/* Field Manual Mode */}
      {activeTab === 'manual' && (
        <>
          <HeroSection
            currentLanguage={currentLanguage}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            onOpenExtensibility={() => setIsExtensibilityOpen(true)}
            totalTipsCount={ALL_TIPS.length}
          />

          <LevelRoadmap
            activeLevel={activeLevel}
            onSelectLevel={(lvl) => {
              soundEngine.playClickSound();
              setActiveLevel(lvl);
            }}
            tipsCountByLevel={tipsCountByLevel}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    type="button"
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
        </>
      )}

      {/* Intensive Courses Academy Mode */}
      {activeTab === 'courses' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <IntensiveCoursesView
            activeLanguageId={activeLanguageId}
            onSelectLanguage={setActiveLanguageId}
            activeLevel={activeLevel}
            onSelectLevel={(lvl) => setActiveLevel(lvl)}
            completedModuleIds={learnerState.completedModuleIds}
            enrolledCourseIds={learnerState.enrolledCourseIds}
            onToggleModuleComplete={handleToggleModuleComplete}
            onCompleteModule={handleCompleteGuidedModule}
            unitProgressMap={learnerState.unitProgress ?? {}}
            onSaveUnitProgress={handleSaveUnitProgress}
            aiConfig={aiConfig}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            onLaunchExam={handleLaunchExam}
            onLaunchAICoach={handleLaunchAICoach}
            onLaunchPreTest={(langId) => {
              setActiveLanguageId(langId);
              setActiveTab('pretest');
            }}
          />
        </main>
      )}

      {/* Scored 4-Skill Placement Pre-Test Mode */}
      {activeTab === 'pretest' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PreTestView
            activeLanguageId={activeLanguageId}
            onSelectLanguage={setActiveLanguageId}
            latestPreTest={latestPreTest}
            onCompletePreTest={handleCompletePreTest}
            onJumpToCourse={handleJumpToCourse}
            onLaunchExam={handleLaunchExam}
          />
        </main>
      )}

      {/* 4-Skill Simulated Certification Exam Arena */}
      {activeTab === 'simulator' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ExamSimulatorView
            activeLanguageId={activeLanguageId}
            onSelectLanguage={setActiveLanguageId}
            initialLevel={examTargetLevel}
            aiConfig={aiConfig}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
            onCompleteExam={handleCompleteExam}
            onLaunchAICoach={handleLaunchAICoach}
            learnerName={learnerState.learnerName}
            onUpdateLearnerName={(name) =>
              setLearnerState((prev) => setLearnerNameInState(prev, name))
            }
          />
        </main>
      )}

      {/* AI 4-Skill Coach Studio */}
      {activeTab === 'ai-coach' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AICoachView
            activeLanguageId={activeLanguageId}
            onSelectLanguage={setActiveLanguageId}
            initialLevel={aiCoachTarget.level}
            initialSkill={aiCoachTarget.skill}
            seedPrompt={aiCoachTarget.seedPrompt}
            aiConfig={aiConfig}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
            onLogAISession={handleLogAISession}
          />
        </main>
      )}

      {/* Progress, History & Test Results Dashboard */}
      {activeTab === 'progress' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProgressDashboardView
            learnerState={learnerState}
            masteredTipsCount={masteredIds.length}
            onImportState={(imported) => setLearnerState(imported)}
            onResetProgress={() => setLearnerState(createEmptyLearnerState())}
            onJumpToCourse={handleJumpToCourse}
            onLaunchExam={handleLaunchExam}
            onDeleteExamAttempt={(attemptId) =>
              setLearnerState((prev) => deleteExamAttempt(prev, attemptId))
            }
            aiConfig={aiConfig}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
            onUpdateExamAssessment={(attemptId, assessment) =>
              setLearnerState((prev) => updateExamAttemptAssessment(prev, attemptId, assessment))
            }
            onSaveReadinessReport={(report) =>
              setLearnerState((prev) => saveReadinessReport(prev, report))
            }
            onUpdateLearnerName={(name) =>
              setLearnerState((prev) => setLearnerNameInState(prev, name))
            }
            onLaunchAICoach={handleLaunchAICoach}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenExtensibility={() => setIsExtensibilityOpen(true)}
        onOpenFalseFriends={() => setIsFalseFriendsOpen(true)}
        onSelectWorkspace={setActiveTab}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
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

      <AIProviderModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveAIConfig}
        activeLanguageId={activeLanguageId}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={voiceSettings}
        onSaveSettings={handleSaveVoiceSettings}
        activeLanguageId={activeLanguageId}
      />
    </div>
  );
};

export default App;
