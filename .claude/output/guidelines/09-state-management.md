# 09. State Management

**Status**: aligned — 0 direct API calls in components, 31 saga files with proper patterns

## Rules

### Rule 1: All async operations through Redux-Saga

Use `takeLatest`, `call`, `put`. No direct API calls in components.

**Why**: 0 files in app/components/ call fetch() or axios directly. All 31 saga files use the takeLatest/call/put pattern. Constitution Principle III mandates this.

### Rule 2: Feature pages use dynamic reducer/saga injection

Via `injectSaga` and `injectReducer`.

**Why**: 35 files pair these for code splitting per Constitution Principle V.

### Rule 3: Use `createStructuredSelector` from reselect

For memoized selectors.

**Why**: 63 files use createStructuredSelector. Prevents unnecessary re-renders.

### Rule 4: Context API only for deep prop-drilling within a single organism tree

**Why**: Only 4 files use Context (PromotionConfigContext, StrategyDashboard, ConfigureWorkflows, AddEarnCondition). Global state MUST go through Redux.

## Good Examples

### PromotionList/saga.js — Standard saga pattern

**File**: `app/components/pages/PromotionList/saga.js`

```javascript
import { call, put, takeLatest } from 'redux-saga/effects';
import * as Api from '../../../services/api';
import { actionTypes } from './constants';

function* fetchPromotionsList(action) {
  try {
    const response = yield call(Api.getPromotionsList, action.payload);
    yield put({ type: actionTypes.GET_PROMOTIONS_LIST_SUCCESS, data: response });
  } catch (error) {
    yield put({ type: actionTypes.GET_PROMOTIONS_LIST_FAILURE, error });
  }
}

export default function* promotionListSaga() {
  yield takeLatest(actionTypes.GET_PROMOTIONS_LIST_REQUEST, fetchPromotionsList);
}
```

API call via `call()`, success/failure via `put()`, try/catch for error handling.

### Dynamic injection in compose chain

**File**: `app/components/pages/PromotionList/PromotionList.js`

```javascript
export default compose(
  injectReducer({ key: REDUCER_KEY, reducer }),
  injectSaga({ key: SAGA_KEY, saga }),
  connect(mapStateToProps, mapDispatchToProps),
)(PromotionList);
```

Dynamic injection for feature isolation and code splitting.

## Flagged Files

No files flagged (status aligned).
