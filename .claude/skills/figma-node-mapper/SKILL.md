---
name: figma-node-mapper
description: Fetches a Figma node's metadata, runs it through the mapping agent CLI to produce a verified recipe.json, resolves UNMAPPED nodes, and persists all intermediates to claudeOutput/figma-capui-mapping/ for downstream reuse. Stops after mapping — no code generation.
triggers:
  - "map figma node"
  - "fetch figma recipe"
  - "figma to cap-ui components"
---

# Figma Node Mapper Skill

This skill encapsulates Phase 1 (Understand) and Phase 2 (Map) of the `figma-to-component-agent` pipeline. It produces a verified Cap-UI-Library component mapping for a Figma node and persists all intermediate files to `claudeOutput/figma-capui-mapping/` so they can be reused by any downstream pipeline (HLD generator, etc.).

**Does NOT**: generate a build plan, write component code, or run audits.

## Input

A Figma URL, e.g.:
```
https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>
```

## Output Folder Convention

All artifacts are stored under `claudeOutput/figma-capui-mapping/` using the nodeId with `-` (not `:`):

```
claudeOutput/figma-capui-mapping/
  <nodeId>.recipe.json           # mapping agent output — primary artifact
  <nodeId>/
    metadata.xml                 # raw get_metadata XML
    design-context.jsx           # raw get_design_context JSX (styling reference)
    prop-spec-notes.json         # prop-spec lookup results per resolved component
    screenshot.png               # only if explicitly saved (optional)
```

---

## Step 1 — Parse the URL

Extract `fileKey` and `nodeId`:
- URL format: `figma.com/design/<fileKey>/...?node-id=<nodeId>`
- Convert `-` to `:` in nodeId for Figma API calls (e.g. `318-17826` → `318:17826`)
- Use `-` in nodeId for file naming (e.g. `318-17826`)
- For branch URLs: `figma.com/design/<fileKey>/branch/<branchKey>/...` → use branchKey as fileKey

If `figma_url` is empty or `fileKey` cannot be extracted → STOP: "Error: No valid Figma URL provided."

---

## Step 2 — Get the Screenshot

```
get_screenshot(fileKey, nodeId)
```

View the image and note:
- Layout structure (rows vs columns, side-by-side elements, grid)
- Approximate proportions and major section boundaries
- Component types visible (tabs, tables, buttons, icons, badges, forms, nav)
- Key text labels and interactive controls

This visual read is the basis for building the `sectionComponentMap` after recipe resolution.

---

## Step 3 — Get the Metadata XML

```
get_metadata(fileKey, nodeId)
```

**Validate before proceeding:**
- Output starts with `<` (XML tag)
- Contains node IDs in format `"NNN:NNN"`
- Does NOT contain `import`, `const`, `function`, `className` — those mean JSX was returned

If you got JSX, call `get_metadata` again. If still wrong, STOP with error.

**Write to disk:**
```bash
mkdir -p claudeOutput/figma-capui-mapping/<nodeId>
cat > claudeOutput/figma-capui-mapping/<nodeId>/metadata.xml << 'XMLEOF'
<paste the get_metadata XML output here>
XMLEOF
```

---

## Step 4 — Get Design Context (Styling Reference Only)

```
get_design_context(fileKey, nodeId)
```

This is a styling reference — NOT a component structure source. Do not derive component names or layout from this output.

**Write to disk:**
```bash
cat > claudeOutput/figma-capui-mapping/<nodeId>/design-context.jsx << 'JSXEOF'
<paste the full get_design_context JSX output here>
JSXEOF
```

---

## Step 5 — Extract Design Token Map

Resolve hex colors from the design context JSX to Cap-UI token variables:

```bash
node -e "
const tokens = require('./tools/mapping-agent/src/registries/token-mappings.json');
const hexValues = process.argv.slice(1);
hexValues.forEach(hex => {
  const match = tokens.entries.find(e => e.figmaValuePattern.toLowerCase() === hex.toLowerCase());
  if (match) {
    const jsVar = match.blazeCSSVar.replace(/^\$/, '').replace(/-/g, '_').toUpperCase();
    console.log(hex, '->', jsVar, '(' + match.blazeCSSVar + ')');
  } else {
    console.log(hex, '-> NO TOKEN MATCH (use raw hex)');
  }
});
" -- <hex-color-1> <hex-color-2> ...
```

Replace the hex list with all unique colors found in the design context JSX.

Build the token map:
```
COLORS:  #091e42 → CAP_G01, #42b040 → CAP_COLOR_06, ...
SPACING: 8px → CAP_SPACE_08, 16px → CAP_SPACE_16, ...
FONTS:   14px → FONT_SIZE_M, 500 → FONT_WEIGHT_MEDIUM, ...
```

---

## Step 6 — Ensure Mapping Agent is Built

```bash
ls tools/mapping-agent/dist/cli.js 2>/dev/null || \
  (cd tools/mapping-agent && npm run build)
```

---

## Step 7 — Run the Mapping Agent CLI

```bash
node tools/mapping-agent/dist/cli.js resolve-metadata \
  --design-context claudeOutput/figma-capui-mapping/<nodeId>/design-context.jsx \
  --registry tools/mapping-agent/src/registries \
  --output claudeOutput/figma-capui-mapping/ \
  < claudeOutput/figma-capui-mapping/<nodeId>/metadata.xml
```

