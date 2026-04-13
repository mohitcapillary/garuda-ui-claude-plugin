# Garuda UI — Architecture Overview

> **Generated**: 2026-04-06
> **Scanned from**: /Users/mohitgupta/Documents/capillary/revert/garuda-ui

---

## Executive Summary

Garuda UI is a React 18 + Redux-Saga loyalty promotions management platform built on Capillary's internal Vulcan SDK. It provides the UI for creating, configuring, and managing loyalty promotions — including earn rules, workflows, milestones, enrolment restrictions, and communication actions — within Capillary's Intouch platform.

The application is deployed under the path prefix `/loyalty/ui/v3` and can run in two modes: embedded within the Capillary platform (`native` appType) or as a standalone app (`external`). Authentication, Redux store initialization, and routing history are all bootstrapped through `@capillarytech/vulcan-react-sdk`.

Three architectural decisions define the codebase:

1. **Atomic Design hierarchy**: All UI is built from atoms (34) → molecules (77) → organisms (58) → pages, with mandatory use of `Cap-*` components from `@capillarytech/cap-ui-library`.
2. **Dynamic reducer/saga injection**: Feature pages and complex organisms register their own Redux slices at mount time via `injectReducer`/`injectSaga` HOCs wrapping the Vulcan SDK utilities. Sagas run in DAEMON mode so they persist even if their mounting page unmounts.
3. **Immutable Redux state**: All state is managed as ImmutableJS records. Selectors use `reselect` for memoization and always convert to plain JS at the selector boundary.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────┐   ┌──────────────────────────────────────┐   │
│  │  app/    │   │  Redux Store (Vulcan SDK bootstrap)  │   │
│  │  index.js│   │  - ImmutableJS state tree            │   │
│  └────┬─────┘   │  - Dynamic reducer injection         │   │
│       │         └──────────────┬───────────────────────┘   │
│       ▼                        │                            │
│  ┌──────────────────────────┐  │  ┌──────────────────────┐ │
│  │  App (Root Router)       │  │  │  Redux-Saga Middleware│ │
│  │  ConnectedRouter (RRv5)  │◄─┘  │  DAEMON-mode sagas   │ │
│  └──────┬───────────────────┘     └──────────┬───────────┘ │
│         │                                    │             │
│    ┌────▼────────────────┐         ┌─────────▼──────────┐  │
│    │  Cap (Shell/Context)│         │  services/api.js   │  │
│    │  - Org/Program data │         │  apiCaller(Vulcan) │  │
│    │  - NavigationBar    │         │  requestConstructor│  │
│    │  - Translations     │         └─────────┬──────────┘  │
│    └────┬────────────────┘                   │             │
│         │                         ┌──────────▼──────────┐  │
│    ┌────▼──────────┐  ┌─────────┐ │  Backend APIs       │  │
│    │ PromotionList │  │Promotion│ │  arya/vulcan/emf    │  │
│    │ (list page)   │  │Config   │ │  loyalty/iris/bi    │  │
│    └───────────────┘  │(editor) │ │  promotion-mgmt     │  │
│                        └─────────┘ └─────────────────────┘  │
│                                                             │
│  Atoms ◄── Molecules ◄── Organisms ◄── Pages               │
│  (34)        (77)          (58)         (8)                 │
└─────────────────────────────────────────────────────────────┘
```

**Bootstrap sequence**: `app/index.js` → Vulcan SDK initializes Redux store with `redux-immutable` root reducer → `App` component mounts `ConnectedRouter` → Login or `Cap` shell renders depending on auth state → feature pages dynamically inject their own reducers/sagas on mount.

---

## Feature Modules

### Core Platform

| Module | Path | Purpose | Redux Artifacts |
|--------|------|---------|-----------------|
| App | `pages/App` | Root router; injects login sagas as DAEMON; wraps `Cap` with `userIsAuthenticated` HOC | No reducer — only routing constants |
| Cap | `pages/Cap` | Application shell: loads org/program data, navigation bar, org-switch, translation setup, feature flags | reducer key: `{appName}-cap`; saga fetches org details, programs, users, feature flags; selectors expose org, program, sidebar menus |

### Authentication

| Module | Path | Purpose | Redux Artifacts |
|--------|------|---------|-----------------|
| Login | `pages/Login` | Credential form + JWT exchange | reducer + saga for login/logout flow |
| RedirectToLoginPage | `pages/RedirectToLoginPage` | Failure component for `userIsAuthenticated` HOC; redirects unauthenticated users | Static — no Redux |

### Loyalty Promotions (Primary Domain)

| Module | Path | Purpose | Redux Artifacts |
|--------|------|---------|-----------------|
| PromotionList | `pages/PromotionList` | Searchable, filterable, sortable promotions listing with infinite scroll pagination | reducer key: `{appName}-promotions-list`; saga: `watchForGetPromotionsListSaga` + `checkLegacyPromotionsSaga`; state: `promotions[]`, `promotionsStatus`, `totalPages`, `hasLegacyPromotions` |
| PromotionConfig | `pages/PromotionConfig` | Multi-step promotion editor (accordion steps) for create/edit/clone; wraps all configuration organisms | Full Redux module — own reducer/saga/selectors + `PromotionConfigContext` for local non-Redux state; uses `immer.produce` for complex state mutations |

Both pages are gated by `isLoyaltyPromotionsV2Enabled` HOC (feature flag from Cap state) and wrapped by `withCustomAuthAndTranslations` from Vulcan SDK before export via `Loadable.js`.

### Promotion Configuration Organisms (Sub-modules with embedded Redux)

These organisms have their own `reducer.js` + `saga.js` and are dynamically injected when PromotionConfig mounts:

| Organism | Domain Responsibility |
|----------|-----------------------|
| PromotionActivities | Earn trigger/condition configuration |
| PromotionAdvancedSettings | Advanced settings (alternate currency, etc.) |
| PromotionCappings | Benefit limits and capping rules |
| PromotionMetadata | Promotion metadata fields |
| EnrolmentConfig | Customer enrolment configuration |
| OptinConfig | Opt-in configuration |
| AddEarnCondition | Dynamic earn condition builder |
| SingleActivity / ActionDependencies | Workflow action dependency tracking |
| IndividualMilestone | Milestone target configuration |
| IssueCoupons/IssueRewards/IssueBadge/IssuePromotion | Workflow action organisms for issuing incentives |
| LiabilitySettings | Points liability settings |
| AudienceList | Audience segment selection (uses cap-audience-manager) |
| Creatives | Communication creative selection (uses creatives-library) |
| AnalyticsDrawer | Promotion analytics slide drawer |
| SendCommunicationActions | Communication channel configuration |
| ExpiryConditions | Points expiry configuration |
| IncentiveCountSelection | Incentive count selection |
| CustomerStatusLabelWorkflowActions | Customer label/status workflow actions |
| TargetPointAllocationWorkflowAction | Target-based point allocation |

**ReduxDependencies** (`organisms/ReduxDependencies`) is a registry organism that aggregates reducer/saga registrations for: `ConfigureWorkflows`, `PartnerProgram`, `StrategyDashboard`, `PromotionActivities`, and `AudienceManager` — allowing PromotionConfig to inject them in one compose call.

### Error / Utility Pages

| Module | Purpose |
|--------|---------|
| NotFoundPage | Provided by Vulcan SDK; shown for unmatched routes |
| NotEnabled | Shown when the loyalty promotions V2 feature flag is disabled |

---

## Data Flow: Redux + Redux-Saga

### Standard Cycle

```
User Event (click/submit/mount)
        │
        ▼
