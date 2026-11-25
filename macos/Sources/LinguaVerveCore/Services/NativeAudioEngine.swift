import Foundation
import AVFoundation
import Observation

#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
import AudioToolbox
#endif

// MARK: - Human Voice & Multi-Accent Models

public enum VoiceProviderType: String, Codable, CaseIterable, Identifiable, Sendable {
    case system = "system"
    case openai = "openai"
    case elevenlabs = "elevenlabs"
    case localOpenAI = "local-openai"

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .system: return "On-Device Siri / Neural (Free · Offline)"
        case .openai: return "OpenAI Human TTS (gpt-4o-mini-tts)"
        case .elevenlabs: return "ElevenLabs Ultra-Human Voices"
        case .localOpenAI: return "Local Neural TTS (Kokoro / Speaches)"
        }
    }

    public var shortLabel: String {
        switch self {
        case .system: return "Siri / Neural"
        case .openai: return "OpenAI TTS"
        case .elevenlabs: return "ElevenLabs"
        case .localOpenAI: return "Local Neural"
        }
    }

    public var defaultEndpoint: String {
        switch self {
        case .system: return ""
        case .openai: return "https://api.openai.com/v1/audio/speech"
        case .elevenlabs: return "https://api.elevenlabs.io/v1/text-to-speech"
        case .localOpenAI: return "http://localhost:8880/v1/audio/speech"
        }
    }

    public var defaultModel: String {
        switch self {
        case .system: return "system-neural"
        case .openai: return "gpt-4o-mini-tts"
        case .elevenlabs: return "eleven_multilingual_v2"
        case .localOpenAI: return "kokoro"
        }
    }

    public var defaultVoice: String {
        switch self {
        case .system: return ""
        case .openai: return "coral"
        case .elevenlabs: return "JBFqnCBsd6RMkjVDRZzb"
        case .localOpenAI: return "bf_emma"
        }
    }

    public var suggestedModels: [String] {
        switch self {
        case .system: return ["system-neural"]
        case .openai: return ["gpt-4o-mini-tts", "tts-1-hd", "tts-1"]
        case .elevenlabs: return ["eleven_multilingual_v2", "eleven_flash_v2_5"]
        case .localOpenAI: return ["kokoro", "tts-1"]
        }
    }

    public var requiresAPIKey: Bool {
        self == .openai || self == .elevenlabs
    }

    public var setupHint: String {
        switch self {
        case .system:
            return "Prioritizes Siri Neural, Gryphon Neural, and Apple Enhanced/Premium voices while blocking legacy robotic/Eloquence voices. Works 100% offline."
        case .openai:
            return "Uses gpt-4o-mini-tts with real accent instructions so British, American, Australian, Irish, Indian, Austrian & Swiss accents sound genuinely human."
        case .elevenlabs:
            return "Studio-grade lifelike multilingual human voices for English and German with natural breathing and expressive prosody."
        case .localOpenAI:
            return "100% private local neural voices via Kokoro-FastAPI (port 8880) or Speaches/OpenedAI-Speech (port 8000). No cloud key required."
        }
    }
}

public enum VoiceSpeakingStyle: String, Codable, CaseIterable, Identifiable, Sendable {
    case natural = "natural"
    case tutor = "tutor"
    case conversational = "conversational"
    case broadcast = "broadcast"

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .natural: return "Natural Human"
        case .tutor: return "Warm Language Coach"
        case .conversational: return "Conversational Friend"
        case .broadcast: return "Crisp News Broadcast"
        }
    }
}

public struct AccentOption: Identifiable, Equatable, Sendable {
    public var id: String { code }
    public let code: String
    public let languageId: String
    public let flag: String
    public let label: String
    public let region: String
    public let sampleText: String
    public let neuralHint: String

    public init(
        code: String,
        languageId: String,
        flag: String,
        label: String,
        region: String,
        sampleText: String,
        neuralHint: String
    ) {
        self.code = code
        self.languageId = languageId
        self.flag = flag
        self.label = label
        self.region = region
        self.sampleText = sampleText
        self.neuralHint = neuralHint
    }
}

public struct NeuralVoicePreset: Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let note: String

    public init(id: String, label: String, note: String) {
        self.id = id
        self.label = label
        self.note = note
    }
}

