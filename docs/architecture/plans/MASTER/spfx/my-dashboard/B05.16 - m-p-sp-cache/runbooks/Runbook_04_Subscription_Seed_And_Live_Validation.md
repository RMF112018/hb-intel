# Runbook 04 | Subscription, Seed, and Live Validation

## Objective

Validate the full runtime path before projection cutover.

## Required Sequence

### 1. Ensure lists are provisioned and verified

Run Runbook 02 first.

### 2. Ensure subscriptions

Use the existing/revised admin route or CLI command as finalized by implementation to:

- create/reconcile Graph subscriptions;
- populate Subscription State rows;
- confirm both sources are healthy.

### 3. Execute initial seed

Use the seed/admin command to:

- generate Registry projection rows;
- record a seed Run in SharePoint `Runs`;
- initialize Source Sync State delta baselines.

### 4. Confirm Source Sync State

Both source rows must show:

- `NeedsResync=false`;
- non-empty delta baseline where applicable;
- successful timestamps recorded.

### 5. Validate webhook token handshake

Perform the controlled validation path defined by implementation/operator process. Confirm the endpoint returns the expected validation behavior.

### 6. Trigger or simulate a valid source-list notification

Confirm:

- valid notification is accepted;
- Pending Work row is created/updated;
- no Service Bus dependency is required.

### 7. Validate timer processing

Wait for or trigger the processor lane according to the implemented admin/test posture. Confirm:

- Pending Work claimed;
- run executed;
- Source Sync State advanced when applicable;
- Registry updated if the source change affects projection output;
- Runs updated;
- no unexpected open Sync Failure.

## Pass Criteria

- both subscription rows healthy;
- seed run succeeded;
- sync state initialized;
- webhook ingress writes Pending Work;
- timer processor drains Pending Work;
- projection path updates are visible in storage and telemetry.

## Failure Response

If delta invalidation or sync failure occurs:

- inspect SharePoint `Sync Failures`;
- inspect Source Sync State;
- do not cut over;
- invoke controlled repair/rebuild flow.
