# High-Level Design: {{FEATURE_NAME}}

> **Generated**: {{TIMESTAMP}}  
> **PRD Source**: {{PRD_SOURCE}}  
> **Architecture Reference**: `.claude/output/architecture.md`

---

## 1. Feature Overview

<!-- Describe the feature at a business level.
     Cover: what it does, who uses it, what problem it solves.
     Define explicit scope boundaries (in-scope and out-of-scope).
     This section should be understandable by non-technical stakeholders. -->

### Feature Name
{{FEATURE_NAME}}

### Description & Business Purpose
{{FEATURE_DESCRIPTION}}

### Problem Statement
{{PROBLEM_STATEMENT}}

### Target Users
{{TARGET_USERS}}

### Scope

**In Scope**:
{{IN_SCOPE}}

**Out of Scope**:
{{OUT_OF_SCOPE}}

---

## 2. Technical Objective

<!-- What this design aims to achieve technically.
     Cover: scalability, maintainability, and performance goals.
     Explain how this feature fits into the existing React + Redux-Saga architecture.
     Reference architecture.md for alignment context. -->

### Technical Goals
{{TECHNICAL_GOALS}}

### Architecture Fit
{{ARCHITECTURE_FIT}}

---

## 3. Impact Analysis

<!-- Categorize all artifacts being created or modified.
     Use tables for clarity. Mark new vs modified items.
     Reference real component names from the codebase where applicable. -->

### New Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| {{COMPONENT_NAME}} | {{atom/molecule/organism/page}} | {{FILE_PATH}} | {{PURPOSE}} |

### Modified Components

| Component | Location | Change Description |
|-----------|----------|--------------------|
| {{COMPONENT_NAME}} | {{FILE_PATH}} | {{WHAT_CHANGES}} |

### New Redux Domains

| Domain | Inject Key | Reducer | Saga | Purpose |
|--------|-----------|---------|------|---------|
| {{DOMAIN_NAME}} | {{INJECT_KEY}} | {{REDUCER_FILE}} | {{SAGA_FILE}} | {{PURPOSE}} |

### New Routes

| Route Path | Component | Auth Required | Description |
|------------|-----------|---------------|-------------|
| {{ROUTE_PATH}} | {{COMPONENT}} | {{YES/NO}} | {{DESCRIPTION}} |

### Shared Utilities / Hooks

| Name | Location | New/Modified | Purpose |
|------|----------|-------------|---------|
| {{UTILITY_NAME}} | {{FILE_PATH}} | {{NEW/MODIFIED}} | {{PURPOSE}} |

---

## 4. UI/UX Changes

<!-- For EACH major screen:
     1. Describe the screen purpose and navigation flow
     2. Map React component boundaries with responsibilities
     3. Fill the Component Recipe table from the figma-node-mapper sectionComponentMap
     4. Link user interactions to dispatched Redux actions
     5. Include one ASCII architecture diagram showing:
        - Component hierarchy (nesting)
        - Component type (atom/molecule/organism/page)
        - Redux state connections (which selector feeds which component)
        - Saga triggers (which user action triggers which saga)
        RULE: Every leaf-level Cap* component in the diagram must appear in the Component Recipe table above.
              Use recipe targetComponent values — do not invent or substitute component names.

     Example ASCII diagram format:

     ┌─────────────────────────────────────────────────────┐
     │ FeatureListPage (page)                              │
     │ Route: /feature-list                                │
     │ Redux: featureListReducer                           │
     │                                                     │
     │ ┌─────────────────────────────────────────────────┐ │
     │ │ CapHeader                                       │ │
     │ │ [Title] [CapButton: Create → /feature/new]      │ │
     │ └─────────────────────────────────────────────────┘ │
     │                                                     │
     │ ┌──────────────┐ ┌──────────────────────────────┐  │
     │ │ FilterPanel  │ │ FeatureTable (organism)       │  │
     │ │ (molecule)   │ │ Redux ← featureList selector  │  │
     │ │              │ │ Saga ← fetchFeatureListSaga   │  │
     │ │ dispatch:    │ │                               │  │
     │ │ SET_FILTERS  │ │ ┌─────────────────────────┐  │  │
     │ │              │ │ │ FeatureRow (molecule)    │  │  │
     │ │              │ │ │ [Name] [Status] [Edit]   │  │  │
     │ └──────────────┘ │ └─────────────────────────┘  │  │
     │                  └──────────────────────────────┘  │
     └─────────────────────────────────────────────────────┘
-->

### Screen Flow
{{SCREEN_FLOW_DESCRIPTION}}

### Screen: {{SCREEN_NAME}}

**Route**: {{ROUTE_PATH}}  
**Purpose**: {{SCREEN_PURPOSE}}

**Component Boundaries**:
{{COMPONENT_BOUNDARIES}}

**Component Recipe** *(recipe-verified from figma-node-mapper — review and correct before code generation)*:

| UI Section | Cap* Component | Node ID | Recipe Status | Reviewer Override |
|------------|----------------|---------|---------------|-------------------|
| {{SECTION_NAME}} | {{CAP_COMPONENT}} | {{FIGMA_NODE_ID}} | EXACT / PARTIAL / RESOLVED / BESPOKE / ASSUMED | *(leave blank or enter correct component)* |

