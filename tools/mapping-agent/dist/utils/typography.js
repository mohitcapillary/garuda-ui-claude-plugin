"use strict";
/**
 * Typography utility functions for mapping Figma text styles to BlazeUI tokens.
 * Label type matrix derived from blaze-ui/components/CapLabel/styles.scss
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLabelType = findLabelType;
exports.findFontSizeToken = findFontSizeToken;
exports.mapFontToNonRoboto = mapFontToNonRoboto;
// Map of [fontSize (rem), fontWeight, color-var-key] → label type
// Sizes: 0.714rem=10px, 0.857rem=12px, 1rem=14px, 1.143rem=16px, 1.714rem=24px
// Weights: 400=regular, 500=medium
// (fontSize in px, fontWeight) → labelType string
const LABEL_MATRIX = [
    // label1:  12px, 400  ($cap-g04)
    [12, 400, 'label1'],
    // label2:  12px, 400  ($cap-g01) — prefer label1 for generic use
    [12, 400, 'label2'],
    // label3:  12px, 400  ($cap-g05)
    [12, 400, 'label3'],
    // label4:  12px, 500  ($cap-g01)
    [12, 500, 'label4'],
    // label5:  10px, 400
    [10, 400, 'label5'],
    // label6:  12px, 400  ($cap-g06)
    [12, 400, 'label6'],
    // label7:  14px, 500
    [14, 500, 'label7'],
    // label8:  12px, 500
    [12, 500, 'label8'],
    // label9:  12px, 400  (with line-height)
    [12, 400, 'label9'],
    // label10: 12px, 400  (white)
    [12, 400, 'label10'],
    // label11: 10px, 400  ($cap-g04)
    [10, 400, 'label11'],
    // label12: 12px, 400  (white)
    [12, 400, 'label12'],
    // label13: 10px, 400  ($cap-g05)
    [10, 400, 'label13'],
    // label14: 14px, 400  ($cap-g21)
    [14, 400, 'label14'],
    // label15: 14px, 400  ($cap-g01)
    [14, 400, 'label15'],
    // label16: 14px, 500  ($cap-g01)
    [14, 500, 'label16'],
    // label17: 16px, 500
    [16, 500, 'label17'],
    // label18: 14px, 400  ($cap-g04)
    [14, 400, 'label18'],
    // label19: 12px, 400  ($cap-black-alpha02)
    [12, 400, 'label19'],
    // label20: 14px, 500  ($cap-blue01)
    [14, 500, 'label20'],
    // label21: 12px, 400  ($cap-blue01)
    [12, 400, 'label21'],
    // label22: 24px, 400
    [24, 400, 'label22'],
    // label23: 14px, 400  (white)
    [14, 400, 'label23'],
    // label24: 14px, 400  (with line-height 1.429)
    [14, 400, 'label24'],
    // label25: 14px, 500  (with line-height 1.429)
    [14, 500, 'label25'],
    // label26: 10px, 400  ($cap-g01)
    [10, 400, 'label26'],
    // label27: 12px, 500  ($cap-blue01)
    [12, 500, 'label27'],
    // label28: 12px, 500  (white)
    [12, 500, 'label28'],
    // label29: 10px, 400  (white)
    [10, 400, 'label29'],
    // label30: 10px, 400  (white)
    [10, 400, 'label30'],
    // label31: 12px, 400  ($cap-g01, line-height)
    [12, 400, 'label31'],
    // label32: 14px, 500  (white, line-height)
    [14, 500, 'label32'],
    // label33: 14px, 500  ($cap-blue01, line-height)
    [14, 500, 'label33'],
];
const FONT_SIZE_MAP = [
    [24, '$font-size-vl'],
    [16, '$font-size-l'],
    [14, '$font-size-m'],
    [12, '$font-size-s'],
    [10, '$font-size-vs'],
];
/**
 * Derive the best-matching CapLabel type for a given font size (px) and weight.
 * Returns 'label1' as default fallback.
 */
function findLabelType(fontSize, fontWeight) {
    // Find the first entry that matches both size and weight
    const match = LABEL_MATRIX.find(([size, weight]) => size === fontSize && weight === fontWeight);
    if (match)
        return match[2];
    // Fallback: match size only, prefer medium weight for 500
    const sizeMatch = LABEL_MATRIX.find(([size]) => size === fontSize);
    if (sizeMatch)
        return sizeMatch[2];
    // Nearest font size
    const nearest = findFontSizeToken(fontSize);
    const nearestPx = nearestFontSize(fontSize);
    const fallback = LABEL_MATRIX.find(([size]) => size === nearestPx);
    return fallback ? fallback[2] : 'label1';
}
function nearestFontSize(px) {
    const sizes = [10, 12, 14, 16, 24];
    return sizes.reduce((prev, curr) => Math.abs(curr - px) < Math.abs(prev - px) ? curr : prev);
}
/**
 * Map a font size in px to the corresponding $font-size-* SCSS variable.
 * Returns the nearest match if exact not found.
 */
function findFontSizeToken(px) {
    const exact = FONT_SIZE_MAP.find(([size]) => size === px);
    if (exact)
        return exact[1];
    // Nearest match
    let best = FONT_SIZE_MAP[0];
    let bestDist = Math.abs(FONT_SIZE_MAP[0][0] - px);
    for (const entry of FONT_SIZE_MAP) {
        const dist = Math.abs(entry[0] - px);
        if (dist < bestDist) {
            bestDist = dist;
            best = entry;
        }
    }
    return best[1];
}
/**
 * Returns the font family string if it's not Roboto (needs manual override),
 * or null if it's Roboto (no override needed).
 */
function mapFontToNonRoboto(fontFamily) {
    const normalized = fontFamily.trim().toLowerCase();
    if (normalized === 'roboto' || normalized.startsWith('roboto,')) {
        return null;
    }
    return fontFamily;
}
//# sourceMappingURL=typography.js.map