import { ConversionRecipe, FigmaNode } from './types';
/**
 * Writes vision-inferred component mappings back to component-mappings.json.
 *
 * For each node where source === 'vision-inferred':
 * - If the fingerprint already exists in the registry → increment usageCount
 * - If it's new → add a new entry with source: "llm-inferred"
 *
 * These auto-entries have the fingerprint as figmaIdentifier (prefixed "auto:")
 * and the node's actual name as the componentName pattern. Over time, as the
 * same patterns are seen across multiple screens, usageCount grows and the
 * registry becomes a learned knowledge base of your specific Figma file.
 */
export declare function writeLearnedMappings(recipe: ConversionRecipe, originalNodes: Map<string, FigmaNode>, registryPath?: string): number;
//# sourceMappingURL=registry-writer.d.ts.map