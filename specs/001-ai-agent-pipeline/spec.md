# Specification 001: State-of-the-Art AI Agent Pipeline & Multi-Model Orchestration

- **Feature ID:** `001-ai-agent-pipeline`
- **Status:** `Approved`
- **Security / Trust Boundary Trigger:** `Yes` (Enforces `.betterleaks.toml` and CI secret gate in `.github/workflows/deploy.yml`)

## 1. Ponytail Ultra Gate ("Should This Exist?")
1. **What breaks or hurts if we don't build this?** Without repository-grounded agent instructions (`AGENTS.md`, `CONTEXT.md`, `PRODUCT.md`, `.kobean/constitution.md`), a task graph (`.beads/`), and role/model routing, AI agents waste tokens re-discovering the codebase, collide when editing UI vs. data files in parallel, and risk introducing UI slop or regressions.
2. **Does an existing mechanism solve 80% of this?** Yes—`KobeanSkills` provides the core skills (`kb-*`) and role contracts, which we extend with Smart Model Selection (`flash_lite` / `flash` / `pro`), the `content-architect` role for `src/data/**`, and repo-specific grounding files.
3. **What speculative bloat was cut?** Cut custom Python/Node orchestration daemons in favor of native `bd`, `graphify`, `betterleaks`, `invoke_subagent`, `run_workflow`, and `swarm`.

## 2. Brownfield Delta Summary (`ADDED` / `MODIFIED` / `REMOVED`)
- **ADDED:**
  - `.kobean/` engine directory with 9 `kb-*` skills, 23 role YAML contracts (including new `content-architect.yaml` and `model_tier` metadata), stack/design checklists, and `.kobean/constitution.md`.
  - Cross-agent discovery links: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/`, `.claude/`, `.codex/`, `.mcp.json`.
  - `CONTEXT.md` & `graphify-out/` (`GRAPH_REPORT.md`, `graph.json`).
  - `PRODUCT.md` (Impeccable + Taste-Skill + UI/UX Pro Max design system for LinguaVerve).
  - `PROMPTING.md` (tailored prompting playbook & smart model selection guide).
  - `.betterleaks.toml` secret scanning config.
  - `.beads/` task graph initialized with `lv` prefix and seeded with actionable LinguaVerve backlog tasks.
- **MODIFIED:**
  - `.github/workflows/deploy.yml`: Added automated `betterleaks` secret scanning gate prior to build/deploy.
  - `.gitignore`: Added `.beads/dolt/` runtime state exclusion while keeping `.beads/issues.jsonl` and `.kobean/` tracked.
- **REMOVED:** None.

## 3. Acceptance Scenarios (Given / When / Then)
- **Scenario 1 (P1 — Multi-Agent Write Isolation & Model Tiering):**
  - *Given* the 23 role contracts in `.kobean/roles/*.yaml`,
  - *When* `./scripts/lint.sh` runs,
  - *Then* all 9 entry skills and 23 role contracts pass schema validation, every role declares a valid `model_tier` (`flash_lite`, `flash`, or `pro`), and `frontend` (`src/components/**`) + `content-architect` (`src/data/**`) + `devops` (`.github/**`) have 0 overlapping write globs.
- **Scenario 2 (P1 — Codebase Orientation & Task Graph):**
  - *Given* `graphify-out/GRAPH_REPORT.md`, `CONTEXT.md`, and `.beads/`,
  - *When* an agent runs `bd ready --json`,
  - *Then* dependency-ordered tasks for LinguaVerve (Spanish, French, Japanese CEFR packs and UI/SVG enhancements) are returned with role and model annotations.
- **Scenario 3 (P1 — Zero Secrets & Regression-Free Build):**
  - *Given* `.betterleaks.toml` and the Vitest suite,
  - *When* `betterleaks dir . -v`, `npm test`, and `npm run build` are executed,
  - *Then* `betterleaks` reports 0 leaks, all Vitest suites pass (`25/25` tests), and Vite produces `./dist` with 0 TypeScript errors.
