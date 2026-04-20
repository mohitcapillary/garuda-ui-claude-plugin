/**
 * recipe-merger.ts
 *
 * Merges N per-section ConversionRecipes (produced by resolve-metadata on
 * individual section nodeIds) into a single unified ConversionRecipe whose
 * structure matches what a full-screen single-node fetch would have produced.
 *
 * Also builds a StitchingContext — a compact index used by the HLD writer
 * to process sections one at a time without loading the full merged recipe.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ConversionRecipe,
  FigmaBoundingBox,
  RecipeNode,
  ScreenManifestMeta,
  SectionEntry,
  StitchingContext,
  StitchingSection,
} from './types';

// ─── Spatial sort helpers ─────────────────────────────────────────────────────

/**
 * Sort sections in reading order: top-to-bottom (Y), then left-to-right (X).
 */
function spatialSort(
  sections: Array<SectionEntry & { recipeFilePath: string }>
): Array<SectionEntry & { recipeFilePath: string }> {
  return [...sections].sort((a, b) => {
    const yDiff = a.boundingBox.y - b.boundingBox.y;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.boundingBox.x - b.boundingBox.x;
  });
}

// ─── Collision guard ──────────────────────────────────────────────────────────

/**
 * Walk a RecipeNode tree and collect all node IDs → section index.
 * Used to detect duplicate nodeIds across section recipes.
 */
function collectNodeIds(
  node: RecipeNode,
  sectionIndex: number,
  map: Map<string, number>
): void {
  if (map.has(node.figmaNodeId)) return; // first section wins
  map.set(node.figmaNodeId, sectionIndex);
  for (const child of node.children) {
    collectNodeIds(child, sectionIndex, map);
  }
}

/**
 * Remove duplicate nodes from a recipe tree that belong to a different section.
 * Keeps nodes only if their ID is owned by `ownSectionIndex` in the global map.
 */
function deduplicateTree(
  node: RecipeNode,
  ownSectionIndex: number,
  ownerMap: Map<string, number>
): RecipeNode {
  const filteredChildren = node.children
    .filter((child) => {
      const owner = ownerMap.get(child.figmaNodeId);
      return owner === undefined || owner === ownSectionIndex;
    })
    .map((child) => deduplicateTree(child, ownSectionIndex, ownerMap));

  return { ...node, children: filteredChildren };
}

// ─── Component summary ────────────────────────────────────────────────────────

/**
 * Walk a RecipeNode tree and collect unique non-null targetComponent values.
 */
function collectComponents(node: RecipeNode, set: Set<string>): void {
  if (node.targetComponent) set.add(node.targetComponent);
  for (const child of node.children) collectComponents(child, set);
}

// ─── Stats aggregation ────────────────────────────────────────────────────────

function sumStats(
  recipes: ConversionRecipe[]
): ConversionRecipe['stats'] {
  return recipes.reduce(
    (acc, r) => ({
      total: acc.total + r.stats.total,
      exact: acc.exact + r.stats.exact,
      partial: acc.partial + r.stats.partial,
      unmapped: acc.unmapped + r.stats.unmapped,
    }),
    { total: 0, exact: 0, partial: 0, unmapped: 0 }
  );
}

// ─── Bounding box union ───────────────────────────────────────────────────────

