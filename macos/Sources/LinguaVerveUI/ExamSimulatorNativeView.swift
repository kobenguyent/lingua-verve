import SwiftUI
import Combine
import LinguaVerveCore

public struct ExamSimulatorNativeView: View {
    @Bindable var store: CurriculumStore
    @Binding var showAISettingsSheet: Bool
    @Environment(\.appFontScale) private var fontScale

    @State private var mode: String = "strict" // "strict" | "practice"
    @State private var timingMode: String = "official" // "official" | "sprint"
    @State private var phase: ExamPhase = .lobby
    @State private var activeSection: SkillType = .reading

    // AI Fresh Exam Generator & Bank state
    @State private var selectedExamId: String? = nil
    @State private var selectedTheme: String = ""
    @State private var customTopic: String = ""
    @State private var isGeneratingExam: Bool = false
    @State private var genProgress: [SkillType: SkillGenerationStatus] = [:]
    @State private var genNotice: String?
    @State private var genError: String?

    // Multi-part navigation indices
    @State private var activeReadingIdx: Int = 0
    @State private var activeListeningIdx: Int = 0
    @State private var activeWritingIdx: Int = 0
    @State private var activeSpeakingIdx: Int = 0

    // Timers & multi-part answers
    @State private var remainingSeconds: Int = 3300
    @State private var elapsedSeconds: Int = 0
    @State private var readingAnswers: [String: Int] = [:]
    @State private var listeningAnswers: [String: Int] = [:]
    @State private var listeningPlaysByTrack: [String: Int] = [:]
    @State private var writingByTask: [String: String] = [:]
    @State private var speakingByPart: [String: String] = [:]

    // Pre-read, prep & speaking capture
    @State private var preReadSecondsLeft: Int = 0
    @State private var isPreReading: Bool = false
    @State private var prepSecondsLeft: Int = 0
    @State private var isPrepping: Bool = false
    @State private var speakSecondsLeft: Int = 0
    @State private var recordingPartId: String?
    @State private var speechRecognizer = NativeSpeechRecognizer()

    // Report
    @State private var report: ExamAttemptRecord?
    @State private var writingNotes: [String] = []
    @State private var speakingNotes: [String] = []
    @State private var allModulesPassed: Bool = false
    @State private var showCertificateSheet: Bool = false

    private enum ExamPhase: Equatable {
        case lobby, running, grading, report
    }

    private enum ExamPressureOption: String, CaseIterable, Identifiable, Hashable {
        case strict
        case practice

        var id: String { rawValue }

        var title: String {
            switch self {
            case .strict: return "Strict"
            case .practice: return "Practice"
            }
        }

        var systemImage: String {
            switch self {
            case .strict: return "flame"
            case .practice: return "book.closed"
            }
        }
    }

    private enum ExamClockOption: String, CaseIterable, Identifiable, Hashable {
        case official
        case sprint

        var id: String { rawValue }
    }

    /// Computes sprint pacing duration (50% of official exam time, floored at 15 minutes).
    public static func sprintMinutes(for officialMinutes: Int) -> Int {
        max(15, Int((Double(officialMinutes) * 0.5).rounded()))
    }

    /// Produces a clean, non-redundant examiner status label for display in the Exam Arena.
    public static func examinerStatusLabel(for config: AIProviderConfig) -> String {
        guard config.isReady else {
            return "Built-in 4-Criterion CEFR Rubric"
        }
        if config.provider.isOnDeviceApple || config.model.localizedCaseInsensitiveContains("Apple Intelligence") {
            return "Apple Intelligence · On-Device"
        }
        let trimmedModel = config.model.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedModel.isEmpty {
            return config.provider.label
        }
        return "\(config.provider.label) · \(trimmedModel)"
    }

    public init(store: CurriculumStore, showAISettingsSheet: Binding<Bool>) {
        self.store = store
        self._showAISettingsSheet = showAISettingsSheet
    }

