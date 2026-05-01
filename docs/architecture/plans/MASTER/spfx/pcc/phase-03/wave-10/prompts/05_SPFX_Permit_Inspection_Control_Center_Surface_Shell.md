# Prompt 05 — SPFx Permit & Inspection Control Center Surface Shell

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Build the first user-facing SPFx Permit & Inspection Control Center surface shell for Phase 3 / Wave 10.

This prompt should implement the visual/interaction shell using deterministic fixtures and the read-model client seam added in Prompt 04. Actions must remain inert, preview-only, disabled, route-reference-only, or framework-compliant. No external runtime behavior is authorized.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use prior prompt findings first. Re-open only as needed:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`
- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectHome/*`
- `apps/project-control-center/src/surfaces/documents/*`
- `apps/project-control-center/src/surfaces/teamAccess/*`
- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- existing surface tests under `apps/project-control-center/src/tests/`

## Allowed Files / Likely Files

Use Prompt 01’s exact allowed list. Likely allowed files:

- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/PccPermitInspectionControlCenterSurface.tsx` new
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/PccPermitInspectionControlCenterSurface.module.css` new
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/permitInspectionControlCenterViewModel.ts` new
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/usePermitInspectionControlCenterReadModel.ts` new if consistent with existing hook patterns
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` if hosting Wave 10 through the Project Readiness surface shell
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` only if the repo requires a route or client-threading update
- `apps/project-control-center/src/tests/*permit*inspection*.test.tsx` new or existing test files

Do not add a new top-level `PccMvpSurfaceId` unless Prompt 01 concluded that is the correct repo pattern. Prefer plugging Wave 10 into the existing Project Readiness surface/module shell if no top-level surface slot exists.

Do not touch package manifests or lockfiles.

## Required Surface Content

Implement command-center lanes for:

- permits blocking work;
- inspections ready to request;
- failed / reinspection queue;
- expiring permits;
- fees / receipts open;
- evidence missing;
- closeout / TCO / CO exposure;
- AHJ launcher panel;
- record detail drawer or detail region if no drawer pattern exists.

The surface must expose, at minimum:

- permit `revision`;
- permit `applicationValue`;
- permit `permitFee`;
- inspection `reInspectionFee`;
- permit status;
- inspection result/status;
- AHJ launcher-only indicator;
- source traceability;
- evidence reference state;
- failed/reinspection lineage summary.

## Required UX Posture

Use existing PCC visual patterns:

- `PccDashboardCard`;
- bento/grid patterns;
- `PccPreviewState`;
- existing status-pill or compact metadata patterns;
- responsive no-overflow behavior.

All operational controls must be inert unless an existing framework-compliant route/reference behavior already exists.

AHJ launchers:

- may render as launcher/reference metadata;
- must not perform scheduling, submission, status polling, scraping, or API calls;
- if no safe existing external launch component exists, render launcher URLs as inert text or disabled “Configured launcher” affordances.

Procore references:

- launcher/reference only;
- no Procore runtime client, sync, writeback, mirror, or API call.

Evidence:

- link/reference posture only;
- no upload, sync, storage, mirror, or file operation.

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

2. Confirm where Wave 10 should surface:
   - Project Readiness module shell; or
   - dedicated surface if the repo already supports that pattern.

3. Create the Wave 10 surface/view-model components using the read-model client seam and fixture fallback.

4. Render the required command-center lanes.

5. Add a detail region or drawer-like detail panel using existing patterns.

6. Make all actions non-executing:
   - disabled buttons;
   - preview-only chips;
   - inert launcher references;
   - no `onClick` mutation behavior;
   - no unsafe anchors unless an existing safe external launch pattern is used.

7. Add tests proving:
   - required lanes render;
   - required target-added fields render;
   - failed/reinspection lineage renders;
   - AHJ panel is launcher-only;
   - Procore remains reference-only;
   - evidence remains reference-only;
   - no external runtime calls occur;
   - no write/execution controls are active;
   - responsive surface does not create obvious horizontal overflow.

## Validation Commands

Run:

```bash
pnpm --filter @hbc/models check-types
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
feat(spfx-pcc): add permit inspection control center shell
```

Commit description:

```text
Adds the first SPFx Permit & Inspection Control Center surface shell for Phase 3 Wave 10.

Implements fixture/read-model driven command-center lanes for permit blockers, inspection readiness, failed/reinspection lineage, expiring permits, fee exposure, missing evidence, closeout exposure, AHJ launcher posture, and record detail context.

Keeps actions inert or reference-only. No AHJ scheduling/submission/status polling/scraping/API behavior, Procore runtime, Microsoft Graph runtime, SharePoint REST/PnP runtime, evidence upload/storage/sync, external writeback, backend writes, approval execution, package, lockfile, manifest, CI, tenant, packaging, deployment, or production rollout changes.
```

## Final Output Requirements

Return:

1. files changed;
2. surface placement decision;
3. lanes implemented;
4. inert action posture confirmation;
5. tests added/updated;
6. validation results;
7. staged-file proof;
8. lockfile before/after hash;
9. commit hash;
10. any UX follow-up items deferred to Prompt 07.
