# Project Constitution — LinguaVerve (`lingua-verve`)

> Established by `kb-spec` / `kb-plan`. Higher priority than default stack references in `.kobean/`.

## 1. Purpose & Non-Goals
- **Core Problem Solved:** Provide an engineering-grade, tactical language acquisition blueprint across all 6 CEFR proficiency tiers (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`) that teaches high-leverage structural rules, phonetics/IPA, deceptive cognates (False Friends), and polyglot meta-learning systems without low-yield gamification.
- **Explicit Non-Goals (Never Build):**
  - Never add server/database dependencies that break zero-backend static deployment (`./dist` on GitHub Pages).
  - Never embed paid LLM/translation API keys in the client-side bundle.
  - Never add generic "flashcard tapping" filler that lacks a concrete `goldenRule`, `commonPitfall`, and actionable `tactics`.

## 2. Tech Stack & Runtime Constraints
- **Frontend & UI:** TypeScript 5.7, React 18.3, Vite 6.0 (`base: './'`), Tailwind CSS 3.4, `lucide-react`
- **Audio Engine:** Native Web Audio API synthesizer (`src/utils/audio.ts` — zero external audio asset bloat)
- **Data & Curriculum Architecture:** Strongly-typed TypeScript modules in `src/data/` (`languages.ts`, `levels.ts`, `falseFriends.ts`, `diagnostic.ts`, `tips/*.ts`) validated against `src/types/index.ts`
- **Testing:** Vitest 3.0 + React Testing Library + `jsdom` (`src/test/data.test.ts`, `src/test/components.test.tsx`, `src/test/audio.test.ts`)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) deploying static `./dist` to GitHub Pages

## 3. Architectural Invariants
1. **CEFR Completeness Invariant:** Every language with `status: 'active'` in `src/data/languages.ts` (except `'meta'`) **must** include validated `TipItem` blueprints covering all 6 CEFR levels (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`), enforced by `src/test/data.test.ts`.
2. **Strict Role Write Isolation:**
   - `frontend` owns UI components (`src/components/**`), SVG diagrams (`src/components/diagrams/**`), `src/App.tsx`, `src/utils/**`, `src/types/**`, and UI/audio tests (`src/test/components.test.tsx`, `src/test/audio.test.ts`).
   - `content-architect` owns linguistic datasets (`src/data/**`) and curriculum schema tests (`src/test/data.test.ts`).
   - `devops` owns `.github/workflows/**`, `vite.config.ts`, `tailwind.config.js`, and `package.json`.
3. **Zero Secrets in Repo:** `betterleaks dir . -v` must pass with 0 findings on every commit and in CI.
4. **Test-First (Red-Green-Refactor):** Every new language pack, filter capability, or UI modal/diagram includes an automated Vitest assertion that fails before the change and passes after.
5. **Ponytail Economy:** Reuse `filterTips`, `getLanguage`, `getLevelDetail`, and `soundEngine` before introducing new helpers or packages.
