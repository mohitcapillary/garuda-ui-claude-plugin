# System Mapping: Loyalty Promotions

---

## 1. System Overview

- **Purpose:** Loyalty Promotions is a feature enabling brands to configure time-bound promotional campaigns (summer sales, festival promotions, etc.) that layer enhanced incentives atop the regular loyalty program. Supports two types: Activity-Based (GENERIC) and Broadcast promotions.

- **Core Flow Summary (UI → Redux → Saga → API → State → UI):**
  1. User navigates to `/promotions/list` → dispatches `GET_PROMOTIONS_LIST_REQUEST`
  2. Saga calls `GET /intouch-api/v3/promotions` → response stored in `promotions-list` slice
  3. User clicks "Create Promotion" → navigates to `/promotions/create` (PromotionConfig page)
  4. User fills multi-step form (Metadata → Customer Enrolment → Activities → Cappings → Advanced Settings)
  5. User clicks "Save & Exit" → dispatches `SAVE_PROMOTION_DATA` → saga calls `POST /intouch-api/v3/promotions`
  6. On success → redirect to `/promotions/list`

- **Key Business Entities:**
  - Promotion (metadata, activities, cappings, enrolment, advanced settings)
  - Activity (single, milestone, streak, group)
  - Brand Actions (earn points, issue coupon, issue badge, send communication)
  - Customer Enrolment (all members, loyal members, non-loyal members, specific members)
  - Capping Limits (per event, per customer, per promotion)
  - Broadcast Schedule (timing, frequency, audience mapping)

- **State Management Strategy:**
  - Global (Redux): 8 injected slices — `promotions-list`, `promotion-config`, `promotion-activities`, `promotion-cappings`, `promotion-advanced-settings`, `promotion-metadata`, `enrolment-config`, `issue-promotion-workflow-action`
  - Local (Component State): PromotionConfig holds ~30+ `useState` hooks for form data (metadata, customerEnrolment, activities, cappingLimits, advancedSettingsFormData, etc.)

- **Side Effect Handling:** Redux Saga (takeLatest for all async operations)

- **External Dependencies:**
  - `@capillarytech/vulcan-react-sdk` (injectReducer, injectSaga, clearDataOnUnmount, withStyles, apiCaller)
  - `@capillarytech/cap-ui-library` (CapRow, CapColumn, CapButton, CapStepsAccordian, CapNotification, etc.)
  - `@capillarytech/blaze-ui` (CapUnifiedSelect)
  - `immutable` (fromJS, Immutable state)
  - `reselect` (memoized selectors)
  - `immer` (produce for metadata updates)
  - `moment-timezone` (date handling)
  - `connected-react-router` / `react-router-dom` v5

- **Assumptions:** N/A

---

## 2. Page-Level Mapping

### Page: PromotionList

- **Route Path:** `/promotions/list` (also `/` default route)
- **Description:** Displays a paginated, searchable, filterable list of all promotions. Supports both revamped (new) and legacy (old) table views.
- **User Actions:**
  - Load page → Dispatch `GET_PROMOTIONS_LIST_REQUEST` + `CHECK_LEGACY_PROMOTIONS_REQUEST`
  - Search → Debounced dispatch `GET_PROMOTIONS_LIST_REQUEST` with searchTerm
  - Filter (status, programId, duration, lastUpdated, updatedBy, promotionType) → Dispatch `GET_PROMOTIONS_LIST_REQUEST` with activeFilters
  - Sort → Dispatch `GET_PROMOTIONS_LIST_REQUEST` with sortBy/sortOrder
  - Infinite scroll → Dispatch `GET_PROMOTIONS_LIST_REQUEST` with incremented page
  - Click "Create Promotion" → Navigate to `/promotions/create`
  - Click promotion row → Navigate to `/promotions/view/:id/:status`
  - Switch view (revamped/legacy) → Toggle `selectedView` local state
- **Main Components:**
  - `PromotionsSearchInput` (molecule)
  - `FilterPanel` (molecule)
  - `FiltersApplied` (molecule)
  - `PromotionsListingTable` (molecule)
  - `PromotionsListSearchRow` (molecule)
  - `OldPromotionsTable` (legacy view)
  - `EmptyStateIllustration` (molecule)
  - `RBACEmptyState` (molecule)
  - `RedirectionToOldUI` (atom)
  - `PermissionWrapper` (atom)
  - `PageTemplate` (template)
- **Redux Usage:**
  - State Selected: `promotions`, `promotionsStatus`, `error`, `totalPages`, `totalElements`, `hasLegacyPromotions` (from `promotions-list` slice), `programs` (from `cap` slice)
  - Actions Dispatched: `getPromotionsList`, `setPromotionsStatus`, `checkLegacyPromotions`, `clearData`
- **Sagas Triggered:** `getPromotionsListSaga`, `checkLegacyPromotionsSaga`
- **APIs Called:** `getPromotions`, `getPromotionsOld`
- **Data Lifecycle:**
  - Input: search term, filters, pagination, sort
  - Process: API call with query params → parse response
  - Output: Paginated list of promotions rendered in table

### Page: PromotionConfig (Create / Edit / View / Duplicate)

- **Route Paths:**
  - `/promotions/create`
  - `/promotions/edit/:promotionId/:promotionStatus`
  - `/promotions/view/:promotionId/:promotionStatus`
  - `/promotions/duplicate/:promotionId/:promotionStatus`
- **Description:** Multi-step accordion form for creating, editing, viewing, and duplicating promotions. Contains 5–6 steps depending on promotion type (Generic vs Broadcast).
- **User Actions:**
  - Load (edit/view/duplicate) → Dispatch `GET_PROMOTION_DATA`, `GET_LEADERBOARD_CONFIG`, `GET_ALL_TILL_CODES`
  - Select program → Dispatch `GET_EVENT_TYPES`
  - Save & Exit / Publish → Dispatch `SAVE_PROMOTION_DATA` (calls createPromotion or updatePromotion)
  - Send for Approval → Dispatch `SAVE_PROMOTION_DATA` then `updatePromotionStatus` (via Cap actions)
  - Approve / Reject → Dispatch `REVIEW_PROMOTION`
  - Pause / Resume / Stop → Show `PromotionStatusChangeModal` → `updatePromotionStatus` (via Cap actions)
  - Edit (from view) → Show confirmation modal → Navigate to edit URL
  - Duplicate → Same flow as create with pre-filled data (IDs stripped)
