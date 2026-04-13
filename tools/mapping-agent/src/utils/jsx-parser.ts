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

import { FigmaColor, FigmaNode } from '../types';

// ─── Extracted Types ──────────────────────────────────────────────────────────

export interface ExtractedProps {
  bgColor?: string;        // hex, e.g. "#1f9a1d"
  textColor?: string;      // hex or named, e.g. "#ffffff" | "white"
  fontSize?: number;       // px integer
  fontFamily?: string;     // e.g. "Roboto"
  fontWeight?: number;     // numeric: 100–900
  lineHeightPx?: number;   // px integer
  paddingX?: number;       // px — applied to left + right
  paddingY?: number;       // px — applied to top + bottom
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;   // px integer
  isHorizontal?: boolean;  // flex-row detected
  isVertical?: boolean;    // flex-col detected
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

// ─── Regex Patterns ───────────────────────────────────────────────────────────

const BG_HEX       = /\bbg-\[#([0-9a-fA-F]{3,8})\]/;
const BG_NAMED     = /\bbg-(white|black|transparent)\b/;
const TEXT_HEX     = /\btext-\[#([0-9a-fA-F]{3,8})\]/;
const TEXT_NAMED   = /\btext-(white|black)\b/;
const TEXT_SIZE    = /\btext-\[(\d+(?:\.\d+)?)px\]/;
const FONT_FAMILY  = /\bfont-\['([^':,\]]+)/;
const FONT_WEIGHT_NAMED = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/;
const LEADING      = /\bleading-\[(\d+(?:\.\d+)?)px\]/;
const PX_PAD       = /\bpx-\[(\d+(?:\.\d+)?)px\]/;
const PY_PAD       = /\bpy-\[(\d+(?:\.\d+)?)px\]/;
const PL_PAD       = /\bpl-\[(\d+(?:\.\d+)?)px\]/;
const PR_PAD       = /\bpr-\[(\d+(?:\.\d+)?)px\]/;
const PT_PAD       = /\bpt-\[(\d+(?:\.\d+)?)px\]/;
const PB_PAD       = /\bpb-\[(\d+(?:\.\d+)?)px\]/;
const ROUNDED      = /\brounded-\[(\d+(?:\.\d+)?)px\]/;
const FLEX_ROW     = /\bflex-row\b/;
const FLEX_COL     = /\bflex-col\b/;

const FONT_WEIGHT_MAP: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// ─── Tailwind className → ExtractedProps ──────────────────────────────────────

export function extractTailwindProps(className: string): ExtractedProps {
  const props: ExtractedProps = {};

  // Background color
  const bgHex = className.match(BG_HEX);
  if (bgHex) props.bgColor = `#${bgHex[1]}`;
  else {
    const bgNamed = className.match(BG_NAMED);
    if (bgNamed) props.bgColor = bgNamed[1]; // "white" | "black"
  }

  // Text color
  const textHex = className.match(TEXT_HEX);
  if (textHex) props.textColor = `#${textHex[1]}`;
  else {
    const textNamed = className.match(TEXT_NAMED);
    if (textNamed) props.textColor = textNamed[1];
  }

  // Font size (px → number)
  const textSize = className.match(TEXT_SIZE);
  if (textSize) props.fontSize = parseFloat(textSize[1]);

  // Font family
  const fontFam = className.match(FONT_FAMILY);
  if (fontFam) {
    // "Roboto:Medium" → "Roboto"
    props.fontFamily = fontFam[1].split(':')[0].trim();
  }

  // Font weight
  const fontWeightNamed = className.match(FONT_WEIGHT_NAMED);
  if (fontWeightNamed) props.fontWeight = FONT_WEIGHT_MAP[fontWeightNamed[1]];

  // Line height
  const leading = className.match(LEADING);
  if (leading) props.lineHeightPx = parseFloat(leading[1]);

  // Padding
  const px = className.match(PX_PAD);
  if (px) {
    props.paddingX = parseFloat(px[1]);
    props.paddingLeft = props.paddingX;
    props.paddingRight = props.paddingX;
  }
  const py = className.match(PY_PAD);
  if (py) {
    props.paddingY = parseFloat(py[1]);
    props.paddingTop = props.paddingY;
    props.paddingBottom = props.paddingY;
  }
  const pl = className.match(PL_PAD);
  if (pl) props.paddingLeft = parseFloat(pl[1]);
  const pr = className.match(PR_PAD);
  if (pr) props.paddingRight = parseFloat(pr[1]);
  const pt = className.match(PT_PAD);
  if (pt) props.paddingTop = parseFloat(pt[1]);
  const pb = className.match(PB_PAD);
  if (pb) props.paddingBottom = parseFloat(pb[1]);

  // Border radius
  const rounded = className.match(ROUNDED);
  if (rounded) props.cornerRadius = parseFloat(rounded[1]);

  // Layout direction
  if (FLEX_ROW.test(className)) props.isHorizontal = true;
  if (FLEX_COL.test(className)) props.isVertical = true;

  return props;
}

// ─── data-node-id parser ──────────────────────────────────────────────────────

/**
 * Parse a Figma data-node-id value to extract the parent XML node ID and
 * optional local (child) node ID.
 *
 * Formats:
 *   "3:1050"            → { parentId: "3:1050" }
 *   "I3:1050;386:9382"  → { parentId: "3:1050", localId: "386:9382" }
 */
export function parseDataNodeId(raw: string): { parentId: string; localId?: string } {
  // Strip leading "I" (instance context prefix)
  const stripped = raw.startsWith('I') ? raw.slice(1) : raw;
  const semi = stripped.indexOf(';');
  if (semi === -1) {
    // Normalise "-" to ":" in case Figma uses dash format
    return { parentId: stripped.replace('-', ':') };
  }
  const parentId = stripped.slice(0, semi).replace('-', ':');
  const localId  = stripped.slice(semi + 1).replace('-', ':');
  return { parentId, localId };
}

// ─── JSX parser ───────────────────────────────────────────────────────────────

/**
 * Extract all JSX elements that carry a data-node-id attribute from a JSX string.
 * Returns one JSXExtraction per element found.
 */
export function extractJSXNodes(jsx: string): JSXExtraction[] {
  const extractions: JSXExtraction[] = [];

  // Match opening tags (including self-closing) that have data-node-id
  // This regex captures the entire opening tag so we can extract all attrs from it.
  const tagRegex = /<([A-Za-z][A-Za-z0-9]*)([^>]*?)(\s*\/?>)/gs;

  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(jsx)) !== null) {
    const fullTag = tagMatch[0];

    // Must have data-node-id
    const nodeIdMatch = fullTag.match(/data-node-id="([^"]+)"/);
    if (!nodeIdMatch) continue;

    const rawDataNodeId = nodeIdMatch[1];
    const { parentId, localId } = parseDataNodeId(rawDataNodeId);

    // Extract className
    const classMatch = fullTag.match(/className="([^"]+)"/);
    const className = classMatch ? classMatch[1] : '';

    // Extract data-name
    const nameMatch = fullTag.match(/data-name="([^"]+)"/);
    const dataName = nameMatch ? nameMatch[1] : undefined;

    const props = extractTailwindProps(className);

    // Capture text content — look ahead for immediate text between this tag's
    // close and the next tag open. Only capture short single-line text.
    let textContent: string | undefined;
    const tagEnd = tagMatch.index + fullTag.length;
    const afterTag = jsx.slice(tagEnd, tagEnd + 200);
    const textMatch = afterTag.match(/^([^<]{1,150})</);
    if (textMatch) {
      const trimmed = textMatch[1].trim();
      if (trimmed.length > 0) textContent = trimmed;
    }

    // Collect up to 3 text segments within this element's subtree.
    // Use a 3000-char window but skip segments that look like code artifacts.
    const allTextContent: string[] = [];
    const searchWindow = jsx.slice(tagEnd, tagEnd + 3000);
    const textSegmentRegex = />([^<]{1,200})</g;
    let segMatch: RegExpExecArray | null;
    while ((segMatch = textSegmentRegex.exec(searchWindow)) !== null && allTextContent.length < 3) {
      const seg = segMatch[1].trim();
      // Skip empty, whitespace-only, JSX code fragments, and template literals
      if (
        seg.length === 0 ||
        /^[\s{}()`]+$/.test(seg) ||
        /import|export|const |function |return |=>/.test(seg)
      ) continue;
      allTextContent.push(seg);
    }

    extractions.push({
      rawDataNodeId, parentId, localId, dataName, props, textContent,
      allTextContent: allTextContent.length > 0 ? allTextContent : undefined,
    });
  }

  return extractions;
}

// ─── Color conversion ─────────────────────────────────────────────────────────

function hexToFigmaColor(hex: string): FigmaColor | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    // Expand short hex: #abc → #aabbcc
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r: r / 255, g: g / 255, b: b / 255, a: 1 };
  }
  if (clean.length === 6 || clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
    return { r: r / 255, g: g / 255, b: b / 255, a };
  }
  return null;
}

const NAMED_COLORS: Record<string, FigmaColor> = {
  white: { r: 1, g: 1, b: 1, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
};

function resolveColor(value: string): FigmaColor | null {
  if (value.startsWith('#')) return hexToFigmaColor(value);
  return NAMED_COLORS[value] ?? null;
}

// ─── FigmaNode tree enrichment ────────────────────────────────────────────────

/**
 * Walk the FigmaNode tree (from get_metadata XML) and merge design data
 * extracted from get_design_context JSX.
 *
 * Mutates the FigmaNode tree in place.
 */
export function enrichFigmaTree(root: FigmaNode, extractions: JSXExtraction[]): void {
  // Build lookup: parentId → all extractions for that node
  const byParent = new Map<string, JSXExtraction[]>();
  for (const ex of extractions) {
    const list = byParent.get(ex.parentId) ?? [];
    list.push(ex);
    byParent.set(ex.parentId, list);
  }

  enrichNode(root, byParent);
}

function enrichNode(node: FigmaNode, byParent: Map<string, JSXExtraction[]>): void {
  const exList = byParent.get(node.id) ?? [];

  // Collect textContent from all localId child extractions — these are scoped exactly
  // to this node's JSX subtree and carry label/byline/placeholder text for Cap* instances.
  const localTexts = exList
    .filter((ex) => ex.localId && ex.textContent)
    .map((ex) => ex.textContent as string);

  for (const ex of exList) {
    const { props, textContent, localId } = ex;

    if (localId) {
      // This extraction belongs to a child TEXT node inside this instance/frame.
      // Apply typography to a synthetic child or to the parent's characters field.
      applyTextEnrichment(node, props, textContent);
    } else {
      // Direct match: apply all extracted props to this node
      applyNodeEnrichment(node, props, textContent);
    }
  }

  // For Cap* INSTANCE nodes with no XML text children, synthesize TEXT children
  // so that extractRichContext() can surface label/byline/placeholder in the recipe.
  // Primary source: localId extractions (scoped to this exact instance).
  // Fallback: allTextContent from forward scan (for Cap* nodes whose children aren't in XML,
  //           e.g. CapSelect coming from <symbol> tags).
  if (node.type === 'INSTANCE' && /^Cap[A-Z]/.test(node.name)) {
    const existingTextCount = node.children?.filter((c) => c.type === 'TEXT').length ?? 0;
    if (existingTextCount === 0) {
      // Prefer localId-scoped texts; fall back to allTextContent from the direct extraction
      const directEx = exList.find((ex) => !ex.localId);
      const texts = localTexts.length > 0
        ? localTexts
        : (directEx?.allTextContent ?? []);

      if (texts.length > 0) {
        node.children = node.children ?? [];
        const names = ['label', 'byline', 'placeholder'];
        for (let i = 0; i < Math.min(texts.length, 3); i++) {
          node.children.push({
            id: `${node.id}-synth-text-${i}`,
            name: names[i],
            type: 'TEXT',
            characters: texts[i],
          });
        }
      }
    }
  }

  // Recurse into children
  for (const child of node.children ?? []) {
    enrichNode(child, byParent);
  }
}

function applyNodeEnrichment(node: FigmaNode, props: ExtractedProps, textContent?: string): void {
  // Fill color
  if (props.bgColor) {
    const color = resolveColor(props.bgColor);
    if (color) {
      node.fills = [{ type: 'SOLID', color }];
    }
  }

  // Corner radius
  if (props.cornerRadius !== undefined) {
    node.cornerRadius = props.cornerRadius;
  }

  // Padding
  if (props.paddingLeft  !== undefined) node.paddingLeft  = props.paddingLeft;
  if (props.paddingRight !== undefined) node.paddingRight = props.paddingRight;
  if (props.paddingTop   !== undefined) node.paddingTop   = props.paddingTop;
  if (props.paddingBottom !== undefined) node.paddingBottom = props.paddingBottom;

  // Layout mode (only override if not already set from XML heuristics)
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    if (props.isHorizontal) node.layoutMode = 'HORIZONTAL';
    else if (props.isVertical) node.layoutMode = 'VERTICAL';
  }

  // Typography (for TEXT nodes)
  if (node.type === 'TEXT') {
    applyTypography(node, props, textContent);
  }

  // Text content fallback — if this instance has no XML children but JSX has text
  if (textContent && !node.characters && node.type !== 'TEXT') {
    node.characters = textContent;
  }
}

function applyTextEnrichment(parent: FigmaNode, props: ExtractedProps, textContent?: string): void {
  // If parent already has TEXT children, enrich the first matching one
  const textChild = parent.children?.find((c) => c.type === 'TEXT');
  if (textChild) {
    applyTypography(textChild, props, textContent);
    return;
  }

  // No XML text child exists (common for INSTANCE nodes).
  // Set characters directly on the parent so applySlotMappings can pick it up.
  if (textContent && !parent.characters) {
    parent.characters = textContent;
  }

  // Also enrich parent with typography if it's the only text-bearing node
  if (props.fontSize || props.fontWeight || props.fontFamily) {
    parent.style = {
      fontFamily:    props.fontFamily ?? 'Roboto',
      fontSize:      props.fontSize ?? 14,
      fontWeight:    props.fontWeight ?? 400,
      lineHeightPx:  props.lineHeightPx ?? (props.fontSize ? props.fontSize * 1.4 : 20),
      letterSpacing: 0,
    };
  }
}

function applyTypography(node: FigmaNode, props: ExtractedProps, textContent?: string): void {
  if (props.fontSize || props.fontWeight || props.fontFamily) {
    node.style = {
      fontFamily:    props.fontFamily ?? node.style?.fontFamily ?? 'Roboto',
      fontSize:      props.fontSize   ?? node.style?.fontSize   ?? 14,
      fontWeight:    props.fontWeight ?? node.style?.fontWeight ?? 400,
      lineHeightPx:  props.lineHeightPx ?? node.style?.lineHeightPx ?? (props.fontSize ? props.fontSize * 1.4 : 20),
      letterSpacing: node.style?.letterSpacing ?? 0,
    };
  }
  if (textContent && !node.characters) {
    node.characters = textContent;
  }
}
