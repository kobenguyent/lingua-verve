import SwiftUI
import Combine
import LinguaVerveCore

public struct ExamSimulatorNativeView: View {
    @Bindable var store: CurriculumStore
    @Binding var showAISettingsSheet: Bool

    @State private var mode: String = "strict" // "strict" | "practice"
    @State private var phase: ExamPhase = .lobby
    @State private var activeSection: SkillType = .reading

    @State private var remainingSeconds: Int = 1500
    @State private var elapsedSeconds: Int = 0
    @State private var readingAnswers: [String: Int] = [:]
    @State private var listeningAnswers: [String: Int] = [:]
    @State private var listeningPlays: Int = 0
    @State private var writingText: String = ""
    @State private var speakingText: String = ""

    @State private var prepSecondsLeft: Int = 0
    @State private var isPrepping: Bool = false
    @State private var speechRecognizer = NativeSpeechRecognizer()

    @State private var report: ExamAttemptRecord?
    @State private var writingNotes: [String] = []
    @State private var speakingNotes: [String] = []

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
                            Text("Grading All 4 Certification Skills...")
                                .font(.headline)
                            Text("Evaluating Reading, Listening/Hearing, Writing, and Speaking against CEFR \(exam.level.rawValue).")
                                .font(.caption)
                                .foregroundStyle(.secondary)
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
            .frame(maxWidth: 960)
            .frame(maxWidth: .infinity)
        }
        .onReceive(ticker) { _ in
            guard phase == .running else { return }
            elapsedSeconds += 1
            if remainingSeconds > 0 {
                remainingSeconds -= 1
            }
            if isPrepping && prepSecondsLeft > 0 {
                prepSecondsLeft -= 1
                if prepSecondsLeft == 0 {
                    isPrepping = false
                    NativeAudioEngine.shared.playClickSound()
                }
            }
            if mode == "strict" && remainingSeconds == 0 && elapsedSeconds > 2,
               let exam = store.mockExam(for: lang, level: store.examTargetLevel) {
                Task { await submitExam(exam) }
            }
        }
        .onChange(of: speechRecognizer.transcript) { _, newVal in
            if !newVal.isEmpty {
                speakingText = newVal
            }
        }
        .onDisappear {
            speechRecognizer.stop()
            NativeAudioEngine.shared.stopSpeech()
        }
    }

    @ViewBuilder
    private func lobbyView(exam: MockExam) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            ViewThatFits(in: .horizontal) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("HIGH-PRESSURE 4-SKILL EXAM ARENA")
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

            VStack(alignment: .leading, spacing: 10) {
                Text(exam.alignedCertificate)
                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                    .foregroundStyle(BrandTheme.celestialSky)
                Text(exam.title)
                    .font(.title3.weight(.bold))
                Text("⏱ \(exam.totalMinutes) mins total · Pass Threshold ≥ \(exam.passingScorePercent)% · Strict Audio Cap: \(exam.listening.maxPlaysStrict) play(s)")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)

                Picker("Pressure Mode", selection: $mode) {
                    Text("🔥 Strict Exam Pressure").tag("strict")
                    Text("🧘 Guided Practice").tag("practice")
                }
                .pickerStyle(.segmented)

                HStack {
                    Image(systemName: "sparkles")
                        .foregroundStyle(store.aiConfig.isReady ? BrandTheme.emeraldMint : .secondary)
                    if store.aiConfig.isReady {
                        Text("AI Examiner Active: \(store.aiConfig.provider.label) (\(store.aiConfig.model))")
                            .font(.caption)
                    } else {
                        Text("Built-in CEFR Rubric active.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Button("Connect Local/Cloud AI") { showAISettingsSheet = true }
                            .font(.caption.weight(.bold))
                    }
                }

                Button {
                    startExam(exam)
                } label: {
                    Label("Begin \(exam.level.rawValue) 4-Skill Simulated Exam", systemImage: "play.fill")
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

    @ViewBuilder
    private func runningView(exam: MockExam) -> some View {
        // Countdown Bar
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(mode == "strict" ? "STRICT EXAM PRESSURE" : "PRACTICE SIMULATION")
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

        // 4-Skill Switcher
        Picker("Skill", selection: $activeSection) {
            ForEach(SkillType.allCases) { sk in
                Text(sk.shortName).tag(sk)
            }
        }
        .pickerStyle(.segmented)

        switch activeSection {
        case .reading:
            VStack(alignment: .leading, spacing: 12) {
                Text(exam.reading.title).font(.caption.monospaced().bold()).foregroundStyle(BrandTheme.celestialSky)
                Text(exam.reading.passageTitle).font(.headline)
                Text(exam.reading.passage)
                    .font(.subheadline)
                    .lineSpacing(4)
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))

                ForEach(Array(exam.reading.questions.enumerated()), id: \.element.id) { idx, q in
                    questionPicker(index: idx + 1, question: q, selection: readingAnswers[q.id]) { chosen in
                        readingAnswers[q.id] = chosen
                    }
                }
                Button("Next: Listening / Hearing →") { activeSection = .listening }
                    .buttonStyle(.borderedProminent)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

        case .listening:
            VStack(alignment: .leading, spacing: 12) {
                Text(exam.listening.title).font(.caption.monospaced().bold()).foregroundStyle(.purple)
                Text(exam.listening.contextNote).font(.subheadline).foregroundStyle(.secondary)

                HStack {
                    Button {
                        if mode == "strict" && listeningPlays >= exam.listening.maxPlaysStrict { return }
                        listeningPlays += 1
                        NativeAudioEngine.shared.speak(exam.listening.audioScript, languageId: exam.languageId, slow: false)
                    } label: {
                        Label("Play Official Audio Track", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.purple)
                    .disabled(mode == "strict" && listeningPlays >= exam.listening.maxPlaysStrict)

                    Spacer()
                    Text("Plays: \(listeningPlays)/\(mode == "strict" ? "\(exam.listening.maxPlaysStrict)" : "∞")")
                        .font(.caption.monospaced().bold())
                }

                Text("⚠️ Hearing Focus: \(exam.listening.hearingFocusTrap)")
                    .font(.caption)
                    .foregroundStyle(.orange)

                if mode == "practice" {
                    DisclosureGroup("Practice Mode: Peek Transcript") {
                        Text(exam.listening.audioScript).font(.caption).padding(.top, 4)
                    }
                    .font(.caption)
                }

                ForEach(Array(exam.listening.questions.enumerated()), id: \.element.id) { idx, q in
                    questionPicker(index: idx + 1, question: q, selection: listeningAnswers[q.id]) { chosen in
                        listeningAnswers[q.id] = chosen
                    }
                }
                Button("Next: Writing →") { activeSection = .writing }
                    .buttonStyle(.borderedProminent)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

        case .writing:
            let wc = writingText.split(whereSeparator: \.isWhitespace).count
            VStack(alignment: .leading, spacing: 12) {
                Text(exam.writing.title).font(.caption.monospaced().bold()).foregroundStyle(.orange)
                Text(exam.writing.scenario).font(.headline)

                VStack(alignment: .leading, spacing: 4) {
                    ForEach(exam.writing.taskRequirements, id: \.self) { req in
                        Text("• \(req)").font(.caption)
                    }
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 9).fill(BrandTheme.champagneGold.opacity(0.12)))

                HStack {
                    Text("Your Written Submission").font(.caption.weight(.bold))
                    Spacer()
                    Text("\(wc) words (Target: \(exam.writing.minWords)–\(exam.writing.maxWords))")
                        .font(.caption.monospaced().bold())
                        .foregroundStyle(wc >= exam.writing.minWords ? BrandTheme.emeraldMint : .orange)
                }

                TextEditor(text: $writingText)
                    .font(.body)
                    .frame(minHeight: 190)
                    .padding(6)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primary.opacity(0.18)))

                Button("Next: Speaking →") { activeSection = .speaking }
                    .buttonStyle(.borderedProminent)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

        case .speaking:
            VStack(alignment: .leading, spacing: 12) {
                Text(exam.speaking.title).font(.caption.monospaced().bold()).foregroundStyle(BrandTheme.emeraldMint)
                Text("Cue Card: \(exam.speaking.cueCardTitle)").font(.headline)

                VStack(alignment: .leading, spacing: 5) {
                    ForEach(Array(exam.speaking.bulletPoints.enumerated()), id: \.offset) { i, pt in
                        Text("\(i + 1). \(pt)").font(.caption)
                    }
                    Divider()
                    Text("Follow-up: \(exam.speaking.followUpQuestion)").font(.caption.weight(.semibold))
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(BrandTheme.emeraldMint.opacity(0.10)))

                FlowLayout(spacing: 8, lineSpacing: 8) {
                    Button {
                        prepSecondsLeft = exam.speaking.prepSeconds
                        isPrepping = true
                    } label: {
                        Label(isPrepping ? "Prep: \(prepSecondsLeft)s" : "Start \(exam.speaking.prepSeconds)s Prep", systemImage: "timer")
                    }
                    .buttonStyle(.bordered)

                    Button {
                        if speechRecognizer.isRecording {
                            speechRecognizer.stop()
                        } else {
                            speechRecognizer.start(languageId: exam.languageId, existingText: speakingText)
                        }
                    } label: {
                        Label(
                            speechRecognizer.isRecording ? "Stop Mic Recording" : "Dictate Live Voice",
                            systemImage: speechRecognizer.isRecording ? "mic.slash.fill" : "mic.fill"
                        )
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(speechRecognizer.isRecording ? .red : BrandTheme.emeraldMint)
                }

                if let msg = speechRecognizer.statusMessage {
                    Text(msg).font(.caption).foregroundStyle(.orange)
                }

                Text("Spoken Transcript (Auto-captured via Mic or Type Manually)")
                    .font(.caption.weight(.bold))

                TextEditor(text: $speakingText)
                    .font(.body)
                    .frame(minHeight: 140)
                    .padding(6)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primary.opacity(0.18)))

                Button {
                    Task { await submitExam(exam) }
                } label: {
                    Label("Finish & Grade All 4 Skills", systemImage: "checkmark.seal.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(BrandTheme.emeraldMint)
                .controlSize(.large)
            }
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
        }
    }

    @ViewBuilder
    private func reportView(exam: MockExam, report: ExamAttemptRecord) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(report.passed ? "CERTIFICATION READY · PASSED" : "BELOW PASS MARK · REVIEW & RETRY")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundStyle(report.passed ? BrandTheme.emeraldMint : .orange)
                    Text("\(report.examTitle) — \(report.overallScore)%")
                        .font(.title2.weight(.bold))
                    Text("Mode: \(report.mode.uppercased()) · Time: \(formatClock(report.durationUsedSeconds)) · Saved to History")
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button("New Exam") { phase = .lobby }
                    .buttonStyle(.bordered)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 10)], spacing: 10) {
                ForEach(SkillType.allCases) { sk in
                    if let s = report.skills[sk.rawValue] {
                        VStack(alignment: .leading, spacing: 5) {
                            HStack {
                                Text(sk.shortName.uppercased()).font(.caption.monospaced().bold())
                                Spacer()
                                Text("\(s.score)%")
                                    .font(.headline.monospaced())
                                    .foregroundStyle(s.passed ? BrandTheme.emeraldMint : .red)
                            }
                            Text(s.feedback).font(.caption).foregroundStyle(.secondary)
                        }
                        .padding(12)
                        .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                    }
                }
            }

            DisclosureGroup("Unlocked Listening Transcript & Model Answers") {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Listening Script:").font(.caption.bold())
                    Text(exam.listening.audioScript).font(.caption).foregroundStyle(.secondary)

                    Divider()
                    Text("Model \(exam.level.rawValue) Writing:").font(.caption.bold())
                    Text(exam.writing.modelAnswer).font(.caption).foregroundStyle(.secondary)

                    Divider()
                    HStack {
                        Text("Model \(exam.level.rawValue) Speaking:").font(.caption.bold())
                        Spacer()
                        Button {
                            NativeAudioEngine.shared.speak(exam.speaking.modelResponseScript, languageId: exam.languageId)
                        } label: {
                            Label("Hear Model", systemImage: "speaker.wave.2.fill")
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                    Text(exam.speaking.modelResponseScript).font(.caption).foregroundStyle(.secondary)

                    if !writingNotes.isEmpty {
                        Divider()
                        Text("Writing Notes: \(writingNotes.joined(separator: " • "))").font(.caption)
                    }
                    if !speakingNotes.isEmpty {
                        Text("Speaking Notes: \(speakingNotes.joined(separator: " • "))").font(.caption)
                    }
                }
                .padding(.top, 8)
            }
            .font(.subheadline.weight(.semibold))
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
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

    private func startExam(_ exam: MockExam) {
        NativeAudioEngine.shared.playClickSound()
        readingAnswers = [:]
        listeningAnswers = [:]
        listeningPlays = 0
        writingText = ""
        speakingText = ""
        remainingSeconds = exam.totalMinutes * 60
        elapsedSeconds = 0
        activeSection = .reading
        report = nil
        phase = .running
    }

    @MainActor
    private func submitExam(_ exam: MockExam) async {
        speechRecognizer.stop()
        NativeAudioEngine.shared.stopSpeech()
        phase = .grading

        let readCorrect = exam.reading.questions.filter { readingAnswers[$0.id] == $0.correctIndex }.count
        let readPct = Int((Double(readCorrect) / Double(max(1, exam.reading.questions.count)) * 100.0).rounded())

        let listenCorrect = exam.listening.questions.filter { listeningAnswers[$0.id] == $0.correctIndex }.count
        let listenPct = Int((Double(listenCorrect) / Double(max(1, exam.listening.questions.count)) * 100.0).rounded())

        let ai = AIClientService()
        let writeEval = await ai.evaluateWithAIOrFallback(
            config: store.aiConfig,
            text: writingText,
            languageId: exam.languageId,
            level: exam.level,
            skill: .writing,
            taskPrompt: exam.writing.scenario,
            minWords: exam.writing.minWords,
            expectedKeywords: exam.writing.keyRubricKeywords
        )

        let speakEval = await ai.evaluateWithAIOrFallback(
            config: store.aiConfig,
            text: speakingText,
            languageId: exam.languageId,
            level: exam.level,
            skill: .speaking,
            taskPrompt: exam.speaking.cueCardTitle,
            minWords: max(25, Int(Double(exam.writing.minWords) * 0.7)),
            expectedKeywords: exam.speaking.keyRubricKeywords
        )

        let overall = (readPct + listenPct + writeEval.score + speakEval.score) / 4
        let passMark = exam.passingScorePercent

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
            passed: overall >= passMark,
            skills: [
                SkillType.reading.rawValue: SkillExamScore(score: readPct, passed: readPct >= passMark, feedback: "\(readCorrect)/\(exam.reading.questions.count) correct"),
                SkillType.listening.rawValue: SkillExamScore(score: listenPct, passed: listenPct >= passMark, feedback: "\(listenCorrect)/\(exam.listening.questions.count) correct (\(listeningPlays) plays)"),
                SkillType.writing.rawValue: SkillExamScore(score: writeEval.score, passed: writeEval.score >= passMark, feedback: writeEval.examinerSummary, aiGraded: writeEval.source == "ai"),
                SkillType.speaking.rawValue: SkillExamScore(score: speakEval.score, passed: speakEval.score >= passMark, feedback: speakEval.examinerSummary, aiGraded: speakEval.source == "ai")
            ],
            writingSubmission: writingText,
            speakingTranscript: speakingText
        )

        writingNotes = writeEval.corrections
        speakingNotes = speakEval.corrections
        report = rec
        store.recordExamAttempt(rec)
        phase = .report
        NativeAudioEngine.shared.playSuccessChime()
    }

    private func formatClock(_ secs: Int) -> String {
        let s = max(0, secs)
        return String(format: "%02d:%02d", s / 60, s % 60)
    }
}
