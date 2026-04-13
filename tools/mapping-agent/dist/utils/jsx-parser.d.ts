/**
 * jsx-parser.ts
 *
 * Parses `get_design_context` JSX output and enriches the FigmaNode tree
 * (built from `get_metadata` XML) with fills, typography, spacing, and
 * corner radius data so that the resolver's token lookups actually fire.
 *
 * Data flow:
 *   get_design_context JSX  →  extractJSXNodes()  →  JSXExtraction[]
 *   FigmaNode tree (from XML) + JSXExtraction[] →  enrichFigmaTree()
 *   Enriched FigmaNode tree  →  resolveScreen()  →  richer recipe
 */
import { FigmaNode } from '../types';
export interface ExtractedProps {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    lineHeightPx?: number;
    paddingX?: number;
    paddingY?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    cornerRadius?: number;
    isHorizontal?: boolean;
    isVertical?: boolean;
}
export interface JSXExtraction {
    /** Raw data-node-id value, e.g. "3:1050" or "I3:1050;386:9382" */
    rawDataNodeId: string;
    /** Parent Figma node ID — always the XML node id */
    parentId: string;
    /** Local child node ID (only for nested text: "386:9382") */
    localId?: string;
    /** data-name attribute value if present */
    dataName?: string;
    /** Extracted Tailwind props */
    props: ExtractedProps;
    /** Primary text content immediately after the opening tag */
    textContent?: string;
    /**
     * All consecutive text segments found within this element's subtree
     * (up to 3). Index 0 = label, 1 = byline/helper text, 2 = placeholder/extra.
     */
    allTextContent?: string[];
}
export declare function extractTailwindProps(className: string): ExtractedProps;
/**
 * Parse a Figma data-node-id value to extract the parent XML node ID and
 * optional local (child) node ID.
 *
 * Formats:
 *   "3:1050"            → { parentId: "3:1050" }
 *   "I3:1050;386:9382"  → { parentId: "3:1050", localId: "386:9382" }
 */
export declare function parseDataNodeId(raw: string): {
    parentId: string;
    localId?: string;
};
/**
 * Extract all JSX elements that carry a data-node-id attribute from a JSX string.
 * Returns one JSXExtraction per element found.
 */
export declare function extractJSXNodes(jsx: string): JSXExtraction[];
/**
 * Walk the FigmaNode tree (from get_metadata XML) and merge design data
 * extracted from get_design_context JSX.
 *
 * Mutates the FigmaNode tree in place.
 */
export declare function enrichFigmaTree(root: FigmaNode, extractions: JSXExtraction[]): void;
//# sourceMappingURL=jsx-parser.d.ts.map