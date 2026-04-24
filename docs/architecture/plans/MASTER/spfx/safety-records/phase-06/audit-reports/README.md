# Safety App Frontend Integration Audit Package

## Purpose

This package documents a fresh, frontend-to-backend integration audit of the HB Intel Safety frontend surface and its wiring to the Azure Functions backend.

The audit does not treat a rendered page, passing UI build, or the existence of backend routes as production readiness. Production readiness is evaluated against truthful route wiring, delegated auth propagation, request/response contract alignment, preview-before-commit UX, governed workbook parsing, observable failures, accessible async state, and release/package integrity.

## Bottom line

The Safety frontend is **not production ready today**.

The backend posture is materially more advanced than the public `main` frontend surface. The current public frontend still behaves like a direct SharePoint/REST upload application:
- it does not inject or validate backend base URL / API audience;
- it does not acquire and attach an Entra access token for the Azure Functions backend;
- it does not call the preview route;
- it does not implement the backend’s preview-before-commit workflow;
- it does not collect the full operator context expected by the current backend;
- it does not surface backend failure classes, request IDs, or readiness gates truthfully.

## Package contents

- `00-Safety-App-Audit-Summary.md`
- `01-Safety-App-Implementation-Map.md`
- `02-Research-Backed-Assessment.md`
- `03-Frontend-Backend-Wiring-Assessment.md`
- `04-Workbook-And-Preview-UX-Assessment.md`
- `05-Production-Readiness-Gap-Register.md`
- `06-Prioritized-Remediation-Plan.md`
- `07-Recommended-Execution-Waves.md`


## Evidence base

Repository evidence was gathered from `RMF112018/hb-intel` on `main`.

A material source-truth conflict was identified:
- public GitHub raw/tree evidence shows the current deployable frontend as an older direct-submit SharePoint/REST-oriented Safety app;
- connected GitHub evidence surfaced later-phase or more advanced backend/frontend candidate files.

That disagreement is itself a production-readiness finding. Until a local checkout proves otherwise, the current public `main` frontend must be treated as the deployable source truth, and any advanced connected-tool content must be treated as unproven drift or candidate work.

Key public-main frontend evidence:
- `apps/safety/src/App.tsx` creates a repository from `spHttpClient`, reads `window.__HB_SAFETY_LIST_GUIDS__`, and does not carry backend base URL, API audience, or backend token acquisition.
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx` exposes only `description` and mounts `<App spfxContext={this.context} />`; it does not inject `functionAppUrl` or `apiAudience`.
- `apps/safety/src/pages/UploadPage.tsx` runs a direct `Submit checklist` flow through `useSafetyIngestion`; it has no project picker, no inspection date/number intake, no preview, no commit confirmation, no request ID, no cancellation, and generic error output.
- `packages/features/safety/src/index.ts` exports the Safety domain/parser/list/REST adapter and `useSafetyIngestion` / `useReplayIngestion`; public raw main did not expose a preview hook or typed backend command client.
- `apps/safety/src/router/routes.ts` routes `/` and `/upload` to `UploadPage`.

Key connected-repo/backend evidence:
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts` registers `/api/safety-records/provision-sharepoint`, `/api/safety-records/ingest`, `/api/safety-records/ingest/preview`, and `/api/safety-records/replay`.
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts` establishes preview-first evaluation, parser authority, reporting-period checks, project resolution, duplicate/supersession checks, and diagnostic summary.
- `packages/features/safety/src/domain/templateContract.ts` and parser files define the governed workbook/parser contract.

External guidance checked:
- Microsoft Learn SPFx guidance for Entra ID-secured APIs, permission requests, and SPFx-provided AAD clients/token providers.
- Microsoft Learn Azure Functions HTTP trigger authorization levels.
- Microsoft Entra guidance that access tokens are opaque to clients and must be validated by the API/resource server.
- React guidance around async Effects, cleanup, and client-side cache/query abstractions.
- TanStack Query cancellation guidance.
- MDN AbortController/fetch cancellation guidance.
- W3C/WAI WCAG 4.1.3 status-message guidance.
- Azure Monitor/Application Insights JavaScript distributed telemetry/correlation guidance.
