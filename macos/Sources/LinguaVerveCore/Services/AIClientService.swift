import Foundation

public enum AIClientError: LocalizedError, Sendable {
    case invalidURL(String)
    case missingAPIKey(String)
    case httpStatus(Int, String)
    case emptyResponse

    public var errorDescription: String? {
        switch self {
        case .invalidURL(let url):
            return "Invalid AI endpoint URL: \(url)"
        case .missingAPIKey(let provider):
            return "\(provider) requires an API key."
        case .httpStatus(let code, let detail):
            return "AI provider returned HTTP \(code): \(detail)"
        case .emptyResponse:
            return "AI provider returned an empty response."
        }
    }
}

public protocol AIHTTPTransport: Sendable {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

extension URLSession: AIHTTPTransport {}

/// Native Swift multi-provider AI client supporting On-Device Apple Intelligence Foundation Models,
/// Local (Ollama, LM Studio, LAN Mac), and Cloud (OpenAI, Google Gemini, OpenRouter, Custom) APIs,
/// plus a built-in offline CEFR rubric evaluator fallback.
public struct AIClientService: Sendable {
    private let transport: any AIHTTPTransport
    private let appleBackend: any AppleFoundationModelBackend

    public init(
        transport: any AIHTTPTransport = URLSession.shared,
        appleBackend: any AppleFoundationModelBackend = LiveAppleFoundationModelBackend()
    ) {
        self.transport = transport
        self.appleBackend = appleBackend
    }

    public func appleFoundationAvailability() -> AppleFoundationAvailability {
        appleBackend.availability()
    }

    /// Derives candidate model-listing URLs for any supported AI provider.
    public static func resolveModelsEndpoints(
        provider: AIProviderType,
        endpoint: String,
        apiKey: String = ""
    ) -> [URL] {
        var trimmed = endpoint.trimmingCharacters(in: .whitespacesAndNewlines)
        while trimmed.hasSuffix("/") {
            trimmed.removeLast()
        }
        guard !trimmed.isEmpty else { return [] }

        if provider == .gemini {
            var base = trimmed
            if let range = base.range(of: ":generateContent", options: .caseInsensitive) {
                base = String(base[..<range.lowerBound])
            }
            if !base.lowercased().hasSuffix("/models") {
                if let modelsIdx = base.range(of: "/models/", options: .caseInsensitive) {
                    base = String(base[..<modelsIdx.lowerBound]) + "/models"
                } else {
                    base += "/models"
                }
            }
            let sep = base.contains("?") ? "&" : "?"
            let trimmedKey = apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
            let encodedKey = trimmedKey.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? trimmedKey
            let keySegment = trimmedKey.isEmpty ? "" : "key=\(encodedKey)&"
            if let url = URL(string: "\(base)\(sep)\(keySegment)pageSize=100") {
                return [url]
            }
            return []
        }

        let primaryString: String
        if trimmed.lowercased().hasSuffix("/chat/completions") {
            primaryString = String(trimmed.dropLast("/chat/completions".count)) + "/models"
        } else if trimmed.lowercased().hasSuffix("/completions") {
            primaryString = String(trimmed.dropLast("/completions".count)) + "/models"
        } else if trimmed.lowercased().hasSuffix("/api/chat") {
            primaryString = String(trimmed.dropLast("/api/chat".count)) + "/api/tags"
        } else if trimmed.lowercased().hasSuffix("/models") || trimmed.lowercased().hasSuffix("/api/tags") {
            primaryString = trimmed
        } else {
            primaryString = "\(trimmed)/models"
        }

        var urls: [URL] = []
        if let primaryURL = URL(string: primaryString) {
            urls.append(primaryURL)
        }

        if provider == .ollama,
           let parsed = URL(string: trimmed),
           let scheme = parsed.scheme,
           let host = parsed.host {
            let portPart = parsed.port.map { ":\($0)" } ?? ""
            if let tagsURL = URL(string: "\(scheme)://\(host)\(portPart)/api/tags"),
               !urls.contains(tagsURL) {
                urls.append(tagsURL)
            }
        }

        return urls
    }