*Recipe source*: `claudeOutput/figma-capui-mapping/{{NODE_ID}}.recipe.json`  
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/{{NODE_ID}}/prop-spec-notes.json`

> **Note**: Every Cap* component listed in the ASCII diagram below must appear in this table.
> To correct a component assignment, fill the "Reviewer Override" column — that value is authoritative for code generation.
> If the HLD agent overrides a recipe mapping (e.g., component is structurally incompatible with the Figma layout), the Reviewer Override column MUST be populated — prose Notes alone are not consumed by downstream code generation.

**User Interactions → Redux Actions**:

| User Action | Component | Dispatched Action | Saga Triggered |
|-------------|-----------|-------------------|----------------|
| {{ACTION}} | {{COMPONENT}} | {{ACTION_TYPE}} | {{SAGA_NAME}} |

**Architecture Diagram**:
```
{{ASCII_DIAGRAM}}
```

[See: {{SCREEN_NAME}}]({{PROTOTYPE_URL}})

---

## 5. Directory Structure

<!-- Provide the EXACT folder and file structure.
     Use a code block with tree format.
     Include every new file: components, hooks, services, sagas, types, selectors.
     Follow garuda-ui conventions: Atomic Design, Redux co-location.
     Use naming conventions consistent with existing codebase. -->

```
app/components/
├── pages/
│   └── {{PageName}}/
│       ├── index.js              # Route entry, injectReducer, injectSaga
│       ├── Loadable.js           # Dynamic import
│       ├── {{PageName}}.js       # Main component with connect()
│       ├── constants.js          # Action type constants
│       ├── actions.js            # Action creators
│       ├── reducer.js            # Reducer with fromJS() initial state
│       ├── selectors.js          # Reselect memoized selectors
│       └── saga.js               # Saga watchers and workers
├── organisms/
│   └── {{OrganismName}}/
│       ├── index.js
│       ├── {{OrganismName}}.js
│       ├── constants.js          # (if organism has own Redux state)
│       ├── actions.js
│       ├── reducer.js
│       ├── selectors.js
│       └── saga.js
├── molecules/
│   └── {{MoleculeName}}/
│       └── index.js
└── atoms/
    └── {{AtomName}}/
        └── index.js
