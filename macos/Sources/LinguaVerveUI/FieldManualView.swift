import SwiftUI
import LinguaVerveCore

/// Adaptive Field Manual workspace displaying LinguaVerve's tactical blueprints,
/// SVG visual models, and phonetic audio examples on MacBook, iPad, and iPhone.
public struct FieldManualView: View {
    private enum ManualLevelFilter: String, CaseIterable, Identifiable, Hashable {
        case all = "ALL"
        case a1 = "A1"
        case a2 = "A2"
        case b1 = "B1"
        case b2 = "B2"
        case c1 = "C1"
        case c2 = "C2"

        var id: String { rawValue }

        var shortTitle: String {
            self == .all ? "All" : rawValue
        }

        var tint: Color {
            self == .all ? BrandTheme.editorialBlue : BrandTheme.cefrColor(for: rawValue)
        }

        static func resolve(_ raw: String) -> ManualLevelFilter {
            ManualLevelFilter(rawValue: raw) ?? .all
        }
    }

    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let tips = store.filteredTips
        let levelBinding = Binding<ManualLevelFilter>(
            get: { ManualLevelFilter.resolve(store.activeLevel) },
            set: { store.activeLevel = $0.rawValue }
        )

        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    // Unboxed Editorial Header + Menu Filters
                    ViewThatFits(in: .horizontal) {
                        HStack(alignment: .bottom, spacing: 14) {
                            manualHeader(count: tips.count)
                            Spacer(minLength: 12)
                            filterMenuControls
                        }
                        VStack(alignment: .leading, spacing: 12) {
                            manualHeader(count: tips.count)
                            filterMenuControls
                        }
                    }

                    GoldenGateSegmentedControl(
                        items: ManualLevelFilter.allCases,
                        selection: levelBinding,
                        accent: levelBinding.wrappedValue.tint,
                        allowHorizontalScroll: true
                    ) { level, selected in
                        let count = store.tipsCountByLevel[level.rawValue, default: 0]
                        Text("\(level.shortTitle) (\(count))")
                            .scaledFont(.footnote, weight: selected ? .bold : .medium, design: .monospaced, monospacedDigit: true)
                    }

                    GoldenGateSectionHairline()

                    if tips.isEmpty {
                        VStack(spacing: 12) {
                            ContentUnavailableView(
                                "No Matching Blueprints",
                                systemImage: "magnifyingglass",
                                description: Text("Try clearing filters or searching another tactic.")
                            )
                            if store.hasActiveFilters {
                                Button("Clear Filters") {
                                    NativeAudioEngine.shared.playClickSound()
                                    store.resetFilters()
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle())
                            }
                        }
                        .padding(32)
                        .frame(maxWidth: .infinity)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                    } else {
                        LazyVGrid(
                            columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(340, scale: fontScale)), spacing: 14)],
                            spacing: 14
                        ) {
                            ForEach(tips) { tip in
                                NavigationLink {
                                    TipDetailView(store: store, tip: tip)
                                        .navigationTitle(tip.level)
                                } label: {
                                    tipCard(tip)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
                .animation(GoldenGateMetrics.contentFade, value: tips.map(\.id))
            }
        }
        .searchable(text: $store.searchQuery, prompt: "Search tactics, phonetics, grammar…")
    }

    private func manualHeader(count: Int) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Polyglot Reference")
                .scaledFont(.footnote, weight: .semibold)
                .foregroundStyle(BrandTheme.editorialBlue)
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Text("Field Manual")
                    .scaledFont(.largeTitle, weight: .bold, design: .serif)
                Text("\(count) blueprint\(count == 1 ? "" : "s")")
                    .scaledFont(.footnote, design: .monospaced, monospacedDigit: true)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var filterMenuControls: some View {
        let languageOptions = [
            GoldenGateDropdownOption(value: "all", title: "🌐 All Languages")
        ] + store.bundle.languages.filter(\.isActive).map { lang in
            GoldenGateDropdownOption(value: lang.id, title: "\(lang.flag) \(lang.name)")
        }
        let viewOptions = ViewModeFilter.allCases.map { mode in
            GoldenGateDropdownOption(value: mode, title: mode.rawValue)
        }

        return FlowLayout(spacing: 8, lineSpacing: 8) {
            GoldenGateDropdownMenu(
                title: "Language",
                leadingIcon: "globe",
                options: languageOptions,
                selection: $store.activeLanguageId
            )

            GoldenGateDropdownMenu(
                title: "View Mode",
                leadingIcon: "line.3.horizontal.decrease.circle",
                options: viewOptions,
                selection: $store.viewMode
            )

            if store.hasActiveFilters {
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    store.resetFilters()
                } label: {
                    Label("Reset", systemImage: "xmark.circle")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle(accent: .red))
            }
        }
    }

    private func tipCard(_ tip: TipItem) -> some View {
        let tierColor = BrandTheme.cefrColor(for: tip.level)
        let flag = store.language(for: tip.languageId)?.flag ?? "🌐"

        return VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text(flag)
                    .scaledFont(.subheadline)
                Text(tip.level)
                    .scaledFont(.caption2, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .foregroundStyle(tierColor)
                    .background(Capsule().fill(tierColor.opacity(0.14)))
                Text(tip.category.displayName)
                    .scaledFont(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                if store.isBookmarked(tip.id) {
                    Image(systemName: "bookmark.fill")
                        .scaledFont(.caption)
                        .foregroundStyle(BrandTheme.editorialBlue)
                }
                if store.isMastered(tip.id) {
                    Image(systemName: "checkmark.seal.fill")
                        .scaledFont(.caption)
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }

            Text(tip.title)
                .scaledFont(.headline, weight: .bold, design: .serif)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)

            Text(tip.summary)
                .scaledFont(.subheadline)
                .foregroundStyle(.secondary)
                .lineSpacing(3)
                .lineLimit(3)

            Spacer(minLength: 0)

            HStack {
                Label(tip.timeCommitment, systemImage: "clock")
                    .scaledFont(.caption2, design: .monospaced)
                    .foregroundStyle(.tertiary)
                Spacer()
                Image(systemName: "chevron.right")
                    .scaledFont(.caption2, weight: .semibold)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, interactive: true)
        .contentShape(Rectangle())
    }
}
