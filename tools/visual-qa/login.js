#!/usr/bin/env node
'use strict';

/**
 * Garuda Visual-QA login helper
 *
 * Auth flow (mirrors what the browser does):
 *   1. POST /arya/api/v1/auth/login  → base token (JWT orgID=0) + user object
 *   2. POST /arya/api/v1/auth/setProxy/:orgId  → confirm org context
 *      (the app sends X-CAP-API-AUTH-ORG-ID on every subsequent request)
 *   3. Writes localStorage entries: token, orgID, user, isLoggedIn
 *
 * Credentials are read from .env in the project root (see lib/env.js).
 * If a required var is missing from .env, the script prints exactly which line
 * to add and exits — it does NOT ask for values interactively.
 *
 * The only value that may be prompted interactively is --org-id, because it is
 * account-specific and cannot be known in advance.
 *
 * Usage:
 *   node login.js --output /path/to/auth.json [--org-id 12345]
 *
 * Required in .env:
 *   export GARUDA_USERNAME=you@example.com
 *   export GARUDA_PASSWORD=yourpassword
 *
 * The API base URL is read automatically from app-config.js (intouchBaseUrl).
 * GARUDA_BASE_URL in .env is used only for the screenshot step, NOT for login.
 *
 * Optional override:
 *   export GARUDA_API_URL=https://nightly.intouch.capillarytech.com
 *
 * Required in .env for multi-org accounts (orgID = 0 after login):
 *   export GARUDA_ORG_ID=12345
 *   Find yours: open localhost:8000 → DevTools Console → localStorage.getItem("orgID")
 */

const { loadEnv, requireVar, getVar } = require('./lib/env');
loadEnv(); // must be first — populates process.env from .env before anything else reads it

const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const minimist = require('minimist');

// Derive API base URL from app-config.js so it always matches what the app uses.
// Override with GARUDA_API_URL env var if needed.
function resolveApiBaseUrl() {
  const override = getVar('GARUDA_API_URL');
  if (override) return override;
  try {
    const appConfig = require(path.resolve(__dirname, '..', '..', 'app-config.js'));
    if (appConfig.intouchBaseUrl) return `https://${appConfig.intouchBaseUrl}`;
  } catch { /* ignore — app-config.js not found */ }
  return 'https://nightly.intouch.capillarytech.com';
}

const args = minimist(process.argv.slice(2), {
  string: ['output', 'org-id'],
});

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function printError(message, exitCode = 1) {
  process.stderr.write(JSON.stringify({ status: 'error', message }) + '\n');
  process.exit(exitCode);
}

