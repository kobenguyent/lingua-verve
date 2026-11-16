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

        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 10) {
                Image(systemName: "exclamationmark.shield.fill")
                    .font(.title2)
                    .foregroundStyle(BrandTheme.champagneGold)
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 10).fill(BrandTheme.champagneGold.opacity(0.14)))
                VStack(alignment: .leading, spacing: 3) {
                    Text("False Friends & Deceptive Cognates")
                        .font(.system(size: 20, weight: .bold, design: .serif))
                    Text("High-risk traps where German & English lookalikes mean completely different things.")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                Button("Close") { dismiss() }
                    .keyboardShortcut(.cancelAction)
            }

            HStack(spacing: 10) {
                TextField("Search false friends (e.g. Gift, bekommen, aktuell, Chef)...", text: $query)
                    .textFieldStyle(.roundedBorder)

                Picker("Language", selection: $languageFilter) {
                    Text("All").tag("all")
                    Text("🇩🇪 German").tag("german")
                    Text("🇬🇧 English").tag("english")
                }
                .labelsHidden()
                .pickerStyle(.segmented)
                .frame(width: 220)
            }

            if items.isEmpty {
                ContentUnavailableView(
                    "No Matching False Friends",
                    systemImage: "magnifyingglass",
                    description: Text("Try searching another cognate like 'Gift', 'bekommen', or 'aktuell'.")
                )
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 10) {
                        ForEach(items) { item in
                            VStack(alignment: .leading, spacing: 7) {
                                FlowLayout(spacing: 8, lineSpacing: 4) {
                                    Text(item.word)
                                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                                        .fixedSize()
                                    Text("≠ \(item.confusedWith)")
                                        .font(.system(size: 12.5, weight: .bold))
                                        .foregroundStyle(.red)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill(Color.red.opacity(0.12)))
                                        .fixedSize()
                                    Text("✓ \(item.actualMeaning)")
                                        .font(.system(size: 12.5, weight: .bold))
                                        .foregroundStyle(BrandTheme.emeraldMint)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.12)))
                                        .fixedSize()
                                    Button {
                                        NativeAudioEngine.shared.speak(item.word, languageId: item.languageId)
                                    } label: {
                                        Label("Hear", systemImage: "speaker.wave.2.fill")
                                            .font(.system(size: 12, weight: .semibold))
                                    }
                                    .buttonStyle(.bordered)
                                    .controlSize(.small)
                                    .fixedSize()
                                }

                                Text("❌ Trap: \(item.mistakeExample)")
                                    .font(.system(size: 13))
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                                Text("✅ Say instead: \(item.correctAlternative)")
                                    .font(.system(size: 13, weight: .medium))
                                    .fixedSize(horizontal: false, vertical: true)
                                Text("🧠 Memory Hack: \(item.memoryHack)")
                                    .font(.system(size: 13))
                                    .foregroundStyle(.orange)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(Color.primary.opacity(0.04))
                            )
                        }
                    }
                    .padding(.trailing, 4)
                }
            }
        }
        .padding(22)
        .frame(minWidth: 480, idealWidth: 680, maxWidth: 820, minHeight: 440, idealHeight: 560, maxHeight: 740)
    }
}
