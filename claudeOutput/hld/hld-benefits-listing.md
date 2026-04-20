# High-Level Design: Benefits Listing

> **Generated**: 2026-04-20
> **PRD Source**: `claudeOutput/filteredPrd/benefits-listing-spec.md`
> **Architecture Reference**: `.claude/output/architecture.md`

---

## 1. Feature Overview

### Feature Name
Benefits Listing

### Description & Business Purpose

The Benefits Listing feature introduces a standalone page at `/benefits/listing` that gives operators a unified, searchable, filterable view of all loyalty benefits configured across programs. Operators can group results by category, by program type (tiers vs subscriptions), or scope the view to a specific tier or subscription program — all without leaving the page. Row-level quick actions (Duplicate, Change logs, Export data, Pause) are available on every benefit row via a three-dot overflow menu.

The business purpose is to close a visibility gap: benefits are currently only accessible inside the tier-scoped `LoyaltyProgramTiers` view, forcing operators to drill into individual tiers. This page provides a cross-program, cross-tier snapshot with search, filter, and grouping capabilities.

### Problem Statement

Operators who manage large loyalty programs have no single screen to inspect all configured benefits at once. They must navigate tier by tier to verify benefit configuration, check statuses, or identify duplicates. The Benefits Listing page eliminates that friction by surfacing all benefits in a single, filterable table.

### Target Users

Loyalty program operators (administrators) within the Capillary Intouch platform who configure and manage loyalty program benefits. These users are authenticated; no public access is required.

### Scope

**In Scope**:
- Standalone page at route `/benefits/listing` with no dependency on `LoyaltyProgramTiers`
- Benefits table with six columns: Name, Status, Duration, Program name, Category, Updated at
- Five canonical status values: Awaiting Approval, Draft, Upcoming, Live, Stopped
- Server-side search by benefit name (debounced)
- Filter drawer with six fields: Program name, Status, Category, Duration, Last updated, Updated by (all using `CapMultiSelect` except Duration which uses `CapDateRangePicker`)
- Four grouping/filter view states (flat list, by category, by program type, scoped to specific tier/program) — all client-side or re-query, no page navigation
- Pagination for the benefits table
- Three-dot overflow menu per row with four actions: Duplicate, Change logs, Export data, Pause
- Empty state when zero results are returned
- Navigation sidebar entry for Benefits

**Out of Scope**:
- Summary stats counters block (total / live / upcoming / ended) — omitted per Figma [RESOLVED Q1]
- Standalone "Tier/Subscription program" column — omitted; Figma uses combined "Updated at" column [RESOLVED Q2]
- Separate tabs or sub-routes for grouping views [RESOLVED Q3]
- Filter on Tier/Subscription program or tier event type [RESOLVED Q4]
- Permission gating on row actions [RESOLVED Q7]
- Connection to or replacement of `LoyaltyProgramTiers` page [RESOLVED Q10]
- Implementation details of the four row actions (handled in separate/follow-on specs)
- Search by description, ID, or external ID (deferred until API confirms support) [RESOLVED Q9]

---

## 2. Technical Objective

### Technical Goals

1. **Independence**: The new page must have zero code or data dependency on `LoyaltyProgramTiers` (FR-2). It injects its own Redux slice and saga at mount time following the existing dynamic injection pattern.
2. **Scalability**: Pagination via server-side API avoids loading all benefits at once. The search debounce pattern (from `PromotionList`) is reused to limit API call frequency.
3. **Maintainability**: Follow the existing atomic design hierarchy (atoms → molecules → organisms → page) and Redux file co-location convention. The filter drawer is encapsulated in a dedicated molecule, making it independently testable.
4. **Performance**: `CapTable` with server-side data keeps the DOM lean. Reselect memoized selectors prevent unnecessary re-renders. The grouping transformation is applied client-side on the already-fetched page of results.
5. **Consistency**: Status chips, row actions, empty states, and filter interactions match the visual and behavioural patterns established in `PromotionList` and `PromotionsListingTable`.

### Architecture Fit

The Benefits Listing page follows the same architectural pattern as `PromotionList`:

- A **page-level container** (`BenefitsListing`) with its own Redux slice injected at mount via `injectReducer` / `injectSaga` HOCs composed with `compose()`.
- A **molecule** (`BenefitsFilterDrawer`) containing the filter form, opened via a `CapDrawer`.
- A **molecule** (`BenefitsTable`) wrapping `CapTable` with the column definitions and row action menu.
- A **molecule** (`BenefitsSearchInput`) for the debounced search field, reusing the structural pattern from `PromotionsSearchInput`.
- All async side effects in a single saga file using `takeLatest` concurrency.
- ImmutableJS state with `fromJS()` initial state and Reselect selectors.

---

## 3. Impact Analysis

### New Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `BenefitsListing` | page | `app/components/pages/BenefitsListing/` | Route container; injects Redux slice and saga; connects table, search, filter, grouping controls |
| `BenefitsTable` | molecule | `app/components/molecules/BenefitsTable/` | `CapTable` wrapper with column definitions, status chips, and three-dot overflow menu per row |
| `BenefitsFilterDrawer` | molecule | `app/components/molecules/BenefitsFilterDrawer/` | `CapDrawer` containing six `CapMultiSelect` / `CapDateRangePicker` filter fields, Apply and Clear all buttons |
| `BenefitsSearchInput` | molecule | `app/components/molecules/BenefitsSearchInput/` | Debounced search input using `CapInput`; dispatches search query to Redux on change |
| `BenefitsGroupingControl` | molecule | `app/components/molecules/BenefitsGroupingControl/` | Dropdown or segmented control allowing user to select one of four grouping/filter states |
| `BenefitStatusTag` | atom | `app/components/atoms/BenefitStatusTag/` | Styled `CapStatus` wrapper mapping five canonical status values to their display colours |

### Modified Components

| Component | Location | Change Description |
|-----------|----------|--------------------|
| `Cap` (navigation) | `app/components/pages/Cap/` | Add "Benefits" (or "Benefits Listing") entry to the sidebar navigation menu configuration |
| `App` (router) | `app/components/pages/App/` | Register `/benefits/listing` route pointing to `BenefitsListing/Loadable` |

### New Redux Domains

| Domain | Inject Key | Reducer | Saga | Purpose |
|--------|-----------|---------|------|---------|
| Benefits Listing | `${CURRENT_APP_NAME}-benefits-listing` | `BenefitsListing/reducer.js` | `BenefitsListing/saga.js` | Stores paginated benefit records, fetch status, search term, active filters, grouping state, and pagination |

### New Routes

| Route Path | Component | Auth Required | Description |
|------------|-----------|---------------|-------------|
| `/benefits/listing` | `BenefitsListing/Loadable` | Yes (`userIsAuthenticated`) | Standalone benefits listing page; does not nest under tier management routes |

### Shared Utilities / Hooks

| Name | Location | New/Modified | Purpose |
|------|----------|-------------|---------|
| `useDebouncedCallback` | `app/utils/hooks/` | Existing (reuse) | Debounce search input dispatches |
| Benefits-specific GTM constants | `app/utils/GTM/constants.js` | Modified | Add `BENEFITS_FILTERED` and `BENEFITS_SEARCHED` GTM event types |

