export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'reading' | 'listening' | 'writing' | 'speaking';

export type WorkspaceTab =
  | 'manual'
  | 'courses'
  | 'pretest'
  | 'simulator'
  | 'ai-coach'
  | 'progress';

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
  difficultyRating: string;
  keyTraps: string[];
  soundFeatures: string[];
  status: 'active' | 'preview';
  imageUrl?: string;
  imageCaption?: string;
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
  audioPrompt?: string;
}

export interface ResourceTool {
  name: string;
  category: 'app' | 'podcast' | 'reading' | 'audio' | 'tool' | 'channel';
  url: string;
  note: string;
  free?: boolean;
}

export type VisualDiagramType =
  | 'preposition-pyramid'
  | 'german-gender'
  | 'two-way-prepositions'
  | 'mouth-phonetics';

export interface TipItem {
  id: string;
  title: string;
  languageId: string;
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
  imageUrl?: string;
  imageCaption?: string;
  diagramType?: VisualDiagramType;
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
  imageUrl?: string;
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

// ============================================================
// INTENSIVE COURSES, OFFICIAL REFERENCES & 4-SKILL ARCHITECTURE
// ============================================================

export interface OfficialExamReference {
  id: string;
  languageId: string;
  levels: CEFRLevel[];
  provider: string;
  certificateName: string;
  type: 'official-exam' | 'mock-test' | 'course-companion';
  url: string;
  skillsCovered: SkillType[];
  examDuration: string;
  passingScore: string;
  description: string;
  free: boolean;
}

export interface CourseDrill {
  skill: SkillType;
  title: string;
  instruction: string;
  durationMins: number;
  audioScript?: string;
  samplePassage?: string;
}

export interface CourseModule {
  id: string;
  weekLabel: string;
  title: string;
  focusSkills: SkillType[];
  summary: string;
  objectives: string[];
  grammarCheckpoints: string[];
  keyVocabulary: string[];
  drills: CourseDrill[];
  checkpointPrompt: string;
}

export interface IntensiveCourse {
  id: string;
  languageId: string;
  level: CEFRLevel;
  title: string;
  subtitle: string;
  heroRole: string; // e.g. "Phase 1: Zero to Survival" ... "Phase 6: Native Mastery"
  durationWeeks: number;
  dailyHours: string;
  targetCertificates: string[];
  passingCriteria: string;
  examBlueprint: {
    reading: string;
    listening: string;
    writing: string;
    speaking: string;
  };
  modules: CourseModule[];
  referenceIds: string[];
}

// ============================================================
// SCORED PLACEMENT PRE-TEST & COLLECTIVE RECOMMENDATIONS
// ============================================================

export interface PreTestQuestion {
  id: string;
  languageId: string;
  level: CEFRLevel;
  skill: SkillType;
  prompt: string;
  passage?: string;
  audioScript?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CollectiveCourseStep {
  role: 'foundation' | 'core' | 'bridge';
  courseId: string;
  level: CEFRLevel;
  title: string;
  reason: string;
  prioritySkills: SkillType[];
}

export interface PreTestResult {
  id: string;
  timestamp: string;
  languageId: string;
  verifiedLevel: CEFRLevel;
  overallScore: number; // 0-100
  correctCount: number;
  totalCount: number;
  skillScores: Record<SkillType, number>; // 0-100
  recommendedCourses: CollectiveCourseStep[];
  suggestedCertificate: string;
}

// ============================================================
// 4-SKILL SIMULATED CERTIFICATION EXAMS
// ============================================================

export interface ExamObjectiveQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingExamSection {
  title: string;
  durationMinutes: number;
  passageTitle: string;
  passage: string;
  questions: ExamObjectiveQuestion[];
}

export interface ListeningExamSection {
  title: string;
  durationMinutes: number;
  maxPlaysStrict: number;
  contextNote: string;
  audioScript: string;
  hearingFocusTrap: string;
  questions: ExamObjectiveQuestion[];
}

export interface WritingExamSection {
  title: string;
  durationMinutes: number;
  scenario: string;
  taskRequirements: string[];
  minWords: number;
  maxWords: number;
  keyRubricKeywords: string[];
  modelAnswer: string;
}

export interface SpeakingExamSection {
  title: string;
  durationMinutes: number;
  prepSeconds: number;
  speakSeconds: number;
  cueCardTitle: string;
  bulletPoints: string[];
  followUpQuestion: string;
  keyRubricKeywords: string[];
  modelResponseScript: string;
}

export interface MockExam {
  id: string;
  languageId: string;
  level: CEFRLevel;
  title: string;
  alignedCertificate: string;
  passingScorePercent: number;
  totalMinutes: number;
  reading: ReadingExamSection;
  listening: ListeningExamSection;
  writing: WritingExamSection;
  speaking: SpeakingExamSection;
}

export interface SkillExamScore {
  score: number; // 0-100
  passed: boolean;
  feedback: string;
  aiGraded?: boolean;
}

export interface ExamAttemptRecord {
  id: string;
  timestamp: string;
  examId: string;
  examTitle: string;
  alignedCertificate: string;
  languageId: string;
  level: CEFRLevel;
  mode: 'strict' | 'practice';
  durationUsedSeconds: number;
  overallScore: number;
  passed: boolean;
  skills: Record<SkillType, SkillExamScore>;
  writingSubmission?: string;
  speakingTranscript?: string;
}

// ============================================================
// LOCAL & CLOUD AI PROVIDER INTEGRATION
// ============================================================

export type AIProviderType =
  | 'ollama'
  | 'lmstudio'
  | 'openai'
  | 'gemini'
  | 'openrouter'
  | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  mode: 'local' | 'cloud';
  endpoint: string;
  model: string;
  apiKey: string;
  temperature: number;
  enabled: boolean;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIEvaluationResult {
  score: number; // 0-100
  cefrEstimate: CEFRLevel;
  strengths: string[];
  corrections: string[];
  upgradedVersion: string;
  examinerSummary: string;
  source: 'ai' | 'offline-rubric';
  providerLabel: string;
}

export interface AISessionRecord {
  id: string;
  timestamp: string;
  languageId: string;
  level: CEFRLevel;
  skill: SkillType;
  provider: string;
  summary: string;
  score?: number;
}

// ============================================================
// PERSISTENT LEARNER PROGRESS & HISTORY STORE
// ============================================================

export interface StudyActivityEntry {
  id: string;
  timestamp: string;
  type: 'module-complete' | 'pretest' | 'mock-exam' | 'ai-session';
  languageId: string;
  level: CEFRLevel;
  title: string;
  detail: string;
  score?: number;
}

export interface LearnerProgressState {
  version: number;
  completedModuleIds: string[];
  enrolledCourseIds: string[];
  preTestHistory: PreTestResult[];
  examHistory: ExamAttemptRecord[];
  aiSessionHistory: AISessionRecord[];
  activityLog: StudyActivityEntry[];
  studyDays: string[]; // YYYY-MM-DD unique active days for streak tracking
}
