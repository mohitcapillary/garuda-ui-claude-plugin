---
name: hld-to-code
description: >
  Consume a single HLD markdown file and produce production-ready React + Redux-Saga
  code in garuda-ui. Extracts pixel-perfect layout from cached Figma design-context.jsx
  (widths, padding, gaps, typography, colour) so first-iteration output matches Figma
  ≥95%. Honors Reviewer Override column, reuses all four cached Figma artifacts,
  generates mock data at the API layer, runs a 3-tier design audit, enforces all
  GUIDELINES.md rules, and halts on any ambiguity. Persists per-feature checkpoints
  under claudeOutput/build/<feature>/ so a run can resume after interruption.
agent: hld-to-code-agent
user_invocable: true
---

# hld-to-code

Convert an HLD document into production-ready garuda-ui code.

## Usage

```
/hld-to-code <hld-path> [--resume] [--force] [--screen <name>] [--visual-audit] [--skip-preview-gate]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<hld-path>` | Yes | Path to the HLD Markdown file (absolute or workspace-relative) |
| `--resume` | No | Reuse existing `claudeOutput/build/<feature>/` checkpoints and skip completed phases |
| `--force` | No | Regenerate even if checkpoints exist (overrides `--resume`) |
| `--screen <name>` | No | Restrict generation to a single screen |
| `--visual-audit` | No | Enable Phase 7 Tier 3 (rendered pixel diff via `nvm use 12 && npm start` + Puppeteer). Off by default |
| `--skip-preview-gate` | No | Bypass Phase 2.5 layout-preview gate. Only for known-good layouts |

## Examples

```bash
# Fresh build from an HLD (Phase 2.5 preview gate will halt and ask before codegen)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md

# Resume an interrupted run (skips phases whose checkpoints already exist)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --resume

# Full build with rendered visual diff at end (requires working Node 12)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --visual-audit

# Generate only one screen
/hld-to-code claudeOutput/hld/hld-benefits-settings.md --screen BenefitsSettings
```

## What it does (11 phases, Phase 5 split into 3 sub-phases)

| Phase | What happens |
|-------|-------------|
| 0. Bootstrap | Creates `claudeOutput/build/<feature>/` state directory; loads prior checkpoints if resuming |
| 1. Parse HLD | Extracts screens, recipes, routes, Redux domains, APIs, open questions. Halts on any `status:open` question |
| 2. Resolve Recipes + Extract Design Tokens | Loads all 4 cache files per screen (`recipe.json` + `prop-spec-notes.json` + `metadata.xml` + `design-context.jsx`). Walks `design-context.jsx` to extract every width, padding, gap, font size, colour. Maps to Cap-UI tokens. Writes `layout-plan.json`. Route-vs-shell gate halts if the route won't provide the Cap shell sidebar. |
| **2.5. Preview Gate** | **Writes `preview-wireframe.txt` + `preview-skeleton.jsx` and halts — user confirms layout matches Figma before 24+ files get written.** |
| 3. APIs & Mocks | Splits confirmed vs ASSUMED endpoints. Prepares mock payloads. Halts on undefined field shapes |
| 4. File Plan | Dry-run file tree mirroring `app/components/pages/PromotionList/`. No code written yet |
| **5a. UI generation (DELEGATED)** | **Invokes `figma-to-component-agent` in orchestration mode to generate all JSX + styles.js files from `design-context.jsx` (1:1 tree walk → ~90% fidelity on first try). Returns a manifest with callback slots for Phase 5c to fill.** |
| 5b. Redux + infrastructure | hld-to-code authors constants / actions / reducer / selectors / saga / messages / Loadable / index — no JSX. Pre-emission validator on each file |
| 5c. Integration pass | hld-to-code edits figma-to-component's output: adds connect/compose/injectReducer/injectSaga, fills `/* HANDLER: … */` callback slots from HLD interactions, swaps string literals for `<FormattedMessage>`, appends PropTypes |
| 6. API Layer | Appends to `endpoints.js` + `api.js`; creates `<feature>.mock.js`; wires a `USE_MOCK_<FEATURE>` flag |
| 7. Design Audit (3-tier) | **Tier 1** token diff (raw hex/px flagged), **Tier 2** structural diff (every Figma node present in code, no swapped Cap* types), **Tier 3** (opt-in via `--visual-audit`) rendered diff via Puppeteer + LLM vision |
| 8. Guideline Pass | Validates against all 17 GUIDELINES.md rules. Auto-fixes deterministic violations. Runs `npm run lint` |
| 9. Report | Writes `build-report.md` + one-line console summary |

## Non-negotiable rules (enforced by the agent)

- **`design-context.jsx` is authoritative for layout/typography/colour.** Every CSS value traces back to a token extracted from it.
- **Full-cache reuse.** All four cache files are consumed; never a subset.
- **Reviewer Override column is final.** Populated values are never second-guessed.
- **EXACT recipe entries are authoritative.** They must appear verbatim in code with citation comments.
- **Figma over spec.** Any conflict halts and asks.
- **Mocks at the API layer.** Components and sagas never see mock data.
- **Halt on ambiguity.** `AskUserQuestion` is used, never guessed.
- **Preview gate before codegen.** Phase 2.5 confirms layout skeleton before 24+ files are written.
- **Pre-emission validator before every file write.** Invalid props / undefined tokens / missing enum values all halt.
- **Node 12 for dev server.** Any `npm start`/`npm run build` runs `nvm use 12` first.
- **Checkpoint after every component.**

## Outputs

| Artifact | Location |
|----------|----------|
| Generated component code | `app/components/{atoms\|molecules\|organisms\|templates\|pages}/...` |
| Endpoint registrations | `app/config/endpoints.js` (appended) |
| API service functions | `app/services/api.js` (appended) |
| Mock data layer | `app/services/<feature>.mock.js` (new) |
| State & checkpoint files | `claudeOutput/build/<feature>/` (13 files — see agent definition §13) |
| Layout plan | `claudeOutput/build/<feature>/layout-plan.json` |
| Preview artefacts | `claudeOutput/build/<feature>/preview-wireframe.txt` + `preview-skeleton.jsx` |
| 3-tier audit report | `claudeOutput/build/<feature>/screenshot-audit.md` |
| Visual diff (opt-in) | `claudeOutput/build/<feature>/visual-diff/` |
| Final report | `claudeOutput/build/<feature>/build-report.md` |

## Prerequisites

- `.claude/output/GUIDELINES.md` exists (run `/generate-guidelines` first if missing)
- `.claude/templates/hld-template.md` exists
- `tools/mapping-agent/src/registries/prop-spec.json` + `token-mappings.json` exist
- `app/services/api.js` and `app/config/endpoints.js` exist
- Input is a valid HLD produced by `hld-generator` (not a PRD, not an LLD)
- Cached Figma artefacts under `claudeOutput/figma-capui-mapping/<nodeId>/` (agent regenerates via `figma-node-mapper` if missing)

## Non-goals

- Does not consume LLD documents.
- Does not parse PRDs — use `hld-generator` first.
- Tier 3 visual diff is **opt-in** via `--visual-audit`; default run is token + structural diff only.