---

## 4. UI/UX Changes

### Screen Flow

The operator navigates to `/benefits/listing`. On mount the page dispatches `GET_BENEFITS_LIST_REQUEST` which triggers the benefits listing saga. The table renders with paginated results. The operator may:

1. Type in the search box → debounced dispatch of `GET_BENEFITS_LIST_REQUEST` with `searchTerm` → table re-renders.
2. Click the filter icon → `CapDrawer` opens (`BenefitsFilterDrawer`) → operator selects filter values and clicks Apply → dispatches `SET_ACTIVE_FILTERS` + `GET_BENEFITS_LIST_REQUEST` → table re-renders.
3. Use the grouping control → dispatches `SET_GROUPING_MODE` → client-side transformation or re-query groups table rows.
4. Click the three-dot menu on any row → `CapDropdown` overlay shows four actions.
5. Click "Create Benefit" → navigates to a benefit creation route (out of scope for this spec).

---

### Screen: Benefits Listing Page

**Route**: `/benefits/listing`
**Purpose**: Flat-list view (default) of all configured benefits, with search, filter, grouping, pagination, and row-level actions.

**Component Boundaries**:

- `BenefitsListing` (page): Root container. Connected to Redux via `connect()`. Injects `${CURRENT_APP_NAME}-benefits-listing` reducer and saga. Owns local state: `groupingMode` (flat|byCategory|byProgramType|specific), `selectedScope` (specific tier/program ID when mode = specific).
- `BenefitsSearchInput` (molecule): Controlled search input. Dispatches `GET_BENEFITS_LIST_REQUEST` on debounced change. Dispatches `CLEAR_SEARCH` on clear.
- `BenefitsFilterDrawer` (molecule): `CapDrawer` rendered conditionally when `isFilterDrawerOpen` local state is true. Contains six filter fields using `CapMultiSelect` (Program name, Status, Category, Last updated, Updated by) and `CapDateRangePicker` (Duration). Footer has Apply (`CapButton` primary) and Clear all filters (`CapButton` default).
- `BenefitsGroupingControl` (molecule): Control to select the grouping mode. Dispatches `SET_GROUPING_MODE`.
- `BenefitsTable` (molecule): `CapTable` with server-fetched `dataSource` and declarative `columns` config. Each column maps to a Figma column: Name (with description/ID subtext), Status (`BenefitStatusTag`), Duration, Program name, Category, Updated at (date + actor). Last column appended: three-dot `CapDropdown` with four action items.
- `BenefitStatusTag` (atom): Thin styled wrapper around `CapStatus` with colour mapping for five status values.

**Component Recipe** *(recipe-verified from figma-node-mapper — review and correct before code generation)*:

Listing Page (node 123:5146):

| UI Section | Cap* Component | Node ID | Recipe Status | Reviewer Override |
|------------|----------------|---------|---------------|-------------------|
| Page Title "Benefits" | `CapLabel` | 123:5153 | EXACT | |
| Toolbar Row (search + filter + CTA area) | `CapRow` | 123:5154 | EXACT | |
| Search Input Field | `CapFormItem` (wraps styled CapInput) | 123:5161 | PARTIAL | `CapInput` (search-styled) |
| Vertical Divider (search / filter separator) | `CapDivider` | 123:5172 | PARTIAL | |
| Filter Icon | `CapIcon` | 123:5173 | UNMAPPED → `CapIcon` | |
| Create Benefit CTA Button | `CapButton` | 123:5176 | EXACT | |
| Table Body Container | `CapRow` (recipe) | 123:5178 | PARTIAL | `CapTable` (BESPOKE — multi-column data table; CapRow is structurally incompatible) |
| Name Column | `CapColumn` | 123:5179 | EXACT | |
| Name Column Header Row | `CapRow` | 123:5180 | EXACT | |
| Name Cell Row | `CapRow` | 123:5181 | PARTIAL | |
| Benefit Name Text | `CapLabel` | 123:5184 | EXACT | |
| Benefit ID subtext | `CapLabel` | 123:5189 | EXACT | |
| Benefit EXT ID subtext | `CapLabel` | 123:5191 | EXACT | |
| Status Column | `CapColumn` | 123:5303 | EXACT | |
| Status Header Row | `CapRow` | 123:5304 | EXACT | |
| Status Cell | `CapRow` | 123:5307 | PARTIAL | |
| Status Chip / Badge | `CapStatus` | 123:5312 | PARTIAL | |
| Duration Column | `CapColumn` | 123:5367 | EXACT | |
| Program Name Column | `CapColumn` | 123:5495 | EXACT | |
| Program Name Cell Label | `CapLabel` | 123:5517 | EXACT | |
| Category Column | `CapColumn` | 123:5532 | EXACT | |
| Category Cell Label | `CapLabel` | 123:5538 | EXACT | |
| Updated At Column (with three-dot menu) | `CapColumn` | 123:5810 | EXACT | |
| Three-dot Overflow Menu | `CapDropdown` | 123:5964 | PARTIAL | CapRaw (Wrong fram ignore this)|
| Dropdown Row Options | `CapRow` | 123:5968 | EXACT | |

> **Note**: The Table Body Container (node 123:5178, "Custom Field") maps to `CapRow` in the recipe (PARTIAL, structural match). However, the Figma screenshot clearly shows a multi-column data table with sortable column headers and paginated rows. `CapTable` is the correct semantic component — it accepts a `columns` definition array and a `dataSource` prop and renders exactly this structure. The `Reviewer Override` column is populated with `CapTable` accordingly. The `BenefitsTable` organism will wrap `CapTable` with the column definitions.

*Recipe source*: `claudeOutput/figma-capui-mapping/123-5146.recipe.json`
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/123-5146/prop-spec-notes.json`

Filter Drawer (node 122:4327):

| UI Section | Cap* Component | Node ID | Recipe Status | Reviewer Override |
|------------|----------------|---------|---------------|-------------------|
| Drawer Container | `CapDrawer` | 122:4327 | PARTIAL | |
| Drawer Header "Benefit filters" | `CapLabel` | I122:4328;6:11518 | PARTIAL | |
| Close Icon | `CapIcon` | I122:4328;6:11519 | PARTIAL | |
| Program name Field Label | `CapLabel` | 122:4333 | EXACT | |
| Program name Multi-Select | `CapMultiSelect` | 122:4334 | PARTIAL | |
| Status Field Label | `CapLabel` | 122:4345 | EXACT | |
| Status Multi-Select | `CapMultiSelect` | 122:4346 | EXACT (instance) | |
| Category Field Label | `CapLabel` | 122:4350 | EXACT | |
| Category Multi-Select | `CapMultiSelect` | 122:4351 | EXACT (instance) | |
| Duration Field Label | `CapLabel` | 122:4357 | EXACT | |
| Duration Date Range Picker | `CapDateRangePicker` | 122:4358 | PARTIAL (from name) | `CapDateRangePicker` (use CapDateRangePicker input from cap-ui-library) |
| Last updated Field Label | `CapLabel` | 122:4370 | EXACT | |
| Last updated Multi-Select | `CapMultiSelect` | 122:4371 | PARTIAL | |
| Updated by Field Label | `CapLabel` | 122:4384 | EXACT | |
| Updated by Multi-Select | `CapMultiSelect` | 122:4385 | PARTIAL | |
| Apply Button | `CapButton` | 122:4395 | EXACT (instance) | |
| Clear all filters Button | `CapButton` | 122:4396 | EXACT (instance) | |

*Recipe source*: `claudeOutput/figma-capui-mapping/122-4327.recipe.json`
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/122-4327/prop-spec-notes.json`

