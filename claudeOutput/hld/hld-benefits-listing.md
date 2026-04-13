# High-Level Design: Benefits Listing

> **Generated**: 2026-04-13
> **PRD Source**: `claudeOutput/filteredPrd/benefits-listing-spec.md`
> **Architecture Reference**: `.claude/output/architecture.md`

---

## 1. Feature Overview

### Feature Name
Benefits Listing

### Description & Business Purpose
The Benefits Listing page provides loyalty program managers with a single, searchable, filterable view of every benefit configuration for a given program. It renders a flat list (infinite scroll) of benefit records with key metadata visible at a glance — name, status, duration, program, category, and last-updated information. The page is modelled architecturally on the existing PromotionList page to keep the codebase consistent and minimise engineering ramp-up.

### Problem Statement
Program managers currently have no dedicated page to browse all benefits configured for a program in one place. They must navigate fragmented views or query the backend directly. This creates friction when auditing active benefits, comparing configurations, or identifying stale entries.

### Target Users
Loyalty program managers (internal Capillary platform users) who have authenticated access to the garuda-ui platform for a given org.

### Scope

**In Scope**:
- Flat benefits list with search (by name, description, ID, external ID), filter panel, and sortable columns
- Infinite scroll (page size 20, IntersectionObserver, identical to PromotionList)
- 6-column table: Name (two-line cell), Status (badge + secondary text), Duration (two datetimes + updater), Program name, Category, Updated at (datetime + updater)
- Status badge (6 values) with computed client-side secondary status text
- Filter panel (Status, Category, Program, Duration, Last updated by, Last updated at, Tier event)
- Row click navigates to benefit view placeholder route `/benefits/:benefitId`
- Loading (skeleton), empty (no results), empty (filtered), and error states
- Independent `/benefits` route, sibling to BenefitsSettings

**Out of Scope**:
- Summary count cards (total / live / upcoming / ended)
- Benefit creation flow ("Create Benefit" button and page)
- Grouped-by-category listing view
- CSV / config download / export
- RBAC / permission gating
- Tier-event grouped view
- Tier/Subscription as a table column (available as filter panel entry only)

---

## 2. Technical Objective

### Technical Goals
1. **Consistency**: Mirror the PromotionList page structure — same Redux slice shape, same saga concurrency pattern, same infinite-scroll approach — so the feature needs no new architectural patterns.
2. **Maintainability**: Co-locate all Redux artifacts (constants, actions, reducer, selectors, saga) within the BenefitsList page directory. No shared Redux state with BenefitsSettings.
3. **Performance**: Render only page-sized data chunks (20 rows); memoize selectors with Reselect; use `useCallback`/`useMemo` throughout the page component; keep initial load under 2 s for 100-row datasets.
4. **ESLint compliance**: No file exceeds 500 lines; complexity ≤ 10 per function; PropTypes on all components.
5. **Filter side-effect isolation**: All filter/search/sort state is held in component local state; only the fetched list and status live in Redux, preventing redundant re-renders.

### Architecture Fit
The feature plugs into the existing React 18 + Redux-Saga architecture as a new page module under `app/components/pages/`. It uses dynamic reducer/saga injection via `injectReducer`/`injectSaga` HOCs (from `@capillarytech/vulcan-react-sdk/utils`), connects via `react-redux connect()`, and registers a new route in `app/components/pages/App/routes.js`. The Cap shell provides `makeSelectPrograms()` for the program filter options without any new slice. All UI is built from `@capillarytech/cap-ui-library` Cap-* components and styled with styled-components.

---

## 3. Impact Analysis

### New Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| BenefitsList | page | `app/components/pages/BenefitsList/` | Root container; Redux-connected, injects reducer + saga, renders toolbar + table |
| BenefitsListTable | molecule | `app/components/molecules/BenefitsListTable/` | CapTable wrapper; renders 6-column benefit rows with status badges, sort icons, and row-click navigation |
| BenefitsListFilterPanel | molecule | `app/components/molecules/BenefitsListFilterPanel/` | Slide-out filter panel; 7 filter controls (Status, Category, Program, Duration, Last updated by, Last updated at, Tier event) |
| BenefitStatusTag | atom | `app/components/atoms/BenefitStatusTag/` | Status badge (coloured dot + label) + secondary status text computed from date fields |

### Modified Components

| Component | Location | Change Description |
|-----------|----------|--------------------|
| `app/components/pages/App/routes.js` | `app/components/pages/App/routes.js` | Add `/benefits` route entry pointing to `BenefitsList` Loadable |

### New Redux Domains

| Domain | Inject Key | Reducer File | Saga File | Purpose |
|--------|-----------|-------------|----------|---------|
| benefits-list | `${CURRENT_APP_NAME}-benefits-list` | `BenefitsList/reducer.js` | `BenefitsList/saga.js` | Stores benefits list data, loading/error status, and pagination totals for the listing page |

### New Routes

| Route Path | Component | Auth Required | Description |
|------------|-----------|---------------|-------------|
| `/benefits` | `BenefitsList` (Loadable) | Yes (`withCustomAuthAndTranslations`) | Benefits listing page — entry point for browsing benefits |
| `/benefits/:benefitId` | Placeholder (empty component or `NotFoundPage`) | Yes | Benefit detail view — out of scope for this release; route reserved |

### Shared Utilities / Hooks

| Name | Location | New/Modified | Purpose |
|------|----------|-------------|---------|
| `computeSecondaryStatus` | `app/components/atoms/BenefitStatusTag/utils.js` | New | Pure function: given a status enum + dates, returns secondary text string (e.g. "N days left", "Starts in N days") |
| `getBenefits` | `app/services/api.js` | New (add to existing file) | HTTP GET to `${endpoints.incentives_endpoint}/benefits` with query params for search, filter, sort, pagination |
| `getBenefitsCategories` | `app/services/api.js` | Already exists for BenefitsSettings — reuse or add separate filter-oriented variant | Returns `{id, name}` list for Category filter options |

---

## 4. UI/UX Changes

