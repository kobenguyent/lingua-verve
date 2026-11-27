import Foundation
import Observation

#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

@Observable
public final class CurriculumStore {
    public private(set) var bundle: CurriculumBundle

    // Active Workspace & Shared Navigation Context (MacBook, iPad, iPhone)
    public var activeWorkspace: WorkspaceSection = .courses
    public var courseLanguageId: String = "german"
    public var courseLevel: CEFRLevel = .A1
    public var activeLessonModuleId: String? = nil
    public var examTargetLevel: CEFRLevel = .B1
    public var aiCoachLevel: CEFRLevel = .B1
    public var aiCoachSkill: SkillType = .speaking
    public var aiCoachSeedPrompt: String = ""

    // Field Manual Filters
    public var activeLanguageId: String = "all"
    public var activeLevel: String = "ALL"
    public var selectedCategory: String = "all"
    public var searchQuery: String = ""
    public var viewMode: ViewModeFilter = .all
    public var selectedTipId: String?

    // Persistent User Progress (Field Manual + Full Intensive Academy)
    public private(set) var bookmarkedIds: Set<String>
    public private(set) var masteredIds: Set<String>
    public private(set) var learnerState: LearnerProgressState
    public private(set) var generatedExams: [MockExam] = []
    public var aiConfig: AIProviderConfig

    // Overall App Typography Scale (0.85x – 1.60x, persisted across launches)
    public static let fontScalePresets: [(label: String, scale: Double)] = [
        ("Compact", 0.90),
        ("Default", 1.00),
        ("Comfortable", 1.15),
        ("Large", 1.30),
        ("Extra Large", 1.45),
        ("Jumbo", 1.60)
    ]
    public static let minFontScale: Double = 0.85
    public static let maxFontScale: Double = 1.60
    public var fontScale: Double = 1.0 {
        didSet {
            let clamped = Self.clampFontScale(fontScale)
            if abs(clamped - fontScale) > 0.001 {
                fontScale = clamped
                return
            }
            defaults.set(clamped, forKey: fontScaleKey)
        }
    }

    // Software Update State (GitHub Releases — MacBook / iPad / iPhone)
    public let currentAppVersion: String
    public var autoCheckForUpdates: Bool {
        didSet {
            defaults.set(autoCheckForUpdates, forKey: autoUpdateKey)
        }
    }
    public var autoInstallAfterDownload: Bool {
        didSet {
            defaults.set(autoInstallAfterDownload, forKey: autoInstallKey)
        }
    }
    public var isCheckingForUpdates: Bool = false
    public var availableUpdate: AvailableAppUpdate?
    public var latestKnownVersion: String?
    public var latestReleaseName: String?
    public var latestReleaseNotes: String?
    public var latestReleaseURL: String?
    public var latestReleaseAsset: GitHubReleaseAsset?
    public var latestChecksumsAsset: GitHubReleaseAsset?
    public var lastUpdateCheckDate: Date?
    public var updateCheckError: String?
    public var isUpdateSheetPresented: Bool = false
    public var isUpdateBannerDismissed: Bool = false
    public var updateDownloadState: UpdateDownloadState = .idle

    private var cachedReleaseETag: String?
    private let updateService: any UpdateServiceProtocol
    private let terminateAppHandler: @MainActor () -> Void
    private let terminationDelayMs: UInt64
    private let defaults: UserDefaults
    @ObservationIgnored private let persistSynchronously: Bool
    @ObservationIgnored private let persistQueue = DispatchQueue(label: "com.linguaverve.store.persistence", qos: .utility)

    // Pre-indexed O(1) lookup tables (rebuilt when bundle or learnerState changes)
    @ObservationIgnored private var coursesByLanguage: [String: [IntensiveCourse]] = [:]
    @ObservationIgnored private var courseByKey: [String: IntensiveCourse] = [:]
    @ObservationIgnored private var examReferencesById: [String: OfficialExamReference] = [:]
    @ObservationIgnored private var examReferencesByLanguage: [String: [OfficialExamReference]] = [:]
    @ObservationIgnored private var completedModuleIdSet: Set<String> = []
    @ObservationIgnored private var enrolledCourseIdSet: Set<String> = []
    private static let gregorianCalendar = Calendar(identifier: .gregorian)
    private let bookmarksKey = "linguaverve.macos.bookmarks"
    private let masteredKey = "linguaverve.macos.mastered"
    private let autoUpdateKey = "linguaverve.macos.autoCheckForUpdates"
    private let autoInstallKey = "linguaverve.macos.autoInstallAfterDownload"
    private let learnerStateKey = "linguaverve.apple.learnerState.v1"
    private let aiConfigKey = "linguaverve.apple.aiConfig.v1"
    private let generatedExamsKey = "linguaverve.apple.generatedExams.v1"
    private let fontScaleKey = "linguaverve.apple.fontScale.v1"

