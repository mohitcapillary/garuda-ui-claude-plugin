export { resolveNode, resolveScreen } from './resolver';
export { resolveToken, resolveAllTokens } from './token-resolver';
export { loadRegistry, extendRegistry, validateRegistry } from './registry-loader';
export { writeRecipe, writeTokenMap } from './output-writer';
export { figmaColorToHex, findColorToken } from './utils/color';
export { findSpacingToken, pxToRem } from './utils/spacing';
export { findLabelType, findFontSizeToken, mapFontToNonRoboto } from './utils/typography';
export { MappingError } from './errors';
export type { FigmaNode, FigmaColor, FigmaFill, FigmaTextStyle, FigmaNodeType, FigmaVariable, FigmaVariableDefs, ComponentMapping, TokenMapping, MappingRegistry, ConversionRecipe, RecipeNode, FallbackSpec, MappingStatus, TokenResolutionMap, ValidationResult, } from './types';
//# sourceMappingURL=index.d.ts.map