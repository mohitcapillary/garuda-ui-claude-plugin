---
name: figma-to-component
description: >
  Convert a Figma node into a Cap-UI / blaze-ui React component.
  Supports orchestration-mode flags so hld-to-code-agent can delegate
  per-screen UI generation to this agent.
agent: figma-to-component-agent
user_invocable: true
---

# figma-to-component

Convert a Figma design node into a production-ready Cap-UI React component.

## Usage

```
/figma-to-component <figma-url> [--vision] [--route] [orchestration flags...]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<figma-url>` | Yes | Figma design URL (`https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>`) |
| `--vision` | No | Enable visual resolution of UNMAPPED nodes via screenshot |
| `--route` | No | Also generate `Loadable.js`, `index.js`, and `routes.js` entry |

## Orchestration Flags (used by hld-to-code-agent)

| Flag | Effect |
|------|--------|
| `--target-path <dir>` | Write generated files into `<dir>` instead of default location |
| `--target-component-name <Name>` | Name the root component `<Name>` (PascalCase) |
| `--target-library cap-ui-library` | Target `@capillarytech/cap-ui-library` (default) |
| `--decomposition <json-path>` | JSON file describing how to split the node into multiple files per atomic tier |
| `--component-plan <path>` | **MANDATORY in orchestration mode** — carries HLD Reviewer Overrides and typography-rule decisions. Without it, overrides are silently dropped |
| `--omit-redux-wiring` | Don't emit connect/injectReducer/injectSaga; orchestrator adds those |
| `--omit-route-registration` | Don't modify `routes.js`; orchestrator owns routing |
| `--emit-callback-stubs` | Emit `/* HANDLER: <description> */` markers for orchestrator to fill |
| `--skip-plan-confirmation` | Bypass Phase 3 user confirmation; emit `ui-generation-manifest.json` at end of Phase 4 |

## Examples

```bash
# Basic standalone conversion
/figma-to-component https://www.figma.com/design/ABC123/...?node-id=1-2117

# With visual resolution
/figma-to-component https://www.figma.com/design/ABC123/...?node-id=1-2117 --vision

# Orchestration mode (invoked by hld-to-code Phase 5a)
/figma-to-component https://www.figma.com/design/ABC123/File?node-id=123-5146 --target-path /path/to/target-repo/app/components/pages/BenefitsListing/ --target-component-name BenefitsListing --target-library cap-ui-library --decomposition /path/to/decomposition.json --component-plan /path/to/component-plan.json --omit-redux-wiring --omit-route-registration --emit-callback-stubs --skip-plan-confirmation
```

## What it does (5 phases)

| Phase | What happens |
|-------|-------------|
| 1. Understand | Fetches screenshot, metadata XML, and design context from Figma |
| 2. Map | Runs mapping agent CLI -> recipe.json, looks up prop-spec.json + token-mappings.json, resolves UNMAPPED nodes |
| 3. Plan | Prints a build plan and waits for confirmation (skipped in orchestration mode) |
| 4. Generate | Writes the component file(s) bottom-up using prop-spec + tokens; splits if >450 lines |
| 5. Audit | Verifies Cap* preferred; raw HTML wrapped in styled(); styled HTML justified with comments |

## Orchestration Mode Behavior

When **any orchestration flag** is set, the agent:
1. Runs Phases 1-2 **silently** (no interactive narration)
2. **Skips Phase 3** user confirmation (hld-to-code already confirmed in its Phase 2.5)
3. Respects `--target-path` and `--decomposition` during Phase 4
4. Emits `<target-path>/ui-generation-manifest.json` — this is the **contract** that hld-to-code Phase 5c depends on

The manifest includes: `filesWritten`, `propsRequired`, `callbackSlots`, `stringSlots`, `tokensUsed`, `bespokeFiles`, `layoutSummary`.

## Output

| Artifact | Location |
|----------|----------|
| Recipe JSON | `claudeOutput/figma-capui-mapping/<nodeId>.recipe.json` |
| Component files | `app/components/<tier>/<ComponentName>/` |
| Manifest (orchestration) | `<target-path>/ui-generation-manifest.json` |
