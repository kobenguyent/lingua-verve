import SwiftUI
import Combine
import LinguaVerveCore

public struct ExamSimulatorNativeView: View {
    @Bindable var store: CurriculumStore
    @Binding var showAISettingsSheet: Bool

    @State private var mode: String = "strict" // "strict" | "practice"
    @State private var timingMode: String = "official" // "official" | "sprint"
    @State private var phase: ExamPhase = .lobby
    @State private var activeSection: SkillType = .reading

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

    private let ticker = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private enum ExamPhase {
        case lobby, running, grading, report
    }

    public init(store: CurriculumStore, showAISettingsSheet: Binding<Bool>) {
        self.store = store
        self._showAISettingsSheet = showAISettingsSheet
    }

    public var body: some View {
        let lang = store.courseLanguageId == "german" ? "german" : "english"
        let exam = store.mockExam(for: lang, level: store.examTargetLevel)

        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let exam {
                    switch phase {
                    case .lobby:
                        lobbyView(exam: exam)
                    case .running:
                        runningView(exam: exam)
                    case .grading:
                        VStack(spacing: 12) {
                            ProgressView().controlSize(.large)
                            Text("Grading Multi-Part 4-Skill Certification Exam...")
                                .font(.headline)
                            Text("Scoring 9 Reading items, 9 Multi-Accent Listening items, 2 Weighted Writing tasks, and 3 Speaking parts against CEFR \(exam.level.rawValue).")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(40)
                        .frame(maxWidth: .infinity)
                    case .report:
                        if let report {
                            reportView(exam: exam, report: report)
                        }
                    }
                } else {
                    ContentUnavailableView("No Exam Loaded", systemImage: "doc.questionmark")
                }
            }
            .padding(16)
            .frame(maxWidth: 980)
            .frame(maxWidth: .infinity)
        }
        .onReceive(ticker) { _ in
            guard phase == .running else { return }
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
               let exam = store.mockExam(for: lang, level: store.examTargetLevel) {
                Task { await submitExam(exam) }
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
    }

    // MARK: - Lobby View

    @ViewBuilder
    private func lobbyView(exam: MockExam) -> some View {
        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts
        let totalReadQs = readingParts.reduce(0) { $0 + $1.questions.count }
        let totalListenQs = listeningTracks.reduce(0) { $0 + $1.questions.count }
        let configuredMins = timingMode == "official" ? exam.totalMinutes : max(15, Int((Double(exam.totalMinutes) * 0.5).rounded()))

        VStack(alignment: .leading, spacing: 14) {
            ViewThatFits(in: .horizontal) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("REAL-WORLD MULTI-PART 4-SKILL EXAM ARENA")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundStyle(.red)
                        Text("Simulate Official Certification Pressure")
                            .font(.system(size: 22, weight: .bold, design: .serif))
                    }
                    Spacer()
                    Picker("Language", selection: $store.courseLanguageId) {
                        Text("🇬🇧 English").tag("english")
                        Text("🇩🇪 German").tag("german")
                    }
                    .labelsHidden()
                    .pickerStyle(.segmented)
                    .frame(maxWidth: 220)
                }
                VStack(alignment: .leading, spacing: 8) {
                    Text("Simulate Official Certification Pressure")
                        .font(.system(size: 21, weight: .bold, design: .serif))
                    Picker("Language", selection: $store.courseLanguageId) {
                        Text("🇬🇧 English").tag("english")
                        Text("🇩🇪 German").tag("german")
                    }
                    .labelsHidden()
                    .pickerStyle(.segmented)
                }
            }

            // Level Strip
            Picker("Level", selection: $store.examTargetLevel) {
                ForEach(CEFRLevel.allCases) { lvl in
                    Text(lvl.rawValue).tag(lvl)
                }
            }
            .pickerStyle(.segmented)

