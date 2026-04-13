# 16. Form Handling

**Status**: aligned — 0 raw HTML form elements in production, 63 files use Cap form components

## Available Cap Form Components

| Component | Purpose |
|-----------|---------|
| CapForm | Form wrapper (Ant Design Form) |
| CapFormItem | Form field wrapper with label/error |
| CapInput | Text input (+ Search, TextArea, Number) |
| CapSelect | Single select dropdown |
| CapMultiSelect | Multi-select dropdown |
| CapVirtualSelect | Virtualized select for large lists |
| CapCheckbox | Checkbox |
| CapRadio / CapRadioGroup / CapRadioButton / CapRadioCard | Radio options |
| CapSwitch | Toggle switch |
| CapSlider | Range slider |
| CapDatePicker / CapDateRangePicker | Date selection |
| CapTimePicker | Time selection |
| CapColorPicker | Color selection |

## Rules

### Rule 1: Use cap-ui-library form components

CapInput, CapSelect, CapCheckbox, CapForm, CapFormItem, CapRadio, CapSwitch, CapDatePicker.

**Why**: 63 files use Cap form components. They provide consistent styling, validation UI, and accessibility.

### Rule 2: No raw HTML `<input>`, `<select>`, `<textarea>` in production code

**Why**: 0 raw form elements in production files. Only test files use raw elements.

### Rule 3: Form state managed through Redux

Controlled components via `connect()`.

**Why**: No form libraries (Formik, React Hook Form) are used. All form state lives in Redux reducers.

### Rule 4: Validation logic in sagas/reducers, not components

**Why**: Keeps validation co-located with state management. Enables async validation via sagas.

## Good Examples

### NumberInput — Cap form component

**File**: `app/components/molecules/NumberInput/NumberInput.js`

```javascript
import { CapInput } from '@capillarytech/cap-ui-library';

const NumberInput = ({ value, onChange, label, disabled }) => (
  <div className="number-input-wrapper">
    <CapLabel>{label}</CapLabel>
    <CapInput
      type="number"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);
```

Cap-ui-library CapInput instead of raw `<input>`.

## Notes

- CapFormItem is available but has 0 usage -- the pattern is CapLabel + component instead
- No form libraries (Formik, React Hook Form, Zod, Yup) are used
- All form validation is inline in sagas/reducers

## Flagged Files

No files flagged (status aligned).
