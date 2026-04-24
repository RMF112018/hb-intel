# Safety App Audit Summary

Date: 2026-04-24

## Bottom line

The Safety app is **not yet production ready**, but it is materially closer than a generic prototype. The current codebase has several strong production-oriented seams:

- exact backend command routes for preview, ingest, and replay;
- SPFx token acquisition through the SharePoint context;
- preview-before-commit workflow with a signature gate;
- classified backend failure handling and support payloads;
- runtime binding gates that block missing SharePoint/backend configuration;
- backend ingestion architecture that is now graph-only.

The remaining issues are production-readiness gaps around **deployment binding authority, role/scope transparency, validation-contract drift, observability, and structural cleanup of older SharePoint REST ingestion assumptions**.

## Production-readiness decision

Current status: **conditionally promising / not production ready**.

Reason:
- The app appears correctly wired to the current preview/ingest/replay backend routes.
- The upload UX mostly reflects the backend preview-before-commit design.
- However, the app can still be deployed with missing or wrong `functionAppUrl` / `apiAudience`, has free-text tenant-config seams, does not independently prove intended backend origin, has UI/backend validation drift, and does not yet provide full production client telemetry or role-aware gating.

## Highest-priority blockers

1. **Runtime config and deploy binding can still drift.**
   - `functionAppUrl` and `apiAudience` are webpart property-pane strings.
   - The manifest does not ship required defaults.
   - `acceptedBackendOrigin` is derived from the same `functionAppUrl`, so it is not an independent governance check.
   - Hard-coded manifest/version/fingerprint checks help but do not fully prove environment authority.

2. **Auth is functionally wired but not operationally transparent.**
   - SPFx AAD token acquisition exists.
   - Backend route authorization is role-specific.
   - The UI does not present role-based capability differences before a backend denial.

3. **Upload validation is directionally strong but still drifts from backend authority.**
   - UI date validation checks shape only, not real calendar validity.
   - UI inspection number copy/logic allows non-negative values while the parser contract expects positive integers.
   - Reporting-period copy says open period is required, but the UI defaults to the first period and does not enforce open status before preview/commit.

4. **Observability is partial.**
   - `X-Request-Id`, backend request IDs, frontend request IDs, support payloads, and backend telemetry exist.
   - Client-side production telemetry and W3C trace-context propagation are not yet a governed app standard.

5. **Graph-native backend direction is clear, but frontend/shared-package structure still carries legacy SharePoint REST ingestion code.**
   - Backend ingestion is graph-only.
   - Frontend command paths use the backend.
   - The shared SharePoint adapter still includes direct REST commit helpers and legacy ingestion-adapter concepts that should be removed, isolated, or explicitly marked non-production.

## Strengths worth preserving

- `SafetyBackendCommandClient` route construction, abort/timeout posture, retry classification, request-id propagation, and failure-envelope parsing.
- `UploadPage` preview-before-commit pattern using `commitReadiness`, preview confirmation, and intake signature matching.
- `SafetyStatusPanel`, `SupportDetailsPanel`, and `supportTruth.ts` approach to truthful user-facing diagnostics.
- Runtime blocking panel instead of silently rendering a broken SharePoint-hosted app.
- Backend route-side failure envelopes with failure class, preview failure class, request ID, diagnostics, and operation data.
- Parser contract model using governed workbook markers, `ParserMeta`, named ranges, and parser-authority provenance.

## Recommended execution

Use two waves:

- **Wave 01 — production blockers:** route/auth contract authority, deploy/runtime binding governance, upload validation alignment, and truthful support/telemetry.
- **Wave 02 — structural hardening:** replay preview/supersede UX, legacy adapter cleanup, production client telemetry, and release verification / readiness probes.