    public init(
        bundle: CurriculumBundle? = nil,
        defaults: UserDefaults = .standard,
        updateService: any UpdateServiceProtocol = UpdateService(),
        currentAppVersion: String = SemanticVersion.currentAppVersion(),
        terminationDelayMs: UInt64 = 250,
        persistSynchronously: Bool? = nil,
        terminateAppHandler: (@MainActor () -> Void)? = nil
    ) {
        self.defaults = defaults
        self.persistSynchronously = persistSynchronously ?? (defaults !== UserDefaults.standard)
        self.updateService = updateService
        self.currentAppVersion = SemanticVersion.normalize(currentAppVersion)
        self.terminationDelayMs = terminationDelayMs
        self.terminateAppHandler = terminateAppHandler ?? {
            #if os(macOS)
            NSApplication.shared.terminate(nil)
            #endif
        }
        if defaults.object(forKey: autoUpdateKey) == nil {
            self.autoCheckForUpdates = true
        } else {
            self.autoCheckForUpdates = defaults.bool(forKey: autoUpdateKey)
        }
        if defaults.object(forKey: autoInstallKey) == nil {
            self.autoInstallAfterDownload = true
        } else {
            self.autoInstallAfterDownload = defaults.bool(forKey: autoInstallKey)
        }
        let loaded = bundle ?? Self.loadDefaultBundle()
        self.bundle = loaded
        self.bookmarkedIds = Set(defaults.stringArray(forKey: bookmarksKey) ?? [])
        self.masteredIds = Set(defaults.stringArray(forKey: masteredKey) ?? [])
        self.selectedTipId = loaded.tips.first?.id

        if let data = defaults.data(forKey: learnerStateKey),
           let decoded = try? JSONDecoder().decode(LearnerProgressState.self, from: data) {
            self.learnerState = decoded
        } else {
            self.learnerState = LearnerProgressState()
        }

        if defaults.object(forKey: fontScaleKey) != nil {
            self.fontScale = Self.clampFontScale(defaults.double(forKey: fontScaleKey))
        } else {
            self.fontScale = 1.0
        }

        if let genData = defaults.data(forKey: generatedExamsKey),
           let decodedGen = try? JSONDecoder().decode([MockExam].self, from: genData) {
            self.generatedExams = decodedGen.map { exam in
                let fallback = loaded.mockExams.first { $0.languageId == exam.languageId && $0.level == exam.level }
                return AIExamGeneratorService.repairExamClozeParts(exam, fallbackBase: fallback)
            }
        } else {
            self.generatedExams = []
        }

        if let aiData = defaults.data(forKey: aiConfigKey),
           let decodedAI = try? JSONDecoder().decode(AIProviderConfig.self, from: aiData) {
            self.aiConfig = decodedAI
        } else if LiveAppleFoundationModelBackend().availability().isAvailable {
            self.aiConfig = AIProviderConfig(provider: .appleFoundation, enabled: true)
        } else {
            self.aiConfig = AIProviderConfig(provider: .appleFoundation, enabled: false)
        }

        rebuildBundleIndices()
        rebuildLearnerIndices()
    }

    public static func loadDefaultBundle() -> CurriculumBundle {
        let resolvedURL: URL? = {
            if let mainURL = Bundle.main.url(forResource: "curriculum", withExtension: "json") {
                return mainURL
            }
            if let nestedURL = Bundle.main.resourceURL?.appendingPathComponent("LinguaVerve_LinguaVerveCore.bundle/curriculum.json"),
               FileManager.default.fileExists(atPath: nestedURL.path) {
                return nestedURL
            }
            return Bundle.module.url(forResource: "curriculum", withExtension: "json")
        }()

        if let url = resolvedURL,
           let data = try? Data(contentsOf: url),
           let decoded = try? JSONDecoder().decode(CurriculumBundle.self, from: data) {
            return decoded
        }
        return CurriculumBundle(
            generatedAt: "",
            version: "2.0.0",
            languages: [],
            levels: [],
            tips: [],
            falseFriends: [],
            diagnosticQuestions: []
        )
    }

    // MARK: - Persistence & Index Helpers

    private static func courseIndexKey(languageId: String, level: CEFRLevel) -> String {
        "\(languageId)::\(level.rawValue)"
    }

    private func rebuildBundleIndices() {
        var byLang: [String: [IntensiveCourse]] = [:]
        var byKey: [String: IntensiveCourse] = [:]
        for course in bundle.intensiveCourses {
            byLang[course.languageId, default: []].append(course)
            byKey[Self.courseIndexKey(languageId: course.languageId, level: course.level)] = course
        }
        self.coursesByLanguage = byLang
        self.courseByKey = byKey

        var refsById: [String: OfficialExamReference] = [:]
        var refsByLang: [String: [OfficialExamReference]] = [:]
        for ref in bundle.examReferences {
            refsById[ref.id] = ref
            refsByLang[ref.languageId, default: []].append(ref)
        }
        self.examReferencesById = refsById
        self.examReferencesByLanguage = refsByLang
    }

    private func rebuildLearnerIndices() {
        completedModuleIdSet = Set(learnerState.completedModuleIds)
        enrolledCourseIdSet = Set(learnerState.enrolledCourseIds)
    }

    private func persistEncoded<T: Encodable & Sendable>(_ value: T, forKey key: String) {
        let storage = defaults
        if persistSynchronously {
            if let encoded = try? JSONEncoder().encode(value) {
                storage.set(encoded, forKey: key)
            }
        } else {
            persistQueue.async {
                if let encoded = try? JSONEncoder().encode(value) {
                    storage.set(encoded, forKey: key)
                }
            }
        }
    }

