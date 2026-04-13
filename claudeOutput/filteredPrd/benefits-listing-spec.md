---
feature: benefits-listing
status: Ready for HLD
source-prd: claudeOutput/rawPrd/benefits-listing.md
source-clarifications: claudeOutput/clarifications/benefits-listing-clarifications.md
figma: https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=3-1022&m=dev
figma-node: "3:1022"
figma-file: Q3rZlYt8ZY6g0TuVg1TZzm
architecture-analog: app/components/pages/PromotionList/
generated: 2026-04-13
---

# Feature Specification: Benefits Listing

> **Status:** Ready for HLD — all blocking decisions resolved.  
> Figma is authoritative for visual structure. Every conflict with the raw PRD is logged in §15 (Open Questions).

---

## 1. Overview

The **Benefits Listing** page is a new standalone page in garuda-ui that allows loyalty program managers to browse, search, and filter all benefit configurations for a given program. It is modelled architecturally on the existing PromotionList page and uses the same infinite-scroll pattern.

### Scope boundary

| In scope | Out of scope |
|---|---|
| Flat list with search, filter, sort | Summary count cards (total/live/upcoming/ended) |
| Infinite scroll | Benefit creation flow |
| Status badge + secondary status text | Grouped-by-category view |
| Row click → benefit view (empty placeholder) | Tier-event grouped layout |
| Search bar + filter panel (PromotionList style) | Download config / CSV export |
| | RBAC / permission gating |

---

## 2. Goals

1. Give program managers a single, filterable view of every benefit configured for a program.
2. Surface key metadata (name, status, duration, program, category, last updated) at a glance.
3. Enable fast retrieval via full-text search and column-level multi-select filters.
4. Match the PromotionList UX and code patterns so the codebase stays consistent.

---

## 3. User Scenarios

### US-1 — Browse all benefits
A manager opens `/benefits`. The page loads a flat list of all benefits (page 1, 20 rows) sorted by Updated at descending. She scrolls down; the next page loads automatically (infinite scroll). [RESOLVED by Tech Lead — Q14]

### US-2 — Search by name / ID
She types "birthday" in the search bar. The list refreshes showing only benefits whose name, description, ID, or external ID contain the term.

### US-3 — Filter by status and category
She clicks the filter icon (right of search bar). A filter panel appears (same pattern as PromotionList). She selects "Active" and "Upcoming" for Status, and "Welcome Gift" for Category. The list re-fetches with the combined filters applied. [RESOLVED by PM — Q3, Q7]

### US-4 — Sort by duration or updated at
She clicks the sort arrow on "Duration" or "Updated at" to toggle ascending / descending. [INFERRED from Figma — Q6 default]

### US-5 — Navigate to benefit detail
She clicks any row. The app navigates to the benefit view page (route currently empty/placeholder). [RESOLVED by PM — Q5]

---

## 4. Functional Requirements

### FR-01 — Page entry point
- **Route:** `/benefits` — independent, not nested under BenefitsSettings. [RESOLVED by Tech Lead — Q15]
- **Navbar:** Add entry adjacent to Promotions (position TBD by designer; follow PromotionList sidebar entry as template).
- **Page component:** `app/components/pages/BenefitsList/` — new page, sibling to `BenefitsSettings`.

### FR-02 — Toolbar
- **Search:** `CapInput` with search icon, placeholder "Search". Searches across name, description, ID, external ID. Debounced 300 ms before firing API call.
- **Filter icon:** Clicking opens the filter panel (right-side drawer or inline panel, same pattern as PromotionList). [RESOLVED by PM — Q3]
- **No "Create Benefit" button.** [RESOLVED by PM — Q3]
- **No "Download config" button.** [RESOLVED by PM — Q3]

### FR-03 — Table columns
Exact column order per Figma (authoritative over PRD): [RESOLVED by Designer — Q1 default]

| # | Column header | Content | Sortable |
|---|---|---|---|
| 1 | Name | Bold title + description + "ID: …" + "EXT ID: …" (two-line cell) | No |
| 2 | Status | Status badge + secondary status text (see FR-05) | No |
| 3 | Duration | Start datetime (line 1) + End datetime (line 2) + updater name in grey | Yes (⇅) |
| 4 | Program name | Single-line program name | No |
| 5 | Category | Single-line category name | No |
| 6 | Updated at | Datetime + updater name in grey | Yes (⇅, default desc) |

> **Note:** Tier/Subscription column removed per Figma. Tier/Subscription data available via filter panel only. [RESOLVED by default — Q1]

### FR-04 — Default sort
`Updated at`, descending. [INFERRED from Q6 default]

### FR-05 — Status enum and secondary text
[RESOLVED by default — Q2]

| Status value | Badge colour | Secondary line rule |
|---|---|---|
| `active` | Green | "N days left" (days until end date) |
| `upcoming` | Blue | "Starts in N days" (days until start date) |
| `ended` | Grey | _(no secondary line)_ |
| `draft` | Grey | "Draft saved" |
| `awaiting_approval` | Orange | "N days left" (days until approval deadline, if available) |
| `rejected` | Red | "Rejected on \<date\>" |

