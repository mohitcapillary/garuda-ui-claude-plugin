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
exports.fingerprintNode = fingerprintNode;
const crypto = __importStar(require("crypto"));
/**
 * Creates a structural fingerprint of a FigmaNode based on its shape,
 * not its name. Two nodes with identical structure (same type, layout,
 * child types, child count) produce the same fingerprint.
 *
 * This allows the resolver to match nodes even when designers use
 * generic names like "Frame 2087332157" — the structure gives it away.
 *
 * Example: a Modal always looks like:
 *   FRAME → [TEXT(title), FRAME(body), FRAME(footer)]
 * regardless of what the designer called the outer frame.
 */
function fingerprintNode(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const childTypes = ((_a = node.children) !== null && _a !== void 0 ? _a : []).map((c) => c.type).join(',');
    const childNames = ((_b = node.children) !== null && _b !== void 0 ? _b : [])
        .map((c) => c.name.toLowerCase().replace(/\s+/g, '').slice(0, 12))
        .join(',');
    const parts = [
        node.type,
        (_c = node.layoutMode) !== null && _c !== void 0 ? _c : 'NONE',
        String((_e = (_d = node.children) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0),
        childTypes,
        childNames,
        String(Math.round(((_g = (_f = node.absoluteBoundingBox) === null || _f === void 0 ? void 0 : _f.width) !== null && _g !== void 0 ? _g : 0) / 100) * 100), // bucket to 100px
        String(Math.round(((_j = (_h = node.absoluteBoundingBox) === null || _h === void 0 ? void 0 : _h.height) !== null && _j !== void 0 ? _j : 0) / 50) * 50), // bucket to 50px
    ];
    return crypto
        .createHash('md5')
        .update(parts.join('|'))
        .digest('hex')
        .slice(0, 12);
}
//# sourceMappingURL=fingerprint.js.map