    /// Blocks until any queued background persistence writes finish flushing to UserDefaults.
    public func flushPersistence() {
        persistQueue.sync {}
    }

    private func persistLearnerState() {
        persistEncoded(learnerState, forKey: learnerStateKey)
    }

    public func saveAIConfig(_ nextConfig: AIProviderConfig) {
        self.aiConfig = nextConfig
        persistEncoded(nextConfig, forKey: aiConfigKey)
    }

    // MARK: - Overall App Font Size Controls

    public static func clampFontScale(_ value: Double) -> Double {
        let clamped = max(minFontScale, min(maxFontScale, value))
        return (clamped * 20.0).rounded() / 20.0 // clean 5% steps
    }

    public var fontScalePercent: Int {
        Int((fontScale * 100.0).rounded())
    }

    public func setFontScale(_ scale: Double) {
        fontScale = Self.clampFontScale(scale)
    }

    public func increaseFontScale() {
        setFontScale(fontScale + 0.10)
    }

    public func decreaseFontScale() {
        setFontScale(fontScale - 0.10)
    }

    public func resetFontScale() {
        setFontScale(1.0)
    }

    private static func todayKey(from date: Date = Date()) -> String {
        let comps = gregorianCalendar.dateComponents([.year, .month, .day], from: date)
        return String(
            format: "%04d-%02d-%02d",
            comps.year ?? 1970,
            comps.month ?? 1,
            comps.day ?? 1
        )
    }

    private func touchStudyDay() {
        let key = Self.todayKey()
        if !learnerState.studyDays.contains(key) {
            learnerState.studyDays.append(key)
            learnerState.studyDays.sort()
        }
    }

    private func appendActivity(_ entry: StudyActivityEntry) {
        learnerState.activityLog.insert(entry, at: 0)
        if learnerState.activityLog.count > 100 {
            learnerState.activityLog = Array(learnerState.activityLog.prefix(100))
        }
    }

    // MARK: - Intensive Courses & Exam References

    public func courses(for languageId: String) -> [IntensiveCourse] {
        let target = LearningLanguage.normalize(languageId)
        return coursesByLanguage[target] ?? []
    }

    public func course(for languageId: String, level: CEFRLevel) -> IntensiveCourse? {
        let target = LearningLanguage.normalize(languageId)
        return courseByKey[Self.courseIndexKey(languageId: target, level: level)]
    }

    public func examReferences(for course: IntensiveCourse, showAllForLanguage: Bool = false) -> [OfficialExamReference] {
        if showAllForLanguage {
            return examReferencesByLanguage[course.languageId] ?? []
        }
        return course.referenceIds.compactMap { examReferencesById[$0] }
    }

    public func isModuleCompleted(_ moduleId: String) -> Bool {
        completedModuleIdSet.contains(moduleId)
    }

    public func isCourseEnrolled(_ courseId: String) -> Bool {
        enrolledCourseIdSet.contains(courseId)
    }

    @discardableResult
    public func toggleModuleComplete(_ module: CourseModule, languageId: String, level: CEFRLevel) -> Bool {
        if completedModuleIdSet.contains(module.id),
           let idx = learnerState.completedModuleIds.firstIndex(of: module.id) {
            learnerState.completedModuleIds.remove(at: idx)
            completedModuleIdSet.remove(module.id)
            persistLearnerState()
            return false
        } else {
            if !completedModuleIdSet.contains(module.id) {
                learnerState.completedModuleIds.append(module.id)
                completedModuleIdSet.insert(module.id)
            }
            touchStudyDay()
            appendActivity(
                StudyActivityEntry(
                    type: "module-complete",
                    languageId: languageId,
                    level: level,
                    title: "Completed Unit: \(module.title)",
                    detail: "\(languageId.uppercased()) \(level.rawValue) intensive module"
                )
            )
            persistLearnerState()
            return true
        }
    }

    public func unitProgress(for moduleId: String) -> UnitStudyProgress? {
        learnerState.unitProgress[moduleId]
    }

    public func saveUnitProgress(_ progress: UnitStudyProgress) {
        learnerState.unitProgress[progress.moduleId] = progress
        touchStudyDay()
        persistLearnerState()
    }

    public func markModuleCompleted(
        _ module: CourseModule,
        languageId: String,
        level: CEFRLevel,
        score: Int? = nil
    ) {
        if !completedModuleIdSet.contains(module.id) {
            learnerState.completedModuleIds.append(module.id)
            completedModuleIdSet.insert(module.id)
        }
        touchStudyDay()
        let detail: String
        if let score {
            detail = "\(languageId.uppercased()) \(level.rawValue) guided unit completed · Checkpoint \(score)%"
        } else {
            detail = "\(languageId.uppercased()) \(level.rawValue) guided unit mastered"
        }
        appendActivity(
            StudyActivityEntry(
                type: "module-complete",
                languageId: languageId,
                level: level,
                title: "Completed Unit: \(module.title)",
                detail: detail,
                score: score
            )
        )
        persistLearnerState()
    }

    public func courseCompletionPercent(for course: IntensiveCourse) -> Int {
        guard !course.modules.isEmpty else { return 0 }
        let done = course.modules.filter { isModuleCompleted($0.id) }.count
        return Int((Double(done) / Double(course.modules.count) * 100.0).rounded())
    }

