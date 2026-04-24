---
source: {{PRD_SOURCE}}
feature: {{FEATURE_NAME}}
generated: {{TIMESTAMP}}
status: awaiting-resolution
figma-nodes: {{FIGMA_NODE_LIST}}
---

# Clarifications: {{FEATURE_NAME}}

> **For reviewers** — fill the `Answer:` block under each question. When every question is answered (or consciously skipped), change `status:` at the top to `resolved`. Then run `/filter-prd` on this file.

**Source PRD:** {{PRD_SOURCE}}
**Figma:**
{{FIGMA_LINKS_LIST}}
<!-- Format each link as: - **Screen Label:** full-figma-url -->
<!-- Example:
- **Listing:** https://www.figma.com/design/xxx?node-id=123-456&m=dev
- **Create:** https://www.figma.com/design/xxx?node-id=789-012&m=dev
If only one link, still use the list format. If no Figma links: "N/A"
-->

---

## Questions ({{N}})

<!-- Category tags (PM-facing):
     - Design       = Figma vs PRD mismatch or design-only elements
     - Spec Gap     = vague, missing, or underspecified PRD content
     - Backend      = missing API contract or payload; field-level mismatch between Figma UI fields and BE payload fields (both directions)
     - Rules        = validation, permissions, error/empty states
     - Architecture = conflicts with existing garuda-ui patterns
-->

### Q1 — [{{CATEGORY}}] {{ONE_LINE_TITLE}}

**Context:** {{ONE_OR_TWO_LINES_COMBINING_WHAT_AND_WHY}}

**If unanswered:** {{DEFAULT_WE_WILL_USE}}

**Owner:** {{PM | Designer | BE | Tech Lead}}

**Answer:**
```
<fill here>
```

---

<!-- Repeat for Q2..QN. No quantity cap — include every distinct decision the reviewer must make. Cluster per decision, not per symptom. -->

---

## Appendix — traceability (do not edit)

- **Source PRD:** `{{PRD_SOURCE}}`
- **Figma nodes fetched:**
{{FIGMA_NODES_WITH_URLS}}
<!-- Format each as: - **Screen Label:** full-figma-url (nodeId: X:Y) -->
- **Figma artifacts cached at:** `claudeOutput/figma-capui-mapping/<nodeId>/`
- **Architecture reference:** `.claude/output/architecture.md`
- **System map reference:** `.claude/output/loyalty-promotions-system-map.md`
