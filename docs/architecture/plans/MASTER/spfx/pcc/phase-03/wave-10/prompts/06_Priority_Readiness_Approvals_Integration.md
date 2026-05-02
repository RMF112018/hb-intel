# Prompt 06 — Priority Actions / Readiness / Approvals Integration

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Integrate Phase 3 / Wave 10 **Permit & Inspection Control Center** signals into the existing PCC Priority Actions, Project Readiness, and Approvals / Checkpoints patterns without executing approvals, workflows, external calls, external launches, runtime integrations, or writes.

This is a **read-only signal / adapter / fixture / display integration pass only**.

Use commit `ef4cbe11c96e69f036b4aaa831cd9384e86fd52c` as the Prompt 05 baseline unless local repo truth shows a newer commit on the active branch. If local HEAD differs, stop only if the drift changes Wave 10, Project Readiness, Priority Actions, Approvals / Checkpoints, or SPFx PCC surface structure in a way that affects this prompt.

Prompt 05 repo-truth to preserve:

- Wave 10 is hosted inside `PccProjectReadinessSurface`, not as a new top-level surface.
- Wave 10 regions live under `apps/project-control-center/src/surfaces/projectReadiness/`.
- Do **not** create `apps/project-control-center/src/surfaces/permitInspectionControlCenter/` unless you stop first and prove repo truth has changed.
- `permit-log` remains the internal Project Readiness source-module ID.
- User-facing label is `Permit & Inspection Control Center`.
- The Wave 10 shell already renders 10 inert cards inside Project Readiness.
- No AHJ, Procore, Graph, SharePoint REST, PnP, evidence upload/storage/sync, backend write, approval execution, deployment, package, manifest, CI, tenant, or production rollout behavior is authorized.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Do not perform broad exploratory rewrites. Inspect the minimum repo-truth files needed to safely implement this prompt.

Do not re-read unchanged files repeatedly during the same session. Use your current context and only re-open a file when:
- a type error requires confirmation;
- a test failure contradicts expected behavior;
- a changed file has drifted since prior prompt execution;
- a downstream file reference is unclear.

## Baseline Capture

Before editing, run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -8
md5 pnpm-lock.yaml
```

Record the lockfile hash and active HEAD in your final output.

If the working tree is not clean before you start, stop and report the existing changes. Do not overwrite unrelated work.

## Repo-Truth Files to Inspect

Use prior prompt findings first. Re-open only as needed.

Core model / fixture files:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PermitInspectionControlCenter.test.ts`
- `packages/models/src/pcc/PriorityActions.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts`
- `packages/models/src/pcc/fixtures/priorityActions.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`
- `packages/models/src/pcc/fixtures/index.ts`

