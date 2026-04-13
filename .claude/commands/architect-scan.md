---
description: Scan the repository and generate a structured architecture document at .claude/output/architecture.md
argument-hint: "[optional: focus-area — modules|dataflow|integrations|packages|risks]"
allowed-tools: Read, Glob, Grep, Bash, Write
---

Use the **architect-scan** agent to perform a complete architecture scan.

## Instructions

1. Load and follow the skill instructions at `.claude/skills/architect-scan/SKILL.md`
2. Load the output template at `.claude/skills/architect-scan/output-template.md`
3. Execute the 10-step scanning process against this repository
4. Write the completed architecture document to `.claude/output/architecture.md`

If a focus area argument is provided, give extra depth to that section
while still producing the complete document.

The agent will:
- Discover feature modules and their Redux artifacts
- Map the Atomic Design component hierarchy
- Trace the Redux + Redux-Saga data flow pattern
- Identify shared layers (services, utils, config)
- Catalog architecturally significant packages
- Document integration points with backend and platform services
- Record conventions, constraints, and architectural risks
- Write a structured Markdown document suitable for engineer onboarding and AI-driven HLD generation
