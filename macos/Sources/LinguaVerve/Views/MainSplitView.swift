import SwiftUI
import LinguaVerveCore

public struct MainSplitView: View {
    @Environment(\.colorScheme) private var colorScheme
    @Bindable var store: CurriculumStore
    @Binding var showDiagnosticSheet: Bool
    @Binding var showFalseFriendsSheet: Bool

    private var inkPrimary: Color {
        colorScheme == .dark
            ? Color(red: 0.933, green: 0.949, blue: 0.976)
            : Color(red: 0.075, green: 0.102, blue: 0.149)
    }

    private var inkSecondary: Color {
        colorScheme == .dark
            ? Color(red: 0.616, green: 0.671, blue: 0.745)
            : Color(red: 0.365, green: 0.420, blue: 0.502)
    }

    public init(
        store: CurriculumStore,
        showDiagnosticSheet: Binding<Bool>,
        showFalseFriendsSheet: Binding<Bool>
    ) {
        self.store = store
        self._showDiagnosticSheet = showDiagnosticSheet
        self._showFalseFriendsSheet = showFalseFriendsSheet
    }

    public var body: some View {
        NavigationSplitView {
            sidebarContent
                .navigationSplitViewColumnWidth(min: 205, ideal: 242, max: 280)
        } content: {
            blueprintListColumn
                .navigationSplitViewColumnWidth(min: 285, ideal: 365, max: 450)
        } detail: {
            detailColumn
                .navigationSplitViewColumnWidth(min: 390, ideal: 680)
        }
        .navigationTitle(activeLanguageTitle)
        .navigationSubtitle("\(store.filteredTips.count) tactical blueprints")
        .searchable(text: $store.searchQuery, prompt: "Search tactics, IPA, grammar, or #tags...")
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    if let rnd = store.randomTip() {
                        store.selectedTipId = rnd.id
                    }
                } label: {
                    Label("Random", systemImage: "dice")
                }
                .help("Pick a random tactical blueprint (⌘R)")

                Button {
                    showFalseFriendsSheet = true
                } label: {
                    Label("False Friends", systemImage: "exclamationmark.shield")
                }
                .help("Open False Friends & Deceptive Cognates (⇧⌘F)")

                Button {
                    showDiagnosticSheet = true
                } label: {
                    Label("Diagnostic", systemImage: "scope")
                }
                .help("Open 4-Step CEFR Diagnostic Finder (⌘D)")

                Button {
                    _ = NativeAudioEngine.shared.toggleMute()
                } label: {
                    Label(
                        NativeAudioEngine.shared.isMuted ? "Muted" : "Audio",
                        systemImage: NativeAudioEngine.shared.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"
                    )
                }
                .help("Toggle synthesized sound effects and TTS audio")

