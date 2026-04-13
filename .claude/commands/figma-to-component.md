---
description: Convert a Figma node into a Cap-UI / blaze-ui React component. Supports orchestration-mode flags so hld-to-code-agent can delegate per-screen UI generation to this agent
argument-hint: "<figma-url> [--vision] [--route] [--target-path <dir>] [--target-component-name <Name>] [--decomposition <json>] [--omit-redux-wiring] [--omit-route-registration] [--emit-callback-stubs] [--skip-plan-confirmation]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Agent, mcp__claude_ai_Figma__get_screenshot, mcp__claude_ai_Figma__get_metadata, mcp__claude_ai_Figma__get_design_context, mcp__claude_ai_Figma__get_variable_defs
---

Use the **figma-to-component** agent to convert a Figma design node into a blaze-ui React component.

## Instructions

1. Read and follow the full agent definition at `.claude/agents/figma-to-component-agent.md`
2. If no Figma URL is provided, ask the user before proceeding.
3. Pass through any flags (`--vision`, `--route`) to the agent.
4. Execute all 5 phases autonomously, pausing at Phase 3 for build plan confirmation.

## Examples

```bash
# Basic conversion
/figma-to-component https://www.figma.com/design/ABC123/...?node-id=1-2117

# With visual resolution of unmapped nodes
/figma-to-component https://www.figma.com/design/ABC123/...?node-id=1-2117 --vision

# With route registration (new page)
/figma-to-component https://www.figma.com/design/ABC123/...?node-id=1-2117 --route
```

## What it does (5 phases)

| Phase | What happens |
|-------|-------------|
| 1. Understand | Fetches screenshot, metadata XML, and design context from Figma |
| 2. Map | Runs mapping agent CLI → recipe.json, looks up prop-spec.json + token-mappings.json, resolves UNMAPPED nodes |
| 3. Plan | Prints a build plan (styled wrappers → sub-components → sections → root) and waits for confirmation |
| 4. Generate | Writes the component file bottom-up using prop-spec + tokens; splits if >450 lines |
| 5. Audit | Verifies Cap* preferred; raw HTML wrapped in styled(); styled HTML justified with comments |

## Flags

### Interactive flags
| Flag | Effect |
|------|--------|
| `--vision` | Saves screenshot and enables visual resolution of UNMAPPED nodes via Claude vision |
| `--route` | Also generates `Loadable.js`, `index.js`, and adds a `routes.js` entry |

### Orchestration flags (used by `hld-to-code-agent`)
| Flag | Effect |
|------|--------|
| `--target-path <dir>` | Write generated files into `<dir>` instead of the default location |
| `--target-component-name <Name>` | Name the root component `<Name>` (PascalCase) |
| `--target-library cap-ui-library` | Target `@capillarytech/cap-ui-library` (default) |
| `--decomposition <json-path>` | JSON file describing how to split the node into multiple files per atomic tier |
| `--omit-redux-wiring` | Don't emit connect/injectReducer/injectSaga; orchestrator adds those |
| `--omit-route-registration` | Don't modify `routes.js`; orchestrator owns routing |
| `--emit-callback-stubs` | Emit `/* HANDLER: <description> */` markers for orchestrator to fill |
| `--skip-plan-confirmation` | Bypass Phase 3 user confirmation; emit `ui-generation-manifest.json` at end of Phase 4 |

## Output

| Artifact | Location |
|----------|----------|
| Recipe JSON | `claudeOutput/figma-blazeui-mapping/<nodeId>.recipe.json` |
| Component file | `app/components/<atoms\|molecules\|organisms\|pages>/<ComponentName>/index.js` |
| Loadable + route | `app/components/pages/<ComponentName>/` *(only with `--route`)* |
