# garuda-ui Claude Plugin

A plug-and-play Claude Code toolset for **garuda-ui** — Capillary's loyalty management UI platform.

Installs a full suite of Claude agents, skills, slash commands, and the Figma → cap-ui-library mapping tool directly into your project, preserving all relative paths so everything works out of the box.

---

## What's Included

| Folder | Contents |
|--------|----------|
| `.claude/agents/` | 8 specialist agents (architect-scan, HLD generator, PRD clarifier, Figma-to-component, etc.) |
| `.claude/skills/` | 29 skills (prd-parser, hld-writer, prototype-analyser, code-mapping, figma-node-mapper, and speckit variants) |
| `.claude/commands/` | Slash commands wired to skills and agents |
| `.claude/templates/` | HLD and clarification doc templates |
| `.claude/output/` | Pre-generated output shipped with the plugin (architecture doc, UI guidelines, system map) |
| `tools/mapping-agent/` | TypeScript CLI for deterministic Figma → cap-ui-library component mapping |
| `claudeOutput/` | Example pipeline output for every agent step (HLDs, build artifacts, Figma mapping cache, etc.) |

---

## Installation

### Option 1 — One-liner (run from your project root)

```bash
curl -sSL https://raw.githubusercontent.com/<owner>/garuda-ui-claude-plugin/main/install.sh | bash
```

### Option 2 — Clone then run

```bash
git clone https://github.com/<owner>/garuda-ui-claude-plugin
cd garuda-ui-claude-plugin
./install.sh /path/to/your/garuda-ui
```

The install script:
- Copies `.claude/`, `tools/`, and `claudeOutput/` into your project root
- Uses no-clobber mode — existing files are never overwritten
- Writes a `.garuda-plugin-version` marker with the installed commit SHA

---

## Setup — One-Time Initialization

After installing, run these three commands **once** to generate the static context files that all downstream agents depend on. The plugin ships with pre-generated versions for garuda-ui, but you should regenerate them to match your current codebase.

### 1. `/architect-scan` — Architecture Document

Scans the entire repo and produces a structured architecture reference document.

```
/architect-scan
```

| What it does | Output |
|---|---|
| Discovers feature modules and their Redux artifacts | `.claude/output/architecture.md` |
| Maps the Atomic Design component hierarchy (atoms → pages) | |
| Traces the Redux + Redux-Saga data flow pattern | |
| Catalogs shared layers (services, utils, config) | |
| Documents conventions, constraints, and architectural risks | |

**Used by:** `/generate-hld`, `/clarify-prd`, `/hld-to-code` — all read `architecture.md` to align new features with existing patterns.

### 2. `/generate-guidelines` — UI Development Guidelines

Scans the codebase and cap-ui-library to produce 16 guideline files covering styling, state management, component patterns, and more.

```
/generate-guidelines
```

| What it does | Output |
|---|---|
| Auto-discovers package.json, file counts, project structure | `.claude/output/GUIDELINES.md` (master index) |
| Discovers Cap-UI tokens, components, HOCs from cap-ui-library | `.claude/output/guidelines/01-css-styling.md` |
| Runs 35 Grep/Glob patterns across 16 categories | `.claude/output/guidelines/02-state-management.md` |
| Generates 16 guideline files + master index | `...` (16 files total) |

**Used by:** `/hld-to-code` Phase 8 — validates all generated code against the 17 rules in `GUIDELINES.md`.

### 3. `/map-product` — System Map (for existing features)

Analyzes product documentation and maps it to the codebase, producing a structured system mapping that shows how an existing feature flows through components, Redux, sagas, and APIs.

```
/map-product <documentation-url>
```

| What it does | Output |
|---|---|
| Fetches and analyzes the product documentation | `.claude/output/<product-name>-system-map.md` |
| Maps documentation to React components, Redux store, Sagas, APIs | |
| Traces complete end-to-end data flows per feature | |

