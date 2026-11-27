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

    public struct ParsedCoachReply: Equatable, Sendable {
        public let spokenText: String
        public let displayBody: String
        public let coachNote: String?
        public let audioScript: String?
        public let speakerLabel: String?

        public init(
            spokenText: String,
            displayBody: String,
            coachNote: String? = nil,
            audioScript: String? = nil,
            speakerLabel: String? = nil
        ) {
            self.spokenText = spokenText
            self.displayBody = displayBody
            self.coachNote = coachNote
            self.audioScript = audioScript
            self.speakerLabel = speakerLabel
        }
    }

    public static func buildCoachSystemPrompt(languageId: String, level: CEFRLevel, skill: SkillType) -> String {
        let lang = LearningLanguage.from(languageId)
        let langName = lang.name
        let examBoard = lang.examBoard

        switch skill {
        case .reading:
            return "Act as a \(langName) \(level.rawValue) Reading Coach aligned with \(examBoard). Generate authentic \(level.rawValue) passages, explain tricky grammar, and ask 2–3 exam-style comprehension questions."
        case .listening:
            return """
            Act as a \(langName) \(level.rawValue) Listening & Hearing Coach aligned with \(examBoard).
            Start EVERY drill with an [AUDIO SCRIPT] block containing ONLY natural spoken \(langName) (4–7 sentences; for dialogues, write each turn on its own line as Name: sentence with NO markdown asterisks, NO stage directions, and NO English words mixed in so native multi-speaker TTS plays cleanly).
            Then, on a new line, add [HEARING FOCUS] (key sounds/traps) and [QUESTIONS] (2 comprehension questions). Wait for the learner's answer before revealing the key.
            """
        case .writing:
            return "Act as a certified \(examBoard) Writing Examiner for \(langName) \(level.rawValue). Provide exam tasks or grade drafts across Task Achievement, Coherence, Lexis, and Grammar with a 0–100 score, exact fixes, and a higher-band rewrite."
        case .speaking:
            let noEnglishClause = lang != .english
                ? " and NEVER mix English words, romaji/phonetic glosses, explanations, or translations into your spoken \(langName) reply."
                : "."
            return """
            Act as a warm native \(langName) Speaking Examiner & Roleplay Partner at CEFR \(level.rawValue) aligned with \(examBoard).
            CRITICAL AUDIO FORMAT RULES:
            1. Write ONLY your spoken reply first in 100% pure, natural spoken \(langName) (2–4 sentences suitable for native TTS audio), ending with one engaging follow-up question in \(langName).
            2. NEVER include role prefixes (never write "Examiner:", "**Examiner:**", "Prüfer:", or "Coach:"), NEVER use markdown formatting (**bold**, *italics*), NEVER add stage directions like *(smiles)*\(noEnglishClause)
            3. After a blank line at the very end, put coaching feedback on a NEW LINE starting strictly with [COACH NOTE] (never inline inside a sentence) with 1–2 brief, actionable grammar, vocabulary, or phrasing fixes.
            """
        }
    }

    /// Splits an AI Coach response into pure target-language TTS audio text, clean visual body,
    /// optional extracted `[AUDIO SCRIPT]` (Listening), and separated `[COACH NOTE]` feedback so
    /// text-to-speech never reads role labels (`**Examiner:**`), markdown, or English coaching notes
    /// inside a non-English voice.
    public static func parseCoachReply(_ raw: String, skill: SkillType) -> ParsedCoachReply {
        let normalized = raw
            .replacingOccurrences(of: "\r\n", with: "\n")
            .replacingOccurrences(of: "\r", with: "\n")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        guard !normalized.isEmpty else {
            return ParsedCoachReply(spokenText: "", displayBody: "")
        }

        var working = normalized
        var noteParts: [String] = []

        let isAudioSkill = (skill == .speaking || skill == .listening)
        let bracketNoteLabels = isAudioSkill
            ? #"COACH(?:'S)?\s*NOTE|COACHING\s*NOTE|EXAMINER\s*NOTE|FEEDBACK|CORRECTIONS?|LANGUAGE\s*NOTE|GRAMMAR\s*NOTE|FLUENCY\s*(?:TIP|NOTE|UPGRADES?)|TIP|HINWEIS"#
            : #"COACH(?:'S)?\s*NOTE|COACHING\s*NOTE|EXAMINER\s*NOTE"#
        let headingNoteLabels = isAudioSkill
            ? #"COACH(?:'S)?\s*NOTE|COACHING\s*NOTE|EXAMINER\s*NOTE|LANGUAGE\s*NOTE|GRAMMAR\s*NOTE|FLUENCY\s*(?:TIP|NOTE|UPGRADES?)|FEEDBACK|CORRECTIONS?"#
            : #"COACH(?:'S)?\s*NOTE|COACHING\s*NOTE|EXAMINER\s*NOTE"#

        // 1a. Inline self-contained bracket notes: [COACH NOTE: Replace "x" with "y".]
        let inlineBracketPattern = #"\*{0,2}\[\s*(?:\#(bracketNoteLabels))\s*:\s*([^\]]+)\]\*{0,2}"#
        let inlineExtracted = extractAndRemoveMatches(in: working, pattern: inlineBracketPattern, captureGroup: 1, replacement: " ")
        working = inlineExtracted.remaining
        for note in inlineExtracted.captured {
            let cleaned = cleanCoachNoteText(note)
            if !cleaned.isEmpty { noteParts.append(cleaned) }
        }

        // 1b. Section-header bracket notes: [COACH NOTE]\n... or unclosed [COACH NOTE: ...
        let sectionBracketPattern = #"(?:^|\n|[ \t]+)(?:[-*_]{3,}[ \t]*\n[ \t]*)?\*{0,2}\[\s*(?:\#(bracketNoteLabels))\s*(?::[ \t]*|\])\*{0,2}[ \t]*:?[ \t]*([\s\S]*?)(?=\n[ \t]*\*{0,2}\[\s*(?:AUDIO\s*SCRIPT|HEARING\s*FOCUS|QUESTIONS?|COMPREHENSION|ANSWER\s*KEY)\b|\z)"#
        let sectionExtracted = extractAndRemoveMatches(in: working, pattern: sectionBracketPattern, captureGroup: 1, replacement: "")
        working = sectionExtracted.remaining
        for note in sectionExtracted.captured {
            let cleaned = cleanCoachNoteText(note)
            if !cleaned.isEmpty { noteParts.append(cleaned) }
        }

        // 1c. Plain or markdown heading notes on their own line: **Coach Note:** ..., ### Feedback:
        let headingNotePattern = #"(?:^|\n)[ \t]*(?:[-*_]{3,}[ \t]*\n[ \t]*)?(?:#{1,4}[ \t]*)?(?:[💡📝✅✏️📌][ \t]*)?\*{0,2}(?:\#(headingNoteLabels))(?::\*{0,2}|\*{0,2}:)[ \t]*([\s\S]*?)(?=\n[ \t]*\*{0,2}\[\s*(?:AUDIO\s*SCRIPT|HEARING\s*FOCUS|QUESTIONS?|COMPREHENSION|ANSWER\s*KEY)\b|\z)"#
        let headingExtracted = extractAndRemoveMatches(in: working, pattern: headingNotePattern, captureGroup: 1, replacement: "")
        working = headingExtracted.remaining
        for note in headingExtracted.captured {
            let cleaned = cleanCoachNoteText(note)
            if !cleaned.isEmpty { noteParts.append(cleaned) }
        }

        // 1d. Trailing English translation block in Speaking mode (keep visible in note, exclude from TTS)
        if skill == .speaking {
            let translationPattern = #"(?:^|\n)[ \t]*(?:[-*_]{3,}[ \t]*\n[ \t]*)?\*{0,2}[\(\[]?(?:English\s+)?Translation(?::\*{0,2}|\*{0,2}:|\]:?)[ \t]*([\s\S]*)\z"#
            let transExtracted = extractAndRemoveMatches(in: working, pattern: translationPattern, captureGroup: 1, replacement: "")
            working = transExtracted.remaining
            for tr in transExtracted.captured {
                let cleaned = cleanCoachNoteText(tr.trimmingCharacters(in: CharacterSet(charactersIn: ")*] \t\n")))
                if !cleaned.isEmpty {
                    noteParts.append("Translation: \(cleaned)")
                }
            }
        }

        // Strip trailing horizontal dividers left behind after removing notes
        working = regexReplace(working, pattern: #"(?:\n[ \t]*[-*_]{3,}[ \t]*)+\z"#, with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        // 2. Listening [AUDIO SCRIPT] extraction (preserves multi-speaker "Name: ..." turns for TTS)
        var audioScript: String? = nil
        if skill == .listening {
            let inlineScriptPattern = #"\*{0,2}\[\s*AUDIO\s*SCRIPT\s*:\s*([^\]]+)\]\*{0,2}"#
            let blockScriptPattern = #"(?:^|\n)[ \t]*\*{0,2}\[\s*AUDIO\s*SCRIPT\s*\]\*{0,2}[ \t]*:?[ \t]*\n?([\s\S]*?)(?=\n[ \t]*(?:\*{0,2}\[\s*(?:HEARING\s*FOCUS|QUESTIONS?|COMPREHENSION|COACH\s*NOTE|VOCABULARY|ANSWER\s*KEY|TIP)\b|(?:#{1,4}[ \t]*)?\*{0,2}(?:HEARING\s*FOCUS|COMPREHENSION\s*QUESTIONS?|QUESTIONS?|VOCABULARY|ANSWER\s*KEY)(?::\*{0,2}|\*{0,2}:))|\z)"#
            let headingScriptPattern = #"(?:^|\n)[ \t]*(?:#{1,4}[ \t]*)?\*{0,2}AUDIO\s*SCRIPT(?::\*{0,2}|\*{0,2}:)[ \t]*\n?([\s\S]*?)(?=\n[ \t]*(?:\*{0,2}\[|(?:#{1,4}[ \t]*)?\*{0,2}(?:HEARING\s*FOCUS|COMPREHENSION\s*QUESTIONS?|QUESTIONS?|VOCABULARY|ANSWER\s*KEY)(?::\*{0,2}|\*{0,2}:))|\z)"#

            if let rawScript = firstCapturedGroup(in: working, pattern: inlineScriptPattern)
                ?? firstCapturedGroup(in: working, pattern: blockScriptPattern)
                ?? firstCapturedGroup(in: working, pattern: headingScriptPattern) {
                let sanitized = sanitizeForSpeech(rawScript, preserveSpeakerTurns: true)
                if !sanitized.isEmpty {
                    audioScript = sanitized
                }
            }
        }

        // 3. Strip leading speaker/role labels (**Examiner:**, Prüfer:, Coach:, [EXAMINER])
        var speakerLabel: String? = nil
        working = regexReplace(
            working,
            pattern: #"^\s*\*{0,2}\[\s*(?:EXAMINER|SPEAKING|RESPONSE|DIALOGUE|REPLY)\s*\]\*{0,2}\s*:?\s*"#,
            with: ""
        )

        if skill == .speaking {
            let rolePrefixPattern = #"^\s*\*{0,2}(Examiner|AI\s*Examiner|Speaking\s*Examiner|Coach|AI\s*Coach|Tutor|Teacher|Interviewer|Roleplay\s*Partner|Partner|Assistant|Prüfer(?:in)?|Gesprächspartner(?:in)?|Lehrer(?:in)?|Moderator(?:in)?|Examinateur|Examinatrice|Professeur(?:e)?|Interlocuteur|Interlocutrice|試験官|面接官|先生|コーチ|講師)(?:[:：]\*{0,2}|\*{0,2}[:：])[ \t]*"#
            if let capturedRole = firstCapturedGroup(in: working, pattern: rolePrefixPattern) {
                speakerLabel = capturedRole.trimmingCharacters(in: .whitespacesAndNewlines)
                working = regexReplace(working, pattern: rolePrefixPattern, with: "")
            }
            // Strip repeated role labels on subsequent lines within a single-speaker roleplay turn
            let repeatedRolePattern = #"\n[ \t]*\*{0,2}(?:Examiner|AI\s*Examiner|Coach|Tutor|Interviewer|Assistant|Prüfer(?:in)?|Gesprächspartner(?:in)?|Examinateur|Examinatrice|Professeur(?:e)?|試験官|面接官|先生|コーチ)(?:[:：]\*{0,2}|\*{0,2}[:：])[ \t]*"#
            working = regexReplace(working, pattern: repeatedRolePattern, with: "\n")
        }

        let displayBody: String
        if skill == .speaking {
            displayBody = sanitizeForSpeech(working, preserveSpeakerTurns: false)
        } else {
            displayBody = regexReplace(working, pattern: #"[ \t]+([.,!?;:])"#, with: "$1")
                .trimmingCharacters(in: .whitespacesAndNewlines)
        }

        let spokenText: String
        if let script = audioScript, !script.isEmpty {
            spokenText = script
        } else {
            spokenText = sanitizeForSpeech(working, preserveSpeakerTurns: skill == .listening)
        }

        let combinedNote = noteParts.joined(separator: "\n\n").trimmingCharacters(in: .whitespacesAndNewlines)

        return ParsedCoachReply(
            spokenText: spokenText,
            displayBody: displayBody,
            coachNote: combinedNote.isEmpty ? nil : combinedNote,
            audioScript: audioScript,
            speakerLabel: speakerLabel
        )
    }

    private static func sanitizeForSpeech(_ text: String, preserveSpeakerTurns: Bool) -> String {
        var s = text
        // 1. Asterisk-wrapped stage directions: *(smiles warmly)*, **(laughs)**
        s = regexReplace(s, pattern: #"\*{1,2}\([^)\n]{1,80}\)\*{1,2}"#, with: " ")
        // 2. Action stage directions in parentheses or brackets: (lacht), [laughs], (smiles)
        s = regexReplace(
            s,
            pattern: #"[\(\[]\s*(?:smiles?|smiling|laughs?|laughing|chuckles?|nods?|nodding|pauses?|sighs?|clears\s+throat|warmly|enthusiastically|cheerfully|encouragingly|softly|lächelt|lacht|nickt|pause|pausiert|seufzt|freundlich)[^)\]\n]{0,45}[\)\]]"#,
            with: " "
        )
        // 3. Remaining bracketed section tags like [AUDIO SCRIPT], [HEARING FOCUS], [QUESTIONS]
        s = regexReplace(s, pattern: #"\[\s*[A-ZÄÖÜ0-9 _/-]{2,32}\s*\]"#, with: " ")
        // 4. Markdown headings & horizontal rules
        s = regexReplace(s, pattern: #"(?m)^[ \t]*#{1,6}[ \t]+"#, with: "")
        s = regexReplace(s, pattern: #"(?m)^[ \t]*[-*_]{3,}[ \t]*$"#, with: "")
        // 5. Markdown emphasis & inline code
        s = regexReplace(s, pattern: #"\*\*([^\n*]+?)\*\*"#, with: "$1")
        s = regexReplace(s, pattern: #"__([^\n_]+?)__"#, with: "$1")
        s = regexReplace(s, pattern: #"\*([^\n*]+?)\*"#, with: "$1")
        s = regexReplace(s, pattern: #"`([^`\n]+?)`"#, with: "$1")
        s = regexReplace(s, pattern: #"\*{1,}"#, with: "")
        // 6. Bullet markers
        s = regexReplace(s, pattern: #"(?m)^[ \t]*[-•][ \t]+"#, with: "")

        if preserveSpeakerTurns {
            let lines = s
                .components(separatedBy: "\n")
                .map { line -> String in
                    var l = regexReplace(line, pattern: #"[ \t]{2,}"#, with: " ")
                    l = regexReplace(l, pattern: #"[ \t]+([.,!?;:])"#, with: "$1")
                    return l.trimmingCharacters(in: .whitespaces)
                }
                .filter { !$0.isEmpty }
            return lines.joined(separator: "\n")
        } else {
            s = regexReplace(s, pattern: #"[\t\n ]+"#, with: " ")
            s = regexReplace(s, pattern: #"[ \t]+([.,!?;:])"#, with: "$1")
            return s.trimmingCharacters(in: .whitespacesAndNewlines)
        }
    }

    private static func cleanCoachNoteText(_ raw: String) -> String {
        var s = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        while s.hasSuffix("]") && !s.contains("[") {
            s.removeLast()
            s = s.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        s = regexReplace(s, pattern: #"\*\*([^\n*]+?)\*\*"#, with: "$1")
        s = regexReplace(s, pattern: #"__([^\n_]+?)__"#, with: "$1")
        s = regexReplace(s, pattern: #"\n{3,}"#, with: "\n\n")
        return s.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func extractAndRemoveMatches(
        in text: String,
        pattern: String,
        captureGroup: Int,
        replacement: String
    ) -> (remaining: String, captured: [String]) {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
            return (text, [])
        }
        let nsText = text as NSString
        let matches = regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsText.length))
        guard !matches.isEmpty else { return (text, []) }

        var captured: [String] = []
        for match in matches {
            let range = match.range(at: captureGroup)
            if range.location != NSNotFound {
                captured.append(nsText.substring(with: range))
            }
        }

        let mutable = NSMutableString(string: text)
        for match in matches.reversed() {
            mutable.replaceCharacters(in: match.range, with: replacement)
        }
        return (String(mutable), captured)
    }

    private static func firstCapturedGroup(in text: String, pattern: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
            return nil
        }
        let nsText = text as NSString
        guard let match = regex.firstMatch(in: text, options: [], range: NSRange(location: 0, length: nsText.length)),
              match.numberOfRanges > 1 else {
            return nil
        }
        let range = match.range(at: 1)
        guard range.location != NSNotFound else { return nil }
        return nsText.substring(with: range)
    }

    private static func regexReplace(_ text: String, pattern: String, with template: String) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
            return text
        }
        let range = NSRange(location: 0, length: (text as NSString).length)
        return regex.stringByReplacingMatches(in: text, options: [], range: range, withTemplate: template)
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
        let lang = LearningLanguage.from(languageId)
        let wordCount = LearningLanguage.countUnits(in: cleaned, languageId: languageId)

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
        let uniqueCount: Int
        if lang.usesCJKCharacters || LearningLanguage.containsJapaneseScript(cleaned) {
            let chars = Array(cleaned.filter { !$0.isWhitespace && !$0.isPunctuation })
            let bigrams = chars.count >= 2 ? Set((0..<(chars.count - 1)).map { String([chars[$0], chars[$0 + 1]]) }) : Set(chars.map(String.init))
            uniqueCount = bigrams.count
        } else {
            uniqueCount = Set(words.map { $0.lowercased().trimmingCharacters(in: .punctuationCharacters) }.filter { !$0.isEmpty }).count
        }
        let diversity = min(1.0, Double(uniqueCount) / Double(max(1, wordCount)))
        let lengthRatio = min(1.0, Double(wordCount) / Double(max(12, minWords)))

        let matchedKeywords = expectedKeywords.filter { lower.contains($0.lowercased()) }
        let keywordRatio = expectedKeywords.isEmpty ? 0.7 : Double(matchedKeywords.count) / Double(expectedKeywords.count)

        let connectors = lang.connectors
        let matchedConnectors = connectors.filter { lower.contains($0) }
        let cohesionRatio = min(1.0, Double(matchedConnectors.count) / Double((level == .A1 || level == .A2) ? 1 : 2))

        let sentenceCount = cleaned.components(separatedBy: CharacterSet(charactersIn: ".!?。！？")).filter { $0.trimmingCharacters(in: .whitespacesAndNewlines).count > 2 }.count
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
            corrections.append(lang.connectorHint)
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

        let lang = LearningLanguage.from(languageId)
        let langName = lang.name
        let examBoard = lang.examBoard
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
