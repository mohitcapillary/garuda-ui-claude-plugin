---
source: claudeOutput/rawPrd/benefits-listing.md
clarifications: claudeOutput/clarifications/benefits-listing-clarifications.md
generated: 2026-04-19
status: Ready for HLD
---

# Feature Spec: Benefits Listing

---

## Overview

A standalone Benefits Listing page that gives operators a unified, searchable, filterable view of all benefits configured across loyalty programs. The page lives at its own route and has no dependency on the existing LoyaltyProgramTiers page. Users can switch between multiple logical groupings of benefits (flat list, by category, by tier/subscription type, by specific tier or program) purely through filter and grouping states — no separate tabs or sub-routes are required.

---

## Problem Statement

Currently, benefits are only surfaced inside the tier-scoped view (`LoyaltyProgramTiers`), which forces operators to navigate to individual tiers to see which benefits are attached to them. There is no way to get a cross-program, cross-tier snapshot of all benefits at once, filter them by status or category, search by name, or perform bulk row-level actions such as duplicating or exporting. This page closes that visibility gap.

---

## Goals

1. Provide a single-page view of every benefit configured in the system.
2. Allow operators to group, filter, and search benefits without leaving the page.
3. Surface per-row quick actions (Duplicate, Change logs, Export data, Pause) directly from the list.
4. Establish a canonical, Figma-aligned column and status set that downstream pages can rely on.

---

## Out of Scope

- Summary stats counters block (total / live / upcoming / ended) — omitted; Figma does not include this area. [RESOLVED by Designer/PM — Q1]
- Standalone "Tier/Subscription program" column in the table — omitted; Figma uses combined "Updated at" column instead. [RESOLVED by Designer/PM — Q2]
- Separate tabs or routes for the four grouping views — all views are filter/grouping states of a single table. [RESOLVED by PM/Designer — Q3]
- Filter on Tier/Subscription program (specific or whole) — not present in Figma filter drawer, omitted. [RESOLVED by Designer/PM — Q4]
- Filter on tier event type (upgrade / downgrade / renew) — not present in Figma filter drawer, omitted. [RESOLVED by Designer/PM — Q4]
- Permission-gated row actions — all four actions render for every row with no role check. [RESOLVED by PM/BE — Q7]
- Connection to or replacement of the `LoyaltyProgramTiers` page — this is a fully separate page. [RESOLVED by PM/Tech Lead — Q10]

---

## Design Reference

- **Listing page (Figma):** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=123-5146&m=dev (node `123:5146`)
- **Filter drawer (Figma):** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=122-4327&m=dev (node `122:4327`)

---

## User Scenarios & Testing

### Scenario 1 — View the flat list of all benefits [P1]

**Actor:** Logged-in operator

**Flow:**
1. Operator navigates to `/benefits/listing`.
2. Page loads showing a table of all configured benefits.
3. Table displays columns: Name, Status, Duration, Program name, Category, Updated at (date + actor).

**Acceptance criteria:**
- All configured benefits appear in the table on page load.
- Each row shows: Name, Status chip, Duration (start–end datetime), Program name, Category, and "Updated at" (formatted as date/time / actor name, e.g. "08 Dec 2025 3:27 AM AST / Dev Patel").
- Status chip renders one of five canonical values: Awaiting Approval, Draft, Upcoming, Live, Stopped.
- Table is paginated; operators can navigate between pages.

---

### Scenario 2 — Search benefits by name [P1]

**Actor:** Logged-in operator

**Flow:**
1. Operator types a keyword into the search box on the listing page.
2. Table updates to show only benefits whose name matches the query.

**Acceptance criteria:**
- Search is server-side; the query is sent as a parameter to the API.
- Search scope is limited to benefit name only. [RESOLVED by PM/BE — Q9]
- Typing at least one character triggers the search (debounced to avoid excessive calls).
- Clearing the search field restores the full unfiltered list.
- A "no results" empty state is shown when no benefits match.

> Note: The original PRD also specified search by description, ID, and external ID. These are deferred until the API confirms support for those fields. [RESOLVED by default — Q9, DEFERRED for description/ID/external-ID scope]

---

### Scenario 3 — Filter benefits using the filter drawer [P1]

**Actor:** Logged-in operator

**Flow:**
1. Operator clicks the filter icon on the listing page.
2. A filter drawer opens (Figma node `122:4327`).
3. Operator selects one or more values across the available filter fields.
4. Operator applies the filters; the table updates accordingly.

