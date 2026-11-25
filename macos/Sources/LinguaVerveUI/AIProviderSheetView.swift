import SwiftUI
import LinguaVerveCore

public struct AIProviderSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    @State private var draft: AIProviderConfig
    @State private var isTesting = false
    @State private var testStatus: (ok: Bool, latencyMs: Int, message: String)?

    public init(store: CurriculumStore) {
        self.store = store
        self._draft = State(initialValue: store.aiConfig)
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Provider (Local or Cloud)") {
                    Picker("AI Provider", selection: $draft.provider) {
                        ForEach(AIProviderType.allCases) { p in
                            Text(p.label).tag(p)
                        }
                    }
                    .onChange(of: draft.provider) { _, newProvider in
                        draft.endpoint = newProvider.defaultEndpoint
                        draft.model = newProvider.defaultModel
                        testStatus = nil
                    }

                    Text(draft.provider.setupHint)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Connection Settings") {
                    TextField("Endpoint URL", text: $draft.endpoint)
                        .font(.system(size: 13, design: .monospaced))
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                        #endif

                    TextField("Model Name", text: $draft.model)
                        .font(.system(size: 13, design: .monospaced))
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        #endif

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(draft.provider.suggestedModels, id: \.self) { m in
                                Button(m) { draft.model = m }
                                    .font(.caption2.monospaced())
                                    .buttonStyle(.bordered)
                                    .controlSize(.mini)
                            }
                        }
                    }

                    SecureField(
                        draft.provider.requiresAPIKey ? "API Key (Required)" : "API Key (Optional for Local)",
                        text: $draft.apiKey
                    )
                    .font(.system(size: 13, design: .monospaced))
                }

                Section("Diagnostics") {
                    Button {
                        Task {
                            isTesting = true
                            testStatus = await AIClientService().testConnection(config: draft)
                            isTesting = false
                            if testStatus?.ok == true {
                                NativeAudioEngine.shared.playSuccessChime()
                            }
                        }
                    } label: {
                        HStack {
                            if isTesting {
                                ProgressView().controlSize(.small)
                            } else {
                                Image(systemName: "bolt.horizontal.circle")
                            }
                            Text(isTesting ? "Testing Connection..." : "Test Connection Now")
                        }
                    }
                    .disabled(isTesting)

                    if let status = testStatus {
                        Label(
                            status.ok
                                ? "Connected (\(status.latencyMs)ms): \(status.message)"
                                : "Failed (\(status.latencyMs)ms): \(status.message)",
                            systemImage: status.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                        )
                        .font(.caption)
                        .foregroundStyle(status.ok ? BrandTheme.emeraldMint : .red)
                    }
                }

                if store.aiConfig.enabled {
                    Section {
                        Button("Disconnect & Clear API Key", role: .destructive) {
                            var cleared = draft
                            cleared.enabled = false
                            cleared.apiKey = ""
                            store.saveAIConfig(cleared)
                            dismiss()
                        }
                    }
                }
            }
            .formStyle(.grouped)
            .navigationTitle("Local & Cloud AI")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save & Enable") {
                        var toSave = draft
                        toSave.enabled = true
                        store.saveAIConfig(toSave)
                        NativeAudioEngine.shared.playSuccessChime()
                        dismiss()
                    }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 480, idealWidth: 560, minHeight: 460, idealHeight: 540)
        #endif
    }
}
