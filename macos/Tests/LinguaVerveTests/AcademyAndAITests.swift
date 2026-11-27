import Foundation
import XCTest
@testable import LinguaVerveCore

private final class MockAITransport: AIHTTPTransport, @unchecked Sendable {
    let handler: @Sendable (URLRequest) throws -> (Data, HTTPURLResponse)

    init(handler: @escaping @Sendable (URLRequest) throws -> (Data, HTTPURLResponse)) {
        self.handler = handler
    }

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        try handler(request)
    }
}

private struct MockAppleFoundationBackend: AppleFoundationModelBackend {
    let available: Bool
    let reply: String

    func availability() -> AppleFoundationAvailability {
        AppleFoundationAvailability(
            isAvailable: available,
            statusTitle: available ? "Ready On-Device" : "Unavailable",
            detail: available ? "Mock Apple Intelligence Ready" : "Mock unavailable"
        )
    }

    func respond(messages: [AIChatMessage], temperature: Double) async throws -> String {
        guard available else {
            throw AppleFoundationError.unavailable("Mock unavailable")
        }
        return reply
    }
}

final class AcademyAndAITests: XCTestCase {

    private func makeTestStore() -> CurriculumStore {
        let defaults = UserDefaults(suiteName: "LinguaVerveAcademyTests.\(UUID().uuidString)")!
        return CurriculumStore(defaults: defaults)
    }

    func testCurriculumIncludesAll12IntensiveCoursesExamReferencesPreTestsAndMockExams() {
        let store = makeTestStore()

        XCTAssertEqual(store.bundle.intensiveCourses.count, 24)
        XCTAssertEqual(store.courses(for: "english").map(\.level), CEFRLevel.allCases)
        XCTAssertEqual(store.courses(for: "german").map(\.level), CEFRLevel.allCases)
        XCTAssertEqual(store.courses(for: "french").map(\.level), CEFRLevel.allCases)
        XCTAssertEqual(store.courses(for: "japanese").map(\.level), CEFRLevel.allCases)

        XCTAssertGreaterThanOrEqual(store.bundle.examReferences.count, 40)
        for ref in store.bundle.examReferences {
            XCTAssertTrue(ref.url.hasPrefix("https://"), "Expected HTTPS reference URL: \(ref.url)")
        }

        XCTAssertEqual(store.preTestQuestions(for: "english").count, 12)
        XCTAssertEqual(store.preTestQuestions(for: "german").count, 12)
        XCTAssertEqual(store.preTestQuestions(for: "french").count, 12)
        XCTAssertEqual(store.preTestQuestions(for: "japanese").count, 12)
        XCTAssertEqual(store.bundle.mockExams.count, 24)
    }

    func testScoredPreTestVerifiesLevelAndSuggestsCollectiveCourseBundle() {
        let store = makeTestStore()
        let qs = store.preTestQuestions(for: "german")
        var answers: [String: Int] = [:]
        for q in qs {
            // Answer A1, A2, B1 correctly EXCEPT listening to trigger foundation + core + bridge
            if q.skill == .listening {
                answers[q.id] = (q.correctIndex + 1) % q.options.count
            } else if [CEFRLevel.A1, .A2, .B1].contains(q.level) {
                answers[q.id] = q.correctIndex
            } else {
                answers[q.id] = (q.correctIndex + 1) % q.options.count
            }
        }

        let result = store.evaluateAndRecordPreTest(languageId: "german", answers: answers)
        XCTAssertEqual(result.skillScores[SkillType.listening.rawValue], 0)
        XCTAssertTrue(result.recommendedCourses.contains { $0.role == "foundation" })
        XCTAssertTrue(result.recommendedCourses.contains { $0.role == "core" })
        XCTAssertTrue(result.recommendedCourses.contains { $0.role == "bridge" })
        XCTAssertEqual(store.learnerState.preTestHistory.count, 1)
        XCTAssertFalse(store.learnerState.enrolledCourseIds.isEmpty)
    }

    func testProgressTrackingExamHistorySkillAveragesAndJSONBackupRoundTrip() throws {
        let store = makeTestStore()
        guard let course = store.course(for: "german", level: .A1),
              let firstModule = course.modules.first else {
            XCTFail("Expected German A1 intensive course and module")
            return
        }

        let nowDone = store.toggleModuleComplete(firstModule, languageId: "german", level: .A1)
        XCTAssertTrue(nowDone)
        XCTAssertTrue(store.isModuleCompleted(firstModule.id))
        XCTAssertGreaterThan(store.courseCompletionPercent(for: course), 0)
        XCTAssertGreaterThanOrEqual(store.studyStreak(), 1)

        let attempt = ExamAttemptRecord(
            id: "exam-test-1",
            timestamp: ISO8601DateFormatter().string(from: Date()),
            examId: "exam-de-a1",
            examTitle: "Goethe-Zertifikat A1 Simulation",
            alignedCertificate: "Goethe-Zertifikat A1",
            languageId: "german",
            level: .A1,
            mode: "strict",
            durationUsedSeconds: 900,
            overallScore: 85,
            passed: true,
            skills: [
                SkillType.reading.rawValue: SkillExamScore(score: 100, passed: true, feedback: "3/3"),
                SkillType.listening.rawValue: SkillExamScore(score: 67, passed: true, feedback: "2/3"),
                SkillType.writing.rawValue: SkillExamScore(score: 86, passed: true, feedback: "Clear email"),
                SkillType.speaking.rawValue: SkillExamScore(score: 87, passed: true, feedback: "Fluent intro")
            ]
        )
        store.recordExamAttempt(attempt)
        XCTAssertEqual(store.learnerState.examHistory.count, 1)

        let avgs = store.skillAverages(languageId: "german")
        XCTAssertEqual(avgs[.reading]?.average, 100)
        XCTAssertEqual(avgs[.writing]?.average, 86)

        let backup = store.exportProgressJSON()
        let restoredStore = makeTestStore()
        try restoredStore.importProgressJSON(backup)
        XCTAssertEqual(restoredStore.learnerState.completedModuleIds, store.learnerState.completedModuleIds)
        XCTAssertEqual(restoredStore.learnerState.examHistory.count, 1)
    }

