import * as path from 'path';
import {
  loadRegistry,
  extendRegistry,
  validateRegistry,
} from '../../src/registry-loader';
import { MappingRegistry } from '../../src/types';

const REGISTRY_DIR = path.join(__dirname, '../../src/registries');

describe('loadRegistry', () => {
  test('Loads both JSON files without error', () => {
    const registry = loadRegistry(REGISTRY_DIR);
    expect(registry.version).toBe('1.0.0');
    expect(Array.isArray(registry.components)).toBe(true);
    expect(Array.isArray(registry.tokens)).toBe(true);
  });

  test('Components have required fields', () => {
    const registry = loadRegistry(REGISTRY_DIR);
    for (const entry of registry.components) {
      expect(entry.figmaIdentifier).toBeTruthy();
      expect(entry.targetComponent).toBeTruthy();
      expect(entry.importPath).toBeTruthy();
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(entry.confidence);
    }
  });

  test('Tokens have required fields', () => {
    const registry = loadRegistry(REGISTRY_DIR);
    for (const token of registry.tokens) {
      expect(token.figmaVariable).toBeTruthy();
      expect(token.blazeCSSVar).toBeTruthy();
      expect(token.tokenType).toBeTruthy();
    }
  });

  test('Throws MappingError for invalid path', () => {
    expect(() => loadRegistry('/nonexistent/path')).toThrow();
  });
});

describe('extendRegistry', () => {
  let base: MappingRegistry;

  beforeAll(() => {
    base = loadRegistry(REGISTRY_DIR);
  });

  test('New entry is appended (does not mutate base)', () => {
    const originalCount = base.components.length;
    const extended = extendRegistry(base, {
      components: [
        {
          figmaIdentifier: 'cap-test-only-widget',
          nodeTypes: ['COMPONENT'],
          componentNames: ['TestOnlyWidget*'],
          targetComponent: 'CapTestOnlyWidget',
          importPath: 'blaze-ui/components/CapTestOnlyWidget',
          propMappings: {},
          slotMappings: {},
          confidence: 'MEDIUM',
        },
      ],
    });
    expect(extended.components.length).toBe(originalCount + 1);
    expect(base.components.length).toBe(originalCount); // base unmutated
  });

  test('Matching figmaIdentifier is overwritten', () => {
    const extended = extendRegistry(base, {
      components: [
        {
          figmaIdentifier: 'cap-button-primary',
          nodeTypes: ['COMPONENT'],
          componentNames: ['OverriddenButton*'],
          targetComponent: 'CapButtonV2',
          importPath: 'blaze-ui/components/CapButtonV2',
          propMappings: {},
          slotMappings: {},
          confidence: 'HIGH',
        },
      ],
    });
    const overridden = extended.components.find(
      (e) => e.figmaIdentifier === 'cap-button-primary'
    );
    expect(overridden?.targetComponent).toBe('CapButtonV2');
  });

  test('Token entries can be extended', () => {
    const originalCount = base.tokens.length;
    const extended = extendRegistry(base, {
      tokens: [
        {
          figmaVariable: 'custom/my-color',
          figmaValuePattern: '#aabbcc',
          blazeCSSVar: '$my-custom-color',
          tokenType: 'COLOR',
        },
      ],
    });
    expect(extended.tokens.length).toBe(originalCount + 1);
  });
});

describe('validateRegistry', () => {
  test('Loaded registry passes validation', () => {
    const registry = loadRegistry(REGISTRY_DIR);
    const result = validateRegistry(registry);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('Detects duplicate figmaIdentifier', () => {
    const registry = loadRegistry(REGISTRY_DIR);
    const duplicate = { ...registry.components[0] };
    const invalidRegistry: MappingRegistry = {
      ...registry,
      components: [...registry.components, duplicate],
    };
    const result = validateRegistry(invalidRegistry);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  test('Detects missing targetComponent', () => {
    const invalidRegistry: MappingRegistry = {
      version: '1.0.0',
      components: [
        {
          figmaIdentifier: 'bad-entry',
          nodeTypes: ['COMPONENT'],
          componentNames: ['Bad*'],
          targetComponent: '',
          importPath: 'blaze-ui/components/Bad',
          propMappings: {},
          slotMappings: {},
          confidence: 'LOW',
        },
      ],
      tokens: [],
    };
    const result = validateRegistry(invalidRegistry);
    expect(result.valid).toBe(false);
  });
});
