---
name: architect-scan
description: Scan the repository and generate a structured architecture document at .claude/output/architecture.md. Use when asked to analyze codebase architecture, generate an architecture overview, or produce input for HLD generation.
user-invocable: true
disable-model-invocation: true
argument-hint: "[optional: focus-area]"
---

# Architecture Scan Skill

You are performing an architecture scan of the Garuda UI repository.
Your goal is to produce a structured, concise architecture document
that serves two audiences:

1. **New engineers** — who need to understand the system quickly
2. **AI coding agents** — who will use it as context for HLD generation

## Output

Write the final document to `.claude/output/architecture.md`.
Create the directory if it does not exist.

Read the output template at `${CLAUDE_SKILL_DIR}/output-template.md`
for the exact section structure and content guidance. Fill every
section with real data from this repository. Replace all `{{PLACEHOLDER}}`
tokens with actual content.

## Scanning Process

Follow these steps sequentially. Use Glob and Grep for discovery.
Use Read for targeted file inspection. Do NOT read every file — scan
at the directory and pattern level.

### Step 1: Project Identity

- Read `package.json` (name, version, description)
- Read `app-config.js` (appName, prefix, appType)
- Read `CLAUDE.md` for existing architecture documentation
- Note: App name is "Garuda UI", a loyalty management platform

### Step 2: Feature Module Discovery

Scan `app/components/pages/` and identify each subdirectory as a
potential feature module. For each module:

- Check for Redux artifacts: `reducer.js`, `saga.js`, `actions.js`,
  `constants.js`, `selectors.js`
- Check for `Loadable.js` (indicates dynamic loading)
- Read the main `index.js` briefly to understand purpose
- Classify: full Redux module, partial, or static page

Group modules by business domain:
- **Core Platform**: App (router), Cap (shell/org/program context)
- **Authentication**: Login, RedirectToLoginPage
- **Loyalty/Promotions**: PromotionConfig, PromotionList
- **Error Handling**: NotFoundPage, NotEnabled

Also scan `app/components/organisms/` for organisms that have their
own Redux state (reducer.js + saga.js). These are effectively
sub-modules embedded in the component hierarchy.

### Step 3: Atomic Component Inventory

Count components at each Atomic Design level:

```
Glob: app/components/atoms/*/index.js → count
Glob: app/components/molecules/*/index.js → count
Glob: app/components/organisms/*/index.js → count
```

Do NOT list every component. Report counts and name a few
architecturally significant examples at each level.

### Step 4: Redux Architecture Mapping

Count and categorize Redux artifacts across the codebase:

```
Glob: app/**/reducer.js → count total reducers
Glob: app/**/saga.js → count total sagas
Glob: app/**/actions.js → count total action files
Glob: app/**/selectors.js → count total selector files
Glob: app/**/constants.js → count total constant files
```

Identify the dynamic injection pattern:
- Read `app/utils/injectReducer.js` — how reducers are injected
- Read `app/utils/injectSaga.js` — how sagas are injected
- Note the DAEMON mode and Vulcan SDK integration

### Step 5: Data Flow Analysis

Trace the standard data flow by examining one representative
feature module (use PromotionList or PromotionConfig):

1. Read the page's `index.js` — find `mapDispatchToProps` or
   `useDispatch` calls
2. Read `actions.js` — identify action creators
3. Read `constants.js` — identify action type constants
4. Read `saga.js` — identify watcher and worker sagas, API calls
5. Read `reducer.js` — identify state shape and transformations
6. Read `selectors.js` — identify memoized selectors

Document the full cycle: UI → dispatch → saga → API → reducer → selector → re-render.

### Step 6: Shared Layers Analysis

Scan each shared layer:

- **Services** (`app/services/`): Read `api.js` structure (don't read
  entire file — it's ~30KB). Note how requests are constructed.
  Read `requestConstructor.js` for the HTTP pattern.
- **Config** (`app/config/`): Read `endpoints.js` for API domain
  categories. Read `path.js` for routing config. Read `constants.js`
  for app-level constants.
- **Utils** (`app/utils/`): List directory contents. Categorize into
  hooks, HOCs, domain helpers. Note `injectReducer.js`,
  `injectSaga.js`, `authWrapper.js` as architecturally critical.
- **Root config** (`app-config.js`): Note app prefix and platform mode.

### Step 7: Integration Points

Identify external boundaries:

- **Vulcan SDK**: Read imports of `@capillarytech/vulcan-react-sdk`
  across the codebase (Grep). Summarize what SDK provides.
- **Cap UI Library**: Note `@capillarytech/cap-ui-library` usage as
  the mandated component system.
- **Other Cap packages**: Grep for `@capillarytech/` imports to find
  all Capillary platform integrations.
- **Backend APIs**: Summarize API domains from `endpoints.js` (do NOT
  list every endpoint — categorize by domain).
- **Third-party**: Note NewRelic, Locize/react-intl, GTM integration.

### Step 8: Key Packages

Read `package.json` dependencies (not devDependencies). Select the
10-15 packages that most shape the architecture. For each, write
a 1-sentence role description. Format as a Markdown table.

Criteria for inclusion:
- Framework packages (React, Redux, Router)
- Platform packages (@capillarytech/*)
- State management (redux-saga, redux-immutable, immer, reselect)
- Auth/routing integration (connected-react-router, redux-auth-wrapper)
- Monitoring (NewRelic)

Exclude: utility micro-packages, polyfills, CSS tools.

### Step 9: Conventions & Patterns

Document observed conventions:
- Atomic Design hierarchy and component organization
- Cap-* component mandate and CapRow/CapColumn layouts
- styled-components for styling
- Redux file co-location (actions, constants, reducer, saga, selectors
  in same directory)
- Dynamic injection via HOC composition
- PropTypes requirement
- ESLint rules (500-line limit, complexity 10)
- Naming conventions for actions, constants, selectors

### Step 10: Risks & Constraints

Identify and document:
- **Constraints**: Node version limits, React Router v5 lock-in,
  legacy redux-saga 0.16.x, react-redux 5.x (not hooks API)
- **Risks**: Large component surface area (175+), organisms with
  embedded Redux state, potential for cross-feature coupling
- **Assumptions**: Vulcan SDK stability, Cap UI Library compatibility
- **Debt**: Any patterns that deviate from conventions

## Composition Rules

When writing the final document:

1. **Be concise**: Each section should be the minimum needed for
   architectural understanding. Target 1500-2500 words total.
2. **No file-by-file listing**: Summarize at module/domain level.
3. **Use tables** for structured data (packages, module inventory).
4. **Use ASCII diagrams** for data flow and layer relationships.
5. **Factual language**: No opinions or recommendations. State what
   exists and how it works.
6. **Consistent headings**: Follow the template's H1/H2/H3 hierarchy
   exactly.
7. **AI-consumable**: Use structured, parseable formatting. An AI
   agent loading this document should be able to extract module names,
   data flow patterns, and integration points programmatically.

## Focus Area (Optional)

If the user provides a focus area argument ($ARGUMENTS), give extra
depth to that section while still producing the complete document.
Valid focus areas: modules, dataflow, integrations, packages, risks.
