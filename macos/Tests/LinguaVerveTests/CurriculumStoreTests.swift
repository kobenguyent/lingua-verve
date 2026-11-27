import XCTest
@testable import LinguaVerveCore

final class CurriculumStoreTests: XCTestCase {

    private func makeTestStore() -> CurriculumStore {
        let suiteName = "LinguaVerveTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        return CurriculumStore(defaults: defaults)
    }

    func testBundleLoadsAllLanguagesLevelsAndTips() {
        let store = makeTestStore()
        XCTAssertEqual(store.bundle.languages.count, 6)
        XCTAssertEqual(store.bundle.levels.count, 6)
        XCTAssertGreaterThanOrEqual(store.bundle.tips.count, 32)
        XCTAssertGreaterThanOrEqual(store.bundle.falseFriends.count, 10)
        XCTAssertEqual(store.bundle.diagnosticQuestions.count, 4)
    }

    func testActiveLanguagesCoverAllCEFRLevelsA1ToC2() {
        let store = makeTestStore()
        let expectedLevels = Set(CEFRLevel.allCases.map(\.rawValue))

        for lang in ["english", "german", "french", "japanese"] {
            let levelsPresent = Set(
                store.bundle.tips
                    .filter { $0.languageId == lang }
                    .map(\.level)
            )
            for lvl in expectedLevels {
                XCTAssertTrue(levelsPresent.contains(lvl), "Missing level \(lvl) for \(lang)")
            }
        }
    }

    func testFilterTipsByLanguageLevelCategoryAndSearch() {
        let store = makeTestStore()

        store.activeLanguageId = "german"
        let germanTips = store.filteredTips
        XCTAssertFalse(germanTips.isEmpty)
        XCTAssertTrue(germanTips.allSatisfy { $0.languageId == "german" || $0.languageId == "meta" })

        store.activeLevel = "A1"
        let germanA1 = store.filteredTips
        XCTAssertFalse(germanA1.isEmpty)
        XCTAssertTrue(germanA1.allSatisfy { $0.level == "A1" || $0.level == "ALL" })

        store.resetFilters()
        store.activeLanguageId = "all"
        store.searchQuery = "schwa"
        let schwaMatches = store.filteredTips
        XCTAssertFalse(schwaMatches.isEmpty)
        XCTAssertTrue(schwaMatches.contains { $0.title.lowercased().contains("schwa") || $0.tags.contains("schwa") })
    }

    func testBookmarkAndMasteredPersistenceAndViewModes() {
        let store = makeTestStore()
        guard let firstTip = store.bundle.tips.first else {
            XCTFail("Expected at least one tip")
            return
        }

        store.toggleBookmark(firstTip.id)
        XCTAssertTrue(store.isBookmarked(firstTip.id))
        store.viewMode = .saved
        XCTAssertEqual(store.filteredTips.map(\.id), [firstTip.id])

        let mastered = store.toggleMastered(firstTip.id)
        XCTAssertTrue(mastered)
        store.viewMode = .mastered
        XCTAssertEqual(store.filteredTips.map(\.id), [firstTip.id])
    }

    func testDiagnosticLevelCalculationParityWithWeb() {
        XCTAssertEqual(
            CurriculumStore.calculateDiagnosticLevel(answers: ["q1": .A1, "q2": .A1, "q3": .A1, "q4": .A1]),
            .A1
        )
        let mid = CurriculumStore.calculateDiagnosticLevel(answers: ["q1": .B1, "q2": .B2, "q3": .B1, "q4": .B2])
        XCTAssertTrue([CEFRLevel.B1, CEFRLevel.B2].contains(mid))
        XCTAssertEqual(
            CurriculumStore.calculateDiagnosticLevel(answers: ["q1": .C2, "q2": .C2, "q3": .C2, "q4": .C2]),
            .C2
        )
    }

    func testFalseFriendsFiltering() {
        let store = makeTestStore()
        let giftMatches = store.filteredFalseFriends(query: "Gift")
        XCTAssertFalse(giftMatches.isEmpty)
        XCTAssertTrue(giftMatches.contains { $0.word.contains("Gift") })
    }
}
