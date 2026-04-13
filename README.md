# garuda-ui Claude Plugin

A plug-and-play Claude Code toolset for **garuda-ui** — Capillary's loyalty management UI platform.

Installs a full suite of Claude agents, skills, slash commands, and the Figma → blaze-ui mapping tool directly into your project, preserving all relative paths so everything works out of the box.

---

## What's Included

| Folder | Contents |
|--------|----------|
| `.claude/agents/` | 8 specialist agents (architect-scan, HLD generator, PRD clarifier, Figma-to-component, etc.) |
| `.claude/skills/` | 29 skills (prd-parser, hld-writer, prototype-analyser, code-mapping, figma-node-mapper, and speckit variants) |
| `.claude/commands/` | Slash commands wired to skills and agents |
| `.claude/templates/` | HLD and clarification doc templates |
| `.claude/output/` | Example generated output (architecture doc, UI guidelines) |
| `tools/mapping-agent/` | TypeScript CLI (`blazemap`) for deterministic Figma → blaze-ui component mapping |
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

## After Installation

Open your project in VS Code with the Claude Code extension, then use any of these slash commands:

| Command | What it does |
|---------|--------------|
| `/architect-scan` | Scans the repo and generates `.claude/output/architecture.md` |
| `/generate-guidelines` | Generates 16+ UI development guidelines in `.claude/output/guidelines/` |
| `/clarify-prd` | Analyses a raw PRD against Figma designs and produces a clarification question log |
| `/filter-prd` | Enhances a raw PRD into a structured speckit-format spec |
| `/generate-hld` | Generates a full High-Level Design document from a PRD |
| `/hld-to-code` | Converts an HLD into production-ready React + Redux-Saga code |
| `/figma-to-component` | Converts a Figma node into a Cap-UI / blaze-ui React component |
| `/map-product` | Generates a structured system mapping for a product feature |

---

## Mapping Agent (`blazemap`)

The `tools/mapping-agent/` is a pre-built TypeScript CLI that maps Figma components to blaze-ui components.

```bash
# Verify it works (no build step needed — dist/ is pre-compiled)
node tools/mapping-agent/dist/cli.js --help
```

---

## Directory Structure After Install

```
your-project/
├── .claude/
│   ├── agents/
│   ├── commands/
│   ├── skills/
│   ├── templates/
│   ├── output/
│   └── settings.json
├── tools/
│   └── mapping-agent/
│       ├── src/
│       ├── dist/        ← pre-compiled, ready to use
│       └── package.json
├── claudeOutput/        ← agents write here; example output ships with plugin
│   ├── hld/
│   ├── build/
│   ├── figma-capui-mapping/
│   ├── clarifications/
│   ├── rawPrd/
│   └── filteredPrd/
└── .garuda-plugin-version
```

All relative paths used inside agents and skills resolve correctly because the folder structure is identical to the original garuda-ui project.

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
