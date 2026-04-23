# Prompt 02 — Tighten Permissions And Encode Rollout Gates

## Objective
Move the backend from staging/test broad-permission posture to an explicitly justified rollout posture, with hard gates that prevent production rollout without proof under the tightened permission model.

## Governing authorities
- Microsoft Graph least-privilege guidance.
- Microsoft Graph selected-permissions guidance for Sites / Lists / ListItems.
- Uploaded app-registration artifact showing broad current permissions.
- Audit requirement: broad Graph permissions are allowed for stabilization, but not as an unexamined final state.

## Files / seams / symbols to inspect
- backend auth/config/validation seams under:
  - `backend/functions/src/middleware/**`
  - `backend/functions/src/utils/validate-config.ts`
  - any environment/config registry files
- any permission/consent documentation or deployment scripts relevant to the function app and app registration

## Current gap to close
The backend may be able to work under broad Graph permissions, but that is not yet encoded as a temporary staging posture with mandatory pre-rollout tightening.

## Required implementation outcome
1. Produce a required-permissions matrix for the final Graph-native Safety lane.
2. Remove or flag permissions that are no longer justified.
3. Prefer selected-scope/site-scoped posture where it still supports the workflow.
4. Add rollout-time validation or release checks that fail if the required permission posture is not met or has not been proven.
5. Add explicit documentation of staging/test vs pre-rollout vs steady-state permission posture.

## Proof of closure required
- Show the final permission matrix.
- Show successful end-to-end ingest under the tightened posture.
- Show rollout gates / validation checks that would fail if the permission posture drifts.

## Hard prohibitions
- Do not leave broad permissions as the unexamined final posture.
- Do not confuse “the app works” with “the permission model is acceptable.”

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
