---
description: FIRST step in the PRD pipeline. Analyse a raw PRD against Figma and garuda-ui architecture, and produce a PM-friendly question log covering every distinct decision that must be resolved before the PRD is enhanced.
argument-hint: <raw-prd-path-or-url-or-inline>
allowed-tools: Read, Glob, Grep, Bash, Write, WebFetch, Agent, mcp__claude_ai_Figma__get_design_context, mcp__claude_ai_Figma__get_screenshot
---

Use the **prd-clarifier-agent** to generate a focused clarifications document from a raw PRD.

## Instructions

1. Pass the user's argument (file path, URL, Confluence link, or inline PRD text) to the prd-clarifier-agent.
2. If no argument is provided, prompt the user for the PRD.

The agent will:
1. Read the raw PRD plus `.claude/output/architecture.md`, the system map, and `app/config/endpoints.js`
2. Run one lightweight Figma pass per referenced node (design-context + screenshot; cached for downstream reuse)
3. Sweep the PRD through 14 internal gap triggers, then **cluster aggressively** (one question per decision, not per symptom) — but raise as many distinct questions as the PRD genuinely warrants
4. Write `claudeOutput/clarifications/<feature-name>-clarifications.md` — one short block per question, with an empty `Answer:` field

## Workflow

```
/clarify-prd <raw-prd>              ← THIS COMMAND (first)
      ↓
<feature>-clarifications.md         ← share with PM / BE / Design
      ↓ (they fill Answer: blocks, flip status: resolved)
/filter-prd <clarifications-file>   ← enhances PRD using the answers
      ↓
/generate-hld <filtered-spec>       ← produces HLD
```

## Output

`claudeOutput/clarifications/<feature-name>-clarifications.md`:
- Frontmatter with `status: awaiting-resolution` and source PRD path
- **Max 10 questions**, each with: one-line title, ≤2-line context, safe default if skipped, owner, empty `Answer:` block
- Short appendix with Figma nodeIds and architecture references

## Next step

Share the clarifications file. When every `Answer:` is filled and `status:` is flipped to `resolved`, run:
```
/filter-prd claudeOutput/clarifications/<feature-name>-clarifications.md
```
