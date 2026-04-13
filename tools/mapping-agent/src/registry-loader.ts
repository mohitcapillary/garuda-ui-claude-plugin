import * as fs from 'fs';
import * as path from 'path';

import { MappingError } from './errors';
import {
  ComponentMapping,
  MappingRegistry,
  TokenMapping,
  ValidationResult,
} from './types';

const DEFAULT_REGISTRY_DIR = path.join(__dirname, 'registries');

interface ComponentMappingsFile {
  version: string;
  entries: ComponentMapping[];
}

interface TokenMappingsFile {
  version: string;
  entries: TokenMapping[];
}

export function loadRegistry(registryDir?: string): MappingRegistry {
  const dir = registryDir ?? DEFAULT_REGISTRY_DIR;

  const componentPath = path.join(dir, 'component-mappings.json');
  const tokenPath = path.join(dir, 'token-mappings.json');

  if (!fs.existsSync(componentPath)) {
    throw new MappingError(
      'REGISTRY_INVALID',
      `component-mappings.json not found at: ${componentPath}`
    );
  }
  if (!fs.existsSync(tokenPath)) {
    throw new MappingError(
      'REGISTRY_INVALID',
      `token-mappings.json not found at: ${tokenPath}`
    );
  }

  let compFile: ComponentMappingsFile;
  let tokenFile: TokenMappingsFile;

  try {
    compFile = JSON.parse(fs.readFileSync(componentPath, 'utf-8'));
  } catch (e) {
    throw new MappingError('REGISTRY_INVALID', `Failed to parse component-mappings.json: ${e}`);
  }

  try {
    tokenFile = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  } catch (e) {
    throw new MappingError('REGISTRY_INVALID', `Failed to parse token-mappings.json: ${e}`);
  }

  return {
    version: compFile.version,
    components: compFile.entries ?? [],
    tokens: tokenFile.entries ?? [],
  };
}

export function extendRegistry(
  base: MappingRegistry,
  extension: Partial<MappingRegistry>
): MappingRegistry {
  const extComponents = extension.components ?? [];
  const extTokens = extension.tokens ?? [];

  const mergedComponents = mergeByKey(
    base.components,
    extComponents,
    'figmaIdentifier'
  );
  const mergedTokens = mergeByKey(base.tokens, extTokens, 'figmaVariable');

  return {
    version: extension.version ?? base.version,
    components: mergedComponents,
    tokens: mergedTokens,
  };
}

function mergeByKey<T>(base: T[], extension: T[], key: keyof T): T[] {
  const map = new Map<unknown, T>();
  for (const item of base) {
    map.set(item[key], item);
  }
  for (const item of extension) {
    map.set(item[key], item); // overwrite matching keys
  }
  return Array.from(map.values());
}

export function validateRegistry(registry: MappingRegistry): ValidationResult {
  const errors: string[] = [];
  const identifiers = new Set<string>();

  for (const entry of registry.components) {
    if (!entry.figmaIdentifier) {
      errors.push(`Component entry missing figmaIdentifier`);
      continue;
    }
    if (identifiers.has(entry.figmaIdentifier)) {
      errors.push(`Duplicate figmaIdentifier: ${entry.figmaIdentifier}`);
    }
    identifiers.add(entry.figmaIdentifier);

    if (!entry.targetComponent) {
      errors.push(`${entry.figmaIdentifier}: missing targetComponent`);
    }
    if (!entry.importPath) {
      errors.push(`${entry.figmaIdentifier}: missing importPath`);
    }
    if (!entry.confidence) {
      errors.push(`${entry.figmaIdentifier}: missing confidence level`);
    }
    if (!entry.nodeTypes?.length) {
      errors.push(`${entry.figmaIdentifier}: nodeTypes must not be empty`);
    }
  }

  for (const token of registry.tokens) {
    if (!token.figmaVariable) {
      errors.push(`Token entry missing figmaVariable`);
    }
    if (!token.blazeCSSVar) {
      errors.push(`Token ${token.figmaVariable}: missing blazeCSSVar`);
    }
    if (!token.tokenType) {
      errors.push(`Token ${token.figmaVariable}: missing tokenType`);
    }
  }

  return { valid: errors.length === 0, errors };
}
