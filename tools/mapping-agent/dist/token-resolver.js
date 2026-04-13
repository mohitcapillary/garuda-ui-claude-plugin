"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveToken = resolveToken;
exports.resolveAllTokens = resolveAllTokens;
const color_1 = require("./utils/color");
/**
 * Resolve a single Figma variable to its blaze-ui SCSS variable name.
 * Matches by name first, then by hex/value pattern.
 * Returns null if no match found.
 */
function resolveToken(variable, tokens) {
    var _a;
    // 1. Exact name match
    const nameMatch = tokens.find((t) => t.figmaVariable.toLowerCase() === variable.name.toLowerCase());
    if (nameMatch)
        return nameMatch.blazeCSSVar;
    // 2. Value-based match (color → hex, float → string)
    const modeKeys = Object.keys(variable.valuesByMode);
    if (modeKeys.length === 0)
        return null;
    const firstValue = variable.valuesByMode[modeKeys[0]];
    if (variable.resolvedType === 'COLOR' && firstValue && typeof firstValue === 'object') {
        const colorVal = firstValue;
        if (colorVal.r !== undefined &&
            colorVal.g !== undefined &&
            colorVal.b !== undefined) {
            const hex = (0, color_1.figmaColorToHex)({
                r: colorVal.r,
                g: colorVal.g,
                b: colorVal.b,
                a: (_a = colorVal.a) !== null && _a !== void 0 ? _a : 1,
            });
            const hexMatch = tokens.find((t) => {
                var _a;
                return t.tokenType === 'COLOR' &&
                    ((_a = t.figmaValuePattern) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === hex.toLowerCase();
            });
            if (hexMatch)
                return hexMatch.blazeCSSVar;
        }
    }
    if (variable.resolvedType === 'FLOAT' && typeof firstValue === 'number') {
        const strVal = String(firstValue);
        const numMatch = tokens.find((t) => t.figmaValuePattern === strVal);
        if (numMatch)
            return numMatch.blazeCSSVar;
    }
    if (variable.resolvedType === 'STRING' && typeof firstValue === 'string') {
        const strMatch = tokens.find((t) => { var _a; return ((_a = t.figmaValuePattern) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === firstValue.toLowerCase(); });
        if (strMatch)
            return strMatch.blazeCSSVar;
    }
    return null;
}
/**
 * Resolve all variables from a get_variable_defs response.
 * Returns a TokenResolutionMap with RESOLVED/UNRESOLVED status per variable.
 */
function resolveAllTokens(variableDefs, tokens, figmaFileKey) {
    const entries = [];
    for (const collection of variableDefs.collections) {
        for (const variable of collection.variables) {
            const blazeCSSVar = resolveToken(variable, tokens);
            entries.push({
                figmaVariable: variable.name,
                blazeCSSVar,
                status: blazeCSSVar ? 'RESOLVED' : 'UNRESOLVED',
            });
        }
    }
    return {
        figmaFileKey,
        resolvedAt: new Date().toISOString(),
        tokens: entries,
    };
}
//# sourceMappingURL=token-resolver.js.map