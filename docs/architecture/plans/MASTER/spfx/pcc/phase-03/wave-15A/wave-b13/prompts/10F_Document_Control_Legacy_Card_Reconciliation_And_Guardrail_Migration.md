# Phase 08 Prompt 10F — Document Control Legacy Artifact Reconciliation and Guardrail Retention

## Role

You are implementing **Phase 08 Prompt 10F** in the `RMF112018/hb-intel` repo.

Prompts **10B–10E** have already completed the Document Control Explorer conversion:

- typed Explorer model foundation;
- Explorer-first ready-path shell;
- nested navigation, breadcrumbs, source switching, and mounted path retention;
- Documents-specific `activeModuleId` focus threading;
- Procore linked-record category panes;
- Document Crunch / Adobe Sign External References on Home.

Prompt 10F does **not** re-implement ready-path removal work.  
The ready path is already Explorer-only. Prompt 10F reconciles the **remaining legacy component artifacts** and verifies that the essential user-facing guardrails formerly concentrated in the old permissions/lane cards remain visible in the Explorer-first experience.

---

## Objective

Complete the legacy-card reconciliation phase by:

1. confirming the post-10E ready path remains Explorer-only;
2. auditing the now-detached legacy Documents card artifacts;
3. retiring truly orphaned legacy component/CSS/messaging files only when repo-truth proves they have no surviving runtime/test consumers;
4. preserving all read-model/view-model contracts still used by the Explorer, tests, or future workflow posture;
5. verifying that essential guardrail copy remains visible in the Explorer without reintroducing admin-style reference cards;
6. leaving the repo ready for Prompt **10G** evidence/accessibility/responsive closeout.

---

## Current Repo-Truth Baseline to Treat as Governing

At the start of Prompt 10F, current repo truth after Prompt 10E should show:

### 1. Ready-path Documents composition is already Explorer-only

`PccDocumentsSurface.tsx` renders:

- read-model branch → `PccDocumentControlReadModelContent`;
- no-client fallback → state card + one Explorer card.

`PccDocumentControlReadModelContent.tsx` renders:

- loading → state card only;
- error → state card only;
- available preview → Explorer card only;
- degraded/source-cued preview → state card + Explorer card.

No ready-path branch should render:

- `PccDocumentControlLaneCard`;
- `PccDocumentControlPermissionsCard`;
- `PccDocumentControlReviewsCard`.

### 2. Existing ready-path tests already prove this

`PccDocumentsSurface.test.tsx` already includes an explicit available-preview assertion that the ready path renders zero:

```text
[data-pcc-doc-lane]
[data-pcc-doc-permissions-card]
[data-pcc-doc-reviews-card]
```

Treat that as an existing governing regression contract. Do not duplicate it without need; preserve or sharpen it only if the reconciliation work requires a precise retarget.

### 3. Legacy artifact candidates still remain on disk

The following files are expected reconciliation candidates:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReviewsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.module.css
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/surfaces/documents/reviewMessaging.ts
```

The first three are the old card renderers.  
The CSS file is expected to be legacy-card-only if current repo truth has not drifted.  
The two messaging helpers may or may not still be orphaned after the card retirement; verify before deciding.

### 4. Essential Explorer guardrails already exist and must not regress

The Explorer-first Documents experience already carries the product-safe authority posture that Prompt 10F must preserve:

- **Document Control Home** communicates no writeback to SharePoint, OneDrive, or external systems.
- **Project Record** communicates SharePoint-backed read-only reference posture.
- **My Project Files** communicates project-scoped working files and no full-OneDrive / other-project browsing.
- **Procore** communicates launch-only / reference posture and no mirror, sync, or writeback.
- Procore category panes carry the category-level posture cue introduced in Prompt 10E.

Prompt 10F should preserve these cues and add coverage only where a required guardrail is not already explicitly tested.

---

## Critical Parallel-Work Rule

Operator-led work may be present in the working tree outside Prompt 10F scope.

Previous nearby sessions observed parallel drift such as:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/09E_*.md
.textClipping
.claude/settings.local.json
```

Do not assume those exact files still exist; verify current `git status --short`.

Do **not**:

- stage or revert unrelated manifest/version WIP;
- edit Project Home files;
- overwrite operator-owned docs/config/artifacts;
- normalize unrelated formatting;
- use `git add -A`.

Classify all drift precisely in closeout and stage only Prompt 10F files explicitly.

---

## Required Preflight

Before edits:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Record:

- branch;
- starting HEAD;
- working-tree posture;
- lockfile md5;
- all parallel/operator-owned drift.

