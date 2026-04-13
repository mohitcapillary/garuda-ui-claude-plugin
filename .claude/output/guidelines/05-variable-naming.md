# 05. Variable & File Naming

**Status**: aligned — 63/63 constants files follow naming conventions

## Rules

### Rule 1: Action types use `defineActionTypes()` with UPPER_SNAKE_CASE keys

From `@capillarytech/vulcan-react-sdk/utils`.

**Why**: 63 constants files use this pattern. It namespaces actions with app prefix + scope automatically.

### Rule 2: Selectors use camelCase with `select` or `make` prefix

E.g., `selectPromotionList`, `makeSelectOrgId`.

**Why**: Consistent selector naming across 63+ selector files aids discoverability.

### Rule 3: Component files use PascalCase matching component name

E.g., `PromotionMetadata.js` exports `PromotionMetadata`.

**Why**: 180+ components follow this convention. One file = one component = matching name.

### Rule 4: Style files named `styles.js` or `style.js` in same directory

**Why**: 157 style files follow this co-located pattern.

### Rule 5: Use cap-ui-library token variable names exactly as exported

E.g., `CAP_G01` not `darkNavy`.

**Why**: 163 files import tokens by their original names. Custom aliases create confusion.

## Good Examples

### PromotionList/constants.js — Action types

**File**: `app/components/pages/PromotionList/constants.js`

```javascript
import { defineActionTypes } from '@capillarytech/vulcan-react-sdk/utils';

const scope = '/Components/pages/PromotionList/';

export const actionTypes = defineActionTypes(
  {
    DEFAULT_ACTION: 'DEFAULT_ACTION',
    CLEAR_DATA: 'CLEAR_DATA',
    GET_PROMOTIONS_LIST_REQUEST: 'GET_PROMOTIONS_LIST_REQUEST',
    GET_PROMOTIONS_LIST_SUCCESS: 'GET_PROMOTIONS_LIST_SUCCESS',
    GET_PROMOTIONS_LIST_FAILURE: 'GET_PROMOTIONS_LIST_FAILURE',
  },
  { prefix: CURRENT_APP_NAME, scope },
);
```

UPPER_SNAKE_CASE keys with REQUEST/SUCCESS/FAILURE suffix pattern.

## Flagged Files

No files flagged (status aligned).
