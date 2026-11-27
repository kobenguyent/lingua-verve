import SwiftUI
import LinguaVerveCore

public struct AIProviderSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    @State private var draft: AIProviderConfig
    @State private var appleStatus: AppleFoundationAvailability
    @State private var selectedLanguage: ModelLanguageTarget
    @State private var isTesting = false
    @State private var testStatus: (ok: Bool, latencyMs: Int, message: String)?

    @State private var isFetchingModels = false
    @State private var fetchedModels: [AIModelInfo] = []
    @State private var fetchModelsError: String?
    @State private var modelFilterText = ""
    @State private var copiedCommandId: String? = nil

    public init(store: CurriculumStore) {
        self.store = store
        self._draft = State(initialValue: store.aiConfig)
        self._appleStatus = State(initialValue: LiveAppleFoundationModelBackend().availability())
        self._selectedLanguage = State(initialValue: ModelLanguageTarget.normalize(store.courseLanguageId))
    }

    private var rankedFetchedModels: [RankedFetchedModel] {
        AIModelAdvisor.rankFetchedModels(fetchedModels, for: selectedLanguage)
    }

    private var filteredRankedModels: [RankedFetchedModel] {
        let q = modelFilterText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return rankedFetchedModels }
        return rankedFetchedModels.filter {
            $0.model.id.lowercased().contains(q)
                || ($0.model.displayName?.lowercased().contains(q) ?? false)
        }
    }

    private var curatedRecommendations: [LanguageModelRecommendation] {
        AIModelAdvisor.recommendedModels(for: draft.provider, language: selectedLanguage)
    }

    private var pinnedModelForSelectedLanguage: String? {
        guard selectedLanguage != .all else { return nil }
        return draft.languageModels?[selectedLanguage.rawValue]
    }

    private var isSelectedModelCoding: Bool {
        draft.provider != .appleFoundation && AIModelAdvisor.isCodingSpecializedModel(draft.model)
    }

    public var body: some View {
        NavigationStack {
            Form {
                providerSection
                if draft.provider == .appleFoundation {
                    appleFoundationSection
                } else {
                    connectionSection
                }
                languageModelAdvisorSection
                diagnosticsSection

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
        .frame(minWidth: 560, idealWidth: 680, minHeight: 580, idealHeight: 720)
        #endif
    }

    // MARK: - Provider Picker

    private var providerSection: some View {
        Section("Provider (On-Device Apple, Local, or Cloud)") {
            Picker("AI Provider", selection: $draft.provider) {
                ForEach(AIProviderType.allCases) { p in
                    Text(p.label).tag(p)
                }
            }
            .onChange(of: draft.provider) { _, newProvider in
                draft.endpoint = newProvider.defaultEndpoint
                let topRec = AIModelAdvisor.recommendedModels(for: newProvider, language: selectedLanguage).first
                draft.model = topRec?.modelId ?? newProvider.defaultModel
                draft.languageModels = nil
                testStatus = nil
                fetchedModels = []
                fetchModelsError = nil
                modelFilterText = ""
            }

            Text(draft.provider.setupHint)
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Apple Foundation Model Status

    private var appleFoundationSection: some View {
        Section("On-Device Apple Intelligence Status") {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: appleStatus.isAvailable ? "apple.intelligence" : "exclamationmark.triangle.fill")
                    .scaledFont(.title3)
                    .foregroundStyle(appleStatus.isAvailable ? BrandTheme.emeraldMint : .orange)
                VStack(alignment: .leading, spacing: 4) {
                    Text(appleStatus.statusTitle)
                        .scaledFont(.subheadline, weight: .bold)
                        .foregroundStyle(appleStatus.isAvailable ? BrandTheme.emeraldMint : .primary)
                    Text(appleStatus.detail)
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 4)

            LabeledContent("Model", value: "SystemLanguageModel.default")
                .scaledFont(.caption, design: .monospaced)
            LabeledContent("System OS", value: LiveAppleFoundationModelBackend.currentOSLabel())
                .scaledFont(.caption, design: .monospaced)
            LabeledContent(
                "FoundationModels SDK",
                value: LiveAppleFoundationModelBackend.isCompiledWithFoundationModels ? "Linked (SDK 26+)" : "Not Linked (Pre-26 SDK)"
            )
            .scaledFont(.caption, design: .monospaced)
            LabeledContent("Privacy", value: "100% On-Device · Zero API Key")
                .scaledFont(.caption)

            Button {
                NativeAudioEngine.shared.playClickSound()
                appleStatus = LiveAppleFoundationModelBackend().availability()
            } label: {
                Label("Refresh Apple Intelligence Status", systemImage: "arrow.clockwise")
                    .scaledFont(.caption, weight: .semibold)
            }
        }
    }

    // MARK: - Connection & Live Fetched Models

    private var connectionSection: some View {
        Section("Connection Settings") {
            TextField("Endpoint URL", text: $draft.endpoint)
                .scaledFont(size: 13, design: .monospaced)
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
            .scaledFont(size: 13, design: .monospaced)

            TextField("Active Default Model", text: $draft.model)
                .scaledFont(size: 13, design: .monospaced)
                #if os(iOS)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                #endif

            if isSelectedModelCoding {
                codingModelWarningBanner
            }

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
                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }

            if let fetchModelsError {
                Label(fetchModelsError, systemImage: "exclamationmark.triangle.fill")
                    .scaledFont(.caption)
                    .foregroundStyle(.red)
            }

            if !fetchedModels.isEmpty {
                fetchedModelsRankedBlock
            }
        }
    }

    private var codingModelWarningBanner: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 4) {
                Text("\"\(draft.model)\" is coding-specialized — weaker for grammar, idioms, and CEFR exams.")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(.orange)
                if let bestInstalled = AIModelAdvisor.bestInstalledModel(from: fetchedModels, for: selectedLanguage),
                   !bestInstalled.isCodingModel {
                    Button("Switch to \(bestInstalled.model.id) (Best Installed)") {
                        NativeAudioEngine.shared.playClickSound()
                        draft.model = bestInstalled.model.id
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.emeraldMint)
                    .controlSize(.mini)
                } else if let topRec = curatedRecommendations.first {
                    Button("Use \(topRec.modelId) (\(topRec.badge))") {
                        NativeAudioEngine.shared.playClickSound()
                        draft.model = topRec.modelId
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
                }
            }
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var fetchedModelsRankedBlock: some View {
        if fetchedModels.count > 8 {
            TextField("Filter fetched models…", text: $modelFilterText)
                .scaledFont(size: 12, design: .monospaced)
                #if os(iOS)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                #endif
        }

        let visible = filteredRankedModels
        if let best = visible.first, !best.isCodingModel {
            HStack(spacing: 8) {
                Label("Best Installed for \(selectedLanguage.shortName): \(best.model.id)", systemImage: "star.fill")
                    .scaledFont(.caption, weight: .semibold)
                    .foregroundStyle(BrandTheme.emeraldMint)
                Spacer()
                if draft.model != best.model.id {
                    Button("Auto-Pick") {
                        NativeAudioEngine.shared.playClickSound()
                        draft.model = best.model.id
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.emeraldMint)
                    .controlSize(.mini)
                } else {
                    Text("Active ✓")
                        .scaledFont(.caption2, weight: .bold, design: .monospaced)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }
        }

        if visible.isEmpty {
            Text("No models match \"\(modelFilterText)\".")
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
        } else {
            Picker(
                "Select Ranked Model",
                selection: Binding(
                    get: {
                        visible.contains(where: { $0.model.id == draft.model })
                            ? draft.model
                            : visible[0].model.id
                    },
                    set: { draft.model = $0 }
                )
            ) {
                ForEach(visible) { item in
                    let badge = item.tier == .ideal ? "★" : (item.isCodingModel ? "⚠︎" : "·")
                    Text("\(badge) \(item.model.pickerLabel) [\(item.tier.label)]")
                        .scaledFont(size: 12, design: .monospaced)
                        .tag(item.model.id)
                }
            }
        }
    }

    // MARK: - Language-Matched Model Advisor

    private var languageModelAdvisorSection: some View {
        Section("Language-Matched Model Advisor") {
            Picker("Language You're Learning", selection: $selectedLanguage) {
                ForEach(ModelLanguageTarget.allCases) { target in
                    Text("\(target.flag) \(target.displayName)").tag(target)
                }
            }

            if let pinned = pinnedModelForSelectedLanguage {
                HStack(spacing: 8) {
                    Label("Pinned for \(selectedLanguage.shortName): \(pinned)", systemImage: "pin.fill")
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.purple)
                    Spacer()
                    Button("Unpin") {
                        NativeAudioEngine.shared.playClickSound()
                        setPinnedModel(nil, for: selectedLanguage)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
                }
            }

            ForEach(curatedRecommendations) { rec in
                recommendationRow(rec)
            }
        }
    }

    private func recommendationRow(_ rec: LanguageModelRecommendation) -> some View {
        let installedMatch = matchingInstalledModel(for: rec.modelId)
        let isActive = draft.model == (installedMatch?.id ?? rec.modelId) || draft.model == rec.modelId
        let isPinned = pinnedModelForSelectedLanguage == (installedMatch?.id ?? rec.modelId)

        return VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .center, spacing: 6) {
                Text(rec.modelId)
                    .scaledFont(.subheadline, weight: .bold, design: .monospaced)
                Text(rec.badge)
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill((rec.isBestMatch ? Color.purple : BrandTheme.celestialSky).opacity(0.16)))
                    .foregroundStyle(rec.isBestMatch ? .purple : BrandTheme.celestialSky)
                if installedMatch != nil {
                    Text("Installed ✓")
                        .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.18)))
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
                Spacer()
                Text(rec.sizeHint)
                    .scaledFont(.caption2, design: .monospaced)
                    .foregroundStyle(.secondary)
            }

            Text(rec.reason)
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if draft.provider != .appleFoundation {
                HStack(spacing: 8) {
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        draft.model = installedMatch?.id ?? rec.modelId
                    } label: {
                        Label(isActive ? "Selected" : "Pick Model", systemImage: isActive ? "checkmark.circle.fill" : "hand.tap")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(isActive ? BrandTheme.emeraldMint : BrandTheme.celestialSky)
                    .controlSize(.mini)

                    if selectedLanguage != .all {
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            let targetId = installedMatch?.id ?? rec.modelId
                            setPinnedModel(isPinned ? nil : targetId, for: selectedLanguage)
                        } label: {
                            Label(
                                isPinned ? "Pinned for \(selectedLanguage.shortName)" : "Pin for \(selectedLanguage.shortName)",
                                systemImage: isPinned ? "pin.fill" : "pin"
                            )
                        }
                        .buttonStyle(.bordered)
                        .tint(.purple)
                        .controlSize(.mini)
                    }

                    if let pullCmd = rec.pullCommand, installedMatch == nil {
                        Button {
                            PlatformClipboard.copy(pullCmd)
                            NativeAudioEngine.shared.playClickSound()
                            copiedCommandId = rec.modelId
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                if copiedCommandId == rec.modelId { copiedCommandId = nil }
                            }
                        } label: {
                            Label(
                                copiedCommandId == rec.modelId ? "Copied Pull Cmd" : "Copy `\(pullCmd)`",
                                systemImage: copiedCommandId == rec.modelId ? "checkmark" : "doc.on.doc"
                            )
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.mini)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }

    private func matchingInstalledModel(for recommendedId: String) -> AIModelInfo? {
        let targetLower = recommendedId.lowercased()
        if let exact = fetchedModels.first(where: { $0.id.lowercased() == targetLower }) {
            return exact
        }
        let basePrefix = targetLower.split(separator: ":").first.map(String.init) ?? targetLower
        return fetchedModels.first {
            let lower = $0.id.lowercased()
            return !AIModelAdvisor.isCodingSpecializedModel(lower)
                && (lower == basePrefix || lower.hasPrefix("\(basePrefix):"))
        }
    }

    private func setPinnedModel(_ modelId: String?, for language: ModelLanguageTarget) {
        guard language != .all else { return }
        var map = draft.languageModels ?? [:]
        if let modelId, !modelId.isEmpty {
            map[language.rawValue] = modelId
        } else {
            map.removeValue(forKey: language.rawValue)
        }
        draft.languageModels = map.isEmpty ? nil : map
    }

    // MARK: - Diagnostics

    private var diagnosticsSection: some View {
        Section("Diagnostics") {
            Button {
                Task {
                    isTesting = true
                    testStatus = await AIClientService().testConnection(config: draft.resolved(for: selectedLanguage.rawValue))
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
                .scaledFont(.caption)
                .foregroundStyle(status.ok ? BrandTheme.emeraldMint : .red)
            }
        }
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
            if let best = AIModelAdvisor.bestInstalledModel(from: models, for: selectedLanguage) {
                let currentEmptyOrMissing = draft.model.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                    || draft.model == "local-model"
                    || !models.contains(where: { $0.id == draft.model })
                    || (AIModelAdvisor.isCodingSpecializedModel(draft.model) && !best.isCodingModel)
                if currentEmptyOrMissing {
                    draft.model = best.model.id
                }
            }
            NativeAudioEngine.shared.playSuccessChime()
        } catch {
            fetchedModels = []
            fetchModelsError = error.localizedDescription
        }
    }
}