> **Note**: All Cap* leaf-level components in the ASCII diagrams below match the recipe entries listed above.

**Recipe verification**: The `sectionComponentMap` for the listing page identifies `CapLabel` (page title), `CapRow` (toolbar), `CapInput`-based search, `CapIcon` (filter icon), `CapButton` (CTA), `CapTable` (data table override), `CapColumn` (table columns), `CapStatus` (status chips), and `CapDropdown` (overflow menu). Every leaf-level Cap* component in the diagram below appears in the recipe table above. The table body override from `CapRow` to `CapTable` is flagged in the Reviewer Override column.

**User Interactions → Redux Actions**:

| User Action | Component | Dispatched Action | Saga Triggered |
|-------------|-----------|-------------------|----------------|
| Page mount | `BenefitsListing` | `GET_BENEFITS_LIST_REQUEST` (page 0, no filters) | `getBenefitsListSaga` |
| Type in search box (debounced) | `BenefitsSearchInput` | `GET_BENEFITS_LIST_REQUEST` (searchTerm, page 0) | `getBenefitsListSaga` |
| Clear search | `BenefitsSearchInput` | `CLEAR_SEARCH` + `GET_BENEFITS_LIST_REQUEST` | `getBenefitsListSaga` |
| Click filter icon | `BenefitsListing` (local state) | — (opens `isFilterDrawerOpen`) | — |
| Click Apply in filter drawer | `BenefitsFilterDrawer` | `SET_ACTIVE_FILTERS` + `GET_BENEFITS_LIST_REQUEST` | `getBenefitsListSaga` |
| Click Clear all filters | `BenefitsFilterDrawer` | `CLEAR_ACTIVE_FILTERS` + `GET_BENEFITS_LIST_REQUEST` | `getBenefitsListSaga` |
| Change grouping mode | `BenefitsGroupingControl` | `SET_GROUPING_MODE` | — (client-side transform) |
| Change pagination | `BenefitsTable` / `CapTable` | `GET_BENEFITS_LIST_REQUEST` (new page) | `getBenefitsListSaga` |
| Click three-dot menu | `BenefitsTable` / `CapDropdown` | — (opens dropdown overlay) | — |
| Select row action (Duplicate / Change logs / Export data / Pause) | `BenefitsTable` | [Action-specific, out of scope for this spec] | [Out of scope] |
| Click Create Benefit | `BenefitsListing` | — (navigation) | — |

**Architecture Diagram — Benefits Listing Page**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ BenefitsListing (page)                                                 │
│ Route: /benefits/listing                                               │
│ Redux: ${CURRENT_APP_NAME}-benefits-listing                            │
│ Saga: getBenefitsListSaga (takeLatest)                                 │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Toolbar (CapRow)                             dispatch on mount:  │   │
│ │                                             GET_BENEFITS_LIST_  │   │
│ │ [CapLabel: "Benefits"]                       REQUEST             │   │
│ │ [BenefitsSearchInput (molecule)            ]                     │   │
│ │   CapInput (styled)                                              │   │
│ │   dispatch: GET_BENEFITS_LIST_REQUEST                            │   │
│ │ [CapDivider (vertical)]                                          │   │
│ │ [CapIcon: filter → opens BenefitsFilterDrawer]                  │   │
│ │ [BenefitsGroupingControl (molecule)]                             │   │
│ │   dispatch: SET_GROUPING_MODE                                    │   │
│ │ [CapButton: "Create Benefit" → /benefits/new]                    │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ BenefitsTable (molecule)                                         │   │
│ │ Redux ← makeSelectBenefits(), makeSelectBenefitsStatus()         │   │
│ │ Saga ← getBenefitsListSaga                                       │   │
│ │                                                                  │   │
│ │ CapTable [                                                       │   │
│ │   columns: Name | Status | Duration | Program | Category | Upd.  │   │
│ │   ┌─────────────────────────────────────────────────────────┐   │   │
│ │   │ BenefitRow (CapRow, per-row rendering)                  │   │   │
│ │   │ [CapLabel: name + CapLabel: desc + CapLabel: ID]         │   │   │
│ │   │ [BenefitStatusTag → CapStatus]                          │   │   │
│ │   │ [CapLabel: duration start–end]                          │   │   │
│ │   │ [CapLabel: program name]                                │   │   │
│ │   │ [CapLabel: category]                                    │   │   │
│ │   │ [CapLabel: updated datetime / actor]                    │   │   │
│ │   │ [CapDropdown: ••• menu]                                 │   │   │
│ │   │   Duplicate / Change logs / Export data / Pause         │   │   │
│ │   └─────────────────────────────────────────────────────────┘   │   │
│ │ ]                                                                │   │
│ │ [CapTable built-in pagination → GET_BENEFITS_LIST_REQUEST]       │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ BenefitsFilterDrawer (molecule)                                  │   │
│ │ [conditionally rendered via isFilterDrawerOpen local state]      │   │
│ │ CapDrawer [placement=right, width=440]                           │   │
│ │   CapMultiSelect: Program name                                   │   │
│ │   CapMultiSelect: Status                                         │   │
│ │   CapMultiSelect: Category                                       │   │
│ │   CapDateRangePicker: Duration (BESPOKE)                         │   │
│ │   CapMultiSelect: Last updated                                   │   │
│ │   CapMultiSelect: Updated by                                     │   │
│ │   CapButton: Apply → SET_ACTIVE_FILTERS + GET_BENEFITS_LIST_     │   │
│ │   CapButton: Clear all filters → CLEAR_ACTIVE_FILTERS            │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ [EmptyStateIllustration — when benefitsStatus = SUCCESS, data = []]    │
└────────────────────────────────────────────────────────────────────────┘
```

[See: Benefits Listing Page](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=123-5146&m=dev)

---

### Screen: Benefits Filter Drawer

**Route**: No dedicated route — slide-in overlay on `/benefits/listing`
**Purpose**: Allow operators to filter the benefits table by up to six criteria simultaneously.

**Component Boundaries**:

The `BenefitsFilterDrawer` molecule encapsulates all filter state. On "Apply" it calls an `onApply` callback passed from the parent page. The parent dispatches `SET_ACTIVE_FILTERS` followed by `GET_BENEFITS_LIST_REQUEST` with the new filter parameters.

**Architecture Diagram — Benefits Filter Drawer**:

```
┌──────────────────────────────────────────────┐
│ BenefitsFilterDrawer (molecule)              │
│ [Rendered inside BenefitsListing]            │
│ Props: visible, onClose, onApply, programs,  │
│        categories, updatedByUsers            │
│                                              │
│ CapDrawer [placement=right, width=440]       │
│ ┌──────────────────────────────────────────┐ │
│ │ Drawer Header                            │ │
│ │ [CapLabel: "Benefit filters"]            │ │
│ │ [CapIcon: close → onClose]               │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Filter Fields Body (CapColumn)           │ │
│ │ CapLabel: "Program name"                 │ │
│ │ CapMultiSelect: programs                 │ │
│ │ CapLabel: "Status"                       │ │
│ │ CapMultiSelect: statuses (5 options)     │ │
│ │ CapLabel: "Category"                     │ │
│ │ CapMultiSelect: categories               │ │
│ │ CapLabel: "Duration"                     │ │
│ │ CapDateRangePicker (BESPOKE)             │ │
│ │ CapLabel: "Last updated"                 │ │
│ │ CapMultiSelect: presets (5 options)      │ │
│ │ CapLabel: "Updated by"                   │ │
│ │ CapMultiSelect: users                    │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Drawer Footer (CapRow)                   │ │
│ │ [CapButton: Apply → onApply]             │ │
│ │ [CapButton: Clear all filters → onClear] │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

