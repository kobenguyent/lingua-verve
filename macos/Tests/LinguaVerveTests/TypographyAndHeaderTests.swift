import XCTest
import SwiftUI
@testable import LinguaVerveCore
@testable import LinguaVerveUI

final class TypographyAndHeaderTests: XCTestCase {
    func testSemanticTextStylesAreComfortableAndMonotonic() {
        XCTAssertGreaterThanOrEqual(AppTextStyle.body.baseSize, 15.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.subheadline.baseSize, 14.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.caption.baseSize, 13.0)
        XCTAssertGreaterThanOrEqual(AppTextStyle.caption2.baseSize, 12.0)

        XCTAssertLessThan(AppTextStyle.caption2.baseSize, AppTextStyle.caption.baseSize)
        XCTAssertLessThanOrEqual(AppTextStyle.caption.baseSize, AppTextStyle.footnote.baseSize)
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
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 9.0), 11.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 11.0), 13.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 11.5), 13.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 12.0), 14.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 14.0), 16.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 19.0), 20.5, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 32.0), 32.0, accuracy: 0.001)
        XCTAssertEqual(AppTypography.comfortableBaseSize(for: 40.0), 40.0, accuracy: 0.001)

        let rawSizes: [CGFloat] = [9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14, 16, 18, 21, 24, 30, 40]
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
        XCTAssertGreaterThanOrEqual(
            AppTypography.resolvedPointSize(baseSize: 9.0, scale: 0.85, applyOpticalLift: true),
            10.5
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 15.5, scale: 1.0, applyOpticalLift: false),
            15.5,
            accuracy: 0.001
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 15.5, scale: 1.3, applyOpticalLift: false),
            15.5 * 1.3,
            accuracy: 0.001
        )
        XCTAssertEqual(
            AppTypography.resolvedPointSize(baseSize: 15.5, scale: 1.6, applyOpticalLift: false),
            15.5 * 1.6,
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
            XCTAssertGreaterThanOrEqual(width, 252)
            XCTAssertLessThanOrEqual(width, 330)
            XCTAssertGreaterThanOrEqual(width, previousWidth)
            previousWidth = width
        }
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
