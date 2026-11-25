import Foundation

public enum CEFRLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case A1, A2, B1, B2, C1, C2

    public var id: String { rawValue }

    public var numericRank: Int {
        switch self {
        case .A1: return 1
        case .A2: return 2
        case .B1: return 3
        case .B2: return 4
        case .C1: return 5
        case .C2: return 6
        }
    }

    public static func fromRank(_ rank: Int) -> CEFRLevel {
        switch max(1, min(6, rank)) {
        case 1: return .A1
        case 2: return .A2
        case 3: return .B1
        case 4: return .B2
        case 5: return .C1
        default: return .C2
        }
    }
}

public enum SkillType: String, Codable, CaseIterable, Identifiable, Sendable {
    case reading
    case listening
    case writing
    case speaking

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .reading: return "Reading"
        case .listening: return "Listening / Hearing"
        case .writing: return "Writing"
        case .speaking: return "Speaking"
        }
    }

    public var shortName: String {
        switch self {
        case .reading: return "Reading"
        case .listening: return "Listening"
        case .writing: return "Writing"
        case .speaking: return "Speaking"
        }
    }

    public var systemImage: String {
        switch self {
        case .reading: return "book.fill"
        case .listening: return "headphones"
        case .writing: return "pencil.and.outline"
        case .speaking: return "mic.fill"
        }
    }
}

public enum WorkspaceSection: String, CaseIterable, Identifiable, Sendable {
    case courses
    case pretest
    case simulator
    case aiCoach
    case progress
    case manual

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .courses: return "Intensive Courses"
        case .pretest: return "Level Pre-Test"
        case .simulator: return "Exam Arena"
        case .aiCoach: return "AI 4-Skill Coach"
        case .progress: return "Progress"
        case .manual: return "Field Manual"
        }
    }

    public var shortTitle: String {
        switch self {
        case .courses: return "Courses"
        case .pretest: return "Pre-Test"
        case .simulator: return "Exam"
        case .aiCoach: return "AI Coach"
        case .progress: return "Progress"
        case .manual: return "Manual"
        }
    }

    public var systemImage: String {
        switch self {
        case .courses: return "graduationcap.fill"
        case .pretest: return "checklist"
        case .simulator: return "timer"
        case .aiCoach: return "sparkles"
        case .progress: return "chart.bar.fill"
        case .manual: return "book.pages.fill"
        }
    }
}

public enum TipCategory: String, Codable, CaseIterable, Identifiable, Sendable {
    case pronunciation
    case grammar
    case vocabulary
    case immersion
    case speaking
    case listening
    case mindset
    case habits

    public var id: String { rawValue }

    public var displayName: String {
        rawValue.capitalized
    }

    public var systemImage: String {
        switch self {
        case .pronunciation: return "waveform.and.mic"
        case .grammar: return "text.book.closed"
        case .vocabulary: return "character.book.closed"
        case .immersion: return "globe.europe.africa"
        case .speaking: return "bubble.left.and.bubble.right"
        case .listening: return "headphones"
        case .mindset: return "brain.head.profile"
        case .habits: return "flame"
        }
    }
}

public struct LanguageItem: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let nativeName: String
    public let flag: String
    public let tagline: String
    public let description: String
    public let family: String
    public let estimatedHoursToC1: Int
    public let difficultyRating: String
    public let keyTraps: [String]
    public let soundFeatures: [String]
    public let status: String // "active" | "preview"
    public let imageUrl: String?
    public let imageCaption: String?

    public var isActive: Bool { status == "active" }
}

public struct LevelColorSpec: Codable, Equatable, Sendable {
    public let bg: String
    public let text: String
    public let border: String
    public let glow: String
}

public struct LevelDetail: Codable, Identifiable, Equatable, Sendable {
    public let id: CEFRLevel
    public let name: String
    public let stageName: String
    public let badge: String
    public let hoursEstimated: String
    public let milestoneGoal: String
    public let canDoSummary: [String]
    public let color: LevelColorSpec
}

