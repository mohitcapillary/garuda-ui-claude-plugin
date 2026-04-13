# High-Level Design: Benefits Settings

> **Generated**: 2026-04-13
> **PRD Source**: `claudeOutput/filteredPrd/benefits-settings-spec.md`
> **Architecture Reference**: `.claude/output/architecture.md`

---

## 1. Feature Overview

### Feature Name

Benefits Settings

### Description & Business Purpose

The Benefits Settings page provides marketers and loyalty program administrators with a centralized settings screen to manage two types of program-level metadata for the Benefits module: **Custom Fields** (user-defined metadata fields attached to individual benefits) and **Categories** (organizational groupings for benefits). Both entities are scoped to a specific loyalty program and support full CRUD operations with uniqueness enforcement.

This feature is part of the broader Benefits module within Capillary's loyalty management platform. It directly supports the benefits listing and create/edit flows by enabling the schema extensibility (custom fields) and organizational taxonomy (categories) that those flows depend on. Without this settings page, marketers have no mechanism to define program-specific benefit metadata or create a category taxonomy for filtering and grouping.

### Problem Statement

There is currently no dedicated UI for managing the benefit data model schema or its organizational taxonomy. Marketers cannot extend individual benefit records with custom metadata fields, nor can they organize benefits into named categories without these primitives being configurable per-program. This blocks extensibility of the Benefits module and prevents meaningful categorization on the benefits listing page.

### Target Users

- **Loyalty Program Managers / Marketers**: Primary users who configure program-level settings. Perform all CRUD operations on custom fields and categories.
- **Platform Administrators**: May configure settings on behalf of a brand or program.

### Scope

**In Scope**:
- Display a Settings > Benefits page accessible via the left navigation sidebar.
- Show two sections: "Custom fields" (top) and "Categories" (bottom).
- Full CRUD for custom fields: list, create (with Name + Data type selection), edit (Name only; Data type is read-only after creation), delete with confirmation.
- Full CRUD for categories: list, create (Name input), edit (Name update), delete with confirmation.
- Uniqueness enforcement: custom field names unique within active benefit custom fields per program; category names unique within active categories per program.
- Soft deletion (name reuse enabled after deletion).
- Sortable "Last updated on" column in both tables.
- Empty state display when no items exist.
- Inline validation: empty name, duplicate name detection.
- Delete confirmation dialog before executing deletion.

**Out of Scope**:
- Assigning custom fields or categories to individual benefits (handled in the benefit create/edit flow).
- Bulk import/export.
- Custom field ordering or drag-and-drop reordering.
- Custom field validation rules beyond data type (regex, min/max values).
- Cross-program sharing of custom fields or categories.

---

## 2. Technical Objective

### Technical Goals

1. **Maintainability**: Introduce a clean, isolated Redux slice (`benefits-settings`) following existing garuda-ui page patterns (co-located reducer, saga, selectors, constants, actions). This isolates the Benefits Settings state from existing promotion and cap slices.
2. **Reusability**: Compose the page from existing Cap-UI-Library components (`CapTable`, `CapButton`, `CapModal`, `CapInput`, `CapSelect`, `CapSpin`, `CapLabel`, `CapRow`, `CapColumn`, `CapSideBar`). No new atoms are introduced.
3. **Scalability**: State management handles up to 200+ entries per section. CapTable with `pagination={false}` is used initially (consistent with the Figma design), with the architecture supporting a future migration to paginated or infinite-scroll mode without Redux changes.
4. **Performance**: Tables are rendered only after data fetch succeeds (`REQUEST` to `SUCCESS` status gating). React.memo and `useMemo`/`useCallback` are applied on the page component consistent with `PromotionList`.
5. **Extensibility**: The custom field pattern (Name + Data Type) is designed to allow additional data types to be added without schema changes — the type list is sourced from a constants file or API response.

### Architecture Fit

This feature follows the same pattern as `PromotionList` (a standalone page with its own Redux slice, no sub-organisms owning Redux state, CapTable-based listing, CapModal for create/edit). The page registers `injectReducer` and `injectSaga` HOCs at mount time, consistent with the Dynamic Reducer/Saga Injection convention documented in `architecture.md`. The Cap shell provides program context via `makeSelectPrograms()` selector, which the page consumes to scope all API calls.

---

## 3. Impact Analysis

### New Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `BenefitsSettings` | page | `app/components/pages/BenefitsSettings/BenefitsSettings.js` | Root container for the Benefits Settings page. Redux-connected. Renders both settings sections. |
| `BenefitsSettingsLoadable` | page | `app/components/pages/BenefitsSettings/Loadable.js` | Async loadable wrapper with HOC composition (auth, translations, optional feature flag). |
| `CustomFieldsSection` | organism | `app/components/organisms/CustomFieldsSection/index.js` | Renders the Custom Fields listing table, section header, and manages create/edit/delete modal state locally. |
| `CategoriesSection` | organism | `app/components/organisms/CategoriesSection/index.js` | Renders the Categories listing table, section header, and manages create/edit/delete modal state locally. |
| `BenefitsSettingsModal` | molecule | `app/components/molecules/BenefitsSettingsModal/index.js` | Shared modal component for create/edit operations on both custom fields and categories. Renders Name input and optional Data type selector for custom fields. |
| `DeleteConfirmModal` | molecule | `app/components/molecules/DeleteConfirmModal/index.js` | Reusable confirmation dialog for delete operations. [ASSUMED — to be confirmed against existing PromotionModal patterns before implementation] |

### Modified Components

| Component | Location | Change Description |
|-----------|----------|--------------------|
| `Cap` (NavigationBar) | `app/components/pages/Cap/Cap.js` | Add "Benefits" sub-item under Settings sidebar via `getSettingsMenuData` function. |
| `Cap` (constants.js) | `app/components/pages/Cap/constants.js` | Add `BENEFITS_SETTINGS_URL = '/settings/benefits'` and include it in `getSettingsMenuData()` array. |
| `App` (routes) | `app/components/pages/App/index.js` | Add route `<RenderRoute path="/settings/benefits" component={BenefitsSettingsLoadable} />` inside protected Cap shell routes. |
| `app/services/api.js` | `app/services/api.js` | Add 8 new API methods: `getBenefitsCustomFields`, `createBenefitCustomField`, `updateBenefitCustomField`, `deleteBenefitCustomField`, `getBenefitsCategories`, `createBenefitCategory`, `updateBenefitCategory`, `deleteBenefitCategory`. |

### New Redux Domains

| Domain | Inject Key | Reducer | Saga | Purpose |
|--------|-----------|---------|------|---------|
| `benefits-settings` | `${CURRENT_APP_NAME}-benefits-settings` | `BenefitsSettings/reducer.js` | `BenefitsSettings/saga.js` | Stores custom fields list, categories list, and API status fields for both sections. |

### New Routes

