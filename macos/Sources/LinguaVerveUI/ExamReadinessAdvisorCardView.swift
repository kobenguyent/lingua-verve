import SwiftUI
import LinguaVerveCore

public struct ExamReadinessAdvisorCardView: View {
    @Bindable var store: CurriculumStore
    let filterLang: String
    @Environment(\.appFontScale) private var fontScale

    @State private var selectedLevelOverride: CEFRLevel? = nil
    @State private var isAnalyzing = false
    @State private var showAISettingsSheet = false

    public init(store: CurriculumStore, filterLang: String) {
        self.store = store
        self.filterLang = filterLang
    }

    private var relevantExams: [ExamAttemptRecord] {
        let all = store.learnerState.examHistory
        if filterLang == "all" { return all }
        return all.filter { $0.languageId == filterLang }
    }

    private var availableLevels: [CEFRLevel] {
        let seen = Set(relevantExams.map(\.level))
        return CEFRLevel.allCases.filter { seen.contains($0) }
    }

    private var activeTargetLevel: CEFRLevel? {
        if let override = selectedLevelOverride, availableLevels.contains(override) {
            return override
        }
        return relevantExams.first?.level
    }

    private var activeLanguageId: String? {
        if filterLang != "all" { return filterLang }
        return relevantExams.first?.languageId
    }

