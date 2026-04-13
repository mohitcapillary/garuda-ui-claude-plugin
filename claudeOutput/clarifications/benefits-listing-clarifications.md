---
source: claudeOutput/rawPrd/benefits-listing.md
feature: benefits-listing
generated: 2026-04-13
status: awaiting-resolution
figma-nodes: [3:1022]
---

# Clarifications: benefits-listing

> **For reviewers** — fill the `Answer:` block under each question. When every question is answered (or consciously skipped), change `status:` at the top to `resolved`. Then run `/filter-prd` on this file.

**Source PRD:** `claudeOutput/rawPrd/benefits-listing.md`
**Figma:** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=3-1022&m=dev

---

## Questions (15)

### Q1 — [Design] Column set — PRD vs Figma mismatch

**Context:** PRD asks for columns {Name+desc+IDs, Category, Status, **Tier/Subscription program**, Duration, Last modified+by}. Figma node 3:1022 shows {Name, Status, Duration, **Program name**, Category, Updated at} — no explicit Tier/Subscription column. Program vs Tier/Subscription column is the real gap.

**If unanswered:** Use Figma column set. Collapse Tier/Subscription program into the Program column as a secondary line; filter-only on tier/subscription.

**Owner:** PM + Designer

**Answer:**
```
<fill here>
```

---

### Q2 — [Design] Complete status enum and secondary status text rules

**Context:** PRD lists 3 statuses (active, upcoming, ended). Figma shows "Awaiting Approval", "Draft", "Upcoming" — plus secondary lines like "2 Days left", "Rejected on Dec 25", "Starts in 5 days", "Draft saved". We need the full status enum and the rule that computes the secondary line for each status.

**If unanswered:** Use Figma enum {Active, Upcoming, Ended, Draft, Awaiting Approval, Rejected}. Compute secondary text client-side: Active → "N days left" from end date; Upcoming → "Starts in N days"; Draft → "Draft saved"; Rejected → "Rejected on <date>"; Awaiting Approval → "N days left" for approval window.

**Owner:** PM + Designer

**Answer:**
```
<fill here>
```

---

### Q3 — [Design] Toolbar actions scope — Create Benefit, Download config

**Context:** Figma toolbar shows a green "Create Benefit" button and a "Download config" icon button. Neither is mentioned in the PRD. Is benefit creation in scope of this PRD or a separate one? What does Download export (CSV of visible rows, full config, PDF)?

**If unanswered:** Create Benefit is **out of scope** for this PRD — the button routes to an existing/future Benefit Create flow (link TBD). Download exports current filtered list as CSV.

**Owner:** PM

**Answer:** 
```
There is no download button , Benfit creation not in scope of this PRD, There is search icon with input and filter icon on click open filter panel as we have in promotion listing
```

---

### Q4 — [Design] Summary counts and grouped-view scope

**Context:** PRD describes (a) 4 summary counts (total/live/upcoming/ended), (b) grouped-by-category listings (Welcome gift, Birthday Bonus, …), and (c) listings scoped to a specific tier (Gold) or subscription (VIP). Figma node 3:1022 shows only one flat list. Are (a), (b), (c) separate screens / tabs / nav destinations not yet designed, or are they achieved via filters on this single screen?

**If unanswered:** (a) Render summary counts as 4 cards above the table on this screen. (b) and (c) are achieved by applying Category / Tier / Subscription filters — no separate grouped screens in this release.

**Owner:** PM + Designer

**Answer:** 
```
Go with Figma no summary cared in current scope, go with figma desing no groupping support as of now
```

---

### Q5 — [Spec Gap] Row click and per-row actions

**Context:** Neither PRD nor Figma specifies what happens on row click, nor shows any per-row actions menu (edit / clone / archive / delete).

**If unanswered:** Clicking a row navigates to the Benefit detail/edit screen (route TBD). No inline actions menu in this release.

**Owner:** PM + Designer

**Answer:**
```
It should go to view page as of now just add empty link so when will hav view page we will add
```

---

### Q6 — [Spec Gap] Sortable columns

**Context:** Figma shows sort arrows on Duration and Updated at. PRD doesn't mention sorting. Is sort scoped to those two columns, or should Name / Status / Category / Program also be sortable?

**If unanswered:** Sort only Duration and Updated at (matches Figma). Default sort: Updated at, desc.

**Owner:** PM

**Answer:**
```
<fill here>
```

---

### Q7 — [Spec Gap] Tier/Subscription filter — hierarchical or two separate fields?

**Context:** PRD says "either just a filter on tiers/subscription programs as a whole, or a filter on a specific tier or specific subscription program." Is this (a) two filters — a type selector {Tier, Subscription} plus a specific-value selector, or (b) a single cascading field (pick type → pick value), or (c) a single combined dropdown listing all tiers and subscriptions?

**If unanswered:** Go with (b) — one cascading field: first pick "Tier" or "Subscription", then pick specific value(s). Keeps URL params clean.

**Owner:** PM

**Answer:**
```
As of know only consider filter on table column which will be showin on clicking the filter icon on the top near search bar as we have for promolisting
```

---

### Q8 — [Spec Gap] Tier event filter (upgrade / downgrade / renew) — filter or separate view?

**Context:** PRD says filtering on tier-event "will help in showing the tier summary with the linked benefits for individual events of upgrade, downgrade, renew." This implies a derived "tier summary" view grouped by event — but the event filter itself is listed among other standard filters. Is it a normal multi-select filter chip, or does selecting it trigger a different grouped layout?

**If unanswered:** Treat as a normal multi-select filter chip {Upgrade, Downgrade, Renew}. No separate grouped view in this release.

