import micromatch from 'micromatch';

import { figmaColorToHex, findColorToken } from './utils/color';
import { fingerprintNode } from './utils/fingerprint';
import { findLabelType, findFontSizeToken, mapFontToNonRoboto } from './utils/typography';
import {
  ComponentMapping,
  ConversionRecipe,
  FallbackSpec,
  FigmaNode,
  MappingRegistry,
  MappingStatus,
  PropValueMap,
  RecipeNode,
  RecipeSlot,
} from './types';

// ─── Name Matching ────────────────────────────────────────────────────────────

function matchesComponentName(nodeName: string, patterns: string[]): boolean {
  const lower = nodeName.toLowerCase();
  return patterns.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    if (micromatch.isMatch(lower, lowerPattern)) return true;
    // Also try the raw pattern in case micromatch doesn't catch it
    const regex = new RegExp(
      '^' + lowerPattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(lower);
  });
}

function matchesVariantPatterns(
  node: FigmaNode,
  patterns?: Record<string, string>
): boolean {
  if (!patterns || Object.keys(patterns).length === 0) return true;
  if (!node.variantProperties) return false;
  return Object.entries(patterns).every(([key, value]) => {
    const nodeVal = node.variantProperties?.[key];
    return nodeVal?.toLowerCase() === value.toLowerCase();
  });
}

// ─── Entry Lookup ─────────────────────────────────────────────────────────────

function findEntry(
  node: FigmaNode,
  registry: MappingRegistry
): ComponentMapping | null {
  const nameStartsWithCap = node.name.startsWith('Cap');

  // 1. Try entries with variant patterns first (more specific)
  for (const entry of registry.components) {
    if (!nameStartsWithCap && !entry.nodeTypes.includes(node.type)) continue;
    if (!matchesComponentName(node.name, entry.componentNames)) continue;
    if (
      entry.variantPatterns &&
      Object.keys(entry.variantPatterns).length > 0 &&
      !matchesVariantPatterns(node, entry.variantPatterns)
    ) {
      continue;
    }
    return entry;
  }
  // 2. Fall back to entries without variant patterns
  for (const entry of registry.components) {
    if (!nameStartsWithCap && !entry.nodeTypes.includes(node.type)) continue;
    if (!matchesComponentName(node.name, entry.componentNames)) continue;
    return entry;
  }
  return null;
}

// ─── Auto-Layout → Row/Column detection ──────────────────────────────────────

function detectLayoutComponent(
  node: FigmaNode,
  registry: MappingRegistry
): ComponentMapping | null {
  if (node.layoutMode === 'HORIZONTAL') {
    return registry.components.find((e) => e.figmaIdentifier === 'cap-row') ?? null;
  }
  if (node.layoutMode === 'VERTICAL') {
    return (
      registry.components.find((e) => e.figmaIdentifier === 'cap-column') ?? null
    );
  }
  return null;
}

// ─── Rich Context Extraction ──────────────────────────────────────────────────

/**
 * Extract human-readable context from an enriched FigmaNode for LLM consumption.
 * Reads label text, byline, placeholder, typography, spacing, and radius —
 * all sourced from the JSX-enriched FigmaNode tree.
 */
