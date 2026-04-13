/**
 * antd-type-reader.ts
 *
 * Reads antd TypeScript .d.ts files and extracts prop interface definitions
 * for a given antd component name. Used by the prop-spec generator to build
 * accurate prop documentation for Cap* wrapper components.
 */
export interface AntdPropDef {
    type: string;
    required: boolean;
    description?: string;
    values?: string[];
}
export interface AntdComponentSpec {
    componentName: string;
    interfaceName: string;
    dtspath: string;
    props: Record<string, AntdPropDef>;
}
/**
 * Read and parse the antd .d.ts for a given component name.
 * Returns null if the component is not found or not supported.
 */
export declare function readAntdComponentSpec(antdLibPath: string, componentName: string): AntdComponentSpec | null;
/**
 * Returns the list of antd component names this module knows about.
 */
export declare function getSupportedAntdComponents(): string[];
//# sourceMappingURL=antd-type-reader.d.ts.map