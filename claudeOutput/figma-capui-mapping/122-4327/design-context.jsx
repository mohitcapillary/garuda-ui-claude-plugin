const imgIcon = "https://www.figma.com/api/mcp/asset/8542a83c-6ddd-4e5c-9437-9c9f1bd7309a";
const imgColor = "https://www.figma.com/api/mcp/asset/69284cb4-f26a-4a89-b915-db5a6f6cfa9e";
const imgShape = "https://www.figma.com/api/mcp/asset/b35ece4c-5766-45be-802a-081fd91213ef";
const imgColor1 = "https://www.figma.com/api/mcp/asset/ece99275-cb80-4e8c-a70c-bd1aeb3e88f1";
const imgMask = "https://www.figma.com/api/mcp/asset/2c575d5f-50d7-4939-94ed-7f66156bf1cf";
const imgColor2 = "https://www.figma.com/api/mcp/asset/0c866c9e-22f3-4b11-a5f4-b408d73a6c63";
const imgGroup = "https://www.figma.com/api/mcp/asset/4f66560f-a6f9-4dda-81d4-4ebd8f04beec";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/7e9b23a1-1606-43a2-b1a7-ad75ac62cbf5";

export default function CapDrawerBenefitsFilterDrawer() {
  return (
    <div className="bg-white relative size-full" data-node-id="122:4327" data-name="CapDrawerBenefitsFilterDrawer">
      {/* Header: "Benefit filters" title + X close icon */}
      <div className="absolute content-stretch flex flex-col items-start right-0 top-0 w-[440px]" data-node-id="122:4328" data-name="Rightpane">
        <div className="bg-white content-stretch flex gap-[24px] items-center px-[48px] py-[34px] relative shrink-0 w-full" data-node-id="I122:4328;6:11517">
          <div className="flex flex-[1_0_0] flex-col font-medium leading-[0] text-[#091e42] text-[20px]" data-node-id="I122:4328;6:11518">
            <p className="leading-[28px]">Benefit filters</p>
          </div>
          <div className="relative shrink-0 size-[24px]" data-node-id="I122:4328;6:11519" data-name="Atoms/Icons/24/Nav/Close" />
        </div>
      </div>
      {/* Filter fields body */}
      <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[48px] top-[108px] w-[344px]" data-node-id="122:4329">
        {/* Program name - CapMultiSelect */}
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-node-id="122:4330" data-name="Input fields- Top label">
          <div data-node-id="122:4333">Program name</div>
          <div className="border border-[#b3bac5] rounded-[4px] p-[10px]" data-node-id="122:4334" data-name="CapMultiSelect">
            <span>Loyalty Program 2025</span>
          </div>
        </div>
        {/* Status - CapMultiSelect */}
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-node-id="122:4342" data-name="Input fields- Top label">
          <div data-node-id="122:4345">Status</div>
          <div data-node-id="122:4346" data-name="CapMultiSelect">Upcoming</div>
        </div>
        {/* Category - CapMultiSelect */}
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-node-id="122:4347" data-name="Input fields- Top label">
          <div data-node-id="122:4350">Category</div>
          <div data-node-id="122:4351" data-name="CapMultiSelect">Streak Rewards</div>
        </div>
        {/* Duration - CapDateRangePicker */}
        <div className="content-stretch flex flex-col gap-[8px] h-[72px] items-start" data-node-id="122:4352">
          <div data-node-id="122:4357">Duration</div>
          <div data-node-id="122:4358" data-name="CapDateRangePicker">Mar 28 2025 → Mar 29 2025</div>
        </div>
        {/* Last updated - CapMultiSelect */}
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-node-id="122:4365">
          <div data-node-id="122:4370">Last updated</div>
          <div data-node-id="122:4371" data-name="CapMultiSelect">Select last updated</div>
        </div>
        {/* Updated by - CapMultiSelect */}
        <div className="content-stretch flex flex-col gap-[8px] h-[72px] items-start" data-node-id="122:4379">
          <div data-node-id="122:4384">Updated by</div>
          <div data-node-id="122:4385" data-name="CapMultiSelect">Select updated by</div>
        </div>
      </div>
      {/* Footer: Apply + Clear all filters buttons */}
      <div className="absolute bg-white bottom-0 flex gap-[16px] items-center left-0 px-[48px] py-[24px] w-[440px]" data-node-id="122:4394">
        <div data-node-id="122:4395" data-name="CapButton">Apply</div>
        <div data-node-id="122:4396" data-name="CapButton">Clear all filters</div>
      </div>
    </div>
  );
}
