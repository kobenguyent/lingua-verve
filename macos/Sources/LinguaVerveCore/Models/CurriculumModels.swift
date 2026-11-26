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

public struct UnitLessonExample: Codable, Equatable, Sendable, Identifiable {
    public var id: String { target }
    public let target: String
    public let translation: String
    public let highlight: String?

    public init(target: String, translation: String, highlight: String? = nil) {
        self.target = target
        self.translation = translation
        self.highlight = highlight
    }
}

public struct UnitLessonSection: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let heading: String
    public let explanation: String
    public let formula: String?
    public let examples: [UnitLessonExample]
    public let proTip: String?

    public init(
        id: String,
        heading: String,
        explanation: String,
        formula: String? = nil,
        examples: [UnitLessonExample],
        proTip: String? = nil
    ) {
        self.id = id
        self.heading = heading
        self.explanation = explanation
        self.formula = formula
        self.examples = examples
        self.proTip = proTip
    }
}

public struct UnitVocabCard: Codable, Equatable, Sendable, Identifiable {
    public var id: String { term }
    public let term: String
    public let pronunciation: String?
    public let meaning: String
    public let example: String
    public let exampleNote: String?

    public init(
        term: String,
        pronunciation: String? = nil,
        meaning: String,
        example: String,
        exampleNote: String? = nil
    ) {
        self.term = term
        self.pronunciation = pronunciation
        self.meaning = meaning
        self.example = example
        self.exampleNote = exampleNote
    }
}

public struct UnitPracticeQuestion: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let skill: SkillType
    public let prompt: String
    public let passage: String?
    public let audioScript: String?
    public let options: [String]
    public let correctIndex: Int
    public let explanation: String

    public init(
        id: String,
        skill: SkillType,
        prompt: String,
        passage: String? = nil,
        audioScript: String? = nil,
        options: [String],
        correctIndex: Int,
        explanation: String
    ) {
        self.id = id
        self.skill = skill
        self.prompt = prompt
        self.passage = passage
        self.audioScript = audioScript
        self.options = options
        self.correctIndex = correctIndex
        self.explanation = explanation
    }
}

public struct UnitGuidedLesson: Codable, Equatable, Sendable {
    public let estimatedMins: Int
    public let overview: String
    public let sections: [UnitLessonSection]
    public let vocabCards: [UnitVocabCard]
    public let practiceQuestions: [UnitPracticeQuestion]
    public let checkpointSkill: SkillType
    public let checkpointMinWords: Int
    public let checkpointModelAnswer: String

    public init(
        estimatedMins: Int,
        overview: String,
        sections: [UnitLessonSection],
        vocabCards: [UnitVocabCard],
        practiceQuestions: [UnitPracticeQuestion],
        checkpointSkill: SkillType,
        checkpointMinWords: Int,
        checkpointModelAnswer: String
    ) {
        self.estimatedMins = estimatedMins
        self.overview = overview
        self.sections = sections
        self.vocabCards = vocabCards
        self.practiceQuestions = practiceQuestions
        self.checkpointSkill = checkpointSkill
        self.checkpointMinWords = checkpointMinWords
        self.checkpointModelAnswer = checkpointModelAnswer
    }
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
    public let lesson: UnitGuidedLesson?
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

    public init(id: String, prompt: String, options: [String], correctIndex: Int, explanation: String) {
        self.id = id
        self.prompt = prompt
        self.options = options
        self.correctIndex = correctIndex
        self.explanation = explanation
    }
}

public struct ReadingExamPart: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let partLabel: String
    public let format: String
    public let instruction: String
    public let passageTitle: String
    public let passage: String
    public let questions: [ExamObjectiveQuestion]

    public init(
        id: String,
        partLabel: String,
        format: String,
        instruction: String,
        passageTitle: String,
        passage: String,
        questions: [ExamObjectiveQuestion]
    ) {
        self.id = id
        self.partLabel = partLabel
        self.format = format
        self.instruction = instruction
        self.passageTitle = passageTitle
        self.passage = passage
        self.questions = questions
    }
}

