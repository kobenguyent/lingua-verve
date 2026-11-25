import SwiftUI
import LinguaVerveCore

public struct ProgressDashboardNativeView: View {
    @Bindable var store: CurriculumStore
    @State private var copiedBackup = false
    @State private var showResetConfirm = false

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let streak = store.studyStreak()
        let totalModules = store.bundle.intensiveCourses.flatMap(\.modules).count
        let passedExams = store.learnerState.examHistory.filter(\.passed).count
        let skillAvgs = store.skillAverages()

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
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

                // KPI Grid
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                    kpiCard(title: "Study Streak", value: "\(streak)d", icon: "flame.fill", tint: .orange)
                    kpiCard(title: "Course Units", value: "\(store.learnerState.completedModuleIds.count)/\(totalModules)", icon: "graduationcap.fill", tint: BrandTheme.celestialSky)
                    kpiCard(title: "Exams Passed", value: "\(passedExams)/\(store.learnerState.examHistory.count)", icon: "rosette", tint: BrandTheme.emeraldMint)
                    kpiCard(title: "Pre-Tests", value: "\(store.learnerState.preTestHistory.count)", icon: "checklist", tint: .indigo)
                    kpiCard(title: "AI / Tips", value: "\(store.learnerState.aiSessionHistory.count) · \(store.masteredIds.count)", icon: "sparkles", tint: .purple)
                }

                // 4-Skill Averages
                VStack(alignment: .leading, spacing: 10) {
                    Text("4-SKILL COMPETENCY AVERAGES")
                        .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                        .foregroundStyle(.secondary)

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 10)], spacing: 10) {
                        ForEach(SkillType.allCases) { sk in
                            let stat = skillAvgs[sk] ?? (0, 0)
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Label(sk.displayName, systemImage: sk.systemImage)
                                        .font(.caption.weight(.bold))
                                    Spacer()
                                    Text(stat.samples > 0 ? "\(stat.average)%" : "—")
                                        .font(.subheadline.monospaced().bold())
                                }
                                ProgressView(value: Double(stat.average), total: 100.0)
                                    .tint(BrandTheme.celestialSky)
                                Text(stat.samples > 0 ? "\(stat.samples) recorded test(s)" : "No tests recorded yet")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(12)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                        }
                    }
                }
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

                // Zero-to-Hero Maps (English & German)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 300), spacing: 14)], spacing: 14) {
                    zeroToHeroCard(languageId: "english", title: "🇬🇧 English Zero-to-Hero (A1–C2)")
                    zeroToHeroCard(languageId: "german", title: "🇩🇪 German Zero-to-Hero (A1–C2)")
                }

                // Exam History
                VStack(alignment: .leading, spacing: 10) {
                    Text("SIMULATED EXAM HISTORY (\(store.learnerState.examHistory.count))")
                        .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                        .foregroundStyle(.secondary)

                    if store.learnerState.examHistory.isEmpty {
                        Text("No simulated exams recorded yet. Open Exam Arena to take your first 4-skill exam.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(store.learnerState.examHistory) { attempt in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("\(attempt.languageId == "german" ? "🇩🇪" : "🇬🇧") \(attempt.examTitle)")
                                        .font(.subheadline.weight(.bold))
                                    Spacer()
                                    Text("\(attempt.overallScore)% · \(attempt.passed ? "PASS" : "RETRY")")
                                        .font(.caption.monospaced().bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill((attempt.passed ? BrandTheme.emeraldMint : .orange).opacity(0.16)))
                                        .foregroundStyle(attempt.passed ? BrandTheme.emeraldMint : .orange)
                                }
                                FlowLayout(spacing: 10, lineSpacing: 4) {
                                    ForEach(SkillType.allCases) { sk in
                                        let sc = attempt.skills[sk.rawValue]?.score ?? 0
                                        Text("\(sk.shortName): \(sc)%")
                                            .font(.caption.monospaced())
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .padding(12)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                        }
                    }
                }
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

                // Recent Study Activity
                VStack(alignment: .leading, spacing: 8) {
                    Text("RECENT STUDY TIMELINE")
                        .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                        .foregroundStyle(.secondary)
                    if store.learnerState.activityLog.isEmpty {
                        Text("Complete course units, pre-tests, or mock exams to log your learning history.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(store.learnerState.activityLog.prefix(15)) { entry in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.caption)
                                    .foregroundStyle(BrandTheme.emeraldMint)
                                    .padding(.top, 2)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(entry.title).font(.caption.weight(.bold))
                                    Text(entry.detail).font(.caption2).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
            }
            .padding(16)
            .frame(maxWidth: 980)
            .frame(maxWidth: .infinity)
        }
        .confirmationDialog("Reset All Progress & Test History?", isPresented: $showResetConfirm) {
            Button("Reset Everything", role: .destructive) {
                store.resetLearnerProgress()
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    private var titleBlock: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("PROGRESS, HISTORY & TEST RESULTS")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(BrandTheme.celestialSky)
            Text("Your Zero-to-Hero Polyglot Dossier")
                .font(.system(size: 22, weight: .bold, design: .serif))
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
                .font(.caption)
                .foregroundStyle(tint)
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .monospaced))
                .monospacedDigit()
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.04)))
    }

    private func zeroToHeroCard(languageId: String, title: String) -> some View {
        let courses = store.courses(for: languageId)
        return VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline)
            ForEach(courses) { course in
                let pct = store.courseCompletionPercent(for: course)
                Button {
                    store.openCourse(languageId: languageId, level: course.level)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("\(course.level.rawValue) · \(course.heroRole.components(separatedBy: "·").last?.trimmingCharacters(in: .whitespaces) ?? "")")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.primary)
                            Spacer()
                            Text("\(pct)%")
                                .font(.caption2.monospaced())
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
