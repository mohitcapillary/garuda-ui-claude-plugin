# cap-ui-library — Component Index

131 components. Look up the spec file you need here before reading it — this index is ~3k tokens; the full library is ~150k.

**How to use:** find your component below, read only that `ref-Cap<Name>.md` file, not the rest.

<!-- Source: skills/cap-ui-library/ref-Cap*.md — 131 files. About 100 are stub specs with only 2 generic props (className, style); the rest have full prop tables. No file contains an explicit "Caveats" section — the ⚠ flags below are heuristic: components wrapped by ComponentWithLabelHOC (the common 100%-width-in-flex gotcha) and components with explicit `NOTE:` warnings in the usage examples. -->

| Component | Import | Purpose | Props | Variants | ⚠ |
|---|---|---|---|---|---|
| CapActionBar | `@capillarytech/cap-ui-library/CapActionBar` | Container for bottom/sticky action buttons (Save, Cancel, etc.) | 2 | — | — |
| CapAdvancedIcon | `@capillarytech/cap-ui-library/CapAdvancedIcon` | Advanced icon component with type, size, color, and click support | 2 | — | — |
| CapAlert | `@capillarytech/cap-ui-library/CapAlert` | Inline alert banner with type variants and optional description | 2 | success, info, warning, error | — |
| CapAppNotEnabled | `@capillarytech/cap-ui-library/CapAppNotEnabled` | Placeholder page shown when a module is not enabled for the org | 2 | — | — |
| CapAskAira | `@capillarytech/cap-ui-library/CapAskAira` | AI assistant query widget with context and positioning | 2 | — | — |
| CapBanner | `@capillarytech/cap-ui-library/CapBanner` | Page-level banner with type, message, description, and close | 2 | info, warning, error, success | — |
| CapBlock | `@capillarytech/cap-ui-library/CapBlock` | Generic block container for grouping content with styling | 2 | — | — |
| CapBorderedBox | `@capillarytech/cap-ui-library/CapBorderedBox` | Enclosed content box with a visible border for section grouping | 2 | — | — |
| CapButton | `@capillarytech/cap-ui-library/CapButton` | Primary action button with icon support, variants, and loading state | 17 | primary, secondary, flat, dashed, oval | ⚠ |
| CapCalendarDatePicker | `@capillarytech/cap-ui-library/CapCalendarDatePicker` | Inline calendar date picker with label/validation support | 2 | — | ⚠ |
| CapCard | `@capillarytech/cap-ui-library/CapCard` | Generic card container with custom styling for content blocks | 2 | — | — |
| CapCardBox | `@capillarytech/cap-ui-library/CapCardBox` | Card-style box container for configuration sections | 2 | — | — |
| CapCarousel | `@capillarytech/cap-ui-library/CapCarousel` | Slideshow carousel with autoplay for rotating content | 2 | — | — |
| CapCheckbox | `@capillarytech/cap-ui-library/CapCheckbox` | Checkbox with indeterminate, group, and inductive text support | 2 | — | ⚠ |
| CapCollapsibleLeftNavigation | `@capillarytech/cap-ui-library/CapCollapsibleLeftNavigation` | Left-side navigation panel that collapses/expands | 2 | — | — |
| CapCollapsibleNavbar | `@capillarytech/cap-ui-library/CapCollapsibleNavbar` | Top navigation bar that collapses on small screens | 2 | — | — |
| CapColoredTag | `@capillarytech/cap-ui-library/CapColoredTag` | Colored tag with custom bg/text/border colors and close support | 13 | static | — |
| CapColorPicker | `@capillarytech/cap-ui-library/CapColorPicker` | Color selection picker with optional hex selector | 2 | — | — |
| CapColumn | `@capillarytech/cap-ui-library/CapColumn` | Grid column (extends Ant Design Col) with 24-cell span and breakpoints | 16 | — | — |
| CapCondition | `@capillarytech/cap-ui-library/CapCondition` | Condition/rule builder with fields, operators, and nested groups | 2 | — | — |
| CapConditionPreview | `@capillarytech/cap-ui-library/CapConditionPreview` | Read-only preview of a built condition tree with custom labels | 2 | — | — |
| CapCSVFileUploader | `@capillarytech/cap-ui-library/CapCSVFileUploader` | CSV-specific file upload component with size/type restrictions | 2 | — | — |
| CapCustomCard | `@capillarytech/cap-ui-library/CapCustomCard` | Customized card variant for reward/promotion content | 2 | — | — |
| CapCustomCarousel | `@capillarytech/cap-ui-library/CapCustomCarousel` | Custom slide carousel wrapper around children | 2 | — | — |
| CapCustomCheckboxList | `@capillarytech/cap-ui-library/CapCustomCheckboxList` | Labeled list of checkboxes bound to an options array | 2 | — | — |
| CapCustomList | `@capillarytech/cap-ui-library/CapCustomList` | Custom selectable list bound to an options array | 2 | — | — |
| CapCustomSelect | `@capillarytech/cap-ui-library/CapCustomSelect` | Select with search inside dropdown (use via CapSelect.CapCustomSelect) | 2 | — | ⚠ |
| CapDatePicker | `@capillarytech/cap-ui-library/CapDatePicker` | Single date picker with label, timezone, and validation | 2 | — | ⚠ |
| CapDateRangePicker | `@capillarytech/cap-ui-library/CapDateRangePicker` | Range picker wrapping react-dates with label/validation via HOC | 57 | horizontal, vertical | ⚠ |
| CapDateTimePicker | `@capillarytech/cap-ui-library/CapDateTimePicker` | Combined date+time picker with label and validation | 2 | — | ⚠ |
| CapDateTimeRangePicker | `@capillarytech/cap-ui-library/CapDateTimeRangePicker` | Date+time range picker with dual input placeholders | 2 | — | ⚠ |
| CapDivider | `@capillarytech/cap-ui-library/CapDivider` | Horizontal/vertical divider with optional title and dashed style | 9 | horizontal, vertical, dashed, dotted, solid | — |
| CapDnDGraph | `@capillarytech/cap-ui-library/CapDnDGraph` | Drag-and-drop flow graph with nodes, edges, and connect handlers | 2 | — | — |
| CapDndGraphSidebar | `@capillarytech/cap-ui-library/CapDndGraphSidebar` | Sidebar palette of draggable nodes for use with CapDnDGraph | 2 | — | — |
| CapDragAndDrop | `@capillarytech/cap-ui-library/CapDragAndDrop` | File drop zone with MIME accept list and max file size | 2 | — | — |
| CapDragReorder | `@capillarytech/cap-ui-library/CapDragReorder` | Drag-to-reorder list with custom item rendering | 2 | — | — |
| CapDrawer | `@capillarytech/cap-ui-library/CapDrawer` | Sliding panel from edge with title/footer and placement options | 23 | top, right, bottom, left, default, large | — |
| CapDropdown | `@capillarytech/cap-ui-library/CapDropdown` | Dropdown wrapper with overlay menu, triggers, and placement | 13 | click, hover, contextMenu | — |
| CapEmojiPicker | `@capillarytech/cap-ui-library/CapEmojiPicker` | Emoji selection picker with onEmojiClick callback | 2 | — | — |
| CapEmptyDivWithBorder | `@capillarytech/cap-ui-library/CapEmptyDivWithBorder` | Placeholder/empty-state container with visible border | 2 | — | — |
| CapError | `@capillarytech/cap-ui-library/CapError` | Inline error-message text for form validation or API failures | 2 | — | — |
| CapErrorBoundary | `@capillarytech/cap-ui-library/CapErrorBoundary` | React error boundary with fallback UI and refresh handler | 2 | — | — |
| CapErrorStateIllustration | `@capillarytech/cap-ui-library/CapErrorStateIllustration` | Full-panel error state with title, description, and retry button | 2 | — | — |
| CapEventCalendar | `@capillarytech/cap-ui-library/CapEventCalendar` | Calendar view for displaying events with click handlers | 2 | — | — |
| CapExpressionEditor | `@capillarytech/cap-ui-library/CapExpressionEditor` | Formula/expression editor bound to a variables list | 2 | — | — |
| CapForm | `@capillarytech/cap-ui-library/CapForm` | Form container with layout, validation, and Form.create() pattern | 14 | horizontal, vertical, inline | — |
| CapFormItem | `@capillarytech/cap-ui-library/CapFormItem` | Form row with label, rules, help text, and validation status | 17 | success, warning, error, validating | ⚠ |
| CapGraph | `@capillarytech/cap-ui-library/CapGraph` | Generic chart/graph renderer from data with type (line, bar, etc.) | 2 | — | — |
| CapHamburgerMenu | `@capillarytech/cap-ui-library/CapHamburgerMenu` | Hamburger-style mobile navigation menu | 2 | — | — |
| CapHeader | `@capillarytech/cap-ui-library/CapHeader` | Page/table header with title and description, multiple sizes | 2 | small, default | — |
| CapHeading | `@capillarytech/cap-ui-library/CapHeading` | Typographic heading (h1–h6) with ellipsis/copyable/mark options | 17 | h1, h2, h3, h4, h5, h6, label1, label2 | — |
| CapHierarchyComponent | `@capillarytech/cap-ui-library/CapHierarchyComponent` | Hierarchical tree view for org/node structures with custom rendering | 2 | — | — |
| CapIcon | `@capillarytech/cap-ui-library/CapIcon` | Icon with type/size/color, SVG support, background wrapper, and spin | 15 | s, m, l | — |
| CapIllustration | `@capillarytech/cap-ui-library/CapIllustration` | Named illustration for empty/error states with width/height | 2 | — | — |
| CapImage | `@capillarytech/cap-ui-library/CapImage` | Image with src/alt, dimensions, and click handler | 2 | — | — |
| CapImportMFEComponent | `@capillarytech/cap-ui-library/CapImportMFEComponent` | Remote micro-frontend loader with url/scope/module and fallback | 2 | — | — |
| CapInfoNote | `@capillarytech/cap-ui-library/CapInfoNote` | Inline informational note with type variants and custom content | 2 | info, warning | — |
| CapInput | `@capillarytech/cap-ui-library/CapInput` | Text input with label, validation, verified state, and sub-types | 17 | top, left, large, default, small | ⚠ |
| CapLabel | `@capillarytech/cap-ui-library/CapLabel` | Typographic label with predefined style types (label1–label4) | 6 | label1, label2, label3, label4 | — |
| CapLanguageProvider | `@capillarytech/cap-ui-library/CapLanguageProvider` | i18n provider that wraps the app with locale and messages | 2 | — | — |
| CapLevelGraphRenderer | `@capillarytech/cap-ui-library/CapLevelGraphRenderer` | Renders a level-based graph structure from data | 2 | — | — |
| CapLink | `@capillarytech/cap-ui-library/CapLink` | React Router link with icon, color, disabled, and external support | 16 | _blank, _self, left, right | — |
| CapList | `@capillarytech/cap-ui-library/CapList` | List with header/footer/bordered/size and custom item rendering | 2 | small, default | — |
| CapListLayout | `@capillarytech/cap-ui-library/CapListLayout` | List layout wrapper with header/footer regions around children | 2 | — | — |
| CapLogin | `@capillarytech/cap-ui-library/CapLogin` | Login page component with optional SSO providers and loading state | 2 | — | — |
| CapMediaPreview | `@capillarytech/cap-ui-library/CapMediaPreview` | Image/video media preview with fallback and dimensions | 2 | image, video | — |
| CapMenu | `@capillarytech/cap-ui-library/CapMenu` | Navigation menu with vertical/horizontal/inline modes and submenus | 22 | vertical, horizontal, inline, light, dark | — |
| CapMobileDatePicker | `@capillarytech/cap-ui-library/CapMobileDatePicker` | Mobile-optimized single date picker with label support | 2 | — | ⚠ |
| CapMobileDateRangePicker | `@capillarytech/cap-ui-library/CapMobileDateRangePicker` | Mobile-optimized date range picker with dual placeholders | 2 | — | ⚠ |
| CapModal | `@capillarytech/cap-ui-library/CapModal` | Modal dialog with OK/Cancel buttons, static methods (info/success/etc.) | 24 | primary, secondary, flat | — |
| CapMultiplePath | `@capillarytech/cap-ui-library/CapMultiplePath` | Multi-path/step builder with add/remove controls and max limit | 2 | — | — |
| CapMultiSelect | `@capillarytech/cap-ui-library/CapMultiSelect` | Multi-select with tree data, select-all, max tags, and HOC label | 61 | multiple, error, warning | ⚠ |
| CapMultiSelectDatePicker | `@capillarytech/cap-ui-library/CapMultiSelectDatePicker` | Date picker that allows selecting multiple individual dates | 2 | — | ⚠ |
| CapMultiSelectWithTree | `@capillarytech/cap-ui-library/CapMultiSelectWithTree` | Hierarchical multi-select tree with checkboxes and search | 49 | SHOW_ALL, SHOW_PARENT, SHOW_CHILD | ⚠ |
| CapNavigation | `@capillarytech/cap-ui-library/CapNavigation` | Horizontal navigation bar for top-level links | 2 | — | — |
| CapNotification | `@capillarytech/cap-ui-library/CapNotification` | Toast notification API (success/error/info/warning/open/close) | 13 | success, info, warning, error | — |
| CapNotificationDropdown | `@capillarytech/cap-ui-library/CapNotificationDropdown` | Dropdown bell with unread count, clear-all, and custom trigger | 2 | — | — |
| CapPopover | `@capillarytech/cap-ui-library/CapPopover` | Popover with title/content, triggers, and extensive placement options | 15 | hover, focus, click, top, left, right, bottom | — |
| CapPopoverTree | `@capillarytech/cap-ui-library/CapPopoverTree` | Popover containing a tree selector with checkable nodes | 2 | — | — |
| CapProductSelection | `@capillarytech/cap-ui-library/CapProductSelection` | Product picker with search, categories, and max-select limit | 2 | — | — |
| CapProgress | `@capillarytech/cap-ui-library/CapProgress` | Progress bar with line/circle/dashboard types and status variants | 24 | line, circle, dashboard, success, exception, normal, active | — |
| CapRadio | `@capillarytech/cap-ui-library/CapRadio` | Single radio button with label, inductive text, and group support | 13 | top, left | ⚠ |
| CapRadioButton | `@capillarytech/cap-ui-library/CapRadioButton` | Button-style radio for horizontal RadioGroup selection | 8 | — | — |
| CapRadioCard | `@capillarytech/cap-ui-library/CapRadioCard` | Card-style radio with title/description/icon for rich selection | 12 | large, default, small | — |
| CapRadioGroup | `@capillarytech/cap-ui-library/CapRadioGroup` | Radio group container with options, direction, and button style | 16 | default, button, outline, solid, horizontal, vertical | ⚠ |
| CapReorderComponent | `@capillarytech/cap-ui-library/CapReorderComponent` | Reorderable list with disabled items and custom rendering | 2 | — | — |
| CapRoadMap | `@capillarytech/cap-ui-library/CapRoadMap` | Roadmap/step visualization with current-step highlighting | 2 | — | — |
| CapRow | `@capillarytech/cap-ui-library/CapRow` | Grid row (extends Ant Design Row) with gutter, align, justify, flex | 23 | top, middle, bottom, stretch | — |
| CapSecondaryTopBar | `@capillarytech/cap-ui-library/CapSecondaryTopBar` | Secondary page-level top bar for breadcrumbs and page actions | 2 | — | — |
| CapSelect | `@capillarytech/cap-ui-library/CapSelect` | Single/multi select with search, tags mode, and label HOC | 33 | multiple, tags, large, default, small | ⚠ |
| CapSelectFilter | `@capillarytech/cap-ui-library/CapSelectFilter` | Filter-bar style select with options and onChange | 2 | — | — |
| CapShape | `@capillarytech/cap-ui-library/CapShape` | Basic shape primitive (circle/square/rectangle) with size and color | 2 | circle, square, rectangle | — |
| CapSideBar | `@capillarytech/cap-ui-library/CapSideBar` | Side navigation bar with fixed height and section grouping | 2 | — | — |
| CapSkeleton | `@capillarytech/cap-ui-library/CapSkeleton` | Loading skeleton with avatar/title/paragraph/button placeholders | 27 | default, circle, square, rounded, small, large | — |
| CapSKUUploader | `@capillarytech/cap-ui-library/CapSKUUploader` | SKU/product bulk file uploader with onUpload callback | 2 | — | — |
| CapSlideBox | `@capillarytech/cap-ui-library/CapSlideBox` | Slide-in panel with header/content/footer, left or right placement | 11 | size-s, size-r, size-l, size-xl, left, right | — |
| CapSlider | `@capillarytech/cap-ui-library/CapSlider` | Value/range slider with marks, tooltip, and vertical orientation | 30 | single, range, horizontal, vertical | ⚠ |
| CapSnackBar | `@capillarytech/cap-ui-library/CapSnackBar` | Snackbar API (success/error/info/warning) with content and duration | 2 | success, error, info, warning | — |
| CapSomethingWentWrong | `@capillarytech/cap-ui-library/CapSomethingWentWrong` | Fallback error UI with custom message and retry button | 2 | — | — |
| CapSpin | `@capillarytech/cap-ui-library/CapSpin` | Loading spinner with sizes, tip text, and fullscreen overlay | 9 | small, default, large | — |
| CapSplit | `@capillarytech/cap-ui-library/CapSplit` | Two-pane split layout with custom styling | 2 | — | — |
| CapStaticTemplates | `@capillarytech/cap-ui-library/CapStaticTemplates` | Template gallery picker with categories and preview | 2 | — | — |
| CapStatisticCard | `@capillarytech/cap-ui-library/CapStatisticCard` | Numeric statistic card with title, value, and suffix | 2 | — | — |
| CapStatus | `@capillarytech/cap-ui-library/CapStatus` | Status indicator dot/label with active/inactive/pending states | 2 | active, inactive, pending | — |
| CapSteps | `@capillarytech/cap-ui-library/CapSteps` | Step wizard with horizontal/vertical direction and click navigation | 17 | horizontal, vertical, default, navigation, wait, process, finish, error | — |
| CapStepsAccordian | `@capillarytech/cap-ui-library/CapStepsAccordian` | Accordion-style step wizard with expandable panels per step | 2 | — | — |
| CapSupportVideosWrapper | `@capillarytech/cap-ui-library/CapSupportVideosWrapper` | Module-specific help-video panel with click tracking | 2 | — | — |
| CapSwitch | `@capillarytech/cap-ui-library/CapSwitch` | Toggle switch with checked/unchecked labels, loading, and label HOC | 14 | default, small, top, left | ⚠ |
| CapTab | `@capillarytech/cap-ui-library/CapTab` | Tabs (v1) with panes, positions, and types (line, card, editable-card) | 16 | line, card, editable-card, top, right, bottom, left | — |
| CapTable | `@capillarytech/cap-ui-library/CapTable` | Data table with sorting, pagination, expandable rows, infinite scroll | 29 | default, middle, small | — |
| CapTabV3 | `@capillarytech/cap-ui-library/CapTabV3` | Tabs v3 with TabPane children and active-key control | 2 | — | — |
| CapTag | `@capillarytech/cap-ui-library/CapTag` | Tag with closable, color, icon, and CheckableTag sub-component | 10 | outline, static | — |
| CapTagDropdown | `@capillarytech/cap-ui-library/CapTagDropdown` | Input + dropdown for managing list of add/remove tags | 8 | — | — |
| CapTimeline | `@capillarytech/cap-ui-library/CapTimeline` | Step-wizard timeline with milestones, panes, and content map | 2 | — | — |
| CapTimelineNested | `@capillarytech/cap-ui-library/CapTimelineNested` | Nested timeline variant with hierarchical panes | 2 | — | — |
| CapTimePicker | `@capillarytech/cap-ui-library/CapTimePicker` | Time picker with 12/24-hour, disabled options, and label HOC | 29 | large, default, small, top, left | ⚠ |
| CapTooltip | `@capillarytech/cap-ui-library/CapTooltip` | Tooltip with placement, trigger modes, and visibility control | 15 | hover, focus, click, contextMenu | ⚠ |
| CapTooltipWithInfo | `@capillarytech/cap-ui-library/CapTooltipWithInfo` | Tooltip with built-in info icon, aria label, and custom styling | 10 | hover, focus, click, contextMenu | — |
| CapTopBar | `@capillarytech/cap-ui-library/CapTopBar` | Top-level application bar for branding and global actions | 2 | — | — |
| CapTree | `@capillarytech/cap-ui-library/CapTree` | Hierarchical tree view with expand/check/select | 2 | — | — |
| CapTreeSelect | `@capillarytech/cap-ui-library/CapTreeSelect` | Tree-based select with single/multi, checkboxes, and HOC label | 49 | SHOW_ALL, SHOW_PARENT, SHOW_CHILD | ⚠ |
| CapTreeView | `@capillarytech/cap-ui-library/CapTreeView` | Read-only/display tree view with treeData and default expand | 2 | — | — |
| CapTruncateList | `@capillarytech/cap-ui-library/CapTruncateList` | List with "show more" truncation after max items | 2 | — | — |
| CapUploader | `@capillarytech/cap-ui-library/CapUploader` | Generic file uploader with accept, beforeUpload, and change handler | 2 | — | — |
| CapUserProfile | `@capillarytech/cap-ui-library/CapUserProfile` | User profile dropdown with avatar, role, and logout handler | 2 | — | — |
| CapVerticalGroupTable | `@capillarytech/cap-ui-library/CapVerticalGroupTable` | Table variant that groups rows vertically by a column key | 2 | — | — |
| CapVirtualList | `@capillarytech/cap-ui-library/CapVirtualList` | Virtualized list for large data sets with rowHeight/height | 2 | — | — |
| CapVirtualMultiSelect | `@capillarytech/cap-ui-library/CapVirtualMultiSelect` | Virtual-scroll multi-select for large option lists (500+) | 2 | — | ⚠ |
| CapVirtualSelect | `@capillarytech/cap-ui-library/CapVirtualSelect` | Virtual-scroll single select for large option lists (1000+) | 2 | — | ⚠ |
| ClearDataOnUnmountHoc | `@capillarytech/cap-ui-library/ClearDataOnUnmountHoc` | HOC that clears a Redux slice when the wrapped component unmounts | 2 | — | — |
| LocaleHoc | `@capillarytech/cap-ui-library/LocaleHoc` | HOC that injects locale and direction props into the wrapped component | 2 | — | — |

