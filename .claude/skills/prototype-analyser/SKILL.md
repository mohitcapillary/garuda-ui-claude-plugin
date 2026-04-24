---
name: prototype-analyser
description: Traverses prototype and design links from a PRD, extracting screen structure, navigation flows, and component boundaries, generating ASCII architecture diagrams per screen
triggers:
  - "analyse prototype"
  - "traverse design"
  - "extract screens from prototype"
---

# Prototype Analyser Skill

This skill traverses prototype and design links extracted by the prd-parser skill. For each screen, it extracts UI structure, navigation flows, component boundaries, and generates ASCII architecture diagrams showing component hierarchy linked to Redux state and saga triggers.

## Input

A list of prototype/design URLs from the prd-parser output. If the list is empty, this skill operates in **requirements-only mode**.

## Prototype Traversal

### Figma URLs

For URLs matching `figma.com/design/`, `figma.com/file/`, or `figma.com/proto/`:

1. **Run the figma-node-mapper skill** (REQUIRED — this is a blocking step):
   Read and follow `.claude/skills/figma-node-mapper/SKILL.md` in full.
   - This skill fetches the metadata XML, design context, and screenshot; runs the mapping agent CLI; resolves UNMAPPED nodes; looks up prop-spec; and writes all intermediates to `claudeOutput/figma-capui-mapping/<nodeId>/`.
   - Output: `sectionComponentMap`, `designTokenMap`, `recipeFilePath`, `propSpecPath`.
   - If the skill fails because Figma is inaccessible: mark `[ASSUMED - Figma inaccessible]` and derive from spec requirements only.

2. **Use the `sectionComponentMap` as the authoritative source** of Cap* component names:
   - Do NOT derive component names from the design context JSX or from visual inference alone.
   - Every Cap* component cited in component boundaries and ASCII diagrams for this screen MUST come from `sectionComponentMap`.
   - If a visible UI section has no recipe mapping, label it `[ASSUMED]`.

3. **Navigate through all pages/frames** in the Figma file:
   - Each frame or page represents a screen in the application
   - Map transitions between frames (which button goes where)

### Non-Figma URLs (InVision, Zeplin, Live Prototypes)

For other prototype URLs:

1. Use `WebFetch` to load the page content
2. Parse the HTML structure for UI hierarchy clues
3. Follow navigation links to discover additional screens
4. If the page requires authentication or is inaccessible, mark as `[ASSUMED - Prototype inaccessible]`

### Interactive Prototypes (Click-Triggered Content)

Some prototype URLs (e.g., v0/Vercel apps, Storybook, React demos) require user interaction — clicking buttons, icons, or menu items — to reveal screens like drawers, modals, or panels. `WebFetch` retrieves only the initial page load and **cannot trigger interactions**.

When a PRD specifies interaction steps to reach a screen (e.g., "click the pencil icon on a tier card"):
1. Attempt `WebFetch` for the base URL — extract whatever static structure is available (page layout, visible cards, navigation)
2. Document the limitation explicitly in the HLD for that screen:
   ```
   [ASSUMED - Interactive prototype: drawer/modal content not reachable via static fetch.
   UI structure derived from spec acceptance scenarios FR-XXX through FR-XXX.]
   ```
3. Use the PRD's acceptance scenarios and functional requirements as the **authoritative source** for that screen's field list, section order, conditional controls, and interaction model
4. Mark the resulting screen section and ASCII diagram with `[ASSUMED - spec-derived]`

Do NOT silently use `WebFetch` partial content as if it fully captured an interactive screen. Always surface the limitation.

### Requirements-Only Mode

If no prototype links were provided:

1. Derive screen structure from PRD requirements and user stories
2. Reference similar existing features in the target app codebase:
   - Read `.claude/output/architecture.md` for existing page patterns
   - Use Glob to find similar feature pages: `app/components/pages/*/index.js`
3. Mark ALL screen-level architecture decisions with `[ASSUMED]`
4. Still generate ASCII diagrams based on inferred component structure

## Per-Screen Extraction

For each screen discovered (from prototype or inferred from requirements):

### Step 1: Screen Identity

- **Screen name**: Descriptive name (e.g., "Feature List", "Feature Configuration")
- **Route path**: Proposed route (e.g., `/feature-list`, `/feature/new`)
- **Purpose**: What the user does on this screen

### Step 2: UI Section Mapping

Identify major UI sections:
- **Header**: Title, action buttons, breadcrumbs
- **Sidebar/Filters**: Filter panels, navigation menus
- **Main content**: Tables, forms, cards, detail views
- **Modals/Drawers**: Overlay components triggered by actions
- **Footer**: Pagination, summary information

### Step 3: Component Boundary Identification