            VStack(alignment: .leading, spacing: 12) {
                Text(exam.alignedCertificate)
                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                    .foregroundStyle(BrandTheme.celestialSky)
                Text(exam.title)
                    .font(.title3.weight(.bold))

                FlowLayout(spacing: 8, lineSpacing: 6) {
                    Text("⏱ \(configuredMins) mins · Pass ≥ \(exam.passingScorePercent)%")
                        .font(.caption.monospaced().bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(Color.primary.opacity(0.08)))
                    if exam.requireAllSkillsPass == true {
                        Text("Modular Gate: All 4 Skills Must Pass")
                            .font(.caption.monospaced().bold())
                            .foregroundStyle(.orange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Capsule().fill(Color.orange.opacity(0.14)))
                    }
                }

                // Multi-Part Blueprint Grid
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 190), spacing: 10)], spacing: 10) {
                    blueprintCard(
                        title: "1. Reading",
                        badge: "\(readingParts.count) Parts · \(totalReadQs) Qs",
                        detail: exam.languageId == "german"
                            ? "Lesen + Richtig/Falsch + Sprachbausteine"
                            : "Comprehension + TFNG + Use of English",
                        tint: BrandTheme.celestialSky
                    )
                    blueprintCard(
                        title: "2. Listening",
                        badge: "\(listeningTracks.count) Tracks · \(totalListenQs) Qs",
                        detail: listeningTracks.map { accentBadge($0.accentCode, languageId: exam.languageId) }.joined(separator: " · "),
                        tint: .purple
                    )
                    blueprintCard(
                        title: "3. Writing",
                        badge: "\(writingTasks.count) Weighted Tasks",
                        detail: "Weights: \(writingTasks.map { "\($0.weightPercent)%" }.joined(separator: " + ")) · 4-Criterion Rubric",
                        tint: .orange
                    )
                    blueprintCard(
                        title: "4. Speaking",
                        badge: "\(speakingParts.count) Oral Parts",
                        detail: "Warm-Up + Cue Card + Examiner Pushback",
                        tint: BrandTheme.emeraldMint
                    )
                }

                // Mode & Pacing Pickers
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 10) {
                        Picker("Pressure Mode", selection: $mode) {
                            Text("🔥 Strict Pressure").tag("strict")
                            Text("🧘 Guided Practice").tag("practice")
                        }
                        .pickerStyle(.segmented)

                        Picker("Clock", selection: $timingMode) {
                            Text("Official (\(exam.totalMinutes)m)").tag("official")
                            Text("Sprint (\(max(15, Int((Double(exam.totalMinutes) * 0.5).rounded())))m)").tag("sprint")
                        }
                        .pickerStyle(.segmented)
                    }
                    VStack(spacing: 8) {
                        Picker("Pressure Mode", selection: $mode) {
                            Text("🔥 Strict Pressure").tag("strict")
                            Text("🧘 Guided Practice").tag("practice")
                        }
                        .pickerStyle(.segmented)

                        Picker("Clock", selection: $timingMode) {
                            Text("Official (\(exam.totalMinutes)m)").tag("official")
                            Text("Sprint (\(max(15, Int((Double(exam.totalMinutes) * 0.5).rounded())))m)").tag("sprint")
                        }
                        .pickerStyle(.segmented)
                    }
                }

                HStack {
                    Image(systemName: "sparkles")
                        .foregroundStyle(store.aiConfig.isReady ? BrandTheme.emeraldMint : .secondary)
                    if store.aiConfig.isReady {
                        Text("AI Examiner Active: \(store.aiConfig.provider.label) (\(store.aiConfig.model))")
                            .font(.caption)
                    } else {
                        Text("Built-in 4-Criterion CEFR Rubric active.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Button("Connect Local/Cloud AI") { showAISettingsSheet = true }
                            .font(.caption.weight(.bold))
                    }
                }

                Button {
                    startExam(exam)
                } label: {
                    Label("Begin \(exam.level.rawValue) Multi-Part Simulated Exam", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(mode == "strict" ? .red : BrandTheme.celestialSky)
                .controlSize(.large)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.04)))
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    private func blueprintCard(title: String, badge: String, detail: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title).font(.caption.weight(.bold)).foregroundStyle(tint)
                Spacer()
                Text(badge).font(.system(size: 10, weight: .semibold, design: .monospaced)).foregroundStyle(.secondary)
            }
            Text(detail).font(.caption2).foregroundStyle(.secondary).lineLimit(2)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
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
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("\(mode == "strict" ? "STRICT EXAM PRESSURE" : "PRACTICE SIMULATION") · \(exam.alignedCertificate)")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(mode == "strict" ? .red : BrandTheme.celestialSky)
                Text(exam.title).font(.subheadline.weight(.bold)).lineLimit(1)
            }
            Spacer()
            Label(formatClock(remainingSeconds), systemImage: "timer")
                .font(.system(size: 16, weight: .bold, design: .monospaced))
                .monospacedDigit()
                .foregroundStyle(remainingSeconds <= 120 && mode == "strict" ? .red : .primary)
            Button("Submit All") {
                Task { await submitExam(exam) }
            }
            .buttonStyle(.borderedProminent)
            .tint(BrandTheme.emeraldMint)
            .controlSize(.small)
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))

        // 4-Skill Switcher with live progress summary
        Picker("Skill", selection: Binding(
            get: { activeSection },
            set: { next in
                stopAudioAndMic()
                activeSection = next
            }
        )) {
            Text("Read \(readAnswered)/\(readTotal)").tag(SkillType.reading)
            Text("Listen \(listenAnswered)/\(listenTotal)").tag(SkillType.listening)
            Text("Write \(totalWrittenWords)w").tag(SkillType.writing)
            Text("Speak \(totalSpokenWords)w").tag(SkillType.speaking)
        }
        .pickerStyle(.segmented)

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

        VStack(alignment: .leading, spacing: 12) {
            Picker("Reading Part", selection: $activeReadingIdx) {
                ForEach(Array(parts.enumerated()), id: \.element.id) { idx, p in
                    let done = p.questions.filter { readingAnswers[$0.id] != nil }.count
                    Text("Part \(idx + 1) (\(done)/\(p.questions.count))").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            HStack {
                Text(part.partLabel).font(.caption.monospaced().bold()).foregroundStyle(BrandTheme.celestialSky)
                Spacer()
                Text(readingFormatLabel(part.format))
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.15)))
            }

            Text(part.passageTitle).font(.headline)
            Text(part.instruction).font(.caption).foregroundStyle(.secondary)

            Text(part.passage)
                .font(.subheadline)
                .lineSpacing(4)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))

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
                        activeReadingIdx = safeIdx + 1
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    Button("Next: Listening / Hearing →") {
                        stopAudioAndMic()
                        activeSection = .listening
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    @ViewBuilder
    private func listeningSectionView(exam: MockExam, tracks: [ListeningExamTrack]) -> some View {
        let safeIdx = min(activeListeningIdx, max(0, tracks.count - 1))
        let track = tracks[safeIdx]
        let playsUsed = listeningPlaysByTrack[track.id] ?? 0
        let locked = mode == "strict" && playsUsed >= track.maxPlaysStrict

        VStack(alignment: .leading, spacing: 12) {
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

            HStack {
                Text(track.partLabel).font(.caption.monospaced().bold()).foregroundStyle(.purple)
                Spacer()
                Text(accentBadge(track.accentCode, languageId: exam.languageId))
                    .font(.system(size: 10.5, weight: .bold, design: .monospaced))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.purple.opacity(0.15)))
            }

            Text(track.contextNote).font(.subheadline).foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
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
                    .buttonStyle(.borderedProminent)
                    .tint(.purple)
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
                    .buttonStyle(.bordered)

                    Text("Track \(safeIdx + 1) Plays: \(playsUsed)/\(mode == "strict" ? "\(track.maxPlaysStrict)" : "∞")")
                        .font(.caption.monospaced().bold())
                        .padding(.vertical, 6)
                }

                Text("⚠️ Hearing Focus: \(track.hearingFocusTrap)")
                    .font(.caption)
                    .foregroundStyle(.orange)

                if mode == "strict" {
                    Label("Transcript locked in Strict Mode — unlocked in Score Report.", systemImage: "lock.fill")
                        .font(.caption2.monospaced())
                        .foregroundStyle(.secondary)
                } else {
                    DisclosureGroup("Practice Mode: Peek Track \(safeIdx + 1) Transcript") {
                        Text(track.audioScript).font(.caption).padding(.top, 4)
                    }
                    .font(.caption)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.purple.opacity(0.08)))

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
                        activeListeningIdx = safeIdx + 1
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.purple)
                } else {
                    Button("Next: Writing →") {
                        stopAudioAndMic()
                        activeSection = .writing
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    @ViewBuilder
    private func writingSectionView(exam: MockExam, tasks: [WritingExamTask]) -> some View {
        let safeIdx = min(activeWritingIdx, max(0, tasks.count - 1))
        let task = tasks[safeIdx]
        let wc = wordCount(writingByTask[task.id] ?? "")

        VStack(alignment: .leading, spacing: 12) {
            Picker("Writing Task", selection: $activeWritingIdx) {
                ForEach(Array(tasks.enumerated()), id: \.element.id) { idx, t in
                    let words = wordCount(writingByTask[t.id] ?? "")
                    Text("Task \(idx + 1) (\(t.weightPercent)%) · \(words)w").tag(idx)
                }
            }
            .pickerStyle(.segmented)

            Text("\(task.partLabel) · Weight \(task.weightPercent)%")
                .font(.caption.monospaced().bold())
                .foregroundStyle(.orange)
            Text(task.scenario).font(.headline)

            VStack(alignment: .leading, spacing: 4) {
                ForEach(task.taskRequirements, id: \.self) { req in
                    Text("• \(req)").font(.caption)
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 9).fill(BrandTheme.champagneGold.opacity(0.12)))

            HStack {
                Text("Task \(safeIdx + 1) Written Submission").font(.caption.weight(.bold))
                Spacer()
                Text("\(wc) words (Target: \(task.minWords)–\(task.maxWords))")
                    .font(.caption.monospaced().bold())
                    .foregroundStyle(wc >= task.minWords ? BrandTheme.emeraldMint : .orange)
            }

            TextEditor(text: writingBinding(for: task.id))
                .font(.body)
                .frame(minHeight: 190)
                .padding(6)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primary.opacity(0.18)))

            HStack {
                Text("4-Criterion CEFR Rubric: Task, Coherence, Lexis, Grammar")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer()
                if safeIdx < tasks.count - 1 {
                    Button("Next: Writing Task \(safeIdx + 2) →") {
                        NativeAudioEngine.shared.playClickSound()
                        activeWritingIdx = safeIdx + 1
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                } else {
                    Button("Next: Speaking →") {
                        stopAudioAndMic()
                        activeSection = .speaking
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    @ViewBuilder
    private func speakingSectionView(exam: MockExam, parts: [SpeakingExamPart]) -> some View {
        let safeIdx = min(activeSpeakingIdx, max(0, parts.count - 1))
        let part = parts[safeIdx]
        let wc = wordCount(speakingByPart[part.id] ?? "")

        VStack(alignment: .leading, spacing: 12) {
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

            Text(part.partLabel).font(.caption.monospaced().bold()).foregroundStyle(BrandTheme.emeraldMint)
            Text(part.instruction).font(.headline)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(part.prompts.enumerated()), id: \.offset) { i, pt in
                    Text("\(i + 1). \(pt)").font(.caption)
                }
                if let promptAudio = part.examinerPromptAudio, !promptAudio.isEmpty {
                    Divider()
                    HStack(alignment: .top, spacing: 8) {
                        Text("“\(promptAudio)”")
                            .font(.caption.italic())
                            .foregroundStyle(.secondary)
                        Spacer()
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            NativeAudioEngine.shared.speak(promptAudio, languageId: exam.languageId, slow: false)
                        } label: {
                            Label("Play Examiner", systemImage: "speaker.wave.2.fill")
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 10).fill(BrandTheme.emeraldMint.opacity(0.10)))

            FlowLayout(spacing: 8, lineSpacing: 8) {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    prepSecondsLeft = part.prepSeconds
                    isPrepping = true
                } label: {
                    Label(isPrepping ? "Prep: \(prepSecondsLeft)s" : "Start \(part.prepSeconds)s Prep", systemImage: "timer")
                }
                .buttonStyle(.bordered)

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
                .buttonStyle(.borderedProminent)
                .tint(speechRecognizer.isRecording ? .red : BrandTheme.emeraldMint)
            }

            if let msg = speechRecognizer.statusMessage {
                Text(msg).font(.caption).foregroundStyle(.orange)
            }

            HStack {
                Text("Part \(safeIdx + 1) Spoken Transcript (Auto-captured via Mic or Type Manually)")
                    .font(.caption.weight(.bold))
                Spacer()
                Text("\(wc) words").font(.caption.monospaced()).foregroundStyle(.secondary)
            }

            TextEditor(text: speakingBinding(for: part.id))
                .font(.body)
                .frame(minHeight: 130)
                .padding(6)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primary.opacity(0.18)))

            HStack {
                if safeIdx < parts.count - 1 {
                    Button("Next: Speaking Part \(safeIdx + 2) →") {
                        stopAudioAndMic()
                        NativeAudioEngine.shared.playClickSound()
                        activeSpeakingIdx = safeIdx + 1
                    }
                    .buttonStyle(.bordered)
                }
                Spacer()
                Button {
                    Task { await submitExam(exam) }
                } label: {
                    Label("Finish & Grade All 4 Skills", systemImage: "checkmark.seal.fill")
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.emeraldMint)
                .controlSize(.large)
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    // MARK: - Report View

    @ViewBuilder
    private func reportView(exam: MockExam, report: ExamAttemptRecord) -> some View {
        let readingParts = exam.reading.resolvedParts
        let listeningTracks = exam.listening.resolvedTracks
        let writingTasks = exam.writing.resolvedTasks
        let speakingParts = exam.speaking.resolvedParts

        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    FlowLayout(spacing: 8, lineSpacing: 6) {
                        Text(report.passed ? "CERTIFICATION READY · PASSED" : "BELOW PASS MARK · REVIEW & RETRY")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundStyle(report.passed ? BrandTheme.emeraldMint : .orange)
                        if let label = report.officialGradeLabel {
                            Text(label)
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.16)))
                                .foregroundStyle(BrandTheme.celestialSky)
                        }
                    }
                    Text("\(report.examTitle) — \(report.overallScore)%")
                        .font(.title2.weight(.bold))
                    Text("Mode: \(report.mode.uppercased()) · Time: \(formatClock(report.durationUsedSeconds)) · Saved to History")
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                    if exam.requireAllSkillsPass == true && report.overallScore >= exam.passingScorePercent && !allModulesPassed {
                        Text("⚠️ Overall average met \(exam.passingScorePercent)%, but modular certification requires passing EVERY skill (≥ \(exam.passingScorePercent)%).")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                }
                Spacer()
                Button("New Exam") { phase = .lobby }
                    .buttonStyle(.bordered)
            }

            // 4-Skill Score Cards + 4-Criterion CEFR Rubric Bars
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 200), spacing: 10)], spacing: 10) {
                ForEach(SkillType.allCases) { sk in
                    if let s = report.skills[sk.rawValue] {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(sk.shortName.uppercased()).font(.caption.monospaced().bold())
                                Spacer()
                                Text(s.passed ? "PASS" : "FAIL")
                                    .font(.system(size: 9.5, weight: .bold, design: .monospaced))
                                    .padding(.horizontal, 5)
                                    .padding(.vertical, 2)
                                    .background(Capsule().fill((s.passed ? BrandTheme.emeraldMint : Color.red).opacity(0.16)))
                                    .foregroundStyle(s.passed ? BrandTheme.emeraldMint : .red)
                                Text("\(s.score)%")
                                    .font(.headline.monospaced())
                                    .foregroundStyle(s.passed ? BrandTheme.emeraldMint : .red)
                            }
                            Text(s.feedback).font(.caption).foregroundStyle(.secondary)
                            if let rubric = s.rubric {
                                Divider()
                                rubricBarRow("Task Fulfillment", value: rubric.taskFulfillment)
                                rubricBarRow("Coherence & Cohesion", value: rubric.coherenceCohesion)
                                rubricBarRow("Lexical Range", value: rubric.lexicalRange)
                                rubricBarRow("Grammar Accuracy", value: rubric.grammaticalAccuracy)
                            }
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                    }
                }
            }

            // Unlocked Multi-Accent Transcripts + Full 18-Item Answer Key
            DisclosureGroup("Unlocked Multi-Accent Transcripts & Answer Key (\(readingParts.reduce(0) { $0 + $1.questions.count } + listeningTracks.reduce(0) { $0 + $1.questions.count }) Items)") {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(Array(listeningTracks.enumerated()), id: \.element.id) { idx, track in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Track \(idx + 1) · \(accentBadge(track.accentCode, languageId: exam.languageId)) — \(track.partLabel)")
                                    .font(.caption.bold())
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
                                .buttonStyle(.bordered)
                                .controlSize(.mini)
                            }
                            Text(track.audioScript).font(.caption).foregroundStyle(.secondary)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.purple.opacity(0.08)))
                    }

                    Divider()

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
                .padding(.top, 8)
            }
            .font(.subheadline.weight(.semibold))

            // Writing Tasks & 3-Part Speaking Model Benchmarks
            DisclosureGroup("Official Model Benchmarks (Writing Tasks & 3-Part Speaking)") {
                VStack(alignment: .leading, spacing: 10) {
                    if !writingNotes.isEmpty {
                        Text("Writing Action Notes: \(writingNotes.joined(separator: " • "))")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                    if !speakingNotes.isEmpty {
                        Text("Speaking Action Notes: \(speakingNotes.joined(separator: " • "))")
                            .font(.caption)
                            .foregroundStyle(BrandTheme.emeraldMint)
                    }

                    ForEach(Array(writingTasks.enumerated()), id: \.element.id) { idx, task in
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Model \(exam.level.rawValue) Writing · Task \(idx + 1) (\(task.weightPercent)%): \(task.partLabel)")
                                .font(.caption.bold())
                            Text(task.modelAnswer).font(.caption).foregroundStyle(.secondary)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.04)))
                    }

                    ForEach(Array(speakingParts.enumerated()), id: \.element.id) { idx, part in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Model \(exam.level.rawValue) Speaking · Part \(idx + 1): \(part.partLabel)")
                                    .font(.caption.bold())
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.speak(part.modelResponseScript, languageId: exam.languageId)
                                } label: {
                                    Label("Hear Model", systemImage: "speaker.wave.2.fill")
                                }
                                .buttonStyle(.bordered)
                                .controlSize(.mini)
                            }
                            Text(part.modelResponseScript).font(.caption).foregroundStyle(.secondary)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.04)))
                    }
                }
                .padding(.top, 8)
            }
            .font(.subheadline.weight(.semibold))
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
    }

    private func rubricBarRow(_ title: String, value: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title).font(.system(size: 10, design: .monospaced)).foregroundStyle(.secondary)
                Spacer()
                Text("\(value)%").font(.system(size: 10, weight: .bold, design: .monospaced))
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
                Text("[\(tag)] \(question.prompt)").font(.caption.weight(.semibold))
                Spacer()
                Text(ok ? "✓" : "✗")
                    .font(.caption.bold())
                    .foregroundStyle(ok ? BrandTheme.emeraldMint : .red)
            }
            Text("Correct: \(correctText) — \(question.explanation)")
                .font(.caption2)
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
        VStack(alignment: .leading, spacing: 6) {
            Text("Q\(index). \(question.prompt)").font(.subheadline.weight(.semibold))
            ForEach(Array(question.options.enumerated()), id: \.offset) { idx, opt in
                let chosen = selection == idx
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    onSelect(idx)
                } label: {
                    HStack {
                        Image(systemName: chosen ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(chosen ? BrandTheme.celestialSky : .secondary)
                        Text(opt).font(.caption).foregroundStyle(.primary).multilineTextAlignment(.leading)
                        Spacer()
                    }
                    .padding(9)
                    .background(RoundedRectangle(cornerRadius: 8).fill(chosen ? BrandTheme.celestialSky.opacity(0.16) : Color.primary.opacity(0.04)))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.03)))
    }

    // MARK: - Actions & Multi-Part Grading

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
        let mins = timingMode == "official" ? exam.totalMinutes : max(15, Int((Double(exam.totalMinutes) * 0.5).rounded()))
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
        let writeRubric = OfficialRubricBreakdown.compute(
            text: rawWriting,
            score: writePct,
            minWords: writingTasks.reduce(0) { $0 + $1.minWords },
            expectedKeywords: writingTasks.flatMap(\.keyRubricKeywords)
        )
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
        let speakRubric = OfficialRubricBreakdown.compute(
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

        let rec = ExamAttemptRecord(
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
            speakingTranscript: labeledSpeaking
        )

        writingNotes = Array(writeEvals.flatMap(\.corrections).prefix(6))
        speakingNotes = speakEval.corrections
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
        text.split(whereSeparator: \.isWhitespace).count
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
