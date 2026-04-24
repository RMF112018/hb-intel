# Safety App Implementation Map

Date: 2026-04-24

## Frontend app identity and package

- Safety app package: `apps/safety`, package name `@hbc/spfx-safety`.
- Shared feature package: `packages/features/safety`, imported as `@hbc/features-safety`.
- Frontend stack: Vite, React 18, TanStack Query/Router, HBC UI kit, SPFx context bridge.
- SPFx webpart: `apps/safety/src/webparts/safety/SafetyWebPart.tsx`.
- Manifest authority:
  - ID: `ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`
  - Version: `1.2.35.0`

## Bootstrap and runtime

1. SharePoint loads the SPFx webpart.
2. `SafetyWebPart.render()` passes `functionAppUrl`, `apiAudience`, `acceptedBackendOrigin`, expected manifest ID, expected package version, and expected hosted GUID overlay fingerprint.
3. `mount()` binds hosted Safety GUID overlay, bootstraps SPFx auth, resolves runtime contract, and publishes `window.__hbIntel_safetyRuntimeBindingProof`.
4. `App` blocks SharePoint-hosted initialization if runtime contract or SPFx HTTP client is incomplete.

## Runtime contract

`resolveSafetyRuntimeContract()` governs:

- host mode: `sharepoint` or `mock`;
- host source: `safety-webpart`, `shell-webpart`, or `local-dev`;
- backend base URL presence/validity;
- API audience presence;
- backend origin match;
- manifest ID match;
- package version match;
- hosted GUID overlay fingerprint match;
- required hosted list GUID bindings.

Blocking SharePoint mode is a good production pattern. The weak point is that current `acceptedBackendOrigin` is derived from the same property-pane `functionAppUrl`, so it is not a truly independent allowlist.

## HTTP and auth wiring

The command client is `SafetyBackendCommandClient`.

It owns:

- `POST /api/safety-records/ingest/preview`
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/replay`
- JSON serialization
- `Authorization: Bearer <token>`
- `X-Request-Id`
- timeout/abort
- bounded retry for transient HTTP statuses
- backend failure-envelope translation.

Token acquisition is in `App.tsx` through SPFx `aadTokenProviderFactory.getTokenProvider().getToken(apiAudience)`.

## Read-side data access

The shared SharePoint repository still reads Safety lists directly through SharePoint REST using the SPFx HTTP adapter and GUID overlay descriptors. It reads reporting periods, project-week records, inspections, findings, ingestion runs, review queue records, and project/legacy registry references.

This is a mixed data-plane model:

- command/write ingestion path: backend / graph-native;
- read-side app projection: SharePoint REST from the SPFx host.

That can be acceptable if explicit, but it must be governed and verified because it can conceal failures behind different identity and permission paths.

## Upload / preview / commit flow

`UploadPage` implements project selection, inspection number/date intake, reporting period selection, workbook selection, preview mutation, and commit gating.

Commit is allowed only when:

- intake is ready;
- preview says `commitReadiness === true`;
- user confirms;
- last preview signature matches current intake signature;
- preview/commit are not pending.

The app builds a backend request with file name, base64 workbook content, and context including uploaded user, reporting-period ID/SP item ID, selected project metadata, inspection number, and inspection date.

## Review / replay flow

`ReviewQueuePage` reads reviewable ingestion runs and offers replay using `parentRunId`, `supersedePrior`, abort/cancel support, classified replay error messaging, triage summary, and a supporting table.

The backend re-evaluates replay, but the UI does not yet provide a dedicated replay preview/supersede impact confirmation equivalent to upload preview-before-commit.

## Backend route authority

`backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts` registers:

- `POST safety-records/provision-sharepoint`
- `POST safety-records/ingest`
- `POST safety-records/ingest/preview`
- `POST safety-records/replay`
- `GET safety-records/reporting-periods/{reportingPeriodId}/probe`

The app directly wires preview/ingest/replay, but does not expose or client-wrap the provisioning route. That is acceptable if provisioning remains an admin/control-plane task outside the operator Safety surface; it should be documented and verified explicitly.

## Backend application direction

`SafetyIngestionApplicationService` is graph-only for ingestion. It validates targets, reference lists, ingestion contracts, overlay GUIDs, workbook bytes, preview readiness, and graph repository code path before commit/replay.

## Deploy/package seams

- Vite production builds an IIFE `safety-app.js`.
- CSS is injected into JS for hosted runtime.
- SPFx webpart loads the app and calls the mount API.
- Current deploy safety depends on correct package/version, property-pane values, overlay fingerprint, app catalog deployment, and tenant web API permission grants.
