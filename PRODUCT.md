# PRODUCT.md — LinguaVerve Design System & Brand Direction

> Maintained by `kb-ui` (`ui-ux-designer` & `frontend` roles) following **Impeccable** (default craft), **Taste-Skill** (opt-in `bold` mode), and **UI/UX Pro Max** lookup standards. Read this before building or modifying any frontend surface or SVG diagram in `lingua-verve`.

## 1. Product Identity & Audience
- **Kind of Product / Domain:** Polyglot Language Acquisition & Applied Linguistics Knowledge Platform ("The Polyglot's Tactical Blueprint").
- **Primary User & Context:** Self-directed language learners, engineers, and polyglots studying CEFR `A1`–`C2` structural rules, phonetics, and false friends across desktop (`1440px`), tablet (`768px`), and mobile (`390px`).
- **Voice & Tone:** Precise, tactical, authoritative, and encouraging—like an experienced polyglot coach. Zero vague ed-tech marketing clichés.
- **Design Mode:**
  - **`Default (Impeccable Craft)`** for the main filterable blueprint grid, modals (`DiagnosticModal`, `FalseFriendsModal`, `ExtensibilityModal`, `RandomTipModal`), and interactive SVG phonetic/grammar diagrams.
  - **`Bold (Taste-Skill Art Direction)`** when designing hero showcases, language launch pages, or full-viewport visual linguistic breakdowns.

## 2. Typography Scale & Pairing
- **Display / Headings:** Crisp geometric/editorial sans (`Inter` / system-ui with tight tracking `tracking-tight`, `font-extrabold` for hero & modal headers, `font-bold` for `TipCard` titles).
- **Body / Linguistic Explanations:** `14px–16px` (`text-sm` / `text-base`), `leading-relaxed` (`1.6`), constrained to `60ch–72ch` for comfortable reading of grammar and phonetic rules.
- **Monospace / IPA / CEFR Badges / Metrics:** `font-mono` with `tabular-nums` required on all CEFR level counters, estimated hours (`750h`, `900h`, `2200h`), time commitments (`5 mins/day`), and phonetic IPA transcriptions (`/ə/`, `[ç]`, `[x]`).

## 3. Color Tokens (Semantic — Light & Dark Slate Palette)
- **Surfaces & Ground:**
  - Light: `bg-slate-50` (page ground), `bg-white` (card surface), `bg-slate-100/80` (subtle pill/filter surface), `border-slate-200/80`.
  - Dark: `dark:bg-slate-950` (page ground), `dark:bg-slate-900` (card surface), `dark:bg-slate-800/70` (elevated control), `dark:border-slate-800`.
- **Ink / Text Contrast (WCAG 2.2 AA `>= 4.5:1` / AAA `>= 7:1`):**
  - Primary Ink: `text-slate-900 dark:text-slate-100`
  - Secondary Ink: `text-slate-600 dark:text-slate-300`
  - Muted / Meta: `text-slate-500 dark:text-slate-400`
- **CEFR Tier Semantic Accents (Consistent with `src/data/levels.ts`):**
  - `A1` (Breakthrough): Emerald (`emerald-500` / `emerald-600`)
  - `A2` (Waystage): Teal (`teal-500` / `teal-600`)
  - `B1` (Threshold): Sky (`sky-500` / `sky-600`)
  - `B2` (Vantage): Indigo (`indigo-500` / `indigo-600`)
  - `C1` (Effective Operational): Amber (`amber-500` / `amber-600`)
  - `C2` (Mastery): Rose (`rose-500` / `rose-600`)
- **Tactical Callout Blocks inside `TipCard`:**
  - **Golden Rule:** Amber/Gold callout (`bg-amber-500/10 border-amber-500/30`)
  - **Common Pitfall / False Friend Trap:** Rose/Danger callout (`bg-rose-500/10 border-rose-500/30`)
  - **Mastered State:** Emerald badge & ring (`border-emerald-500/40 bg-emerald-500/5`)

## 4. Layout, Interactive SVG Diagrams & Rhythm Rules
- **Container & Edges:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` with equal left and right outer edges across `Navbar`, `HeroSection`, `LevelRoadmap`, `FilterBar`, `TipCard` grid, and `Footer` at `1440px`, `1024px`, `768px`, and `390px`.
- **Interactive Visual Diagrams (`src/components/diagrams/`):**
  - Prefer high-clarity inline SVG schematics (`preposition-pyramid`, `german-gender`, `two-way-prepositions`, `mouth-phonetics`) with semantic `currentColor` / theme-aware strokes and accessible `<title>` / `aria-label` attributes over static raster images.
- **Complete Interactive States:**
  - Every filterable view must support: **Populated Grid**, **Empty Filter State** (with one-click `"Clear All Filters"` recovery button), **Saved/Bookmarked View**, and **Mastered Progress View**.
  - Every interactive button, level pill, modal trigger, and card action must include visible `:focus-visible` rings (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500`) and full keyboard operability (`Escape` closes modals).

## 5. Project-Specific Anti-Patterns (Hard Bans)
- Never use generic AI-slop neon purple-to-blue gradients or unstyled 3-icon marketing filler cards.
- Never ship a language tip with vague advice ("Practice every day!"); every tip must have a specific linguistic mechanism, IPA/structural example, golden rule, and common pitfall.
- Never break dark/light theme parity or introduce horizontal overflow at `390px` mobile width.
