# Phase 08 Prompt 10A — Document Control Explorer Repo-Truth Gate

## Role

You are implementing **Phase 08 Prompt 10A** in the `RMF112018/hb-intel` repo.

This prompt is a **pre-edit repo-truth and package-coordination gate only**.  
Do **not** modify runtime source code. Do **not** modify package documents, prompts, manifests, or reference artifacts. Do **not** implement the explorer yet. Your job is to establish the safe execution baseline for Prompts **10B–10G** and identify any package/documentation drift that should be corrected before implementation proceeds.

---

## Objective

Audit current repo truth against:

```text
Phase 08 Prompt 10 — Document Control Explorer Target Architecture and Implementation Plan
```

and determine whether the Explorer implementation sequence can proceed safely.

This gate must answer four questions:

1. **Is current PCC Documents runtime repo truth still compatible with the Explorer target architecture?**
2. **Are the Prompt 10 package documents internally coordinated enough to execute 10B–10G without ambiguity?**
3. **Is any Project Home or shared-file drift present, and can it be safely preserved?**
4. **Should the next step be Prompt 10B, package correction before 10B, or a hard stop?**

---

## Governing Context

### 1. Restored historical Prompt 10

The prior single-step prompt:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Experience_Enhancement.md
```

has been restored in the live repo for package traceability.

Prompt 10A must confirm that this file exists, but it must **not** treat that older single-step prompt as the governing implementation direction. The governing Prompt 10 direction for implementation is the Explorer target architecture and its follow-on `10A`–`10G` sequence.

### 2. Governing Explorer target plan

The implementation sequence is governed by:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
```

### 3. Package README

Use the package README as the execution mapping reference:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
```

### 4. Package manifest

Inspect the package manifest only to identify package coordination drift that could confuse execution sequencing:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/package_manifest.json
```

Prompt 10A is not authorized to repair any package/documentation inconsistencies. It must classify and report them.

---

## Critical Parallel-Work Rule

**Project Home work may be occurring in parallel.**

Treat any Project Home drift as valid parallel/operator-owned work unless evidence proves otherwise.

Do not:
- revert it;
- clean it up;
- stage it;
- edit it;
- reformat it;
- use it as a reason to stop unless it directly blocks the Document Control Explorer work.

If a shared file has parallel Project Home edits, classify it precisely and state whether Prompt 10 can proceed around it.

---

## Hard Boundaries for Prompt 10A

No edits are authorized.

Do **not**:
- modify runtime source;
- modify tests;
- modify prompts;
- modify package README or manifest;
- modify reference/supporting artifacts;
- stage files;
- clean the working tree;
- run formatting tools;
- run tests;
- run typecheck;
- change dependencies;
- generate evidence files.

Prompt 10A is strictly read-only inspection and reporting.

The starting and ending working-tree state should remain unchanged.

---

## Minimum Inputs to Read

Read only the files needed to confirm current truth. Do not re-read files already still within context or memory unless drift verification requires it.

### Package / prompt coordination files

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/package_manifest.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Experience_Enhancement.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10B_Document_Control_Explorer_Model_And_Fixture_Contract.md
```

### Runtime repo-truth files

```text
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

### A. Repo execution baseline

Record:
- current branch;
- starting HEAD;
- `git status --short`;
- lockfile md5;
- whether the working tree is clean or has pre-existing drift.

Do not modify the repo state during this prompt.

---

### B. Prompt 10 package coordination check

Confirm and report:

1. The restored historical single-step Prompt 10 exists at:

   ```text
   prompts/10_Document_Control_Experience_Enhancement.md
   ```

2. The Explorer target architecture file exists and is the governing implementation direction for Prompt 10 execution.

3. The README clearly replaces the prior single-step Prompt 10 with the Explorer plan and `10A`–`10G` sequence.

4. The README, Explorer target architecture, and Prompt 10B are internally consistent on:
   - Prompt 10 execution sequence;
   - fixture/reference artifact names;
   - `reference/` versus any stale `supporting/` path language;
   - whether package inventory metadata appears stale or contradictory.

5. `package_manifest.json` is checked only for coordination drift. If it is out of sync with the README or actual `10*` prompt set, classify that as:
   - non-runtime package drift;
   - whether it should be corrected before 10B;
   - whether it blocks safe implementation handoff.

Do **not** fix any identified package coordination issue in Prompt 10A.

---

### C. Existing Documents surface repo truth

Confirm whether the existing Documents ready path is still fundamentally card/lane based or classify drift.

At minimum, determine whether current runtime posture still includes the present Documents composition pattern:
- state-card or state-seam posture;
- lane/card treatment for:
  - Project Record;
  - My Project Files;
  - External Platforms / External Systems;
- current permissions / guardrail card posture where applicable;
- current reviews / approvals card posture where applicable.

