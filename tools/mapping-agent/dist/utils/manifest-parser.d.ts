/**
 * manifest-parser.ts
 *
 * Performs a shallow 2-level scan of get_metadata XML to produce a
 * SectionManifest: the list of top-level section nodeIds, their bounding
 * boxes, and an estimated total node count.
 *
 * Used by the scan-manifest CLI command to decide whether a screen is
 * too large for single-node fetching (estimatedNodeCount > 800) or
 * whether the MCP response was truncated (isTruncated).
 */
import { SectionManifest } from '../types';
/**
 * Parse Figma get_metadata XML and return a SectionManifest.
 *
 * Only walks 2 levels deep (root + direct children) so it is fast even
 * on large/truncated responses. The estimatedNodeCount is derived from
 * raw tag counting — no full parse required.
 */
export declare function parseManifest(metadataXml: string): SectionManifest;
/**
 * Returns true if the manifest indicates chunked / section-level fetching is required.
 *
 * Three triggers:
 *   1. isTruncated — XML was structurally incomplete (hard cut or unbalanced tags)
 *   2. estimatedNodeCount > threshold — too many nodes for single-node get_design_context
 *   3. rootLayoutMode === 'NONE' — designer used absolute positioning; get_design_context
 *      on the root frame returns coordinate-only XML with no CSS layout intent.
 *      Section-level fetches are required to recover flex/overflow/padding values.
 */
export declare function needsChunking(manifest: SectionManifest, threshold?: number): boolean;
//# sourceMappingURL=manifest-parser.d.ts.map