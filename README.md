# LinguaVerve 🌐
> **The Polyglot's Tactical Blueprint** — High-leverage language acquisition strategies from A1 Breakthrough to C2 Mastery for English, German, and beyond.

[![Test Suite](https://img.shields.io/badge/Vitest-22%20passed-emerald)](./src/test)
[![Deploy to GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-sky)](./.github/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Why LinguaVerve?

Most language platforms keep learners trapped in endless, low-yield vocabulary taps without building true conversational instinct. 

**LinguaVerve** was engineered from the perspective of an authentic polyglot. It treats language acquisition not as memorization, but as an engineering discipline with high-leverage cheat-codes, phonetic muscle memory, and structural deconstruction across every standard CEFR proficiency tier (**A1, A2, B1, B2, C1, C2**).

---

## ⚡ Core Features

- **🇩🇪 German Tactical Knowledge Base (A1 → C2):**
  - **A1:** The 80% Noun Suffix cheat-code (`-ung`, `-heit`, `-keit`, `-chen`), the iron V2 verb order rule, and the two CH sounds (`[ç]` vs. `[x]`).
  - **A2:** The 4-case system demystified (why only masculine shifts in Akkusativ), two-way prepositions (*Wechselpräpositionen*), and separable verb launchpads.
  - **B1:** The subordinate verb-kicker (*weil*, *dass*, *obwohl*), and courteous *Konjunktiv II*.
  - **B2:** The secret spice of native German: *Modalpartikeln* (*doch*, *ja*, *mal*, *halt*), and the 2-step adjective ending logic (no 48-cell grids).
  - **C1:** Academic *Nominalstil* and extended participial bracket constructions (*Partizipialattribute*).
  - **C2:** Idiomatic mastery (*Redewendungen*), philosophical cadence, and *Konjunktiv I* for journalistic distance.

- **🇬🇧 English Tactical Knowledge Base (A1 → C2):**
  - **A1:** Rhythmic stress-timing and the ubiquitous Schwa (`/ə/`), Pareto 300 lemma foundation, and voiced vs voiceless `TH`.
  - **A2:** Irregular verbs grouped by rhyming vowel patterns, and the spatial pyramid for `IN, ON, AT`.
  - **B1:** Phrasal verb decoding through conceptual particle metaphors (`UP` = completion, `OUT` = expansion).
  - **B2:** Collocation mastery (moving from isolated words to authentic chunks), and the 1.25x unscripted audio cascade.
  - **C1:** Stylistic negative adverb inversion (*"Rarely have I seen..."*), and nuanced hedging discourse markers (*albeit*, *nonetheless*).
  - **C2:** Decoding British understatement, pragmatic irony, and speech prosody.

- **🧠 Polyglot Meta-System:**
  - Professor Arguelles' Shadowing technique for accent elimination.
  - The Conversational Island method for early impromptu speaking.
  - Krashen's `i + 1` comprehensible input doctrine.
  - Atomic spaced repetition (Anki) best practices.
  - Smashing the notorious B2 plateau.

- **🎯 Interactive CEFR Diagnostic Level Finder:**
  - 4-step diagnostic assessment calculating your current CEFR tier with one-click filtering.

- **⚠️ False Friends & Deceptive Cognates Cheat-Sheet:**
  - Interactive searchable guide for dangerous traps like *Gift* (Poison, not present!), *bekommen* (to receive, not to become), *aktuell* (current, not actual), *prägnant*, *brav*, and *Chef*.

- **💾 Local Storage Persistence:**
  - Bookmark favorite tactics for later review.
  - Mark mastered blueprints to track your progress live.
  - Persistent dark/light theme switch.

- **🧩 Built for Infinite Extensibility:**
  - Add Spanish, French, Japanese, Mandarin, or Italian in under 3 minutes thanks to strict TypeScript data schemas.

---

## 🚀 Quick Start

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/your-username/lingua-verve.git
cd lingua-verve
npm install
\`\`\`

### 2. Start Dev Server
\`\`\`bash
npm run dev
\`\`\`
Visit `http://localhost:5173` in your browser.

### 3. Run Automated Tests
\`\`\`bash
npm test
\`\`\`
Runs the Vitest suite validating data completeness, CEFR coverage, filters, and UI components.

### 4. Build Production Static Bundle
\`\`\`bash
npm run build
\`\`\`
Outputs an optimized, zero-backend static site to `./dist`.

---

## 🚢 Deploying to GitHub Pages

LinguaVerve is configured for seamless deployment to GitHub Pages via `./dist` and relative path asset resolution (`base: './'` in `vite.config.ts`).

### Automated Deployment (GitHub Actions)
The included workflow file [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) automatically builds, tests, and deploys every push to the `main` branch.

1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push a commit or trigger the workflow under the **Actions** tab — your site will be live in ~60 seconds!

---

## 🧩 Adding a New Language (Extensibility Guide)

Adding another target language (e.g. Spanish, French, Italian, Japanese) requires only 3 steps:

### Step 1: Register in `src/data/languages.ts`
\`\`\`typescript
export const LANGUAGES: Language[] = [
  // ...
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    tagline: 'The Expressive Romance Tongue',
    description: 'Subjunctive mood mastery, rolled R phonetics, and rapid cadence.',
    family: 'Romance',
    estimatedHoursToC1: 600,
    difficultyRating: 'Category I',
    status: 'active' // change from 'preview' to 'active'
  }
];
\`\`\`

### Step 2: Create `src/data/tips/spanish.ts`
\`\`\`typescript
import { TipItem } from '../../types';

export const SPANISH_TIPS: TipItem[] = [
  {
    id: 'es-a1-rolled-r',
    title: 'The Mechanical Rolled R: Tongue Relaxation Drill',
    languageId: 'spanish',
    level: 'A1',
    category: 'pronunciation',
    summary: 'Master the alveolar trill by releasing tension at the gum ridge.',
    goldenRule: 'Blow air with a completely relaxed tongue tip rather than forcing it.',
    tactics: [
      'Say "butter" rapidly in American English to locate the tapping alveolar spot.',
      'Exhale air while lightly fluttering the tongue tip against the roof.'
    ],
    commonPitfall: 'Using throat friction like a French R.',
    timeCommitment: '5 mins/day',
    tags: ['pronunciation', 'rolled-r', 'phonetics']
  }
  // Add tips across A1, A2, B1, B2, C1, C2
];
\`\`\`

### Step 3: Export in `src/data/index.ts`
\`\`\`typescript
import { SPANISH_TIPS } from './tips/spanish';

export const ALL_TIPS: TipItem[] = [
  ...ENGLISH_TIPS,
  ...GERMAN_TIPS,
  ...SPANISH_TIPS,
  ...META_TIPS
];
\`\`\`

All filters, level roadmaps, search indexes, and Vitest test assertions will automatically integrate the new language.

---

## 🧪 Testing Architecture

LinguaVerve includes automated tests in [`src/test/`](file:///src/test/):
- **`data.test.ts`**: Validates schema integrity, active language availability, complete CEFR level coverage from A1 to C2 for all active languages, and search/filter algorithms.
- **`components.test.tsx`**: Validates UI component rendering, language switching, bookmark/mastered state mutations, and interactive modal workflows.

Run tests anytime with:
\`\`\`bash
npm test
\`\`\`

---

## 📜 License
MIT License. Built with ❤️ for the global polyglot community.
