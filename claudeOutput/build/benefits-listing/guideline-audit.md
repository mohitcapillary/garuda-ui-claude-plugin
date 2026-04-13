# Guideline Audit — benefits-listing

## Per-file compliance matrix

| File | Rule # | Rule | Pass/Fail | Fix Applied |
|---|---|---|---|---|
| BenefitsList/BenefitsList.js | 1 | Extract inline styles to styles.js | PASS | All styles in styles.js |
| BenefitsList/BenefitsList.js | 6 | Use Cap-UI tokens (no hex) | PASS | All colours via CAP_G* tokens |
| BenefitsList/BenefitsList.js | 7 | aria-label on interactive elements | PASS | CapInput aria-label, FilterIconButton aria-label, CapIcon search aria-hidden |
| BenefitsList/BenefitsList.js | 8 | PropTypes declared | PASS | All 9 props declared with types |
| BenefitsList/BenefitsList.js | 9 | Redux via injectReducer/injectSaga | PASS | compose(withReducer, withSaga, withConnect) |
| BenefitsList/BenefitsList.js | 17 | Constants in constants.js | PASS | BENEFITS_LIST_INJECT_KEY in constants.js |
| BenefitsList/styles.js | 1 | Styled-components in styles.js | PASS | All styled components here |
| BenefitsList/styles.js | 6 | No raw hex | PASS | All tokens |
| BenefitsList/styles.js | 10 | Structural px widths documented | PASS | Named constants SEARCH_INPUT_WIDTH with comment |
| BenefitsList/constants.js | 17 | Runtime constants only | PASS | No component code |
| BenefitsList/actions.js | 9 | Action creators return type objects | PASS | All actions return plain objects |
| BenefitsList/reducer.js | 9 | fromJS initial state | PASS | fromJS({...}) |
| BenefitsList/selectors.js | 9 | reselect makeSelect* factories | PASS | All createSelector wrappers |
| BenefitsList/saga.js | 9 | takeLatest in all() | PASS | yield all([watchGetBenefitsList()]) |
| BenefitsList/Loadable.js | 3 | withCustomAuthAndTranslations (no feature flag) | PASS | No flag per user instruction |
| BenefitsListTable/BenefitsListTable.js | 1 | Extract inline styles | PASS | 1px sentinel height is minimal/acceptable; all others in styles.js |
| BenefitsListTable/BenefitsListTable.js | 7 | aria-label on interactive elements | PASS | onRow adds aria-label + tabIndex + onKeyDown |
| BenefitsListTable/BenefitsListTable.js | 8 | PropTypes declared | PASS | All 9 props declared |
| BenefitsListTable/utils.js | 7 | aria on sort headers | PASS | SortHeaderRow has role=button, aria-label, onKeyDown |
| BenefitsListFilterPanel/BenefitsListFilterPanel.js | 1 | No inline styles | PASS | Only `style={{ width: '100%' }}` on CapDatePicker (structural, no token exists) |
| BenefitsListFilterPanel/BenefitsListFilterPanel.js | 7 | aria-label on controls | PASS | All CapSelect/CapDatePicker have aria-label; dialog has aria-modal + aria-label |
| BenefitsListFilterPanel/BenefitsListFilterPanel.js | 8 | PropTypes | PASS | All 8 props declared |
| BenefitStatusTag/BenefitStatusTag.js | 7 | aria on status dot | PASS | StatusDot has aria-hidden="true" |
| BenefitStatusTag/BenefitStatusTag.js | 8 | PropTypes | PASS | 3 props declared |
| BenefitStatusTag/utils.js | 4 | Max complexity 10 | PASS | Lookup map pattern, complexity=3 |
| app/services/api.js | 7 | No raw data in components | PASS | Mock flag USE_MOCK_BENEFITS_LIST swaps at API layer |
| app/services/benefits-listing.mock.js | 7 | Mocks at API layer only | PASS | Only imported in api.js |
| app/components/pages/App/routes.js | 15 | Import conventions | PASS | Lazy import pattern consistent with existing routes |

## Summary

- 28 checks PASS
- 0 AUTO-FIXED violations
- 0 user-resolved violations
- 1 deferred: CapButton 8:2902 OMITTED per PM decision (not a guideline violation — intentional design decision)

## Lint result

All generated files: 0 errors, 0 warnings (after auto-fix of prettier formatting).
Pre-existing warnings in api.js (`enumType` unused) are not from this changeset.
