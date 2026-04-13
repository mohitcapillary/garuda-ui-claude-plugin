import { FigmaBoundingBox } from '../types';
/**
 * Crops a rectangular region from a full-page screenshot PNG.
 * Uses sharp (optional peer dependency) — returns null if sharp is not installed
 * or if the bounding box is outside the image bounds.
 *
 * The scale parameter handles Retina/2x screenshots where Figma coordinates
 * are in logical pixels but the PNG is 2x resolution.
 */
export declare function cropNode(screenshotPath: string, box: FigmaBoundingBox, scale?: number): Promise<Buffer | null>;
//# sourceMappingURL=crop.d.ts.map