function unionBoundingBox(boxes: FigmaBoundingBox[]): FigmaBoundingBox {
  if (boxes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Merge N partial ConversionRecipes into one unified recipe.
 *
 * The merged recipe has a synthetic root node (CapColumn or CapRow depending
 * on rootLayoutMode) whose children are the sorted section roots.
 */
export function mergeRecipes(
  partials: ConversionRecipe[],
  manifest: ScreenManifestMeta
): ConversionRecipe {
  if (partials.length === 0) {
    throw new Error('mergeRecipes: no partial recipes provided');
  }

  if (partials.length === 1) {
    // No merge needed — return the single partial as-is but annotate it
    return {
      ...partials[0],
      root: {
        ...partials[0].root,
        manualOverrides: [
          ...partials[0].root.manualOverrides,
          'CHUNKED_MERGE: single section, no synthetic root needed',
        ],
      },
    };
  }

  const sorted = spatialSort(manifest.sections);

  // Build global node-owner map for collision detection
  const ownerMap = new Map<string, number>();
  partials.forEach((recipe, idx) => collectNodeIds(recipe.root, idx, ownerMap));

  // Deduplicate each partial and collect its root
  const sectionRoots: RecipeNode[] = partials.map((recipe, idx) =>
    deduplicateTree(recipe.root, idx, ownerMap)
  );

  // Re-order roots to match spatial sort order
  const sortedRoots = sorted.map((section) => {
    const originalIdx = manifest.sections.findIndex(
      (s) => s.nodeId === section.nodeId
    );
    return sectionRoots[originalIdx] ?? sectionRoots[0];
  });

  const syntheticRoot: RecipeNode = {
    figmaNodeId: manifest.rootNodeId,
    figmaNodeType: 'FRAME',
    figmaComponentName: manifest.rootName,
    mappingStatus: 'EXACT',
    targetComponent:
      manifest.rootLayoutMode === 'HORIZONTAL' ? 'CapRow' : 'CapColumn',
    importPath:
      manifest.rootLayoutMode === 'HORIZONTAL'
        ? '@capillarytech/cap-ui-library/CapRow'
        : '@capillarytech/cap-ui-library/CapColumn',
    props: {},
    slots: {},
    cssVariables: {},
    manualOverrides: [
      `CHUNKED_MERGE: synthetic root assembled from ${partials.length} section recipes`,
    ],
    warnings: [],
    fallback: null,
    children: sortedRoots,
    source: 'layout-inferred',
  };

  return {
    figmaFileKey: partials[0].figmaFileKey,
    resolvedAt: new Date().toISOString(),
    root: syntheticRoot,
    stats: sumStats(partials),
  };
}

/**
 * Build a StitchingContext from the merged recipe + manifest.
 * sectionsDir is used to construct recipePath for each section.
 */
export function buildStitchingContext(
  merged: ConversionRecipe,
  manifest: ScreenManifestMeta,
  sectionsDir: string,
  mergedRecipePath: string
): StitchingContext {
  const sorted = spatialSort(manifest.sections);
  const rootOrigin = manifest.rootBoundingBox;

  const sections: StitchingSection[] = sorted.map((section, idx) => {
    const recipePath = path.join(sectionsDir, `${section.nodeId}.recipe.json`);

    // Extract component summary from the section's recipe if it exists
    const componentSet = new Set<string>();
    if (fs.existsSync(recipePath)) {
      try {
        const sectionRecipe: ConversionRecipe = JSON.parse(
          fs.readFileSync(recipePath, 'utf-8')
        );
        collectComponents(sectionRecipe.root, componentSet);
      } catch {
        // ignore read errors — summary will be empty
      }
    }

    // Find the matching partial stats from the merged recipe's children
    const sectionRoot = merged.root.children[idx];
    const sectionStats = sectionRoot
      ? {
          total: countNodes(sectionRoot),
          exact: countNodesByStatus(sectionRoot, 'EXACT'),
          partial: countNodesByStatus(sectionRoot, 'PARTIAL'),
          unmapped: countNodesByStatus(sectionRoot, 'UNMAPPED'),
        }
      : { total: 0, exact: 0, partial: 0, unmapped: 0 };

    return {
      sectionNodeId: section.nodeId,
      sectionName: section.name,
      relativePosition: {
        x: section.boundingBox.x - rootOrigin.x,
        y: section.boundingBox.y - rootOrigin.y,
        width: section.boundingBox.width,
        height: section.boundingBox.height,
      },
      readingOrder: idx,
      recipePath,
      componentSummary: Array.from(componentSet).sort(),
      mappingStats: sectionStats,
    };
  });

  const totalBoundingBox = unionBoundingBox(
    manifest.sections.map((s) => s.boundingBox)
  );

  return {
    rootNodeId: manifest.rootNodeId,
    rootName: manifest.rootName,
    rootLayoutMode: manifest.rootLayoutMode,
    totalBoundingBox,
    mergedRecipePath,
    sections,
    stats: merged.stats,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Tree count helpers ───────────────────────────────────────────────────────

function countNodes(node: RecipeNode): number {
  return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0);
}

function countNodesByStatus(
  node: RecipeNode,
  status: 'EXACT' | 'PARTIAL' | 'UNMAPPED'
): number {
  const self = node.mappingStatus === status ? 1 : 0;
  return (
    self +
    node.children.reduce((acc, c) => acc + countNodesByStatus(c, status), 0)
  );
}