- **Main Components:**
  - `PromotionMetadata` (organism) — Step 1: name, description, program, dates, type
  - `PromotionCustomerEnrolment` (organism) — Step 2: enrolment type, audience, optin
  - `PromotionActivities` (organism) — Step 3: activity configuration (single/milestone/streak/group)
  - `PromotionCappings` (organism) — Step 4: capping limits
  - `PromotionAdvancedSettings` (organism) — Step 5: points allocation, liability, till config, metadata
  - `BroadcastSchedule` (organism) — Step 3b (broadcast only): timing, frequency
  - `PromotionHeader` (molecule) — Title, status, action buttons
  - `PromotionWorkflowButtons` (molecule) — Save, Publish, Send for Approval buttons
  - `PromotionBanners` (molecule) — Contextual banners
  - `PromotionModal` (molecule) — Generic modal
  - `PromotionStatusChangeModal` (molecule) — Pause/Resume/Stop/Revoke/Edit confirmation
  - `PromotionStepsAccordianHeader` (molecule) — Step headers
- **Redux Usage:**
  - State Selected: `promotionSelector` (promotion, promotionStatus, savePromotionStatus, reviewPromotionStatus, etc.), `showPromotionModal`, `promotionModalData`, `leaderboardConfigStatus`, `firstTillId`, `programs`, `userData`, `orgUsers`, `capPromotionStatusSelector`
  - Actions Dispatched: `getPromotionData`, `savePromotionData`, `getEventTypes`, `getAllTillCodes`, `getLeaderboardConfig`, `reviewPromotion`, `showPromotionModal`, `setPromotionModalData`, `clearData`, `capActions.updatePromotionStatus`, `capActions.getTier`, `capActions.getProgramById`, `capActions.getStrategyData`
- **Sagas Triggered:** `getPromotionDataSaga`, `savePromotionDataSaga`, `getEventTypesSaga`, `getAllTillCodesSaga`, `getLeaderboardConfigSaga`, `reviewPromotionSaga`
- **APIs Called:** `getPromotionById`, `createPromotion`, `updatePromotion`, `getEventTypes`, `getAllTillCodes`, `getLeaderboardSettings`, `reviewPromotion`
- **Data Lifecycle:**
  - Input: Form data from 5 steps (metadata, enrolment, activities, cappings, advanced settings)
  - Process: `preparePromotionDataForSaving()` + `createWorkflowMetadata()` assembles payload → API call
  - Output: Promotion created/updated → redirect to list

---

## 3. Component Mapping (React)

### Component: PromotionList

- **Type:** Page (Container)
- **Description:** Main listing page for promotions with search, filter, sort, and infinite scroll
- **Used In:** App routes (default `/` and `/promotions/list`)
- **Props:** className, history, promotions, promotionsStatus, actions, programs, totalPages, totalElements, hasLegacyPromotions, intl
- **Local State:** searchTerm, isFilterPanelOpen, isFilterApplied, activeFilters, pagination, hasReachedEnd, sortBy, sortOrder, selectedView
- **Redux Integration:**
  - mapStateToProps: promotions, promotionsStatus, error, programs, totalPages, totalElements, hasLegacyPromotions
  - mapDispatchToProps: all actions bound via `bindActionCreators`
- **Actions Triggered:** getPromotionsList, setPromotionsStatus, checkLegacyPromotions
- **Side Effects:** Initial data fetch, debounced search, filter-change fetch, pagination fetch, legacy check
- **Child Components:** PromotionsSearchInput, FilterPanel, FiltersApplied, PromotionsListingTable, PromotionsListSearchRow, OldPromotionsTable, EmptyStateIllustration, RBACEmptyState, RedirectionToOldUI, PermissionWrapper, PageTemplate
- **Re-render Triggers:** promotionsStatus, searchTerm, activeFilters, pagination, totalPages, hasReachedEnd
- **Performance Notes:** Uses `withMemo` HOC, `useMemo` for isLoading/showEmptyState, `useCallback` for handlers, debounced search

### Component: PromotionConfig

- **Type:** Page (Container)
- **Description:** Multi-step promotion configuration form (create/edit/view/duplicate)
- **Used In:** App routes (`/promotions/create`, `/promotions/edit/:id/:status`, `/promotions/view/:id/:status`, `/promotions/duplicate/:id/:status`)
- **Props:** className, intl, history, actions, match, promotionSelector, capActions, promotionActivitiesActions, userData, showPromotionModal, promotionModalData, leaderboardConfigStatus, firstTillId, programs, orgUsers, capPromotionStatusSelector
- **Local State (30+ hooks):** showMetadataContent, currentStep, promotionStatusState, metadata, customerEnrolment, isOptinEnabled, optinDetails, enrolmentDetails, activities, cappingLimits, advancedSettingsFormData, pointsAllocationLimitData, isPointsAllocationEnabled, liabilitySettings, stackingData, tillId, tillConfigData, tillSelectionType, broadcastScheduleData, broadcastScheduleSummary, savedActivities, metadataChangesPending, showSendForApprovalModal, approvalComment, isSpecialCaseEdit, isPendingApprovalRevokeConfirmed, isSpecialCaseEditConfirmed, metadataStepDisabled, customerEnrolmentStepDisabled, activityStepDisabled, cappingStepDisabled, invalidCyclesInfo, invalidEnrolmentInfo, invalidCappingCyclesInfo, isEditPromotionLoading, isDraftViewLoading, pendingViewNavigation, metadataFormData
- **Redux Integration:**
  - mapStateToProps: promotionSelector (makeSelectPromotionData), showPromotionModal, promotionModalData, leaderboardConfigStatus, firstTillId, programs, userData, orgUsers, capPromotionStatusSelector
  - mapDispatchToProps: actions, capActions, promotionActivitiesActions bound via `bindActionCreators`
- **Actions Triggered:** getPromotionData, savePromotionData, getEventTypes, getAllTillCodes, getLeaderboardConfig, reviewPromotion, capActions.updatePromotionStatus, capActions.getTier, capActions.getProgramById, capActions.getStrategyData
- **Side Effects:** Promotion fetch on mount (edit/view/duplicate), event types fetch on program change, populate form data on promotion load, invalid cycles detection, enrolment/optin dates update, GTM tracking
- **Child Components:** PromotionMetadata, PromotionCustomerEnrolment, PromotionActivities, PromotionCappings, PromotionAdvancedSettings, BroadcastSchedule, PromotionHeader, PromotionWorkflowButtons, PromotionBanners, PromotionModal, PromotionStatusChangeModal, PromotionStepsAccordianHeader, NoteText, RBACEmptyState
- **Re-render Triggers:** promotionStatus, savePromotionStatus, reviewPromotionStatus, metadata changes, activities changes, currentStep
- **Performance Notes:** Uses `withMemo` HOC, extensive `useMemo`/`useCallback`, `PromotionConfigProvider` context

