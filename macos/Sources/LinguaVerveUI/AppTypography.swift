import SwiftUI
import LinguaVerveCore

// MARK: - Overall Native App Typography Scaling Environment

public enum AppTextStyle: Sendable {
    case largeTitle
    case title
    case title2
    case title3
    case headline
    case body
    case callout
    case subheadline
    case footnote
    case caption
    case caption2

    public var baseSize: CGFloat {
        switch self {
        case .largeTitle: return 26
        case .title: return 22
        case .title2: return 18
        case .title3: return 15.5
        case .headline: return 14
        case .body: return 13.5
        case .callout: return 13
        case .subheadline: return 12.5
        case .footnote: return 11.5
        case .caption: return 11.5
        case .caption2: return 10.5
        }
    }

    public var defaultWeight: Font.Weight {
        switch self {
        case .largeTitle, .title, .title2, .title3: return .bold
        case .headline: return .semibold
        default: return .regular
        }
    }
}

private struct AppFontScaleKey: EnvironmentKey {
    static let defaultValue: CGFloat = 1.0
}

public extension EnvironmentValues {
    var appFontScale: CGFloat {
        get { self[AppFontScaleKey.self] }
        set { self[AppFontScaleKey.self] = newValue }
    }
}

public extension CurriculumStore {
    /// Maps the continuous font scale multiplier to the closest DynamicTypeSize
    /// so iOS/iPadOS controls and macOS system components also scale harmoniously.
    var preferredDynamicTypeSize: DynamicTypeSize {
        switch fontScale {
        case ..<0.93: return .small
        case 0.93..<1.06: return .large
        case 1.06..<1.20: return .xLarge
        case 1.20..<1.36: return .xxLarge
        case 1.36..<1.50: return .xxxLarge
        default: return .accessibility1
        }
    }
}

private struct ScaledPointFontModifier: ViewModifier {
    @Environment(\.appFontScale) private var scale
    let baseSize: CGFloat
    let weight: Font.Weight?
    let design: Font.Design?
    let italic: Bool
    let monospacedDigit: Bool

    func body(content: Content) -> some View {
        let computed = Font.system(size: max(9, baseSize * scale), weight: weight, design: design)
        let styled = italic ? computed.italic() : computed
        let finalFont = monospacedDigit ? styled.monospacedDigit() : styled
        content.font(finalFont)
    }
}

public extension View {
    /// Applies true vector-scaled typography across macOS, iPadOS, and iOS using the app's global fontScale.
    func scaledFont(
        size: CGFloat,
        weight: Font.Weight? = nil,
        design: Font.Design? = nil,
        italic: Bool = false,
        monospacedDigit: Bool = false
    ) -> some View {
        modifier(
            ScaledPointFontModifier(
                baseSize: size,
                weight: weight,
                design: design,
                italic: italic,
                monospacedDigit: monospacedDigit
            )
        )
    }

    /// Applies true vector-scaled semantic typography across macOS, iPadOS, and iOS.
    func scaledFont(
        _ style: AppTextStyle,
        weight: Font.Weight? = nil,
        design: Font.Design? = nil,
        italic: Bool = false,
        monospacedDigit: Bool = false
    ) -> some View {
        modifier(
            ScaledPointFontModifier(
                baseSize: style.baseSize,
                weight: weight ?? style.defaultWeight,
                design: design,
                italic: italic,
                monospacedDigit: monospacedDigit
            )
        )
    }

    /// Injects global app font scaling into any root view, sheet, or menu bar popover.
    func applyAppFontScale(_ store: CurriculumStore) -> some View {
        self
            .environment(\.appFontScale, CGFloat(store.fontScale))
            .environment(\.font, .system(size: 13.5 * CGFloat(store.fontScale)))
            .dynamicTypeSize(store.preferredDynamicTypeSize)
    }
}

// MARK: - Display & Font Size Configuration Sheet

public struct DisplaySettingsSheetView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Overall App Text Size") {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("Global Font Scale")
                                .scaledFont(.headline)
                            Spacer()
                            Text("\(store.fontScalePercent)%")
                                .scaledFont(.headline, weight: .bold, design: .monospaced)
                                .foregroundStyle(BrandTheme.celestialSky)
                        }

                        HStack(spacing: 12) {
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.decreaseFontScale()
                            } label: {
                                Label("Smaller", systemImage: "textformat.size.smaller")
                                    .labelStyle(.iconOnly)
                            }
                            .buttonStyle(.bordered)
                            .disabled(store.fontScale <= CurriculumStore.minFontScale + 0.001)

                            Slider(
                                value: $store.fontScale,
                                in: CurriculumStore.minFontScale...CurriculumStore.maxFontScale,
                                step: 0.05
                            )

                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.increaseFontScale()
                            } label: {
                                Label("Larger", systemImage: "textformat.size.larger")
                                    .labelStyle(.iconOnly)
                            }
                            .buttonStyle(.bordered)
                            .disabled(store.fontScale >= CurriculumStore.maxFontScale - 0.001)
                        }
                    }
                    .padding(.vertical, 4)

                    FlowLayout(spacing: 8, lineSpacing: 8) {
                        ForEach(CurriculumStore.fontScalePresets, id: \.label) { preset in
                            let selected = abs(store.fontScale - preset.scale) < 0.03
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.setFontScale(preset.scale)
                            } label: {
                                Text("\(preset.label) (\(Int((preset.scale * 100).rounded()))%)")
                                    .scaledFont(.caption, weight: .bold)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(selected ? BrandTheme.celestialSky : Color.primary.opacity(0.07))
                                    )
                                    .foregroundStyle(selected ? Color.white : Color.primary)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    Button("Reset to Default (100%)") {
                        NativeAudioEngine.shared.playClickSound()
                        store.resetFontScale()
                    }
                    .disabled(abs(store.fontScale - 1.0) < 0.01)
                }

                Section("Live Reading & Study Preview") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("CEFR B2 · READING & LESSON PREVIEW")
                            .scaledFont(.caption2, weight: .bold, design: .monospaced)
                            .foregroundStyle(BrandTheme.celestialSky)
                        Text("Konjunktiv II & Höfliche Formulierungen")
                            .scaledFont(.title3, weight: .bold, design: .serif)
                        Text("Könnten Sie mir bitte mitteilen, ob die Sprachprüfung am kommenden Freitag um neun Uhr im Hauptgebäude stattfindet?")
                            .scaledFont(.body)
                            .lineSpacing(4)
                        Text("Tip: Every workspace, guided lesson, exam passage, flashcard, and sidebar scales immediately.")
                            .scaledFont(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 6)
                }

                #if os(macOS)
                Section("Keyboard Shortcuts") {
                    LabeledContent("Increase Font Size", value: "⌘ +")
                    LabeledContent("Decrease Font Size", value: "⌘ -")
                    LabeledContent("Reset to 100%", value: "⌘ 0")
                }
                #endif
            }
            .formStyle(.grouped)
            .navigationTitle("Display & Text Size")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .fontWeight(.bold)
                }
            }
        }
        .applyAppFontScale(store)
        #if os(macOS)
        .frame(minWidth: 480, idealWidth: 540, minHeight: 460, idealHeight: 540)
        #endif
    }
}
