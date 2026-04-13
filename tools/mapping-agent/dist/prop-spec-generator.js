"use strict";
/**
 * prop-spec-generator.ts
 *
 * Orchestrates the full prop-spec.json generation:
 *   1. Scans all Cap* components in libraryPath
 *   2. For each: analyzes source (antd wrapping + propTypes)
 *   3. Reads antd .d.ts for inherited props (when spread detected)
 *   4. Merges wrapper props + antd props into a PropSpecEntry
 *   5. Adds hand-curated caveats for known layout/styling pitfalls
 *   6. Writes the result to outputPath as prop-spec.json
 */
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
exports.generatePropSpec = generatePropSpec;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const antd_type_reader_1 = require("./utils/antd-type-reader");
const cap_component_analyzer_1 = require("./utils/cap-component-analyzer");
// ─── Hand-curated caveats & patterns ─────────────────────────────────────────
/**
 * Known caveats for specific Cap* components that cannot be inferred
 * from source analysis alone. Merged into the generated spec.
 */
const MANUAL_CAVEATS = {
    CapRow: [
        "ALWAYS pass type='flex' to enable flexbox behavior (Ant Design Row default is block)",
        "Use justify prop (not CSS justify-content) — values: 'start'|'end'|'center'|'space-around'|'space-between'",
        "Use align prop (not CSS align-items) — values: 'top'|'middle'|'bottom'",
        "When using styled(CapRow), forward layout props via .attrs(() => ({ type: 'flex', justify, align }))",
    ],
    CapColumn: [
        "Use span prop (1–24) when inside a CapRow grid layout",
        "Can be used standalone as a vertical flex container without span",
        "Avoid CSS gap — use margin on children or gutter on parent CapRow instead",
    ],
    CapButton: [
        "type='primary' uses the app theme color — do NOT override background-color in CSS unless theming is unavailable",
        "Custom wrapper props: isAddBtn (adds + icon), prefix (left slot), suffix (right slot)",
    ],
    CapModal: [
        "Pass footer={null} to remove default OK/Cancel buttons",
        "Pass custom footer={<CapRow>...</CapRow>} for custom action layout",
        "visible prop controls open/close state — must be managed by parent state",
        "Default footer renders CapButton type='primary' (okText) and CapButton type='flat' (closeText)",
    ],
    CapTable: [
        "Wraps antd Table. dataSource + columns are required",
        "Use pagination={false} to disable pagination",
        "Use infinteScroll={true} + setPagination + loadMoreData for infinite scroll",
        "NOT to be confused with CapTab (tabbed navigation) — CapTable = data grid",
    ],
    CapTab: [
        "Use panes prop (array of { key, tab, content }) — do NOT use CapTab.TabPane children",
        "NOT to be confused with CapTable (data grid) — CapTab = tab navigation",
    ],
};
/**
 * Known styled() patterns — how to correctly style each component
 * when wrapped with styled-components.
 */