### Component: PromotionsListingTable

- **Type:** Presentational (molecule)
- **Description:** Table displaying promotions with status tags, sorting, infinite scroll, and row actions (edit/view/duplicate)
- **Used In:** PromotionList
- **Props:** promotions, pagination, onPaginationChange, hasReachedEnd, showLoader, searchTerm, totalSearchResults, onSort, sortBy, sortOrder, hasFiltersApplied, activeFilters, permissions, promotionsStatus, getPromotionsList
- **Local State:** N/A (stateless)
- **Child Components:** PromotionStatusTag (atom), MenuItems

### Component: PromotionMetadata (organism)

- **Type:** Container (organism with own Redux slice)
- **Description:** First step of promotion config — name, description, program, timezone, start/end dates, promotion type, external identifier
- **Used In:** PromotionConfig
- **Redux Integration:** Own slice `promotion-metadata` with: allowMlp flag, ext ID validation
- **Sagas:** getAllowMlpSaga (feature flag check), validatePromotionExtIdSaga (duplicate ext ID check)

### Component: PromotionActivities (organism)

- **Type:** Container (organism with own Redux slice)
- **Description:** Third step — activity configuration supporting Single, Milestone, Streak, and Group activity types with conditions and brand actions
- **Used In:** PromotionConfig
- **Redux Integration:** Own slice `promotion-activities` with: grammar, dependent enums (paginated), dynamic options, extended fields, event attributes, alternate currencies, milestone name validation
- **Child Components:** SingleActivity, GroupActivity, EmbeddedActivity, ActivityCondition, ActivityHeader, ActivityConfiguration, SubActivity, ActivityRadioSwitch, ActivityCardAction

### Component: PromotionCappings (organism)

- **Type:** Container (organism with own Redux slice)
- **Description:** Fourth step — capping/limit configuration (per event, per customer, per promotion)
- **Used In:** PromotionConfig
- **Redux Integration:** Own slice `promotion-cappings` with: badges data
- **Child Components:** CappingLimitRenderer, CappingLimitBuilder

### Component: PromotionAdvancedSettings (organism)

- **Type:** Container (organism with own Redux slice)
- **Description:** Fifth step — points allocation, liability settings, metadata keys, till code config, stacking
- **Used In:** PromotionConfig
- **Redux Integration:** Own slice `promotion-advanced-settings` with: metadata keys
- **Child Components:** PromotionSettings, TillCodeConfig, LiabilityOwnerSplitInfo

### Component: PromotionCustomerEnrolment (organism)

- **Type:** Presentational (organism without own Redux slice)
- **Description:** Second step — customer eligibility type selection (All Members, Loyal, Non-Loyal, Specific Members), enrolment configuration, optin configuration
- **Used In:** PromotionConfig
- **Child Components:** EnrolmentConfig, EnrolmentRestrictions, OptinRestrictions, EnrolmentTrackingWrapper

### Component: FilterPanel (molecule)

- **Type:** Presentational
- **Description:** Slide-out panel with filters for status, program, promotion type, duration, last updated, updated by
- **Used In:** PromotionList
- **Props:** activeFilters, programs, onClose, onApply, visible

---

## 4. Redux Store Mapping

### Slice: `${CURRENT_APP_NAME}-promotions-list`

- **Purpose:** Stores promotions listing data, pagination, and legacy check status
- **Initial State:**
  ```js
  {
    promotions: [],
    promotionsStatus: 'INITIAL',
    error: null,
    totalPages: 0,
    totalElements: 0,
    hasLegacyPromotions: null
  }
  ```
- **State Fields:**
  - `promotions`: Array of promotion objects for the listing table
  - `promotionsStatus`: INITIAL | REQUEST | SUCCESS | FAILURE
  - `error`: Error object from failed API calls
  - `totalPages`: Total pages for pagination
  - `totalElements`: Total count of promotions matching filters
  - `hasLegacyPromotions`: Boolean indicating if org has legacy (old EMF) promotions
- **Reducers:**
  - `GET_PROMOTIONS_LIST_REQUEST`: Sets status to REQUEST, clears error
  - `GET_PROMOTIONS_LIST_SUCCESS`: Appends (page > 0) or replaces (page 0) promotions, sets totals
  - `GET_PROMOTIONS_LIST_FAILURE`: Sets status to FAILURE, stores error
  - `SET_PROMOTIONS_STATUS`: Directly sets promotionsStatus
  - `CHECK_LEGACY_PROMOTIONS_SUCCESS`: Sets hasLegacyPromotions
  - `CHECK_LEGACY_PROMOTIONS_FAILURE`: Sets hasLegacyPromotions to false
  - `CLEAR_DATA`: Resets to initialState
- **Selectors:**
  - `makeSelectPromotions()` → promotions array (toJS)
  - `makeSelectPromotionsStatus()` → status string
  - `makeSelectPromotionsError()` → error object
  - `makeSelectTotalPages()` → total pages number
  - `makeSelectTotalElements()` → total elements number
  - `makeSelectHasLegacyPromotions()` → boolean or null
- **Used In Components:** PromotionList

### Slice: `${CURRENT_APP_NAME}-promotion-config`

- **Purpose:** Stores promotion detail data, save/review status, event types, till codes, leaderboard config, and modal state
- **Initial State:**
  ```js
  {
    eventTypes: [],
    eventTypesStatus: '',
    eventTypesError: null,
    tillCodes: [],
    tillCodesStatus: '',
    tillCodesError: null,
    promotion: null,
    promotionStatus: '',
    promotionError: null,
    savePromotionStatus: '',
    savePromotionError: null,
    reviewPromotionStatus: '',
    reviewPromotionError: null,
    isEditMode: false,
    showPromotionModal: false,
    promotionModalData: {},
    leaderboardConfig: null,
    leaderboardConfigStatus: '',
    leaderboardConfigError: null
  }
  ```
- **State Fields:**
  - `eventTypes`: Array of event type objects for activity configuration
  - `tillCodes`: Array of till code objects for till config
  - `promotion`: Full promotion object from API (used for edit/view/duplicate)
  - `promotionStatus`/`savePromotionStatus`/`reviewPromotionStatus`: REQUEST | SUCCESS | FAILURE
  - `leaderboardConfig`: Org-level leaderboard feature flag string
  - `showPromotionModal`/`promotionModalData`: Modal visibility and data
