---
description: Run the Human-in-the-Loop Visual QA loop against an existing feature build — no codegen required. Compares live browser screenshot against Figma reference, classifies issues, and lets you approve/exclude/feedback before each fix batch. Max 5 iterations.
argument-hint: "<feature-slug> [--screen <name>] [--skip-diff] [--reset]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion, mcp__claude_ai_Figma__get_screenshot
---

Run the **Visual QA loop** against an existing feature build without re-running the full codegen pipeline.

## What it does

1. Reads existing checkpoints from `claudeOutput/build/<feature>/` — specifically `hld-parsed.json` and `layout-plan.json` (written by Phases 1–2 of `/hld-to-code`).
2. Extracts screen names, Figma node IDs, routes, and frame state hints from those files — no HLD file argument needed.
3. Runs the full Phase 7 Tier 3 Human-in-the-Loop loop:
   - **Credential pre-flight** → checks `FIGMA_ACCESS_TOKEN`, `GARUDA_USERNAME`, `GARUDA_PASSWORD`
   - **Auth** → runs `tools/visual-qa/login.js`, writes `visual-diff/auth.json`
   - **Dev server check** → starts `npm start` (nvm use 12) if port 3000 not already in use
   - **Figma reference download** → cached or fresh via `tools/visual-qa/figma-download.js`
   - **Frame state classification** → identifies interaction-state frames (open dropdowns, modals, hover states) to skip pixel diff on
   - **5-iteration loop** → screenshot → pixel diff → Claude vision classify → show findings → user approval → apply fixes

4. Writes `visual-qa-log.jsonl` and `visual-qa-report.md` to `claudeOutput/build/<feature>/`.
5. Does **NOT** modify any generated source files in `app/` without explicit user approval.

## Prerequisites

- `claudeOutput/build/<feature>/hld-parsed.json` must exist (run `/hld-to-code` first)
- `claudeOutput/build/<feature>/layout-plan.json` must exist
- `npm install` run inside `tools/visual-qa/` (Node 16+)
- Env vars set: `FIGMA_ACCESS_TOKEN`, `GARUDA_USERNAME`, `GARUDA_PASSWORD`
- Dev server runs on Node 12 (nvm): `nvm install 12` once

## Examples

```bash
# Run QA loop for a feature (uses existing build checkpoints — no codegen re-run)
/visual-qa benefits-listing

# Run QA loop for a single screen only
/visual-qa benefits-listing --screen BenefitsListPage

# Skip pixel diff — Claude vision classification only (faster; useful before npm install)
/visual-qa benefits-listing --skip-diff

# Discard prior visual-qa-log.jsonl and start fresh
/visual-qa benefits-listing --reset
```

## Independent script testing (terminal, no Claude)

Test each script before running the full loop:

```bash
cd tools/visual-qa

# 1. Auth
node login.js --output /tmp/auth.json

# 2. Download Figma reference
node figma-download.js --file-key <fileKey> --node-id 3:1022 --output /tmp/expected.png

# 3. Screenshot localhost
node screenshot.js \
  --url http://localhost:3000/benefits \
  --output /tmp/actual.png \
  --auth-json /tmp/auth.json

# 4. Pixel diff
node diff.js \
  --expected /tmp/expected.png \
  --actual /tmp/actual.png \
  --output /tmp/diff.png
```

Each script prints `{"status":"ok",...}` to stdout on success. All errors have explicit messages and distinct exit codes (1=general, 2=auth failure, 3=missing credentials).

## User interaction during the loop

Each iteration presents issues found and planned fixes before touching any file:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Visual QA — Iteration N of 5  |  <feature>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Pixel diff: X.XX% | Issues: C CRITICAL  M MAJOR  Mn MINOR

 [1] CRITICAL — description
     Fix planned: ...
     File: app/components/...
```

Options (combine freely):
- `approve` — apply all planned fixes, run next iteration
- `approve with feedback: <notes>` — apply fixes + your extra guidance
- `exclude <N>[,<M>]` — skip specific issue IDs
- `exclude <N> with note: <text>` — skip and record a reason in the report
- `mark interaction-state: <area>` — flag area as interaction state (skipped in all future iterations)
- `stop` — end loop now, write final report

## Outputs

| File | Location |
|------|----------|
| Per-iteration PNGs | `claudeOutput/build/<feature>/visual-diff/iteration-N-{actual,expected,diff}.png` |
| Auth tokens | `claudeOutput/build/<feature>/visual-diff/auth.json` (gitignored) |
| Iteration log (JSONL) | `claudeOutput/build/<feature>/visual-qa-log.jsonl` |
| QA report (Markdown) | `claudeOutput/build/<feature>/visual-qa-report.md` |
| Screenshot audit update | `claudeOutput/build/<feature>/screenshot-audit.md` (Tier 3 section updated) |

## Instructions

1. Parse `<feature-slug>` from the argument. If missing, ask the user for it.
2. Verify `claudeOutput/build/<feature>/hld-parsed.json` and `layout-plan.json` exist. If not, halt:
   > "Build checkpoints not found for `<feature>`. Run `/hld-to-code` first to generate them, then re-run `/visual-qa <feature>`."
3. If `--reset` flag present, delete `visual-qa-log.jsonl` if it exists.
4. Read `hld-parsed.json` to extract: screen names, Figma node IDs (`figmaNodeId`), routes (`route`), and `interactionStates` arrays.
5. Read `layout-plan.json` to extract: viewport dimensions, design token references.
6. Execute the full Phase 7 Tier 3 loop as defined in `.claude/agents/hld-to-code-agent.md` (Tier 3 section). All loop logic, credential checks, frame state classification, and user interaction follow that spec exactly.
7. If `--screen <name>` flag present, filter to only that screen throughout the loop.
8. If `--skip-diff` flag present, skip `tools/visual-qa/diff.js` step; run Claude vision classification directly on the screenshot vs cached Figma image using `Read` tool only (no pixel diff ratio).

### Classification rule — compare Figma scope only

**Only compare the region of the actual screenshot that corresponds to what the Figma frame shows.**

The actual screenshot is a full browser viewport — it includes platform chrome (top nav bar, sidebar, breadcrumbs, etc.) that is NOT part of the Figma design. These elements must be ignored entirely during comparison. Never flag platform chrome as an issue and never use it as a reference point for position checks.

How to identify the Figma scope in the actual screenshot:
- The Figma frame shows the **page content area only** (everything below the platform nav bar)
- Visually align the top-left of the Figma image to the first content element (e.g. the page title) in the actual screenshot
- Only elements within that bounded content region are in scope for comparison

### Classification rule — positional scan is mandatory

Before producing any issue JSON, run the **positional scan** for every horizontal row visible in the Figma reference:
1. List elements **left-to-right as seen in Figma**: e.g. `[Title] [Search] [|] [Filter]` … `[Action button]`
2. List elements **left-to-right as seen in actual** (within Figma scope only — ignore nav bar and platform chrome)
3. Compare order, grouping, and relative gaps — not just presence

> **Presence ≠ correct position.** An element that exists on screen but is in the wrong position is a **MAJOR** issue. Never mark an element ✓ solely because it appears somewhere on screen. Every mismatch in position, order, or grouping must be filed as an issue with `figmaPosition` and `actualPosition` fields.
