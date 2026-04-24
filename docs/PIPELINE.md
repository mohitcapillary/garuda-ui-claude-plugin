# Pipeline Walkthrough

> **Status:** Stub. To be completed in Phase 7 after all stages are wired in and smoke-tested.

This document will walk through each stage of the garuda-ui-plugin pipeline end-to-end, with example invocations, gate points, and the artifact each stage produces. It replaces the legacy `docs/pipeline-explainer.html` for terminal/CLI users.

## Outline

### Part 1 — Pre-dev

- 1.1 `/clarify-prd` — PRD ingestion and gap analysis (5 categories)
- 1.2 `/filter-prd` — absorb answers into an authoritative spec
- 1.3 `/generate-hld` — compose the HLD from 5 skills
- 1.4 `/generate-lld` — derive organism anatomy + Redux shape + saga flow
- 1.5 `/generate-testcases` — P0/P1/P2 test case sheet

### Part 2 — Codegen

- 2.1 `/hld-to-code` — 11-phase codegen with Phase 2.5 preview gate
- 2.2 Figma cache strategy: 4-file per-node cache, Level A/B validation gates, per-EXACT drilling
- 2.3 `/build-verify` — npm start + error parsing + auto-fix (max 3 attempts)

### Part 3 — Post-dev

- 3.1 `/write-tests` — reducer/saga/component tests targeting ≥85% coverage
- 3.2 `/test-eval` — Jest coverage gate
- 3.3 `/visual-qa` — user-driven (default) or `--auto-fix` (unattended)
- 3.4 `/create-pr` — PR body assembly and `gh pr create`

### Part 4 — Utilities

- 4.1 `/architect-scan` + `--refresh` / `--verify` / `--auto`
- 4.2 `/figma-to-component`, `/figma-rename`, `/figma-node-mapper`
- 4.3 `/code-mapping`, `/map-product`
- 4.4 `/publish-confluence` (explicit only; no auto-publish)
- 4.5 `/run-pipeline` — end-to-end wrapper with gate-halt semantics

### Part 5 — Artifacts and Resume

- 5.1 `claudeOutput/` layout
- 5.2 `build-log.jsonl` — per-file resume
- 5.3 How gates halt and how to resume after failure

### Part 6 — Reference knowledge

- 6.1 `skills/cap-ui-library/` with `_index.md` lookup
- 6.2 `skills/coding-dna/` — 6 pillars
- 6.3 `skills/shared-rules.md` — organism anatomy, ImmutableJS, saga error handling
- 6.4 `skills/fe-guardrails/` — FG-01 through FG-12

---

For the legacy visual explainer see `docs/pipeline-explainer.html`.
