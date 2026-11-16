# Technical Plan 001: State-of-the-Art AI Agent Pipeline & Multi-Model Orchestration

- **Spec Reference:** [`specs/001-ai-agent-pipeline/spec.md`](spec.md)
- **Constitution:** [`.kobean/constitution.md`](../../.kobean/constitution.md)
- **Design System:** [`PRODUCT.md`](../../PRODUCT.md)

## 1. File-Level Responsibilities & Role Write Assignments

| File / Glob | Assigned Role | Model Tier | Responsibility |
| :--- | :--- | :--- | :--- |
| `.kobean/doctrine.md`, `.kobean/skills/kb-*/SKILL.md`, `.kobean/roles/*.yaml` | `architect` | `pro` | Core precedence doctrine, Smart Model Selection Matrix, 4-level Multi-Agent Escalation Ladder, and 23 role contracts (`content-architect` added). |
| `.kobean/constitution.md`, `specs/001-ai-agent-pipeline/*` | `po` / `architect` | `pro` | LinguaVerve architectural invariants, CEFR A1–C2 completeness rules, spec, and implementation plan. |
| `CONTEXT.md`, `graphify-out/*` | `explorer` | `flash` | Structural AST graph (`graphify`) and module/helper cartography map. |
| `PRODUCT.md` | `ui-ux-designer` | `pro` | Impeccable + Taste-Skill + UI/UX Pro Max design tokens, typography, CEFR semantic colors, and SVG diagram rules. |
| `PROMPTING.md` | `tech-writer` | `flash` | Copy-pasteable prompt recipes and model-tier steering guide for LinguaVerve. |
| `.betterleaks.toml`, `.github/workflows/deploy.yml`, `.gitignore` | `devops` | `pro` | Secret scanning config, CI secret gate before GitHub Pages deploy, and gitignore hygiene. |
| `.beads/**` | `architect` | `pro` | Dependency-ordered task backlog managed via `bd`. |

## 2. Verification & Test Plan
1. **Schema & Write-Isolation Gate:** Run `/Users/josephnguyen/Developer/KobeanSkills/scripts/lint.sh` -> must output `LINT PASSED: 9 entry skills, 23 role contracts, 0 write collisions, 0 unsafe scripts.`
2. **Secret Scanning Gate:** Run `betterleaks dir . -v` -> must output `no leaks found`.
3. **Unit & Component Test Gate:** Run `npm test` (`vitest run`) -> all test suites (`data.test.ts`, `components.test.tsx`, `audio.test.ts`) must pass.
4. **Production Build Gate:** Run `npm run build` (`tsc && vite build`) -> must compile cleanly with 0 TypeScript or bundle errors.
5. **Beads Queue Gate:** Run `bd ready --json` -> must list structured, dependency-linked backlog tasks ready for `kb-build`.
