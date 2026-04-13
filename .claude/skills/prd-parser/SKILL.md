---
name: prd-parser
description: Parses a PRD document to extract feature requirements, user goals, prototype links, and scope boundaries for downstream HLD generation skills
triggers:
  - "parse PRD"
  - "extract requirements from PRD"
  - "read PRD"
---

# PRD Parser Skill

This skill reads a Product Requirements Document (PRD) and extracts structured information for downstream HLD generation skills. It is the first skill in the HLD Generator pipeline.

## Input Detection

Determine the PRD input type from the user's argument:

1. **URL** (starts with `http://` or `https://`): Use `WebFetch` to retrieve the document content
2. **File path** (contains `/` or ends with `.md`, `.txt`, `.pdf`, `.doc`): Use `Read` to load the file
3. **Inline text** (none of the above): Treat the argument as raw PRD content
4. **No input provided**: Stop and ask the user to provide a PRD

### WebFetch Fallback

If `WebFetch` fails to retrieve a URL:
- Warn: "Could not fetch PRD from URL. Please provide the PRD content directly or as a local file."
- Do NOT proceed without PRD content -- the entire pipeline depends on it.

## Extraction Process

### Step 1: Identify Feature Identity

Extract from the PRD:
- **Feature name**: The primary name or title of the feature
- **Description**: 2-3 sentence summary of what the feature does
- **Business purpose**: Why this feature exists, what business problem it solves
- **Target users**: Who will use this feature (roles, personas)

### Step 2: Extract Requirements

Scan the PRD for:
- **Functional requirements**: Specific capabilities the system must provide. Look for keywords: "must", "shall", "should", "will", requirements lists, acceptance criteria.
- **Non-functional requirements**: Performance, scalability, accessibility, security constraints.
- **User stories**: Narrative descriptions of user interactions. Look for "As a...", "Given/When/Then", or numbered user flows.
- **Acceptance criteria**: Testable conditions for each requirement.

### Step 3: Extract Prototype and Design Links

Scan the entire PRD content for URLs matching:
- **Figma**: `figma.com/design/`, `figma.com/file/`, `figma.com/proto/`
- **InVision**: `invisionapp.com/`, `projects.invisionapp.com/`
- **Zeplin**: `zpl.io/`, `app.zeplin.io/`
- **Generic prototypes**: Any URL with keywords like "prototype", "mockup", "wireframe", "design"
- **Live demos**: Any URL explicitly described as a prototype or demo in the PRD text

Collect all found links in a list. An **empty list is valid** -- it means no prototypes were provided and downstream skills should operate in requirements-only mode.

### Step 4: Extract API Specifications

Look for API-related content in the PRD:
- Endpoint definitions (URL paths, HTTP methods)
- Request/response payload examples
- Authentication requirements
- Error codes and handling
- Rate limits or quotas

If no API specs are found, note this explicitly -- the `api-contract-builder` skill will assume contracts.

### Step 5: Define Scope Boundaries

Extract:
- **In scope**: What this feature explicitly covers
- **Out of scope**: What is explicitly excluded
- **Dependencies**: External systems, APIs, or features this depends on
- **Assumptions**: Stated assumptions in the PRD

### Step 6: Identify Business Entities

Extract data entities mentioned in the PRD:
- Entity names and descriptions
- Relationships between entities
- Key attributes mentioned
- State transitions or lifecycle descriptions

## Output Format

The output is a mental model (not a file) that the agent carries forward to the next skill. The structured summary includes:

1. **Feature identity**: name, description, business purpose, target users
2. **Requirements list**: functional requirements with IDs (FR-001, FR-002...)
3. **User stories**: narrative flows with acceptance criteria
4. **Prototype links**: list of URLs (may be empty)
5. **API specs**: extracted specs or "none provided"
6. **Scope**: in-scope items, out-of-scope items
7. **Dependencies and assumptions**: external dependencies and stated assumptions
8. **Business entities**: data objects and relationships

## Output Rules

1. Extract what is explicitly stated in the PRD -- do not infer requirements
2. An empty prototype links list is a valid output
3. If the PRD is ambiguous on scope, note it as requiring clarification
4. Preserve the PRD's own requirement numbering if present
5. Do NOT skip any section -- if information is not found, state "Not specified in PRD"
