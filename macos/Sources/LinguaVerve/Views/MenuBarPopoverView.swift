import SwiftUI
import LinguaVerveCore

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
                    .font(.system(size: 15, weight: .bold, design: .serif))
                Spacer()
                Picker("Mode", selection: $mode) {
                    Text("Tactic").tag(0)
                    Text("False Friend").tag(1)
                }
                .labelsHidden()
                .pickerStyle(.segmented)
                .frame(width: 175)
            }

            Divider()

            if mode == 0 {
                let tip = currentTip ?? store.randomTip()
                if let tip {
                    VStack(alignment: .leading, spacing: 9) {
                        HStack {
                            Text("\(tip.level) · \(tip.category.displayName)")
                                .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2.5)
                                .background(Capsule().fill(Color.accentColor.opacity(0.15)))
                            Spacer()
                            Text(tip.timeCommitment)
                                .font(.system(size: 11.5, design: .monospaced))
                                .foregroundStyle(.secondary)
                        }

                        Text(tip.title)
                            .font(.system(size: 14.5, weight: .bold))
                            .fixedSize(horizontal: false, vertical: true)

                        Text("💡 \(tip.goldenRule)")
                            .font(.system(size: 13))
                            .lineSpacing(2)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 8).fill(BrandTheme.champagneGold.opacity(0.12)))

                        if let ex = tip.examples?.first {
                            HStack(spacing: 8) {
                                Text(ex.source)
                                    .font(.system(size: 13, design: .monospaced))
                                    .fixedSize(horizontal: false, vertical: true)
                                Spacer()
                                Button {
                                    NativeAudioEngine.shared.speak(ex.speakablePhrase, languageId: tip.languageId)
                                } label: {
                                    Label("Speak", systemImage: "speaker.wave.2.fill")
                                        .font(.system(size: 12, weight: .semibold))
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
                                    .font(.system(size: 12.5))
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
                                .font(.system(size: 12.5))
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
                                .font(.system(size: 14.5, weight: .bold, design: .monospaced))
                            Text("≠ \(ff.confusedWith)")
                                .font(.system(size: 12.5, weight: .bold))
                                .foregroundStyle(.red)
                            Text("✓ \(ff.actualMeaning)")
                                .font(.system(size: 12.5, weight: .bold))
                                .foregroundStyle(BrandTheme.emeraldMint)
                            Button {
                                NativeAudioEngine.shared.speak(ff.word, languageId: ff.languageId)
                            } label: {
                                Image(systemName: "speaker.wave.2.fill")
                            }
                            .controlSize(.small)
                        }

                        Text("🧠 \(ff.memoryHack)")
                            .font(.system(size: 13))
                            .lineSpacing(2)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)

                        Button {
                            NativeAudioEngine.shared.playClickSound()
                            currentFalseFriend = store.bundle.falseFriends.randomElement()
                        } label: {
                            Label("Next False Friend", systemImage: "shuffle")
                                .font(.system(size: 12.5))
                        }
                        .controlSize(.regular)
                    }
                }
            }

            Divider()

            HStack {
                Button {
                    openWindow(id: "main")
                    NSApp.activate(ignoringOtherApps: true)
                } label: {
                    Label("Open Workspace", systemImage: "macwindow")
                        .font(.system(size: 12.5))
                }
                .controlSize(.regular)

                Button {
                    openWindow(id: "main")
                    NSApp.activate(ignoringOtherApps: true)
                    Task { await store.checkForUpdates(manual: true) }
                } label: {
                    Label(
                        store.isUpdateAvailable ? "Update (v\(store.availableUpdate?.latestVersion ?? ""))" : "Updates",
                        systemImage: store.isUpdateAvailable ? "arrow.down.circle.fill" : "arrow.triangle.2.circlepath"
                    )
                    .font(.system(size: 12.5))
                }
                .controlSize(.regular)

                Spacer()
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                .font(.system(size: 12.5))
                .controlSize(.regular)
                .foregroundStyle(.secondary)
            }
        }
        .padding(16)
        .frame(width: 390)
    }
}
