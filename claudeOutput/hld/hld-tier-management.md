# High-Level Design: Tier Management - Tier Listing & Details View

> **Generated**: 2026-04-19
> **PRD Source**: `claudeOutput/filteredPrd/tier-management-spec.md`
> **Architecture Reference**: `.claude/output/architecture.md`

---

## 1. Feature Overview

### Feature Name
Tier Management - Tier Listing & Details View

### Description & Business Purpose
This feature provides a read-only columnar comparison view for marketers to inspect all tiers configured for a loyalty program. Tiers are displayed side-by-side as columns with row labels on the left, organized under five horizontal tabs: Basic details, Eligibility criteria, Renewal criteria, Downgrade criteria, and Benefits. A program-selector dropdown scopes all data to a single loyalty program.

The feature solves the problem of marketers lacking a consolidated view of tier configuration and benefits. Currently they must navigate multiple screens to compare tiers; this view enables side-by-side comparison across all dimensions in a single page.

### Problem Statement
Marketers currently lack a consolidated view of tier configuration and benefits within the loyalty platform. They need to compare tiers side-by-side across multiple dimensions to understand program structure and identify configuration gaps.

### Target Users
Loyalty program marketers and program managers who need to inspect, compare, and verify tier configurations across a program.

### Scope

**In Scope**:
- Read-only tier comparison view with five tabs (Basic details, Eligibility criteria, Renewal criteria, Downgrade criteria, Benefits)
- Program-selector dropdown to scope tiers to a selected loyalty program
- Fixed left column with row labels; horizontally scrollable tier columns
- Tier column headers with name, status badge (Active/Inactive), member count, and edit icon
- "Create tier" and "Create benefit" buttons (navigation stubs for future pages)
- Per-tier member count display

**Out of Scope**:
- OS-1: Tier creation flow (buttons render but navigate to a future page)
- OS-2: Benefit creation flow (button renders but navigates to a future page)
- OS-3: Inline editing of tier details (edit icon navigates to a separate page)
- OS-4: KPI summary bar / dashboard cards
- OS-5: Status filters (Draft, Pending approval, Active, Deactivated/Stopped)
- OS-6: RBAC / permission-based access gating

---

## 2. Technical Objective

### Technical Goals
1. Introduce a new page route `/tiers/list` following the existing garuda-ui page architecture with dynamic reducer/saga injection
2. Build a bespoke columnar comparison table organism that supports horizontal scrolling with a fixed left row-label column
3. Implement tab-based content switching using CapTab (tabs filter which rows are visible in the comparison table)
4. Reuse the existing `getTier` API function from `services/api.js` (via Cap saga) and add a new dedicated saga for tier-listing-specific data fetching
5. Maintain the existing Atomic Design hierarchy (page -> organism -> molecule -> atom) and Redux co-location conventions

### Architecture Fit
The tier listing page follows the same architectural pattern as `PromotionList`:
- A `LoyaltyProgramTiers` page component in `app/components/pages/LoyaltyProgramTiers/` with its own Redux slice
- Dynamic injection of reducer and saga via `injectReducer`/`injectSaga` HOCs
- Immutable.js state with `fromJS()` initial state and Reselect selectors
- Route registered in `app/components/pages/App/routes.js` using `lazy(() => import(...))`
- Authentication via `withCustomAuthAndTranslations` HOC (no additional RBAC gating per FR-20)

---

## 3. Impact Analysis

### New Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| LoyaltyProgramTiers | page | `app/components/pages/LoyaltyProgramTiers/` | Page-level container; program selector, tabs, comparison table; Redux-connected |
| TierComparisonTable | organism | `app/components/organisms/TierComparisonTable/` | Bespoke comparison table with fixed left labels column and scrollable tier columns |
| TierColumnHeader | molecule | `app/components/molecules/TierColumnHeader/` | Tier column header: color dot, tier name, status badge, edit icon |
| TierDataCell | molecule | `app/components/molecules/TierDataCell/` | Single data cell rendering a tier's value for a given attribute row |
| TierSectionHeader | molecule | `app/components/molecules/TierSectionHeader/` | Section header row (e.g., "Eligibility Criteria", "Renewal Criteria") spanning the full width |

### Modified Components

| Component | Location | Change Description |
|-----------|----------|--------------------|
| App routes | `app/components/pages/App/routes.js` | Add new route entry for `/tiers/list` pointing to `LoyaltyProgramTiers` |
| NavigationBar | `app/components/organisms/NavigationBar/NavigationBar.js` | Add tier listing link handler in `onTopMenuClick` switch case |

### New Redux Domains