public struct VoiceSettings: Codable, Equatable, Sendable {
    public var provider: VoiceProviderType
    public var accents: [String: String]
    public var preferredSystemVoices: [String: String]
    public var rateMultiplier: Double
    public var speakingStyle: VoiceSpeakingStyle
    public var endpoint: String
    public var apiKey: String
    public var model: String
    public var neuralVoice: String
    public var reuseOpenAIKey: Bool

    public init(
        provider: VoiceProviderType = .system,
        accents: [String: String] = [
            "english": "en-GB",
            "german": "de-DE",
            "spanish": "es-ES",
            "french": "fr-FR"
        ],
        preferredSystemVoices: [String: String] = [:],
        rateMultiplier: Double = 1.0,
        speakingStyle: VoiceSpeakingStyle = .natural,
        endpoint: String = VoiceProviderType.openai.defaultEndpoint,
        apiKey: String = "",
        model: String = VoiceProviderType.openai.defaultModel,
        neuralVoice: String = VoiceProviderType.openai.defaultVoice,
        reuseOpenAIKey: Bool = true
    ) {
        self.provider = provider
        self.accents = accents
        self.preferredSystemVoices = preferredSystemVoices
        self.rateMultiplier = rateMultiplier
        self.speakingStyle = speakingStyle
        self.endpoint = endpoint
        self.apiKey = apiKey
        self.model = model
        self.neuralVoice = neuralVoice
        self.reuseOpenAIKey = reuseOpenAIKey
    }
}

public struct VoiceCandidateDescriptor: Equatable, Sendable {
    public let identifier: String
    public let name: String
    public let language: String
    public let qualityRaw: Int

    public init(identifier: String, name: String, language: String, qualityRaw: Int) {
        self.identifier = identifier
        self.name = name
        self.language = language
        self.qualityRaw = qualityRaw
    }
}

// MARK: - Native Audio & Multi-Accent Human Voice Engine

@Observable
public final class NativeAudioEngine {
    public static let shared = NativeAudioEngine()

