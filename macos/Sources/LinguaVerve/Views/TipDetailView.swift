import SwiftUI
import AppKit
import LinguaVerveCore

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
            VStack(alignment: .leading, spacing: 22) {
                // Row 1: Responsive Action Bar
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

                // Row 2: Wrapping Metadata Pills
                FlowLayout(spacing: 8, lineSpacing: 6) {
                    Text("\(lang?.flag ?? "🌐") \(lang?.name ?? "Polyglot Meta")")
                        .font(.system(size: 12.5, weight: .semibold))
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.primary.opacity(0.07)))
                        .overlay(Capsule().strokeBorder(Color.primary.opacity(0.08), lineWidth: 1))
                        .fixedSize()

                    Text(levelDetail != nil ? "\(tip.level) · \(levelDetail!.badge)" : "All Levels")
                        .font(.system(size: 12.5, weight: .bold, design: .monospaced))
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .foregroundStyle(tierColor)
                        .background(Capsule().fill(tierColor.opacity(0.14)))
                        .overlay(Capsule().strokeBorder(tierColor.opacity(0.32), lineWidth: 1))
                        .fixedSize()

                    Label(tip.category.displayName, systemImage: tip.category.systemImage)
                        .font(.system(size: 12.5, weight: .medium))
                        .padding(.horizontal, 11)
                        .padding(.vertical, 5)
                        .foregroundStyle(.secondary)
                        .background(Capsule().fill(Color.primary.opacity(0.05)))
                        .fixedSize()
                }

                // Editorial Headline & Summary
                VStack(alignment: .leading, spacing: 10) {
                    Text(tip.title)
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(tip.summary)
                        .font(.system(size: 15, weight: .regular))
                        .foregroundStyle(.secondary)
                        .lineSpacing(4)
                        .textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true)
                }

                // Golden Polyglot Rule Banner
                HStack(spacing: 0) {
                    Rectangle()
                        .fill(BrandTheme.champagneGold)
                        .frame(width: 4)

                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "lightbulb.max.fill")
                            .foregroundStyle(BrandTheme.champagneGold)
                            .font(.system(size: 18))
                        VStack(alignment: .leading, spacing: 4) {
                            Text("GOLDEN POLYGLOT RULE")
                                .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                .foregroundStyle(BrandTheme.champagneGold)
                            Text(tip.goldenRule)
                                .font(.system(size: 14.5, weight: .semibold))
                                .lineSpacing(3)
                                .textSelection(.enabled)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .background(
                    RoundedRectangle(cornerRadius: 11, style: .continuous)
                        .fill(BrandTheme.champagneGold.opacity(0.10))
                )
                .clipShape(RoundedRectangle(cornerRadius: 11, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 11, style: .continuous)
                        .strokeBorder(BrandTheme.champagneGold.opacity(0.28), lineWidth: 1)
                )

                // Interactive Visual Diagram (if applicable)
                if let diagram = tip.diagramType {
                    DiagramsView(diagramType: diagram, languageId: tip.languageId)
                }

                // Actionable Tactics
                VStack(alignment: .leading, spacing: 13) {
                    Text("ACTIONABLE TACTICS")
                        .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                        .foregroundStyle(.secondary)

                    ForEach(Array(tip.tactics.enumerated()), id: \.offset) { idx, tactic in
                        HStack(alignment: .top, spacing: 12) {
                            Text("\(idx + 1)")
                                .font(.system(size: 12.5, weight: .bold, design: .monospaced))
                                .monospacedDigit()
                                .frame(width: 26, height: 26)
                                .background(Circle().fill(BrandTheme.celestialSky.opacity(0.14)))
                                .overlay(Circle().strokeBorder(BrandTheme.celestialSky.opacity(0.32), lineWidth: 1))
                                .foregroundStyle(BrandTheme.celestialSky)
                            Text(tactic)
                                .font(.system(size: 14, weight: .regular))
                                .lineSpacing(3.5)
                                .textSelection(.enabled)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.primary.opacity(0.025))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.primary.opacity(0.07), lineWidth: 1)
                )

                // Target Examples with Native AVSpeechSynthesizer Playback
                if let examples = tip.examples, !examples.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        ViewThatFits(in: .horizontal) {
                            HStack {
                                Text("TARGET EXAMPLES · CLICK TO HEAR")
                                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                    .foregroundStyle(.secondary)
                                Spacer()
                                slowPaceToggle
                            }
                            VStack(alignment: .leading, spacing: 6) {
                                Text("TARGET EXAMPLES · CLICK TO HEAR")
                                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                    .foregroundStyle(.secondary)
                                slowPaceToggle
                            }
                        }

                        ForEach(Array(examples.enumerated()), id: \.offset) { _, ex in
                            let isSpeaking = NativeAudioEngine.shared.currentlySpeakingText == ex.speakablePhrase
                            HStack(alignment: .center, spacing: 12) {
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(ex.source)
                                        .font(.system(size: 14.5, weight: .semibold, design: .monospaced))
                                        .textSelection(.enabled)
                                        .fixedSize(horizontal: false, vertical: true)
                                    Text(ex.explanation)
                                        .font(.system(size: 13))
                                        .foregroundStyle(.secondary)
                                        .lineSpacing(2)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                                Spacer(minLength: 8)
                                Button {
                                    NativeAudioEngine.shared.speak(ex.speakablePhrase, languageId: tip.languageId)
                                } label: {
                                    Label(isSpeaking ? "Speaking" : "Listen", systemImage: isSpeaking ? "waveform" : "speaker.wave.2.fill")
                                        .font(.system(size: 12.5, weight: .semibold))
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(isSpeaking ? BrandTheme.champagneGold : BrandTheme.celestialSky)
                                .controlSize(.regular)
                                .fixedSize()
                            }
                            .padding(14)
                            .background(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(isSpeaking ? BrandTheme.celestialSky.opacity(0.08) : Color.primary.opacity(0.035))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .strokeBorder(isSpeaking ? BrandTheme.celestialSky.opacity(0.4) : Color.primary.opacity(0.07), lineWidth: 1)
                            )
                        }
                    }
                }

                // Common Pitfall Warning
                if !tip.commonPitfall.isEmpty {
                    HStack(spacing: 0) {
                        Rectangle()
                            .fill(Color.red.opacity(0.85))
                            .frame(width: 4)

                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.red)
                                .font(.system(size: 15))
                            VStack(alignment: .leading, spacing: 4) {
                                Text("COMMON PITFALL")
                                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                    .foregroundStyle(.red)
                                Text(tip.commonPitfall)
                                    .font(.system(size: 13.5))
                                    .lineSpacing(3)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                            .fill(Color.red.opacity(0.08))
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 11, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                            .strokeBorder(Color.red.opacity(0.24), lineWidth: 1)
                    )
                }

                // Curated Tools
                if let tools = tip.recommendedTools, !tools.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("CURATED TOOLS")
                            .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                            .foregroundStyle(.secondary)
                        FlowLayout(spacing: 8, lineSpacing: 6) {
                            ForEach(tools, id: \.name) { tool in
                                if let url = URL(string: tool.url) {
                                    Link(destination: url) {
                                        Label(tool.name, systemImage: "arrow.up.right.square")
                                            .font(.system(size: 12.5, weight: .semibold))
                                    }
                                    .buttonStyle(.bordered)
                                    .controlSize(.regular)
                                    .fixedSize()
                                }
                            }
                        }
                    }
                }

                // Tags
                FlowLayout(spacing: 6, lineSpacing: 6) {
                    ForEach(tip.tags, id: \.self) { tag in
                        Text("#\(tag)")
                            .font(.system(size: 12, design: .monospaced))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3.5)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.045)))
                            .foregroundStyle(.secondary)
                            .fixedSize()
                    }
                }
            }
            .padding(.horizontal, 26)
            .padding(.vertical, 24)
            .frame(maxWidth: 860, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .center)
        }
    }

    private var timeCommitmentLabel: some View {
        Label(tip.timeCommitment, systemImage: "clock")
            .font(.system(size: 12.5, design: .monospaced))
            .foregroundStyle(.secondary)
            .fixedSize()
    }

    private var slowPaceToggle: some View {
        Toggle(isOn: Bindable(NativeAudioEngine.shared).slowPace) {
            Text("0.75x Slow Pace")
                .font(.system(size: 12, design: .monospaced))
        }
        .toggleStyle(.switch)
        .controlSize(.small)
        .fixedSize()
    }

    @ViewBuilder
    private func actionButtons(isBookmarked: Bool, isMastered: Bool) -> some View {
        Button {
            NativeAudioEngine.shared.playClickSound()
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(
                "\(tip.title) — \(tip.goldenRule)\n(LinguaVerve)",
                forType: .string
            )
            copied = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) { copied = false }
        } label: {
            Label(copied ? "Copied" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
                .font(.system(size: 12.5, weight: .medium))
                .lineLimit(1)
        }
        .controlSize(.regular)
        .fixedSize()

        Button {
            NativeAudioEngine.shared.playClickSound()
            store.toggleBookmark(tip.id)
        } label: {
            Label(isBookmarked ? "Saved" : "Save", systemImage: isBookmarked ? "bookmark.fill" : "bookmark")
                .font(.system(size: 12.5, weight: .medium))
                .lineLimit(1)
        }
        .tint(isBookmarked ? BrandTheme.celestialSky : nil)
        .controlSize(.regular)
        .fixedSize()

        Button {
            let nowMastered = store.toggleMastered(tip.id)
            if nowMastered {
                NativeAudioEngine.shared.playSuccessChime()
            } else {
                NativeAudioEngine.shared.playClickSound()
            }
        } label: {
            Label(
                isMastered ? "Mastered" : "Mark Mastered",
                systemImage: isMastered ? "checkmark.seal.fill" : "checkmark.seal"
            )
            .font(.system(size: 12.5, weight: .semibold))
            .lineLimit(1)
        }
        .buttonStyle(.borderedProminent)
        .tint(isMastered ? BrandTheme.emeraldMint : .accentColor)
        .controlSize(.regular)
        .fixedSize()
    }
}
