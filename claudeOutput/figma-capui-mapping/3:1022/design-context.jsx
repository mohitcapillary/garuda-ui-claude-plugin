// Figma node 3:1022 — Benefits listing page
// File: Q3rZlYt8ZY6g0TuVg1TZzm (Mohit-list)
// Fetched via: mcp__claude_ai_Figma__get_design_context
// Note: Figma response was sparse metadata (design too large for single fetch);
// structural summary captured here for downstream reuse.

/*
Structure:

<Page title="Benefits">
  <Toolbar>
    <SearchInput placeholder="Search" iconLeft="search" width="360" />
    <Divider vertical />
    <IconButton name="Download config" />  // 32x32 icon button
    <FilterIcon />                         // filter toggle (from screenshot)
    <CapButton variant="primary" color="green" label="Create Benefit" />
  </Toolbar>

  <CapTable>
    Columns (left to right):
      1. Name             — two-line cell: bold benefit title + description + "ID: ..." + "EXT ID: ..."
      2. Status           — badge + secondary status text (e.g. "2 Days left", "Rejected on Dec 25", "Starts in 5 days", "Draft saved")
      3. Duration ⇅       — two-line cell: start datetime + end datetime + updater name in grey; sortable
      4. Program name     — single line (e.g. "Loyalty Program 2025")
      5. Category         — single line (e.g. "Streak Rewards", "Milestone Rewards")
      6. Updated at ⇅     — datetime + updater name in grey; sortable

    Observed status values in screenshot: "Awaiting Approval" (orange dot),
      "Draft" (grey), "Upcoming" (blue).
      "Active", "Ended" implied from PRD but not visible in current node.
  </CapTable>
</Page>

Absent from this node (but possibly on parent/adjacent nodes):
  - Summary count cards (total / live / upcoming / ended)
  - Grouped-by-category listings
  - Filter panel / active filter chips
  - Row hover/click affordances
  - Empty / loading / error states
  - Pagination controls
*/
