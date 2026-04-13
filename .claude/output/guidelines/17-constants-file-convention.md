# 17. Constants File Convention

**Status**: aligned across `app/components/pages/*` — new guideline to enforce for molecules and organisms too.

## Rules

### Rule 1: Co-locate runtime constants in `constants.js`

Every component directory that owns enums, string sentinels, numeric limits, option lists, action types, or other runtime values **MUST** put them in a sibling `constants.js` file.

**Why**: This matches the canonical pattern used across `app/components/pages/` (e.g., `PromotionList/constants.js`, `PromotionConfig/constants.js`). It keeps the component file focused on rendering + behaviour, makes constants independently testable and importable, and — critically — avoids a subtle module-export trap described in Rule 3.

### Rule 2: Component files export the component only

`Component.js` (the PascalCase file inside the component directory) **MUST** expose exactly one export: `export default ...`. No `export const`, no `export { Foo }`, no `export function ...` besides the component itself.

**Why**: Callers reach the component through the barrel `index.js`, which by convention only forwards the default (`export { default } from './Component';`). Any named export on `Component.js` is invisible to consumers that use the barrel path, so they silently resolve to `undefined` at runtime. Using `constants.js` routes consumers around the barrel for non-component values and makes the API explicit.

### Rule 3: Consumers import constants directly from `constants.js`

To use an enum or constant exported by another component, import it from the explicit `constants` path, not from the component barrel.

```javascript
// Correct
import FooModal from 'components/molecules/FooModal';
import { MODE, ENTITY_TYPE } from 'components/molecules/FooModal/constants';

// Wrong — the barrel does not forward named exports
import FooModal, { MODE, ENTITY_TYPE } from 'components/molecules/FooModal';
```

### Rule 4: What counts as "a constant"

Put in `constants.js`:
- Enum-style object literals (`MODE`, `STATUS`, `ENTITY_TYPE`, …).
- Action type constants / `defineActionTypes` output.
- Numeric limits, default paginations, debounce durations.
- Fixed option lists consumed by more than one place.
- Route paths, query param names.

Stay inside `Component.js`:
- Component-local helpers (pure functions used once by the render).
- Single-use JSX fragments.
- `PropTypes` shapes used only by this component (these live next to the component).

## Good Example

```
app/components/molecules/FooModal/
├── index.js              // export { default } from './FooModal';
├── FooModal.js           // export default withStyles(injectIntl(FooModal), styles);
├── constants.js          // export const MODE = {...};  export const ENTITY_TYPE = {...};
├── styles.js
└── messages.js
```

`PromotionList/constants.js`:
```javascript
import { defineActionTypes } from '@capillarytech/vulcan-react-sdk/utils';

const scope = '/Components/pages/PromotionList/';

export const actionTypes = defineActionTypes({ /* ... */ }, { prefix: CURRENT_APP_NAME, scope });
export const DEFAULT_PAGINATION = { page: 0, size: 10 };
export const filterTypes = { DURATION: 'duration', /* ... */ };
```

## Bad Example

```javascript
// Component.js — violates Rules 1 & 2
const MODE = { CREATE: 'create', EDIT: 'edit' };   // should live in constants.js
const MAX_LENGTH = 255;                            // should live in constants.js

const FooModal = (/* ... */) => { /* ... */ };

export { MODE };                                   // invisible through the barrel
export default withStyles(injectIntl(FooModal));
```

This breaks at runtime whenever a consumer imports `{ MODE }` through the barrel — `MODE` resolves to `undefined`.

## Enforcement checks

1. In every new component folder, `constants.js` exists whenever the component declares any non-component constant.
2. `Component.js` contains no `export const`, `export function`, `export class`, or `export { ... }` (the default export is the only export).
3. Consumers import constants from `<path>/constants`, not from the component barrel.
