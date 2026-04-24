#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';

import { loadRegistry, validateRegistry } from './registry-loader';
import { resolveScreen } from './resolver';
import { resolveAllTokens } from './token-resolver';
import { writeRecipe, writeStitchingContext, writeTokenMap } from './output-writer';
import { parseMetadataRoot } from './utils/metadata-parser';
import { parseManifest, needsChunking } from './utils/manifest-parser';
import { extractJSXNodes, enrichFigmaTree } from './utils/jsx-parser';
import { enhanceRecipeWithVision, buildNodeMap } from './vision-resolver';
import { writeLearnedMappings } from './registry-writer';
import { generatePropSpec } from './prop-spec-generator';
import { mergeRecipes, buildStitchingContext } from './recipe-merger';
import { ConversionRecipe, ScreenManifestMeta, SectionManifest } from './types';

const program = new Command();

program
  .name('blazemap')
  .description('Figma-to-BlazeUI mapping agent CLI')
  .version('1.0.0');

// ─── resolve command ──────────────────────────────────────────────────────────
program
  .command('resolve')
  .description('Resolve a Figma node to a BlazeUI conversion recipe')
  .requiredOption('--node-id <id>', 'Figma node ID (e.g. 264-18517)')
  .requiredOption('--file-key <key>', 'Figma file key')
  .option('--output <dir>', 'Output directory (default: .claude/output/figma-blazeui-mapping)')
  .option('--registry <dir>', 'Registry directory (default: src/registries)')
  .action(async (opts) => {
    const registry = loadRegistry(opts.registry);
    const nodeId = opts.nodeId.replace('-', ':');

    // Fetch from Figma MCP via process stdin/dynamic import
    // In actual usage the MCP tools are called externally; here we show the pattern
    console.log(`Resolving node ${nodeId} from file ${opts.fileKey}...`);
    console.log('Note: In MCP mode, call get_design_context first, then pipe JSON to this command.');
    console.log(`Registry loaded: ${registry.components.length} components, ${registry.tokens.length} tokens`);
  });

// ─── resolve-tokens command ───────────────────────────────────────────────────
program
  .command('resolve-tokens')
  .description('Resolve all design token variables from a Figma file')
  .requiredOption('--file-key <key>', 'Figma file key')
  .option('--output <dir>', 'Output directory')
  .option('--registry <dir>', 'Registry directory')
  .action(async (opts) => {
    const registry = loadRegistry(opts.registry);
    console.log(`Resolving tokens from file ${opts.fileKey}...`);
    console.log(`Token registry: ${registry.tokens.length} entries`);
  });

