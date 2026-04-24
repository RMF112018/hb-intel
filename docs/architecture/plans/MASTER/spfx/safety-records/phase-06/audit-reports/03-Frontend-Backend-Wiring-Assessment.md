# 03 — Frontend / Backend Wiring Assessment

## Phase 4 — Frontend/backend wiring deep dive

## Current backend route surface

| Route | Method | Required caller posture | Intended frontend use |
|---|---:|---|---|
| `/api/safety-records/provision-sharepoint` | POST | Delegated scope + admin | Admin/control-plane only |
| `/api/safety-records/ingest/preview` | POST | Delegated scope | Required before commit |
| `/api/safety-records/ingest` | POST | Delegated scope | Commit after passing preview |
| `/api/safety-records/replay` | POST | Delegated scope | Review/retry/supersede flow |

## Public-main frontend route usage

Public-main UploadPage does not call backend command routes directly. It calls `useSafetyIngestion()` from the shared package, and public-main App configures only a SharePoint repository via `spHttpClient`.

There is no public-main evidence that:
- `/api/safety-records/ingest/preview` is called;
- `/api/safety-records/ingest` is called by backend command client;
- `/api/safety-records/replay` is called by backend command client;
- `X-Request-Id` is sent;
- `Authorization: Bearer` is sent;
- backend failure envelopes are parsed.

## Request/response alignment

### Backend request requirement

Preview/ingest require:
- `fileName`;
- `fileContentBase64`;
- `context.uploadedByUpn`;
- `context.uploadedAt`;
- `context.reportingPeriodId`;
- normalized `reportingPeriodSpItemId`;
- operator/project context fields where available;
- `inspectionNumber`;
- `inspectionDate`.

### Public-main frontend payload

Public-main UploadPage sends context only with:
- `uploadedByUpn`;
- `uploadedAt`;
- `fileName`;
- `reportingPeriodId`;
- `reportingPeriodSpItemId`.

Missing:
- project number;
- project selection source;
- project snapshots;
- project lookup/legacy IDs;
- inspection number;
- inspection date;
- preview command options;
- request ID;
- abort signal / timeout.

## Token/auth propagation

Backend expectation:
- delegated scope for preview/ingest/replay;
- delegated scope + admin for provisioning.

Public-main frontend:
- does not acquire an API token;
- does not attach `Authorization`;
- bootstraps SPFx auth but does not use it for backend commands.

Verdict: auth propagation is not correct.

## Preview/commit/replay alignment

Preview: missing.

Commit: direct-submit only; not gated by backend preview.

Replay: public package exports `useReplayIngestion`, but public-main evidence does not prove it is wired to the current backend replay route or typed replay contract.

Provisioning: should remain admin-only, not normal upload UX.

## Backend error/detail handling

Backend 422 envelopes include:
- `message`;
- `code`;
- `requestId`;
- `failureClass`;
- `previewFailureClass`;
- `graphContext`;
- `data`.

Public-main UI surfaces generic failure text and cannot display those backend details because it does not call/parse the backend command envelope.

## Obsolete seam analysis

The public-main frontend still reflects the old model:
- SharePoint REST adapter as primary data plane;
- direct workbook submit;
- browser-side list GUID overlay;
- no graph-native command client;
- no preview-before-commit UX.

This conflicts with the backend direction, which is Graph-oriented and command-route mediated.

## Wiring verdict

The Safety frontend is not truthfully wired to the current backend in public `main`.
