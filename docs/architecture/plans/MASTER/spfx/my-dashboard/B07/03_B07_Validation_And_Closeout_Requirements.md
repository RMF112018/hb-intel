# 03 — B07 Validation and Closeout Requirements

## 1. Validation objective

Prove that the repo now accurately reflects B07’s authority and current-main repo truth without introducing runtime implementation.

---

# 2. Required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 3. Validate B07 predecessor filename correction

```bash
! rg -n "B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md

rg -n "B05_Adobe_Sign_Integration_Architecture_Development.md" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

---

# 4. Validate B07 current-main repo-truth reconciliation

The final B07 artifact should positively acknowledge current-main shell/runtime facts:

```bash
rg -n "MyDashboardApp.tsx|MyWorkShell.tsx|MyWorkPrimaryNavigation.tsx|MyWorkHeroBand.tsx|useMyWorkShellState.ts|MyWorkNavigation.ts" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

It should not continue to present stale claims as unconditional current truth. Validate that the following strings are absent or explicitly rewritten/qualified so they are not asserted as current-main fact:

```bash
! rg -n "visible app body remains the B02 placeholder host" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md

! rg -n "Real My Work shell\\.?" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

If exact wording differs, the agent must perform a manual reading check and report how the stale statements were neutralized.

---

# 5. Validate README authority-index refresh

```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development|Sections 25|Sections 26|Sections 6|Sections 8|Sections 27" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

# 6. Validate outline batch-authority expansion

```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 7. Validate outline Section 6 / 8 / 25 / 26 / 27 reconciliation

## Section 6 cues
```bash
rg -n "hosted|communication site|full-width|target page|review-state|production-host" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## Section 8 cues
```bash
rg -n "runtime package version|runtimeMarkerId|MY_DASHBOARD_EXPECTED_PACKAGE_VERSION|critical runtime|package-truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## Section 25 cues
```bash
rg -n "Validation Matrix|Definition of Done|hosted Playwright|package-truth|conditional hosted|curated evidence" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## Section 26 cues
```bash
rg -n "dependency-gated|Gate|Phase 0|Phase 10|hosted evidence|operator-pending" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## Section 27 cues
```bash
rg -n "local-only false confidence|package/runtime drift|screenshot false|auth-state|queue evidence|runtime version|deployment page drift|permission" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

The agent should verify these terms appear in the intended sections rather than elsewhere by coincidence.

---

# 8. Validate B07-closed item cleanup

If the outline has unresolved-item language directly closed by B07, it must be removed or reframed. Search for candidate stale decision cues and manually verify closure:

```bash
rg -n "final hosted validation posture|final evidence lane|final Definition of Done|final phase sequence|runtime version proof" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

The agent should report which items were:
- removed,
- reframed as closed,
- or left because they were not actually in the outline.

---

# 9. Docs-only scope verification

```bash
git diff --name-only
git diff --stat
```

Expected changed paths should remain limited to:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 10. Formatting / lint posture

Run the repo’s available Markdown or formatting checks if they are defined and applicable.  
Do not invent commands.

At minimum:
- confirm Markdown structure remains coherent,
- confirm tables render plausibly,
- confirm code fences remain balanced,
- confirm path strings are exact and consistent.

---

# 11. Required closeout report

The local-agent closeout must include:

1. **Verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Files changed**
4. **B07 predecessor filename correction**
5. **B07 current-main repo-truth reconciliation**
6. **README updates**
7. **Outline authority-table updates**
8. **Section 6 / 8 / 25 / 26 / 27 reconciliation summary**
9. **B07-closed-item cleanup result**
10. **Validation commands and outcomes**
11. **Proof that runtime code, manifests, and lockfiles were untouched**
12. **Residual out-of-scope drift, if any**
13. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): reconcile B07 validation and evidence authority
```
