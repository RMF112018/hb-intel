# Safety Permission Posture And Rollout Gates

Date: 2026-04-23

## Purpose
Define the required Microsoft Graph permission posture for Safety ingestion/replay and the mandatory rollout gates that block production rollout when posture proof is missing.

## Safety permission matrix

| Permission | Staging (temporary broad) | Pre-rollout (tightened) | Steady-state | Intent |
| --- | --- | --- | --- | --- |
| `Sites.Selected` | Conditional | Required | Required | Least-privilege selected-scope access for Safety SharePoint data plane |
| `Sites.FullControl.All` | Conditional (time-boxed exception only) | Forbidden | Forbidden | Broad fallback allowed only for short-lived staging stabilization |
| `Group.ReadWrite.All` | Required | Required | Conditional | Required for current provisioning/control-plane Entra group lifecycle |

## Environment contracts

Required posture signaling env vars:
- `SAFETY_PERMISSION_POSTURE`
  - Allowed values: `staging-broad`, `pre-rollout-tightened`, `steady-state`
  - Default behavior:
    - `Production` environment defaults to `steady-state`
    - non-production defaults to `pre-rollout-tightened`
- `SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED`
- `SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED`
- `SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED` (required only for `staging-broad`)
- `SAFETY_STAGING_BROAD_EXCEPTION_REASON` (required only for `staging-broad`)

Existing gates retained:
- `GRAPH_GROUP_PERMISSION_CONFIRMED`
- `SITES_PERMISSION_MODEL`
- `SITES_SELECTED_GRANT_CONFIRMED`

## Gate behavior

- Tightened postures (`pre-rollout-tightened`, `steady-state`) fail when:
  - `SITES_PERMISSION_MODEL` is not `sites-selected`
  - `SITES_SELECTED_GRANT_CONFIRMED` is not `true`
  - tightened proof flags are not both `true`
- Broad posture (`staging-broad`) fails when:
  - `SITES_PERMISSION_MODEL` is not `fullcontrol`
  - exception confirmation metadata is missing

## Enforcement points

- `backend/functions/src/utils/validate-config.ts`
  - `validateProvisioningPrerequisites()` includes Safety posture validation
- `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts`
  - `validatePrelaunchReadiness()` surfaces typed Safety posture failures
- `backend/functions/src/functions/health/index.ts`
  - health response includes `safetyPermissionPosture` diagnostics
- `backend/functions/src/services/admin-control-plane/preflight-service.ts`
  - preflight emits blocking checks for invalid posture or missing proof
