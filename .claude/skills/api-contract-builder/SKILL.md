---
name: api-contract-builder
description: Extracts or assumes API contracts for each feature area, documenting endpoints, payloads, validation rules, and error states for HLD generation
triggers:
  - "build API contracts"
  - "extract API specs"
  - "assume API contracts"
---

# API Contract Builder Skill

This skill identifies all required API calls for a feature and produces structured contract definitions. When the PRD provides API specs, they are extracted as-is. When specs are missing, contracts are assumed based on requirements and existing garuda-ui API patterns.

## Input

- Requirements and screen inventory from prd-parser and prototype-analyser outputs
- API specs from the PRD (if any were found by prd-parser)

## Contract Building Process

### Step 1: Identify Required API Calls

For each screen and user interaction identified by the prototype-analyser:

1. **Data fetching**: What data does this screen display? Each data source needs a GET endpoint.
2. **Data mutation**: What does the user create, update, or delete? Each mutation needs a POST/PUT/DELETE endpoint.
3. **Validation**: Are there async validations (e.g., check uniqueness)? Each needs a validation endpoint.
4. **Search/Filter**: Does the screen have search or filter? This may be a parameterised GET or a separate endpoint.
5. **File operations**: Does the feature involve file upload/download?

### Step 2: Extract Confirmed API Specs

If the PRD contains API specifications:

1. Extract each endpoint definition exactly as specified
2. Document: endpoint path, HTTP method, request payload, response payload
3. Note any authentication requirements
4. Extract validation rules and error states
5. Mark these contracts as **confirmed** (no marker needed)

### Step 3: Assume Missing API Contracts

For each required API call not covered by PRD specs:

1. **Reference existing patterns**: Read `app/config/endpoints.js` to understand the API domain structure (arya, vulcan, loyalty, promotion, incentives, rewards, etc.)
2. **Reference existing API methods**: Read `app/services/api.js` structure to understand how requests are constructed
3. **Follow RESTful conventions**:
   - List: `GET /v1/{domain}/{resource}?page=1&limit=20`
   - Detail: `GET /v1/{domain}/{resource}/{id}`
   - Create: `POST /v1/{domain}/{resource}`
   - Update: `PUT /v1/{domain}/{resource}/{id}`
   - Delete: `DELETE /v1/{domain}/{resource}/{id}`
   - Search: `GET /v1/{domain}/{resource}/search?q={query}`

4. **Design reasonable payloads** based on:
   - Business entities identified by prd-parser
   - Form fields visible in the prototype
   - Existing similar APIs in the codebase

5. **Mark every assumed contract** with `[ASSUMED]` in the status field

### Step 4: Define Error States

For each API endpoint (confirmed or assumed):

- `400 Bad Request`: Invalid input, validation failures
- `401 Unauthorized`: Missing or expired authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Duplicate or state conflict
- `500 Internal Server Error`: Server-side failure

For assumed contracts, use standard error patterns. For confirmed contracts, use the PRD-specified errors.

### Step 5: Define Validation Rules

For each endpoint with a request payload:

- Required fields
- Field type constraints (string, number, array, object)
- Length limits (min/max characters)
- Format constraints (email, URL, date format)
- Business rules (e.g., start date before end date)
- Cross-field validation (e.g., if type is X, field Y is required)

## Output Format

For each API contract, produce a structured definition:

```
### API: {Logical Name}

**Status**: confirmed / [ASSUMED]

| Field    | Value                    |
|----------|--------------------------|
| Endpoint | `{PATH}`                 |
| Method   | `{GET/POST/PUT/DELETE}`  |
| Auth     | Yes/No                   |

**Request Payload**:
{JSON structure}

**Response Payload**:
{JSON structure}

**Validation Rules**:
- {rule 1}
- {rule 2}

**Error States**:
| Status Code | Error         | Description |
|-------------|---------------|-------------|
| {code}      | {error_name}  | {desc}      |
```

## Marking Convention

- **Confirmed contracts** (from PRD): No special marker
- **Assumed contracts** (inferred): Mark with `[ASSUMED]` in the Status field
- **Partially assumed**: If PRD gives endpoint but not payload, mark: `[ASSUMED - payload inferred]`
- **API not in PRD**: Mark: `[ASSUMED - API spec not provided]`

## Output Rules

1. Every screen that displays or mutates data MUST have corresponding API contracts
2. All assumed contracts MUST be marked with `[ASSUMED]`
3. Payloads must use realistic field names based on the business domain
4. Error states must cover at least: 400, 401, 403, 404, 500
5. Follow existing garuda-ui API patterns for consistency
