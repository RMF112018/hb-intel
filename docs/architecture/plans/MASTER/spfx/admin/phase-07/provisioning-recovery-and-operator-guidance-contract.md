# Provisioning Recovery and Operator Guidance Contract

## Purpose

Documents the structured recovery action contracts and operator guidance system implemented by P7-05. Recovery actions now return durable context about why an action is available or blocked, and the backend produces conditional guidance based on failure classification, failed step, and retry history.

## Recovery actions

| Action | Endpoint | Precondition | Response |
|--------|----------|-------------|----------|
| Retry | `POST /api/provisioning-retry/{projectId}` | `overallStatus === 'Failed'` | 202 fire-and-forget; audit trail logged |
| Escalate | `POST /api/provisioning-escalate/{projectId}` | `overallStatus === 'Failed'` | Sets `escalatedBy` + `escalatedAt` annotation |
| Archive | `POST /api/provisioning-archive/{projectId}` | Admin role required | Marks run Completed; reconciles request state |
| Force State | `POST /api/provisioning-force-state/{projectId}` | Admin role required | Overrides `overallStatus` to any valid state |
| Get Guidance | `GET /api/provisioning-recovery-guidance/{projectId}` | Any authenticated user (L2 scope) | Structured `IRecoveryGuidance` payload |

## Recovery guidance contract

### IRecoveryGuidance

| Field | Type | Purpose |
|-------|------|---------|
| `retryAdvisable` | boolean | Whether a retry is likely to resolve the issue |
| `recommendedAction` | RecoveryAction | Primary recommended action |
| `failureSummary` | string | What failed (human-readable, includes step name and truncated error) |
| `likelyCause` | string | What likely blocked the run |
| `nextStep` | string | Specific next step the operator should take |
| `escalationReason` | string or null | When escalation is more appropriate than retry |
| `runbookRef` | string or null | Relevant runbook section reference |

### RecoveryAction values

| Value | When used |
|-------|-----------|
| `retry` | Transient failure with retries remaining, or first-attempt admin-class |
| `escalate` | Repeated failure, transient after max retries, admin-class after first retry |
| `investigate-permissions` | Permissions failure (403, revoked grants) |
| `fix-configuration` | Structural failure (400, 404, validation) |
| `wait-and-retry` | Non-failed run (no action needed) |
| `contact-it` | Reserved for future use |

## Guidance logic by failure class

### Transient
- **retryAdvisable**: true if retryCount < 3
- **recommendedAction**: `retry` or `escalate` (at ceiling)
- **escalationReason**: populated when retry limit reached

### Permissions
- **retryAdvisable**: always false
- **recommendedAction**: `investigate-permissions`
- **Step-aware**: Step 6 failures reference Group.ReadWrite.All specifically; other steps provide general permissions guidance
- **escalationReason**: always populated — retry cannot fix a permissions issue

### Structural
- **retryAdvisable**: always false
- **recommendedAction**: `fix-configuration`
- **Step-aware**: Step 1 references site naming conflicts, Step 7 references hub site configuration
- **escalationReason**: always populated — underlying config must be corrected

### Repeated
- **retryAdvisable**: always false
- **recommendedAction**: `escalate`
- **escalationReason**: includes retry count and persistence indication

### Admin-class
- **retryAdvisable**: true on first attempt only (retryCount === 0)
- **recommendedAction**: `retry` then `escalate`
- **rationale**: one retry rules out transient; subsequent failure requires investigation

## Retry audit trail

P7-05 adds audit logging for retry initiation:

- The `retryProvisioning` endpoint now emits a `ProvisioningRetryInitiated` telemetry event with:
  - `initiatedBy` — UPN of the retry initiator
  - `initiatedByOid` — Entra Object ID
  - `retryCount` — new retry count
  - `previousFailureClass` — failure class of the prior run
  - `previousFailedStep` — step number where the prior run failed
- The saga orchestrator `retry()` method now accepts an optional `retryInitiatedBy` parameter
- The `triggeredBy` field on the new run is set to the retry initiator's UPN for accurate attribution

## Repeated-failure detection

P7-05 closes the P7-04 TODO for carrying forward the previous error:

- On retry, the saga orchestrator captures `previousErrorMessage` from the prior run's failed step
- This is passed via `IProvisionSiteRequest.previousErrorMessage` to the new run
- The `classifyFailure` function uses it to detect repeated failures (same HTTP status code or error prefix across retries)

## Implementation location

- Recovery guidance engine: `backend/functions/src/functions/provisioningSaga/recovery-guidance.ts`
- Guidance endpoint: `GET /api/provisioning-recovery-guidance/{projectId}` in `index.ts`
- Retry audit: `index.ts` `retryProvisioning` handler + `saga-orchestrator.ts` `retry()` method
- Model extension: `packages/models/src/provisioning/IProvisioning.ts` (`previousErrorMessage` on `IProvisionSiteRequest`)
- Tests: `__tests__/recovery-guidance.test.ts`
