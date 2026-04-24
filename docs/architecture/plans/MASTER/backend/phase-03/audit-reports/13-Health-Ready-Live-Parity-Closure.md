# Health Ready Live Parity Closure

Date: 2026-04-24

## A) Root Cause

The `/api/health/ready` `404` was a **parity evidence drift defect**, not an active source-registration defect:

- Source registration chain was correct (`ready.ts` route, `health/index.ts` side-effect import, host entrypoint imports).
- The closure evidence that recorded `404` came from a stale/unfinished deployment window and stale parity artifacts.
- Existing package/parity gates were not explicit enough about **health-ready composition** and **readiness auth behavior**, allowing this seam to be misread during rollout proof.

## B) Files Changed

- `scripts/package-functions-artifact.ts`
  - Added explicit health-route artifact assertions:
    - `functions/health/index.js` and `functions/health/ready.js` must exist in active runtime root.
    - active entrypoint must import `functions/health/index.js`.
    - `health/index.js` must side-effect import `./ready.js`.
  - Added `healthRouteReleaseProof` to `artifact-inventory.json`.
- `scripts/package-functions-artifact.test.ts`
  - Added behavior tests for health-route artifact proof function (pass/fail cases).
- `scripts/verify-functions-live-parity.ts`
  - Added readiness auth proof model:
    - no-auth readiness status must be `200|401|403` (never `404`),
    - malformed bearer readiness status must be `401`,
    - optional `--admin-token` probe must return `200` and readiness contract keys.
  - Added `/api/health` minimal public contract guard (no readiness-only fields).
  - Added additive evidence blocks: `readinessAuthTruth`, `healthPublicContract`.
- `scripts/verify-functions-live-parity.test.ts`
  - Extended tests for malformed bearer behavior and admin readiness contract enforcement.
- `backend/functions/src/test/release-gates.test.ts`
  - Added release-gate assertions for new health-route artifact proof hook in packaging script.
- `backend/functions/README.md`
  - Updated post-deploy parity proof contract to include readiness auth + health public contract checks.
- `docs/reference/developer/verification-commands.md`
  - Updated canonical parity command to include `--admin-token`.
  - Added interpretation rows for readiness auth statuses and health public contract drift.

## C) Build / Package / Deploy Actions

Executed:

- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test -- src/test/release-gates.test.ts`
- `pnpm exec vitest run --config scripts/vitest.config.ts scripts/verify-functions-live-parity.test.ts scripts/package-functions-artifact.test.ts`

Packaging proof commands:

- `pnpm exec tsx scripts/package-functions-artifact.ts --staging /tmp/functions-deploy-healthready-proof --output /tmp/functions-artifact-healthready-proof.zip`
  - failed due pre-existing unrelated workspace build failure (`@hbc/ui-kit` TypeScript error).
- `pnpm --filter @hbc/functions build`
- `pnpm exec tsx scripts/package-functions-artifact.ts --skip-build --staging /tmp/functions-deploy-healthready-proof --output /tmp/functions-artifact-healthready-proof.zip`
  - succeeded with full new artifact assertions active.

Live parity proof command:

- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name hb-intel-function-app --resource-group hb-intel --expected-sha <live_sha> --expected-version <live_version> --admin-token "$API_TOKEN" --output /tmp/safety-e2e-evidence/healthready-parity/live-parity-evidence.json`
  - `overallPass: true`.

## D) Live Proof Table

| Route | Auth condition | Expected | Actual | Proof artifact |
|---|---|---|---|---|
| `/api/health` | no auth | `200`, minimal public payload only | `200` | `/tmp/safety-e2e-evidence/healthready-parity/health.headers`, `/tmp/safety-e2e-evidence/healthready-parity/health.body.json` |
| `/api/health/ready` | no auth | non-`404`; protected denial acceptable (`401/403`) | `401` | `/tmp/safety-e2e-evidence/healthready-parity/ready-noauth.headers`, `/tmp/safety-e2e-evidence/healthready-parity/ready-noauth.body.json` |
| `/api/health/ready` | malformed bearer | `401` auth denial | `401` | `/tmp/safety-e2e-evidence/healthready-parity/ready-malformed.headers`, `/tmp/safety-e2e-evidence/healthready-parity/ready-malformed.body.json` |
| `/api/health/ready` | valid admin bearer | `200` + readiness contract payload | `200` | `/tmp/safety-e2e-evidence/healthready-parity/ready-admin.headers`, `/tmp/safety-e2e-evidence/healthready-parity/ready-admin.body.json` |
| `/api/health/ready` | valid non-admin bearer | `403` (if tested) | not executed (token unavailable in this run) | n/a |

Verifier contract evidence:
- `/tmp/safety-e2e-evidence/healthready-parity/live-parity-evidence.json`
  - `healthReadyTruth.exists=true`
  - `readinessAuthTruth.noAuth.status=401`
  - `readinessAuthTruth.malformedBearer.status=401`
  - `readinessAuthTruth.adminBearer.status=200`
  - `healthPublicContract.passed=true`
  - `overallPass=true`

## E) Artifact Proof

Staged artifact proof (post-hardening):

- `artifact-inventory.json` includes:
  - `healthRouteReleaseProof.activeEntrypoint`
  - `healthRouteReleaseProof.healthIndexModule`
  - `healthRouteReleaseProof.healthReadyModule`
  - required import chain declarations.
- Staged runtime tree confirms:
  - `/tmp/functions-deploy-healthready-proof/dist/backend/functions/src/functions/health/ready.js` exists.
  - `/tmp/functions-deploy-healthready-proof/dist/backend/functions/src/functions/health/index.js` contains `import './ready.js';`
  - `/tmp/functions-deploy-healthready-proof/dist/backend/functions/src/index.js` imports `./functions/health/index.js`.

## F) Regression Prevention

This exact defect now fails loudly via two independent seams:

1. **Packaging seam (build-time):**
   - `assertHealthRouteReleaseProof(...)` fails packaging when readiness module/import chain is missing.
2. **Live parity seam (post-deploy):**
   - `verify-functions-live-parity.ts` now enforces readiness auth semantics + health public contract and emits explicit drift diagnostics.

## G) Residual Gaps

1. Full no-skip packaging run remains blocked by pre-existing unrelated `@hbc/ui-kit` build failure.
2. Non-admin bearer readiness probe was not executed in this closure run (no non-admin token supplied); admin/no-auth/malformed checks were executed and passed.
