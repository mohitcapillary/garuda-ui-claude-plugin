/**
 * metadata-parser.ts
 *
 * Converts Figma `get_metadata` XML output → FigmaNode JSON
 * that the mapping agent resolver can consume.
 *
 * get_metadata returns XML like:
 *   <frame id="318:17826" name="..." x="0" y="0" width="1280" height="1524">
 *     <text id="265:19588" name="Loyalty program 2025" ... />
 *     <instance id="265:19589" name="Atoms/Icons/24/chevron-down" ... />
 *   </frame>
 *
 * XML tag → FigmaNodeType mapping:
 *   frame    → FRAME
 *   text     → TEXT
 *   instance → INSTANCE
 *   component → COMPONENT
 *   group    → GROUP
 *   ellipse  → ELLIPSE
 *   rectangle → RECTANGLE
 *   vector   → VECTOR
 */
import { FigmaNode } from '../types';
/**
 * Parse Figma `get_metadata` XML string → FigmaNode[]
 *
 * @param xml - raw XML string from get_metadata MCP tool
 * @returns array of top-level FigmaNodes (usually one root)
 */
export declare function parseMetadata(xml: string): FigmaNode[];
/**
 * Parse metadata XML and return only the first root node.
 * Throws if no valid node found.
 */
export declare function parseMetadataRoot(xml: string): FigmaNode;
//# sourceMappingURL=metadata-parser.d.ts.map