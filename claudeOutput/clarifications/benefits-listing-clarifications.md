---
source: claudeOutput/rawPrd/benefits-listing.md
feature: benefits-listing
generated: 2026-04-19
status: awaiting-resolution
figma-nodes:
  - 123:5146 (listing page)
  - 122:4327 (filter drawer)
---

# Clarifications: Benefits Listing

> **For reviewers** — fill the `Answer:` block under each question. When every question is answered (or consciously skipped), change `status:` at the top to `resolved`. Then run `/filter-prd claudeOutput/clarifications/benefits-listing-clarifications.md`.

**Source PRD:** `claudeOutput/rawPrd/benefits-listing.md`
**Figma:** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=123-5146 (listing) | node-id=122-4327 (filter drawer)

---

## Questions (10)

---

### Q1 — [Design] Summary stats bar: present in PRD, absent in Figma listing screenshot

**Context:** The PRD specifies four stat counters (total, live, upcoming, ended) above the list. The Figma screenshot for node 123:5146 shows only a table with no stats bar — the area above the table header is empty.

**If unanswered:** Omit the summary stats block; follow Figma.

**Owner:** Designer / PM

**Answer:**
```
Omit the summary stats block; follow Figma.
```

---

### Q2 — [Design] Table column set differs between PRD and Figma

**Context:** Figma shows six columns — Name, Status, Duration, Program name, Category, Updated at. The PRD also requires "Tier/Subscription program" and "Last updated by" as visible columns. "Updated at" in Figma appears to cover both date and actor (e.g. "08 Dec 2025 3:27 AM AST / Dev Patel") in a single column, but the PRD treats them as separate fields.

**If unanswered:** Follow Figma — combined "Updated at" column showing date + actor; no standalone "Tier/Subscription program" column.

**Owner:** Designer / PM

**Answer:**
```
Follow Figma — combined "Updated at" column showing date + actor; no standalone "Tier/Subscription program" column.
```

---

### Q3 — [Spec Gap] Grouping views — tab-based or separate routes/pages?

**Context:** The PRD describes four distinct list views (all benefits, grouped by category, grouped by tier/subscription type, scoped to a specific tier or subscription). The Figma listing node shows a single flat table with no tabs or navigation for switching between these views. It is unclear whether these are: (a) tabs on the same page, (b) filter states of the same table, or (c) separate sub-pages/routes.

**If unanswered:** Treat all four views as filter/grouping states of the same table; no separate tabs or routes. Follow Figma.

**Owner:** PM / Designer

**Answer:**
```
Treat all four views as filter/grouping states of the same table; no separate tabs or routes. Follow Figma.
```

---

### Q4 — [Design] Filter drawer missing "Tier/Subscription program" and "tier event" filters

**Context:** The PRD lists two filter types not present in the Figma filter drawer (node 122:4327): (1) a filter on Tier or Subscription program (specific or as a whole), and (2) a filter on tier event type (upgrade / downgrade / renew). The drawer only shows Program name, Status, Category, Duration, Last updated, Updated by.

**If unanswered:** Omit both missing filters; implement only the six shown in Figma.

**Owner:** Designer / PM

**Answer:**
```
Omit both missing filters; implement only the six shown in Figma.
```

---

### Q5 — [Design] Multi-select vs single-select on filter fields

**Context:** The PRD explicitly states users can select multiple values for every filter (e.g. "active AND upcoming"). The Figma drawer renders Status and Category as plain `CapInput` text fields (single value), not multi-select dropdowns. Program name and Updated by use `CapSelect` (dropdown, single-select). None of the fields show a multi-select/chip pattern.

**If unanswered:** Follow Figma — all filter fields are single-select; multi-select is not implemented.

**Owner:** Designer / PM

**Answer:**
```
Use CapMultiSelect don't use single select
```

---

### Q6 — [Spec Gap] Status values: PRD says "active, upcoming, ended" — Figma shows five distinct statuses

**Context:** The PRD defines three status filter values. The listing screenshot shows five status chip states: Awaiting Approval, Draft, Upcoming, Live, Stopped. It is unclear whether "active" maps to "Live", "ended" maps to "Stopped", and whether "Awaiting Approval" and "Draft" are valid filterable statuses or read-only display states.

