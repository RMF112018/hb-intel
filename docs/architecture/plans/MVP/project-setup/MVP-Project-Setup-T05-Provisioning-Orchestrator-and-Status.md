# MVP-Project-Setup-T05 — Provisioning Orchestrator and Durable Status

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-05, D-06, D-08, D-10 through D-12 + R-01 through R-05, R-08
**Estimated Effort:** 1.2 sprint-weeks
**Depends On:** T02, T03
> **Doc Classification:** Canonical Normative Plan — saga/status task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Harden the provisioning engine so it behaves like a reliable asynchronous workflow: idempotent steps, durable status, SignalR push, polling fallback, bounded retries with `Retry-After` support, max-requester-retry enforcement, and throttling-safe execution.

---

## Required Paths

```text
backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
backend/functions/src/functions/provisioningSaga/steps/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/signalr/*
backend/functions/src/functions/timerFullSpec/*
backend/functions/src/utils/retry.ts
packages/provisioning/src/api-client.ts
packages/provisioning/src/store/*
packages/provisioning/src/hooks/*
packages/models/src/provisioning/*
```

---

## Async Workflow Contract

### Start behavior

- trigger endpoint validates request synchronously (transition guard + uniqueness check from T03)
- immediately creates or updates a durable status record with `runState: 'queued'`
- returns request/run reference quickly — never holds the UI connection open for full provisioning completion
- sets `statusResourceVersion = 1` on creation; increments on every subsequent upsert

### Status behavior

Provide both channels:

- **Live:** SignalR push for real-time step updates per project group
- **Durable:** polling endpoint at `GET /api/provisioning-status/{projectId}` — stable truth independent of SignalR

Status record must always include:
- `runState: ProvisioningRunState` — the new rich run state from T02
- stable step count / `currentStep` / `overallStatus`
- `lastSuccessfulStep` — 0 if no step completed
- `retryEligible: boolean` — derived from `retryPolicy` in the associated request
- `escalationState` — whether ownership has moved to Admin
- `siteUrl` when available (set at end of step 1)
- `statusResourceVersion` — incremented on every upsert
- `statusUpdatedAtIso` — ISO timestamp of last upsert
- `isPollingFallbackRequired: boolean` — true when SignalR is unavailable or client not subscribed

SignalR is an enhancement layer; the status endpoint is the durable truth.

---

## Idempotency Requirements

Each saga step must verify whether its target artifact already exists before create/update operations when feasible.

Examples:

- site already created → skip step 1 with `idempotentSkip: true`
- library already exists → skip step 2
- list already exists → skip step 4
- hub association already present → skip step 7
- permission assignment already present → skip write in step 6
- getting-started page already provisioned → skip content write in step 3

If an artifact already exists in the expected state, the step must record an idempotent skip or successful no-op (`status: 'Completed', idempotentSkip: true`) rather than fail.

---

## Max-Requester-Retry Enforcement (Backend Requirement)

The current `SagaOrchestrator.retry()` method does not enforce the max-1-requester-retry policy. T05 must add this enforcement in the backend:

```ts
// In SagaOrchestrator.retry() — before re-executing:
const request = await services.requests.getRequest(status.requestId);
if (request?.retryPolicy?.requesterRetryUsed) {
  // Second failure: mark escalated, shift ownership to Admin
  request.retryPolicy.secondFailureEscalated = true;
  request.retryPolicy.escalatedAtIso = new Date().toISOString();
  request.currentOwner = 'Admin';
  await services.requests.updateRequest(request);
  throw new Error('Max requester retries reached; escalated to Admin');
}
// Mark first retry as used before executing
request.retryPolicy.requesterRetryUsed = true;
request.retryPolicy.requesterRetryUsedAtIso = new Date().toISOString();
await services.requests.updateRequest(request);
```

This enforcement must be in the backend, not only in the UI. The client must not be trusted to prevent a second retry.

---

## Retry / Backoff Rules

- first failure creates a `retry-available` run state for business retry
- second failure marks the run `escalated-to-admin`; `retryPolicy.secondFailureEscalated = true` on the request
- transient Graph/SharePoint throttling must honor the `Retry-After` response header (see below)
- bounded exponential backoff is required where `Retry-After` headers are absent but the failure is transient
- noncritical heavy work (step 5 web parts) may remain in the deferred timer path
- Admin retry should resume from `lastSuccessfulStep`, not restart completed steps by default

---

## `Retry-After` Header Handling

The existing `withRetry()` utility in `backend/functions/src/utils/retry.ts` uses simple exponential backoff. For Graph/SharePoint throttling responses (HTTP 429 or 503 with `Retry-After`), the retry logic must:

1. Inspect the `Retry-After` response header value (seconds or HTTP-date)
2. Parse and convert to milliseconds
3. Use the header value as the actual delay instead of the calculated backoff
4. Store the backoff deadline in `IProvisioningStatus.throttleBackoffUntilIso` for observability

Either extend `withRetry()` to accept an optional `getRetryDelay(response)` callback, or create a Graph-specific wrapper. Document the approach in `backend/functions/README.md`.

**Note on existing baseline:** The current `withRetry()` parameters (`maxAttempts: 3, baseDelayMs: 2000`) are acceptable as defaults for non-throttled failures at MVP scale. Do not change these defaults — only add `Retry-After` detection on top.

---

## Throttling and Concurrency Rules

- bound concurrency for write-heavy operations (permission assignments, list creation)
- avoid request spikes against SharePoint / Graph
- prefer Microsoft Graph for operations where equivalent behavior exists and is supported (R-04)
- isolate deferred/noncritical page/web-part work (step 5) from the immediate base-site success path
- decorate all traffic with correlation IDs (`correlationId` from `IProvisionSiteRequest`) for supportability

---

## SignalR / Poll Fallback Rules

- per-project SignalR groups remain the real-time scope model
- admin group receives all project events
- negotiate tokens are short-lived and must be re-negotiated on reconnect
- polling fallback must continue to work when SignalR fails, is blocked, or has stale group membership
- terminal states (`Completed`, `Failed`, `WebPartsPending` base complete) close live subscriptions cleanly
- `isPollingFallbackRequired` flag must be set when the client detects SignalR is unavailable

---

## Verification Commands

```bash
pnpm --filter @hbc/functions test -- provisioningSaga
pnpm --filter @hbc/functions test -- signalr
pnpm --filter @hbc/provisioning test -- api-client
pnpm --filter @hbc/provisioning test -- store

# Confirm max-retry enforcement in saga
rg -n "requesterRetryUsed|secondFailureEscalated|maxRequesterRetries|escalatedToAdmin" backend/functions/src/functions/provisioningSaga/

# Confirm Retry-After header handling
rg -n "Retry-After|retryAfter|throttleBackoff" backend/functions/src/utils/retry.ts backend/functions/src/functions/provisioningSaga/

# Confirm new IProvisioningStatus fields populated
rg -n "runState|lastSuccessfulStep|retryEligible|statusResourceVersion|statusUpdatedAtIso" backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts

# Confirm idempotency guards
rg -n "idempotent|already.exists|idempotentSkip" backend/functions/src/functions/provisioningSaga/steps/

# Confirm polling endpoint exists
rg -n "provisioning-status\|getProvisioningStatus" backend/functions/src/functions/projectRequests/
