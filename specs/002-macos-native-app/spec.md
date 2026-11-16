# Specification 002: LinguaVerve Native macOS App (SwiftUI + MenuBarExtra)

- **Feature ID:** `002-macos-native-app`
- **Status:** `Approved`
- **Security / Trust Boundary Trigger:** `No` (100% local offline curriculum JSON + local `UserDefaults` + Apple `AVSpeechSynthesizer` / `AVAudioEngine`)

## 1. Ponytail Ultra Gate ("Should This Exist?")
1. **What breaks or hurts if we don't build this?** Polyglot learners on macOS want an always-available Menu Bar companion (`🌐`), instant native keyboard navigation (`⌘F`, `⌘D`, `⌘R`), offline zero-browser footprint (~2.5 MB), and Apple's native `AVSpeechSynthesizer` neural voices without keeping a browser tab open.
2. **Does an existing mechanism solve 80% of this?** Yes—`src/data/` already contains the complete strongly-typed curriculum (`ALL_TIPS`, `LANGUAGES`, `CEFR_LEVELS`, `FALSE_FRIENDS`, `DIAGNOSTIC_QUESTIONS`). Exporting `src/data/` to `curriculum.json` lets the SwiftUI app share 100% of the web curriculum with zero manual duplication.
3. **What speculative bloat was cut?** Cut cloud sync, CoreData/SQLite boilerplate (using lightweight `@AppStorage` / `UserDefaults` JSON array persistence), and third-party Swift package dependencies (0 external Swift packages; pure Apple frameworks: `SwiftUI`, `AVFoundation`, `AppKit`).

## 2. Brownfield Delta Summary (`ADDED` / `MODIFIED` / `REMOVED`)
- **ADDED:**
  - `scripts/export-curriculum.mjs`: Zero-dependency exporter compiling `src/data/` into `macos/Sources/LinguaVerve/Resources/curriculum.json`.
  - `macos/Package.swift`: Swift 6.0+ package (`macOS(.v14)`) with executable target `LinguaVerve` and test target `LinguaVerveTests`.
  - `macos/Sources/LinguaVerve/Models/CurriculumModels.swift`: `Codable`, `Sendable`, `Identifiable` Swift models matching `src/types/index.ts`.
  - `macos/Sources/LinguaVerve/Store/CurriculumStore.swift`: `@Observable` store implementing `filterTips()`, `calculateDiagnosticLevel()`, `randomTip()`, and persistent `bookmarkedIds` / `masteredIds` / `isMuted`.
  - `macos/Sources/LinguaVerve/Services/NativeAudioEngine.swift`: Native `AVSpeechSynthesizer` (`0.75x` slow / `1.0x` normal BCP-47 speech) + `AVAudioEngine` / `NSSound` tactile clicks and milestone chimes.
  - `macos/Sources/LinguaVerve/Views/`:
    - `MainSplitView.swift`: 3-column `NavigationSplitView` (Sidebar: Languages, Saved/Mastered, False Friends, Diagnostic | Content: CEFR `A1`–`C2` bar + filterable list | Detail: full blueprint inspector).
    - `TipDetailView.swift`: Golden rule callout, actionable tactics, interactive diagram, clickable audio examples, common pitfall warning, curated tools, and tags.
    - `DiagramsView.swift`: All 4 interactive SwiftUI diagrams (`preposition-pyramid`, `german-gender`, `two-way-prepositions`, `mouth-phonetics`).
    - `DiagnosticSheet.swift`: Interactive 4-step CEFR level diagnostic sheet.
    - `FalseFriendsView.swift`: Searchable deceptive cognates explorer.
    - `MenuBarPopoverView.swift`: Native macOS `MenuBarExtra` (`🌐`) popover for daily random tip drills, false-friend flash cards, and 1-click TTS playback.
  - `macos/Tests/LinguaVerveTests/CurriculumStoreTests.swift`: Automated XCTest suite verifying JSON decoding, CEFR A1–C2 completeness, filtering, bookmarking/mastery, and diagnostic calculation.
  - `scripts/build-macos-app.sh`: Builds release binary and packages standalone `dist-macos/LinguaVerve.app` bundle.
- **MODIFIED:**
  - `package.json`: Add `macos:sync`, `macos:test`, `macos:build`, and `macos:app` scripts.
  - `.gitignore`: Ignore `macos/.build/` and `dist-macos/`.
- **REMOVED:** None.

## 3. Acceptance Scenarios (Given / When / Then)
- **Scenario 1 (P1 — Zero-Drift Curriculum Export):**
  - *Given* `src/data/` in the TypeScript repo,
  - *When* `npm run macos:sync` runs,
  - *Then* `macos/Sources/LinguaVerve/Resources/curriculum.json` is generated containing all 6 languages, 6 CEFR levels, all tips (`ALL_TIPS`), false friends (`FALSE_FRIENDS`), and diagnostic questions (`DIAGNOSTIC_QUESTIONS`).
- **Scenario 2 (P1 — Native Store, Filtering, and Diagnostic Accuracy):**
  - *Given* `CurriculumStore` loaded with `curriculum.json`,
  - *When* `swift test` (`npm run macos:test`) runs in `macos/`,
  - *Then* all unit tests pass verifying language/CEFR/category/search/saved/mastered filtering and `calculateDiagnosticLevel()` parity with `src/test/data.test.ts`.
- **Scenario 3 (P1 — Native SwiftUI App, Diagrams, Menu Bar & Bundle):**
  - *Given* the SwiftUI views and `scripts/build-macos-app.sh`,
  - *When* `npm run macos:app` runs,
  - *Then* `swift build -c release` compiles with 0 errors and packages a valid, launchable `dist-macos/LinguaVerve.app` bundle with `NavigationSplitView`, all 4 interactive diagrams, `MenuBarExtra`, and keyboard shortcuts (`⌘F`, `⌘D`, `⌘R`).
