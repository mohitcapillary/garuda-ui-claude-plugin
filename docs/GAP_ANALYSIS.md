# GUIDELINES (garuda-ui) vs coding-dna (cap-garuda) — Gap Analysis

Purpose: decide which coding-dna files fill real gaps in garuda-ui's GUIDELINES. Written as part of Phase 2 of the merge plan. Duplicates do not get ported; gaps are candidates for opt-in port in Phase 3+.

## Summary
- Total coding-dna `ref-*.md` files analyzed: 48
- **DUPLICATE: 16** — do not port
- **PARTIAL: 18** — judgment call, review case by case
- **GAP: 14** — candidates to port alongside Phase 3 agents

## Full classification table

| coding-dna file | Topic | Classification | GUIDELINES it overlaps | Recommendation |
|---|---|---|---|---|
| coding-dna-architecture/ref-code-style-donts.md | Style anti-patterns (aliases, lodash, console, var) | PARTIAL | 05, 10, 11, 15 | Port the concrete do-not list for `/build-verify` lint checks |
| coding-dna-architecture/ref-dev-environment.md | Node/npm versions, .editorconfig, Prettier, ESLint config | GAP | — | Port for `/build-verify` agent; needs garuda-ui-specific values |
| coding-dna-architecture/ref-file-structure.md | Monorepo + atomic dir layout, 10-file component anatomy | PARTIAL | 04, 05, 15, 17 | Atomic piece is DUPLICATE (04); 10-file anatomy adds value — extract that slice only |
| coding-dna-architecture/ref-imports.md | Import ordering (6 groups), module-style vs relative | DUPLICATE | 15 (Rule 3 ordering, Rules 1–2 aliases) | Skip |
| coding-dna-architecture/ref-naming.md | Exhaustive file/folder/identifier naming table | PARTIAL | 05, 15, 17 | Port the exhaustive table; guidelines 05 only lists rules, not a lookup table |
| coding-dna-architecture/ref-package-registry.md | Full dependency list with versions | GAP | — | Port as reference only; not a rule doc |
| coding-dna-architecture/ref-tech-stack.md | Top-level stack inventory (React, Redux, Saga, Immutable, etc.) | GAP | — | Port as `00-tech-stack.md` reference; GUIDELINES.md has one line, no inventory |
| coding-dna-architecture/ref-typescript.md | JS+PropTypes default, when TS applies | DUPLICATE | 08 (PropTypes is only type safety) | Skip — garuda-ui is JS-only, TS branch is irrelevant |
| coding-dna-components/ref-anatomy.md | Top-to-bottom component file structure (imports → exports) | PARTIAL | 15 (ordering), 02, 08 | Port the 7-section template as a scaffold hint for `/hld-to-code` |
| coding-dna-components/ref-component-donts.md | No class, no skip withStyles, no logic in index, no useEffect fetch, no forwardRef, etc. | DUPLICATE | 02, 03, 09, 15 | Skip |
| coding-dna-components/ref-composition.md | children vs explicit props, HOC composition | PARTIAL | 03 (HOC inventory) | HOC list is DUPLICATE; children-vs-props guidance is new — port that fragment |
| coding-dna-components/ref-conditional-rendering.md | Early return, ternary, &&, switch for multi-variant | GAP | — | Port; `/hld-to-code` and `/write-tests` benefit from concrete rendering idioms |
| coding-dna-components/ref-effect-patterns.md | useEffect mount-only, cleanup, dep-driven, useDeepCompareEffect | PARTIAL | 10 (Rule 6 exhaustive-deps) | Port as effect cookbook; GUIDELINES only forbids eslint-disable, no idiom catalog |
| coding-dna-components/ref-hook-conventions.md | Custom hook naming, return shape, parameter style | GAP | — | Low value — only 3 custom hooks in repo; defer |
| coding-dna-components/ref-hook-donts.md | No useSelector/useDispatch, cleanup, no conditional hooks | DUPLICATE | 09 (connect vs useSelector implied), 10 | Skip |
| coding-dna-components/ref-hook-inventory.md | usePersistantState, useInterval, useDidMountEffect | GAP | — | Port when needed; repo-specific hook reference |
| coding-dna-components/ref-memoization.md | React.memo, useMemo, useCallback with examples | DUPLICATE | 10 (Rules 2–5) | Skip |
| coding-dna-components/ref-props.md | Destructuring in signature, defaultProps before propTypes, default values | PARTIAL | 08 | Port the defaultProps value table (`''` for strings, `[]` for arrays, etc.) — GUIDELINES 08 doesn't enumerate |
| coding-dna-quality/ref-a11y-donts.md | Don't suppress aria eslint, don't mouse-only, no hardcoded strings | DUPLICATE | 07 | Skip |
| coding-dna-quality/ref-a11y-patterns.md | ESLint jsx-a11y table, semantic HTML, ARIA usage | PARTIAL | 07 | ESLint rules table is new — extract only that fragment |
| coding-dna-quality/ref-error-donts.md | Don't swallow, don't show raw errors, no console.error, no throw in reducers | DUPLICATE | 09 (Rule 8), 11 (Rules 1–3) | Skip |
| coding-dna-quality/ref-error-strategy.md | 4-layer error model (API → saga → component → global) + Bugsnag | PARTIAL | 11 | Port the 4-layer diagram; GUIDELINES 11 lists rules without a model |
| coding-dna-quality/ref-error-types.md | API/network/redux error shapes, status code table | GAP | — | Port for `/hld-to-code` Phase 6 API work — needed to shape reducers correctly |
| coding-dna-quality/ref-git-donts.md | No secrets, no console, no --no-verify, ticket-based branches | GAP | — | Port for `/create-pr` agent (Phase 3+) |
| coding-dna-quality/ref-git-workflow.md | Branch naming, commit format, pre-commit hooks | GAP | — | Port for `/create-pr` agent; high value, zero overlap |
| coding-dna-quality/ref-perf-donts.md | No full lib imports, no skipping lazy, no massive lists, etc. | DUPLICATE | 10 (Rules 1–5) | Skip |
| coding-dna-quality/ref-perf-patterns.md | Route-level loadable, React.lazy+Suspense, withDynamicLazyLoading, webpack splits | PARTIAL | 10 (Rule 1 Loadable) | Port the lazy-loading cookbook; GUIDELINES 10 only states "pages MUST have Loadable" |
| coding-dna-quality/ref-user-feedback.md | Error UI decision table (toast/inline/boundary/empty/skeleton) | PARTIAL | 11 (Rule 5 four-state pattern) | Port the decision table; extends beyond GUIDELINES 11's four-state rule |
| coding-dna-state-and-api/ref-api-caching.md | StatusController in-flight de-dup, no React Query | GAP | — | Port when wiring `/hld-to-code` Phase 6 — this pattern isn't in GUIDELINES |
| coding-dna-state-and-api/ref-api-client-setup.md | Fetch wrapper, timeout race, compression, cache busting | GAP | — | Port when wiring `/hld-to-code` Phase 6 (API layer) — highest-value port |
| coding-dna-state-and-api/ref-api-donts.md | No direct API calls, no axios, no hardcoded URLs, no new endpoint files | PARTIAL | 09 (Rule 1) | Port the "all APIs in services/api.js" rule — GUIDELINES 09 doesn't say where APIs live |
| coding-dna-state-and-api/ref-api-error-handling.md | showError 4xx/5xx branching, 401 redirect, saga layer handling | PARTIAL | 11 | Port the HTTP-code-to-notification mapping — new material |
| coding-dna-state-and-api/ref-api-request-patterns.md | GET/POST/query-param construction idioms, request() wrapper | GAP | — | Port for `/hld-to-code` Phase 6 |
| coding-dna-state-and-api/ref-api-response-handling.md | Response envelope, checkStatus, decompression pipeline | GAP | — | Port for `/hld-to-code` Phase 6 |
| coding-dna-state-and-api/ref-auth-donts.md | No tokens in state, no refresh logic, no per-component auth | GAP | — | Port when auth-touching agents ship; low near-term value |
| coding-dna-state-and-api/ref-auth-flow.md | JWT in localStorage, authWrapper.js, redirectIfUnauthenticated | GAP | — | Port when auth-touching work begins; defer |
| coding-dna-state-and-api/ref-form-state.md | Manual useState + Cap form components, inline validation | PARTIAL | 16 | GUIDELINES 16 says validation lives in sagas; this says useState. Conflict — resolve before porting |
| coding-dna-state-and-api/ref-global-state.md | Reducer pattern with fromJS/.set, three-state (REQUEST/SUCCESS/FAILURE) | PARTIAL | 09 | Port the REQUEST/SUCCESS/FAILURE status triad — GUIDELINES 09 mentions but doesn't codify the pattern |
| coding-dna-state-and-api/ref-local-state.md | useState idioms for toggles, search, timers | DUPLICATE | 09 (Rule 4 implicit — local vs redux) | Skip |
| coding-dna-state-and-api/ref-protected-routes.md | connectedRouterRedirect, route configuration | GAP | — | Port when auth work happens; defer |
| coding-dna-state-and-api/ref-role-access.md | RBACContext, permission checking via accessiblePermissions | GAP | — | Port when permission-aware features ship |
| coding-dna-state-and-api/ref-server-state.md | Redux-Saga pipeline diagram, takeLatest + call + put pattern | DUPLICATE | 09 (Rules 1, 8) | Skip — same territory |
| coding-dna-state-and-api/ref-state-decision-tree.md | Flowchart: when to use useState / Context / Redux / localStorage | GAP | — | Port; `/hld-to-code` benefits from an explicit decision tree |
| coding-dna-state-and-api/ref-state-donts.md | No React Query, no mutation, no global for single-component, three-state required | DUPLICATE | 09 (Rules 1, 4, 5), 10 | Skip |
| coding-dna-state-and-api/ref-url-state.md | Manual query param construction, React Router v5 params | PARTIAL | — | Port; GUIDELINES has nothing on URL state |
| coding-dna-styling/ref-animations.md | Minimal custom animation, Antd built-ins, no Framer/Spring/GSAP | GAP | — | Low value; defer |
| coding-dna-styling/ref-approach.md | styled-components css literal vs styled() patterns | DUPLICATE | 01 (Rules 1, 5) | Skip |
| coding-dna-styling/ref-class-patterns.md | classnames package usage, conditional class patterns | PARTIAL | 01 | Port the classnames-with-object-syntax idiom — GUIDELINES 01 doesn't mention classnames |
| coding-dna-styling/ref-css-donts.md | No hardcoded colors/spacing, no CSS/SCSS, no inline, no grid | DUPLICATE | 01 (Rules 2, 4), 06 (Rules 2–4), 12 | Skip |
| coding-dna-styling/ref-responsive.md | Viewport calc, percentage widths, flex, no breakpoint system | DUPLICATE | 12 (Rules 1–4) | Skip |
| coding-dna-styling/ref-tokens-and-theme.md | Full CAP_SPACE_* / CAP_G* / FONT_SIZE_* token table | DUPLICATE | 06 (all rules + token reference) | Skip — GUIDELINES 06 already has token tables |
| coding-dna-testing/ref-approach.md | Jest, RTL, Enzyme legacy, MSW, redux-saga-test-plan inventory | PARTIAL | 13 | Port the tooling inventory + unit-vs-integration split; GUIDELINES 13 is thin |
| coding-dna-testing/ref-mocking.md | MSW, jest.mock, global __mocks__, jest.fn patterns | GAP | — | Port for `/write-tests` agent — needed Phase 3 |
| coding-dna-testing/ref-naming.md | File naming, describe/it conventions, snapshot patterns | PARTIAL | 13 (Rule 2) | Port the describe/it convention; GUIDELINES 13 only covers file naming |
| coding-dna-testing/ref-test-data.md | mockData.js, factory patterns, Immutable fromJS | GAP | — | Port for `/write-tests` agent — Phase 3 |
| coding-dna-testing/ref-testing-donts.md | No implementation tests, no Enzyme for new, no over-mocking, cleanup | PARTIAL | 13 (Rule 3 RTL, Rule 5 library internals) | Port the over-mocking and cleanup rules |