public struct TipExample: Codable, Equatable, Sendable {
    public let source: String
    public let target: String?
    public let explanation: String
    public let audioPrompt: String?

    public var speakablePhrase: String {
        if let prompt = audioPrompt, !prompt.isEmpty {
            return prompt
        }
        let beforeParen = source.components(separatedBy: "(").first ?? source
        return beforeParen.replacingOccurrences(of: "vs.", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

public struct ResourceTool: Codable, Equatable, Sendable {
    public let name: String
    public let category: String
    public let url: String
    public let note: String
    public let free: Bool?
}

public enum VisualDiagramType: String, Codable, Equatable, Sendable {
    case prepositionPyramid = "preposition-pyramid"
    case germanGender = "german-gender"
    case twoWayPrepositions = "two-way-prepositions"
    case mouthPhonetics = "mouth-phonetics"
}

public struct TipItem: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let languageId: String
    public let level: String
    public let category: TipCategory
    public let summary: String
    public let goldenRule: String
    public let tactics: [String]
    public let examples: [TipExample]?
    public let commonPitfall: String
    public let timeCommitment: String
    public let recommendedTools: [ResourceTool]?
    public let tags: [String]
    public let imageUrl: String?
    public let imageCaption: String?
    public let diagramType: VisualDiagramType?
}

public struct FalseFriendItem: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let word: String
    public let confusedWith: String
    public let actualMeaning: String
    public let mistakeExample: String
    public let correctAlternative: String
    public let memoryHack: String
    public let imageUrl: String?
}

public struct DiagnosticOption: Codable, Equatable, Sendable {
    public let text: String
    public let level: CEFRLevel
}

public struct DiagnosticQuestion: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let question: String
    public let options: [DiagnosticOption]
}

// MARK: - Intensive Courses & Official Certification References

public struct OfficialExamReference: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let levels: [CEFRLevel]
    public let provider: String
    public let certificateName: String
    public let type: String // "official-exam" | "mock-test" | "course-companion"
    public let url: String
    public let skillsCovered: [SkillType]
    public let examDuration: String
    public let passingScore: String
    public let description: String
    public let free: Bool
}

public struct CourseDrill: Codable, Equatable, Sendable, Identifiable {
    public var id: String { "\(skill.rawValue)-\(title)" }
    public let skill: SkillType
    public let title: String
    public let instruction: String
    public let durationMins: Int
    public let audioScript: String?
    public let samplePassage: String?
}

public struct CourseModule: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let weekLabel: String
    public let title: String
    public let focusSkills: [SkillType]
    public let summary: String
    public let objectives: [String]
    public let grammarCheckpoints: [String]
    public let keyVocabulary: [String]
    public let drills: [CourseDrill]
    public let checkpointPrompt: String
}

public struct CourseExamBlueprint: Codable, Equatable, Sendable {
    public let reading: String
    public let listening: String
    public let writing: String
    public let speaking: String

    public func description(for skill: SkillType) -> String {
        switch skill {
        case .reading: return reading
        case .listening: return listening
        case .writing: return writing
        case .speaking: return speaking
        }
    }
}

public struct IntensiveCourse: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let level: CEFRLevel
    public let title: String
    public let subtitle: String
    public let heroRole: String
    public let durationWeeks: Int
    public let dailyHours: String
    public let targetCertificates: [String]
    public let passingCriteria: String
    public let examBlueprint: CourseExamBlueprint
    public let modules: [CourseModule]
    public let referenceIds: [String]
}

// MARK: - Scored Placement Pre-Test & Collective Recommendations

public struct PreTestQuestion: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let level: CEFRLevel
    public let skill: SkillType
    public let prompt: String
    public let passage: String?
    public let audioScript: String?
    public let options: [String]
    public let correctIndex: Int
    public let explanation: String
}

public struct CollectiveCourseStep: Codable, Identifiable, Equatable, Sendable {
    public var id: String { "\(role)-\(courseId)" }
    public let role: String // "foundation" | "core" | "bridge"
    public let courseId: String
    public let level: CEFRLevel
    public let title: String
    public let reason: String
    public let prioritySkills: [SkillType]