**Used by:** `/generate-hld` and `/hld-to-code` — they read the system map to follow existing Redux/saga patterns. The plugin ships with `loyalty-promotions-system-map.md` as the reference example.

### 4. Mapping Agent (cap-ui-library map) — Verify

The `tools/mapping-agent/` is a pre-built TypeScript CLI that maps Figma components to cap-ui-library components. It ships with `dist/` pre-compiled — no build step needed.

```bash
# Verify it works
node tools/mapping-agent/dist/cli.js --help
```

**Used by:** `/figma-node-mapper` and `/hld-to-code` Phase 2 — they invoke the mapping agent to map Figma nodes to cap-ui-library components before generating code.

---

## PRD-to-Code Pipeline

Once initialization is done, this is the main workflow. It takes a raw PRD and produces production-ready React + Redux-Saga code in 4 steps:

```
                          THE PIPELINE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Raw PRD (Confluence / file / URL)
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 1 — /clarify-prd                              │
  │                                                      │
  │  Reads the PRD + fetches all Figma links.            │
  │  Finds gaps: missing APIs, Figma-vs-PRD conflicts,   │
  │  unclear flows, missing validation rules.            │
  │  Produces a PM-friendly question log.                │
  │                                                      │
  │  Example:                                            │
  │  PRD says "show benefit list"                        │
  │  Figma shows search + sort + column picker           │
  │  → Q1 [Design] "Figma shows 3 controls not in PRD.  │
  │    Include them?"                                    │
  │                                                      │
  │  Output: claudeOutput/clarifications/                │
  │          <feature>-clarifications.md                 │
  └──────────────────────────────────────────────────────┘
     │
     │  PM / Designer / BE fill in the Answer: blocks
     │  and set status: resolved
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 2 — /filter-prd                               │
  │                                                      │
  │  Reads the resolved clarifications + original PRD.   │
  │  Re-organizes into structured speckit sections.      │
  │  Absorbs every resolved answer as an authoritative   │
  │  functional requirement.                             │
  │                                                      │
  │  Example:                                            │
  │  Q1 Answer: "Yes, include search + sort"             │
  │  → FR-04 [RESOLVED by Designer — Q1]:                │
  │    "Benefit list shall include search, sort, and     │
  │     column picker controls as shown in Figma"        │
  │                                                      │
  │  Output: claudeOutput/filteredPrd/                   │
  │          <feature>-spec.md                           │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 3 — /generate-hld                             │
  │                                                      │
  │  Parses the filtered spec. Traverses Figma           │
  │  prototypes to extract screen structure. Scans the   │
  │  codebase for reusable components. Builds API        │
  │  contracts (marks [ASSUMED] if not confirmed).       │
  │  Writes a 15-section HLD document.                   │
  │                                                      │
  │  15 sections include:                                │
  │  Feature Overview | Impact Analysis | Directory Tree │
  │  API Structure | Redux State Shape | Validation      │
  │  UI/UX (ASCII diagrams) | Testing Strategy | ...     │
  │                                                      │
  │  Output: claudeOutput/hld/                           │
  │          hld-<feature>.md                            │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 4 — /hld-to-code                              │
  │                                                      │
  │  11 phases that convert the HLD into working code:   │
  │                                                      │
  │  Ph 0  Bootstrap checkpoint dir                      │
  │  Ph 1  Parse HLD (halts on open questions)           │
  │  Ph 2  Load Figma cache, extract every px/color      │
  │  Ph 2.5 PREVIEW GATE — shows wireframe, waits       │
  │         for user approval before writing files       │
  │  Ph 3  APIs & Mocks — confirmed vs [ASSUMED]         │
  │  Ph 4  File Plan — dry-run tree, no code yet         │
  │  Ph 5a JSX generation (pixel-perfect from Figma)     │
  │  Ph 5b Redux (constants/actions/reducer/saga)        │
  │  Ph 5c Integration (connect/compose/i18n)            │
  │  Ph 6  API Layer (endpoints.js + mock data)          │
  │  Ph 7  Design Audit (token + structural diff)        │
  │  Ph 8  Guidelines Pass (17 rules + lint)             │
  │  Ph 9  Report (build-report.md)                      │
  │                                                      │
  │  Output: app/components/{pages,organisms,...}/        │
  │          app/config/endpoints.js (appended)           │
  │          app/services/<feature>.mock.js               │
  │          claudeOutput/build/<feature>/                │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  Production-ready React + Redux-Saga feature
```

