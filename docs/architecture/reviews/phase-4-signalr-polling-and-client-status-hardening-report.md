# Phase 4 — SignalR, Polling, and Client Status Hardening Report

> **Prompt:** P4-03 | **Date:** 2026-04-01 | **Type:** Enhancement-layer hardening

## Authoritative Status Precedence

### Which consumer treats API status as baseline

**ProvisioningProgressView** (`apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`) uses `useProvisioningStatus()` (API polling via TanStack Query) as the authoritative baseline. The step checklist and project metadata always render from `apiStatus`. The provisioning store's `setProvisioningStatus()` performs wholesale replacement from the API endpoint.

### What real-time data is allowed to override

SignalR events (`handleProgressEvent`) may update:
- `overallStatus` — the latestEvent's overallStatus is displayed as an overlay when it is newer than the last API fetch
- Individual step `status`, `completedAt`, and `errorMessage` — incremental merge into the store's status
- Request-level `state` propagation — terminal events update the request list for immediate UI feedback

### What real-time data is NOT allowed to override

SignalR events must NOT:
- Replace the full `IProvisioningStatus` record (only `setProvisioningStatus` from API can do this)
- Override the correlation identity — the stale-event guard drops events whose `correlationId` doesn't match the known status
- Override project metadata (projectNumber, projectName, triggeredBy, etc.) once set by an API fetch

### How terminal states affect connection and refresh behavior

When a terminal state (Completed/Failed) is detected:
1. **SignalR connection stops** — `enabled: false` is passed to `useProvisioningSignalR`, triggering cleanup. No further reconnect attempts.
2. **API polling stops** — `enabled: false` is passed to `useProvisioningStatus`, disabling `refetchInterval`.
3. **Backend group cleanup** — the saga calls `closeGroup(projectId)` on completion/failure, removing all members from the per-project SignalR group.

## Changes Made

### Store: correlationId stale-event guard (`packages/provisioning/src/store.ts`)

Added a guard in `handleProgressEvent` that drops SignalR events whose `correlationId` doesn't match the existing status's `correlationId`. This prevents stale events from a previous run corrupting the store after a retry.

**Behavior:**
- If no status exists for the projectId, a skeleton is created with the event's `correlationId` — the event is accepted.
- If a status exists and `correlationId` matches — the event is accepted (normal flow).
- If a status exists and `correlationId` differs — the event is dropped. The next API poll will bring the authoritative status with the new run's `correlationId`.

### ProvisioningProgressView: terminal-state shutdown (`apps/pwa/...`)

- Reads stored status before hook initialization to detect `isKnownTerminal`.
- Passes `enabled: !isKnownTerminal` to both `useProvisioningSignalR` and `useProvisioningStatus`.
- On first terminal state detection, the SignalR connection is cleaned up and polling stops.

### JSDoc hardening

Added P4-03 JSDoc explaining the authoritative status precedence pattern to:
- `useProvisioningStore` — documents wholesale vs incremental merge rules
- `useProvisioningSignalR` — documents enhancement-layer role, terminal-state handling
- `ProvisioningProgressView` — documents what API vs SignalR controls
- `signalrNegotiate` endpoint — documents enhancement-layer role
- `RealSignalRPushService` — documents best-effort push semantics

## Verification Evidence

### SignalR negotiate path
- `backend/functions/src/functions/signalr/index.ts` — POST /api/provisioning-negotiate with Bearer auth, projectId query param, per-project + admin group assignment. Unchanged and correct.

### SignalR connected path
- `useProvisioningSignalR` establishes connection via HubConnectionBuilder with automatic reconnect `[0, 2000, 5000, 10000, 30000, 60000]` ms backoff. Events dispatched to store via `handleProgressEvent`. Connection flag managed via `setSignalRConnected`.

### Fallback polling path
- `useProvisioningStatus` polls `GET /api/provisioning-status/{projectId}` every 10 seconds via TanStack Query with 30-second stale time. Wholesale replacement via `setProvisioningStatus`.

### Reconnect behavior
- SignalR SDK automatic reconnect with backoff up to 60s. Token refreshed per reconnect via `accessTokenFactory`. Connection flag set to false during reconnecting, true on reconnected.

### Stale-event handling (P4-03 new)
- Store `handleProgressEvent` now guards against correlationId mismatch. Events from a different run than the known status are dropped. Skeleton creation uses the event's correlationId, so initial events are always accepted. API wholesale replacement updates the correlationId for run transitions.

### Terminal-state handling (P4-03 hardened)
- ProvisioningProgressView disables SignalR (`enabled: false`) and stops API polling on terminal state.
- Backend saga calls `closeGroup(projectId)` on completion/failure, removing per-project group members.
- Store terminal propagation updates request list state for immediate UI feedback.

### Requester/PWA direct-client compatibility
- ProvisioningProgressView confirmed as read-only requester surface — no mutations.
- API status is authoritative baseline; SignalR latestEvent overlays overallStatus only.
- Terminal banners render from merged overallStatus.

### Preserved authoritative status precedence
- `setProvisioningStatus` (API) = wholesale replacement = authoritative.
- `handleProgressEvent` (SignalR) = incremental merge = enhancement only.
- correlationId guard prevents stale-run events from corrupting authoritative data.
- Terminal state stops both SignalR and polling — final status locked in store.

## Residual Risks

### 1. Brief window on retry where first SignalR event may be dropped
After a retry, the first SignalR event from the new run has a different correlationId than the store's current status. The stale-event guard drops it. The API poll (within 10 seconds) brings the authoritative status with the new correlationId, and subsequent events match. Acceptable given the "API is authoritative" pattern.

### 2. SignalR push has no retry logic
`callManagementApi` in the push service throws on failure with no retry. Push failures are non-blocking to the saga, and clients have polling fallback. Acceptable for current scale.

### 3. Admin oversight page not hardened in this prompt
`ProvisioningOversightPage` in the admin app uses `listProvisioningRuns()` directly (no SignalR, no polling). It is not affected by the SignalR/polling hardening in this prompt. Compatibility verified — no changes needed.
