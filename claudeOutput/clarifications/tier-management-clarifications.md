---
source: claudeOutput/rawPrd/tier-management.md
feature: Tier Management - Tier Listing & Details View
generated: 2026-04-16
status: awaiting-resolution
figma-nodes: [32:3147]
---

# Clarifications: Tier Management - Tier Listing & Details View

> **For reviewers** -- fill the `Answer:` block under each question. When every question is answered (or consciously skipped), change `status:` at the top to `resolved`. Then run `/filter-prd` on this file.

**Source PRD:** `claudeOutput/rawPrd/tier-management.md`
**Figma:** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=32-3147&m=dev

---

## Questions (14)

<!-- Category tags (PM-facing):
     - Design       = Figma vs PRD mismatch or design-only elements
     - Spec Gap     = vague, missing, or underspecified PRD content
     - Backend      = missing API contract or payload
     - Rules        = validation, permissions, error/empty states
     - Architecture = conflicts with existing garuda-ui patterns
-->

### Q1 -- [Design] KPI summary bar is absent from Figma -- should it be built?

**Context:** The PRD specifies four KPIs (total tiers, active tiers, deactivated tiers, total members) but the Figma design shows no KPI summary bar or dashboard cards above the tier comparison table. The only member count visible is per-tier inside the table row labeled "Members (Total - 280.2k)".

**If unanswered:** Follow Figma -- omit a dedicated KPI summary bar; show aggregated member count inline per Figma.

**Owner:** PM

**Answer:**
```
Don't show the bar , go with figma desing
```

---

### Q2 -- [Design] PRD describes a "tier listing" with status filters, but Figma shows a side-by-side comparison table -- which is the primary view?

**Context:** The PRD describes a filterable listing (Draft, Pending approval, Active, Deactivated/Stopped) implying a traditional table/list layout. The Figma shows a columnar comparison view where all tiers appear as columns with row labels on the left and horizontal tabs (Basic details, Eligibility criteria, Renewal criteria, Downgrade criteria, Benefits). These are fundamentally different layouts.

**If unanswered:** Follow Figma -- build the columnar comparison view with horizontal tabs as the primary view. No separate card-based listing page.

**Owner:** PM

**Answer:**
```
Follow Figma -- build the columnar comparison view with horizontal tabs as the primary view. No separate card-based listing page.
```

---

### Q3 -- [Design] Figma shows "Create tier" and "Create benefit" action buttons -- are these in scope for this PRD?

**Context:** The Figma top-right area shows two CapButton instances labeled "Create tier" and "Create benefit". The PRD only covers the listing/details view and does not mention create flows. If these buttons are present, we need to know whether they navigate to separate pages or are out of scope.

**If unanswered:** Render the buttons as shown in Figma but disable or hide them until the create-tier PRD is specified.

**Owner:** PM

**Answer:**
```
Render the button as show in figma , whenver we will create create tier and create benfit page it would redirect to that page
```

---

### Q4 -- [Design] Figma shows a program selector dropdown ("Loyalty program 2025") -- is tier data scoped to a single program?

**Context:** The Figma header contains a CapSelect component with "Loyalty program 2025" and a chevron-down icon. The PRD says "all tiers in a program" but does not specify whether the program is selected via a dropdown on this page or inherited from the global Cap shell context.

**If unanswered:** Follow Figma -- render a program selector dropdown on the page; tier data is fetched per selected program.

**Owner:** PM

**Answer:**
```
Yes it's scoped to a single program
```

---

### Q5 -- [Design] Figma shows five horizontal tabs but PRD lists different section groupings -- which tab structure wins?

**Context:** Figma tabs are: "Basic details", "Eligibility criteria", "Renewal criteria", "Downgrade criteria", "Benefits". The PRD groups data differently (e.g., "Upgrade condition" and "Upgrade schedule" are standalone items in PRD but appear under "Eligibility criteria" in Figma; "Membership duration" in PRD appears as "Duration" under Basic details in Figma).

**If unanswered:** Follow Figma tab structure. Map PRD fields into the five Figma tabs.

**Owner:** Designer

**Answer:**
```
Create tab structure as shown in figma
```

---

### Q6 -- [Design] Figma shows an edit icon (pencil) on the first tier column header -- what is the expected edit interaction?

**Context:** The Bronze tier column header in Figma has an edit icon (Atoms/Icons/24/Nav/edit). No other tier columns show it. The PRD does not mention inline editing or an edit action from this view.

**If unanswered:** Follow Figma -- the edit icon navigates to a tier-edit page (out of scope for this PRD, so render as a link/button placeholder).

**Owner:** PM

**Answer:**
```
As shown in Bronze section, each section would have edit icon
```

---

### Q7 -- [Design] Figma shows a fifth tier ("Ruthenium") with an "Inactive" badge -- does this map to the PRD's "Deactivated/Stopped" status?

**Context:** Figma shows tier statuses as "Active" and "Inactive". The PRD defines statuses as Draft, Pending approval, Active, and Deactivated/Stopped. The terminology does not match, and Draft/Pending approval tiers are not shown in Figma.

**If unanswered:** Treat Figma's "Inactive" as equivalent to PRD's "Deactivated/Stopped". Support all four PRD statuses in the data model; render only the ones returned by the API.