    public init(role: String, courseId: String, level: CEFRLevel, title: String, reason: String, prioritySkills: [SkillType]) {
        self.role = role
        self.courseId = courseId
        self.level = level
        self.title = title
        self.reason = reason
        self.prioritySkills = prioritySkills
    }
}

public struct PreTestResult: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let timestamp: String
    public let languageId: String
    public let verifiedLevel: CEFRLevel
    public let overallScore: Int
    public let correctCount: Int
    public let totalCount: Int
    public let skillScores: [String: Int]
    public let recommendedCourses: [CollectiveCourseStep]
    public let suggestedCertificate: String

    public init(
        id: String,
        timestamp: String,
        languageId: String,
        verifiedLevel: CEFRLevel,
        overallScore: Int,
        correctCount: Int,
        totalCount: Int,
        skillScores: [String: Int],
        recommendedCourses: [CollectiveCourseStep],
        suggestedCertificate: String
    ) {
        self.id = id
        self.timestamp = timestamp
        self.languageId = languageId
        self.verifiedLevel = verifiedLevel
        self.overallScore = overallScore
        self.correctCount = correctCount
        self.totalCount = totalCount
        self.skillScores = skillScores
        self.recommendedCourses = recommendedCourses
        self.suggestedCertificate = suggestedCertificate
    }
}

// MARK: - 4-Skill Simulated Certification Exams

public struct ExamObjectiveQuestion: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let prompt: String
    public let options: [String]
    public let correctIndex: Int
    public let explanation: String
}

public struct ReadingExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let passageTitle: String
    public let passage: String
    public let questions: [ExamObjectiveQuestion]
}

public struct ListeningExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let maxPlaysStrict: Int
    public let contextNote: String
    public let audioScript: String
    public let hearingFocusTrap: String
    public let questions: [ExamObjectiveQuestion]
}

public struct WritingExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let scenario: String
    public let taskRequirements: [String]
    public let minWords: Int
    public let maxWords: Int
    public let keyRubricKeywords: [String]
    public let modelAnswer: String
}

public struct SpeakingExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let prepSeconds: Int
    public let speakSeconds: Int
    public let cueCardTitle: String
    public let bulletPoints: [String]
    public let followUpQuestion: String
    public let keyRubricKeywords: [String]
    public let modelResponseScript: String
}

public struct MockExam: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let level: CEFRLevel
    public let title: String
    public let alignedCertificate: String
    public let passingScorePercent: Int
    public let totalMinutes: Int
    public let reading: ReadingExamSection
    public let listening: ListeningExamSection
    public let writing: WritingExamSection
    public let speaking: SpeakingExamSection
}

public struct SkillExamScore: Codable, Equatable, Sendable {
    public let score: Int
    public let passed: Bool
    public let feedback: String
    public let aiGraded: Bool

    public init(score: Int, passed: Bool, feedback: String, aiGraded: Bool = false) {
        self.score = score
        self.passed = passed
        self.feedback = feedback
        self.aiGraded = aiGraded
    }
}

public struct ExamAttemptRecord: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let timestamp: String
    public let examId: String
    public let examTitle: String
    public let alignedCertificate: String
    public let languageId: String
    public let level: CEFRLevel
    public let mode: String // "strict" | "practice"
    public let durationUsedSeconds: Int
    public let overallScore: Int
    public let passed: Bool
    public let skills: [String: SkillExamScore]
    public let writingSubmission: String?
    public let speakingTranscript: String?

    public init(
        id: String,
        timestamp: String,
        examId: String,
        examTitle: String,
        alignedCertificate: String,
        languageId: String,
        level: CEFRLevel,
        mode: String,
        durationUsedSeconds: Int,
        overallScore: Int,
        passed: Bool,
        skills: [String: SkillExamScore],
        writingSubmission: String? = nil,
        speakingTranscript: String? = nil
    ) {
        self.id = id
        self.timestamp = timestamp
        self.examId = examId
        self.examTitle = examTitle
        self.alignedCertificate = alignedCertificate
        self.languageId = languageId
        self.level = level
        self.mode = mode
        self.durationUsedSeconds = durationUsedSeconds
        self.overallScore = overallScore
        self.passed = passed
        self.skills = skills
        self.writingSubmission = writingSubmission
        self.speakingTranscript = speakingTranscript
    }
}

