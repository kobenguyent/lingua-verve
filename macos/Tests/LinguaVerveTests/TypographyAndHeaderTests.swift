import XCTest
import SwiftUI
@testable import LinguaVerveCore
@testable import LinguaVerveUI

final class TypographyAndHeaderTests: XCTestCase {
    func testSemanticTextStylesAreComfortableAndMonotonic() {
        XCTAssertGreaterThanOrEqual(AppTextStyle.largeTitle.baseSize, 32.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.title.baseSize, 26.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.title2.baseSize, 22.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.title3.baseSize, 20.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.headline.baseSize, 18.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.body.baseSize, 17.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.callout.baseSize, 16.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.subheadline.baseSize, 15.5)
        XCTAssertGreaterThanOrEqual(AppTextStyle.footnote.baseSize, 14.5)
        XCTAssertGreaterThanOrEqual(AppTextStyle.caption.baseSize, 14.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.caption2.baseSize, 13.0)

        XCTAssertLessThan(AppTextStyle.caption2.baseSize, AppTextStyle.caption.baseSize)
        XCTAssertLessThan(AppTextStyle.caption.baseSize, AppTextStyle.footnote.baseSize)
        XCTAssertLessThan(AppTextStyle.footnote.baseSize, AppTextStyle.subheadline.baseSize)
        XCTAssertLessThan(AppTextStyle.subheadline.baseSize, AppTextStyle.callout.baseSize)
        XCTAssertLessThan(AppTextStyle.callout.baseSize, AppTextStyle.body.baseSize)
        XCTAssertLessThan(AppTextStyle.body.baseSize, AppTextStyle.headline.baseSize)
        XCTAssertLessThan(AppTextStyle.headline.baseSize, AppTextStyle.title3.baseSize)
        XCTAssertLessThan(AppTextStyle.title3.baseSize, AppTextStyle.title2.baseSize)
        XCTAssertLessThan(AppTextStyle.title2.baseSize, AppTextStyle.title.baseSize)
        XCTAssertLessThan(AppTextStyle.title.baseSize, AppTextStyle.largeTitle.baseSize)
    }

