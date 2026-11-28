import SwiftUI
import LinguaVerveCore

public struct ProgressDashboardNativeView: View {
    private enum ProgressLanguageFilter: String, CaseIterable, Identifiable, Hashable {
        case all
        case english
        case german
        case french
        case japanese

        var id: String { rawValue }

        var title: String {
            switch self {
            case .all: return "All"
            case .english: return "🇬🇧 EN"
            case .german: return "🇩🇪 DE"
            case .french: return "🇫🇷 FR"
            case .japanese: return "🇯🇵 JA"
            }
        }
    }

    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    @State private var copiedBackup = false
    @State private var showResetConfirm = false
    @State private var filterLang: String = "all"
    @State private var selectedAttempt: ExamAttemptRecord? = nil
    @State private var certificateAttempt: ExamAttemptRecord? = nil

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let streak = store.studyStreak()
        let totalModules = store.bundle.intensiveCourses.flatMap(\.modules).count
        let passedExams = store.learnerState.examHistory.filter(\.passed).count
        let skillAvgs = store.skillAverages(languageId: filterLang)
        let filteredExams = store.learnerState.examHistory.filter {
            filterLang == "all" || $0.languageId == filterLang
        }
        let passedFilteredExams = filteredExams.filter(\.passed)

        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 26) {
                    // Unboxed Editorial Header
                    ViewThatFits(in: .horizontal) {
                        HStack(alignment: .bottom, spacing: 14) {
                            titleBlock
                            Spacer(minLength: 12)
                            backupButtons
                        }
                        VStack(alignment: .leading, spacing: 12) {
                            titleBlock
                            backupButtons
                        }
                    }

                    GoldenGateSectionHairline()

                    // KPI Grid
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(165, scale: fontScale)), spacing: 12)], spacing: 12) {
                        kpiCard(title: "Study Streak", value: "\(streak)d", icon: "flame.fill", tint: BrandTheme.deepGold)
                        kpiCard(title: "Course Units", value: "\(store.learnerState.completedModuleIds.count)/\(totalModules)", icon: "graduationcap.fill", tint: BrandTheme.editorialBlue)
                        kpiCard(title: "Exams Passed", value: "\(passedExams)/\(store.learnerState.examHistory.count)", icon: "rosette", tint: BrandTheme.emeraldMint)
                        kpiCard(title: "Pre-Tests", value: "\(store.learnerState.preTestHistory.count)", icon: "checklist", tint: .indigo)
                        kpiCard(title: "AI / Tips", value: "\(store.learnerState.aiSessionHistory.count) · \(store.masteredIds.count)", icon: "sparkles", tint: BrandTheme.champagneGold)
                    }

                    // 4-Skill Averages
                    VStack(alignment: .leading, spacing: 14) {
                        ViewThatFits(in: .horizontal) {
                            HStack(spacing: 12) {
                                Text("4-Skill Competency Averages")
                                    .scaledFont(.headline, weight: .semibold)
                                Spacer()
                                languageFilterPicker
                            }
                            VStack(alignment: .leading, spacing: 10) {
                                Text("4-Skill Competency Averages")
                                    .scaledFont(.headline, weight: .semibold)
                                languageFilterPicker
                            }
                        }

                        LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(195, scale: fontScale)), spacing: 12)], spacing: 12) {
                            ForEach(SkillType.allCases) { sk in
                                let stat = skillAvgs[sk] ?? (0, 0)
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Label(sk.displayName, systemImage: sk.systemImage)
                                            .scaledFont(.caption, weight: .semibold)
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                        Text(stat.samples > 0 ? "\(stat.average)%" : "—")
                                            .scaledFont(.subheadline, weight: .bold, design: .monospaced, monospacedDigit: true)
                                    }
                                    ProgressView(value: Double(stat.average), total: 100.0)
                                        .tint(BrandTheme.editorialBlue)
                                    Text(stat.samples > 0 ? "\(stat.samples) recorded test(s)" : "No tests recorded yet")
                                        .scaledFont(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(14)
                                .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                            }
                        }
                    }
                    .padding(20)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                    // Zero-to-Hero Maps (English, German, French & Japanese)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(320, scale: fontScale)), spacing: 14)], spacing: 14) {
                        ForEach(LearningLanguage.allCases) { lang in
                            zeroToHeroCard(languageId: lang.rawValue, title: "\(lang.flag) \(lang.name) Zero-to-Hero (A1–C2)")
                        }
                    }

                    // AI Real-Exam Readiness Advisor
                    ExamReadinessAdvisorCardView(store: store, filterLang: filterLang)

                    // Earned Official LinguaVerve Certificates Shelf
                    if !passedFilteredExams.isEmpty {
                        VStack(alignment: .leading, spacing: 14) {
                            ViewThatFits(in: .horizontal) {
                                HStack {
                                    Label("Earned LinguaVerve Certificates (\(passedFilteredExams.count))", systemImage: "rosette")
                                        .scaledFont(.headline, weight: .semibold)
                                        .foregroundStyle(BrandTheme.deepGold)
                                    Spacer()
                                    Text("Click any diploma to personalize & export PDF/PNG")
                                        .scaledFont(.caption, design: .monospaced)
                                        .foregroundStyle(.secondary)
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    Label("Earned LinguaVerve Certificates (\(passedFilteredExams.count))", systemImage: "rosette")
                                        .scaledFont(.headline, weight: .semibold)
                                        .foregroundStyle(BrandTheme.deepGold)
                                    Text("Click any diploma to personalize & export PDF/PNG")
                                        .scaledFont(.caption, design: .monospaced)
                                        .foregroundStyle(.secondary)
                                }
                            }

                            LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(255, scale: fontScale)), spacing: 12)], spacing: 12) {
                                ForEach(passedFilteredExams) { passedAttempt in
                                    let cert = CertificateService.buildCertificate(
                                        for: passedAttempt,
                                        learnerName: store.learnerState.learnerName,
                                        passingScorePercent: store.exam(for: passedAttempt)?.exam.passingScorePercent ?? 60
                                    )
                                    Button {
                                        NativeAudioEngine.shared.playSuccessChime()
                                        certificateAttempt = passedAttempt
                                    } label: {
                                        VStack(alignment: .leading, spacing: 8) {
                                            HStack(alignment: .top) {
                                                VStack(alignment: .leading, spacing: 3) {
                                                    Text("★ \(cert.honorsTitle)")
                                                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                                        .foregroundStyle(BrandTheme.deepGold)
                                                    Text("\(cert.language.flag) \(cert.language.name) · Level \(cert.level.rawValue)")
                                                        .scaledFont(.subheadline, weight: .bold, design: .serif)
                                                        .foregroundStyle(.primary)
                                                }
                                                Spacer()
                                                Text("\(cert.overallScore)%")
                                                    .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 3)
                                                    .background(Capsule().fill(Color(red: 0.047, green: 0.071, blue: 0.129)))
                                                    .foregroundStyle(BrandTheme.champagneGold)
                                            }
                                            Text(cert.officialGradeLabel)
                                                .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                                                .foregroundStyle(BrandTheme.editorialBlue)
                                                .lineLimit(1)
                                            GoldenGateSectionHairline()
                                            HStack {
                                                Text(cert.certificateId)
                                                    .scaledFont(.caption2, design: .monospaced)
                                                    .foregroundStyle(.secondary)
                                                    .lineLimit(1)
                                                Spacer()
                                                Text("Open Diploma →")
                                                    .scaledFont(.caption2, weight: .bold)
                                                    .foregroundStyle(BrandTheme.deepGold)
                                            }
                                        }
                                        .padding(14)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.champagneGold, interactive: true)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(20)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                    }

                    // Exam History
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Simulated Exam History (\(filteredExams.count))")
                                .scaledFont(.headline, weight: .semibold)
                            Spacer()
                            if !filteredExams.isEmpty {
                                Text("Click any exam for full report")
                                    .scaledFont(.caption, design: .monospaced)
                                    .foregroundStyle(BrandTheme.editorialBlue)
                            }
                        }

                        if filteredExams.isEmpty {
                            Text(store.learnerState.examHistory.isEmpty
                                 ? "No simulated exams recorded yet. Open Exam Arena to take your first 4-skill exam."
                                 : "No simulated exams recorded for this language filter yet.")
                                .scaledFont(.subheadline)
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(filteredExams) { attempt in
                                examHistoryRowButton(attempt: attempt)
                            }
                        }
                    }
                    .padding(20)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                    // Recent Study Activity
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Recent Study Timeline")
                            .scaledFont(.headline, weight: .semibold)
                        if store.learnerState.activityLog.isEmpty {
                            Text("Complete course units, pre-tests, or mock exams to log your learning history.")
                                .scaledFont(.subheadline)
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(store.learnerState.activityLog.prefix(15)) { entry in
                                HStack(alignment: .top, spacing: 10) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .scaledFont(.caption)
                                        .foregroundStyle(BrandTheme.emeraldMint)
                                        .padding(.top, 2)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(entry.title).scaledFont(.subheadline, weight: .semibold)
                                        Text(entry.detail).scaledFont(.caption).foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    .padding(20)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
        }
        .sheet(item: $selectedAttempt) { attempt in
            ExamAttemptDetailSheetView(store: store, attempt: attempt)
                .applyAppFontScale(store)
        }
        .sheet(item: $certificateAttempt) { attempt in
            LinguaVerveCertificateSheetView(store: store, attempt: attempt)
                .applyAppFontScale(store)
        }
        .confirmationDialog("Reset All Progress & Test History?", isPresented: $showResetConfirm) {
            Button("Reset Everything", role: .destructive) {
                store.resetLearnerProgress()
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    private var languageFilterPicker: some View {
        let binding = Binding<ProgressLanguageFilter>(
            get: { ProgressLanguageFilter(rawValue: filterLang) ?? .all },
            set: { filterLang = $0.rawValue }
        )

        return GoldenGateSegmentedControl(
            items: ProgressLanguageFilter.allCases,
            selection: binding,
            allowHorizontalScroll: true
        ) { option, selected in
            Text(option.title)
                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
        }
    }

    private func examHistoryRowButton(attempt: ExamAttemptRecord) -> some View {
        let gradeLabel = attempt.officialGradeLabel ?? MockExam.officialGradeLabel(
            languageId: attempt.languageId,
            level: attempt.level,
            overallScore: attempt.overallScore,
            allModulesPassed: SkillType.allCases.allSatisfy { attempt.skills[$0.rawValue]?.passed ?? false },
            passingScorePercent: store.exam(for: attempt)?.exam.passingScorePercent ?? 60
        )
        let levelColor = BrandTheme.cefrColor(for: attempt.level.rawValue)

        return Button {
            NativeAudioEngine.shared.playClickSound()
            selectedAttempt = attempt
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top, spacing: 10) {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text("\(LearningLanguage.from(attempt.languageId).flag) \(attempt.examTitle)")
                                .scaledFont(.subheadline, weight: .bold)
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.leading)
                            Text(attempt.level.rawValue)
                                .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(levelColor.opacity(0.14)))
                                .foregroundStyle(levelColor)
                        }
                        Text(gradeLabel)
                            .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text("\(attempt.overallScore)% · \(attempt.passed ? "PASS" : "RETRY")")
                        .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 4)
                        .background(Capsule().fill((attempt.passed ? BrandTheme.emeraldMint : BrandTheme.deepGold).opacity(0.15)))
                        .foregroundStyle(attempt.passed ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                }

                FlowLayout(spacing: 8, lineSpacing: 4) {
                    ForEach(SkillType.allCases) { sk in
                        let skillScore = attempt.skills[sk.rawValue]
                        let sc = skillScore?.score ?? 0
                        let passedSkill = skillScore?.passed ?? false
                        Text("\(sk.shortName): \(sc)%")
                            .scaledFont(.caption2, weight: .semibold, design: .monospaced, monospacedDigit: true)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(RoundedRectangle(cornerRadius: 6).fill((passedSkill ? BrandTheme.emeraldMint : BrandTheme.deepGold).opacity(0.12)))
                            .foregroundStyle(passedSkill ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                    }
                }

                HStack {
                    Text("\(ExamAttemptDetailSheetView.formattedTimestamp(attempt.timestamp)) · \(attempt.mode.uppercased()) · \(ExamAttemptDetailSheetView.formatClock(attempt.durationUsedSeconds))")
                        .scaledFont(.caption2, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(.secondary)
                    Spacer()
                    if attempt.passed {
                        Label("Certificate", systemImage: "rosette")
                            .scaledFont(.caption2, weight: .bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.20)))
                            .foregroundStyle(BrandTheme.deepGold)
                    }
                    Label("Inspect Details", systemImage: "chevron.right")
                        .labelStyle(.titleAndIcon)
                        .scaledFont(.caption2, weight: .semibold)
                        .foregroundStyle(BrandTheme.editorialBlue)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, interactive: true)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var titleBlock: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Learning Dossier")
                .scaledFont(.footnote, weight: .semibold)
                .foregroundStyle(BrandTheme.editorialBlue)
            Text("Progress & Milestones")
                .scaledFont(.largeTitle, weight: .bold, design: .serif)
        }
    }

    private var backupButtons: some View {
        HStack(spacing: 8) {
            Button {
                PlatformClipboard.copy(store.exportProgressJSON())
                NativeAudioEngine.shared.playClickSound()
                copiedBackup = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copiedBackup = false }
            } label: {
                Label(copiedBackup ? "Copied JSON" : "Copy JSON Backup", systemImage: copiedBackup ? "checkmark" : "square.and.arrow.up")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: copiedBackup, accent: BrandTheme.emeraldMint))

            Button(role: .destructive) {
                showResetConfirm = true
            } label: {
                Text("Reset")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(accent: .red))
        }
    }

    private func kpiCard(title: String, value: String, icon: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(tint.opacity(0.13))
                    .frame(width: 26, height: 26)
                    .overlay {
                        Image(systemName: icon)
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(tint)
                    }
                Text(title)
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(.secondary)
            }
            Text(value)
                .scaledFont(.title2, weight: .bold, design: .monospaced, monospacedDigit: true)
                .foregroundStyle(.primary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    private func zeroToHeroCard(languageId: String, title: String) -> some View {
        let courses = store.courses(for: languageId)
        return VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .scaledFont(.headline, weight: .bold, design: .serif)

            ForEach(courses) { course in
                let pct = store.courseCompletionPercent(for: course)
                let lvlColor = BrandTheme.cefrColor(for: course.level.rawValue)
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    store.openCourse(languageId: languageId, level: course.level)
                } label: {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("\(course.level.rawValue) · \(course.heroRole.components(separatedBy: "·").last?.trimmingCharacters(in: .whitespaces) ?? "")")
                                .scaledFont(.caption, weight: .semibold)
                                .foregroundStyle(.primary)
                            Spacer()
                            Text("\(pct)%")
                                .scaledFont(.caption2, weight: .bold, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(pct > 0 ? lvlColor : .secondary)
                        }
                        ProgressView(value: Double(pct), total: 100.0)
                            .tint(lvlColor)
                    }
                    .padding(11)
                    .goldenGateSurface(cornerRadius: 10, interactive: true)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }
}