| Domain | Inject Key | Reducer | Saga | Purpose |
|--------|-----------|---------|------|---------|
| tier-listing | `${CURRENT_APP_NAME}-tier-listing` | `app/components/pages/LoyaltyProgramTiers/reducer.js` | `app/components/pages/LoyaltyProgramTiers/saga.js` | Stores tier data, active tab, loading/error state for the listing page |

### New Routes

| Route Path | Component | Auth Required | Description |
|------------|-----------|---------------|-------------|
| `/tiers/list` | LoyaltyProgramTiers | Yes (authenticated) | Tier comparison listing page |

### Shared Utilities / Hooks

| Name | Location | New/Modified | Purpose |
|------|----------|-------------|---------|
| tiers.js | `app/utils/tiers.js` | Modified | Add utility functions for mapping API tier data into tab-specific row structures |

---

## 4. UI/UX Changes

### Screen Flow

The tier management feature consists of a single screen. The user navigates to `/tiers/list` from the sidebar navigation. On this page they select a program, browse five tabs of tier comparison data, and can initiate navigation to future tier/benefit creation or tier edit pages via action buttons and icons.

```
[Sidebar Nav] --click "Tiers"--> [/tiers/list (LoyaltyProgramTiers)]
                                       |
                                       +--> [Create tier btn] --> /tiers/create (future)
                                       +--> [Create benefit btn] --> /benefits/create (future)
                                       +--> [Edit icon on tier] --> /tiers/edit/:tierId (future)
```

### Screen: Tier Listing (Comparison View)

**Route**: `/tiers/list`
**Purpose**: Display all tiers for a selected loyalty program in a side-by-side columnar comparison view with five category tabs.

**Component Boundaries**:
- **LoyaltyProgramTiers (page)**: Top-level container. Owns Redux connection, program selector, tab state. Renders header row (program selector + action buttons), CapTab for category tabs, and TierComparisonTable organism.
- **TierComparisonTable (organism)**: Bespoke comparison layout. Left fixed column of row labels. Right scrollable area with one column per tier. Each column header is a TierColumnHeader molecule. Each data cell is a TierDataCell molecule. Section headers rendered via TierSectionHeader molecule.
- **TierColumnHeader (molecule)**: Renders tier color dot, name (CapLabel), status badge (styled CapLabel), and edit icon (CapIcon).
- **TierDataCell (molecule)**: Renders a single attribute value for one tier. Text content via CapLabel.
- **TierSectionHeader (molecule)**: Full-width row used for section dividers (e.g., "Eligibility Criteria").

**Component Recipe** *(recipe-verified from figma-node-mapper -- review and correct before code generation)*:

| UI Section | Cap* Component | Node ID | Recipe Status | Reviewer Override |
|------------|----------------|---------|---------------|-------------------|
| Program Selector Dropdown | CapSelect | 32:3150 | EXACT | |
| Create Tier Button | CapButton | 32:3158 | EXACT | |
| Create Benefit Button | CapButton | 32:3159 | EXACT | |
| Category Tabs | Custom_tab (BESPOKE) | 32:3741 | BESPOKE | Custom_Tab |
| Comparison Table Container | CapTable | 32:3163 | PARTIAL | TierComparisonTable (BESPOKE) |
| Row Labels Column | CapColumn | 32:3164 | PARTIAL | |
| Tier Columns Scrollable Area | CapRow | 32:3261 | PARTIAL | |
| Tier Name Text | CapLabel | 32:3268 | EXACT | |
| Status Badge | CapLabel (styled) | 32:3269 | PARTIAL | |
| Edit Icon | CapIcon | 32:3272 | RESOLVED | |
| Section Header Text | CapLabel | 32:3167 | EXACT | |
| Data Cell Text | CapLabel | 32:3170 | EXACT | |
| Color Dot Indicator | styled.div | 32:3266 | PARTIAL | |

