---
source: claudeOutput/rawPrd/tier-management.md
clarifications: claudeOutput/clarifications/tier-management-clarifications.md
generated: 2026-04-16
status: Ready for HLD
figma: https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=32-3147&m=dev
---

# Tier Management - Tier Listing & Details View

## Overview

This feature provides a read-only view for marketers to inspect all tiers configured for a loyalty program, along with their eligibility, renewal, downgrade criteria, and linked benefits. The primary layout is a **columnar comparison view** (side-by-side tier columns with row labels on the left) organized under five horizontal tabs, as defined in the Figma design.

The page is scoped to a **single loyalty program** selected via a program-selector dropdown on the page.

## Problem Statement

Marketers currently lack a consolidated view of tier configuration and benefits within the loyalty platform. They need to compare tiers side-by-side across multiple dimensions (basic details, eligibility, renewal, downgrade, benefits) to understand program structure and identify configuration gaps.

## Goals

- G1: Allow marketers to view all tiers for a selected loyalty program in a single, scannable comparison view.
- G2: Surface tier details across five structured categories: Basic details, Eligibility criteria, Renewal criteria, Downgrade criteria, and Benefits.
- G3: Show member counts per tier inline within the comparison view.
- G4: Provide navigation affordances for future tier creation and benefit creation flows.
- G5: Support an edit entry-point per tier column for future edit flows.

## Out of Scope

- OS-1: Tier creation flow (buttons will be rendered but will navigate to a future page). [RESOLVED by PM -- Q3]
- OS-2: Benefit creation flow (button will be rendered but will navigate to a future page). [RESOLVED by PM -- Q3]
- OS-3: Inline editing of tier details from this view (edit icon navigates to a separate page). [RESOLVED by PM -- Q6]
- OS-4: KPI summary bar / dashboard cards above the comparison table. [RESOLVED by PM -- Q1]
- OS-5: Status filters (Draft, Pending approval, Active, Deactivated/Stopped filter UI). [RESOLVED by Designer -- Q8]
- OS-6: RBAC / permission-based access gating for tier management. [RESOLVED by PM -- Q13]

## User Scenarios & Testing

### US-1: View all tiers for a loyalty program [P1]

**As a** marketer, **I want to** view all the tiers configured for the program along with their benefits, **so that** I can understand the full tier structure at a glance.

**Acceptance Criteria:**
- AC-1.1: When the user navigates to the tier listing page, a program-selector dropdown is visible and pre-populated with the current program.
- AC-1.2: All tiers for the selected program are displayed as columns in a side-by-side comparison table.
- AC-1.3: Each tier column shows the tier name, status badge (Active / Inactive), and member count.
- AC-1.4: Five horizontal tabs are available: "Basic details", "Eligibility criteria", "Renewal criteria", "Downgrade criteria", "Benefits".
- AC-1.5: Switching tabs updates the row data for all tier columns simultaneously.

### US-2: Compare tier details across categories [P1]

**As a** marketer, **I want to** switch between detail categories (basic details, eligibility, renewal, downgrade, benefits) **so that** I can compare specific attributes across all tiers.

**Acceptance Criteria:**
- AC-2.1: Clicking a tab shows the relevant rows for that category across all tier columns.
- AC-2.2: Row labels appear on the left side and remain fixed during horizontal scrolling.
- AC-2.3: The "Basic details" tab is the default active tab on page load. [INFERRED]

### US-3: Scroll horizontally when tiers exceed viewport width [P1]

**As a** marketer viewing a program with many tiers, **I want** the tier columns to scroll horizontally while the row labels stay fixed, **so that** I can still identify which attribute I am comparing.

**Acceptance Criteria:**
- AC-3.1: When tier columns exceed the viewport width, horizontal scrolling is enabled on the tier columns area. [RESOLVED by Designer -- Q9]
- AC-3.2: The left-side row labels column remains fixed and does not scroll horizontally. [RESOLVED by Designer -- Q9]

### US-4: View benefits linked to a tier [P1]

**As a** marketer, **I want to** see all benefits linked to each tier grouped by category, **so that** I can verify benefit assignments.

**Acceptance Criteria:**
- AC-4.1: Under the "Benefits" tab, benefit rows are displayed grouped by benefit category (e.g., Welcome Gift, Upgrade bonus points, Tier badge, etc.).
- AC-4.2: Each tier column shows its applicable benefits with relevant values or indicators.

### US-5: Navigate to tier creation [P2]

**As a** marketer, **I want to** click "Create tier" or "Create benefit" buttons, **so that** I can create new tiers or benefits when those flows become available.

**Acceptance Criteria:**
- AC-5.1: A "Create tier" button is rendered in the page header area as shown in Figma. [RESOLVED by PM -- Q3]
- AC-5.2: A "Create benefit" button is rendered in the page header area as shown in Figma. [RESOLVED by PM -- Q3]
- AC-5.3: Both buttons are clickable and will navigate to their respective creation pages when those pages are built. [RESOLVED by PM -- Q3]