| Route Path | Component | Auth Required | Description |
|------------|-----------|---------------|-------------|
| `/settings/benefits` | `BenefitsSettingsLoadable` | Yes | Benefits Settings page — accessible via Settings > Benefits in left nav. |

### Shared Utilities / Hooks

| Name | Location | New/Modified | Purpose |
|------|----------|-------------|---------|
| `messages.js` | `app/components/pages/BenefitsSettings/messages.js` | New | react-intl message descriptors for all user-visible strings in the Benefits Settings page. |

---

## 4. UI/UX Changes

### Screen Flow

The user navigates to Settings > Benefits via the left navigation sidebar (CapSideBar). The page loads both Custom Fields and Categories sections simultaneously (two parallel API calls on mount). Each section has an independent "New" CTA that opens a `CapModal`. Inline table row edit/delete CTAs operate on single records. Delete triggers a confirmation modal before execution. Success/failure notifications use `CapNotification`.

```
Settings Sidebar
      |
      +-- Benefits (active, blue highlight)
             |
             v
  BenefitsSettings page (mounts, dispatches:
    GET_CUSTOM_FIELDS_REQUEST + GET_CATEGORIES_REQUEST)
             |
    +--------+---------+
    v                  v
  Custom Fields     Categories
  section loaded    section loaded
    |                  |
  [New custom field]  [New category]
    |                  |
  CapPopover opens    CapPopOver opens
  (Name + DataType)  (Name only)
    |                  |
  Save -> dispatch  Save -> dispatch
  CREATE_CUSTOM_FIELD  CREATE_CATEGORY
    |                  |
  Table refreshes   Table refreshes

  [Edit icon] -> modal pre-filled
  [Delete icon] -> confirm modal -> dispatch DELETE
```

---

### Screen: Benefits Settings Page

**Route**: `/settings/benefits`
**Purpose**: Allows marketers to manage custom fields and categories for benefits within the currently active program.

**Component Boundaries**:
- `BenefitsSettings` (page) — Redux-connected container, dispatches data fetch on mount, owns `programId` from Cap state
- `CustomFieldsSection` (organism) — Renders the custom fields table, header row with CTA, manages local modal open/close state
- `CategoriesSection` (organism) — Renders the categories table, header row with CTA, manages local modal open/close state
- `BenefitsSettingsModal` (molecule) — Shared create/edit modal; receives `modalType` prop (CUSTOM_FIELD or CATEGORY), `initialValues`, `onSave`, `onCancel`
- `DeleteConfirmModal` (molecule) — Shared delete confirmation modal
- `CapTable` (atom, cap-ui-library) — Data grid for listing items in each section
- `CapButton` (atom, cap-ui-library) — "New custom field" and "New category" CTAs; row-level edit/delete actions
- `CapPopover` (atom, cap-ui-library) — Create/edit and delete confirmation overlays
- `CapInput` (atom, cap-ui-library) — Name field in create/edit modal
- `CapSelect` (atom, cap-ui-library) — Data type selector in custom field create modal
- `CapLabel` (atom, cap-ui-library) — Section titles, subtitles, page heading
- `CapRow` / `CapColumn` (atoms, cap-ui-library) — Section layout wrappers
- `CapSpin` (atom, cap-ui-library) — Loading state for each section

**Component Recipe** *(recipe-verified from figma-node-mapper — review and correct before code generation)*:

| UI Section | Cap* Component | Recipe Status | Reviewer Override |
|------------|----------------|---------------|-------------------|
| Settings Sidebar | `CapSideBar` | EXACT | |
| Sidebar Nav Items | `CapMenu` | PARTIAL | |
| Nav Active Indicator Divider | `CapDivider` | PARTIAL | |
| Page Title "Benefits" | `CapLabel` | EXACT | |
| Custom Fields Section Container | `CapColumn` | EXACT | |
| Custom Fields Section Header Row | `CapRow` | RESOLVED-UNMAPPED (fallback nearestComponent=CapRow) | |
| Section Title Group (title + subtitle) | `CapColumn` | EXACT | |
| "New custom field" Button | `CapButton` | EXACT | |
| Custom Fields Table | `CapTable` | EXACT | |
| Categories Section Container | `CapColumn` | EXACT | |
| Categories Section Header Row | `CapRow` | RESOLVED-UNMAPPED (fallback nearestComponent=CapRow) | |
| "New category" Button | `CapButton` | EXACT | |
| Categories Table | `CapTable` | EXACT | |
| Create Category Modal | `CapPopover` | RESOLVED-UNMAPPED (Figma CapPopover -> CapModal per spec FR-3/FR-7) | |
| Category/Custom Field Name Input | `CapInput` | EXACT | |
| Data Type Selector | `CapSelect` | ASSUMED — not visible in Figma frame 24-2729; derived from FR-7 | |
| Sort Icon (carrot) in table headers | `CapIcon` | ASSUMED — Atoms/Icons/24/filled/carrot resolves to icon instance | |

*Recipe source*: `claudeOutput/figma-capui-mapping/24-2729.recipe.json`
*Prop-spec notes*: `claudeOutput/figma-capui-mapping/24-2729/prop-spec-notes.json`

> **Recipe verification**: The Figma screenshot (node 24:2729) shows a two-panel layout: a 240px settings sidebar (CapSideBar, EXACT) with three nav items (CapMenu, PARTIAL), and a 1200px main content area with a "Benefits" page heading (CapLabel, EXACT), two vertically-stacked section blocks (CapColumn, EXACT), each with a header row (CapRow, resolved from fallback) containing section title/subtitle (CapColumn, EXACT) and a green CTA button (CapButton, EXACT), followed by a bordered data table (CapTable, EXACT). The create-category popover visible in the screenshot is rendered as CapModal per FR-3 spec. Sort icons map to CapIcon (ASSUMED). The CapSelect for data type and full custom field modal are ASSUMED from FR-7 as no separate Figma frame was provided. Every leaf-level Cap* component in the ASCII diagram matches a recipe entry or is explicitly marked ASSUMED.

**User Interactions -> Redux Actions**:

