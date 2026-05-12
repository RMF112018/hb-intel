# 01 — B01 Repo-Truth Implementation Plan

## 1. Target end state

After execution, the repository should clearly communicate:

- where the My Dashboard planning authority lives,
- how B01, B02, and the master outline relate,
- that B01’s foundation decisions are closed and inherited,
- that My Dashboard must not conflict with implemented My Work Feed architecture,
- that legacy My Work alignment text is archival, not normative,
- that active SF29 docs point to the correct My Work Feed ADR.

---

## 2. Exact files to create/update

## 2.1 Create — My Dashboard development-plan README

### Path
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### Purpose
Establish the local document authority chain for the My Dashboard dev-plan family.

### Required contents
The README must include:
- folder purpose,
- document authority hierarchy,
- artifact index table,
- B01 / B02 section ownership,
- B01 closed foundation decisions,
- B02 coexistence note,
- later-batch inheritance rule,
- “outline is scaffold, batch artifacts are detailed authority” rule,
- no-runtime-implementation disclaimer.

---

## 2.2 Update — Comprehensive My Dashboard outline

### Path
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### Purpose
Prevent the broad outline from being misread as higher authority than completed detailed batch artifacts.

### Required changes
1. Add a clearly labeled **batch authority posture** near the top.
2. Add a batch artifact table covering:
   - outline,
   - B01,
   - B02.
3. State precedence:
   - live repo truth first,
   - batch artifact over outline for sections it has developed.
4. Incorporate B01’s My Work compatibility guardrail:
   - Personal Work Hub / `@hbc/my-work-feed` exists,
   - My Dashboard must not silently duplicate or contradict it.
5. Reinforce the PCC vs. My Dashboard Adobe Sign distinction.
6. Reinforce that B01 foundation decisions are not reopenable by later agents absent explicit new batch authority.

---

## 2.3 Update — stale My Work alignment contract and active references

### A. Supersede the stale alignment contract
```text
docs/reference/workflow-experience/my-work-alignment-contract.md
```

Required target posture:
- retain historical body for provenance,
- add a top-level supersession notice,
- mark it as **superseded / archival** rather than current normative authority,
- point readers to:
  - `ADR-0115-my-work-feed-architecture.md`
  - `SF29-My-Work-Feed.md`
  - `packages/my-work-feed/README.md`
  - `docs/reference/my-work-feed/api.md`

### B. Correct active documents that still point readers toward the stale contract
```text
docs/reference/work-hub/runway-definition.md
docs/reference/provisioning/work-hub-publication-contract.md
docs/reference/workflow-experience/primitive-integration-checklist.md
```

Required target posture:
- no active doc should present the stale alignment contract as a current My Work Feed authority,
- references may remain only as clearly labeled legacy/superseded archival context,
- the primitive integration checklist must stop describing My Work implementation as merely future if it refers to package-boundary drift.

---

## 2.4 Update — SF29 ADR-number drift

### Paths
```text
docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

### Purpose
Correct active My Work Feed planning docs that still point to a nonexistent `ADR-0114-my-work-feed.md`.

### Required target posture
These docs must point to:

```text
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
```

and remove or replace references implying that My Work Feed is governed by a My Work ADR-0114 path.

---

## 3. Sequencing logic

### Prompt 01 — README first
Create the local authority index before modifying other docs so the folder has an immediate landing page for later planning sessions.

### Prompt 02 — Outline second
Update the master outline after the README exists, allowing the outline and README to reinforce the same authority chain.

### Prompt 03 — Correct live My Work reference drift
Resolve the contradiction that B01 explicitly flags, then correct active docs that still route readers into that contradiction.

### Prompt 04 — Correct SF29 ADR drift
Address separate but related My Work authority confusion in active SF29 planning files.

### Prompt 05 — Validate and close
Run path checks, grep checks, docs-only scope checks, and prepare a final closure report.

---

## 4. Dependency logic

| Work item | Depends on | Why |
|---|---|---|
| Create dev-plan README | None | New folder authority artifact |
| Update outline | README creation | Both artifacts should align |
| Supersede alignment contract | None | Drift fix can occur independently |
| Update active references to alignment contract | Supersession notice | References should point to known legacy status |
| Correct SF29 ADR references | None | Separate authority drift fix |
| Validation | All prior prompts | Must prove final combined state |

---

## 5. Conflicts to avoid

Do not:
- rewrite B01 to absorb B02,
- rewrite B02 as part of B01,
- add speculative later-batch sections,
- delete historical archival documents merely because they contain older truth,
- convert B01 work into runtime implementation,
- create a second My Work doctrine doc that competes with ADR-0115 / SF29,
- use “consider,” “optional,” or “developer may decide” language in the repo changes.

---

## 6. Intended final repository truth

The finished repo should tell a later developer, unambiguously:

1. **Read this folder README first.**
2. **Use B01 for the foundation and scope decisions.**
3. **Use B02 for hosting/packaging/auth/runtime development decisions.**
4. **Use the outline only as the overall scaffold.**
5. **Do not infer that My Work Feed is future-only.**
6. **Do not confuse PCC Adobe Sign with My Dashboard Adobe Sign Action Queue.**
7. **Do not invent My Dashboard architecture that silently conflicts with `@hbc/my-work-feed`.**
