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

import { FigmaNode, FigmaNodeType } from '../types';

const TAG_TO_TYPE: Record<string, FigmaNodeType> = {
  frame: 'FRAME',
  text: 'TEXT',
  instance: 'INSTANCE',
  component: 'COMPONENT',
  group: 'GROUP',
  ellipse: 'ELLIPSE',
  rectangle: 'RECTANGLE',
  vector: 'VECTOR',
};

interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
}

/**
 * Minimal XML parser for the flat Figma metadata format.
 * Does not handle CDATA, namespaces, or processing instructions.
 */
function parseXml(xml: string): XmlNode[] {
  const roots: XmlNode[] = [];
  const stack: XmlNode[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)\s*(\/?)>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(xml)) !== null) {
    const [full, tag, rawAttrs, selfClose] = match;
    const isClose = full.startsWith('</');
    if (isClose) {
      stack.pop();
      continue;
    }

    const attrs = parseAttrs(rawAttrs);
    const node: XmlNode = { tag, attrs, children: [] };

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    } else {
      roots.push(node);
    }

    if (!selfClose) {
      stack.push(node);
    }
  }

  return roots;
}

function parseAttrs(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const attrRegex = /([a-zA-Z][a-zA-Z0-9_:-]*)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(raw)) !== null) {
    result[m[1]] = m[2];
  }
  return result;
}

/**
 * Convert a parsed XmlNode to a FigmaNode.
 * Skips hidden nodes and unknown tags.
 */
function xmlNodeToFigmaNode(node: XmlNode): FigmaNode | null {
  // If the layer name starts with "Cap" (e.g. CapSelect, CapButton), always treat
  // as INSTANCE so the registry can match it by name — regardless of what XML tag
  // Figma uses (frame, symbol, or any future type).
  const isCap = /^Cap[A-Z]/.test(node.attrs['name'] ?? '');
  const type: FigmaNodeType = isCap ? 'INSTANCE' : TAG_TO_TYPE[node.tag.toLowerCase()];

  if (!type) return null;

  // Skip hidden nodes — they are not rendered
  if (node.attrs['hidden'] === 'true') return null;

  const figmaNode: FigmaNode = {
    id: node.attrs['id'] ?? '',
    name: node.attrs['name'] ?? '',
    type,
  };

  // Infer layoutMode from child positions for FRAME nodes.
  // If children share the same y → HORIZONTAL, same x → VERTICAL.
  // This is an approximation — real layoutMode comes from get_design_context.
  if (type === 'FRAME' && node.children.length > 1) {
    const visible = node.children.filter((c) => c.attrs['hidden'] !== 'true');
    if (visible.length > 1) {
      const ys = visible.map((c) => parseFloat(c.attrs['y'] ?? '0'));
      const xs = visible.map((c) => parseFloat(c.attrs['x'] ?? '0'));
      const yVariance = Math.max(...ys) - Math.min(...ys);
      const xVariance = Math.max(...xs) - Math.min(...xs);
      if (yVariance < 4 && xVariance > 4) {
        figmaNode.layoutMode = 'HORIZONTAL';
        // Estimate gutter from first two children x positions
        if (visible.length >= 2) {
          const firstRight = parseFloat(visible[0].attrs['x'] ?? '0') + parseFloat(visible[0].attrs['width'] ?? '0');
          const secondLeft = parseFloat(visible[1].attrs['x'] ?? '0');
          const gap = secondLeft - firstRight;
          if (gap > 0) figmaNode.itemSpacing = Math.round(gap);
        }
      } else if (xVariance < 4 && yVariance > 4) {
        figmaNode.layoutMode = 'VERTICAL';
      }
    }
  }

  // Bounding box
  const x = parseFloat(node.attrs['x'] ?? '0');
  const y = parseFloat(node.attrs['y'] ?? '0');
  const width = parseFloat(node.attrs['width'] ?? '0');
  const height = parseFloat(node.attrs['height'] ?? '0');
  if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
    figmaNode.absoluteBoundingBox = { x, y, width, height };
  }

  // For TEXT nodes: use the node name as characters (metadata doesn't include content)
  if (type === 'TEXT') {
    figmaNode.characters = node.attrs['name'] ?? '';
  }

  // For INSTANCE nodes: extract variant hints from the name
  // e.g. "Button" → componentNames will match, variantProperties populated by get_design_context
  if (type === 'INSTANCE') {
    // Name like "Atoms/Icons/24/chevron-down" tells us what kind of instance
    figmaNode.componentProperties = {};
  }

  // Recurse children
  const children: FigmaNode[] = [];
  for (const child of node.children) {
    const converted = xmlNodeToFigmaNode(child);
    if (converted) children.push(converted);
  }
  if (children.length > 0) {
    figmaNode.children = children;
  }

  return figmaNode;
}

/**
 * Parse Figma `get_metadata` XML string → FigmaNode[]
 *
 * @param xml - raw XML string from get_metadata MCP tool
 * @returns array of top-level FigmaNodes (usually one root)
 */
export function parseMetadata(xml: string): FigmaNode[] {
  const xmlNodes = parseXml(xml);
  const result: FigmaNode[] = [];
  for (const node of xmlNodes) {
    const converted = xmlNodeToFigmaNode(node);
    if (converted) result.push(converted);
  }
  return result;
}

/**
 * Parse metadata XML and return only the first root node.
 * Throws if no valid node found.
 */
export function parseMetadataRoot(xml: string): FigmaNode {
  const nodes = parseMetadata(xml);
  if (nodes.length === 0) {
    throw new Error('No valid Figma nodes found in metadata XML');
  }
  return nodes[0];
}
