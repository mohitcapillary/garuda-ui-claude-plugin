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

### Rule 6: Know the full DOM hierarchy of a Cap* component before writing any CSS override

Ant Design (and cap-ui-library) compound components render **multiple nested DOM elements**. The library stylesheet applies `border`, `padding`, `box-shadow`, `background`, and `focus` styles at **specific levels** of this tree. If you target a class at the wrong level — even with correct values — you duplicate what the library already applies at another level.

**Rule**: Before writing any CSS override (`border`, `padding`, `box-shadow`, `background`, `height`, focus ring) on an Ant Design class selector, identify the **complete rendered DOM tree** of the component and check which levels already carry that property from the library stylesheet. Apply your override at exactly one level; suppress the library value at all other levels with `property: none / initial / unset` as needed.

Common DOM trees for Cap* components used in garuda-ui:

| Component | Rendered DOM (outermost → innermost) | Library-styled levels |
|-----------|--------------------------------------|-----------------------|
| CapInput.Search | `.ant-input-search` → `.ant-input-affix-wrapper` → `.ant-input` | border on both `.ant-input-search` and `.ant-input-affix-wrapper` |
| CapInput / CapInput.TextArea | `.ant-input-affix-wrapper` → `.ant-input` | border on `.ant-input-affix-wrapper` |
| CapSelect / CapMultiSelect | `.ant-select` → `.ant-select-selector` → `.ant-select-selection-item` | border on `.ant-select-selector` |
| CapDateRangePicker | `.ant-picker-range` → `.ant-picker-input` | border on `.ant-picker-range` |
| CapButton | `.ant-btn` | border + background on `.ant-btn` |

Common violation patterns (not limited to borders):

| Property | Symptom when applied at wrong level | Root cause |
|----------|-------------------------------------|------------|
| `border` | Double border ring visible to user | Applied to inner wrapper; outer wrapper still has library border |
| `padding` | Content shifted or clipped | Applied to inner element; outer wrapper already has matching padding |
| `box-shadow` | Double glow on focus | Applied to root; library also applies on focused inner element |
| `background` | Background bleeds through or layered | Parent and child both paint background at different nesting levels |
| `height` / `line-height` | Component taller than designed | Set on container AND inner input row simultaneously |

```jsx
// ✅ CORRECT — border on outermost wrapper, suppressed on inner wrapper
const SearchInputWrapper = styled.div`
  .ant-input-search {
    border: 1px solid ${CAP_G08};
    border-radius: ${CAP_SPACE_04};
  }
  .ant-input-affix-wrapper {
    border: none;      /* suppress library default at inner level */
    box-shadow: none;
  }
`;
```

```jsx
// ❌ WRONG — targets inner wrapper only; outer .ant-input-search still has library border
const SearchInputWrapper = styled.div`
  .ant-input-affix-wrapper {
    border: 1px solid ${CAP_G08};  /* produces double border ring */
  }
`;
```

**How to discover the DOM tree**: open the component in the running app → DevTools → inspect rendered HTML. Ant Design v3 class names follow the `ant-[component]-[part]` convention consistently.

**Why**: Cap-ui-library is built on Ant Design v3 and its global stylesheet ships with styles pre-applied at specific DOM levels. Since the pipeline generates code without running the browser, it cannot observe the real DOM hierarchy — this rule must be followed from the component's known class tree. Discovered during BenefitsListing when `BenefitsSearchInput` rendered with two concentric borders.

### Rule 7: Audit internal component styles before applying Figma values — write only the delta

**Figma values are targets, not additive layers.** Every Cap* component already ships with internal CSS — borders, padding, shadows, backgrounds, heights — applied at specific levels. If you extract a value from Figma and write it directly into `styles.js` without checking what the component already provides, you stack both values and produce a visual bug.

**Rule**: Before writing any CSS property for a Cap* component, follow this 3-step audit:
1. **Check internal styles** — what does the component already apply for this property? (Use the DOM tree table in Rule 6 for Ant Design components; use the slot padding table below for cap-ui-library slot containers)
2. **Calculate the delta** — what is the difference between the Figma target and the library default?
3. **Write only the delta** — if the library already provides the full value, write nothing (or `none`/`0` only if you need to override it)

Cap-UI slot containers and their built-in padding:

| Component | Slot | Built-in padding |
|-----------|------|-----------------|
| CapSlideBox (size-m / size-l) | header, content, footer | `0 48px` (horizontal only) |
| CapSlideBox (size-s) | header, content, footer | `0 24px` (horizontal only) |
| CapModal | body | `24px` all sides |

```jsx
// Figma target: content padding = 24px top/bottom, 48px left/right
// CapSlideBox content slot already provides: 0 48px horizontal
// Delta: only 24px vertical is missing

// ✅ CORRECT — write only the delta
export const FilterFieldsContainer = styled.div`
  padding: ${CAP_SPACE_24} 0;   /* horizontal already provided by CapSlideBox slot */
`;

// ❌ WRONG — full Figma value applied additively → 96px total horizontal padding
export const FilterFieldsContainer = styled.div`
  padding: ${CAP_SPACE_24} ${CAP_SPACE_48};   /* stacks on top of slot's 48px */
`;
```

**Component migration corollary**: When swapping one component for another (e.g. `CapDrawer` → `CapSlideBox`), re-run this audit. The new component may own a different set of CSS properties — styles written for the old component are not automatically valid for the new one.

**Why**: Two bugs in BenefitsListing traced to this — double-border on `BenefitsSearchInput` (Rule 6) and double-padding on `BenefitsFilterDrawer` after CapDrawer → CapSlideBox migration. Both caused by applying Figma values without first checking what the component already provides internally.

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
