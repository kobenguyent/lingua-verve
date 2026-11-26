import SwiftUI
import LinguaVerveCore

public struct IntensiveCoursesNativeView: View {
    public enum EditorialSectionTab: String, CaseIterable, Identifiable, Hashable {
        case syllabus
        case blueprint
        case phrases

        public var id: String { rawValue }
    }

    private enum CourseLanguageOption: String, CaseIterable, Identifiable, Hashable {
        case german
        case english

        var id: String { rawValue }

        var title: String {
            switch self {
            case .german: return "🇩🇪 Deutsch"
            case .english: return "🇬🇧 English"
            }
        }
    }

    @Bindable var store: CurriculumStore
    @Environment(\.appFontScale) private var fontScale
    @State private var activeTab: EditorialSectionTab = .syllabus
    @State private var expandedModuleId: String? = nil
    @State private var showAllReferences: Bool = false
    @State private var activePlayingPhrase: String? = nil
    @State private var waveResetTask: Task<Void, Never>? = nil

    public init(store: CurriculumStore) {
        self.store = store
    }

    /// Selects the active study chapter by default: in-progress unit, next incomplete unit, or first unit.
    public static func defaultExpandedModuleId(for course: IntensiveCourse, store: CurriculumStore) -> String? {
        if let inProg = course.modules.first(where: { !store.isModuleCompleted($0.id) && store.unitProgress(for: $0.id) != nil }) {
            return inProg.id
        }
        if let nextIncomplete = course.modules.first(where: { !store.isModuleCompleted($0.id) }) {
            return nextIncomplete.id
        }
        return course.modules.first?.id
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
            ZStack {
                GoldenGateEditorialBackdrop()
                editorialBody(courses: courses, currentCourse: currentCourse, zeroToHero: zeroToHero)
            }
            .onAppear {
                syncDefaultExpandedModule(for: currentCourse)
            }
            .onChange(of: currentCourse?.id) { _, _ in
                withAnimation(GoldenGateMetrics.panelAnimation) {
                    syncDefaultExpandedModule(for: currentCourse)
                }
            }
            .onDisappear {
                waveResetTask?.cancel()
            }
        }
    }

    private func syncDefaultExpandedModule(for course: IntensiveCourse?) {
        guard let course else {
            expandedModuleId = nil
            return
        }
        if let expandedModuleId, course.modules.contains(where: { $0.id == expandedModuleId }) {
            return
        }
        expandedModuleId = Self.defaultExpandedModuleId(for: course, store: store)
    }

    private func triggerAudioPhrase(_ text: String, languageId: String) {
        NativeAudioEngine.shared.speak(text, languageId: languageId)
        withAnimation(GoldenGateMetrics.snappySpring) {
            activePlayingPhrase = text
        }
        waveResetTask?.cancel()
        waveResetTask = Task {
            let duration: UInt64 = NativeAudioEngine.shared.slowPace ? 2_200_000_000 : 1_550_000_000
            try? await Task.sleep(nanoseconds: duration)
            guard !Task.isCancelled else { return }
            await MainActor.run {
                withAnimation(GoldenGateMetrics.snappySpring) {
                    if activePlayingPhrase == text {
                        activePlayingPhrase = nil
                    }
                }
            }
        }
    }

    // MARK: - Golden Gate Editorial Main Body

    private func editorialBody(
        courses: [IntensiveCourse],
        currentCourse: IntensiveCourse?,
        zeroToHero: (done: Int, total: Int, percent: Int)
    ) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 26) {
                masteryRail(courses: courses, zeroToHero: zeroToHero)

                GoldenGateSectionHairline()

                if let course = currentCourse {
                    heroHeader(for: course)
                        .animation(GoldenGateMetrics.contentFade, value: course.id)

                    sectionNavigationBar(for: course)

                    Group {
                        switch activeTab {
                        case .syllabus:
                            syllabusChapterList(for: course)
                        case .blueprint:
                            examBlueprintSection(for: course)
                        case .phrases:
                            audioPhrasesDeck(for: course)
                        }
                    }
                    .animation(GoldenGateMetrics.contentFade, value: activeTab)
                }
            }
            .padding(.horizontal, 28)
            .padding(.vertical, 24)
            .frame(maxWidth: GoldenGateMetrics.editorialMaxWidth, alignment: .leading)
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Top Mastery Rail (Unboxed)

    private func masteryRail(
        courses: [IntensiveCourse],
        zeroToHero: (done: Int, total: Int, percent: Int)
    ) -> some View {
        let levels = courses.map(\.level)
        let activeLevelBinding = Binding<CEFRLevel>(
            get: { store.courseLevel },
            set: { newLevel in
                store.activeLessonModuleId = nil
                store.courseLevel = newLevel
            }
        )

        return ViewThatFits(in: .horizontal) {
            HStack(spacing: 14) {
                GoldenGateSegmentedControl(
                    items: levels,
                    selection: activeLevelBinding,
                    accent: BrandTheme.cefrColor(for: store.courseLevel.rawValue)
                ) { level, selected in
                    Text(level.rawValue)
                        .scaledFont(.footnote, weight: selected ? .bold : .medium, design: .monospaced)
                }

                Spacer(minLength: 12)

                overallProgressCluster(zeroToHero: zeroToHero)
                languageSegmentedControl
            }

            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    languageSegmentedControl
                    Spacer()
                    overallProgressCluster(zeroToHero: zeroToHero)
                }

                GoldenGateSegmentedControl(
                    items: levels,
                    selection: activeLevelBinding,
                    accent: BrandTheme.cefrColor(for: store.courseLevel.rawValue)
                ) { level, selected in
                    Text(level.rawValue)
                        .scaledFont(.footnote, weight: selected ? .bold : .medium, design: .monospaced)
                }
            }
        }
    }

    private func overallProgressCluster(zeroToHero: (done: Int, total: Int, percent: Int)) -> some View {
        HStack(spacing: 10) {
            Text("Overall Track")
                .scaledFont(.caption)
                .foregroundStyle(.secondary)
            ProgressView(value: Double(zeroToHero.percent), total: 100.0)
                .tint(BrandTheme.emeraldMint)
                .frame(width: 84)
            Text("\(zeroToHero.done)/\(zeroToHero.total) units")
                .scaledFont(.caption, weight: .semibold, design: .monospaced, monospacedDigit: true)
                .foregroundStyle(.secondary)
        }
    }

    private var languageSegmentedControl: some View {
        let binding = Binding<CourseLanguageOption>(
            get: { CourseLanguageOption(rawValue: store.courseLanguageId) ?? .german },
            set: { newLang in
                store.activeLessonModuleId = nil
                store.courseLanguageId = newLang.rawValue
            }
        )

        return GoldenGateSegmentedControl(
            items: CourseLanguageOption.allCases,
            selection: binding
        ) { option, selected in
            Text(option.title)
                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
        }
    }

    // MARK: - Open Unboxed Editorial Hero

    private func heroHeader(for course: IntensiveCourse) -> some View {
        let langFlag = course.languageId == "german" ? "🇩🇪" : "🇬🇧"
        let cefrColor = BrandTheme.cefrColor(for: course.level.rawValue)

        return VStack(alignment: .leading, spacing: 14) {
            FlowLayout(spacing: 8, lineSpacing: 4) {
                Text("\(langFlag) \(course.level.rawValue) · \(course.heroRole)")
                    .scaledFont(.footnote, weight: .semibold)
                    .foregroundStyle(cefrColor)
                Text("· \(course.durationWeeks) weeks · \(course.dailyHours)")
                    .scaledFont(.footnote, design: .monospaced)
                    .foregroundStyle(.secondary)
            }

            Text(course.title)
                .scaledFont(.largeTitle, weight: .bold, design: .serif)
                .fixedSize(horizontal: false, vertical: true)

            Text(course.subtitle)
                .scaledFont(.body)
                .lineSpacing(4)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            FlowLayout(spacing: 10, lineSpacing: 8) {
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
                    .buttonStyle(GoldenGatePrimaryButtonStyle())
                }

                Button {
                    NativeAudioEngine.shared.playClickSound()
                    store.openExamSimulator(languageId: course.languageId, level: course.level)
                } label: {
                    Label("4-Skill Exam", systemImage: "timer")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())

                Button {
                    NativeAudioEngine.shared.playClickSound()
                    store.openAICoach(languageId: course.languageId, level: course.level, skill: .speaking)
                } label: {
                    Label("AI Coach", systemImage: "sparkles")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())

                Button {
                    NativeAudioEngine.shared.playClickSound()
                    store.activeWorkspace = .pretest
                } label: {
                    Label("Pre-Test", systemImage: "checklist")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())
            }

            if !course.targetCertificates.isEmpty {
                Text("Targets: \(course.targetCertificates.joined(separator: " · "))")
                    .scaledFont(.footnote)
                    .foregroundStyle(.tertiary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    // MARK: - Sub-Tabs & Audio Controls Bar

    private func sectionNavigationBar(for course: IntensiveCourse) -> some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                editorialTabControl(unitCount: course.modules.count)
                Spacer(minLength: 10)
                audioUtilityGroup(for: course.languageId)
            }

            VStack(alignment: .leading, spacing: 10) {
                editorialTabControl(unitCount: course.modules.count)
                audioUtilityGroup(for: course.languageId)
            }
        }
    }

    private func editorialTabControl(unitCount: Int) -> some View {
        GoldenGateSegmentedControl(
            items: EditorialSectionTab.allCases,
            selection: $activeTab
        ) { tab, selected in
            Text(tabTitle(for: tab, unitCount: unitCount))
                .scaledFont(.footnote, weight: selected ? .semibold : .medium)
        }
    }

    private func tabTitle(for tab: EditorialSectionTab, unitCount: Int) -> String {
        switch tab {
        case .syllabus: return "Syllabus (\(unitCount))"
        case .blueprint: return "Exam Blueprint"
        case .phrases: return "Audio Phrases"
        }
    }

    private func audioUtilityGroup(for languageId: String) -> some View {
        let slowAudio = Bindable(NativeAudioEngine.shared).slowPace
        return HStack(spacing: 8) {
            accentMenu(for: languageId)

            Button {
                NativeAudioEngine.shared.playClickSound()
                withAnimation(GoldenGateMetrics.snappySpring) {
                    slowAudio.wrappedValue.toggle()
                }
            } label: {
                Label(
                    slowAudio.wrappedValue ? "0.75x Slow" : "1.0x Pace",
                    systemImage: "gauge.with.dots.needle.33percent"
                )
            }
            .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: slowAudio.wrappedValue))
        }
    }

    // MARK: - Tab 1: Progressive-Disclosure Editorial Syllabus

    private func syllabusChapterList(for course: IntensiveCourse) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(course.modules.enumerated()), id: \.element.id) { idx, mod in
                if idx > 0 {
                    GoldenGateSectionHairline()
                        .padding(.vertical, 6)
                }
                editorialUnitRow(mod, index: idx + 1, course: course)
            }
        }
    }

    private func editorialUnitRow(_ mod: CourseModule, index: Int, course: IntensiveCourse) -> some View {
        let isOpen = expandedModuleId == mod.id
        let done = store.isModuleCompleted(mod.id)
        let savedProg = store.unitProgress(for: mod.id)
        let stepsDone = savedProg?.completedSteps.count ?? 0
        let inProgress = !done && savedProg != nil
        let statusText = done
            ? "Completed"
            : (inProgress ? "In Progress · \(stepsDone)/5" : "Up Next")
        let statusColor: Color = done
            ? BrandTheme.emeraldMint
            : (inProgress ? BrandTheme.champagneGold : .secondary)

        return VStack(alignment: .leading, spacing: 0) {
            Button {
                NativeAudioEngine.shared.playClickSound()
                withAnimation(GoldenGateMetrics.panelAnimation) {
                    expandedModuleId = isOpen ? nil : mod.id
                }
            } label: {
                HStack(alignment: .top, spacing: 14) {
                    Image(systemName: "chevron.right")
                        .scaledFont(.footnote, weight: .bold)
                        .foregroundStyle(.tertiary)
                        .rotationEffect(.degrees(isOpen ? 90 : 0))
                        .animation(GoldenGateMetrics.panelAnimation, value: isOpen)
                        .padding(.top, 5)
                        .frame(width: 16)

                    VStack(alignment: .leading, spacing: 5) {
                        HStack(spacing: 10) {
                            Text("Unit \(index) · \(mod.weekLabel)")
                                .scaledFont(.footnote, weight: .semibold, design: .monospaced)
                                .foregroundStyle(BrandTheme.editorialBlue)
                            Text(statusText)
                                .scaledFont(.footnote, weight: .medium, design: .monospaced)
                                .foregroundStyle(statusColor)
                        }
                        Text(mod.title)
                            .scaledFont(.title3, weight: .semibold)
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer(minLength: 12)

                    Text(isOpen ? "Hide" : "Open")
                        .scaledFont(.footnote, weight: .medium)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .goldenGateGlassPill(isSelected: false)
                        .fixedSize()
                }
                .padding(.vertical, 14)
                .padding(.horizontal, 6)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            GoldenGateCollapsiblePanel(isExpanded: isOpen) {
                VStack(alignment: .leading, spacing: 20) {
                    Text(mod.summary)
                        .scaledFont(.body)
                        .lineSpacing(4)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    // Goals List
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(mod.objectives, id: \.self) { obj in
                            HStack(alignment: .top, spacing: 10) {
                                Circle()
                                    .fill(BrandTheme.editorialBlue)
                                    .frame(width: 6, height: 6)
                                    .padding(.top, 9)
                                Text(obj)
                                    .scaledFont(.callout)
                                    .lineSpacing(3)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }

                    // Key Pronunciation Phrases
                    if !mod.keyVocabulary.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Key Pronunciation Phrases (tap to hear)")
                                .scaledFont(.footnote, weight: .medium)
                                .foregroundStyle(.tertiary)

                            FlowLayout(spacing: 8, lineSpacing: 8) {
                                ForEach(mod.keyVocabulary, id: \.self) { word in
                                    let isPlaying = activePlayingPhrase == word
                                    Button {
                                        triggerAudioPhrase(word, languageId: course.languageId)
                                    } label: {
                                        HStack(spacing: 8) {
                                            GoldenGateAudioWaveView(
                                                isAnimating: isPlaying,
                                                color: BrandTheme.editorialBlue
                                            )
                                            Text(word)
                                                .scaledFont(.subheadline, weight: .medium)
                                        }
                                        .padding(.horizontal, 13)
                                        .padding(.vertical, 8)
                                        .goldenGateGlassPill(isSelected: isPlaying)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }

                    // Practice Drills (Deterministic Eager 2-Column / 1-Column Layout for Zero-Jank Expand)
                    if !mod.drills.isEmpty {
                        editorialDrillsGrid(mod.drills, course: course)
                    }

                    // Quiet Warm Checkpoint Strip
                    VStack(alignment: .leading, spacing: 12) {
                        ViewThatFits(in: .horizontal) {
                            HStack(alignment: .center, spacing: 14) {
                                Text("Checkpoint: \(mod.checkpointPrompt)")
                                    .scaledFont(.subheadline, weight: .medium)
                                    .fixedSize(horizontal: false, vertical: true)
                                Spacer(minLength: 10)
                                chapterActionCluster(mod: mod, index: index, course: course, done: done)
                            }
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Checkpoint: \(mod.checkpointPrompt)")
                                    .scaledFont(.subheadline, weight: .medium)
                                    .fixedSize(horizontal: false, vertical: true)
                                FlowLayout(spacing: 8, lineSpacing: 8) {
                                    chapterActionCluster(mod: mod, index: index, course: course, done: done)
                                }
                            }
                        }
                    }
                    .padding(16)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.nestedCornerRadius, tint: BrandTheme.champagneGold)
                }
                .padding(.leading, 30)
                .padding(.trailing, 8)
                .padding(.bottom, 18)
            }
        }
    }

    @ViewBuilder
    private func editorialDrillsGrid(_ drills: [CourseDrill], course: IntensiveCourse) -> some View {
        let pairStarts = Array(stride(from: 0, to: drills.count, by: 2))
        if fontScale >= 1.28 || drills.count == 1 {
            VStack(alignment: .leading, spacing: 14) {
                ForEach(drills) { drill in
                    editorialDrillSurface(drill: drill, course: course)
                }
            }
        } else {
            ViewThatFits(in: .horizontal) {
                VStack(alignment: .leading, spacing: 14) {
                    ForEach(pairStarts, id: \.self) { startIdx in
                        HStack(alignment: .top, spacing: 14) {
                            editorialDrillSurface(drill: drills[startIdx], course: course)
                            if startIdx + 1 < drills.count {
                                editorialDrillSurface(drill: drills[startIdx + 1], course: course)
                            } else {
                                Color.clear.frame(maxWidth: .infinity)
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 14) {
                    ForEach(drills) { drill in
                        editorialDrillSurface(drill: drill, course: course)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func chapterActionCluster(mod: CourseModule, index: Int, course: IntensiveCourse, done: Bool) -> some View {
        Button {
            NativeAudioEngine.shared.playClickSound()
            store.openUnitLesson(moduleId: mod.id, languageId: course.languageId, level: course.level)
        } label: {
            Label(done ? "Review Unit \(index)" : "Start Unit \(index)", systemImage: "play.fill")
        }
        .buttonStyle(GoldenGatePrimaryButtonStyle())

        Button {
            let nowDone = store.toggleModuleComplete(mod, languageId: course.languageId, level: course.level)
            if nowDone {
                NativeAudioEngine.shared.playSuccessChime()
            } else {
                NativeAudioEngine.shared.playClickSound()
            }
        } label: {
            Label(done ? "Completed" : "Mark Complete", systemImage: done ? "checkmark.circle.fill" : "circle")
        }
        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: done, accent: BrandTheme.emeraldMint))
    }

    private func editorialDrillSurface(drill: CourseDrill, course: IntensiveCourse) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("\(drill.skill.displayName) · \(drill.durationMins)m", systemImage: drill.skill.systemImage)
                .scaledFont(.footnote, weight: .semibold, design: .monospaced)
                .foregroundStyle(BrandTheme.editorialBlue)

            Text(drill.title)
                .scaledFont(.headline, weight: .semibold)
                .fixedSize(horizontal: false, vertical: true)

            Text(drill.instruction)
                .scaledFont(.subheadline)
                .lineSpacing(3)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if let passage = drill.samplePassage {
                Text(passage)
                    .scaledFont(.subheadline)
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: GoldenGateMetrics.nestedCornerRadius, style: .continuous)
                            .fill(Color.primary.opacity(0.04))
                    )
            }

            if let script = drill.audioScript {
                GoldenGateEditorialDisclosure("Reveal Audio Transcript") {
                    Text(script)
                        .scaledFont(.subheadline)
                        .lineSpacing(3)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            Spacer(minLength: 2)

            GoldenGateSectionHairline()

            FlowLayout(spacing: 8, lineSpacing: 8) {
                if let script = drill.audioScript {
                    Button {
                        triggerAudioPhrase(script, languageId: course.languageId)
                    } label: {
                        Label("Play Practice Audio", systemImage: "speaker.wave.2.fill")
                    }
                    .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: activePlayingPhrase == drill.audioScript))
                }

                Button {
                    store.openAICoach(
                        languageId: course.languageId,
                        level: course.level,
                        skill: drill.skill,
                        seedPrompt: "Practice drill: \(drill.title). \(drill.instruction)"
                    )
                } label: {
                    Label("Practice with AI", systemImage: "sparkles")
                }
                .buttonStyle(GoldenGateGlassPillButtonStyle())
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, interactive: true)
    }

    // MARK: - Tab 2: Spacious Exam Blueprint & Verified Portals

    private func examBlueprintSection(for course: IntensiveCourse) -> some View {
        VStack(alignment: .leading, spacing: 26) {
            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(300, scale: fontScale)), spacing: 16)],
                spacing: 16
            ) {
                ForEach(SkillType.allCases) { skill in
                    VStack(alignment: .leading, spacing: 10) {
                        Label(skill.displayName, systemImage: skill.systemImage)
                            .scaledFont(.title3, weight: .semibold)
                            .foregroundStyle(BrandTheme.editorialBlue)
                        Text(course.examBlueprint.description(for: skill))
                            .scaledFont(.body)
                            .lineSpacing(4)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .topLeading)
                    .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, interactive: true)
                }
            }

            GoldenGateSectionHairline()

            VStack(alignment: .leading, spacing: 14) {
                ViewThatFits(in: .horizontal) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Verified Exam Boards & Free Mock Tests")
                                .scaledFont(.title2, weight: .bold, design: .serif)
                            Text("Official practice portals for Goethe, telc, TestDaF, Cambridge, IELTS & TOEFL.")
                                .scaledFont(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button(showAllReferences ? "\(course.level.rawValue) Only" : "Show All") {
                            withAnimation(GoldenGateMetrics.snappySpring) {
                                showAllReferences.toggle()
                            }
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: showAllReferences))
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Verified Exam Boards & Free Mock Tests")
                            .scaledFont(.title2, weight: .bold, design: .serif)
                        Button(showAllReferences ? "\(course.level.rawValue) Only" : "Show All") {
                            withAnimation(GoldenGateMetrics.snappySpring) {
                                showAllReferences.toggle()
                            }
                        }
                        .buttonStyle(GoldenGateGlassPillButtonStyle(isSelected: showAllReferences))
                    }
                }

                let refs = store.examReferences(for: course, showAllForLanguage: showAllReferences)
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(310, scale: fontScale)), spacing: 14)],
                    spacing: 14
                ) {
                    ForEach(refs) { ref in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(ref.provider)
                                    .scaledFont(.footnote, weight: .semibold, design: .monospaced)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text(ref.levels.map(\.rawValue).joined(separator: " · "))
                                    .scaledFont(.footnote, weight: .bold, design: .monospaced)
                                    .foregroundStyle(BrandTheme.editorialBlue)
                            }
                            Text(ref.certificateName)
                                .scaledFont(.headline, weight: .bold)
                            Text(ref.description)
                                .scaledFont(.subheadline)
                                .lineSpacing(3)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            Text("\(ref.examDuration) · \(ref.passingScore)")
                                .scaledFont(.footnote, design: .monospaced)
                                .foregroundStyle(.tertiary)
                                .fixedSize(horizontal: false, vertical: true)

                            if let url = URL(string: ref.url) {
                                Link(destination: url) {
                                    Label("Open Official Mock Portal", systemImage: "arrow.up.right.square")
                                }
                                .buttonStyle(GoldenGateGlassPillButtonStyle())
                                .padding(.top, 2)
                            }
                        }
                        .padding(18)
                        .frame(maxWidth: .infinity, alignment: .topLeading)
                        .goldenGateSurface(cornerRadius: GoldenGateMetrics.cardCornerRadius, interactive: true)
                    }
                }
            }
        }
    }

    // MARK: - Tab 3: Interactive Audio Phrases Deck

    private func audioPhrasesDeck(for course: IntensiveCourse) -> some View {
        let items: [(id: String, unitNum: Int, phrase: String)] = course.modules.enumerated().flatMap { idx, mod in
            mod.keyVocabulary.map { word in
                (id: "\(mod.id)-\(word)", unitNum: idx + 1, phrase: word)
            }
        }

        return VStack(alignment: .leading, spacing: 14) {
            Text("Tap any expression to hear native pronunciation at \(NativeAudioEngine.shared.slowPace ? "0.75x slow" : "1.0x natural") cadence.")
                .scaledFont(.subheadline)
                .foregroundStyle(.secondary)

            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: AppTypography.scaledGridMinimum(240, scale: fontScale)), spacing: 12)],
                spacing: 12
            ) {
                ForEach(items, id: \.id) { item in
                    let isPlaying = activePlayingPhrase == item.phrase
                    Button {
                        triggerAudioPhrase(item.phrase, languageId: course.languageId)
                    } label: {
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.phrase)
                                    .scaledFont(.headline, weight: .semibold)
                                    .foregroundStyle(.primary)
                                    .multilineTextAlignment(.leading)
                                Text("Unit \(item.unitNum)")
                                    .scaledFont(.footnote, design: .monospaced)
                                    .foregroundStyle(.tertiary)
                            }
                            Spacer(minLength: 8)
                            GoldenGateAudioWaveView(
                                isAnimating: isPlaying,
                                color: BrandTheme.editorialBlue
                            )
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .goldenGateSurface(
                            cornerRadius: GoldenGateMetrics.nestedCornerRadius,
                            tint: isPlaying ? BrandTheme.editorialBlue : nil,
                            interactive: true
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Helpers

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
        }
        .buttonStyle(GoldenGateGlassPillButtonStyle())
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
}