### Screen Flow
1. User navigates to `/benefits` (via navbar entry adjacent to Promotions).
2. `BenefitsList` mounts — injects reducer + saga, dispatches `GET_BENEFITS_LIST_REQUEST` on mount with default sort (Updated at DESC, page 1).
3. While loading: `BenefitsListTable` renders `CapSkeleton` rows.
4. On success: table renders benefit rows; `BenefitStatusTag` computes secondary status text client-side.
5. User types in the search bar → 300 ms debounce → dispatches `GET_BENEFITS_LIST_REQUEST` with `search` param, pagination reset to page 1.
6. User clicks the filter icon → `BenefitsListFilterPanel` opens → user selects filters → clicks Apply → dispatches `GET_BENEFITS_LIST_REQUEST` with combined filter params.
7. User scrolls to bottom → `IntersectionObserver` sentinel fires → dispatches `GET_BENEFITS_LIST_REQUEST` with incremented page → new rows appended to Redux state.
8. User clicks any row → navigates to `/benefits/:benefitId` (placeholder).
9. On unmount: `clearDataOnUnmount` HOC clears the Redux slice.

### Screen: Benefits Listing Page

**Route**: `/benefits`
**Purpose**: Browse, search, filter, and sort all benefit configurations for the current program.

**Component Boundaries**:
- `BenefitsList` (page): Redux-connected container. Owns all local UI state (searchTerm, isFilterPanelOpen, activeFilters, pagination, sortBy, sortOrder, hasReachedEnd). Injects `${CURRENT_APP_NAME}-benefits-list` reducer and saga.
- `BenefitsListTable` (molecule): Purely presentational. Receives `benefits`, `loading`, `hasReachedEnd`, `sortBy`, `sortOrder`, `onSort`, `onRowClick`. Renders `CapTable` with 6 column definitions. Each cell for Status renders a `BenefitStatusTag`.
- `BenefitsListFilterPanel` (molecule): Controlled filter panel. Opens/closes via `isFilterPanelOpen` prop. Emits `onApply(filters)` and `onClose()` callbacks. Renders 7 filter controls using `CapUnifiedSelect` (multi-select) and `CapInput` (date range).
- `BenefitStatusTag` (atom): Receives `status`, `startDate`, `endDate`. Renders coloured dot badge + `CapLabel` for status name + secondary text from `computeSecondaryStatus()`.
- `EmptyStateIllustration` (molecule): Reused from `app/components/molecules/EmptyStateIllustration/`. Shown for empty list and filtered-no-results states.
- `FiltersApplied` (molecule): Reused from `app/components/molecules/FiltersApplied/`. Shows applied filter tags with remove capability.
- `PageTemplate` (template): Reused from `app/components/templates/PageTemplate/`. Provides page-level layout wrapper.

**Component Recipe** *(recipe-verified from figma-node-mapper — review and correct before code generation)*:

| UI Section | Cap* Component | Recipe Status | Reviewer Override |
|------------|----------------|---------------|-------------------|
| Page Wrapper | CapColumn | EXACT (3:1023) | |
| Toolbar Row | CapRow | RESOLVED-UNMAPPED (3:1024) | |
| Page Heading "Benefits" | CapHeading | RESOLVED-UNMAPPED (3:1026/3:1027 — overridden from CapLabel per memory rule: page headings use CapHeading hN) | |
| Search + Filter Group | CapRow | RESOLVED-UNMAPPED (3:1029) | |
| Search Input | CapInput | RESOLVED-UNMAPPED (3:1031/3:1035 — Field states → CapInput) | |
| Search Icon (prefix) | CapIcon | PARTIAL (3:1038/3:1039) | |
| Toolbar Divider | CapDivider | PARTIAL (3:1046) | |
| Filter Icon Button | CapIcon | RESOLVED-UNMAPPED (3:1047 — square 32×32 → CapIcon) | |
| Create Benefit Button | CapButton | EXACT (8:2902, type=primary) | [FIGMA-VS-SPEC: Omit — PM resolved Q3: no Create Benefit button. See Section 15 Q1.] |
| Benefits Data Table | CapTable | RESOLVED-UNMAPPED (5:2877 — named 'CapTable', registry mapped to CapTab; overridden to CapTable per disambiguation rule) | |
| Loading Skeleton Rows | CapSkeleton | ASSUMED (no recipe node; per FR-12 loading state) | |
| Status Badge | CapLabel (styled) | ASSUMED (no recipe node; status dot+text cell in table) | |

