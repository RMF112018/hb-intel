# Safety App Frontend Audit Package

Date: 2026-04-24

This package contains the repo-truth Safety frontend audit and remediation plan requested for the HB Intel Safety Records / Safety app.

## Files

- `00-Safety-App-Audit-Summary.md`
- `01-Safety-App-Implementation-Map.md`
- `02-Research-Backed-Assessment.md`
- `03-Frontend-Backend-Wiring-Assessment.md`
- `04-Workbook-And-Preview-UX-Assessment.md`
- `05-Production-Readiness-Gap-Register.md`
- `06-Prioritized-Remediation-Plan.md`
- `07-Recommended-Execution-Waves.md`

## Primary repo evidence inspected

- `apps/safety/package.json`
- `apps/safety/src/App.tsx`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/runtime/healthReadyProof.ts`
- `apps/safety/src/spfxHttpAdapter.ts`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/pages/supportTruth.ts`
- `apps/safety/src/components/SafetyFileInput.tsx`
- `apps/safety/vite.config.ts`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/adapters/sharepoint/backendContracts.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/functions/health/ready.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`

## External guidance used

- Microsoft Learn guidance for SPFx access to Entra ID-secured APIs, AadHttpClient, AADTokenProvider, and SPFx web API permission requests.
- Microsoft identity platform guidance on delegated scopes and app-role-based API authorization.
- React official guidance for effect cleanup and race-condition avoidance.
- MDN guidance for AbortController and ARIA `alert` / `status` live regions.
- Azure Monitor / Application Insights guidance for W3C trace-context and correlated distributed telemetry.
- OWASP file upload guidance for extension, content-type, file signature, size, storage, and permission controls.