## Caveats summary

Components flagged with ⚠ have known layout or integration pitfalls — read the spec file before using. The most common caveat is the `display: block` wrapper around `CapSelect`/`CapInput`/`CapDatePicker`/`CapTextArea` (and similar form inputs) from `ComponentWithLabelHOC` which expands to 100% width in flex rows unless explicitly constrained with `inline` or a fixed `style.width`/`componentClassName`.

Additional known gotchas:
- **CapButton disabled + CapTooltip**: wrap the disabled button in `<span className="button-disabled-tooltip-wrapper">` for the tooltip to work (pointer events on disabled buttons are suppressed).
- **CapTooltip on disabled children**: same wrapping requirement as above.
- **CapSelect options**: `value` must be unique across options.
- **Form inputs with HOC labels** (CapInput, CapSelect, CapMultiSelect, CapMultiSelectWithTree, CapTreeSelect, CapSwitch, CapRadio, CapRadioGroup, CapSlider, CapCheckbox, CapDatePicker, CapDateRangePicker, CapDateTimePicker, CapDateTimeRangePicker, CapCalendarDatePicker, CapMobileDatePicker, CapMobileDateRangePicker, CapMultiSelectDatePicker, CapTimePicker, CapCustomSelect, CapVirtualSelect, CapVirtualMultiSelect, CapFormItem): expect `label`, `labelPosition`, `isRequired`, `errorMessage`, `inductiveText`, and `inline` props — the HOC wraps them in a block-level `<div>` that stretches to the parent width.

