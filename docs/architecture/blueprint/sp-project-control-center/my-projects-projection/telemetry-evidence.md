# My Projects Projection — Telemetry Inventory & KQL Pack Reconciliation

> Classification: **Canonical Current-State**.
> Sprint: B05.13 backend, Prompt 10.
> Source of truth for emitted Application Insights `customEvents`:
> `backend/functions/src/services/my-projects-projection/telemetry/event-names.ts`.

## Purpose

Single reference of every `customEvents` name the projection subsystem emits today, with property contracts grouped by emitting subsystem, and a diff between the committed code names, the (now-aligned) KQL pack, and the forward-looking Doc 08 spec.

## Drift guard

`backend/functions/src/services/__tests__/my-projects-projection-telemetry-inventory.test.ts` scans every emitting source file for `trackEvent('<name>')` and `trackMyProjectLinksRuntimeEvent('<name>')` string literals and asserts:

1. every emitted name is in the canonical inventory module;
2. every entry in the canonical inventory is emitted by at least one source file (no orphans);
3. the inventory total is exactly 41 names.

New telemetry must update the inventory in the same commit. The KQL pack and this doc are downstream consumers — they must be updated when the inventory changes.

## Canonical inventory (41 events)

### Notification ingress — `services/my-projects-projection/webhook/projection-webhook-handler.ts`

| Event                                                   | Properties (sanitized)                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `myProjectsProjection.notification.validation.request`  | requestId, correlationId                                              |
| `myProjectsProjection.notification.validation.success`  | correlationId                                                         |
| `myProjectsProjection.notification.payload.received`    | sourceListKind, subscriptionId, notificationCount, correlationId      |
| `myProjectsProjection.notification.clientState.invalid` | reason, correlationId (no token, no claim, no payload)                |
| `myProjectsProjection.notification.queue.accepted`      | sourceListKind, notificationBatchId, debounceBucketUtc, correlationId |
| `myProjectsProjection.notification.queue.failed`        | sourceListKind, failureCode, sanitizedReason, correlationId           |
| `myProjectsProjection.notification.duplicate.bucketed`  | sourceListKind, debounceBucketUtc, correlationId                      |
| `myProjectsProjection.notification.persistence.failed`   | sourceListKind, failureCode, sanitizedReason, correlationId           |

### Pending Work processor — `functions/myProjectsProjectionPendingWorkProcessor/index.ts`

| Event                                                | Properties (sanitized)                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `myProjectsProjection.pendingWork.scan.start`        | scanAtUtc, dueLimit                                                                |
| `myProjectsProjection.pendingWork.scan.completed`    | dueCount, claimSkippedCount, claimedCount, succeededCount, retryScheduledCount, deadLetteredCount |
| `myProjectsProjection.pendingWork.claim.succeeded`   | workKey, sourceListKind, attemptCount, reclaimedExpiredClaim                       |
| `myProjectsProjection.pendingWork.claim.skipped`     | workKey, sourceListKind, reason                                                    |
| `myProjectsProjection.pendingWork.item.succeeded`    | workKey, sourceListKind, runId                                                     |
| `myProjectsProjection.pendingWork.retry.scheduled`   | workKey, sourceListKind, runId, failureCode                                        |
| `myProjectsProjection.pendingWork.deadLettered`      | workKey, sourceListKind, runId, failureCode                                        |
| `myProjectsProjection.pendingWork.persistence.failed`| workKey, sourceListKind, runId, failureCode                                        |

### Queue sync worker — `services/my-projects-projection/delta/projection-sync-worker.ts`

| Event                                                  | Properties                                                                       |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `myProjectsProjection.worker.message.received`         | sourceListKind, correlationId                                                    |
| `myProjectsProjection.worker.message.completed`        | sourceListKind, correlationId, status                                            |
| `myProjectsProjection.worker.lease.acquired`           | sourceListKind, correlationId, expiresAtUtc                                      |
| `myProjectsProjection.worker.lease.skipped`            | sourceListKind, correlationId, reason, currentOwner                              |
| `myProjectsProjection.worker.delta.start`              | sourceListKind, runId, correlationId                                             |
| `myProjectsProjection.worker.delta.page`               | sourceListKind, runId, deltaPageCount                                            |
| `myProjectsProjection.worker.delta.success`            | sourceListKind, runId, changedItemCount, deletedItemCount, deltaPageCount        |
| `myProjectsProjection.worker.delta.failure`            | sourceListKind, runId, failureCode, sanitizedReason                              |
| `myProjectsProjection.worker.delta.resyncRequired`     | sourceListKind, runId, reason (`no-baseline` / `state-flag` / `410`)             |
| `myProjectsProjection.worker.projection.write.success` | sourceListKind, runId, helperRowsInserted/Updated/Reactivated/Deactivated/Purged |
| `myProjectsProjection.worker.projection.write.failure` | sourceListKind, runId, failureCode, sanitizedReason, partialCounts               |

### Subscription manager — `services/my-projects-projection/subscriptions/projection-subscription-manager.ts`

| Event                                                    | Properties                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `myProjectsProjection.subscription.create.start`         | sourceListKind, correlationId                                               |
| `myProjectsProjection.subscription.create.success`       | sourceListKind, subscriptionId, expirationDateTimeUtc, correlationId        |
| `myProjectsProjection.subscription.create.failure`       | sourceListKind, failureCode, sanitizedReason, correlationId                 |
| `myProjectsProjection.subscription.renew.start`          | sourceListKind, subscriptionId, correlationId                               |
| `myProjectsProjection.subscription.renew.success`        | sourceListKind, subscriptionId, expirationDateTimeUtc, correlationId        |
| `myProjectsProjection.subscription.renew.failure`        | sourceListKind, subscriptionId, failureCode, sanitizedReason, correlationId |
| `myProjectsProjection.subscription.health.nearingExpiry` | sourceListKind, subscriptionId, minutesRemaining                            |
| `myProjectsProjection.subscription.health.missing`       | sourceListKind                                                              |