**Validate output:**
- First line: `Recipe written to: claudeOutput/figma-capui-mapping/<nodeId>.recipe.json`
- Second line: `Stats: N nodes — X EXACT, Y PARTIAL, Z UNMAPPED`
- If `ERROR: resolve-metadata expects get_metadata XML` → you passed JSX. Fix Step 3.

Read the recipe file that was written.

---

## Step 8 — Resolve UNMAPPED Nodes

Walk the recipe tree **from leaves to root** (deepest children first).

For every node with `mappingStatus: "UNMAPPED"`, apply this chain in order:

1. Recipe has `fallback.nearestComponent` → use it with `styled(NearestComponent)`
2. Node is TEXT → `CapLabel`
3. Square node with no children (width ≈ height within 20%) → `styled(CapIcon)`
4. Node height < 52px + HORIZONTAL layout + ≤3 children → `styled(CapButton)`
5. Node has exactly 1 TEXT child → `styled(CapLabel)` wrapper
6. Node has children + HORIZONTAL layout → `CapRow`
7. Node has children + VERTICAL layout → `CapColumn`
8. Wide node (>300px) with fills + many children → `CapCard`
9. Node has fills + children → `CapCard`
10. Leaf node (no children) → `styled(CapLabel)` for text-like, `styled(CapRow)` for box-like
11. No Cap* primitive fits → compose from Cap* primitives
12. Cap* composition insufficient → `styled.div` / `styled.span` with comment `// No Cap* equivalent`
13. Genuinely impossible (third-party embed, canvas) → `null` with TODO comment

**Layout mode → container mapping:**

| Figma `layoutMode` | Cap* Container |
|--------------------|----------------|
| `HORIZONTAL` | `CapRow` |
| `VERTICAL` | `CapColumn` |
| `null` / absent | `CapColumn` (add TODO: absolute positioning lost) |

---

## Step 9 — Look Up Prop-Spec for All Resolved Components

Collect all unique `targetComponent` names from the recipe (after UNMAPPED resolution):

```bash
node -e "
const spec = require('./tools/mapping-agent/src/registries/prop-spec.json');
const components = process.argv.slice(1);
const result = {};
components.forEach(c => {
  const e = spec[c];
  if (!e) { result[c] = { error: 'NOT IN SPEC' }; return; }
  result[c] = {
    antdComponent: e.antdComponent || null,
    antdProps: Object.keys(e.antdProps || {}),
    wrapperProps: Object.keys(e.wrapperProps || {}),
    caveats: e.caveats,
    styledPattern: e.styledPattern || null,
    disambiguation: e.disambiguation || null
  };
});
console.log(JSON.stringify(result, null, 2));
" -- CapRow CapColumn CapButton CapTable CapModal CapInput CapTab
```

Replace the component list with the actual unique components from the recipe.

**Write to disk:**
```bash
cat > claudeOutput/figma-capui-mapping/<nodeId>/prop-spec-notes.json << 'EOF'
<paste the JSON output here>
EOF
```

---

## Step 10 — Build the Section Component Map

Cross-reference the screenshot (Step 2) with the recipe resolution to produce a human-readable mapping. Each entry maps a visible UI section name to its resolved Cap* component:

```
sectionComponentMap = {
  "Top Navigation Bar"  : "CapRow",
  "Page Title"          : "CapLabel",
  "Create Button"       : "CapButton",
  "Data Table"          : "CapTable",
  "Table Row"           : "CapRow",
  "Pagination Controls" : "CapPagination",
  "Filter Sidebar"      : "CapColumn",
  "Status Badge"        : "CapLabel (styled)",
  "Edit Action Icon"    : "CapIcon"
}
```

Rules:
- Section names come from the screenshot visual read (Step 2) — use human-readable labels
- Component values come from recipe `targetComponent` after UNMAPPED resolution (Steps 7–8)
- If a visible section has no recipe node, mark it `[ASSUMED]`
- EXACT and PARTIAL entries are highest confidence; RESOLVED-UNMAPPED are medium confidence

---

## Skill Output (Mental Model)

The skill produces a mental model the calling agent carries forward:

| Key | Value |
|-----|-------|
| `recipeFilePath` | `claudeOutput/figma-capui-mapping/<nodeId>.recipe.json` |
| `sectionComponentMap` | Object mapping UI section names → Cap* component names (see Step 10) |
| `designTokenMap` | hex/size → token variable mapping (from Step 5) |
| `propSpecPath` | `claudeOutput/figma-capui-mapping/<nodeId>/prop-spec-notes.json` |
| `recipeStats` | `{ exact: N, partial: N, unmapped: N, resolved: N }` |

---

## Error Handling

| Situation | Action |
|-----------|--------|
| `get_metadata` returns JSX | Call again; if still wrong, STOP |
| Mapping agent binary missing | Run `npm run build` in `tools/mapping-agent/`, retry |
| Mapping agent exits non-zero | Print stderr, STOP |
| All nodes UNMAPPED after Step 8 | STOP: "Mapping produced no resolutions. Check the registry." |
| Figma URL inaccessible | Mark all components `[ASSUMED - Figma inaccessible]`, skip Steps 2–9 |
