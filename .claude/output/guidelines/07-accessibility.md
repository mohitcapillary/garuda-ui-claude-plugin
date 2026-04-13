# 07. Accessibility

**Status**: violations — only 7/180+ component files use aria attributes (<5%)

## Rules

### Rule 1: Interactive elements need `aria-label` or `aria-labelledby`

**Why**: Only 7 files use aria attributes. Cap-ui-library components handle basic a11y internally (CapButton, CapInput), but custom interactive elements need explicit ARIA.

### Rule 2: Images need `alt` attribute

**Why**: 4 files use `<img>` -- most have alt but one uses empty `alt=""` without being explicitly decorative.

### Rule 3: Use `role` attributes on custom interactive elements

**Why**: 15 files use `role=`. Custom clickable divs need `role="button"` for screen readers.

### Rule 4: Use cap-ui-library components for built-in a11y

**Why**: CapInput, CapButton, CapCheckbox etc. handle focus and ARIA states internally.

## Good Examples

### SwitchWithDivider — aria-label on toggle

**File**: `app/components/molecules/SwitchWithDivider/SwitchWithDivider.js`

```javascript
<CapSwitch
  data-testid={dataTestId}
  aria-label={name}
  className={classnames(className, 'switch-with-divider')}
/>
```

Explicit aria-label on interactive element.

### PromotionsListingTable — aria attributes on actions

**File**: `app/components/molecules/PromotionsListingTable/PromotionsListingTable.js`

```javascript
aria-label={formatMessage(messages.copyPromoId)}
aria-label={formatMessage(messages.edit)}
aria-haspopup="true"
aria-expanded={popoverVisible[index]}
```

Multiple aria attributes for interactive table actions.

## Bad Examples

### IllustrationWithTitleAndDesc — Empty alt

**File**: `app/components/atoms/IllustrationWithTitleAndDesc/IllustrationWithTitleAndDesc.js`

```javascript
<img src={imageSrc} alt="" className={imageClassName} />
```

**Issue**: Empty alt without `aria-hidden="true"` is ambiguous to screen readers.

**Fix**:

```javascript
<img src={imageSrc} alt="" aria-hidden="true" className={imageClassName} />
```

Or provide meaningful alt text if the image conveys information.

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/atoms/IllustrationWithTitleAndDesc/` | Empty alt without aria-hidden | Add aria-hidden="true" or meaningful alt |
| Most atom components | No aria attributes on custom elements | Add aria-label where interactive |
| Most molecule components | No aria attributes | Audit and add aria-label where needed |

(170+ component directories lack explicit aria attributes)
