---
description: Compile the target garuda-ui project and auto-fix generated-code errors. Optional runtime smoke check verifies the route actually renders. Max 3 retry attempts.
argument-hint: "<feature-slug> [--skip-runtime-check] [--build-command <cmd>]"
allowed-tools: Bash, Read, Edit, Write, Agent, AskUserQuestion
---

Run the **build-verifier** agent to compile the target garuda-ui project after `/hld-to-code` has written generated code, catch errors, and auto-fix what is fixable.

## Instructions

1. Read and follow `.claude/agents/build-verifier.md`.
2. If `<feature-slug>` is not provided, ask the user for it.
3. Verify `claudeOutput/build/<feature>/build-log.jsonl` exists (written by `/hld-to-code`). If not, halt and instruct the user to run `/hld-to-code` first.
4. Execute Steps 1–7 in order.
5. Halt immediately on any ambiguity using `AskUserQuestion`; do not guess fixes.

## Examples

```bash
# Standard compile + runtime check
/build-verify benefits-listing

# Compile only — skip runtime smoke check (faster; dev server not needed)
/build-verify benefits-listing --skip-runtime-check

# Use a custom build command
/build-verify benefits-listing --build-command "npx webpack --mode production"
```

## What it does

| Step | Action |
|---|---|
| 1. Read generated set | Parse `build-log.jsonl` for files with `status:written` |
| 2. Build (attempt 1) | `nvm use 12 && npx webpack --mode development` or `npm start` |
| 3. Parse errors | Categorize (import/syntax/module/other) and classify generated vs pre-existing |
| 4. Auto-fix | Fix generated-code errors surgically via `Edit` |
| 5. Retry | Up to 3 total attempts; halt on persistent same error |
| 6. Runtime smoke check | Navigate to route via Playwright; detect error boundaries, chunks, crashes |
| 7. Write report | `build-report.json` validated against the schema (hard halt on schema fail) |

## Prerequisites

- `claudeOutput/build/<feature>/build-log.jsonl` exists (run `/hld-to-code` first)
- Node 12 available via `nvm` for the dev server (garuda-ui constraint)
- For runtime check: dev server running OR tool starts it, plus `FIGMA_ACCESS_TOKEN`/`GARUDA_USERNAME`/`GARUDA_PASSWORD` if auth-gated routes
- `app/services/api.js`, `app/config/endpoints.js` exist in target (same as `/hld-to-code`)

## Outputs

| Artifact | Location |
|---|---|
| Machine-readable report | `claudeOutput/build/<feature>/build-report.json` |
| Runtime-check screenshot | `claudeOutput/build/<feature>/runtime-check.png` (if Step 6 ran) |
| Auth token cache | `claudeOutput/build/<feature>/visual-diff/auth.json` (gitignored) |

## Status summary

On completion prints one line: `▶ build-verify: <feature> — status=<pass|fail> attempts=<N> errors_remaining=<M> fixes_applied=<K>`.

## When NOT to use

- Before `/hld-to-code` runs (there's nothing to verify)
- On repos without Node 12 available (garuda-ui requires Node 12 for webpack)
- For test coverage checks — use `/test-eval` after `/write-tests`