### Example — End to End

```bash
# Step 1: Clarify the PRD (finds gaps, produces questions for PM)
/clarify-prd https://confluence.capillary.com/display/PROD/Benefits+Settings

# → Output: claudeOutput/clarifications/benefits-settings-clarifications.md
# → Share with PM/Designer/BE — they fill Answer: blocks → set status: resolved

# Step 2: Filter into structured spec (absorbs answers as requirements)
/filter-prd claudeOutput/clarifications/benefits-settings-clarifications.md

# → Output: claudeOutput/filteredPrd/benefits-settings-spec.md

# Step 3: Generate HLD (15-section technical design document)
/generate-hld claudeOutput/filteredPrd/benefits-settings-spec.md

# → Output: claudeOutput/hld/hld-benefits-settings.md

# Step 4: Generate code (11-phase build with preview gate)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md

# → Output: ~24 production files in app/components/, app/config/, app/services/
```

---

## All Available Commands

| Command | Purpose |
|---------|---------|
| **Setup (run once)** | |
| `/architect-scan` | Generate architecture reference doc |
| `/generate-guidelines` | Generate 16 UI development guideline files |
| `/map-product <url>` | Generate system map for an existing feature |
| **Pipeline (per feature)** | |
| `/clarify-prd <prd>` | Analyse PRD against Figma, produce question log |
| `/filter-prd <clarifications>` | Enhance PRD into structured spec |
| `/generate-hld <spec>` | Generate 15-section HLD from spec |
| `/hld-to-code <hld>` | Convert HLD into production React + Redux-Saga code |
| **Utilities** | |
| `/figma-to-component <url>` | Convert a single Figma node into a Cap-UI component |
| `/figma-node-mapper <url>` | Map a Figma node to Cap-UI components (no code, just mapping) |
| `/code-mapping` | Generate a system mapping for an existing codebase feature |

---

## Directory Structure After Install

```
your-project/
├── .claude/
│   ├── agents/          ← 8 specialist agents
│   ├── commands/        ← slash commands wired to agents/skills
│   ├── skills/          ← 29 skills (prd-parser, hld-writer, etc.)
│   ├── templates/       ← HLD and clarification doc templates
│   ├── output/          ← pre-generated: architecture.md, GUIDELINES.md, system-map
│   └── settings.json
├── tools/
│   └── mapping-agent/
│       ├── src/
│       ├── dist/        ← pre-compiled, ready to use
│       └── package.json
├── claudeOutput/        ← agents write here; example output ships with plugin
│   ├── hld/             ← HLD documents
│   ├── build/           ← per-feature build checkpoints + reports
│   ├── figma-capui-mapping/  ← cached Figma metadata + recipes
│   ├── clarifications/  ← PRD clarification question logs
│   ├── rawPrd/          ← persisted raw PRDs
│   └── filteredPrd/     ← structured specs ready for HLD
└── .garuda-plugin-version
```

---

## Uninstall

```bash
./uninstall.sh [TARGET_DIR]
```

This removes `.claude/`, `tools/`, `claudeOutput/`, and `.garuda-plugin-version` from the target project (with a confirmation prompt).

---

## Requirements

- [Claude Code](https://claude.ai/code) CLI or VS Code extension
- `git` (required for the curl one-liner install mode)
- Node.js 18+ (required if you modify and rebuild the mapping agent)
