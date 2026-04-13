import * as path from 'path';
import * as fs from 'fs';
import { loadRegistry, extendRegistry, validateRegistry } from '../../src/registry-loader';
import { resolveNode } from '../../src/resolver';
import { FigmaNode } from '../../src/types';

const REGISTRY_DIR = path.join(__dirname, '../../src/registries');
const VARIABLES_SCSS = path.join(
  __dirname,
  '../../../../components/styled/variables.scss'
);

describe('Registry integrity', () => {
  const registry = loadRegistry(REGISTRY_DIR);

  test('Registry passes schema validation', () => {
    const result = validateRegistry(registry);
    expect(result.valid).toBe(true);
    if (!result.valid) {
      console.error('Validation errors:', result.errors);
    }
  });

  test('figmaIdentifier values are unique', () => {
    const ids = registry.components.map((e) => e.figmaIdentifier);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('All component importPaths reference a known blaze-ui component', () => {
    const componentsDir = path.join(__dirname, '../../../../components');
    if (!fs.existsSync(componentsDir)) {
      console.warn('Skipping importPath check — components dir not found');
      return;
    }
    for (const entry of registry.components) {
      const componentName = entry.importPath.split('/').pop();
      if (!componentName) continue;
      const componentDir = path.join(componentsDir, componentName);
      // Allow slight mismatch for sub-components (CapInput.Search, etc.)
      const baseName = componentName.split('.')[0];
      const baseDir = path.join(componentsDir, baseName);
      expect(
        fs.existsSync(componentDir) || fs.existsSync(baseDir)
      ).toBe(true);
    }
  });

  test('All blazeCSSVar values exist in variables.scss', () => {
    if (!fs.existsSync(VARIABLES_SCSS)) {
      console.warn('Skipping CSS var check — variables.scss not found');
      return;
    }
    const scss = fs.readFileSync(VARIABLES_SCSS, 'utf-8');
    for (const token of registry.tokens) {
      const varName = token.blazeCSSVar.replace('$', '');
      expect(scss).toContain(varName);
    }
  });

  test('Mock CapTimeline entry resolves without code changes', () => {
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
      id: 'test:1',
      name: 'Timeline / Default',
      type: 'COMPONENT',
    };

    const recipe = resolveNode(node, extended);
    expect(recipe.targetComponent).toBe('CapTimeline');
    expect(recipe.mappingStatus).toBe('EXACT');
  });
});
