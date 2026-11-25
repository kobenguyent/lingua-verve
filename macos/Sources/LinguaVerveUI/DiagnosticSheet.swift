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
            VStack(alignment: .leading, spacing: 14) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(Array(store.bundle.diagnosticQuestions.enumerated()), id: \.element.id) { idx, q in
                            VStack(alignment: .leading, spacing: 8) {
                                Text("\(idx + 1). \(q.question)")
                                    .font(.system(size: 14.5, weight: .bold))

                                ForEach(q.options, id: \.text) { opt in
                                    let selected = answers[q.id] == opt.level
                                    Button {
                                        NativeAudioEngine.shared.playClickSound()
                                        answers[q.id] = opt.level
                                        if answers.count == store.bundle.diagnosticQuestions.count {
                                            calculatedLevel = CurriculumStore.calculateDiagnosticLevel(answers: answers)
                                        }
                                    } label: {
                                        HStack(spacing: 10) {
                                            Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                                                .foregroundStyle(selected ? Color.accentColor : .secondary)
                                            Text(opt.text)
                                                .font(.system(size: 13))
                                                .foregroundStyle(.primary)
                                                .multilineTextAlignment(.leading)
                                            Spacer()
                                            Text(opt.level.rawValue)
                                                .font(.system(size: 12, weight: .bold, design: .monospaced))
                                                .foregroundStyle(.secondary)
                                        }
                                        .padding(10)
                                        .background(RoundedRectangle(cornerRadius: 8).fill(selected ? Color.accentColor.opacity(0.14) : Color.primary.opacity(0.04)))
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }

                if let result = calculatedLevel {
                    Divider()
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Recommended Starting Tier: \(result.rawValue)")
                            .font(.headline)
                        if let detail = store.levelDetail(for: result.rawValue) {
                            Text("\(detail.stageName) — \(detail.milestoneGoal)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        HStack {
                            Button("Open \(result.rawValue) Intensive Course") {
                                NativeAudioEngine.shared.playSuccessChime()
                                store.openCourse(languageId: store.courseLanguageId, level: result)
                                dismiss()
                            }
                            .buttonStyle(.borderedProminent)

                            Button("Filter Manual to \(result.rawValue)") {
                                store.activeLevel = result.rawValue
                                store.selectedTipId = store.filteredTips.first?.id
                                store.activeWorkspace = .manual
                                dismiss()
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }
            .padding(16)
            .navigationTitle("Quick CEFR Check")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        #if os(macOS)
        .frame(minWidth: 480, idealWidth: 640, minHeight: 460, idealHeight: 580)
        #endif
    }
}