**Owner:** PM

**Answer:**
```
As of now goes with figma, consider Active and incative
```

---

### Q8 -- [Spec Gap] Where do the status filters (Draft, Pending approval, Active, Deactivated/Stopped) appear in the UI?

**Context:** The PRD lists filter-by-status as a feature, but neither the PRD nor the Figma shows where these filters are placed. There is no filter panel, dropdown, or pill bar visible in the Figma design.

**If unanswered:** Needs decision -- no safe default. If filters are required, we need a design for their placement (e.g., a filter bar above the tabs or a dropdown next to the program selector).

**Owner:** Designer

**Answer:**
```
let's not build any such kind of filter , since it's not there in listing page in given figam design
```

---

### Q9 -- [Spec Gap] Is horizontal scrolling the intended behavior when tiers exceed viewport width?

**Context:** The Figma shows 4+ tier columns (Bronze, Silver, Gold, Platinum visible; Ruthenium partially clipped). With many tiers, the table will overflow. The PRD does not specify scroll behavior, pagination, or a maximum visible tier count.

**If unanswered:** Implement horizontal scroll on the tier columns area with the left-side row labels fixed, matching the Figma layout where the rightmost column is clipped.

**Owner:** Designer

**Answer:**
```
Yes, there would be horizontal scale and left side column will be fixed only the tier will scroll if exceed
```

---

### Q10 -- [Spec Gap] What is the "Upgrade condition" field in the PRD -- is it distinct from "Eligibility criteria"?

**Context:** The PRD lists both "Eligibility criteria" and "Upgrade condition" as separate tier-detail fields. The Figma merges these under "Eligibility Criteria" tab with rows: Type, Activities, Duration, Upgrade Schedule, Nudges/Communication. There is no separate "Upgrade condition" row.

**If unanswered:** Follow Figma -- treat "Upgrade condition" as the eligibility criteria section (Type + Activities). No separate field needed.

**Owner:** PM

**Answer:**
```
Follow Figma -- treat "Upgrade condition" as the eligibility criteria section (Type + Activities). No separate field needed.
```

---

### Q11 -- [Backend] Which API endpoints serve tier listing, tier details, and tier benefits data?

**Context:** The existing architecture.md and endpoints.js show a `loyalty` API domain (`/loyalty/api/v1`) and a `tiers.js` utility file, but no tier-specific endpoints are documented. The system map covers only promotion-related APIs. We need to know the exact endpoints for: (a) list of tiers for a program, (b) tier detail with eligibility/renewal/downgrade criteria, (c) benefits linked to a tier.

**If unanswered:** Needs decision -- no safe default. BE team must provide the API contract before development.

**Owner:** BE

**Answer:**
```
As of now create dummydata as per the figam desing , will replace it once BE will provide details
```

---

### Q12 -- [Backend] Is tier benefit data returned as part of the tier detail response, or does it require a separate benefits-by-tier API call?

**Context:** The Figma "Benefit category" section shows 11 benefit rows (Welcome Gift, Upgrade bonus points, Tier badge, Renewal Bonus, Loyalty Voucher, Earn Points, Priority Support, Free Shipping, VIP Events, Birthday Bonus, Exclusive Comms). The PRD says "Show benefits linked to a tier grouped by category." It is unclear whether this is a nested object in the tier response or a separate endpoint.

**If unanswered:** Needs decision -- no safe default. BE team must confirm the data source and payload shape.

**Owner:** BE

**Answer:**
```
Assume it would come with same call, no separate end point
```

---

### Q13 -- [Rules] Who can access the tier listing page -- are there RBAC permissions specific to tier management?

**Context:** The existing promotion module uses 7 permission constants gating CRUD operations. The PRD does not mention any permission or role-based access rules for viewing/editing tiers. If tier management reuses existing loyalty permissions or introduces new ones, it affects route guards and button visibility.

**If unanswered:** Reuse the existing loyalty module permission model. All users with loyalty read access can view tiers.

**Owner:** PM

**Answer:**
```
No RBAC as of now
```

---

### Q14 -- [Architecture] Should the tier listing page live inside the existing garuda-ui app or be a standalone micro-frontend?

**Context:** The existing codebase is a loyalty promotions platform under `/loyalty/ui/v3`. The tier management feature is a distinct domain (tiers vs promotions). Architecture.md shows the app currently has 8 pages, all promotion-focused. Adding a tier page is feasible within the existing app but introduces a new domain concern.

**If unanswered:** Follow existing convention -- add as a new page within garuda-ui with its own route (e.g., `/tiers/list`), dynamically injected reducer/saga, following the same atomic design and Redux patterns.

**Owner:** Tech Lead

**Answer:**
```
Need to create a sperate route inside garuda-ui
```

---

## Appendix -- traceability (do not edit)

- **Source PRD:** `claudeOutput/rawPrd/tier-management.md`
- **Figma nodes fetched:** 32:3147
- **Figma nodes that failed:** None
- **Figma artifacts cached at:** `claudeOutput/figma-capui-mapping/32-3147/`
- **Architecture reference:** `.claude/output/architecture.md`
- **System map reference:** `.claude/output/loyalty-promotions-system-map.md`
