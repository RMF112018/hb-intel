# Prompt 01 — Add B05 Authoritative Batch Artifact

## 1. Objective

Create the canonical repo planning artifact:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

using the authoritative B05 artifact supplied to this session/package.

---

## 2. Why this work exists

The attached B05 artifact closes the Adobe Sign integration architecture for My Dashboard Sections 15, 16, 17, and 20. It must exist in the live repo’s dev-plan folder before README/index and outline documents can reliably point to it.

---

## 3. Current repo-truth problem or gap

The My Dashboard dev-plan folder already contains:
- README,
- B01,
- B02,
- B03,
- B04,
- comprehensive outline,

but it does not yet contain the canonical B05 batch artifact as a repo file.

---

## 4. Attached B05 authority / plan basis

Use the attached B05 file as the authoritative source. Preserve its:
- title,
- artifact status,
- prepared date,
- target initiative,
- repo continuation anchor,
- predecessor list,
- source outline,
- batch scope,
- executive verdict,
- detailed section development,
- dependency checklist,
- constraints and downstream inheritance notes,
- decisions closed table,
- final architecture quality gate.

Do not paraphrase it into a shorter local summary. Add the full authoritative artifact as the canonical repo planning file.

---

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

Confirm that the target B05 path does not already exist. If it exists unexpectedly, do not overwrite blindly; compare to the supplied B05 artifact and report the drift before proceeding.

---

## 6. Required implementation outcome

Create:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

The content must match the authoritative supplied B05 artifact in substance and structure.

---

## 7. Detailed change instructions

1. Add the B05 markdown file at the exact path above.
2. Preserve the supplied artifact’s continuation anchor:
   ```text
   4514a4fda765a0ac40801006374f277beddd7c5a
   ```
3. Preserve the immediate predecessor:
   ```text
   B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md
   ```
4. Preserve the binding predecessor list:
   - B01
   - B02
   - B03
   - B04
5. Preserve the batch scope:
   ```text
   Sections 15, 16, 17, and 20 only
   ```
6. Preserve the closed integration decisions:
   - delegated OAuth,
   - `CUSTOMER` app posture,
   - stable actor key,
   - app-only token rejection,
   - grant-record principal lookup,
   - backend-only refresh token persistence,
   - `POST v6/search`,
   - validated source handoff,
   - no signing URL default row CTA.
7. Do not edit other files in this prompt.

---

## 8. What done looks like

Done means:
- the B05 artifact exists at the canonical dev-plan path,
- the title and scope are correct,
- the continuation anchor and predecessors are preserved,
- no unrelated docs or runtime files changed.

---

## 9. Strict constraints / prohibitions

Do not:
- shorten the B05 artifact,
- convert closed decisions to recommendations,
- add runtime implementation notes not present in the supplied artifact,
- modify README or outline in this prompt,
- modify runtime code,
- create B06+ artifacts.

---

## 10. Validation requirements

Run:

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md

rg -n "B05 — HB Intel My Dashboard Adobe Sign Integration Architecture|4514a4fda765a0ac40801006374f277beddd7c5a|Sections \\*\\*15\\*\\*, \\*\\*16\\*\\*, \\*\\*17\\*\\*, and \\*\\*20\\*\\*" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

---

## 11. Proof of closure

Report:
- created file path,
- confirmation that the artifact scope and anchor match,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Prepare a one-paragraph change summary suitable for a docs commit.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use the supplied B05 artifact directly. Re-open repo files only to confirm the target path state.
