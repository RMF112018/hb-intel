# Provisioning Diagnostics and Evidence Guide

## Purpose

Documents the enriched provisioning diagnostics, telemetry events, and structured evidence payload introduced by P7-06. This guide helps operators and developers understand what diagnostic information is available, how to trace provisioning runs, and how to interpret failure evidence.

## Evidence payload

Every provisioning run now captures a structured `IProvisioningEvidence` payload at terminal states (Completed, Failed, WebPartsPending). This is persisted as `evidenceJson` on the durable status record in Azure Table Storage.

### Evidence fields

| Field | Type | Purpose |
|-------|------|---------|
| `schemaVersion` | `1` | Forward-compatibility versioning |
| `sagaDurationMs` | number | Total saga execution time |
| `overallStatus` | string | Terminal status at capture time |
| `failureClass` | string or null | Failure classification (null on success) |
| `failedAtStep` | number or null | Step where failure occurred |
| `retryCount` | number | Accumulated retry count |
| `parentCorrelationId` | string or null | Prior run's correlation ID (null on first run) |
| `steps` | `IStepEvidence[]` | Per-step execution evidence |
| `permissionPosture` | object | Permission model and grant status at saga start |
| `step5Deferred` | boolean | Whether Step 5 was deferred to timer |
| `department` | string or null | Project department |
| `capturedAt` | string | ISO 8601 timestamp of evidence capture |

### Per-step evidence

Each step includes:

| Field | Type | Purpose |
|-------|------|---------|
| `stepNumber` | number | Step identifier (1-7) |
| `stepName` | string | Human-readable step name |
| `status` | string | Step terminal status |
| `durationMs` | number or null | Step execution duration |
| `errorMessage` | string or null | Error message on failure |
| `attemptCount` | number | Number of retry attempts (1 = first try succeeded) |
| `metadata` | object or null | Step-specific diagnostic data |

## Correlation rules

### Correlation ID chain

Every provisioning run has a unique `correlationId` (UUID v4). On retry, a new `correlationId` is generated and the previous run's ID is preserved as `parentCorrelationId`.

```
First run:    correlationId = "abc-123", parentCorrelationId = null
Retry 1:      correlationId = "def-456", parentCorrelationId = "abc-123"
Retry 2:      correlationId = "ghi-789", parentCorrelationId = "def-456"
```

### Telemetry correlation

All telemetry events include `correlationId` and `projectId`. On retry runs, `ProvisioningSagaStarted` now includes:
- `parentCorrelationId` — links to the prior run
- `isRetry` — boolean indicating this is a retry
- `previousErrorMessage` — truncated error from the prior failure (for context)

## Telemetry event catalog

### Saga lifecycle events

| Event | When emitted | Key properties |
|-------|-------------|----------------|
| `ProvisioningPrelaunchValidation` | Before saga start | outcome, failureCount |
| `ProvisioningSagaStarted` | Saga initialization | permissionModel, parentCorrelationId, isRetry, previousErrorMessage |
| `ProvisioningPermissionModel` | After permission diagnostic | model, grantConfirmed, summary |
| `ProvisioningSagaCompleted` | Successful completion | totalDurationMs, step5Deferred |
| `ProvisioningSagaFailed` | Failure after compensation | failedAtStep, failureClass, errorMessage |
| `ProvisioningFailureClassified` | During compensation | failureClass, errorMessage |

### Step lifecycle events

| Event | When emitted | Key properties |
|-------|-------------|----------------|
| `ProvisioningStepCompleted` | Step success | stepNumber, stepName, durationMs, idempotentSkip |
| `ProvisioningStepFailed` | Step failure after retries | stepNumber, stepName, errorMessage, attempt (actual count), durationMs |
| `ProvisioningStep5Deferred` | Step 5 deferred to timer | reason |
| `SiteCreated.GrantRequired` | Step 1 + Sites.Selected | siteUrl, grantMethod, operatorAction |

### Recovery events

| Event | When emitted | Key properties |
|-------|-------------|----------------|
| `ProvisioningRetryInitiated` | Admin/coordinator retry | initiatedBy, initiatedByOid, retryCount, previousFailureClass |
| `ProvisioningDeferralDeadlineExceeded` | Timer deadline hit | deferralAgeMs, startedAt |

### Metrics

| Metric | Value | Dimensions |
|--------|-------|-----------|
| `ProvisioningStepDurationMs` | milliseconds | stepNumber, stepName, projectId, correlationId |
| `ProvisioningSagaSuccessRate` | 0 or 1 | outcome (Completed/Failed/WebPartsPending) |
| `Step5DeferralRate` | 0 or 1 | projectId, correlationId |

## Step 5 diagnostic enrichment

Step 5 (Install Web Parts) now captures enriched metadata on both success and failure:

| Metadata field | Purpose |
|---------------|---------|
| `attemptCount` | Which attempt succeeded or caused deferral (1 or 2) |
| `durationMs` | Actual elapsed time for the attempt |
| `timeoutThresholdMs` | Configured timeout (default 90000ms) |
| `isTimeout` | Whether the failure was a timeout vs. an error (failure only) |

The error message now includes attempt number and site URL for diagnostic context.

## How to use this for troubleshooting

### Operator workflow

1. Open the failed run in the admin Provisioning Oversight page
2. Review `failureClass` to understand the failure category
3. Check the per-step evidence for the failed step's error message and attempt count
4. Review the `permissionPosture` to verify permissions were correct at saga start
5. Use the `correlationId` chain to trace retry history
6. Call `GET /api/provisioning-recovery-guidance/{projectId}` for structured next-step recommendations

### Developer workflow

1. Query Application Insights for the `correlationId`: `customEvents | where customDimensions.correlationId == "abc-123"`
2. Filter by saga lifecycle events: `ProvisioningSagaStarted`, `ProvisioningSagaFailed`
3. Drill into step-level events: `ProvisioningStepFailed` with `attempt` count
4. Check retry chain: `ProvisioningSagaStarted` with `parentCorrelationId`

## Implementation location

- Evidence type: `packages/models/src/provisioning/IProvisioningEvidence.ts`
- Evidence builder: `backend/functions/src/functions/provisioningSaga/build-evidence-payload.ts`
- Saga enrichment: `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- Step 5 enrichment: `backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts`
- Persistence: `backend/functions/src/services/table-storage-service.ts` (`evidenceJson` field)
- Tests: `__tests__/build-evidence-payload.test.ts`
