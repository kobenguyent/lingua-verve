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

/// Native Swift multi-provider AI client supporting Local (Ollama, LM Studio, LAN Mac)
/// and Cloud (OpenAI, Google Gemini, OpenRouter, Custom OpenAI-Compatible) APIs,
/// plus a built-in offline CEFR rubric evaluator fallback.
public struct AIClientService: Sendable {
    private let transport: any AIHTTPTransport

    public init(transport: any AIHTTPTransport = URLSession.shared) {
        self.transport = transport
    }

    public func chat(config: AIProviderConfig, messages: [AIChatMessage]) async throws -> String {
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
        request.timeoutInterval = 45
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
        request.timeoutInterval = 45
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

        let rawScore = Int((
            lengthRatio * 35.0
                + min(1.0, keywordRatio + 0.25) * 25.0
                + min(1.0, diversity * 1.45) * 20.0
                + cohesionRatio * 12.0
                + punctuationRatio * 8.0
        ).rounded())
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
        guard config.isReady, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
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
        You are a certified \(examBoard) examiner for \(langName) at CEFR \(level.rawValue).
        Evaluate the candidate's \(skill.rawValue) submission. Return ONLY valid JSON:
        {"score":0-100,"cefrEstimate":"\(level.rawValue)","strengths":["..."],"corrections":["..."],"upgradedVersion":"...","examinerSummary":"..."}
        """

        do {
            let raw = try await chat(
                config: config,
                messages: [
                    AIChatMessage(role: "system", content: sys),
                    AIChatMessage(role: "user", content: "Task:\n\(taskPrompt)\n\nResponse:\n\(text)")
                ]
            )
            if let start = raw.firstIndex(of: "{"),
               let end = raw.lastIndex(of: "}"),
               start <= end {
                let jsonSlice = String(raw[start...end])
                struct PartialAI: Decodable {
                    let score: Int?
                    let cefrEstimate: String?
                    let strengths: [String]?
                    let corrections: [String]?
                    let upgradedVersion: String?
                    let examinerSummary: String?
                }
                if let data = jsonSlice.data(using: .utf8),
                   let parsed = try? JSONDecoder().decode(PartialAI.self, from: data) {
                    return AIEvaluationResult(
                        score: max(0, min(100, parsed.score ?? 72)),
                        cefrEstimate: CEFRLevel(rawValue: parsed.cefrEstimate ?? level.rawValue) ?? level,
                        strengths: parsed.strengths ?? [],
                        corrections: parsed.corrections ?? [],
                        upgradedVersion: parsed.upgradedVersion ?? "",
                        examinerSummary: parsed.examinerSummary ?? String(raw.prefix(240)),
                        source: "ai",
                        providerLabel: "\(config.provider.label) (\(config.model))"
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
