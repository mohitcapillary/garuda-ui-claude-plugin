/**
 * Benefits Listing — Page-level Layout Skeleton
 *
 * Phase 2.5 Preview — layout only, no Redux, no logic.
 * Every token traces to design-context.jsx node annotated with nodeId comment.
 * User confirms this skeleton before full codegen begins (Phase 5).
 *
 * Token sources:
 *   - CAP_G01, CAP_G06, CAP_G08, CAP_G09, CAP_WHITE, primary-base
 *     → node_modules/@capillarytech/cap-ui-library/styled/variables.js
 *   - CAP_SPACE_* → same file
 *   - CapHeading, CapRow, CapButton, CapInput, CapIcon, CapDivider, CapTable, CapStatus, CapLabel
 *     → @capillarytech/cap-ui-library
 */

import CapButton from '@capillarytech/cap-ui-library/CapButton';
import CapDivider from '@capillarytech/cap-ui-library/CapDivider';
import CapHeading from '@capillarytech/cap-ui-library/CapHeading';
import CapIcon from '@capillarytech/cap-ui-library/CapIcon';
import CapInput from '@capillarytech/cap-ui-library/CapInput';
import CapLabel from '@capillarytech/cap-ui-library/CapLabel';
import CapRow from '@capillarytech/cap-ui-library/CapRow';
import CapSpin from '@capillarytech/cap-ui-library/CapSpin';
import CapStatus from '@capillarytech/cap-ui-library/CapStatus';
import CapTable from '@capillarytech/cap-ui-library/CapTable';
import CapDrawer from '@capillarytech/cap-ui-library/CapDrawer';
import CapMultiSelect from '@capillarytech/cap-ui-library/CapMultiSelect';
import React from 'react';
import styled from 'styled-components';
import {
  CAP_G01,
  CAP_G06,
  CAP_G08,
  CAP_G09,
  CAP_WHITE,
  CAP_SPACE_04,
  CAP_SPACE_08,
  CAP_SPACE_12,
  CAP_SPACE_16,
  CAP_SPACE_24,
  CAP_SPACE_40,
  CAP_SPACE_48,
} from '@capillarytech/cap-ui-library/styled/variables';

// ── Skeleton-only stub wrappers ──────────────────────────────────────────────

const PageRoot = styled.div`
  /* nodeId: 123:5146 */
  display: flex;
  flex-direction: column;
  background: ${CAP_WHITE};
  width: 100%;
`;

const ToolbarRow = styled.div`
  /* nodeId: 123:5150 */
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${CAP_SPACE_40};
  padding: ${CAP_SPACE_24} ${CAP_SPACE_48};
`;

const SearchFilterGroup = styled.div`
  /* nodeId: 123:5155 */
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${CAP_SPACE_12};
  width: 413px;
`;

const DividerIconGroup = styled.div`
  /* nodeId: 123:5170 */
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${CAP_SPACE_08};
`;

const CtaArea = styled.div`
  /* nodeId: 123:5174 */
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: flex-end;
`;

const TableArea = styled.div`
  /* nodeId: 123:5178 */
  padding: 0 ${CAP_SPACE_48};
`;

// ── Column config (skeleton stubs) ──────────────────────────────────────────

