# Screenshot Audit — benefits-listing

## Tier 1 — Token-level diff

| File | Check | Status | Notes |
|---|---|---|---|
| BenefitsList/styles.js | Raw hex values | PASS | All colours via CAP_G* / CAP_WHITE tokens |
| BenefitsList/styles.js | Raw px values | PASS | SEARCH_INPUT_WIDTH='360px' (structural, named constant, justified); height=CAP_SPACE_40; icon=CAP_SPACE_32; outline-offset=CAP_SPACE_04 |
| BenefitsListTable/styles.js | Raw hex values | PASS | All via tokens |
| BenefitsListTable/styles.js | Raw px values | PASS | 1px border (idiomatic); min-height=CAP_SPACE_140 |
| BenefitsListFilterPanel/styles.js | Raw hex values | PASS | All via tokens |
| BenefitsListFilterPanel/styles.js | Raw px values | PASS | FILTER_PANEL_WIDTH='320px' (structural, named constant, justified); 1px border (idiomatic) |
| BenefitStatusTag/styles.js | Raw hex values | PASS | All via DOT_COLORS map (token names as keys) |
| BenefitStatusTag/styles.js | Raw px values | PASS | dot diameter=CAP_SPACE_08 |
| All .js files | CapLabel type enum | PASS | All label1/label4 — no invalid labelN |
| All .js files | CapHeading type enum | PASS | h1 (page), h4 (filter panel header) — no invalid hN |
| All .js files | No CAP_G00 reference | PASS | Darkest token used is CAP_G01 |

**Tier 1 result: PASS**

## Tier 2 — Structural diff

| Figma node | Role | Status | Code location | Notes |
|---|---|---|---|---|
| 3:1022 | page root | PASS | BenefitsList.js:1 (nodeId comment) | — |
| 3:1023 | page-column-wrapper (CapColumn EXACT) | PASS | BenefitsList.js:162 | PageWrapper styled from layout-plan tokens |
| 3:1024 | toolbar-row (CapRow) | PASS | BenefitsList.js:164 | ToolbarRow with h=CAP_SPACE_40 |
| 3:1027 | page-title (CapHeading h1) | PASS | BenefitsList.js:168 | CapHeading type="h1" |
| 3:1029 | search-filter-group (CapRow) | PASS | BenefitsList.js:174 | SearchFilterGroup |
| 3:1035 | search-input (CapInput) | PASS | BenefitsList.js:176 | CapInput with allowClear+prefix |
| 3:1038 | search-icon-prefix (CapIcon) | PASS | BenefitsList.js:185 | CapIcon type="search" |
| 3:1046 | toolbar-divider (CapDivider) | PASS | BenefitsList.js:193 | CapDivider type="vertical" |
| 3:1047 | filter-icon-button (CapIcon) | PASS | BenefitsList.js:196 | FilterIconButton + CapIcon type="filter" |
| 8:2902 | Create Benefit CapButton (OMITTED) | DEFERRED | BenefitsList.js:210 | Intentionally omitted per PM decision; logged comment preserved |
| 5:2877 | benefits-data-table (CapTable) | PASS | BenefitsListTable.js:72 | CapTable rowKey=id pagination=false |
| null | CapSkeleton (ASSUMED) | PASS | BenefitsListTable.js:52 | CapSkeleton active paragraph.rows=7 |
| null | Status badge (ASSUMED) | PASS | BenefitStatusTag.js | CapLabel label4+label1 with dot |

**Tier 2 result: PASS (1 intentional deferred: CapButton 8:2902 per PM decision)**

## Tier 3 — Rendered visual diff

Skipped — `--visual-audit` flag not passed.
