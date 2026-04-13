export type FigmaNodeType = 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE' | 'FRAME' | 'GROUP' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'VECTOR' | 'BOOLEAN_OPERATION';
export interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface FigmaFill {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
    color?: FigmaColor;
    opacity?: number;
}
export interface FigmaEffect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    visible?: boolean;
    radius?: number;
    color?: FigmaColor;
    offset?: {
        x: number;
        y: number;
    };
}
export interface FigmaTextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeightPx: number;
    letterSpacing: number;
}
export interface FigmaBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface FigmaNode {
    id: string;
    name: string;
    type: FigmaNodeType;
    fills?: FigmaFill[];
    strokes?: FigmaFill[];
    effects?: FigmaEffect[];
    cornerRadius?: number;
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
    itemSpacing?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    componentProperties?: Record<string, string | boolean | number>;
    variantProperties?: Record<string, string>;
    characters?: string;
    style?: FigmaTextStyle;
    children?: FigmaNode[];
    absoluteBoundingBox?: FigmaBoundingBox;
}
export interface FigmaVariableValue {
    r?: number;
    g?: number;
    b?: number;
    a?: number;
}
export interface FigmaVariable {
    id: string;
    name: string;
    resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
    valuesByMode: Record<string, FigmaVariableValue | number | string | boolean>;
}
export interface FigmaVariableCollection {
    id: string;
    name: string;
    modes: Array<{
        modeId: string;
        name: string;
    }>;
    variables: FigmaVariable[];
}
export interface FigmaVariableDefs {
    collections: FigmaVariableCollection[];
}
export interface PropTransform {
    prop: string;
    transform?: 'boolean' | 'string' | 'number';
}
export interface PropValueMap {
    map: Record<string, Record<string, unknown>>;
}
export interface SlotMapping {
    slot: string;
    component?: string;
}
export interface CompositeChild {
    figmaLayerName: string;
    targetSlot?: string;
}
export interface ComponentMapping {
    figmaIdentifier: string;
    nodeTypes: FigmaNodeType[];
    componentNames: string[];
    variantPatterns?: Record<string, string>;
    targetComponent: string;
    importPath: string;
    defaultProps?: Record<string, unknown>;
    propMappings: Record<string, PropTransform | PropValueMap>;
    slotMappings: Record<string, SlotMapping>;
    cssVariableMappings?: Record<string, string>;
    compositeChildren?: CompositeChild[];
    fallback?: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    /**
     * When true, the resolver continues recursing into children even though this
     * node is an INSTANCE. Use for container components like CapTable, CapTab,
     * CapMenu, CapSteps — where Figma children contain further components
     * (buttons in action columns, icons in menu items, etc).
     */
    isComposite?: boolean;
}
export type TokenType = 'COLOR' | 'TYPOGRAPHY' | 'SPACING' | 'RADIUS' | 'BORDER' | 'SHADOW';
export interface TokenMapping {
    figmaVariable: string;
    figmaValuePattern?: string;
    blazeCSSVar: string;
    blazeTSConst?: string;
    tokenType: TokenType;
}
export interface MappingRegistry {
    version: string;
    components: ComponentMapping[];
    tokens: TokenMapping[];
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export type MappingStatus = 'EXACT' | 'PARTIAL' | 'UNMAPPED';
export interface FallbackSpec {
    nearestComponent: string | null;
    nearestComponentRationale: string;
    htmlFallback: string;
}
export interface RecipeSlot {
    component?: string;
    importPath?: string;
    props?: Record<string, unknown>;
    children?: string | RecipeNode;
}
export type ResolutionSource = 'registry' | 'layout-inferred' | 'typography' | 'vision-inferred' | 'unresolved';
export interface RecipeNode {
    figmaNodeId: string;
    figmaNodeType: FigmaNodeType;
    figmaComponentName: string;
    mappingStatus: MappingStatus;
    targetComponent: string | null;
    importPath: string | null;
    props: Record<string, unknown>;
    slots: Record<string, RecipeSlot | string>;
    cssVariables: Record<string, string>;
    /** Visible label text on this node (field label, button text, heading) */
    label?: string;
    /** Secondary descriptive text below the label (byline, helper text) */
    byline?: string;
    /** Placeholder text inside input/select fields */
    placeholder?: string;
    /** Text color — hex value or resolved CSS variable */
    textColor?: string;
    /** Corner radius in px */
    cornerRadius?: number;
    /** Padding in px (from JSX enrichment) */
    padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    /** Gap between children in px */
    itemSpacing?: number;
    /** Font weight (100–900) */
    fontWeight?: number;
    /** Font family */
    fontFamily?: string;
    manualOverrides: string[];
    warnings: string[];
    fallback: FallbackSpec | null;
    children: RecipeNode[];
    /** How this node was resolved */
    source?: ResolutionSource;
    /** Structural fingerprint — used for vision cache and registry learn-back */
    fingerprint?: string;
}
export interface ConversionRecipe {
    figmaFileKey?: string;
    resolvedAt: string;
    root: RecipeNode;
    stats: {
        total: number;
        exact: number;
        partial: number;
        unmapped: number;
    };
}
export interface TokenResolutionEntry {
    figmaVariable: string;
    blazeCSSVar: string | null;
    status: 'RESOLVED' | 'UNRESOLVED';
}
export interface TokenResolutionMap {
    figmaFileKey?: string;
    resolvedAt: string;
    tokens: TokenResolutionEntry[];
}
//# sourceMappingURL=types.d.ts.map