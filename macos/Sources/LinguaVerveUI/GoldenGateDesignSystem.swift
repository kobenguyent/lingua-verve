import SwiftUI
import LinguaVerveCore

/// Concentric geometry, motion curves, and layout constants aligned with macOS 27 Golden Gate HIG.
public enum GoldenGateMetrics {
    public static let cardCornerRadius: CGFloat = 18
    public static let nestedCornerRadius: CGFloat = 12
    public static let pillCornerRadius: CGFloat = 999
    public static let editorialMaxWidth: CGFloat = 980

    public static let springTransition: Animation = .spring(response: 0.34, dampingFraction: 0.84)
    public static let snappySpring: Animation = .spring(response: 0.26, dampingFraction: 0.82)
    public static let panelAnimation: Animation = .smooth(duration: 0.28, extraBounce: 0)
    public static let contentFade: Animation = .easeInOut(duration: 0.20)
}

// MARK: - Smooth Height-Masked Collapsible Containers

/// Animatable SwiftUI Layout that smoothly interpolates a panel's height (`0...1`) from its top edge
/// while keeping the child at its full natural height so text never squashes or re-wraps mid-transition.
public struct GoldenGateCollapsibleLayout: Layout, Animatable {
    public struct Cache: Sendable {
        public var lastWidth: CGFloat?
        public var naturalSize: CGSize = .zero

        public init(lastWidth: CGFloat? = nil, naturalSize: CGSize = .zero) {
            self.lastWidth = lastWidth
            self.naturalSize = naturalSize
        }
    }

    public var progress: CGFloat

    public init(progress: CGFloat) {
        self.progress = progress
    }

    public var animatableData: CGFloat {
        get { progress }
        set { progress = newValue }
    }

    public static func clampedProgress(_ value: CGFloat) -> CGFloat {
        min(1.0, max(0.0, value))
    }

    public func makeCache(subviews: Subviews) -> Cache {
        Cache()
    }

    public func updateCache(_ cache: inout Cache, subviews: Subviews) {
        cache = Cache()
    }

    private func resolvedNaturalSize(
        widthProposal: CGFloat?,
        subview: LayoutSubview,
        cache: inout Cache
    ) -> CGSize {
        if let widthProposal,
           let cachedWidth = cache.lastWidth,
           abs(cachedWidth - widthProposal) < 0.5,
           cache.naturalSize != .zero {
            return cache.naturalSize
        }
        let measured = subview.sizeThatFits(ProposedViewSize(width: widthProposal, height: nil))
        cache.lastWidth = widthProposal
        cache.naturalSize = measured
        return measured
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout Cache) -> CGSize {
        guard let child = subviews.first else { return .zero }
        let widthProposal = proposal.width.flatMap { $0.isFinite ? $0 : nil }
        let natural = resolvedNaturalSize(widthProposal: widthProposal, subview: child, cache: &cache)
        let height = natural.height * Self.clampedProgress(progress)
        return CGSize(width: widthProposal ?? natural.width, height: height)
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout Cache) {
        guard let child = subviews.first else { return }
        let widthProposal = bounds.width.isFinite ? bounds.width : nil
        let natural = resolvedNaturalSize(widthProposal: widthProposal, subview: child, cache: &cache)
        child.place(
            at: CGPoint(x: bounds.minX, y: bounds.minY),
            anchor: .topLeading,
            proposal: ProposedViewSize(width: natural.width, height: natural.height)
        )
    }
}

/// Clips, lazily mounts/unmounts, and fades vertically disclosed content using `GoldenGateMetrics.panelAnimation`.
public struct GoldenGateCollapsiblePanel<Content: View>: View {
    public let isExpanded: Bool
    @ViewBuilder public let content: () -> Content

    @State private var shouldMount: Bool
    @State private var animProgress: CGFloat
    @State private var unmountTask: Task<Void, Never>?

