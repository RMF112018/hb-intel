# 03 — B06 Validation and Closeout Requirements

## 1. Validation objective

Prove that the repo now accurately reflects B06’s authority and no longer carries direct B06-related contradictions in the My Dashboard plan suite.

---

# 2. Required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 3. Validate B06 predecessor filename correction

```bash
! rg -n "B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

rg -n "B05_Adobe_Sign_Integration_Architecture_Development.md" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

---

# 4. Validate README authority-index refresh

```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|Sections 22|Sections 23|Sections 27|Section 18" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

# 5. Validate outline batch-authority expansion

```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 6. Validate Section 18 reconciliation

```bash
rg -n "Retry-After|rate-limited|authorization-required|provider error|sanitized|source-unavailable|partial|401|400|500" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

The agent should verify these terms appear in the intended Section 18 context, not merely elsewhere in the file.

---

# 7. Validate Section 22 reconciliation

```bash
rg -n "manual refresh|auto-poll|No durable queue cache|no durable queue cache|generatedAtUtc|isStale|Retry-After|webhook" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 8. Validate Section 23 reconciliation

```bash
rg -n "refresh tokens|access tokens|OAuth authorization codes|agreement titles|sender emails|source-open URLs|raw provider error|evidence|telemetry" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 9. Validate Section 27 risk register uplift

```bash
rg -n "token leakage|stale queue|retry storm|unsafe source|telemetry|evidence|throttling|principal mapping" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 10. Validate B06-closed open-item cleanup

The open-items section must not continue to present either of the following as unresolved:

```bash
! rg -n "Final backend source-unavailable transport choice" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

! rg -n "Final backend queue cache posture" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 11. Docs-only scope verification

```bash
git diff --name-only
git diff --stat
```

Expected changed paths should remain limited to:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 12. Formatting / lint posture

Run the repo’s available Markdown or formatting checks if they are defined and applicable.  
Do not invent commands.

At minimum:
- confirm clean Markdown structure,
- confirm tables render plausibly,
- confirm code fences remain balanced,
- confirm path strings are exact and consistent.

---

# 13. Required closeout report

The local-agent closeout must include:

1. **Verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Files changed**
4. **B06 predecessor filename correction**
5. **README updates**
6. **Outline authority-table updates**
7. **Section 18/22/23/27 reconciliation summary**
8. **Open-item cleanup summary**
9. **Validation commands and outcomes**
10. **Proof that runtime code, manifests, and lockfiles were untouched**
11. **Residual out-of-scope drift, if any**
12. **Recommended commit summary and description**

Suggested commit title:

```text
docs(my-dashboard): reconcile B06 resilience and security authority
```
