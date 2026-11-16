# PROMPTING.md — State-of-the-Art AI Pipeline & Model Selection Guide for `lingua-verve`

This repository is equipped with a unified, multi-agent AI engineering pipeline (**KobeanSkills**) synthesizing best practices from **Superpowers**, **Ponytail**, **GitHub Spec-Kit**, **Beads (`.beads`)**, **Graphify**, **Betterleaks (`.betterleaks`)**, **Impeccable**, **Taste-Skill**, **UI/UX Pro Max**, and **Trail of Bits**.

---

## 1. How the AI Pipeline Works Automatically

Whenever you prompt your AI agent (Antigravity, Claude Code, Gemini CLI, or Codex CLI), `AGENTS.md` routes your request through `kb-router`:

```text
Your Prompt
  └─> kb-router (classifies intent + picks Orchestration Level 1–4 + picks Model Tier)
        ├─> 1. Orient:   Reads CONTEXT.md & graphify-out/GRAPH_REPORT.md (zero blind grepping)
        ├─> 2. Spec:     kb-spec (Ponytail Ultra gate + Socratic ask_question -> specs/NNN/spec.md)
        ├─> 3. Plan:     kb-plan (Architecture + role write-paths + .beads/ task graph via bd)
        ├─> 4. Build/UI: kb-build & kb-ui (Red-Green-Refactor TDD + Ponytail Full + PRODUCT.md)
        ├─> 5. Verify:   kb-review (.betterleaks + Trail of Bits + Vitest + chrome-devtools-mcp)
        └─> 6. Ship:     kb-git & kb-ship (Conventional commits, rebase, PR template, CHANGELOG)
```

---

## 2. Smart Model Selection Cheat-Sheet (Choosing Models Wisely)

You can let `kb-router` pick subagent models automatically via `.kobean/roles/*.yaml` (`model_tier`), or steer model choice explicitly in your prompt:

| Cognitive Tier | Antigravity Model | Claude Code | Codex CLI | Best Used For in `lingua-verve` |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Scout (`flash_lite`)** | `flash_lite` | `haiku` | `codex-mini` | Quick tag/ID checks, scanning tip counts per CEFR level, checking URLs or JSON formatting. |
| **Tier 2: Specialist (`flash`)** | `flash` | `sonnet` | `gpt-5-codex` | `explorer` (`graphify` updates), `a11y-auditor` (WCAG checks), `performance` (bundle/CWV), `supply-chain`, `tech-writer` (`README.md`). |
| **Tier 3: Deep Craft (`pro` / `inherit`)** | `pro` / `inherit` | `opus` / `sonnet-thinking` | `o3` / `gpt-5-high` | `architect`, `po`, `ui-ux-designer`, `frontend` (React/SVG diagrams), `content-architect` (CEFR A1–C2 linguistic blueprints & IPA), `debugger`, `reviewer`, `security`. |

---

## 3. Copy-Paste Prompt Templates for `lingua-verve`

### Recipe A: Parallel Multi-Agent Language Pack Expansion (`content-architect` + `run_workflow`)
Use this when activating a preview language (`spanish`, `french`, or `japanese`) across all 6 CEFR tiers (`A1`–`C2`):

```text
Use kb-router to activate Spanish ('spanish') from preview to active.
Spawn content-architect (pro model) to author src/data/tips/spanish.ts covering A1 to C2 with authentic IPA phonetics, golden rules, and common pitfalls, plus Spanish false friends in src/data/falseFriends.ts.
Follow Red-Green-Refactor TDD in src/test/data.test.ts and run kb-review when done.
```

### Recipe B: Fan-Out Multiple Languages in Parallel (`run_workflow` / Parallel Subagents)
Use this when you want multiple subagents working simultaneously on independent slices:

```text
Use kb-plan and kb-build with parallel content-architect subagents (pro model) to build full A1-C2 tip modules for Spanish, French, and Japanese in parallel, then run a flash qa subagent to verify all Vitest suites pass.
```

### Recipe C: Parallel UI + Content Feature (`frontend` + `content-architect` Role Isolation)
Because `frontend` (`src/components/**`) and `content-architect` (`src/data/**`) have strictly non-overlapping write globs, two subagents can build UI and data at the same time:

```text
Use kb-router to build an Interactive Phonetics Drill Mode:
1. Dispatch content-architect (pro) to add IPA minimal-pair drill data in src/data/.
2. In parallel, dispatch frontend (pro) to build the PhoneticsDrillModal component in src/components/ following PRODUCT.md.
3. Verify with Vitest and chrome-devtools-mcp via kb-review.
```

### Recipe D: High-Craft UI Polish or New SVG Linguistic Diagram (`kb-ui`)
Use **Default Mode (Impeccable)** for components/modals, or **Bold Mode (Taste-Skill)** for showcase sections:

```text
# Default Mode (Component / SVG Diagram):
Use kb-ui to design a new interactive SVG diagram ('sentence-bracket' for German subordinate clause verb-kickers) in src/components/diagrams/ and wire it into TipCard. Verify dark/light contrast and 390px mobile layout with chrome-devtools-mcp.

# Bold Mode (Taste-Skill Art Direction):
Use kb-ui in bold mode to redesign HeroSection.tsx with 1-section-per-screen rhythm, equal outer container edges, and an interactive live polyglot preview moment.
```

### Recipe E: Fast Ponytail Edit (Skip Ceremony for `< 20` Lines)
When you want an instant, surgical change without spec/plan overhead:

```text
Fast-path ponytail mode: add a keyboard shortcut '/' to focus the search input in FilterBar.tsx and add a unit test in src/test/components.test.tsx.
```

### Recipe F: Systematic Root-Cause Debugging (`kb-debug`)
When a test fails or a UI interaction breaks:

```text
Use kb-debug to investigate why [describe bug or paste error]. Trace callers in graphify-out/graph.json, write a failing regression test first, and apply the smallest fix.
```

### Recipe G: Pre-PR Full Verification Gate (`kb-review` + `kb-git`)
Before pushing or deploying to GitHub Pages:

```text
Run kb-review (betterleaks secret scan, Ponytail diff review, WCAG a11y check, and Vitest suite), then use kb-git to commit with conventional format.
```

### Recipe H: One-Prompt Sync & Launch Native macOS App
Whenever you update `src/data/` or pull new changes and want to sync, verify, and launch the native SwiftUI macOS app in one shot:

```text
Sync latest curriculum and launch the LinguaVerve macOS app (`npm run macos:test && npm run macos:launch`).
```

Or run directly in your terminal with one command:

```bash
npm run macos:launch
```

---

## 4. Power Steering Phrases

| Goal | Phrase to Include in Your Prompt |
| :--- | :--- |
| Challenge if a feature is needed at all | `"Run Ponytail Ultra gate first"` |
| Keep code diff as small as humanly possible | `"Enforce Ponytail Full mode: zero extra abstractions"` |
| Force bold editorial art direction | `"Use kb-ui in bold mode (Taste-Skill)"` |
| Fan out fast read-only research first | `"Spawn flash research subagents to investigate..."` |
| Work through the `.beads/` task queue | `"Check bd ready and execute the next P1 task with kb-build"` |
