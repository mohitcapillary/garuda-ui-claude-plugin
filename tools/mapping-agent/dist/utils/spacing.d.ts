import { TokenMapping } from '../types';
/**
 * Find the nearest $cap-space-* SCSS variable for a given pixel value.
 * Uses the registry tokens if available, falls back to built-in table.
 */
export declare function findSpacingToken(px: number, tokens?: TokenMapping[]): string;
/**
 * Convert pixels to rem string using 14px base (blaze-ui convention).
 */
export declare function pxToRem(px: number, basePx?: number): string;
//# sourceMappingURL=spacing.d.ts.map