```

### Naming Conventions
{{NAMING_CONVENTIONS}}

---

## 6. API Structure

<!-- For each API call: endpoint, method, request, response, validation, errors.
     If API spec is from the PRD, document as-is.
     If API spec is ASSUMED, mark clearly with [ASSUMED].
     Use consistent table format for machine-readability. -->

### API: {{API_NAME}}

**Status**: {{confirmed / [ASSUMED]}}

| Field | Value |
|-------|-------|
| Endpoint | `{{ENDPOINT_PATH}}` |
| Method | `{{HTTP_METHOD}}` |
| Auth | {{YES/NO}} |

**Request Payload**:
```json
{{REQUEST_PAYLOAD}}
```

**Response Payload**:
```json
{{RESPONSE_PAYLOAD}}
```

**Validation Rules**:
{{VALIDATION_RULES}}

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| {{CODE}} | {{ERROR_NAME}} | {{DESCRIPTION}} |

---

## 7. Data and State Management Overview

<!-- Define Redux store shape using Immutable.js conventions.
     List all reducers, actions, and selectors.
     Define saga orchestration: trigger → API → success/failure.
     Decide local state vs Redux state for each data point with rationale. -->

### Redux Store Shape

```javascript
// Inject key: ${CURRENT_APP_NAME}-{{slice-name}}
fromJS({
  {{INITIAL_STATE}}
})
```

### Actions

| Action Type | Creator | Purpose |
|-------------|---------|---------|
| `{{ACTION_TYPE}}` | `{{actionCreator}}()` | {{PURPOSE}} |

### Selectors

| Selector | State Path | Returns |
|----------|-----------|---------|
| `{{selectorName}}` | `{{state.path}}` | {{RETURN_TYPE}} |

### Saga Orchestration

| Saga | Trigger Action | API Call | On Success | On Failure | Concurrency |
|------|---------------|----------|------------|------------|-------------|
| `{{sagaName}}` | `{{TRIGGER}}` | `{{apiMethod}}` | `{{SUCCESS_ACTION}}` | `{{FAILURE_ACTION}}` | `{{takeLatest/takeEvery}}` |

### Local State vs Redux State

| Data Point | Storage | Rationale |
|-----------|---------|-----------|
| {{DATA_POINT}} | {{Local/Redux}} | {{WHY}} |

---

## 8. Validation

<!-- Form and input validation rules per screen.
     Client-side logic overview.
     Server-side validation handling approach. -->

### Client-Side Validation

| Screen | Field | Rule | Message |
|--------|-------|------|---------|
| {{SCREEN}} | {{FIELD}} | {{RULE}} | {{ERROR_MESSAGE}} |

### Server-Side Validation Handling
{{SERVER_VALIDATION_APPROACH}}

---

## 9. Reusable Patterns and Shared Utilities

<!-- List existing components/hooks/utilities to reuse.
     Identify new shared patterns this feature introduces. -->

### Existing to Reuse

| Component/Utility | Location | Usage in This Feature |
|-------------------|----------|-----------------------|
| {{NAME}} | {{PATH}} | {{HOW_USED}} |

### New Patterns Introduced
{{NEW_PATTERNS}}

---

## 10. Dependencies

<!-- Internal modules, external APIs, third-party libraries. -->

### Internal Module Dependencies

| Module | Purpose | Status |
|--------|---------|--------|
| {{MODULE}} | {{PURPOSE}} | {{existing/new}} |

### External API Dependencies

| API | Purpose | Status |
|-----|---------|--------|
| {{API}} | {{PURPOSE}} | {{confirmed / [ASSUMED]}} |

### Third-Party Libraries
{{THIRD_PARTY_LIBS}}

---

## 11. Risks and Considerations

<!-- Technical risks with severity and mitigation.
     Architectural risks or deviations.
     Known unknowns. -->

| Risk | Severity | Mitigation |
|------|----------|------------|
| {{RISK}} | {{High/Medium/Low}} | {{MITIGATION}} |

### Architectural Deviations
{{DEVIATIONS}}

### Known Unknowns
{{UNKNOWNS}}

---

## 12. Non-Functional Requirements

<!-- Performance: render optimisation, memoisation.
     Scalability: how design holds up as data/users grow.
     Accessibility considerations. -->

### Performance
{{PERFORMANCE_CONSIDERATIONS}}

### Scalability
{{SCALABILITY_CONSIDERATIONS}}

### Accessibility
{{ACCESSIBILITY_CONSIDERATIONS}}

---

## 13. Testing Strategy Overview

<!-- Key scenarios to cover.
     Components and sagas needing unit tests.
     Integration test considerations. -->

### Key Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| {{SCENARIO}} | {{happy-path/edge-case/error}} | {{High/Medium/Low}} |

---

## 14. Architecture Alignment Notes

<!-- How this HLD aligns with .claude/output/architecture.md.
     How this HLD aligns with .claude/output/loyalty-promotions-system-map.md.
     Deviations from existing patterns with justification. -->

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| {{CONVENTION}} | {{aligned/deviated/new_pattern}} | {{JUSTIFICATION}} |

### Alignment with System Map Patterns
{{SYSTEM_MAP_ALIGNMENT}}

### Deviations and Justifications
{{DEVIATIONS_JUSTIFIED}}

---

## 15. Open Questions and Decisions Needed

<!-- Unresolved design questions.
     Decisions needed before LLD can begin. -->

| # | Question | Impact | Owner | Status | comment
|---|----------|--------|-------|--------|--------
| {{NUM}} | {{QUESTION}} | {{IMPACT}} | {{OWNER}} | {{open/resolved}} | '' |

---

## 16. Figma Naming Improvements

<!-- Generated by cross-referencing Section 3 New Components against recipe.json figmaComponentName values.
     Purpose: help the designer identify Figma frames that should be renamed to match Section 3 component
     names (PascalCase), so the next decomposition run (hld-to-code Phase 5a) is deterministic. -->

The decomposition step (hld-to-code Phase 5a) assigns Figma nodes to target files (organisms, molecules) by matching HLD Section 3 component names against Figma frame names. When frame names match the PascalCase component name exactly, matching is deterministic — no fuzzy keyword search, no `AskUserQuestion`, no tree-walking inference.

Below are frames where a rename would remove ambiguity in the next decomposition run:

| Current Figma Frame Name | Node ID | Proposed Rename | Section 3 Component | Why Rename |
|--------------------------|---------|-----------------|---------------------|-----------|
| {{CURRENT_FRAME_NAME}} | {{NODE_ID}} | `{{PROPOSED_NAME}}` | {{SECTION3_COMPONENT}} | {{REASON}} |

**How to rename**: open `figma.com/design/<fileKey>/?node-id=<NodeID>` → select the frame → press `F2` → type the proposed PascalCase name (matching Section 3 exactly).

After renaming, re-run `hld-to-code` — decomposition.json is produced deterministically and `AskUserQuestion` prompts for ambiguous node assignment disappear.

> **Note**: this section is unrelated to the `Custom_` prefix BESPOKE signal. `Custom_` forces BESPOKE for nodes NOT listed in Section 3 (standalone custom visual primitives). Section 16 addresses a different problem — making decomposition match Section 3 components reliably.

---

## Metadata

- **Feature**: {{FEATURE_NAME}}
- **PRD Source**: {{PRD_SOURCE}}
- **Generated by**: hld-generator agent
- **Timestamp**: {{TIMESTAMP}}
- **Architecture Reference**: `.claude/output/architecture.md`
- **System Map Reference**: `.claude/output/loyalty-promotions-system-map.md`
- **Figma Recipes**: `claudeOutput/figma-capui-mapping/<nodeId>.recipe.json` *(one per Figma screen)*
- **Prop-Spec Notes**: `claudeOutput/figma-capui-mapping/<nodeId>/prop-spec-notes.json` *(one per Figma screen)*
