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
        case .largeTitle: return 30
        case .title: return 26
        case .title2: return 21
        case .title3: return 18
        case .headline: return 16.5
        case .body: return 15.5
        case .callout: return 15
        case .subheadline: return 14.5
        case .footnote: return 13.5
        case .caption: return 13
        case .caption2: return 12
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

/// Shared optical legibility and responsive sizing helpers for break-free text scaling (85%–160%).
public enum AppTypography {
    public static let minimumReadablePointSize: CGFloat = 10.5

    /// Applies an optical legibility uplift to explicit point sizes (`scaledFont(size:)`) while preserving hero display sizes.
    public static func comfortableBaseSize(for rawSize: CGFloat) -> CGFloat {
        if rawSize <= 14 {
            return rawSize + 2.0
        }
        if rawSize < 24 {
            return rawSize + (2.0 - ((rawSize - 14.0) / 10.0))
        }
        if rawSize < 32 {
            return rawSize + 1.0
        }
        return rawSize
    }

    public static func resolvedPointSize(
        baseSize: CGFloat,
        scale: CGFloat,
        applyOpticalLift: Bool
    ) -> CGFloat {
        let effectiveBase = applyOpticalLift ? comfortableBaseSize(for: baseSize) : baseSize
        return max(minimumReadablePointSize, effectiveBase * scale)
    }

    /// Gently expands adaptive `LazyVGrid` minimum column widths so cards don't crush enlarged text.
    public static func scaledGridMinimum(_ base: CGFloat, scale: CGFloat) -> CGFloat {
        base * min(max(scale, 1.0), 1.35)
    }

    /// Expands ideal sidebar width harmoniously within safe bounds as global font scale increases.
    public static func scaledSidebarIdealWidth(scale: CGFloat) -> CGFloat {
        min(330, max(252, (252 * min(max(scale, 1.0), 1.32)).rounded()))
    }

    /// Scales bounded control widths (segmented pickers, popovers) up to an explicit maximum cap.
    public static func scaledControlWidth(_ base: CGFloat, scale: CGFloat, maxCap: CGFloat) -> CGFloat {
        min(maxCap, base * min(max(scale, 1.0), 1.32))
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
    let applyOpticalLift: Bool

    func body(content: Content) -> some View {
        let pointSize = AppTypography.resolvedPointSize(
            baseSize: baseSize,
            scale: scale,
            applyOpticalLift: applyOpticalLift
        )
        let computed = Font.system(size: pointSize, weight: weight, design: design)
        let styled = italic ? computed.italic() : computed
        let finalFont = monospacedDigit ? styled.monospacedDigit() : styled
        content.font(finalFont)
    }
}

public extension View {
    /// Applies true vector-scaled typography with optical readability uplift across macOS, iPadOS, and iOS.
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
                monospacedDigit: monospacedDigit,
                applyOpticalLift: true
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
                monospacedDigit: monospacedDigit,
                applyOpticalLift: false
            )
        )
    }

    /// Injects global app font scaling into any root view, sheet, or menu bar popover.
    func applyAppFontScale(_ store: CurriculumStore) -> some View {
        self
            .environment(\.appFontScale, CGFloat(store.fontScale))
            .environment(\.font, .system(size: AppTextStyle.body.baseSize * CGFloat(store.fontScale)))
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
                                .scaledFont(.headline, weight: .bold, design: .monospaced, monospacedDigit: true)
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
                            .fixedSize(horizontal: false, vertical: true)
                        Text("Könnten Sie mir bitte mitteilen, ob die Sprachprüfung am kommenden Freitag um neun Uhr im Hauptgebäude stattfindet?")
                            .scaledFont(.body)
                            .lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true)
                        Text("Tip: Every workspace, guided lesson, exam passage, flashcard, and sidebar scales immediately.")
                            .scaledFont(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
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
        .frame(minWidth: 500, idealWidth: 560, minHeight: 480, idealHeight: 560)
        #endif
    }
}