*Recipe source*: `claudeOutput/figma-capui-mapping/32-3147.recipe.json`
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/32-3147/prop-spec-notes.json`

> **Note**: The recipe maps the comparison table to `CapTable` (PARTIAL), but `CapTable` is an Ant Design data grid (`dataSource` + `columns`) which is structurally incompatible with this layout. The Figma design shows a fixed-left-column comparison matrix where columns are tiers (dynamic count) and rows are attributes, with section header rows spanning the full width. This requires a bespoke `TierComparisonTable` organism built from `CapRow`, `CapColumn`, and styled-components with `overflow-x: auto` on the tier columns container.

> **Note**: The recipe maps `Custom_tab` (Figma node 32:3741, named with the `Custom_` BESPOKE prefix) to BESPOKE. However, this is standard tab navigation -- the Reviewer Override column is set to `CapTab`, which provides the `panes` prop API for tab switching. The individual tab instances (Frame 27-35) are tab pane definitions, not separate components.

**User Interactions -> Redux Actions**:

| User Action | Component | Dispatched Action | Saga Triggered |
|-------------|-----------|-------------------|----------------|
| Page mount | LoyaltyProgramTiers | `GET_TIER_LISTING_REQUEST` | `getTierListingSaga` |
| Select program | LoyaltyProgramTiers (CapSelect) | `SET_SELECTED_PROGRAM` + `GET_TIER_LISTING_REQUEST` | `getTierListingSaga` |
| Click tab | LoyaltyProgramTiers (CapTab) | `SET_ACTIVE_TAB` | None (local filter) |
| Click "Create tier" | LoyaltyProgramTiers (CapButton) | None | None (history.push to future route) |
| Click "Create benefit" | LoyaltyProgramTiers (CapButton) | None | None (history.push to future route) |
| Click edit icon on tier | TierColumnHeader (CapIcon) | None | None (history.push to future route) |

**Architecture Diagram**:
```
┌──────────────────────────────────────────────────────────────────┐
│ LoyaltyProgramTiers (page)                                       │
│ Route: /tiers/list                                               │
│ Redux: tierListingReducer                                        │
│ Saga: tierListingSaga                                            │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Header Row (CapRow)                                          │ │
│ │ [CapSelect: Program] [CapButton: +Create tier]               │ │
│ │                      [CapButton: +Create benefit]            │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ CapTab (5 panes)                                             │ │
│ │ [Basic details | Eligibility | Renewal | Downgrade | Benefi] │ │
│ │ dispatch: SET_ACTIVE_TAB                                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ TierComparisonTable (organism) BESPOKE                       │ │
│ │ Redux <- makeSelectTierListing                               │ │
│ │ Saga <- getTierListingSaga                                   │ │
│ │                                                              │ │
│ │ ┌────────────┐ ┌──────────────────────────────────────────┐ │ │
│ │ │ Row Labels │ │ Scrollable Tier Columns (CapRow)         │ │ │
│ │ │ (CapColumn)│ │ overflow-x: auto                         │ │ │
│ │ │ fixed      │ │                                          │ │ │
│ │ │            │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │ │
│ │ │ [Section]  │ │ │TierCol  │ │TierCol  │ │TierCol  │    │ │ │
│ │ │ [CapLabel] │ │ │Header   │ │Header   │ │Header   │    │ │ │
│ │ │ [CapLabel] │ │ │(molecule)│ │(molecule)│ │(molecule)│   │ │ │
│ │ │ [CapLabel] │ │ │[dot]    │ │[dot]    │ │[dot]    │    │ │ │
│ │ │ ...        │ │ │[name]   │ │[name]   │ │[name]   │    │ │ │
│ │ │            │ │ │[badge]  │ │[badge]  │ │[badge]  │    │ │ │
│ │ │            │ │ │[edit]   │ │[edit]   │ │[edit]   │    │ │ │
│ │ │            │ │ ├─────────┤ ├─────────┤ ├─────────┤    │ │ │
│ │ │            │ │ │DataCell │ │DataCell │ │DataCell │    │ │ │
│ │ │            │ │ │(molecule)│ │(molecule)│ │(molecule)│   │ │ │
│ │ │            │ │ │[CapLabel]│ │[CapLabel]│ │[CapLabel]│   │ │ │
│ │ └────────────┘ │ └─────────┘ └─────────┘ └─────────┘    │ │ │
│ │                └──────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

[See: Tier Listing (Comparison View)](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=32-3147)

**Recipe Verification**: The ASCII diagram uses the following `sectionComponentMap` entries: CapSelect (32:3150, EXACT), CapButton (32:3158/32:3159, EXACT), CapTab (override of 32:3741 BESPOKE), CapRow (32:3261, PARTIAL), CapColumn (32:3164, PARTIAL), CapLabel (32:3268/32:3170/32:3167, EXACT), CapIcon (32:3272, RESOLVED). TierComparisonTable is BESPOKE (overrides CapTable). All leaf-level Cap* components appear in the Component Recipe table above.

---

## 5. Directory Structure

