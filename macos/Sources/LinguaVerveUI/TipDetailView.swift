import SwiftUI
import LinguaVerveCore

#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

public enum PlatformClipboard {
    public static func copy(_ text: String) {
        #if os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        #elseif canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
    }
}

public struct TipDetailView: View {
    @Bindable var store: CurriculumStore
    let tip: TipItem
    @State private var copied: Bool = false

    public init(store: CurriculumStore, tip: TipItem) {
        self.store = store
        self.tip = tip
    }

    public var body: some View {
        let isBookmarked = store.isBookmarked(tip.id)
        let isMastered = store.isMastered(tip.id)
        let lang = store.language(for: tip.languageId)
        let levelDetail = store.levelDetail(for: tip.level)
        let tierColor = BrandTheme.cefrColor(for: tip.level)

        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 10) {
                        timeCommitmentLabel
                        Spacer()
                        actionButtons(isBookmarked: isBookmarked, isMastered: isMastered)
                    }
                    VStack(alignment: .leading, spacing: 8) {
                        timeCommitmentLabel
                        FlowLayout(spacing: 8, lineSpacing: 6) {
                            actionButtons(isBookmarked: isBookmarked, isMastered: isMastered)
                        }
                    }
                }

                FlowLayout(spacing: 8, lineSpacing: 6) {
                    Text("\(lang?.flag ?? "🌐") \(lang?.name ?? "Polyglot Meta")")
                        .scaledFont(size: 12.5, weight: .semibold)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.primary.opacity(0.07)))
                        .fixedSize()

                    Text(levelDetail != nil ? "\(tip.level) · \(levelDetail!.badge)" : "All Levels")
                        .scaledFont(size: 12.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .foregroundStyle(tierColor)
                        .background(Capsule().fill(tierColor.opacity(0.14)))
                        .fixedSize()

                    Label(tip.category.displayName, systemImage: tip.category.systemImage)
                        .scaledFont(size: 12.5, weight: .medium)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .foregroundStyle(.secondary)
                        .background(Capsule().fill(Color.primary.opacity(0.05)))
                        .fixedSize()
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text(tip.title)
                        .scaledFont(size: 24, weight: .bold, design: .serif)
                        .textSelection(.enabled)
                    Text(tip.summary)
                        .scaledFont(size: 15)
                        .foregroundStyle(.secondary)
                        .lineSpacing(4)
                        .textSelection(.enabled)
                }

                HStack(spacing: 0) {
                    Rectangle().fill(BrandTheme.champagneGold).frame(width: 4)
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "lightbulb.max.fill")
                            .foregroundStyle(BrandTheme.champagneGold)
                            .scaledFont(size: 18)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("GOLDEN POLYGLOT RULE")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .foregroundStyle(BrandTheme.champagneGold)
                            Text(tip.goldenRule)
                                .scaledFont(size: 14.5, weight: .semibold)
                                .lineSpacing(3)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .background(RoundedRectangle(cornerRadius: 11).fill(BrandTheme.champagneGold.opacity(0.10)))
                .clipShape(RoundedRectangle(cornerRadius: 11))

                if let diagram = tip.diagramType {
                    DiagramsView(diagramType: diagram, languageId: tip.languageId)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("ACTIONABLE TACTICS")
                        .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                        .foregroundStyle(.secondary)

                    ForEach(Array(tip.tactics.enumerated()), id: \.offset) { idx, tactic in
                        HStack(alignment: .top, spacing: 10) {
                            Text("\(idx + 1)")
                                .scaledFont(size: 12, weight: .bold, design: .monospaced)
                                .frame(width: 24, height: 24)
                                .background(Circle().fill(BrandTheme.celestialSky.opacity(0.14)))
                                .foregroundStyle(BrandTheme.celestialSky)
                            Text(tactic)
                                .scaledFont(size: 14)
                                .lineSpacing(3)
                        }
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.03)))

                if let examples = tip.examples, !examples.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("TARGET EXAMPLES · TAP TO HEAR")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Toggle("0.75x", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                                .toggleStyle(.switch)
                                .labelsHidden()
                            Text("0.75x")
                                .scaledFont(size: 11, design: .monospaced)
                                .foregroundStyle(.secondary)
                        }

                        ForEach(Array(examples.enumerated()), id: \.offset) { _, ex in
                            let isSpeaking = NativeAudioEngine.shared.currentlySpeakingText == ex.speakablePhrase
                            HStack(alignment: .center, spacing: 10) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(ex.source)
                                        .scaledFont(size: 14, weight: .semibold, design: .monospaced)
                                    Text(ex.explanation)
                                        .scaledFont(size: 12.5)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer(minLength: 6)
                                Button {
                                    NativeAudioEngine.shared.speak(ex.speakablePhrase, languageId: tip.languageId)
                                } label: {
                                    Label(isSpeaking ? "Playing" : "Listen", systemImage: isSpeaking ? "waveform" : "speaker.wave.2.fill")
                                        .scaledFont(size: 12, weight: .semibold)
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(isSpeaking ? BrandTheme.champagneGold : BrandTheme.celestialSky)
                                .controlSize(.small)
                            }
                            .padding(12)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                        }
                    }
                }

                if !tip.commonPitfall.isEmpty {
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.red)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("COMMON PITFALL")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .foregroundStyle(.red)
                            Text(tip.commonPitfall)
                                .scaledFont(size: 13.5)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 11).fill(Color.red.opacity(0.08)))
                }

                if let tools = tip.recommendedTools, !tools.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("CURATED TOOLS")
                            .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                            .foregroundStyle(.secondary)
                        FlowLayout(spacing: 8, lineSpacing: 6) {
                            ForEach(tools, id: \.name) { tool in
                                if let url = URL(string: tool.url) {
                                    Link(destination: url) {
                                        Label(tool.name, systemImage: "arrow.up.right.square")
                                            .scaledFont(size: 12.5, weight: .semibold)
                                    }
                                    .buttonStyle(.bordered)
                                }
                            }
                        }
                    }
                }
            }
            .padding(20)
            .frame(maxWidth: 860, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .center)
        }
    }

    private var timeCommitmentLabel: some View {
        Label(tip.timeCommitment, systemImage: "clock")
            .scaledFont(size: 12.5, design: .monospaced)
            .foregroundStyle(.secondary)
    }

    @ViewBuilder
    private func actionButtons(isBookmarked: Bool, isMastered: Bool) -> some View {
        Button {
            NativeAudioEngine.shared.playClickSound()
            PlatformClipboard.copy("\(tip.title) — \(tip.goldenRule)\n(LinguaVerve)")
            copied = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) { copied = false }
        } label: {
            Label(copied ? "Copied" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
                .scaledFont(size: 12, weight: .medium)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)

        Button {
            NativeAudioEngine.shared.playClickSound()
            store.toggleBookmark(tip.id)
        } label: {
            Label(isBookmarked ? "Saved" : "Save", systemImage: isBookmarked ? "bookmark.fill" : "bookmark")
                .scaledFont(size: 12, weight: .medium)
        }
        .buttonStyle(.bordered)
        .tint(isBookmarked ? BrandTheme.celestialSky : nil)
        .controlSize(.small)

        Button {
            let nowMastered = store.toggleMastered(tip.id)
            if nowMastered {
                NativeAudioEngine.shared.playSuccessChime()
            } else {
                NativeAudioEngine.shared.playClickSound()
            }
        } label: {
            Label(
                isMastered ? "Mastered" : "Master",
                systemImage: isMastered ? "checkmark.seal.fill" : "checkmark.seal"
            )
            .scaledFont(size: 12, weight: .semibold)
        }
        .buttonStyle(.borderedProminent)
        .tint(isMastered ? BrandTheme.emeraldMint : .accentColor)
        .controlSize(.small)
    }
}