// MARK: - Local & Cloud AI Providers

public enum AIProviderType: String, Codable, CaseIterable, Identifiable, Sendable {
    case appleFoundation
    case ollama
    case lmstudio
    case openai
    case gemini
    case openrouter
    case custom

    public var id: String { rawValue }

    public var isLocal: Bool {
        self == .appleFoundation || self == .ollama || self == .lmstudio
    }

    public var isOnDeviceApple: Bool {
        self == .appleFoundation
    }

    public var label: String {
        switch self {
        case .appleFoundation: return "Apple Foundation Model (On-Device)"
        case .ollama: return "Ollama (Local / LAN)"
        case .lmstudio: return "LM Studio (Local / LAN)"
        case .openai: return "OpenAI (Cloud)"
        case .gemini: return "Google Gemini (Cloud)"
        case .openrouter: return "OpenRouter (Cloud)"
        case .custom: return "Custom OpenAI-Compatible"
        }
    }

    public var defaultEndpoint: String {
        switch self {
        case .appleFoundation: return "on-device://apple-foundation-models"
        case .ollama: return "http://localhost:11434/v1/chat/completions"
        case .lmstudio: return "http://localhost:1234/v1/chat/completions"
        case .openai: return "https://api.openai.com/v1/chat/completions"
        case .gemini: return "https://generativelanguage.googleapis.com/v1beta/models"
        case .openrouter: return "https://openrouter.ai/api/v1/chat/completions"
        case .custom: return "https://api.groq.com/openai/v1/chat/completions"
        }
    }

    public var defaultModel: String {
        switch self {
        case .appleFoundation: return "Apple Intelligence On-Device"
        case .ollama: return "llama3.2"
        case .lmstudio: return "local-model"
        case .openai: return "gpt-4o-mini"
        case .gemini: return "gemini-2.5-flash"
        case .openrouter: return "google/gemini-2.5-flash"
        case .custom: return "llama-3.3-70b-versatile"
        }
    }

    public var suggestedModels: [String] {
        switch self {
        case .appleFoundation: return ["Apple Intelligence On-Device"]
        case .ollama: return ["llama3.2", "qwen2.5:7b", "gemma3", "mistral"]
        case .lmstudio: return ["local-model", "qwen2.5-7b-instruct", "llama-3.2-3b-instruct"]
        case .openai: return ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"]
        case .gemini: return ["gemini-2.5-flash", "gemini-2.5-pro"]
        case .openrouter: return ["google/gemini-2.5-flash", "anthropic/claude-3.5-sonnet", "openai/gpt-4o-mini"]
        case .custom: return ["llama-3.3-70b-versatile", "mistral-small-latest"]
        }
    }

    public var requiresAPIKey: Bool {
        switch self {
        case .openai, .gemini, .openrouter: return true
        case .appleFoundation, .ollama, .lmstudio, .custom: return false
        }
    }

    public var requiresAPIKeyForModelList: Bool {
        switch self {
        case .openai, .gemini: return true
        case .appleFoundation, .ollama, .lmstudio, .openrouter, .custom: return false
        }
    }

    public var setupHint: String {
        switch self {
        case .appleFoundation:
            return "Runs 100% locally and privately via Apple's native FoundationModels framework on Apple Silicon MacBooks (macOS 26+), iPads (iPadOS 26+), and iPhones (iOS 26+). No API key or server required."
        case .ollama:
            return "On MacBook use localhost:11434. On iPhone/iPad, point to your Mac's Wi-Fi IP (e.g. http://192.168.1.10:11434/v1/chat/completions) with OLLAMA_HOST=0.0.0.0."
        case .lmstudio:
            return "Enable Local Network Server in LM Studio. On iPhone/iPad, replace localhost with your Mac's local Wi-Fi IP."
        case .openai:
            return "Calls OpenAI Chat Completions directly from this device. API key stays local."
        case .gemini:
            return "Uses your Google AI Studio key directly against the Gemini REST API."
        case .openrouter:
            return "One key unlocks Gemini, Claude, GPT-4o, and open-weights models."
        case .custom:
            return "Works with any OpenAI-compatible local gateway (vLLM, LocalAI) or cloud host (Groq, Mistral)."
        }
    }
}

