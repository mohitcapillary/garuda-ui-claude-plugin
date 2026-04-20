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

### Rule 5: Selectors returning arrays or objects MUST call `.toJS()`

Reducers use `fromJS()` (ImmutableJS). Selectors that return non-primitive values must convert back to plain JS before components receive them.

```js
// correct:
export const makeSelectTiers = () =>
  createSelector(selectDomain, (substate) => substate.get('tiers').toJS());

// wrong — Immutable List leaks into component:
export const makeSelectTiers = () =>
  createSelector(selectDomain, (substate) => substate.get('tiers'));
```

**Why**: `.map()` works on Immutable Lists by accident, but `.find()`, spread, `JSON.stringify`, and array destructuring behave differently. Leaking Immutable objects into components causes silent, hard-to-debug failures.

### Rule 6: `isLoading` must only include `REQUEST` status — never `INITIAL`

```js
// correct:
const isLoading = status === REQUEST;

// wrong — causes infinite spinner if the effect never fires:
const isLoading = status === INITIAL || status === REQUEST;
```

**Why**: `INITIAL` is the Redux state before any request has been dispatched. Including it in the loading condition means a conditional `useEffect` that never fires will show a spinner forever. The initial render before a data fetch should show nothing or a skeleton, not a spinner.

### Rule 7: `clearDataOnUnmount` cleanup string must match an action creator exactly

```js
// the string passed here must exactly match a key in actions.js:
clearDataOnUnmount(injectIntl(withStyles(Page, styles)), 'clearTiersData')
```

**Why**: `clearDataOnUnmount` uses the string to dispatch the action by name. A typo or mismatch silently disables cleanup — stale Redux state persists across navigation, causing the next page load to show stale data.

### Rule 8: Sagas must normalize API responses before dispatching to Redux

```js
function* getTiersWorker({ payload }) {
  try {
    const response = yield call(api.getTiers, payload);
    // Extract the data shape components expect — never put the raw API envelope into Redux
    const data = response && response.data ? response.data : response;
    yield put(actions.getTiersSuccess(data));
  } catch (error) {
    yield put(actions.getTiersFailure(error));
  }
}
```

**Why**: Components and selectors must not depend on the API envelope structure (`{ status, data, errors }`). Normalizing in the saga means a backend response format change only requires updating one place.

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