[See: Benefits Filter Drawer](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=122-4327&m=dev)

---

## 5. Directory Structure

```
app/components/
├── pages/
│   └── BenefitsListing/
│       ├── index.js              # Public export → Loadable.js
│       ├── Loadable.js           # Dynamic import + withCustomAuthAndTranslations HOC
│       ├── BenefitsListing.js    # Main page component with connect()
│       ├── constants.js          # defineActionTypes: GET_BENEFITS_LIST_REQUEST etc.
│       ├── actions.js            # Action creators: getBenefitsList, setActiveFilters etc.
│       ├── reducer.js            # fromJS() initialState; ImmutableJS reducer
│       ├── selectors.js          # makeSelectBenefits(), makeSelectBenefitsStatus() etc.
│       ├── saga.js               # watchForGetBenefitsListSaga, getBenefitsListSaga
│       ├── messages.js           # react-intl message descriptors
│       └── styles.js             # styled-components or CSS-in-JS
├── molecules/
│   ├── BenefitsTable/
│   │   ├── index.js              # Public export
│   │   ├── BenefitsTable.js      # CapTable with columns config + CapDropdown per row
│   │   ├── columnConfig.js       # Declarative columns array for CapTable
│   │   └── styles.js
│   ├── BenefitsFilterDrawer/
│   │   ├── index.js              # Public export
│   │   ├── BenefitsFilterDrawer.js  # CapDrawer with 6 filter fields
│   │   ├── filterConstants.js    # STATUS_OPTIONS, LAST_UPDATED_PRESETS
│   │   └── styles.js
│   ├── BenefitsSearchInput/
│   │   ├── index.js
│   │   └── BenefitsSearchInput.js  # CapInput with debounced onChange
│   └── BenefitsGroupingControl/
│       ├── index.js
│       └── BenefitsGroupingControl.js  # Grouping mode selector control
└── atoms/
    └── BenefitStatusTag/
        ├── index.js
        └── BenefitStatusTag.js   # styled(CapStatus) with status-to-colour mapping
```

### Naming Conventions

- Page: `BenefitsListing` (PascalCase), folder `BenefitsListing/`
- Molecules: `Benefits` prefix + noun describing responsibility (`BenefitsTable`, `BenefitsFilterDrawer`, `BenefitsSearchInput`, `BenefitsGroupingControl`)
- Atoms: `BenefitStatusTag` (singular entity)
- Redux action types: `BENEFITS_` prefix in ALL_CAPS snake_case, wrapped in `defineActionTypes()`
- Redux inject key: `${CURRENT_APP_NAME}-benefits-listing`
- Selectors: `makeSelectBenefits()`, `makeSelectBenefitsStatus()` etc. (factory function pattern)
- Saga watchers: `watchForGetBenefitsListSaga`, worker: `getBenefitsListSaga`
- API service function: `getBenefits` in `app/services/api.js`

---

## 6. API Structure

### API: Get Benefits List

**Status**: [ASSUMED — API spec not provided. FR-22: contract to be replaced when BE confirms endpoint. Fields inferred from Figma columns per Q8 resolution.]

| Field | Value |
|-------|-------|
| Endpoint | `GET /loyalty/api/v1/benefits` |
| Method | `GET` |
| Auth | Yes |

**Request Payload** (query parameters):

```json
{
  "page": 0,
  "size": 10,
  "searchText": "string (optional, benefit name search)",
  "status": ["Awaiting Approval", "Draft", "Upcoming", "Live", "Stopped"],
  "programName": ["string"],
  "category": ["string"],
  "startDate": "ISO 8601 datetime (optional, duration start)",
  "endDate": "ISO 8601 datetime (optional, duration end)",
  "lastModifiedFrom": "ISO 8601 datetime (optional, last updated start)",
  "lastModifiedTo": "ISO 8601 datetime (optional, last updated end)",
  "lastUpdatedPreset": "TODAY | YESTERDAY | LAST_7_DAYS | LAST_30_DAYS | LAST_90_DAYS (optional)",
  "updatedBy": ["string (actor user IDs or names)"],
  "groupBy": "CATEGORY | PROGRAM_TYPE | SPECIFIC (optional)"
}
```

**Response Payload**:

```json
{
  "data": {
    "content": [
      {
        "id": "string",
        "externalId": "string",
        "name": "string",
        "description": "string",
        "status": "Awaiting Approval | Draft | Upcoming | Live | Stopped",
        "programName": "string",
        "category": "string",
        "startDate": "ISO 8601 datetime",
        "endDate": "ISO 8601 datetime",
        "lastModifiedDate": "ISO 8601 datetime",
        "lastModifiedBy": "string (actor display name)"
      }
    ],
    "totalPages": 5,
    "totalElements": 48
  }
}
```

**Validation Rules**:
- `page` must be >= 0; `size` must be between 1 and 100
- `status` values must be one of the five canonical values
- `startDate` must be before `endDate` if both provided
- `lastModifiedFrom` must be before `lastModifiedTo` if both provided
- `searchText` minimum length: 1 character

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | `INVALID_FILTER_PARAMS` | Malformed date range, invalid status value, or invalid page size |
| 401 | `UNAUTHORIZED` | Missing or expired authentication token |
| 403 | `FORBIDDEN` | User does not have read access to benefits |
| 404 | `NOT_FOUND` | The benefits endpoint does not exist (API not yet deployed) |
| 500 | `INTERNAL_SERVER_ERROR` | Server-side failure |

---

### API: Get Filter Options (Programs, Categories, Updated-by Users)

**Status**: [ASSUMED — API spec not provided. These reference data calls are assumed from the filter drawer design which shows Program name and Updated by as multi-select fields.]

