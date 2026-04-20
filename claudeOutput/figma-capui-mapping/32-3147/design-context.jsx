const imgIcon = "https://www.figma.com/api/mcp/asset/16552a7c-5ad8-4f2e-a6fa-e73143a17a64";
const imgColor = "https://www.figma.com/api/mcp/asset/f15f32f9-0baf-48df-80f8-2119fc22a72c";
const imgShape = "https://www.figma.com/api/mcp/asset/8b82c0b0-8742-450e-b080-f0564fc0de4c";
const imgColor1 = "https://www.figma.com/api/mcp/asset/0439499a-33c6-489a-a874-da8955f8ec89";
const imgMask = "https://www.figma.com/api/mcp/asset/360bf354-d257-4117-a976-90b3f961b293";
const imgColor2 = "https://www.figma.com/api/mcp/asset/d5ae1b58-4cc4-4a15-a00e-c42ebdd0feff";

type Frame27Props = {
  className?: string;
  property1?: "Selected";
};

function Frame27({ className, property1 = "Selected" }: Frame27Props) {
  return (
    <button className={className || "bg-white border-[#091e42] border-b border-solid content-stretch flex items-center justify-center px-[10px] py-[5px] relative"} data-node-id="22:814">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#091e42] text-[14px] text-left whitespace-nowrap" data-node-id="22:815" style={{ fontVariationSettings: "'wdth' 100" }}>
        Basic details
      </p>
    </button>
  );
}

function AtomsIcons24NavEdit({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="3:331" data-name="Atoms/Icons/24/Nav/edit">
      <div className="absolute inset-[12.5%_12.49%_12.5%_12.5%]" data-node-id="3:332" data-name="icon">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
      </div>
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[3px_3px] mask-size-[18.003px_18px]" data-node-id="3:340" style={{ maskImage: `url('${imgColor}')` }} data-name="↳ 🎨Color">
        <div className="absolute bg-[#091e42] inset-0" data-node-id="I3:340;0:3291" data-name="grey_k-091E42" />
      </div>
    </div>
  );
}

