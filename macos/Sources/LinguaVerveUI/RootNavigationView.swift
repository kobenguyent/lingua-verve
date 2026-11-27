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
    @Namespace private var sidebarSelectionNamespace

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

    public static func compactAISidebarLabel(for config: AIProviderConfig) -> String {
        guard config.isReady else { return "Connect AI" }
        if config.provider.isOnDeviceApple || config.model.localizedCaseInsensitiveContains("Apple Intelligence") {
            return "Apple Intelligence"
        }
        let prefixed = "AI: \(config.model)"
        if prefixed.count <= 20 {
            return prefixed
        }
        return String(config.model.prefix(19)) + "…"
    }

    public static func workspaceSubtitle(
        for store: CurriculumStore,
        section: WorkspaceSection? = nil
    ) -> String {
        let target = section ?? store.activeWorkspace
        let languageName = LearningLanguage.from(store.courseLanguageId).name
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
        .task {
            try? await Task.sleep(nanoseconds: 250_000_000)
            guard !Task.isCancelled else { return }
            await Task.detached(priority: .utility) {
                NativeAudioEngine.shared.warmVoiceCache()
            }.value
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

                Section("Study") {
                    let iconColumnWidth = max(18, 18 * min(fontScale, 1.35))
                    let progressBadgeCount = store.learnerState.completedModuleIds.count + store.learnerState.examHistory.count
                    ForEach(WorkspaceSection.allCases) { section in
                        SidebarWorkspaceRow(
                            section: section,
                            isSelected: store.activeWorkspace == section,
                            iconColumnWidth: iconColumnWidth,
                            badgeCount: section == .progress ? progressBadgeCount : 0,
                            selectionNamespace: sidebarSelectionNamespace
                        ) {
                            NativeAudioEngine.shared.playClickSound()
                            withAnimation(GoldenGateMetrics.snappySpring) {
                                store.activeWorkspace = section
                            }
                        }
                    }
                    .animation(GoldenGateMetrics.snappySpring, value: store.activeWorkspace)
                }

                Section("Tools") {
                    Button {
                        showAISettingsSheet = true
                    } label: {
                        HStack {
                            Label(Self.compactAISidebarLabel(for: store.aiConfig), systemImage: "cpu")
                                .scaledFont(.footnote)
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
                                .scaledFont(.footnote)
                                .lineLimit(1)
                            Spacer()
                            if let flag = accent?.flag {
                                Text(flag)
                                    .scaledFont(.caption2)
                            }
                        }
                    }
                    .buttonStyle(.plain)

                    Button {
                        showDisplaySettingsSheet = true
                    } label: {
                        HStack {
                            Label("Text Size", systemImage: "textformat.size")
                                .scaledFont(.footnote)
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
                            .scaledFont(.footnote)
                            .lineLimit(1)
                    }
                    .buttonStyle(.plain)

                    Button {
                        showDiagnosticSheet = true
                    } label: {
                        Label("Quick CEFR Check", systemImage: "scope")
                            .scaledFont(.footnote)
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
                            .scaledFont(.footnote)
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
                withDetailUpdateBanner(
                    activeWorkspaceView
                        .id(store.activeWorkspace)
                        .transition(.opacity)
                        .animation(GoldenGateMetrics.snappySpring, value: store.activeWorkspace)
                )
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
        let isShowing = store.shouldShowUpdateBanner && store.availableUpdate != nil
        content
            .safeAreaInset(edge: .top, spacing: 0) {
                GoldenGateCollapsiblePanel(isExpanded: isShowing) {
                    if let update = store.availableUpdate {
                        UpdateNotificationBanner(store: store, update: update)
                    }
                }
            }
            .animation(GoldenGateMetrics.panelAnimation, value: isShowing)
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
                HStack(spacing: 4) {
                    Image(systemName: "textformat.size")
                    Text("\(store.fontScalePercent)%")
                        .font(.caption.monospacedDigit().weight(.semibold))
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

private struct SidebarWorkspaceRow: View {
    let section: WorkspaceSection
    let isSelected: Bool
    let iconColumnWidth: CGFloat
    let badgeCount: Int
    let selectionNamespace: Namespace.ID
    let action: () -> Void

    @State private var isHovered: Bool = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: section.systemImage)
                    .foregroundStyle(isSelected ? BrandTheme.editorialBlue : .secondary)
                    .frame(width: iconColumnWidth)
                Text(section.title)
                    .scaledFont(.subheadline, weight: isSelected ? .semibold : .regular)
                    .foregroundStyle(.primary)
                    .lineLimit(1)
                Spacer()
                if badgeCount > 0 {
                    Text("\(badgeCount)")
                        .scaledFont(.caption2, weight: .bold, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }
            .padding(.vertical, 6)
            .padding(.horizontal, 10)
            .background {
                if isSelected {
                    RoundedRectangle(cornerRadius: GoldenGateMetrics.nestedCornerRadius, style: .continuous)
                        .fill(BrandTheme.editorialBlue.opacity(0.14))
                        .overlay(
                            RoundedRectangle(cornerRadius: GoldenGateMetrics.nestedCornerRadius, style: .continuous)
                                .strokeBorder(BrandTheme.editorialBlue.opacity(0.28), lineWidth: 0.75)
                        )
                        .matchedGeometryEffect(id: "SidebarActiveRow", in: selectionNamespace)
                } else if isHovered {
                    RoundedRectangle(cornerRadius: GoldenGateMetrics.nestedCornerRadius, style: .continuous)
                        .fill(Color.primary.opacity(0.055))
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        #if os(macOS)
        .onHover { isInside in
            isHovered = isInside
        }
        #endif
    }
}
