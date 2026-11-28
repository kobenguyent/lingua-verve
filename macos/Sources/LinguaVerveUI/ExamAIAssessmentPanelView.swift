import SwiftUI
import LinguaVerveCore

public struct ExamAIAssessmentPanelView: View {
    @Bindable var store: CurriculumStore
    let attempt: ExamAttemptRecord
    let assessment: ExamAIAssessment
    let isAnalyzing: Bool
    let onRunAIAnalysis: (() -> Void)?
    let onOpenAISettings: (() -> Void)?
    let onPracticeSkillInCoach: ((SkillType) -> Void)?

    @State private var selectedSkill: SkillType
    @State private var copiedUpgrade = false

    public init(
        store: CurriculumStore,
        attempt: ExamAttemptRecord,
        assessment: ExamAIAssessment,
        isAnalyzing: Bool = false,
        onRunAIAnalysis: (() -> Void)? = nil,
        onOpenAISettings: (() -> Void)? = nil,
        onPracticeSkillInCoach: ((SkillType) -> Void)? = nil
    ) {
        self.store = store
        self.attempt = attempt
        self.assessment = assessment
        self.isAnalyzing = isAnalyzing
        self.onRunAIAnalysis = onRunAIAnalysis
        self.onOpenAISettings = onOpenAISettings
        self.onPracticeSkillInCoach = onPracticeSkillInCoach
        self._selectedSkill = State(initialValue: assessment.prioritySkill)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            executiveHeaderCard
            skillTabsSelector
            if let insight = assessment.insight(for: selectedSkill) {
                skillDeepInsightCard(insight)
            }
            if !assessment.studyPlan.isEmpty {
                studyPlanSection
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    // MARK: - Executive Header

    private var executiveHeaderCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 10) {
                    headerTitleBlock
                    Spacer()
                    headerActionButton
                }
                VStack(alignment: .leading, spacing: 8) {
                    headerTitleBlock
                    headerActionButton
                }
            }

