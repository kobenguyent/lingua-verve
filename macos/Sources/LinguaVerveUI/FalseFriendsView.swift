import SwiftUI
import LinguaVerveCore

public struct FalseFriendsView: View {
    private enum FalseFriendLanguageFilter: String, CaseIterable, Identifiable, Hashable {
        case all
        case german
        case english

        var id: String { rawValue }

        var title: String {
            switch self {
            case .all: return "All"
            case .german: return "🇩🇪 DE"
            case .english: return "🇬🇧 EN"
            }
        }
    }

    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss
    @Environment(\.appFontScale) private var fontScale
    @State private var query: String = ""
    @State private var languageFilter: String = "all"

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let items = store.filteredFalseFriends(query: query, languageId: languageFilter)
        let filterBinding = Binding<FalseFriendLanguageFilter>(
            get: { FalseFriendLanguageFilter(rawValue: languageFilter) ?? .all },
            set: { languageFilter = $0.rawValue }
        )

        NavigationStack {
            ZStack {
                GoldenGateEditorialBackdrop()

                VStack(alignment: .leading, spacing: 16) {
                    ViewThatFits(in: .horizontal) {
                        HStack(spacing: 12) {
                            searchInput
                            GoldenGateSegmentedControl(
                                items: FalseFriendLanguageFilter.allCases,
                                selection: filterBinding
                            ) { option, selected in
                                Text(option.title)
                                    .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                            }
                        }

                        VStack(alignment: .leading, spacing: 10) {
                            searchInput
                            GoldenGateSegmentedControl(
                                items: FalseFriendLanguageFilter.allCases,
                                selection: filterBinding
                            ) { option, selected in
                                Text(option.title)
                                    .scaledFont(.footnote, weight: selected ? .semibold : .medium)
                            }
                        }
                    }

                    GoldenGateSectionHairline()

                    if items.isEmpty {
                        ContentUnavailableView(
                            "No Matching False Friends",
                            systemImage: "magnifyingglass",
                            description: Text("Try searching 'Gift', 'bekommen', or 'aktuell'.")
                        )
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 12) {
                                ForEach(items) { item in
                                    VStack(alignment: .leading, spacing: 10) {
                                        FlowLayout(spacing: 8, lineSpacing: 6) {
                                            Text(item.word)
                                                .scaledFont(.headline, weight: .bold, design: .monospaced)

                                            Label("≠ \(item.confusedWith)", systemImage: "xmark.circle.fill")
                                                .scaledFont(.caption, weight: .bold)
                                                .foregroundStyle(.red)
                                                .padding(.horizontal, 9)
                                                .padding(.vertical, 4)
                                                .background(Capsule().fill(Color.red.opacity(0.12)))

                                            Label(item.actualMeaning, systemImage: "checkmark.circle.fill")
                                                .scaledFont(.caption, weight: .bold)
                                                .foregroundStyle(BrandTheme.emeraldMint)
                                                .padding(.horizontal, 9)
                                                .padding(.vertical, 4)
                                                .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.12)))

                                            Button {
                                                NativeAudioEngine.shared.speak(item.word, languageId: item.languageId)
                                            } label: {
                                                Label("Hear", systemImage: "speaker.wave.2.fill")
                                            }
                                            .buttonStyle(GoldenGateGlassPillButtonStyle())
                                        }

                                        VStack(alignment: .leading, spacing: 5) {
                                            Label("Trap: \(item.mistakeExample)", systemImage: "exclamationmark.triangle.fill")
                                                .scaledFont(.subheadline)
                                                .foregroundStyle(.secondary)
                                            Label("Say instead: \(item.correctAlternative)", systemImage: "checkmark.seal.fill")
                                                .scaledFont(.subheadline, weight: .medium)
                                                .foregroundStyle(.primary)
                                            Label("Hack: \(item.memoryHack)", systemImage: "lightbulb.fill")
                                                .scaledFont(.subheadline)
                                                .foregroundStyle(BrandTheme.deepGold)
                                        }
                                    }
                                    .padding(16)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                                }
                            }
                        }
                    }
                }
                .padding(20)
            }
            .navigationTitle("False Friends")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 540, idealWidth: 720, minHeight: 480, idealHeight: 600)
        #endif
    }

    private var searchInput: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
            TextField("Search (Gift, bekommen, aktuell, Chef)…", text: $query)
                .textFieldStyle(.plain)
                .scaledFont(.subheadline)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .goldenGateSurface(cornerRadius: 10)
    }
}
