# 14. Documentation

**Status**: violations — 0 JSDoc comments in component index files, 0 Storybook stories

## Rules

### Rule 1: Exported components SHOULD have JSDoc comment blocks

Describing purpose, props overview, and usage.

**Why**: Zero component index.js files have JSDoc comments. New developers must read full source to understand component purpose.

### Rule 2: No Storybook exists — consider adopting

**Why**: Zero .stories.js files. Storybook provides interactive documentation and visual regression testing.

## Good Examples

### Aspirational — What JSDoc should look like

```javascript
// app/components/atoms/StatCard/index.js
/**
 * StatCard - Displays a single statistic with label and value.
 * Uses CapCard and CapHeading from cap-ui-library.
 *
 * @param {string} title - The label text above the value
 * @param {string|number} value - The statistic value to display
 * @param {string} [className] - Optional CSS class override
 */
export { default } from './StatCard';
```

## Bad Examples

### Current state — No documentation

**File**: `app/components/atoms/StatCard/index.js`

```javascript
export { default } from './StatCard';
```

**Issue**: No JSDoc means developers must read the full component source.

**Fix**: Add JSDoc with @param for key props.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| All 35 atom index.js files | Missing JSDoc | Add JSDoc with @param |
| All 80 molecule index.js files | Missing JSDoc | Add JSDoc with @param |
| All 60 organism index.js files | Missing JSDoc | Add JSDoc with @param |

(175+ component index files lack JSDoc)
