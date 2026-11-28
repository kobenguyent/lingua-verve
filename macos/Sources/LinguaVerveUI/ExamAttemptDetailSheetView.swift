import SwiftUI
import LinguaVerveCore

private enum ReviewFilterMode: String, CaseIterable, Identifiable, Hashable {
    case all = "All"
    case missed = "Missed Only"
    case reading = "Reading"
    case listening = "Listening"

    var id: String { rawValue }
}

public struct ExamAttemptDetailSheetView: View {
    @Bindable var store: CurriculumStore
    @State private var currentAttempt: ExamAttemptRecord
    @Environment(\.dismiss) private var dismiss

    @State private var reviewFilter: ReviewFilterMode = .all
    @State private var copiedSummary = false
    @State private var showDeleteConfirm = false
    @State private var showReferenceBenchmarks = false
    @State private var isAnalyzingAI = false
    @State private var showAISettingsSheet = false
    @State private var showCertificateSheet = false

    public init(store: CurriculumStore, attempt: ExamAttemptRecord) {
        self.store = store
        self._currentAttempt = State(initialValue: attempt)
    }

    private var attempt: ExamAttemptRecord { currentAttempt }

    private var resolvedGradeLabel: String {
        if let label = attempt.officialGradeLabel, !label.isEmpty {
            return label
        }
        let allPassed = SkillType.allCases.allSatisfy { attempt.skills[$0.rawValue]?.passed ?? false }
        let passMark = store.exam(for: attempt)?.exam.passingScorePercent ?? 60
        return MockExam.officialGradeLabel(
            languageId: attempt.languageId,
            level: attempt.level,
            overallScore: attempt.overallScore,
            allModulesPassed: allPassed,
            passingScorePercent: passMark
        )
    }

    private var matchedExamInfo: (exam: MockExam, isExactMatch: Bool)? {
        store.exam(for: attempt)
    }