    private var displayedReport: ExamHistoryReadinessReport? {
        guard !relevantExams.isEmpty else { return nil }
        let targetLvl = activeTargetLevel
        let targetLang = activeLanguageId
        let matchingAttemptsCount = relevantExams.filter {
            (targetLang == nil || $0.languageId == targetLang) && (targetLvl == nil || $0.level == targetLvl)
        }.count

        if let saved = store.learnerState.latestReadinessReport,
           saved.source == "ai",
           (targetLang == nil || saved.languageId == targetLang),
           (targetLvl == nil || saved.targetLevel == targetLvl),
           saved.attemptsAnalyzed == matchingAttemptsCount {
            return saved
        }
        return ExamAssessmentService.buildOfflineReadinessReport(
            attempts: relevantExams,
            languageId: targetLang,
            targetLevel: targetLvl
        )
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Card Header + Level Selector + AI Trigger
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    headerTitle
                    Spacer()
                    headerControls
                }
                VStack(alignment: .leading, spacing: 10) {
                    headerTitle
                    headerControls
                }
            }

            if let report = displayedReport {
                if availableLevels.count > 1 {
                    levelSelectorRow
                }
                verdictBanner(report)
                skillReadinessGrid(report)
                evidenceAndStepsSection(report)
                bottomActionRow(report)
            } else {
                emptyStateBanner
            }
        }
        .padding(18)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
        .sheet(isPresented: $showAISettingsSheet) {
            AIProviderSheetView(store: store)
                .applyAppFontScale(store)
        }
        .onChange(of: filterLang) { _, _ in
            selectedLevelOverride = nil
        }
    }

    // MARK: - Header

    private var headerTitle: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 6) {
                Image(systemName: "checkmark.shield.fill")
                    .foregroundStyle(.purple)
                Text("REAL EXAM READINESS ADVISOR")
                    .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(.purple)
            }
            Text("Should You Book the Official Exam or Practice More?")
                .scaledFont(.headline, weight: .bold)
            if let report = displayedReport {
                Text("Evaluated by: \(report.providerLabel) · Based on \(report.attemptsAnalyzed) \(report.targetLevel.rawValue) attempt\(report.attemptsAnalyzed == 1 ? "" : "s")")
                    .scaledFont(.caption2, design: .monospaced)
                    .foregroundStyle(.secondary)
            }
        }
    }

    @ViewBuilder
    private var headerControls: some View {
        if !relevantExams.isEmpty {
            if isAnalyzing {
                HStack(spacing: 6) {
                    ProgressView().controlSize(.small)
                    Text("Analyzing exam history...")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.purple)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Capsule().fill(Color.purple.opacity(0.14)))
            } else if store.aiConfig.isReady {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    Task { await runAIReadinessAnalysis() }
                } label: {
                    Label(
                        displayedReport?.source == "ai" ? "Re-analyze History with AI" : "Analyze History with AI",
                        systemImage: "sparkles"
                    )
                }
                .buttonStyle(.borderedProminent)
                .tint(.purple)
                .controlSize(.small)
            } else {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    showAISettingsSheet = true
                } label: {
                    Label("Connect AI for Readiness Advice", systemImage: "cpu")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
        }
    }

    private var levelSelectorRow: some View {
        FlowLayout(spacing: 6, lineSpacing: 6) {
            Text("Target Level:")
                .scaledFont(.caption2, weight: .bold, design: .monospaced)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
            ForEach(availableLevels) { lvl in
                let isSelected = activeTargetLevel == lvl
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    selectedLevelOverride = lvl
                } label: {
                    Text(lvl.rawValue)
                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(isSelected ? Color.purple : Color.primary.opacity(0.06)))
                        .foregroundStyle(isSelected ? Color.white : Color.primary)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Verdict Banner

    private func verdictColor(_ verdict: ExamReadinessVerdict) -> Color {
        switch verdict {
        case .ready: return BrandTheme.emeraldMint
        case .almostReady: return BrandTheme.celestialSky
        case .needsPractice: return .orange
        }
    }

    private func verdictIcon(_ verdict: ExamReadinessVerdict) -> String {
        switch verdict {
        case .ready: return "checkmark.seal.fill"
        case .almostReady: return "clock.badge.checkmark.fill"
        case .needsPractice: return "exclamationmark.triangle.fill"
        }
    }

    private func trendLabel(_ trend: String) -> String {
        switch trend {
        case "improving": return "↗ Improving"
        case "declining": return "↘ Declining"
        case "steady": return "→ Steady"
        default: return "· Single Sample"
        }
    }

    private func verdictBanner(_ report: ExamHistoryReadinessReport) -> some View {
        let tint = verdictColor(report.verdict)
        return VStack(alignment: .leading, spacing: 10) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    verdictCopy(report, tint: tint)
                    Spacer()
                    readinessGauge(report, tint: tint)
                }
                VStack(alignment: .leading, spacing: 10) {
                    verdictCopy(report, tint: tint)
                    readinessGauge(report, tint: tint)
                }
            }

            FlowLayout(spacing: 8, lineSpacing: 6) {
                metaPill(icon: "calendar.badge.clock", text: report.estimatedPrepTime, tint: tint)
                metaPill(icon: "chart.line.uptrend.xyaxis", text: "Trend: \(trendLabel(report.recentTrend))", tint: BrandTheme.celestialSky)
                metaPill(icon: "shield.lefthalf.filled", text: "Strict Exams: \(report.strictAttemptsCount)/\(report.attemptsAnalyzed)", tint: .indigo)
                metaPill(icon: "gauge.medium", text: "Confidence: \(report.confidence.capitalized)", tint: .secondary)
                metaPill(icon: "rosette", text: "Pass Rate: \(report.passRatePercent)%", tint: BrandTheme.emeraldMint)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(tint.opacity(0.09))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(tint.opacity(0.30), lineWidth: 1))
        )
    }

    private func verdictCopy(_ report: ExamHistoryReadinessReport, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(report.verdict.badgeLabel, systemImage: verdictIcon(report.verdict))
                .scaledFont(size: 11, weight: .bold, design: .monospaced)
                .padding(.horizontal, 9)
                .padding(.vertical, 3)
                .background(Capsule().fill(tint.opacity(0.20)))
                .foregroundStyle(tint)

            Text(report.headline)
                .scaledFont(.title3, weight: .bold)
                .fixedSize(horizontal: false, vertical: true)

            Text(report.rationale)
                .scaledFont(.caption)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func readinessGauge(_ report: ExamHistoryReadinessReport, tint: Color) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("\(report.readinessScore)%")
                .scaledFont(size: 28, weight: .bold, design: .monospaced)
                .monospacedDigit()
                .foregroundStyle(tint)
            Text("READINESS")
                .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
    }

    private func metaPill(icon: String, text: String, tint: Color) -> some View {
        Label(text, systemImage: icon)
            .scaledFont(.caption2, weight: .semibold, design: .monospaced)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Capsule().fill(tint.opacity(0.12)))
            .foregroundStyle(tint == .secondary ? Color.secondary : tint)
    }

    // MARK: - 4-Skill Readiness Matrix

    private func skillReadinessGrid(_ report: ExamHistoryReadinessReport) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(195, scale: fontScale)), spacing: 10)], spacing: 10) {
            ForEach(SkillType.allCases) { sk in
                if let stat = report.readiness(for: sk) {
                    let tint: Color = stat.status == "ready" ? BrandTheme.emeraldMint : stat.status == "borderline" ? BrandTheme.celestialSky : .orange
                    let statusText = stat.status == "ready" ? "READY" : stat.status == "borderline" ? "BORDERLINE" : "PRACTICE"
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Label(sk.shortName, systemImage: sk.systemImage)
                                .scaledFont(.caption, weight: .bold)
                            Spacer()
                            Text(statusText)
                                .scaledFont(size: 9, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(tint.opacity(0.16)))
                                .foregroundStyle(tint)
                        }
                        HStack(spacing: 8) {
                            Text("Avg \(stat.averageScore)%")
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                            Text("Latest \(stat.latestScore)%")
                                .scaledFont(.caption2, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                        ProgressView(value: Double(stat.averageScore), total: 100.0)
                            .tint(tint)
                        Text(stat.note)
                            .scaledFont(.caption2)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                }
            }
        }
    }

    // MARK: - Evidence & Next Steps

    private func evidenceAndStepsSection(_ report: ExamHistoryReadinessReport) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(270, scale: fontScale)), spacing: 10)], spacing: 10) {
                if !report.strengths.isEmpty {
                    listBox(title: "Readiness Proof", icon: "checkmark.circle.fill", tint: BrandTheme.emeraldMint, items: report.strengths)
                }
                if !report.blockingRisks.isEmpty {
                    listBox(title: "Risks to Address Before Booking", icon: "exclamationmark.triangle.fill", tint: .orange, items: report.blockingRisks)
                }
            }

            if !report.nextSteps.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Recommended Next Steps", systemImage: "list.number")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.celestialSky)
                    ForEach(Array(report.nextSteps.enumerated()), id: \.offset) { idx, step in
                        HStack(alignment: .top, spacing: 6) {
                            Text("\(idx + 1).")
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                                .foregroundStyle(BrandTheme.celestialSky)
                            Text(step)
                                .scaledFont(.caption)
                                .foregroundStyle(.primary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(BrandTheme.celestialSky.opacity(0.08)))
            }
        }
    }

    private func listBox(title: String, icon: String, tint: Color, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(title, systemImage: icon)
                .scaledFont(.caption, weight: .bold)
                .foregroundStyle(tint)
            ForEach(Array(items.enumerated()), id: \.offset) { _, line in
                HStack(alignment: .top, spacing: 6) {
                    Text("•").scaledFont(.caption).foregroundStyle(tint)
                    Text(line)
                        .scaledFont(.caption)
                        .foregroundStyle(.primary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 10).fill(tint.opacity(0.08)))
    }

    // MARK: - Bottom Actions & Empty State

    private func bottomActionRow(_ report: ExamHistoryReadinessReport) -> some View {
        FlowLayout(spacing: 8, lineSpacing: 8) {
            Button {
                NativeAudioEngine.shared.playClickSound()
                store.openExamSimulator(languageId: report.languageId, level: report.targetLevel)
            } label: {
                Label("Take Strict \(report.targetLevel.rawValue) Exam", systemImage: "timer")
            }
            .buttonStyle(.borderedProminent)
            .tint(BrandTheme.celestialSky)
            .controlSize(.small)

            Button {
                NativeAudioEngine.shared.playClickSound()
                store.openAICoach(
                    languageId: report.languageId,
                    level: report.targetLevel,
                    skill: report.prioritySkill,
                    seedPrompt: ExamAssessmentService.buildCoachSeedPrompt(from: report)
                )
            } label: {
                Label("Drill \(report.prioritySkill.shortName) in AI Coach", systemImage: "sparkles")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
    }

    private var emptyStateBanner: some View {
        HStack(alignment: .center, spacing: 10) {
            Image(systemName: "chart.bar.doc.horizontal")
                .scaledFont(.title3)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 2) {
                Text("Complete at least 1 simulated exam to unlock AI Real-Exam Readiness Analysis.")
                    .scaledFont(.caption, weight: .semibold)
                Text("Your configured AI provider will evaluate your score trend, strict-mode proof, and 4-skill consistency to tell you if you're ready to book the official test.")
                    .scaledFont(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button("Open Exam Arena") {
                NativeAudioEngine.shared.playClickSound()
                store.openExamSimulator(languageId: filterLang == "all" ? "english" : LearningLanguage.normalize(filterLang), level: .B1)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
    }

    // MARK: - AI Action

    @MainActor
    private func runAIReadinessAnalysis() async {
        guard !isAnalyzing, !relevantExams.isEmpty else { return }
        isAnalyzing = true
        if let report = await ExamAssessmentService().analyzeExamHistoryReadiness(
            config: store.aiConfig,
            attempts: relevantExams,
            languageId: activeLanguageId,
            targetLevel: activeTargetLevel
        ) {
            store.saveReadinessReport(report)
            NativeAudioEngine.shared.playSuccessChime()
        }
        isAnalyzing = false
    }
}
