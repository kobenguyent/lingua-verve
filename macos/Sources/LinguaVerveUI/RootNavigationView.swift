import SwiftUI
import LinguaVerveCore

/// Adaptive Universal Apple Root View:
/// - iPhone (compact): Native iOS TabView with NavigationStacks
/// - iPad & MacBook (regular / macOS): Native NavigationSplitView with sidebar & inspector actions
public struct RootNavigationView: View {
    @Bindable var store: CurriculumStore
    @Binding var showDiagnosticSheet: Bool
    @Binding var showFalseFriendsSheet: Bool
    @Binding var showAISettingsSheet: Bool
    @State private var showVoiceStudioSheet: Bool = false
    @State private var showDisplaySettingsSheet: Bool = false

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    #endif

    public init(
        store: CurriculumStore,
        showDiagnosticSheet: Binding<Bool>,
        showFalseFriendsSheet: Binding<Bool>,
        showAISettingsSheet: Binding<Bool>
    ) {
        self.store = store
        self._showDiagnosticSheet = showDiagnosticSheet
        self._showFalseFriendsSheet = showFalseFriendsSheet
        self._showAISettingsSheet = showAISettingsSheet
    }

    public var body: some View {
        Group {
            #if os(iOS)
            if horizontalSizeClass == .compact {
                compactIPhoneLayout
            } else {
                splitLayout
            }
            #else
            splitLayout
            #endif
        }
        .applyAppFontScale(store)
        .sheet(isPresented: $showDiagnosticSheet) {
            DiagnosticSheet(store: store)
                .applyAppFontScale(store)
        }
        .sheet(isPresented: $showFalseFriendsSheet) {
            FalseFriendsView(store: store)
                .applyAppFontScale(store)
        }
        .sheet(isPresented: $showAISettingsSheet) {
            AIProviderSheetView(store: store)
                .applyAppFontScale(store)
        }
        .sheet(isPresented: $showVoiceStudioSheet) {
            VoiceStudioSheetView(store: store)
                .applyAppFontScale(store)
        }
        .sheet(isPresented: $showDisplaySettingsSheet) {
            DisplaySettingsSheetView(store: store)
        }
    }

    // MARK: - iPad & MacBook Native Split View

