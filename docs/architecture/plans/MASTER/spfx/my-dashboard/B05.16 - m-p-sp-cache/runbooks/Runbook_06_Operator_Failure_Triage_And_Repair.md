# Runbook 06 | Operator Failure Triage and Repair

## Objective

Provide first-line operator procedures for diagnosing and recovering the redirected SharePoint-backed My Projects projection subsystem.

## 1. Open Failure Review

Inspect:

- `My Projects Projection Sync Failures`
- `My Projects Projection Runs`
- `My Projects Projection Pending Work`
- `My Projects Projection Source Sync State`
- `My Projects Projection Subscription State`

## 2. Common Failure Classes

### A. `delta-token-expired-or-invalid`
Symptoms:
- `NeedsResync=true`;
- incremental lane blocked.

Action:
- execute controlled full rebuild/resync;
- confirm new delta baseline;
- mark failure resolved only after validation.

### B. subscription failure
Symptoms:
- missing/failed subscription state;
- notifications absent.

Action:
- run subscription reconcile/reset admin flow;
- confirm health state and renewal timestamp.

### C. pending-work dead-letter
Symptoms:
- Pending Work `Status=dead-lettered`;
- open failure row.

Action:
- inspect failure code;
- fix underlying config/throttle/source issue;
- use controlled retry or rebuild as prescribed.

### D. provisioning drift
Symptoms:
- verifier fails;
- list/field/index/unique issue.

Action:
- do not proceed to cutover;
- rerun dry-run provisioner;
- remediate only by approved provisioning path.

## 3. Failure Resolution Rules

- Do not manually edit runtime identity fields unless the runbook explicitly allows it.
- Do not clear failures simply to make dashboards green.
- Record operator notes when resolving or ignoring a failure.
- Preserve historical Runs.

## 4. Telemetry Correlation

Use the KQL query pack to align:

- failure row;
- run row;
- correlation ID;
- work key;
- source list kind.

### Required event lanes

- Webhook ingress:
  - `myProjectsProjection.notification.queue.accepted`
  - `myProjectsProjection.notification.queue.failed`
  - `myProjectsProjection.notification.persistence.failed`
- Pending Work processor:
  - `myProjectsProjection.pendingWork.scan.completed`
  - `myProjectsProjection.pendingWork.claim.succeeded`
  - `myProjectsProjection.pendingWork.retry.scheduled`
  - `myProjectsProjection.pendingWork.deadLettered`
- Delta/projection worker:
  - `myProjectsProjection.worker.delta.failure`
  - `myProjectsProjection.worker.delta.resyncRequired`
  - `myProjectsProjection.worker.projection.write.failure`

### Evidence collection checklist

1. Capture the last `workKey` from Pending Work and locate matching Sync Failure row (`RelatedWorkKey`).
2. Capture the last failed `runId` from Runs and match `RelatedRunId` on Sync Failures.
3. Confirm `FailureCode`, `LastSanitizedMessage`, `AttemptCount`, `ResolutionStatus` on failure row.
4. Export matching KQL result rows (timestamp/name/customDimensions) for the same correlation window.
5. If dead-lettered, include `AttemptCount`, `LastFailureCode`, and queue age (`now - AvailableAfterUtc`) in escalation notes.

### Rollback threshold signal

Initiate projection rollback decision (read mode flip) when both conditions hold:

- sustained `myProjectLinks.read.projection.failed` or `source-unavailable` envelopes beyond the defined incident window;
- unresolved Pending Work dead-letter growth despite remediation attempts.

## 5. Escalation

Escalate to development when:

- repeated failure taxonomy does not explain the issue;
- repo truth contradicts runbook;
- a source schema changed unexpectedly;
- a new provider/Graph behavior breaks existing assumptions.

## 6. Recovery Completion

A repair is complete only when:

- the failure condition no longer recurs;
- the relevant state list shows healthy values;
- telemetry confirms successful retry/rebuild;
- the failure row is updated to `resolved` or appropriately `ignored` with notes.
