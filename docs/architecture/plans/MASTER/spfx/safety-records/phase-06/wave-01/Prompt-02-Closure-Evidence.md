# Prompt 02 Closure Evidence — Runtime Config and SPFx Backend Binding

## Objective closed

Fail-closed Safety runtime contract is now enforced for SharePoint-hosted mode with explicit backend config binding requirements (`functionAppUrl`, `apiAudience`), strict URL validation, blocked-state rendering, and no SharePoint-mode mock fallback. Shell-hosted Safety is explicitly blocked until equivalent guarantees are established.

## Runtime/config truth

- Manifest title: `hb-intel-safety`
- Solution version: `1.2.23.0`
- Safety runtime authority: `apps/safety/src/runtime/safetyRuntimeContract.ts`
- Safety SPFx property source: `apps/safety/src/webparts/safety/SafetyWebPart.tsx` (`functionAppUrl`, `apiAudience`)

## Exact files changed

- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/App.tsx`
- `apps/safety/src/test/safetyRuntimeContract.test.ts`
- `apps/safety/src/test/appRuntimeContractGate.test.tsx`
- `apps/safety/src/test/productionRuntimeContractSource.test.ts`
- `apps/safety/config/package-solution.json`

## Route/auth/contract behavior proof

- Backend route authority remains:
  - `POST /api/safety-records/ingest/preview`
  - `POST /api/safety-records/ingest`
  - `POST /api/safety-records/replay`
  - Source: `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- Runtime contract now carries host source classification and shell-host block:
  - `hostSource: 'safety-webpart' | 'shell-webpart' | 'local-dev'`
  - SharePoint + `shell-webpart` injects blocking reason and forces `canInitializeCommands=false`.
- App runtime now refuses SharePoint mock fallback:
  - SharePoint host requires both `canInitializeCommands=true` and an SPFx HTTP client;
  - otherwise renders blocked state with actionable reasons.
- Mount seam detects shell-hosted config via shell-only `webPartId` config signal and tags host source accordingly.

## UI behavior proof (test output)

`pnpm --filter @hbc/spfx-safety test` passed:
- `Test Files 33 passed`
- `Tests 226 passed`
- Includes new/updated behavior proofs:
  - `safetyRuntimeContract.test.ts` now covers shell-hosted fail-closed contract.
  - `appRuntimeContractGate.test.tsx` now covers blocked state when SharePoint client is unavailable even with valid runtime config.
  - `productionRuntimeContractSource.test.ts` validates mount runtime-contract source path.

## Unit/integration tests added or updated

- Updated: `apps/safety/src/test/safetyRuntimeContract.test.ts`
- Updated: `apps/safety/src/test/appRuntimeContractGate.test.tsx`
- Updated: `apps/safety/src/test/productionRuntimeContractSource.test.ts`

## Build/package commands and results

1. `pnpm --filter @hbc/spfx-safety test` -> pass (`226` tests)
2. `pnpm --filter @hbc/features-safety test` -> pass (`111` tests, `4` skipped)
3. `npx tsx tools/build-spfx-package.ts --domain safety` -> pass
   - emits:
     - `dist/sppkg/hb-intel-safety.sppkg`
     - `dist/sppkg/safety-shim-proof.json`
     - `dist/sppkg/safety-package-truth-proof.json`
   - package-truth checks reported passing for structural validity, freshness, semantic alignment, and live runtime proof.

## CORS and API permission approval release documentation

Operational release posture for Prompt 02 is documented and linked:

- Safety permission posture and rollout gates:
  - `docs/reference/configuration/safety-permission-posture-and-rollout-gates.md`
- Safety ingest triage/recovery and readiness checks:
  - `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md`

Required release approvals/checks before production rollout:

1. **SPFx API permission approval**
   - Ensure the Safety package API permission request for the configured `apiAudience` is approved in SharePoint Admin API access.
   - Validate delegated token acquisition path from SPFx in hosted Safety runtime.
2. **Function App CORS approval**
   - Confirm tenant SharePoint origin is explicitly allowed (no wildcard production posture).
   - Confirm credentialed cross-origin behavior required by hosted flow.
3. **Readiness proof**
   - Validate backend readiness/auth posture via `/api/health/ready` and aligned operational runbook checks.

## Remaining risk

- Shell-hosted Safety path is intentionally blocked for Prompt 02 scope. Enabling it later requires equivalent runtime-config authority, auth posture proof, and documented release controls.
- Build logs continue to warn when `BACKEND_MODE` is not explicitly set in packaging environment; this does not block package creation but remains an operational clarity risk if CI/CD configuration is ambiguous.
