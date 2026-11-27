import Foundation

public enum ModelLanguageTarget: String, Codable, CaseIterable, Identifiable, Sendable {
    case all
    case german
    case english
    case french
    case spanish
    case japanese
    case globalRegional = "global-regional"

    public var id: String { rawValue }

    public var flag: String {
        switch self {
        case .all: return "🌐"
        case .german: return "🇩🇪"
        case .english: return "🇬🇧"
        case .french: return "🇫🇷"
        case .spanish: return "🇪🇸"
        case .japanese: return "🇯🇵"
        case .globalRegional: return "🌏"
        }
    }

    public var displayName: String {
        switch self {
        case .all: return "Many Languages (Polyglot)"
        case .german: return "German (Deutsch · DACH)"
        case .english: return "English (IELTS / Cambridge)"
        case .french: return "French (Français)"
        case .spanish: return "Spanish (Español)"
        case .japanese: return "Japanese (日本語)"
        case .globalRegional: return "Arabic, Vietnamese, Korean & Regional"
        }
    }

    public var shortName: String {
        switch self {
        case .all: return "Polyglot"
        case .german: return "German"
        case .english: return "English"
        case .french: return "French"
        case .spanish: return "Spanish"
        case .japanese: return "Japanese"
        case .globalRegional: return "Asian / Regional"
        }
    }

    public static func normalize(_ raw: String?) -> ModelLanguageTarget {
        switch (raw ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased() {
        case "german": return .german
        case "english": return .english
        case "french": return .french
        case "spanish": return .spanish
        case "japanese": return .japanese
        case "global-regional": return .globalRegional
        default: return .all
        }
    }
}

public struct LanguageModelRecommendation: Identifiable, Equatable, Sendable {
    public var id: String { modelId }
    public let modelId: String
    public let badge: String
    public let reason: String
    public let sizeHint: String
    public let pullCommand: String?
    public let isBestMatch: Bool

    public init(
        modelId: String,
        badge: String,
        reason: String,
        sizeHint: String,
        pullCommand: String? = nil,
        isBestMatch: Bool = false
    ) {
        self.modelId = modelId
        self.badge = badge
        self.reason = reason
        self.sizeHint = sizeHint
        self.pullCommand = pullCommand
        self.isBestMatch = isBestMatch
    }
}

public enum ModelFitTier: String, Equatable, Sendable {
    case ideal
    case good
    case caution

    public var label: String {
        switch self {
        case .ideal: return "Best Match"
        case .good: return "Good Fit"
        case .caution: return "Coding / Basic Fit"
        }
    }
}

public struct RankedFetchedModel: Identifiable, Equatable, Sendable {
    public var id: String { model.id }
    public let model: AIModelInfo
    public let score: Int
    public let tier: ModelFitTier
    public let reason: String
    public let isCodingModel: Bool

    public init(model: AIModelInfo, score: Int, tier: ModelFitTier, reason: String, isCodingModel: Bool) {
        self.model = model
        self.score = score
        self.tier = tier
        self.reason = reason
        self.isCodingModel = isCodingModel
    }
}

/// Recommends and ranks the most suitable local or cloud AI models based on the language(s)
/// the learner is studying, while steering learners away from coding-specialized models.
public enum AIModelAdvisor {

    public static func isCodingSpecializedModel(_ modelId: String) -> Bool {
        let lower = modelId.lowercased()
        let markers = ["coder", "codellama", "starcoder", "codegemma", "codestral", "devstral", "sql"]
        return markers.contains { lower.contains($0) }
    }

