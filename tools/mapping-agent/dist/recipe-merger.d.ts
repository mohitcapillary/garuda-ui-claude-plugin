/**
 * recipe-merger.ts
 *
 * Merges N per-section ConversionRecipes (produced by resolve-metadata on
 * individual section nodeIds) into a single unified ConversionRecipe whose
 * structure matches what a full-screen single-node fetch would have produced.
 *
 * Also builds a StitchingContext — a compact index used by the HLD writer
 * to process sections one at a time without loading the full merged recipe.
 */
import { ConversionRecipe, ScreenManifestMeta, StitchingContext } from './types';
/**
 * Merge N partial ConversionRecipes into one unified recipe.
 *
 * The merged recipe has a synthetic root node (CapColumn or CapRow depending
 * on rootLayoutMode) whose children are the sorted section roots.
 */
export declare function mergeRecipes(partials: ConversionRecipe[], manifest: ScreenManifestMeta): ConversionRecipe;
/**
 * Build a StitchingContext from the merged recipe + manifest.
 * sectionsDir is used to construct recipePath for each section.
 */
export declare function buildStitchingContext(merged: ConversionRecipe, manifest: ScreenManifestMeta, sectionsDir: string, mergedRecipePath: string): StitchingContext;
//# sourceMappingURL=recipe-merger.d.ts.map