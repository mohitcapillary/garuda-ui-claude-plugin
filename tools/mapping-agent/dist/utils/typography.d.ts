/**
 * Typography utility functions for mapping Figma text styles to BlazeUI tokens.
 * Label type matrix derived from blaze-ui/components/CapLabel/styles.scss
 */
/**
 * Derive the best-matching CapLabel type for a given font size (px) and weight.
 * Returns 'label1' as default fallback.
 */
export declare function findLabelType(fontSize: number, fontWeight: number): string;
/**
 * Map a font size in px to the corresponding $font-size-* SCSS variable.
 * Returns the nearest match if exact not found.
 */
export declare function findFontSizeToken(px: number): string;
/**
 * Returns the font family string if it's not Roboto (needs manual override),
 * or null if it's Roboto (no override needed).
 */
export declare function mapFontToNonRoboto(fontFamily: string): string | null;
//# sourceMappingURL=typography.d.ts.map