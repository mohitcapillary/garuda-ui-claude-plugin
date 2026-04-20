---
description: Read Section 16 (Figma Naming Improvements) from an HLD and rename frame names across all cached Figma artifacts in claudeOutput/figma-capui-mapping/. Makes downstream decomposition deterministic.
argument-hint: "<path-to-hld.md>"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

Use the **figma-rename-agent** to apply Figma frame renames from an HLD's Section 16.

## Instructions

1. Pass the user's argument as the HLD file path to the figma-rename-agent.
2. If no argument is provided, look for the most recent HLD in `claudeOutput/hld/`.

The agent will:

1. Parse Section 16 (Figma Naming Improvements) from the HLD
2. Extract the rename table: old frame name → proposed PascalCase name, per node ID
3. Apply renames across all cached artifacts in `claudeOutput/figma-capui-mapping/<rootNodeId>/`:
   - `metadata.xml` and `metadata-shallow.xml` (`name="..."` attributes)
   - `manifest.json` (`"name"` and `"rootName"` fields)
   - `<rootNodeId>.recipe.json` (`"figmaComponentName"` fields)
   - `design-context.jsx` (`data-name="..."` attributes)
   - `prop-spec-notes.json` (`"figmaNodeName"` fields, if present)
4. Verify no old names remain in any file
5. Report a summary of all renames applied

## Prerequisites

- An HLD with a populated Section 16 table
- Cached Figma artifacts in `claudeOutput/figma-capui-mapping/`

## When to use

- After generating an HLD with `/generate-hld` (which produces Section 16)
- Before running `/hld-to-code` (to make decomposition deterministic)
- After a designer renames frames in Figma and you re-run `/figma-node-mapper` (to sync new names)

## Output

A summary table showing each rename applied and which files were updated. The cached artifacts are modified in-place.

ARGUMENTS: $ARGUMENTS
