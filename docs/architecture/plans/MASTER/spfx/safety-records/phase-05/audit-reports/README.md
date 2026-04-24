# Safety App Frontend Audit Package

This package contains a repo-truth audit of the HB Intel Safety frontend surface and its wiring to the Azure Functions backend.

## Included files

- `00-Safety-App-Audit-Summary.md`
- `01-Safety-App-Implementation-Map.md`
- `02-Research-Backed-Assessment.md`
- `03-Frontend-Backend-Wiring-Assessment.md`
- `04-Workbook-And-Preview-UX-Assessment.md`
- `05-Production-Readiness-Gap-Register.md`
- `06-Prioritized-Remediation-Plan.md`
- `07-Recommended-Execution-Waves.md`

## Overall verdict

The Safety app is **not production-ready** as a truthful frontend over the current backend. The biggest blockers are:

1. the frontend/shared package does not use the backend preview route even though the backend is explicitly preview-before-commit,
2. one production entry path appears to mount the app without the backend URL / API audience required for authenticated ingest/replay,
3. the frontend collapses backend-classified failures and discards request correlation/support data,
4. deploy and host-binding seams can ship a visually working Safety surface that is not truthfully wired.


## Repo-truth source references

- `apps/safety/src/main.tsx`
- `apps/safety/src/App.tsx`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/components/SafetyProjectPicker.tsx`
- `apps/safety/src/components/SafetyIngestionOutcome.tsx`
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`
- `apps/safety/src/spfxHttpAdapter.ts`
- `packages/features/safety/src/index.ts`
- `packages/features/safety/src/factory.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/functions/health/index.ts`
- `backend/functions/src/functions/health/ready.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/README.md`

## External guidance references

- Microsoft Learn — Connect to Entra ID-secured APIs in SharePoint Framework solutions
- Microsoft Learn — AadHttpClient class
- Microsoft Learn — Working with the AADTokenProvider
- Microsoft Learn — Consume enterprise APIs secured with Azure AD in SharePoint Framework
- Microsoft Learn — Recommendations for handling transient faults
- Microsoft Learn — Retry pattern / Retry Storm anti-pattern
- MDN — Using the Fetch API / canceling a request
- MDN — ARIA live regions
- MDN — ARIA: status role
- MDN — ARIA: alert role

