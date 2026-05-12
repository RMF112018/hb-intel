# Prompt 05 — Validate B01 Documentation Alignment and Produce Closeout

## 1. Objective

Validate that all B01 documentation-alignment work is complete, docs-only, and ready for handoff to later My Dashboard batches.

---

## 2. Why this work exists

The preceding prompts create and update multiple planning/reference documents. B01 is only complete if the final repo state:
- proves authority-chain hardening landed,
- proves stale My Work authority references were corrected,
- proves SF29 ADR drift is removed,
- proves no runtime scope drift occurred.

---

## 3. Current repo-truth problem or gap

Before Prompt 05, the repo has undergone targeted documentation edits. This prompt verifies the combined end state and produces a deterministic closeout.

---

## 4. Attached B01 authority / plan basis

B01 requires:
- durable documentation inheritance,
- no runtime implementation,
- explicit authority around My Dashboard / My Work / Adobe Sign taxonomy,
- correction of stale/conflicting docs that can mislead later implementation.

Prompt 05 proves those requirements are met.

---

## 5. Exact files, folders, docs, and symbols to inspect

Validate only the changed documentation scope:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

docs/reference/workflow-experience/my-work-alignment-contract.md
docs/reference/work-hub/runway-definition.md
docs/reference/provisioning/work-hub-publication-contract.md
docs/reference/workflow-experience/primitive-integration-checklist.md

docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

---

## 6. Required implementation outcome

Produce a final local-agent report that:
- confirms all required docs exist,
- confirms required authority phrases exist,
- confirms stale phrases are absent where they should be absent,
- confirms changed paths are documentation-only,
- provides a final PASS / FAIL verdict,
- provides recommended commit text.

---

## 7. Detailed change instructions

### A. Run required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### B. Run required content checks

```bash
rg -n "B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|outline|Sections 0.?5|Sections 6|live repo truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

rg -n "Batch Authority|B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|@hbc/my-work-feed|Personal Work Hub|adobe-sign-action-queue|live repo truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "Superseded|Archived|Supersession notice|ADR-0115|SF29-My-Work-Feed|packages/my-work-feed/README.md|docs/reference/my-work-feed/api.md" \
  docs/reference/workflow-experience/my-work-alignment-contract.md

rg -n "Legacy My Work Alignment Contract|superseded archival|ADR-0115|@hbc/my-work-feed" \
  docs/reference/work-hub/runway-definition.md \
  docs/reference/provisioning/work-hub-publication-contract.md \
  docs/reference/workflow-experience/primitive-integration-checklist.md

! rg -n "future My Work implementation" \
  docs/reference/workflow-experience/primitive-integration-checklist.md

! rg -n "ADR-0114-my-work-feed|ADR-0114: My Work Feed|docs/architecture/adr/ADR-0114-my-work-feed.md" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md

rg -n "ADR-0115-my-work-feed-architecture|ADR-0115: My Work Feed Architecture" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

### C. Verify docs-only scope

```bash
git diff --name-only
git diff --stat
```

The changed-path report must be limited to the expected Markdown files.

### D. Run available formatting/lint checks if the repository provides a targeted docs/Markdown command

If such a command exists in repo scripts/docs, run it and report the exact command/result.  
Do not invent a command.

### E. Prepare the final closeout report

The closeout must include:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Created docs
4. Updated docs
5. Validation commands/results
6. Formatting/lint results if available
7. Confirmation that runtime code was untouched
8. Residual out-of-scope drift, if any
9. Suggested commit summary and commit description

---

## 8. What done looks like

Done means:
- all validation checks pass,
- changed paths are docs-only,
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

This prompt is itself the validation requirement. Execute every command above or report the exact reason a command is unavailable.

---

## 11. Proof of closure

The proof is the final closeout report plus successful validation command output summaries.

---

## 12. Commit/closeout expectations

Recommend:

```text
docs(my-dashboard): harden B01 authority chain and My Work reference truth
```

Suggested description:

```text
- add the My Dashboard dev-plan authority README and establish B01/B02/outline precedence
- update the master outline to inherit batch authority and preserve B01 taxonomy guardrails
- supersede the stale My Work alignment contract and correct active references
- normalize active SF29 My Work Feed ADR references to ADR-0115
- close B01 as a docs-only foundation alignment batch with validation evidence
```

Do not commit unless instructed.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

This prompt should use the post-edit repo state and exact changed files only.
