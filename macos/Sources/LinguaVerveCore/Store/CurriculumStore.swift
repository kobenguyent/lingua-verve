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
    public var aiConfig: AIProviderConfig

    // Software Update State (GitHub Releases — macOS)
    public let currentAppVersion: String
    public var autoCheckForUpdates: Bool {
        didSet {
            defaults.set(autoCheckForUpdates, forKey: autoUpdateKey)
        }
    }
    public var isCheckingForUpdates: Bool = false
    public var availableUpdate: AvailableAppUpdate?
    public var latestKnownVersion: String?
    public var latestReleaseName: String?
    public var latestReleaseNotes: String?
    public var latestReleaseURL: String?
    public var latestReleaseAsset: GitHubReleaseAsset?
    public var lastUpdateCheckDate: Date?
    public var updateCheckError: String?
    public var isUpdateSheetPresented: Bool = false
    public var isUpdateBannerDismissed: Bool = false
    public var updateDownloadState: UpdateDownloadState = .idle

    private var cachedReleaseETag: String?
    private let updateService: any UpdateServiceProtocol
    private let defaults: UserDefaults
    private let bookmarksKey = "linguaverve.macos.bookmarks"
    private let masteredKey = "linguaverve.macos.mastered"
    private let autoUpdateKey = "linguaverve.macos.autoCheckForUpdates"
    private let learnerStateKey = "linguaverve.apple.learnerState.v1"
    private let aiConfigKey = "linguaverve.apple.aiConfig.v1"

    public init(
        bundle: CurriculumBundle? = nil,
        defaults: UserDefaults = .standard,
        updateService: any UpdateServiceProtocol = UpdateService(),
        currentAppVersion: String = SemanticVersion.currentAppVersion()
    ) {
        self.defaults = defaults
        self.updateService = updateService
        self.currentAppVersion = SemanticVersion.normalize(currentAppVersion)
        if defaults.object(forKey: autoUpdateKey) == nil {
            self.autoCheckForUpdates = true
        } else {
            self.autoCheckForUpdates = defaults.bool(forKey: autoUpdateKey)
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

        if let aiData = defaults.data(forKey: aiConfigKey),
           let decodedAI = try? JSONDecoder().decode(AIProviderConfig.self, from: aiData) {
            self.aiConfig = decodedAI
        } else if LiveAppleFoundationModelBackend().availability().isAvailable {
            self.aiConfig = AIProviderConfig(provider: .appleFoundation, enabled: true)
        } else {
            self.aiConfig = AIProviderConfig(provider: .appleFoundation, enabled: false)
        }
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

    // MARK: - Persistence Helpers

    private func persistLearnerState() {
        if let encoded = try? JSONEncoder().encode(learnerState) {
            defaults.set(encoded, forKey: learnerStateKey)
        }
    }

    public func saveAIConfig(_ nextConfig: AIProviderConfig) {
        self.aiConfig = nextConfig
        if let encoded = try? JSONEncoder().encode(nextConfig) {
            defaults.set(encoded, forKey: aiConfigKey)
        }
    }

    private static func todayKey(from date: Date = Date()) -> String {
        let fmt = DateFormatter()
        fmt.calendar = Calendar(identifier: .gregorian)
        fmt.locale = Locale(identifier: "en_US_POSIX")
        fmt.dateFormat = "yyyy-MM-dd"
        return fmt.string(from: date)
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
        let target = languageId == "german" ? "german" : "english"
        return bundle.intensiveCourses.filter { $0.languageId == target }
    }

    public func course(for languageId: String, level: CEFRLevel) -> IntensiveCourse? {
        courses(for: languageId).first { $0.level == level }
    }

    public func examReferences(for course: IntensiveCourse, showAllForLanguage: Bool = false) -> [OfficialExamReference] {
        if showAllForLanguage {
            return bundle.examReferences.filter { $0.languageId == course.languageId }
        }
        let idSet = Set(course.referenceIds)
        return bundle.examReferences.filter { idSet.contains($0.id) }
    }

    public func isModuleCompleted(_ moduleId: String) -> Bool {
        learnerState.completedModuleIds.contains(moduleId)
    }

    public func isCourseEnrolled(_ courseId: String) -> Bool {
        learnerState.enrolledCourseIds.contains(courseId)
    }

    @discardableResult
    public func toggleModuleComplete(_ module: CourseModule, languageId: String, level: CEFRLevel) -> Bool {
        if let idx = learnerState.completedModuleIds.firstIndex(of: module.id) {
            learnerState.completedModuleIds.remove(at: idx)
            persistLearnerState()
            return false
        } else {
            learnerState.completedModuleIds.append(module.id)
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
        let target = languageId == "german" ? "german" : "english"
        return bundle.preTestQuestions.filter { $0.languageId == target }
    }

    public func evaluateAndRecordPreTest(languageId: String, answers: [String: Int]) -> PreTestResult {
        let target = languageId == "german" ? "german" : "english"
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
            ?? (target == "german" ? "Goethe-Zertifikat \(verifiedLevel.rawValue)" : "Cambridge English \(verifiedLevel.rawValue)")

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
        for step in recommendations where !learnerState.enrolledCourseIds.contains(step.courseId) {
            learnerState.enrolledCourseIds.append(step.courseId)
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
        let target = languageId == "german" ? "german" : "english"
        return bundle.mockExams.first { $0.languageId == target && $0.level == level }
            ?? bundle.mockExams.first { $0.languageId == target }
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
        persistLearnerState()
    }

    public func resetLearnerProgress() {
        self.learnerState = LearnerProgressState()
        persistLearnerState()
    }

    // MARK: - Cross-Workspace Navigation Shortcuts

    public func openCourse(languageId: String, level: CEFRLevel) {
        self.courseLanguageId = languageId == "german" ? "german" : "english"
        self.courseLevel = level
        self.activeWorkspace = .courses
    }

    public func openExamSimulator(languageId: String, level: CEFRLevel) {
        self.courseLanguageId = languageId == "german" ? "german" : "english"
        self.examTargetLevel = level
        self.activeWorkspace = .simulator
    }

    public func openAICoach(languageId: String, level: CEFRLevel, skill: SkillType, seedPrompt: String = "") {
        self.courseLanguageId = languageId == "german" ? "german" : "english"
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
                if let etag = update.etag { cachedReleaseETag = etag }
                isUpdateBannerDismissed = false
                if manual { isUpdateSheetPresented = true }
            }
        } catch {
            updateCheckError = error.localizedDescription
            if manual { isUpdateSheetPresented = true }
        }
    }

    @MainActor
    public func downloadUpdate() async {
        if case .downloading = updateDownloadState { return }

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
            updateDownloadState = .ready(fileURL: fileURL)
        } catch {
            updateDownloadState = .failed(error.localizedDescription)
        }
    }

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
            try updateService.installAndRelaunch(
                downloadedFile: fileURL,
                currentBundlePath: Bundle.main.bundlePath
            )
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                NSApplication.shared.terminate(nil)
            }
        } catch {
            updateDownloadState = .failed(error.localizedDescription)
        }
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