    public func languageZeroToHeroProgress(for languageId: String) -> (done: Int, total: Int, percent: Int) {
        let allMods = courses(for: languageId).flatMap(\.modules)
        guard !allMods.isEmpty else { return (0, 0, 0) }
        let done = allMods.filter { isModuleCompleted($0.id) }.count
        return (done, allMods.count, Int((Double(done) / Double(allMods.count) * 100.0).rounded()))
    }

    // MARK: - Scored Placement Pre-Test & Collective Course Recommender

    public func preTestQuestions(for languageId: String) -> [PreTestQuestion] {
        let target = LearningLanguage.normalize(languageId)
        return bundle.preTestQuestions.filter { $0.languageId == target }
    }

    public func evaluateAndRecordPreTest(languageId: String, answers: [String: Int]) -> PreTestResult {
        let target = LearningLanguage.normalize(languageId)
        let questions = preTestQuestions(for: target)

        var levelCorrect: [CEFRLevel: Int] = [:]
        var levelTotal: [CEFRLevel: Int] = [:]
        var skillCorrect: [SkillType: Int] = [:]
        var skillTotal: [SkillType: Int] = [:]
        var totalCorrect = 0

        for q in questions {
            levelTotal[q.level, default: 0] += 1
            skillTotal[q.skill, default: 0] += 1
            if answers[q.id] == q.correctIndex {
                totalCorrect += 1
                levelCorrect[q.level, default: 0] += 1
                skillCorrect[q.skill, default: 0] += 1
            }
        }

        let overall = questions.isEmpty ? 0 : Int((Double(totalCorrect) / Double(questions.count) * 100.0).rounded())

        let order = CEFRLevel.allCases
        var verifiedIdx = 0
        for (idx, lvl) in order.enumerated() {
            let tot = levelTotal[lvl, default: 0]
            let cor = levelCorrect[lvl, default: 0]
            let ratio = tot > 0 ? Double(cor) / Double(tot) : 0
            if ratio >= 0.5 {
                verifiedIdx = idx
            } else if idx >= 1 {
                break
            }
        }
        if totalCorrect == 0 { verifiedIdx = 0 }
        let verifiedLevel = order[verifiedIdx]

        var skillScores: [String: Int] = [:]
        for skill in SkillType.allCases {
            let tot = skillTotal[skill, default: 0]
            let cor = skillCorrect[skill, default: 0]
            skillScores[skill.rawValue] = tot > 0 ? Int((Double(cor) / Double(tot) * 100.0).rounded()) : 0
        }

        let sortedSkills = SkillType.allCases.sorted { (skillScores[$0.rawValue] ?? 0) < (skillScores[$1.rawValue] ?? 0) }
        let prioritySkills = Array(sortedSkills.prefix(2))
        let langCourses = courses(for: target)

        func findCourse(_ lvl: CEFRLevel) -> IntensiveCourse? {
            langCourses.first { $0.level == lvl } ?? langCourses.first
        }

        var recommendations: [CollectiveCourseStep] = []

        if verifiedIdx > 0, let weakest = sortedSkills.first, (skillScores[weakest.rawValue] ?? 0) < 60,
           let prevCourse = findCourse(order[verifiedIdx - 1]) {
            recommendations.append(
                CollectiveCourseStep(
                    role: "foundation",
                    courseId: prevCourse.id,
                    level: prevCourse.level,
                    title: prevCourse.title,
                    reason: "Close your \(weakest.displayName) gap (\(skillScores[weakest.rawValue] ?? 0)%) rapidly before advancing.",
                    prioritySkills: [weakest]
                )
            )
        }

        if let coreCourse = findCourse(verifiedLevel) {
            recommendations.append(
                CollectiveCourseStep(
                    role: "core",
                    courseId: coreCourse.id,
                    level: coreCourse.level,
                    title: coreCourse.title,
                    reason: "Consolidate full 4-skill exam readiness at your verified \(verifiedLevel.rawValue) tier (\(overall)% score).",
                    prioritySkills: prioritySkills
                )
            )
        }

        if verifiedIdx < order.count - 1, let nextCourse = findCourse(order[verifiedIdx + 1]) {
            recommendations.append(
                CollectiveCourseStep(
                    role: "bridge",
                    courseId: nextCourse.id,
                    level: nextCourse.level,
                    title: nextCourse.title,
                    reason: "Your bridge milestone to advance from \(verifiedLevel.rawValue) to \(nextCourse.level.rawValue) certification.",
                    prioritySkills: [.speaking, .listening]
                )
            )
        }

        let cert = findCourse(verifiedLevel)?.targetCertificates.first
            ?? LearningLanguage.from(target).defaultCertificate(for: verifiedLevel)

        let result = PreTestResult(
            id: "pre-\(UUID().uuidString.prefix(8))",
            timestamp: ISO8601DateFormatter().string(from: Date()),
            languageId: target,
            verifiedLevel: verifiedLevel,
            overallScore: overall,
            correctCount: totalCorrect,
            totalCount: questions.count,
            skillScores: skillScores,
            recommendedCourses: recommendations,
            suggestedCertificate: cert
        )

        learnerState.preTestHistory.insert(result, at: 0)
        if learnerState.preTestHistory.count > 50 {
            learnerState.preTestHistory = Array(learnerState.preTestHistory.prefix(50))
        }
        for step in recommendations where !enrolledCourseIdSet.contains(step.courseId) {
            learnerState.enrolledCourseIds.append(step.courseId)
            enrolledCourseIdSet.insert(step.courseId)
        }
        touchStudyDay()
        appendActivity(
            StudyActivityEntry(
                type: "pretest",
                languageId: target,
                level: verifiedLevel,
                title: "Placement Pre-Test Verified: \(verifiedLevel.rawValue)",
                detail: "\(totalCorrect)/\(questions.count) (\(overall)%) · Suggested \(recommendations.count) courses",
                score: overall
            )
        )
        persistLearnerState()
        return result
    }

