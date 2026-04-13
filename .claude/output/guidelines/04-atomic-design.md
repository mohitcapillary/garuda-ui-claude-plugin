# 04. Atomic Design

**Status**: violations — atoms have upward dependencies, 65 molecules import from organisms

## Component Counts

| Layer | Directories | JS Files |
|-------|------------|----------|
| atoms | 35 | 136 |
| molecules | 80 | 430 |
| organisms | 60 | 644 |
| pages | 10 | 91 |
| templates | 1 | 2 |

## Rules

### Rule 1: Atoms have ZERO local component dependencies

Only cap-ui-library imports allowed.

**Why**: Atoms are base building blocks. Importing from molecules/organisms creates circular dependencies and breaks the hierarchy.

### Rule 2: Molecules compose atoms only

May NOT import from organisms.

**Why**: Molecules sit above atoms but below organisms. Importing upward breaks the dependency hierarchy.

### Rule 3: Organisms compose molecules and atoms

**Why**: Organisms are complex UI sections built from simpler pieces.

### Rule 4: Pages are route-level containers with dynamic saga/reducer injection

**Why**: 35 files use injectSaga/injectReducer for code splitting per Constitution Principle V.

## Good Examples

### StatCard — Clean atom

**File**: `app/components/atoms/StatCard/StatCard.js`

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { CapCard, CapHeading } from '@capillarytech/cap-ui-library';

const StatCard = ({ title, value }) => (
  <CapCard>
    <CapHeading type="h4">{title}</CapHeading>
    <CapHeading type="h2">{value}</CapHeading>
  </CapCard>
);
```

Atom uses only cap-ui-library components, zero local dependencies.

## Bad Examples

### BrandAction — Atom importing from molecules AND organisms

**File**: `app/components/atoms/BrandAction/BrandAction.js:14`

```javascript
import ActionDependencyDescription from '../../molecules/ActionDependencyDescription';
import {
  BADGE_EARN_ACTION,
  PE_ISSUE_VOUCHER_ACTION,
} from '../../molecules/BrandActionContainer/constants';
import issueCurrencyWorkflowActionMessages from '../../organisms/IssueCurrencyWorkflowAction/messages';
import { TIER_ACTIONS } from '../../organisms/ManageTierWorkflowActions/constants';
```

**Issue**: Atom imports from both molecules and organisms, breaking the atomic hierarchy.

**Fix**: Move BrandAction to molecules/ or extract shared constants to `app/utils/actionConstants.js`.

### BrandAction/utils.js — Atom utility importing from organisms

**File**: `app/components/atoms/BrandAction/utils.js:1`

```javascript
import { TIER_ACTIONS } from '../../organisms/ManageTierWorkflowActions/constants';
import { USER_GROUP_LIST_VALUE_MAP } from '../../pages/App/constants';
import globalMessages from '../../pages/Cap/messages';
```

**Issue**: Utility in atoms/ depends on organisms/ and pages/.

**Fix**: Move shared constants to `app/utils/` or `app/constants/`.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/atoms/BrandAction/BrandAction.js` | imports from molecules + organisms | Move to molecules/ or extract constants |
| `app/components/atoms/BrandAction/utils.js` | imports from organisms + pages | Move constants to app/utils/ |
| `app/components/atoms/RewardCatalogTooltip/RewardCatalogTooltip.js` | imports from organisms | Move to molecules/ |
| 65 molecule files import from organisms/ | upward dependency | Extract shared code to app/utils/ |

(68 files flagged -- re-run agent for full molecule violation list)