export default function Component3TiersOldNav() {
  return (
    <div className="bg-white relative size-full" data-node-id="32:3147" data-name="LoyaltyProgramTiers">
      <div className="absolute content-stretch flex flex-col gap-[12px] items-center left-0 top-[23px] w-[1280px]" data-node-id="32:3148">
        <div className="content-stretch flex items-center justify-between px-[32px] relative shrink-0 w-full" data-node-id="32:3149">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-node-id="32:3150" data-name="CapSelect">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="32:3151">
              <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[24px] overflow-hidden relative shrink-0 text-[#091e42] text-[16px] text-ellipsis whitespace-nowrap" data-node-id="32:3153" style={{ fontVariationSettings: "'wdth' 100" }}>
                Loyalty program 2025
              </p>
              <div className="relative shrink-0 size-[24px]" data-node-id="32:3154" data-name="Atoms/Icons/24/chevron-down">
                <div className="absolute inset-[36.29%_26.71%_36.31%_26.71%]" data-node-id="I32:3154;6:12069" data-name="Shape">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShape} />
                </div>
                <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[6.41px_8.71px] mask-size-[11.18px_6.576px]" data-node-id="I32:3154;6:12071" style={{ maskImage: `url('${imgColor1}')` }} data-name="↳ 🎨Color">
                  <div className="absolute bg-[#091e42] inset-0" data-node-id="I32:3154;6:12071;0:3291" data-name="grey_k-091E42" />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-[261px]" data-node-id="32:3157">
            <div className="bg-[#ebecf0] content-stretch flex h-[36.258px] items-center justify-between pl-[10px] pr-[12px] py-[6px] relative rounded-[4px] shrink-0 w-[108px]" data-node-id="32:3158" data-name="CapButton">
              <div className="relative shrink-0 size-[16px]" data-node-id="I32:3158;473:27785" data-name="Atoms/Icons/16/add">
                <div className="absolute inset-[12.5%]" data-node-id="I32:3158;473:27785;0:5038" data-name="Mask">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMask} />
                </div>
                <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px_2px] mask-size-[12px_12px]" data-node-id="I32:3158;473:27785;0:5041" style={{ maskImage: `url('${imgColor2}')` }} data-name="↳ 🎨Color">
                  <div className="absolute bg-[#091e42] inset-0" data-node-id="I32:3158;473:27785;0:5041;0:3325" data-name="secondary_dark_blue" />
                </div>
              </div>
              <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#091e42] text-[14px] whitespace-nowrap" data-node-id="I32:3158;473:27786" style={{ fontVariationSettings: "'wdth' 100" }}>
                Create tier
              </p>
            </div>
            <div className="border border-black border-solid content-stretch flex h-[36px] items-center justify-between pl-[10px] pr-[12px] py-[6px] relative rounded-[4px] shrink-0 w-[133px]" data-node-id="32:3159" data-name="CapButton">
              <div className="relative shrink-0 size-[16px]" data-node-id="I32:3159;473:27816" data-name="Atoms/Icons/16/add">
                <div className="absolute inset-[12.5%]" data-node-id="I32:3159;473:27816;0:5038" data-name="Mask">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMask} />
                </div>
                <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px_2px] mask-size-[12px_12px]" data-node-id="I32:3159;473:27816;0:5041" style={{ maskImage: `url('${imgColor2}')` }} data-name="↳ 🎨Color">
                  <div className="absolute bg-[#091e42] inset-0" data-node-id="I32:3159;473:27816;0:5041;0:3325" data-name="secondary_dark_blue" />
                </div>
              </div>
              <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#091e42] text-[14px] whitespace-nowrap" data-node-id="I32:3159;473:27817" style={{ fontVariationSettings: "'wdth' 100" }}>
                Create benefit
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pr-[12px] relative shrink-0 w-[1214px]" data-node-id="32:3160" data-name="Container">
          <div className="h-[1476px] relative shrink-0 w-[1214px]" data-node-id="32:3161" data-name="y3">
            <div className="absolute h-[1245px] left-0 top-0 w-[1212px]" data-node-id="32:3162" data-name="TierComparisonTable">
              <div className="absolute border border-[#dfe2e7] border-solid content-stretch flex h-[1157px] items-start left-0 overflow-clip p-px top-[30px] w-[1212px]" data-node-id="32:3163" data-name="CapTable">
                <div className="bg-white h-[1156px] relative shrink-0 w-[240px]" data-node-id="32:3164" data-name="RowLabelsColumn">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                    <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-r border-solid h-[41px] relative shrink-0 w-full" data-node-id="32:3165" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[16px] left-[24px] top-[10px] w-[68.484px]" data-node-id="32:3166" data-name="Paragraph">
                          <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3167" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Basic details
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[81px] relative shrink-0 w-full" data-node-id="32:3168" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[24px] pr-px pt-[16px] relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3169" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3170" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Description
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3171" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3172" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3173" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Duration
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3174" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3175" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3176" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Members (Total - 280.2k)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid h-[44px] relative shrink-0 w-full" data-node-id="32:3177" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[16px] left-[24px] top-[13.5px] w-[90.867px]" data-node-id="32:3178" data-name="Paragraph">
                          <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3179" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Eligibility Criteria
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3180" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3181" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3182" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Type
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3183" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3184" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3185" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Activities
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3186" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3187" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3188" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Duration
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3189" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3190" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3191" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Upgrade Schedule
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[34px] relative shrink-0 w-full" data-node-id="32:3192" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3193" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3194" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Nudges / Communication
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid h-[43px] relative shrink-0 w-full" data-node-id="32:3195" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[16px] left-[24px] top-[13.5px] w-[87.844px]" data-node-id="32:3196" data-name="Paragraph">
                          <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3197" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Renewal Criteria
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3198" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3199" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3200" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Type
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3201" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3202" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3203" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Activities
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3204" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3205" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3206" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Duration
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3207" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3208" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3209" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Upgrade Schedule
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[34px] relative shrink-0 w-full" data-node-id="32:3210" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3211" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3212" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Nudges / Communication
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid h-[43px] relative shrink-0 w-full" data-node-id="32:3213" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[16px] left-[24px] top-[13.5px] w-[101.469px]" data-node-id="32:3214" data-name="Paragraph">
                          <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3215" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Downgrade criteria
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3216" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3217" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3218" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Downgrade to
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3219" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3220" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3221" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Schedule
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[34px] relative shrink-0 w-full" data-node-id="32:3222" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3223" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3224" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Expiry reminders
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid h-[43px] relative shrink-0 w-full" data-node-id="32:3225" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[16px] left-[24px] top-[13.5px] w-[44.305px]" data-node-id="32:3226" data-name="Paragraph">
                          <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3227" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Benefit category
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3228" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3229" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3230" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Welcome Gift
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3231" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3232" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3233" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Upgrade bonus points
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3234" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3235" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3236" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Tier badge
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3237" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3238" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3239" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Renewal Bonus
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3240" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3241" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3242" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Loyalty Voucher
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3243" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3244" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3245" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Earn Points
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3246" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3247" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3248" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Priority Support
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3249" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3250" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3251" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Free Shipping
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3252" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3253" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3254" style={{ fontVariationSettings: "'wdth' 100" }}>
                              VIP Events
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3255" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3256" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3257" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Birthday Bonus
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-full" data-node-id="32:3258" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[24px] pr-px relative size-full">
                        <div className="h-[16px] relative shrink-0 w-[203px]" data-node-id="32:3259" data-name="Paragraph">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3260" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Exclusive Comms
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[1167px] relative shrink-0 w-[971px]" data-node-id="32:3261" data-name="Container">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pr-[-427px] relative rounded-[inherit] size-full">
                    <div className="content-stretch flex flex-col h-[1156px] items-start relative shrink-0 w-full" data-node-id="32:3262" data-name="Container">
                      <div className="h-[41px] relative shrink-0 w-[1515px]" data-node-id="32:3263" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-r border-solid h-[41px] relative shrink-0 w-[303px]" data-node-id="32:3264" data-name="TierColumnHeader_Bronze">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[12px] pr-px pt-[10px] relative size-full">
                              <div className="h-[20px] relative shrink-0 w-[266px]" data-node-id="32:3265" data-name="Container">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <div className="absolute bg-[#f97316] left-0 rounded-[12px] size-[12px] top-[4px]" data-node-id="32:3266" data-name="Container" />
                                  <div className="absolute h-[16px] left-[20px] top-[2px] w-[38px]" data-node-id="32:3267" data-name="Paragraph">
                                    <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3268" style={{ fontVariationSettings: "'wdth' 100" }}>
                                      Bronze
                                    </p>
                                  </div>
                                  <div className="absolute bg-[#daebca] content-stretch flex h-[20px] items-center justify-center left-[66px] px-[6px] rounded-[4px] top-0 w-[45.055px]" data-node-id="32:3269" data-name="Container">
                                    <div className="h-[16px] relative shrink-0 w-[33.055px]" data-node-id="32:3270" data-name="Paragraph">
                                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3271" style={{ fontVariationSettings: "'wdth' 100" }}>
                                          Active
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <AtomsIcons24NavEdit className="absolute left-[250px] size-[16px] top-[2px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-r border-solid h-[41px] relative shrink-0 w-[303px]" data-node-id="32:3273" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[12px] pr-px pt-[10px] relative size-full">
                              <div className="h-[20px] relative shrink-0 w-[266px]" data-node-id="32:3274" data-name="Container">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <div className="absolute bg-[#afafaf] left-0 rounded-[12px] size-[12px] top-[4px]" data-node-id="32:3275" data-name="Container" />
                                  <div className="absolute h-[16px] left-[20px] top-[2px] w-[30px]" data-node-id="32:3276" data-name="Paragraph">
                                    <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3277" style={{ fontVariationSettings: "'wdth' 100" }}>
                                      Silver
                                    </p>
                                  </div>
                                  <div className="absolute bg-[#daebca] content-stretch flex h-[20px] items-center justify-center left-[58px] px-[6px] rounded-[4px] top-0 w-[45.055px]" data-node-id="32:3278" data-name="Container">
                                    <div className="h-[16px] relative shrink-0 w-[33.055px]" data-node-id="32:3279" data-name="Paragraph">
                                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3280" style={{ fontVariationSettings: "'wdth' 100" }}>
                                          Active
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-r border-solid h-[41px] relative shrink-0 w-[303px]" data-node-id="32:3281" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[12px] pr-px pt-[10px] relative size-full">
                              <div className="h-[20px] relative shrink-0 w-[98px]" data-node-id="32:3282" data-name="Container">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <div className="absolute bg-[#f9b116] left-0 rounded-[12px] size-[12px] top-[4px]" data-node-id="32:3283" data-name="Container" />
                                  <div className="absolute h-[16px] left-[20px] top-[2px] w-[25px]" data-node-id="32:3284" data-name="Paragraph">
                                    <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3285" style={{ fontVariationSettings: "'wdth' 100" }}>
                                      Gold
                                    </p>
                                  </div>
                                  <div className="absolute bg-[#daebca] content-stretch flex h-[20px] items-center justify-center left-[53px] px-[6px] rounded-[4px] top-0 w-[45.055px]" data-node-id="32:3286" data-name="Container">
                                    <div className="h-[16px] relative shrink-0 w-[33.055px]" data-node-id="32:3287" data-name="Paragraph">
                                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3288" style={{ fontVariationSettings: "'wdth' 100" }}>
                                          Active
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-r border-solid h-[41px] relative shrink-0 w-[303px]" data-node-id="32:3289" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[12px] pr-px pt-[10px] relative size-full">
                              <div className="h-[20px] relative shrink-0 w-[266px]" data-node-id="32:3290" data-name="Container">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <div className="absolute bg-[#e5e4e2] left-0 rounded-[12px] size-[12px] top-[2px]" data-node-id="32:3291" data-name="Container" />
                                  <div className="absolute h-[16px] left-[20px] top-0 w-[192.945px]" data-node-id="32:3292" data-name="Paragraph">
                                    <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3293" style={{ fontVariationSettings: "'wdth' 100" }}>
                                      Platinum
                                    </p>
                                  </div>
                                  <div className="absolute bg-[#daebca] content-stretch flex h-[20px] items-center justify-center left-[220.95px] px-[6px] rounded-[4px] top-0 w-[45.055px]" data-node-id="32:3294" data-name="Container">
                                    <div className="h-[16px] relative shrink-0 w-[33.055px]" data-node-id="32:3295" data-name="Paragraph">
                                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3296" style={{ fontVariationSettings: "'wdth' 100" }}>
                                          Active
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-[1_0_0] min-h-px relative w-[1515px]" data-node-id="32:3305" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[81px] relative shrink-0 w-[303px]" data-node-id="32:3306" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px pl-[12px] pr-px pt-[16px] relative size-full">
                              <div className="h-[48px] relative shrink-0 w-[266px]" data-node-id="32:3307" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 w-[266px]" data-node-id="32:3308" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Entry level tier with basic benefits and the options to upgrade as well. This will be updated as per the transaction.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[81px] shrink-0 w-[303px]" data-node-id="32:3309" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[81px] shrink-0 w-[303px]" data-node-id="32:3312" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[81px] shrink-0 w-[303px]" data-node-id="32:3315" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3321" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3322" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3323" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3324" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Jan 1, 2025 to Indefinite
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3328" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-solid flex-[1_0_0] h-[33px] min-w-px" data-node-id="32:3334" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3337" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3338" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3339" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3340" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    58.27K
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3341" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3342" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3343" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    58.27K
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3344" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3345" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3346" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    58.27K
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3347" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3348" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3349" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    58.27K
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid h-[44px] shrink-0 w-[1515px]" data-node-id="32:3353" data-name="Container" />
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3354" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3355" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3356" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3357" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Activity Based
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3361" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3364" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-solid flex-[1_0_0] h-[33px] min-w-px" data-node-id="32:3367" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3370" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3371" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3372" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3373" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Makes 100 transactions
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3374" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3377" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3380" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3386" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3387" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3388" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3389" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Indefinite
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3390" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3393" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3396" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3402" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3403" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3404" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3405" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Immediately when eligibility is met
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3406" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3409" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3412" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3418" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3419" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3420" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3421" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Welcome email on joining
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3422" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3425" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3428" data-name="Container" />
                        </div>
                      </div>
                      <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid border-t h-[44px] shrink-0 w-[1515px]" data-node-id="32:3434" data-name="Container" />
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3435" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3436" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3437" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3438" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Activity Based
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3439" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3442" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3445" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3451" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3452" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3453" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3454" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Makes 100 transactions
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3455" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3458" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3461" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3467" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3468" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3469" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3470" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Indefinite
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3471" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3474" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3477" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3478" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3479" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Indefinite
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3483" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3484" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3485" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3486" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Immediately when eligibility is met
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3487" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3490" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3493" data-name="Container" />
                        </div>
                      </div>
                      <div className="relative shrink-0 w-[1515px]" data-node-id="32:3499" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3500" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3501" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3502" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Welcome email on joining
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3503" data-name="Container" />
                        </div>
                      </div>
                      <div className="bg-[#fafbfc] border-[#dfe2e7] border-b border-solid border-t h-[44px] shrink-0 w-[1515px]" data-node-id="32:3515" data-name="Container" />
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3516" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3517" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3518" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3519" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Same as eligibility
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3520" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3523" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3526" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3532" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3533" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3534" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3535" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    10 days after downgrade
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3536" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3539" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3542" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3548" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3549" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3550" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3551" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Downgrade warning at 60 days before expiry
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3552" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3555" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3558" data-name="Container" />
                        </div>
                      </div>
                      <div className="bg-[#fafbfc] border border-[#dfe2e7] border-solid h-[44px] shrink-0 w-[1515px]" data-node-id="32:3564" data-name="Container" />
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3565" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3566" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3569" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3572" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3575" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3581" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3582" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3583" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3584" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    1000 points
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3585" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3588" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3591" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3597" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3598" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3599" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3600" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Gold Badge
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3601" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3604" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3607" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3613" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3614" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3617" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3620" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3621" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3622" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    10,000 points
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3623" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3629" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3630" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3631" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3632" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    RM 30 voucher
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3633" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3636" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3639" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3645" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3646" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3647" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3648" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    6 pt/RM
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3649" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3652" data-name="Container" />
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3655" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3661" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3662" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3663" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3664" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    Priority queue
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3665" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3668" data-name="Container" />
                          <div className="bg-[#f4f5f7] border-[#dfe2e7] border-b border-r border-solid h-[33px] shrink-0 w-[303px]" data-node-id="32:3671" data-name="Container" />
                        </div>
                      </div>
                      <div className="h-[33px] relative shrink-0 w-[1515px]" data-node-id="32:3677" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                          <div className="bg-white border-[#dfe2e7] border-b border-r border-solid h-[33px] relative shrink-0 w-[303px]" data-node-id="32:3678" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-px pl-[12px] pr-px relative size-full">
                              <div className="h-[16px] relative shrink-0 w-[266px]" data-node-id="32:3679" data-name="Paragraph">
                                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                  <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#091e42] text-[12px] top-0 whitespace-nowrap" data-node-id="32:3680" st

[OUTPUT TRUNCATED - exceeded 25000 token limit]

The tool output was truncated. If this MCP server provides pagination or filtering tools, use them to retrieve specific portions of the data. If pagination is not available, inform the user that you are working with truncated output and results may be incomplete.