# 03. HOC Decision Framework

**Status**: aligned — consistent HOC pattern across the codebase

## HOC Inventory

| HOC | Source | Files |
|-----|--------|-------|
| compose | redux | 53 |
| connect | react-redux | 64 |
| withStyles | vulcan-react-sdk | 149 |
| injectIntl | react-intl | 185 |
| injectSaga | local utils | 35 |
| injectReducer | local utils | 35 |
| withMemo | app/hoc/withMemo.js | 40 |
| withErrorBoundary | app/utils/withErrorBoundary.js | 39 |
| withRouter | react-router | in compose chains |

## Rules

### Rule 1: Standard compose chain order

`compose(withStyles(styles), injectReducer({...}), injectSaga({...}), connect(...), injectIntl)(withMemo(Component))`

**Why**: 53 files follow this exact compose pattern. Consistent ordering makes code predictable.

### Rule 2: Use `withStyles` for styling injection

NOT inline styled-components.

**Why**: 149 files use withStyles. It integrates with the vulcan SDK build pipeline.

### Rule 2b: Forward `className` when using `withStyles`

Any component wrapped with `withStyles(Component, styles)` MUST destructure `className` from props and apply it to the root DOM element (e.g., `` <div className={`my-class ${className}`}> ``). Also declare `className: PropTypes.string` in propTypes and `className: ''` in defaultProps.

**Why**: `withStyles` uses `styled(WrappedComponent)` internally, which injects a `className` prop containing the generated CSS class. If the component does not forward this `className` to a DOM element, **none of the CSS in `styles.js` will take effect** — all styles silently fail. Every existing page component follows this pattern (e.g., PromotionList destructures `className` and applies it to the root `<CapRow>`).

### Rule 3: Use `injectSaga` / `injectReducer` for dynamic injection

At page/organism level for code splitting.

**Why**: 35 files pair these. Constitution Principle V requires feature isolation.

### Rule 4: Use `withErrorBoundary` for organisms and pages

**Why**: 39 files wrap with error boundaries. Prevents cascading failures.

### Rule 5: Use `withMemo` for presentational components

Custom React.memo wrapper from `app/hoc/withMemo.js`.

**Why**: 40 files use withMemo. It excludes intl prop from equality check and logs changed props in dev.

## Good Examples

### PromotionMetadata — Standard compose chain

**File**: `app/components/organisms/PromotionMetadata/PromotionMetadata.js`

```javascript
import { injectReducer, withStyles } from '@capillarytech/vulcan-react-sdk/utils';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import injectSaga from '../../../utils/injectSaga';

export default compose(
  withStyles(styles),
  injectReducer({ key: REDUCER_KEY, reducer }),
  injectSaga({ key: SAGA_KEY, saga }),
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
  withMemo,
  withErrorBoundary,
)(PromotionMetadata);
```

Complete HOC chain with styling, dynamic injection, state, i18n, memo, and error boundary.

## Decision Tree

- Cross-cutting concern (styling, i18n, error boundary) -> use existing HOC
- Feature-level async/state -> injectSaga + injectReducer
- Memoization -> withMemo (not raw React.memo)
- Local component state -> hooks (useState, useEffect)

## Flagged Files

No files flagged (status aligned).
