# Prompt 03 — Backend GET-Only Mock Read Model

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Add a backend GET-only mock read-model endpoint for Phase 3 / Wave 10 Permit & Inspection Control Center using the repo’s existing PCC read-model provider pattern.

This prompt must return deterministic fixture data only. It must not introduce writes, persistence, live AHJ calls, live Procore calls, Microsoft Graph calls, SharePoint REST/PnP calls, or external-system runtime operations.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Repo-Truth Files to Inspect

Use Prompt 01 and Prompt 02 findings first. Re-open only as needed:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- existing backend read-model guardrail tests
- `backend/functions/package.json`

## Allowed Files / Likely Files

Use Prompt 01’s exact allowed list. Likely allowed files:

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- existing backend read-model provider tests
- `packages/models/src/pcc/PccReadModels.ts` only if Prompt 02 did not complete the response-map key
- `packages/models/src/pcc/PermitInspectionControlCenter.test.ts` only if provider fixture alignment requires model-side assertions

Do not touch package manifests or lockfiles.

## Required Backend Behavior

Add a read-only provider method equivalent to:

- `getPermitInspectionControlCenter(projectId, viewerPersona?)`

Add a GET-only route equivalent to:

- `GET /api/pcc/projects/{projectId}/permit-inspection-control-center`

Use the repo’s existing route registration pattern and envelope semantics.

The response must:

- return `readOnly: true`;
- use deterministic fixture data from `@hbc/models/pcc`;
- include source/degraded-state warnings where relevant;
- preserve unknown-project behavior consistent with existing PCC read models;
- include launcher-only AHJ posture;
- include no Procore runtime behavior;
- include no Graph/PnP/SharePoint REST behavior;
- include no write or mutation affordances.

Stop and report if the repo’s route naming convention requires a different route key.

## Prohibited Scope

Do not edit `docs/architecture/plans/**`.

Do not add backend POST, PUT, PATCH, DELETE, queue, timer, or write routes.

Do not add persistence.

Do not add package dependencies.

Do not change package manifests.

Do not change `pnpm-lock.yaml`.

Do not change SPFx code in this prompt.

Do not change SPFx manifests.

Do not change CI/workflows.

Do not run broad formatting.

Do not introduce AHJ scraping, AHJ API calls, AHJ inspection scheduling, AHJ permit submission, or AHJ status polling.

Do not introduce Procore runtime integration.

Do not introduce Microsoft Graph runtime integration.

Do not introduce SharePoint REST or PnP runtime operations.

Do not introduce evidence upload, sync, mirror, or storage behavior.

Do not introduce external-system writeback/sync/mirror.

Do not introduce direct approval execution.

Do not introduce production rollout or deployment behavior.

## Implementation Steps

1. Capture baseline:

```bash
git status --short
md5 pnpm-lock.yaml
```

2. Extend the backend read-model provider interface with a Wave 10 read method.

3. Extend the mock provider to return the deterministic Wave 10 fixture envelope.

4. Register the GET-only route using the existing `registerPccReadRoute` pattern.

5. Add or extend tests proving:
   - route is GET-only;
   - route returns a read-only envelope;
   - route returns deterministic fixture data;
   - unknown project behavior matches existing PCC patterns;
   - no forbidden imports or runtime tokens were introduced;
   - no write methods/routes exist for Wave 10.

6. Preserve existing Project Readiness, Document Control, Team & Access, and Project Home routes unchanged.

## Validation Commands

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
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
feat(functions-pcc): add permit inspection mock read model
```

Commit description:

```text
Adds a GET-only PCC read-model route and mock provider method for Phase 3 Wave 10 Permit & Inspection Control Center.

Returns deterministic read-only fixture data for permits, required inspections, AHJ launcher profiles, fee exposure, evidence references, and failed/reinspection lineage.

Preserves existing envelope semantics and no-mutation posture. No backend write routes, persistence, AHJ runtime calls, Procore runtime calls, Microsoft Graph runtime, SharePoint REST/PnP runtime, package, lockfile, manifest, deployment, tenant, external-system writeback, evidence storage, or approval-execution changes.
```

## Final Output Requirements

Return:

1. files changed;
2. route added;
3. provider method added;
4. tests added/updated;
5. validation results;
6. staged-file proof;
7. lockfile before/after hash;
8. commit hash;
9. explicit guardrail confirmation that the route is GET-only and fixture/mock-only.
