import SwiftUI
import LinguaVerveCore

/// Adaptive Universal Apple Root View:
/// - iPhone (compact): Native iOS TabView with NavigationStacks
/// - iPad & MacBook (regular / macOS): Native NavigationSplitView with seamless unified toolbar & inspector actions
public struct RootNavigationView: View {
    @Bindable var store: CurriculumStore
    @Binding var showDiagnosticSheet: Bool
    @Binding var showFalseFriendsSheet: Bool
    @Binding var showAISettingsSheet: Bool
    @Environment(\.appFontScale) private var fontScale
    @State private var showVoiceStudioSheet: Bool = false
    @State private var showDisplaySettingsSheet: Bool = false
    @State private var hoveredWorkspace: WorkspaceSection? = nil

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

    public static func workspaceSubtitle(
        for store: CurriculumStore,
        section: WorkspaceSection? = nil
    ) -> String {
        let target = section ?? store.activeWorkspace
        let languageName = store.courseLanguageId == "german" ? "German" : "English"
        switch target {
        case .courses:
            return "\(languageName) · \(store.courseLevel.rawValue) Mastery"
        case .pretest:
            return "\(languageName) · CEFR Placement"
        case .simulator:
            return "\(languageName) · \(store.examTargetLevel.rawValue) 4-Skill Arena"
        case .aiCoach:
            return "\(languageName) · \(store.aiCoachLevel.rawValue) \(store.aiCoachSkill.displayName)"
        case .progress:
            return "\(store.learnerState.completedModuleIds.count) units · \(store.learnerState.examHistory.count) exams"
        case .manual:
            return "Field Tactics & Grammar Reference"
        }
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
                        BrandCrestView(size: 36)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("LinguaVerve")
                                .scaledFont(size: 16, weight: .bold, design: .serif)
                            Text("A1 → C2 Academy")
                                .scaledFont(size: 11, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 6)
                }

