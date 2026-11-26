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

export interface UnitLessonExample {
  target: string;
  translation: string;
  highlight?: string;
}

export interface UnitLessonSection {
  id: string;
  heading: string;
  explanation: string;
  formula?: string;
  examples: UnitLessonExample[];
  proTip?: string;
}

export interface UnitVocabCard {
  term: string;
  pronunciation?: string;
  meaning: string;
  example: string;
  exampleNote?: string;
}

export interface UnitPracticeQuestion {
  id: string;
  skill: SkillType;
  prompt: string;
  passage?: string;
  audioScript?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UnitGuidedLesson {
  estimatedMins: number;
  overview: string;
  sections: UnitLessonSection[];
  vocabCards: UnitVocabCard[];
  practiceQuestions: UnitPracticeQuestion[];
  checkpointSkill: 'writing' | 'speaking';
  checkpointMinWords: number;
  checkpointModelAnswer: string;
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
  lesson?: UnitGuidedLesson;
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

export interface ReadingExamPart {
  id: string;
  partLabel: string;
  format: 'comprehension' | 'true-false' | 'tfng' | 'matching' | 'cloze';
  instruction: string;
  passageTitle: string;
  passage: string;
  questions: ExamObjectiveQuestion[];
}

export interface ReadingExamSection {
  title: string;
  durationMinutes: number;
  passageTitle: string;
  passage: string;
  questions: ExamObjectiveQuestion[];
  parts?: ReadingExamPart[];
}

export interface ListeningExamTrack {
  id: string;
  partLabel: string;
  contextNote: string;
  accentCode?: string;
  maxPlaysStrict: number;
  preReadSeconds?: number;
  audioScript: string;
  hearingFocusTrap: string;
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
  tracks?: ListeningExamTrack[];
}

export interface WritingExamTask {
  id: string;
  partLabel: string;
  scenario: string;
  taskRequirements: string[];
  minWords: number;
  maxWords: number;
  weightPercent: number;
  keyRubricKeywords: string[];
  modelAnswer: string;
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
  tasks?: WritingExamTask[];
}

export interface SpeakingExamPart {
  id: string;
  partLabel: string;
  instruction: string;
  prepSeconds: number;
  speakSeconds: number;
  prompts: string[];
  examinerPromptAudio?: string;
  keyRubricKeywords: string[];
  modelResponseScript: string;
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
  parts?: SpeakingExamPart[];
}

export interface MockExam {
  id: string;
  languageId: string;
  level: CEFRLevel;
  title: string;
  alignedCertificate: string;
  passingScorePercent: number;
  totalMinutes: number;
  requireAllSkillsPass?: boolean;
  aiGenerated?: boolean;
  generatedTheme?: string;
  generatedByModel?: string;
  generatedAt?: string;
  aiGeneratedSkills?: SkillType[];
  reading: ReadingExamSection;
  listening: ListeningExamSection;
  writing: WritingExamSection;
  speaking: SpeakingExamSection;
}

export interface OfficialRubricBreakdown {
  taskFulfillment: number;
  coherenceCohesion: number;
  lexicalRange: number;
  grammaticalAccuracy: number;
}

export interface SkillExamScore {
  score: number; // 0-100
  passed: boolean;
  feedback: string;
  aiGraded?: boolean;
  rubric?: OfficialRubricBreakdown;
}

export interface ExamQuestionReview {
  id: string;
  skill: 'reading' | 'listening';
  sectionTag: string; // e.g. "Reading P1", "Listening T2"
  prompt: string;
  chosenOption?: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
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
  officialGradeLabel?: string;
  skills: Record<SkillType, SkillExamScore>;
  writingSubmission?: string;
  speakingTranscript?: string;
  questionReviews?: ExamQuestionReview[];
  writingNotes?: string[];
  speakingNotes?: string[];
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

// ============================================================
// HUMAN VOICE & MULTI-ACCENT TTS STUDIO
// ============================================================

export type VoiceProviderType = 'system' | 'openai' | 'elevenlabs' | 'local-openai';

export type VoiceSpeakingStyle = 'natural' | 'tutor' | 'conversational' | 'broadcast';

export interface AccentOption {
  code: string;        // BCP-47 locale e.g. 'en-GB', 'de-AT'
  languageId: string;  // 'english' | 'german' | 'spanish' | 'french'
  flag: string;
  label: string;       // e.g. 'British (UK)'
  region: string;      // e.g. 'London · Received Pronunciation'
  sampleText: string;  // Authentic accent test phrase
  neuralHint: string;  // Accent coaching instruction for neural models
}

export interface VoiceSettings {
  provider: VoiceProviderType;
  accents: Record<string, string>;               // languageId -> BCP-47 code
  preferredSystemVoices: Record<string, string>; // BCP-47 code -> voiceURI
  rateMultiplier: number;                        // 0.75..1.25
  speakingStyle: VoiceSpeakingStyle;
  endpoint: string;
  apiKey: string;
  model: string;
  neuralVoice: string;
  reuseOpenAIKey: boolean;
}

export interface AIModelInfo {
  id: string;
  displayName?: string;
  ownedBy?: string;
  contextLength?: number;
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

export interface UnitStudyProgress {
  moduleId: string;
  currentStep: number; // 0..4: Learn, Vocab, Quiz, Drills, Checkpoint
  completedSteps: number[];
  masteredVocab: string[];
  quizAnswers: Record<string, number>;
  completedDrillIndices: number[];
  checkpointResponse?: string;
  checkpointScore?: number;
  lastStudiedAt: string;
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
  unitProgress?: Record<string, UnitStudyProgress>;
}
