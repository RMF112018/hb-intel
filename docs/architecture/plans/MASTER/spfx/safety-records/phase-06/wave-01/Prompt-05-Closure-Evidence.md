# Prompt 05 Closure Evidence — Release Proof for Config, Auth, and Backend Readiness

## Objective closed

Prompt 05 is closed as an executable release-proof gate. Safety now has deterministic in-repo checks for backend wiring/auth posture plus explicit hosted-environment proof steps for tenant + delegated-token seams that cannot be fully automated offline.

## Manifest/version

- Manifest title: `hb-intel-safety`
- Solution + feature version: `1.2.27.0`

## Exact files changed

- `scripts/verify-functions-live-parity.ts`
- `scripts/verify-functions-live-parity.test.ts`
- `backend/functions/src/test/verify-functions-live-parity.contract.test.ts` (new)
- `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`
- `backend/functions/src/test/release-gates.test.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/test/infra-readiness.test.ts`
- `apps/safety/src/runtime/healthReadyProof.test.ts`
- `apps/safety/src/test/safetyWebPartBackendBinding.test.ts` (new)
- `docs/reference/developer/verification-commands.md`
- `docs/architecture/plans/MASTER/spfx/safety-records/phase-06/wave-01/Prompt-05-Hosted-Verification-Checklist.md` (new)
- `apps/safety/config/package-solution.json`

## Route/auth/contract behavior proven

### Deterministic repo proofs

- Live parity contract now enforces:
  - unauthenticated preview route must return `401`
  - non-admin delegated token must be denied (`403`) on `/api/safety-records/provision-sharepoint`
  - malformed preview bearer path includes `X-Request-Id`
- Backend smoke suite now includes Safety command checks for:
  - unauthenticated preview `401`
  - delegated non-admin preview/ingest access posture
  - non-admin provisioning denial `403`
  - `X-Request-Id` header presence
- Rollout config validation now fails closed when `CORS_ALLOWED_ORIGINS` does not include the `SHAREPOINT_TENANT_URL` origin.
- Safety hosted token proof seam explicitly verifies delegated token acquisition call path (`getToken(apiAudience)`) and captures request-id from probe response.
- Webpart source seam proof verifies `functionAppUrl` and `apiAudience` are both surfaced and forwarded into mount config.

### Hosted-environment required proofs (explicit, not assumed)

- Added required hosted checklist + commands for:
  - unauthenticated preview `401`
  - delegated non-admin preview/ingest allowed posture
  - non-admin provisioning denied
  - `X-Request-Id` on command responses
  - live parity output artifact capture

## Test output evidence

### Backend release-proof tests

Command:

`pnpm --filter @hbc/functions test -- src/test/release-gates.test.ts src/test/infra-readiness.test.ts src/test/smoke/post-deploy-smoke.test.ts src/test/verify-functions-live-parity.contract.test.ts`

Result: pass (`Test Files 128 passed`, targeted suites green).

### Safety runtime proof tests

Command:

`pnpm --filter @hbc/spfx-safety test -- src/runtime/healthReadyProof.test.ts src/test/safetyWebPartBackendBinding.test.ts src/test/appRuntimeContractGate.test.tsx`

Result: pass (`Test Files 34 passed`, `Tests 231 passed`).

## Build/package command results

Command:

`npx tsx tools/build-spfx-package.ts --domain safety`

Result: pass after manifest bump.

Artifacts:

- `dist/sppkg/hb-intel-safety.sppkg`
- `dist/sppkg/safety-shim-proof.json`
- `dist/sppkg/safety-package-truth-proof.json`

Package output confirms fresh bundle hashing and package-truth verification for Safety upload/command runtime assets.

## UI/output evidence

- No end-user UI behavior was visually redesigned in Prompt 05; closure evidence is test-output based.
- Runtime-gate and token-proof changes are validated through unit/integration smoke output listed above.

## Remaining risk

- Hosted tenant/Entra checks still require real environment execution and evidence capture; they are documented as required in `Prompt-05-Hosted-Verification-Checklist.md` and not treated as implicitly complete.
- Packaging emits a non-blocking warning when `BACKEND_MODE` is unset; CI/CD should set it explicitly.
- Packaging touched `tools/spfx-shell/config/package-solution.json` in working tree; this file is outside Prompt 05 scope and was not used as closure proof.