                Section("Academy Workspaces") {
                    let iconColumnWidth = max(18, 18 * min(fontScale, 1.35))
                    ForEach(WorkspaceSection.allCases) { section in
                        let selected = store.activeWorkspace == section
                        let hovered = hoveredWorkspace == section
                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            store.activeWorkspace = section
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: section.systemImage)
                                    .foregroundStyle(selected ? BrandTheme.celestialSky : .secondary)
                                    .frame(width: iconColumnWidth)
                                Text(section.title)
                                    .scaledFont(size: 13.5, weight: selected ? .semibold : .regular)
                                    .foregroundStyle(.primary)
                                    .lineLimit(1)
                                Spacer()
                                if section == .progress {
                                    let count = store.learnerState.completedModuleIds.count + store.learnerState.examHistory.count
                                    if count > 0 {
                                        Text("\(count)")
                                            .scaledFont(.caption2, weight: .bold, design: .monospaced, monospacedDigit: true)
                                            .foregroundStyle(BrandTheme.emeraldMint)
                                    }
                                }
                            }
                            .padding(.vertical, 5)
                            .padding(.horizontal, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(
                                        selected
                                            ? BrandTheme.celestialSky.opacity(0.15)
                                            : (hovered ? Color.primary.opacity(0.05) : .clear)
                                    )
                            )
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        #if os(macOS)
                        .onHover { isInside in
                            hoveredWorkspace = isInside ? section : (hoveredWorkspace == section ? nil : hoveredWorkspace)
                        }
                        #endif
                    }
                    .animation(.snappy(duration: 0.18), value: store.activeWorkspace)
                    .animation(.easeOut(duration: 0.12), value: hoveredWorkspace)
                }

                Section("Tools & AI") {
                    Button {
                        showAISettingsSheet = true
                    } label: {
                        HStack {
                            Label(store.aiConfig.isReady ? "AI: \(store.aiConfig.model)" : "Connect Local/Cloud AI", systemImage: "cpu")
                                .scaledFont(size: 13)
                                .lineLimit(1)
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
                                .lineLimit(1)
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
                                .lineLimit(1)
                            Spacer()
                            Text("\(store.fontScalePercent)%")
                                .scaledFont(.caption2, design: .monospaced, monospacedDigit: true)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .buttonStyle(.plain)

                    Button {
                        showFalseFriendsSheet = true
                    } label: {
                        Label("False Friends Traps", systemImage: "exclamationmark.shield")
                            .scaledFont(size: 13)
                            .lineLimit(1)
                    }
                    .buttonStyle(.plain)

                    Button {
                        showDiagnosticSheet = true
                    } label: {
                        Label("Quick CEFR Check", systemImage: "scope")
                            .scaledFont(size: 13)
                            .lineLimit(1)
                    }
                    .buttonStyle(.plain)

                    Button {
                        if store.isUpdateAvailable {
                            store.isUpdateSheetPresented = true
                        } else {
                            Task { await store.checkForUpdates(manual: true) }
                        }
                    } label: {
                        HStack {
                            Label(
                                store.isUpdateAvailable
                                    ? "Update Available (v\(store.availableUpdate?.latestVersion ?? ""))"
                                    : "Check for Updates",
                                systemImage: store.isUpdateAvailable ? "arrow.down.circle.fill" : "arrow.triangle.2.circlepath"
                            )
                            .scaledFont(size: 13)
                            .lineLimit(1)
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
            .navigationSplitViewColumnWidth(
                min: 225,
                ideal: AppTypography.scaledSidebarIdealWidth(scale: fontScale),
                max: 360
            )
        } detail: {
            NavigationStack {
                withDetailUpdateBanner(activeWorkspaceView)
                    .navigationTitle(store.activeWorkspace.title)
                    #if os(macOS)
                    .navigationSubtitle(Self.workspaceSubtitle(for: store))
                    #endif
                    .toolbar {
                        sharedToolbarItems
                    }
            }
        }
    }

    @ViewBuilder
    private func withDetailUpdateBanner<Content: View>(_ content: Content) -> some View {
        content
            .safeAreaInset(edge: .top, spacing: 0) {
                if store.shouldShowUpdateBanner, let update = store.availableUpdate {
                    UpdateNotificationBanner(store: store, update: update)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .animation(.snappy(duration: 0.28), value: store.shouldShowUpdateBanner)
    }

    // MARK: - iPhone Native TabView

    #if os(iOS)
    private var compactIPhoneLayout: some View {
        TabView(selection: $store.activeWorkspace) {
            NavigationStack {
                withDetailUpdateBanner(IntensiveCoursesNativeView(store: store))
                    .navigationTitle("Courses")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Courses", systemImage: WorkspaceSection.courses.systemImage)
            }
            .tag(WorkspaceSection.courses)

            NavigationStack {
                withDetailUpdateBanner(PreTestNativeView(store: store))
                    .navigationTitle("Pre-Test")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Pre-Test", systemImage: WorkspaceSection.pretest.systemImage)
            }
            .tag(WorkspaceSection.pretest)

            NavigationStack {
                withDetailUpdateBanner(ExamSimulatorNativeView(store: store, showAISettingsSheet: $showAISettingsSheet))
                    .navigationTitle("Exam Sim")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Exam", systemImage: WorkspaceSection.simulator.systemImage)
            }
            .tag(WorkspaceSection.simulator)

            NavigationStack {
                withDetailUpdateBanner(AICoachNativeView(store: store, showAISettingsSheet: $showAISettingsSheet))
                    .navigationTitle("AI Coach")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("AI Coach", systemImage: WorkspaceSection.aiCoach.systemImage)
            }
            .tag(WorkspaceSection.aiCoach)

            NavigationStack {
                withDetailUpdateBanner(ProgressDashboardNativeView(store: store))
                    .navigationTitle("Progress")
                    .toolbar { sharedToolbarItems }
            }
            .tabItem {
                Label("Progress", systemImage: WorkspaceSection.progress.systemImage)
            }
            .tag(WorkspaceSection.progress)

            NavigationStack {
                withDetailUpdateBanner(FieldManualView(store: store))
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
        // 1. Text Size Menu (prominent + active percentage badge when != 100%)
        ToolbarItem(placement: .primaryAction) {
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
                if store.fontScalePercent != 100 {
                    HStack(spacing: 4) {
                        Image(systemName: "textformat.size")
                        Text("\(store.fontScalePercent)%")
                            .font(.caption.monospacedDigit().weight(.semibold))
                    }
                } else {
                    Label("Text Size", systemImage: "textformat.size")
                }
            }
            .help("Text Size (\(store.fontScalePercent)%) — ⌘+ / ⌘-")
        }

        // 2. Daily Audio, Voice & AI Studio Controls
        ToolbarItemGroup(placement: .primaryAction) {
            Button {
                _ = NativeAudioEngine.shared.toggleMute()
            } label: {
                Image(systemName: NativeAudioEngine.shared.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                    .foregroundStyle(NativeAudioEngine.shared.isMuted ? .orange : .primary)
                    .contentTransition(.symbolEffect(.replace))
            }
            .accessibilityLabel(NativeAudioEngine.shared.isMuted ? "Unmute Audio" : "Mute Audio")
            .help(NativeAudioEngine.shared.isMuted ? "Audio Muted (Click to Unmute)" : "Mute Audio")

            Button {
                showVoiceStudioSheet = true
            } label: {
                Label("Voice & Accents", systemImage: "waveform")
            }
            .help("Voice & Accent Studio")

            Button {
                showAISettingsSheet = true
            } label: {
                Image(systemName: "cpu")
                    .foregroundStyle(store.aiConfig.isReady ? BrandTheme.emeraldMint : .primary)
            }
            .accessibilityLabel("AI Setup")
            .help(store.aiConfig.isReady ? "AI Ready: \(store.aiConfig.model)" : "Configure Local or Cloud AI")
        }

        // 3. Conditional Software Update Indicator
        if store.isUpdateAvailable {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    store.isUpdateSheetPresented = true
                } label: {
                    Image(systemName: "arrow.down.circle.fill")
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
                .accessibilityLabel("Update Available")
                .help("LinguaVerve v\(store.availableUpdate?.latestVersion ?? "") Available")
            }
        }

        // 4. Secondary Study Utilities Menu
        ToolbarItem(placement: .primaryAction) {
            Menu {
                Button {
                    showFalseFriendsSheet = true
                } label: {
                    Label("False Friends Traps", systemImage: "exclamationmark.shield")
                }

                Button {
                    showDiagnosticSheet = true
                } label: {
                    Label("Quick CEFR Check", systemImage: "scope")
                }

                Divider()

                Button {
                    showDisplaySettingsSheet = true
                } label: {
                    Label("Display & Text Size Settings…", systemImage: "slider.horizontal.3")
                }

                Button {
                    Task { await store.checkForUpdates(manual: true) }
                } label: {
                    Label("Check for Updates…", systemImage: "arrow.triangle.2.circlepath")
                }
            } label: {
                Label("More Tools", systemImage: "ellipsis.circle")
            }
            .help("More Study Tools & Updates")
        }
    }
}
