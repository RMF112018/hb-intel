# Provisioning State Machine Reference

**Traceability:** D-PH6-16

## Project Setup Request States

| State | Description | Who can enter it |
|---|---|---|
| `Submitted` | Estimating Coordinator has submitted the request | System (on form submit) |
| `UnderReview` | Controller has opened the request | Controller |
| `NeedsClarification` | Controller requires more information | Controller |
| `AwaitingExternalSetup` | Controller is completing external system setup | Controller |
| `ReadyToProvision` | External setup complete, projectNumber assigned | Controller |
| `Provisioning` | Saga is actively running | System (on saga trigger) |
| `Completed` | All 7 steps completed successfully | System (on saga completion) |
| `Failed` | Saga failed and compensation ran | System (on saga failure) |

## Valid Transitions

| From | To | Actor |
|---|---|---|
| `Submitted` | `UnderReview` | Controller |
| `UnderReview` | `NeedsClarification` | Controller |
| `UnderReview` | `ReadyToProvision` | Controller (requires valid projectNumber; auto-triggers saga) |
| `UnderReview` | `AwaitingExternalSetup` | Controller |
| `NeedsClarification` | `UnderReview` | Controller |
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller (requires valid projectNumber; auto-triggers saga) |
| `ReadyToProvision` | `Provisioning` | System (saga reconciliation) |
| `Provisioning` | `Completed` | System (saga success) |
| `Provisioning` | `Failed` | System (saga compensation) |
| `Failed` | `UnderReview` | Admin/Controller (reopen for correction) |

## Provisioning Saga Overall Status Values

`NotStarted` | `InProgress` | `BaseComplete` | `WebPartsPending` | `Completed` | `Failed`

## Saga Step Status Values

`NotStarted` | `InProgress` | `Completed` | `Failed` | `Skipped` | `DeferredToTimer`

## Launch Contract (P2-02)

The controller-facing provisioning launch contract is:

1. Controller approves request via `advanceState(requestId, 'ReadyToProvision', { projectNumber })`
2. Backend validates transition, role authorization, and projectNumber format
3. Backend auto-triggers `SagaOrchestrator.execute()` fire-and-forget
4. Saga reconciles request to `Provisioning` via `reconcileRequestState()`

Other provisioning entry points:
- **Direct API** (`POST provision-project-site`): Admin-only operational endpoint; does not validate request state
- **Admin retry** (`POST provisioning-retry/{projectId}`): Re-executes saga from last successful step; does not transition request state
- **Timer** (Step 5 deferred): Cron-triggered overnight retry for deferred web-part installations