## Naming quick-map

Typical Figma-layer → Cap* mappings:
- Button → CapButton
- Text input → CapInput
- Search input → CapInput.Search
- Number input → CapInput.Number
- Textarea → CapInput.TextArea
- Dropdown / Select → CapSelect
- Multi-select → CapMultiSelect or CapMultiSelectWithTree (if hierarchical)
- Virtual select (large option lists) → CapVirtualSelect / CapVirtualMultiSelect
- Tree select → CapTreeSelect
- Checkbox → CapCheckbox (use CapCheckbox.Group for grouped)
- Radio button / Radio list → CapRadio + CapRadioGroup
- Radio tile / card → CapRadioCard
- Segmented control / button-style radios → CapRadioButton
- Toggle / Switch → CapSwitch
- Slider → CapSlider
- Date picker → CapDatePicker (mobile: CapMobileDatePicker)
- Date range picker → CapDateRangePicker (mobile: CapMobileDateRangePicker)
- Date + time picker → CapDateTimePicker / CapDateTimeRangePicker
- Calendar view → CapCalendarDatePicker (inline) or CapEventCalendar (events)
- Time picker → CapTimePicker
- Multi-date picker → CapMultiSelectDatePicker
- Color picker → CapColorPicker
- Emoji picker → CapEmojiPicker
- Primary CTA row (bottom sticky) → CapActionBar + CapButtons
- Modal / Dialog → CapModal
- Slide-in panel / Drawer → CapDrawer or CapSlideBox (slide-panel with footer)
- Popover → CapPopover (tree-popover: CapPopoverTree)
- Tooltip → CapTooltip (with info icon: CapTooltipWithInfo)
- Snackbar / Toast → CapSnackBar or CapNotification (static API)
- Alert banner (inline) → CapAlert
- Page banner → CapBanner
- Info note / helper → CapInfoNote
- Tag / Chip → CapTag (colored: CapColoredTag)
- Tag input / chips input → CapTagDropdown
- Status indicator / pill → CapStatus
- Badge-like colored label → CapColoredTag
- Icon → CapIcon (richer icons: CapAdvancedIcon)
- Image → CapImage (illustrations: CapIllustration; media preview: CapMediaPreview)
- Shape / bullet → CapShape
- Divider / separator → CapDivider
- Heading (h1–h6) → CapHeading
- Body text label → CapLabel
- Link → CapLink
- Card → CapCard / CapCardBox / CapCustomCard
- Bordered box → CapBorderedBox / CapEmptyDivWithBorder
- Generic block → CapBlock
- Grid row → CapRow; Grid column → CapColumn
- Split pane → CapSplit
- Table → CapTable (vertical group: CapVerticalGroupTable)
- List → CapList / CapCustomList / CapListLayout
- Truncated list → CapTruncateList
- Virtual list (large data) → CapVirtualList
- Steps / wizard → CapSteps / CapStepsAccordian / CapTimeline / CapTimelineNested / CapRoadMap
- Tabs → CapTab or CapTabV3
- Menu → CapMenu
- Dropdown menu → CapDropdown
- Notification bell → CapNotificationDropdown
- Top navigation bar → CapTopBar (sub-bar: CapSecondaryTopBar)
- Left navigation → CapSideBar / CapCollapsibleLeftNavigation
- Horizontal navbar → CapNavigation / CapCollapsibleNavbar
- Hamburger menu (mobile) → CapHamburgerMenu
- User profile block → CapUserProfile
- Progress bar / circle → CapProgress
- Statistic card → CapStatisticCard
- Loader / spinner → CapSpin
- Skeleton loader → CapSkeleton
- Form wrapper → CapForm
- Form field row → CapFormItem
- Error text (inline) → CapError
- Error page / state → CapErrorStateIllustration / CapSomethingWentWrong
- App-not-enabled page → CapAppNotEnabled
- Error boundary wrapper → CapErrorBoundary
- Tree view → CapTree / CapTreeView
- Hierarchy view → CapHierarchyComponent
- Drag-to-reorder → CapDragReorder / CapReorderComponent
- Drag-drop file upload → CapDragAndDrop / CapUploader / CapCSVFileUploader / CapSKUUploader
- Drag-drop graph builder → CapDnDGraph + CapDndGraphSidebar
- Condition / rule builder → CapCondition (preview: CapConditionPreview)
- Expression editor → CapExpressionEditor
- Multi-path builder → CapMultiplePath
- Carousel → CapCarousel / CapCustomCarousel
- Checkbox list → CapCustomCheckboxList
- Product picker → CapProductSelection
- Template gallery → CapStaticTemplates
- Filter select → CapSelectFilter
- Support videos → CapSupportVideosWrapper
- AI assistant widget → CapAskAira
- Login page → CapLogin
- Level graph / hierarchy graph → CapLevelGraphRenderer
- i18n language provider → CapLanguageProvider
- Reset-redux-on-unmount HOC → ClearDataOnUnmountHoc
- Locale injection HOC → LocaleHoc
- Remote MFE loader → CapImportMFEComponent