Component dispatches action creator
  e.g., getPromotionsList(searchTerm, filters, pagination)
        │
        ▼
Saga watcher intercepts (takeLatest)
  watchForGetPromotionsListSaga → getPromotionsListSaga
        │
        ▼
Worker saga calls API function
  yield call(getPromotions, ...) → services/api.js → httpRequest(url, requestObj)
        │
        ▼
requestConstructor builds fetch Request
  getAryaAPICallObject sets headers: Authorization, X-CAP-API-AUTH-ORG-ID,
  X-CAP-REMOTE-USER from localStorage via authWrapper.getAuthenticationDetails()
        │
        ▼
Response handled in saga
  success → yield put(getPromotionsListSuccess(res.data, pagination))
  failure → yield put(getPromotionsListFailure(error))
  GTM event pushed after success if filters were applied
        │
        ▼
Reducer updates ImmutableJS state
  promotionListReducer: state.set('promotions', fromJS(content))
                                .set('promotionsStatus', SUCCESS)
        │
        ▼
Reselect selectors recompute
  makeSelectPromotions() → substate.get('promotions').toJS()
  Selectors key into store using CURRENT_APP_NAME-scoped keys
        │
        ▼
Connected component re-renders
  react-redux connect() / useSelector
```

### Dynamic Injection Pattern

Feature pages use `injectReducer` and `injectSaga` HOCs (thin wrappers re-exporting Vulcan SDK utilities) composed with `compose()` at export time:

```js
// Loadable.js
withCustomAuthAndTranslations(isLoyaltyPromotionsV2Enabled(PromotionListLoadable))