public struct ReadingExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let passageTitle: String
    public let passage: String
    public let questions: [ExamObjectiveQuestion]
    public let parts: [ReadingExamPart]?

    public init(
        title: String,
        durationMinutes: Int,
        passageTitle: String,
        passage: String,
        questions: [ExamObjectiveQuestion],
        parts: [ReadingExamPart]? = nil
    ) {
        self.title = title
        self.durationMinutes = durationMinutes
        self.passageTitle = passageTitle
        self.passage = passage
        self.questions = questions
        self.parts = parts
    }

    public var resolvedParts: [ReadingExamPart] {
        if let parts, !parts.isEmpty { return parts }
        return [
            ReadingExamPart(
                id: "read-p1",
                partLabel: title,
                format: "comprehension",
                instruction: "Read the passage carefully and answer each question.",
                passageTitle: passageTitle,
                passage: passage,
                questions: questions
            )
        ]
    }
}

public struct ListeningExamTrack: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let partLabel: String
    public let contextNote: String
    public let accentCode: String?
    public let maxPlaysStrict: Int
    public let preReadSeconds: Int?
    public let audioScript: String
    public let hearingFocusTrap: String
    public let questions: [ExamObjectiveQuestion]

    public init(
        id: String,
        partLabel: String,
        contextNote: String,
        accentCode: String? = nil,
        maxPlaysStrict: Int,
        preReadSeconds: Int? = nil,
        audioScript: String,
        hearingFocusTrap: String,
        questions: [ExamObjectiveQuestion]
    ) {
        self.id = id
        self.partLabel = partLabel
        self.contextNote = contextNote
        self.accentCode = accentCode
        self.maxPlaysStrict = maxPlaysStrict
        self.preReadSeconds = preReadSeconds
        self.audioScript = audioScript
        self.hearingFocusTrap = hearingFocusTrap
        self.questions = questions
    }
}

public struct ListeningExamSection: Codable, Equatable, Sendable {
    public let title: String
    public let durationMinutes: Int
    public let maxPlaysStrict: Int
    public let contextNote: String
    public let audioScript: String
    public let hearingFocusTrap: String
    public let questions: [ExamObjectiveQuestion]
    public let tracks: [ListeningExamTrack]?

    public init(
        title: String,
        durationMinutes: Int,
        maxPlaysStrict: Int,
        contextNote: String,
        audioScript: String,
        hearingFocusTrap: String,
        questions: [ExamObjectiveQuestion],
        tracks: [ListeningExamTrack]? = nil
    ) {
        self.title = title
        self.durationMinutes = durationMinutes
        self.maxPlaysStrict = maxPlaysStrict
        self.contextNote = contextNote
        self.audioScript = audioScript
        self.hearingFocusTrap = hearingFocusTrap
        self.questions = questions
        self.tracks = tracks
    }

    public var resolvedTracks: [ListeningExamTrack] {
        if let tracks, !tracks.isEmpty { return tracks }
        return [
            ListeningExamTrack(
                id: "listen-t1",
                partLabel: title,
                contextNote: contextNote,
                accentCode: nil,
                maxPlaysStrict: maxPlaysStrict,
                preReadSeconds: 15,
                audioScript: audioScript,
                hearingFocusTrap: hearingFocusTrap,
                questions: questions
            )
        ]
    }
}

public struct WritingExamTask: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let partLabel: String
    public let scenario: String
    public let taskRequirements: [String]
    public let minWords: Int
    public let maxWords: Int
    public let weightPercent: Int
    public let keyRubricKeywords: [String]
    public let modelAnswer: String

    public init(
        id: String,
        partLabel: String,
        scenario: String,
        taskRequirements: [String],
        minWords: Int,
        maxWords: Int,
        weightPercent: Int,
        keyRubricKeywords: [String],
        modelAnswer: String
    ) {
        self.id = id
        self.partLabel = partLabel
        self.scenario = scenario
        self.taskRequirements = taskRequirements
        self.minWords = minWords
        self.maxWords = maxWords
        self.weightPercent = weightPercent
        self.keyRubricKeywords = keyRubricKeywords
        self.modelAnswer = modelAnswer
    }
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
    public let tasks: [WritingExamTask]?

    public init(
        title: String,
        durationMinutes: Int,
        scenario: String,
        taskRequirements: [String],
        minWords: Int,
        maxWords: Int,
        keyRubricKeywords: [String],
        modelAnswer: String,
        tasks: [WritingExamTask]? = nil
    ) {
        self.title = title
        self.durationMinutes = durationMinutes
        self.scenario = scenario
        self.taskRequirements = taskRequirements
        self.minWords = minWords
        self.maxWords = maxWords
        self.keyRubricKeywords = keyRubricKeywords
        self.modelAnswer = modelAnswer
        self.tasks = tasks
    }

    public var resolvedTasks: [WritingExamTask] {
        if let tasks, !tasks.isEmpty { return tasks }
        return [
            WritingExamTask(
                id: "write-t1",
                partLabel: title,
                scenario: scenario,
                taskRequirements: taskRequirements,
                minWords: minWords,
                maxWords: maxWords,
                weightPercent: 100,
                keyRubricKeywords: keyRubricKeywords,
                modelAnswer: modelAnswer
            )
        ]
    }
}

