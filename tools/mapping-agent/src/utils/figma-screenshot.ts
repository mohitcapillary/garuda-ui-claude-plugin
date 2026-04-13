/**
 * figma-screenshot.ts
 *
 * Downloads a PNG screenshot of a Figma node via the Figma REST API.
 * Used by the CLI's --fetch-screenshot flag to auto-populate the screenshot
 * needed by the vision resolver.
 *
 * Requires FIGMA_TOKEN environment variable.
 */

import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Fetch a PNG screenshot for a specific Figma node.
 *
 * @param fileKey  - Figma file key (from the URL)
 * @param nodeId   - Node ID in colon format, e.g. "3:1050"
 * @returns        - Absolute path to the downloaded temp PNG file
 */
export async function fetchFigmaScreenshot(fileKey: string, nodeId: string): Promise<string> {
  const token = process.env.FIGMA_TOKEN;
  if (!token) throw new Error('FIGMA_TOKEN environment variable is not set');

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
function fetchImageUrl(apiUrl: string, token: string, encodedId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'X-Figma-Token': token },
    };

    https.get(apiUrl, options, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Figma API returned HTTP ${res.statusCode}: ${body}`));
          return;
        }

        let parsed: { images?: Record<string, string>; err?: string };
        try {
          parsed = JSON.parse(body) as typeof parsed;
        } catch {
          reject(new Error(`Failed to parse Figma API response: ${body}`));
          return;
        }

        if (parsed.err) {
          reject(new Error(`Figma API error: ${parsed.err}`));
          return;
        }

        const imageUrl = parsed.images?.[encodedId] ?? parsed.images?.[encodedId.replace('-', ':')];
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
function downloadFile(url: string, dest: string): Promise<void> {
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