| User Action | Component | Dispatched Action | Saga Triggered |
|-------------|-----------|-------------------|----------------|
| Page mounts | `BenefitsSettings` | `GET_CUSTOM_FIELDS_REQUEST` | `getCustomFieldsSaga` |
| Page mounts | `BenefitsSettings` | `GET_CATEGORIES_REQUEST` | `getCategoriesSaga` |
| Click "New custom field" | `CustomFieldsSection` | local state only (modal open) | none |
| Submit create custom field form | `BenefitsSettingsModal` | `CREATE_CUSTOM_FIELD_REQUEST` | `createCustomFieldSaga` |
| Click edit icon on custom field row | `CustomFieldsSection` | local state only (modal open with pre-fill) | none |
| Submit edit custom field form | `BenefitsSettingsModal` | `UPDATE_CUSTOM_FIELD_REQUEST` | `updateCustomFieldSaga` |
| Click delete icon on custom field row | `CustomFieldsSection` | local state only (confirm modal open) | none |
| Confirm delete of custom field | `DeleteConfirmModal` | `DELETE_CUSTOM_FIELD_REQUEST` | `deleteCustomFieldSaga` |
| Click "New category" | `CategoriesSection` | local state only (modal open) | none |
| Submit create category form | `BenefitsSettingsModal` | `CREATE_CATEGORY_REQUEST` | `createCategorySaga` |
| Click edit icon on category row | `CategoriesSection` | local state only (modal open with pre-fill) | none |
| Submit edit category form | `BenefitsSettingsModal` | `UPDATE_CATEGORY_REQUEST` | `updateCategorySaga` |
| Click delete icon on category row | `CategoriesSection` | local state only (confirm modal open) | none |
| Confirm delete of category | `DeleteConfirmModal` | `DELETE_CATEGORY_REQUEST` | `deleteCategorySaga` |
| Click sort icon on "Last updated on" column | `CapTable` (onChange) | `SET_CUSTOM_FIELDS_SORT` / `SET_CATEGORIES_SORT` | none (reducer update, then re-dispatch GET) |

**Architecture Diagram**:

```
+---------------------------------------------------------------------------+
| BenefitsSettings (page)                                                   |
| Route: /settings/benefits                                                 |
| Redux: benefits-settings reducer                                          |
|                                                                           |
| +----------------------+  +------------------------------------------+  |
| | CapSideBar (EXACT)   |  | CapColumn - MainContent                  |  |
| |                      |  |                                          |  |
| |  CapMenu: PARTIAL    |  |  CapLabel: "Benefits" (EXACT)            |  |
| |  - Loyalty promotion |  |                                          |  |
| |  - Benefits (active) |  |  CustomFieldsSection (organism)          |  |
| |  - Subscription prog |  |  Redux <- makeSelectCustomFields()       |  |
| |                      |  |  Saga  <- getCustomFieldsSaga            |  |
| |  CapDivider (PARTIAL)|  |                                          |  |
| +----------------------+  |  +------------------------------------+  |  |
|                            |  | CapRow - SectionHeader             |  |  |
|                            |  | CapColumn (title+subtitle) EXACT   |  |  |
|                            |  | CapButton: "New custom field" EXACT|  |  |
|                            |  | dispatch: opens modal (local)      |  |  |
|                            |  +------------------------------------+  |  |
|                            |                                          |  |
|                            |  +------------------------------------+  |  |
|                            |  | CapTable (EXACT)                   |  |  |
|                            |  | cols: Name, DataType, UpdatedOn    |  |  |
|                            |  | onChange: SET_CUSTOM_FIELDS_SORT   |  |  |
|                            |  | CapIcon: sort carrot (ASSUMED)     |  |  |
|                            |  +------------------------------------+  |  |
|                            |                                          |  |
|                            |  CategoriesSection (organism)            |  |
|                            |  Redux <- makeSelectCategories()         |  |
|                            |  Saga  <- getCategoriesSaga              |  |
|                            |                                          |  |
|                            |  +------------------------------------+  |  |
|                            |  | CapRow - SectionHeader             |  |  |
|                            |  | CapColumn (title+subtitle) EXACT   |  |  |
|                            |  | CapButton: "New category" (EXACT)  |  |  |
|                            |  | dispatch: opens modal (local)      |  |  |
|                            |  +------------------------------------+  |  |
|                            |                                          |  |
|                            |  +------------------------------------+  |  |
|                            |  | CapTable (EXACT)                   |  |  |
|                            |  | cols: Name, UpdatedOn/UpdatedBy    |  |  |
|                            |  | onChange: SET_CATEGORIES_SORT      |  |  |
|                            |  | CapIcon: sort carrot (ASSUMED)     |  |  |
|                            |  +------------------------------------+  |  |
|                            +------------------------------------------+  |
|                                                                           |
| +-----------------------------------------------------------------------+ |
| | BenefitsSettingsModal (molecule) - CapPopover wrapper                   | |
| | visible: controlled by organism local state                           | |
| | CapInput: Name field (EXACT)                                          | |
| | CapSelect: Data type selector (ASSUMED - not in Figma frame 24-2729)  | |
| | CapButton: Save (EXACT) / Cancel (EXACT)                              | |
| | dispatch: CREATE_*/UPDATE_* on Save                                   | |
| +-----------------------------------------------------------------------+ |
+---------------------------------------------------------------------------+
```

[See: Benefits Settings Page](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=24-2729)

> **Note on Custom Field Create Modal**: The Figma design (node 24-2729) only shows the category creation modal with a single Name field. The custom field create modal (with Name + Data type selector) is not visible in this frame. The `CapSelect` for data type is derived from FR-7 and PRD assumption 5. These elements are marked `[ASSUMED - spec-derived]`.

---

## 5. Directory Structure

```
app/components/
+-- pages/
|   +-- BenefitsSettings/
|       +-- index.js              # Public export (points to Loadable)
|       +-- Loadable.js           # Dynamic import + HOC composition
|       +-- BenefitsSettings.js   # Page component with connect()
|       +-- constants.js          # Action type strings (actionTypes.*)
|       +-- actions.js            # Action creators
|       +-- reducer.js            # Reducer with fromJS() initial state
|       +-- selectors.js          # Reselect memoized selectors
|       +-- saga.js               # Saga watchers and workers
|       +-- messages.js           # react-intl message descriptors
|       +-- styles.js             # styled-components
+-- organisms/
|   +-- CustomFieldsSection/
|   |   +-- index.js
|   |   +-- CustomFieldsSection.js
|   |   +-- styles.js
|   +-- CategoriesSection/
|       +-- index.js
|       +-- CategoriesSection.js
|       +-- styles.js
+-- molecules/
    +-- BenefitsSettingsModal/
    |   +-- index.js
    |   +-- BenefitsSettingsModal.js
    |   +-- constants.js          # MODAL_TYPE: CUSTOM_FIELD, CATEGORY
    |   +-- styles.js
    +-- DeleteConfirmModal/
        +-- index.js
        +-- DeleteConfirmModal.js
        +-- styles.js
```

### Naming Conventions

- **Page**: `BenefitsSettings` — PascalCase, matches folder name.
- **Inject key**: `${CURRENT_APP_NAME}-benefits-settings` — consistent with `${CURRENT_APP_NAME}-promotions-list`.
- **Action types**: `GET_CUSTOM_FIELDS_REQUEST/SUCCESS/FAILURE`, `CREATE_CUSTOM_FIELD_REQUEST/SUCCESS/FAILURE`, `UPDATE_CUSTOM_FIELD_REQUEST/SUCCESS/FAILURE`, `DELETE_CUSTOM_FIELD_REQUEST/SUCCESS/FAILURE`, and equivalent for categories, plus `SET_CUSTOM_FIELDS_SORT`, `SET_CATEGORIES_SORT`, `CLEAR_BENEFITS_SETTINGS_DATA`.
- **Selectors**: `makeSelectCustomFields()`, `makeSelectCustomFieldsStatus()`, `makeSelectCategories()`, `makeSelectCategoriesStatus()`, etc.
- **Sagas**: `watchForGetCustomFieldsSaga`, `watchForGetCategoriesSaga`, `watchForCreateCustomFieldSaga`, etc. — consistent with `watchForGetPromotionsListSaga` naming.