Secondary status text is computed **client-side** from the date fields in the API response.

### FR-06 — Infinite scroll
- Page size: **20** rows per page. [RESOLVED by Tech Lead — Q14]
- Trigger: `IntersectionObserver` watching a sentinel element below the last row. [RESOLVED by Tech Lead — Q14]
- Pattern: identical to PromotionList implementation.
- Loading state: spinner below last loaded row while fetching next page.
- End state: "No more results" text when `total` reached.

### FR-07 — Row click
- Clicking any row navigates to the benefit view page.
- Route is a **placeholder link** (e.g. `/benefits/:benefitId`) — the view page is not in scope. [RESOLVED by PM — Q5]
- No per-row actions menu (edit / clone / archive / delete) in this release.

### FR-08 — Filter panel
Opened by clicking the filter icon in the toolbar. Same UX pattern as PromotionList filter panel. [RESOLVED by PM — Q7]

Supported filters and their input types:

| Filter | Type | Values |
|---|---|---|
| Status | Multi-select | Active, Upcoming, Ended, Draft, Awaiting Approval, Rejected |
| Category | Multi-select | From API (see FR-11) |
| Program | Multi-select | From existing program list endpoint |
| Duration | Date-range picker | Start date + end date (with time) |
| Last updated by | Multi-select | From API list response metadata |
| Last updated at | Single-select (preset) | Today, Yesterday, Last 7 days, Last 30 days, Last 90 days |
| Tier event | Multi-select | Upgrade, Downgrade, Renew [RESOLVED by default — Q8] |

> Tier/Subscription as a filter column is included in the filter panel (not as a table column). This is a standard multi-select — no cascading type→value UI. [RESOLVED by PM — Q7]

### FR-09 — Multi-select filter encoding
Repeated query params per value: `?status=active&status=upcoming&category_id=1&category_id=2`. [RESOLVED by default — Q12 — matches PromotionList convention]

### FR-10 — API — listing endpoint
[RESOLVED by BE — Q9: generate per Figma data]

**Request:**
```
GET /incentives/api/v1/benefits
Query params:
  page         integer   (1-based)
  size         integer   default 20
  sort         string    field name, e.g. "updated_at"
  order        string    "asc" | "desc"
  search       string    full-text search term
  status[]     string    multi-value
  category_id[]integer  multi-value
  program_id[] integer  multi-value
  start_date   ISO8601   filter by duration start (≥)
  end_date     ISO8601   filter by duration end (≤)
  updated_by[] integer  multi-value (user IDs)
  updated_at   string    preset: "today"|"yesterday"|"last_7d"|"last_30d"|"last_90d"
  tier_event[] string   multi-value: "upgrade"|"downgrade"|"renew"
```

**Response shape:**
```json
{
  "data": [
    {
      "id": 101,
      "external_id": "EXT-101",
      "name": "Birthday Bonus",
      "description": "Bonus points on birthday",
      "status": "active",
      "start_date": "2025-01-01T00:00:00Z",
      "end_date":   "2025-12-31T23:59:59Z",
      "program_id": 1,
      "program_name": "Loyalty Program 2025",
      "category_id": 3,
      "category_name": "Milestone Rewards",
      "last_updated_at": "2025-03-15T10:30:00Z",
      "last_updated_by": { "id": 42, "name": "Alice Smith" },
      "tier_event": "upgrade"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 87
  }
}
```

### FR-11 — Filter option sources
[RESOLVED by default — Q11]

| Filter | Source |
|---|---|
| Category | BenefitsSettings category endpoint (reuse if present; request new if not) |
| Program | Existing Cap program list endpoint |
| Tier / Subscription | Loyalty tier/subscription endpoint |
| Last updated by | Distinct values from list response metadata (BE to emit `updaters: [{id, name}]`) |

### FR-12 — Empty / loading / error states
- **Loading (initial):** Full-table skeleton rows (follow PromotionList pattern).
- **Loading (next page):** Spinner below last row.
- **Empty (no benefits):** Illustrated empty state with message "No benefits configured yet."
- **Empty (filtered):** "No results match your filters" with a "Clear filters" link.
- **Error:** Inline error banner with retry button.

### FR-13 — No summary cards
Summary count cards (total / live / upcoming / ended) are **not in scope** for this release. [RESOLVED by PM — Q4, Q10]

### FR-14 — No RBAC / permission gating
Permission checks are not in scope for this release. All authenticated users with access to the program see the page. [RESOLVED by PM — Q13]

---

## 5. Success Criteria

| # | Criterion | Measurement |
|---|---|---|
| SC-1 | Listing loads within 2 s on a 100-row dataset (network excluded) | Manual QA + Lighthouse |
| SC-2 | Search + filter round-trip triggers ≤ 1 API call per interaction | Network tab inspection |
| SC-3 | Infinite scroll loads next page when user reaches bottom of visible list | Manual QA |
| SC-4 | All 6 table columns render correctly with two-line cells for Name and Duration | Visual QA against Figma |
| SC-5 | Status badge + secondary text matches FR-05 for each status value | Unit test coverage |
| SC-6 | ESLint passes with 0 errors; no file exceeds 500 lines | CI gate |

