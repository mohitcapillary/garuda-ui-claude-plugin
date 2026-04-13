"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNodeWithVision = resolveNodeWithVision;
exports.enhanceRecipeWithVision = enhanceRecipeWithVision;
exports.buildNodeMap = buildNodeMap;
exports.clearFingerprintCache = clearFingerprintCache;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const crop_1 = require("./utils/crop");
const fingerprint_1 = require("./utils/fingerprint");
// In-memory fingerprint cache — persists across nodes within a single CLI run.
// Prevents duplicate API calls for structurally identical nodes.
const fingerprintCache = new Map();
/**
 * Resolve a single UNMAPPED node using Claude vision API.
 *
 * Strategy:
 * 1. Fingerprint the node structure — check cache first (free)
 * 2. Crop the exact node region from the full screenshot
 * 3. Send cropped image + node context to Claude
 * 4. Parse response → match against registry for importPath
 *
 * Returns null if vision cannot resolve (no bounding box, sharp missing,
 * API error, or no registry match for the inferred component).
 */
async function resolveNodeWithVision(node, screenshotPath, registry) {
    var _a, _b, _c;
    if (!node.absoluteBoundingBox)
        return null;
    const fingerprint = (0, fingerprint_1.fingerprintNode)(node);
    // Cache hit — same structure seen before
    if (fingerprintCache.has(fingerprint)) {
        const cached = fingerprintCache.get(fingerprint);
        if (cached)
            console.log(`  [vision] Cache hit for "${node.name}" → ${cached.targetComponent}`);
        return cached;
    }
    // Crop the exact node region
    const cropped = await (0, crop_1.cropNode)(screenshotPath, node.absoluteBoundingBox);
    if (!cropped) {
        fingerprintCache.set(fingerprint, null);
        return null;
    }
    // Build a de-duplicated component list from registry
    const componentList = [...new Set(registry.components.map((e) => e.targetComponent))].sort();
    console.log(`  [vision] Calling Claude for "${node.name}" (${node.type}) — ${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}px`);
    try {
        const client = new sdk_1.default();
        const response = await client.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 200,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/png',
                                data: cropped.toString('base64'),
                            },
                        },
                        {
                            type: 'text',
                            text: `This is a cropped screenshot of a single UI element from a Figma design.

Figma node context:
- Name: "${node.name}"
- Type: ${node.type}
- Dimensions: ${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}px
- Layout: ${(_a = node.layoutMode) !== null && _a !== void 0 ? _a : 'absolute'}
- Children: ${((_b = node.children) === null || _b === void 0 ? void 0 : _b.map((c) => `${c.name} (${c.type})`).join(', ')) || 'none'}

Available design system components:
${componentList.join(', ')}

Which single component from the list above best matches this UI element?
Reply with JSON only — no explanation:
{ "component": "ComponentName", "confidence": "HIGH" | "MEDIUM" | "LOW" }
If no component matches, reply: { "component": null, "confidence": "LOW" }`,
                        },
                    ],
                },
            ],
        });
        const text = response.content[0].text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            fingerprintCache.set(fingerprint, null);
            return null;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.component) {
            fingerprintCache.set(fingerprint, null);
            return null;
        }
        // Verify the component actually exists in the registry
        const entry = registry.components.find((e) => e.targetComponent === parsed.component);
        if (!entry) {
            console.warn(`  [vision] Claude returned "${parsed.component}" but it's not in the registry`);
            fingerprintCache.set(fingerprint, null);
            return null;
        }
        const resolution = {
            targetComponent: entry.targetComponent,
            importPath: entry.importPath,
            confidence: (_c = parsed.confidence) !== null && _c !== void 0 ? _c : 'MEDIUM',
            fingerprint,
        };
        console.log(`  [vision] Resolved "${node.name}" → ${resolution.targetComponent} (${resolution.confidence})`);
        fingerprintCache.set(fingerprint, resolution);
        return resolution;
    }
    catch (err) {
        console.warn(`  [vision] API error for "${node.name}": ${err}`);
        fingerprintCache.set(fingerprint, null);
        return null;
    }
}
/**
 * Walk the full recipe tree and enhance all UNMAPPED nodes using vision.
 * Mutates the recipe in-place. Returns count of nodes resolved.
 */
async function enhanceRecipeWithVision(root, screenshotPath, registry, originalNodes) {
    let resolved = 0;
    async function walk(node) {
        if (node.mappingStatus === 'UNMAPPED') {
            const figmaNode = originalNodes.get(node.figmaNodeId);
            if (figmaNode) {
                const resolution = await resolveNodeWithVision(figmaNode, screenshotPath, registry);
                if (resolution) {
                    node.mappingStatus = 'EXACT';
                    node.targetComponent = resolution.targetComponent;
                    node.importPath = resolution.importPath;
                    node.source = 'vision-inferred';
                    node.fingerprint = resolution.fingerprint;
                    node.fallback = null;
                    resolved++;
                }
            }
        }
        for (const child of node.children) {
            await walk(child);
        }
    }
    await walk(root);
    return resolved;
}
/** Collect all FigmaNodes into a flat map by ID for quick lookup */
function buildNodeMap(root) {
    const map = new Map();
    function walk(node) {
        var _a;
        map.set(node.id, node);
        for (const child of (_a = node.children) !== null && _a !== void 0 ? _a : []) {
            walk(child);
        }
    }
    walk(root);
    return map;
}
/** Clear the in-memory fingerprint cache (used between CLI runs in tests) */
function clearFingerprintCache() {
    fingerprintCache.clear();
}
//# sourceMappingURL=vision-resolver.js.map