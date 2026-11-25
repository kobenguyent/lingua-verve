import SwiftUI
import LinguaVerveCore

public struct FalseFriendsView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss
    @State private var query: String = ""
    @State private var languageFilter: String = "all"

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let items = store.filteredFalseFriends(query: query, languageId: languageFilter)

        NavigationStack {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    TextField("Search (Gift, bekommen, aktuell, Chef)...", text: $query)
                        .textFieldStyle(.roundedBorder)

                    Picker("Language", selection: $languageFilter) {
                        Text("All").tag("all")
                        Text("🇩🇪 DE").tag("german")
                        Text("🇬🇧 EN").tag("english")
                    }
                    .labelsHidden()
                    .pickerStyle(.segmented)
                    .frame(maxWidth: 190)
                }

                if items.isEmpty {
                    ContentUnavailableView(
                        "No Matching False Friends",
                        systemImage: "magnifyingglass",
                        description: Text("Try searching 'Gift', 'bekommen', or 'aktuell'.")
                    )
                } else {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 10) {
                            ForEach(items) { item in
                                VStack(alignment: .leading, spacing: 7) {
                                    FlowLayout(spacing: 8, lineSpacing: 4) {
                                        Text(item.word)
                                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                                        Text("≠ \(item.confusedWith)")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundStyle(.red)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 3)
                                            .background(Capsule().fill(Color.red.opacity(0.12)))
                                        Text("✓ \(item.actualMeaning)")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundStyle(BrandTheme.emeraldMint)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 3)
                                            .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.12)))
                                        Button {
                                            NativeAudioEngine.shared.speak(item.word, languageId: item.languageId)
                                        } label: {
                                            Label("Hear", systemImage: "speaker.wave.2.fill")
                                                .font(.system(size: 12, weight: .semibold))
                                        }
                                        .buttonStyle(.bordered)
                                        .controlSize(.small)
                                    }

                                    Text("❌ Trap: \(item.mistakeExample)")
                                        .font(.system(size: 13))
                                        .foregroundStyle(.secondary)
                                    Text("✅ Say instead: \(item.correctAlternative)")
                                        .font(.system(size: 13, weight: .medium))
                                    Text("🧠 Hack: \(item.memoryHack)")
                                        .font(.system(size: 13))
                                        .foregroundStyle(.orange)
                                }
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                            }
                        }
                    }
                }
            }
            .padding(16)
            .navigationTitle("False Friends")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 500, idealWidth: 680, minHeight: 460, idealHeight: 560)
        #endif
    }
}
