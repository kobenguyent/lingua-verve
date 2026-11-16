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
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 10) {
                Image(systemName: "scope")
                    .font(.title2)
                    .foregroundStyle(BrandTheme.celestialSky)
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 10).fill(BrandTheme.celestialSky.opacity(0.14)))
                VStack(alignment: .leading, spacing: 3) {
                    Text("CEFR Diagnostic Level Finder")
                        .font(.system(size: 20, weight: .bold, design: .serif))
                    Text("Answer all \(store.bundle.diagnosticQuestions.count) prompts (\(answers.count)/\(store.bundle.diagnosticQuestions.count) answered) to calibrate your roadmap.")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                if !answers.isEmpty {
                    Button("Reset") {
                        answers.removeAll()
                        calculatedLevel = nil
                    }
                    .controlSize(.regular)
                }
                Button("Close") { dismiss() }
                    .keyboardShortcut(.cancelAction)
            }

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    ForEach(Array(store.bundle.diagnosticQuestions.enumerated()), id: \.element.id) { idx, q in
                        VStack(alignment: .leading, spacing: 8) {
                            Text("\(idx + 1). \(q.question)")
                                .font(.system(size: 14.5, weight: .bold))
                                .fixedSize(horizontal: false, vertical: true)

                            ForEach(q.options, id: \.text) { opt in
                                let selected = answers[q.id] == opt.level
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    answers[q.id] = opt.level
                                    if answers.count == store.bundle.diagnosticQuestions.count {
                                        calculatedLevel = CurriculumStore.calculateDiagnosticLevel(answers: answers)
                                    }
                                } label: {
                                    HStack(alignment: .center, spacing: 10) {
                                        Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                                            .foregroundStyle(selected ? Color.accentColor : .secondary)
                                        Text(opt.text)
                                            .font(.system(size: 13))
                                            .foregroundStyle(.primary)
                                            .fixedSize(horizontal: false, vertical: true)
                                        Spacer()
                                        Text(opt.level.rawValue)
                                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                                            .foregroundStyle(.secondary)
                                            .fixedSize()
                                    }
                                    .padding(11)
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(selected ? Color.accentColor.opacity(0.14) : Color.primary.opacity(0.04))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .strokeBorder(selected ? Color.accentColor.opacity(0.45) : .clear, lineWidth: 1)
                                    )
                                    .contentShape(Rectangle())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(.trailing, 4)
            }

            if let result = calculatedLevel {
                Divider()
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Recommended Starting Tier: \(result.rawValue)")
                            .font(.system(size: 15, weight: .bold))
                        if let detail = store.levelDetail(for: result.rawValue) {
                            Text("\(detail.stageName) — \(detail.milestoneGoal)")
                                .font(.system(size: 13))
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    Spacer()
                    Button("Filter Blueprints to \(result.rawValue)") {
                        NativeAudioEngine.shared.playSuccessChime()
                        store.activeLevel = result.rawValue
                        store.selectedTipId = store.filteredTips.first?.id
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .fixedSize()
                }
            }
        }
        .padding(22)
        .frame(minWidth: 460, idealWidth: 640, maxWidth: 760, minHeight: 440, idealHeight: 580, maxHeight: 740)
    }
}
