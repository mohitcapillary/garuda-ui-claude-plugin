import * as fs from 'fs';
import * as path from 'path';

import { ConversionRecipe, FigmaNode, RecipeNode } from './types';

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
export function writeLearnedMappings(
  recipe: ConversionRecipe,
  originalNodes: Map<string, FigmaNode>,
  registryPath: string = DEFAULT_REGISTRY_PATH
): number {
  const raw = fs.readFileSync(registryPath, 'utf-8');
  const file = JSON.parse(raw) as {
    version: string;
    entries: Array<Record<string, unknown>>;
  };

  let written = 0;
  collectVisionNodes(recipe.root).forEach((node) => {
    const figmaNode = originalNodes.get(node.figmaNodeId);
    if (!node.fingerprint || !node.targetComponent || !node.importPath || !figmaNode) return;

    const autoId = `auto:${node.fingerprint}`;
    const existingIdx = file.entries.findIndex((e) => e['figmaIdentifier'] === autoId);

    if (existingIdx >= 0) {
      const existing = file.entries[existingIdx];
      existing['usageCount'] = ((existing['usageCount'] as number) ?? 1) + 1;
      existing['lastSeen'] = new Date().toISOString().split('T')[0];
    } else {
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

function collectVisionNodes(root: RecipeNode): RecipeNode[] {
  const result: RecipeNode[] = [];

  function walk(node: RecipeNode): void {
    if (node.source === 'vision-inferred') result.push(node);
    for (const child of node.children) walk(child);
  }

  walk(root);
  return result;
}
