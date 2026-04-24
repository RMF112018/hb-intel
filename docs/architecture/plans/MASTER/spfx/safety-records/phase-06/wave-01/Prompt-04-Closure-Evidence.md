# Prompt 04 Closure Evidence — Hooks, Contracts, and Route Proof

## Objective closed

Prompt 04 is now closed with package-root DTO contract exposure, explicit auth/validation classification proofs, and hooks-level mutation contract tests that verify preview/ingest/replay wiring plus cache invalidation behavior.

## Manifest/version

- Manifest title: `hb-intel-safety`
- Solution + feature version: `1.2.25.0`

## Exact files changed

- `packages/features/safety/src/index.ts`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.test.ts`
- `packages/features/safety/src/hooks/queries.test.tsx` (new)
- `apps/safety/src/pages/supportTruth.ts`
- `apps/safety/src/test/supportTruth.test.ts`
- `apps/safety/config/package-solution.json`
- `packages/features/safety/package.json`
- `pnpm-lock.yaml`

## Route/auth/contract proof

### Package-root backend contract export proof

`@hbc/features-safety` now re-exports backend command DTO types from `backendContracts.ts` at package root, including:

- `SafetyBackendIngestionRequest`
- `SafetyBackendReplayRequest`
- `SafetyBackendCommandOptions`
- `SafetyBackendCommandResult`
- `SafetyBackendOperationResult`
- `SafetyBackendPreviewOperationResult`
- `SafetyBackendFailureEnvelope`
- `SafetyBackendSuccessEnvelope`
- `SafetyBackendErrorEnvelope`
- `SafetyBackendDiagnostic`

### Command-client classification proof

`SafetyBackendCommandClient.test.ts` now includes explicit non-retryable classification proof for:

- `403` responses -> `errorKind: 'auth'`, `retryable: false`, `attempts: 1`
- `400` responses -> `errorKind: 'contract'`, `retryable: false`, `attempts: 1`

### App support-seam classification proof

`supportTruth.ts` upload classifier now treats backend `errorKind: 'contract'` as `preview-blocker`, and tests prove:

- `403` is classified as `auth` for both upload and replay seams
- `400` contract/validation failures classify as `preview-blocker`

### Hook mutation proof (preview/ingest/replay)

`queries.test.tsx` proves:

- `useSafetyIngestionPreview` calls `previewWorkbook(file, context, commandOptions)`
- `useSafetyIngestion` calls `ingestWorkbook(file, context, commandOptions)`
- `useReplayIngestion` calls `replayIngestion(parentRunId, { supersedePrior, ...commandOptions })`
- cancellation/request metadata in `commandOptions` (including `signal`) pass through to repository methods
- ingest + replay mutation success paths invalidate `['safety']`

## Test output evidence

### Feature package tests

Command: `pnpm --filter @hbc/features-safety test`

- `Test Files 24 passed`
- `Tests 134 passed`

### Safety app tests

Command: `pnpm --filter @hbc/spfx-safety test`

- `Test Files 33 passed`
- `Tests 229 passed`

## Build/package results

Command: `npx tsx tools/build-spfx-package.ts --domain safety`

Result: pass.

Generated proof artifacts:

- `dist/sppkg/hb-intel-safety.sppkg`
- `dist/sppkg/safety-shim-proof.json`
- `dist/sppkg/safety-package-truth-proof.json`

Build output verifies fresh Vite artifact hashing (`safety-app-d7cf8928.js`), packaged shell/module bindings, and package-truth checks.

## Remaining risk

- Packaging still reports a non-blocking warning when `BACKEND_MODE` is unset; CI/CD should set this explicitly for deterministic runtime mode intent.
- Packaging command also touched `tools/spfx-shell/config/package-solution.json` in the working tree; that change is outside Prompt 04 code/test scope and should be handled per release workflow policy.
