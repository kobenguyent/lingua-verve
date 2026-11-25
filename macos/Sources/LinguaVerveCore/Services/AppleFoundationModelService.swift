import Foundation

#if canImport(FoundationModels)
import FoundationModels
#endif

public struct AppleFoundationAvailability: Equatable, Sendable {
    public let isAvailable: Bool
    public let statusTitle: String
    public let detail: String

    public init(isAvailable: Bool, statusTitle: String, detail: String) {
        self.isAvailable = isAvailable
        self.statusTitle = statusTitle
        self.detail = detail
    }
}

public enum AppleFoundationError: LocalizedError, Sendable {
    case unsupportedOS
    case unavailable(String)
    case emptyPrompt

    public var errorDescription: String? {
        switch self {
        case .unsupportedOS:
            return "Apple Foundation Model requires macOS 26+, iPadOS 26+, or iOS 26+ with Apple Intelligence."
        case .unavailable(let reason):
            return reason
        case .emptyPrompt:
            return "No user prompt was provided to the Apple Foundation Model."
        }
    }
}

public protocol AppleFoundationModelBackend: Sendable {
    func availability() -> AppleFoundationAvailability
    func respond(messages: [AIChatMessage], temperature: Double) async throws -> String
}

/// Live on-device Apple Intelligence FoundationModels.framework backend
/// supporting MacBook (macOS 26+), iPad (iPadOS 26+), and iPhone (iOS 26+).
public struct LiveAppleFoundationModelBackend: AppleFoundationModelBackend, Sendable {
    public init() {}

    public func availability() -> AppleFoundationAvailability {
        #if canImport(FoundationModels)
        if #available(macOS 26.0, iOS 26.0, *) {
            switch SystemLanguageModel.default.availability {
            case .available:
                return AppleFoundationAvailability(
                    isAvailable: true,
                    statusTitle: "Ready On-Device",
                    detail: "Apple Intelligence SystemLanguageModel is available locally — zero API key, 100% private & offline."
                )
            case .unavailable(let reason):
                switch reason {
                case .deviceNotEligible:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Device Not Eligible",
                        detail: "This hardware does not support on-device Apple Intelligence. Use Ollama, LM Studio, or a Cloud AI provider instead."
                    )
                case .appleIntelligenceNotEnabled:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Apple Intelligence Disabled",
                        detail: "Turn on Apple Intelligence in System Settings → Apple Intelligence & Siri to enable on-device coaching."
                    )
                case .modelNotReady:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Model Preparing",
                        detail: "Apple Intelligence is downloading or preparing on-device model assets. Please retry in a moment."
                    )
                @unknown default:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Temporarily Unavailable",
                        detail: "On-device Apple Foundation Model is currently unavailable."
                    )
                }
            }
        }
        #endif
        return AppleFoundationAvailability(
            isAvailable: false,
            statusTitle: "Requires macOS 26 / iOS 26+",
            detail: "Upgrade to macOS 26, iPadOS 26, or iOS 26 for built-in Apple Foundation Models, or use Ollama / Cloud AI."
        )
    }

    public func respond(messages: [AIChatMessage], temperature: Double) async throws -> String {
        #if canImport(FoundationModels)
        if #available(macOS 26.0, iOS 26.0, *) {
            let status = availability()
            guard status.isAvailable else {
                throw AppleFoundationError.unavailable(status.detail)
            }

            let systemInstructions = messages
                .filter { $0.role == "system" }
                .map(\.content)
                .joined(separator: "\n")

            let nonSystem = messages.filter { $0.role != "system" }
            guard !nonSystem.isEmpty else {
                throw AppleFoundationError.emptyPrompt
            }

            let prompt: String
            if nonSystem.count == 1 {
                prompt = nonSystem[0].content
            } else {
                let historyLines = nonSystem.dropLast().map { msg in
                    "\(msg.role == "assistant" ? "Coach" : "Learner"): \(msg.content)"
                }.joined(separator: "\n")
                let latest = nonSystem.last?.content ?? ""
                prompt = """
                Recent conversation:
                \(historyLines)

                Latest learner message:
                \(latest)
                """
            }

            let session = LanguageModelSession(
                model: SystemLanguageModel.default,
                instructions: systemInstructions.isEmpty ? nil : systemInstructions
            )

            let options = GenerationOptions(temperature: max(0.0, min(1.0, temperature)))
            let response = try await session.respond(to: prompt, options: options)
            let output = response.content.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !output.isEmpty else {
                throw AIClientError.emptyResponse
            }
            return output
        }
        #endif
        throw AppleFoundationError.unsupportedOS
    }
}
