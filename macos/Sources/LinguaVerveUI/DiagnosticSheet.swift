import SwiftUI
import LinguaVerveCore

public struct DiagnosticSheet: View {
    @Bindable var store: CurriculumStore
    @Environment(\.dismiss) private var dismiss
    @State private var answers: [String: CEFRLevel] = [:]
    @State private var calculatedLevel: CEFRLevel?

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                GoldenGateEditorialBackdrop()

                VStack(alignment: .leading, spacing: 18) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            ForEach(Array(store.bundle.diagnosticQuestions.enumerated()), id: \.element.id) { idx, q in
                                VStack(alignment: .leading, spacing: 10) {
                                    Text("\(idx + 1). \(q.question)")
                                        .scaledFont(.headline, weight: .bold, design: .serif)

                                    ForEach(q.options, id: \.text) { opt in
                                        let selected = answers[q.id] == opt.level
                                        Button {
                                            NativeAudioEngine.shared.playClickSound()
                                            withAnimation(GoldenGateMetrics.snappySpring) {
                                                answers[q.id] = opt.level
                                                if answers.count == store.bundle.diagnosticQuestions.count {
                                                    calculatedLevel = CurriculumStore.calculateDiagnosticLevel(answers: answers)
                                                }
                                            }
                                        } label: {
                                            HStack(spacing: 10) {
                                                Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                                                    .foregroundStyle(selected ? BrandTheme.editorialBlue : .secondary)
                                                Text(opt.text)
                                                    .scaledFont(.subheadline)
                                                    .foregroundStyle(.primary)
                                                    .multilineTextAlignment(.leading)
                                                Spacer()
                                                Text(opt.level.rawValue)
                                                    .scaledFont(.caption, weight: .bold, design: .monospaced)
                                                    .foregroundStyle(selected ? BrandTheme.editorialBlue : .secondary)
                                            }
                                            .padding(12)
                                            .goldenGateSurface(
                                                cornerRadius: 10,
                                                tint: selected ? BrandTheme.editorialBlue : nil,
                                                interactive: true
                                            )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(18)
                                .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius)
                            }
                        }
                    }

                    if let result = calculatedLevel {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Recommended Starting Tier: \(result.rawValue)")
                                .scaledFont(.title3, weight: .bold, design: .serif)
                            if let detail = store.levelDetail(for: result.rawValue) {
                                Text("\(detail.stageName) — \(detail.milestoneGoal)")
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            FlowLayout(spacing: 10, lineSpacing: 8) {
                                Button("Open \(result.rawValue) Intensive Course") {
                                    NativeAudioEngine.shared.playSuccessChime()
                                    store.openCourse(languageId: store.courseLanguageId, level: result)
                                    dismiss()
                                }
                                .buttonStyle(GoldenGatePrimaryButtonStyle(accent: BrandTheme.editorialBlue))

                                Button("Filter Manual to \(result.rawValue)") {
                                    store.activeLevel = result.rawValue
                                    store.selectedTipId = store.filteredTips.first?.id
                                    store.activeWorkspace = .manual
                                    dismiss()
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle())
                            }
                        }
                        .padding(18)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, tint: BrandTheme.editorialBlue)
                        .transition(.opacity)
                    }
                }
                .padding(20)
                .animation(GoldenGateMetrics.panelAnimation, value: calculatedLevel)
            }
            .navigationTitle("Quick CEFR Check")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 520, idealWidth: 680, minHeight: 500, idealHeight: 620)
        #endif
    }
}