    // MARK: - Simulated 4-Skill Exams & AI Sessions

    public func mockExam(for languageId: String, level: CEFRLevel) -> MockExam? {
        let target = LearningLanguage.normalize(languageId)
        return bundle.mockExams.first { $0.languageId == target && $0.level == level }
            ?? bundle.mockExams.first { $0.languageId == target }
    }

    public func exactExam(byId examId: String) -> MockExam? {
        if let generated = generatedExams.first(where: { $0.id == examId }) {
            return generated
        }
        return bundle.mockExams.first(where: { $0.id == examId })
    }

    public func exam(for attempt: ExamAttemptRecord) -> (exam: MockExam, isExactMatch: Bool)? {
        if let exact = exactExam(byId: attempt.examId) {
            return (exact, true)
        }
        if let fallback = mockExam(for: attempt.languageId, level: attempt.level) {
            return (fallback, false)
        }
        return nil
    }

    public func generatedExams(for languageId: String, level: CEFRLevel) -> [MockExam] {
        let target = LearningLanguage.normalize(languageId)
        return generatedExams.filter { $0.languageId == target && $0.level == level }
    }

    public func saveGeneratedExam(_ exam: MockExam) {
        generatedExams.removeAll { $0.id == exam.id }
        generatedExams.insert(exam, at: 0)
        if generatedExams.count > 24 {
            generatedExams = Array(generatedExams.prefix(24))
        }
        if let encoded = try? JSONEncoder().encode(generatedExams) {
            defaults.set(encoded, forKey: generatedExamsKey)
        }
    }

    public func deleteGeneratedExam(id: String) {
        generatedExams.removeAll { $0.id == id }
        if let encoded = try? JSONEncoder().encode(generatedExams) {
            defaults.set(encoded, forKey: generatedExamsKey)
        }
    }

    public func recordExamAttempt(_ attempt: ExamAttemptRecord) {
        learnerState.examHistory.insert(attempt, at: 0)
        if learnerState.examHistory.count > 50 {
            learnerState.examHistory = Array(learnerState.examHistory.prefix(50))
        }
        touchStudyDay()
        appendActivity(
            StudyActivityEntry(
                type: "mock-exam",
                languageId: attempt.languageId,
                level: attempt.level,
                title: "\(attempt.examTitle) (\(attempt.passed ? "PASSED" : "RETRY"))",
                detail: "\(attempt.mode.capitalized) mode · Overall \(attempt.overallScore)%",
                score: attempt.overallScore
            )
        )
        persistLearnerState()
    }

    public func deleteExamAttempt(id: String) {
        learnerState.examHistory.removeAll { $0.id == id }
        persistLearnerState()
    }

    @discardableResult
    public func updateExamAttemptAssessment(
        attemptId: String,
        assessment: ExamAIAssessment
    ) -> ExamAttemptRecord? {
        guard let idx = learnerState.examHistory.firstIndex(where: { $0.id == attemptId }) else {
            return nil
        }
        let existing = learnerState.examHistory[idx]
        var updatedSkills = existing.skills
        for sk in SkillType.allCases {
            if let currentSkill = updatedSkills[sk.rawValue],
               assessment.insight(for: sk)?.aiAnalyzed == true {
                updatedSkills[sk.rawValue] = SkillExamScore(
                    score: currentSkill.score,
                    passed: currentSkill.passed,
                    feedback: currentSkill.feedback,
                    aiGraded: true,
                    rubric: currentSkill.rubric
                )
            }
        }
        let updated = ExamAttemptRecord(
            id: existing.id,
            timestamp: existing.timestamp,
            examId: existing.examId,
            examTitle: existing.examTitle,
            alignedCertificate: existing.alignedCertificate,
            languageId: existing.languageId,
            level: existing.level,
            mode: existing.mode,
            durationUsedSeconds: existing.durationUsedSeconds,
            overallScore: existing.overallScore,
            passed: existing.passed,
            officialGradeLabel: existing.officialGradeLabel,
            skills: updatedSkills,
            writingSubmission: existing.writingSubmission,
            speakingTranscript: existing.speakingTranscript,
            questionReviews: existing.questionReviews,
            writingNotes: existing.writingNotes,
            speakingNotes: existing.speakingNotes,
            aiAssessment: assessment
        )
        learnerState.examHistory[idx] = updated
        persistLearnerState()
        return updated
    }

