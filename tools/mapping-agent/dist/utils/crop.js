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
exports.cropNode = cropNode;
const fs = __importStar(require("fs"));
/**
 * Crops a rectangular region from a full-page screenshot PNG.
 * Uses sharp (optional peer dependency) — returns null if sharp is not installed
 * or if the bounding box is outside the image bounds.
 *
 * The scale parameter handles Retina/2x screenshots where Figma coordinates
 * are in logical pixels but the PNG is 2x resolution.
 */
async function cropNode(screenshotPath, box, scale = 1) {
    var _a, _b;
    if (!fs.existsSync(screenshotPath)) {
        return null;
    }
    // sharp is an optional dependency — gracefully skip if missing
    let sharp;
    try {
        sharp = require('sharp');
    }
    catch {
        console.warn('[crop] sharp not installed — skipping visual crop. Run: npm install sharp');
        return null;
    }
    // Clamp to non-negative, non-zero dimensions
    const left = Math.max(0, Math.floor(box.x * scale));
    const top = Math.max(0, Math.floor(box.y * scale));
    const width = Math.max(1, Math.floor(box.width * scale));
    const height = Math.max(1, Math.floor(box.height * scale));
    try {
        const metadata = await sharp(screenshotPath).metadata();
        const imgWidth = (_a = metadata.width) !== null && _a !== void 0 ? _a : 0;
        const imgHeight = (_b = metadata.height) !== null && _b !== void 0 ? _b : 0;
        // Skip crop if region is outside image bounds
        if (left >= imgWidth || top >= imgHeight)
            return null;
        const safeWidth = Math.min(width, imgWidth - left);
        const safeHeight = Math.min(height, imgHeight - top);
        if (safeWidth <= 0 || safeHeight <= 0)
            return null;
        return await sharp(screenshotPath)
            .extract({ left, top, width: safeWidth, height: safeHeight })
            .png()
            .toBuffer();
    }
    catch (err) {
        console.warn(`[crop] Failed to crop node at (${left},${top}) ${width}x${height}: ${err}`);
        return null;
    }
}
//# sourceMappingURL=crop.js.map