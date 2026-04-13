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
