# garuda-ui-plugin — Claude Code Conventions

## 1. Plugin Identity

- **Plugin name:** garuda-ui-plugin
- **Target app:** garuda-ui (Capillary Loyalty Frontend)
- **Stack:** React 18, Redux + Redux-Saga, ImmutableJS, Ant Design via `@capillarytech/cap-ui-library`
- **URL prefix:** `/loyalty/ui/v3`
- **Dev port:** 8000 (overridable in `skills/config.md`)

The plugin operates on a **target garuda-ui project**. It is not itself the application. Application code is written to the target repo; plugin runtime artifacts (HLDs, LLDs, Figma cache, build checkpoints) live under `claudeOutput/` in whichever repo the agent resolves as the plugin root.

## 2. Base / Enhancement Model

The plugin is built as **spine-and-grafts**:

- **Spine:** garuda-ui-claude-plugin is preserved verbatim. All nine of its agents, ten commands, and skills are inherited unchanged.
- **Grafts:** capability additions from cap-garuda-plugin (reference knowledge + post-dev agents) plus a few genuinely new commands (`/create-pr`, `/run-pipeline`, `/publish-confluence`).

Enhancements to inherited assets are **non-destructive**: new flags, new sub-skills, or optional "if input exists" branches. No inherited file is rewritten.

## 3. Pipeline Model — Modular

No single orchestrator command. Each stage is its own slash command. The user composes stages.

| # | Stage | Command | Artifact under `claudeOutput/` |
|---|-------|---------|--------------------------------|
| 1 | Clarify PRD | `/clarify-prd <prd>` | `clarifications/<feature>.md` |
| 2 | Filter PRD | `/filter-prd <clarifications>` | `filteredPrd/<feature>-spec.md` |
| 3 | Generate HLD | `/generate-hld <spec>` | `hld/<feature>.md` |
| 4 | Generate LLD | `/generate-lld <hld>` | `lld/<feature>.md` |
| 5 | Generate Test Cases | `/generate-testcases <lld>` | `testcases/<feature>.md` + `.json` |
| 6 | HLD → Code | `/hld-to-code <hld>` | `build/<feature>/` |
| 7 | Build Verify | `/build-verify <feature>` | `build/<feature>/build-report.md` |
| 8 | Write Tests | `/write-tests <feature>` | `tests/<feature>/` |
| 9 | Test Eval | `/test-eval <feature>` | `tests/<feature>/test-report.json` |
| 10 | Visual QA | `/visual-qa <feature> [--auto-fix]` | `visual-qa/<feature>/` |
| 11 | Create PR | `/create-pr <feature>` | `prs/<feature>/pr.md` + PR URL |

End-to-end wrapper: `/run-pipeline <prd>` chains stages 1–11. Halts on any gate failure; resume by running the failed stage directly with its arg.

## 4. What's NOT in This Plugin

- No `/gix` monolithic orchestrator (dropped from cap-garuda-plugin inheritance)
- No `session_memory.md`, `approach_log.md`, `requirements_context.md`, `session_journal.md` (artifacts are the audit trail)
- No `pipeline_state.json` workspace file (artifacts themselves carry state)
- No `live-dashboard.html`
- No automatic Confluence publishing — use `/publish-confluence <artifact>` explicitly
- No per-phase Mermaid diagrams (kept only in LLD)
- No cross-repo tracer in v1 (revisit v1.1 as opt-in flag)
- No `tutor` or `debug` skills (out of scope for the build pipeline)

## 5. Reference Knowledge Layout

| Location | Purpose |
|----------|---------|
| `.claude/skills/cap-ui-library/` | 132 component specs. Lookup via `_index.md`; agents read only the specs they need. |
| `.claude/skills/coding-dna/` | 6 pillars (architecture, components, quality, state-and-api, styling, testing). Advisory reference. |
| `.claude/skills/shared-rules.md` | Authoritative conventions: organism anatomy, ImmutableJS patterns, saga error handling, Cap* import order, test-utils. |
| `.claude/skills/fe-guardrails/` | FG-01 through FG-12 inline guardrails evaluated during codegen Phase 8. |
| `.claude/skills/config.md` | All configurable values (coverage threshold 85%, architect drift threshold 20, etc.). |
| `.claude/output/GUIDELINES.md` + `.claude/output/guidelines/01-17*.md` | Inherited from garuda-ui. 17 hard rules enforced in codegen Phase 8. |

**Conflict resolution (v1):** when `GUIDELINES.md` and `coding-dna/` disagree, `GUIDELINES.md` wins. The agent must surface the contradiction in the HLD/LLD "Architecture Notes" section. Auto-reconciliation deferred to v1.1.

## 6. Target Repo Resolution (inherited from garuda-ui)

All generated application code goes to the **target garuda-ui repo**, NOT to this plugin repo. The plugin repo only stores `claudeOutput/` artifacts and plugin assets.

Agents resolve two paths at their bootstrap phase:
- `GARUDA_UI_PATH` — where `app/components/`, `app/services/`, `app/config/` live; all writes here
- `PLUGIN_PATH` — where `claudeOutput/` lives; all checkpoints and state here

Resolution priority (per `agents/hld-to-code-agent.md` Rule 14):
1. Current repo contains `app/components/` + `app/services/` + `package.json` → it IS garuda-ui; `PLUGIN_PATH` = sibling or parent `garuda-ui-plugin/` or fallback inside garuda-ui.
2. Current repo contains `.claude/agents/hld-to-code-agent.md` → it IS the plugin; `GARUDA_UI_PATH` = sibling or parent `garuda-ui/`.
3. Neither matches → halt and ask the user for both paths.

Both resolved paths are persisted in `<PLUGIN_PATH>/claudeOutput/build/<feature>/repo-paths.json`.

## 7. Organism 10-File Anatomy

See `.claude/skills/shared-rules.md` Section 1 for the complete anatomy (file ordering, compose chain, action types, ImmutableJS, saga error handling, Cap* imports, test imports).

Atoms and Molecules never own Redux. Organisms each own their slice. Pages are route-level and keep Redux minimal. Templates never own Redux.

## 8. Guardrails

- **Exit Checklists** — every agent verifies its own output conditions before emitting. Failures surface as `guardrail_warnings[]` in the JSON output.
- **Gate Checks** — commands that wrap multiple agents run a validation step between calls. Failures halt and report to the user.
- **Schema Validation** — new post-dev agents (`lld-generator`, `testcase-generator`, `build-verifier`, `test-writer`, `test-evaluator`, `guardrail-checker`, `productex-verifier`, `pr-writer`) validate output against schemas in `.claude/schemas/`. Hard halt on schema failure (decision D.7 from plan).

## 9. Resume After Interruption

- `/hld-to-code` writes `build-log.jsonl` per-file. `--resume` picks up at the first unwritten file (not the first unfinished phase).
- Each artifact is a separate file. Re-running a stage with an existing artifact reuses it unless `--force` is passed.
- No separate state file. Artifacts are the state.

## 10. Plugin Version and Install

- Version marker: `.garuda-plugin-version` at repo root
- Current plugin version: `1.0.0-alpha`
- Install: `./install.sh [TARGET_DIR]` — copies `.claude/`, `tools/`, `claudeOutput/` into the target project; installs `tools/visual-qa/` npm deps on Node 16+.
- Uninstall: `./uninstall.sh [TARGET_DIR]`
