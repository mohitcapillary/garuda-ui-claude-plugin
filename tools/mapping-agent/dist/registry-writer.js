"use strict";
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
exports.writeLearnedMappings = writeLearnedMappings;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_REGISTRY_PATH = path.join(__dirname, 'registries', 'component-mappings.json');
/**
 * Writes vision-inferred component mappings back to component-mappings.json.
 *
 * For each node where source === 'vision-inferred':
 * - If the fingerprint already exists in the registry → increment usageCount
 * - If it's new → add a new entry with source: "llm-inferred"
 *
 * These auto-entries have the fingerprint as figmaIdentifier (prefixed "auto:")
 * and the node's actual name as the componentName pattern. Over time, as the
 * same patterns are seen across multiple screens, usageCount grows and the
 * registry becomes a learned knowledge base of your specific Figma file.
 */
function writeLearnedMappings(recipe, originalNodes, registryPath = DEFAULT_REGISTRY_PATH) {
    const raw = fs.readFileSync(registryPath, 'utf-8');
    const file = JSON.parse(raw);
    let written = 0;
    collectVisionNodes(recipe.root).forEach((node) => {
        var _a;
        const figmaNode = originalNodes.get(node.figmaNodeId);
        if (!node.fingerprint || !node.targetComponent || !node.importPath || !figmaNode)
            return;
        const autoId = `auto:${node.fingerprint}`;
        const existingIdx = file.entries.findIndex((e) => e['figmaIdentifier'] === autoId);
        if (existingIdx >= 0) {
            const existing = file.entries[existingIdx];
            existing['usageCount'] = ((_a = existing['usageCount']) !== null && _a !== void 0 ? _a : 1) + 1;
            existing['lastSeen'] = new Date().toISOString().split('T')[0];
        }
        else {
            file.entries.push({
                figmaIdentifier: autoId,
                nodeTypes: [figmaNode.type],
                componentNames: [figmaNode.name, `${figmaNode.name}*`],
                variantPatterns: {},
                targetComponent: node.targetComponent,
                importPath: node.importPath,
                defaultProps: {},
                propMappings: {},
                slotMappings: {},
                fallback: null,
                confidence: 'MEDIUM',
                source: 'llm-inferred',
                inferredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString().split('T')[0],
                usageCount: 1,
            });
            written++;
        }
    });
    fs.writeFileSync(registryPath, JSON.stringify(file, null, 2), 'utf-8');
    return written;
}
function collectVisionNodes(root) {
    const result = [];
    function walk(node) {
        if (node.source === 'vision-inferred')
            result.push(node);
        for (const child of node.children)
            walk(child);
    }
    walk(root);
    return result;
}
//# sourceMappingURL=registry-writer.js.map