public struct AIModelInfo: Codable, Identifiable, Equatable, Hashable, Sendable {
    public let id: String
    public let displayName: String?
    public let ownedBy: String?
    public let contextLength: Int?

    public init(
        id: String,
        displayName: String? = nil,
        ownedBy: String? = nil,
        contextLength: Int? = nil
    ) {
        self.id = id
        self.displayName = displayName
        self.ownedBy = ownedBy
        self.contextLength = contextLength
    }

    public var pickerLabel: String {
        if let displayName, !displayName.isEmpty, displayName != id {
            return "\(id) — \(displayName)"
        }
        return id
    }
}

public struct AIProviderConfig: Codable, Equatable, Sendable {
    public var provider: AIProviderType
    public var endpoint: String
    public var model: String
    public var apiKey: String
    public var temperature: Double
    public var enabled: Bool

    public init(
        provider: AIProviderType = .ollama,
        endpoint: String? = nil,
        model: String? = nil,
        apiKey: String = "",
        temperature: Double = 0.4,
        enabled: Bool = false
    ) {
        self.provider = provider
        self.endpoint = endpoint ?? provider.defaultEndpoint
        self.model = model ?? provider.defaultModel
        self.apiKey = apiKey
        self.temperature = temperature
        self.enabled = enabled
    }

    public var isReady: Bool {
        guard enabled else { return false }
        if provider == .appleFoundation {
            return true
        }
        guard !endpoint.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              !model.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return false
        }
        if provider.requiresAPIKey && apiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return false
        }
        return true
    }
}

public struct AIChatMessage: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let role: String // "system" | "user" | "assistant"
    public let content: String

    public init(id: String = UUID().uuidString, role: String, content: String) {
        self.id = id
        self.role = role
        self.content = content
    }
}

public struct AIEvaluationResult: Codable, Equatable, Sendable {
    public let score: Int
    public let cefrEstimate: CEFRLevel
    public let strengths: [String]
    public let corrections: [String]
    public let upgradedVersion: String
    public let examinerSummary: String
    public let source: String // "ai" | "offline-rubric"
    public let providerLabel: String
}

public struct AISessionRecord: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let timestamp: String
    public let languageId: String
    public let level: CEFRLevel
    public let skill: SkillType
    public let provider: String
    public let summary: String
    public let score: Int?

    public init(
        id: String = UUID().uuidString,
        timestamp: String = ISO8601DateFormatter().string(from: Date()),
        languageId: String,
        level: CEFRLevel,
        skill: SkillType,
        provider: String,
        summary: String,
        score: Int? = nil
    ) {
        self.id = id
        self.timestamp = timestamp
        self.languageId = languageId
        self.level = level
        self.skill = skill
        self.provider = provider
        self.summary = summary
        self.score = score
    }
}

public struct StudyActivityEntry: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let timestamp: String
    public let type: String // "module-complete" | "pretest" | "mock-exam" | "ai-session"
    public let languageId: String
    public let level: CEFRLevel
    public let title: String
    public let detail: String
    public let score: Int?

    public init(
        id: String = UUID().uuidString,
        timestamp: String = ISO8601DateFormatter().string(from: Date()),
        type: String,
        languageId: String,
        level: CEFRLevel,
        title: String,
        detail: String,
        score: Int? = nil
    ) {
        self.id = id
        self.timestamp = timestamp
        self.type = type
        self.languageId = languageId
        self.level = level
        self.title = title
        self.detail = detail
        self.score = score
    }
}

