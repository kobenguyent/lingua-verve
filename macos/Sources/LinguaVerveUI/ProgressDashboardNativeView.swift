import SwiftUI
import LinguaVerveCore

public struct ProgressDashboardNativeView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    @State private var copiedBackup = false
    @State private var showResetConfirm = false
    @State private var filterLang: String = "all"
    @State private var selectedAttempt: ExamAttemptRecord? = nil

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

        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                // Header & Backup Actions
                ViewThatFits(in: .horizontal) {
                    HStack {
                        titleBlock
                        Spacer()
                        backupButtons
                    }
                    VStack(alignment: .leading, spacing: 10) {
                        titleBlock
                        backupButtons
                    }
                }
                .padding(18)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                // KPI Grid
                LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(155, scale: fontScale)), spacing: 10)], spacing: 10) {
                    kpiCard(title: "Study Streak", value: "\(streak)d", icon: "flame.fill", tint: .orange)
                    kpiCard(title: "Course Units", value: "\(store.learnerState.completedModuleIds.count)/\(totalModules)", icon: "graduationcap.fill", tint: BrandTheme.celestialSky)
                    kpiCard(title: "Exams Passed", value: "\(passedExams)/\(store.learnerState.examHistory.count)", icon: "rosette", tint: BrandTheme.emeraldMint)
                    kpiCard(title: "Pre-Tests", value: "\(store.learnerState.preTestHistory.count)", icon: "checklist", tint: .indigo)
                    kpiCard(title: "AI / Tips", value: "\(store.learnerState.aiSessionHistory.count) · \(store.masteredIds.count)", icon: "sparkles", tint: .purple)
                }

                // 4-Skill Averages
                VStack(alignment: .leading, spacing: 10) {
                    ViewThatFits(in: .horizontal) {
                        HStack {
                            Text("4-Skill Competency Averages")
                                .scaledFont(.headline, weight: .semibold)
                            Spacer()
                            languageFilterPicker
                        }
                        VStack(alignment: .leading, spacing: 8) {
                            Text("4-Skill Competency Averages")
                                .scaledFont(.headline, weight: .semibold)
                            languageFilterPicker
                        }
                    }

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(190, scale: fontScale)), spacing: 10)], spacing: 10) {
                        ForEach(SkillType.allCases) { sk in
                            let stat = skillAvgs[sk] ?? (0, 0)
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Label(sk.displayName, systemImage: sk.systemImage)
                                        .scaledFont(.caption, weight: .bold)
                                    Spacer()
                                    Text(stat.samples > 0 ? "\(stat.average)%" : "—")
                                        .scaledFont(.subheadline, weight: .bold, design: .monospaced)
                                }
                                ProgressView(value: Double(stat.average), total: 100.0)
                                    .tint(BrandTheme.celestialSky)
                                Text(stat.samples > 0 ? "\(stat.samples) recorded test(s)" : "No tests recorded yet")
                                    .scaledFont(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(12)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                        }
                    }
                }
                .padding(18)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                // Zero-to-Hero Maps (English & German)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(310, scale: fontScale)), spacing: 14)], spacing: 14) {
                    zeroToHeroCard(languageId: "english", title: "🇬🇧 English Zero-to-Hero (A1–C2)")
                    zeroToHeroCard(languageId: "german", title: "🇩🇪 German Zero-to-Hero (A1–C2)")
                }

                // AI Real-Exam Readiness Advisor (Analyze Exam History -> Ready vs More Practice)
                ExamReadinessAdvisorCardView(store: store, filterLang: filterLang)

                // Exam History
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Simulated Exam History (\(filteredExams.count))")
                            .scaledFont(.headline, weight: .semibold)
                        Spacer()
                        if !filteredExams.isEmpty {
                            Text("Click any exam for full report")
                                .scaledFont(.footnote, design: .monospaced)
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
                .padding(18)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                // Recent Study Activity
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent Study Timeline")
                        .scaledFont(.headline, weight: .semibold)
                    if store.learnerState.activityLog.isEmpty {
                        Text("Complete course units, pre-tests, or mock exams to log your learning history.")
                            .scaledFont(.subheadline)
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(store.learnerState.activityLog.prefix(15)) { entry in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .scaledFont(.caption)
                                    .foregroundStyle(BrandTheme.emeraldMint)
                                    .padding(.top, 2)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(entry.title).scaledFont(.caption, weight: .bold)
                                    Text(entry.detail).scaledFont(.caption2).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
                .padding(18)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
            }
            .padding(16)
            .frame(maxWidth: 980)
            .frame(maxWidth: .infinity)
        }
        .sheet(item: $selectedAttempt) { attempt in
            ExamAttemptDetailSheetView(store: store, attempt: attempt)
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
        Picker("Language Filter", selection: $filterLang) {
            Text("All").tag("all")
            Text("🇬🇧 English").tag("english")
            Text("🇩🇪 German").tag("german")
        }
        .pickerStyle(.segmented)
        .frame(maxWidth: AppTypography.scaledControlWidth(285, scale: fontScale, maxCap: 370))
    }

    private func examHistoryRowButton(attempt: ExamAttemptRecord) -> some View {
        let gradeLabel = attempt.officialGradeLabel ?? MockExam.officialGradeLabel(
            languageId: attempt.languageId,
            level: attempt.level,
            overallScore: attempt.overallScore,
            allModulesPassed: SkillType.allCases.allSatisfy { attempt.skills[$0.rawValue]?.passed ?? false },
            passingScorePercent: store.exam(for: attempt)?.exam.passingScorePercent ?? 60
        )

        return Button {
            NativeAudioEngine.shared.playClickSound()
            selectedAttempt = attempt
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top, spacing: 8) {
                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 6) {
                            Text("\(attempt.languageId == "german" ? "🇩🇪" : "🇬🇧") \(attempt.examTitle)")
                                .scaledFont(.subheadline, weight: .bold)
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.leading)
                            Text(attempt.level.rawValue)
                                .scaledFont(size: 10, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.15)))
                                .foregroundStyle(BrandTheme.celestialSky)
                        }
                        Text(gradeLabel)
                            .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                            .foregroundStyle(.indigo)
                    }
                    Spacer()
                    Text("\(attempt.overallScore)% · \(attempt.passed ? "PASS" : "RETRY")")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill((attempt.passed ? BrandTheme.emeraldMint : .orange).opacity(0.16)))
                        .foregroundStyle(attempt.passed ? BrandTheme.emeraldMint : .orange)
                }

                FlowLayout(spacing: 8, lineSpacing: 4) {
                    ForEach(SkillType.allCases) { sk in
                        let skillScore = attempt.skills[sk.rawValue]
                        let sc = skillScore?.score ?? 0
                        let passedSkill = skillScore?.passed ?? false
                        Text("\(sk.shortName): \(sc)%")
                            .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 2)
                            .background(RoundedRectangle(cornerRadius: 6).fill((passedSkill ? BrandTheme.emeraldMint : Color.orange).opacity(0.12)))
                            .foregroundStyle(passedSkill ? BrandTheme.emeraldMint : .orange)
                    }
                }

                HStack {
                    Text("\(ExamAttemptDetailSheetView.formattedTimestamp(attempt.timestamp)) · \(attempt.mode.uppercased()) · \(ExamAttemptDetailSheetView.formatClock(attempt.durationUsedSeconds))")
                        .scaledFont(.caption2, design: .monospaced)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Label("Inspect Details", systemImage: "chevron.right")
                        .labelStyle(.titleAndIcon)
                        .scaledFont(.caption2, weight: .semibold)
                        .foregroundStyle(BrandTheme.celestialSky)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 11)
                    .fill(Color.primary.opacity(0.04))
                    .overlay(
                        RoundedRectangle(cornerRadius: 11)
                            .stroke(Color.primary.opacity(0.08), lineWidth: 1)
                    )
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var titleBlock: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("PROGRESS, HISTORY & TEST RESULTS")
                .scaledFont(size: 11, weight: .bold, design: .monospaced)
                .foregroundStyle(BrandTheme.celestialSky)
            Text("Your Zero-to-Hero Polyglot Dossier")
                .scaledFont(size: 22, weight: .bold, design: .serif)
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
            .buttonStyle(.borderedProminent)
            .controlSize(.small)

            Button("Reset", role: .destructive) {
                showResetConfirm = true
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
    }

    private func kpiCard(title: String, value: String, icon: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: icon)
                .scaledFont(.caption)
                .foregroundStyle(tint)
            Text(value)
                .scaledFont(size: 20, weight: .bold, design: .monospaced)
                .monospacedDigit()
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.04)))
    }

    private func zeroToHeroCard(languageId: String, title: String) -> some View {
        let courses = store.courses(for: languageId)
        return VStack(alignment: .leading, spacing: 8) {
            Text(title).scaledFont(.headline)
            ForEach(courses) { course in
                let pct = store.courseCompletionPercent(for: course)
                Button {
                    store.openCourse(languageId: languageId, level: course.level)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("\(course.level.rawValue) · \(course.heroRole.components(separatedBy: "·").last?.trimmingCharacters(in: .whitespaces) ?? "")")
                                .scaledFont(.caption, weight: .semibold)
                                .foregroundStyle(.primary)
                            Spacer()
                            Text("\(pct)%")
                                .scaledFont(.caption2, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                        ProgressView(value: Double(pct), total: 100.0)
                            .tint(BrandTheme.emeraldMint)
                    }
                    .padding(9)
                    .background(RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(0.04)))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }
}