            Text(assessment.overallSummary)
                .scaledFont(.subheadline)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)

            FlowLayout(spacing: 8, lineSpacing: 6) {
                badgePill(
                    icon: "checkmark.seal.fill",
                    text: assessment.readinessVerdict,
                    tint: attempt.passed ? BrandTheme.emeraldMint : .orange
                )
                badgePill(
                    icon: "star.fill",
                    text: "Strongest: \(assessment.strongestSkill.shortName) (\(attempt.skills[assessment.strongestSkill.rawValue]?.score ?? 0)%)",
                    tint: BrandTheme.emeraldMint
                )
                badgePill(
                    icon: "target",
                    text: "Priority Focus: \(assessment.prioritySkill.shortName) (\(attempt.skills[assessment.prioritySkill.rawValue]?.score ?? 0)%)",
                    tint: .orange
                )
            }
        }
    }

    private var headerTitleBlock: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Image(systemName: assessment.source == "ai" ? "sparkles" : "chart.bar.doc.horizontal")
                    .foregroundStyle(BrandTheme.editorialBlue)
                Text(assessment.source == "ai" ? "AI 4-Skill Examiner Assessment" : "4-Skill Diagnostic Assessment")
                    .scaledFont(.footnote, weight: .semibold)
                    .foregroundStyle(BrandTheme.editorialBlue)
            }
            Text("Evaluated by: \(assessment.providerLabel)")
                .scaledFont(.caption2, design: .monospaced)
                .foregroundStyle(.secondary)
        }
    }

    @ViewBuilder
    private var headerActionButton: some View {
        if isAnalyzing {
            HStack(spacing: 6) {
                ProgressView()
                    .controlSize(.small)
                Text("Analyzing 4 skills with AI…")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(BrandTheme.editorialBlue)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .goldenGateGlassPill(isSelected: true, accent: BrandTheme.editorialBlue)
        } else if store.aiConfig.isReady, let onRunAIAnalysis {
            Button {
                NativeAudioEngine.shared.playClickSound()
                onRunAIAnalysis()
            } label: {
                Label(
                    assessment.source == "ai" ? "Re-analyze with AI" : "Run AI 4-Skill Analysis",
                    systemImage: "sparkles"
                )
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.editorialBlue))
        } else if !store.aiConfig.isReady, let onOpenAISettings {
            Button {
                NativeAudioEngine.shared.playClickSound()
                onOpenAISettings()
            } label: {
                Label("Connect AI for Deeper Analysis", systemImage: "cpu")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle())
        }
    }

    private func badgePill(icon: String, text: String, tint: Color) -> some View {
        Label(text, systemImage: icon)
            .scaledFont(.caption2, weight: .bold, design: .monospaced)
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(Capsule().fill(tint.opacity(0.14)))
            .foregroundStyle(tint)
    }

    // MARK: - 4-Skill Selector Tabs

    private var skillTabsSelector: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 155), spacing: 10)], spacing: 10) {
            ForEach(SkillType.allCases) { sk in
                let isSelected = selectedSkill == sk
                let sc = attempt.skills[sk.rawValue]?.score ?? 0
                let passedSkill = attempt.skills[sk.rawValue]?.passed ?? false
                let aiDone = assessment.insight(for: sk)?.aiAnalyzed ?? false

                Button {
                    NativeAudioEngine.shared.playClickSound()
                    withAnimation(GoldenGateMetrics.snappySpring) {
                        selectedSkill = sk
                    }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: sk.systemImage)
                            .scaledFont(.caption)
                            .foregroundStyle(isSelected ? BrandTheme.editorialBlue : .secondary)
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 4) {
                                Text(sk.shortName)
                                    .scaledFont(.caption, weight: .bold)
                                if aiDone {
                                    Image(systemName: "sparkles")
                                        .scaledFont(.caption2)
                                        .foregroundStyle(BrandTheme.editorialBlue)
                                }
                            }
                            Text("\(sc)% · \(passedSkill ? "PASS" : "FOCUS")")
                                .scaledFont(.caption2, weight: .semibold, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(
                        cornerRadius: GoldenGateMetrics.nestedCornerRadius,
                        tint: isSelected ? BrandTheme.editorialBlue : nil,
                        interactive: true
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Selected Skill Deep Diagnostic Card

    private func skillDeepInsightCard(_ insight: ExamSkillInsight) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .center) {
                    skillCardHeading(insight)
                    Spacer()
                    practiceCoachButton(for: insight.skill)
                }
                VStack(alignment: .leading, spacing: 8) {
                    skillCardHeading(insight)
                    practiceCoachButton(for: insight.skill)
                }
            }

            Text(insight.summary)
                .scaledFont(.caption)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)

            // Strengths & Weaknesses
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 10)], spacing: 10) {
                if !insight.strengths.isEmpty {
                    bulletBox(
                        title: "What Worked Well",
                        icon: "checkmark.circle.fill",
                        tint: BrandTheme.emeraldMint,
                        items: insight.strengths
                    )
                }
                if !insight.weaknesses.isEmpty {
                    bulletBox(
                        title: "Patterns & Gaps Found",
                        icon: "exclamationmark.triangle.fill",
                        tint: .orange,
                        items: insight.weaknesses
                    )
                }
            }

            // Structured Before -> After Corrections
            if !insight.corrections.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Targeted Corrections (\(insight.corrections.count))", systemImage: "wand.and.stars")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.editorialBlue)

                    ForEach(insight.corrections) { item in
                        correctionRow(item)
                    }
                }
            }

            // Tailored Suggestions
            if !insight.suggestions.isEmpty {
                bulletBox(
                    title: "Actionable Suggestions for \(insight.skill.shortName)",
                    icon: "lightbulb.fill",
                    tint: BrandTheme.editorialBlue,
                    items: insight.suggestions
                )
            }

            // AI Upgraded Rewrite (Writing & Speaking)
            if let upgraded = insight.upgradedVersion,
               !upgraded.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                upgradedRewriteBox(skill: insight.skill, text: upgraded)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    private func skillCardHeading(_ insight: ExamSkillInsight) -> some View {
        HStack(spacing: 8) {
            Label("\(insight.skill.displayName) Insights", systemImage: insight.skill.systemImage)
                .scaledFont(.headline, weight: .bold, design: .serif)
            if let cefr = insight.cefrEstimate {
                Text("Est. \(cefr.rawValue)")
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.14)))
                    .foregroundStyle(BrandTheme.editorialBlue)
            }
            if insight.aiAnalyzed {
                Text("AI Analyzed")
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.indigo.opacity(0.14)))
                    .foregroundStyle(.indigo)
            }
        }
    }

    @ViewBuilder
    private func practiceCoachButton(for skill: SkillType) -> some View {
        if let onPracticeSkillInCoach {
            Button {
                NativeAudioEngine.shared.playClickSound()
                onPracticeSkillInCoach(skill)
            } label: {
                Label("Drill \(skill.shortName) in AI Coach", systemImage: "bubble.left.and.text.bubble.right.fill")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle())
        }
    }

    private func bulletBox(title: String, icon: String, tint: Color, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
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
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: 10, tint: tint)
    }

    private func correctionRow(_ item: ExamCorrectionItem) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            if let tag = item.sectionTag, !tag.isEmpty {
                Text(tag)
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.14)))
                    .foregroundStyle(BrandTheme.editorialBlue)
            }
            if !item.original.isEmpty {
                Label(item.original, systemImage: "xmark.circle.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(.red)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if !item.corrected.isEmpty {
                Label(item.corrected, systemImage: "checkmark.circle.fill")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(BrandTheme.emeraldMint)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if !item.explanation.isEmpty {
                Text(item.explanation)
                    .scaledFont(.caption2)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: 10)
    }

    private func upgradedRewriteBox(skill: SkillType, text: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("AI Higher-Band Rewrite (\(attempt.level.rawValue)+)", systemImage: "sparkles")
                    .scaledFont(.caption, weight: .bold)
                    .foregroundStyle(BrandTheme.emeraldMint)
                Spacer()
                if skill == .speaking {
                    Button {
                        NativeAudioEngine.shared.speak(text, languageId: attempt.languageId)
                    } label: {
                        Label("Hear Rewrite", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }
                Button {
                    PlatformClipboard.copy(text)
                    NativeAudioEngine.shared.playClickSound()
                    copiedUpgrade = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copiedUpgrade = false }
                } label: {
                    Label(copiedUpgrade ? "Copied" : "Copy", systemImage: copiedUpgrade ? "checkmark" : "doc.on.doc")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: copiedUpgrade, accent: BrandTheme.emeraldMint))
            }
            Text(text)
                .scaledFont(.subheadline)
                .textSelection(.enabled)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: 10, tint: BrandTheme.emeraldMint)
    }

    // MARK: - Prioritized Study Plan

    private var studyPlanSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Prioritized Study Action Plan")
                .scaledFont(.subheadline, weight: .semibold)
                .foregroundStyle(.secondary)

            ForEach(assessment.studyPlan) { step in
                HStack(alignment: .top, spacing: 10) {
                    Text("#\(step.priority)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .frame(width: 26, height: 26)
                        .background(Circle().fill(BrandTheme.editorialBlue.opacity(0.14)))
                        .foregroundStyle(BrandTheme.editorialBlue)

                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 6) {
                            Text(step.title)
                                .scaledFont(.subheadline, weight: .semibold)
                            Text("· \(step.targetMinutes)m")
                                .scaledFont(.caption2, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(.secondary)
                        }
                        Text(step.action)
                            .scaledFont(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer()

                    if let onPracticeSkillInCoach {
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            onPracticeSkillInCoach(step.skill)
                        } label: {
                            Label("Drill", systemImage: "arrow.right")
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
            }
        }
    }
}