### US-6: Navigate to tier edit [P2]

**As a** marketer, **I want to** click the edit icon on a tier column header, **so that** I can navigate to the edit page for that tier.

**Acceptance Criteria:**
- AC-6.1: Each tier column header displays an edit (pencil) icon. [RESOLVED by PM -- Q6]
- AC-6.2: Clicking the edit icon navigates to the tier-edit page (separate page, out of scope for this PRD). [RESOLVED by PM -- Q6]

## Functional Requirements

### Program Scoping

- **FR-1:** The page shall display a program-selector dropdown (as shown in Figma) allowing the user to select a loyalty program. Tier data is fetched and displayed for the selected program. [RESOLVED by PM -- Q4]
- **FR-2:** On program change, all tier columns and tab data shall refresh to reflect the newly selected program. [INFERRED]

### Comparison View Layout

- **FR-3:** The primary view shall be a columnar comparison layout where each tier is a column and each attribute is a row, matching the Figma design. No separate card-based listing page shall be built. [RESOLVED by PM -- Q2]
- **FR-4:** Five horizontal tabs shall segment the comparison data: "Basic details", "Eligibility criteria", "Renewal criteria", "Downgrade criteria", "Benefits". [RESOLVED by Designer -- Q5]
- **FR-5:** The left-side row labels column shall remain fixed; tier columns shall scroll horizontally when they exceed viewport width. [RESOLVED by Designer -- Q9]

### Tier Column Data

- **FR-6:** Each tier column header shall display: Tier Name, Status badge (Active or Inactive), and Member count (e.g., "Members (Total - 280.2k)"). [RESOLVED by PM -- Q7]
- **FR-7:** Tier statuses shall be "Active" and "Inactive" as shown in Figma. [RESOLVED by PM -- Q7]
- **FR-8:** Each tier column header shall include an edit (pencil) icon that navigates to the tier-edit page. [RESOLVED by PM -- Q6]

### Tab: Basic Details

