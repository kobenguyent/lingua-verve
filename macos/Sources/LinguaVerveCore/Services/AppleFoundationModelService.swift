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
    case missingSDKInBuild(String)
    case unavailable(String)
    case emptyPrompt

    public var errorDescription: String? {
        switch self {
        case .unsupportedOS:
            return "Apple Foundation Model requires macOS 26+, iPadOS 26+, or iOS 26+ with Apple Intelligence."
        case .missingSDKInBuild(let osLabel):
            return "Your system (\(osLabel)) supports Apple Intelligence, but this app build was compiled with an older pre-26 SDK without FoundationModels.framework. Update to a macOS 26+ SDK build or rebuild locally with Xcode 26+."
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

    /// Indicates whether this app binary was compiled with an SDK that includes Apple's FoundationModels.framework (Xcode 26+ / macOS 26+ SDK).
    public static var isCompiledWithFoundationModels: Bool {
        #if canImport(FoundationModels)
        return true
        #else
        return false
        #endif
    }

    public static func currentOSLabel(version: OperatingSystemVersion = ProcessInfo.processInfo.operatingSystemVersion) -> String {
        #if os(macOS)
        let platform = "macOS"
        #elseif os(iOS)
        let platform = "iOS/iPadOS"
        #else
        let platform = "Apple OS"
        #endif
        return "\(platform) \(version.majorVersion).\(version.minorVersion).\(version.patchVersion)"
    }

    /// Distinguishes an older runtime OS (< 26) from a newer OS (26/27+) running a binary compiled against an older SDK (e.g. macOS 15 / Xcode 16).
    public static func fallbackAvailability(
        osVersion: OperatingSystemVersion,
        compiledWithFoundationModels: Bool
    ) -> AppleFoundationAvailability {
        let osLabel = currentOSLabel(version: osVersion)
        if !compiledWithFoundationModels && osVersion.majorVersion >= 26 {
            return AppleFoundationAvailability(
                isAvailable: false,
                statusTitle: "App Build Missing macOS 26+ SDK",
                detail: "Detected \(osLabel), which supports Apple Intelligence, but this copy of LinguaVerve was built with an older pre-26 SDK without FoundationModels.framework. Install a macOS 26+ SDK release or rebuild locally with Xcode 26+."
            )
        }
        return AppleFoundationAvailability(
            isAvailable: false,
            statusTitle: "Requires macOS 26 / iOS 26+",
            detail: "Detected \(osLabel). Upgrade to macOS 26+, iPadOS 26+, or iOS 26+ for built-in Apple Foundation Models, or use Ollama / Cloud AI."
        )
    }

    public func availability() -> AppleFoundationAvailability {
        let osVersion = ProcessInfo.processInfo.operatingSystemVersion
        let osLabel = Self.currentOSLabel(version: osVersion)

        #if canImport(FoundationModels)
        if #available(macOS 26.0, iOS 26.0, *) {
            switch SystemLanguageModel.default.availability {
            case .available:
                return AppleFoundationAvailability(
                    isAvailable: true,
                    statusTitle: "Ready On-Device",
                    detail: "Apple Intelligence SystemLanguageModel is available locally on \(osLabel) — zero API key, 100% private & offline."
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
                        detail: "Detected \(osLabel). Turn on Apple Intelligence in System Settings → Apple Intelligence & Siri, then click Refresh Status."
                    )
                case .modelNotReady:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Model Preparing",
                        detail: "Detected \(osLabel). Apple Intelligence is still downloading or preparing on-device model assets (check System Settings → Apple Intelligence & Siri), then click Refresh Status."
                    )
                @unknown default:
                    return AppleFoundationAvailability(
                        isAvailable: false,
                        statusTitle: "Temporarily Unavailable",
                        detail: "On-device Apple Foundation Model is currently unavailable on \(osLabel)."
                    )
                }
            }
        }
        #endif

        return Self.fallbackAvailability(
            osVersion: osVersion,
            compiledWithFoundationModels: Self.isCompiledWithFoundationModels
        )
    }

    public func respond(messages: [AIChatMessage], temperature: Double) async throws -> String {
        let osVersion = ProcessInfo.processInfo.operatingSystemVersion

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

        if !Self.isCompiledWithFoundationModels && osVersion.majorVersion >= 26 {
            throw AppleFoundationError.missingSDKInBuild(Self.currentOSLabel(version: osVersion))
        }
        throw AppleFoundationError.unsupportedOS
    }
}