    private static func isLikelyOpenAINonChatModel(_ id: String) -> Bool {
        let lower = id.lowercased()
        let excludedPrefixes = ["whisper", "tts-", "dall-e", "gpt-image", "babbage", "davinci", "text-"]
        if excludedPrefixes.contains(where: { lower.hasPrefix($0) }) { return true }
        let excludedContains = ["embedding", "moderation", "transcribe", "realtime", "audio-preview"]
        return excludedContains.contains(where: { lower.contains($0) })
    }

    private static func parseModelsPayload(provider: AIProviderType, data: Data) -> [AIModelInfo] {
        var rawModels: [AIModelInfo] = []

        if provider == .gemini {
            struct GeminiModelsList: Decodable {
                struct Item: Decodable {
                    let name: String?
                    let displayName: String?
                    let supportedGenerationMethods: [String]?
                    let inputTokenLimit: Int?
                }
                let models: [Item]?
            }
            if let decoded = try? JSONDecoder().decode(GeminiModelsList.self, from: data),
               let items = decoded.models {
                for item in items {
                    guard let rawName = item.name?.trimmingCharacters(in: .whitespacesAndNewlines),
                          !rawName.isEmpty else { continue }
                    if let methods = item.supportedGenerationMethods,
                       !methods.isEmpty,
                       !methods.contains("generateContent") {
                        continue
                    }
                    let id = rawName.hasPrefix("models/") ? String(rawName.dropFirst("models/".count)) : rawName
                    if id.lowercased().contains("embedding") { continue }
                    let display = item.displayName?.trimmingCharacters(in: .whitespacesAndNewlines)
                    rawModels.append(
                        AIModelInfo(
                            id: id,
                            displayName: (display != nil && display != id) ? display : nil,
                            ownedBy: "google",
                            contextLength: item.inputTokenLimit
                        )
                    )
                }
            }
        } else {
            struct OpenAIModelsList: Decodable {
                struct Item: Decodable {
                    let id: String?
                    let name: String?
                    let owned_by: String?
                    let context_length: Int?
                }
                let data: [Item]?
            }

            struct OllamaTagsList: Decodable {
                struct Details: Decodable {
                    let parameter_size: String?
                    let family: String?
                }
                struct Item: Decodable {
                    let name: String?
                    let model: String?
                    let details: Details?
                }
                let models: [Item]?
            }

            if let openAI = try? JSONDecoder().decode(OpenAIModelsList.self, from: data),
               let items = openAI.data, !items.isEmpty {
                for item in items {
                    let id = (item.id ?? item.name ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !id.isEmpty else { continue }
                    let display = item.name?.trimmingCharacters(in: .whitespacesAndNewlines)
                    rawModels.append(
                        AIModelInfo(
                            id: id,
                            displayName: (display != nil && display != id) ? display : nil,
                            ownedBy: item.owned_by,
                            contextLength: item.context_length
                        )
                    )
                }
            } else if let ollama = try? JSONDecoder().decode(OllamaTagsList.self, from: data),
                      let items = ollama.models, !items.isEmpty {
                for item in items {
                    let id = (item.name ?? item.model ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !id.isEmpty else { continue }
                    let param = item.details?.parameter_size?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
                    rawModels.append(
                        AIModelInfo(
                            id: id,
                            displayName: param.isEmpty ? nil : "\(id) (\(param))",
                            ownedBy: item.details?.family ?? "ollama"
                        )
                    )
                }
            }
        }

        // Deduplicate while preserving order
        var seen = Set<String>()
        var deduped = rawModels.filter { seen.insert($0.id).inserted }

        if provider == .openai {
            let chatOnly = deduped.filter { !isLikelyOpenAINonChatModel($0.id) }
            if !chatOnly.isEmpty {
                deduped = chatOnly
            }
            deduped.sort { a, b in
                func rank(_ id: String) -> Int {
                    let l = id.lowercased()
                    if l.hasPrefix("gpt-5") || l.hasPrefix("gpt-4.1") || l.hasPrefix("gpt-4o") { return 0 }
                    if l.hasPrefix("o1") || l.hasPrefix("o3") || l.hasPrefix("o4") { return 1 }
                    if l.hasPrefix("gpt-") { return 2 }
                    return 3
                }
                let ra = rank(a.id), rb = rank(b.id)
                return ra != rb ? ra < rb : a.id < b.id
            }
        } else if provider == .gemini {
            deduped.sort { a, b in
                func rank(_ id: String) -> Int {
                    if id.contains("2.5") { return 0 }
                    if id.contains("2.0") { return 1 }
                    if id.contains("1.5") { return 2 }
                    return 3
                }
                let ra = rank(a.id), rb = rank(b.id)
                return ra != rb ? ra < rb : a.id < b.id
            }
        }

        return deduped
    }

    /// Fetches live available models from On-Device Apple Intelligence, Local (Ollama/LM Studio),
    /// or Cloud (OpenAI, Google Gemini, OpenRouter, Custom OpenAI-compatible) providers.
    public func fetchAvailableModels(config: AIProviderConfig) async throws -> [AIModelInfo] {
        if config.provider == .appleFoundation {
            let status = appleBackend.availability()
            guard status.isAvailable else {
                throw AppleFoundationError.unavailable(status.detail)
            }
            return [
                AIModelInfo(
                    id: AIProviderType.appleFoundation.defaultModel,
                    displayName: "SystemLanguageModel.default (On-Device)",
                    ownedBy: "Apple Intelligence"
                )
            ]
        }

        let trimmedEndpoint = config.endpoint.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedEndpoint.isEmpty else {
            throw AIClientError.invalidURL(trimmedEndpoint)
        }
        let trimmedKey = config.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        if config.provider.requiresAPIKeyForModelList && trimmedKey.isEmpty {
            throw AIClientError.missingAPIKey(config.provider.label)
        }

        let candidateURLs = Self.resolveModelsEndpoints(
            provider: config.provider,
            endpoint: trimmedEndpoint,
            apiKey: trimmedKey
        )
        guard !candidateURLs.isEmpty else {
            throw AIClientError.invalidURL(trimmedEndpoint)
        }

        var lastError: Error?

        for url in candidateURLs {
            do {
                var request = URLRequest(url: url)
                request.httpMethod = "GET"
                request.timeoutInterval = 20
                request.setValue("application/json", forHTTPHeaderField: "Accept")
                if config.provider != .gemini && !trimmedKey.isEmpty {
                    request.setValue("Bearer \(trimmedKey)", forHTTPHeaderField: "Authorization")
                }
                if config.provider == .openrouter {
                    request.setValue("LinguaVerve Native", forHTTPHeaderField: "X-Title")
                }

                let (data, response) = try await transport.data(for: request)
                guard let http = response as? HTTPURLResponse else {
                    lastError = AIClientError.emptyResponse
                    continue
                }
                guard (200..<300).contains(http.statusCode) else {
                    let preview = String(data: data, encoding: .utf8)?.prefix(160) ?? ""
                    lastError = AIClientError.httpStatus(http.statusCode, String(preview))
                    continue
                }

                let models = Self.parseModelsPayload(provider: config.provider, data: data)
                if !models.isEmpty {
                    return models
                }
                lastError = AIClientError.emptyResponse
            } catch {
                lastError = error
            }
        }

        throw lastError ?? AIClientError.emptyResponse
    }

    public func chat(config: AIProviderConfig, messages: [AIChatMessage]) async throws -> String {
        if config.provider == .appleFoundation {
            return try await appleBackend.respond(messages: messages, temperature: config.temperature)
        }

        let trimmedEndpoint = config.endpoint.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedEndpoint.isEmpty else {
            throw AIClientError.invalidURL(trimmedEndpoint)
        }
        let trimmedKey = config.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        if config.provider.requiresAPIKey && trimmedKey.isEmpty {
            throw AIClientError.missingAPIKey(config.provider.label)
        }

        if config.provider == .gemini {
            return try await callGemini(config: config, endpoint: trimmedEndpoint, apiKey: trimmedKey, messages: messages)
        }
        return try await callOpenAICompatible(config: config, endpoint: trimmedEndpoint, apiKey: trimmedKey, messages: messages)
    }

    private func callGemini(
        config: AIProviderConfig,
        endpoint: String,
        apiKey: String,
        messages: [AIChatMessage]
    ) async throws -> String {
        let base = endpoint.hasSuffix("/") ? String(endpoint.dropLast()) : endpoint
        let encodedModel = config.model.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? config.model
        let encodedKey = apiKey.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? apiKey
        guard let url = URL(string: "\(base)/\(encodedModel):generateContent?key=\(encodedKey)") else {
            throw AIClientError.invalidURL(base)
        }

        var body: [String: Any] = [
            "generationConfig": ["temperature": config.temperature]
        ]

        if let systemPrompt = messages.first(where: { $0.role == "system" })?.content {
            body["systemInstruction"] = ["parts": [["text": systemPrompt]]]
        }

        let contents: [[String: Any]] = messages
            .filter { $0.role != "system" }
            .map { msg in
                [
                    "role": msg.role == "assistant" ? "model" : "user",
                    "parts": [["text": msg.content]]
                ]
            }
        body["contents"] = contents

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 90
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await transport.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw AIClientError.emptyResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            let preview = String(data: data, encoding: .utf8)?.prefix(180) ?? ""
            throw AIClientError.httpStatus(http.statusCode, String(preview))
        }

        struct GeminiResponse: Decodable {
            struct Candidate: Decodable {
                struct Content: Decodable {
                    struct Part: Decodable { let text: String? }
                    let parts: [Part]?
                }
                let content: Content?
            }
            let candidates: [Candidate]?
        }

        let decoded = try JSONDecoder().decode(GeminiResponse.self, from: data)
        let text = decoded.candidates?.first?.content?.parts?.compactMap(\.text).joined() ?? ""
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw AIClientError.emptyResponse }
        return trimmed
    }

