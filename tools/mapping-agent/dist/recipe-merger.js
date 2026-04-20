"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeRecipes = mergeRecipes;
exports.buildStitchingContext = buildStitchingContext;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ─── Spatial sort helpers ─────────────────────────────────────────────────────
/**
 * Sort sections in reading order: top-to-bottom (Y), then left-to-right (X).
 */
function spatialSort(sections) {
    return [...sections].sort((a, b) => {
        const yDiff = a.boundingBox.y - b.boundingBox.y;
        if (Math.abs(yDiff) > 4)
            return yDiff;
        return a.boundingBox.x - b.boundingBox.x;
    });
}
// ─── Collision guard ──────────────────────────────────────────────────────────
/**
 * Walk a RecipeNode tree and collect all node IDs → section index.
 * Used to detect duplicate nodeIds across section recipes.
 */
function collectNodeIds(node, sectionIndex, map) {
    if (map.has(node.figmaNodeId))
        return; // first section wins
    map.set(node.figmaNodeId, sectionIndex);
    for (const child of node.children) {
        collectNodeIds(child, sectionIndex, map);
    }
}
/**
 * Remove duplicate nodes from a recipe tree that belong to a different section.
 * Keeps nodes only if their ID is owned by `ownSectionIndex` in the global map.
 */
function deduplicateTree(node, ownSectionIndex, ownerMap) {
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
function collectComponents(node, set) {
    if (node.targetComponent)
        set.add(node.targetComponent);
    for (const child of node.children)
        collectComponents(child, set);
}
// ─── Stats aggregation ────────────────────────────────────────────────────────
function sumStats(recipes) {
    return recipes.reduce((acc, r) => ({
        total: acc.total + r.stats.total,
        exact: acc.exact + r.stats.exact,
        partial: acc.partial + r.stats.partial,
        unmapped: acc.unmapped + r.stats.unmapped,
    }), { total: 0, exact: 0, partial: 0, unmapped: 0 });
}
// ─── Bounding box union ───────────────────────────────────────────────────────
function unionBoundingBox(boxes) {
    if (boxes.length === 0)
        return { x: 0, y: 0, width: 0, height: 0 };
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
function mergeRecipes(partials, manifest) {
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
    const ownerMap = new Map();
    partials.forEach((recipe, idx) => collectNodeIds(recipe.root, idx, ownerMap));
    // Deduplicate each partial and collect its root
    const sectionRoots = partials.map((recipe, idx) => deduplicateTree(recipe.root, idx, ownerMap));
    // Re-order roots to match spatial sort order
    const sortedRoots = sorted.map((section) => {
        var _a;
        const originalIdx = manifest.sections.findIndex((s) => s.nodeId === section.nodeId);
        return (_a = sectionRoots[originalIdx]) !== null && _a !== void 0 ? _a : sectionRoots[0];
    });
    const syntheticRoot = {
        figmaNodeId: manifest.rootNodeId,
        figmaNodeType: 'FRAME',
        figmaComponentName: manifest.rootName,
        mappingStatus: 'EXACT',
        targetComponent: manifest.rootLayoutMode === 'HORIZONTAL' ? 'CapRow' : 'CapColumn',
        importPath: manifest.rootLayoutMode === 'HORIZONTAL'
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
function buildStitchingContext(merged, manifest, sectionsDir, mergedRecipePath) {
    const sorted = spatialSort(manifest.sections);
    const rootOrigin = manifest.rootBoundingBox;
    const sections = sorted.map((section, idx) => {
        const recipePath = path.join(sectionsDir, `${section.nodeId}.recipe.json`);
        // Extract component summary from the section's recipe if it exists
        const componentSet = new Set();
        if (fs.existsSync(recipePath)) {
            try {
                const sectionRecipe = JSON.parse(fs.readFileSync(recipePath, 'utf-8'));
                collectComponents(sectionRecipe.root, componentSet);
            }
            catch {
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
    const totalBoundingBox = unionBoundingBox(manifest.sections.map((s) => s.boundingBox));
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
function countNodes(node) {
    return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0);
}
function countNodesByStatus(node, status) {
    const self = node.mappingStatus === status ? 1 : 0;
    return (self +
        node.children.reduce((acc, c) => acc + countNodesByStatus(c, status), 0));
}
//# sourceMappingURL=recipe-merger.js.map