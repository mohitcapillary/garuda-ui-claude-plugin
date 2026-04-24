---
description: System mapping methodology for React + Redux + Redux-Saga codebases following a strict spec.md template
triggers:
  - "map the codebase"
  - "generate system mapping"
  - "create code map"
  - "map product to code"
  - "analyze codebase structure"
  - "code mapping"
---

# Code Mapping Skill

This skill produces a structured system mapping document by analyzing a documentation URL and the current codebase. The output strictly follows the `spec.md` template located in this directory.

## Source of Truth Priority

When conflicts arise between sources:

1. **Codebase** (highest priority)
2. **Documentation URL**
3. **Inference** (mark with ⚠️ Assumed)

## Mapping Methodology

### Step 1: Documentation Ingestion

- Use WebFetch to retrieve the provided documentation URL
- Extract:
  - Product/feature name
  - User flows and journeys
  - Business entities and their relationships
  - Acceptance criteria and requirements
- Summarize key requirements as a checklist for later traceability
- If the URL is unavailable, warn the user and proceed with codebase-only analysis

### Step 2: Route Discovery

- Read `app/components/pages/App/routes.js` to identify all pages and route paths
- This provides the skeleton for **Section 2: Page-Level Mapping** in spec.md
- Note authentication wrappers (`userIsAuthenticated`) and lazy loading (`Loadable.js`)

### Step 3: Page-Level Analysis

For each relevant page directory (`app/components/pages/<PageName>/`), read and analyze:

- `index.js` / `Loadable.js` — auth wrappers, lazy loading, injected reducer/saga
- `<PageName>.js` — imports, `mapStateToProps`, `mapDispatchToProps`, `compose()` chain
- `constants.js` — action type constants
- `actions.js` — action creator functions
- `reducer.js` — initial state shape (from `fromJS({...})`), state transitions per action type
- `selectors.js` — selector functions and their state paths
- `saga.js` — saga watchers (`takeLatest`/`takeEvery`) and worker functions

### Step 4: Component Tree Traversal

- Starting from the page component, follow import chains into `organisms/`, `molecules/`, `atoms/`
- For each component with Redux integration (has its own `reducer.js` / `saga.js`), apply the same analysis as Step 3
- Record the parent-child component hierarchy
- Note which components are presentational vs connected

### Step 5: Redux Store Mapping

- Aggregate all discovered reducers
- Document the inject key pattern: `${CURRENT_APP_NAME}-<slice-name>`
- For each slice, document:
  - Initial state (from `fromJS({...})` calls)
  - State fields and their purposes
  - Action types handled and what each does
  - Selectors that read from this slice
  - Components that consume this slice

### Step 6: Saga Flow Mapping

For each saga file, identify:

- **Trigger action** — from `takeLatest(ACTION_TYPE, workerFn)` or `takeEvery(...)`
- **API call** — from `call(apiFunction, params)`
- **Success action** — from `put(successAction(response))`
- **Failure action** — from `put(failureAction(error))`
- **Concurrency model** — `takeLatest` vs `takeEvery` vs `throttle`
- Trace the API function back to `app/services/api.js`

### Step 7: API Mapping

- Read `app/services/api.js` for API function definitions
- Read `app/config/endpoints.js` for endpoint URL patterns
- For each API function called by sagas, document:
  - Endpoint URL and HTTP method
  - Request payload structure
  - Response structure
  - Which saga calls it
  - Which Redux state it maps to

### Step 8: End-to-End Flow Tracing

For each major user action, trace the **complete chain**:

1. UI event handler (onClick, onSubmit, etc.)
2. `dispatch(actionCreator(payload))`
3. Reducer update (if synchronous)
4. Saga trigger (matching action type)
5. API call (endpoint, method, payload)
6. API response handling
7. Redux state update (success/failure actions → reducer)
8. Selector re-evaluation
9. Component re-render with new data

**No partial flows. No broken links.**

### Step 9: Data Model Extraction

- From API responses and Redux state shapes, identify business entities
- Document entity fields, their sources (API / Derived / User Input), and where they are stored
- Note relationships between entities

### Step 10: Dependency Graph

Build the complete adjacency mapping:

- Page → Components
- Component → Redux (Slice + Actions)
- Component → Saga
- Saga → API
- API → Redux State
- Redux State → Component

### Step 11: Gap Analysis

- Compare documentation requirements against discovered code
- Highlight:
  - Missing implementation (documented but not in code)
  - Extra implementation (in code but not in docs)
  - Unclear logic
- Mark all inferences with ⚠️ Assumed

### Step 12: PRD Impact Assessment

If documentation was provided, map each requirement to:

- Impacted pages
- Impacted components
- Impacted Redux slices
- Impacted sagas
- Impacted APIs
- Data model changes
- Risk areas

## Codebase Conventions (target app)

These patterns are specific to the target app codebase:

- **Vulcan SDK**: `injectReducer`, `injectSaga`, `withStyles`, `clearDataOnUnmount` from `@capillarytech/vulcan-react-sdk`
- **Immutable.js**: State uses `fromJS()`, selectors use `.get()` / `.getIn()` / `.toJS()`
- **CURRENT_APP_NAME**: Global variable used as prefix for reducer inject keys
- **Atomic Design**: Components organized in `atoms/`, `molecules/`, `organisms/`, `pages/`, `templates/`
- **apiCaller**: All HTTP calls go through `apiCaller` from Vulcan SDK
- **Request constructors**: `getAryaAPICallObject`, `getIRISAPICallObject`, etc. in `app/services/requestConstructor.js`
- **Compose pattern**: `compose(withRouter, withReducer, withSaga, withConnect, withMemo)` at bottom of connected components
- **Cap-* components**: UI built with `@capillarytech/cap-ui-library` components (CapRow, CapColumn, CapInput, etc.)

## Output Rules

1. Follow `spec.md` template structure **exactly**
2. Do NOT skip sections — write "N/A" if not applicable
3. Mark all assumptions with: ⚠️ Assumed
4. Maintain full traceability: Component → Action → Saga → API → State → Component
5. Use consistent naming (real names from codebase)
6. Prefer bullet points
7. Keep output concise and actionable
8. Do NOT hallucinate — if unsure, mark ⚠️ Assumed
