# Garuda UI -- Development Guidelines

**Repo**: garuda-ui
**cap-ui-library version**: 8.12.64
**Generated**: 2026-04-08
**Updated**: 2026-04-20 — added Rule 5 to CSS Styling (withStyles className scoping); added Rules 5–7 to Component Creation (CapSlideBox vs CapDrawer, getPopupContainer, CapMultiSelect onSelect)
**Files scanned**: 1,369

## Status Summary

| # | Guideline | Status | Issues | Link |
|---|-----------|--------|--------|------|
| 01 | CSS & Styling | ⚠️ | 35 | [View](guidelines/01-css-styling.md) |
| 02 | Component Creation | ✅ | 0 | [View](guidelines/02-component-creation.md) |
| 03 | HOC Decision Framework | ✅ | 0 | [View](guidelines/03-hoc-decision.md) |
| 04 | Atomic Design | ❌ | 68 | [View](guidelines/04-atomic-design.md) |
| 05 | Variable & File Naming | ✅ | 0 | [View](guidelines/05-variable-naming.md) |
| 06 | Cap-UI-Library Tokens | ⚠️ | 8 | [View](guidelines/06-cap-ui-library-tokens.md) |
| 07 | Accessibility | ❌ | 170+ | [View](guidelines/07-accessibility.md) |
| 08 | PropTypes Conventions | ✅ | 0 | [View](guidelines/08-proptypes-conventions.md) |
| 09 | State Management | ✅ | 0 | [View](guidelines/09-state-management.md) |
| 10 | Performance | ⚠️ | 2 | [View](guidelines/10-performance.md) |
| 11 | Error Handling | ⚠️ | 17 | [View](guidelines/11-error-handling.md) |
| 12 | Responsive Design | ✅ | 6 | [View](guidelines/12-responsive-design.md) |
| 13 | Testing | ✅ | 0 | [View](guidelines/13-testing.md) |
| 14 | Documentation | ❌ | 175+ | [View](guidelines/14-documentation.md) |
| 15 | Import & Folder Conventions | ❌ | 162 | [View](guidelines/15-import-folder-conventions.md) |
| 16 | Form Handling | ✅ | 0 | [View](guidelines/16-form-handling.md) |
| 17 | Constants File Convention | ✅ | 0 | [View](guidelines/17-constants-file-convention.md) |

**Totals**: 9 aligned / 4 warnings / 4 violations

## Immediate Action Items

1. **[Documentation]** -- Add JSDoc comments to all 175+ component index.js files. No component has JSDoc documentation and no Storybook stories exist.
2. **[Accessibility]** -- Audit 170+ component files for missing aria-label attributes. Only 7 files currently use ARIA attributes on custom interactive elements.
3. **[Import Conventions]** -- Refactor 162 files using 4+ level deep relative imports (../../../../) to use webpack aliases.
4. **[Atomic Design]** -- Fix 65 molecule files importing from organisms/ (upward dependency violation). Move shared code to app/utils/.
5. **[Atomic Design]** -- Fix 3 atom files importing from organisms/ and 1 atom importing from molecules/. Move BrandAction to molecules/ or extract shared constants.
6. **[CSS Styling]** -- Extract inline styles from 35 files to styles.js files using withStyles pattern.
7. **[Error Handling]** -- Remove or replace console.error in 17 files with proper error boundary or saga error handling.
8. **[Cap-UI-Library Tokens]** -- Replace hardcoded hex colors in 8 style files with cap-ui-library token variables (CAP_G*, FONT_COLOR_*, etc.).
9. **[Performance]** -- Add Loadable.js to NotFoundPage and RedirectToLoginPage for code splitting.
10. **[Responsive Design]** -- Replace fixed pixel widths in 6 style files with flexible sizing or CAP_SPACE_* tokens.
