"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNode = resolveNode;
exports.resolveScreen = resolveScreen;
const micromatch_1 = __importDefault(require("micromatch"));
const color_1 = require("./utils/color");
const fingerprint_1 = require("./utils/fingerprint");
const typography_1 = require("./utils/typography");
// ─── Name Matching ────────────────────────────────────────────────────────────
function matchesComponentName(nodeName, patterns) {
    const lower = nodeName.toLowerCase();
    return patterns.some((pattern) => {
        const lowerPattern = pattern.toLowerCase();
        if (micromatch_1.default.isMatch(lower, lowerPattern))
            return true;
        // Also try the raw pattern in case micromatch doesn't catch it
        const regex = new RegExp('^' + lowerPattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        return regex.test(lower);
    });
}
function matchesVariantPatterns(node, patterns) {
    if (!patterns || Object.keys(patterns).length === 0)
        return true;
    if (!node.variantProperties)
        return false;
    return Object.entries(patterns).every(([key, value]) => {
        var _a;
        const nodeVal = (_a = node.variantProperties) === null || _a === void 0 ? void 0 : _a[key];
        return (nodeVal === null || nodeVal === void 0 ? void 0 : nodeVal.toLowerCase()) === value.toLowerCase();
    });
}
// ─── Icon Type Extraction ─────────────────────────────────────────────────────
/**
 * Extract icon type from a node name following the CapIcon/<type> convention.
 * E.g. "CapIcon/edit" → "edit", "CapIcon/chevron-right" → "chevron-right"
 * Returns null if the name doesn't follow the convention.
 */
function extractIconType(nodeName) {
    const match = nodeName.match(/^cap\s*icon[/\-](.+)$/i);
    if (match)
        return match[1].trim().toLowerCase();
    return null;
}
// ─── Entry Lookup ─────────────────────────────────────────────────────────────
function findEntry(node, registry) {
    const nameStartsWithCap = node.name.startsWith('Cap');
    // 1. Try entries with variant patterns first (more specific)
    for (const entry of registry.components) {
        if (!nameStartsWithCap && !entry.nodeTypes.includes(node.type))
            continue;
        if (!matchesComponentName(node.name, entry.componentNames))
            continue;
        if (entry.variantPatterns &&
            Object.keys(entry.variantPatterns).length > 0 &&
            !matchesVariantPatterns(node, entry.variantPatterns)) {
            continue;
        }
        return entry;
    }
    // 2. Fall back to entries without variant patterns
    for (const entry of registry.components) {
        if (!nameStartsWithCap && !entry.nodeTypes.includes(node.type))
            continue;
        if (!matchesComponentName(node.name, entry.componentNames))
            continue;
        return entry;
    }
    return null;
}
// ─── Auto-Layout → Row/Column detection ──────────────────────────────────────
function detectLayoutComponent(node, registry) {
    var _a, _b;
    if (node.layoutMode === 'HORIZONTAL') {
        return (_a = registry.components.find((e) => e.figmaIdentifier === 'cap-row')) !== null && _a !== void 0 ? _a : null;
    }
    if (node.layoutMode === 'VERTICAL') {
        return ((_b = registry.components.find((e) => e.figmaIdentifier === 'cap-column')) !== null && _b !== void 0 ? _b : null);
    }
    return null;
}
// ─── Rich Context Extraction ──────────────────────────────────────────────────
/**
 * Extract human-readable context from an enriched FigmaNode for LLM consumption.
 * Reads label text, byline, placeholder, typography, spacing, and radius —
 * all sourced from the JSX-enriched FigmaNode tree.
 */
function extractRichContext(node) {
    var _a, _b, _c, _d, _e;
    const ctx = {};
    // ── Text content ──────────────────────────────────────────────────────────
    const textChildren = (_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a.filter((c) => c.type === 'TEXT')) !== null && _b !== void 0 ? _b : [];
    // Label: first TEXT child or the node's own characters
    const labelText = (_d = (_c = textChildren[0]) === null || _c === void 0 ? void 0 : _c.characters) !== null && _d !== void 0 ? _d : node.characters;
    if (labelText)
        ctx.label = labelText;
    // Byline: second TEXT child (label + helper text pattern)
    if (textChildren.length >= 2 && textChildren[1].characters) {
        ctx.byline = textChildren[1].characters;
    }
    // Placeholder: look for a descendant named "Field" or "placeholder" that has characters
    const fieldNode = (_e = node.children) === null || _e === void 0 ? void 0 : _e.find((c) => { var _a, _b; return ((_a = c.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('field')) || ((_b = c.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('placeholder')); });
    if (fieldNode === null || fieldNode === void 0 ? void 0 : fieldNode.characters)
        ctx.placeholder = fieldNode.characters;
    // ── Typography ────────────────────────────────────────────────────────────
    if (node.style) {
        if (node.style.fontWeight)
            ctx.fontWeight = node.style.fontWeight;
        if (node.style.fontFamily)
            ctx.fontFamily = node.style.fontFamily;
    }
    // ── Geometry ─────────────────────────────────────────────────────────────
    if (node.cornerRadius !== undefined)
        ctx.cornerRadius = node.cornerRadius;
    if (node.itemSpacing !== undefined)
        ctx.itemSpacing = node.itemSpacing;
    if (node.paddingLeft !== undefined ||
        node.paddingRight !== undefined ||
        node.paddingTop !== undefined ||
        node.paddingBottom !== undefined) {
        ctx.padding = {
            top: node.paddingTop,
            right: node.paddingRight,
            bottom: node.paddingBottom,
            left: node.paddingLeft,
        };
    }
    return ctx;
}
// ─── Prop Mapping ─────────────────────────────────────────────────────────────
function applyPropMappings(node, entry) {
    var _a, _b;
    const props = {};
    const srcProps = {
        ...((_a = node.componentProperties) !== null && _a !== void 0 ? _a : {}),
        ...((_b = node.variantProperties) !== null && _b !== void 0 ? _b : {}),
    };
    for (const [figmaProp, mapping] of Object.entries(entry.propMappings)) {
        const value = srcProps[figmaProp];
        if (value === undefined)
            continue;
        if ('map' in mapping) {
            const valueMap = mapping;
            const mapped = valueMap.map[String(value)];
            if (mapped)
                Object.assign(props, mapped);
        }
        else {
            const transform = mapping.transform;
            if (transform === 'boolean') {
                props[mapping.prop] = Boolean(value);
            }
            else if (transform === 'number') {
                props[mapping.prop] = Number(value);
            }
            else {
                props[mapping.prop] = String(value);
            }
        }
    }
    // Auto-layout gutter from itemSpacing
    if (entry.figmaIdentifier === 'cap-row' && node.itemSpacing !== undefined) {
        props['gutter'] = node.itemSpacing;
    }
    return props;
}
// ─── CSS Variable Mapping ─────────────────────────────────────────────────────
function applyCssVariables(node, entry, registry) {
    var _a, _b, _c;
    const cssVars = {};
    if (!entry.cssVariableMappings)
        return cssVars;
    for (const [path, cssVar] of Object.entries(entry.cssVariableMappings)) {
        if (path === 'fills[0]' && ((_b = (_a = node.fills) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) === 'SOLID' && node.fills[0].color) {
            const hex = (0, color_1.figmaColorToHex)(node.fills[0].color);
            const token = (0, color_1.findColorToken)(hex, registry.tokens);
            cssVars['background'] = (_c = token === null || token === void 0 ? void 0 : token.blazeCSSVar) !== null && _c !== void 0 ? _c : cssVar;
        }
    }
    return cssVars;
}
// ─── Slot Mapping ─────────────────────────────────────────────────────────────
function applySlotMappings(node, entry) {
    var _a;
    const slots = {};
    if (!node.children)
        return slots;
    // Track label/children slot index for position-based icon inference
    let labelIndex = -1;
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const slotDef = entry.slotMappings[child.name];
        if (slotDef) {
            if (child.type === 'TEXT' && child.characters) {
                slots[slotDef.slot] = child.characters;
            }
            else {
                slots[slotDef.slot] = { component: (_a = slotDef.component) !== null && _a !== void 0 ? _a : child.name };
            }
            if (slotDef.slot === 'children')
                labelIndex = i;
        }
    }
    // Position-based icon slot inference for CapIcon/<type> children.
    // Only applies to components with prefix/suffix slots (CapButton, CapInput, etc.)
    const hasPrefixSuffix = 'Icon Left' in entry.slotMappings || 'Left Icon' in entry.slotMappings;
    if (hasPrefixSuffix) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            // Already captured by exact name match? Skip.
            if (entry.slotMappings[child.name])
                continue;
            const iconType = extractIconType(child.name);
            if (!iconType)
                continue;
            // Left of label → prefix; right of label (or no label found) → suffix
            const slot = (labelIndex === -1 || i < labelIndex) ? 'prefix' : 'suffix';
            if (!slots[slot]) {
                slots[slot] = { component: 'CapIcon', props: { type: iconType } };
            }
        }
    }
    // Also capture plain text content
    if (!slots['children'] && node.characters) {
        slots['children'] = node.characters;
    }
    return slots;
}
// ─── TEXT node → CapLabel ─────────────────────────────────────────────────────
function resolveTextNode(node, registry) {
    var _a;
    const warnings = [];
    const manualOverrides = [];
    const props = {};
    const cssVariables = {};
    if (node.style) {
        const labelType = (0, typography_1.findLabelType)(node.style.fontSize, node.style.fontWeight);
        props['type'] = labelType;
        cssVariables['fontSize'] = (0, typography_1.findFontSizeToken)(node.style.fontSize);
        const nonRoboto = (0, typography_1.mapFontToNonRoboto)(node.style.fontFamily);
        if (nonRoboto) {
            manualOverrides.push(`NEEDS_MANUAL_OVERRIDE: non-Roboto font detected (${nonRoboto})`);
        }
    }
    const labelEntry = registry.components.find((e) => e.targetComponent === 'CapLabel');
    return {
        figmaNodeId: node.id,
        figmaNodeType: node.type,
        figmaComponentName: node.name,
        mappingStatus: 'EXACT',
        targetComponent: 'CapLabel',
        importPath: (_a = labelEntry === null || labelEntry === void 0 ? void 0 : labelEntry.importPath) !== null && _a !== void 0 ? _a : 'blaze-ui/components/CapLabel',
        props,
        slots: node.characters ? { children: node.characters } : {},
        cssVariables,
        ...extractRichContext(node),
        manualOverrides,
        warnings,
        fallback: null,
        children: [],
        source: 'typography',
        fingerprint: (0, fingerprint_1.fingerprintNode)(node),
    };
}
// ─── Fallback Generation ──────────────────────────────────────────────────────
function buildFallback(node, registry) {
    var _a, _b, _c, _d, _e, _f;
    const childCount = (_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const hasFills = ((_d = (_c = node.fills) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0;
    const box = node.absoluteBoundingBox;
    const isSquare = box
        ? Math.abs(box.width - box.height) / Math.max(box.width, box.height) < 0.2
        : false;
    const isNarrowHeight = box ? box.height < 52 : false;
    const isWide = box ? box.width > 300 : false;
    const isSingleText = childCount === 1 && ((_f = (_e = node.children) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.type) === 'TEXT';
    const isHorizontal = node.layoutMode === 'HORIZONTAL';
    const isVertical = node.layoutMode === 'VERTICAL';
    let nearestComponent = null;
    let nearestRationale = 'No structural match found';
    if (isSquare && childCount === 0) {
        nearestComponent = 'CapIcon';
        nearestRationale = 'Square leaf node (no children) resembles an icon';
    }
    else if (isNarrowHeight && isHorizontal && childCount <= 3) {
        nearestComponent = 'CapButton';
        nearestRationale = 'Short horizontal auto-layout row with ≤3 children resembles a button';
    }
    else if (isSingleText) {
        nearestComponent = 'CapLabel';
        nearestRationale = 'Single TEXT child — container is a label wrapper';
    }
    else if (isWide && hasFills && childCount > 2) {
        nearestComponent = 'CapCard';
        nearestRationale = 'Wide (>300px) filled frame with many children resembles a card';
    }
    else if (isHorizontal && childCount > 0) {
        nearestComponent = 'CapRow';
        nearestRationale = 'Auto-layout HORIZONTAL container';
    }
    else if (isVertical && childCount > 0) {
        nearestComponent = 'CapColumn';
        nearestRationale = 'Auto-layout VERTICAL container';
    }
    else if (childCount === 0 && hasFills) {
        nearestComponent = 'CapIcon';
        nearestRationale = 'Leaf node with fills resembles an icon element';
    }
    // Ensure suggested component exists in registry
    if (nearestComponent && !registry.components.find((e) => e.targetComponent === nearestComponent)) {
        nearestComponent = null;
    }
    const widthStyle = box ? `width: ${box.width}px; ` : '';
    const heightStyle = box ? `height: ${box.height}px; ` : '';
    return {
        nearestComponent,
        nearestComponentRationale: nearestRationale,
        htmlFallback: `<div style="${widthStyle}${heightStyle}display: flex;"><!-- ${node.name} --></div>`,
    };
}
// ─── Core Resolution ──────────────────────────────────────────────────────────
const SEEN_IDS = new Set();
/**
 * Resolve a single FigmaNode to a RecipeNode using the mapping registry.
 * Never throws — returns UNMAPPED with fallback on no match.
 */
function resolveNode(node, registry) {
    var _a, _b, _c;
    // Guard against circular references
    if (SEEN_IDS.has(node.id)) {
        return unmappedNode(node, registry, ['Circular reference detected']);
    }
    SEEN_IDS.add(node.id);
    try {
        // TEXT nodes always resolve to CapLabel
        if (node.type === 'TEXT') {
            return resolveTextNode(node, registry);
        }
        // Check manual overrides for absolute positioning
        const manualOverrides = [];
        if (!node.layoutMode || node.layoutMode === 'NONE') {
            if (((_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
                manualOverrides.push('NEEDS_MANUAL_OVERRIDE: absolute positioning detected (no layoutMode)');
            }
        }
        // Custom_ prefix forces BESPOKE — skip registry matching entirely.
        // Designers prefix a frame with "Custom_" to signal it needs a bespoke
        // component (no Cap* match). Strip the prefix for the display name.
        if (node.name.startsWith('Custom_')) {
            const children = resolveChildren(node, { targetComponent: '', importPath: '', figmaIdentifier: '', propMappings: {}, slotMappings: {} }, registry, manualOverrides);
            return {
                figmaNodeId: node.id,
                figmaNodeType: node.type,
                figmaComponentName: node.name,
                mappingStatus: 'BESPOKE',
                targetComponent: null,
                importPath: null,
                props: {},
                slots: {},
                cssVariables: {},
                ...extractRichContext(node),
                manualOverrides,
                warnings: [],
                fallback: {
                    nearestComponent: null,
                    nearestComponentRationale: `Custom_ prefix — bespoke component required`,
                    htmlFallback: `<div><!-- ${node.name} — BESPOKE --></div>`,
                },
                children,
            };
        }
        // Try to find a matching entry
        let entry = findEntry(node, registry);
        // Fall back to auto-layout detection for FRAME/GROUP nodes
        if (!entry && (node.type === 'FRAME' || node.type === 'GROUP')) {
            entry = detectLayoutComponent(node, registry);
        }
        if (!entry) {
            return unmappedNode(node, registry, manualOverrides);
        }
        const props = { ...((_c = entry.defaultProps) !== null && _c !== void 0 ? _c : {}), ...applyPropMappings(node, entry) };
        // Extract icon type from CapIcon/<type> naming convention
        if (entry.targetComponent === 'CapIcon' && !props['type']) {
            const iconType = extractIconType(node.name);
            if (iconType)
                props['type'] = iconType;
        }
        const slots = applySlotMappings(node, entry);
        const cssVariables = applyCssVariables(node, entry, registry);
        const warnings = [];
        // Stop recursion for leaf component instances (INSTANCE/COMPONENT type) — the match
        // is the leaf; there is no value in traversing Figma's internal implementation nodes.
        // EXCEPTION: isComposite=true entries (CapTable, CapTab, CapMenu etc) contain meaningful
        // Figma children — column cells with action buttons, tab panes with full layouts, etc.
        // Continue recursion for layout containers (FRAME/GROUP) so their children are resolved.
        const isLeafInstance = (node.type === 'INSTANCE' || node.type === 'COMPONENT') && !entry.isComposite;
        const children = isLeafInstance
            ? []
            : resolveChildren(node, entry, registry, warnings);
        const allPropsResolved = Object.keys(entry.propMappings).length === 0 || Object.keys(props).length > 0;
        const status = allPropsResolved ? 'EXACT' : 'PARTIAL';
        if (status === 'PARTIAL') {
            warnings.push(`Some props from entry ${entry.figmaIdentifier} could not be resolved`);
        }
        const isLayoutInferred = !findEntry(node, registry) && !!detectLayoutComponent(node, registry);
        return {
            figmaNodeId: node.id,
            figmaNodeType: node.type,
            figmaComponentName: node.name,
            mappingStatus: status,
            targetComponent: entry.targetComponent,
            importPath: entry.importPath,
            props,
            slots,
            cssVariables,
            ...extractRichContext(node),
            manualOverrides,
            warnings,
            fallback: null,
            children,
            source: isLayoutInferred ? 'layout-inferred' : 'registry',
            fingerprint: (0, fingerprint_1.fingerprintNode)(node),
        };
    }
    finally {
        SEEN_IDS.delete(node.id);
    }
}
function resolveChildren(node, entry, registry, warnings) {
    var _a;
    if (!((_a = node.children) === null || _a === void 0 ? void 0 : _a.length))
        return [];
    const children = [];
    for (const child of node.children) {
        // Skip children that are already captured as slots
        const isSlotted = Object.keys(entry.slotMappings).includes(child.name);
        if (isSlotted)
            continue;
        // Skip TEXT children that are already in slots
        if (child.type === 'TEXT' && child.characters)
            continue;
        const childRecipe = resolveNode(child, registry);
        if (childRecipe.mappingStatus === 'UNMAPPED') {
            warnings.push(`Child "${child.name}" (${child.type}) could not be mapped`);
        }
        children.push(childRecipe);
    }
    return children;
}
function unmappedNode(node, registry, extraOverrides = []) {
    var _a, _b, _c;
    // Continue traversal into children even when this node is UNMAPPED.
    // Stopping here was the original bug — it prevented CapButton/CapInput/CapSelect
    // instances nested inside anonymous FRAME containers from ever being reached.
    // INSTANCE nodes have no Figma children in the XML, so this is naturally a no-op for them.
    const children = ((_a = node.children) !== null && _a !== void 0 ? _a : []).map((child) => resolveNode(child, registry));
    const fallback = buildFallback(node, registry);
    // Extract icon type for UNMAPPED nodes where fallback suggests CapIcon
    const unmappedProps = {};
    if (fallback.nearestComponent === 'CapIcon') {
        const iconType = extractIconType(node.name);
        if (iconType)
            unmappedProps['type'] = iconType;
    }
    // No Cap* match and no reasonable fallback, but has children →
    // this is a complex custom layout that needs a bespoke component
    // built from scratch using Cap* primitives (bottom-up).
    const hasChildren = ((_c = (_b = node.children) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) > 0;
    const status = (fallback.nearestComponent === null && hasChildren)
        ? 'BESPOKE'
        : 'UNMAPPED';
    return {
        figmaNodeId: node.id,
        figmaNodeType: node.type,
        figmaComponentName: node.name,
        mappingStatus: status,
        targetComponent: null,
        importPath: null,
        props: unmappedProps,
        slots: {},
        cssVariables: {},
        ...extractRichContext(node),
        manualOverrides: extraOverrides,
        warnings: [],
        fallback,
        children,
        source: 'unresolved',
        fingerprint: (0, fingerprint_1.fingerprintNode)(node),
    };
}
// ─── Screen Resolution ────────────────────────────────────────────────────────
/**
 * Walk an entire Figma screen/frame recursively and return a full ConversionRecipe.
 */
function resolveScreen(rootNode, registry) {
    SEEN_IDS.clear();
    const root = resolveNode(rootNode, registry);
    const stats = collectStats(root);
    return {
        resolvedAt: new Date().toISOString(),
        root,
        stats,
    };
}
function collectStats(node) {
    const counts = { total: 0, exact: 0, partial: 0, unmapped: 0 };
    walkRecipe(node, counts);
    return counts;
}
function walkRecipe(node, counts) {
    counts.total++;
    if (node.mappingStatus === 'EXACT')
        counts.exact++;
    else if (node.mappingStatus === 'PARTIAL')
        counts.partial++;
    else
        counts.unmapped++;
    for (const child of node.children) {
        walkRecipe(child, counts);
    }
}
//# sourceMappingURL=resolver.js.map