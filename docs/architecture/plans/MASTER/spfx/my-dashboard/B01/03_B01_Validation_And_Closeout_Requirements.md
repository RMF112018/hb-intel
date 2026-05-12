# 03 — B01 Validation and Closeout Requirements

## 1. Validation objective

Prove that B01 documentation alignment has been implemented completely, without runtime scope drift.

---

## 2. Required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 3. Required content checks

## 3.1 Dev-plan README authority map
```bash
rg -n "B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|outline|Sections 0.?5|Sections 6|live repo truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

## 3.2 Outline batch-authority posture
```bash
rg -n "B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|batch authority|repo truth|@hbc/my-work-feed|Personal Work Hub" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 3.3 Superseded legacy alignment contract
```bash
rg -n "Superseded|Archived|Supersession notice|ADR-0115|SF29-My-Work-Feed|packages/my-work-feed/README.md|docs/reference/my-work-feed/api.md" \
  docs/reference/workflow-experience/my-work-alignment-contract.md
```

## 3.4 Active cross-reference corrections
```bash
rg -n "Legacy My Work Alignment Contract|superseded archival|ADR-0115|@hbc/my-work-feed" \
  docs/reference/work-hub/runway-definition.md \
  docs/reference/provisioning/work-hub-publication-contract.md \
  docs/reference/workflow-experience/primitive-integration-checklist.md
```

## 3.5 Prohibit “future My Work implementation” drift in active checklist
```bash
! rg -n "future My Work implementation" \
  docs/reference/workflow-experience/primitive-integration-checklist.md
```

## 3.6 Correct ADR reference in active SF29 docs
```bash
! rg -n "ADR-0114-my-work-feed|ADR-0114: My Work Feed|docs/architecture/adr/ADR-0114-my-work-feed.md" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md

rg -n "ADR-0115-my-work-feed-architecture|ADR-0115: My Work Feed Architecture" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

---

## 4. Docs-only scope validation

The agent must show changed paths:

```bash
git diff --name-only
```

Expected changed paths must remain confined to the documented markdown files plus the newly created My Dashboard dev-plan README.

The local agent must explicitly confirm that it did **not** change:
- `apps/`
- `packages/` runtime source
- `backend/`
- SPFx manifests
- package solution files
- lockfiles

---

## 5. Formatting / lint posture

Use the repository’s established Markdown formatter/checker if a targeted command exists.

Minimum acceptable evidence:
- changed Markdown files are consistently formatted,
- link paths are internally coherent,
- tables render cleanly,
- backticks/code fences remain balanced.

If the repo exposes a specific formatter or documentation lint command for changed Markdown, run it and report the result. Do not invent a command that does not exist.

---

## 6. Required closeout report

The local agent’s final closeout must include:

1. **Final verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Changed files**
4. **Purpose of each changed file**
5. **Validation commands executed**
6. **Validation outcomes**
7. **Evidence that no runtime code changed**
8. **Any residual out-of-scope drift intentionally left untouched**
9. **Recommended commit summary and description**

---

## 7. Recommended commit language

### Commit summary
```text
docs(my-dashboard): harden B01 authority chain and My Work reference truth
```

### Commit description
```text
- add a My Dashboard dev-plan README that defines B01/B02/outline authority and downstream handoff rules
- update the My Dashboard comprehensive outline so developed batch artifacts outrank the umbrella scaffold for their sections
- supersede the stale My Work alignment contract and correct active references that still present it as current authority
- normalize active SF29 My Work Feed docs to ADR-0115 and remove ADR-0114 drift
- preserve docs-only B01 scope with no runtime implementation changes
```