    public static let accentCatalog: [AccentOption] = [
        // English (6 global accents)
        AccentOption(
            code: "en-GB",
            languageId: "english",
            flag: "🇬🇧",
            label: "British (UK)",
            region: "London · Received Pronunciation",
            sampleText: "Good afternoon! Shall we practise crisp British pronunciation and natural human intonation together?",
            neuralHint: "Speak in a warm, natural British English (London RP) accent with authentic UK vowel cadence."
        ),
        AccentOption(
            code: "en-US",
            languageId: "english",
            flag: "🇺🇸",
            label: "American (US)",
            region: "General American",
            sampleText: "Good morning! Let's practice smooth connected speech and natural American rhythm together.",
            neuralHint: "Speak in a warm, natural General American English accent with relaxed everyday flow."
        ),
        AccentOption(
            code: "en-AU",
            languageId: "english",
            flag: "🇦🇺",
            label: "Australian (AU)",
            region: "Sydney · General Australian",
            sampleText: "G'day! Let's train your ear on relaxed Australian vowel glides and natural intonation.",
            neuralHint: "Speak in an authentic, friendly General Australian English (Sydney) accent."
        ),
        AccentOption(
            code: "en-IE",
            languageId: "english",
            flag: "🇮🇪",
            label: "Irish (IE)",
            region: "Dublin · Hiberno-English",
            sampleText: "Hello there! Listen to the warm cadence and melodic rhythm of natural Irish English.",
            neuralHint: "Speak in a warm, natural educated Irish English (Dublin) accent."
        ),
        AccentOption(
            code: "en-IN",
            languageId: "english",
            flag: "🇮🇳",
            label: "Indian (IN)",
            region: "Educated Indian English",
            sampleText: "Welcome! Practising international accents like Indian English builds real-world exam listening fluency.",
            neuralHint: "Speak in a clear, warm, articulate educated Indian English accent."
        ),
        AccentOption(
            code: "en-ZA",
            languageId: "english",
            flag: "🇿🇦",
            label: "South African (ZA)",
            region: "Cape Town",
            sampleText: "Hello! Training across global English accents sharpens your ear for IELTS and Cambridge audio.",
            neuralHint: "Speak in an authentic, clear educated South African English (Cape Town) accent."
        ),
        // German (3 pluricentric DACH accents)
        AccentOption(
            code: "de-DE",
            languageId: "german",
            flag: "🇩🇪",
            label: "Germany (DE)",
            region: "Standard Hochdeutsch · Berlin / Hanover",
            sampleText: "Guten Tag! Heute trainieren wir klares Hochdeutsch mit natürlicher menschlicher Betonung.",
            neuralHint: "Speak in warm, authentic Standard German (Bundesdeutsch / Hochdeutsch) with natural cadence."
        ),
        AccentOption(
            code: "de-AT",
            languageId: "german",
            flag: "🇦🇹",
            label: "Austria (AT)",
            region: "Österreichisches Deutsch · Vienna",
            sampleText: "Grüß Gott! Heute üben wir weiches, natürliches österreichisches Hochdeutsch aus Wien.",
            neuralHint: "Speak in an authentic, warm educated Austrian Standard German (Viennese) accent."
        ),
        AccentOption(
            code: "de-CH",
            languageId: "german",
            flag: "🇨🇭",
            label: "Switzerland (CH)",
            region: "Schweizer Hochdeutsch · Zurich",
            sampleText: "Grüezi! Willkommen beim Hörtraining für authentisches Schweizer Hochdeutsch.",
            neuralHint: "Speak in an authentic, clear Swiss Standard German (Schweizer Hochdeutsch, Zurich) accent."
        ),
        // Extensible languages
        AccentOption(
            code: "es-ES",
            languageId: "spanish",
            flag: "🇪🇸",
            label: "Spain (ES)",
            region: "Castilian · Madrid",
            sampleText: "¡Hola! Practiquemos la pronunciación natural del español de España.",
            neuralHint: "Speak in natural Castilian Spanish (Madrid) with clear articulation."
        ),
        AccentOption(
            code: "es-MX",
            languageId: "spanish",
            flag: "🇲🇽",
            label: "Mexico (MX)",
            region: "Latin American · Mexico City",
            sampleText: "¡Hola! Practiquemos el ritmo natural y cálido del español mexicano.",
            neuralHint: "Speak in warm, natural Mexican Spanish (Mexico City)."
        ),
        AccentOption(
            code: "fr-FR",
            languageId: "french",
            flag: "🇫🇷",
            label: "France (FR)",
            region: "Standard Parisian",
            sampleText: "Bonjour ! Entraînons notre oreille au français naturel et expressif.",
            neuralHint: "Speak in natural, warm Parisian French."
        ),
        AccentOption(
            code: "fr-CA",
            languageId: "french",
            flag: "🇨🇦",
            label: "Canada (CA)",
            region: "Québécois · Montreal",
            sampleText: "Bonjour ! Découvrons la cadence chaleureuse du français québécois.",
            neuralHint: "Speak in natural, warm Canadian French (Montreal)."
        )
    ]

    public static let openAINeuralVoices: [NeuralVoicePreset] = [
        NeuralVoicePreset(id: "coral", label: "Coral", note: "Warm, expressive human conversationalist (recommended)"),
        NeuralVoicePreset(id: "sage", label: "Sage", note: "Calm, articulate language tutor cadence"),
        NeuralVoicePreset(id: "nova", label: "Nova", note: "Bright, natural everyday clarity"),
        NeuralVoicePreset(id: "ash", label: "Ash", note: "Grounded, natural male voice"),
        NeuralVoicePreset(id: "ballad", label: "Ballad", note: "Smooth, melodic storytelling tone"),
        NeuralVoicePreset(id: "fable", label: "Fable", note: "Expressive British-leaning narrator"),
        NeuralVoicePreset(id: "echo", label: "Echo", note: "Balanced, clear male broadcast tone"),
        NeuralVoicePreset(id: "onyx", label: "Onyx", note: "Deep, authoritative lecture voice"),
        NeuralVoicePreset(id: "shimmer", label: "Shimmer", note: "Gentle, crisp female articulation"),
        NeuralVoicePreset(id: "alloy", label: "Alloy", note: "Neutral studio all-rounder")
    ]