// ─── resolve-metadata command (get_metadata XML → recipe) ────────────────────
program
  .command('resolve-metadata')
  .description('Resolve a Figma node from get_metadata XML piped to stdin')
  .option('--output <dir>', 'Output directory')
  .option('--registry <dir>', 'Registry directory')
  .option('--file-key <key>', 'Figma file key — required when using --fetch-screenshot')
  .option('--node-id <id>', 'Figma node ID (dash format, e.g. 3-1050) — required when using --fetch-screenshot')
  .option('--screenshot <path>', 'Path to full-page PNG screenshot for visual resolution of UNMAPPED nodes')
  .option('--fetch-screenshot', 'Auto-download frame screenshot from Figma REST API (requires FIGMA_TOKEN env var; also requires --file-key and --node-id)')
  .option('--design-context <path>', 'Path to file containing get_design_context JSX output — enriches nodes with fills, typography, and spacing before resolution')
  .option('--learn', 'Write vision-inferred mappings back to component-mappings.json for future runs')
  .action(async (opts) => {
    const registry = loadRegistry(opts.registry);
    let inputXml = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) {
      inputXml += chunk;
    }

    // Verify we received XML (not JSON or JSX)
    const trimmed = inputXml.trim();
    if (!trimmed.startsWith('<')) {
      console.error('ERROR: resolve-metadata expects get_metadata XML (starts with <).');
      console.error('       For FigmaNode JSON use resolve-json instead.');
      console.error('       Do NOT pipe get_design_context output here — that returns JSX/code, not XML.');
      process.exit(1);
    }

    const rootNode = parseMetadataRoot(trimmed);

    // Auto-fetch screenshot from Figma REST API when --fetch-screenshot is set
    if (opts.fetchScreenshot) {
      if (!opts.fileKey || !opts.nodeId) {
        console.error('ERROR: --fetch-screenshot requires --file-key and --node-id');
        process.exit(1);
      }
      const { fetchFigmaScreenshot } = await import('./utils/figma-screenshot');
      console.log('[screenshot] Fetching from Figma REST API...');
      opts.screenshot = await fetchFigmaScreenshot(opts.fileKey, opts.nodeId.replace('-', ':'));
      console.log(`[screenshot] Saved to ${opts.screenshot}`);
    }

    // Enrich FigmaNode tree with fills, typography, and spacing from get_design_context JSX
    if (opts.designContext) {
      const { readFileSync } = await import('fs');
      const jsx = readFileSync(opts.designContext, 'utf-8');
      const extractions = extractJSXNodes(jsx);
      enrichFigmaTree(rootNode, extractions);
      console.log(`[enrich] Loaded design context: ${extractions.length} elements extracted from JSX`);
    }

    const recipe = resolveScreen(rootNode, registry);

    // Phase 2: Visual resolution of UNMAPPED nodes via screenshot crop + Claude vision
    if (opts.screenshot && recipe.stats.unmapped > 0) {
      console.log(`\n[vision] ${recipe.stats.unmapped} UNMAPPED nodes — running visual resolver...`);
      const nodeMap = buildNodeMap(rootNode);
      const visuallyResolved = await enhanceRecipeWithVision(recipe.root, opts.screenshot, registry, nodeMap);
      recipe.stats.unmapped -= visuallyResolved;
      recipe.stats.exact += visuallyResolved;
      console.log(`[vision] Resolved ${visuallyResolved} additional nodes visually`);

      // Phase 3: Write learned mappings back to registry for future runs
      if (opts.learn && visuallyResolved > 0) {
        const registryPath = opts.registry
          ? path.join(opts.registry, 'component-mappings.json')
          : undefined;
        const newEntries = writeLearnedMappings(recipe, nodeMap, registryPath);
        console.log(`[learn] Wrote ${newEntries} new entries to component-mappings.json`);
      }
    } else if (opts.screenshot && recipe.stats.unmapped === 0) {
      console.log('[vision] No UNMAPPED nodes — skipping visual resolver');
    }

    const outPath = writeRecipe(recipe, opts.output);
    console.log(`\nRecipe written to: ${outPath}`);
    console.log(
      `Stats: ${recipe.stats.total} nodes — ${recipe.stats.exact} EXACT, ` +
      `${recipe.stats.partial} PARTIAL, ${recipe.stats.unmapped} UNMAPPED`
    );
    // Print the full recipe to stdout so callers can capture it
    console.log('\n--- RECIPE JSON ---');
    console.log(JSON.stringify(recipe, null, 2));
  });

// ─── resolve-json command (pipe mode) ─────────────────────────────────────────
program
  .command('resolve-json')
  .description('Resolve a Figma node from JSON piped to stdin')
  .option('--output <dir>', 'Output directory')
  .option('--registry <dir>', 'Registry directory')
  .action(async (opts) => {
    const registry = loadRegistry(opts.registry);
    let inputJson = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) {
      inputJson += chunk;
    }
    const node = JSON.parse(inputJson);
    const recipe = resolveScreen(node, registry);
    const outPath = writeRecipe(recipe, opts.output);
    console.log(`Recipe written to: ${outPath}`);
    console.log(
      `Stats: ${recipe.stats.total} nodes — ${recipe.stats.exact} EXACT, ` +
      `${recipe.stats.partial} PARTIAL, ${recipe.stats.unmapped} UNMAPPED`
    );
  });

