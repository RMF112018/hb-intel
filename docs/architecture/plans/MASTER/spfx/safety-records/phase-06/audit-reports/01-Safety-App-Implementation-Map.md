# 01 — Safety App Implementation Map

## Phase 2 — Current implementation map

## Frontend app surface

### `apps/safety/src/App.tsx`

Public `main` app behavior:
- creates a `QueryClient`;
- creates the TanStack router;
- reads a possible `window.__HB_SAFETY_LIST_GUIDS__` overlay;
- adapts an SPFx-like `spHttpClient`;
- creates `createSafetyInspectionRepository({ mode: 'sharepoint', sharepoint: { client } })` when a SharePoint client exists;
- otherwise creates the mock repository;
- wraps the app in theme, query, error boundary, complexity provider, and repository provider.

Production issue:
- it does not carry backend base URL;
- it does not carry API audience;
- it does not acquire backend tokens;
- it does not create a backend command client;
- it does not fail-loud when backend command config is missing because the public-main implementation does not know it needs backend command config.

## SPFx entrypoint

### `apps/safety/src/webparts/safety/SafetyWebPart.tsx`

Public `main` webpart behavior:
- exposes `description` only;
- bootstraps SPFx auth permissions in `onInit`;
- renders `<App spfxContext={this.context} />`.

Production issue:
- no `functionAppUrl`;
- no `apiAudience`;
- no runtime contract;
- no host-mode verification;
- no route/health proof;
- no explicit backend binding.

## Routes

### `apps/safety/src/router/routes.ts`

Routes include:
- `/` and `/upload` → `UploadPage`;
- `/periods`;
- `/projects/$projectNumber/weeks/$weekStartDate`;
- `/inspections`;
- `/inspections/$inspectionEventId`;
- `/review`;
- `/incidents` redirect.

The routing shell is usable. The problem is that the upload route currently maps to a direct-submit flow that does not match the backend’s current design.

## Upload workflow

### `apps/safety/src/pages/UploadPage.tsx`

Public-main flow:
1. load reporting periods;
2. choose reporting period;
3. choose workbook with hidden file input;
4. click `Submit checklist`;
5. call `useSafetyIngestion`;
6. display an ingestion result banner or generic error.

Production gaps:
- no `Preview checklist` step;
- no preview diagnostics;
- no explicit commit confirmation;
- no project picker;
- no inspection number/date intake;
- no cancellation/timeout controls;
- no request-id propagation;
- no backend failure-class support details;
- no accessibility-grade async live-state model.

## Shared package boundary

### `packages/features/safety/`

Public-main package exports:
- domain types;
- governed parser/template contract;
- scoring;
- list descriptors and GUID overlay;
- SharePoint REST adapter;
- upload/download helpers;
- local ingestion pipeline;
- repository factory;
- query hooks including `useSafetyIngestion` and `useReplayIngestion`.

Public-main package does not appear to expose a production-ready backend command client or preview hook in the public raw `main` export surface.

## Backend route authority

Backend connected-repo evidence shows:
- `POST /api/safety-records/provision-sharepoint`
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/ingest/preview`
- `POST /api/safety-records/replay`

The backend expects JSON command payloads:
- `{ fileName, fileContentBase64, context }` for preview/ingest;
- `{ parentRunId, supersedePrior }` for replay.

It also expects delegated scope for preview/ingest/replay and admin for provisioning.

## Workbook/parser contract

The governed parser contract includes:
- `ParserMeta` sheet support;
- accepted template marker `SafetyChecklist_v1`;
- accepted parser contract `parse-first-2026-04`;
- required ScoreCard/ScoringWeights sheets;
- parser/named-range authority;
- inspection date and number validation;
- reporting-period markers;
- key findings seam.

The frontend must treat the workbook as a governed contract, not as an arbitrary file.
