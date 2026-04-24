# Research-Backed Production Readiness Assessment

Date: 2026-04-24

## Guidance baseline

The audit was evaluated against these current implementation principles:

- SPFx can call Entra ID-secured enterprise APIs using SPFx-provided authentication helpers and should request/admin-approve required API permissions through the SPFx package model.
- Client-side SPFx code must treat tokens as delegated browser credentials and keep token handling narrow, in-memory, and route-specific.
- React async UI should cancel or ignore stale requests and avoid race conditions.
- File upload workflows should validate extension, content type, size, filename, content, storage path, and permissions, while treating client-side validation as advisory.
- Dynamic async status/error messages should use appropriate `status` and `alert` live-region semantics.
- Production observability should correlate frontend commands to backend requests through stable request IDs and preferably W3C trace context.

## Strengths to preserve

### 1. SPFx-hosted token acquisition seam

The current app uses SPFx `aadTokenProviderFactory` to acquire an API token for the configured API audience. This is aligned with SPFx patterns for Entra ID-secured APIs and keeps backend command auth centralized in one seam.

Preserve one token acquisition seam, token use only for backend commands, and explicit failure if provider/audience is missing. Improve by proving the required delegated scope and roles are configured in package/deploy evidence and adding role-aware UI capability states.

### 2. Async cancellation and stale-state protection

The upload and replay pages use AbortController and cleanup effects. The upload page also invalidates stale preview authority by matching the last preview signature to the current intake signature.

Preserve AbortController usage, preview signature gate, explicit cancel controls, and React Query mutation boundaries. Add tests for aborted preview/commit not producing stale success/error UI.

### 3. Accessible async failure foundations

`SafetyFileInput` exposes a labeled visible button, described-by content, error messaging, and current selection text. Upload/replay pages include `role="status"` and `role="alert"` live regions.

Preserve the dedicated file input primitive and live-region model. Validate keyboard/screen-reader behavior across the full upload and replay card flows.

### 4. Failure classification and supportability

`supportTruth.ts` is a strong improvement over collapsed messaging. It separates config, auth, route-not-found, validation-contract, template incompatibility, parser authority, reporting-period mismatch, project unresolved, duplicate/supersession risk, commit, replay, and read-side list failures.

Preserve the support detail allowlist, request IDs, and suggested actions. Add production client telemetry events with the same failure class taxonomy.

## Directionally usable but insufficient

### Runtime contract

The contract blocks SharePoint-hosted initialization when required binding data is missing. However, `functionAppUrl` and `apiAudience` are free-text webpart properties, `acceptedBackendOrigin` is derived from `functionAppUrl`, the manifest has no required defaults, and hardcoded version values can drift.

### File validation

The UI validates extension, optional MIME type, and size. That is useful but incomplete because browser MIME can be blank or inaccurate and extension checks do not prove workbook content. Backend parse/validation remains the real authority.

### Preview-before-commit UX

The upload page largely implements target posture. Remaining gaps: date validation is only regex shape, inspection number copy/logic must align to positive integer parser semantics, reporting-period status rules need explicit enforcement, and preview warnings/blockers need clearer operator-facing resolution per failure class.

## Structurally weak or production-blocking

### 1. Deploy binding authority

A production SharePoint-hosted app must not depend on manually edited property-pane strings for critical API authority without independent deploy verification and fail-closed environment binding.

### 2. Permission matrix visibility

The backend has a precise Safety route role matrix. The frontend currently depends on backend denial rather than presenting a capability-aware operator experience.

### 3. Legacy adapter surface

The shared SharePoint repository still contains direct REST commit/persist helpers that no longer match graph-native backend command authority. Even if unreachable, they are structural risk because they invite future reuse and confuse ownership.

### 4. Observability gap

Request IDs exist, but production client telemetry and distributed trace correlation are not governed enough for an operator-supportable app.

### 5. Admin provisioning separation

The backend provisioning route exists and is admin-gated. The Safety app does not call it. That is acceptable only if the route is intentionally excluded from operator UI and owned by a separate admin/provisioning workflow.
