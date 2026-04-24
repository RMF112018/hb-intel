# Prompt-04 Closure — Prove End-to-End Safety Commit Writes

Date: 2026-04-24

## Decision

- **Prompt-04 is closed for staging/test evidence requirements.**
- The blocking chain was resolved in order:
  - ✅ runtime deploy parity and hosted Safety route truth restored,
  - ✅ `FileLeafRef` ingestion seam removed from the live hot path (drive-item fallback path active),
  - ✅ ingestion commit writes now proven in all four target Safety lists,
  - ⚠ replay endpoint executes, but this sample replay resolved to `unresolved-project` (no supersession mutation in this run).

## What Changed To Unblock Commit

1. **Backend code fix**
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- Removed upload fallback list query by `FileLeafRef` and replaced with drive-item-based fallback resolution.
- Result: ingest no longer depends on non-indexable `FileLeafRef` filter semantics.

2. **Live deployment refresh**
- Rebuilt `@hbc/functions` and repackaged artifact.
- Deployed with source-URL path and confirmed latest deployment completion in ARM deployment records.

3. **Live index contract remediation**
- Applied required live list indexes for the active Safety site/list bindings used by ingestion:
  - `Safety Project Week Records`: `ReportingPeriodId`, `ProjectNumber` => `indexed=true`
  - `Safety Findings`: `ProjectWeekRecordId`, `InspectionEventId` => `indexed=true`
  - `Safety Inspection Events`: `InspectionNumber` => `indexed=true` (reporting period/project columns already indexed)

## Latest Proof Run (Authoritative)

### Route execution
- Preview request ID: `prompt04-fix-preview-1777015270` -> `200`
- Ingest request ID: `prompt04-fix-ingest-1777015270` -> `200`
- Replay request ID: `prompt04-fix-replay-1777015270` -> `200`
- Duplicate preview request ID: `prompt04-fix-preview-dup-1777015270` -> `200`

### Commit status evidence
- Ingest terminal state: `committed`
- Ingest run: `run-5` / SP item `5`
- Committed entities:
  - inspection event: `ie-1` / SP item `1`
  - findings: `fd-1..fd-15` / SP items `1..15`
  - project week record: `pw-1` / SP item `1`

### Replay status evidence
- Replay terminal state: `unresolved-project`
- Replay run: `run-6` / SP item `6`
- Parent run linkage present (`parentRunId=run-5`).
- Replay route availability and execution are proven; supersession mutation was not observed in this sample due unresolved project on replay resolution.

## Before/After List Deltas (Latest Run)

| List | Before | After | Delta | Proof note |
|---|---:|---:|---:|---|
| Safety Ingestion Runs | 4 | 6 | +2 | commit + replay run rows created |
| Safety Inspection Events | 0 | 1 | +1 | inspection event created (`ie-1`) |
| Safety Findings | 0 | 15 | +15 | finding rows created (`fd-1..fd-15`) |
| Safety Project Week Records | 1 | 1 | 0 | existing row updated (ETag/version advanced; `InspectionCount` 0 -> 1, score/risk fields updated) |

## Runtime Identity/Parity Notes

- Live host reports expected `artifact.version` and `artifact.commitSha` for current deployment target.
- Safety route signatures are present and non-404.
- `GET /api/health/ready` remains `404` and still causes parity script `overallPass=false`; this does **not** block Prompt-04 commit-write proof itself but remains a separate parity-gate defect.

## Commands Executed (Final Unblock Sequence)

- `pnpm --filter @hbc/functions build`
- `pnpm exec tsx scripts/package-functions-artifact.ts --skip-build --staging /tmp/functions-deploy-prompt04-fix3 --output /tmp/safety-e2e-evidence/functions-artifact.live.zip`
- `/tmp/safety-e2e-evidence/deploy-src-url-rbac.sh`
- `/tmp/safety-e2e-evidence/poll-deploy-latest.sh`
- `pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name hb-intel-function-app --resource-group hb-intel --output /tmp/safety-e2e-evidence/prompt04-fix/live-parity-after-fix-deploy.json`
- Graph column metadata/patch commands (via `curl` + Graph token) for required indexed fields listed above
- `/tmp/safety-e2e-evidence/prompt04-fix/capture-baseline.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/run-routes.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/capture-after.sh`
- `/tmp/safety-e2e-evidence/prompt04-fix/build-summary.sh`

## Residual Gaps

1. `GET /api/health/ready` route remains missing (`404`) and should be remediated in parity gate scope.
2. Replay supersession behavior was not exercised in this proof sample because replay resolved to `unresolved-project`; separate targeted replay-supersession proof remains advisable.

## Evidence Paths

- `/tmp/safety-e2e-evidence/prompt04-fix/live-parity-after-fix-deploy.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/summary.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/list-delta-counts.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/preview.body.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/ingest.body.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/replay.body.json`
- `/tmp/safety-e2e-evidence/prompt04-fix/preview-duplicate.body.json`
