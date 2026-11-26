import SwiftUI
import LinguaVerveCore

public struct AIProviderSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    @State private var draft: AIProviderConfig
    @State private var appleStatus: AppleFoundationAvailability
    @State private var isTesting = false
    @State private var testStatus: (ok: Bool, latencyMs: Int, message: String)?

    @State private var isFetchingModels = false
    @State private var fetchedModels: [AIModelInfo] = []
    @State private var fetchModelsError: String?
    @State private var modelFilterText = ""

    public init(store: CurriculumStore) {
        self.store = store
        self._draft = State(initialValue: store.aiConfig)
        self._appleStatus = State(initialValue: LiveAppleFoundationModelBackend().availability())
    }

    private var filteredFetchedModels: [AIModelInfo] {
        let q = modelFilterText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return fetchedModels }
        return fetchedModels.filter {
            $0.id.lowercased().contains(q)
                || ($0.displayName?.lowercased().contains(q) ?? false)
        }
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Provider (On-Device Apple, Local, or Cloud)") {
                    Picker("AI Provider", selection: $draft.provider) {
                        ForEach(AIProviderType.allCases) { p in
                            Text(p.label).tag(p)
                        }
                    }
                    .onChange(of: draft.provider) { _, newProvider in
                        draft.endpoint = newProvider.defaultEndpoint
                        draft.model = newProvider.defaultModel
                        testStatus = nil
                        fetchedModels = []
                        fetchModelsError = nil
                        modelFilterText = ""
                    }

                    Text(draft.provider.setupHint)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                if draft.provider == .appleFoundation {
                    Section("On-Device Apple Intelligence Status") {
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: appleStatus.isAvailable ? "apple.intelligence" : "exclamationmark.triangle.fill")
                                .font(.title3)
                                .foregroundStyle(appleStatus.isAvailable ? BrandTheme.emeraldMint : .orange)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(appleStatus.statusTitle)
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(appleStatus.isAvailable ? BrandTheme.emeraldMint : .primary)
                                Text(appleStatus.detail)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 4)

                        LabeledContent("Model", value: "SystemLanguageModel.default")
                            .font(.caption.monospaced())
                        LabeledContent("System OS", value: LiveAppleFoundationModelBackend.currentOSLabel())
                            .font(.caption.monospaced())
                        LabeledContent(
                            "FoundationModels SDK",
                            value: LiveAppleFoundationModelBackend.isCompiledWithFoundationModels ? "Linked (SDK 26+)" : "Not Linked (Pre-26 SDK)"
                        )
                        .font(.caption.monospaced())
                        LabeledContent("Privacy", value: "100% On-Device · Zero API Key")
                            .font(.caption)

                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            appleStatus = LiveAppleFoundationModelBackend().availability()
                        } label: {
                            Label("Refresh Apple Intelligence Status", systemImage: "arrow.clockwise")
                                .font(.caption.weight(.semibold))
                        }
                    }
                } else {
                    Section("Connection Settings") {
                        TextField("Endpoint URL", text: $draft.endpoint)
                            .font(.system(size: 13, design: .monospaced))
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                            #endif
                            .onChange(of: draft.endpoint) { _, _ in
                                fetchedModels = []
                                fetchModelsError = nil
                            }

                        SecureField(
                            draft.provider.requiresAPIKey ? "API Key (Required)" : "API Key (Optional for Local)",
                            text: $draft.apiKey
                        )
                        .font(.system(size: 13, design: .monospaced))

                        TextField("Model Name", text: $draft.model)
                            .font(.system(size: 13, design: .monospaced))
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            #endif

                        HStack(spacing: 10) {
                            Button {
                                Task { await fetchModels() }
                            } label: {
                                HStack(spacing: 6) {
                                    if isFetchingModels {
                                        ProgressView().controlSize(.small)
                                    } else {
                                        Image(systemName: "arrow.down.circle")
                                    }
                                    Text(isFetchingModels ? "Fetching Models…" : "Fetch Available Models")
                                }
                            }
                            .disabled(isFetchingModels)

                            Spacer()

                            if !fetchedModels.isEmpty {
                                Text("\(fetchedModels.count) loaded")
                                    .font(.caption2.monospaced().bold())
                                    .foregroundStyle(BrandTheme.emeraldMint)
                            }
                        }

                        if let fetchModelsError {
                            Label(fetchModelsError, systemImage: "exclamationmark.triangle.fill")
                                .font(.caption)
                                .foregroundStyle(.red)
                        }

                        if !fetchedModels.isEmpty {
                            if fetchedModels.count > 8 {
                                TextField("Filter fetched models…", text: $modelFilterText)
                                    .font(.system(size: 12, design: .monospaced))
                                    #if os(iOS)
                                    .textInputAutocapitalization(.never)
                                    .autocorrectionDisabled()
                                    #endif
                            }

                            let visibleModels = filteredFetchedModels
                            if visibleModels.isEmpty {
                                Text("No models match \"\(modelFilterText)\".")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            } else {
                                Picker(
                                    "Select Model",
                                    selection: Binding(
                                        get: {
                                            visibleModels.contains(where: { $0.id == draft.model })
                                                ? draft.model
                                                : visibleModels[0].id
                                        },
                                        set: { draft.model = $0 }
                                    )
                                ) {
                                    ForEach(visibleModels) { item in
                                        Text(item.pickerLabel)
                                            .font(.system(size: 12, design: .monospaced))
                                            .tag(item.id)
                                    }
                                }
                            }
                        }

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
                    }
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
                                Image(systemName: draft.provider == .appleFoundation ? "sparkles" : "bolt.horizontal.circle")
                            }
                            Text(isTesting
                                 ? "Testing Model..."
                                 : (draft.provider == .appleFoundation ? "Test On-Device Apple Model" : "Test Connection Now"))
                        }
                    }
                    .disabled(isTesting || (draft.provider == .appleFoundation && !appleStatus.isAvailable))

                    if let status = testStatus {
                        Label(
                            status.ok
                                ? "Ready (\(status.latencyMs)ms): \(status.message)"
                                : "Failed (\(status.latencyMs)ms): \(status.message)",
                            systemImage: status.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                        )
                        .font(.caption)
                        .foregroundStyle(status.ok ? BrandTheme.emeraldMint : .red)
                    }
                }

                if store.aiConfig.enabled {
                    Section {
                        Button("Disconnect AI Provider", role: .destructive) {
                            var cleared = draft
                            cleared.enabled = false
                            cleared.apiKey = ""
                            store.saveAIConfig(cleared)
                            dismiss()
                        }
                    }
                }
            }
            .onAppear {
                appleStatus = LiveAppleFoundationModelBackend().availability()
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
                    .disabled(draft.provider == .appleFoundation && !appleStatus.isAvailable)
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 500, idealWidth: 600, minHeight: 500, idealHeight: 620)
        #endif
    }

    @MainActor
    private func fetchModels() async {
        isFetchingModels = true
        fetchModelsError = nil
        defer { isFetchingModels = false }

        do {
            let models = try await AIClientService().fetchAvailableModels(config: draft)
            fetchedModels = models
            modelFilterText = ""
            if let first = models.first,
               draft.model.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || draft.model == "local-model"
                || !models.contains(where: { $0.id == draft.model }) {
                draft.model = first.id
            }
            NativeAudioEngine.shared.playSuccessChime()
        } catch {
            fetchedModels = []
            fetchModelsError = error.localizedDescription
        }
    }
}
