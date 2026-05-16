# Operator Validation Runbook — Adobe Sign Direct Handoff

## Purpose

Use this runbook after the local agent completes implementation and the code is redeployed to the hosted My Dashboard environment.

## Validation actors

Prepare or identify:

1. a user with a pending **signature** action;
2. if available, a user with one pending **non-signature** action such as approval or acknowledgement;
3. a user with a recently completed agreement.

## Hosted checks

### 1. Action Queue signature row
- Load My Dashboard.
- Locate Adobe Sign Action Queue.
- Confirm row displays `Act now`.
- Click `Act now`.
- Confirm the user is taken directly to the specific Adobe action experience.
- Confirm browser behavior is coherent and not a generic Adobe landing page.

### 2. Non-signature action row
- Repeat the same process for one non-signature action if a valid tenant test item exists.
- If Adobe returns no usable action URL:
  - confirm the UI shows a truthful failure state;
  - confirm the app does not imply success;
  - confirm telemetry records the normalized outcome.

### 3. Completed agreement row
- Switch to the completed/recent view.
- Confirm a row with a durable source URL displays `View`.
- Confirm `View` opens the expected Adobe item or safe source destination.

### 4. Scope / reconnect state
- Test with a grant that lacks required scope if feasible.
- Confirm the app does not fail opaquely.
- Confirm reconnect guidance is surfaced.

### 5. Not-ready / no-url behavior
- Use a row that is not yet ready or cannot produce an action URL if available.
- Confirm failure copy is accurate and non-breaking.

### 6. Telemetry safety
Inspect logs/telemetry for:

- resolver attempt/success/failure events;
- normalized reason codes;
- provider status code where useful.

Confirm absence of:

- target URL;
- query string;
- OAuth code;
- token material.

## Evidence to capture

- screenshot of queue row with `Act now`;
- screenshot of completed row with `View`;
- screenshot of failure state when direct action cannot resolve;
- telemetry snippets with sensitive data redacted or confirmed absent;
- redeployment package/version note if relevant.
