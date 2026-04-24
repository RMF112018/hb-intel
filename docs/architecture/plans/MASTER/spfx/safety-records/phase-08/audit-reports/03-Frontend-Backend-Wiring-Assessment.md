# Frontend / Backend Wiring Assessment

Date: 2026-04-24

## Route usage

### Correctly wired

The shared command client uses the current backend routes:

- preview: `POST /api/safety-records/ingest/preview`
- commit: `POST /api/safety-records/ingest`
- replay: `POST /api/safety-records/replay`

These match backend route registration.

### Not wired in operator app

- `POST /api/safety-records/provision-sharepoint`

This route is admin-gated and should remain outside ordinary operator upload/replay UX. If the product intent is automatic provisioning when the SPFx app is added to a site, a separate admin/provisioning seam is required. It should not be hidden inside the operator upload page.

## Request shape alignment

Frontend request shape:

```ts
{
  fileName: string;
  fileContentBase64: string;
  context: IngestionUploadContext;
}
```

Backend parser requires `fileName`, `fileContentBase64`, `context.uploadedByUpn`, `uploadedAt`, reporting-period identity and SP item ID, project number/source classification, inspection number, inspection date, and classification-dependent project/legacy item IDs.

The current upload page constructs most of this correctly, including `reportingPeriodSpItemId`, project metadata, inspection number, and inspection date.

## Token and auth propagation

Current behavior:

- SPFx context supplies token provider.
- App requests token for configured `apiAudience`.
- Command client sends `Authorization: Bearer <token>`.
- Backend enforces delegated scope `access_as_user`, role matrix by route/action, and app-only automation path where appropriate.

Gaps:

- UI does not know or present route capability by role.
- Deploy package evidence for `access_as_user` / API permission approval is not proven in the app package seam.
- Token acquisition proof exists only behind a query-param diagnostic path.

## Backend role matrix impact

| Route action | Allowed Safety roles |
|---|---|
| Preview | Submitter, Operator, Reviewer, Admin |
| Ingest | Submitter, Operator, Admin |
| Replay | Operator, Reviewer, Admin |

A reviewer may preview but not ingest. A submitter may ingest but not replay. The UI should reflect those capability boundaries instead of making users discover them only through 403 responses.

## Error/detail handling

Strong:

- Backend returns request IDs and failure classes.
- Command client captures backend and frontend request IDs.
- `supportTruth.ts` maps failures to actionable messages.
- Support payload intentionally allowlists safe diagnostic fields.

Gaps:

- Client-side telemetry is not yet equivalent to backend telemetry.
- W3C trace context is not propagated from browser command to backend.
- Some backend detail is intentionally suppressed, which is good for safety but requires a parallel operator/support logging path.

## Preview / commit / replay alignment

Upload preview/commit is directionally aligned. Commit only follows a commit-ready preview, explicit confirmation, and signature match.

Replay is backend-protected but less explicit than upload. The review queue offers retry/supersede but does not show a dedicated replay preview or supersession impact preview before execution.

## Obsolete seam risk

The backend ingestion path is graph-only. The frontend command path uses the backend. However, the shared SharePoint repository still includes direct REST commit helper code and a legacy ingestion adapter path. That code should be removed, quarantined, or marked test-only to avoid future accidental reintroduction of the old failing model.
