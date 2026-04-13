import { ConversionRecipe, FigmaNode, MappingRegistry, RecipeNode } from './types';
/**
 * Resolve a single FigmaNode to a RecipeNode using the mapping registry.
 * Never throws — returns UNMAPPED with fallback on no match.
 */
export declare function resolveNode(node: FigmaNode, registry: MappingRegistry): RecipeNode;
/**
 * Walk an entire Figma screen/frame recursively and return a full ConversionRecipe.
 */
export declare function resolveScreen(rootNode: FigmaNode, registry: MappingRegistry): ConversionRecipe;
//# sourceMappingURL=resolver.d.ts.map