// ─── validate-registry command ────────────────────────────────────────────────
program
  .command('validate-registry')
  .description('Validate the component and token mapping registries')
  .option('--registry <dir>', 'Registry directory (default: src/registries)')
  .action((opts) => {
    const registry = loadRegistry(opts.registry);
    const result = validateRegistry(registry);

    console.log('\nComponent Registry Validation');
    console.log('─'.repeat(50));
    for (const entry of registry.components) {
      const errors = result.errors.filter((e) => e.includes(entry.figmaIdentifier));
      const status = errors.length === 0 ? '✓ PASS' : '✗ FAIL';
      console.log(`${status}  ${entry.figmaIdentifier} → ${entry.targetComponent}`);
      for (const err of errors) console.log(`       ${err}`);
    }

    console.log(`\nToken Registry: ${registry.tokens.length} entries`);
    console.log(`\nOverall: ${result.valid ? '✓ VALID' : '✗ INVALID'}`);
    if (!result.valid) {
      console.error('Errors:');
      result.errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }
  });

// ─── list-components command ──────────────────────────────────────────────────
program
  .command('list-components')
  .description('List all blaze-ui components in the mapping registry')
  .option('--registry <dir>', 'Registry directory')
  .action((opts) => {
    const registry = loadRegistry(opts.registry);
    const grouped: Record<string, number> = {};
    for (const entry of registry.components) {
      grouped[entry.targetComponent] = (grouped[entry.targetComponent] ?? 0) + 1;
    }

    console.log('\nBlazeUI Component Catalog');
    console.log('─'.repeat(50));
    for (const [component, count] of Object.entries(grouped).sort()) {
      console.log(`  ${component.padEnd(28)} ${count} mapping entr${count === 1 ? 'y' : 'ies'}`);
    }
    console.log(`\nTotal: ${Object.keys(grouped).length} components, ${registry.components.length} entries`);
  });

// ─── generate-prop-spec command ──────────────────────────────────────────────
program
  .command('generate-prop-spec')
  .description(
    'Scan a Cap* component library and generate prop-spec.json — ' +
    'detects antd spread pattern, reads antd .d.ts, extracts propTypes',
  )
  .requiredOption(
    '--library-path <path>',
    'Path to the cap-ui-library root in the target garuda-ui repo (e.g. <GARUDA_UI_PATH>/node_modules/@capillarytech/cap-ui-library)',
  )
  .requiredOption(
    '--output <path>',
    'Output path for prop-spec.json (e.g. src/registries/prop-spec.json)',
  )
  .option(
    '--antd-lib-path <path>',
    'Path to antd/lib (auto-detected from libraryPath if omitted)',
  )
  .option(
    '--only <components>',
    'Comma-separated list of component names to process (e.g. CapRow,CapButton)',
  )
  .option('--verbose', 'Print per-component analysis to stdout')
  .action((opts) => {
    const only = opts.only
      ? opts.only.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    generatePropSpec({
      libraryPath: opts.libraryPath,
      outputPath: opts.output,
      antdLibPath: opts.antdLibPath,
      only,
      verbose: opts.verbose ?? true,
    });
  });

