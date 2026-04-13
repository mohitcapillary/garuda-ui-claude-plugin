Generate UI development guidelines by scanning the garuda-ui codebase and cap-ui-library.

Use the `ui-guideline-agent` agent to execute all 6 phases autonomously:

1. Repo Auto-Discovery (package.json, file counts)
2. Cap-UI-Library Discovery (tokens, components, HOCs)
3. Source Code Analysis (35 Grep/Glob patterns across 16 categories)
4. Generate 16 Guideline Files (.claude/output/guidelines/)
5. Generate Master Index (.claude/output/GUIDELINES.md)
6. Console Summary

No user input is required. The agent self-discovers everything from the current working directory.

Output: `.claude/output/GUIDELINES.md` (master index linking to 16 individual guideline files)
