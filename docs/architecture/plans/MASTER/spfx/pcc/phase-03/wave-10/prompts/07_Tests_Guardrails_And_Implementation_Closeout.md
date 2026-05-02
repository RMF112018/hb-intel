# Prompt 07 — Tests, Guardrails, and Wave 10 Implementation Closeout

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Close the first Phase 3 / Wave 10 **Permit & Inspection Control Center** implementation sequence with a final repo-truth audit, targeted gap-fill regression tests, no-runtime/no-mutation guardrails, narrow implementation-evidence cleanup, and implementation closeout documentation.

This prompt must **not** introduce new runtime scope. Treat this as a final audit / hardening / closeout pass, not a feature-build prompt.

## Prompt 07 Baseline

Use commit `af77151fd56b892750399eb7ad3285b003035b69` as the Prompt 06 baseline unless local repo truth shows a newer commit on the active branch.

Prompt 06 landed the Priority Actions / Readiness / Approvals integration and changed exactly these nine Wave 10 files:

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/priorityActions.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
```

Known Prompt 06 repo-truth to preserve:

- Wave 10 is hosted inside `PccProjectReadinessSurface`, not as a standalone top-level PCC surface.
- Wave 10 region files live under `apps/project-control-center/src/surfaces/projectReadiness/`.
- Do **not** create `apps/project-control-center/src/surfaces/permitInspectionControlCenter/`.
- `permit-log` remains the Project Readiness compatibility source-module ID.
- `PERMIT_INSPECTION_CHECKPOINT_KINDS` now has five values.
- Prompt 06 already added rendered-DOM guardrails for no anchors, no forms, no file inputs, no enabled buttons, no executable button labels, no Procore / Graph / SharePoint runtime tokens in rendered Wave 10 output, and metadata-only approval/checkpoint rendering.
- Prompt 06 already added all eleven required signal conditions:
  - missing evidence
  - failed inspection
  - expired/overdue permit
  - expiring permit
  - open permit fee
  - open reinspection fee
  - revision required
  - reinspection required
  - inspection ready to request
  - inspection not scheduled in target window
  - closeout / TCO / CO exposure

Known local working-tree caution from Prompt 06 closeout:

- A modified Prompt 06 spec/doc file may exist locally.
- An unrelated Wave 13 untracked directory may exist locally.
- Do not stage or modify those items unless this prompt explicitly authorizes them. It does not.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Do not re-read unchanged files repeatedly. Use current context first, then inspect only what is needed to close gaps.

Do not broadly search or format the repo. Use targeted file reads and targeted validation.

## Baseline Capture

Before editing, run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -10
md5 pnpm-lock.yaml
```

Expected baseline:

- branch: `main`
- HEAD: `af77151fd56b892750399eb7ad3285b003035b69`, unless newer unrelated commits are present
- lockfile hash: `c56df7b79986896624536aab74d609f4`

Stop and report if:

- the working tree has tracked source changes unrelated to this prompt;
- local HEAD drift touches Wave 10, Project Readiness, Priority Actions, Approvals / Checkpoints, backend PCC read-model route files, SPFx PCC route/client files, packages, manifests, lockfile, CI/workflows, or docs/architecture/plans;
- `pnpm-lock.yaml` hash has drifted;
- branch is not `main` and no explicit branch instruction is present.

If the only local noise is the previously reported modified Prompt 06 spec/doc file and unrelated Wave 13 untracked directory, continue but do not stage those files.

## Repo-Truth Files to Inspect

Use prior prompt findings first. Re-open only as needed.

### Changed files from Prompts 02–06

Inspect only what is needed from the implementation sequence:

#### Prompt 02 — shared model / fixture contracts

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/index.ts
```

#### Prompt 03 — backend GET-only mock read model

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

#### Prompt 04 — SPFx read-model client parity

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
```

#### Prompt 05 — SPFx Wave 10 surface shell

```text
apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/usePermitInspectionControlCenterReadModel.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.module.css
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

#### Prompt 06 — priority/readiness/approvals integration

```text
packages/models/src/pcc/fixtures/priorityActions.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
```

### Architecture / documentation files

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md
```

