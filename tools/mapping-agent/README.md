# @capillarytech/figma-blazeui-mapping-agent

A deterministic + AI-assisted mapping layer between Figma MCP tool output and blaze-ui (cap-ui-library) React components.

---

## What It Does

Converts a Figma design node into a structured **recipe JSON** that tells an LLM exactly which `Cap*` component to render for every layer — including props, slots, CSS tokens, and layout direction. The LLM then uses the recipe to generate JSX without guessing.

Without this tool, the LLM re-reasons from scratch on every conversation, re-infers the same components, and pays full API cost each time. This tool makes those decisions **permanent, free, and instant** on repeat runs.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INPUT (from Figma MCP)                       │
│                                                                     │
│   get_metadata XML          get_screenshot PNG                      │
│   (node tree structure)     (full page visual)                      │
└───────────────┬─────────────────────────┬───────────────────────────┘
                │                         │
                ▼                         │
┌──────────────────────────┐              │
│   Stage 1: XML Parser    │              │
│   metadata-parser.ts     │              │
│                          │              │
│  • XML → FigmaNode tree  │              │
│  • Infers layoutMode     │              │
│    from child positions  │              │
│    (HORIZONTAL/VERTICAL) │              │
│  • Extracts bounding box │              │
│    for every node        │              │
└──────────────┬───────────┘              │
               │                          │
               ▼                          │
┌──────────────────────────────────────────────────────────────────┐
│                    Stage 2: Resolver (resolver.ts)               │
│                                                                  │
│  For every node, tries 4 sub-resolvers in order:                │
│                                                                  │
│  ┌─────────────────────┐   MATCH   ┌──────────────────────────┐ │
│  │ 1. Registry Lookup  │──────────▶│  EXACT / PARTIAL result  │ │
│  │  (name glob match   │           │  source: "registry"      │ │
│  │   + variant props)  │           └──────────────────────────┘ │
│  └──────────┬──────────┘                                        │
│             │ NO MATCH                                           │
│             ▼                                                    │
│  ┌─────────────────────┐   MATCH   ┌──────────────────────────┐ │
│  │ 2. Layout Inference │──────────▶│  EXACT result            │ │
│  │  layoutMode=HORIZ   │           │  source: "layout-inferred"│ │
│  │  → CapRow           │           └──────────────────────────┘ │
│  │  layoutMode=VERT    │                                        │
│  │  → CapColumn        │                                        │
│  └──────────┬──────────┘                                        │
│             │ NO MATCH                                           │
│             ▼                                                    │
│  ┌─────────────────────┐           ┌──────────────────────────┐ │
│  │ 3. Typography       │  (TEXT)   │  EXACT result            │ │
│  │  fontSize+weight    │──────────▶│  source: "typography"    │ │
│  │  → CapLabel type    │           │  type="label7" etc.      │ │
│  │  (33 label types)   │           └──────────────────────────┘ │
│  └──────────┬──────────┘                                        │
│             │ non-TEXT                                           │
│             ▼                                                    │
│  ┌─────────────────────┐           ┌──────────────────────────┐ │
│  │ 4. Color Token Map  │           │  cssVariables populated  │ │
│  │  hex → $cap-var     │──────────▶│  (nearest RGB match)     │ │
│  │  (nearest match)    │           └──────────────────────────┘ │
│  └──────────┬──────────┘                                        │
│             │ still unresolved                                   │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  UNMAPPED + fallback│  → goes to Stage 3 (vision)           │
│  │  source: "unresolved│                                        │
│  │  fingerprint: abc123│  (structural hash, dedup within run)  │
│  └─────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼ (UNMAPPED nodes only, when --screenshot provided)
┌──────────────────────────────────────────────────────────────────┐
│              Stage 3: Vision Resolver (vision-resolver.ts)       │
│                                                                  │
│  For each UNMAPPED node:                                         │
│                                                                  │
│  1. Compute fingerprint(node)                                    │
│        │                                                         │
│        ▼                                                         │
│  2. Same fingerprint seen earlier THIS run?                      │
│     ──YES──▶ reuse result (saves duplicate API calls             │
│              when 3 nodes on same screen look identical)         │
│        │                                                         │
│        │ NO (first time seeing this structure)                   │
│        ▼                                                         │
│  3. crop(screenshot, node.absoluteBoundingBox)                   │
│     → exact pixel-perfect PNG of just that node                 │
│        │                                                         │
│        ▼                                                         │
│  4. Claude API (vision) ◀── cropped PNG + node context          │
│     "Which Cap* component is this?"                              │
│        │                                                         │
│        ▼                                                         │
│  5. Validate response against registry                           │
│        │                                                         │
│        ├──VALID──▶ node becomes EXACT                            │
│        │           source: "vision-inferred"                     │
│        │           stored in run-scoped Map (RAM only)           │
│        │                                                         │
│        └──INVALID▶ stays UNMAPPED (LLM fallback chain)          │
│                                                                  │
│  NOTE: This Map is destroyed when the CLI exits.                 │
│  TRUE persistence across runs comes from Stage 4 (--learn).     │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼ (when --learn flag provided)
┌──────────────────────────────────────────────────────────────────┐
│              Stage 4: Registry Writer (registry-writer.ts)       │
│                                                                  │
│  Writes vision-inferred decisions to disk (component-mappings.json)│
│  THIS is the only real persistence across CLI runs.              │
│                                                                  │
│  • New pattern  → new entry added (source: "llm-inferred")       │
│  • Same pattern → usageCount incremented                         │
│                                                                  │
│  Next run: same node hits Stage 2 registry lookup instead        │
│  of Stage 3 vision → no API call, instant, free.                │
│                                                                  │
│  After 10 screens → 90%+ registry hit rate for your Figma file.  │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OUTPUT: recipe.json                          │
│                                                                 │
│  Every node has:                                                │
│  • targetComponent: "CapDatePicker"                             │
│  • importPath: "blaze-ui/components/CapDatePicker"              │
│  • props: { disabled: false, size: "default" }                  │
│  • slots: { placeholder: "Select date" }                        │
│  • cssVariables: { background: "$cap-primary-base" }            │
│  • source: "registry" | "layout-inferred" | "vision-inferred"   │
│  • mappingStatus: "EXACT" | "PARTIAL" | "UNMAPPED"              │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM reads recipe → JSX                       │
│                                                                 │
│  • EXACT nodes   → render targetComponent directly              │
│  • PARTIAL nodes → render with warnings as TODO comments        │
│  • UNMAPPED nodes → LLM applies composition fallback chain      │
│                                                                 │
│  Zero raw HTML. Every node becomes a Cap* component.            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Better Than Raw LLM

