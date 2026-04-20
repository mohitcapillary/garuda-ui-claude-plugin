// design-context.jsx for node 123:5146 (Listing Page)
// NOTE: The root node was too large for get_design_context in a single call.
// Sub-nodes were fetched individually. This file consolidates the captured sub-sections.

// =========================================
// SUB-NODE 123:5150 — Toolbar (Header Row)
// =========================================
// "Benefits" page title + Search input + Filter icon + "Create Benefit" CTA button
export function Frame2087331367_Toolbar() {
  return (
    <div className="content-stretch flex gap-[40px] items-center relative size-full" data-node-id="123:5150">
      {/* Page title */}
      <div data-node-id="123:5153" className="font-medium text-[#091e42] text-[24px] leading-[32px]">Benefits</div>
      {/* Search input + filter icon + CTA */}
      <div className="content-stretch flex flex-[1_0_0] gap-[478px] items-center min-w-px relative" data-node-id="123:5154">
        {/* Left: search + filter group */}
        <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[413px]" data-node-id="123:5155">
          {/* Search field (CapInput / styled search) */}
          <div className="border border-[#ebecf0] rounded-[4px] h-[40px] w-[360px] flex items-center p-[8px]" data-node-id="123:5161" data-name="Field states">
            <div className="size-[16px]" data-node-id="123:5164" data-name="Icon left" />
            <span className="text-[#b3bac5] text-[14px]" data-node-id="123:5167">Search</span>
          </div>
          {/* Vertical divider + filter icon */}
          <div className="flex gap-[8px] items-center" data-node-id="123:5170">
            <div className="bg-[#f6f6f6] h-[20px] w-px" data-node-id="123:5172" data-name="Divider/Vector/Vertical" />
            <div className="p-[4px] rounded-[24px]" data-node-id="123:5173" data-name="Download config">
              {/* Filter icon (Atoms/Icons/24/filter) */}
              <div className="size-[24px]" data-node-id="I123:5173;1298:169100" data-name="Atoms/Icons/24/filter" />
            </div>
          </div>
        </div>
        {/* Right: Create Benefit button */}
        <div className="flex flex-[1_0_0] items-center justify-end" data-node-id="123:5174">
          <div className="bg-[#46af46] h-[40px] px-[24px] py-[12px] rounded-[4px]" data-node-id="123:5176" data-name="Button">
            <span className="font-medium text-[14px] text-white">Create Benefit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================
// SUB-NODE 123:5178 — Table Body (BenefitsTable layout)
// =========================================
// Multi-column table: each column frame = one column; each "Row" frame = one data row
// Columns: Name (123:5179), Status (123:5303), Duration (123:5367), Program name (123:5495),
//          Category (123:5532), Updated at (123:5810)
// Column structure: Header (CapRow) + Row[] (CapRow, each containing cell content)
// Status cells use CapStatus component
// Updated at column last cell has three-dot menu (more_vert icon → CapDropdown)

// Columns summary (from metadata analysis):
// 123:5179 "NameColumn" - Name column (width: 259px)
// 123:5303 "StatusColumn" - Status column (width: 168px)  — contains CapStatus badges
// 123:5367 "DurationColumn" - Duration column (width: 168px)
// 123:5495 "ProgramNameColumn" - Program name column (width: 168px)
// 123:5532 "CategoryColumn" - Category column (width: 168px)
// 123:5810 "UpdatedAtColumn" - Updated at column + three-dot menu (width: 168px, last column)

// Dropdown (three-dot overflow menu): node 123:5964 (CapDropdown, PARTIAL)
// Contains: Duplicate, Change logs, Export data, Pause options
