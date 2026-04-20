# 01. CSS & Styling

**Status**: warnings — 149/184 files compliant (81%)

## Rules

### Rule 1: Use `withStyles` HOC + `css` template literal pattern

All component styling MUST use the `withStyles` HOC from `@capillarytech/vulcan-react-sdk/utils` with a co-located `styles.js` file exporting a `css` template literal.

**Why**: 149 files follow this pattern. It keeps styles co-located, enables theme token usage, and supports BEM-style classNames through the vulcan SDK build pipeline.

### Rule 2: Import tokens from `@capillarytech/cap-ui-library/styled/variables`

Never hardcode hex colors or px values that have token equivalents.

**Why**: 163 files already import tokens correctly. Hardcoded values create inconsistency when the design system updates.

### Rule 3: Use `CapRow` / `CapColumn` for layouts

No raw CSS flexbox or `@media` queries.

**Why**: Zero @media queries exist in the codebase. The Cap layout system handles responsive behavior.

### Rule 4: No inline styles (`style={{}}`)

Extract to styles.js.

**Why**: Inline styles bypass the withStyles pipeline, cannot use tokens, and break consistency.

### Rule 5: `withStyles` className scoping — component class must be on a child element, NOT the root

`withStyles` prepends the generated class to every selector in `styles.js`. A stylesheet `.my-component { .child { … } }` becomes `.generatedCls .my-component .child { … }` at runtime. If you put both classes on the **same** root element (`className={`my-component ${className}`}`), the selector `.generatedCls .my-component` looks for a descendant that never exists — **all CSS silently fails**.

**Rule**: The root element takes `className={className}` only. The component's own CSS class sits one level inside.

```jsx
// ✅ CORRECT — matches PromotionList pattern
const MyComponent = ({ className }) => (
  <div className={className}>          {/* withStyles class ONLY */}
    <div className="my-component">     {/* CSS selector root */}
      …
    </div>
  </div>
);
export default withStyles(MyComponent, styles);
```

```jsx
// ❌ WRONG — root carries both classes; all CSS is silently dead
<div className={`my-component ${className}`}>
```

**Special cases by root element type:**

| Root type | Fix |
|-----------|-----|
| `div` / `CapRow` / `CapColumn` | Wrap with `<div className={className}>`; move component class to first child |
| Leaf with no children (`CapInput`, `span`, `CapButton`) | Wrap with `<div className={className}>`; keep component class on inner element |
| 3rd-party container with own DOM (`CapDrawer`, `CapModal`) | Use `className={className}` on the component; remove the outer `.my-component { … }` wrapper from `styles.js` so selectors are scoped directly by the generated class |
| Simple atom with no nested selectors (2–3 flat rules) | Remove outer wrapper in `styles.js`; use `className={className}` on root |

**Why**: Discovered after `BenefitsListing` codegen — 6 components had this bug and all `withStyles` CSS was silently unapplied.

## Good Examples

### PromotionSettings/style.js

**File**: `app/components/organisms/PromotionSettings/style.js`

```javascript
import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
const { CAP_G09, CAP_G05, FONT_COLOR_01, FONT_COLOR_03 } = styledVars;

const styles = css`
  .selected-switch {
    color: ${FONT_COLOR_01};
  }
  .info-text {
    color: ${FONT_COLOR_03};
  }
  .container {
    border: 1px solid ${CAP_G09};
  }
`;
```

Tokens used correctly for colors and borders.

## Bad Examples

### AnalyticsDrawer/styles.js — Hardcoded hex colors

**File**: `app/components/organisms/AnalyticsDrawer/styles.js`

```javascript
export const NoteText = styled.span`
  color: #091e42;
`;
export const NoteContainer = styled.div`
  background: #fff4d6;
`;
```

**Issue**: #091e42 = CAP_G01/FONT_COLOR_01, #fff4d6 = CAP_COLOR_04. Hardcoded values diverge from the design system.

**Fix**:

```javascript
import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
const { CAP_G01, CAP_COLOR_04 } = styledVars;

export const NoteText = styled.span`
  color: ${CAP_G01};
`;
export const NoteContainer = styled.div`
  background: ${CAP_COLOR_04};
`;
```

### TagCustomerAction — Inline style

**File**: `app/components/organisms/TagCustomerAction/TagCustomerAction.js`

```javascript
<div style={{ marginTop: '16px', padding: '8px' }}>
```

**Issue**: Inline styles bypass withStyles pipeline.

**Fix**: Move to styles.js:

```javascript
.tag-customer-container {
  margin-top: ${CAP_SPACE_16};
  padding: ${CAP_SPACE_08};
}
```

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/organisms/TagCustomerAction/TagCustomerAction.js` | inline style | Extract to styles.js |
| `app/components/organisms/LiabilitySettings/LiabilitySettings.js` | inline style | Extract to styles.js |
| `app/components/molecules/FiltersApplied/FiltersApplied.js` | inline style | Extract to styles.js |
| `app/components/organisms/AnalyticsDrawer/styles.js` | hardcoded hex colors | Use CAP_G01, CAP_COLOR_04 tokens |
| `app/components/organisms/GroupActivity/styles.js` | hardcoded hex #f0f0f0, #fafafa | Use CAP_G15, CAP_G21 |

(35 files with inline styles flagged)
