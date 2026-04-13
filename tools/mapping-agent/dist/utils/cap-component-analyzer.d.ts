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
export interface CapComponentAnalysis {
    capComponentName: string;
    sourcePath: string;
    antdImports: string[];
    antdSpreadMap: Record<string, boolean>;
    explicitPassthroughs: string[];
    wrapperPropTypes: Record<string, string>;
    hasSpread: boolean;
    /** Every alias (styled wrapper, sub-component accessor) that maps to an antd component */
    antdAliases: Record<string, string>;
}
/**
 * Full analysis of a single Cap* component directory.
 */
export declare function analyzeCapComponent(componentDir: string, componentName: string): CapComponentAnalysis | null;
/**
 * Scan a library directory and return all Cap* component directories found.
 */
export declare function scanLibraryComponents(libraryPath: string): string[];
//# sourceMappingURL=cap-component-analyzer.d.ts.map