| Field | Value |
|-------|-------|
| Endpoint | `GET /loyalty/api/v1/programs` (programs), `GET /loyalty/api/v1/benefit-categories` (categories), `GET /arya/api/v1/org-users` (updated by users) |
| Method | `GET` |
| Auth | Yes |

**Response Payload (Programs)**:
```json
{
  "data": [{ "id": "string", "name": "string" }]
}
```

**Response Payload (Categories)**:
```json
{
  "data": [{ "id": "string", "label": "string" }]
}
```

**Error States**: Standard 400, 401, 403, 500.

---

## 7. Data and State Management Overview

### Redux Store Shape

```javascript
// Inject key: ${CURRENT_APP_NAME}-benefits-listing
fromJS({
  benefits: [],                 // Array of benefit objects from API
  benefitsStatus: 'INITIAL',    // INITIAL | REQUEST | SUCCESS | FAILURE
  benefitsError: null,          // Error object from failed API call
  totalPages: 0,
  totalElements: 0,
  activeFilters: {              // Currently applied filter selections
    status: [],
    programName: [],
    category: [],
    duration: { startDate: null, endDate: null },
    lastUpdatedPreset: null,
    updatedBy: [],
  },
  programs: [],                 // Reference data for Program name filter options
  categories: [],               // Reference data for Category filter options
  updatedByUsers: [],           // Reference data for Updated by filter options
  programsStatus: 'INITIAL',
  categoriesStatus: 'INITIAL',
})
```

### Actions

| Action Type | Creator | Purpose |
|-------------|---------|---------|
| `GET_BENEFITS_LIST_REQUEST` | `getBenefitsList(searchTerm, activeFilters, pagination)` | Trigger benefits fetch saga |
| `GET_BENEFITS_LIST_SUCCESS` | `getBenefitsListSuccess(data, pagination)` | Store fetched benefits + totals |
| `GET_BENEFITS_LIST_FAILURE` | `getBenefitsListFailure(error)` | Store error, reset status |
| `SET_ACTIVE_FILTERS` | `setActiveFilters(filters)` | Update active filter state |
| `CLEAR_ACTIVE_FILTERS` | `clearActiveFilters()` | Reset all filters to empty |
| `CLEAR_SEARCH` | `clearSearch()` | Clear search term from local state |
| `SET_BENEFITS_STATUS` | `setBenefitsStatus(status)` | Directly set status (for loading resets) |
| `GET_PROGRAMS_REQUEST` | `getPrograms()` | Fetch program list for filter dropdown |
| `GET_PROGRAMS_SUCCESS` | `getProgramsSuccess(programs)` | Store program list |
| `GET_CATEGORIES_REQUEST` | `getCategories()` | Fetch category list for filter dropdown |
| `GET_CATEGORIES_SUCCESS` | `getCategoriesSuccess(categories)` | Store category list |
| `CLEAR_DATA` | `clearData()` | Reset slice to initialState on unmount |

### Selectors

| Selector | State Path | Returns |
|----------|-----------|---------|
| `makeSelectBenefits()` | `benefits-listing.benefits` | `Benefit[]` (toJS) |
| `makeSelectBenefitsStatus()` | `benefits-listing.benefitsStatus` | `string` |
| `makeSelectBenefitsError()` | `benefits-listing.benefitsError` | `Error \| null` |
| `makeSelectTotalPages()` | `benefits-listing.totalPages` | `number` |
| `makeSelectTotalElements()` | `benefits-listing.totalElements` | `number` |
| `makeSelectActiveFilters()` | `benefits-listing.activeFilters` | `FilterState` object (toJS) |
| `makeSelectPrograms()` | `benefits-listing.programs` | `Program[]` (toJS) |
| `makeSelectCategories()` | `benefits-listing.categories` | `Category[]` (toJS) |

### Saga Orchestration

| Saga | Trigger Action | API Call | On Success | On Failure | Concurrency |
|------|---------------|----------|------------|------------|-------------|
| `getBenefitsListSaga` | `GET_BENEFITS_LIST_REQUEST` | `getBenefits(searchTerm, filters, pagination)` | `getBenefitsListSuccess(data, pagination)` | `getBenefitsListFailure(error)` | `takeLatest` |
| `getProgramsSaga` | `GET_PROGRAMS_REQUEST` | `getBenefitPrograms()` | `getProgramsSuccess(programs)` | `getProgramsFailure(error)` | `takeLatest` |
| `getCategoriesSaga` | `GET_CATEGORIES_REQUEST` | `getBenefitCategories()` | `getCategoriesSuccess(categories)` | `getCategoriesFailure(error)` | `takeLatest` |

### Local State vs Redux State

| Data Point | Storage | Rationale |
|-----------|---------|-----------|
| `isFilterDrawerOpen` | Local (`useState`) | UI-only toggle; no need to persist in Redux |
| `groupingMode` | Local (`useState`) | Client-side view transformation; can be reset on unmount |
| `selectedScope` | Local (`useState`) | Specific tier/program scope selection; UI-only until a re-query is triggered |
| `searchTerm` | Local (`useState`) | Controlled input; the debounced value is dispatched to Redux via action |
| `benefits[]` | Redux | Server-fetched data shared across potential child components |
| `benefitsStatus` | Redux | Loading/error states needed in multiple UI sections |
| `activeFilters` | Redux | Applied filter set is the source of truth for API re-fetches on pagination/sort |
| `totalPages / totalElements` | Redux | Pagination metadata needed by `CapTable` |
| `programs / categories` | Redux | Reference data fetched once and reused by filter drawer |

---

## 8. Validation

### Client-Side Validation

| Screen | Field | Rule | Message |
|--------|-------|------|---------|
| Benefits Listing | Search input | Minimum 1 character before debounce fires | — (silent; empty clears search) |
| Filter Drawer | Duration start date | Must be before or equal to end date | "Start date must be before end date" |
| Filter Drawer | Duration end date | Must be after or equal to start date | "End date must be after start date" |
| Filter Drawer | All multi-select fields | At least one value selected if field is touched (no empty apply) | [ASSUMED — apply with zero selections clears that filter silently] |

### Server-Side Validation Handling

The saga pattern from `PromotionList` is followed: the saga wraps the API call in a `try/catch`. If the response contains an `errors` array, the saga dispatches `getBenefitsListFailure`. If a non-2xx response throws, the catch block dispatches `getBenefitsListFailure(error)`. The `BenefitsTable` component renders an error state (using the existing `EmptyStateIllustration` molecule with an error variant) when `benefitsStatus === FAILURE`.

---

## 9. Reusable Patterns and Shared Utilities

### Existing to Reuse

