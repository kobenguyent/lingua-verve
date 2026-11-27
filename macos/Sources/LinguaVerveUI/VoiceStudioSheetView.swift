import SwiftUI
import AVFoundation
import LinguaVerveCore
#if os(macOS)
import AppKit
#endif

public struct VoiceStudioSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    @State private var draft: VoiceSettings
    @State private var accentLanguageTab: String
    @State private var previewingCode: String? = nil
    @State private var previewFeedback: (ok: Bool, message: String)? = nil
    @State private var voiceRefreshNonce: Int = 0
    @State private var localHealthFeedback: (ok: Bool, message: String)? = nil
    @State private var isTestingLocalServer: Bool = false
    @State private var cacheStats: (fileCount: Int, totalBytes: Int64) = (0, 0)

    public init(store: CurriculumStore) {
        self.store = store
        self._draft = State(initialValue: NativeAudioEngine.shared.voiceSettings)
        self._accentLanguageTab = State(initialValue: store.courseLanguageId == "german" ? "german" : "english")
        self._cacheStats = State(initialValue: NativeAudioEngine.shared.audioCacheStats())
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
        case .gemini: return NativeAudioEngine.geminiNeuralVoices
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
                                            .scaledFont(.subheadline, weight: isSelected ? .bold : .medium)
                                            .foregroundStyle(.primary)
                                        Text(acc.region)
                                            .scaledFont(.caption)
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
                                .scaledFont(.caption, weight: .bold)
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
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)

                    if draft.provider == .system {
                        let _ = voiceRefreshNonce
                        let diag = NativeAudioEngine.shared.activeSystemVoiceDiagnostic(for: selectedAccentCode, settings: draft)

                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 8) {
                                Image(systemName: diag.isHighQualityNeural ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                                    .foregroundStyle(diag.isHighQualityNeural ? BrandTheme.emeraldMint : .orange)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Active Voice: \(diag.displayName) (\(diag.locale))")
                                        .scaledFont(.caption, weight: .bold)
                                    Text("\(diag.qualityBadge) · \(diag.highQualityCountForLanguage) neural/enhanced voice(s) installed for \(accentLanguageTab.capitalized)")
                                        .scaledFont(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    NativeAudioEngine.shared.invalidateVoiceCache()
                                    voiceRefreshNonce += 1
                                } label: {
                                    Label("Refresh", systemImage: "arrow.clockwise")
                                        .scaledFont(.caption2, weight: .semibold)
                                }
                                .buttonStyle(.bordered)
                                .controlSize(.small)
                            }

                            if diag.highQualityCountForLanguage <= 1 {
                                if accentLanguageTab == "german" {
                                    Text("How to install free Apple Premium German voices: Open Read & Speak → click the ⓘ button next to System Voice (or System Voice → Manage Voices…) → search \"German\" → download Petra (Premium), Anna (Premium), or Markus (Enhanced) → click Refresh above.")
                                        .scaledFont(.caption)
                                        .foregroundStyle(.secondary)
                                } else {
                                    Text("How to install free Apple Premium English voices: Open Read & Speak → click the ⓘ button next to System Voice (or System Voice → Manage Voices…) → search \"English\" → download Zoe (Premium), Daniel (Enhanced), Jamie (Premium), or Matilda (Premium) → click Refresh above.")
                                        .scaledFont(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }

                            #if os(macOS)
                            Button {
                                let urls = [
                                    "x-apple.systempreferences:com.apple.Accessibility-Settings.extension?AX_FEATURE_SPOKENCONTENT",
                                    "x-apple.systempreferences:com.apple.Accessibility-Settings.extension"
                                ]
                                for raw in urls {
                                    if let url = URL(string: raw), NSWorkspace.shared.open(url) {
                                        break
                                    }
                                }
                            } label: {
                                Label("Open Read & Speak Settings (System Voice → ⓘ → Manage Voices)…", systemImage: "arrow.down.circle")
                                    .scaledFont(.caption, weight: .semibold)
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                            #endif
                        }
                        .padding(.vertical, 4)

                        let voiceBinding = Binding<String>(
                            get: { draft.preferredSystemVoices[selectedAccentCode] ?? "" },
                            set: { draft.preferredSystemVoices[selectedAccentCode] = $0 }
                        )
                        Picker("Installed Human Voice", selection: voiceBinding) {
                            Text("✨ Auto-Pick Best Siri / Neural / Premium Voice").tag("")
                            ForEach(installedHumanVoices, id: \.identifier) { voice in
                                Text("\(NativeAudioEngine.friendlyDisplayName(for: voice)) (\(voice.language))")
                                    .tag(voice.identifier)
                            }
                        }

                        Text("Legacy robotic/Eloquence voices are automatically hidden. Neural & Premium voices are prioritized over 22kHz compact voices and spoken with uninterrupted prosody.")
                            .scaledFont(.caption)
                            .foregroundStyle(.secondary)
                    } else {
                        if draft.provider == .localOpenAI {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("Quick Local Server Presets")
                                        .scaledFont(.caption, weight: .bold)
                                        .foregroundStyle(.secondary)
                                    Spacer()
                                    Button {
                                        Task { await testLocalServer() }
                                    } label: {
                                        Label(
                                            isTestingLocalServer ? "Checking..." : "Test Local Server",
                                            systemImage: "network"
                                        )
                                        .scaledFont(.caption2, weight: .semibold)
                                    }
                                    .buttonStyle(.bordered)
                                    .controlSize(.small)
                                    .disabled(isTestingLocalServer)
                                }

                                ForEach(NativeAudioEngine.localServerPresets) { preset in
                                    Button {
                                        NativeAudioEngine.shared.playClickSound()
                                        draft.endpoint = preset.endpoint
                                        draft.model = preset.model
                                        draft.neuralVoice = preset.voice
                                        localHealthFeedback = nil
                                    } label: {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(preset.label)
                                                .scaledFont(.caption, weight: .bold)
                                                .foregroundStyle(.primary)
                                            Text(preset.note)
                                                .scaledFont(.caption2)
                                                .foregroundStyle(.secondary)
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    .buttonStyle(.bordered)
                                }

                                if let localHealthFeedback {
                                    Label(
                                        localHealthFeedback.message,
                                        systemImage: localHealthFeedback.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                                    )
                                    .scaledFont(.caption)
                                    .foregroundStyle(localHealthFeedback.ok ? BrandTheme.emeraldMint : .orange)
                                }

                                Text("Apple Silicon quick start: pip install mlx-audio[tts] && mlx_audio.server --port 8000")
                                    .scaledFont(size: 11, design: .monospaced)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }

                        TextField("TTS Endpoint URL", text: $draft.endpoint)
                            .scaledFont(size: 13, design: .monospaced)
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                            #endif

                        TextField("Model", text: $draft.model)
                            .scaledFont(size: 13, design: .monospaced)

                        if draft.provider.requiresAPIKey {
                            SecureField(
                                draft.provider == .gemini
                                    ? "Gemini API Key (or reuse key below)"
                                    : draft.provider == .openai
                                    ? "API Key (or reuse OpenAI key below)"
                                    : "ElevenLabs xi-api-key",
                                text: $draft.apiKey
                            )
                            if draft.provider == .openai {
                                Toggle("Reuse OpenAI key from AI Provider settings", isOn: $draft.reuseOpenAIKey)
                                    .scaledFont(.caption)
                            } else if draft.provider == .gemini {
                                Toggle("Reuse Gemini key from AI Provider settings", isOn: $draft.reuseGeminiKey)
                                    .scaledFont(.caption)
                            }
                        }

                        Picker("Human Voice Persona", selection: $draft.neuralVoice) {
                            ForEach(neuralPresets) { vp in
                                Text("\(vp.label) — \(vp.note)").tag(vp.id)
                            }
                        }

                        TextField("Custom Voice ID", text: $draft.neuralVoice)
                            .scaledFont(size: 12.5, design: .monospaced)
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
                                .scaledFont(.caption, weight: .bold, design: .monospaced)
                                .foregroundStyle(BrandTheme.celestialSky)
                        }
                        Slider(value: $draft.rateMultiplier, in: 0.75...1.25, step: 0.05)
                    }

                    if let feedback = previewFeedback {
                        Label(
                            feedback.message,
                            systemImage: feedback.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                        )
                        .scaledFont(.caption)
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

                    if cacheStats.fileCount > 0 {
                        HStack {
                            let formattedSize = ByteCountFormatter.string(fromByteCount: cacheStats.totalBytes, countStyle: .file)
                            Text("Offline Audio Cache: \(cacheStats.fileCount) clip(s) · \(formattedSize)")
                                .scaledFont(.caption)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Button("Clear Cache", role: .destructive) {
                                NativeAudioEngine.shared.playClickSound()
                                NativeAudioEngine.shared.clearAudioCache()
                                cacheStats = NativeAudioEngine.shared.audioCacheStats()
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }
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
        defer {
            previewingCode = nil
            cacheStats = NativeAudioEngine.shared.audioCacheStats()
        }
        let res = await NativeAudioEngine.shared.previewVoice(
            text: acc.sampleText,
            accentCode: acc.code,
            overrideSettings: draft
        )
        previewFeedback = (res.ok, res.summary)
    }

    private func testLocalServer() async {
        isTestingLocalServer = true
        localHealthFeedback = nil
        defer { isTestingLocalServer = false }
        let res = await NativeAudioEngine.checkLocalTTSServer(endpoint: draft.endpoint)
        localHealthFeedback = (res.ok, res.message)
    }
}
