import { TokenMapping } from '../types';

/** All $cap-space-* values in px (1rem = 14px) */
const CAP_SPACE_PX: Array<[number, string]> = [
  [0, '$cap-space-00'],
  [1, '$cap-space-01'],
  [2, '$cap-space-02'],
  [3, '$cap-space-03'],
  [4, '$cap-space-04'],
  [6, '$cap-space-06'],
  [8, '$cap-space-08'],
  [12, '$cap-space-12'],
  [16, '$cap-space-16'],
  [18, '$cap-space-18'],
  [18.2, '$cap-space-19'],
  [20, '$cap-space-20'],
  [22.6, '$cap-space-23'],
  [24, '$cap-space-24'],
  [28, '$cap-space-28'],
  [32, '$cap-space-32'],
  [36, '$cap-space-36'],
  [40, '$cap-space-40'],
  [42, '$cap-space-42'],
  [44, '$cap-space-44'],
  [48, '$cap-space-48'],
  [52, '$cap-space-52'],
  [56, '$cap-space-56'],
  [60, '$cap-space-60'],
  [64, '$cap-space-64'],
  [72, '$cap-space-72'],
  [80, '$cap-space-80'],
];

/**
 * Find the nearest $cap-space-* SCSS variable for a given pixel value.
 * Uses the registry tokens if available, falls back to built-in table.
 */
export function findSpacingToken(
  px: number,
  tokens?: TokenMapping[]
): string {
  // If token registry is available, prefer it
  if (tokens?.length) {
    const spacingTokens = tokens.filter((t) => t.tokenType === 'SPACING');
    if (spacingTokens.length > 0) {
      let best = spacingTokens[0];
      let bestDist = Infinity;
      for (const token of spacingTokens) {
        const tokenPx = parseFloat(token.figmaValuePattern ?? '');
        if (isNaN(tokenPx)) continue;
        const dist = Math.abs(tokenPx - px);
        if (dist < bestDist) {
          bestDist = dist;
          best = token;
        }
      }
      return best.blazeCSSVar;
    }
  }

  // Fallback to built-in table
  let best = CAP_SPACE_PX[0];
  let bestDist = Math.abs(CAP_SPACE_PX[0][0] - px);
  for (const entry of CAP_SPACE_PX) {
    const dist = Math.abs(entry[0] - px);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best[1];
}

/**
 * Convert pixels to rem string using 14px base (blaze-ui convention).
 */
export function pxToRem(px: number, basePx = 14): string {
  const rem = px / basePx;
  return `${parseFloat(rem.toFixed(3))}rem`;
}