**Acceptance criteria:**
- Filter drawer opens on click of the filter icon.
- Six filter fields are present: Program name, Status, Category, Duration, Last updated (date range preset), Updated by.
- All filter fields support multi-select via `CapMultiSelect`. [RESOLVED by PM — Q5]
- Status field options are: Awaiting Approval, Draft, Upcoming, Live, Stopped. [RESOLVED by PM/BE — Q6]
- Duration filter accepts a start date+time and an end date+time.
- "Last updated" filter offers these preset options: Today, Yesterday, Last 7 days, Last 30 days, Last 90 days.
- Multiple values can be selected across any field simultaneously (e.g. Status = Live AND Upcoming).
- Applying filters narrows the table to matching rows.
- A "clear all" control resets all active filters and restores the full list.

---

### Scenario 4 — Group benefits by category [P2]

**Actor:** Logged-in operator

**Flow:**
1. Operator selects "Group by category" from the grouping control.
2. Table reorganises to show benefits sectioned under their category label (e.g. "Welcome gift", "Birthday Bonus").

**Acceptance criteria:**
- Selecting "Group by category" applies a grouping state to the existing table — no page navigation occurs.
- Each category heading is visible above its group of rows.
- All row columns remain identical to the flat list view.
- If a benefit has no category assigned, it appears under an "Uncategorised" group. [INFERRED FROM PRD]

---

### Scenario 5 — Group benefits by tier or subscription program type [P2]

**Actor:** Logged-in operator

**Flow:**
1. Operator selects "Group by tier / subscription" from the grouping control.
2. Table reorganises to show benefits sectioned under "Tiers" and "Subscription programs".

**Acceptance criteria:**
- Two group headings appear: "Tiers" and "Subscription programs".
- Benefits linked to tier programs appear under "Tiers"; benefits linked to subscription programs appear under "Subscription programs".
- All row columns remain identical to the flat list view.
- Benefits not linked to either group type appear in a separate "Other" section. [INFERRED FROM PRD]

---

### Scenario 6 — View benefits for a specific tier or specific subscription program [P2]

**Actor:** Logged-in operator

**Flow:**
1. Operator selects a specific tier (e.g. "Gold tier") or specific subscription program (e.g. "VIP Subscription program") from the grouping/filter control.
2. Table narrows to only the benefits attached to that tier or program.

**Acceptance criteria:**
- Selecting a specific tier or subscription program applies a filter state — no separate page or route loads.
- The table header or context label reflects the selected scope (e.g. "Benefits for: Gold tier").
- All row columns remain identical to the flat list view.
- Clearing the scope selection returns the operator to the full flat list.

---

### Scenario 7 — Perform a row-level action [P2]

**Actor:** Logged-in operator

**Flow:**
1. Operator clicks the three-dot overflow menu on a benefit row.
2. A menu appears with four options: Duplicate, Change logs, Export data, Pause.
3. Operator selects an action; the system executes it.

**Acceptance criteria:**
- Every row in the table has a three-dot overflow menu.
- The menu always shows all four actions: Duplicate, Change logs, Export data, Pause. [RESOLVED by PM/BE — Q7]
- No role or permission check gates visibility of any action.
- Each action is tappable/clickable with no disabled states. [INFERRED FROM PRD — actions are always available as per resolution]

---

## Functional Requirements

### Table & display

**FR-1** — The benefits listing page must be accessible at the route `/benefits/listing`. [RESOLVED by PM/Tech Lead — Q10]

**FR-2** — The page must have no code or data dependency on the `LoyaltyProgramTiers` component or its data flow. [RESOLVED by PM/Tech Lead — Q10]

**FR-3** — The listing table must display the following columns in order, matching Figma node `123:5146`: Name, Status, Duration, Program name, Category, Updated at. [RESOLVED by Designer/PM — Q2]

**FR-4** — The "Updated at" column must display the modification date/time AND the actor name in a single cell (e.g. "08 Dec 2025 3:27 AM AST / Dev Patel"). A standalone "Last updated by" column must not be rendered. [RESOLVED by Designer/PM — Q2]

**FR-5** — The summary stats block (total / live / upcoming / ended counters) must not be rendered above the table. [RESOLVED by Designer/PM — Q1]

**FR-6** — The canonical set of benefit statuses is: Awaiting Approval, Draft, Upcoming, Live, Stopped. These are the only values that may be rendered as status chips in the table or offered as filter options. [RESOLVED by PM/BE — Q6]

