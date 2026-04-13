import { FigmaNode, MappingRegistry, RecipeNode } from './types';
export interface VisionResolution {
    targetComponent: string;
    importPath: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    fingerprint: string;
}
/**
 * Resolve a single UNMAPPED node using Claude vision API.
 *
 * Strategy:
 * 1. Fingerprint the node structure — check cache first (free)
 * 2. Crop the exact node region from the full screenshot
 * 3. Send cropped image + node context to Claude
 * 4. Parse response → match against registry for importPath
 *
 * Returns null if vision cannot resolve (no bounding box, sharp missing,
 * API error, or no registry match for the inferred component).
 */
export declare function resolveNodeWithVision(node: FigmaNode, screenshotPath: string, registry: MappingRegistry): Promise<VisionResolution | null>;
/**
 * Walk the full recipe tree and enhance all UNMAPPED nodes using vision.
 * Mutates the recipe in-place. Returns count of nodes resolved.
 */
export declare function enhanceRecipeWithVision(root: RecipeNode, screenshotPath: string, registry: MappingRegistry, originalNodes: Map<string, FigmaNode>): Promise<number>;
/** Collect all FigmaNodes into a flat map by ID for quick lookup */
export declare function buildNodeMap(root: FigmaNode): Map<string, FigmaNode>;
/** Clear the in-memory fingerprint cache (used between CLI runs in tests) */
export declare function clearFingerprintCache(): void;
//# sourceMappingURL=vision-resolver.d.ts.map