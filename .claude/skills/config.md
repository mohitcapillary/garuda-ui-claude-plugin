# Pipeline Configuration — Single Source of Truth

> All agents and commands MUST read values from this file. NEVER hardcode these values in agent or command files.

> Values below reflect the locked decisions for **garuda-ui-plugin v1.0.0-alpha**. Change here; every agent reads from here.

---

## Application Config

| Key | Value | Used By |
|-----|-------|---------|
| `app_name` | garuda-ui (target repo name) | All agents |
| `dev_port` | 8000 | `visual-qa`, `hld-to-code` (Tier 3 visual audit) |
| `url_prefix` | `/loyalty/ui/v3` | `visual-qa`, `hld-to-code` |
| `dev_url` | `http://localhost:8000/loyalty/ui/v3` | `visual-qa` |
| `figma_access_token_env_var` | `FIGMA_ACCESS_TOKEN` | `visual-qa` (pixel diff mode) |

## Authentication Config (for visual-qa)

| Key | Value | Used By |
|-----|-------|---------|
| `auth_browser_login_url` | `/auth/login` | `visual-qa` (browser login URL) |
| `auth_api_endpoint_path` | `/arya/api/v1/auth/login` | `visual-qa/login.js` (API endpoint) |
| `auth_username_env_var` | `GARUDA_USERNAME` | `visual-qa/login.js` |
| `auth_password_env_var` | `GARUDA_PASSWORD` | `visual-qa/login.js` |
| `auth_base_url_env_var` | `GARUDA_INTOUCH_BASE_URL` | `visual-qa/login.js` |
| `auth_org_id_env_var` | `GARUDA_ORG_ID` | `visual-qa/login.js` (optional override) |
| `auth_default_base_url` | `nightly.intouch.capillarytech.com` | `visual-qa/login.js` (fallback) |

## Pipeline Limits

| Key | Value | Used By |
|-----|-------|---------|
| `max_code_gen_retries` | 3 | `hld-to-code` (Phase 5 pre-emission validator retries), `build-verify` auto-fix loop |
| `visual_qa_max_iterations_user` | 5 | `visual-qa` user-driven mode |
| `visual_qa_max_iterations_auto` | 3 | `visual-qa --auto-fix` mode |
| `visual_qa_mismatch_threshold` | 5 | `visual-qa` — exit loop when pixel mismatch < this % |
| `visual_qa_viewport_width` | 1280 | `visual-qa` (Playwright viewport) |
| `visual_qa_viewport_height` | 800 | `visual-qa` (Playwright viewport) |
| `visual_qa_page_load_wait_ms` | 3000 | `visual-qa` (wait after page load before screenshot) |
| `visual_qa_pixelmatch_threshold` | 0.1 | `visual-qa` (per-pixel tolerance) |
| `dev_server_startup_wait_seconds` | 60 | `visual-qa` |
| `architect_drift_file_threshold` | 20 | `/architect-scan --auto` (re-scan when this many files have changed since last scan) — Phase 5 enhancement |
| `architect_drift_halt_threshold` | 80 | Halt pipeline if drift > this (obvious architecture shift — halt and require explicit `--refresh`) |

## Coverage Targets

| Key | Value | Used By |
|-----|-------|---------|
| `coverage_line_target` | **85** | `test-writer`, `test-evaluator` (Phase 3+) — locked decision D.5 |
| `coverage_branch_reducer_target` | 100 | `test-writer` — every reducer switch case |
| `coverage_worker_saga_target` | 100 | `test-writer` — every saga worker × 3 paths |
| `coverage_component_target` | 80 | `test-writer` — render states + key interactions |
| `coverage_partial_threshold` | 70 | `test-evaluator` — warn at partial, fail below this |

## Bandwidth Estimate Defaults (for HLD engineering-estimate section)

| Key | Value | Used By |
|-----|-------|---------|
| `bandwidth_simple_organism_days` | 2-3 | `hld-generator` |
| `bandwidth_medium_organism_days` | 4-5 | `hld-generator` |
| `bandwidth_complex_organism_days` | 6-8 | `hld-generator` |
| `bandwidth_page_days` | 1-2 | `hld-generator` |
| `bandwidth_buffer_percent` | 20 | `hld-generator` |
| `bandwidth_test_buffer_percent` | 30 | `hld-generator` |

## Reference Organisms (used when codegen needs a known-good pattern)

| Key | Value | Used By |
|-----|-------|---------|
| `reference_organism_1` | `app/components/organisms/AudienceList` | `hld-to-code` (Phase 5 pattern lookup when unclear) |
| `reference_organism_2` | `app/components/organisms/EnrolmentConfig` | `hld-to-code` (secondary reference) |

## Runtime Context Handoff

| Key | Value | Used By |
|-----|-------|---------|
| `runtime_context_file` | `runtime_context.json` | `visual-qa` reads this from `claudeOutput/build/<feature>/` to get `route_params`, `query_params`, `full_url_override`. Written by `hld-to-code` Phase 0. |

---

## NOT Configured Here (dropped/deferred features)

These keys existed in cap-garuda-plugin's config but are absent here on purpose:

| Dropped key | Why |
|---|---|
| `default_confluence_space` | No auto-publish (decision D.6). `/publish-confluence` takes space as explicit arg. |
| `hld/lld/testcase_page_title_format` | Same — publishing is explicit, formatting decided at invocation. |
| `google_drive_folder_id`, `testcase_template_sheet_id` | Testcase sheet generation may ship in Phase 3. Add these keys at that time. |
| `qa_circuit_breaker_stale_limit`, `max_queries_per_phase`, `auto_resolve_confidence_threshold` | Tied to `/gix` orchestrator governance (dropped). Rule of thumb now: agents halt and ask on ambiguity; circuit-break manually if an agent loops. |
| `figma_decompose_max_depth`, `figma_decompose_max_sections` | `figma-decomposer` agent dropped; garuda-ui's 4-file Figma cache supersedes. |
| `confluence_max_page_size_kb` | Part of dropped Confluence auto-publish. |
| `scout_*` limits | `codebase-scout` agent dropped; HLD generator does its own context gathering. |
| `transcript_chunk_*` | `prd-ingestion` agent dropped; `/clarify-prd` handles long PRDs directly. |
| `workspace` (`.claude/workspace/<jira-id>/`) | Replaced by per-feature directories under `claudeOutput/`. |
| `max_organisms_per_lld` | Will add when `/generate-lld` ships in Phase 3. |
