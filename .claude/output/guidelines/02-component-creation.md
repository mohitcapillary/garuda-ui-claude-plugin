# 02. Component Creation

**Status**: aligned — 227/227 component files compliant

## Rules

### Rule 1: All components MUST be functional

No class components.

**Why**: The codebase has zero class components. Functional components with hooks are the standard.

### Rule 2: All components MUST define `.propTypes`

**Why**: 227 files define PropTypes. This is the only type safety mechanism (no TypeScript).

### Rule 3: Use `Cap-*` components from cap-ui-library instead of raw HTML

**Why**: Constitution Principle I requires Cap-* pattern components. 120 components are available.

### Rule 4: One component per file with default export

**Why**: Consistent file structure across 180+ components enables predictable imports.

### Rule 5: Use `CapSlideBox` for slide-out panels — never `CapDrawer`

`CapSlideBox` is the garuda-ui component wired into the shell layout. `CapDrawer` (raw Ant Design) has no layout integration and renders as a sliver.

```jsx
// ✅ CORRECT
<CapSlideBox
  show={visible}
  placement="right"
  size="size-m"
  handleClose={onClose}
  header="Filter"
  content={<FilterBody />}
  footer={<FooterButtons />}
/>

// ❌ WRONG — CapDrawer is not integrated with the garuda-ui shell
<CapDrawer visible={visible} placement="right" width={440}>
  ...
</CapDrawer>
```

**Why**: Discovered during BenefitsListing codegen — `CapDrawer` rendered as a ~115px sliver with no content visible because it has no shell layout integration.

### Rule 6: Popup-based Cap components inside `CapSlideBox` must have `getPopupContainer`

Any component that renders a dropdown/popup (`CapMultiSelect`, `CapSelect`, `CapDateRangePicker`, etc.) used inside `CapSlideBox` must include:

```jsx
getPopupContainer={(trigger) => trigger.parentElement}
```

Without it, Ant Design appends the popup to `document.body`, which can render behind the panel overlay.

### Rule 7: `CapMultiSelect` callback is `onSelect`, not `onChange`

**Why**: `CapMultiSelect` exposes `onSelect` as its selection callback. `onChange` is not a documented prop and produces no error — the handler simply never fires.

### Rule 8: New page components must apply standard horizontal padding

**Applies only when creating a new page** — do not retrofit existing pages.

| Page type | Property | Value | Applied on |
|-----------|----------|-------|------------|
| Listing (`*List`, `*Listing`) | `padding` | `CAP_SPACE_20 CAP_SPACE_72 0 CAP_SPACE_72` | Root content `div` |
| Config / Create / Edit | `margin` | `CAP_SPACE_24 CAP_SPACE_72` | Inner `CapRow` wrapper |

```jsx
// ✅ Listing page root content
.my-listing-page {
  padding: ${CAP_SPACE_20} ${CAP_SPACE_72} 0 ${CAP_SPACE_72};
}

// ✅ Config/Edit page inner wrapper
.my-config-wrapper {
  margin: ${CAP_SPACE_24} ${CAP_SPACE_72};
}
```

**Why**: Figma artboards do not encode outer page padding — designers assume the page component adds it. Without an explicit rule, codegen omits it. Discovered missing in BenefitsListing first-gen.

### Rule 9: `CapTable` must use infinite scroll by default

Unless the PRD/HLD explicitly requires pagination, always render `CapTable` with `infinteScroll={true}` (⚠️ cap-ui-library typo — missing 'i'). Required companion props:

```jsx
<CapTable
  dataSource={data}
  columns={columns}
  infinteScroll={true}           // ⚠️ typo is intentional — matches cap-ui-library prop name
  showLoader={isLoading}
  pagination={pagination}        // { page, size, totalElements }
  setPagination={onPaginationChange}
  loadMoreData={formatMessage(messages.loadMore)}
  scroll={{ x: 'max-content' }}
/>
```

**Why**: Garuda-ui listing pages use infinite scroll as the standard UX pattern (see `PromotionsListingTable`). Paginated mode is only used when explicitly required by product spec.

```jsx
// ✅ CORRECT
<CapMultiSelect onSelect={(values) => handleChange(values)} />

// ❌ WRONG — onChange is silently ignored
<CapMultiSelect onChange={(values) => handleChange(values)} />
```

**Why**: `CapMultiSelect` exposes `onSelect` as its selection callback. `onChange` is not a documented prop and produces no error — the handler simply never fires.

## Good Examples

### FiltersApplied

**File**: `app/components/molecules/FiltersApplied/FiltersApplied.js`

```javascript
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CapTag, CapIcon } from '@capillarytech/cap-ui-library';

const FiltersApplied = ({ filters, onRemove, formatMessage }) => {
  const activeFilters = useMemo(() => filters.filter(f => f.active), [filters]);

  return (
    <div className="filters-applied">
      {activeFilters.map(filter => (
        <CapTag key={filter.id} closable onClose={() => onRemove(filter.id)}>
          {filter.label}
        </CapTag>
      ))}
    </div>
  );
};

FiltersApplied.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool,
  })).isRequired,
  onRemove: PropTypes.func.isRequired,
  formatMessage: PropTypes.func.isRequired,
};

export default FiltersApplied;
```

Functional component with PropTypes, using Cap-* components, single default export.

## Flagged Files

No files flagged (status aligned).