public struct LearnerProgressState: Codable, Equatable, Sendable {
    public var version: Int
    public var completedModuleIds: [String]
    public var enrolledCourseIds: [String]
    public var preTestHistory: [PreTestResult]
    public var examHistory: [ExamAttemptRecord]
    public var aiSessionHistory: [AISessionRecord]
    public var activityLog: [StudyActivityEntry]
    public var studyDays: [String]

    public init(
        version: Int = 1,
        completedModuleIds: [String] = [],
        enrolledCourseIds: [String] = [],
        preTestHistory: [PreTestResult] = [],
        examHistory: [ExamAttemptRecord] = [],
        aiSessionHistory: [AISessionRecord] = [],
        activityLog: [StudyActivityEntry] = [],
        studyDays: [String] = []
    ) {
        self.version = version
        self.completedModuleIds = completedModuleIds
        self.enrolledCourseIds = enrolledCourseIds
        self.preTestHistory = preTestHistory
        self.examHistory = examHistory
        self.aiSessionHistory = aiSessionHistory
        self.activityLog = activityLog
        self.studyDays = studyDays
    }
}

// MARK: - Complete Curriculum Bundle

public struct CurriculumBundle: Codable, Sendable {
    public let generatedAt: String
    public let version: String
    public let languages: [LanguageItem]
    public let levels: [LevelDetail]
    public let tips: [TipItem]
    public let falseFriends: [FalseFriendItem]
    public let diagnosticQuestions: [DiagnosticQuestion]
    public let intensiveCourses: [IntensiveCourse]
    public let examReferences: [OfficialExamReference]
    public let preTestQuestions: [PreTestQuestion]
    public let mockExams: [MockExam]

    enum CodingKeys: String, CodingKey {
        case generatedAt, version, languages, levels, tips, falseFriends, diagnosticQuestions
        case intensiveCourses, examReferences, preTestQuestions, mockExams
    }

    public init(
        generatedAt: String,
        version: String,
        languages: [LanguageItem],
        levels: [LevelDetail],
        tips: [TipItem],
        falseFriends: [FalseFriendItem],
        diagnosticQuestions: [DiagnosticQuestion],
        intensiveCourses: [IntensiveCourse] = [],
        examReferences: [OfficialExamReference] = [],
        preTestQuestions: [PreTestQuestion] = [],
        mockExams: [MockExam] = []
    ) {
        self.generatedAt = generatedAt
        self.version = version
        self.languages = languages
        self.levels = levels
        self.tips = tips
        self.falseFriends = falseFriends
        self.diagnosticQuestions = diagnosticQuestions
        self.intensiveCourses = intensiveCourses
        self.examReferences = examReferences
        self.preTestQuestions = preTestQuestions
        self.mockExams = mockExams
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.generatedAt = try c.decode(String.self, forKey: .generatedAt)
        self.version = try c.decode(String.self, forKey: .version)
        self.languages = try c.decode([LanguageItem].self, forKey: .languages)
        self.levels = try c.decode([LevelDetail].self, forKey: .levels)
        self.tips = try c.decode([TipItem].self, forKey: .tips)
        self.falseFriends = try c.decode([FalseFriendItem].self, forKey: .falseFriends)
        self.diagnosticQuestions = try c.decode([DiagnosticQuestion].self, forKey: .diagnosticQuestions)
        self.intensiveCourses = try c.decodeIfPresent([IntensiveCourse].self, forKey: .intensiveCourses) ?? []
        self.examReferences = try c.decodeIfPresent([OfficialExamReference].self, forKey: .examReferences) ?? []
        self.preTestQuestions = try c.decodeIfPresent([PreTestQuestion].self, forKey: .preTestQuestions) ?? []
        self.mockExams = try c.decodeIfPresent([MockExam].self, forKey: .mockExams) ?? []
    }
}

public enum ViewModeFilter: String, CaseIterable, Identifiable, Sendable {
    case all = "All Blueprints"
    case saved = "Saved"
    case mastered = "Mastered"

    public var id: String { rawValue }
}
