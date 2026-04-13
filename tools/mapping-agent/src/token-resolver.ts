import { figmaColorToHex } from './utils/color';
import {
  FigmaVariable,
  FigmaVariableDefs,
  TokenMapping,
  TokenResolutionEntry,
  TokenResolutionMap,
} from './types';

/**
 * Resolve a single Figma variable to its blaze-ui SCSS variable name.
 * Matches by name first, then by hex/value pattern.
 * Returns null if no match found.
 */
export function resolveToken(
  variable: FigmaVariable,
  tokens: TokenMapping[]
): string | null {
  // 1. Exact name match
  const nameMatch = tokens.find(
    (t) => t.figmaVariable.toLowerCase() === variable.name.toLowerCase()
  );
  if (nameMatch) return nameMatch.blazeCSSVar;

  // 2. Value-based match (color → hex, float → string)
  const modeKeys = Object.keys(variable.valuesByMode);
  if (modeKeys.length === 0) return null;

  const firstValue = variable.valuesByMode[modeKeys[0]];

  if (variable.resolvedType === 'COLOR' && firstValue && typeof firstValue === 'object') {
    const colorVal = firstValue as { r?: number; g?: number; b?: number; a?: number };
    if (
      colorVal.r !== undefined &&
      colorVal.g !== undefined &&
      colorVal.b !== undefined
    ) {
      const hex = figmaColorToHex({
        r: colorVal.r,
        g: colorVal.g,
        b: colorVal.b,
        a: colorVal.a ?? 1,
      });
      const hexMatch = tokens.find(
        (t) =>
          t.tokenType === 'COLOR' &&
          t.figmaValuePattern?.toLowerCase() === hex.toLowerCase()
      );
      if (hexMatch) return hexMatch.blazeCSSVar;
    }
  }

  if (variable.resolvedType === 'FLOAT' && typeof firstValue === 'number') {
    const strVal = String(firstValue);
    const numMatch = tokens.find(
      (t) => t.figmaValuePattern === strVal
    );
    if (numMatch) return numMatch.blazeCSSVar;
  }

  if (variable.resolvedType === 'STRING' && typeof firstValue === 'string') {
    const strMatch = tokens.find(
      (t) => t.figmaValuePattern?.toLowerCase() === firstValue.toLowerCase()
    );
    if (strMatch) return strMatch.blazeCSSVar;
  }

  return null;
}

/**
 * Resolve all variables from a get_variable_defs response.
 * Returns a TokenResolutionMap with RESOLVED/UNRESOLVED status per variable.
 */
export function resolveAllTokens(
  variableDefs: FigmaVariableDefs,
  tokens: TokenMapping[],
  figmaFileKey?: string
): TokenResolutionMap {
  const entries: TokenResolutionEntry[] = [];

  for (const collection of variableDefs.collections) {
    for (const variable of collection.variables) {
      const blazeCSSVar = resolveToken(variable, tokens);
      entries.push({
        figmaVariable: variable.name,
        blazeCSSVar,
        status: blazeCSSVar ? 'RESOLVED' : 'UNRESOLVED',
      });
    }
  }

  return {
    figmaFileKey,
    resolvedAt: new Date().toISOString(),
    tokens: entries,
  };
}
