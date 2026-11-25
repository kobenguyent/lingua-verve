import SwiftUI
import LinguaVerveCore

public struct PreTestNativeView: View {
    @Bindable var store: CurriculumStore
    @State private var started = false
    @State private var currentIndex = 0
    @State private var answers: [String: Int] = [:]
    @State private var audioPlays: [String: Int] = [:]
    @State private var latestResult: PreTestResult?

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let lang = store.courseLanguageId == "german" ? "german" : "english"
        let questions = store.preTestQuestions(for: lang)
        let displayedResult = latestResult?.languageId == lang
            ? latestResult
            : store.learnerState.preTestHistory.first(where: { $0.languageId == lang })

        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                // Header
                VStack(alignment: .leading, spacing: 10) {
                    ViewThatFits(in: .horizontal) {
                        HStack {
                            headerText
                            Spacer()
                            langPicker
                        }
                        VStack(alignment: .leading, spacing: 8) {
                            headerText
                            langPicker
                        }
                    }
                }
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))

                if started, currentIndex < questions.count {
                    let q = questions[currentIndex]
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("Item \(currentIndex + 1) of \(questions.count)")
                                .font(.system(size: 12, design: .monospaced))
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("\(q.level.rawValue) · \(q.skill.displayName)")
                                .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.16)))
                                .foregroundStyle(BrandTheme.celestialSky)
                        }

                        ProgressView(value: Double(currentIndex + 1), total: Double(questions.count))

                        if let passage = q.passage {
                            Text(passage)
                                .font(.subheadline)
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
                        }

                        if let script = q.audioScript {
                            let used = audioPlays[q.id, default: 0]
                            HStack {
                                Button {
                                    guard used < 2 else { return }
                                    audioPlays[q.id] = used + 1
                                    NativeAudioEngine.shared.speak(script, languageId: lang, slow: false)
                                } label: {
                                    Label(used >= 2 ? "Replays Used (2/2)" : "Play Spoken Audio (\(2 - used) left)", systemImage: "speaker.wave.2.fill")
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(.purple)
                                .disabled(used >= 2)
                            }
                        }

                        Text(q.prompt)
                            .font(.headline)

                        VStack(spacing: 8) {
                            ForEach(Array(q.options.enumerated()), id: \.offset) { idx, opt in
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    answers[q.id] = idx
                                    if currentIndex + 1 < questions.count {
                                        currentIndex += 1
                                    } else {
                                        NativeAudioEngine.shared.stopSpeech()
                                        NativeAudioEngine.shared.playSuccessChime()
                                        latestResult = store.evaluateAndRecordPreTest(languageId: lang, answers: answers)
                                        started = false
                                    }
                                } label: {
                                    HStack(alignment: .top, spacing: 10) {
                                        Text(["A", "B", "C", "D"][min(idx, 3)])
                                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                                            .frame(width: 24, height: 24)
                                            .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.08)))
                                        Text(opt)
                                            .font(.subheadline)
                                            .foregroundStyle(.primary)
                                            .multilineTextAlignment(.leading)
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(16)
                    .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
                } else if let res = displayedResult {
                    // Verified Level & Collective Multi-Course Bundle
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("VERIFIED CEFR PLACEMENT")
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                    .foregroundStyle(BrandTheme.emeraldMint)
                                Text("Verified Level: \(res.verifiedLevel.rawValue)")
                                    .font(.system(size: 26, weight: .bold, design: .serif))
                                Text("Score: \(res.correctCount)/\(res.totalCount) (\(res.overallScore)%) · Target: \(res.suggestedCertificate)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button("Retake") { startFresh() }
                                .buttonStyle(.bordered)
                        }

                        // 4-Skill Score Grid
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                            ForEach(SkillType.allCases) { sk in
                                let score = res.skillScores[sk.rawValue] ?? 0
                                VStack(alignment: .leading, spacing: 5) {
                                    HStack {
                                        Label(sk.shortName, systemImage: sk.systemImage)
                                            .font(.caption.weight(.bold))
                                        Spacer()
                                        Text("\(score)%")
                                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    }
                                    ProgressView(value: Double(score), total: 100.0)
                                        .tint(score < 60 ? .orange : BrandTheme.emeraldMint)
                                }
                                .padding(10)
                                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                            }
                        }

                        Divider()

                        Text("RECOMMENDED COLLECTIVE COURSE BUNDLE")
                            .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                            .foregroundStyle(BrandTheme.celestialSky)

                        ForEach(Array(res.recommendedCourses.enumerated()), id: \.element.id) { idx, step in
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("STEP \(idx + 1) · \(step.role.uppercased())")
                                        .font(.system(size: 10.5, weight: .bold, design: .monospaced))
                                        .padding(.horizontal, 7)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.16)))
                                        .foregroundStyle(BrandTheme.celestialSky)
                                    Spacer()
                                    Text("CEFR \(step.level.rawValue)")
                                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                                }
                                Text(step.title).font(.headline)
                                Text(step.reason).font(.caption).foregroundStyle(.secondary)
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    store.openCourse(languageId: res.languageId, level: step.level)
                                } label: {
                                    Label("Open \(step.level.rawValue) Intensive Course", systemImage: "arrow.right.circle.fill")
                                }
                                .buttonStyle(.borderedProminent)
                                .controlSize(.small)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.04)))
                        }

                        Button {
                            store.openExamSimulator(languageId: res.languageId, level: res.verifiedLevel)
                        } label: {
                            Label("Simulate \(res.verifiedLevel.rawValue) 4-Skill Certification Exam", systemImage: "timer")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.emeraldMint)
                    }
                    .padding(16)
                    .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
                } else {
                    VStack(spacing: 14) {
                        Image(systemName: "checklist.checked")
                            .font(.system(size: 40))
                            .foregroundStyle(BrandTheme.celestialSky)
                        Text("12-Item Scored 4-Skill Placement Pre-Test")
                            .font(.title3.weight(.bold))
                        Text("Tests Reading, Spoken Listening/Hearing, Writing Grammar, and Speaking Pragmatics from A1 to C2, then automatically recommends your collective course path.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                        Button {
                            startFresh()
                        } label: {
                            Label("Start Scored Pre-Test", systemImage: "play.fill")
                                .padding(.horizontal, 14)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                    }
                    .padding(28)
                    .frame(maxWidth: .infinity)
                    .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.03)))
                }
            }
            .padding(16)
            .frame(maxWidth: 920)
            .frame(maxWidth: .infinity)
        }
    }

    private var headerText: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("SCORED CEFR PLACEMENT ENGINE")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(.indigo)
            Text("Verify Level & Recommend Collective Courses")
                .font(.system(size: 21, weight: .bold, design: .serif))
        }
    }

    private var langPicker: some View {
        Picker("Language", selection: $store.courseLanguageId) {
            Text("🇬🇧 English").tag("english")
            Text("🇩🇪 German").tag("german")
        }
        .labelsHidden()
        .pickerStyle(.segmented)
        .frame(maxWidth: 220)
        .onChange(of: store.courseLanguageId) { _, _ in
            started = false
            answers = [:]
            audioPlays = [:]
            currentIndex = 0
        }
    }

    private func startFresh() {
        NativeAudioEngine.shared.playClickSound()
        answers = [:]
        audioPlays = [:]
        currentIndex = 0
        latestResult = nil
        started = true
    }
}