function printOk(data) {
  process.stdout.write(JSON.stringify({ status: 'ok', ...data }) + '\n');
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

function httpRequest(baseUrl, urlPath, method, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(baseUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const port    = parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80);
    const payload = body ? JSON.stringify(body) : '';

    const options = {
      hostname: parsed.hostname,
      port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...extraHeaders,
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error(`Request timed out — is the server reachable at ${baseUrl}?`));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

function parseJsonBody(res, label) {
  try {
    return JSON.parse(res.body);
  } catch {
    printError(`Could not parse ${label} response as JSON: ${res.body.slice(0, 200)}`);
  }
}

/* ─── step 1: login ───────────────────────────────────────────────────────── */

async function doLogin(baseUrl, username, password) {
  let res;
  try {
    res = await httpRequest(baseUrl, '/arya/api/v1/auth/login', 'POST', { username, password });
  } catch (err) {
    printError(`Login request failed: ${err.message}`, 1);
  }

  if (res.statusCode === 401 || res.statusCode === 403) {
    printError(`Login failed (HTTP ${res.statusCode}): invalid credentials`, 2);
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    printError(`Login returned unexpected status ${res.statusCode}: ${res.body}`, 1);
  }

  const json = parseJsonBody(res, 'login');

  if (!json.success) {
    printError(`Login endpoint reported failure: ${json.message || JSON.stringify(json)}`);
  }

  const token = json.token || json.authToken || json.data?.token || json.data?.authToken;
  if (!token) {
    printError(
      `Login succeeded (HTTP ${res.statusCode}) but no token found. ` +
      `Response keys: ${Object.keys(json).join(', ')}`
    );
  }

  return { token, user: json.user || {} };
}

/* ─── step 2: setProxy ────────────────────────────────────────────────────── */

async function doSetProxy(baseUrl, token, orgId) {
  let res;
  try {
    res = await httpRequest(
      baseUrl,
      `/arya/api/v1/auth/setProxy/${orgId}`,
      'POST',
      null,
      {
        'Authorization': `Bearer ${token}`,
        'X-CAP-API-AUTH-ORG-ID': String(orgId),
      }
    );
  } catch (err) {
    printError(`setProxy request failed: ${err.message}`, 1);
  }

  if (res.statusCode === 403) {
    printError(
      `setProxy returned 403 for orgId=${orgId}. ` +
      `The org may not exist on this server, or your account lacks access to it.\n` +
      `Check the orgId by running in your browser console: localStorage.getItem("orgID")`,
      2
    );
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    printError(`setProxy returned unexpected status ${res.statusCode}: ${res.body.slice(0, 300)}`, 1);
  }

  const json = parseJsonBody(res, 'setProxy');
  // setProxy may return a refreshed token — use it if present, otherwise keep original
  const newToken = json.token || json.authToken || json.data?.token;
  return { token: newToken || token, success: json.success !== false };
}

/* ─── main ────────────────────────────────────────────────────────────────── */

async function main() {
  if (!args.output) printError('Missing required --output argument');

  // ── Credentials from .env (requireVar exits with a clear message if missing)
  const username = requireVar(
    'GARUDA_USERNAME',
    'Your Garuda login email address.',
    'you@example.com'
  );
  const password = requireVar(
    'GARUDA_PASSWORD',
    'Your Garuda login password.',
    'yourpassword'
  );

  const baseUrl    = resolveApiBaseUrl();
  const outputPath = path.resolve(args.output);

  // ── Step 1: login ──────────────────────────────────────────────────────────
  process.stderr.write(`→ Logging in to ${baseUrl} …\n`);
  const { token: baseToken, user } = await doLogin(baseUrl, username, password);

  // ── Resolve orgId: CLI flag > .env/env var > login response ──────────────
  let orgId = args['org-id'] || getVar('GARUDA_ORG_ID') || '';

  if (!orgId && user.orgID && Number(user.orgID) !== 0) {
    // Single-org account: login response carries the org — no setProxy needed
    orgId = String(user.orgID);
    process.stderr.write(`→ Using orgId=${orgId} from login response\n`);
  }

  if (!orgId || orgId === '0') {
    // Multi-org account: GARUDA_ORG_ID must be set in .env
    process.stderr.write('\n');
    process.stderr.write('✗ Missing required variable: GARUDA_ORG_ID\n');
    process.stderr.write('  Your account has no default org (orgID = 0 after login).\n');
    process.stderr.write('\n');
    process.stderr.write('  How to find your orgId:\n');
    process.stderr.write('  1. Open http://localhost:8000 in Chrome and log in normally\n');
    process.stderr.write('  2. Open DevTools → Console and run:\n');
    process.stderr.write('       localStorage.getItem("orgID")\n');
    process.stderr.write('\n');
    process.stderr.write('  Then add the following line to .env:\n');
    process.stderr.write('\n');
    process.stderr.write('    export GARUDA_ORG_ID=<your-org-id>\n');
    process.stderr.write('\n');
    process.exit(3);
  }

  // ── Step 2: setProxy ───────────────────────────────────────────────────────
  process.stderr.write(`→ Setting org context (setProxy/${orgId}) …\n`);
  const { token: finalToken } = await doSetProxy(baseUrl, baseToken, orgId);

  // ── Step 3: write auth.json ────────────────────────────────────────────────
  //
  // The app uses localStorageApi (vulcan SDK) which always calls JSON.stringify
  // on save and JSON.parse on load. So every value stored in localStorage is
  // JSON-encoded — even strings get an extra layer of quotes, e.g.:
  //   saveItem('token', 'eyJ...') → localStorage['token'] = '"eyJ..."'
  //   loadItem('token')           → JSON.parse('"eyJ..."') → 'eyJ...'
  //
  // screenshot.js injects these via localStorage.setItem(name, value) directly,
  // so we must pre-encode the values the same way localStorageApi would.
  //
  const numericOrgId = Number(orgId);
  const entries = [
    { name: 'token',      value: JSON.stringify(finalToken) },
    { name: 'orgID',      value: JSON.stringify(isNaN(numericOrgId) ? orgId : numericOrgId) },
    { name: 'user',       value: JSON.stringify(user) },
    { name: 'isLoggedIn', value: JSON.stringify(true) },
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2), 'utf8');

  process.stderr.write(`→ Auth written to ${outputPath}\n`);
  printOk({ output: outputPath, orgId, entriesWritten: entries.length });
}

main();
