# TODO: Fix Truncation Gap in figma-node-mapper

**Status:** Pending
**Priority:** Medium
**Skill affected:** `.claude/skills/figma-node-mapper/SKILL.md`
**Code affected:** `tools/mapping-agent/src/utils/manifest-parser.ts`

---

## What We Were Fixing

### Problem 1 — Step B1 relies on screenshot visual inspection (unreliable)

When `get_metadata` returns truncated XML for a large Figma node, `scan-manifest` produces a `manifest.json` that only contains the sections present in the partial XML. Bottom sections silently go missing.

Current Step B1 in `SKILL.md` (lines 309–317) tells the agent to:
> "Visually identify any screen sections present in the screenshot but missing from manifest.sections"

There is no code backing this up. The agent guesses based on visual comparison of a screenshot — unreliable and often missed entirely.

**Real example:** Node `123-5146` (listing page) has `estimatedNodeCount: 599`, `isTruncated: true`. Its main child `123-5148` has `estimatedDescendants: 550`. Without Step B1 working correctly, large chunks of the screen go unmapped.

### Problem 2 — Nested truncation not handled

Step B2 only checks `estimatedDescendants > 150` to decide whether to split a section. But it never runs `scan-manifest` on the section's own fetched XML to check if that fetch was also truncated. A section's `get_metadata` can itself be truncated — and no error is raised; `resolve-metadata` just processes incomplete XML silently.

### Problem 3 — src/dist divergence in manifest-parser

`tools/mapping-agent/src/utils/manifest-parser.ts` `needsChunking()` is missing the third condition:
```typescript
|| manifest.rootLayoutMode === 'NONE'
```
This condition exists in the compiled `dist/utils/manifest-parser.js` but NOT in the TypeScript source. The dist was hand-edited without updating src. The function comment in src even documents this condition should exist. Needs to be synced.

---

## The Fix (Ready to Implement)

Full implementation plan was saved in a previous Claude Code session plan.

### Summary of changes

| File | What to change |
|------|---------------|
| `.claude/skills/figma-node-mapper/SKILL.md` | **Replace Step B1** (lines 309–317) with `get_file_nodes`-based section discovery. **Extend Step B2** line 347 to handle nested truncation with one level of recursive sub-section splitting. |
| `tools/mapping-agent/src/utils/manifest-parser.ts` | Add `\|\| manifest.rootLayoutMode === 'NONE'` to `needsChunking()` lines 191–193 to sync with dist. |
| `tools/mapping-agent/dist/` | Regenerated via `npm run build` after src fix — do not hand-edit. |

### New Step B1 strategy (replacing screenshot inspection)

1. Call `mcp__figma-chunked__get_file_nodes(fileKey, [rootNodeId], depth=1, summarizeNodes=true, pageSize=25)`
2. Paginate via `nextCursor` until exhausted — collects ALL depth-1 children
3. Filter hidden nodes (matches manifest-parser line 140 behaviour)
4. Convert colon IDs → dash format, diff against `manifest.sections[].nodeId`
5. For each missing nodeId: call `get_metadata`, write XML, run `scan-manifest`, add to `manifest.json`
6. Rewrite `manifest.json` before proceeding to B2

### Nested truncation fix (extending Step B2)

After fetching each section's XML, run `scan-manifest` on it. If `isTruncated: true` OR `estimatedDescendants > 150`:
- Use `get_file_nodes(sectionNodeId, depth=1)` to get sub-section IDs
- Fetch and map each sub-section individually
- Merge sub-section recipes into a single section recipe
- Cap: no further splitting beyond one level of sub-sections

---

## Verification Steps (when ready to implement)

1. Re-run figma-node-mapper on node `123-5146` — confirm `manifest.json` ends up with all sections before B2 starts
2. Check `npm run build` output — `dist/manifest-parser.js` `needsChunking` should now have 3 conditions and be identical to current dist
3. Run on a section with `estimatedDescendants > 150` (e.g. `123-5148`, ~550 descendants) — confirm sub-sections are fetched and merged
