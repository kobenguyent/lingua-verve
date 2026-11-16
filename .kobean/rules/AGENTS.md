# KobeanSkills — Always-On Engineering Rules (`lingua-verve`)

For every coding, curriculum/content, architecture, UI/UX, debugging, code review, security, or release task in this repository, follow [`.kobean/doctrine.md`](.kobean/doctrine.md), [`.kobean/constitution.md`](.kobean/constitution.md), [`PRODUCT.md`](PRODUCT.md), and [`CONTEXT.md`](CONTEXT.md), and route workflows through the `kb-*` skills (`kb-router`, `kb-spec`, `kb-plan`, `kb-build`, `kb-ui`, `kb-review`, `kb-debug`, `kb-git`, `kb-ship`).

For copy-paste prompt playbooks and multi-agent / model-routing recipes tailored to **LinguaVerve**, see [`PROMPTING.md`](PROMPTING.md).

## Core Defaults (Active Across All Tasks)

1. **Automatic Routing (`kb-router`):**
   - **Multi-file feature, new language pack, or ambiguous request:** Run `kb-spec` (`specs/NNN-<slug>/spec.md`) -> `kb-plan` (`plan.md` + `.beads/` issues via `bd`) -> `kb-build` -> `kb-review`.
   - **Trivial 1-file change (< 20 lines, clear scope):** Skip spec/plan and execute directly inline with Ponytail economy + verification.
   - **UI / Frontend / SVG Diagram work:** Follow `kb-ui` (read `PRODUCT.md`; Impeccable craft by default; Taste-Skill `bold` mode for landing pages/showcases; zero generic AI-slop gradients or 3-icon filler cards; verify in `chrome-devtools-mcp`).
   - **Bug / Failing test:** Follow `kb-debug` (reproduce first, trace callers via `graphify`, write a failing regression test before editing implementation code).
2. **Smart Model & Multi-Agent Selection (`.kobean/doctrine.md` Section 6):**
   - Match model tier to role `model_tier`:
     - **`flash_lite`** (`haiku` / `codex-mini`): Trivial file/tag scans, link/schema checks, JSON filtering.
     - **`flash`** (`sonnet` / `gpt-5-codex`): `explorer` (`graphify` synthesis), `a11y-auditor`, `performance`, `supply-chain`, `tech-writer`, `release-manager`.
     - **`pro` / `inherit`** (`opus` / `o3`): `po`, `threat-modeler`, `architect`, `ui-ux-designer`, `frontend`, `content-architect`, `debugger`, `refactorer`, `reviewer`, `security`, `qa`.
   - Escalate orchestration cleanly:
     - **Level 1 — Inline:** `< 20` lines or single-role step in current turn.
     - **Level 2 — Targeted Subagents (`invoke_subagent`):** Isolated research (`TypeName="research"`) or 2–3 parallel non-overlapping roles (`frontend` on `src/components/**` + `content-architect` on `src/data/**`).
     - **Level 3 — Programmatic Pipeline (`run_workflow`):** Fan-out/fan-in across $N \ge 3$ independent slices (e.g., generating A1–C2 tips across Spanish, French, and Japanese in parallel).
     - **Level 4 — Collaborative Swarm (`swarm`):** Multi-worker isolated checkouts (`workspace: "share"`) with a dedicated `qa`/`reviewer` verifier.
3. **Single Source of Task State (`.beads/` via `bd`):** Use `bd` (`bd ready --json`, `bd create`, `bd dep add`, `bd close`) when tracking multi-step tasks—never create `tasks.md` or `progress.md`.
4. **Ponytail Economy in Build/Review:** Reuse existing codebase helpers (`filterTips`, `getLanguage`, `getLevelDetail`, `soundEngine`) and standard library first; write the smallest complete change; end build/review replies with 1–2 lines noting what was intentionally skipped and any residual risk.
5. **Role Isolation (`.kobean/roles/*.yaml`):** Enforce strict non-overlapping `writes` paths (`frontend` owns `src/components/**`, `src/App.tsx`, `src/utils/**`, `src/types/**`; `content-architect` owns `src/data/**`, `src/test/data.test.ts`; `devops` owns `.github/**`, `vite.config.ts`, `package.json`).
6. **Hard Completion Gates:** Never mark work ready to ship if `betterleaks dir . -v` finds secrets, `npm test` (`vitest run`) fails, or `CRITICAL`/`HIGH` review/security findings remain open.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker (`bd`)

This project uses **`bd` (Beads)** for dependency-ordered task tracking.

```bash
bd ready --json         # Find unblocked tasks ready to claim
bd show <id>            # View task details and dependencies
bd update <id> --claim  # Claim a task before editing files
bd close <id> --reason "Implemented ...; verified in ..."
```
<!-- END BEADS INTEGRATION -->
