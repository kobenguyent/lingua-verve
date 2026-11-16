# Technical Plan 002: LinguaVerve Native macOS App (SwiftUI + MenuBarExtra)

- **Spec Reference:** [`specs/002-macos-native-app/spec.md`](spec.md)
- **Constitution:** [`.kobean/constitution.md`](../../.kobean/constitution.md)
- **Design System:** [`PRODUCT.md`](../../PRODUCT.md)

## 1. Workstream & Role Write Ownership

| Bead Task | Role | Model Tier | Owned Files / Globs | Verification Command |
| :--- | :--- | :--- | :--- | :--- |
| **Task 1: Curriculum JSON Exporter** | `content-architect` | `pro` | `scripts/export-curriculum.mjs`, `src/test/data.test.ts` | `node scripts/export-curriculum.mjs && npm test` |
| **Task 2: SwiftPM Package, Models, Store & XCTest Suite** | `mobile` | `pro` | `macos/Package.swift`, `macos/Sources/LinguaVerve/Models/**`, `macos/Sources/LinguaVerve/Store/**`, `macos/Sources/LinguaVerve/Services/**`, `macos/Tests/**` | `cd macos && swift test` |
| **Task 3: Native SwiftUI Views, 4 Interactive Diagrams & MenuBarExtra** | `mobile` | `pro` | `macos/Sources/LinguaVerve/LinguaVerveApp.swift`, `macos/Sources/LinguaVerve/Views/**`, `scripts/build-macos-app.sh` | `cd macos && swift build -c release` |
| **Task 4: NPM Scripts, `.app` Packaging & CI Hygiene** | `devops` | `pro` | `package.json`, `.gitignore`, `README.md` | `npm run macos:app && npm test && betterleaks dir . -v` |

## 2. Red-Green-Refactor TDD Sequence
1. **Task 1 (`content-architect`):** Add a test in `src/test/data.test.ts` verifying the exported `curriculum.json` schema and counts -> implement `scripts/export-curriculum.mjs` -> verify green.
2. **Task 2 (`mobile`):** Write `macos/Tests/LinguaVerveTests/CurriculumStoreTests.swift` testing JSON loading, `filterTips` parity, bookmark/mastery persistence, and `calculateDiagnosticLevel` -> implement `CurriculumModels.swift`, `CurriculumStore.swift`, and `NativeAudioEngine.swift` -> run `swift test` to verify green.
3. **Task 3 (`mobile`):** Implement `MainSplitView.swift`, `TipDetailView.swift`, `DiagramsView.swift` (all 4 diagrams), `DiagnosticSheet.swift`, `FalseFriendsView.swift`, `MenuBarPopoverView.swift`, and `LinguaVerveApp.swift` -> verify `swift build` & `swift test` green.
4. **Task 4 (`devops`):** Wire `scripts/build-macos-app.sh` and `package.json` scripts (`macos:sync`, `macos:test`, `macos:app`), build `dist-macos/LinguaVerve.app`, and run full `kb-review` gate.
