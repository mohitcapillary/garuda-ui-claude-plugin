---
name: prd-clarifier
description: Analyse a raw PRD against its Figma designs and the existing target app architecture. Produce a tight, PM-friendly list of open questions whose answers are required before the PRD can be enhanced and turned into an HLD.
---

# PRD Clarifier Skill

Runs **first** in the pipeline — on the raw PRD, before any enhancement.

```
raw PRD → [this skill] → clarifications doc
            ↓ [product/BE/design fill Answer blocks, flip status: resolved]
          filter-prd (absorbs answers as authoritative FRs)
            ↓
          filtered spec
            ↓
          /generate-hld
```

The output is a review document for a Product Manager. It must be **precise enough that a one-line answer per question is sufficient**. Quality over volume — each question should represent a real decision the reviewer needs to make.

## Hard rules

- **No PRD embedding.** The PM already has the source — reference it by path, don't duplicate it.
- **No research-notes dump.** Only a short traceability appendix at the bottom.
- **Question form, not observation form.** Every block must phrase the blocker as a question the reviewer can answer in one line.
- **Five PM-facing categories only** (mapped from 17 internal triggers below).
- **Design is authoritative for UI.** If Figma and PRD conflict, the `If unanswered:` default must point to Figma (matches existing "Figma over spec" rule).
- **One question per decision, not per symptom.** Clustering rules below are mandatory — they exist to prevent noise, not to hit a count target.

## Input

Raw PRD: file path, URL, Confluence page, or inline text. No assumption of pre-filtering.

## Execution

### Step 1 — Load and persist the PRD

The downstream filter agent needs to re-read the raw PRD to produce the filtered spec. **Always persist the PRD to a stable file path** so `source:` in the clarifications frontmatter resolves to a real file, regardless of input shape:

| Input shape | Action |
|-------------|--------|
| Existing file path | Use the path as-is. Do not copy. |
| URL (http/https) | `WebFetch` the content → write to `claudeOutput/rawPrd/<feature-name>.md` |
| Confluence URL or page ID | `WebFetch` the content → write to `claudeOutput/rawPrd/<feature-name>.md` |
| Inline text | Write the raw text to `claudeOutput/rawPrd/<feature-name>.md` |

Derive `<feature-name>` in kebab-case from the PRD title / content (same convention as `prd-filter-agent`).

The **resolved path** (existing or newly-written) becomes the `source:` value in the clarifications frontmatter. Never write `source: inline` or `source: <url>` — always a readable file path.

Then:
- Read the PRD fully.
- Read `.claude/output/architecture.md`.
- Read `.claude/output/loyalty-promotions-system-map.md`.
- Skim `app/config/endpoints.js` for existing API-domain naming.
- Skim `app/services/api.js` for existing service functions (e.g., `getUsersByIds`, `getOrgUsers`, `getPrograms`). These are reusable — when writing `If unanswered:` defaults, prefer referencing an existing `api.js` function over assuming BE must add a new field or endpoint.
- Glob `app/components/{atoms,molecules,organisms,pages}/*/index.js` for component inventory.

### Step 2 — Lightweight Figma pass

For every Figma URL in the PRD:
1. Extract `fileKey` + `nodeId` (node-id `X-Y` → `X:Y`).
2. Extract the **screen label** from the PRD text immediately preceding each URL (e.g., "Listing", "Create", "Deactivate modal"). If no label is present, derive one from the Figma node name.
3. `mcp__claude_ai_Figma__get_design_context` once.
4. `mcp__claude_ai_Figma__get_screenshot` once.
5. Persist to `claudeOutput/figma-capui-mapping/<nodeId>/` (`design-context.jsx`, `screenshot.png`) so downstream agents reuse them.

**All Figma URLs must appear in the output.** Build a list of `(screenLabel, fullFigmaUrl, nodeId)` tuples during this step. This list is used to populate the header and appendix — never collapse multiple URLs into one.

Skip nodes that fail — list them in the appendix.

### Step 3 — Internal gap sweep (15 triggers)

Walk the PRD and the cached Figma artifacts. For each trigger below, note any finding. This is an **internal inventory** — do not emit a question per finding yet.

| Internal trigger | What to look for |
|------------------|------------------|
| PRD_AMBIGUITY | Vague wording, missing thresholds, unmeasurable terms |
| FIGMA_NOT_IN_PRD | Design shows UI element PRD never mentions |
| PRD_NOT_IN_FIGMA | PRD names element design doesn't show |
| FIGMA_PRD_CONFLICT | Direct contradiction between design and PRD |
| MISSING_API_CONTRACT | Data flow implied but no endpoint named |
| MISSING_API_PAYLOAD | Endpoint named but no request/response shape |
| FIGMA_FIELD_NOT_IN_BE | Field rendered in Figma UI has no matching field in the documented API request/response payload |
| BE_FIELD_NOT_IN_FIGMA | Field present in documented BE payload has no corresponding element rendered in any Figma screen |
| ID_NAME_RESOLUTION | Figma renders a human-readable name (person name, program name, entity label) but the BE response only returns a numeric/opaque ID for that field (e.g., `updatedBy: 7` but Figma shows "Mohit Gupta"; `programId: 5` but Figma shows "Tier program"). For every such field, the PRD must specify which API resolves the ID to a display name — or BE must add the resolved name to the response DTO. Check **every** ID field in the BE response against its Figma rendering — do not stop after finding one. |
| MISSING_PAGINATION | Figma shows a table, list, or grid of items but the BE endpoint has no pagination/offset/cursor/page-size parameters documented |
| MISSING_VALIDATION | Form fields without rules |
| MISSING_ERROR_STATES | No error copy/retry/fallback |
| MISSING_EMPTY_STATES | No empty/loading state |
| MISSING_PERMISSIONS | No RBAC rules |
| MISSING_I18N | User-facing strings without translation plan |
| INTERACTION_UNCLEAR | Gap in user flow |
| DATA_LIFECYCLE | Create/update/delete/archive semantics unclear |
| ARCH_MISALIGN | PRD implies pattern conflicting with existing architecture |