    public static let elevenLabsNeuralVoices: [NeuralVoicePreset] = [
        NeuralVoicePreset(id: "JBFqnCBsd6RMkjVDRZzb", label: "George (British Male)", note: "Warm, studio-grade British · Multilingual v2"),
        NeuralVoicePreset(id: "IKne3meq5aSn9XLyUdCD", label: "Charlie (Australian Male)", note: "Natural Australian conversational · Multilingual"),
        NeuralVoicePreset(id: "onwK4e9ZLuTAKqWW03F9", label: "Daniel (British News)", note: "Crisp BBC-style British articulation · Multilingual"),
        NeuralVoicePreset(id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah (Natural Female)", note: "Soft, lifelike human warmth · Multilingual"),
        NeuralVoicePreset(id: "9BWtsMINqrJLrRacOk9x", label: "Aria (Expressive Female)", note: "Dynamic everyday intonation · Multilingual"),
        NeuralVoicePreset(id: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam (American Male)", note: "Clear General American · Multilingual"),
        NeuralVoicePreset(id: "XB0fDUnXU5powFXDhCwa", label: "Charlotte (European Female)", note: "Smooth European EN & DE articulation")
    ]

    public static let localNeuralVoices: [NeuralVoicePreset] = [
        NeuralVoicePreset(id: "bf_emma", label: "Kokoro Emma (British F)", note: "Natural British neural voice (Kokoro-FastAPI)"),
        NeuralVoicePreset(id: "bm_george", label: "Kokoro George (British M)", note: "Natural British male neural voice"),
        NeuralVoicePreset(id: "af_heart", label: "Kokoro Heart (American F)", note: "Top-rated warm US neural voice"),
        NeuralVoicePreset(id: "am_michael", label: "Kokoro Michael (American M)", note: "Natural US male neural voice"),
        NeuralVoicePreset(id: "af_bella", label: "Kokoro Bella (American F)", note: "Expressive conversational US voice")
    ]

    private static let roboticVoiceNames: Set<String> = [
        "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
        "deranged", "eddy", "flo", "fred", "good news", "grandma", "grandpa",
        "hysterical", "jester", "junior", "kathy", "organ", "princess", "ralph",
        "reed", "rocko", "sandy", "shelley", "superstar", "trinoids", "whisper",
        "wobble", "zarvox"
    ]

    private static let knownHumanNames: Set<String> = [
        "samantha", "daniel", "karen", "moira", "rishi", "tessa", "aman", "tara",
        "anna", "markus", "petra", "viktor", "yannick", "martin", "helena", "quinn",
        "simone", "ava", "allison", "zoe", "serena", "kate", "oliver", "arthur",
        "martha", "tom", "evan", "aaron", "nicky", "amélie", "thomas", "mónica",
        "paulina"
    ]

    private static let settingsKey = "linguaverve_voice_settings_v1"
    private static let sharedAIConfigKey = "linguaverve_ai_provider_v1"

    private let synthesizer = AVSpeechSynthesizer()
    private var audioPlayer: AVAudioPlayer?
    private var neuralTask: Task<Void, Never>?
    private var neuralCache: [String: Data] = [:]
    private var neuralCacheOrder: [String] = []
    private let defaults: UserDefaults

    public var isMuted: Bool = false
    public var slowPace: Bool = false
    public var currentlySpeakingText: String?
    public var isLoadingNeuralAudio: Bool = false
    public var lastVoiceNotice: String?
    public var voiceSettings: VoiceSettings

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if let raw = defaults.data(forKey: Self.settingsKey),
           let decoded = try? JSONDecoder().decode(VoiceSettings.self, from: raw) {
            self.voiceSettings = decoded
        } else {
            self.voiceSettings = VoiceSettings()
        }
    }

    public func updateVoiceSettings(_ next: VoiceSettings) {
        var clamped = next
        clamped.rateMultiplier = max(0.75, min(1.25, next.rateMultiplier))
        self.voiceSettings = clamped
        self.lastVoiceNotice = nil
        if let encoded = try? JSONEncoder().encode(clamped) {
            defaults.set(encoded, forKey: Self.settingsKey)
        }
    }

    public func setAccent(for languageId: String, accentCode: String) {
        let key = Self.normalizeLanguageKey(languageId)
        var next = voiceSettings
        next.accents[key] = accentCode
        updateVoiceSettings(next)
    }

    public func activeAccentCode(for languageId: String) -> String {
        let trimmed = languageId.replacingOccurrences(of: "_", with: "-")
        if trimmed.count == 5, trimmed.contains("-") {
            return trimmed
        }
        let key = Self.normalizeLanguageKey(languageId)
        if let saved = voiceSettings.accents[key], !saved.isEmpty {
            return saved
        }
        switch key {
        case "german": return "de-DE"
        case "spanish": return "es-ES"
        case "french": return "fr-FR"
        case "japanese": return "ja-JP"
        default: return "en-GB"
        }
    }

    public func activeAccentOption(for languageId: String) -> AccentOption? {
        Self.accentOption(for: activeAccentCode(for: languageId))
    }

    public static func normalizeLanguageKey(_ languageId: String) -> String {
        let lower = languageId.lowercased()
        if lower == "german" || lower == "de" || lower.hasPrefix("de-") { return "german" }
        if lower == "spanish" || lower == "es" || lower.hasPrefix("es-") { return "spanish" }
        if lower == "french" || lower == "fr" || lower.hasPrefix("fr-") { return "french" }
        if lower == "japanese" || lower == "ja" || lower.hasPrefix("ja-") { return "japanese" }
        return "english"
    }

    public static func accents(for languageId: String) -> [AccentOption] {
        let key = normalizeLanguageKey(languageId)
        return accentCatalog.filter { $0.languageId == key }
    }

    public static func accentOption(for code: String) -> AccentOption? {
        let norm = code.replacingOccurrences(of: "_", with: "-").lowercased()
        return accentCatalog.first { $0.code.lowercased() == norm }
    }

    public static func bcp47LanguageCode(for languageId: String) -> String {
        shared.activeAccentCode(for: languageId)
    }

    public func effectiveAPIKey(for cfg: VoiceSettings? = nil) -> String {
        let target = cfg ?? voiceSettings
        let direct = target.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        if !direct.isEmpty { return direct }
        if target.provider == .openai && target.reuseOpenAIKey,
           let raw = defaults.data(forKey: Self.sharedAIConfigKey),
           let aiCfg = try? JSONDecoder().decode(AIProviderConfig.self, from: raw),
           aiCfg.provider == .openai {
            return aiCfg.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return ""
    }

    public func isNeuralProviderReady(for cfg: VoiceSettings? = nil) -> Bool {
        let target = cfg ?? voiceSettings
        switch target.provider {
        case .system:
            return false
        case .localOpenAI:
            return !target.endpoint.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .openai, .elevenlabs:
            return !target.endpoint.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                && !effectiveAPIKey(for: target).isEmpty
        }
    }

    public func toggleMute() -> Bool {
        isMuted.toggle()
        if isMuted {
            stopSpeech()
        }
        return isMuted
    }

    public func playClickSound() {
        guard !isMuted else { return }
        #if os(macOS)
        NSSound(named: NSSound.Name("Tink"))?.play()
        #elseif canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
        }
        #endif
    }

    public func playSuccessChime() {
        guard !isMuted else { return }
        #if os(macOS)
        if let glass = NSSound(named: NSSound.Name("Glass")) {
            glass.play()
        } else {
            NSSound.beep()
        }
        #elseif canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        }
        AudioServicesPlaySystemSound(1057)
        #endif
    }

    // MARK: - Speak & Neural TTS Dispatch

    public func speak(
        _ text: String,
        languageId: String = "english",
        slow: Bool? = nil,
        accentOverride: String? = nil
    ) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !isMuted, !trimmed.isEmpty else { return }
        let useSlow = slow ?? slowPace
        let bcp47 = accentOverride?.replacingOccurrences(of: "_", with: "-")
            ?? activeAccentCode(for: languageId)

        stopSpeech()
        currentlySpeakingText = trimmed

        if isNeuralProviderReady(for: voiceSettings) {
            let cfg = voiceSettings
            neuralTask = Task { [weak self] in
                guard let self else { return }
                await self.speakWithNeuralProvider(text: trimmed, bcp47: bcp47, slow: useSlow, cfg: cfg)
            }
            return
        }

        speakWithSystemVoice(text: trimmed, bcp47: bcp47, slow: useSlow, cfg: voiceSettings)
    }

