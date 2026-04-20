/**
 * PREVIEW SKELETON — Phase 2.5 layout verification
 * This is NOT production code. It confirms the layout structure
 * matches the Figma design before 11+ files are generated.
 *
 * Figma: 32:3147 (LoyaltyProgramTiers)
 * Recipe: 32-3147.recipe.json
 * Design tokens: extracted from design-context.jsx
 */

/* ─── LoyaltyProgramTiers (page) ─── */
<div className="tier-listing-page" style={{ background: 'CAP_WHITE', paddingTop: '12px' }}>
  {/* Header: program selector + action buttons */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 CAP_SPACE_32', height: '36px', marginBottom: 'CAP_SPACE_12' }}>
    <CapSelect value={selectedProgramId} options={programOptions} size="large" />
    {/* EXACT:32:3150 */}

    <div style={{ display: 'flex', gap: 'CAP_SPACE_20' }}>
      <CapButton type="secondary" className="create-tier-btn">Create tier</CapButton>
      {/* EXACT:32:3158 — bg CAP_G08, no border */}

      <CapButton type="secondary" className="create-benefit-btn">Create benefit</CapButton>
      {/* EXACT:32:3159 — bg white, border 1px CAP_G01 */}
    </div>
  </div>

  {/* Content area */}
  <div style={{ maxWidth: '1214px', overflow: 'clip', paddingRight: 'CAP_SPACE_12' }}>
    {/* Tabs — BESPOKE:32:3741 → CapTab via Reviewer Override */}
    <CapTab activeKey={activeTab} onChange={handleTabChange} panes={tabPanes} />

    {/* Comparison grid */}
    <div style={{ display: 'flex', border: '1px solid CAP_G06', overflow: 'clip' }}>
      {/* Fixed row labels column */}
      <div style={{ width: '240px', flexShrink: 0, background: 'CAP_WHITE', position: 'sticky', left: 0, zIndex: 1 }}>
        {/* Section header: Basic details */}
        <TierSectionHeader label="Basic details" id="section-basic-details" />
        {/* h:41px, bg:CAP_G08, font:12px/500 CAP_G01, padding-left:24px */}

        {/* Data row labels */}
        <div style={{ height: '81px', padding: '16px 0 0 24px', borderBottom: '1px solid CAP_G06', borderRight: '1px solid CAP_G06' }}>
          Description
        </div>
        <div style={{ height: '33px', padding: '8px 0 0 24px', borderBottom: '1px solid CAP_G06', borderRight: '1px solid CAP_G06' }}>
          Duration
        </div>
        <div style={{ height: '33px', padding: '8px 0 0 24px', borderBottom: '1px solid CAP_G06', borderRight: '1px solid CAP_G06' }}>
          Members (Total - 280.2k)
        </div>

        <TierSectionHeader label="Eligibility Criteria" id="section-eligibility-criteria" />
        {/* ...5 rows: Type, Activities, Duration, Upgrade Schedule, Nudges */}

        <TierSectionHeader label="Renewal Criteria" id="section-renewal-criteria" />
        {/* ...5 rows: same as eligibility */}

        <TierSectionHeader label="Downgrade criteria" id="section-downgrade-criteria" />
        {/* ...3 rows: Downgrade to, Schedule, Expiry reminders */}

        <TierSectionHeader label="Benefit category" id="section-benefits" />
        {/* ...11 dynamic rows from benefitCategories */}
      </div>

      {/* Scrollable tier columns */}
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'fit-content' }}>
          {/* Per-tier column */}
          {tiers.map(tier => (
            <div key={tier.tierId} style={{ width: '303px', flexShrink: 0 }}>
              {/* Column header */}
              <TierColumnHeader
                tierName={tier.tierName}
                colorCode={tier.colorCode}
                tierStatus={tier.tierStatus}
                onEdit={() => onEditTier(tier.tierId)}
              />
              {/* h:41px, bg:CAP_G08, dot:12x12 rounded, name:12px/500, badge:bg #DAEBCA, edit:16x16 */}

              {/* Data cells per row — one per section row */}
              <TierDataCell value={tier.tierDescription} height="81px" />
              <TierDataCell value={formatDuration(tier.duration)} height="33px" />
              <TierDataCell value={formatMemberCount(tier.memberCount)} height="33px" />
              {/* ... repeats for all section rows */}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
