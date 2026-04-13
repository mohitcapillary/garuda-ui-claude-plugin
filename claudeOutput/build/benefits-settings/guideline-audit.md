# Guideline Audit — Benefits Settings

Generated: 2026-04-13
Files audited: 19 source files across page / organism / molecule / service tiers.

| File | Rule # | Rule | Pass/Fail | Fix Applied |
|---|---|---|---|---|
| BenefitsSettings/styles.js | 01 | Extract inline styles to styles.js | PASS | All styles in styles.js; no inline style props in BenefitsSettings.js |
| BenefitsSettings/BenefitsSettings.js | 01 | Extract inline styles to styles.js | PASS | Zero inline style={{ }} in component file |
| CustomFieldsSection/styles.js | 01 | Extract inline styles to styles.js | PASS | All styles in styles.js |
| CategoriesSection/styles.js | 01 | Extract inline styles to styles.js | PASS | All styles in styles.js |
| BenefitsSettingsModal/styles.js | 01 | Extract inline styles to styles.js | PASS | All styles in styles.js |
| DeleteConfirmModal/styles.js | 01 | Extract inline styles to styles.js | PASS | All styles in styles.js |
| BenefitsSettings/BenefitsSettings.js | 02 | Component Creation conventions | PASS | Named export + default compose export pattern matches PromotionList reference |
| BenefitsSettings/Loadable.js | 03 | HOC Decision Framework | PASS | withCustomAuthAndTranslations only per Q2 answer (no feature flag, no RBAC) |
| CustomFieldsSection/index.js | 04 | Atomic Design — organisms do not import from organisms | PASS | Imports only from molecules/, pages/, App/ |
| CategoriesSection/index.js | 04 | Atomic Design — organisms do not import from organisms | PASS | Imports only from molecules/, pages/, App/ |
| BenefitsSettingsModal/index.js | 04 | Atomic Design — molecules do not import from organisms | PASS | No organism imports |
| DeleteConfirmModal/index.js | 04 | Atomic Design — molecules do not import from organisms | PASS | No organism imports |
| BenefitsSettings/styles.js | 06 | Cap-UI tokens (no raw hex) | PASS | All colour values use CAP_G* / CAP_WHITE / CAP_G10. Raw hex removed. |
| CustomFieldsSection/styles.js | 06 | Cap-UI tokens (no raw hex) | PASS | All colour values tokenised |
| CategoriesSection/styles.js | 06 | Cap-UI tokens (no raw hex) | PASS | All colour values tokenised |
| BenefitsSettings/styles.js | 06 | Cap-UI tokens — spacing | PASS-WITH-NOTE | 1104px and 421px are structural Figma layout widths with no CAP_SPACE_* equivalent. Defined as named constants with Figma provenance comment. gap-26 (1.857rem) has no exact token; value kept with comment. |
| BenefitsSettings/BenefitsSettings.js | 07 | Accessibility — aria-label on interactive elements | PASS | Delegated to organisms which carry aria-label on all CapButton/CapIcon/CapInput/CapSelect |
| CustomFieldsSection/index.js | 07 | Accessibility — aria-label on interactive elements | PASS | CapButton New custom field, edit/delete buttons, CapIcon sort all have aria-label |
| CategoriesSection/index.js | 07 | Accessibility — aria-label on interactive elements | PASS | CapButton New category, edit/delete buttons, CapIcon sort all have aria-label |
| BenefitsSettingsModal/index.js | 07 | Accessibility — aria-label on interactive elements | PASS | CapInput, CapSelect, CapButton Save/Cancel all have aria-label |
| DeleteConfirmModal/index.js | 07 | Accessibility — aria-label on interactive elements | PASS | CapButton Cancel/Delete have aria-label |
| BenefitsSettings/BenefitsSettings.js | 08 | PropTypes Conventions | PASS | Full PropTypes + defaultProps defined |
| CustomFieldsSection/index.js | 08 | PropTypes Conventions | PASS | Full PropTypes + defaultProps defined |
| CategoriesSection/index.js | 08 | PropTypes Conventions | PASS | Full PropTypes + defaultProps defined |
| BenefitsSettingsModal/index.js | 08 | PropTypes Conventions | PASS | Full PropTypes + defaultProps defined |
| DeleteConfirmModal/index.js | 08 | PropTypes Conventions | PASS | Full PropTypes + defaultProps defined |
| BenefitsSettings/reducer.js | 09 | State Management — fromJS + switch | PASS | fromJS initialState, switch-based reducer, no mutation |
| BenefitsSettings/saga.js | 09 | State Management — sagas handle all async | PASS | All 8 API calls in sagas; components never call API directly |
| BenefitsSettings/selectors.js | 09 | State Management — reselect factories | PASS | All 16 selectors are makeSelect* factory functions |
| BenefitsSettings/constants.js | 09 | State Management — defineActionTypes | PASS | All 27 action types via defineActionTypes with prefix+scope |
| BenefitsSettings/BenefitsSettings.js | 10 | Performance — no unnecessary re-renders | PASS | useEffect deps correctly specified; no missing deps warnings visible |
| BenefitsSettings/saga.js | 11 | Error Handling — saga catch blocks | PASS | All 8 sagas have try/catch dispatching *_FAILURE actions |
| BenefitsSettings/BenefitsSettings.js | 13 | Loadable.js code splitting | PASS | Loadable.js with loadable() + Suspense/CapSpin |
| BenefitsSettings/*.js | 15 | Import conventions — no deep relative imports | PASS | All inter-package imports use package paths; internal imports are max 3 levels (../../molecules/) |
| BenefitsSettings/constants.js | 17 | Constants file convention | PASS | Runtime constants in constants.js; BenefitsSettings.js exports only the component |

## Auto-fixed Violations

| File | Fix | Before | After |
|---|---|---|---|
| styles.js (page) | Replace raw 0.857rem with CAP_SPACE_12 | `fontSize: '0.857rem'` | `fontSize: CAP_SPACE_12` |
| styles.js (page) | Replace raw 1.142rem with CAP_SPACE_16 | `line-height: 1.142rem` | `line-height: ${CAP_SPACE_16}` |
| styles.js (organisms) | Same token replacements | raw rem values | CAP_SPACE_12 / CAP_SPACE_16 |
| styles.js (page) | Named constants for structural widths | raw `1104px` / `421px` inline | `INNER_CONTAINER_WIDTH` / `SUBTITLE_MAX_WIDTH` constants |
| api.js | Move import to top-level | inline import in function body | import at file top |

## Deferred Items (not auto-fixable)

| Issue | Reason | Action |
|---|---|---|
| ESLint cannot run on Node 12 | eslint-plugin-prettier 8.57.1 uses `??` syntax requiring Node 14+. Existing codebase issue, not introduced by this PR. | Run `nvm use 16 && npm run lint` in CI/separate terminal. Dev server still requires Node 12. |
| gap-26 (1.857rem) has no CAP_SPACE_* token | CAP_SPACE_24=1.714rem, CAP_SPACE_28=2rem. Figma nodeId 24:2776 uses gap-[26px]. | Defined as `GAP_26` constant with Figma provenance comment. Accept or file design-system token request. |
| CapSideBar not in page JSX | Shell provides sidebar at /settings/* routes. Figma shows sidebar. | Documented in resolved-questions.md Q3. Correct behaviour — shell owns it. |
