# Provisioning Models Reference

> Site provisioning saga orchestrator — SharePoint site creation workflow.

**Package:** `@hbc/models` | **Module:** `provisioning`
**Consumers:** `backend/functions/` (saga orchestrator, step functions, SignalR push)

## Interfaces

### `ISagaStepResult`

Result of a single provisioning step execution.

| Field | Type | Description |
|-------|------|-------------|
| `stepNumber` | `number` | Step number (1-based) |
| `stepName` | `string` | Human-readable step name |
| `status` | `SagaStepStatus` | Step execution status |
| `startedAt?` | `string` | ISO-8601 start time |
| `completedAt?` | `string` | ISO-8601 completion time |
| `errorMessage?` | `string` | Error message if failed |
| `completedCount?` | `number` | Sub-task completed count |
| `totalCount?` | `number` | Sub-task total count |

### `IProvisioningStatus`

Full provisioning status tracked by the saga orchestrator.

| Field | Type | Description |
|-------|------|-------------|
| `projectCode` | `string` | Project code |
| `projectName` | `string` | Project name |
| `siteUrl?` | `string` | SharePoint site URL |
| `currentStep` | `number` | Current step number |
| `totalSteps` | `number` | Total saga steps |
| `stepResults` | `ISagaStepResult[]` | Per-step results |
| `overallStatus` | `ProvisioningOverallStatus` | Saga status |
| `lastSuccessfulStep` | `number` | Last successful step |
| `escalated` | `boolean` | Whether escalated |
| `triggeredBy` | `string` | Initiating user |
| `triggeredAt` | `string` | ISO-8601 initiation time |
| `completedAt?` | `string` | ISO-8601 completion time |
| `fullSpecDeferred` | `boolean` | Full-spec deferred? |

### `IProvisionSiteRequest`

Request payload to initiate provisioning.

### `IProvisioningProgressEvent`

Real-time progress event pushed via SignalR.

### `IProvisioningEscalation`

Payload for escalating a provisioning failure.

### `IProvisionSiteFormData`

Form input for initiating provisioning.

## Type Unions

### `ProvisioningOverallStatus`

`'NotStarted'` | `'InProgress'` | `'Completed'` | `'Failed'` | `'RollingBack'` | `'RolledBack'` | `'Escalated'`

### `SagaStepStatus`

`'Pending'` | `'InProgress'` | `'Completed'` | `'Failed'` | `'Skipped'` | `'RolledBack'`

## Runtime Constants

These are **runtime values** (not type-only) consumed by the Azure Functions saga orchestrator.

| Constant | Type | Value |
|----------|------|-------|
| `SAGA_STEPS` | `readonly string[]` | 7-element array of step names |
| `TOTAL_SAGA_STEPS` | `number` | `7` |

## Type Aliases

| Type | Definition | Description |
|------|-----------|-------------|
| `SagaStepNumber` | `number` | Step number (1-based) |
| `ProjectCode` | `string` | Project code identifier |

## Import Examples

```ts
// Runtime value imports (NOT type-only):
import { SAGA_STEPS, TOTAL_SAGA_STEPS } from '@hbc/models';

// Type-only imports:
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { ProvisioningOverallStatus } from '@hbc/models/provisioning';
```
