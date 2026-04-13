# 06. Cap-UI-Library Tokens

**Status**: warnings — 163/184 style files import tokens (89%), 8 files with hardcoded hex values

## Rules

### Rule 1: Import tokens from `@capillarytech/cap-ui-library/styled/variables`

Two import patterns are acceptable:
- `import StyledVars from '@capillarytech/cap-ui-library/styled';`
- `import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';`

**Why**: 163 files already import tokens. Centralized tokens ensure design consistency.

### Rule 2: Never hardcode hex colors that match a token

**Why**: Hardcoded values diverge when the design system updates its palette.

### Rule 3: Use `CAP_SPACE_*` tokens for spacing

**Why**: The spacing scale uses 1rem = 14px base. Tokens ensure consistent spacing.

### Rule 4: Use `FONT_SIZE_*` for typography sizes

**Why**: 5 standard sizes cover all use cases.

## Token Reference — Colors

| Token | Value | Category |
|-------|-------|----------|
| CAP_PRIMARY.base | #47af46 | primary |
| CAP_PRIMARY.hover | #1f9a1d | primary |
| CAP_PRIMARY.disabled | #a1d8a0 | primary |
| CAP_SECONDARY.base | #2466ea | secondary |
| CAP_G01 | #091e42 | grey |
| CAP_G02 | #253858 | grey |
| CAP_G03 | #42526e | grey |
| CAP_G04 | #5e6c84 | grey |
| CAP_G05 | #97a0af | grey |
| CAP_G06 | #b3bac5 | grey |
| CAP_G07 | #dfe2e7 | grey |
| CAP_G08 | #ebecf0 | grey |
| CAP_G09 | #f4f5f7 | grey |
| CAP_G10 | #fafbfc | grey |
| CAP_G11 | #7a869a | grey |
| CAP_G12 | #e8e8e8 | grey |
| CAP_G13 | #ecece7 | grey |
| CAP_G14 | #e9f0fd | grey |
| CAP_G15 | #efefef | grey |
| CAP_G16 | #2a2a2a | grey |
| CAP_G17 | #7F8185 | grey |
| CAP_G18 | #dcdee2 | grey |
| CAP_G19 | #8a9ab2 | grey |
| CAP_G20 | #c2c2c2 | grey |
| CAP_G21 | #fafafa | grey |
| CAP_G22 | #f3f3f3 | grey |
| FONT_COLOR_01 | #091E42 | font |
| FONT_COLOR_02 | #5E6C84 | font |
| FONT_COLOR_03 | #97A0AF | font |
| FONT_COLOR_04 | #B3BAC5 | font |
| FONT_COLOR_05 | #2466EA | font |
| FONT_COLOR_06 | #FFFFFF | font |
| CAP_RED | #ea213a | named |
| CAP_ORANGE | #f87d23 | named |
| CAP_YELLOW | #fec52e | named |
| CAP_BLUE | #23cccc | named |
| CAP_PURPLE | #8517e5 | named |
| CAP_PINK | #e51fa3 | named |
| BG_01 - BG_08 | various | background |
| CAP_COLOR_01 - CAP_COLOR_27 | various | semantic |

## Token Reference — Spacing

| Token | Value | ~px |
|-------|-------|-----|
| CAP_SPACE_02 | 0.142rem | 2px |
| CAP_SPACE_04 | 0.285rem | 4px |
| CAP_SPACE_08 | 0.571rem | 8px |
| CAP_SPACE_12 | 0.857rem | 12px |
| CAP_SPACE_16 | 1.142rem | 16px |
| CAP_SPACE_20 | 1.428rem | 20px |
| CAP_SPACE_24 | 1.714rem | 24px |
| CAP_SPACE_28 | 2rem | 28px |
| CAP_SPACE_32 | 2.285rem | 32px |
| CAP_SPACE_40 | 2.857rem | 40px |
| CAP_SPACE_48 | 3.428rem | 48px |
| CAP_SPACE_80 | 5.714rem | 80px |
| CAP_SPACE_140 | 10rem | 140px |

## Token Reference — Typography & Icons

| Token | Value |
|-------|-------|
| FONT_SIZE_VL | 24px |
| FONT_SIZE_L | 16px |
| FONT_SIZE_M | 14px |
| FONT_SIZE_S | 12px |
| FONT_SIZE_VS | 10px |
| FONT_WEIGHT_REGULAR | 400 |
| FONT_WEIGHT_MEDIUM | 500 |
| FONT_FAMILY | "Roboto", sans-serif |
| ICON_SIZE_XS | 12px |
| ICON_SIZE_S | 16px |
| ICON_SIZE_M | 24px |
| ICON_SIZE_L | 32px |

## Good Examples

### PromotionSettings/style.js

**File**: `app/components/organisms/PromotionSettings/style.js`

```javascript
import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
const { CAP_G09, CAP_G05, FONT_COLOR_01, FONT_COLOR_03 } = styledVars;

const styles = css`
  .selected-switch { color: ${FONT_COLOR_01}; }
  .info-text { color: ${FONT_COLOR_03}; }
  .container { border: 1px solid ${CAP_G09}; }
`;
```

Destructured token imports used in css template literal.

## Bad Examples

### AnalyticsDrawer/styles.js — Hardcoded hex

**File**: `app/components/organisms/AnalyticsDrawer/styles.js`

```javascript
export const NoteText = styled.span`
  color: #091e42;
`;
export const NoteContainer = styled.div`
  background: #fff4d6;
`;
```

**Issue**: #091e42 = CAP_G01/FONT_COLOR_01, #fff4d6 = CAP_COLOR_04.

**Fix**:

```javascript
import * as styledVars from '@capillarytech/cap-ui-library/styled/variables';
const { CAP_G01, CAP_COLOR_04 } = styledVars;

export const NoteText = styled.span`
  color: ${CAP_G01};
`;
export const NoteContainer = styled.div`
  background: ${CAP_COLOR_04};
`;
```

## Flagged Files

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `app/components/organisms/AnalyticsDrawer/styles.js` | #091e42, #97a0af, #fff4d6 | Use CAP_G01, CAP_G05, CAP_COLOR_04 |
| `app/components/organisms/GroupActivity/styles.js` | #f0f0f0, #fafafa, #e8e8e8 | Use CAP_G15, CAP_G21, CAP_G12 |
| `app/components/organisms/IssuePromotionWorkflowAction/style.js` | #dfe2e7, #e9f0fe, #2466ea | Use CAP_G07, CAP_PALE_GREY, CAP_SECONDARY |
| `app/components/organisms/AwardPointsConfig/style.js` | #f4f5f7 | Use CAP_G09 |
| `app/components/organisms/IssueCouponIssueRewardAdditionalSettings/style.js` | #fafbfc | Use CAP_G10 |
| `app/components/organisms/PointsExpiry/style.js` | #f5f5f5 | Use CAP_G15 or CAP_G22 |
| `app/components/organisms/PromotionAdvancedSettings/style.js` | 132px, 324px, 140px | Use CAP_SPACE_* or percentage |
| `app/components/organisms/Creatives/style.js` | 276px, 140px !important | Use responsive layout |

(8 files flagged)
