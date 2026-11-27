import SwiftUI
import LinguaVerveCore
#if os(macOS)
import AppKit
import UniformTypeIdentifiers
#elseif os(iOS)
import UIKit
#endif

/// Official museum-grade LinguaVerve Simulated Proficiency Certificate viewer & exporter
/// for macOS 14+, iPadOS 17+, and iOS 17+.
public struct LinguaVerveCertificateSheetView: View {
    @Bindable var store: CurriculumStore
    public let attempt: ExamAttemptRecord
    @Environment(\.dismiss) private var dismiss

    @State private var nameInput: String
    @State private var copiedCredential = false
    @State private var exportNotice: String? = nil
    #if os(iOS)
    @State private var sharedPDFURL: URL? = nil
    #endif

    public init(store: CurriculumStore, attempt: ExamAttemptRecord) {
        self.store = store
        self.attempt = attempt
        self._nameInput = State(initialValue: store.learnerState.learnerName ?? "")
    }

    private var passingMark: Int {
        store.exam(for: attempt)?.exam.passingScorePercent ?? 60
    }

    private var certificate: LinguaVerveCertificate {
        CertificateService.buildCertificate(
            for: attempt,
            learnerName: nameInput,
            passingScorePercent: passingMark
        )
    }

    public var body: some View {
        let cert = certificate
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    personalizationAndEncouragementBar(cert: cert)

                    CertificateDocumentCanvas(certificate: cert)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .shadow(color: .black.opacity(0.24), radius: 18, y: 8)
                }
                .padding(18)
                .frame(maxWidth: 1020)
                .frame(maxWidth: .infinity)
            }
            .navigationTitle("Official LinguaVerve Certificate")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItemGroup(placement: .primaryAction) {
                    Button {
                        PlatformClipboard.copy(cert.plainTextCredential)
                        NativeAudioEngine.shared.playClickSound()
                        copiedCredential = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            copiedCredential = false
                        }
                    } label: {
                        Label(copiedCredential ? "Copied" : "Copy Credential", systemImage: copiedCredential ? "checkmark" : "doc.on.doc")
                    }

                    #if os(macOS)
                    Button {
                        exportPNGOnMac(cert: cert)
                    } label: {
                        Label("Save PNG", systemImage: "photo")
                    }

                    Button {
                        exportPDFOnMac(cert: cert)
                    } label: {
                        Label("Save PDF", systemImage: "doc.richtext")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.deepGold)
                    #elseif os(iOS)
                    if let pdfURL = sharedPDFURL {
                        ShareLink(item: pdfURL) {
                            Label("Share PDF", systemImage: "square.and.arrow.up")
                        }
                    } else {
                        Button {
                            if let url = generateTemporaryPDF(cert: cert) {
                                sharedPDFURL = url
                                flashNotice("Certificate PDF ready — tap Share PDF to save or send.")
                            }
                        } label: {
                            Label("Prepare PDF", systemImage: "doc.richtext")
                        }
                    }
                    #endif
                }
            }
            #if os(iOS)
            .onAppear {
                sharedPDFURL = generateTemporaryPDF(cert: cert)
            }
            .onChange(of: nameInput) { _, _ in
                sharedPDFURL = generateTemporaryPDF(cert: certificate)
            }
            #endif
        }
        #if os(macOS)
        .frame(minWidth: 840, idealWidth: 980, minHeight: 680, idealHeight: 820)
        #endif
    }

    // MARK: - Personalization & Celebration Header

    private func personalizationAndEncouragementBar(cert: LinguaVerveCertificate) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "sparkles")
                    .scaledFont(.title3, weight: .bold)
                    .foregroundStyle(BrandTheme.deepGold)
                    .padding(.top, 2)
                VStack(alignment: .leading, spacing: 3) {
                    Text(cert.encouragementHeadline)
                        .scaledFont(.headline, weight: .bold)
                    Text(cert.encouragementMessage)
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                if let notice = exportNotice {
                    Text(notice)
                        .scaledFont(.caption2, weight: .semibold, design: .monospaced)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.16)))
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 10) {
                    nameFieldBlock
                    Spacer()
                    credentialIDBadge(cert: cert)
                }
                VStack(alignment: .leading, spacing: 8) {
                    nameFieldBlock
                    credentialIDBadge(cert: cert)
                }
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(BrandTheme.champagneGold.opacity(0.11))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(BrandTheme.deepGold.opacity(0.32), lineWidth: 1)
                )
        )
    }

    private var nameFieldBlock: some View {
        HStack(spacing: 8) {
            Image(systemName: "person.text.rectangle")
                .scaledFont(.subheadline)
                .foregroundStyle(BrandTheme.deepGold)
            Text("Name on Certificate:")
                .scaledFont(.caption, weight: .semibold)
            TextField("Enter your full name…", text: $nameInput)
                .textFieldStyle(.roundedBorder)
                .frame(maxWidth: 260)
                .onChange(of: nameInput) { _, newValue in
                    store.setLearnerName(newValue)
                }
        }
    }

    private func credentialIDBadge(cert: LinguaVerveCertificate) -> some View {
        Label(cert.certificateId, systemImage: "checkmark.seal.fill")
            .scaledFont(.caption2, weight: .bold, design: .monospaced)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(Color.primary.opacity(0.06)))
            .foregroundStyle(.primary)
    }

    private func flashNotice(_ message: String) {
        exportNotice = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            if exportNotice == message {
                exportNotice = nil
            }
        }
    }

    // MARK: - Native PDF & PNG Export (ImageRenderer)

    private func exportFilenameStem(cert: LinguaVerveCertificate) -> String {
        "LinguaVerve-Certificate-\(cert.language.shortCode)-\(cert.level.rawValue)-\(cert.issueDateCompact)"
    }

    @MainActor
    private func renderCertificatePDFData(cert: LinguaVerveCertificate) -> Data? {
        let exportView = CertificateDocumentCanvas(certificate: cert, isExportCanvas: true)
            .frame(width: 1120)
            .environment(\.appFontScale, 1.0)
            .environment(\.colorScheme, .light)

        let renderer = ImageRenderer(content: exportView)
        renderer.scale = 2.0

        let pdfData = NSMutableData()
        guard let consumer = CGDataConsumer(data: pdfData as CFMutableData) else { return nil }

        var success = false
        renderer.render { size, renderInContext in
            var mediaBox = CGRect(origin: .zero, size: size)
            guard let pdfContext = CGContext(consumer: consumer, mediaBox: &mediaBox, nil) else { return }
            pdfContext.beginPDFPage(nil)
            renderInContext(pdfContext)
            pdfContext.endPDFPage()
            pdfContext.closePDF()
            success = true
        }
        return success ? (pdfData as Data) : nil
    }

    #if os(macOS)
    @MainActor
    private func exportPDFOnMac(cert: LinguaVerveCertificate) {
        guard let data = renderCertificatePDFData(cert: cert) else { return }
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.pdf]
        panel.nameFieldStringValue = "\(exportFilenameStem(cert: cert)).pdf"
        panel.title = "Save Official LinguaVerve Certificate (PDF)"
        if panel.runModal() == .OK, let url = panel.url {
            do {
                try data.write(to: url, options: .atomic)
                NativeAudioEngine.shared.playSuccessChime()
                flashNotice("Saved \(url.lastPathComponent)")
            } catch {
                flashNotice("Export failed: \(error.localizedDescription)")
            }
        }
    }

    @MainActor
    private func exportPNGOnMac(cert: LinguaVerveCertificate) {
        let exportView = CertificateDocumentCanvas(certificate: cert, isExportCanvas: true)
            .frame(width: 1120)
            .environment(\.appFontScale, 1.0)
            .environment(\.colorScheme, .light)
        let renderer = ImageRenderer(content: exportView)
        renderer.scale = 2.0
        guard let nsImage = renderer.nsImage,
              let tiff = nsImage.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff),
              let pngData = bitmap.representation(using: .png, properties: [:]) else {
            return
        }
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.png]
        panel.nameFieldStringValue = "\(exportFilenameStem(cert: cert)).png"
        panel.title = "Save Official LinguaVerve Certificate (PNG)"
        if panel.runModal() == .OK, let url = panel.url {
            do {
                try pngData.write(to: url, options: .atomic)
                NativeAudioEngine.shared.playSuccessChime()
                flashNotice("Saved \(url.lastPathComponent)")
            } catch {
                flashNotice("Export failed: \(error.localizedDescription)")
            }
        }
    }
    #elseif os(iOS)
    @MainActor
    private func generateTemporaryPDF(cert: LinguaVerveCertificate) -> URL? {
        guard let data = renderCertificatePDFData(cert: cert) else { return nil }
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("\(exportFilenameStem(cert: cert)).pdf")
        try? data.write(to: url, options: .atomic)
        return url
    }
    #endif
}

