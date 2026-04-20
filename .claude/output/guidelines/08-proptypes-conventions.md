# 08. PropTypes Conventions

**Status**: aligned — 227 component files define PropTypes

## Rules

### Rule 1: ALL exported components MUST define `.propTypes`

**Why**: 227 files define PropTypes. No TypeScript exists -- PropTypes is the only type safety.

### Rule 2: Use `PropTypes.shape({})` for complex objects

Not `PropTypes.object`.

**Why**: Shape definitions provide documentation and runtime validation of object structure.

### Rule 3: Mark required props with `.isRequired`

**Why**: Catches missing required props during development.

### Rule 4: Define `defaultProps` for optional props with defaults

**Why**: Explicit defaults prevent undefined behavior.

### Rule 5: `intlShape` belongs in `propTypes`, never in `defaultProps`

`intlShape` is a PropTypes validator shape, not a value. Putting it in `defaultProps` assigns a function object as the default — which won't crash but is semantically wrong and confuses tooling.

```js
// correct:
Component.propTypes = {
  intl: intlShape,
};
Component.defaultProps = {
  intl: {},
};

// wrong:
Component.defaultProps = {
  intl: intlShape.isRequired,  // ← intlShape is a validator, not a default value
};
```

**Why**: `injectIntl` HOC always provides the `intl` object at runtime, so the default is a safety net only. An empty object `{}` is the correct neutral default.

## Good Examples

### FiltersApplied — Well-typed props

**File**: `app/components/molecules/FiltersApplied/FiltersApplied.js`

```javascript
FiltersApplied.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool,
  })).isRequired,
  onRemove: PropTypes.func.isRequired,
  formatMessage: PropTypes.func.isRequired,
};
```

Uses shape() for objects, marks required props, descriptive prop names.

## Notes

- No TypeScript exists in this repo or in cap-ui-library (no .d.ts files)
- PropTypes is the sole type safety mechanism
- Cap-ui-library components define their own PropTypes internally

## Flagged Files

No files flagged (status aligned).