**FR-7** — Each row must include a three-dot overflow menu that renders four actions: Duplicate, Change logs, Export data, Pause. All four actions must be visible and actionable for every row with no permission gating. [RESOLVED by PM/BE — Q7]

### Grouping views

**FR-8** — The page must support four logical grouping/filter states of the same table, all operating without navigation to a new route or tab: [RESOLVED by PM/Designer — Q3]
  - (a) Flat list — all benefits, no grouping.
  - (b) Grouped by category — rows sectioned under category labels (e.g. Welcome gift, Birthday Bonus).
  - (c) Grouped by program type — rows sectioned under "Tiers" and "Subscription programs".
  - (d) Scoped to a specific tier or subscription program — table filtered to one entity (e.g. Gold tier, VIP Subscription program).

**FR-9** — Switching between grouping states must not cause a page reload or route change; it is a client-side view transformation on the already-loaded or re-queried dataset. [DERIVED from Q3 resolution]

### Search

**FR-10** — The listing page must include a search input field.

**FR-11** — Search must be server-side: the entered query must be sent as a parameter to the benefits listing API. [RESOLVED by PM/BE — Q9]

**FR-12** — Search scope is limited to benefit name. Searching by description, ID, or external ID is deferred until API support is confirmed. [RESOLVED by PM/BE — Q9]

**FR-13** — When the search field is cleared, the full unfiltered list must be restored.

**FR-14** — A visible empty state must be shown when a search or filter combination returns zero results.

### Filter drawer

**FR-15** — Clicking the filter icon on the listing page must open the filter drawer matching Figma node `122:4327`.

**FR-16** — The filter drawer must contain exactly the following six filter fields (and no others): [RESOLVED by Designer/PM — Q4]
  - Program name
  - Status
  - Category
  - Duration (start date+time / end date+time)
  - Last updated (preset date-range selector)
  - Updated by

**FR-17** — The "Tier/Subscription program" filter and the "tier event type (upgrade/downgrade/renew)" filter must not be implemented. [RESOLVED by Designer/PM — Q4]

**FR-18** — All six filter fields must use `CapMultiSelect`, enabling operators to select multiple values per field simultaneously. Single-select components (`CapInput`, `CapSelect`) must not be used for these fields. [RESOLVED by PM — Q5]

**FR-19** — The "Last updated" preset options must be: Today, Yesterday, Last 7 days, Last 30 days, Last 90 days.

**FR-20** — Operators must be able to combine multiple values across multiple filter fields (e.g. Status = Live + Upcoming, AND Category = Welcome gift).

**FR-21** — A "clear all" control must reset all active filter selections and restore the unfiltered list.

### API and data

**FR-22** — The page must call a benefits listing API endpoint to fetch paginated benefit records. As of implementation start, the API fields are assumed to match the Figma-visible columns (Name, Status, Duration, Program name, Category, Updated at/actor). This contract must be replaced with the official BE-provided endpoint when confirmed. [RESOLVED by BE — Q8]

**FR-23** — The API call must accept at minimum a search query parameter (for FR-11). Filter parameters must be added once the API contract is finalised. [RESOLVED by BE — Q8, DEFERRED full filter contract]

---

## Key Entities

| Entity | Key Fields (from PRD + Figma) |
|--------|-------------------------------|
| Benefit | name, description, ID, external ID, category, status, tier/subscription program association, duration (start datetime, end datetime), last modified datetime, last updated by (actor name) |
| Category | label (e.g. Welcome gift, Birthday Bonus, Priority support) |
| Program | name, type (tier or subscription) |
| Status | one of: Awaiting Approval, Draft, Upcoming, Live, Stopped |

> Note: The PRD specifies that benefit records carry name, description, ID, and external ID. Description, ID, and external ID are not rendered as visible table columns (per Figma) but are stored on the entity and may be used in future search expansion.

---

## Success Criteria

**SC-1** — A user can navigate to the benefits listing page and see all configured benefits within a reasonable page-load time (standard web app expectation). [DERIVED]

**SC-2** — A user can find a specific benefit by searching its name in under 10 seconds. [DERIVED]

**SC-3** — A user can apply one or more filters and receive a narrowed result set without leaving the page. [DERIVED]

**SC-4** — A user can switch between all four grouping views (flat, by category, by program type, by specific tier/program) without a page reload. [DERIVED]

**SC-5** — A user can initiate a row action (Duplicate, Change logs, Export data, Pause) from the overflow menu on any row. [DERIVED]

