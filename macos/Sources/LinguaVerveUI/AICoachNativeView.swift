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
        let lang = store.courseLanguageId == "german" ? "german" : "english"
        let langName = lang == "german" ? "German" : "English"

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
                            store.aiConfig.isReady ? store.aiConfig.model : "Setup AI",
                            systemImage: "cpu"
                        )
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: store.aiConfig.isReady, accent: BrandTheme.emeraldMint))
                }

                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 8) {
                        Picker("Lang", selection: $store.courseLanguageId) {
                            Text("🇬🇧 EN").tag("english")
                            Text("🇩🇪 DE").tag("german")
                        }
                        .pickerStyle(.segmented)
                        .frame(maxWidth: AppTypography.scaledControlWidth(160, scale: fontScale, maxCap: 220))

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
                                Text("🇬🇧 EN").tag("english")
                                Text("🇩🇪 DE").tag("german")
                            }
                            .pickerStyle(.segmented)
                            .frame(maxWidth: AppTypography.scaledControlWidth(160, scale: fontScale, maxCap: 220))

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
                            Text(store.aiConfig.isReady
                                 ? "Connected to \(store.aiConfig.provider.label) (\(store.aiConfig.model))"
                                 : "Connect Local (Ollama/LM Studio) or Cloud AI, or paste Writing/Speaking below for offline CEFR rubric grading.")
                                .scaledFont(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(32)
                        .frame(maxWidth: .infinity)
                    }

                    ForEach(messages) { msg in
                        HStack {
                            if msg.role == "user" { Spacer(minLength: 40) }
                            VStack(alignment: .leading, spacing: 6) {
                                Text(msg.content)
                                    .scaledFont(.subheadline)
                                    .textSelection(.enabled)
                                if msg.role == "assistant" {
                                    Button {
                                        NativeAudioEngine.shared.speak(String(msg.content.prefix(450)), languageId: lang)
                                    } label: {
                                        Label("Listen", systemImage: "speaker.wave.2.fill")
                                            .scaledFont(.caption2, weight: .semibold)
                                    }
                                    .buttonStyle(.bordered)
                                    .controlSize(.mini)
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

        let lang = store.courseLanguageId == "german" ? "german" : "english"
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

        do {
            let reply = try await AIClientService().chat(
                config: store.aiConfig,
                messages: [AIChatMessage(role: "system", content: sysPrompt)] + messages.suffix(10)
            )
            messages.append(AIChatMessage(role: "assistant", content: reply))
            store.recordAISession(
                AISessionRecord(
                    languageId: lang,
                    level: store.aiCoachLevel,
                    skill: store.aiCoachSkill,
                    provider: "\(store.aiConfig.provider.label) (\(store.aiConfig.model))",
                    summary: String(prompt.prefix(70))
                )
            )

            if autoSpeak && (store.aiCoachSkill == .listening || store.aiCoachSkill == .speaking) {
                let speakable = reply.components(separatedBy: "[COACH NOTE]").first ?? reply
                NativeAudioEngine.shared.speak(String(speakable.prefix(420)), languageId: lang)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