---

## 6. API Structure

### API: Get Custom Fields List

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `GET /incentives/api/v1/benefits/custom-fields` |
| Method | `GET` |
| Auth | Yes |

**Request Payload** (query params):
```json
{
  "programId": "string (required)",
  "sortBy": "updatedOn",
  "sortOrder": "ASC | DESC",
  "status": "ACTIVE"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "customFields": [
      {
        "id": "string",
        "name": "Disclaimer",
        "dataType": "STRING",
        "programId": "string",
        "updatedBy": "Dev Patel",
        "updatedOn": "2024-06-12T00:00:00Z",
        "status": "ACTIVE"
      }
    ],
    "totalCount": 5
  }
}
```

**Validation Rules**:
- `programId` is required.
- `sortOrder` must be `ASC` or `DESC` if provided.

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | BAD_REQUEST | Missing or invalid programId |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Program not found |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Create Custom Field

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `POST /incentives/api/v1/benefits/custom-fields` |
| Method | `POST` |
| Auth | Yes |

**Request Payload**:
```json
{
  "programId": "string",
  "name": "Disclaimer",
  "dataType": "STRING | DATE | NUMBER"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "string",
    "name": "Disclaimer",
    "dataType": "STRING",
    "programId": "string",
    "updatedBy": "string",
    "updatedOn": "2024-06-12T00:00:00Z",
    "status": "ACTIVE"
  }
}
```

**Validation Rules**:
- `name` is required; max 255 characters.
- `dataType` must be one of `STRING`, `DATE`, `NUMBER`.
- `name` must be unique among active benefit custom fields for the `programId`.

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | DUPLICATE_NAME | Custom field name already exists in active scope |
| 400 | INVALID_DATA_TYPE | Unsupported dataType value |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Update Custom Field

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `PUT /incentives/api/v1/benefits/custom-fields/{id}` |
| Method | `PUT` |
| Auth | Yes |

**Request Payload**:
```json
{
  "programId": "string",
  "name": "Updated Name"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "string",
    "name": "Updated Name",
    "dataType": "STRING",
    "programId": "string",
    "updatedBy": "string",
    "updatedOn": "2024-06-12T00:00:00Z"
  }
}
```

**Validation Rules**:
- `name` is required; max 255 characters.
- `dataType` is NOT accepted in update payload (immutable after creation).
- `name` must be unique among active benefit custom fields for the `programId`.

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | DUPLICATE_NAME | Name already exists in active scope |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Custom field with given id does not exist |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Delete Custom Field

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `DELETE /incentives/api/v1/benefits/custom-fields/{id}` |
| Method | `DELETE` |
| Auth | Yes |

**Request Payload**: None (id in URL path)

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "string", "status": "DELETED" }
}
```

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Custom field with given id does not exist |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Get Categories List

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `GET /incentives/api/v1/benefits/categories` |
| Method | `GET` |
| Auth | Yes |

**Request Payload** (query params):
```json
{
  "programId": "string (required)",
  "sortBy": "updatedOn",
  "sortOrder": "ASC | DESC",
  "status": "ACTIVE"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "categories": [
      {
        "id": "string",
        "name": "Disclaimer",
        "programId": "string",
        "updatedBy": "Dev Patel",
        "updatedOn": "2024-06-12T00:00:00Z",
        "status": "ACTIVE"
      }
    ],
    "totalCount": 5
  }
}
```

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | BAD_REQUEST | Missing or invalid programId |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Create Category

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `POST /incentives/api/v1/benefits/categories` |
| Method | `POST` |
| Auth | Yes |

**Request Payload**:
```json
{
  "programId": "string",
  "name": "Disclaimer"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "string",
    "name": "Disclaimer",
    "programId": "string",
    "updatedBy": "string",
    "updatedOn": "2024-06-12T00:00:00Z",
    "status": "ACTIVE"
  }
}
```

**Validation Rules**:
- `name` is required; max 255 characters.
- `name` must be unique among active categories for the `programId`.

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | DUPLICATE_NAME | Category name already exists in active scope |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Update Category

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `PUT /incentives/api/v1/benefits/categories/{id}` |
| Method | `PUT` |
| Auth | Yes |

**Request Payload**:
```json
{
  "programId": "string",
  "name": "Updated Category Name"
}
```

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "string",
    "name": "Updated Category Name",
    "programId": "string",
    "updatedBy": "string",
    "updatedOn": "2024-06-12T00:00:00Z"
  }
}
```

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | DUPLICATE_NAME | Name already exists in active scope |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Category with given id does not exist |
| 500 | INTERNAL_ERROR | Server-side failure |

---

### API: Delete Category

**Status**: [ASSUMED — API spec not provided in PRD]

| Field | Value |
|-------|-------|
| Endpoint | `DELETE /incentives/api/v1/benefits/categories/{id}` |
| Method | `DELETE` |
| Auth | Yes |

**Request Payload**: None (id in URL path)

**Response Payload**:
```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "string", "status": "DELETED" }
}
```

**Error States**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Category with given id does not exist |
| 500 | INTERNAL_ERROR | Server-side failure |

---

## 7. Data and State Management Overview

### Redux Store Shape

```javascript
// Inject key: ${CURRENT_APP_NAME}-benefits-settings
fromJS({
  // Custom Fields
  customFields: [],                 // Array of custom field objects
  customFieldsStatus: 'INITIAL',    // INITIAL | REQUEST | SUCCESS | FAILURE
  customFieldsError: null,
  customFieldsSortBy: 'updatedOn',
  customFieldsSortOrder: 'DESC',

  // Mutation status for custom fields
  createCustomFieldStatus: 'INITIAL',
  updateCustomFieldStatus: 'INITIAL',
  deleteCustomFieldStatus: 'INITIAL',

  // Categories
  categories: [],                   // Array of category objects
  categoriesStatus: 'INITIAL',      // INITIAL | REQUEST | SUCCESS | FAILURE
  categoriesError: null,
  categoriesSortBy: 'updatedOn',
  categoriesSortOrder: 'DESC',

  // Mutation status for categories
  createCategoryStatus: 'INITIAL',
  updateCategoryStatus: 'INITIAL',
  deleteCategoryStatus: 'INITIAL',
})
```

### Actions

