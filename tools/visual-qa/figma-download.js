#!/usr/bin/env node
'use strict';

/**
 * Downloads a Figma node as a PNG for use as the visual-QA reference image.
 *
 * FIGMA_ACCESS_TOKEN is read from .env in the project root (see lib/env.js).
 * If it is missing the script prints exactly which line to add and exits.
 *
 * Usage:
 *   node figma-download.js --file-key <key> --node-id <id> --output <path>
 *
 * Required in .env:
 *   export FIGMA_ACCESS_TOKEN=figd_...
 *
 * Get your token at: Figma → Settings → Security → Personal access tokens
 */

const { loadEnv, requireVar } = require('./lib/env');
loadEnv(); // must be first — populates process.env from .env

const https    = require('https');
const fs       = require('fs');
const path     = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  string: ['file-key', 'node-id', 'output'],
  default: { scale: 2 },
});

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function printError(message, exitCode = 1) {
  process.stderr.write(JSON.stringify({ status: 'error', message }) + '\n');
  process.exit(exitCode);
}

function printOk(data) {
  process.stdout.write(JSON.stringify({ status: 'ok', ...data }) + '\n');
}

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location, headers).then(resolve).catch(reject);
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out after 30s'));
    });
  });
}

function httpsGetJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    httpsGet(url, headers).then((res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Could not parse JSON response: ${data.slice(0, 200)}`));
        }
      });
    }).catch(reject);
  });
}

function streamToFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    httpsGet(url).then((res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} downloading image`));
        return;
      }
      const file = fs.createWriteStream(outputPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err) => { fs.unlink(outputPath, () => {}); reject(err); });
    }).catch(reject);
  });
}

/* ─── main ────────────────────────────────────────────────────────────────── */

async function main() {
  const fileKey = args['file-key'];
  const nodeId  = args['node-id'];
  const output  = args.output;
  const scale   = parseFloat(args.scale) || 2;

  if (!fileKey) printError('Missing required --file-key argument');
  if (!nodeId)  printError('Missing required --node-id argument');
  if (!output)  printError('Missing required --output argument');

  // Read from .env — exits with a clear "add this to .env" message if missing
  const figmaToken = requireVar(
    'FIGMA_ACCESS_TOKEN',
    'Figma personal access token. Get one at: Figma → Settings → Security → Personal access tokens',
    'figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );

  // Figma REST API expects node IDs with hyphens (24-2729), not colons (24:2729)
  const nodeIdHyphen = nodeId.replace(':', '-');
  const apiUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIdHyphen}&format=png&scale=${scale}`;

  let apiResponse;
  try {
    apiResponse = await httpsGetJson(apiUrl, { 'X-Figma-Token': figmaToken });
  } catch (err) {
    if (err.message.includes('403')) {
      printError(
        'Figma API returned 403 — FIGMA_ACCESS_TOKEN is invalid or lacks read access to this file.\n' +
        'Regenerate your token at: Figma → Settings → Security → Personal access tokens',
        1
      );
    }
    printError(`Figma API request failed: ${err.message}`, 1);
  }

  if (apiResponse.err) {
    printError(`Figma API error: ${apiResponse.err}`, 1);
  }

  const images   = apiResponse.images || {};
  const imageUrl = images[nodeId] || images[nodeIdHyphen];

  if (!imageUrl) {
    printError(
      `Node "${nodeId}" not found in Figma response. ` +
      `Available node IDs: ${Object.keys(images).join(', ') || '(none)'}. ` +
      `The node may be hidden, deleted, or the file key may be wrong.`,
      1
    );
  }

  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    await streamToFile(imageUrl, outputPath);
  } catch (err) {
    printError(`Failed to download image from Figma CDN: ${err.message}`, 1);
  }

  printOk({ output: outputPath, nodeId, scale });
}

main();
