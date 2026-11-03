export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Category = 
  | 'pronunciation'
  | 'grammar'
  | 'vocabulary'
  | 'immersion'
  | 'speaking'
  | 'listening'
  | 'mindset'
  | 'habits';

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  tagline: string;
  description: string;
  family: string;
  estimatedHoursToC1: number;
  difficultyRating: string; // e.g. "Category I (Easy for English speakers)" or "Category II"
  keyTraps: string[];
  soundFeatures: string[];
  status: 'active' | 'preview';
}

export interface LevelDetail {
  id: CEFRLevel;
  name: string;
  stageName: string;
  badge: string;
  hoursEstimated: string;
  milestoneGoal: string;
  canDoSummary: string[];
  color: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
}

export interface TipExample {
  source: string;
  target?: string;
  explanation: string;
}

export interface ResourceTool {
  name: string;
  category: 'app' | 'podcast' | 'reading' | 'audio' | 'tool' | 'channel';
  url: string;
  note: string;
  free?: boolean;
}

export interface TipItem {
  id: string;
  title: string;
  languageId: string; // 'english' | 'german' | 'meta'
  level: CEFRLevel | 'ALL';
  category: Category;
  summary: string;
  goldenRule: string;
  tactics: string[];
  examples?: TipExample[];
  commonPitfall: string;
  timeCommitment: string;
  recommendedTools?: ResourceTool[];
  tags: string[];
}

export interface FalseFriendItem {
  id: string;
  languageId: string;
  word: string;
  confusedWith: string;
  actualMeaning: string;
  mistakeExample: string;
  correctAlternative: string;
  memoryHack: string;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    level: CEFRLevel;
  }[];
}

export interface UserProgress {
  bookmarkedTips: string[];
  masteredTips: string[];
  completedQuestions: Record<string, string>;
  activeLanguage: string;
  activeLevel: CEFRLevel | 'ALL';
  activeCategory: Category | 'all';
}