| Action Type | Creator | Purpose |
|-------------|---------|---------|
| `GET_CUSTOM_FIELDS_REQUEST` | `getCustomFields(programId, sortBy, sortOrder)` | Fetch all active custom fields for the program |
| `GET_CUSTOM_FIELDS_SUCCESS` | `getCustomFieldsSuccess(data)` | Store fetched custom fields |
| `GET_CUSTOM_FIELDS_FAILURE` | `getCustomFieldsFailure(error)` | Store fetch error |
| `CREATE_CUSTOM_FIELD_REQUEST` | `createCustomField(programId, name, dataType)` | Create a new custom field |
| `CREATE_CUSTOM_FIELD_SUCCESS` | `createCustomFieldSuccess(data)` | Trigger list refresh |
| `CREATE_CUSTOM_FIELD_FAILURE` | `createCustomFieldFailure(error)` | Store create error |
| `UPDATE_CUSTOM_FIELD_REQUEST` | `updateCustomField(id, programId, name)` | Update custom field name |
| `UPDATE_CUSTOM_FIELD_SUCCESS` | `updateCustomFieldSuccess(data)` | Trigger list refresh |
| `UPDATE_CUSTOM_FIELD_FAILURE` | `updateCustomFieldFailure(error)` | Store update error |
| `DELETE_CUSTOM_FIELD_REQUEST` | `deleteCustomField(id, programId)` | Delete a custom field (soft delete) |
| `DELETE_CUSTOM_FIELD_SUCCESS` | `deleteCustomFieldSuccess(id)` | Trigger list refresh |
| `DELETE_CUSTOM_FIELD_FAILURE` | `deleteCustomFieldFailure(error)` | Store delete error |
| `SET_CUSTOM_FIELDS_SORT` | `setCustomFieldsSort(sortBy, sortOrder)` | Update sort state |
| `GET_CATEGORIES_REQUEST` | `getCategories(programId, sortBy, sortOrder)` | Fetch all active categories for the program |
| `GET_CATEGORIES_SUCCESS` | `getCategoriesSuccess(data)` | Store fetched categories |
| `GET_CATEGORIES_FAILURE` | `getCategoriesFailure(error)` | Store fetch error |
| `CREATE_CATEGORY_REQUEST` | `createCategory(programId, name)` | Create a new category |
| `CREATE_CATEGORY_SUCCESS` | `createCategorySuccess(data)` | Trigger list refresh |
| `CREATE_CATEGORY_FAILURE` | `createCategoryFailure(error)` | Store create error |
| `UPDATE_CATEGORY_REQUEST` | `updateCategory(id, programId, name)` | Update category name |
| `UPDATE_CATEGORY_SUCCESS` | `updateCategorySuccess(data)` | Trigger list refresh |
| `UPDATE_CATEGORY_FAILURE` | `updateCategoryFailure(error)` | Store update error |
| `DELETE_CATEGORY_REQUEST` | `deleteCategory(id, programId)` | Delete a category (soft delete) |
| `DELETE_CATEGORY_SUCCESS` | `deleteCategorySuccess(id)` | Trigger list refresh |
| `DELETE_CATEGORY_FAILURE` | `deleteCategoryFailure(error)` | Store delete error |
| `SET_CATEGORIES_SORT` | `setCategoriesSort(sortBy, sortOrder)` | Update sort state |
| `CLEAR_BENEFITS_SETTINGS_DATA` | `clearBenefitsSettingsData()` | Reset to initialState on unmount |

### Selectors

| Selector | State Path | Returns |
|----------|-----------|---------|
| `makeSelectCustomFields()` | `benefits-settings.customFields` | Array of custom field objects (`.toJS()`) |
| `makeSelectCustomFieldsStatus()` | `benefits-settings.customFieldsStatus` | Status string |
| `makeSelectCustomFieldsError()` | `benefits-settings.customFieldsError` | Error object |
| `makeSelectCategories()` | `benefits-settings.categories` | Array of category objects (`.toJS()`) |
| `makeSelectCategoriesStatus()` | `benefits-settings.categoriesStatus` | Status string |
| `makeSelectCategoriesError()` | `benefits-settings.categoriesError` | Error object |
| `makeSelectCreateCustomFieldStatus()` | `benefits-settings.createCustomFieldStatus` | Mutation status string |
| `makeSelectCreateCategoryStatus()` | `benefits-settings.createCategoryStatus` | Mutation status string |
| `makeSelectDeleteCustomFieldStatus()` | `benefits-settings.deleteCustomFieldStatus` | Mutation status string |
| `makeSelectDeleteCategoryStatus()` | `benefits-settings.deleteCategoryStatus` | Mutation status string |

### Saga Orchestration

| Saga | Trigger Action | API Call | On Success | On Failure | Concurrency |
|------|---------------|----------|------------|------------|-------------|
| `getCustomFieldsSaga` | `GET_CUSTOM_FIELDS_REQUEST` | `getBenefitsCustomFields(programId, sortBy, sortOrder)` | `getCustomFieldsSuccess` | `getCustomFieldsFailure` | `takeLatest` |
| `getCategoriesSaga` | `GET_CATEGORIES_REQUEST` | `getBenefitsCategories(programId, sortBy, sortOrder)` | `getCategoriesSuccess` | `getCategoriesFailure` | `takeLatest` |
| `createCustomFieldSaga` | `CREATE_CUSTOM_FIELD_REQUEST` | `createBenefitCustomField(payload)` | `createCustomFieldSuccess` then re-dispatch `GET_CUSTOM_FIELDS_REQUEST` | `createCustomFieldFailure` | `takeLatest` |
| `updateCustomFieldSaga` | `UPDATE_CUSTOM_FIELD_REQUEST` | `updateBenefitCustomField(id, payload)` | `updateCustomFieldSuccess` then re-dispatch `GET_CUSTOM_FIELDS_REQUEST` | `updateCustomFieldFailure` | `takeLatest` |
| `deleteCustomFieldSaga` | `DELETE_CUSTOM_FIELD_REQUEST` | `deleteBenefitCustomField(id)` | `deleteCustomFieldSuccess` then re-dispatch `GET_CUSTOM_FIELDS_REQUEST` | `deleteCustomFieldFailure` | `takeLatest` |
| `createCategorySaga` | `CREATE_CATEGORY_REQUEST` | `createBenefitCategory(payload)` | `createCategorySuccess` then re-dispatch `GET_CATEGORIES_REQUEST` | `createCategoryFailure` | `takeLatest` |
| `updateCategorySaga` | `UPDATE_CATEGORY_REQUEST` | `updateBenefitCategory(id, payload)` | `updateCategorySuccess` then re-dispatch `GET_CATEGORIES_REQUEST` | `updateCategoryFailure` | `takeLatest` |
| `deleteCategorySaga` | `DELETE_CATEGORY_REQUEST` | `deleteBenefitCategory(id)` | `deleteCategorySuccess` then re-dispatch `GET_CATEGORIES_REQUEST` | `deleteCategoryFailure` | `takeLatest` |

### Local State vs Redux State