Confirm Prompt 10E landed in repo truth. At minimum verify:

- Procore linked-record fixture/source exists;
- External References adapter exists;
- Explorer shell carries linked-record / external-reference posture;
- read-model branch passes external references into the Explorer.

If Prompt 10E is missing, stop and report.

---

## Required Repo-Truth Audit Before Deletion Decisions

Run targeted read-only searches before editing:

```bash
rg -n \
  "PccDocumentControlLaneCard|PccDocumentControlPermissionsCard|PccDocumentControlReviewsCard" \
  apps/project-control-center/src

rg -n \
  "PccDocumentsSurface\.module\.css" \
  apps/project-control-center/src

rg -n \
  "sourceStateMessaging|reviewMessaging|resolveDisabledMessage|resolveEntryHealthMessage|resolveLaneEnvelopeMessage|resolveReviewStateMessage|resolveReviewTypeLabel" \
  apps/project-control-center/src

rg -n \
  "data-pcc-doc-lane|data-pcc-doc-permissions-card|data-pcc-doc-reviews-card" \
  apps/project-control-center/src/tests
```

### Classification rule

For each candidate file, classify it as one of:

- `retire now` — no surviving runtime or test consumer remains after Prompt 10E;
- `retain intentionally` — still imported by a nonlegacy runtime/test contract that Prompt 10F must preserve;
- `hard stop` — repo truth conflicts with the expected post-10E explorer-first architecture and needs a planning/audit decision before continuing.

Do not delete files based on assumptions. Retire only after `rg` / import truth supports the decision.

---

## Locked Reconciliation Decisions

## 1. Ready-path render composition is verification-only

Prompt 10F must **not** rewrite `PccDocumentsSurface.tsx` or `PccDocumentControlReadModelContent.tsx` to “remove” legacy cards from the ready path unless an actual regression is discovered.

The post-10E surface already renders Explorer-first composition. Prompt 10F should:

- verify it;
- preserve it;
- update stale comments only if they materially misstate the current post-10E repo truth and the edit is in-scope.

Do not create new render variants.

---

## 2. Legacy card component files should be retired if still orphaned

If repo truth confirms they have no surviving consumers, delete:

```text
PccDocumentControlLaneCard.tsx
PccDocumentControlPermissionsCard.tsx
PccDocumentControlReviewsCard.tsx
```

These components represented the retired lane-card / permissions-card / reviews-card ready-path architecture and should not remain as dormant production components once the Explorer architecture has fully replaced them.

If a surviving import exists outside the legacy components themselves, stop and report rather than silently broadening the reconciliation.

---

## 3. Legacy CSS should be retired if its imports are only the retired legacy cards

If `rg` confirms that:

```text
PccDocumentsSurface.module.css
```

is imported only by the retired lane / permissions / reviews cards, delete it with those cards.

If any nonlegacy runtime surface still imports it, preserve it and document why.

Do not move legacy styles into the Explorer shell.

---

## 4. Legacy messaging helpers should be retired only if repo truth proves they are orphaned

Evaluate:

```text
sourceStateMessaging.ts
reviewMessaging.ts
```

If they are consumed only by the retired legacy cards or tests tied solely to those cards, delete them and retire/retarget the corresponding tests.

If they remain meaningfully used by an active runtime contract outside those cards, preserve them and document that decision.

Do **not** delete `documentControlViewModel.ts`, model fields, source-health contracts, review vocabularies, action catalog data, or role/action availability data solely because the old card renderers are being retired. Those data contracts may remain relevant to adapters, tests, source-state posture, later work, or non-rendered read-model integrity.

---

## 5. Guardrail retention is verification and targeted refinement only

Prompt 10F must preserve the user-facing safety ideas that remain relevant to the Explorer:

1. Project Record = read-only SharePoint reference.
2. My Project Files = project-scoped working files, not the formal record merely by existing there.
3. My Project Files = no full OneDrive root / no other-project folder browsing.
4. Procore = launch-only / reference posture.
5. PCC = no mirror, sync, or writeback to source systems.

### Implementation rule

- If the required copy is already rendered and covered by tests, leave it unchanged.
- If the copy is rendered but not directly covered, add focused tests.
- If a specific guardrail is genuinely missing from the Explorer surface, add the smallest concise Explorer-local product copy in the correct source context and test it.
- Do **not** reintroduce a permissions/reference dump, action catalog, role matrix, review queue, or a new dashboard-style guardrail card.

---

## 6. Reviews / approvals content is not migrated into the Explorer

Do not rebuild any of the following inside the Explorer:

