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
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.indigo.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.indigo.opacity(0.22), lineWidth: 1)
                )
        )
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
                    .foregroundStyle(assessment.source == "ai" ? .purple : BrandTheme.celestialSky)
                Text(assessment.source == "ai" ? "AI 4-SKILL EXAMINER ASSESSMENT" : "4-SKILL DIAGNOSTIC ASSESSMENT")
                    .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(assessment.source == "ai" ? .purple : BrandTheme.celestialSky)
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
                Text("Analyzing 4 skills with AI...")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(.purple)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Capsule().fill(Color.purple.opacity(0.14)))
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
            .buttonStyle(.borderedProminent)
            .tint(.purple)
            .controlSize(.small)
        } else if !store.aiConfig.isReady, let onOpenAISettings {
            Button {
                NativeAudioEngine.shared.playClickSound()
                onOpenAISettings()
            } label: {
                Label("Connect AI for Deeper Analysis", systemImage: "cpu")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
    }

    private func badgePill(icon: String, text: String, tint: Color) -> some View {
        Label(text, systemImage: icon)
            .scaledFont(.caption2, weight: .bold, design: .monospaced)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Capsule().fill(tint.opacity(0.14)))
            .foregroundStyle(tint)
    }

    // MARK: - 4-Skill Selector Tabs

    private var skillTabsSelector: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 8)], spacing: 8) {
            ForEach(SkillType.allCases) { sk in
                let isSelected = selectedSkill == sk
                let sc = attempt.skills[sk.rawValue]?.score ?? 0
                let passedSkill = attempt.skills[sk.rawValue]?.passed ?? false
                let aiDone = assessment.insight(for: sk)?.aiAnalyzed ?? false

                Button {
                    NativeAudioEngine.shared.playClickSound()
                    selectedSkill = sk
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: sk.systemImage)
                            .scaledFont(.caption)
                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 4) {
                                Text(sk.shortName)
                                    .scaledFont(.caption, weight: .bold)
                                if aiDone {
                                    Image(systemName: "sparkles")
                                        .scaledFont(.caption2)
                                }
                            }
                            Text("\(sc)% · \(passedSkill ? "PASS" : "FOCUS")")
                                .scaledFont(size: 10, weight: .semibold, design: .monospaced)
                                .opacity(0.85)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(isSelected ? Color.indigo : Color.primary.opacity(0.05))
                    )
                    .foregroundStyle(isSelected ? Color.white : Color.primary)
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
                        .foregroundStyle(.purple)

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
                    tint: BrandTheme.celestialSky,
                    items: insight.suggestions
                )
            }

            // AI Upgraded Rewrite (Writing & Speaking)
            if let upgraded = insight.upgradedVersion,
               !upgraded.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                upgradedRewriteBox(skill: insight.skill, text: upgraded)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.04)))
    }

    private func skillCardHeading(_ insight: ExamSkillInsight) -> some View {
        HStack(spacing: 8) {
            Label("\(insight.skill.displayName) Insights", systemImage: insight.skill.systemImage)
                .scaledFont(.headline, weight: .bold)
            if let cefr = insight.cefrEstimate {
                Text("Est. \(cefr.rawValue)")
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.18)))
                    .foregroundStyle(BrandTheme.celestialSky)
            }
            if insight.aiAnalyzed {
                Text("AI Analyzed")
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.purple.opacity(0.18)))
                    .foregroundStyle(.purple)
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
            .buttonStyle(.bordered)
            .controlSize(.small)
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
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 10).fill(tint.opacity(0.08)))
    }

    private func correctionRow(_ item: ExamCorrectionItem) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            if let tag = item.sectionTag, !tag.isEmpty {
                Text(tag)
                    .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.purple.opacity(0.16)))
                    .foregroundStyle(.purple)
            }
            if !item.original.isEmpty {
                HStack(alignment: .top, spacing: 6) {
                    Text("✗")
                        .scaledFont(.caption, weight: .bold)
                        .foregroundStyle(.red)
                    Text(item.original)
                        .scaledFont(.caption)
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            if !item.corrected.isEmpty {
                HStack(alignment: .top, spacing: 6) {
                    Text("✓")
                        .scaledFont(.caption, weight: .bold)
                        .foregroundStyle(BrandTheme.emeraldMint)
                    Text(item.corrected)
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(BrandTheme.emeraldMint)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            if !item.explanation.isEmpty {
                Text(item.explanation)
                    .scaledFont(.caption2)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 9)
                .fill(Color.primary.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 9)
                        .stroke(Color.purple.opacity(0.18), lineWidth: 1)
                )
        )
    }

    private func upgradedRewriteBox(skill: SkillType, text: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
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
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
                }
                Button {
                    PlatformClipboard.copy(text)
                    NativeAudioEngine.shared.playClickSound()
                    copiedUpgrade = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copiedUpgrade = false }
                } label: {
                    Label(copiedUpgrade ? "Copied" : "Copy", systemImage: copiedUpgrade ? "checkmark" : "doc.on.doc")
                }
                .buttonStyle(.bordered)
                .controlSize(.mini)
            }
            Text(text)
                .scaledFont(.caption)
                .textSelection(.enabled)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(BrandTheme.emeraldMint.opacity(0.09))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(BrandTheme.emeraldMint.opacity(0.25), lineWidth: 1)
                )
        )
    }

    // MARK: - Prioritized Study Plan

    private var studyPlanSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("PRIORITIZED STUDY ACTION PLAN")
                .scaledFont(size: 11, weight: .bold, design: .monospaced)
                .foregroundStyle(.secondary)

            ForEach(assessment.studyPlan) { step in
                HStack(alignment: .top, spacing: 10) {
                    Text("#\(step.priority)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .frame(width: 26, height: 26)
                        .background(Circle().fill(Color.indigo.opacity(0.16)))
                        .foregroundStyle(.indigo)

                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 6) {
                            Text(step.title)
                                .scaledFont(.caption, weight: .bold)
                            Text("· \(step.targetMinutes)m")
                                .scaledFont(.caption2, design: .monospaced)
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
                            Label("Drill", systemImage: "arrow.right.circle.fill")
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.mini)
                    }
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
            }
        }
    }
}
