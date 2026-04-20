import * as fs from 'fs';
import * as path from 'path';

import { ConversionRecipe, StitchingContext, TokenResolutionMap } from './types';

const DEFAULT_OUTPUT_DIR = path.resolve(
  __dirname,
  '../../../../.claude/output/figma-blazeui-mapping'
);

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write a ConversionRecipe to <outputDir>/<nodeId>.recipe.json.
 * Returns the absolute path of the written file.
 */
export function writeRecipe(
  recipe: ConversionRecipe,
  outputDir?: string
): string {
  const dir = outputDir ?? DEFAULT_OUTPUT_DIR;
  ensureDir(dir);

  const nodeId = recipe.root.figmaNodeId.replace(':', '-');
  const filePath = path.join(dir, `${nodeId}.recipe.json`);
  fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2), 'utf-8');
  return filePath;
}

/**
 * Write a StitchingContext to <outputDir>/<rootNodeId>.stitching-context.json.
 * Returns the absolute path of the written file.
 */
export function writeStitchingContext(
  context: StitchingContext,
  outputDir?: string
): string {
  const dir = outputDir ?? DEFAULT_OUTPUT_DIR;
  ensureDir(dir);

  const filePath = path.join(dir, `${context.rootNodeId}.stitching-context.json`);
  fs.writeFileSync(filePath, JSON.stringify(context, null, 2), 'utf-8');
  return filePath;
}

/**
 * Write a TokenResolutionMap to <outputDir>/token-map.json.
 * Returns the absolute path of the written file.
 */
export function writeTokenMap(
  tokenMap: TokenResolutionMap,
  outputDir?: string
): string {
  const dir = outputDir ?? DEFAULT_OUTPUT_DIR;
  ensureDir(dir);

  const filePath = path.join(dir, 'token-map.json');
  fs.writeFileSync(filePath, JSON.stringify(tokenMap, null, 2), 'utf-8');
  return filePath;
}
