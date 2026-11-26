import SwiftUI
import LinguaVerveCore

/// Adaptive Field Manual workspace displaying LinguaVerve's tactical blueprints,
/// SVG visual models, and phonetic audio examples on MacBook, iPad, and iPhone.
public struct FieldManualView: View {
    @Bindable var store: CurriculumStore

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Compact Filter Bar (Language + CEFR Tier + View Mode)
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Picker("Language", selection: $store.activeLanguageId) {
                        Text("🌐 All").tag("all")
                        ForEach(store.bundle.languages.filter(\.isActive)) { lang in
                            Text("\(lang.flag) \(lang.name)").tag(lang.id)
                        }
                    }
                    .pickerStyle(.menu)

                    Picker("View", selection: $store.viewMode) {
                        ForEach(ViewModeFilter.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.menu)

                    Spacer()

                    if store.hasActiveFilters {
                        Button("Reset") {
                            store.resetFilters()
                        }
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(.red)
                    }
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        levelChip(id: "ALL", title: "All (\(store.tipsCountByLevel["ALL", default: 0]))", tint: BrandTheme.celestialSky)
                        ForEach(CEFRLevel.allCases) { lvl in
                            levelChip(
                                id: lvl.rawValue,
                                title: "\(lvl.rawValue) (\(store.tipsCountByLevel[lvl.rawValue, default: 0]))",
                                tint: BrandTheme.cefrColor(for: lvl.rawValue)
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.bar)

            Divider()

            let tips = store.filteredTips
            if tips.isEmpty {
                ContentUnavailableView(
                    "No Matching Blueprints",
                    systemImage: "magnifyingglass",
                    description: Text("Try clearing filters or searching another tactic.")
                )
            } else {
                List(tips) { tip in
                    NavigationLink {
                        TipDetailView(store: store, tip: tip)
                            .navigationTitle(tip.level)
                    } label: {
                        let tierColor = BrandTheme.cefrColor(for: tip.level)
                        VStack(alignment: .leading, spacing: 5) {
                            HStack(spacing: 6) {
                                Text(store.language(for: tip.languageId)?.flag ?? "🌐")
                                Text(tip.level)
                                    .scaledFont(size: 11, weight: .bold, design: .monospaced)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .foregroundStyle(tierColor)
                                    .background(Capsule().fill(tierColor.opacity(0.15)))
                                Text(tip.category.displayName)
                                    .scaledFont(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                if store.isBookmarked(tip.id) {
                                    Image(systemName: "bookmark.fill")
                                        .scaledFont(.caption)
                                        .foregroundStyle(BrandTheme.celestialSky)
                                }
                                if store.isMastered(tip.id) {
                                    Image(systemName: "checkmark.seal.fill")
                                        .scaledFont(.caption)
                                        .foregroundStyle(BrandTheme.emeraldMint)
                                }
                            }
                            Text(tip.title)
                                .scaledFont(.headline)
                            Text(tip.summary)
                                .scaledFont(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .searchable(text: $store.searchQuery, prompt: "Search tactics, phonetics, grammar...")
    }

    private func levelChip(id: String, title: String, tint: Color) -> some View {
        let selected = store.activeLevel == id
        return Button {
            NativeAudioEngine.shared.playClickSound()
            store.activeLevel = id
        } label: {
            Text(title)
                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                .padding(.horizontal, 9)
                .padding(.vertical, 5)
                .background(Capsule().fill(selected ? tint.opacity(0.22) : Color.primary.opacity(0.06)))
                .foregroundStyle(selected ? tint : .primary)
        }
        .buttonStyle(.plain)
    }
}
