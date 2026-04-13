"use strict";
/**
 * antd-type-reader.ts
 *
 * Reads antd TypeScript .d.ts files and extracts prop interface definitions
 * for a given antd component name. Used by the prop-spec generator to build
 * accurate prop documentation for Cap* wrapper components.
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
exports.readAntdComponentSpec = readAntdComponentSpec;
exports.getSupportedAntdComponents = getSupportedAntdComponents;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Maps antd exported component names to candidate .d.ts locations.
 * Multiple candidates are tried in order; first that exists wins.
 */
const ANTD_DTS_CANDIDATES = {
    Row: ['grid/row.d.ts'],
    Col: ['grid/col.d.ts'],
    Button: ['button/button.d.ts'],
    Table: ['table/interface.d.ts', 'table/Table.d.ts', 'table/index.d.ts'],
    Modal: ['modal/Modal.d.ts', 'modal/index.d.ts'],
    Input: ['input/Input.d.ts', 'input/index.d.ts'],
    Select: ['select/index.d.ts', 'select/Select.d.ts'],
    Checkbox: ['checkbox/Checkbox.d.ts'],
    Radio: ['checkbox/Checkbox.d.ts', 'radio/interface.d.ts', 'radio/radio.d.ts', 'radio/index.d.ts'],
    Switch: ['switch/index.d.ts'],
    Tooltip: ['tooltip/index.d.ts'],
    Tabs: ['tabs/index.d.ts'],
    Card: ['card/index.d.ts'],
    Dropdown: ['dropdown/dropdown.d.ts', 'dropdown/index.d.ts'],
    Divider: ['divider/index.d.ts'],
    Spin: ['spin/index.d.ts'],
    Tag: ['tag/index.d.ts'],
    Skeleton: ['skeleton/index.d.ts'],
    Steps: ['steps/index.d.ts'],
    Slider: ['slider/index.d.ts'],
    DatePicker: ['date-picker/index.d.ts'],
    TimePicker: ['time-picker/index.d.ts'],
    TreeSelect: ['tree-select/index.d.ts'],
    Tree: ['tree/index.d.ts'],
    Drawer: ['drawer/index.d.ts'],
    Avatar: ['avatar/index.d.ts'],
    Badge: ['badge/index.d.ts'],
    Alert: ['alert/index.d.ts'],
    Collapse: ['collapse/Collapse.d.ts', 'collapse/index.d.ts'],
    Upload: ['upload/index.d.ts'],
    Menu: ['menu/index.d.ts'],
    Form: ['form/Form.d.ts', 'form/index.d.ts'],
    Anchor: ['anchor/Anchor.d.ts', 'anchor/index.d.ts'],
    List: ['list/index.d.ts'],
    Popover: ['popover/index.d.ts'],
    Progress: ['progress/index.d.ts'],
    Carousel: ['carousel/index.d.ts'],
    Icon: ['icon/index.d.ts'],
};
/** Maps antd component name to its primary interface name in the .d.ts */
const INTERFACE_NAME_MAP = {
    Row: 'RowProps',
    Col: 'ColProps',
    Button: 'BaseButtonProps',
    Table: 'TableProps',
    Modal: 'ModalProps',
    Input: 'InputProps',
    Select: 'SelectProps',
    Checkbox: 'AbstractCheckboxProps',
    Radio: 'AbstractCheckboxProps',
    Switch: 'SwitchProps',
    Tooltip: 'TooltipProps',
    Tabs: 'TabsProps',
    Card: 'CardProps',
    Dropdown: 'DropDownProps',
    Divider: 'DividerProps',
    Spin: 'SpinProps',
    Tag: 'TagProps',
    Skeleton: 'SkeletonProps',
    Drawer: 'DrawerProps',
    Form: 'FormProps',
    Anchor: 'AnchorProps',
    Collapse: 'CollapseProps',
    List: 'ListProps',
    Popover: 'PopoverProps',
    Progress: 'ProgressProps',
    Icon: 'IconProps',
};
/**
 * Resolve the path to the antd .d.ts file for a given component.
 */
function resolveAntdDtsPath(antdLibPath, componentName) {
    const candidates = ANTD_DTS_CANDIDATES[componentName];
    if (!candidates)
        return null;
    for (const candidate of candidates) {
        const full = path.join(antdLibPath, candidate);
        if (fs.existsSync(full))
            return full;
    }
    return null;
}
/**
 * Extract all prop definitions from a TypeScript interface block.
 * Handles optional props (?) and inline comments (/** ... *\/).
 */
function parseInterfaceBlock(content, interfaceName) {
    const props = {};
    // Match the interface block (handles extends and generics).
    // The closing `}` must be at the start of a line (no indentation) to avoid
    // matching nested type objects like `scroll?: { x?: ...; y?: ...; };`
    const interfaceRegex = new RegExp(`export\\s+(?:declare\\s+)?interface\\s+${interfaceName}\\s*(?:<[^>]+>)?(?:\\s+extends[^{]+)?\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
    const match = content.match(interfaceRegex);
    if (!match)
        return props;
    const block = match[1];
    const lines = block.split('\n');
    let pendingComment = '';
    for (const rawLine of lines) {
        const line = rawLine.trim();
        // Capture JSDoc/inline comments
        const commentMatch = line.match(/\/\*\*?\s*(.+?)\s*\*?\//);
        if (commentMatch) {
            pendingComment = commentMatch[1].replace(/\*/g, '').trim();
            continue;
        }
        // Match prop line: propName?: type; or propName: type;
        const propMatch = line.match(/^(\w+)(\??):\s*(.+?);?\s*$/);
        if (!propMatch) {
            pendingComment = '';
            continue;
        }
        const [, name, optional, rawType] = propMatch;
        if (name === 'prefixCls') {
            pendingComment = '';
            continue;
        } // skip internal
        const type = rawType.trim().replace(/\s+/g, ' ');
        // Extract enum values from union types like "\"a\" | \"b\" | \"c\""
        const values = extractEnumValues(type);
        props[name] = {
            type,
            required: optional !== '?',
            description: pendingComment || undefined,
            values: values.length > 1 ? values : undefined,
        };
        pendingComment = '';
    }
    return props;
}
/**
 * Extract string literal union values from a TypeScript type string.
 * e.g. '"start" | "end" | "center"' → ['start', 'end', 'center']
 */
function extractEnumValues(type) {
    const matches = type.matchAll(/"([^"]+)"/g);
    return Array.from(matches, (m) => m[1]);
}
/**
 * Read and parse the antd .d.ts for a given component name.
 * Returns null if the component is not found or not supported.
 */
function readAntdComponentSpec(antdLibPath, componentName) {
    var _a;
    const dtspath = resolveAntdDtsPath(antdLibPath, componentName);
    if (!dtspath)
        return null;
    let content;
    try {
        content = fs.readFileSync(dtspath, 'utf-8');
    }
    catch {
        return null;
    }
    const interfaceName = (_a = INTERFACE_NAME_MAP[componentName]) !== null && _a !== void 0 ? _a : `${componentName}Props`;
    const props = parseInterfaceBlock(content, interfaceName);
    if (Object.keys(props).length === 0)
        return null;
    return { componentName, interfaceName, dtspath, props };
}
/**
 * Returns the list of antd component names this module knows about.
 */
function getSupportedAntdComponents() {
    return Object.keys(ANTD_DTS_CANDIDATES);
}
//# sourceMappingURL=antd-type-reader.js.map