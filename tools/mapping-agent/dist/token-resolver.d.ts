import { FigmaVariable, FigmaVariableDefs, TokenMapping, TokenResolutionMap } from './types';
/**
 * Resolve a single Figma variable to its blaze-ui SCSS variable name.
 * Matches by name first, then by hex/value pattern.
 * Returns null if no match found.
 */
export declare function resolveToken(variable: FigmaVariable, tokens: TokenMapping[]): string | null;
/**
 * Resolve all variables from a get_variable_defs response.
 * Returns a TokenResolutionMap with RESOLVED/UNRESOLVED status per variable.
 */
export declare function resolveAllTokens(variableDefs: FigmaVariableDefs, tokens: TokenMapping[], figmaFileKey?: string): TokenResolutionMap;
//# sourceMappingURL=token-resolver.d.ts.map