| Data Point | Storage | Rationale |
|-----------|---------|-----------|
| Custom fields list | Redux | Shared across multiple child components; needs to persist across re-renders |
| Categories list | Redux | Same as above |
| API status (fetch/create/update/delete) | Redux | Drives loading spinners and notifications at page level |
| Modal open/close state | Local (organism state) | UI-only state, not needed outside the organism; consistent with PromotionConfig local state pattern |
| Current item being edited/deleted | Local (organism state) | Transient selection state; does not need to survive remount |
| Sort parameters (sortBy, sortOrder) | Redux | Sort triggers API refetch; must survive re-renders and be accessible to saga |
| Form field values inside modal | Local (molecule state) | Ephemeral input state; discarded on modal close |

---

## 8. Validation

### Client-Side Validation

| Screen | Field | Rule | Message |
|--------|-------|------|---------|
| Create/Edit Custom Field | Name | Required (non-empty) | "Name is required" |
| Create/Edit Custom Field | Name | Unique among active custom fields in program (checked against Redux list before dispatch) | "This custom field name already exists" |
| Create Custom Field | Data type | Required (must select a value) | "Data type is required" |
| Create/Edit Category | Name | Required (non-empty) | "Name is required" |
| Create/Edit Category | Name | Unique among active categories in program (excluding current item on edit) | "This category name already exists" |

### Server-Side Validation Handling

Server-side validation errors (HTTP 400 with `DUPLICATE_NAME` or similar error codes) are caught in the saga's `catch` block and dispatched as `*_FAILURE` actions. The organisms observe the mutation status (e.g., `createCustomFieldStatus === FAILURE`) and display the error message from the Redux store inline near the Name input field in the modal using `CapInput`'s `errorMessage` prop. Errors are cleared when the modal is closed or when a new submission is attempted.

---

## 9. Reusable Patterns and Shared Utilities

### Existing to Reuse

| Component/Utility | Location | Usage in This Feature |
|-------------------|----------|-----------------------|
| `CapTable` | `@capillarytech/cap-ui-library/CapTable` | Custom fields and categories listing tables |
| `CapButton` | `@capillarytech/cap-ui-library/CapButton` | Section CTAs; row edit/delete actions; modal Save/Cancel |
| `CapModal` | `@capillarytech/cap-ui-library/CapModal` | Create/edit and delete confirmation overlays |
| `CapInput` | `@capillarytech/cap-ui-library/CapInput` | Name field in modals |
| `CapSelect` | `@capillarytech/cap-ui-library/CapSelect` | Data type selector in create custom field modal |
| `CapSpin` | `@capillarytech/cap-ui-library/CapSpin` | Loading state during API fetch |
| `CapLabel` | `@capillarytech/cap-ui-library/CapLabel` | Page heading, section titles, subtitles, table cell text |
| `CapRow` | `@capillarytech/cap-ui-library/CapRow` | Section header horizontal layouts |
| `CapColumn` | `@capillarytech/cap-ui-library/CapColumn` | Section vertical containers, title+subtitle groups |
| `CapIcon` | `@capillarytech/cap-ui-library/CapIcon` | Sort icon in table headers; row edit/delete action icons |
| `CapHeading` | `@capillarytech/cap-ui-library/CapHeading` | Section headings (H3/Medium style) |
| `CapNotification` | `@capillarytech/cap-ui-library/CapNotification` | Success/error toast notifications after CRUD operations |
| `EmptyStateIllustration` | `app/components/molecules/EmptyStateIllustration` | Empty state display for both sections |
| `injectReducer` | `app/utils/injectReducer.js` | HOC to dynamically inject the benefits-settings reducer |
| `injectSaga` | `app/utils/injectSaga.js` | HOC to dynamically inject sagas in DAEMON mode |
| `makeSelectPrograms()` | `app/components/pages/Cap/selectors.js` | Reads current program from Cap state for API scoping |
| `withMemo` | `app/hoc/withMemo.js` | HOC for React.memo wrapping on page component |
| `clearDataOnUnmount` | `@capillarytech/vulcan-react-sdk/utils` | Clear Redux slice on page unmount |
| `withStyles` | `@capillarytech/vulcan-react-sdk/utils` | Inject styled-components className |
| `PageTemplate` | `app/components/templates/PageTemplate` | Layout wrapper consistent with PromotionList |

### New Patterns Introduced

The **benefits-settings Redux slice** introduces a pattern for settings pages that manage two independent CRUD entities within a single Redux slice using separate status field prefixes (`customFields*`, `categories*`). This differs from existing pages that manage one entity type. Future settings pages (e.g., Subscription Program settings) can follow this multi-entity status field pattern.

The `BenefitsSettingsModal` molecule establishes a type-driven modal pattern (receives `modalType` prop to switch between form layouts). This can be extended to other Benefits module dialogs.

---

## 10. Dependencies

### Internal Module Dependencies

| Module | Purpose | Status |
|--------|---------|--------|
| `app/components/pages/Cap` | Program context via `makeSelectPrograms()`; sidebar navigation must include Benefits | existing |
| `app/components/pages/App` | Root router where `/settings/benefits` route must be registered | existing |
| `app/components/templates/PageTemplate` | Page layout wrapper | existing |
| `app/components/molecules/EmptyStateIllustration` | Empty state UI | existing |
| `app/utils/injectReducer.js` / `app/utils/injectSaga.js` | HOC injection | existing |
| `app/services/api.js` | Must receive 8 new API methods for Benefits Settings CRUD | modified |
| `app/config/endpoints.js` | `incentives_endpoint` already defined — no changes needed if benefits APIs share this base path | existing |

### External API Dependencies

| API | Purpose | Status |
|-----|---------|--------|
| `GET /incentives/api/v1/benefits/custom-fields` | Fetch custom fields list | [ASSUMED] |
| `POST /incentives/api/v1/benefits/custom-fields` | Create custom field | [ASSUMED] |
| `PUT /incentives/api/v1/benefits/custom-fields/{id}` | Update custom field name | [ASSUMED] |
| `DELETE /incentives/api/v1/benefits/custom-fields/{id}` | Delete custom field | [ASSUMED] |
| `GET /incentives/api/v1/benefits/categories` | Fetch categories list | [ASSUMED] |
| `POST /incentives/api/v1/benefits/categories` | Create category | [ASSUMED] |
| `PUT /incentives/api/v1/benefits/categories/{id}` | Update category name | [ASSUMED] |
| `DELETE /incentives/api/v1/benefits/categories/{id}` | Delete category | [ASSUMED] |

> **Note**: The `incentives` endpoint base path is assumed based on the PRD's Benefits module context. If the backend provides a dedicated `benefits` microservice under a different path, update `endpoints.js` accordingly.

### Third-Party Libraries

No new third-party libraries are required. All dependencies are already present: `immutable`, `reselect`, `redux-saga`, `react-intl`, `styled-components`, `@capillarytech/cap-ui-library`, `@capillarytech/vulcan-react-sdk`.

---

