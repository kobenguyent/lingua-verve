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
    @Environment(\.appFontScale) private var fontScale
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

        ZStack {
            GoldenGateEditorialBackdrop()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    ViewThatFits(in: .horizontal) {
                        HStack(spacing: 12) {
                            timeCommitmentLabel
                            Spacer()
                            actionButtons(isBookmarked: isBookmarked, isMastered: isMastered)
                        }
                        VStack(alignment: .leading, spacing: 10) {
                            timeCommitmentLabel
                            FlowLayout(spacing: 8, lineSpacing: 6) {
                                actionButtons(isBookmarked: isBookmarked, isMastered: isMastered)
                            }
                        }
                    }

                    FlowLayout(spacing: 8, lineSpacing: 6) {
                        Text("\(lang?.flag ?? "🌐") \(lang?.name ?? "Polyglot Meta")")
                            .scaledFont(.caption, weight: .semibold)
                            .padding(.horizontal, 11)
                            .padding(.vertical, 5)
                            .goldenGateGlassPill()
                            .fixedSize()

                        Text(levelDetail != nil ? "\(tip.level) · \(levelDetail!.badge)" : "All Levels")
                            .scaledFont(.caption, weight: .bold, design: .monospaced)
                            .padding(.horizontal, 11)
                            .padding(.vertical, 5)
                            .foregroundStyle(tierColor)
                            .background(Capsule().fill(tierColor.opacity(0.14)))
                            .fixedSize()

                        Label(tip.category.displayName, systemImage: tip.category.systemImage)
                            .scaledFont(.caption, weight: .medium)
                            .padding(.horizontal, 11)
                            .padding(.vertical, 5)
                            .foregroundStyle(.secondary)
                            .goldenGateGlassPill()
                            .fixedSize()
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text(tip.title)
                            .scaledFont(.largeTitle, weight: .bold, design: .serif)
                            .textSelection(.enabled)
                            .fixedSize(horizontal: false, vertical: true)
                        Text(tip.summary)
                            .scaledFont(.body)
                            .foregroundStyle(.secondary)
                            .lineSpacing(4)
                            .textSelection(.enabled)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    GoldenGateSectionHairline()

                    HStack(spacing: 0) {
                        Rectangle().fill(BrandTheme.champagneGold).frame(width: 4)
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "lightbulb.max.fill")
                                .foregroundStyle(BrandTheme.champagneGold)
                                .scaledFont(.title3)
                            VStack(alignment: .leading, spacing: 5) {
                                Text("Golden Polyglot Rule")
                                    .scaledFont(.caption, weight: .bold, design: .monospaced)
                                    .foregroundStyle(BrandTheme.deepGold)
                                Text(tip.goldenRule)
                                    .scaledFont(.callout, weight: .semibold)
                                    .lineSpacing(3)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, tint: BrandTheme.champagneGold)

                    if let diagram = tip.diagramType {
                        DiagramsView(diagramType: diagram, languageId: tip.languageId)
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Actionable Tactics")
                            .scaledFont(.headline, weight: .semibold)

                        ForEach(Array(tip.tactics.enumerated()), id: \.offset) { idx, tactic in
                            HStack(alignment: .top, spacing: 12) {
                                let badgeSize = max(26, 26 * min(fontScale, 1.4))
                                Text("\(idx + 1)")
                                    .scaledFont(.caption, weight: .bold, design: .monospaced)
                                    .frame(width: badgeSize, height: badgeSize)
                                    .background(Circle().fill(BrandTheme.editorialBlue.opacity(0.14)))
                                    .foregroundStyle(BrandTheme.editorialBlue)
                                Text(tactic)
                                    .scaledFont(.body)
                                    .lineSpacing(4)
                            }
                        }
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)

                    if let examples = tip.examples, !examples.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Target Examples · Tap to Hear")
                                    .scaledFont(.headline, weight: .semibold)
                                Spacer()
                                Toggle("0.75x", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                                    .toggleStyle(.switch)
                                    .scaledFont(.caption, design: .monospaced)
                                    .fixedSize()
                            }

                            ForEach(Array(examples.enumerated()), id: \.offset) { _, ex in
                                let isSpeaking = NativeAudioEngine.shared.currentlySpeakingText == ex.speakablePhrase
                                HStack(alignment: .center, spacing: 12) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(ex.source)
                                            .scaledFont(.callout, weight: .semibold, design: .monospaced)
                                        Text(ex.explanation)
                                            .scaledFont(.subheadline)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer(minLength: 6)
                                    Button {
                                        NativeAudioEngine.shared.speak(ex.speakablePhrase, languageId: tip.languageId)
                                    } label: {
                                        HStack(spacing: 6) {
                                            GoldenGateAudioWaveView(
                                                isAnimating: isSpeaking,
                                                color: isSpeaking ? BrandTheme.champagneGold : BrandTheme.editorialBlue
                                            )
                                            Text(isSpeaking ? "Playing" : "Listen")
                                        }
                                    }
                                    .buttonStyle(
                                        GoldenGateGlassPillButtonStyle(
                                            isSelected: isSpeaking,
                                            accent: isSpeaking ? BrandTheme.champagneGold : BrandTheme.editorialBlue
                                        )
                                    )
                                }
                                .padding(14)
                                .goldenGateSurface(
                                    cornerRadius: GoldenGateMetrics.nestedCornerRadius,
                                    tint: isSpeaking ? BrandTheme.champagneGold : nil
                                )
                            }
                        }
                    }

                    if !tip.commonPitfall.isEmpty {
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.red)
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Common Pitfall")
                                    .scaledFont(.caption, weight: .bold, design: .monospaced)
                                    .foregroundStyle(.red)
                                Text(tip.commonPitfall)
                                    .scaledFont(.subheadline)
                                    .lineSpacing(3)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, tint: .red)
                    }

                    if let tools = tip.recommendedTools, !tools.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Curated Tools")
                                .scaledFont(.headline, weight: .semibold)
                            FlowLayout(spacing: 8, lineSpacing: 8) {
                                ForEach(tools, id: \.name) { tool in
                                    if let url = URL(string: tool.url) {
                                        Link(destination: url) {
                                            Label(tool.name, systemImage: "arrow.up.right.square")
                                        }
                                        .buttonStyle(GoldenGateGlassPillButtonStyle())
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 24)
                .frame(maxWidth: 880, alignment: .leading)
                .frame(maxWidth: .infinity, alignment: .center)
            }
        }
    }

    private var timeCommitmentLabel: some View {
        Label(tip.timeCommitment, systemImage: "clock")
            .scaledFont(.footnote, design: .monospaced)
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
        }
        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: copied, accent: BrandTheme.emeraldMint))

        Button {
            NativeAudioEngine.shared.playClickSound()
            store.toggleBookmark(tip.id)
        } label: {
            Label(isBookmarked ? "Saved" : "Save", systemImage: isBookmarked ? "bookmark.fill" : "bookmark")
        }
        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: isBookmarked, accent: BrandTheme.editorialBlue))

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
        }
        .buttonStyle(GoldenGatePrimaryButtonStyle(accent: isMastered ? BrandTheme.emeraldMint : BrandTheme.editorialBlue))
    }
}
