# 13. Testing

**Status**: aligned — 326 test files across the codebase

## Rules

### Rule 1: Every component directory SHOULD have a `tests/` subdirectory

With `{ComponentName}.test.js`.

**Why**: 326 test files follow this convention. Tests live alongside components.

### Rule 2: Test files follow `{ComponentName}.test.js` naming

Integration tests use `*.integration.test.js`.

**Why**: Consistent naming across 326 files.

### Rule 3: Use React Testing Library patterns

Test behavior, not implementation.

**Why**: Tests should verify user-visible behavior, not internal state.

### Rule 4: Integration tests run with TZ=UTC

Via `npm run test:integration` (single-threaded).

**Why**: Date consistency across environments.

### Rule 5: Do NOT test cap-ui-library internals

Mock library components if needed.

**Why**: Cap-ui-library is a dependency, not the subject under test.

## Good Examples

### BrandAction/tests/BrandAction.test.js

**File**: `app/components/atoms/BrandAction/tests/BrandAction.test.js`

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import BrandAction from '../BrandAction';

describe('BrandAction', () => {
  const defaultProps = {
    actionName: 'Test Action',
    onSelect: jest.fn(),
    formatMessage: jest.fn(msg => msg.defaultMessage),
  };

  it('renders action name', () => {
    render(<BrandAction {...defaultProps} />);
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });
});
```

Tests behavior, uses default props setup, React Testing Library patterns.

## Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | All tests with coverage |
| `npm run test:unit` | Jest unit tests (4 workers) |
| `npm run test:integration` | Integration tests (single-threaded, TZ=UTC) |

## Flagged Files

No files flagged (status aligned -- 326 test files, strong testing culture).
