---
description: Enhance a raw PRD (or a resolved clarifications file) into a structured speckit-format spec ready for HLD generation. Runs AFTER /clarify-prd in the preferred flow.
argument-hint: <clarifications-file-or-raw-prd-path-or-url>
allowed-tools: Read, Glob, Grep, Bash, Write, WebFetch, AskUserQuestion, Agent
---

Use the **prd-filter-agent** to produce a structured feature spec.

## Preferred flow (resolved clarifications)

```
/clarify-prd <raw-prd>                               ← step 1
     ↓ [PM / BE / Design fill Answer: blocks, set status: resolved]
/filter-prd <clarifications-file>                    ← step 2 (this command)
     ↓
/generate-hld <filtered-spec>                        ← step 3
```

When invoked with a clarifications file, the filter agent:
- Reads the clarifications file and the original PRD referenced in its `source:` frontmatter
- Organises the PRD content into speckit sections
- **Absorbs every resolved `Answer:` as an authoritative FR** marked `[RESOLVED by <owner> — Q<N>]`
- Uses each question's `If unanswered:` default for any `DEFERRED` / blank answers
- Adds a **Resolved Clarifications** summary table to the spec

## Fallback flow (raw PRD only)

```
/filter-prd <raw-prd>              ← enhances without clarifications
```

The agent still produces a structured spec but will emit more `[INFERRED]` / `[DERIVED]` markers and may include up to 3 `[NEEDS CLARIFICATION]` items. Prefer the clarify-first flow.

## Output

`claudeOutput/filteredPrd/<feature-name>-spec.md` with:
- Frontmatter `status: Ready for HLD`
- Structured sections (Overview, Goals, User Scenarios, Functional Requirements, Success Criteria, Design Reference, Dependencies, Assumptions)
- **Resolved Clarifications** section when a clarifications file was consumed
- All original PRD content preserved (zero loss)

## Next step

```
/generate-hld claudeOutput/filteredPrd/<feature-name>-spec.md
```
