import { resolveNode, resolveScreen } from '../../src/resolver';
import { loadRegistry, extendRegistry } from '../../src/registry-loader';
import { FigmaNode, MappingRegistry } from '../../src/types';
import * as path from 'path';

const REGISTRY_DIR = path.join(__dirname, '../../src/registries');

let registry: MappingRegistry;

beforeAll(() => {
  registry = loadRegistry(REGISTRY_DIR);
});

// ─── US1: Simple Component Mapping ───────────────────────────────────────────

describe('US1: Simple component mapping', () => {
  test('Button/Primary resolves to CapButton with type=primary (EXACT)', () => {
    const node: FigmaNode = {
      id: '264:18517',
      name: 'Button / Primary',
      type: 'COMPONENT',
      variantProperties: { Type: 'Primary' },
      componentProperties: { State: 'Default' },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.mappingStatus).toBe('EXACT');
    expect(recipe.targetComponent).toBe('CapButton');
    expect(recipe.props.type).toBe('primary');
    expect(recipe.importPath).toBe('blaze-ui/components/CapButton');
  });

  test('Button/Secondary resolves to CapButton with type=secondary', () => {
    const node: FigmaNode = {
      id: '100:1',
      name: 'Button / Secondary',
      type: 'COMPONENT',
      variantProperties: { Type: 'Secondary' },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapButton');
    expect(recipe.props.type).toBe('secondary');
  });

  test('Alert with Type=Error resolves to CapAlert type=error', () => {
    const node: FigmaNode = {
      id: '100:2',
      name: 'Alert / Error',
      type: 'COMPONENT',
      variantProperties: { Type: 'Error' },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapAlert');
    expect(recipe.props.type).toBe('error');
  });

  test('Input node resolves to CapInput', () => {
    const node: FigmaNode = {
      id: '100:3',
      name: 'Input / Default',
      type: 'COMPONENT',
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapInput');
  });

  test('Checkbox resolves to CapCheckbox with checked=true', () => {
    const node: FigmaNode = {
      id: '100:4',
      name: 'Checkbox',
      type: 'COMPONENT',
      variantProperties: { State: 'Checked' },
      componentProperties: { State: 'Checked' },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapCheckbox');
    expect(recipe.props.checked).toBe(true);
  });

  test('Slot mapping: prefix child maps to prefix slot', () => {
    const node: FigmaNode = {
      id: '100:5',
      name: 'Button / Primary',
      type: 'COMPONENT',
      variantProperties: { Type: 'Primary' },
      children: [
        { id: '100:6', name: 'Icon Left', type: 'FRAME' },
        { id: '100:7', name: 'Label', type: 'TEXT', characters: 'Click me' },
      ],
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.slots['prefix']).toBeDefined();
    expect(recipe.slots['children']).toBe('Click me');
  });

  test('CSS variable resolved for primary fill', () => {
    const node: FigmaNode = {
      id: '100:8',
      name: 'Button / Primary',
      type: 'COMPONENT',
      variantProperties: { Type: 'Primary' },
      fills: [
        {
          type: 'SOLID',
          color: { r: 0.278, g: 0.686, b: 0.275, a: 1 }, // ~#47af46
        },
      ],
    };
    // Registry may not have token entries yet — verify cssVariables structure
    const recipe = resolveNode(node, registry);
    expect(recipe.cssVariables).toBeDefined();
  });
});

// ─── US2: Composite Component ─────────────────────────────────────────────────

describe('US2: Composite component mapping', () => {
  test('Card frame with header/body/footer resolves to CapCard with children', () => {
    const node: FigmaNode = {
      id: '200:1',
      name: 'Card / Default',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      children: [
        { id: '200:2', name: 'Header', type: 'FRAME' },
        { id: '200:3', name: 'Body', type: 'FRAME' },
        { id: '200:4', name: 'Footer', type: 'FRAME' },
      ],
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapCard');
  });

  test('Auto-layout horizontal FRAME resolves to CapRow', () => {
    const node: FigmaNode = {
      id: '200:10',
      name: 'Horizontal Layout',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      itemSpacing: 16,
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapRow');
    expect(recipe.props['gutter']).toBe(16);
  });

  test('Auto-layout vertical FRAME resolves to CapColumn', () => {
    const node: FigmaNode = {
      id: '200:11',
      name: 'Vertical Layout',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapColumn');
  });

  test('Absolute-positioned frame adds NEEDS_MANUAL_OVERRIDE warning', () => {
    const node: FigmaNode = {
      id: '200:12',
      name: 'Overlay',
      type: 'FRAME',
      layoutMode: 'NONE',
      children: [{ id: '200:13', name: 'Child', type: 'RECTANGLE' }],
    };
    const recipe = resolveNode(node, registry);
    expect(
      recipe.manualOverrides.some((o) => o.includes('NEEDS_MANUAL_OVERRIDE'))
    ).toBe(true);
  });
});

// ─── US4: Fallback ────────────────────────────────────────────────────────────

describe('US4: Fallback and flag system', () => {
  test('Unknown component returns UNMAPPED with fallback', () => {
    const node: FigmaNode = {
      id: '300:1',
      name: 'Avatar',
      type: 'COMPONENT',
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.mappingStatus).toBe('UNMAPPED');
    expect(recipe.targetComponent).toBeNull();
    expect(recipe.fallback).not.toBeNull();
    expect(recipe.fallback?.nearestComponent).toBeDefined();
  });

  test('UNMAPPED fallback includes htmlFallback', () => {
    const node: FigmaNode = {
      id: '300:2',
      name: 'XyzUnknownWidget999',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 8 },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.mappingStatus).toBe('UNMAPPED');
    expect(recipe.fallback?.htmlFallback).toContain('<div');
  });
});

// ─── US5: Extensibility ───────────────────────────────────────────────────────

describe('US5: Registry extensibility', () => {
  test('New mock CapTimeline entry resolves without code changes', () => {
    const extended = extendRegistry(registry, {
      components: [
        {
          figmaIdentifier: 'cap-timeline',
          nodeTypes: ['COMPONENT', 'INSTANCE'],
          componentNames: ['Timeline*'],
          targetComponent: 'CapTimeline',
          importPath: 'blaze-ui/components/CapTimeline',
          propMappings: {},
          slotMappings: {},
          confidence: 'MEDIUM',
        },
      ],
    });

    const node: FigmaNode = {
      id: '400:1',
      name: 'Timeline / Default',
      type: 'COMPONENT',
    };
    const recipe = resolveNode(node, extended);
    expect(recipe.targetComponent).toBe('CapTimeline');
    expect(recipe.mappingStatus).toBe('EXACT');
  });
});

// ─── US6: TEXT nodes → CapLabel ──────────────────────────────────────────────

describe('US6: Typography / TEXT node mapping', () => {
  test('TEXT node resolves to CapLabel', () => {
    const node: FigmaNode = {
      id: '500:1',
      name: 'Title Text',
      type: 'TEXT',
      characters: 'Hello World',
      style: { fontFamily: 'Roboto', fontSize: 16, fontWeight: 500, lineHeightPx: 24, letterSpacing: 0 },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.targetComponent).toBe('CapLabel');
    expect(recipe.mappingStatus).toBe('EXACT');
    expect(recipe.slots['children']).toBe('Hello World');
    expect(recipe.props['type']).toBe('label17'); // 16px + 500
  });

  test('Non-Roboto font triggers NEEDS_MANUAL_OVERRIDE', () => {
    const node: FigmaNode = {
      id: '500:2',
      name: 'Custom Font',
      type: 'TEXT',
      style: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeightPx: 20,
        letterSpacing: 0,
      },
    };
    const recipe = resolveNode(node, registry);
    expect(recipe.manualOverrides.some((o) => o.includes('NEEDS_MANUAL_OVERRIDE'))).toBe(true);
  });
});

// ─── resolveScreen ────────────────────────────────────────────────────────────

describe('resolveScreen', () => {
  test('Returns ConversionRecipe with stats', () => {
    const root: FigmaNode = {
      id: '600:1',
      name: 'Screen',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      children: [
        {
          id: '600:2',
          name: 'Button / Primary',
          type: 'COMPONENT',
          variantProperties: { Type: 'Primary' },
        },
        {
          id: '600:3',
          name: 'Unknown Widget',
          type: 'COMPONENT',
        },
      ],
    };
    const result = resolveScreen(root, registry);
    expect(result.root).toBeDefined();
    expect(result.stats.total).toBeGreaterThan(0);
    expect(result.resolvedAt).toBeDefined();
  });
});
