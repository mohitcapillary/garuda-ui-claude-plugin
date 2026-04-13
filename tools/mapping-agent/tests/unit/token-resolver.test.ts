import { resolveToken, resolveAllTokens } from '../../src/token-resolver';
import { loadRegistry } from '../../src/registry-loader';
import { FigmaVariable, FigmaVariableDefs, MappingRegistry } from '../../src/types';
import * as path from 'path';

const REGISTRY_DIR = path.join(__dirname, '../../src/registries');
let registry: MappingRegistry;

beforeAll(() => {
  registry = loadRegistry(REGISTRY_DIR);
});

describe('resolveToken — color', () => {
  test('Resolves by figmaVariable name match', () => {
    const variable: FigmaVariable = {
      id: 'v1',
      name: 'primary/base',
      resolvedType: 'COLOR',
      valuesByMode: { '1:0': { r: 0.278, g: 0.686, b: 0.275, a: 1 } },
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$cap-primary-base');
  });

  test('Resolves by hex value when name does not match', () => {
    const variable: FigmaVariable = {
      id: 'v2',
      name: 'unknown-color-name',
      resolvedType: 'COLOR',
      valuesByMode: { '1:0': { r: 0.278, g: 0.686, b: 0.275, a: 1 } }, // #47af46
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$cap-primary-base');
  });

  test('Resolves secondary color by hex', () => {
    const variable: FigmaVariable = {
      id: 'v3',
      name: 'some/secondary',
      resolvedType: 'COLOR',
      valuesByMode: { '1:0': { r: 0.141, g: 0.4, b: 0.918, a: 1 } }, // ~#2466ea
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBeTruthy(); // should find $cap-secondary-base or closest
  });

  test('Returns null for completely unknown color', () => {
    const variable: FigmaVariable = {
      id: 'v4',
      name: 'mystery/color',
      resolvedType: 'COLOR',
      valuesByMode: {},
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBeNull();
  });
});

describe('resolveToken — spacing (FLOAT)', () => {
  test('Resolves spacing by numeric value', () => {
    const variable: FigmaVariable = {
      id: 'v5',
      name: 'spacing/space-16',
      resolvedType: 'FLOAT',
      valuesByMode: { '1:0': 16 },
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$cap-space-16');
  });

  test('Resolves spacing by name', () => {
    const variable: FigmaVariable = {
      id: 'v6',
      name: 'spacing/space-08',
      resolvedType: 'FLOAT',
      valuesByMode: { '1:0': 8 },
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$cap-space-08');
  });
});

describe('resolveToken — typography (FLOAT/STRING)', () => {
  test('Resolves font-size token by name', () => {
    const variable: FigmaVariable = {
      id: 'v7',
      name: 'typography/font-size-l',
      resolvedType: 'FLOAT',
      valuesByMode: { '1:0': 16 },
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$font-size-l');
  });

  test('Resolves font-weight token', () => {
    const variable: FigmaVariable = {
      id: 'v8',
      name: 'typography/font-weight-medium',
      resolvedType: 'FLOAT',
      valuesByMode: { '1:0': 500 },
    };
    const result = resolveToken(variable, registry.tokens);
    expect(result).toBe('$font-weight-medium');
  });
});

describe('resolveAllTokens', () => {
  test('Returns TokenResolutionMap with mixed RESOLVED/UNRESOLVED', () => {
    const defs: FigmaVariableDefs = {
      collections: [
        {
          id: 'c1',
          name: 'Colors',
          modes: [{ modeId: '1:0', name: 'Default' }],
          variables: [
            {
              id: 'v1',
              name: 'primary/base',
              resolvedType: 'COLOR',
              valuesByMode: { '1:0': { r: 0.278, g: 0.686, b: 0.275, a: 1 } },
            },
            {
              id: 'v2',
              name: 'unknown/mystery',
              resolvedType: 'COLOR',
              valuesByMode: {},
            },
          ],
        },
      ],
    };
    const result = resolveAllTokens(defs, registry.tokens, 'test-file-key');
    expect(result.figmaFileKey).toBe('test-file-key');
    expect(result.tokens).toHaveLength(2);
    const resolved = result.tokens.filter((t) => t.status === 'RESOLVED');
    const unresolved = result.tokens.filter((t) => t.status === 'UNRESOLVED');
    expect(resolved.length).toBeGreaterThanOrEqual(1);
    expect(unresolved.length).toBeGreaterThanOrEqual(1);
  });
});