- review type vocabulary;
- review state legend;
- review queue;
- approvals queue;
- role/action availability table;
- permissions catalog.

Prompt 10F is **not** a workflow reconstruction prompt. It is artifact reconciliation plus essential guardrail retention.

---

## Expected File Scope

Depending on the repo-truth audit, Prompt 10F will likely:

### Delete, if confirmed orphaned

```text
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReviewsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.module.css
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/surfaces/documents/reviewMessaging.ts
```

### Potentially edit

```text
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentControlExplorerShell.test.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
```

Edits to the two render files should be comment-only unless a concrete discovered regression requires otherwise.

### Do not edit

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
packages/models/src/pcc/**
package.json
pnpm-lock.yaml
docs/architecture/blueprint/**
```

Do not mutate shared package models or view-model contracts unless a hard-stop decision is raised and separately authorized.

---

## Tests Required

Prompt 10F should preserve or add tests proving the following.

### A. Ready-path contract remains Explorer-only

1. Available preview ready path still renders one Explorer card.
2. Available preview ready path still renders zero:
   - `[data-pcc-doc-lane]`
   - `[data-pcc-doc-permissions-card]`
   - `[data-pcc-doc-reviews-card]`
3. No duplicate `HB Document Control Center` header regression returns.
4. Bento direct-child invariant remains green.
5. Zero card-level `[data-pcc-active-surface-panel="documents"]` markers remain.

Most or all of this is already covered in `PccDocumentsSurface.test.tsx`. Preserve that coverage and retarget only if reconciliation changes file ownership.

### B. Loading / error / state-cued preview posture remains intact

6. Loading branch remains state-card only.
7. Error branch remains state-card only.
8. No-client fallback remains state card + Explorer card.
9. Backend/source-unavailable preview remains state cue + Explorer card.

### C. Guardrail retention

10. Explorer still exposes the required Product 10 guardrails:
    - Project Record read-only/source-system posture;
    - My Project Files project-scoped guardrail;
    - My Project Files no-full-root / no-other-project browsing guardrail;
    - Procore no mirror/sync/writeback posture;
    - Home/no-writeback authority cue as appropriate.
11. If a guardrail was already tested elsewhere, do not duplicate the same test unnecessarily. Add only missing coverage.

### D. Artifact retirement integrity

12. If legacy components are deleted, no imports/references remain in runtime source.
13. If legacy CSS/helpers are deleted, no imports/references remain in runtime source.
14. Full typecheck and full test suite remain green after deletion.

Use code-search/TypeScript compilation as the primary evidence for artifact deletion integrity; do not create contrived runtime UI just to test that deleted files are gone.

---

## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test

pnpm exec prettier --check <changed-files>
git diff --check

md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If targeted tests are useful during implementation, they may supplement but not replace the full package test command.

---

## Commit Preparation

Architecture-doc updates are **not** authorized in Prompt 10F.

Use a runtime/test commit only.

Recommended commit title:

```text
refactor(pcc-spfx): HB Intel Project Control Center 1.0.0.222 — Phase 08 wave-b13 Document Control legacy artifact reconciliation
```

No package/manifest version bump.  
Do not stage operator-owned manifest/version WIP or unrelated docs/config drift.  
Stage only in-scope files explicitly; never use `git add -A`.

---

## Closeout Requirements

Include:

- starting and ending HEAD;
- current branch;
- lockfile md5 before/after;
- working-tree drift classification;
- Prompt 10E presence confirmation;
- ready-path Explorer-only contract confirmation;
- artifact audit table:
  - file;
  - retire / retain / hard stop;
  - evidence;
- files deleted;
- files edited;
- any comments updated;
- any guardrail copy tested or minimally refined;
- why `documentControlViewModel.ts` and any surviving data contracts were retained;
- tests added/retargeted;
- validation results;
- Project Home / operator drift preservation note;
- readiness verdict for Prompt 10G.

---

## Hard Stops

Stop and report before proceeding if Prompt 10F would require:

- reworking the Explorer ready-path architecture again;
- reintroducing lane / permissions / reviews card rendering;
- migrating action catalogs, role matrices, or review queues into the Explorer;
- deleting `documentControlViewModel.ts` or shared data contracts merely because the old card renderers are retired;
- editing Project Home or operator-owned manifest/version/docs/config drift;
- adding dependencies;
- changing `pnpm-lock.yaml`;
- mutating package/manifest versions;
- breaking bento direct-child or shell-owned active-panel contracts;
- weakening guardrail copy to make deletion easier;
- deleting any candidate file before `rg` / import truth supports retirement.
