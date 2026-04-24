---
description: Generate a structured system mapping for a product feature by analyzing documentation and the target app codebase
argument-hint: <documentation-url>
allowed-tools: Read, Glob, Grep, Bash, WebFetch, Agent, Write
---

Use the **product-code-mapper** agent to perform a complete system mapping.

## Instructions

1. Pass the user's argument as the documentation URL to the product-code-mapper agent.
2. If no argument is provided, the agent will prompt the user for the documentation URL.

The agent will:

1. Fetch and analyze the documentation at the provided URL
2. Analyze the target app codebase (React components, Redux store, Sagas, APIs)
3. Generate a structured system mapping following `.claude/skills/code-mapping/spec.md`
4. Write the output to `.claude/output/<product-name>-system-map.md`

## Priority

- Codebase > Documentation > Inference (mark assumptions with ⚠️ Assumed)

## Output

The final mapping document will be written to `.claude/output/` and will follow the spec.md template strictly. All 11 sections will be populated with real names from the codebase and complete end-to-end data flow traceability.
`