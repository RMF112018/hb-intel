# Prompt 05 — Validate B06 Documentation Alignment and Closeout

## 1. Objective

Validate the full B06 documentation reconciliation package and produce a deterministic closeout report.

---

# 2. Validation scope

Validate only the intended documentation scope:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 3. Execute all validation commands

## A. Path checks
```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## B. B06 predecessor filename drift
```bash
! rg -n "B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

rg -n "B05_Adobe_Sign_Integration_Architecture_Development.md" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

## C. README index through B06
```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|Sections 22|Sections 23|Sections 27|Section 18" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

## D. Outline authority coverage through B06
```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## E. Section 18 / 22 / 23 / 27 alignment
```bash
rg -n "Retry-After|rate-limited|authorization-required|sanitized|source-unavailable|partial|401|400|500|provider failure" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "manual refresh|auto-poll|no durable queue cache|generatedAtUtc|isStale|Retry-After|webhook" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "refresh tokens|access tokens|OAuth authorization codes|agreement titles|sender emails|source-open URLs|raw provider error|evidence|telemetry" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "token leakage|stale queue|retry storm|unsafe source|telemetry|evidence|throttling|principal mapping" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## F. Open items cleanup
```bash
! rg -n "Final backend source-unavailable transport choice" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

! rg -n "Final backend queue cache posture" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## G. Docs-only scope
```bash
git diff --name-only
git diff --stat
```

Expected changed files:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
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
4. **B06 predecessor filename correction**
5. **README index refresh**
6. **Outline authority table update**
7. **Section 18 reconciliation summary**
8. **Section 22/23/27 reconciliation summary**
9. **Open-items cleanup summary**
10. **Validation commands and results**
11. **Docs-only scope confirmation**
12. **Residual out-of-scope drift if identified**
13. **Recommended commit summary**
14. **Recommended commit description**

Suggested commit summary:

```text
docs(my-dashboard): reconcile B06 resilience and security authority
```

Suggested commit description:

```text
- correct B06’s B05 predecessor filename to match the live repo artifact
- extend the My Dashboard dev-plan README authority index through B06
- update the comprehensive outline batch-authority table through B06
- reconcile Section 18 with B06 operational route/error-taxonomy refinements
- reconcile Sections 22, 23, and 27 with B06 refresh, cache, telemetry, privacy, evidence, and risk decisions
- remove B06-closed open items that no longer belong in the unresolved decision list
```

---

# 6. Do not re-read files already in active context unless needed to confirm drift

Use the post-edit repo state and only the changed Markdown files for validation.
