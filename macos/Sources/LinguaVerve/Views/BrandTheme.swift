import SwiftUI
import LinguaVerveCore

/// Official LinguaVerve editorial palette & reusable native vector crest.
public enum BrandTheme {
    public static let champagneGold = Color(red: 0.937, green: 0.745, blue: 0.275)
    public static let deepGold = Color(red: 0.761, green: 0.525, blue: 0.133)
    public static let celestialSky = Color(red: 0.220, green: 0.741, blue: 0.973)
    public static let emeraldMint = Color(red: 0.063, green: 0.725, blue: 0.506)

    public static func cefrColor(for level: String) -> Color {
        switch level {
        case "A1": return emeraldMint
        case "A2": return .teal
        case "B1": return celestialSky
        case "B2": return .indigo
        case "C1": return champagneGold
        case "C2": return .pink
        default: return .secondary
        }
    }
}

/// Native SwiftUI vector emblem matching LinguaVerve's official AppIcon & Web BrandMark.
public struct BrandCrestView: View {
    public var size: CGFloat

    public init(size: CGFloat = 32) {
        self.size = size
    }

    public var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.24, style: .continuous)
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 0.102, green: 0.157, blue: 0.275),
                            Color(red: 0.047, green: 0.071, blue: 0.129),
                            Color(red: 0.024, green: 0.035, blue: 0.067)
                        ],
                        center: .init(x: 0.5, y: 0.28),
                        startRadius: 0,
                        endRadius: size * 0.78
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: size * 0.24, style: .continuous)
                        .strokeBorder(BrandTheme.champagneGold.opacity(0.42), lineWidth: max(0.75, size * 0.025))
                )

            // Subtle celestial ring
            Circle()
                .strokeBorder(Color.white.opacity(0.12), lineWidth: max(0.5, size * 0.015))
                .frame(width: size * 0.72, height: size * 0.72)

            // Tilted meridian orbit
            Ellipse()
                .stroke(
                    LinearGradient(
                        colors: [BrandTheme.celestialSky.opacity(0.75), BrandTheme.champagneGold.opacity(0.85)],
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    lineWidth: max(0.8, size * 0.035)
                )
                .frame(width: size * 0.76, height: size * 0.28)
                .rotationEffect(.degrees(24))

            // Monogram L + V
            HStack(spacing: -size * 0.05) {
                Text("L")
                    .font(.system(size: size * 0.44, weight: .bold, design: .serif))
                    .foregroundStyle(.white)
                Text("V")
                    .font(.system(size: size * 0.44, weight: .bold, design: .serif))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [
                                Color(red: 0.996, green: 0.929, blue: 0.675),
                                BrandTheme.champagneGold
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
            .offset(y: size * 0.01)

            // Sky phonetic star spark
            Image(systemName: "sparkle")
                .font(.system(size: max(5, size * 0.14), weight: .bold))
                .foregroundStyle(BrandTheme.celestialSky)
                .offset(x: size * 0.13, y: -size * 0.20)
        }
        .frame(width: size, height: size)
        .shadow(color: .black.opacity(0.24), radius: size * 0.12, y: size * 0.06)
    }
}