    private func callOpenAICompatible(
        config: AIProviderConfig,
        endpoint: String,
        apiKey: String,
        messages: [AIChatMessage]
    ) async throws -> String {
        guard let url = URL(string: endpoint) else {
            throw AIClientError.invalidURL(endpoint)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 90
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if !apiKey.isEmpty {
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        }
        if config.provider == .openrouter {
            request.setValue("LinguaVerve Native", forHTTPHeaderField: "X-Title")
        }

        let payload: [String: Any] = [
            "model": config.model.trimmingCharacters(in: .whitespacesAndNewlines),
            "temperature": config.temperature,
            "messages": messages.map { ["role": $0.role, "content": $0.content] }
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await transport.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw AIClientError.emptyResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            let preview = String(data: data, encoding: .utf8)?.prefix(180) ?? ""
            throw AIClientError.httpStatus(http.statusCode, String(preview))
        }

        struct OpenAIResponse: Decodable {
            struct Choice: Decodable {
                struct Message: Decodable { let content: String? }
                let message: Message?
            }
            struct DirectMessage: Decodable { let content: String? }
            let choices: [Choice]?
            let message: DirectMessage?
        }

        let decoded = try JSONDecoder().decode(OpenAIResponse.self, from: data)
        let text = decoded.choices?.first?.message?.content ?? decoded.message?.content ?? ""
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw AIClientError.emptyResponse }
        return trimmed
    }

