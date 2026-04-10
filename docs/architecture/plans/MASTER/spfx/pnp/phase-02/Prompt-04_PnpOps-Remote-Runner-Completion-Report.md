# Prompt-04 Completion Report — Remote Runner Fallback

## Summary
Implemented remote fallback on the existing `@hbc/pnp-runner-local` contract by adding profile-aware auth controls and SPFx runner API key support, without changing endpoint paths or response envelopes.

## Changed files
- `tools/pnp-runner-local/src/types.ts`
- `tools/pnp-runner-local/src/config.ts`
- `tools/pnp-runner-local/src/server.ts`
- `tools/pnp-runner-local/tests/config.test.ts`
- `tools/pnp-runner-local/tests/serverAuth.test.ts`
- `tools/pnp-runner-local/tests/runService.test.ts`
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsRunnerClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.test.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.test.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsExecutionModes.ts`
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/00_README.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-04_PnpOps-Remote-Runner-Setup-Guide.md`

## Local vs remote profile differences
- Local profile (`PNP_RUNNER_ALLOW_NON_LOOPBACK=false`, default):
  - loopback host enforced.
  - API key optional.
- Remote profile (`PNP_RUNNER_ALLOW_NON_LOOPBACK=true`):
  - non-loopback host allowed.
  - `PNP_RUNNER_API_KEY` required at startup.
  - all protected routes require `X-Pnp-Runner-Key`.
  - `/health` remains open for liveness checks.

## Auth model chosen
- Shared secret API key (`X-Pnp-Runner-Key`) for remote fallback.
- Rationale: minimal credible non-Azure safety gate with low operational overhead and no contract breakage.

## Contract compatibility
- Endpoint paths unchanged:
  - `/actions`, `/preflight`, `/runs`, `/runs/{id}`, `/runs/{id}/evidence`, `/runs/{id}/artifacts/{artifactId}/download`
- Envelope shapes unchanged:
  - `/actions` => `{ items }`
  - other JSON routes => `{ data }`
- `/capabilities` now includes additive profile/auth metadata.

## SPFx changes
- Added `runnerApiKey` runtime/config surface for runner-mode requests.
- Runner client now sends `X-Pnp-Runner-Key` when configured.
- Remote mode validation now requires:
  - HTTPS `runnerBaseUrl`
  - non-empty `runnerApiKey`
- Manifest bumped `0.0.6.0` -> `0.0.7.0`.

## Remaining limitations
- API key management/rotation is manual (no centralized secret distribution in Prompt-04 scope).
- Remote host hardening beyond API key + TLS + CORS remains operator responsibility.
- Enterprise IAM/mTLS is intentionally deferred.

## Verification performed
- `pnpm --filter @hbc/pnp-runner-local check-types`
- `pnpm --filter @hbc/pnp-runner-local test`
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts`
