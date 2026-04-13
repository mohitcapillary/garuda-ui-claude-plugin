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
exports.writeRecipe = writeRecipe;
exports.writeTokenMap = writeTokenMap;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '../../../../.claude/output/figma-blazeui-mapping');
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
/**
 * Write a ConversionRecipe to <outputDir>/<nodeId>.recipe.json.
 * Returns the absolute path of the written file.
 */
function writeRecipe(recipe, outputDir) {
    const dir = outputDir !== null && outputDir !== void 0 ? outputDir : DEFAULT_OUTPUT_DIR;
    ensureDir(dir);
    const nodeId = recipe.root.figmaNodeId.replace(':', '-');
    const filePath = path.join(dir, `${nodeId}.recipe.json`);
    fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2), 'utf-8');
    return filePath;
}
/**
 * Write a TokenResolutionMap to <outputDir>/token-map.json.
 * Returns the absolute path of the written file.
 */
function writeTokenMap(tokenMap, outputDir) {
    const dir = outputDir !== null && outputDir !== void 0 ? outputDir : DEFAULT_OUTPUT_DIR;
    ensureDir(dir);
    const filePath = path.join(dir, 'token-map.json');
    fs.writeFileSync(filePath, JSON.stringify(tokenMap, null, 2), 'utf-8');
    return filePath;
}
//# sourceMappingURL=output-writer.js.map