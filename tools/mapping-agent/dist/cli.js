#!/usr/bin/env node
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
const commander_1 = require("commander");
const path = __importStar(require("path"));
const registry_loader_1 = require("./registry-loader");
const resolver_1 = require("./resolver");
const output_writer_1 = require("./output-writer");
const metadata_parser_1 = require("./utils/metadata-parser");
const jsx_parser_1 = require("./utils/jsx-parser");
const vision_resolver_1 = require("./vision-resolver");
const registry_writer_1 = require("./registry-writer");
const prop_spec_generator_1 = require("./prop-spec-generator");
const program = new commander_1.Command();
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
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
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
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
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
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
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
    const rootNode = (0, metadata_parser_1.parseMetadataRoot)(trimmed);
    // Auto-fetch screenshot from Figma REST API when --fetch-screenshot is set
    if (opts.fetchScreenshot) {
        if (!opts.fileKey || !opts.nodeId) {
            console.error('ERROR: --fetch-screenshot requires --file-key and --node-id');
            process.exit(1);
        }
        const { fetchFigmaScreenshot } = await Promise.resolve().then(() => __importStar(require('./utils/figma-screenshot')));
        console.log('[screenshot] Fetching from Figma REST API...');
        opts.screenshot = await fetchFigmaScreenshot(opts.fileKey, opts.nodeId.replace('-', ':'));
        console.log(`[screenshot] Saved to ${opts.screenshot}`);
    }
    // Enrich FigmaNode tree with fills, typography, and spacing from get_design_context JSX
    if (opts.designContext) {
        const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
        const jsx = readFileSync(opts.designContext, 'utf-8');
        const extractions = (0, jsx_parser_1.extractJSXNodes)(jsx);
        (0, jsx_parser_1.enrichFigmaTree)(rootNode, extractions);
        console.log(`[enrich] Loaded design context: ${extractions.length} elements extracted from JSX`);
    }
    const recipe = (0, resolver_1.resolveScreen)(rootNode, registry);
    // Phase 2: Visual resolution of UNMAPPED nodes via screenshot crop + Claude vision
    if (opts.screenshot && recipe.stats.unmapped > 0) {
        console.log(`\n[vision] ${recipe.stats.unmapped} UNMAPPED nodes — running visual resolver...`);
        const nodeMap = (0, vision_resolver_1.buildNodeMap)(rootNode);
        const visuallyResolved = await (0, vision_resolver_1.enhanceRecipeWithVision)(recipe.root, opts.screenshot, registry, nodeMap);
        recipe.stats.unmapped -= visuallyResolved;
        recipe.stats.exact += visuallyResolved;
        console.log(`[vision] Resolved ${visuallyResolved} additional nodes visually`);
        // Phase 3: Write learned mappings back to registry for future runs
        if (opts.learn && visuallyResolved > 0) {
            const registryPath = opts.registry
                ? path.join(opts.registry, 'component-mappings.json')
                : undefined;
            const newEntries = (0, registry_writer_1.writeLearnedMappings)(recipe, nodeMap, registryPath);
            console.log(`[learn] Wrote ${newEntries} new entries to component-mappings.json`);
        }
    }
    else if (opts.screenshot && recipe.stats.unmapped === 0) {
        console.log('[vision] No UNMAPPED nodes — skipping visual resolver');
    }
    const outPath = (0, output_writer_1.writeRecipe)(recipe, opts.output);
    console.log(`\nRecipe written to: ${outPath}`);
    console.log(`Stats: ${recipe.stats.total} nodes — ${recipe.stats.exact} EXACT, ` +
        `${recipe.stats.partial} PARTIAL, ${recipe.stats.unmapped} UNMAPPED`);
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
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
    let inputJson = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) {
        inputJson += chunk;
    }
    const node = JSON.parse(inputJson);
    const recipe = (0, resolver_1.resolveScreen)(node, registry);
    const outPath = (0, output_writer_1.writeRecipe)(recipe, opts.output);
    console.log(`Recipe written to: ${outPath}`);
    console.log(`Stats: ${recipe.stats.total} nodes — ${recipe.stats.exact} EXACT, ` +
        `${recipe.stats.partial} PARTIAL, ${recipe.stats.unmapped} UNMAPPED`);
});
// ─── validate-registry command ────────────────────────────────────────────────
program
    .command('validate-registry')
    .description('Validate the component and token mapping registries')
    .option('--registry <dir>', 'Registry directory (default: src/registries)')
    .action((opts) => {
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
    const result = (0, registry_loader_1.validateRegistry)(registry);
    console.log('\nComponent Registry Validation');
    console.log('─'.repeat(50));
    for (const entry of registry.components) {
        const errors = result.errors.filter((e) => e.includes(entry.figmaIdentifier));
        const status = errors.length === 0 ? '✓ PASS' : '✗ FAIL';
        console.log(`${status}  ${entry.figmaIdentifier} → ${entry.targetComponent}`);
        for (const err of errors)
            console.log(`       ${err}`);
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
    var _a;
    const registry = (0, registry_loader_1.loadRegistry)(opts.registry);
    const grouped = {};
    for (const entry of registry.components) {
        grouped[entry.targetComponent] = ((_a = grouped[entry.targetComponent]) !== null && _a !== void 0 ? _a : 0) + 1;
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
    .description('Scan a Cap* component library and generate prop-spec.json — ' +
    'detects antd spread pattern, reads antd .d.ts, extracts propTypes')
    .requiredOption('--library-path <path>', 'Path to the cap-ui-library root (e.g. node_modules/@capillarytech/cap-ui-library)')
    .requiredOption('--output <path>', 'Output path for prop-spec.json (e.g. src/registries/prop-spec.json)')
    .option('--antd-lib-path <path>', 'Path to antd/lib (auto-detected from libraryPath if omitted)')
    .option('--only <components>', 'Comma-separated list of component names to process (e.g. CapRow,CapButton)')
    .option('--verbose', 'Print per-component analysis to stdout')
    .action((opts) => {
    var _a;
    const only = opts.only
        ? opts.only.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
    (0, prop_spec_generator_1.generatePropSpec)({
        libraryPath: opts.libraryPath,
        outputPath: opts.output,
        antdLibPath: opts.antdLibPath,
        only,
        verbose: (_a = opts.verbose) !== null && _a !== void 0 ? _a : true,
    });
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map