const SKELETON_COLUMNS = [
  {
    /* nodeId: 123:5179 */
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 259,
    render: (text, record) => (
      <div>
        {/* nodeId: 123:5184 */}
        <CapLabel type="label7">{record.name}</CapLabel>
        {/* nodeId: 123:5189 */}
        <CapLabel type="label1">{record.id}</CapLabel>
        {/* nodeId: 123:5191 */}
        <CapLabel type="label1">{record.externalId}</CapLabel>
      </div>
    ),
  },
  {
    /* nodeId: 123:5303 */
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 168,
    render: (status) => (
      /* nodeId: 123:5312 */
      <CapStatus text={status} />
    ),
  },
  {
    /* nodeId: 123:5367 */
    title: 'Duration',
    dataIndex: 'startDate',
    key: 'duration',
    width: 168,
    render: (startDate, record) => (
      <CapLabel type="label4">{`${startDate} – ${record.endDate}`}</CapLabel>
    ),
  },
  {
    /* nodeId: 123:5495 */
    title: 'Program name',
    dataIndex: 'programName',
    key: 'programName',
    width: 168,
    render: (text) => (
      /* nodeId: 123:5517 */
      <CapLabel type="label4">{text}</CapLabel>
    ),
  },
  {
    /* nodeId: 123:5532 */
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 168,
    render: (text) => (
      /* nodeId: 123:5538 */
      <CapLabel type="label4">{text}</CapLabel>
    ),
  },
  {
    /* nodeId: 123:5810 */
    title: 'Updated at',
    dataIndex: 'lastModifiedDate',
    key: 'updatedAt',
    width: 168,
    render: (date, record) => (
      <div>
        <CapLabel type="label4">{date}</CapLabel>
        <CapLabel type="label1">{record.lastModifiedBy}</CapLabel>
      </div>
    ),
  },
  {
    /* nodeId: 123:5964 — three-dot overflow (CapDropdown placeholder) */
    title: '',
    key: 'actions',
    width: 48,
    render: () => (
      <CapIcon
        type="more_vert"
        aria-label="Row actions"
      />
    ),
  },
];

// ── Skeleton Page Component ─────────────────────────────────────────────────

const MOCK_DATA = [
  { id: 'BEN001', externalId: 'EXT-001', name: 'Double Points Weekend', status: 'Live', programName: 'Loyalty 2025', category: 'Points', startDate: '2025-01-01', endDate: '2025-12-31', lastModifiedDate: '2025-03-15', lastModifiedBy: 'John Smith' },
  { id: 'BEN002', externalId: 'EXT-002', name: 'Birthday Bonus', status: 'Upcoming', programName: 'Loyalty 2025', category: 'Streak Rewards', startDate: '2025-04-01', endDate: '2025-04-30', lastModifiedDate: '2025-03-20', lastModifiedBy: 'Jane Doe' },
];

