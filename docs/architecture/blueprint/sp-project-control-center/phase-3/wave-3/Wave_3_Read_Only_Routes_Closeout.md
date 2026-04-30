# Phase 3 — Wave 3 Prompt 05 Closeout

**Prompt:** 05 — Read-Only Backend Routes, Mock Mode Only  
**Date:** 2026-04-30  
**Status:** Complete (package validation complete; hosted/tenant proof OPERATOR-PENDING)

## Files Changed

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` (added)
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` (added)
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-route-guardrails.test.ts` (added)
- `backend/functions/src/index.ts` (updated; startup side-effect import)
- `backend/functions/vitest.config.ts` (updated; host-scoped test discovery)
- `backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts` (updated; allows `@azure/functions` while keeping Azure SDK runtime ban)
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Only_Routes_Closeout.md` (this file)

No edits were made to:
- `backend/functions/package.json`
- `pnpm-lock.yaml`
- `packages/models/**`
- `apps/project-control-center/**`
- workflows, deployment files, manifests, package/version metadata.

## Exact Routes Added (GET-only)

All routes are registered under Azure Functions route strings (`/api/` prefix applied by host runtime):

1. `GET /api/pcc/projects/{projectId}/profile`
2. `GET /api/pcc/projects/{projectId}/modules`
3. `GET /api/pcc/projects/{projectId}/home`
4. `GET /api/pcc/projects/{projectId}/priority-actions`
5. `GET /api/pcc/projects/{projectId}/document-control`
6. `GET /api/pcc/projects/{projectId}/external-links`
7. `GET /api/pcc/projects/{projectId}/site-health`

No Team Access route, no Settings route, and no write routes were added.

## Startup Import / Registration Proof

`backend/functions/src/index.ts` now includes:

- `import './hosts/pcc-read-model/pcc-read-model-routes.js';`

This side-effect import activates `app.http(...)` registrations at function startup under the existing host registration model.

## Provider Wiring Proof

All seven routes in `pcc-read-model-routes.ts` are wired to **only** `PccMockReadModelProvider`:

- `getProjectProfile`
- `getModuleRegistry`
- `getProjectHome`
- `getPriorityActions`
- `getDocumentControl`
- `getExternalLinks`
- `getSiteHealth`

No alternate provider or runtime integration path is introduced.

## Auth Posture

Each route uses existing backend conventions:

- `app.http(...)`
- `methods: ['GET']`
- `authLevel: 'anonymous'`
- `withAuth(...)`
- `extractOrGenerateRequestId(...)`
- shared response helpers

Static + unit tests verify all registered handlers are wrapped with `withAuth` and remain GET-only.

## Response Body Convention

Routes return `successResponse(envelope)`.

Therefore HTTP JSON body shape is:

```json
{ "data": <PccReadModelEnvelope<T>> }
```

The provider envelope is preserved unchanged inside `data`.

## Project ID Behavior

- `projectId` is read from route params.
- Missing `projectId` returns repo-consistent validation error (`400`, `VALIDATION_ERROR`) and includes `requestId`.
- Unknown but present `projectId` is passed through to provider and returns provider `source-unavailable` envelope semantics.

## No-Write / No-Runtime / No-Mutation Confirmation

- No `POST`, `PUT`, `PATCH`, or `DELETE` route methods were added.
- No route names include forbidden execution/mutation verbs.
- No Graph/PnP/SharePoint REST, Procore, Document Crunch, Adobe Sign, provisioning executor, repair runner, scanner, approval execution, permission execution, workflow write, persistence write, or tenant mutation path was added.
- Guardrail tests assert forbidden runtime imports are absent and mutation/execution seam tokens are absent in executable route/provider host source.

## Test Coverage Implemented

Prompt 05 tests prove:

1. each of the seven routes is registered;
2. each route is GET-only;
3. no write methods are registered in the PCC route family;
4. each route calls the correct mock-provider method;
5. response body preserves provider envelope as `{ data: envelope }`;
6. unknown `projectId` keeps provider `source-unavailable` semantics;
7. auth posture (`withAuth`) is applied without live tenant auth;
8. forbidden runtime imports/mutation seam tokens are blocked by static guardrails.

## Validation Results

Executed in required order:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
```

Final results:

- `@hbc/models check-types`: passed
- `@hbc/models test`: passed (31 files / 224 tests)
- `@hbc/functions check-types`: passed
- `@hbc/functions test`: passed (138 files / 2282 passed / 3 skipped)
- `@hbc/functions build`: passed

## Lockfile Checksum (Pre/Post)

- **Pre-validation:** `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4`
- **Post-validation:** `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4`

`pnpm-lock.yaml` remained unchanged.

## Hosted/Tenant Proof

**OPERATOR-PENDING.**

Prompt 05 introduced no deployment, app catalog, `.sppkg`, or tenant mutation operations. Hosted/tenant runtime proof remains operator-owned and deferred.

## Recommended Next Prompt

**Prompt 06 — SPFx Client Boundary with No Default Runtime Cutover**
