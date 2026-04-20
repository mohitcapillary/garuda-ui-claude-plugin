# Build Report — Benefits Listing

**Feature**: Benefits Listing
**HLD Source**: `/Users/mohitgupta/Documents/capillary/ai/garuda-ui-claude-plugin/claudeOutput/hld/hld-benefits-listing.md`
**Timestamp**: 2026-04-20
**Agent**: hld-to-code (claude-sonnet-4-6)
**garuda-ui path**: `/Users/mohitgupta/Documents/capillary/ai/garuda-ui`

---

## 1. Files Created

**Count: 26 created, 2 modified**

### Pages (10 files)
| File | Role |
|---|---|
| app/components/pages/BenefitsListing/index.js | Loadable re-export |
| app/components/pages/BenefitsListing/Loadable.js | Dynamic import + withCustomAuthAndTranslations |
| app/components/pages/BenefitsListing/BenefitsListing.js | Main page component + Redux compose |
| app/components/pages/BenefitsListing/constants.js | actionTypes + inject key + runtime constants |
| app/components/pages/BenefitsListing/actions.js | 13 action creators |
| app/components/pages/BenefitsListing/reducer.js | Immutable reducer, 9 cases |
| app/components/pages/BenefitsListing/selectors.js | 8 reselect factories |
| app/components/pages/BenefitsListing/saga.js | 3 watchers + 3 workers |
| app/components/pages/BenefitsListing/messages.js | 35 i18n message definitions |
| app/components/pages/BenefitsListing/styles.js | Styled-components CSS template |

### Molecules (12 files)
| File | Role |
|---|---|
| app/components/molecules/BenefitsTable/index.js | Public export |
| app/components/molecules/BenefitsTable/BenefitsTable.js | CapTable wrapper |
| app/components/molecules/BenefitsTable/columnConfig.js | 7-column config with renderers |
| app/components/molecules/BenefitsTable/styles.js | Table styles |
| app/components/molecules/BenefitsFilterDrawer/index.js | Public export |
| app/components/molecules/BenefitsFilterDrawer/BenefitsFilterDrawer.js | CapDrawer + 6 filter fields |
| app/components/molecules/BenefitsFilterDrawer/filterConstants.js | STATUS_OPTIONS_TREE, LAST_UPDATED_PRESETS_TREE |
| app/components/molecules/BenefitsFilterDrawer/styles.js | Drawer styles |
| app/components/molecules/BenefitsSearchInput/index.js | Public export |
| app/components/molecules/BenefitsSearchInput/BenefitsSearchInput.js | Debounced search input |
| app/components/molecules/BenefitsGroupingControl/index.js | Public export |
| app/components/molecules/BenefitsGroupingControl/BenefitsGroupingControl.js | Grouping mode selector |

### Atoms (2 files)
| File | Role |
|---|---|
| app/components/atoms/BenefitStatusTag/index.js | Public export |
| app/components/atoms/BenefitStatusTag/BenefitStatusTag.js | Status → CapStatus colour mapping |

### Services (1 file)
| File | Role |
|---|---|
| app/services/benefits-listing.mock.js | Mock responses for 3 ASSUMED APIs |

### Modified (2 files)
| File | Change |
|---|---|
| app/services/api.js | Appended getBenefits, getBenefitPrograms, getBenefitCategories with USE_MOCK flag |
| app/components/pages/App/routes.js | Added /benefits/listing route |

---

## 2. Components by Tier

| Tier | Count | Names |
|---|---|---|
| Pages | 1 | BenefitsListing |
| Molecules | 4 | BenefitsTable, BenefitsFilterDrawer, BenefitsSearchInput, BenefitsGroupingControl |
| Atoms | 1 | BenefitStatusTag |
| **Total** | **6** | |

---

## 3. Redux Slice

| Domain | Inject Key |
|---|---|
| Benefits Listing | `${CURRENT_APP_NAME}-benefits-listing` |

**Action types (13):**
CLEAR_DATA, GET_BENEFITS_LIST_REQUEST/SUCCESS/FAILURE, SET_ACTIVE_FILTERS, CLEAR_ACTIVE_FILTERS, CLEAR_SEARCH, SET_BENEFITS_STATUS, GET_PROGRAMS_REQUEST/SUCCESS/FAILURE, GET_CATEGORIES_REQUEST/SUCCESS/FAILURE

**Selectors (8):**
makeSelectBenefits, makeSelectBenefitsStatus, makeSelectBenefitsError, makeSelectTotalPages, makeSelectTotalElements, makeSelectActiveFilters, makeSelectPrograms, makeSelectCategories

**Sagas (3 watchers + 3 workers):**
- getBenefitsListSaga — takeLatest GET_BENEFITS_LIST_REQUEST
- getProgramsSaga — takeLatest GET_PROGRAMS_REQUEST
- getCategoriesSaga — takeLatest GET_CATEGORIES_REQUEST

---

## 4. APIs