    private var filteredReviews: [ExamQuestionReview] {
        let all = attempt.questionReviews ?? []
        switch reviewFilter {
        case .all:
            return all
        case .missed:
            return all.filter { !$0.isCorrect }
        case .reading:
            return all.filter { $0.skill == SkillType.reading.rawValue }
        case .listening:
            return all.filter { $0.skill == SkillType.listening.rawValue }
        }
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                GoldenGateEditorialBackdrop()

                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        heroHeaderCard
                        skillsScorecardSection
                        aiAssessmentSection
                        submissionsSection
                        questionReviewSection
                        referenceBenchmarksSection
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 20)
                    .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth)
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Past Exam Dossier")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        NativeAudioEngine.shared.stopSpeech()
                        dismiss()
                    }
                }
                ToolbarItemGroup(placement: .primaryAction) {
                    if attempt.passed {
                        Button {
                            NativeAudioEngine.shared.playSuccessChime()
                            showCertificateSheet = true
                        } label: {
                            Label("Certificate", systemImage: "rosette")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.deepGold)
                    }

                    Button {
                        PlatformClipboard.copy(buildPlainTextDossier())
                        NativeAudioEngine.shared.playClickSound()
                        copiedSummary = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            copiedSummary = false
                        }
                    } label: {
                        Label(copiedSummary ? "Copied" : "Copy Report", systemImage: copiedSummary ? "checkmark" : "doc.on.doc")
                    }

                    Button {
                        NativeAudioEngine.shared.stopSpeech()
                        NativeAudioEngine.shared.playClickSound()
                        dismiss()
                        store.openExamSimulator(languageId: attempt.languageId, level: attempt.level)
                    } label: {
                        Label("Retake \(attempt.level.rawValue)", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.celestialSky)

                    Button(role: .destructive) {
                        showDeleteConfirm = true
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 760, idealWidth: 880, minHeight: 620, idealHeight: 740)
        #endif
        .onDisappear {
            NativeAudioEngine.shared.stopSpeech()
        }
        .sheet(isPresented: $showAISettingsSheet) {
            AIProviderSheetView(store: store)
                .applyAppFontScale(store)
        }
        .sheet(isPresented: $showCertificateSheet) {
            LinguaVerveCertificateSheetView(store: store, attempt: attempt)
                .applyAppFontScale(store)
        }
        .confirmationDialog("Delete this exam record from history?", isPresented: $showDeleteConfirm) {
            Button("Delete Exam Record", role: .destructive) {
                NativeAudioEngine.shared.stopSpeech()
                store.deleteExamAttempt(id: attempt.id)
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    // MARK: - Hero Header

    private var heroHeaderCard: some View {
        let failedSkills = SkillType.allCases.filter { !(attempt.skills[$0.rawValue]?.passed ?? false) }
        return VStack(alignment: .leading, spacing: 10) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    heroTitleBlock
                    Spacer()
                    overallScoreBadge
                }
                VStack(alignment: .leading, spacing: 10) {
                    heroTitleBlock
                    overallScoreBadge
                }
            }

            FlowLayout(spacing: 8, lineSpacing: 6) {
                metaPill(icon: "calendar", text: Self.formattedTimestamp(attempt.timestamp))
                metaPill(icon: "timer", text: "Time: \(Self.formatClock(attempt.durationUsedSeconds))")
                metaPill(
                    icon: attempt.mode == "strict" ? "shield.lefthalf.filled" : "book.fill",
                    text: attempt.mode == "strict" ? "Strict Exam Mode" : "Practice Mode"
                )
                metaPill(icon: "rosette", text: attempt.alignedCertificate)
            }

            if attempt.passed {
                let certPreview = CertificateService.buildCertificate(
                    for: attempt,
                    learnerName: store.learnerState.learnerName,
                    passingScorePercent: matchedExamInfo?.exam.passingScorePercent ?? 60
                )
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.seal.fill")
                        .scaledFont(.title3, weight: .bold)
                        .foregroundStyle(BrandTheme.deepGold)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("\(certPreview.honorsTitle) · Credential \(certPreview.certificateId)")
                            .scaledFont(.caption2, weight: .bold, design: .monospaced)
                            .foregroundStyle(BrandTheme.deepGold)
                        Text(certPreview.encouragementHeadline)
                            .scaledFont(.subheadline, weight: .semibold)
                    }
                    Spacer()
                    Button {
                        NativeAudioEngine.shared.playSuccessChime()
                        showCertificateSheet = true
                    } label: {
                        Label("Open Diploma", systemImage: "rosette")
                    }
                    .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.deepGold))
                }
                .padding(12)
                .goldenGateSurface(cornerRadius: 11, tint: BrandTheme.champagneGold)
            } else if !failedSkills.isEmpty {
                let names = failedSkills.map(\.shortName).joined(separator: ", ")
                Text("Skills below pass mark: \(names). Review feedback & benchmarks below before retaking.")
                    .scaledFont(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(
            cornerRadius: GoldenGateMetrics.cardCornerRadius,
            tint: attempt.passed ? BrandTheme.emeraldMint : BrandTheme.deepGold
        )
    }

    private var heroTitleBlock: some View {
        VStack(alignment: .leading, spacing: 6) {
            FlowLayout(spacing: 6, lineSpacing: 5) {
                Text(attempt.passed ? "PASSED" : "NEEDS RETRY")
                    .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill((attempt.passed ? BrandTheme.emeraldMint : Color.orange).opacity(0.2)))
                    .foregroundStyle(attempt.passed ? BrandTheme.emeraldMint : .orange)

                Text(attempt.level.rawValue)
                    .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.18)))
                    .foregroundStyle(BrandTheme.celestialSky)

                Text(resolvedGradeLabel)
                    .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.indigo.opacity(0.14)))
                    .foregroundStyle(.indigo)
            }

            Text("\(LearningLanguage.from(attempt.languageId).flag) \(attempt.examTitle)")
                .scaledFont(.title2, weight: .bold)
        }
    }

    private var overallScoreBadge: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("\(attempt.overallScore)%")
                .scaledFont(size: 30, weight: .bold, design: .monospaced)
                .monospacedDigit()
                .foregroundStyle(attempt.passed ? BrandTheme.emeraldMint : .orange)
            Text("OVERALL SCORE")
                .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
    }

    private func metaPill(icon: String, text: String) -> some View {
        Label(text, systemImage: icon)
            .scaledFont(.caption2, design: .monospaced)
            .foregroundStyle(.secondary)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Capsule().fill(Color.primary.opacity(0.06)))
    }

    // MARK: - 4-Skill Scorecard Grid

    private var skillsScorecardSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("4-SKILL EXAMINER SCORECARD & RUBRIC")
                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 12)], spacing: 12) {
                ForEach(SkillType.allCases) { skill in
                    if let scoreObj = attempt.skills[skill.rawValue] {
                        skillCard(skill: skill, scoreObj: scoreObj)
                    }
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    private func skillCard(skill: SkillType, scoreObj: SkillExamScore) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Label(skill.displayName, systemImage: skill.systemImage)
                    .scaledFont(.caption, weight: .bold)
                Spacer()
                if scoreObj.aiGraded {
                    Text("AI")
                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.indigo.opacity(0.16)))
                        .foregroundStyle(.indigo)
                }
                Text(scoreObj.passed ? "PASS" : "FAIL")
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill((scoreObj.passed ? BrandTheme.emeraldMint : Color.red).opacity(0.14)))
                    .foregroundStyle(scoreObj.passed ? BrandTheme.emeraldMint : .red)
                Text("\(scoreObj.score)%")
                    .scaledFont(.headline, weight: .bold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(scoreObj.passed ? BrandTheme.emeraldMint : .red)
            }

            ProgressView(value: Double(scoreObj.score), total: 100.0)
                .tint(scoreObj.passed ? BrandTheme.emeraldMint : BrandTheme.deepGold)

            Text(scoreObj.feedback)
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if let rubric = scoreObj.rubric {
                GoldenGateSectionHairline()
                VStack(alignment: .leading, spacing: 5) {
                    rubricBarRow("Task Fulfillment", value: rubric.taskFulfillment)
                    rubricBarRow("Coherence & Cohesion", value: rubric.coherenceCohesion)
                    rubricBarRow("Lexical Range", value: rubric.lexicalRange)
                    rubricBarRow("Grammar Accuracy", value: rubric.grammaticalAccuracy)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius)
    }

    private func rubricBarRow(_ title: String, value: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title)
                    .scaledFont(size: 10, design: .monospaced)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(value)%")
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .monospacedDigit()
            }
            ProgressView(value: Double(value), total: 100.0)
                .tint(value >= 75 ? BrandTheme.emeraldMint : value >= 60 ? BrandTheme.celestialSky : .orange)
        }
    }

    // MARK: - AI 4-Skill Examiner Assessment Section

    private var aiAssessmentSection: some View {
        let resolved = currentAttempt.aiAssessment
            ?? ExamAssessmentService.buildOfflineAssessment(exam: matchedExamInfo?.exam, attempt: currentAttempt)
        return ExamAIAssessmentPanelView(
            store: store,
            attempt: currentAttempt,
            assessment: resolved,
            isAnalyzing: isAnalyzingAI,
            onRunAIAnalysis: {
                Task { await runRetroactiveAIAnalysis() }
            },
            onOpenAISettings: { showAISettingsSheet = true },
            onPracticeSkillInCoach: { sk in
                NativeAudioEngine.shared.stopSpeech()
                dismiss()
                store.openAICoach(
                    languageId: currentAttempt.languageId,
                    level: currentAttempt.level,
                    skill: sk,
                    seedPrompt: ExamAssessmentService.buildCoachSeedPrompt(attempt: currentAttempt, skill: sk)
                )
            }
        )
    }

    @MainActor
    private func runRetroactiveAIAnalysis() async {
        guard !isAnalyzingAI else { return }
        isAnalyzingAI = true
        let assessment = await ExamAssessmentService().assessFullExam(
            config: store.aiConfig,
            exam: matchedExamInfo?.exam,
            attempt: currentAttempt
        )
        if let updated = store.updateExamAttemptAssessment(attemptId: currentAttempt.id, assessment: assessment) {
            currentAttempt = updated
        } else {
            currentAttempt = ExamAttemptRecord(
                id: currentAttempt.id,
                timestamp: currentAttempt.timestamp,
                examId: currentAttempt.examId,
                examTitle: currentAttempt.examTitle,
                alignedCertificate: currentAttempt.alignedCertificate,
                languageId: currentAttempt.languageId,
                level: currentAttempt.level,
                mode: currentAttempt.mode,
                durationUsedSeconds: currentAttempt.durationUsedSeconds,
                overallScore: currentAttempt.overallScore,
                passed: currentAttempt.passed,
                officialGradeLabel: currentAttempt.officialGradeLabel,
                skills: currentAttempt.skills,
                writingSubmission: currentAttempt.writingSubmission,
                speakingTranscript: currentAttempt.speakingTranscript,
                questionReviews: currentAttempt.questionReviews,
                writingNotes: currentAttempt.writingNotes,
                speakingNotes: currentAttempt.speakingNotes,
                aiAssessment: assessment
            )
        }
        isAnalyzingAI = false
        NativeAudioEngine.shared.playSuccessChime()
    }

    // MARK: - Written & Spoken Submissions

    @ViewBuilder
    private var submissionsSection: some View {
        let writingText = attempt.writingSubmission?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let speakingText = attempt.speakingTranscript?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let wNotes = (attempt.writingNotes ?? []).filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
        let sNotes = (attempt.speakingNotes ?? []).filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

        if !writingText.isEmpty || !speakingText.isEmpty || !wNotes.isEmpty || !sNotes.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("YOUR SUBMISSIONS & EXAMINER NOTES")
                    .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(.secondary)

                if !writingText.isEmpty || !wNotes.isEmpty {
                    submissionCard(
                        title: "Writing Submission",
                        icon: "pencil.line",
                        tint: .orange,
                        content: writingText,
                        notes: wNotes,
                        speakable: false
                    )
                }

                if !speakingText.isEmpty || !sNotes.isEmpty {
                    submissionCard(
                        title: "Speaking Transcript",
                        icon: "mic.fill",
                        tint: BrandTheme.emeraldMint,
                        content: speakingText,
                        notes: sNotes,
                        speakable: !speakingText.isEmpty
                    )
                }
            }
            .padding(20)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
        }
    }

    private func submissionCard(
        title: String,
        icon: String,
        tint: Color,
        content: String,
        notes: [String],
        speakable: Bool
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label(title, systemImage: icon)
                    .scaledFont(.subheadline, weight: .bold)
                    .foregroundStyle(tint)
                Spacer()
                if speakable {
                    Button {
                        NativeAudioEngine.shared.speak(content, languageId: attempt.languageId)
                    } label: {
                        Label("Listen Back", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                }
            }

            if !content.isEmpty {
                Text(content)
                    .scaledFont(.subheadline)
                    .textSelection(.enabled)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: 10)
            }

            if !notes.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Examiner Action Notes")
                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                        .foregroundStyle(tint)
                    ForEach(Array(notes.enumerated()), id: \.offset) { _, note in
                        HStack(alignment: .top, spacing: 6) {
                            Text("•").scaledFont(.caption).foregroundStyle(tint)
                            Text(note).scaledFont(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.top, 2)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: tint)
    }

    // MARK: - Question-by-Question Review

    private var questionReviewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            let reviews = attempt.questionReviews ?? []
            let correctCount = reviews.filter(\.isCorrect).count

            ViewThatFits(in: .horizontal) {
                HStack {
                    questionReviewHeading(total: reviews.count, correct: correctCount)
                    Spacer()
                    if !reviews.isEmpty {
                        reviewFilterPicker
                    }
                }
                VStack(alignment: .leading, spacing: 10) {
                    questionReviewHeading(total: reviews.count, correct: correctCount)
                    if !reviews.isEmpty {
                        reviewFilterPicker
                    }
                }
            }

            if reviews.isEmpty {
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "info.circle.fill")
                        .foregroundStyle(BrandTheme.editorialBlue)
                        .padding(.top, 2)
                    Text("This attempt was recorded before per-question answer capture was enabled. Your 4-skill scores, rubric breakdown, and submissions are shown above, and all future exams will automatically record every Reading & Listening question here. Expand Reference Benchmarks below to inspect the exam's listening dialogues and model answers.")
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .goldenGateSurface(cornerRadius: 10, tint: BrandTheme.editorialBlue)
            } else if filteredReviews.isEmpty {
                Text("No items match this filter — great work!")
                    .scaledFont(.caption)
                    .foregroundStyle(BrandTheme.emeraldMint)
                    .padding(8)
            } else {
                ForEach(filteredReviews) { item in
                    questionReviewRow(item)
                }
            }
        }
        .padding(20)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    private func questionReviewHeading(total: Int, correct: Int) -> some View {
        Text(total > 0 ? "QUESTION-BY-QUESTION REVIEW (\(correct)/\(total) CORRECT)" : "QUESTION-BY-QUESTION REVIEW")
            .scaledFont(.caption, weight: .bold, design: .monospaced, monospacedDigit: true)
            .foregroundStyle(.secondary)
    }

    private var reviewFilterPicker: some View {
        GoldenGateSegmentedControl(
            items: ReviewFilterMode.allCases,
            selection: $reviewFilter
        ) { mode, selected in
            Text(mode.rawValue)
                .scaledFont(.caption, weight: selected ? .semibold : .medium)
        }
    }

    private func questionReviewRow(_ item: ExamQuestionReview) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top, spacing: 8) {
                Text(item.sectionTag)
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill((item.skill == "reading" ? BrandTheme.editorialBlue : Color.indigo).opacity(0.14)))
                    .foregroundStyle(item.skill == "reading" ? BrandTheme.editorialBlue : .indigo)

                Text(item.prompt)
                    .scaledFont(.subheadline, weight: .semibold)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer()

                Image(systemName: item.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .scaledFont(.subheadline)
                    .foregroundStyle(item.isCorrect ? BrandTheme.emeraldMint : .red)
            }

            if !item.isCorrect {
                Text("Your answer: \(item.chosenOption ?? "(No answer selected)")")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(.red)
            }

            Text("Correct answer: \(item.correctOption)")
                .scaledFont(.caption, weight: .semibold)
                .foregroundStyle(BrandTheme.emeraldMint)

            if !item.explanation.isEmpty {
                Text(item.explanation)
                    .scaledFont(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(
            cornerRadius: 10,
            tint: item.isCorrect ? BrandTheme.emeraldMint : .red
        )
    }

    // MARK: - Matched Exam Reference Benchmarks

    @ViewBuilder
    private var referenceBenchmarksSection: some View {
        if let info = matchedExamInfo {
            let exam = info.exam
            let listeningTracks = exam.listening.resolvedTracks
            let writingTasks = exam.writing.resolvedTasks
            let speakingParts = exam.speaking.resolvedParts

            GoldenGateEditorialDisclosure("Reference Benchmarks: Listening Transcripts & Model Answers") {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 6) {
                        Image(systemName: info.isExactMatch ? "checkmark.seal.fill" : "sparkles")
                            .foregroundStyle(info.isExactMatch ? BrandTheme.emeraldMint : BrandTheme.deepGold)
                        Text(
                            info.isExactMatch
                                ? "Exact exam edition matched (\(exam.title))."
                                : "Original AI exam edition was removed; showing official \(attempt.level.rawValue) benchmark reference."
                        )
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                    }

                    // Unlocked Listening Tracks
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Unlocked Listening Dialogues (\(listeningTracks.count) Tracks)")
                            .scaledFont(.caption, weight: .bold, design: .monospaced)
                            .foregroundStyle(.indigo)

                        ForEach(Array(listeningTracks.enumerated()), id: \.element.id) { idx, track in
                            listeningTrackBenchmarkCard(idx: idx, track: track, languageId: exam.languageId)
                        }
                    }

                    // Model Writing Answers
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Official Model Writing Benchmarks")
                            .scaledFont(.caption, weight: .bold, design: .monospaced)
                            .foregroundStyle(BrandTheme.deepGold)

                        ForEach(Array(writingTasks.enumerated()), id: \.element.id) { idx, task in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Task \(idx + 1) (\(task.weightPercent)%) · \(task.partLabel)")
                                    .scaledFont(.caption, weight: .bold)
                                Text(task.modelAnswer)
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .textSelection(.enabled)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .goldenGateSurface(cornerRadius: 10)
                        }
                    }

                    // Model Speaking Scripts
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Official Model Speaking Scripts")
                            .scaledFont(.caption, weight: .bold, design: .monospaced)
                            .foregroundStyle(BrandTheme.emeraldMint)

                        ForEach(Array(speakingParts.enumerated()), id: \.element.id) { idx, part in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("Part \(idx + 1) · \(part.partLabel)")
                                        .scaledFont(.caption, weight: .bold)
                                    Spacer()
                                    Button {
                                        NativeAudioEngine.shared.speak(part.modelResponseScript, languageId: exam.languageId)
                                    } label: {
                                        Label("Hear Model", systemImage: "speaker.wave.2.fill")
                                    }
                                    .buttonStyle(GoldenGateGlassPillButtonStyle())
                                }
                                Text(part.modelResponseScript)
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .textSelection(.enabled)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .goldenGateSurface(cornerRadius: 10)
                        }
                    }
                }
            }
            .padding(20)
            .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
        }
    }

    private func listeningTrackBenchmarkCard(idx: Int, track: ListeningExamTrack, languageId: String) -> some View {
        let turns = NativeAudioEngine.parseDialogueTurns(track.audioScript)
        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Track \(idx + 1) · \(accentLabel(track.accentCode, languageId: languageId)) — \(track.partLabel)")
                    .scaledFont(.caption, weight: .bold)
                Spacer()
                Button {
                    NativeAudioEngine.shared.speak(
                        track.audioScript,
                        languageId: languageId,
                        slow: false,
                        accentOverride: track.accentCode
                    )
                } label: {
                    Label("Replay", systemImage: "speaker.wave.2.fill")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())
            }

            if turns.isEmpty {
                Text(track.audioScript)
                    .scaledFont(.caption)
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(Array(turns.enumerated()), id: \.offset) { _, turn in
                        let isFirst = turn.speakerIndex % 2 == 0
                        VStack(alignment: .leading, spacing: 2) {
                            Text(turn.speaker)
                                .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                .foregroundStyle(isFirst ? BrandTheme.editorialBlue : .indigo)
                            Text(turn.text)
                                .scaledFont(.caption)
                                .foregroundStyle(.primary)
                        }
                        .padding(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(
                            cornerRadius: 8,
                            tint: isFirst ? BrandTheme.editorialBlue : .indigo
                        )
                    }
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: .indigo)
    }

    // MARK: - Formatting & Export Helpers

    private func accentLabel(_ code: String?, languageId: String) -> String {
        guard let code, !code.isEmpty else { return "🌐 Standard" }
        if let opt = NativeAudioEngine.accents(for: languageId).first(where: { $0.code == code }) {
            return "\(opt.flag) \(opt.label)"
        }
        return "🌐 \(code)"
    }

    private func buildPlainTextDossier() -> String {
        var lines: [String] = [
            "LinguaVerve Past Exam Report",
            "Exam: \(attempt.examTitle) (\(attempt.level.rawValue))",
            "Certificate: \(attempt.alignedCertificate)",
            "Date: \(Self.formattedTimestamp(attempt.timestamp))",
            "Mode: \(attempt.mode.uppercased()) | Duration: \(Self.formatClock(attempt.durationUsedSeconds))",
            "Result: \(attempt.overallScore)% (\(attempt.passed ? "PASSED" : "NEEDS RETRY")) — \(resolvedGradeLabel)",
            "",
            "--- 4-Skill Breakdown ---"
        ]
        for skill in SkillType.allCases {
            if let s = attempt.skills[skill.rawValue] {
                lines.append("\(skill.displayName): \(s.score)% [\(s.passed ? "PASS" : "FAIL")] — \(s.feedback)")
                if let r = s.rubric {
                    lines.append("  Rubric: Task \(r.taskFulfillment)% | Coherence \(r.coherenceCohesion)% | Lexical \(r.lexicalRange)% | Grammar \(r.grammaticalAccuracy)%")
                }
            }
        }
        if let ai = attempt.aiAssessment {
            lines.append("")
            lines.append("--- 4-Skill Examiner Assessment (\(ai.providerLabel)) ---")
            lines.append("Verdict: \(ai.readinessVerdict)")
            lines.append(ai.overallSummary)
            for sk in SkillType.allCases {
                if let insight = ai.insight(for: sk) {
                    lines.append("\(sk.displayName): \(insight.summary)")
                    for corr in insight.corrections {
                        lines.append("  Fix: \(corr.original.isEmpty ? "" : "\(corr.original) -> ")\(corr.corrected) (\(corr.explanation))")
                    }
                    for tip in insight.suggestions {
                        lines.append("  Tip: \(tip)")
                    }
                }
            }
        }
        if let writing = attempt.writingSubmission, !writing.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            lines.append("")
            lines.append("--- Writing Submission ---")
            lines.append(writing)
        }
        if let speaking = attempt.speakingTranscript, !speaking.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            lines.append("")
            lines.append("--- Speaking Transcript ---")
            lines.append(speaking)
        }
        if let reviews = attempt.questionReviews, !reviews.isEmpty {
            lines.append("")
            lines.append("--- Question Review ---")
            for r in reviews {
                let mark = r.isCorrect ? "✓" : "✗"
                lines.append("\(mark) [\(r.sectionTag)] \(r.prompt) | Yours: \(r.chosenOption ?? "(none)") | Correct: \(r.correctOption)")
            }
        }
        return lines.joined(separator: "\n")
    }

    public static func formatClock(_ secs: Int) -> String {
        let s = max(0, secs)
        return String(format: "%02d:%02d", s / 60, s % 60)
    }

    public static func formattedTimestamp(_ iso: String) -> String {
        let isoFmt = ISO8601DateFormatter()
        isoFmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date = isoFmt.date(from: iso) ?? ISO8601DateFormatter().date(from: iso)
        guard let date else { return iso }
        let display = DateFormatter()
        display.dateStyle = .medium
        display.timeStyle = .short
        return display.string(from: date)
    }
}
