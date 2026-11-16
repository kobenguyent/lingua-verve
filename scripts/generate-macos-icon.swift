#!/usr/bin/env swift
import AppKit
import CoreGraphics
import Foundation

let args = CommandLine.arguments
guard args.count >= 2 else {
    fputs("Usage: generate-macos-icon.swift <output.icns> [preview.png]\n", stderr)
    exit(1)
}

let outputIcnsPath = args[1]
let previewPngPath = args.count >= 3 ? args[2] : nil

func drawLogo(size: CGFloat) -> NSImage {
    let image = NSImage(size: NSSize(width: size, height: size))
    image.lockFocus()
    guard let ctx = NSGraphicsContext.current?.cgContext else {
        image.unlockFocus()
        return image
    }

    ctx.setAllowsAntialiasing(true)
    ctx.setShouldAntialias(true)
    ctx.interpolationQuality = .high

    let s = size / 1024.0
    ctx.scaleBy(x: s, y: s)

    // Standard macOS icon tile inset (~100px margin around 824x824 squircle)
    let iconRect = CGRect(x: 100, y: 100, width: 824, height: 824)
    let cornerRadius: CGFloat = 186
    let bgPath = CGPath(roundedRect: iconRect, cornerWidth: cornerRadius, cornerHeight: cornerRadius, transform: nil)

    // 1. Subtle ambient shadow behind the tile
    ctx.saveGState()
    ctx.setShadow(
        offset: CGSize(width: 0, height: -16),
        blur: 28,
        color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.40)
    )
    ctx.addPath(bgPath)
    ctx.setFillColor(CGColor(red: 0.039, green: 0.059, blue: 0.110, alpha: 1.0))
    ctx.fillPath()
    ctx.restoreGState()

    // 2. Clip to squircle and paint seamless deep sapphire-obsidian radial gradient
    ctx.saveGState()
    ctx.addPath(bgPath)
    ctx.clip()

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bgColors = [
        CGColor(red: 0.102, green: 0.157, blue: 0.275, alpha: 1.0), // Subtle midnight sapphire highlight
        CGColor(red: 0.047, green: 0.071, blue: 0.129, alpha: 1.0), // Deep ink slate
        CGColor(red: 0.024, green: 0.035, blue: 0.067, alpha: 1.0)  // Obsidian outer rim
    ] as CFArray
    if let bgGrad = CGGradient(colorsSpace: colorSpace, colors: bgColors, locations: [0.0, 0.58, 1.0]) {
        ctx.drawRadialGradient(
            bgGrad,
            startCenter: CGPoint(x: 512, y: 690),
            startRadius: 0,
            endCenter: CGPoint(x: 512, y: 512),
            endRadius: 590,
            options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
        )
    }

    // 3. Fine astronomical / linguistic meridian circles
    ctx.saveGState()
    ctx.setStrokeColor(CGColor(red: 0.94, green: 0.96, blue: 1.0, alpha: 0.09))
    ctx.setLineWidth(2.5)
    ctx.strokeEllipse(in: CGRect(x: 202, y: 202, width: 620, height: 620))

    ctx.setStrokeColor(CGColor(red: 0.22, green: 0.74, blue: 0.97, alpha: 0.15))
    ctx.setLineWidth(2.0)
    ctx.strokeEllipse(in: CGRect(x: 262, y: 262, width: 500, height: 500))
    ctx.restoreGState()

    // 4. Graceful tilted meridian orbit (Sky Cyan -> Champagne Gold)
    ctx.saveGState()
    ctx.translateBy(x: 512, y: 506)
    ctx.rotate(by: -0.42)
    let orbitRect = CGRect(x: -322, y: -112, width: 644, height: 224)
    ctx.addPath(CGPath(ellipseIn: orbitRect, transform: nil))
    ctx.setLineWidth(8.5)
    ctx.replacePathWithStrokedPath()
    ctx.clip()

    let orbitColors = [
        CGColor(red: 0.22, green: 0.74, blue: 0.97, alpha: 0.72),
        CGColor(red: 0.96, green: 0.82, blue: 0.42, alpha: 0.84),
        CGColor(red: 0.22, green: 0.74, blue: 0.97, alpha: 0.25)
    ] as CFArray
    if let orbitGrad = CGGradient(colorsSpace: colorSpace, colors: orbitColors, locations: [0.0, 0.55, 1.0]) {
        ctx.drawLinearGradient(
            orbitGrad,
            start: CGPoint(x: -325, y: -60),
            end: CGPoint(x: 325, y: 80),
            options: []
        )
    }
    ctx.restoreGState()

    // 5. Sculpted Editorial Monogram: Crisp Ivory "L" + Burnished Gold "V"
    // Optically centered around x = 512, y = 512
    let lPath = CGMutablePath()
    lPath.move(to: CGPoint(x: 294, y: 706))
    lPath.addLine(to: CGPoint(x: 356, y: 706))
    lPath.addLine(to: CGPoint(x: 356, y: 382))
    lPath.addLine(to: CGPoint(x: 472, y: 382))
    lPath.addLine(to: CGPoint(x: 492, y: 330)) // Editorial angled serif bevel
    lPath.addLine(to: CGPoint(x: 312, y: 330))
    lPath.addQuadCurve(to: CGPoint(x: 294, y: 348), control: CGPoint(x: 294, y: 330))
    lPath.closeSubpath()

    ctx.saveGState()
    ctx.setShadow(
        offset: CGSize(width: 0, height: -8),
        blur: 16,
        color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.42)
    )
    ctx.addPath(lPath)
    ctx.clip()
    let ivoryColors = [
        CGColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0),
        CGColor(red: 0.88, green: 0.92, blue: 0.97, alpha: 1.0)
    ] as CFArray
    if let ivoryGrad = CGGradient(colorsSpace: colorSpace, colors: ivoryColors, locations: [0.0, 1.0]) {
        ctx.drawLinearGradient(
            ivoryGrad,
            start: CGPoint(x: 294, y: 706),
            end: CGPoint(x: 492, y: 330),
            options: []
        )
    }
    ctx.restoreGState()

    // 5b. Symmetric Precision Calligraphic "V" (Champagne Gold)
    // Clean visual gap from L; crisp mitered apex at (578, 330)
    let vPath = CGMutablePath()
    vPath.move(to: CGPoint(x: 422, y: 706))
    vPath.addLine(to: CGPoint(x: 490, y: 706))
    vPath.addLine(to: CGPoint(x: 578, y: 426))
    vPath.addLine(to: CGPoint(x: 666, y: 706))
    vPath.addLine(to: CGPoint(x: 734, y: 706))
    vPath.addLine(to: CGPoint(x: 604, y: 330))
    vPath.addLine(to: CGPoint(x: 552, y: 330))
    vPath.closeSubpath()

    ctx.saveGState()
    ctx.setShadow(
        offset: CGSize(width: 0, height: -10),
        blur: 18,
        color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.48)
    )
    ctx.addPath(vPath)
    ctx.clip()
    let goldColors = [
        CGColor(red: 0.996, green: 0.929, blue: 0.675, alpha: 1.0), // Luminous champagne
        CGColor(red: 0.937, green: 0.745, blue: 0.275, alpha: 1.0), // Burnished gold
        CGColor(red: 0.761, green: 0.525, blue: 0.133, alpha: 1.0)  // Warm antique gold
    ] as CFArray
    if let goldGrad = CGGradient(colorsSpace: colorSpace, colors: goldColors, locations: [0.0, 0.52, 1.0]) {
        ctx.drawLinearGradient(
            goldGrad,
            start: CGPoint(x: 430, y: 706),
            end: CGPoint(x: 690, y: 330),
            options: []
        )
    }
    ctx.restoreGState()

    // 6. Luminous Sky-Cyan 4-Point Phonetic Spark nestled cleanly above the V valley
    let starCenter = CGPoint(x: 578, y: 660)
    let starR: CGFloat = 24
    let starPath = CGMutablePath()
    starPath.move(to: CGPoint(x: starCenter.x, y: starCenter.y + starR))
    starPath.addQuadCurve(to: CGPoint(x: starCenter.x + starR, y: starCenter.y), control: CGPoint(x: starCenter.x + 4, y: starCenter.y + 4))
    starPath.addQuadCurve(to: CGPoint(x: starCenter.x, y: starCenter.y - starR), control: CGPoint(x: starCenter.x + 4, y: starCenter.y - 4))
    starPath.addQuadCurve(to: CGPoint(x: starCenter.x - starR, y: starCenter.y), control: CGPoint(x: starCenter.x - 4, y: starCenter.y - 4))
    starPath.addQuadCurve(to: CGPoint(x: starCenter.x, y: starCenter.y + starR), control: CGPoint(x: starCenter.x - 4, y: starCenter.y + 4))
    starPath.closeSubpath()

    ctx.saveGState()
    ctx.addPath(starPath)
    ctx.setFillColor(CGColor(red: 0.35, green: 0.82, blue: 1.0, alpha: 0.96))
    ctx.fillPath()
    ctx.restoreGState()

    // 7. Delicate metallic champagne inner rim
    let innerRim = CGPath(
        roundedRect: iconRect.insetBy(dx: 2.0, dy: 2.0),
        cornerWidth: cornerRadius - 2.0,
        cornerHeight: cornerRadius - 2.0,
        transform: nil
    )
    ctx.addPath(innerRim)
    ctx.setStrokeColor(CGColor(red: 0.95, green: 0.80, blue: 0.42, alpha: 0.34))
    ctx.setLineWidth(4.0)
    ctx.strokePath()

    ctx.restoreGState()

    image.unlockFocus()
    return image
}

