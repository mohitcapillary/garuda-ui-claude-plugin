# 15. Import & Folder Conventions

**Status**: violations — 162 files with 4+ level deep relative imports

## Import Depth Stats

| Depth | Files |
|-------|-------|
| 4+ levels (../../../../) | 162 |
| 3 levels (../../..) | 250+ |
| Barrel files in atoms | 34/35 |
| Barrel files in molecules | 76/80 |

## Rules

### Rule 1: Prefer webpack alias imports over deep relative paths

Avoid `../../../../`.

**Why**: 162 files use 4+ levels of relative imports. This is fragile and hard to read. Webpack aliases exist for utils/ and services/.

### Rule 2: Each component directory should have a barrel `index.js`

**Why**: 34/35 atoms and 76/80 molecules have barrel files. Enables clean imports.

### Rule 3: Import ordering — cap-ui-library first, then SDK, then local

**Why**: Consistent ordering improves readability and makes dependencies clear.

### Rule 4: One component per file

**Why**: 180+ components follow this convention. Single responsibility per file.

## Good Examples

### Clean import ordering

```javascript
// Cap-ui-library imports first
import { CapInput, CapButton, CapRow } from '@capillarytech/cap-ui-library';
// SDK imports second
import { withStyles } from '@capillarytech/vulcan-react-sdk/utils';
// Local imports last
import { actionTypes } from './constants';
import { selectFormData } from './selectors';
```

## Bad Examples

### Deep relative imports

**File**: `app/components/organisms/SingleActivity/ActionDependencies/saga.js`

```javascript
import * as Api from '../../../../services/api';
import { actionTypes } from '../../../../components/pages/App/constants';
import { selectOrgId } from '../../../../components/pages/Cap/selectors';
```

**Issue**: 4+ levels of relative paths are fragile and hard to navigate.

**Fix**: Use webpack alias:

```javascript
import * as Api from 'services/api';
import { actionTypes } from 'components/pages/App/constants';
```

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| 162 files with ../../../../ | Deep relative imports | Use webpack aliases |
| `app/components/organisms/SingleActivity/ActionDependencies/saga.js` | 4+ level imports | Use aliases |
| `app/components/pages/Cap/Cap.js` | 4+ level imports | Use aliases |

(162 files flagged -- re-run agent for full list)
