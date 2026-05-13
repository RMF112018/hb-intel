# Prompt 02 — Refresh Dev-Plan README for B04/B05 Authority

## 1. Objective

Update:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

so the My Dashboard development-plan authority index accurately reflects the committed B04 artifact and the newly added B05 artifact.

---

## 2. Why this work exists

The README already exists and defines the dev-plan authority hierarchy, but its artifact table currently stops at B03 and says later artifacts should extend the table. That guidance is now stale because B04 exists and B05 is being added.

---

## 3. Current repo-truth problem or gap

The current README:
- correctly defines the authority hierarchy,
- correctly explains the role of B01–B03,
- but does not yet index:
  - `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`
  - `B05_Adobe_Sign_Integration_Architecture_Development.md`

As a result, the folder index no longer reflects the actual plan family.

---

## 4. Attached B05 authority / plan basis

B05 should be indexed as the detailed authority for:

```text
Sections 15, 16, 17, and 20
```

B04 should remain indexed as the detailed authority for:

```text
Sections 12, 13, 18, and 24
```

The README should preserve its existing live-repo-truth-first hierarchy and simply make the batch inventory current.

---

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

---

## 6. Required implementation outcome

The README must:
1. add B04 to its artifact index table,
2. add B05 to its artifact index table,
3. accurately state each artifact’s governed section set,
4. update its later-batch inheritance language so B05 is read before future security/resilience/testing/live-integration implementation planning,
5. preserve the existing authority hierarchy and B01 closed foundation decisions.

---

## 7. Detailed change instructions

### A. Artifact table update
Add rows substantively equivalent to:

| Artifact | Role |
|---|---|
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Authoritative detailed development for **Sections 12, 13, 18, and 24**. |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Authoritative detailed development for **Sections 15, 16, 17, and 20**. |

### B. Later-batch inheritance text
Update the later-batch inheritance paragraph/list so future agents are told to read:
- this README,
- live repo truth,
- B01 through B05 as applicable,
- then the applicable later batch artifact,
- then the outline only where detailed batch authority does not yet exist.

### C. Optional small wording correction
If the README still says “Artifacts added later (B04 and beyond) must extend this table,” revise it because B04/B05 are no longer future artifacts. Keep a forward-looking version such as:
- “Artifacts added after B05 must extend this table...”

---

## 8. What done looks like

Done means:
- README artifact table is current through B05,
- B04 and B05 section ownership is explicit,
- future reading order is unambiguous,
- the file remains a compact authority index rather than an overloaded batch summary.

---

## 9. Strict constraints / prohibitions

Do not:
- rewrite the README from scratch,
- duplicate the full B04/B05 artifact contents,
- modify the outline in this prompt,
- modify runtime code,
- introduce implementation sequencing beyond high-level reading-order guidance.

---

## 10. Validation requirements

Run:

```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|Sections 12, 13, 18, and 24|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20|after B05" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

## 11. Proof of closure

Report:
- rows added,
- reading-order text updated,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Include the README update in the final B05 closeout summary.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Re-open only the README and the B04/B05 artifact titles/section scopes as needed.
