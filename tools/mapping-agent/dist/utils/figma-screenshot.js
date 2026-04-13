"use strict";
/**
 * figma-screenshot.ts
 *
 * Downloads a PNG screenshot of a Figma node via the Figma REST API.
 * Used by the CLI's --fetch-screenshot flag to auto-populate the screenshot
 * needed by the vision resolver.
 *
 * Requires FIGMA_TOKEN environment variable.
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
exports.fetchFigmaScreenshot = fetchFigmaScreenshot;
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
/**
 * Fetch a PNG screenshot for a specific Figma node.
 *
 * @param fileKey  - Figma file key (from the URL)
 * @param nodeId   - Node ID in colon format, e.g. "3:1050"
 * @returns        - Absolute path to the downloaded temp PNG file
 */
async function fetchFigmaScreenshot(fileKey, nodeId) {
    const token = process.env.FIGMA_TOKEN;
    if (!token)
        throw new Error('FIGMA_TOKEN environment variable is not set');
    // Figma REST API uses dash format in query params (e.g. "3-1050")
    const encodedId = nodeId.replace(':', '-');
    const apiUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${encodedId}&format=png&scale=2`;
    // Step 1: Get the signed S3 image URL from Figma
    const imageUrl = await fetchImageUrl(apiUrl, token, encodedId);
    // Step 2: Download PNG to a temp file
    const tmpPath = path.join(os.tmpdir(), `blazemap-${fileKey}-${encodedId}.png`);
    await downloadFile(imageUrl, tmpPath);
    return tmpPath;
}
/**
 * Call Figma REST API to get the rendered image URL for a node.
 */
function fetchImageUrl(apiUrl, token, encodedId) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'X-Figma-Token': token },
        };
        https.get(apiUrl, options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk.toString(); });
            res.on('end', () => {
                var _a, _b, _c;
                if (res.statusCode !== 200) {
                    reject(new Error(`Figma API returned HTTP ${res.statusCode}: ${body}`));
                    return;
                }
                let parsed;
                try {
                    parsed = JSON.parse(body);
                }
                catch {
                    reject(new Error(`Failed to parse Figma API response: ${body}`));
                    return;
                }
                if (parsed.err) {
                    reject(new Error(`Figma API error: ${parsed.err}`));
                    return;
                }
                const imageUrl = (_b = (_a = parsed.images) === null || _a === void 0 ? void 0 : _a[encodedId]) !== null && _b !== void 0 ? _b : (_c = parsed.images) === null || _c === void 0 ? void 0 : _c[encodedId.replace('-', ':')];
                if (!imageUrl) {
                    reject(new Error(`No image URL returned for node ${encodedId}. Response: ${body}`));
                    return;
                }
                resolve(imageUrl);
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}
/**
 * Download a file from a URL to a local destination path.
 */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            // Handle redirects (S3 URLs may redirect)
            if (res.statusCode === 301 || res.statusCode === 302) {
                const redirectUrl = res.headers.location;
                if (!redirectUrl) {
                    reject(new Error('Redirect with no Location header'));
                    return;
                }
                file.close();
                downloadFile(redirectUrl, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download image: HTTP ${res.statusCode}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve()));
            file.on('error', (err) => {
                fs.unlink(dest, () => reject(err));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}
//# sourceMappingURL=figma-screenshot.js.map