```
app/components/
├── pages/
│   └── LoyaltyProgramTiers/
│       ├── index.js              # Re-export from Loadable
│       ├── Loadable.js           # Dynamic import + withCustomAuthAndTranslations
│       ├── LoyaltyProgramTiers.js # Main component with connect()
│       ├── constants.js          # Action type constants
│       ├── actions.js            # Action creators
│       ├── reducer.js            # Reducer with fromJS() initial state
│       ├── selectors.js          # Reselect memoized selectors
│       ├── saga.js               # Saga watchers and workers
│       ├── messages.js           # react-intl message descriptors
│       └── styles.js             # styled-components
├── organisms/
│   └── TierComparisonTable/
│       ├── index.js
│       ├── TierComparisonTable.js # Bespoke comparison layout
│       ├── styles.js             # styled-components for scroll behavior
│       └── utils.js              # Row data extraction per tab
├── molecules/
│   ├── TierColumnHeader/
│   │   ├── index.js
│   │   ├── TierColumnHeader.js
│   │   └── styles.js
│   ├── TierDataCell/
│   │   ├── index.js
│   │   └── TierDataCell.js
│   └── TierSectionHeader/
│       ├── index.js
│       ├── TierSectionHeader.js
│       └── styles.js
```

### Naming Conventions
- Page: `LoyaltyProgramTiers` (PascalCase, matches directory name)
- Redux inject key: `${CURRENT_APP_NAME}-tier-listing`
- Action types: `GET_TIER_LISTING_REQUEST`, `GET_TIER_LISTING_SUCCESS`, `GET_TIER_LISTING_FAILURE`, `SET_ACTIVE_TAB`, `SET_SELECTED_PROGRAM`
- Selectors: `makeSelectTierListing()`, `makeSelectTierListingStatus()`, `makeSelectActiveTab()`, `makeSelectSelectedProgram()`
- Saga: `getTierListingSaga`, watcher: `watchForGetTierListingSaga`

---

## 6. API Structure

### API: Get Tier Listing

**Status**: [ASSUMED - API spec not provided; payload inferred from Figma data and existing getTier pattern]

| Field | Value |
|-------|-------|
| Endpoint | `GET /loyalty/api/v1/strategy/tier/{programId}` |
| Method | `GET` |
| Auth | Yes |

**Request Payload**:
```json
Query params: ?includeNewChannels=true
Path param: programId (from program selector)
```

**Response Payload**:
```json
{
  "success": true,
  "result": {
    "tiers": [
      {
        "tierId": 123,
        "tierName": "Bronze",
        "tierDescription": "Entry level tier with basic benefits...",
        "tierStatus": "ACTIVE",
        "memberCount": 58270,
        "colorCode": "#F5A623",
        "duration": { "startDate": "2025-01-01", "endDate": null },
        "eligibilityCriteria": {
          "type": "ACTIVITY_BASED",
          "activities": "Makes 100 transactions",
          "duration": "Indefinite",
          "upgradeSchedule": "Immediately when eligibility is met",
          "nudges": "Welcome email on joining"
        },
        "renewalCriteria": {
          "type": "ACTIVITY_BASED",
          "activities": "Makes 100 transactions",
          "duration": "Indefinite",
          "upgradeSchedule": "Immediately when eligibility is met",
          "nudges": "Welcome email on joining"
        },
        "downgradeCriteria": {
          "downgradeTo": "Same as eligibility",
          "schedule": "10 days after downgrade",
          "expiryReminders": "Downgrade warning at 60 days before expiry"
        },
        "benefits": [
          { "category": "Welcome Gift", "value": "" },
          { "category": "Upgrade bonus points", "value": "1000 points" },
          { "category": "Tier badge", "value": "Gold Badge" },
          { "category": "Renewal Bonus", "value": "" },
          { "category": "Loyalty Voucher", "value": "RM 30 voucher" },
          { "category": "Earn Points", "value": "6 pt/RM" },
          { "category": "Priority Support", "value": "Priority queue" },
          { "category": "Free Shipping", "value": "Orders > RM 100" },
          { "category": "VIP Events", "value": "Gold access" },
          { "category": "Birthday Bonus", "value": "1000 points" },
          { "category": "Exclusive Comms", "value": "" }
        ]
      }
    ],
    "totalMembers": 280200,
    "benefitCategories": [
      "Welcome Gift", "Upgrade bonus points", "Tier badge",
      "Renewal Bonus", "Loyalty Voucher", "Earn Points",
      "Priority Support", "Free Shipping", "VIP Events",
      "Birthday Bonus", "Exclusive Comms"
    ]
  }
}
```

**Validation Rules**:
- `programId` is required and must be a valid positive integer

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid programId format |
| 401 | Unauthorized | Authentication token expired or missing |
| 403 | Forbidden | User does not have access to this program |
| 404 | Not Found | Program does not exist |
| 500 | Internal Server Error | Server-side failure |

> **Note**: The existing `getTier` function in `services/api.js` (line 411) calls `GET /loyalty/api/v1/strategy/tier/{programId}`. This endpoint may need to be extended or a new endpoint provided by the backend to include benefits data (per FR-18: benefit data returned with tier details). Until the BE team finalizes the contract, the assumed payload above will be used.

---

## 7. Data and State Management Overview

