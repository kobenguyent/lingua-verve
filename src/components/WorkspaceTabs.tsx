import React from 'react';
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Timer,
  Bot,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { AIProviderConfig, WorkspaceTab } from '../types';
import { AI_PROVIDER_PRESETS, isAIConfigReady } from '../utils/aiClient';
import { soundEngine } from '../utils/audio';

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  aiConfig: AIProviderConfig;
  onOpenAISettings: () => void;
  completedModulesCount: number;
  examAttemptsCount: number;
}

const TABS: { id: WorkspaceTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'courses', label: 'Intensive Courses', shortLabel: 'Courses', icon: GraduationCap },
  { id: 'pretest', label: 'Level Pre-Test', shortLabel: 'Pre-Test', icon: ClipboardCheck },
  { id: 'simulator', label: '4-Skill Exam Arena', shortLabel: 'Exam Sim', icon: Timer },
  { id: 'ai-coach', label: 'AI 4-Skill Coach', shortLabel: 'AI Coach', icon: Bot },
  { id: 'progress', label: 'Progress & History', shortLabel: 'Progress', icon: BarChart3 },
  { id: 'manual', label: 'Field Manual (Tips)', shortLabel: 'Tips', icon: BookOpen },
];

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  activeTab,
  onSelectTab,
  aiConfig,
  onOpenAISettings,
  completedModulesCount,
  examAttemptsCount,
}) => {
  const aiReady = isAIConfigReady(aiConfig);
  const preset = AI_PROVIDER_PRESETS[aiConfig.provider];

  return (
    <div className="w-full border-b border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/75 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto">
          <nav aria-label="Learning workspaces" className="flex items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={isSelected ? 'page' : undefined}
                  onClick={() => {
                    soundEngine.playClickSound();
                    onSelectTab(tab.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500 shadow-sm'
                      : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {tab.id === 'progress' && (completedModulesCount > 0 || examAttemptsCount > 0) && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {completedModulesCount + examAttemptsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact AI Connection Pill */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClickSound();
              onOpenAISettings();
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap border transition-colors shrink-0 ${
              aiReady
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500'
            }`}
            title="Configure Local (Ollama / LM Studio) or Cloud AI Provider"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className={`w-1.5 h-1.5 rounded-full ${aiReady ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="hidden md:inline">
              {aiReady ? `AI: ${preset.mode === 'local' ? 'Local' : 'Cloud'} (${aiConfig.model})` : 'Connect Local/Cloud AI'}
            </span>
            <span className="md:hidden">{aiReady ? 'AI Ready' : 'AI Setup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
