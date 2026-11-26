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

public struct DialogueTurn: Equatable, Sendable {
    public let speaker: String
    public let text: String
    public let speakerIndex: Int

    public init(speaker: String, text: String, speakerIndex: Int) {
        self.speaker = speaker
        self.text = text
        self.speakerIndex = speakerIndex
    }
}

private final class SpeechTurnDelegate: NSObject, AVSpeechSynthesizerDelegate, @unchecked Sendable {
    var speakerByUtteranceId: [ObjectIdentifier: String] = [:]
    var onSpeakerChange: (@Sendable (String?) -> Void)?
    var onFinishAll: (@Sendable () -> Void)?

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        let name = speakerByUtteranceId[ObjectIdentifier(utterance)]
        onSpeakerChange?(name)
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        speakerByUtteranceId.removeValue(forKey: ObjectIdentifier(utterance))
        if speakerByUtteranceId.isEmpty {
            onSpeakerChange?(nil)
            onFinishAll?()
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        speakerByUtteranceId.removeAll()
        onSpeakerChange?(nil)
    }
}

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
        NeuralVoicePreset(id: "de_DE-thorsten-high", label: "Thorsten High (German M · Piper/Speaches)", note: "Ultra-natural studio German male neural voice (Piper / OpenedAI-Speech)"),
        NeuralVoicePreset(id: "de_DE-eva_k-x_low", label: "Eva K (German F · Piper/Speaches)", note: "Warm German female neural voice (Piper / Speaches)"),
        NeuralVoicePreset(id: "de_DE-kerstin-low", label: "Kerstin (German F · Piper/Speaches)", note: "Clear German female conversational neural voice"),
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
    private static let sharedAIConfigKey = "linguaverve.apple.aiConfig.v1"
    private static let legacySharedAIConfigKey = "linguaverve_ai_provider_v1"
    private static let voiceCatalogLock = NSLock()
    private static var cachedVoiceCatalog: (voices: [AVSpeechSynthesisVoice], descriptors: [VoiceCandidateDescriptor])?
    private static var cachedDescriptorOnly: [VoiceCandidateDescriptor]?
    private static let dialogueTurnRegex: NSRegularExpression? = try? NSRegularExpression(
        pattern: #"(?:^|\n|(?<=[.!?—–]\s))([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\- ]{0,22}):\s+"#,
        options: []
    )

    private var synthesizer = AVSpeechSynthesizer()
    private let speechDelegate = SpeechTurnDelegate()
    private var audioPlayer: AVAudioPlayer?
    private var neuralTask: Task<Void, Never>?
    private var neuralCache: [String: Data] = [:]
    private var neuralCacheOrder: [String] = []
    private let defaults: UserDefaults
    #if os(macOS)
    @ObservationIgnored private var cachedTinkSound: NSSound?
    @ObservationIgnored private var didLoadTinkSound: Bool = false
    @ObservationIgnored private var cachedGlassSound: NSSound?
    @ObservationIgnored private var didLoadGlassSound: Bool = false
    #endif

    public var isMuted: Bool = false
    public var slowPace: Bool = false
    public var currentlySpeakingText: String?
    public var activeSpeakerName: String?
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
        self.synthesizer.delegate = self.speechDelegate
        self.speechDelegate.onSpeakerChange = { [weak self] name in
            Task { @MainActor in
                self?.activeSpeakerName = name
            }
        }
        self.speechDelegate.onFinishAll = { [weak self] in
            Task { @MainActor in
                self?.currentlySpeakingText = nil
                self?.activeSpeakerName = nil
            }
        }
    }

    /// Populates the cached voice descriptor catalog if not yet loaded.
    public func warmVoiceCache() {
        _ = Self.systemVoiceCatalog()
    }

    private static func systemVoiceCatalog() -> (voices: [AVSpeechSynthesisVoice], descriptors: [VoiceCandidateDescriptor]) {
        voiceCatalogLock.lock()
        if let cached = cachedVoiceCatalog {
            voiceCatalogLock.unlock()
            return cached
        }
        voiceCatalogLock.unlock()

        let voices = AVSpeechSynthesisVoice.speechVoices()
        let descriptors = voices.map {
            VoiceCandidateDescriptor(
                identifier: $0.identifier,
                name: $0.name,
                language: $0.language,
                qualityRaw: $0.quality.rawValue
            )
        }
        let snapshot = (voices: voices, descriptors: descriptors)

        voiceCatalogLock.lock()
        cachedVoiceCatalog = snapshot
        voiceCatalogLock.unlock()
        return snapshot
    }

    /// Clears the cached system voice catalog so newly downloaded macOS/iOS voices are picked up on next lookup.
    public func invalidateVoiceCache() {
        Self.voiceCatalogLock.lock()
        Self.cachedVoiceCatalog = nil
        Self.cachedDescriptorOnly = nil
        Self.voiceCatalogLock.unlock()
    }

    /// Ranked human voice descriptors from the cached catalog (`loader` injectable for headless tests).
    public static func cachedHumanVoiceDescriptors(
        for languageOrLocale: String,
        loader: (() -> [VoiceCandidateDescriptor])? = nil
    ) -> [VoiceCandidateDescriptor] {
        let target = languageOrLocale.replacingOccurrences(of: "_", with: "-")
        let base = String(target.prefix(2)).lowercased()
        let descriptors: [VoiceCandidateDescriptor]
        if let loader {
            voiceCatalogLock.lock()
            if let cached = cachedDescriptorOnly {
                descriptors = cached
                voiceCatalogLock.unlock()
            } else {
                voiceCatalogLock.unlock()
                let loaded = loader()
                voiceCatalogLock.lock()
                cachedDescriptorOnly = loaded
                descriptors = loaded
                voiceCatalogLock.unlock()
            }
        } else {
            descriptors = systemVoiceCatalog().descriptors
        }
        return descriptors
            .filter { $0.language.lowercased().hasPrefix(base) && !isRoboticVoice($0) }
            .sorted { scoreVoice($0, targetBcp47: target) > scoreVoice($1, targetBcp47: target) }
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
        if target.provider == .openai && target.reuseOpenAIKey {
            for key in [Self.sharedAIConfigKey, Self.legacySharedAIConfigKey] {
                if let raw = defaults.data(forKey: key),
                   let aiCfg = try? JSONDecoder().decode(AIProviderConfig.self, from: raw),
                   aiCfg.provider == .openai {
                    let trimmed = aiCfg.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
                    if !trimmed.isEmpty { return trimmed }
                }
            }
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
        if !didLoadTinkSound {
            didLoadTinkSound = true
            cachedTinkSound = NSSound(named: NSSound.Name("Tink"))
        }
        if cachedTinkSound?.isPlaying == true {
            cachedTinkSound?.stop()
        }
        cachedTinkSound?.play()
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
        if !didLoadGlassSound {
            didLoadGlassSound = true
            cachedGlassSound = NSSound(named: NSSound.Name("Glass"))
        }
        if let glassSound = cachedGlassSound {
            if glassSound.isPlaying {
                glassSound.stop()
            }
            glassSound.play()
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
        speechDelegate.speakerByUtteranceId.removeAll()
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isLoadingNeuralAudio = false
        currentlySpeakingText = nil
        activeSpeakerName = nil
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

    public struct ActiveVoiceDiagnostic: Equatable, Sendable {
        public let displayName: String
        public let identifier: String
        public let locale: String
        public let isHighQualityNeural: Bool
        public let qualityBadge: String
        public let highQualityCountForLanguage: Int

        public init(
            displayName: String,
            identifier: String,
            locale: String,
            isHighQualityNeural: Bool,
            qualityBadge: String,
            highQualityCountForLanguage: Int
        ) {
            self.displayName = displayName
            self.identifier = identifier
            self.locale = locale
            self.isHighQualityNeural = isHighQualityNeural
            self.qualityBadge = qualityBadge
            self.highQualityCountForLanguage = highQualityCountForLanguage
        }
    }

    public static func isHighQualityVoice(_ candidate: VoiceCandidateDescriptor) -> Bool {
        if isRoboticVoice(candidate) { return false }
        let idLower = candidate.identifier.lowercased()
        return idLower.contains("siri.natural")
            || idLower.contains("gryphon-neural")
            || idLower.contains("neural")
            || idLower.contains("premium")
            || idLower.contains("enhanced")
            || candidate.qualityRaw >= 2
    }

    public static func scoreVoice(_ candidate: VoiceCandidateDescriptor, targetBcp47: String) -> Int {
        if isRoboticVoice(candidate) { return -1000 }

        let vLang = candidate.language.replacingOccurrences(of: "_", with: "-").lowercased()
        let target = targetBcp47.replacingOccurrences(of: "_", with: "-").lowercased()
        let targetBase = String(target.prefix(2))

        guard vLang.hasPrefix(targetBase) else { return -500 }

        // Exact locale gets a strong bonus, but neural/premium/enhanced quality ALWAYS beats robotic compact voices
        var score = (vLang == target) ? 140 : 40
        let idLower = candidate.identifier.lowercased()
        let baseName = candidate.name.lowercased().split(separator: "(").first.map {
            String($0).trimmingCharacters(in: .whitespaces)
        } ?? candidate.name.lowercased()

        if idLower.contains("gryphon-neural") || (idLower.contains("premium") && idLower.contains("neural")) {
            score += 310
        } else if idLower.contains("siri.natural") || idLower.contains("neural") {
            score += 290
        } else if idLower.contains("premium") || candidate.qualityRaw >= 3 {
            score += 260
        } else if idLower.contains("enhanced") || candidate.qualityRaw == 2 {
            score += 210
        } else if idLower.contains("super-compact") {
            score -= 95
        } else if idLower.contains("compact") {
            score -= 60
        }

        // Known warm human voices (e.g. Petra, Markus, Anna Premium, Daniel Enhanced, Simone)
        if knownHumanNames.contains(baseName) {
            score += 35
        }
        // Petra & Markus Enhanced/Premium are Apple's most natural offline German voices
        if targetBase == "de" && (baseName == "petra" || baseName == "markus" || baseName == "viktor") && candidate.qualityRaw >= 2 {
            score += 35
        }

        return score
    }

    public func activeSystemVoiceDiagnostic(for accentCode: String, settings: VoiceSettings? = nil) -> ActiveVoiceDiagnostic {
        let cfg = settings ?? voiceSettings
        let catalog = Self.systemVoiceCatalog()
        let voices = catalog.voices
        let descriptors = catalog.descriptors
        let targetBase = String(accentCode.prefix(2)).lowercased()
        let hqCount = descriptors.filter {
            $0.language.lowercased().hasPrefix(targetBase) && Self.isHighQualityVoice($0)
        }.count

        let prefId = cfg.preferredSystemVoices[accentCode]
        if let chosenDesc = Self.pickBestCandidate(from: descriptors, targetBcp47: accentCode, preferredIdentifier: prefId),
           let voice = voices.first(where: { $0.identifier == chosenDesc.identifier }) {
            let isHQ = Self.isHighQualityVoice(chosenDesc)
            let idLower = voice.identifier.lowercased()
            let badge: String
            if idLower.contains("gryphon-neural") {
                badge = "Apple Neural Premium (48kHz)"
            } else if idLower.contains("siri.natural") {
                badge = "Apple Siri Neural (48kHz)"
            } else if idLower.contains("premium") || voice.quality == .premium {
                badge = "Apple Premium Offline"
            } else if idLower.contains("enhanced") || voice.quality == .enhanced {
                badge = "Apple Enhanced Offline"
            } else {
                badge = "Compact Fallback (22kHz · Robotic)"
            }
            return ActiveVoiceDiagnostic(
                displayName: Self.friendlyDisplayName(for: voice),
                identifier: voice.identifier,
                locale: voice.language,
                isHighQualityNeural: isHQ,
                qualityBadge: badge,
                highQualityCountForLanguage: hqCount
            )
        }

        return ActiveVoiceDiagnostic(
            displayName: "System Default",
            identifier: "",
            locale: accentCode,
            isHighQualityNeural: false,
            qualityBadge: "Compact Fallback",
            highQualityCountForLanguage: hqCount
        )
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
        let catalog = systemVoiceCatalog()
        return zip(catalog.voices, catalog.descriptors)
            .filter { pair in
                pair.0.language.lowercased().hasPrefix(base) && !isRoboticVoice(pair.1)
            }
            .sorted { lhs, rhs in
                scoreVoice(lhs.1, targetBcp47: target) > scoreVoice(rhs.1, targetBcp47: target)
            }
            .map(\.0)
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

    // MARK: - Multi-Speaker Conversational Dialogue Parser & Casting

    private static let nonSpeakerLabels: Set<String> = [
        "angebot", "hinweis", "achtung", "preis", "uhrzeit", "öffnungszeiten", "datum",
        "note", "warning", "tip", "example", "beispiel", "track", "part", "teil", "fazit",
        "ergebnis", "regel", "summary", "context", "focus", "trap"
    ]

    private static let femaleNameHints: Set<String> = [
        "frau", "anna", "hannah", "lena", "clara", "mia", "sara", "sarah", "emma", "maya",
        "sophie", "julia", "petra", "helena", "nina", "laura", "lisa", "katharina", "elena",
        "priya", "chloe", "rachel", "amira", "moderatorin", "kritikerin", "ärztin", "verkäuferin",
        "rezeptionistin", "studentin", "autorin", "professorin", "novak", "berger", "keller", "meier"
    ]

    private static let maleNameHints: Set<String> = [
        "herr", "lukas", "markus", "viktor", "martin", "yannick", "tobias", "jonas", "max",
        "paul", "david", "tom", "ben", "liam", "leo", "daniel", "oliver", "james", "noah",
        "stefan", "felix", "alex", "moderator", "interviewer", "schaffner", "arzt", "verkäufer",
        "kellner", "becker", "steiner", "lindner", "gruber", "weber", "vance", "tutor", "host", "guest"
    ]

    /// Parses multi-speaker dialogue scripts (both newline-separated and inline `Name: ...` turns).
    /// Returns an empty array if the text is a single-speaker monologue (fewer than 2 speakers).
    public static func parseDialogueTurns(_ text: String) -> [DialogueTurn] {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }

        // Match speaker labels at start of string, after newline, or after sentence punctuation (. ! ? —)
        guard let regex = dialogueTurnRegex else {
            return []
        }

        let nsText = trimmed as NSString
        let matches = regex.matches(in: trimmed, options: [], range: NSRange(location: 0, length: nsText.length))
        guard matches.count >= 2 else { return [] }

        var rawTurns: [(speaker: String, text: String)] = []
        for idx in 0..<matches.count {
            let match = matches[idx]
            let speakerRange = match.range(at: 1)
            guard speakerRange.location != NSNotFound else { continue }
            let speaker = nsText.substring(with: speakerRange).trimmingCharacters(in: .whitespacesAndNewlines)
            if nonSpeakerLabels.contains(speaker.lowercased()) { continue }
            // Avoid matching > 3 words before colon (likely a prose clause, not a speaker label)
            if speaker.split(separator: " ").count > 3 { continue }

            let textStart = match.range.location + match.range.length
            let textEnd = (idx + 1 < matches.count) ? matches[idx + 1].range.location : nsText.length
            guard textEnd > textStart else { continue }
            let spoken = nsText
                .substring(with: NSRange(location: textStart, length: textEnd - textStart))
                .trimmingCharacters(in: .whitespacesAndNewlines)
            guard !spoken.isEmpty else { continue }
            rawTurns.append((speaker: speaker, text: spoken))
        }

        var speakerIndexMap: [String: Int] = [:]
        var turns: [DialogueTurn] = []
        for item in rawTurns {
            let key = item.speaker.lowercased()
            let spIdx: Int
            if let existing = speakerIndexMap[key] {
                spIdx = existing
            } else {
                spIdx = speakerIndexMap.count
                speakerIndexMap[key] = spIdx
            }
            turns.append(DialogueTurn(speaker: item.speaker, text: item.text, speakerIndex: spIdx))
        }

        return speakerIndexMap.count >= 2 ? turns : []
    }

    private static func inferredGender(for speakerName: String) -> AVSpeechSynthesisVoiceGender {
        let tokens = speakerName
            .lowercased()
            .replacingOccurrences(of: ".", with: "")
            .split(whereSeparator: { $0.isWhitespace || $0 == "-" })
            .map(String.init)
        for token in tokens {
            if femaleNameHints.contains(token) { return .female }
            if maleNameHints.contains(token) { return .male }
        }
        return .unspecified
    }

    private static func buildNeuralConversationInstructions(
        accentCode: String,
        speakerName: String,
        speakerIndex: Int,
        slow: Bool
    ) -> String {
        let accentCue = accentOption(for: accentCode)?.neuralHint
            ?? "Speak in natural, idiomatic \(accentCode)."
        let personaTone = speakerIndex % 2 == 0
            ? "Speak spontaneously like a real person in a live face-to-face conversation with warm inflection, natural rhythm, and authentic reactions."
            : "Speak as the conversation partner with a distinct, relaxed, responsive tone, natural everyday cadence, and genuine human warmth."
        let paceCue = slow
            ? "Keep a clear, unhurried learner pace (~0.82x)."
            : "Use natural everyday conversational speed."
        return "\(accentCue) You are \(speakerName). \(personaTone) \(paceCue) Never sound like you are reading a scripted announcement."
    }

    private static func neuralVoiceForDialogueSpeaker(
        cfg: VoiceSettings,
        bcp47: String,
        speakerName: String,
        speakerIndex: Int
    ) -> String {
        let isGerman = bcp47.lowercased().hasPrefix("de")
        let inferred = inferredGender(for: speakerName)
        let primary = cfg.neuralVoice.isEmpty ? cfg.provider.defaultVoice : cfg.neuralVoice

        switch cfg.provider {
        case .openai:
            let femaleVoices = ["coral", "sage", "nova", "shimmer"]
            let maleVoices = ["ash", "echo", "onyx", "fable"]
            if speakerIndex == 0 {
                if inferred == .male && femaleVoices.contains(primary.lowercased()) {
                    return "ash"
                }
                return primary
            }
            if inferred == .male {
                return maleVoices.first(where: { $0 != primary.lowercased() }) ?? "ash"
            }
            if inferred == .female {
                return femaleVoices.first(where: { $0 != primary.lowercased() }) ?? "sage"
            }
            return femaleVoices.contains(primary.lowercased()) ? "ash" : "coral"

        case .elevenlabs:
            let femaleId = "XB0fDUnXU5powFXDhCwa" // Charlotte
            let maleId = "JBFqnCBsd6RMkjVDRZzb"   // George
            if speakerIndex == 0 { return primary }
            if inferred == .male { return primary == maleId ? "onwK4e9ZLuTAKqWW03F9" : maleId }
            if inferred == .female { return primary == femaleId ? "EXAVITQu4vr4xnSDxMaL" : femaleId }
            return primary == maleId ? femaleId : maleId

        case .localOpenAI:
            if isGerman {
                let male = "de_DE-thorsten-high"
                let female = "de_DE-eva_k-x_low"
                if speakerIndex == 0 {
                    return inferred == .female ? female : (inferred == .male ? male : primary)
                }
                return primary == male ? female : male
            } else {
                let female = "bf_emma"
                let male = "bm_george"
                if speakerIndex == 0 { return primary }
                return primary == male ? female : male
            }

        case .system:
            return primary
        }
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

        // Re-instantiate AVSpeechSynthesizer cleanly if previously speaking to avoid
        // macOS neural voice rate/prosody glitches after stopSpeaking(at: .immediate).
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
            synthesizer = AVSpeechSynthesizer()
            synthesizer.delegate = speechDelegate
        }
        speechDelegate.speakerByUtteranceId.removeAll()

        let catalog = Self.systemVoiceCatalog()
        let voices = catalog.voices
        let descriptors = catalog.descriptors
        let prefId = cfg.preferredSystemVoices[bcp47]
        let chosenDesc = Self.pickBestCandidate(from: descriptors, targetBcp47: bcp47, preferredIdentifier: prefId)
        let chosenVoice = chosenDesc.flatMap { d in voices.first { $0.identifier == d.identifier } }
            ?? AVSpeechSynthesisVoice(language: bcp47)

        let isNeuralOrHQ = chosenDesc.map { Self.isHighQualityVoice($0) } ?? false

        // Multi-speaker conversational dialogue playback: strip speaker names and cast distinct voices/personas!
        let dialogueTurns = Self.parseDialogueTurns(text)
        if !dialogueTurns.isEmpty {
            let rankedHumanVoices = Self.humanSystemVoices(for: bcp47)
            let highQualityPool = rankedHumanVoices.filter { v in
                let d = VoiceCandidateDescriptor(identifier: v.identifier, name: v.name, language: v.language, qualityRaw: v.quality.rawValue)
                return Self.isHighQualityVoice(d)
            }
            let castingPool = highQualityPool.count >= 2 ? highQualityPool : (chosenVoice.map { [$0] } ?? rankedHumanVoices)

            var voiceBySpeakerIndex: [Int: AVSpeechSynthesisVoice] = [:]
            var usedVoiceIds = Set<String>()

            for turn in dialogueTurns {
                if voiceBySpeakerIndex[turn.speakerIndex] == nil {
                    let targetGender = Self.inferredGender(for: turn.speaker)
                    let picked: AVSpeechSynthesisVoice? =
                        castingPool.first(where: { !usedVoiceIds.contains($0.identifier) && targetGender != .unspecified && $0.gender == targetGender })
                        ?? castingPool.first(where: { !usedVoiceIds.contains($0.identifier) })
                        ?? chosenVoice
                    if let picked {
                        voiceBySpeakerIndex[turn.speakerIndex] = picked
                        usedVoiceIds.insert(picked.identifier)
                    }
                }
            }

            let distinctVoicesAvailable = Set(voiceBySpeakerIndex.values.map(\.identifier)).count >= 2
            let baseRate: Float = slow ? 0.45 : AVSpeechUtteranceDefaultSpeechRate

            for (idx, turn) in dialogueTurns.enumerated() {
                let speakerVoice = voiceBySpeakerIndex[turn.speakerIndex] ?? chosenVoice
                let utterance = AVSpeechUtterance(string: turn.text)
                utterance.voice = speakerVoice

                if distinctVoicesAvailable {
                    // Two distinct neural/enhanced human voices: keep pure 1.0 pitch & natural cadence!
                    let speakerRateAdj: Float = (turn.speakerIndex % 2 == 0) ? 1.0 : 0.98
                    utterance.rate = (!slow && abs(cfg.rateMultiplier - 1.0) < 0.01 && speakerRateAdj == 1.0)
                        ? AVSpeechUtteranceDefaultSpeechRate
                        : max(AVSpeechUtteranceMinimumSpeechRate, min(AVSpeechUtteranceMaximumSpeechRate, baseRate * Float(cfg.rateMultiplier) * speakerRateAdj))
                    utterance.pitchMultiplier = 1.0
                } else {
                    // Single high-quality voice installed: apply subtle natural conversational vocal distinction
                    // without dropping down to robotic 22kHz compact voices!
                    let gender = Self.inferredGender(for: turn.speaker)
                    let isLowerVoice = (gender == .male) || (gender == .unspecified && turn.speakerIndex % 2 == 1)
                    let pitch: Float = isLowerVoice ? 0.92 : 1.04
                    let paceFactor: Float = isLowerVoice ? 0.96 : 1.02
                    utterance.rate = max(
                        AVSpeechUtteranceMinimumSpeechRate,
                        min(AVSpeechUtteranceMaximumSpeechRate, baseRate * Float(cfg.rateMultiplier) * paceFactor)
                    )
                    utterance.pitchMultiplier = pitch
                }

                utterance.prefersAssistiveTechnologySettings = false
                utterance.preUtteranceDelay = idx == 0 ? 0.03 : 0.14
                utterance.postUtteranceDelay = idx < dialogueTurns.count - 1 ? 0.22 : 0.04
                speechDelegate.speakerByUtteranceId[ObjectIdentifier(utterance)] = turn.speaker
                synthesizer.speak(utterance)
            }

            return chosenVoice
        }

        if isNeuralOrHQ {
            // Neural/Siri/Premium voices produce far more natural human intonation when given
            // the full text in ONE utterance with untouched pitchMultiplier (1.0) and natural rate.
            let utterance = AVSpeechUtterance(string: text)
            utterance.voice = chosenVoice
            let baseRate: Float = slow ? 0.45 : AVSpeechUtteranceDefaultSpeechRate
            if !slow && abs(cfg.rateMultiplier - 1.0) < 0.01 {
                utterance.rate = AVSpeechUtteranceDefaultSpeechRate
            } else {
                utterance.rate = max(
                    AVSpeechUtteranceMinimumSpeechRate,
                    min(AVSpeechUtteranceMaximumSpeechRate, baseRate * Float(cfg.rateMultiplier))
                )
            }
            utterance.pitchMultiplier = 1.0
            utterance.prefersAssistiveTechnologySettings = false
            speechDelegate.speakerByUtteranceId[ObjectIdentifier(utterance)] = ""
            synthesizer.speak(utterance)
        } else {
            // Compact fallback voices benefit from gentle phrase pacing
            let baseRate: Float = slow ? 0.41 : 0.49
            let scaledRate = max(
                AVSpeechUtteranceMinimumSpeechRate,
                min(AVSpeechUtteranceMaximumSpeechRate, baseRate * Float(cfg.rateMultiplier))
            )
            let phrases = Self.splitIntoNaturalPhrases(text)
            for (idx, phrase) in phrases.enumerated() {
                let utterance = AVSpeechUtterance(string: phrase)
                utterance.voice = chosenVoice
                utterance.rate = scaledRate
                utterance.pitchMultiplier = 1.0
                utterance.prefersAssistiveTechnologySettings = false
                utterance.preUtteranceDelay = idx == 0 ? 0.02 : 0.04
                utterance.postUtteranceDelay = idx < phrases.count - 1 ? 0.12 : 0.04
                speechDelegate.speakerByUtteranceId[ObjectIdentifier(utterance)] = ""
                synthesizer.speak(utterance)
            }
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
        let dialogueTurns = Self.parseDialogueTurns(text)
        if !dialogueTurns.isEmpty {
            return await speakDialogueWithNeuralProvider(turns: dialogueTurns, bcp47: bcp47, slow: slow, cfg: cfg)
        }
        return await fetchAndPlaySingleNeuralSegment(
            text: text,
            bcp47: bcp47,
            slow: slow,
            cfg: cfg,
            voiceOverride: nil,
            instructionsOverride: nil,
            speakerLabel: nil,
            fallbackFullText: text
        )
    }

    private func speakDialogueWithNeuralProvider(
        turns: [DialogueTurn],
        bcp47: String,
        slow: Bool,
        cfg: VoiceSettings
    ) async -> (ok: Bool, summary: String) {
        await MainActor.run {
            self.isLoadingNeuralAudio = true
            self.lastVoiceNotice = nil
        }

        defer {
            Task { @MainActor in
                self.isLoadingNeuralAudio = false
                self.activeSpeakerName = nil
                self.currentlySpeakingText = nil
            }
        }

        do {
            // Fetch all turns (reusing cache for repeated plays!) so playback flows with zero mid-conversation stutter
            var turnAudios: [(turn: DialogueTurn, data: Data)] = []
            for turn in turns {
                if Task.isCancelled { return (false, "Cancelled") }
                let voiceId = Self.neuralVoiceForDialogueSpeaker(
                    cfg: cfg,
                    bcp47: bcp47,
                    speakerName: turn.speaker,
                    speakerIndex: turn.speakerIndex
                )
                let instructions = Self.buildNeuralConversationInstructions(
                    accentCode: bcp47,
                    speakerName: turn.speaker,
                    speakerIndex: turn.speakerIndex,
                    slow: slow
                )
                let data = try await fetchNeuralAudioData(
                    text: turn.text,
                    bcp47: bcp47,
                    slow: slow,
                    cfg: cfg,
                    voiceOverride: voiceId,
                    instructionsOverride: instructions
                )
                turnAudios.append((turn: turn, data: data))
            }

            await MainActor.run { self.isLoadingNeuralAudio = false }

            for (idx, item) in turnAudios.enumerated() {
                if Task.isCancelled { return (false, "Cancelled") }
                await MainActor.run { self.activeSpeakerName = item.turn.speaker }
                let duration = try await MainActor.run { try self.playAudioData(item.data) }
                let waitNs = UInt64(max(0.25, duration + (idx < turnAudios.count - 1 ? 0.24 : 0.05)) * 1_000_000_000)
                try await Task.sleep(nanoseconds: waitNs)
            }
            return (true, "\(cfg.provider.shortLabel) · Multi-Speaker Dialogue (\(bcp47))")
        } catch {
            if Task.isCancelled { return (false, "Cancelled") }
            let notice = "Neural dialogue unavailable (\(error.localizedDescription)) — fell back to on-device multi-speaker voice."
            let fullReconstructed = turns.map { "\($0.speaker): \($0.text)" }.joined(separator: "\n")
            await MainActor.run {
                self.lastVoiceNotice = notice
                _ = self.speakWithSystemVoice(text: fullReconstructed, bcp47: bcp47, slow: slow, cfg: cfg)
            }
            return (false, notice)
        }
    }

    private func fetchNeuralAudioData(
        text: String,
        bcp47: String,
        slow: Bool,
        cfg: VoiceSettings,
        voiceOverride: String?,
        instructionsOverride: String?
    ) async throws -> Data {
        let effectiveVoice = voiceOverride ?? (cfg.neuralVoice.isEmpty ? cfg.provider.defaultVoice : cfg.neuralVoice)
        let cacheKey = "\(cfg.provider.rawValue)|\(cfg.model)|\(effectiveVoice)|\(bcp47)|\(cfg.speakingStyle.rawValue)|\(cfg.rateMultiplier)|\(slow)|\(instructionsOverride ?? "")|\(text)"
        if let cached = neuralCache[cacheKey] {
            return cached
        }

        let apiKey = effectiveAPIKey(for: cfg)
        let speed = max(0.65, min(1.3, (slow ? 0.80 : 0.98) * cfg.rateMultiplier))
        var request: URLRequest

        if cfg.provider == .elevenlabs {
            let base = cfg.endpoint.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
            let voiceId = effectiveVoice.isEmpty ? Self.elevenLabsNeuralVoices[0].id : effectiveVoice
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
                    "stability": 0.45,
                    "similarity_boost": 0.78,
                    "style": 0.35,
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
            var body: [String: Any] = [
                "model": model,
                "input": text,
                "voice": effectiveVoice,
                "response_format": "mp3",
                "speed": speed
            ]
            if cfg.provider == .openai && model.lowercased().contains("gpt-4o-mini-tts") {
                body["instructions"] = instructionsOverride ?? Self.buildNeuralInstructions(
                    accentCode: bcp47,
                    style: cfg.speakingStyle,
                    slow: slow
                )
            }
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        request.timeoutInterval = 25
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode), !data.isEmpty else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw NSError(domain: "LinguaVerveTTS", code: code, userInfo: [NSLocalizedDescriptionKey: "HTTP \(code)"])
        }
        storeInCache(key: cacheKey, data: data)
        return data
    }

    private func fetchAndPlaySingleNeuralSegment(
        text: String,
        bcp47: String,
        slow: Bool,
        cfg: VoiceSettings,
        voiceOverride: String?,
        instructionsOverride: String?,
        speakerLabel: String?,
        fallbackFullText: String
    ) async -> (ok: Bool, summary: String) {
        await MainActor.run {
            self.isLoadingNeuralAudio = true
            self.lastVoiceNotice = nil
            self.activeSpeakerName = speakerLabel
        }

        defer {
            Task { @MainActor in
                self.isLoadingNeuralAudio = false
            }
        }

        do {
            let data = try await fetchNeuralAudioData(
                text: text,
                bcp47: bcp47,
                slow: slow,
                cfg: cfg,
                voiceOverride: voiceOverride,
                instructionsOverride: instructionsOverride
            )
            if Task.isCancelled { return (false, "Cancelled") }
            _ = try await MainActor.run {
                try self.playAudioData(data)
            }
            return (true, "\(cfg.provider.shortLabel) · \(voiceOverride ?? cfg.neuralVoice) (\(bcp47))")
        } catch {
            if Task.isCancelled { return (false, "Cancelled") }
            let notice = "Neural TTS unavailable (\(error.localizedDescription)) — fell back to on-device Siri/Neural voice."
            await MainActor.run {
                self.lastVoiceNotice = notice
                _ = self.speakWithSystemVoice(text: fallbackFullText, bcp47: bcp47, slow: slow, cfg: cfg)
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
    @discardableResult
    private func playAudioData(_ data: Data) throws -> TimeInterval {
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
        return player.duration
    }
}