- **Reducers:**
  - `GET_EVENT_TYPES` / `_SUCCESS` / `_ERROR`: Event types lifecycle
  - `GET_ALL_TILL_CODES` / `_SUCCESS` / `_ERROR`: Till codes lifecycle
  - `GET_PROMOTION_DATA` / `_SUCCESS` / `_ERROR`: Promotion fetch lifecycle (also sets isEditMode=true)
  - `SAVE_PROMOTION_DATA` / `_SUCCESS` / `_ERROR`: Save lifecycle
  - `REVIEW_PROMOTION` / `_SUCCESS` / `_ERROR`: Approve/reject lifecycle
  - `SHOW_PROMOTION_MODAL`: Toggle modal visibility
  - `SET_PROMOTION_MODAL_DATA`: Set modal data
  - `GET_LEADERBOARD_CONFIG` / `_SUCCESS` / `_ERROR`: Leaderboard config lifecycle
  - `CLEAR_DATA`: Reset to initialState
- **Selectors:**
  - `makeSelectPromotionData()` → `{promotion, promotionStatus, promotionError, savePromotionStatus, savePromotionError, reviewPromotionStatus, reviewPromotionError, isEditMode}`
  - `makeSelectEventTypes()` → event types array
  - `makeSelectBehaviouralEvents()` → filtered behavioral events
  - `makeSelectSimplifiedEventTypes()` → simplified event types for select dropdown
  - `makeSelectTillCodes()` → `{tillCodesList, getTillCodesStatus}`
  - `makeSelectFirstTillId()` → first till ID number
  - `makeSelectShowModal()` / `makeSelectPromotionModalData()` → modal state
  - `makeSelectLeaderboardFeatureEnabled()` / `makeSelectLeaderboardConfigStatus()` → leaderboard config
- **Used In Components:** PromotionConfig

### Slice: `${CURRENT_APP_NAME}-promotion-activities`

- **Purpose:** Stores grammar rules, dependent enums (paginated), dynamic options, extended fields, event attributes, alternate currencies, milestone name validation — all needed for activity condition configuration
- **Initial State:**
  ```js
  {
    grammar: {},
    grammarStatus: {},
    grammarError: {},
    dependentEnumsStatus: {},
    dependentEnumsError: {},
    depEnumData: {},  // Nested: { eventType: { activityId: { conditionId: { enumType: { data, status, error, hasMore, offset } } } } }
    dynamicOptionsData: {},  // Nested: { eventType: { activityId: { conditionId: { dynamicType: { data, status, error, hasMore, offset } } } } }
    lineitemExtendedFields: [],
    transactionExtendedFields: [],
    eventAttributes: {},
    alternateCurrencyData: [],
    alternateCurrencyStatus: '',
    validateNameStatus: '',
    validateNameData: '',
    validateNameError: ''
  }
  ```
- **Selectors:**
  - `makeSelectGrammar()` → grammar by eventType
  - `makeSelectDepEnumData()` → paginated enum data (deeply nested)
  - `makeSelectDynamicOptionsData()` → dynamic options data (deeply nested)
  - `makeSelectExtendedFields()` → combined lineitem & transaction extended fields
  - `makeSelectEventAttributes()` → event attribute map
  - `makeSelectAlternateCurrencyData()` → alternate currency list
  - `makeSelectValidateMilestoneNameData()` → name validation result
- **Used In Components:** PromotionActivities, SingleActivity, ActivityCondition

### Slice: `${CURRENT_APP_NAME}-promotion-cappings`

- **Purpose:** Stores badges data for capping configuration
- **Initial State:**
  ```js
  {
    getBadgesStatus: '',
    badges: [],
    getBadgesError: null
  }
  ```
- **Used In Components:** PromotionCappings

### Slice: `${CURRENT_APP_NAME}-promotion-advanced-settings`

- **Purpose:** Stores promotion metadata keys for advanced settings
- **Initial State:**
  ```js
  {
    getMetaDataKeysStatus: '',
    metaDataKeys: [],
    metaDataKeysError: null
  }
  ```
- **Used In Components:** PromotionAdvancedSettings

### Slice: `${CURRENT_APP_NAME}-promotion-metadata`

- **Purpose:** Stores MLP (multi-loyalty-program) feature flag and external ID uniqueness validation
- **Initial State:**
  ```js
  {
    allowMlp: false,
    allowMlpStatus: 'INITIAL',
    allowMlpError: null,
    promotionExtIdValidationStatus: 'INITIAL',
    promotionExtIdValidationData: null,
    promotionExtIdValidationError: null
  }
  ```
- **Used In Components:** PromotionMetadata

### Slice: `${CURRENT_APP_NAME}-enrolment-config`

- **Purpose:** Stores enrolment configuration data (creative templates)
- **Initial State:**
  ```js
  {
    enrolmentConfigData: [],
    enrolmentConfigDataStatus: '',
    enrolmentConfigDataError: null
  }
  ```
- **Used In Components:** EnrolmentConfig

---

## 5. Redux Saga Mapping

### Saga: getPromotionsListSaga

- **Triggered By:** `GET_PROMOTIONS_LIST_REQUEST`
- **Purpose:** Fetches paginated list of promotions with search/filter/sort
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getPromotions(searchTerm, activeFilters, pagination, sortBy, sortOrder)`
  3. Handle Response: `put(getPromotionsListSuccess(res.data, pagination))` or `put(getPromotionsListFailure(res.errors))`
  4. GTM tracking for filtered events
- **API Calls:** `getPromotions`
- **Error Handling:** try/catch → dispatches failure action
- **Connected Reducers:** `promotions-list`
- **Concurrency Model:** takeLatest

### Saga: checkLegacyPromotionsSaga

- **Triggered By:** `CHECK_LEGACY_PROMOTIONS_REQUEST`
- **Purpose:** Checks if org has legacy (old EMF) promotions to show view toggle
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getPromotionsOld({ queryParams: 'limit=1&offset=0' })`
  3. Handle Response: `put(checkLegacyPromotionsSuccess(hasLegacy))`
- **API Calls:** `getPromotionsOld`
- **Error Handling:** try/catch → dispatches failure (sets hasLegacy=false)
- **Connected Reducers:** `promotions-list`
- **Concurrency Model:** takeLatest

### Saga: getPromotionDataSaga

