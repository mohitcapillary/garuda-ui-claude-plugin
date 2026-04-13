import { FigmaColor, TokenMapping } from '../types';
/**
 * Convert a Figma color object (channels 0–1) to a #RRGGBB hex string.
 */
export declare function figmaColorToHex(color: FigmaColor): string;
/**
 * Find the token mapping whose figmaValuePattern hex is closest to the given hex.
 * Tries exact match first, then falls back to nearest Euclidean distance in RGB space.
 */
export declare function findColorToken(hex: string, tokens: TokenMapping[]): TokenMapping | null;
//# sourceMappingURL=color.d.ts.map