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
| `UnderReview` | `AwaitingExternalSetup` | Controller |
| `NeedsClarification` | `UnderReview` | Controller |
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller (requires valid projectNumber) |
| `ReadyToProvision` | `Provisioning` | System |
| `Provisioning` | `Completed` | System |
| `Provisioning` | `Failed` | System |
| `Failed` | `Provisioning` | Admin (via retry) |

## Provisioning Saga Overall Status Values

`NotStarted` | `InProgress` | `BaseComplete` | `WebPartsPending` | `Completed` | `Failed`

## Saga Step Status Values

`NotStarted` | `InProgress` | `Completed` | `Failed` | `Skipped` | `DeferredToTimer`
