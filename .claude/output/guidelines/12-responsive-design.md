# 12. Responsive Design

**Status**: aligned — 0 @media queries, Cap layout system used exclusively

## Rules

### Rule 1: Use `CapRow` / `CapColumn` for responsive layouts

**Why**: Zero @media queries exist. The codebase relies entirely on Cap layout components.

### Rule 2: No fixed pixel widths on container elements

**Why**: Only 6 files have fixed px widths -- these are exceptions, not the norm.

### Rule 3: Use `@media` queries sparingly

Prefer cap-ui-library layout components.

**Why**: The codebase has achieved zero media query usage.

### Rule 4: No breakpoint tokens exist in cap-ui-library

If media queries are needed, define project-level breakpoints.

**Why**: styled/variables.js contains no breakpoint definitions.

## Good Examples

### Cap layout usage

```javascript
import { CapRow, CapColumn } from '@capillarytech/cap-ui-library';

const Layout = ({ children, sidebar }) => (
  <CapRow>
    <CapColumn span={6}>{sidebar}</CapColumn>
    <CapColumn span={18}>{children}</CapColumn>
  </CapRow>
);
```

Responsive grid layout using Cap components.

## Bad Examples

### PromotionAdvancedSettings — Fixed pixel widths

**File**: `app/components/organisms/PromotionAdvancedSettings/style.js`

```javascript
.component-with-label {
  width: 132px;
}
.promotion-external-identifier-input {
  width: 324px;
}
```

**Issue**: Fixed pixel widths break on different screen sizes.

**Fix**: Use percentage, flex, or CapColumn span for sizing.

### Creatives — Hardcoded dimensions with !important

**File**: `app/components/organisms/Creatives/style.js`

```javascript
.ant-card-body {
  width: 276px !important;
  height: 140px !important;
}
```

**Issue**: Fixed dimensions with !important are inflexible.

**Fix**: Use max-width or responsive approach.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/organisms/PromotionAdvancedSettings/style.js` | Fixed px widths | Use percentage or CapColumn |
| `app/components/organisms/Creatives/style.js` | 276px, 140px with !important | Use max-width |
| `app/components/organisms/IssuePromotionWorkflowAction/style.js` | Fixed widths | Use flexible sizing |
| `app/components/organisms/IssueCurrencyWorkflowAction/style.js` | Fixed widths | Use flexible sizing |
| `app/components/organisms/IssueBadgeWorkflowAction/style.js` | Fixed widths | Use flexible sizing |
| `app/components/organisms/ExpiryConditions/style.js` | Fixed widths | Use flexible sizing |

(6 files flagged)
