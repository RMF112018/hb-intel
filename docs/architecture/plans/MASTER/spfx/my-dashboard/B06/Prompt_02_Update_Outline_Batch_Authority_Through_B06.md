# Prompt 02 — Update Outline Batch Authority Through B06

## 1. Objective

Update the comprehensive My Dashboard outline’s **Batch Authority Posture** so it reflects the developed batch artifacts through B06.

---

# 2. Current repo-truth problem

The outline currently identifies only B01 and B02 in its batch-authority table. That is stale because:
- B03 exists,
- B04 exists,
- B05 exists,
- B06 exists.

Later readers should not infer that only B01 and B02 are developed authorities.

---

# 3. Exact file to update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Reference as needed:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

# 4. Required implementation outcome

Extend the Batch Authority Posture table to include:

| Artifact | Developed authority |
|---|---|
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | My Work shell, navigation, hero, and UX section family governed by B03 |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Sections 15, 16, 17, and 20 |
| `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md` | Sections 22, 23, and 27, plus required operational refinements to Section 18 |

Preserve:
- the statement that live repo truth outranks planning docs,
- the statement that detailed batch artifacts outrank the outline for developed sections,
- the folder README reference.

---

# 5. Recommended outline edits

In addition to expanding the table:
1. adjust any nearby sentence that currently suggests only B01/B02 are developed artifacts,
2. keep the outline a scaffold, not a batch duplication artifact,
3. do not insert B06 details here; that belongs in Prompts 03 and 04.

---

# 6. Strict constraints

Do not:
- alter Sections 18/22/23/27 in this prompt,
- modify B06 itself,
- modify the README in this prompt,
- implement runtime code,
- rewrite unrelated outline sections.

---

# 7. Validation requirements

```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 8. Proof of closure

Report:
- the authority table additions,
- any adjacent posture prose adjusted,
- validation result.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Use current context unless exact edit placement requires a fresh open.