public struct SpeakingExamPart: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let partLabel: String
    public let instruction: String
    public let prepSeconds: Int
    public let speakSeconds: Int
    public let prompts: [String]
    public let examinerPromptAudio: String?
    public let keyRubricKeywords: [String]
    public let modelResponseScript: String

    public init(
        id: String,
        partLabel: String,
        instruction: String,
        prepSeconds: Int,
        speakSeconds: Int,
        prompts: [String],
        examinerPromptAudio: String? = nil,
        keyRubricKeywords: [String],
        modelResponseScript: String
    ) {
        self.id = id
        self.partLabel = partLabel
        self.instruction = instruction
        self.prepSeconds = prepSeconds
        self.speakSeconds = speakSeconds
        self.prompts = prompts
        self.examinerPromptAudio = examinerPromptAudio
        self.keyRubricKeywords = keyRubricKeywords
        self.modelResponseScript = modelResponseScript
    }
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
    public let parts: [SpeakingExamPart]?

    public init(
        title: String,
        durationMinutes: Int,
        prepSeconds: Int,
        speakSeconds: Int,
        cueCardTitle: String,
        bulletPoints: [String],
        followUpQuestion: String,
        keyRubricKeywords: [String],
        modelResponseScript: String,
        parts: [SpeakingExamPart]? = nil
    ) {
        self.title = title
        self.durationMinutes = durationMinutes
        self.prepSeconds = prepSeconds
        self.speakSeconds = speakSeconds
        self.cueCardTitle = cueCardTitle
        self.bulletPoints = bulletPoints
        self.followUpQuestion = followUpQuestion
        self.keyRubricKeywords = keyRubricKeywords
        self.modelResponseScript = modelResponseScript
        self.parts = parts
    }

    public var resolvedParts: [SpeakingExamPart] {
        if let parts, !parts.isEmpty { return parts }
        return [
            SpeakingExamPart(
                id: "speak-p1",
                partLabel: title,
                instruction: cueCardTitle,
                prepSeconds: prepSeconds,
                speakSeconds: speakSeconds,
                prompts: bulletPoints + ["Follow-up: \(followUpQuestion)"],
                examinerPromptAudio: nil,
                keyRubricKeywords: keyRubricKeywords,
                modelResponseScript: modelResponseScript
            )
        ]
    }
}

