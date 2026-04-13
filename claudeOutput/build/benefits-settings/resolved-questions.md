# Resolved Questions — Benefits Settings

## Phase 1 Gate Resolution

### Q2: Feature Flag
**Question**: Does the Benefits Settings page require a feature flag similar to isLoyaltyPromotionsV2Enabled?
**User Answer (2026-04-13)**: (a) No feature flag — generate `Loadable.js` with just `withCustomAuthAndTranslations(BenefitsSettingsLoadable)`.
**Resolution**: `Loadable.js` wraps the loadable component with `withCustomAuthAndTranslations` only. No `isEnabled` guard HOC.
**Status**: resolved

### Q4: RBAC/Permissions
**Question**: Does the page inherit RBAC/permission checks for Benefits Settings CRUD operations?
**User Answer (2026-04-13)**: (a) No permission wrapping — generate CTAs as plain `CapButton` elements. No `PermissionWrapper` needed.
**Resolution**: All CTA buttons (New custom field, New category, edit icon, delete icon) rendered as plain `CapButton`. No `PermissionWrapper` HOC applied.
**Status**: resolved

## Phase 2 / Route-vs-Shell Check

### Q3: Settings sidebar shell coupling
**Question**: Does the route `/settings/benefits` inherit the Cap shell sidebar automatically, or does the page need to own the sidebar?
**Resolution**: Route starts with `/settings/` which is the Cap shell's settings pattern. The shell provides the sidebar. The page component does NOT need to emit `CapSideBar` in its own JSX. The Figma shows a CapSideBar which is rendered by the shell — the page only renders the main content panel.
**Status**: resolved (automatic, per Phase 2.4 route check)

## Deferred Questions (logged as open items, will not block generation)

### Q1: Actual API Endpoints
All 8 API contracts are ASSUMED. Mocks will be generated. Flag: `USE_MOCK_BENEFITS_SETTINGS = true`.

### Q5: Sort mechanism (server-side vs client-side)
Architecture assumes server-side sort (re-dispatch GET with new sortOrder).

### Q6: Custom Field create/edit modal Figma frame
Only the category creation modal is visible in node 24-2729. Custom field modal is spec-derived.

### Q7: updatedBy display name
Architecture assumes display name is returned directly in API response.

### Q8: Maximum custom fields / categories per program
No limit assumed; unlimited list without pagination.
