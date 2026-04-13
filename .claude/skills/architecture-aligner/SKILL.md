---
name: architecture-aligner
description: Validates a generated HLD against existing architecture conventions and system mapping patterns, flagging deviations and updating the Architecture Alignment Notes section
triggers:
  - "validate architecture alignment"
  - "check HLD alignment"
  - "architecture review"
---

# Architecture Aligner Skill

This skill validates a generated HLD document against the existing garuda-ui architecture documented in `.claude/output/architecture.md` and the system mapping patterns in `.claude/output/loyalty-promotions-system-map.md`. It updates the Architecture Alignment Notes section (section 14) of the HLD with findings.

## Input

A draft HLD document (output of hld-writer skill) with section 14 left as placeholder.

## Validation Process

### Step 1: Load Reference Documents

1. Read `.claude/output/architecture.md` and extract the conventions list
2. Read `.claude/output/loyalty-promotions-system-map.md` and extract:
   - Redux store shape patterns (Immutable.js `fromJS()` usage)
   - Saga patterns (concurrency model, trigger → API → dispatch chain)
   - Component composition patterns (connect, compose, HOC chain)
   - Redux inject key naming pattern (`${CURRENT_APP_NAME}-<slice-name>`)

### Step 2: Convention Checklist

Validate the HLD against each garuda-ui convention:

#### 2a. Atomic Design Hierarchy
- **Convention**: Components are classified as atoms, molecules, organisms, pages, or templates
- **Check**: Does the HLD correctly classify each new component? Are organisms used for complex feature components with Redux? Are molecules used for reusable compositions?
- **Reference**: architecture.md "Atomic Component Inventory" section

#### 2b. Cap-* Component Mandate
- **Convention**: All UI components should use `Cap-*` pattern components from `@capillarytech/cap-ui-library`
- **Check**: Does the HLD reference Cap-* components (CapRow, CapColumn, CapButton, CapInput, CapSelect, etc.) for layouts and base UI?
- **Reference**: architecture.md "Architectural Conventions" section

#### 2c. CapRow/CapColumn Layout Convention
- **Convention**: Use `CapRow` / `CapColumn` for layouts instead of raw CSS flexbox
- **Check**: Do ASCII diagrams and component descriptions reference CapRow/CapColumn for layout structure?

#### 2d. Redux File Co-location
- **Convention**: `constants.js`, `actions.js`, `reducer.js`, `selectors.js`, `saga.js` live in the same directory as the component
- **Check**: Does the Directory Structure section show Redux files co-located with their page/organism?
- **Reference**: architecture.md "Data Flow" section

#### 2e. Dynamic Reducer/Saga Injection
- **Convention**: Feature pages register their own reducers and sagas at mount time via HOCs (`injectReducer`, `injectSaga` from Vulcan SDK)
- **Check**: Does the HLD describe dynamic injection for new feature pages?
- **Reference**: architecture.md "Data Flow" section

#### 2f. Immutable.js State Conventions
- **Convention**: Redux state uses `fromJS()` for initial state, selectors use `.get()` / `.getIn()` / `.toJS()`
- **Check**: Does the Data and State Management section show `fromJS({})` for initial state?
- **Reference**: system-map "Redux Store Mapping" section

#### 2g. Styled-Components for Styling
- **Convention**: Styling is done with styled-components
- **Check**: Does the HLD reference styled-components for custom styling (not raw CSS or CSS modules)?

#### 2h. ESLint 500-Line Limit
- **Convention**: Max 500 lines per file, max complexity 10
- **Check**: Are any proposed components likely to exceed 500 lines? If so, has the HLD planned for splitting?
- **Reference**: CLAUDE.md "Code Constraints" section

#### 2i. Saga Concurrency Model
- **Convention**: `takeLatest` for most data fetching sagas, `takeEvery` only when parallel execution is needed
- **Check**: Does the Saga Orchestration table use appropriate concurrency models?
- **Reference**: system-map "Redux Saga Mapping" section

#### 2j. Redux Inject Key Pattern
- **Convention**: `${CURRENT_APP_NAME}-<slice-name>` for reducer inject keys
- **Check**: Do the proposed inject keys follow this naming pattern?
- **Reference**: system-map "Redux Store Mapping" section

#### 2k. Compose Pattern
- **Convention**: `compose(withRouter, withReducer, withSaga, withConnect, withMemo)` at bottom of connected components
- **Check**: Does the HLD describe using the compose pattern for connected page components?
- **Reference**: system-map "Component Mapping" section

### Step 3: Classify Each Finding

For each convention checked, classify as:

| Status | Meaning |
|--------|---------|
| **aligned** | HLD follows the convention correctly |
| **deviated** | HLD departs from the convention -- requires justification |
| **new_pattern** | HLD introduces a pattern not in existing architecture -- requires documentation |

### Step 4: Justify Deviations

For each deviation or new pattern:
1. State what the HLD does differently
2. Explain why (technical necessity, PRD requirement, or improvement)
3. Assess risk level: High (breaks existing patterns), Medium (minor divergence), Low (isolated change)
4. Propose mitigation if risk is Medium or High

### Step 5: Cross-Reference System Map Patterns

Compare the HLD's data flow design against the system-map examples:
- Does the saga flow follow the same trigger → API → dispatch chain?
- Are selector patterns consistent (Reselect, memoised)?
- Are action naming conventions consistent (FEATURE_ACTION_TYPE)?
- Is the reducer structure consistent (switch on action type, return new Immutable state)?

### Step 6: Update Section 14

Replace the placeholder in section 14 of the HLD with:

```markdown
## 14. Architecture Alignment Notes

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| Atomic Design hierarchy | aligned/deviated/new_pattern | {specific notes} |
| Cap-* component mandate | aligned/deviated/new_pattern | {specific notes} |
| CapRow/CapColumn layouts | aligned/deviated/new_pattern | {specific notes} |
| Redux file co-location | aligned/deviated/new_pattern | {specific notes} |
| Dynamic reducer/saga injection | aligned/deviated/new_pattern | {specific notes} |
| Immutable.js state conventions | aligned/deviated/new_pattern | {specific notes} |
| styled-components styling | aligned/deviated/new_pattern | {specific notes} |
| ESLint 500-line limit | aligned/deviated/new_pattern | {specific notes} |
| Saga concurrency model | aligned/deviated/new_pattern | {specific notes} |
| Redux inject key pattern | aligned/deviated/new_pattern | {specific notes} |
| Compose pattern | aligned/deviated/new_pattern | {specific notes} |

### Alignment with System Map Patterns

{Comparison of saga flows, selector patterns, action naming, reducer structure
against examples in loyalty-promotions-system-map.md}

### Deviations and Justifications

{For each deviation: what, why, risk level, mitigation}
```

## Output Rules

1. Check ALL 11 conventions -- do not skip any
2. Be specific in the Notes column -- reference actual component or pattern names from the HLD
3. Every deviation MUST have a justification and risk level
4. Cross-reference with system-map patterns for data flow consistency
5. The updated section 14 replaces the placeholder entirely
