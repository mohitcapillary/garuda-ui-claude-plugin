# 10. Performance

**Status**: warnings — 5/8 pages have Loadable.js (62%)

## Performance Patterns in Use

| Pattern | Files |
|---------|-------|
| useMemo | 91 |
| useCallback | 55 |
| withMemo | 40 |
| React.memo direct | 6 |
| React.lazy/Loadable | 30 |
| createStructuredSelector | 63 |

## Rules

### Rule 1: Route-level pages MUST have a `Loadable.js`

For code splitting via React.lazy + Suspense.

**Why**: 5 of 8 pages have Loadable.js. Missing lazy loading increases initial bundle size.

### Rule 2: Use `withMemo` for presentational components

Custom React.memo wrapper from `app/hoc/withMemo.js`.

**Why**: 40 files use withMemo. It excludes intl prop from equality check and logs changed props in dev mode.

### Rule 3: Use `useMemo` / `useCallback` for expensive computations and stable callbacks

**Why**: 91 files use useMemo, 55 use useCallback. Prevents unnecessary child re-renders.

### Rule 4: Use `createStructuredSelector` for memoized Redux selectors

**Why**: 63 files use this. Prevents selector recomputation on unrelated state changes.

### Rule 5: Prefer `withMemo` HOC over direct `React.memo`

**Why**: withMemo handles intl prop exclusion automatically. 40 files use withMemo vs 6 using React.memo directly.

### Rule 6: Never suppress `react-hooks/exhaustive-deps` with eslint-disable comments

Fill the `useEffect` dependency array correctly. Never use `// eslint-disable-line react-hooks/exhaustive-deps` or `// eslint-disable-next-line react-hooks/exhaustive-deps` as an escape hatch.

```js
// wrong — suppresses a real stale-closure warning:
useEffect(() => {
  fetchData(userId);
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// correct option A — include deps:
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]);

// correct option B — intentional mount-only with explicit comment explaining why:
useEffect(() => {
  pageActions.getTiersRequest(initialProgramId);
}, []); // intentional: runs once on mount — initialProgramId is captured at mount time
```

**Why**: The exhaustive-deps rule exists to catch stale closures — bugs where an effect reads an outdated value. Suppressing it hides real bugs. If the effect genuinely needs to run only once, document why with an inline comment, not an eslint-disable.

## Good Examples

### Loadable.js — Code splitting pattern

**File**: `app/components/pages/PromotionList/Loadable.js`

```javascript
import React, { lazy, Suspense } from 'react';
import { CapSpin } from '@capillarytech/cap-ui-library';

const PromotionList = lazy(() => import('./PromotionList'));

export default function LoadablePromotionList(props) {
  return (
    <Suspense fallback={<CapSpin />}>
      <PromotionList {...props} />
    </Suspense>
  );
}
```

Lazy-loaded with CapSpin fallback.

### withMemo in compose chain

**File**: `app/components/organisms/SingleActivity/SingleActivity.js`

```javascript
export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
  withMemo,
)(SingleActivity);
```

withMemo wraps the component with smart equality comparison.

## Bad Examples

### Pages missing Loadable.js

```
app/components/pages/NotFoundPage/     -- no Loadable.js
app/components/pages/RedirectToLoginPage/ -- no Loadable.js
```

**Issue**: These pages are not code-split, increasing initial bundle size.

**Fix**: Add Loadable.js following the pattern above.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/pages/NotFoundPage/` | Missing Loadable.js | Add Loadable.js with React.lazy |
| `app/components/pages/RedirectToLoginPage/` | Missing Loadable.js | Add Loadable.js with React.lazy |

(2 files flagged -- App/index.js is root router, exempt)
