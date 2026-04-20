# Resolved Questions — Benefits Listing

## Phase 1 Gate Resolutions

**Q3 — Is CapDateRangePicker available in cap-ui-library 8.12.64?**
- Status: RESOLVED (agent verified)
- Resolution: `CapDateRangePicker` confirmed present at `node_modules/@capillarytech/cap-ui-library/CapDateRangePicker/`. Use it directly.
- Impact: BenefitsFilterDrawer Duration field uses `CapDateRangePicker` from cap-ui-library.

**Q5 — What should happen when a row action is clicked?**
- Status: RESOLVED (assumed per HLD Section 11)
- Resolution: Row action menu items are rendered as clickable items. Clicking them will log a console message ("Feature coming soon: [action name]") as a stub. This is explicitly deferred per PRD — out of scope for this spec. Handlers are stubs.
- Impact: BenefitsTable three-dot menu renders all 4 options; onClick stubs are added.

**Q6 — Should active filters persist across page navigations?**
- Status: RESOLVED (assumed per HLD Section 7 Local vs Redux State table)
- Resolution: `CLEAR_DATA` dispatched on unmount resets everything including active filters. Standard pattern from PromotionList. Filters do NOT persist across navigations.
- Impact: clearDataOnUnmount HOC wraps BenefitsListing with 'clearData' string.

## Deferred (API-dependent, code uses ASSUMED contracts)

**Q1 — Exact backend API endpoint and contract** — Deferred. Using assumed endpoint `GET /loyalty/api/v1/benefits`. Replace `getBenefits()` in api.js when BE confirms.

**Q2 — Does API support groupBy parameter?** — Deferred. Grouping is implemented as pure client-side transform via `groupBenefits()` utility. Server-side groupBy param is not sent (UI-only grouping on current page).

**Q4 — Where do Updated by filter options come from?** — Deferred. Assumed from existing org-users endpoint. No separate saga added for this; options are fetched alongside programs/categories on mount.

**Q7 — Last updated preset date computation** — Deferred. Frontend computes and sends explicit `lastModifiedFrom`/`lastModifiedTo` datetimes based on selected preset. Preset-to-datetime conversion utility added to BenefitsFilterDrawer.
