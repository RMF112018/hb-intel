# 01 — Safety App Implementation Map

## 1. Frontend footprint under audit

### Primary app surface
- `apps/safety/`

### Shared Safety domain / data / adapter surface
- `packages/features/safety/`

These are both materially relevant and must be treated as one functional application surface.

## 2. Runtime entrypoints

### Local/dev entry
- `apps/safety/src/main.tsx`

Purpose:
- Vite dev entry
- resolves auth mode
- bootstraps mock environment in mock mode
- renders `<App />`

### Direct SPFx webpart entry
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`

Purpose:
- SharePoint-hosted webpart bootstrap
- binds hosted list GUID overlay
- resolves SPFx permissions
- bootstraps SPFx auth
- renders `<App spfxContext={this.context} />`

Risk:
- does not pass backend config (`functionAppUrl`, `apiAudience`) into `App`

### IIFE/shell mount entry
- `apps/safety/src/mount.tsx`

Purpose:
- production library build entry for `safety-app.js`
- exports `window.__hbIntel_safety.mount(...)`
- accepts shell-injected config including `functionAppUrl` and `apiAudience`
- then renders `<App spfxContext={spfxContext} functionAppUrl={...} apiAudience={...} />`

Risk:
- this is a second production runtime path with a different config contract from the direct SPFx webpart path

## 3. App composition

### `apps/safety/src/App.tsx`
Responsibilities:
- create React Query client
- create TanStack Router instance
- choose repository mode
- adapt SPFx SharePoint client
- wire Safety repository provider
- provide theme/error boundary/complexity provider

Repository decision:
- if `adaptSpfxHttpClient(...)` returns a SharePoint client, app creates `createSafetyInspectionRepository({ mode: 'sharepoint', ... })`
- otherwise app falls back to `createSafetyInspectionRepository({ mode: 'mock' })`

Important detail:
- backend ingestion config is optional at the type layer but effectively mandatory for ingest/replay in sharepoint mode

## 4. Shared package boundaries

### Domain / workbook contract
- `domain/templateContract.ts`
- `domain/types.ts`
- `parser/validateTemplate.ts`
- `parser/extractMetadata.ts`
- `parser/parseChecklist.ts`
- `parser/contractWorkbookAccess.ts`

This is the governed workbook contract and parser authority surface.

### Repository interface
- `ports/ISafetyInspectionRepository.ts`

This is the app-facing abstraction for:
- reporting periods
- project weeks
- inspections
- review queue
- ingest
- replay

Important gap:
- there is no preview method in the repository interface

### React Query hooks
- `hooks/queries.ts`

The app uses these hooks for:
- `useReportingPeriods`
- `useSafetyIngestion`
- `useReplayIngestion`
- `useReviewQueue`
- other read-side list/detail queries

Important gap:
- no `useSafetyPreviewIngestion` or equivalent exists

### SharePoint adapter
- `adapters/sharepoint/SharePointSafetyInspectionRepository.ts`

Read-side behavior:
- SharePoint REST for lists and review queue reads

Write-side / ingest behavior:
- backend POST to `/api/safety-records/ingest`
- backend POST to `/api/safety-records/replay`

Important gap:
- no backend preview call
- backend error envelope not preserved

## 5. Upload flow as implemented

### UI entry
- `apps/safety/src/pages/UploadPage.tsx`

Current steps:
1. Project picker
2. Inspection number/date input
3. Reporting period selection
4. Workbook selection
5. Readiness summary
6. Submit
7. “What happens next”
8. Outcome zone

Current behavior:
- direct call to `useSafetyIngestion().mutate(...)`
- request includes file bytes (base64 via adapter) and intake context
- no explicit preview stage
- no preview-confirm-commit handoff
- no preview-specific diagnostics panel

## 6. Review/replay flow as implemented

### Review queue
- `apps/safety/src/pages/ReviewQueuePage.tsx`

Behavior:
- loads queue from read-side SharePoint lists
- offers replay actions via `useReplayIngestion`
- renders triage summary + cards + support table

Strength:
- review queue is materially closer to production quality than upload flow

## 7. Project and reporting-period seams

### Project selection
- `apps/safety/src/components/SafetyProjectPicker.tsx`

Uses:
- shared Project Sites search seam
- merged Projects + Legacy Project Fallback Registry search logic

Strength:
- avoids inventing a second project search implementation

### Reporting periods
- `useReportingPeriods` -> repository read from `Safety Reporting Periods`

Strength:
- blocked state messaging distinguishes config binding errors from data fetch failures

## 8. Auth + HTTP seams

### SharePoint REST
- `apps/safety/src/spfxHttpAdapter.ts`

Behavior:
- adapts SPFx `spHttpClient`
- resolves request digests for SharePoint REST POSTs
- supports SharePoint list/library I/O

### Backend API calls
- bare `fetch(...)` inside `SharePointSafetyInspectionRepository`
- optional bearer token from `aadTokenProviderFactory.getTokenProvider().getToken(apiAudience)`

Gaps:
- no `AadHttpClient`
- no AbortController
- no request timeout strategy
- no request-id propagation
- no structured retry posture
- no standardized backend client abstraction distinct from SharePoint REST adapter responsibilities

## 9. Host/config seams

### Hosted GUID overlay
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`

This hardcodes required list/library GUIDs into the frontend bundle.

### Build/runtime modes
- `apps/safety/vite.config.ts`
  - dev => mock auth / mock adapter
  - prod => sharepoint/spfx posture
  - prod IIFE bundle => `safety-app.js`

Risk:
- a package/build can be valid while still being mounted with incomplete runtime backend config

## 10. Exact frontend-to-backend wiring points

### Used today
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/replay`

### Not used today, despite existing backend contract
- `POST /api/safety-records/ingest/preview`

### Not meaningfully surfaced in frontend UX
- backend readiness surface (`/api/health/ready`)
- backend request-id / failure-class / graph-context details