- **Triggered By:** `GET_PROMOTION_DATA`
- **Purpose:** Fetches a single promotion by ID for edit/view/duplicate
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getPromotionById(promotionId, promotionStatus)`
  3. Handle Response: Apply default restrictions if empty → `put(getPromotionDataSuccess(promotionData))`
  4. GTM tracking for fetch events
- **API Calls:** `getPromotionById`
- **Error Handling:** try/catch → GTM error tracking → dispatches failure
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: savePromotionDataSaga

- **Triggered By:** `SAVE_PROMOTION_DATA`
- **Purpose:** Creates or updates a promotion
- **Flow:**
  1. Listen: `takeLatest`
  2. If `isEdit`: Call `updatePromotion(promotionId, promotionData)`, else Call `createPromotion(promotionData)`
  3. Check for errors array in response
  4. Handle Response: `put(savePromotionDataSuccess(response.data))` → call `onSuccess` callback
  5. GTM tracking for save events
- **API Calls:** `createPromotion` or `updatePromotion`
- **Error Handling:** Error message extraction from nested response structures → dispatches failure
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: reviewPromotionSaga

- **Triggered By:** `REVIEW_PROMOTION`
- **Purpose:** Approves or rejects a promotion
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `reviewPromotion(promotionId, payload)`
  3. Handle Response: `put(reviewPromotionSuccess(response.data))` → call `onSuccess` callback
  4. GTM tracking for review events
- **API Calls:** `reviewPromotion`
- **Error Handling:** Error extraction → dispatches failure
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: getEventTypesSaga

- **Triggered By:** `GET_EVENT_TYPES`
- **Purpose:** Fetches available event types for the selected program (filters out SocialConnect and TargetCompleted)
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getEventTypes(programId, SOURCE_PROMOTION)`
  3. Filter response to exclude SocialConnect and TargetCompleted
  4. Handle Response: `put(getEventTypesSuccess(result))`
- **API Calls:** `getEventTypes`
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: getAllTillCodesSaga

