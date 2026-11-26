import SwiftUI
import LinguaVerveCore

public struct IntensiveCoursesNativeView: View {
    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    @State private var showAllReferences: Bool = false

    public init(store: CurriculumStore) {
        self.store = store
    }

    public var body: some View {
        let courses = store.courses(for: store.courseLanguageId)
        let currentCourse = store.course(for: store.courseLanguageId, level: store.courseLevel) ?? courses.first
        let zeroToHero = store.languageZeroToHeroProgress(for: store.courseLanguageId)

        if let course = currentCourse,
           let activeId = store.activeLessonModuleId,
           let activeIdx = course.modules.firstIndex(where: { $0.id == activeId }) {
            let activeMod = course.modules[activeIdx]
            let nextMod = activeIdx + 1 < course.modules.count ? course.modules[activeIdx + 1] : nil
            let courseIdx = courses.firstIndex(where: { $0.id == course.id })
            let nextLvlCourse = courseIdx.flatMap { $0 + 1 < courses.count ? courses[$0 + 1] : nil }

            UnitLessonPlayerView(
                store: store,
                course: course,
                module: activeMod,
                unitIndex: activeIdx + 1,
                totalUnits: course.modules.count,
                nextModule: nextMod,
                nextLevelCourse: nextLvlCourse
            )
            .id(activeMod.id)
        } else {
            syllabusBody(courses: courses, currentCourse: currentCourse, zeroToHero: zeroToHero)
        }
    }