public struct MockExam: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let languageId: String
    public let level: CEFRLevel
    public let title: String
    public let alignedCertificate: String
    public let passingScorePercent: Int
    public let totalMinutes: Int
    public let requireAllSkillsPass: Bool?
    public let aiGenerated: Bool?
    public let generatedTheme: String?
    public let generatedByModel: String?
    public let generatedAt: String?
    public let aiGeneratedSkills: [SkillType]?
    public let reading: ReadingExamSection
    public let listening: ListeningExamSection
    public let writing: WritingExamSection
    public let speaking: SpeakingExamSection

    public init(
        id: String,
        languageId: String,
        level: CEFRLevel,
        title: String,
        alignedCertificate: String,
        passingScorePercent: Int,
        totalMinutes: Int,
        requireAllSkillsPass: Bool? = true,
        aiGenerated: Bool? = nil,
        generatedTheme: String? = nil,
        generatedByModel: String? = nil,
        generatedAt: String? = nil,
        aiGeneratedSkills: [SkillType]? = nil,
        reading: ReadingExamSection,
        listening: ListeningExamSection,
        writing: WritingExamSection,
        speaking: SpeakingExamSection
    ) {
        self.id = id
        self.languageId = languageId
        self.level = level
        self.title = title
        self.alignedCertificate = alignedCertificate
        self.passingScorePercent = passingScorePercent
        self.totalMinutes = totalMinutes
        self.requireAllSkillsPass = requireAllSkillsPass
        self.aiGenerated = aiGenerated
        self.generatedTheme = generatedTheme
        self.generatedByModel = generatedByModel
        self.generatedAt = generatedAt
        self.aiGeneratedSkills = aiGeneratedSkills
        self.reading = reading
        self.listening = listening
        self.writing = writing
        self.speaking = speaking
    }

    public static func officialGradeLabel(
        languageId: String,
        level: CEFRLevel,
        overallScore: Int,
        allModulesPassed: Bool,
        passingScorePercent: Int
    ) -> String {
        if languageId == "german" {
            if !allModulesPassed || overallScore < passingScorePercent {
                return "Goethe/telc: nicht bestanden (\(overallScore)/100)"
            }
            if overallScore >= 90 { return "Goethe/telc: sehr gut (\(overallScore)/100)" }
            if overallScore >= 80 { return "Goethe/telc: gut (\(overallScore)/100)" }
            if overallScore >= 70 { return "Goethe/telc: befriedigend (\(overallScore)/100)" }
            return "Goethe/telc: ausreichend (\(overallScore)/100)"
        }

        let baseBand: Double
        switch level {
        case .A1: baseBand = 2.5
        case .A2: baseBand = 3.5
        case .B1: baseBand = 5.0
        case .B2: baseBand = 6.5
        case .C1: baseBand = 7.5
        case .C2: baseBand = 8.5
        }
        let delta = (Double(overallScore - 65) / 35.0) * 1.0
        let band = max(1.0, min(9.0, ((baseBand + delta) * 2.0).rounded() / 2.0))
        let bandStr = String(format: "%.1f", band)
        if !allModulesPassed || overallScore < passingScorePercent {
            return "Below Pass Threshold · Est. IELTS \(bandStr)"
        }
        let grade = overallScore >= 85 ? "Grade A (Distinction)" : overallScore >= 75 ? "Grade B (Merit)" : "Grade C (Pass)"
        return "Cambridge \(grade) · Est. IELTS \(bandStr)"
    }
}

public struct OfficialRubricBreakdown: Codable, Equatable, Sendable {
    public let taskFulfillment: Int
    public let coherenceCohesion: Int
    public let lexicalRange: Int
    public let grammaticalAccuracy: Int

    public init(taskFulfillment: Int, coherenceCohesion: Int, lexicalRange: Int, grammaticalAccuracy: Int) {
        self.taskFulfillment = taskFulfillment
        self.coherenceCohesion = coherenceCohesion
        self.lexicalRange = lexicalRange
        self.grammaticalAccuracy = grammaticalAccuracy
    }

    public static func compute(text: String, score: Int, minWords: Int, expectedKeywords: [String]) -> OfficialRubricBreakdown {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else {
            return OfficialRubricBreakdown(taskFulfillment: 0, coherenceCohesion: 0, lexicalRange: 0, grammaticalAccuracy: 0)
        }
        let words = cleaned.split(whereSeparator: \.isWhitespace).map(String.init)
        let wordCount = words.count
        let lower = cleaned.lowercased()
        let sentences = cleaned.split(whereSeparator: { ".!?".contains($0) }).filter { $0.trimmingCharacters(in: .whitespaces).count > 2 }.count
        let uniqueCount = Set(words.map { $0.lowercased().filter(\.isLetter) }.filter { !$0.isEmpty }).count
        let diversity = Double(uniqueCount) / Double(max(1, wordCount))
        let kwHits = expectedKeywords.filter { lower.contains($0.lowercased()) }.count
        let kwRatio = expectedKeywords.isEmpty ? 0.6 : Double(kwHits) / Double(min(5, expectedKeywords.count))
        let lengthRatio = min(1.0, Double(wordCount) / Double(max(15, minWords)))

        func clamp(_ v: Double) -> Int { max(0, min(100, Int(v.rounded()))) }
        let s = Double(score)
        return OfficialRubricBreakdown(
            taskFulfillment: clamp(s * 0.65 + lengthRatio * 22.0 + min(1.0, kwRatio) * 13.0),
            coherenceCohesion: clamp(s * 0.72 + min(1.0, Double(sentences) / 4.0) * 18.0 + (cleaned.contains("\n") ? 10.0 : 5.0)),
            lexicalRange: clamp(s * 0.68 + min(1.0, diversity / 0.65) * 20.0 + min(1.0, kwRatio) * 12.0),
            grammaticalAccuracy: clamp(s * 0.80 + (sentences >= 3 ? 16.0 : 8.0))
        )
    }
}