### Redux Store Shape

```javascript
// Inject key: ${CURRENT_APP_NAME}-tier-listing
fromJS({
  tiers: [],
  tierListingStatus: 'INITIAL',
  tierListingError: null,
  totalMembers: 0,
  benefitCategories: [],
  activeTab: 'basic-details',
  selectedProgramId: null,
})
```

### Actions

| Action Type | Creator | Purpose |
|-------------|---------|---------|
| `GET_TIER_LISTING_REQUEST` | `getTierListing(programId)` | Trigger tier data fetch for a program |
| `GET_TIER_LISTING_SUCCESS` | `getTierListingSuccess(data)` | Store fetched tier data |
| `GET_TIER_LISTING_FAILURE` | `getTierListingFailure(error)` | Store fetch error |
| `SET_ACTIVE_TAB` | `setActiveTab(tabKey)` | Update selected tab |
| `SET_SELECTED_PROGRAM` | `setSelectedProgram(programId)` | Update selected program |
| `CLEAR_TIER_LISTING_DATA` | `clearTierListingData()` | Reset to initial state on unmount |

### Selectors

| Selector | State Path | Returns |
|----------|-----------|---------|
| `makeSelectTierListing()` | `tiers` | Array of tier objects (toJS) |
| `makeSelectTierListingStatus()` | `tierListingStatus` | Status string (INITIAL/REQUEST/SUCCESS/FAILURE) |
| `makeSelectTierListingError()` | `tierListingError` | Error object or null |
| `makeSelectTotalMembers()` | `totalMembers` | Number |
| `makeSelectBenefitCategories()` | `benefitCategories` | Array of category strings |
| `makeSelectActiveTab()` | `activeTab` | Tab key string |
| `makeSelectSelectedProgram()` | `selectedProgramId` | Program ID number or null |

### Saga Orchestration

| Saga | Trigger Action | API Call | On Success | On Failure | Concurrency |
|------|---------------|----------|------------|------------|-------------|
| `getTierListingSaga` | `GET_TIER_LISTING_REQUEST` | `getTierListingData(programId)` | `GET_TIER_LISTING_SUCCESS` | `GET_TIER_LISTING_FAILURE` | `takeLatest` |

### Local State vs Redux State

| Data Point | Storage | Rationale |
|-----------|---------|-----------|
| Tier listing data | Redux | Fetched from API; consumed by multiple child components |
| Active tab key | Redux | Persisted during component re-renders; used by TierComparisonTable to filter rows |
| Selected program ID | Redux | Triggers saga when changed; persisted across tab switches |
| Horizontal scroll position | Local (DOM) | UI-only concern; no need for state management |

---

## 8. Validation

### Client-Side Validation

| Screen | Field | Rule | Message |
|--------|-------|------|---------|
| Tier Listing | Program selector | Must have a program selected | "Please select a program" |

### Server-Side Validation Handling
Server errors are handled in the saga with a try/catch pattern. On `GET_TIER_LISTING_FAILURE`, the page displays a `CapNotification` error toast and/or an inline error state. The existing `SomethingWentWrong` molecule is reused for critical failures (500 errors).

---

## 9. Reusable Patterns and Shared Utilities

### Existing to Reuse

| Component/Utility | Location | Usage in This Feature |
|-------------------|----------|-----------------------|
| CapSelect | `@capillarytech/cap-ui-library/CapSelect` | Program selector dropdown |
| CapButton | `@capillarytech/cap-ui-library/CapButton` | "Create tier" and "Create benefit" buttons |
| CapTab | `@capillarytech/cap-ui-library/CapTab` | Five-tab navigation for category switching |
| CapLabel | `@capillarytech/cap-ui-library/CapLabel` | Text labels in row headers and data cells |
| CapIcon | `@capillarytech/cap-ui-library/CapIcon` | Edit (pencil) icon in tier column header |
| CapRow / CapColumn | `@capillarytech/cap-ui-library` | Layout containers for header and comparison table |
| CapSpin | `@capillarytech/cap-ui-library/CapSpin` | Loading spinner during data fetch |
| CapNotification | `@capillarytech/cap-ui-library/CapNotification` | Error and success toasts |
| PageTemplate | `app/components/templates/PageTemplate` | Page layout wrapper |
| RenderRoute | `app/components/atoms/RenderRoute` | Route rendering in routes.js |
| withCustomAuthAndTranslations | `@capillarytech/vulcan-react-sdk/utils` | Auth + i18n HOC wrapper |
| injectReducer / injectSaga | `app/utils/injectReducer.js`, `app/utils/injectSaga.js` | Dynamic Redux injection |
| tiers.js | `app/utils/tiers.js` | Existing tier utility functions |
| SomethingWentWrong | `app/components/molecules/SomethingWentWrong` | Error state display |
| getTier | `app/services/api.js` (line 411) | Existing API function for fetching tier data |
| makeSelectPrograms (Cap) | `app/components/pages/Cap/selectors.js` | Program list for the dropdown |