| Component/Utility | Location | Usage in This Feature |
|-------------------|----------|-----------------------|
| `EmptyStateIllustration` | `app/components/molecules/EmptyStateIllustration/` | Empty state when search / filter returns zero results (FR-14) |
| `EmptyStateView` | `app/components/molecules/EmptyStateView/` | Alternative empty state for no benefits configured at all |
| `FilterPanel` | `app/components/molecules/FilterPanel/` | Reference implementation for filter UI pattern (not reused directly; `BenefitsFilterDrawer` follows same structural approach) |
| `FiltersApplied` | `app/components/molecules/FiltersApplied/` | Display applied filter tags above table (can be reused directly or adapted) |
| `PromotionsSearchInput` | `app/components/molecules/PromotionsSearchInput/` | Reference for debounced search input pattern; `BenefitsSearchInput` follows the same structure |
| `useDebouncedCallback` | `app/utils/hooks/` | Debounce the search dispatch in `BenefitsSearchInput` |
| `injectReducer` | `app/utils/injectReducer.js` | Dynamic reducer injection HOC for `BenefitsListing` |
| `injectSaga` | `app/utils/injectSaga.js` | Dynamic saga injection HOC (DAEMON mode) for `BenefitsListing` |
| `withCustomAuthAndTranslations` | `@capillarytech/vulcan-react-sdk/utils` | Wrap `Loadable.js` for auth + i18n |
| `authWrapper.userIsAuthenticated` | `app/utils/authWrapper.js` | Route protection (applied via `Cap` shell) |
| `REQUEST / SUCCESS / FAILURE / INITIAL` | `app/components/pages/App/constants.js` | Status constant values for reducer |
| `fromJS` | `immutable` | Initial state construction |
| `createSelector` | `reselect` | Memoized selectors |

### New Patterns Introduced

1. **Benefits grouping transformation**: Client-side grouping of a paginated list by category or program type. This is a new presentation pattern in garuda-ui — existing list pages (PromotionList) do not support grouped views. The `BenefitsListing` page will implement a `groupBenefits(benefits, groupingMode)` utility function in a co-located `utils.js` file. This pattern can be reused by future listing pages that require grouped views.

2. **`CapDateRangePicker` in filter drawers**: The existing `FilterPanel` molecule uses custom date inputs. The Benefits filter drawer introduces `CapDateRangePicker` (Figma node `122:4358`) as the date range component. This is BESPOKE — confirm availability in `cap-ui-library` before implementation, or build a styled date-range input.

---

## 10. Dependencies

### Internal Module Dependencies

| Module | Purpose | Status |
|--------|---------|--------|
| `app/components/pages/App` | Route registration for `/benefits/listing` | existing (modify) |
| `app/components/pages/Cap` | Sidebar navigation entry for Benefits | existing (modify) |
| `app/services/api.js` | Add `getBenefits()`, `getBenefitPrograms()`, `getBenefitCategories()` API functions | existing (modify) |
| `app/config/endpoints.js` | Confirm loyalty API base URL for benefits endpoint | existing |
| `app/components/molecules/EmptyStateIllustration` | Empty state rendering | existing (reuse) |
| `app/components/molecules/FiltersApplied` | Applied filter tags display | existing (reuse) |
| `app/utils/hooks/useDebouncedCallback` | Search debounce | existing (reuse) |
| `app/utils/injectReducer.js` | HOC for dynamic reducer | existing (reuse) |
| `app/utils/injectSaga.js` | HOC for dynamic saga (DAEMON) | existing (reuse) |
| `app/utils/GTM/constants.js` | Add GTM event type constants | existing (modify) |

### External API Dependencies

| API | Purpose | Status |
|-----|---------|--------|
| Benefits listing API (`GET /loyalty/api/v1/benefits`) | Fetch paginated, searchable, filterable benefit records | [ASSUMED — BE contract pending Q8] |
| Programs API (`GET /loyalty/api/v1/programs`) | Populate Program name filter options | [ASSUMED] |
| Benefit categories API (`GET /loyalty/api/v1/benefit-categories`) | Populate Category filter options | [ASSUMED] |
| Org users API (`GET /arya/api/v1/org-users`) | Populate Updated by filter options | [ASSUMED — existing call pattern from Cap saga] |

### Third-Party Libraries

No new third-party libraries are required. All required packages are already in `package.json`:
- `@capillarytech/cap-ui-library` (CapTable, CapButton, CapDrawer, CapMultiSelect, CapStatus, CapIcon, CapRow, CapColumn, CapLabel, CapSpin)
- `@capillarytech/vulcan-react-sdk` (injectReducer, injectSaga, withCustomAuthAndTranslations)
- `immutable` (fromJS, Immutable state)
- `reselect` (memoized selectors)
- `redux-saga` (takeLatest)

`CapDateRangePicker` availability in the installed version of `cap-ui-library` must be confirmed before implementation. If absent, use a styled wrapper around an Ant Design `DatePicker.RangePicker` instead [ASSUMED].

---

## 11. Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Benefits listing API endpoint not yet available | High | Implement with mock data using the assumed contract; replace the `getBenefits()` service function when BE delivers the real endpoint. Acceptance: the data contract in Section 6 must be reviewed with BE before implementation starts. |
| `CapDateRangePicker` not in `cap-ui-library` | Medium | Verify in cap-ui-library 8.12.64 package. If absent, use a styled Ant Design `DatePicker.RangePicker` wrapped in a local atom to keep the API consistent. |
| Grouping transformation complexity | Medium | Grouping "by category" and "by program type" are client-side transforms on the current page of results only. If the operator has 500 benefits across 10 pages, the group view shows only the current page's groups. This should be clearly communicated in the UI (e.g., "Showing group view for current page"). The alternative — server-side `groupBy` param — is marked ASSUMED in the API contract and should be clarified with BE. |
| Row action APIs are out of scope | Medium | The three-dot menu is implemented to show the four options. Clicking them should show a placeholder notification ("Feature coming soon") or be disabled initially, to avoid dispatching undefined actions. Confirm with PM before implementation. |
| CapMultiSelect supporting all filter types | Low | `CapMultiSelect` (based on Ant Design Tree) should support text-based options for Status, Category, Program name, and Updated by. Date-range preset options (Today, Yesterday, etc.) are also modelled as multi-select strings — confirm this UX with the designer. |
| Filter drawer "Last updated" preset vs explicit date range for "Duration" | Low | Figma uses `CapMultiSelect` for "Last updated" (preset options) and `CapDateRangePicker` for "Duration" (explicit dates). The API contract must map preset strings to computed date ranges server-side or client-side. Clarify with BE. |

### Architectural Deviations

None at the page/saga/reducer level. The one new pattern (grouping transformation) is additive and does not modify existing architecture.

### Known Unknowns

1. The exact benefits listing API endpoint path, pagination strategy, and filter parameter names (Q8 — deferred).
2. Whether the `groupBy` mode triggers a re-query with an API `groupBy` parameter or is a pure client-side transformation.
3. `CapDateRangePicker` availability in the current `cap-ui-library` version.
4. Whether "Updated by" filter options come from a dedicated API or from the existing org-users endpoint in the Cap saga.

---

## 12. Non-Functional Requirements

### Performance

