# Provisioning Failure Classification and Run State Model

## Purpose

Documents the failure classification system and provisioning run state model implemented by P7-04. The saga orchestrator now assigns a `failureClass` value on every failure, and the compensation chain includes Step 6 (Entra group) cleanup.

## Failure classification categories

| Class | Meaning | Typical signals | Operator action |
|-------|---------|-----------------|-----------------|
| `transient` | Temporary platform issue that may resolve on retry | 429 (throttle), ECONNRESET, ETIMEDOUT, fetch failed, timeout, 502, 503 | Wait and retry. If persistent, check platform health. |
| `structural` | Configuration or data issue requiring correction | 400 (bad request), 404 (resource not found), validation error, malformed input | Review request data and environment configuration. |
| `permissions` | Missing or revoked permissions | 403 (forbidden), `GraphPermissionNotConfirmedError`, access denied | IT must verify and restore required permissions. See IT-Department-Setup-Guide.md. |
| `repeated` | Same error class recurs on retry | HTTP status code match or error prefix match across runs with retryCount ≥ 1 | Escalate — the underlying issue persists despite retry. |
| `admin-class` | Unclassifiable failure requiring investigation | No pattern matches any category above | Admin must investigate logs and step error details manually. |

## Classification priority

When multiple patterns match, the classifier uses this priority order:

1. **repeated** — checked first; requires retryCount ≥ 1 and similar error pattern
2. **permissions** — 403, `GraphPermissionNotConfirmedError`, access denied
3. **transient** — 429, throttle, timeout, connection errors
4. **structural** — 400, 404, validation errors
5. **admin-class** — fallback

## Run state model

### Overall status values

| Status | Meaning | Terminal | Operator action |
|--------|---------|----------|-----------------|
| `NotStarted` | Run record created, saga not yet executing | No | Wait for launch |
| `InProgress` | Saga is actively executing steps | No | Monitor progress via SignalR or polling |
| `BaseComplete` | Reserved for future phased completion | No | — |
| `WebPartsPending` | Steps 1-4, 6-7 completed; Step 5 deferred to timer | No | Wait for overnight timer; will auto-complete or escalate |
| `Completed` | All steps finished successfully | Yes | No action needed |
| `Failed` | One or more steps failed; compensation ran | Yes | Review `failureClass` and step errors; retry or escalate |

### Step status values

| Status | Meaning |
|--------|---------|
| `NotStarted` | Step has not been attempted |
| `InProgress` | Step is currently executing |
| `Completed` | Step finished successfully |
| `Failed` | Step exhausted retries and failed |
| `Skipped` | Step was skipped (idempotency on retry) |
| `DeferredToTimer` | Step 5 deferred to overnight timer after in-step retry failure |

## Retry semantics

- **In-step retry**: `withRetry()` wraps each step — 3 attempts, exponential backoff (2s/4s/8s). Only transient errors trigger retry; non-transient errors fail immediately.
- **Run-level retry**: `retry(projectId)` creates a new run (new `correlationId`) with idempotency guards. Previously completed steps are skipped.
- **Timer retry**: Step 5 deferral allows up to 3 overnight timer attempts before escalating to Failed.

## Deferral semantics

- **Step 5 deferral**: when Step 5 (Install Web Parts) fails after 2 in-step attempts, the saga sets `step5DeferredToTimer=true` and `overallStatus='WebPartsPending'`, then continues to Steps 6-7.
- **Timer processing**: the overnight timer retries Step 5 up to 3 times.
- **Deferral deadline**: P7-04 adds a 7-day absolute deadline. Jobs deferred longer than 7 days are auto-escalated to Failed with a clear explanation.

## Escalation semantics

- First failure dispatches notification to controller and submitter.
- Subsequent failures (retryCount ≥ 1) dispatch to controller, submitter, and admin.
- `failureClass='repeated'` indicates the issue persists despite retry — operator should escalate beyond the admin console.

## Compensation chain

Runs in reverse order when a step fails:

| Step | Compensation |
|------|-------------|
| 7 — Associate Hub Site | Disassociate hub (if completed) |
| 6 — Set Permissions | **P7-04: Delete Entra ID security groups** (leaders, team, viewers) |
| 4 — Create Data Lists | No-op (cascaded by site deletion) |
| 3 — Upload Template Files | No-op (cascaded by site deletion) |
| 2 — Create Document Library | No-op (cascaded by site deletion) |
| 1 — Create Site | Delete SharePoint site |

Step 6 compensation deletes each group individually. Already-deleted groups (404) are handled silently. Individual group deletion failures do not block other groups.

## Implementation location

- Classification: `backend/functions/src/functions/provisioningSaga/classify-failure.ts`
- Step 6 compensation: `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` (`compensateStep6`)
- Graph delete: `backend/functions/src/services/graph-service.ts` (`deleteSecurityGroup`)
- Deferral deadline: `backend/functions/src/functions/timerFullSpec/handler.ts`
- Tests: `__tests__/classify-failure.test.ts`, `__tests__/saga-orchestrator.test.ts`
