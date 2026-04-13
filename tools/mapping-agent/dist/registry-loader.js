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
exports.loadRegistry = loadRegistry;
exports.extendRegistry = extendRegistry;
exports.validateRegistry = validateRegistry;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const errors_1 = require("./errors");
const DEFAULT_REGISTRY_DIR = path.join(__dirname, 'registries');
function loadRegistry(registryDir) {
    var _a, _b;
    const dir = registryDir !== null && registryDir !== void 0 ? registryDir : DEFAULT_REGISTRY_DIR;
    const componentPath = path.join(dir, 'component-mappings.json');
    const tokenPath = path.join(dir, 'token-mappings.json');
    if (!fs.existsSync(componentPath)) {
        throw new errors_1.MappingError('REGISTRY_INVALID', `component-mappings.json not found at: ${componentPath}`);
    }
    if (!fs.existsSync(tokenPath)) {
        throw new errors_1.MappingError('REGISTRY_INVALID', `token-mappings.json not found at: ${tokenPath}`);
    }
    let compFile;
    let tokenFile;
    try {
        compFile = JSON.parse(fs.readFileSync(componentPath, 'utf-8'));
    }
    catch (e) {
        throw new errors_1.MappingError('REGISTRY_INVALID', `Failed to parse component-mappings.json: ${e}`);
    }
    try {
        tokenFile = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    }
    catch (e) {
        throw new errors_1.MappingError('REGISTRY_INVALID', `Failed to parse token-mappings.json: ${e}`);
    }
    return {
        version: compFile.version,
        components: (_a = compFile.entries) !== null && _a !== void 0 ? _a : [],
        tokens: (_b = tokenFile.entries) !== null && _b !== void 0 ? _b : [],
    };
}
function extendRegistry(base, extension) {
    var _a, _b, _c;
    const extComponents = (_a = extension.components) !== null && _a !== void 0 ? _a : [];
    const extTokens = (_b = extension.tokens) !== null && _b !== void 0 ? _b : [];
    const mergedComponents = mergeByKey(base.components, extComponents, 'figmaIdentifier');
    const mergedTokens = mergeByKey(base.tokens, extTokens, 'figmaVariable');
    return {
        version: (_c = extension.version) !== null && _c !== void 0 ? _c : base.version,
        components: mergedComponents,
        tokens: mergedTokens,
    };
}
function mergeByKey(base, extension, key) {
    const map = new Map();
    for (const item of base) {
        map.set(item[key], item);
    }
    for (const item of extension) {
        map.set(item[key], item); // overwrite matching keys
    }
    return Array.from(map.values());
}
function validateRegistry(registry) {
    var _a;
    const errors = [];
    const identifiers = new Set();
    for (const entry of registry.components) {
        if (!entry.figmaIdentifier) {
            errors.push(`Component entry missing figmaIdentifier`);
            continue;
        }
        if (identifiers.has(entry.figmaIdentifier)) {
            errors.push(`Duplicate figmaIdentifier: ${entry.figmaIdentifier}`);
        }
        identifiers.add(entry.figmaIdentifier);
        if (!entry.targetComponent) {
            errors.push(`${entry.figmaIdentifier}: missing targetComponent`);
        }
        if (!entry.importPath) {
            errors.push(`${entry.figmaIdentifier}: missing importPath`);
        }
        if (!entry.confidence) {
            errors.push(`${entry.figmaIdentifier}: missing confidence level`);
        }
        if (!((_a = entry.nodeTypes) === null || _a === void 0 ? void 0 : _a.length)) {
            errors.push(`${entry.figmaIdentifier}: nodeTypes must not be empty`);
        }
    }
    for (const token of registry.tokens) {
        if (!token.figmaVariable) {
            errors.push(`Token entry missing figmaVariable`);
        }
        if (!token.blazeCSSVar) {
            errors.push(`Token ${token.figmaVariable}: missing blazeCSSVar`);
        }
        if (!token.tokenType) {
            errors.push(`Token ${token.figmaVariable}: missing tokenType`);
        }
    }
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=registry-loader.js.map