    public static func recommendedModels(
        for provider: AIProviderType,
        language: ModelLanguageTarget
    ) -> [LanguageModelRecommendation] {
        switch provider {
        case .appleFoundation:
            return [
                LanguageModelRecommendation(
                    modelId: AIProviderType.appleFoundation.defaultModel,
                    badge: "On-Device Private",
                    reason: "Zero-setup on-device Apple Intelligence model for English, German, French, Spanish, Japanese, and more (best for concise coaching & grading; pair with Ollama for long multi-part exam generation).",
                    sizeHint: "Built into macOS/iOS 26+",
                    isBestMatch: true
                )
            ]

        case .ollama:
            func pull(_ id: String) -> String { "ollama pull \(id)" }
            switch language {
            case .german, .french, .spanish:
                let langLabel = language == .german ? "German (Goethe/telc)" : (language == .french ? "French" : "Spanish")
                return [
                    LanguageModelRecommendation(
                        modelId: "mistral-small3.1",
                        badge: "European Precision",
                        reason: "Top local accuracy for \(langLabel) register, formal/informal nuance, and strict exam JSON formatting.",
                        sizeHint: "~15 GB · 24 GB+ RAM",
                        pullCommand: pull("mistral-small3.1"),
                        isBestMatch: true
                    ),
                    LanguageModelRecommendation(
                        modelId: "qwen3:14b",
                        badge: "Best 16–24 GB Balance",
                        reason: "Sharp \(langLabel) grammar explanations and 4-skill error corrections in a comfortable memory footprint.",
                        sizeHint: "~9.3 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen3:14b")
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma4:latest",
                        badge: "140+ Languages",
                        reason: "Natural conversational dialogues and idiomatic \(langLabel) phrasing with broad multilingual coverage.",
                        sizeHint: "~9.6 GB · 16–24 GB RAM",
                        pullCommand: pull("gemma4:latest")
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma3:12b",
                        badge: "Fast & Direct JSON",
                        reason: "Rapid zero-thinking responses — ideal for fast 4-skill exam generation and instant Cloze drills.",
                        sizeHint: "~8.1 GB · 16 GB RAM",
                        pullCommand: pull("gemma3:12b")
                    )
                ]
            case .english:
                return [
                    LanguageModelRecommendation(
                        modelId: "gemma4:latest",
                        badge: "Best Overall",
                        reason: "Natural C1/C2 English cadence, realistic regional dialogues, and thoughtful IELTS/Cambridge coaching.",
                        sizeHint: "~9.6 GB · 16–24 GB RAM",
                        pullCommand: pull("gemma4:latest"),
                        isBestMatch: true
                    ),
                    LanguageModelRecommendation(
                        modelId: "qwen3:14b",
                        badge: "Analytical Grader",
                        reason: "Strict CEFR rubric scoring, nuanced essay rewrites, and accurate grammar diagnostics.",
                        sizeHint: "~9.3 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen3:14b")
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma3:12b",
                        badge: "Fast & Direct",
                        reason: "Snappy local generation for fresh unseen mock exams with zero reasoning latency.",
                        sizeHint: "~8.1 GB · 16 GB RAM",
                        pullCommand: pull("gemma3:12b")
                    ),
                    LanguageModelRecommendation(
                        modelId: "llama3.2",
                        badge: "Lightweight 8 GB RAM",
                        reason: "Fast and fluent English practice on 8 GB Macs when memory is tight.",
                        sizeHint: "~2.0 GB · 8 GB RAM",
                        pullCommand: pull("llama3.2")
                    )
                ]
            case .japanese:
                return [
                    LanguageModelRecommendation(
                        modelId: "qwen3:14b",
                        badge: "Best for CJK & Japanese",
                        reason: "Leading open-weights Japanese/CJK tokenization, natural keigo nuance, and accurate kanji explanations.",
                        sizeHint: "~9.3 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen3:14b"),
                        isBestMatch: true
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma4:latest",
                        badge: "140+ Languages",
                        reason: "Strong Japanese conversational flow and contextual explanations across JLPT levels.",
                        sizeHint: "~9.6 GB · 16–24 GB RAM",
                        pullCommand: pull("gemma4:latest")
                    ),
                    LanguageModelRecommendation(
                        modelId: "qwen2.5:14b",
                        badge: "Fast CJK Classic",
                        reason: "Reliable Japanese comprehension and structured JSON output with zero thinking overhead.",
                        sizeHint: "~9.0 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen2.5:14b")
                    )
                ]
            case .globalRegional:
                return [
                    LanguageModelRecommendation(
                        modelId: "qwen3:14b",
                        badge: "100+ Languages",
                        reason: "Top local accuracy across Arabic, Vietnamese, Korean, Thai, Indonesian, Chinese, and European languages.",
                        sizeHint: "~9.3 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen3:14b"),
                        isBestMatch: true
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma4:latest",
                        badge: "140+ Languages",
                        reason: "Broadest open multilingual training set — strong coherence across non-Western scripts.",
                        sizeHint: "~9.6 GB · 16–24 GB RAM",
                        pullCommand: pull("gemma4:latest")
                    ),
                    LanguageModelRecommendation(
                        modelId: "aya-expanse:8b",
                        badge: "Regional Specialist",
                        reason: "Cohere's 23-language specialist built for Arabic, Vietnamese, Turkish, Hindi, Polish, and more.",
                        sizeHint: "~5.1 GB · 8–16 GB RAM",
                        pullCommand: pull("aya-expanse:8b")
                    )
                ]
            case .all:
                return [
                    LanguageModelRecommendation(
                        modelId: "qwen3:14b",
                        badge: "Best Polyglot Pick",
                        reason: "100+ languages with top-tier grammar explanations, exam JSON reliability, and balanced 16–24 GB RAM speed.",
                        sizeHint: "~9.3 GB · 16–24 GB RAM",
                        pullCommand: pull("qwen3:14b"),
                        isBestMatch: true
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma4:latest",
                        badge: "140+ Languages",
                        reason: "Broadest open multilingual fluency for natural multi-speaker dialogues and roleplay coaching.",
                        sizeHint: "~9.6 GB · 16–24 GB RAM",
                        pullCommand: pull("gemma4:latest")
                    ),
                    LanguageModelRecommendation(
                        modelId: "gemma3:12b",
                        badge: "Fastest Exam Generator",
                        reason: "140+ languages with fast direct replies and no slow thinking tokens during 4-skill exam generation.",
                        sizeHint: "~8.1 GB · 16 GB RAM",
                        pullCommand: pull("gemma3:12b")
                    ),
                    LanguageModelRecommendation(
                        modelId: "mistral-small3.1",
                        badge: "European Specialist",
                        reason: "Best local precision if your polyglot stack centers on German, French, Spanish, Italian, and English.",
                        sizeHint: "~15 GB · 24 GB+ RAM",
                        pullCommand: pull("mistral-small3.1")
                    ),
                    LanguageModelRecommendation(
                        modelId: "aya-expanse:8b",
                        badge: "Lightweight 23-Lang",
                        reason: "Compact multilingual specialist ideal for 8–16 GB machines and regional languages.",
                        sizeHint: "~5.1 GB · 8–16 GB RAM",
                        pullCommand: pull("aya-expanse:8b")
                    )
                ]
            }

        case .lmstudio:
            let isEuro = [.german, .french, .spanish].contains(language)
            return [
                LanguageModelRecommendation(
                    modelId: isEuro ? "mistral-small-3.1-24b-instruct" : "qwen3-14b-instruct",
                    badge: "Best Local Pick",
                    reason: isEuro
                        ? "Crisp European grammar precision and clean JSON formatting in LM Studio."
                        : "Top multilingual fluency across 100+ languages with strong CEFR grading precision.",
                    sizeHint: "GGUF Q4_K_M · 16–24 GB RAM",
                    isBestMatch: true
                ),
                LanguageModelRecommendation(
                    modelId: "gemma-3-12b-it",
                    badge: "140+ Languages · Fast",
                    reason: "Fast, fluent dialogues and reliable structured exam generation across 140+ languages.",
                    sizeHint: "~8 GB GGUF · 16 GB RAM"
                ),
                LanguageModelRecommendation(
                    modelId: "qwen2.5-7b-instruct",
                    badge: "Lightweight",
                    reason: "Great multilingual fallback for 8–16 GB RAM machines.",
                    sizeHint: "~5 GB GGUF · 8–16 GB RAM"
                )
            ]

        case .openai:
            return [
                LanguageModelRecommendation(
                    modelId: "gpt-4o",
                    badge: "Highest Accuracy",
                    reason: "Flagship multilingual precision for nuanced \(language.shortName) C1/C2 grading, idioms, and natural dialogues.",
                    sizeHint: "Cloud · Flagship",
                    isBestMatch: true
                ),
                LanguageModelRecommendation(
                    modelId: "gpt-4.1-mini",
                    badge: "Best Speed & Value",
                    reason: "Very fast, low-cost, and super reliable at structured JSON exam generation and 4-skill rubrics.",
                    sizeHint: "Cloud · Fast & Affordable"
                ),
                LanguageModelRecommendation(
                    modelId: "gpt-4o-mini",
                    badge: "Budget Daily Coach",
                    reason: "Ultra-cheap everyday practice for A1–B2 drills and vocabulary coaching.",
                    sizeHint: "Cloud · Lowest Cost"
                )
            ]

        case .gemini:
            let preferPro = [.japanese, .globalRegional, .german].contains(language)
            return [
                LanguageModelRecommendation(
                    modelId: "gemini-2.5-pro",
                    badge: "Top Multilingual Depth",
                    reason: "Google's strongest 140+ language model — excels at nuanced C1/C2 essays, Japanese/Asian scripts, and DACH German.",
                    sizeHint: "Cloud · Flagship",
                    isBestMatch: preferPro
                ),
                LanguageModelRecommendation(
                    modelId: "gemini-2.5-flash",
                    badge: "Best Overall Speed",
                    reason: "Blazing-fast 140+ language performance — ideal for generating fresh 4-skill simulated exams and daily coaching.",
                    sizeHint: "Cloud · Fast & Free Tier",
                    isBestMatch: !preferPro
                )
            ]

        case .openrouter:
            let isEuro = [.german, .french, .spanish, .english].contains(language)
            return [
                LanguageModelRecommendation(
                    modelId: "anthropic/claude-3.5-sonnet",
                    badge: isEuro ? "Best European Nuance" : "Top Tutor Style",
                    reason: "Exceptionally natural stylistic rewrites, clear pedagogical explanations, and idiomatic register control.",
                    sizeHint: "Cloud · Premium",
                    isBestMatch: isEuro
                ),
                LanguageModelRecommendation(
                    modelId: "google/gemini-2.5-flash",
                    badge: "Best Multilingual Value",
                    reason: "Fast, inexpensive, and trained across 140+ languages including Asian and regional tongues.",
                    sizeHint: "Cloud · Fast & Low Cost",
                    isBestMatch: !isEuro
                ),
                LanguageModelRecommendation(
                    modelId: "openai/gpt-4o-mini",
                    badge: "Reliable JSON Grader",
                    reason: "Consistent structured scoring and fast exam generation at minimal per-exam cost.",
                    sizeHint: "Cloud · Low Cost"
                ),
                LanguageModelRecommendation(
                    modelId: "qwen/qwen3-30b-a3b",
                    badge: "Open Multilingual MoE",
                    reason: "Strong 100+ language coverage (especially CJK & global) at open-model pricing.",
                    sizeHint: "Cloud · Ultra Low Cost"
                )
            ]

        case .custom:
            return [
                LanguageModelRecommendation(
                    modelId: "llama-3.3-70b-versatile",
                    badge: "Best Overall",
                    reason: "Fast 70B multilingual performance on Groq / OpenAI-compatible gateways.",
                    sizeHint: "Cloud / Custom",
                    isBestMatch: true
                ),
                LanguageModelRecommendation(
                    modelId: "mistral-small-latest",
                    badge: "European Precision",
                    reason: "Ideal on Mistral API for German, French, Spanish, and English exam coaching.",
                    sizeHint: "Cloud / Mistral"
                )
            ]
        }
    }

    public static func rankFetchedModels(
        _ models: [AIModelInfo],
        for language: ModelLanguageTarget
    ) -> [RankedFetchedModel] {
        let isEuro = [.german, .french, .spanish].contains(language)
        let isAsianOrRegional = [.japanese, .globalRegional].contains(language)

        let ranked: [RankedFetchedModel] = models.map { model in
            let id = model.id.lowercased()
            if isCodingSpecializedModel(id) {
                return RankedFetchedModel(
                    model: model,
                    score: 12,
                    tier: .caution,
                    reason: "Coding-specialized model — weaker for natural grammar, register, and CEFR exams.",
                    isCodingModel: true
                )
            }

            var score = 52
            var reason = "General-purpose chat model suitable for standard language practice."

            if id.contains("gemma4") || id.contains("gemma-4") {
                score += 36
                reason = "140+ languages — excellent natural dialogues, idioms, and 4-skill coaching."
            } else if id.contains("qwen3") || id.contains("qwen-3") {
                score += isAsianOrRegional ? 40 : 37
                reason = isAsianOrRegional
                    ? "Top-tier 100+ language & Asian/regional accuracy with sharp grammar coaching."
                    : "Top-tier 100+ language reasoning, sharp grammar fixes, and strong CEFR grading."
            } else if id.contains("mistral-small") || id.contains("mistral-large") {
                score += isEuro ? 39 : 30
                reason = isEuro
                    ? "Outstanding European grammar precision, formal register, and strict exam JSON."
                    : "Fast, structured instruction follower with strong European language quality."
            } else if id.contains("gemma3") || id.contains("gemma-3") {
                score += 33
                reason = "140+ languages with fast direct output — great for exam generation & drills."
            } else if id.contains("aya-expanse") || id.contains("aya:") {
                score += language == .globalRegional ? 38 : 30
                reason = "Cohere multilingual specialist — rich cultural nuance across 23+ languages."
            } else if id.contains("qwen2.5") || id.contains("qwen2") {
                score += isAsianOrRegional ? 34 : 28
                reason = "Strong multilingual coverage and clean structured JSON responses."
            } else if id.contains("claude-3.5-sonnet") || id.contains("claude-3-7") || id.contains("claude-4") || id.contains("claude-sonnet") {
                score += 40
                reason = "Nuanced idiomatic rewrites, warm examiner coaching, and top-tier accuracy."
            } else if id.contains("gemini-2.5") || id.contains("gemini-2.0") {
                score += 38
                reason = "140+ language coverage with fast generation across all 4 exam skills."
            } else if id.contains("gpt-4.1") || (id.contains("gpt-4o") && !id.contains("mini")) || id.contains("gpt-5") {
                score += 39
                reason = "Flagship multilingual fluency and accurate C1/C2 examiner scoring."
            } else if id.contains("gpt-4o-mini") {
                score += 32
                reason = "Fast, reliable, low-cost model for daily drills and structured exams."
            } else if id.contains("llama3.3") || id.contains("llama-3.3") || id.contains("llama3.1") || id.contains("llama3.2") {
                score += language == .english ? 30 : 22
                reason = language == .english
                    ? "Fluent English coaching and fast everyday conversation practice."
                    : "Good general multilingual capability (strongest in English & major European tongues)."
            } else if id.contains("mistral") || id.contains("mixtral") {
                score += isEuro ? 28 : 22
                reason = "Solid European language grammar and concise responses."
            } else if id.contains("deepseek-r1") || id.contains("deepseek-v3") || id.contains("deepseek-chat") {
                score += 26
                reason = "Strong analytical grammar reasoning across major languages."
            }

            // Sweet-spot parameter size bonus
            if id.range(of: #"(?:12b|14b|22b|24b|26b|27b|30b|32b|70b)"#, options: .regularExpression) != nil {
                score += 5
            } else if id.range(of: #"(?:1b|1\.5b|2b|3b|e2b)"#, options: .regularExpression) != nil {
                score -= 6
            }

            let tier: ModelFitTier = score >= 82 ? .ideal : (score >= 62 ? .good : .caution)
            return RankedFetchedModel(model: model, score: score, tier: tier, reason: reason, isCodingModel: false)
        }

        return ranked.sorted { a, b in
            if a.score != b.score { return a.score > b.score }
            return a.model.id < b.model.id
        }
    }

    public static func bestInstalledModel(
        from models: [AIModelInfo],
        for language: ModelLanguageTarget
    ) -> RankedFetchedModel? {
        rankFetchedModels(models, for: language).first
    }
}