### New Patterns Introduced
- **Bespoke comparison table**: TierComparisonTable introduces a fixed-left-column + horizontally-scrollable-right pattern. This pattern could be extracted for future comparison views (e.g., benefit comparison, segment comparison).
- **Tab-filtered row rendering**: Tabs control which attribute rows are visible within the comparison table without triggering a new API call. This is a client-side filter pattern.

---

## 10. Dependencies

### Internal Module Dependencies

| Module | Purpose | Status |
|--------|---------|--------|
| Cap (page) | Provides program list via `makeSelectPrograms` selector, `getTier` action, navigation shell | existing |
| NavigationBar (organism) | Sidebar menu item for tier listing navigation | existing (modified) |
| App routes | Route registration for `/tiers/list` | existing (modified) |
| services/api.js | API function `getTier` or new `getTierListing` | existing / extended |
| utils/tiers.js | Tier data transformation utilities | existing (modified) |

### External API Dependencies

| API | Purpose | Status |
|-----|---------|--------|
| `GET /loyalty/api/v1/strategy/tier/{programId}` | Fetch tier listing data with benefits | [ASSUMED - existing endpoint, may need BE extension for benefits] |

### Third-Party Libraries
No new third-party libraries required. The feature uses only existing dependencies: React 18, Redux, Redux-Saga, Immutable.js, Reselect, styled-components, @capillarytech/cap-ui-library, @capillarytech/vulcan-react-sdk.

---

## 11. Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| API contract not finalized -- assumed payload may differ from actual BE response | High | Coordinate with BE team early; build data transformation layer in saga to normalize response |
| Existing `getTier` endpoint may not include benefits data | High | Confirm with BE if benefits are in the same response (per FR-18) or require a separate call |
| Horizontal scroll on comparison table may have performance issues with many tiers (10+) | Medium | Use CSS `overflow-x: auto` with virtualized columns if performance degrades; initial implementation supports up to ~10 tiers |
| Figma shows all sections visible simultaneously; spec says tabs filter content -- behavioral ambiguity | Medium | See Open Questions (Section 15, Q1) -- this is a Figma-vs-Spec conflict that must be resolved before implementation |
| Empty scaffold directories already exist for LoyaltyProgramTiers, TierComparisonTable, and tier molecules | Low | Code generation should populate these empty directories; no conflicts expected |
| "Create tier" and "Create benefit" buttons navigate to non-existent pages | Low | Use `history.push` with placeholder routes; show "Coming soon" toast or do nothing if destination page does not exist |

### Architectural Deviations
- **TierComparisonTable is BESPOKE**: The recipe maps the Figma table to `CapTable`, but `CapTable` (Ant Design Table) uses `dataSource + columns` which is structurally incompatible with a comparison matrix. A bespoke organism using `CapRow`, `CapColumn`, `CapLabel`, and styled-components is required. This is a justified deviation.
- **Tab content is not CapTab pane content**: `CapTab` is used for navigation, but the tab content is not rendered inside `CapTab.TabPane`. Instead, the tab state filters which rows the `TierComparisonTable` renders. This is a minor deviation from the standard `CapTab` usage pattern but necessary because all tab content shares the same structural layout (comparison table).

### Known Unknowns
- Exact API endpoint and response shape (waiting for BE team)
- Whether the program selector should pre-populate from a global context or from a fresh API call
- Whether "Inactive" tiers should be visually distinguished beyond the badge (e.g., greyed-out columns)

---

## 12. Non-Functional Requirements

### Performance
- **Memoization**: `React.memo` on TierColumnHeader, TierDataCell, and TierSectionHeader molecules. `useMemo` for tab-filtered row computation in TierComparisonTable. `useCallback` for event handlers in LoyaltyProgramTiers.
- **Reselect**: All selectors use `createSelector` for memoized state derivation.
- **Target**: Page load and render within 3 seconds for up to 10 tiers (per SC-1).

### Scalability
- The comparison table structure supports a dynamic number of tiers. For programs with >10 tiers, horizontal scrolling ensures all tiers are accessible.
- Tab-based filtering is purely client-side (no API re-fetch per tab switch), enabling instant tab switching.
- If tier count grows significantly (>20), a virtualized horizontal scroll could be introduced as an enhancement.

