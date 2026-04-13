# Screenshot Audit — Benefits Settings

Source: Figma node 24:2729, design-context.jsx
Audit run: 2026-04-13

## Tier 1 — Token-level diff

| File | Value type | Value | Token | Status |
|---|---|---|---|---|
| styles.js (page) | colour | background | CAP_WHITE | OK |
| styles.js (page) | colour | border | CAP_G07 | OK |
| styles.js (page) | colour | text | CAP_G01 | OK |
| styles.js (page) | colour | subtitle | CAP_G05 | OK |
| styles.js (page) | colour | tableSubtitle | CAP_G04 | OK |
| styles.js (page) | colour | tableHeaderBg | CAP_G10 | OK |
| styles.js (page) | spacing | paddingLeft | CAP_SPACE_48 | OK |
| styles.js (page) | spacing | paddingTop | CAP_SPACE_28 | OK |
| styles.js (page) | spacing | sectionsGap | CAP_SPACE_40 | OK |
| styles.js (page) | spacing | sectionInternalGap | CAP_SPACE_16 | OK |
| styles.js (page) | spacing | titleGroupGap | CAP_SPACE_04 | OK |
| styles.js (page) | spacing | tableRadius | CAP_SPACE_04 | OK |
| styles.js (page) | spacing | fontSize | CAP_SPACE_12 | OK |
| styles.js (page) | spacing | lineHeight | CAP_SPACE_16 | OK |
| styles.js (page) | layout | gap-26 = 1.857rem | GAP_26 const (no exact token) | DEFERRED — no CAP_SPACE_26 exists |
| styles.js (page) | layout | width=1104px | INNER_CONTAINER_WIDTH const | DEFERRED — structural width, no token |
| styles.js (page) | layout | max-width=421px | SUBTITLE_MAX_WIDTH const | DEFERRED — structural width per Figma |

**Tier 1 result: PASS-WITH-DEFERRED** (all colours/spacing tokenised; 3 structural values deferred with documented provenance)

## Tier 2 — Structural diff

| Figma node | Role | Cap* type in plan | Cap* in code | Status |
|---|---|---|---|---|
| 24:2777 | page-title | CapHeading h2 (reviewerOverride) | CapHeading type="h2" | OK |
| 24:2779 | custom-fields-section | CapColumn | styled div (SectionContainer) | OK — CapColumn is layout-only; styled div is idiomatic |
| 24:2780 | custom-fields-header | CapRow | styled div (SectionHeaderRow) | OK — CapRow is layout-only; styled div is idiomatic |
| 24:2781 | custom-fields-title-group | CapColumn | styled div (TitleGroup) | OK |
| 24:2782 | custom-fields-section-title | CapHeading h4 | CapHeading type="h4" | OK |
| 24:2783 | custom-fields-subtitle | CapLabel label3 | CapLabel type="label3" | OK |
| 24:2784 | new-custom-field-cta | CapButton primary | CapButton type="primary" | OK |
| 24:2785 | custom-fields-table | CapTable | CapTable | OK |
| 24:2872 | sort-icon-custom-fields | CapIcon carrot | CapIcon type="carrot" | OK |
| 24:2940 | categories-section | CapColumn | styled div (SectionContainer) | OK |
| 24:2941 | categories-header | CapRow | styled div (SectionHeaderRow) | OK |
| 24:2943 | categories-section-title | CapHeading h4 | CapHeading type="h4" | OK |
| 24:2944 | categories-subtitle | CapLabel label3 | CapLabel type="label3" | OK |
| 24:2945 | new-category-cta | CapButton primary | CapButton type="primary" | OK |
| 24:2946 | categories-table | CapTable | CapTable | OK |
| 24:3018 | sort-icon-categories | CapIcon carrot | CapIcon type="carrot" | OK |
| 24:3089 | modal | CapModal | CapModal | OK |
| 24:2730 | sidebar | CapSideBar (shell-owned) | Not in page JSX (shell provides) | OK — documented in resolved-questions.md Q3 |

**Tier 2 result: PASS** — all 18 non-trivial Figma nodes accounted for with correct Cap* types.

## Tier 3 — Visual diff

Not run. Pass `--visual-audit` flag to enable rendered screenshot comparison.
