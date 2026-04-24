# Prompt 02 — Tighten Rollout Permission Posture and Health Surface

## Objective

Convert the backend from a staging-friendly posture to a rollout-ready posture by tightening permission posture, reducing public operational disclosure, and hardening browser-surface configuration.

## Governing authorities

- current Graph-only cutover direction
- Azure Functions operational guidance
- Microsoft Graph delegated vs application permission model
- selected-scope support for SharePoint/OneDrive
- least-privilege rollout discipline

## Files and seams to inspect

At minimum inspect:

- `backend/functions/src/functions/health/index.ts`
- `backend/functions/host.json`
- `backend/functions/src/utils/validate-config.ts`
- any Safety permission-posture / rollout-readiness utilities
- any environment/config registry files that define required settings

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current gap to close

Broad Graph permissions are acceptable for staging stabilization, but they are not a production posture by themselves.

Separately, the anonymous health endpoint currently discloses too much readiness/config detail.

## Required implementation outcome

Implement the backend so that:

1. the public anonymous health route becomes minimal liveness only
2. detailed readiness/config/permission posture is moved behind an authenticated/admin-only surface or a tightly governed environment gate
3. rollout permission requirements are explicitly documented and validated
4. CORS posture is constrained to exact trusted origins for production browser traffic

## Proof of closure required

- updated public vs privileged health/readiness behavior
- explicit permission inventory for rollout
- config validation aligned to rollout posture
- CORS hardening evidence
- no loss of operator supportability

