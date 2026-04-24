# Prompt-02 — Implement Raw Custody and Checkpoint Layer

## Objective
Add the replayable raw landing and checkpoint layer required for Procore sync reliability inside the existing backend architecture.

## Governing authorities
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/idempotency/with-idempotency.ts`
- `backend/functions/src/utils/withTelemetry.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `docs/how-to/developer/native-integration-backbone-implementation-guide.md`
- Procore package files:
  - `10-SharePoint-HB-Intel-Integration-Recommendations.md`
  - `sharepoint_storage_pattern_recommendation.md`
  - `12-Core-vs-Extended-Scope-Recommendation.md`
  - `extraction_priority_matrix.csv`

## Repo seams to inspect
- `backend/functions/src/services/**`
- `backend/functions/src/functions/**`
- existing table-storage / idempotency / telemetry seams
- any existing Blob/object storage helper seams; add new ones if none exist

## Current gap to close
There is no durable raw Procore payload custody, run ledger, page checkpoint model, replay queue, or dead-letter handling.

## Required implementation outcome
1. Add raw payload landing to object storage for Procore extraction runs.
2. Add durable run ledgers and checkpoint records.
3. Add page-level or cursor-level checkpoint support so interrupted syncs can resume safely.
4. Add dead-letter or failed-payload quarantine support.
5. Add replay hooks that can rerun from a stored payload/run boundary.
6. Add structured telemetry for:
   - run started
   - page fetched
   - checkpoint committed
   - run succeeded
   - run failed
   - replay requested
7. Keep this layer backend-only and operator-facing. Do not expose raw payloads to business consumers.

## Proof of closure
Return:
- exact storage entities/containers/tables introduced
- run and checkpoint schemas
- replay entrypoint(s)
- idempotency / duplication-control behavior
- failure-handling and dead-letter behavior
- telemetry events/metrics added

## Guardrails
- Do not shortcut raw custody into SharePoint lists.
- Do not collapse raw custody and canonical tables into one structure.
- Do not expose raw payloads to frontend packages.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