    public func testConnection(config: AIProviderConfig) async -> (ok: Bool, latencyMs: Int, message: String) {
        let start = Date()
        do {
            let reply = try await chat(
                config: config,
                messages: [
                    AIChatMessage(role: "system", content: "You are a concise connection check assistant."),
                    AIChatMessage(role: "user", content: "Reply with: LinguaVerve Native AI ready.")
                ]
            )
            let ms = max(1, Int(Date().timeIntervalSince(start) * 1000))
            return (true, ms, reply)
        } catch {
            let ms = max(1, Int(Date().timeIntervalSince(start) * 1000))
            return (false, ms, error.localizedDescription)
        }
    }

    public static func buildCoachSystemPrompt(languageId: String, level: CEFRLevel, skill: SkillType) -> String {
        let langName = languageId == "german" ? "German" : "English"
        let examBoard = languageId == "german" ? "Goethe-Zertifikat, telc, and TestDaF" : "Cambridge English, IELTS, and TOEFL iBT"

        switch skill {
        case .reading:
            return "Act as a \(langName) \(level.rawValue) Reading Coach aligned with \(examBoard). Generate authentic \(level.rawValue) passages, explain tricky grammar, and ask 2–3 exam-style comprehension questions."
        case .listening:
            return "Act as a \(langName) \(level.rawValue) Listening & Hearing Coach aligned with \(examBoard). Start every drill with an [AUDIO SCRIPT] block in natural spoken \(langName) (4–6 sentences for TTS playback), followed by [HEARING FOCUS] and 2 comprehension questions."
        case .writing:
            return "Act as a certified \(examBoard) Writing Examiner for \(langName) \(level.rawValue). Provide exam tasks or grade drafts across Task Achievement, Coherence, Lexis, and Grammar with a 0–100 score, exact fixes, and a higher-band rewrite."
        case .speaking:
            return "Act as a warm native \(langName) Speaking Examiner & Roleplay Partner at \(level.rawValue). Reply naturally in \(langName) (2–4 sentences suitable for native TTS audio), ask one follow-up question, and include a brief [COACH NOTE] with 1–2 fluency upgrades."
        }
    }