State clearly whether this baseline remains compatible with the Explorer replacement sequence.

---

### D. Primary-tab and module-contract truth

Confirm:

1. The eight-tab runtime model remains intact:

   ```text
   project-home
   core-tools
   documents
   estimating-preconstruction
   startup-closeout
   project-controls
   cost-time
   systems-administration
   ```

2. `documents` remains the internal primary tab id.

3. `Document Control` remains the visible label where applicable.

4. Existing document module IDs still include:

   ```text
   primary-documents
   document-control-center
   drawing-model-center
   sharepoint-project-record
   my-project-files
   procore-documents
   document-crunch
   adobe-sign
   ```

5. No replacement or duplicate module-id scheme has already been introduced that would conflict with the Explorer target architecture.

---

### E. Router seam truth

Confirm whether `PccSurfaceRouter` still:
- routes `documents` to `PccDocumentsSurface`;
- does **not** yet pass `activeModuleId` into `PccDocumentsSurface`;
- continues to pass Project Home’s existing `onSelectModule` behavior without alteration.

State whether Prompt 10D’s expected additive Documents-specific router seam remains the correct future implementation step.

---

### F. Active-panel ownership truth

Confirm that `data-pcc-active-surface-panel` remains shell-owned and has **not** returned to Documents cards.

Use repo inspection sufficient to establish:
- shell ownership remains intact;
- Documents card/surface files do not reintroduce card-owned active-panel semantics;
- Prompt 10 Explorer implementation must preserve this posture.

A targeted read-only search is acceptable, for example:

```bash
rg -n "dataActiveSurfacePanel|data-pcc-active-surface-panel" \
  apps/project-control-center/src/shell \
  apps/project-control-center/src/surfaces/documents
```

---

### G. Documents guardrail truth

Confirm that current Documents read-model safeguards remain present:

- no full OneDrive root exposure;
- no browsing of other-project My Project Files folders;
- no external-system writeback;
- no sync/mirror behavior implied in current Documents posture.

Verify the hard-no safety posture from current model/adapter source, not from package assumptions.

A targeted read-only search is acceptable when helpful, for example:

```bash
rg -n "OneDrive|projectFolderPath|isSafeMyProjectFilesEntry|writeback|write back|sync|mirror" \
  apps/project-control-center/src/surfaces/documents
```

---

### H. Parallel Project Home drift classification

Identify any Project Home or shared-file drift visible in `git status --short`.

For each relevant file:
- classify whether it is Project Home-only drift, shared-file drift, or unrelated drift;
- state whether it blocks Prompt 10;
- state whether Prompt 10B–10G can proceed around it without touching it.

Do not edit or stage drift.

---

### I. Old Prompt 10 versus Explorer target

Compare:
- restored historical single-step Prompt 10;
- Explorer target architecture plan;
- package README replacement note.

State explicitly:

1. The old single-step Prompt 10 is retained for traceability/package history.
2. The Explorer target architecture and `10A`–`10G` prompt chain supersede it for implementation.
3. No agent should execute the old single-step Prompt 10 in place of the Explorer sequence.

---

## Required Output

Return a concise but complete auditor-style result with the following sections.

### 1. Verdict

Use exactly one:

- `Proceed to 10B`
- `Proceed to 10B with noted safe drift`
- `Pause for package correction before 10B`
- `Blocked`

### 2. Repo execution baseline
- branch;
- starting HEAD;
- working-tree posture;
- lockfile md5.

### 3. Package coordination findings
- restored old Prompt 10 status;
- Explorer target plan status;
- README / target-plan / Prompt 10B coordination;
- manifest or reference-path inconsistencies, if any;
- whether package correction should precede 10B.

### 4. Current repo-truth findings
- Documents current composition truth;
- eight-tab model truth;
- module-contract truth;
- router seam truth;
- active-panel ownership truth;
- guardrail truth.

### 5. Parallel Project Home drift classification
- files, if any;
- block / non-block verdict;
- preservation instruction.

### 6. Document Control implementation implications
- what Prompt 10B may safely assume;
- what later prompts must change;
- any narrow seam that remains correctly deferred to Prompt 10D.

### 7. Hard-stop findings, if any
If none, say `None`.

### 8. Recommended next step
State one of:
- execute Prompt 10B;
- correct package/docs drift before Prompt 10B;
- stop and remediate a blocking repo-truth issue.

---

## Required Validation Commands

Run only read-only/status commands:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Targeted `rg` searches authorized above may also be used.

Do **not** run tests, typecheck, formatting, or any command that changes repo state.

---

## Completion Standard

Prompt 10A is complete only when:
1. repo execution baseline is captured;
2. Prompt 10 package coordination is classified;
3. Documents runtime truth is verified against the Explorer target;
4. Project Home/shared drift is classified;
5. a precise go / pause / stop recommendation is issued for Prompt 10B.
