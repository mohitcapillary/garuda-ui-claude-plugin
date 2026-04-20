"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXml = parseXml;
exports.parseMetadata = parseMetadata;
exports.parseMetadataRoot = parseMetadataRoot;
const TAG_TO_TYPE = {
    frame: 'FRAME',
    text: 'TEXT',
    instance: 'INSTANCE',
    component: 'COMPONENT',
    group: 'GROUP',
    ellipse: 'ELLIPSE',
    rectangle: 'RECTANGLE',
    vector: 'VECTOR',
};
/**
 * Minimal XML parser for the flat Figma metadata format.
 * Does not handle CDATA, namespaces, or processing instructions.
 */
function parseXml(xml) {
    const roots = [];
    const stack = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)\s*(\/?)>/g;
    let match;
    while ((match = tagRegex.exec(xml)) !== null) {
        const [full, tag, rawAttrs, selfClose] = match;
        const isClose = full.startsWith('</');
        if (isClose) {
            stack.pop();
            continue;
        }
        const attrs = parseAttrs(rawAttrs);
        const node = { tag, attrs, children: [] };
        if (stack.length > 0) {
            stack[stack.length - 1].children.push(node);
        }
        else {
            roots.push(node);
        }
        if (!selfClose) {
            stack.push(node);
        }
    }
    return roots;
}
function parseAttrs(raw) {
    const result = {};
    const attrRegex = /([a-zA-Z][a-zA-Z0-9_:-]*)="([^"]*)"/g;
    let m;
    while ((m = attrRegex.exec(raw)) !== null) {
        result[m[1]] = m[2];
    }
    return result;
}
/**
 * Convert a parsed XmlNode to a FigmaNode.
 * Skips hidden nodes and unknown tags.
 */
function xmlNodeToFigmaNode(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // If the layer name starts with "Cap" (e.g. CapSelect, CapButton), always treat
    // as INSTANCE so the registry can match it by name — regardless of what XML tag
    // Figma uses (frame, symbol, or any future type).
    const isCap = /^Cap[A-Z]/.test((_a = node.attrs['name']) !== null && _a !== void 0 ? _a : '');
    const type = isCap ? 'INSTANCE' : TAG_TO_TYPE[node.tag.toLowerCase()];
    if (!type)
        return null;
    // Skip hidden nodes — they are not rendered
    if (node.attrs['hidden'] === 'true')
        return null;
    const figmaNode = {
        id: (_b = node.attrs['id']) !== null && _b !== void 0 ? _b : '',
        name: (_c = node.attrs['name']) !== null && _c !== void 0 ? _c : '',
        type,
    };
    // Infer layoutMode from child positions for FRAME nodes.
    // If children share the same y → HORIZONTAL, same x → VERTICAL.
    // This is an approximation — real layoutMode comes from get_design_context.
    if (type === 'FRAME' && node.children.length > 1) {
        const visible = node.children.filter((c) => c.attrs['hidden'] !== 'true');
        if (visible.length > 1) {
            const ys = visible.map((c) => { var _a; return parseFloat((_a = c.attrs['y']) !== null && _a !== void 0 ? _a : '0'); });
            const xs = visible.map((c) => { var _a; return parseFloat((_a = c.attrs['x']) !== null && _a !== void 0 ? _a : '0'); });
            const yVariance = Math.max(...ys) - Math.min(...ys);
            const xVariance = Math.max(...xs) - Math.min(...xs);
            if (yVariance < 4 && xVariance > 4) {
                figmaNode.layoutMode = 'HORIZONTAL';
                // Estimate gutter from first two children x positions
                if (visible.length >= 2) {
                    const firstRight = parseFloat((_d = visible[0].attrs['x']) !== null && _d !== void 0 ? _d : '0') + parseFloat((_e = visible[0].attrs['width']) !== null && _e !== void 0 ? _e : '0');
                    const secondLeft = parseFloat((_f = visible[1].attrs['x']) !== null && _f !== void 0 ? _f : '0');
                    const gap = secondLeft - firstRight;
                    if (gap > 0)
                        figmaNode.itemSpacing = Math.round(gap);
                }
            }
            else if (xVariance < 4 && yVariance > 4) {
                figmaNode.layoutMode = 'VERTICAL';
            }
        }
    }
    // Bounding box
    const x = parseFloat((_g = node.attrs['x']) !== null && _g !== void 0 ? _g : '0');
    const y = parseFloat((_h = node.attrs['y']) !== null && _h !== void 0 ? _h : '0');
    const width = parseFloat((_j = node.attrs['width']) !== null && _j !== void 0 ? _j : '0');
    const height = parseFloat((_k = node.attrs['height']) !== null && _k !== void 0 ? _k : '0');
    if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
        figmaNode.absoluteBoundingBox = { x, y, width, height };
    }
    // For TEXT nodes: use the node name as characters (metadata doesn't include content)
    if (type === 'TEXT') {
        figmaNode.characters = (_l = node.attrs['name']) !== null && _l !== void 0 ? _l : '';
    }
    // For INSTANCE nodes: extract variant hints from the name
    // e.g. "Button" → componentNames will match, variantProperties populated by get_design_context
    if (type === 'INSTANCE') {
        // Name like "Atoms/Icons/24/chevron-down" tells us what kind of instance
        figmaNode.componentProperties = {};
    }
    // Recurse children
    const children = [];
    for (const child of node.children) {
        const converted = xmlNodeToFigmaNode(child);
        if (converted)
            children.push(converted);
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
function parseMetadata(xml) {
    const xmlNodes = parseXml(xml);
    const result = [];
    for (const node of xmlNodes) {
        const converted = xmlNodeToFigmaNode(node);
        if (converted)
            result.push(converted);
    }
    return result;
}
/**
 * Parse metadata XML and return only the first root node.
 * Throws if no valid node found.
 */
function parseMetadataRoot(xml) {
    const nodes = parseMetadata(xml);
    if (nodes.length === 0) {
        throw new Error('No valid Figma nodes found in metadata XML');
    }
    return nodes[0];
}
//# sourceMappingURL=metadata-parser.js.map