    public init(isExpanded: Bool, @ViewBuilder content: @escaping () -> Content) {
        self.isExpanded = isExpanded
        self.content = content
        self._shouldMount = State(initialValue: isExpanded)
        self._animProgress = State(initialValue: isExpanded ? 1.0 : 0.0)
    }

    public var body: some View {
        Group {
            if shouldMount {
                GoldenGateCollapsibleLayout(progress: animProgress) {
                    content()
                }
                .opacity(animProgress)
                .offset(y: (1.0 - animProgress) * -4.0)
                .clipped()
                .allowsHitTesting(isExpanded)
                .accessibilityHidden(!isExpanded)
            } else {
                Color.clear
                    .frame(height: 0)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
        }
        .onChange(of: isExpanded) { _, expanded in
            unmountTask?.cancel()
            unmountTask = nil
            if expanded {
                if !shouldMount {
                    animProgress = 0.0
                    shouldMount = true
                    DispatchQueue.main.async {
                        guard isExpanded else { return }
                        withAnimation(GoldenGateMetrics.panelAnimation) {
                            animProgress = 1.0
                        }
                    }
                } else {
                    withAnimation(GoldenGateMetrics.panelAnimation) {
                        animProgress = 1.0
                    }
                }
            } else {
                withAnimation(GoldenGateMetrics.panelAnimation) {
                    animProgress = 0.0
                }
                unmountTask = Task {
                    try? await Task.sleep(nanoseconds: 310_000_000)
                    guard !Task.isCancelled else { return }
                    await MainActor.run {
                        if !isExpanded {
                            shouldMount = false
                        }
                    }
                }
            }
        }
        .onDisappear {
            unmountTask?.cancel()
            unmountTask = nil
        }
    }
}

/// Editorial disclosure row replacing abrupt system `DisclosureGroup` jumps inside glass surfaces.
public struct GoldenGateEditorialDisclosure<Content: View>: View {
    public let title: String
    @ViewBuilder public let content: () -> Content
    @State private var isExpanded: Bool = false

    public init(_ title: String, @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                NativeAudioEngine.shared.playClickSound()
                withAnimation(GoldenGateMetrics.panelAnimation) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "chevron.right")
                        .scaledFont(.caption2, weight: .bold)
                        .foregroundStyle(.tertiary)
                        .rotationEffect(.degrees(isExpanded ? 90 : 0))
                        .animation(GoldenGateMetrics.panelAnimation, value: isExpanded)
                    Text(title)
                        .scaledFont(.footnote, weight: .medium)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            GoldenGateCollapsiblePanel(isExpanded: isExpanded) {
                content()
                    .padding(.top, 6)
            }
        }
    }
}

// MARK: - Ambient Golden Gate Editorial Backdrop

/// Ultra-subtle ambient coastal twilight / fog gradient behind translucent surfaces.
public struct GoldenGateEditorialBackdrop: View {
    @Environment(\.colorScheme) private var colorScheme

    public init() {}

