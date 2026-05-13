# Prompt 02 — Refresh Dev-Plan README and Outline Authority Through B07

## 1. Objective

Update:
1. the My Dashboard `dev-plan/README.md`, and
2. the comprehensive outline’s Batch Authority Posture

so both documents accurately surface developed authority through B07.

---

# 2. Current repo-truth problem

The README artifact index currently stops at B03, and the outline authority table currently stops at B02. That is stale because B04, B05, B06, and B07 exist.

---

# 3. Exact files to update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Reference as needed:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

---

# 4. Required README outcome

Extend the artifact index to include:

| Artifact | Role |
|---|---|
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Detailed authority for Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Detailed authority for Sections 15, 16, 17, and 20 |
| `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md` | Detailed authority for Sections 22, 23, and 27, plus operational refinements to Section 18 |
| `B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md` | Detailed authority for Sections 25 and 26, plus hosted-validation refinements to Sections 6, 8, and 27 |

Also:
- refresh stale prose that implies B04+ are not yet indexed,
- keep README concise and authority-map-oriented,
- preserve hierarchy: live repo truth > detailed batch artifact > outline > historical references.

---

# 5. Required outline authority-table outcome

Expand the Batch Authority Posture table to include:
- B03,
- B04,
- B05,
- B06,
- B07.

Use concise developed-authority descriptions that match the README.

Preserve:
- live repo truth outranking planning docs,
- detailed batch artifacts outranking outline sections they develop,
- folder README reference.

---

# 6. Strict constraints

Do not:
- modify the substantive body of Sections 6, 8, 25, 26, or 27 in this prompt,
- modify B07 itself,
- implement runtime changes,
- over-expand README into a duplicate of the batch artifacts.

---

# 7. Validation requirements

```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development|Sections 25|Sections 26|Sections 6|Sections 8|Sections 27" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 8. Proof of closure

Report:
- README rows added/updated,
- outline authority rows added/updated,
- any adjacent posture prose adjusted,
- validation results.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Use current context unless exact edit placement requires a fresh open.