public struct SkillExamScore: Codable, Equatable, Sendable {
    public let score: Int
    public let passed: Bool
    public let feedback: String
    public let aiGraded: Bool
    public let rubric: OfficialRubricBreakdown?

    public init(score: Int, passed: Bool, feedback: String, aiGraded: Bool = false, rubric: OfficialRubricBreakdown? = nil) {
        self.score = score
        self.passed = passed
        self.feedback = feedback
        self.aiGraded = aiGraded
        self.rubric = rubric
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
    public let officialGradeLabel: String?
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
        officialGradeLabel: String? = nil,
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
        self.officialGradeLabel = officialGradeLabel
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

public struct UnitStudyProgress: Codable, Equatable, Sendable {
    public let moduleId: String
    public var currentStep: Int
    public var completedSteps: [Int]
    public var masteredVocab: [String]
    public var quizAnswers: [String: Int]
    public var completedDrillIndices: [Int]
    public var checkpointResponse: String?
    public var checkpointScore: Int?
    public var lastStudiedAt: String

    public init(
        moduleId: String,
        currentStep: Int = 0,
        completedSteps: [Int] = [],
        masteredVocab: [String] = [],
        quizAnswers: [String: Int] = [:],
        completedDrillIndices: [Int] = [],
        checkpointResponse: String? = nil,
        checkpointScore: Int? = nil,
        lastStudiedAt: String = ISO8601DateFormatter().string(from: Date())
    ) {
        self.moduleId = moduleId
        self.currentStep = currentStep
        self.completedSteps = completedSteps
        self.masteredVocab = masteredVocab
        self.quizAnswers = quizAnswers
        self.completedDrillIndices = completedDrillIndices
        self.checkpointResponse = checkpointResponse
        self.checkpointScore = checkpointScore
        self.lastStudiedAt = lastStudiedAt
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
    public var unitProgress: [String: UnitStudyProgress]

    enum CodingKeys: String, CodingKey {
        case version, completedModuleIds, enrolledCourseIds, preTestHistory, examHistory
        case aiSessionHistory, activityLog, studyDays, unitProgress
    }

    public init(
        version: Int = 1,
        completedModuleIds: [String] = [],
        enrolledCourseIds: [String] = [],
        preTestHistory: [PreTestResult] = [],
        examHistory: [ExamAttemptRecord] = [],
        aiSessionHistory: [AISessionRecord] = [],
        activityLog: [StudyActivityEntry] = [],
        studyDays: [String] = [],
        unitProgress: [String: UnitStudyProgress] = [:]
    ) {
        self.version = version
        self.completedModuleIds = completedModuleIds
        self.enrolledCourseIds = enrolledCourseIds
        self.preTestHistory = preTestHistory
        self.examHistory = examHistory
        self.aiSessionHistory = aiSessionHistory
        self.activityLog = activityLog
        self.studyDays = studyDays
        self.unitProgress = unitProgress
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.version = try c.decodeIfPresent(Int.self, forKey: .version) ?? 1
        self.completedModuleIds = try c.decodeIfPresent([String].self, forKey: .completedModuleIds) ?? []
        self.enrolledCourseIds = try c.decodeIfPresent([String].self, forKey: .enrolledCourseIds) ?? []
        self.preTestHistory = try c.decodeIfPresent([PreTestResult].self, forKey: .preTestHistory) ?? []
        self.examHistory = try c.decodeIfPresent([ExamAttemptRecord].self, forKey: .examHistory) ?? []
        self.aiSessionHistory = try c.decodeIfPresent([AISessionRecord].self, forKey: .aiSessionHistory) ?? []
        self.activityLog = try c.decodeIfPresent([StudyActivityEntry].self, forKey: .activityLog) ?? []
        self.studyDays = try c.decodeIfPresent([String].self, forKey: .studyDays) ?? []
        self.unitProgress = try c.decodeIfPresent([String: UnitStudyProgress].self, forKey: .unitProgress) ?? [:]
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
