import SwiftUI
import LinguaVerveCore

public struct AICoachNativeView: View {
    @Bindable var store: CurriculumStore
    @Binding var showAISettingsSheet: Bool
    @Environment(\.appFontScale) private var fontScale

    @State private var messages: [AIChatMessage] = []
    @State private var inputText: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var autoSpeak: Bool = true
    @State private var offlineEval: AIEvaluationResult?
    @State private var speechRecognizer = NativeSpeechRecognizer()

    public init(store: CurriculumStore, showAISettingsSheet: Binding<Bool>) {
        self.store = store
        self._showAISettingsSheet = showAISettingsSheet
    }

    public var body: some View {
        let langEnum = LearningLanguage.from(store.courseLanguageId)
        let lang = langEnum.rawValue
        let langName = langEnum.name
        let effectiveConfig = store.aiConfig.resolved(for: lang)

        ZStack {
            GoldenGateEditorialBackdrop()

            VStack(spacing: 0) {
                headerControls(langName: langName, effectiveConfig: effectiveConfig)

                GoldenGateSectionHairline()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if messages.isEmpty && offlineEval == nil {
                            emptyWelcomeCard(langName: langName, effectiveConfig: effectiveConfig)
                        }

                        ForEach(messages) { msg in
                            messageRow(msg, languageId: lang, langName: langName)
                        }

                        if let eval = offlineEval {
                            offlineEvaluationCard(eval)
                        }

                        if isLoading {
                            HStack(spacing: 10) {
                                ProgressView().controlSize(.small)
                                Text("AI Coach is composing…")
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                            .goldenGateSurface(cornerRadius: 12)
                        }

                        if let err = errorMessage {
                            Label(err, systemImage: "exclamationmark.triangle.fill")
                                .scaledFont(.footnote)
                                .foregroundStyle(.red)
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .goldenGateSurface(cornerRadius: 12, tint: .red)
                        }
                    }
                    .padding(.horizontal, 28)
                    .padding(.vertical, 20)
                    .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                    .frame(maxWidth: .infinity)
                }

                GoldenGateSectionHairline()

                composerBar(languageId: lang, langName: langName)
            }
        }
        .onAppear {
            if !store.aiCoachSeedPrompt.isEmpty {
                inputText = store.aiCoachSeedPrompt
                store.aiCoachSeedPrompt = ""
            }
        }
        .onChange(of: speechRecognizer.transcript) { _, newVal in
            if !newVal.isEmpty {
                inputText = newVal
            }
        }
        .onDisappear {
            speechRecognizer.stop()
            NativeAudioEngine.shared.stopSpeech()
        }
    }

    // MARK: - Top Controls Header

    private func headerControls(langName: String, effectiveConfig: AIProviderConfig) -> some View {
        let langBinding = Binding<LearningLanguage>(
            get: { LearningLanguage.from(store.courseLanguageId) },
            set: { store.courseLanguageId = $0.rawValue }
        )
        let levelOptions = CEFRLevel.allCases.map { lvl in
            GoldenGateDropdownOption(value: lvl, title: "Level \(lvl.rawValue)")
        }

        return VStack(alignment: .leading, spacing: 14) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .center, spacing: 12) {
                    coachTitleBlock(langName: langName)
                    Spacer(minLength: 12)
                    coachHeaderActions(effectiveConfig: effectiveConfig)
                }
                VStack(alignment: .leading, spacing: 10) {
                    coachTitleBlock(langName: langName)
                    coachHeaderActions(effectiveConfig: effectiveConfig)
                }
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 12) {
                    GoldenGateSegmentedControl(
                        items: SkillType.allCases,
                        selection: $store.aiCoachSkill,
                        allowHorizontalScroll: false
                    ) { skill, selected in
                        Text(skill.shortName)
                            .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                    }

                    Spacer(minLength: 12)

                    GoldenGateDropdownMenu(
                        title: "CEFR Level",
                        leadingIcon: "chart.bar.fill",
                        options: levelOptions,
                        selection: $store.aiCoachLevel,
                        accent: BrandTheme.cefrColor(for: store.aiCoachLevel.rawValue)
                    )

                    GoldenGateSegmentedControl(
                        items: LearningLanguage.allCases,
                        selection: langBinding,
                        allowHorizontalScroll: false
                    ) { option, selected in
                        Text("\(option.flag) \(option.shortCode)")
                            .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    GoldenGateSegmentedControl(
                        items: SkillType.allCases,
                        selection: $store.aiCoachSkill,
                        allowHorizontalScroll: true
                    ) { skill, selected in
                        Text(skill.shortName)
                            .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                    }

                    FlowLayout(spacing: 10, lineSpacing: 8) {
                        GoldenGateSegmentedControl(
                            items: LearningLanguage.allCases,
                            selection: langBinding,
                            allowHorizontalScroll: true
                        ) { option, selected in
                            Text("\(option.flag) \(option.shortCode)")
                                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                        }

                        GoldenGateDropdownMenu(
                            title: "CEFR Level",
                            leadingIcon: "chart.bar.fill",
                            options: levelOptions,
                            selection: $store.aiCoachLevel,
                            accent: BrandTheme.cefrColor(for: store.aiCoachLevel.rawValue)
                        )
                    }
                }
            }
            .onChange(of: store.aiCoachSkill) { _, _ in
                NativeAudioEngine.shared.stopSpeech()
                withAnimation(GoldenGateMetrics.contentFade) {
                    messages = []
                    offlineEval = nil
                    errorMessage = nil
                }
            }
        }
        .padding(.horizontal, 28)
        .padding(.vertical, 16)
        .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
        .frame(maxWidth: .infinity)
    }

    private func coachTitleBlock(langName: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("AI 4-Skill Coach")
                .scaledFont(.footnote, weight: .semibold)
                .foregroundStyle(BrandTheme.emeraldMint)
            Text("\(langName) \(store.aiCoachLevel.rawValue) · \(store.aiCoachSkill.displayName)")
                .scaledFont(.title2, weight: .bold, design: .serif)
        }
    }

    private func coachHeaderActions(effectiveConfig: AIProviderConfig) -> some View {
        FlowLayout(spacing: 8, lineSpacing: 8) {
            Button {
                NativeAudioEngine.shared.playClickSound()
                withAnimation(GoldenGateMetrics.snappySpring) {
                    autoSpeak.toggle()
                }
            } label: {
                Label("Auto-Speak", systemImage: autoSpeak ? "speaker.wave.2.fill" : "speaker.slash")
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: autoSpeak, accent: BrandTheme.emeraldMint))

            if !messages.isEmpty || offlineEval != nil {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    withAnimation(GoldenGateMetrics.panelAnimation) {
                        messages = []
                        offlineEval = nil
                        errorMessage = nil
                    }
                } label: {
                    Label("Clear", systemImage: "trash")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())
            }

            Button {
                NativeAudioEngine.shared.playClickSound()
                showAISettingsSheet = true
            } label: {
                Label(
                    effectiveConfig.isReady ? ExamSimulatorNativeView.examinerStatusLabel(for: effectiveConfig) : "Connect AI",
                    systemImage: "cpu"
                )
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: effectiveConfig.isReady, accent: BrandTheme.emeraldMint))
        }
    }

    // MARK: - Chat Feed Subviews

    private func emptyWelcomeCard(langName: String, effectiveConfig: AIProviderConfig) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(BrandTheme.editorialBlue.opacity(0.13))
                    .frame(width: 30, height: 30)
                    .overlay {
                        Image(systemName: store.aiCoachSkill.systemImage)
                            .scaledFont(.caption, weight: .semibold)
                            .foregroundStyle(BrandTheme.editorialBlue)
                    }

                VStack(alignment: .leading, spacing: 2) {
                    Text("\(store.aiCoachSkill.displayName) Studio")
                        .scaledFont(.headline, weight: .bold, design: .serif)
                    Text(
                        effectiveConfig.isReady
                            ? "Active model: \(ExamSimulatorNativeView.examinerStatusLabel(for: effectiveConfig))"
                            : "Connect an AI provider for live sessions, or paste Writing/Speaking below for offline CEFR rubric grading."
                    )
                    .scaledFont(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                }
            }

            GoldenGateSectionHairline()

            VStack(alignment: .leading, spacing: 8) {
                Text("Suggested Prompts")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(.secondary)

                FlowLayout(spacing: 8, lineSpacing: 8) {
                    ForEach(starterPrompts(langName: langName, level: store.aiCoachLevel, skill: store.aiCoachSkill), id: \.self) { prompt in
                        Button {
                            Task { await sendMessage(prompt) }
                        } label: {
                            Label(prompt, systemImage: "sparkles")
                                .multilineTextAlignment(.leading)
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                    }
                }
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    private func messageRow(_ msg: AIChatMessage, languageId: String, langName: String) -> some View {
        let isUser = msg.role == "user"
        let parsed = !isUser
            ? AIClientService.parseCoachReply(msg.content, skill: store.aiCoachSkill)
            : nil

        return HStack {
            if isUser { Spacer(minLength: 48) }

            VStack(alignment: .leading, spacing: 10) {
                if let parsed {
                    if let speaker = parsed.speakerLabel, !speaker.isEmpty {
                        Text("\(speaker) · \(langName)")
                            .scaledFont(.caption2, weight: .semibold)
                            .foregroundStyle(.secondary)
                    }

                    if !parsed.displayBody.isEmpty {
                        Text(parsed.displayBody)
                            .scaledFont(.body)
                            .lineSpacing(4)
                            .textSelection(.enabled)
                    }

                    if !parsed.spokenText.isEmpty {
                        FlowLayout(spacing: 8, lineSpacing: 6) {
                            Button {
                                NativeAudioEngine.shared.speak(
                                    String(parsed.spokenText.prefix(1200)),
                                    languageId: languageId
                                )
                            } label: {
                                Label(
                                    parsed.audioScript != nil ? "Listen Script (\(langName))" : "Listen (\(langName))",
                                    systemImage: "speaker.wave.2.fill"
                                )
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle())

                            Button {
                                NativeAudioEngine.shared.speak(
                                    String(parsed.spokenText.prefix(1200)),
                                    languageId: languageId,
                                    slow: true
                                )
                            } label: {
                                Label("0.8x", systemImage: "tortoise.fill")
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle())

                            Button {
                                NativeAudioEngine.shared.stopSpeech()
                            } label: {
                                Image(systemName: "stop.fill")
                            }
                            .buttonStyle(GoldenGateGlassPillButtonStyle())
                            .help("Stop Audio")
                        }
                    }

                    if let note = parsed.coachNote, !note.isEmpty {
                        VStack(alignment: .leading, spacing: 5) {
                            HStack(spacing: 6) {
                                Image(systemName: "lightbulb.fill")
                                    .scaledFont(.caption2)
                                    .foregroundStyle(BrandTheme.deepGold)
                                Text("Coach Note")
                                    .scaledFont(.caption2, weight: .bold)
                                    .foregroundStyle(BrandTheme.deepGold)
                                Spacer()
                                Text("Written tip · skipped in audio")
                                    .scaledFont(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            Text(note)
                                .scaledFont(.footnote)
                                .foregroundStyle(.secondary)
                                .textSelection(.enabled)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: 10, tint: BrandTheme.champagneGold)
                    }
                } else {
                    Text(msg.content)
                        .scaledFont(.body)
                        .lineSpacing(4)
                        .textSelection(.enabled)
                }
            }
            .padding(16)
            .goldenGateSurface(
                cornerRadius: 16,
                tint: isUser ? BrandTheme.editorialBlue : nil
            )

            if !isUser { Spacer(minLength: 48) }
        }
    }

    private func offlineEvaluationCard(_ eval: AIEvaluationResult) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("\(eval.providerLabel) · Est. \(eval.cefrEstimate.rawValue)")
                    .scaledFont(.footnote, weight: .semibold)
                    .foregroundStyle(BrandTheme.editorialBlue)
                Spacer()
                Text("\(eval.score)/100")
                    .scaledFont(.title3, weight: .bold, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(BrandTheme.editorialBlue)
            }

            Text(eval.examinerSummary)
                .scaledFont(.subheadline)
                .lineSpacing(3)

            if !eval.strengths.isEmpty {
                GoldenGateSectionHairline()
                ForEach(eval.strengths, id: \.self) { s in
                    Label(s, systemImage: "checkmark.circle.fill")
                        .scaledFont(.footnote)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }

            if !eval.corrections.isEmpty {
                ForEach(eval.corrections, id: \.self) { c in
                    Label(c, systemImage: "arrow.up.right.circle")
                        .scaledFont(.footnote)
                        .foregroundStyle(BrandTheme.deepGold)
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
    }

    // MARK: - Composer Bar

    private func composerBar(languageId: String, langName: String) -> some View {
        HStack(alignment: .bottom, spacing: 10) {
            Button {
                if speechRecognizer.isRecording {
                    speechRecognizer.stop()
                } else {
                    speechRecognizer.start(languageId: languageId, existingText: inputText)
                }
            } label: {
                Image(systemName: speechRecognizer.isRecording ? "mic.slash.fill" : "mic.fill")
                    .frame(width: 18, height: 18)
            }
            .buttonStyle(
                GoldenGateGlassPillButtonStyle(
                    isSelected: speechRecognizer.isRecording,
                    accent: speechRecognizer.isRecording ? .red : BrandTheme.emeraldMint
                )
            )

            TextField(
                "Ask AI Coach or paste \(langName) \(store.aiCoachLevel.rawValue) text…",
                text: $inputText,
                axis: .vertical
            )
            .textFieldStyle(.plain)
            .scaledFont(.body)
            .lineLimit(1...4)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .goldenGateSurface(cornerRadius: 14)

            Button {
                Task { await sendMessage(inputText) }
            } label: {
                Image(systemName: "arrow.up")
                    .frame(width: 18, height: 18)
            }
            .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue, cornerRadius: 12))
            .disabled(isLoading || inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(.horizontal, 28)
        .padding(.vertical, 14)
        .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Coach Actions

    private func starterPrompts(langName: String, level: CEFRLevel, skill: SkillType) -> [String] {
        switch skill {
        case .reading:
            return ["Generate a \(level.rawValue) \(langName) exam reading passage + 3 Qs", "Explain tricky \(level.rawValue) \(langName) reading grammar"]
        case .listening:
            return ["Generate a \(level.rawValue) \(langName) [AUDIO SCRIPT] dialogue + quiz", "Create a hearing minimal-pair drill for \(langName)"]
        case .writing:
            return ["Give me a \(level.rawValue) \(langName) certification essay prompt", "Grade my text against \(level.rawValue) rubrics"]
        case .speaking:
            return ["Start a \(level.rawValue) \(langName) speaking exam roleplay", "Give me a \(level.rawValue) speaking cue card"]
        }
    }

    @MainActor
    private func sendMessage(_ rawText: String) async {
        let prompt = rawText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !prompt.isEmpty, !isLoading else { return }

        let lang = LearningLanguage.normalize(store.courseLanguageId)
        errorMessage = nil
        offlineEval = nil
        NativeAudioEngine.shared.playClickSound()

        let effectiveConfig = store.aiConfig.resolved(for: lang)
        if !effectiveConfig.isReady {
            if store.aiCoachSkill == .writing || store.aiCoachSkill == .speaking {
                let eval = AIClientService.evaluateOffline(
                    text: prompt,
                    languageId: lang,
                    level: store.aiCoachLevel,
                    skill: store.aiCoachSkill,
                    minWords: 20,
                    expectedKeywords: []
                )
                offlineEval = eval
                store.recordAISession(
                    AISessionRecord(
                        languageId: lang,
                        level: store.aiCoachLevel,
                        skill: store.aiCoachSkill,
                        provider: eval.providerLabel,
                        summary: "Offline rubric check (\(eval.score)/100)",
                        score: eval.score
                    )
                )
            } else {
                errorMessage = "Select 'Connect AI' above for live Reading & Listening labs."
            }
            return
        }

        let userMsg = AIChatMessage(role: "user", content: prompt)
        withAnimation(GoldenGateMetrics.snappySpring) {
            messages.append(userMsg)
        }
        inputText = ""
        isLoading = true
        defer { isLoading = false }

        let sysPrompt = AIClientService.buildCoachSystemPrompt(
            languageId: lang,
            level: store.aiCoachLevel,
            skill: store.aiCoachSkill
        )

        do {
            let reply = try await AIClientService().chat(
                config: effectiveConfig,
                messages: [AIChatMessage(role: "system", content: sysPrompt)] + messages.suffix(10)
            )
            withAnimation(GoldenGateMetrics.snappySpring) {
                messages.append(AIChatMessage(role: "assistant", content: reply))
            }
            store.recordAISession(
                AISessionRecord(
                    languageId: lang,
                    level: store.aiCoachLevel,
                    skill: store.aiCoachSkill,
                    provider: "\(effectiveConfig.provider.label) (\(effectiveConfig.model))",
                    summary: String(prompt.prefix(70))
                )
            )

            if autoSpeak && (store.aiCoachSkill == .listening || store.aiCoachSkill == .speaking) {
                let parsed = AIClientService.parseCoachReply(reply, skill: store.aiCoachSkill)
                if !parsed.spokenText.isEmpty {
                    NativeAudioEngine.shared.speak(String(parsed.spokenText.prefix(1200)), languageId: lang)
                }
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
