---
name: hld-writer
description: Composes a complete High-Level Design document using the HLD template, populated with outputs from prd-parser, prototype-analyser, and api-contract-builder skills
triggers:
  - "write HLD"
  - "generate HLD document"
  - "compose HLD"
---

# HLD Writer Skill

This skill composes the final High-Level Design document by loading the standard template and filling every section with data gathered from the upstream skills (prd-parser, prototype-analyser, api-contract-builder) and codebase analysis.

## Template

Load the HLD template from `.claude/templates/hld-template.md`. This template defines the exact 15-section structure that MUST be preserved. Do not reorder, merge, or skip any section.

## Composition Process

### Step 1: Load References

Before composing, load these reference documents:

1. `.claude/templates/hld-template.md` -- the output template (REQUIRED)
2. `.claude/output/architecture.md` -- existing architecture conventions
3. `.claude/output/loyalty-promotions-system-map.md` -- existing system mapping patterns for Redux/saga examples

### Step 2: Fill Metadata Header

Replace template metadata placeholders:
- `{{FEATURE_NAME}}`: Feature name from prd-parser
- `{{TIMESTAMP}}`: Current date/time
- `{{PRD_SOURCE}}`: Original PRD source (URL, file path, or "inline")

### Step 3: Section-by-Section Composition

#### Section 1: Feature Overview
- **Source**: prd-parser output (feature identity, scope)
- Fill: feature name, description, business purpose, problem statement, target users, in-scope, out-of-scope

#### Section 2: Technical Objective
- **Source**: prd-parser output (requirements) + architecture.md (existing patterns)
- Fill: technical goals (scalability, maintainability, performance)
- Explain how the feature fits into the React + Redux-Saga architecture

#### Section 3: Impact Analysis
- **Source**: Codebase scan (Glob/Grep results) + prototype-analyser output
- **New components table**: List each new component with name, type (atom/molecule/organism/page), file location, purpose
- **Modified components table**: List existing components being changed and why
- **New Redux domains table**: List new reducer/saga pairs with inject keys
- **New routes table**: List route paths with auth requirements
- **Shared utilities table**: List new/modified hooks or utilities
- Verify all existing component references with Glob/Grep before including

#### Section 4: UI/UX Changes
- **Source**: prototype-analyser output (screen inventory, ASCII diagrams)
- Include the screen flow description
- For each major screen: route, purpose, component boundaries, interaction table, ASCII diagram
- ASCII diagrams MUST be copied from prototype-analyser output
- Each diagram must fit within 100-character width
- Each ASCII diagram MUST be immediately followed by a prototype screen link on its own line:
  `[See: {Screen Name}]({prototype-url-or-figma-frame-url})`
  Copy these links exactly from the prototype-analyser output. Do not omit them.

#### Section 5: Directory Structure
- **Source**: Impact analysis + garuda-ui conventions
- Use code block with tree format showing exact file paths
- Follow conventions:
  - Pages: `app/components/pages/{PageName}/` with full Redux co-location
  - Organisms with Redux: `app/components/organisms/{Name}/` with reducer.js, saga.js, etc.
  - Molecules: `app/components/molecules/{Name}/`
  - Atoms: `app/components/atoms/{Name}/`
- Include naming conventions section

#### Section 6: API Structure
- **Source**: api-contract-builder output
- For each API: endpoint, method, auth, request payload, response payload, validation rules, error states
- Preserve `[ASSUMED]` markers from api-contract-builder
- Use consistent table format for machine-readability

#### Section 7: Data and State Management Overview
- **Source**: Codebase scan + prototype-analyser + architecture.md patterns
- Redux store shape using `fromJS({})` Immutable.js convention
- Actions table: type, creator, purpose
- Selectors table: name, state path, return type
- Saga orchestration table: saga name, trigger, API call, success/failure actions, concurrency model
- Local state vs Redux state decision table with rationale
- Follow patterns from `.claude/output/loyalty-promotions-system-map.md`

#### Section 8: Validation
- **Source**: prd-parser (requirements) + prototype-analyser (form inputs)
- Client-side validation table: screen, field, rule, error message
- Server-side validation handling approach

#### Section 9: Reusable Patterns and Shared Utilities
- **Source**: Codebase scan
- Table of existing components/utilities to reuse with their locations
- New patterns this feature introduces for future reuse
- Reference Cap-* components from cap-ui-library

#### Section 10: Dependencies
- **Source**: prd-parser + codebase scan
- Internal module dependencies table
- External API dependencies table with confirmed/assumed status
- Third-party library dependencies (if any beyond existing)

#### Section 11: Risks and Considerations
- **Source**: Analysis of deviations, complexity, unknowns
- Risk table: risk description, severity (High/Medium/Low), mitigation strategy
- Architectural deviations from conventions
- Known unknowns and open questions

#### Section 12: Non-Functional Requirements
- **Source**: prd-parser (NFRs) + standard React best practices
- Performance: memoisation (React.memo, useMemo, useCallback), Reselect selectors, lazy loading
- Scalability: how the design handles data growth and user concurrency
- Accessibility: ARIA attributes, keyboard navigation, screen reader support

#### Section 13: Testing Strategy Overview
- **Source**: Requirements + component inventory
- Key scenarios table: scenario, type (happy-path/edge-case/error), priority
- Unit test targets table: target, type (component/saga/reducer), what to test
- Integration test considerations

#### Section 14: Architecture Alignment Notes
- **Source**: architecture-aligner skill will fill this section later
- Leave as placeholder for now: "To be populated by architecture-aligner skill"

#### Section 15: Open Questions and Decisions Needed
- **Source**: Accumulated unknowns from all prior steps
- Questions table: number, question, impact, owner, status

### Step 4: Quality Check

Before writing the output, verify:
- [ ] All 15 sections are filled (no `{{PLACEHOLDER}}` tokens remaining except in section 14)
- [ ] All ASCII diagrams fit within 100-character width
- [ ] All ASCII diagrams have an accompanying `[See: Screen Name](url)` link immediately after them
- [ ] All `[ASSUMED]` markers are present where appropriate
- [ ] All referenced existing components were verified with Glob/Grep
- [ ] Directory structure follows garuda-ui conventions
- [ ] Redux state uses Immutable.js conventions (`fromJS`, `get`, `getIn`)
- [ ] Document length is between 3000-6000 words
- [ ] No implementation-level code (no function bodies, no hook implementations)

## Output Rules

1. Preserve template section ordering exactly -- do not reorder, merge, or skip
2. Replace ALL `{{PLACEHOLDER}}` tokens with real content
3. Keep [ASSUMED] markers from upstream skills
4. Use code blocks for directory structures, JSON payloads, and Redux state shapes
5. Use tables for structured data (components, APIs, actions, risks)
6. ASCII diagrams must use box-drawing characters and fit within 100 chars
7. Write output to `claudeOutput/hld/hld-{feature-name}.md` using kebab-case feature name
