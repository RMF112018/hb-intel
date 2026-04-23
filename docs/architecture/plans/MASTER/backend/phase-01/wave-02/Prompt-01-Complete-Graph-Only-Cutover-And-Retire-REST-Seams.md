# Prompt 01 — Complete Graph-Only Cutover And Retire REST Seams

## Objective
Finish the backend direction of record by removing remaining Safety-ingestion dependence on SharePoint REST data-plane seams and retiring obsolete ingestion-path REST code after the Graph-native repository is proven.

## Governing authorities
- Repo truth in the Wave 01 result.
- Microsoft Graph SharePoint list/listItem/file APIs.
- The audit requirement to eliminate split outbound permission and API models where feasible.

## Files / seams / symbols to inspect
- Graph-native Safety repository from Wave 01
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- any remaining backend ingestion references to REST/PnP list-item operations
- `backend/functions/src/services/sharepoint-service.ts`

## Current gap to close
After Wave 01, the backend may still carry dead or partially-active REST ingestion seams. Those are operational debt and future regression risk.

## Required implementation outcome
1. Remove remaining active REST ingestion-path dependencies.
2. Keep only the minimum non-ingestion SharePoint control-plane code that is still justified.
3. Make the Graph-native repository the only backend ingestion data plane.
4. Update tests and proof artifacts so future regressions are obvious.

## Proof of closure required
- Show there is no active REST list-item path in the Safety ingestion lane.
- Show end-to-end ingest and replay still work.
- Show repo-wide search proof for retired ingestion-path REST seams.

## Hard prohibitions
- Do not remove control-plane code that is still legitimately needed outside ingestion.
- Do not leave hybrid ingestion behavior in place.

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
