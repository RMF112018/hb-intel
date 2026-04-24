# Prompt 02 — Legacy SharePoint Adapter Seam Cleanup

## Objective

Remove or quarantine obsolete direct SharePoint REST ingestion/commit code that no longer matches the backend’s graph-native ingestion authority.

## Governing authorities

- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`

## Current gap

The shared SharePoint repository still contains direct REST commit helpers and legacy adapter concepts even though production ingestion is backend graph-only.

## Required implementation outcome

- Identify which direct REST ingestion helpers are unreachable.
- Remove them if safe, or move them behind test-only seams with explicit names.
- Split read-side SharePoint list access from backend command access if that improves ownership.
- Add tests preventing preview/ingest/replay from bypassing `SafetyBackendCommandClient`.
- Preserve legitimate SharePoint REST read-side operations unless intentionally migrated.

## Proof of closure

- Dead-code removal evidence or explicit quarantine explanation.
- Tests proving backend command client remains the only production ingestion command path.
- No behavior regression in reporting periods, inspections, review queue, or project picker.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
