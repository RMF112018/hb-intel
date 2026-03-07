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
