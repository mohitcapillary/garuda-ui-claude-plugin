import { FigmaColor, TokenMapping } from '../types';

/**
 * Convert a Figma color object (channels 0–1) to a #RRGGBB hex string.
 */
export function figmaColorToHex(color: FigmaColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0').toLowerCase();
}

/**
 * Find the token mapping whose figmaValuePattern hex is closest to the given hex.
 * Tries exact match first, then falls back to nearest Euclidean distance in RGB space.
 */
export function findColorToken(
  hex: string,
  tokens: TokenMapping[]
): TokenMapping | null {
  const colorTokens = tokens.filter(
    (t) => t.tokenType === 'COLOR' && t.figmaValuePattern
  );

  if (colorTokens.length === 0) return null;

  const normalized = hex.toLowerCase();

  // 1. Exact match
  const exact = colorTokens.find(
    (t) => t.figmaValuePattern?.toLowerCase() === normalized
  );
  if (exact) return exact;

  // 2. Nearest by RGB distance
  const target = hexToRgb(normalized);
  if (!target) return null;

  let best: TokenMapping | null = null;
  let bestDist = Infinity;

  for (const token of colorTokens) {
    const candidate = hexToRgb(token.figmaValuePattern ?? '');
    if (!candidate) continue;
    const dist = rgbDistance(target, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = token;
    }
  }

  return best;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}