## 11. Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| All 8 API contracts are assumed — no backend spec provided in PRD | High | Backend team must confirm API paths, response shapes, and error codes before LLD begins. Block LLD start on this confirmation. |
| `api.js` is already 705 lines (exceeds 500-line limit with eslint-disable comment) | Medium | The file already has `eslint-disable max-lines`. New methods increase the file further. If file exceeds ~900 lines, split into domain-specific API files (e.g., `benefitsApi.js`) as a follow-up task. |
| Settings sidebar navigation integration risk | Medium | `getSettingsMenuData()` in `Cap/constants.js` must be updated. This function is consumed by Cap saga and multiple unit tests. Risk of navigation test regression. Mitigate by updating all associated tests in `Cap/tests/`. |
| Soft delete implementation must match PRD name-reuse requirement | Medium | If the backend uses hard delete instead of soft delete, the uniqueness constraint behavior changes. Confirm deletion strategy with backend before building. |
| No Figma design for Custom Field create/edit modal | Low | Figma frame 24-2729 only shows the category creation modal. Custom field modal structure (Name + Data type) is spec-derived. If designer provides a separate frame, the CapSelect placement may change. Mark custom field modal as requiring design review before LLD. |
| Row-level action icons (edit/delete) not visible in Figma frame | Low | Table row action icon placement is derived from PRD acceptance criteria AC-7 and AC-8. Mark as [ASSUMED - spec-derived] in LLD. |

### Architectural Deviations

None. This feature follows existing garuda-ui patterns without deviation.

### Known Unknowns

1. Whether the Benefits Settings page requires a feature flag HOC (similar to `isLoyaltyPromotionsV2Enabled`). [OPEN]
2. Whether RBAC/permission checks apply to Benefits Settings CRUD operations and whether `PermissionWrapper` atom needs to wrap CTA buttons. [OPEN]
3. Whether sort is server-side (API refetch with new sort params) or client-side. Architecture assumes server-side. [ASSUMED — confirm]
4. Whether the `/settings/benefits` route inherits the settings secondary top bar from Cap.js `onSettingsPage` logic. [OPEN]
5. Whether the `updatedBy` display name is included in the API response or must be looked up from Cap's `orgUsers` state. [ASSUMED — comes from API response directly]

---

## 12. Non-Functional Requirements

### Performance

- Both section tables are gated on `STATUS === SUCCESS` to prevent rendering before data loads. `CapSpin` is shown during `REQUEST` state.
- The page component is wrapped with `withMemo` HOC (consistent with `PromotionList`) to prevent unnecessary re-renders.
- `makeSelectCustomFields()` and `makeSelectCategories()` use `createSelector` from reselect for memoized derivation. The `.toJS()` conversion happens at the selector boundary, not inside components.
- Both API calls on mount are dispatched simultaneously — neither section waits for the other.
- `useCallback` is applied to all event handlers (modal open/close, save, delete confirm) in the organism components.
- The Data type `CapSelect` in the custom field modal uses a static constants-sourced options list — no additional API call.

### Scalability