Map each UI section to a React component following Atomic Design:
- **Pages**: Full-screen containers with routing, Redux connection, and saga injection
- **Organisms**: Complex feature components, may have own Redux state. Examples: configuration forms, data tables with embedded filters
- **Molecules**: Compositions of atoms with specific behaviour. Examples: filter panels, form groups, table rows
- **Atoms**: Basic UI elements from `@capillarytech/cap-ui-library`. Examples: CapButton, CapInput, CapSelect, CapRow, CapColumn

### Step 4: Interaction Flow Mapping

For each interactive element:
- What user action triggers it (click, submit, change, mount)
- What Redux action it dispatches
- What saga it triggers (if async)
- What state changes result
- Where it navigates (if navigation action)

### Step 5: State-Dependent UI

Identify UI that changes based on state:
- **Loading states**: Spinners, skeletons while data fetches
- **Empty states**: What shows when no data exists
- **Error states**: What shows when API calls fail
- **Permission states**: What shows/hides based on user role
- **Mode states**: Create vs Edit vs View modes

## ASCII Diagram Generation

### Step 0: Screenshot Cross-Check (BEFORE drawing the diagram)

Before generating the ASCII diagram for any screen:

**For Figma-linked screens:**
1. Describe in 2-3 sentences what the screenshot (viewed during figma-node-mapper Step 2) shows (layout type, major sections, key controls)
2. Confirm the `sectionComponentMap` from the recipe covers the sections visible in the screenshot
3. If a visible section has no recipe entry, mark it `[ASSUMED]` in the diagram
4. Every Cap* component name in the diagram must appear in `sectionComponentMap` — do not substitute or invent component names
5. Only then draw the ASCII diagram

**For interactive-prototype screens (spec-derived):**
State: `[ASSUMED - spec-derived: No interactive content fetchable. Diagram based on FR-XXX through FR-XXX.]`

**For requirements-only screens (no prototype):**
State: `[ASSUMED - no prototype available. Diagram based on PRD requirements.]`

For each major screen, generate an ASCII architecture diagram. Follow this format:

```
┌─────────────────────────────────────────────────────────┐
│ ScreenName (page)                                        │
│ Route: /route-path                                       │
│ Redux: sliceNameReducer                                  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ CapHeader                                            │ │
│ │ [Title] [CapButton: Action → /target-route]          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────┐  ┌─────────────────────────────────┐   │
│ │ FilterPanel  │  │ DataTable (organism)             │   │
│ │ (molecule)   │  │ Redux ← dataListSelector         │   │
│ │              │  │ Saga ← fetchDataListSaga          │   │
│ │ dispatch:    │  │                                   │   │
│ │ SET_FILTERS  │  │ ┌─────────────────────────────┐  │   │
│ │              │  │ │ DataRow (molecule)           │  │   │
│ │              │  │ │ [Field1] [Field2] [Actions]  │  │   │
│ └──────────────┘  │ └─────────────────────────────┘  │   │
│                   └─────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ CapPagination                                        │ │
│ │ dispatch: SET_PAGE                                   │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Diagram Rules

1. **Max width**: 100 characters (must not wrap)
2. **Show nesting**: Use box-drawing characters (`┌ ─ ┐ │ └ ┘`) for component hierarchy
3. **Label component type**: `(page)`, `(organism)`, `(molecule)`, `(atom)` after component name
4. **Show Redux connections**: `Redux ← selectorName` for components connected to Redux
5. **Show saga triggers**: `Saga ← sagaName` for components that trigger sagas
6. **Show dispatched actions**: `dispatch: ACTION_TYPE` for user interactions
7. **Show navigation**: `→ /target-route` for navigation actions
8. **One diagram per major screen**: List, Detail, Form, Config screens each get a diagram
9. **Prototype link required**: Immediately after every ASCII diagram block, add a prototype screen link on its own line in this exact format:
   `[See: {Screen Name}]({prototype-url-or-figma-frame-url})`
   - For Figma: use the direct frame URL (e.g., `https://www.figma.com/design/{fileKey}?node-id={nodeId}`)
   - For other prototypes: use the screen's URL
   - For requirements-only mode (no prototype): use `[See: {Screen Name}](no prototype available)`

## Output

The output is a mental model the agent carries forward containing:
1. **Screen inventory**: List of all screens with names, routes, purposes
2. **Component map**: Per-screen component hierarchy with types
3. **Interaction map**: Per-screen user actions linked to Redux actions and sagas
4. **ASCII diagrams**: One per major screen
5. **Prototype links**: One `[See: Screen Name](url)` per screen, immediately following its ASCII diagram
6. **Navigation flow**: How screens connect to each other
7. **Assumption markers**: All `[ASSUMED]` decisions documented