    public var body: some View {
        let isDark = colorScheme == .dark
        ZStack(alignment: .topLeading) {
            RadialGradient(
                colors: [
                    BrandTheme.editorialBlue.opacity(isDark ? 0.09 : 0.055),
                    Color.clear
                ],
                center: .topLeading,
                startRadius: 40,
                endRadius: 680
            )
            RadialGradient(
                colors: [
                    BrandTheme.champagneGold.opacity(isDark ? 0.05 : 0.045),
                    Color.clear
                ],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 560
            )
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}

// MARK: - Hairline Editorial Divider

public struct GoldenGateSectionHairline: View {
    public init() {}

    public var body: some View {
        Rectangle()
            .fill(BrandTheme.editorialHairline)
            .frame(height: 1)
            .frame(maxWidth: .infinity)
    }
}

// MARK: - Lightweight Editorial Surfaces & Cross-Version Liquid Glass Chrome

private struct GoldenGateSurfaceModifier: ViewModifier {
    let cornerRadius: CGFloat
    let tint: Color?
    let interactive: Bool
    let useMaterial: Bool
    @Environment(\.colorScheme) private var colorScheme
    @State private var isHovered: Bool = false

    func body(content: Content) -> some View {
        let isDark = colorScheme == .dark
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        let baseAlpha = isDark ? 0.048 : 0.032
        let tintOpacity: Double = tint == nil ? 0 : (isHovered ? 0.11 : 0.075)
        let borderTop = isDark ? Color.white.opacity(isHovered ? 0.20 : 0.14) : Color.white.opacity(0.82)
        let borderBottom = BrandTheme.editorialHairline

        let styled = content
            .background {
                if useMaterial {
                    ZStack {
                        shape.fill(.ultraThinMaterial)
                        if let tint {
                            shape.fill(tint.opacity(tintOpacity))
                        }
                    }
                } else {
                    ZStack {
                        shape.fill(Color.primary.opacity(isHovered ? (baseAlpha + 0.015) : baseAlpha))
                        if let tint {
                            shape.fill(tint.opacity(tintOpacity))
                        }
                    }
                }
            }
            .overlay {
                shape.strokeBorder(
                    LinearGradient(
                        colors: [borderTop, borderBottom],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 1
                )
            }

        Group {
            if useMaterial {
                styled
                    .clipShape(shape)
                    .shadow(
                        color: Color.black.opacity(isDark ? 0.18 : 0.06),
                        radius: 8,
                        y: 3
                    )
            } else {
                styled
                    .clipShape(shape)
            }
        }
        #if os(macOS)
        .onHover { hovering in
            guard interactive else { return }
            isHovered = hovering
        }
        #endif
    }
}

private struct GoldenGateGlassPillModifier: ViewModifier {
    let isSelected: Bool
    let accent: Color
    let useLiquidGlass: Bool
    @Environment(\.colorScheme) private var colorScheme
    @State private var isHovered: Bool = false

    @ViewBuilder
    func body(content: Content) -> some View {
        if useLiquidGlass {
            #if compiler(>=6.2)
            if #available(macOS 26.0, iOS 26.0, *) {
                content
                    .glassEffect(
                        isSelected ? .regular.tint(accent.opacity(0.28)).interactive() : .regular.interactive(),
                        in: Capsule()
                    )
            } else {
                fallbackPill(content, withMaterial: true)
            }
            #else
            fallbackPill(content, withMaterial: true)
            #endif
        } else {
            fallbackPill(content, withMaterial: false)
        }
    }

    private func fallbackPill(_ content: Content, withMaterial: Bool) -> some View {
        let isDark = colorScheme == .dark
        let fill: Color = isSelected
            ? accent.opacity(isDark ? 0.22 : 0.15)
            : Color.primary.opacity(isHovered ? 0.075 : 0.042)
        let strokeColor: Color = isSelected
            ? accent.opacity(0.42)
            : (isDark ? Color.white.opacity(0.13) : Color.black.opacity(0.09))

        return content
            .background {
                if withMaterial {
                    ZStack {
                        Capsule().fill(.ultraThinMaterial)
                        Capsule().fill(fill)
                    }
                } else {
                    Capsule().fill(fill)
                }
            }
            .overlay {
                Capsule().strokeBorder(strokeColor, lineWidth: 1)
            }
            #if os(macOS)
            .onHover { hovering in
                isHovered = hovering
            }
            #endif
    }
}

public extension View {
    /// Applies a concentric macOS 27 Golden Gate surface (`useMaterial: true` is reserved for floating chrome).
    func goldenGateSurface(
        cornerRadius: CGFloat = GoldenGateMetrics.cardCornerRadius,
        tint: Color? = nil,
        interactive: Bool = false,
        useMaterial: Bool = false
    ) -> some View {
        modifier(
            GoldenGateSurfaceModifier(
                cornerRadius: cornerRadius,
                tint: tint,
                interactive: interactive,
                useMaterial: useMaterial
            )
        )
    }

    /// Applies a concentric editorial capsule pill (`useLiquidGlass: true` is reserved for top chrome).
    func goldenGateGlassPill(
        isSelected: Bool = false,
        accent: Color = BrandTheme.editorialBlue,
        useLiquidGlass: Bool = false
    ) -> some View {
        modifier(
            GoldenGateGlassPillModifier(
                isSelected: isSelected,
                accent: accent,
                useLiquidGlass: useLiquidGlass
            )
        )
    }
}

// MARK: - Sliding Segmented Liquid Glass Control

/// Editorial segmented control with sliding Liquid Glass active pill (`matchedGeometryEffect`).
public struct GoldenGateSegmentedControl<Item: Hashable & Identifiable, LabelContent: View>: View {
    public let items: [Item]
    @Binding public var selection: Item
    public let accent: Color
    public let allowHorizontalScroll: Bool
    @ViewBuilder public let label: (Item, Bool) -> LabelContent

    @Namespace private var pillNamespace
    @Environment(\.colorScheme) private var colorScheme
    @State private var hoveredItem: Item? = nil

    public init(
        items: [Item],
        selection: Binding<Item>,
        accent: Color = BrandTheme.editorialBlue,
        allowHorizontalScroll: Bool = false,
        @ViewBuilder label: @escaping (Item, Bool) -> LabelContent
    ) {
        self.items = items
        self._selection = selection
        self.accent = accent
        self.allowHorizontalScroll = allowHorizontalScroll
        self.label = label
    }

    public var body: some View {
        let isDark = colorScheme == .dark
        if allowHorizontalScroll {
            ViewThatFits(in: .horizontal) {
                segmentedCapsule(isDark: isDark)
                    .fixedSize(horizontal: true, vertical: false)

                ScrollView(.horizontal, showsIndicators: false) {
                    segmentedCapsule(isDark: isDark)
                }
            }
        } else {
            segmentedCapsule(isDark: isDark)
                .fixedSize(horizontal: true, vertical: false)
        }
    }

    private func segmentedCapsule(isDark: Bool) -> some View {
        HStack(spacing: 3) {
            ForEach(items) { item in
                let selected = item == selection
                let hovered = hoveredItem == item && !selected
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    withAnimation(GoldenGateMetrics.snappySpring) {
                        selection = item
                    }
                } label: {
                    label(item, selected)
                        .lineLimit(1)
                        .fixedSize(horizontal: true, vertical: false)
                        .foregroundStyle(selected ? Color.primary : (hovered ? Color.primary.opacity(0.88) : Color.secondary))
                        .padding(.horizontal, 13)
                        .padding(.vertical, 7)
                        .background {
                            if selected {
                                activePillBackground(isDark: isDark)
                                    .matchedGeometryEffect(id: "ActiveSegmentPill", in: pillNamespace)
                            } else if hovered {
                                Capsule()
                                    .fill(Color.primary.opacity(0.055))
                            }
                        }
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                #if os(macOS)
                .onHover { isHovering in
                    hoveredItem = isHovering ? item : (hoveredItem == item ? nil : hoveredItem)
                }
                #endif
            }
        }
        .animation(GoldenGateMetrics.snappySpring, value: hoveredItem)
        .padding(3.5)
        .background {
            Capsule()
                .fill(Color.primary.opacity(isDark ? 0.05 : 0.04))
        }
        .overlay {
            Capsule()
                .strokeBorder(BrandTheme.editorialHairline, lineWidth: 1)
        }
    }

    @ViewBuilder
    private func activePillBackground(isDark: Bool) -> some View {
        #if compiler(>=6.2)
        if #available(macOS 26.0, iOS 26.0, *) {
            Capsule()
                .fill(Color.clear)
                .glassEffect(.regular.tint(accent.opacity(isDark ? 0.24 : 0.16)).interactive(), in: Capsule())
        } else {
            fallbackActivePill(isDark: isDark)
        }
        #else
        fallbackActivePill(isDark: isDark)
        #endif
    }

    private func fallbackActivePill(isDark: Bool) -> some View {
        Capsule()
            .fill(isDark ? Color.white.opacity(0.14) : Color.white.opacity(0.92))
            .overlay(
                Capsule()
                    .strokeBorder(
                        isDark ? Color.white.opacity(0.20) : Color.black.opacity(0.08),
                        lineWidth: 0.75
                    )
            )
            .shadow(color: Color.black.opacity(isDark ? 0.22 : 0.08), radius: 4, y: 1.5)
    }
}

// MARK: - Editorial Button Styles

/// Single disciplined primary CTA button with subtle top specular highlight and spring press response.
public struct GoldenGatePrimaryButtonStyle: ButtonStyle {
    public var accent: Color
    public var cornerRadius: CGFloat

