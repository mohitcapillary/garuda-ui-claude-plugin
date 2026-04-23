# Figma to Component Agent

An autonomous agent that converts a Figma design node into a blaze-ui React component. It fetches design data from Figma MCP tools, runs the mapping agent CLI to produce a structured recipe, resolves every UNMAPPED node to a Cap* component (or composes from primitives, or uses styled HTML as last resort), presents a build plan for confirmation, generates the component file bottom-up, and audits the output.

---

## Table of Contents

1. [Input Contract](#1-input-contract)
2. [Error Handling](#2-error-handling)
3. [Phase 1: Understand](#phase-1-understand)
4. [Phase 2: Map](#phase-2-map)
5. [Phase 3: Plan](#phase-3-plan) 
6. [Phase 4: Generate](#phase-4-generate)
7. [Phase 5: Audit](#phase-5-audit)
8. [Component Rules Reference](#component-rules-reference)
9. [Route & Loadable](#route--loadable)
10. [Mapping Agent Location](#mapping-agent-location)

---

## 1. Input Contract

**Arguments**:
- `figma_url` — a Figma design URL, e.g. `https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>`
- `--vision` *(optional flag, default: **off**)* — when present, save the screenshot and pass `--screenshot` to the mapping CLI to enable visual resolution of UNMAPPED nodes
- `--route` *(optional flag)* — when present, also generate the `Loadable.js` + `index.js` + `routes.js` entry for a new page route

**Orchestration Mode flags** *(used when another agent like `hld-to-code-agent` delegates UI generation)*:
- `--target-path <dir>` — write generated files into `<dir>` instead of the default location. E.g. `app/components/pages/BenefitsSettings/`.
- `--target-component-name <Name>` — name the root component `<Name>` (PascalCase). File becomes `<Name>.js`.
- `--target-library cap-ui-library` — target `@capillarytech/cap-ui-library` (default). Other values reserved.
- `--decomposition <json>` — path to a JSON file describing how to split the single Figma node into multiple files per atomic tier. Schema:
  ```json
  [
    { "role": "sidebar",         "name": "CapSideBar",            "inline": true },
    { "role": "page-title",      "name": "Benefits",              "inline": true },
    { "role": "section:<slug>",  "name": "CustomFieldsSection",   "tier": "organism",
      "targetPath": "app/components/organisms/CustomFieldsSection/",
      "figmaNodeIds": ["24:2779", "24:2780", "24:2785"] },
    { "role": "modal:<slug>",    "name": "BenefitsSettingsModal", "tier": "molecule",
      "targetPath": "app/components/molecules/BenefitsSettingsModal/",
      "figmaNodeIds": ["24:3089"] }
  ]
  ```
  Each entry with `tier` other than `inline` becomes a separate file under its `targetPath`. `figmaNodeIds` lists which nodes in the recipe belong to that entry. The root file contains inline roles + imports of tier roles.
- `--omit-redux-wiring` — do NOT emit `connect`, `mapStateToProps`, `mapDispatchToProps`, `injectReducer`, `injectSaga`, or any Redux-related imports. The orchestrator is responsible for adding those. `export default <Name>;` is used instead of a HOC-composed export.
- `--omit-route-registration` — do NOT modify `app/components/pages/App/routes.js`. The orchestrator owns routing.
- `--emit-callback-stubs` — wherever an interactive element (button `onClick`, table `onChange`, input `onChange`, modal `onOk`/`onCancel`) needs a handler, emit a stub: `onClick={/* HANDLER: New custom field CTA */}`. The orchestrator greps these markers and fills them. Without this flag, the agent emits inline stub functions.
- `--skip-plan-confirmation` — bypass the Phase 3 "Confirm? (y/n)" gate. The orchestrator has already confirmed layout in its own preview gate. This flag ALSO causes the agent to emit a **manifest** at the end of Phase 4.
- `--component-plan <path>` — absolute path to `component-plan.json` from the orchestrator's Phase 2 §5.5. When set, the agent loads it in Phase 1e, builds a `Map<nodeId, targetComponent>`, and treats each entry as **authoritative over `recipe[nodeId].targetComponent`** (see Phase 2 STEP 2.0). This is how HLD Reviewer Overrides and typography-rule decisions reach code generation. When NOT set (standalone invocation), the agent uses `recipe.json` values as-is. Also sets the `COMPONENT_PLAN_PATH` env var (mirrors existing `LAYOUT_PLAN_PATH` pattern).

**When any orchestration flag is set**, the agent:
1. Runs Phase 1–2 silently (no interactive narration).
2. Skips Phase 3 user confirmation.
3. Respects `--target-path` and `--decomposition` during Phase 4.
4. Emits `<target-path>/ui-generation-manifest.json` alongside the code:

   ```json
   {
     "version": "1.0",
     "rootComponent": "BenefitsSettings",
     "rootFile": "app/components/pages/BenefitsSettings/BenefitsSettings.js",
     "filesWritten": [
       "app/components/pages/BenefitsSettings/BenefitsSettings.js",
       "app/components/pages/BenefitsSettings/styles.js",
       "app/components/organisms/CustomFieldsSection/CustomFieldsSection.js",
       "app/components/organisms/CustomFieldsSection/styles.js",
       "..."
     ],
     "propsRequired": {
       "BenefitsSettings": ["programId", "customFields", "customFieldsStatus", "categories", "categoriesStatus", "..."],
       "CustomFieldsSection": ["customFields", "sortBy", "sortOrder", "onCreate", "onUpdate", "onDelete", "onSortChange"],
       "...": []
     },
     "callbackSlots": [
       { "file": "app/components/organisms/CustomFieldsSection/CustomFieldsSection.js",
         "marker": "HANDLER: New custom field CTA",
         "proposedProp": "onCreate",
         "figmaNodeId": "24:2784" },
       { "file": "app/components/organisms/CustomFieldsSection/CustomFieldsSection.js",
         "marker": "HANDLER: CapTable sort change",
         "proposedProp": "onSortChange",
         "figmaNodeId": "24:2785" }
     ],
     "stringSlots": [
       { "file": ".../CustomFieldsSection.js", "line": 48, "literal": "New custom field", "suggestedIntlKey": "newCustomFieldCta" }
     ],
     "tokensUsed": ["CAP_G01", "CAP_G05", "CAP_G07", "CAP_WHITE", "CAP_SPACE_04", "CAP_SPACE_16", "CAP_SPACE_24", "CAP_SPACE_48", "FONT_WEIGHT_MEDIUM"],
     "bespokeFiles": ["app/components/organisms/TierBadge/TierBadge.js"],
     "layoutSummary": {
       "viewportWidth": 1440,
       "sidebar": { "width": 240, "position": "absolute-left" },
       "mainPanel": { "width": 1200, "innerWidth": 1104, "paddingLeft": 48, "paddingTop": 28 }
     }
   }
   ```

   The manifest is the **contract** between figma-to-component and its orchestrator. Every callback slot corresponds to a `/* HANDLER: … */` marker in code; the orchestrator's Phase 5c greps for these markers and replaces them with dispatched actions.

**Accepted URL patterns**:
- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → extract fileKey and nodeId (convert `-` to `:` in nodeId)
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use branchKey as fileKey
- `figma.com/file/:fileKey/...` → same as design

**Validation rules**:
1. If `figma_url` is empty or not a valid figma.com URL → **STOP**: "Error: No valid Figma URL provided."
2. If `fileKey` cannot be extracted → **STOP**: "Error: Cannot extract fileKey from URL."
3. If `nodeId` cannot be extracted → warn "No nodeId found — will resolve the full file root node." Continue.

Once validated, proceed to Phase 1.

---

## 2. Error Handling

| Situation | Action |
|-----------|--------|
| `get_metadata` returns JSX/code instead of XML | Call `get_metadata` again. If still wrong, STOP with error. |
| Mapping agent binary missing | Run `npm run build` in `tools/mapping-agent/`, then retry. |
| Mapping agent exits non-zero | Print stderr, STOP with error. |
| All nodes UNMAPPED after Phase 2 | STOP: "Mapping produced no resolutions. Check the registry." |
| Generated file exceeds 450 lines | Split into sub-component files — see Phase 4. |
| Audit grep finds violations | Fix each violation in-place, re-run audit. Never skip. |
| Cache file exists but is empty or corrupted (0 bytes, truncated XML, JSX that doesn't start with `<`) | Set `CACHE_HIT=false`. Delete the bad file (`rm "${CACHE_DIR}/design-context.jsx"`), then proceed with fresh MCP calls. Print: `⚠ Cache invalid for node <nodeId> — falling back to Figma MCP`. |
| `design-context.jsx` is <50 lines or contains only comments/summary (no `<frame` or `<div` or `className=` tokens) | **STOP**: "HARD STOP: design-context.jsx is a placeholder/summary, not real Figma data. Re-fetch from Figma MCP required." Do NOT proceed to Phase 2 or code generation. |
| `get_design_context` returns a "too large" message with sparse metadata summary | Call `get_design_context` on individual child nodeIds from the metadata XML. Do NOT use the summary as a substitute for real design data. |
| UI behavior ambiguity (e.g., does tab filter content or just scroll? how many items?) | **STOP** and use `AskUserQuestion`. Never assume interaction patterns. |

---

## Phase 1 — Understand (NO code generation)

Build a complete mental model of the design before writing anything.

### 1a. Parse the URL

Extract `fileKey` and `nodeId`:
- URL format: `figma.com/design/<fileKey>/...?node-id=<nodeId>`
- Convert `-` to `:` in nodeId (e.g. `318-17826` → `318:17826`)

### 1a'. Cache check (run BEFORE any Figma MCP call)

The `figma-node-mapper` skill writes four files to `claudeOutput/figma-capui-mapping/`. Check for them
before calling any Figma MCP tool — MCP calls require interactive permission and are expensive.

Derive the cache dir by converting `:` → `-` in nodeId (e.g. `24:2729` → `24-2729`):

```bash
NODE_DASH="<nodeId with : replaced by ->"   # e.g. 24-2729
CACHE_DIR="claudeOutput/figma-capui-mapping/${NODE_DASH}"

# Check existence AND non-empty (size > 0) for all three files
DC_OK=false;  [ -s "${CACHE_DIR}/design-context.jsx" ] && DC_OK=true
MD_OK=false;  [ -s "${CACHE_DIR}/metadata.xml" ]       && MD_OK=true
RC_OK=false;  [ -s "claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json" ] && RC_OK=true

echo "design-context: $DC_OK | metadata: $MD_OK | recipe: $RC_OK"
```

**If ALL THREE are non-empty**:
- Set `CACHE_HIT=true`
- Set `DESIGN_CONTEXT_PATH="${CACHE_DIR}/design-context.jsx"` ← used by Phase 1e
- Read `${CACHE_DIR}/design-context.jsx`

**CRITICAL — Validate the cached design-context.jsx before using it:**
```bash
# Check if it's metadata-only (no color/visual data)
METADATA_ONLY=false
grep -q "metadata mode" "${CACHE_DIR}/design-context.jsx" && METADATA_ONLY=true
grep -qE 'bg-\[#|text-\[#|fill:|background:' "${CACHE_DIR}/design-context.jsx" || METADATA_ONLY=true
```
- If `METADATA_ONLY=true`: the cached file has structure but NO color/fill/visual data (the root frame was too large when it was first fetched). **Do NOT use it for token extraction.** Instead:
  1. Still use it for structure/tree understanding
  2. Set `CACHE_INCOMPLETE=true`
  3. After Phase 2b (recipe loaded), proceed to **Phase 1d-drill**: call `get_design_context` on each EXACT-recipe node individually to recover visual properties. Cache results in `${CACHE_DIR}/node-<nodeId>-design-context.jsx`.
  4. Use per-node design contexts (not the root) for Phase 1e token extraction.
  5. Print: `⚠ Cache hit but design-context.jsx is metadata-only — drilling into EXACT child nodes for visual data`

- If `METADATA_ONLY=false`: use normally.
- Read `${CACHE_DIR}/metadata.xml` → use as metadata XML (skip Phase 1c MCP call)
- Read `claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json` → use as recipe (skip Phase 2b mapping agent run)
- Still run Phase 1b (`get_screenshot`) ONLY if `--vision` flag is set AND `${CACHE_DIR}/screenshot.png` does not exist
- Print: `▶ Cache hit for node <nodeId> — skipping Figma MCP calls and mapping agent`
- Jump directly to Phase 1e (token extraction from `$DESIGN_CONTEXT_PATH`)

**Check for pre-built layout-plan.json** (written by hld-to-code Phase 2.2 — avoids duplicate token extraction in Phase 1e):
```bash
LAYOUT_PLAN_PATH=""
LP_CANDIDATE=$(grep -rl "\"rootNode\": \"${nodeId}\"" claudeOutput/build/*/layout-plan.json 2>/dev/null | head -1)
if [ -n "$LP_CANDIDATE" ]; then
  LAYOUT_PLAN_PATH="$LP_CANDIDATE"
  echo "▶ layout-plan.json found at $LAYOUT_PLAN_PATH — Phase 1e will read tokens from it directly"
fi
```

**Check for pre-built component-plan.json** (written by hld-to-code Phase 2 §5.5 — carries Reviewer Overrides that must win over recipe.json):
```bash
COMPONENT_PLAN_PATH=""
# Prefer explicit --component-plan flag when passed by orchestrator. Otherwise auto-discover
# by sibling-lookup next to the layout-plan.json we just located (same feature dir).
if [ -n "$CLI_COMPONENT_PLAN" ]; then
  COMPONENT_PLAN_PATH="$CLI_COMPONENT_PLAN"
elif [ -n "$LAYOUT_PLAN_PATH" ]; then
  CP_CANDIDATE="$(dirname "$LAYOUT_PLAN_PATH")/component-plan.json"
  [ -f "$CP_CANDIDATE" ] && COMPONENT_PLAN_PATH="$CP_CANDIDATE"
fi
if [ -n "$COMPONENT_PLAN_PATH" ]; then
  echo "▶ component-plan.json found at $COMPONENT_PLAN_PATH — Phase 2 STEP 2.0 will apply reviewer overrides"
fi
```

**If ANY is missing**:
- Set `CACHE_HIT=false`
- Proceed with Phases 1b, 1c, 1d normally (MCP calls required)
- After Phase 2b completes, copy outputs to the cache dir so future runs benefit:
  ```bash
  mkdir -p "${CACHE_DIR}"
  cp /tmp/figma-design-context.jsx "${CACHE_DIR}/design-context.jsx"
  cp /tmp/figma-metadata.xml       "${CACHE_DIR}/metadata.xml"
  cp "claudeOutput/figma-mapping-report/${NODE_DASH}.recipe.json" \
     "claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json"
  ```

### 1b. Get the screenshot (SKIP if CACHE_HIT=true and --vision not set)

```
get_screenshot(fileKey, nodeId)
```

View the image. Note:
- Layout structure (rows vs columns, side-by-side elements)
- Approximate dimensions and proportions
- Component types visible (tabs, tables, buttons, icons, badges)
- Text content

**If `--vision` flag is set**: save to `${CACHE_DIR}/screenshot.png` (and `/tmp/figma-screenshot-<nodeId>.png` for Phase 2b).

**If permission is denied**: continue without screenshot, skip `--screenshot` in Phase 2b.

**Verify:** you see a rendered image — not JSX or code.

### 1c. Get the metadata XML (SKIP if CACHE_HIT=true)

```
get_metadata(fileKey, nodeId)
```

**Verify before proceeding:**
- Output starts with `<` (XML tag)
- Contains node IDs in format `"NNN:NNN"`
- Does NOT contain `import`, `const`, `function`, `className` — those mean you got JSX

If you got JSX, call `get_metadata` again.

### 1d. Get design context for styling reference (SKIP if CACHE_HIT=true)

```
get_design_context(fileKey, nodeId)
```

Save immediately to a temp file and set `DESIGN_CONTEXT_PATH` (used by Phase 1e):

```bash
cat > /tmp/figma-design-context.jsx << 'JSXEOF'
<paste the full get_design_context JSX output here>
JSXEOF
DESIGN_CONTEXT_PATH="/tmp/figma-design-context.jsx"
```

Use the JSX for:
- Exact color values (hex codes, rgba)
- Font sizes and weights
- Padding / margin / gap values
- Border radius values

Do **not** use this as a node tree or component structure.

### 1e. Build design token map

**If `LAYOUT_PLAN_PATH` is set** (invoked from hld-to-code — layout-plan.json already built by Phase 2.2):

Read `colorTokenMap` and `spacingTokenMap` directly from `$LAYOUT_PLAN_PATH`:

```bash
node -e "
const lp = require(process.env.LAYOUT_PLAN_PATH);
console.log('COLORS:', JSON.stringify(lp.colorTokenMap, null, 2));
console.log('SPACING:', JSON.stringify(lp.spacingTokenMap, null, 2));
" LAYOUT_PLAN_PATH="$LAYOUT_PLAN_PATH"
```

Print: `▶ Token map loaded from layout-plan.json (hld-to-code pre-built) — skipping re-extraction`

Build the Design Token Map from those values and skip Steps 1–2 below. Go directly to Step 3.

---

**If `COMPONENT_PLAN_PATH` is set** (invoked from hld-to-code — component-plan.json written by Phase 2 §5.5):

Build an in-memory `componentPlanMap: Map<nodeId, targetComponent>` by reading every entry in `component-plan.json`:

```bash
node -e "
const cp = require(process.env.COMPONENT_PLAN_PATH);
const rows = Array.isArray(cp) ? cp : (cp.entries || Object.values(cp.screens || {}).flatMap(s => s.entries || []));
const map = {};
for (const r of rows) {
  if (r && r.nodeId && r.targetComponent) map[r.nodeId] = r.targetComponent;
}
process.stdout.write(JSON.stringify(map));
" > /tmp/component-plan-map.json
```

Print: `▶ component-plan.json loaded — N overrides available for Phase 2 STEP 2.0` (where N = number of entries).

This map is consulted in Phase 2 STEP 2.0 to override `recipe[nodeId].targetComponent` whenever the component-plan value differs. This is how HLD Reviewer Overrides and typography-rule decisions reach code generation.

---

**If `LAYOUT_PLAN_PATH` is NOT set** (standalone invocation — no layout-plan.json):

Extract visual values from `$DESIGN_CONTEXT_PATH` (set in Phase 1a' on cache hit, or Phase 1d on fresh fetch) and **map them to blaze-ui token variables** using `token-mappings.json`. This is mandatory — not optional.

**Step 1**: Extract raw hex colors, font sizes, spacing, and borders from `$DESIGN_CONTEXT_PATH`.

**Step 2**: Resolve each hex color to its blaze-ui JS variable by looking up `token-mappings.json`:

```bash
node -e "
const tokens = require('/Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/src/registries/token-mappings.json');
const hexValues = process.argv.slice(1);
hexValues.forEach(hex => {
  const match = tokens.entries.find(e => e.figmaValuePattern.toLowerCase() === hex.toLowerCase());
  if (match) {
    // Convert blazeCSSVar to JS constant: \$cap-g01 → CAP_G01, \$font-size-m → FONT_SIZE_M
    const jsVar = match.blazeCSSVar.replace(/^\$/, '').replace(/-/g, '_').toUpperCase();
    console.log(hex, '→', jsVar, '(' + match.blazeCSSVar + ')');
  } else {
    console.log(hex, '→ NO TOKEN MATCH (use raw hex)');
  }
});
" -- $(grep -oE '#[0-9a-fA-F]{3,6}' "$DESIGN_CONTEXT_PATH" | sort -u | tr '\n' ' ')
```

The grep auto-extracts all unique hex colors from the file — no manual list needed.

**Step 3**: Write the resolved token map:

```
## Design Token Map

COLORS (import from '@capillarytech/cap-ui-library/styled/variables')
  #091e42 → CAP_G01        (primary text)
  #42b040 → CAP_COLOR_06   (primary action / button bg)  
  #97a0af → CAP_G05        (subtitle / placeholder text)
  #dfe2e7 → CAP_G07        (borders)
  #fafbfc → CAP_G10        (table header bg)
  #5f6d83 → CAP_G04        (secondary text)

TYPOGRAPHY (import from '@capillarytech/cap-ui-library/styled/variables')
  24px → FONT_SIZE_VL      (page title)
  16px → FONT_SIZE_L       (section title)
  14px → FONT_SIZE_M       (body / table text)
  12px → FONT_SIZE_S       (meta / subtitle)
  500  → FONT_WEIGHT_MEDIUM
  400  → FONT_WEIGHT_REGULAR

SPACING (import from '@capillarytech/cap-ui-library/styled/variables')
  4px  → CAP_SPACE_04
  8px  → CAP_SPACE_08
  12px → CAP_SPACE_12
  16px → CAP_SPACE_16
  24px → CAP_SPACE_24

BORDERS / RADIUS
  1px solid #dfe2e7 → border: 1px solid ${CAP_G07}
  border-radius: 4px → from token $radius-04
```

**In Phase 4**: use these JS variables in styled-components instead of raw hex values:
```js
import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
const { CAP_G01, CAP_G07, CAP_G10, FONT_SIZE_M, CAP_SPACE_16 } = styledVars;

const MyLabel = styled(CapLabel)`
  color: ${CAP_G01};
  font-size: ${FONT_SIZE_M};
  padding: ${CAP_SPACE_16};
`;
```

### 1f. (Optional) Get variable definitions

```
get_variable_defs(fileKey, nodeId)
```

Use for token mapping if present.

### Phase 1 Output

State before proceeding:
- **Total layers**: count of nodes in the metadata XML
- **Layout structure**: which are horizontal stacks, vertical stacks, grids
- **Components identified**: tabs, tables, buttons, icons, cards, etc.
- **Text content**: key text labels visible
- **Design token map**: colors, typography, spacing, borders (from step 1e)

---

## Phase 2 — Map (NO code generation)

Walk every node in the recipe and ensure each has a resolution. Prefer Cap* components, compose from primitives when needed, use styled HTML as last resort.

### STEP 2.0 — Reviewer Override lookup (runs FIRST, only when `COMPONENT_PLAN_PATH` is set)

Before consulting `recipe[nodeId].disambiguation` or `recipe[nodeId].targetComponent` for any node, check the `componentPlanMap` built in Phase 1e. This step exists because the HLD **Reviewer Override** column and the typography-size rule are both resolved upstream by `hld-to-code-agent` and persisted into `component-plan.json`. `recipe.json` is a shared cache across features and is never mutated — so overrides cannot live there.

**Rule:** For each Figma node the agent is about to resolve:

1. Let `cpVal = componentPlanMap.get(nodeId)`.
2. Let `recipeVal = recipe[nodeId].targetComponent` (or derived default for UNMAPPED).
3. If `cpVal` is set AND `cpVal !== recipeVal`, use `cpVal` as the final `targetComponent`. Record this decision in the build log:
   ```
   ▶ Override applied for <nodeId>: recipe=<recipeVal> → component-plan=<cpVal>
   ```
4. If `cpVal` is unset, fall through to existing precedence (`recipe.disambiguation` → `recipe.targetComponent`).

**Authoritative precedence** (top wins):

```
1. component-plan[nodeId].targetComponent   (when COMPONENT_PLAN_PATH is set) ← NEW
2. recipe[nodeId].disambiguation            (existing)
3. recipe[nodeId].targetComponent           (existing default)
```

**Why component-plan wins:** it is the feature-scoped decision ledger written by hld-to-code §5.5 after applying Reviewer Override (Rule 2 of hld-to-code) and the typography size rule (§5.3). `recipe.json` is intentionally pristine for cross-feature cache reuse.

**Do NOT** mutate `recipe.json` to reflect overrides — it is a read-only shared cache.

### 2a. Ensure mapping agent is built

```bash
ls /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/dist/cli.js 2>/dev/null || \
  (cd /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent && npm run build)
```

### 2b. Run the mapping agent (SKIP if CACHE_HIT=true)

**If CACHE_HIT=true**: the recipe file already exists at `claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json`. Read it directly and skip the mapping agent run entirely.

**If CACHE_HIT=false**: write metadata XML to a temp file, then run:

**Default (vision off)**:
```bash
cat > /tmp/figma-metadata.xml << 'XMLEOF'
<paste the get_metadata XML output here>
XMLEOF

node /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/dist/cli.js resolve-metadata \
  --design-context /tmp/figma-design-context.jsx \
  --registry /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/src/registries \
  --output /Users/mohitgupta/Documents/capillary/revert/garuda-ui/claudeOutput/figma-mapping-report \
  < /tmp/figma-metadata.xml
```

**With `--vision` flag** (screenshot saved in Phase 1b):
```bash
node /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/dist/cli.js resolve-metadata \
  --design-context /tmp/figma-design-context.jsx \
  --registry /Users/mohitgupta/Documents/capillary/revert/garuda-ui/tools/mapping-agent/src/registries \
  --output /Users/mohitgupta/Documents/capillary/revert/garuda-ui/claudeOutput/figma-mapping-report \
  --screenshot /tmp/figma-screenshot-<nodeId>.png \
  < /tmp/figma-metadata.xml
```

**Verify:**
- First line: `Recipe written to: /path/to/<nodeId>.recipe.json`
- Second line: `Stats: N nodes — X EXACT, Y PARTIAL, Z UNMAPPED`
- If `ERROR: resolve-metadata expects get_metadata XML` → you passed JSX. Fix Phase 1c.

After the mapping agent run, copy outputs into the shared cache dir (so hld-to-code and future runs reuse them):
```bash
mkdir -p "${CACHE_DIR}"
cp /tmp/figma-design-context.jsx "${CACHE_DIR}/design-context.jsx"
cp /tmp/figma-metadata.xml       "${CACHE_DIR}/metadata.xml"
cp "claudeOutput/figma-mapping-report/${NODE_DASH}.recipe.json" \
   "claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json"
```

Read the recipe file that was written.

### 2c. Look up prop-spec.json for every unique resolved component

**This step is mandatory before Phase 3.** It prevents generating incorrect props (CSS overrides instead of React props, wrong API usage, CapTable/CapTab confusion).

**Step 1** — auto-extract all unique `targetComponent` values from the recipe file:

```bash
RECIPE="claudeOutput/figma-capui-mapping/${NODE_DASH}.recipe.json"
node -e "
const r = require(process.argv[1]);
const names = new Set();
function walk(n) {
  if (n.targetComponent) names.add(n.targetComponent);
  (n.children || []).forEach(walk);
}
(Array.isArray(r) ? r : [r]).forEach(walk);
console.log([...names].join(' '));
" "$RECIPE"
```

This prints every unique Cap* component name in the recipe (e.g. `CapRow CapTable CapButton CapModal CapInput`). Use this list — do NOT hardcode it.

**Step 2** — read prop-spec for the extracted list:

```bash
node -e "
const spec = require(process.env.GARUDA_UI_PATH + '/tools/mapping-agent/src/registries/prop-spec.json');
const components = process.argv.slice(1);
components.forEach(c => {
  const e = spec[c];
  if (!e) { console.log(c + ': NOT IN SPEC — check cap-ui-library source'); return; }
  console.log('\n=== ' + c + ' (' + (e.antdComponent || 'no antd') + ', spreads: ' + e.spreadsAllAntdProps + ') ===');
  if (e.antdProps)    console.log('antdProps:    ', Object.keys(e.antdProps).join(', '));
  if (e.wrapperProps) console.log('wrapperProps: ', Object.keys(e.wrapperProps).join(', '));
  (e.caveats || []).forEach(c => console.log('  CAVEAT:', c));
  if (e.styledPattern)   console.log('  styledPattern:', e.styledPattern);
  if (e.disambiguation)  console.log('  disambiguation:', e.disambiguation);
});
" -- <paste extracted component list here>
```

**Step 3** — build a `prop-table` in memory (used as the ONLY source of truth in Phase 4):

```
prop-table:
  CapRow:    antd=[type, justify, align, gutter]  wrapper=[]  styledPattern=".attrs(()=>({type:'flex'}))"
  CapTable:  antd=[dataSource, columns, pagination, onChange, rowKey, loading]  wrapper=[...]
  CapButton: antd=[onClick, disabled, loading, htmlType]  wrapper=[type, isAddBtn, prefixIcon]
  CapModal:  antd=[visible, onOk, onCancel, title, width, footer]  wrapper=[...]
  CapInput:  antd=[value, onChange, placeholder, disabled]  wrapper=[label, isRequired, errorMessage]
  ... (one row per component extracted in Step 1)
```

**For each component, note and act on:**
- **antdProps** — ONLY valid layout/behavior props. Do NOT invent props outside this list.
- **wrapperProps** — Cap-specific API props. EQUALLY important as antdProps.
- **caveats** — pitfalls. Every caveat must be respected in Phase 4.
- **styledPattern** — if present, MUST use `.attrs()` pattern instead of passing props in JSX.
- **disambiguation** — if present, override your component choice NOW before Phase 3.
- **NOT IN SPEC** — if a component returns "NOT IN SPEC", you MUST verify its props by reading its source in `node_modules/@capillarytech/cap-ui-library/` before using it in Phase 4. Do not guess.

**CRITICAL RULE**: After this step, **discard all prop values from the recipe's `props` field**.
Props in Phase 4 must come exclusively from:
1. The `prop-table` built above (antdProps + wrapperProps from prop-spec.json)
2. Design token map (from Phase 1e) — correct visual values (colors, spacing, fonts)

**Step 4 — Persist prop-table to disk** (REQUIRED — reused by Phase 5c and by hld-to-code Phase 5c Step 6, avoiding duplicate prop-spec.json parses):

```bash
PROP_TABLE_PATH="${CACHE_DIR}/prop-table.json"

node -e "
const fs = require('fs');
const crypto = require('crypto');
const specPath = process.env.GARUDA_UI_PATH + '/tools/mapping-agent/src/registries/prop-spec.json';
const spec = require(specPath);
const components = process.argv.slice(1);

const specHash = crypto.createHash('sha256').update(fs.readFileSync(specPath)).digest('hex');

const propTable = {
  generatedAt: new Date().toISOString(),
  recipeNodeId: process.env.NODE_ID,
  sourceSpec: 'tools/mapping-agent/src/registries/prop-spec.json',
  sourceSpecHash: 'sha256:' + specHash,
  components: {}
};

components.forEach(c => {
  const e = spec[c];
  if (!e) { propTable.components[c] = { notInSpec: true }; return; }
  const antdKeys = Object.keys(e.antdProps || {});
  const wrapperKeys = Object.keys(e.wrapperProps || {});
  propTable.components[c] = {
    antdProps: antdKeys,
    wrapperProps: wrapperKeys,
    allowedProps: [...antdKeys, ...wrapperKeys],
    caveats: e.caveats || [],
    styledPattern: e.styledPattern || null,
    spreadsAllAntdProps: e.spreadsAllAntdProps || false,
    disambiguation: e.disambiguation || null
  };
});

fs.writeFileSync(process.env.PROP_TABLE_PATH, JSON.stringify(propTable, null, 2));
console.log('▶ Wrote ' + process.env.PROP_TABLE_PATH + ' (' + components.length + ' components)');
" NODE_ID="$nodeId" PROP_TABLE_PATH="$PROP_TABLE_PATH" -- $uniqueComponents
```

This derived file (`claudeOutput/figma-capui-mapping/<nodeDashId>/prop-table.json`) contains only the components used in this recipe — not the full prop-spec.json. Phase 4, Phase 5c, and hld-to-code Phase 5c Step 6 all read from this file instead of re-parsing prop-spec.json.

### 2d. Resolve every UNMAPPED and BESPOKE node

> **BESPOKE** = "this component does not exist in cap-ui-library. Build it from scratch using Cap* primitives (CapRow, CapColumn, CapLabel, etc.) as building blocks, plus styled-components for custom layout/styling." Two triggers produce BESPOKE in the recipe: (1) designer prefixed the Figma frame with `Custom_`, (2) the mapping agent found no Cap* match AND no reasonable fallback for a node with children.

Process the recipe tree **from leaves to root** (deepest children first).

**Path A — `mappingStatus: "UNMAPPED"` with `fallback.nearestComponent` non-null**:
The mapping-agent already ran the heuristics and found a Cap* match. Read it directly:
- Use `fallback.nearestComponent` as-is: `styled(<nearestComponent>)`
- Record: `[nodeId] [nodeName] → <nearestComponent>` (from recipe fallback)
- Do NOT re-apply heuristics — the mapping-agent already ran them with registry validation.

**Path B — `mappingStatus: "UNMAPPED"` with `fallback.nearestComponent: null`**:
No heuristic matched. Apply manual resolution, **leaves first** (children must be resolved before parents, since rules like "has kids + HORIZONTAL → CapRow" require knowing resolved children):
1. Check the **Composition Patterns Lookup Table**
2. If no pattern matches, walk the **Fallback Priority Chain**
3. Record: `[nodeId] [nodeName] → [CapComponent]` (manual)

Layout mode → container mapping (Path B only):

| Figma `layoutMode` | BlazeUI Container | Notes |
|--------------------|-------------------|-------|
| `HORIZONTAL` | `CapRow` | Use `gutter` from `itemSpacing` value |
| `VERTICAL` | `CapColumn` | Stack children vertically |
| `null` / absent | `CapColumn` | Default; add `// TODO: absolute positioning lost` comment |

**Path C — `mappingStatus: "BESPOKE"`** (self-contained visual primitive — no Cap* match, has fills, has children):
This node needs a **standalone custom component file**, not an inline `styled.div`. Do NOT generate it here — record it for Phase 4:
1. Derive the component name from Figma node name in PascalCase (e.g. `"Tier Badge"` → `TierBadge`)
2. Identify props from children:
   - `TEXT` child → `label: string` prop
   - fills on node → `color: string` prop (look up `colorTokenMap` from layout-plan.json)
   - `INSTANCE` child matching a Cap* icon pattern → `icon: string` prop
3. Record: `[nodeId] [nodeName] → <BespokeName>` (BESPOKE — standalone file, Phase 4 will write it)

### Phase 2 Output

Print a mapping summary:
```
Mapping Summary:
- EXACT: N nodes (list component names)
- PARTIAL: N nodes (list with warnings)
- UNMAPPED → resolved: N nodes (list each with chosen Cap* component)
- BESPOKE: N nodes (list each — standalone custom component files, generated in Phase 4)
- Genuinely unmappable: N nodes (list with TODO reasons)
- Styled HTML fallbacks: N nodes (list each — only when Cap* composition is insufficient)
```

---

## Phase 3 — Plan (NO code generation, WAIT for confirmation)

Print a build plan in this exact format and **STOP**. Wait for the user to confirm or request changes before writing any code.

```
## Build Plan

### Styled Wrappers (depth: deepest)
- [WrapperName] = styled([CapComponent]) — for node "[figmaNodeName]"

### Sub-Components
- [ComponentName] = [composition] — for node "[figmaNodeName]"

### Sections
- [SectionName] = [layout] > [children]

### Root
- [RootComponentName] = [layout] > [sections]

### Imports needed
- [list all CapX components that will be imported]

Confirm? (y/n or suggest changes)
```

**Do NOT write any code until the user confirms.**

---

## Phase 4 — Generate (bottom-up code generation)

After user confirmation, generate the component file.

### Generation order (bottom-up):

1. **Imports** — all `@capillarytech/cap-ui-library/CapX` imports, plus `styled-components`
2. **Styled wrappers** — `styled(CapX)` declarations for UNMAPPED leaf nodes
3. **Sub-component functions** — small composite components (badge, metric card, etc.)
4. **Section components** — major screen sections (header, sidebar, content)
5. **Root component** — default export that assembles sections

### Rules enforced:

- **Prefer** `styled(CapX)` — `styled(CapLabel)`, `styled(CapRow)`, etc.
- `styled.div`, `styled.span`, etc. are allowed as **last resort** when no Cap* primitive can achieve the layout (e.g. custom canvas wrapper, SVG container, complex grid). Always add a comment: `// No Cap* equivalent — styled HTML`
- Imports use canonical paths: `import CapX from '@capillarytech/cap-ui-library/CapX'`
- Each blaze-ui component imported exactly once
- No unused imports
- **`withStyles` className scoping — CRITICAL**: `withStyles` from `@capillarytech/vulcan-react-sdk/utils` injects CSS by prepending the generated class to every selector in `styles.js`. A styles.js that exports `.my-component { .child { … } }` becomes `.generatedCls .my-component .child { … }` at runtime. This means **`.my-component` must be a descendant of the root element — never on the root element itself**. Putting both classes on the root (`className={`my-component ${className}`}`) makes the selector look for `.my-component` inside `.generatedCls`, which never matches since they are on the same element — **all styles silently fail**.

  **Always use this pattern (mirrors PromotionList):**

  ```jsx
  // ✅ CORRECT — root carries only the withStyles class; component class is one level inside
  const MyComponent = ({ className, … }) => (
    <div className={className}>           {/* withStyles-generated class ONLY */}
      <div className="my-component">      {/* CSS selector root */}
        …
      </div>
    </div>
  );
  export default withStyles(MyComponent, styles);
  ```

  ```jsx
  // ❌ WRONG — both classes on the same element; all CSS is silently dead
  <div className={`my-component ${className}`}>
  ```

  **Special cases:**

  | Root element type | Fix |
  |---|---|
  | Plain `div` / `CapRow` / `CapColumn` | Add outer `<div className={className}>`, move component class to first child |
  | Leaf with no children (`CapInput`, `<span>`) | Wrap with `<div className={className}>`; keep component class on inner element |
  | 3rd-party container with own DOM (`CapDrawer`, `CapModal`) | Use `className={className}` on the component; **hoist CSS** — remove the `.my-component { … }` outer wrapper from `styles.js` so selectors are scoped directly by the generated class |
  | Simple atom with no nested CSS (2–3 rules, no child selectors) | **Hoist CSS** — remove outer wrapper in `styles.js`, use `className={className}` on root |

  Also destructure `className` from props, add `className: PropTypes.string` and `className: ''` in defaultProps.

- **Slide-out panels — ALWAYS use `CapSlideBox`, NEVER `CapDrawer`**: `CapDrawer` (raw Ant Design) is not integrated with the garuda-ui shell layout and renders as a sliver. `CapSlideBox` is the correct component for all slide-out panels (`show`, `handleClose`, `content`/`header`/`footer`, `size="size-m"`, `placement="right"`). If a Figma node maps to a drawer/panel, emit `CapSlideBox`.

- **Popup components inside `CapSlideBox` must have `getPopupContainer`**: Any `CapMultiSelect`, `CapSelect`, `CapDateRangePicker`, or similar Ant Design popup-based component rendered inside a `CapSlideBox` (or `CapModal`) MUST include `getPopupContainer={(trigger) => trigger.parentElement}`. Without it the popup renders into `document.body` and may appear hidden behind the panel overlay.

- **`CapMultiSelect` callback is `onSelect` not `onChange`**: Always use `onSelect` for `CapMultiSelect`. `onChange` is not a valid prop and silently does nothing.

- **New page components must apply standard horizontal padding** (Figma artboards do not encode this — add it regardless of what the design shows): Listing pages → `padding: ${CAP_SPACE_20} ${CAP_SPACE_72} 0 ${CAP_SPACE_72}` on root content div. Config/Edit pages → `margin: ${CAP_SPACE_24} ${CAP_SPACE_72}` on inner `CapRow` wrapper. Do NOT retrofit existing pages.

- **`CapTable` must use infinite scroll by default**: Unless the HLD explicitly requires pagination, always set `infinteScroll={true}` (⚠️ cap-ui-library typo — `infin**te**Scroll`, not `infiniteScroll`). Required companion props: `showLoader`, `setPagination`, `loadMoreData`. Paginated mode only if product spec explicitly says so.

  ```jsx
  <CapTable
    dataSource={data}
    columns={columns}
    infinteScroll={true}
    showLoader={isLoading}
    pagination={pagination}
    setPagination={onPaginationChange}
    loadMoreData={formatMessage(messages.loadMore)}
    scroll={{ x: 'max-content' }}
  />
  ```

### Prop-spec rules (from Phase 2c — enforced per-component before writing):

**Before writing ANY Cap* component in Phase 4, do this 3-step check against the `prop-table`:**

```
STEP A — styled() pattern:
  Look up prop-table[CapX].styledPattern.
  If it contains ".attrs()" → MUST use styled(CapX).attrs(() => ({...})) pattern.
  NEVER pass those attrs as JSX props instead.
  NEVER override them via CSS properties.

STEP B — allowed props:
  Collect every prop you intend to pass to <CapX prop1 prop2 ...>.
  Each prop MUST appear in prop-table[CapX].antdProps OR prop-table[CapX].wrapperProps.
  If a prop is not listed → remove it. Do not pass it.
  Do not invent props by guessing from Figma node names or design intent.

  STEP B.1 — enriched props from layout-plan.json (only when LAYOUT_PLAN_PATH is set):
    Read layout-plan.json → screens[*].enrichedProps[<nodeId>] for the node
    you are currently emitting. Every key there has already been validated
    against prop-spec by hld-to-code Phase 5.6, but re-check locally:
      • key MUST exist in prop-table[CapX].antdProps ∪ wrapperProps
      • key MUST NOT collide with a key already emitted via recipe props or
        visualProps (those win)
    For each surviving enriched prop, emit it in JSX with a trailing
    provenance comment so Phase 7 can audit:
      <CapButton type="secondary" onClick={handleCreateCustomField}
        /* enriched: hld.actions.createCustomField */>
    Enriched props are the ONLY exception to "do not invent props" — they
    are not invented, they were proposed by Phase 5.6 against prop-spec
    with an HLD/API citation.

STEP C — caveats:
  Read every caveat in prop-table[CapX].caveats.
  Apply each caveat before writing the component.
  Common enforcements:
    CapRow      → ALWAYS include type="flex". Never use CSS justify-content/align-items.
    CapTab      → use panes=[{key,tab,content}] prop. NEVER use CapTab.TabPane children.
    CapTable    → NOT CapTab. Accepts dataSource+columns. NEVER use <table> HTML inside it.
    CapButton   → type prop values: "primary" | "secondary" | "link" only (from prop-spec).
    CapInput    → label/isRequired/errorMessage are wrapperProps, not antd props.
```

Only after all three steps pass for a given component may you write it.

- **Prop values come from the design token map** (Phase 1e), NOT from the recipe's `props` field. The recipe's inferred props (e.g. `gutter: 525`) are unreliable and must be ignored.
- **Use token variables, not raw hex values.** Import from `@capillarytech/cap-ui-library/styled/variables`. Write `color: ${CAP_G01}` not `color: #091e42`. If a hex has no token match (reported in Phase 1e), only then use the raw hex.

### CapTab API:
```jsx
// CORRECT — use panes prop
<CapTab
  activeKey={activeTab}
  onChange={setActiveTab}
  panes={[
    { key: 'tab1', tab: 'Tab Label', content: <TabContent /> },
  ]}
/>

// WRONG — do not use CapTab.TabPane children
<CapTab>
  <CapTab.TabPane key="tab1" tab="Tab Label">Content</CapTab.TabPane>
</CapTab>
```

### Resolution priority for UNMAPPED nodes:

1. **Compose from Cap* primitives** — combine CapRow, CapColumn, CapLabel, CapIcon, CapButton etc. into a custom component
2. **Mix Cap* + styled HTML** — when Cap* alone isn't sufficient (e.g. `styled.div` for a custom grid, `styled.svg` for an icon wrapper)
3. **BESPOKE component** — for nodes with `mappingStatus: "BESPOKE"` (named in Phase 2d Path C):

   Write a **standalone file** at `<targetPath>/<BespokeName>.js` — NOT inline inside the parent:

   ```js
   import styled from 'styled-components';
   import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
   const { CAP_G01, /* tokens from design token map */ } = styledVars;

   const Styled<BespokeName> = styled.div`
     /* geometry from fallback.htmlFallback (width, height, display) */
     /* colors from design token map — no raw hex */
   `;

   const <BespokeName> = ({ label, color, icon }) => (
     <Styled<BespokeName>>
       {/* internal Cap* composition from Phase 2d Path C prop list */}
     </Styled<BespokeName>>
   );

   export default <BespokeName>;
   ```

   Parent component imports it:
   ```js
   import <BespokeName> from './<BespokeName>';
   // <BespokeName label="Gold" color={CAP_COLOR_GOLD} />
   ```

4. **TODO marker** — only for genuinely impossible content (third-party embeds, canvas, WebGL):

```jsx
{/* TODO: [figmaNodeName] (node: [figmaNodeId]) — requires third-party library or custom implementation.
    Nearest Cap* composition attempted: [what you tried]. */}
{null}
```

### Absolute positioning warning:

```jsx
{/* TODO: absolute positioning lost — manual layout adjustment required */}
<CapColumn>
  {/* children rendered in flow order */}
</CapColumn>
```

### File size limit:

If the generated file would exceed **450 lines**, split into sub-component files:
- Place each sub-component in a separate file in the same directory
- Import them in the root component file
- Each file must independently pass the 450-line check

---

## Phase 5 — Audit (automated verification)

After generating, run these checks. Replace `$OUTPUT_FILE` with the actual path.

**Check 0: Reviewer Override propagation** (MANDATORY when `COMPONENT_PLAN_PATH` is set):

For every nodeId in `componentPlanMap` whose `targetComponent` differs from `recipe[nodeId].targetComponent`, verify the generated JSX emits the component-plan value (not the recipe value). Each generated node is tagged with a `// nodeId: <id>` comment (from Phase 4), so grep the file for each override's `nodeId` and confirm the preceding Cap* tag matches `componentPlanMap.get(nodeId)`.

```bash
# Pseudo-check. For each (nodeId, expectedCap, recipeCap) where expectedCap !== recipeCap:
#   1. Locate `// nodeId: <id>` in any file under <target-path>
#   2. Inspect the JSX element preceding/enclosing that comment
#   3. Confirm it is `<expectedCap …>` — NOT `<recipeCap …>`
```

If ANY override-mismatched node emits the recipe value instead of the component-plan value → **HALT** the audit and fail the run. Silent divergence defeats the purpose of Reviewer Overrides (Rule 2 of hld-to-code-agent.md).

Expected output table on pass:

```
| nodeId   | recipe       | component-plan | emitted      | status |
|----------|--------------|----------------|--------------|--------|
| 24:2784  | CapButton    | CapLinkButton  | CapLinkButton| ✅     |
| 24:2783  | CapLabel     | CapHeading     | CapHeading   | ✅     |
```

Any row where `emitted !== component-plan` is a hard fail.

**Check 1: Raw (unstyled) HTML tags** — these should NEVER appear in JSX:
```bash
grep -nE '<(div|span|p|table|tr|td|th|thead|tbody|button|input|ul|li|ol|a|h[1-6]|img|form|section|article|nav|header|footer|main|aside)[^a-zA-Z]' "$OUTPUT_FILE"
```
- **If matches found**: Each must be either replaced with a Cap* component OR wrapped with `styled()`.
  A raw `<div>` is a violation. A `<StyledWrapper>` (where `const StyledWrapper = styled.div`) is acceptable.

**Check 2: styled.htmlElement usage** — allowed as last resort, but verify each is justified:
```bash
grep -nE 'styled\.(div|span|p|table|tr|td|th|button|input|ul|li|ol|a|section|article|nav|header|footer|main|aside)' "$OUTPUT_FILE"
```
- **If matches found**: Verify each has a `// No Cap* equivalent — styled HTML` comment.
  If a Cap* component CAN replace it (e.g. `styled.div` that's just a vertical stack → use `styled(CapColumn)`), fix it.
  If no Cap* equivalent exists (e.g. SVG wrapper, custom grid), keep it.

**Check 3: Verify Cap* components are preferred** — count usage:
```bash
echo "Cap* components:" && grep -cE 'styled\(Cap' "$OUTPUT_FILE"
echo "styled HTML:" && grep -cE 'styled\.(div|span|p|section)' "$OUTPUT_FILE"
```
- Cap* count should be significantly higher than styled HTML count. If styled HTML dominates, review for missed Cap* opportunities.

**Check 4 (Phase 5c) — prop-spec gate** (MANDATORY — runs on ALL generated files before manifest is written):

For every `.js` / `.jsx` file written in Phase 4:

```bash
# Step 1: extract all Cap* component names used in the file
grep -oE '<Cap[A-Z][a-zA-Z]+' "$OUTPUT_FILE" | sort -u | sed 's/^<//'
```

For each component name found, read the derived prop-table written in Phase 2c (falling back to the full prop-spec.json if the derived file is missing or stale):

```bash
node -e "
const fs = require('fs');
const crypto = require('crypto');
const propTablePath = process.env.CACHE_DIR + '/prop-table.json';
const specPath = process.env.GARUDA_UI_PATH + '/tools/mapping-agent/src/registries/prop-spec.json';
const name = process.argv[1];

let componentSpec = null;
let source = 'prop-spec.json';

if (fs.existsSync(propTablePath)) {
  const pt = JSON.parse(fs.readFileSync(propTablePath, 'utf8'));
  // Staleness check: if prop-spec.json changed since Phase 2c, fall back to it
  const currentHash = crypto.createHash('sha256').update(fs.readFileSync(specPath)).digest('hex');
  if (pt.sourceSpecHash === 'sha256:' + currentHash && pt.components[name]) {
    componentSpec = pt.components[name];
    source = 'prop-table.json';
  }
}

if (!componentSpec) {
  const spec = require(specPath);
  const entry = spec[name];
  if (!entry) { console.log('NOT IN SPEC:', name); process.exit(1); }
  componentSpec = {
    allowedProps: [...Object.keys(entry.antdProps || {}), ...Object.keys(entry.wrapperProps || {})],
    caveats: entry.caveats || [],
    styledPattern: entry.styledPattern || null
  };
}

console.log('source:', source);
console.log('allowed:', componentSpec.allowedProps.join(', '));
componentSpec.caveats.forEach(c => console.log('CAVEAT:', c));
if (componentSpec.styledPattern) console.log('styledPattern:', componentSpec.styledPattern);
" GARUDA_UI_PATH="$GARUDA_UI_PATH" CACHE_DIR="$CACHE_DIR" -- CapButton
```

Rules enforced per component:
- **NOT IN SPEC** → HALT. Use `AskUserQuestion` to confirm the component name or request it be added to prop-spec.
- **Prop not in `antdProps` ∪ `wrapperProps`** → HALT. List every violation. Do NOT proceed to manifest.
- **Caveats** → parse and verify each is satisfied (e.g. CapTab must use `panes={[...]}`, CapRow must have `type="flex"`, CapButton `type` ∈ `["primary","secondary","link"]`).
- **`styledPattern`** → verify the component is wrapped in a `styled(CapX).attrs(...)` call, not passed props directly.

On pass: log `✓ prop-spec: <ComponentName> — OK`
On fail: log `PROP-SPEC VIOLATION: <file> — <ComponentName> uses prop <propName> not in spec` then HALT.

**Do NOT write the manifest until all files show `✓ prop-spec: … — OK`.**

---

## Component Rules Reference

### Prefer Cap* components over raw HTML

Always try cap-ui-library components from `@capillarytech/cap-ui-library` first:

| Pattern | Component |
|---------|-----------|
| Vertical stack | `CapColumn` |
| Horizontal stack | `CapRow` with `gutter` |
| Card / panel | `CapCard` |
| Tabs | `CapTab` with `panes` prop |
| Table / data grid | `CapTable` |
| Button | `CapButton` with `type="primary"/"secondary"` |
| Icon | `CapIcon` with `type` prop |
| Text label | `CapLabel` |
| Input | `CapInput` |
| Dropdown | `CapDropdown` |
| Divider | `CapDivider` |
| Skeleton loader | `CapSkeleton` |
| Spinner | `CapSpin` |
| Tooltip | `CapTooltip` |
| Checkbox | `CapCheckbox` |
| Radio | `CapRadio` |
| Switch | `CapSwitch` |

### Composition Patterns Lookup Table

| Figma Pattern | How to Recognize | BlazeUI Composition |
|---------------|-----------------|---------------------|
| Badge / Tag | Small frame, text + fill + border-radius | `styled(CapLabel)` with background, border-radius, padding |
| Metric Card | Frame with large number text + small description | `CapCard > CapColumn > CapLabel(value) + CapLabel(desc)` |
| Header Bar | Horizontal frame: title on left, buttons on right | `CapRow justify="space-between" > CapLabel + CapRow(buttons)` |
| Status Indicator | Small dot/circle + text | `CapRow gutter={8} > styled(CapIcon) + CapLabel` |
| Avatar | Circle image/icon, typically 32–48px | `styled(CapIcon)` with `border-radius: 50%` |
| Progress Bar | Filled rect inside container rect | `styled(CapRow)` with width% + background-color |
| Breadcrumb | Horizontal text items with separators | `CapRow > [CapLabel + CapIcon(type="chevron-right")]...` |
| Empty State | Centered: icon + message + action button | `CapColumn align="center" > CapIcon + CapLabel + CapButton` |
| Stat/KPI Widget | Icon + number + label in a card | `CapCard > CapRow > CapColumn(icon) + CapColumn(CapLabel + CapLabel)` |
| Sidebar / Nav | Vertical list of clickable items | `CapColumn > [CapRow > CapIcon + CapLabel]...` or `CapMenu` |
| Search Bar | Input with icon and/or button | `CapRow > CapInput.Search` or `CapRow > CapIcon + CapInput` |
| Toggle Group | Horizontal row of toggle options | `CapRow > CapRadio.Group` or `CapRow > [CapButton]...` |
| Info Tooltip | Icon with tooltip on hover | `CapTooltipWithInfo` |
| Section Divider | Horizontal line between sections | `CapDivider` |

### Fallback Priority Chain

When no composition pattern matches an UNMAPPED node, use this chain in order:

1. Recipe has `fallback.nearestComponent` → use it with `styled(NearestComponent)`
2. Node is TEXT → `CapLabel`
3. Square node with no children (width ≈ height within 20%) → `styled(CapIcon)`
4. Node height < 52px + HORIZONTAL layout + ≤3 children → `styled(CapButton)`
5. Node has exactly 1 TEXT child → `styled(CapLabel)` wrapper
6. Node has children + HORIZONTAL layout → `CapRow`
7. Node has children + VERTICAL layout → `CapColumn`
8. Wide node (>300px) with fills + many children → `CapCard`
9. Node has fills + children → `CapCard`
10. Leaf node (no children, no layout) → `styled(CapLabel)` for text-like, `styled(CapRow)` for box-like
11. No Cap* primitive fits → compose from Cap* primitives (CapRow + CapColumn + CapLabel etc.)
12. Cap* composition insufficient → use `styled.div` / `styled.span` etc. with comment `// No Cap* equivalent — styled HTML`
13. Genuinely impossible (third-party embed, canvas, WebGL) → `null` + TODO comment

### Component Resolution Priority

Always try Cap* first. Use styled HTML only when Cap* is insufficient.

| Need | First choice (Cap*) | Last resort (styled HTML) |
|------|---------------------|---------------------------|
| Vertical stack | `styled(CapColumn)` | `styled.div` with flex-direction: column |
| Horizontal stack | `styled(CapRow)` | `styled.div` with flex-direction: row |
| Text | `styled(CapLabel)` | `styled.span` |
| Paragraph | `styled(CapLabel)` | `styled.p` |
| Button | `styled(CapButton)` | `styled.button` |
| Data table | `CapTable` | `styled.table` |
| Image | `styled(CapIcon)` or `CapImage` | `styled.img` |
| SVG container | — (no Cap* equivalent) | `styled.div` or `styled.svg` |
| Custom grid layout | — (CapRow/CapColumn insufficient) | `styled.div` with CSS grid |
| Canvas/WebGL | — (no Cap* equivalent) | `styled.canvas` |

When using styled HTML, always add: `// No Cap* equivalent — styled HTML`

---

## Route & Loadable

If `--route` flag is set, after Phase 5:

1. Create `app/components/pages/<ComponentName>/index.js`:
```js
export { default } from './Loadable';
```

2. Create `app/components/pages/<ComponentName>/Loadable.js`:
```js
import CapSpin from '@capillarytech/cap-ui-library/CapSpin';
import { loadable } from '@capillarytech/cap-ui-utils';
import { withCustomAuthAndTranslations } from '@capillarytech/vulcan-react-sdk/utils';
import React, { Suspense } from 'react';

const LoadableComponent = loadable(() => import('./<ComponentName>'));

const <ComponentName>Loadable = () => (
  <Suspense fallback={<CapSpin />}>
    <LoadableComponent />
  </Suspense>
);

export default withCustomAuthAndTranslations(<ComponentName>Loadable);
```

3. Add to `app/components/pages/App/routes.js`:
```js
{
  exact: true,
  path: `/your/path`,
  type: 'dashboard',
  component: lazy(() => import('../<ComponentName>')),
},
```

**Do NOT** use `React.lazy` directly in `index.js` — always use the `loadable` + `withCustomAuthAndTranslations` pattern.

---

## Mapping Agent Location

```
tools/mapping-agent/
  src/
    cli.ts                  — CLI commands (resolve-metadata, validate-registry, list-components, generate-prop-spec)
    resolver.ts             — core resolution engine + buildFallback heuristics
    prop-spec-generator.ts  — orchestrates prop-spec.json generation from Cap* library scan
    vision-resolver.ts      — Claude vision API resolver for UNMAPPED nodes
    utils/
      metadata-parser.ts    — get_metadata XML → FigmaNode converter
      jsx-parser.ts         — get_design_context JSX → node enrichment
      figma-screenshot.ts   — Figma REST API screenshot download
      antd-type-reader.ts   — reads antd .d.ts files → extracts prop interfaces
      cap-component-analyzer.ts — analyzes Cap* JS source → detects antd wrapping, spread, styled aliases
    registries/
      component-mappings.json  — component name mapping entries
      token-mappings.json      — Figma hex → blaze CSS variable mapping
      prop-spec.json           — generated prop API spec per Cap* component (antdProps + wrapperProps + caveats)
  dist/
    cli.js                  — compiled CLI

Recipe output: claudeOutput/figma-mapping-report/<nodeId>.recipe.json

To regenerate prop-spec.json after cap-ui-library updates:
  node tools/mapping-agent/dist/cli.js generate-prop-spec \
    --library-path node_modules/@capillarytech/cap-ui-library \
    --output tools/mapping-agent/src/registries/prop-spec.json
```
