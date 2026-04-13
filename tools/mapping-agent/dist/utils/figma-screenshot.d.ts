/**
 * figma-screenshot.ts
 *
 * Downloads a PNG screenshot of a Figma node via the Figma REST API.
 * Used by the CLI's --fetch-screenshot flag to auto-populate the screenshot
 * needed by the vision resolver.
 *
 * Requires FIGMA_TOKEN environment variable.
 */
/**
 * Fetch a PNG screenshot for a specific Figma node.
 *
 * @param fileKey  - Figma file key (from the URL)
 * @param nodeId   - Node ID in colon format, e.g. "3:1050"
 * @returns        - Absolute path to the downloaded temp PNG file
 */
export declare function fetchFigmaScreenshot(fileKey: string, nodeId: string): Promise<string>;
//# sourceMappingURL=figma-screenshot.d.ts.map