// MARK: - Archival Diploma Canvas (Shared for Live Preview & Vector PDF/PNG Rendering)

public struct CertificateDocumentCanvas: View {
    public let certificate: LinguaVerveCertificate
    public var isExportCanvas: Bool = false

    private let inkNavy = Color(red: 0.047, green: 0.071, blue: 0.129)
    private let mutedSlate = Color(red: 0.278, green: 0.333, blue: 0.412)
    private let parchmentTop = Color(red: 0.992, green: 0.984, blue: 0.961)
    private let parchmentMid = Color(red: 0.980, green: 0.961, blue: 0.910)
    private let parchmentBottom = Color(red: 0.961, green: 0.922, blue: 0.835)
    private let goldInk = Color(red: 0.580, green: 0.392, blue: 0.078)
    private let borderGold = Color(red: 0.831, green: 0.643, blue: 0.235)
    private let cardStroke = Color(red: 0.855, green: 0.776, blue: 0.608)

    public init(certificate: LinguaVerveCertificate, isExportCanvas: Bool = false) {
        self.certificate = certificate
        self.isExportCanvas = isExportCanvas
    }

    public var body: some View {
        ZStack {
            // Archival ivory parchment base
            LinearGradient(
                colors: [parchmentTop, parchmentMid, parchmentBottom],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Watermark emblem
            BrandCrestView(size: 260)
                .opacity(0.045)
                .allowsHitTesting(false)

            // Triple official guilloché border + content
            VStack(spacing: 18) {
                institutionHeader
                recipientSection
                honorsRibbon
                skillsTranscriptSection
                cefrCanDoBox
                metadataStrip
                signatoriesAndSealRow
                authenticityFooter
            }
            .padding(.horizontal, isExportCanvas ? 44 : 28)
            .padding(.vertical, isExportCanvas ? 36 : 26)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6, 4]))
                    .foregroundStyle(borderGold.opacity(0.75))
                    .padding(14)
            )
            .background(
                RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .strokeBorder(borderGold, lineWidth: 3)
                    .padding(8)
            )
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(inkNavy, lineWidth: 5)
            )
        }
        .foregroundStyle(inkNavy)
    }

    // MARK: - Sections

    private var institutionHeader: some View {
        VStack(spacing: 7) {
            BrandCrestView(size: 56)

            Text("LINGUAVERVE ACADEMY OF LANGUAGES · EXAMINATION BOARD")
                .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                .tracking(2.2)
                .foregroundStyle(goldInk)
                .multilineTextAlignment(.center)

            Text(certificate.documentHeader)
                .scaledFont(size: 24, weight: .bold, design: .serif)
                .foregroundStyle(inkNavy)
                .multilineTextAlignment(.center)

            Text(certificate.documentSubtitle)
                .scaledFont(size: 10, weight: .semibold)
                .tracking(1.6)
                .foregroundStyle(mutedSlate)
                .multilineTextAlignment(.center)

            LinearGradient(
                colors: [.clear, borderGold, .clear],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(maxWidth: 520, minHeight: 1.5, maxHeight: 1.5)
            .padding(.top, 2)
        }
    }

    private var recipientSection: some View {
        VStack(spacing: 8) {
            Text(certificate.certifyingPhrase)
                .scaledFont(size: 13.5, design: .serif, italic: true)
                .foregroundStyle(mutedSlate)
                .multilineTextAlignment(.center)

            Text(certificate.recipientName)
                .scaledFont(size: 36, weight: .bold, design: .serif)
                .foregroundStyle(inkNavy)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 12)

            Rectangle()
                .fill(borderGold.opacity(0.75))
                .frame(maxWidth: 460, minHeight: 1, maxHeight: 1)

            Text("has successfully completed and passed the full 4-Skill Simulated Certification Examination in")
                .scaledFont(size: 13)
                .foregroundStyle(mutedSlate)
                .multilineTextAlignment(.center)

            Text("\(certificate.language.flag) \(certificate.language.name) (\(certificate.language.nativeName)) — Level \(certificate.level.rawValue) · \(certificate.cefrBandTitle)")
                .scaledFont(size: 19, weight: .bold, design: .serif)
                .foregroundStyle(inkNavy)
                .multilineTextAlignment(.center)

            Text(certificate.frameworkEquivalence)
                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                .foregroundStyle(Color(red: 0.114, green: 0.306, blue: 0.847))
                .multilineTextAlignment(.center)
        }
    }

    private var honorsRibbon: some View {
        VStack(spacing: 3) {
            Text("★  \(certificate.honorsTitle)  ·  OVERALL \(certificate.overallScore)/100  ·  \(certificate.officialGradeLabel)  ★")
                .scaledFont(size: 12.5, weight: .bold, design: .monospaced)
                .foregroundStyle(Color(red: 0.976, green: 0.878, blue: 0.553))
                .multilineTextAlignment(.center)

            Text(certificate.honorsNativeLabel)
                .scaledFont(size: 11, weight: .medium)
                .foregroundStyle(Color(red: 0.729, green: 0.902, blue: 0.992))
        }
        .padding(.horizontal, 22)
        .padding(.vertical, 11)
        .frame(maxWidth: 780)
        .background(
            Capsule()
                .fill(
                    LinearGradient(
                        colors: [inkNavy, Color(red: 0.118, green: 0.161, blue: 0.231), inkNavy],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .overlay(
                    Capsule().strokeBorder(BrandTheme.champagneGold, lineWidth: 1.8)
                )
        )
    }

    private var skillsTranscriptSection: some View {
        let columns = isExportCanvas
            ? Array(repeating: GridItem(.flexible(), spacing: 12), count: 4)
            : [GridItem(.adaptive(minimum: 185), spacing: 10)]

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("OFFICIAL 4-SKILL EXAMINATION TRANSCRIPT")
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .foregroundStyle(goldInk)
                Spacer()
                Text("PASS THRESHOLD: ≥ \(certificate.passingScorePercent)% PER SKILL")
                    .scaledFont(size: 10, weight: .bold, design: .monospaced)
                    .foregroundStyle(goldInk)
            }

            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(certificate.skills) { detail in
                    skillCard(detail)
                }
            }
        }
    }

    private func skillCard(_ detail: CertificateSkillDetail) -> some View {
        let barTint: Color = detail.score >= 85
            ? Color(red: 0.059, green: 0.545, blue: 0.427)
            : detail.score >= 70
            ? Color(red: 0.114, green: 0.435, blue: 0.647)
            : BrandTheme.deepGold

        return VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(detail.englishLabel.uppercased())
                        .scaledFont(size: 11.5, weight: .bold, design: .serif)
                        .foregroundStyle(inkNavy)
                    Text(detail.nativeLabel)
                        .scaledFont(size: 10)
                        .foregroundStyle(mutedSlate)
                        .lineLimit(1)
                }
                Spacer(minLength: 4)
                HStack(alignment: .firstTextBaseline, spacing: 1) {
                    Text("\(detail.score)")
                        .scaledFont(size: 18, weight: .bold, design: .monospaced, monospacedDigit: true)
                        .foregroundStyle(inkNavy)
                    Text("/100")
                        .scaledFont(size: 9.5, weight: .semibold, design: .monospaced)
                        .foregroundStyle(mutedSlate)
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color(red: 0.937, green: 0.906, blue: 0.835))
                    Capsule()
                        .fill(barTint)
                        .frame(width: max(8, geo.size.width * CGFloat(min(100, detail.score)) / 100.0))
                }
            }
            .frame(height: 6)

            HStack(spacing: 4) {
                Image(systemName: "checkmark.circle.fill")
                    .scaledFont(size: 9.5)
                    .foregroundStyle(Color(red: 0.059, green: 0.463, blue: 0.431))
                Text(detail.passed ? "PASSED" : "RECORDED")
                    .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(Color(red: 0.059, green: 0.463, blue: 0.431))
                Spacer()
                if detail.aiGraded {
                    Text("AI EXAMINER")
                        .scaledFont(size: 8.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1.5)
                        .background(RoundedRectangle(cornerRadius: 4).fill(Color.blue.opacity(0.12)))
                        .foregroundStyle(Color(red: 0.086, green: 0.349, blue: 0.659))
                }
            }

            if let rubric = detail.rubric {
                Divider().overlay(cardStroke.opacity(0.5))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Task \(rubric.taskFulfillment)% · Coh \(rubric.coherenceCohesion)%")
                    Text("Lex \(rubric.lexicalRange)% · Gram \(rubric.grammaticalAccuracy)%")
                }
                .scaledFont(size: 9, design: .monospaced)
                .foregroundStyle(mutedSlate)
            }
        }
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color.white.opacity(0.95))
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .strokeBorder(cardStroke, lineWidth: 1.2)
                )
        )
    }

    private var cefrCanDoBox: some View {
        VStack(spacing: 5) {
            Text("OFFICIAL CEFR \(certificate.level.rawValue) CAN-DO COMPETENCY DESCRIPTOR")
                .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                .tracking(1.3)
                .foregroundStyle(goldInk)

            Text("“\(certificate.cefrCanDoStatement)”")
                .scaledFont(size: 12, design: .serif, italic: true)
                .foregroundStyle(inkNavy.opacity(0.88))
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 11)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color(red: 0.957, green: 0.925, blue: 0.855))
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .strokeBorder(cardStroke, lineWidth: 1)
                )
        )
    }

    private var metadataStrip: some View {
        let cols = isExportCanvas
            ? [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]
            : [GridItem(.adaptive(minimum: 230), spacing: 8)]

        return LazyVGrid(columns: cols, alignment: .leading, spacing: 6) {
            metaCell(label: "DATE ISSUED", value: certificate.issueDateFormatted)
            metaCell(label: "ALIGNED EXAM", value: certificate.alignedCertificate)
            metaCell(label: "DURATION", value: certificate.durationFormatted)
            metaCell(label: "CONDITIONS", value: certificate.examModeLabel)
            metaCell(label: "GRADING", value: certificate.gradingAuthority)
            metaCell(label: "CREDENTIAL ID", value: certificate.certificateId)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color.white.opacity(0.75))
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .strokeBorder(cardStroke.opacity(0.8), lineWidth: 1)
                )
        )
    }

    private func metaCell(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label)
                .scaledFont(size: 8.5, weight: .bold, design: .monospaced)
                .foregroundStyle(goldInk)
            Text(value)
                .scaledFont(size: 10.5, weight: .semibold, design: .monospaced)
                .foregroundStyle(inkNavy)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var signatoriesAndSealRow: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: 20) {
                signatoryBlock(certificate.signatories[0])
                Spacer(minLength: 10)
                embossedGoldSeal
                Spacer(minLength: 10)
                signatoryBlock(certificate.signatories[1])
            }
            VStack(spacing: 14) {
                embossedGoldSeal
                HStack(spacing: 16) {
                    signatoryBlock(certificate.signatories[0])
                    signatoryBlock(certificate.signatories[1])
                }
            }
        }
        .padding(.top, 4)
    }

    private func signatoryBlock(_ sig: CertificateSignatory) -> some View {
        VStack(spacing: 4) {
            Text(sig.signatureText)
                .scaledFont(size: 20, design: .serif, italic: true)
                .foregroundStyle(inkNavy.opacity(0.88))
            Rectangle()
                .fill(mutedSlate.opacity(0.55))
                .frame(width: 190, height: 1)
            Text(sig.name)
                .scaledFont(size: 11, weight: .bold)
                .foregroundStyle(inkNavy)
            Text("\(sig.title) · \(sig.division)")
                .scaledFont(size: 9.5)
                .foregroundStyle(mutedSlate)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: 250)
    }

    private var embossedGoldSeal: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 1.0, green: 0.945, blue: 0.710),
                            BrandTheme.champagneGold,
                            Color(red: 0.620, green: 0.416, blue: 0.071)
                        ],
                        center: .init(x: 0.38, y: 0.32),
                        startRadius: 4,
                        endRadius: 56
                    )
                )
                .frame(width: 96, height: 96)
                .overlay(
                    Circle().strokeBorder(Color(red: 0.541, green: 0.353, blue: 0.039), lineWidth: 2.2)
                )

            Circle()
                .strokeBorder(style: StrokeStyle(lineWidth: 1.2, dash: [4, 3]))
                .foregroundStyle(Color(red: 1.0, green: 0.953, blue: 0.769))
                .frame(width: 82, height: 82)

            Circle()
                .fill(inkNavy)
                .frame(width: 68, height: 68)
                .overlay(
                    Circle().strokeBorder(BrandTheme.champagneGold, lineWidth: 1.6)
                )

            VStack(spacing: 0) {
                Text("CERTIFIED")
                    .scaledFont(size: 7, weight: .bold, design: .monospaced)
                    .tracking(1.1)
                    .foregroundStyle(BrandTheme.champagneGold)
                Text(certificate.level.rawValue)
                    .scaledFont(size: 20, weight: .bold, design: .serif)
                    .foregroundStyle(.white)
                Text("LINGUAVERVE")
                    .scaledFont(size: 6.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(BrandTheme.celestialSky)
            }
        }
        .shadow(color: .black.opacity(0.22), radius: 8, y: 4)
    }

    private var authenticityFooter: some View {
        VStack(spacing: 4) {
            Divider().overlay(cardStroke)
            HStack(spacing: 6) {
                Image(systemName: "checkmark.shield.fill")
                    .scaledFont(size: 10)
                    .foregroundStyle(Color(red: 0.059, green: 0.463, blue: 0.431))
                Text("VERIFICATION CODE: \(certificate.verificationCode)  ·  CREDENTIAL: \(certificate.certificateId)")
                    .scaledFont(size: 9.5, weight: .bold, design: .monospaced)
                    .foregroundStyle(mutedSlate)
            }
            Text(certificate.authenticityNotice)
                .scaledFont(size: 9)
                .foregroundStyle(mutedSlate.opacity(0.9))
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
