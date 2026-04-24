---
description: Generate a comprehensive High-Level Design document from a PRD for a new feature in the target app codebase
argument-hint: <prd-file-path-or-url>
allowed-tools: Read, Glob, Grep, Bash, Write, WebFetch, Agent
---

Use the **hld-generator** agent to produce a complete High-Level Design document.

## Instructions

1. Pass the user's argument as the PRD source to the hld-generator agent.
2. If no argument is provided, the agent will prompt the user for the PRD.

The agent will:

1. Parse the PRD and extract requirements, user stories, and prototype links
2. Traverse each prototype link (Figma, InVision, or web URLs) to understand screen structure
3. Scan the target app codebase for reusable components and existing patterns
4. Build API contracts (confirmed from PRD or assumed and marked `[ASSUMED]`)
5. Generate a complete 15-section HLD using `.claude/templates/hld-template.md`
6. Validate alignment against `.claude/output/architecture.md` conventions
7. Write the output to `claudeOutput/hld/hld-<feature-name>.md`

## Prerequisites

- `.claude/output/architecture.md` must exist (run `/architect-scan` first if missing)
- Figma MCP tools should be available for Figma prototype links

## Output

The final HLD document will be written to `claudeOutput/hld/` and includes:
- 15 structured sections covering architecture, state management, API design, and component structure
- ASCII architecture diagrams per major screen
- All assumptions clearly marked with `[ASSUMED]`
- Architecture alignment notes referencing existing conventions
