---
description: Convert an HLD into production-ready target app code — extracts pixel-perfect layout from cached design-context.jsx, runs a 2.5-phase preview gate before codegen, validates every prop/token before emission, and runs a 3-tier design audit. Honors Reviewer Override and halts on any ambiguity
argument-hint: "<hld-path> [--resume] [--force] [--screen <name>] [--visual-audit] [--skip-preview-gate]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Agent, Skill, AskUserQuestion, mcp__claude_ai_Figma__get_design_context, mcp__claude_ai_Figma__get_screenshot, mcp__claude_ai_Figma__get_metadata
---

Use the **hld-to-code** skill to convert an HLD document into production-ready target app code.

## Instructions

1. Read and follow the full agent definition at `.claude/agents/hld-to-code-agent.md`.
2. If no `<hld-path>` argument is provided, ask the user for the HLD file path before proceeding.
3. Validate the file exists, is readable, and looks like an HLD (contains `## 1. Feature Overview` and `### Feature Name`).
4. Execute all 11 phases (0, 1, 2, 2.5, 3, 4, 5, 6, 7, 8, 9) in order. Halt and use `AskUserQuestion` whenever the agent definition says to.

## Examples

```bash
# Fresh build (Phase 2.5 layout-preview gate will halt for user confirmation before codegen)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md

# Resume a prior run (reuses checkpoints under claudeOutput/build/<feature>/)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --resume

# Human-in-the-Loop visual QA loop (up to 5 iterations, user approves each fix batch)
# Requires: npm install in tools/visual-qa/ + env vars FIGMA_ACCESS_TOKEN, GARUDA_USERNAME, GARUDA_PASSWORD
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --visual-audit

# Re-run just the visual QA loop on an existing build (skips all codegen phases)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --resume --visual-audit

# Build only one screen
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --screen BenefitsSettings

# Resume known-good layout without the preview gate
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --resume --skip-preview-gate
```

## What it does (11 phases)

| Phase | What happens |
|-------|-------------|
| 0. Bootstrap | Creates per-feature state directory; loads prior checkpoints |
| 1. Parse HLD | Extracts screens, recipes, APIs, open questions. Halts on any `status:open` question |
| 2. Resolve + Extract Tokens | Consumes all 4 cache files. Walks `design-context.jsx` → `layout-plan.json` (widths, padding, gaps, typography, colour). Route-vs-shell gate |
| **2.5. Preview Gate** | **Writes `preview-wireframe.txt` + `preview-skeleton.jsx`; halts for user to confirm layout matches Figma** |
| 3. API Contract | Splits confirmed vs ASSUMED; prepares mock payloads; halts on undefined shapes |
| 4. File Plan | Dry-run file tree |
| **5a. UI gen (DELEGATED)** | **Invokes `figma-to-component` skill in orchestration mode for all JSX + styles.js. Returns `ui-generation-manifest.json`. hld-to-code does NOT write UI code.** |
| 5b. Redux + infra | constants / actions / reducer / selectors / saga / messages / Loadable / index — NO JSX. Pre-emission validator per file |
| 5c. Integration | Edits figma-to-component's output: adds Redux wiring, fills `/* HANDLER: … */` callback slots, i18n, PropTypes |
| 6. API Layer | Appends endpoints + service functions; writes `<feature>.mock.js`; wires swap flag |
| 7. 3-Tier Audit | Tier 1 token diff, Tier 2 structural diff (both mandatory); Tier 3 Human-in-the-Loop visual QA loop (screenshot → pixel diff → vision classify → user approval → fix, up to 5 iterations) when `--visual-audit` |
| 8. Guideline Pass | Validates against all 17 GUIDELINES.md rules; runs `npm run lint` |
| 9. Report | Writes `build-report.md` + one-line summary |

## Outputs

| Artifact | Location |
|----------|----------|
| Generated code | `app/components/{atoms\|molecules\|organisms\|templates\|pages}/` |
| Endpoint registrations | `app/config/endpoints.js` |
| API service functions | `app/services/api.js` |
| Mock data layer | `app/services/<feature>.mock.js` |
| State & checkpoints | `claudeOutput/build/<feature>/` (13 files including `layout-plan.json`, `preview-*`) |
| 3-tier audit report | `claudeOutput/build/<feature>/screenshot-audit.md` |
| Visual diff PNGs (opt-in) | `claudeOutput/build/<feature>/visual-diff/` |
| Visual QA log (opt-in) | `claudeOutput/build/<feature>/visual-qa-log.jsonl` |
| Visual QA report (opt-in) | `claudeOutput/build/<feature>/visual-qa-report.md` |

## Prerequisites

- `.claude/output/GUIDELINES.md` must exist
- `.claude/templates/hld-template.md` must exist
- `tools/mapping-agent/src/registries/prop-spec.json` + `token-mappings.json` must exist
- `app/services/api.js` and `app/config/endpoints.js` must exist
- Input must be a real HLD (not an LLD or PRD)
- For `--visual-audit`: `npm install` run inside `tools/visual-qa/` (Node 16+); env vars `FIGMA_ACCESS_TOKEN`, `GARUDA_USERNAME`, `GARUDA_PASSWORD` set. Dev server still requires Node 12 via nvm.

## Layout overrides (always applied)

- **Page-content width:** Ignore any `max-width` Figma sets on the outermost page/template-level content wrapper. Emit `width: 100%` instead. This applies only to the page/template container, not to nested cards, tables, or sub-sections.
- **Default page padding:** If Figma does not specify padding on the page-content wrapper, apply the platform default page padding on **left, right, and top**. If Figma specifies padding, honor it.
- Record the override in `layout-plan.json` under `overrides[]` so Phase 7 Tier 1/2 audits do not flag it as a token diff.

## When NOT to use

- If you only have a **PRD**: run `/generate-hld` first, then use this command.