Create, do not overwrite:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md
```

### Guardrail / package script files

Open only as needed:

```text
packages/models/package.json
backend/functions/package.json
apps/project-control-center/package.json
package.json
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
```

## Allowed Files

Limit changes to the minimum needed.

### Likely allowed test / guardrail files

```text
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
apps/project-control-center/src/api/pccReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
```

### Likely allowed narrow source/comment cleanup files

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md
```

Permitted cleanup only:

- update stale checkpoint-kind comment from `(3)` to `(5)`;
- update fixture header comment so it reflects Prompt 06 coverage;
- fix the target architecture typo:
  - from `n- inspection blockers`
  - to `inspection blockers`

### Required new closeout file

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md
```

## Forbidden Files / Scope

Do not edit:

```text
docs/architecture/plans/**
package.json
pnpm-lock.yaml
SPFx manifests
config/package-solution.json
CI/workflow files
deployment files
tenant/provisioning scripts
generated bundles
dist outputs
node_modules/**
```

Do not create:

```text
apps/project-control-center/src/surfaces/permitInspectionControlCenter/**
```

Do not introduce:

- new top-level `PccMvpSurfaceId`
- new `PccSurfaceRouter` case
- new `readModelClient={...}` JSX thread
- new `fetch(` callsite outside the existing backend client
- package dependencies
- package/manifest version bumps
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
- SPFx packaging/deployment
- tenant mutation
- production rollout behavior

## Prompt 07 Strategy

Prompt 06 already added many runtime guardrails. Do **not** duplicate Prompt 06 guardrails unless an existing test is incomplete or brittle.

Prompt 07 should:

1. Audit the current test coverage from Prompts 02–06.
2. Add only missing regression tests or static source-level guardrails.
3. Confirm backend route GET-only behavior and absence of write routes.
4. Confirm fixture default / explicit backend opt-in posture.
5. Confirm required target-added fields and lineage remain covered.
6. Confirm Project Readiness / Approvals boundaries are non-authoritative.
7. Confirm package, lockfile, manifest, CI, tenant, and deployment files are unchanged.
8. Create implementation closeout documentation.

## Required Guardrail Coverage

Audit existing tests first. Add only missing coverage.

### Backend / route guardrails

Confirm or add tests proving:

- Wave 10 backend route path is exactly:
  - `pcc/projects/{projectId}/permit-inspection-control-center`
- Wave 10 route is GET-only.
- No POST / PUT / PATCH / DELETE route exists for Wave 10.
- Backend provider method returns `readOnly: true`.
- Backend provider returns fixture data for known projects.
- Backend provider returns degraded empty data for unknown / backend-unavailable states.
- No backend write route or mutation handler exists for Wave 10.

### SPFx API / client guardrails

Confirm or add tests proving:

- fixture client returns `mode: 'fixture'`, `readOnly: true`, deterministic fixture data.
- backend client uses the existing route ID/path through the existing `callBackend` pattern.
- only the existing backend client contains the allowed `fetch(` callsite.
- fixture mode remains default unless backend read-model mode is explicitly requested.
- no new API method performs writes or mutations.

### Static source-level no-runtime guardrails

Prompt 06 added rendered-DOM guards. Prompt 07 must add or confirm **source-file static guardrails** for the Wave 10 implementation files.

Target source files to scan should include the Wave 10-specific implementation files, at minimum:

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/usePermitInspectionControlCenterReadModel.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

The static guard should prove absence of unauthorized tokens/imports/call patterns such as:

```text
@pnp/
@microsoft/microsoft-graph-client
MSGraphClient
GraphServiceClient
SPHttpClient
sp.web
_api/web
ProcoreClient
syncProcore
writeBack
writeback
mirrorToProcore
AHJClient
scrape
crawler
poll
scheduleInspection
submitPermit
requestInspection
uploadEvidence
storeEvidence
syncEvidence
mirrorEvidence
executeApproval
approveCheckpoint
createApproval
fetch(
```

Important exception:

- `fetch(` is allowed only in the existing approved backend client callsite, if current dormancy tests already codify that pattern.
- Do not write an overbroad source scanner that fails on legitimate words inside comments unless the existing guard style intentionally scans comments too. Prefer stripping comments/strings if current repo patterns do so.

### Rendered UI / DOM guardrails

Confirm Prompt 06 already covers these. Add only if missing:

- no anchors in Wave 10 output;
- AHJ URLs render as spans/plain text, not links;
- no forms;
- no file inputs;
- no enabled buttons;
- no executable button labels;
- approval/checkpoint signals are metadata-only;
- Procore / Graph / SharePoint runtime tokens are not rendered.

### Model / fixture guardrails

Confirm or add tests proving:

- required target-added fields are represented:
  - `revision`
  - `applicationValue`
  - `permitFee`
  - `reInspectionFee`
- failed/reinspection lineage remains parent/child traceable.
- open reinspection fee uses `relatedRecordType: 'reinspection'` and `reInspectionFee`.
- `PERMIT_INSPECTION_CHECKPOINT_KINDS` has five unique values.
- all four required checkpoint trigger concepts are represented:
  - closeout authorization
  - no-reinspection exception
  - evidence override-by-reason
  - transition exception override
- `override-by-reason` is preserved for backward compatibility.
- all readiness signals preserve `readinessSourceModuleId === 'permit-log'`.
- priority-action signals use existing categories only.
- no new Priority Action category was introduced.

### Project Readiness / Approvals boundary guardrails

Confirm or add tests proving:

- `permit-log` remains in `PROJECT_READINESS_SOURCE_MODULES`.
- Wave 10 does not rename Project Readiness source-module values.
- Wave 10 does not broadly rewrite the Wave 8 Project Readiness framework.
- Wave 10 approval/checkpoint signals remain local metadata.
- Wave 14 remains authoritative for approvals/checkpoints.
- No approval execution API or mutation path is introduced.

### Package / lockfile / manifest / CI guardrails

Confirm through git status/diff and closeout documentation:

- no package/dependency changes;
- no lockfile changes;
- no SPFx manifest changes;
- no `config/package-solution.json` changes;
- no CI/workflow changes;
- no deployment scripts;
- no tenant mutation;
- no generated bundle artifacts committed.

## Required Closeout Documentation

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md
```

Do **not** overwrite or repurpose:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md
```

The existing `Wave_10_Documentation_Closeout.md` covers the planning/documentation package. The new `Wave_10_Implementation_Closeout.md` must cover the actual Prompts 02–07 implementation sequence.

The implementation closeout must include:

1. baseline branch and HEAD;
2. implementation prompt sequence summary by prompt:
   - Prompt 02 — shared model and fixture contracts;
   - Prompt 03 — backend GET-only mock read model;
   - Prompt 04 — SPFx read-model client parity;
   - Prompt 05 — Project Readiness-hosted Wave 10 surface shell;
   - Prompt 06 — Priority Actions / Readiness / Approvals signal integration;
   - Prompt 07 — tests, guardrails, cleanup, and closeout;
3. files changed across Prompts 02–07;
4. what was implemented;
5. what was intentionally not implemented;
6. guardrail coverage summary;
7. validation results;
8. lockfile before/after hash;
9. no package/dependency change confirmation;
10. no manifest change confirmation;
11. no CI/workflow change confirmation;
12. no tenant mutation confirmation;
13. no AHJ runtime confirmation;
14. no Procore runtime confirmation;
15. no Microsoft Graph / SharePoint REST / PnP runtime confirmation;
16. no evidence storage/upload/sync/mirror confirmation;
17. no backend write route confirmation;
18. no approval execution confirmation;
19. Project Readiness / Wave 8 boundary confirmation;
20. Approvals / Wave 14 boundary confirmation;
21. remaining deferred items;
22. recommended next prompt or wave.

### Required implementation closeout file inventory

Include these Prompt 06 files explicitly in the closeout inventory:

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/priorityActions.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
```

Also include earlier Prompt 02–05 file inventories from git history / prior closeouts.

## Required Narrow Cleanup

Perform these only if they remain present in current repo truth:

1. In `packages/models/src/pcc/PermitInspectionControlCenter.ts`:
   - update the checkpoint-kind comment from `(3)` to `(5)`.

2. In `packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts`:
   - update the header comment to reflect Prompt 06 fixture coverage:
     - expired permit;
     - ready-to-request inspection;
     - open permit fee;
     - open reinspection fee;
     - inspection-not-scheduled readiness signal;
     - closeout / TCO / CO exposure;
     - five checkpoint kinds / four trigger concepts.

3. In `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`:
   - fix the typo under Project Readiness Integration:
     - from `n- inspection blockers`
     - to `inspection blockers`

No broad formatting or wording rewrite is authorized.

## Implementation Steps

1. Capture baseline.
2. Verify Prompt 06 commit and current working tree.
3. Review tests/guardrails from Prompts 02–06.
4. Identify true gaps only.
5. Add missing tests/guardrails, with preference for focused tests over broad brittle scanners.
6. Apply the narrow cleanup items listed above.
7. Create `Wave_10_Implementation_Closeout.md`.
8. Run full validation.
9. Stage only Prompt 07 files by explicit path.
10. Commit if all validation passes.

## Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
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

If a validation command fails because of pre-existing unrelated failures, stop and report with exact evidence. Do not weaken tests or guardrails.

## Staged-File Proof Before Commit

Before committing, run:

```bash
git status --short
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files touched for this prompt. Do not use `git add -A`.

Do not stage:

- the modified Prompt 06 spec/doc file, if still present locally;
- unrelated Wave 13 untracked directory;
- package files;
- lockfile;
- manifests;
- CI/workflow files;
- generated artifacts.

## Commit Instructions

Commit summary:

```text
test(pcc): close wave 10 permit inspection guardrails
```

Commit description:

```text
Closes the first Phase 3 Wave 10 Permit & Inspection Control Center implementation sequence with final regression tests, no-runtime/no-mutation guardrails, narrow implementation-evidence cleanup, and implementation closeout documentation.

Confirms GET-only read-model behavior, fixture/default posture, required target-added fields, failed/reinspection lineage, Priority Actions and readiness signal representation, launcher-only AHJ posture, Procore reference-only posture, evidence reference-only posture, and Wave 8/Wave 14 boundary preservation.

No package/dependency change, lockfile change, manifest change, CI/workflow change, tenant mutation, AHJ runtime, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence upload/storage/sync, external writeback/sync, backend write route, approval execution, packaging, deployment, or production rollout.
```

Do not push.

## Final Output Requirements

Return:

1. files changed;
2. baseline branch and HEAD;
3. closeout doc path;
4. tests/guardrails added or confirmed;
5. narrow cleanup performed;
6. validation results;
7. staged-file proof;
8. lockfile before/after hash;
9. commit hash;
10. explicit no-runtime/no-external/no-mutation confirmations;
11. Project Readiness / Wave 8 boundary confirmation;
12. Approvals / Wave 14 boundary confirmation;
13. remaining deferred items;
14. recommended next prompt or wave.

## Stop Conditions

Stop and report if:

- the baseline is not Prompt 06 or an approved newer descendant;
- safe guardrail coverage requires touching package/manifest/lockfile/CI/deployment files;
- guardrail additions require broad source rewrites;
- source-level scans show existing unauthorized runtime behavior introduced by Prompts 02–06;
- backend route hardening requires introducing write-route handling instead of confirming absence;
- safe closeout requires editing `docs/architecture/plans/**`;
- safe implementation closeout requires modifying the existing documentation closeout instead of creating the implementation closeout;
- Wave 10 hardening requires renaming `permit-log`;
- Wave 10 hardening requires broader Wave 14 Approvals migration;
- any forbidden local working-tree file would need to be staged.