Backend read-model files, only if fixture export or provider alignment is needed:

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`

SPFx Project Home / Priority Actions files:

- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx`
- `apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts`
- `apps/project-control-center/src/surfaces/projectHome/shared.ts`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`

SPFx Project Readiness / Wave 10 files:

- `apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/usePermitInspectionControlCenterReadModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.module.css`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts`
- `apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

Guard / dormancy tests:

- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- any existing Procore / external runtime guard tests if repo search identifies them

## Explicit Repo-Truth Corrections From Prompt 05

The prior Prompt 06 package contained stale assumptions. Correct them during execution:

1. **No separate Wave 10 surface folder**
   - Do not inspect or create `apps/project-control-center/src/surfaces/permitInspectionControlCenter/*` unless repo truth has changed.
   - Wave 10 region files currently live in `apps/project-control-center/src/surfaces/projectReadiness/*`.

2. **Priority categories already exist**
   - `PriorityActions.ts` already includes `permit` and `inspection`.
   - Do not add a new Priority Action category unless you stop and prove a repo-truth requirement.
   - Prefer updating `fixtures/priorityActions.ts` and app adapters/tests.

3. **Current Wave 10 fixture coverage is incomplete for Prompt 06**
   - The existing Wave 10 fixture has active / expiring / pending-revision permits, passed / failed / reinspection-scheduled inspections, pending permit receipt, disputed reinspection fee, missing evidence, readiness signals, priority-action signals, and approval signals.
   - Prompt 06 must add or map deterministic read-only signals for all missing required conditions listed below.

4. **Checkpoint-kind ambiguity must be resolved safely**
   - Current Wave 10 checkpoint kinds include:
     - `closeout-authorization`
     - `no-reinspection-exception`
     - `override-by-reason`
   - Prompt 06 requires distinct representation of:
     - evidence override-by-reason
     - transition exception override
   - Either add distinct checkpoint kinds with compatibility tests, or keep `override-by-reason` and add explicit metadata fields that distinguish evidence override vs transition exception. Do not execute approvals.

5. **Prompt 05 Procore coverage gap**
   - Add a structural test proving this integration introduces no Procore runtime/client/sync/writeback/mirror behavior and no Procore external execution affordance.
   - Do not create Procore runtime integration.
   - Do not create Procore launch behavior.
   - If a Procore reference is present in existing fixtures, render it as reference-only plain text only. If no Procore reference exists, test the absence of runtime/execution tokens.

## Allowed Files

Limit changes to the minimum set needed. Likely allowed files are:

### Model / fixture layer

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PermitInspectionControlCenter.test.ts`
- `packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts`
- `packages/models/src/pcc/fixtures/priorityActions.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`
- `packages/models/src/pcc/fixtures/index.ts`

### Priority Actions metadata

- `packages/models/src/pcc/PriorityActions.ts` only if existing category metadata needs safe label / description alignment. This should probably not be necessary because `permit` and `inspection` already exist.

### Project Readiness framework

- `packages/models/src/pcc/ProjectReadinessFramework.ts` only if a backward-compatible source-module alignment is required and tests prove safety.
- Do not broadly rewrite the Wave 8 framework.

### Backend mock read model

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` only if the Wave 10 fixture shape/export changed in a way that requires provider alignment.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts` only if provider fixture coverage needs a direct regression.

### SPFx Project Home / Priority Actions

- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx`
- `apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`

### SPFx Wave 10 Project Readiness-hosted surface

- `apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.module.css`
- `apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

### Guard tests

- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` only if it fails because this prompt legitimately adds a new allowed static guard. If it fails, prefer stopping and reporting over weakening it.

## Forbidden Files / Scope

Do not edit:

- `docs/architecture/plans/**`
- `docs/architecture/blueprint/**`
- `package.json`
- any package manifest
- `pnpm-lock.yaml`
- SPFx manifests
- `config/package-solution.json`
- CI/workflow/deployment files
- tenant/provisioning scripts
- generated bundles or packaged artifacts

Do not introduce:

- AHJ scraping
- AHJ API calls
- AHJ inspection scheduling
- AHJ permit submission
- AHJ status polling
- Procore runtime integration
- Procore sync/writeback/mirror
- Microsoft Graph runtime integration
- SharePoint REST runtime operations
- PnP runtime operations
- evidence upload
- evidence storage
- evidence sync/mirror
- external-system writeback/sync/mirror
- backend write routes
- approval execution
- workflow mutation
- package dependencies
- package/manifest version bumps
- deployment or tenant mutation
- production rollout behavior
- new top-level PCC surface for Wave 10
- new `readModelClient={...}` JSX thread outside existing approved surfaces
- new fetch callsite in non-api source

## Required Read-Only Conditions to Represent

Represent all of the following as read-only signal records and/or deterministic UI-visible derived signals.

Each condition must be testable. Prefer direct fixture coverage over only inferred text.

1. missing evidence
2. failed inspection
3. overdue / expired permit
4. expiring permit
5. open permit fee
6. open reinspection fee
7. revision required
8. reinspection required
9. inspection ready to request
10. inspection not scheduled in target window
11. closeout / TCO / CO exposure where supported by fixture data

Minimum expected fixture additions or confirmations:

- Add one expired or overdue permit fixture if none exists.
- Add one `ready-to-request` inspection fixture if none exists.
- Add one inspection readiness signal for not scheduled in target window.
- Add one open or pending reinspection fee exposure if the only reinspection fee is `disputed`.
- Add signal metadata for closeout / TCO / CO exposure using existing pending/disputed fee evidence where appropriate.

## Priority Actions Requirements

Existing priority categories already include `permit` and `inspection`. Use them. Do not add categories.

Add or map read-only sample actions for:

- permit pending revision
- expiring permit
- expired / overdue permit
- inspection ready to request
- failed inspection requiring corrective action
- reinspection required
- evidence required / missing
- fee pending receipt / payment
- closeout / TCO / CO exposure, if supported by fixture data

Implementation rules:

- Actions must be non-executing.
- Do not add buttons that submit, approve, sync, upload, launch, write back, complete, execute, schedule, request, or mutate.
- A priority action may route/reference owning module context only if an existing inert/display-only app pattern supports it.
- Do not invent live routing behavior or external navigation.
- Prefer deterministic IDs prefixed consistently, for example:
  - `fixture-pa-permit-revision-001`
  - `fixture-pa-permit-expiring-001`
  - `fixture-pa-permit-expired-001`
  - `fixture-pa-inspection-ready-001`
  - `fixture-pa-inspection-failed-001`
  - `fixture-pa-reinspection-required-001`
  - `fixture-pa-evidence-missing-001`
  - `fixture-pa-fee-pending-001`

Tests must prove:
- Wave 10 priority actions use only existing `permit` and `inspection` categories, except closeout exposure may use existing `closeout` if clearly mapped.
- No new category is introduced.
- Priority Actions rail displays the Wave 10 actions as inert/read-only.
- Project Home still has no external HTTP anchors or enabled executable controls.

## Project Readiness Requirements

Wave 10 must emit readiness signals into the Wave 8 framework seam without taking ownership of the Wave 8 framework.

Rules:

- Keep `permit-log` as the source-module ID unless you stop and prove a safe compatibility migration is required.
- Do not rename `permit-log` to `permit-inspection-control-center` in the Wave 8 framework.
- Do not remove existing source-module values.
- Do not rewrite Project Readiness broadly.
- Do not alter Wave 8 framework ownership.
- If mapping signal metadata into `fixtures/projectReadiness.ts`, preserve source-lineage compatibility and test that:
  - `sourceModuleId === 'permit-log'`
  - label/display copy remains `Permit & Inspection Control Center`
  - blocker-first posture is preserved
  - readiness items do not execute workflows
- If safe mapping into the Wave 8 read model requires broader migration, stop and report rather than forcing it.

Represent readiness blockers or risk signals for at least:
- permit pending revision
- expired / overdue permit
- expiring permit
- failed inspection
- reinspection required
- missing evidence
- open fee exposure
- inspection not scheduled in target window
- closeout / TCO / CO exposure, if supported by fixture data

Tests must prove:
- readiness blockers remain blocker-first;
- Wave 10 signals preserve `permit-log`;
- Wave 8 framework still includes its existing domains/gates/source modules;
- no broad Wave 8 framework rewrite occurred.

## Approvals / Checkpoints Requirements

Represent checkpoint trigger metadata only. Do not execute approvals.

Required trigger concepts:

1. closeout authorization
2. no-reinspection exception approval
3. evidence override-by-reason
4. transition exception override

Safe implementation options:

### Option A — Preferred if low-risk

Extend `PERMIT_INSPECTION_CHECKPOINT_KINDS` with distinct kinds:

- `evidence-override-by-reason`
- `transition-exception-override`

Keep existing `override-by-reason` only if existing tests or compatibility require it.

Add model tests proving all checkpoint kinds are stable and all fixture records use valid kinds.

### Option B — Acceptable if distinct kinds would cause avoidable churn

Keep `override-by-reason`, but add explicit metadata to `IPermitInspectionApprovalSignal` that distinguishes:
- `overrideContext: 'evidence'`
- `overrideContext: 'transition-exception'`

or an equivalent field name consistent with repo conventions.

Add fixture records and tests proving the two required override concepts are distinguishable without creating approval execution.

In either option:

- Do not add write routes.
- Do not call approval APIs.
- Do not import or mutate any live approvals runtime.
- Do not create enabled approval buttons.
- Do not create workflow mutation or queue mutation.
- Render approval/checkpoint triggers as display-only metadata if shown in SPFx.

Tests must prove:
- every required trigger concept is represented;
- checkpoint trigger UI is metadata-only;
- no enabled approval controls exist;
- no route/write/runtime import was introduced.

## SPFx Wave 10 Display Requirements

Update the existing Project Readiness-hosted Wave 10 region surface so integrated signals are visible but not executable.

Do this inside:

```text
apps/project-control-center/src/surfaces/projectReadiness/
```

Do not create a new Wave 10 surface folder.

Required display additions, using existing styling patterns:

- Priority Action signal lane, count, chip group, or subsection.
- Readiness signal lane, count, chip group, or subsection.
- Approvals / Checkpoints metadata lane, count, chip group, or subsection.
- Procore reference-only / no-runtime posture assertion may be test-only unless fixture data exists.
- Maintain the existing 10-card structure unless a minimal card/region addition is necessary and bento invariant tests are updated.
- Keep all new content inside `PccDashboardCard` direct children of the bento grid through the existing `PccProjectReadinessSurface` composition.
- No new top-level active surface marker.

Do not add:
- enabled buttons;
- external links;
- forms;
- file inputs;
- launch buttons;
- approval buttons;
- schedule/request/submit controls;
- onClick handlers for workflow-like actions;
- fetch calls.

If adding a new region/card is necessary, update tests to prove its card is a direct child of `[data-pcc-bento-grid]` using:

```ts
const card = marker.closest('[data-pcc-card]');
expect(card).not.toBeNull();
expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
```

## Backend Requirements

The backend provider should not require changes if the fixture shape remains compatible.

Only touch backend provider/test files if:
- model shape changes require the provider to compile;
- new fixture records require updated provider tests;
- provider test coverage must verify the added signals flow through the read-model envelope.

Backend constraints:

- GET-only behavior remains unchanged.
- No write routes.
- No route registration changes unless a compile/test failure proves necessary.
- No AHJ/Procore/Graph/SharePoint/PnP runtime import.
- No evidence storage/sync behavior.

## Procore / External-System Guard Requirement

Add a structural guard or test proving Prompt 06 does not introduce Procore runtime behavior.

The test should check for absence of some or all of the following in Wave 10 changed SPFx/model/backend files, depending on existing guard patterns:

- `@hbc/procore`
- `ProcoreClient`
- `procoreClient`
- `syncProcore`
- `writeback`
- `writeBack`
- `mirror`
- `external-system write`
- enabled Procore launch affordance
- `<a href>` external launch links in Wave 10 region output

Do not remove the existing `procore-sync` Priority Action category. It is existing repo vocabulary and outside this prompt's scope. The guard should prevent runtime/execution behavior, not delete existing category metadata.

## Implementation Steps

1. Capture baseline commands listed above.

2. Inspect current repo truth for:
   - Wave 10 model/signal types;
   - Wave 10 fixture coverage;
   - Priority Action categories and fixture records;
   - Project Readiness source-module compatibility;
   - current Wave 10 SPFx regions and tests;
   - existing guard/dormancy tests.

3. Extend Wave 10 fixture data and/or signal metadata to represent all required Prompt 06 conditions.

4. Add or map sample Priority Actions using existing `permit`, `inspection`, and, only where appropriate, `closeout`.

5. Represent Wave 10 readiness signals while preserving `permit-log`.

6. Represent approval/checkpoint trigger concepts as metadata-only, using Option A or Option B above.

7. Update SPFx Wave 10 region display so integrated Priority Action, readiness, and checkpoint metadata is visible and inert.

8. Update Project Home Priority Actions display only if fixture/adaptor wiring requires it.

9. Add/extend tests proving:
   - all required conditions are represented;
   - Wave 10 priority action categories use existing categories;
   - no new Priority Action category was added;
   - Wave 10 readiness source metadata preserves `permit-log`;
   - readiness blockers remain blocker-first;
   - all four checkpoint trigger concepts are represented;
   - checkpoint triggers are metadata-only;
   - no approval execution exists;
   - no enabled buttons / forms / file inputs / external links are introduced;
   - no write route or external runtime was introduced;
   - no Procore runtime/client/sync/writeback/mirror behavior was introduced;
   - bento direct-child invariants remain valid;
   - Project Readiness still has exactly one active-surface marker for `project-readiness`.

10. Run validation.

11. Stage only files touched for this prompt.

12. Commit only after all validation passes.

## Required Tests

Add or update tests at the correct layer.

### Model tests

Use `packages/models/src/pcc/PermitInspectionControlCenter.test.ts` and/or a fixture-focused test if existing patterns support it.

Must prove:
- required statuses and signal records are represented;
- required target-added conditions exist in fixtures;
- all Priority Action signal categories are valid;
- readiness signals preserve `permit-log`;
- checkpoint triggers represent the four required concepts;
- approval/checkpoint records are metadata only.

### Priority Actions tests

Use existing Project Home / priority rail tests.

Must prove:
- Wave 10 sample actions appear in the Priority Actions rail or read-model-backed action source;
- categories are `permit`, `inspection`, or existing `closeout` where justified;
- no new category was introduced;
- no executable controls or external links are introduced.

### Project Readiness tests

Use `PccProjectReadinessSurface.test.tsx`, `projectReadinessAdapter.test.ts`, or a focused test.

Must prove:
- `permit-log` remains the compatibility source ID;
- `Permit & Inspection Control Center` remains the display label;
- readiness blockers / source health / downstream module posture remain correct;
- no broad Wave 8 ownership rewrite occurred.

### Wave 10 region tests

Use `PccPermitInspectionControlCenterRegions.test.tsx`.

Must prove:
- integrated priority/readiness/checkpoint metadata is visible;
- all rendered actions/signals are inert;
- no enabled buttons;
- no forms;
- no file inputs;
- no external anchors;
- AHJ portal URLs remain spans/plain text;
- Procore remains no-runtime/no-execution;
- source traceability remains visible.

### Backend tests

Only update backend provider tests if backend files must be touched. If touched, prove:
- fixture envelope still returns read-only data;
- no write routes;
- no external runtime imports.

## Validation Commands

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
pnpm exec prettier --check <exact touched files>
md5 pnpm-lock.yaml
```

Confirm the lockfile hash is unchanged from baseline.

If the functions test suite fails only because backend files were not touched and failures are known pre-existing unrelated failures, stop and report with exact evidence instead of weakening validation. If Prompt 06 touches backend files, backend validation is mandatory.

## Staged-File Proof Before Commit

Before committing, run:

```bash
git status --short
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files touched for this prompt. Do not use `git add -A`.

Do not stage unrelated files.

## Commit Instructions

Commit summary:

```text
feat(pcc): integrate permit inspection readiness signals
```

Commit description:

```text
Integrates Phase 3 Wave 10 Permit & Inspection Control Center signals into existing Priority Actions, Project Readiness, and Approvals / Checkpoints patterns.

Adds read-only signal coverage for missing evidence, failed inspections, overdue/expiring permits, fee exposure, revision required, reinspection required, inspection readiness, and closeout/TCO/CO exposure.

Preserves the Project Readiness-hosted Wave 10 placement, keeps permit-log as the compatibility source-module identifier, and keeps approval/checkpoint triggers metadata-only.

No write routes, approval execution, workflow mutation, AHJ runtime, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence storage/sync, package, lockfile, manifest, CI, tenant, packaging, deployment, or production rollout changes.
```

## Final Output Requirements

Return:

1. files changed;
2. baseline HEAD and branch;
3. signal conditions represented;
4. Priority Actions integration summary;
5. Project Readiness integration summary;
6. Approvals / Checkpoints metadata summary;
7. SPFx display integration summary;
8. Procore / external runtime guard summary;
9. tests added/updated;
10. validation results;
11. staged-file proof;
12. lockfile before/after hash;
13. commit hash;
14. any deferred Wave 8 source-module compatibility item;
15. any deferred UX enhancements.

## Stop Conditions

Stop and report instead of forcing changes if:

- safe Project Readiness integration requires renaming `permit-log`;
- checkpoint trigger modeling requires a broader Wave 14 Approvals model migration;
- Priority Actions category changes require adding new category vocabulary;
- implementation requires creating a new Wave 10 top-level PCC surface;
- any required behavior would introduce writes, approvals execution, external runtime, sync/mirror, upload/storage, deployment, package, manifest, or tenant changes.