const STYLED_PATTERNS = {
    CapRow: "styled(CapRow).attrs(() => ({ type: 'flex', justify: '{{justify}}', align: '{{align}}' }))`...css...`",
    CapColumn: "styled(CapColumn)`...css...` (no attrs needed for basic styling)",
    CapButton: "styled(CapButton)`.cap-btn.ant-btn-primary { background: ...; }` (use antd class selectors)",
    CapModal: "styled(CapModal)`.ant-modal-content { ... }` (target antd inner classes)",
    CapTable: "styled(CapTable)`.ant-table { ... }` (target antd table classes)",
};
const DISAMBIGUATION = {
    CapTable: 'CapTable = data grid with rows/columns. CapTab = tab navigation with panes. If Figma shows tabular data → CapTable.',
    CapTab: 'CapTab = tab navigation. CapTable = data grid. If Figma shows navigation tabs → CapTab.',
    CapRow: 'CapRow = horizontal flex container. CapColumn = vertical/grid container. Use CapRow when Figma layoutMode is HORIZONTAL.',
    CapColumn: 'CapColumn = vertical stack or grid cell. CapRow = horizontal flex container. Use CapColumn when Figma layoutMode is VERTICAL.',
};
// ─── Prop conversion helpers ───────────────────────────────────────────────────
function antdPropDefToSpecDef(def) {
    return {
        type: def.type,
        required: def.required,
        values: def.values,
        description: def.description,
        source: 'antd',
    };
}
function propTypesStringToSpecDef(propTypesExpr) {
    // Convert PropTypes.string → { type: 'string' }, PropTypes.oneOf(['a','b']) → { type: 'enum', values: [...] }
    let type = 'any';
    let values;
    if (propTypesExpr.includes('PropTypes.string'))
        type = 'string';
    else if (propTypesExpr.includes('PropTypes.number'))
        type = 'number';
    else if (propTypesExpr.includes('PropTypes.bool'))
        type = 'boolean';
    else if (propTypesExpr.includes('PropTypes.func'))
        type = 'function';
    else if (propTypesExpr.includes('PropTypes.node'))
        type = 'ReactNode';
    else if (propTypesExpr.includes('PropTypes.object'))
        type = 'object';
    else if (propTypesExpr.includes('PropTypes.array'))
        type = 'array';
    else if (propTypesExpr.includes('PropTypes.any'))
        type = 'any';
    else if (propTypesExpr.includes('PropTypes.oneOf')) {
        type = 'enum';
        const oneOfMatch = propTypesExpr.match(/oneOf\(\s*\[([^\]]+)\]\s*\)/);
        if (oneOfMatch) {
            values = oneOfMatch[1]
                .split(',')
                .map((v) => v.trim().replace(/['"]/g, ''))
                .filter(Boolean);
        }
    }
    else if (propTypesExpr.includes('PropTypes.shape')) {
        type = 'object (shape)';
    }
    else if (propTypesExpr.includes('PropTypes.instanceOf')) {
        type = 'instance';
    }
    const required = propTypesExpr.includes('.isRequired');
    return { type, required, values, source: 'wrapper' };
}
// ─── Main generator ───────────────────────────────────────────────────────────
function buildPropSpecEntry(analysis, antdLibPath) {
    var _a, _b, _c;
    const { capComponentName, antdImports, antdSpreadMap, wrapperPropTypes, hasSpread } = analysis;
    // Primary antd component = first one that has a spread
    const primaryAntd = (_b = (_a = antdImports.find((c) => antdSpreadMap[c])) !== null && _a !== void 0 ? _a : antdImports[0]) !== null && _b !== void 0 ? _b : undefined;
    // Read antd props when spread is detected
    let antdProps;
    if (primaryAntd && hasSpread) {
        const antdSpec = (0, antd_type_reader_1.readAntdComponentSpec)(antdLibPath, primaryAntd);
        if (antdSpec) {
            antdProps = Object.fromEntries(Object.entries(antdSpec.props).map(([k, v]) => [k, antdPropDefToSpecDef(v)]));
        }
    }
    // Wrapper-specific props (from propTypes)
    const wrapperProps = {};
    for (const [name, typeExpr] of Object.entries(wrapperPropTypes)) {
        if (name === 'children' || name === 'className')
            continue; // universal, skip
        wrapperProps[name] = propTypesStringToSpecDef(typeExpr);
    }
    // Build description
    const description = primaryAntd
        ? `Wraps antd ${primaryAntd}${hasSpread ? '. All antd ' + primaryAntd + ' props available via spread.' : '.'}`
        : `${capComponentName} component (no antd wrapping detected).`;
    return {
        description,
        antdComponent: primaryAntd,
        spreadsAllAntdProps: hasSpread,
        antdProps: antdProps && Object.keys(antdProps).length > 0 ? antdProps : undefined,
        wrapperProps: Object.keys(wrapperProps).length > 0 ? wrapperProps : undefined,
        explicitPassthroughs: analysis.explicitPassthroughs.length > 0 ? analysis.explicitPassthroughs : undefined,
        caveats: (_c = MANUAL_CAVEATS[capComponentName]) !== null && _c !== void 0 ? _c : [],
        styledPattern: STYLED_PATTERNS[capComponentName],
        disambiguation: DISAMBIGUATION[capComponentName],
    };
}
function generatePropSpec(opts) {
    var _a, _b;
    const { libraryPath, outputPath, verbose } = opts;
    // Auto-detect antd lib path: prefer root node_modules/antd over scoped packages
    const antdLibPath = (_b = (_a = opts.antdLibPath) !== null && _a !== void 0 ? _a : [
        path.resolve(libraryPath, '../../antd/lib'), // <root>/node_modules/antd/lib
        path.resolve(libraryPath, '../antd/lib'), // @capillarytech/antd/lib
    ].find((p) => fs.existsSync(p))) !== null && _b !== void 0 ? _b : path.resolve(libraryPath, '..', 'antd', 'lib');
    if (!fs.existsSync(libraryPath)) {
        throw new Error(`libraryPath does not exist: ${libraryPath}`);
    }
    const componentNames = (0, cap_component_analyzer_1.scanLibraryComponents)(libraryPath).filter((name) => opts.only ? opts.only.includes(name) : true);
    if (verbose) {
        console.log(`[prop-spec] Scanning ${componentNames.length} Cap* components in ${libraryPath}`);
        console.log(`[prop-spec] antd lib path: ${antdLibPath}`);
    }
    const spec = {};
    let antdSpreadCount = 0;
    let noAntdCount = 0;
    for (const name of componentNames) {
        const componentDir = path.join(libraryPath, name);
        const analysis = (0, cap_component_analyzer_1.analyzeCapComponent)(componentDir, name);
        if (!analysis) {
            if (verbose)
                console.log(`  [skip] ${name} — could not read source`);
            continue;
        }
        const entry = buildPropSpecEntry(analysis, antdLibPath);
        spec[name] = entry;
        if (entry.spreadsAllAntdProps)
            antdSpreadCount++;
        else
            noAntdCount++;
        if (verbose) {
            const antdLabel = entry.antdComponent
                ? `→ antd/${entry.antdComponent}${entry.spreadsAllAntdProps ? ' (spread)' : ''}`
                : '(no antd)';
            console.log(`  [ok] ${name.padEnd(32)} ${antdLabel}`);
        }
    }
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
    if (verbose) {
        console.log(`\n[prop-spec] Done.`);
        console.log(`  Components processed : ${componentNames.length}`);
        console.log(`  antd spread detected : ${antdSpreadCount}`);
        console.log(`  No antd wrapping     : ${noAntdCount}`);
        console.log(`  Output written to    : ${outputPath}`);
    }
    return spec;
}
//# sourceMappingURL=prop-spec-generator.js.map