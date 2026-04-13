/**
 * cap-component-analyzer.ts
 *
 * Analyzes a Cap* component's JavaScript source to detect:
 *   1. Which antd component it wraps (e.g. CapRow → Row from antd)
 *   2. Whether it spreads all props — through direct, styled(), or sub-component alias
 *   3. Which props it explicitly destructures / passes directly
 *   4. Its own propTypes declarations (wrapper-specific props)
 *
 * Handles these wrapping patterns:
 *   Pattern 1 — Direct spread:       <Row {...rest} />
 *   Pattern 2 — Styled wrapper:      const StyledTable = styled(Table); <StyledTable {...rest} />
 *   Pattern 3 — Sub-component alias: const FormItem = Form.Item; <FormItem {...rest} />
 *   Pattern 4 — Custom spread vars:  <Steps {...stepsProps} />, <Skeleton {...skeletonProps} />
 *   Pattern 5 — Styled from local:   import { StyledTag } from './styles' (styled(Tag))
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CapComponentAnalysis {
  capComponentName: string;   // e.g. "CapRow"
  sourcePath: string;
  antdImports: string[];       // e.g. ["Row"]
  antdSpreadMap: Record<string, boolean>; // antdComponentName → spreadsProps
  explicitPassthroughs: string[];        // props explicitly passed (not spread)
  wrapperPropTypes: Record<string, string>; // prop name → PropTypes type string
  hasSpread: boolean;
  /** Every alias (styled wrapper, sub-component accessor) that maps to an antd component */
  antdAliases: Record<string, string>;
}

// ─── Antd import detection ───────────────────────────────────────────────────

/**
 * Detect all antd component names imported in the file.
 * Handles: import { Row, Col } from "antd"
 *          import { Table } from 'antd'
 */
