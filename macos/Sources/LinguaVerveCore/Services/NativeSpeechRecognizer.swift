import Foundation
import AVFoundation
import Observation
#if canImport(Speech)
import Speech
#endif

/// Cross-platform native Apple Speech Recognition wrapper (macOS, iPadOS, iOS)
/// enabling live microphone voice capture for Speaking exams & AI roleplays.
@Observable
public final class NativeSpeechRecognizer {
    public var isRecording: Bool = false
    public var transcript: String = ""
    public var statusMessage: String?

    #if canImport(Speech)
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    #endif

    public init() {}

    public func stop() {
        #if canImport(Speech)
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        audioEngine = nil
        recognitionRequest = nil
        recognitionTask = nil
        #endif
        isRecording = false
    }

    @MainActor
    public func start(languageId: String, existingText: String = "") {
        stop()
        statusMessage = nil

        #if canImport(Speech)
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            Task { @MainActor in
                guard let self else { return }
                guard authStatus == .authorized else {
                    self.statusMessage = "Speech recognition permission not granted. You can type your spoken answer manually below."
                    return
                }
                self.beginSession(languageId: languageId, existingText: existingText)
            }
        }
        #else
        statusMessage = "Live speech recognition is unavailable on this platform. Type your spoken answer below."
        #endif
    }

    #if canImport(Speech)
    @MainActor
    private func beginSession(languageId: String, existingText: String) {
        let localeId = NativeAudioEngine.bcp47LanguageCode(for: languageId)
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeId)),
              recognizer.isAvailable else {
            statusMessage = "Speech recognizer for \(localeId) is temporarily unavailable. Type your spoken response below."
            return
        }

        do {
            #if os(iOS)
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .defaultToSpeaker])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
            #endif

            let engine = AVAudioEngine()
            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true

            let inputNode = engine.inputNode
            let format = inputNode.outputFormat(forBus: 0)
            guard format.channelCount > 0 else {
                statusMessage = "No microphone input available (e.g. Simulator). Type your spoken response below."
                return
            }

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                request.append(buffer)
            }

            engine.prepare()
            try engine.start()

            self.audioEngine = engine
            self.recognitionRequest = request
            self.isRecording = true

            let prefix = existingText.trimmingCharacters(in: .whitespacesAndNewlines)

            self.recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
                Task { @MainActor in
                    guard let self else { return }
                    if let result {
                        let spoken = result.bestTranscription.formattedString
                        self.transcript = prefix.isEmpty ? spoken : "\(prefix) \(spoken)"
                    }
                    if error != nil || (result?.isFinal ?? false) {
                        self.stop()
                    }
                }
            }
        } catch {
            statusMessage = "Microphone unavailable (\(error.localizedDescription)). Type your spoken answer below."
            stop()
        }
    }
    #endif
}
