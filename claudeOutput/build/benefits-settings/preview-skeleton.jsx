/**
 * PREVIEW SKELETON — Benefits Settings
 * Phase 2.5 gate artifact. Not production code.
 * Cap* tokens sourced from layout-plan.json (extracted from design-context.jsx node 24:2729).
 * Every nodeId comment traces back to a real Figma node.
 *
 * NOTE: Shell provides CapSideBar at /settings/* routes.
 * This skeleton shows only the main panel (page component output).
 */

import CapButton from '@capillarytech/cap-ui-library/CapButton';
import CapColumn from '@capillarytech/cap-ui-library/CapColumn';
import CapHeading from '@capillarytech/cap-ui-library/CapHeading';
import CapLabel from '@capillarytech/cap-ui-library/CapLabel';
import CapModal from '@capillarytech/cap-ui-library/CapModal';
import CapRow from '@capillarytech/cap-ui-library/CapRow';
import CapTable from '@capillarytech/cap-ui-library/CapTable';
import React from 'react';

// Tokens — all sourced from layout-plan.json (never invented)
// Spacing applied via styles.js in production; shown inline here for preview only.

export default function BenefitsSettingsSkeleton() {
  return (
    // nodeId: 24:2775 — main panel (shell provides left 240px sidebar)
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* nodeId: 24:2776 — inner container */}
      <div
        style={{
          width: '1104px',
          paddingLeft: '3.428rem' /* CAP_SPACE_48 */,
          paddingTop: '2rem' /* CAP_SPACE_28 */,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.857rem' /* gap-26 between page title and sections */,
        }}
      >
        {/* nodeId: 24:2777 — page title | REVIEWER OVERRIDE: CapHeading (was CapLabel) */}
        {/* recipe: CapHeading (reviewerOverride from HLD recipeTable) */}
        <CapHeading type="h2">
          Benefits
        </CapHeading>

        {/* nodeId: 24:2778 — sections stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.857rem' /* CAP_SPACE_40 */ }}>

          {/* ── CUSTOM FIELDS SECTION ───────────────────────────── */}
          {/* nodeId: 24:2779 — recipe: CapColumn EXACT */}
          <CapColumn style={{ gap: '1.142rem' /* CAP_SPACE_16 */ }}>
            {/* nodeId: 24:2780 — recipe: CapRow RESOLVED-UNMAPPED */}
            <CapRow type="flex" justify="space-between" align="middle">
              {/* nodeId: 24:2781 — recipe: CapColumn EXACT */}
              <CapColumn style={{ gap: '0.285rem' /* CAP_SPACE_04 */ }}>
                {/* nodeId: 24:2782 — CapHeading h4, 16px medium CAP_G01 */}
                <CapHeading type="h4">
                  Custom fields
                </CapHeading>
                {/* nodeId: 24:2783 — CapLabel label3, 12px regular CAP_G05, w=421px */}
                <CapLabel type="label3" style={{ width: '421px' }}>
                  Add metadata fields for your benefits
                </CapLabel>
              </CapColumn>
              {/* nodeId: 24:2784 — recipe: CapButton EXACT, type=primary */}
              <CapButton
                type="primary"
                aria-label="Create a new custom field"
                onClick={() => {/* HANDLER: New custom field CTA */}}
              >
                New custom field
              </CapButton>
            </CapRow>

            {/* nodeId: 24:2785 — recipe: CapTable EXACT */}
            <CapTable
              rowKey="id"
              bordered
              pagination={false}
              dataSource={[]}
              columns={[
                { key: 'name', title: 'Name' /* 12px regular CAP_G01 header bg CAP_G10 */ },
                { key: 'dataType', title: 'Data type' },
                {
                  key: 'updatedOn',
                  title: (
                    <span>
                      Last updated on
                      {/* nodeId: 24:2872 — recipe: CapIcon ASSUMED type=carrot size=s */}
                      <span style={{ marginLeft: '0.285rem' }}>[sort icon]</span>
                      <br />
                      <span style={{ color: '#5e6c84' /* CAP_G04 */ }}>Updated by</span>
                    </span>
                  ),
                  sorter: true,
                },
              ]}
              style={{ width: '1104px', borderRadius: '0.285rem' /* CAP_SPACE_04 */ }}
            />
          </CapColumn>

          {/* ── CATEGORIES SECTION ──────────────────────────────── */}
          {/* nodeId: 24:2940 — recipe: CapColumn EXACT */}
          <CapColumn style={{ gap: '1.142rem' /* CAP_SPACE_16 */ }}>
            {/* nodeId: 24:2941 — recipe: CapRow RESOLVED-UNMAPPED */}
            <CapRow type="flex" justify="space-between" align="middle">
              {/* nodeId: 24:2942 — CapColumn */}
              <CapColumn style={{ gap: '0.285rem' /* CAP_SPACE_04 */ }}>
                {/* nodeId: 24:2943 — CapHeading h4, 16px medium CAP_G01 */}
                <CapHeading type="h4">
                  Categories
                </CapHeading>
                {/* nodeId: 24:2944 — CapLabel label3, 12px regular CAP_G05, w=421px */}
                <CapLabel type="label3" style={{ width: '421px' }}>
                  Manage categories for your benefits from here
                </CapLabel>
              </CapColumn>
              {/* nodeId: 24:2945 — recipe: CapButton EXACT, type=primary */}
              <CapButton
                type="primary"
                aria-label="Create a new category"
                onClick={() => {/* HANDLER: New category CTA */}}
              >
                New category
              </CapButton>
            </CapRow>

            {/* nodeId: 24:2946 — recipe: CapTable EXACT */}
            <CapTable
              rowKey="id"
              bordered
              pagination={false}
              dataSource={[]}
              columns={[
                { key: 'name', title: 'Name', width: 368 },
                {
                  key: 'updatedOn',
                  title: (
                    <span>
                      Last updated on
                      {/* nodeId: 24:3018 — recipe: CapIcon ASSUMED type=carrot size=s */}
                      <span style={{ marginLeft: '0.285rem' }}>[sort icon]</span>
                      <br />
                      <span style={{ color: '#5e6c84' /* CAP_G04 */ }}>Updated by</span>
                    </span>
                  ),
                  sorter: true,
                },
              ]}
              style={{ width: '1104px', borderRadius: '0.285rem' /* CAP_SPACE_04 */ }}
            />
          </CapColumn>

        </div>
      </div>

      {/* nodeId: 24:3089 — recipe: CapModal RESOLVED-UNMAPPED (was CapPopover in Figma) */}
      {/* BenefitsSettingsModal — shown on Create/Edit CTA click */}
      <CapModal
        visible={false}
        title="Create custom field"
        onCancel={() => {}}
        destroyOnClose
      >
        {/* CapInput: recipe EXACT — name field */}
        {/* CapSelect: recipe ASSUMED — data type (create only) */}
        [form fields here]
      </CapModal>

      {/* DeleteConfirmModal — shown on delete icon click */}
      <CapModal
        visible={false}
        title="Delete custom field"
        onCancel={() => {}}
        destroyOnClose
      >
        [confirmation content here]
      </CapModal>
    </div>
  );
}