    private var splitLayout: some View {
        NavigationSplitView {
            List {
                Section {
                    HStack(spacing: 10) {
                        BrandCrestView(size: 34)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("LinguaVerve")
                                .scaledFont(size: 16, weight: .bold, design: .serif)
                            Text("A1 → C2 Academy")
                                .scaledFont(size: 11, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section("Academy Workspaces") {
                    ForEach(WorkspaceSection.allCases) { section in
                        let selected = store.activeWorkspace == section
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            store.activeWorkspace = section
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: section.systemImage)
                                    .foregroundStyle(selected ? BrandTheme.celestialSky : .secondary)
                                    .frame(width: 18)
                                Text(section.title)
                                    .scaledFont(size: 13.5, weight: selected ? .semibold : .regular)
                                    .foregroundStyle(.primary)
                                Spacer()
                                if section == .progress {
                                    let count = store.learnerState.completedModuleIds.count + store.learnerState.examHistory.count
                                    if count > 0 {
                                        Text("\(count)")
                                            .scaledFont(.caption2, weight: .bold, design: .monospaced)
                                            .foregroundStyle(BrandTheme.emeraldMint)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                            .padding(.horizontal, 6)
                            .background(
                                RoundedRectangle(cornerRadius: 7)
                                    .fill(selected ? BrandTheme.celestialSky.opacity(0.14) : .clear)
                            )
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                }

                Section("Tools & AI") {
                    Button {
                        showAISettingsSheet = true
                    } label: {
                        HStack {
                            Label(store.aiConfig.isReady ? "AI: \(store.aiConfig.model)" : "Connect Local/Cloud AI", systemImage: "cpu")
                                .scaledFont(size: 13)
                            Spacer()
                            Circle()
                                .fill(store.aiConfig.isReady ? BrandTheme.emeraldMint : .orange)
                                .frame(width: 7, height: 7)
                        }
                    }
                    .buttonStyle(.plain)

                    Button {
                        showVoiceStudioSheet = true
                    } label: {
                        let accent = NativeAudioEngine.shared.activeAccentOption(for: store.courseLanguageId)
                        HStack {
                            Label("Voice & Accents", systemImage: "waveform")
                                .scaledFont(size: 13)
                            Spacer()
                            Text("\(accent?.flag ?? "🎙️") \(NativeAudioEngine.shared.voiceSettings.provider.shortLabel)")
                                .scaledFont(.caption2, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .buttonStyle(.plain)

                    Button {
                        showDisplaySettingsSheet = true
                    } label: {
                        HStack {
                            Label("Text Size", systemImage: "textformat.size")
                                .scaledFont(size: 13)
                            Spacer()
                            Text("\(store.fontScalePercent)%")
                                .scaledFont(.caption2, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .buttonStyle(.plain)

                    Button {
                        showFalseFriendsSheet = true
                    } label: {
                        Label("False Friends Traps", systemImage: "exclamationmark.shield")
                            .scaledFont(size: 13)
                    }
                    .buttonStyle(.plain)

                    Button {
                        showDiagnosticSheet = true
                    } label: {
                        Label("Quick CEFR Check", systemImage: "scope")
                            .scaledFont(size: 13)
                    }
                    .buttonStyle(.plain)

                    Button {
                        Task { await store.checkForUpdates(manual: true) }
                    } label: {
                        HStack {
                            Label(
                                store.isUpdateAvailable
                                    ? "Update Available (v\(store.availableUpdate?.latestVersion ?? ""))"
                                    : "Check for Updates",
                                systemImage: store.isUpdateAvailable ? "arrow.down.circle.fill" : "arrow.triangle.2.circlepath"
                            )
                            .scaledFont(size: 13)
                            Spacer()
                            if store.isUpdateAvailable {
                                Circle()
                                    .fill(BrandTheme.emeraldMint)
                                    .frame(width: 7, height: 7)
                            } else {
                                Text("v\(store.currentAppVersion)")
                                    .scaledFont(.caption2, design: .monospaced)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .listStyle(.sidebar)
            .navigationSplitViewColumnWidth(min: 210, ideal: 245, max: 280)
        } detail: {
            NavigationStack {
                activeWorkspaceView
                    .navigationTitle(store.activeWorkspace.title)
                    .toolbar {
                        sharedToolbarItems
                    }
            }
        }
    }

    // MARK: - iPhone Native TabView

    #if os(iOS)
    private var compactIPhoneLayout: some View {
        TabView(selection: $store.activeWorkspace) {
            NavigationStack {
                IntensiveCoursesNativeView(store: store)
                    .navigationTitle("Courses")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Courses", systemImage: WorkspaceSection.courses.systemImage)
            }
            .tag(WorkspaceSection.courses)

            NavigationStack {
                PreTestNativeView(store: store)
                    .navigationTitle("Pre-Test")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Pre-Test", systemImage: WorkspaceSection.pretest.systemImage)
            }
            .tag(WorkspaceSection.pretest)

            NavigationStack {
                ExamSimulatorNativeView(store: store, showAISettingsSheet: $showAISettingsSheet)
                    .navigationTitle("Exam Sim")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Exam", systemImage: WorkspaceSection.simulator.systemImage)
            }
            .tag(WorkspaceSection.simulator)

            NavigationStack {
                AICoachNativeView(store: store, showAISettingsSheet: $showAISettingsSheet)
                    .navigationTitle("AI Coach")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("AI Coach", systemImage: WorkspaceSection.aiCoach.systemImage)
            }
            .tag(WorkspaceSection.aiCoach)

            NavigationStack {
                ProgressDashboardNativeView(store: store)
                    .navigationTitle("Progress")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Progress", systemImage: WorkspaceSection.progress.systemImage)
            }
            .tag(WorkspaceSection.progress)

            NavigationStack {
                FieldManualView(store: store)
                    .navigationTitle("Manual")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Manual", systemImage: WorkspaceSection.manual.systemImage)
            }
            .tag(WorkspaceSection.manual)
        }
    }
    #endif

    @ViewBuilder
    private var activeWorkspaceView: some View {
        switch store.activeWorkspace {
        case .courses:
            IntensiveCoursesNativeView(store: store)
        case .pretest:
            PreTestNativeView(store: store)
        case .simulator:
            ExamSimulatorNativeView(store: store, showAISettingsSheet: $showAISettingsSheet)
        case .aiCoach:
            AICoachNativeView(store: store, showAISettingsSheet: $showAISettingsSheet)
        case .progress:
            ProgressDashboardNativeView(store: store)
        case .manual:
            FieldManualView(store: store)
        }
    }

    @ToolbarContentBuilder
    private var sharedToolbarItems: some ToolbarContent {
        ToolbarItemGroup(placement: .primaryAction) {
            Menu {
                Button {
                    store.increaseFontScale()
                } label: {
                    Label("Increase Text Size (⌘+)", systemImage: "textformat.size.larger")
                }
                .disabled(store.fontScale >= CurriculumStore.maxFontScale - 0.001)

                Button {
                    store.decreaseFontScale()
                } label: {
                    Label("Decrease Text Size (⌘-)", systemImage: "textformat.size.smaller")
                }
                .disabled(store.fontScale <= CurriculumStore.minFontScale + 0.001)

                Button {
                    store.resetFontScale()
                } label: {
                    Label("Reset to 100% (⌘0)", systemImage: "arrow.counterclockwise")
                }
                .disabled(abs(store.fontScale - 1.0) < 0.01)

                Divider()

                ForEach(CurriculumStore.fontScalePresets, id: \.label) { preset in
                    Button {
                        store.setFontScale(preset.scale)
                    } label: {
                        let pct = Int((preset.scale * 100).rounded())
                        if abs(store.fontScale - preset.scale) < 0.03 {
                            Label("\(preset.label) (\(pct)%)", systemImage: "checkmark")
                        } else {
                            Text("\(preset.label) (\(pct)%)")
                        }
                    }
                }

                Divider()

                Button {
                    showDisplaySettingsSheet = true
                } label: {
                    Label("Display & Text Size Settings…", systemImage: "slider.horizontal.3")
                }
            } label: {
                Label("Text \(store.fontScalePercent)%", systemImage: "textformat.size")
            }

            Button {
                showFalseFriendsSheet = true
            } label: {
                Label("False Friends", systemImage: "exclamationmark.shield")
            }

            Button {
                showVoiceStudioSheet = true
            } label: {
                Label("Voice & Accents", systemImage: "waveform")
            }

            Button {
                showAISettingsSheet = true
            } label: {
                Label("AI Setup", systemImage: "cpu")
            }

            Button {
                Task { await store.checkForUpdates(manual: true) }
            } label: {
                Label(
                    store.isUpdateAvailable ? "Update Available" : "Updates",
                    systemImage: store.isUpdateAvailable ? "arrow.down.circle.fill" : "arrow.triangle.2.circlepath"
                )
            }

            Button {
                _ = NativeAudioEngine.shared.toggleMute()
            } label: {
                Label(
                    NativeAudioEngine.shared.isMuted ? "Muted" : "Audio",
                    systemImage: NativeAudioEngine.shared.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"
                )
            }
        }
    }
}