**SC-6** — The displayed status values are consistent with the canonical five-status set (Awaiting Approval, Draft, Upcoming, Live, Stopped) — no legacy "active" or "ended" labels appear. [DERIVED from Q6]

---

## Dependencies

**DEP-1** — Benefits listing API endpoint (paginated, filterable, searchable) — to be provided by the BE team. Interim: fields inferred from Figma columns. [RESOLVED by BE — Q8]

**DEP-2** — `CapMultiSelect` component must be available in the `capillary-ui` / Cap-UI component library. [INFERRED — required by FR-18]

**DEP-3** — Route `/benefits/listing` must be registered in the application router. [INFERRED — required by FR-1]

**DEP-4** — Navigation sidebar entry for "Benefits" (or "Benefits listing") must be added to the app nav config. [INFERRED FROM PRD]

---

## Assumptions

1. The route `/benefits/listing` is a new top-level route; it does not replace or extend any existing page. [From Q10 answer]
2. "Group by" and "scope to specific tier/program" views (FR-8 b/c/d) are client-side transformations or re-queries — the exact mechanism (client grouping vs. API grouping param) is left to the HLD to determine.
3. Row actions (Duplicate, Change logs, Export data, Pause) are in scope for this listing page. Their individual implementation details (API calls, modals, side effects) are out of scope for this spec and should be addressed per-action in separate or follow-on specs.
4. Pagination is required for the benefits table (implied by the presence of server-side search and the existence of the analogous `PromotionList` pattern in the codebase).
5. The "Updated at" column format ("08 Dec 2025 3:27 AM AST / Dev Patel") is taken directly from Figma and is the authoritative display format.
6. Benefit description, ID, and external ID are part of the benefit entity (as stated in the PRD) even though they are not rendered as visible columns. They remain available for future search scope expansion.
7. The "If unanswered" default for Q8 was not used; instead the owner's answer ("assume API fields as per Figma; replace when BE provides") was treated as the authoritative response.
8. Status values "active" and "ended" from the raw PRD map to "Live" and "Stopped" respectively in the Figma canonical set. "Awaiting Approval" and "Draft" are valid filterable states, not read-only display-only states. [From Q6]
9. `CapMultiSelect` supports all the filter field types required (text/keyword multi-select for Status, Category, Program name, Updated by; date-range for Duration and Last updated).

---

## Resolved Clarifications

| Q# | Category | Decision | Applied to |
|----|----------|----------|------------|
| Q1 | Design | Omit summary stats block; follow Figma (no counters above the table) | FR-5, Out of Scope |
| Q2 | Design | Use combined "Updated at" column (date + actor); no standalone tier/subscription program column | FR-3, FR-4, Out of Scope |
| Q3 | Spec Gap | All four grouping views are filter/grouping states of the same table; no tabs or separate routes | FR-8, FR-9, Out of Scope |
| Q4 | Design | Omit tier/subscription program filter and tier event type filter; implement only the six Figma-shown filters | FR-16, FR-17, Out of Scope |
| Q5 | Design | Use `CapMultiSelect` for all filter fields (overrides Figma single-select components) | FR-18 |
| Q6 | Spec Gap | Canonical status set is five values: Awaiting Approval, Draft, Upcoming, Live, Stopped | FR-6, Scenario 3 |
| Q7 | Design | All four row actions (Duplicate, Change logs, Export data, Pause) shown for every row, no permission gating | FR-7, Scenario 7 |
| Q8 | Backend | API fields assumed from Figma columns; full contract to be replaced when BE confirms endpoint | FR-22, FR-23, DEP-1 |
| Q9 | Spec Gap | Server-side search; scope limited to benefit name only; description/ID/external-ID deferred | FR-11, FR-12, Scenario 2 |
| Q10 | Spec Gap | New standalone route `/benefits/listing`; no connection to `LoyaltyProgramTiers` | FR-1, FR-2, DEP-3 |

---

## Completeness Tally

- **Original PRD items:** 17 (2 Figma links, 4 list-view definitions, 9 field/filter items, search requirement, multi-select requirement)
- **Enhanced spec items:** 17 original + 12 inferred/derived = 29 total
- **Clarifications:** 10 questions — 10 absorbed (9 fully resolved, 1 partially resolved with deferred sub-items [Q8 full API contract, Q9 description/ID/external-ID search scope])
- **NEEDS CLARIFICATION markers remaining:** 0