    /// Deterministic offline CEFR rubric evaluator when no local/cloud AI model is active.
    public static func evaluateOffline(
        text: String,
        languageId: String,
        level: CEFRLevel,
        skill: SkillType,
        minWords: Int,
        expectedKeywords: [String]
    ) -> AIEvaluationResult {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let words = cleaned.split(whereSeparator: \.isWhitespace).map(String.init)
        let wordCount = words.count

        if wordCount == 0 {
            return AIEvaluationResult(
                score: 0,
                cefrEstimate: .A1,
                strengths: [],
                corrections: ["No response provided yet. Address every prompt bullet point to score."],
                upgradedVersion: "",
                examinerSummary: "Empty submission — write or dictate your response to receive CEFR scoring.",
                source: "offline-rubric",
                providerLabel: "Built-in CEFR Rubric Engine"
            )
        }

        let lower = cleaned.lowercased()
        let unique = Set(words.map { $0.lowercased().trimmingCharacters(in: .punctuationCharacters) }.filter { !$0.isEmpty })
        let diversity = Double(unique.count) / Double(max(1, wordCount))
        let lengthRatio = min(1.0, Double(wordCount) / Double(max(12, minWords)))

        let matchedKeywords = expectedKeywords.filter { lower.contains($0.lowercased()) }
        let keywordRatio = expectedKeywords.isEmpty ? 0.7 : Double(matchedKeywords.count) / Double(expectedKeywords.count)

        let connectors = languageId == "german"
            ? ["weil", "obwohl", "deshalb", "außerdem", "jedoch", "allerdings", "einerseits", "andererseits", "dennoch", "angesichts"]
            : ["because", "although", "however", "moreover", "furthermore", "therefore", "nevertheless", "whereas", "consequently"]
        let matchedConnectors = connectors.filter { lower.contains($0) }
        let cohesionRatio = min(1.0, Double(matchedConnectors.count) / Double((level == .A1 || level == .A2) ? 1 : 2))

        let sentenceCount = cleaned.components(separatedBy: CharacterSet(charactersIn: ".!?")).filter { $0.trimmingCharacters(in: .whitespacesAndNewlines).count > 2 }.count
        let punctuationRatio = sentenceCount >= 2 ? 1.0 : 0.6

        let lengthScore: Double = lengthRatio * 35.0
        let keywordScore: Double = min(1.0, keywordRatio + 0.25) * 25.0
        let diversityScore: Double = min(1.0, diversity * 1.45) * 20.0
        let cohesionScore: Double = cohesionRatio * 12.0
        let punctuationScore: Double = punctuationRatio * 8.0
        let totalScore: Double = lengthScore + keywordScore + diversityScore + cohesionScore + punctuationScore
        let rawScore = Int(totalScore.rounded())
        let score = max(15, min(96, rawScore))

        let estRank = score >= 62 ? level.numericRank : max(1, level.numericRank - 1)
        let estLevel = CEFRLevel.fromRank(estRank)

        var strengths: [String] = []
        if wordCount >= minWords {
            strengths.append("Met target \(skill.shortName.lowercased()) length (\(wordCount) words vs. \(minWords) min).")
        }
        if !matchedKeywords.isEmpty {
            strengths.append("Covered key exam concepts (\(matchedKeywords.prefix(4).joined(separator: ", "))).")
        }
        if !matchedConnectors.isEmpty {
            strengths.append("Used structured discourse connectors (\(matchedConnectors.prefix(3).joined(separator: ", "))).")
        }
        if strengths.isEmpty {
            strengths.append("Produced an intelligible draft addressing the exam task.")
        }

        var corrections: [String] = []
        if wordCount < minWords {
            corrections.append("Expand by at least \(minWords - wordCount) more words to meet \(level.rawValue) depth.")
        }
        if matchedConnectors.isEmpty {
            corrections.append(languageId == "german"
                ? "Add subordinating connectors (weil, obwohl, außerdem, deshalb) to raise coherence."
                : "Add discourse connectors (however, although, furthermore, consequently) to boost coherence.")
        }
        corrections.append("Connect Local (Ollama/LM Studio) or Cloud AI for full neural grammar & style rewrites.")

        let summary = score >= 60
            ? "Solid \(level.rawValue) \(skill.shortName.lowercased()) performance (\(score)/100) via offline CEFR rubric."
            : "Developing \(level.rawValue) \(skill.shortName.lowercased()) draft (\(score)/100). Expand detail and connectors."

        return AIEvaluationResult(
            score: score,
            cefrEstimate: estLevel,
            strengths: strengths,
            corrections: corrections,
            upgradedVersion: "",
            examinerSummary: summary,
            source: "offline-rubric",
            providerLabel: "Built-in CEFR Rubric Engine"
        )
    }

