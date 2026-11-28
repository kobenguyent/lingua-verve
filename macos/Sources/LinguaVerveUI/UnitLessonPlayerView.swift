import SwiftUI
import LinguaVerveCore

public struct UnitLessonPlayerView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    public let course: IntensiveCourse
    public let module: CourseModule
    public let unitIndex: Int
    public let totalUnits: Int
    public let nextModule: CourseModule?
    public let nextLevelCourse: IntensiveCourse?

    private enum LessonStep: Int, CaseIterable, Identifiable, Hashable {
        case learn = 0
        case vocab = 1
        case quiz = 2
        case drills = 3
        case checkpoint = 4

        var id: Int { rawValue }

        var shortTitle: String {
            switch self {
            case .learn: return "1. Learn"
            case .vocab: return "2. Vocab"
            case .quiz: return "3. Quiz"
            case .drills: return "4. Drills"
            case .checkpoint: return "5. Checkpoint"
            }
        }

        var systemImage: String {
            switch self {
            case .learn: return "book.fill"
            case .vocab: return "speaker.wave.2.fill"
            case .quiz: return "sparkles"
            case .drills: return "headphones"
            case .checkpoint: return "rosette"
            }
        }
    }

    @State private var currentStep: LessonStep = .learn
    @State private var completedSteps: Set<Int> = []

    // Step 2: Vocab flashcards
    @State private var vocabIndex: Int = 0
    @State private var isCardFlipped: Bool = false
    @State private var masteredVocab: Set<String> = []

    // Step 3: Interactive Quiz
    @State private var quizAnswers: [String: Int] = [:]

    // Step 4: Drills workbench
    @State private var completedDrills: Set<Int> = []
    @State private var drillNotes: [Int: String] = [:]
    @State private var drillAudioPlays: [Int: Int] = [:]
    @State private var drillEvaluations: [Int: AIEvaluationResult] = [:]
    @State private var evaluatingDrillIdx: Int? = nil
    @State private var activeMicDrillIdx: Int? = nil

    // Step 5: Milestone Checkpoint
    @State private var checkpointText: String = ""
    @State private var checkpointEvaluation: AIEvaluationResult? = nil
    @State private var checkpointScore: Int? = nil
    @State private var isEvaluatingCheckpoint: Bool = false
    @State private var showModelAnswer: Bool = false
    @State private var isRecordingCheckpoint: Bool = false
    @State private var justCompletedUnit: Bool = false

    @State private var speechRecognizer = NativeSpeechRecognizer()
    private let aiService = AIClientService()

    public init(
        store: CurriculumStore,
        course: IntensiveCourse,
        module: CourseModule,
        unitIndex: Int,
        totalUnits: Int,
        nextModule: CourseModule?,
        nextLevelCourse: IntensiveCourse?
    ) {
        self.store = store
        self.course = course
        self.module = module
        self.unitIndex = unitIndex
        self.totalUnits = totalUnits
        self.nextModule = nextModule
        self.nextLevelCourse = nextLevelCourse

        let saved = store.unitProgress(for: module.id)
        let savedStep = LessonStep(rawValue: saved?.currentStep ?? 0) ?? .learn
        _currentStep = State(initialValue: savedStep)
        _completedSteps = State(initialValue: Set(saved?.completedSteps ?? []))
        _masteredVocab = State(initialValue: Set(saved?.masteredVocab ?? []))
        _quizAnswers = State(initialValue: saved?.quizAnswers ?? [:])
        _completedDrills = State(initialValue: Set(saved?.completedDrillIndices ?? []))
        _checkpointText = State(initialValue: saved?.checkpointResponse ?? "")
        _checkpointScore = State(initialValue: saved?.checkpointScore)
    }

    private var lesson: UnitGuidedLesson {
        if let existing = module.lesson {
            return existing
        }
        return UnitGuidedLesson(
            estimatedMins: 25,
            overview: module.summary,
            sections: module.grammarCheckpoints.enumerated().map { idx, grammar in
                UnitLessonSection(
                    id: "\(module.id)-fallback-\(idx)",
                    heading: grammar,
                    explanation: idx < module.objectives.count ? module.objectives[idx] : module.summary,
                    formula: nil,
                    examples: [
                        UnitLessonExample(
                            target: module.keyVocabulary.joined(separator: " · "),
                            translation: "Practice pronouncing and using these target unit expressions in context.",
                            highlight: nil
                        )
                    ],
                    proTip: nil
                )
            },
            vocabCards: module.keyVocabulary.map { term in
                UnitVocabCard(
                    term: term,
                    pronunciation: nil,
                    meaning: "High-yield term for \(module.title)",
                    example: term,
                    exampleNote: nil
                )
            },
            practiceQuestions: [
                UnitPracticeQuestion(
                    id: "\(module.id)-fallback-q1",
                    skill: module.focusSkills.first ?? .reading,
                    prompt: "Which objective belongs to \(module.title)?",
                    passage: nil,
                    audioScript: nil,
                    options: [
                        module.objectives.first ?? module.summary,
                        "Skip listening and speaking completely.",
                        "Avoid checking grammar patterns."
                    ],
                    correctIndex: 0,
                    explanation: module.objectives.first ?? module.summary
                )
            ],
            checkpointSkill: module.focusSkills.contains(.speaking) ? .speaking : .writing,
            checkpointMinWords: 40,
            checkpointModelAnswer: module.checkpointPrompt
        )
    }

    public var body: some View {
        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    headerAndStepperCard

                    switch currentStep {
                    case .learn:
                        learnStepView
                    case .vocab:
                        vocabStepView
                    case .quiz:
                        quizStepView
                    case .drills:
                        drillsStepView
                    case .checkpoint:
                        checkpointStepView
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
                .animation(GoldenGateMetrics.panelAnimation, value: currentStep)
            }
        }
        .onChange(of: speechRecognizer.transcript) { _, newValue in
            guard !newValue.isEmpty else { return }
            if isRecordingCheckpoint {
                checkpointText = newValue
            } else if let idx = activeMicDrillIdx {
                drillNotes[idx] = newValue
            }
        }
        .onDisappear {
            stopSpeech()
            persistProgress()
        }
    }

    // MARK: - Header & 5-Step Stepper

    private var headerAndStepperCard: some View {
        let isDone = store.isModuleCompleted(module.id)
        let pct = Int((Double(completedSteps.count) / Double(LessonStep.allCases.count) * 100.0).rounded())
        let levelColor = BrandTheme.cefrColor(for: course.level.rawValue)
        let stepBinding = Binding<LessonStep>(
            get: { currentStep },
            set: { next in goToStep(next) }
        )

        return VStack(alignment: .leading, spacing: 18) {
            ViewThatFits(in: .horizontal) {
                HStack {
                    backButton
                    Spacer()
                    audioControls
                }
                VStack(alignment: .leading, spacing: 10) {
                    backButton
                    audioControls
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                FlowLayout(spacing: 8, lineSpacing: 4) {
                    Text("\(course.level.rawValue) · Unit \(unitIndex) of \(totalUnits)")
                        .scaledFont(.footnote, weight: .semibold)
                        .foregroundStyle(levelColor)

                    Text("· \(module.weekLabel)")
                        .scaledFont(.footnote, design: .monospaced)
                        .foregroundStyle(.secondary)

                    if isDone {
                        Label("Unit Mastered", systemImage: "checkmark.circle.fill")
                            .scaledFont(.caption2, weight: .bold)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.15)))
                            .foregroundStyle(BrandTheme.emeraldMint)
                    }
                }

                Text(module.title)
                    .scaledFont(.largeTitle, weight: .bold, design: .serif)
                    .fixedSize(horizontal: false, vertical: true)
                Text(lesson.overview)
                    .scaledFont(.body)
                    .lineSpacing(4)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Guided Lesson Progress")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(completedSteps.count)/\(LessonStep.allCases.count) steps (\(pct)%)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                }
                ProgressView(value: Double(max(8, pct)), total: 100.0)
                    .tint(BrandTheme.emeraldMint)

                GoldenGateSegmentedControl(
                    items: LessonStep.allCases,
                    selection: stepBinding,
                    allowHorizontalScroll: true
                ) { step, selected in
                    let isStepDone = completedSteps.contains(step.rawValue)
                    Label(
                        step.shortTitle,
                        systemImage: (isStepDone && !selected) ? "checkmark.circle.fill" : step.systemImage
                    )
                    .scaledFont(.caption, weight: selected ? .semibold : .medium)
                    .foregroundStyle(!selected && isStepDone ? BrandTheme.emeraldMint : (selected ? Color.primary : Color.secondary))
                }
            }
            .padding(16)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
        }
    }

    private var backButton: some View {
        Button {
            stopSpeech()
            NativeAudioEngine.shared.playClickSound()
            persistProgress()
            store.closeUnitLesson()
        } label: {
            Label("Back to \(course.level.rawValue) Syllabus", systemImage: "chevron.left")
        }
        .buttonStyle(GoldenGateGlassPillButtonStyle())
    }

    private var audioControls: some View {
        let accents = NativeAudioEngine.accents(for: course.languageId)
        let activeCode = NativeAudioEngine.shared.activeAccentCode(for: course.languageId)
        let options = accents.map { acc in
            GoldenGateDropdownOption(
                value: acc.code,
                title: "\(acc.flag) \(acc.label)",
                subtitle: acc.region
            )
        }
        let accentBinding = Binding<String>(
            get: { activeCode },
            set: { NativeAudioEngine.shared.setAccent(for: course.languageId, accentCode: $0) }
        )

        return FlowLayout(spacing: 10, lineSpacing: 8) {
            Label("~\(lesson.estimatedMins)m", systemImage: "clock")
                .scaledFont(.caption, design: .monospaced, monospacedDigit: true)
                .foregroundStyle(.secondary)
                .padding(.vertical, 6)

            GoldenGateDropdownMenu(
                title: "Accent",
                leadingIcon: "waveform",
                options: options,
                selection: accentBinding
            )

            Toggle("0.75x Slow", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                .toggleStyle(.switch)
                .scaledFont(.caption, design: .monospaced)
                .fixedSize()
        }
    }

    // MARK: - Step 1: Learn (Concept & Grammar)

    private var learnStepView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 10) {
                Text("What You Will Master in Unit \(unitIndex)")
                    .scaledFont(.caption, weight: .bold, design: .monospaced)
                    .foregroundStyle(BrandTheme.editorialBlue)
                ForEach(module.objectives, id: \.self) { obj in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "checkmark.seal.fill")
                            .scaledFont(.caption)
                            .foregroundStyle(BrandTheme.editorialBlue)
                            .padding(.top, 2)
                        Text(obj)
                            .scaledFont(.subheadline)
                    }
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, tint: BrandTheme.editorialBlue)

            ForEach(Array(lesson.sections.enumerated()), id: \.element.id) { idx, section in
                VStack(alignment: .leading, spacing: 14) {
                    Text("Concept \(idx + 1) of \(lesson.sections.count)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.editorialBlue)
                    Text(section.heading)
                        .scaledFont(.title3, weight: .bold, design: .serif)
                    Text(section.explanation)
                        .scaledFont(.body)
                        .lineSpacing(4)
                        .foregroundStyle(.secondary)

                    if let formula = section.formula {
                        Text(formula)
                            .scaledFont(.subheadline, weight: .semibold, design: .monospaced)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                    }

                    Text("Live Examples · Tap to Listen")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.secondary)

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(265, scale: fontScale)), spacing: 12)], spacing: 12) {
                        ForEach(section.examples) { ex in
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                NativeAudioEngine.shared.speak(ex.target, languageId: course.languageId)
                            } label: {
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack(alignment: .top, spacing: 8) {
                                        Text(ex.target)
                                            .scaledFont(.subheadline, weight: .semibold)
                                            .foregroundStyle(.primary)
                                            .multilineTextAlignment(.leading)
                                        Spacer(minLength: 4)
                                        Image(systemName: "speaker.wave.2.fill")
                                            .scaledFont(.caption)
                                            .foregroundStyle(BrandTheme.editorialBlue)
                                    }
                                    Text(ex.translation)
                                        .scaledFont(.caption)
                                        .foregroundStyle(.secondary)
                                        .multilineTextAlignment(.leading)
                                    if let highlight = ex.highlight {
                                        Text("Pattern: \(highlight)")
                                            .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 3)
                                            .background(RoundedRectangle(cornerRadius: 6).fill(BrandTheme.editorialBlue.opacity(0.12)))
                                            .foregroundStyle(BrandTheme.editorialBlue)
                                    }
                                }
                                .padding(13)
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                                .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, interactive: true)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if let tip = section.proTip {
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundStyle(BrandTheme.deepGold)
                                .padding(.top, 2)
                            Text("Exam Pro Tip: \(tip)")
                                .scaledFont(.subheadline)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.champagneGold)
                    }
                }
                .padding(20)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
            }

            HStack {
                Spacer()
                Button {
                    goToStep(.vocab, markCurrentDone: true)
                } label: {
                    Label("Continue to Vocabulary Flashcards", systemImage: "arrow.right")
                }
                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
            }
        }
    }

    // MARK: - Step 2: Audio Vocabulary Flashcards

    private var vocabStepView: some View {
        let cards = lesson.vocabCards
        let safeIdx = min(vocabIndex, max(0, cards.count - 1))
        let card = cards.isEmpty ? nil : cards[safeIdx]

        return VStack(alignment: .leading, spacing: 16) {
            if let card {
                let isMastered = masteredVocab.contains(card.term)

                VStack(alignment: .leading, spacing: 18) {
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Card \(safeIdx + 1) of \(cards.count)")
                                .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(BrandTheme.editorialBlue)
                            Text("High-Yield Exam Vocabulary Studio")
                                .scaledFont(.headline, weight: .bold, design: .serif)
                        }
                        Spacer()
                        Text("Mastered \(masteredVocab.count)/\(cards.count)")
                            .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.15)))
                            .foregroundStyle(BrandTheme.emeraldMint)
                    }

                    // Flashcard Surface
                    VStack(spacing: 16) {
                        HStack(spacing: 8) {
                            Text(isCardFlipped ? "Meaning & Context" : "Target Expression")
                                .scaledFont(.caption, weight: .semibold, design: .monospaced)
                                .foregroundStyle(.secondary)
                            if isMastered {
                                Label("Got It", systemImage: "checkmark.circle.fill")
                                    .scaledFont(.caption2, weight: .bold)
                                    .foregroundStyle(BrandTheme.emeraldMint)
                            }
                        }

                        Text(card.term)
                            .scaledFont(.largeTitle, weight: .bold, design: .serif)
                            .multilineTextAlignment(.center)

                        if let pron = card.pronunciation {
                            Text(pron)
                                .scaledFont(.subheadline, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }

                        FlowLayout(spacing: 10, lineSpacing: 8) {
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                NativeAudioEngine.shared.speak(card.term, languageId: course.languageId)
                            } label: {
                                Label("Listen", systemImage: "speaker.wave.2.fill")
                            }
                            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))

                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                withAnimation(GoldenGateMetrics.snappySpring) {
                                    isCardFlipped.toggle()
                                }
                            } label: {
                                Label(isCardFlipped ? "Hide Answer" : "Reveal Meaning & Example", systemImage: "arrow.triangle.2.circlepath")
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle())
                        }

                        GoldenGateCollapsiblePanel(isExpanded: isCardFlipped) {
                            VStack(alignment: .leading, spacing: 10) {
                                GoldenGateSectionHairline()
                                Text(card.meaning)
                                    .scaledFont(.headline)
                                HStack(alignment: .top, spacing: 8) {
                                    Text("“\(card.example)”")
                                        .scaledFont(.body)
                                    Spacer()
                                    Button {
                                        NativeAudioEngine.shared.playClickSound()
                                        NativeAudioEngine.shared.speak(card.example, languageId: course.languageId)
                                    } label: {
                                        Image(systemName: "speaker.wave.2.fill")
                                    }
                                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                                }
                                if let note = card.exampleNote {
                                    Text(note)
                                        .scaledFont(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        FlowLayout(spacing: 10, lineSpacing: 8) {
                            Button {
                                handleVocabDecision(mastered: false, card: card, total: cards.count)
                            } label: {
                                Label("Need Review", systemImage: "arrow.counterclockwise")
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle(accent: BrandTheme.deepGold))

                            Button {
                                handleVocabDecision(mastered: true, card: card, total: cards.count)
                            } label: {
                                Label("Got It! Next Card", systemImage: "checkmark.circle.fill")
                            }
                            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
                        }
                    }
                    .padding(24)
                    .frame(maxWidth: .infinity)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.editorialBlue)

                    // Deck Pills
                    FlowLayout(spacing: 8, lineSpacing: 8) {
                        ForEach(Array(cards.enumerated()), id: \.element.id) { idx, item in
                            let selected = idx == safeIdx
                            let itemMastered = masteredVocab.contains(item.term)
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                withAnimation(GoldenGateMetrics.snappySpring) {
                                    vocabIndex = idx
                                    isCardFlipped = false
                                }
                            } label: {
                                HStack(spacing: 5) {
                                    if itemMastered {
                                        Image(systemName: "checkmark.circle.fill")
                                            .scaledFont(.caption2)
                                    }
                                    Text(item.term)
                                }
                            }
                            .buttonStyle(
                                GoldenGateGlassPillButtonStyle(
                                    isSelected: selected || itemMastered,
                                    accent: selected ? BrandTheme.editorialBlue : BrandTheme.emeraldMint
                                )
                            )
                        }
                    }
                }
                .padding(20)
                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
            }

            stepFooterButtons(back: .learn, backLabel: "Back to Concept", next: .quiz, nextLabel: "Continue to Quiz")
        }
    }

    // MARK: - Step 3: Interactive Knowledge Check Quiz

    private var quizStepView: some View {
        let questions = lesson.practiceQuestions
        let correctCount = questions.filter { quizAnswers[$0.id] == $0.correctIndex }.count

        return VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Interactive Check · Instant Explanations")
                            .scaledFont(.caption, weight: .semibold, design: .monospaced)
                            .foregroundStyle(BrandTheme.editorialBlue)
                        Text("Test Your Unit \(unitIndex) Mastery")
                            .scaledFont(.headline, weight: .bold, design: .serif)
                    }
                    Spacer()
                    Text("Score \(correctCount)/\(questions.count)")
                        .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.14)))
                        .foregroundStyle(BrandTheme.editorialBlue)
                    if !quizAnswers.isEmpty {
                        Button("Retry") {
                            NativeAudioEngine.shared.playClickSound()
                            quizAnswers = [:]
                            persistProgress()
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                    }
                }

                ForEach(Array(questions.enumerated()), id: \.element.id) { idx, q in
                    quizQuestionCard(idx: idx, q: q, totalCount: questions.count)
                }
            }
            .padding(20)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

            stepFooterButtons(back: .vocab, backLabel: "Back to Vocab", next: .drills, nextLabel: "Continue to Drills")
        }
    }

    @ViewBuilder
    private func quizQuestionCard(idx: Int, q: UnitPracticeQuestion, totalCount: Int) -> some View {
        let chosen = quizAnswers[q.id]
        let isAnswered = chosen != nil
        let isCorrect = chosen == q.correctIndex

        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Question \(idx + 1) of \(totalCount)")
                    .scaledFont(.caption, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(.secondary)
                Spacer()
                Label(q.skill.shortName, systemImage: q.skill.systemImage)
                    .scaledFont(.caption2, weight: .bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.12)))
                    .foregroundStyle(BrandTheme.editorialBlue)
            }

            if let passage = q.passage {
                Text(passage)
                    .scaledFont(.subheadline)
                    .italic()
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: 10)
            }

            if let audioScript = q.audioScript {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    NativeAudioEngine.shared.speak(audioScript, languageId: course.languageId)
                } label: {
                    Label("Play Listening Clip", systemImage: "speaker.wave.2.fill")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())

                if isAnswered {
                    GoldenGateEditorialDisclosure("View Audio Transcript") {
                        Text(audioScript)
                            .scaledFont(.subheadline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
            }

            Text(q.prompt)
                .scaledFont(.headline, weight: .semibold)

            VStack(spacing: 8) {
                ForEach(Array(q.options.enumerated()), id: \.offset) { optIdx, opt in
                    quizOptionButton(q: q, optIdx: optIdx, opt: opt, chosen: chosen, isAnswered: isAnswered)
                }
            }

            if isAnswered {
                Label(
                    "\(isCorrect ? "Correct: " : "Key Takeaway: ")\(q.explanation)",
                    systemImage: isCorrect ? "checkmark.circle.fill" : "lightbulb.fill"
                )
                .scaledFont(.subheadline)
                .foregroundStyle(isCorrect ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .goldenGateSurface(
                    cornerRadius: 10,
                    tint: isCorrect ? BrandTheme.emeraldMint : BrandTheme.champagneGold
                )
            }
        }
        .padding(16)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    @ViewBuilder
    private func quizOptionButton(
        q: UnitPracticeQuestion,
        optIdx: Int,
        opt: String,
        chosen: Int?,
        isAnswered: Bool
    ) -> some View {
        let selected = chosen == optIdx
        let optionIsRight = optIdx == q.correctIndex
        let tint: Color? = isAnswered && optionIsRight
            ? BrandTheme.emeraldMint
            : (isAnswered && selected && !optionIsRight ? .red : nil)

        Button {
            withAnimation(GoldenGateMetrics.snappySpring) {
                handleAnswerQuiz(question: q, optionIndex: optIdx)
            }
        } label: {
            HStack {
                Text(opt)
                    .scaledFont(.subheadline)
                    .multilineTextAlignment(.leading)
                Spacer()
                if isAnswered && optionIsRight {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(BrandTheme.emeraldMint)
                } else if isAnswered && selected && !optionIsRight {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.red)
                }
            }
            .padding(11)
            .frame(maxWidth: .infinity, alignment: .leading)
            .goldenGateSurface(cornerRadius: 10, tint: tint, interactive: true)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Step 4: Interactive 4-Skill Drills Workbench

    private var drillsStepView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Active Skill Workbench · \(completedDrills.count)/\(module.drills.count) practiced")
                    .scaledFont(.footnote, weight: .semibold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(BrandTheme.editorialBlue)

                if let msg = speechRecognizer.statusMessage {
                    Text(msg)
                        .scaledFont(.caption)
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: 10, tint: BrandTheme.champagneGold)
                }

                ForEach(Array(module.drills.enumerated()), id: \.element.id) { idx, drill in
                    drillCard(idx: idx, drill: drill)
                }
            }
            .padding(20)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

            stepFooterButtons(back: .quiz, backLabel: "Back to Quiz", next: .checkpoint, nextLabel: "Continue to Checkpoint")
        }
    }

    @ViewBuilder
    private func drillCard(idx: Int, drill: CourseDrill) -> some View {
        let practiced = completedDrills.contains(idx)
        let isProductive = drill.skill == .writing || drill.skill == .speaking
        let noteBinding = Binding<String>(
            get: { drillNotes[idx] ?? "" },
            set: { drillNotes[idx] = $0 }
        )

        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Label("\(drill.skill.displayName) · \(drill.durationMins)m", systemImage: drill.skill.systemImage)
                        .scaledFont(.caption, weight: .bold)
                        .foregroundStyle(BrandTheme.editorialBlue)
                    Text(drill.title)
                        .scaledFont(.headline, weight: .bold, design: .serif)
                }
                Spacer()
                Button {
                    withAnimation(GoldenGateMetrics.snappySpring) {
                        toggleDrillPracticed(idx)
                    }
                } label: {
                    Label(practiced ? "Practiced" : "Mark Practiced", systemImage: practiced ? "checkmark.circle.fill" : "circle")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: practiced, accent: BrandTheme.emeraldMint))
            }

            Text(drill.instruction)
                .scaledFont(.subheadline)
                .foregroundStyle(.secondary)

            if let passage = drill.samplePassage {
                Text(passage)
                    .scaledFont(.subheadline)
                    .italic()
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: 10)
            }

            if let script = drill.audioScript {
                HStack(spacing: 10) {
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        NativeAudioEngine.shared.speak(script, languageId: course.languageId)
                        drillAudioPlays[idx, default: 0] += 1
                    } label: {
                        Label("Play Listening Audio", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())

                    if let count = drillAudioPlays[idx], count > 0 {
                        Text("Played \(count)×")
                            .scaledFont(.caption2, design: .monospaced, monospacedDigit: true)
                            .foregroundStyle(.secondary)
                    }
                }
                GoldenGateEditorialDisclosure("Reveal Audio Transcript") {
                    Text(script)
                        .scaledFont(.subheadline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            Text(isProductive ? "Your Practice Response:" : "Your Notes & Comprehension Answers:")
                .scaledFont(.caption, weight: .semibold)
                .foregroundStyle(.secondary)

            TextEditor(text: noteBinding)
                .scaledFont(.body)
                .frame(minHeight: isProductive ? 88 : 60)
                .padding(8)
                .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Color.primary.opacity(0.03)))
                .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(BrandTheme.editorialHairline, lineWidth: 1))

            FlowLayout(spacing: 8, lineSpacing: 8) {
                if drill.skill == .speaking {
                    let recordingThis = speechRecognizer.isRecording && activeMicDrillIdx == idx
                    Button {
                        toggleDrillMic(idx)
                    } label: {
                        Label(
                            recordingThis ? "Stop Mic" : "Dictate Live Voice",
                            systemImage: recordingThis ? "mic.slash.fill" : "mic.fill"
                        )
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: recordingThis ? .red : BrandTheme.emeraldMint))
                }

                if isProductive {
                    Button {
                        Task { await evaluateDrill(idx: idx, drill: drill) }
                    } label: {
                        Label(
                            evaluatingDrillIdx == idx ? "Evaluating…" : "Evaluate Drill",
                            systemImage: "sparkles"
                        )
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
                    .disabled(evaluatingDrillIdx == idx || (drillNotes[idx] ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }

                Button {
                    store.openAICoach(
                        languageId: course.languageId,
                        level: course.level,
                        skill: drill.skill,
                        seedPrompt: "Practice drill: \(drill.title). \(drill.instruction)"
                    )
                } label: {
                    Label("Open in AI Coach", systemImage: "bubble.left.and.sparkles")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())
            }

            if let result = drillEvaluations[idx] {
                evaluationBox(result)
            }
        }
        .padding(16)
        .goldenGateSurface(
            cornerRadius: GoldenGateMetrics.nestedCornerRadius,
            tint: practiced ? BrandTheme.emeraldMint : nil
        )
    }

    // MARK: - Step 5: Milestone Checkpoint & Unit Completion

    private var checkpointStepView: some View {
        let wordCount = LearningLanguage.countUnits(in: checkpointText, languageId: course.languageId)

        return VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(spacing: 8) {
                            Label("Unit \(unitIndex) Milestone Checkpoint", systemImage: "rosette")
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                                .foregroundStyle(BrandTheme.deepGold)
                            Text(lesson.checkpointSkill.displayName)
                                .scaledFont(.caption2, weight: .bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandTheme.editorialBlue.opacity(0.12)))
                                .foregroundStyle(BrandTheme.editorialBlue)
                        }
                        Text(module.checkpointPrompt)
                            .scaledFont(.title3, weight: .bold, design: .serif)
                    }
                    Spacer()
                    Text("\(wordCount) / \(lesson.checkpointMinWords)+ words")
                        .scaledFont(.caption, weight: .semibold, design: .monospaced, monospacedDigit: true)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .goldenGateGlassPill()
                }

                // Vocabulary hints
                VStack(alignment: .leading, spacing: 8) {
                    Text("Try using these Unit \(unitIndex) terms · Tap to hear")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.secondary)
                    FlowLayout(spacing: 8, lineSpacing: 8) {
                        ForEach(module.keyVocabulary, id: \.self) { word in
                            let used = checkpointText.localizedCaseInsensitiveContains(word)
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                NativeAudioEngine.shared.speak(word, languageId: course.languageId)
                            } label: {
                                Label(word, systemImage: used ? "checkmark.circle.fill" : "speaker.wave.2.fill")
                            }
                            .buttonStyle(
                                GoldenGateGlassPillButtonStyle(
                                    isSelected: used,
                                    accent: used ? BrandTheme.emeraldMint : BrandTheme.editorialBlue
                                )
                            )
                        }
                    }
                }

                if let msg = speechRecognizer.statusMessage {
                    Text(msg)
                        .scaledFont(.caption)
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: 10, tint: BrandTheme.champagneGold)
                }

                TextEditor(text: $checkpointText)
                    .scaledFont(.body)
                    .frame(minHeight: 140)
                    .padding(10)
                    .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Color.primary.opacity(0.03)))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(BrandTheme.editorialHairline, lineWidth: 1))

                FlowLayout(spacing: 10, lineSpacing: 8) {
                    Button {
                        toggleCheckpointMic()
                    } label: {
                        Label(
                            isRecordingCheckpoint ? "Stop Mic Recording" : "Dictate Live Voice",
                            systemImage: isRecordingCheckpoint ? "mic.slash.fill" : "mic.fill"
                        )
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: isRecordingCheckpoint, accent: isRecordingCheckpoint ? .red : BrandTheme.emeraldMint))

                    Button {
                        Task { await evaluateCheckpoint() }
                    } label: {
                        Label(
                            isEvaluatingCheckpoint ? "Evaluating…" : "Evaluate Checkpoint",
                            systemImage: "sparkles"
                        )
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
                    .disabled(isEvaluatingCheckpoint || checkpointText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        withAnimation(GoldenGateMetrics.panelAnimation) {
                            showModelAnswer.toggle()
                        }
                    } label: {
                        Label(showModelAnswer ? "Hide Model Answer" : "Compare with Model Answer", systemImage: "doc.text.magnifyingglass")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: showModelAnswer))
                }

                if let eval = checkpointEvaluation {
                    evaluationBox(eval)
                }

                GoldenGateCollapsiblePanel(isExpanded: showModelAnswer) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Reference \(course.level.rawValue) Model Response")
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                NativeAudioEngine.shared.speak(lesson.checkpointModelAnswer, languageId: course.languageId)
                            } label: {
                                Label("Listen to Model", systemImage: "speaker.wave.2.fill")
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.editorialBlue))
                        }
                        Text(lesson.checkpointModelAnswer)
                            .scaledFont(.body)
                            .lineSpacing(3)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
                }

                if justCompletedUnit {
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Unit \(unitIndex) Completed! Progress saved.", systemImage: "graduationcap.fill")
                            .scaledFont(.headline, weight: .bold, design: .serif)
                            .foregroundStyle(BrandTheme.emeraldMint)
                        FlowLayout(spacing: 10, lineSpacing: 8) {
                            Button {
                                store.closeUnitLesson()
                                store.openExamSimulator(languageId: course.languageId, level: course.level)
                            } label: {
                                Label("Simulate \(course.level.rawValue) 4-Skill Exam", systemImage: "timer")
                            }
                            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))

                            if let nextLvl = nextLevelCourse {
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    store.openCourse(languageId: nextLvl.languageId, level: nextLvl.level)
                                } label: {
                                    Label("Start \(nextLvl.level.rawValue) Course", systemImage: "arrow.right.circle.fill")
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: true, accent: BrandTheme.emeraldMint))
                            }
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.emeraldMint)
                }
            }
            .padding(20)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

            HStack {
                Button {
                    goToStep(.drills)
                } label: {
                    Label("Back to Drills", systemImage: "chevron.left")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())

                Spacer()

                if let nextMod = nextModule {
                    Button {
                        finishUnit(advanceTo: nextMod)
                    } label: {
                        Label("Complete Unit & Continue to Unit \(unitIndex + 1)", systemImage: "checkmark.circle.fill")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
                } else {
                    Button {
                        finishUnit(advanceTo: nil)
                    } label: {
                        Label("Complete Unit \(unitIndex) & Finish \(course.level.rawValue)", systemImage: "checkmark.circle.fill")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.emeraldMint))
                }
            }
        }
    }

    // MARK: - Reusable Subviews & Actions

    private func stepFooterButtons(back: LessonStep, backLabel: String, next: LessonStep, nextLabel: String) -> some View {
        HStack {
            Button {
                goToStep(back)
            } label: {
                Label(backLabel, systemImage: "chevron.left")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle())

            Spacer()

            Button {
                goToStep(next, markCurrentDone: true)
            } label: {
                Label(nextLabel, systemImage: "arrow.right")
            }
            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))
        }
    }

    private func evaluationBox(_ result: AIEvaluationResult) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("\(result.score)/100")
                    .scaledFont(.title3, weight: .bold, monospacedDigit: true)
                Text("CEFR \(result.cefrEstimate.rawValue)")
                    .scaledFont(.caption, weight: .bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(BrandTheme.editorialBlue))
                    .foregroundStyle(.white)
                Spacer()
                Text(result.providerLabel)
                    .scaledFont(.caption2, design: .monospaced)
                    .foregroundStyle(.secondary)
            }
            Text(result.examinerSummary)
                .scaledFont(.subheadline)

            if !result.strengths.isEmpty {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Strengths")
                        .scaledFont(.caption2, weight: .bold)
                        .foregroundStyle(BrandTheme.emeraldMint)
                    ForEach(result.strengths, id: \.self) { item in
                        Text("• \(item)").scaledFont(.caption)
                    }
                }
            }
            if !result.corrections.isEmpty {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Next-Level Fixes")
                        .scaledFont(.caption2, weight: .bold)
                        .foregroundStyle(BrandTheme.deepGold)
                    ForEach(result.corrections, id: \.self) { item in
                        Text("• \(item)").scaledFont(.caption)
                    }
                }
            }
            if !result.upgradedVersion.isEmpty {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Upgraded \(course.level.rawValue)+ Version")
                        .scaledFont(.caption2, weight: .bold)
                        .foregroundStyle(BrandTheme.editorialBlue)
                    Text(result.upgradedVersion).scaledFont(.caption)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.editorialBlue)
    }

    private func stopSpeech() {
        speechRecognizer.stop()
        activeMicDrillIdx = nil
        isRecordingCheckpoint = false
    }

    private func goToStep(_ next: LessonStep, markCurrentDone: Bool = false) {
        stopSpeech()
        NativeAudioEngine.shared.playClickSound()
        if markCurrentDone {
            completedSteps.insert(currentStep.rawValue)
        }
        currentStep = next
        persistProgress()
    }

    private func handleVocabDecision(mastered: Bool, card: UnitVocabCard, total: Int) {
        if mastered {
            NativeAudioEngine.shared.playSuccessChime()
            masteredVocab.insert(card.term)
        } else {
            NativeAudioEngine.shared.playClickSound()
            masteredVocab.remove(card.term)
        }
        if masteredVocab.count >= total {
            completedSteps.insert(LessonStep.vocab.rawValue)
        }
        persistProgress()
        isCardFlipped = false
        if vocabIndex + 1 < total {
            vocabIndex += 1
        }
    }

    private func handleAnswerQuiz(question: UnitPracticeQuestion, optionIndex: Int) {
        quizAnswers[question.id] = optionIndex
        if optionIndex == question.correctIndex {
            NativeAudioEngine.shared.playSuccessChime()
        } else {
            NativeAudioEngine.shared.playClickSound()
        }
        if lesson.practiceQuestions.allSatisfy({ quizAnswers[$0.id] != nil }) {
            completedSteps.insert(LessonStep.quiz.rawValue)
        }
        persistProgress()
    }

    private func toggleDrillPracticed(_ idx: Int) {
        if completedDrills.contains(idx) {
            completedDrills.remove(idx)
            NativeAudioEngine.shared.playClickSound()
        } else {
            completedDrills.insert(idx)
            NativeAudioEngine.shared.playSuccessChime()
        }
        if completedDrills.count >= module.drills.count {
            completedSteps.insert(LessonStep.drills.rawValue)
        }
        persistProgress()
    }

    private func toggleDrillMic(_ idx: Int) {
        if speechRecognizer.isRecording && activeMicDrillIdx == idx {
            stopSpeech()
        } else {
            stopSpeech()
            activeMicDrillIdx = idx
            speechRecognizer.start(languageId: course.languageId, existingText: drillNotes[idx] ?? "")
        }
    }

    private func evaluateDrill(idx: Int, drill: CourseDrill) async {
        let text = (drillNotes[idx] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        evaluatingDrillIdx = idx
        defer { evaluatingDrillIdx = nil }

        let result = await aiService.evaluateWithAIOrFallback(
            config: store.aiConfig,
            text: text,
            languageId: course.languageId,
            level: course.level,
            skill: drill.skill == .speaking ? .speaking : .writing,
            taskPrompt: "\(drill.title): \(drill.instruction)",
            minWords: max(20, Int(Double(lesson.checkpointMinWords) * 0.7)),
            expectedKeywords: module.keyVocabulary
        )
        drillEvaluations[idx] = result
        completedDrills.insert(idx)
        if completedDrills.count >= module.drills.count {
            completedSteps.insert(LessonStep.drills.rawValue)
        }
        persistProgress()
        NativeAudioEngine.shared.playSuccessChime()
    }

    private func toggleCheckpointMic() {
        if isRecordingCheckpoint {
            stopSpeech()
        } else {
            stopSpeech()
            isRecordingCheckpoint = true
            speechRecognizer.start(languageId: course.languageId, existingText: checkpointText)
        }
    }

    private func evaluateCheckpoint() async {
        stopSpeech()
        isEvaluatingCheckpoint = true
        defer { isEvaluatingCheckpoint = false }

        let result = await aiService.evaluateWithAIOrFallback(
            config: store.aiConfig,
            text: checkpointText,
            languageId: course.languageId,
            level: course.level,
            skill: lesson.checkpointSkill,
            taskPrompt: module.checkpointPrompt,
            minWords: lesson.checkpointMinWords,
            expectedKeywords: module.keyVocabulary
        )
        checkpointEvaluation = result
        checkpointScore = result.score
        completedSteps.insert(LessonStep.checkpoint.rawValue)
        persistProgress()
        NativeAudioEngine.shared.playSuccessChime()
    }

    private func finishUnit(advanceTo nextMod: CourseModule?) {
        stopSpeech()
        completedSteps = Set(LessonStep.allCases.map(\.rawValue))
        persistProgress()
        store.markModuleCompleted(module, languageId: course.languageId, level: course.level, score: checkpointScore)
        NativeAudioEngine.shared.playSuccessChime()
        if let nextMod {
            store.openUnitLesson(moduleId: nextMod.id, languageId: course.languageId, level: course.level)
        } else {
            justCompletedUnit = true
        }
    }

    private func persistProgress() {
        let progress = UnitStudyProgress(
            moduleId: module.id,
            currentStep: currentStep.rawValue,
            completedSteps: completedSteps.sorted(),
            masteredVocab: masteredVocab.sorted(),
            quizAnswers: quizAnswers,
            completedDrillIndices: completedDrills.sorted(),
            checkpointResponse: checkpointText,
            checkpointScore: checkpointScore,
            lastStudiedAt: ISO8601DateFormatter().string(from: Date())
        )
        store.saveUnitProgress(progress)
    }
}