### Accessibility
- Tab navigation via keyboard: CapTab supports arrow key navigation between tabs.
- Semantic HTML: Row labels and tier headers should use `role="rowheader"` and `role="columnheader"` attributes.
- Status badges should include `aria-label` with the status text (e.g., "Active status").
- Edit icons should have `aria-label="Edit {tierName}"` for screen readers.

---

## 13. Testing Strategy Overview

### Key Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| Load page and display all tiers for default program | happy-path | High |
| Switch between five tabs and verify correct rows render | happy-path | High |
| Horizontal scroll with 4+ tier columns while row labels remain fixed | happy-path | High |
| Change program selection and verify tier data refreshes | happy-path | High |
| Handle API failure (network error, 500) with error state | error | High |
| Handle empty tier list (program with no tiers) | edge-case | Medium |
| Click "Create tier" button and verify navigation | happy-path | Medium |
| Click edit icon on tier column header and verify navigation | happy-path | Medium |
| Display Active and Inactive status badges correctly | happy-path | Medium |
| Handle slow API response with loading spinner | edge-case | Low |

---

## 14. Architecture Alignment Notes

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| Atomic Design hierarchy | aligned | Page (LoyaltyProgramTiers) -> Organism (TierComparisonTable) -> Molecules (TierColumnHeader, TierDataCell, TierSectionHeader) -> Atoms (Cap* components) |
| Cap-* component mandate | aligned | All leaf-level UI uses Cap* components: CapSelect, CapButton, CapTab, CapLabel, CapIcon, CapRow, CapColumn |
| CapRow/CapColumn layouts | aligned | Layout uses CapRow (horizontal) and CapColumn (vertical) for header and comparison table structure |
| Redux file co-location | aligned | constants.js, actions.js, reducer.js, selectors.js, saga.js co-located in LoyaltyProgramTiers/ |
| Dynamic reducer/saga injection | aligned | `injectReducer({ key: '${CURRENT_APP_NAME}-tier-listing', reducer })` + `injectSaga` via compose() |
| Immutable.js state conventions | aligned | Initial state uses `fromJS({})`, selectors use `.get()` / `.getIn()` / `.toJS()` |
| styled-components styling | aligned | Custom styling via styled-components for TierComparisonTable scroll behavior, TierColumnHeader, TierSectionHeader |
| ESLint 500-line limit | aligned | LoyaltyProgramTiers.js expected ~200 lines, TierComparisonTable.js ~250 lines -- both well under 500 |
| Saga concurrency model | aligned | `takeLatest` for `getTierListingSaga` (consistent with all existing listing sagas) |
| Redux inject key pattern | aligned | `${CURRENT_APP_NAME}-tier-listing` follows the `${CURRENT_APP_NAME}-<slice-name>` pattern |
| Compose pattern | aligned | `compose(injectReducer, injectSaga, connect)(LoyaltyProgramTiers)` at bottom of connected component |

### Alignment with System Map Patterns
- **Saga flow**: `GET_TIER_LISTING_REQUEST` -> `getTierListingSaga` (takeLatest) -> `call(Api.getTierListingData, programId)` -> `put(getTierListingSuccess(data))` / `put(getTierListingFailure(error))`. This mirrors the `getPromotionsListSaga` pattern exactly.
- **Selector pattern**: `makeSelectTierListing()` uses `createSelector(selectTierListingDomain, substate => substate.get('tiers').toJS())` -- consistent with `makeSelectPromotions()`.
- **Action naming**: Request/success/failure triplet (`GET_TIER_LISTING_REQUEST`, `_SUCCESS`, `_FAILURE`) follows the convention from `GET_PROMOTIONS_LIST_REQUEST`.
- **Reducer pattern**: Switch on action type, return `state.set('key', fromJS(value))` -- consistent with `promotionListReducer`.

### Deviations and Justifications
- **TierComparisonTable is BESPOKE (not CapTable)**: CapTable wraps Ant Design Table which requires `dataSource` + `columns` for a standard data grid. The comparison view has tiers as columns and attributes as rows with section headers, fixed left column, and horizontal scrolling -- structurally incompatible with CapTable. **Risk**: Low (isolated to one organism). **Mitigation**: Built from Cap* primitives (CapRow, CapColumn, CapLabel, styled-components), staying within the Cap-* ecosystem.

---

## 15. Open Questions and Decisions Needed