## Recommended GAP ports (sorted by value)

1. **coding-dna-state-and-api/ref-api-client-setup.md** — genuinely missing from GUIDELINES; needed when `/hld-to-code` Phase 6 writes `services/api.js`. Low cost, high value.
2. **coding-dna-state-and-api/ref-api-request-patterns.md** — GET/POST/query-param idioms; directly unblocks `/hld-to-code` Phase 6.
3. **coding-dna-state-and-api/ref-api-response-handling.md** — response envelope shape + checkStatus rules; companion to client-setup; Phase 6 needs all three together.
4. **coding-dna-state-and-api/ref-api-caching.md** — StatusController de-dup pattern; Phase 6 sagas must use it.
5. **coding-dna-testing/ref-mocking.md** + **ref-test-data.md** — port as a pair before `/write-tests` agent ships; Phase 3 prerequisite.
6. **coding-dna-quality/ref-git-workflow.md** + **ref-git-donts.md** — port as a pair for `/create-pr` agent; zero overlap with GUIDELINES, unblocks PR authoring.
7. **coding-dna-architecture/ref-dev-environment.md** — Node/ESLint/Prettier versions for `/build-verify`; needs a garuda-ui-local rewrite since values differ from cap-garuda.
8. **coding-dna-state-and-api/ref-state-decision-tree.md** — decision flowchart; small file, high orientation value for `/hld-to-code`.

