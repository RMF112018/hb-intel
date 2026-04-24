# Prompt 03 — Route Authorization and Live Write Proof Closure

Date: 2026-04-24

## Decision
Implemented strict Safety route authorization policy in backend code and added behavior-first test and release-gate coverage. Captured live write-proof evidence with request correlation and SharePoint list deltas.

## Final Allowed Caller Classes

### Delegated tokens
- `preview`: `HBIntelSafetySubmitter`, `HBIntelSafetyOperator`, `HBIntelSafetyReviewer`, `HBIntelSafetyAdmin`, `HBIntelAdmin`, `Admin`, `BreakGlass`
- `ingest`: `HBIntelSafetySubmitter`, `HBIntelSafetyOperator`, `HBIntelSafetyAdmin`, `HBIntelAdmin`, `Admin`, `BreakGlass`
- `replay`: `HBIntelSafetyOperator`, `HBIntelSafetyReviewer`, `HBIntelSafetyAdmin`, `HBIntelAdmin`, `Admin`, `BreakGlass`

Delegated callers must pass delegated-scope gate first.

### App-only tokens
- `preview|ingest|replay`: must include workload role `Automation`.

### Unchanged route posture
- `provision-sharepoint` remains delegated-scope + admin-gated.

## Files Changed
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/middleware/authorization.test.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.test.ts`
- `backend/functions/src/test/authz-release-gates.test.ts`
- `backend/functions/src/test/release-gates.test.ts`

## Verification Commands and Results

### Backend typecheck
- `pnpm --filter @hbc/functions check-types`
- Result: pass.

### Middleware/auth tests
- `pnpm --filter @hbc/functions test -- src/middleware/authorization.test.ts src/middleware/workload-authorization.test.ts src/middleware/auth.test.ts`
- Result: pass.

### Route + release-gate tests
- `pnpm --filter @hbc/functions test -- src/functions/adminApi/safety-record-keeping-routes.test.ts src/test/authz-release-gates.test.ts src/test/release-gates.test.ts`
- Result: pass.

## Negative Authorization Evidence

### Automated behavior proof (primary)
Covered by `authorization.test.ts`:
- delegated missing scope -> `403`
- delegated with scope but missing allowed Safety/global role -> `403`
- app-only without `Automation` -> `403`
- route-specific allowed/denied matrix across `preview|ingest|replay`.

### Live route probes (supporting)
Parity evidence file:
- `/tmp/safety-e2e-evidence/prompt04-fix/live-parity-after-authz.json`

Observed supporting negatives:
- no bearer -> `401` on Safety command routes
- malformed bearer -> `401` on Safety command routes

## Deployed Live Write Proof (Graph lane)

### Commands
- `/tmp/safety-e2e-context.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/capture-baseline.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/run-routes.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/capture-after.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/build-summary.sh`

### Request IDs
- preview: `prompt04-fix-preview-1777035080`
- ingest: `prompt04-fix-ingest-1777035080`
- replay: `prompt04-fix-replay-1777035080`
- duplicate preview: `prompt04-fix-preview-dup-1777035080`

### Route status results
- preview: `200`
- ingest: `200`
- replay: `200`
- duplicate preview: `200`

Source: `/tmp/safety-e2e-evidence/prompt04-fix/summary.json`

### Before/after list deltas
- `Safety Ingestion Runs`: `6 -> 8` (delta `+2`)
- `Safety Findings`: `15 -> 31` (delta `+16`)
- `Safety Inspection Events`: `1 -> 2` (delta `+1`)
- `Safety Project Week Records`: `1 -> 1` (delta `0`)

Source: `/tmp/safety-e2e-evidence/prompt04-fix/list-delta-counts.json`

### Created/updated write correlation
`Safety Ingestion Runs` row `id=7` includes committed entity IDs for inspection event/finding batch/project-week linkage; replay produced run `id=8`.

Supporting artifacts:
- `/tmp/safety-e2e-evidence/prompt04-fix/ingest.body.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/replay.body.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/before_Safety_Ingestion_Runs.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/after_Safety_Ingestion_Runs.json`

## Residual Notes
- Live parity verifier currently reports identity mismatch vs local workspace expected identity in `live-parity-after-authz.json`; this report documents route authz + write proof evidence for the deployed runtime that processed this run.