*Recipe source*: `claudeOutput/figma-capui-mapping/3-1022.recipe.json`
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/3-1022/prop-spec-notes.json`

> **Note**: Every Cap* component listed in the ASCII diagram below appears in this table. `CapButton` for "Create Benefit" is present in the Figma design but omitted from implementation per PM decision (see Section 15, Open Question #1 — Figma-vs-Spec Conflict). `CapTable` override from registry's erroneous `CapTab` match is confirmed by the prop-spec disambiguation note.

**User Interactions → Redux Actions**:

| User Action | Component | Dispatched Action | Saga Triggered |
|-------------|-----------|-------------------|----------------|
| Page mount | BenefitsList | `GET_BENEFITS_LIST_REQUEST` | `getBenefitsListSaga` |
| Type in search bar (debounced 300 ms) | BenefitsList (search input handler) | `GET_BENEFITS_LIST_REQUEST` (pagination reset) | `getBenefitsListSaga` |
| Click filter icon | BenefitsList | Sets `isFilterPanelOpen = true` (local state) | — |
| Apply filters in filter panel | BenefitsListFilterPanel → BenefitsList | `GET_BENEFITS_LIST_REQUEST` (with filter params, pagination reset) | `getBenefitsListSaga` |
| Click column sort arrow (Duration / Updated at) | BenefitsListTable → BenefitsList | `GET_BENEFITS_LIST_REQUEST` (updated sortBy/sortOrder) | `getBenefitsListSaga` |
| Scroll to sentinel (IntersectionObserver fires) | BenefitsList | `GET_BENEFITS_LIST_REQUEST` (page + 1) | `getBenefitsListSaga` |
| Click table row | BenefitsListTable | — (navigation) | — (pushes to `/benefits/:benefitId`) |
| Click "Clear filters" in empty state | BenefitsList | `GET_BENEFITS_LIST_REQUEST` (cleared filters) | `getBenefitsListSaga` |
| Page unmount | BenefitsList (clearDataOnUnmount HOC) | `CLEAR_BENEFITS_LIST_DATA` | — |

**Architecture Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BenefitsList (page)                                                             │
│ Route: /benefits                                                                │
│ Redux: ${CURRENT_APP_NAME}-benefits-list                                        │
│ Saga:  watchForGetBenefitsListSaga (takeLatest)                                 │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ PageTemplate (template)                                                     │ │
│ │                                                                             │ │
│ │  ┌──────────────────────────────────────────────────────────────────────┐  │ │
│ │  │ Toolbar — CapRow (RESOLVED)                                          │  │ │
│ │  │                                                                      │  │ │
│ │  │  CapHeading h1: "Benefits" (RESOLVED)                                │  │ │
│ │  │                                                                      │  │ │
│ │  │  ┌──────────────────────────────┐  CapIcon (filter) (PARTIAL)       │  │ │
│ │  │  │ CapInput (search) (RESOLVED) │  dispatch: setIsFilterPanelOpen   │  │ │
│ │  │  │  prefix: CapIcon (PARTIAL)   │                                    │  │ │
│ │  │  └──────────────────────────────┘  CapDivider (PARTIAL)             │  │ │
│ │  └──────────────────────────────────────────────────────────────────────┘  │ │
│ │                                                                             │ │
│ │  ┌──────────────────────────────────────────────────────────────────────┐  │ │
│ │  │ FiltersApplied (molecule) — shown when isFilterApplied               │  │ │
│ │  │ dispatch: setActiveFilters (clear individual filter)                 │  │ │
│ │  └──────────────────────────────────────────────────────────────────────┘  │ │
│ │                                                                             │ │
│ │  ┌──────────────────────────────────────────────────────────────────────┐  │ │
│ │  │ BenefitsListTable (molecule)                                         │  │ │
│ │  │ Redux ← makeSelectBenefits(), makeSelectBenefitsStatus()             │  │ │
│ │  │ Saga  ← getBenefitsListSaga                                          │  │ │
│ │  │                                                                      │  │ │
│ │  │  CapTable (RESOLVED — 5:2877)                                        │  │ │
│ │  │  columns: Name | Status | Duration | Program | Category | Updated at │  │ │
│ │  │                                                                      │  │ │
│ │  │  Loading: CapSkeleton rows (ASSUMED)                                 │  │ │
│ │  │                                                                      │  │ │
│ │  │  ┌──────────────────────────────────────────────────────────────┐   │  │ │
│ │  │  │ BenefitStatusTag (atom)                                      │   │  │ │
│ │  │  │ CapLabel (styled) + computeSecondaryStatus()                 │   │  │ │
│ │  │  └──────────────────────────────────────────────────────────────┘   │  │ │
│ │  │                                                                      │  │ │
│ │  │  Sentinel div (IntersectionObserver) → dispatch GET_BENEFITS_LIST   │  │ │
│ │  └──────────────────────────────────────────────────────────────────────┘  │ │
│ │                                                                             │ │
│ │  EmptyStateIllustration (molecule) — shown when empty                       │ │
│ │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│ │  │ BenefitsListFilterPanel (molecule)                                  │   │ │
│ │  │ visible: isFilterPanelOpen — slide-out drawer                       │   │ │
│ │  │ 7 filters: Status | Category | Program | Duration |                 │   │ │
│ │  │            Last updated by | Last updated at | Tier event           │   │ │
│ │  │ onApply → dispatch GET_BENEFITS_LIST_REQUEST                        │   │ │
│ │  └─────────────────────────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

[See: Benefits Listing Page](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=3-1022)

**Recipe verification statement**: The `sectionComponentMap` entries used in the ASCII diagram above are: `CapRow` (toolbar, RESOLVED 3:1024), `CapHeading` (page title, RESOLVED-overridden from 3:1027), `CapInput` (search, RESOLVED 3:1035), `CapIcon` (search prefix and filter, PARTIAL 3:1038 and RESOLVED 3:1047), `CapDivider` (PARTIAL 3:1046), `CapTable` (RESOLVED-overridden from 5:2877), `CapSkeleton` (ASSUMED), `CapLabel styled` for status badge (ASSUMED). Every leaf-level Cap* component in the diagram matches a recipe entry in the table above. The only Cap* component visible in the Figma screenshot not used in implementation is `CapButton` (Create Benefit, EXACT 8:2902) — excluded by PM decision; conflict logged in Section 15.

---

## 5. Directory Structure

```
app/components/
├── pages/
│   ├── App/
│   │   └── routes.js                        # MODIFIED: add /benefits route
│   └── BenefitsList/
│       ├── index.js                         # Public export → Loadable
│       ├── Loadable.js                      # Dynamic import + withCustomAuthAndTranslations HOC
│       ├── BenefitsList.js                  # Main page component (connect + local state)
│       ├── constants.js                     # actionTypes, BENEFITS_LIST_INJECT_KEY, filterTypes,
│       │                                    #   DEFAULT_PAGINATION, BENEFITS_STATUS, SORT_FIELDS
│       ├── actions.js                       # Action creators matching actionTypes
│       ├── reducer.js                       # ImmutableJS reducer (fromJS initial state)
│       ├── selectors.js                     # Reselect memoized selectors
│       ├── saga.js                          # watchForGetBenefitsListSaga + worker
│       ├── messages.js                      # react-intl message descriptors
│       └── styles.js                        # styled-components for page layout
├── molecules/
│   ├── BenefitsListTable/
│   │   ├── index.js
│   │   ├── BenefitsListTable.js             # CapTable wrapper; column definitions; infinite scroll sentinel
│   │   ├── utils.js                         # Column renderer functions (name cell, duration cell)
│   │   ├── messages.js
│   │   └── styles.js
│   ├── BenefitsListFilterPanel/
│   │   ├── index.js
│   │   ├── BenefitsListFilterPanel.js       # Slide-out filter panel; 7 filter controls
│   │   ├── constants.js                     # Filter field keys, preset options (last updated at)
│   │   ├── messages.js
│   │   └── styles.js
│   └── (FiltersApplied/)                    # REUSED — no changes
│   └── (EmptyStateIllustration/)            # REUSED — no changes
├── atoms/
│   └── BenefitStatusTag/
│       ├── index.js
│       ├── BenefitStatusTag.js              # CapLabel (styled) dot + status text + secondary text
│       ├── constants.js                     # BENEFIT_STATUS enum, STATUS_CONFIG (badge colours + labels)
│       ├── utils.js                         # computeSecondaryStatus(status, startDate, endDate): string
│       ├── messages.js
│       └── styles.js
└── templates/
    └── (PageTemplate/)                      # REUSED — no changes