export default function BenefitsListingSkeleton() {
  return (
    /* nodeId: 123:5146 */
    <PageRoot>
      {/* ── Toolbar ── */}
      <ToolbarRow>
        {/* nodeId: 123:5153 */}
        <CapHeading type="h2">Benefits</CapHeading>

        {/* nodeId: 123:5154 — flex-row toolbar right */}
        <div style={{ display: 'flex', flex: '1 0 0', alignItems: 'center' }}>
          {/* nodeId: 123:5155 — search + filter group */}
          <SearchFilterGroup>
            {/* nodeId: 123:5161 */}
            <CapInput
              style={{ width: '360px', height: '40px' }}
              placeholder="Search"
              aria-label="Search benefits"
              /* enriched: role+text heuristic */
            />

            <DividerIconGroup>
              {/* nodeId: 123:5172 */}
              <CapDivider type="vertical" style={{ height: '20px', background: CAP_G09 }} />

              {/* nodeId: 123:5173 */}
              <div style={{ padding: CAP_SPACE_04, borderRadius: '24px' }}>
                <CapIcon
                  type="filter"
                  style={{ fontSize: '24px' }}
                  aria-label="Open filters"
                  /* enriched: hld.actions.opens isFilterDrawerOpen */
                />
              </div>
            </DividerIconGroup>
          </SearchFilterGroup>

          {/* nodeId: 123:5174 */}
          <CtaArea>
            {/* nodeId: 123:5176 */}
            <CapButton
              type="primary"
              /* enriched: hld.actions.Click Create Benefit */
            >
              Create Benefit
            </CapButton>
          </CtaArea>
        </div>
      </ToolbarRow>

      {/* ── Benefits Table ── */}
      <TableArea>
        {/* nodeId: 123:5178 */}
        <CapTable
          dataSource={MOCK_DATA}
          columns={SKELETON_COLUMNS}
          rowKey="id"
          pagination={{ total: 2, pageSize: 10, current: 1 }}
          /* enriched: hld.redux.selectors.makeSelectBenefits */
        />

        {/* Empty state — status=SUCCESS, benefits.length === 0 */}
        {false && <div>No benefits found.</div>}

        {/* Error state — status=FAILURE */}
        {false && <div>Error loading benefits.</div>}
      </TableArea>

      {/* ── Filter Drawer — conditionally rendered ── */}
      {/* nodeId: 122:4327 */}
      <CapDrawer
        visible={false}
        placement="right"
        width={440}
        closable={false}
        /* enriched: hld.actions.opens isFilterDrawerOpen */
      >
        {/* nodeId: 122:4328 — Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `34px ${CAP_SPACE_48}` }}>
          {/* nodeId: I122:4328;6:11518 */}
          <CapHeading type="h3">Benefit filters</CapHeading>
          {/* nodeId: I122:4328;6:11519 */}
          <CapIcon type="close" style={{ fontSize: '24px' }} aria-label="Close filter drawer" />
        </div>

        {/* nodeId: 122:4329 — Filter fields body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: CAP_SPACE_24, padding: `0 ${CAP_SPACE_48}`, width: '344px' }}>
          {/* nodeId: 122:4333 + 122:4334 */}
          <div>
            <CapLabel type="label4">Program name</CapLabel>
            <CapMultiSelect placeholder="Select program name" treeData={[]} appliedKeys={[]} width="100%" />
          </div>

          {/* nodeId: 122:4345 + 122:4346 */}
          <div>
            <CapLabel type="label4">Status</CapLabel>
            <CapMultiSelect placeholder="Select status" treeData={[]} appliedKeys={[]} width="100%" />
          </div>

          {/* nodeId: 122:4350 + 122:4351 */}
          <div>
            <CapLabel type="label4">Category</CapLabel>
            <CapMultiSelect placeholder="Select category" treeData={[]} appliedKeys={[]} width="100%" />
          </div>

          {/* nodeId: 122:4357 + 122:4358 (CapDateRangePicker) */}
          <div>
            <CapLabel type="label4">Duration</CapLabel>
            {/* BESPOKE — CapDateRangePicker resolved available per resolved-questions.md Q3 */}
            <div style={{ border: `1px solid ${CAP_G06}`, borderRadius: '4px', padding: '10px', width: '100%' }}>
              [CapDateRangePicker stub — Mar 28 2025 to Mar 29 2025]
            </div>
          </div>

          {/* nodeId: 122:4370 + 122:4371 */}
          <div>
            <CapLabel type="label4">Last updated</CapLabel>
            <CapMultiSelect placeholder="Select last updated" treeData={[]} appliedKeys={[]} width="100%" />
          </div>

          {/* nodeId: 122:4384 + 122:4385 */}
          <div>
            <CapLabel type="label4">Updated by</CapLabel>
            <CapMultiSelect placeholder="Select updated by" treeData={[]} appliedKeys={[]} width="100%" />
          </div>
        </div>

        {/* nodeId: 122:4394 — Drawer footer */}
        <CapRow
          type="flex"
          gutter={16}
          align="middle"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '440px', padding: `${CAP_SPACE_24} ${CAP_SPACE_48}`, background: CAP_WHITE }}
        >
          {/* nodeId: 122:4395 */}
          <CapButton type="primary" /* enriched: hld.actions.SET_ACTIVE_FILTERS */>
            Apply
          </CapButton>
          {/* nodeId: 122:4396 */}
          <CapButton type="secondary" /* enriched: hld.actions.CLEAR_ACTIVE_FILTERS */>
            Clear all filters
          </CapButton>
        </CapRow>
      </CapDrawer>
    </PageRoot>
  );
}
