import SwiftUI
import LinguaVerveCore

public struct IntensiveCoursesNativeView: View {
    @Bindable var store: CurriculumStore
    @State private var showAllReferences: Bool = false

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let courses = store.courses(for: store.courseLanguageId)
        let currentCourse = store.course(for: store.courseLanguageId, level: store.courseLevel) ?? courses.first
        let zeroToHero = store.languageZeroToHeroProgress(for: store.courseLanguageId)

        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                // Header & Language Switcher
                VStack(alignment: .leading, spacing: 12) {
                    ViewThatFits(in: .horizontal) {
                        HStack {
                            headerTitle
                            Spacer()
                            languagePicker
                        }
                        VStack(alignment: .leading, spacing: 10) {
                            headerTitle
                            languagePicker
                        }
                    }

                    // Zero-to-Hero Progress Bar
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text("Zero-to-Hero Progress (A1 → C2)")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("\(zeroToHero.done)/\(zeroToHero.total) units (\(zeroToHero.percent)%)")
                                .font(.system(size: 12, weight: .bold, design: .monospaced))
                                .monospacedDigit()
                        }
                        ProgressView(value: Double(zeroToHero.percent), total: 100.0)
                            .tint(BrandTheme.emeraldMint)
                    }

                    // A1 -> C2 Horizontal Stage Selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(courses) { course in
                                let selected = currentCourse?.id == course.id
                                let enrolled = store.isCourseEnrolled(course.id)
                                let pct = store.courseCompletionPercent(for: course)
                                let tint = BrandTheme.cefrColor(for: course.level.rawValue)

                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    store.courseLevel = course.level
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack(spacing: 6) {
                                            Text(course.level.rawValue)
                                                .font(.system(size: 15, weight: .bold, design: .monospaced))
                                                .foregroundStyle(selected ? tint : .primary)
                                            if enrolled {
                                                Text("Suggested")
                                                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                                                    .padding(.horizontal, 5)
                                                    .padding(.vertical, 2)
                                                    .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.22)))
                                                    .foregroundStyle(BrandTheme.deepGold)
                                            }
                                        }
                                        Text("\(course.durationWeeks)w · \(pct)%")
                                            .font(.system(size: 11, design: .monospaced))
                                            .foregroundStyle(.secondary)
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 9)
                                    .background(
                                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                                            .fill(selected ? tint.opacity(0.16) : Color.primary.opacity(0.04))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                                            .strokeBorder(selected ? tint : Color.primary.opacity(0.08), lineWidth: selected ? 1.5 : 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Color.primary.opacity(0.03)))

                if let course = currentCourse {
                    // Active Course Dossier
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 5) {
                                Text("\(course.level.rawValue) · \(course.heroRole)")
                                    .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                                    .foregroundStyle(BrandTheme.cefrColor(for: course.level.rawValue))
                                Text(course.title)
                                    .font(.system(size: 21, weight: .bold, design: .serif))
                                Text(course.subtitle)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }

                        FlowLayout(spacing: 6, lineSpacing: 6) {
                            Label("\(course.durationWeeks) weeks · \(course.dailyHours)", systemImage: "clock")
                                .font(.caption.monospaced())
                                .padding(.horizontal, 9)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(Color.primary.opacity(0.06)))
                            ForEach(course.targetCertificates, id: \.self) { cert in
                                Label(cert, systemImage: "rosette")
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 9)
                                    .padding(.vertical, 4)
                                    .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.16)))
                            }
                        }

                        FlowLayout(spacing: 8, lineSpacing: 8) {
                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.openExamSimulator(languageId: course.languageId, level: course.level)
                            } label: {
                                Label("Simulate \(course.level.rawValue) 4-Skill Exam", systemImage: "timer")
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(BrandTheme.celestialSky)

                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.openAICoach(languageId: course.languageId, level: course.level, skill: .speaking)
                            } label: {
                                Label("Train with AI Coach", systemImage: "sparkles")
                            }
                            .buttonStyle(.bordered)

                            Button {
                                NativeAudioEngine.shared.playClickSound()
                                store.activeWorkspace = .pretest
                            } label: {
                                Label("Verify Level Pre-Test", systemImage: "checklist")
                            }
                            .buttonStyle(.bordered)
                        }

                        Divider()

                        // 4-Skill Exam Blueprint Grid
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 10)], spacing: 10) {
                            ForEach(SkillType.allCases) { skill in
                                VStack(alignment: .leading, spacing: 5) {
                                    Label(skill.displayName, systemImage: skill.systemImage)
                                        .font(.caption.weight(.bold))
                                        .foregroundStyle(BrandTheme.celestialSky)
                                    Text(course.examBlueprint.description(for: skill))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(11)
                                .frame(maxWidth: .infinity, alignment: .topLeading)
                                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))
                            }
                        }
                    }
                    .padding(16)
                    .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Color.primary.opacity(0.03)))

                    // Audio Pace Control + Syllabus Units
                    HStack {
                        Text("INTENSIVE SYLLABUS UNITS (\(course.modules.count))")
                            .font(.system(size: 11.5, weight: .bold, design: .monospaced))
                            .foregroundStyle(.secondary)
                        Spacer()
                        Toggle("0.75x Slow Audio", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                            .toggleStyle(.switch)
                            .font(.caption.monospaced())
                            .fixedSize()
                    }

                    ForEach(Array(course.modules.enumerated()), id: \.element.id) { idx, mod in
                        moduleCard(mod, index: idx + 1, course: course)
                    }

                    // Official Internet Certification Portals & Mock Tests
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("OFFICIAL CERTIFICATION PORTALS & FREE MOCK TESTS")
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                    .foregroundStyle(BrandTheme.emeraldMint)
                                Text("Verified Exam Boards (Goethe, telc, TestDaF, Cambridge, IELTS, TOEFL)")
                                    .font(.headline)
                            }
                            Spacer()
                            Button(showAllReferences ? "\(course.level.rawValue) Only" : "Show All") {
                                showAllReferences.toggle()
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }

                        let refs = store.examReferences(for: course, showAllForLanguage: showAllReferences)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 12)], spacing: 12) {
                            ForEach(refs) { ref in
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(ref.provider)
                                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                                            .padding(.horizontal, 7)
                                            .padding(.vertical, 3)
                                            .background(Capsule().fill(Color.primary.opacity(0.08)))
                                        Spacer()
                                        Text(ref.levels.map(\.rawValue).joined(separator: "·"))
                                            .font(.system(size: 10.5, weight: .bold, design: .monospaced))
                                            .foregroundStyle(BrandTheme.celestialSky)
                                    }
                                    Text(ref.certificateName)
                                        .font(.subheadline.weight(.bold))
                                    Text(ref.description)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("⏱ \(ref.examDuration)\n🎯 \(ref.passingScore)")
                                        .font(.system(size: 11, design: .monospaced))
                                        .foregroundStyle(.secondary)

                                    if let url = URL(string: ref.url) {
                                        Link(destination: url) {
                                            Label("Open Official Mock / Portal", systemImage: "arrow.up.right.square")
                                                .font(.caption.weight(.bold))
                                        }
                                        .buttonStyle(.borderedProminent)
                                        .tint(BrandTheme.celestialSky)
                                        .controlSize(.small)
                                    }
                                }
                                .padding(13)
                                .frame(maxWidth: .infinity, alignment: .topLeading)
                                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.04)))
                            }
                        }
                    }
                    .padding(16)
                    .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Color.primary.opacity(0.03)))
                }
            }
            .padding(16)
            .frame(maxWidth: 1020)
            .frame(maxWidth: .infinity)
        }
    }

    private var headerTitle: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("ZERO-TO-HERO INTENSIVE ACADEMY")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(BrandTheme.celestialSky)
            Text("\(store.courseLanguageId == "german" ? "🇩🇪 German" : "🇬🇧 English") A1 → C2 Mastery Track")
                .font(.system(size: 22, weight: .bold, design: .serif))
        }
    }

    private var languagePicker: some View {
        Picker("Language", selection: $store.courseLanguageId) {
            Text("🇬🇧 English").tag("english")
            Text("🇩🇪 German").tag("german")
        }
        .labelsHidden()
        .pickerStyle(.segmented)
        .frame(maxWidth: 240)
    }

    private func moduleCard(_ mod: CourseModule, index: Int, course: IntensiveCourse) -> some View {
        let done = store.isModuleCompleted(mod.id)
        return VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    FlowLayout(spacing: 6, lineSpacing: 4) {
                        Text("Unit \(index) · \(mod.weekLabel)")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(Color.primary.opacity(0.08)))
                        ForEach(mod.focusSkills) { sk in
                            Label(sk.shortName, systemImage: sk.systemImage)
                                .font(.system(size: 11, weight: .semibold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.14)))
                                .foregroundStyle(BrandTheme.celestialSky)
                        }
                    }
                    Text(mod.title)
                        .font(.headline)
                    Text(mod.summary)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    let nowDone = store.toggleModuleComplete(mod, languageId: course.languageId, level: course.level)
                    if nowDone {
                        NativeAudioEngine.shared.playSuccessChime()
                    } else {
                        NativeAudioEngine.shared.playClickSound()
                    }
                } label: {
                    Label(done ? "Completed" : "Complete", systemImage: done ? "checkmark.circle.fill" : "circle")
                        .font(.caption.weight(.bold))
                }
                .buttonStyle(.borderedProminent)
                .tint(done ? BrandTheme.emeraldMint : .accentColor)
                .controlSize(.small)
            }

            // Objectives
            VStack(alignment: .leading, spacing: 4) {
                ForEach(mod.objectives, id: \.self) { obj in
                    HStack(alignment: .top, spacing: 6) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.caption2)
                            .foregroundStyle(BrandTheme.celestialSky)
                            .padding(.top, 2)
                        Text(obj).font(.caption)
                    }
                }
            }

            // Clickable Audio Exam Lexis
            FlowLayout(spacing: 6, lineSpacing: 6) {
                ForEach(mod.keyVocabulary, id: \.self) { word in
                    Button {
                        NativeAudioEngine.shared.speak(word, languageId: course.languageId)
                    } label: {
                        Label(word, systemImage: "speaker.wave.2.fill")
                            .font(.system(size: 11.5, design: .monospaced))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(RoundedRectangle(cornerRadius: 7).fill(BrandTheme.celestialSky.opacity(0.12)))
                    }
                    .buttonStyle(.plain)
                }
            }

            // 4-Skill Drills
            ForEach(mod.drills) { drill in
                VStack(alignment: .leading, spacing: 7) {
                    HStack {
                        Label("\(drill.skill.displayName) · \(drill.durationMins)m", systemImage: drill.skill.systemImage)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(BrandTheme.celestialSky)
                        Spacer()
                        Button {
                            store.openAICoach(
                                languageId: course.languageId,
                                level: course.level,
                                skill: drill.skill,
                                seedPrompt: "Practice drill: \(drill.title). \(drill.instruction)"
                            )
                        } label: {
                            Label("AI Coach", systemImage: "sparkles")
                                .font(.caption2.weight(.bold))
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.mini)
                    }
                    Text(drill.title).font(.subheadline.weight(.semibold))
                    Text(drill.instruction).font(.caption).foregroundStyle(.secondary)

                    if let passage = drill.samplePassage {
                        Text(passage)
                            .font(.caption)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.04)))
                    }

                    if let script = drill.audioScript {
                        HStack {
                            Button {
                                NativeAudioEngine.shared.speak(script, languageId: course.languageId)
                            } label: {
                                Label("Play Listening / Hearing Audio", systemImage: "speaker.wave.2.fill")
                                    .font(.caption.weight(.bold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.purple)
                            .controlSize(.small)
                        }
                        DisclosureGroup("Reveal Audio Transcript") {
                            Text(script)
                                .font(.caption)
                                .padding(.top, 4)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .font(.caption)
                    }
                }
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.035)))
            }

            Text("🎯 Checkpoint: \(mod.checkpointPrompt)")
                .font(.caption.weight(.medium))
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 9).fill(BrandTheme.champagneGold.opacity(0.12)))
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(done ? BrandTheme.emeraldMint.opacity(0.06) : Color.primary.opacity(0.03))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(done ? BrandTheme.emeraldMint.opacity(0.4) : Color.primary.opacity(0.08), lineWidth: 1)
        )
    }
}