app/services/
└── api.js                                   # MODIFIED: add getBenefits() export
```

### Naming Conventions
- **Page component**: PascalCase directory matching component name — `BenefitsList` (not `BenefitsListing`)
- **Redux inject key**: `${CURRENT_APP_NAME}-benefits-list` (kebab-case, CURRENT_APP_NAME prefix)
- **Action types**: `GET_BENEFITS_LIST_REQUEST / _SUCCESS / _FAILURE`, `CLEAR_BENEFITS_LIST_DATA`
- **Selectors**: `makeSelectBenefits()`, `makeSelectBenefitsStatus()`, `makeSelectBenefitsTotal()`
- **Filter types**: SCREAMING_SNAKE_CASE constants exported from `BenefitsList/constants.js` and `BenefitsListFilterPanel/constants.js`
- **Status enum**: `BENEFIT_STATUS` in `BenefitStatusTag/constants.js` — distinct from `PROMOTION_STATUS` in PromotionList domain

---

## 6. API Structure

### API: Get Benefits List

**Status**: Confirmed (FR-10, Resolved by BE — Q9)

| Field | Value |
|-------|-------|
| Endpoint | `GET /incentives/api/v1/benefits` |
| Method | `GET` |
| Auth | Yes (Arya auth headers via `getAryaAPICallObject`) |
| Base URL key | `endpoints.incentives_endpoint` |

**Request Query Parameters**:
```
page          integer    1-based page number
size          integer    default 20
sort          string     field name: "updated_at" | "start_date" | "end_date"
order         string     "asc" | "desc"   (default: "desc")
search        string     full-text search across name, description, ID, external ID
status[]      string     multi-value: "active" | "upcoming" | "ended" | "draft" |
                         "awaiting_approval" | "rejected"