---

## 6. Design Reference

**Primary:** [Figma node 3:1022](https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=3-1022&m=dev)

**Cached artefacts:**
- `claudeOutput/figma-capui-mapping/3:1022/design-context.jsx` — structural summary

**Figma column order** (authoritative): Name → Status → Duration → Program name → Category → Updated at

**Status badge colours** (from Figma screenshot):
- Awaiting Approval → orange dot
- Draft → grey dot
- Upcoming → blue dot
- Active → green dot _(implied)_
- Ended → grey dot _(implied)_
- Rejected → red dot _(implied)_

---

## 7. Dependencies & Constraints

### 7.1 Architectural analog
`app/components/pages/PromotionList/` is the closest existing pattern — same Redux slice shape, saga structure, infinite-scroll approach, and filter panel UX. The HLD should replicate it.

### 7.2 Existing code to leave untouched
- `app/components/pages/BenefitsSettings/` — separate settings page, no merge.
- `app/components/molecules/BenefitsSettingsModal/` — different concern.
- `app/components/organisms/CategoriesSection/` — empty scaffolding, out of scope.

---

## 8. Assumptions

| ID | Assumption | Risk if wrong |
|---|---|---|
| A-1 | `/incentives/api/v1/benefits` endpoint exists or will be available before FE work lands | API not ready → mock required |
| A-2 | BenefitsSettings category endpoint returns `{id, name}` list reusable for filter | Different shape → adapter needed |
| A-3 | Program list endpoint is already available via existing Cap selectors | Missing → new saga call |
| A-4 | `last_updated_by` is returned as `{id, name}` object in list response | Name-only → no user-ID linking |
| A-5 | Figma node 3:1022 is the only relevant design node (no adjacent filter panel node) | More nodes → additional Figma fetch needed in HLD |

---

## 9. Resolved Clarifications

> All resolved answers are absorbed as authoritative FRs above. This table is the traceability record.

| Q# | Topic | Decision | Owner | Mapped to FR |
|---|---|---|---|---|
| Q3 | Toolbar: no Download, no Create Benefit; search + filter icon like PromotionList | Resolved | PM | FR-02 |
| Q4 | No summary cards; flat list per Figma; no grouped view | Resolved | PM | FR-13 |
| Q5 | Row click → view page (placeholder link, empty) | Resolved | PM | FR-07 |
| Q7 | Standard column filters via filter panel (no cascading Tier/Subscription UI) | Resolved | PM | FR-08 |
| Q9 | Request/response generated per Figma data | Resolved | BE | FR-10 |
| Q10 | Summary not in scope | Resolved | PM | FR-13 |
| Q13 | RBAC not in scope | Resolved | PM | FR-14 |
| Q14 | Infinite scroll, page size 20, IntersectionObserver | Resolved | Tech Lead | FR-06 |
| Q15 | New page `/benefits`, independent route, sibling to BenefitsSettings | Resolved | Tech Lead | FR-01, §7 |

**Deferred (default applied):**

| Q# | Topic | Default applied | Mapped to FR |
|---|---|---|---|
| Q1 | Column set: Figma wins; Tier/Subscription filter-only | Default | FR-03 |
| Q2 | Status enum: 6 values; secondary text computed client-side | Default | FR-05 |
| Q6 | Sort: Duration + Updated at only; default Updated at desc | Default | FR-04 |
| Q8 | Tier event filter: multi-select {Upgrade, Downgrade, Renew}, no grouped view | Default | FR-08 |
| Q11 | Filter option sources per endpoint type | Default | FR-11 |
| Q12 | Multi-select encoding: repeated query params | Default | FR-09 |

---

## 10. Out-of-Scope Items (Explicit)

The following items appear in the raw PRD but are **explicitly excluded** from this release based on PM and Tech Lead decisions:

1. **Summary count cards** — total / live / upcoming / ended (Q4, Q10)
2. **Grouped-by-category listing** — Welcome Gift, Birthday Bonus sections (Q4)
3. **Benefit creation flow** — "Create Benefit" button and associated page (Q3)
4. **Download / export** — CSV or config export (Q3)
5. **RBAC / permission gating** — view vs. create vs. edit roles (Q13)
6. **Tier-event grouped view** — summary layout by upgrade/downgrade/renew (Q8)

---

## 11. Open Questions (Unresolved — use defaults for HLD)

| Q# | Question | Default for HLD |
|---|---|---|
| Q1 | Figma vs PRD column set confirmed by Designer? | Use Figma columns (FR-03) |
| Q2 | Full status enum confirmed by PM? | Use 6-value enum (FR-05) |
| Q6 | Sort scope confirmed by PM? | Duration + Updated at only |
| Q8 | Tier event filter type confirmed? | Standard multi-select |
| Q11 | Filter option endpoint contracts confirmed by BE? | Per FR-11 defaults |
| Q12 | Multi-select encoding confirmed by BE? | Repeated query params |

> These are non-blocking — defaults are applied for HLD. PM/BE should confirm before FE implementation starts.