### Step 4 — Cluster (most important step)

Reduce findings into distinct questions. No quantity cap — surface every real decision the reviewer must make. But do cluster aggressively to avoid noise:

1. **Per decision, not per symptom.** If six form fields are missing validation, that's *one* question: "Do we need validation rules for the create-benefit form? (Listing: name, external ID, dates, etc.)" — not six separate questions.
2. **Collapse related Figma gaps.** If Figma has three elements PRD misses and they all belong to the same screen (filter panel + sort + column picker), that's *one* question.
3. **Cluster field-level mismatches per screen/endpoint pair.** If five Figma fields are missing from one BE response, that is *one* `Backend` question listing all five — not five questions. Similarly, multiple orphaned BE fields on the same endpoint are one question.
4. **Merge conflicts with their root cause.** If a Figma-vs-PRD conflict exists because the PRD is ambiguous, ask the ambiguity, not the conflict.
5. **Drop questions the reviewer can't change the answer on.** Missing i18n keys for a brand-new feature is obvious — don't ask; bake it into the default. Only raise i18n if there's a real choice (new Locize namespace? reuse existing?).
6. **Drop low-signal questions.** "Should there be a loading state?" — yes, obviously. Bake into default. Only ask if there's a material choice.

Do not trim to hit a target count. A complex PRD with 20 genuine decisions is better than one with 8 conflated ones. If after clustering you have 3 questions, ship 3. If you have 25, ship 25 — but verify each one passes the clustering rules above.

### Step 5 — Categorise for the PM

Map internal triggers to PM-facing categories:

| PM-facing tag | Covers internal triggers |
|---------------|--------------------------|
| `Design` | FIGMA_NOT_IN_PRD, PRD_NOT_IN_FIGMA, FIGMA_PRD_CONFLICT |
| `Spec Gap` | PRD_AMBIGUITY, INTERACTION_UNCLEAR, DATA_LIFECYCLE |
| `Backend` | MISSING_API_CONTRACT, MISSING_API_PAYLOAD, FIGMA_FIELD_NOT_IN_BE, BE_FIELD_NOT_IN_FIGMA, ID_NAME_RESOLUTION, MISSING_PAGINATION |
| `Rules` | MISSING_VALIDATION, MISSING_ERROR_STATES, MISSING_EMPTY_STATES, MISSING_PERMISSIONS, MISSING_I18N |
| `Architecture` | ARCH_MISALIGN |

### Step 6 — Write each question block

Use the template. Each block is only five lines of visible content:

```
### Q{N} — [{Category}] {one-line title}

**Context:** {1–2 lines: what we saw + why it matters, merged}

**If unanswered:** {default we will use}

**Owner:** {PM | Designer | BE | Tech Lead}

**Answer:**
```
<fill here>
```
```

Content rules:
- **Context is one or two lines maximum.** If you need three, the question is probably two questions.
- **Quote the smallest useful PRD fragment** if evidence is needed (e.g., `PRD: "Last updated at — Today, Yesterday, Last 7 days..."`) — do not paste whole sections.
- **`If unanswered` must be a real default**, not "we'll ask later". If you truly can't pick a default, write `Needs decision — no safe default` and accept the reviewer must respond.
- **Architecture questions** are always notes (not blockers); default = follow existing convention.

### Step 7 — Write the traceability appendix

Appendix is short and mechanical:
- Source PRD path
- Figma nodes fetched — list each as `**Screen Label:** full-figma-url (nodeId: X:Y)`. Include every URL from Step 2, not just node IDs.
- Figma nodes that failed (if any) — with full URL
- Pointer to architecture.md and the system map

No research narrative. No coverage tables. No internal category counts.

## Output

Write to `claudeOutput/clarifications/<feature-name>-clarifications.md` using the template.

Make sure the frontmatter `source:` field points to the persisted raw PRD path from Step 1 — this is what `prd-filter-agent` will read to reconstruct the full spec.

Report to the user:
- **Raw PRD persisted at** (if newly written): `claudeOutput/rawPrd/<feature-name>.md`
- Clarifications file path
- Question count with breakdown per PM-facing category (e.g., "14 total: 5 Design, 4 Spec Gap, 3 Backend, 1 Rules, 1 Architecture")
- Owners to loop in
- Figma nodes that failed to fetch
- Next step: share with PM/BE/Design → once all `Answer:` blocks are filled and top-level `status:` is `resolved`, run `/filter-prd claudeOutput/clarifications/<feature-name>-clarifications.md`

## Quality bar (self-check before writing)

- [ ] Every question represents a distinct decision (no symptom-level duplicates)
- [ ] Every question is phrased as a question, answerable in one line
- [ ] Every `Context` is ≤ 2 lines
- [ ] Every `If unanswered` is a concrete default (or explicitly `Needs decision`)
- [ ] No internal category codes leaked into the PM-facing doc (use the 5 tags only)
- [ ] No PRD content embedded; source path referenced once in frontmatter + once in appendix
- [ ] Figma conflicts default to Figma (not spec)
- [ ] Architecture questions default to existing convention
