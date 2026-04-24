# Prompt 01 Closure Evidence — Reconcile Repo Truth and Build State

## Objective closed

Establish one authoritative Safety repo/build/deploy truth before further implementation.

## Authoritative repo truth

- Branch: `main`
- Commit SHA: `44083a928e4550bca746768f0a7b233dc70a6b74`
- Manifest title: `hb-intel-safety`
- Solution version: `1.2.22.0`

## Required determinations

1. `UploadPage.tsx` direct-submit or preview-first  
   - **Preview-first**. Commit is blocked unless preview is commit-ready and confirmed in `apps/safety/src/pages/UploadPage.tsx`.
2. `useSafetyIngestionPreview` exists and exported  
   - **Yes**. Exists in `packages/features/safety/src/hooks/queries.ts` and exported from `packages/features/safety/src/index.ts`.
3. Typed backend command client exists  
   - **Yes**. `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`.
4. `SafetyWebPart` has `functionAppUrl` and `apiAudience`  
   - **Yes**. `apps/safety/src/webparts/safety/SafetyWebPart.tsx`.
5. Built package includes expected source/runtime  
   - **Yes**. `dist/sppkg/safety-package-truth-proof.json` reports all checks passing (structural, freshness, semantic alignment, live runtime proof).
6. Deployed artifact packaging traceable to same source build  
   - **Partially, now hardened for local source->package truth**. Safety now runs under `freshBuildRequired` and emits `packagingRunId`, source bundle SHA, and package-truth proof. CI deploy-to-tenant remains traceable by workflow run/artifact lineage; commit SHA is not embedded directly in `.sppkg`.

## Source-of-truth drift found and fixed

### Drift

- Prior Safety proof artifact had no freshness chain (`packagingRunId: null`, `sourceBundle: null`) and no Safety package-truth gate.

### Fixes implemented

- Enabled strict fresh-build gate for Safety in `tools/build-spfx-package.ts` (`freshBuildRequired: true`).
- Added Safety `CRITICAL_RUNTIME_PATHS_BY_DOMAIN` and `RUNTIME_MARKERS_BY_DOMAIN` entries.
- Added Safety runtime manifest marker injection in `apps/safety/src/mount.tsx` to satisfy package-truth live linkage checks.
- Rebuilt and repackaged Safety from current checkout.

## Exact files changed

- `tools/build-spfx-package.ts`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/App.tsx`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `apps/safety/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/safety-records/phase-06/wave-01/Prompt-01-Closure-Evidence.md`

## Route/auth/contract behavior proof

- Backend route contract source: `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts` exposes:
  - `POST /api/safety-records/ingest/preview`
  - `POST /api/safety-records/ingest`
  - `POST /api/safety-records/replay`
- Packaged Safety JS contains route strings and runtime bindings:
  - `/api/safety-records/ingest/preview` => `True`
  - `/api/safety-records/ingest` => `True`
  - `/api/safety-records/replay` => `True`
  - `functionAppUrl` => `True`
  - `apiAudience` => `True`
  - `__hbIntel_safety` => `True`
- `dist/sppkg/safety-package-truth-proof.json` confirms:
  - `checks.structuralValidity.pass: true`
  - `checks.freshness.pass: true`
  - `checks.sourcePackageSemanticAlignment.pass: true`
  - `checks.liveRuntimeProof.pass: true`

## UI change proof (test output)

UI-affecting runtime marker addition and compile-path changes were validated through test output:

- `pnpm --filter @hbc/spfx-safety test`
  - `Test Files 33 passed`
  - `Tests 224 passed`
  - Includes `uploadPreviewFlow.test.tsx` coverage for preview-before-commit runway behavior.

## Unit/integration tests run

- `pnpm --filter @hbc/spfx-safety test` -> pass (`224` tests)
- `pnpm --filter @hbc/features-safety test` -> pass (`111` tests, `4` skipped)

## Build/package commands run and results

1. `npx tsx tools/build-spfx-package.ts --domain safety`  
   - Initial run surfaced and required fixing pre-existing TS compile errors in active Safety source seams.
2. Re-ran `npx tsx tools/build-spfx-package.ts --domain safety` after fixes  
   - Passed, emitted:
     - `dist/sppkg/hb-intel-safety.sppkg`
     - `dist/sppkg/safety-shim-proof.json`
     - `dist/sppkg/safety-package-truth-proof.json`
3. Re-ran after version bump to `1.2.22.0`  
   - Passed with package-truth checks green.

## Remaining risk

- `build-spfx-package.ts` runtime smoke logs a non-fatal message that `BACKEND_MODE` is not set; CI/CD should set it explicitly to avoid environment ambiguity.
- `.sppkg` does not natively embed git commit SHA; release traceability still depends on CI workflow run/artifact lineage rather than an internal commit stamp.
