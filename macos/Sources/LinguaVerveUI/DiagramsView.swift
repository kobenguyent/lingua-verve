import SwiftUI
import LinguaVerveCore

public struct DiagramsView: View {
    public let diagramType: VisualDiagramType
    public let languageId: String

    public init(diagramType: VisualDiagramType, languageId: String) {
        self.diagramType = diagramType
        self.languageId = languageId
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            switch diagramType {
            case .prepositionPyramid:
                PrepositionPyramidView()
            case .germanGender:
                GermanGenderCardsView()
            case .twoWayPrepositions:
                TwoWayPrepositionsView()
            case .mouthPhonetics:
                MouthPhoneticsView(languageId: languageId)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.primary.opacity(0.035))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.09), lineWidth: 1)
        )
    }
}

private struct PrepositionPyramidView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Spatial Preposition Pyramid (AT → ON → IN)", systemImage: "triangle.fill")
                .scaledFont(size: 12.5, weight: .bold)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            VStack(spacing: 8) {
                ProportionalCenteredLayout(widthRatio: 0.64, minWidth: 260) {
                    pyramidTier(
                        title: "AT · Exact Point / Specific Time",
                        subtitle: "at 5:00 PM · at the corner · at the station",
                        color: .teal
                    )
                }
                ProportionalCenteredLayout(widthRatio: 0.82, minWidth: 290) {
                    pyramidTier(
                        title: "ON · Surface / Day / Street",
                        subtitle: "on Monday · on the table · on Oxford Street",
                        color: .blue
                    )
                }
                ProportionalCenteredLayout(widthRatio: 1.0, minWidth: 310) {
                    pyramidTier(
                        title: "IN · Enclosed Volume / Month / Year / City",
                        subtitle: "in July · in 2026 · in London · in the box",
                        color: .indigo
                    )
                }
            }
        }
    }

    private func pyramidTier(title: String, subtitle: String, color: Color) -> some View {
        VStack(spacing: 3) {
            Text(title)
                .scaledFont(size: 13.5, weight: .bold)
                .foregroundStyle(color)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            Text(subtitle)
                .scaledFont(size: 12)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 14)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .fill(color.opacity(0.12))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .strokeBorder(color.opacity(0.35), lineWidth: 1)
        )
    }
}

private struct GermanGenderCardsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("German 80% Noun Suffix Cheat-Code", systemImage: "square.grid.3x1.below.line.grid.1x2")
                .scaledFont(size: 12.5, weight: .bold)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 10) {
                    genderCards
                }
                VStack(alignment: .leading, spacing: 8) {
                    genderCards
                }
            }
        }
    }

    @ViewBuilder
    private var genderCards: some View {
        genderColumn(
            article: "DER (Masc)",
            suffixes: ["-ig · der Honig", "-ling · der Frühling", "-ismus · der Tourismus", "-or · der Motor"],
            color: .blue
        )
        genderColumn(
            article: "DIE (Fem · 99%)",
            suffixes: ["-ung · die Zeitung", "-heit · die Freiheit", "-keit · die Möglichkeit", "-schaft · die Freundschaft"],
            color: .pink
        )
        genderColumn(
            article: "DAS (Neut)",
            suffixes: ["-chen · das Mädchen", "-lein · das Büchlein", "-ment · das Dokument", "-um · das Zentrum"],
            color: BrandTheme.emeraldMint
        )
    }

    private func genderColumn(article: String, suffixes: [String], color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(article)
                .scaledFont(size: 13, weight: .bold)
                .foregroundStyle(color)
                .fixedSize(horizontal: false, vertical: true)
            Divider()
            ForEach(suffixes, id: \.self) { item in
                Text(item)
                    .scaledFont(size: 12.5, design: .monospaced)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(color.opacity(0.10))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(color.opacity(0.30), lineWidth: 1)
        )
    }
}

private struct TwoWayPrepositionsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Wechselpräpositionen: Motion (Wohin?) vs. Location (Wo?)", systemImage: "arrow.left.and.right.square")
                .scaledFont(size: 12.5, weight: .bold)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            Text("in · an · auf · neben · hinter · über · unter · vor · zwischen")
                .scaledFont(size: 12.5, weight: .semibold, design: .monospaced)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.06)))
                .fixedSize(horizontal: false, vertical: true)

            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 10) {
                    twoWayCards(equalHeight: true)
                }
                VStack(alignment: .leading, spacing: 8) {
                    twoWayCards(equalHeight: false)
                }
            }
        }
    }

    @ViewBuilder
    private func twoWayCards(equalHeight: Bool) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("WOHIN? → AKKUSATIV")
                .scaledFont(size: 13, weight: .bold)
                .foregroundStyle(.orange)
            Text("Boundary-crossing movement:")
                .scaledFont(size: 12)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Ich gehe in den Park.")
                .scaledFont(size: 13.5, weight: .bold, design: .monospaced)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: equalHeight ? .infinity : nil, alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.orange.opacity(0.12)))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.orange.opacity(0.28), lineWidth: 1))

        VStack(alignment: .leading, spacing: 5) {
            Text("WO? → DATIV")
                .scaledFont(size: 13, weight: .bold)
                .foregroundStyle(.teal)
            Text("Static position inside boundary:")
                .scaledFont(size: 12)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Ich bin im (in dem) Park.")
                .scaledFont(size: 13.5, weight: .bold, design: .monospaced)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: equalHeight ? .infinity : nil, alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.teal.opacity(0.12)))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.teal.opacity(0.28), lineWidth: 1))
    }
}

