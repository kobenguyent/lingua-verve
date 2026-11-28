import SwiftUI
import LinguaVerveCore

public struct PreTestNativeView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    @State private var started = false
    @State private var currentIndex = 0
    @State private var answers: [String: Int] = [:]
    @State private var audioPlays: [String: Int] = [:]
    @State private var latestResult: PreTestResult?

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let lang = LearningLanguage.normalize(store.courseLanguageId)
        let questions = store.preTestQuestions(for: lang)
        let displayedResult = latestResult?.languageId == lang
            ? latestResult
            : store.learnerState.preTestHistory.first(where: { $0.languageId == lang })

        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 26) {
                    controlRail

                    GoldenGateSectionHairline()

                    if started, currentIndex < questions.count {
                        activeQuestionCard(
                            question: questions[currentIndex],
                            totalCount: questions.count,
                            languageId: lang
                        )
                    } else if let res = displayedResult {
                        resultEditorialView(result: res)
                    } else {
                        introHeroView(totalCount: questions.count, languageId: lang)
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
                .animation(GoldenGateMetrics.panelAnimation, value: started)
                .animation(GoldenGateMetrics.contentFade, value: currentIndex)
            }
        }
        .onChange(of: store.courseLanguageId) { _, _ in
            started = false
            answers = [:]
            audioPlays = [:]
            currentIndex = 0
        }
    }

    // MARK: - Unboxed Top Control Rail

    private var controlRail: some View {
        let langBinding = Binding<LearningLanguage>(
            get: { LearningLanguage.from(store.courseLanguageId) },
            set: { store.courseLanguageId = $0.rawValue }
        )

        return ViewThatFits(in: .horizontal) {
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("CEFR Placement")
                        .scaledFont(.footnote, weight: .semibold)
                        .foregroundStyle(BrandTheme.editorialBlue)
                    Text("Scored 4-Skill Level Check")
                        .scaledFont(.title2, weight: .bold, design: .serif)
                }

                Spacer(minLength: 12)

                GoldenGateSegmentedControl(
                    items: LearningLanguage.allCases,
                    selection: langBinding,
                    allowHorizontalScroll: false
                ) { option, selected in
                    Text("\(option.flag) \(option.shortCode)")
                        .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("CEFR Placement")
                        .scaledFont(.footnote, weight: .semibold)
                        .foregroundStyle(BrandTheme.editorialBlue)
                    Text("Scored 4-Skill Level Check")
                        .scaledFont(.title2, weight: .bold, design: .serif)
                }

                GoldenGateSegmentedControl(
                    items: LearningLanguage.allCases,
                    selection: langBinding,
                    allowHorizontalScroll: true
                ) { option, selected in
                    Text("\(option.flag) \(option.shortCode)")
                        .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                }
            }
        }
    }

    // MARK: - Intro State

    private func introHeroView(totalCount: Int, languageId: String) -> some View {
        VStack(alignment: .leading, spacing: 22) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Verify Your CEFR Level")
                    .scaledFont(.largeTitle, weight: .bold, design: .serif)
                    .fixedSize(horizontal: false, vertical: true)

                Text("Complete a \(totalCount)-item diagnostic across Reading, Spoken Listening, Writing Grammar, and Speaking Pragmatics from A1 to C2 to unlock your recommended intensive course path.")
                    .scaledFont(.body)
                    .lineSpacing(4)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(195, scale: fontScale)), spacing: 12)],
                spacing: 12
            ) {
                previewChip(icon: "book.closed", title: "Reading", detail: "Passage & context nuance", tint: BrandTheme.editorialBlue)
                previewChip(icon: "headphones", title: "Listening", detail: "Natural spoken audio prompts", tint: .indigo)
                previewChip(icon: "square.and.pencil", title: "Writing", detail: "Syntax & register precision", tint: BrandTheme.deepGold)
                previewChip(icon: "mic", title: "Speaking", detail: "Conversational pragmatics", tint: BrandTheme.emeraldMint)
            }

            HStack(spacing: 14) {
                Button {
                    startFresh()
                } label: {
                    Label("Start Scored Pre-Test", systemImage: "play.fill")
                }
                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))

                Text("\(totalCount) items · \(LearningLanguage.from(languageId).name) · A1–C2")
                    .scaledFont(.footnote, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func previewChip(icon: String, title: String, detail: String, tint: Color) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(tint.opacity(0.13))
                .frame(width: 30, height: 30)
                .overlay {
                    Image(systemName: icon)
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(tint)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .scaledFont(.subheadline, weight: .semibold)
                    .foregroundStyle(.primary)
                Text(detail)
                    .scaledFont(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    // MARK: - Active Question Card

    private func activeQuestionCard(question q: PreTestQuestion, totalCount: Int, languageId: String) -> some View {
        let levelColor = BrandTheme.cefrColor(for: q.level.rawValue)
        let questions = store.preTestQuestions(for: languageId)

        return VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 10) {
                Text("Item \(currentIndex + 1) of \(totalCount)")
                    .scaledFont(.footnote, weight: .semibold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(.secondary)

                Spacer()

                Label("\(q.level.rawValue) · \(q.skill.displayName)", systemImage: q.skill.systemImage)
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(levelColor.opacity(0.14)))
                    .foregroundStyle(levelColor)
            }

            ProgressView(value: Double(currentIndex + 1), total: Double(max(1, totalCount)))
                .tint(BrandTheme.editorialBlue)

            if let passage = q.passage {
                Text(passage)
                    .scaledFont(.body)
                    .lineSpacing(4)
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
            }

            if let script = q.audioScript {
                let used = audioPlays[q.id, default: 0]
                HStack(spacing: 12) {
                    Button {
                        guard used < 2 else { return }
                        audioPlays[q.id] = used + 1
                        NativeAudioEngine.shared.speak(script, languageId: languageId, slow: false)
                    } label: {
                        Label(
                            used >= 2 ? "Replays Used (2/2)" : "Play Spoken Audio (\(2 - used) left)",
                            systemImage: "speaker.wave.2.fill"
                        )
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
                    .disabled(used >= 2)
                }
            }

            Text(q.prompt)
                .scaledFont(.title3, weight: .bold, design: .serif)
                .fixedSize(horizontal: false, vertical: true)

            VStack(spacing: 10) {
                ForEach(Array(q.options.enumerated()), id: \.offset) { idx, opt in
                    let isSelected = answers[q.id] == idx
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            answers[q.id] = idx
                            if currentIndex + 1 < questions.count {
                                currentIndex += 1
                            } else {
                                NativeAudioEngine.shared.stopSpeech()
                                NativeAudioEngine.shared.playSuccessChime()
                                latestResult = store.evaluateAndRecordPreTest(languageId: languageId, answers: answers)
                                started = false
                            }
                        }
                    } label: {
                        HStack(alignment: .center, spacing: 12) {
                            let badgeSize = max(28, 28 * min(fontScale, 1.4))
                            Text(["A", "B", "C", "D"][min(idx, 3)])
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                                .foregroundStyle(isSelected ? BrandTheme.editorialBlue : .secondary)
                                .frame(width: badgeSize, height: badgeSize)
                                .background(
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .fill(isSelected ? BrandTheme.editorialBlue.opacity(0.16) : Color.primary.opacity(0.06))
                                )

                            Text(opt)
                                .scaledFont(.subheadline)
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.leading)

                            Spacer()
                        }
                        .padding(13)
                        .goldenGateSurface(
                            cornerRadius: 11,
                            tint: isSelected ? BrandTheme.editorialBlue : nil,
                            interactive: true
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(24)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    // MARK: - Verified Result State

    private func resultEditorialView(result res: PreTestResult) -> some View {
        let levelColor = BrandTheme.cefrColor(for: res.verifiedLevel.rawValue)

        return VStack(alignment: .leading, spacing: 22) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 16) {
                    resultHeroHeader(result: res, levelColor: levelColor)
                    Spacer()
                    Button {
                        startFresh()
                    } label: {
                        Label("Retake", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }

                VStack(alignment: .leading, spacing: 12) {
                    resultHeroHeader(result: res, levelColor: levelColor)
                    Button {
                        startFresh()
                    } label: {
                        Label("Retake", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }
            }

            GoldenGateSectionHairline()

            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(175, scale: fontScale)), spacing: 12)],
                spacing: 12
            ) {
                ForEach(SkillType.allCases) { sk in
                    let score = res.skillScores[sk.rawValue] ?? 0
                    let passedSkill = score >= 60
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Label(sk.shortName, systemImage: sk.systemImage)
                                .scaledFont(.caption, weight: .semibold)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("\(score)%")
                                .scaledFont(.subheadline, weight: .bold, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(passedSkill ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                        }
                        ProgressView(value: Double(score), total: 100.0)
                            .tint(passedSkill ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                    }
                    .padding(14)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Recommended Study Path")
                    .scaledFont(.headline, weight: .semibold)

                ForEach(Array(res.recommendedCourses.enumerated()), id: \.element.id) { idx, step in
                    let stepColor = BrandTheme.cefrColor(for: step.level.rawValue)
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Step \(idx + 1) · \(step.role)")
                                .scaledFont(.caption, weight: .semibold)
                                .foregroundStyle(stepColor)
                            Spacer()
                            Text("CEFR \(step.level.rawValue)")
                                .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(stepColor.opacity(0.14)))
                                .foregroundStyle(stepColor)
                        }

                        Text(step.title)
                            .scaledFont(.headline, weight: .bold, design: .serif)

                        Text(step.reason)
                            .scaledFont(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)

                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            store.openCourse(languageId: res.languageId, level: step.level)
                        } label: {
                            Label("Open \(step.level.rawValue) Course", systemImage: "arrow.right")
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.editorialBlue))
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                }
            }

            Button {
                NativeAudioEngine.shared.playClickSound()
                store.openExamSimulator(languageId: res.languageId, level: res.verifiedLevel)
            } label: {
                Label("Simulate \(res.verifiedLevel.rawValue) 4-Skill Exam", systemImage: "timer")
            }
            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
        }
    }

    private func resultHeroHeader(result res: PreTestResult, levelColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Verified Placement", systemImage: "checkmark.seal.fill")
                .scaledFont(.footnote, weight: .semibold)
                .foregroundStyle(BrandTheme.emeraldMint)

            Text("Verified Level: \(res.verifiedLevel.rawValue)")
                .scaledFont(.largeTitle, weight: .bold, design: .serif)
                .foregroundStyle(.primary)

            Text("Score: \(res.correctCount)/\(res.totalCount) (\(res.overallScore)%) · Target: \(res.suggestedCertificate)")
                .scaledFont(.subheadline, design: .monospaced, monospacedDigit: true)
                .foregroundStyle(.secondary)
        }
    }

    private func startFresh() {
        NativeAudioEngine.shared.playClickSound()
        answers = [:]
        audioPlays = [:]
        currentIndex = 0
        latestResult = nil
        started = true
    }
}
