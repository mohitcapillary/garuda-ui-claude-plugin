/**
 * PREVIEW SKELETON — Benefits Listing Page
 * Phase 2.5 structural preview (layout only — no Redux, no logic)
 * All Cap* components and tokens sourced from layout-plan.json
 * nodeId comments trace each element back to Figma
 *
 * TOKENS USED (all sourced from variables.js):
 *   CAP_G01, CAP_G05, CAP_G08, CAP_G07, CAP_G09
 *   CAP_SPACE_72, CAP_SPACE_32, CAP_SPACE_24, CAP_SPACE_20, CAP_SPACE_12, CAP_SPACE_08
 *
 * FIGMA-VS-SPEC CONFLICT (logged):
 *   Figma node 8:2902 shows CapButton type="primary" "Create Benefit"
 *   → OMITTED per PM decision (Section 15 Q1). See component-plan.json.
 */

import CapColumn from '@capillarytech/cap-ui-library/CapColumn';
import CapDivider from '@capillarytech/cap-ui-library/CapDivider';
import CapHeading from '@capillarytech/cap-ui-library/CapHeading';
import CapIcon from '@capillarytech/cap-ui-library/CapIcon';
import CapInput from '@capillarytech/cap-ui-library/CapInput';
import CapRow from '@capillarytech/cap-ui-library/CapRow';
import CapSkeleton from '@capillarytech/cap-ui-library/CapSkeleton';
import CapTable from '@capillarytech/cap-ui-library/CapTable';
import React from 'react';

// Skeleton column definitions — titles only, no renderers
const SKELETON_COLUMNS = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Duration', dataIndex: 'start_date', key: 'duration' },
  { title: 'Program name', dataIndex: 'program_name', key: 'program_name' },
  { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
  { title: 'Updated at', dataIndex: 'last_updated_at', key: 'last_updated_at' },
];

/**
 * BenefitsListPageSkeleton
 * Page-level JSX skeleton for Phase 2.5 structural preview.
 * Each element annotated with // nodeId: <figma-node-id>
 */
