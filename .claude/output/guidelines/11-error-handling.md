# 11. Error Handling

**Status**: warnings — 39 files use withErrorBoundary, 31/31 sagas have try/catch, 17 console.error files

## Error Handling Infrastructure

| Component | Path | Purpose |
|-----------|------|---------|
| withErrorBoundary | `app/utils/withErrorBoundary.js` | HOC wrapper |
| ErrorBoundaryWrapper | `app/components/molecules/ErrorBoundaryWrapper/` | Reusable fallback UI |
| ErrorBoundary | `app/components/organisms/ErrorBoundary/` | Production-aware with Bugsnag |

## Rules

### Rule 1: Organisms and pages MUST use `withErrorBoundary` HOC

**Why**: 39 files already wrap with withErrorBoundary. Prevents cascading failures from crashing the app.

### Rule 2: All sagas MUST have `try/catch` with error action dispatch

**Why**: 31/31 saga files follow this pattern. Unhandled saga errors crash the middleware.

### Rule 3: No `console.error` in production code

Use error boundaries or saga error handling instead.

**Why**: 17 files use console.error. Production errors should go through Bugsnag via ErrorBoundary organism.

### Rule 4: Use `CapSomethingWentWrong` or `CapError` for error UI

**Why**: These cap-ui-library components provide consistent error UI.

## Good Examples

### Saga with try/catch

**File**: `app/components/pages/PromotionList/saga.js`

```javascript
function* fetchPromotionsList(action) {
  try {
    const response = yield call(Api.getPromotionsList, action.payload);
    yield put({ type: actionTypes.GET_PROMOTIONS_LIST_SUCCESS, data: response });
  } catch (error) {
    yield put({ type: actionTypes.GET_PROMOTIONS_LIST_FAILURE, error });
  }
}
```

All API calls wrapped in try/catch with error action dispatch.

### withErrorBoundary in compose

**File**: `app/components/organisms/GroupActivity/GroupActivity.js`

```javascript
export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
  withMemo,
  withErrorBoundary,
)(GroupActivity);
```

Error boundary as last HOC in the compose chain.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/services/requestConstructor.js` | console.error | Use proper error logging service |
| `app/utils/GTM/pushToGTM.js` | console.error | Use error boundary or silent fail |
| `app/components/organisms/AnalyticsDrawer/saga.js` | console.error in saga | Remove -- try/catch handles errors |
| 14 more files | console.error in production code | Replace with error boundary or remove |

(17 files flagged)