| # | Question | Impact | Owner | Status | Comment |
|---|----------|--------|-------|--------|---------|
| Q1 | Figma-vs-Spec Conflict: Figma shows all five sections (Basic details, Eligibility, Renewal, Downgrade, Benefits) visible simultaneously in a single scrollable view; spec FR-4 and AC-1.5 say "switching tabs updates the row data for all tier columns simultaneously" (implying tabs filter/hide content). | High -- changes whether tabs filter rows or merely scroll-to-section | PM / Designer | resolved | **All 5 sections visible simultaneously in a scrollable view (Figma behavior). Tabs scroll-to-section, not filter/hide.** |
| Q2 | The existing `getTier` API (`GET /loyalty/api/v1/strategy/tier/{programId}`) returns tier configuration data. Does it include benefits per tier (per FR-18), or is a new/extended endpoint needed? | High -- determines whether one or two API calls are needed | BE Team | resolved | **New endpoint needed. Will add `getTierListing` to endpoints.js + api.js with the assumed payload from Section 6.** |
| Q3 | What are the exact route paths for "Create tier" and "Create benefit" navigation destinations? (Currently assumed as `/tiers/create` and `/benefits/create`) | Low -- only affects navigation stubs | PM / Tech Lead | resolved | Default: `/tiers/create` and `/benefits/create` |
| Q4 | Should the program selector pre-populate with the first program from the programs list, or is there a "current program" concept in the platform context? The Cap module has `makeSelectPrograms` for the full list. | Medium -- affects initial data load behavior | Tech Lead | resolved | Default: Pre-populate with the first program from the list |
| Q5 | Should "Inactive" tier columns be visually distinguished (e.g., greyed out, dimmed) beyond the status badge text? Figma shows all tiers as "Active" -- no Inactive design reference available. | Low -- cosmetic | Designer | resolved | Default: No visual distinction beyond the badge (match Figma) |

---

## 16. Figma Naming Improvements

The decomposition step (hld-to-code Phase 5a) assigns Figma nodes to target files (organisms, molecules) by matching HLD Section 3 component names against Figma frame names. When frame names match the PascalCase component name exactly, matching is deterministic -- no fuzzy keyword search, no `AskUserQuestion`, no tree-walking inference.

Below are frames where a rename would remove ambiguity in the next decomposition run:

| Current Figma Frame Name | Node ID | Proposed Rename | Section 3 Component | Why Rename |
|--------------------------|---------|-----------------|---------------------|-----------|
| `3+ Tiers Old nav` | 32:3147 | `LoyaltyProgramTiers` | LoyaltyProgramTiers | Root frame has ambiguous name; rename to match page component |
| `Frame 2087332931` | 32:3148 | `PageContent` | LoyaltyProgramTiers | Auto-generated frame name; rename for clarity |
| `Frame 2087332776` | 32:3149 | `PageHeader` | LoyaltyProgramTiers (header area) | Auto-generated frame name |
| `Frame 2087332929` | 32:3157 | `ActionButtons` | LoyaltyProgramTiers (action buttons) | Auto-generated frame name |
| `N3` | 32:3162 | `TierComparisonTable` | TierComparisonTable | Cryptic name; rename to match organism component |
| `Custom_tab` | 32:3741 | `CategoryTabs` | Custom_LoyaltyProgramTiers (tabs) | `Custom_` prefix forces BESPOKE; rename since CapTab is used |
| `Container` (32:3264) | 32:3264 | `TierColumnHeader_Bronze` | TierColumnHeader | Generic "Container" name; rename to match molecule + tier |
| `Container` (32:3164) | 32:3164 | `RowLabelsColumn` | TierComparisonTable (row labels) | Generic "Container" name |
| `Paragraph` (multiple) | various | Keep as-is | -- | Paragraph frames are leaf text wrappers; renaming is unnecessary |

**How to rename**: open `figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/?node-id=<NodeID>` -> select the frame -> press `F2` -> type the proposed PascalCase name (matching Section 3 exactly).

After renaming, re-run `hld-to-code` -- decomposition.json is produced deterministically and `AskUserQuestion` prompts for ambiguous node assignment disappear.

> **Note**: this section is unrelated to the `Custom_` prefix BESPOKE signal. `Custom_` forces BESPOKE for nodes NOT listed in Section 3 (standalone custom visual primitives). Section 16 addresses a different problem -- making decomposition match Section 3 components reliably.

> **Rename applied**: All frame names above were updated in cached artifacts on 2026-04-19.
> Re-run `figma-node-mapper` after renaming frames in Figma to keep caches in sync.

---

## Metadata

- **Feature**: Tier Management - Tier Listing & Details View
- **PRD Source**: `claudeOutput/filteredPrd/tier-management-spec.md`
- **Generated by**: hld-generator agent
- **Timestamp**: 2026-04-19
- **Architecture Reference**: `.claude/output/architecture.md`
- **System Map Reference**: `.claude/output/loyalty-promotions-system-map.md`
- **Figma Recipes**: `claudeOutput/figma-capui-mapping/32-3147.recipe.json`
- **Prop-Spec Notes**: `claudeOutput/figma-capui-mapping/32-3147/prop-spec-notes.json`
