# Prompt 05 — Validate B05 Documentation Alignment and Produce Closeout

## 1. Objective

Validate that all B05 documentation-alignment work is complete, docs-only, and ready for future live-integration prompt planning.

---

## 2. Why this work exists

Prompts 01–04 create and update multiple planning docs. B05 is only complete if the final repo state:
- proves the canonical B05 artifact exists,
- proves README and outline authority chains are current,
- proves outline body drift was corrected,
- proves already-closed open items were pruned/reframed,
- proves no runtime work was introduced.

---

## 3. Current repo-truth problem or gap

Before this prompt, the repo has undergone targeted doc edits. This prompt validates the combined B05 end state and produces a deterministic closeout report.

---

## 4. Attached B05 authority / plan basis

B05 requires:
- delegated OAuth architecture,
- stable actor-key grant binding,
- backend-only credential persistence posture,
- bounded `POST v6/search`,
- safe handoff URL constraints,
- clear downstream implementation dependency gates,
- no runtime implementation in this docs package.

Prompt 05 proves those requirements are now durably represented in repo docs.

---

## 5. Exact files, folders, docs, and symbols to inspect

Validate only:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 6. Required implementation outcome

Produce a final local-agent report that:
- confirms the B05 artifact exists,
- confirms the README and outline authority mappings are current,
- confirms outline Sections 15/16/17/20 align with B05,
- confirms contradiction checks pass,
- confirms changed paths are docs-only,
- provides a PASS / FAIL verdict,
- provides recommended commit text.

---

## 7. Detailed validation instructions

### A. Run required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### B. Validate the B05 artifact

```bash
rg -n "B05 — HB Intel My Dashboard Adobe Sign Integration Architecture|4514a4fda765a0ac40801006374f277beddd7c5a|Sections \\*\\*15\\*\\*, \\*\\*16\\*\\*, \\*\\*17\\*\\*, and \\*\\*20\\*\\*" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

### C. Validate README authority index

```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20|after B05" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### D. Validate outline authority table

```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### E. Validate outline Section 15/16/17/20 posture

```bash
rg -n "claims\\.oid|tenant context|app-only|grant record|delegated OAuth|authorization-code flow|POST v6/search|pageSize|cursor|source-supported sort|Retry-After|sourceOpenUrl|signing URL|web_access_point" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### F. Run negative drift checks

```bash
! rg -n "normalized `preferred_username`|normalized `upn`|normalized `email`|Final exact claim precedence for actor email resolution|nearest expiration date first" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### G. Verify docs-only scope

```bash
git diff --name-only
git diff --stat
```

The changed-path report must remain limited to the three documented dev-plan Markdown files.

### H. Run available markdown formatting/lint checks if repo-defined
If a repo-native command exists for changed Markdown, run it and report the exact command/result. Do not invent a command.

---

## 8. What done looks like

Done means:
- all validation commands pass or any unavoidable unavailable command is transparently reported,
- changed files are exactly the expected docs,
- the final report can be handed to the session controller without open interpretation.

---

## 9. Strict constraints / prohibitions

Do not:
- perform new implementation edits during validation unless a validation failure reveals a prompt-scoped doc omission,
- broaden scope into runtime fixes,
- omit failed checks,
- declare PASS without evidence.

---

## 10. Validation requirements

This prompt is itself the final validation requirement. Execute every command above or report the exact reason a command is unavailable.

---

## 11. Proof of closure

The proof is:
- final closeout report,
- successful validation outputs,
- changed-path proof,
- final commit recommendation.

---

## 12. Commit/closeout expectations

Recommend:

```text
docs(my-dashboard): add B05 Adobe integration architecture plan and reconcile authority
```

Suggested description:

```text
- add the canonical B05 Adobe Sign integration architecture artifact for Sections 15/16/17/20
- refresh the My Dashboard dev-plan README so B04/B05 are indexed in the authority chain
- update the outline batch-authority posture for B03/B04/B05
- reconcile identity, OAuth, query, handoff, and open-item guidance to the B05 closed architecture
- preserve docs-only scope with no runtime code changes
```

Do not commit unless instructed.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use the post-edit repo state and exact changed files only.