| | Raw LLM (Claude directly) | This Tool |
|---|---|---|
| Sees full screenshot | Yes — one big image | Yes — **cropped per node** (more precise) |
| Unnamed frames (`Frame 2087332`) | Guesses from context | Crops exact region → vision API |
| Consistency | Re-reasons every conversation | Deterministic after first run |
| API cost | Every node, every conversation | Once per node (with `--learn`), free on all future runs |
| Typography → CapLabel type | Best guess | Exact (33-type matrix) |
| Color → CSS token | Best guess | Nearest RGB match in token registry |
| Layout detection | Visual inference | Structural (child position geometry) |
| Learns over time | No | Yes — `--learn` writes to disk; next run needs no API calls |

---

## Installation

```bash
npm install
npm run build
```

Optional (required for visual resolution):
```bash
npm install sharp          # image cropping
npm install @anthropic-ai/sdk  # Claude vision API
```

Set your API key:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Usage

### Basic (registry only)

```bash
cat /tmp/figma-metadata.xml | node dist/cli.js resolve-metadata \
  --registry src/registries \
  --output .claude/output/figma-blazeui-mapping
```

### With visual resolution (UNMAPPED nodes sent to Claude vision)

```bash
cat /tmp/figma-metadata.xml | node dist/cli.js resolve-metadata \
  --registry src/registries \
  --output .claude/output/figma-blazeui-mapping \
  --screenshot /tmp/figma-screenshot.png
```

### With visual resolution + learn-back (grows registry automatically)

```bash
cat /tmp/figma-metadata.xml | node dist/cli.js resolve-metadata \
  --registry src/registries \
  --output .claude/output/figma-blazeui-mapping \
  --screenshot /tmp/figma-screenshot.png \
  --learn
```

After `--learn`, new entries appear in `component-mappings.json` tagged `source: "llm-inferred"`. On the next run of the same Figma patterns, they resolve instantly from the registry — no API call needed.

### Other commands

```bash
# List all mapped components
node dist/cli.js list-components --registry src/registries

# Validate registry JSON integrity
node dist/cli.js validate-registry --registry src/registries

# Resolve from FigmaNode JSON directly
echo '{"id":"1:1","name":"Button","type":"INSTANCE",...}' | \
  node dist/cli.js resolve-json --registry src/registries
```

---

## How It Works: The 4 Resolution Stages

### Stage 1 — XML Parser
Converts `get_metadata` XML into a typed `FigmaNode` tree. Infers `layoutMode` (HORIZONTAL/VERTICAL) from child `x`/`y` positions since `get_metadata` doesn't return auto-layout info directly.

### Stage 2 — Resolver (4 sub-resolvers in order)

1. **Registry lookup** — glob pattern match on node name + variant properties against `component-mappings.json`. Most common components (Button, Input, Table, Modal, etc.) resolve here.

2. **Layout inference** — any FRAME with `layoutMode: HORIZONTAL` → `CapRow`, `layoutMode: VERTICAL` → `CapColumn`. No registry entry needed.

3. **Typography** — all TEXT nodes → `CapLabel` with the correct `type` (label1–label33) derived from `fontSize` + `fontWeight`. Handles non-Roboto fonts with a `NEEDS_MANUAL_OVERRIDE` flag.

4. **Color tokens** — fill colors on matched nodes are converted from Figma `{r,g,b}` → hex → nearest `$cap-*` CSS variable by RGB distance.

### Stage 3 — Vision Resolver (optional, `--screenshot`)

