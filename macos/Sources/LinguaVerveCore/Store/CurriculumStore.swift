import Foundation
import Observation

@Observable
public final class CurriculumStore {
    public private(set) var bundle: CurriculumBundle

    // Filters
    public var activeLanguageId: String = "all"
    public var activeLevel: String = "ALL" // "ALL" or CEFRLevel.rawValue
    public var selectedCategory: String = "all" // "all" or TipCategory.rawValue
    public var searchQuery: String = ""
    public var viewMode: ViewModeFilter = .all
    public var selectedTipId: String?

    // Persistent User Progress
    public private(set) var bookmarkedIds: Set<String>
    public private(set) var masteredIds: Set<String>

    private let defaults: UserDefaults
    private let bookmarksKey = "linguaverve.macos.bookmarks"
    private let masteredKey = "linguaverve.macos.mastered"

    public init(bundle: CurriculumBundle? = nil, defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let loaded = bundle ?? Self.loadDefaultBundle()
        self.bundle = loaded
        self.bookmarkedIds = Set(defaults.stringArray(forKey: bookmarksKey) ?? [])
        self.masteredIds = Set(defaults.stringArray(forKey: masteredKey) ?? [])
        self.selectedTipId = loaded.tips.first?.id
    }

    public static func loadDefaultBundle() -> CurriculumBundle {
        guard let url = Bundle.module.url(forResource: "curriculum", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(CurriculumBundle.self, from: data) else {
            return CurriculumBundle(
                generatedAt: "",
                version: "1.0.0",
                languages: [],
                levels: [],
                tips: [],
                falseFriends: [],
                diagnosticQuestions: []
            )
        }
        return decoded
    }

    public var filteredTips: [TipItem] {
        Self.filterTips(
            tips: bundle.tips,
            languageId: activeLanguageId,
            level: activeLevel,
            category: selectedCategory,
            searchQuery: searchQuery,
            bookmarkedIds: bookmarkedIds,
            masteredIds: masteredIds,
            viewMode: viewMode
        )
    }

    public static func filterTips(
        tips: [TipItem],
        languageId: String = "all",
        level: String = "ALL",
        category: String = "all",
        searchQuery: String = "",
        bookmarkedIds: Set<String> = [],
        masteredIds: Set<String> = [],
        viewMode: ViewModeFilter = .all
    ) -> [TipItem] {
        let q = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return tips.filter { tip in
            // 1. Language filter
            if languageId != "all" {
                if tip.languageId != languageId && tip.languageId != "meta" {
                    return false
                }
            }

            // 2. Level filter
            if level != "ALL" {
                if tip.level != level && tip.level != "ALL" {
                    return false
                }
            }

            // 3. Category filter
            if category != "all" {
                if tip.category.rawValue != category {
                    return false
                }
            }

            // 4. ViewMode filter
            switch viewMode {
            case .all:
                break
            case .saved:
                if !bookmarkedIds.contains(tip.id) { return false }
            case .mastered:
                if !masteredIds.contains(tip.id) { return false }
            }

            // 5. Search query filter
            if !q.isEmpty {
                let matchesTitle = tip.title.lowercased().contains(q)
                let matchesSummary = tip.summary.lowercased().contains(q)
                let matchesRule = tip.goldenRule.lowercased().contains(q)
                let matchesTags = tip.tags.contains { $0.lowercased().contains(q) }
                let matchesTactics = tip.tactics.contains { $0.lowercased().contains(q) }
                if !matchesTitle && !matchesSummary && !matchesRule && !matchesTags && !matchesTactics {
                    return false
                }
            }

            return true
        }
    }

    public func filteredFalseFriends(query: String = "", languageId: String = "all") -> [FalseFriendItem] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return bundle.falseFriends.filter { item in
            if languageId != "all" && item.languageId != languageId {
                return false
            }
            if q.isEmpty { return true }
            return item.word.lowercased().contains(q)
                || item.confusedWith.lowercased().contains(q)
                || item.actualMeaning.lowercased().contains(q)
                || item.memoryHack.lowercased().contains(q)
        }
    }

    public var tipsCountByLevel: [String: Int] {
        var counts: [String: Int] = ["ALL": 0]
        for tip in bundle.tips {
            if activeLanguageId != "all" && tip.languageId != activeLanguageId && tip.languageId != "meta" {
                continue
            }
            counts["ALL", default: 0] += 1
            counts[tip.level, default: 0] += 1
        }
        return counts
    }

    public var hasActiveFilters: Bool {
        activeLevel != "ALL" || selectedCategory != "all" || !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewMode != .all
    }

    public func resetFilters() {
        activeLevel = "ALL"
        selectedCategory = "all"
        searchQuery = ""
        viewMode = .all
    }

    public func toggleBookmark(_ id: String) {
        if bookmarkedIds.contains(id) {
            bookmarkedIds.remove(id)
        } else {
            bookmarkedIds.insert(id)
        }
        defaults.set(Array(bookmarkedIds), forKey: bookmarksKey)
    }

    public func toggleMastered(_ id: String) -> Bool {
        let nowMastered: Bool
        if masteredIds.contains(id) {
            masteredIds.remove(id)
            nowMastered = false
        } else {
            masteredIds.insert(id)
            nowMastered = true
        }
        defaults.set(Array(masteredIds), forKey: masteredKey)
        return nowMastered
    }

    public func isBookmarked(_ id: String) -> Bool {
        bookmarkedIds.contains(id)
    }

    public func isMastered(_ id: String) -> Bool {
        masteredIds.contains(id)
    }

    public func randomTip(for languageId: String? = nil) -> TipItem? {
        let lang = languageId ?? activeLanguageId
        let pool = lang != "all"
            ? bundle.tips.filter { $0.languageId == lang || $0.languageId == "meta" }
            : bundle.tips
        return pool.randomElement() ?? bundle.tips.first
    }

    public func language(for id: String) -> LanguageItem? {
        bundle.languages.first { $0.id == id }
    }

    public func levelDetail(for levelId: String) -> LevelDetail? {
        bundle.levels.first { $0.id.rawValue == levelId }
    }

    public static func calculateDiagnosticLevel(answers: [String: CEFRLevel]) -> CEFRLevel {
        guard !answers.isEmpty else { return .A1 }
        let sum = answers.values.reduce(0) { $0 + $1.numericRank }
        let avg = Int((Double(sum) / Double(answers.count)).rounded())
        return CEFRLevel.fromRank(avg)
    }
}
