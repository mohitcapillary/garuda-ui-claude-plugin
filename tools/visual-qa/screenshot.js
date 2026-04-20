#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  string: ['url', 'output', 'viewport', 'selector', 'auth-json', 'route-prefix'],
  boolean: ['full-page'],
  default: {
    viewport: '1440x900',
    selector: 'body',
    'wait-ms': 2000,
    'full-page': false,
  },
});

function printError(message, exitCode = 1) {
  process.stderr.write(JSON.stringify({ status: 'error', message }) + '\n');
  process.exit(exitCode);
}

function printOk(data) {
  process.stdout.write(JSON.stringify({ status: 'ok', ...data }) + '\n');
}

function parseViewport(viewportStr) {
  const [width, height] = viewportStr.split('x').map(Number);
  if (!width || !height || isNaN(width) || isNaN(height)) {
    printError(`Invalid --viewport format: "${viewportStr}". Expected WxH e.g. 1440x900`);
  }
  return { width, height };
}

async function main() {
  if (!args.url) printError('Missing required --url argument');
  if (!args.output) printError('Missing required --output argument');

  const viewport = parseViewport(args.viewport);
  const waitMs = parseInt(args['wait-ms'], 10) || 2000;
  const fullPage = args['full-page'];
  const outputPath = path.resolve(args.output);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const contextOptions = { viewport, deviceScaleFactor: 1 };

    // Inject localStorage entries BEFORE navigation to avoid timing issues
    if (args['auth-json']) {
      const authJsonPath = path.resolve(args['auth-json']);
      if (!fs.existsSync(authJsonPath)) {
        printError(`--auth-json file not found: ${authJsonPath}`);
      }
      let entries;
      try {
        entries = JSON.parse(fs.readFileSync(authJsonPath, 'utf8'));
      } catch {
        printError(`Could not parse --auth-json file: ${authJsonPath}`);
      }

      // Use addInitScript so localStorage is seeded before the page JS runs
      const context = await browser.newContext(contextOptions);
      await context.addInitScript((storageEntries) => {
        for (const entry of storageEntries) {
          try {
            localStorage.setItem(entry.name, entry.value);
          } catch {}
        }
      }, entries);

      const page = await context.newPage();
      await runCapture(page, args.url, args.selector, waitMs, args['route-prefix'], outputPath, fullPage);
    } else {
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();
      await runCapture(page, args.url, args.selector, waitMs, args['route-prefix'], outputPath, fullPage);
    }

    printOk({
      output: outputPath,
      url: args.url,
      viewport,
      authenticated: !!args['auth-json'],
    });
  } catch (err) {
    printError(err.message);
  } finally {
    if (browser) await browser.close();
  }
}

async function runCapture(page, url, selector, waitMs, routePrefix, outputPath, fullPage) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  // Fail-fast if the page redirected to login (auth failure)
  if (routePrefix) {
    const finalUrl = page.url();
    if (!finalUrl.includes(routePrefix)) {
      process.stderr.write(
        JSON.stringify({
          status: 'error',
          message: `Screenshot aborted: page redirected to "${finalUrl}". Expected URL to contain "${routePrefix}". Authentication may have failed.`,
        }) + '\n'
      );
      process.exit(2);
    }
  }

  // Wait for a meaningful element before capturing
  try {
    await page.waitForSelector(selector, { timeout: 30000 });
  } catch {
    // Non-fatal: proceed with screenshot even if selector not found
    process.stderr.write(
      JSON.stringify({ status: 'warn', message: `Selector "${selector}" not found within 30s — capturing anyway` }) + '\n'
    );
  }

  if (waitMs > 0) {
    await page.waitForTimeout(waitMs);
  }

  await page.screenshot({ path: outputPath, fullPage });
}

main();