// ─── scan-manifest command ────────────────────────────────────────────────────
program
  .command('scan-manifest')
  .description(
    'Shallow-scan a get_metadata XML (stdin) and emit a SectionManifest. ' +
    'Determines whether a screen needs chunked fetching (> 800 nodes or truncated).'
  )
  .option('--output <dir>', 'Directory to write manifest.json into')
  .option('--threshold <n>', 'Node count threshold for chunked mode (default: 800)', '800')
  .action(async (opts) => {
    let inputXml = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) inputXml += chunk;

    const trimmed = inputXml.trim();
    if (!trimmed.startsWith('<')) {
      console.error('ERROR: scan-manifest expects get_metadata XML (starts with <).');
      process.exit(1);
    }

    const manifest: SectionManifest = parseManifest(trimmed);
    const threshold = parseInt(opts.threshold, 10);
    const chunkedModeRequired = needsChunking(manifest, threshold);

    if (opts.output) {
      const { mkdirSync, writeFileSync } = await import('fs');
      mkdirSync(opts.output, { recursive: true });
      const outPath = path.join(opts.output, 'manifest.json');
      writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
      console.log(`Manifest written to: ${outPath}`);
    }

    console.log(`estimatedNodeCount: ${manifest.estimatedNodeCount}`);
    console.log(`isTruncated: ${manifest.isTruncated}`);
    console.log(`sections: ${manifest.sections.length}`);
    console.log(`chunkedModeRequired: ${chunkedModeRequired}`);

    if (chunkedModeRequired) {
      console.log('\nSection IDs (fetch each individually):');
      for (const section of manifest.sections) {
        console.log(
          `  ${section.nodeId}  "${section.name}"  ~${section.estimatedDescendants} nodes`
        );
      }
    }
  });

// ─── merge-recipes command ────────────────────────────────────────────────────
program
  .command('merge-recipes')
  .description(
    'Merge N per-section recipe.json files into one unified ConversionRecipe ' +
    'and write a stitching-context.json for the HLD writer.'
  )
  .requiredOption('--manifest <path>', 'Path to manifest.json produced by scan-manifest')
  .requiredOption('--sections-dir <dir>', 'Directory containing per-section <nodeId>.recipe.json files')
  .requiredOption('--root-node-id <id>', 'Root screen node ID (dash format, e.g. 32-3147)')
  .option('--output <dir>', 'Output directory for merged recipe (default: claudeOutput/figma-capui-mapping/)')
  .action(async (opts) => {
    const { readFileSync, existsSync } = await import('fs');

    // Load manifest
    if (!existsSync(opts.manifest)) {
      console.error(`ERROR: manifest not found: ${opts.manifest}`);
      process.exit(1);
    }
    const rawManifest: SectionManifest = JSON.parse(readFileSync(opts.manifest, 'utf-8'));

    // Build ScreenManifestMeta — add recipeFilePath per section
    const manifestMeta: ScreenManifestMeta = {
      rootNodeId: opts.rootNodeId,
      rootName: rawManifest.rootName,
      rootBoundingBox: rawManifest.rootBoundingBox,
      rootLayoutMode: rawManifest.rootLayoutMode,
      isTruncated: rawManifest.isTruncated,
      sections: rawManifest.sections.map((s) => ({
        ...s,
        recipeFilePath: path.join(opts.sectionsDir, `${s.nodeId}.recipe.json`),
      })),
    };

    // Load all section recipes
    const partials: ConversionRecipe[] = [];
    for (const section of manifestMeta.sections) {
      if (!existsSync(section.recipeFilePath)) {
        console.error(`ERROR: missing section recipe: ${section.recipeFilePath}`);
        process.exit(1);
      }
      partials.push(JSON.parse(readFileSync(section.recipeFilePath, 'utf-8')));
    }

    if (partials.length === 0) {
      console.error('ERROR: no section recipes found to merge.');
      process.exit(1);
    }

    const outputDir = opts.output ?? 'claudeOutput/figma-capui-mapping';

    // Merge recipes
    const merged = mergeRecipes(partials, manifestMeta);

    // Write merged recipe
    const mergedPath = writeRecipe(merged, outputDir);
    console.log(`Merged recipe written to: ${mergedPath}`);

    // Build and write stitching context
    const stitchingCtx = buildStitchingContext(merged, manifestMeta, opts.sectionsDir, mergedPath);
    const stitchingPath = writeStitchingContext(stitchingCtx, outputDir);
    console.log(`Stitching context written to: ${stitchingPath}`);

    console.log(
      `\nMerged stats: ${merged.stats.total} nodes — ` +
      `${merged.stats.exact} EXACT, ${merged.stats.partial} PARTIAL, ` +
      `${merged.stats.unmapped} UNMAPPED`
    );
    console.log(`Sections merged: ${partials.length}`);
  });

program.parse(process.argv);