                Button {
                    if store.isUpdateAvailable {
                        store.isUpdateSheetPresented = true
                    } else {
                        Task { await store.checkForUpdates(manual: true) }
                    }
                } label: {
                    if store.isCheckingForUpdates {
                        ProgressView()
                            .controlSize(.mini)
                    } else if let update = store.availableUpdate {
                        Label("Update v\(update.latestVersion)", systemImage: "arrow.down.circle.fill")
                            .foregroundStyle(BrandTheme.emeraldMint)
                    } else {
                        Label("Updates", systemImage: "arrow.triangle.2.circlepath")
                    }
                }
                .help(
                    store.isUpdateAvailable
                        ? "Update available (v\(store.availableUpdate?.latestVersion ?? "")) — click to install"
                        : "Check GitHub Releases for updates"
                )
            }
        }
        .sheet(isPresented: $showDiagnosticSheet) {
            DiagnosticSheet(store: store)
        }
        .sheet(isPresented: $showFalseFriendsSheet) {
            FalseFriendsView(store: store)
        }
        .sheet(isPresented: $store.isUpdateSheetPresented) {
            UpdateSheetView(store: store)
        }
        .task {
            if store.autoCheckForUpdates && store.lastUpdateCheckDate == nil {
                await store.checkForUpdates(manual: false)
            }
        }
    }

    private var activeLanguageTitle: String {
        if store.activeLanguageId == "all" {
            return "LinguaVerve"
        }
        return "LinguaVerve · \(store.language(for: store.activeLanguageId)?.name ?? "Blueprints")"
    }

    // MARK: - Sidebar

    private var sidebarContent: some View {
        List {
            // Brand Crest & Mastery Progress Summary
            Section {
                HStack(spacing: 10) {
                    BrandCrestView(size: 34)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("LinguaVerve")
                            .font(.system(size: 15, weight: .bold, design: .serif))
                            .foregroundStyle(inkPrimary)
                        Text("\(store.masteredIds.count)/\(store.bundle.tips.count) mastered")
                            .font(.system(size: 11.5, design: .monospaced))
                            .monospacedDigit()
                            .foregroundStyle(inkSecondary)
                    }
                    Spacer()
                }
                .padding(.vertical, 4)
                .listRowInsets(EdgeInsets(top: 4, leading: 10, bottom: 4, trailing: 10))
            }

            Section {
                sidebarLanguageRow(id: "all", flag: "🌐", name: "All Languages", badge: "\(store.bundle.tips.count)")
                ForEach(store.bundle.languages.filter(\.isActive)) { lang in
                    let count = store.bundle.tips.filter { $0.languageId == lang.id }.count
                    sidebarLanguageRow(id: lang.id, flag: lang.flag, name: lang.name, badge: "\(count)")
                }
            } header: {
                Text("Languages")
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundStyle(inkSecondary)
            }

            Section {
                ForEach(ViewModeFilter.allCases) { mode in
                    let isSelected = store.viewMode == mode
                    let count: Int = {
                        switch mode {
                        case .all: return store.bundle.tips.count
                        case .saved: return store.bookmarkedIds.count
                        case .mastered: return store.masteredIds.count
                        }
                    }()
                    Button {
                        NativeAudioEngine.shared.playClickSound()
                        store.viewMode = mode
                        syncSelectionAfterFilter()
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: mode == .saved ? "bookmark.fill" : mode == .mastered ? "checkmark.seal.fill" : "square.grid.2x2")
                                .foregroundStyle(isSelected ? BrandTheme.celestialSky : inkSecondary)
                                .frame(width: 16)
                            Text(mode.rawValue)
                                .font(.system(size: 13.5, weight: isSelected ? .semibold : .regular))
                                .foregroundStyle(inkPrimary)
                                .lineLimit(1)
                            Spacer()
                            Text("\(count)")
                                .font(.system(size: 12, design: .monospaced))
                                .monospacedDigit()
                                .foregroundStyle(isSelected ? BrandTheme.celestialSky : inkSecondary)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                        .background(
                            RoundedRectangle(cornerRadius: 7, style: .continuous)
                                .fill(isSelected ? BrandTheme.celestialSky.opacity(0.14) : .clear)
                        )
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .listRowInsets(EdgeInsets(top: 1, leading: 6, bottom: 1, trailing: 6))
                }
            } header: {
                Text("Progress & Views")
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundStyle(inkSecondary)
            }

            Section {
                categoryRow(id: "all", name: "All Categories", icon: "line.3.horizontal.decrease.circle")
                ForEach(TipCategory.allCases) { cat in
                    categoryRow(id: cat.rawValue, name: cat.displayName, icon: cat.systemImage)
                }
            } header: {
                Text("Categories")
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundStyle(inkSecondary)
            }

            Section {
                ForEach(store.bundle.languages.filter { !$0.isActive }) { lang in
                    HStack(spacing: 8) {
                        Text(lang.flag)
                        Text(lang.name)
                            .foregroundStyle(inkSecondary)
                            .lineLimit(1)
                        Spacer()
                        Text("Soon")
                            .font(.system(.caption2, design: .monospaced))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(inkSecondary.opacity(0.14)))
                            .foregroundStyle(inkSecondary)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .listRowInsets(EdgeInsets(top: 1, leading: 6, bottom: 1, trailing: 6))
                }
            } header: {
                Text("Preview Languages")
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundStyle(inkSecondary)
            }
        }
        .listStyle(.sidebar)
    }

    private func sidebarLanguageRow(id: String, flag: String, name: String, badge: String) -> some View {
        let isSelected = store.activeLanguageId == id
        return Button {
            NativeAudioEngine.shared.playClickSound()
            store.activeLanguageId = id
            syncSelectionAfterFilter()
        } label: {
            HStack(spacing: 8) {
                Text(flag)
                Text(name)
                    .font(.system(size: 13.5, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(inkPrimary)
                    .lineLimit(1)
                Spacer()
                Text(badge)
                    .font(.system(size: 12, design: .monospaced))
                    .monospacedDigit()
                    .foregroundStyle(isSelected ? BrandTheme.celestialSky : inkSecondary)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(isSelected ? BrandTheme.celestialSky.opacity(0.14) : .clear)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .listRowInsets(EdgeInsets(top: 1, leading: 6, bottom: 1, trailing: 6))
    }

    private func categoryRow(id: String, name: String, icon: String) -> some View {
        let isSelected = store.selectedCategory == id
        return Button {
            NativeAudioEngine.shared.playClickSound()
            store.selectedCategory = id
            syncSelectionAfterFilter()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundStyle(isSelected ? BrandTheme.celestialSky : inkSecondary)
                    .frame(width: 16)
                Text(name)
                    .font(.system(size: 13.5, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(inkPrimary)
                    .lineLimit(1)
                Spacer()
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(isSelected ? BrandTheme.celestialSky.opacity(0.14) : .clear)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .listRowInsets(EdgeInsets(top: 1, leading: 6, bottom: 1, trailing: 6))
    }

    // MARK: - Middle Column (Native Safe-Area CEFR Filter Strip + Blueprint List)

    private var blueprintListColumn: some View {
        let tips = store.filteredTips
        return Group {
            if tips.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.largeTitle)
                        .foregroundStyle(.secondary)
                    Text("No tactical blueprints match your filter")
                        .font(.headline)
                        .multilineTextAlignment(.center)
                    Button("Clear All Filters") {
                        store.resetFilters()
                        syncSelectionAfterFilter()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List(tips, selection: $store.selectedTipId) { tip in
                    let tierColor = BrandTheme.cefrColor(for: tip.level)
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Text(store.language(for: tip.languageId)?.flag ?? "🌐")
                            Text(tip.level)
                                .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2)
                                .foregroundStyle(tierColor)
                                .background(Capsule().fill(tierColor.opacity(0.15)))
                            Text(tip.category.displayName)
                                .font(.system(size: 12))
                                .foregroundStyle(.secondary)
                            Spacer()
                            if store.isBookmarked(tip.id) {
                                Image(systemName: "bookmark.fill")
                                    .font(.system(size: 11.5))
                                    .foregroundStyle(BrandTheme.celestialSky)
                            }
                            if store.isMastered(tip.id) {
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 11.5))
                                    .foregroundStyle(BrandTheme.emeraldMint)
                            }
                        }
                        Text(tip.title)
                            .font(.system(size: 14.5, weight: .semibold))
                            .lineLimit(2)
                        Text(tip.summary)
                            .font(.system(size: 12.5))
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                    .padding(.vertical, 5)
                    .tag(tip.id)
                }
            }
        }
        .safeAreaInset(edge: .top, spacing: 0) {
            VStack(spacing: 0) {
                cefrFilterStrip
                Divider()
            }
            .background(.bar)
        }
    }

    private var cefrFilterStrip: some View {
        FlowLayout(spacing: 5, lineSpacing: 5) {
            cefrPill(id: "ALL", title: "All", count: store.tipsCountByLevel["ALL", default: 0], tint: BrandTheme.celestialSky)
            ForEach(CEFRLevel.allCases) { lvl in
                cefrPill(
                    id: lvl.rawValue,
                    title: lvl.rawValue,
                    count: store.tipsCountByLevel[lvl.rawValue, default: 0],
                    tint: BrandTheme.cefrColor(for: lvl.rawValue)
                )
            }
            if store.hasActiveFilters {
                Button {
                    store.resetFilters()
                    syncSelectionAfterFilter()
                } label: {
                    Label("Reset", systemImage: "xmark.circle.fill")
                        .font(.system(size: 10.5, weight: .semibold))
                        .foregroundStyle(.red)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(Color.red.opacity(0.12)))
                        .fixedSize()
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func cefrPill(id: String, title: String, count: Int, tint: Color) -> some View {
        let isSelected = store.activeLevel == id
        return Button {
            NativeAudioEngine.shared.playClickSound()
            store.activeLevel = id
            syncSelectionAfterFilter()
        } label: {
            HStack(spacing: 3.5) {
                Text(title)
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                Text("\(count)")
                    .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                    .monospacedDigit()
                    .opacity(0.78)
            }
            .padding(.horizontal, 8.5)
            .padding(.vertical, 4.5)
            .background(
                Capsule()
                    .fill(isSelected ? tint.opacity(0.22) : Color.primary.opacity(0.05))
            )
            .overlay(
                Capsule()
                    .strokeBorder(isSelected ? tint.opacity(0.6) : Color.primary.opacity(0.08), lineWidth: 1)
            )
            .foregroundStyle(isSelected ? tint : .primary)
            .fixedSize()
        }
        .buttonStyle(.plain)
    }

    // MARK: - Detail Column

    private var detailColumn: some View {
        VStack(spacing: 0) {
            if store.shouldShowUpdateBanner, let update = store.availableUpdate {
                UpdateNotificationBanner(store: store, update: update)
                Divider()
            }

            if let selectedId = store.selectedTipId,
               let tip = store.bundle.tips.first(where: { $0.id == selectedId }) {
                TipDetailView(store: store, tip: tip)
            } else if let first = store.filteredTips.first {
                TipDetailView(store: store, tip: first)
            } else {
                ContentUnavailableView(
                    "Select a Tactical Blueprint",
                    systemImage: "book.pages",
                    description: Text("Choose a language and CEFR tier on the left to inspect its golden rule, phonetics, and audio examples.")
                )
            }
        }
    }

    private func syncSelectionAfterFilter() {
        let filtered = store.filteredTips
        if let current = store.selectedTipId, filtered.contains(where: { $0.id == current }) {
            return
        }
        store.selectedTipId = filtered.first?.id
    }
}