function detectAntdImports(source: string): string[] {
  const results: string[] = [];
  const namedImportRegex = /import\s*\{([^}]+)\}\s*from\s*["']antd["']/g;
  let match;
  while ((match = namedImportRegex.exec(source)) !== null) {
    const names = match[1]
      .split(',')
      .map((n) => n.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    results.push(...names);
  }
  return [...new Set(results)];
}

/**
 * Detect default import from antd subpath:
 *   import Button from 'antd/lib/button'  → "Button"
 */
function detectAntdSubpathImports(source: string): string[] {
  const results: string[] = [];
  const subpathRegex = /import\s+(\w+)\s+from\s*["']antd\/(?:lib|es)\/(\w[\w-]*)["']/g;
  let match;
  while ((match = subpathRegex.exec(source)) !== null) {
    results.push(match[1]);
  }
  return results;
}

// ─── Alias resolution (styled wrappers, sub-component accessors) ─────────────

/**
 * Build a map of all names that refer to an antd component — directly, via
 * styled(), via sub-component accessor (Form.Item), or via local style imports.
 *
 * Returns: { aliasName → originalAntdImportName }
 *   e.g. { "Table": "Table", "StyledTable": "Table", "FormItem": "Form", "RadioButton": "Radio" }
 */
function resolveAntdAliases(
  source: string,
  antdImports: string[],
  componentDir: string,
): Record<string, string> {
  const aliases: Record<string, string> = {};

  // Seed: every direct import is an alias for itself
  for (const imp of antdImports) {
    aliases[imp] = imp;
  }

  // Pattern A: const StyledX = styled(AntdComp)`...`
  //            const StyledX = styled(AntdComp)(`...`)
  const styledRegex = /(?:const|let|var)\s+(\w+)\s*=\s*styled\(\s*(\w+(?:\.\w+)?)\s*\)/g;
  let match;
  while ((match = styledRegex.exec(source)) !== null) {
    const [, alias, target] = match;
    const baseTarget = target.split('.')[0];
    if (antdImports.includes(baseTarget)) {
      aliases[alias] = baseTarget;
    }
  }

  // Pattern B: const FormItem = Form.Item  /  const RadioButton = Radio.Button
  const subCompRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\.(\w+)\s*[;\n]/g;
  while ((match = subCompRegex.exec(source)) !== null) {
    const [, alias, parent] = match;
    if (antdImports.includes(parent)) {
      aliases[alias] = parent;
    }
  }

  // Pattern C: follow local style/styles imports for styled(AntdComp) definitions
  //   import { StyledTag } from './styles'
  //   where styles.js has: export const StyledTag = styled(Tag)`...`
  const localStyleAliases = resolveLocalStyleAliases(source, antdImports, componentDir);
  Object.assign(aliases, localStyleAliases);

  return aliases;
}

/**
 * Check local ./styles.js or ./style.js for styled(AntdComp) exports
 * that are imported and used in the main component file.
 */
function resolveLocalStyleAliases(
  mainSource: string,
  antdImports: string[],
  componentDir: string,
): Record<string, string> {
  const aliases: Record<string, string> = {};

  // Find local relative imports that might be style files
  const localImportRegex = /import\s*\{([^}]+)\}\s*from\s*["']\.\/(\w+)["']/g;
  let importMatch;
  const importedNames: Array<{ name: string; file: string }> = [];

  while ((importMatch = localImportRegex.exec(mainSource)) !== null) {
    const names = importMatch[1].split(',').map((n) => n.trim()).filter(Boolean);
    const file = importMatch[2];
    for (const n of names) {
      importedNames.push({ name: n, file });
    }
  }

  if (importedNames.length === 0) return aliases;

  // Read each referenced local file and check for styled(AntdComp) patterns
  const checkedFiles = new Set<string>();
  for (const { name, file } of importedNames) {
    if (checkedFiles.has(file)) continue;
    checkedFiles.add(file);

    const filePath = path.join(componentDir, `${file}.js`);
    if (!fs.existsSync(filePath)) continue;

    let styleSource: string;
    try {
      styleSource = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    // Check if this file imports from antd
    const styleAntdImports = [
      ...detectAntdImports(styleSource),
      ...detectAntdSubpathImports(styleSource),
    ];

    // Look for: export const StyledX = styled(AntdComp) or styled(AntdComp.Sub)
    const styledExportRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*styled\(\s*(\w+(?:\.\w+)?)\s*\)/g;
    let stMatch;
    while ((stMatch = styledExportRegex.exec(styleSource)) !== null) {
      const [, alias, target] = stMatch;
      const baseTarget = target.split('.')[0];
      // Check both the main file's antd imports and the style file's antd imports
      if (antdImports.includes(baseTarget) || styleAntdImports.includes(baseTarget)) {
        // Only register if this alias is actually imported into the main file
        if (importedNames.some((im) => im.name === alias)) {
          // Map back to the antd import name visible in the main file
          // (if the main file doesn't import antd directly, use the style file's import)
          aliases[alias] = antdImports.includes(baseTarget) ? baseTarget : baseTarget;
        }
      }
    }
  }

  return aliases;
}

// ─── Spread detection ────────────────────────────────────────────────────────

/**
 * Detect whether ANY spread operator targets a JSX element whose name is one
 * of the known aliases for an antd component.
 *
 * Matches any spread variable name ({...rest}, {...stepsProps}, {...anything}).
 * Uses a 2000-char lookahead window to handle multiline JSX with nested children.
 */
function detectSpreadOnAlias(source: string, alias: string): boolean {
  // Match: <AliasName <up to 2000 chars of anything> {...someVariable}
  const pattern = new RegExp(
    `<${alias}[\\s\\S]{0,2000}\\{\\.\\.\\.\\w+\\}`,
    'm',
  );
  return pattern.test(source);
}

/**
 * For every alias (direct import, styled wrapper, sub-component accessor),
 * check if any of them receive a prop spread in JSX.
 * Returns a map: originalAntdName → boolean
 */
function detectSpreadViaAliases(
  source: string,
  aliases: Record<string, string>,
): Record<string, boolean> {
  const spreadMap: Record<string, boolean> = {};

  // Initialize all original antd imports to false
  const originals = new Set(Object.values(aliases));
  for (const orig of originals) {
    spreadMap[orig] = false;
  }

  // Check every alias
  for (const [alias, original] of Object.entries(aliases)) {
    if (spreadMap[original]) continue; // already found, skip
    if (detectSpreadOnAlias(source, alias)) {
      spreadMap[original] = true;
    }
  }

  return spreadMap;
}

// ─── Explicit prop passthrough detection ─────────────────────────────────────

/**
 * Extract props that are explicitly passed to the antd component (or its alias)
 * (not via spread), e.g. type={type}, className={classnames(...)}
 */
function detectExplicitPassthroughs(source: string, aliases: string[]): string[] {
  const results: string[] = [];

  for (const alias of aliases) {
    // Find the JSX element opening tag for the alias
    const tagRegex = new RegExp(`<${alias}([\\s\\S]*?)(?:/>|>)`, 'm');
    const tagMatch = source.match(tagRegex);
    if (!tagMatch) continue;

    const tagContent = tagMatch[1];
    // Match explicit prop assignments: propName={...} or propName="..."
    const propMatches = tagContent.matchAll(/\b(\w+)=\{/g);
    for (const m of propMatches) {
      results.push(m[1]);
    }
  }

  return [...new Set(results)];
}

// ─── PropTypes extraction ────────────────────────────────────────────────────

/**
 * Parse propTypes from the component source.
 * Handles both:
 *   ComponentName.propTypes = { ... }
 *   static propTypes = { ... }  (class components)
 */
function extractWrapperPropTypes(source: string, capComponentName: string): Record<string, string> {
  const propTypes: Record<string, string> = {};

  // Try: ComponentName.propTypes = { ... }
  const externalPropTypesRegex = new RegExp(
    `${capComponentName}\\.propTypes\\s*=\\s*\\{([\\s\\S]*?)\\};?\\s*(?:export|$|\\n[A-Za-z])`,
    'm',
  );
  const externalMatch = source.match(externalPropTypesRegex);

  // Also try: CapXxx.propTypes = { ... } (generic pattern)
  const genericPropTypesRegex = /(?:Cap\w+|module\.exports\.propTypes|\w+\.propTypes)\s*=\s*\{([\s\S]*?)\n\}/m;
  const block = externalMatch
    ? externalMatch[1]
    : source.match(genericPropTypesRegex)?.[1] ?? '';

  if (!block) return propTypes;

  // Match lines like: propName: PropTypes.string,  or  propName: PropTypes.oneOf([...]).isRequired,
  const propLineRegex = /^\s*(\w+)\s*:\s*(PropTypes\.[^,\n]+)/gm;
  let match;
  while ((match = propLineRegex.exec(block)) !== null) {
    const [, name, typeExpr] = match;
    propTypes[name] = typeExpr.trim().replace(/,\s*$/, '');
  }

  return propTypes;
}

// ─── File resolution ─────────────────────────────────────────────────────────

/**
 * Locate the main JS file for a Cap* component directory.
 * Checks index.js, then Cap<Name>.js, then any .js in the root.
 */
function resolveMainFile(componentDir: string, componentName: string): string | null {
  const candidates = [
    path.join(componentDir, 'index.js'),
    path.join(componentDir, `${componentName}.js`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // Fallback: find any non-test JS in the directory
  try {
    const files = fs.readdirSync(componentDir).filter(
      (f) => f.endsWith('.js') && !f.includes('.test.') && !f.includes('.spec.'),
    );
    if (files.length > 0) return path.join(componentDir, files[0]);
  } catch {
    // ignore
  }
  return null;
}

// ─── Main analysis ───────────────────────────────────────────────────────────

/**
 * Full analysis of a single Cap* component directory.
 */
export function analyzeCapComponent(
  componentDir: string,
  componentName: string,
): CapComponentAnalysis | null {
  const sourcePath = resolveMainFile(componentDir, componentName);
  if (!sourcePath) return null;

  let source: string;
  try {
    source = fs.readFileSync(sourcePath, 'utf-8');
  } catch {
    return null;
  }

  // If the file just re-exports (barrel), follow one level
  const reExportMatch = source.match(/export\s*\{\s*default\s*\}\s*from\s*['"]\.\/(\w+)['"]/);
  if (reExportMatch) {
    const target = path.join(componentDir, `${reExportMatch[1]}.js`);
    if (fs.existsSync(target)) {
      try { source = fs.readFileSync(target, 'utf-8'); } catch { /* keep original */ }
    }
  }

  // Step 1: Detect antd imports
  const antdImports = [
    ...detectAntdImports(source),
    ...detectAntdSubpathImports(source),
  ];

  // Step 2: Resolve all aliases (styled wrappers, sub-component accessors, local styles)
  const antdAliases = resolveAntdAliases(source, antdImports, componentDir);

  // Step 3: Detect spread for each alias, mapping back to original antd import
  const antdSpreadMap = detectSpreadViaAliases(source, antdAliases);

  const hasSpread = Object.values(antdSpreadMap).some(Boolean);

  // Step 4: Detect explicitly passed props
  const allAliasNames = Object.keys(antdAliases);
  const explicitPassthroughs = detectExplicitPassthroughs(source, allAliasNames);

  // Step 5: Extract wrapper propTypes
  const wrapperPropTypes = extractWrapperPropTypes(source, componentName);

  return {
    capComponentName: componentName,
    sourcePath,
    antdImports,
    antdSpreadMap,
    explicitPassthroughs,
    wrapperPropTypes,
    hasSpread,
    antdAliases,
  };
}

/**
 * Scan a library directory and return all Cap* component directories found.
 */
export function scanLibraryComponents(libraryPath: string): string[] {
  try {
    return fs
      .readdirSync(libraryPath)
      .filter(
        (name) =>
          name.startsWith('Cap') &&
          fs.statSync(path.join(libraryPath, name)).isDirectory(),
      );
  } catch {
    return [];
  }
}
