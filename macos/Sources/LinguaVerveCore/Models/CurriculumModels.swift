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
    public let level: String // "A1"..."C2" or "ALL"
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

public struct CurriculumBundle: Codable, Sendable {
    public let generatedAt: String
    public let version: String
    public let languages: [LanguageItem]
    public let levels: [LevelDetail]
    public let tips: [TipItem]
    public let falseFriends: [FalseFriendItem]
    public let diagnosticQuestions: [DiagnosticQuestion]
}

public enum ViewModeFilter: String, CaseIterable, Identifiable, Sendable {
    case all = "All Blueprints"
    case saved = "Saved"
    case mastered = "Mastered"

    public var id: String { rawValue }
}