private struct MouthPhoneticsView: View {
    let languageId: String
    @State private var selectedIndex: Int = 0

    private struct PhonemeItem {
        let symbol: String
        let title: String
        let articulation: String
        let tongue: String
        let sample: String
    }

    private var phoneticItems: [PhonemeItem] {
        if languageId == "german" {
            return [
                PhonemeItem(
                    symbol: "[ç] Ich-Laut",
                    title: "Front Palatal Fricative",
                    articulation: "Airflow · Voiceless",
                    tongue: "Raise middle tongue toward the hard palate (after i, e, ä, ö, ü, ei, eu).",
                    sample: "ich · Licht · Mädchen"
                ),
                PhonemeItem(
                    symbol: "[x] Ach-Laut",
                    title: "Back Velar Fricative",
                    articulation: "Back Throat · Voiceless",
                    tongue: "Raise back of tongue toward soft palate (after a, o, u, au).",
                    sample: "Buch · Nacht · machen"
                ),
                PhonemeItem(
                    symbol: "[yː] Ü-Umlaut",
                    title: "Rounded High Front Vowel",
                    articulation: "Lip Rounding · Tense",
                    tongue: "Hold tongue in 'ee' [iː] position while rounding lips tightly as for 'oo'.",
                    sample: "für · über · grün"
                )
            ]
        } else {
            return [
                PhonemeItem(
                    symbol: "/ə/ Schwa",
                    title: "Neutral Mid-Central Vowel",
                    articulation: "100% Relaxed · Unstressed",
                    tongue: "Jaw & tongue completely neutral in the center of the mouth on unstressed beats.",
                    sample: "about · banana · photographer"
                ),
                PhonemeItem(
                    symbol: "/θ/ Voiceless TH",
                    title: "Interdental Fricative (Air Only)",
                    articulation: "Teeth + Tongue · No Voice",
                    tongue: "Place tongue tip lightly between front teeth and blow steady air without vibrating throat.",
                    sample: "think · through · bath"
                ),
                PhonemeItem(
                    symbol: "/ð/ Voiced TH",
                    title: "Interdental Fricative (Voiced)",
                    articulation: "Teeth + Tongue · Voiced",
                    tongue: "Keep the exact /θ/ tongue placement, and engage vocal cord vibration.",
                    sample: "this · brother · breathe"
                )
            ]
        }
    }

    var body: some View {
        let items = phoneticItems
        let safeIndex = min(selectedIndex, items.count - 1)
        let active = items[safeIndex]

        VStack(alignment: .leading, spacing: 10) {
            Label("Interactive Articulatory Phonetics Guide", systemImage: "mouth")
                .scaledFont(size: 12.5, weight: .bold)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 6) {
                    ForEach(Array(items.enumerated()), id: \.offset) { idx, item in
                        phonemeButton(idx: idx, item: item, isSelected: idx == safeIndex, fullWidth: true)
                    }
                }
                FlowLayout(spacing: 6, lineSpacing: 6) {
                    ForEach(Array(items.enumerated()), id: \.offset) { idx, item in
                        phonemeButton(idx: idx, item: item, isSelected: idx == safeIndex, fullWidth: false)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                FlowLayout(spacing: 8, lineSpacing: 4) {
                    Text(active.title)
                        .scaledFont(size: 15, weight: .bold)
                        .foregroundStyle(BrandTheme.celestialSky)
                        .fixedSize()
                    Text(active.articulation)
                        .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.15)))
                        .foregroundStyle(BrandTheme.celestialSky)
                        .fixedSize()
                }

                Text(active.tongue)
                    .scaledFont(size: 13.5)
                    .lineSpacing(2.5)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: 10) {
                    Text("Drill: \(active.sample)")
                        .scaledFont(size: 13.5, weight: .semibold, design: .monospaced)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer()
                    Button {
                        NativeAudioEngine.shared.speak(
                            active.sample.replacingOccurrences(of: "·", with: ","),
                            languageId: languageId
                        )
                    } label: {
                        Label("Listen", systemImage: "speaker.wave.2.fill")
                            .scaledFont(size: 12.5, weight: .bold)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.celestialSky)
                    .controlSize(.regular)
                    .fixedSize()
                }
            }
            .padding(13)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(BrandTheme.celestialSky.opacity(0.09))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .strokeBorder(BrandTheme.celestialSky.opacity(0.25), lineWidth: 1)
            )
        }
    }

    private func phonemeButton(idx: Int, item: PhonemeItem, isSelected: Bool, fullWidth: Bool) -> some View {
        Button {
            NativeAudioEngine.shared.playClickSound()
            withAnimation(.easeOut(duration: 0.16)) {
                selectedIndex = idx
            }
        } label: {
            Text(item.symbol)
                .scaledFont(size: 12.5, weight: isSelected ? .bold : .medium, design: .monospaced)
                .lineLimit(1)
                .minimumScaleFactor(0.85)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .frame(maxWidth: fullWidth ? .infinity : nil)
                .background(
                    RoundedRectangle(cornerRadius: 7, style: .continuous)
                        .fill(isSelected ? BrandTheme.celestialSky.opacity(0.22) : Color.primary.opacity(0.05))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 7, style: .continuous)
                        .strokeBorder(isSelected ? BrandTheme.celestialSky.opacity(0.55) : Color.primary.opacity(0.08), lineWidth: 1)
                )
                .foregroundStyle(isSelected ? BrandTheme.celestialSky : Color.primary)
        }
        .buttonStyle(.plain)
    }
}