For every node that remains UNMAPPED after Stage 2:
- Computes a structural fingerprint (type + children + dimensions)
- Checks a **run-scoped in-memory Map** — if 3 identical structures appear on the same screen, only 1 API call is made. This Map lives in RAM and is destroyed when the CLI exits. It is NOT persistent storage.
- Crops the exact bounding box from the full-page screenshot using `sharp`
- Sends the cropped PNG + node context to Claude vision API
- Validates the response against the registry
- Resolved nodes get `source: "vision-inferred"`

### Stage 4 — Registry Writer (optional, `--learn`)

**This is the only real persistence.** Writes vision-inferred decisions to `component-mappings.json` on disk. New patterns → new entry; existing patterns → `usageCount` incremented.

On the next CLI run, those same nodes match in Stage 2 (registry lookup) before vision is ever called — no API cost, instant. Over time the registry learns your designer's actual naming conventions from real usage.

---

## Registry Files

### `src/registries/component-mappings.json`

Maps Figma component names/variants to Cap* components. Each entry:

```json
{
  "figmaIdentifier": "cap-modal",
  "nodeTypes": ["COMPONENT", "INSTANCE", "FRAME"],
  "componentNames": ["Modal*", "Dialog*", "Overlay*"],
  "variantPatterns": { "Type": "Default" },
  "targetComponent": "CapModal",
  "importPath": "blaze-ui/components/CapModal",
  "propMappings": {
    "Closable": { "prop": "closable", "transform": "boolean" }
  },
  "slotMappings": {
    "Title": { "slot": "title" },
    "Content": { "slot": "children" }
  },
  "confidence": "HIGH"
}
```

To add a new component: just add an entry. No code changes needed. Rebuild with `npm run build`.

### `src/registries/token-mappings.json`

Maps Figma color/spacing variables to `$cap-*` CSS variables and TypeScript constants. Used for fill color → token resolution.

---

## Recipe Output Format

```json
{
  "resolvedAt": "2026-04-09T10:00:00Z",
  "root": {
    "figmaNodeId": "331:17478",
    "figmaNodeType": "FRAME",
    "figmaComponentName": "BenefitsListing",
    "mappingStatus": "EXACT",
    "targetComponent": "CapColumn",
    "importPath": "blaze-ui/components/CapColumn",
    "source": "layout-inferred",
    "fingerprint": "a3f9c12d8e41",
    "props": {},
    "slots": {},
    "cssVariables": {},
    "manualOverrides": [],
    "warnings": [],
    "children": [...]
  },
  "stats": { "total": 42, "exact": 38, "partial": 3, "unmapped": 1 }
}
```

`source` values:
- `registry` — matched by name in `component-mappings.json`
- `layout-inferred` — auto-detected from `layoutMode` (CapRow/CapColumn)
- `typography` — TEXT node resolved to CapLabel
- `vision-inferred` — resolved by Claude vision from screenshot crop
- `unresolved` — UNMAPPED, needs LLM fallback chain

---

## Naming Guide for Designers

You don't need a formal design system. Just follow these rules:

1. **Name instances by what they are**: `DatePicker`, `Modal`, `StatusTag`, `Button` — not `Frame 2087332`
2. **Use variant properties for states**: one `Button` component with `State = Active/Disabled` — not three separate frames
3. **Name layout frames `Row` or `Column`**: any frame that's just a container gets auto-mapped
4. **Give custom patterns a descriptive name**: `BenefitsSummaryCard`, `FilterPanel`, `MetricCard`

These 4 rules drop UNMAPPED nodes from ~80% to under 20% on a typical screen.

---

## File Structure

```
mapping-agent/
  src/
    cli.ts                        — CLI entry: resolve-metadata, list-components, validate-registry
    resolver.ts                   — Core resolution engine (4 sub-resolvers)
    vision-resolver.ts            — Claude vision API for UNMAPPED nodes + fingerprint cache
    registry-writer.ts            — Writes learned mappings back to component-mappings.json
    registry-loader.ts            — Loads and validates registry JSON files
    output-writer.ts              — Writes recipe.json output files
    token-resolver.ts             — Resolves Figma variable defs → token map
    errors.ts                     — Typed error classes
    types.ts                      — All TypeScript interfaces
    utils/
      metadata-parser.ts          — get_metadata XML → FigmaNode tree
      fingerprint.ts              — Structural fingerprint (node → 12-char hash)
      crop.ts                     — Screenshot crop by bounding box (uses sharp)
      color.ts                    — Figma color → hex → nearest $cap-* token
      typography.ts               — fontSize+fontWeight → CapLabel type (label1–label33)
      spacing.ts                  — Spacing value → $cap-spacing-* token
    registries/
      component-mappings.json     — 53 component entries (hand-written + llm-inferred)
      token-mappings.json         — 130 token entries
  dist/                           — Compiled JS (after npm run build)
  README.md                       — This file
```

---

## Independent of blaze-ui

This tool has zero garuda-ui specific code. To use with a different component library:

1. Replace `component-mappings.json` with entries for your components
2. Replace `token-mappings.json` with your token variables
3. Update `importPath` values in each entry

It can be published as a standalone package for any React design system that has a corresponding Figma component library.
