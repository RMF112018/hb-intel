# Prompt 05 — Validate B07 Documentation Alignment and Closeout

## 1. Objective

Validate the full B07 documentation reconciliation package and produce a deterministic closeout report.

---

# 2. Validation scope

Validate only the intended documentation scope:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 3. Execute all validation commands

## A. Path checks
```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## B. B07 predecessor filename correction
```bash
! rg -n "B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md

rg -n "B05_Adobe_Sign_Integration_Architecture_Development.md" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

## C. B07 current-main repo-truth reconciliation
```bash
rg -n "MyDashboardApp.tsx|MyWorkShell.tsx|MyWorkPrimaryNavigation.tsx|MyWorkHeroBand.tsx|useMyWorkShellState.ts|MyWorkNavigation.ts" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

Manual review required:
- confirm B07 preserves original `9a1cef...` audit anchor,
- confirm B07 now distinguishes that historical anchor from current main,
- confirm no unqualified current-truth sentence still claims the shell/navigation/hero runtime is absent.

## D. README index through B07
```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development|Sections 25|Sections 26|Sections 6|Sections 8|Sections 27" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

## E. Outline authority coverage through B07
```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## F. Section 6 / 8 / 25 / 26 / 27 reconciliation
```bash
rg -n "hosted|communication site|full-width|target page|review-state|production-host" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "runtime package version|runtimeMarkerId|MY_DASHBOARD_EXPECTED_PACKAGE_VERSION|critical runtime|package-truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "Validation Matrix|Definition of Done|hosted Playwright|package-truth|conditional hosted|curated evidence|provider|adapter|resilience" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "dependency-gated|Gate|Phase 0|Phase 10|hosted evidence|operator-pending" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "local-only false confidence|package/runtime drift|runtime version|critical runtime|clipping|screenshot false|auth-state|queue-content|deployment page drift|permission|overclaim" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## G. B07-dependent closure item review
```bash
rg -n "final hosted validation|final Definition of Done|final evidence|final phase sequence|runtime version proof" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Report:
- whether any directly B07-closed items existed,
- whether they were removed or reframed,
- whether any hits remain because they are descriptive rather than unresolved.

## H. Docs-only scope
```bash
git diff --name-only
git diff --stat
```

Expected changed files:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 4. Formatting / lint checks

If the repository exposes an applicable Markdown formatting or docs lint command, run it and report the exact command/result.

Do not invent a command.

---

# 5. Required closeout format

The local-agent closeout must include:

1. **Final verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Changed files**
4. **B07 predecessor filename correction**
5. **B07 current-main repo-truth reconciliation**
6. **README index refresh**
7. **Outline authority table update**
8. **Section 6 / 8 / 25 / 26 / 27 reconciliation summary**
9. **B07-dependent closure-item cleanup result**
10. **Validation commands and results**
11. **Docs-only scope confirmation**
12. **Residual out-of-scope drift if identified**
13. **Recommended commit summary**
14. **Recommended commit description**

Suggested commit summary:

```text
docs(my-dashboard): reconcile B07 validation and evidence authority
```

Suggested commit description:

```text
- correct B07’s B05 predecessor filename to match the live repo artifact
- reconcile B07’s original audit-anchor findings with current main shell/navigation/hero runtime truth
- extend the My Dashboard dev-plan README authority index through B07
- update the comprehensive outline batch-authority table through B07
- reconcile Sections 6, 8, 25, 26, and 27 with B07 hosted-validation, package-proof, validation-matrix, phase-sequence, and risk decisions
- remove or reframe directly B07-closed unresolved items where present
```

---

# 6. Do not re-read files already in active context unless needed to confirm drift

Use the post-edit repo state and only the changed Markdown files for validation.