    public func previewVoice(
        text: String,
        accentCode: String,
        overrideSettings: VoiceSettings? = nil
    ) async -> (ok: Bool, summary: String) {
        let cfg = overrideSettings ?? voiceSettings
        stopSpeech()
        currentlySpeakingText = text

        if isNeuralProviderReady(for: cfg) {
            return await speakWithNeuralProvider(text: text, bcp47: accentCode, slow: false, cfg: cfg)
        }

        let voice = speakWithSystemVoice(text: text, bcp47: accentCode, slow: false, cfg: cfg)
        if let voice {
            return (true, "On-Device · \(Self.friendlyDisplayName(for: voice)) (\(voice.language))")
        }
        return (true, "On-Device (\(accentCode))")
    }

    public func stopSpeech() {
        neuralTask?.cancel()
        neuralTask = nil
        audioPlayer?.stop()
        audioPlayer = nil
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isLoadingNeuralAudio = false
        currentlySpeakingText = nil
    }

    // MARK: - Human Neural Voice Ranking & Robotic Filtering

    public static func isRoboticVoice(_ candidate: VoiceCandidateDescriptor) -> Bool {
        let idLower = candidate.identifier.lowercased()
        let baseName = candidate.name.lowercased().split(separator: "(").first.map {
            String($0).trimmingCharacters(in: .whitespaces)
        } ?? candidate.name.lowercased()

        if roboticVoiceNames.contains(baseName) { return true }
        if idLower.contains("eloquence") { return true }
        if idLower.contains("com.apple.speech.synthesis.voice.") { return true }
        if idLower.contains("espeak") { return true }
        return false
    }