    func testLocalOllamaAndCloudGeminiAIClientAndOfflineFallback() async throws {
        // 1. Local Ollama OpenAI-compatible response
        let ollamaTransport = MockAITransport { request in
            XCTAssertEqual(request.url?.absoluteString, "http://localhost:11434/v1/chat/completions")
            let body = #"{"choices":[{"message":{"content":"LinguaVerve Native AI ready."}}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let ollamaClient = AIClientService(transport: ollamaTransport)
        let ollamaCfg = AIProviderConfig(provider: .ollama, enabled: true)
        let testRes = await ollamaClient.testConnection(config: ollamaCfg)
        XCTAssertTrue(testRes.ok)
        XCTAssertEqual(testRes.message, "LinguaVerve Native AI ready.")

        // 2. Cloud Gemini REST API response
        let geminiTransport = MockAITransport { request in
            XCTAssertTrue(request.url?.absoluteString.contains("generativelanguage.googleapis.com") == true)
            let body = #"{"candidates":[{"content":{"parts":[{"text":"Bereit für C1 Deutsch."}]}}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let geminiClient = AIClientService(transport: geminiTransport)
        let geminiCfg = AIProviderConfig(provider: .gemini, apiKey: "test-key", enabled: true)
        let reply = try await geminiClient.chat(config: geminiCfg, messages: [AIChatMessage(role: "user", content: "Hi")])
        XCTAssertEqual(reply, "Bereit für C1 Deutsch.")

        // 3. Offline CEFR Rubric Fallback
        let offline = AIClientService.evaluateOffline(
            text: "Meiner Meinung nach sollten wir Bargeld behalten, weil digitale Systeme ausfallen können. Obwohl Karten bequem sind, brauchen wir außerdem sichere Alternativen.",
            languageId: "german",
            level: .B1,
            skill: .writing,
            minWords: 20,
            expectedKeywords: ["Meinung", "Bargeld", "weil", "obwohl"]
        )
        XCTAssertEqual(offline.source, "offline-rubric")
        XCTAssertGreaterThanOrEqual(offline.score, 65)
    }

    func testAppleFoundationModelOnDeviceProviderAndGracefulFallback() async throws {
        // Metadata checks
        XCTAssertTrue(AIProviderType.appleFoundation.isLocal)
        XCTAssertTrue(AIProviderType.appleFoundation.isOnDeviceApple)
        XCTAssertFalse(AIProviderType.appleFoundation.requiresAPIKey)
        let cfg = AIProviderConfig(provider: .appleFoundation, enabled: true)
        XCTAssertTrue(cfg.isReady)

        // Live availability probe never crashes on host macOS
        let liveStatus = LiveAppleFoundationModelBackend().availability()
        XCTAssertFalse(liveStatus.statusTitle.isEmpty)

        // Fallback diagnostics distinguish pre-26 runtime OS from pre-26 SDK build on macOS 26/27+
        let newerOSOldSDK = LiveAppleFoundationModelBackend.fallbackAvailability(
            osVersion: OperatingSystemVersion(majorVersion: 27, minorVersion: 2, patchVersion: 1),
            compiledWithFoundationModels: false
        )
        XCTAssertFalse(newerOSOldSDK.isAvailable)
        XCTAssertEqual(newerOSOldSDK.statusTitle, "App Build Missing macOS 26+ SDK")
        XCTAssertTrue(newerOSOldSDK.detail.contains("27.2.1"))

        let olderOS = LiveAppleFoundationModelBackend.fallbackAvailability(
            osVersion: OperatingSystemVersion(majorVersion: 15, minorVersion: 5, patchVersion: 0),
            compiledWithFoundationModels: true
        )
        XCTAssertFalse(olderOS.isAvailable)
        XCTAssertEqual(olderOS.statusTitle, "Requires macOS 26 / iOS 26+")
        XCTAssertTrue(olderOS.detail.contains("15.5.0"))

        // Mock on-device Apple Foundation Model chat + structured exam grading
        let jsonReply = """
        {"score":91,"cefrEstimate":"C1","strengths":["Crisp Nominalstil"],"corrections":["Minor comma"],"upgradedVersion":"Angesichts der Entwicklung...","examinerSummary":"Excellent C1 German response."}
        """
        let client = AIClientService(appleBackend: MockAppleFoundationBackend(available: true, reply: jsonReply))
        let testConn = await client.testConnection(config: cfg)
        XCTAssertTrue(testConn.ok)

        let eval = await client.evaluateWithAIOrFallback(
            config: cfg,
            text: "Angesichts der rasanten Entwicklung ist lebenslanges Lernen unverzichtbar.",
            languageId: "german",
            level: .C1,
            skill: .writing,
            taskPrompt: "Diskutieren Sie lebenslanges Lernen.",
            minWords: 10,
            expectedKeywords: ["angesichts"]
        )
        XCTAssertEqual(eval.source, "ai")
        XCTAssertEqual(eval.score, 91)
        XCTAssertEqual(eval.cefrEstimate, .C1)

        // When on-device Apple Intelligence is unavailable, cleanly falls back to offline rubric
        let unavailableClient = AIClientService(appleBackend: MockAppleFoundationBackend(available: false, reply: ""))
        let fallbackEval = await unavailableClient.evaluateWithAIOrFallback(
            config: cfg,
            text: "Meiner Meinung nach ist diese Frage wichtig, weil Bildung entscheidend bleibt.",
            languageId: "german",
            level: .B1,
            skill: .writing,
            taskPrompt: "Bildung",
            minWords: 10,
            expectedKeywords: ["Meinung", "weil"]
        )
        XCTAssertEqual(fallbackEval.source, "offline-rubric")
    }

    func testFetchAvailableModelsAcrossAllProviders() async throws {
        // 1. Ollama falls back from /v1/models 404 to native /api/tags
        let ollamaEndpoints = AIClientService.resolveModelsEndpoints(
            provider: .ollama,
            endpoint: "http://localhost:11434/v1/chat/completions"
        )
        XCTAssertEqual(
            ollamaEndpoints.map(\.absoluteString),
            ["http://localhost:11434/v1/models", "http://localhost:11434/api/tags"]
        )

        let ollamaTransport = MockAITransport { request in
            if request.url?.path == "/v1/models" {
                let resp = HTTPURLResponse(url: request.url!, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
                return (Data("not found".utf8), resp)
            }
            let body = #"{"models":[{"name":"qwen2.5:7b","details":{"parameter_size":"7.6B","family":"qwen2"}},{"name":"llama3.2:latest","details":{"parameter_size":"3.2B","family":"llama"}}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let ollamaModels = try await AIClientService(transport: ollamaTransport)
            .fetchAvailableModels(config: AIProviderConfig(provider: .ollama))
        XCTAssertEqual(ollamaModels.map(\.id), ["qwen2.5:7b", "llama3.2:latest"])
        XCTAssertEqual(ollamaModels.first?.displayName, "qwen2.5:7b (7.6B)")

        // 2. OpenAI filters out embeddings/whisper/tts and checks Bearer header
        let openaiTransport = MockAITransport { request in
            XCTAssertEqual(request.url?.absoluteString, "https://api.openai.com/v1/models")
            XCTAssertEqual(request.value(forHTTPHeaderField: "Authorization"), "Bearer sk-unit")
            let body = #"{"data":[{"id":"text-embedding-3-small","owned_by":"openai"},{"id":"whisper-1","owned_by":"openai"},{"id":"gpt-4o-mini","owned_by":"openai"},{"id":"o3-mini","owned_by":"openai"}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let openaiModels = try await AIClientService(transport: openaiTransport)
            .fetchAvailableModels(config: AIProviderConfig(provider: .openai, apiKey: "sk-unit"))
        XCTAssertEqual(openaiModels.map(\.id), ["gpt-4o-mini", "o3-mini"])

        // 3. Google Gemini strips `models/` prefix and keeps generateContent models only
        let geminiTransport = MockAITransport { request in
            XCTAssertTrue(request.url?.absoluteString.contains("generativelanguage.googleapis.com/v1beta/models?key=AIza-unit") == true)
            let body = #"{"models":[{"name":"models/gemini-2.5-flash","displayName":"Gemini 2.5 Flash","supportedGenerationMethods":["generateContent"],"inputTokenLimit":1048576},{"name":"models/text-embedding-004","displayName":"Embedding","supportedGenerationMethods":["embedContent"]}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let geminiModels = try await AIClientService(transport: geminiTransport)
            .fetchAvailableModels(config: AIProviderConfig(provider: .gemini, apiKey: "AIza-unit"))
        XCTAssertEqual(geminiModels.map(\.id), ["gemini-2.5-flash"])
        XCTAssertEqual(geminiModels.first?.displayName, "Gemini 2.5 Flash")

        // 4. OpenRouter lists models even without an API key
        let openRouterTransport = MockAITransport { request in
            XCTAssertEqual(request.url?.absoluteString, "https://openrouter.ai/api/v1/models")
            let body = #"{"data":[{"id":"anthropic/claude-3.5-sonnet","name":"Claude 3.5 Sonnet","context_length":200000},{"id":"google/gemini-2.5-flash","name":"Gemini 2.5 Flash","context_length":1000000}]}"#
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (Data(body.utf8), resp)
        }
        let openRouterModels = try await AIClientService(transport: openRouterTransport)
            .fetchAvailableModels(config: AIProviderConfig(provider: .openrouter))
        XCTAssertEqual(openRouterModels.map(\.id), ["anthropic/claude-3.5-sonnet", "google/gemini-2.5-flash"])

        // 5. Apple On-Device Foundation Model returns SystemLanguageModel when available
        let appleReadyClient = AIClientService(appleBackend: MockAppleFoundationBackend(available: true, reply: "ok"))
        let appleModels = try await appleReadyClient.fetchAvailableModels(config: AIProviderConfig(provider: .appleFoundation))
        XCTAssertEqual(appleModels.count, 1)
        XCTAssertEqual(appleModels.first?.ownedBy, "Apple Intelligence")
    }

    func testGuidedUnitLessonsDecodeForAll72UnitsAndPersistUnitStudyProgress() throws {
        let store = makeTestStore()
        var totalModules = 0
        for course in store.bundle.intensiveCourses {
            XCTAssertEqual(course.modules.count, 6, "Expected 6 units in course \(course.id)")
            for mod in course.modules {
                totalModules += 1
                guard let lesson = mod.lesson else {
                    XCTFail("Missing guided lesson for module \(mod.id)")
                    continue
                }
                XCTAssertGreaterThanOrEqual(lesson.sections.count, 2, "Expected >=2 sections for \(mod.id)")
                XCTAssertEqual(lesson.vocabCards.count, mod.keyVocabulary.count, "Vocab card count mismatch for \(mod.id)")
                XCTAssertGreaterThanOrEqual(lesson.practiceQuestions.count, 3, "Expected >=3 quiz questions for \(mod.id)")
                XCTAssertFalse(lesson.checkpointModelAnswer.isEmpty, "Missing checkpoint model answer for \(mod.id)")
            }
        }
        XCTAssertEqual(totalModules, 144)

        guard let course = store.course(for: "german", level: .A1),
              let unit1 = course.modules.first else {
            XCTFail("Expected German A1 Unit 1")
            return
        }

        // Open guided lesson, persist per-unit step progress, and complete with checkpoint score
        store.openUnitLesson(moduleId: unit1.id, languageId: "german", level: .A1)
        XCTAssertEqual(store.activeLessonModuleId, unit1.id)

        let progress = UnitStudyProgress(
            moduleId: unit1.id,
            currentStep: 4,
            completedSteps: [0, 1, 2, 3, 4],
            masteredVocab: ["heißen", "wohnen"],
            quizAnswers: ["de-a1-m1-q1": 1],
            completedDrillIndices: [0],
            checkpointResponse: "Guten Tag, ich heiße Lukas und wohne in München.",
            checkpointScore: 88
        )
        store.saveUnitProgress(progress)
        XCTAssertEqual(store.unitProgress(for: unit1.id)?.checkpointScore, 88)
        XCTAssertEqual(store.unitProgress(for: unit1.id)?.masteredVocab, ["heißen", "wohnen"])

        store.markModuleCompleted(unit1, languageId: "german", level: .A1, score: 88)
        XCTAssertTrue(store.isModuleCompleted(unit1.id))
        XCTAssertEqual(store.learnerState.activityLog.first?.score, 88)

        // Verify JSON backup export/import preserves unitProgress
        let backup = store.exportProgressJSON()
        let restored = makeTestStore()
        try restored.importProgressJSON(backup)
        XCTAssertEqual(restored.unitProgress(for: unit1.id)?.checkpointScore, 88)
        XCTAssertEqual(restored.unitProgress(for: unit1.id)?.completedSteps, [0, 1, 2, 3, 4])

        // Verify backward-compatible decoding of legacy progress JSON without `unitProgress`
        let legacyJSON = #"{"version":1,"completedModuleIds":["de-a1-m1"],"enrolledCourseIds":[],"preTestHistory":[],"examHistory":[],"aiSessionHistory":[],"activityLog":[],"studyDays":[]}"#
        let legacyDecoded = try JSONDecoder().decode(LearnerProgressState.self, from: Data(legacyJSON.utf8))
        XCTAssertEqual(legacyDecoded.completedModuleIds, ["de-a1-m1"])
        XCTAssertTrue(legacyDecoded.unitProgress.isEmpty)

        store.closeUnitLesson()
        XCTAssertNil(store.activeLessonModuleId)
    }

    func testMultiAccentCatalogAndHumanVoiceRankingBlocksRoboticVoices() {
        let enAccents = NativeAudioEngine.accents(for: "english").map(\.code)
        let deAccents = NativeAudioEngine.accents(for: "german").map(\.code)
        let frAccents = NativeAudioEngine.accents(for: "french").map(\.code)
        let jaAccents = NativeAudioEngine.accents(for: "japanese").map(\.code)
        XCTAssertEqual(enAccents, ["en-GB", "en-US", "en-AU", "en-IE", "en-IN", "en-ZA"])
        XCTAssertEqual(deAccents, ["de-DE", "de-AT", "de-CH"])
        XCTAssertEqual(frAccents, ["fr-FR", "fr-CA", "fr-CH"])
        XCTAssertEqual(jaAccents, ["ja-JP"])

        let candidates: [VoiceCandidateDescriptor] = [
            VoiceCandidateDescriptor(identifier: "com.apple.speech.synthesis.voice.Albert", name: "Albert", language: "en-US", qualityRaw: 1),
            VoiceCandidateDescriptor(identifier: "com.apple.eloquence.en-GB.Eddy", name: "Eddy", language: "en-GB", qualityRaw: 1),
            VoiceCandidateDescriptor(identifier: "com.apple.voice.super-compact.en-GB.Daniel", name: "Daniel", language: "en-GB", qualityRaw: 1),
            VoiceCandidateDescriptor(identifier: "com.apple.siri.natural.Quinn", name: "Voice 5", language: "en-US", qualityRaw: 2),
            VoiceCandidateDescriptor(identifier: "com.apple.eloquence.de-DE.Flo", name: "Flo", language: "de-DE", qualityRaw: 1),
            VoiceCandidateDescriptor(identifier: "com.apple.siri.natural.Helena", name: "Voice 2", language: "de-DE", qualityRaw: 2)
        ]

        XCTAssertTrue(NativeAudioEngine.isRoboticVoice(candidates[0]))
        XCTAssertTrue(NativeAudioEngine.isRoboticVoice(candidates[1]))
        XCTAssertFalse(NativeAudioEngine.isRoboticVoice(candidates[3]))

        // Neural/Premium voices outrank 22kHz super-compact voices even across regional variants
        XCTAssertEqual(NativeAudioEngine.pickBestCandidate(from: candidates, targetBcp47: "en-GB")?.identifier, "com.apple.siri.natural.Quinn")
        XCTAssertEqual(NativeAudioEngine.pickBestCandidate(from: candidates, targetBcp47: "en-US")?.identifier, "com.apple.siri.natural.Quinn")
        XCTAssertEqual(NativeAudioEngine.pickBestCandidate(from: candidates, targetBcp47: "de-DE")?.identifier, "com.apple.siri.natural.Helena")

        // When both regional compact and regional enhanced/premium exist, exact regional enhanced wins
        let deCandidates: [VoiceCandidateDescriptor] = [
            VoiceCandidateDescriptor(identifier: "com.apple.voice.compact.de-DE.Anna", name: "Anna", language: "de-DE", qualityRaw: 1),
            VoiceCandidateDescriptor(identifier: "com.apple.voice.premium.de-DE.Petra", name: "Petra", language: "de-DE", qualityRaw: 3),
            VoiceCandidateDescriptor(identifier: "com.apple.siri.natural.Helena", name: "Voice 2", language: "de-DE", qualityRaw: 2)
        ]
        XCTAssertEqual(NativeAudioEngine.pickBestCandidate(from: deCandidates, targetBcp47: "de-DE")?.name, "Petra")

        let defaults = UserDefaults(suiteName: "LinguaVerveVoiceTests.\(UUID().uuidString)")!
        let engine = NativeAudioEngine(defaults: defaults)
        // Verify OpenAI API key reuse reads native CurriculumStore key
        let savedAI = AIProviderConfig(provider: .openai, apiKey: "sk-shared-native-key", enabled: true)
        if let encodedAI = try? JSONEncoder().encode(savedAI) {
            defaults.set(encodedAI, forKey: "linguaverve.apple.aiConfig.v1")
        }
        var openAISettings = VoiceSettings()
        openAISettings.provider = .openai
        openAISettings.reuseOpenAIKey = true
        XCTAssertEqual(engine.effectiveAPIKey(for: openAISettings), "sk-shared-native-key")
        XCTAssertTrue(engine.isNeuralProviderReady(for: openAISettings))

        // Verify overall app font scale persistence & clamping on CurriculumStore
        let fontDefaults = UserDefaults(suiteName: "LinguaVerveFontScaleTests.\(UUID().uuidString)")!
        let fontStore = CurriculumStore(defaults: fontDefaults)
        XCTAssertEqual(fontStore.fontScale, 1.0, accuracy: 0.001)
        fontStore.increaseFontScale()
        XCTAssertEqual(fontStore.fontScalePercent, 110)
        fontStore.setFontScale(1.45)
        XCTAssertEqual(fontStore.fontScalePercent, 145)
        let reloadedFontStore = CurriculumStore(defaults: fontDefaults)
        XCTAssertEqual(reloadedFontStore.fontScalePercent, 145)
        reloadedFontStore.setFontScale(9.0) // clamps to max 160%
        XCTAssertEqual(reloadedFontStore.fontScalePercent, 160)
        reloadedFontStore.resetFontScale()
        XCTAssertEqual(reloadedFontStore.fontScalePercent, 100)
        engine.setAccent(for: "english", accentCode: "en-AU")
        engine.setAccent(for: "german", accentCode: "de-CH")
        XCTAssertEqual(engine.activeAccentCode(for: "english"), "en-AU")
        XCTAssertEqual(engine.activeAccentCode(for: "german"), "de-CH")

        let reloaded = NativeAudioEngine(defaults: defaults)
        XCTAssertEqual(reloaded.activeAccentCode(for: "english"), "en-AU")
        XCTAssertEqual(reloaded.activeAccentCode(for: "german"), "de-CH")

        let prompt = NativeAudioEngine.buildNeuralInstructions(accentCode: "de-AT", style: .tutor, slow: true)
        XCTAssertTrue(prompt.contains("Austrian"))
        XCTAssertTrue(prompt.contains("0.8x"))

        let phrases = NativeAudioEngine.splitIntoNaturalPhrases("Guten Tag! Heute sprechen wir über moderne Verkehrskonzepte in großen Städten. Einerseits sparen Züge viel Zeit. Andererseits müssen Tickets bezahlbar bleiben.")
        XCTAssertGreaterThanOrEqual(phrases.count, 2)
    }

    func testGeminiTTSPayloadsElevenLabsDiskCacheAndAdaptiveTurnPauses() throws {
        // 1. Legacy VoiceSettings JSON without reuseGeminiKey decodes cleanly
        let legacyVoiceJSON = """
        {"provider":"openai","accents":{"english":"en-GB"},"preferredSystemVoices":{},"rateMultiplier":1.0,"speakingStyle":"natural","endpoint":"https://api.openai.com/v1/audio/speech","apiKey":"","model":"gpt-4o-mini-tts","neuralVoice":"coral","reuseOpenAIKey":true}
        """
        let decodedLegacy = try JSONDecoder().decode(VoiceSettings.self, from: Data(legacyVoiceJSON.utf8))
        XCTAssertTrue(decodedLegacy.reuseGeminiKey)
        XCTAssertEqual(decodedLegacy.provider, .openai)

        // 2. Shared Gemini key reuse
        let defaults = UserDefaults(suiteName: "LinguaVerveGeminiVoiceTests.\(UUID().uuidString)")!
        let aiCfg = AIProviderConfig(provider: .gemini, apiKey: "test-gemini-placeholder-key", enabled: true)
        defaults.set(try JSONEncoder().encode(aiCfg), forKey: "linguaverve.apple.aiConfig.v1")

        let tempCacheDir = FileManager.default.temporaryDirectory
            .appendingPathComponent("LinguaVerveAudioCacheTest-\(UUID().uuidString)", isDirectory: true)
        defer { try? FileManager.default.removeItem(at: tempCacheDir) }

        let engine = NativeAudioEngine(defaults: defaults, cacheDirectory: tempCacheDir)
        var geminiSettings = VoiceSettings()
        geminiSettings.provider = .gemini
        geminiSettings.endpoint = VoiceProviderType.gemini.defaultEndpoint
        geminiSettings.model = VoiceProviderType.gemini.defaultModel
        geminiSettings.neuralVoice = "Aoede"
        geminiSettings.reuseGeminiKey = true
        XCTAssertEqual(engine.effectiveAPIKey(for: geminiSettings), "test-gemini-placeholder-key")
        XCTAssertTrue(engine.isNeuralProviderReady(for: geminiSettings))

        // 3. WAV header + sample rate parsing + endpoint resolution
        XCTAssertEqual(NativeAudioEngine.parseSampleRate(from: "audio/L16;codec=pcm;rate=24000"), 24000)
        XCTAssertEqual(NativeAudioEngine.parseSampleRate(from: "audio/L16;rate=16000"), 16000)
        let pcm = Data([1, 2, 3, 4])
        let wav = NativeAudioEngine.wrapPCM16AsWAV(pcm, sampleRate: 24000, channels: 1)
        XCTAssertEqual(wav.count, 48)
        XCTAssertEqual(String(data: wav.subdata(in: 0..<4), encoding: .ascii), "RIFF")
        XCTAssertEqual(String(data: wav.subdata(in: 8..<12), encoding: .ascii), "WAVE")
        XCTAssertEqual(String(data: wav.subdata(in: 36..<40), encoding: .ascii), "data")

        let resolvedURL = NativeAudioEngine.resolveGeminiTTSEndpoint(
            "https://generativelanguage.googleapis.com/v1beta/models",
            model: "gemini-2.5-flash-preview-tts"
        )
        XCTAssertEqual(
            resolvedURL?.absoluteString,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent"
        )

        // 4. Multi-speaker Gemini body
        let turns = NativeAudioEngine.parseDialogueTurns("Clara: Hallo Lukas!\nLukas: Hallo Clara!")
        let multiBody = NativeAudioEngine.buildGeminiTTSRequestBody(
            text: "",
            accentCode: "de-DE",
            style: .conversational,
            slow: false,
            voice: "Aoede",
            dialogueTurns: turns,
            secondaryVoice: "Charon"
        )
        let genCfg = multiBody["generationConfig"] as? [String: Any]
        let speechCfg = genCfg?["speechConfig"] as? [String: Any]
        let multiCfg = speechCfg?["multiSpeakerVoiceConfig"] as? [String: Any]
        let speakerCfgs = multiCfg?["speakerVoiceConfigs"] as? [[String: Any]]
        XCTAssertEqual(speakerCfgs?.count, 2)
        XCTAssertEqual(speakerCfgs?[0]["speaker"] as? String, "Clara")
        XCTAssertEqual(speakerCfgs?[1]["speaker"] as? String, "Lukas")

        // 5. ElevenLabs v3 omits speed, Flash v2.5 includes speed & context
        let flashBody = NativeAudioEngine.buildElevenLabsRequestBody(
            text: "Ja!",
            model: "eleven_flash_v2_5",
            style: .conversational,
            speed: 0.85,
            accentCode: "de-AT",
            previousText: "Bereit?",
            nextText: "Los!"
        )
        let flashVS = flashBody["voice_settings"] as? [String: Any]
        XCTAssertEqual(flashVS?["speed"] as? Double ?? 0, 0.85, accuracy: 0.01)
        XCTAssertEqual(flashBody["previous_text"] as? String, "Bereit?")
        XCTAssertEqual(flashBody["next_text"] as? String, "Los!")

        let v3Body = NativeAudioEngine.buildElevenLabsRequestBody(
            text: "Hello",
            model: "eleven_v3",
            style: .tutor,
            speed: 0.80,
            accentCode: "en-GB"
        )
        let v3VS = v3Body["voice_settings"] as? [String: Any]
        XCTAssertNil(v3VS?["speed"])

        // 6. Adaptive turn pauses
        XCTAssertEqual(NativeAudioEngine.naturalTurnPauseSeconds(previousText: "Oh, super!", nextText: "Next", slow: false), 0.12, accuracy: 0.001)
        XCTAssertEqual(NativeAudioEngine.naturalTurnPauseSeconds(previousText: "Wann fährt der Zug nach Basel ab?", nextText: "Um zehn", slow: false), 0.20, accuracy: 0.001)
        XCTAssertEqual(NativeAudioEngine.naturalTurnPauseSeconds(previousText: "Oh, super!", nextText: "Next", slow: true), 0.15, accuracy: 0.001)

        // 7. Persistent disk cache read/write/clear across instances + voice cache invalidation
        engine.storeInCache(key: "unit-test-audio-key", data: wav)
        XCTAssertEqual(engine.audioCacheStats().fileCount, 1)

        let secondEngine = NativeAudioEngine(defaults: defaults, cacheDirectory: tempCacheDir)
        XCTAssertEqual(secondEngine.loadFromCache(key: "unit-test-audio-key"), wav)
        secondEngine.clearAudioCache()
        XCTAssertEqual(secondEngine.audioCacheStats().fileCount, 0)
        secondEngine.invalidateVoiceCache()
    }

    func testMultiPartRealWorldExamsDecodeWithOfficialGradesAndRubrics() {
        let store = makeTestStore()
        XCTAssertEqual(store.bundle.mockExams.count, 24)

        for exam in store.bundle.mockExams {
            XCTAssertEqual(exam.requireAllSkillsPass, true, "Expected modular pass gate on \(exam.id)")

            let readParts = exam.reading.resolvedParts
            XCTAssertEqual(readParts.count, 3, "Expected 3 reading parts in \(exam.id)")
            XCTAssertEqual(readParts.reduce(0) { $0 + $1.questions.count }, 9, "Expected 9 reading items in \(exam.id)")

            let tracks = exam.listening.resolvedTracks
            XCTAssertEqual(tracks.count, 3, "Expected 3 listening tracks in \(exam.id)")
            XCTAssertEqual(tracks.reduce(0) { $0 + $1.questions.count }, 9, "Expected 9 listening items in \(exam.id)")
            let accents = Set(tracks.compactMap(\.accentCode))
            let minAccents = exam.languageId == "japanese" ? 1 : 2
            XCTAssertGreaterThanOrEqual(accents.count, minAccents, "Expected regional accent(s) in \(exam.id)")
            for track in tracks {
                let turns = NativeAudioEngine.parseDialogueTurns(track.audioScript)
                XCTAssertGreaterThanOrEqual(turns.count, 4, "Expected multi-turn human conversation in \(track.id)")
                let distinctSpeakers = Set(turns.map(\.speakerIndex))
                XCTAssertGreaterThanOrEqual(distinctSpeakers.count, 2, "Expected >=2 speakers in \(track.id)")
            }

            let tasks = exam.writing.resolvedTasks
            XCTAssertEqual(tasks.count, 2, "Expected 2 writing tasks in \(exam.id)")
            XCTAssertEqual(tasks.reduce(0) { $0 + $1.weightPercent }, 100, "Expected writing weights summing to 100 in \(exam.id)")

            let speakParts = exam.speaking.resolvedParts
            XCTAssertEqual(speakParts.count, 3, "Expected 3 speaking parts in \(exam.id)")
            for part in speakParts {
                XCTAssertFalse((part.examinerPromptAudio ?? "").isEmpty, "Missing examiner prompt audio in \(part.id)")
            }
        }

        let dePass = MockExam.officialGradeLabel(languageId: "german", level: .B2, overallScore: 86, allModulesPassed: true, passingScorePercent: 60)
        XCTAssertTrue(dePass.contains("Goethe/telc: gut"))

        let deFail = MockExam.officialGradeLabel(languageId: "german", level: .B2, overallScore: 82, allModulesPassed: false, passingScorePercent: 60)
        XCTAssertTrue(deFail.contains("nicht bestanden"))

        let enPass = MockExam.officialGradeLabel(languageId: "english", level: .C1, overallScore: 88, allModulesPassed: true, passingScorePercent: 65)
        XCTAssertTrue(enPass.contains("Cambridge Grade A") && enPass.contains("Est. IELTS"))

        let frPass = MockExam.officialGradeLabel(languageId: "french", level: .B2, overallScore: 86, allModulesPassed: true, passingScorePercent: 60)
        XCTAssertTrue(frPass.contains("DELF B2: Mention Très Bien"))

        let jaPass = MockExam.officialGradeLabel(languageId: "japanese", level: .B2, overallScore: 80, allModulesPassed: true, passingScorePercent: 60)
        XCTAssertTrue(jaPass.contains("JLPT N2: 合格"))

        // Japanese character-unit counting & offline evaluation
        let jaUnits = LearningLanguage.countUnits(in: "私は毎日日本語を勉強しています。しかし、漢字はとても難しいです。", languageId: "japanese")
        XCTAssertGreaterThanOrEqual(jaUnits, 12)
        let jaOffline = AIClientService.evaluateOffline(
            text: "私は毎日日本語を勉強しています。しかし、漢字と敬語はとても難しいです。そのため、毎日少しずつ練習しています。また、日本のニュースも聞いています。",
            languageId: "japanese",
            level: .B1,
            skill: .writing,
            minWords: 20,
            expectedKeywords: ["日本語", "練習"]
        )
        XCTAssertGreaterThanOrEqual(jaOffline.score, 65)

        // French & Japanese Coach Reply role prefix stripping
        let jaParsed = AIClientService.parseCoachReply("試験官：素晴らしいですね！なぜ日本へ行きたいですか。[COACH NOTE: Use 行きたいです instead of 行くたいです.]", skill: .speaking)
        XCTAssertEqual(jaParsed.spokenText, "素晴らしいですね！なぜ日本へ行きたいですか。")
        XCTAssertFalse(jaParsed.spokenText.contains("COACH NOTE"))
        XCTAssertEqual(jaParsed.coachNote, "Use 行きたいです instead of 行くたいです.")

        let rubric = OfficialRubricBreakdown.compute(
            text: "Although remote work increases flexibility, structured in-person workshops remain indispensable for building long-term institutional trust.",
            score: 84,
            minWords: 15,
            expectedKeywords: ["Although", "flexibility", "indispensable"]
        )
        XCTAssertGreaterThanOrEqual(rubric.taskFulfillment, 60)
        XCTAssertGreaterThanOrEqual(rubric.coherenceCohesion, 60)
        XCTAssertGreaterThanOrEqual(rubric.lexicalRange, 60)
        XCTAssertGreaterThanOrEqual(rubric.grammaticalAccuracy, 60)
    }

    func testAIExamGeneratorCreatesFreshMultiPartExamAndPersistsInStore() async throws {
        let defaults = UserDefaults(suiteName: "LinguaVerveAIExamTests.\(UUID().uuidString)")!
        let store = CurriculumStore(defaults: defaults)
        guard let baseExam = store.mockExam(for: "german", level: .B1) else {
            XCTFail("Expected German B1 base exam")
            return
        }

        let readJSON = """
        {"parts":[{"partLabel":"Lesen Teil 1","format":"comprehension","instruction":"Lesen Sie.","passageTitle":"Fahrradstadt Freiburg","passage":"Freiburg baut dieses Jahr zwölf neue Kilometer Radwege aus, damit Pendler sicher und klimafreundlich ins Zentrum fahren können.","questions":[{"prompt":"Was baut Freiburg?","options":["Autobahn","Radwege","Flughafen","Hafen"],"correctIndex":1,"explanation":"Zwölf Kilometer Radwege."},{"prompt":"Für wen?","options":["Piloten","Pendler","Touristen","Kapitäne"],"correctIndex":1,"explanation":"Für Pendler."},{"prompt":"Wie viele Kilometer?","options":["5","12","20","30"],"correctIndex":1,"explanation":"Zwölf Kilometer."}]},{"partLabel":"Lesen Teil 2","format":"true-false","instruction":"Richtig oder Falsch.","passageTitle":"Bürgerbus","passage":"Der neue Elektro-Bürgerbus fährt ab Mai alle zwanzig Minuten kostenlos durch die Altstadt.","questions":[{"prompt":"Der Bus kostet fünf Euro.","options":["Richtig","Falsch","Steht nicht im Text"],"correctIndex":1,"explanation":"Er fährt kostenlos."},{"prompt":"Er fährt ab Mai.","options":["Richtig","Falsch","Steht nicht im Text"],"correctIndex":0,"explanation":"Ab Mai."},{"prompt":"Der Bus hat zwanzig Sitzplätze.","options":["Richtig","Falsch","Steht nicht im Text"],"correctIndex":2,"explanation":"Steht nicht im Text."}]},{"partLabel":"Lesen Teil 3","format":"cloze","instruction":"Wählen Sie.","passageTitle":"Mobilität","passage":"Viele Menschen steigen [1] das Fahrrad um, [2] es gesund ist und [3] Staus vermeidet.","questions":[{"prompt":"Lücke 1","options":["auf","im","bei","mit"],"correctIndex":0,"explanation":"umsteigen auf"},{"prompt":"Lücke 2","options":["weil","aber","oder","denn"],"correctIndex":0,"explanation":"weil + Verb am Ende"},{"prompt":"Lücke 3","options":["viele","viel","vieles","vielen"],"correctIndex":0,"explanation":"viele Staus"}]}]}
        """
        let listenJSON = """
        {"tracks":[{"partLabel":"Hören 1 (DE)","contextNote":"Verkehrsfunk","accentCode":"de-DE","audioScript":"Achtung auf der Linie vier: Wegen Bauarbeiten endet die Straßenbahn heute bereits am Nordplatz und fährt nicht bis zum Hauptbahnhof.","hearingFocusTrap":"Endet am Nordplatz.","questions":[{"prompt":"Welche Linie?","options":["2","4","6","8"],"correctIndex":1,"explanation":"Linie vier."},{"prompt":"Wo endet sie?","options":["Hauptbahnhof","Nordplatz","Südpark","Westtor"],"correctIndex":1,"explanation":"Am Nordplatz."},{"prompt":"Warum?","options":["Streik","Bauarbeiten","Schnee","Fest"],"correctIndex":1,"explanation":"Bauarbeiten."}]},{"partLabel":"Hören 2 (AT)","contextNote":"Wien Durchsage","accentCode":"de-AT","audioScript":"Grüß Gott! Der Zug nach Salzburg hat zehn Minuten Verspätung und fährt heute von Bahnsteig drei statt Bahnsteig eins ab.","hearingFocusTrap":"Bahnsteig 3 statt 1.","questions":[{"prompt":"Wohin fährt der Zug?","options":["Graz","Salzburg","Linz","Innsbruck"],"correctIndex":1,"explanation":"Salzburg."},{"prompt":"Welcher Bahnsteig?","options":["1","2","3","4"],"correctIndex":2,"explanation":"Bahnsteig drei."},{"prompt":"Verspätung?","options":["5 Min","10 Min","15 Min","20 Min"],"correctIndex":1,"explanation":"Zehn Minuten."}]},{"partLabel":"Hören 3 (CH)","contextNote":"Zürich Hinweis","accentCode":"de-CH","audioScript":"Grüezi! Das neue Nachtnetz am Wochenende startet diesen Freitag um ein Uhr morgens mit Halbstundentakt in alle Quartiere.","hearingFocusTrap":"Ab 1 Uhr, Halbstundentakt.","questions":[{"prompt":"Wann startet es?","options":["Donnerstag","Freitag","Sonntag","Montag"],"correctIndex":1,"explanation":"Diesen Freitag."},{"prompt":"Ab welcher Uhrzeit?","options":["23 Uhr","0 Uhr","1 Uhr","2 Uhr"],"correctIndex":2,"explanation":"Ein Uhr morgens."},{"prompt":"Welcher Takt?","options":["10 Min","30 Min","60 Min","90 Min"],"correctIndex":1,"explanation":"Halbstundentakt."}]}]}
        """
        let writeJSON = """
        {"tasks":[{"partLabel":"Schreiben 1 (Leserbrief)","scenario":"Schreiben Sie einen Leserbrief über autofreie Innenstädte.","taskRequirements":["Vorteile nennen","Nachteile nennen","Eigene Meinung begründen"],"weightPercent":40,"keyRubricKeywords":["Innenstadt","Bus","weil","Meinung"],"modelAnswer":"Meiner Meinung nach sind autofreie Innenstädte sinnvoll, weil die Luft sauberer wird und Fußgänger sicherer unterwegs sind. Allerdings braucht man gute Busverbindungen für alle Bewohner."},{"partLabel":"Schreiben 2 (Beschwerde)","scenario":"Schreiben Sie eine Beschwerde an das Verkehrsunternehmen wegen verspäteter Züge.","taskRequirements":["Problem beschreiben","Folgen schildern","Lösung fordern"],"weightPercent":60,"keyRubricKeywords":["Verspätung","Pendler","Erstattung","deshalb"],"modelAnswer":"Sehr geehrte Damen und Herren, seit drei Wochen hat mein Morgenzug täglich zwanzig Minuten Verspätung. Deshalb komme ich oft zu spät zur Arbeit und bitte um zuverlässige Information sowie eine faire Erstattung."}]}
        """
        let speakJSON = """
        {"parts":[{"partLabel":"Sprechen 1 (Mobilität)","instruction":"Wie kommen Sie täglich zur Arbeit?","prepSeconds":15,"speakSeconds":60,"prompts":["Verkehrsmittel","Dauer","Vor- und Nachteile"],"examinerPromptAudio":"Guten Tag! Wie fahren Sie normalerweise zur Arbeit oder Universität?","keyRubricKeywords":["Fahrrad","Zug","schnell"],"modelResponseScript":"Ich fahre meistens zwanzig Minuten mit dem Fahrrad, weil ich flexibel bleibe und keinen Parkplatz suchen muss."},{"partLabel":"Sprechen 2 (Präsentation)","instruction":"Sollte der Nahverkehr kostenlos sein?","prepSeconds":60,"speakSeconds":120,"prompts":["Umwelt","Finanzierung","Persönliche Erfahrung"],"examinerPromptAudio":"Kommen wir zu Ihrer Präsentation über kostenlosen Nahverkehr.","keyRubricKeywords":["Umwelt","Steuern","einerseits"],"modelResponseScript":"Einerseits würde kostenloser Nahverkehr den Autoverkehr stark reduzieren. Andererseits müssen Städte hohe Investitionen in neue Züge über Steuern finanzieren."},{"partLabel":"Sprechen 3 (Nachfrage)","instruction":"Reagieren Sie auf die Nachfrage zu ländlichen Regionen.","prepSeconds":20,"speakSeconds":90,"prompts":["Dorf vs. Stadt","Anrufbusse","Kompromiss"],"examinerPromptAudio":"Aber hilft kostenloser Nahverkehr überhaupt Menschen auf dem Land?","keyRubricKeywords":["Land","Angebot","Kompromiss"],"modelResponseScript":"Auf dem Land ist nicht nur der Preis entscheidend, sondern vor allem der Takt. Flexible Rufbusse wären dort ein sehr sinnvoller Kompromiss."}]}
        """

        let transport = MockAITransport { request in
            let reqBody = String(data: request.httpBody ?? Data(), encoding: .utf8) ?? ""
            let payload: String
            if reqBody.contains("Listening exam author") {
                payload = listenJSON
            } else if reqBody.contains("Writing examiner") {
                payload = writeJSON
            } else if reqBody.contains("Speaking examiner") {
                payload = speakJSON
            } else {
                payload = readJSON
            }
            let escaped = try JSONSerialization.data(withJSONObject: ["choices": [["message": ["content": "```json\n\(payload)\n```"]]]])
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (escaped, resp)
        }

        let service = AIExamGeneratorService(aiClient: AIClientService(transport: transport))
        let cfg = AIProviderConfig(provider: .openai, apiKey: "sk-unit", enabled: true)
        let result = try await service.generateFreshExam(
            config: cfg,
            baseExam: baseExam,
            customTopic: "Nachhaltige Mobilität"
        )

        XCTAssertEqual(result.aiSkillsCount, 4)
        XCTAssertEqual(result.exam.aiGenerated, true)
        XCTAssertEqual(result.exam.generatedTheme, "Nachhaltige Mobilität")
        XCTAssertEqual(result.exam.reading.resolvedParts.count, 3)
        XCTAssertEqual(result.exam.reading.resolvedParts.reduce(0) { $0 + $1.questions.count }, 9)
        XCTAssertEqual(result.exam.listening.resolvedTracks.count, 3)
        XCTAssertEqual(result.exam.listening.resolvedTracks.compactMap(\.accentCode), ["de-DE", "de-AT", "de-CH"])
        XCTAssertEqual(result.exam.writing.resolvedTasks.count, 2)
        XCTAssertEqual(result.exam.writing.resolvedTasks.reduce(0) { $0 + $1.weightPercent }, 100)
        XCTAssertEqual(result.exam.speaking.resolvedParts.count, 3)

        // Verify persistence in CurriculumStore across reloads
        store.saveGeneratedExam(result.exam)
        XCTAssertEqual(store.generatedExams(for: "german", level: .B1).count, 1)

        let reloaded = CurriculumStore(defaults: defaults)
        XCTAssertEqual(reloaded.generatedExams(for: "german", level: .B1).first?.id, result.exam.id)

        reloaded.deleteGeneratedExam(id: result.exam.id)
        XCTAssertTrue(reloaded.generatedExams(for: "german", level: .B1).isEmpty)
    }

    func testExamAttemptDetailRoundTripLegacyDecodingAndExamLookup() throws {
        let store = makeTestStore()
        guard let deB1 = store.mockExam(for: "german", level: .B1) else {
            XCTFail("Expected German B1 exam")
            return
        }

        // 1. Rich attempt with questionReviews + writing/speaking notes
        let richAttempt = ExamAttemptRecord(
            id: "attempt-rich-1",
            timestamp: "2026-11-26T10:30:00Z",
            examId: deB1.id,
            examTitle: deB1.title,
            alignedCertificate: deB1.alignedCertificate,
            languageId: "german",
            level: .B1,
            mode: "strict",
            durationUsedSeconds: 1845,
            overallScore: 82,
            passed: true,
            officialGradeLabel: "Goethe/telc: gut (82/100)",
            skills: [
                SkillType.reading.rawValue: SkillExamScore(score: 89, passed: true, feedback: "8/9 correct (P1: 3/3 · P2: 3/3 · P3: 2/3)"),
                SkillType.listening.rawValue: SkillExamScore(score: 78, passed: true, feedback: "7/9 correct"),
                SkillType.writing.rawValue: SkillExamScore(
                    score: 80,
                    passed: true,
                    feedback: "T1 (40%): 82% · T2 (60%): 79%",
                    aiGraded: true,
                    rubric: OfficialRubricBreakdown(taskFulfillment: 84, coherenceCohesion: 80, lexicalRange: 78, grammaticalAccuracy: 79)
                ),
                SkillType.speaking.rawValue: SkillExamScore(
                    score: 81,
                    passed: true,
                    feedback: "Parts: 3/3 — Clear structured delivery",
                    aiGraded: true,
                    rubric: OfficialRubricBreakdown(taskFulfillment: 82, coherenceCohesion: 81, lexicalRange: 80, grammaticalAccuracy: 81)
                )
            ],
            writingSubmission: "[Task 1 · 40%]\nSehr geehrte Damen und Herren...",
            speakingTranscript: "[Part 1: Warm-Up]\nIch fahre jeden Tag mit der Bahn.",
            questionReviews: [
                ExamQuestionReview(
                    id: "q-read-1",
                    skill: "reading",
                    sectionTag: "Reading P1",
                    prompt: "Wann öffnet das Bürgeramt?",
                    chosenOption: "Um 8 Uhr",
                    correctOption: "Um 8 Uhr",
                    isCorrect: true,
                    explanation: "Im Text steht ab acht Uhr."
                ),
                ExamQuestionReview(
                    id: "q-listen-1",
                    skill: "listening",
                    sectionTag: "Listening T2",
                    prompt: "Welcher Bahnsteig?",
                    chosenOption: "Gleis 1",
                    correctOption: "Gleis 3",
                    isCorrect: false,
                    explanation: "Die Durchsage korrigiert auf Gleis drei."
                )
            ],
            writingNotes: ["Check subordinate verb-end order after 'obwohl'."],
            speakingNotes: ["Add one explicit counterargument in Part 2."]
        )

        store.recordExamAttempt(richAttempt)
        let backupJSON = store.exportProgressJSON()
        let restored = makeTestStore()
        try restored.importProgressJSON(backupJSON)

        let decodedRich = try XCTUnwrap(restored.learnerState.examHistory.first)
        XCTAssertEqual(decodedRich.questionReviews?.count, 2)
        XCTAssertEqual(decodedRich.questionReviews?.last?.isCorrect, false)
        XCTAssertEqual(decodedRich.questionReviews?.last?.chosenOption, "Gleis 1")
        XCTAssertEqual(decodedRich.writingNotes, ["Check subordinate verb-end order after 'obwohl'."])
        XCTAssertEqual(decodedRich.speakingNotes, ["Add one explicit counterargument in Part 2."])

        // 2. Exact match lookup for built-in exam + fallback when deleted AI exam ID is queried
        let exactLookup = restored.exam(for: decodedRich)
        XCTAssertEqual(exactLookup?.exam.id, deB1.id)
        XCTAssertEqual(exactLookup?.isExactMatch, true)

        let deletedAIAttempt = ExamAttemptRecord(
            id: "attempt-deleted-ai",
            timestamp: "2026-11-26T11:00:00Z",
            examId: "ai-exam-deleted-999",
            examTitle: "Deleted AI B1 Exam",
            alignedCertificate: deB1.alignedCertificate,
            languageId: "german",
            level: .B1,
            mode: "practice",
            durationUsedSeconds: 600,
            overallScore: 70,
            passed: true,
            skills: decodedRich.skills
        )
        let fallbackLookup = restored.exam(for: deletedAIAttempt)
        XCTAssertEqual(fallbackLookup?.exam.id, deB1.id)
        XCTAssertEqual(fallbackLookup?.isExactMatch, false)

        // 3. Backward-compatible decoding of legacy pre-update JSON lacking new optional fields
        let legacyJSON = """
        {
          "id": "legacy-1",
          "timestamp": "2026-10-01T08:00:00Z",
          "examId": "exam-de-b1",
          "examTitle": "Legacy B1 Exam",
          "alignedCertificate": "Goethe-Zertifikat B1",
          "languageId": "german",
          "level": "B1",
          "mode": "strict",
          "durationUsedSeconds": 1200,
          "overallScore": 74,
          "passed": true,
          "skills": {
            "reading": { "score": 78, "passed": true, "feedback": "7/9", "aiGraded": false }
          }
        }
        """
        let legacyDecoded = try JSONDecoder().decode(ExamAttemptRecord.self, from: Data(legacyJSON.utf8))
        XCTAssertEqual(legacyDecoded.id, "legacy-1")
        XCTAssertNil(legacyDecoded.questionReviews)
        XCTAssertNil(legacyDecoded.writingNotes)
        XCTAssertNil(legacyDecoded.speakingNotes)

        // 4. Individual attempt deletion
        restored.deleteExamAttempt(id: richAttempt.id)
        XCTAssertTrue(restored.learnerState.examHistory.isEmpty)
    }

    func testFourSkillAIExamAssessmentWithConfiguredProviderOfflineFallbackAndPersistence() async throws {
        let store = makeTestStore()
        guard let deB1 = store.mockExam(for: "german", level: .B1) else {
            XCTFail("Expected German B1 exam")
            return
        }

        let attempt = ExamAttemptRecord(
            id: "attempt-4skill-1",
            timestamp: "2026-11-27T09:15:00Z",
            examId: deB1.id,
            examTitle: deB1.title,
            alignedCertificate: deB1.alignedCertificate,
            languageId: "german",
            level: .B1,
            mode: "strict",
            durationUsedSeconds: 1620,
            overallScore: 76,
            passed: true,
            officialGradeLabel: "Goethe/telc: befriedigend (76/100)",
            skills: [
                SkillType.reading.rawValue: SkillExamScore(score: 89, passed: true, feedback: "8/9 correct"),
                SkillType.listening.rawValue: SkillExamScore(score: 56, passed: false, feedback: "5/9 correct"),
                SkillType.writing.rawValue: SkillExamScore(score: 80, passed: true, feedback: "Clear B1 email"),
                SkillType.speaking.rawValue: SkillExamScore(score: 79, passed: true, feedback: "Structured talk")
            ],
            writingSubmission: "Sehr geehrte Damen und Herren, ich gehe heute zu Arzt.",
            speakingTranscript: "Ich fahre jeden Tag mit S-Bahn zur Arbeit.",
            questionReviews: [
                ExamQuestionReview(
                    id: "q-l2",
                    skill: "listening",
                    sectionTag: "Listening T2",
                    prompt: "Welcher Bahnsteig?",
                    chosenOption: "Gleis 1",
                    correctOption: "Gleis 3",
                    isCorrect: false,
                    explanation: "Der Zug wurde auf Gleis drei verlegt."
                )
            ]
        )

        // 1. Offline fallback when AI provider is disabled
        let offline = await ExamAssessmentService().assessFullExam(
            config: AIProviderConfig(provider: .ollama, enabled: false),
            exam: deB1,
            attempt: attempt
        )
        XCTAssertEqual(offline.source, "offline-rubric")
        XCTAssertEqual(offline.strongestSkill, .reading)
        XCTAssertEqual(offline.prioritySkill, .listening)
        XCTAssertEqual(offline.insight(for: .listening)?.corrections.first?.corrected, "Gleis 3")
        XCTAssertFalse(offline.studyPlan.isEmpty)

        // 2. Live AI 4-skill assessment via configured provider (mocked transport)
        let writingJSON = """
        {"score":82,"cefrEstimate":"B1","rubric":{"taskFulfillment":85,"coherenceCohesion":80,"lexicalRange":78,"grammaticalAccuracy":84},"strengths":["Polite B1 greeting"],"corrections":["zu Arzt -> zum Arzt"],"correctionItems":[{"original":"ich gehe heute zu Arzt","corrected":"ich gehe heute zum Arzt","explanation":"Use dative contraction zum (zu + dem)."}],"suggestions":["Add a clear alternative date."],"upgradedVersion":"Sehr geehrte Damen und Herren, leider muss ich heute zum Arzt gehen.","examinerSummary":"Solid B1 message with one preposition fix."}
        """
        let speakingJSON = """
        {"score":80,"cefrEstimate":"B1","rubric":{"taskFulfillment":82,"coherenceCohesion":79,"lexicalRange":78,"grammaticalAccuracy":81},"strengths":["Natural rhythm"],"corrections":["mit S-Bahn -> mit der S-Bahn"],"correctionItems":[{"original":"mit S-Bahn","corrected":"mit der S-Bahn","explanation":"Keep feminine dative article der after mit."}],"suggestions":["Add einerseits/andererseits contrast."],"upgradedVersion":"Ich fahre jeden Tag mit der S-Bahn zur Arbeit, weil es sehr zuverlässig ist.","examinerSummary":"Clear B1 oral fluency."}
        """
        let holisticJSON = """
        {"overallSummary":"Strong reading and writing; focus next on Listening Track 2 platform corrections.","readinessVerdict":"Strong Progress — Focus on Listening","reading":{"cefrEstimate":"B2","summary":"Accurate detail scanning across passages.","strengths":["Strong comprehension"],"weaknesses":[],"corrections":[],"suggestions":["Keep drilling C1 connectors."]},"listening":{"cefrEstimate":"A2","summary":"Missed mid-announcement platform switch in Track 2.","strengths":["Understood main context"],"weaknesses":["Missed Gleis 1 -> Gleis 3 self-correction"],"corrections":[{"sectionTag":"Listening T2","original":"Gleis 1","corrected":"Gleis 3","explanation":"Listen for verlegt/geändert revision cues."}],"suggestions":["Shadow-read DACH transit dialogues."]},"writing":{"summary":"Solid formal register with minor dative contraction slip.","strengths":["Clear task coverage"],"weaknesses":["Dative contraction zum/zur"],"corrections":[],"suggestions":["Proofread preposition contractions."]},"speaking":{"summary":"Confident daily speech with minor article omission.","strengths":["Good pacing"],"weaknesses":["Article after mit"],"corrections":[],"suggestions":["Practice 60s structured contrasts."]},"studyPlan":[{"priority":1,"skill":"listening","title":"Drill Transit Corrections","action":"Replay Track 2 without transcript and log every changed detail.","targetMinutes":20}]}
        """

        let transport = MockAITransport { request in
            let reqBody = String(data: request.httpBody ?? Data(), encoding: .utf8) ?? ""
            let payload: String
            if reqBody.contains("Chief Examiner") {
                payload = holisticJSON
            } else if reqBody.contains("candidate's speaking") {
                payload = speakingJSON
            } else {
                payload = writingJSON
            }
            let escaped = try JSONSerialization.data(withJSONObject: ["choices": [["message": ["content": payload]]]])
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (escaped, resp)
        }

        let service = ExamAssessmentService(aiClient: AIClientService(transport: transport))
        let aiCfg = AIProviderConfig(provider: .openai, apiKey: "sk-test-4skill", enabled: true)
        let aiAssessment = await service.assessFullExam(config: aiCfg, exam: deB1, attempt: attempt)

        XCTAssertEqual(aiAssessment.source, "ai")
        XCTAssertEqual(aiAssessment.readinessVerdict, "Strong Progress — Focus on Listening")
        XCTAssertEqual(aiAssessment.insight(for: .reading)?.aiAnalyzed, true)
        XCTAssertEqual(aiAssessment.insight(for: .listening)?.corrections.first?.corrected, "Gleis 3")
        XCTAssertEqual(aiAssessment.insight(for: .writing)?.corrections.first?.corrected, "ich gehe heute zum Arzt")
        XCTAssertEqual(aiAssessment.insight(for: .writing)?.upgradedVersion, "Sehr geehrte Damen und Herren, leider muss ich heute zum Arzt gehen.")
        XCTAssertEqual(aiAssessment.insight(for: .speaking)?.upgradedVersion, "Ich fahre jeden Tag mit der S-Bahn zur Arbeit, weil es sehr zuverlässig ist.")
        XCTAssertEqual(aiAssessment.studyPlan.first?.skill, .listening)

        // 3. Persist updated AI assessment onto existing history attempt & round-trip via JSON backup
        store.recordExamAttempt(attempt)
        let updated = store.updateExamAttemptAssessment(attemptId: attempt.id, assessment: aiAssessment)
        XCTAssertEqual(updated?.aiAssessment?.readinessVerdict, "Strong Progress — Focus on Listening")
        XCTAssertEqual(updated?.skills[SkillType.listening.rawValue]?.aiGraded, true)

        let seed = ExamAssessmentService.buildCoachSeedPrompt(attempt: try XCTUnwrap(updated), skill: .listening)
        XCTAssertTrue(seed.contains("Gleis 1 → Gleis 3"))

        let backup = store.exportProgressJSON()
        let restored = makeTestStore()
        try restored.importProgressJSON(backup)
        XCTAssertEqual(restored.learnerState.examHistory.first?.aiAssessment?.studyPlan.first?.title, "Drill Transit Corrections")
    }

    func testClozeGapAutoRepairAndFallbackForAIGeneratedReadingPart3() async throws {
        let questions = [
            ExamObjectiveQuestion(id: "q1", prompt: "Lücke [1]", options: ["am", "im", "um", "auf"], correctIndex: 0, explanation: "am Montag"),
            ExamObjectiveQuestion(id: "q2", prompt: "Lücke [2]", options: ["bei", "aus", "nach", "über"], correctIndex: 0, explanation: "bei Dr. Weber"),
            ExamObjectiveQuestion(id: "q3", prompt: "Lücke [3]", options: ["obwohl", "aber", "oder", "denn"], correctIndex: 0, explanation: "obwohl")
        ]

        // 1. Plain text where LLM forgot to blank the answer words
        let plain = AIExamGeneratorService.repairClozePassage(
            "Guten Tag, ich möchte am Montag einen Termin bei Dr. Weber vereinbaren, obwohl ich wenig Zeit habe.",
            questions: questions
        )
        XCTAssertTrue(plain.hasAllGaps)
        XCTAssertTrue(plain.passage.contains("[1]"))
        XCTAssertTrue(plain.passage.contains("[2]"))
        XCTAssertTrue(plain.passage.contains("[3]"))
        XCTAssertFalse(plain.passage.contains(" obwohl "))

        // 2. Alternate blank markers (1), ___(2)___, and anonymous ____
        let alt = AIExamGeneratorService.repairClozePassage(
            "Guten Tag, ich möchte (1) Montag einen Termin ___(2)___ Dr. Weber vereinbaren, ____ ich wenig Zeit habe.",
            questions: questions
        )
        XCTAssertTrue(alt.hasAllGaps)
        XCTAssertEqual(
            alt.passage,
            "Guten Tag, ich möchte [1] Montag einen Termin [2] Dr. Weber vereinbaren, [3] ich wenig Zeit habe."
        )

        // 3. Unrecoverable gap-less Part 3 in an AI exam falls back to verified base exam Cloze part
        let store = makeTestStore()
        guard let baseExam = store.mockExam(for: "german", level: .B1) else {
            XCTFail("Expected German B1 base exam")
            return
        }
        let brokenPart3 = ReadingExamPart(
            id: "broken-p3",
            partLabel: "Broken Cloze",
            format: "cloze",
            instruction: "Ergänzen Sie.",
            passageTitle: "Unrelated Text",
            passage: "Heute scheint die Sonne sehr hell über den Bergen im Süden und das Wetter bleibt freundlich.",
            questions: questions
        )
        let brokenExam = MockExam(
            id: "ai-broken-cloze",
            languageId: baseExam.languageId,
            level: baseExam.level,
            title: "AI Broken Cloze",
            alignedCertificate: baseExam.alignedCertificate,
            passingScorePercent: baseExam.passingScorePercent,
            totalMinutes: baseExam.totalMinutes,
            reading: ReadingExamSection(
                title: baseExam.reading.title,
                durationMinutes: baseExam.reading.durationMinutes,
                passageTitle: baseExam.reading.passageTitle,
                passage: baseExam.reading.passage,
                questions: baseExam.reading.questions,
                parts: [baseExam.reading.resolvedParts[0], baseExam.reading.resolvedParts[1], brokenPart3]
            ),
            listening: baseExam.listening,
            writing: baseExam.writing,
            speaking: baseExam.speaking
        )
        let fixedExam = AIExamGeneratorService.repairExamClozeParts(brokenExam, fallbackBase: baseExam)
        let fixedPart3 = fixedExam.reading.resolvedParts[2]
        XCTAssertEqual(fixedPart3.id, baseExam.reading.resolvedParts[2].id)
        XCTAssertTrue(fixedPart3.passage.contains("[1]"))
    }

    func testExamHistoryRealExamReadinessAdvisorOfflineAIAndPersistence() async throws {
        func makeAttempt(id: String, date: String, mode: String, r: Int, l: Int, w: Int, s: Int) -> ExamAttemptRecord {
            let overall = Int((Double(r + l + w + s) / 4.0).rounded())
            let passed = overall >= 60 && r >= 60 && l >= 60 && w >= 60 && s >= 60
            return ExamAttemptRecord(
                id: id,
                timestamp: date,
                examId: "exam-de-b1",
                examTitle: "Goethe-Zertifikat B1 Simulation",
                alignedCertificate: "Goethe-Zertifikat B1",
                languageId: "german",
                level: .B1,
                mode: mode,
                durationUsedSeconds: 1680,
                overallScore: overall,
                passed: passed,
                skills: [
                    SkillType.reading.rawValue: SkillExamScore(score: r, passed: r >= 60, feedback: "\(r)%"),
                    SkillType.listening.rawValue: SkillExamScore(score: l, passed: l >= 60, feedback: "\(l)%"),
                    SkillType.writing.rawValue: SkillExamScore(score: w, passed: w >= 60, feedback: "\(w)%"),
                    SkillType.speaking.rawValue: SkillExamScore(score: s, passed: s >= 60, feedback: "\(s)%")
                ]
            )
        }

        // 1. Offline: consistent high strict passes -> READY FOR REAL EXAM
        let strongHistory = [
            makeAttempt(id: "s2", date: "2026-11-26T10:00:00Z", mode: "strict", r: 89, l: 82, w: 84, s: 81),
            makeAttempt(id: "s1", date: "2026-11-20T10:00:00Z", mode: "strict", r: 84, l: 78, w: 79, s: 76)
        ]
        let readyOffline = try XCTUnwrap(
            ExamAssessmentService.buildOfflineReadinessReport(attempts: strongHistory, languageId: "german", targetLevel: .B1)
        )
        XCTAssertEqual(readyOffline.verdict, .ready)
        XCTAssertEqual(readyOffline.recentTrend, "improving")
        XCTAssertEqual(readyOffline.strictAttemptsCount, 2)

        // 2. Offline: weak Listening drags modular pass -> NEEDS PRACTICE
        let weakHistory = [
            makeAttempt(id: "w2", date: "2026-11-26T10:00:00Z", mode: "practice", r: 78, l: 48, w: 72, s: 70),
            makeAttempt(id: "w1", date: "2026-11-20T10:00:00Z", mode: "practice", r: 74, l: 52, w: 70, s: 68)
        ]
        let needsPracticeOffline = try XCTUnwrap(
            ExamAssessmentService.buildOfflineReadinessReport(attempts: weakHistory, languageId: "german", targetLevel: .B1)
        )
        XCTAssertEqual(needsPracticeOffline.verdict, .needsPractice)
        XCTAssertEqual(needsPracticeOffline.prioritySkill, .listening)
        XCTAssertTrue(needsPracticeOffline.blockingRisks.contains { $0.contains("Strict-mode") })

        // 3. Configured AI Provider readiness analysis + CurriculumStore persistence
        let aiJSON = """
        {"verdict":"ready","readinessScore":89,"confidence":"high","headline":"Book Your Official Goethe-Zertifikat B1 Exam With Confidence","rationale":"You passed 2 consecutive Strict simulations with rising scores from 79% to 84% and zero skills below 76%.","estimatedPrepTime":"Ready to book now","strengths":["Consistent strict passes across all 4 modules"],"blockingRisks":["Keep practicing Swiss/Austrian accents for Track 3"],"nextSteps":["Register for the next Goethe-Zertifikat B1 date","Do one light strict dress rehearsal 48 hours prior"],"skillNotes":{"reading":"Rock-solid 87% average.","listening":"Improved cleanly to 82%.","writing":"Confident B1 structure.","speaking":"Steady fluency across all 3 parts."}}
        """
        let transport = MockAITransport { request in
            let reqBody = String(data: request.httpBody ?? Data(), encoding: .utf8) ?? ""
            XCTAssertTrue(reqBody.contains("Certification Advisor"))
            XCTAssertTrue(reqBody.contains("CHRONOLOGICAL ATTEMPTS"))
            let escaped = try JSONSerialization.data(withJSONObject: ["choices": [["message": ["content": aiJSON]]]])
            let resp = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: nil)!
            return (escaped, resp)
        }

        let service = ExamAssessmentService(aiClient: AIClientService(transport: transport))
        let cfg = AIProviderConfig(provider: .openai, apiKey: "sk-readiness-unit", enabled: true)
        let rawAIReport = await service.analyzeExamHistoryReadiness(config: cfg, attempts: strongHistory, languageId: "german", targetLevel: .B1)
        let aiReport = try XCTUnwrap(rawAIReport)
        XCTAssertEqual(aiReport.source, "ai")
        XCTAssertEqual(aiReport.verdict, .ready)
        XCTAssertEqual(aiReport.readinessScore, 89)
        XCTAssertEqual(aiReport.headline, "Book Your Official Goethe-Zertifikat B1 Exam With Confidence")
        XCTAssertEqual(aiReport.readiness(for: .listening)?.note, "Improved cleanly to 82%.")

        let store = makeTestStore()
        store.saveReadinessReport(aiReport)
        let backup = store.exportProgressJSON()
        let restored = makeTestStore()
        try restored.importProgressJSON(backup)
        XCTAssertEqual(restored.learnerState.latestReadinessReport?.headline, aiReport.headline)
        XCTAssertEqual(restored.learnerState.latestReadinessReport?.readinessScore, 89)

        let seed = ExamAssessmentService.buildCoachSeedPrompt(from: aiReport)
        XCTAssertTrue(seed.contains("Goethe-Zertifikat B1"))
    }

    func testLanguageAwareAIModelAdvisorRankingAndPerLanguageModelResolution() throws {
        // 1. Installed Ollama models: gemma4:latest must beat coding-specialized models
        let installed = [
            AIModelInfo(id: "deepseek-coder-v2:16b", ownedBy: "ollama"),
            AIModelInfo(id: "gemma4:latest", ownedBy: "ollama"),
            AIModelInfo(id: "qwen3-coder:latest", ownedBy: "ollama")
        ]
        let rankedGerman = AIModelAdvisor.rankFetchedModels(installed, for: .german)
        XCTAssertEqual(rankedGerman.first?.model.id, "gemma4:latest")
        XCTAssertEqual(rankedGerman.first?.tier, .ideal)
        XCTAssertTrue(rankedGerman.last?.isCodingModel == true)
        XCTAssertEqual(rankedGerman.last?.tier, .caution)

        // 2. Language-specific recommendations adapt cleanly to German, Japanese & Polyglot
        let deRecs = AIModelAdvisor.recommendedModels(for: .ollama, language: .german)
        XCTAssertEqual(deRecs.first?.modelId, "mistral-small3.1")
        XCTAssertEqual(deRecs.first?.pullCommand, "ollama pull mistral-small3.1")

        let jpRecs = AIModelAdvisor.recommendedModels(for: .ollama, language: .japanese)
        XCTAssertEqual(jpRecs.first?.modelId, "qwen3:14b")

        let polyRecs = AIModelAdvisor.recommendedModels(for: .ollama, language: .all)
        XCTAssertEqual(polyRecs.first?.modelId, "qwen3:14b")

        // 3. Per-language pinned model overrides resolve automatically & persist via Codable
        let cfg = AIProviderConfig(
            provider: .ollama,
            model: "gemma4:latest",
            enabled: true,
            languageModels: ["german": "mistral-small3.1", "japanese": "qwen3:14b"]
        )
        XCTAssertEqual(cfg.resolved(for: "german").model, "mistral-small3.1")
        XCTAssertEqual(cfg.resolved(for: "japanese").model, "qwen3:14b")
        XCTAssertEqual(cfg.resolved(for: "english").model, "gemma4:latest")

        let encoded = try JSONEncoder().encode(cfg)
        let decoded = try JSONDecoder().decode(AIProviderConfig.self, from: encoded)
        XCTAssertEqual(decoded.resolved(for: "german").model, "mistral-small3.1")
    }

    func testCoachReplyParserSeparatesPureSpokenAudioFromCoachNotesAndRolePrefixes() {
        // 1. Exact real-world mixed German/English Speaking Coach reply
        let mixedSample = #"**Examiner:** Ah, der CMC Mercedes-Benz SLA 2003! Das ist ja ein schöner Klassiker. Warum hast du dich gerade für dieses Modell entschieden, als du angefangen hast zu sammeln? [COACH NOTE: Replace "Lieblingsmutter" with "Lieblingsmodell" for correct German. Consider replacing "Modemodell" with "Modell" for correct German.]"#

        let parsedMixed = AIClientService.parseCoachReply(mixedSample, skill: .speaking)
        XCTAssertEqual(parsedMixed.speakerLabel, "Examiner")
        XCTAssertEqual(
            parsedMixed.spokenText,
            "Ah, der CMC Mercedes-Benz SLA 2003! Das ist ja ein schöner Klassiker. Warum hast du dich gerade für dieses Modell entschieden, als du angefangen hast zu sammeln?"
        )
        XCTAssertFalse(parsedMixed.spokenText.contains("Examiner"))
        XCTAssertFalse(parsedMixed.spokenText.contains("COACH NOTE"))
        XCTAssertFalse(parsedMixed.spokenText.contains("Replace"))
        XCTAssertFalse(parsedMixed.spokenText.contains("*"))
        XCTAssertEqual(parsedMixed.displayBody, parsedMixed.spokenText)
        XCTAssertEqual(
            parsedMixed.coachNote,
            #"Replace "Lieblingsmutter" with "Lieblingsmodell" for correct German. Consider replacing "Modemodell" with "Modell" for correct German."#
        )

        // 2. Multiline [COACH NOTE] with stage direction & markdown bold
        let multilineSample = """
        **Prüferin:** *(lächelt freundlich)* Das klingt wirklich **spannend**! Seit wann sammelst du Oldtimer?

        ---
        [COACH NOTE]
        - Use **"seit drei Jahren"** instead of "für drei Jahre".
        """
        let parsedMulti = AIClientService.parseCoachReply(multilineSample, skill: .speaking)
        XCTAssertEqual(parsedMulti.speakerLabel, "Prüferin")
        XCTAssertEqual(parsedMulti.spokenText, "Das klingt wirklich spannend! Seit wann sammelst du Oldtimer?")
        XCTAssertTrue(parsedMulti.coachNote?.contains("seit drei Jahren") == true)
        XCTAssertFalse(parsedMulti.coachNote?.contains("**") == true)

        // 3. Heading-style **Coach Note:** plus English Translation block
        let headingSample = """
        Examiner: Hallo! Welche Musik hörst du gern?

        Translation: Hello! What music do you like listening to?

        **Coach Note:** Put the verb at the end after "weil".
        """
        let parsedHeading = AIClientService.parseCoachReply(headingSample, skill: .speaking)
        XCTAssertEqual(parsedHeading.spokenText, "Hallo! Welche Musik hörst du gern?")
        XCTAssertTrue(parsedHeading.coachNote?.contains("Put the verb at the end") == true)
        XCTAssertTrue(parsedHeading.coachNote?.contains("Translation: Hello! What music do you like listening to?") == true)

        // 4. Listening [AUDIO SCRIPT] keeps clean multi-speaker lines & excludes English focus/questions from TTS
        let listeningSample = """
        [AUDIO SCRIPT]
        **Clara:** Hey Lukas, treffen wir uns um halb acht am Bahnhof?
        **Lukas:** Halb acht wird knapp, mein Bus kommt erst um zwanzig vor acht an.

        [HEARING FOCUS]
        Notice "halb acht" (7:30) vs. "zwanzig vor acht" (7:40).

        [QUESTIONS]
        1. Wann schlägt Clara das Treffen vor?
        """
        let parsedListening = AIClientService.parseCoachReply(listeningSample, skill: .listening)
        XCTAssertEqual(
            parsedListening.audioScript,
            "Clara: Hey Lukas, treffen wir uns um halb acht am Bahnhof?\nLukas: Halb acht wird knapp, mein Bus kommt erst um zwanzig vor acht an."
        )
        XCTAssertEqual(parsedListening.spokenText, parsedListening.audioScript)
        XCTAssertFalse(parsedListening.spokenText.contains("HEARING FOCUS"))
        XCTAssertFalse(parsedListening.spokenText.contains("Notice"))
        XCTAssertTrue(parsedListening.displayBody.contains("[QUESTIONS]"))

        // 5. Writing rubric headings like **Corrections:** remain untouched in writing mode
        let writingSample = "**Score: 84/100**\n**Corrections:** Use \"weil\" with verb-final word order."
        let parsedWriting = AIClientService.parseCoachReply(writingSample, skill: .writing)
        XCTAssertTrue(parsedWriting.displayBody.contains("Corrections:"))
        XCTAssertNil(parsedWriting.coachNote)

        // 6. Speaking system prompt enforces pure spoken target language & separated [COACH NOTE]
        let speakingPrompt = AIClientService.buildCoachSystemPrompt(languageId: "german", level: .B1, skill: .speaking)
        XCTAssertTrue(speakingPrompt.contains("100% pure, natural spoken German"))
        XCTAssertTrue(speakingPrompt.contains("NEVER include role prefixes"))
        XCTAssertTrue(speakingPrompt.contains("[COACH NOTE]"))
    }
}
