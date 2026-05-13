# Prompt 03 — Update Outline Batch Authority for B03/B04/B05

## 1. Objective

Update the top authority section of:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

so the outline accurately identifies B03, B04, and B05 as developed batch authorities.

---

## 2. Why this work exists

The outline already has a “Batch Authority Posture” section, but its artifact table still lists only B01 and B02. That no longer matches live repo truth after B03/B04 and the new B05 artifact.

If left stale, the outline can mislead future agents into:
- treating it as more current than B03/B04/B05,
- missing which artifact governs which sections,
- re-litigating decisions already closed.

---

## 3. Current repo-truth problem or gap

Current outline authority table includes:
- B01,
- B02,
- this outline.

It omits:
- B03,
- B04,
- B05.

---

## 4. Attached B05 authority / plan basis

B05 must be recorded as the detailed authority for:

```text
Sections 15, 16, 17, and 20
```

The authority posture must explicitly preserve:
- live repo truth first,
- applicable detailed batch artifact second,
- outline scaffold third.

---

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

## 6. Required implementation outcome

The outline’s batch-authority area must:
1. include B03,
2. include B04,
3. include B05,
4. state B05 governs Sections 15/16/17/20,
5. state the outline cannot override those detailed batch artifacts,
6. preserve the existing repo-truth-first hierarchy.

---

## 7. Detailed change instructions

### A. Update the artifact table
Add rows with accurate artifact titles and section ownership:

| Artifact | Developed authority |
|---|---|
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | My Work shell/navigation/UX batch scope as defined in B03 |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Sections 15, 16, 17, and 20 |

Do not guess B03’s section numbers if the artifact expresses its governed scope differently; use the exact B03 artifact wording.

### B. Strengthen the note beneath the table
Add or revise one sentence stating that:
- Sections 15/16/17/20 are now governed by B05,
- the outline may summarize them but may not contradict or weaken B05.

### C. Preserve the outline’s role
Do not turn the authority header into a long narrative. It should remain a concise reading-order guide.

---

## 8. What done looks like

Done means:
- outline authority table reflects B01–B05 accurately,
- B05’s governed sections are explicit,
- future readers understand the outline is subordinate to B05 for those sections.

---

## 9. Strict constraints / prohibitions

Do not:
- edit Sections 15/16/17/20 in this prompt,
- edit Section 29 open items in this prompt,
- change runtime code,
- rewrite the outline’s full header,
- create a new authority doc outside the existing README and outline.

---

## 10. Validation requirements

Run:

```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20|cannot override|live repo truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 11. Proof of closure

Report:
- authority table rows added,
- B05 section ownership line inserted,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Include this authority-table refresh in the final B05 closeout.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use the current outline and the exact B03/B04/B05 scope declarations only.