- `CapTable` with server-side pagination keeps DOM row count bounded by `page.size` (default: 10 per PromotionList pattern).
- Search is debounced (suggested: 300ms using `useDebouncedCallback`) to prevent API thrash on fast typing.
- Selectors (`makeSelectBenefits`, `makeSelectBenefitsStatus`) use `createSelector` from Reselect — they memoize and only recompute when the benefits-listing slice changes.
- `BenefitsListing` and `BenefitsTable` will use `withMemo` HOC (existing garuda-ui pattern from `PromotionList`) to prevent re-renders when unrelated Redux state changes.
- `BenefitsFilterDrawer` is conditionally rendered (not always mounted), avoiding hidden computation.
- The grouping transformation (`groupBenefits()`) operates on the current page array only (≤ `size` items) and is O(n) — no performance concern.

### Scalability

- Server-side pagination handles arbitrarily large benefit sets — the client never loads all records.
- Filter reference data (programs, categories, users) is fetched once on page mount and cached in Redux; subsequent drawer opens reuse cached data.
- If programs/categories lists grow very large (>1000 items), `CapMultiSelect` supports `enableVirtualizedRendering` prop (per prop-spec-notes.json) — enable this flag in `BenefitsFilterDrawer`.

### Accessibility

- `CapTable` from Ant Design wraps a semantic `<table>` element with appropriate `role` and `aria-label` attributes.
- `CapButton` components render as `<button>` with focusable keyboard navigation.
- `CapDrawer` manages focus trap when open (Ant Design Drawer built-in behaviour).
- `BenefitStatusTag` (`CapStatus`) must include a visually hidden label for screen readers via `aria-label` or `title` prop.
- Search input must have an accessible `aria-label="Search benefits"` attribute.
- The three-dot overflow menu (`CapDropdown`) must be keyboard-accessible: trigger via `Enter`/`Space`, close via `Escape`.

---

## 13. Testing Strategy Overview

### Key Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| Page loads and displays benefits on mount | happy-path | High |
| Empty state shown when API returns zero results | edge-case | High |
| Error state shown when API call fails | error | High |
| Search filters table to matching benefits | happy-path | High |
| Clearing search restores full list | happy-path | High |
| Filter drawer opens on filter icon click | happy-path | High |
| Applying filters triggers new API call with filter params | happy-path | High |
| Clear all filters resets table to unfiltered list | happy-path | High |
| Grouping mode "by category" groups rows correctly | happy-path | Medium |
| Grouping mode "by program type" groups rows correctly | happy-path | Medium |
| Scoped grouping mode filters table to specific tier/program | happy-path | Medium |
| Three-dot menu appears on every row | happy-path | High |
| All four row actions are visible in the menu | happy-path | High |
| Pagination controls change the visible page | happy-path | Medium |
| Status chip renders correct colour for all five statuses | edge-case | Medium |
| Duration filter with start date after end date shows validation error | error | Medium |
| Search with no results shows empty state | edge-case | Medium |
| Loading spinner shown during API call | edge-case | Low |

### Unit Test Targets

| Target | Type | What to Test |
|--------|------|--------------|
| `benefitsListingReducer` | reducer | Every action type: REQUEST sets status, SUCCESS stores data, FAILURE stores error, CLEAR_DATA resets |
| `getBenefitsListSaga` | saga | Happy-path dispatch chain; failure dispatch; takeLatest cancels previous call |
| `makeSelectBenefits()` | selector | Returns empty array for uninitialised state; toJS conversion works |
| `makeSelectActiveFilters()` | selector | Returns correct filter shape |
| `BenefitsTable` | component | Renders correct number of rows from props; renders `BenefitStatusTag` per status value |
| `BenefitStatusTag` | component | Maps each of five statuses to correct `CapStatus` colour/type |
| `BenefitsFilterDrawer` | component | Renders six filter fields; Apply calls `onApply`; Clear all calls `onClear` |
| `BenefitsSearchInput` | component | Debounced onChange calls `onSearch`; clearing calls `onClear` |
| `groupBenefits()` utility | utility | Groups by category correctly; groups by program type; handles benefits with no category |

### Integration Test Considerations

- End-to-end test: mount `BenefitsListing` with mocked Redux store and API, verify benefits render → search → filter → paginate round-trips work.
- Test that Redux slice is injected at mount and cleared at unmount (`CLEAR_DATA`).
- Test filter persistence across paginations: active filters survive a page change.

---

## 14. Architecture Alignment Notes

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| Atomic Design hierarchy | aligned | `BenefitsListing` (page), `BenefitsTable` / `BenefitsFilterDrawer` / `BenefitsSearchInput` / `BenefitsGroupingControl` (molecules), `BenefitStatusTag` (atom). No organism layer needed as no sub-component has its own Redux slice. |
| Cap-* component mandate | aligned | All leaf-level UI uses `CapTable`, `CapButton`, `CapDrawer`, `CapMultiSelect`, `CapStatus`, `CapIcon`, `CapRow`, `CapColumn`, `CapLabel`, `CapSpin`. The only exception is `CapDateRangePicker` (BESPOKE — verify or substitute). |
| CapRow/CapColumn layouts | aligned | Toolbar uses `CapRow` (recipe-confirmed node 123:5154); filter drawer fields use `CapColumn` vertical layout; table columns are `CapColumn` nodes. No raw CSS flexbox for layout. |
| Redux file co-location | aligned | All Redux files (`constants.js`, `actions.js`, `reducer.js`, `saga.js`, `selectors.js`) are co-located in `app/components/pages/BenefitsListing/`. |
| Dynamic reducer/saga injection | aligned | `Loadable.js` uses `injectReducer` + `injectSaga` HOCs composed at export time, identical to `PromotionList/Loadable.js` pattern. Saga runs in DAEMON mode. |
| Immutable.js state conventions | aligned | `initialState = fromJS({...})`. Reducer uses `.set()` / `.update()`. Selectors use `.get()` / `.toJS()`. |
| styled-components styling | aligned | `styles.js` in each component directory uses styled-components. `withStyles` from Vulcan SDK used for className injection where needed. |
| ESLint 500-line limit | aligned | `BenefitsListing.js` is the highest-risk file. Estimated at ~200-250 lines (page component with connect, local state for filter/grouping, render logic). Column config extracted to `columnConfig.js`. Reducer and saga are each < 100 lines given the simpler domain. |
| Saga concurrency model | aligned | `getBenefitsListSaga` uses `takeLatest` — consistent with `getPromotionsListSaga`. Reference data sagas (`getProgramsSaga`, `getCategoriesSaga`) also use `takeLatest`. |
| Redux inject key pattern | aligned | `${CURRENT_APP_NAME}-benefits-listing` — matches `${CURRENT_APP_NAME}-promotions-list` convention. |
| Compose pattern | aligned | Export from `BenefitsListing.js` uses `compose(injectReducer(...), injectSaga(...), connect(...))` — identical to `PromotionList` export. |

### Alignment with System Map Patterns

The Benefits Listing data flow mirrors the `PromotionList` flow documented in the system map:

1. `BenefitsListing` mounts → dispatches `GET_BENEFITS_LIST_REQUEST` → `getBenefitsListSaga` (takeLatest) → calls `getBenefits()` in `api.js` → on success dispatches `GET_BENEFITS_LIST_SUCCESS` → reducer sets `benefits` and `benefitsStatus` → `makeSelectBenefits()` recomputes → `BenefitsTable` re-renders.

