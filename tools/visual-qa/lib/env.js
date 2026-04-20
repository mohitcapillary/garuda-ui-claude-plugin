'use strict';

/**
 * env.js — shared .env loader for visual-qa tools
 *
 * Finds the project root (first parent with package.json), parses its .env,
 * and merges any discovered values into process.env so every script can read
 * them the normal way (process.env.FOO).
 *
 * .env format supported:
 *   export KEY=VALUE          ← shell-source style
 *   KEY=VALUE                 ← dotenv style
 *   KEY="quoted value"        ← double-quoted
 *   KEY='quoted value'        ← single-quoted
 *   # comment lines           ← ignored
 *   (empty lines)             ← ignored
 *
 * Usage:
 *   const { loadEnv, requireVar } = require('./lib/env');
 *   loadEnv();                              // call once at the top of each script
 *   const tok = requireVar('FIGMA_ACCESS_TOKEN', 'Figma personal access token');
 */

const fs   = require('fs');
const path = require('path');

/* ─── find project root ──────────────────────────────────────────────────── */

function findProjectRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/* ─── parse .env ─────────────────────────────────────────────────────────── */

function parseEnvFile(filePath) {
  const vars = {};
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return vars; // file doesn't exist or can't be read — silently skip
  }

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // strip leading "export " if present
    const stripped = line.replace(/^export\s+/, '');

    const eqIdx = stripped.indexOf('=');
    if (eqIdx === -1) continue;

    const key   = stripped.slice(0, eqIdx).trim();
    let   value = stripped.slice(eqIdx + 1).trim();

    // strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) vars[key] = value;
  }

  return vars;
}

/* ─── public API ─────────────────────────────────────────────────────────── */

let _envPath = null;

/**
 * Load .env from the project root into process.env.
 * Existing process.env values are NOT overwritten (shell > .env).
 * Safe to call multiple times (idempotent).
 */
function loadEnv() {
  if (_envPath !== null) return; // already loaded

  const root = findProjectRoot(path.resolve(__dirname, '..', '..', '..'));
  _envPath = root ? path.join(root, '.env') : null;

  if (!_envPath) {
    process.stderr.write('[env] Warning: could not find project root (no package.json found)\n');
    return;
  }

  const vars = parseEnvFile(_envPath);
  for (const [key, value] of Object.entries(vars)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * Get a required environment variable. If it is missing:
 *   - Prints a clear error to stderr
 *   - Shows the exact line to add to .env
 *   - Exits with the given exit code
 *
 * @param {string} name        - env var name, e.g. 'FIGMA_ACCESS_TOKEN'
 * @param {string} description - human-readable description for the error message
 * @param {string} [example]   - example value shown in .env snippet (optional)
 * @param {number} [exitCode]  - process exit code (default 3)
 * @returns {string}           - the value (guaranteed non-empty)
 */
function requireVar(name, description, example, exitCode = 3) {
  const value = process.env[name];
  if (value && value.trim()) return value.trim();

  const envLine    = example ? `${name}=${example}` : `${name}=<your-${name.toLowerCase().replace(/_/g, '-')}>`;
  const envDisplay = _envPath || '.env (project root)';

  process.stderr.write('\n');
  process.stderr.write(`✗ Missing required variable: ${name}\n`);
  process.stderr.write(`  ${description}\n`);
  process.stderr.write('\n');
  process.stderr.write(`  Add the following line to ${envDisplay}:\n`);
  process.stderr.write(`\n`);
  process.stderr.write(`    export ${envLine}\n`);
  process.stderr.write('\n');
  process.exit(exitCode);
}

/**
 * Get an optional environment variable. Returns the value or undefined.
 */
function getVar(name) {
  const value = process.env[name];
  return (value && value.trim()) ? value.trim() : undefined;
}

/**
 * Returns the resolved path to the .env file being used (after loadEnv()).
 */
function getEnvPath() {
  return _envPath;
}

module.exports = { loadEnv, requireVar, getVar, getEnvPath };
