# Prompt 06 — Priority Actions / Readiness / Approvals Integration

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Integrate Phase 3 / Wave 10 Permit & Inspection Control Center signals into existing Priority Actions, Project Readiness, and Approvals / Checkpoints patterns without executing approvals, workflows, external calls, or writes.

This is a signal/adapter/fixture integration pass only.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use prior prompt findings first. Re-open only as needed:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PriorityActions.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- existing `packages/models/src/pcc/fixtures/**`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `apps/project-control-center/src/surfaces/projectHome/*`
- `apps/project-control-center/src/surfaces/projectReadiness/*`
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/*`
- `apps/project-control-center/src/tests/*`

## Allowed Files / Likely Files

Use Prompt 01’s exact allowed list. Likely allowed files:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PriorityActions.ts` only if existing category metadata needs safe label/description alignment
- `packages/models/src/pcc/ProjectReadinessFramework.ts` only if a backward-compatible source-module alignment is required and tests prove safety
- existing Wave 10 fixture files under `packages/models/src/pcc/fixtures/**`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `apps/project-control-center/src/surfaces/projectHome/*`
- `apps/project-control-center/src/surfaces/projectReadiness/*`
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/*`
- corresponding tests

Do not touch package manifests or lockfiles.

## Required Conditions to Represent

Represent all of the following as read-only signals:

- missing evidence;
- failed inspection;
- overdue permit;
- expiring permit;
- open permit fee;
- open reinspection fee;
- revision required;
- reinspection required;
- inspection ready to request;
- inspection not scheduled in target window;
- closeout / TCO / CO exposure where supported by fixture data.

## Priority Actions Requirements

Existing priority categories already include `permit` and `inspection`. Use them where possible.

Add or map sample actions for:

- permit pending revision;
- expiring permit;
- expired/overdue permit;
- inspection ready to request;
- failed inspection requiring corrective action;
- reinspection required;
- evidence required/missing;
- fee pending receipt/payment.

Actions must be non-executing. They may route/reference owning module context only if existing app patterns support safe drill-in.

## Project Readiness Requirements

Wave 10 must emit readiness signals into the Wave 8 framework seam without taking ownership of the Wave 8 framework.

Rules:

- Do not rewrite the Project Readiness framework broadly.
- Do not remove existing source-module values without compatibility tests.
- If `permit-log` remains an existing source-module ID, either:
  - add a backward-compatible alias/mapping strategy; or
  - keep Wave 10 readiness source metadata within the Wave 10 read model and document the later Wave 8 alignment need.
- Stop and report if a safe compatibility path requires a broader framework migration.

## Approvals / Checkpoints Requirements

Represent checkpoint trigger metadata only for:

- closeout authorization;
- no-reinspection exception approval;
- evidence override-by-reason;
- transition exception override.

Do not execute approvals.

Do not create write routes.

Do not add workflow mutation.

## Prohibited Scope

Do not edit `docs/architecture/plans/**`.

Do not add package dependencies.

Do not change package manifests.

Do not change `pnpm-lock.yaml`.

Do not change SPFx manifests.

Do not change CI/workflows.

Do not run broad formatting.

Do not introduce AHJ scraping, AHJ API calls, AHJ inspection scheduling, AHJ permit submission, or AHJ status polling.

Do not introduce Procore runtime integration.

Do not introduce Microsoft Graph runtime integration.

Do not introduce SharePoint REST or PnP runtime operations.

Do not introduce evidence upload, sync, mirror, or storage behavior.

Do not introduce external-system writeback/sync/mirror.

Do not introduce backend write routes.

Do not introduce direct approval execution.

Do not introduce packaging, deployment, tenant mutation, or production rollout.

## Implementation Steps

1. Capture baseline:

```bash
git status --short
md5 pnpm-lock.yaml
```

2. Extend Wave 10 fixtures/signals to include required Priority Actions, readiness blockers, and checkpoint trigger metadata.

3. Map permit/inspection signal records to existing Priority Actions structures.

4. Map or represent Wave 10 readiness signals without violating Wave 8 framework ownership.

5. Represent approval/checkpoint triggers as metadata only.

6. Update backend mock provider fixture envelope if needed.

7. Update SPFx surface display so integrated signals are visible but not executable.

8. Add tests proving:
   - all required conditions are represented;
   - Priority Actions categories use `permit` and `inspection`;
   - readiness blockers remain blocker-first;
   - checkpoint triggers are metadata-only;
   - no approval execution exists;
   - no write route or external runtime was introduced.

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

## Staged-File Proof Before Commit

Before committing, run:

```bash
git status --short
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Stage only files touched for this prompt. Do not stage unrelated files.

## Commit Instructions

Commit summary:

```text
feat(pcc): integrate permit inspection readiness signals
```

Commit description:

```text
Integrates Phase 3 Wave 10 Permit & Inspection Control Center signals into existing Priority Actions, Project Readiness, and Approvals / Checkpoints patterns.

Adds read-only signal coverage for missing evidence, failed inspections, overdue/expiring permits, fee exposure, revision required, reinspection required, inspection readiness, and closeout exposure.

Keeps approval/checkpoint triggers metadata-only and preserves Wave 8 framework and Wave 14 authority boundaries. No write routes, approval execution, workflow mutation, AHJ runtime, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence storage/sync, package, lockfile, manifest, CI, tenant, packaging, deployment, or production rollout changes.
```

## Final Output Requirements

Return:

1. files changed;
2. signal conditions represented;
3. Priority Actions integration summary;
4. Project Readiness integration summary;
5. Approvals / Checkpoints metadata summary;
6. tests added/updated;
7. validation results;
8. staged-file proof;
9. lockfile before/after hash;
10. commit hash;
11. any deferred Wave 8 source-module compatibility item.
