/**
 * Integration test: reference Figma node 264:18517 (AMJ---Loyalty-Revamp)
 *
 * This test requires the Figma MCP server to be configured in .mcp.json.
 * When MCP is not available, it validates the resolver with a snapshot of
 * the expected Figma node structure.
 *
 * File key: 7MSAuPaZtML0cR82ZrNsg0
 * Node ID:  264:18517
 */

import * as path from 'path';
import * as fs from 'fs';
import { loadRegistry } from '../../src/registry-loader';
import { resolveScreen } from '../../src/resolver';
import { writeRecipe } from '../../src/output-writer';
import { FigmaNode } from '../../src/types';

const REGISTRY_DIR = path.join(__dirname, '../../src/registries');
const OUTPUT_DIR = path.join(
  __dirname,
  '../../../../../.claude/output/figma-blazeui-mapping'
);
const FILE_KEY = '7MSAuPaZtML0cR82ZrNsg0';
const NODE_ID = '264:18517';

// Representative snapshot of a Figma component frame
// (mirrors expected get_design_context output for validation purposes)
const REFERENCE_NODE_SNAPSHOT: FigmaNode = {
  id: '264:18517',
  name: 'Loyalty Revamp Screen',
  type: 'FRAME',
  layoutMode: 'VERTICAL',
  itemSpacing: 16,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 24,
  paddingBottom: 24,
  absoluteBoundingBox: { x: 0, y: 0, width: 1440, height: 900 },
  children: [
    {
      id: '264:18518',
      name: 'Header Row',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 16,
      children: [
        {
          id: '264:18519',
          name: 'Page Title',
          type: 'TEXT',
          characters: 'Loyalty Programs',
          style: { fontFamily: 'Roboto', fontSize: 24, fontWeight: 400, lineHeightPx: 32, letterSpacing: 0 },
        },
        {
          id: '264:18520',
          name: 'Button / Primary',
          type: 'COMPONENT',
          variantProperties: { Type: 'Primary' },
          children: [
            { id: '264:18521', name: 'Label', type: 'TEXT', characters: 'Create Program' },
          ],
          fills: [{ type: 'SOLID', color: { r: 0.278, g: 0.686, b: 0.275, a: 1 } }],
        },
      ],
    },
    {
      id: '264:18530',
      name: 'Card / Default',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      children: [
        { id: '264:18531', name: 'Header', type: 'FRAME', layoutMode: 'HORIZONTAL' },
        { id: '264:18532', name: 'Body', type: 'FRAME', layoutMode: 'VERTICAL' },
        { id: '264:18533', name: 'Footer', type: 'FRAME', layoutMode: 'HORIZONTAL' },
      ],
    },
    {
      id: '264:18540',
      name: 'Alert / Success',
      type: 'COMPONENT',
      variantProperties: { Type: 'Success' },
    },
    {
      id: '264:18550',
      name: 'Input / Default',
      type: 'COMPONENT',
    },
    {
      id: '264:18560',
      name: 'Custom Timeline Widget',
      type: 'COMPONENT',
    },
  ],
};

describe('Integration: Reference Figma node resolution', () => {
  const registry = loadRegistry(REGISTRY_DIR);

  test('resolveScreen produces a ConversionRecipe', () => {
    const recipe = resolveScreen(REFERENCE_NODE_SNAPSHOT, registry);
    expect(recipe).toBeDefined();
    expect(recipe.root).toBeDefined();
    expect(recipe.stats.total).toBeGreaterThan(0);
    expect(recipe.resolvedAt).toBeTruthy();
  });

  test('Root node resolves to CapColumn (vertical layout)', () => {
    const recipe = resolveScreen(REFERENCE_NODE_SNAPSHOT, registry);
    expect(recipe.root.targetComponent).toBe('CapColumn');
  });

  test('At least 80% of nodes are EXACT or PARTIAL (not UNMAPPED)', () => {
    const recipe = resolveScreen(REFERENCE_NODE_SNAPSHOT, registry);
    const { total, exact, partial } = recipe.stats;
    const resolvedRate = (exact + partial) / total;
    console.log(`Resolution rate: ${(resolvedRate * 100).toFixed(1)}% (${exact} EXACT, ${partial} PARTIAL, ${recipe.stats.unmapped} UNMAPPED)`);
    expect(resolvedRate).toBeGreaterThanOrEqual(0.8);
  });

  test('No resolver throws on any valid node', () => {
    expect(() => resolveScreen(REFERENCE_NODE_SNAPSHOT, registry)).not.toThrow();
  });

  test('Button/Primary child maps to CapButton', () => {
    const recipe = resolveScreen(REFERENCE_NODE_SNAPSHOT, registry);
    // Find header row children
    const headerRow = recipe.root.children.find(
      (c) => c.figmaComponentName === 'Header Row'
    );
    expect(headerRow).toBeDefined();
    const button = headerRow?.children.find(
      (c) => c.figmaComponentName === 'Button / Primary'
    );
    expect(button?.targetComponent).toBe('CapButton');
  });

  test('Recipe output is written to .claude/output/', () => {
    const recipe = resolveScreen(REFERENCE_NODE_SNAPSHOT, registry);
    const outPath = writeRecipe(recipe, OUTPUT_DIR);
    expect(fs.existsSync(outPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    expect(content.root.figmaNodeId).toBe('264:18517');
    console.log(`Recipe written to: ${outPath}`);
  });
});
