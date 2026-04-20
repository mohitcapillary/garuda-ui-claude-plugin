#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const sharp = require('sharp');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  string: ['expected', 'actual', 'output'],
  default: { threshold: 0.1 },
});

function printError(message, exitCode = 1) {
  process.stderr.write(JSON.stringify({ status: 'error', message }) + '\n');
  process.exit(exitCode);
}

function printOk(data) {
  process.stdout.write(JSON.stringify({ status: 'ok', ...data }) + '\n');
}

function readPng(filePath) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(filePath);
    const png = PNG.sync.read(data);
    resolve(png);
  });
}

async function normalizeDimensions(expectedPng, actualPath) {
  const { width: ew, height: eh } = expectedPng;

  // Read actual PNG to check dimensions
  const actualData = fs.readFileSync(actualPath);
  const actualPng = PNG.sync.read(actualData);
  const { width: aw, height: ah } = actualPng;

  if (aw === ew && ah === eh) {
    return { png: actualPng, resized: false };
  }

  // Dimensions differ — resize actual to match expected using sharp
  // fit: contain + white background preserves aspect ratio without distortion
  const resizedBuffer = await sharp(actualPath)
    .resize(ew, eh, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const resizedPng = PNG.sync.read(resizedBuffer);
  process.stdout.write(
    JSON.stringify({ resized: true, from: { w: aw, h: ah }, to: { w: ew, h: eh } }) + '\n'
  );

  return { png: resizedPng, resized: true };
}

async function main() {
  if (!args.expected) printError('Missing required --expected argument');
  if (!args.actual) printError('Missing required --actual argument');
  if (!args.output) printError('Missing required --output argument');

  const expectedPath = path.resolve(args.expected);
  const actualPath = path.resolve(args.actual);
  const outputPath = path.resolve(args.output);
  const threshold = parseFloat(args.threshold) || 0.1;

  if (!fs.existsSync(expectedPath)) printError(`--expected file not found: ${expectedPath}`);
  if (!fs.existsSync(actualPath)) printError(`--actual file not found: ${actualPath}`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let expectedPng;
  try {
    expectedPng = await readPng(expectedPath);
  } catch (err) {
    printError(`Could not read --expected PNG: ${err.message}`);
  }

  let actualPng;
  try {
    const result = await normalizeDimensions(expectedPng, actualPath);
    actualPng = result.png;
  } catch (err) {
    printError(`Could not normalize image dimensions: ${err.message}`);
  }

  const { width, height } = expectedPng;
  const totalPixels = width * height;

  // Create output diff PNG
  const diffPng = new PNG({ width, height });

  let diffPixels;
  try {
    diffPixels = pixelmatch(
      expectedPng.data,
      actualPng.data,
      diffPng.data,
      width,
      height,
      {
        threshold,
        includeAA: false, // skip anti-aliasing pixels to avoid font rendering false positives
      }
    );
  } catch (err) {
    printError(`pixelmatch failed: ${err.message}`);
  }

  // Write diff PNG
  try {
    fs.writeFileSync(outputPath, PNG.sync.write(diffPng));
  } catch (err) {
    printError(`Could not write diff PNG to ${outputPath}: ${err.message}`);
  }

  const diffRatio = totalPixels > 0 ? diffPixels / totalPixels : 0;

  // Exit 0 regardless of diff ratio — the agent decides pass/fail
  printOk({
    diffPixels,
    totalPixels,
    diffRatio: parseFloat(diffRatio.toFixed(6)),
    diffPercent: parseFloat((diffRatio * 100).toFixed(2)),
    output: outputPath,
    dimensions: { width, height },
    threshold,
  });
}

main();
