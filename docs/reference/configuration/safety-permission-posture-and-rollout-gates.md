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
  - Target default: tightened. Production defaults to `steady-state`; non-production defaults to `pre-rollout-tightened`. `staging-broad` is a time-boxed exception, not a durable destination.
- `SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED`
- `SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED`
- `SAFETY_TIGHTENED_PROOF_EVIDENCE_ID`
- `SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC` — ISO-8601 UTC, must be in the past (not future)
- `SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL` — must equal `sites-selected`
- `SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED` (required only for `staging-broad`)
- `SAFETY_STAGING_BROAD_EXCEPTION_REASON` (required only for `staging-broad`)

Rollout gate envs (enforced for non-staging-broad postures):
- `SAFETY_ROLLOUT_GATE_ENABLED` — must be `true` to permit ingestion under tightened posture
- `SAFETY_ROLLOUT_CHECKPOINT_ID` — immutable rollout identifier matching `^[A-Za-z0-9._:-]{8,128}$`
- `SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC` — optional ISO-8601 UTC expiry; if set and elapsed, rollout is blocked

Existing gates retained:
- `GRAPH_GROUP_PERMISSION_CONFIRMED`
- `SITES_PERMISSION_MODEL`
- `SITES_SELECTED_GRANT_CONFIRMED`

## Gate behavior

- Tightened postures (`pre-rollout-tightened`, `steady-state`) fail when:
  - `SITES_PERMISSION_MODEL` is not `sites-selected`
  - `SITES_SELECTED_GRANT_CONFIRMED` is not `true`
  - tightened proof flags are not both `true`
  - proof evidence id, executed-at UTC, or permission model is missing
  - proof executed-at is in the future, or stale beyond `SAFETY_TIGHTENED_PROOF_MAX_AGE_DAYS` under `steady-state`
  - rollout gate is not enabled, checkpoint id is missing/malformed, or gate has expired
- Broad posture (`staging-broad`) fails when:
  - `SITES_PERMISSION_MODEL` is not `fullcontrol`
  - exception confirmation metadata is missing

## Derived readiness (single source of truth)

All enforcement points consume `evaluateSafetyRolloutReadiness()` (from `backend/functions/src/utils/safety-rollout-readiness.ts`). The evaluator returns a typed result combining posture, proof bundle, and rollout gate status with a single `ready` boolean and stable issue codes. No consumer reimplements the rule set.

## Enforcement points

- `backend/functions/src/utils/validate-config.ts`
  - `validateProvisioningPrerequisites()` includes Safety posture + rollout gate validation
- `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts`
  - `validatePrelaunchReadiness()` surfaces typed Safety posture + rollout gate failures
- `backend/functions/src/functions/health/index.ts`
  - `/health` remains HTTP 200 always; readiness is expressed in the response body as `operationalReadiness`, `configTiers.safetyRolloutGate`, and `safetyRolloutReadiness.{surfaceState,gate,...}`
- `backend/functions/src/services/admin-control-plane/preflight-service.ts`
  - preflight emits blocking checks: `safety-permission-posture`, `safety-broad-posture-exception`, `safety-tightened-proof`, `safety-rollout-gate`
