import { ConversionRecipe, TokenResolutionMap } from './types';
/**
 * Write a ConversionRecipe to <outputDir>/<nodeId>.recipe.json.
 * Returns the absolute path of the written file.
 */
export declare function writeRecipe(recipe: ConversionRecipe, outputDir?: string): string;
/**
 * Write a TokenResolutionMap to <outputDir>/token-map.json.
 * Returns the absolute path of the written file.
 */
export declare function writeTokenMap(tokenMap: TokenResolutionMap, outputDir?: string): string;
//# sourceMappingURL=output-writer.d.ts.map