category_id[] integer    multi-value
program_id[]  integer    multi-value
start_date    ISO8601    filter benefits with start_date >= value
end_date      ISO8601    filter benefits with end_date <= value
updated_by[]  integer    multi-value user IDs
updated_at    string     preset: "today" | "yesterday" | "last_7d" | "last_30d" | "last_90d"
tier_event[]  string     multi-value: "upgrade" | "downgrade" | "renew"
```

**Response Payload**:
```json
{
  "data": [
    {
      "id": 101,
      "external_id": "EXT-101",
      "name": "Birthday Bonus",
      "description": "Bonus points on birthday",
      "status": "active",
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-12-31T23:59:59Z",
      "program_id": 1,
      "program_name": "Loyalty Program 2025",
      "category_id": 3,
      "category_name": "Milestone Rewards",
      "last_updated_at": "2025-03-15T10:30:00Z",
      "last_updated_by": { "id": 42, "name": "Alice Smith" },
      "tier_event": "upgrade"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 87
  }
}
```

**Validation Rules**:
- `page` >= 1; `size` >= 1 and <= 100
- `sort` must be one of: `updated_at`, `start_date`, `end_date`
- `order` must be `asc` or `desc`
- `updated_at` preset must be one of the 5 allowed values if present
- `tier_event` values must be `upgrade`, `downgrade`, or `renew`

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | BadRequest | Invalid query parameter (bad sort field, bad preset value) |
| 401 | Unauthorized | Missing or expired auth token |
| 403 | Forbidden | User lacks access to the requested program |
| 404 | NotFound | Program not found |
| 500 | InternalServerError | Unexpected backend failure |

---

### API: Get Benefits Categories (for filter panel)

**Status**: Confirmed (existing endpoint — reused from BenefitsSettings; `getBenefitsCategories` already in `app/services/api.js`)

| Field | Value |
|-------|-------|
| Endpoint | `GET /incentives/api/v1/benefits/categories` |
| Method | `GET` |
| Auth | Yes |

**Request Query Parameters**:
```
programId  integer  (required)
status     string   "ACTIVE" (default)
```

**Response Payload**:
```json
{
  "result": {
    "data": {
      "categories": [
        { "id": 3, "name": "Milestone Rewards" },
        { "id": 5, "name": "Welcome Gift" }
      ]
    }
  },
  "success": true
}
```

**Note**: The existing `getBenefitsCategories` function in `api.js` returns this shape. The BenefitsListFilterPanel will call it to populate the Category multi-select options. No new API function is needed; the existing export is reusable.

---

### API: Get Programs (for filter panel)

**Status**: Confirmed (existing — `makeSelectPrograms()` from Cap slice)

Programs are already loaded into Redux by the Cap shell. The filter panel reads program options from `makeSelectPrograms()` selector — no new API call needed.

---

### API: Get Benefit Detail (navigation target)

**Status**: [ASSUMED — route is placeholder only in this release]

| Field | Value |
|-------|-------|
| Endpoint | `GET /incentives/api/v1/benefits/:benefitId` |
| Method | `GET` |
| Auth | Yes |

This endpoint is out of scope for the listing feature. Row-click navigates to `/benefits/:benefitId` which renders a placeholder. The API contract is noted here for completeness and future LLD use.

---

## 7. Data and State Management Overview

### Redux Store Shape

```javascript
// Inject key: ${CURRENT_APP_NAME}-benefits-list
fromJS({
  benefits: [],           // Array of benefit objects (ImmutableJS List)
  benefitsStatus: INITIAL, // INITIAL | REQUEST | SUCCESS | FAILURE
  error: null,            // Error object on failure
  totalElements: 0,       // Total count of benefits matching current filters
  totalPages: 0,          // Total pages (derived from total / size)
})
```

### Actions

| Action Type | Creator | Purpose |
|-------------|---------|---------|
| `GET_BENEFITS_LIST_REQUEST` | `getBenefitsList(searchTerm, filters, pagination, sortBy, sortOrder)` | Trigger list fetch; passes all query params to saga |
| `GET_BENEFITS_LIST_SUCCESS` | `getBenefitsListSuccess(data, pagination)` | Store fetched benefits; append (page > 1) or replace (page 1) |
| `GET_BENEFITS_LIST_FAILURE` | `getBenefitsListFailure(error)` | Store error; set status to FAILURE |
| `SET_BENEFITS_STATUS` | `setBenefitsStatus(status)` | Directly update status (e.g., reset to INITIAL) |
| `CLEAR_BENEFITS_LIST_DATA` | `clearBenefitsListData()` | Reset slice to initialState on page unmount |

### Selectors

| Selector | State Path | Returns |
|----------|-----------|---------|
| `makeSelectBenefits()` | `${CURRENT_APP_NAME}-benefits-list` → `benefits` | `Array<BenefitRecord>` (`.toJS()`) |
| `makeSelectBenefitsStatus()` | `${CURRENT_APP_NAME}-benefits-list` → `benefitsStatus` | `string` (INITIAL/REQUEST/SUCCESS/FAILURE) |
| `makeSelectBenefitsError()` | `${CURRENT_APP_NAME}-benefits-list` → `error` | `object | null` |
| `makeSelectBenefitsTotalElements()` | `${CURRENT_APP_NAME}-benefits-list` → `totalElements` | `number` |
| `makeSelectBenefitsTotalPages()` | `${CURRENT_APP_NAME}-benefits-list` → `totalPages` | `number` |
| `makeSelectPrograms()` | `${CURRENT_APP_NAME}-cap` → `programs` | `Array<Program>` (from Cap slice — reused) |

### Saga Orchestration

| Saga | Trigger Action | API Call | On Success | On Failure | Concurrency |
|------|---------------|----------|------------|------------|-------------|
| `getBenefitsListSaga` | `GET_BENEFITS_LIST_REQUEST` | `getBenefits(searchTerm, filters, pagination, sortBy, sortOrder)` | `getBenefitsListSuccess(data, pagination)` | `getBenefitsListFailure(error)` | `takeLatest` |
| `watchForGetBenefitsListSaga` | Root watcher | — | — | — | `takeLatest` |

**Reducer — list accumulation logic** (identical to PromotionList pattern):
- Page 1 (reset): `state.set('benefits', fromJS(data.data))` — replaces list
- Page > 1 (append): `state.update('benefits', (list) => list.concat(fromJS(data.data)))` — appends rows

### Local State vs Redux State

| Data Point | Storage | Rationale |
|-----------|---------|-----------|
| `searchTerm` | Local (`useState`) | Ephemeral UI state; not needed across unmount |
| `isFilterPanelOpen` | Local (`useState`) | UI visibility toggle; no cross-component need |
| `activeFilters` | Local (`useState`) | Filter form state; serialised into API call only on submit |
| `pagination` | Local (`useState`) | Current page cursor; drives infinite scroll; not persisted |
| `sortBy` / `sortOrder` | Local (`useState`) | Sort column and direction; reset on search |
| `hasReachedEnd` | Local (`useState`) | Derived from `totalPages`; controls IntersectionObserver |
| `benefits[]` | Redux | Fetched data; needs to persist across re-renders; enables status display |
| `benefitsStatus` | Redux | Loading/error state; drives conditional rendering across tree |
| `totalElements` / `totalPages` | Redux | Pagination metadata from API; computed at saga level |

---

## 8. Validation

### Client-Side Validation

| Screen | Field | Rule | Message |
|--------|-------|------|---------|
| Benefits Listing | Search input | Max 200 characters (soft truncation) | Trim on submit; no error shown |
| Filter Panel — Duration | Start date | Must be a valid date/datetime | "Invalid start date" (date picker built-in) |
| Filter Panel — Duration | End date | Must be >= start date if both set | "End date must be after start date" |
| Filter Panel — Last updated at | Preset | Must be one of the 5 allowed presets | N/A — single-select dropdown enforces this |

There is no create/edit form in this feature, so validation is minimal and limited to the filter panel date range.

### Server-Side Validation Handling
API errors (400 Bad Request from malformed query params) are caught in the saga's try/catch block. The saga dispatches `getBenefitsListFailure(error)` which sets `benefitsStatus = FAILURE` in the Redux slice. `BenefitsList` renders an inline error banner (via a `CapNotification` or styled error component) with a "Retry" button that re-dispatches `GET_BENEFITS_LIST_REQUEST` with the last known params.

---

## 9. Reusable Patterns and Shared Utilities

### Existing to Reuse

| Component/Utility | Location | Usage in This Feature |
|-------------------|----------|-----------------------|
| `FilterPanel` | `app/components/molecules/FilterPanel/` | Pattern reference only — BenefitsListFilterPanel follows the same drawer UX; not directly reused due to different filter fields |
| `FiltersApplied` | `app/components/molecules/FiltersApplied/` | Directly reused — renders applied filter tags below toolbar |
| `EmptyStateIllustration` | `app/components/molecules/EmptyStateIllustration/` | Directly reused for empty list and empty filtered states |
| `PromotionStatusTag` | `app/components/atoms/PromotionStatusTag/` | Pattern reference only — BenefitStatusTag is a new atom because the status enum and secondary text logic differ from promotions |
| `PageTemplate` | `app/components/templates/PageTemplate/` | Directly reused as page layout wrapper |
| `makeSelectPrograms()` | `app/components/pages/Cap/selectors.js` | Directly reused — program list already in Redux via Cap shell |
| `getBenefitsCategories` | `app/services/api.js` | Directly reused for Category filter options |
| `DEFAULT_DEBOUNCE_TIME` | `app/components/pages/App/constants.js` | Directly reused for search debounce delay |
| `REQUEST / SUCCESS / FAILURE / INITIAL` | `app/components/pages/App/constants.js` | Directly reused as status constants in reducer |
| `injectReducer / injectSaga / clearDataOnUnmount` | `@capillarytech/vulcan-react-sdk/utils` | Directly reused for dynamic injection at page mount |
| `withCustomAuthAndTranslations` | `@capillarytech/vulcan-react-sdk/utils` | Directly reused in `Loadable.js` |
| `withMemo` | `app/hoc/withMemo/` | Directly reused as the outermost HOC in compose chain |

### New Patterns Introduced
- **`computeSecondaryStatus` pure utility**: A date-aware status description function that takes `(status, startDate, endDate)` and returns a human-readable string. Follows the same `utils.js` convention as `PromotionStatusTag/utils.js`. Future benefit-status consumers can import this directly.
- **`BenefitStatusTag` atom**: Establishes the pattern for displaying benefit-specific status badges with secondary text. Separate from `PromotionStatusTag` to avoid coupling the two domains.
- **Benefits domain filter encoding**: The `BenefitsListFilterPanel` uses repeated query params (`?status=active&status=upcoming`) per FR-09 — consistent with PromotionList convention but codified for the benefits domain.

---

## 10. Dependencies

### Internal Module Dependencies

| Module | Purpose | Status |
|--------|---------|--------|
| `app/components/pages/Cap/` | Provides `makeSelectPrograms()` for filter options; Cap shell manages org/program state | Existing |
| `app/components/pages/App/constants.js` | Status constants (REQUEST/SUCCESS/FAILURE/INITIAL), DEFAULT_DEBOUNCE_TIME | Existing |
| `app/components/pages/App/routes.js` | Route registration for `/benefits` | Modified |
| `app/components/molecules/EmptyStateIllustration/` | Empty state display | Existing |
| `app/components/molecules/FiltersApplied/` | Applied filter tag display | Existing |
| `app/components/templates/PageTemplate/` | Page layout wrapper | Existing |
| `app/services/api.js` | HTTP client; `getBenefits` to be added, `getBenefitsCategories` already present | Modified |
| `app/config/endpoints.js` | `incentives_endpoint` base URL already defined | Existing |
| `app/hoc/withMemo/` | Performance HOC | Existing |
| `app/utils/authWrapper.js` | `isLoyaltyPromotionsV2Enabled` pattern used in Loadable — benefits may need its own flag check [ASSUMED] | Existing |

### External API Dependencies

| API | Purpose | Status |
|-----|---------|--------|
| `GET /incentives/api/v1/benefits` | Fetch paginated benefits list | Confirmed (FR-10) |
| `GET /incentives/api/v1/benefits/categories` | Fetch category list for filter | Confirmed (existing endpoint in api.js) |
| `GET /incentives/api/v1/benefits/:benefitId` | Benefit detail — placeholder navigation target | [ASSUMED — out of scope in this release] |
| Programs list (Cap shell) | Filter options for Program filter | Confirmed (existing via makeSelectPrograms) |

### Third-Party Libraries
No new third-party libraries are required. The following existing libraries are leveraged:
- `immutable` (fromJS, ImmutableJS state)
- `reselect` (memoized selectors)
- `redux-saga/effects` (call, put, takeLatest, all)
- `lodash/debounce` (search debounce)
- `lodash/isEmpty` / `lodash/isNil` (filter state checks)
- `@capillarytech/cap-ui-library` (CapTable, CapInput, CapButton, CapRow, CapColumn, CapIcon, CapLabel, CapHeading, CapDivider, CapSkeleton)
- `@capillarytech/blaze-ui/CapUnifiedSelect` (multi-select in filter panel, same as PromotionList FilterPanel)
- `react-intl` (injectIntl, FormattedMessage)
- `styled-components` (component styling)

---

## 11. Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| `/incentives/api/v1/benefits` endpoint not ready when FE lands | High | Implement `USE_MOCK_BENEFITS_LIST` flag in `api.js` (same pattern as `USE_MOCK_BENEFITS_SETTINGS = true` already in codebase) to serve mock data; flip to false when BE is live |
| `getBenefitsCategories` response shape differs from `{id, name}` expected by filter panel | Medium | Add a response adapter/selector in the saga that normalises the shape; log a warning if the shape is wrong |
| `last_updated_by` metadata not returned as `{id, name}` object — only string name returned | Medium | Fall back to rendering name string only (no user ID linking); adapter in `BenefitsListTable/utils.js` |
| BenefitsList.js component growing beyond 500-line ESLint limit | Medium | Extract inline handlers to `useCallback` hooks early; if it grows, split toolbar into a `BenefitsListToolbar` molecule |
| Status enum mismatch between PRD's 6 values and actual API response values | Medium | `BenefitStatusTag/constants.js` defines a STATUS_CONFIG map — unknown values fall back to grey dot with raw label |
| IntersectionObserver not supported on very old browsers in embedded environments | Low | Feature-detect and fall back to scroll event listener; same risk exists in PromotionList |
| Tier event filter options (Upgrade/Downgrade/Renew) not backed by API endpoint — hardcoded | Low | Values are static per FR-08 (Q8 default); document as hardcoded in `BenefitsListFilterPanel/constants.js` |
| `CapButton` "Create Benefit" present in Figma (EXACT recipe match 8:2902) but excluded by PM | Low | Omit from implementation; if PM later enables it, CapButton is already in recipe with correct props |

### Architectural Deviations
None. The design follows the PromotionList pattern exactly. The new `BenefitStatusTag` atom is an additive pattern consistent with `PromotionStatusTag`.

### Known Unknowns
- Feature flag gating: PromotionList is wrapped by `isLoyaltyPromotionsV2Enabled` HOC. It is not confirmed whether BenefitsList requires a similar feature flag. If yes, a new flag HOC or reuse of the existing one must be decided before implementation.
- Navbar/sidebar entry position for `/benefits`: FR-01 states "adjacent to Promotions, position TBD by designer." The sidebar menu is driven by `getSettingsMenuData` in `app/components/pages/Cap/constants.js` — a new entry must be added there.
- `updaters` field: FR-11 says BE should emit `updaters: [{id, name}]` in the list response for "Last updated by" filter options. This is a BE contract not yet confirmed.

---

## 12. Non-Functional Requirements

### Performance
- **Initial render**: `BenefitsList` is loaded via `Loadable.js` (dynamic `import()`) so the chunk is not included in the main bundle. `CapSpin` is shown while the chunk loads.
- **Memoisation**: Use `withMemo` HOC (wraps React.memo) on `BenefitsList`. Use `useMemo` for derived values (`isLoading`, `showEmptyState`, `showFilteredEmpty`). Use `useCallback` for all event handlers (`debouncedSearch`, `handleApplyFilters`, `handleSortChange`, `handleScroll`).
- **Selector memoisation**: All selectors use `createSelector` from Reselect; `makeSelectBenefits()` factories are instantiated once per connected component instance, preventing selector recreation on every render.
- **Table rendering**: `CapTable` with `dataSource` bound to the Redux `benefits` ImmutableJS list (converted to JS at selector boundary). Column definitions are memoised outside the render function.
- **Debounce**: Search dispatches are debounced 300 ms (`DEFAULT_DEBOUNCE_TIME` from App constants) to avoid redundant API calls on fast typing.
- **Success criterion SC-1**: Listing loads within 2 s on a 100-row dataset (network excluded) — achievable with skeleton loading, CapTable virtual scrolling, and selector memoisation.

### Scalability
- **Data growth**: Infinite scroll constrains in-memory data to the loaded pages only (not all N records). The Redux append pattern (`list.concat(newPage)`) means memory grows proportionally with scrolling. For extreme cases (user scrolling through 1000+ records), a virtual-scroll enhancement (not in scope) would be needed.
- **Filter concurrency**: `takeLatest` in the saga ensures only the most recent request is processed, discarding in-flight requests cancelled by new filter/search changes.
- **API latency**: If the `/benefits` endpoint is slow, the skeleton loading state (FR-12) maintains perceived performance.

### Accessibility
- **Search input**: `CapInput` renders an `<input>` with standard keyboard accessibility. Placeholder text "Search" meets WCAG 1.4.3 (the icon prefix provides visual context; the input label provides programmatic context).
- **Status badges**: `BenefitStatusTag` must render the status label as visible text (not colour-only); the coloured dot is supplementary. This satisfies WCAG 1.4.1 (use of colour).
- **Table rows**: `CapTable` renders standard `<table>` markup; row click handlers must also respond to `onKeyDown` Enter/Space for keyboard users. `onRow` prop of CapTable should include `onClick` and `onKeyDown`.
- **Filter panel**: When `BenefitsListFilterPanel` opens, focus must move to the first interactive element inside the panel. When closed, focus returns to the filter icon trigger. This is standard drawer/modal accessibility (WCAG 2.4.3).
- **Loading state**: `CapSkeleton` rows should include `aria-busy="true"` on the table container while loading.

---

## 13. Testing Strategy Overview

### Key Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| Page mounts → dispatches GET_BENEFITS_LIST_REQUEST with default sort | happy-path | High |
| API returns 20 benefits → table renders 20 rows with correct columns | happy-path | High |
| API returns 0 benefits → EmptyStateIllustration shown with correct message | edge-case | High |
| User types search term → debounced dispatch after 300 ms → list refreshes | happy-path | High |
| User applies Status filter → API re-called with status query params | happy-path | High |
| User scrolls to bottom → pagination increments → next page appended to list | happy-path | High |
| API returns error (500) → inline error banner shown with retry button | error | High |
| User applies filter → no results → "No results match filters" state + clear link | edge-case | Medium |
| Column sort click (Updated at ↑) → GET_BENEFITS_LIST_REQUEST with new sortBy/order | happy-path | Medium |
| Row click → navigation to /benefits/:benefitId | happy-path | Medium |
| BenefitStatusTag: "active" status → green dot + "N days left" secondary text | happy-path | High |
| BenefitStatusTag: "upcoming" status → blue dot + "Starts in N days" text | happy-path | High |
| BenefitStatusTag: "ended" status → grey dot, no secondary line | edge-case | Medium |
| BenefitStatusTag: unknown status → grey dot + raw label (graceful fallback) | edge-case | Medium |
| Page unmount → clearBenefitsListData dispatched → Redux slice reset | edge-case | Medium |
| computeSecondaryStatus: endDate in past → returns empty string for active | edge-case | Low |
| Filter panel opens → first input receives focus | happy-path | Low |

### Unit Test Targets

| Target | Type | What to Test |
|--------|------|-------------|
| `reducer.js` | reducer | All action type cases: REQUEST, SUCCESS (page 1 replace), SUCCESS (page >1 append), FAILURE, CLEAR |
| `selectors.js` | selector | All selectors return correct values from mocked ImmutableJS state |
| `saga.js` | saga | Happy path: action → API call → success dispatch; failure path: API throws → failure dispatch |
| `BenefitStatusTag/utils.js` (computeSecondaryStatus) | unit | All 6 status values × date combinations; boundary cases (endDate == today) |
| `BenefitsListTable.js` | component | Column rendering; sort icon click; row click navigation; skeleton when loading; empty state |
| `BenefitsListFilterPanel.js` | component | Filter state updates; Apply button triggers onApply callback; Close triggers onClose |
| `BenefitsList.js` | integration | Mount → dispatch; search → debounce → dispatch; filter apply → dispatch; scroll → dispatch |

---

## 14. Architecture Alignment Notes

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| Atomic Design hierarchy | aligned | BenefitsList is a page, BenefitsListTable and BenefitsListFilterPanel are molecules (compositions with own behaviour), BenefitStatusTag is an atom. All match the definitions in architecture.md. |
| Cap-* component mandate | aligned | All UI elements use Cap* from `@capillarytech/cap-ui-library`: CapTable, CapInput, CapRow, CapColumn, CapHeading, CapIcon, CapDivider, CapSkeleton, CapLabel. CapUnifiedSelect from blaze-ui for multi-select (same as PromotionList FilterPanel). |
| CapRow/CapColumn layouts | aligned | Toolbar row uses CapRow. Page column wrapper uses CapColumn. No raw CSS flexbox for layout structure. |
| Redux file co-location | aligned | All Redux artifacts (constants.js, actions.js, reducer.js, selectors.js, saga.js) co-located inside `app/components/pages/BenefitsList/`. Matches the established convention. |
| Dynamic reducer/saga injection | aligned | BenefitsList Loadable uses `injectReducer` + `injectSaga` + `clearDataOnUnmount` HOCs from `vulcan-react-sdk/utils`, composed with `compose()`. Identical to PromotionList pattern. |
| Immutable.js state conventions | aligned | `initialState = fromJS({...})` in reducer. Selectors use `.get()` / `.toJS()`. `makeSelectBenefits()` factory pattern using `createSelector`. |
| styled-components styling | aligned | Styling via styled-components in `styles.js` per component. No CSS modules or inline styles for layout. |
| ESLint 500-line limit | aligned | BenefitsList.js is estimated at ~280–350 lines (comparable to PromotionList.js before its `eslint-disable max-lines` override). BenefitsListTable.js may approach limit due to column definitions — split into `utils.js` for column renderers as a preventive measure. |
| Saga concurrency model | aligned | `takeLatest` used for `watchForGetBenefitsListSaga` — correct for a data-fetch saga where the latest user action (search, filter, scroll) should cancel prior in-flight requests. |
| Redux inject key pattern | aligned | Inject key: `${CURRENT_APP_NAME}-benefits-list` — follows `${CURRENT_APP_NAME}-<slice-name>` convention exactly. |
| Compose pattern | aligned | `compose(injectReducer(...), injectSaga(...), clearDataOnUnmount(...), connect(mapStateToProps, mapDispatchToProps), withMemo)(BenefitsList)` — matches architecture.md compose export pattern. |

### Alignment with System Map Patterns

The BenefitsList data flow mirrors the `${CURRENT_APP_NAME}-promotions-list` slice pattern from the system map:

- **Redux store shape**: Identical field names and types (`items[]`, `status`, `error`, `totalPages`, `totalElements`) adapted for the benefits domain.
- **Saga trigger chain**: `GET_BENEFITS_LIST_REQUEST` → `takeLatest` → `getBenefitsListSaga` → `call(getBenefits, ...)` → `put(getBenefitsListSuccess/Failure)` — matches the `watchForGetPromotionsListSaga → getPromotionsListSaga` chain exactly.
- **Selector pattern**: `selectBenefitsListDomain` (top-level domain selector using CURRENT_APP_NAME key) → `makeSelectBenefits()` factory using `createSelector` — identical to `selectPromotionListDomain` → `makeSelectPromotions()` pattern.
- **Action naming**: `GET_BENEFITS_LIST_REQUEST/SUCCESS/FAILURE` — consistent with `GET_PROMOTIONS_LIST_REQUEST/SUCCESS/FAILURE` triplet convention from App/constants.
- **Reducer accumulation**: Page 1 replace / page > 1 concat — exact same logic as `promotionListReducer`.
- **Component composition**: `mapStateToProps` via `createStructuredSelector`, `mapDispatchToProps` via `bindActionCreators`, `connect(mSTP, mDTP)` — identical to PromotionList.

### Deviations and Justifications

No architectural deviations from established garuda-ui conventions. The feature is an intentional architectural clone of PromotionList adapted for the benefits domain.

One technical note: the `BenefitStatusTag` atom introduces a `computeSecondaryStatus` utility that performs client-side date arithmetic. This is new behaviour (PromotionStatusTag shows only status badges without secondary text). The risk is low — it is a pure function with no side effects, and the logic is isolated in `utils.js`.

---

## 15. Open Questions and Decisions Needed

| # | Question | Impact | Owner | Status | Comment |
|---|----------|--------|-------|--------|---------|
| 1 | **Figma-vs-Spec Conflict**: Figma node 8:2902 shows a "Create Benefit" `CapButton` (type=primary) in the toolbar; spec FR-02 (RESOLVED by PM Q3) says no Create Benefit button. Figma used as visual reference — confirm with PM which is correct before implementation. | Implementation omits the button. If Figma was updated after PM decision, button must be added back with appropriate routing. | PM + Designer | open | Figma shows button; spec says omit. Spec decision applied. |
| 2 | Feature flag gating: Should `/benefits` be gated behind a feature flag (similar to `isLoyaltyPromotionsV2Enabled` for PromotionList)? If yes, what is the flag name and where is it defined? | Determines whether Loadable.js wraps the page with a feature flag HOC | Tech Lead + PM | open | No flag mentioned in PRD; assume no gating unless specified |
| 3 | Sidebar/navbar entry for `/benefits`: Cap sidebar is driven by `getSettingsMenuData` in Cap constants. The new entry's label, icon, and position (adjacent to Promotions) need confirmation from Designer. | BenefitsList page is accessible but won't appear in the nav without this change | Designer + PM | open | FR-01 says "adjacent to Promotions, position TBD by designer" |
| 4 | `updaters` list in API response: FR-11 and FR-10 state BE should emit `updaters: [{id, name}]` alongside pagination in the list response for the "Last updated by" filter. This is a BE contract that needs confirmation before the filter panel implementation starts. | Without this, the "Last updated by" filter can't display user names | BE Lead | open | Default: render names from `last_updated_by.name` on each row; aggregate unique values client-side as fallback |
| 5 | Filter options source for Tier event: FR-08 resolves tier event as `{Upgrade, Downgrade, Renew}` hardcoded. However, actual tier events may vary by org. Should this be fetched from a loyalty tier/subscription endpoint per FR-11? | Determines whether a new API call is needed for tier event options | BE Lead + PM | open | Default: hardcode 3 values per Q8 default |
| 6 | Category filter options: `getBenefitsCategories` in `api.js` currently uses `USE_MOCK_BENEFITS_SETTINGS = true`. When this flag is flipped to false, will the real endpoint be ready? Should BenefitsList use its own mock flag or share the existing one? | Filter panel Category options may not populate in lower environments | BE Lead | open | Add `USE_MOCK_BENEFITS_LIST = true` flag for the listing endpoint; categories flag is shared |
| 7 | `CapButton` "Create Benefit" in Figma: Confirm whether the Figma design reflects a future state or was a designer draft. If future state, the button should be planned as a follow-up ticket. | Scoping clarity for design system consistency | Designer | open | Button present in Figma (EXACT recipe 8:2902) but excluded by PM decision |
| 8 | Benefit view page placeholder route `/benefits/:benefitId`: What should the placeholder render? An empty page, a "Coming soon" message, or redirect to `/benefits`? | UX for early release | PM | open | Spec says "route currently empty/placeholder" |

---

## Metadata

- **Feature**: Benefits Listing
- **PRD Source**: `claudeOutput/filteredPrd/benefits-listing-spec.md`
- **Generated by**: hld-generator agent
- **Timestamp**: 2026-04-13
- **Architecture Reference**: `.claude/output/architecture.md`
- **System Map Reference**: `.claude/output/loyalty-promotions-system-map.md`
- **Figma Recipes**: `claudeOutput/figma-capui-mapping/3-1022.recipe.json`
- **Prop-Spec Notes**: `claudeOutput/figma-capui-mapping/3-1022/prop-spec-notes.json`