    public func evaluateWithAIOrFallback(
        config: AIProviderConfig,
        text: String,
        languageId: String,
        level: CEFRLevel,
        skill: SkillType,
        taskPrompt: String,
        minWords: Int,
        expectedKeywords: [String]
    ) async -> AIEvaluationResult {
        let effectiveConfig = config.resolved(for: languageId)
        guard effectiveConfig.isReady, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return Self.evaluateOffline(
                text: text,
                languageId: languageId,
                level: level,
                skill: skill,
                minWords: minWords,
                expectedKeywords: expectedKeywords
            )
        }

        let langName = languageId == "german" ? "German" : "English"
        let examBoard = languageId == "german" ? "Goethe-Zertifikat / telc / TestDaF" : "Cambridge English / IELTS / TOEFL"
        let sys = """
        You are a strict, encouraging certified \(examBoard) examiner for \(langName) at CEFR \(level.rawValue).
        Evaluate the candidate's \(skill.rawValue) submission thoroughly against official CEFR \(level.rawValue) criteria.
        Return ONLY valid JSON (no markdown fences):
        {
          "score": 0-100,
          "cefrEstimate": "\(level.rawValue)",
          "rubric": {"taskFulfillment": 0-100, "coherenceCohesion": 0-100, "lexicalRange": 0-100, "grammaticalAccuracy": 0-100},
          "strengths": ["specific strength citing candidate's phrasing"],
          "corrections": ["erroneous phrase -> corrected phrase (short rule)"],
          "correctionItems": [{"original": "exact phrase from candidate", "corrected": "natural corrected phrase", "explanation": "concise grammar/register reason"}],
          "suggestions": ["concrete next-step improvement drill"],
          "upgradedVersion": "natural \(level.rawValue)+ rewrite in \(langName) preserving the candidate's ideas",
          "examinerSummary": "2-sentence official examiner diagnostic"
        }
        """

