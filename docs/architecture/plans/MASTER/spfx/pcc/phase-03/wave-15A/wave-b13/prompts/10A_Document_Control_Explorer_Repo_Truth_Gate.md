# Phase 08 Prompt 10A — Document Control Explorer Repo-Truth Gate

## Role

You are implementing **Phase 08 Prompt 10A** in the `RMF112018/hb-intel` repo.

This prompt is a **pre-edit repo-truth gate only**. Do not modify runtime source code. Do not implement the explorer yet. Your job is to establish the safe execution baseline for Prompts 10B–10G.

---

## Objective

Audit current repo truth against:

```text
Phase 08 Prompt 10 — Document Control Explorer Target Architecture and Implementation Plan
```

and report whether the explorer implementation sequence can proceed safely.

---

## Critical Parallel-Work Rule

**Project Home work may be occurring in parallel.**

Treat any Project Home drift as valid parallel/operator-owned work unless evidence proves otherwise.

Do not:
- revert it;
- clean it up;
- stage it;
- edit it;
- use it as a reason to stop unless it directly blocks the Document Control explorer work.

If a shared file has parallel Project Home edits, classify it precisely and state whether Prompt 10 can proceed around it.

---

## Inputs to Read

Read only the files needed to confirm current truth. Do not re-read files already still within context or memory unless drift verification requires it.

Minimum read targets:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Experience_Enhancement.md
Phase 08 Prompt 10 Explorer package README and target architecture plan supplied by the operator
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Use additional files only when necessary to verify a concrete drift finding.

---

## Required Checks

1. Record:
   - current branch;
   - starting HEAD;
   - `git status --short`;
   - lockfile md5.

2. Confirm the existing Documents surface is still card/lane based or classify drift.

3. Confirm:
   - eight-tab model remains intact;
   - `documents` is still the internal primary tab id;
   - `Document Control` remains the visible label where applicable;
   - existing document module IDs still include:
     - `primary-documents`
     - `document-control-center`
     - `sharepoint-project-record`
     - `my-project-files`
     - `procore-documents`
     - `document-crunch`
     - `adobe-sign`.

4. Confirm whether `PccSurfaceRouter` still does **not** pass `activeModuleId` into `PccDocumentsSurface`.

5. Confirm `data-pcc-active-surface-panel` remains shell-owned, not card-owned.

6. Confirm the Documents read-model guardrails remain present:
   - no full OneDrive root;
   - no other-project OneDrive folder exposure;
   - no external writeback.

7. Identify any parallel Project Home drift:
   - files;
   - whether they block Prompt 10;
   - whether they are safe to leave untouched.

8. Compare the old Prompt 10 objective with the new Explorer target and state explicitly that the old prompt should be considered superseded for implementation purposes.

---

## Required Output

Return a concise auditor-style result with:

1. **Verdict**
   - `Proceed to 10B`
   - `Proceed with noted safe drift`
   - `Blocked`

2. **Current repo-truth findings**

3. **Parallel Project Home drift classification**

4. **Document Control implementation implications**

5. **Hard-stop findings, if any**

6. **Recommended next prompt**

---

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

No source edits are authorized in Prompt 10A.
