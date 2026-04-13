import * as crypto from 'crypto';

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
export function fingerprintNode(node: FigmaNode): string {
  const childTypes = (node.children ?? []).map((c) => c.type).join(',');
  const childNames = (node.children ?? [])
    .map((c) => c.name.toLowerCase().replace(/\s+/g, '').slice(0, 12))
    .join(',');

  const parts = [
    node.type,
    node.layoutMode ?? 'NONE',
    String(node.children?.length ?? 0),
    childTypes,
    childNames,
    String(Math.round((node.absoluteBoundingBox?.width ?? 0) / 100) * 100), // bucket to 100px
    String(Math.round((node.absoluteBoundingBox?.height ?? 0) / 50) * 50),  // bucket to 50px
  ];

  return crypto
    .createHash('md5')
    .update(parts.join('|'))
    .digest('hex')
    .slice(0, 12);
}