        do {
            let raw = try await chat(
                config: effectiveConfig,
                messages: [
                    AIChatMessage(role: "system", content: sys),
                    AIChatMessage(role: "user", content: "Task:\n\(taskPrompt)\n\nResponse:\n\(text)")
                ]
            )
            if let start = raw.firstIndex(of: "{"),
               let end = raw.lastIndex(of: "}"),
               start <= end {
                let jsonSlice = String(raw[start...end])
                struct PartialRubric: Decodable {
                    let taskFulfillment: Int?
                    let coherenceCohesion: Int?
                    let lexicalRange: Int?
                    let grammaticalAccuracy: Int?
                }
                struct PartialCorrection: Decodable {
                    let original: String?
                    let corrected: String?
                    let explanation: String?
                    let sectionTag: String?
                }
                struct PartialAI: Decodable {
                    let score: Int?
                    let cefrEstimate: String?
                    let rubric: PartialRubric?
                    let strengths: [String]?
                    let corrections: [String]?
                    let correctionItems: [PartialCorrection]?
                    let suggestions: [String]?
                    let upgradedVersion: String?
                    let examinerSummary: String?
                }
                if let data = jsonSlice.data(using: .utf8),
                   let parsed = try? JSONDecoder().decode(PartialAI.self, from: data) {
                    let score = max(0, min(100, parsed.score ?? 72))
                    let rubric: OfficialRubricBreakdown? = parsed.rubric.map { r in
                        OfficialRubricBreakdown(
                            taskFulfillment: max(0, min(100, r.taskFulfillment ?? score)),
                            coherenceCohesion: max(0, min(100, r.coherenceCohesion ?? score)),
                            lexicalRange: max(0, min(100, r.lexicalRange ?? score)),
                            grammaticalAccuracy: max(0, min(100, r.grammaticalAccuracy ?? score))
                        )
                    }
                    let items: [ExamCorrectionItem] = (parsed.correctionItems ?? [])
                        .compactMap { item -> ExamCorrectionItem? in
                            let corr = (item.corrected ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !corr.isEmpty else { return nil }
                            return ExamCorrectionItem(
                                original: (item.original ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
                                corrected: corr,
                                explanation: (item.explanation ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
                                sectionTag: item.sectionTag?.trimmingCharacters(in: .whitespacesAndNewlines)
                            )
                        }
                        .prefix(6)
                        .map { $0 }
                    let cleanedCorrections = (parsed.corrections ?? [])
                        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                        .filter { !$0.isEmpty }
                    let finalCorrections = !cleanedCorrections.isEmpty
                        ? Array(cleanedCorrections.prefix(5))
                        : items.map { item in
                            item.original.isEmpty
                                ? "\(item.corrected): \(item.explanation)"
                                : "\"\(item.original)\" → \"\(item.corrected)\" (\(item.explanation))"
                        }
                    let cleanedSuggestions = (parsed.suggestions ?? [])
                        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                        .filter { !$0.isEmpty }

                    return AIEvaluationResult(
                        score: score,
                        cefrEstimate: CEFRLevel(rawValue: parsed.cefrEstimate ?? level.rawValue) ?? level,
                        strengths: (parsed.strengths ?? []).filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty },
                        corrections: finalCorrections,
                        upgradedVersion: (parsed.upgradedVersion ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
                        examinerSummary: (parsed.examinerSummary ?? String(raw.prefix(240))).trimmingCharacters(in: .whitespacesAndNewlines),
                        source: "ai",
                        providerLabel: "\(effectiveConfig.provider.label) (\(effectiveConfig.model))",
                        rubric: rubric,
                        suggestions: cleanedSuggestions.isEmpty ? nil : Array(cleanedSuggestions.prefix(4)),
                        correctionItems: items.isEmpty ? nil : items
                    )
                }
            }
        } catch {
            // Fall through to offline rubric cleanly
        }

        return Self.evaluateOffline(
            text: text,
            languageId: languageId,
            level: level,
            skill: skill,
            minWords: minWords,
            expectedKeywords: expectedKeywords
        )
    }
}
