# Prompt 01 — Correct B06 Predecessor Path and Refresh Dev-Plan Authority Index

## 1. Objective

Perform two tightly related documentation-truth updates:

1. Correct the outdated B05 predecessor filename references inside the existing B06 artifact.
2. Refresh the My Dashboard `dev-plan/README.md` so its authority index reflects B04, B05, and B06.

---

# 2. Why this work exists

Live repo truth shows:

- the canonical B06 artifact already exists,
- the actual B05 artifact filename is:
  ```text
  B05_Adobe_Sign_Integration_Architecture_Development.md
  ```
- B06 still references a longer non-live B05 filename,
- the dev-plan README currently indexes only through B03.

This creates a cross-reference defect and an authority-index defect.

---

# 3. Exact files to inspect and update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

Reference only as needed:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
```

---

# 4. Required implementation outcome

## A. B06 artifact correction
Inside B06, replace every occurrence of:

```text
B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md
```

with:

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

Do not alter B06’s substantive content.

## B. README authority-index refresh
Update the artifact index table to include:
- B04,
- B05,
- B06.

Use accurate authority statements:

| Artifact | Role |
|---|---|
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Detailed authority for Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Detailed authority for Sections 15, 16, 17, and 20 |
| `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md` | Detailed authority for Sections 22, 23, and 27, plus operational refinements to Section 18 |

Also update stale prose that implies B04 and beyond are not yet indexed.

---

# 5. Detailed README change instructions

Revise the README so it:

1. no longer says future artifacts “B04 and beyond” must extend the table as though B04–B06 are absent,
2. clearly identifies developed coverage through B06,
3. preserves the existing hierarchy:
   - live repo truth,
   - detailed batch artifact,
   - outline,
   - historical references,
4. does not duplicate the full B06 artifact,
5. remains concise and index-oriented.

A compact “Current Developed Coverage Through B06” subsection is acceptable if it improves clarity.

---

# 6. Strict constraints

Do not:
- add a duplicate B06 artifact,
- rename B06,
- rename B05,
- edit the outline in this prompt,
- alter runtime code,
- modify lockfiles/manifests,
- perform opportunistic cleanup outside the two target docs.

---

# 7. Validation requirements

```bash
! rg -n "B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

rg -n "B05_Adobe_Sign_Integration_Architecture_Development.md" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md

rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development|Sections 22|Sections 23|Sections 27|Section 18" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

# 8. Proof of closure

Report:
- exact B06 predecessor filename correction made,
- README table rows added,
- any prose updated to reflect B06 authority,
- validation results.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Use current context efficiently. Re-open only the exact files necessary for precise edit placement.
