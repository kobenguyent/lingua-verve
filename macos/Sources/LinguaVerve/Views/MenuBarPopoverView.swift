import SwiftUI
import LinguaVerveCore
import LinguaVerveUI

public struct MenuBarPopoverView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.openWindow) private var openWindow
    @State private var currentTip: TipItem?
    @State private var currentFalseFriend: FalseFriendItem?
    @State private var mode: Int = 0 // 0 = Daily Tip, 1 = False Friend Flash Drill

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                BrandCrestView(size: 24)
                Text("LinguaVerve")
                    .scaledFont(size: 15, weight: .bold, design: .serif)
                Spacer()
                Picker("Mode", selection: $mode) {
                    Text("Tactic").tag(0)
                    Text("False Friend").tag(1)
                }
                .labelsHidden()
                .pickerStyle(.segmented)
                .frame(minWidth: 165, maxWidth: AppTypography.scaledControlWidth(195, scale: CGFloat(store.fontScale), maxCap: 245))
            }

            Divider()

            if mode == 0 {
                let tip = currentTip ?? store.randomTip()
                if let tip {
                    VStack(alignment: .leading, spacing: 9) {
                        HStack {
                            Text("\(tip.level) · \(tip.category.displayName)")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2.5)
                                .background(Capsule().fill(Color.accentColor.opacity(0.15)))
                            Spacer()
                            Text(tip.timeCommitment)
                                .scaledFont(size: 11.5, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }

                        Text(tip.title)
                            .scaledFont(size: 14.5, weight: .bold)
                            .fixedSize(horizontal: false, vertical: true)

                        Text("💡 \(tip.goldenRule)")
                            .scaledFont(size: 13)
                            .lineSpacing(2)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 8).fill(BrandTheme.champagneGold.opacity(0.12)))

                        if let ex = tip.examples?.first {
                            HStack(spacing: 8) {
                                Text(ex.source)
                                    .scaledFont(size: 13, design: .monospaced)
                                    .fixedSize(horizontal: false, vertical: true)
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.speak(ex.speakablePhrase, languageId: tip.languageId)
                                } label: {
                                    Label("Speak", systemImage: "speaker.wave.2.fill")
                                        .scaledFont(size: 12, weight: .semibold)
                                }
                                .buttonStyle(.borderedProminent)
                                .controlSize(.small)
                                .fixedSize()
                            }
                        }

                        HStack {
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                currentTip = store.randomTip()
                            } label: {
                                Label("Next Tip", systemImage: "shuffle")
                                    .scaledFont(size: 12.5)
                            }
                            .controlSize(.regular)

                            Spacer()

                            Button {
                                _ = store.toggleMastered(tip.id)
                                NativeAudioEngine.shared.playSuccessChime()
                            } label: {
                                Label(
                                    store.isMastered(tip.id) ? "Mastered" : "Master",
                                    systemImage: store.isMastered(tip.id) ? "checkmark.seal.fill" : "checkmark.seal"
                                )
                                .scaledFont(size: 12.5)
                            }
                            .controlSize(.regular)
                        }
                    }
                }
            } else {
                let ff = currentFalseFriend ?? store.bundle.falseFriends.randomElement()
                if let ff {
                    VStack(alignment: .leading, spacing: 9) {
                        FlowLayout(spacing: 6, lineSpacing: 4) {
                            Text(ff.word)
                                .scaledFont(size: 14.5, weight: .bold, design: .monospaced)
                            Text("≠ \(ff.confusedWith)")
                                .scaledFont(size: 12.5, weight: .bold)
                                .foregroundStyle(.red)
                            Text("✓ \(ff.actualMeaning)")
                                .scaledFont(size: 12.5, weight: .bold)
                                .foregroundStyle(BrandTheme.emeraldMint)
                            Button {
                                NativeAudioEngine.shared.speak(ff.word, languageId: ff.languageId)
                            } label: {
                                Image(systemName: "speaker.wave.2.fill")
                            }
                            .controlSize(.small)
                        }

                        Text("🧠 \(ff.memoryHack)")
                            .scaledFont(size: 13)
                            .lineSpacing(2)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)

                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            currentFalseFriend = store.bundle.falseFriends.randomElement()
                        } label: {
                            Label("Next False Friend", systemImage: "shuffle")
                                .scaledFont(size: 12.5)
                        }
                        .controlSize(.regular)
                    }
                }
            }

            Divider()

            HStack {
                Button {
                    openWindow(id: "main")
                    #if os(macOS)
                    NSApp.activate(ignoringOtherApps: true)
                    #endif
                } label: {
                    Label("Open Workspace", systemImage: "macwindow")
                        .scaledFont(size: 12.5)
                }
                .controlSize(.regular)

                Button {
                    openWindow(id: "main")
                    #if os(macOS)
                    NSApp.activate(ignoringOtherApps: true)
                    #endif
                    Task { await store.checkForUpdates(manual: true) }
                } label: {
                    Label(
                        store.isUpdateAvailable ? "Update (v\(store.availableUpdate?.latestVersion ?? ""))" : "Updates",
                        systemImage: store.isUpdateAvailable ? "arrow.down.circle.fill" : "arrow.triangle.2.circlepath"
                    )
                    .scaledFont(size: 12.5)
                }
                .controlSize(.regular)

                Spacer()
                #if os(macOS)
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                .scaledFont(size: 12.5)
                .controlSize(.regular)
                .foregroundStyle(.secondary)
                #endif
            }
        }
        .padding(16)
        .frame(width: AppTypography.scaledControlWidth(410, scale: CGFloat(store.fontScale), maxCap: 500))
    }
}
