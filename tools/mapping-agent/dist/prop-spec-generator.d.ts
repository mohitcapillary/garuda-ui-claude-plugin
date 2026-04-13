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
export interface PropSpecPropDef {
    type: string;
    required?: boolean;
    values?: string[];
    description?: string;
    source: 'antd' | 'wrapper' | 'inferred';
}
export interface PropSpecEntry {
    description: string;
    antdComponent?: string;
    spreadsAllAntdProps: boolean;
    antdProps?: Record<string, PropSpecPropDef>;
    wrapperProps?: Record<string, PropSpecPropDef>;
    explicitPassthroughs?: string[];
    caveats: string[];
    styledPattern?: string;
    disambiguation?: string;
}
export type PropSpec = Record<string, PropSpecEntry>;
export interface GeneratorOptions {
    libraryPath: string;
    outputPath: string;
    antdLibPath?: string;
    only?: string[];
    verbose?: boolean;
}
export declare function generatePropSpec(opts: GeneratorOptions): PropSpec;
//# sourceMappingURL=prop-spec-generator.d.ts.map