| API | Status | Mock Flag | Service Function |
|---|---|---|---|
| GET /loyalty/api/v1/benefits | ASSUMED | USE_MOCK_BENEFITS_LISTING | getBenefits |
| GET /loyalty/api/v1/programs | ASSUMED | USE_MOCK_BENEFITS_LISTING | getBenefitPrograms |
| GET /loyalty/api/v1/benefit-categories | ASSUMED | USE_MOCK_BENEFITS_LISTING | getBenefitCategories |

**Mocked: 3 of 3** — flip `USE_MOCK_BENEFITS_LISTING = false` in api.js to go live.

---

## 5. EXACT Recipe Citations

| Section | Figma NodeId | Cap* Component | Code Location |
|---|---|---|---|
| Toolbar Row | 123:5154 | CapRow | BenefitsListing.js — div.benefits-toolbar |
| Create Benefit CTA Button | 123:5176 | CapButton primary | BenefitsListing.js:250 |
| Name Column Header Row | 123:5180 | CapRow | columnConfig.js name column |
| Benefit Name Text | 123:5184 | CapLabel type="label4" | columnConfig.js:34 |
| Benefit ID subtext | 123:5189 | CapLabel type="label1" | columnConfig.js:39 |
| Benefit EXT ID subtext | 123:5191 | CapLabel | columnConfig.js:44 |
| Status Column | 123:5303 | CapColumn | columnConfig.js status column |
| Duration Column | 123:5367 | CapColumn | columnConfig.js duration column |
| Program Name Column | 123:5495 | CapColumn | columnConfig.js programName column |
| Program Name Cell Label | 123:5517 | CapLabel type="label4" | columnConfig.js:96 |
| Category Column | 123:5532 | CapColumn | columnConfig.js category column |
| Category Cell Label | 123:5538 | CapLabel type="label4" | columnConfig.js:107 |
| Updated At Column | 123:5810 | CapColumn | columnConfig.js updatedAt column |
| Dropdown Row Options | 123:5968 | CapRow (CapMenu) | columnConfig.js menu |
| Program name Field Label | 122:4333 | CapLabel | BenefitsFilterDrawer.js:88 |
| Status Field Label | 122:4345 | CapLabel | BenefitsFilterDrawer.js:104 |
| Status Multi-Select | 122:4346 | CapMultiSelect | BenefitsFilterDrawer.js:109 |
| Category Field Label | 122:4350 | CapLabel | BenefitsFilterDrawer.js:123 |
| Category Multi-Select | 122:4351 | CapMultiSelect | BenefitsFilterDrawer.js:129 |
| Duration Field Label | 122:4357 | CapLabel | BenefitsFilterDrawer.js:143 |
| Last updated Field Label | 122:4370 | CapLabel | BenefitsFilterDrawer.js:159 |
| Updated by Field Label | 122:4384 | CapLabel | BenefitsFilterDrawer.js:178 |
| Apply Button | 122:4395 | CapButton primary | BenefitsFilterDrawer.js:200 |
| Clear all filters Button | 122:4396 | CapButton secondary | BenefitsFilterDrawer.js:211 |

---

## 6. Screenshot Audit Outcome

**Tier 1 (Token-level)**: PASS — 0 raw hex values; spacing all token-backed
**Tier 2 (Structural)**: PASS — all 22 non-trivial Figma nodes present in code; all visualProps variants match
**Tier 3 (Visual QA)**: Skipped (--visual-audit not passed)

---

## 7. Guideline Compliance

| Guideline | Result |
|---|---|
| 1. CSS extracted to styles.js | PASS |
| 2. withStyles + className forwarding | PASS |
| 6. Cap-UI tokens (no raw hex) | PASS |
| 7. Accessibility (aria-labels) | PASS — CapInput, CapIcon(filter), CapIcon(close) |
| 8. PropTypes + defaultProps | PASS |
| 9. State management (.toJS() on non-primitives) | PASS |
| 10. Performance (useCallback for handlers) | PASS |
| 11. withErrorBoundary on all components | PASS |
| 11. try/catch in all sagas | PASS |
| 11. response.errors gate in all workers | PASS |
| 15. Import aliases (utils/*) | PASS |
| 17. defineActionTypes | PASS |

**Auto-fixed**: 0 (no violations found during audit)
**User-deferred**: 0

---

## 8. Open Items

| # | Question | Impact | Resolution |
|---|---|---|---|
| 1 | Exact backend API endpoint path | High | ASSUMED — mock behind USE_MOCK_BENEFITS_LISTING flag |
| 2 | Does API support groupBy param? | Medium | Client-side grouping assumed; GroupingControl emits groupBy to payload |
| 3 | CapDateRangePicker availability | Medium | Used from cap-ui-library as specified in Reviewer Override |
| 4 | Updated by filter options source | Low | Empty treeData passed; real data from /arya/api/v1/org-users when BE provides |
| 5 | Row action behaviour | Medium | console.info stub — shows "coming soon" per HLD Q5 resolution |
| 6 | Active filters persistence | Low | CLEAR_DATA on unmount resets all state per clearDataOnUnmount |
| 7 | Last updated preset date range computation | Low | Frontend sends preset key in lastUpdatedPreset field; BE computes range |

---

✅ benefits-listing: 26 files, 6 components (1 page + 4 molecules + 1 atom), 3 APIs (3 mocked), audit: PASS