**If unanswered:** Use the five statuses visible in Figma (Awaiting Approval, Draft, Upcoming, Live, Stopped) as the canonical status set.

**Owner:** PM / BE

**Answer:**
```
Use the five statuses visible in Figma (Awaiting Approval, Draft, Upcoming, Live, Stopped) as the canonical status set.
```

---

### Q7 — [Design] Row action menu — scope and permissions

**Context:** The Figma listing shows a three-dot overflow menu per row with four actions: Duplicate, Change logs, Export data, Pause. The PRD does not mention any row-level actions. It is unclear whether all four actions are always shown, or whether they are gated by benefit status or user role.

**If unanswered:** Render all four actions for every row with no permission gating, as shown in Figma.

**Owner:** PM / BE

**Answer:**
```
Render all four actions for every row with no permission gating, as shown in Figma.
```

---

### Q8 — [Backend] API contract for benefits listing and filter support

**Context:** No benefits-specific API endpoint is specified in the PRD. The existing `api.js` only has a tier-listing endpoint (`loyalty_endpoint/strategy/tier/{programId}`) which bundles benefits — it does not return a standalone paginated benefits list. There is no confirmed endpoint for fetching benefits by filter, search, status, category, or last-updated-by actor.

**If unanswered:** Needs decision — no safe default. BE must confirm the API endpoint, pagination model, and which filter/search parameters it accepts before implementation starts.

**Owner:** BE

**Answer:**
```
As of now assumed api as per Desing field showin in figam, Ltr when BE will give api will replace with that

```

---

### Q9 — [Spec Gap] Search scope and client-side vs server-side

**Context:** The PRD says search must work across name, description, ID, and external ID. It is unspecified whether search is server-side (query param to the API) or client-side (filter in memory). Given the table may be paginated, client-side search across unpaginated fields (e.g. description, external ID) would be incomplete.

**If unanswered:** Server-side search via a query parameter; scope limited to name and ID (matching the existing `PromotionList` pattern). Description and external ID search are deferred until API support is confirmed.

**Owner:** PM / BE

**Answer:**
```
Server-side search via a query parameter; scope limited to name 
```

---

### Q10 — [Spec Gap] Entry point and routing — where does this page live?

**Context:** The PRD does not specify the URL route, the navigation sidebar entry, or how this page relates to the existing `LoyaltyProgramTiers` page (which already renders benefits per tier). It is unclear whether this is a new top-level route, a tab within an existing page, or a replacement for any existing view.

**If unanswered:** Needs decision — no safe default. The route, nav entry point, and relationship to `LoyaltyProgramTiers` must be confirmed before the file/folder structure can be determined.

**Owner:** PM / Tech Lead

**Answer:**
```
As of know we need to create separate route like /benfits/listing for this page. This page done' have any connection with LoyaltyProgramTiers 
```

---

## Appendix — traceability (do not edit)

- **Source PRD:** `claudeOutput/rawPrd/benefits-listing.md`
- **Figma nodes fetched:**
  - `123:5146` — Listing page (screenshot loaded; design-context was sparse/oversized — metadata XML read from child frames)
  - `122:4327` — Filter drawer (full design-context loaded successfully)
- **Figma artifacts cached at:** `claudeOutput/figma-capui-mapping/` (no recipe files written for this pass — context was used for gap analysis only)
- **Architecture reference:** `.claude/output/architecture.md` — file does not exist in garuda-ui repo; no `.claude/` directory found
- **Endpoints reference:** `app/config/endpoints.js` in garuda-ui repo — `loyalty_endpoint` is the relevant base
- **API reference:** `app/services/api.js` — `getTierListingData` at `loyalty_endpoint/strategy/tier/{programId}` is the only benefits-adjacent endpoint found; no standalone benefits listing endpoint exists
- **Analogous pages reviewed:** `app/components/pages/PromotionList/` (filter drawer, pagination, search patterns) and `app/components/pages/LoyaltyProgramTiers/` (benefits grouped by tier)
