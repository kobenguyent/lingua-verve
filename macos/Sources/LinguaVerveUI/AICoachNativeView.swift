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

        VStack(spacing: 0) {
            // Controls Header
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("4-Skill Mastery Studio")
                            .scaledFont(.footnote, weight: .semibold)
                            .foregroundStyle(BrandTheme.emeraldMint)
                        Text("\(langName) \(store.aiCoachLevel.rawValue) · \(store.aiCoachSkill.displayName)")
                            .scaledFont(.title3, weight: .bold, design: .serif)
                    }
                    Spacer()
                    Button {
                        showAISettingsSheet = true
                    } label: {
                        Label(
                            effectiveConfig.isReady ? effectiveConfig.model : "Setup AI",
                            systemImage: "cpu"
                        )
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: effectiveConfig.isReady, accent: BrandTheme.emeraldMint))
                }

                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 8) {
                        Picker("Lang", selection: $store.courseLanguageId) {
                            ForEach(LearningLanguage.allCases) { item in
                                Text("\(item.flag) \(item.shortCode)").tag(item.rawValue)
                            }
                        }
                        .pickerStyle(.segmented)
                        .frame(maxWidth: AppTypography.scaledControlWidth(275, scale: fontScale, maxCap: 350))

                        Picker("Level", selection: $store.aiCoachLevel) {
                            ForEach(CEFRLevel.allCases) { lvl in
                                Text(lvl.rawValue).tag(lvl)
                            }
                        }
                        .pickerStyle(.menu)

                        Spacer()

                        Toggle("Auto-Speak", isOn: $autoSpeak)
                            .toggleStyle(.switch)
                            .scaledFont(.caption)
                            .fixedSize()
                    }
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Picker("Lang", selection: $store.courseLanguageId) {
                                ForEach(LearningLanguage.allCases) { item in
                                    Text("\(item.flag) \(item.shortCode)").tag(item.rawValue)
                                }
                            }
                            .pickerStyle(.segmented)
                            .frame(maxWidth: AppTypography.scaledControlWidth(275, scale: fontScale, maxCap: 350))

                            Picker("Level", selection: $store.aiCoachLevel) {
                                ForEach(CEFRLevel.allCases) { lvl in
                                    Text(lvl.rawValue).tag(lvl)
                                }
                            }
                            .pickerStyle(.menu)
                        }
                        Toggle("Auto-Speak", isOn: $autoSpeak)
                            .toggleStyle(.switch)
                            .scaledFont(.caption)
                            .fixedSize()
                    }
                }

                Picker("Skill", selection: $store.aiCoachSkill) {
                    ForEach(SkillType.allCases) { sk in
                        Text(sk.shortName).tag(sk)
                    }
                }
                .pickerStyle(.segmented)
                .onChange(of: store.aiCoachSkill) { _, _ in
                    NativeAudioEngine.shared.stopSpeech()
                    messages = []
                    offlineEval = nil
                    errorMessage = nil
                }

                // Quick Starter Prompts
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(starterPrompts(langName: langName, level: store.aiCoachLevel, skill: store.aiCoachSkill), id: \.self) { prompt in
                            Button(prompt) {
                                Task { await sendMessage(prompt) }
                            }
                            .scaledFont(.caption)
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }
                    }
                }
            }
            .padding(14)
            .background(.bar)

            Divider()

            // Chat Feed
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    if messages.isEmpty && offlineEval == nil {
                        VStack(spacing: 10) {
                            Image(systemName: "sparkles")
                                .scaledFont(.largeTitle)
                                .foregroundStyle(BrandTheme.celestialSky)
                            Text(effectiveConfig.isReady
                                 ? "Connected to \(effectiveConfig.provider.label) (\(effectiveConfig.model))"
                                 : "Connect Local (Ollama/LM Studio) or Cloud AI, or paste Writing/Speaking below for offline CEFR rubric grading.")
                                .scaledFont(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(32)
                        .frame(maxWidth: .infinity)
                    }

                    ForEach(messages) { msg in
                        let parsed = msg.role == "assistant"
                            ? AIClientService.parseCoachReply(msg.content, skill: store.aiCoachSkill)
                            : nil
                        HStack {
                            if msg.role == "user" { Spacer(minLength: 40) }
                            VStack(alignment: .leading, spacing: 8) {
                                if let parsed {
                                    if let speaker = parsed.speakerLabel, !speaker.isEmpty {
                                        Text("\(speaker) · \(langName)")
                                            .scaledFont(.caption2, weight: .semibold)
                                            .foregroundStyle(.secondary)
                                    }
                                    if !parsed.displayBody.isEmpty {
                                        Text(parsed.displayBody)
                                            .scaledFont(.subheadline)
                                            .textSelection(.enabled)
                                    }
                                    if !parsed.spokenText.isEmpty {
                                        HStack(spacing: 6) {
                                            Button {
                                                NativeAudioEngine.shared.speak(
                                                    String(parsed.spokenText.prefix(1200)),
                                                    languageId: lang
                                                )
                                            } label: {
                                                Label(
                                                    parsed.audioScript != nil ? "Listen Script (\(langName))" : "Listen (\(langName))",
                                                    systemImage: "speaker.wave.2.fill"
                                                )
                                                .scaledFont(.caption2, weight: .semibold)
                                            }
                                            .buttonStyle(.bordered)
                                            .controlSize(.mini)

                                            Button {
                                                NativeAudioEngine.shared.speak(
                                                    String(parsed.spokenText.prefix(1200)),
                                                    languageId: lang,
                                                    slow: true
                                                )
                                            } label: {
                                                Label("0.8x", systemImage: "tortoise.fill")
                                                    .scaledFont(.caption2, weight: .semibold)
                                            }
                                            .buttonStyle(.bordered)
                                            .controlSize(.mini)

                                            Button {
                                                NativeAudioEngine.shared.stopSpeech()
                                            } label: {
                                                Image(systemName: "stop.fill")
                                                    .scaledFont(.caption2)
                                            }
                                            .buttonStyle(.bordered)
                                            .controlSize(.mini)
                                            .help("Stop Audio")
                                        }
                                    }
                                    if let note = parsed.coachNote, !note.isEmpty {
                                        VStack(alignment: .leading, spacing: 4) {
                                            HStack(spacing: 5) {
                                                Image(systemName: "lightbulb.fill")
                                                    .scaledFont(.caption2)
                                                    .foregroundStyle(.orange)
                                                Text("Coach Note")
                                                    .scaledFont(.caption2, weight: .bold)
                                                    .foregroundStyle(.orange)
                                                Spacer()
                                                Text("Written tip · skipped in audio")
                                                    .scaledFont(.caption2)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Text(note)
                                                .scaledFont(.caption)
                                                .foregroundStyle(.secondary)
                                                .textSelection(.enabled)
                                        }
                                        .padding(9)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(
                                            RoundedRectangle(cornerRadius: 8)
                                                .fill(Color.orange.opacity(0.09))
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 8)
                                                .strokeBorder(Color.orange.opacity(0.24), lineWidth: 1)
                                        )
                                    }
                                } else {
                                    Text(msg.content)
                                        .scaledFont(.subheadline)
                                        .textSelection(.enabled)
                                }
                            }
                            .padding(12)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(msg.role == "user" ? BrandTheme.celestialSky.opacity(0.22) : Color.primary.opacity(0.06))
                            )
                            if msg.role != "user" { Spacer(minLength: 40) }
                        }
                    }

                    if let eval = offlineEval {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("\(eval.providerLabel) · Est. \(eval.cefrEstimate.rawValue)")
                                    .scaledFont(.caption, weight: .bold)
                                Spacer()
                                Text("\(eval.score)/100")
                                    .scaledFont(.headline, design: .monospaced)
                                    .foregroundStyle(BrandTheme.celestialSky)
                            }
                            Text(eval.examinerSummary).scaledFont(.caption)
                            ForEach(eval.strengths, id: \.self) { s in
                                Text("✓ \(s)").scaledFont(.caption).foregroundStyle(BrandTheme.emeraldMint)
                            }
                            ForEach(eval.corrections, id: \.self) { c in
                                Text("• \(c)").scaledFont(.caption).foregroundStyle(.orange)
                            }
                        }
                        .padding(14)
                        .background(RoundedRectangle(cornerRadius: 12).fill(BrandTheme.celestialSky.opacity(0.10)))
                    }

                    if isLoading {
                        ProgressView("AI Coach thinking...")
                            .scaledFont(.caption)
                    }

                    if let err = errorMessage {
                        Label(err, systemImage: "exclamationmark.triangle.fill")
                            .scaledFont(.caption)
                            .foregroundStyle(.red)
                    }
                }
                .padding(16)
            }

            Divider()

            // Composer Bar with Mic Support
            HStack(spacing: 8) {
                Button {
                    if speechRecognizer.isRecording {
                        speechRecognizer.stop()
                    } else {
                        speechRecognizer.start(languageId: lang, existingText: inputText)
                    }
                } label: {
                    Image(systemName: speechRecognizer.isRecording ? "mic.slash.fill" : "mic.fill")
                }
                .buttonStyle(.bordered)
                .tint(speechRecognizer.isRecording ? .red : BrandTheme.emeraldMint)

                TextField("Ask AI Coach or paste \(langName) \(store.aiCoachLevel.rawValue) text...", text: $inputText, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)

                Button {
                    Task { await sendMessage(inputText) }
                } label: {
                    Image(systemName: "paperplane.fill")
                }
                .buttonStyle(.borderedProminent)
                .disabled(isLoading || inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(12)
            .background(.bar)
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

        if !store.aiConfig.isReady {
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
                errorMessage = "Tap 'Setup AI' above to connect Local (Ollama / LM Studio) or Cloud AI for live Reading & Listening labs."
            }
            return
        }

        let userMsg = AIChatMessage(role: "user", content: prompt)
        messages.append(userMsg)
        inputText = ""
        isLoading = true
        defer { isLoading = false }

        let sysPrompt = AIClientService.buildCoachSystemPrompt(
            languageId: lang,
            level: store.aiCoachLevel,
            skill: store.aiCoachSkill
        )

        let effectiveConfig = store.aiConfig.resolved(for: lang)
        do {
            let reply = try await AIClientService().chat(
                config: effectiveConfig,
                messages: [AIChatMessage(role: "system", content: sysPrompt)] + messages.suffix(10)
            )
            messages.append(AIChatMessage(role: "assistant", content: reply))
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