## Deferred GAPs (low-value for now)

1. **coding-dna-state-and-api/ref-auth-flow.md**, **ref-protected-routes.md**, **ref-role-access.md**, **ref-auth-donts.md** — all four defer until an auth-touching agent ships. Garuda-ui tier/benefit features are RBAC-gated but auth wiring rarely changes per-feature.
2. **coding-dna-components/ref-hook-inventory.md**, **ref-hook-conventions.md** — only 3 custom hooks in repo; revisit if a hook-authoring agent appears.
3. **coding-dna-styling/ref-animations.md** — minimal real-world relevance; most motion comes from Antd.
4. **coding-dna-architecture/ref-package-registry.md**, **ref-tech-stack.md** — port as `00-reference/` items, not rules; useful for onboarding but not in any agent's hot path.
5. **coding-dna-quality/ref-error-types.md** — error shape reference; port only when the next reducer-authoring agent needs it.

## Overlap clusters (visual)

Two clusters account for most duplication. **State & data flow** is the heaviest: coding-dna's `ref-server-state`, `ref-local-state`, `ref-state-donts`, `ref-hook-donts`, `ref-component-donts` all restate what GUIDELINES 09 (state management) and 10 (performance) already codify in rule-number form. The coding-dna versions add narrative depth and worked examples, but no new enforceable rule — port none of them wholesale. **Styling** is the second cluster: `ref-approach`, `ref-css-donts`, `ref-responsive`, `ref-tokens-and-theme` map 1:1 onto GUIDELINES 01, 06, and 12; GUIDELINES 06 in particular already ships a full token table, so porting the coding-dna token reference is pure duplication.

The clean gaps sit in a third region: the API layer (`services/api.js` wiring, request/response pipeline, caching controller), Git workflow, and testing tooling. GUIDELINES gives rules for saga patterns and test file naming but says nothing about how the HTTP client, mocking, or mock data are organized — those are genuine holes the coding-dna refs can fill without conflict. Port those in Phase 3 alongside the agents that need them; leave the state and styling layers alone.
