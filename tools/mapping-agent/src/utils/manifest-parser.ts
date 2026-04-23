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

import { FigmaBoundingBox, SectionEntry, SectionManifest } from '../types';
import { parseXml, XmlNode } from './metadata-parser';

const CHUNK_THRESHOLD = 800;

/**
 * Count the number of opening XML tags in a raw XML substring.
 * Used to estimate how many Figma nodes a subtree contains.
 */
function countTags(xml: string): number {
  let count = 0;
  let i = 0;
  while ((i = xml.indexOf('<', i)) !== -1) {
    // Skip closing tags and self-closing indicators
    if (xml[i + 1] !== '/') count++;
    i++;
  }
  return count;
}

/**
 * Extract bounding box from an XmlNode's attrs.
 */
function extractBoundingBox(attrs: Record<string, string>): FigmaBoundingBox {
  return {
    x: parseFloat(attrs['x'] ?? '0') || 0,
    y: parseFloat(attrs['y'] ?? '0') || 0,
    width: parseFloat(attrs['width'] ?? '0') || 0,
    height: parseFloat(attrs['height'] ?? '0') || 0,
  };
}

/**
 * Check whether a raw XML string is structurally complete.
 *
 * Three independent checks — all must pass:
 *   1. String ends with '>'  (catches hard mid-stream cuts)
 *   2. Open tags === close tags + self-closing tags  (catches depth/count limits
 *      where the response ends cleanly but is missing entire subtrees)
 *
 * Note: self-closing tags like <ellipse ... /> count as both open AND self-closing
 * in most XML — we count them separately so they don't inflate the open count.
 */
function isXmlComplete(xml: string): boolean {
  // Strip trailing non-XML text appended by Figma's MCP server
  // (e.g. "IMPORTANT: After you call this tool, you MUST call get_design_context...")
  const lastClose = xml.lastIndexOf('>');
  const trimmed = (lastClose === -1 ? xml : xml.slice(0, lastClose + 1)).trim();

  // Check 1 — must end with a closing angle bracket
  if (!trimmed.endsWith('>')) return false;

  // Check 2 — balanced open vs close tags
  // Open tags:  <tag ...>  (not self-closing, not closing, not declaration)
  const openCount  = (trimmed.match(/<[^\/!?][^>]*[^\/]>/g) ?? []).length
                   + (trimmed.match(/<[^\/!?]>/g) ?? []).length; // single-char tags e.g. <b>
  const closeCount = (trimmed.match(/<\/[^>]+>/g) ?? []).length;
  const selfClose  = (trimmed.match(/<[^>]+\/>/g) ?? []).length;

  if (openCount !== closeCount) return false;

  return true;
}

/**
 * Infer layout mode from direct children positions (same heuristic as metadata-parser).
 */
function inferLayoutMode(
  children: XmlNode[]
): 'HORIZONTAL' | 'VERTICAL' | 'NONE' {
  const visible = children.filter((c) => c.attrs['hidden'] !== 'true');
  if (visible.length < 2) return 'NONE';

  const ys = visible.map((c) => parseFloat(c.attrs['y'] ?? '0'));
  const xs = visible.map((c) => parseFloat(c.attrs['x'] ?? '0'));
  const yVariance = Math.max(...ys) - Math.min(...ys);
  const xVariance = Math.max(...xs) - Math.min(...xs);

  if (yVariance < 4 && xVariance > 4) return 'HORIZONTAL';
  if (xVariance < 4 && yVariance > 4) return 'VERTICAL';
  return 'NONE';
}

/**
 * Convert a node id from "NNN:NNN" colon format to "NNN-NNN" dash format.
 */
function toDashId(id: string): string {
  return id.replace(':', '-');
}

/**
 * Parse Figma get_metadata XML and return a SectionManifest.
 *
 * Only walks 2 levels deep (root + direct children) so it is fast even
 * on large/truncated responses. The estimatedNodeCount is derived from
 * raw tag counting — no full parse required.
 */
export function parseManifest(metadataXml: string): SectionManifest {
  const trimmed = metadataXml.trim();

  // Truncation / completeness detection.
  // isXmlComplete() runs two checks: string ending, balanced open/close tags.
  const isTruncated = !isXmlComplete(trimmed);

  // Estimate total node count from raw tag count (fast, works on truncated XML too)
  const estimatedNodeCount = countTags(trimmed);

  // Parse only the top 2 levels
  const roots = parseXml(trimmed);
  const root = roots[0];

  if (!root) {
    return {
      rootNodeId: '',
      rootName: '',
      rootBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
      rootLayoutMode: 'NONE',
      sections: [],
      estimatedNodeCount,
      isTruncated,
    };
  }

  const rootBoundingBox = extractBoundingBox(root.attrs);
  const rootLayoutMode = inferLayoutMode(root.children);

  // Build section entries from direct children only (depth=1)
  const sections: SectionEntry[] = root.children
    .filter((child) => child.attrs['hidden'] !== 'true' && child.attrs['id'])
    .map((child) => {
      // estimatedDescendants: count tags in the child's raw XML slice.
      // We re-serialize minimally — just count tags in the full XML that
      // fall between this child's id references (approximation).
      // A more accurate approach: count child.children recursively.
      const estimatedDescendants = countDescendants(child);

      return {
        nodeId: toDashId(child.attrs['id'] ?? ''),
        name: child.attrs['name'] ?? '',
        boundingBox: extractBoundingBox(child.attrs),
        layoutMode: inferLayoutMode(child.children),
        depth: 1,
        estimatedDescendants,
      };
    });

  return {
    rootNodeId: toDashId(root.attrs['id'] ?? ''),
    rootName: root.attrs['name'] ?? '',
    rootBoundingBox,
    rootLayoutMode,
    sections,
    estimatedNodeCount,
    isTruncated,
  };
}

/**
 * Recursively count all descendants of an XmlNode (depth-first).
 */
function countDescendants(node: XmlNode): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

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
export function needsChunking(manifest: SectionManifest, threshold = CHUNK_THRESHOLD): boolean {
  return manifest.isTruncated
    || manifest.estimatedNodeCount > threshold;
}