    public func saveReadinessReport(_ report: ExamHistoryReadinessReport) {
        learnerState.latestReadinessReport = report
        persistLearnerState()
    }

    public func setLearnerName(_ name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        learnerState.learnerName = trimmed.isEmpty ? nil : trimmed
        persistLearnerState()
    }

    public var passedExamHistory: [ExamAttemptRecord] {
        learnerState.examHistory.filter(\.passed)
    }

    public func recordAISession(_ session: AISessionRecord) {
        learnerState.aiSessionHistory.insert(session, at: 0)
        if learnerState.aiSessionHistory.count > 60 {
            learnerState.aiSessionHistory = Array(learnerState.aiSessionHistory.prefix(60))
        }
        touchStudyDay()
        appendActivity(
            StudyActivityEntry(
                type: "ai-session",
                languageId: session.languageId,
                level: session.level,
                title: "AI \(session.skill.shortName) Coach (\(session.level.rawValue))",
                detail: "\(session.provider) · \(session.summary)",
                score: session.score
            )
        )
        persistLearnerState()
    }

    public func studyStreak(referenceDate: Date = Date()) -> Int {
        guard !learnerState.studyDays.isEmpty else { return 0 }
        let daySet = Set(learnerState.studyDays)
        let cal = Calendar(identifier: .gregorian)
        var cursor = referenceDate

        if !daySet.contains(Self.todayKey(from: cursor)) {
            guard let yesterday = cal.date(byAdding: .day, value: -1, to: cursor),
                  daySet.contains(Self.todayKey(from: yesterday)) else {
                return 0
            }
            cursor = yesterday
        }

        var streak = 0
        while daySet.contains(Self.todayKey(from: cursor)) {
            streak += 1
            guard let prev = cal.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = prev
        }
        return streak
    }

    public func skillAverages(languageId: String = "all") -> [SkillType: (average: Int, samples: Int)] {
        var sums: [SkillType: Int] = [:]
        var counts: [SkillType: Int] = [:]

        for attempt in learnerState.examHistory {
            if languageId != "all" && attempt.languageId != languageId { continue }
            for skill in SkillType.allCases {
                if let s = attempt.skills[skill.rawValue] {
                    sums[skill, default: 0] += s.score
                    counts[skill, default: 0] += 1
                }
            }
        }

        for pre in learnerState.preTestHistory {
            if languageId != "all" && pre.languageId != languageId { continue }
            for skill in SkillType.allCases {
                if let s = pre.skillScores[skill.rawValue] {
                    sums[skill, default: 0] += s
                    counts[skill, default: 0] += 1
                }
            }
        }

        var result: [SkillType: (average: Int, samples: Int)] = [:]
        for skill in SkillType.allCases {
            let count = counts[skill, default: 0]
            let avg = count > 0 ? Int((Double(sums[skill, default: 0]) / Double(count)).rounded()) : 0
            result[skill] = (avg, count)
        }
        return result
    }

