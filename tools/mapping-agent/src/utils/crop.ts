import * as fs from 'fs';

import { FigmaBoundingBox } from '../types';

/**
 * Crops a rectangular region from a full-page screenshot PNG.
 * Uses sharp (optional peer dependency) — returns null if sharp is not installed
 * or if the bounding box is outside the image bounds.
 *
 * The scale parameter handles Retina/2x screenshots where Figma coordinates
 * are in logical pixels but the PNG is 2x resolution.
 */
export async function cropNode(
  screenshotPath: string,
  box: FigmaBoundingBox,
  scale: number = 1
): Promise<Buffer | null> {
  if (!fs.existsSync(screenshotPath)) {
    return null;
  }

  // sharp is an optional dependency — gracefully skip if missing
  let sharp: typeof import('sharp');
  try {
    sharp = require('sharp');
  } catch {
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
    const imgWidth = metadata.width ?? 0;
    const imgHeight = metadata.height ?? 0;

    // Skip crop if region is outside image bounds
    if (left >= imgWidth || top >= imgHeight) return null;

    const safeWidth = Math.min(width, imgWidth - left);
    const safeHeight = Math.min(height, imgHeight - top);

    if (safeWidth <= 0 || safeHeight <= 0) return null;

    return await sharp(screenshotPath)
      .extract({ left, top, width: safeWidth, height: safeHeight })
      .png()
      .toBuffer();
  } catch (err) {
    console.warn(`[crop] Failed to crop node at (${left},${top}) ${width}x${height}: ${err}`);
    return null;
  }
}