    public init(accent: Color = BrandTheme.editorialBlue, cornerRadius: CGFloat = GoldenGateMetrics.nestedCornerRadius) {
        self.accent = accent
        self.cornerRadius = cornerRadius
    }

    public func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        configuration.label
            .scaledFont(.callout, weight: .semibold)
            .foregroundStyle(Color.white)
            .padding(.horizontal, 17)
            .padding(.vertical, 10)
            .background {
                shape
                    .fill(
                        LinearGradient(
                            colors: [accent, accent.opacity(0.88)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
            .overlay {
                shape.strokeBorder(
                    LinearGradient(
                        colors: [Color.white.opacity(0.35), Color.clear],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 1
                )
            }
            .shadow(color: accent.opacity(configuration.isPressed ? 0.15 : 0.28), radius: configuration.isPressed ? 4 : 10, y: configuration.isPressed ? 2 : 4)
            .scaleEffect(configuration.isPressed ? 0.975 : 1.0)
            .animation(GoldenGateMetrics.snappySpring, value: configuration.isPressed)
    }
}

/// Quiet secondary Liquid Glass capsule button.
public struct GoldenGateGlassPillButtonStyle: ButtonStyle {
    public var isSelected: Bool
    public var accent: Color

    public init(isSelected: Bool = false, accent: Color = BrandTheme.editorialBlue) {
        self.isSelected = isSelected
        self.accent = accent
    }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaledFont(.footnote, weight: isSelected ? .semibold : .medium)
            .foregroundStyle(isSelected ? accent : .primary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .goldenGateGlassPill(isSelected: isSelected, accent: accent)
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(GoldenGateMetrics.snappySpring, value: configuration.isPressed)
    }
}

// MARK: - Pronunciation Waveform Indicator

/// Clean 4-bar equalizer waveform for interactive audio phrases.
public struct GoldenGateAudioWaveView: View {
    public let isAnimating: Bool
    public let color: Color

    @State private var phase: Bool = false

    public init(isAnimating: Bool, color: Color = BrandTheme.editorialBlue) {
        self.isAnimating = isAnimating
        self.color = color
    }

    private let restHeights: [CGFloat] = [5, 8, 6, 4]
    private let activeHeights: [CGFloat] = [13, 6, 14, 9]

    public var body: some View {
        HStack(spacing: 2.5) {
            ForEach(0..<4, id: \.self) { index in
                Capsule()
                    .fill(color.opacity(isAnimating ? 1.0 : 0.72))
                    .frame(
                        width: 2.5,
                        height: isAnimating
                            ? (phase ? activeHeights[index] : restHeights[(index + 1) % 4])
                            : restHeights[index]
                    )
                    .animation(
                        isAnimating
                            ? .easeInOut(duration: 0.34 + Double(index) * 0.07).repeatForever(autoreverses: true)
                            : GoldenGateMetrics.snappySpring,
                        value: phase
                    )
            }
        }
        .frame(height: 15)
        .onAppear {
            if isAnimating { phase = true }
        }
        .onChange(of: isAnimating) { _, active in
            phase = active
        }
    }
}

// MARK: - Editorial Glass Dropdown Menu

/// Option descriptor rendered inside `GoldenGateDropdownMenu`.
public struct GoldenGateDropdownOption<Value: Hashable>: Identifiable {
    public let id: String
    public let value: Value
    public let title: String
    public let subtitle: String?
    public let icon: String?

    public init(
        id: String? = nil,
        value: Value,
        title: String,
        subtitle: String? = nil,
        icon: String? = nil
    ) {
        self.id = id ?? "\(title)-\(String(describing: value))"
        self.value = value
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
    }
}

/// Unified Golden Gate Editorial dropdown menu replacing raw system `Picker(.menu)` boxes.
public struct GoldenGateDropdownMenu<Value: Hashable>: View {
    public let title: String
    public let leadingIcon: String?
    public let options: [GoldenGateDropdownOption<Value>]
    @Binding public var selection: Value
    public let accent: Color
    public let placeholder: String?
    public let fullWidth: Bool
    public let isDisabled: Bool
    public let onSelect: ((Value) -> Void)?

    @Environment(\.colorScheme) private var colorScheme
    @State private var isHovered: Bool = false

    public init(
        title: String,
        leadingIcon: String? = nil,
        options: [GoldenGateDropdownOption<Value>],
        selection: Binding<Value>,
        accent: Color = BrandTheme.editorialBlue,
        placeholder: String? = nil,
        fullWidth: Bool = false,
        isDisabled: Bool = false,
        onSelect: ((Value) -> Void)? = nil
    ) {
        self.title = title
        self.leadingIcon = leadingIcon
        self.options = options
        self._selection = selection
        self.accent = accent
        self.placeholder = placeholder
        self.fullWidth = fullWidth
        self.isDisabled = isDisabled
        self.onSelect = onSelect
    }

    public var body: some View {
        let isDark = colorScheme == .dark
        let selectedOption = options.first(where: { $0.value == selection })
        let displayText = selectedOption?.title ?? placeholder ?? title
        let cornerRadius: CGFloat = fullWidth ? 11 : GoldenGateMetrics.pillCornerRadius
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        let fillAlpha = isHovered && !isDisabled ? 0.08 : 0.048
        let borderTop = isDark ? Color.white.opacity(isHovered ? 0.22 : 0.16) : Color.black.opacity(isHovered ? 0.14 : 0.09)

        Menu {
            ForEach(options) { option in
                let itemText = option.subtitle.map { "\(option.title) — \($0)" } ?? option.title
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    withAnimation(GoldenGateMetrics.snappySpring) {
                        selection = option.value
                    }
                    onSelect?(option.value)
                } label: {
                    if option.value == selection {
                        Label(itemText, systemImage: "checkmark")
                    } else if let icon = option.icon {
                        Label(itemText, systemImage: icon)
                    } else {
                        Text(itemText)
                    }
                }
            }
        } label: {
            HStack(spacing: 8) {
                if let leadingIcon {
                    Image(systemName: leadingIcon)
                        .scaledFont(.caption, weight: .semibold)
                        .foregroundStyle(isDisabled ? Color.secondary : accent)
                }

                Text(displayText)
                    .scaledFont(.footnote, weight: .medium)
                    .foregroundStyle(isDisabled ? .tertiary : .primary)
                    .lineLimit(1)
                    .truncationMode(.tail)

                if fullWidth {
                    Spacer(minLength: 8)
                }

                Image(systemName: "chevron.up.chevron.down")
                    .scaledFont(.caption2, weight: .semibold)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 13)
            .padding(.vertical, 8)
            .frame(maxWidth: fullWidth ? .infinity : nil, alignment: .leading)
            .background {
                shape.fill(Color.primary.opacity(fillAlpha))
            }
            .overlay {
                shape.strokeBorder(
                    LinearGradient(
                        colors: [borderTop, BrandTheme.editorialHairline],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    lineWidth: 1
                )
            }
            .contentShape(shape)
        }
        .menuStyle(.button)
        .buttonStyle(.plain)
        .menuIndicator(.hidden)
        .disabled(isDisabled)
        #if os(macOS)
        .onHover { hovering in
            isHovered = hovering
        }
        #endif
        .animation(GoldenGateMetrics.snappySpring, value: isHovered)
        .accessibilityLabel(title)
        .accessibilityValue(displayText)
    }
}
