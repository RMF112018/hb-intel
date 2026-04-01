# Request Lifecycle Reference (D-PH6-08)

## Lifecycle States

`Submitted` -> `UnderReview` -> `NeedsClarification` / `AwaitingExternalSetup` / `ReadyToProvision` -> `Provisioning` -> `Completed` / `Failed`

## Transition Rules

Allowed transitions:
- `Submitted` -> `UnderReview`
- `UnderReview` -> `NeedsClarification`, `AwaitingExternalSetup`, `ReadyToProvision`
- `NeedsClarification` -> `UnderReview`
- `AwaitingExternalSetup` -> `ReadyToProvision`
- `ReadyToProvision` -> `Provisioning`
- `Provisioning` -> `Completed`, `Failed`
- `Failed` -> `UnderReview`
- `Completed` -> terminal

Validation:
- `ReadyToProvision` requires `projectNumber` in `##-###-##` format.
- Any non-listed transition is rejected as `400 Invalid state transition`.

## Notification Targets

- `NeedsClarification`: `submitter`
- `ReadyToProvision`: `controller`
- `Provisioning`: `group`
- `Completed`: `group`
- `Failed`: `controller`, `submitter`

## API Endpoints

- `POST /api/project-setup-requests` -> submit request
- `GET /api/project-setup-requests?state=<State>` -> list requests
- `PATCH /api/project-setup-requests/{requestId}/state` -> advance lifecycle state

## Auto-Trigger Behavior

When `advanceRequestState` transitions a request to `ReadyToProvision`:

1. Backend validates `projectNumber` against `##-###-##` pattern
2. Backend checks for existing provisioning status
3. If no status exists or status is `Failed`: constructs `IProvisionSiteRequest` and fires `SagaOrchestrator.execute()` (fire-and-forget)
4. If non-failed status exists: skips auto-trigger (idempotency guard)

The provisioning saga is not user-triggered. There is no manual "start provisioning" action.

## System Ownership

`ReadyToProvision` and `Provisioning` are system-owned states in the BIC model (`packages/provisioning/src/bic-config.ts`). They resolve to `null` owner and `null` urgency tier. No human ball-in-court assignment exists for these states.

The saga owns all transitions from `ReadyToProvision` onward:
- `ReadyToProvision` → `Provisioning` (saga reconciliation)
- `Provisioning` → `Completed` (saga success)
- `Provisioning` → `Failed` (saga compensation)

## Role Authorization

Transition authorization is role-based via JWT app-role claims (`backend/functions/src/state-machine.ts`):

| Role | Allowed Transitions |
|------|-------------------|
| admin | Any valid transition |
| controller | Submitted→UnderReview, UnderReview→NeedsClarification, UnderReview→AwaitingExternalSetup, UnderReview→ReadyToProvision, AwaitingExternalSetup→ReadyToProvision, Failed→UnderReview |
| submitter | NeedsClarification→UnderReview (resubmit) |
| system | ReadyToProvision, Provisioning (saga-owned) |

Role resolution priority: admin > break-glass admin > controller > submitter > system.

## Known UI Gap

`AwaitingExternalSetup → ReadyToProvision` is a valid controller transition in the backend state machine but is **not currently exposed** in the Accounting detail page UI. This is a documented gap carried forward to later phases.

## Phase 1 Freeze Reference

Lifecycle semantics are frozen in `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`. Later implementation work should not reopen these definitions unless a newly discovered repo-truth contradiction requires it.
