# Claude UI Plugin

A plug-and-play Claude Code toolset for building production-ready React + Redux-Saga features from PRDs and Figma designs. Ships with agents, skills, slash commands, and a Figma-to-component mapping engine.

Built for **garuda-ui** (Capillary's loyalty management UI), but configurable for any target repo via `plugin-config.json`.

---

## Architecture: Sibling Repos

This plugin is designed to sit **alongside** your target app repo — not inside it. Both repos live in the same parent folder:

```
parent-folder/
  garuda-ui/                  ← your target app repo (React + Redux-Saga)
  garuda-ui-claude-plugin/    ← this plugin repo (agents, tools, build artifacts)
```

The agents auto-detect sibling repos at runtime using `plugin-config.json`. No install script needed.

**What lives where:**

| This plugin repo | Target app repo |
|-----------------|-----------------|
| `.claude/agents/`, `.claude/skills/`, `.claude/commands/` | `app/components/`, `app/services/`, `app/config/` |
| `tools/mapping-agent/` (Figma mapper CLI) | `node_modules/` (cap-ui-library, etc.) |
| `claudeOutput/` (HLDs, build checkpoints, Figma cache) | Generated feature code (written by `/hld-to-code`) |
| `plugin-config.json` (repo name config) | — |

---

## Setup

### 1. Clone both repos side by side

```bash
cd ~/projects    # or any parent folder
git clone <target-app-repo-url>
git clone <this-plugin-repo-url>
```

### 2. Configure the target repo name

Edit `plugin-config.json` in the plugin repo root:

```json
{
  "targetRepoName": "garuda-ui",
  "pluginRepoName": "garuda-ui-claude-plugin"
}
```

Change `targetRepoName` to match your target app folder name. Change `pluginRepoName` if you renamed this repo.

### 3. Open in Claude Code

Open the **plugin repo** in Claude Code, and add the target repo as an additional working directory:

```bash
cd garuda-ui-claude-plugin
claude --add-dir ../garuda-ui
```

Or in VS Code: open the plugin repo, then add the target repo folder to the workspace.

The agents resolve both paths automatically:
- **`PLUGIN_PATH`** → this repo (for `claudeOutput/`, `tools/`, agents)
- **`GARUDA_UI_PATH`** → the target app repo (for generated code)

### 4. One-time initialization

Run these three commands once to generate context files that all downstream agents depend on:

#### `/architect-scan` — Architecture Document

Scans the target repo and produces a structured architecture reference.

```
/architect-scan
```

| Output | Used by |
|--------|---------|
| `.claude/output/architecture.md` | `/generate-hld`, `/clarify-prd`, `/hld-to-code` |

#### `/generate-guidelines` — UI Development Guidelines

Scans the codebase and cap-ui-library to produce 16 guideline files.

```
/generate-guidelines
```

| Output | Used by |
|--------|---------|
| `.claude/output/GUIDELINES.md` + 16 guideline files | `/hld-to-code` Phase 8 |

#### `/map-product` — System Map (for existing features)

Maps product documentation to the codebase.

```
/map-product <documentation-url>
```

| Output | Used by |
|--------|---------|
| `.claude/output/<product-name>-system-map.md` | `/generate-hld`, `/hld-to-code` |

#### Verify Mapping Agent

The `tools/mapping-agent/` CLI ships pre-compiled in `dist/`. Verify it works:

```bash
node tools/mapping-agent/dist/cli.js --help
```

---

## What's Included

| Folder | Contents |
|--------|----------|
| `.claude/agents/` | 8 specialist agents (architect-scan, HLD generator, PRD clarifier, Figma-to-component, etc.) |
| `.claude/skills/` | 29 skills (prd-parser, hld-writer, prototype-analyser, code-mapping, figma-node-mapper, and speckit variants) |
| `.claude/commands/` | Slash commands wired to skills and agents |
| `.claude/templates/` | HLD and clarification doc templates |
| `.claude/output/` | Pre-generated output (architecture doc, UI guidelines, system map) |
| `tools/mapping-agent/` | TypeScript CLI for deterministic Figma → cap-ui-library component mapping |
| `tools/visual-qa/` | Playwright-based visual QA scripts (screenshot diff against Figma) |
| `claudeOutput/` | Pipeline output (HLDs, build artifacts, Figma mapping cache, clarifications) |

---

## PRD-to-Code Pipeline

The main workflow takes a raw PRD and produces production-ready code in 4 steps:

```
  Raw PRD (Confluence / file / URL)
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 1 — /clarify-prd                              │
  │                                                      │
  │  Reads PRD + fetches Figma links. Finds gaps:        │
  │  missing APIs, Figma-vs-PRD conflicts, unclear flows │
  │  Produces a PM-friendly question log.                │
  │                                                      │
  │  Output: claudeOutput/clarifications/                │
  │          <feature>-clarifications.md                 │
  └──────────────────────────────────────────────────────┘
     │
     │  PM / Designer / BE fill in the Answer: blocks
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 2 — /filter-prd                               │
  │                                                      │
  │  Reads resolved clarifications + original PRD.       │
  │  Absorbs every answer as a functional requirement.   │
  │                                                      │
  │  Output: claudeOutput/filteredPrd/                   │
  │          <feature>-spec.md                           │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 3 — /generate-hld                             │
  │                                                      │
  │  Parses spec. Traverses Figma prototypes. Scans      │
  │  codebase for reusable components. Builds API        │
  │  contracts. Writes a 15-section HLD document.        │
  │                                                      │
  │  Output: claudeOutput/hld/                           │
  │          hld-<feature>.md                            │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  STEP 4 — /hld-to-code                              │
  │                                                      │
  │  11 phases: bootstrap → parse HLD → load Figma →     │
  │  preview gate → APIs & mocks → file plan →           │
  │  JSX generation → Redux → integration →              │
  │  design audit → guidelines pass → report             │
  │                                                      │
  │  Output: app/components/... (in target repo)         │
  │          claudeOutput/build/<feature>/ (checkpoints) │
  └──────────────────────────────────────────────────────┘
     │
     ▼
  Production-ready React + Redux-Saga feature
```

### Example — End to End

```bash
# Step 1: Clarify the PRD
/clarify-prd https://confluence.example.com/display/PROD/Benefits+Settings

# Step 2: Filter into structured spec
/filter-prd claudeOutput/clarifications/benefits-settings-clarifications.md

# Step 3: Generate HLD
/generate-hld claudeOutput/filteredPrd/benefits-settings-spec.md

# Step 4: Generate code (writes to target app repo)
/hld-to-code claudeOutput/hld/hld-benefits-settings.md
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
| `/figma-node-mapper <url>` | Map a Figma node to Cap-UI components (mapping only) |
| `/code-mapping` | Generate a system mapping for an existing codebase feature |
| `/visual-qa` | Run visual QA loop comparing screenshots against Figma |

---

## Directory Structure

```
plugin-repo/                          target-app-repo/
├── plugin-config.json                ├── app/
├── .claude/                          │   ├── components/
│   ├── agents/                       │   │   ├── pages/
│   ├── commands/                     │   │   ├── organisms/
│   ├── skills/                       │   │   ├── molecules/
│   ├── templates/                    │   │   └── atoms/
│   └── output/                       │   ├── services/
│       ├── architecture.md           │   ├── config/
│       ├── GUIDELINES.md             │   └── utils/
│       └── guidelines/               ├── node_modules/
├── tools/                            └── package.json
│   ├── mapping-agent/
│   └── visual-qa/
└── claudeOutput/
    ├── hld/
    ├── build/
    ├── figma-capui-mapping/
    ├── clarifications/
    ├── rawPrd/
    └── filteredPrd/
```

---

## Environment Variables (for visual QA)

| Variable | Purpose |
|----------|---------|
| `FIGMA_ACCESS_TOKEN` | Figma API token for downloading reference screenshots |
| `GARUDA_USERNAME` | Login credentials for the dev server |
| `GARUDA_PASSWORD` | Login credentials for the dev server |

---

## Requirements

- [Claude Code](https://claude.ai/code) CLI or VS Code extension
- Node.js 18+ (for mapping agent rebuild, if needed)
- Node.js 16+ (for visual-qa tools)