// PromotionList.js (internal)
compose(
  injectReducer({ key: `${CURRENT_APP_NAME}-promotions-list`, reducer }),
  injectSaga({ key: `...`, saga })
)(PromotionList)
```

Sagas run in **DAEMON mode** — they remain active after the page unmounts, preventing saga re-registration issues on navigation.

### Cap Shell State

The `Cap` module provides global state consumed by all features via selectors:
- `makeSelectOrg()` — current org ID and fetch status
- `makeSelectActionDependencies()` — org-level action dependency config
- Feature flag selectors (e.g., `makeSelectAlternateCurrencyFlagStatus()`)
- Program/user data selectors

---

## Shared Technical Layers

### Services (`app/services/`)

| File | Purpose |
|------|---------|
| `api.js` | ~705-line centralized API client. All API functions exported from here. Uses `apiCaller` from Vulcan SDK initialized once with a `redirectIfUnauthenticated` callback. |
| `requestConstructor.js` | Builds fetch Request objects for each backend type: `getAryaAPICallObject`, `getVulcanAPICallObject`, `getEMFAPICallObject`, `getIRISAPICallObject`, `getBiAPICallObject`. Injects auth headers from localStorage. |
| `localStorageApi.js` | Thin wrapper for localStorage access (token, orgID, user). |

### Config (`app/config/`)

| File | Purpose |
|------|---------|
| `endpoints.js` | Single source of all API base URLs, keyed by backend system. Supports `absoluteUrls` (non-prod/dev) and `partialUrls` (prod/embedded). Uses `endpointUtil` from Vulcan SDK. |
| `path.js` | Derives `publicPath`, `prefixPath`, and `loginPageUrl()` from `app-config.js`. |
| `constants.js` | App-level constants including `IS_PROD`, `LOGIN_URL`, `NOT_ENABLED_URL`. |

### Utilities (`app/utils/`)

| Utility | Type | Purpose |
|---------|------|---------|
| `authWrapper.js` | HOC + helpers | `userIsAuthenticated` (route guard), `setAuthenticationDetails`, `getAuthenticationDetails`, `removeAuthenticationDetais`. Uses `redux-auth-wrapper/connectedRouterRedirect`. |
| `injectReducer.js` | HOC | Re-exports `injectReducer` from Vulcan SDK. |
| `injectSaga.js` | HOC | Re-exports `injectSaga` from Vulcan SDK with DAEMON mode forced. |
| `hooks/` | React hooks | `useRetryAction`, `useDebouncedCallback`, `useOutsideClick`, `useStableValue`, `EnrolOptinTracking/` |
| `GTM/` | Analytics utilities | `initializeGTM`, `pushToGTM`, `promotionUtils` (data transformation for GTM events), constants. |
| `commonUtils.js` | Domain helpers | Shared utility functions across features. |
| `workflow.js` | Domain helpers | Workflow action configuration helpers. |
| `tiers.js` | Domain helpers | Tier management utilities. |
| `validationHelper.js` | Validation | Shared form/data validation. |
| `withErrorBoundary.js` | HOC | Wraps components with `react-error-boundary`. |
| `bugsnag.js` | Monitoring | `notifyHandledException` for Bugsnag error reporting. |

### i18n

Translation strings are pulled from **Locize** at runtime via `getLocizeMessage()` in `api.js`. The `Cap` saga fetches supported locales on mount. App names sourced from `app-config.js` (`i18n.appNames`): `loyalty_plus`, `coupons_v2`, `garuda_ui`, `creatives_v2`, `audience_manager`, `campaign_filter`. Only `app/translations/en.json` is committed as a fallback. `react-intl` via `injectIntl` HOC provides `intl` to components.

### Monitoring & Analytics

- **New Relic**: `@newrelic/browser-agent` configured per-environment (nightly through eu) in `app-config.js`.
- **Google Tag Manager**: `GTM-KKL2JNNB` initialized via `initializeGTM` utility. GTM events are pushed at key user interactions (promotion saved, filtered, step changed).
- **Bugsnag**: `useBugsnag: true` in `app-config.js`; `notifyHandledException` used in sagas for caught errors.

---

## Integration Points

### Backend API Domains

All calls go through `services/api.js` to endpoints defined in `config/endpoints.js`:

| API Domain | Base Path | Used For |
|------------|-----------|----------|
| `arya` | `/arya/api/v1` | Auth, org settings, translations, creatives, insights |
| `vulcan` | `/vulcan/api/v1` | Authentication, Intouch API proxy, Shield, Neo |
| `loyalty` | `/loyalty/api/v1` | Loyalty program and promotion data |
| `emf` | `/loyalty/emf/v1` | Legacy EMF promotions listing |
| `promotion` | `/v1/promotion-management` | Promotions CRUD (primary) |
| `incentives` | `/incentives/api/v1` | Incentive configuration |
| `rewards` | `/core` (rewards-core) | Catalog rewards |
| `badges` | `/v1/badges` | Badge definitions |
| `gamification` | `/gamification` | Gamification/streaks |
| `iris` | `/iris/v2` | Communication channel data |
| `bi` | `/arya/api/v1/bi` | Analytics/reporting |
| `intouch_v3` | `/intouch-api/v3` | CDP product entities |
| `fileservice` | `/v1/file-service` | File upload |

### Capillary Platform SDK

`@capillarytech/vulcan-react-sdk` provides: Redux store initialization, `injectReducer`/`injectSaga`, `apiCaller`, `localStorageApi`, `getHistoryInstance`, `withReloadAndRedirection`, `withCustomAuthAndTranslations`, `ConnectedRouter` (immutable variant), and `NotFoundPage` component. This SDK is the foundational integration layer; all store bootstrapping and history management flows through it.

### Capillary Component Libraries

| Package | Integration |
|---------|-------------|
| `@capillarytech/cap-ui-library` | Mandated component system — all UI uses `Cap*` prefixed components (CapRow, CapButton, CapSpin, CapStepsAccordian, CapNotification, etc.) |
| `@capillarytech/cap-ui-utils` | Utility functions (`loadable`, `decompressJsonObject`, `Auth`, `multipleOrgSwitch`) |
| `@capillarytech/cap-audience-manager` | Embedded audience segment picker in `organisms/AudienceList` |
| `@capillarytech/cap-coupons` | Coupon series selection used in workflow actions |
| `@capillarytech/creatives-library` | Creative asset selection in `organisms/Creatives` |
| `@capillarytech/blaze-ui` | Additional UI components |

---

## Key Packages & Libraries

| Package | Version | Architectural Role |
|---------|---------|-------------------|
| `react` | ^18.2.0 | UI rendering framework |
| `react-redux` | 5.1.0 | Connects Redux store to React components via `connect()` HOC |
| `redux` | 4.0.1 | Predictable state container; store initialized by Vulcan SDK |
| `redux-saga` | 0.16.2 | Manages all async side effects (API calls) as generator-based middleware |
| `redux-immutable` | ^4.0.0 | Root reducer combiner that maintains ImmutableJS Map as the state root |
| `reselect` | (transitive) | Memoized selector factory; all selectors use `createSelector` |
| `immer` | ^10.1.1 | Used in PromotionConfig for complex local state mutations with structural sharing |
| `connected-react-router` | 4.5.0 | Synchronizes React Router history into Redux store (immutable variant used) |
| `react-router-dom` | 5.0.0 | Client-side routing; Switch/Route/withRouter |
| `redux-auth-wrapper` | ^2.0.3 | HOC-based route protection (`connectedRouterRedirect`) |
| `@capillarytech/vulcan-react-sdk` | ^2.4.1 | Capillary platform SDK: store bootstrap, API caller, history, auth utilities |
| `@capillarytech/cap-ui-library` | 8.12.64 | Mandated Capillary component system for all UI elements |
| `@capillarytech/cap-audience-manager` | 6.0.25 | Embedded audience management widget |
| `@capillarytech/creatives-library` | 8.0.266 | Embedded creative asset management widget |
| `@newrelic/browser-agent` | ^1.292.1 | Real-user monitoring; configured per deployment environment |

---

## Architectural Conventions

### Component Organization
- **Atomic Design** enforced: atoms (primitive display), molecules (atom compositions), organisms (complex feature units, may own Redux state), pages (router-level containers), templates (layout wrappers).
- Before creating any component, check existing 34 atoms / 77 molecules / 58 organisms — prefer composition.

### Cap-* Component Mandate
- All UI elements must use `Cap*` prefixed components from `@capillarytech/cap-ui-library`.
- Layout uses `CapRow` / `CapColumn` exclusively — raw CSS flexbox is not used for layout.
- Styling: styled-components, with `withStyles` from Vulcan SDK for className injection.

### Redux File Co-location
Each feature module contains its Redux artifacts in the same directory:
```
FeatureName/
  index.js          # Public export (points to Loadable or component)
  Loadable.js       # Dynamic import + HOC composition
  FeatureName.js    # Component
  actions.js        # Action creators
  constants.js      # Action type strings (actionTypes.*)
  reducer.js        # Pure state transformation (ImmutableJS)
  saga.js           # Watcher + worker sagas
  selectors.js      # createSelector memoized selectors
  messages.js       # react-intl message descriptors
  styles.js         # styled-components or CSS-in-JS