- **FR-9:** The "Basic details" tab shall display rows for: Tier Name, Tier Description, Tier Status, Number of Members, and Duration (mapped from PRD's "Membership duration"). [DERIVED]

### Tab: Eligibility Criteria

- **FR-10:** The "Eligibility criteria" tab shall display rows for: Type, Activities, Duration, Upgrade Schedule, and Nudges/Communication. This maps the PRD's "Eligibility criteria", "Upgrade condition", "Upgrade schedule", and "Nudges/communication" into the Figma tab structure. [RESOLVED by PM -- Q10]

### Tab: Renewal Criteria

- **FR-11:** The "Renewal criteria" tab shall display rows for: Renewal Condition, Renewal Schedule, Renewal Duration, and Nudges/Communication. [DERIVED from PRD]

### Tab: Downgrade Criteria

- **FR-12:** The "Downgrade criteria" tab shall display rows for: Downgrade to which tier, Downgrade Schedule, and Nudges/Communication/Expiry Reminders. [DERIVED from PRD]

### Tab: Benefits

- **FR-13:** The "Benefits" tab shall display benefit rows grouped by category, showing all benefits linked to each tier. Benefit categories include (as shown in Figma): Welcome Gift, Upgrade bonus points, Tier badge, Renewal Bonus, Loyalty Voucher, Earn Points, Priority Support, Free Shipping, VIP Events, Birthday Bonus, Exclusive Comms. [DERIVED from PRD + Figma]

### Action Buttons

- **FR-14:** A "Create tier" button shall be rendered in the page header. Clicking it shall navigate to the tier creation page (future page). [RESOLVED by PM -- Q3]
- **FR-15:** A "Create benefit" button shall be rendered in the page header. Clicking it shall navigate to the benefit creation page (future page). [RESOLVED by PM -- Q3]

### KPI Display

- **FR-16:** No dedicated KPI summary bar shall be rendered. Aggregated member count shall be shown inline per-tier within the comparison table, following the Figma design. [RESOLVED by PM -- Q1]

### API Data

- **FR-17:** Tier listing, tier details (including eligibility/renewal/downgrade criteria), and tier benefits data shall be retrieved from the backend API. The assumed payload structure follows the data visible in Figma. [RESOLVED by BE -- Q11]
- **FR-18:** Tier benefit data shall be returned as part of the same API call as tier details (not a separate endpoint). [RESOLVED by BE -- Q12]

### Architecture

- **FR-19:** The tier listing page shall be a new route within the existing garuda-ui application (e.g., `/tiers/list`), following existing Redux patterns and atomic design conventions. [RESOLVED by Tech Lead -- Q14]

### Access Control

- **FR-20:** No RBAC restrictions shall be applied to the tier listing page. All authenticated users can access it. [RESOLVED by PM -- Q13]

### Status Filters

- **FR-21:** No status filter UI (Draft, Pending approval, Active, Deactivated/Stopped) shall be built on this page. [RESOLVED by Designer -- Q8]

## Key Entities

| Entity | Description |
|--------|-------------|
| Program | A loyalty program; tiers are scoped to a single program |
| Tier | A level within a loyalty program with name, description, status (Active/Inactive), and member count |
| Eligibility Criteria | Rules for tier upgrade: type, activities, duration, upgrade schedule, nudges |
| Renewal Criteria | Rules for tier renewal: condition, schedule, duration, nudges |
| Downgrade Criteria | Rules for tier downgrade: target tier, schedule, nudges/expiry reminders |
| Benefit | A reward or perk linked to a tier, grouped by category |
| Benefit Category | A grouping label for benefits (e.g., Welcome Gift, Tier badge, Free Shipping) |

## Success Criteria

- SC-1: A marketer can view all tiers for a selected program in under 3 seconds of page load. [DERIVED]
- SC-2: All five detail tabs are navigable and display the correct tier data without full page reload. [DERIVED]
- SC-3: Horizontal scrolling works smoothly with 5+ tier columns while row labels remain fixed. [DERIVED]
- SC-4: 100% of tier data fields listed in the PRD are visible across the five tabs. [DERIVED]
- SC-5: "Create tier" and "Create benefit" buttons are visible and functional (navigation) on page load. [DERIVED]

## Design Reference

- **Figma:** https://www.figma.com/design/Q3rZlYt8ZY6g0TuVg1TZzm/Mohit-list?node-id=32-3147&m=dev
  - fileKey: Q3rZlYt8ZY6g0TuVg1TZzm
  - nodeId: 32:3147
- **Figma artifacts cached at:** `claudeOutput/figma-capui-mapping/32-3147/`

## Dependencies

- D-1: Backend API endpoints for tier listing, tier details, and benefits must be available. API contract is currently assumed based on Figma payload structure. [RESOLVED by BE -- Q11]
- D-2: The tier-edit page and tier-creation page are separate features that must be built for the edit icon and create buttons to have functional destinations.
- D-3: Existing garuda-ui routing infrastructure must support adding a new `/tiers/list` route. [RESOLVED by Tech Lead -- Q14]

## Assumptions

- A-1: The program-selector dropdown on this page is the sole mechanism for selecting which program's tiers to display (no inherited global context). [INFERRED]
- A-2: The API returns all tiers for a program in a single response (no pagination of tiers). [INFERRED]
- A-3: Benefit data is included in the tier detail API response rather than requiring a separate call. [RESOLVED by BE -- Q12]
- A-4: The "Basic details" tab is the default tab shown on page load. [INFERRED]
- A-5: The exact API endpoint paths are not yet finalized; development will use assumed payloads matching the Figma data until the BE team provides the formal API contract. [INFERRED from Q11 answer]
- A-6: "Inactive" in Figma is the only non-Active status to support in the UI at this time; Draft and Pending approval statuses from the original PRD are deferred. [RESOLVED by PM -- Q7]

## Resolved Clarifications

| Q# | Category | Decision (1 line) | Applied to |
|----|----------|-------------------|------------|
| Q1 | Design | No KPI summary bar; follow Figma with inline member counts | FR-16, OS-4 |
| Q2 | Design | Columnar comparison view is the primary view; no card-based listing | FR-3 |
| Q3 | Design | Render "Create tier" and "Create benefit" buttons; they navigate to future pages | FR-14, FR-15, OS-1, OS-2, US-5 |
| Q4 | Design | Tier data is scoped to a single program via a page-level dropdown | FR-1, FR-2 |
| Q5 | Design | Follow Figma five-tab structure; map PRD fields into those tabs | FR-4 |
| Q6 | Design | Each tier column header has an edit icon navigating to tier-edit page | FR-8, US-6, OS-3 |
| Q7 | Design | Use Active/Inactive statuses per Figma; defer Draft and Pending approval | FR-6, FR-7, A-6 |
| Q8 | Spec Gap | No status filter UI to be built | FR-21, OS-5 |
| Q9 | Spec Gap | Horizontal scroll on tier columns; left row labels fixed | FR-5, US-3 |
| Q10 | Spec Gap | "Upgrade condition" merged into Eligibility criteria tab per Figma | FR-10 |
| Q11 | Backend | API endpoints assumed from Figma payload; BE to provide formal contract | FR-17, D-1 |
| Q12 | Backend | Benefit data returned with the same API call as tier details | FR-18, A-3 |
| Q13 | Rules | No RBAC; all authenticated users can access the page | FR-20, OS-6 |
| Q14 | Architecture | New route inside garuda-ui (e.g., `/tiers/list`) following existing patterns | FR-19, D-3 |