    private func syllabusBody(
        courses: [IntensiveCourse],
        currentCourse: IntensiveCourse?,
        zeroToHero: (done: Int, total: Int, percent: Int)
    ) -> some View {
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
                                .scaledFont(.caption, weight: .semibold)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("\(zeroToHero.done)/\(zeroToHero.total) units (\(zeroToHero.percent)%)")
                                .scaledFont(size: 12, weight: .bold, design: .monospaced)
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
                                    store.activeLessonModuleId = nil
                                    store.courseLevel = course.level
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack(spacing: 6) {
                                            Text(course.level.rawValue)
                                                .scaledFont(size: 15, weight: .bold, design: .monospaced)
                                                .foregroundStyle(selected ? tint : .primary)
                                            if enrolled {
                                                Text("Suggested")
                                                    .scaledFont(size: 9, weight: .bold, design: .monospaced)
                                                    .padding(.horizontal, 5)
                                                    .padding(.vertical, 2)
                                                    .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.22)))
                                                    .foregroundStyle(BrandTheme.deepGold)
                                            }
                                        }
                                        Text("\(course.durationWeeks)w · \(pct)%")
                                            .scaledFont(size: 11, design: .monospaced)
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
                                    .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                    .foregroundStyle(BrandTheme.cefrColor(for: course.level.rawValue))
                                Text(course.title)
                                    .scaledFont(size: 21, weight: .bold, design: .serif)
                                Text(course.subtitle)
                                    .scaledFont(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }

                        FlowLayout(spacing: 6, lineSpacing: 6) {
                            Label("\(course.durationWeeks) weeks · \(course.dailyHours)", systemImage: "clock")
                                .scaledFont(.caption, design: .monospaced)
                                .padding(.horizontal, 9)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(Color.primary.opacity(0.06)))
                            ForEach(course.targetCertificates, id: \.self) { cert in
                                Label(cert, systemImage: "rosette")
                                    .scaledFont(.caption, weight: .semibold)
                                    .padding(.horizontal, 9)
                                    .padding(.vertical, 4)
                                    .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.16)))
                            }
                        }

                        FlowLayout(spacing: 8, lineSpacing: 8) {
                            if let rec = recommendedUnit(for: course) {
                                Button {
                                    NativeAudioEngine.shared.playClickSound()
                                    store.openUnitLesson(
                                        moduleId: rec.module.id,
                                        languageId: course.languageId,
                                        level: course.level
                                    )
                                } label: {
                                    Label(rec.ctaLabel, systemImage: "play.fill")
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(BrandTheme.emeraldMint)
                            }

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
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(225, scale: fontScale)), spacing: 10)], spacing: 10) {
                            ForEach(SkillType.allCases) { skill in
                                VStack(alignment: .leading, spacing: 5) {
                                    Label(skill.displayName, systemImage: skill.systemImage)
                                        .scaledFont(.caption, weight: .bold)
                                        .foregroundStyle(BrandTheme.celestialSky)
                                    Text(course.examBlueprint.description(for: skill))
                                        .scaledFont(.caption)
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

                    // Audio Pace, Accent Picker + Syllabus Units
                    ViewThatFits(in: .horizontal) {
                        HStack {
                            Text("INTENSIVE SYLLABUS UNITS (\(course.modules.count))")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .foregroundStyle(.secondary)
                            Spacer()
                            accentMenu(for: course.languageId)
                            Toggle("0.75x Slow Audio", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                                .toggleStyle(.switch)
                                .scaledFont(.caption, design: .monospaced)
                                .fixedSize()
                        }
                        VStack(alignment: .leading, spacing: 8) {
                            Text("INTENSIVE SYLLABUS UNITS (\(course.modules.count))")
                                .scaledFont(size: 11.5, weight: .bold, design: .monospaced)
                                .foregroundStyle(.secondary)
                            HStack {
                                accentMenu(for: course.languageId)
                                Spacer()
                                Toggle("0.75x Slow Audio", isOn: Bindable(NativeAudioEngine.shared).slowPace)
                                    .toggleStyle(.switch)
                                    .scaledFont(.caption, design: .monospaced)
                                    .fixedSize()
                            }
                        }
                    }

                    ForEach(Array(course.modules.enumerated()), id: \.element.id) { idx, mod in
                        moduleCard(mod, index: idx + 1, course: course)
                    }

                    // Official Internet Certification Portals & Mock Tests
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("OFFICIAL CERTIFICATION PORTALS & FREE MOCK TESTS")
                                    .scaledFont(size: 11, weight: .bold, design: .monospaced)
                                    .foregroundStyle(BrandTheme.emeraldMint)
                                Text("Verified Exam Boards (Goethe, telc, TestDaF, Cambridge, IELTS, TOEFL)")
                                    .scaledFont(.headline)
                            }
                            Spacer()
                            Button(showAllReferences ? "\(course.level.rawValue) Only" : "Show All") {
                                showAllReferences.toggle()
                            }
                            .buttonStyle(.bordered)
                            .controlSize(.small)
                        }

                        let refs = store.examReferences(for: course, showAllForLanguage: showAllReferences)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(290, scale: fontScale)), spacing: 12)], spacing: 12) {
                            ForEach(refs) { ref in
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(ref.provider)
                                            .scaledFont(size: 11, weight: .bold, design: .monospaced)
                                            .padding(.horizontal, 7)
                                            .padding(.vertical, 3)
                                            .background(Capsule().fill(Color.primary.opacity(0.08)))
                                        Spacer()
                                        Text(ref.levels.map(\.rawValue).joined(separator: "·"))
                                            .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                                            .foregroundStyle(BrandTheme.celestialSky)
                                    }
                                    Text(ref.certificateName)
                                        .scaledFont(.subheadline, weight: .bold)
                                    Text(ref.description)
                                        .scaledFont(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("⏱ \(ref.examDuration)\n🎯 \(ref.passingScore)")
                                        .scaledFont(size: 11, design: .monospaced)
                                        .foregroundStyle(.secondary)

                                    if let url = URL(string: ref.url) {
                                        Link(destination: url) {
                                            Label("Open Official Mock / Portal", systemImage: "arrow.up.right.square")
                                                .scaledFont(.caption, weight: .bold)
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
            .frame(maxWidth: 1080)
            .frame(maxWidth: .infinity)
        }
    }

    private var headerTitle: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("ZERO-TO-HERO INTENSIVE ACADEMY")
                .scaledFont(size: 11, weight: .bold, design: .monospaced)
                .foregroundStyle(BrandTheme.celestialSky)
            Text("\(store.courseLanguageId == "german" ? "🇩🇪 German" : "🇬🇧 English") A1 → C2 Mastery Track")
                .scaledFont(size: 22, weight: .bold, design: .serif)
        }
    }

    private var languagePicker: some View {
        Picker("Language", selection: $store.courseLanguageId) {
            Text("🇬🇧 English").tag("english")
            Text("🇩🇪 German").tag("german")
        }
        .labelsHidden()
        .pickerStyle(.segmented)
        .frame(maxWidth: AppTypography.scaledControlWidth(248, scale: fontScale, maxCap: 320))
    }

    private func accentMenu(for languageId: String) -> some View {
        let accents = NativeAudioEngine.accents(for: languageId)
        let activeCode = NativeAudioEngine.shared.activeAccentCode(for: languageId)
        let activeOption = NativeAudioEngine.accentOption(for: activeCode) ?? accents.first

        return Menu {
            ForEach(accents) { acc in
                Button {
                    NativeAudioEngine.shared.playClickSound()
                    NativeAudioEngine.shared.setAccent(for: languageId, accentCode: acc.code)
                } label: {
                    if acc.code == activeCode {
                        Label("\(acc.flag) \(acc.label)", systemImage: "checkmark")
                    } else {
                        Text("\(acc.flag) \(acc.label) · \(acc.region)")
                    }
                }
            }
        } label: {
            Label("\(activeOption?.flag ?? "🎙️") \(activeOption?.label ?? activeCode)", systemImage: "waveform")
                .scaledFont(.caption, design: .monospaced)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
    }

    private func recommendedUnit(for course: IntensiveCourse) -> (module: CourseModule, ctaLabel: String)? {
        if let inProgIdx = course.modules.firstIndex(where: { !store.isModuleCompleted($0.id) && store.unitProgress(for: $0.id) != nil }) {
            return (course.modules[inProgIdx], "Continue Unit \(inProgIdx + 1)")
        }
        if let nextIdx = course.modules.firstIndex(where: { !store.isModuleCompleted($0.id) }) {
            return (course.modules[nextIdx], "Start Learning · Unit \(nextIdx + 1)")
        }
        if let first = course.modules.first {
            return (first, "Review Unit 1")
        }
        return nil
    }

    private func moduleCard(_ mod: CourseModule, index: Int, course: IntensiveCourse) -> some View {
        let done = store.isModuleCompleted(mod.id)
        let savedProg = store.unitProgress(for: mod.id)
        let stepsDone = savedProg?.completedSteps.count ?? 0
        let inProgress = !done && savedProg != nil

        return VStack(alignment: .leading, spacing: 12) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    moduleHeadingBlock(mod, index: index, done: done, inProgress: inProgress, stepsDone: stepsDone, savedProg: savedProg)
                    Spacer(minLength: 8)
                    VStack(alignment: .trailing, spacing: 6) {
                        moduleActionButtons(mod, index: index, course: course, done: done, inProgress: inProgress)
                    }
                }
                VStack(alignment: .leading, spacing: 10) {
                    moduleHeadingBlock(mod, index: index, done: done, inProgress: inProgress, stepsDone: stepsDone, savedProg: savedProg)
                    FlowLayout(spacing: 8, lineSpacing: 6) {
                        moduleActionButtons(mod, index: index, course: course, done: done, inProgress: inProgress)
                    }
                }
            }

            // Objectives
            VStack(alignment: .leading, spacing: 5) {
                ForEach(mod.objectives, id: \.self) { obj in
                    HStack(alignment: .top, spacing: 6) {
                        Image(systemName: "checkmark.seal.fill")
                            .scaledFont(.caption2)
                            .foregroundStyle(BrandTheme.celestialSky)
                            .padding(.top, 2)
                        Text(obj)
                            .scaledFont(.caption)
                            .fixedSize(horizontal: false, vertical: true)
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
                            .scaledFont(size: 11.5, design: .monospaced)
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
                    ViewThatFits(in: .horizontal) {
                        HStack {
                            Label("\(drill.skill.displayName) · \(drill.durationMins)m", systemImage: drill.skill.systemImage)
                                .scaledFont(.caption, weight: .bold)
                                .foregroundStyle(BrandTheme.celestialSky)
                            Spacer()
                            drillCoachButton(drill: drill, course: course)
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Label("\(drill.skill.displayName) · \(drill.durationMins)m", systemImage: drill.skill.systemImage)
                                .scaledFont(.caption, weight: .bold)
                                .foregroundStyle(BrandTheme.celestialSky)
                            drillCoachButton(drill: drill, course: course)
                        }
                    }
                    Text(drill.title)
                        .scaledFont(.subheadline, weight: .semibold)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(drill.instruction)
                        .scaledFont(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    if let passage = drill.samplePassage {
                        Text(passage)
                            .scaledFont(.caption)
                            .fixedSize(horizontal: false, vertical: true)
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
                                    .scaledFont(.caption, weight: .bold)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.purple)
                            .controlSize(.small)
                        }
                        DisclosureGroup("Reveal Audio Transcript") {
                            Text(script)
                                .scaledFont(.caption)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.top, 4)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .scaledFont(.caption)
                    }
                }
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.035)))
            }

            Text("🎯 Checkpoint: \(mod.checkpointPrompt)")
                .scaledFont(.caption, weight: .medium)
                .fixedSize(horizontal: false, vertical: true)
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

    private func moduleHeadingBlock(
        _ mod: CourseModule,
        index: Int,
        done: Bool,
        inProgress: Bool,
        stepsDone: Int,
        savedProg: UnitStudyProgress?
    ) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            FlowLayout(spacing: 6, lineSpacing: 4) {
                Text("Unit \(index) · \(mod.weekLabel)")
                    .scaledFont(size: 11, weight: .bold, design: .monospaced)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.primary.opacity(0.08)))
                if inProgress {
                    Text("In Progress · \(stepsDone)/5")
                        .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(BrandTheme.champagneGold.opacity(0.22)))
                        .foregroundStyle(BrandTheme.deepGold)
                }
                if let score = savedProg?.checkpointScore {
                    Text("Checkpoint \(score)%")
                        .scaledFont(size: 10.5, weight: .bold, design: .monospaced)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(BrandTheme.emeraldMint.opacity(0.16)))
                        .foregroundStyle(BrandTheme.emeraldMint)
                }
                ForEach(mod.focusSkills) { sk in
                    Label(sk.shortName, systemImage: sk.systemImage)
                        .scaledFont(size: 11, weight: .semibold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(BrandTheme.celestialSky.opacity(0.14)))
                        .foregroundStyle(BrandTheme.celestialSky)
                }
            }
            Text(mod.title)
                .scaledFont(.headline)
                .fixedSize(horizontal: false, vertical: true)
            Text(mod.summary)
                .scaledFont(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    @ViewBuilder
    private func moduleActionButtons(_ mod: CourseModule, index: Int, course: IntensiveCourse, done: Bool, inProgress: Bool) -> some View {
        Button {
            NativeAudioEngine.shared.playClickSound()
            store.openUnitLesson(moduleId: mod.id, languageId: course.languageId, level: course.level)
        } label: {
            Label(
                done ? "Review Unit \(index)" : inProgress ? "Resume Unit \(index)" : "Start Unit \(index)",
                systemImage: "play.fill"
            )
            .scaledFont(.caption, weight: .bold)
        }
        .buttonStyle(.borderedProminent)
        .tint(BrandTheme.celestialSky)
        .controlSize(.small)

        Button {
            let nowDone = store.toggleModuleComplete(mod, languageId: course.languageId, level: course.level)
            if nowDone {
                NativeAudioEngine.shared.playSuccessChime()
            } else {
                NativeAudioEngine.shared.playClickSound()
            }
        } label: {
            Label(done ? "Completed" : "Complete", systemImage: done ? "checkmark.circle.fill" : "circle")
                .scaledFont(.caption, weight: .bold)
        }
        .buttonStyle(.borderedProminent)
        .tint(done ? BrandTheme.emeraldMint : .accentColor)
        .controlSize(.small)
    }

    private func drillCoachButton(drill: CourseDrill, course: IntensiveCourse) -> some View {
        Button {
            store.openAICoach(
                languageId: course.languageId,
                level: course.level,
                skill: drill.skill,
                seedPrompt: "Practice drill: \(drill.title). \(drill.instruction)"
            )
        } label: {
            Label("AI Coach", systemImage: "sparkles")
                .scaledFont(.caption2, weight: .bold)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
    }
}