### My Project Links read providers — `hosts/my-work-read-model/read-models/project-links/`

| Event                                        | Provider   | Properties                                                                                                                                                                                                                            |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projects-loader.failed`                     | legacy     | listName, stage, sanitizedMessage                                                                                                                                                                                                     |
| `registry-loader.failed`                     | legacy     | listName, stage, sanitizedMessage                                                                                                                                                                                                     |
| `myProjectLinks.read.sources.result`         | legacy     | projectsDurationMs, registryDurationMs, projectsStatus, registryStatus, projectsRowCount, registryRowCount, projectsBounded, registryBounded, registryCacheState, registryCacheAgeMs, registryServerFilterApplied, registryFilterMode |
| `myProjectLinks.read.reconcile.result`       | legacy     | durationMs, matchedItemCount, sourceStatus, assignedProjectCount, dualLaunchReadyCount, sharePointReadyCount, procoreReadyCount                                                                                                       |
| `myProjectLinks.read.projection.load.result` | projection | durationMs, projectionRowCount, matchedItemCount, sourceStatus, projectionMaxLastProjectedAtUtc, projectionBatchId, assignedProjectCount, dualLaunchReadyCount, sharePointReadyCount, procoreReadyCount                               |
| `myProjectLinks.read.projection.failed`      | projection | stage, sanitizedMessage                                                                                                                                                                                                               |

## Reconciliation: KQL pack ↔ committed code ↔ Doc 08 spec

The KQL pack at
`docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/resources/App_Insights_KQL_Query_Pack.md`
was rewritten in Prompt 10 to reference the committed code names verbatim. The table below records the deltas that existed before the rewrite (now resolved) and the remaining spec-vs-code differences.

### Resolved in Prompt 10 (KQL pack rewritten to match code)

| Old KQL pack name                                            | Committed code name                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `myProjectsProjection.notification.received`                 | `myProjectsProjection.notification.payload.received`                                                               |
| `myProjectsProjection.notification.accepted`                 | `myProjectsProjection.notification.queue.accepted`                                                                 |
| `myProjectsProjection.notification.rejected-client-state`    | `myProjectsProjection.notification.clientState.invalid`                                                            |
| `myProjectsProjection.delta.pull.start/.success/.failure`    | `myProjectsProjection.worker.delta.start/.success/.failure`                                                        |
| `myProjectsProjection.delta.resync-required`                 | `myProjectsProjection.worker.delta.resyncRequired`                                                                 |
| `myProjectsProjection.slice.recompute.success/.failure`      | `myProjectsProjection.worker.projection.write.success/.failure`                                                    |
| `myProjectsProjection.subscription.created`                  | `myProjectsProjection.subscription.create.success`                                                                 |
| `myProjectsProjection.subscription.renewal.success/.failure` | `myProjectsProjection.subscription.renew.success/.failure`                                                         |
| `myProjectsProjection.subscription.nearing-expiry`           | `myProjectsProjection.subscription.health.nearingExpiry`                                                           |
| `myProjectLinks.projection.read.result`                      | split → `myProjectLinks.read.projection.load.result` (success) + `myProjectLinks.read.projection.failed` (failure) |

### Remaining spec-vs-code differences (acknowledged, not regressions)

| Doc 08 § 2.7 spec                        | Committed code                               | Note                                                                                                                                              |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `myProjectLinks.projection.read.start`   | (not emitted)                                | The projection-read provider emits only the result event today. A start event was deemed redundant given the route's existing telemetry envelope. |
| `myProjectLinks.projection.read.success` | `myProjectLinks.read.projection.load.result` | Code shipped first; named after the read mechanism (`load.result`) rather than the verb pair.                                                     |
| `myProjectLinks.projection.read.failure` | `myProjectLinks.read.projection.failed`      | Same rationale.                                                                                                                                   |

These do NOT cause operator confusion in practice because the KQL pack section §6 names both events explicitly and the lint test pins them in the inventory.

### Deferred (not yet emitted; future prompts)

| Doc 08 § | Subsystem                                                                        | Status                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.4      | Seed / rebuild (`myProjectsProjection.seed.*`, `myProjectsProjection.rebuild.*`) | Seed service writes to the `MyProjectsProjectionRuns` table ledger; `customEvents` emission deferred. KQL pack §8 carries a commented-out forward placeholder. |
| 2.5      | Drift audit / repair                                                             | Jobs land in Prompt 13+. KQL pack §9 has a forward placeholder.                                                                                                |
| 2.6      | Inactive-row purge                                                               | Job lands in Prompt 13+. KQL pack §10 has a forward placeholder.                                                                                               |

## Operator usage

1. Open the App Insights query pack at the path above.
2. Pick the section that matches the symptom (notification 4xx, worker stuck, subscription expiring, read-path failures).
3. Adjust `timestamp > ago(...)` and re-run.
4. If a query returns nothing where you expected traffic, confirm:
   - `readMode` setting (legacy vs projection paths emit different events),
   - subsystem deployment status,
   - the `MY_PROJECTS_PROJECTION_EVENT_NAMES` inventory matches what the version of the code in production is emitting (lint test guards new builds; older deployments may be out of date).

## Status

| Date       | HEAD          | Status                                                                                                                           |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-19 | (this commit) | KQL pack aligned with committed code, Pending Work telemetry lane added, webhook failure-ledger persistence event added (41 names). |
