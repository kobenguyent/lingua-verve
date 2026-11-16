# Graph Report - lingua-verve  (2026-11-16)

## Corpus Check
- 46 files · ~30,124 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 181 nodes · 205 edges · 11 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `CurriculumStore` - 15 edges
2. `TipCategory` - 14 edges
3. `CEFRLevel` - 13 edges
4. `CurriculumStoreTests` - 9 edges
5. `VisualDiagramType` - 9 edges
6. `NativeAudioEngine` - 9 edges
7. `SoundEngine` - 9 edges
8. `ViewModeFilter` - 8 edges
9. `MainSplitView` - 5 edges
10. `LanguageItem` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handleSelectOption()` --calls--> `calculateDiagnosticLevel()`  [INFERRED]
  src/components/DiagnosticModal.tsx → src/data/index.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (11): View, DiagnosticSheet, Color, DiagramsView, GermanGenderCardsView, MouthPhoneticsView, PrepositionPyramidView, TwoWayPrepositionsView (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (19): Codable, Equatable, Identifiable, CurriculumBundle, DiagnosticOption, DiagnosticQuestion, FalseFriendItem, LanguageItem (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (1): CurriculumStore

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (12): CaseIterable, CEFRLevel, A1, A2, B1, B2, C1, C2 (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (2): NativeAudioEngine, String

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (2): CurriculumStoreTests, XCTestCase

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (1): SoundEngine

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (9): TipCategory, grammar, habits, immersion, listening, mindset, pronunciation, speaking (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (2): handleSelectOption(), calculateDiagnosticLevel()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (1): MainSplitView

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (2): App, LinguaVerveApp

## Knowledge Gaps
- **22 isolated node(s):** `Color`, `A1`, `A2`, `B1`, `B2` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (15 nodes): `CurriculumStore.swift`, `CurriculumStore`, `.calculateDiagnosticLevel()`, `.filteredFalseFriends()`, `.filterTips()`, `.init()`, `.isBookmarked()`, `.isMastered()`, `.language()`, `.levelDetail()`, `.loadDefaultBundle()`, `.randomTip()`, `.resetFilters()`, `.toggleBookmark()`, `.toggleMastered()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (11 nodes): `NativeAudioEngine.swift`, `NativeAudioEngine`, `.bcp47LanguageCode()`, `.bestVoice()`, `.init()`, `.playClickSound()`, `.playSuccessChime()`, `.speak()`, `.stopSpeech()`, `.toggleMute()`, `String`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (10 nodes): `CurriculumStoreTests`, `.makeTestStore()`, `.testActiveLanguagesCoverAllCEFRLevelsA1ToC2()`, `.testBookmarkAndMasteredPersistenceAndViewModes()`, `.testBundleLoadsAllLanguagesLevelsAndTips()`, `.testDiagnosticLevelCalculationParityWithWeb()`, `.testFalseFriendsFiltering()`, `.testFilterTipsByLanguageLevelCategoryAndSearch()`, `CurriculumStoreTests.swift`, `XCTestCase`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (10 nodes): `audio.ts`, `SoundEngine`, `.constructor()`, `.getAudioContext()`, `.getMuted()`, `.playClickSound()`, `.playSuccessChime()`, `.speak()`, `.stopSpeech()`, `.toggleMute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (7 nodes): `handleReset()`, `handleSelectOption()`, `calculateDiagnosticLevel()`, `filterTips()`, `getRandomTip()`, `DiagnosticModal.tsx`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (5 nodes): `MainSplitView.swift`, `MainSplitView`, `.categoryRow()`, `.init()`, `.sidebarLanguageRow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (3 nodes): `App`, `LinguaVerveApp`, `LinguaVerveApp.swift`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurriculumStore` connect `Community 2` to `Community 5`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `CurriculumBundle` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `TipCategory` connect `Community 7` to `Community 1`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `Color`, `A1`, `A2` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._