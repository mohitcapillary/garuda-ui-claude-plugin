import { FigmaNode } from '../types';
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
export declare function fingerprintNode(node: FigmaNode): string;
//# sourceMappingURL=fingerprint.d.ts.map