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

final class AcademyAndAITests: XCTestCase {

    private func makeTestStore() -> CurriculumStore {
        let defaults = UserDefaults(suiteName: "LinguaVerveAcademyTests.\(UUID().uuidString)")!
        return CurriculumStore(defaults: defaults)
    }

    func testCurriculumIncludesAll12IntensiveCoursesExamReferencesPreTestsAndMockExams() {
        let store = makeTestStore()

        XCTAssertEqual(store.bundle.intensiveCourses.count, 12)
        XCTAssertEqual(store.courses(for: "english").map(\.level), CEFRLevel.allCases)
        XCTAssertEqual(store.courses(for: "german").map(\.level), CEFRLevel.allCases)

        XCTAssertGreaterThanOrEqual(store.bundle.examReferences.count, 20)
        for ref in store.bundle.examReferences {
            XCTAssertTrue(ref.url.hasPrefix("https://"), "Expected HTTPS reference URL: \(ref.url)")
        }

        XCTAssertEqual(store.preTestQuestions(for: "english").count, 12)
        XCTAssertEqual(store.preTestQuestions(for: "german").count, 12)
        XCTAssertEqual(store.bundle.mockExams.count, 12)
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
}