    public static func scoreVoice(_ candidate: VoiceCandidateDescriptor, targetBcp47: String) -> Int {
        if isRoboticVoice(candidate) { return -1000 }

        let vLang = candidate.language.replacingOccurrences(of: "_", with: "-").lowercased()
        let target = targetBcp47.replacingOccurrences(of: "_", with: "-").lowercased()
        let targetBase = String(target.prefix(2))

        guard vLang.hasPrefix(targetBase) else { return -500 }

        var score = (vLang == target) ? 300 : 80
        let idLower = candidate.identifier.lowercased()
        let baseName = candidate.name.lowercased().split(separator: "(").first.map {
            String($0).trimmingCharacters(in: .whitespaces)
        } ?? candidate.name.lowercased()

        if idLower.contains("siri.natural") || idLower.contains("gryphon-neural") || idLower.contains("neural") {
            score += 155
        } else if idLower.contains("premium") || candidate.qualityRaw >= 3 {
            score += 135
        } else if idLower.contains("enhanced") || candidate.qualityRaw == 2 {
            score += 105
        }

        if knownHumanNames.contains(baseName) {
            score += 45
        }
        if idLower.contains("super-compact") {
            score -= 15
        }

        return score
    }

    public static func pickBestCandidate(
        from candidates: [VoiceCandidateDescriptor],
        targetBcp47: String,
        preferredIdentifier: String? = nil
    ) -> VoiceCandidateDescriptor? {
        if let pref = preferredIdentifier, !pref.isEmpty,
           let match = candidates.first(where: { $0.identifier == pref && !isRoboticVoice($0) }) {
            return match
        }
        let scored = candidates
            .map { (candidate: $0, score: scoreVoice($0, targetBcp47: targetBcp47)) }
            .filter { $0.score > -500 }
            .sorted { $0.score > $1.score }
        return scored.first?.candidate
    }

    public static func humanSystemVoices(for languageOrLocale: String) -> [AVSpeechSynthesisVoice] {
        let target = languageOrLocale.replacingOccurrences(of: "_", with: "-")
        let base = String(target.prefix(2)).lowercased()
        let all = AVSpeechSynthesisVoice.speechVoices()
        return all
            .filter { voice in
                let desc = VoiceCandidateDescriptor(
                    identifier: voice.identifier,
                    name: voice.name,
                    language: voice.language,
                    qualityRaw: voice.quality.rawValue
                )
                return voice.language.lowercased().hasPrefix(base) && !isRoboticVoice(desc)
            }
            .sorted { lhs, rhs in
                let lDesc = VoiceCandidateDescriptor(identifier: lhs.identifier, name: lhs.name, language: lhs.language, qualityRaw: lhs.quality.rawValue)
                let rDesc = VoiceCandidateDescriptor(identifier: rhs.identifier, name: rhs.name, language: rhs.language, qualityRaw: rhs.quality.rawValue)
                return scoreVoice(lDesc, targetBcp47: target) > scoreVoice(rDesc, targetBcp47: target)
            }
    }

    public static func friendlyDisplayName(for voice: AVSpeechSynthesisVoice) -> String {
        let id = voice.identifier
        let idLower = id.lowercased()
        if idLower.contains("siri.natural.") {
            let persona = id.components(separatedBy: ".").last ?? voice.name
            return "Siri Neural · \(persona)"
        }
        if idLower.contains("gryphon-neural") {
            let parts = id.components(separatedBy: "_")
            let persona = parts.count > 1 ? parts[1] : voice.name
            return "Apple Neural Premium · \(persona)"
        }
        if idLower.contains("premium") || voice.quality == .premium {
            return "\(voice.name) (Premium)"
        }
        if idLower.contains("enhanced") || voice.quality == .enhanced {
            return "\(voice.name) (Enhanced)"
        }
        return voice.name
    }