    public func exportProgressJSON() -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        guard let data = try? encoder.encode(learnerState),
              let str = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return str
    }

    public func importProgressJSON(_ json: String) throws {
        guard let data = json.data(using: .utf8) else {
            throw NSError(domain: "LinguaVerve", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid UTF-8 JSON"])
        }
        struct Wrapper: Decodable { let state: LearnerProgressState }
        if let wrapped = try? JSONDecoder().decode(Wrapper.self, from: data) {
            self.learnerState = wrapped.state
        } else {
            self.learnerState = try JSONDecoder().decode(LearnerProgressState.self, from: data)
        }
        rebuildLearnerIndices()
        persistLearnerState()
    }

    public func resetLearnerProgress() {
        self.learnerState = LearnerProgressState()
        rebuildLearnerIndices()
        persistLearnerState()
    }

    // MARK: - Cross-Workspace Navigation Shortcuts

    public func openCourse(languageId: String, level: CEFRLevel) {
        self.courseLanguageId = LearningLanguage.normalize(languageId)
        self.courseLevel = level
        self.activeLessonModuleId = nil
        self.activeWorkspace = .courses
    }

    public func openUnitLesson(moduleId: String, languageId: String, level: CEFRLevel) {
        self.courseLanguageId = LearningLanguage.normalize(languageId)
        self.courseLevel = level
        self.activeLessonModuleId = moduleId
        self.activeWorkspace = .courses
    }

    public func closeUnitLesson() {
        self.activeLessonModuleId = nil
    }

    public func openExamSimulator(languageId: String, level: CEFRLevel) {
        self.courseLanguageId = LearningLanguage.normalize(languageId)
        self.examTargetLevel = level
        self.activeWorkspace = .simulator
    }

    public func openAICoach(languageId: String, level: CEFRLevel, skill: SkillType, seedPrompt: String = "") {
        self.courseLanguageId = LearningLanguage.normalize(languageId)
        self.aiCoachLevel = level
        self.aiCoachSkill = skill
        self.aiCoachSeedPrompt = seedPrompt
        self.activeWorkspace = .aiCoach
    }

    // MARK: - Field Manual Tips Filtering & Bookmarks

    public var filteredTips: [TipItem] {
        Self.filterTips(
            tips: bundle.tips,
            languageId: activeLanguageId,
            level: activeLevel,
            category: selectedCategory,
            searchQuery: searchQuery,
            bookmarkedIds: bookmarkedIds,
            masteredIds: masteredIds,
            viewMode: viewMode
        )
    }

    public static func filterTips(
        tips: [TipItem],
        languageId: String = "all",
        level: String = "ALL",
        category: String = "all",
        searchQuery: String = "",
        bookmarkedIds: Set<String> = [],
        masteredIds: Set<String> = [],
        viewMode: ViewModeFilter = .all
    ) -> [TipItem] {
        let q = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return tips.filter { tip in
            if languageId != "all" {
                if tip.languageId != languageId && tip.languageId != "meta" {
                    return false
                }
            }
            if level != "ALL" {
                if tip.level != level && tip.level != "ALL" {
                    return false
                }
            }
            if category != "all" {
                if tip.category.rawValue != category {
                    return false
                }
            }
            switch viewMode {
            case .all: break
            case .saved:
                if !bookmarkedIds.contains(tip.id) { return false }
            case .mastered:
                if !masteredIds.contains(tip.id) { return false }
            }
            if !q.isEmpty {
                let matchesTitle = tip.title.lowercased().contains(q)
                let matchesSummary = tip.summary.lowercased().contains(q)
                let matchesRule = tip.goldenRule.lowercased().contains(q)
                let matchesTags = tip.tags.contains { $0.lowercased().contains(q) }
                let matchesTactics = tip.tactics.contains { $0.lowercased().contains(q) }
                if !matchesTitle && !matchesSummary && !matchesRule && !matchesTags && !matchesTactics {
                    return false
                }
            }
            return true
        }
    }

    public func filteredFalseFriends(query: String = "", languageId: String = "all") -> [FalseFriendItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return bundle.falseFriends.filter { item in
            if languageId != "all" && item.languageId != languageId {
                return false
            }
            if q.isEmpty { return true }
            return item.word.lowercased().contains(q)
                || item.confusedWith.lowercased().contains(q)
                || item.actualMeaning.lowercased().contains(q)
                || item.memoryHack.lowercased().contains(q)
        }
    }

    public var tipsCountByLevel: [String: Int] {
        var counts: [String: Int] = ["ALL": 0]
        for tip in bundle.tips {
            if activeLanguageId != "all" && tip.languageId != activeLanguageId && tip.languageId != "meta" {
                continue
            }
            counts["ALL", default: 0] += 1
            counts[tip.level, default: 0] += 1
        }
        return counts
    }

    public var hasActiveFilters: Bool {
        activeLevel != "ALL" || selectedCategory != "all" || !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewMode != .all
    }

    public func resetFilters() {
        activeLevel = "ALL"
        selectedCategory = "all"
        searchQuery = ""
        viewMode = .all
    }

    public func toggleBookmark(_ id: String) {
        if bookmarkedIds.contains(id) {
            bookmarkedIds.remove(id)
        } else {
            bookmarkedIds.insert(id)
        }
        defaults.set(Array(bookmarkedIds), forKey: bookmarksKey)
    }

    public func toggleMastered(_ id: String) -> Bool {
        let nowMastered: Bool
        if masteredIds.contains(id) {
            masteredIds.remove(id)
            nowMastered = false
        } else {
            masteredIds.insert(id)
            nowMastered = true
        }
        defaults.set(Array(masteredIds), forKey: masteredKey)
        return nowMastered
    }

    public func isBookmarked(_ id: String) -> Bool {
        bookmarkedIds.contains(id)
    }

    public func isMastered(_ id: String) -> Bool {
        masteredIds.contains(id)
    }

    public func randomTip(for languageId: String? = nil) -> TipItem? {
        let lang = languageId ?? activeLanguageId
        let pool = lang != "all"
            ? bundle.tips.filter { $0.languageId == lang || $0.languageId == "meta" }
            : bundle.tips
        return pool.randomElement() ?? bundle.tips.first
    }

    public func language(for id: String) -> LanguageItem? {
        bundle.languages.first { $0.id == id }
    }

    public func levelDetail(for levelId: String) -> LevelDetail? {
        bundle.levels.first { $0.id.rawValue == levelId }
    }

    public static func calculateDiagnosticLevel(answers: [String: CEFRLevel]) -> CEFRLevel {
        guard !answers.isEmpty else { return .A1 }
        let sum = answers.values.reduce(0) { $0 + $1.numericRank }
        let avg = Int((Double(sum) / Double(answers.count)).rounded())
        return CEFRLevel.fromRank(avg)
    }

    // MARK: - Software Updates (GitHub Releases)

    public var isUpdateAvailable: Bool {
        availableUpdate != nil
    }

    public var shouldShowUpdateBanner: Bool {
        availableUpdate != nil && !isUpdateBannerDismissed
    }

    @MainActor
    public func checkForUpdates(manual: Bool = false) async {
        guard !isCheckingForUpdates else { return }
        if !manual && !autoCheckForUpdates {
            return
        }

        isCheckingForUpdates = true
        updateCheckError = nil
        defer { isCheckingForUpdates = false }

        do {
            let outcome = try await updateService.checkForUpdates(
                currentVersion: currentAppVersion,
                etag: cachedReleaseETag,
                force: manual || latestReleaseURL == nil
            )
            lastUpdateCheckDate = Date()

            switch outcome {
            case .notModified(let etag):
                if let etag { cachedReleaseETag = etag }
                if manual { isUpdateSheetPresented = true }

            case .upToDate(_, let latestVersion, let releaseName, let releaseNotes, let releaseURL, _, let asset, let etag):
                availableUpdate = nil
                latestKnownVersion = latestVersion
                latestReleaseName = releaseName
                latestReleaseNotes = releaseNotes
                latestReleaseURL = releaseURL
                latestReleaseAsset = asset
                if let etag { cachedReleaseETag = etag }
                if manual { isUpdateSheetPresented = true }

            case .updateAvailable(let update):
                availableUpdate = update
                latestKnownVersion = update.latestVersion
                latestReleaseName = update.releaseName
                latestReleaseNotes = update.releaseNotes
                latestReleaseURL = update.releaseURL
                latestReleaseAsset = update.asset
                latestChecksumsAsset = update.checksumsAsset
                if let etag = update.etag { cachedReleaseETag = etag }
                isUpdateBannerDismissed = false
                if manual { isUpdateSheetPresented = true }
            }
        } catch {
            updateCheckError = error.localizedDescription
            if manual { isUpdateSheetPresented = true }
        }
    }

    /// Runs an initial GitHub Releases check on launch (when auto-check is enabled)
    /// and re-checks periodically while the app stays open.
    @MainActor
    public func startPeriodicUpdateChecks(intervalSeconds: TimeInterval = 6 * 3600) async {
        if autoCheckForUpdates && lastUpdateCheckDate == nil {
            await checkForUpdates(manual: false)
        }
        let sleepNs = UInt64(max(60, intervalSeconds) * 1_000_000_000)
        while !Task.isCancelled {
            try? await Task.sleep(nanoseconds: sleepNs)
            guard !Task.isCancelled else { break }
            if autoCheckForUpdates {
                await checkForUpdates(manual: false)
            }
        }
    }

    @MainActor
    public func downloadUpdate() async {
        switch updateDownloadState {
        case .downloading, .verifying, .installing:
            return
        case .idle, .ready, .failed:
            break
        }

        if availableUpdate == nil && latestReleaseAsset == nil {
            await checkForUpdates(manual: false)
        }

        let targetAsset = availableUpdate?.asset ?? latestReleaseAsset
        guard let asset = targetAsset else {
            let msg = "No native macOS download asset found on the latest release. Opening GitHub Releases page."
            updateDownloadState = .failed(msg)
            openReleasePage()
            return
        }

        updateDownloadState = .downloading(progress: 0)
        do {
            let fileURL = try await updateService.downloadAsset(
                from: asset.browser_download_url,
                assetName: asset.name
            ) { [weak self] pct in
                Task { @MainActor in
                    guard let self else { return }
                    if case .downloading = self.updateDownloadState {
                        self.updateDownloadState = .downloading(progress: pct)
                    }
                }
            }

            let checksumsAsset = availableUpdate?.checksumsAsset ?? latestChecksumsAsset
            if checksumsAsset != nil {
                updateDownloadState = .verifying
                _ = try await updateService.verifyChecksum(
                    of: fileURL,
                    assetName: asset.name,
                    checksumsAsset: checksumsAsset
                )
            }

            updateDownloadState = .ready(fileURL: fileURL)
        } catch {
            updateDownloadState = .failed(error.localizedDescription)
        }
    }

    /// Downloads the latest GitHub Release artifact, verifies its SHA-256 checksum,
    /// spawns the detached updater helper, and closes the current app to apply the update & relaunch.
    @MainActor
    public func downloadAndInstallUpdate() async {
        await downloadUpdate()
        if case .ready = updateDownloadState {
            installReadyUpdate()
        }
    }

    @MainActor
    public func installReadyUpdate() {
        guard case .ready(let fileURL) = updateDownloadState else { return }
        #if os(macOS)
        do {
            updateDownloadState = .installing
            try updateService.installAndRelaunch(
                downloadedFile: fileURL,
                currentBundlePath: Bundle.main.bundlePath,
                parentPID: ProcessInfo.processInfo.processIdentifier
            )
            if terminationDelayMs == 0 {
                terminateAppHandler()
            } else {
                let delayNs = terminationDelayMs * 1_000_000
                Task { @MainActor [weak self] in
                    try? await Task.sleep(nanoseconds: delayNs)
                    self?.terminateAppHandler()
                }
            }
        } catch {
            updateDownloadState = .failed(error.localizedDescription)
        }
        #else
        openReleasePage()
        #endif
    }

    public func dismissUpdateBanner() {
        isUpdateBannerDismissed = true
    }

    public func openReleasePage() {
        let urlString = availableUpdate?.releaseURL
            ?? latestReleaseURL
            ?? UpdateService.releasesPageURL.absoluteString
        let resolvedURL: URL = {
            if UpdateService.isAllowedReleasePageURL(urlString), let url = URL(string: urlString) {
                return url
            }
            return UpdateService.releasesPageURL
        }()

        #if os(macOS)
        NSWorkspace.shared.open(resolvedURL)
        #elseif canImport(UIKit)
        DispatchQueue.main.async {
            UIApplication.shared.open(resolvedURL)
        }
        #endif
    }
}