function extractRichContext(node: FigmaNode): Partial<RecipeNode> {
  const ctx: Partial<RecipeNode> = {};

  // ── Text content ──────────────────────────────────────────────────────────
  const textChildren = node.children?.filter((c) => c.type === 'TEXT') ?? [];

  // Label: first TEXT child or the node's own characters
  const labelText = textChildren[0]?.characters ?? node.characters;
  if (labelText) ctx.label = labelText;

  // Byline: second TEXT child (label + helper text pattern)
  if (textChildren.length >= 2 && textChildren[1].characters) {
    ctx.byline = textChildren[1].characters;
  }

  // Placeholder: look for a descendant named "Field" or "placeholder" that has characters
  const fieldNode = node.children?.find(
    (c) => c.name?.toLowerCase().includes('field') || c.name?.toLowerCase().includes('placeholder')
  );
  if (fieldNode?.characters) ctx.placeholder = fieldNode.characters;

  // ── Typography ────────────────────────────────────────────────────────────
  if (node.style) {
    if (node.style.fontWeight) ctx.fontWeight = node.style.fontWeight;
    if (node.style.fontFamily) ctx.fontFamily = node.style.fontFamily;
  }

  // ── Geometry ─────────────────────────────────────────────────────────────
  if (node.cornerRadius !== undefined) ctx.cornerRadius = node.cornerRadius;
  if (node.itemSpacing !== undefined) ctx.itemSpacing = node.itemSpacing;

  if (
    node.paddingLeft !== undefined ||
    node.paddingRight !== undefined ||
    node.paddingTop !== undefined ||
    node.paddingBottom !== undefined
  ) {
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

function applyPropMappings(
  node: FigmaNode,
  entry: ComponentMapping
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const srcProps = {
    ...(node.componentProperties ?? {}),
    ...(node.variantProperties ?? {}),
  };

  for (const [figmaProp, mapping] of Object.entries(entry.propMappings)) {
    const value = srcProps[figmaProp];
    if (value === undefined) continue;

    if ('map' in mapping) {
      const valueMap = mapping as PropValueMap;
      const mapped = valueMap.map[String(value)];
      if (mapped) Object.assign(props, mapped);
    } else {
      const transform = mapping.transform;
      if (transform === 'boolean') {
        props[mapping.prop] = Boolean(value);
      } else if (transform === 'number') {
        props[mapping.prop] = Number(value);
      } else {
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

function applyCssVariables(
  node: FigmaNode,
  entry: ComponentMapping,
  registry: MappingRegistry
): Record<string, string> {
  const cssVars: Record<string, string> = {};

  if (!entry.cssVariableMappings) return cssVars;

  for (const [path, cssVar] of Object.entries(entry.cssVariableMappings)) {
    if (path === 'fills[0]' && node.fills?.[0]?.type === 'SOLID' && node.fills[0].color) {
      const hex = figmaColorToHex(node.fills[0].color);
      const token = findColorToken(hex, registry.tokens);
      cssVars['background'] = token?.blazeCSSVar ?? cssVar;
    }
  }

  return cssVars;
}

// ─── Slot Mapping ─────────────────────────────────────────────────────────────

function applySlotMappings(
  node: FigmaNode,
  entry: ComponentMapping
): Record<string, RecipeSlot | string> {
  const slots: Record<string, RecipeSlot | string> = {};
  if (!node.children) return slots;

  for (const child of node.children) {
    const slotDef = entry.slotMappings[child.name];
    if (slotDef) {
      if (child.type === 'TEXT' && child.characters) {
        slots[slotDef.slot] = child.characters;
      } else {
        slots[slotDef.slot] = { component: slotDef.component ?? child.name };
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

function resolveTextNode(node: FigmaNode, registry: MappingRegistry): RecipeNode {
  const warnings: string[] = [];
  const manualOverrides: string[] = [];
  const props: Record<string, unknown> = {};
  const cssVariables: Record<string, string> = {};

  if (node.style) {
    const labelType = findLabelType(node.style.fontSize, node.style.fontWeight);
    props['type'] = labelType;
    cssVariables['fontSize'] = findFontSizeToken(node.style.fontSize);

    const nonRoboto = mapFontToNonRoboto(node.style.fontFamily);
    if (nonRoboto) {
      manualOverrides.push(`NEEDS_MANUAL_OVERRIDE: non-Roboto font detected (${nonRoboto})`);
    }
  }

  const labelEntry = registry.components.find(
    (e) => e.targetComponent === 'CapLabel'
  );

  return {
    figmaNodeId: node.id,
    figmaNodeType: node.type,
    figmaComponentName: node.name,
    mappingStatus: 'EXACT',
    targetComponent: 'CapLabel',
    importPath: labelEntry?.importPath ?? 'blaze-ui/components/CapLabel',
    props,
    slots: node.characters ? { children: node.characters } : {},
    cssVariables,
    ...extractRichContext(node),
    manualOverrides,
    warnings,
    fallback: null,
    children: [],
    source: 'typography',
    fingerprint: fingerprintNode(node),
  };
}

// ─── Fallback Generation ──────────────────────────────────────────────────────

function buildFallback(node: FigmaNode, registry: MappingRegistry): FallbackSpec {
  const childCount = node.children?.length ?? 0;
  const hasFills = (node.fills?.length ?? 0) > 0;
  const box = node.absoluteBoundingBox;

  const isSquare = box
    ? Math.abs(box.width - box.height) / Math.max(box.width, box.height) < 0.2
    : false;
  const isNarrowHeight = box ? box.height < 52 : false;
  const isWide = box ? box.width > 300 : false;
  const isSingleText = childCount === 1 && node.children?.[0]?.type === 'TEXT';
  const isHorizontal = node.layoutMode === 'HORIZONTAL';
  const isVertical = node.layoutMode === 'VERTICAL';

  let nearestComponent: string | null = null;
  let nearestRationale = 'No structural match found';

  if (isSquare && childCount === 0) {
    nearestComponent = 'CapIcon';
    nearestRationale = 'Square leaf node (no children) resembles an icon';
  } else if (isNarrowHeight && isHorizontal && childCount <= 3) {
    nearestComponent = 'CapButton';
    nearestRationale = 'Short horizontal auto-layout row with ≤3 children resembles a button';
  } else if (isSingleText) {
    nearestComponent = 'CapLabel';
    nearestRationale = 'Single TEXT child — container is a label wrapper';
  } else if (isWide && hasFills && childCount > 2) {
    nearestComponent = 'CapCard';
    nearestRationale = 'Wide (>300px) filled frame with many children resembles a card';
  } else if (isHorizontal && childCount > 0) {
    nearestComponent = 'CapRow';
    nearestRationale = 'Auto-layout HORIZONTAL container';
  } else if (isVertical && childCount > 0) {
    nearestComponent = 'CapColumn';
    nearestRationale = 'Auto-layout VERTICAL container';
  } else if (childCount > 2 && hasFills) {
    nearestComponent = 'CapCard';
    nearestRationale = 'Multi-child frame with fills resembles a card container';
  } else if (childCount === 0 && hasFills) {
    nearestComponent = 'CapIcon';
    nearestRationale = 'Leaf node with fills resembles an icon element';
  } else if (childCount > 0) {
    nearestComponent = 'CapRow';
    nearestRationale = 'Multi-child container with no matched component; layout wrapper suggested';
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

const SEEN_IDS = new Set<string>();

/**
 * Resolve a single FigmaNode to a RecipeNode using the mapping registry.
 * Never throws — returns UNMAPPED with fallback on no match.
 */
export function resolveNode(
  node: FigmaNode,
  registry: MappingRegistry
): RecipeNode {
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
    const manualOverrides: string[] = [];
    if (!node.layoutMode || node.layoutMode === 'NONE') {
      if ((node.children?.length ?? 0) > 0) {
        manualOverrides.push(
          'NEEDS_MANUAL_OVERRIDE: absolute positioning detected (no layoutMode)'
        );
      }
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

    const props = { ...(entry.defaultProps ?? {}), ...applyPropMappings(node, entry) };
    const slots = applySlotMappings(node, entry);
    const cssVariables = applyCssVariables(node, entry, registry);

    const warnings: string[] = [];
    // Stop recursion for leaf component instances (INSTANCE/COMPONENT type) — the match
    // is the leaf; there is no value in traversing Figma's internal implementation nodes.
    // EXCEPTION: isComposite=true entries (CapTable, CapTab, CapMenu etc) contain meaningful
    // Figma children — column cells with action buttons, tab panes with full layouts, etc.
    // Continue recursion for layout containers (FRAME/GROUP) so their children are resolved.
    const isLeafInstance = (node.type === 'INSTANCE' || node.type === 'COMPONENT') && !entry.isComposite;
    const children: RecipeNode[] = isLeafInstance
      ? []
      : resolveChildren(node, entry, registry, warnings);

    const allPropsResolved = Object.keys(entry.propMappings).length === 0 || Object.keys(props).length > 0;
    const status: MappingStatus = allPropsResolved ? 'EXACT' : 'PARTIAL';

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
      fingerprint: fingerprintNode(node),
    };
  } finally {
    SEEN_IDS.delete(node.id);
  }
}

function resolveChildren(
  node: FigmaNode,
  entry: ComponentMapping,
  registry: MappingRegistry,
  warnings: string[]
): RecipeNode[] {
  if (!node.children?.length) return [];

  const children: RecipeNode[] = [];
  for (const child of node.children) {
    // Skip children that are already captured as slots
    const isSlotted = Object.keys(entry.slotMappings).includes(child.name);
    if (isSlotted) continue;

    // Skip TEXT children that are already in slots
    if (child.type === 'TEXT' && child.characters) continue;

    const childRecipe = resolveNode(child, registry);
    if (childRecipe.mappingStatus === 'UNMAPPED') {
      warnings.push(`Child "${child.name}" (${child.type}) could not be mapped`);
    }
    children.push(childRecipe);
  }
  return children;
}

function unmappedNode(
  node: FigmaNode,
  registry: MappingRegistry,
  extraOverrides: string[] = []
): RecipeNode {
  // Continue traversal into children even when this node is UNMAPPED.
  // Stopping here was the original bug — it prevented CapButton/CapInput/CapSelect
  // instances nested inside anonymous FRAME containers from ever being reached.
  // INSTANCE nodes have no Figma children in the XML, so this is naturally a no-op for them.
  const children: RecipeNode[] = (node.children ?? []).map((child) =>
    resolveNode(child, registry)
  );

  return {
    figmaNodeId: node.id,
    figmaNodeType: node.type,
    figmaComponentName: node.name,
    mappingStatus: 'UNMAPPED',
    targetComponent: null,
    importPath: null,
    props: {},
    slots: {},
    cssVariables: {},
    ...extractRichContext(node),
    manualOverrides: extraOverrides,
    warnings: [],
    fallback: buildFallback(node, registry),
    children,
    source: 'unresolved',
    fingerprint: fingerprintNode(node),
  };
}

// ─── Screen Resolution ────────────────────────────────────────────────────────

/**
 * Walk an entire Figma screen/frame recursively and return a full ConversionRecipe.
 */
export function resolveScreen(
  rootNode: FigmaNode,
  registry: MappingRegistry
): ConversionRecipe {
  SEEN_IDS.clear();
  const root = resolveNode(rootNode, registry);
  const stats = collectStats(root);

  return {
    resolvedAt: new Date().toISOString(),
    root,
    stats,
  };
}

function collectStats(node: RecipeNode): ConversionRecipe['stats'] {
  const counts = { total: 0, exact: 0, partial: 0, unmapped: 0 };
  walkRecipe(node, counts);
  return counts;
}

function walkRecipe(
  node: RecipeNode,
  counts: ConversionRecipe['stats']
): void {
  counts.total++;
  if (node.mappingStatus === 'EXACT') counts.exact++;
  else if (node.mappingStatus === 'PARTIAL') counts.partial++;
  else counts.unmapped++;
  for (const child of node.children) {
    walkRecipe(child, counts);
  }
}