    public static func buildNeuralInstructions(
        accentCode: String,
        style: VoiceSpeakingStyle,
        slow: Bool
    ) -> String {
        let accentCue = accentOption(for: accentCode)?.neuralHint
            ?? "Speak in natural, idiomatic \(accentCode) with authentic native pronunciation."

        let styleCue: String
        switch style {
        case .natural:
            styleCue = "Use warm, natural human prosody with subtle breathing pauses between sentences."
        case .tutor:
            styleCue = "Speak like an encouraging, crystal-clear native language coach articulating cleanly without sounding robotic."
        case .conversational:
            styleCue = "Speak casually and expressively like a native friend talking over coffee."
        case .broadcast:
            styleCue = "Speak with crisp, poised news-broadcast clarity and balanced pacing."
        }

        let paceCue = slow
            ? "Deliver at a gentle, deliberate learner pace (~0.8x) with clean enunciation."
            : "Deliver at a natural everyday speaking pace."

        return "\(accentCue) \(styleCue) \(paceCue) Never sound flat or mechanical."
    }

    public static func splitIntoNaturalPhrases(_ text: String) -> [String] {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard cleaned.count > 95 else { return [cleaned] }
        var chunks: [String] = []
        var current = ""
        for ch in cleaned {
            current.append(ch)
            if ".!?".contains(ch) && current.trimmingCharacters(in: .whitespaces).count >= 24 {
                chunks.append(current.trimmingCharacters(in: .whitespaces))
                current = ""
            }
        }
        let tail = current.trimmingCharacters(in: .whitespaces)
        if !tail.isEmpty {
            chunks.append(tail)
        }
        return chunks.isEmpty ? [cleaned] : chunks
    }

    // MARK: - Private Synthesis Implementations

    @discardableResult
    private func speakWithSystemVoice(
        text: String,
        bcp47: String,
        slow: Bool,
        cfg: VoiceSettings
    ) -> AVSpeechSynthesisVoice? {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? session.setActive(true)
        #endif

        let voices = AVSpeechSynthesisVoice.speechVoices()
        let descriptors = voices.map {
            VoiceCandidateDescriptor(
                identifier: $0.identifier,
                name: $0.name,
                language: $0.language,
                qualityRaw: $0.quality.rawValue
            )
        }
        let prefId = cfg.preferredSystemVoices[bcp47]
        let chosenDesc = Self.pickBestCandidate(from: descriptors, targetBcp47: bcp47, preferredIdentifier: prefId)
        let chosenVoice = chosenDesc.flatMap { d in voices.first { $0.identifier == d.identifier } }
            ?? AVSpeechSynthesisVoice(language: bcp47)

        let baseRate: Float = slow ? 0.40 : 0.50
        let scaledRate = max(
            AVSpeechUtteranceMinimumSpeechRate,
            min(AVSpeechUtteranceMaximumSpeechRate, baseRate * Float(cfg.rateMultiplier))
        )

        let phrases = Self.splitIntoNaturalPhrases(text)
        for (idx, phrase) in phrases.enumerated() {
            let utterance = AVSpeechUtterance(string: phrase)
            utterance.voice = chosenVoice
            utterance.rate = scaledRate
            utterance.pitchMultiplier = cfg.speakingStyle == .broadcast ? 0.98 : 1.0
            utterance.prefersAssistiveTechnologySettings = false
            utterance.preUtteranceDelay = idx == 0 ? 0.02 : 0.04
            utterance.postUtteranceDelay = idx < phrases.count - 1 ? 0.14 : 0.04
            synthesizer.speak(utterance)
        }

        return chosenVoice
    }