Selector pattern matches: `selectBenefitsListDomain = state.get('${CURRENT_APP_NAME}-benefits-listing')` — identical key-scoping to `selectPromotionListDomain`.

Action naming convention (`GET_BENEFITS_LIST_REQUEST` / `_SUCCESS` / `_FAILURE` triplet) matches the `GET_PROMOTIONS_LIST_REQUEST` / `_SUCCESS` / `_FAILURE` pattern.

Reducer structure: `fromJS({})` initial state, `switch` on `action.type`, pure state transformations using `.set()` — identical to `promotionListReducer`.

### Deviations and Justifications

| Deviation | Justification | Risk |
|-----------|---------------|------|
| Grouping transformation (`groupBenefits()` utility) — new pattern, no equivalent in PromotionList | PRD requires four grouping views (FR-8) that are client-side state transformations. No existing garuda-ui pattern supports grouped table views. The implementation is isolated to a pure utility function and does not affect Redux or saga patterns. | Low — additive pattern, no modification to existing code |
| `CapDateRangePicker` for Duration filter — component not confirmed in cap-ui-library registry | The Figma design explicitly names this node `CapDateRangePicker` (122:4358). If the component is not available in the installed version, a styled `DatePicker.RangePicker` from Ant Design will be used directly, wrapped in a local atom. This is a minor substitution with no architectural impact. | Low |

---

## 15. Open Questions and Decisions Needed

| # | Question | Impact | Owner | Status | Comment |
|---|----------|--------|-------|--------|---------|
| 1 | What is the exact backend API endpoint path and full contract for the benefits listing API (pagination params, filter param names, response structure)? | High — entire API layer assumed; saga and service function will need updating | BE team | open | FR-22 / Q8 resolution: "assume from Figma; replace when BE confirms" |
| 2 | Does the benefits listing API support a `groupBy` query parameter, or must grouping be implemented as a pure client-side transformation of the fetched page? | Medium — affects grouping strategy for large datasets | BE team | open | FR-8, FR-9 |
| 3 | Is `CapDateRangePicker` available in `@capillarytech/cap-ui-library` version 8.12.64? If not, what is the approved date-range component? | Medium — affects filter drawer Duration field implementation | Frontend lead / Design | open | `CapDateRangePicker` found in Figma (node 122:4358) but not confirmed in cap-ui-library registry |
| 4 | Where do the "Updated by" filter options come from? The existing `Cap` saga fetches org users — can the same endpoint/data be reused, or does it need a new benefits-scoped API call? | Low — affects filter reference data fetch strategy | BE team / Tech Lead | open | ASSUMED from `/arya/api/v1/org-users` |
| 5 | What should happen when a row action (Duplicate, Change logs, Export data, Pause) is clicked? Show a "coming soon" notification, disable the options, or connect to stub handlers? | Medium — affects whether the menu items are interactive or placeholder | PM | open | Row action implementation details are out of scope per PRD |
| 6 | Should active filters persist across page navigations (e.g., if operator navigates away and back), or should they reset on unmount? | Low — affects whether `CLEAR_DATA` resets filters or only data | PM / Tech Lead | open | Current assumption: `CLEAR_DATA` dispatched on unmount resets everything |
| 7 | Confirm the "Last updated" preset "Last 7 days / Last 30 days / Last 90 days" — does the API compute these ranges, or does the frontend compute them and send explicit `lastModifiedFrom` / `lastModifiedTo` datetimes? | Low — affects API contract for Last updated filter | BE team | open | ASSUMED: frontend computes and sends datetime range |

---

## 16. Figma Naming Improvements

The decomposition step (hld-to-code Phase 5a) assigns Figma nodes to target files by matching HLD Section 3 component names against Figma frame names. Below are frames where a rename would remove ambiguity:

| Current Figma Frame Name | Node ID | Proposed Rename | Section 3 Component | Why Rename |
|--------------------------|---------|-----------------|---------------------|-----------|
| `Like Promos` | 123:5146 | `BenefitsListing` | `BenefitsListing` | Auto-generated-style name with no semantic link to component; rename ensures deterministic match |
| `Frame 2087331945` | 123:5148 | `BenefitsListingContent` | (container) | Generic frame name; rename improves traceability |
| `Frame 2087331367` | 123:5150 | `BenefitsToolbar` | (toolbar section) | Generic frame name for the Benefits title + search + CTA toolbar row |
| `Custom Field` | 123:5178 | `BenefitsTable` | `BenefitsTable` | "Custom Field" is a Figma template name; `BenefitsTable` gives a deterministic decomposition target |
| `Coloumn` (×6 instances) | 123:5179, 123:5303, 123:5367, 123:5495, 123:5532, 123:5810 | `NameColumn`, `StatusColumn`, `DurationColumn`, `ProgramNameColumn`, `CategoryColumn`, `UpdatedAtColumn` | (column sections) | Duplicate name "Coloumn" with typo; rename to distinguish columns for decomposition |
| `CapDrawer` | 122:4327 | `CapDrawerBenefitsFilterDrawer` | `BenefitsFilterDrawer` | Figma uses the generic Cap component name; rename to feature-scoped name removes ambiguity |
| `Frame 2934` | 122:4329 | `BenefitsFilterFields` | (filter body) | Generic frame number; rename signals this is the filter fields body |
| `Frame 48097` | 122:4394 | `BenefitsFilterFooter` | (footer buttons) | Generic frame number; rename signals Apply/Clear buttons container |

**How to rename**: open `figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/?node-id=<NodeID>` → select the frame → press `F2` → type the proposed PascalCase name.

After renaming, re-run `hld-to-code` — decomposition.json is produced deterministically and `AskUserQuestion` prompts for ambiguous node assignment disappear.

> **Note**: this section is unrelated to the `Custom_` prefix BESPOKE signal. `Custom_` forces BESPOKE for nodes NOT listed in Section 3. Section 16 addresses a different problem — making decomposition match Section 3 components reliably.

> **Rename applied**: All frame names above were updated in cached artifacts on 2026-04-20.
> Re-run `figma-node-mapper` after renaming frames in Figma to keep caches in sync.

---

## Metadata

- **Feature**: Benefits Listing
- **PRD Source**: `claudeOutput/filteredPrd/benefits-listing-spec.md`
- **Generated by**: hld-generator agent
- **Timestamp**: 2026-04-20
- **Architecture Reference**: `.claude/output/architecture.md`
- **System Map Reference**: `.claude/output/loyalty-promotions-system-map.md`
- **Figma Recipes**:
  - `claudeOutput/figma-capui-mapping/123-5146.recipe.json` (Listing Page — 145 nodes: 48 EXACT, 41 PARTIAL, 56 UNMAPPED resolved)
  - `claudeOutput/figma-capui-mapping/122-4327.recipe.json` (Filter Drawer — 1 node: PARTIAL)
- **Prop-Spec Notes**:
  - `claudeOutput/figma-capui-mapping/123-5146/prop-spec-notes.json`
  - `claudeOutput/figma-capui-mapping/122-4327/prop-spec-notes.json`