- Tables use `pagination={false}` initially (consistent with Figma design) for up to 200 entries per section (PRD Success Criteria SC-6). CapTable's `infiniteScroll` or standard `pagination` props can be activated without Redux state shape changes by adding `totalCount` and `page` fields.
- Multiple programs are handled by including `programId` in all API calls. Program switches (via Cap's org/program switcher) trigger `clearBenefitsSettingsData()` and re-fetch with the new program context.

### Accessibility

- `CapModal` (Ant Design Modal) traps focus within the modal when open and restores focus to the trigger element on close.
- Sort control icons in table headers include `aria-label` props (e.g., `aria-label="Sort by last updated on ascending"`).
- `CapInput` uses the `label` prop to associate form labels with inputs.
- `CapMenu` `selectedKeys` prop ensures the active nav item is identified for non-visual users (not just color-coded).
- `EmptyStateIllustration` includes descriptive text for screen readers.

---

## 13. Testing Strategy Overview

### Key Scenarios

| Scenario | Type | Priority |
|----------|------|----------|
| Page loads and both sections render with data | happy-path | High |
| Create custom field modal opens, fills Name + DataType, saves successfully | happy-path | High |
| Create category modal opens, fills Name, saves successfully | happy-path | High |
| Edit custom field name — name updates in table | happy-path | High |
| Edit category name — name updates in table | happy-path | High |
| Delete custom field with confirmation — item removed from table | happy-path | High |
| Delete category with confirmation — item removed from table | happy-path | High |
| Create custom field with duplicate name — error shown inline | edge-case | High |
| Create category with duplicate name — error shown inline | edge-case | High |
| Create custom field with empty name — validation fires before API call | edge-case | High |
| Data type field is read-only in edit modal | edge-case | High |
| API failure on fetch — error state shown, tables not rendered | error | High |
| API failure on create — error shown in modal, modal stays open | error | High |
| Empty state shown when no custom fields exist | edge-case | Medium |
| Empty state shown when no categories exist | edge-case | Medium |
| Cancel delete confirmation — item remains in table | edge-case | Medium |
| Sort "Last updated on" ascending/descending — table re-fetches | happy-path | Medium |
| Deleted item name can be reused in new creation | edge-case | Medium |

### Unit Test Targets

| Target | Type | What to Test |
|--------|------|-------------|
| `benefitsSettingsReducer` | reducer | All action types produce correct state transitions; `fromJS` initial state is correct |
| `getCustomFieldsSaga` | saga | Success path: calls API, dispatches success; Failure: catches error, dispatches failure |
| `createCustomFieldSaga` | saga | Success: calls API, dispatches success + re-fetch; Duplicate name: dispatches failure |
| `deleteCustomFieldSaga` | saga | Success: dispatches success + re-fetch; 404: dispatches failure |
| `getCategoriesSaga` | saga | Success path with correct sort params passed to API |
| `makeSelectCustomFields()` | selector | Returns correct array from ImmutableJS state; returns empty array when state empty |
| `makeSelectCategoriesStatus()` | selector | Returns correct status string |
| `BenefitsSettingsModal` | component | Renders Name input; renders DataType select when modalType=CUSTOM_FIELD; hides DataType when modalType=CATEGORY; shows errorMessage when passed |
| `CustomFieldsSection` | component | Renders CapTable with correct columns; opens modal on CTA click; calls onSave with correct payload |
| `CategoriesSection` | component | Renders CapTable with correct columns; opens modal on CTA click |
| `BenefitsSettings` (page) | component | Dispatches GET_CUSTOM_FIELDS_REQUEST + GET_CATEGORIES_REQUEST on mount; passes programId from Cap state |

### Integration Test Considerations

- Mount `BenefitsSettings` page with mocked Redux store and mocked API responses; verify both sections render on successful API responses.
- Test modal form dispatches correct action type on submit.
- Test the delete confirmation flow end-to-end: click delete -> confirm modal appears -> confirm -> API call dispatched.

---

## 14. Architecture Alignment Notes

### Alignment with architecture.md

| Convention | Status | Notes |
|-----------|--------|-------|
| Atomic Design hierarchy | aligned | Page (BenefitsSettings) -> organisms (CustomFieldsSection, CategoriesSection) -> molecules (BenefitsSettingsModal, DeleteConfirmModal) -> atoms (all Cap* components). No organism owns its own Redux slice, consistent with simpler listing-page pattern (cf. PromotionList). |
| Cap-* component mandate | aligned | All UI elements use Cap* components: CapTable, CapButton, CapModal, CapInput, CapSelect, CapLabel, CapRow, CapColumn, CapSpin, CapIcon, CapSideBar, CapNotification. No raw HTML form elements or custom non-Cap UI. |
| CapRow/CapColumn layout convention | aligned | Section header rows use CapRow (HORIZONTAL layout); section containers use CapColumn (VERTICAL layout). All layout via CapRow/CapColumn per convention. |
| Redux file co-location | aligned | BenefitsSettings/ folder contains constants.js, actions.js, reducer.js, selectors.js, saga.js, messages.js, styles.js — exact mirror of PromotionList file layout. |
| Dynamic reducer/saga injection | aligned | BenefitsSettings/Loadable.js composes injectReducer and injectSaga HOCs via compose(). Sagas run in DAEMON mode. |
| Immutable.js state conventions | aligned | initialState = fromJS({}) in reducer. Selectors use .get(), .getIn(), .toJS() at the boundary. fromJS() wraps all API response data before storage. |
| styled-components styling | aligned | All custom styles in styles.js using styled-components. withStyles HOC from Vulcan SDK used to inject className. |
| ESLint 500-line limit | aligned | BenefitsSettings.js page component estimated at ~200 lines. Organisms ~150 lines each. Molecules ~100 lines. No file expected to exceed 500 lines. |
| Saga concurrency model | aligned | All 8 sagas use takeLatest — appropriate as each action type has a single meaningful latest intent. No parallel execution case requires takeEvery. |
| Redux inject key pattern | aligned | ${CURRENT_APP_NAME}-benefits-settings follows the ${CURRENT_APP_NAME}-<slice-name> naming pattern. |
| Compose pattern | aligned | compose(injectReducer(...), injectSaga(...), connect(mapStateToProps, mapDispatchToProps))(BenefitsSettings) at bottom of BenefitsSettings.js. withCustomAuthAndTranslations and optional feature flag HOC in Loadable.js. |

### Alignment with System Map Patterns

**Saga flow** matches the PromotionList model documented in the system-map:
```
GET_CUSTOM_FIELDS_REQUEST (page mount)
  -> takeLatest -> getCustomFieldsSaga
  -> yield call(getBenefitsCustomFields, programId, sortBy, sortOrder)
  -> success: yield put(getCustomFieldsSuccess(res.data))
  -> failure: yield put(getCustomFieldsFailure(error))
  -> reducer: state.set('customFields', fromJS(data)).set('customFieldsStatus', SUCCESS)
  -> selector: makeSelectCustomFields() -> substate.get('customFields').toJS()
  -> component re-renders with new data
```

This mirrors the watchForGetPromotionsListSaga -> getPromotionsListSaga chain from the system-map exactly.

**Mutation saga pattern**: After successful create/update/delete, re-dispatch the GET request to refresh the list. This is consistent with the promotion save flow that re-fetches after save. Optimistic UI updates are not used, keeping consistency with existing patterns.

**Selector key pattern**: `selectBenefitsSettingsDomain = (state = fromJS({})) => state.get(\`${CURRENT_APP_NAME}-benefits-settings\`)` — identical structure to `selectPromotionListDomain`.

**Action naming**: All action types follow the `GET_X_REQUEST/SUCCESS/FAILURE` triplet convention from architecture.md.

### Deviations and Justifications

**Multi-entity Redux slice** (new_pattern, Low risk): The `benefits-settings` slice manages two independent entity types (custom fields and categories) within one Redux slice using separate status field prefixes. Existing slices manage a single entity type. This is deliberate to avoid two separate Redux slices for a single settings page that loads both sections simultaneously. The pattern reduces boilerplate and co-locates related settings state. Risk is low because the two entities have clearly separate field name prefixes and no cross-entity state dependency.

---

## 15. Open Questions and Decisions Needed

| # | Question | Impact | Owner | Status | Comment |
|---|----------|--------|-------|--------|---------|
| 1 | What are the actual API endpoints for custom fields and categories CRUD? Are they under /incentives/api/v1/benefits/... or a different service? | High — blocks all API contract finalization | Backend team | open | All 8 API contracts are assumed. PRD states "Benefits Settings API endpoints for CRUD operations on categories and custom fields (to be defined or confirmed)." |
| 2 | Does the Benefits Settings page require a feature flag similar to isLoyaltyPromotionsV2Enabled? | Medium — affects Loadable.js HOC composition and page visibility | Product + Backend | open | If yes, a new flag key must be added to Cap state and a new HOC created. |
| 3 | Does the page inherit the Settings secondary top bar from the onSettingsPage logic in Cap.js? | Medium — affects PageTemplate usage and top-level layout | UX + Frontend | open | Affects whether a shared SettingsPageTemplate is needed. |
| 4 | Are RBAC/permission checks required for Benefits Settings CRUD operations? | Medium — affects PermissionWrapper usage and permissions constants | Product + Backend | open | PromotionList uses PROMOTION_PERMISSIONS constants. Benefits Settings may need BENEFITS_SETTINGS_PERMISSIONS. |
| 5 | Is sort for "Last updated on" server-side (API refetch) or client-side (sort the loaded array)? | Low — affects SET_*_SORT action handling | Frontend | open | Architecture assumes server-side sort. Confirm before LLD. |
| 6 | What is the Figma frame for the Custom Field create/edit modal (Name + DataType)? | Low — affects exact modal layout and Data type selector positioning | Design | open | Only the category creation modal is visible in Figma node 24-2729. Custom field modal is spec-derived. |
| 7 | Does the API response include the updatedBy display name directly, or must it be looked up from orgUsers in Cap state? | Low — affects whether an additional users lookup is needed | Backend | open | Architecture assumes display name is in the API response. |
| 8 | Is there a maximum number of custom fields or categories allowed per program? | Low — affects whether the New CTA should be disabled at a limit | Backend | open | No limit mentioned in PRD; assumed unlimited. |

---

## Metadata

- **Feature**: Benefits Settings
- **PRD Source**: `claudeOutput/filteredPrd/benefits-settings-spec.md`
- **Generated by**: hld-generator agent
- **Timestamp**: 2026-04-13
- **Architecture Reference**: `.claude/output/architecture.md`
- **System Map Reference**: `.claude/output/loyalty-promotions-system-map.md`
- **Figma Recipes**:
  - `claudeOutput/figma-capui-mapping/24-2729.recipe.json` (Benefits Settings page — reusable by hld-lld-to-ui)
- **Prop-Spec Notes**:
  - `claudeOutput/figma-capui-mapping/24-2729/prop-spec-notes.json` (component prop specs for Benefits Settings)