**Owner:** PM

**Answer:**
```
<fill here>
```

---

### Q9 — [Backend] Listing API contract — endpoint, method, payload shape

**Context:** No benefits-listing endpoint exists in [app/services/api.js](app/services/api.js) or [app/config/endpoints.js](app/config/endpoints.js). BenefitsSettings uses `incentives_endpoint` (`/incentives/api/v1`) — likely base path. We need endpoint path, HTTP method, pagination (page+size or cursor), and response shape including how `last_updated_by` is returned (id only, display name, or both).

**If unanswered:** Assume `GET /incentives/api/v1/benefits` with query params `{page, size, sort, search, <filters>}`. Response: `{ data: [...], pagination: {page, size, total} }`. `last_updated_by` as `{id, name}` object.

**Owner:** BE

**Answer:**
```
As of now generate the response and request parm as per figma data
```

---

### Q10 — [Backend] Summary counts — part of list response or separate endpoint?

**Context:** If summary counts (total / live / upcoming / ended) are part of this feature (see Q4), we need to know whether they come from the list endpoint metadata, a dedicated `/benefits/summary` endpoint, or client-side tallying (not viable for paginated data).

**If unanswered:** Dedicated `GET /incentives/api/v1/benefits/summary?program_id=<id>` returning `{total, active, upcoming, ended}`. Called once on screen mount and after every filter change.

**Owner:** BE

**Answer:**
```
Summary is not scope of this, go with figma desing
```

---

### Q11 — [Backend] Filter option sources

**Context:** Filters for Category, Program, Tier, Subscription, Last-updated-by need populated dropdowns. Is there an API returning each option set, or do we reuse existing endpoints (e.g. Category may come from BenefitsSettings config)?

**If unanswered:** Category — reuse BenefitsSettings category endpoint if present, else request a new one. Program — existing program list endpoint from Cap. Tier / Subscription — fetch from loyalty endpoint. Last-updated-by — distinct values from the list response metadata (needs BE to emit).

**Owner:** BE + Tech Lead

**Answer:**
```
<fill here>
```

---

### Q12 — [Backend] Multi-select filter encoding in query string

**Context:** PRD requires multi-select on every filter. Existing garuda-ui endpoints aren't consistent here (some use repeated params, some CSV). Needs BE confirmation of the shape.

**If unanswered:** Repeated query params per value — `?status=active&status=upcoming&category_id=1&category_id=2`. Matches garuda-ui PromotionList convention.

**Owner:** BE

**Answer:**
```
<fill here>
```

---

### Q13 — [Rules] Permissions / RBAC for view vs create vs edit

**Context:** Who can view this listing? Who can create, edit, archive? PromotionList gates on `isLoyaltyPromotionsV2Enabled` feature flag — do benefits have a parallel flag / role check? Should Create Benefit button hide for read-only users?

**If unanswered:** Gate the whole page on a new feature flag `isBenefitsListV2Enabled` (mirrors PromotionList). Anyone with view access to program sees the listing. Create button hidden unless user has benefit-write role (check via existing Cap selector).

**Owner:** PM + Tech Lead

**Answer:**
```
RBACC is not scope of thi s
```

---

### Q14 — [Rules] Pagination approach — infinite scroll or paged?

**Context:** PromotionList uses infinite scroll. CapTable in Figma shows 4 static rows, no pagination control visible. Which pattern should benefits-listing follow?

**If unanswered:** Follow PromotionList — infinite scroll with page size 20, `IntersectionObserver`-triggered next-page fetch.

**Owner:** Designer + Tech Lead

**Answer:**
```
Follow PromotionList — infinite scroll with page size 20, `IntersectionObserver`-trigger
```

---

### Q15 — [Architecture] Relationship with existing BenefitsSettings page

**Context:** [app/components/pages/BenefitsSettings/](app/components/pages/BenefitsSettings/) already exists as a full page with its own Redux slice (reducer, saga, selectors). The empty directories [app/components/organisms/CategoriesSection/](app/components/organisms/CategoriesSection/) and [app/components/molecules/BenefitsSettingsModal/](app/components/molecules/BenefitsSettingsModal/) suggest prior scaffolding. Is benefits-listing a new sibling page (`BenefitsList/`) or should it absorb the settings page? What route and navbar entry?

**If unanswered:** Create a new page at `app/components/pages/BenefitsList/` (sibling to BenefitsSettings). Route: `/benefits`. Navbar entry next to Promotions. BenefitsSettings remains its own page — no merge.

**Owner:** Tech Lead

**Answer:**
```
Create separate page like promotion listing  with independend route for it /benifits, not Linked it to benfit settings
```

---

## Appendix — traceability (do not edit)

- **Source PRD:** `claudeOutput/rawPrd/benefits-listing.md`
- **Figma nodes fetched:** `3:1022` (file `Q3rZlYt8ZY6g0TuVg1TZzm`)
- **Figma artifacts cached at:** `claudeOutput/figma-capui-mapping/3:1022/`
  - `design-context.jsx` — structural summary (Figma returned sparse metadata; screenshot consulted)
- **Architecture reference:** `.claude/output/architecture.md`
- **System map reference:** `.claude/output/loyalty-promotions-system-map.md`
- **Existing benefits-adjacent code:** `app/components/pages/BenefitsSettings/`, `app/components/molecules/BenefitsSettingsModal/`, `app/components/organisms/CategoriesSection/` (empty), `app/components/organisms/CustomFieldsSection/` (empty)
- **Closest architectural analog:** `app/components/pages/PromotionList/` — use its reducer/saga/selector pattern and infinite-scroll UX.