const BenefitsListPageSkeleton = () => {
  const isLoading = false; // skeleton preview shows table state
  const isFilterApplied = false;
  const benefits = []; // empty for skeleton

  return (
    // nodeId: 3:1022 — root page frame (1280×492)
    <CapRow className="benefits-list-page">
      {/* PageTemplate wrapper — reused template, no changes */}
      <div className="page-template-placeholder">
        {/* nodeId: 3:1023 — CapColumn page wrapper, padLeft/Right=CAP_SPACE_72, padTop=CAP_SPACE_20 */}
        <CapColumn className="benefits-list-column">

          {/* nodeId: 3:1024 — Toolbar Row, h=40px, align=middle, justify=space-between */}
          <CapRow
            type="flex"
            align="middle"
            justify="space-between"
            className="benefits-list-toolbar"
          >
            {/* nodeId: 3:1025/3:1026/3:1027 — Page title group */}
            {/* RECIPE: RESOLVED-UNMAPPED 3:1026/3:1027 → CapHeading h1 (Reviewer Override: page headings use CapHeading hN per memory rule) */}
            <CapHeading
              type="h1"
              className="benefits-list-title"
            >
              Benefits
            </CapHeading>

            {/* nodeId: 3:1029 — Search + filter group, w=413px */}
            <CapRow
              type="flex"
              align="middle"
              className="benefits-search-filter-group"
            >
              {/* nodeId: 3:1031/3:1035 — Search Input, w=360px */}
              {/* RECIPE: RESOLVED-UNMAPPED 3:1031/3:1035 → CapInput (Field states) */}
              <CapInput
                className="benefits-search-input"
                placeholder="Search"
                allowClear
                prefix={
                  // nodeId: 3:1038/3:1039 — Search icon prefix
                  // RECIPE: PARTIAL 3:1038/3:1039 → CapIcon
                  <CapIcon type="search" />
                }
              />

              {/* nodeId: 3:1044 — Divider + filter icon group, w=41px */}
              <CapRow
                type="flex"
                align="middle"
                className="benefits-filter-icon-group"
              >
                {/* nodeId: 3:1046 — Vertical divider */}
                {/* RECIPE: PARTIAL 3:1046 → CapDivider */}
                <CapDivider type="vertical" className="benefits-toolbar-divider" />

                {/* nodeId: 3:1047 — Filter icon button, 32×32px */}
                {/* RECIPE: RESOLVED-UNMAPPED 3:1047 → CapIcon (filter toggle) */}
                {/* FIGMA NOTE: node named "Download config" in Figma but screenshot shows filter icon (3-line) */}
                <CapIcon
                  type="filter"
                  className="benefits-filter-icon"
                  onClick={() => {}}
                  aria-label="Open filter panel"
                  role="button"
                />
              </CapRow>

              {/* nodeId: 8:2902 — OMITTED: CapButton "Create Benefit" */}
              {/* FIGMA-VS-SPEC: Present in Figma (EXACT recipe), omitted per PM decision (Q1) */}
              {/* null */}
            </CapRow>
          </CapRow>

          {/* FiltersApplied molecule — shown when isFilterApplied=true */}
          {/* Reused from app/components/molecules/FiltersApplied/ — no changes */}
          {isFilterApplied && (
            <div className="benefits-filters-applied-placeholder">
              {/* <FiltersApplied activeFilters={...} onClearAll={...} onRemoveFilter={...} /> */}
            </div>
          )}

          {/* Loading skeleton state */}
          {isLoading ? (
            <CapRow className="benefits-list-skeleton">
              {/* RECIPE: ASSUMED → CapSkeleton (per FR-12 loading state) */}
              <CapSkeleton active title={false} paragraph={{ rows: 7 }} />
            </CapRow>
          ) : (
            <>
              {/* nodeId: 5:2877 — Benefits data table */}
              {/* RECIPE: RESOLVED-UNMAPPED (overridden from CapTab) → CapTable */}
              {/* Disambiguation: Figma node named "CapTable", registry erroneously mapped to CapTab */}
              <CapTable
                className="benefits-list-table"
                dataSource={benefits}
                columns={SKELETON_COLUMNS}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />

              {/* IntersectionObserver sentinel — triggers page+1 fetch */}
              <div
                className="benefits-scroll-sentinel"
                aria-hidden="true"
              />
            </>
          )}

          {/* EmptyStateIllustration — shown when benefits=[] and no filters */}
          {/* Reused from app/components/molecules/EmptyStateIllustration/ */}
        </CapColumn>
      </div>

      {/* BenefitsListFilterPanel (molecule) — slide-out drawer, rendered outside PageTemplate */}
      {/* visible: isFilterPanelOpen */}
      {/* 7 filters: Status | Category | Program | Duration | Last updated by | Last updated at | Tier event */}
      {/* <BenefitsListFilterPanel visible={false} onApply={() => {}} onClose={() => {}} /> */}
    </CapRow>
  );
};

export default BenefitsListPageSkeleton;

/**
 * TIER 1 TOKEN AUDIT (pre-flight):
 * All colours used: CAP_G01 (page title), CAP_G05 (icons), CAP_G08 (input border)
 *   → all present in variables.js ✓
 * All spacing: CAP_SPACE_72 (horizontal pad), CAP_SPACE_32 (skeleton pad), CAP_SPACE_20 (top pad)
 *   → all present in variables.js ✓
 * No raw hex values in this skeleton ✓
 * No raw px values (only in layout-plan.json annotations, not in code) ✓
 *
 * TIER 2 STRUCTURAL AUDIT (pre-flight):
 * Figma non-trivial nodes present in code:
 *   3:1023 CapColumn ✓ (className="benefits-list-column")
 *   3:1024 CapRow toolbar ✓
 *   3:1027 CapHeading h1 ✓
 *   3:1029 CapRow search group ✓
 *   3:1035 CapInput ✓
 *   3:1038 CapIcon search ✓
 *   3:1046 CapDivider ✓
 *   3:1047 CapIcon filter ✓
 *   8:2902 CapButton OMITTED (PM decision — logged) ✓
 *   5:2877 CapTable ✓
 * ASSUMED nodes: CapSkeleton ✓
 */