func savePNG(_ image: NSImage, sizePx: Int, to url: URL) throws {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: sizePx,
        pixelsHigh: sizePx,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    rep.size = NSSize(width: sizePx, height: sizePx)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    image.draw(in: NSRect(x: 0, y: 0, width: sizePx, height: sizePx))
    NSGraphicsContext.restoreGraphicsState()
    guard let png = rep.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "IconGen", code: 1)
    }
    try png.write(to: url)
}

let masterImage = drawLogo(size: 1024)

if let preview = previewPngPath {
    try savePNG(masterImage, sizePx: 1024, to: URL(fileURLWithPath: preview))
}

let fm = FileManager.default
let tempDir = fm.temporaryDirectory.appendingPathComponent("LinguaVerve.iconset")
try? fm.removeItem(at: tempDir)
try fm.createDirectory(at: tempDir, withIntermediateDirectories: true)

let entries: [(String, Int)] = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024)
]

for (filename, px) in entries {
    let sized = drawLogo(size: CGFloat(px))
    try savePNG(sized, sizePx: px, to: tempDir.appendingPathComponent(filename))
}

let icnsURL = URL(fileURLWithPath: outputIcnsPath)
try? fm.createDirectory(at: icnsURL.deletingLastPathComponent(), withIntermediateDirectories: true)

let proc = Process()
proc.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
proc.arguments = ["-c", "icns", tempDir.path, "-o", icnsURL.path]
try proc.run()
proc.waitUntilExit()
if proc.terminationStatus != 0 {
    fputs("iconutil failed with status \(proc.terminationStatus)\n", stderr)
    exit(proc.terminationStatus)
}
try? fm.removeItem(at: tempDir)
print("[icon] Generated official AppIcon.icns at \(icnsURL.path)")