- **Triggered By:** `GET_ALL_TILL_CODES`
- **Purpose:** Fetches all till codes for the organization
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getAllTillCodes()`
  3. Extract: `result.response.tills.organization.entities.entity`
  4. Handle Response: `put(getAllTillCodesSuccess(entity))`
- **API Calls:** `getAllTillCodes`
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: getLeaderboardConfigSaga

- **Triggered By:** `GET_LEADERBOARD_CONFIG`
- **Purpose:** Fetches leaderboard feature flag setting
- **Flow:**
  1. Listen: `takeLatest`
  2. Call API: `getLeaderboardSettings()`
  3. Extract: `response.response.offsets.value`
  4. Handle Response: `put(getLeaderboardConfigSuccess(config))`
- **API Calls:** `getLeaderboardSettings`
- **Connected Reducers:** `promotion-config`
- **Concurrency Model:** takeLatest

### Saga: getGrammarSaga (PromotionActivities)

- **Triggered By:** `GET_GRAMMAR_REQUEST`
- **Purpose:** Fetches grammar rules for activity condition building per event type
- **API Calls:** `getGrammar(eventType, programId)`
- **Connected Reducers:** `promotion-activities`
- **Concurrency Model:** takeLatest

### Saga: getDependentEnumsPaginatedSaga (PromotionActivities)

- **Triggered By:** `GET_DEPENDENT_ENUMS_PAGINATED_REQUEST`
- **Purpose:** Fetches paginated dependent enum values for condition dropdowns
- **API Calls:** `getDependentEnumsPaginated({enumType, entityType, offset, limit, searchQuery, codes, attributeCode})`
- **Connected Reducers:** `promotion-activities`
- **Concurrency Model:** takeLatest

---

## 6. API Mapping

### API: getPromotions

- **Endpoint:** `GET /intouch-api/v3/promotions`
- **Method:** GET
- **Called From Saga:** getPromotionsListSaga
- **Purpose:** Fetch paginated list of promotions with filters
- **Request Payload (Query Params):**
  ```
  page, size, includeDraftDetails=true, searchText?, status?, programName?,
  startDate?, endDate?, lastModifiedFrom?, lastModifiedTo?, lastModifiedBy?,
  promotionCategory?, sortBy?, sortOrder?
  ```
- **Response:**
  ```json
  { "data": { "content": [...], "totalPages": N, "totalElements": N } }
  ```
- **Error Cases:** `{ "errors": [...] }`
- **Mapped To Redux State:** `promotions-list.promotions`, `.totalPages`, `.totalElements`
- **Used By Components:** PromotionList

### API: getPromotionById

- **Endpoint:** `GET /intouch-api/v3/promotions/{promotionId}?status={status}`
- **Method:** GET
- **Called From Saga:** getPromotionDataSaga
- **Purpose:** Fetch single promotion details
- **Response:**
  ```json
  { "data": { "unifiedPromotionId": "...", "metadata": {...}, "activities": [...], "promotionRestrictions": {...}, "workflowMetadata": {...}, "broadcastMetadata": {...}, "parentDetails": {...} } }
  ```
- **Mapped To Redux State:** `promotion-config.promotion`
- **Used By Components:** PromotionConfig

### API: createPromotion

- **Endpoint:** `POST /intouch-api/v3/promotions`
- **Method:** POST
- **Called From Saga:** savePromotionDataSaga
- **Purpose:** Create a new promotion
- **Request Payload:** Full promotion object (metadata, activities, customerEnrolment, promotionRestrictions, workflowMetadata, broadcastMetadata, loyaltyConfigMetaData)
- **Response:** `{ "data": { "unifiedPromotionId": "...", "metadata": {...} } }`
- **Error Cases:** `{ "errors": [{ "message": "..." }] }` (hideError: true — no generic notification)
- **Mapped To Redux State:** `promotion-config.savePromotionStatus`
- **Used By Components:** PromotionConfig

### API: updatePromotion

- **Endpoint:** `PUT /intouch-api/v3/promotions/{promotionId}`
- **Method:** PUT
- **Called From Saga:** savePromotionDataSaga
- **Purpose:** Update an existing promotion
- **Request Payload:** Same as createPromotion
- **Response:** Same as createPromotion
- **Error Cases:** Same as createPromotion (hideError: true)
- **Mapped To Redux State:** `promotion-config.savePromotionStatus`
- **Used By Components:** PromotionConfig

### API: reviewPromotion

- **Endpoint:** `POST /intouch-api/v3/promotions/{promotionId}/review`
- **Method:** POST
- **Called From Saga:** reviewPromotionSaga
- **Purpose:** Approve or reject a promotion
- **Request Payload:**
  ```json
  { "approvalStatus": "APPROVE" | "REJECT", "comment": "..." }
  ```
- **Response:** `{ "data": {...} }`
- **Error Cases:** `{ "errors": [{ "message": "..." }] }` (hideError: true)
- **Mapped To Redux State:** `promotion-config.reviewPromotionStatus`
- **Used By Components:** PromotionConfig

### API: getEventTypes

- **Endpoint:** `GET /loyalty/api/v1/workflows/event-types/{programId}?source=PROMOTION&newPromotion=true`
- **Method:** GET
- **Called From Saga:** getEventTypesSaga
- **Purpose:** Fetch available event types for activity configuration
- **Response:** `{ "success": true, "result": [{ "key": "...", "name": "...", "category": "..." }] }`
- **Mapped To Redux State:** `promotion-config.eventTypes`
- **Used By Components:** PromotionConfig, PromotionActivities

### API: getAllTillCodes

- **Endpoint:** `GET /arya/api/v1/org-settings/target-groups/orgtills`
- **Method:** GET
- **Called From Saga:** getAllTillCodesSaga
- **Purpose:** Fetch organization till codes for advanced settings
- **Response:** `{ "response": { "tills": { "organization": { "entities": { "entity": [{ "id": N, "name": "..." }] } } } } }`
- **Mapped To Redux State:** `promotion-config.tillCodes`
- **Used By Components:** PromotionConfig, PromotionAdvancedSettings

### API: getLeaderboardSettings

- **Endpoint:** `GET /arya/api/v1/org-settings/target-groups/settings/ENABLE_LEADERBOARDS_FOR_MILESTONES_AND_STREAKS`
- **Method:** GET
- **Called From Saga:** getLeaderboardConfigSaga
- **Purpose:** Check if leaderboard feature is enabled for the org
- **Response:** `{ "success": true, "response": { "offsets": { "value": "..." } } }`
- **Mapped To Redux State:** `promotion-config.leaderboardConfig`
- **Used By Components:** PromotionConfig

### API: getPromotionsOld

- **Endpoint:** `GET /loyalty/emf/v1/programs/promotions/list?{queryParams}`
- **Method:** GET
- **Called From Saga:** checkLegacyPromotionsSaga
- **Purpose:** Check for legacy EMF promotions (shows view toggle in listing)
- **Mapped To Redux State:** `promotions-list.hasLegacyPromotions`
- **Used By Components:** PromotionList

---

## 7. End-to-End Data Flow (CRITICAL)

### Flow: List Promotions

1. **User Action (UI):** Page loads or user searches/filters
2. **Component Dispatch:** `actions.getPromotionsList(searchTerm, activeFilters, pagination, sortBy, sortOrder)` → `GET_PROMOTIONS_LIST_REQUEST`
3. **Reducer:** Sets `promotionsStatus = REQUEST`, clears error
4. **Saga Triggered:** `getPromotionsListSaga`
5. **API Call:** `GET /intouch-api/v3/promotions?page=0&size=10&includeDraftDetails=true&...`
6. **API Response:** `{ data: { content: [...], totalPages: N, totalElements: N } }`
7. **Redux State Update:** `GET_PROMOTIONS_LIST_SUCCESS` → sets `promotions`, `totalPages`, `totalElements`, `promotionsStatus = SUCCESS`
8. **Component Re-render:** `makeSelectPromotions()` returns updated array → `PromotionsListingTable` re-renders with new data
9. **Final UI State:** Table shows promotions with status tags, sort indicators, and pagination

### Flow: Create New Promotion

1. **User Action (UI):** Clicks "Create Promotion" on list page
2. **Component Dispatch:** `history.push('/promotions/create')` → PromotionConfig mounts
3. **Reducer:** N/A (local state initialization)
4. **Saga Triggered:** `getLeaderboardConfigSaga`, `getAllTillCodesSaga` (on mount)
5. **User fills form:** Steps through Metadata → Customer Enrolment → Activities → Cappings → Advanced Settings
6. **User Action (UI):** Clicks "Save & Exit" button
7. **Component Dispatch:** `preparePromotionDataForSaving()` assembles payload → `actions.savePromotionData(promotionData, false, onSuccess, true)` → `SAVE_PROMOTION_DATA`
8. **Reducer:** Sets `savePromotionStatus = REQUEST`
9. **Saga Triggered:** `savePromotionDataSaga` → detects `isEdit = false`
10. **API Call:** `POST /intouch-api/v3/promotions` with full promotion payload
11. **API Response:** `{ data: { unifiedPromotionId: "...", metadata: { status: "DRAFT" } } }`
12. **Redux State Update:** `SAVE_PROMOTION_DATA_SUCCESS` → sets `savePromotionStatus = SUCCESS`
13. **Component Re-render:** `onSuccess` callback fires → notification + `history.push('/promotions/list')`
14. **Final UI State:** User is back on promotions list with success notification

### Flow: Edit Existing Promotion

1. **User Action (UI):** Clicks edit action on a promotion row
2. **Component Dispatch:** `history.push('/promotions/edit/{id}/{status}')` → PromotionConfig mounts
3. **Saga Triggered:** `getPromotionDataSaga`, `getLeaderboardConfigSaga`, `getAllTillCodesSaga`
4. **API Call:** `GET /intouch-api/v3/promotions/{id}?status={status}`
5. **API Response:** Full promotion object
6. **Redux State Update:** `GET_PROMOTION_DATA_SUCCESS` → stores promotion in state
7. **Component Re-render:** `useEffect` detects `promotionStatus === SUCCESS` → maps API data to local state via `mapMetadataFromPromotion`, `mapActivitiesFromPromotion`, `mapCustomerEnrolmentFromPromotion`, etc.
8. **User modifies form** → local state updates
9. **User clicks "Save & Exit"** → `SAVE_PROMOTION_DATA` → `updatePromotion(id, data)` (PUT)
10. **Final UI State:** Success notification + redirect to list

### Flow: Approve/Reject Promotion

1. **User Action (UI):** Clicks "Approve" or "Reject" button on view page
2. **Component Dispatch:** `actions.reviewPromotion(promotionId, { approvalStatus: 'APPROVE'|'REJECT', comment })` → `REVIEW_PROMOTION`
3. **Reducer:** Sets `reviewPromotionStatus = REQUEST`
4. **Saga Triggered:** `reviewPromotionSaga`
5. **API Call:** `POST /intouch-api/v3/promotions/{id}/review`
6. **API Response:** `{ data: {...} }`
7. **Redux State Update:** `REVIEW_PROMOTION_SUCCESS` → sets `reviewPromotionStatus = SUCCESS`
8. **Component Re-render:** `onSuccess` callback → notification + `history.push('/promotions/list')`
9. **Final UI State:** Success notification + redirect to list

### Flow: Pause/Resume/Stop Promotion

1. **User Action (UI):** Clicks Pause/Resume/Stop in PromotionHeader dropdown
2. **Component Dispatch:** `statusChangeModal.showPauseModal(name)` → PromotionStatusChangeModal opens
3. **User confirms** → `capActions.updatePromotionStatus(promotionId, status, payload, onSuccess)`
4. **Saga Triggered:** Cap-level saga (outside promotion module)
5. **API Call:** ⚠️ Assumed — `PUT /intouch-api/v3/promotions/{id}` with status change payload
6. **Final UI State:** Success notification + redirect or UI update

### Flow: Send for Approval

1. **User Action (UI):** Clicks "Send for Approval" button
2. **Component Dispatch:** First saves promotion via `SAVE_PROMOTION_DATA`, then on success calls `capActions.updatePromotionStatus(promotionId, status, { promotionStatus: 'PENDING_APPROVAL', reason })`
3. **Final UI State:** Success notification + redirect to list

---

## 8. Data Model / Entities

### Entity: Promotion

```json
{
  "unifiedPromotionId": "string",
  "metadata": {
    "name": "string",
    "description": "string",
    "programId": "number",
    "startDate": "ISO date string",
    "endDate": "ISO date string",
    "status": "DRAFT|PENDING_APPROVAL|REJECTED|UPCOMING|LIVE|PAUSED|STOPPED|COMPLETED",
    "promotionType": "LOYALTY|LOYALTY_EARNING",
    "promotionCategory": "GENERIC|BROADCAST",
    "loyaltyEarningType": "ISSUE_AND_EARN|DIRECT_EARN|IMPORT",
    "timezoneName": "string",
    "promotionIdentifier": "string",
    "customerEligibilityType": "ALL|LOYAL|NON_LOYAL",
    "draftDetails": { "id": "string", "status": "string" },
    "promotionId": "number"
  },
  "activities": [
    {
      "activityId": "string (UUID)",
      "activityType": "SINGLE|MILESTONE|STREAK|GROUP",
      "eventType": "string",
      "name": "string",
      "conditions": [...],
      "actions": [...],
      "milestones": [...],
      "combinationType": "string"
    }
  ],
  "promotionRestrictions": {
    "issualLimit": {...},
    "enrolmentLimit": {...},
    "redemptionLimit": {...}
  },
  "customerEnrolment": {
    "enrolmentMethod": "string",
    "type": "string"
  },
  "workflowMetadata": {
    "enrolment": { "type": "string", "basedOn": "string", "audienceMapping": [...] },
    "optin": { "type": "string", "audienceMapping": [...] }
  },
  "broadcastMetadata": {
    "tillId": "number",
    "schedule": { "issueTiming": "string", "frequency": "string" },
    "audienceMapping": [...]
  },
  "loyaltyConfigMetaData": {
    "isStackable": "boolean",
    "isExclusive": "boolean",
    "isAlwaysApply": "boolean",
    "isConsideredForRanking": "boolean"
  },
  "parentDetails": { "status": "string" }
}
```
- **Field Descriptions:** See above inline
- **Source:** API (`GET /intouch-api/v3/promotions/{id}`)
- **Stored In Redux?:** Yes, in `promotion-config.promotion`
- **Used In Components:** PromotionConfig, PromotionMetadata, PromotionActivities, PromotionCappings, PromotionAdvancedSettings

### Entity: Activity

```json
{
  "activityId": "string (UUID)",
  "activityType": "SINGLE|MILESTONE|STREAK|GROUP",
  "eventType": "TransactionAdd|BulkEMFEvent|...",
  "name": "string",
  "conditions": [{ "lhs": "...", "operator": "...", "rhs": "...", "expJSON": "..." }],
  "actions": [{ "type": "EARN_POINTS|ISSUE_COUPON|ISSUE_BADGE|SEND_COMMUNICATION", ... }],
  "milestones": [{ "targetName": "...", "targetGroupId": "..." }],
  "cycles": { "duration": "...", "evaluationType": "..." },
  "trackingType": "string"
}
```
- **Source:** Part of Promotion API response / User Input
- **Stored In Redux?:** Part of promotion object + local state (`activities` useState)
- **Used In Components:** PromotionActivities, SingleActivity, GroupActivity, ActivityCondition

### Entity: Capping Limit

```json
{
  "type": "MAX_ALLOWED_POINTS_PER_EVENT|MAX_ALLOWED_TIMES_PER_CUSTOMER|MAX_ALLOWED_POINTS_PER_CUSTOMER|MAX_ALLOWED_TIMES_PER_PROMOTION|MAX_ALLOWED_POINTS_PER_PROMOTION|...",
  "value": "number",
  "periodType": "DEFAULT|PERIOD_BASED",
  "periodUnit": "DAILY|WEEKLY|MONTHLY",
  "cycles": {...}
}
```
- **Source:** User Input / API response (promotionRestrictions)
- **Stored In Redux?:** Local state (`cappingLimits` useState)
- **Used In Components:** PromotionCappings, CappingLimitRenderer

### Entity: EventType

```json
{
  "key": "string (e.g., TransactionAdd)",
  "name": "string (display name)",
  "category": "string (e.g., Behavioral)"
}
```
- **Source:** API (`GET /loyalty/api/v1/workflows/event-types/{programId}`)
- **Stored In Redux?:** Yes, in `promotion-config.eventTypes`
- **Used In Components:** PromotionActivities, ActivityCondition

---

## 9. Dependency Mapping

### Page → Components
- `PromotionList` → PromotionsSearchInput, FilterPanel, FiltersApplied, PromotionsListingTable, PromotionsListSearchRow, OldPromotionsTable, EmptyStateIllustration, RBACEmptyState, RedirectionToOldUI, PermissionWrapper, PageTemplate
- `PromotionConfig` → PromotionMetadata, PromotionCustomerEnrolment, PromotionActivities, PromotionCappings, PromotionAdvancedSettings, BroadcastSchedule, PromotionHeader, PromotionWorkflowButtons, PromotionBanners, PromotionModal, PromotionStatusChangeModal

### Component → Redux (Slice + Actions)
- `PromotionList` → `promotions-list` (getPromotionsList, checkLegacyPromotions)
- `PromotionConfig` → `promotion-config` (getPromotionData, savePromotionData, getEventTypes, getAllTillCodes, getLeaderboardConfig, reviewPromotion)
- `PromotionActivities` → `promotion-activities` (getGrammar, getDependentEnums*, getDynamicOptions*, getExtendedFields, getEventAttributes, getAlternateCurrency, validateMilestoneName)
- `PromotionCappings` → `promotion-cappings` (getBadges)
- `PromotionAdvancedSettings` → `promotion-advanced-settings` (getMetaDataKeys)
- `PromotionMetadata` → `promotion-metadata` (getAllowMlp, validatePromotionExtId)
- `EnrolmentConfig` → `enrolment-config` (getEnrolmentConfigData)

### Saga → API
- `getPromotionsListSaga` → `getPromotions` (GET /intouch-api/v3/promotions)
- `checkLegacyPromotionsSaga` → `getPromotionsOld` (GET /loyalty/emf/v1/programs/promotions/list)
- `getPromotionDataSaga` → `getPromotionById` (GET /intouch-api/v3/promotions/{id})
- `savePromotionDataSaga` → `createPromotion` (POST) / `updatePromotion` (PUT)
- `reviewPromotionSaga` → `reviewPromotion` (POST /intouch-api/v3/promotions/{id}/review)
- `getEventTypesSaga` → `getEventTypes` (GET /loyalty/api/v1/workflows/event-types/{programId})
- `getAllTillCodesSaga` → `getAllTillCodes` (GET /arya/api/v1/org-settings/target-groups/orgtills)
- `getLeaderboardConfigSaga` → `getLeaderboardSettings` (GET /arya/api/v1/org-settings/...)

### API → Redux State
- `getPromotions` → `promotions-list.promotions`
- `getPromotionById` → `promotion-config.promotion`
- `createPromotion` / `updatePromotion` → `promotion-config.savePromotionStatus`
- `reviewPromotion` → `promotion-config.reviewPromotionStatus`
- `getEventTypes` → `promotion-config.eventTypes`
- `getAllTillCodes` → `promotion-config.tillCodes`
- `getLeaderboardSettings` → `promotion-config.leaderboardConfig`

### Redux State → Component
- `promotions-list` → PromotionList
- `promotion-config` → PromotionConfig
- `promotion-activities` → PromotionActivities, SingleActivity, ActivityCondition
- `promotion-cappings` → PromotionCappings
- `promotion-advanced-settings` → PromotionAdvancedSettings
- `promotion-metadata` → PromotionMetadata
- `enrolment-config` → EnrolmentConfig

---

## 10. Gaps & Assumptions

- **Missing Documentation:**
  - Documentation URL is a high-level overview; lacks API contract details, payload schemas, and specific field-level requirements
  - No documentation on broadcast promotion scheduling mechanics

- **⚠️ Assumed Flows:**
  - ⚠️ Assumed: `capActions.updatePromotionStatus` (Pause/Resume/Stop) likely calls a PUT endpoint on `/intouch-api/v3/promotions/{id}` — actual implementation lives in Cap-level sagas outside the promotion module
  - ⚠️ Assumed: The full promotion payload structure for create/update is assembled by `preparePromotionDataForSaving()` in `utils.js` — exact field mapping requires deep reading of that 800+ line utility file

- **Unclear Redux Logic:**
  - `promotionActivitiesReducer` has deeply nested state (4+ levels) for `depEnumData` and `dynamicOptionsData` — complex merge logic
  - Stacking functionality is commented out (`TODO: REVERT WHEN NEEDED`)

- **Unclear Saga Behavior:**
  - `savePromotionDataSaga` has a dual-path flow (create vs update) with callback-based success handling that chains into `updatePromotionStatus` for approval flow

- **Required Clarifications:**
  - Is `CURRENT_APP_NAME` always `'garuda'`? It's used as prefix for all Redux inject keys
  - What triggers the `ReduxDependencies` reducer/saga injected by PromotionConfig?
  - How does `capActions.getStrategyData` relate to promotion configuration?

---

## 11. PRD Impact Mapping Guide

### Impact Detection Steps

1. **UI Changes:** Multi-step accordion form (CapStepsAccordian), promotion types (Generic vs Broadcast), status-based UI restrictions
2. **State Changes:** 8 Redux slices, 30+ local state hooks in PromotionConfig
3. **Action Changes:** 50+ action types across all slices
4. **Saga Changes:** 15+ saga watchers across all slices
5. **API Changes:** 9 API endpoints (primary: `/intouch-api/v3/promotions/*`)
6. **Data Flow Changes:** Complex form assembly in `preparePromotionDataForSaving()` and `createWorkflowMetadata()`

### Output Format for PRD Impact

- **Impacted Pages:** PromotionList (`/promotions/list`), PromotionConfig (`/promotions/create|edit|view|duplicate`)
- **Impacted Components (33 total):**
  - Organisms: PromotionMetadata, PromotionCustomerEnrolment, PromotionActivities, PromotionCappings, PromotionAdvancedSettings, SingleActivity, GroupActivity, EmbeddedActivity, ActivityCondition, EnrolmentConfig, EnrolmentRestrictions, IssuePromotionWorkflowAction, PromotionSettings, BroadcastSchedule
  - Molecules: PromotionsListingTable, FilterPanel, FiltersApplied, PromotionsSearchInput, PromotionsListSearchRow, PromotionHeader, PromotionWorkflowButtons, PromotionBanners, PromotionModal, PromotionStatusChangeModal, PromotionStepsAccordianHeader, ActivityHeader, ActivityConfiguration, SubActivity, CappingLimitRenderer, EnrolmentTrackingWrapper, ActivityRadioSwitch
  - Atoms: PromotionStatusTag, ActivityCardAction
- **Impacted Redux Slices:** `promotions-list`, `promotion-config`, `promotion-activities`, `promotion-cappings`, `promotion-advanced-settings`, `promotion-metadata`, `enrolment-config`
- **Impacted Sagas:** All 15+ saga watchers across 7 saga files
- **Impacted APIs:** 9 endpoints across 3 base URLs (intouch-api/v3, loyalty/api/v1, arya/api/v1)
- **Data Model Changes:** Promotion entity with nested metadata, activities, restrictions, workflowMetadata, broadcastMetadata, loyaltyConfigMetaData
- **Data Flow Changes:** `preparePromotionDataForSaving()` is the critical data transformation point — any payload structure change must be reflected here
- **Risk Areas:**
  - `PromotionConfig.js` is 2100+ lines with 30+ useState hooks — high complexity, any state-related bug is hard to trace
  - `ActivityCondition/expGenerate.js` (103KB) generates MVEL expressions — changes here affect condition evaluation logic
  - Broadcast vs Generic promotion type branching throughout the codebase — changes must be tested for both paths
  - Draft/edit lifecycle for LIVE/PAUSED/UPCOMING promotions has complex redirect logic with multiple confirmation modals
  - Permission system (7 permission constants) gates all CRUD operations — changes to permissions require RBAC testing

---

## Output Rules Compliance

1. Structure followed exactly per spec.md ✅
2. No sections skipped ✅
3. Assumptions marked with ⚠️ ✅
4. Full traceability maintained: Component → Action → Saga → API → State → Component ✅
5. Consistent naming from codebase ✅
6. Bullet points preferred ✅
7. Concise and actionable ✅
8. No hallucination — all data sourced from codebase reads ✅