    func testOpticalReadabilityCurveForExplicitSizes() {
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 9.0), 11.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 11.0), 13.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 11.5), 14.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 12.0), 14.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 14.0), 16.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 19.0), 20.75, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 24.0), 25.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 28.0), 28.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 32.0), 32.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 40.0), 40.0, accuracy: 0.001)

        let rawSizes: [CGFloat] = [9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14, 16, 18, 21, 24, 28, 30, 32, 40]
        let lifted = rawSizes.map { AppTypography.comfortableBaseSize(for: $0) }
        for index in 1..<lifted.count {
            XCTAssertLessThan(
                lifted[index - 1],
                lifted[index],
                "Optical readability curve must stay strictly monotonic at index \(index)"
            )
        }
    }

    func testResolvedPointSizeFloorAndScaling() {
        XCTAssertEqual(AppTypography.minimumReadablePointSize, 11.5, accuracy: 0.001)
        XCTAssertGreaterThanOrEqual(
            AppTypography.resolvedPointSize(baseSize: 9.0, scale: 0.85, applyOpticalLift: true),
            11.5
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 17.0, scale: 1.0, applyOpticalLift: false),
            17.0,
            accuracy: 0.001
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 17.0, scale: 1.3, applyOpticalLift: false),
            17.0 * 1.3,
            accuracy: 0.001
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 17.0, scale: 1.6, applyOpticalLift: false),
            17.0 * 1.6,
            accuracy: 0.001
        )
    }

    func testResponsiveLayoutHelpersStayBounded() {
        XCTAssertEqual(AppTypography.scaledGridMinimum(220, scale: 0.85), 220, accuracy: 0.001)
        XCTAssertGreaterThan(AppTypography.scaledGridMinimum(220, scale: 1.30), 220)
        XCTAssertEqual(AppTypography.scaledGridMinimum(220, scale: 1.60), 220 * 1.35, accuracy: 0.001)

        let scales: [CGFloat] = [1.0, 1.15, 1.30, 1.45, 1.60]
        var previousWidth: CGFloat = 0
        for scale in scales {
            let width = AppTypography.scaledSidebarIdealWidth(scale: scale)
            XCTAssertGreaterThanOrEqual(width, 258)
            XCTAssertLessThanOrEqual(width, 340)
            XCTAssertGreaterThanOrEqual(width, previousWidth)
            previousWidth = width
        }
    }

    func testGoldenGateConcentricGeometryAndEditorialDefaults() throws {
        XCTAssertEqual(GoldenGateMetrics.cardCornerRadius, 18, accuracy: 0.001)
        XCTAssertEqual(GoldenGateMetrics.nestedCornerRadius, 12, accuracy: 0.001)
        XCTAssertEqual(GoldenGateMetrics.pillCornerRadius, 999, accuracy: 0.001)
        XCTAssertGreaterThan(GoldenGateMetrics.cardCornerRadius, GoldenGateMetrics.nestedCornerRadius)
        XCTAssertGreaterThanOrEqual(GoldenGateMetrics.editorialMaxWidth, 960)

        XCTAssertEqual(
            IntensiveCoursesNativeView.EditorialSectionTab.allCases,
            [.syllabus, .blueprint, .phrases]
        )

        let store = CurriculumStore(
            defaults: UserDefaults(suiteName: "GoldenGateEditorialTests.\(UUID().uuidString)")!,
            currentAppVersion: "1.0.0"
        )
        let course = try XCTUnwrap(store.course(for: "german", level: .A1))
        XCTAssertGreaterThanOrEqual(course.modules.count, 2)

        XCTAssertEqual(
            IntensiveCoursesNativeView.defaultExpandedModuleId(for: course, store: store),
            course.modules[0].id
        )

        _ = store.toggleModuleComplete(course.modules[0], languageId: course.languageId, level: course.level)
        XCTAssertEqual(
            IntensiveCoursesNativeView.defaultExpandedModuleId(for: course, store: store),
            course.modules[1].id
        )

        store.saveUnitProgress(UnitStudyProgress(moduleId: course.modules[1].id, currentStep: 1, completedSteps: [0]))
        XCTAssertEqual(
            IntensiveCoursesNativeView.defaultExpandedModuleId(for: course, store: store),
            course.modules[1].id
        )

        for mod in course.modules {
            if !store.isModuleCompleted(mod.id) {
                _ = store.toggleModuleComplete(mod, languageId: course.languageId, level: course.level)
            }
        }
        XCTAssertEqual(
            IntensiveCoursesNativeView.defaultExpandedModuleId(for: course, store: store),
            course.modules[0].id
        )
    }

    func testCollapsibleLayoutAndCompactAISidebarLabel() {
        _ = GoldenGateMetrics.panelAnimation
        _ = GoldenGateMetrics.contentFade

        XCTAssertEqual(GoldenGateCollapsibleLayout.clampedProgress(-0.2), 0.0, accuracy: 0.001)
        XCTAssertEqual(GoldenGateCollapsibleLayout.clampedProgress(0.0), 0.0, accuracy: 0.001)
        XCTAssertEqual(GoldenGateCollapsibleLayout.clampedProgress(0.5), 0.5, accuracy: 0.001)
        XCTAssertEqual(GoldenGateCollapsibleLayout.clampedProgress(1.0), 1.0, accuracy: 0.001)
        XCTAssertEqual(GoldenGateCollapsibleLayout.clampedProgress(1.4), 1.0, accuracy: 0.001)

        var layout = GoldenGateCollapsibleLayout(progress: 0.5)
        XCTAssertEqual(layout.animatableData, 0.5, accuracy: 0.001)
        layout.animatableData = 0.75
        XCTAssertEqual(layout.progress, 0.75, accuracy: 0.001)

        let offline = AIProviderConfig(provider: .ollama, model: "llama3.2", enabled: false)
        XCTAssertEqual(RootNavigationView.compactAISidebarLabel(for: offline), "Connect AI")

        let appleOnDevice = AIProviderConfig(provider: .appleFoundation, model: "Apple Intelligence On-Device", enabled: true)
        let appleLabel = RootNavigationView.compactAISidebarLabel(for: appleOnDevice)
        XCTAssertFalse(appleLabel.contains("On-Device"))
        XCTAssertLessThanOrEqual(appleLabel.count, 20)

        let shortCloud = AIProviderConfig(provider: .openai, model: "gpt-4o", apiKey: "sk-test", enabled: true)
        XCTAssertEqual(RootNavigationView.compactAISidebarLabel(for: shortCloud), "AI: gpt-4o")
    }

    func testStoreIndexedLookupParityAcrossMutations() throws {
        let suiteName = "StoreIndexParity.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        let store = CurriculumStore(defaults: defaults, currentAppVersion: "1.0.0")

        let germanCourses = store.courses(for: "german")
        XCTAssertEqual(germanCourses.count, 6)
        let a1Course = try XCTUnwrap(store.course(for: "german", level: .A1))
        XCTAssertEqual(a1Course.level, .A1)

        let levelRefs = store.examReferences(for: a1Course, showAllForLanguage: false)
        let allRefs = store.examReferences(for: a1Course, showAllForLanguage: true)
        XCTAssertFalse(levelRefs.isEmpty)
        XCTAssertGreaterThanOrEqual(allRefs.count, levelRefs.count)

        let m0 = a1Course.modules[0]
        let m1 = a1Course.modules[1]
        XCTAssertFalse(store.isModuleCompleted(m0.id))
        XCTAssertEqual(store.languageZeroToHeroProgress(for: "german").done, 0)

        XCTAssertTrue(store.toggleModuleComplete(m0, languageId: "german", level: .A1))
        XCTAssertTrue(store.isModuleCompleted(m0.id))
        XCTAssertEqual(store.languageZeroToHeroProgress(for: "german").done, 1)

        store.markModuleCompleted(m1, languageId: "german", level: .A1, score: 92)
        XCTAssertTrue(store.isModuleCompleted(m1.id))
        XCTAssertEqual(store.languageZeroToHeroProgress(for: "german").done, 2)

        let snapshotJSON = store.exportProgressJSON()
        store.resetLearnerProgress()
        XCTAssertFalse(store.isModuleCompleted(m0.id))
        XCTAssertFalse(store.isModuleCompleted(m1.id))
        XCTAssertEqual(store.languageZeroToHeroProgress(for: "german").done, 0)

        try store.importProgressJSON(snapshotJSON)
        XCTAssertTrue(store.isModuleCompleted(m0.id))
        XCTAssertTrue(store.isModuleCompleted(m1.id))
        XCTAssertEqual(store.languageZeroToHeroProgress(for: "german").done, 2)
    }

    func testStoreAsyncPersistenceRoundTrip() throws {
        let suiteName = "StoreAsyncPersist.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        let store = CurriculumStore(
            defaults: defaults,
            currentAppVersion: "1.0.0",
            persistSynchronously: false
        )
        let course = try XCTUnwrap(store.course(for: "english", level: .B1))
        let module = course.modules[0]

        _ = store.toggleModuleComplete(module, languageId: "english", level: .B1)
        store.saveUnitProgress(UnitStudyProgress(moduleId: module.id, currentStep: 3, completedSteps: [0, 1, 2]))
        store.flushPersistence()

        let reloaded = CurriculumStore(defaults: defaults, currentAppVersion: "1.0.0")
        XCTAssertTrue(reloaded.isModuleCompleted(module.id))
        XCTAssertEqual(reloaded.unitProgress(for: module.id)?.currentStep, 3)
        XCTAssertEqual(reloaded.unitProgress(for: module.id)?.completedSteps, [0, 1, 2])
    }

    func testAudioEngineVoiceCatalogCacheAndInvalidation() {
        NativeAudioEngine.shared.invalidateVoiceCache()
        var loadCount = 0
        let sampleLoader: () -> [VoiceCandidateDescriptor] = {
            loadCount += 1
            return [
                VoiceCandidateDescriptor(identifier: "com.apple.speech.synthesis.voice.Albert", name: "Albert", language: "de-DE", qualityRaw: 1),
                VoiceCandidateDescriptor(identifier: "com.apple.voice.compact.de-DE.Anna", name: "Anna", language: "de-DE", qualityRaw: 1),
                VoiceCandidateDescriptor(identifier: "com.apple.voice.premium.de-DE.Petra", name: "Petra", language: "de-DE", qualityRaw: 3),
                VoiceCandidateDescriptor(identifier: "com.apple.siri.natural.Daniel", name: "Daniel", language: "en-GB", qualityRaw: 2)
            ]
        }

        let first = NativeAudioEngine.cachedHumanVoiceDescriptors(for: "de-DE", loader: sampleLoader)
        XCTAssertEqual(loadCount, 1)
        XCTAssertEqual(first.map(\.name), ["Petra", "Anna"])

        let second = NativeAudioEngine.cachedHumanVoiceDescriptors(for: "de-DE", loader: sampleLoader)
        XCTAssertEqual(loadCount, 1)
        XCTAssertEqual(second, first)

        NativeAudioEngine.shared.invalidateVoiceCache()
        let third = NativeAudioEngine.cachedHumanVoiceDescriptors(for: "de-DE", loader: sampleLoader)
        XCTAssertEqual(loadCount, 2)
        XCTAssertEqual(third, first)

        // Permanent regression check: live system catalog warming & ranking must not recurse or crash.
        NativeAudioEngine.shared.invalidateVoiceCache()
        NativeAudioEngine.shared.warmVoiceCache()
        let systemFirst = NativeAudioEngine.humanSystemVoices(for: "de-DE").map(\.identifier)
        let systemSecond = NativeAudioEngine.humanSystemVoices(for: "de-DE").map(\.identifier)
        XCTAssertEqual(systemFirst, systemSecond)
    }

    func testLayoutCacheTypesExist() {
        let collapsibleCache = GoldenGateCollapsibleLayout.Cache()
        XCTAssertNil(collapsibleCache.lastWidth)

        let flowCache = FlowLayout.Cache()
        XCTAssertNil(flowCache.widthKey)
    }

    func testWorkspaceHeaderSubtitlesAreConciseAndContextual() {
        let store = CurriculumStore(
            defaults: UserDefaults(suiteName: "TypographyAndHeaderTests.\(UUID().uuidString)")!,
            currentAppVersion: "1.0.0"
        )
        store.courseLanguageId = "german"
        store.courseLevel = .B2
        store.examTargetLevel = .C1
        store.aiCoachLevel = .A2
        store.aiCoachSkill = .speaking

        for section in WorkspaceSection.allCases {
            let subtitle = RootNavigationView.workspaceSubtitle(for: store, section: section)
            XCTAssertFalse(subtitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            switch section {
            case .courses:
                XCTAssertTrue(subtitle.contains("German") && subtitle.contains("B2"))
            case .pretest:
                XCTAssertTrue(subtitle.contains("German"))
            case .simulator:
                XCTAssertTrue(subtitle.contains("German") && subtitle.contains("C1"))
            case .aiCoach:
                XCTAssertTrue(subtitle.contains("German") && subtitle.contains("A2") && subtitle.contains("Speaking"))
            case .progress:
                XCTAssertTrue(subtitle.contains("units") && subtitle.contains("exams"))
            case .manual:
                XCTAssertTrue(subtitle.contains("Reference") || subtitle.contains("Field"))
            }
        }
    }
}
