# LinguaVerve 🌐
> **The Polyglot's Intensive Academy & Tactical Blueprint** — Zero-to-Hero A1→C2 Intensive Courses, 4-Skill Certification Exam Simulators, Local & Cloud AI Coaching, and Official Exam References for English, German, and beyond.

[![Test Suite](https://img.shields.io/badge/Vitest-50%20passed-emerald)](./src/test)
[![Deploy to GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-sky)](./.github/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Complete Polyglot Mastery Suite

### 1. 🎓 Zero-to-Hero Intensive Courses (`A1 → C2`)
12 full intensive courses (**6 English + 6 German**, extensible to Spanish, French, Japanese, and more):
- Structured multi-week syllabus units covering all 4 certification skills: **Reading**, **Listening & Hearing**, **Writing**, and **Speaking**.
- Interactive module completion tracking, grammar checkpoints, clickable TTS exam vocabulary, audio ear-training drills (`1.0x` and `0.75x Slow`), and authentic reading mini-passages.
- **Verified Official Certification & Mock Test Library** linking directly to real internet exam portals:
  - **🇩🇪 German:** Goethe-Institut (`A1–C2`), telc Deutsch, TestDaF, ÖSD, Deutsche Welle (*Nicos Weg*, *Top-Thema*, *Video-Thema*), and vhs-Lernportal.
  - **🇬🇧 English:** Cambridge English (`A2 Key`, `B1 Preliminary`, `B2 First`, `C1 Advanced`, `C2 Proficiency`), IELTS (`ielts.org`, British Council, IDP), ETS TOEFL iBT, BBC Learning English, and British Council LearnEnglish.

### 2. 🎯 Scored 4-Skill Placement Pre-Test & Collective Course Recommender
- 12 progressive `A1 → C2` items per language testing Reading, Listening/Hearing (real spoken audio with replay limits), Writing/Grammar, and Speaking Pragmatics.
- Verifies your authentic starting CEFR tier, diagnoses weak skills, and automatically prescribes and enrolls a **Collective Multi-Course Study Bundle** (Foundation Reinforcement + Core Intensive Course + Bridge to Next Tier).

### 3. ⏱️ High-Pressure 4-Skill Simulated Exam Arena (`12 Full Exams`)
- Full timed mock simulations for **English (A1–C2)** and **German (A1–C2)** aligned with Goethe-Zertifikat, telc, TestDaF, Cambridge, IELTS, and TOEFL.
- **Strict Exam Pressure Mode** vs. **Practice Mode**: live countdown clock with auto-submit, strict audio replay caps (`2x` for A1–B2, `1x` for C1–C2), locked transcripts until submission, live word counter, preparation & speaking countdown timers, live browser microphone Speech-to-Text capture, and full official-style scorecards with model answers & explanations.

### 4. 🤖 Connect Local or Cloud AI Providers for 4-Skill Mastery
Works 100% statically from your browser (zero backend required, ideal for GitHub Pages!):
- **Local AI (Free & Private):** Ollama (`http://localhost:11434/v1/chat/completions`), LM Studio (`http://localhost:1234/v1/chat/completions`).
- **Cloud AI:** OpenAI, Google Gemini, OpenRouter, or any Custom OpenAI-compatible endpoint (Groq, Mistral, vLLM, etc.).
- Built-in connection tester, **4-Skill AI Coaching Studio** (Reading Lab, Listening/Hearing Audio Generator, Writing Exam Examiner, Voice Speaking Roleplay Partner), live AI grading inside Simulated Exams, and an intelligent offline CEFR rubric fallback when no AI provider is configured.

### 5. 📊 Learner Progress, History & Test Results Tracker
- Persists completed course modules, Zero-to-Hero CEFR maps, 4-skill competency averages, Pre-Test history, Simulated Exam scorecards, AI coaching logs, and daily study streaks in `localStorage`.
- One-click **JSON Backup Export & Import** so learners never lose progress across devices.

### 6. 📖 Tactical Field Manual (Tips, SVG Diagrams, Audio & False Friends)
- All A1–C2 polyglot cheat-codes, 4 interactive SVG visual models (Preposition Pyramid, German Gender Suffix Matrix, Wechselpräpositionen Movement Visualizer, Articulatory Phonetics), native pronunciation engine, and False Friends explorer.

---

## 🚀 Quick Start (Web & Native Apple Apps)

### Web SPA (GitHub Pages)
```bash
npm install
npm run dev      # Start local dev server
npm test         # Run all 50 Vitest unit & component integration tests
npm run build    # Type-check & build static GitHub Pages bundle -> ./dist
```

### 📱 Native Apple Universal App (MacBook · iPad · iPhone)
LinguaVerve shares one single source of truth (`src/data/` → `curriculum.json`) with a 100% native **SwiftUI Multiplatform App** (`LinguaVerveCore` + `LinguaVerveUI`) supporting **macOS 14+**, **iPadOS 17+**, and **iOS 17+**:
- **Adaptive Layout:** Native `NavigationSplitView` sidebar on **MacBook** & **iPad**, and native bottom `TabView` on **iPhone**.
- **Native Hardware Integration:** `AVSpeechSynthesizer` native voices (`0.75x` slow & `1.0x`), Apple `Speech` (`SFSpeechRecognizer`) live voice dictation for Speaking Exams & AI Roleplays, iOS haptics, and `NSAllowsLocalNetworking` so your **iPhone/iPad** can connect to **Local Ollama / LM Studio** running on your MacBook over Wi-Fi!
- **MacBook Extras:** Standalone signed `.app` bundle (`dist-macos/LinguaVerve.app`), macOS Menu Bar quick-drill popover, keyboard shortcuts (`⌘1`–`⌘6`), and GitHub Releases auto-updater.

```bash
npm run apple:xcode   # Sync curriculum, generate icons + Xcode project, run Swift XCTests, build iOS/iPadOS & macOS
npm run apple:open    # Open apple/LinguaVerve.xcodeproj to run on iPhone, iPad, or MacBook
npm run macos:app     # Build & sign standalone dist-macos/LinguaVerve.app (+ .dmg / .zip)
npm run macos:test    # Run native Swift XCTest suite (16 tests)
```

---

## 🚢 GitHub Pages Deployment

Configured with `base: './'` in [`vite.config.ts`](file:///vite.config.ts) and automated CI/CD in [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml). Every push to `main` runs the full test suite, builds `./dist`, and deploys straight to GitHub Pages.