    @discardableResult
    private func speakWithNeuralProvider(
        text: String,
        bcp47: String,
        slow: Bool,
        cfg: VoiceSettings
    ) async -> (ok: Bool, summary: String) {
        let cacheKey = "\(cfg.provider.rawValue)|\(cfg.model)|\(cfg.neuralVoice)|\(bcp47)|\(cfg.speakingStyle.rawValue)|\(cfg.rateMultiplier)|\(slow)|\(text)"

        if let cached = neuralCache[cacheKey] {
            if Task.isCancelled { return (false, "Cancelled") }
            do {
                try await MainActor.run {
                    try self.playAudioData(cached)
                }
                return (true, "\(cfg.provider.shortLabel) · \(cfg.neuralVoice) (\(bcp47) · cached)")
            } catch {
                // Fall through to re-fetch or system fallback
            }
        }

        await MainActor.run {
            self.isLoadingNeuralAudio = true
            self.lastVoiceNotice = nil
        }

        defer {
            Task { @MainActor in
                self.isLoadingNeuralAudio = false
            }
        }

        do {
            let apiKey = effectiveAPIKey(for: cfg)
            let speed = max(0.65, min(1.3, (slow ? 0.80 : 0.98) * cfg.rateMultiplier))
            var request: URLRequest

            if cfg.provider == .elevenlabs {
                let base = cfg.endpoint.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                let voiceId = cfg.neuralVoice.isEmpty ? Self.elevenLabsNeuralVoices[0].id : cfg.neuralVoice
                let urlStr = base.contains("/text-to-speech/") ? base : "\(base)/\(voiceId)"
                guard let url = URL(string: urlStr) else { throw URLError(.badURL) }
                request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                request.setValue("audio/mpeg", forHTTPHeaderField: "Accept")
                request.setValue(apiKey, forHTTPHeaderField: "xi-api-key")
                let body: [String: Any] = [
                    "text": text,
                    "model_id": cfg.model.isEmpty ? "eleven_multilingual_v2" : cfg.model,
                    "voice_settings": [
                        "stability": 0.48,
                        "similarity_boost": 0.78,
                        "style": cfg.speakingStyle == .conversational ? 0.35 : 0.2,
                        "use_speaker_boost": true
                    ]
                ]
                request.httpBody = try JSONSerialization.data(withJSONObject: body)
            } else {
                guard let url = URL(string: cfg.endpoint) else { throw URLError(.badURL) }
                request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                if !apiKey.isEmpty {
                    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
                }
                let model = cfg.model.isEmpty ? cfg.provider.defaultModel : cfg.model
                let voice = cfg.neuralVoice.isEmpty ? cfg.provider.defaultVoice : cfg.neuralVoice
                var body: [String: Any] = [
                    "model": model,
                    "input": text,
                    "voice": voice,
                    "response_format": "mp3",
                    "speed": speed
                ]
                if cfg.provider == .openai && model.lowercased().contains("gpt-4o-mini-tts") {
                    body["instructions"] = Self.buildNeuralInstructions(
                        accentCode: bcp47,
                        style: cfg.speakingStyle,
                        slow: slow
                    )
                }
                request.httpBody = try JSONSerialization.data(withJSONObject: body)
            }

            request.timeoutInterval = 25
            let (data, response) = try await URLSession.shared.data(for: request)
            if Task.isCancelled { return (false, "Cancelled") }

            guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode), !data.isEmpty else {
                let code = (response as? HTTPURLResponse)?.statusCode ?? 0
                throw NSError(domain: "LinguaVerveTTS", code: code, userInfo: [NSLocalizedDescriptionKey: "HTTP \(code)"])
            }

            storeInCache(key: cacheKey, data: data)
            try await MainActor.run {
                try self.playAudioData(data)
            }
            return (true, "\(cfg.provider.shortLabel) · \(cfg.neuralVoice) (\(bcp47))")
        } catch {
            if Task.isCancelled { return (false, "Cancelled") }
            let notice = "Neural TTS unavailable (\(error.localizedDescription)) — fell back to on-device Siri/Neural voice."
            await MainActor.run {
                self.lastVoiceNotice = notice
                _ = self.speakWithSystemVoice(text: text, bcp47: bcp47, slow: slow, cfg: cfg)
            }
            return (false, notice)
        }
    }

    private func storeInCache(key: String, data: Data) {
        if neuralCache[key] == nil {
            neuralCacheOrder.append(key)
            if neuralCacheOrder.count > 40 {
                let oldest = neuralCacheOrder.removeFirst()
                neuralCache.removeValue(forKey: oldest)
            }
        }
        neuralCache[key] = data
    }

    @MainActor
    private func playAudioData(_ data: Data) throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? session.setActive(true)
        #endif

        audioPlayer?.stop()
        let player = try AVAudioPlayer(data: data)
        player.prepareToPlay()
        player.play()
        audioPlayer = player
    }
}
