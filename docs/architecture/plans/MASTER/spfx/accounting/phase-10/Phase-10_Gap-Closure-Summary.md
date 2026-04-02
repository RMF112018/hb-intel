# Phase 10 — Accounting SPFx Production Gap Closure Summary

## Objective

Close all material gaps identified in the Accounting SPFx `.sppkg` production-readiness audit so that the Accounting surface can be reclassified from staging-ready-only toward a credible production-ready posture, subject to successful implementation, validation, and tenant-side approvals.

## Audit Gaps Being Closed

### Gap 1 — Missing production-proof runtime injection in the shipped Accounting shell
The uploaded Accounting shell artifact did not prove the current shell injection path for:
- `FUNCTION_APP_URL`
- `API_AUDIENCE`
- `ALLOW_BACKEND_MODE_SWITCH`
- production-targeted runtime config behavior

### Gap 2 — No declared `webApiPermissionRequests` in Accounting package config
The comparison Project Setup SPFx package declares a SharePoint API approval path. Accounting does not currently evidence the same production approval posture.

### Gap 3 — Accounting auth posture trails Project Setup auth posture
Project Setup has a more mature SPFx production token acquisition, runtime readiness, and environment-state pattern. Accounting must either align to that production model or explicitly document a different supported model.

### Gap 4 — UI/UX environment-state drift
Accounting and Project Setup share a family shell but do not yet present a sufficiently unified in-shell environment, theme, and trust-state experience for SharePoint-hosted operation.

### Gap 5 — Latent `/api/users/me/*` dependency surface remains bundled
The complexity package’s same-origin endpoint strings remain present in built artifacts even though the active Project Setup scope treats them as dead dependencies. This is not the top release blocker, but it is still production-hygiene debt.

### Gap 6 — Documentation drift in production-sensitive configuration
Current docs still contain stale or mixed staging/production guidance in areas that directly affect build-time injection, API audience alignment, permission approval, and connected-service posture.

## Phase 10 Implementation Strategy

### Stage 1 — Lock the repo-truth baseline
Confirm what is already true in the repo and freeze the exact scope of the remaining work.

### Stage 2 — Fix packaging and runtime injection first
Close the shell-build and packaged-artifact gap before changing broader docs or release claims.

### Stage 3 — Freeze the Accounting production auth and approval model
Make the frontend, package, backend, and SharePoint approval posture internally consistent.

### Stage 4 — Align runtime behavior and shell experience
Bring Accounting closer to the Project Setup production UX standard where that standard is intentionally governed.

### Stage 5 — Clean residual dependency and documentation debt
Reduce latent bundle ambiguity and make the docs match the implemented production posture.

### Stage 6 — Prove closure with artifacts and evidence
Rebuild, inspect, test, and document the result. Do not claim closure based only on source changes.

## Expected Phase 10 Outputs

- updated Accounting package/runtime wiring
- explicit Accounting production auth contract
- reconciled SharePoint package permission posture
- improved shell/theme/environment-state continuity
- cleaned or explicitly governed latent same-origin dependency surface
- corrected production/staging documentation
- tests and artifact-inspection evidence
- Phase 10 closure report with residual risks and unresolved external prerequisites

## Definition of Success

Phase 10 is successful only if all of the following are true:

- the Accounting `.sppkg` is freshly rebuilt from current repo truth
- the packaged shell asset proves the intended production runtime injection path
- the Accounting package’s permission/approval posture is explicit and documented
- the Accounting production auth model is internally consistent with backend validation and environment config
- the user experience feels materially more like one governed SharePoint-hosted HB Intel app family
- documentation matches repo truth and no longer mixes staging and production guidance in critical paths
- closure is evidenced by tests, package inspection, and updated release/readiness documentation
