import Foundation
import AVFoundation
import Observation

#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
import AudioToolbox
#endif

@Observable
public final class NativeAudioEngine {
    public static let shared = NativeAudioEngine()

    private let synthesizer = AVSpeechSynthesizer()
    public var isMuted: Bool = false
    public var slowPace: Bool = false
    public var currentlySpeakingText: String?

    public init() {}

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

    public func speak(_ text: String, languageId: String = "english", slow: Bool? = nil) {
        guard !isMuted else { return }
        let useSlow = slow ?? slowPace

        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? session.setActive(true)
        #endif

        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = useSlow ? 0.38 : 0.48
        utterance.pitchMultiplier = 1.0

        let bcp47 = Self.bcp47LanguageCode(for: languageId)
        if let voice = Self.bestVoice(for: bcp47) {
            utterance.voice = voice
        } else {
            utterance.voice = AVSpeechSynthesisVoice(language: bcp47)
        }

        currentlySpeakingText = text
        synthesizer.speak(utterance)
    }

    public func stopSpeech() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        currentlySpeakingText = nil
    }

    public static func bcp47LanguageCode(for languageId: String) -> String {
        switch languageId.lowercased() {
        case "german", "de": return "de-DE"
        case "spanish", "es": return "es-ES"
        case "french", "fr": return "fr-FR"
        case "japanese", "ja": return "ja-JP"
        default: return "en-US"
        }
    }

    private static func bestVoice(for bcp47: String) -> AVSpeechSynthesisVoice? {
        let prefix = String(bcp47.prefix(2))
        let voices = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix(prefix) }
        return voices.sorted { $0.quality.rawValue > $1.quality.rawValue }.first
    }
}