    public var body: some View {
        let lang = LearningLanguage.normalize(store.courseLanguageId)
        let baseExam = store.mockExam(for: lang, level: store.examTargetLevel)
        let savedAIExams = store.generatedExams(for: lang, level: store.examTargetLevel)
        let exam = savedAIExams.first(where: { $0.id == selectedExamId }) ?? baseExam

        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 26) {
                    if let exam, let baseExam {
                        switch phase {
                        case .lobby:
                            lobbyView(exam: exam, baseExam: baseExam, savedAIExams: savedAIExams)
                        case .running:
                            runningView(exam: exam)
                        case .grading:
                            VStack(spacing: 14) {
                                ProgressView().controlSize(.large)
                                Text("Grading Multi-Part 4-Skill Exam…")
                                    .scaledFont(.title3, weight: .bold, design: .serif)
                                Text("Evaluating \(exam.reading.resolvedParts.reduce(0) { $0 + $1.questions.count }) Reading items, \(exam.listening.resolvedTracks.reduce(0) { $0 + $1.questions.count }) Listening items, \(exam.writing.resolvedTasks.count) Weighted Writing tasks, and \(exam.speaking.resolvedParts.count) Speaking parts against CEFR \(exam.level.rawValue).")
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(36)
                            .frame(maxWidth: .infinity)
                            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                        case .report:
                            if let report {
                                reportView(exam: exam, baseExam: baseExam, savedAIExams: savedAIExams, report: report)
                            }
                        }
                    } else {
                        ContentUnavailableView("No Exam Loaded", systemImage: "doc.questionmark")
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
                .animation(GoldenGateMetrics.panelAnimation, value: phase)
                .animation(GoldenGateMetrics.contentFade, value: exam?.id)
            }
        }
        .task(id: phase) {
            guard phase == .running else { return }
            while phase == .running && !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                guard phase == .running, !Task.isCancelled else { break }
                handleTimerTick(activeExam: exam)
            }
        }
        .onChange(of: speechRecognizer.transcript) { _, newVal in
            if !newVal.isEmpty, let partId = recordingPartId {
                speakingByPart[partId] = newVal
            }
        }
        .onDisappear {
            speechRecognizer.stop()
            NativeAudioEngine.shared.stopSpeech()
        }
        .sheet(isPresented: $showCertificateSheet) {
            if let report, report.passed {
                LinguaVerveCertificateSheetView(store: store, attempt: report)
                    .applyAppFontScale(store)
            }
        }
    }

    private func handleTimerTick(activeExam: MockExam?) {
        elapsedSeconds += 1
        if remainingSeconds > 0 {
            remainingSeconds -= 1
        }
        if isPreReading && preReadSecondsLeft > 0 {
            preReadSecondsLeft -= 1
            if preReadSecondsLeft == 0 {
                isPreReading = false
                NativeAudioEngine.shared.playClickSound()
            }
        }
        if isPrepping && prepSecondsLeft > 0 {
            prepSecondsLeft -= 1
            if prepSecondsLeft == 0 {
                isPrepping = false
                NativeAudioEngine.shared.playClickSound()
            }
        }
        if speechRecognizer.isRecording && speakSecondsLeft > 0 {
            speakSecondsLeft -= 1
            if speakSecondsLeft == 0 {
                speechRecognizer.stop()
                NativeAudioEngine.shared.playClickSound()
            }
        }
        if mode == "strict" && remainingSeconds == 0 && elapsedSeconds > 2,
           let active = activeExam {
            Task { await submitExam(active) }
        }
    }

    // MARK: - Lobby View

    @ViewBuilder
    private func lobbyView(exam: MockExam, baseExam: MockExam, savedAIExams: [MockExam]) -> some View {
        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts
        let totalReadQs = readingParts.reduce(0) { $0 + $1.questions.count }
        let totalListenQs = listeningTracks.reduce(0) { $0 + $1.questions.count }
        let configuredMins = timingMode == "official" ? exam.totalMinutes : Self.sprintMinutes(for: exam.totalMinutes)
        let cefrColor = BrandTheme.cefrColor(for: exam.level.rawValue)

        VStack(alignment: .leading, spacing: 26) {
            examControlRail

            GoldenGateSectionHairline()

            // Open, Unboxed Editorial Hero
            VStack(alignment: .leading, spacing: 14) {
                FlowLayout(spacing: 8, lineSpacing: 6) {
                    Text(exam.alignedCertificate)
                        .scaledFont(.footnote, weight: .semibold)
                        .foregroundStyle(cefrColor)

                    Text("· \(configuredMins) min · Pass ≥ \(exam.passingScorePercent)%")
                        .scaledFont(.footnote, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(.secondary)

                    if exam.requireAllSkillsPass == true {
                        Label("All 4 Skills Required", systemImage: "checkmark.shield")
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(BrandTheme.deepGold)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.12)))
                            .overlay(Capsule().strokeBorder(BrandTheme.champagneGold.opacity(0.28), lineWidth: 1))
                    }

                    if exam.aiGenerated == true {
                        Label("AI Paper · \(exam.generatedByModel ?? store.aiConfig.model)", systemImage: "sparkles")
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(BrandTheme.editorialBlue)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.12)))
                    }
                }

                Text(exam.title)
                    .scaledFont(.largeTitle, weight: .bold, design: .serif)
                    .fixedSize(horizontal: false, vertical: true)

                aiExamBankStrip(exam: exam, baseExam: baseExam, savedAIExams: savedAIExams)
            }

            // 4-Skill Blueprint Grid
            LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(205, scale: fontScale)), spacing: 12)], spacing: 12) {
                blueprintCard(
                    step: "01",
                    icon: "book.closed",
                    title: "Reading",
                    metric: "\(readingParts.count) Parts · \(totalReadQs) Qs",
                    detail: "Comprehension + \(LearningLanguage.from(exam.languageId).readingFormatSummary)",
                    tint: BrandTheme.editorialBlue
                )
                blueprintCard(
                    step: "02",
                    icon: "headphones",
                    title: "Listening",
                    metric: "\(listeningTracks.count) Tracks · \(totalListenQs) Qs",
                    detail: listeningTracks.map { accentBadge($0.accentCode, languageId: exam.languageId) }.joined(separator: " · "),
                    tint: .indigo
                )
                blueprintCard(
                    step: "03",
                    icon: "square.and.pencil",
                    title: "Writing",
                    metric: "\(writingTasks.count) Tasks · \(writingTasks.map { "\($0.weightPercent)%" }.joined(separator: "/"))",
                    detail: "Weighted prompts · 4-criterion rubric",
                    tint: BrandTheme.champagneGold
                )
                blueprintCard(
                    step: "04",
                    icon: "mic",
                    title: "Speaking",
                    metric: "\(speakingParts.count) Oral Parts",
                    detail: "Warm-Up + Cue Card + Examiner Pushback",
                    tint: BrandTheme.emeraldMint
                )
            }

            // Session Setup & Primary Launch Card
            sessionSetupCard(exam: exam)

            // Quiet Secondary AI Exam Studio Card
            aiExamGeneratorCard(exam: exam, baseExam: baseExam, savedAIExams: savedAIExams)
        }
        .onChange(of: store.examTargetLevel) { _, _ in
            selectedExamId = nil
            genNotice = nil
            genError = nil
        }
        .onChange(of: store.courseLanguageId) { _, _ in
            selectedExamId = nil
            selectedTheme = ""
            genNotice = nil
            genError = nil
        }
    }

    private var examControlRail: some View {
        let languageBinding = Binding<LearningLanguage>(
            get: { LearningLanguage.from(store.courseLanguageId) },
            set: { newLang in
                store.courseLanguageId = newLang.rawValue
            }
        )

        return ViewThatFits(in: .horizontal) {
            HStack(spacing: 14) {
                GoldenGateSegmentedControl(
                    items: CEFRLevel.allCases,
                    selection: $store.examTargetLevel,
                    accent: BrandTheme.cefrColor(for: store.examTargetLevel.rawValue),
                    allowHorizontalScroll: false
                ) { level, selected in
                    Text(level.rawValue)
                        .scaledFont(.footnote, weight: selected ? .bold : .medium, design: .monospaced)
                }

                Spacer(minLength: 12)

                GoldenGateSegmentedControl(
                    items: LearningLanguage.allCases,
                    selection: languageBinding,
                    allowHorizontalScroll: false
                ) { option, selected in
                    Text("\(option.flag) \(option.shortCode)")
                        .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                GoldenGateSegmentedControl(
                    items: LearningLanguage.allCases,
                    selection: languageBinding,
                    allowHorizontalScroll: true
                ) { option, selected in
                    Text("\(option.flag) \(option.shortCode)")
                        .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                }

                GoldenGateSegmentedControl(
                    items: CEFRLevel.allCases,
                    selection: $store.examTargetLevel,
                    accent: BrandTheme.cefrColor(for: store.examTargetLevel.rawValue),
                    allowHorizontalScroll: true
                ) { level, selected in
                    Text(level.rawValue)
                        .scaledFont(.footnote, weight: selected ? .bold : .medium, design: .monospaced)
                }
            }
        }
    }

    @ViewBuilder
    private func sessionSetupCard(exam: MockExam) -> some View {
        let modeBinding = Binding<ExamPressureOption>(
            get: { mode == "practice" ? .practice : .strict },
            set: { mode = $0.rawValue }
        )
        let clockBinding = Binding<ExamClockOption>(
            get: { timingMode == "sprint" ? .sprint : .official },
            set: { timingMode = $0.rawValue }
        )
        let sprintMins = Self.sprintMinutes(for: exam.totalMinutes)

        VStack(alignment: .leading, spacing: 16) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .center, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Mode")
                            .scaledFont(.caption, weight: .medium)
                            .foregroundStyle(.secondary)
                        GoldenGateSegmentedControl(
                            items: ExamPressureOption.allCases,
                            selection: modeBinding
                        ) { option, selected in
                            Label(option.title, systemImage: option.systemImage)
                                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Pacing")
                            .scaledFont(.caption, weight: .medium)
                            .foregroundStyle(.secondary)
                        GoldenGateSegmentedControl(
                            items: ExamClockOption.allCases,
                            selection: clockBinding
                        ) { option, selected in
                            Text(option == .official ? "Official · \(exam.totalMinutes)m" : "Sprint · \(sprintMins)m")
                                .scaledFont(.footnote, weight: selected ? .semibold : .medium, monospacedDigit: true)
                        }
                    }

                    Spacer(minLength: 0)
                }

                VStack(alignment: .leading, spacing: 14) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Mode")
                            .scaledFont(.caption, weight: .medium)
                            .foregroundStyle(.secondary)
                        GoldenGateSegmentedControl(
                            items: ExamPressureOption.allCases,
                            selection: modeBinding
                        ) { option, selected in
                            Label(option.title, systemImage: option.systemImage)
                                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Pacing")
                            .scaledFont(.caption, weight: .medium)
                            .foregroundStyle(.secondary)
                        GoldenGateSegmentedControl(
                            items: ExamClockOption.allCases,
                            selection: clockBinding
                        ) { option, selected in
                            Text(option == .official ? "Official · \(exam.totalMinutes)m" : "Sprint · \(sprintMins)m")
                                .scaledFont(.footnote, weight: selected ? .semibold : .medium, monospacedDigit: true)
                        }
                    }
                }
            }

            GoldenGateSectionHairline()

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 12) {
                    examinerStatusCluster
                    Spacer(minLength: 12)
                    Button {
                        startExam(exam)
                    } label: {
                        Label("Begin \(exam.level.rawValue) Exam", systemImage: "play.fill")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
                }

                VStack(alignment: .leading, spacing: 12) {
                    examinerStatusCluster
                    Button {
                        startExam(exam)
                    } label: {
                        Label("Begin \(exam.level.rawValue) Exam", systemImage: "play.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    private var examinerStatusCluster: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(store.aiConfig.isReady ? BrandTheme.emeraldMint : Color.secondary.opacity(0.45))
                .frame(width: 7, height: 7)
            Text(Self.examinerStatusLabel(for: store.aiConfig))
                .scaledFont(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            if !store.aiConfig.isReady {
                Button("Connect AI") {
                    NativeAudioEngine.shared.playClickSound()
                    showAISettingsSheet = true
                }
                .buttonStyle(.plain)
                .scaledFont(.footnote, weight: .semibold)
                .foregroundStyle(BrandTheme.editorialBlue)
            }
        }
    }

    @ViewBuilder
    private func aiExamGeneratorCard(exam: MockExam, baseExam: MockExam, savedAIExams: [MockExam]) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Image(systemName: "wand.and.stars")
                            .scaledFont(.subheadline, weight: .semibold)
                            .foregroundStyle(BrandTheme.editorialBlue)
                        Text("AI Exam Studio")
                            .scaledFont(.headline, weight: .semibold)
                            .foregroundStyle(.primary)
                    }
                    Text("Craft an unseen 4-skill \(baseExam.level.rawValue) paper using your connected AI provider.")
                        .scaledFont(.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                if !store.aiConfig.isReady {
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        showAISettingsSheet = true
                    } label: {
                        Label("Connect AI", systemImage: "sparkles")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }
            }

            aiExamControlsRow(baseExam: baseExam, savedAIExams: savedAIExams)

            GoldenGateCollapsiblePanel(isExpanded: isGeneratingExam) {
                aiExamProgressGrid()
            }

            if let genNotice {
                Label(genNotice, systemImage: "checkmark.circle.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(BrandTheme.emeraldMint)
            }
            if let genError {
                Label(genError, systemImage: "exclamationmark.triangle.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(.red)
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    @ViewBuilder
    private func aiExamBankStrip(exam: MockExam, baseExam: MockExam, savedAIExams: [MockExam]) -> some View {
        let builtInActive = exam.aiGenerated != true
        FlowLayout(spacing: 8, lineSpacing: 8) {
            Button {
                NativeAudioEngine.shared.playClickSound()
                withAnimation(GoldenGateMetrics.snappySpring) {
                    selectedExamId = nil
                }
            } label: {
                Label("Official \(baseExam.level.rawValue) Paper", systemImage: "doc.text")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: builtInActive, accent: BrandTheme.editorialBlue))

            ForEach(Array(savedAIExams.enumerated()), id: \.element.id) { idx, gExam in
                let isSelected = exam.id == gExam.id
                let shortTopic = String((gExam.generatedTheme ?? "Custom").prefix(26))
                HStack(spacing: 6) {
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            selectedExamId = gExam.id
                        }
                    } label: {
                        Label("AI #\(savedAIExams.count - idx) · \(shortTopic)", systemImage: "sparkles")
                            .scaledFont(.footnote, weight: isSelected ? .semibold : .medium)
                            .foregroundStyle(isSelected ? BrandTheme.editorialBlue : .primary)
                    }
                    .buttonStyle(.plain)

                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            store.deleteGeneratedExam(id: gExam.id)
                            if selectedExamId == gExam.id {
                                selectedExamId = nil
                            }
                        }
                    } label: {
                        Image(systemName: "xmark")
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Delete AI exam")
                }
                .padding(.horizontal, 13)
                .padding(.vertical, 8)
                .goldenGateGlassPill(isSelected: isSelected, accent: BrandTheme.editorialBlue)
            }
        }
    }

    @ViewBuilder
    private func aiExamControlsRow(baseExam: MockExam, savedAIExams: [MockExam]) -> some View {
        let themes = AIExamGeneratorService.themes(for: baseExam.languageId)
        let themeOptions = [
            GoldenGateDropdownOption(value: "", title: "Random Theme", icon: "shuffle")
        ] + themes.map { t in
            GoldenGateDropdownOption(value: t, title: t)
        }
        let placeholder = "Optional: \(LearningLanguage.from(baseExam.languageId).topicPlaceholder)"

        ViewThatFits(in: .horizontal) {
            HStack(spacing: 10) {
                GoldenGateDropdownMenu(
                    title: "Theme",
                    leadingIcon: "sparkles",
                    options: themeOptions,
                    selection: $selectedTheme,
                    fullWidth: true,
                    isDisabled: isGeneratingExam
                )
                .frame(maxWidth: AppTypography.scaledControlWidth(240, scale: fontScale, maxCap: 310))

                TextField(placeholder, text: $customTopic)
                    .textFieldStyle(.plain)
                    .scaledFont(.subheadline)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Color.primary.opacity(0.05))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .strokeBorder(BrandTheme.editorialHairline, lineWidth: 1)
                    )
                    .disabled(isGeneratingExam)

                Button {
                    Task { await generateFreshExam(baseExam: baseExam, savedAIExams: savedAIExams) }
                } label: {
                    HStack(spacing: 6) {
                        if isGeneratingExam {
                            ProgressView().controlSize(.small)
                            Text("Crafting…")
                        } else {
                            Image(systemName: "sparkles")
                            Text("Generate \(baseExam.level.rawValue) Paper")
                        }
                    }
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.editorialBlue))
                .disabled(isGeneratingExam)
            }

            VStack(alignment: .leading, spacing: 10) {
                GoldenGateDropdownMenu(
                    title: "Theme",
                    leadingIcon: "sparkles",
                    options: themeOptions,
                    selection: $selectedTheme,
                    fullWidth: true,
                    isDisabled: isGeneratingExam
                )

                TextField(placeholder, text: $customTopic)
                    .textFieldStyle(.plain)
                    .scaledFont(.subheadline)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Color.primary.opacity(0.05))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .strokeBorder(BrandTheme.editorialHairline, lineWidth: 1)
                    )
                    .disabled(isGeneratingExam)

                Button {
                    Task { await generateFreshExam(baseExam: baseExam, savedAIExams: savedAIExams) }
                } label: {
                    HStack(spacing: 6) {
                        if isGeneratingExam {
                            ProgressView().controlSize(.small)
                            Text("Crafting…")
                        } else {
                            Image(systemName: "sparkles")
                            Text("Generate \(baseExam.level.rawValue) Paper")
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.editorialBlue))
                .disabled(isGeneratingExam)
            }
        }
    }

    @ViewBuilder
    private func aiExamProgressGrid() -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(160, scale: fontScale)), spacing: 8)], spacing: 8) {
            ForEach(SkillType.allCases) { sk in
                let st = genProgress[sk] ?? .pending
                let statusInfo: (label: String, icon: String, tint: Color) = {
                    switch st {
                    case .done: return ("Ready", "checkmark.circle.fill", BrandTheme.emeraldMint)
                    case .loading: return ("Writing…", "hourglass", BrandTheme.editorialBlue)
                    case .fallback: return ("Base", "doc", .secondary)
                    case .pending: return ("Queued", "clock", .secondary)
                    }
                }()

                HStack(spacing: 6) {
                    Text(sk.shortName)
                        .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                    Spacer()
                    Label(statusInfo.label, systemImage: statusInfo.icon)
                        .scaledFont(.caption2, design: .monospaced)
                        .foregroundStyle(statusInfo.tint)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .goldenGateSurface(
                    cornerRadius: 9,
                    tint: st == .done ? BrandTheme.emeraldMint : (st == .loading ? BrandTheme.editorialBlue : nil)
                )
            }
        }
    }

    private func blueprintCard(
        step: String,
        icon: String,
        title: String,
        metric: String,
        detail: String,
        tint: Color
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
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
                    .scaledFont(.subheadline, weight: .semibold)
                    .foregroundStyle(.primary)

                Spacer(minLength: 4)

                Text(step)
                    .scaledFont(.caption2, design: .monospaced)
                    .foregroundStyle(.tertiary)
            }

            Text(metric)
                .scaledFont(.caption, weight: .semibold, design: .monospaced, monospacedDigit: true)
                .foregroundStyle(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.88)

            Text(detail)
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
                .lineSpacing(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    // MARK: - Running Exam View

    @ViewBuilder
    private func runningView(exam: MockExam) -> some View {
        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts

        let readTotal = readingParts.reduce(0) { $0 + $1.questions.count }
        let readAnswered = readingParts.reduce(0) { sum, part in
            sum + part.questions.filter { readingAnswers[$0.id] != nil }.count
        }
        let listenTotal = listeningTracks.reduce(0) { $0 + $1.questions.count }
        let listenAnswered = listeningTracks.reduce(0) { sum, track in
            sum + track.questions.filter { listeningAnswers[$0.id] != nil }.count
        }
        let totalWrittenWords = writingTasks.reduce(0) { $0 + wordCount(writingByTask[$1.id] ?? "") }
        let totalSpokenWords = speakingParts.reduce(0) { $0 + wordCount(speakingByPart[$1.id] ?? "") }

        // Countdown Bar
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(mode == "strict" ? "Strict Pressure" : "Guided Practice") · \(exam.alignedCertificate)")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(mode == "strict" ? .red : BrandTheme.editorialBlue)
                    Text(exam.title)
                        .scaledFont(.headline, weight: .bold, design: .serif)
                        .lineLimit(2)
                }
                Spacer()
                Label(formatClock(remainingSeconds), systemImage: "timer")
                    .scaledFont(.subheadline, weight: .bold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(remainingSeconds <= 120 && mode == "strict" ? .red : .primary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .goldenGateGlassPill(isSelected: remainingSeconds <= 120 && mode == "strict", accent: .red)

                Button {
                    Task { await submitExam(exam) }
                } label: {
                    Text("Submit All")
                }
                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
            }
            VStack(alignment: .leading, spacing: 10) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(mode == "strict" ? "Strict Pressure" : "Guided Practice") · \(exam.alignedCertificate)")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(mode == "strict" ? .red : BrandTheme.editorialBlue)
                    Text(exam.title)
                        .scaledFont(.headline, weight: .bold, design: .serif)
                        .lineLimit(2)
                }
                HStack {
                    Label(formatClock(remainingSeconds), systemImage: "timer")
                        .scaledFont(.subheadline, weight: .bold, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(remainingSeconds <= 120 && mode == "strict" ? .red : .primary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .goldenGateGlassPill(isSelected: remainingSeconds <= 120 && mode == "strict", accent: .red)
                    Spacer()
                    Button {
                        Task { await submitExam(exam) }
                    } label: {
                        Text("Submit All")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
                }
            }
        }
        .padding(16)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

        // 4-Skill Switcher with live progress summary
        let sectionBinding = Binding<SkillType>(
            get: { activeSection },
            set: { next in
                stopAudioAndMic()
                activeSection = next
            }
        )
        GoldenGateSegmentedControl(
            items: SkillType.allCases,
            selection: sectionBinding
        ) { skill, selected in
            let label: String = {
                switch skill {
                case .reading: return "Read \(readAnswered)/\(readTotal)"
                case .listening: return "Listen \(listenAnswered)/\(listenTotal)"
                case .writing: return "Write \(totalWrittenWords)w"
                case .speaking: return "Speak \(totalSpokenWords)w"
                }
            }()
            Text(label)
                .scaledFont(.footnote, weight: selected ? .semibold : .medium, monospacedDigit: true)
        }

        switch activeSection {
        case .reading:
            readingSectionView(parts: readingParts)
        case .listening:
            listeningSectionView(exam: exam, tracks: listeningTracks)
        case .writing:
            writingSectionView(exam: exam, tasks: writingTasks)
        case .speaking:
            speakingSectionView(exam: exam, parts: speakingParts)
        }
    }

    @ViewBuilder
    private func readingSectionView(parts: [ReadingExamPart]) -> some View {
        let safeIdx = min(activeReadingIdx, max(0, parts.count - 1))
        let part = parts[safeIdx]

        VStack(alignment: .leading, spacing: 14) {
            Picker("Reading Part", selection: $activeReadingIdx) {
                ForEach(Array(parts.enumerated()), id: \.element.id) { idx, p in
                    let done = p.questions.filter { readingAnswers[$0.id] != nil }.count
                    Text("Part \(idx + 1) (\(done)/\(p.questions.count))").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            HStack {
                Text(part.partLabel).scaledFont(.caption, weight: .bold, design: .monospaced).foregroundStyle(BrandTheme.editorialBlue)
                Spacer()
                Text(readingFormatLabel(part.format))
                    .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.12)))
                    .foregroundStyle(BrandTheme.editorialBlue)
            }

            Text(part.passageTitle)
                .scaledFont(.title3, weight: .bold, design: .serif)
            Text(part.instruction).scaledFont(.subheadline).foregroundStyle(.secondary)

            readingPassageView(part: part)

            ForEach(Array(part.questions.enumerated()), id: \.element.id) { idx, q in
                questionPicker(index: safeIdx * 3 + idx + 1, question: q, selection: readingAnswers[q.id]) { chosen in
                    readingAnswers[q.id] = chosen
                }
            }

            HStack {
                Spacer()
                if safeIdx < parts.count - 1 {
                    Button("Next: Reading Part \(safeIdx + 2) →") {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeReadingIdx = safeIdx + 1
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                } else {
                    Button("Next: Listening / Hearing →") {
                        stopAudioAndMic()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeSection = .listening
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    @ViewBuilder
    private func listeningSectionView(exam: MockExam, tracks: [ListeningExamTrack]) -> some View {
        let safeIdx = min(activeListeningIdx, max(0, tracks.count - 1))
        let track = tracks[safeIdx]
        let playsUsed = listeningPlaysByTrack[track.id] ?? 0
        let locked = mode == "strict" && playsUsed >= track.maxPlaysStrict

        VStack(alignment: .leading, spacing: 14) {
            Picker("Listening Track", selection: Binding(
                get: { safeIdx },
                set: { next in
                    NativeAudioEngine.shared.stopSpeech()
                    isPreReading = false
                    activeListeningIdx = next
                    preReadSecondsLeft = tracks[next].preReadSeconds ?? 15
                }
            )) {
                ForEach(Array(tracks.enumerated()), id: \.element.id) { idx, t in
                    let done = t.questions.filter { listeningAnswers[$0.id] != nil }.count
                    Text("Track \(idx + 1) \(accentFlagOnly(t.accentCode, languageId: exam.languageId)) (\(done)/\(t.questions.count))").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            let dialogueTurns = NativeAudioEngine.parseDialogueTurns(track.audioScript)
            FlowLayout(spacing: 8, lineSpacing: 6) {
                Text(track.partLabel).scaledFont(.caption, weight: .bold, design: .monospaced).foregroundStyle(.indigo)
                if !dialogueTurns.isEmpty {
                    Label("2-Speaker Conversation", systemImage: "bubble.left.and.bubble.right")
                        .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                        .foregroundStyle(BrandTheme.emeraldMint)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.14)))
                }
                if let speaker = NativeAudioEngine.shared.activeSpeakerName, !speaker.isEmpty {
                    Label("Speaking: \(speaker)", systemImage: "waveform")
                        .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(Color.indigo))
                }
                Text(accentBadge(track.accentCode, languageId: exam.languageId))
                    .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.indigo.opacity(0.14)))
                    .foregroundStyle(.indigo)
            }

            Text(track.contextNote).scaledFont(.subheadline).foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 10) {
                FlowLayout(spacing: 8, lineSpacing: 8) {
                    Button {
                        if locked { return }
                        isPreReading = false
                        listeningPlaysByTrack[track.id] = playsUsed + 1
                        NativeAudioEngine.shared.speak(
                            track.audioScript,
                            languageId: exam.languageId,
                            slow: false,
                            accentOverride: track.accentCode
                        )
                    } label: {
                        Label(locked ? "All Official Plays Used" : "Play Official Audio Track", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                    .disabled(locked)

                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        preReadSecondsLeft = track.preReadSeconds ?? 15
                        isPreReading = true
                    } label: {
                        Label(
                            isPreReading ? "Pre-Read: \(preReadSecondsLeft)s" : "\(track.preReadSeconds ?? 15)s Pre-Read",
                            systemImage: "timer"
                        )
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: isPreReading))

                    Text("Track \(safeIdx + 1) Plays: \(playsUsed)/\(mode == "strict" ? "\(track.maxPlaysStrict)" : "∞")")
                        .scaledFont(.caption, weight: .semibold, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 6)
                }

                Label("Hearing Focus: \(track.hearingFocusTrap)", systemImage: "ear")
                    .scaledFont(.caption)
                    .foregroundStyle(BrandTheme.deepGold)

                if mode == "strict" {
                    Label("Transcript locked in Strict Mode — unlocked in Score Report.", systemImage: "lock.fill")
                        .scaledFont(.caption2, design: .monospaced)
                        .foregroundStyle(.secondary)
                } else {
                    GoldenGateEditorialDisclosure("Practice Mode: Peek Track \(safeIdx + 1) Transcript") {
                        transcriptTurnsView(script: track.audioScript)
                    }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.editorialBlue)

            ForEach(Array(track.questions.enumerated()), id: \.element.id) { idx, q in
                questionPicker(index: safeIdx * 3 + idx + 1, question: q, selection: listeningAnswers[q.id]) { chosen in
                    listeningAnswers[q.id] = chosen
                }
            }

            HStack {
                Spacer()
                if safeIdx < tracks.count - 1 {
                    Button("Next: Track \(safeIdx + 2) →") {
                        NativeAudioEngine.shared.stopSpeech()
                        isPreReading = false
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeListeningIdx = safeIdx + 1
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                } else {
                    Button("Next: Writing →") {
                        stopAudioAndMic()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeSection = .writing
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    @ViewBuilder
    private func writingSectionView(exam: MockExam, tasks: [WritingExamTask]) -> some View {
        let safeIdx = min(activeWritingIdx, max(0, tasks.count - 1))
        let task = tasks[safeIdx]
        let wc = wordCount(writingByTask[task.id] ?? "")

        VStack(alignment: .leading, spacing: 14) {
            Picker("Writing Task", selection: $activeWritingIdx) {
                ForEach(Array(tasks.enumerated()), id: \.element.id) { idx, t in
                    let words = wordCount(writingByTask[t.id] ?? "")
                    Text("Task \(idx + 1) (\(t.weightPercent)%) · \(words)w").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            Text("\(task.partLabel) · Weight \(task.weightPercent)%")
                .scaledFont(.caption, weight: .bold, design: .monospaced)
                .foregroundStyle(BrandTheme.deepGold)
            Text(task.scenario)
                .scaledFont(.title3, weight: .bold, design: .serif)

            VStack(alignment: .leading, spacing: 5) {
                ForEach(task.taskRequirements, id: \.self) { req in
                    Text("• \(req)").scaledFont(.subheadline)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.champagneGold)

            HStack {
                Text("Task \(safeIdx + 1) Written Submission").scaledFont(.caption, weight: .bold)
                Spacer()
                Text("\(wc) words (Target: \(task.minWords)–\(task.maxWords))")
                    .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(wc >= task.minWords ? BrandTheme.emeraldMint : BrandTheme.deepGold)
            }

            TextEditor(text: writingBinding(for: task.id))
                .scaledFont(.body)
                .frame(minHeight: 190)
                .padding(8)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Color.primary.opacity(0.03)))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(BrandTheme.editorialHairline, lineWidth: 1))

            HStack {
                Text("4-Criterion CEFR Rubric: Task, Coherence, Lexis, Grammar")
                    .scaledFont(.caption2)
                    .foregroundStyle(.secondary)
                Spacer()
                if safeIdx < tasks.count - 1 {
                    Button("Next: Writing Task \(safeIdx + 2) →") {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeWritingIdx = safeIdx + 1
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                } else {
                    Button("Next: Speaking →") {
                        stopAudioAndMic()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeSection = .speaking
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    @ViewBuilder
    private func speakingSectionView(exam: MockExam, parts: [SpeakingExamPart]) -> some View {
        let safeIdx = min(activeSpeakingIdx, max(0, parts.count - 1))
        let part = parts[safeIdx]
        let wc = wordCount(speakingByPart[part.id] ?? "")

        VStack(alignment: .leading, spacing: 14) {
            Picker("Speaking Part", selection: Binding(
                get: { safeIdx },
                set: { next in
                    stopAudioAndMic()
                    activeSpeakingIdx = next
                    prepSecondsLeft = parts[next].prepSeconds
                    speakSecondsLeft = parts[next].speakSeconds
                }
            )) {
                ForEach(Array(parts.enumerated()), id: \.element.id) { idx, p in
                    let words = wordCount(speakingByPart[p.id] ?? "")
                    Text("Part \(idx + 1) · \(words)w").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            Text(part.partLabel).scaledFont(.caption, weight: .bold, design: .monospaced).foregroundStyle(BrandTheme.emeraldMint)
            Text(part.instruction)
                .scaledFont(.title3, weight: .bold, design: .serif)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(part.prompts.enumerated()), id: \.offset) { i, pt in
                    Text("\(i + 1). \(pt)").scaledFont(.subheadline)
                }
                if let promptAudio = part.examinerPromptAudio, !promptAudio.isEmpty {
                    GoldenGateSectionHairline()
                    HStack(alignment: .top, spacing: 8) {
                        Text("“\(promptAudio)”")
                            .scaledFont(.subheadline, italic: true)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            NativeAudioEngine.shared.speak(promptAudio, languageId: exam.languageId, slow: false)
                        } label: {
                            Label("Play Examiner", systemImage: "speaker.wave.2.fill")
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                    }
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.emeraldMint)

            FlowLayout(spacing: 8, lineSpacing: 8) {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    prepSecondsLeft = part.prepSeconds
                    isPrepping = true
                } label: {
                    Label(isPrepping ? "Prep: \(prepSecondsLeft)s" : "Start \(part.prepSeconds)s Prep", systemImage: "timer")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: isPrepping))

                Button {
                    if speechRecognizer.isRecording {
                        speechRecognizer.stop()
                    } else {
                        isPrepping = false
                        recordingPartId = part.id
                        speakSecondsLeft = part.speakSeconds
                        speechRecognizer.start(languageId: exam.languageId, existingText: speakingByPart[part.id] ?? "")
                    }
                } label: {
                    Label(
                        speechRecognizer.isRecording
                            ? "Stop Mic (\(formatClock(speakSecondsLeft)))"
                            : "Dictate Live Voice (\(part.speakSeconds)s)",
                        systemImage: speechRecognizer.isRecording ? "mic.slash.fill" : "mic.fill"
                    )
                }
                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: speechRecognizer.isRecording ? .red : BrandTheme.emeraldMint))
            }

            if let msg = speechRecognizer.statusMessage {
                Text(msg).scaledFont(.caption).foregroundStyle(.orange)
            }

            HStack {
                Text("Part \(safeIdx + 1) Spoken Transcript (Auto-captured via Mic or Type Manually)")
                    .scaledFont(.caption, weight: .bold)
                Spacer()
                Text("\(wc) words").scaledFont(.caption, design: .monospaced, monospacedDigit: true).foregroundStyle(.secondary)
            }

            TextEditor(text: speakingBinding(for: part.id))
                .scaledFont(.body)
                .frame(minHeight: 130)
                .padding(8)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Color.primary.opacity(0.03)))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(BrandTheme.editorialHairline, lineWidth: 1))

            HStack {
                if safeIdx < parts.count - 1 {
                    Button("Next: Speaking Part \(safeIdx + 2) →") {
                        stopAudioAndMic()
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.snappySpring) {
                            activeSpeakingIdx = safeIdx + 1
                        }
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }
                Spacer()
                Button {
                    Task { await submitExam(exam) }
                } label: {
                    Label("Finish & Grade All 4 Skills", systemImage: "checkmark.seal.fill")
                }
                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    // MARK: - Report View

    @ViewBuilder
    private func reportView(exam: MockExam, baseExam: MockExam, savedAIExams: [MockExam], report: ExamAttemptRecord) -> some View {
        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts

        VStack(alignment: .leading, spacing: 22) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    FlowLayout(spacing: 8, lineSpacing: 6) {
                        Text(report.passed ? "Certification Ready · Passed" : "Below Pass Mark · Review & Retry")
                            .scaledFont(.footnote, weight: .semibold)
                            .foregroundStyle(report.passed ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                        if let label = report.officialGradeLabel {
                            Text(label)
                                .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.14)))
                                .foregroundStyle(BrandTheme.editorialBlue)
                        }
                    }
                    Text("\(report.examTitle) — \(report.overallScore)%")
                        .scaledFont(.largeTitle, weight: .bold, design: .serif)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Mode: \(report.mode.uppercased()) · Time: \(formatClock(report.durationUsedSeconds)) · Saved to History")
                        .scaledFont(.caption, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(.secondary)
                    if exam.requireAllSkillsPass == true && report.overallScore >= exam.passingScorePercent && !allModulesPassed {
                        Label("Overall average met \(exam.passingScorePercent)%, but modular certification requires passing every skill (≥ \(exam.passingScorePercent)%).", systemImage: "exclamationmark.triangle")
                            .scaledFont(.caption)
                            .foregroundStyle(BrandTheme.deepGold)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 8) {
                    if store.aiConfig.isReady {
                        Button {
                            phase = .lobby
                            Task { await generateFreshExam(baseExam: baseExam, savedAIExams: savedAIExams) }
                        } label: {
                            Label("Generate Fresh AI Exam", systemImage: "sparkles")
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                    }
                    Button("New Exam") {
                        withAnimation(GoldenGateMetrics.panelAnimation) {
                            phase = .lobby
                        }
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                }
            }

            GoldenGateSectionHairline()

            // Celebratory Official LinguaVerve Certificate Unlock Banner (when PASSED)
            if report.passed {
                let certPreview = CertificateService.buildCertificate(
                    for: report,
                    learnerName: store.learnerState.learnerName,
                    passingScorePercent: exam.passingScorePercent
                )
                ViewThatFits(in: .horizontal) {
                    HStack(alignment: .center, spacing: 14) {
                        certificateCelebrationText(certPreview)
                        Spacer()
                        certificateOpenButton
                    }
                    VStack(alignment: .leading, spacing: 12) {
                        certificateCelebrationText(certPreview)
                        certificateOpenButton
                    }
                }
                .padding(18)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, tint: BrandTheme.champagneGold)
            }

            // 4-Skill Score Cards + 4-Criterion CEFR Rubric Bars
            LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(210, scale: fontScale)), spacing: 12)], spacing: 12) {
                ForEach(SkillType.allCases) { sk in
                    if let s = report.skills[sk.rawValue] {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(sk.shortName)
                                    .scaledFont(.subheadline, weight: .semibold)
                                Spacer()
                                if s.aiGraded {
                                    Text("AI")
                                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(Color.indigo.opacity(0.16)))
                                        .foregroundStyle(.indigo)
                                }
                                Text(s.passed ? "PASS" : "FAIL")
                                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Capsule().fill((s.passed ? BrandTheme.emeraldMint : Color.red).opacity(0.14)))
                                    .foregroundStyle(s.passed ? BrandTheme.emeraldMint : .red)
                                Text("\(s.score)%")
                                    .scaledFont(.headline, weight: .bold, design: .monospaced, monospacedDigit: true)
                                    .foregroundStyle(s.passed ? BrandTheme.emeraldMint : .red)
                            }
                            Text(s.feedback).scaledFont(.caption).foregroundStyle(.secondary)
                            if let rubric = s.rubric {
                                GoldenGateSectionHairline()
                                rubricBarRow("Task Fulfillment", value: rubric.taskFulfillment)
                                rubricBarRow("Coherence & Cohesion", value: rubric.coherenceCohesion)
                                rubricBarRow("Lexical Range", value: rubric.lexicalRange)
                                rubricBarRow("Grammar Accuracy", value: rubric.grammaticalAccuracy)
                            }
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                    }
                }
            }

            // Deep 4-Skill AI Examiner Insights, Corrections, Suggestions & Study Plan
            let assessment = report.aiAssessment ?? ExamAssessmentService.buildOfflineAssessment(exam: exam, attempt: report)
            ExamAIAssessmentPanelView(
                store: store,
                attempt: report,
                assessment: assessment,
                onOpenAISettings: { showAISettingsSheet = true },
                onPracticeSkillInCoach: { sk in
                    stopAudioAndMic()
                    store.openAICoach(
                        languageId: report.languageId,
                        level: report.level,
                        skill: sk,
                        seedPrompt: ExamAssessmentService.buildCoachSeedPrompt(attempt: report, skill: sk)
                    )
                }
            )

            // Unlocked Multi-Accent Transcripts + Full Answer Key
            GoldenGateEditorialDisclosure("Unlocked Multi-Accent Transcripts & Answer Key (\(readingParts.reduce(0) { $0 + $1.questions.count } + listeningTracks.reduce(0) { $0 + $1.questions.count }) Items)") {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(Array(listeningTracks.enumerated()), id: \.element.id) { idx, track in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Track \(idx + 1) · \(accentBadge(track.accentCode, languageId: exam.languageId)) — \(track.partLabel)")
                                    .scaledFont(.caption, weight: .bold)
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.speak(
                                        track.audioScript,
                                        languageId: exam.languageId,
                                        slow: false,
                                        accentOverride: track.accentCode
                                    )
                                } label: {
                                    Label("Replay", systemImage: "speaker.wave.2.fill")
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle())
                            }
                            transcriptTurnsView(script: track.audioScript)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: .indigo)
                    }

                    GoldenGateSectionHairline()

                    ForEach(Array(readingParts.enumerated()), id: \.element.id) { pIdx, part in
                        ForEach(part.questions) { q in
                            answerKeyRow(tag: "Reading P\(pIdx + 1)", question: q, chosen: readingAnswers[q.id])
                        }
                    }
                    ForEach(Array(listeningTracks.enumerated()), id: \.element.id) { tIdx, track in
                        ForEach(track.questions) { q in
                            answerKeyRow(tag: "Listening T\(tIdx + 1)", question: q, chosen: listeningAnswers[q.id])
                        }
                    }
                }
            }
            .padding(18)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

            // Writing Tasks & 3-Part Speaking Model Benchmarks
            GoldenGateEditorialDisclosure("Official Model Benchmarks (Writing Tasks & 3-Part Speaking)") {
                VStack(alignment: .leading, spacing: 10) {
                    if !writingNotes.isEmpty {
                        Text("Writing Action Notes: \(writingNotes.joined(separator: " • "))")
                            .scaledFont(.caption)
                            .foregroundStyle(BrandTheme.deepGold)
                    }
                    if !speakingNotes.isEmpty {
                        Text("Speaking Action Notes: \(speakingNotes.joined(separator: " • "))")
                            .scaledFont(.caption)
                            .foregroundStyle(BrandTheme.emeraldMint)
                    }

                    ForEach(Array(writingTasks.enumerated()), id: \.element.id) { idx, task in
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Model \(exam.level.rawValue) Writing · Task \(idx + 1) (\(task.weightPercent)%): \(task.partLabel)")
                                .scaledFont(.caption, weight: .bold)
                            Text(task.modelAnswer).scaledFont(.caption).foregroundStyle(.secondary)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                    }

                    ForEach(Array(speakingParts.enumerated()), id: \.element.id) { idx, part in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Model \(exam.level.rawValue) Speaking · Part \(idx + 1): \(part.partLabel)")
                                    .scaledFont(.caption, weight: .bold)
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.speak(part.modelResponseScript, languageId: exam.languageId)
                                } label: {
                                    Label("Hear Model", systemImage: "speaker.wave.2.fill")
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle())
                            }
                            Text(part.modelResponseScript).scaledFont(.caption).foregroundStyle(.secondary)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                    }
                }
            }
            .padding(18)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
        }
    }

    @ViewBuilder
    private func transcriptTurnsView(script: String) -> some View {
        let turns = NativeAudioEngine.parseDialogueTurns(script)
        if turns.isEmpty {
            Text(script).scaledFont(.caption).foregroundStyle(.secondary)
        } else {
            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(turns.enumerated()), id: \.offset) { _, turn in
                    let isFirst = turn.speakerIndex % 2 == 0
                    VStack(alignment: .leading, spacing: 2) {
                        Text(turn.speaker)
                            .scaledFont(.caption2, weight: .bold, design: .monospaced)
                            .foregroundStyle(isFirst ? BrandTheme.celestialSky : .purple)
                        Text(turn.text)
                            .scaledFont(.caption)
                            .foregroundStyle(.primary)
                    }
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill((isFirst ? BrandTheme.celestialSky : Color.purple).opacity(0.09))
                    )
                }
            }
        }
    }

    @ViewBuilder
    private func readingPassageView(part: ReadingExamPart) -> some View {
        let displayPassage = part.format == "cloze"
            ? AIExamGeneratorService.repairClozePassage(part.passage, questions: part.questions).passage
            : part.passage

        if part.format == "cloze" {
            Text(clozeAttributedPassage(passage: displayPassage, questions: part.questions))
                .scaledFont(.subheadline)
                .lineSpacing(5)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
        } else {
            Text(displayPassage)
                .scaledFont(.subheadline)
                .lineSpacing(4)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
        }
    }

    private func clozeAttributedPassage(passage: String, questions: [ExamObjectiveQuestion]) -> AttributedString {
        guard let regex = try? NSRegularExpression(pattern: #"\[(\d+)\]"#) else {
            return AttributedString(passage)
        }
        let nsRange = NSRange(passage.startIndex..., in: passage)
        let matches = regex.matches(in: passage, range: nsRange)
        if matches.isEmpty {
            return AttributedString(passage)
        }

        var result = AttributedString()
        var cursor = passage.startIndex

        for match in matches {
            guard let fullRange = Range(match.range, in: passage),
                  let numRange = Range(match.range(at: 1), in: passage) else {
                continue
            }
            if cursor < fullRange.lowerBound {
                result += AttributedString(String(passage[cursor..<fullRange.lowerBound]))
            }
            let numStr = String(passage[numRange])
            let gapIdx = (Int(numStr) ?? 1) - 1
            var chosenWord: String? = nil
            if questions.indices.contains(gapIdx) {
                let q = questions[gapIdx]
                if let sel = readingAnswers[q.id], q.options.indices.contains(sel) {
                    chosenWord = q.options[sel]
                }
            }
            let chipText = chosenWord != nil ? " [\(numStr): \(chosenWord!)] " : " [\(numStr): _____] "
            var chip = AttributedString(chipText)
            chip.inlinePresentationIntent = .stronglyEmphasized
            chip.foregroundColor = chosenWord != nil ? BrandTheme.emeraldMint : BrandTheme.celestialSky
            chip.backgroundColor = (chosenWord != nil ? BrandTheme.emeraldMint : BrandTheme.celestialSky).opacity(0.16)
            result += chip
            cursor = fullRange.upperBound
        }

        if cursor < passage.endIndex {
            result += AttributedString(String(passage[cursor..<passage.endIndex]))
        }
        return result
    }

    private func certificateCelebrationText(_ cert: LinguaVerveCertificate) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "rosette")
                .scaledFont(.title2, weight: .bold)
                .foregroundStyle(BrandTheme.deepGold)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 4) {
                FlowLayout(spacing: 6, lineSpacing: 4) {
                    Text("Official LinguaVerve Certificate Unlocked · \(cert.honorsTitle)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.deepGold)
                    Text(cert.certificateId)
                        .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.primary.opacity(0.08)))
                        .foregroundStyle(.secondary)
                }
                Text(cert.encouragementHeadline)
                    .scaledFont(.headline, weight: .bold, design: .serif)
                Text(cert.encouragementMessage)
                    .scaledFont(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var certificateOpenButton: some View {
        Button {
            NativeAudioEngine.shared.playSuccessChime()
            showCertificateSheet = true
        } label: {
            Label("View & Export Certificate", systemImage: "checkmark.seal.fill")
        }
        .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.deepGold))
    }

    private func rubricBarRow(_ title: String, value: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title).scaledFont(size: 10, design: .monospaced).foregroundStyle(.secondary)
                Spacer()
                Text("\(value)%").scaledFont(size: 10, weight: .bold, design: .monospaced)
            }
            ProgressView(value: Double(value), total: 100.0)
                .tint(value >= 75 ? BrandTheme.emeraldMint : value >= 60 ? BrandTheme.celestialSky : .orange)
        }
    }

    private func answerKeyRow(tag: String, question: ExamObjectiveQuestion, chosen: Int?) -> some View {
        let ok = chosen == question.correctIndex
        let correctText = question.options.indices.contains(question.correctIndex)
            ? question.options[question.correctIndex]
            : ""
        return VStack(alignment: .leading, spacing: 3) {
            HStack(alignment: .top) {
                Text("[\(tag)] \(question.prompt)").scaledFont(.caption, weight: .semibold)
                Spacer()
                Text(ok ? "✓" : "✗")
                    .scaledFont(.caption, weight: .bold)
                    .foregroundStyle(ok ? BrandTheme.emeraldMint : .red)
            }
            Text("Correct: \(correctText) — \(question.explanation)")
                .scaledFont(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.03)))
    }

    private func questionPicker(
        index: Int,
        question: ExamObjectiveQuestion,
        selection: Int?,
        onSelect: @escaping (Int) -> Void
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Q\(index). \(question.prompt)").scaledFont(.subheadline, weight: .semibold)
            ForEach(Array(question.options.enumerated()), id: \.offset) { idx, opt in
                let chosen = selection == idx
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    withAnimation(GoldenGateMetrics.snappySpring) {
                        onSelect(idx)
                    }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: chosen ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(chosen ? BrandTheme.editorialBlue : .secondary)
                        Text(opt).scaledFont(.subheadline).foregroundStyle(.primary).multilineTextAlignment(.leading)
                        Spacer()
                    }
                    .padding(11)
                    .goldenGateSurface(
                        cornerRadius: 10,
                        tint: chosen ? BrandTheme.editorialBlue : nil,
                        interactive: true
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    // MARK: - Actions & Multi-Part Grading

    @MainActor
    private func generateFreshExam(baseExam: MockExam, savedAIExams: [MockExam]) async {
        guard store.aiConfig.isReady else {
            showAISettingsSheet = true
            return
        }
        NativeAudioEngine.shared.playClickSound()
        isGeneratingExam = true
        genError = nil
        genNotice = nil
        genProgress = [
            .reading: .loading,
            .listening: .pending,
            .writing: .pending,
            .speaking: .pending
        ]

        let avoid = savedAIExams.compactMap(\.generatedTheme)
        do {
            let service = AIExamGeneratorService()
            let res = try await service.generateFreshExam(
                config: store.aiConfig,
                baseExam: baseExam,
                theme: selectedTheme.isEmpty ? nil : selectedTheme,
                customTopic: customTopic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : customTopic,
                avoidThemes: avoid,
                onProgress: { skill, status in
                    Task { @MainActor in
                        genProgress[skill] = status
                    }
                }
            )
            store.saveGeneratedExam(res.exam)
            selectedExamId = res.exam.id
            genNotice = "Generated fresh \(baseExam.level.rawValue) exam (\(res.aiSkillsCount)/4 AI-crafted skills) — Theme: \"\(res.theme)\"."
            NativeAudioEngine.shared.playSuccessChime()
        } catch {
            genError = error.localizedDescription
        }
        isGeneratingExam = false
    }

    private func startExam(_ exam: MockExam) {
        NativeAudioEngine.shared.playClickSound()
        stopAudioAndMic()
        readingAnswers = [:]
        listeningAnswers = [:]
        listeningPlaysByTrack = [:]
        writingByTask = [:]
        speakingByPart = [:]
        activeReadingIdx = 0
        activeListeningIdx = 0
        activeWritingIdx = 0
        activeSpeakingIdx = 0
        let mins = timingMode == "official" ? exam.totalMinutes : Self.sprintMinutes(for: exam.totalMinutes)
        remainingSeconds = mins * 60
        elapsedSeconds = 0
        activeSection = .reading
        report = nil
        writingNotes = []
        speakingNotes = []
        allModulesPassed = false
        phase = .running
    }

    @MainActor
    private func submitExam(_ exam: MockExam) async {
        stopAudioAndMic()
        phase = .grading

        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts

        // 1. Reading across all parts
        let allReadQs = readingParts.flatMap(\.questions)
        let readCorrect = allReadQs.filter { readingAnswers[$0.id] == $0.correctIndex }.count
        let readPct = Int((Double(readCorrect) / Double(max(1, allReadQs.count)) * 100.0).rounded())
        let readBreakdown = readingParts.enumerated().map { idx, part in
            let hits = part.questions.filter { readingAnswers[$0.id] == $0.correctIndex }.count
            return "P\(idx + 1): \(hits)/\(part.questions.count)"
        }.joined(separator: " · ")

        // 2. Listening across all multi-accent tracks
        let allListenQs = listeningTracks.flatMap(\.questions)
        let listenCorrect = allListenQs.filter { listeningAnswers[$0.id] == $0.correctIndex }.count
        let listenPct = Int((Double(listenCorrect) / Double(max(1, allListenQs.count)) * 100.0).rounded())
        let totalPlays = listeningPlaysByTrack.values.reduce(0, +)
        let listenBreakdown = listeningTracks.enumerated().map { idx, track in
            let hits = track.questions.filter { listeningAnswers[$0.id] == $0.correctIndex }.count
            return "T\(idx + 1): \(hits)/\(track.questions.count)"
        }.joined(separator: " · ")

        // 3. Weighted multi-task Writing
        let ai = AIClientService()
        var writeEvals: [AIEvaluationResult] = []
        for task in writingTasks {
            let ev = await ai.evaluateWithAIOrFallback(
                config: store.aiConfig,
                text: writingByTask[task.id] ?? "",
                languageId: exam.languageId,
                level: exam.level,
                skill: .writing,
                taskPrompt: "\(task.partLabel)\n\(task.scenario)\n\(task.taskRequirements.joined(separator: " "))",
                minWords: task.minWords,
                expectedKeywords: task.keyRubricKeywords
            )
            writeEvals.append(ev)
        }
        let totalWeight = max(1, writingTasks.reduce(0) { $0 + $1.weightPercent })
        let weightedWriteSum = zip(writeEvals, writingTasks).reduce(0) { $0 + ($1.0.score * $1.1.weightPercent) }
        let writePct = Int((Double(weightedWriteSum) / Double(totalWeight)).rounded())
        let rawWriting = writingTasks.map { (writingByTask[$0.id] ?? "").trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n\n")
        let labeledWriting = writingTasks.enumerated().map { idx, t in
            let txt = (writingByTask[t.id] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return "[Task \(idx + 1) · \(t.weightPercent)%]\n\(txt.isEmpty ? "(blank)" : txt)"
        }.joined(separator: "\n\n")
        let writeRubric: OfficialRubricBreakdown = {
            let aiRubrics = zip(writeEvals, writingTasks).compactMap { pair -> (OfficialRubricBreakdown, Int)? in
                guard let r = pair.0.rubric else { return nil }
                return (r, pair.1.weightPercent)
            }
            if !aiRubrics.isEmpty {
                let wSum = max(1, aiRubrics.reduce(0) { $0 + $1.1 })
                func avg(_ kp: KeyPath<OfficialRubricBreakdown, Int>) -> Int {
                    let total = aiRubrics.reduce(0) { $0 + $1.0[keyPath: kp] * $1.1 }
                    return max(0, min(100, Int((Double(total) / Double(wSum)).rounded())))
                }
                return OfficialRubricBreakdown(
                    taskFulfillment: avg(\.taskFulfillment),
                    coherenceCohesion: avg(\.coherenceCohesion),
                    lexicalRange: avg(\.lexicalRange),
                    grammaticalAccuracy: avg(\.grammaticalAccuracy)
                )
            }
            return OfficialRubricBreakdown.compute(
                text: rawWriting,
                score: writePct,
                minWords: writingTasks.reduce(0) { $0 + $1.minWords },
                expectedKeywords: writingTasks.flatMap(\.keyRubricKeywords)
            )
        }()
        let writeTaskSummary = zip(writeEvals, writingTasks).enumerated().map { idx, pair in
            "T\(idx + 1) (\(pair.1.weightPercent)%): \(pair.0.score)%"
        }.joined(separator: " · ")

        // 4. Multi-part Speaking
        let answeredParts = speakingParts.filter { wordCount(speakingByPart[$0.id] ?? "") >= 4 }.count
        let rawSpeaking = speakingParts.map { (speakingByPart[$0.id] ?? "").trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n\n")
        let labeledSpeaking = speakingParts.enumerated().map { idx, p in
            let txt = (speakingByPart[p.id] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return "[Part \(idx + 1): \(p.partLabel)]\n\(txt.isEmpty ? "(no response)" : txt)"
        }.joined(separator: "\n\n")
        let speakMinWords = max(35, Int(Double(exam.writing.minWords) * 0.85))
        let speakEval = await ai.evaluateWithAIOrFallback(
            config: store.aiConfig,
            text: rawSpeaking,
            languageId: exam.languageId,
            level: exam.level,
            skill: .speaking,
            taskPrompt: speakingParts.map { "\($0.partLabel): \($0.instruction)" }.joined(separator: "\n"),
            minWords: speakMinWords,
            expectedKeywords: speakingParts.flatMap(\.keyRubricKeywords)
        )
        let partCoverage: Double = answeredParts == 0 ? 0 : (speakingParts.count <= 1 ? 1.0 : (0.65 + 0.35 * (Double(answeredParts) / Double(speakingParts.count))))
        let speakPct = Int((Double(speakEval.score) * partCoverage).rounded())
        let speakRubric = speakEval.rubric ?? OfficialRubricBreakdown.compute(
            text: rawSpeaking,
            score: speakPct,
            minWords: speakMinWords,
            expectedKeywords: speakingParts.flatMap(\.keyRubricKeywords)
        )

        let overall = Int((Double(readPct + listenPct + writePct + speakPct) / 4.0).rounded())
        let passMark = exam.passingScorePercent
        let allPassed = readPct >= passMark && listenPct >= passMark && writePct >= passMark && speakPct >= passMark
        let passed = (exam.requireAllSkillsPass ?? false) ? (overall >= passMark && allPassed) : (overall >= passMark)
        let gradeLabel = MockExam.officialGradeLabel(
            languageId: exam.languageId,
            level: exam.level,
            overallScore: overall,
            allModulesPassed: allPassed,
            passingScorePercent: passMark
        )

        var reviews: [ExamQuestionReview] = []
        for (pIdx, part) in readingParts.enumerated() {
            for q in part.questions {
                let chosenIdx = readingAnswers[q.id]
                let chosenOpt = chosenIdx.flatMap { q.options.indices.contains($0) ? q.options[$0] : nil }
                let correctOpt = q.options.indices.contains(q.correctIndex) ? q.options[q.correctIndex] : ""
                reviews.append(
                    ExamQuestionReview(
                        id: q.id,
                        skill: SkillType.reading.rawValue,
                        sectionTag: "Reading P\(pIdx + 1)",
                        prompt: q.prompt,
                        chosenOption: chosenOpt,
                        correctOption: correctOpt,
                        isCorrect: chosenIdx == q.correctIndex,
                        explanation: q.explanation
                    )
                )
            }
        }
        for (tIdx, track) in listeningTracks.enumerated() {
            for q in track.questions {
                let chosenIdx = listeningAnswers[q.id]
                let chosenOpt = chosenIdx.flatMap { q.options.indices.contains($0) ? q.options[$0] : nil }
                let correctOpt = q.options.indices.contains(q.correctIndex) ? q.options[q.correctIndex] : ""
                reviews.append(
                    ExamQuestionReview(
                        id: q.id,
                        skill: SkillType.listening.rawValue,
                        sectionTag: "Listening T\(tIdx + 1)",
                        prompt: q.prompt,
                        chosenOption: chosenOpt,
                        correctOption: correctOpt,
                        isCorrect: chosenIdx == q.correctIndex,
                        explanation: q.explanation
                    )
                )
            }
        }

        let capturedWritingNotes = Array(writeEvals.flatMap(\.corrections).prefix(6))
        let capturedSpeakingNotes = Array(speakEval.corrections.prefix(6))

        let draftRec = ExamAttemptRecord(
            id: "exam-\(UUID().uuidString.prefix(8))",
            timestamp: ISO8601DateFormatter().string(from: Date()),
            examId: exam.id,
            examTitle: exam.title,
            alignedCertificate: exam.alignedCertificate,
            languageId: exam.languageId,
            level: exam.level,
            mode: mode,
            durationUsedSeconds: elapsedSeconds,
            overallScore: overall,
            passed: passed,
            officialGradeLabel: gradeLabel,
            skills: [
                SkillType.reading.rawValue: SkillExamScore(
                    score: readPct,
                    passed: readPct >= passMark,
                    feedback: "\(readCorrect)/\(allReadQs.count) correct (\(readBreakdown))"
                ),
                SkillType.listening.rawValue: SkillExamScore(
                    score: listenPct,
                    passed: listenPct >= passMark,
                    feedback: "\(listenCorrect)/\(allListenQs.count) correct (\(listenBreakdown)) · \(totalPlays) plays"
                ),
                SkillType.writing.rawValue: SkillExamScore(
                    score: writePct,
                    passed: writePct >= passMark,
                    feedback: "\(writeTaskSummary) — \(writeEvals.first?.examinerSummary ?? "")",
                    aiGraded: writeEvals.contains { $0.source == "ai" },
                    rubric: writeRubric
                ),
                SkillType.speaking.rawValue: SkillExamScore(
                    score: speakPct,
                    passed: speakPct >= passMark,
                    feedback: "Parts: \(answeredParts)/\(speakingParts.count) — \(speakEval.examinerSummary)",
                    aiGraded: speakEval.source == "ai",
                    rubric: speakRubric
                )
            ],
            writingSubmission: labeledWriting,
            speakingTranscript: labeledSpeaking,
            questionReviews: reviews,
            writingNotes: capturedWritingNotes,
            speakingNotes: capturedSpeakingNotes
        )

        // 5. Comprehensive 4-Skill AI Examiner Assessment (Reading, Listening, Writing, Speaking + Study Plan)
        let assessment = await ExamAssessmentService(aiClient: ai).assessFullExam(
            config: store.aiConfig,
            exam: exam,
            attempt: draftRec,
            writingEvals: writeEvals,
            speakingEval: speakEval
        )

        var enrichedSkills = draftRec.skills
        for sk in [SkillType.reading, .listening] {
            if let existing = enrichedSkills[sk.rawValue],
               assessment.insight(for: sk)?.aiAnalyzed == true {
                enrichedSkills[sk.rawValue] = SkillExamScore(
                    score: existing.score,
                    passed: existing.passed,
                    feedback: existing.feedback,
                    aiGraded: true,
                    rubric: existing.rubric
                )
            }
        }

        let rec = ExamAttemptRecord(
            id: draftRec.id,
            timestamp: draftRec.timestamp,
            examId: draftRec.examId,
            examTitle: draftRec.examTitle,
            alignedCertificate: draftRec.alignedCertificate,
            languageId: draftRec.languageId,
            level: draftRec.level,
            mode: draftRec.mode,
            durationUsedSeconds: draftRec.durationUsedSeconds,
            overallScore: draftRec.overallScore,
            passed: draftRec.passed,
            officialGradeLabel: draftRec.officialGradeLabel,
            skills: enrichedSkills,
            writingSubmission: draftRec.writingSubmission,
            speakingTranscript: draftRec.speakingTranscript,
            questionReviews: draftRec.questionReviews,
            writingNotes: draftRec.writingNotes,
            speakingNotes: draftRec.speakingNotes,
            aiAssessment: assessment
        )

        writingNotes = capturedWritingNotes
        speakingNotes = capturedSpeakingNotes
        allModulesPassed = allPassed
        report = rec
        store.recordExamAttempt(rec)
        phase = .report
        NativeAudioEngine.shared.playSuccessChime()
    }

    // MARK: - Helpers

    private func stopAudioAndMic() {
        speechRecognizer.stop()
        NativeAudioEngine.shared.stopSpeech()
        isPreReading = false
        isPrepping = false
    }

    private func writingBinding(for taskId: String) -> Binding<String> {
        Binding(
            get: { writingByTask[taskId] ?? "" },
            set: { writingByTask[taskId] = $0 }
        )
    }

    private func speakingBinding(for partId: String) -> Binding<String> {
        Binding(
            get: { speakingByPart[partId] ?? "" },
            set: { speakingByPart[partId] = $0 }
        )
    }

    private func wordCount(_ text: String) -> Int {
        LearningLanguage.countUnits(in: text)
    }

    private func accentBadge(_ code: String?, languageId: String) -> String {
        guard let code, !code.isEmpty else { return "🌐 Standard" }
        if let opt = NativeAudioEngine.accents(for: languageId).first(where: { $0.code == code }) {
            return "\(opt.flag) \(opt.label)"
        }
        return "🌐 \(code)"
    }

    private func accentFlagOnly(_ code: String?, languageId: String) -> String {
        guard let code, !code.isEmpty else { return "🌐" }
        return NativeAudioEngine.accents(for: languageId).first(where: { $0.code == code })?.flag ?? "🌐"
    }

    private func readingFormatLabel(_ format: String) -> String {
        switch format {
        case "true-false": return "Richtig / Falsch · TFNG"
        case "cloze": return "Sprachbausteine · Cloze"
        case "matching": return "Information Matching"
        default: return "Comprehension"
        }
    }

    private func formatClock(_ secs: Int) -> String {
        let s = max(0, secs)
        return String(format: "%02d:%02d", s / 60, s % 60)
    }
}
