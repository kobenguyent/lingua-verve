import SwiftUI

/// A wrapping horizontal flow layout for badges, tags, filter pills, and tool chips.
/// Clamps individual child widths to `maxWidth` so enlarged text (up to 160%) wraps instead of overflowing horizontally.
public struct FlowLayout: Layout {
    public var spacing: CGFloat
    public var lineSpacing: CGFloat

    public init(spacing: CGFloat = 6, lineSpacing: CGFloat = 6) {
        self.spacing = spacing
        self.lineSpacing = lineSpacing
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        let childProposal = ProposedViewSize(width: maxWidth.isFinite ? maxWidth : nil, height: nil)
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var totalWidth: CGFloat = 0

        for subview in subviews {
            let rawSize = subview.sizeThatFits(childProposal)
            let itemWidth = maxWidth.isFinite ? min(rawSize.width, maxWidth) : rawSize.width
            let size = CGSize(width: itemWidth, height: rawSize.height)

            if currentX > 0 && currentX + size.width > maxWidth {
                currentX = 0
                currentY += lineHeight + lineSpacing
                lineHeight = 0
            }
            totalWidth = max(totalWidth, currentX + size.width)
            currentX += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }

        return CGSize(
            width: maxWidth.isFinite ? maxWidth : totalWidth,
            height: currentY + lineHeight
        )
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let maxWidth = bounds.width
        let childProposal = ProposedViewSize(width: maxWidth.isFinite ? maxWidth : nil, height: nil)
        var currentX = bounds.minX
        var currentY = bounds.minY
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let rawSize = subview.sizeThatFits(childProposal)
            let itemWidth = maxWidth.isFinite ? min(rawSize.width, maxWidth) : rawSize.width
            let size = CGSize(width: itemWidth, height: rawSize.height)

            if currentX > bounds.minX && currentX + size.width > bounds.maxX + 0.5 {
                currentX = bounds.minX
                currentY += lineHeight + lineSpacing
                lineHeight = 0
            }
            subview.place(
                at: CGPoint(x: currentX, y: currentY),
                proposal: ProposedViewSize(width: size.width, height: size.height)
            )
            currentX += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
    }
}

/// Centers a single child view at a proportional fraction of available width (with a safe minimum),
/// without distorting text or collapsing ScrollView height like GeometryReader.
public struct ProportionalCenteredLayout: Layout {
    public var widthRatio: CGFloat
    public var minWidth: CGFloat

    public init(widthRatio: CGFloat, minWidth: CGFloat = 220) {
        self.widthRatio = widthRatio
        self.minWidth = minWidth
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        guard let child = subviews.first else { return .zero }
        let availableWidth = proposal.width ?? 520
        let targetWidth = min(availableWidth, max(minWidth, availableWidth * widthRatio))
        let childSize = child.sizeThatFits(ProposedViewSize(width: targetWidth, height: nil))
        return CGSize(width: availableWidth, height: childSize.height)
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        guard let child = subviews.first else { return }
        let targetWidth = min(bounds.width, max(minWidth, bounds.width * widthRatio))
        let childSize = child.sizeThatFits(ProposedViewSize(width: targetWidth, height: nil))
        let originX = bounds.midX - targetWidth / 2
        child.place(
            at: CGPoint(x: originX, y: bounds.minY),
            proposal: ProposedViewSize(width: targetWidth, height: childSize.height)
        )
    }
}
