import SwiftUI
import AVFoundation
import LinguaVerveCore

public struct VoiceStudioSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    @State private var draft: VoiceSettings
    @State private var accentLanguageTab: String
    @State private var previewingCode: String? = nil
    @State private var previewFeedback: (ok: Bool, message: String)? = nil

    public init(store: CurriculumStore) {
        self.store = store
        self._draft = State(initialValue: NativeAudioEngine.shared.voiceSettings)
        self._accentLanguageTab = State(initialValue: store.courseLanguageId == "german" ? "german" : "english")
    }

    private var accentsForTab: [AccentOption] {
        NativeAudioEngine.accents(for: accentLanguageTab)
    }

    private var selectedAccentCode: String {
        draft.accents[accentLanguageTab] ?? (accentLanguageTab == "german" ? "de-DE" : "en-GB")
    }

    private var selectedAccent: AccentOption? {
        NativeAudioEngine.accentOption(for: selectedAccentCode) ?? accentsForTab.first
    }

    private var neuralPresets: [NeuralVoicePreset] {
        switch draft.provider {
        case .openai: return NativeAudioEngine.openAINeuralVoices
        case .elevenlabs: return NativeAudioEngine.elevenLabsNeuralVoices
        case .localOpenAI: return NativeAudioEngine.localNeuralVoices
        case .system: return []
        }
    }

    public var body: some View {
        let installedHumanVoices = NativeAudioEngine.humanSystemVoices(for: selectedAccentCode)

        NavigationStack {
            Form {
                Section("1. Target Accents (English · German DACH)") {
                    Picker("Language", selection: $accentLanguageTab) {
                        Text("🇬🇧 English (6 Accents)").tag("english")
                        Text("🇩🇪 German DACH (3 Accents)").tag("german")
                    }
                    .pickerStyle(.segmented)

                    ForEach(accentsForTab) { acc in
                        let isSelected = selectedAccentCode == acc.code
                        HStack(spacing: 10) {
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                draft.accents[accentLanguageTab] = acc.code
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(isSelected ? BrandTheme.celestialSky : .secondary)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("\(acc.flag) \(acc.label)")
                                            .font(.subheadline.weight(isSelected ? .bold : .medium))
                                            .foregroundStyle(.primary)
                                        Text(acc.region)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .buttonStyle(.plain)

                            Spacer()

                            Button {
                                Task { await previewAccent(acc) }
                            } label: {
                                Label(
                                    previewingCode == acc.code ? "..." : "Test",
                                    systemImage: "play.fill"
                                )
                                .font(.caption.weight(.bold))
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                            .disabled(previewingCode == acc.code)
                        }
                    }
                }

                Section("2. Human Voice Model Engine") {
                    Picker("Voice Engine", selection: $draft.provider) {
                        ForEach(VoiceProviderType.allCases) { p in
                            Text(p.label).tag(p)
                        }
                    }
                    .onChange(of: draft.provider) { _, newProvider in
                        if !newProvider.defaultEndpoint.isEmpty {
                            draft.endpoint = newProvider.defaultEndpoint
                        }
                        draft.model = newProvider.defaultModel
                        if !newProvider.defaultVoice.isEmpty {
                            draft.neuralVoice = newProvider.defaultVoice
                        }
                        previewFeedback = nil
                    }

                    Text(draft.provider.setupHint)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    if draft.provider == .system {
                        let voiceBinding = Binding<String>(
                            get: { draft.preferredSystemVoices[selectedAccentCode] ?? "" },
                            set: { draft.preferredSystemVoices[selectedAccentCode] = $0 }
                        )
                        Picker("Installed Human Voice", selection: voiceBinding) {
                            Text("✨ Auto-Pick Best Siri / Neural Voice").tag("")
                            ForEach(installedHumanVoices, id: \.identifier) { voice in
                                Text("\(NativeAudioEngine.friendlyDisplayName(for: voice)) (\(voice.language))")
                                    .tag(voice.identifier)
                            }
                        }

                        Text("Legacy robotic/Eloquence voices are automatically hidden. For extra offline accents (Austrian, Swiss, British Enhanced/Siri), download voices in System Settings → Accessibility → Spoken Content → System Voice.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    } else {
                        TextField("TTS Endpoint URL", text: $draft.endpoint)
                            .font(.system(size: 13, design: .monospaced))
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                            #endif

                        TextField("Model", text: $draft.model)
                            .font(.system(size: 13, design: .monospaced))

                        if draft.provider.requiresAPIKey {
                            SecureField(
                                draft.provider == .openai
                                    ? "API Key (or reuse OpenAI key below)"
                                    : "ElevenLabs xi-api-key",
                                text: $draft.apiKey
                            )
                            if draft.provider == .openai {
                                Toggle("Reuse OpenAI key from AI Provider settings", isOn: $draft.reuseOpenAIKey)
                                    .font(.caption)
                            }
                        }

                        Picker("Human Voice Persona", selection: $draft.neuralVoice) {
                            ForEach(neuralPresets) { vp in
                                Text("\(vp.label) — \(vp.note)").tag(vp.id)
                            }
                        }

                        TextField("Custom Voice ID", text: $draft.neuralVoice)
                            .font(.system(size: 12.5, design: .monospaced))
                    }
                }

                Section("3. Speaking Style & Natural Pace") {
                    Picker("Expressive Style", selection: $draft.speakingStyle) {
                        ForEach(VoiceSpeakingStyle.allCases) { st in
                            Text(st.label).tag(st)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Speaking Pace")
                            Spacer()
                            Text(String(format: "%.2fx", draft.rateMultiplier))
                                .font(.caption.monospaced().bold())
                                .foregroundStyle(BrandTheme.celestialSky)
                        }
                        Slider(value: $draft.rateMultiplier, in: 0.75...1.25, step: 0.05)
                    }

                    if let feedback = previewFeedback {
                        Label(
                            feedback.message,
                            systemImage: feedback.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                        )
                        .font(.caption)
                        .foregroundStyle(feedback.ok ? BrandTheme.emeraldMint : .orange)
                    }

                    if let accent = selectedAccent {
                        Button {
                            Task { await previewAccent(accent) }
                        } label: {
                            Label(
                                previewingCode != nil ? "Synthesizing..." : "Test \(accent.flag) \(accent.label) Voice",
                                systemImage: "waveform"
                            )
                        }
                        .disabled(previewingCode != nil)
                    }
                }
            }
            .formStyle(.grouped)
            .navigationTitle("Voice & Accent Studio")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save Voice") {
                        NativeAudioEngine.shared.updateVoiceSettings(draft)
                        NativeAudioEngine.shared.playSuccessChime()
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 560, minHeight: 560)
        #endif
    }

    private func previewAccent(_ acc: AccentOption) async {
        previewingCode = acc.code
        previewFeedback = nil
        defer { previewingCode = nil }
        let res = await NativeAudioEngine.shared.previewVoice(
            text: acc.sampleText,
            accentCode: acc.code,
            overrideSettings: draft
        )
        previewFeedback = (res.ok, res.summary)
    }
}