```

### Action Naming
- Request/success/failure triplets: `GET_X_REQUEST`, `GET_X_SUCCESS`, `GET_X_FAILURE`.
- Status constants from `App/constants`: `REQUEST`, `SUCCESS`, `FAILURE`, `INITIAL`.

### Selector Naming
- Factory functions: `makeSelectX()` returns a `createSelector` instance.
- Domain selector: `selectXDomain` reads the top-level slice from the ImmutableJS root using `CURRENT_APP_NAME`-prefixed keys.

### Dynamic Injection HOC Composition
```js
export default compose(
  injectReducer({ key: `${CURRENT_APP_NAME}-feature`, reducer }),
  injectSaga({ key: `${CURRENT_APP_NAME}-feature-saga`, saga }),
  connect(mapStateToProps, mapDispatchToProps),
)(Component);
```

### Code Quality Rules (ESLint enforced)
- Max 500 lines per file (reducers exempt).
- Max cyclomatic complexity: 10.
- PropTypes required on all components.
- No `var`; camelCase naming; 100-character line width.
- Prettier: single quotes, 2-space indent, trailing commas, LF endings.
- Pre-commit: `lint-staged` runs ESLint and Prettier on staged JS/JSON files.

---

## Assumptions, Constraints & Risks

### Assumptions

- `@capillarytech/vulcan-react-sdk` API remains stable; store initialization, `apiCaller`, `injectReducer`/`injectSaga`, and history management are all delegated to it.
- `@capillarytech/cap-ui-library` component interfaces remain compatible across minor versions; all UI depends on `Cap*` components.
- The `CURRENT_APP_NAME` global constant (injected at build time) is always defined; selectors key into the Redux store using it.
- The platform auth flow (localStorage token, `X-CAP-API-AUTH-ORG-ID` header, 401 redirect) is stable.

### Constraints

- **Node version**: `>=12.0.0 <15.0.0` (significantly outdated; limits tooling upgrades).
- **React Router v5 lock-in**: `connected-react-router` 4.5.0 and `redux-auth-wrapper` depend on Router v5 patterns; upgrade to v6 requires full routing and auth refactor.
- **redux-saga 0.16.2**: Pre-1.0 release (API is stable but lags behind `1.x` effect naming and TypeScript support).
- **react-redux 5.1.0**: Predates hooks API (`useSelector`, `useDispatch`) — components use `connect()` HOC. Upgrading would require component rewrites.
- **Build heap**: Production webpack build requires `--max_old_space_size=20000` (20GB), indicating a large bundle graph.
- **Single translation file**: Only `en.json` is committed; all other locale strings are fetched from Locize at runtime — no offline/CI translation validation.

### Risks & Limitations

- **Organisms with embedded Redux**: 20+ organisms own their own reducer/saga slices. These are injected when PromotionConfig mounts and run as DAEMONs. Cross-organism state coupling is possible and hard to trace statically.
- **Selector key coupling**: Selectors use `CURRENT_APP_NAME`-prefixed store keys set at build time. Any build misconfiguration silently returns empty state.
- **api.js 705-line file**: Exceeds the 500-line ESLint limit (has `eslint-disable max-lines` at line 1). This file is a single point of failure for all API communication.
- **PromotionConfig.js complexity**: The main editor file has `eslint-disable complexity` at line 1, indicating it exceeds the complexity-10 rule. It orchestrates 10+ Redux organisms and manages multi-step accordion state.
- **Legacy promotion data path**: `checkLegacyPromotionsSaga` probes the EMF endpoint to detect legacy promotions. This creates a dependency on the legacy EMF API remaining available.
- **Redux-saga DAEMON mode side effect**: All feature sagas remain active for the app lifetime. Accumulated watcher sagas over long sessions could impact memory, though in practice the count is bounded by the number of feature modules.

---

## Metadata

- **Files scanned**: ~350 (targeted, not exhaustive)
- **Feature modules identified**: 8 pages, 58 organisms (20 with embedded Redux)
- **Components**: 34 atoms, 77 molecules, 58 organisms
- **Redux artifacts**: 34 reducers, 34 sagas, 27 selector files
- **Generated by**: architect-scan agent
- **Timestamp**: 2026-04-06
