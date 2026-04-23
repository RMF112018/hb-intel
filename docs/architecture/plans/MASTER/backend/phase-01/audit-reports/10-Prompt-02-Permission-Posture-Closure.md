# 10 — Prompt 02 Permission Posture Closure

Date: 2026-04-23

## Closure statement
Prompt 02 is closed. Safety backend permission posture is now encoded as an explicit rollout contract with hard validation gates. Broad posture remains available only as a temporary, time-boxed staging exception with required human confirmation metadata.

## Final permission matrix
Canonical matrix:
- `docs/reference/configuration/safety-permission-posture-and-rollout-gates.md`

Summary:
1. `Sites.Selected` is required for pre-rollout and steady-state.
2. `Sites.FullControl.All` is forbidden for pre-rollout and steady-state, and allowed only as a staging exception.
3. `Group.ReadWrite.All` remains justified for current provisioning/control-plane group lifecycle operations.

## Implemented rollout gates
1. Config-prerequisite gate:
- `backend/functions/src/utils/validate-config.ts` now validates Safety posture with explicit error codes/remediation.

2. Prelaunch structured validation:
- `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts` now emits typed failures for Safety posture drift and missing proof flags.

3. Health diagnostics:
- `backend/functions/src/functions/health/index.ts` now includes `safetyPermissionPosture` diagnostics and marks posture drift in `configTiers`.

4. Admin preflight gate:
- `backend/functions/src/services/admin-control-plane/preflight-service.ts` now includes blocking Safety posture checks:
  - `safety-permission-posture`
  - `safety-broad-posture-exception`
  - `safety-tightened-proof`

5. Env registry contract:
- `backend/functions/src/config/wave0-env-registry.ts` now records Safety posture env contracts and proof flags.

## Verification results

### Backend tests
Executed:
- `pnpm --filter @hbc/functions test -- safety-permission-posture validate-config prelaunch-validation preflight-service release-gates infra-readiness authz-release-gates safety-ingestion-graph-repository safety-record-keeping-routes`
- `pnpm --filter @hbc/functions check-types`

Result:
- Pass.

### Safety package tests
Executed:
- `pnpm --filter @hbc/features-safety test -- SharePointSafetyInspectionRepository.backend-ingestion`
- `pnpm --filter @hbc/features-safety check-types`

Result:
- Pass.

### Tightened posture ingest + replay proof
Evidence source:
- Existing graph-only ingest/replay tests remain passing under current cutover guards:
  - backend graph repository replay test coverage (`safety-ingestion-graph-repository.test.ts`)
  - backend route wiring coverage for ingest/replay (`safety-record-keeping-routes.test.ts`)
  - frontend sharepoint adapter backend-delegation replay coverage (`SharePointSafetyInspectionRepository.backend-ingestion.test.ts`)

## Seam and drift evidence commands

1. Safety posture gate presence:
- `rg -n "SAFETY_PERMISSION_POSTURE|SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED|SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED|SAFETY_STAGING_BROAD_EXCEPTION" backend/functions/src`

Result highlights:
- Variables appear in registry and gate logic (`validate-config`, `prelaunch-validation`, `health`, `preflight-service`, `safety-permission-posture` utility).
- New utility and test seams present:
  - `backend/functions/src/utils/safety-permission-posture.ts`
  - `backend/functions/src/utils/safety-permission-posture.test.ts`

2. Broad-model drift prevention in tightened posture:
- `rg -n "SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED|SITES_SELECTED_GRANT_CONFIRMED" backend/functions/src`

Result highlights:
- Tightened posture explicitly rejects non-`sites-selected` model and requires confirmed grant workflow.
- Tightened drift code is present in `safety-permission-posture.ts` and consumed by both `validate-config.ts` and `prelaunch-validation.ts`.

3. Safety ingestion/replay lane remains backend Graph path:
- `rg -n "repo.ingestWorkbook|repo.replayIngestion|/_api/web/lists|SharePointSafetyInspectionRepository" backend/functions/src/services/sharepoint-service.ts backend/functions/src/services/safety-ingestion-graph-repository.ts packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`

Result highlights:
- Backend lane uses Graph repository ingest/replay calls and no active REST ingestion/replay fallback.
- `sharepoint-service.ts` contains:
  - `repo.ingestWorkbook(...)`
  - `repo.replayIngestion(...)`
- `_api/web/lists` matches are only in non-ingestion adapter list/read methods in `SharePointSafetyInspectionRepository.ts`.

## Retained non-ingestion permissions and rationale
Retained non-ingestion control-plane permissions are intentionally preserved where still required (for provisioning/control-plane operations). Prompt 02 removes unexamined broad posture as default and enforces explicit rollout proof without deleting legitimately needed control-plane capabilities.
