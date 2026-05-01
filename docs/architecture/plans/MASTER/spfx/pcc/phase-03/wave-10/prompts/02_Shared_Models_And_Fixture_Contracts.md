# Prompt 02 — Shared Models and Fixture Contracts

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Add the shared Phase 3 / Wave 10 Permit & Inspection Control Center model contracts and deterministic fixtures under `packages/models/src/pcc/`.

This is a contract-first pass. Do not add backend routes. Do not build SPFx UI. Do not introduce runtime integrations.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use Prompt 01 findings first. Re-open only as needed:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/PriorityActions.ts`
- `packages/models/src/pcc/index.ts`
- existing `packages/models/src/pcc/*.test.ts`
- existing `packages/models/src/pcc/fixtures/**` if present

## Allowed Files / Likely Files

Use the exact Prompt 01 file list. Likely allowed files:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts` new
- `packages/models/src/pcc/PermitInspectionControlCenter.test.ts` new
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts` only if a backward-compatible source-module alignment is required and can be proven safe
- `packages/models/src/pcc/index.ts`
- existing or new fixture files under `packages/models/src/pcc/fixtures/`

Do not touch package manifests or lockfiles.

## Required Model Coverage

Define Wave 10 model contracts for:

- permit record;
- inspection record;
- AHJ / jurisdiction profile;
- fee exposure;
- reinspection lineage;
- evidence link;
- audit event;
- source traceability;
- status vocabularies;
- transition metadata;
- priority-action signal;
- Project Readiness signal;
- Approvals / Checkpoints signal;
- top-level Permit & Inspection Control Center read-model snapshot.

Required target-added fields must exist and be tested:

- permit `revision`;
- permit `applicationValue`;
- permit `permitFee`;
- inspection `reInspectionFee`.

Required lineage fields must exist and be tested:

- `parentInspectionId`;
- `childReinspectionId`;
- `failedItemSummary`;
- `correctiveActionOwner`;
- `correctiveActionDueDate`;
- `reinspectionRequired`;
- `reinspectionRequestedDate`;
- `reinspectionScheduledWindow`;
- `reInspectionFee`;
- `reinspectionResult`;
- `evidenceLinks`;
- `auditEvents`.

## Required Metadata Alignment

Preserve internal source-family continuity:

- `permits`
- `required-inspections`

Correct user-facing module metadata where safe:

- `permits` should not remain user-facing as only `Permit Log` if this file is touched.
- Preserve backward compatibility for IDs and tests.
- If changing `ProjectReadinessFramework.ts` source-module vocabulary would cause broad breakage, stop and report with a minimal compatibility strategy instead of forcing a broad rename.

Add a `PccReadModels.ts` response-map key for the Wave 10 read model, preferably:

- `permit-inspection-control-center`

Stop and report if repo naming conventions indicate a different route/read-model key is required.

## Prohibited Scope

Do not edit `docs/architecture/plans/**`.

Do not add backend routes.

Do not edit SPFx UI.

Do not add HTTP clients.

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

Do not introduce backend write routes or approval execution.

## Implementation Steps

1. Capture baseline:

```bash
git status --short
md5 pnpm-lock.yaml
```

2. Create or extend Wave 10 shared model contracts under `packages/models/src/pcc/`.

3. Add deterministic fixtures that include:
   - at least one expiring permit;
   - at least one permit pending revision;
   - at least one permit with `applicationValue` and `permitFee`;
   - at least one failed inspection;
   - at least one reinspection lineage chain;
   - at least one inspection with `reInspectionFee`;
   - at least one AHJ profile with launcher-only posture;
   - at least one evidence-missing record;
   - at least one fee exposure record;
   - source-traceability metadata.

4. Export the new contracts through existing package patterns.

5. Extend `PccReadModels.ts` with a Wave 10 read-model response-map key.

6. Align user-facing module metadata only where directly necessary and safe.

7. Add model tests proving:
   - required target-added fields exist in fixtures;
   - launcher-only AHJ posture is represented;
   - reinspection lineage is parent/child traceable;
   - evidence links are references only;
   - no runtime/import boundary packages are introduced;
   - source-family continuity is preserved.

## Validation Commands

Run only repo-appropriate commands:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
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

Stage only the files touched for this prompt. Do not stage unrelated files.

## Commit Instructions

Commit summary:

```text
feat(models-pcc): add wave 10 permit inspection contracts
```

Commit description:

```text
Adds shared Permit & Inspection Control Center model contracts and deterministic fixtures for Phase 3 Wave 10.

Defines permit, required inspection, AHJ profile, fee exposure, evidence-link, audit, source-traceability, status, transition, and reinspection-lineage contracts.

Includes required target-added fields: revision, applicationValue, permitFee, and reInspectionFee.

Preserves internal permits and required-inspections source-family continuity. No backend route, SPFx UI, package, lockfile, manifest, tenant, AHJ, Procore, Microsoft Graph, SharePoint runtime, external-system runtime, evidence storage, write route, approval execution, or deployment changes.
```

## Final Output Requirements

Return:

1. files changed;
2. model contracts added;
3. fixture records added;
4. tests added;
5. validation results;
6. staged-file proof;
7. lockfile before/after hash;
8. commit hash;
9. any deferred compatibility notes for `permit-log` naming or Project Readiness source-module alignment.
